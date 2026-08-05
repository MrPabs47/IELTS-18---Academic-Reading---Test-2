(() => {
  const TEST_TITLE = "IELTS 17 Academic Writing Test 3";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://i0.wp.com/www.ieltsworldly.com/wp-content/uploads/2023/08/Screenshot-2023-08-23-at-10-51-24-CAMBRIDGE-17-TEST.pdf.webp?resize=636%2C569&ssl=1";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The chart below gives information about how families in one country spent their weekly income in 1968 and in 2018.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame family-spending-visual-frame">
          <div class="family-spending-title">1968 and 2018: average weekly spending by families</div>
          <img id="taskImage" src="${TASK_IMAGE}" alt="A horizontal bar chart comparing the percentages of weekly income that families spent on eight categories in 1968 and 2018." tabindex="0" title="Click to enlarge the family-spending chart within this pane">
        </div>
      </figure>`,
    study: {
      type: "Bar chart",
      understanding: [
        "Compare how the proportions of weekly family income spent on eight categories changed between 1968 and 2018.",
        "Identify the largest spending categories in each year and the most significant increases and decreases.",
        "Group similar trends instead of describing every bar separately."
      ],
      structure: [
        "Introduction",
        "Overview of the main changes",
        "Categories that increased or became more important",
        "Categories that decreased or changed little"
      ],
      checklist: [
        "I included a clear overview of the dominant categories and major changes.",
        "I compared 1968 and 2018 directly using accurate percentages where relevant.",
        "I grouped categories logically rather than listing all eight in chart order.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Some people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country if they wish.</p>
        <p>Discuss both these views and give your own opinion.</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Discussion essay with opinion",
      understanding: [
        "Explain why some people think trained professionals should serve the country that educated them.",
        "Explain why others believe professionals should be free to work in another country.",
        "State and support your own opinion clearly throughout the essay."
      ],
      structure: [
        "Introduction presenting both views and your position",
        "Reasons for requiring professionals to work where they trained",
        "Reasons for allowing professionals to work abroad",
        "Conclusion restating your opinion"
      ],
      checklist: [
        "I discussed both views in a balanced and developed way.",
        "My own opinion is clear and consistent throughout the essay.",
        "I supported the main ideas with relevant reasons and examples.",
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
