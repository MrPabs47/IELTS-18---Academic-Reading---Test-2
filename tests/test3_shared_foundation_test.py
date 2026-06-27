"""Static regression coverage for IELTS 16 Academic Reading Test 3 shared UI foundation."""

from pathlib import Path
import re

PAGE = Path("academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html")


def html() -> str:
    return PAGE.read_text(encoding="utf-8")


def test_test3_shared_top_bar_and_modals_are_present() -> None:
    text = html()
    assert 'id="studyModePill"' in text
    assert 'id="studyTimerContainer"' in text
    assert 'id="scoreGuideButton"' in text
    assert 'id="answerKeyButton"' in text
    assert 'id="topBarScoreStatus"' in text
    assert 'id="scoreGuideOverlay"' in text
    assert 'IELTS Academic Reading score guide' in text
    assert 'id="answerKeyOverlay"' in text
    assert 'id="scoreFeedbackOverlay"' in text


def test_test3_answer_key_uses_existing_key_objects_and_part_ranges() -> None:
    text = html()
    assert text.count('const answerKey =') == 1
    assert text.count('const correctAnswerText =') == 1
    assert '20: ["microorganisms", "micro-organisms"]' in text
    assert '38: ["warm", "warm winter"]' in text
    assert '40: ["mustard", "mustard plant", "mustard plants"]' in text
    assert '23: ["B", "C"]' in text and '24: ["B", "C"]' in text
    assert '25: ["A", "C"]' in text and '26: ["A", "C"]' in text
    assert '1: { from: 1, to: 13 }' in text
    assert '2: { from: 14, to: 26 }' in text
    assert '3: { from: 27, to: 40 }' in text
    assert 'for (let q = range.from; q <= range.to; q++)' in text


def test_test3_study_timer_and_no_fullscreen_enforcement_in_study_mode() -> None:
    text = html()
    study_branch = text[text.index('} else {\n        stopStudyTimer();'):text.index('document.getElementById("app").style.display = "block"')]
    assert 'startStudyTimer();' in study_branch
    assert 'showStudyChrome(true);' in study_branch
    assert 'fullScreenEnforcementEnabled = false;' in study_branch
    assert 'isTestRunning = false;' in study_branch
    test_branch = text[text.index('if (mode === "test") {'):text.index('} else {\n        stopStudyTimer();')]
    assert 'showStudyChrome(false);' in test_branch
    assert 'startStudyTimer();' not in test_branch


def test_test3_shared_overlays_have_escape_backdrop_and_focus_paths() -> None:
    text = html()
    assert 'closeSharedOverlays("scoreGuide")' in text
    assert 'closeSharedOverlays("answerKey")' in text
    assert 'closeSharedOverlays("scoreFeedback")' in text
    assert 'event.key === "Escape"' in text
    assert 'event.target !== overlay' in text
    assert 'lastScoreGuideOpener.focus()' in text
    assert 'lastAnswerKeyOpener.focus()' in text
    assert 'lastScoreFeedbackOpener.focus()' in text
    assert 'if (close) close.focus();' in text


def test_test3_score_feedback_is_part_totals_foundation_only() -> None:
    text = html()
    render = text[text.index('function renderScoreFeedbackPanel()'):text.index('function updateScoreStatus()')]
    assert 'Task-level Study Mode feedback, passage clues, and explanations will be added in a later PR.' in render
    assert 'latestScoreEvaluation.parts[part]' in render
    assert 'scoreFeedbackGroups' not in render
    assert 'What went well' not in render
    assert 'Focus next' not in render
    assert 'study-clue-btn' not in render
    assert 'focusStudyEvidence' not in render
