(() => {
  const activeSessionKey = "ielts-pabs-writing-16-2-active-tab-v1";
  const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
  const navigationType = navigationEntry?.type || "navigate";
  const isReloadOfActiveAttempt =
    navigationType === "reload" &&
    sessionStorage.getItem(activeSessionKey) === "1";

  if (isReloadOfActiveAttempt) return;

  clearInterval(timerId);
  timerId = null;
  timerPaused = false;
  fullscreenEnforced = false;
  state = {
    ...state,
    mode: null,
    task: 1,
    answers: { 1: "", 2: "" },
    candidate: "",
    deadline: null,
    submitted: false,
    submissions: [],
    editedAfterSubmission: false
  };

  const app = document.getElementById("app");
  const modeScreen = document.getElementById("modeScreen");
  const testStartScreen = document.getElementById("testStartScreen");
  const fullscreenLockOverlay = document.getElementById("fullscreenLockOverlay");
  if (app) app.style.display = "none";
  if (modeScreen) modeScreen.style.display = "flex";
  if (testStartScreen) testStartScreen.style.display = "none";
  if (fullscreenLockOverlay) fullscreenLockOverlay.style.display = "none";
})();