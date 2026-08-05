(() => {
  const TEST_TITLE = "IELTS 18 Academic Writing Test 1";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://i0.wp.com/ieltswriting.org/wp-content/uploads/2024/09/ielts-18a-1-1.png?resize=695%2C511&ssl=1";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The graph below gives information about the percentage of the population in four Asian countries living in cities from 1970 to 2020, with predictions for 2030 and 2040.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame city-population-visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="A line graph showing the percentage of the population living in cities in the Philippines, Malaysia, Thailand and Indonesia from 1970 to 2020, with predictions for 2030 and 2040." tabindex="0" title="Click to enlarge the urban-population graph within this pane">
        </div>
      </figure>`,
    study: {
      type: "Line graph with historical data and projections",
      understanding: [
        "Compare the proportions of people living in cities in the Philippines, Malaysia, Thailand and Indonesia from 1970 to 2020, then describe the predictions for 2030 and 2040.",
        "Identify the broad rise in all four countries, Malaysia’s leading position for most of the period, Indonesia’s strong later growth and the Philippines’ mid-period fluctuation.",
        "Select representative years and useful comparisons instead of listing every data point."
      ],
      structure: [
        "Introduction",
        "Overview of the main trends and rankings",
        "Malaysia and Indonesia",
        "The Philippines and Thailand, including the projections"
      ],
      checklist: [
        "I included a clear overview showing that urban populations rise overall in all four countries.",
        "I compared the countries directly and mentioned the most noticeable changes or rankings.",
        "I distinguished past figures from the predictions for 2030 and 2040.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>The most important aim of science should be to improve people’s lives.</p>
        <p>To what extent do you agree or disagree with this statement?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Agree or disagree essay",
      understanding: [
        "Decide how strongly you agree that improving people’s lives should be the most important aim of science.",
        "Explain what ‘improve people’s lives’ means in your argument and whether other scientific aims should have equal or greater importance.",
        "Support your position with developed reasons and relevant examples rather than only describing scientific discoveries."
      ],
      structure: [
        "Introduction with a clear degree of agreement",
        "First main reason supporting your position",
        "Second main reason or consideration of another scientific aim",
        "Conclusion restating your overall judgement"
      ],
      checklist: [
        "My degree of agreement is clear and consistent throughout the essay.",
        "I explained why improving people’s lives should or should not be science’s most important aim.",
        "My examples are relevant and clearly connected to my argument.",
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
    const subjectText = `IELTS 18 Writing – Test 1 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
