import json
import html as html_module
import http.server
import re
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER_JS = (ROOT / "academic/shared/reading-feature-shell.js").read_text(encoding="utf-8")
CORE_JS = (ROOT / "academic/shared/reading-feature-shell-core.js").read_text(encoding="utf-8")
TEST3_DATA_JS = (ROOT / "academic/cambridge-16/test-3/study-feedback.js").read_text(encoding="utf-8")
JS = CORE_JS + "\n" + LOADER_JS + "\n" + TEST3_DATA_JS
HTML = (ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html").read_text(encoding="utf-8")
CONTRACT = (ROOT / "academic/shared/READING_FEEDBACK_PARITY_CONTRACT.md").read_text(encoding="utf-8")
SHELL_CSS_PATH = ROOT / "academic/shared/reading-feature-shell.css"
SHELL_CSS = SHELL_CSS_PATH.read_text(encoding="utf-8")


def _chrome_executable():
    candidates = [
        shutil.which("chrome"),
        shutil.which("chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)
    raise AssertionError("Chrome or Edge is required for computed-style regression coverage")


def _score_guide_fixture(source_path, mode="study"):
    source = source_path.read_text(encoding="utf-8")
    relative_dir = source_path.parent.relative_to(ROOT).as_posix()
    fixture_guard = (
        "<script>"
        "const scoreGuideFixtureAddEventListener = window.addEventListener.bind(window);"
        "window.addEventListener = function(type, listener, options) {"
        "if (type === 'beforeunload') return;"
        "return scoreGuideFixtureAddEventListener(type, listener, options);"
        "};"
        "</script>"
    )
    source = source.replace(
        "<head>",
        f'<head><base href="/{relative_dir}/">{fixture_guard}',
        1,
    )
    probe = r'''
<script>
window.addEventListener("load", function () {
  function visible(element) {
    return Boolean(element) && getComputedStyle(element).display !== "none" &&
      element.getClientRects().length > 0;
  }
  function state() {
    const button = document.querySelector(".reading-shell-score-guide-button");
    const backdrop = document.querySelector(".reading-shell-score-guide-backdrop");
    return {
      hidden: button.hidden,
      display: getComputedStyle(button).display,
      visibleCount: Array.from(document.querySelectorAll(".reading-shell-score-guide-button")).filter(visible).length,
      width: button.getBoundingClientRect().width,
      height: button.getBoundingClientRect().height,
      backdropHidden: backdrop.hidden
    };
  }
  startTest("__MODE__");
  setTimeout(function () {
    const button = document.querySelector(".reading-shell-score-guide-button");
    const fresh = state();
    button.focus();
    fresh.keyboardOperable = document.activeElement === button;
    button.click();
    const backdrop = document.querySelector(".reading-shell-score-guide-backdrop");
    fresh.opens = !backdrop.hidden;
    fresh.summaryHidden = document.querySelector(".reading-shell-score-guide-summary").hidden;
    fresh.highlightedRows = document.querySelectorAll(".reading-shell-current-score-row").length;
    fresh.dialogCount = document.querySelectorAll(".reading-shell-score-guide-backdrop").length;
    document.querySelector(".reading-shell-score-guide-close").click();
    fresh.closes = backdrop.hidden;
    button.click();
    fresh.reopens = !backdrop.hidden;
    document.querySelector(".reading-shell-score-guide-close").click();
    submitTest();
    setTimeout(function () {
      const submitted = state();
      button.click();
      submitted.opens = !document.querySelector(".reading-shell-score-guide-backdrop").hidden;
      submitted.summaryHidden = document.querySelector(".reading-shell-score-guide-summary").hidden;
      submitted.highlightedRows = document.querySelectorAll(".reading-shell-current-score-row").length;
      const output = document.createElement("pre");
      output.id = "scoreGuideProbeResult";
      output.textContent = JSON.stringify({ fresh, submitted });
      document.body.appendChild(output);
    }, 100);
  }, 100);
});
</script>
'''
    probe = probe.replace("__MODE__", mode)
    return source.replace("</body>", probe + "</body>", 1).encode("utf-8")


def _browser_score_guide_states(source_path, css_override=None, mode="study"):
    fixture = _score_guide_fixture(source_path, mode=mode)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/__score-guide-fixture":
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(fixture)))
                self.end_headers()
                self.wfile.write(fixture)
                return
            if (
                css_override is not None
                and self.path == "/academic/shared/reading-feature-shell.css"
            ):
                payload = css_override.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/css; charset=utf-8")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            return super().do_GET()

        def log_message(self, *_args):
            pass

    def handler(*args, **kwargs):
        return Handler(*args, directory=str(ROOT), **kwargs)

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with tempfile.TemporaryDirectory(prefix="ielts-score-guide-") as profile:
            command = [
                _chrome_executable(),
                "--headless=new",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check",
                f"--user-data-dir={profile}",
                "--virtual-time-budget=4000",
                "--dump-dom",
                f"http://127.0.0.1:{server.server_port}/__score-guide-fixture",
            ]
            completed = subprocess.run(
                command,
                cwd=ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=90,
            )
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    assert completed.returncode == 0, (
        f"Browser command: {command}\nexit status: {completed.returncode}\n"
        f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
    )
    match = re.search(
        r'<pre id="scoreGuideProbeResult">([^<]+)</pre>',
        completed.stdout,
    )
    assert match, (
        f"Browser fixture did not publish computed-style results\n"
        f"command: {command}\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
    )
    return json.loads(html_module.unescape(match.group(1)))


def test_score_guide_css_preserves_visible_layout_and_explicit_hidden_semantics():
    assert re.search(
        r"\.reading-shell-score-guide-button\s*\{[^}]*display\s*:\s*inline-flex",
        SHELL_CSS,
    )
    assert re.search(
        r"\.reading-shell-score-guide-button\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important",
        SHELL_CSS,
    )


def _assert_score_guide_computed_visibility(page):
    result = _browser_score_guide_states(page)
    fresh = result["fresh"]
    submitted = result["submitted"]
    assert fresh == {
        "hidden": False,
        "display": fresh["display"],
        "visibleCount": 1,
        "width": fresh["width"],
        "height": fresh["height"],
        "backdropHidden": True,
        "keyboardOperable": True,
        "opens": True,
        "summaryHidden": True,
        "highlightedRows": 0,
        "dialogCount": 1,
        "closes": True,
        "reopens": True,
    }, f"{page.name} fresh Study Score guide state: {fresh}"
    assert fresh["width"] > 0
    assert fresh["height"] > 0
    assert submitted["hidden"] is False
    assert submitted["display"] != "none"
    assert submitted["visibleCount"] == 1
    assert submitted["width"] > 0
    assert submitted["height"] > 0
    assert submitted["opens"] is True
    assert submitted["summaryHidden"] is False
    assert submitted["highlightedRows"] == 1


def test_score_guide_computed_visibility_for_ielts17():
    _assert_score_guide_computed_visibility(
        ROOT / "academic/cambridge-17/test-1/IELTS17 Test 1 - Academic Reading.html"
    )


def test_score_guide_computed_visibility_for_test3():
    _assert_score_guide_computed_visibility(
        ROOT / "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html"
    )


def test_score_guide_computed_visibility_for_test4():
    _assert_score_guide_computed_visibility(
        ROOT / "academic/cambridge-16/test-4/IELTS16 Test 4 - Academic Reading.html"
    )


def test_fresh_test_parent_gate_stays_private_without_button_hidden_rule():
    hidden_rule = ".reading-shell-score-guide-button[hidden]{display:none!important}"
    assert SHELL_CSS.count(hidden_rule) == 1
    mutant = SHELL_CSS.replace(
        hidden_rule,
        ".reading-shell-score-guide-button[hidden]{display:inline-flex!important}",
        1,
    )
    result = _browser_score_guide_states(
        ROOT / "academic/cambridge-17/test-1/IELTS17 Test 1 - Academic Reading.html",
        css_override=mutant,
        mode="test",
    )
    assert result["fresh"]["hidden"] is True
    assert result["fresh"]["display"] != "none"
    assert result["fresh"]["visibleCount"] == 0
    assert result["fresh"]["width"] == 0
    assert result["fresh"]["opens"] is False
    assert result["submitted"]["display"] != "none"
    assert result["submitted"]["visibleCount"] == 1


def _run_score_feedback_harness(groups, first_correct, second_correct=None):
    script = r'''
const fs = require("fs");
const vm = require("vm");
let source = fs.readFileSync(process.argv[1], "utf8");
const marker = "  global.ReadingFeatureShell = {";
const hook = `  global.__scoreFeedbackTest = {
    setConfig: function (value) {
      config = value;
      capabilities = { hasTaskGroups: true, hasCompleteTaskGroups: true, hasTaskStrategies: true };
    },
    capture: function (correctQuestions) {
      var correct = new Set(correctQuestions);
      var outcomes = {};
      for (var question = 1; question <= config.test.totalQuestions; question += 1) outcomes[question] = correct.has(question);
      captureSubmittedOutcomes({ questionOutcomes: outcomes });
    },
    select: selectPartFeedback,
    strengthAdvice: strengthFeedbackAdvice,
    focusAdvice: focusFeedbackAdvice
  };\n`;
if (!source.includes(marker)) throw new Error("Shared-core export marker missing");
source = source.replace(marker, hook + marker);
const context = { window: {}, console: { error: function () {} } };
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__scoreFeedbackTest;
const groups = JSON.parse(process.argv[2]);
let currentCorrect = new Set(JSON.parse(process.argv[3]));
api.setConfig({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode: function () { return "study"; } },
  answers: { isCorrect: function (questionNumber) { return currentCorrect.has(Number(questionNumber)); } },
  study: { taskGroups: groups }
});
function project() {
  const selected = api.select(1);
  function item(value, type) {
    if (!value) return null;
    return {
      id: value.group.id,
      label: value.group.label,
      correct: value.correct,
      total: value.total,
      ratio: value.ratio,
      advice: type === "strength" ? api.strengthAdvice(value) : api.focusAdvice(value)
    };
  }
  return { strength: item(selected.strength, "strength"), focus: item(selected.focus, "focus") };
}
api.capture(Array.from(currentCorrect));
const first = project();
let provisional = null;
let second = null;
if (process.argv[4] !== "null") {
  currentCorrect = new Set(JSON.parse(process.argv[4]));
  provisional = project();
  api.capture(Array.from(currentCorrect));
  second = project();
}
process.stdout.write(JSON.stringify({ first, provisional, second }));
'''
    completed = subprocess.run(
        [
            "node", "-e", script,
            str(ROOT / "academic/shared/reading-feature-shell-core.js"),
            json.dumps(groups), json.dumps(first_correct), json.dumps(second_correct),
        ],
        cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8",
    )
    return json.loads(completed.stdout)


def test_shared_shell_assets_and_public_api_remain_available():
    assert HTML.count('../../shared/reading-feature-shell.css') == 1
    assert HTML.count('../../shared/reading-feature-shell.js') == 1
    assert HTML.count('id="readingFeatureShellMount"') == 1
    assert 'reading-feature-shell-core.js' in LOADER_JS
    for name in ["init", "sync", "startStudySession", "getStatus", "validateConfig"]:
        assert re.search(rf"\b{name}\s*:\s*{name}\b", JS)


def test_header_controls_follow_the_approved_test3_contract():
    for token in [
        '"📊 Score guide"', '"🔑"', '"Study mode"', '"Study time: "',
        '"Score feedback"', '"Answer Key"',
    ]:
        assert token in JS
    assert JS.find('scoreGuideButton = el') < JS.find('answerKeyButton = el') < JS.find('studyPill = el')


def test_task_feedback_uses_test1_test2_control_and_card_structure():
    for token in [
        '"Show answers & feedback"', '"Hide answers & feedback"',
        '"How to tackle this task"', '<dt>Your answer</dt>',
        '<dt>Correct answer</dt>', '<dt>Why</dt>', '<dt>Skill</dt>',
        'var clueText = clueTextFor(questionNumber);',
        'title="\' + html(clueText) + \'"',
        'reading-shell-study-controls', 'reading-shell-study-icon-button',
        'reading-shell-study-reveal-button', 'reading-shell-study-result',
        'reading-shell-study-panel', 'reading-shell-study-feedback-card',
        'reading-shell-study-clue-button', 'reading-shell-evidence-highlight',
        'reading-shell-clue-badge',
    ]:
        assert token in JS


def test_task_type_labels_only_live_inside_the_strategy_panel():
    assert 'reading-shell-study-task-label' not in JS
    assert 'reading-shell-study-strategy' in JS
    assert "' strategy</h3>" in JS
    assert 'controls.append(strategyButton, revealButton)' in JS


def test_study_feedback_toggle_remains_available_after_revealing_a_group():
    show_group = CORE_JS.split("function showGroup(group)", 1)[1].split("function hideGroup(group)", 1)[0]
    sync_feedback = CORE_JS.split("function syncTaskFeedback()", 1)[1].split("function syncLegacyInlineAnswers()", 1)[0]
    assert 'control.revealButton.hidden = false;' in show_group
    assert 'control.revealButton.disabled = false;' in show_group
    assert 'control.revealButton.textContent = "Hide answers & feedback"' in show_group
    assert 'var showReveal = capabilities.hasQuestionDetails && inStudy && reviewComplete;' in sync_feedback
    assert 'control.revealButton.hidden = !showReveal;' in sync_feedback
    assert 'control.revealButton.disabled = !showReveal;' in sync_feedback
    assert 'revealedGroups.has(group.id)' not in sync_feedback


def test_strategy_information_remains_available_after_completed_review():
    sync_feedback = CORE_JS.split("function syncTaskFeedback()", 1)[1].split("function syncLegacyInlineAnswers()", 1)[0]
    build_controls = CORE_JS.split("function buildTaskFeedbackControls()", 1)[1].split("function installStyles()", 1)[0]
    assert 'var showStrategies = capabilities.hasTaskStrategies && (inStudy || afterTest);' in sync_feedback
    assert 'control.strategyButton.hidden = !showStrategies;' in sync_feedback
    assert 'control.strategyButton.disabled = !showStrategies;' in sync_feedback
    assert 'control.strategyButton.hidden = reviewComplete' not in sync_feedback
    assert 'control.strategyButton.disabled = reviewComplete' not in sync_feedback
    assert 'if (reviewComplete) control.panel.hidden = true;' not in sync_feedback
    assert 'if (!showStrategies) {' in sync_feedback
    assert 'control.panel.hidden = true;' in sync_feedback
    assert 'control.strategyButton.setAttribute("aria-expanded", "false");' in sync_feedback
    assert build_controls.count('strategyButton.addEventListener("click"') == 1
    assert 'var opening = panel.hidden;' in build_controls
    assert 'panel.hidden = !opening;' in build_controls
    assert 'strategyButton.setAttribute("aria-expanded", opening ? "true" : "false");' in build_controls


def test_score_guide_remains_open_while_submitted_test_review_is_available():
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    dialog_helpers = CORE_JS.split("function closeDialog", 1)[1].split("function navigateTo", 1)[0]
    backdrop = CORE_JS.split("function backdrop", 1)[1].split("function buildScoreGuide", 1)[0]
    build_ui = CORE_JS.split("function buildUi()", 1)[1].split("function updateReviewFromOverlay()", 1)[0]
    assert 'var completedTest = mode === "test" && Boolean(config.state.isTestSubmitted());' in sync
    assert 'var showRoot = studyMode || completedTest;' in sync
    assert 'if (!studyMode) { studySessionActive = false; stopStudyTimer(); }' in sync
    assert 'if (!showRoot) { closeScoreGuide(false); closeAnswerKey(false); closeScoreFeedback(false); }' in sync
    assert 'if (!studyMode) { studySessionActive = false; stopStudyTimer(); closeScoreGuide(false); }' not in sync
    assert 'function openScoreGuide()' in dialog_helpers
    assert 'openDialog(elements.scoreGuideBackdrop, elements.scoreGuideClose);' in dialog_helpers
    assert 'function closeScoreGuide(restore)' in dialog_helpers
    assert build_ui.count('scoreGuideButton.addEventListener("click", openScoreGuide);') == 1
    assert build_ui.count('var scoreGuide = capabilities.hasScoreGuide ? buildScoreGuide() : null;') == 1
    assert 'dialog.setAttribute("role", "dialog");' in backdrop
    assert 'dialog.setAttribute("aria-labelledby", titleId);' in backdrop
    assert 'close.addEventListener("click", function () { closeFn(true); });' in backdrop
    assert 'if (event.target === shade) closeFn(true);' in backdrop
    assert 'if (event.key === "Escape")' in backdrop
    assert 'lastOpener.focus()' in dialog_helpers


def test_fresh_study_answer_key_and_neutral_score_guide_are_available():
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    assert "var hasSubmission = Boolean(result);" in sync
    assert "elements.scoreGuideButton.hidden = !(showRoot && capabilities.hasScoreGuide);" in sync
    assert "elements.answerKeyButton.hidden = !(learningResources && capabilities.hasAnswerKey);" in sync
    assert "showRoot && hasSubmission && capabilities.hasScoreGuide" not in sync


def test_r4_fresh_study_separates_learning_resources_from_official_results():
    availability = CORE_JS.split("function fullReviewAvailable()", 1)[1].split("function updateTimer()", 1)[0]
    cards = CORE_JS.split("function buildQuestionCard(questionNumber)", 1)[1].split("function clearEvidence", 1)[0]
    groups = CORE_JS.split("function showGroup(group)", 1)[1].split("function hideGroup(group)", 1)[0]
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    start = CORE_JS.split("function startStudySession()", 1)[1].split("function init(value)", 1)[0]

    assert 'if (currentMode() === "study") return true;' in availability
    assert "function officialReviewAvailable()" in availability
    assert "fullReviewAvailable() && submittedOutcomes" in availability
    assert "var official = officialReviewAvailable();" in cards
    assert "(official ? '<dt>Your answer</dt>" in cards
    assert "Not answered · 0 points" in cards
    assert "control.result.hidden = !officialReviewAvailable();" in groups

    assert "var learningResources = studyMode || (completedTest && hasSubmission);" in sync
    assert "elements.answerKeyButton.hidden = !(learningResources && capabilities.hasAnswerKey);" in sync
    assert "elements.scoreGuideButton.hidden = !(showRoot && capabilities.hasScoreGuide);" in sync
    assert "syncActiveClueContext(activeClueContext, learningResources && capabilities.hasPassageClues)" in sync
    assert "syncPassageClueToolbar(learningResources && capabilities.hasPassageClues && cluesAvailable);" in sync
    assert "studyMode && capabilities.hasQuestionDetails && !studyLearningResourcesShown" in sync
    assert "revealAll();" in sync
    assert "elements.scoreFeedbackButton.hidden = !result;" in sync
    assert "studyLearningResourcesShown = false;" in start
    assert "elements.answerKeyButton.hidden = !showRoot;" not in sync


def test_score_feedback_supports_totals_without_generic_task_advice():
    rendering = CORE_JS.split("function renderScoreFeedback()", 1)[1].split("function strategyMarkup", 1)[0]
    assert "result.partScores" in rendering
    assert "hasTaskAdvice" in rendering
    assert "if (hasTaskAdvice)" in rendering
    assert "Your question-type performance in this part was mixed." not in rendering


def test_full_study_review_reveals_once_without_overriding_later_group_hides():
    assert 'var studyReviewJustSubmitted = currentMode() === "study" && isOpen && !reviewOverlayWasOpen;' in CORE_JS
    assert 'return studyReviewJustSubmitted;' in CORE_JS
    assert 'var studyReviewJustSubmitted = updateReviewFromOverlay();' in CORE_JS
    assert 'function refreshAllGroups() { taskGroups().forEach(showGroup); }' in CORE_JS
    assert 'if (result && studyMode && submissionChanged) {' in CORE_JS
    assert CORE_JS.index('captureSubmittedOutcomes(result);') < CORE_JS.index('refreshAllGroups();')
    assert '} else if (result && completedTest) {' in CORE_JS
    assert 'revealAll();' in CORE_JS
    assert 'if (result && (studyReviewSubmitted || completedTest)) revealAll();' not in CORE_JS


def test_each_study_resubmission_rebuilds_current_group_results_and_cards():
    show_group = CORE_JS.split("function showGroup(group)", 1)[1].split("function hideGroup(group)", 1)[0]
    build_card = CORE_JS.split("function buildQuestionCard(questionNumber)", 1)[1].split("function showGroup(group)", 1)[0]
    assert 'var official = officialReviewAvailable();' in show_group
    assert 'control.result.textContent = official ? scoreText(rangeScore(group)) + " / " + group.questions.length + " correct" : "";' in show_group
    assert 'control.result.hidden = !officialReviewAvailable();' in show_group
    assert 'group.questions.forEach(buildQuestionCard);' in show_group
    assert 'removeQuestionCard(questionNumber);' in build_card
    assert 'var user = official ? submittedAnswerFor(questionNumber) : "";' in build_card
    assert 'var correct = official && Boolean(submittedOutcomeFor(questionNumber));' in build_card
    assert 'var status = !user ? "unanswered" : correct ? "correct" : "incorrect";' in build_card


def test_legacy_inline_answers_are_suppressed_for_every_submitted_review():
    assert "global.document.querySelectorAll('.correct-answer-text[id^=\"ca-\"]')" in CORE_JS
    assert 'var hideLegacyAnswers = fullReviewAvailable();' in CORE_JS
    assert 'answer.hidden = hideLegacyAnswers;' in CORE_JS
    assert 'syncLegacyInlineAnswers();' in CORE_JS
    assert '.correct-answer-text[hidden]{display:none!important}' in CORE_JS
    helper = CORE_JS.split('function syncLegacyInlineAnswers()', 1)[1].split('function buildTaskFeedbackControls()', 1)[0]
    assert '.textContent =' not in helper
    assert '.remove()' not in helper


def test_blank_answers_are_never_treated_as_correct_in_study_feedback():
    assert 'config.answers.getUserAnswer(questionNumber)' in CORE_JS
    assert 'config.answers.isCorrect(questionNumber)' in CORE_JS
    assert "input[type=\"radio\"][name=\"q" not in CORE_JS
    assert "input[type=\"text\"][name=\"q" not in CORE_JS
    assert '"Not answered · 0 points"' in JS
    assert "function rangeScore(group)" in JS


def test_core_shared_evidence_creates_every_matching_question_badge():
    for token in [
        'function sharedEvidenceQuestions(target, part, questionNumber)',
        'var details = questionDetails();',
        'sameText && clueTargetFor(candidate) === target',
        '.sort(function (a, b) { return a - b; })',
        'function evidenceBadge(questionNumber)',
        'badge.setAttribute("data-reading-shell-clue-question", String(questionNumber));',
        'navigateTo(questionNumber)',
        'sharedEvidenceQuestions(evidence, part, questionNumber).forEach(function (relatedQuestion) { mark.append(evidenceBadge(relatedQuestion)); });',
    ]:
        assert token in CORE_JS
    assert 'clearEvidence(passage);' in CORE_JS
    assert 'questionNumber === 21' not in CORE_JS
    assert 'questionNumber === 22' not in CORE_JS
    evidence_pattern = r'^\s*{q}: \["(?:[^"\\]|\\.)*", "(?:[^"\\]|\\.)*", "((?:[^"\\]|\\.)*)"\]'
    evidence = {
        q: re.search(evidence_pattern.format(q=q), TEST3_DATA_JS, re.M).group(1)
        for q in [21, 22, 30, 34]
    }
    assert evidence[21] == evidence[22]
    assert evidence[30] == evidence[34]
    assert "TEST3_GROUPS" not in CORE_JS
    assert "cambridge-16-academic-reading-test-4" not in TEST3_DATA_JS
    assert "p1-diagram" not in TEST3_DATA_JS


def test_study_controls_are_forced_hidden_in_test_mode():
    for token in [
        'function patchTestModeStudyControls()',
        'config.state.getMode()',
        'if (mode() === "study") {',
        'controls.style.display = "";',
        'window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function"',
        'controls.style.display = "none";',
        'button.hidden = true;',
        'button.disabled = true;',
        'panel.hidden = true;',
        'new MutationObserver(scheduleSync)',
    ]:
        assert token in LOADER_JS
    assert LOADER_JS.find('controls.style.display = "";') < LOADER_JS.find('controls.style.display = "none";')
    assert LOADER_JS.find('window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function"') < LOADER_JS.find('controls.style.display = "none";')


def test_parity_contract_protects_the_rules_learned_from_test1_and_test2():
    for rule in [
        "Test 1 and Test 2 are the visual and behavioural references.",
        "The shared layer must never create a second scoring implementation that can disagree with the test engine.",
        "A later `Show answers & feedback` rebuilds the cards using the student's current answers.",
        "A blank answer is always `Not answered · 0 points`.",
        "Duplicate inline `Correct answer:` feedback must not appear alongside the cards.",
        "Work on one question group at a time.",
    ]:
        assert rule in CONTRACT


def test_next_group_data_is_present_for_part1_summary_completion():
    assert 'id: "p1-summary"' in JS
    assert 'questions: [6, 7, 8, 9, 10, 11, 12, 13]' in JS
    for question_number in range(6, 14):
        assert f"{question_number}: [" in JS


def test_test3_groups_cover_every_question_without_engine_calls():
    for questions in [
        '[1, 2, 3, 4, 5]', '[6, 7, 8, 9, 10, 11, 12, 13]',
        '[14, 15, 16, 17, 18, 19]', '[20, 21, 22]', '[23, 24]',
        '[25, 26]', '[27, 28, 29, 30, 31, 32]', '[33, 34, 35, 36, 37]',
        '[38, 39, 40]',
    ]:
        assert questions in JS
    for forbidden in [
        'evaluateQuestions(', 'submitTest(', 'handlePrimarySubmit(', 'confirmSubmit(',
        'beginTimedTest(', 'requestFullscreen(', 'exitFullscreen(',
        'getChooseTwoCorrectCount(',
    ]:
        assert forbidden not in JS


def test_score_feedback_selects_current_task_type_strength_and_focus_from_production_core():
    groups = [
        {"id": "summary", "part": 1, "label": "Summary completion", "questions": [1, 2, 3, 4],
         "purpose": "Use grammar and meaning to complete the summary.", "steps": ["Predict the word type before scanning."],
         "trap": "Do not choose an option because one word looks familiar."},
        {"id": "ynng", "part": 1, "label": "Yes / No / Not Given", "questions": [5, 6, 7, 8],
         "purpose": "Compare each claim with the writer's position.", "steps": ["Check whether the writer agrees, disagrees, or gives no view."],
         "trap": "Do not confuse factual information with the writer's opinion."},
        {"id": "multiple-choice", "part": 1, "label": "Multiple choice", "questions": [9, 10, 11],
         "purpose": "Check the full meaning of every option.", "steps": ["Eliminate options that are only partly supported."],
         "trap": "Repeated vocabulary can hide a changed meaning."},
        {"id": "tiny", "part": 1, "label": "Tiny group", "questions": [12, 13],
         "purpose": "This group is too small.", "steps": ["It must not be selected."], "trap": "Ignore this group."},
    ]
    result = _run_score_feedback_harness(groups, [1, 2, 3, 4, 5, 9, 10], [1, 5, 6, 7, 8, 9, 10])
    assert result["first"]["strength"] == {
        "id": "summary", "label": "Summary completion", "correct": 4, "total": 4, "ratio": 1,
        "advice": "You handled Summary completion accurately. Use grammar and meaning to complete the summary.",
    }
    assert result["first"]["focus"]["id"] == "ynng"
    assert result["first"]["focus"]["correct"] == 1
    assert "writer agrees, disagrees, or gives no view" in result["first"]["focus"]["advice"]
    assert "factual information" in result["first"]["focus"]["advice"]
    assert result["provisional"] == result["first"]
    assert result["second"]["strength"]["id"] == "ynng"
    assert result["second"]["focus"]["id"] == "summary"
    assert result["second"]["strength"]["advice"] != result["first"]["strength"]["advice"]


def test_score_feedback_thresholds_neutral_fallback_and_stable_ties_are_protected():
    neutral_groups = [
        {"id": "a", "part": 1, "label": "Type A", "questions": [1, 2, 3, 4, 5], "purpose": "Purpose A.", "steps": ["Step A."], "trap": "Trap A."},
        {"id": "b", "part": 1, "label": "Type B", "questions": [6, 7, 8, 9, 10], "purpose": "Purpose B.", "steps": ["Step B."], "trap": "Trap B."},
    ]
    neutral = _run_score_feedback_harness(neutral_groups, [1, 2, 3, 6, 7, 8])["first"]
    assert neutral == {"strength": None, "focus": None}

    tie_groups = [
        {"id": "s3", "part": 1, "label": "S3", "questions": [1, 2, 3], "purpose": "S3.", "steps": ["S3."], "trap": "S3."},
        {"id": "s4-first", "part": 1, "label": "S4 first", "questions": [4, 5, 6, 7], "purpose": "S4.", "steps": ["S4."], "trap": "S4."},
        {"id": "s4-later", "part": 1, "label": "S4 later", "questions": [8, 9, 10, 11], "purpose": "S4.", "steps": ["S4."], "trap": "S4."},
        {"id": "f3", "part": 1, "label": "F3", "questions": [12, 13, 14], "purpose": "F3.", "steps": ["F3."], "trap": "F3."},
        {"id": "f4-first", "part": 1, "label": "F4 first", "questions": [15, 16, 17, 18], "purpose": "F4.", "steps": ["F4."], "trap": "F4."},
        {"id": "f4-later", "part": 1, "label": "F4 later", "questions": [19, 20, 21, 22], "purpose": "F4.", "steps": ["F4."], "trap": "F4."},
    ]
    tied = _run_score_feedback_harness(tie_groups, list(range(1, 12)))["first"]
    assert tied["strength"]["id"] == "s4-first"
    assert tied["focus"]["id"] == "f4-first"
    assert tied["strength"]["id"] != tied["focus"]["id"]


def test_score_feedback_rendering_is_semantic_specific_and_replaces_generic_part_advice():
    rendering = CORE_JS.split("function renderScoreFeedback()", 1)[1].split("function strategyMarkup", 1)[0]
    append_item = CORE_JS.split("function appendTaskTypeFeedback", 1)[1].split("function renderScoreFeedback", 1)[0]
    selection = CORE_JS.split("function rankFeedbackGroups", 1)[1].split("function strengthFeedbackAdvice", 1)[0]
    assert 'item.total >= 3' in selection
    assert 'item.ratio >= 0.75' in selection
    assert 'item.ratio < 0.60' in selection
    assert '(b.total - a.total) || (a.order - b.order)' in selection
    assert 'item.group !== strength.group' in selection
    assert 'el("h4", "reading-shell-score-feedback-subheading", title)' in append_item
    assert 'item.group.label + ": " + scoreText(item.correct) + " / " + item.total + " correct"' in append_item
    assert 'strengthFeedbackAdvice(item)' in append_item and 'focusFeedbackAdvice(item)' in append_item
    assert 'var hasTaskAdvice = capabilities.hasCompleteTaskGroups && capabilities.hasTaskStrategies' in rendering
    assert 'if (hasTaskAdvice)' in rendering
    assert 'Your question-type performance in this part was mixed.' not in rendering
    assert 'You answered most questions in this part accurately.' not in rendering
    assert 'Use the detailed Study feedback to compare your answer' not in rendering
    assert 'feedbackCard(body, "Time management")' not in rendering


def test_score_feedback_uses_submitted_snapshot_and_refreshes_without_duplicate_listeners():
    sync = CORE_JS.split("function sync()", 1)[1].split("function startStudySession()", 1)[0]
    build_ui = CORE_JS.split("function buildUi()", 1)[1].split("function updateReviewFromOverlay()", 1)[0]
    assert 'captureSubmittedOutcomes(result);' in sync
    assert 'if (capabilities.hasQuestionDetails && submittedOutcomes) refreshAllGroups();' in sync
    assert 'submittedOutcomeMode !== "test"' in sync
    assert 'if (!elements.scoreFeedbackBackdrop.hidden) renderScoreFeedback();' in sync
    assert 'submittedOutcomeFor(questionNumber)' in CORE_JS
    assert CORE_JS.count('scoreFeedbackButton.addEventListener("click", openScoreFeedback);') == 1
    assert build_ui.count('var scoreFeedback = buildScoreFeedback();') == 1
    assert 'body.textContent = "";' in CORE_JS.split("function renderScoreFeedback()", 1)[1].split("function strategyMarkup", 1)[0]


def test_test3_and_test4_feedback_groups_remain_data_isolated_and_test1_test2_are_unmodified():
    test4_data = (ROOT / "academic/cambridge-16/test-4/study-feedback.js").read_text(encoding="utf-8")
    assert 'id: "p1-tfng"' in TEST3_DATA_JS
    assert 'id: "p1-diagram"' not in TEST3_DATA_JS
    assert 'id: "p1-diagram"' in test4_data
    assert 'cambridge-16-academic-reading-test-4' not in CORE_JS
    assert "TEST3_GROUPS" not in CORE_JS
    assert 'taskGroups().map(feedbackGroupResult)' in CORE_JS


_MUTATION_DRIVER = r'''
const fs = require("fs");
const vm = require("vm");
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
if (payload.checkSyntax) new vm.Script(payload.source);
new Function("require", "source", payload.probe)(require, payload.source);
'''


def _execute_behavioural_probe(source, probe):
    return subprocess.run(
        ["node", "-e", _MUTATION_DRIVER],
        cwd=ROOT,
        input=json.dumps({
            "source": source,
            "probe": probe,
            "checkSyntax": source.lstrip().startswith("(function"),
        }),
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def _function_span(source, name):
    match = re.search(rf"\bfunction\s+{re.escape(name)}\s*\(", source)
    assert match, f"{name}: mutation function target missing"
    brace = source.find("{", match.end())
    assert brace >= 0, f"{name}: mutation function body missing"
    depth = 0
    quote = None
    escaped = False
    line_comment = False
    block_comment = False
    index = brace
    while index < len(source):
        character = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""
        if line_comment:
            if character in "\r\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            if character == "*" and following == "/":
                block_comment = False
                index += 2
            else:
                index += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                quote = None
            index += 1
            continue
        if character == "/" and following == "/":
            line_comment = True
            index += 2
            continue
        if character == "/" and following == "*":
            block_comment = True
            index += 2
            continue
        if character in "\"'`":
            quote = character
        elif character == "{":
            depth += 1
        elif character == "}":
            depth -= 1
            if depth == 0:
                return match.start(), index + 1
        index += 1
    raise AssertionError(f"{name}: mutation function body is unclosed")


def _remove_test3_submit_guard(source):
    start, end = _function_span(source, "submitTest")
    function_source = source[start:end]
    pattern = re.compile(
        r'(?m)^[ \t]*if\s*\(\s*mode\s*===\s*"test"\s*&&\s*testSubmitted\s*\)\s*return;\s*\r?\n?'
    )
    mutated_function, count = pattern.subn("", function_source, count=1)
    assert count == 1, "submitTest: completed-Test mutation guard missing"
    return source[:start] + mutated_function + source[end:]


def _run_behavioural_mutant(spec):
    source = spec["source"]
    target = spec.get("target")
    if target is not None:
        assert target in source, f'{spec["name"]}: mutation target missing'
    baseline = _execute_behavioural_probe(source, spec["probe"])
    assert baseline.returncode == 0, (
        f'{spec["name"]}: baseline probe failed\ncommand: node -e <mutation driver>\n'
        f'exit status: {baseline.returncode}\nstdout:\n{baseline.stdout}\nstderr:\n{baseline.stderr}'
    )
    if spec.get("mutation") == "remove_test3_submit_guard":
        mutant = _remove_test3_submit_guard(source)
    else:
        mutant = source.replace(target, spec["replacement"], 1)
    if source.lstrip().startswith("(function"):
        syntax_source = mutant
    elif "<script" in source:
        inline_scripts = re.findall(r"<script(?:\s[^>]*)?>([\s\S]*?)</script>", mutant, flags=re.IGNORECASE)
        syntax_source = "\n".join(inline_scripts)
    else:
        syntax_source = ""
    if syntax_source:
        compiled = subprocess.run(
            ["node", "--check", "-"],
            cwd=ROOT,
            input=syntax_source,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        assert compiled.returncode == 0, (
            f'{spec["name"]}: mutant is not syntactically valid\ncommand: node --check -\n'
            f'exit status: {compiled.returncode}\nstdout:\n{compiled.stdout}\nstderr:\n{compiled.stderr}'
        )
    killed = _execute_behavioural_probe(mutant, spec["probe"])
    assert killed.returncode != 0, (
        f'{spec["name"]}: behavioural mutant survived\ncommand: node -e <mutation driver>\n'
        f'exit status: {killed.returncode}\nstdout:\n{killed.stdout}\nstderr:\n{killed.stderr}'
    )
    return {
        "name": spec["name"],
        "exit_status": killed.returncode,
        "stdout": killed.stdout,
        "stderr": killed.stderr,
    }


_FALLBACK_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) { config = value; capabilities = { hasTaskGroups: true, hasQuestionDetails: true }; },
  groups: taskGroups,
  details: questionDetails
};
  global.ReadingFeatureShell = {`);
const context = { window: { TEST3_GROUPS: [{ id: "leak" }], TEST3_DETAILS: { 1: ["leak"] } } };
vm.createContext(context);
vm.runInContext(source, context);
context.window.__mutation.configure({ study: {} });
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.window.__mutation.groups())), []);
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.window.__mutation.details())), {});
'''

_PRE_SUBMISSION_UI_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  run() {
    config = {
      test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
      state: { getMode() { return "study"; }, isTestSubmitted() { return false; }, getSubmittedResult() { return null; } },
      study: {}
    };
    capabilities = { hasAnswerKey: true, hasScoreGuide: true };
    initialized = true;
    elements = {
      root: { hidden: true, setAttribute() {} },
      answerKeyButton: {}, scoreGuideButton: {}, studyPill: {}, timer: {}, scoreFeedbackButton: {},
      scoreGuideBackdrop: { hidden: true }, answerKeyBackdrop: { hidden: true }, scoreFeedbackBackdrop: { hidden: true }
    };
    sync();
    return { answer: elements.answerKeyButton.hidden, guide: elements.scoreGuideButton.hidden };
  }
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { getElementById() { return null; }, querySelectorAll() { return []; } },
  console: { warn() {} },
  clearInterval() {}
}};
vm.createContext(context);
vm.runInContext(source, context);
const state = context.window.__mutation.run();
assert.strictEqual(state.answer, false, "Answer Key stayed hidden in fresh Study");
assert.strictEqual(state.guide, false, "Score guide stayed hidden before Study submission");
'''

_REVEAL_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = function () {
  const group = { id: "g", questions: [] };
  const button = { hidden: false, disabled: false, setAttribute() {} };
  config = {
    state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
    answers: { isCorrect() { return false; } },
    test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
    study: { taskGroups: [group] }
  };
  capabilities = { hasQuestionDetails: true };
  activeSubmittedResult = null;
  taskControls = [{ group, revealButton: button, result: { hidden: true }, strategyButton: { setAttribute() {} }, panel: {} }];
  toggleGroup(group);
  return { revealed: revealedGroups.has("g"), hidden: button.hidden, disabled: button.disabled };
};
  global.ReadingFeatureShell = {`);
const context = { window: { document: { getElementById() { return null; } } } };
vm.createContext(context);
vm.runInContext(source, context);
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.window.__mutation())), { revealed: true, hidden: false, disabled: false });
'''

_SNAPSHOT_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) {
    config = value; capabilities = validateConfig(value).capabilities; initialized = true;
    elements = {
      root: { setAttribute() {} }, answerKeyButton: {}, scoreGuideButton: {}, studyPill: {}, timer: {}, scoreFeedbackButton: {},
      scoreGuideBackdrop: { hidden: true }, answerKeyBackdrop: { hidden: true }, scoreFeedbackBackdrop: { hidden: true }
    };
  },
  sync,
  active() { return activeSubmittedResult; }
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { getElementById() { return null; }, querySelectorAll() { return []; } },
  console: { warn() {} }, clearInterval() {}
}};
vm.createContext(context);
vm.runInContext(source, context);
const ranges = { 1: { from: 1, to: 40 } };
let current = { submissionId: 1, rawScore: 1, band: 1, partScores: { 1: { score: 1, max: 40 } } };
const config = {
  version: 1, test: { totalQuestions: 40, partLabel: "Part", partRanges: ranges },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; }, getSubmittedResult() { return current; } },
  answers: { getAnswerKeyDisplay() { return ""; } }, navigation: { getQuestionTarget() { return null; } }, study: {}
};
const api = context.window.__mutation;
api.configure(config);
api.sync();
current = { submissionId: 1, rawScore: 2, band: 2, partScores: { 1: { score: 2, max: 40 } } };
api.sync();
assert.strictEqual(api.active().rawScore, 1, "same submissionId refreshed the Study snapshot");
'''

