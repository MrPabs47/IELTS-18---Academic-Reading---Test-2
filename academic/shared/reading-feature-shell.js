(function (global) {
  "use strict";

  var config = null;
  var initialized = false;
  var lastError = "";
  var elements = null;
  var studyTimerId = null;
  var studyElapsedSeconds = 0;
  var studySessionActive = false;
  var lastOpener = null;
  var resultObserver = null;
  var resultEvents = 0;
  var studyResultBaseline = 0;

  function isPlainObject(value) { return Object.prototype.toString.call(value) === "[object Object]"; }
  function isNonEmptyString(value) { return typeof value === "string" && Boolean(value.trim()); }
  function hasFunction(owner, key) { return Boolean(owner && typeof owner[key] === "function"); }

  function validateRange(range, part) {
    if (!isPlainObject(range)) return "test.partRanges." + part + " must be an object.";
    if (!Number.isInteger(range.from) || !Number.isInteger(range.to)) return "test.partRanges." + part + " must include integer from/to values.";
    if (range.from < 1 || range.to < range.from) return "test.partRanges." + part + " must be a valid question range.";
    return "";
  }

  function validateScoreGuide(scoreGuide) {
    if (!isPlainObject(scoreGuide)) return "ReadingFeatureShell config.study.scoreGuide must be an object.";
    if (!isNonEmptyString(scoreGuide.title)) return "ReadingFeatureShell config.study.scoreGuide.title must be a non-empty string.";
    if (!isNonEmptyString(scoreGuide.intro)) return "ReadingFeatureShell config.study.scoreGuide.intro must be a non-empty string.";
    if (!Array.isArray(scoreGuide.rows) || !scoreGuide.rows.length) return "ReadingFeatureShell config.study.scoreGuide.rows must be a non-empty array.";
    return "";
  }

  function validateConfig(value) {
    var error = "";
    if (!isPlainObject(value)) error = "ReadingFeatureShell config must be an object.";
    else if (value.version !== 1) error = "ReadingFeatureShell config.version must be 1.";
    else if (!isPlainObject(value.test)) error = "ReadingFeatureShell config.test must be an object.";
    else if (!isNonEmptyString(value.test.id)) error = "ReadingFeatureShell config.test.id must be a non-empty string.";
    else if (!isNonEmptyString(value.test.title)) error = "ReadingFeatureShell config.test.title must be a non-empty string.";
    else if (value.test.totalQuestions !== 40) error = "ReadingFeatureShell config.test.totalQuestions must be 40.";
    else if (!isPlainObject(value.test.partRanges)) error = "ReadingFeatureShell config.test.partRanges must be an object.";
    else if (!isPlainObject(value.state) || !hasFunction(value.state, "getMode") || !hasFunction(value.state, "isTestSubmitted")) error = "ReadingFeatureShell config.state must provide getMode and isTestSubmitted.";
    else if (!isPlainObject(value.answers) || !hasFunction(value.answers, "getAnswerKeyDisplay")) error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    else if (!isPlainObject(value.navigation) || !hasFunction(value.navigation, "getQuestionTarget")) error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    else if (!isPlainObject(value.study)) error = "ReadingFeatureShell config.study must be an object.";
    else error = validateScoreGuide(value.study.scoreGuide);
    if (!error) {
      ["1", "2", "3"].forEach(function (part) { if (!error) error = validateRange(value.test.partRanges[part], part); });
    }
    return { ok: !error, error: error };
  }

  function el(tag, className, text) {
    var node = global.document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function formatTime(totalSeconds) {
    return String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0");
  }

  function updateTimer() {
    if (elements) elements.timerValue.textContent = formatTime(studyElapsedSeconds);
  }

  function stopTimer() {
    if (studyTimerId) { global.clearInterval(studyTimerId); studyTimerId = null; }
  }

  function startTimer() {
    stopTimer();
    studyTimerId = global.setInterval(function () {
      if (!studySessionActive) return;
      studyElapsedSeconds += 1;
      updateTimer();
    }, 1000);
  }

  function parseRange(text) {
    var match = String(text || "").trim().match(/^(\d+)(?:[–-](\d+))?$/);
    if (!match) return null;
    return { from: Number(match[1]), to: match[2] === undefined ? Number(match[1]) : Number(match[2]) };
  }

  function currentResult() {
    if (!config) return null;
    var mode = config.state.getMode();
    if (mode === "study" && resultEvents <= studyResultBaseline) return null;
    if (mode === "test" && !config.state.isTestSubmitted()) return null;
    var scoreLine = global.document.getElementById("scoreLine");
    var bandLine = global.document.getElementById("bandLine");
    var scoreMatch = scoreLine && String(scoreLine.textContent || "").match(/(\d+)\s+out of\s+40/i);
    var bandMatch = bandLine && String(bandLine.textContent || "").match(/band:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (!scoreMatch || !bandMatch) return null;
    return { rawScore: Number(scoreMatch[1]), band: bandMatch[1] };
  }

  function refreshScoreGuide() {
    if (!elements || !config) return;
    var result = currentResult();
    elements.scoreSummary.hidden = !result;
    elements.scoreSummary.textContent = result ? "Your score: " + result.rawScore + " / " + config.test.totalQuestions + " · Band " + result.band : "";
    elements.scoreBody.textContent = "";
    config.study.scoreGuide.rows.forEach(function (row) {
      var range = parseRange(row.correctAnswers);
      var isCurrent = Boolean(result && range && result.rawScore >= range.from && result.rawScore <= range.to);
      var tr = el("tr", isCurrent ? "reading-shell-score-guide-row reading-shell-current-score-row" : "reading-shell-score-guide-row");
      var rangeCell = el("td", "reading-shell-score-guide-cell");
      rangeCell.append(el("span", "reading-shell-score-guide-range", row.correctAnswers));
      if (isCurrent) rangeCell.append(el("span", "reading-shell-current-score-label", "Your current score"));
      tr.append(rangeCell, el("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreBody.append(tr);
    });
  }

  function closeDialog(backdrop, restoreFocus) {
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus();
  }

  function openScoreGuide() {
    if (!elements || elements.scoreButton.hidden) return;
    refreshScoreGuide();
    lastOpener = global.document.activeElement;
    elements.scoreBackdrop.hidden = false;
    elements.scoreBackdrop.setAttribute("aria-hidden", "false");
    elements.scoreClose.focus();
  }

  function closeScoreGuide(restoreFocus) { if (elements) closeDialog(elements.scoreBackdrop, restoreFocus); }

  function openAnswerKey() {
    if (!elements || elements.answerButton.hidden) return;
    lastOpener = global.document.activeElement;
    elements.answerBackdrop.hidden = false;
    elements.answerBackdrop.setAttribute("aria-hidden", "false");
    elements.answerClose.focus();
  }

  function closeAnswerKey(restoreFocus) { if (elements) closeDialog(elements.answerBackdrop, restoreFocus); }

  function openQuestion(questionNumber) {
    closeAnswerKey(false);
    if (hasFunction(config.navigation, "focusQuestion")) {
      config.navigation.focusQuestion(questionNumber);
      return;
    }
    var parts = Object.keys(config.test.partRanges);
    for (var i = 0; i < parts.length; i += 1) {
      var range = config.test.partRanges[parts[i]];
      if (questionNumber >= range.from && questionNumber <= range.to && typeof global.switchSection === "function") {
        global.switchSection(Number(parts[i]));
        break;
      }
    }
    global.setTimeout(function () {
      var target = config.navigation.getQuestionTarget(questionNumber);
      if (target && typeof target.scrollIntoView === "function") target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  }

  function makeBackdrop(className, label, titleText, closeLabel, onClose) {
    var backdrop = el("div", className + "-backdrop");
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");
    var dialog = el("div", className + "-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", label);
    var header = el("div", className + "-header");
    var titleGroup = el("div", className + "-title-group");
    var title = el("h2", className + "-title", titleText);
    title.id = label;
    var close = el("button", className + "-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", closeLabel);
    close.setAttribute("title", closeLabel);
    header.append(titleGroup, close);
    dialog.append(header);
    backdrop.append(dialog);
    close.addEventListener("click", function () { onClose(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) onClose(true); });
    backdrop.addEventListener("keydown", function (event) { if (event.key === "Escape") { event.preventDefault(); onClose(true); } });
    return { backdrop: backdrop, dialog: dialog, titleGroup: titleGroup, close: close };
  }

  function buildScoreGuide() {
    var shell = makeBackdrop("reading-shell-score-guide", "reading-shell-score-guide-title", config.study.scoreGuide.title, "Close score guide", closeScoreGuide);
    shell.titleGroup.append(el("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro));
    var summary = el("p", "reading-shell-score-guide-summary");
    summary.hidden = true;
    var scroll = el("div", "reading-shell-score-guide-scroll");
    var table = el("table", "reading-shell-score-guide-table");
    table.setAttribute("aria-label", "IELTS Academic Reading raw score conversion");
    var thead = el("thead", "reading-shell-score-guide-head");
    var row = el("tr", "reading-shell-score-guide-row");
    var correct = el("th", "reading-shell-score-guide-heading", "Correct answers");
    var band = el("th", "reading-shell-score-guide-heading", "Estimated band");
    correct.scope = "col";
    band.scope = "col";
    row.append(correct, band);
    thead.append(row);
    var body = el("tbody", "reading-shell-score-guide-body");
    table.append(thead, body);
    scroll.append(table);
    shell.dialog.append(summary, scroll);
    return { backdrop: shell.backdrop, close: shell.close, summary: summary, body: body };
  }

  function buildAnswerKey() {
    var shell = makeBackdrop("reading-shell-answer-key", "reading-shell-answer-key-title", "Answer Key", "Close answer key", closeAnswerKey);
    shell.titleGroup.append(el("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–40"));
    var scroll = el("div", "reading-shell-answer-key-scroll");
    var grid = el("div", "reading-shell-answer-key-grid");
    ["1", "2", "3"].forEach(function (part) {
      var range = config.test.partRanges[part];
      var section = el("section", "reading-shell-answer-key-section");
      section.append(el("h3", "reading-shell-answer-key-section-title", "Part " + part + ": Questions " + range.from + "–" + range.to));
      var list = el("div", "reading-shell-answer-key-list");
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var item = el("button", "reading-shell-answer-key-item");
        item.type = "button";
        item.setAttribute("aria-label", "Go to question " + questionNumber);
        item.append(el("span", "reading-shell-answer-key-number", String(questionNumber)), el("span", "reading-shell-answer-key-answer", String(config.answers.getAnswerKeyDisplay(questionNumber) || "")));
        item.addEventListener("click", openQuestion.bind(null, questionNumber));
        list.append(item);
      }
      section.append(list);
      grid.append(section);
    });
    scroll.append(grid);
    shell.dialog.append(scroll);
    return { backdrop: shell.backdrop, close: shell.close };
  }

  function installStyles() {
    if (global.document.getElementById("reading-shell-extra-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-extra-styles";
    style.textContent = ".reading-shell-root{flex-wrap:wrap;justify-content:flex-end}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-current-score-row .reading-shell-score-guide-cell{background:rgba(34,197,94,.14);border-bottom-color:rgba(34,197,94,.45)}.reading-shell-score-guide-range{display:inline-block;margin-right:8px}.reading-shell-current-score-label{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.45);border-radius:999px;display:inline-flex;font-size:.78rem;font-weight:800;line-height:1.1;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-size:1rem;font-weight:700;line-height:1.2;padding:5px 10px;white-space:nowrap}.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.18);outline:2px solid transparent}.reading-shell-answer-key-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-answer-key-backdrop[hidden]{display:none!important}.reading-shell-answer-key-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(760px,96vw)}.reading-shell-answer-key-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-answer-key-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-answer-key-intro{color:var(--text-soft);margin:0}.reading-shell-answer-key-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-answer-key-close:focus-visible,.reading-shell-answer-key-item:focus-visible{outline:3px solid rgba(37,99,235,.45);outline-offset:2px}.reading-shell-answer-key-scroll{min-height:0;overflow:auto}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.reading-shell-answer-key-section{background:var(--bg);border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.reading-shell-answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;font-weight:800;margin:0;padding:9px 10px}.reading-shell-answer-key-list{display:grid}.reading-shell-answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.reading-shell-answer-key-item:last-child{border-bottom:0}.reading-shell-answer-key-item:hover{background:var(--bg-secondary)}.reading-shell-answer-key-number{color:var(--text-soft);font-weight:800}.reading-shell-answer-key-answer{font-weight:700;min-width:0;overflow-wrap:anywhere}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}}";
    global.document.head.append(style);
  }

  function buildUi() {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) { lastError = "ReadingFeatureShell mount was not found."; global.console.warn("ReadingFeatureShell: " + lastError); return false; }
    mount.textContent = "";
    mount.removeAttribute("aria-hidden");
    installStyles();

    var root = el("div", "reading-shell-root");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    var scoreButton = el("button", "reading-shell-score-guide-button", "📊 Score guide");
    scoreButton.type = "button";
    scoreButton.setAttribute("aria-haspopup", "dialog");
    var answerButton = el("button", "reading-shell-answer-key-button", "🔑");
    answerButton.type = "button";
    answerButton.setAttribute("aria-label", "Answer Key");
    answerButton.setAttribute("title", "Answer Key");
    answerButton.setAttribute("aria-haspopup", "dialog");
    var studyPill = el("span", "reading-shell-study-pill", "Study mode");
    var timer = el("span", "reading-shell-study-timer");
    var timerValue = el("span", "reading-shell-study-timer-value", "00:00");
    timer.append(el("span", "reading-shell-study-timer-label", "Study time: "), timerValue);
    var scoreGuide = buildScoreGuide();
    var answerKey = buildAnswerKey();
    root.append(scoreButton, answerButton, studyPill, timer, scoreGuide.backdrop, answerKey.backdrop);
    mount.append(root);
    scoreButton.addEventListener("click", openScoreGuide);
    answerButton.addEventListener("click", openAnswerKey);
    elements = { root: root, scoreButton: scoreButton, answerButton: answerButton, studyPill: studyPill, timer: timer, timerValue: timerValue, scoreBackdrop: scoreGuide.backdrop, scoreClose: scoreGuide.close, scoreSummary: scoreGuide.summary, scoreBody: scoreGuide.body, answerBackdrop: answerKey.backdrop, answerClose: answerKey.close };
    refreshScoreGuide();
    return true;
  }

  function observeResults() {
    if (resultObserver || !global.MutationObserver) return;
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay) return;
    resultObserver = new global.MutationObserver(function () {
      global.setTimeout(function () {
        if (String(overlay.style.display || "") === "flex") resultEvents += 1;
        sync();
        if (elements && !elements.scoreBackdrop.hidden) refreshScoreGuide();
      }, 0);
    });
    resultObserver.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }

  function sync() {
    if (!initialized || !config || !elements) return;
    var mode = config.state.getMode();
    var submitted = Boolean(config.state.isTestSubmitted());
    var studyMode = mode === "study";
    var completedTest = mode === "test" && submitted;
    var showScoreGuide = studyMode || completedTest;
    var showRoot = showScoreGuide;
    elements.root.hidden = !showRoot;
    elements.root.setAttribute("aria-hidden", showRoot ? "false" : "true");
    elements.scoreButton.hidden = !showScoreGuide;
    elements.answerButton.hidden = !showRoot;
    elements.studyPill.hidden = !studyMode;
    elements.timer.hidden = !studyMode;
    if (!studyMode) { studySessionActive = false; stopTimer(); closeScoreGuide(false); }
    if (!showRoot) closeAnswerKey(false);
    if (showScoreGuide && !elements.scoreBackdrop.hidden) refreshScoreGuide();
  }

  function startStudySession() {
    if (!initialized || !elements) return;
    studySessionActive = true;
    studyElapsedSeconds = 0;
    studyResultBaseline = resultEvents;
    updateTimer();
    startTimer();
    sync();
  }

  function init(value) {
    var validation = validateConfig(value);
    if (!validation.ok) {
      config = null;
      initialized = false;
      lastError = validation.error;
      global.console.warn("ReadingFeatureShell: " + validation.error);
      return { ok: false, error: validation.error };
    }
    config = value;
    initialized = true;
    lastError = "";
    studyElapsedSeconds = 0;
    studySessionActive = false;
    if (!buildUi()) { initialized = false; return { ok: false, error: lastError }; }
    observeResults();
    updateTimer();
    sync();
    return { ok: true, initialized: true };
  }

  function getStatus() {
    return { initialized: initialized, hasConfig: Boolean(config), version: config ? config.version : null, testId: config && config.test ? config.test.id : "", studySessionActive: studySessionActive, studyElapsedSeconds: studyElapsedSeconds, lastError: lastError };
  }

  global.ReadingFeatureShell = { init: init, sync: sync, startStudySession: startStudySession, getStatus: getStatus, validateConfig: validateConfig };
})(window);
