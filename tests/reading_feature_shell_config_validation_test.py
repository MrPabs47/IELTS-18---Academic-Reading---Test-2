import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _run_node_harness(harness: str) -> None:
    completed = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    assert completed.returncode == 0, (
        f"Node harness exit status: {completed.returncode}\n"
        f"stdout:\n{completed.stdout}\n"
        f"stderr:\n{completed.stderr}"
    )


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
    test: { totalQuestions: 40, partLabel: "Part", partRanges: JSON.parse(JSON.stringify(ranges)) },
    state: { getMode() { return "test"; }, isTestSubmitted() { return false; } },
    answers: { getAnswerKeyDisplay() { return "answer"; } },
    navigation: { getQuestionTarget() { return null; } },
    study: { scoreGuide: { rows: [] } }
  };
}
function supplied() {
  const config = base();
  config.study.completeQuestionCoverage = true;
  config.study.completeClueCoverage = true;
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
assert.strictEqual(shell.validateConfig(base()).ok, true, "base config without optional task data should remain valid");
assert.strictEqual(shell.validateConfig(base()).capabilities.hasTaskGroups, false);
assert.strictEqual(shell.validateConfig(supplied()).ok, true, "supplied Study data should validate against configured ranges");
assert.strictEqual(shell.validateConfig(supplied()).capabilities.hasQuestionDetails, false, "details require page-owned answer callbacks");

let invalid = supplied();
invalid.test.partRanges[2].from = 12;
assert.match(shell.validateConfig(invalid).error, /cover every question once/);
invalid = supplied();
delete invalid.test.partRanges[3];
assert.match(shell.validateConfig(invalid).error, /cover every question once/);
invalid = base();
invalid.study.taskGroups = [];
assert.strictEqual(shell.validateConfig(invalid).ok, true);
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /non-empty array/);
invalid = supplied();
invalid.study.taskGroups = [];
assert.strictEqual(shell.validateConfig(invalid).ok, true);
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /non-empty array/);
invalid = supplied();
invalid.study.taskGroups[0].questions.push(11);
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /invalid question number|exactly once/);
invalid = supplied();
invalid.study.questionDetails[4] = ["", "Skill", "Evidence"];
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /Why and Skill/);
invalid = supplied();
invalid.study.taskGroups[0].passage = 2;
assert.strictEqual(shell.validateConfig(invalid).capabilities.hasTaskGroups, true, "text identity may differ from scoring part");
invalid = supplied();
invalid.study.taskGroups[0].controlHost = "#missing-host";
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /unresolved controlHost/);
invalid = supplied();
invalid.study.taskGroups[1].id = "one";
assert.match(shell.validateConfig(invalid).diagnostics.join(" "), /duplicate task group id/);

invalid = base();
invalid.test.partRanges[2].from = 12;
const first = shell.init(invalid);
const second = shell.init(invalid);
assert.strictEqual(first.ok, false);
assert.strictEqual(second.ok, false);
assert.strictEqual(warnings.filter(message => message.includes("cover every question once")).length, 1);
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


def test_shared_core_has_no_builtin_ielts_feedback_or_answer_fallbacks():
    core = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
    for forbidden in ["TEST3_GROUPS", "TEST3_DETAILS", "VARIANTS", "CHOOSE_TWO"]:
        assert forbidden not in core
    assert "return [];" in core.split("function taskGroups()", 1)[1].split("\n", 1)[0]
    assert "return {};" in core.split("function questionDetails()", 1)[1].split("\n", 1)[0]


def test_shared_core_declares_independent_optional_capabilities():
    core = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
    for capability in [
        "hasTaskGroups", "hasTaskStrategies", "hasQuestionDetails",
        "hasPassageClues", "hasSubmittedResult",
    ]:
        assert capability in core
    assert "duplicate task group id" in core.lower()
    assert "validateOptionalCapabilities" in core


def test_submitted_result_callback_precedes_explicit_dom_compatibility():
    core = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
    submitted = core.split("function submittedResult()", 1)[1].split("\n  function ", 1)[0]
    assert "config.state.getSubmittedResult()" in submitted
    assert "allowDomSubmittedResult" in submitted
    assert submitted.index("getSubmittedResult()") < submitted.index("allowDomSubmittedResult")
    assert "parsedResult()" not in submitted.split("allowDomSubmittedResult", 1)[0]


def test_base_configuration_without_task_data_never_activates_feedback_data():
    core = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
    assert 'if (!hasOwn(study, "taskGroups"))' in core
    assert 'if (!hasOwn(study, "questionDetails"))' in core


def test_authoritative_result_validation_and_explicit_dom_compatibility():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const warnings = [];
const scoreLine = { textContent: "You answered 0 out of 40 questions correctly." };
const bandLine = { textContent: "Estimated band: 0." };
let editedAnswerIsCorrect = false;
const context = { window: {
  console: { warn(message) { warnings.push(message); } },
  document: {
    getElementById(id) { return id === "scoreLine" ? scoreLine : id === "bandLine" ? bandLine : null; }
  }
}};
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__resultTest = {
    configure: function (value) { config = value; capabilities = validateConfig(value).capabilities; },
    submitStudyDom: function () { studyReviewSubmitted = true; reviewOverlayWasOpen = true; domSubmissionSequence += 1; },
    closeStudyDom: function () { reviewOverlayWasOpen = false; },
    read: submittedResult
  };
  global.ReadingFeatureShell = {`);
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__resultTest;
const ranges = { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } };
const result = {
  submissionId: 1,
  rawScore: 3,
  band: 2.5,
  partScores: { 1: { score: 1, max: 13 }, 2: { score: 1, max: 13 }, 3: { score: 1, max: 14 } }
};
function base(state, compatibility) {
  return {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Part", partRanges: ranges },
    state,
    answers: { getAnswerKeyDisplay() { return "answer"; }, isCorrect(question) { return question === 1 && editedAnswerIsCorrect; } },
    navigation: { getQuestionTarget() { return null; } },
    study: { scoreGuide: { rows: [] } },
    compatibility
  };
}
api.configure(base({
  getMode() { return "study"; },
  isTestSubmitted() { return false; },
  getSubmittedResult() { return result; }
}, { allowDomSubmittedResult: true }));
assert.strictEqual(api.read().rawScore, 3, "callback must take priority over contradictory DOM text");

api.configure(base({ getMode() { return "study"; }, isTestSubmitted() { return false; } }));
api.submitStudyDom();
assert.strictEqual(api.read(), null, "DOM parsing must not run without explicit compatibility");

api.configure(base(
  { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  { allowDomSubmittedResult: true }
));
api.submitStudyDom();
assert.strictEqual(api.read().rawScore, 0, "explicit DOM compatibility should remain available");
api.closeStudyDom();
editedAnswerIsCorrect = true;
const warningCountBeforeEdit = warnings.length;
assert.strictEqual(api.read().rawScore, 0, "editing before resubmission must preserve the official DOM snapshot");
assert.strictEqual(warnings.length, warningCountBeforeEdit, "provisional edits must not emit a false result-validation warning");
scoreLine.textContent = "You answered 1 out of 40 questions correctly.";
api.submitStudyDom();
assert.strictEqual(api.read().rawScore, 1, "a genuine DOM resubmission must refresh the official snapshot");

api.configure(base({
  getMode() { return "study"; },
  isTestSubmitted() { return false; },
  getSubmittedResult() { return { ...result, rawScore: 4 }; }
}));
assert.strictEqual(api.read(), null, "part scores that do not sum to raw score must fail safely");
assert(warnings.some(message => message.includes("sum to the raw score")));
'''
    subprocess.run(
        ["node", "-e", harness], cwd=ROOT, check=True,
        capture_output=True, text=True, encoding="utf-8",
    )


def test_r4_fresh_study_reveal_handler_allows_learning_without_submission():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Reveal = function () {
    const group = { id: "group", label: "Group", questions: [] };
    const revealButton = { hidden: false, disabled: false, textContent: "", setAttribute() {} };
    config = {
      state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
      answers: { isCorrect() { return false; } },
      study: { taskGroups: [group], questionDetails: {} },
      test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } }
    };
    capabilities = { hasQuestionDetails: true };
    activeSubmittedResult = null;
    taskControls = [{
      group,
      result: { hidden: true, textContent: "" },
      revealButton,
      strategyButton: { hidden: false, disabled: false, setAttribute() {} },
      panel: { hidden: true }
    }];
    toggleGroup(group);
    return { revealed: revealedGroups.has(group.id), hidden: revealButton.hidden, disabled: revealButton.disabled };
  };
  global.ReadingFeatureShell = {`);
