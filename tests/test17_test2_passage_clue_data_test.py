import html
import json
import re
import shutil
import subprocess
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-17" / "test-2"
DATA_PATH = TEST_DIR / "study-feedback.js"
HTML_PATH = TEST_DIR / "IELTS17 Test 2 - Academic Reading.html"
PASSAGES = {part: (TEST_DIR / f"Passage {part}.txt").read_text(encoding="utf-8-sig") for part in range(1, 4)}
PART_FOR = {question: 1 if question <= 13 else 2 if question <= 26 else 3 for question in range(1, 41)}
WORD_ANSWERS = {
    1: "rock", 2: "cave", 3: "clay", 4: "Essenes", 5: "Hebrew",
    24: "flavour", 25: "size", 26: "salt",
}


def normalise(value):
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def load_payload():
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    node = shutil.which("node") or (str(bundled) if bundled.is_file() else None)
    if not node:
        raise unittest.SkipTest("Node.js is unavailable")
    script = (
        "global.window={};require(" + json.dumps(str(DATA_PATH)) + ");"
        "process.stdout.write(JSON.stringify({clues:window.IELTS17AcademicTest2ClueTargets||null,details:window.IELTS17AcademicTest2QuestionDetails||null}));"
    )
    completed = subprocess.run([node, "-e", script], text=True, encoding="utf-8", capture_output=True, cwd=ROOT)
    if completed.returncode:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


class TestIELTS17Test2PassageClueData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = load_payload()
        cls.clues = cls.payload["clues"]
        cls.html = HTML_PATH.read_text(encoding="utf-8")

    def test_01_exactly_forty_explicit_targets_with_13_13_14_map(self):
        self.assertEqual({int(key) for key in self.clues}, set(range(1, 41)))
        self.assertEqual(len(self.clues), 40)
        counts = Counter(record["part"] for record in self.clues.values())
        self.assertEqual(counts, Counter({1: 13, 2: 13, 3: 14}))
        for question in range(1, 41):
            record = self.clues[str(question)]
            self.assertEqual(record["question"], question)
            self.assertEqual(record["part"], PART_FOR[question])
            self.assertEqual(record["textId"], PART_FOR[question])

    def test_02_every_target_resolves_once_in_assigned_passage(self):
        targets = []
        for question in range(1, 41):
            target = normalise(self.clues[str(question)]["target"])
            passage = normalise(PASSAGES[PART_FOR[question]])
            self.assertGreaterEqual(len(target.split()), 5, f"Q{question} target is too short")
            self.assertEqual(passage.count(target), 1, f"Q{question} target is not deterministic")
            targets.append(target)
        self.assertEqual(len(targets), len(set(targets)))

    def test_03_clues_are_separate_non_revealing_learner_guidance(self):
        for question in range(1, 41):
            record = self.clues[str(question)]
            clue = record["clue"].strip()
            self.assertGreaterEqual(len(clue.split()), 9)
            self.assertNotEqual(normalise(clue), normalise(record["target"]))
            self.assertNotRegex(clue, r"\b(?:TRUE|FALSE|NOT GIVEN|YES|NO)\b")
            self.assertNotRegex(clue.lower(), r"\b(?:option|paragraph|researcher)\s+[a-g]\b")
            if question in WORD_ANSWERS:
                self.assertNotRegex(clue.lower(), rf"\b{re.escape(WORD_ANSWERS[question].lower())}\b")

    def test_04_evidence_is_not_used_as_an_implicit_target(self):
        details = self.payload["details"]["questions"]
        for question in range(1, 41):
            evidence = details[str(question)][2].split(":", 1)[1].strip()
            self.assertNotEqual(normalise(evidence), normalise(self.clues[str(question)]["target"]))
        config = re.search(r"window\.readingFeatureShellConfig\s*=\s*\{[\s\S]*?\n\s*\};", self.html)
        self.assertIsNotNone(config)
        self.assertIn("completeQuestionCoverage: true", config.group(0))
        self.assertIn("completeClueCoverage: true", config.group(0))
        self.assertIn("clueTargets: test17ClueTargets", config.group(0))


if __name__ == "__main__":
    unittest.main()
