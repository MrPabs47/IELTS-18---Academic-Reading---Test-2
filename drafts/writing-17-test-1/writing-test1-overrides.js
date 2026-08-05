(() => {
  const TEST_TITLE = "IELTS 17 Academic Writing Test 1";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://ieltsfocus.com/wp-content/uploads/2023/02/Norbiton-map-IELTS-17-828x1024.png";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The maps below show an industrial area in the town of Norbiton, and planned future development of the site.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="Two maps showing the Norbiton industrial area now and its planned future development, including the replacement of factories with housing, roads and public facilities." tabindex="0" title="Click to enlarge the Norbiton maps within this pane">
        </div>
      </figure>`,
    study: {
      type: "Maps",
      understanding: [
        "Compare the current industrial site with the planned future development.",
        "Identify the most important overall changes, including the removal of factories and the addition of housing and public facilities.",
        "Describe locations and connections accurately using clear map language."
      ],
      structure: [
        "Introduction",
        "Overview of the main redevelopment",
        "Current industrial-area layout",
        "Planned roads, housing and facilities"
      ],
      checklist: [
        "I included a clear overview of the most important changes.",
        "I compared the two maps rather than describing them as unrelated pictures.",
        "I described locations, roads and facilities accurately.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>It is important for people to take risks, both in their professional lives and their personal lives.</p>
        <p>Do you think the advantages of taking risks outweigh the disadvantages?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Advantages outweigh disadvantages essay",
      understanding: [
        "Discuss the main advantages and disadvantages of taking risks in professional and personal life.",
        "Make a clear judgement about whether the benefits are more significant than the drawbacks.",
        "Support the judgement with relevant reasons and examples."
      ],
      structure: [
        "Introduction with a clear position",
        "Main advantages",
        "Main disadvantages and evaluation",
        "Conclusion"
      ],
      checklist: [
        "I answered the outweigh question directly.",
        "My position is clear throughout the essay.",
        "I developed both sides with relevant support.",
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
    const subjectText = `IELTS Writing – Test 1 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