_MALFORMED_OUTCOMES_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) { config = value; },
  read: submittedResult
};
  global.ReadingFeatureShell = {`);
const context = { window: { console: { warn() {} } } };
vm.createContext(context);
vm.runInContext(source, context);
const value = {
  submissionId: 1, rawScore: 0, band: 0,
  partScores: { 1: { score: 0, max: 40 } },
  questionOutcomes: { 1: true }
};
context.window.__mutation.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getSubmittedResult() { return value; } }
});
assert(context.window.__mutation.read(), "malformed outcomes invalidated independent base review");
'''

_SCORE_GUIDE_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
function node(tag) {
  return {
    tagName: tag, children: [], hidden: false, textContent: "", className: "",
    append(...items) { this.children.push(...items); },
    setAttribute() {}, addEventListener() {}
  };
}
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  run(value) {
    config = value;
    capabilities = validateConfig(value).capabilities;
    if (!capabilities.hasScoreGuide) return { enabled: false, renderedRows: 0 };
    var guide = buildScoreGuide();
    elements = { scoreGuideBody: guide.body, scoreGuideSummary: guide.summary };
    updateScoreGuide();
    return { enabled: true, renderedRows: guide.body.children.length };
  }
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { querySelector() { return null; }, createElement(tag) { return node(tag); } },
  console: { warn() {} }
} };
vm.createContext(context);
vm.runInContext(source, context);
const rendered = context.window.__mutation.run({
  version: 1,
  test: { totalQuestions: 40, partLabel: "Part", partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  answers: { getAnswerKeyDisplay() { return ""; } },
  navigation: { getQuestionTarget() { return null; } },
  study: { scoreGuide: { title: "Guide", intro: "Intro", rows: [null] } }
});
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(rendered)),
  { enabled: false, renderedRows: 0 },
  "malformed score-guide row reached buildScoreGuide() / updateScoreGuide()"
);
'''

_DOM_RESULT_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) { config = value; studyReviewSubmitted = true; reviewOverlayWasOpen = true; domSubmissionSequence = 1; },
  read: submittedResult
};
  global.ReadingFeatureShell = {`);
