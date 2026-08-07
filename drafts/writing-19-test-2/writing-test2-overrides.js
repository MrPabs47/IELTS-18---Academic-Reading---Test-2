(() => {
  const TEST_TITLE = "IELTS 19 Academic Writing Test 2";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "porth-harbour-enhanced.png";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The plans below show a harbour in 2000 and how it looks today.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame porth-harbour-visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="Two plans comparing Porth Harbour in 2000 and today." tabindex="0" title="Click to enlarge the harbour plans within this pane">
        </div>
      </figure>`,
    study: {
      type: "Map comparison showing changes over time",
      understanding: [
        "Compare Porth Harbour in 2000 with the harbour today.",
        "Identify the main additions, relocations and changes of use, as well as important features that remained.",
        "Group changes by area or function instead of listing every label separately."
      ],
      structure: [
        "Introduction",
        "Overview of the most significant changes",
        "Changes on the western and central sides of the harbour",
        "Changes around the docks and the eastern side"
      ],
      checklist: [
        "I included a clear overview of the main changes.",
        "I compared the two plans directly.",
        "I used accurate place names and location language.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>The working week should be shorter and workers should have a longer weekend.</p>
        <p>Do you agree or disagree?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Agree or disagree essay",
      understanding: [
        "Decide clearly whether working weeks should be shorter and weekends longer.",
        "Develop reasons connected to areas such as wellbeing, productivity, employers and essential services.",
        "Keep your position consistent while acknowledging any relevant limitation or opposing concern."
      ],
      structure: [
        "Introduction with a clear position",
        "First main reason with explanation and example",
        "Second main reason or response to an opposing concern",
        "Conclusion reinforcing your position"
      ],
      checklist: [
        "My position is clear throughout the essay.",
        "Each body paragraph develops one main idea fully.",
        "I supported my ideas with relevant explanation or examples.",
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
    const subjectText = `IELTS 19 Writing – Test 2 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
