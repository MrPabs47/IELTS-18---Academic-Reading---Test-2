import json
import re
import shutil
import subprocess
import unittest
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic/cambridge-17/test-1"
HTML_PATH = TEST_DIR / "IELTS17 Test 1 - Academic Reading.html"
DATA_PATH = TEST_DIR / "study-feedback.js"
PASSAGE_PATHS = {
    1: TEST_DIR / "Passage 1.txt",
    2: TEST_DIR / "Passage 2.txt",
    3: TEST_DIR / "Passage 3.txt",
}
EXPECTED_GROUPS = {
    **{q: "p1-note-completion" for q in range(1, 7)},
    **{q: "p1-true-false-not-given" for q in range(7, 14)},
    **{q: "p2-matching-information" for q in range(14, 18)},
    **{q: "p2-summary-completion" for q in range(18, 23)},
    **{q: "p2-choose-two-23-24" for q in range(23, 25)},
    **{q: "p2-choose-two-25-26" for q in range(25, 27)},
    **{q: "p3-summary-phrase-list" for q in range(27, 32)},
    **{q: "p3-yes-no-not-given" for q in range(32, 36)},
    **{q: "p3-multiple-choice" for q in range(36, 41)},
}
EXPECTED_TEXT = {
    **{q: 1 for q in range(1, 14)},
    **{q: 2 for q in range(14, 27)},
    **{q: 3 for q in range(27, 41)},
}
PLACEHOLDERS = ("todo", "tbd", "placeholder", "coming soon", "read carefully")


def _node_executable():
    bundled = (
        Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
        / "node/bin" / ("node.exe" if Path.home().drive else "node")
    )
    node = shutil.which("node") or (str(bundled) if bundled.is_file() else None)
    if not node:
        raise AssertionError("Node.js is required to validate study-feedback.js")
    return node


def load_payload(source=None):
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
  process.stdout.write(JSON.stringify({
    data: context.window.IELTS17AcademicTest1StudyFeedback || null,
    details: context.window.IELTS17AcademicTest1QuestionDetails || null
  }));
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
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


def normalise(value):
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def evidence_fragment(value):
    fragment = value.split(":", 1)[-1].strip()
    return fragment.strip("\"'“”‘’ ")


def validate_details(payload):
    data = payload.get("data") or {}
    details_payload = payload.get("details") or {}
    questions = details_payload.get("questions")
    assert details_payload.get("testId") == "cambridge-17-academic-reading-test-1"
    assert isinstance(questions, dict) and len(questions) == 40
    assert set(questions) == {str(q) for q in range(1, 41)}
    assert not any("clue" in key.casefold() for key in _all_keys(details_payload))

    groups = data.get("taskGroups") or []
    assignments = {}
    for group in groups:
        for question in group.get("questions", []):
            assert question not in assignments
            assignments[question] = (group.get("id"), group.get("part"), group.get("textId"))
    assert set(assignments) == set(range(1, 41))

    passages = {
        text_id: normalise(path.read_text(encoding="utf-8"))
        for text_id, path in PASSAGE_PATHS.items()
    }
    for question in range(1, 41):
        assert assignments[question] == (
            EXPECTED_GROUPS[question],
            EXPECTED_TEXT[question],
            EXPECTED_TEXT[question],
        )
        detail = questions[str(question)]
        assert isinstance(detail, list) and len(detail) == 3
        why, skill, evidence = detail
        assert all(isinstance(item, str) and item.strip() for item in detail)
        assert 10 <= len(why.split()) <= 90
        assert 2 <= len(skill.split()) <= 18
        assert 3 <= len(evidence.split()) <= 60
        flattened = " ".join(detail).casefold()
        assert not any(marker in flattened for marker in PLACEHOLDERS)
        assert "ielts 16" not in flattened and "cambridge 16" not in flattened
        fragment = normalise(evidence_fragment(evidence))
        assert fragment and fragment in passages[EXPECTED_TEXT[question]]
        assert not any("clue" in key.casefold() for key in _all_keys(detail))

    for question in (7, 11, 12):
        why = questions[str(question)][0].casefold()
        assert any(word in why for word in ("contradict", "instead", "whereas", "not at"))
    for question in (8, 13, 32):
        why = questions[str(question)][0].casefold()
        assert any(phrase in why for phrase in ("does not say", "does not state", "is not given", "not stated"))
    for question in (33, 34):
        why = questions[str(question)][0].casefold()
        assert any(word in why for word in ("writer", "reviewer", "account"))
        assert any(word in why for word in ("contradict", "opposite", "instead"))
    assert "writer" in questions["35"][0].casefold() or "reviewer" in questions["35"][0].casefold()
    for question in range(27, 32):
        why = questions[str(question)][0].casefold()
        assert any(word in why for word in ("grammar", "grammatically", "phrase", "fits"))
    for question in range(23, 27):
        why = questions[str(question)][0].casefold()
        assert "unordered" in why or "order" in why
    for question in range(36, 41):
        why = questions[str(question)][0].casefold()
        assert "option" in why


