from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
TEST4_DIR = REPO_ROOT / "general-training" / "cambridge-19" / "test-4"
ADAPTER = TEST4_DIR / "study-feedback.js"
PAGE = TEST4_DIR / "IELTS19 Test 4 - Reading - GT.html"


def test_test4_uses_an_authoritative_submitted_result() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")

    assert "var submittedResultSnapshot = null;" in adapter
    assert "function captureSubmittedResult()" in adapter
    assert "getSubmittedResult: function () { return submittedResultSnapshot; }" in adapter
    assert "questionOutcomes: outcomes" in adapter
    assert "allowDomSubmittedResult" not in adapter


def test_test4_restores_learning_controls_only_after_submission() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")

    assert 'var activeTest = currentMode === "test" && !submittedTest;' in adapter
    assert 'document.body.setAttribute("data-gt-test-submitted", submittedTest ? "true" : "false");' in adapter
    assert "body[data-gt-mode=test][data-gt-test-submitted=false] .reading-shell-study-controls{display:none!important;}" in adapter
    assert "body[data-gt-mode=test][data-gt-test-submitted=true] .reading-shell-study-controls{display:inline-flex!important;}" in adapter


def test_test4_logo_has_a_working_live_hub_route() -> None:
    adapter = ADAPTER.read_text(encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")

    assert 'var HOME_URL = "../../../index.html";' in adapter
    assert 'logo.removeAttribute("onclick");' in adapter
    assert "window.confirmGoHome = confirmGoHome;" in adapter
    assert "installIeltsPabsHomeLink();" in adapter
    assert 'onclick="confirmGoHome()"' in page
