/* Shared IELTS Pabs Reading Study Mode shell controller.
   Dependency-free static helper; pages provide DOM/data callbacks via adapter. */
(function () {
  function call(fn, fallback) {
    return typeof fn === "function" ? fn() : fallback;
  }
  function setVisible(el, visible, displayValue) {
    if (!el) return;
    el.classList.toggle("is-visible", !!visible);
    el.setAttribute("aria-hidden", visible ? "false" : "true");
    if (displayValue) el.style.display = visible ? displayValue : "none";
  }

  window.ReadingStudyShell = {
    version: "study-shell-1",
    init(adapter) {
      if (!adapter || typeof adapter !== "object") {
        throw new Error("ReadingStudyShell.init requires an adapter object");
      }
      const state = {
        visibleGroups: adapter.visibleGroups || new Set(),
        fullClueMapVisible: false
      };
      const elements = Object.assign({
        scoreGuideButton: "scoreGuideButton",
        studyModePill: "studyModePill",
        studyTimer: "studyTimerContainer",
        passageClueToggle: "passageClueToggle",
        studyHeaderChrome: "studyHeaderChrome"
      }, adapter.elements || {});
      const byId = (key) => document.getElementById(elements[key]);

      const controller = {
        showChrome(show, options) {
          const opts = options || {};
          const isStudyMode = call(adapter.isStudyMode, call(adapter.getMode, "test") === "study");
          const submitted = !!call(adapter.isSubmitted, false);
          const studyActive = !!show && isStudyMode && !submitted;
          setVisible(byId("studyHeaderChrome"), !!show, "inline-flex");
          setVisible(byId("scoreGuideButton"), !!show, "inline-flex");
          setVisible(byId("studyModePill"), !!(show && opts.showPill !== false && isStudyMode), "inline-flex");
          setVisible(byId("studyTimer"), studyActive, "block");
          document.querySelectorAll(".study-task-panel").forEach((el) => {
            el.classList.toggle("is-visible", !!show || submitted);
            el.style.display = (!!show || submitted) ? "block" : "none";
          });
          this.updateClueToolbar();
        },
        showGroup(groupId) {
          state.visibleGroups.add(groupId);
          if (typeof adapter.showGroupFeedback === "function") adapter.showGroupFeedback(groupId);
          this.renderGroupEvidence(groupId);
          this.updateClueToolbar();
        },
        hideGroup(groupId) {
          state.visibleGroups.delete(groupId);
          if (typeof adapter.hideGroupFeedback === "function") adapter.hideGroupFeedback(groupId);
          this.renderVisibleEvidence();
        },
        isGroupVisible(groupId) {
          return state.visibleGroups.has(groupId);
        },
        renderGroupEvidence(groupId) {
          const group = (call(adapter.getTaskGroups, []) || []).find((item) => item.id === groupId);
          if (group && typeof adapter.markEvidence === "function") {
            (group.questionNumbers || []).forEach((q) => adapter.markEvidence(q));
          }
        },
        renderVisibleEvidence() {
          if (typeof adapter.clearEvidence === "function") adapter.clearEvidence();
          (call(adapter.getTaskGroups, []) || []).forEach((group) => {
            if (state.visibleGroups.has(group.id) && typeof adapter.markEvidence === "function") {
              (group.questionNumbers || []).forEach((q) => adapter.markEvidence(q));
            }
          });
          this.updateClueToolbar();
        },
        showAllPassageClues() {
          if (typeof adapter.clearEvidence === "function") adapter.clearEvidence();
          const active = call(adapter.getActivePassage, null);
          (call(adapter.getTaskGroups, []) || [])
            .filter((group) => String(group.passage) === String(active))
            .forEach((group) => (group.questionNumbers || []).forEach((q) => adapter.markEvidence && adapter.markEvidence(q)));
          state.fullClueMapVisible = true;
          this.updateClueToolbar();
        },
        hideAllPassageClues() {
          state.fullClueMapVisible = false;
          this.renderVisibleEvidence();
        },
        focusClue(questionNumber) {
          // Full passage maps are authoritative controller state; preserve them while focusing one clue.
          if (!state.fullClueMapVisible) this.renderVisibleEvidence();
          const el = typeof adapter.focusQuestionClue === "function" ? adapter.focusQuestionClue(questionNumber) : null;
          this.updateClueToolbar();
          return el;
        },
        updateClueToolbar() {
          const toggle = byId("passageClueToggle");
          if (!toggle) return;
          const active = call(adapter.getActivePassage, null);
          const groups = call(adapter.getTaskGroups, []) || [];
          const hasPassageClues = groups.some((group) => String(group.passage) === String(active));
          const isStudyMode = call(adapter.isStudyMode, call(adapter.getMode, "test") === "study");
          const submitted = !!call(adapter.isSubmitted, false);
          toggle.hidden = (!isStudyMode && !submitted) || !hasPassageClues;
          toggle.textContent = state.fullClueMapVisible ? "Hide all passage clues" : "Show all passage clues";
          toggle.onclick = () => {
            if (state.fullClueMapVisible) controller.hideAllPassageClues();
            else controller.showAllPassageClues();
          };
        }
      };
      return controller;
    }
  };
}());
