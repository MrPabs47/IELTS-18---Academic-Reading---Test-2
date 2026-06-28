(function (global) {
  "use strict";

  var validatedConfig = null;
  var initialized = false;
  var lastError = "";
  var elements = null;
  var studyIntervalId = null;
  var studyElapsedSeconds = 0;
  var studySessionActive = false;
  var previouslyFocusedElement = null;

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function hasFunction(container, key) {
    return Boolean(container && typeof container[key] === "function");
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && Boolean(value.trim());
  }

  function validatePartRange(range, label) {
    if (!isPlainObject(range)) {
      return "test.partRanges." + label + " must be an object.";
    }
    if (!Number.isInteger(range.from) || !Number.isInteger(range.to)) {
      return "test.partRanges." + label + " must include integer from/to values.";
    }
    if (range.from < 1 || range.to < range.from) {
      return "test.partRanges." + label + " must be a valid question range.";
    }
    return "";
  }

  function validateScoreGuide(scoreGuide) {
    if (!isPlainObject(scoreGuide)) {
      return "ReadingFeatureShell config.study.scoreGuide must be an object.";
    }
    if (!isNonEmptyString(scoreGuide.title)) {
      return "ReadingFeatureShell config.study.scoreGuide.title must be a non-empty string.";
    }
    if (!isNonEmptyString(scoreGuide.intro)) {
      return "ReadingFeatureShell config.study.scoreGuide.intro must be a non-empty string.";
    }
    if (!Array.isArray(scoreGuide.rows) || scoreGuide.rows.length === 0) {
      return "ReadingFeatureShell config.study.scoreGuide.rows must be a non-empty array.";
    }
    for (var i = 0; i < scoreGuide.rows.length; i += 1) {
      var row = scoreGuide.rows[i];
      if (!isPlainObject(row) || !isNonEmptyString(row.correctAnswers) || !isNonEmptyString(row.band)) {
        return "ReadingFeatureShell config.study.scoreGuide.rows must include non-empty correctAnswers and band strings.";
      }
    }
    return "";
  }

  function validateConfig(config) {
    var requiredParts = ["1", "2", "3"];
    var error = "";

    if (!isPlainObject(config)) {
      error = "ReadingFeatureShell config must be an object.";
    } else if (config.version !== 1) {
      error = "ReadingFeatureShell config.version must be 1.";
    } else if (!isPlainObject(config.test)) {
      error = "ReadingFeatureShell config.test must be an object.";
    } else if (typeof config.test.id !== "string" || !config.test.id.trim()) {
      error = "ReadingFeatureShell config.test.id must be a non-empty string.";
    } else if (typeof config.test.title !== "string" || !config.test.title.trim()) {
      error = "ReadingFeatureShell config.test.title must be a non-empty string.";
    } else if (config.test.totalQuestions !== 40) {
      error = "ReadingFeatureShell config.test.totalQuestions must be 40.";
    } else if (!isPlainObject(config.test.partRanges)) {
      error = "ReadingFeatureShell config.test.partRanges must be an object.";
    } else if (!isPlainObject(config.state)) {
      error = "ReadingFeatureShell config.state must be an object.";
    } else if (!hasFunction(config.state, "getMode")) {
      error = "ReadingFeatureShell config.state.getMode must be a function.";
    } else if (!hasFunction(config.state, "isTestSubmitted")) {
      error = "ReadingFeatureShell config.state.isTestSubmitted must be a function.";
    } else if (!hasFunction(config.state, "getActivePart")) {
      error = "ReadingFeatureShell config.state.getActivePart must be a function.";
    } else if (!isPlainObject(config.answers) || !hasFunction(config.answers, "getAnswerKeyDisplay")) {
      error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    } else if (!isPlainObject(config.navigation) || !hasFunction(config.navigation, "getQuestionTarget")) {
      error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    } else if (!isPlainObject(config.study)) {
      error = "ReadingFeatureShell config.study must be an object.";
    } else {
      error = validateScoreGuide(config.study.scoreGuide);
    }

    if (!error) {
      for (var i = 0; i < requiredParts.length; i += 1) {
        error = validatePartRange(config.test.partRanges[requiredParts[i]], requiredParts[i]);
        if (error) break;
      }
    }

    return {
      ok: !error,
      error: error
    };
  }

  function formatStudyTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function updateStudyTimerText() {
    if (!elements || !elements.studyTimerValue) return;
    elements.studyTimerValue.textContent = formatStudyTime(studyElapsedSeconds);
  }

  function stopStudyTimer() {
    if (studyIntervalId) {
      global.clearInterval(studyIntervalId);
      studyIntervalId = null;
    }
  }

  function startStudyTimer() {
    stopStudyTimer();
    studyIntervalId = global.setInterval(function () {
      if (!studySessionActive) return;
      studyElapsedSeconds += 1;
      updateStudyTimerText();
    }, 1000);
  }

  function createElement(tagName, className, text) {
    var element = global.document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function closeScoreGuideDialog() {
    if (!elements || !elements.overlay) return;
    elements.overlay.hidden = true;
    elements.overlay.setAttribute("aria-hidden", "true");
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
      previouslyFocusedElement.focus();
    }
  }

  function openScoreGuideDialog() {
    if (!elements || !elements.overlay || elements.root.hidden) return;
    previouslyFocusedElement = global.document.activeElement;
    elements.overlay.hidden = false;
    elements.overlay.setAttribute("aria-hidden", "false");
    elements.closeButton.focus();
  }

  function handleOverlayKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeScoreGuideDialog();
    }
  }

  function handleOverlayClick(event) {
    if (event.target === elements.overlay) {
      closeScoreGuideDialog();
    }
  }

  function buildScoreGuideTable(scoreGuide) {
    var table = createElement("table", "reading-shell-score-guide-table");
    var thead = createElement("thead", "reading-shell-score-guide-head");
    var headRow = createElement("tr", "reading-shell-score-guide-row");
    var correctHead = createElement("th", "reading-shell-score-guide-heading", "Correct answers");
    var bandHead = createElement("th", "reading-shell-score-guide-heading", "Estimated band");
    var tbody = createElement("tbody", "reading-shell-score-guide-body");

    correctHead.scope = "col";
    bandHead.scope = "col";
    headRow.append(correctHead, bandHead);
    thead.append(headRow);

    scoreGuide.rows.forEach(function (row) {
      var bodyRow = createElement("tr", "reading-shell-score-guide-row");
      bodyRow.append(
        createElement("td", "reading-shell-score-guide-cell", row.correctAnswers),
        createElement("td", "reading-shell-score-guide-cell", row.band)
      );
      tbody.append(bodyRow);
    });

    table.append(thead, tbody);
    return table;
  }

  function buildUi(config) {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) {
      lastError = "ReadingFeatureShell mount was not found.";
      global.console.warn("ReadingFeatureShell: " + lastError);
      initialized = false;
      validatedConfig = null;
      return false;
    }

    mount.textContent = "";
    mount.setAttribute("aria-hidden", "true");

    var root = createElement("div", "reading-shell-root");
    root.setAttribute("data-reading-shell-root", "");
    root.hidden = true;

    var pill = createElement("span", "reading-shell-study-pill", "Study Mode");
    pill.setAttribute("data-reading-shell-study-pill", "");

    var timer = createElement("div", "reading-shell-study-timer");
    timer.setAttribute("data-reading-shell-study-timer", "");
    var timerLabel = createElement("span", "reading-shell-study-timer-label", "Study time ");
    var timerValue = createElement("span", "reading-shell-study-timer-value", "00:00");
    timerValue.setAttribute("data-reading-shell-study-timer-value", "");
    timer.append(timerLabel, timerValue);

    var guideButton = createElement("button", "reading-shell-score-guide-button", "Score guide");
    guideButton.type = "button";
    guideButton.setAttribute("data-reading-shell-score-guide-open", "");

    var overlay = createElement("div", "reading-shell-score-guide-backdrop");
    overlay.setAttribute("data-reading-shell-score-guide-backdrop", "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.hidden = true;

    var dialog = createElement("div", "reading-shell-score-guide-dialog");
    dialog.setAttribute("data-reading-shell-score-guide-dialog", "");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "reading-shell-score-guide-title");
    dialog.setAttribute("tabindex", "-1");

    var closeButton = createElement("button", "reading-shell-score-guide-close", "Close");
    closeButton.type = "button";
    closeButton.setAttribute("data-reading-shell-score-guide-close", "");

    var title = createElement("h2", "reading-shell-score-guide-title", config.study.scoreGuide.title);
    title.id = "reading-shell-score-guide-title";
    var intro = createElement("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro);

    dialog.append(closeButton, title, intro, buildScoreGuideTable(config.study.scoreGuide));
    overlay.append(dialog);
    root.append(pill, timer, guideButton, overlay);
    mount.append(root);

    guideButton.addEventListener("click", openScoreGuideDialog);
    closeButton.addEventListener("click", closeScoreGuideDialog);
    overlay.addEventListener("click", handleOverlayClick);
    overlay.addEventListener("keydown", handleOverlayKeydown);

    elements = {
      root: root,
      studyTimerValue: timerValue,
      guideButton: guideButton,
      overlay: overlay,
      closeButton: closeButton
    };
    return true;
  }

  function sync() {
    if (!initialized || !validatedConfig || !elements) return;

    var currentMode = validatedConfig.state.getMode();
    var submitted = Boolean(validatedConfig.state.isTestSubmitted());
    var visibleInStudyBeforeChecking = currentMode === "study" && !submitted;
    var visibleInStudyAfterChecking = currentMode === "study" && submitted;
    var hiddenInTestBeforeSubmission = currentMode === "test" && !submitted;
    var hiddenInTestAfterSubmission = currentMode === "test" && submitted;
    var shouldShowStudyChrome = visibleInStudyBeforeChecking || visibleInStudyAfterChecking;

    if (hiddenInTestBeforeSubmission || hiddenInTestAfterSubmission || currentMode !== "study") {
      shouldShowStudyChrome = false;
    }

    elements.root.hidden = !shouldShowStudyChrome;
    elements.root.setAttribute("aria-hidden", shouldShowStudyChrome ? "false" : "true");

    if (!shouldShowStudyChrome) {
      studySessionActive = false;
      stopStudyTimer();
      closeScoreGuideDialog();
    }
  }

  function startStudySession() {
    if (!initialized || !validatedConfig || !elements) return;
    studySessionActive = true;
    studyElapsedSeconds = 0;
    updateStudyTimerText();
    startStudyTimer();
    sync();
  }

  function init(config) {
    var validation = validateConfig(config);
    if (!validation.ok) {
      validatedConfig = null;
      initialized = false;
      elements = null;
      studySessionActive = false;
      stopStudyTimer();
      lastError = validation.error;
      global.console.warn("ReadingFeatureShell: " + validation.error);
      return {
        ok: false,
        error: validation.error
      };
    }

    validatedConfig = config;
    initialized = true;
    lastError = "";
    studySessionActive = false;
    studyElapsedSeconds = 0;

    if (!buildUi(config)) {
      return {
        ok: false,
        error: lastError
      };
    }
    updateStudyTimerText();
    sync();

    return {
      ok: true,
      initialized: true
    };
  }

  function getStatus() {
    return {
      initialized: initialized,
      hasConfig: Boolean(validatedConfig),
      version: validatedConfig ? validatedConfig.version : null,
      testId: validatedConfig && validatedConfig.test ? validatedConfig.test.id : "",
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
