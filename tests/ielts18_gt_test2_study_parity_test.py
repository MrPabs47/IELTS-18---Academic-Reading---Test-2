from __future__ import annotations

import ast
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "general-training" / "cambridge-18" / "test-2"
HTML = TARGET / "IELTS18 Test 2 - Reading - GT.html"
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


def test_task_groups_cover_each_question_once_and_use_section_wide_clue_roots() -> None:
    data = DATA.read_text(encoding="utf-8")
    arrays = re.findall(r"questions:\s*\[([0-9, ]+)\]", data)
    flattened: list[int] = []
    for array in arrays:
        flattened.extend(int(value.strip()) for value in array.split(",") if value.strip())
    assert sorted(flattened) == list(range(1, 41))
    assert len(flattened) == 40
    assert data.count("controlHost:") == 7
    assert data.count('textId: "s1-section"') == 2
    assert data.count('textId: "s2-section"') == 2
    assert data.count('textId: "s3-clothkits"') == 3


def test_every_evidence_span_exists_in_target_html() -> None:
    html = _normal(HTML.read_text(encoding="utf-8"))
    data = DATA.read_text(encoding="utf-8")
    evidence = _js_string_values(data, "evidence")
    assert len(evidence) == 40
    missing = [value for value in evidence if _normal(value) not in html]
    assert missing == []


def test_general_training_contract_uses_authoritative_submitted_snapshot() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    data = DATA.read_text(encoding="utf-8")
    assert 'partLabel: "Section"' in adapter
    assert "completeQuestionCoverage: true" in adapter
    assert "completeClueCoverage: true" in adapter
    assert "showEvidenceText: false" in adapter
    assert "clueTargets: shellData.clues" in adapter
    assert "captureSubmittedResult()" in adapter
    assert "submittedResultSnapshot" in adapter
    assert "questionOutcomes" in adapter
    assert "getSubmittedResult: getSubmittedResultSnapshot" in adapter
    assert "allowDomSubmittedResult" not in adapter
    assert 'if (Number(correct) <= 8) return "Below 3";' in adapter
    assert '{ correctAnswers: "0–8", band: "Below 3" }' in data


def test_matching_controls_cover_both_matching_tasks_and_lock_after_test() -> None:
    html = HTML.read_text(encoding="utf-8")
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert html.count('class="passage-match-source"') == 12
    assert all(f'data-for="q{question}"' in html for question in [*range(1, 9), *range(28, 32)])
    assert "function ensureSectionThreeClearControls()" in adapter
    assert "[28, 29, 30, 31]" in adapter
    assert 'document.querySelectorAll(".passage-match-source,.drag-item")' in adapter
    assert 'document.querySelectorAll(".drop-zone")' in adapter
    assert 'document.querySelectorAll(".gt-section1-clear")' in adapter
    assert "data-gt18-test2-submitted-matching-guard" in adapter


def test_feedback_roots_instruction_hosts_and_summary_spacing_are_declared() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    for root in [
        "text-s1-section",
        "text-s2-section",
        "text-s3-clothkits",
    ]:
        assert root in adapter
    for host in [
        "study-instruction-s1-sleeping-bags",
        "study-instruction-s1-life-writing",
        "study-instruction-s2-employee-health",
        "study-instruction-s2-kitchen",
        "study-instruction-s3-paragraphs",
        "study-instruction-s3-mc",
        "study-instruction-s3-summary",
    ]:
        assert host in adapter
    assert ".summary-feedbacks>.question-block.feedback-only{margin:0;padding:0;border:0;background:transparent}" in adapter
    assert "[36, 37, 38, 39, 40]" in adapter