const context = { window: { document: { getElementById() { return null; } } } };
vm.createContext(context);
vm.runInContext(source, context);
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(context.window.__r1Reveal())),
  { revealed: true, hidden: false, disabled: false },
  "fresh Study learning resources still require an authoritative submission"
);
'''
    _run_node_harness(harness)


def test_r1_study_snapshot_is_copied_and_frozen_until_submission_id_changes():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Snapshot = {
    configure(value) {
      config = value;
      capabilities = validateConfig(value).capabilities;
      initialized = true;
      activeSubmittedResult = null;
      finalTestSubmittedResult = null;
      lastSubmissionId = null;
      submittedOutcomes = null;
      elements = {
        root: { hidden: true, setAttribute() {} },
        scoreGuideButton: {}, answerKeyButton: {}, studyPill: {}, timer: {},
        scoreFeedbackButton: {},
        scoreGuideBackdrop: { hidden: true },
        answerKeyBackdrop: { hidden: true },
        scoreFeedbackBackdrop: { hidden: true }
      };
    },
    sync,
    active() { return activeSubmittedResult; }
  };
  global.ReadingFeatureShell = {`);
const document = {
  getElementById() { return null; },
  querySelectorAll() { return []; }
};
const context = { window: {
  document,
  console: { warn() {} },
  clearInterval() {},
  setTimeout(callback) { callback(); }
}};
vm.createContext(context);
vm.runInContext(source, context);
const ranges = { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } };
function result(id, raw) {
  const part1 = Math.min(raw, 13);
  const part2 = Math.min(Math.max(raw - 13, 0), 13);
  const part3 = Math.max(raw - 26, 0);
  return {
    submissionId: id,
    rawScore: raw,
    band: raw ? 1 : 0,
    partScores: {
      1: { score: part1, max: 13 },
      2: { score: part2, max: 13 },
      3: { score: part3, max: 14 }
    }
  };
}
let mode = "study";
let submitted = false;
let current = result(1, 1);
const config = {
  version: 1,
  test: { totalQuestions: 40, partLabel: "Part", partRanges: ranges },
  state: {
    getMode() { return mode; },
    isTestSubmitted() { return submitted; },
    getSubmittedResult() { return current; }
  },
  answers: { getAnswerKeyDisplay() { return "answer"; } },
  navigation: { getQuestionTarget() { return null; } },
  study: {}
};
const api = context.window.__r1Snapshot;
api.configure(config);
api.sync();
assert.strictEqual(api.active().rawScore, 1);
current.rawScore = 2;
current.partScores[1].score = 2;
api.sync();
assert.strictEqual(api.active().rawScore, 1, "same submissionId must preserve the captured Study snapshot");
current = result(2, 2);
api.sync();
assert.strictEqual(api.active().rawScore, 2, "new submissionId must refresh the Study snapshot");
current.rawScore = 3;
current.partScores[1].score = 3;
assert.strictEqual(api.active().rawScore, 2, "captured snapshots must not retain page-owned mutable references");
mode = "test";
submitted = true;
current = result(10, 20);
api.configure(config);
api.sync();
assert.strictEqual(api.active().rawScore, 20);
current = result(11, 30);
api.sync();
assert.strictEqual(api.active().rawScore, 20, "completed Test must preserve its first valid final snapshot");
'''
    _run_node_harness(harness)


def test_r1_submission_id_type_validation_rejects_all_unsupported_values():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Result = {
    configure(value) { config = value; },
    read: submittedResult
  };
  global.ReadingFeatureShell = {`);
const warnings = [];
const context = { window: { console: { warn(value) { warnings.push(value); } } } };
vm.createContext(context);
vm.runInContext(source, context);
const ranges = { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } };
let current;
const base = {
  version: 1,
  test: { totalQuestions: 40, partLabel: "Part", partRanges: ranges },
  state: {
    getMode() { return "study"; },
    isTestSubmitted() { return false; },
    getSubmittedResult() { return current; }
  },
  answers: { getAnswerKeyDisplay() { return "answer"; } },
  navigation: { getQuestionTarget() { return null; } },
  study: {}
};
context.window.__r1Result.configure(base);
function result(submissionId) {
  return {
    submissionId,
    rawScore: 0,
    band: 0,
    partScores: {
      1: { score: 0, max: 13 },
      2: { score: 0, max: 13 },
      3: { score: 0, max: 14 }
    }
  };
}
for (const invalid of [null, undefined, "", "   ", true, false, {}, [], function () {}, NaN, Infinity, -Infinity]) {
  current = result(invalid);
  assert.strictEqual(context.window.__r1Result.read(), null, "unsupported submissionId must be rejected: " + String(invalid));
}
for (const valid of [0, -1, 1.5, "submission-1"]) {
  current = result(valid);
  assert(context.window.__r1Result.read(), "supported submissionId must be accepted: " + String(valid));
}
'''
    _run_node_harness(harness)


def test_r1_malformed_outcomes_preserve_independent_base_review():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Result = {
    configure(value) { config = value; },
    read: submittedResult
  };
  global.ReadingFeatureShell = {`);
