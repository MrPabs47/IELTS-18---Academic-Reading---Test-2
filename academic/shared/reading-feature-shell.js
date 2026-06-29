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
  var resultOpenCount = 0;
  var studyResultBaseline = 0;

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && Boolean(value.trim());
  }

  function hasFunction(owner, key) {
    return Boolean(owner && typeof owner[key] === "function");
  }

  function validatePartRange(range, part) {
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
    for (var i = 0; i < scoreGuide.rows.length; i += 1) {
      var row = scoreGuide.rows[i];
      if (!isPlainObject(row) || !isNonEmptyString(row.correctAnswers) || !isNonEmptyString(row.band)) {
        return "ReadingFeatureShell config.study.scoreGuide.rows must include non-empty correctAnswers and band strings.";
      }
    }
    return "";
  }

  function validateConfig(value) {
    var requiredParts = ["1", "2", "3"];
    var error = "";
    if (!isPlainObject(value)) error = "ReadingFeatureShell config must be an object.";
    else if (value.version !== 1) error = "ReadingFeatureShell config.version must be 1.";
    else if (!isPlainObject(value.test)) error = "ReadingFeatureShell config.test must be an object.";
    else if (!isNonEmptyString(value.test.id)) error = "ReadingFeatureShell config.test.id must be a non-empty string.";
    else if (!isNonEmptyString(value.test.title)) error = "ReadingFeatureShell config.test.title must be a non-empty string.";
    else if (value.test.totalQuestions !== 40) error = "ReadingFeatureShell config.test.totalQuestions must be 40.";
    else if (!isPlainObject(value.test.partRanges)) error = "ReadingFeatureShell config.test.partRanges must be an object.";
    else if (!isPlainObject(value.state)) error = "ReadingFeatureShell config.state must be an object.";
    else if (!hasFunction(value.state, "getMode")) error = "ReadingFeatureShell config.state.getMode must be a function.";
    else if (!hasFunction(value.state, "isTestSubmitted")) error = "ReadingFeatureShell config.state.isTestSubmitted must be a function.";
    else if (!hasFunction(value.state, "getActivePart")) error = "ReadingFeatureShell config.state.getActivePart must be a function.";
    else if (!isPlainObject(value.answers) || !hasFunction(value.answers, "getAnswerKeyDisplay")) error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    else if (!isPlainObject(value.navigation) || !hasFunction(value.navigation, "getQuestionTarget")) error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    else if (!isPlainObject(value.study)) error = "ReadingFeatureShell config.study must be an object.";
    else error = validateScoreGuide(value.study.scoreGuide);

    if (!error) {
      for (var i = 0; i < requiredParts.length; i += 1) {
        error = validatePartRange(value.test.partRanges[requiredParts[i]], requiredParts[i]);
        if (error) break;
      }
    }
    return { ok: !error, error: error };
  }

  function createElement(tagName, className, text) {
    var element = global.document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function formatStudyTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function updateStudyTimer() {
    if (elements && elements.studyTimerValue) elements.studyTimerValue.textContent = formatStudyTime(studyElapsedSeconds);
  }

  function stopStudyTimer() {
    if (studyTimerId) {
      global.clearInterval(studyTimerId);
      studyTimerId = null;
    }
  }

  function startStudyTimer() {
    stopStudyTimer();
    studyTimerId = global.setInterval(function () {
      if (!studySessionActive) return;
      studyElapsedSeconds += 1;
      updateStudyTimer();
    }, 1000);
  }

  function parseRange(text) {
    var match = String(text || "").trim().match(/^(\d+)(?:[–-](\d+))?$/);
    if (!match) return null;
    return { from: Number(match[1]), to: match[2] === undefined ? Number(match[1]) : Number(match[2]) };
  }

  function parseCurrentResult() {
    var scoreLine = global.document.getElementById("scoreLine");
    var bandLine = global.document.getElementById("bandLine");
    if (!scoreLine || !bandLine) return null;
    var scoreMatch = String(scoreLine.textContent || "").match(/(\d+)\s+out of\s+40/i);
    var bandMatch = String(bandLine.textContent || "").match(/band:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (!scoreMatch || !bandMatch) return null;
    return { rawScore: Number(scoreMatch[1]), band: bandMatch[1] };
  }

  function isCurrentStudyResultAvailable() {
    if (!config) return false;
    var mode = config.state.getMode();
    if (mode === "test") return Boolean(config.state.isTestSubmitted());
    return mode === "study" && resultOpenCount > studyResultBaseline;
  }

  function getCurrentResult() {
    var result = parseCurrentResult();
    if (!result || !isCurrentStudyResultAvailable()) return null;
    if (!Number.isInteger(result.rawScore) || result.rawScore < 0 || result.rawScore > config.test.totalQuestions) return null;
    return result;
  }

  function updateScoreGuide() {
    if (!elements || !config) return;
    var result = getCurrentResult();
    elements.scoreGuideSummary.textContent = "";
    elements.scoreGuideSummary.hidden = !result;
    if (result) elements.scoreGuideSummary.textContent = "Your score: " + result.rawScore + " / " + config.test.totalQuestions + " · Band " + result.band;

    elements.scoreGuideBody.textContent = "";
    config.study.scoreGuide.rows.forEach(function (row) {
      var range = parseRange(row.correctAnswers);
      var isCurrent = Boolean(result && range && result.rawScore >= range.from && result.rawScore <= range.to);
      var bodyRow = createElement("tr", isCurrent ? "reading-shell-score-guide-row reading-shell-current-score-row" : "reading-shell-score-guide-row");
      var rangeCell = createElement("td", "reading-shell-score-guide-cell");
      rangeCell.append(createElement("span", "reading-shell-score-guide-range", row.correctAnswers));
      if (isCurrent) rangeCell.append(createElement("span", "reading-shell-current-score-label", "Your current score"));
      bodyRow.append(rangeCell, createElement("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreGuideBody.append(bodyRow);
    });
  }

  function closeScoreGuide(restoreFocus) {
    if (!elements) return;
    elements.scoreGuideBackdrop.hidden = true;
    elements.scoreGuideBackdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus();
  }

  function openScoreGuide() {
    if (!elements || elements.scoreGuideButton.hidden) return;
    updateScoreGuide();
    lastOpener = global.document.activeElement;
    elements.scoreGuideBackdrop.hidden = false;
    elements.scoreGuideBackdrop.setAttribute("aria-hidden", "false");
    elements.scoreGuideClose.focus();
  }

  function closeAnswerKey(restoreFocus) {
    if (!elements) return;
    elements.answerKeyBackdrop.hidden = true;
    elements.answerKeyBackdrop.setAttribute("aria-hidden", "true");
    if (restoreFocus !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus();
  }

  function getPartForQuestion(questionNumber) {
    var keys = Object.keys(config.test.partRanges);
    for (var i = 0; i < keys.length; i += 1) {
      var part = keys[i];
      var range = config.test.partRanges[part];
      if (questionNumber >= range.from && questionNumber <= range.to) return Number(part);
    }
    return null;
  }

  function focusQuestion(questionNumber) {
    closeAnswerKey(false);
    var navigation = config.navigation;
    if (hasFunction(navigation, "focusQuestion")) {
      navigation.focusQuestion(questionNumber);
      return;
    }

    var part = getPartForQuestion(questionNumber);
    if (part !== null && typeof global.switchSection === "function") global.switchSection(part);
    global.setTimeout(function () {
      if (typeof global.scrollToQuestion === "function") {
        global.scrollToQuestion(questionNumber);
        return;
      }
      var target = navigation.getQuestionTarget(questionNumber);
      if (target && typeof target.scrollIntoView === "function") target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }

  function openAnswerKey() {
    if (!elements || elements.answerKeyButton.hidden) return;
    lastOpener = global.document.activeElement;
    elements.answerKeyBackdrop.hidden = false;
    elements.answerKeyBackdrop.setAttribute("aria-hidden", "false");
    elements.answerKeyClose.focus();
  }

  function buildScoreGuideDialog() {
    var backdrop = createElement("div", "reading-shell-score-guide-backdrop");
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");

    var dialog = createElement("div", "reading-shell-score-guide-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "reading-shell-score-guide-title");

    var header = createElement("div", "reading-shell-score-guide-header");
    var heading = createElement("div", "reading-shell-score-guide-title-group");
    var title = createElement("h2", "reading-shell-score-guide-title", config.study.scoreGuide.title);
    title.id = "reading-shell-score-guide-title";
    var intro = createElement("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro);
    heading.append(title, intro);

    var close = createElement("button", "reading-shell-score-guide-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close score guide");
    close.setAttribute("title", "Close score guide");
    header.append(heading, close);

    var summary = createElement("p", "reading-shell-score-guide-summary");
    summary.hidden = true;
    var scroll = createElement("div", "reading-shell-score-guide-scroll");
    var table = createElement("table", "reading-shell-score-guide-table");
    table.setAttribute("aria-label", "IELTS Academic Reading raw score conversion");
    var thead = createElement("thead", "reading-shell-score-guide-head");
    var headRow = createElement("tr", "reading-shell-score-guide-row");
    var correct = createElement("th", "reading-shell-score-guide-heading", "Correct answers");
    var band = createElement("th", "reading-shell-score-guide-heading", "Estimated band");
    correct.scope = "col";
    band.scope = "col";
    headRow.append(correct, band);
    thead.append(headRow);
    var tbody = createElement("tbody", "reading-shell-score-guide-body");
    table.append(thead, tbody);
    scroll.append(table);
    dialog.append(header, summary, scroll);
    backdrop.append(dialog);

    close.addEventListener("click", function () { closeScoreGuide(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeScoreGuide(true); });
    backdrop.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeScoreGuide(true);
      }
    });

    return { backdrop: backdrop, close: close, summary: summary, body: tbody };
  }

  function buildAnswerKeyDialog() {
    var backdrop = createElement("div", "reading-shell-answer-key-backdrop");
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");

    var dialog = createElement("div", "reading-shell-answer-key-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "reading-shell-answer-key-title");

    var header = createElement("div", "reading-shell-answer-key-header");
    var heading = createElement("div", "reading-shell-answer-key-title-group");
    var title = createElement("h2", "reading-shell-answer-key-title", "Answer Key");
    title.id = "reading-shell-answer-key-title";
    heading.append(title, createElement("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–40"));

    var close = createElement("button", "reading-shell-answer-key-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close answer key");
    close.setAttribute("title", "Close answer key");
    header.append(heading, close);

    var scroll = createElement("div", "reading-shell-answer-key-scroll");
    var grid = createElement("div", "reading-shell-answer-key-grid");
    ["1", "2", "3"].forEach(function (part) {
      var range = config.test.partRanges[part];
      var section = createElement("section", "reading-shell-answer-key-section");
      var sectionTitle = createElement("h3", "reading-shell-answer-key-section-title", "Part " + part + ": Questions " + range.from + "–" + range.to);
      var list = createElement("div", "reading-shell-answer-key-list");
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var item = createElement("button", "reading-shell-answer-key-item");
        item.type = "button";
        item.setAttribute("aria-label", "Go to question " + questionNumber);
        item.append(
          createElement("span", "reading-shell-answer-key-number", String(questionNumber)),
          createElement("span", "reading-shell-answer-key-answer", String(config.answers.getAnswerKeyDisplay(questionNumber) || ""))
        );
        item.addEventListener("click", focusQuestion.bind(null, questionNumber));
        list.append(item);
      }
      section.append(sectionTitle, list);
      grid.append(section);
    });
    scroll.append(grid);
    dialog.append(header, scroll);
    backdrop.append(dialog);

    close.addEventListener("click", function () { closeAnswerKey(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeAnswerKey(true); });
    backdrop.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAnswerKey(true);
      }
    });

    return { backdrop: backdrop, close: close };
  }

  function installShellStyles() {
    if (global.document.getElementById("reading-shell-answer-key-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-answer-key-styles";
    style.textContent = ".reading-shell-root{flex-wrap:wrap;justify-content:flex-end}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-current-score-row .reading-shell-score-guide-cell{background:rgba(34,197,94,.14);border-bottom-color:rgba(34,197,94,.45)}.reading-shell-score-guide-range{display:inline-block;margin-right:8px}.reading-shell-current-score-label{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.45);border-radius:999px;display:inline-flex;font-size:.78rem;font-weight:800;line-height:1.1;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;line-height:1.2;padding:5px 10px;white-space:nowrap}.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.18);outline:2px solid transparent}.reading-shell-answer-key-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-answer-key-backdrop[hidden]{display:none!important}.reading-shell-answer-key-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(760px,96vw)}.reading-shell-answer-key-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-answer-key-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-answer-key-intro{color:var(--text-soft);margin:0}.reading-shell-answer-key-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-answer-key-close:focus-visible,.reading-shell-answer-key-item:focus-visible{outline:3px solid rgba(37,99,235,.45);outline-offset:2px}.reading-shell-answer-key-scroll{min-height:0;overflow:auto}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.reading-shell-answer-key-section{background:var(--bg);border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.reading-shell-answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;font-weight:800;margin:0;padding:9px 10px}.reading-shell-answer-key-list{display:grid}.reading-shell-answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.reading-shell-answer-key-item:last-child{border-bottom:0}.reading-shell-answer-key-item:hover{background:var(--bg-secondary)}.reading-shell-answer-key-number{color:var(--text-soft);font-weight:800}.reading-shell-answer-key-answer{font-weight:700;min-width:0;overflow-wrap:anywhere}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}}";
    global.document.head.append(style);
  }

  function buildUi() {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) {
      lastError = "ReadingFeatureShell mount was not found.";
      global.console.warn("ReadingFeatureShell: " + lastError);
      return false;
    }
    mount.textContent = "";
    mount.removeAttribute("aria-hidden");
    installShellStyles();

    var root = createElement("div", "reading-shell-root");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");

    var scoreGuideButton = createElement("button", "reading-shell-score-guide-button", "📊 Score guide");
    scoreGuideButton.type = "button";
    scoreGuideButton.setAttribute("aria-haspopup", "dialog");

    var answerKeyButton = createElement("button", "reading-shell-answer-key-button", "Answer Key");
    answerKeyButton.type = "button";
    answerKeyButton.setAttribute("aria-haspopup", "dialog");

    var studyPill = createElement("span", "reading-shell-study-pill", "Study mode");
    var studyTimer = createElement("span", "reading-shell-study-timer");
    var timerLabel = createElement("span", "reading-shell-study-timer-label", "Study time: ");
    var timerValue = createElement("span", "reading-shell-study-timer-value", "00:00");
    studyTimer.append(timerLabel, timerValue);

    var scoreGuide = buildScoreGuideDialog();
    var answerKey = buildAnswerKeyDialog();

    root.append(scoreGuideButton, answerKeyButton, studyPill, studyTimer, scoreGuide.backdrop, answerKey.backdrop);
    mount.append(root);

    scoreGuideButton.addEventListener("click", openScoreGuide);
    answerKeyButton.addEventListener("click", openAnswerKey);

    elements = {
      root: root,
      scoreGuideButton: scoreGuideButton,
      answerKeyButton: answerKeyButton,
      studyPill: studyPill,
      studyTimer: studyTimer,
      studyTimerValue: timerValue,
      scoreGuideBackdrop: scoreGuide.backdrop,
      scoreGuideClose: scoreGuide.close,
      scoreGuideSummary: scoreGuide.summary,
      scoreGuideBody: scoreGuide.body,
      answerKeyBackdrop: answerKey.backdrop,
      answerKeyClose: answerKey.close
    };
    updateScoreGuide();
    return true;
  }

  function observeResultOverlay() {
    if (resultObserver || !global.MutationObserver) return;
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay) return;
    resultObserver = new global.MutationObserver(function () {
      global.setTimeout(function () {
        if (!config) return;
        if (String(overlay.style.display || "") === "flex") resultOpenCount += 1;
        sync();
        if (elements && !elements.scoreGuideBackdrop.hidden) updateScoreGuide();
      }, 0);
    });
    resultObserver.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }

  function sync() {
    if (!initialized || !config || !elements) return;
    var mode = config.state.getMode();
    var submitted = Boolean(config.state.isTestSubmitted());
    var inStudy = mode === "study";
    var testSubmitted = mode === "test" && submitted;
    var showRoot = inStudy || testSubmitted;

    elements.root.hidden = !showRoot;
    elements.root.setAttribute("aria-hidden", showRoot ? "false" : "true");
    elements.scoreGuideButton.hidden = !inStudy;
    elements.studyPill.hidden = !inStudy;
    elements.studyTimer.hidden = !inStudy;
    elements.answerKeyButton.hidden = !showRoot;

    if (!inStudy) {
      studySessionActive = false;
      stopStudyTimer();
      closeScoreGuide(false);
    }
    if (!showRoot) closeAnswerKey(false);
    if (inStudy && !elements.scoreGuideBackdrop.hidden) updateScoreGuide();
  }

  function startStudySession() {
    if (!initialized || !elements) return;
    studySessionActive = true;
    studyElapsedSeconds = 0;
    studyResultBaseline = resultOpenCount;
    updateStudyTimer();
    startStudyTimer();
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
    if (!buildUi()) {
      initialized = false;
      return { ok: false, error: lastError };
    }
    observeResultOverlay();
    updateStudyTimer();
    sync();
    return { ok: true, initialized: true };
  }

  function getStatus() {
    return {
      initialized: initialized,
      hasConfig: Boolean(config),
      version: config ? config.version : null,
      testId: config && config.test ? config.test.id : "",
      studySessionActive: studySessionActive,
      studyElapsedSeconds: studyElapsedSeconds,
      lastError: lastError
    };
  }

  global.ReadingFeatureShell = {
    init: init,
    sync: sync,
    startStudySession: startStudySession,
    getStatus: getStatus,
    validateConfig: validateConfig
  };
})(window);
