import json
import re
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic/cambridge-17/test-1"
HTML_PATH = TEST_DIR / "IELTS17 Test 1 - Academic Reading.html"
DATA_PATH = TEST_DIR / "study-feedback.js"

EXPECTED_GROUPS = [
    ("p1-note-completion", "Note completion", 1, 1, range(1, 7)),
    ("p1-true-false-not-given", "TRUE/FALSE/NOT GIVEN", 1, 1, range(7, 14)),
    ("p2-matching-information", "Matching information", 2, 2, range(14, 18)),
    ("p2-summary-completion", "Summary completion", 2, 2, range(18, 23)),
    ("p2-choose-two-23-24", "Choose TWO", 2, 2, range(23, 25)),
    ("p2-choose-two-25-26", "Choose TWO", 2, 2, range(25, 27)),
    ("p3-summary-phrase-list", "Summary completion with phrase list", 3, 3, range(27, 32)),
    ("p3-yes-no-not-given", "YES/NO/NOT GIVEN", 3, 3, range(32, 36)),
    ("p3-multiple-choice", "Multiple choice", 3, 3, range(36, 41)),
]

COMPLETION_ANSWERS = {
    "population", "suburbs", "businessmen", "funding", "press", "soil",
    "fortress", "bullfights", "opera", "salt", "shops",
}
PHRASE_LIST_ANSWERS = {
    "strategic alliance", "religious conviction", "decisive victory",
    "large reward", "relative safety",
}
CANONICAL_ANSWERS = {
    1: "population", 2: "suburbs", 3: "businessmen", 4: "funding",
    5: "press", 6: "soil", 7: "FALSE", 8: "NOT GIVEN", 9: "TRUE",
    10: "TRUE", 11: "FALSE", 12: "FALSE", 13: "NOT GIVEN", 14: "A",
    15: "F", 16: "E", 17: "D", 18: "fortress", 19: "bullfights",
    20: "opera", 21: "salt", 22: "shops", 23: ("C", "D"),
    24: ("C", "D"), 25: ("B", "E"), 26: ("B", "E"), 27: "H",
    28: "J", 29: "F", 30: "B", 31: "D", 32: "NOT GIVEN",
    33: "NO", 34: "NO", 35: "YES", 36: "B", 37: "C", 38: "A",
    39: "B", 40: "D",
}
FORBIDDEN_FIELDS = {
    "why", "skill", "evidence", "questiondetails",
    "clue", "clues", "cluemap", "cluemaps",
}
PLACEHOLDERS = {"todo", "tbd", "placeholder", "coming soon", "read carefully"}


def _node_executable():
    bundled = (
        Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
        / "node/bin" / ("node.exe" if Path.home().drive else "node")
    )
    node = shutil.which("node") or (str(bundled) if bundled.is_file() else None)
    if not node:
        raise AssertionError("Node.js is required to validate study-feedback.js")
    return node


