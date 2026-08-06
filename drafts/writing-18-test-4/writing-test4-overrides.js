(() => {
  const TEST_TITLE = "IELTS 18 Academic Writing Test 4";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://i0.wp.com/ieltswriting.org/wp-content/uploads/2024/09/ielts-18a-4-1.png?resize=560%2C435&ssl=1";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The graph below shows the average monthly change in the prices of three metals during 2014.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame metals-graph-visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="A line graph showing the average monthly percentage change in the prices of copper, nickel and zinc during 2014." tabindex="0" title="Click to enlarge the metals price-change graph within this pane">
        </div>
      </figure>`,
    study: {
      type: "Line graph showing monthly percentage changes",
      understanding: [
        "Compare the monthly percentage changes in the prices of copper, nickel and zinc throughout 2014.",
        "Identify the shared decline towards the middle of the year, nickel’s greater volatility and the recovery of all three metals near the end.",
        "Group months and trends logically instead of describing every point separately."
      ],
      structure: [
        "Introduction",
        "Overview of the common pattern and main differences",
        "Changes from January to June",
        "Changes from July to December"
      ],
      checklist: [
        "I included a clear overview of the overall pattern and the most volatile metal.",
        "I compared the metals directly at important points in the year.",
        "I described percentage changes rather than treating the values as metal prices.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In many countries, people are now living longer than ever before. Some people say an ageing population creates problems for governments. Other people think there are benefits if society has more elderly people.</p>
        <p>To what extent do the advantages of having an ageing population outweigh the disadvantages?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Advantages outweigh disadvantages essay",
      understanding: [
        "Discuss important advantages and disadvantages of an ageing population.",
        "Make a clear judgement about whether the benefits are more significant than the problems.",
        "Support the judgement with developed reasons and relevant examples involving society, families, employment or public services."
      ],
      structure: [
        "Introduction with a clear overall judgement",
        "Main disadvantages and their significance",
        "Main advantages and their significance",
        "Conclusion explaining which side outweighs the other"
      ],
      checklist: [
        "I answered the outweigh question directly.",
        "My judgement is clear and consistent throughout the essay.",
        "I discussed meaningful advantages as well as disadvantages.",
        "I supported my evaluation and wrote at least 250 words."
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
    const subjectText = `IELTS 18 Writing – Test 4 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
