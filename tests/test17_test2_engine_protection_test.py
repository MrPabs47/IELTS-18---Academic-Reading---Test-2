import html
import json
import re
import shutil
import subprocess
import unittest
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-2"
HTML_PATH = TEST_DIR / "IELTS17 Test 2 - Academic Reading.html"
PASSAGE_PATHS = {part: TEST_DIR / f"Passage {part}.txt" for part in range(1, 4)}

EXPECTED_ANSWERS = {
    1: "rock", 2: "cave", 3: "clay", 4: "Essenes", 5: "Hebrew",
    6: "NOT GIVEN", 7: "FALSE", 8: "TRUE", 9: "TRUE", 10: "FALSE",
    11: "FALSE", 12: "TRUE", 13: "NOT GIVEN", 14: "C", 15: "B",
    16: "E", 17: "A", 18: "C", 19: "B", 20: "D", 21: "A",
    22: "C", 23: "A", 24: ["flavour", "flavor"], 25: "size",
    26: "salt", 27: "D", 28: "A", 29: "A", 30: "C", 31: "A",
    32: "NO", 33: "NOT GIVEN", 34: "YES", 35: "NO",
    36: "NOT GIVEN", 37: "F", 38: "D", 39: "E", 40: "B",
}

EXPECTED_GROUPS = [
    (1, 5, "note", "ONE WORD ONLY"),
    (6, 13, "tfng", "TRUE"),
    (14, 18, "matching-paragraphs", "A-E"),
    (19, 23, "matching-researchers", "A-D"),
    (24, 26, "sentence", "ONE WORD ONLY"),
    (27, 31, "multiple-choice", "A, B, C or D"),
    (32, 36, "ynng", "YES"),
    (37, 40, "summary-list", "A-G"),
]


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


def extract_object(source, name):
    body = balanced_body(source, rf"const\s+{name}\s*=\s*{{", name)
    quoted = re.sub(r"(?m)^\s*(\d+)\s*:", r'"\1":', body)
    return {int(key): value for key, value in json.loads("{" + quoted + "}").items()}


def function_body(source, name):
    return balanced_body(
        source,
        rf"function\s+{re.escape(name)}\s*\([^)]*\)\s*{{",
        f"function {name}",
    )


def normalise(value):
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


class InventoryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.controls = defaultdict(list)
        self.primary_submit_buttons = 0

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "button" and values.get("onclick") == "handlePrimarySubmit()":
            self.primary_submit_buttons += 1
        name = values.get("name", "")
        match = re.fullmatch(r"q(\d+)", name)
        if tag in {"input", "select"} and match:
            kind = "select" if tag == "select" else values.get("type", "text")
            self.controls[int(match.group(1))].append(kind)


class PassageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.active = None
        self.parts = defaultdict(list)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "div" and "passage-section" in values.get("class", "").split():
            self.active = int(values["data-section"])
            self.depth = 1
        elif self.active is not None:
            self.depth += 1

    def handle_endtag(self, tag):
        if self.active is not None:
            self.depth -= 1
            if self.depth == 0:
                self.active = None

    def handle_data(self, data):
        if self.active is not None:
            self.parts[self.active].append(data)


