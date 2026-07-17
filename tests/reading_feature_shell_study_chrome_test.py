import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER_JS = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")
CORE_JS = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
JS = CORE_JS + "\n" + LOADER_JS
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")
CONTRACT = (ROOT / "academic/shared/READING_FEEDBACK_PARITY_CONTRACT.md").read_text(encoding="utf-8")


def _run_score_feedback_harness(groups, first_correct, second_correct=None):
    script = r'''
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync(process.argv[1], "utf8");
const marker = "  global.ReadingFeatureShell = {";
const hook = `  global.__scoreFeedbackTest = {
    setConfig: function (value) { config = value; },
    capture: captureSubmittedOutcomes,
    select: selectPartFeedback,
    strengthAdvice: strengthFeedbackAdvice,
    focusAdvice: focusFeedbackAdvice
  };\n`;
if (!source.includes(marker)) throw new Error("Shared-core export marker missing");
source = source.replace(marker, hook + marker);
const context = { window: {}, console: { error: function () {} } };
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__scoreFeedbackTest;
const groups = JSON.parse(process.argv[2]);
let currentCorrect = new Set(JSON.parse(process.argv[3]));
api.setConfig({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode: function () { return "study"; } },
  answers: { isCorrect: function (questionNumber) { return currentCorrect.has(Number(questionNumber)); } },
  study: { taskGroups: groups }
});
function project() {
  const selected = api.select(1);
  function item(value, type) {
    if (!value) return null;
    return {
      id: value.group.id,
      label: value.group.label,
      correct: value.correct,
      total: value.total,
      ratio: value.ratio,
      advice: type === "strength" ? api.strengthAdvice(value) : api.focusAdvice(value)
    };
  }
  return { strength: item(selected.strength, "strength"), focus: item(selected.focus, "focus") };
}
api.capture();
const first = project();
let provisional = null;
let second = null;
if (process.argv[4] !== "null") {
  currentCorrect = new Set(JSON.parse(process.argv[4]));
  provisional = project();
  api.capture();
  second = project();
}
process.stdout.write(JSON.stringify({ first, provisional, second }));
'''
    completed = subprocess.run(
        [
            "node", "-e", script,
            str(ROOT / "academic/shared/reading-feature-shell-core.js"),
            json.dumps(groups), json.dumps(first_correct), json.dumps(second_correct),
        ],
        cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8",
    )
    return json.loads(completed.stdout)


def test_shared_shell_assets_and_public_api_remain_available():
    assert HTML.count('../../shared/reading-feature-shell.css') == 1
    assert HTML.count('../../shared/reading-feature-shell.js') == 1
    assert HTML.count('id="readingFeatureShellMount"') == 1
    assert 'reading-feature-shell-core.js' in LOADER_JS
    for name in ["init", "sync", "startStudySession", "getStatus", "validateConfig"]:
        assert re.search(rf"\b{name}\s*:\s*{name}\b", JS)


def test_header_controls_follow_the_approved_test3_contract():
    for token in [
        '"📊 Score guide"', '"🔑"', '"Study mode"', '"Study time: "',
        '"Score feedback"', '"Answer Key"',
    ]:
        assert token in JS
    assert JS.find('scoreGuideButton = el') < JS.find('answerKeyButton = el') < JS.find('studyPill = el')


def test_task_feedback_uses_test1_test2_control_and_card_structure():
    for token in [
        '"Show answers & feedback"', '"Hide answers & feedback"',
        '"How to tackle this task"', '<dt>Your answer</dt>',
        '<dt>Correct answer</dt>', '<dt>Why</dt>', '<dt>Skill</dt>',
        'title="Passage clue"',
        'reading-shell-study-controls', 'reading-shell-study-icon-button',
        'reading-shell-study-reveal-button', 'reading-shell-study-result',
        'reading-shell-study-panel', 'reading-shell-study-feedback-card',
        'reading-shell-study-clue-button', 'reading-shell-evidence-highlight',
        'reading-shell-clue-badge',
    ]:
        assert token in JS


def test_task_type_labels_only_live_inside_the_strategy_panel():
    assert 'reading-shell-study-task-label' not in JS
    assert 'reading-shell-study-strategy' in JS
    assert "' strategy</h3>" in JS
    assert 'controls.append(strategyButton, revealButton)' in JS


