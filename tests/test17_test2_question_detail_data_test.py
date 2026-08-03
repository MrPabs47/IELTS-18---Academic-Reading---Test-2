import html
import json
import re
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-2"
DATA_PATH = TEST_DIR / "study-feedback.js"
PASSAGES = {part: (TEST_DIR / f"Passage {part}.txt").read_text(encoding="utf-8-sig") for part in range(1, 4)}
PART_FOR = {question: 1 if question <= 13 else 2 if question <= 26 else 3 for question in range(1, 41)}


def normalise(value):
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def load_payload():
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    node = shutil.which("node") or (str(bundled) if bundled.is_file() else None)
    if not node:
        raise unittest.SkipTest("Node.js is unavailable")
    script = (
        "global.window={};require(" + json.dumps(str(DATA_PATH)) + ");"
        "process.stdout.write(JSON.stringify({details:window.IELTS17AcademicTest2QuestionDetails||null,clues:window.IELTS17AcademicTest2ClueTargets||null}));"
    )
    completed = subprocess.run([node, "-e", script], text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
    if completed.returncode:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


class TestIELTS17Test2QuestionDetailData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = load_payload()
        cls.details = cls.payload["details"]

    def test_01_exact_identity_and_q1_to_q40_coverage(self):
        self.assertEqual(self.details["testId"], "cambridge-17-academic-reading-test-2")
        questions = self.details["questions"]
        self.assertEqual({int(key) for key in questions}, set(range(1, 41)))
        self.assertEqual(len(questions), 40)

    def test_02_why_skill_evidence_are_complete_and_passage_grounded(self):
        for question in range(1, 41):
            detail = self.details["questions"][str(question)]
            self.assertEqual(len(detail), 3)
            why, skill, evidence = detail
            self.assertGreaterEqual(len(why.split()), 14, f"Q{question} Why is too thin")
            self.assertGreaterEqual(len(skill.split()), 4, f"Q{question} Skill is too vague")
            self.assertLessEqual(len(skill.split()), 16, f"Q{question} Skill is not concise")
            self.assertRegex(evidence, rf"^Passage {PART_FOR[question]}, .+?: .+")
            quote = evidence.split(":", 1)[1].strip()
            self.assertIn(normalise(quote), normalise(PASSAGES[PART_FOR[question]]), f"Q{question} Evidence is not passage-grounded")

    def test_03_reasoning_rules_are_question_specific(self):
        questions = self.details["questions"]
        for question in (7, 10, 11, 32, 35):
            why = questions[str(question)][0].lower()
            self.assertRegex(why, r"contradict|opposite|instead|rather than")
        for question in (6, 13, 33, 36):
            why = questions[str(question)][0].lower()
            self.assertRegex(why, r"not state|does not say|missing|no information|not given")
        for question in list(range(1, 6)) + list(range(24, 27)):
            joined = " ".join(questions[str(question)][:2]).lower()
            self.assertIn("one word only", joined)
        q24 = " ".join(questions["24"][:2]).lower()
        self.assertIn("flavour", q24)
        self.assertIn("flavor", q24)
        self.assertNotIn("synonym", q24)

    def test_04_details_are_separate_from_explicit_clue_targets(self):
        clues = self.payload["clues"]
        self.assertIsInstance(clues, dict)
        for question in range(1, 41):
            evidence_quote = self.details["questions"][str(question)][2].split(":", 1)[1].strip()
            self.assertNotEqual(normalise(evidence_quote), normalise(clues[str(question)]["target"]))


if __name__ == "__main__":
    unittest.main()
