(() => {
  const TEST_TITLE = "IELTS 17 Academic Writing Test 2";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://i0.wp.com/www.ieltsworldly.com/wp-content/uploads/2024/08/Map-Task-1-Cambridge-IELTS-17-Academic-Writing-Practice-Test-2.webp?resize=800%2C582&ssl=1";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="A table showing sources of the police budget in 2017 and 2018, with two pie charts showing spending on salaries, technology, buildings and transport." tabindex="0" title="Click to enlarge the police-budget table and charts within this pane">
        </div>
      </figure>`,
    study: {
      type: "Table and pie charts",
      understanding: [
        "Compare the sources of the police budget in 2017 and 2018.",
        "Identify the most important changes in how the budget was distributed.",
        "Select and compare the main figures rather than listing every number separately."
      ],
      structure: [
        "Introduction",
        "Overview of the main budget and spending trends",
        "Budget sources in 2017 and 2018",
        "Changes in spending distribution"
      ],
      checklist: [
        "I included a clear overview covering both the table and the pie charts.",
        "I compared the two years using accurate figures and percentages.",
        "I grouped related information logically instead of reporting data randomly.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Some children spend hours every day on their smartphones.</p>
        <p>Why is this the case? Do you think this is a positive or a negative development?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Two-part essay: reasons and evaluation",
      understanding: [
        "Explain the main reasons why some children spend several hours each day using smartphones.",
        "Make a clear judgement about whether this development is positive or negative.",
        "Support both parts of the response with relevant explanation and examples."
      ],
      structure: [
        "Introduction answering both questions",
        "Reasons for extensive smartphone use",
        "Why the development is positive or negative",
        "Conclusion"
      ],
      checklist: [
        "I answered both the reasons question and the positive-or-negative question.",
        "My judgement is clear and consistent throughout the essay.",
        "I developed my main ideas with relevant support and examples.",
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
    const subjectText = `IELTS Writing – Test 2 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
