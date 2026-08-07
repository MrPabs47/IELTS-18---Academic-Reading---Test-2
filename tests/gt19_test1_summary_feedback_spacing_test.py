from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ADAPTER = REPO_ROOT / "general-training" / "cambridge-19" / "test-1" / "study-feedback.js"


def test_summary_feedback_hosts_collapse_without_affecting_other_questions() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    scoped_selector = (
        '#questionContent > div[data-section="3"] '
        '.summary-feedbacks > .question-block.feedback-only'
    )

    assert 'id="gt19Test1SummaryFeedbackSpacing"' in adapter
    assert scoped_selector in adapter
    assert f"{scoped_selector}{{margin:0;padding:0;border:0;background:transparent}}" in adapter

    # The repair must remain local to Test 1, Section 3 and its summary feedback hosts.
    assert '.question-block.feedback-only{margin:0' not in adapter.replace(scoped_selector, "")
    assert 'body .feedback-only{margin:0' not in adapter
