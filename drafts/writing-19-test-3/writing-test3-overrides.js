(() => {
  const TEST_TITLE = "IELTS 19 Academic Writing Test 3";
  const TEACHER_EMAIL = "pablo.jaramillo@ilsc.com.au";
  const ETHANOL_CHUNKS = [
    "ethanol-image.b64.0a",
    "ethanol-image.b64.0b",
    "ethanol-image.b64.0c",
    "ethanol-image.b64.0d",
    "ethanol-image.b64.0e",
    "ethanol-image.b64.1",
    "ethanol-image.b64.2a",
    "ethanol-image.b64.2b",
    "ethanol-image.b64.2c",
    "ethanol-image.b64.2d",
    "ethanol-image.b64.2e",
    "ethanol-image.b64.3a",
    "ethanol-image.b64.3b",
    "ethanol-image.b64.3c",
    "ethanol-image.b64.3d"
  ];

  document.title = TEST_TITLE;
  document.querySelector("#modeScreenInner h1")?.replaceChildren(TEST_TITLE);
  document.querySelector(".test-title")?.replaceChildren(TEST_TITLE);

  tasks[1] = {
    title: "Writing Task 1",
    html: `<p>You should spend about 20 minutes on this task.</p>
      <div class="task-question">
        <p>The diagram below shows how a biofuel called ethanol is produced.</p>
        <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
      </div>
      <p>Write at least 150 words.</p>
      <figure class="task-visual">
        <div class="visual-frame ethanol-visual-frame">
          <img id="taskImage" data-ethanol-image alt="A circular process diagram showing how ethanol biofuel is produced from plants and how carbon dioxide cycles back into plant growth." tabindex="0" title="Click to enlarge the ethanol production diagram within this pane">
        </div>
      </figure>`,
    study: {
      type: "Process diagram",
      understanding: [
        "Describe how ethanol biofuel is produced from plant material and how carbon dioxide cycles through the system.",
        "Follow the production sequence from plant growth and harvesting through pre-processing, cellulose, processing, sugars and microbes to ethanol.",
        "Include the final fuel-use stage and the return of carbon dioxide to plant growth."
      ],
      structure: [
        "Introduction",
        "Overview explaining that the process is cyclical",
        "Main production stages from plant growth to ethanol",
        "Fuel use and the carbon-dioxide cycle back to plant growth"
      ],
      checklist: [
        "I included a clear overview of the full cycle.",
        "I described the production stages in a logical order.",
        "I kept every stage and relationship faithful to the diagram.",
        "I used process language rather than giving an opinion.",
        "I wrote at least 150 words."
      ]
    }
  };

  tasks[2] = {
    title: "Writing Task 2",
    html: `<p>You should spend about 40 minutes on this task.</p>
      <p>Write about the following topic:</p>
      <div class="task-question">
        <p>It is important for everyone, including young people, to save money for their future.</p>
        <p>To what extent do you agree or disagree with this statement?</p>
      </div>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`,
    study: {
      type: "Opinion essay — to what extent do you agree or disagree?",
      understanding: [
        "Decide how strongly you agree that everyone, including young people, should save money for the future.",
        "Develop reasons such as financial security, independence, emergencies or long-term goals.",
        "You may acknowledge limits such as low income or important present needs, but keep your overall position clear."
      ],
      structure: [
        "Introduction with a clear position",
        "First main reason with explanation and example",
        "Second main reason or a relevant limitation/counterpoint",
        "Conclusion restating your position"
      ],
      checklist: [
        "I answered 'to what extent' with a clear position.",
        "I developed each body paragraph instead of listing ideas.",
        "I used relevant explanations or examples.",
        "I kept my position consistent throughout.",
        "I wrote at least 250 words."
      ]
    }
  };

  let ethanolDataUrlPromise = null;

  function loadEthanolDataUrl() {
    if (!ethanolDataUrlPromise) {
      ethanolDataUrlPromise = Promise.all(
        ETHANOL_CHUNKS.map((path) => fetch(`${path}?v=20260807-t3`, { cache: "force-cache" }).then((response) => {
          if (!response.ok) throw new Error(`Image chunk failed: ${path} (${response.status})`);
          return response.text();
        }))
      ).then((parts) => `data:image/avif;base64,${parts.map((part) => part.trim()).join("")}`);
    }
    return ethanolDataUrlPromise;
  }

  function hydrateEthanolImage() {
    const image = document.querySelector("#taskImage[data-ethanol-image]");
    if (!image || image.dataset.hydrating === "true" || image.src.startsWith("data:image/avif")) return;

    image.dataset.hydrating = "true";
    image.setAttribute("aria-busy", "true");

    loadEthanolDataUrl().then((src) => {
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
      console.error("Failed to load the ethanol production diagram.", error);
    });
  }

  const baseRenderTask = renderTask;
  renderTask = function test3RenderTask() {
    baseRenderTask();
    if (state.task === 1) hydrateEthanolImage();
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
    const subjectText = `IELTS 19 Writing – Test 3 answers${name !== "Not provided" ? ` – ${name}` : ""}`;
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

  hydrateEthanolImage();
})();
