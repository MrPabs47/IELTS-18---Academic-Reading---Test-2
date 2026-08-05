(() => {
  const byId = (id) => document.getElementById(id);
  const originalSubmitButton = byId("submitButton");
  if (!originalSubmitButton || typeof openSubmit !== "function") return;

  // Remove the original Study Mode self-review click handler while preserving
  // the established button markup, classes and accessibility attributes.
  const submitButton = originalSubmitButton.cloneNode(true);
  originalSubmitButton.replaceWith(submitButton);
  submitButton.addEventListener("click", () => openSubmit());

  const updateSubmitLabel = () => {
    const button = byId("submitButton");
    if (!button) return;
    button.title = state.submitted ? "Prepare updated report" : "Submit test";
    button.setAttribute("aria-label", button.title);
  };

  const originalRenderTask = renderTask;
  renderTask = function academicStudySubmissionRenderTask() {
    originalRenderTask();
    updateSubmitLabel();
  };

  const originalRenderChrome = renderChrome;
  renderChrome = function academicStudySubmissionRenderChrome() {
    originalRenderChrome();
    const optionsSubmit = byId("optionsSubmit");
    if (optionsSubmit) optionsSubmit.style.display = state.mode ? "flex" : "none";
  };

  updateSubmitLabel();
  const optionsSubmit = byId("optionsSubmit");
  if (optionsSubmit) optionsSubmit.style.display = state.mode ? "flex" : "none";
})();