const warnings = [];
const context = { window: { console: { warn(value) { warnings.push(value); } } } };
vm.createContext(context);
vm.runInContext(source, context);
const result = {
  submissionId: 1,
  rawScore: 3,
  band: 2.5,
  partScores: {
    1: { score: 1, max: 13 },
    2: { score: 1, max: 13 },
    3: { score: 1, max: 14 }
  },
  questionOutcomes: { 1: true }
};
context.window.__r1Result.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } } },
  state: { getSubmittedResult() { return result; } }
});
const captured = context.window.__r1Result.read();
assert(captured, "malformed optional outcomes must not invalidate the base submitted result");
assert.strictEqual(captured.rawScore, 3);
assert.strictEqual(captured.questionOutcomes, undefined);
assert.strictEqual(warnings.length, 1, "malformed outcomes should emit one deduplicated diagnostic");
'''
    _run_node_harness(harness)


def test_r1_score_guide_is_optional_and_malformed_rows_are_capability_local():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = { window: {
  console: { warn() {} },
  document: { querySelector() { return null; } }
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
const ranges = { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } };
function base() {
  return {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Part", partRanges: ranges },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: { getAnswerKeyDisplay() { return "answer"; } },
    navigation: { getQuestionTarget() { return null; } },
    study: {}
  };
}
let checked = shell.validateConfig(base());
assert.strictEqual(checked.ok, true, "scoreGuide must be optional");
assert.strictEqual(checked.capabilities.hasScoreGuide, false);
const malformedRows = [
  [null],
  [4],
  [{ band: "9" }],
  [{ correctAnswers: "39-40" }],
  [{ correctAnswers: "bad", band: "9" }],
  [{ correctAnswers: "10-5", band: "6" }],
  [{ correctAnswers: "20-30", band: "7" }, { correctAnswers: "25-35", band: "8" }]
];
for (const rows of malformedRows) {
  const value = base();
  value.study.scoreGuide = { title: "Guide", intro: "Intro", rows };
  checked = shell.validateConfig(value);
  assert.strictEqual(checked.ok, true, "malformed score guide must not disable the base shell");
  assert.strictEqual(checked.capabilities.hasScoreGuide, false, "malformed score guide rows must disable only that capability");
  assert(checked.diagnostics.some(message => message.includes("score guide")));
}
'''
    _run_node_harness(harness)


