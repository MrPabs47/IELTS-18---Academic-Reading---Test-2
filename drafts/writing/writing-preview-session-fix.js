(() => {
  const activeSessionKey = "ielts-pabs-writing-16-2-active-tab-v1";
  const params = new URLSearchParams(window.location.search);
  const forceFresh = params.get("fresh") === "1";
  const navigation = performance.getEntriesByType("navigation")[0];
  const navigationType = navigation ? navigation.type : "navigate";
  const canResumeReload = navigationType === "reload" && sessionStorage.getItem(activeSessionKey) === "1";

  if (forceFresh || !canResumeReload) {
    clearInterval(timerId);
    timerId = null;
    clearTimeout(saveId);
    saveId = null;
    sessionStorage.removeItem(activeSessionKey);
    localStorage.removeItem(STORAGE_KEY);

    state = {
      mode: null,
      task: 1,
      answers: { 1: "", 2: "" },
      candidate: "",
      deadline: null,
      submitted: false,
      split: 50,
      theme: state.theme || "black-on-white",
      font: state.font || "normal",
      submissions: [],
      editedAfterSubmission: false
    };

    const app = document.getElementById("app");
    const modeScreen = document.getElementById("modeScreen");
    const testStartScreen = document.getElementById("testStartScreen");
    const candidateInput = document.getElementById("studentNameInput");
    const answerEditor = document.getElementById("answerEditor");
    const fullscreenLockOverlay = document.getElementById("fullscreenLockOverlay");
    const optionsOverlay = document.getElementById("optionsOverlay");
    const submitOverlay = document.getElementById("submitOverlay");
    const reviewOverlay = document.getElementById("reviewOverlay");
    const submissionReportOverlay = document.getElementById("submissionReportOverlay");

    if (app) app.style.display = "none";
    if (modeScreen) modeScreen.style.display = "flex";
    if (testStartScreen) testStartScreen.style.display = "none";
    if (candidateInput) candidateInput.value = "";
    if (answerEditor) answerEditor.value = "";
    if (fullscreenLockOverlay) fullscreenLockOverlay.style.display = "none";
    if (optionsOverlay) optionsOverlay.style.display = "none";
    if (submitOverlay) submitOverlay.style.display = "none";
    if (reviewOverlay) reviewOverlay.style.display = "none";
    if (submissionReportOverlay) submissionReportOverlay.style.display = "none";
    document.documentElement.style.setProperty("--split", "50%");

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  if (forceFresh) {
    params.delete("fresh");
    const cleanQuery = params.toString();
    const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`;
    history.replaceState(null, "", cleanUrl);
  }
})();