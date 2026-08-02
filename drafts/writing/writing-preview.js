const IMAGE_URL = "https://static.wixstatic.com/media/6d9e77_6f12e24e96e146978e49d51017278897~mv2.jpg/v1/fill/w_1800,h_2100,al_c,q_95,enc_avif,quality_auto/6d9e77_6f12e24e96e146978e49d51017278897~mv2.webp";

const tasks = {
  1: {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The diagram below shows the manufacturing process for making sugar from sugar cane.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="${IMAGE_URL}" alt="A seven-stage process showing how sugar is produced from sugar cane, from growing and harvesting to drying and cooling." tabindex="0" title="Click to enlarge the diagram within this pane">
        </div>
      </figure>`,
    study: {
      type: "Process diagram",
      understanding: [
        "Describe the stages in a clear sequence.",
        "Include an overview of the whole process.",
        "Report the main features without giving an opinion."
      ],
      structure: [
        "Introduction",
        "Overview",
        "Early stages: growing, harvesting and crushing",
        "Later stages: purification, evaporation, separation, drying and cooling"
      ],
      checklist: [
        "I included a clear overview.",
        "I described the stages in a logical order.",
        "I used accurate process language.",
        "I wrote at least 150 words."
      ]
    }
  },
  2: {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In their advertising, businesses nowadays usually emphasise that their products are new in some way.</p>
        <p>Why is this? Do you think it is a positive or negative development?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Two-part question",
      understanding: [
        "Explain why businesses emphasise that products are new.",
        "Answer whether this is a positive or negative development.",
        "Keep your position clear throughout the essay."
      ],
      structure: [
        "Introduction",
        "Why businesses emphasise novelty",
        "Evaluation of the development",
        "Conclusion"
      ],
      checklist: [
        "I answered both questions.",
        "My position is clear.",
        "Each main idea is explained and supported.",
        "I wrote at least 250 words."
      ]
    }
  }
};

const $ = (id) => document.getElementById(id);

let state = {
  mode: null,
  task: 1,
  answers: { 1: "", 2: "" },
  candidate: "",
  deadline: null,
  submitted: false,
  split: 50,
  theme: "black-on-white",
  font: "normal"
};

let timerId = null;
let timerPaused = false;
let fullscreenEnforced = false;

function countWords(text) {
  return (text.trim().match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*(?:-[A-Za-z0-9]+)*/g) || []).length;
}

function updateWordCount() {
  $("wordCount").textContent = `Words: ${countWords($("answerEditor").value)}`;
}

function syncAnswer() {
  state.answers[state.task] = $("answerEditor").value;
}

function chooseMode(mode) {
  if (mode === "test") {
    $("testStartScreen").style.display = "block";
    $("studentNameInput").focus();
    return;
  }
  startAttempt("study");
}

async function beginTimedTest() {
  const name = $("studentNameInput").value.trim();
  if (!name) {
    alert("Please enter your name before starting test mode.");
    $("studentNameInput").focus();
    return;
  }

  state.candidate = name;
  fullscreenEnforced = false;
  if (isFullscreenSupported()) {
    fullscreenEnforced = await requestFullscreen();
  } else {
    $("fullscreenSupportNote").style.display = "block";
  }
  startAttempt("test");
}

function startAttempt(mode) {
  state.mode = mode;
  state.task = 1;
  state.answers = { 1: "", 2: "" };
  state.submitted = false;
  state.submissions = [];
  state.deadline = mode === "test" ? Date.now() + 60 * 60 * 1000 : null;

  $("modeScreen").style.display = "none";
  $("app").style.display = "block";
  renderChrome();
  renderTask();
  startTimer();
  $("answerEditor").focus();
}

function renderChrome() {
  const study = state.mode === "study";
  $("studyHeaderChrome").style.display = study ? "flex" : "none";
  $("timerContainer").style.display = state.mode === "test" ? "block" : "none";
  $("candidateNameDisplay").style.display = state.mode === "test" && state.candidate ? "block" : "none";
  $("candidateNameDisplay").textContent = state.candidate ? `Candidate: ${state.candidate}` : "";
  $("optionsSubmit").style.display = state.mode === "test" ? "flex" : "none";
  $("submittedBanner").style.display = state.submitted ? "flex" : "none";

  document.body.dataset.theme = state.theme || "black-on-white";
  document.body.classList.toggle("font-large", state.font === "large");
  document.body.classList.toggle("font-xlarge", state.font === "xlarge");
  document.documentElement.style.setProperty("--split", `${state.split || 50}%`);

  updateOptionButtons();
  updateFullscreenButton();
}

function renderTask() {
  const task = tasks[state.task];
  $("taskHeader").textContent = task.title;
  $("taskCopy").innerHTML = task.html;
  $("answerEditor").value = state.answers[state.task] || "";
  $("answerEditor").disabled = false;
  $("passagePane").classList.remove("image-focus");

  document.querySelectorAll(".part-chip").forEach((chip) => {
    chip.classList.toggle("active", Number(chip.dataset.task) === state.task);
  });

  $("prevTask").disabled = state.task === 1;
  $("nextTask").disabled = state.task === 2;
  $("submitButton").title = state.mode === "test" ? "Submit test" : "Self-review";
  $("submitButton").setAttribute("aria-label", $("submitButton").title);

  updateWordCount();
  wireImage();
}

function switchTask(number) {
  if (!tasks[number]) return;
  syncAnswer();
  state.task = number;
  renderTask();
  $("answerEditor").focus();
}

function wireImage() {
  const image = $("taskImage");
  if (!image) return;

  const toggle = () => $("passagePane").classList.toggle("image-focus");
  image.addEventListener("click", toggle);
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
}

function startTimer() {
  clearInterval(timerId);
  if (state.mode !== "test" || state.submitted) return;

  const draw = () => {
    const secondsLeft = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    $("timerDisplay").textContent = `${minutes}:${seconds}`;
    $("timerDisplay").classList.toggle("timer-warning", secondsLeft <= 180);
    if (secondsLeft <= 0) submitTest("time");
  };

  draw();
  timerId = setInterval(draw, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  timerPaused = true;
}

function resumeTimer() {
  if (timerPaused && state.mode === "test" && !state.submitted) {
    timerPaused = false;
    startTimer();
  }
}

function openSubmit() {
  syncAnswer();
  $("submitSummary").textContent = `Writing Task 1: ${countWords(state.answers[1] || "")} words. Writing Task 2: ${countWords(state.answers[2] || "")} words.`;
  $("submitOverlay").style.display = "flex";
}

function submitTest(reason = "student") {
  syncAnswer();
  state.submitted = true;
  state.submissionReason = reason;
  clearInterval(timerId);
  timerId = null;
  $("submitOverlay").style.display = "none";
  renderChrome();
  renderTask();
}

function openSelfReview() {
  const items = tasks[state.task].study.checklist.map((item) => `<li>${item}</li>`).join("");
  $("reviewContent").innerHTML = `<ul>${items}</ul>`;
  $("reviewOverlay").style.display = "flex";
}

function openStudyTools() {
  const study = tasks[state.task].study;
  const list = (heading, items, ordered = false) => {
    const tag = ordered ? "ol" : "ul";
    return `<section><h3>${heading}</h3><${tag}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}></section>`;
  };

  $("studyDrawerBody").innerHTML =
    `<section><h3>Task type</h3><p>${study.type}</p></section>` +
    list("Understanding the question", study.understanding) +
    list("Suggested structure", study.structure, true) +
    list("Self-review checklist", study.checklist);
  $("studyDrawer").hidden = false;
}

function openOptions(show) {
  $("optionsOverlay").style.display = show ? "flex" : "none";
}

function setTheme(theme) {
  state.theme = theme;
  renderChrome();
}

function setFont(font) {
  state.font = font;
  renderChrome();
}

function updateOptionButtons() {
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === state.theme);
  });
  document.querySelectorAll("[data-font-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.fontChoice === state.font);
  });
}

function isFullscreenSupported() {
  return Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen);
}

function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

async function requestFullscreen() {
  try {
    await document.documentElement.requestFullscreen();
    return isFullscreenActive();
  } catch (error) {
    return false;
  }
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch (error) {}
}

async function toggleFullscreen() {
  if (state.mode === "test" && !state.submitted && fullscreenEnforced && isFullscreenActive()) return;
  if (isFullscreenActive()) await exitFullscreen();
  else await requestFullscreen();
  updateFullscreenButton();
}

function updateFullscreenButton() {
  const locked = state.mode === "test" && !state.submitted && fullscreenEnforced && isFullscreenActive();
  $("fullscreenBtn").classList.toggle("is-active", isFullscreenActive());
  $("fullscreenBtn").disabled = locked;
  $("fullscreenBtnLabel").textContent = locked ? "Full screen locked" : isFullscreenActive() ? "Exit full screen" : "Full screen";
}

function handleFullscreenChange() {
  if (state.mode === "test" && !state.submitted && fullscreenEnforced) {
    if (!isFullscreenActive()) {
      pauseTimer();
      $("fullscreenLockOverlay").style.display = "flex";
    } else {
      $("fullscreenLockOverlay").style.display = "none";
      resumeTimer();
    }
  }
  updateFullscreenButton();
}

async function returnToFullscreen() {
  if (await requestFullscreen()) {
    $("fullscreenLockOverlay").style.display = "none";
    resumeTimer();
  }
  updateFullscreenButton();
}

function confirmHome() {
  if (state.mode && !state.submitted && !confirm("Leave this Writing test and return to the hub? Any unsent writing will be lost.")) return;
  window.location.href = "../../index.html";
}

document.querySelectorAll(".mode-btn[data-mode]").forEach((button) => {
  button.addEventListener("click", () => chooseMode(button.dataset.mode));
});

$("beginTestBtn").addEventListener("click", beginTimedTest);
$("answerEditor").addEventListener("input", () => {
  syncAnswer();
  updateWordCount();
});
document.querySelectorAll(".part-chip").forEach((chip) => {
  chip.addEventListener("click", () => switchTask(Number(chip.dataset.task)));
});
$("prevTask").addEventListener("click", () => switchTask(1));
$("nextTask").addEventListener("click", () => switchTask(2));
$("submitButton").addEventListener("click", () => state.mode === "test" ? openSubmit() : openSelfReview());
$("optionsBtn").addEventListener("click", () => openOptions(true));
$("optionsClose").addEventListener("click", () => openOptions(false));
$("optionsOverlay").addEventListener("click", (event) => {
  if (event.target === $("optionsOverlay")) openOptions(false);
});
$("optionsSubmit").addEventListener("click", () => {
  openOptions(false);
  openSubmit();
});
$("cancelSubmit").addEventListener("click", () => $("submitOverlay").style.display = "none");
$("confirmSubmit").addEventListener("click", () => submitTest("student"));
$("closeReview").addEventListener("click", () => $("reviewOverlay").style.display = "none");
$("studyToolsBtn").addEventListener("click", openStudyTools);
$("closeStudyDrawer").addEventListener("click", () => $("studyDrawer").hidden = true);
$("fullscreenBtn").addEventListener("click", toggleFullscreen);
$("returnFullscreenBtn").addEventListener("click", returnToFullscreen);
$("homeLogo").addEventListener("click", confirmHome);
document.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
});
document.querySelectorAll("[data-font-choice]").forEach((button) => {
  button.addEventListener("click", () => setFont(button.dataset.fontChoice));
});
document.addEventListener("fullscreenchange", handleFullscreenChange);
window.addEventListener("beforeunload", (event) => {
  if (state.mode && !state.submitted) {
    event.preventDefault();
    event.returnValue = "";
  }
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.location.reload();
});

$("modeScreen").style.display = "flex";
$("app").style.display = "none";