def test_r1_task_groups_support_partial_coverage_multiple_texts_and_conditional_hosts():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = { window: {
  console: { warn() {} },
  document: { querySelector() { return null; } }
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
const ranges = { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } };
function config(complete) {
  return {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Section", partRanges: ranges },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: { getAnswerKeyDisplay() { return "answer"; } },
    navigation: { getQuestionTarget() { return null; } },
    study: {
      completeQuestionCoverage: complete,
      taskGroups: [
        { id: "a", part: 1, textId: "section-1-text-a", label: "A", questions: [1] },
        { id: "b", part: 1, textId: "section-1-text-b", label: "B", questions: [2] }
      ]
    }
  };
}
let checked = shell.validateConfig(config(false));
assert.strictEqual(checked.ok, true);
assert.strictEqual(checked.capabilities.hasTaskGroups, true, "partial structural groups must validate without UI hosts");
assert.strictEqual(checked.capabilities.hasCompleteTaskGroups, false);
checked = shell.validateConfig(config(true));
assert.strictEqual(checked.capabilities.hasTaskGroups, false, "claimed complete coverage must reject omissions");
assert(checked.diagnostics.some(message => message.includes("exactly once")));
'''
    _run_node_harness(harness)


def test_r1_throwing_submitted_result_callback_is_caught_and_deduplicated():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Result = {
    configure(value) { config = value; },
    read: submittedResult
  };
  global.ReadingFeatureShell = {`);
const warnings = [];
const context = { window: { console: { warn(value) { warnings.push(value); } } } };
vm.createContext(context);
vm.runInContext(source, context);
context.window.__r1Result.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getSubmittedResult() { throw new Error("callback exploded"); } }
});
assert.doesNotThrow(() => context.window.__r1Result.read());
assert.strictEqual(context.window.__r1Result.read(), null);
assert.strictEqual(warnings.length, 1);
assert(warnings[0].includes("getSubmittedResult"));
'''
    _run_node_harness(harness)


def test_r1_non_locatable_evidence_disables_clues_but_not_textual_details():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r1Clues = function () {
    config = {
      test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
      study: {
        completeClueCoverage: true,
        taskGroups: [{ id: "g", part: 1, textId: "text-a", questions: [1] }],
        questionDetails: { 1: ["Why", "Skill", "evidence that is absent"] }
      },
      navigation: { getTextTarget() { return { textContent: "unrelated passage text", querySelectorAll() { return []; }, normalize() {} }; } }
    };
    capabilities = { hasTaskGroups: true, hasQuestionDetails: true, hasPassageClues: true };
    auditClueCapability();
    var clueContext = resolveClueMapContext({ part: 1, textId: "text-a" }, false);
    return {
      capabilities,
      contextAvailable: clueContextStates.get(clueContext.key).available
    };
  };
  global.ReadingFeatureShell = {`);
const warnings = [];
const context = { window: {
  document: { querySelectorAll() { return []; }, getElementById() { return null; } },
  console: { warn(value) { warnings.push(value); } }
} };
vm.createContext(context);
vm.runInContext(source, context);
const result = context.window.__r1Clues();
assert.strictEqual(result.capabilities.hasQuestionDetails, true);
assert.strictEqual(result.capabilities.hasPassageClues, true);
assert.strictEqual(result.contextAvailable, false);
assert.strictEqual(warnings.length, 1);
'''
    _run_node_harness(harness)


def test_textual_evidence_is_required_for_details_but_does_not_enable_clues():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = { window: {
  console: { warn() {} },
  document: { querySelector(selector) { return selector === "#host" ? {} : null; } }
} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
function config() {
  const value = {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Passage", partRanges: { 1: { from: 1, to: 40 } } },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: {
      getAnswerKeyDisplay() { return "answer"; },
      getUserAnswer() { return "submitted"; },
      isCorrect() { return true; }
    },
    navigation: { getQuestionTarget() { return null; } },
    study: {
      taskGroups: [{
        id: "g", label: "Task", part: 1, textId: 1,
        questions: Array.from({ length: 40 }, (_, index) => index + 1),
        controlHost: "#host", purpose: "Purpose", steps: ["Step"], trap: "Trap"
      }],
      questionDetails: {}
    }
  };
  for (let question = 1; question <= 40; question += 1) {
    value.study.questionDetails[question] = ["Why", "Skill", "Textual Evidence " + question];
  }
  return value;
}
let checked = shell.validateConfig(config());
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
assert.strictEqual(
  checked.capabilities.hasPassageClues,
  false,
  "textual Evidence alone enabled passage clues"
);
assert.strictEqual(
  checked.diagnostics.some(message => /clue|evidence could not be located/i.test(message)),
  false,
  "clue validation ran without explicit clue capability"
);

let missingEvidence = config();
missingEvidence.study.questionDetails[1][2] = "";
checked = shell.validateConfig(missingEvidence);
assert.strictEqual(
  checked.capabilities.hasQuestionDetails,
  false,
  "missing textual Evidence did not invalidate complete detail data"
);

let legacyClues = config();
legacyClues.study.completeClueCoverage = true;
checked = shell.validateConfig(legacyClues);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
assert.strictEqual(checked.capabilities.hasPassageClues, true);

legacyClues.study.questionDetails[1][2] = "";
checked = shell.validateConfig(legacyClues);
assert.strictEqual(checked.capabilities.hasQuestionDetails, false);
assert.strictEqual(checked.capabilities.hasPassageClues, false);
assert(
  checked.diagnostics.some(message => message.includes("passage-clue capability requires non-empty evidence")),
  "legacy clue data no longer receives the established evidence audit"
);

legacyClues = config();
legacyClues.study.completeClueCoverage = true;
delete legacyClues.study.questionDetails;
checked = shell.validateConfig(legacyClues);
assert.strictEqual(checked.capabilities.hasQuestionDetails, false);
assert.strictEqual(checked.capabilities.hasPassageClues, false);
assert(
  checked.diagnostics.some(message => message.includes("passage-clue capability requires configured")),
  "an incomplete explicit clue contract was not audited"
);

let explicitClues = config();
explicitClues.study.completeClueCoverage = true;
explicitClues.study.clueTargets = {};
for (let question = 1; question <= 40; question += 1) {
  explicitClues.study.clueTargets[question] = {
    question, part: 1, textId: 1,
    target: "Target " + question,
    clue: "Learner clue " + question
  };
}
checked = shell.validateConfig(explicitClues);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
assert.strictEqual(checked.capabilities.hasPassageClues, true);

explicitClues.study.clueTargets[1].target = "";
checked = shell.validateConfig(explicitClues);
assert.strictEqual(
  checked.capabilities.hasQuestionDetails,
  true,
  "malformed explicit clue data disabled valid detail cards"
);
assert.strictEqual(checked.capabilities.hasPassageClues, false);
assert(
  checked.diagnostics.some(message => message.includes("question, part, textId, target, and clue")),
  "malformed explicit clue data was not diagnosed"
);

explicitClues = config();
explicitClues.study.completeClueCoverage = true;
explicitClues.study.clueTargets = {};
for (let question = 1; question <= 40; question += 1) {
  explicitClues.study.clueTargets[question] = {
    question, part: 1, textId: 1,
    target: "Target " + question,
    clue: "Learner clue " + question
  };
}
explicitClues.study.clueTargets[1].textId = 2;
checked = shell.validateConfig(explicitClues);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
assert.strictEqual(checked.capabilities.hasPassageClues, false);
assert(
  checked.diagnostics.some(message => message.includes("task-group part and text identity")),
  "wrong explicit clue passage identity was not diagnosed"
);
'''
    _run_node_harness(harness)


def test_explicit_clue_targets_override_textual_evidence_and_legacy_fallback_remains_contained():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__clueContract = {
    configure(value) {
      config = value;
      capabilities = { hasQuestionDetails: true };
    },
    target: clueTargetFor,
    text: clueTextFor
  };
  global.ReadingFeatureShell = {`);
const context = { window: { console: { warn() {} } } };
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__clueContract;
const details = { 1: ["Why", "Skill", "Textual Evidence"] };
api.configure({
  study: {
    questionDetails: details,
    clueTargets: {
      1: {
        question: 1, part: 1, textId: 1,
        target: "Exact passage target",
        clue: "Learner-facing clue"
      }
    }
  }
});
assert.strictEqual(api.target(1), "Exact passage target");
assert.strictEqual(api.text(1), "Learner-facing clue");
assert.notStrictEqual(api.target(1), details[1][2]);

api.configure({ study: { questionDetails: details } });
assert.strictEqual(api.target(1), "Textual Evidence");
assert.strictEqual(api.text(1), "Passage clue");
'''
    _run_node_harness(harness)


def test_textual_evidence_card_is_safe_snapshot_text_without_clue_side_effects():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__evidenceCard = {
    configure(value) {
      config = value;
      capabilities = {
        hasTaskGroups: true,
        hasQuestionDetails: true,
        hasPassageClues: false
      };
      submittedAnswers = { 1: "snapshot answer" };
      submittedOutcomes = { 1: 1 };
      activeSubmittedResult = {
        submissionId: 1,
        rawScore: 1,
        band: 1,
        partScores: { 1: { score: 1, max: 40 } }
      };
    },
    render() { buildQuestionCard(1); }
  };
  global.ReadingFeatureShell = {`);

let card = null;
let clueQueryCount = 0;
let textTargetReads = 0;
const host = {
  append(node) { card = node; },
  closest() { return this; }
};
function node(tag, className, text) {
  return {
    tag, className: className || "", textContent: text || "", id: "", innerHTML: "",
    append() {},
    remove() { if (card === this) card = null; },
    querySelector(selector) {
      if (selector === ".reading-shell-study-clue-button") {
        clueQueryCount += 1;
        return { remove() {}, addEventListener() {}, hidden: false, disabled: false };
      }
      return null;
    }
  };
}
const context = { window: {
  console: { warn() {} },
  document: {
    createElement(tag) { return node(tag); },
    getElementById(id) { return card && card.id === id ? card : null; },
    querySelector() { return null; }
  }
} };
vm.createContext(context);
vm.runInContext(source, context);
context.window.__evidenceCard.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: {
    getMode() { return "study"; },
    isTestSubmitted() { return false; }
  },
  answers: {
    getAnswerKeyDisplay() { return "official"; },
    getUserAnswer() { return "live edit"; },
    isCorrect() { return false; }
  },
  navigation: {
    getQuestionTarget() { return host; },
    getTextTarget() { textTargetReads += 1; return null; }
  },
  study: {
    taskGroups: [{ id: "g", part: 1, textId: 1, questions: [1] }],
    questionDetails: {
      1: ["Why text", "Skill text", "Evidence <img src=x onerror=alert(1)>"]
    }
  }
});
context.window.__evidenceCard.render();
context.window.__evidenceCard.render();
assert(card, "submitted detail card was not rendered");
assert(card.innerHTML.includes("<dt>Evidence</dt>"), "Evidence row was not rendered");
assert(
  card.innerHTML.includes("Evidence &lt;img src=x onerror=alert(1)&gt;"),
  "Evidence did not use the safe text rendering path"
);
assert(card.innerHTML.includes("snapshot answer"), "card ignored the submitted answer snapshot");
assert(!card.innerHTML.includes("live edit"), "card leaked a live edited answer");
assert(!card.innerHTML.includes("reading-shell-study-clue-button"), "textual Evidence created clue markup");
assert.strictEqual(clueQueryCount, 0, "textual Evidence attempted to bind a clue control");
assert.strictEqual(textTargetReads, 0, "textual Evidence attempted passage-target resolution");
'''
    _run_node_harness(harness)


def test_r1_graceful_failure_capability_matrix_is_isolated():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = { window: {
  console: { warn() {} },
  document: { querySelector(selector) { return selector === "#valid-host" ? {} : null; } }
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
function base() {
  return {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Section", partRanges: { 1: { from: 1, to: 40 } } },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: {
      getAnswerKeyDisplay() { return "answer"; },
      getUserAnswer() { return ""; },
      isCorrect() { return false; }
    },
    navigation: { getQuestionTarget() { return null; } },
    study: {
      completeQuestionCoverage: false,
      taskGroups: [{
        id: "one", label: "Task", part: 1, textId: "text-a", questions: [1],
        controlHost: "#valid-host", purpose: "Purpose", steps: ["Step"], trap: "Trap"
      }],
      questionDetails: { 1: ["Why", "Skill", "Evidence"] },
      scoreGuide: {
        title: "Guide", intro: "Intro",
        rows: [{ correctAnswers: "0-40", band: "0-9" }]
      }
    }
  };
}
let value = base();
let checked = shell.validateConfig(value);
assert.strictEqual(checked.ok, true);
assert.strictEqual(checked.capabilities.hasTaskGroups, true);
assert.strictEqual(checked.capabilities.hasTaskStrategies, true);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
assert.strictEqual(checked.capabilities.hasPassageClues, false);
assert.strictEqual(checked.capabilities.hasScoreGuide, true);
assert.strictEqual(checked.capabilities.hasCompleteTaskGroups, false);

value = base();
value.study.taskGroups = "broken";
checked = shell.validateConfig(value);
assert.strictEqual(checked.ok, true);
assert.strictEqual(checked.capabilities.hasTaskGroups, false);
assert.strictEqual(checked.capabilities.hasAnswerKey, true);
assert.strictEqual(checked.capabilities.hasScoreGuide, true);

value = base();
delete value.study.taskGroups[0].steps;
checked = shell.validateConfig(value);
assert.strictEqual(checked.capabilities.hasTaskGroups, true);
assert.strictEqual(checked.capabilities.hasTaskStrategies, false);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);

value = base();
value.study.questionDetails[1][0] = "";
checked = shell.validateConfig(value);
assert.strictEqual(checked.capabilities.hasQuestionDetails, false);
assert.strictEqual(checked.capabilities.hasAnswerKey, true);
assert.strictEqual(checked.capabilities.hasScoreGuide, true);

value = base();
value.study.questionDetails[1][2] = "";
checked = shell.validateConfig(value);
assert.strictEqual(checked.capabilities.hasQuestionDetails, false);
assert.strictEqual(checked.capabilities.hasPassageClues, false);

value = base();
value.study.taskGroups[0].controlHost = "#missing";
checked = shell.validateConfig(value);
assert.strictEqual(checked.capabilities.hasTaskGroups, true);
assert.strictEqual(checked.capabilities.hasTaskStrategies, false);
assert.strictEqual(checked.capabilities.hasQuestionDetails, false);
assert.strictEqual(checked.capabilities.hasAnswerKey, true);
assert.strictEqual(checked.capabilities.hasScoreGuide, true);

value = base();
value.study.scoreGuide.rows = [null];
checked = shell.validateConfig(value);
assert.strictEqual(checked.ok, true);
assert.strictEqual(checked.capabilities.hasScoreGuide, false);
assert.strictEqual(checked.capabilities.hasAnswerKey, true);
assert.strictEqual(checked.capabilities.hasQuestionDetails, true);
'''
    _run_node_harness(harness)


def test_r1_missing_mount_and_throwing_navigation_diagnostics_are_deduplicated():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const warnings = [];
const document = {
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
const context = { window: {
  document,
  console: { warn(message) { warnings.push(message); } }
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8"), context);
const shell = context.window.ReadingFeatureShell;
function config() {
  return {
    version: 1,
    test: { totalQuestions: 40, partLabel: "Part", partRanges: { 1: { from: 1, to: 40 } } },
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: { getAnswerKeyDisplay() { return ""; } },
    navigation: { getQuestionTarget() { return null; } },
    study: {}
  };
}
assert.strictEqual(shell.init(config()).ok, false);
assert.strictEqual(shell.init(config()).ok, false);
assert.strictEqual(warnings.filter(message => message.includes("mount was not found")).length, 1);
'''
    _run_node_harness(harness)


def test_r2_public_full_maps_are_gated_and_keyed_by_text_identity():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r2Maps = {
  configure(value, submitted) {
    config = value;
    capabilities = { hasTaskGroups: true, hasQuestionDetails: true, hasPassageClues: true };
    activeSubmittedResult = submitted ? {
      submissionId: 1, rawScore: 8, band: 4,
      partScores: { 1: { score: 8, max: 40 } },
      questionOutcomes: Object.fromEntries(Array.from({ length: 40 }, (_, index) => [index + 1, index < 8]))
    } : null;
    submittedOutcomes = submitted ? Object.fromEntries(Array.from({ length: 40 }, (_, index) => [index + 1, index < 8 ? 1 : 0])) : null;
  },
  show: showAllPassageClues,
  hide: hideAllPassageClues,
  activate(selection) {
    return syncActiveClueContext(resolveClueMapContext(selection, false), true);
  },
  mapKeys() { return Array.from(fullPassageClueMaps).sort(); }
};
  global.ReadingFeatureShell = {`);

function element(tag) {
  return {
    tagName: String(tag).toUpperCase(), className: "", children: [], attributes: {},
    hidden: false, disabled: false,
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] || null; },
    append(...children) { this.children.push(...children); },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    classList: { add() {}, remove() {}, contains() { return false; } }
  };
}
function passage(text) {
  const target = element("section");
  target.textContent = text;
  target.marks = [];
  target.node = { nodeValue: text, parentElement: { closest() { return null; } } };
  target.normalize = function () {};
  target.querySelector = function (selector) {
    return selector === ".reading-shell-evidence-highlight .reading-shell-evidence-highlight" ? null : null;
  };
  target.querySelectorAll = function (selector) {
    if (selector === ".reading-shell-evidence-highlight") return this.marks;
    if (selector === ".reading-shell-evidence-highlight .reading-shell-evidence-highlight") return [];
    if (selector === ".reading-shell-evidence-highlight .reading-shell-clue-badge") {
      return this.marks.flatMap(mark => mark.children.filter(child => child.className === "reading-shell-clue-badge"));
    }
    return [];
  };
  return target;
}
const textA = passage("A1 A2 A3 A4");
const textB = passage("B5 B6 B7 B8");
let routedTargets = 0;
const clueButtons = [];
const document = {
  createElement: element,
  createTextNode(text) { return { nodeValue: text }; },
  createTreeWalker(target) {
    let used = false;
    return { nextNode() { if (used) return null; used = true; return target.node; } };
  },
  createRange() {
    let node, start, end;
    return {
      setStart(value, offset) { node = value; start = offset; },
      setEnd(value, offset) { end = offset; },
      surroundContents(mark) {
        mark.replaceWith = function () {
          textA.marks = textA.marks.filter(item => item !== mark);
          textB.marks = textB.marks.filter(item => item !== mark);
        };
        mark.attributes["data-reading-shell-evidence-text"] = node.nodeValue.slice(start, end);
        if (node === textA.node) textA.marks.push(mark);
        if (node === textB.node) textB.marks.push(mark);
      }
    };
  },
  querySelectorAll(selector) { return selector === ".reading-shell-study-clue-button" ? clueButtons : []; },
  getElementById() { return null; },
  querySelector() { return null; }
};
const context = { window: {
  document,
  NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 },
  console: { warn() {} }
}};
vm.createContext(context);
vm.runInContext(source, context);
const groups = [
  { id: "a", label: "A", part: 1, textId: "section-1-text-a", questions: [1, 2, 3, 4] },
  { id: "b", label: "B", part: 1, textId: "section-1-text-b", questions: [5, 6, 7, 8] }
];
const details = {};
for (let q = 1; q <= 4; q += 1) details[q] = ["Why", "Skill", "A" + q];
for (let q = 5; q <= 8; q += 1) details[q] = ["Why", "Skill", "B" + q];
const config = {
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  study: { taskGroups: groups, questionDetails: details },
  navigation: {
    getTextTarget(textId) {
      routedTargets += 1;
      return textId === "section-1-text-a" ? textA : textId === "section-1-text-b" ? textB : null;
    }
  }
};
const api = context.window.__r2Maps;
const failures = [];
api.configure(config, false);
assert.doesNotThrow(() => api.show(1));
if (routedTargets !== 0) failures.push("pre-submission full-map call attempted clue routing");
if (textA.marks.length + textB.marks.length !== 0) failures.push("pre-submission full-map call rendered clues");
if (api.mapKeys().length !== 0) failures.push("pre-submission full-map call changed map state");

api.configure(config, true);
api.show("section-1-text-a");
const aQuestions = textA.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent)).sort((a, b) => a - b);
if (JSON.stringify(aQuestions) !== JSON.stringify([1, 2, 3, 4])) failures.push("Text A map did not contain exactly Q1-Q4: " + JSON.stringify(aQuestions));
if (textB.marks.length !== 0) failures.push("Text A map leaked into Text B");
api.show("section-1-text-b");
const bQuestions = textB.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent)).sort((a, b) => a - b);
const aQuestionsAfterB = textA.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent)).sort((a, b) => a - b);
if (JSON.stringify(bQuestions) !== JSON.stringify([5, 6, 7, 8])) failures.push("Text B map did not contain exactly Q5-Q8: " + JSON.stringify(bQuestions));
if (JSON.stringify(aQuestionsAfterB) !== JSON.stringify([])) failures.push("Text A evidence remained rendered while Text B was active: " + JSON.stringify(aQuestionsAfterB));
api.activate({ part: 1, textId: "section-1-text-a" });
const bQuestionsAfterA = textB.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent)).sort((a, b) => a - b);
const restoredAQuestions = textA.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent)).sort((a, b) => a - b);
if (JSON.stringify(bQuestionsAfterA) !== JSON.stringify([])) failures.push("Text B evidence remained rendered after returning to Text A: " + JSON.stringify(bQuestionsAfterA));
if (JSON.stringify(restoredAQuestions) !== JSON.stringify([1, 2, 3, 4])) failures.push("returning to Text A did not cleanly restore Q1-Q4: " + JSON.stringify(restoredAQuestions));
if (JSON.stringify(api.mapKeys()) !== JSON.stringify(['[1,"string","section-1-text-a"]', '[1,"string","section-1-text-b"]'])) failures.push("full-map state was not keyed independently by text identity: " + JSON.stringify(api.mapKeys()));
api.hide({ part: 1, textId: "section-1-text-a" });
api.show("section-1-text-b");
api.activate({ part: 1, textId: "section-1-text-a" });
const closedAQuestions = textA.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent));
const inactiveBQuestions = textB.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").map(b => Number(b.textContent));
if (closedAQuestions.length !== 0) failures.push("closed Text A map intent restored unexpectedly: " + JSON.stringify(closedAQuestions));
if (inactiveBQuestions.length !== 0) failures.push("inactive Text B evidence remained after returning to closed Text A: " + JSON.stringify(inactiveBQuestions));
if (JSON.stringify(api.mapKeys()) !== JSON.stringify(['[1,"string","section-1-text-b"]'])) failures.push("closing Text A removed or retained the wrong map intent: " + JSON.stringify(api.mapKeys()));
assert.deepStrictEqual(failures, []);
'''
    _run_node_harness(harness)


def test_r2_runtime_reaudit_disables_clues_and_clears_stale_marks():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r2Audit = {
  configure(value, target, button) {
    config = value;
    capabilities = { hasTaskGroups: true, hasQuestionDetails: true, hasPassageClues: true };
    activeSubmittedResult = { submissionId: 1 };
    submittedOutcomes = { 1: 1 };
    taskControls = [];
  },
  audit: auditClueCapability,
  show: showEvidence,
  clueEnabled() { return capabilities.hasPassageClues; },
  detailsEnabled() { return capabilities.hasQuestionDetails; }
};
  global.ReadingFeatureShell = {`);
const warnings = [];
const button = {
  hidden: false, disabled: false,
  getAttribute(name) { return name === "data-reading-shell-question" ? "1" : null; }
};
const mark = {
  getAttribute() { return "Evidence"; },
  replaceWith() { passage.marks = []; }
};
const passage = {
  textContent: "Evidence",
  marks: [mark],
  node: { nodeValue: "Evidence", parentElement: { closest() { return null; } } },
  querySelectorAll(selector) {
    if (selector === ".reading-shell-evidence-highlight") return this.marks;
    if (selector === ".reading-shell-evidence-focus, .reading-shell-evidence-attention") return [];
    return [];
  },
  normalize() {}
};
const document = {
  createTextNode(text) { return { nodeValue: text }; },
  querySelectorAll(selector) {
    if (selector === ".reading-shell-study-clue-button") return [button];
    if (selector === ".passage-section[data-section]") return [passage];
    return [];
  },
  getElementById() { return null; },
  createTreeWalker(target) {
    let used = false;
    return { nextNode() { if (used) return null; used = true; return target.node; } };
  }
};
const config = {
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  study: {
    taskGroups: [
      { id: "a", part: 1, textId: "text-a", questions: [1] },
      { id: "b", part: 1, textId: "text-b", questions: [2] }
    ],
    questionDetails: {
      1: ["Why", "Skill", "Evidence"],
      2: ["Why", "Skill", "Sibling evidence"]
    }
  },
  navigation: { getTextTarget(textId) { return textId === "text-a" ? passage : siblingPassage; } }
};
const siblingPassage = {
  textContent: "Sibling evidence",
  marks: [],
  node: { nodeValue: "Sibling evidence", parentElement: { closest() { return null; } } },
  querySelector() { return null; },
  querySelectorAll(selector) {
    if (selector === ".reading-shell-evidence-highlight") return this.marks;
    if (selector === ".reading-shell-evidence-focus, .reading-shell-evidence-attention") return [];
    return [];
  },
  normalize() {}
};
const context = { window: {
  document,
  NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 },
  console: { warn(message) { warnings.push(message); } },
  setTimeout(callback) { callback(); },
  requestAnimationFrame(callback) { callback(); }
}};
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__r2Audit;
api.configure(config, passage, button);
assert.strictEqual(api.audit(), true);
passage.textContent = "Replacement text";
passage.node.nodeValue = "Replacement text";
api.show(1);
api.show(1);
assert.strictEqual(api.clueEnabled(), true, "Text A evidence failure globally disabled valid sibling Text B");
assert.strictEqual(api.detailsEnabled(), true, "runtime evidence failure disabled textual details");
assert.strictEqual(button.hidden, true);
assert.strictEqual(button.disabled, true);
assert.strictEqual(passage.marks.length, 0, "stale clue marks were not cleared");
assert.strictEqual(warnings.filter(message => message.includes("could not be located")).length, 1);
assert.strictEqual(api.audit(), true, "valid sibling Text B did not remain auditable");
'''
    _run_node_harness(harness)


def test_r3_selected_invalid_text_is_reaudited_immediately():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r3Immediate = {
  configure(value) {
    config = value;
    capabilities = {
      hasAnswerKey: true, hasScoreGuide: false, hasTaskGroups: true,
      hasQuestionDetails: true, hasPassageClues: true
    };
    initialized = true;
    activeSubmittedResult = {
      submissionId: 1, rawScore: 1, band: 1,
      partScores: { 1: { score: 1, max: 40 } },
      questionOutcomes: { 1: true, 2: false }
    };
    lastSubmissionId = 1;
    submittedOutcomes = { 1: 1, 2: 0 };
    submittedOutcomeMode = "study";
    elements = {
      root: { hidden: false, setAttribute() {} },
      answerKeyButton: {}, scoreGuideButton: {}, studyPill: {}, timer: {},
      scoreFeedbackButton: {}, scoreGuideBackdrop: null,
      answerKeyBackdrop: { hidden: true }, scoreFeedbackBackdrop: { hidden: true }
    };
  },
  sync,
  clueEnabled() { return capabilities.hasPassageClues; }
};
  global.ReadingFeatureShell = {`);
let activeText = "text-a";
const submitted = {
  submissionId: 1, rawScore: 1, band: 1,
  partScores: { 1: { score: 1, max: 40 } },
  questionOutcomes: { 1: true, 2: false }
};
const valid = { textContent: "A evidence", querySelector() { return null; }, querySelectorAll() { return []; }, normalize() {} };
const invalid = { textContent: "wrong", querySelector() { return null; }, querySelectorAll() { return []; }, normalize() {} };
const toggle = {
  hidden: true, disabled: true, attributes: {},
  setAttribute(name, value) { this.attributes[name] = String(value); }
};
const toolbar = { hidden: true };
const context = { window: {
  document: {
    getElementById(id) {
      if (id === "passageClueToolbar") return toolbar;
      if (id === "passageClueToggle") return toggle;
      return null;
    },
    querySelectorAll() { return []; }
  },
  console: { warn() {} },
  clearInterval() {}
}};
vm.createContext(context);
vm.runInContext(source, context);
const config = {
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: {
    getMode() { return "study"; },
    isTestSubmitted() { return false; },
    getActivePart() { return 1; },
    getActiveTextId() { return activeText; },
    getSubmittedResult() { return submitted; }
  },
  answers: { getAnswerKeyDisplay() { return ""; } },
  study: {
    taskGroups: [
      { id: "a", part: 1, textId: "text-a", questions: [1] },
      { id: "b", part: 1, textId: "text-b", questions: [2] }
    ],
    questionDetails: {
      1: ["Why", "Skill", "A evidence"],
      2: ["Why", "Skill", "B evidence"]
    }
  },
  navigation: {
    getQuestionTarget() { return null; },
    getTextTarget(textId) { return textId === "text-a" ? valid : invalid; }
  }
};
const api = context.window.__r3Immediate;
api.configure(config);
api.sync();
assert.strictEqual(toggle.hidden, false, "valid Text A clues were unavailable");
activeText = "text-b";
api.sync();
assert.strictEqual(toggle.hidden, true, "invalid selected Text B was not disabled immediately");
assert.strictEqual(toggle.disabled, true, "invalid selected Text B control remained enabled");
assert.strictEqual(api.clueEnabled(), true, "invalid Text B incorrectly disabled the global clue capability");
'''
    _run_node_harness(harness)