const scoreLine = { textContent: "0 out of 40" };
const bandLine = { textContent: "Band: 0" };
const context = { window: {
  document: { getElementById(id) { return id === "scoreLine" ? scoreLine : id === "bandLine" ? bandLine : null; } },
  console: { warn() {} }
}};
vm.createContext(context);
vm.runInContext(source, context);
context.window.__mutation.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  answers: { isCorrect() { return false; } }
});
assert.strictEqual(context.window.__mutation.read(), null, "DOM parsing occurred without explicit opt-in");
'''

_CALLBACK_PRIORITY_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) { config = value; studyReviewSubmitted = true; reviewOverlayWasOpen = true; domSubmissionSequence = 1; },
  read: submittedResult
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { getElementById(id) {
    if (id === "scoreLine") return { textContent: "0 out of 40" };
    if (id === "bandLine") return { textContent: "Band: 0" };
    return null;
  } },
  console: { warn() {} }
}};
vm.createContext(context);
vm.runInContext(source, context);
context.window.__mutation.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: {
    getMode() { return "study"; }, isTestSubmitted() { return false; },
    getSubmittedResult() { return { submissionId: 1, rawScore: 3, band: 2.5, partScores: { 1: { score: 3, max: 40 } } }; }
  },
  answers: { isCorrect() { return false; } },
  compatibility: { allowDomSubmittedResult: true }
});
assert.strictEqual(context.window.__mutation.read().rawScore, 3, "authoritative callback lost priority to DOM");
'''

