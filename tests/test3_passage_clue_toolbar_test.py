import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")
CORE = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
CSS = (ROOT / "academic/shared/reading-feature-shell.css").read_text(encoding="utf-8")


def _function_body(name):
    match = re.search(rf"function\s+{name}\s*\([^)]*\)\s*{{", HTML)
    assert match, f"Missing function {name}"
    start = match.end() - 1
    depth = 0
    for index in range(start, len(HTML)):
        if HTML[index] == "{":
            depth += 1
        elif HTML[index] == "}":
            depth -= 1
            if depth == 0:
                return HTML[start + 1:index]
    raise AssertionError(f"Could not parse function {name}")


def test_canonical_passage_header_and_toolbar_exist_once():
    assert HTML.count('id="passageHeaderLine"') == 1
    assert HTML.count('id="passageClueToolbar"') == 1
    assert HTML.count('id="passageClueToggle"') == 1
    header = re.search(r'<div class="pane-header" id="passageHeader">(?P<body>.*?)</div>\s*<div class="pane-content"', HTML, re.S)
    assert header
    assert header.group("body").find('id="passageHeaderLine"') < header.group("body").find('id="passageClueToolbar"')


def test_single_toggle_supports_both_labels_and_pressed_state():
    assert "Show all passage clues" in HTML
    assert "Show all passage clues" in CORE
    assert "Hide all passage clues" in CORE
    assert 'aria-pressed="false"' in HTML
    assert 'toggle.setAttribute("aria-pressed", String(fullMapVisible));' in CORE
    assert 'toggle.textContent = fullMapVisible ? "Hide all passage clues" : "Show all passage clues";' in CORE


def test_visibility_contract_covers_study_active_test_and_submitted_test():
    assert 'var studyMode = mode === "study";' in CORE
    assert 'var completedTest = mode === "test" && Boolean(config.state.isTestSubmitted());' in CORE
    assert "var showRoot = studyMode || completedTest;" in CORE
    assert "syncPassageClueToolbar(showRoot);" in CORE
    for token in [
        "toolbar.hidden = !showToolbar;",
        "toggle.hidden = !showToolbar;",
        "toggle.disabled = !showToolbar;",
        'toggle.setAttribute("aria-hidden", showToolbar ? "false" : "true");',
    ]:
        assert token in CORE


def test_part_switching_updates_header_line_without_replacing_toolbar():
    update_counts = _function_body("updateCounts")
    assert 'document.getElementById("passageHeaderLine")' in update_counts
    assert 'document.getElementById("passageHeader")' not in update_counts
    assert "pHeaderLine.textContent" in update_counts
    assert "pHeader.textContent" not in update_counts
    switch_section = _function_body("switchSection")
    assert "updateCounts();" in switch_section
    assert "passageHeader" not in switch_section
    assert "passageClueToolbar" not in switch_section


def test_shared_css_matches_reference_desktop_hierarchy():
    for token in [
        "#passageHeader{",
        "grid-template-columns:minmax(0,1fr) auto",
        "#passageHeaderLine{",
        "#passageClueToolbar{",
        "justify-content:flex-end",
        "min-width:max-content",
    ]:
        assert token in CSS


def test_toolbar_and_clue_map_remain_separate_from_scoring_engine():
    toolbar_code = CORE.split("function questionsForPart", 1)[1].split("function showGroup", 1)[0]
    for forbidden in [
        "evaluateQuestions", "submitTest", "handlePrimarySubmit", "confirmSubmit",
        "answerKey", "correctAnswerText", "getChooseTwoCorrectCount",
    ]:
        assert forbidden not in toolbar_code
