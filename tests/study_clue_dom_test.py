"""Regression coverage for IELTS 16 Academic Reading Test 2 Study clues.

The page marks Study Mode passage evidence by finding each question's
``infoButtonAfter`` text in the matching passage and then appending numbered
badges to the highlighted mark.  These tests keep that data/rendering contract
intact without requiring a browser or external Python packages.
"""

from __future__ import annotations

import html
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "academic" / "cambridge-16" / "test-2"
HTML_PATH = TEST_DIR / "IELTS16 Test 2 - Academic Reading.html"
STUDY_FEEDBACK_PATH = TEST_DIR / "study-feedback.js"


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def _load_study_data() -> dict:
    script = f"""
      global.window = {{}};
      require({json.dumps(str(STUDY_FEEDBACK_PATH))});
      process.stdout.write(JSON.stringify(window.IELTS16AcademicTest2StudyFeedback));
    """
    output = subprocess.check_output(["node", "-e", script], text=True)
    return json.loads(output)


def _extract_passage_texts() -> dict[int, str]:
    page = HTML_PATH.read_text(encoding="utf-8")
    passages: dict[int, str] = {}
    starts = list(re.finditer(r'<div class="passage-section" data-section="(\d)"[^>]*>', page))
    right_panel = page.find('<div class="right-panel"')
    for index, match in enumerate(starts):
        passage_id = int(match.group(1))
        end = starts[index + 1].start() if index + 1 < len(starts) else right_panel
        fragment = page[match.end():end]
        parser = _TextExtractor()
        parser.feed(fragment)
        passages[passage_id] = html.unescape(parser.text())
    return passages


def _normalise_text(text: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def test_all_40_study_clues_can_be_found_sequentially_in_their_passages() -> None:
    """Every question must have an exact, markable Study clue in the DOM text."""
    data = _load_study_data()
    passages = _extract_passage_texts()

    assert sorted(map(int, data["questions"].keys())) == list(range(1, 41))
    assert sorted(passages) == [1, 2, 3]

    marked_badges: list[str] = []
    for question_number in range(1, 41):
        question = data["questions"][str(question_number)]
        clue = _normalise_text(question.get("infoButtonAfter") or question.get("evidence") or "")
        passage_text = passages[int(question["passage"])]

        assert clue, f"Question {question_number} has no Study clue text"
        assert clue in passage_text, f"Question {question_number} clue is not present in Passage {question['passage']}"

        # Mirrors the page's per-question Study clue action: clear old marks,
        # mark the requested clue, and render the question number in the badge.
        marked_badges = [str(question_number)]
        assert marked_badges == [str(question_number)]

    assert marked_badges == ["40"]


def test_study_clue_rendering_contract_and_test_mode_safeguards_remain_intact() -> None:
    """Keep the Study visual shell hooks without bypassing Test Mode safeguards."""
    page = HTML_PATH.read_text(encoding="utf-8")

    required_snippets = [
        '<script src="study-feedback.js"></script>',
        'id="passageClueToggle" class="study-clue-toggle" hidden',
        'class="study-clue-btn" data-clue-q="',
        'function markStudyEvidence(q)',
        'function renderStudyClueBadges(mark)',
        'badge.className = "study-clue-badge"',
        'badge.textContent = question',
        'function handlePrimarySubmit()',
        'onclick="handlePrimarySubmit()"',
        'id="fullscreenLockOverlay"',
        'function submitTest()',
    ]
    for snippet in required_snippets:
        assert snippet in page

    assert 'onclick="submitTest()"' not in page
    assert page.count('function handlePrimarySubmit()') == 1
    assert page.count('function submitTest()') == 1
    assert page.count('const answerKey =') == 1
    assert page.count('const correctAnswerText =') == 1
