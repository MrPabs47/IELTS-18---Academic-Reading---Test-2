import hashlib
import html as html_lib
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
DETAIL_DIGEST = "29da37ebde9ead8fddbcd013eae8ffae2d6771eead9321f3b61b13027d78e6b8"
PART_FOR = {q: 1 if q <= 13 else 2 if q <= 26 else 3 for q in range(1, 41)}
RANGES = {1: set(range(1, 14)), 2: set(range(14, 27)), 3: set(range(27, 41))}
COMPLETION_ANSWERS = {
    1: "population", 2: "suburbs", 3: "businessmen", 4: "funding",
    5: "press", 6: "soil", 18: "fortress", 19: "bullfights",
    20: "opera", 21: "salt", 22: "shops",
}
RESULT_WORDS = {
    **{q: {"true", "false", "not given"} for q in range(7, 14)},
    **{q: {"yes", "no", "not given"} for q in range(32, 36)},
}
OPTION_ANSWERS = {
    14: "A", 15: "F", 16: "E", 17: "D",
    23: "C", 24: "D", 25: "B", 26: "E",
    27: "H", 28: "J", 29: "F", 30: "B", 31: "D",
    36: "B", 37: "C", 38: "A", 39: "B", 40: "D",
}


def _node():
    return shutil.which("node") or str(
        Path.home()
        / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"
    )


def load_payload(source=None):
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
    feedback: context.window.IELTS17AcademicTest1StudyFeedback || null,
    details: context.window.IELTS17AcademicTest1QuestionDetails || null,
    clueTargets: context.window.IELTS17AcademicTest1ClueTargets || null
  }));
});
"""
    completed = subprocess.run(
        [_node(), "-e", script],
        cwd=ROOT,
        input=DATA_PATH.read_text(encoding="utf-8") if source is None else source,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if completed.returncode:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


def normalise(value):
    return re.sub(r"\s+", " ", str(value)).strip().casefold()


def validate(payload):
    feedback = payload.get("feedback") or {}
    details = (payload.get("details") or {}).get("questions") or {}
    targets = payload.get("clueTargets")
    assert feedback.get("testId") == "cambridge-17-academic-reading-test-1"
    assert isinstance(targets, dict) and len(targets) == 40
    assert set(targets) == {str(q) for q in range(1, 41)}
    assert hashlib.sha256(
        json.dumps(details, ensure_ascii=False, separators=(",", ":")).encode()
    ).hexdigest() == DETAIL_DIGEST

    passages = {
        part: normalise((TEST_DIR / f"Passage {part}.txt").read_text(encoding="utf-8"))
        for part in (1, 2, 3)
    }
    page = HTML_PATH.read_text(encoding="utf-8")
    starts = list(
        re.finditer(r'<div class="passage-section" data-section="(\d)"[^>]*>', page)
    )
    passage_fragments = {}
    for index, match in enumerate(starts):
        part = int(match.group(1))
        end = (
            starts[index + 1].start()
            if index + 1 < len(starts)
            else page.find('<div class="right-panel"', match.end())
        )
        passage_fragments[part] = html_lib.unescape(page[match.end():end])
    targets_by_part = {1: set(), 2: set(), 3: set()}
    target_owners = {}
    for question in range(1, 41):
        record = targets[str(question)]
        assert set(record) == {"question", "part", "textId", "target", "clue"}
        assert record["question"] == question
        assert record["part"] == PART_FOR[question]
        assert record["textId"] == PART_FOR[question]
        target = normalise(record["target"])
        clue = normalise(record["clue"])
        assert target and target in passages[record["part"]]
        assert record["target"] in passage_fragments[record["part"]]
        assert 5 <= len(target.split()) <= 55
        assert 5 <= len(clue.split()) <= 28
        assert not any(marker in clue for marker in ("todo", "tbd", "placeholder", "the answer is"))
        assert record["target"] != details[str(question)][2]
        assert record["clue"] != record["target"]
        targets_by_part[record["part"]].add(question)
        target_owners.setdefault(target, []).append(question)

        if question in COMPLETION_ANSWERS:
            assert not re.search(
                rf"\b{re.escape(COMPLETION_ANSWERS[question])}\b", clue
            )
        for result in RESULT_WORDS.get(question, set()):
            assert not re.search(rf"\b{re.escape(result)}\b", clue)
        if question in OPTION_ANSWERS:
            letter = OPTION_ANSWERS[question]
            assert not re.search(
                rf"\b(?:option|paragraph|section|choice|letter)\s+{letter}\b",
                record["clue"],
                re.I,
            )

    assert targets_by_part == RANGES
    for owner_questions in target_owners.values():
        if len(owner_questions) > 1:
            assert max(owner_questions) - min(owner_questions) <= 2
            assert len({PART_FOR[q] for q in owner_questions}) == 1


class TestIELTS17Test1PassageClueData(unittest.TestCase):
    def test_01_exact_identity_and_forty_explicit_targets(self):
        validate(load_payload())

    def test_02_every_target_resolves_in_the_assigned_passage(self):
        validate(load_payload())

    def test_03_textual_evidence_is_unchanged_and_never_used_as_target(self):
        validate(load_payload())

    def test_04_clue_text_is_separate_concise_and_has_no_answer_leakage(self):
        validate(load_payload())

    def test_05_maps_cover_exactly_thirteen_thirteen_fourteen(self):
        payload = load_payload()
        validate(payload)
        targets = payload["clueTargets"]
        counts = {
            part: sum(item["part"] == part for item in targets.values())
            for part in (1, 2, 3)
        }
        self.assertEqual(counts, {1: 13, 2: 13, 3: 14})
        for part in (1, 2, 3):
            passage = normalise(
                (TEST_DIR / f"Passage {part}.txt").read_text(encoding="utf-8")
            )
            spans = []
            for question, record in targets.items():
                if record["part"] != part:
                    continue
                target = normalise(record["target"])
                start = passage.index(target)
                spans.append((start, start + len(target), int(question)))
            for index, left in enumerate(spans):
                for right in spans[index + 1:]:
                    self.assertFalse(
                        max(left[0], right[0]) < min(left[1], right[1]),
                        f"Q{left[2]} and Q{right[2]} would merge into one map mark",
                    )

    def test_06_complete_clue_coverage_is_explicitly_activated_once(self):
        html = HTML_PATH.read_text(encoding="utf-8")
        config = re.search(
            r"window\.readingFeatureShellConfig\s*=\s*\{.*?\n\s*\};", html, re.S
        )
        self.assertIsNotNone(config)
        self.assertEqual(config.group(0).count('["complete" + "ClueCoverage"]: true'), 1)
        self.assertIn(
            "clueTargets: test17ClueTargets",
            config.group(0),
        )

    def test_07_valid_javascript_syntax(self):
        completed = subprocess.run(
            [_node(), "--check", str(DATA_PATH)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_08_shared_contract_supports_explicit_targets_and_contained_legacy_fallback(self):
        script = r"""