_COMPLETE_METADATA_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
function node(tag) {
  return {
    tagName: tag, children: [], hidden: false, className: "", textContent: "",
    append(...items) { this.children.push(...items); },
    setAttribute() {}, addEventListener() {}
  };
}
function hasClass(root, className) {
  return root.className === className || root.children.some(child => hasClass(child, className));
}
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  run(value, result) {
    config = value;
    capabilities = validateConfig(value).capabilities;
    activeSubmittedResult = result;
    submittedOutcomes = result.questionOutcomes;
    var body = global.document.createElement("div");
    elements = { scoreFeedbackBody: body };
    renderScoreFeedback();
    return {
      complete: capabilities.hasCompleteTaskGroups,
      taskAdviceRendered: body.children.some(function scan(child) {
        return child.className === "reading-shell-score-feedback-subheading" ||
          (child.children || []).some(scan);
      })
    };
  }
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { querySelector(selector) { return selector === "#partial" ? {} : null; }, createElement(tag) { return node(tag); } },
  console: { warn() {} }
} };
vm.createContext(context);
vm.runInContext(source, context);
const config = {
  version: 1,
  test: { totalQuestions: 40, partLabel: "Section", partRanges: { 1: { from: 1, to: 40 } } },
  state: { getMode() { return "study"; }, isTestSubmitted() { return false; } },
  answers: { getAnswerKeyDisplay() { return ""; } },
  navigation: { getQuestionTarget() { return null; } },
  study: {
    completeQuestionCoverage: false,
    taskGroups: [{
      id: "partial", label: "Partial", part: 1, textId: "a", questions: [1, 2, 3],
      controlHost: "#partial", purpose: "Find evidence.", trap: "Do not guess.", steps: ["Check the text."]
    }]
  }
};
const outcomes = {};
for (let question = 1; question <= 40; question += 1) outcomes[question] = question <= 3;
const rendered = context.window.__mutation.run(config, {
  submissionId: 1, rawScore: 3, band: 2.5, partScores: { 1: { score: 3, max: 40 } }, questionOutcomes: outcomes
});
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(rendered)),
  { complete: false, taskAdviceRendered: false },
  "reading-shell-score-feedback-subheading rendered without complete metadata"
);
'''

_TEST3_RESUBMISSION_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
function extractInlineScript(html) {
  const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi), match => match[1]);
  if (!scripts.length) throw new Error("missing inline script");
  return scripts.join("\n");
}
const embedded = extractInlineScript(source);
new vm.Script(embedded);
function body(name) {
  const marker = "function " + name + "(";
  const start = embedded.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const brace = embedded.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = brace; index < embedded.length; index += 1) {
    const character = embedded[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return embedded.slice(start, index + 1);
    }
  }
  throw new Error("unclosed " + name);
}
const requiredFunctions = [
  body("getUserAnswer"),
  body("getChooseTwoCorrectCount"),
  body("setQuestionFeedback"),
  body("evaluateQuestions"),
  body("computeBandScore"),
  body("formatDuration"),
  body("handlePrimarySubmit"),
  body("confirmSubmit"),
  body("disablePrimarySubmitControls"),
  body("submitTest")
];
const controls = [
  { disabled: false, setAttribute() {} },
  { disabled: false, setAttribute() {} }
];
const answerInput = { value: "FALSE", disabled: false };
let answerReads = 0;
const nodes = new Map();
function node(id) {
  if (!nodes.has(id)) {
    nodes.set(id, {
      id, textContent: "", style: {},
      classList: { add() {}, remove() {} }
    });
  }
  return nodes.get(id);
}
const document = {
  querySelectorAll(selector) {
    if (selector === ".submit-button, .check-btn") return controls;
    if (selector === "#questionContent select, #questionContent input") return [answerInput];
    if (selector.includes("input[type='checkbox']") || selector.includes("input[type='radio']")) return [];
    return [];
  },
  querySelector(selector) {
    if (selector === "input[type='text'][name='q1']") {
      answerReads += 1;
      return answerInput;
    }
    return null;
  },
  getElementById(id) { return node(id); }
};
const context = {
  document,
  window: null,
  console,
  clearInterval() {},
  updateCounts() {},
  buildQuestionNav() {},
  getQuestionTarget() { return null; },
  getBandDescriptor() { return { level: "fixture", description: "fixture" }; },
  hideFullscreenLockOverlay() {},
  exitAppFullscreen() {},
  toggleOptions() {},
  getAnswerReads() { return answerReads; },
  confirm() { return true; }
};
context.window = context;
context.IELTS16AcademicTest3StudyFeedback = { chooseTwoAnswers: {} };
vm.createContext(context);
const runtime = [
  'let mode = "test";',
  'let timerSeconds = 3600;',
  'let timerId = 1;',
  'let testSubmitted = false;',
  'let isTimerPaused = false;',
  'let studentName = "Fixture";',
  'let isTestRunning = true;',
  'let fullScreenExits = 0;',
  'let focusViolations = 0;',
  'const answerKey = { 1: "FALSE" };',
  'const correctAnswerText = { 1: "FALSE" };',
  requiredFunctions.join("\n"),
  'globalThis.__engine = {',
  '  handlePrimarySubmit,',
  '  submitTest,',
  '  state() {',
  '    return {',
  '      testSubmitted,',
  '      isTestRunning,',
  '      score: document.getElementById("scoreLine").textContent,',
  '      answerReads: getAnswerReads()',
  '    };',
  '  }',
  '};'
].join("\n");
new vm.Script(runtime);
vm.runInContext(runtime, context);
context.__engine.handlePrimarySubmit();
const first = context.__engine.state();
assert.strictEqual(first.answerReads, 1, "real evaluateQuestions() did not read Q1 on first submission");
assert.strictEqual(first.testSubmitted, true, "real submitTest() did not set the final Test state");
assert.strictEqual(first.isTestRunning, false, "real submitTest() left the Test running");
assert(first.score.includes("1 out of 40"), "real evaluator did not produce the baseline score: " + first.score);
assert(controls.every(control => control.disabled), "real submitTest() did not disable both primary controls");
answerInput.value = "TRUE";
context.__engine.handlePrimarySubmit();
context.__engine.submitTest();
const final = context.__engine.state();
assert.strictEqual(final.answerReads, first.answerReads, "completed Test executed real evaluateQuestions() again");
assert.strictEqual(final.score, first.score, "completed Test final result changed after resubmission");
assert(controls.every(control => control.disabled), "completed Test controls were re-enabled");
'''

