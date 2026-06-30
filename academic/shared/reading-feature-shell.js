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

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && Boolean(value.trim());
  }

  function hasFunction(owner, key) {
    return Boolean(owner && typeof owner[key] === "function");
  }

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
      ["1", "2", "3"].forEach(function (part) {
        if (!error) error = validateRange(value.test.partRanges[part], part);
      });
    }
    return { ok: !error, error: error };
  }

  function createElement(tagName, className, text) {
    var node = global.document.createElement(tagName);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function formatTime(totalSeconds) {
    return String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0");
  }

  function updateStudyTimer() {
    if (elements) elements.timerValue.textContent = formatTime(studyElapsedSeconds);
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

  function getCurrentResult() {
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

  function isResultAvailable() {
    return Boolean(getCurrentResult());
  }

  function refreshScoreGuide() {
    if (!elements || !config) return;
    var result = getCurrentResult();
    elements.scoreSummary.hidden = !result;
    elements.scoreSummary.textContent = result ? "Your score: " + result.rawScore + " / " + config.test.totalQuestions + " · Band " + result.band : "";
    elements.scoreBody.textContent = "";

    config.study.scoreGuide.rows.forEach(function (row) {
      var range = parseRange(row.correctAnswers);
      var isCurrent = Boolean(result && range && result.rawScore >= range.from && result.rawScore <= range.to);
      var tableRow = createElement("tr", isCurrent ? "reading-shell-score-guide-row reading-shell-current-score-row" : "reading-shell-score-guide-row");
      var rangeCell = createElement("td", "reading-shell-score-guide-cell");
      rangeCell.append(createElement("span", "reading-shell-score-guide-range", row.correctAnswers));
      if (isCurrent) rangeCell.append(createElement("span", "reading-shell-current-score-label", "Your current score"));
      tableRow.append(rangeCell, createElement("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreBody.append(tableRow);
    });
  }

  function closeDialog(backdrop, restoreFocus) {
    if (!backdrop) return;
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

  function closeScoreGuide(restoreFocus) {
    if (elements) closeDialog(elements.scoreBackdrop, restoreFocus);
  }

  function openAnswerKey() {
    if (!elements || elements.answerButton.hidden) return;
    lastOpener = global.document.activeElement;
    elements.answerBackdrop.hidden = false;
    elements.answerBackdrop.setAttribute("aria-hidden", "false");
    elements.answerClose.focus();
  }

  function closeAnswerKey(restoreFocus) {
    if (elements) closeDialog(elements.answerBackdrop, restoreFocus);
  }

  function openQuestion(questionNumber) {
    closeAnswerKey(false);
    if (hasFunction(config.navigation, "focusQuestion")) {
      config.navigation.focusQuestion(questionNumber);
      return;
    }

    var parts = Object.keys(config.test.partRanges);
    for (var i = 0; i < parts.length; i += 1) {
      var partRange = config.test.partRanges[parts[i]];
      if (questionNumber >= partRange.from && questionNumber <= partRange.to && typeof global.switchSection === "function") {
        global.switchSection(Number(parts[i]));
        break;
      }
    }

    global.setTimeout(function () {
      var target = config.navigation.getQuestionTarget(questionNumber);
      if (target && typeof target.scrollIntoView === "function") target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  }

  function questionOutcome(questionNumber) {
    var target = config.navigation.getQuestionTarget(questionNumber);
    if (!target || !target.classList) return 0;
    if (target.classList.contains("correct")) return 1;
    if (target.classList.contains("partial-correct")) return 0.5;
    return 0;
  }

  function formatScore(score) {
    return Number.isInteger(score) ? String(score) : String(score.toFixed(1));
  }

  function partFeedback() {
    var feedback = [];
    ["1", "2", "3"].forEach(function (part) {
      var range = config.test.partRanges[part];
      var correct = 0;
      var review = [];
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var outcome = questionOutcome(questionNumber);
        correct += outcome;
        if (outcome < 1) review.push(questionNumber);
      }
      feedback.push({ part: part, total: range.to - range.from + 1, correct: correct, review: review });
    });
    return feedback;
  }

  function appendFeedbackCard(parent, title) {
    var card = createElement("section", "reading-shell-score-feedback-card");
    card.append(createElement("h3", "reading-shell-score-feedback-heading", title));
    parent.append(card);
    return card;
  }

  function renderScoreFeedback() {
    if (!elements || !config) return false;
    var result = getCurrentResult();
    if (!result) return false;

    var body = elements.feedbackBody;
    body.textContent = "";

    var overall = appendFeedbackCard(body, "Overall result");
    overall.append(createElement("p", "reading-shell-score-feedback-text", "You answered " + result.rawScore + " out of " + config.test.totalQuestions + " questions correctly."));
    overall.append(createElement("p", "reading-shell-score-feedback-text", "Estimated IELTS Academic Reading band: " + "Band " + result.band + "."));

    var parts = partFeedback();
    var performance = appendFeedbackCard(body, "Performance by part");
    var performanceList = createElement("div", "reading-shell-score-feedback-list");
    parts.forEach(function (item) {
      performanceList.append(createElement("div", "reading-shell-score-feedback-part-score", "Part " + item.part + ": " + formatScore(item.correct) + " / " + item.total));
    });
    performance.append(performanceList);

    parts.forEach(function (item) {
      var card = appendFeedbackCard(body, "Part " + item.part + " · " + formatScore(item.correct) + " / " + item.total);
      var ratio = item.total ? item.correct / item.total : 0;
      if (ratio >= 0.75) {
        card.append(createElement("h4", "reading-shell-score-feedback-subheading", "What went well"));
        card.append(createElement("p", "reading-shell-score-feedback-text", "You answered most questions in this part accurately. Keep using the same careful approach when you compare the question wording with the passage."));
      }
      if (ratio < 0.75) {
        card.append(createElement("h4", "reading-shell-score-feedback-subheading", "Focus next"));
        card.append(createElement("p", "reading-shell-score-feedback-text", "Open the Answer Key, compare the exact correct answers with your choices, and revisit the questions you were unsure about before checking again."));
      }
      if (item.review.length) {
        card.append(createElement("p", "reading-shell-score-feedback-muted", "Questions to review: " + item.review.join(", ") + "."));
      }
    });

    if (config.state.getMode() === "test") {
      var timeCard = appendFeedbackCard(body, "Time management");
      var timeLine = global.document.getElementById("totalTimeLine");
      var timeText = timeLine && String(timeLine.textContent || "").trim();
      if (timeText) timeCard.append(createElement("p", "reading-shell-score-feedback-text", timeText));
      timeCard.append(createElement("p", "reading-shell-score-feedback-text", "As a flexible guide, aim to finish Parts 1 and 2 in a little under 20 minutes each. This protects more time for the more challenging final part and a brief final check."));
    }
    return true;
  }

  function openScoreFeedback() {
    if (!elements || elements.feedbackButton.hidden || !renderScoreFeedback()) return;
    lastOpener = global.document.activeElement;
    elements.feedbackBackdrop.hidden = false;
    elements.feedbackBackdrop.setAttribute("aria-hidden", "false");
    elements.feedbackClose.focus();
  }

  function closeScoreFeedback(restoreFocus) {
    if (elements) closeDialog(elements.feedbackBackdrop, restoreFocus);
  }

  function makeBackdrop(className, titleId, titleText, closeLabel, closeHandler) {
    var backdrop = createElement("div", className + "-backdrop");
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");

    var dialog = createElement("div", className + "-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);

    var header = createElement("div", className + "-header");
    var titleGroup = createElement("div", className + "-title-group");
    var title = createElement("h2", className + "-title", titleText);
    title.id = titleId;
    titleGroup.append(title);

    var close = createElement("button", className + "-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", closeLabel);
    close.setAttribute("title", closeLabel);
    header.append(titleGroup, close);
    dialog.append(header);
    backdrop.append(dialog);

    close.addEventListener("click", function () { closeHandler(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeHandler(true); });
    backdrop.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeHandler(true);
      }
    });

    return { backdrop: backdrop, dialog: dialog, titleGroup: titleGroup, close: close };
  }

  function buildScoreGuide() {
    var shell = makeBackdrop("reading-shell-score-guide", "reading-shell-score-guide-title", config.study.scoreGuide.title, "Close score guide", closeScoreGuide);
    shell.titleGroup.append(createElement("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro));
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
    var body = createElement("tbody", "reading-shell-score-guide-body");
    table.append(thead, body);
    scroll.append(table);
    shell.dialog.append(summary, scroll);
    return { backdrop: shell.backdrop, close: shell.close, summary: summary, body: body };
  }

  function buildAnswerKey() {
    var shell = makeBackdrop("reading-shell-answer-key", "reading-shell-answer-key-title", "Answer Key", "Close answer key", closeAnswerKey);
    shell.titleGroup.append(createElement("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–40"));
    var scroll = createElement("div", "reading-shell-answer-key-scroll");
    var grid = createElement("div", "reading-shell-answer-key-grid");

    ["1", "2", "3"].forEach(function (part) {
      var range = config.test.partRanges[part];
      var section = createElement("section", "reading-shell-answer-key-section");
      section.append(createElement("h3", "reading-shell-answer-key-section-title", "Part " + part + ": Questions " + range.from + "–" + range.to));
      var list = createElement("div", "reading-shell-answer-key-list");
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var item = createElement("button", "reading-shell-answer-key-item");
        item.type = "button";
        item.setAttribute("aria-label", "Go to question " + questionNumber);
        item.append(
          createElement("span", "reading-shell-answer-key-number", String(questionNumber)),
          createElement("span", "reading-shell-answer-key-answer", String(config.answers.getAnswerKeyDisplay(questionNumber) || ""))
        );
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

  function buildScoreFeedback() {
    var shell = makeBackdrop("reading-shell-score-feedback", "reading-shell-score-feedback-title", "Score feedback", "Close score feedback", closeScoreFeedback);
    var subtitle = createElement("p", "reading-shell-score-feedback-intro", "Review your overall result and performance by part.");
    shell.titleGroup.append(subtitle);
    var body = createElement("div", "reading-shell-score-feedback-body");
    shell.dialog.append(body);
    return { backdrop: shell.backdrop, close: shell.close, body: body };
  }

  function installExtraStyles() {
    if (global.document.getElementById("reading-shell-extra-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-extra-styles";
    style.textContent = ".reading-shell-root{flex-wrap:wrap;justify-content:flex-end}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-current-score-row .reading-shell-score-guide-cell{background:rgba(34,197,94,.14);border-bottom-color:rgba(34,197,94,.45)}.reading-shell-score-guide-range{display:inline-block;margin-right:8px}.reading-shell-current-score-label{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.45);border-radius:999px;display:inline-flex;font-size:.78rem;font-weight:800;line-height:1.1;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-size:1rem;font-weight:700;line-height:1.2;padding:5px 10px;white-space:nowrap}.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.18);outline:2px solid transparent}.reading-shell-answer-key-backdrop,.reading-shell-score-feedback-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-answer-key-backdrop[hidden],.reading-shell-score-feedback-backdrop[hidden]{display:none!important}.reading-shell-answer-key-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(760px,96vw)}.reading-shell-answer-key-header,.reading-shell-score-feedback-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-answer-key-title,.reading-shell-score-feedback-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-answer-key-intro,.reading-shell-score-feedback-intro{color:var(--text-soft);margin:0}.reading-shell-answer-key-close,.reading-shell-score-feedback-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-answer-key-close:focus-visible,.reading-shell-answer-key-item:focus-visible,.reading-shell-score-feedback-close:focus-visible{outline:3px solid rgba(37,99,235,.45);outline-offset:2px}.reading-shell-answer-key-scroll{min-height:0;overflow:auto}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.reading-shell-answer-key-section{background:var(--bg);border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.reading-shell-answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;font-weight:800;margin:0;padding:9px 10px}.reading-shell-answer-key-list{display:grid}.reading-shell-answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.reading-shell-answer-key-item:last-child{border-bottom:0}.reading-shell-answer-key-item:hover{background:var(--bg-secondary)}.reading-shell-answer-key-number{color:var(--text-soft);font-weight:800}.reading-shell-answer-key-answer{font-weight:700;min-width:0;overflow-wrap:anywhere}.reading-shell-score-feedback-button{appearance:none;background:transparent;border:0;border-radius:6px;color:var(--text);cursor:pointer;display:inline-flex;font:inherit;font-weight:700;padding:2px 4px;white-space:nowrap}.reading-shell-score-feedback-button:hover,.reading-shell-score-feedback-button:focus-visible{background:rgba(227,24,55,.08);color:#e31837;outline:2px solid transparent}.reading-shell-score-feedback-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(620px,96vw)}.reading-shell-score-feedback-body{display:grid;flex:1 1 auto;gap:16px;min-height:0;overflow-y:auto;padding-right:6px}.reading-shell-score-feedback-card{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px}.reading-shell-score-feedback-heading{margin:0 0 8px}.reading-shell-score-feedback-subheading{margin:12px 0 6px}.reading-shell-score-feedback-text{margin:6px 0}.reading-shell-score-feedback-list{display:grid;gap:8px;margin-top:8px}.reading-shell-score-feedback-part-score{font-weight:800}.reading-shell-score-feedback-muted{color:var(--text-soft);margin:10px 0 0}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}}";
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
    installExtraStyles();

    var root = createElement("div", "reading-shell-root");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");

    var scoreButton = createElement("button", "reading-shell-score-guide-button", "📊 Score guide");
    scoreButton.type = "button";
    scoreButton.setAttribute("aria-haspopup", "dialog");

    var answerButton = createElement("button", "reading-shell-answer-key-button", "🔑");
    answerButton.type = "button";
    answerButton.setAttribute("aria-label", "Answer Key");
    answerButton.setAttribute("title", "Answer Key");
    answerButton.setAttribute("aria-haspopup", "dialog");

    var studyPill = createElement("span", "reading-shell-study-pill", "Study mode");
    var studyTimer = createElement("span", "reading-shell-study-timer");
    var timerValue = createElement("span", "reading-shell-study-timer-value", "00:00");
    studyTimer.append(createElement("span", "reading-shell-study-timer-label", "Study time: "), timerValue);

    var scoreGuide = buildScoreGuide();
    var answerKey = buildAnswerKey();
    var feedback = buildScoreFeedback();

    root.append(scoreButton, answerButton, studyPill, studyTimer, scoreGuide.backdrop, answerKey.backdrop, feedback.backdrop);
    mount.append(root);

    var feedbackButton = createElement("button", "reading-shell-score-feedback-button");
    feedbackButton.type = "button";
    feedbackButton.hidden = true;
    feedbackButton.setAttribute("title", "View score feedback");
    feedbackButton.setAttribute("aria-label", "View score feedback");
    feedbackButton.setAttribute("aria-haspopup", "dialog");
    var topLeft = global.document.querySelector(".top-left");
    if (topLeft) topLeft.append(feedbackButton);

    scoreButton.addEventListener("click", openScoreGuide);
    answerButton.addEventListener("click", openAnswerKey);
    feedbackButton.addEventListener("click", openScoreFeedback);

    elements = {
      root: root,
      scoreButton: scoreButton,
      answerButton: answerButton,
      studyPill: studyPill,
      studyTimer: studyTimer,
      timerValue: timerValue,
      scoreBackdrop: scoreGuide.backdrop,
      scoreClose: scoreGuide.close,
      scoreSummary: scoreGuide.summary,
      scoreBody: scoreGuide.body,
      answerBackdrop: answerKey.backdrop,
      answerClose: answerKey.close,
      feedbackButton: feedbackButton,
      feedbackBackdrop: feedback.backdrop,
      feedbackClose: feedback.close,
      feedbackBody: feedback.body
    };
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
    var showRoot = studyMode || completedTest;
    var hasResult = isResultAvailable();

    elements.root.hidden = !showRoot;
    elements.root.setAttribute("aria-hidden", showRoot ? "false" : "true");
    elements.scoreButton.hidden = !showRoot;
    elements.answerButton.hidden = !showRoot;
    elements.studyPill.hidden = !studyMode;
    elements.studyTimer.hidden = !studyMode;
    elements.feedbackButton.hidden = !hasResult;
    elements.feedbackButton.textContent = hasResult ? getCurrentResult().rawScore + " / " + config.test.totalQuestions + " · Band " + getCurrentResult().band : "";

    if (!studyMode) {
      studySessionActive = false;
      stopStudyTimer();
      closeScoreGuide(false);
    }
    if (!showRoot) closeAnswerKey(false);
    if (!hasResult) closeScoreFeedback(false);
    if (showRoot && !elements.scoreBackdrop.hidden) refreshScoreGuide();
  }

  function startStudySession() {
    if (!initialized || !elements) return;
    studySessionActive = true;
    studyElapsedSeconds = 0;
    studyResultBaseline = resultEvents;
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
    observeResults();
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
