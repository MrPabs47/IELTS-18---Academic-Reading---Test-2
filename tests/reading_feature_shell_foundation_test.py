import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL_JS_PATH = ROOT / "academic/shared/reading-feature-shell.js"
SHELL_CSS_PATH = ROOT / "academic/shared/reading-feature-shell.css"
TEST3_PATH = ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html"

SHELL_JS = SHELL_JS_PATH.read_text(encoding="utf-8")
SHELL_CSS = SHELL_CSS_PATH.read_text(encoding="utf-8")
TEST3_HTML = TEST3_PATH.read_text(encoding="utf-8")


def test_shared_shell_files_exist():
    assert SHELL_JS_PATH.exists()
    assert SHELL_CSS_PATH.exists()


def test_shared_shell_exposes_expected_global_api():
    assert "global.ReadingFeatureShell" in SHELL_JS
    for api_name in ["init", "sync", "startStudySession", "getStatus", "validateConfig"]:
        assert re.search(rf"\b{api_name}\s*:\s*{api_name}\b", SHELL_JS)


def test_shell_uses_only_namespaced_future_dom_identifiers():
    class_names = re.findall(r"\.([A-Za-z_-][A-Za-z0-9_-]*)", SHELL_CSS)
    class_names += re.findall(r"class(?:Name)?\s*=\s*[\"']([^\"']+)[\"']", SHELL_JS)
    flattened_classes = []
    for class_group in class_names:
        flattened_classes.extend(class_group.split())
    assert flattened_classes
    assert all(name.startswith("reading-shell-") for name in flattened_classes)

    data_attrs = re.findall(r"data-[A-Za-z0-9_-]+", SHELL_JS + "\n" + SHELL_CSS)
    assert data_attrs
    assert all(attr.startswith("data-reading-shell-") for attr in data_attrs)



def test_shell_css_has_no_generic_selectors():
    forbidden_selectors = [
        "button", "body", "header", ".pane", ".top-right", ".question-block"
    ]
    selector_text = "\n".join(
        part.split("{")[0].strip()
        for part in SHELL_CSS.split("}")
        if "{" in part
    )
    for selector in forbidden_selectors:
        assert not re.search(rf"(^|[\s,]){re.escape(selector)}($|[\s,.:#>+~\[])", selector_text)



def test_test3_loads_local_shell_assets():
    assert '<link rel="stylesheet" href="../../shared/reading-feature-shell.css" />' in TEST3_HTML
    assert '<script src="../../shared/reading-feature-shell.js"></script>' in TEST3_HTML



def test_test3_has_one_hidden_mount_in_top_right():
    assert TEST3_HTML.count("readingFeatureShellMount") == 1
    top_right = re.search(r'<div class="top-right">(?P<body>.*?)<div class="icon-group">', TEST3_HTML, re.S)
    assert top_right
    assert '<div id="readingFeatureShellMount" aria-hidden="true"></div>' in top_right.group("body")



def test_test3_has_single_required_config_object():
    assert len(re.findall(r"window\.readingFeatureShellConfig\s*=\s*{", TEST3_HTML)) == 1
    for required in [
        'id: "cambridge-16-academic-reading-test-3"',
        'title: "IELTS 16 Academic Reading Test 3"',
        "totalQuestions: 40",
        "partRanges",
        "getMode: () => mode",
        "isTestSubmitted: () => testSubmitted",
        "getActivePart: () => activeSection",
        "getAnswerKeyDisplay",
        "correctAnswerText[questionNumber]",
        "getQuestionTarget: (questionNumber)",
        "getQuestionTarget(questionNumber)",
        "study: {",
        "scoreGuide: {",
    ]:
        assert required in TEST3_HTML



def test_test3_initialises_feature_shell_once():
    assert len(re.findall(r"ReadingFeatureShell\.init\(", TEST3_HTML)) == 1
    assert "DOMContentLoaded" in TEST3_HTML



def test_test3_has_no_copied_shell_control_identifiers():
    forbidden = [
        "scoreGuideButton",
        "answerKeyButton",
        "topBarScoreStatus",
        "studyModePill",
        "studyTimerContainer",
        "scoreGuideOverlay",
        "answerKeyOverlay",
        "scoreFeedbackOverlay",
        "passageClueToolbar",
    ]
    for token in forbidden:
        assert token not in TEST3_HTML



def test_shell_does_not_touch_test_engine_boundaries():
    forbidden = [
        "submitTest",
        "startTimer",
        "pauseTimer",
        "resumeTimer",
        "requestFullscreen",
        "computeBandScore",
        "evaluateQuestions",
        "handlePrimarySubmit",
        "confirmSubmit",
        "getChooseTwoCorrectCount",
        "enforceChooseTwoLimit",
    ]
    for token in forbidden:
        assert token not in SHELL_JS