def test_study_feedback_toggle_remains_available_after_revealing_a_group():
    show_group = CORE_JS.split("function showGroup(group)", 1)[1].split("function hideGroup(group)", 1)[0]
    sync_feedback = CORE_JS.split("function syncTaskFeedback()", 1)[1].split("function syncLegacyInlineAnswers()", 1)[0]
    assert 'control.revealButton.hidden = false;' in show_group
    assert 'control.revealButton.disabled = false;' in show_group
    assert 'control.revealButton.textContent = "Hide answers & feedback"' in show_group
    assert 'control.revealButton.hidden = reviewComplete || !inStudy;' in sync_feedback
    assert 'control.revealButton.disabled = reviewComplete || !inStudy;' in sync_feedback
    assert 'revealedGroups.has(group.id)' not in sync_feedback


def test_strategy_information_remains_available_after_completed_review():
    sync_feedback = CORE_JS.split("function syncTaskFeedback()", 1)[1].split("function syncLegacyInlineAnswers()", 1)[0]
    build_controls = CORE_JS.split("function buildTaskFeedbackControls()", 1)[1].split("function installStyles()", 1)[0]
    assert 'var showStrategies = inStudy || afterTest;' in sync_feedback
    assert 'control.strategyButton.hidden = !showStrategies;' in sync_feedback
    assert 'control.strategyButton.disabled = !showStrategies;' in sync_feedback
    assert 'control.strategyButton.hidden = reviewComplete' not in sync_feedback
    assert 'control.strategyButton.disabled = reviewComplete' not in sync_feedback
    assert 'if (reviewComplete) control.panel.hidden = true;' not in sync_feedback
    assert 'if (!showStrategies) {' in sync_feedback
    assert 'control.panel.hidden = true;' in sync_feedback
    assert 'control.strategyButton.setAttribute("aria-expanded", "false");' in sync_feedback
    assert build_controls.count('strategyButton.addEventListener("click"') == 1
    assert 'var opening = panel.hidden;' in build_controls
    assert 'panel.hidden = !opening;' in build_controls
    assert 'strategyButton.setAttribute("aria-expanded", opening ? "true" : "false");' in build_controls


def test_score_guide_remains_open_while_submitted_test_review_is_available():
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    dialog_helpers = CORE_JS.split("function closeDialog", 1)[1].split("function navigateTo", 1)[0]
    backdrop = CORE_JS.split("function backdrop", 1)[1].split("function buildScoreGuide", 1)[0]
    build_ui = CORE_JS.split("function buildUi()", 1)[1].split("function updateReviewFromOverlay()", 1)[0]
    assert 'var completedTest = mode === "test" && Boolean(config.state.isTestSubmitted());' in sync
    assert 'var showRoot = studyMode || completedTest;' in sync
    assert 'if (!studyMode) { studySessionActive = false; stopStudyTimer(); }' in sync
    assert 'if (!showRoot) { closeScoreGuide(false); closeAnswerKey(false); closeScoreFeedback(false); }' in sync
    assert 'if (!studyMode) { studySessionActive = false; stopStudyTimer(); closeScoreGuide(false); }' not in sync
    assert 'function openScoreGuide()' in dialog_helpers
    assert 'openDialog(elements.scoreGuideBackdrop, elements.scoreGuideClose);' in dialog_helpers
    assert 'function closeScoreGuide(restore)' in dialog_helpers
    assert build_ui.count('scoreGuideButton.addEventListener("click", openScoreGuide);') == 1
    assert build_ui.count('var scoreGuide = buildScoreGuide();') == 1
    assert 'dialog.setAttribute("role", "dialog");' in backdrop
    assert 'dialog.setAttribute("aria-labelledby", titleId);' in backdrop
    assert 'close.addEventListener("click", function () { closeFn(true); });' in backdrop
    assert 'if (event.target === shade) closeFn(true);' in backdrop
    assert 'if (event.key === "Escape")' in backdrop
    assert 'lastOpener.focus()' in dialog_helpers


def test_full_study_review_reveals_once_without_overriding_later_group_hides():
    assert 'var studyReviewJustSubmitted = currentMode() === "study" && isOpen && !reviewOverlayWasOpen;' in CORE_JS
    assert 'return studyReviewJustSubmitted;' in CORE_JS
    assert 'var studyReviewJustSubmitted = updateReviewFromOverlay();' in CORE_JS
    assert 'function refreshAllGroups() { taskGroups().forEach(showGroup); }' in CORE_JS
    assert 'if (result && studyReviewJustSubmitted) {' in CORE_JS
    assert CORE_JS.index('captureSubmittedOutcomes();') < CORE_JS.index('refreshAllGroups();')
    assert '} else if (result && completedTest) {' in CORE_JS
    assert 'revealAll();' in CORE_JS
    assert 'if (result && (studyReviewSubmitted || completedTest)) revealAll();' not in CORE_JS


