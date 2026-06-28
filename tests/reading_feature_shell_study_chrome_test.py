import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL_JS_PATH = ROOT / "academic/shared/reading-feature-shell.js"
SHELL_CSS_PATH = ROOT / "academic/shared/reading-feature-shell.css"
TEST3_PATH = ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html"

SHELL_JS = SHELL_JS_PATH.read_text(encoding="utf-8")
SHELL_CSS = SHELL_CSS_PATH.read_text(encoding="utf-8")
TEST3_HTML = TEST3_PATH.read_text(encoding="utf-8")

EXPECTED_SCORE_ROWS = [
    ("39–40", "9.0"),
    ("37–38", "8.5"),
    ("35–36", "8.0"),
    ("33–34", "7.5"),
    ("30–32", "7.0"),
    ("27–29", "6.5"),
    ("23–26", "6.0"),
    ("19–22", "5.5"),
    ("15–18", "5.0"),
    ("13–14", "4.5"),
    ("10–12", "4.0"),
    ("8–9", "3.5"),
    ("6–7", "3.0"),
    ("4–5", "2.5"),
    ("1–3", "1.0"),
    ("0", "0"),
]


def test_test3_loads_shared_assets_once_and_has_one_mount():
    assert TEST3_HTML.count('../../shared/reading-feature-shell.css') == 1
    assert TEST3_HTML.count('../../shared/reading-feature-shell.js') == 1
    assert TEST3_HTML.count('id="readingFeatureShellMount"') == 1


def test_mount_is_inside_existing_top_right_header_area_before_icons():
    top_bar = re.search(r'<header class="top-bar">(?P<body>.*?)</header>', TEST3_HTML, re.S)
    assert top_bar
    top_right = re.search(r'<div class="top-right">(?P<body>.*?)<div class="icon-group">', top_bar.group("body"), re.S)
    assert top_right
    assert '<div id="readingFeatureShellMount" aria-hidden="true"></div>' in top_right.group("body")
    assert top_right.group("body").find("readingFeatureShellMount") < top_right.group("body").find("timerContainer")


def test_shell_exposes_required_api():
    for api_name in ["init", "sync", "startStudySession", "getStatus", "validateConfig"]:
        assert re.search(rf"\b{api_name}\s*:\s*{api_name}\b", SHELL_JS)


def test_config_includes_exact_score_guide_data():
    assert 'title: "Academic Reading score guide"' in TEST3_HTML
    assert 'intro: "Your raw score out of 40 is converted using the scale below."' in TEST3_HTML
    rows = re.findall(r'\{ correctAnswers: "([^"]+)", band: "([^"]+)" \}', TEST3_HTML)
    assert rows == EXPECTED_SCORE_ROWS


def test_validate_config_requires_valid_study_score_guide_data():
    required_checks = [
        "config.study must be an object",
        "config.study.scoreGuide must be an object",
        "config.study.scoreGuide.title must be a non-empty string",
        "config.study.scoreGuide.intro must be a non-empty string",
        "config.study.scoreGuide.rows must be a non-empty array",
        "correctAnswers and band strings",
    ]
    for check in required_checks:
        assert check in SHELL_JS


def test_shell_uses_namespaced_classes_and_data_attributes_only():
    classes = re.findall(r"\.([A-Za-z_-][A-Za-z0-9_-]*)", SHELL_CSS)
    classes += [part for group in re.findall(r'className\s*=\s*"([^"]+)"', SHELL_JS) for part in group.split()]
    assert classes
    assert all(item.startswith("reading-shell-") for item in classes)
    data_attrs = re.findall(r"data-[A-Za-z0-9_-]+", SHELL_JS + "\n" + SHELL_CSS)
    assert data_attrs
    assert all(item.startswith("data-reading-shell-") for item in data_attrs)


def test_shell_has_no_generic_css_selectors_affecting_page():
    selector_text = "\n".join(
        part.split("{")[0].strip()
        for part in SHELL_CSS.split("}")
        if "{" in part
    )
    forbidden_selectors = ["body", "header", "button", ".top-right", ".pane", ".question-block", "#timerContainer"]
    for selector in forbidden_selectors:
        assert not re.search(rf"(^|[\s,]){re.escape(selector)}($|[\s,.:#>+~\[])", selector_text)


