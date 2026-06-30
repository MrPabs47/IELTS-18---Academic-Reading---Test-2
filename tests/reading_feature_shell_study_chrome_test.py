import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")
CSS = (ROOT / "academic/shared/reading-feature-shell.css").read_text(encoding="utf-8")
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")


def test_shared_chrome_assets_api_and_score_scale_are_present():
    assert HTML.count('../../shared/reading-feature-shell.css') == 1
    assert HTML.count('../../shared/reading-feature-shell.js') == 1
    assert HTML.count('id="readingFeatureShellMount"') == 1
    for name in ["init", "sync", "startStudySession", "getStatus", "validateConfig"]:
        assert re.search(rf"\b{name}\s*:\s*{name}\b", JS)
    rows = re.findall(r'\{ correctAnswers: "([^"]+)", band: "([^"]+)" \}', HTML)
    assert rows == [
        ("39–40", "9.0"), ("37–38", "8.5"), ("35–36", "8.0"),
        ("33–34", "7.5"), ("30–32", "7.0"), ("27–29", "6.5"),
        ("23–26", "6.0"), ("19–22", "5.5"), ("15–18", "5.0"),
        ("13–14", "4.5"), ("10–12", "4.0"), ("8–9", "3.5"),
        ("6–7", "3.0"), ("4–5", "2.5"), ("1–3", "1.0"), ("0", "0"),
    ]


def test_header_controls_match_the_current_test3_contract():
    for value in [
        '"📊 Score guide"', '"🔑"', '"Study mode"', '"Study time: "',
        '"Score feedback"', 'aria-label", "Answer Key"',
        'aria-label", "Close score guide"', 'aria-label", "Close answer key"',
        'aria-label", "Close score feedback"',
    ]:
        assert value in JS
    assert JS.find('scoreButton = createElement') < JS.find('answerButton = createElement') < JS.find('studyPill = createElement')
    assert 'reading-shell-score-guide-button' in CSS
    assert 'border-radius:999px' in CSS


def test_task_feedback_has_all_test3_question_groups_and_is_study_only():
    assert 'TEST3_TASK_GROUPS' in JS
    for label in [
        'True / False / Not Given', 'One-word summary completion',
        'Matching information', 'Choose two statements', 'Sentence completion',
    ]:
        assert label in JS
    for required in [
        '"Show answers & feedback"', '"Hide answers & feedback"',
        '"Correct answers"', '"How to tackle this task"',
        'function buildTaskFeedbackControls()', 'function syncTaskFeedback()',
        'config.state.getMode() === "study"',
        'reading-shell-study-task-control',
        'reading-shell-study-task-toggle',
        'reading-shell-study-task-panel',
    ]:
        assert required in JS


def test_task_feedback_uses_existing_test3_result_states_without_engine_calls():
    assert 'config.answers.getAnswerKeyDisplay(questionNumber)' in JS
    assert 'config.navigation.getQuestionTarget(questionNumber)' in JS
    assert 'partial-correct' in JS
    for forbidden in [
        'computeBandScore', 'evaluateQuestions', 'submitTest', 'handlePrimarySubmit',
        'confirmSubmit', 'beginTimedTest', 'requestFullscreen',
        'getChooseTwoCorrectCount', 'enforceChooseTwoLimit',
    ]:
        assert forbidden not in JS


def test_test3_handoff_remains_limited_to_the_existing_start_notifications():
    assert re.search(r'function startTest\(selectedMode\) \{(?P<body>.*?)\n    \}', HTML, re.S)
    assert HTML.count('ReadingFeatureShell.startStudySession()') == 1
    assert HTML.count('ReadingFeatureShell.sync()') == 1
