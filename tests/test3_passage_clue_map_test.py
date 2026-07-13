import html
import json
import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")
CORE = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
LOADER = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")


def _details():
    details = {}
    block = CORE.split("var TEST3_DETAILS = {", 1)[1].split("\n  };", 1)[0]
    for match in re.finditer(r"(?m)^\s*(\d+):\s*(\[.*\]),?$", block):
        details[int(match.group(1))] = json.loads(match.group(2))
    assert sorted(details) == list(range(1, 41))
    return details


def _passage_paragraphs():
    starts = list(re.finditer(r'<div class="passage-section" data-section="(\d)"[^>]*>', HTML))
    passage_end = HTML.index('<div class="divider" id="divider"></div>')
    passages = {}
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else passage_end
        body = HTML[match.end():end]
        paragraphs = []
        for paragraph in re.findall(r"<p(?:\s[^>]*)?>(.*?)</p>", body, re.S):
            text = re.sub(r"<[^>]+>", "", paragraph)
            paragraphs.append(html.unescape(text))
        passages[int(match.group(1))] = paragraphs
    assert sorted(passages) == [1, 2, 3]
    return passages


def _part_for(question):
    return 1 if question <= 13 else 2 if question <= 26 else 3


@dataclass
class Record:
    paragraph: int
    start: int
    end: int
    questions: list[int]


def _merged_records(part):
    details = _details()
    paragraphs = _passage_paragraphs()[part]
    records = []
    for question in range(1, 41):
        if _part_for(question) != part:
            continue
        evidence = details[question][2]
        locations = [(index, text.find(evidence)) for index, text in enumerate(paragraphs)]
        locations = [(index, start) for index, start in locations if start >= 0]
        assert locations, f"Q{question} evidence is missing from Part {part}"
        paragraph, start = locations[0]
        records.append(Record(paragraph, start, start + len(evidence), [question]))

    merged = []
    for record in sorted(records, key=lambda item: (item.paragraph, item.start, item.end, item.questions[0])):
        current = merged[-1] if merged and merged[-1].paragraph == record.paragraph else None
        if current and record.start < current.end:
            current.end = max(current.end, record.end)
            current.questions.extend(record.questions)
            current.questions = sorted(set(current.questions))
        else:
            merged.append(Record(record.paragraph, record.start, record.end, list(record.questions)))
    return paragraphs, merged


def _represented(merged):
    return sorted(question for record in merged for question in record.questions)


def _cycle_text(paragraphs, merged):
    rendered = []
    by_paragraph = {}
    for record in merged:
        by_paragraph.setdefault(record.paragraph, []).append(record)
    for paragraph_index, text in enumerate(paragraphs):
        cursor = 0
        pieces = []
        for record in sorted(by_paragraph.get(paragraph_index, []), key=lambda item: item.start):
            assert record.start >= cursor
            pieces.append(text[cursor:record.start])
            pieces.append(text[record.start:record.end])
            cursor = record.end
        pieces.append(text[cursor:])
        rendered.append("".join(pieces))
    return rendered


def test_each_complete_part_map_represents_every_question():
    assert _represented(_merged_records(1)[1]) == list(range(1, 14))
    assert _represented(_merged_records(2)[1]) == list(range(14, 27))
    assert _represented(_merged_records(3)[1]) == list(range(27, 41))


def test_identical_and_overlapping_locations_have_sorted_shared_badges():
    part2 = _merged_records(2)[1]
    part3 = _merged_records(3)[1]
    assert [record.questions for record in part2 if record.questions == [21, 22]] == [[21, 22]]
    assert [record.questions for record in part2 if record.questions == [18, 25]] == [[18, 25]]
    assert [record.questions for record in part3 if record.questions == [30, 34]] == [[30, 34]]
    assert all(record.questions == sorted(set(record.questions)) for record in part2 + part3)


def test_q36_and_q38_remain_separate_dom_locations():
    records = _merged_records(3)[1]
    q36 = next(record for record in records if 36 in record.questions)
    q38 = next(record for record in records if 38 in record.questions)
    assert q36 is not q38
    assert q36.paragraph != q38.paragraph or q36.end <= q38.start or q38.end <= q36.start


def test_merged_locations_never_nest_or_duplicate_passage_wording():
    for part in [1, 2, 3]:
        paragraphs, records = _merged_records(part)
        by_paragraph = {}
        for record in records:
            by_paragraph.setdefault(record.paragraph, []).append(record)
        for paragraph_records in by_paragraph.values():
            ordered = sorted(paragraph_records, key=lambda item: item.start)
            assert all(left.end <= right.start for left, right in zip(ordered, ordered[1:]))
        for _ in range(3):
            assert _cycle_text(paragraphs, records) == paragraphs


def test_production_renderer_is_dom_location_aware_and_reversible():
    for token in [
        "function locatePartEvidence(passage, part)",
        "function mergeLocationRecords(records)",
        "recordsByNode.has(record.node)",
        "record.start < current.end",
        "clearEvidence(passage);",
        "passage.normalize();",
        'mark.setAttribute("data-reading-shell-evidence-text", evidenceText);',
        'mark.setAttribute("data-reading-shell-clue-questions", record.questions.join(" "));',
        "record.questions.forEach(function (questionNumber) { mark.append(evidenceBadge(questionNumber)); });",
    ]:
        assert token in CORE
    assert "endsWith" not in CORE
    assert "startsWith" not in CORE


def test_full_map_state_is_independent_per_part_and_restored_on_switch():
    for token in [
        "var fullPassageClueMaps = new Set();",
        "fullPassageClueMaps.add(targetPart);",
        "fullPassageClueMaps.delete(targetPart);",
        "function restoreFullPassageClueMap(part)",
        "fullPassageClueMaps.has(part) && !fullMapIsRendered(part)",
        "restoreFullPassageClueMap(activeCluePart);",
        'toggle.setAttribute("aria-pressed", String(fullMapVisible));',
    ]:
        assert token in CORE
    assert 'if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") window.ReadingFeatureShell.sync();' in LOADER


def test_hide_all_clears_marks_and_badges_navigate_to_question():
    for token in [
        "function hideAllPassageClues(part)",
        "if (passage) clearEvidence(passage);",
        'badge.setAttribute("data-reading-shell-clue-question", String(questionNumber));',
        "navigateTo(questionNumber)",
        "showAllPassageClues: showAllPassageClues",
        "hideAllPassageClues: hideAllPassageClues",
    ]:
        assert token in CORE
