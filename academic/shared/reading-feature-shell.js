(function () {
  "use strict";

  var current = document.currentScript;
  var coreSource = current && current.src ? current.src.replace(/reading-feature-shell\.js(?:\?.*)?$/, "reading-feature-shell-core.js") : "../../shared/reading-feature-shell-core.js";

  function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function patchSharedEvidenceBadges() {
    var pendingSnapshots = [];

    function questionNumberFor(button) {
      var card = button.closest("[id^='reading-shell-feedback-']");
      var match = card && card.id.match(/(\d+)$/);
      return match ? Number(match[1]) : null;
    }

    function snapshotVisibleEvidence() {
      return Array.prototype.map.call(document.querySelectorAll(".reading-shell-evidence-highlight"), function (mark) {
        return {
          evidence: mark.getAttribute("data-reading-shell-evidence-text") || "",
          questions: Array.prototype.map.call(mark.querySelectorAll(".reading-shell-clue-badge"), function (badge) {
            return String(badge.getAttribute("data-reading-shell-clue-question") || badge.textContent || "").trim();
          }).filter(Boolean)
        };
      });
    }

    function findNewMark(questionNumber) {
      var expected = String(questionNumber);
      return Array.prototype.find.call(document.querySelectorAll(".reading-shell-evidence-highlight"), function (mark) {
        return Array.prototype.some.call(mark.querySelectorAll(".reading-shell-clue-badge"), function (badge) {
          return String(badge.textContent || "").trim() === expected;
        });
      });
    }

    function sectionFor(questionNumber) {
      if (questionNumber <= 13) return 1;
      if (questionNumber <= 26) return 2;
      return 3;
    }

    function navigate(questionNumber) {
      if (typeof window.switchSection === "function") window.switchSection(sectionFor(questionNumber));
      window.setTimeout(function () {
        var target = document.querySelector(".inline-input[data-q='" + questionNumber + "']") || document.querySelector(".question-block[data-q='" + questionNumber + "']") || document.querySelector("[data-q='" + questionNumber + "']");
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("reading-shell-question-focus");
        window.setTimeout(function () { target.classList.remove("reading-shell-question-focus"); }, 1400);
      }, 80);
    }

    function ensureBadge(mark, questionNumber) {
      var value = String(questionNumber);
      var exists = Array.prototype.some.call(mark.querySelectorAll(".reading-shell-clue-badge"), function (badge) {
        return String(badge.getAttribute("data-reading-shell-clue-question") || badge.textContent || "").trim() === value;
      });
      if (exists) return;
      var badge = document.createElement("button");
      badge.type = "button";
      badge.className = "reading-shell-clue-badge";
      badge.textContent = value;
      badge.setAttribute("data-reading-shell-clue-question", value);
      badge.setAttribute("aria-label", "Return to question " + value);
      badge.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        navigate(Number(value));
      });
      mark.append(badge);
    }

    document.addEventListener("click", function (event) {
      var button = event.target.closest && event.target.closest(".reading-shell-study-clue-button");
      if (!button) return;
      var questionNumber = questionNumberFor(button);
      if (!questionNumber) return;
      pendingSnapshots.push({ questionNumber: questionNumber, before: snapshotVisibleEvidence() });
      window.setTimeout(function () {
        var pending = pendingSnapshots.shift();
        if (!pending) return;
        var currentMark = findNewMark(pending.questionNumber);
        if (!currentMark) return;
        var evidence = currentMark.getAttribute("data-reading-shell-evidence-text") || "";
        pending.before.filter(function (entry) { return entry.evidence && entry.evidence === evidence; }).forEach(function (entry) {
          entry.questions.forEach(function (question) { ensureBadge(currentMark, question); });
        });
      }, 150);
    }, true);
  }

  function patchTestModeStudyControls() {
    function mode() {
      var config = window.readingFeatureShellConfig;
      return config && config.state && typeof config.state.getMode === "function" ? config.state.getMode() : "";
    }

    function syncTestModeControls() {
      if (mode() === "study") return;
      document.querySelectorAll(".reading-shell-study-controls").forEach(function (controls) {
        controls.style.display = "none";
      });
      document.querySelectorAll(".reading-shell-study-icon-button,.reading-shell-study-reveal-button").forEach(function (button) {
        button.hidden = true;
        button.disabled = true;
        button.setAttribute("aria-expanded", "false");
      });
      document.querySelectorAll(".reading-shell-study-panel").forEach(function (panel) {
        panel.hidden = true;
      });
    }

    function scheduleSync() {
      window.setTimeout(syncTestModeControls, 0);
    }

    document.addEventListener("DOMContentLoaded", scheduleSync, { once: true });
    document.addEventListener("click", scheduleSync, true);
    [0, 120, 500, 1200].forEach(function (delay) { window.setTimeout(syncTestModeControls, delay); });
    if (window.MutationObserver && document.body) {
      new MutationObserver(scheduleSync).observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ["hidden", "style"] });
    }
  }

  document.write('<script src="' + escapeAttribute(coreSource) + '"></script><script>(' + patchSharedEvidenceBadges.toString() + ')();(' + patchTestModeStudyControls.toString() + ')();</script>');
}());
