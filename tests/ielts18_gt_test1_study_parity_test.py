from __future__ import annotations

import ast
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "general-training" / "cambridge-18" / "test-1"
HTML = TARGET / "IELTS18 Test 1 - Reading - GT.html"
ADAPTER = TARGET / "study-feedback.js"
DATA = TARGET / "study-feedback-data.js"


def _normal(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _js_string_values(source: str, key: str) -> list[str]:
    pattern = re.compile(rf'{re.escape(key)}:\s*"((?:\\.|[^"\\])*)"')
    values = []
    for match in pattern.finditer(source):
        values.append(ast.literal_eval('"' + match.group(1) + '"'))
    return values


def test_target_loads_one_study_adapter() -> None:
    html = HTML.read_text(encoding="utf-8")
    assert html.count('<script src="study-feedback.js"></script>') == 1


def test_feedback_data_covers_all_40_questions() -> None:
    data = DATA.read_text(encoding="utf-8")
    question_numbers = [int(value) for value in re.findall(r"^\s{6}(\d+):\s*\{", data, re.MULTILINE)]
    assert question_numbers == list(range(1, 41))
    assert data.count("explanation:") == 40
    assert data.count("skill:") == 40
    assert data.count("evidence:") == 40
    assert data.count("evidenceRoot:") == 40


def test_task_groups_cover_each_question_once() -> None:
    data = DATA.read_text(encoding="utf-8")
    arrays = re.findall(r"questions:\s*\[([0-9, ]+)\]", data)
    flattened: list[int] = []
    for array in arrays:
        flattened.extend(int(value.strip()) for value in array.split(",") if value.strip())
    assert sorted(flattened) == list(range(1, 41))
    assert len(flattened) == 40


def test_every_evidence_span_exists_in_target_html() -> None:
    html = _normal(HTML.read_text(encoding="utf-8"))
    data = DATA.read_text(encoding="utf-8")
    evidence = _js_string_values(data, "evidence")
    assert len(evidence) == 40
    missing = [value for value in evidence if _normal(value) not in html]
    assert missing == []


def test_general_training_contract_and_lifecycle_configuration() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    data = DATA.read_text(encoding="utf-8")
    assert 'partLabel: "Section"' in adapter
    assert "allowDomSubmittedResult: true" in adapter
    assert "completeQuestionCoverage: true" in adapter
    assert "completeClueCoverage: true" in adapter
    assert "showEvidenceText: false" in adapter
    assert 'if (Number(correct) <= 8) return "Below 3";' in adapter
    assert '{ correctAnswers: "0–8", band: "Below 3" }' in data
    assert 'sectionSingular: "Section"' in data


def test_custom_matching_has_visible_clear_and_final_lock_protection() -> None:
    html = HTML.read_text(encoding="utf-8")
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert html.count('class="passage-match-source"') == 6
    assert all(f'data-for="q{question}"' in html for question in range(8, 15))
    assert 'document.querySelectorAll(".gt-section1-clear")' in adapter
    assert 'document.querySelectorAll(".passage-match-source")' in adapter
    assert 'document.querySelectorAll(".drop-zone")' in adapter
    assert 'data-gt18-submitted-matching-guard' in adapter


def test_feedback_roots_and_instruction_hosts_are_declared() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    data = DATA.read_text(encoding="utf-8")
    roots = [
        "#text-s1-dry-cleaning",
        "#text-s1-groups",
        "#text-s2-lifting",
        "#text-s2-complaints",
        "#text-s3-storks",
    ]
    hosts = [
        "#study-instruction-s1-dry-cleaning",
        "#study-instruction-s1-groups",
        "#study-instruction-s2-lifting",
        "#study-instruction-s2-complaints",
        "#study-instruction-s3-headings",
        "#study-instruction-s3-summary",
        "#study-instruction-s3-mc",
    ]
    for selector in roots + hosts:
        assert selector in data
        assert selector.removeprefix("#") in adapter


def test_candidate_header_and_feedback_host_spacing_are_protected() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert 'candidate.textContent = name ? "Candidate: " + name : "";' in adapter
    assert "text-overflow:ellipsis" in adapter
    assert "white-space:nowrap" in adapter
    assert ".summary-feedbacks>.question-block.feedback-only{margin:0;padding:0;border:0;background:transparent}" in adapter


def test_existing_logo_home_and_animation_contract_is_preserved() -> None:
    html = HTML.read_text(encoding="utf-8")
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert 'onclick="confirmGoHome()"' in html
    assert 'window.location.href = "../../../index.html";' in html
    assert 'function initAnimatedLogo()' in html
    assert "logo-char" in html
    assert "is-animating" in html
    assert "prefers-reduced-motion: reduce" in html
    assert "prepareAnimatedLogo" not in adapter
    assert "gt18LogoReveal" not in adapter
