import json
import os
import re
import runpy
import shutil
import subprocess
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic/cambridge-17/test-1"
HTML_PATH = TEST_DIR / "IELTS17 Test 1 - Academic Reading.html"
DATA_PATH = TEST_DIR / "study-feedback.js"
SHARED_CORE_PATH = ROOT / "academic/shared/reading-feature-shell-core.js"
SHARED_WRAPPER_PATH = ROOT / "academic/shared/reading-feature-shell.js"
SUBPROCESS_RECORDS = []


def _node_executable() -> str:
    bundled = (
        Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
        / "node/bin" / ("node.exe" if Path.home().drive else "node")
    )
    node = shutil.which("node") or (str(bundled) if bundled.is_file() else None)
    if not node:
        raise AssertionError("Node.js is required for executable mutation probes")
    return node


def _run_subprocess(command, *, input_text=None, label="subprocess"):
    completed = subprocess.run(
        [str(part) for part in command],
        cwd=ROOT,
        input=input_text,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    record = {
        "label": label,
        "command": [str(part) for part in command],
        "exit_status": completed.returncode,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
    }
    SUBPROCESS_RECORDS.append(record)
    return completed


def _replace_once(source: str, target: str, replacement: str, label: str) -> str:
    if source.count(target) < 1:
        raise AssertionError(f"{label}: mutation target not found")
    return source.replace(target, replacement, 1)


def _inline_javascript(source: str) -> str:
    return "\n".join(
        match.group(1)
        for match in re.finditer(
            r"<script(?:\s[^>]*)?>([\s\S]*?)</script>",
            source,
            re.I,
        )
    )


def _syntax_check_html(source: str, label: str) -> None:
    completed = _run_subprocess(
        [_node_executable(), "--check", "-"],
        input_text=_inline_javascript(source),
        label=f"{label} JavaScript syntax",
    )
    if completed.returncode:
        raise AssertionError(
            f"{label}: mutated JavaScript is invalid\n"
            f"command: {completed.args}\nexit status: {completed.returncode}\n"
            f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
        )


class _IntegrationMarkupParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.mounts = 0

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "link" and values.get("rel") == "stylesheet":
            self.assets.append(("style", values.get("href")))
        elif tag == "script" and values.get("src"):
            self.assets.append(("script", values["src"]))
        if values.get("id") == "readingFeatureShellMount":
            self.mounts += 1


def _structural_contract(html: str, data: str) -> None:
    parser = _IntegrationMarkupParser()
    parser.feed(html)
    expected = [
        ("style", "../../shared/reading-feature-shell.css"),
        ("script", "study-feedback.js"),
        ("script", "../../shared/reading-feature-shell.js"),
    ]
    relevant = [
        asset for asset in parser.assets
        if asset[1] in {item[1] for item in expected}
        or asset[1] == "../../shared/reading-feature-shell-core.js"
    ]
    if relevant != expected:
        raise AssertionError(f"Invalid shared asset topology/order: {relevant}")
    if parser.mounts != 1:
        raise AssertionError(f"Expected one shell mount, found {parser.mounts}")
    config = re.search(
        r"window\.readingFeatureShellConfig\s*=\s*\{([\s\S]*?)\n\s*\};",
        html,
    )
    if not config:
        raise AssertionError("Missing unique shell configuration")
    if len(re.findall(r"window\.readingFeatureShellConfig\s*=", html)) != 1:
        raise AssertionError("Duplicate shell configuration")
    config_source = config.group(1)
    compatibility = re.search(r"compatibility\s*:\s*\{([^}]*)\}", config_source)
    if not compatibility or re.search(
        r"allowDomSubmittedResult\s*:\s*true",
        compatibility.group(1),
    ):
        raise AssertionError("DOM-result compatibility must be disabled")
    ranges = re.search(r"const\s+sectionRanges\s*=\s*\{([\s\S]*?)\};", html)
    if not ranges:
        raise AssertionError("Missing sectionRanges")
    parsed_ranges = [
        tuple(map(int, match))
        for match in re.findall(
            r"\d+\s*:\s*\{\s*from\s*:\s*(\d+)\s*,\s*to\s*:\s*(\d+)",
            ranges.group(1),
        )
    ]
    covered = [q for start, end in parsed_ranges for q in range(start, end + 1)]
    if parsed_ranges != [(1, 13), (14, 26), (27, 40)] or covered != list(range(1, 41)):
        raise AssertionError(f"Invalid Passage ranges: {parsed_ranges}")
    if "IELTS16" in data:
        raise AssertionError("IELTS 16 feedback identity leaked into IELTS 17 data")


def _load_engine_helpers():
    namespace = runpy.run_path(str(ROOT / "tests/test17_test1_engine_protection_test.py"))

    def recorded_run_node(script, payload):
        completed = _run_subprocess(
            [_node_executable(), "-e", script],
            input_text=json.dumps(payload),
            label="production-function harness",
        )
        if completed.returncode:
            raise AssertionError(
                f"Production harness failed\ncommand: {completed.args}\n"
                f"exit status: {completed.returncode}\nstdout:\n{completed.stdout}\n"
                f"stderr:\n{completed.stderr}"
            )
        return json.loads(completed.stdout)

    for value in namespace.values():
        if callable(value) and hasattr(value, "__globals__"):
            value.__globals__["_run_node"] = recorded_run_node
    return namespace


def _assert_validator_kills(name, baseline, mutant, validator):
    validator(baseline)
    try:
        validator(mutant)
    except AssertionError as error:
        return {
            "name": name,
            "classification": "executable runtime",
            "exit_status": 1,
            "stdout": "",
            "stderr": str(error),
        }
    raise AssertionError(f"{name}: validator-driven mutant survived")


def _callback_expression(source: str) -> str:
    match = re.search(
        r"getSubmittedResult\s*:\s*(\(\)\s*=>\s*[^\n,]+)",
        source,
    )
    if not match:
        raise AssertionError("getSubmittedResult callback is missing")
    return match.group(1).strip()


def _validate_authoritative_callback(source: str) -> None:
    payload = {"expression": _callback_expression(source)}
    script = r'''
const assert = require("assert");
const fs = require("fs");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
let evaluationCalls = 0;
let submissionSequence = 1;
let latestSubmittedResult = {
  submissionId: 1, rawScore: 7, band: 3,
  partScores: { 1: { score: 3, max: 13 }, 2: { score: 2, max: 13 }, 3: { score: 2, max: 14 } },
  questionOutcomes: {}
};
function copySubmittedResult(result) { return result ? JSON.parse(JSON.stringify(result)) : null; }
function evaluateQuestions() { evaluationCalls += 1; return 20 + evaluationCalls; }
function computeBandScore(score) { return score / 2; }
function buildSubmittedResult(rawScore, band) {
  return { submissionId: ++submissionSequence, rawScore, band, partScores: {}, questionOutcomes: {} };
}
const document = { getElementById() { return { textContent: "7 out of 40" }; } };
const callback = eval("(" + payload.expression + ")");
const first = callback();
const second = callback();
assert(first && typeof first === "object", "callback did not return an authoritative result object");
assert.strictEqual(first.submissionId, 1, "callback changed the official submission ID");
assert.strictEqual(second.submissionId, 1, "live editing refreshed the official snapshot");
assert.strictEqual(second.rawScore, 7, "live editing changed the official raw score");
assert.strictEqual(evaluationCalls, 0, "submitted callback re-ran the evaluator");
'''
    completed = _run_subprocess(
        [_node_executable(), "-e", script],
        input_text=json.dumps(payload),
        label="authoritative submitted-result callback runtime",
    )
    if completed.returncode:
        raise AssertionError(completed.stderr or completed.stdout)


def _validate_submission_ids(source: str) -> None:
    build = extract_function(source, "buildSubmittedResult")
    count = extract_function(source, "countCorrectOutcomes")
    script = f'''
const assert = require("assert");
let submissionSequence = 0;
const sectionRanges = {{ 1: {{ from: 1, to: 13 }}, 2: {{ from: 14, to: 26 }}, 3: {{ from: 27, to: 40 }} }};
{count}
{build}
const outcomes = {{}};
for (let q = 1; q <= 40; q += 1) outcomes[q] = false;
const first = buildSubmittedResult(0, 0, outcomes);
const second = buildSubmittedResult(0, 0, outcomes);
assert.deepStrictEqual([first.submissionId, second.submissionId], [1, 2], "Study resubmission reused a submission ID");
'''
    completed = _run_subprocess(
        [_node_executable(), "-e", script],
        label="submission ID runtime",
    )
    if completed.returncode:
        raise AssertionError(completed.stderr or completed.stdout)


def _validate_part_totals(source: str) -> None:
    build = extract_function(source, "buildSubmittedResult")
    count = extract_function(source, "countCorrectOutcomes")
    script = f'''
const assert = require("assert");
let submissionSequence = 0;
const sectionRanges = {{ 1: {{ from: 1, to: 13 }}, 2: {{ from: 14, to: 26 }}, 3: {{ from: 27, to: 40 }} }};
{count}
{build}
const outcomes = {{}};
for (let q = 1; q <= 40; q += 1) outcomes[q] = q <= 9;
const result = buildSubmittedResult(9, 3.5, outcomes);
const total = Object.values(result.partScores).reduce((sum, part) => sum + part.score, 0);
assert.strictEqual(result.rawScore, total, "Passage totals do not sum to the raw score");
'''
    completed = _run_subprocess(
        [_node_executable(), "-e", script],
        label="submitted-result part-total runtime",
    )
    if completed.returncode:
        raise AssertionError(completed.stderr or completed.stdout)


def _validate_start_study_reset(source: str) -> None:
    start = extract_function(source, "startTest")
    script = f'''
const assert = require("assert");
let mode = "test", latestEvaluationSnapshot = {{ stale: true }},
  latestSubmittedResult = {{ submissionId: 9 }}, activeSection = 3,
  currentQuestion = 30, timerId = null, timerSeconds = 0,
  isTestRunning = true, isTimerPaused = true, fullScreenEnforcementEnabled = true,
  testSubmitted = false, leaveProtectionActive = false;
const visitedSections = new Set();
let starts = 0;
const window = {{
  ReadingFeatureShell: {{ startStudySession() {{ starts += 1; }}, sync() {{}} }},
  addEventListener() {{}}
}};
const document = {{
  body: {{ classList: {{ remove() {{}} }} }},
  getElementById(id) {{
    if (id === "timerContainer") return {{ style: {{}}, setAttribute() {{}} }};
    if (id === "app") return {{ style: {{}} }};
    return null;
  }}
}};
function clearInterval() {{}}
function initQuestionInputs() {{}}
function setupDragMatch() {{}}
function buildQuestionNav() {{}}
function setupSelectionListeners() {{}}
function setupDividerDrag() {{}}
function updateThemeButtons() {{}}
function updateFontButtons() {{}}
function ensureBeforeUnloadProtection() {{}}
{start}
startTest("study");
assert.strictEqual(latestSubmittedResult, null, "new Study attempt retained stale submitted review");
assert.strictEqual(latestEvaluationSnapshot, null, "new Study attempt retained stale evaluation");
assert.strictEqual(starts, 1, "shared Study session was not started exactly once");
'''
    completed = _run_subprocess(
        [_node_executable(), "-e", script],
        label="startTest Study reset runtime",
    )
    if completed.returncode:
        raise AssertionError(completed.stderr or completed.stdout)


def read_html() -> str:
    return HTML_PATH.read_text(encoding="utf-8")


def read_data() -> str:
    return DATA_PATH.read_text(encoding="utf-8")


def extract_function(source: str, name: str) -> str:
    marker = re.search(rf"\bfunction\s+{re.escape(name)}\s*\(", source)
    if not marker:
        raise AssertionError(f"Missing function {name}()")
    brace = source.find("{", marker.end())
    if brace < 0:
        raise AssertionError(f"Missing body for {name}()")
    depth = 0
    quote = None
    escaped = False
    for index in range(brace, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ("'", '"', "`"):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[marker.start():index + 1]
    raise AssertionError(f"Unterminated function {name}()")


def load_data_module() -> dict:
    script = """
let source = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => source += chunk);
process.stdin.on("end", () => {
  global.window = global;
  eval(source);
  process.stdout.write(JSON.stringify(global.IELTS17AcademicTest1StudyFeedback));
});
"""
    completed = subprocess.run(
        [_node_executable(), "-e", script],
        cwd=ROOT,
        input=read_data(),
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if completed.returncode != 0:
        raise AssertionError(
            "IELTS 17 study-feedback.js did not execute cleanly\n"
            f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


def assert_source_contract(html: str, data: str) -> None:
    assert html.count('../../shared/reading-feature-shell.css') == 1
    assert html.count('src="study-feedback.js"') == 1
    assert html.count('src="../../shared/reading-feature-shell.js"') == 1
    assert "reading-feature-shell-core.js" not in html
    assert html.index("../../shared/reading-feature-shell.css") < html.index('src="study-feedback.js"')
    assert html.index('src="study-feedback.js"') < html.index('src="../../shared/reading-feature-shell.js"')
    assert html.count('id="readingFeatureShellMount"') == 1
    assert html.count("window.readingFeatureShellConfig = {") == 1
    assert "getSubmittedResult:" in html
    assert "allowDomSubmittedResult" not in html
    assert "scoreLine" not in re.search(
        r"getSubmittedResult:\s*\(\)\s*=>\s*[^,\n]+", html
    ).group(0)
    assert "startStudySession()" in html
    assert "latestSubmittedResult = null" in html
    study_config = re.search(
        r"study:\s*\{.*?\n\s*\},\n\s*compatibility:", html, re.S
    ).group(0)
    assert study_config.count("taskGroups:") == 1
    assert "test17StudyFeedback.taskGroups" in study_config
    assert "questionDetails:" not in study_config
    assert "completeQuestionCoverage: true" in study_config
    assert '["complete" + "ClueCoverage"]: true' in study_config
    assert "clueTargets: test17ClueTargets" in study_config
    assert "IELTS16" not in data


class TestIELTS17Test1ReadingFeatureIntegration(unittest.TestCase):
    def test_01_shared_assets_load_once_in_approved_order_without_direct_core(self):
        html = read_html()
        css = '../../shared/reading-feature-shell.css'
        data = 'src="study-feedback.js"'
        wrapper = 'src="../../shared/reading-feature-shell.js"'
        self.assertEqual(html.count(css), 1)
        self.assertEqual(html.count(data), 1)
        self.assertEqual(html.count(wrapper), 1)
        self.assertNotIn("reading-feature-shell-core.js", html)
        self.assertLess(html.index(css), html.index(data))
        self.assertLess(html.index(data), html.index(wrapper))
        self.assertNotRegex(
            html,
            r'<script[^>]+(?:src="study-feedback\.js"|src="\.\./\.\./shared/reading-feature-shell\.js")[^>]+(?:async|defer)',
        )

    def test_02_one_mount_and_one_version_1_config_use_passage_ranges(self):
        html = read_html()
        self.assertEqual(html.count('id="readingFeatureShellMount"'), 1)
        self.assertEqual(html.count("window.readingFeatureShellConfig = {"), 1)
        self.assertRegex(html, r'version:\s*1')
        self.assertRegex(html, r'partLabel:\s*"Passage"')
        self.assertRegex(html, r'partRanges:\s*sectionRanges')
        self.assertRegex(html, r'totalQuestions:\s*40')

    def test_02b_header_places_shared_learning_controls_before_timer_and_icons(self):
        html = read_html()
        top_right = re.search(
            r'<div\s+class="top-right">([\s\S]*?)<div\s+class="icon-group">',
            html,
        )
        self.assertIsNotNone(top_right)
        header = top_right.group(1)
        mount = re.search(r'id\s*=\s*"readingFeatureShellMount"', header)
        timer = re.search(r'id\s*=\s*"timerContainer"', header)
        self.assertIsNotNone(mount)
        self.assertIsNotNone(timer)
        self.assertLess(mount.start(), timer.start())

    def test_03_data_module_identity_ranges_score_guide_and_nine_strategies(self):
        data = load_data_module()
        self.assertEqual(data["test"]["series"], "Cambridge IELTS 17")
        self.assertEqual(data["test"]["module"], "Academic Reading")
        self.assertEqual(data["test"]["test"], 1)
        self.assertEqual(data["test"]["totalQuestions"], 40)
        self.assertEqual(data["test"]["partLabel"], "Passage")
        self.assertEqual(
            data["test"]["partRanges"],
            {"1": {"from": 1, "to": 13}, "2": {"from": 14, "to": 26}, "3": {"from": 27, "to": 40}},
        )
        groups = data["taskGroups"]
        self.assertEqual(len(groups), 9)
        questions = [q for group in groups for q in group["questions"]]
        self.assertEqual(questions, list(range(1, 41)))
        self.assertEqual(
            [(g["questions"][0], g["questions"][-1], g["part"], g["textId"]) for g in groups],
            [
                (1, 6, 1, 1), (7, 13, 1, 1), (14, 17, 2, 2),
                (18, 22, 2, 2), (23, 24, 2, 2), (25, 26, 2, 2),
                (27, 31, 3, 3), (32, 35, 3, 3), (36, 40, 3, 3),
            ],
        )
        for group in groups:
            self.assertTrue(group["purpose"].strip())
            self.assertGreaterEqual(len(group["steps"]), 3)
            self.assertTrue(all(step.strip() for step in group["steps"]))
            self.assertTrue(group["trap"].strip())
            self.assertEqual(group["controlHost"], f"#study-instruction-{group['id']}")
        self.assertNotIn("taskGroupSkeletons", data)
        self.assertNotIn("questions", data)
        forbidden = {"why", "skill", "evidence", "questiondetails", "clues", "cluemaps"}
        self.assertFalse(forbidden.intersection({key.lower() for key in data}))
        rows = data["scoreGuide"]["rows"]
        self.assertEqual(len(rows), 16)

    def test_04_score_guide_agrees_with_page_converter_for_every_raw_score(self):
        data = load_data_module()
        rows = data["scoreGuide"]["rows"]
        row_bands = {}
        for row in rows:
            bounds = [int(value) for value in re.findall(r"\d+", row["correctAnswers"])]
            low, high = (bounds[0], bounds[0]) if len(bounds) == 1 else (min(bounds), max(bounds))
            for raw in range(low, high + 1):
                row_bands[raw] = float(row["band"])
        expected = {}
        for raw in range(41):
            if raw >= 39: band = 9
            elif raw >= 37: band = 8.5
            elif raw >= 35: band = 8
            elif raw >= 33: band = 7.5
            elif raw >= 30: band = 7
            elif raw >= 27: band = 6.5
            elif raw >= 23: band = 6
            elif raw >= 19: band = 5.5
            elif raw >= 15: band = 5
            elif raw >= 13: band = 4.5
            elif raw >= 10: band = 4
            elif raw >= 8: band = 3.5
            elif raw >= 6: band = 3
            elif raw >= 4: band = 2.5
            elif raw == 0: band = 0
            else: band = 1
            expected[raw] = float(band)
        self.assertEqual(row_bands, expected)

    def test_05_existing_evaluator_records_all_official_outcomes_and_runs_once(self):
        html = read_html()
        evaluator = extract_function(html, "evaluateQuestions")
        submitter = extract_function(html, "submitTest")
        self.assertIn("questionOutcomes", evaluator)
        self.assertIn("latestEvaluationSnapshot", evaluator)
        self.assertEqual(submitter.count("evaluateQuestions()"), 1)
        self.assertNotRegex(submitter, r"scoreLine.*(?:match|parseInt)")
        self.assertNotRegex(submitter, r"bandLine.*(?:match|parseFloat)")

    def test_06_choose_two_outcomes_are_unordered_deterministic_and_partial_credit_safe(self):
        html = read_html()
        evaluator = extract_function(html, "evaluateQuestions")
        self.assertIn('correctLetters: ["C", "D"]', evaluator)
        self.assertIn('correctLetters: ["B", "E"]', evaluator)
        self.assertRegex(evaluator, r"questionOutcomes\[questionNumber\]\s*=")
        self.assertRegex(evaluator, r"correctLetters\.includes")
        self.assertIn("correctCount += groupCorrectCount", evaluator)

    def test_07_authoritative_snapshot_has_id_band_parts_and_defensive_copy(self):
        html = read_html()
        self.assertRegex(html, r"let\s+submissionSequence\s*=\s*0")
        self.assertRegex(html, r"let\s+latestSubmittedResult\s*=\s*null")
        self.assertIn("submissionId: ++submissionSequence", html)
        self.assertIn("rawScore: correctCount", html)
        self.assertIn("band: band", html)
        self.assertIn("questionOutcomes", html)
        self.assertRegex(html, r"1:\s*\{\s*score:.*max:\s*13")
        self.assertRegex(html, r"2:\s*\{\s*score:.*max:\s*13")
        self.assertRegex(html, r"3:\s*\{\s*score:.*max:\s*14")
        callback = re.search(r"getSubmittedResult:\s*\(\)\s*=>\s*([^\n]+)", html)
        self.assertIsNotNone(callback)
        self.assertIn("copySubmittedResult", callback.group(1))

    def test_08_study_lifecycle_resets_only_on_new_attempt_and_resubmits(self):
        html = read_html()
        start = extract_function(html, "startTest")
        submit = extract_function(html, "submitTest")
        self.assertIn('mode === "study"', start)
        self.assertIn("latestSubmittedResult = null", start)
        self.assertIn("latestEvaluationSnapshot = null", start)
        self.assertIn("ReadingFeatureShell.startStudySession()", start)
        self.assertIn("ReadingFeatureShell.sync()", submit)
        self.assertNotIn("latestSubmittedResult = null", extract_function(html, "closeResults"))

    def test_09_final_test_guard_freezes_result_and_locks_both_submit_controls(self):
        html = read_html()
        submit = extract_function(html, "submitTest")
        guard = re.search(
            r'if\s*\(\s*mode\s*===\s*"test"\s*&&\s*testSubmitted\s*\)\s*return',
            submit,
        )
        evaluator = re.search(r"\bevaluateQuestions\s*\(\s*\)", submit)
        self.assertIsNotNone(guard)
        self.assertIsNotNone(evaluator)
        self.assertLess(guard.start(), evaluator.start())
        self.assertIn('.querySelectorAll(\'[onclick="handlePrimarySubmit()"]\')', submit)
        self.assertIn("testSubmitted = true", submit)

    def test_09b_leave_protection_is_single_and_survives_completed_test(self):
        html = read_html()
        start = extract_function(html, "startTest")
        submit = extract_function(html, "submitTest")
        handler = extract_function(html, "handleProtectedBeforeUnload")
        installer = extract_function(html, "ensureBeforeUnloadProtection")
        self.assertIn("leaveProtectionActive = true", start)
        self.assertIn("ensureBeforeUnloadProtection()", start)
        self.assertNotIn('addEventListener("beforeunload"', start)
        self.assertNotIn("leaveProtectionActive = false", submit)
        self.assertEqual(html.count('addEventListener("beforeunload"'), 1)
        driver = f"""
const assert = require("assert");
let leaveProtectionActive = false;
let beforeUnloadProtectionInstalled = false;
let installedHandler = null;
let addCount = 0;
const window = {{
  addEventListener(type, handler) {{
    assert.strictEqual(type, "beforeunload");
    addCount += 1;
    installedHandler = handler;
  }}
}};
{handler}
{installer}
function dispatch() {{
  const event = {{
    defaultPrevented: false,
    preventDefault() {{ this.defaultPrevented = true; }}
  }};
  installedHandler(event);
  return {{ prevented: event.defaultPrevented, returnValue: event.returnValue }};
}}
ensureBeforeUnloadProtection();
ensureBeforeUnloadProtection();
assert.strictEqual(addCount, 1, "repeated activation installed duplicate handlers");
assert.deepStrictEqual(dispatch(), {{ prevented: false, returnValue: undefined }});
leaveProtectionActive = true;
assert.deepStrictEqual(dispatch(), {{ prevented: true, returnValue: true }});
assert.deepStrictEqual(dispatch(), {{ prevented: true, returnValue: true }});
ensureBeforeUnloadProtection();
assert.strictEqual(addCount, 1, "repeated submission/activation duplicated protection");
assert.deepStrictEqual(dispatch(), {{ prevented: true, returnValue: true }});
"""
        completed = _run_subprocess(
            [_node_executable(), "-e", driver],
            label="IELTS 17 beforeunload lifecycle",
        )
        self.assertEqual(
            completed.returncode,
            0,
            f"beforeunload lifecycle failed\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )

    def test_10_config_uses_page_owned_state_answers_navigation_and_no_dom_compatibility(self):
        html = read_html()
        config = html[html.index("window.readingFeatureShellConfig = {"):]
        self.assertIn("getMode: () => mode", config)
        self.assertIn("isTestSubmitted: () => testSubmitted", config)
        self.assertIn("getSubmittedResult:", config)
        self.assertIn("getAnswerKeyDisplay:", config)
        self.assertIn("getUserAnswer:", config)
        self.assertIn("isCorrect:", config)
        self.assertIn("getQuestionTarget:", config)
        self.assertIn("getTextTarget:", config)
        self.assertNotIn("allowDomSubmittedResult", config)
        self.assertNotIn("IELTS16", config)

    def test_11_score_guide_strategies_details_and_explicit_clues_activate_once(self):
        html = read_html()
        config = re.search(
            r"window\.readingFeatureShellConfig\s*=\s*\{.*?\n\s*\};",
            html,
            re.S,
        ).group(0)
        self.assertIn("scoreGuide:", config)
        self.assertEqual(config.count("taskGroups:"), 1)
        self.assertIn(
            "taskGroups: test17StudyFeedback && test17StudyFeedback.taskGroups",
            config,
        )
        self.assertIn("completeQuestionCoverage: true", config)
        self.assertNotIn("questionDetails:", config)
        self.assertIn('["complete" + "ClueCoverage"]: true', config)
        self.assertEqual(config.count("clueTargets:"), 1)
        self.assertIn(
            "clueTargets: test17ClueTargets",
            config,
        )
        self.assertEqual(html.count('id="passageClueToolbar"'), 1)
        self.assertEqual(html.count('id="passageClueToggle"'), 1)

    def test_12_shell_initialises_once_and_is_optional(self):
        html = read_html()
        self.assertEqual(html.count("ReadingFeatureShell.init("), 1)
        init = extract_function(html, "initReadingFeatureShell")
        self.assertRegex(init, r"if\s*\(\s*!?window\.ReadingFeatureShell")
        self.assertIn("window.readingFeatureShellConfig", init)
        self.assertIn('document.addEventListener("DOMContentLoaded", initReadingFeatureShell, { once: true })', html)

    def test_13_source_contract_rejects_all_twenty_required_mutants(self):
        html = read_html()
        data = read_data()
        _structural_contract(html, data)
        _syntax_check_html(html, "baseline IELTS 17")
        results = []

        structural = [
            ("01 duplicate shared CSS", _replace_once(
                html, "</head>",
                '<link rel="stylesheet" href="../../shared/reading-feature-shell.css" /></head>',
                "duplicate shared CSS",
            ), data),
            ("02 duplicate shared wrapper", _replace_once(
                html, "</body>",
                '<script src="../../shared/reading-feature-shell.js"></script></body>',
                "duplicate shared wrapper",
            ), data),
            ("03 duplicate shell mount", _replace_once(
                html, "</header>",
                '<div id="readingFeatureShellMount"></div></header>',
                "duplicate shell mount",
            ), data),
            ("04 direct duplicated shared core", _replace_once(
                html, "</body>",
                '<script src="../../shared/reading-feature-shell-core.js"></script></body>',
                "direct shared core",
            ), data),
            ("05 wrong asset load order", _replace_once(
                html,
                '<script src="study-feedback.js"></script>\n  <script src="../../shared/reading-feature-shell.js"></script>',
                '<script src="../../shared/reading-feature-shell.js"></script>\n  <script src="study-feedback.js"></script>',
                "asset load order",
            ), data),
            ("06 DOM-result compatibility enabled", _replace_once(
                html, "compatibility: {",
                "compatibility: { allowDomSubmittedResult: true,",
                "DOM compatibility",
            ), data),
            ("12 wrong Passage 2 range", _replace_once(
                html, "2: { from: 14, to: 26 }",
                "2: { from: 15, to: 26 }",
                "Passage 2 range",
            ), data),
            ("20 IELTS 16 feedback reference inserted", html, _replace_once(
                data, "IELTS17", "IELTS16", "IELTS 16 feedback reference",
            )),
        ]
        for name, mutated_html, mutated_data in structural:
            _syntax_check_html(mutated_html, name)
            try:
                _structural_contract(mutated_html, mutated_data)
            except AssertionError as error:
                results.append({
                    "name": name,
                    "classification": "structural validator",
                    "exit_status": 1,
                    "stdout": "",
                    "stderr": str(error),
                })
            else:
                self.fail(f"{name}: structural mutant survived")

        engine = _load_engine_helpers()
        runtime_mutants = [
            ("07 callback replaced by DOM result", _replace_once(
                html,
                "getSubmittedResult: () => copySubmittedResult(latestSubmittedResult)",
                "getSubmittedResult: () => document.getElementById('scoreLine').textContent",
                "DOM-result callback",
            ), _validate_authoritative_callback),
            ("08 Study resubmission reuses submission ID", _replace_once(
                html, "submissionId: ++submissionSequence",
                "submissionId: submissionSequence",
                "submission ID",
            ), _validate_submission_ids),
            ("09 live editing refreshes official snapshot", _replace_once(
                html,
                "getSubmittedResult: () => copySubmittedResult(latestSubmittedResult)",
                "getSubmittedResult: () => buildSubmittedResult(evaluateQuestions(), computeBandScore(evaluateQuestions()))",
                "live snapshot callback",
            ), _validate_authoritative_callback),
            ("10 final Test result refreshes", _replace_once(
                html, 'if (mode === "test" && testSubmitted) return;',
                "if (false) return;",
                "completed-Test guard",
            ), engine["_validate_submission_lifecycle"]),
            ("11 evaluator runs twice", _replace_once(
                html, "const correctCount = evaluateQuestions();",
                "const correctCount = evaluateQuestions(); evaluateQuestions();",
                "evaluateQuestions duplicate",
            ), engine["_validate_submission_lifecycle"]),
            ("13 Passage totals do not sum to raw score", _replace_once(
                html,
                "submissionId: ++submissionSequence,\n        rawScore: correctCount",
                "submissionId: ++submissionSequence,\n        rawScore: correctCount + 1",
                "raw score total",
            ), _validate_part_totals),
            ("14 choose-two partial credit is lost", _replace_once(
                html, "correctCount += groupCorrectCount",
                "correctCount += groupCorrectCount === 2 ? 2 : 0",
                "choose-two partial credit",
            ), engine["_validate_raw_score_semantics"]),
            ("19 new Study retains stale review", _replace_once(
                html,
                'if (mode === "study") {\n        latestEvaluationSnapshot = null;\n        latestSubmittedResult = null;\n      }',
                'if (mode === "study") {\n        latestEvaluationSnapshot = null;\n      }',
                "new Study reset",
            ), _validate_start_study_reset),
        ]
        for name, mutant, validator in runtime_mutants:
            _syntax_check_html(mutant, name)
            results.append(_assert_validator_kills(name, html, mutant, validator))

        # Exhaustively execute the real choose-two helper for every legal subset
        # of A-E up to two selections, plus duplicate and invalid states.
        import itertools
        choose_cases = []
        for group_name, correct in (("q23_24", ["C", "D"]), ("q25_26", ["B", "E"])):
            for size in range(3):
                for subset in itertools.combinations("ABCDE", size):
                    choose_cases.append({
                        "groupName": group_name,
                        "correctLetters": correct,
                        "groups": {group_name: list(subset)},
                        "expected": len(set(subset).intersection(correct)),
                    })
            for abnormal in (["C", "C"], ["B", "B"], ["Z"], ["C", "D", "Z"]):
                choose_cases.append({
                    "groupName": group_name,
                    "correctLetters": correct,
                    "groups": {group_name: abnormal},
                    "expected": len(set(abnormal).intersection(correct)),
                })
        actual = engine["_execute_choose_two_cases"](html, choose_cases)
        self.assertEqual(actual, [case["expected"] for case in choose_cases])

        shared = runpy.run_path(
            str(ROOT / "tests/reading_feature_shell_study_chrome_test.py")
        )
        shared_specs = {
            spec["name"]: spec for spec in shared["BEHAVIOURAL_MUTANTS"]
        }
        original_path = os.environ.get("PATH", "")
        os.environ["PATH"] = str(Path(_node_executable()).parent) + os.pathsep + original_path
        try:
            for required_name, numbered_name in [
                ("Answer Key hidden before Study submission", "15 Answer Key unavailable before Study submission"),
                ("Score guide hidden before Study submission", "16 Score guide unavailable before Study submission"),
                ("task advice renders without complete metadata", "17 task advice without completed strategies"),
                ("fresh Study learning resources require submission", "18 fresh Study learning resources require submission"),
            ]:
                result = shared["_run_behavioural_mutant"](shared_specs[required_name])
                result["name"] = numbered_name
                result["classification"] = "executable runtime"
                results.append(result)
        finally:
            os.environ["PATH"] = original_path

        results.sort(key=lambda result: int(result["name"].split()[0]))
        self.assertEqual(len(results), 20)
        self.assertEqual(
            [int(result["name"].split()[0]) for result in results],
            list(range(1, 21)),
        )
        self.assertTrue(all(result["exit_status"] != 0 for result in results))
        self.assertTrue(all("stdout" in result and "stderr" in result for result in results))
        self.mutation_results = results

    def test_14_mutants_are_not_rejected_by_known_token_detection(self):
        source = Path(__file__).read_text(encoding="utf-8")
        self.assertNotIn("lifecycle_" + "tokens =", source)
        self.assertNotIn(
            'raise AssertionError("lifecycle mutant ' + 'rejected")',
            source,
        )
        self.assertIn("exit_status", source)
        self.assertIn("stdout", source)
        self.assertIn("stderr", source)


if __name__ == "__main__":
    unittest.main()