def test_each_study_resubmission_rebuilds_current_group_results_and_cards():
    show_group = CORE_JS.split("function showGroup(group)", 1)[1].split("function hideGroup(group)", 1)[0]
    build_card = CORE_JS.split("function buildQuestionCard(questionNumber)", 1)[1].split("function showGroup(group)", 1)[0]
    assert 'control.result.textContent = scoreText(score) + " / " + group.questions.length + " correct";' in show_group
    assert 'group.questions.forEach(buildQuestionCard);' in show_group
    assert 'removeQuestionCard(questionNumber);' in build_card
    assert 'var user = answerFor(questionNumber);' in build_card
    assert 'var correct = correctFor(questionNumber);' in build_card
    assert 'var status = !user ? "unanswered" : correct ? "correct" : "incorrect";' in build_card


def test_legacy_inline_answers_are_suppressed_for_every_submitted_review():
    assert "global.document.querySelectorAll('.correct-answer-text[id^=\"ca-\"]')" in CORE_JS
    assert 'var hideLegacyAnswers = fullReviewAvailable();' in CORE_JS
    assert 'answer.hidden = hideLegacyAnswers;' in CORE_JS
    assert 'syncLegacyInlineAnswers();' in CORE_JS
    assert '.correct-answer-text[hidden]{display:none!important}' in CORE_JS
    helper = CORE_JS.split('function syncLegacyInlineAnswers()', 1)[1].split('function buildTaskFeedbackControls()', 1)[0]
    assert '.textContent =' not in helper
    assert '.remove()' not in helper


def test_blank_answers_are_never_treated_as_correct_in_study_feedback():
    assert "input[type=\"radio\"][name=\"q" in JS
    assert "input[type=\"text\"][name=\"q" in JS
    assert "if (!answer) return false" in JS
    assert '"Not answered · 0 points"' in JS
    assert "function rangeScore(group)" in JS


def test_core_shared_evidence_creates_every_matching_question_badge():
    for token in [
        'function sharedEvidenceQuestions(evidence, part)',
        'var details = questionDetails();',
        'sectionFor(candidate) === part && details[candidate][2] === evidence',
        '.sort(function (a, b) { return a - b; })',
        'function evidenceBadge(questionNumber)',
        'badge.setAttribute("data-reading-shell-clue-question", String(questionNumber));',
        'navigateTo(questionNumber)',
        'sharedEvidenceQuestions(evidence, part).forEach(function (relatedQuestion) { mark.append(evidenceBadge(relatedQuestion)); });',
    ]:
        assert token in CORE_JS
    assert 'clearEvidence(passage);' in CORE_JS
    assert 'questionNumber === 21' not in CORE_JS
    assert 'questionNumber === 22' not in CORE_JS
    evidence_pattern = r'^\s*{q}: \["(?:[^"\\]|\\.)*", "(?:[^"\\]|\\.)*", "((?:[^"\\]|\\.)*)"\]'
    evidence = {
        q: re.search(evidence_pattern.format(q=q), CORE_JS, re.M).group(1)
        for q in [21, 22, 30, 34]
    }
    assert evidence[21] == evidence[22]
    assert evidence[30] == evidence[34]
    test3_fallbacks = CORE_JS.split("var TEST3_GROUPS", 1)[1].split("var VARIANTS", 1)[0]
    assert "cambridge-16-academic-reading-test-4" not in test3_fallbacks
    assert "p1-diagram" not in test3_fallbacks


def test_study_controls_are_forced_hidden_in_test_mode():
    for token in [
        'function patchTestModeStudyControls()',
        'config.state.getMode()',
        'if (mode() === "study") {',
        'controls.style.display = "";',
        'window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function"',
        'controls.style.display = "none";',
        'button.hidden = true;',
        'button.disabled = true;',
        'panel.hidden = true;',
        'new MutationObserver(scheduleSync)',
    ]:
        assert token in LOADER_JS
    assert LOADER_JS.find('controls.style.display = "";') < LOADER_JS.find('controls.style.display = "none";')
    assert LOADER_JS.find('window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function"') < LOADER_JS.find('controls.style.display = "none";')