def load_data(source=None):
    source = DATA_PATH.read_text(encoding="utf-8") if source is None else source
    script = r"""
const vm = require("vm");
let source = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => source += chunk);
process.stdin.on("end", () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "study-feedback.js" });
  process.stdout.write(JSON.stringify(context.window.IELTS17AcademicTest1StudyFeedback));
});
"""
    completed = subprocess.run(
        [_node_executable(), "-e", script],
        cwd=ROOT,
        input=source,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if completed.returncode:
        raise AssertionError(
            "study-feedback.js did not execute cleanly\n"
            f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


def validate_strategy_data(data):
    groups = data.get("taskGroups")
    if not isinstance(groups, list) or len(groups) != 9:
        raise AssertionError("taskGroups must contain exactly nine completed groups")
    actual = [
        (
            group.get("id"),
            group.get("label"),
            group.get("part"),
            group.get("textId"),
            group.get("questions"),
        )
        for group in groups
    ]
    expected = [
        (group_id, label, part, text_id, list(question_range))
        for group_id, label, part, text_id, question_range in EXPECTED_GROUPS
    ]
    if actual != expected:
        raise AssertionError("strategy group identity, ranges, part, or textId changed")
    covered = [question for group in groups for question in group["questions"]]
    if covered != list(range(1, 41)):
        raise AssertionError("strategy groups must cover Q1-40 exactly once")
    for group in groups:
        if set(("purpose", "steps", "trap")) - set(group):
            raise AssertionError(f"{group['id']} has incomplete strategy metadata")
        if not isinstance(group["steps"], list) or len(group["steps"]) < 3:
            raise AssertionError(f"{group['id']} needs at least three practical steps")
        if not all(isinstance(step, str) and step.strip() for step in group["steps"]):
            raise AssertionError(f"{group['id']} contains an empty practical step")
        if not isinstance(group["trap"], str) or not group["trap"].strip():
            raise AssertionError(f"{group['id']} has no common trap")
    keys = set()

    def collect(value):
        if isinstance(value, dict):
            for key, child in value.items():
                keys.add(key.casefold())
                collect(child)
        elif isinstance(value, list):
            for child in value:
                collect(child)

    collect(data)
    if keys.intersection(FORBIDDEN_FIELDS) or "questions" in data:
        raise AssertionError("question details, Why/Skill/Evidence, or clue data are forbidden")
    flattened = " ".join(
        " ".join([group["purpose"], *group["steps"], group["trap"]])
        for group in groups
    ).casefold()
    if any(
        re.search(rf"\b{re.escape(answer)}\b", flattened)
        for answer in COMPLETION_ANSWERS | PHRASE_LIST_ANSWERS
    ):
        raise AssertionError("strategy text leaks a canonical completion answer")
    for question, answer in CANONICAL_ANSWERS.items():
        values = answer if isinstance(answer, tuple) else (answer,)
        for value in values:
            if re.search(
                rf"\bq(?:uestion)?\s*{question}\b.{{0,24}}\b{re.escape(value.casefold())}\b",
                flattened,
            ):
                raise AssertionError(f"strategy text leaks the answer to Q{question}")


class TestIELTS17Test1StudyStrategyData(unittest.TestCase):
    def test_01_javascript_module_identity_is_valid_and_ielts17_only(self):
        data = load_data()
        self.assertEqual(data["test"]["series"], "Cambridge IELTS 17")
        self.assertEqual(data["test"]["module"], "Academic Reading")
        self.assertEqual(data["test"]["test"], 1)
        self.assertNotIn("IELTS16", DATA_PATH.read_text(encoding="utf-8"))

    def test_02_exactly_nine_completed_groups_replace_skeletons(self):
        data = load_data()
        self.assertIn("taskGroups", data)
        self.assertNotIn("taskGroupSkeletons", data)
        self.assertEqual(len(data["taskGroups"]), 9)

    def test_03_exact_group_identity_ranges_parts_and_q1_to_q40_coverage(self):
        data = load_data()
        validate_strategy_data(data)

    def test_04_metadata_is_complete_practical_concise_and_unique(self):
        groups = load_data().get("taskGroups", [])
        self.assertEqual(len(groups), 9)
        rendered = []
        for group in groups:
            purpose = group["purpose"].strip()
            steps = [step.strip() for step in group["steps"]]
            trap = group["trap"].strip()
            self.assertGreaterEqual(len(purpose), 35, group["id"])
            self.assertLessEqual(len(purpose), 220, group["id"])
            self.assertGreaterEqual(len(steps), 3, group["id"])
            self.assertTrue(all(25 <= len(step) <= 220 for step in steps), group["id"])
            self.assertTrue(25 <= len(trap) <= 220, group["id"])
            self.assertLessEqual(len(" ".join([purpose, *steps, trap])), 1050, group["id"])
            rendered.append(" ".join([purpose, *steps, trap]).casefold())
        self.assertEqual(len(rendered), len(set(rendered)))
        self.assertFalse(any(token in text for text in rendered for token in PLACEHOLDERS))

    def test_05_no_answer_leakage_or_question_specific_explanations(self):
        data = load_data()
        groups = data.get("taskGroups", [])
        flattened = " ".join(
            " ".join(
                [group.get("purpose", ""), *group.get("steps", []), group.get("trap", "")]
            )
            for group in groups
        ).casefold()
        leaked_words = sorted(
            answer for answer in COMPLETION_ANSWERS | PHRASE_LIST_ANSWERS
            if re.search(rf"\b{re.escape(answer)}\b", flattened)
        )
        self.assertEqual(leaked_words, [])
        self.assertNotRegex(flattened, r"\bq(?:uestion)?\s*(?:1[4-7]|2[3-9]|3\d|40)\b")
        self.assertNotRegex(flattened, r"\b(?:correct|answer)\s+(?:is|are|letters?)\b")
        self.assertNotRegex(flattened, r"\b(?:c\s*(?:and|/)\s*d|b\s*(?:and|/)\s*e)\b")
        for question, answer in CANONICAL_ANSWERS.items():
            values = answer if isinstance(answer, tuple) else (answer,)
            for value in values:
                self.assertNotRegex(
                    flattened,
                    rf"\bq(?:uestion)?\s*{question}\b.{{0,24}}\b{re.escape(value.casefold())}\b",
                )

    def test_06_no_details_why_skill_evidence_or_clue_data(self):
        data = load_data()
        keys = set()

        def collect(value):
            if isinstance(value, dict):
                for key, child in value.items():
                    keys.add(key.casefold())
                    collect(child)
            elif isinstance(value, list):
                for child in value:
                    collect(child)

        collect(data)
        self.assertFalse(keys.intersection(FORBIDDEN_FIELDS))
        self.assertNotIn("questions", data)

    def test_07_control_hosts_exist_once_and_strategy_capability_is_active_once(self):
        data = load_data()
        html = HTML_PATH.read_text(encoding="utf-8")
        groups = data.get("taskGroups", [])
        self.assertEqual(len(groups), 9)
        for group in groups:
            expected_host = f"#study-instruction-{group['id']}"
            self.assertEqual(group.get("controlHost"), expected_host)
            self.assertEqual(html.count(f'id="{expected_host[1:]}"'), 1)
        config = re.search(
            r"window\.readingFeatureShellConfig\s*=\s*\{.*?\n\s*\};",
            html,
            re.S,
        )
        self.assertIsNotNone(config)
        self.assertEqual(config.group(0).count("taskGroups:"), 1)
        self.assertIn(
            "taskGroups: test17StudyFeedback && test17StudyFeedback.taskGroups",
            config.group(0),
        )
        self.assertIn("completeQuestionCoverage: true", config.group(0))
        self.assertNotIn("questionDetails:", config.group(0))
        self.assertNotIn("completeClueCoverage", config.group(0))

    def test_08_focused_negative_mutations_are_rejected(self):
        baseline = load_data()
        validate_strategy_data(baseline)
        mutations = []

        missing = json.loads(json.dumps(baseline))
        missing["taskGroups"].pop()
        mutations.append(missing)

        overlap = json.loads(json.dumps(baseline))
        overlap["taskGroups"][1]["questions"][0] = 6
        mutations.append(overlap)

        incomplete = json.loads(json.dumps(baseline))
        incomplete["taskGroups"][0].pop("trap")
        mutations.append(incomplete)

        details = json.loads(json.dumps(baseline))
        details["questionDetails"] = {"1": ["answer explanation"]}
        mutations.append(details)

        clues = json.loads(json.dumps(baseline))
        clues["taskGroups"][0]["clues"] = ["leaked clue"]
        mutations.append(clues)

        leakage = json.loads(json.dumps(baseline))
        leakage["taskGroups"][0]["steps"][0] += " The answer is population."
        mutations.append(leakage)

        for mutant in mutations:
            with self.assertRaises(AssertionError):
                validate_strategy_data(mutant)


if __name__ == "__main__":
    unittest.main()
