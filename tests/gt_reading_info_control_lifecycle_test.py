from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SHARED_CSS = REPO_ROOT / "academic" / "shared" / "reading-feature-shell.css"
SHARED_CORE = REPO_ROOT / "academic" / "shared" / "reading-feature-shell-core.js"
GT19_ROOT = REPO_ROOT / "general-training" / "cambridge-19"


def test_hidden_strategy_buttons_are_not_forced_visible_by_css() -> None:
    css = SHARED_CSS.read_text(encoding="utf-8")
    assert ".reading-shell-study-icon-button[hidden]{display:none!important}" in css


def test_shared_shell_uses_the_expected_mode_lifecycle() -> None:
    core = SHARED_CORE.read_text(encoding="utf-8")
    assert 'var inStudy = currentMode() === "study";' in core
    assert 'var afterTest = currentMode() === "test" && Boolean(config.state.isTestSubmitted());' in core
    assert 'var showStrategies = capabilities.hasTaskStrategies && (inStudy || afterTest);' in core
    assert 'control.strategyButton.hidden = !showStrategies;' in core


def test_gt19_reading_tests_share_the_same_strategy_control_contract() -> None:
    for test_number in range(1, 5):
        adapter = (GT19_ROOT / f"test-{test_number}" / "study-feedback.js").read_text(encoding="utf-8")
        assert "reading-feature-shell-core.js" in adapter

    test2_adapter = (GT19_ROOT / "test-2" / "study-feedback.js").read_text(encoding="utf-8")
    assert "gt-test2-mode-info-visibility" not in test2_adapter
    assert "data-gt-test2-mode" not in test2_adapter