def test_parity_contract_protects_the_rules_learned_from_test1_and_test2():
    for rule in [
        "Test 1 and Test 2 are the visual and behavioural references.",
        "The shared layer must never create a second scoring implementation that can disagree with the test engine.",
        "A later `Show answers & feedback` rebuilds the cards using the student's current answers.",
        "A blank answer is always `Not answered · 0 points`.",
        "Duplicate inline `Correct answer:` feedback must not appear alongside the cards.",
        "Work on one question group at a time.",
    ]:
        assert rule in CONTRACT


def test_next_group_data_is_present_for_part1_summary_completion():
    assert 'id: "p1-summary"' in JS
    assert 'questions: [6, 7, 8, 9, 10, 11, 12, 13]' in JS
    for question_number in range(6, 14):
        assert f"{question_number}: [" in JS


def test_test3_groups_cover_every_question_without_engine_calls():
    for questions in [
        '[1, 2, 3, 4, 5]', '[6, 7, 8, 9, 10, 11, 12, 13]',
        '[14, 15, 16, 17, 18, 19]', '[20, 21, 22]', '[23, 24]',
        '[25, 26]', '[27, 28, 29, 30, 31, 32]', '[33, 34, 35, 36, 37]',
        '[38, 39, 40]',
    ]:
        assert questions in JS
    for forbidden in [
        'evaluateQuestions(', 'submitTest(', 'handlePrimarySubmit(', 'confirmSubmit(',
        'beginTimedTest(', 'requestFullscreen(', 'exitFullscreen(',
        'getChooseTwoCorrectCount(',
    ]:
        assert forbidden not in JS


def test_score_feedback_selects_current_task_type_strength_and_focus_from_production_core():
    groups = [
        {"id": "summary", "part": 1, "label": "Summary completion", "questions": [1, 2, 3, 4],
         "purpose": "Use grammar and meaning to complete the summary.", "steps": ["Predict the word type before scanning."],
         "trap": "Do not choose an option because one word looks familiar."},
        {"id": "ynng", "part": 1, "label": "Yes / No / Not Given", "questions": [5, 6, 7, 8],
         "purpose": "Compare each claim with the writer's position.", "steps": ["Check whether the writer agrees, disagrees, or gives no view."],
         "trap": "Do not confuse factual information with the writer's opinion."},
        {"id": "multiple-choice", "part": 1, "label": "Multiple choice", "questions": [9, 10, 11],
         "purpose": "Check the full meaning of every option.", "steps": ["Eliminate options that are only partly supported."],
         "trap": "Repeated vocabulary can hide a changed meaning."},
        {"id": "tiny", "part": 1, "label": "Tiny group", "questions": [12, 13],
         "purpose": "This group is too small.", "steps": ["It must not be selected."], "trap": "Ignore this group."},
    ]
    result = _run_score_feedback_harness(groups, [1, 2, 3, 4, 5, 9, 10], [1, 5, 6, 7, 8, 9, 10])
    assert result["first"]["strength"] == {
        "id": "summary", "label": "Summary completion", "correct": 4, "total": 4, "ratio": 1,
        "advice": "You handled Summary completion accurately. Use grammar and meaning to complete the summary.",
    }
    assert result["first"]["focus"]["id"] == "ynng"
    assert result["first"]["focus"]["correct"] == 1
    assert "writer agrees, disagrees, or gives no view" in result["first"]["focus"]["advice"]
    assert "factual information" in result["first"]["focus"]["advice"]
    assert result["provisional"] == result["first"]
    assert result["second"]["strength"]["id"] == "ynng"
    assert result["second"]["focus"]["id"] == "summary"
    assert result["second"]["strength"]["advice"] != result["first"]["strength"]["advice"]


