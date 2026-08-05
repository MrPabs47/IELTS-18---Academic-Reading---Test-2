(() => {
  const TEST_TITLE = "IELTS 17 Academic Writing Test 4";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "https://i0.wp.com/www.ieltsworldly.com/wp-content/uploads/2023/08/Screenshot-2023-08-24-at-09-34-07-CAMBRIDGE-17-TEST.pdf.webp?resize=769%2C492&ssl=1";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The graph below shows the number of shops that closed and the number of new shops that opened in one country between 2011 and 2018.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame shop-graph-visual-frame">
          <div class="shop-graph-title">Number of shop closures and openings 2011–2018</div>
          <img id="taskImage" src="${TASK_IMAGE}" alt="A line graph comparing the numbers of shop closures and openings in one country from 2011 to 2018." tabindex="0" title="Click to enlarge the shop closures and openings graph within this pane">
        </div>
      </figure>`,
    study: {
      type: "Line graph",
      understanding: [
        "Compare changes in shop closures and new shop openings between 2011 and 2018.",
        "Identify the overall trends as well as the sharp fall in closures in 2015.",
        "Select key peaks, low points and years when the two figures were close rather than reporting every value equally."
      ],
      structure: [
        "Introduction",
        "Overview of the main trends and exceptional year",
        "Changes in shop closures",
        "Changes in shop openings and direct comparisons"
      ],
      checklist: [
        "I included a clear overview of the overall trends and the unusual 2015 closure figure.",
        "I compared closures and openings directly where useful.",
        "I used approximate figures accurately and selected the most important years.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Nowadays, a growing number of people with health problems are trying alternative medicines and treatments instead of visiting their usual doctor.</p>
        <p>Do you think this is a positive or a negative development?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Positive or negative development essay",
      understanding: [
        "Decide whether the increasing use of alternative medicines instead of conventional doctors is mainly positive or negative.",
        "Explain the health, safety, cost or accessibility consequences that support your position.",
        "Address relevant benefits or drawbacks without losing a clear overall judgement."
      ],
      structure: [
        "Introduction with a clear position",
        "First main reason supporting your judgement",
        "Second main reason, limitation or counterargument",
        "Conclusion restating the overall judgement"
      ],
      checklist: [
        "My position is clear and consistent throughout the essay.",
        "I explained why the development is positive or negative rather than only listing examples.",
        "My examples are relevant to healthcare, treatment safety or access.",
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
    const subjectText = `IELTS Writing – Test 4 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
