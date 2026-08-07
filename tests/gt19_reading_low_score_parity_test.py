import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
GT19_ROOT = REPO_ROOT / "general-training" / "cambridge-19"
SHARED_CORE = REPO_ROOT / "academic" / "shared" / "reading-feature-shell-core.js"

EXPECTED_DESCRIPTOR = (
    "This result is below Band 3 on the current General Training Reading score guide. "
    "Focus on locating explicit details, recognising paraphrases and following word limits."
)


def page(test_number: int) -> Path:
    return GT19_ROOT / f"test-{test_number}" / f"IELTS19 Test {test_number} - Reading - GT.html"


def score_data(test_number: int) -> Path:
    return GT19_ROOT / f"test-{test_number}" / "study-feedback-data.js"


def compute_band_function(html: str) -> str:
    match = re.search(r"function computeBandScore\(correct\) \{(.*?)(?=\n\s*function\s)", html, re.S)
    assert match, "computeBandScore() not found"
    return match.group(1)


def test_all_four_tests_use_the_same_string_band_contract() -> None:
    expected_returns = ["9", "8.5", "8", "7.5", "7", "6.5", "6", "5.5", "5", "4.5", "4", "3.5", "3", "Below 3"]
    for test_number in range(1, 5):
        html = page(test_number).read_text(encoding="utf-8")
        function = compute_band_function(html)
        for band in expected_returns:
            assert f'return "{band}";' in function, f"Test {test_number} must return band {band!r} as a string"
        assert "return 2.5;" not in function
        assert "return 1;" not in function
        assert "return 0;" not in function


def test_all_four_score_guides_show_zero_to_eight_as_below_3() -> None:
    row_pattern = re.compile(
        r'["\']?correctAnswers["\']?\s*:\s*["\']0–8["\']\s*,\s*'
        r'["\']?band["\']?\s*:\s*["\']Below 3["\']'
    )
    for test_number in range(1, 5):
        data = score_data(test_number).read_text(encoding="utf-8")
        assert row_pattern.search(data), f"Test {test_number} score guide must map 0–8 to Below 3"


def test_all_four_results_use_the_same_low_score_descriptor_and_gt_label() -> None:
    for test_number in range(1, 5):
        html = page(test_number).read_text(encoding="utf-8")
        assert EXPECTED_DESCRIPTOR in html
        assert 'level: "Developing user"' in html
        assert '"Estimated IELTS General Training Reading band: " +' in html


def test_dom_submitted_result_fallback_accepts_below_3() -> None:
    core = SHARED_CORE.read_text(encoding="utf-8")
    assert 'var belowBandThree = /band:\\s*Below 3\\b/i.test(bandText);' in core
    assert 'var band = belowBandThree ? "Below 3" : (numericBand ? numericBand[1] : "");' in core
