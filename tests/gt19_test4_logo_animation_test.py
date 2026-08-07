from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
PAGE = REPO_ROOT / "general-training" / "cambridge-19" / "test-4" / "IELTS19 Test 4 - Reading - GT.html"


def test_test4_logo_animation_matches_established_reading_header_pattern() -> None:
    html = PAGE.read_text(encoding="utf-8")

    assert html.count("/* IELTS Pabs animated logo */") == 2  # CSS marker + JS marker
    assert html.count(".logo.is-animating .logo-char") == 1
    assert html.count("@keyframes logoReveal") == 1
    assert html.count("function initAnimatedLogo()") == 1
    assert html.count("initAnimatedLogo();") == 1
    assert "animation-delay: calc(var(--logo-char-index) * 200ms);" in html
    assert "logoNode.addEventListener('mouseenter'" in html
    assert "logoNode.addEventListener('mouseleave'" in html
    assert "prefers-reduced-motion: reduce" in html

    # Keep the existing Test 4 header/navigation contract intact.
    assert '<div class="logo home-link" onclick="confirmGoHome()" title="Return to home">IELTS Pabs</div>' in html
    assert '<div class="test-title">IELTS 19 General Training Reading Test 4</div>' in html
    assert '<script src="../../shared/gt-reading-test-runtime.js"></script>' in html
