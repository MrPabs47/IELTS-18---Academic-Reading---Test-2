import json
import re
import shutil
import subprocess
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-2"
HTML_PATH = TEST_DIR / "IELTS17 Test 2 - Academic Reading.html"
DATA_PATH = TEST_DIR / "study-feedback.js"


def balanced_body(source, pattern, label):
    matches = list(re.finditer(pattern, source))
    if len(matches) != 1:
        raise AssertionError(f"Expected one {label}, found {len(matches)}")
    start = matches[0].end() - 1
    depth = 0
    quote = None
    escaped = False
    for index in range(start, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in "'\"`":
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[start + 1:index]
    raise AssertionError(f"Unbalanced {label}")


def function_body(source, name):
    return balanced_body(source, rf"function\s+{name}\s*\([^)]*\)\s*{{", f"function {name}")


class AssetParser(HTMLParser):
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__()
        self.assets = []
        self.mounts = 0
        self.stack = []
        self.parents = {}
        self.id_counts = {}

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        identifier = values.get("id")
        if identifier:
            self.id_counts[identifier] = self.id_counts.get(identifier, 0) + 1
            self.parents[identifier] = tuple(item for item in self.stack if item)
        if tag == "link" and values.get("rel") == "stylesheet":
            self.assets.append(("style", values.get("href")))
        if tag == "script" and values.get("src"):
            self.assets.append(("script", values.get("src")))
        if values.get("id") == "readingFeatureShellMount":
            self.mounts += 1
        if tag not in self.VOID_TAGS:
            self.stack.append(identifier)

    def handle_endtag(self, _tag):
        if self.stack:
            self.stack.pop()


def load_data_module():
    bundled_node = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    node = shutil.which("node") or (str(bundled_node) if bundled_node.is_file() else None)
    if not node:
        raise unittest.SkipTest("Node.js is unavailable")
    script = (
        "global.window={};require(" + json.dumps(str(DATA_PATH)) + ");"
        "process.stdout.write(JSON.stringify(window.IELTS17AcademicTest2StudyFeedback));"
    )
    completed = subprocess.run([node, "-e", script], text=True, capture_output=True, cwd=ROOT)
    if completed.returncode:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


class TestIELTS17Test2ReadingFeatureIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML_PATH.read_text(encoding="utf-8")

    def test_01_assets_mount_and_explicit_version_one_config(self):
        parser = AssetParser()
        parser.feed(self.html)
        expected = [
            ("style", "../../shared/reading-feature-shell.css"),
            ("script", "study-feedback.js"),
            ("script", "../../shared/reading-feature-shell.js"),
        ]
        relevant = [asset for asset in parser.assets if asset[1] in {item[1] for item in expected} or asset[1] == "../../shared/reading-feature-shell-core.js"]
        self.assertEqual(relevant, expected)
        self.assertEqual(parser.mounts, 1)
        self.assertEqual(self.html.count("window.readingFeatureShellConfig = {"), 1)
        config = self.html[self.html.index("window.readingFeatureShellConfig = {"):]
        self.assertRegex(config, r"version:\s*1")
        self.assertIn('id: "cambridge-17-academic-reading-test-2"', config)
        self.assertIn('partLabel: "Passage"', config)
        self.assertIn("partRanges: sectionRanges", config)
        self.assertNotIn("allowDomSubmittedResult", config)
        self.assertNotIn("IELTS16", config)

    def test_02_data_has_score_guide_and_complete_strategy_groups(self):
        self.assertTrue(DATA_PATH.is_file())
        data = load_data_module()
        self.assertEqual(data["testId"], "cambridge-17-academic-reading-test-2")
        self.assertEqual(data["test"]["series"], "Cambridge IELTS 17")
        self.assertEqual(data["test"]["module"], "Academic Reading")
        self.assertEqual(data["test"]["test"], 2)
        self.assertEqual(data["test"]["totalQuestions"], 40)
        self.assertEqual(data["test"]["partRanges"], {
            "1": {"from": 1, "to": 13}, "2": {"from": 14, "to": 26}, "3": {"from": 27, "to": 40},
        })
        self.assertEqual(len(data["scoreGuide"]["rows"]), 16)
        self.assertEqual(len(data["taskGroups"]), 8)
        source = DATA_PATH.read_text(encoding="utf-8")
        for token in ("IELTS17AcademicTest2QuestionDetails", "IELTS17AcademicTest2ClueTargets", "taskGroups"):
            self.assertIn(token, source)

    def test_03_authoritative_snapshot_and_defensive_adapter(self):
        for token in (
            "submissionId: ++submissionSequence", "mode: mode", "rawScore: correctCount",
            "band: band", "partScores", "questionOutcomes", "submittedAnswers",
        ):
            self.assertIn(token, self.html)
        callback = re.search(r"getSubmittedResult:\s*\(\)\s*=>\s*([^\n]+)", self.html)
        self.assertIsNotNone(callback)
        self.assertIn("copySubmittedResult", callback.group(1))
        copier = function_body(self.html, "copySubmittedResult")
        self.assertIn("{ ...result.partScores[1] }", copier)
        self.assertIn("{ ...result.questionOutcomes }", copier)
        self.assertIn("{ ...result.submittedAnswers }", copier)

    def test_04_study_resubmission_and_test_finality_use_page_authority(self):
        evaluator = function_body(self.html, "evaluateQuestions")
        submit = function_body(self.html, "submitTest")
        self.assertIn("latestEvaluationSnapshot", evaluator)
        self.assertIn("questionOutcomes", evaluator)
        self.assertEqual(submit.count("evaluateQuestions()"), 1)
        self.assertIn("latestSubmittedResult = buildSubmittedResult", submit)
        self.assertIn("ReadingFeatureShell.sync()", submit)
        self.assertRegex(submit, r'if\s*\(mode === "test" && testSubmitted\)[\s\S]*?return;')
        start = function_body(self.html, "startTest")
        self.assertIn('mode === "study"', start)
        self.assertIn("latestSubmittedResult = null", start)
        self.assertIn("ReadingFeatureShell.startStudySession()", start)

    def test_05_config_exposes_complete_study_content_and_answer_capabilities(self):
        config = re.search(r"window\.readingFeatureShellConfig\s*=\s*\{[\s\S]*?\n\s*\};", self.html)
        self.assertIsNotNone(config)
        source = config.group(0)
        for token in (
            "getMode: () => mode", "isTestSubmitted: () => testSubmitted",
            "getSubmittedResult:", "getAnswerKeyDisplay:", "getUserAnswer:",
            "isCorrect:", "getQuestionTarget:", "getTextTarget:", "scoreGuide:",
            "taskGroups:", "questionDetails:", "clueTargets:",
            "completeQuestionCoverage: true", "completeClueCoverage: true",
        ):
            self.assertIn(token, source)
        self.assertIn("compatibility: {}", source)

    def test_06_mode_sync_privacy_and_no_duplicate_shell_initialisation(self):
        self.assertEqual(self.html.count("ReadingFeatureShell.init("), 1)
        self.assertIn("ReadingFeatureShell.startStudySession()", self.html)
        self.assertIn("ReadingFeatureShell.sync()", self.html)
        self.assertEqual(self.html.count('id="readingFeatureShellMount"'), 1)
        self.assertIn("isTestSubmitted: () => testSubmitted", self.html)
        self.assertIn("getMode: () => mode", self.html)
        self.assertIn("scoreGuide: test17StudyFeedback && test17StudyFeedback.scoreGuide", self.html)

    def test_07_global_clue_toggle_is_singleton_inside_the_passage_header(self):
        parser = AssetParser()
        parser.feed(self.html)
        self.assertEqual(parser.id_counts.get("passageClueToolbar"), 1)
        self.assertEqual(parser.id_counts.get("passageClueToggle"), 1)
        self.assertEqual(parser.id_counts.get("passageHeaderLine"), 1)
        self.assertEqual(parser.parents["passageClueToolbar"][-1], "passageHeader")
        self.assertEqual(parser.parents["passageClueToggle"][-1], "passageClueToolbar")
        self.assertNotIn("passageContent", parser.parents["passageClueToolbar"])
        self.assertNotIn("passageContent", parser.parents["passageClueToggle"])
        update_counts = function_body(self.html, "updateCounts")
        self.assertIn('document.getElementById("passageHeaderLine")', update_counts)
        self.assertNotIn('document.getElementById("passageHeader")', update_counts)

    def test_08_candidate_header_is_singleton_and_preserves_right_control_order(self):
        parser = AssetParser()
        parser.feed(self.html)
        self.assertEqual(parser.id_counts.get("candidateNameDisplay"), 1)
        self.assertEqual(parser.parents["candidateNameDisplay"][-1], "app")
        top_left = re.search(r'<div class="top-left">([\s\S]*?)</div>\s*<div class="top-right">', self.html)
        self.assertIsNotNone(top_left)
        self.assertLess(top_left.group(1).index('class="test-title"'), top_left.group(1).index('id="candidateNameDisplay"'))
        self.assertIn('id="candidateNameDisplay" class="candidate-name-display" hidden', top_left.group(1))

        top_right = re.search(r'<div class="top-right">([\s\S]*?)</div>\s*</header>', self.html)
        self.assertIsNotNone(top_right)
        controls = top_right.group(1)
        ordered = [
            'id="timerContainer"', 'title="Connection status"', 'title="Notifications (mock)"',
            'id="fullscreenBtn"', 'id="optionsBtn"',
        ]
        positions = [controls.index(token) for token in ordered]
        self.assertEqual(positions, sorted(positions))

        sync = function_body(self.html, "syncCandidateNameDisplay")
        self.assertIn('mode === "test" && Boolean(studentName)', sync)
        self.assertIn("display.textContent = label", sync)
        self.assertIn("display.title = label", sync)
        self.assertIn('display.setAttribute("aria-label", label)', sync)
        self.assertIn('display.textContent = ""', sync)
        self.assertIn("display.hidden = !shouldShow", sync)
        start = function_body(self.html, "startTest")
        self.assertIn("syncCandidateNameDisplay()", start)
        self.assertIn('studentName = ""', function_body(self.html, "wireModeButtons"))


if __name__ == "__main__":
    unittest.main()
