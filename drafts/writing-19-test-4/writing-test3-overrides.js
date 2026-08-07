(() => {
  const TEST_TITLE = "IELTS 19 Academic Writing Test 4";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const DANCE_CHUNKS = [
    "dance-image.b64.0",
    "dance-image.b64.1",
    "dance-image.b64.2",
    "dance-image.b64.3",
    "dance-image.b64.4"
  ];

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The charts below give information on the location and types of dance classes young people in a town in Australia are currently attending.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame dance-visual-frame">
          <img id="taskImage" data-dance-image alt="A pie chart showing the location of dance classes and a bar chart comparing types of dance classes attended by two age groups." tabindex="0" title="Click to enlarge the dance classes charts within this pane">
        </div>
      </figure>`,
    study: {
      type: "Pie chart and bar chart",
      understanding: [
        "Describe both visuals: where dance classes are held and how participation in ballet, tap and modern differs between the two age groups.",
        "Identify the dominant and least common class locations in the pie chart.",
        "Compare the age groups across the three dance types and highlight the clearest contrasts rather than listing every figure mechanically."
      ],
      structure: [
        "Introduction",
        "Overview of the main location pattern and the main age-group contrasts",
        "Details from the location pie chart",
        "Details and comparisons from the dance-type bar chart"
      ],
      checklist: [
        "I included an overview covering both charts.",
        "I selected the main features instead of describing every number separately.",
        "I made clear comparisons between the two age groups.",
        "I reported percentages and student numbers accurately.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>In many countries nowadays, consumers can go to a supermarket and buy food produced all over the world.</p>
        <p>Do you think this is a positive or negative development?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Positive or negative development essay",
      understanding: [
        "Decide whether the international availability of food in supermarkets is mainly a positive or mainly a negative development.",
        "Develop reasons that directly support your judgement, such as consumer choice, access to products, trade, local producers, environmental costs or food miles.",
        "You may acknowledge the other side, but your overall evaluation should stay clear throughout."
      ],
      structure: [
        "Introduction with a clear overall judgement",
        "First main reason with explanation and example",
        "Second main reason with explanation and example or a relevant counterpoint",
        "Conclusion restating why the development is mainly positive or negative"
      ],
      checklist: [
        "I clearly answered whether the development is positive or negative.",
        "My body paragraphs explain reasons rather than simply list advantages and disadvantages.",
        "I used relevant examples or explanations.",
        "My position is consistent throughout the essay.",
        "I wrote at least 250 words."
      ]
    }
  };

  let danceDataUrlPromise = null;

  function loadDanceDataUrl() {
    if (!danceDataUrlPromise) {
      danceDataUrlPromise = Promise.all(
        DANCE_CHUNKS.map((path) => fetch(`${path}?v=20260808-t4`, { cache: "force-cache" }).then((response) => {
          if (!response.ok) throw new Error(`Image chunk failed: ${path} (${response.status})`);
          return response.text();
        }))
      ).then((parts) => `data:image/avif;base64,${parts.map((part) => part.trim()).join("")}`);
    }
    return danceDataUrlPromise;
  }

  function hydrateDanceImage() {
    const image = document.querySelector("#taskImage[data-dance-image]");
    if (!image || image.dataset.hydrating === "true" || image.src.startsWith("data:image/avif")) return;

    image.dataset.hydrating = "true";
    image.setAttribute("aria-busy", "true");

    loadDanceDataUrl().then((src) => {
      if (!document.body.contains(image)) return;
      image.addEventListener("load", () => {
        image.dataset.loaded = "true";
        image.removeAttribute("aria-busy");
      }, { once: true });
      image.addEventListener("error", () => {
        image.dataset.loadError = "true";
        image.removeAttribute("aria-busy");
      }, { once: true });
      image.src = src;
    }).catch((error) => {
      image.dataset.loadError = "true";
      image.removeAttribute("aria-busy");
      console.error("Failed to load the dance classes charts.", error);
    });
  }

  const baseRenderTask = renderTask;
  renderTask = function test4RenderTask() {
    baseRenderTask();
    if (state.task === 1) hydrateDanceImage();
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
    if (event.target?.id === "submissionStudentName" || event.target?.id === "submissionStudentEmail") queueMicrotask(correctReportIdentity);
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
    const subjectText = `IELTS 19 Writing – Test 4 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(textarea.value);
    const to = encodeURIComponent(TEACHER_EMAIL);

    if (action === "copy") {
      try { await navigator.clipboard.writeText(textarea.value); }
      catch (error) {
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
    if (action === "gmail") url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    else if (action === "outlook") url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, true);

  hydrateDanceImage();
})();
