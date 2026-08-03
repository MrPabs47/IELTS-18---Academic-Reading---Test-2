(() => {
  const TEST_TITLE = "IELTS 16 Academic Writing Test 1";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The charts below show the changes in ownership of electrical appliances and amount of time spent doing housework in households in one country between 1920 and 2019.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="./task-1-electrical-appliances-housework.svg?v=20260803-0234" alt="Two line charts showing household ownership of washing machines, refrigerators and vacuum cleaners, and weekly hours of housework per household, between 1920 and 2019." tabindex="0" title="Click to enlarge the charts within this pane">
        </div>
      </figure>`,
    study: {
      type: "Line charts",
      understanding: [
        "Describe the main changes in appliance ownership over the period.",
        "Describe the overall change in weekly housework hours.",
        "Compare the most important trends and notable exceptions."
      ],
      structure: [
        "Introduction",
        "Overview",
        "Main changes in electrical-appliance ownership",
        "Changes in weekly housework hours and key comparisons"
      ],
      checklist: [
        "I included a clear overview of both charts.",
        "I selected the main trends rather than listing every number.",
        "I made relevant comparisons using accurate data.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In some countries, more and more people are becoming interested in finding out about the history of the house or building they live in.</p>
        <p>What are the reasons for this?</p>
        <p>How can people research this?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Two-part question",
      understanding: [
        "Explain why people may want to learn about the history of their home or building.",
        "Explain practical ways people can research this history.",
        "Support the main ideas with relevant reasons and examples."
      ],
      structure: [
        "Introduction",
        "Reasons for the growing interest",
        "Ways to research a house or building",
        "Conclusion"
      ],
      checklist: [
        "I answered both questions directly.",
        "My reasons are clearly explained.",
        "My research methods are practical and relevant.",
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
