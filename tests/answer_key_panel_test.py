"""Static regression coverage for IELTS 16 Academic Reading answer-key panels."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    ROOT / "academic" / "cambridge-16" / "test-1" / "IELTS16 Test 1 - Academic Reading.html",
    ROOT / "academic" / "cambridge-16" / "test-2" / "IELTS16 Test 2 - Academic Reading.html",
]


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _extract_object(page: str, name: str) -> str:
    match = re.search(rf"const\s+{name}\s*=\s*{{(.*?)^\s*}};", page, re.S | re.M)
    assert match, f"Missing {name} object"
    return match.group(1)


def _object_keys(body: str) -> list[int]:
    return [int(key) for key in re.findall(r"^\s*(\d+)\s*:", body, re.M)]


def test_answer_key_controls_and_empty_panel_shells_exist() -> None:
    for path in PAGES:
        page = _read(path)
        assert 'id="scoreGuideButton"' in page
        assert 'id="answerKeyButton"' in page
        assert page.index('id="scoreGuideButton"') < page.index('id="answerKeyButton"')
        assert 'onclick="openAnswerKeyPanel()"' in page
        assert 'aria-controls="answerKeyOverlay"' in page
        assert 'id="answerKeyOverlay"' in page
        assert 'Answer key' in page
        assert 'Correct answers for Questions 1–40' in page
        assert 'id="answerKeyGrid"' in page
        assert re.search(r'<div id="answerKeyGrid"[^>]*></div>', page), "Panel shell should not contain pre-rendered answers"


def test_answer_key_visibility_rules_are_wired() -> None:
    for path in PAGES:
        page = _read(path)
        assert 'return mode === "study" || (mode === "test" && testSubmitted);' in page
        assert 'button.hidden = !available;' in page
        assert 'button.disabled = !available;' in page
        assert 'button.tabIndex = available ? 0 : -1;' in page
        assert 'if (!available) closeAnswerKeyPanel(false);' in page
        assert 'updateAnswerKeyVisibility();' in page


def test_answer_key_renders_40_canonical_answers_in_13_13_14_sections() -> None:
    for path in PAGES:
        page = _read(path)
        answer_key = _extract_object(page, "answerKey")
        correct_text = _extract_object(page, "correctAnswerText")
        assert _object_keys(answer_key) == list(range(1, 41))
        assert _object_keys(correct_text) == list(range(1, 41))
        assert 'const display = correctAnswerText[questionNumber];' in page
        assert 'const canonical = answerKey[questionNumber];' in page
        assert 'for (let q = range.from; q <= range.to; q++)' in page
        assert '1: { from: 1, to: 13 }' in page
        assert '2: { from: 14, to: 26 }' in page
        assert '3: { from: 27, to: 40 }' in page
        assert 'heading.textContent = "Part " + part + ": Questions " + range.from + "–" + range.to;' in page


def test_answer_key_panel_is_neutral_reference_only() -> None:
    banned = [
        "learner-answer",
        "Your answer",
        "Correct/incorrect",
        "Incorrect",
        "green",
        "red",
        "score comparison",
    ]
    for path in PAGES:
        page = _read(path)
        panel_code = page[page.index('function renderAnswerKeyPanel') : page.index('function clearAnswerKeyPanel')]
        for phrase in banned:
            assert phrase not in panel_code
        assert 'current-score-row' not in panel_code
        assert 'correctCount' not in panel_code
        assert 'evaluateQuestions' not in panel_code


def test_answer_click_navigation_does_not_check_or_reveal_answers() -> None:
    forbidden_calls = [
        'submitTest(',
        'handlePrimarySubmit(',
        'evaluateQuestions(',
        'showStudyGroup(',
        'focusClue(',
        'focusMarkedStudyEvidence(',
        'renderTfngFeedbackCards(',
    ]
    for path in PAGES:
        page = _read(path)
        nav_code = page[page.index('function focusQuestionFromAnswerKey') : page.index('document.addEventListener("click", (event) => {')]
        assert 'closeAnswerKeyPanel(false);' in nav_code
        assert 'switchSection(section);' in nav_code
        assert 'scrollIntoView' in nav_code
        assert 'focused-question-flash' in nav_code
        for call in forbidden_calls:
            assert call not in nav_code


def test_escape_overlay_click_reset_and_mode_switch_close_panel() -> None:
    for path in PAGES:
        page = _read(path)
        assert 'event.key === "Escape" && overlay && overlay.style.display === "flex") closeAnswerKeyPanel();' in page
        assert 'event.target === overlay) closeAnswerKeyPanel();' in page
        assert 'function startTest(selectedMode)' in page
        assert 'closeAnswerKeyPanel(false);' in page