def test_visibility_matrix_branches_are_present():
    assert 'visibleInStudyBeforeChecking = currentMode === "study" && !submitted' in SHELL_JS
    assert 'visibleInStudyAfterChecking = currentMode === "study" && submitted' in SHELL_JS
    assert 'hiddenInTestBeforeSubmission = currentMode === "test" && !submitted' in SHELL_JS
    assert 'hiddenInTestAfterSubmission = currentMode === "test" && submitted' in SHELL_JS
    assert 'shouldShowStudyChrome = visibleInStudyBeforeChecking || visibleInStudyAfterChecking' in SHELL_JS
    assert 'hiddenInTestBeforeSubmission || hiddenInTestAfterSubmission || currentMode !== "study"' in SHELL_JS
    assert 'elements.root.hidden = !shouldShowStudyChrome' in SHELL_JS


def test_score_guide_is_study_only_and_hidden_by_default():
    assert 'root.hidden = true' in SHELL_JS
    assert 'overlay.hidden = true' in SHELL_JS
    assert 'guideButton.addEventListener("click", openScoreGuideDialog)' in SHELL_JS
    assert 'function openScoreGuideDialog()' in SHELL_JS
    assert 'elements.root.hidden) return' in SHELL_JS
    assert 'currentMode === "test"' in SHELL_JS


def test_score_guide_dialog_accessibility_and_close_behaviour():
    for required in [
        'role", "dialog"',
        'aria-modal", "true"',
        'aria-labelledby", "reading-shell-score-guide-title"',
        'closeButton.focus()',
        'event.key === "Escape"',
        'event.target === elements.overlay',
        'previouslyFocusedElement.focus()',
    ]:
        assert required in SHELL_JS
    assert 'document.addEventListener("click"' not in SHELL_JS


def test_study_timer_is_independent_and_prevents_duplicate_intervals():
    assert "studyIntervalId" in SHELL_JS
    assert "studyElapsedSeconds" in SHELL_JS
    assert "function stopStudyTimer()" in SHELL_JS
    assert "function startStudyTimer()" in SHELL_JS
    assert re.search(r"function startStudyTimer\(\) \{\s*stopStudyTimer\(\);", SHELL_JS)
    assert "global.setInterval" in SHELL_JS
    assert "global.clearInterval" in SHELL_JS
    for forbidden in ["timerId", "timerSeconds", "startTimer", "pauseTimer", "resumeTimer", 'aria-live']:
        assert forbidden not in SHELL_JS


def test_shell_does_not_read_answers_score_fullscreen_or_navigation():
    forbidden = [
        "querySelectorAll",
        "input[name",
        ".checked",
        "computeBandScore",
        "evaluateQuestions",
        "submitTest",
        "handlePrimarySubmit",
        "confirmSubmit",
        "beginTimedTest",
        "requestFullscreen",
        "exitFullscreen",
        "getQuestionTarget(",
        "buildQuestionNav",
        "goToQuestion",
        "showSection",
        "answerKey =",
        "correctAnswerText =",
    ]
    for token in forbidden:
        assert token not in SHELL_JS


def test_shell_has_no_later_learning_tool_implementation():
    forbidden = [
        "Answer " + "Key",
        "Score " + "Feedback",
        "feedback " + "card",
        "feedback" + "Cards",
        "magnifying " + "glass",
        "passage " + "clue" + " toolbar",
        "Show all " + "clues",
        "Clear " + "clues",
        "answerKey" + "Button",
        "topBar" + "ScoreStatus",
        "studyTimer" + "Container",
        "answerKey" + "Overlay",
        "scoreFeedback" + "Overlay",
    ]
    combined = SHELL_JS + "\n" + SHELL_CSS + "\n" + TEST3_HTML
    for token in forbidden:
        assert token not in combined
    assert "evi" + "dence" not in SHELL_JS
    assert "feedback" + "-card" not in SHELL_JS


def test_test3_integration_is_limited_to_start_test_notification():
    start_test = re.search(r'function startTest\(selectedMode\) \{(?P<body>.*?)\n    \}', TEST3_HTML, re.S)
    assert start_test
    body = start_test.group("body")
    assert "ReadingFeatureShell.startStudySession()" in body
    assert "ReadingFeatureShell.sync()" in body
    assert TEST3_HTML.count("ReadingFeatureShell.startStudySession()") == 1
    assert TEST3_HTML.count("ReadingFeatureShell.sync()") == 1


def test_invalid_config_logs_warning_and_returns_without_ui():
    assert 'global.console.warn("ReadingFeatureShell: " + validation.error)' in SHELL_JS
    invalid_branch = re.search(r'if \(!validation\.ok\) \{(?P<body>.*?)\n    \}', SHELL_JS, re.S)
    assert invalid_branch
    body = invalid_branch.group("body")
    assert "buildUi" not in body
    assert "addEventListener" not in body
    assert "startStudyTimer" not in body
