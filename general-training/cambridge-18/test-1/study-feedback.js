(function () {
  "use strict";

  document.write('<script src="../../shared/gt-reading-exam-guards.js"><\/script>');
  document.write('<link rel="stylesheet" href="../../../academic/shared/reading-feature-shell.css" />');
  document.write('<style id="gt18Test1StudyParityStyles">' +
    '#questionContent .summary-feedbacks>.question-block.feedback-only{margin:0;padding:0;border:0;background:transparent}' +
    '.gt18-test1-header-left{min-width:0;flex:1 1 auto;white-space:nowrap;overflow:hidden}' +
    '.gt18-test1-header-left .test-title,.gt18-test1-header-left #candidateNameDisplay{font-size:.95rem;color:var(--text-soft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.gt18-test1-header-left .test-title{flex:0 1 auto}' +
    '.gt18-test1-header-left #candidateNameDisplay{display:none;max-width:min(24vw,260px);flex:0 1 auto}' +
    '.gt18-test1-header-right{gap:12px;min-width:0;flex:0 0 auto}' +
    '.gt18-test1-header-right .reading-shell-score-guide-backdrop,.gt18-test1-header-right .reading-shell-answer-key-backdrop,.gt18-test1-header-right .reading-shell-score-feedback-backdrop{white-space:normal}' +
    '.gt18-test1-header-right .reading-shell-score-guide-dialog,.gt18-test1-header-right .reading-shell-answer-key-dialog,.gt18-test1-header-right .reading-shell-score-feedback-dialog,.gt18-test1-header-right .reading-shell-score-guide-header,.gt18-test1-header-right .reading-shell-answer-key-header,.gt18-test1-header-right .reading-shell-score-feedback-header,.gt18-test1-header-right .reading-shell-score-guide-scroll,.gt18-test1-header-right .reading-shell-answer-key-scroll,.gt18-test1-header-right .reading-shell-score-feedback-body,.gt18-test1-header-right .reading-shell-score-feedback-card{min-width:0}' +
    '.gt18-test1-header-right .reading-shell-score-feedback-text,.gt18-test1-header-right .reading-shell-score-feedback-part-score{white-space:normal;overflow-wrap:anywhere}' +
    '.reading-shell-locked{cursor:not-allowed!important;opacity:.72}' +
    '@media(max-width:980px){.gt18-test1-header-left{gap:10px}.gt18-test1-header-right{gap:8px}.gt18-test1-header-left #candidateNameDisplay{max-width:18vw}}' +
    '<\/style>');
  document.write('<script src="study-feedback-data.js"><\/script>');
  document.write('<script src="../../../academic/shared/reading-feature-shell-core.js"><\/script>');

  function text(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function directChildByText(parent, selector, needle) {
    if (!parent) return null;
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
      wrapRange(
        s1,
        directChildByText(s1, "p.question-group-heading", "What to do if your clothes"),
        s1.querySelector('.question-block[data-q="1"]'),
        "study-instruction-s1-dry-cleaning"
      );
      wrapRange(
        s1,
        directChildByText(s1, "p.question-group-heading", "Groups for readers and writers"),
        s1.querySelector('.question-block[data-q="8"]'),
        "study-instruction-s1-groups"
      );
    }

    if (s2) {
      wrapRange(
        s2,
        directChildByText(s2, "p", "SECTION 2 Questions"),
        s2.querySelector(".note-completion-box"),
        "study-instruction-s2-lifting"
      );
      wrapRange(
        s2,
        directChildByText(s2, "p.question-group-heading", "Dealing with customer complaints"),
        s2.querySelector('.option-bank[aria-label*="customer complaints"]'),
        "study-instruction-s2-complaints"
      );
    }

    if (s3) {
      wrapRange(
        s3,
        directChildByText(s3, "p", "SECTION 3 Questions"),
        s3.querySelector('.question-block[data-q="28"]'),
        "study-instruction-s3-headings"
      );
      wrapRange(
        s3,
        directChildByText(s3, "p", "Questions 34–37"),
        s3.querySelector(".summary-completion-box"),
        "study-instruction-s3-summary"
      );
      wrapRange(
        s3,
        directChildByText(s3, "p", "Questions 38–40"),
        s3.querySelector('.question-block[data-q="38"]'),
        "study-instruction-s3-mc"
      );
    }
  }

  function prepareTextRoots() {
    var s1 = document.querySelector('.passage-section[data-section="1"]');
    var s2 = document.querySelector('.passage-section[data-section="2"]');
    var s3 = document.querySelector('.passage-section[data-section="3"]');

    function wrapBeforeDivider(section, id) {
      if (!section || document.getElementById(id)) return document.getElementById(id);
      var divider = section.querySelector(":scope > .passage-divider");
      if (!divider) return null;
      var wrapper = document.createElement("div");
      wrapper.className = "reading-text";
      wrapper.id = id;
      section.insertBefore(wrapper, section.firstChild);
      while (wrapper.nextSibling && wrapper.nextSibling !== divider) wrapper.appendChild(wrapper.nextSibling);
      return wrapper;
    }

    wrapBeforeDivider(s1, "text-s1-dry-cleaning");
    if (s1) {
      var groups = s1.querySelector(":scope > .passage-divider");
      if (groups) {
        groups.id = "text-s1-groups";
        groups.classList.add("reading-text");
      }
    }

    wrapBeforeDivider(s2, "text-s2-lifting");
    if (s2) {
      var complaints = s2.querySelector(":scope > .passage-divider");
      if (complaints) {
        complaints.id = "text-s2-complaints";
        complaints.classList.add("reading-text");
      }
    }

    if (s3) {
      s3.id = "text-s3-storks";
      s3.classList.add("reading-text");
    }
  }

  function prepareInlineFeedbackHosts() {
    [23,24,25,26,27,34,35,36,37].forEach(function (question) {
      var answer = document.getElementById("ca-" + question);
      if (!answer || answer.closest(".feedback-only")) return;
      var wrapper = document.createElement("div");
      wrapper.className = "question-block feedback-only";
      wrapper.setAttribute("data-q", String(question));
      answer.parentNode.insertBefore(wrapper, answer);
      wrapper.appendChild(answer);
    });
  }

  function prepareCandidateHeader() {
    var topLeft = document.querySelector(".top-left");
    var topRight = document.querySelector(".top-right");
    if (!topLeft) return null;
    topLeft.classList.add("gt18-test1-header-left");
    if (topRight) topRight.classList.add("gt18-test1-header-right");

    var title = topLeft.querySelector(".test-title");
    if (title) title.textContent = "IELTS 18 General Training Reading Test 1";
    document.title = "IELTS 18 General Training Reading Test 1 | IELTS Pabs";

    var candidate = document.getElementById("candidateNameDisplay");
    if (!candidate) {
      candidate = document.createElement("div");
      candidate.id = "candidateNameDisplay";
      candidate.hidden = true;
      candidate.setAttribute("aria-live", "polite");
      if (title) title.insertAdjacentElement("afterend", candidate);
      else topLeft.appendChild(candidate);
    }
    return candidate;
  }

  function syncCandidateHeader() {
    var candidate = prepareCandidateHeader();
    if (!candidate) return;
    var currentMode = typeof mode === "string" ? mode : "";
    var name = typeof studentName === "string" ? studentName.trim() : "";
    var show = currentMode === "test" && Boolean(name);
    candidate.textContent = name ? "Candidate: " + name : "";
    candidate.title = name ? "Candidate: " + name : "";
    candidate.hidden = !show;
    candidate.style.display = show ? "block" : "none";
  }

  function prepareChrome() {
    prepareCandidateHeader();

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
      toolbar.setAttribute("aria-label", "Section clue controls");
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
    document.querySelectorAll(".section-arrows .arrow-btn").forEach(function (button) {
      var title = button.getAttribute("title") || "";
      button.setAttribute("title", title.replace(/part/gi, "section"));
    });

    var primary = document.querySelector('.check-btn[onclick="handlePrimarySubmit()"]');
    if (primary) primary.id = "primarySubmitBtn";
    var optionsSubmit = document.querySelector('.submit-button[onclick="handlePrimarySubmit()"]');
    if (optionsSubmit) optionsSubmit.id = "optionsSubmitBtn";

    var modeInner = document.getElementById("modeScreenInner");
    if (modeInner) {
      var modeTitle = modeInner.querySelector("h1");
      if (modeTitle) {
        modeTitle.id = "mode-screen-title";
        modeInner.setAttribute("aria-labelledby", modeTitle.id);
      }
      modeInner.setAttribute("role", "dialog");
      modeInner.setAttribute("aria-modal", "true");
    }

    var optionsPanel = document.getElementById("optionsPanel");
    if (optionsPanel) {
      var optionsTitle = optionsPanel.querySelector("h2");
      if (optionsTitle) {
        optionsTitle.id = "options-title";
        optionsPanel.setAttribute("aria-labelledby", optionsTitle.id);
      }
      optionsPanel.setAttribute("role", "dialog");
      optionsPanel.setAttribute("aria-modal", "true");
    }

    var lock = document.getElementById("fullscreenLockOverlay");
    if (lock) {
      var lockTitle = lock.querySelector("h2");
      if (lockTitle) {
        lockTitle.id = "fullscreen-lock-title";
        lock.setAttribute("aria-labelledby", lockTitle.id);
      }
    }

    var results = document.getElementById("resultsOverlay");
    if (results) {
      var resultsTitle = results.querySelector("h2");
      if (resultsTitle) {
        resultsTitle.id = "results-title";
        results.setAttribute("aria-labelledby", resultsTitle.id);
      }
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
    document.querySelectorAll(".part-chip .count[aria-label]").forEach(function (count) {
      count.setAttribute("aria-label", String(count.getAttribute("aria-label") || "").replace(/Part/g, "Section"));
    });
  }

  function normal(value) {
    return String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function correctFor(questionNumber, suppliedAnswer) {
    var user = suppliedAnswer === undefined ? getUserAnswer(questionNumber) : String(suppliedAnswer || "").trim();
    var key = answerKey[questionNumber];
    if (!user) return false;
    if (Array.isArray(key)) {
      return key.some(function (accepted) {
        return user.toLowerCase() === String(accepted).toLowerCase();
      });
    }
    if (typeof key !== "string") return false;
    if (/^(TRUE|FALSE|NOT GIVEN)$/.test(key)) return user.toUpperCase() === key;
    if (key.length === 1) return user.toUpperCase() === key.toUpperCase();
    if (questionNumber === 23 || questionNumber === 27) return normal(user) === normal(key);
    return user.toLowerCase() === key.toLowerCase();
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
    document.querySelectorAll(".gt-section1-clear").forEach(function (button) {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
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

  function installSubmittedMatchingGuard() {
    if (document.documentElement.getAttribute("data-gt18-submitted-matching-guard") === "true") return;
    document.documentElement.setAttribute("data-gt18-submitted-matching-guard", "true");

    function blocks(event) {
      if (!(typeof mode === "string" && mode === "test" && Boolean(testSubmitted))) return false;
      var target = event.target && event.target.closest && event.target.closest(".passage-match-source,.drop-zone,.gt-section1-clear");
      if (!target) return false;
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }

    ["click", "dblclick", "keydown", "dragstart", "dragover", "drop"].forEach(function (eventName) {
      document.addEventListener(eventName, blocks, true);
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
    if (!window.ReadingFeatureShell || window.ReadingFeatureShell.__gt18Test1Localised) return;
    ["init", "sync", "startStudySession", "showAllPassageClues", "hideAllPassageClues"].forEach(function (methodName) {
      var original = window.ReadingFeatureShell[methodName];
      if (typeof original !== "function") return;
      window.ReadingFeatureShell[methodName] = function () {
        var result = original.apply(this, arguments);
        window.setTimeout(localiseReadingFeatureShell, 0);
        return result;
      };
    });
    window.ReadingFeatureShell.__gt18Test1Localised = true;
    new MutationObserver(function () {
      window.setTimeout(localiseReadingFeatureShell, 0);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function patchBandConversion() {
    var originalComputeBandScore = window.computeBandScore;
    if (typeof originalComputeBandScore === "function") {
      window.computeBandScore = function (correct) {
        if (Number(correct) <= 8) return "Below 3";
        return originalComputeBandScore.apply(this, arguments);
      };
    }

    var originalGetBandDescriptor = window.getBandDescriptor;
    if (typeof originalGetBandDescriptor === "function") {
      window.getBandDescriptor = function (band) {
        if (band === "Below 3") {
          return {
            level: "Below Band 3 range",
            description: "This raw score falls below the Band 3 estimate range used by this General Training Reading practice guide."
          };
        }
        return originalGetBandDescriptor.apply(this, arguments);
      };
    }
  }

  function patchPageFunctions() {
    patchBandConversion();

    var originalUpdateCounts = window.updateCounts;
    if (typeof originalUpdateCounts === "function") {
      window.updateCounts = function () {
        var header = document.getElementById("passageHeader");
        if (header) header.id = "passageHeaderHost";
        try {
          return originalUpdateCounts.apply(this, arguments);
        } finally {
          if (header) header.id = "passageHeader";
          renderSectionHeader();
        }
      };
    }

    var originalStartTest = window.startTest;
    if (typeof originalStartTest === "function") {
      window.startTest = function () {
        var result = originalStartTest.apply(this, arguments);
        syncCandidateHeader();
        if (window.ReadingFeatureShell) {
          if (mode === "study" && typeof window.ReadingFeatureShell.startStudySession === "function") {
            window.ReadingFeatureShell.startStudySession();
          } else if (typeof window.ReadingFeatureShell.sync === "function") {
            window.ReadingFeatureShell.sync();
          }
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
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") {
          window.ReadingFeatureShell.sync();
        }
        return result;
      };
    }

    var originalOnAnswerChange = window.onAnswerChange;
    if (typeof originalOnAnswerChange === "function") {
      window.onAnswerChange = function () {
        var result = originalOnAnswerChange.apply(this, arguments);
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") {
          window.ReadingFeatureShell.sync();
        }
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
        if (sectionLine) {
          sectionLine.textContent = "Section 1: " + scores[1] + "/14 · Section 2: " + scores[2] + "/13 · Section 3: " + scores[3] + "/13";
        }
        var bandLine = document.getElementById("bandLine");
        if (bandLine) {
          bandLine.textContent = bandLine.textContent.replace("Estimated IELTS Reading band", "Estimated IELTS General Training Reading band");
        }
        var status = window.ReadingFeatureShell && typeof window.ReadingFeatureShell.getStatus === "function"
          ? window.ReadingFeatureShell.getStatus()
          : null;
        if (status && status.initialized) {
          document.querySelectorAll('.correct-answer-text[id^="ca-"]').forEach(function (answer) {
            answer.style.display = "none";
          });
        }
        var results = document.getElementById("resultsOverlay");
        if (results) results.setAttribute("aria-hidden", "false");
        var close = document.getElementById("resultsCloseBtn");
        if (close) close.focus();
        if (mode === "test") lockSubmittedTest();
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") {
          window.setTimeout(function () { window.ReadingFeatureShell.sync(); }, 0);
        }
        return result;
      };
    }

    var originalCloseResults = window.closeResults;
    if (typeof originalCloseResults === "function") {
      window.closeResults = function () {
        var result = originalCloseResults.apply(this, arguments);
        var overlay = document.getElementById("resultsOverlay");
        if (overlay) overlay.setAttribute("aria-hidden", "true");
        var target = ["primarySubmitBtn", "optionsBtn"].map(function (id) {
          return document.getElementById(id);
        }).find(function (element) {
          return element && !element.disabled && !element.hidden;
        });
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
    installSubmittedMatchingGuard();
    patchPageFunctions();
    renderSectionHeader();
    syncCandidateHeader();

    var feedback = window.IELTS18GTTest1StudyFeedback;
    if (!feedback || !window.ReadingFeatureShell) {
      console.warn("IELTS 18 GT Test 1 Study Mode assets could not load.");
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
        id: "cambridge-18-general-training-reading-test-1",
        title: "IELTS 18 General Training Reading Test 1",
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
          return document.querySelector('.question-block[data-q="' + questionNumber + '"]:not(.feedback-only)') ||
            document.querySelector('.question-block[data-q="' + questionNumber + '"]');
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
    if (!shellInit || shellInit.ok !== true) {
      console.warn("IELTS 18 GT Test 1 Study Mode could not initialise.", shellInit && shellInit.error);
    }
    localiseReadingFeatureShell();
  }

  document.addEventListener("DOMContentLoaded", initStudyMode, { once: true });
}());
