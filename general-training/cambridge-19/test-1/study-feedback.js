(function () {
  "use strict";

  document.write('<script src="../../shared/gt-reading-exam-guards.js"><\/script>');

  document.write('<link rel="stylesheet" href="../../../academic/shared/reading-feature-shell.css" />');
  document.write('<style id="gt19Test1SummaryFeedbackSpacing">#questionContent > div[data-section="3"] .summary-feedbacks > .question-block.feedback-only{margin:0;padding:0;border:0;background:transparent}</style>');
  document.write('<script src="study-feedback-data.js"><\/script>');
  document.write('<script src="../../../academic/shared/reading-feature-shell-core.js"><\/script>');

  function text(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function directChildByText(parent, selector, needle) {
    return Array.from(parent.children).find(function (node) {
      return node.matches(selector) && text(node).indexOf(needle) !== -1;
    }) || null;
  }

  function wrapRange(parent, start, endExclusive, id) {
    if (!parent || !start || !endExclusive || document.getElementById(id)) return document.getElementById(id);
    var wrapper = document.createElement("div");
    wrapper.className = "instruction-block";
    wrapper.id = id;
    parent.insertBefore(wrapper, start);
    var node = start;
    while (node && node !== endExclusive) {
      var next = node.nextSibling;
      wrapper.appendChild(node);
      node = next;
    }
    return wrapper;
  }

  function prepareInstructionHosts() {
    var s1 = document.querySelector('#questionContent > div[data-section="1"]');
    var s2 = document.querySelector('#questionContent > div[data-section="2"]');
    var s3 = document.querySelector('#questionContent > div[data-section="3"]');

    if (s1) {
      wrapRange(s1, directChildByText(s1, "p", "SECTION 1 Questions"), s1.querySelector('.question-block[data-q="1"]'), "study-instruction-s1-tram-tfng");
      wrapRange(s1, directChildByText(s1, "p.question-group-heading", "Adorable Knitwear"), s1.querySelector('.question-block[data-q="8"]'), "study-instruction-s1-knitwear");
    }
    if (s2) {
      wrapRange(s2, directChildByText(s2, "p", "SECTION 2 Questions"), s2.querySelector('.question-block[data-q="15"]'), "study-instruction-s2-leadership");
      wrapRange(s2, directChildByText(s2, "p.question-group-heading", "Resigning from a Job"), s2.querySelector(".note-completion-box"), "study-instruction-s2-resigning");
    }
    if (s3) {
      wrapRange(s3, directChildByText(s3, "p", "SECTION 3 Questions"), s3.querySelector('.question-block[data-q="28"]'), "study-instruction-s3-headings");
      wrapRange(s3, directChildByText(s3, "p", "Questions 33-37"), s3.querySelector(".summary-completion-box"), "study-instruction-s3-summary");
      wrapRange(s3, directChildByText(s3, "p", "Questions 38-40"), s3.querySelector('.question-block[data-q="38"]'), "study-instruction-s3-mc");
    }
  }

  function prepareTextRoots() {
    var s1 = document.querySelector('.passage-section[data-section="1"]');
    var s2 = document.querySelector('.passage-section[data-section="2"]');
    var s3 = document.querySelector('.passage-section[data-section="3"]');

    function wrapBeforeDivider(section, id) {
      if (!section || document.getElementById(id)) return;
      var divider = section.querySelector(":scope > .passage-divider");
      if (!divider) return;
      var wrapper = document.createElement("div");
      wrapper.className = "reading-text";
      wrapper.id = id;
      section.insertBefore(wrapper, section.firstChild);
      while (wrapper.nextSibling && wrapper.nextSibling !== divider) wrapper.appendChild(wrapper.nextSibling);
    }

    wrapBeforeDivider(s1, "text-s1-tram");
    if (s1) {
      var knitwear = s1.querySelector(":scope > .passage-divider");
      if (knitwear) { knitwear.id = "text-s1-knitwear"; knitwear.classList.add("reading-text"); }
    }
    wrapBeforeDivider(s2, "text-s2-leadership");
    if (s2) {
      var resigning = s2.querySelector(":scope > .passage-divider");
      if (resigning) { resigning.id = "text-s2-resigning"; resigning.classList.add("reading-text"); }
    }
    if (s3) { s3.id = "text-s3-emojis"; s3.classList.add("reading-text"); }
  }

  function prepareInlineFeedbackHosts() {
    for (var question = 33; question <= 37; question += 1) {
      var answer = document.getElementById("ca-" + question);
      if (!answer || answer.closest(".feedback-only")) continue;
      var wrapper = document.createElement("div");
      wrapper.className = "question-block feedback-only";
      wrapper.setAttribute("data-q", String(question));
      answer.parentNode.insertBefore(wrapper, answer);
      wrapper.appendChild(answer);
    }
  }

  function prepareChrome() {
    var topRight = document.querySelector(".top-right");
    var timer = document.getElementById("timerContainer");
    if (topRight && !document.getElementById("readingFeatureShellMount")) {
      var mount = document.createElement("div");
      mount.id = "readingFeatureShellMount";
      mount.setAttribute("aria-live", "polite");
      topRight.insertBefore(mount, timer || topRight.firstChild);
    }

    var header = document.getElementById("passageHeader");
    if (header && !document.getElementById("passageHeaderLine")) {
      var line = document.createElement("div");
      line.id = "passageHeaderLine";
      while (header.firstChild) line.appendChild(header.firstChild);
      var toolbar = document.createElement("div");
      toolbar.className = "passage-clue-toolbar";
      toolbar.id = "passageClueToolbar";
      toolbar.setAttribute("aria-label", "Text clue controls");
      toolbar.hidden = true;
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "passageClueToggle";
      toggle.className = "reading-shell-passage-clue-toggle";
      toggle.setAttribute("aria-pressed", "false");
      toggle.hidden = true;
      toggle.disabled = true;
      toggle.textContent = "Show all section clues";
      toolbar.appendChild(toggle);
      header.append(line, toolbar);
    }

    document.querySelectorAll(".part-chip").forEach(function (chip) {
      chip.childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) node.nodeValue = node.nodeValue.replace(/Part/g, "Section");
      });
    });

    var primary = document.querySelector('.check-btn[onclick="handlePrimarySubmit()"]');
    if (primary) primary.id = "primarySubmitBtn";
    var optionsSubmit = document.querySelector('.submit-button[onclick="handlePrimarySubmit()"]');
    if (optionsSubmit) optionsSubmit.id = "optionsSubmitBtn";

    var modeInner = document.getElementById("modeScreenInner");
    if (modeInner) {
      var modeTitle = modeInner.querySelector("h1");
      if (modeTitle) { modeTitle.id = "mode-screen-title"; modeInner.setAttribute("aria-labelledby", modeTitle.id); }
      modeInner.setAttribute("role", "dialog");
      modeInner.setAttribute("aria-modal", "true");
    }
    var optionsPanel = document.getElementById("optionsPanel");
    if (optionsPanel) {
      var optionsTitle = optionsPanel.querySelector("h2");
      if (optionsTitle) { optionsTitle.id = "options-title"; optionsPanel.setAttribute("aria-labelledby", optionsTitle.id); }
      optionsPanel.setAttribute("role", "dialog");
      optionsPanel.setAttribute("aria-modal", "true");
    }
    var lock = document.getElementById("fullscreenLockOverlay");
    if (lock) {
      var lockTitle = lock.querySelector("h2");
      if (lockTitle) { lockTitle.id = "fullscreen-lock-title"; lock.setAttribute("aria-labelledby", lockTitle.id); }
    }
    var results = document.getElementById("resultsOverlay");
    if (results) {
      var resultsTitle = results.querySelector("h2");
      if (resultsTitle) { resultsTitle.id = "results-title"; results.setAttribute("aria-labelledby", resultsTitle.id); }
      results.setAttribute("role", "dialog");
      results.setAttribute("aria-modal", "true");
      results.setAttribute("aria-hidden", "true");
      var close = results.querySelector('button[onclick="closeResults()"]');
      if (close) close.id = "resultsCloseBtn";
      if (!document.getElementById("sectionScoresLine")) {
        var scoreLine = document.getElementById("scoreLine");
        var sectionLine = document.createElement("p");
        sectionLine.id = "sectionScoresLine";
        if (scoreLine && scoreLine.parentNode) scoreLine.parentNode.insertBefore(sectionLine, scoreLine.nextSibling);
      }
    }
  }

  function sectionHeaderText(section) {
    if (section === 1) return "Section 1 – Read the texts and answer Questions 1–14.";
    if (section === 2) return "Section 2 – Read the texts and answer Questions 15–27.";
    return "Section 3 – Read the text and answer Questions 28–40.";
  }

  function renderSectionHeader() {
    var line = document.getElementById("passageHeaderLine");
    if (line) line.textContent = sectionHeaderText(Number(activeSection || 1));
  }

  function normal(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function correctFor(questionNumber, suppliedAnswer) {
    var user = suppliedAnswer === undefined ? getUserAnswer(questionNumber) : String(suppliedAnswer || "").trim();
    var key = answerKey[questionNumber];
    if (!user) return false;
    if (Array.isArray(key)) return key.some(function (accepted) { return normal(accepted) === normal(user); });
    if (typeof key !== "string") return false;
    if (/^(TRUE|FALSE|NOT GIVEN|YES|NO)$/.test(key)) return user.toUpperCase() === key;
    if (key.length === 1) return user.toUpperCase() === key.toUpperCase();
    return normal(user) === normal(key);
  }

  function sectionScores() {
    var scores = { 1: 0, 2: 0, 3: 0 };
    for (var question = 1; question <= 40; question += 1) {
      if (!correctFor(question)) continue;
      scores[question <= 14 ? 1 : question <= 27 ? 2 : 3] += 1;
    }
    return scores;
  }

  function lockSubmittedTest() {
    document.querySelectorAll(".passage-match-source").forEach(function (item) {
      item.draggable = false;
      item.classList.add("reading-shell-locked");
      item.setAttribute("aria-disabled", "true");
      item.setAttribute("tabindex", "-1");
    });
    document.querySelectorAll(".drop-zone").forEach(function (zone) {
      zone.classList.add("reading-shell-locked");
      zone.setAttribute("aria-disabled", "true");
      zone.setAttribute("tabindex", "-1");
    });
    ["primarySubmitBtn", "optionsSubmitBtn"].forEach(function (id) {
      var button = document.getElementById(id);
      if (!button) return;
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.title = "Test already submitted";
      button.textContent = "✓ Test submitted";
    });
  }

  function localiseReadingFeatureShell() {
    var replacements = [
      [/IELTS Academic Reading/g, "IELTS General Training Reading"],
      [/Academic Reading/g, "General Training Reading"],
      [/Performance by part/g, "Performance by section"],
      [/\bPart (\d+)/g, "Section $1"],
      [/\bparts\b/gi, "sections"],
      [/passage clues/gi, "section clues"]
    ];
    document.querySelectorAll(
      ".reading-shell-answer-key-section-title," +
      ".reading-shell-score-feedback-intro," +
      ".reading-shell-score-feedback-heading," +
      ".reading-shell-score-feedback-part-score," +
      ".reading-shell-score-feedback-text," +
      "#passageClueToggle"
    ).forEach(function (node) {
      var value = node.textContent || "";
      replacements.forEach(function (pair) { value = value.replace(pair[0], pair[1]); });
      if (node.textContent !== value) node.textContent = value;
    });
  }

  function wrapReadingFeatureShellLocalisation() {
    if (!window.ReadingFeatureShell || window.ReadingFeatureShell.__gtTest1Localised) return;
    ["init", "sync", "startStudySession", "showAllPassageClues", "hideAllPassageClues"].forEach(function (methodName) {
      var original = window.ReadingFeatureShell[methodName];
      if (typeof original !== "function") return;
      window.ReadingFeatureShell[methodName] = function () {
        var result = original.apply(this, arguments);
        window.setTimeout(localiseReadingFeatureShell, 0);
        return result;
      };
    });
    window.ReadingFeatureShell.__gtTest1Localised = true;
    new MutationObserver(function () { window.setTimeout(localiseReadingFeatureShell, 0); }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function patchPageFunctions() {
    var originalUpdateCounts = window.updateCounts;
    if (typeof originalUpdateCounts === "function") {
      window.updateCounts = function () {
        var header = document.getElementById("passageHeader");
        if (header) header.id = "passageHeaderHost";
        try { return originalUpdateCounts.apply(this, arguments); }
        finally {
          if (header) header.id = "passageHeader";
          renderSectionHeader();
        }
      };
    }

    var originalStartTest = window.startTest;
    if (typeof originalStartTest === "function") {
      window.startTest = function () {
        var result = originalStartTest.apply(this, arguments);
        if (window.ReadingFeatureShell) {
          if (mode === "study" && typeof window.ReadingFeatureShell.startStudySession === "function") window.ReadingFeatureShell.startStudySession();
          else if (typeof window.ReadingFeatureShell.sync === "function") window.ReadingFeatureShell.sync();
        }
        renderSectionHeader();
        return result;
      };
    }

    var originalSwitchSection = window.switchSection;
    if (typeof originalSwitchSection === "function") {
      window.switchSection = function () {
        var result = originalSwitchSection.apply(this, arguments);
        renderSectionHeader();
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") window.ReadingFeatureShell.sync();
        return result;
      };
    }

    var originalOnAnswerChange = window.onAnswerChange;
    if (typeof originalOnAnswerChange === "function") {
      window.onAnswerChange = function () {
        var result = originalOnAnswerChange.apply(this, arguments);
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") window.ReadingFeatureShell.sync();
        return result;
      };
    }

    var originalHandlePrimarySubmit = window.handlePrimarySubmit;
    if (typeof originalHandlePrimarySubmit === "function") {
      window.handlePrimarySubmit = function () {
        if (mode === "test" && testSubmitted) return;
        return originalHandlePrimarySubmit.apply(this, arguments);
      };
    }

    var originalConfirmSubmit = window.confirmSubmit;
    if (typeof originalConfirmSubmit === "function") {
      window.confirmSubmit = function () {
        if (mode !== "test" || testSubmitted || !isTestRunning) return;
        return originalConfirmSubmit.apply(this, arguments);
      };
    }

    var originalSubmitTest = window.submitTest;
    if (typeof originalSubmitTest === "function") {
      window.submitTest = function () {
        if (mode === "test" && testSubmitted) return;
        var result = originalSubmitTest.apply(this, arguments);
        var scores = sectionScores();
        var sectionLine = document.getElementById("sectionScoresLine");
        if (sectionLine) sectionLine.textContent = "Section 1: " + scores[1] + "/14 · Section 2: " + scores[2] + "/13 · Section 3: " + scores[3] + "/13";
        var bandLine = document.getElementById("bandLine");
        if (bandLine) bandLine.textContent = bandLine.textContent.replace("Estimated IELTS Reading band", "Estimated IELTS General Training Reading band");
        var status = window.ReadingFeatureShell && typeof window.ReadingFeatureShell.getStatus === "function" ? window.ReadingFeatureShell.getStatus() : null;
        if (status && status.initialized) document.querySelectorAll('.correct-answer-text[id^="ca-"]').forEach(function (answer) { answer.style.display = "none"; });
        var results = document.getElementById("resultsOverlay");
        if (results) results.setAttribute("aria-hidden", "false");
        var close = document.getElementById("resultsCloseBtn");
        if (close) close.focus();
        if (mode === "test") lockSubmittedTest();
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") window.setTimeout(function () { window.ReadingFeatureShell.sync(); }, 0);
        return result;
      };
    }

    var originalCloseResults = window.closeResults;
    if (typeof originalCloseResults === "function") {
      window.closeResults = function () {
        var result = originalCloseResults.apply(this, arguments);
        var overlay = document.getElementById("resultsOverlay");
        if (overlay) overlay.setAttribute("aria-hidden", "true");
        var target = ["primarySubmitBtn", "optionsBtn"].map(function (id) { return document.getElementById(id); }).find(function (element) { return element && !element.disabled && !element.hidden; });
        if (target) target.focus();
        return result;
      };
    }
  }

  function initStudyMode() {
    prepareChrome();
    prepareTextRoots();
    prepareInstructionHosts();
    prepareInlineFeedbackHosts();
    patchPageFunctions();
    renderSectionHeader();

    var feedback = window.IELTS19GTTest1StudyFeedback;
    if (!feedback || !window.ReadingFeatureShell) {
      console.warn("IELTS 19 GT Test 1 Study Mode assets could not load.");
      return;
    }
    var groups = feedback.taskGroups.map(function (group) {
      return Object.assign({}, group, { part: group.section, passage: group.section });
    });
    var details = Object.fromEntries(Object.entries(feedback.questions).map(function (entry) {
      return [entry[0], [entry[1].explanation, entry[1].skill, entry[1].evidence]];
    }));

    window.isUserAnswerCorrect = correctFor;
    window.readingFeatureShellConfig = {
      version: 1,
      test: {
        id: "cambridge-19-general-training-reading-test-1",
        title: "IELTS 19 General Training Reading Test 1",
        totalQuestions: 40,
        partLabel: "Section",
        partRanges: sectionRanges
      },
      state: {
        getMode: function () { return mode; },
        isTestSubmitted: function () { return Boolean(testSubmitted); },
        getActivePart: function () { return Number(activeSection || 1); }
      },
      answers: {
        getAnswerKeyDisplay: function (questionNumber) { return correctAnswerText[questionNumber] || ""; },
        getUserAnswer: function (questionNumber) { return getUserAnswer(questionNumber); },
        isCorrect: function (questionNumber) { return correctFor(questionNumber); }
      },
      navigation: {
        getQuestionTarget: function (questionNumber) {
          return document.querySelector('.question-block[data-q="' + questionNumber + '"]:not(.feedback-only)') || document.querySelector('.question-block[data-q="' + questionNumber + '"]');
        }
      },
      compatibility: {
        allowDomSubmittedResult: true
      },
      study: {
        completeQuestionCoverage: true,
        completeClueCoverage: true,
        showEvidenceText: false,
        taskGroups: groups,
        questionDetails: details,
        scoreGuide: feedback.scoreGuide
      }
    };

    wrapReadingFeatureShellLocalisation();
    var shellInit = window.ReadingFeatureShell.init(window.readingFeatureShellConfig);
    if (!shellInit || shellInit.ok !== true) console.warn("IELTS 19 GT Test 1 Study Mode could not initialise.", shellInit && shellInit.error);
    localiseReadingFeatureShell();
  }

  document.addEventListener("DOMContentLoaded", initStudyMode, { once: true });
}());
