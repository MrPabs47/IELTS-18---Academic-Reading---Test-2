(() => {
  const TEST_TITLE = "IELTS 16 General Training Writing Test 1";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question letter-task-question">
        <p>Mrs Barrett, an English-speaking woman who lives in your town, has advertised for someone to help her in her home for a few hours a day next summer.</p>
        <p>Write a letter to Mrs Barrett. In your letter</p>
        <ul>
          <li>suggest how you could help her in her home</li>
          <li>say why you would like to do this work</li>
          <li>explain when you will and will not be available</li>
        </ul>
      </div>
      <p>Write at least 150 words.</p>
      <p>You do <strong class="source-emphasis">NOT</strong> need to write any addresses.</p>
      <p>Begin your letter as follows:</p>
      <p class="letter-opening">Dear Mrs Barrett,</p>`,
    study: {
      type: "Semi-formal letter",
      understanding: [
        "Write to Mrs Barrett in response to her advertisement for help in her home.",
        "Cover all three bullet points: the help you can provide, why you want the work, and when you will and will not be available.",
        "Use a polite semi-formal tone that is suitable for writing to a named person you do not know well."
      ],
      structure: [
        "Dear Mrs Barrett,",
        "Opening paragraph: explain why you are writing and show interest in the work",
        "Body paragraphs: describe the help you can offer and explain why the work appeals to you",
        "Final paragraph: give clear details about your availability and close with Yours sincerely,"
      ],
      checklist: [
        "I covered all three bullet points fully.",
        "I clearly explained when I will and will not be available.",
        "My tone is polite and appropriately semi-formal.",
        "I did not include any addresses and I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>Plastic bags, plastic bottles and plastic packaging are bad for the environment.</p>
        <p>What damage does plastic do to the environment?</p>
        <p>What can be done by governments and individuals to solve this problem?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Two-part problem-and-solution essay",
      understanding: [
        "Explain the main types of environmental damage caused by plastic waste.",
        "Explain practical actions that governments and individuals can take to address the problem.",
        "Develop both parts of the question with clear reasons and relevant examples."
      ],
      structure: [
        "Introduction",
        "Environmental damage caused by plastic",
        "Government action and individual action",
        "Conclusion"
      ],
      checklist: [
        "I answered both questions directly.",
        "I explained the environmental damage rather than only listing examples of plastic.",
        "I included realistic solutions involving both governments and individuals.",
        "I supported my main ideas and wrote at least 250 words."
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
    const subjectText = `IELTS General Training Writing – Test 1 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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
