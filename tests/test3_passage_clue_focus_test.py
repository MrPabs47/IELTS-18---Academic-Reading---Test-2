import json
import os
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORE = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
CSS = (ROOT / "academic/shared/reading-feature-shell.css").read_text(encoding="utf-8")
HARNESS = ROOT / "tests/test3_passage_clue_production_harness.js"


def test_production_focus_map_and_transactional_failure_paths():
    node = os.environ.get("NODE_EXE") or shutil.which("node")
    assert node, "Node.js is required to execute the production passage-clue harness"
    harness = HARNESS.read_text(encoding="utf-8")
    harness = harness.replace(
        'const ROOT = path.resolve(__dirname, "..");',
        "const ROOT = process.cwd();",
    ).replace(
        'const HTML_PATH = path.join(ROOT, "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html");',
        'const HTML_PATH = path.join(ROOT, "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html");\n'
        'const DATA_PATH = path.join(ROOT, "academic/cambridge-16/test-3/study-feedback.js");',
    ).replace(
        "sandbox.window = sandbox;",
        'sandbox.window = sandbox;\nvm.runInNewContext(fs.readFileSync(DATA_PATH, "utf8"), sandbox, { filename: DATA_PATH });',
    ).replace(
        "configure: function (value) { config = value; },",
        "configure: function (value) { config = value; capabilities = { hasTaskGroups: true, hasTaskStrategies: true, hasQuestionDetails: true, hasPassageClues: true }; activeSubmittedResult = { submissionId: 1 }; submittedOutcomes = {}; for (var question = 1; question <= 40; question += 1) submittedOutcomes[question] = 0; },",
    ).replace(
        "hooks.configure({\n  test:",
        "hooks.configure({\n  study: { taskGroups: sandbox.IELTS16AcademicTest3StudyFeedback.taskGroups, questionDetails: sandbox.IELTS16AcademicTest3StudyFeedback.questions },\n  test:",
    )
    completed = subprocess.run(
        [node, "-e", harness],
        cwd=ROOT,
        env={**os.environ, "NODE_NO_WARNINGS": "1"},
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    result = json.loads(completed.stdout)
    assert result == {
        "productionCoreExecuted": True,
        "forcedFailureRolledBack": True,
        "assertions": 40,
    }


def test_no_parallel_write_only_clue_state_remains():
    assert "focusedPassageClues" not in CORE
    assert "singlePassageClues" not in CORE
    assert "var fullPassageClueMaps = new Set();" in CORE
    assert 'passage.querySelectorAll(".reading-shell-evidence-focus, .reading-shell-evidence-attention")' in CORE
    assert "fullPassageClueMaps.has(activeContext.key) && fullMapIsRendered(activeContext)" in CORE


def test_renderer_rolls_back_failed_or_incomplete_transactions():
    renderer = CORE.split("function renderFullPassageClueMap(context)", 1)[1].split("\n  function showAllPassageClues", 1)[0]
    assert "var orderedRecords = [];" in renderer
    assert "range.surroundContents(mark);" in renderer
    assert re.search(r"catch \(error\) \{\s*clearEvidence\(passage\);\s*return false;", renderer)
    assert re.search(
        r"if \(fullMapIsRendered\(context\)\) \{\s*noteRenderedClueContext\(context\);\s*return true;\s*\}\s*clearEvidence\(passage\);\s*return false;",
        renderer,
    )


def test_focus_and_badge_paths_do_not_rebuild_or_clear_complete_maps():
    helper = CORE.split("function focusRenderedEvidence(passage, questionNumber)", 1)[1].split("\n  function sharedEvidenceQuestions", 1)[0]
    assert not re.search(r"createElement|createRange|surroundContents|replaceWith|append\(", helper)
    badge = CORE.split("function evidenceBadge(questionNumber)", 1)[1].split("\n  function questionsForClueMap", 1)[0]
    assert "navigateTo(questionNumber)" in badge
    assert "clearEvidence" not in badge
    assert "showEvidence" not in badge
    assert ".reading-shell-evidence-attention" in CSS
    assert "@keyframes readingShellEvidencePulse" in CSS
    assert "@media (prefers-reduced-motion:reduce)" in CSS
