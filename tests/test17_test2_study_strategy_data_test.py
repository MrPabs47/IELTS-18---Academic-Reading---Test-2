import json
import re
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-2"
DATA_PATH = TEST_DIR / "study-feedback.js"
HTML_PATH = TEST_DIR / "IELTS17 Test 2 - Academic Reading.html"

EXPECTED = [
    ("p1-note-completion", "Note completion", "note-completion", 1, list(range(1, 6)), "ONE WORD ONLY", "not-applicable"),
    ("p1-true-false-not-given", "TRUE/FALSE/NOT GIVEN", "true-false-not-given", 1, list(range(6, 14)), "TRUE / FALSE / NOT GIVEN", "not-applicable"),
    ("p2-matching-information", "Matching information to paragraphs", "matching-information", 2, list(range(14, 19)), "A-E", "letters-may-repeat"),
    ("p2-matching-researchers", "Matching researchers", "matching-researchers", 2, list(range(19, 24)), "A-D", "letters-may-repeat"),
    ("p2-sentence-completion", "Sentence completion", "sentence-completion", 2, list(range(24, 27)), "ONE WORD ONLY", "not-applicable"),
    ("p3-multiple-choice", "Multiple choice", "multiple-choice", 3, list(range(27, 32)), "A-D", "not-applicable"),
    ("p3-yes-no-not-given", "YES/NO/NOT GIVEN", "yes-no-not-given", 3, list(range(32, 37)), "YES / NO / NOT GIVEN", "not-applicable"),
    ("p3-summary-word-list", "Summary completion from a word list", "summary-word-list", 3, list(range(37, 41)), "A-G", "no-reuse-rule-stated"),
]


def node_executable():
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    return shutil.which("node") or (str(bundled) if bundled.is_file() else None)


def load_data():
    node = node_executable()
    if not node:
        raise unittest.SkipTest("Node.js is unavailable")
    script = (
        "global.window={};require(" + json.dumps(str(DATA_PATH)) + ");"
        "process.stdout.write(JSON.stringify(window.IELTS17AcademicTest2StudyFeedback));"
    )
    completed = subprocess.run([node, "-e", script], text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
    if completed.returncode:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


class TestIELTS17Test2StudyStrategyData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = load_data()
        cls.html = HTML_PATH.read_text(encoding="utf-8")

    def test_01_exactly_eight_groups_cover_q1_to_q40_once(self):
        groups = self.data["taskGroups"]
        self.assertEqual(len(groups), 8)
        questions = [question for group in groups for question in group["questions"]]
        self.assertEqual(sorted(questions), list(range(1, 41)))
        self.assertEqual(len(questions), len(set(questions)))

    def test_02_exact_identity_types_ranges_limits_and_reuse_rules(self):
        actual = [
            (
                group["id"], group["label"], group["taskType"], group["part"],
                group["questions"], group["answerLimit"], group["reuseRule"],
            )
            for group in self.data["taskGroups"]
        ]
        self.assertEqual(actual, EXPECTED)
        for group in self.data["taskGroups"]:
            self.assertEqual(group["textId"], group["part"])
            self.assertEqual(group["controlHost"], f"#study-instruction-{group['id']}")
            self.assertEqual(self.html.count(f'id="study-instruction-{group["id"]}"'), 1)

    def test_03_every_strategy_is_practical_specific_and_non_leaking(self):
        combined = []
        for group in self.data["taskGroups"]:
            self.assertGreaterEqual(len(group["purpose"].split()), 10)
            self.assertIn("steps", group)
            self.assertGreaterEqual(len(group["steps"]), 3)
            self.assertTrue(all(len(step.split()) >= 7 for step in group["steps"]))
            self.assertGreaterEqual(len(group["trap"].split()), 9)
            text = " ".join([group["purpose"], *group["steps"], group["trap"]])
            self.assertNotRegex(text.lower(), r"\bthe answer is\b|\bcorrect answer\b")
            self.assertNotIn("London", text)
            self.assertNotIn("stadium", text.lower())
            combined.append(text)
        self.assertEqual(len(set(combined)), 8)

    def test_04_task_specific_strategy_requirements(self):
        by_id = {group["id"]: " ".join([group["purpose"], *group["steps"], group["trap"]]).lower() for group in self.data["taskGroups"]}
        note = by_id["p1-note-completion"]
        for term in ("one word only", "grammar", "exact", "spelling"):
            self.assertIn(term, note)
        tfng = by_id["p1-true-false-not-given"]
        for term in ("complete claim", "contradict", "insufficient", "outside knowledge"):
            self.assertIn(term, tfng)
        matching = by_id["p2-matching-information"]
        for term in ("passage order", "reused", "specific detail"):
            self.assertIn(term, matching)
        researchers = by_id["p2-matching-researchers"]
        for term in ("researcher", "reused", "paraphrased"):
            self.assertIn(term, researchers)
        sentence = by_id["p2-sentence-completion"]
        for term in ("one word only", "exact passage", "grammar", "spelling"):
            self.assertIn(term, sentence)
        multiple = by_id["p3-multiple-choice"]
        for term in ("complete stem", "partly true", "eliminat"):
            self.assertIn(term, multiple)
        ynng = by_id["p3-yes-no-not-given"]
        for term in ("writer", "contradict", "absent"):
            self.assertIn(term, ynng)
        summary = by_id["p3-summary-word-list"]
        for term in ("a-g", "grammatical", "whole summary", "reuse"):
            self.assertIn(term, summary)


if __name__ == "__main__":
    unittest.main()
