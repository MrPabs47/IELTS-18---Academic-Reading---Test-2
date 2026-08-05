(() => {
  const TEST_TITLE = "IELTS 16 Academic Writing Test 4";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const TASK_IMAGE = "./task-1-plastic-bottle-recycling-enhanced.webp";

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The diagram below shows the process for recycling plastic bottles.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame">
          <img id="taskImage" src="${TASK_IMAGE}" alt="A nine-stage process showing how plastic bottles are recycled, from disposal and collection to sorting, crushing, washing, pellet production, raw material and new products." tabindex="0" title="Click to enlarge the recycling diagram within this pane">
        </div>
      </figure>`,
    study: {
      type: "Process diagram",
      understanding: [
        "Describe the nine stages in a clear sequence.",
        "Include an overview that identifies the beginning and final outcome of the process.",
        "Report the main transformations without adding an opinion."
      ],
      structure: [
        "Introduction",
        "Overview",
        "Collection and sorting stages",
        "Processing stages and end products"
      ],
      checklist: [
        "I included a clear overview of the whole process.",
        "I described the stages in a logical order.",
        "I used accurate process and passive language.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In the future all cars, buses and trucks will be driverless. The only people travelling inside these vehicles will be passengers.</p>
        <p>Do you think the advantages of driverless vehicles outweigh the disadvantages?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Advantages outweigh disadvantages essay",
      understanding: [
        "Discuss the main advantages and disadvantages of driverless vehicles.",
        "Make a clear judgement about which side is more significant.",
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
        "My overall position is clear throughout the essay.",
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