def test_r3_context_keys_audit_cache_target_replacement_diagnostics_and_reset():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r3Contexts = {
  configure(value) {
    config = value;
    capabilities = { hasTaskGroups: true, hasQuestionDetails: true, hasPassageClues: true };
  },
  key: clueContextKey,
  resolve(selection) { return resolveClueMapContext(selection, false); },
  audit(context, force) { return auditClueContext(context, force); },
  remember(key) { fullPassageClueMaps.add(key); },
  reset: clearAllPassageClueMaps,
  available(key) { return clueContextStates.get(key).available; },
  counts() { return { states: clueContextStates.size, intents: fullPassageClueMaps.size }; }
};
  global.ReadingFeatureShell = {`);
const warnings = [];
function target(text, counter) {
  return {
    get textContent() { counter.reads += 1; return text; },
    querySelectorAll() { return []; },
    normalize() {}
  };
}
let aCounter = { reads: 0 };
let replacementCounter = { reads: 0 };
let targetA = target("A evidence", aCounter);
let targetB = target("B evidence", { reads: 0 });
const context = { window: {
  document: { querySelectorAll() { return []; }, getElementById() { return null; } },
  console: { warn(message) { warnings.push(message); } }
}};
vm.createContext(context);
vm.runInContext(source, context);
const config = {
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 }, 2: { from: 41, to: 40 } } },
  study: {
    taskGroups: [
      { id: "a", part: 1, textId: "text::a", questions: [1] },
      { id: "b", part: 1, textId: "text-b", questions: [2] }
    ],
    questionDetails: {
      1: ["Why", "Skill", "A evidence"],
      2: ["Why", "Skill", "B evidence"]
    }
  },
  navigation: {
    getTextTarget(textId) { return textId === "text::a" ? targetA : targetB; }
  }
};
const api = context.window.__r3Contexts;
api.configure(config);
const keys = [
  api.key(1, "text::a"),
  api.key(1, 1),
  api.key(1, "1"),
  api.key(1, "same"),
  api.key(2, "same"),
  api.key(1, "other")
];
assert.strictEqual(new Set(keys).size, keys.length, "context-key collision detected");
let contextA = api.resolve({ part: 1, textId: "text::a" });
assert.strictEqual(api.audit(contextA, false), true);
assert.strictEqual(api.audit(contextA, false), true);
assert.strictEqual(aCounter.reads, 1, "same context and target repeated the evidence audit");
targetA = target("A evidence", replacementCounter);
contextA = api.resolve({ part: 1, textId: "text::a" });
assert.strictEqual(api.audit(contextA, false), true);
assert.strictEqual(replacementCounter.reads, 1, "replacement DOM target was not re-audited");

config.study.questionDetails[2][2] = "missing B";
targetB = target("wrong B", { reads: 0 });
const invalidB = api.resolve({ part: 1, textId: "text-b" });
assert.strictEqual(api.audit(invalidB, true), false);
assert.strictEqual(api.available(contextA.key), true, "Text B evidence failure disabled valid sibling Text A");

config.study.questionDetails[1][2] = "missing A";
targetA = target("wrong A", { reads: 0 });
const invalidA = api.resolve({ part: 1, textId: "text::a" });
assert.strictEqual(api.audit(invalidA, true), false);
assert.strictEqual(api.audit(invalidA, true), false);
assert.strictEqual(api.audit(invalidB, true), false);
assert.strictEqual(api.audit(invalidB, true), false);
assert.strictEqual(warnings.length, 2, "diagnostics were not deduplicated once per failed context/reason");
api.remember(invalidA.key);
api.remember(invalidB.key);
assert.deepStrictEqual(JSON.parse(JSON.stringify(api.counts())), { states: 2, intents: 2 });
api.reset();
assert.deepStrictEqual(JSON.parse(JSON.stringify(api.counts())), { states: 0, intents: 0 }, "Study reset did not clear context state and map intent");
'''
    _run_node_harness(harness)


def test_r2_new_study_session_blocks_stale_authoritative_snapshot():
    harness = r'''
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync("academic/shared/reading-feature-shell-core.js", "utf8");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__r2Session = {
  configure(value) {
    config = value;
    capabilities = { hasAnswerKey: true, hasScoreGuide: true, hasPassageClues: false, hasQuestionDetails: false, hasTaskGroups: false, hasTaskStrategies: false };
    initialized = true;
    elements = {
      root: { hidden: true, setAttribute() {} },
      answerKeyButton: {}, scoreGuideButton: {}, studyPill: {}, timer: {}, timerValue: {},
      scoreFeedbackButton: {}, scoreGuideBackdrop: null,
      answerKeyBackdrop: { hidden: true }, scoreFeedbackBackdrop: { hidden: true }
    };
  },
  sync,
  start: startStudySession,
  active() { return activeSubmittedResult; },
  answerHidden() { return elements.answerKeyButton.hidden; }
};
  global.ReadingFeatureShell = {`);