_CALLBACK_EXCEPTION_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = {
  configure(value) { config = value; },
  read: submittedResult
};
  global.ReadingFeatureShell = {`);
const context = { window: { console: { warn() {} } } };
vm.createContext(context);
vm.runInContext(source, context);
context.window.__mutation.configure({
  test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
  state: { getSubmittedResult() { throw new Error("boom"); } }
});
assert.doesNotThrow(function () { context.window.__mutation.read(); }, "submitted-result callback exception escaped uncaught");
'''

_CLUE_AUDIT_PROBE = r'''
const assert = require("assert");
const vm = require("vm");
source = source.replace("  global.ReadingFeatureShell = {", `  global.__mutation = function () {
  config = {
    test: { totalQuestions: 40, partRanges: { 1: { from: 1, to: 40 } } },
    study: { taskGroups: [{ id: "g", part: 1, textId: "a", questions: [1] }], questionDetails: { 1: ["Why", "Skill", "missing"] } },
    navigation: { getTextTarget() { return { textContent: "other", querySelectorAll() { return []; }, normalize() {} }; } }
  };
  capabilities = { hasTaskGroups: true, hasQuestionDetails: true, hasPassageClues: true };
  auditClueCapability();
  var context = resolveClueMapContext({ part: 1, textId: "a" }, false);
  return {
    globalAvailable: capabilities.hasPassageClues,
    contextAvailable: clueContextStates.get(context.key).available
  };
};
  global.ReadingFeatureShell = {`);
const context = { window: {
  document: { querySelectorAll() { return []; }, getElementById() { return null; } },
  console: { warn() {} }
} };
vm.createContext(context);
vm.runInContext(source, context);
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(context.window.__mutation())),
  { globalAvailable: true, contextAvailable: false },
  "failed clue context did not disable locally while preserving the global capability"
);
'''


BEHAVIOURAL_MUTANTS = [
    {
        "name": "Test 3 fallback reintroduced",
        "source": CORE_JS,
        "target": 'function taskGroups() { if (!hasOwn(config && config.study, "taskGroups")) return [];',
        "replacement": 'function taskGroups() { if (!hasOwn(config && config.study, "taskGroups")) return global.TEST3_GROUPS || [];',
        "probe": _FALLBACK_PROBE,
    },
    {
        "name": "missing task data activates unrelated data",
        "source": CORE_JS,
        "target": 'function questionDetails() { if (!hasOwn(config && config.study, "questionDetails")) return {};',
        "replacement": 'function questionDetails() { if (!hasOwn(config && config.study, "questionDetails")) return global.TEST3_DETAILS || {};',
        "probe": _FALLBACK_PROBE,
    },
    {
        "name": "Answer Key hidden before Study submission",
        "source": CORE_JS,
        "target": "learningResources && capabilities.hasAnswerKey",
        "replacement": "showRoot && hasSubmission && capabilities.hasAnswerKey",
        "probe": _PRE_SUBMISSION_UI_PROBE,
    },
    {
        "name": "Score guide hidden before Study submission",
        "source": CORE_JS,
        "target": "showRoot && capabilities.hasScoreGuide",
        "replacement": "showRoot && hasSubmission && capabilities.hasScoreGuide",
        "probe": _PRE_SUBMISSION_UI_PROBE,
    },
    {
        "name": "fresh Study learning resources require submission",
        "source": CORE_JS,
        "target": 'if (currentMode() === "study") return true;',
        "replacement": 'if (currentMode() === "study") return false;',
        "probe": _REVEAL_PROBE,
    },
    {
        "name": "same submissionId refreshes Study snapshot",
        "source": CORE_JS,
        "target": "candidate.submissionId !== lastSubmissionId",
        "replacement": "true",
        "probe": _SNAPSHOT_PROBE,
    },
    {
        "name": "malformed outcomes invalidate independent base review",
        "source": CORE_JS,
        "target": "return copySubmittedResult(authoritative);",
        "replacement": "if (validateQuestionOutcomes(authoritative.questionOutcomes)) return null; return copySubmittedResult(authoritative);",
        "probe": _MALFORMED_OUTCOMES_PROBE,
    },
    {
        "name": "malformed Score-guide row reaches rendering",
        "source": CORE_JS,
        "target": 'hasScoreGuide: hasOwn(value.study, "scoreGuide") && !scoreGuideError',
        "replacement": 'hasScoreGuide: hasOwn(value.study, "scoreGuide")',
        "probe": _SCORE_GUIDE_PROBE,
    },
    {
        "name": "DOM parsing occurs without explicit opt-in",
        "source": CORE_JS,
        "target": "if (!(config && config.compatibility && config.compatibility.allowDomSubmittedResult)) return null;",
        "replacement": "if (false && !(config && config.compatibility && config.compatibility.allowDomSubmittedResult)) return null;",
        "probe": _DOM_RESULT_PROBE,
    },
    {
        "name": "authoritative callback loses priority to DOM",
        "source": CORE_JS,
        "target": 'if (config && config.state && hasFunction(config.state, "getSubmittedResult")) {',
        "replacement": 'if (false && config && config.state && hasFunction(config.state, "getSubmittedResult")) {',
        "probe": _CALLBACK_PRIORITY_PROBE,
    },
    {
        "name": "task advice renders without complete metadata",
        "source": CORE_JS,
        "target": "hasCompleteTaskGroups: hasTaskGroups && value.study.completeQuestionCoverage === true",
        "replacement": "hasCompleteTaskGroups: hasTaskGroups",
        "probe": _COMPLETE_METADATA_PROBE,
    },
    {
        "name": "Test 3 final resubmission remains possible",
        "source": HTML,
        "mutation": "remove_test3_submit_guard",
        "probe": _TEST3_RESUBMISSION_PROBE,
    },
    {
        "name": "submitted-result callback exception escapes uncaught",
        "source": CORE_JS,
        "target": 'reportErrorOnce("ReadingFeatureShell state.getSubmittedResult() threw an exception; submitted review is unavailable.");\n        return null;',
        "replacement": 'reportErrorOnce("ReadingFeatureShell state.getSubmittedResult() threw an exception; submitted review is unavailable.");\n        throw error;',
        "probe": _CALLBACK_EXCEPTION_PROBE,
    },
    {
        "name": "clue capability remains active after evidence-resolution failure",
        "source": CORE_JS,
        "target": "state.available = false;",
        "replacement": "state.available = true;",
        "probe": _CLUE_AUDIT_PROBE,
    },
]


def test_capability_foundation_rejects_all_required_in_memory_mutations():
    results = [_run_behavioural_mutant(spec) for spec in BEHAVIOURAL_MUTANTS]
    assert len(results) == 14
    assert all(result["exit_status"] != 0 for result in results)


def test_r1_mutation_probe_runner_executes_mutated_runtime_paths():
    assert "_run_behavioural_mutant" in globals()
    assert "BEHAVIOURAL_MUTANTS" in globals()
    assert len(BEHAVIOURAL_MUTANTS) >= 14


def test_r2_named_mutation_probes_execute_rendering_and_complete_script_paths():
    assert "updateScoreGuide();" in _SCORE_GUIDE_PROBE
    assert "buildUi()" in _SCORE_GUIDE_PROBE or "buildScoreGuide()" in _SCORE_GUIDE_PROBE
    assert "renderScoreFeedback();" in _COMPLETE_METADATA_PROBE
    assert "reading-shell-score-feedback-subheading" in _COMPLETE_METADATA_PROBE
    assert "extractInlineScript" in _TEST3_RESUBMISSION_PROBE
    assert "new vm.Script" in _TEST3_RESUBMISSION_PROBE
    assert "submitTest" in _TEST3_RESUBMISSION_PROBE
    assert "evaluateQuestions" in _TEST3_RESUBMISSION_PROBE


def test_r3_test3_resubmission_probe_uses_real_page_owned_submission_engine():
    assert 'new Function("mode", "testSubmitted"' not in _TEST3_RESUBMISSION_PROBE
    assert 'body("evaluateQuestions")' in _TEST3_RESUBMISSION_PROBE
    assert 'body("submitTest")' in _TEST3_RESUBMISSION_PROBE
    assert 'body("confirmSubmit")' in _TEST3_RESUBMISSION_PROBE
    assert "evaluateQuestionsCalls += 1" not in _TEST3_RESUBMISSION_PROBE
