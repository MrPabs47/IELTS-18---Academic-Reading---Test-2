import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_shared_core_validates_ranges_study_data_hosts_and_logs_once():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const warnings = [];
const context = {
  window: {
    console: { warn(message) { warnings.push(message); } },
    document: { querySelector(selector) { return selector === "#valid-host" ? {} : null; } }
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
const ranges = { 1: { from: 1, to: 10 }, 2: { from: 11, to: 25 }, 3: { from: 26, to: 40 } };
function base() {
  return {
    version: 1,
    test: { totalQuestions: 40, partRanges: JSON.parse(JSON.stringify(ranges)) },
    state: { getMode() { return "test"; }, isTestSubmitted() { return false; } },
    answers: { getAnswerKeyDisplay() { return "answer"; } },
    navigation: { getQuestionTarget() { return null; } },
    study: { scoreGuide: { rows: [] } }
  };
}
function supplied() {
  const config = base();
  const feedback = { label: "Task", purpose: "Purpose", trap: "Trap", steps: ["Step"] };
  config.study.taskGroups = [
    { id: "one", part: 1, passage: 1, controlHost: "#valid-host", questions: Array.from({length: 10}, (_, i) => i + 1), ...feedback },
    { id: "two", part: 2, passage: 2, controlHost: "#valid-host", questions: Array.from({length: 15}, (_, i) => i + 11), ...feedback },
    { id: "three", part: 3, passage: 3, controlHost: "#valid-host", questions: Array.from({length: 15}, (_, i) => i + 26), ...feedback }
  ];
  config.study.questionDetails = {};
  for (let question = 1; question <= 40; question += 1) config.study.questionDetails[question] = ["Why", "Skill", "Evidence"];
  return config;
}
assert.strictEqual(shell.validateConfig(base()).ok, true, "Test 3 fallback config should remain valid");
assert.strictEqual(shell.validateConfig(supplied()).ok, true, "supplied Study data should validate against configured ranges");

let invalid = supplied();
invalid.test.partRanges[2].from = 12;
assert.match(shell.validateConfig(invalid).error, /cover every question once/);
invalid = supplied();
delete invalid.test.partRanges[3];
assert.match(shell.validateConfig(invalid).error, /cover every question once/);
invalid = base();
invalid.study.taskGroups = [];
assert.match(shell.validateConfig(invalid).error, /supplied together/);
invalid = supplied();
invalid.study.taskGroups = [];
assert.match(shell.validateConfig(invalid).error, /non-empty array/);
invalid = supplied();
invalid.study.taskGroups[0].questions.push(11);
assert.match(shell.validateConfig(invalid).error, /invalid question number|exactly once/);
invalid = supplied();
invalid.study.questionDetails[4] = ["", "Skill", "Evidence"];
assert.match(shell.validateConfig(invalid).error, /Why, Skill, and evidence/);
invalid = supplied();
invalid.study.taskGroups[0].passage = 2;
assert.match(shell.validateConfig(invalid).error, /valid part and passage/);
invalid = supplied();
invalid.study.taskGroups[0].controlHost = "#missing-host";
assert.match(shell.validateConfig(invalid).error, /unresolved controlHost/);

const first = shell.init(invalid);
const second = shell.init(invalid);
assert.strictEqual(first.ok, false);
assert.strictEqual(second.ok, false);
assert.strictEqual(warnings.filter(message => message.includes("unresolved controlHost")).length, 1);
assert.strictEqual(shell.getStatus().initialized, false);
'''
    subprocess.run(
        ["node", "-e", harness], cwd=ROOT, check=True,
        capture_output=True, text=True, encoding="utf-8",
    )


def test_shared_core_has_no_page_engine_or_test4_specific_scoring_implementation():
    core = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
    for forbidden in [
        "function evaluateQuestions", "function submitTest", "function handlePrimarySubmit",
        "function confirmSubmit", "function computeBandScore", "cambridge-16-academic-reading-test-4",
    ]:
        assert forbidden not in core
    assert "config.answers.getUserAnswer(questionNumber)" in core
    assert "config.answers.isCorrect(questionNumber)" in core
    assert "partRangeEntries(config)" in core
    assert "question <= 13" not in core
    assert "question <= 26" not in core