let current = {
  submissionId: 1, rawScore: 1, band: 1,
  partScores: { 1: { score: 1, max: 40 } }
};
const context = { window: {
  document: { getElementById() { return null; }, querySelectorAll() { return []; } },
  console: { warn() {} },
  clearInterval() {},
  setInterval() { return 1; }
}};
vm.createContext(context);
vm.runInContext(source, context);
const config = {
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: {
    getMode() { return "study"; },
    isTestSubmitted() { return false; },
    getSubmittedResult() { return current; }
  },
  study: {},
  answers: { getAnswerKeyDisplay() { return ""; } },
  navigation: { getQuestionTarget() { return null; } }
};
const api = context.window.__r2Session;
api.configure(config);
api.sync();
assert.strictEqual(api.active().submissionId, 1);
api.start();
assert.strictEqual(api.active(), null, "new Study attempt retained stale submitted review");
assert.strictEqual(api.answerHidden(), false, "new Study attempt hid the Study Answer Key");
current = null;
api.sync();
current = {
  submissionId: 2, rawScore: 2, band: 2,
  partScores: { 1: { score: 2, max: 40 } }
};
api.sync();
assert.strictEqual(api.active().submissionId, 2, "genuine new submission was not accepted");
current = {
  submissionId: 2, rawScore: 3, band: 3,
  partScores: { 1: { score: 3, max: 40 } }
};
api.sync();
assert.strictEqual(api.active().rawScore, 2, "same-attempt editing changed the official snapshot");
'''
    _run_node_harness(harness)
