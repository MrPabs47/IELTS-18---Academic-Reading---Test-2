import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER_JS = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")
CORE_JS = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
JS = CORE_JS + "\n" + LOADER_JS
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")
CONTRACT = (ROOT / "academic/shared/READING_FEEDBACK_PARITY_CONTRACT.md").read_text(encoding="utf-8")


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
        '"How to tackle this task"', '"Correct answer"',
        '"Your answer"', '"Why"', '"Skill"', '"Passage clue"',
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
    for token in [
        'if (currentMode() !== "study") return;',
        'control.revealButton.hidden = !inStudy;',
        'control.revealButton.disabled = !inStudy;',
        'control.revealButton.textContent = "Hide answers & feedback"',
        'control.revealButton.hidden = false;',
        'control.revealButton.disabled = false;',
    ]:
        assert token in JS
    assert 'control.revealButton.hidden = !(inStudy && !studyReviewSubmitted)' not in JS


def test_blank_answers_are_never_treated_as_correct_in_study_feedback():
    assert "input[type=\"radio\"][name=\"q" in JS
    assert "input[type=\"text\"][name=\"q" in JS
    assert "if (!answer) return false" in JS
    assert '"Not answered · 0 points"' in JS
    assert "function rangeScore(group)" in JS


def test_shared_evidence_keeps_every_question_badge_for_the_same_clue():
    for token in [
        'snapshotVisibleEvidence',
        'data-reading-shell-clue-question',
        'entry.evidence && entry.evidence === evidence',
        'entry.questions.forEach(function (question) { ensureBadge(currentMark, question); })',
        'document.addEventListener("click"',
        '}, true);',
    ]:
        assert token in LOADER_JS
    assert 'clearEvidence(passage);' in CORE_JS


def test_study_controls_are_forced_hidden_in_test_mode():
    for token in [
        'function patchTestModeStudyControls()',
        'config.state.getMode()',
        'if (mode() === "study") return;',
        'controls.style.display = "none";',
        'button.hidden = true;',
        'button.disabled = true;',
        'panel.hidden = true;',
        'new MutationObserver(scheduleSync)',
    ]:
        assert token in LOADER_JS


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
