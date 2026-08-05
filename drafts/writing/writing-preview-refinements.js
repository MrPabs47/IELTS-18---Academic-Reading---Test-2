(() => {
  const teacherEmail = "pablo.jaramillo@ilsc.com.au";
  const byId = (id) => document.getElementById(id);
  const isAcademicWritingPage = /Academic Writing/i.test(document.title);

  let reportOverlay = null;
  let reportText = null;
  let reportName = null;
  let reportEmail = null;
  let copyStatus = null;

  // IELTS Pabs animated logo — kept identical to the Academic Reading tests.
  function initAnimatedLogo() {
    const logoNodes = document.querySelectorAll('.logo.home-link, .logo-link .logo');
    if (!logoNodes.length) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    logoNodes.forEach((logoNode) => {
      const rawText = (logoNode.textContent || '').trim();
      if (rawText !== 'IELTS Pabs') return;

      logoNode.setAttribute('aria-label', 'IELTS Pabs');

      const fragment = document.createDocumentFragment();
      Array.from(rawText).forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'logo-char';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--logo-char-index', String(index));
        span.textContent = char === ' ' ? ' ' : char;
        fragment.appendChild(span);
      });

      logoNode.textContent = '';
      logoNode.appendChild(fragment);

      if (reducedMotion) {
        logoNode.classList.remove('is-animating');
        return;
      }

      logoNode.addEventListener('mouseenter', () => {
        logoNode.classList.remove('is-animating');
        void logoNode.offsetWidth;
        logoNode.classList.add('is-animating');
      });

      logoNode.addEventListener('mouseleave', () => {
        logoNode.classList.remove('is-animating');
      });
    });
  }

  const clampSplit = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return 50;
    return Math.max(28, Math.min(72, number));
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString("en-AU", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch (error) {
      return new Date(timestamp).toLocaleString();
    }
  };

  const currentTimerText = () => byId("timerDisplay")?.textContent.trim() || "";
  const candidateName = () => reportName?.value.trim() || state.candidate || "Not provided";
  const studentEmail = () => reportEmail?.value.trim() || "";

  const buildReport = () => {
    syncAnswer();
    const task1 = state.answers[1] || "";
    const task2 = state.answers[2] || "";
    const lines = [
      "IELTS 16 Academic Writing Test 2",
      `Mode: ${state.mode === "test" ? "Test mode" : "Study mode"}`,
      `Submitted: ${formatDate(state.lastSubmittedAt || Date.now())}`,
      `Student name: ${candidateName()}`
    ];

    if (studentEmail()) lines.push(`Student email: ${studentEmail()}`);
    if (state.mode === "test" && currentTimerText()) lines.push(`Timer status: ${currentTimerText()} remaining`);

    lines.push(
      "",
      "=== Writing Task 1 ===",
      `Word count: ${countWords(task1)}`,
      task1 || "[No answer entered]",
      "",
      "=== Writing Task 2 ===",
      `Word count: ${countWords(task2)}`,
      task2 || "[No answer entered]"
    );

    return lines.join("\n");
  };

  const updateReportPreview = () => {
    if (reportText) reportText.value = buildReport();
  };

  const subjectLine = () => {
    const name = candidateName();
    return `IELTS Writing – Test 2 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
  };

  const openEmailUrl = (provider) => {
    updateReportPreview();
    const subject = encodeURIComponent(subjectLine());
    const body = encodeURIComponent(reportText.value);
    const to = encodeURIComponent(teacherEmail);
    let url = `mailto:${teacherEmail}?subject=${subject}&body=${body}`;

    if (provider === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    } else if (provider === "outlook") {
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyReport = async () => {
    updateReportPreview();
    try {
      await navigator.clipboard.writeText(reportText.value);
    } catch (error) {
      reportText.focus();
      reportText.select();
      document.execCommand("copy");
      reportText.setSelectionRange(0, 0);
    }
    copyStatus.textContent = "All text copied. Paste it into an email or Teams message.";
  };

  function closeReport() {
    if (reportOverlay) reportOverlay.style.display = "none";
  }

  const ensureReportOverlay = () => {
    if (reportOverlay) return;

    reportOverlay = document.createElement("div");
    reportOverlay.id = "submissionReportOverlay";
    reportOverlay.className = "submission-report-overlay";
    reportOverlay.innerHTML = `
      <section class="submission-report-panel" role="dialog" aria-modal="true" aria-labelledby="submissionReportTitle">
        <header class="submission-report-head">
          <div>
            <h2 id="submissionReportTitle">Test submitted</h2>
            <p>Copy or email the answers before closing or reloading this page. This preview does not save progress.</p>
          </div>
          <button class="submission-report-close" type="button" aria-label="Close submission report">✕</button>
        </header>
        <div class="submission-report-body">
          <div class="submission-report-fields">
            <label>Student name<input id="submissionStudentName" type="text" maxlength="80"></label>
            <label>Student email (optional)<input id="submissionStudentEmail" type="email" maxlength="120"></label>
          </div>
          <label class="sr-only" for="submissionReportText">Submission report</label>
          <textarea id="submissionReportText" readonly></textarea>
          <div class="submission-report-actions">
            <button type="button" class="primary" data-report-action="copy">Copy report</button>
            <button type="button" data-report-action="gmail">Open Gmail</button>
            <button type="button" data-report-action="outlook">Open Outlook / Hotmail</button>
            <button type="button" data-report-action="email">Use email app</button>
          </div>
          <p class="submission-report-note">For very long answers, copying and pasting the report is safer than relying on a pre-filled email.</p>
          <div class="submission-copy-status" aria-live="polite"></div>
        </div>
      </section>`;

    document.body.appendChild(reportOverlay);
    reportText = byId("submissionReportText");
    reportName = byId("submissionStudentName");
    reportEmail = byId("submissionStudentEmail");
    copyStatus = reportOverlay.querySelector(".submission-copy-status");

    reportName.value = state.candidate || "";
    reportName.addEventListener("input", updateReportPreview);
    reportEmail.addEventListener("input", updateReportPreview);
    reportOverlay.querySelector(".submission-report-close").addEventListener("click", closeReport);
    reportOverlay.addEventListener("click", (event) => {
      if (event.target === reportOverlay) closeReport();
    });
    reportOverlay.querySelector('[data-report-action="copy"]').addEventListener("click", copyReport);
    reportOverlay.querySelector('[data-report-action="gmail"]').addEventListener("click", () => openEmailUrl("gmail"));
    reportOverlay.querySelector('[data-report-action="outlook"]').addEventListener("click", () => openEmailUrl("outlook"));
    reportOverlay.querySelector('[data-report-action="email"]').addEventListener("click", () => openEmailUrl("email"));
  };

  function openReport() {
    ensureReportOverlay();
    reportName.value = state.candidate || reportName.value || "";
    copyStatus.textContent = "";
    updateReportPreview();
    reportOverlay.style.display = "flex";
    reportName.focus();
  }

  const ensureSubmittedBanner = () => {
    const banner = byId("submittedBanner");
    if (!banner) return;

    if (!state.submitted) {
      banner.style.display = "none";
      return;
    }

    banner.style.display = "flex";
    banner.innerHTML = '<span>Test submitted · answers remain editable</span><button type="button">Open report</button>';
    banner.querySelector("button").addEventListener("click", openReport);
  };

  const originalRenderTask = renderTask;
  renderTask = function refinedRenderTask() {
    originalRenderTask();
    byId("answerEditor").disabled = false;
    const submit = byId("submitButton");
    if (submit && (state.mode === "test" || isAcademicWritingPage)) {
      submit.title = state.submitted ? "Prepare updated report" : "Submit test";
      submit.setAttribute("aria-label", submit.title);
    }
  };

  const originalRenderChrome = renderChrome;
  renderChrome = function refinedRenderChrome() {
    originalRenderChrome();
    const optionsSubmit = byId("optionsSubmit");
    if (optionsSubmit) {
      optionsSubmit.style.display = state.mode === "test" || (isAcademicWritingPage && state.mode === "study") ? "flex" : "none";
    }
    ensureSubmittedBanner();
  };

  openSubmit = function refinedOpenSubmit() {
    syncAnswer();
    const task1Words = countWords(state.answers[1] || "");
    const task2Words = countWords(state.answers[2] || "");
    byId("submitSummary").textContent = `Writing Task 1: ${task1Words} words. Writing Task 2: ${task2Words} words. Submitting stops the timer and prepares a report, but the answers remain editable on this page.`;
    byId("submitTitle").textContent = state.submitted ? "Prepare an updated report?" : "Submit your Writing test?";
    byId("confirmSubmit").textContent = state.submitted ? "Prepare updated report" : "Submit test";
    byId("submitOverlay").style.display = "flex";
  };

  submitTest = function refinedSubmitTest(reason = "student") {
    syncAnswer();
    state.submitted = true;
    state.submissionReason = reason;
    state.lastSubmittedAt = Date.now();
    state.submissions = Array.isArray(state.submissions) ? state.submissions : [];
    state.submissions.push({
      submittedAt: state.lastSubmittedAt,
      reason,
      candidate: state.candidate || "",
      answers: { 1: state.answers[1] || "", 2: state.answers[2] || "" }
    });

    clearInterval(timerId);
    timerId = null;
    byId("submitOverlay").style.display = "none";
    renderChrome();
    renderTask();
    openReport();
  };

  const installAcademicStudySubmission = () => {
    if (!isAcademicWritingPage) return;
    const previousButton = byId("submitButton");
    if (!previousButton) return;

    // Clone the button to remove the original Study Mode self-review handler,
    // then route both modes through the existing submission/report flow.
    const submitButton = previousButton.cloneNode(true);
    previousButton.replaceWith(submitButton);
    submitButton.addEventListener("click", () => openSubmit());
    submitButton.title = state.submitted ? "Prepare updated report" : "Submit test";
    submitButton.setAttribute("aria-label", submitButton.title);
  };

  const installStableDivider = () => {
    const previousDivider = byId("divider");
    const main = byId("mainInner");
    if (!previousDivider || !main) return;

    const divider = previousDivider.cloneNode(true);
    previousDivider.replaceWith(divider);
    let activePointer = null;

    const applyFromPointer = (clientX) => {
      const rect = main.getBoundingClientRect();
      if (!rect.width) return;
      state.split = clampSplit(((clientX - rect.left) / rect.width) * 100);
      document.documentElement.style.setProperty("--split", `${state.split}%`);
    };

    divider.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      activePointer = event.pointerId;
      document.body.classList.add("resizing-panes");
      divider.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    window.addEventListener("pointermove", (event) => {
      if (activePointer === null || event.pointerId !== activePointer) return;
      applyFromPointer(event.clientX);
      event.preventDefault();
    }, { passive: false });

    const finish = (event) => {
      if (activePointer === null) return;
      if (event.pointerId !== undefined && event.pointerId !== activePointer) return;
      activePointer = null;
      document.body.classList.remove("resizing-panes");
    };

    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("blur", finish);

    divider.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      state.split = clampSplit(state.split + (event.key === "ArrowRight" ? 2 : -2));
      document.documentElement.style.setProperty("--split", `${state.split}%`);
    });
  };

  initAnimatedLogo();
  ensureReportOverlay();
  installAcademicStudySubmission();
  installStableDivider();
})();