def test_header_and_internal_modal_overflow_regression_is_protected() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert 'candidate.textContent = name ? "Candidate: " + name : "";' in adapter
    assert "text-overflow:ellipsis" in adapter
    assert ".gt18-test2-header-right{gap:12px;min-width:0;flex:0 0 auto}" in adapter
    assert ".reading-shell-score-guide-backdrop" in adapter
    assert "white-space:normal" in adapter
    assert ".reading-shell-score-guide-scroll" in adapter
    assert ".reading-shell-score-feedback-card{min-width:0}" in adapter
    assert "overflow-wrap:anywhere" in adapter
    assert ".gt18-test2-header-right{gap:12px;min-width:0;flex:0 0 auto;white-space:nowrap}" not in adapter
    assert "@media(max-width:600px)" in adapter
    assert ".top-bar{height:126px;padding:0 10px}.main-area{top:126px}" in adapter
    assert "#readingFeatureShellMount{align-items:center;display:flex;height:66px;justify-content:center;left:8px;min-width:0;position:absolute;right:8px;top:56px}" in adapter
    assert ".icon-group>span.icon{display:none}" in adapter
    assert "#fullscreenBtnLabel{display:none}" in adapter
    assert "#candidateNameDisplay{max-width:82px}" in adapter
    assert "function positionScoreFeedbackButton()" in adapter
    assert 'candidate.insertAdjacentElement("afterend", button)' in adapter
    assert 'root.appendChild(button)' in adapter
    assert '[/performance by part/g, "performance by section"]' in adapter
    assert "function activeTextIdForPart(part)" in adapter
    assert "getActiveTextId: activeTextIdForPart" in adapter
    assert "window.highlightCurrentQuestion = function ()" in adapter
    assert "group.questions.indexOf(question) !== -1" in adapter
    assert "function prepareStructuredGroupAnchors()" in adapter
    assert 'box.classList.add("summary-box")' in adapter


def test_existing_logo_home_and_animation_contract_is_preserved() -> None:
    html = HTML.read_text(encoding="utf-8")
    assert 'onclick="confirmGoHome()"' in html
    assert 'window.location.href = "../../../index.html";' in html
    assert "function initAnimatedLogo()" in html
    assert "logo-char" in html
    assert "is-animating" in html
    assert "prefers-reduced-motion: reduce" in html


def test_official_cambridge_source_cleanup_is_preserved() -> None:
    html = HTML.read_text(encoding="utf-8")
    p1 = (TARGET / "Passage 1.txt").read_text(encoding="utf-8")
    p2 = (TARGET / "Passage 2.txt").read_text(encoding="utf-8")
    p3 = (TARGET / "Passage 3.txt").read_text(encoding="utf-8")
    questions = (TARGET / "Questions.txt").read_text(encoding="utf-8")
    combined = "\n".join([html, p1, p2, p3])
    for bad in [
        "no—frills", "animal—themed", "non fiction", "meeting With an editor",
        "chefs” shirts", "To this end. staff", "they out different types of food",
        "must not tw to fix", "kitchen. they must have clear labels", "Sew-your—own",
        "experiment With colour", "trousers. in her late twenties", "mass- producing",
    ]:
        assert bad not in combined
    assert "A home-sewing revival: the return of Clothkits" in html
    assert "A home-sewing revival: the return of Clothkits" in p3
    assert "The regulation chefs’ shirts" in html
    assert "each time they cut different types of food" in p2
    assert "staff must not try to fix them themselves" in p2
    assert "‘Making your own clothes gives you a greater appreciation" in p3
    assert "SECTION 2 Questions 15—27" in questions
    assert " A Its designs represented the attitudes of the time." in questions
    assert "Complete the summary below." in questions


def test_section_wide_clues_and_structured_strategy_anchors_are_declared() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    data = DATA.read_text(encoding="utf-8")
    assert 'setTextIdentity(s1, "text-s1-section")' in adapter
    assert 'setTextIdentity(s2, "text-s2-section")' in adapter
    assert data.count('textId: "s1-section"') == 2
    assert data.count('textId: "s2-section"') == 2
    assert 'document.querySelectorAll("#questionContent .note-completion-box,#questionContent .summary-completion-box")' in adapter
    assert 'box.classList.add("summary-box")' in adapter


def test_score_feedback_returns_to_candidate_row_on_desktop_with_mobile_fallback() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    assert "function positionScoreFeedbackButton()" in adapter
    assert 'window.matchMedia("(max-width: 600px)").matches' in adapter
    assert 'candidate.insertAdjacentElement("afterend", button)' in adapter
    assert 'if (root && button.parentElement !== root) root.appendChild(button);' in adapter
    assert 'window.addEventListener("resize", positionScoreFeedbackButton);' in adapter