def test_score_feedback_thresholds_neutral_fallback_and_stable_ties_are_protected():
    neutral_groups = [
        {"id": "a", "part": 1, "label": "Type A", "questions": [1, 2, 3, 4, 5], "purpose": "Purpose A.", "steps": ["Step A."], "trap": "Trap A."},
        {"id": "b", "part": 1, "label": "Type B", "questions": [6, 7, 8, 9, 10], "purpose": "Purpose B.", "steps": ["Step B."], "trap": "Trap B."},
    ]
    neutral = _run_score_feedback_harness(neutral_groups, [1, 2, 3, 6, 7, 8])["first"]
    assert neutral == {"strength": None, "focus": None}

    tie_groups = [
        {"id": "s3", "part": 1, "label": "S3", "questions": [1, 2, 3], "purpose": "S3.", "steps": ["S3."], "trap": "S3."},
        {"id": "s4-first", "part": 1, "label": "S4 first", "questions": [4, 5, 6, 7], "purpose": "S4.", "steps": ["S4."], "trap": "S4."},
        {"id": "s4-later", "part": 1, "label": "S4 later", "questions": [8, 9, 10, 11], "purpose": "S4.", "steps": ["S4."], "trap": "S4."},
        {"id": "f3", "part": 1, "label": "F3", "questions": [12, 13, 14], "purpose": "F3.", "steps": ["F3."], "trap": "F3."},
        {"id": "f4-first", "part": 1, "label": "F4 first", "questions": [15, 16, 17, 18], "purpose": "F4.", "steps": ["F4."], "trap": "F4."},
        {"id": "f4-later", "part": 1, "label": "F4 later", "questions": [19, 20, 21, 22], "purpose": "F4.", "steps": ["F4."], "trap": "F4."},
    ]
    tied = _run_score_feedback_harness(tie_groups, list(range(1, 12)))["first"]
    assert tied["strength"]["id"] == "s4-first"
    assert tied["focus"]["id"] == "f4-first"
    assert tied["strength"]["id"] != tied["focus"]["id"]


def test_score_feedback_rendering_is_semantic_specific_and_replaces_generic_part_advice():
    rendering = CORE_JS.split("function renderScoreFeedback()", 1)[1].split("function strategyMarkup", 1)[0]
    append_item = CORE_JS.split("function appendTaskTypeFeedback", 1)[1].split("function renderScoreFeedback", 1)[0]
    selection = CORE_JS.split("function rankFeedbackGroups", 1)[1].split("function strengthFeedbackAdvice", 1)[0]
    assert 'item.total >= 3' in selection
    assert 'item.ratio >= 0.75' in selection
    assert 'item.ratio < 0.60' in selection
    assert '(b.total - a.total) || (a.order - b.order)' in selection
    assert 'item.group !== strength.group' in selection
    assert 'el("h4", "reading-shell-score-feedback-subheading", title)' in append_item
    assert 'item.group.label + ": " + scoreText(item.correct) + " / " + item.total + " correct"' in append_item
    assert 'strengthFeedbackAdvice(item)' in append_item and 'focusFeedbackAdvice(item)' in append_item
    assert 'Your question-type performance in this part was mixed.' in rendering
    assert 'You answered most questions in this part accurately.' not in rendering
    assert 'Use the detailed Study feedback to compare your answer' not in rendering
    assert 'feedbackCard(body, "Time management")' in rendering


def test_score_feedback_uses_submitted_snapshot_and_refreshes_without_duplicate_listeners():
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    build_ui = CORE_JS.split("function buildUi()", 1)[1].split("function updateReviewFromOverlay()", 1)[0]
    assert 'captureSubmittedOutcomes();\n      refreshAllGroups();' in sync
    assert 'submittedOutcomeMode !== "test"' in sync
    assert 'if (!elements.scoreFeedbackBackdrop.hidden) renderScoreFeedback();' in sync
    assert 'submittedOutcomeFor(q)' in CORE_JS
    assert CORE_JS.count('scoreFeedbackButton.addEventListener("click", openScoreFeedback);') == 1
    assert build_ui.count('var scoreFeedback = buildScoreFeedback();') == 1
    assert 'body.textContent = "";' in CORE_JS.split("function renderScoreFeedback()", 1)[1].split("function strategyMarkup", 1)[0]


def test_test3_and_test4_feedback_groups_remain_data_isolated_and_test1_test2_are_unmodified():
    test4_data = (ROOT / "academic/cambridge-16/test-4/study-feedback.js").read_text(encoding="utf-8")
    test3_fallback = CORE_JS.split("var TEST3_GROUPS", 1)[1].split("var TEST3_DETAILS", 1)[0]
    assert 'id: "p1-tfng"' in test3_fallback
    assert 'id: "p1-diagram"' not in test3_fallback
    assert 'id: "p1-diagram"' in test4_data
    assert 'cambridge-16-academic-reading-test-4' not in CORE_JS
    assert 'taskGroups().map(feedbackGroupResult)' in CORE_JS
