(function () {
  "use strict";

  var submittedResultSnapshot = null;
  var submissionSequence = 0;

  document.write('<script src="../../shared/gt-reading-exam-guards.js"><\/script>');
  document.write('<link rel="stylesheet" href="../../../academic/shared/reading-feature-shell.css" />');
  document.write('<style id="gt18Test2StudyParityStyles">' +
    '#questionContent .summary-feedbacks>.question-block.feedback-only{margin:0;padding:0;border:0;background:transparent}' +
    '.gt18-test2-header-left{min-width:0;flex:1 1 auto;overflow:hidden}' +
    '.gt18-test2-header-left .test-title,.gt18-test2-header-left #candidateNameDisplay{font-size:.95rem;color:var(--text-soft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.gt18-test2-header-left .test-title{flex:0 1 auto}' +
    '.gt18-test2-header-left #candidateNameDisplay{display:none;max-width:min(24vw,260px);flex:0 1 auto}' +
    '.gt18-test2-header-right{gap:12px;min-width:0;flex:0 0 auto}' +
    '.gt18-test2-header-right .reading-shell-score-guide-backdrop,.gt18-test2-header-right .reading-shell-answer-key-backdrop,.gt18-test2-header-right .reading-shell-score-feedback-backdrop{white-space:normal}' +
    '.gt18-test2-header-right .reading-shell-score-guide-dialog,.gt18-test2-header-right .reading-shell-answer-key-dialog,.gt18-test2-header-right .reading-shell-score-feedback-dialog,.gt18-test2-header-right .reading-shell-score-guide-header,.gt18-test2-header-right .reading-shell-answer-key-header,.gt18-test2-header-right .reading-shell-score-feedback-header,.gt18-test2-header-right .reading-shell-score-guide-scroll,.gt18-test2-header-right .reading-shell-answer-key-scroll,.gt18-test2-header-right .reading-shell-score-feedback-body,.gt18-test2-header-right .reading-shell-score-feedback-card{min-width:0}' +
    '.gt18-test2-header-right .reading-shell-score-feedback-text,.gt18-test2-header-right .reading-shell-score-feedback-part-score{white-space:normal;overflow-wrap:anywhere}' +
    '.reading-shell-locked{cursor:not-allowed!important;opacity:.72}' +
    '@media(max-width:980px){.gt18-test2-header-left{gap:10px}.gt18-test2-header-right{gap:8px}.gt18-test2-header-left #candidateNameDisplay{max-width:18vw}}' +
    '@media(max-width:600px){.top-bar{height:126px;padding:0 10px}.main-area{top:126px}.gt18-test2-header-left{gap:8px;padding-right:132px}.gt18-test2-header-left .test-title{display:none!important}.gt18-test2-header-left #candidateNameDisplay{max-width:82px}.gt18-test2-header-right{gap:6px}.gt18-test2-header-right .icon-group>span.icon{display:none}.gt18-test2-header-right #fullscreenBtn{padding:4px 6px}.gt18-test2-header-right #fullscreenBtnLabel{display:none}.gt18-test2-header-right #readingFeatureShellMount{align-items:center;display:flex;height:66px;justify-content:center;left:8px;min-width:0;position:absolute;right:8px;top:56px}.gt18-test2-header-right #readingFeatureShellMount .reading-shell-root{align-content:center;flex-wrap:wrap;gap:5px;justify-content:center;width:100%}}' +
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
        directChildByText(s1, "p.question-group-heading", "Choosing the best sleeping bag"),
        s1.querySelector('.question-block[data-q="1"]'),
        "study-instruction-s1-sleeping-bags"
      );
      wrapRange(
        s1,
        directChildByText(s1, "p.question-group-heading", "Spread the Word Life Writing Prize"),
        s1.querySelector('.question-block[data-q="9"]'),
        "study-instruction-s1-life-writing"
      );
    }

    if (s2) {
      wrapRange(
        s2,
        directChildByText(s2, "p.question-group-heading", "Encouraging employees to be healthy"),
        s2.querySelector(".note-completion-box"),
        "study-instruction-s2-employee-health"
      );
      wrapRange(
        s2,
        directChildByText(s2, "p.question-group-heading", "Marama Beach Hotel and Bistro"),
        s2.querySelector('.question-block[data-q="22"]'),
        "study-instruction-s2-kitchen"
      );
    }

    if (s3) {
      wrapRange(
        s3,
        directChildByText(s3, "p", "Questions 28–31"),
        s3.querySelector('.question-block[data-q="28"]'),
        "study-instruction-s3-paragraphs"
      );
      wrapRange(
        s3,
        directChildByText(s3, "p", "Questions 32–35"),
        s3.querySelector('.question-block[data-q="32"]'),
        "study-instruction-s3-mc"
      );
      wrapRange(
        s3,
        directChildByText(s3, "p", "Questions 36–40"),
        s3.querySelector(".summary-completion-box"),
        "study-instruction-s3-summary"
      );
    }
  }

  function setTextIdentity(node, id) {
    if (!node) return null;
    node.id = id;
    node.classList.add("reading-text");
    node.setAttribute("data-reading-text-id", id.replace(/^text-/, ""));
    return node;
  }

  function prepareTextRoots() {
    var s1 = document.querySelector('.passage-section[data-section="1"]');
    var s2 = document.querySelector('.passage-section[data-section="2"]');
    var s3 = document.querySelector('.passage-section[data-section="3"]');

    if (s1) setTextIdentity(s1, "text-s1-section");
    if (s2) setTextIdentity(s2, "text-s2-section");
    if (s3) setTextIdentity(s3, "text-s3-clothkits");
  }

  function prepareInlineFeedbackHosts() {
    [36, 37, 38, 39, 40].forEach(function (question) {
      var answer = document.getElementById("ca-" + question);
      if (!answer || answer.closest(".feedback-only")) return;
      var wrapper = document.createElement("div");
      wrapper.className = "question-block feedback-only";
      wrapper.setAttribute("data-q", String(question));
      answer.parentNode.insertBefore(wrapper, answer);
      wrapper.appendChild(answer);
    });
  }

  function prepareStructuredGroupAnchors() {
    document.querySelectorAll("#questionContent .note-completion-box,#questionContent .summary-completion-box").forEach(function (box) {
      box.classList.add("summary-box");
    });
  }

  function prepareCandidateHeader() {
    var topLeft = document.querySelector(".top-left");
    var topRight = document.querySelector(".top-right");
    if (!topLeft) return null;
    topLeft.classList.add("gt18-test2-header-left");
    if (topRight) topRight.classList.add("gt18-test2-header-right");

    var title = topLeft.querySelector(".test-title");
    if (title) title.textContent = "IELTS 18 General Training Reading Test 2";
    document.title = "IELTS 18 General Training Reading Test 2 | IELTS Pabs";

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

  function activeTextIdForPart(part) {
    var feedback = window.IELTS18GTTest2StudyFeedback;
    var question = Number(typeof currentQuestion === "number" ? currentQuestion : 0);
    var section = Number(part || activeSection || 1);
    if (!feedback || !Array.isArray(feedback.taskGroups)) return "";
    var currentGroup = feedback.taskGroups.find(function (group) {
      return Number(group.section) === section && Array.isArray(group.questions) && group.questions.indexOf(question) !== -1;
    });
    if (currentGroup && currentGroup.textId) return currentGroup.textId;
    var firstGroup = feedback.taskGroups.find(function (group) { return Number(group.section) === section; });
    return firstGroup && firstGroup.textId ? firstGroup.textId : "";
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
        return normal(user) === normal(accepted);
      });
    }
    if (typeof key !== "string") return false;
    if (/^(TRUE|FALSE|NOT GIVEN)$/.test(key)) return user.toUpperCase() === key;
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

  function freezeSubmittedResult(value) {
    Object.keys(value.partScores).forEach(function (part) { Object.freeze(value.partScores[part]); });
    Object.freeze(value.partScores);
    Object.freeze(value.questionOutcomes);
    return Object.freeze(value);
  }

  function captureSubmittedResult() {
    var scores = sectionScores();
    var outcomes = {};
    for (var question = 1; question <= 40; question += 1) outcomes[question] = Boolean(correctFor(question));
    var rawScore = scores[1] + scores[2] + scores[3];
    submissionSequence += 1;
    submittedResultSnapshot = freezeSubmittedResult({
      submissionId: "gt18-test2-" + submissionSequence,
      rawScore: rawScore,
      band: computeBandScore(rawScore),
      partScores: {
        1: { score: scores[1], max: 14 },
        2: { score: scores[2], max: 13 },
        3: { score: scores[3], max: 13 }
      },
      questionOutcomes: outcomes
    });
    return submittedResultSnapshot;
  }

  function getSubmittedResultSnapshot() {
    var value = submittedResultSnapshot;
    if (!value) return null;
    var outcomes = {};
    for (var question = 1; question <= 40; question += 1) outcomes[question] = value.questionOutcomes[question];
    return {
      submissionId: value.submissionId,
      rawScore: value.rawScore,
      band: value.band,
      partScores: {
        1: { score: value.partScores[1].score, max: value.partScores[1].max },
        2: { score: value.partScores[2].score, max: value.partScores[2].max },
        3: { score: value.partScores[3].score, max: value.partScores[3].max }
      },
      questionOutcomes: outcomes
    };
  }

  function setClearLocked(button, locked) {
    if (!button) return;
    button.disabled = Boolean(locked);
    button.setAttribute("aria-disabled", locked ? "true" : "false");
  }

  function ensureSectionThreeClearControls() {
    [28, 29, 30, 31].forEach(function (question) {
      var block = document.querySelector('#questionContent .question-block[data-q="' + question + '"]');
      if (!block) return;
      var select = block.querySelector('select[name="q' + question + '"]');
      var zone = block.querySelector('.drop-zone[data-for="q' + question + '"]');
      if (!select || !zone) return;
      var existing = zone.parentElement && zone.parentElement.querySelector(".gt-section1-clear");
      if (existing) return;

      var row = document.createElement("div");
      row.className = "gt-section1-drop-row gt-test2-section3-drop-row";
      zone.parentNode.insertBefore(row, zone);
      row.appendChild(zone);

      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "gt-section1-clear gt-test2-section3-clear";
      clear.textContent = "Clear";
      clear.setAttribute("aria-label", "Clear answer for question " + question);
      clear.addEventListener("click", function () {
        if (select.disabled || zone.classList.contains("reading-shell-locked") || zone.getAttribute("aria-disabled") === "true") return;
        select.value = "";
        select.dispatchEvent(new Event("change", { bubbles: true }));
        zone.textContent = "Drop here";
        zone.classList.remove("filled", "over");
        zone.removeAttribute("data-answer-value");
      });
      row.appendChild(clear);
      setClearLocked(clear, select.disabled);
    });
  }

  function lockSubmittedTest() {
    document.querySelectorAll(".passage-match-source,.drag-item").forEach(function (item) {
      item.draggable = false;
      item.classList.remove("selected");
      item.classList.add("reading-shell-locked");
      item.setAttribute("aria-disabled", "true");
      item.setAttribute("tabindex", "-1");
    });
    document.querySelectorAll(".drop-zone").forEach(function (zone) {
      zone.classList.remove("over");
      zone.classList.add("reading-shell-locked");
      zone.setAttribute("aria-disabled", "true");
      zone.setAttribute("tabindex", "-1");
    });
    document.querySelectorAll(".gt-section1-clear").forEach(function (button) {
      setClearLocked(button, true);
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
    if (document.documentElement.getAttribute("data-gt18-test2-submitted-matching-guard") === "true") return;
    document.documentElement.setAttribute("data-gt18-test2-submitted-matching-guard", "true");

    function blocks(event) {
      if (!(typeof mode === "string" && mode === "test" && Boolean(testSubmitted))) return false;
      var target = event.target && event.target.closest && event.target.closest(".passage-match-source,.drag-item,.drop-zone,.gt-section1-clear");
      if (!target) return false;
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }

    ["click", "dblclick", "keydown", "dragstart", "dragover", "drop"].forEach(function (eventName) {
      document.addEventListener(eventName, blocks, true);
    });
  }

  function positionScoreFeedbackButton() {
    var mount = document.getElementById("readingFeatureShellMount");
    var root = mount && mount.querySelector(".reading-shell-root");
    var button = document.querySelector(".reading-shell-score-feedback-button");
    var topLeft = document.querySelector(".top-left");
    var candidate = document.getElementById("candidateNameDisplay");
    if (!button || !topLeft) return;
    var narrow = Boolean(window.matchMedia && window.matchMedia("(max-width: 600px)").matches);
    if (narrow) {
      if (root && button.parentElement !== root) root.appendChild(button);
      return;
    }
    if (candidate && candidate.parentElement === topLeft) {
      if (button.parentElement !== topLeft || button.previousElementSibling !== candidate) {
        candidate.insertAdjacentElement("afterend", button);
      }
    } else if (button.parentElement !== topLeft) {
      topLeft.appendChild(button);
    }
  }

  function localiseReadingFeatureShell() {
    positionScoreFeedbackButton();
    var replacements = [
      [/IELTS Academic Reading/g, "IELTS General Training Reading"],
      [/Academic Reading/g, "General Training Reading"],
      [/Performance by part/g, "Performance by section"],
      [/performance by part/g, "performance by section"],
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
    if (!window.ReadingFeatureShell || window.ReadingFeatureShell.__gt18Test2Localised) return;
    ["init", "sync", "startStudySession", "showAllPassageClues", "hideAllPassageClues"].forEach(function (methodName) {
      var original = window.ReadingFeatureShell[methodName];
      if (typeof original !== "function") return;
      window.ReadingFeatureShell[methodName] = function () {
        var result = original.apply(this, arguments);
        window.setTimeout(localiseReadingFeatureShell, 0);
        return result;
      };
    });
    window.ReadingFeatureShell.__gt18Test2Localised = true;
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
        submittedResultSnapshot = null;
        var result = originalStartTest.apply(this, arguments);
        syncCandidateHeader();
        ensureSectionThreeClearControls();
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

    var originalHighlightCurrentQuestion = window.highlightCurrentQuestion;
    if (typeof originalHighlightCurrentQuestion === "function") {
      window.highlightCurrentQuestion = function () {
        var result = originalHighlightCurrentQuestion.apply(this, arguments);
        if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === "function") {
          window.setTimeout(function () { window.ReadingFeatureShell.sync(); }, 0);
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
        var snapshot = captureSubmittedResult();
        var sectionLine = document.getElementById("sectionScoresLine");
        if (sectionLine) {
          sectionLine.textContent = "Section 1: " + snapshot.partScores[1].score + "/14 · Section 2: " + snapshot.partScores[2].score + "/13 · Section 3: " + snapshot.partScores[3].score + "/13";
        }
        var bandLine = document.getElementById("bandLine");
        if (bandLine) {
          bandLine.textContent = bandLine.textContent.replace("Estimated IELTS Reading band", "Estimated IELTS General Training Reading band");
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

  function buildShellData(feedback) {
    var groups = feedback.taskGroups.map(function (group) {
      return Object.assign({}, group, { part: group.section, passage: group.textId });
    });
    var byId = Object.fromEntries(groups.map(function (group) { return [group.id, group]; }));
    var details = {};
    var clues = {};
    Object.keys(feedback.questions).forEach(function (key) {
      var question = Number(key);
      var record = feedback.questions[key];
      var group = byId[record.group];
      details[question] = [record.explanation, record.skill, record.evidence];
      clues[question] = {
        question: question,
        part: group.part,
        textId: group.textId,
        target: record.evidence,
        clue: "Show the supporting text for Question " + question
      };
    });
    return { groups: groups, details: details, clues: clues };
  }

  function initStudyMode() {
    prepareChrome();
    prepareTextRoots();
    prepareInstructionHosts();
    prepareInlineFeedbackHosts();
    prepareStructuredGroupAnchors();
    ensureSectionThreeClearControls();
    installSubmittedMatchingGuard();
    patchPageFunctions();
    renderSectionHeader();
    syncCandidateHeader();

    var feedback = window.IELTS18GTTest2StudyFeedback;
    if (!feedback || !window.ReadingFeatureShell) {
      console.warn("IELTS 18 GT Test 2 Study Mode assets could not load.");
      return;
    }

    var shellData = buildShellData(feedback);
    window.isUserAnswerCorrect = correctFor;
    window.readingFeatureShellConfig = {
      version: 1,
      test: {
        id: "cambridge-18-general-training-reading-test-2",
        title: "IELTS 18 General Training Reading Test 2",
        totalQuestions: 40,
        partLabel: "Section",
        partRanges: sectionRanges
      },
      state: {
        getMode: function () { return mode; },
        isTestSubmitted: function () { return Boolean(testSubmitted); },
        getActivePart: function () { return Number(activeSection || 1); },
        getActiveTextId: activeTextIdForPart,
        getSubmittedResult: getSubmittedResultSnapshot
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
      study: {
        completeQuestionCoverage: true,
        completeClueCoverage: true,
        showEvidenceText: false,
        taskGroups: shellData.groups,
        questionDetails: shellData.details,
        clueTargets: shellData.clues,
        scoreGuide: feedback.scoreGuide
      }
    };

    wrapReadingFeatureShellLocalisation();
    var shellInit = window.ReadingFeatureShell.init(window.readingFeatureShellConfig);
    if (!shellInit || shellInit.ok !== true) {
      console.warn("IELTS 18 GT Test 2 Study Mode could not initialise.", shellInit && shellInit.error);
    }
    localiseReadingFeatureShell();
    window.addEventListener("resize", positionScoreFeedbackButton);
  }

  document.addEventListener("DOMContentLoaded", initStudyMode, { once: true });
}());