class TestIELTS17Test2EngineProtection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = HTML_PATH.read_text(encoding="utf-8")
        cls.answer_key = extract_object(cls.source, "answerKey")
        cls.display_answers = extract_object(cls.source, "correctAnswerText")
        cls.inventory = InventoryParser()
        cls.inventory.feed(cls.source)

    def test_01_identity_answers_controls_feedback_and_unique_ids(self):
        self.assertIn("<title>IELTS 17 Academic Reading Test 2</title>", self.source)
        self.assertEqual(self.answer_key, EXPECTED_ANSWERS)
        self.assertEqual(sorted(self.display_answers), list(range(1, 41)))
        self.assertEqual(sorted(self.inventory.controls), list(range(1, 41)))
        self.assertEqual(len(self.inventory.ids), len(set(self.inventory.ids)))
        self.assertEqual(
            {identifier for identifier in self.inventory.ids if re.fullmatch(r"ca-\d+", identifier)},
            {f"ca-{question}" for question in range(1, 41)},
        )

        expected_types = {}
        expected_types.update({q: ["text"] for q in [1, 2, 3, 4, 5, 24, 25, 26]})
        expected_types.update({q: ["radio"] * 3 for q in list(range(6, 14)) + list(range(32, 37))})
        expected_types.update({q: ["radio"] * 4 for q in range(27, 32)})
        expected_types.update({q: ["select"] for q in list(range(14, 24)) + list(range(37, 41))})
        self.assertEqual(dict(self.inventory.controls), expected_types)
        self.assertEqual(sum(v.count("text") for v in self.inventory.controls.values()), 8)
        self.assertEqual(sum(1 for v in self.inventory.controls.values() if "radio" in v), 18)
        self.assertEqual(sum(v.count("select") for v in self.inventory.controls.values()), 14)

    def test_02_ranges_and_eight_authoritative_task_groups(self):
        ranges = balanced_body(self.source, r"const\s+sectionRanges\s*=\s*{", "sectionRanges")
        self.assertEqual(
            re.findall(r"(\d+)\s*:\s*{\s*from:\s*(\d+),\s*to:\s*(\d+)\s*}", ranges),
            [("1", "1", "13"), ("2", "14", "26"), ("3", "27", "40")],
        )
        for start, end, _kind, required in EXPECTED_GROUPS:
            if start in (1, 14, 27):
                passage_end = {1: 13, 14: 26, 27: 40}[start]
                marker = rf"READING PASSAGE [123]: Questions {start}-{passage_end}"
            else:
                marker = rf"Questions {start}-{end}"
            match = re.search(marker + r"([\s\S]*?)(?=<div class=\"question-block\"|<div class=\"summary-box\")", self.source)
            self.assertIsNotNone(match, f"Missing instruction group Q{start}-{end}")
            self.assertIn(required, normalise(match.group(0)))
        self.assertEqual(len(EXPECTED_GROUPS), 8)
        self.assertEqual(self.source.count("You may use any letter more than once."), 2)

    def test_03_evaluator_normalisation_variant_outcomes_and_band(self):
        evaluator = function_body(self.source, "evaluateQuestions")
        self.assertIn("questionOutcomes", evaluator)
        self.assertIn("latestEvaluationSnapshot", evaluator)
        self.assertIn("user.toLowerCase() === String(k).toLowerCase()", evaluator)
        self.assertIn("user.toLowerCase() === key.toLowerCase()", evaluator)
        self.assertEqual(set(self.answer_key[24]), {"flavour", "flavor"})
        get_answer = function_body(self.source, "getUserAnswer")
        self.assertIn(".value.trim()", get_answer)

        bundled_node = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
        node = shutil.which("node") or (str(bundled_node) if bundled_node.is_file() else None)
        if not node:
            self.skipTest("Node.js is unavailable")
        band_source = "function computeBandScore(correct) {" + function_body(self.source, "computeBandScore") + "}"
        script = band_source + "\nconsole.log(JSON.stringify(Array.from({length:41},(_,i)=>computeBandScore(i))));"
        completed = subprocess.run([node, "-e", script], text=True, capture_output=True, cwd=ROOT)
        self.assertEqual(completed.returncode, 0, completed.stderr)
        actual = json.loads(completed.stdout)
        expected = []
        for raw in range(41):
            expected.append(9 if raw >= 39 else 8.5 if raw >= 37 else 8 if raw >= 35 else
                            7.5 if raw >= 33 else 7 if raw >= 30 else 6.5 if raw >= 27 else
                            6 if raw >= 23 else 5.5 if raw >= 19 else 5 if raw >= 15 else
                            4.5 if raw >= 13 else 4 if raw >= 10 else 3.5 if raw >= 8 else
                            3 if raw >= 6 else 2.5 if raw >= 4 else 0 if raw == 0 else 1)
        self.assertEqual(actual, expected)

    def test_04_submission_snapshot_and_completed_test_are_immutable(self):
        submit = function_body(self.source, "submitTest")
        self.assertRegex(submit, r'if\s*\(mode === "test" && testSubmitted\)\s*{[\s\S]*?openExistingResults\(\);[\s\S]*?return;')
        self.assertLess(submit.index("openExistingResults()"), submit.index("evaluateQuestions()"))
        self.assertEqual(submit.count("evaluateQuestions()"), 1)
        for token in (
            "submissionId: ++submissionSequence", "mode: mode", "rawScore: correctCount",
            "band: band", "partScores", "questionOutcomes", "submittedAnswers",
            "candidateName", "elapsedSeconds", "integrity",
        ):
            self.assertIn(token, self.source)
        self.assertIn("copySubmittedResult", self.source)
        self.assertIn("latestSubmittedResult", submit)

    def test_05_timer_submission_locking_and_leave_protection(self):
        timer = function_body(self.source, "startTimer")
        self.assertIn("if (timerId)", timer)
        self.assertIn("timerSeconds <= 0", timer)
        self.assertIn("timerSeconds = 0", timer)
        self.assertIn("finalizeTimedTestOnce()", timer)
        self.assertNotIn("timerSeconds--", timer)

        finalizer = function_body(self.source, "finalizeTimedTestOnce")
        self.assertIn("if (testSubmitted || timedFinalizationStarted) return", finalizer)
        self.assertEqual(finalizer.count("submitTest()"), 1)

        submit = function_body(self.source, "submitTest")
        self.assertIn("clearInterval(timerId)", submit)
        self.assertIn("el.disabled = true", submit)
        self.assertIn("button.disabled = true", submit)
        self.assertEqual(self.inventory.primary_submit_buttons, 2)

        start = function_body(self.source, "startTest")
        self.assertIn("leaveProtectionActive = mode === \"test\"", start)
        self.assertIn("ensureBeforeUnloadProtection()", start)
        self.assertEqual(self.source.count('addEventListener("beforeunload"'), 1)
        self.assertNotIn("leaveProtectionActive = false", submit)

    def test_06_fullscreen_and_focus_episodes_do_not_duplicate_state(self):
        self.assertRegex(self.source, r"let\s+focusLossEpisodeActive\s*=\s*false")
        recorder = function_body(self.source, "recordFocusLossEpisode")
        self.assertIn("if (focusLossEpisodeActive) return", recorder)
        self.assertIn("focusLossEpisodeActive = true", recorder)
        self.assertIn("focusViolations += 1", recorder)
        self.assertIn("recordFocusLossEpisode()", self.source)
        self.assertIn("focusLossEpisodeActive = false", function_body(self.source, "clearFocusLossEpisode"))
        self.assertIn("if (timerId)", function_body(self.source, "resumeTimer"))

    def test_07_local_passages_equal_production_after_whitespace_normalisation(self):
        parser = PassageParser()
        parser.feed(self.source)
        for part, path in PASSAGE_PATHS.items():
            self.assertEqual(
                normalise(" ".join(parser.parts[part])),
                normalise(path.read_text(encoding="utf-8-sig")),
                f"Passage {part} no longer matches its authoritative local source",
            )


if __name__ == "__main__":
    unittest.main()
