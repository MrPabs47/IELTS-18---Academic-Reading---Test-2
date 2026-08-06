(() => {
  const TEST_TITLE = "IELTS 18 Academic Writing Test 2";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://engnovate.com/wp-content/uploads/2023/08/cambridge-ielts-18-academic-writing-test-2-1.webp";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The chart below shows the number of households in the US by their annual income in 2007, 2011 and 2015.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame city-population-visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="A grouped bar chart showing the number of US households, in millions, in five annual-income bands in 2007, 2011 and 2015." tabindex="0" title="Click to enlarge the Task 1 visual within this pane">
        </div>
      </figure>`,
    study: {
      type: "Grouped bar chart comparing three years",
      understanding: [
        "Compare the numbers of US households in five annual-income bands in 2007, 2011 and 2015.",
        "Identify the largest and smallest groups, the changes between the three years and the particularly strong rise in households earning $100,000 or more by 2015.",
        "Group related income bands and use approximate figures selectively instead of describing every bar separately."
      ],
      structure: [
        "Introduction",
        "Overview of the main rankings and changes",
        "Lower-income households",
        "Middle- and higher-income households"
      ],
      checklist: [
        "I included a clear overview of the largest groups and the most noticeable change.",
        "I compared the same income bands across the three years.",
        "I used the units correctly and selected relevant approximate figures.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Some university students want to learn about other subjects in addition to their main subjects. Others believe it is more important to give all their time and attention to studying for a qualification.</p>
        <p>Discuss both these views and give your own opinion.</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Discuss both views and give your opinion essay",
      understanding: [
        "Explain why some university students value studying subjects beyond their main discipline.",
        "Explain why others think students should concentrate entirely on the qualification they are pursuing.",
        "Give a clear personal opinion and support it with developed reasons and relevant examples."
      ],
      structure: [
        "Introduction presenting both views and your position",
        "Benefits of learning additional subjects",
        "Reasons to focus on the main qualification",
        "Conclusion restating your judgement"
      ],
      checklist: [
        "I discussed both views rather than presenting only my own position.",
        "My opinion is clear and consistent throughout the essay.",
        "I developed each side with reasons and relevant examples.",
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
    const subjectText = `IELTS 18 Writing – Test 2 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
