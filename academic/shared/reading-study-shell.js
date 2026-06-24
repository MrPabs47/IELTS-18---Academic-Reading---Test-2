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
        fullClueMapPassages: new Set()
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
          const group = (call(adapter.getTaskGroups, []) || []).find((item) => item.id === groupId);
          this.syncFullClueMapState(group ? group.passage : undefined);
          this.updateClueToolbar();
        },
        hideGroup(groupId) {
          state.visibleGroups.delete(groupId);
          if (typeof adapter.hideGroupFeedback === "function") adapter.hideGroupFeedback(groupId);
          const group = (call(adapter.getTaskGroups, []) || []).find((item) => item.id === groupId);
          if (group) state.fullClueMapPassages.delete(String(group.passage));
          this.renderVisibleEvidence(group ? group.passage : undefined);
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
        renderVisibleEvidence(passage) {
          const active = passage === undefined ? null : String(passage);
          if (active !== null && typeof adapter.clearEvidenceForPassage === "function") {
            adapter.clearEvidenceForPassage(active);
          } else if (typeof adapter.clearEvidence === "function") {
            adapter.clearEvidence();
          }
          (call(adapter.getTaskGroups, []) || [])
            .filter((group) => active === null || String(group.passage) === active)
            .forEach((group) => {
            if (state.visibleGroups.has(group.id) && typeof adapter.markEvidence === "function") {
              (group.questionNumbers || []).forEach((q) => adapter.markEvidence(q));
            }
          });
          this.syncFullClueMapState(active);
          this.updateClueToolbar();
        },
        showAllPassageClues() {
          const active = call(adapter.getActivePassage, null);
          if (typeof adapter.clearEvidenceForPassage === "function") adapter.clearEvidenceForPassage(active);
          else if (typeof adapter.clearEvidence === "function") adapter.clearEvidence();
          (call(adapter.getTaskGroups, []) || [])
            .filter((group) => String(group.passage) === String(active))
            .forEach((group) => (group.questionNumbers || []).forEach((q) => adapter.markEvidence && adapter.markEvidence(q)));
          state.fullClueMapPassages.add(String(active));
          this.updateClueToolbar();
        },
        hideAllPassageClues() {
          const active = call(adapter.getActivePassage, null);
          state.fullClueMapPassages.delete(String(active));
          if (!!call(adapter.isSubmitted, false)) {
            if (typeof adapter.clearEvidenceForPassage === "function") adapter.clearEvidenceForPassage(active);
            else if (typeof adapter.clearEvidence === "function") adapter.clearEvidence();
            this.updateClueToolbar();
            return;
          }
          this.renderVisibleEvidence(active);
        },
        focusClue(questionNumber) {
          // Full passage maps are authoritative controller state; preserve them while focusing one clue.
          const active = call(adapter.getActivePassage, null);
          if (!state.fullClueMapPassages.has(String(active))) this.renderVisibleEvidence(active);
          const el = typeof adapter.focusQuestionClue === "function" ? adapter.focusQuestionClue(questionNumber) : null;
          this.updateClueToolbar();
          return el;
        },
        syncFullClueMapState(passage) {
          const groups = call(adapter.getTaskGroups, []) || [];
          const passages = passage === undefined || passage === null
            ? Array.from(new Set(groups.map((group) => String(group.passage))))
            : [String(passage)];
          passages.forEach((passageKey) => {
            const passageGroups = groups.filter((group) => String(group.passage) === passageKey);
            if (passageGroups.length && passageGroups.every((group) => state.visibleGroups.has(group.id))) {
              state.fullClueMapPassages.add(passageKey);
            } else {
              state.fullClueMapPassages.delete(passageKey);
            }
          });
        },
        updateClueToolbar() {
          const toggle = byId("passageClueToggle");
          if (!toggle) return;
          const active = call(adapter.getActivePassage, null);
          const groups = call(adapter.getTaskGroups, []) || [];
          const isStudyMode = call(adapter.isStudyMode, call(adapter.getMode, "test") === "study");
          const submitted = !!call(adapter.isSubmitted, false);
          const hasPassageClues = groups.some((group) => String(group.passage) === String(active));
          toggle.hidden = (!isStudyMode && !submitted) || !hasPassageClues;
          toggle.disabled = toggle.hidden;
          toggle.setAttribute("aria-hidden", toggle.hidden ? "true" : "false");
          const fullMapVisible = state.fullClueMapPassages.has(String(active));
          toggle.textContent = fullMapVisible ? "Hide all passage clues" : "Show all passage clues";
          toggle.onclick = () => {
            if (toggle.hidden || toggle.disabled) return;
            if (state.fullClueMapPassages.has(String(call(adapter.getActivePassage, null)))) controller.hideAllPassageClues();
            else controller.showAllPassageClues();
          };
        },
        reset() {
          state.fullClueMapPassages.clear();
          this.renderVisibleEvidence();
        }
      };
      return controller;
    }
  };
}());
