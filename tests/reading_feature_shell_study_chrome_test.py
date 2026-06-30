import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")


def test_shared_shell_assets_and_public_api_remain_available():
    assert HTML.count('../../shared/reading-feature-shell.css') == 1
    assert HTML.count('../../shared/reading-feature-shell.js') == 1
    assert HTML.count('id="readingFeatureShellMount"') == 1
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


def test_task_feedback_visibility_matches_study_and_test_rules():
    for token in [
        'config.state.getMode() === "study" && !studyReviewSubmitted',
        'var afterTest = currentMode() === "test" && Boolean(config.state.isTestSubmitted())',
        'control.strategyButton.hidden = !(inStudy || afterTest)',
        'control.revealButton.hidden = !(inStudy && !studyReviewSubmitted)',
        'if (result && (studyReviewSubmitted || completedTest)) revealAll()',
    ]:
        assert token in JS


def test_blank_answers_are_never_treated_as_correct_in_study_feedback():
    assert "input[type=\"radio\"][name=\"q" in JS
    assert "input[type=\"text\"][name=\"q" in JS
    assert "if (!answer) return false" in JS
    assert '"Not answered · 0 points"' in JS
    assert "function rangeScore(group)" in JS


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