const fs = require("fs");
const vm = require("vm");
const context = {
  window: {
    console: { warn() {} },
    document: { querySelector(selector) { return selector === "#host" ? {} : null; } }
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
function base() {
  const value = {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Passage", partRanges: { 1: { from: 1, to: 40 } } },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: {
      getAnswerKeyDisplay() { return ""; },
      getUserAnswer() { return ""; },
      isCorrect() { return false; }
    },
    navigation: { getQuestionTarget() { return null; } },
    study: {
      taskGroups: [{
        id: "all", label: "All", part: 1, textId: 1,
        questions: Array.from({ length: 40 }, (_, index) => index + 1),
        controlHost: "#host", purpose: "Purpose", steps: ["Step"], trap: "Trap"
      }],
      questionDetails: {}
    }
  };
  for (let q = 1; q <= 40; q += 1) {
    value.study.questionDetails[q] = ["Why", "Skill", "Textual Evidence " + q];
  }
  return value;
}
const shell = context.window.ReadingFeatureShell;
const inactive = base();
if (shell.validateConfig(inactive).capabilities.hasPassageClues) process.exit(1);
const legacy = base();
legacy.study.completeClueCoverage = true;
if (!shell.validateConfig(legacy).capabilities.hasPassageClues) process.exit(2);
const explicit = base();
explicit.study.completeClueCoverage = true;
explicit.study.clueTargets = {};
for (let q = 1; q <= 40; q += 1) {
  explicit.study.clueTargets[q] = {
    question: q, part: 1, textId: 1,
    target: "Exact Target " + q,
    clue: "Learner Clue " + q
  };
}
let checked = shell.validateConfig(explicit);
if (!checked.capabilities.hasQuestionDetails || !checked.capabilities.hasPassageClues) process.exit(3);
explicit.study.clueTargets[1].target = "";
checked = shell.validateConfig(explicit);
if (!checked.capabilities.hasQuestionDetails || checked.capabilities.hasPassageClues) process.exit(4);
"""
        completed = subprocess.run(
            [_node(), "-e", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_09_textual_evidence_is_not_reused_as_any_explicit_target(self):
        payload = load_payload()
        validate(payload)
        details = payload["details"]["questions"]
        evidence = {normalise(record[2]) for record in details.values()}
        targets = {
            normalise(record["target"])
            for record in payload["clueTargets"].values()
        }
        self.assertTrue(evidence.isdisjoint(targets))

    def test_10_focused_negative_mutations_are_rejected(self):
        baseline = load_payload()
        validate(baseline)
        mutations = []

        def add(label, mutate):
            mutant = deepcopy(baseline)
            mutate(mutant)
            mutations.append((label, mutant))

        add("missing clue", lambda value: value["clueTargets"].pop("40"))
        add(
            "duplicate question",
            lambda value: value["clueTargets"]["2"].update(question=1),
        )
        add(
            "wrong passage",
            lambda value: value["clueTargets"]["1"].update(part=2, textId=2),
        )
        add(
            "unresolved target",
            lambda value: value["clueTargets"]["1"].update(target="invented target"),
        )
        add(
            "answer leakage",
            lambda value: value["clueTargets"]["1"].update(
                clue="The missing word is population in this sentence."
            ),
        )
        add(
            "incomplete map",
            lambda value: value["clueTargets"]["13"].update(part=2, textId=2),
        )
        add(
            "Evidence recoupling",
            lambda value: value["clueTargets"]["1"].update(
                target=value["details"]["questions"]["1"][2]
            ),
        )
        add(
            "malformed contract",
            lambda value: value["clueTargets"]["1"].pop("clue"),
        )

        for label, mutant in mutations:
            with self.subTest(mutation=label):
                with self.assertRaises(AssertionError):
                    validate(mutant)


if __name__ == "__main__":
    unittest.main()
