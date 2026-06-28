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
    for api_name in ["init", "getStatus", "validateConfig"]:
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



def test_test3_has_one_empty_hidden_mount():
    assert TEST3_HTML.count("readingFeatureShellMount") == 1
    assert re.search(
        r'<div\s+id="readingFeatureShellMount"\s+aria-hidden="true"\s*>\s*</div>',
        TEST3_HTML,
    )



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
    ]:
        assert required in TEST3_HTML



def test_test3_initialises_feature_shell_once():
    assert len(re.findall(r"ReadingFeatureShell\.init\(", TEST3_HTML)) == 1
    assert "DOMContentLoaded" in TEST3_HTML



def test_test3_has_no_visible_or_copied_shell_controls():
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



def test_shell_is_dormant_and_does_not_bind_interactive_listeners():
    assert "addEventListener" not in SHELL_JS
    assert "setInterval" not in SHELL_JS
    assert "setTimeout" not in SHELL_JS
    assert "querySelector" not in SHELL_JS
    assert "createElement" not in SHELL_JS
    assert ".innerHTML" not in SHELL_JS
    assert ".append" not in SHELL_JS
    assert "submitTest" not in SHELL_JS
    assert "startTimer" not in SHELL_JS
    assert "requestFullscreen" not in SHELL_JS
