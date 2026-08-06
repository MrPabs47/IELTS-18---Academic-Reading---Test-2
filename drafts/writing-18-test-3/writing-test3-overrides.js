(() => {
  const TEST_TITLE = "IELTS 18 Academic Writing Test 3";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "library-plan.png";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The diagram below shows the floor plan of a public library 20 years ago and how it looks now.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame library-plan-visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="Two floor plans comparing the Central Library 20 years ago with the library today, including changes to rooms, book areas, services and facilities." tabindex="0" title="Click to enlarge the Central Library plans within this pane">
        </div>
      </figure>`,
    study: {
      type: "Plans showing changes over time",
      understanding: [
        "Compare the Central Library 20 years ago with its present layout.",
        "Identify the major changes in room use, book collections, technology, services and visitor facilities.",
        "Use accurate location language and group related changes instead of listing every label separately."
      ],
      structure: [
        "Introduction",
        "Overview of the main modernisation and changes in use",
        "Changes on the left-hand side of the library",
        "Changes on the right-hand side and in the central area"
      ],
      checklist: [
        "I included a clear overview of the most important changes.",
        "I compared the old and current plans directly.",
        "I described locations and replacements accurately.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In many countries around the world, rural people are moving to cities, so the population in the countryside is decreasing.</p>
        <p>Do you think this is a positive or a negative development?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Positive or negative development essay",
      understanding: [
        "Decide whether rural-to-urban migration and the resulting decline in countryside populations are mainly positive or negative.",
        "Explain the social, economic, environmental or service-related consequences that support your judgement.",
        "Acknowledge relevant benefits or drawbacks without losing a clear overall position."
      ],
      structure: [
        "Introduction with a clear judgement",
        "First main consequence supporting your position",
        "Second main consequence or a considered counterargument",
        "Conclusion restating the overall judgement"
      ],
      checklist: [
        "My positive-or-negative judgement is clear throughout the essay.",
        "I explained the consequences for both cities and rural areas where relevant.",
        "I developed my ideas with reasons and examples rather than only listing effects.",
        "I wrote at least 250 words."
      ]
    }
  };

  const reportOverlay = document.getElementById("submissionReportOverlay");
  const reportText = () => document.getElementById("submissionReportText");
  const reportName = () => document.getElementById("submissionStudentName")?.value.trim() || state.candidate || "Not provided";

  function correctReportIdentity() {
    const textarea = reportText();
    if (!textarea) return;
    textarea.value = textarea.value.replace(/^IELTS 16 Academic Writing Test 2/m, TEST_TITLE);
  }

  if (reportOverlay) {
    new MutationObserver(() => {
      if (reportOverlay.style.display !== "none") requestAnimationFrame(correctReportIdentity);
    }).observe(reportOverlay, { attributes: true, attributeFilter: ["style"] });
  }

  document.addEventListener("input", (event) => {
    if (event.target?.id === "submissionStudentName" || event.target?.id === "submissionStudentEmail") {
      queueMicrotask(correctReportIdentity);
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("#confirmSubmit, #submitButton, #optionsSubmit, .submitted-banner button");
    if (trigger) window.setTimeout(correctReportIdentity, 0);
  }, true);

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-report-action]");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    correctReportIdentity();

    const textarea = reportText();
    if (!textarea) return;

    const action = button.dataset.reportAction;
    const name = reportName();
    const subjectText = `IELTS 18 Writing – Test 3 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(textarea.value);
    const to = encodeURIComponent(TEACHER_EMAIL);

    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(textarea.value);
      } catch (error) {
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.setSelectionRange(0, 0);
      }
      const status = document.querySelector(".submission-copy-status");
      if (status) status.textContent = "All text copied. Paste it into an email or Teams message.";
      return;
    }

    let url = `mailto:${TEACHER_EMAIL}?subject=${subject}&body=${body}`;
    if (action === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    } else if (action === "outlook") {
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, true);
})();
