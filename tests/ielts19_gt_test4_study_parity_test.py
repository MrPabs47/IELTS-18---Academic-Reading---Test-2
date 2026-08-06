from __future__ import annotations

import html as html_lib
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = REPO_ROOT / "general-training" / "cambridge-19" / "test-4"
HTML_PATH = TEST_DIR / "IELTS19 Test 4 - Reading - GT.html"
DATA_PATH = TEST_DIR / "study-feedback-data.js"
ADAPTER_PATH = TEST_DIR / "study-feedback.js"
ANSWERS_PATH = TEST_DIR / "Answers.txt"


def _load_feedback() -> dict:
    text = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"window\.IELTS19GTTest4StudyFeedback\s*=\s*(\{.*\});\s*\}\(\)\);", text, re.S)
    assert match, "Study feedback object was not found"
    # The generated object contains JSON-compatible syntax.
    return json.loads(match.group(1))


def _visible_text(source: str) -> str:
    without_scripts = re.sub(r"<script\b[^>]*>.*?</script>", " ", source, flags=re.S | re.I)
    without_styles = re.sub(r"<style\b[^>]*>.*?</style>", " ", without_scripts, flags=re.S | re.I)
    plain = re.sub(r"<[^>]+>", " ", without_styles)
    return re.sub(r"\s+", " ", html_lib.unescape(plain)).strip()


def test_official_q38_answer_and_band_floor() -> None:
    page = HTML_PATH.read_text(encoding="utf-8")
    answers = ANSWERS_PATH.read_text(encoding="utf-8")
    assert '38: "C"' in page
    assert re.search(r"^38 C$", answers, re.M)
    assert 'return "Below 3";' in page
    assert 'This result is below Band 3' in page


def test_shared_shell_and_gt_runtime_are_integrated() -> None:
    page = HTML_PATH.read_text(encoding="utf-8")
    adapter = ADAPTER_PATH.read_text(encoding="utf-8")
    assert '<script src="study-feedback.js"></script>' in page
    assert '<script src="../../shared/gt-reading-test-runtime.js"></script>' in page
    assert 'reading-feature-shell-core.js' in adapter
    assert 'gt-reading-exam-guards.js' in adapter
    assert 'cambridge-19-general-training-reading-test-4' in adapter
    assert 'candidateNameDisplay' in adapter


def test_all_questions_and_feedback_are_present() -> None:
    page = HTML_PATH.read_text(encoding="utf-8")
    data = _load_feedback()
    question_numbers = {int(value) for value in re.findall(r'data-q="(\d+)"', page)}
    assert question_numbers == set(range(1, 41))
    assert {int(value) for value in data["questions"]} == set(range(1, 41))
    covered = [question for group in data["taskGroups"] for question in group["questions"]]
    assert sorted(covered) == list(range(1, 41))
    assert len(covered) == len(set(covered))


def test_score_guide_matches_current_gt_contract() -> None:
    data = _load_feedback()
    rows = {(row["correctAnswers"], row["band"]) for row in data["scoreGuide"]["rows"]}
    assert ("40", "9") in rows
    assert ("39", "8.5") in rows
    assert ("0–8", "Below 3") in rows


def test_every_clue_exists_in_the_test_text() -> None:
    page_text = _visible_text(HTML_PATH.read_text(encoding="utf-8"))
    data = _load_feedback()
    missing = []
    for number, detail in data["questions"].items():
        evidence = re.sub(r"\s+", " ", detail["evidence"]).strip()
        if evidence not in page_text:
            missing.append((number, evidence))
    assert not missing, missing


def test_adapter_declares_all_text_roots_and_instruction_hosts() -> None:
    adapter = ADAPTER_PATH.read_text(encoding="utf-8")
    expected_roots = {
        "text-s1-cafes",
        "text-s1-frog",
        "text-s2-institute",
        "text-s2-scholarships",
        "text-s3-rewilding",
    }
    expected_hosts = {
        "study-instruction-s1-cafes",
        "study-instruction-s1-frog",
        "study-instruction-s2-institute",
        "study-instruction-s2-scholarships",
        "study-instruction-s3-summary",
        "study-instruction-s3-people",
        "study-instruction-s3-mc",
    }
    for item in expected_roots | expected_hosts:
        assert item in adapter


def test_test_mode_custom_controls_are_locked_after_submission() -> None:
    adapter = ADAPTER_PATH.read_text(encoding="utf-8")
    assert 'document.querySelectorAll(".passage-match-source")' in adapter
    assert 'document.querySelectorAll(".drop-zone")' in adapter
    assert 'document.querySelectorAll(".gt-section1-clear,.clear-drop-btn")' in adapter
    assert 'if (mode === "test") lockSubmittedTest();' in adapter
