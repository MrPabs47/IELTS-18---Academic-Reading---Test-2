(() => {
  const TEST_TITLE = "IELTS 16 Academic Writing Test 3";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The plans below show the site of an airport now and how it will look after redevelopment next year.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="./task-1-southwest-airport.svg?v=20260803-1445" alt="Two plans showing Southwest Airport now and after redevelopment, including gates, passenger facilities, shops, a sky train and car hire." tabindex="0" title="Click to enlarge the airport plans within this pane">
        </div>
      </figure>`,
    study: {
      type: "Plans",
      understanding: [
        "Compare the present airport layout with the planned redevelopment.",
        "Identify the main structural changes, including the larger gate area and new transport connection.",
        "Report the important new passenger facilities and where they will be located."
      ],
      structure: [
        "Introduction",
        "Overview of the main redevelopment",
        "Current airport layout",
        "Planned layout and new facilities"
      ],
      checklist: [
        "I included a clear overview of the most important changes.",
        "I compared the present and future plans rather than describing them separately without links.",
        "I accurately described locations, facilities and gate numbers.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Many manufactured food and drink products contain high levels of sugar, which causes many health problems. Sugary products should be made more expensive to encourage people to consume less sugar.</p>
        <p>Do you agree or disagree?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Opinion essay",
      understanding: [
        "State clearly whether you agree, disagree or partly agree that sugary products should cost more.",
        "Explain how higher prices could influence consumption and public health.",
        "Consider relevant limitations or alternative measures where they support your position."
      ],
      structure: [
        "Introduction with a clear position",
        "First main reason",
        "Second main reason or counterargument",
        "Conclusion"
      ],
      checklist: [
        "My position is clear throughout the essay.",
        "Each main idea is fully explained and supported.",
        "My examples are relevant to sugar consumption, pricing or public health.",
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
    const subjectText = `IELTS Writing – Test 3 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