def _all_keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from _all_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from _all_keys(child)


class TestIELTS17Test1QuestionDetailData(unittest.TestCase):
    def test_01_exact_identity_and_complete_valid_detail_schema(self):
        validate_details(load_payload())

    def test_02_exact_q1_to_q40_coverage_once(self):
        questions = (load_payload().get("details") or {}).get("questions") or {}
        self.assertEqual(list(sorted(map(int, questions))), list(range(1, 41)))
        self.assertEqual(len(questions), 40)

    def test_03_why_skill_and_evidence_are_complete_and_natural_length(self):
        questions = (load_payload().get("details") or {}).get("questions") or {}
        for question in range(1, 41):
            with self.subTest(question=question):
                detail = questions.get(str(question), [])
                self.assertEqual(len(detail), 3)
                self.assertTrue(all(item.strip() for item in detail))

    def test_04_evidence_is_grounded_in_the_assigned_local_passage(self):
        payload = load_payload()
        validate_details(payload)

    def test_05_complete_details_are_activated_without_clue_capability(self):
        html = HTML_PATH.read_text(encoding="utf-8")
        config = re.search(r"window\.readingFeatureShellConfig\s*=\s*\{.*?\n\s*\};", html, re.S)
        self.assertIsNotNone(config)
        self.assertIn(
            '["questionDetails"]: test17QuestionDetails && test17QuestionDetails.questions',
            config.group(0),
        )
        self.assertIn("completeQuestionCoverage: true", config.group(0))
        self.assertNotIn("completeClueCoverage", config.group(0))

    def test_06_no_clue_fields_maps_or_ielts16_fallback(self):
        payload = load_payload()
        flattened = json.dumps(payload.get("details"), ensure_ascii=False).casefold()
        self.assertNotIn("clue", flattened)
        self.assertNotIn("ielts 16", flattened)
        self.assertNotIn("cambridge 16", flattened)

    def test_07_valid_javascript_syntax(self):
        completed = subprocess.run(
            [_node_executable(), "--check", str(DATA_PATH)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_08_focused_negative_data_mutations_are_rejected(self):
        baseline = load_payload()
        validate_details(baseline)
        mutations = []

        for label, mutate in (
            ("missing question", lambda value: value["details"]["questions"].pop("40")),
            ("duplicate assignment", lambda value: value["data"]["taskGroups"][1]["questions"].append(6)),
            ("wrong part", lambda value: value["data"]["taskGroups"][0].update(part=2)),
            ("wrong text", lambda value: value["data"]["taskGroups"][0].update(textId=2)),
            ("blank why", lambda value: value["details"]["questions"]["1"].__setitem__(0, "")),
            ("placeholder", lambda value: value["details"]["questions"]["1"].__setitem__(1, "TODO")),
            ("wrong-passage evidence", lambda value: value["details"]["questions"]["1"].__setitem__(2, "Paragraph A: Stadiums are among the oldest forms of urban architecture")),
            ("clue field", lambda value: value["details"].update(clueMap={"1": "answer"})),
        ):
            mutant = deepcopy(baseline)
            mutate(mutant)
            mutations.append((label, mutant))

        for label, mutant in mutations:
            with self.subTest(mutation=label):
                with self.assertRaises(AssertionError):
                    validate_details(mutant)


if __name__ == "__main__":
    unittest.main()
