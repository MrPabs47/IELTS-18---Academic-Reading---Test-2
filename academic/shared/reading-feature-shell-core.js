(function (global) {
  "use strict";

  var config = null;
  var initialized = false;
  var elements = null;
  var lastError = "";
  var studyTimerId = null;
  var studyElapsedSeconds = 0;
  var studySessionActive = false;
  var studyReviewSubmitted = false;
  var lastOpener = null;
  var resultObserver = null;
  var reviewOverlayWasOpen = false;
  var taskControls = [];
  var revealedGroups = new Set();

  var TEST3_GROUPS = [
    { id: "p1-tfng", label: "True / False / Not Given", questions: [1, 2, 3, 4, 5], purpose: "Compare the whole meaning of each statement with the passage.", steps: ["Underline key limits such as most, all, only, or always.", "Find the relevant idea and compare the whole meaning, not one matching word.", "Choose FALSE for a contradiction and NOT GIVEN only when the passage does not provide enough information."], trap: "A statement can repeat familiar vocabulary but still change the writer’s meaning." },
    { id: "p1-summary", label: "Summary completion", questions: [6, 7, 8, 9, 10, 11, 12, 13], purpose: "Use the wording around the gap to predict the missing word before you scan.", steps: ["Use the grammar before and after the gap to predict the word type.", "Scan for the same idea, allowing for paraphrase.", "Copy ONE WORD exactly and check the completed summary."], trap: "Do not add extra words, even when a longer phrase in the passage seems natural." },
    { id: "p2-matching", label: "Matching information", questions: [14, 15, 16, 17, 18, 19], purpose: "Match each specific detail with the paragraph containing that idea.", steps: ["Underline the distinctive idea in the question.", "Scan for the same meaning rather than an identical word.", "Confirm the whole statement before selecting a letter."], trap: "A paragraph may repeat one word without containing the information the question asks for." },
    { id: "p2-summary", label: "Summary completion", questions: [20, 21, 22], purpose: "Complete the summary using one word from the passage.", steps: ["Predict the information needed around the gap.", "Locate the relevant sentence in the passage.", "Copy ONE WORD only and check spelling."], trap: "Use a word from the passage, not your own paraphrase." },
    { id: "p2-choose-a", label: "Choose TWO letters", questions: [23, 24], purpose: "Identify the two claims the writer clearly supports.", steps: ["Treat every option as a separate claim.", "Return to the relevant paragraph and check the full meaning.", "Choose only the two options with direct support."], trap: "Reject an option that is only partly true or changes a detail." },
    { id: "p2-choose-b", label: "Choose TWO letters", questions: [25, 26], purpose: "Find the writer’s point about the Viking Age before selecting two claims.", steps: ["Locate the relevant paragraph.", "Compare every option with the writer’s exact claim.", "Select only two letters with clear support."], trap: "A plausible statement is not enough; the passage must support it." },
    { id: "p3-tfng", label: "True / False / Not Given", questions: [27, 28, 29, 30, 31, 32], purpose: "Compare each statement with the relevant section of the passage.", steps: ["Find the relationship between the statement and the text.", "Choose TRUE for agreement and FALSE for contradiction.", "Use NOT GIVEN only when the information cannot be found or inferred."], trap: "Words such as may, could, all, and only can change the answer completely." },
    { id: "p3-matching", label: "Matching information", questions: [33, 34, 35, 36, 37], purpose: "Find the paragraph containing each specific idea.", steps: ["Identify the unique focus of the question.", "Scan for a paraphrase of that focus.", "Read the whole paragraph before selecting a letter."], trap: "Do not choose a paragraph simply because it shares a related topic." },
    { id: "p3-sentence", label: "Sentence completion", questions: [38, 39, 40], purpose: "Complete each sentence using no more than two words from the passage.", steps: ["Predict the grammar and meaning needed in the gap.", "Find the matching idea in the passage.", "Copy no more than TWO WORDS and read the sentence again."], trap: "Check the word limit as well as the grammar of the completed sentence." }
  ];

  var TEST3_DETAILS = {
    1: ["The Romans learned shipbuilding from the Greeks and Egyptians; they did not pass their skills on to them.", "Distinguishing a contradiction", "learned to build ships from the people that they conquered, namely the Greeks and the Egyptians"],
    2: ["The passage explains mortise and tenon, but it gives no information about skilled craftsmen being needed.", "Identifying missing information", "they were fixed using a method called mortise and tenon"],
    3: ["The later method built the frame first and then the hull, so the statement reverses the order.", "Checking word order and meaning", "building the frame first and then proceeding with the hull"],
    4: ["The Romans called it Mare Nostrum after their navy became the largest and most powerful in the Mediterranean.", "Matching a paraphrase", "Rome’s navy became the largest and most powerful in the Mediterranean"],
    5: ["The passage says the rowers were mostly Roman citizens enrolled in the military.", "Reading specific detail", "mostly Roman citizens enrolled in the military"],
    6: ["The summary needs an adjective describing how warships were designed. The passage states that ‘Warships were built to be lightweight and very speedy’, so lightweight is the exact one-word answer. Do not replace it with a synonym such as light.", "Using summary grammar to locate an exact descriptive word", "Warships were built to be lightweight"],
    7: ["The phrase ‘a ___ battering ram’ needs a material. The passage explicitly says ‘They had a bronze battering ram’, which gives the exact one-word answer. This is a direct detail, so you do not need to infer or paraphrase it.", "Using the noun phrase around a gap to predict word class", "They had a bronze battering ram"],
    8: ["The summary gives a three-part list: top, middle and ___. In the passage, the trireme had rowers in the ‘top, middle and lower levels’. The final position in that parallel list is lower, so copy that word exactly.", "Matching a summary list to a parallel list in the passage", "rowers in the top, middle and lower levels"],
    9: ["The phrase ‘a ___ hull’ needs a comparative adjective because merchant ships are being contrasted with warships. The passage says that merchant ships ‘had a wider hull’. Wider is the required form; wide would not fit the comparison.", "Using comparison grammar to select the exact word form", "They had a wider hull"],
    10: ["The summary contrasts large square sails with one small sail of a different shape. The passage gives ‘large square sails and a small triangular sail’. Because the gap describes the sail’s shape, triangular is correct; triangle is a noun, not the required adjective.", "Identifying the exact adjective required by summary grammar", "large square sails and a small triangular sail"],
    11: ["The question asks what helped the rowers work in time. The passage says that music was played on an instrument and that the oars kept time with this. Therefore music is the one-word answer, even though instrument appears nearby.", "Tracing a pronoun reference to the key summary idea", "music would be played on an instrument, and oars would then keep time with this"],
    12: ["The summary asks for an example of an agricultural product. The passage gives ‘grain from Egypt’s Nile valley’ as that example. Grain is the exact answer; adding Egypt or Nile valley would exceed the one-word limit.", "Selecting a named example while respecting the word limit", "agricultural products (e.g. grain from Egypt’s Nile valley)"],
    13: ["The summary asks what dragged the large merchant ships to the quay. The passage says that ‘a number of towboats’ would drag them there. Towboats is correct, and the plural form matters because the passage refers to more than one boat.", "Matching a paraphrased action to the exact passage noun", "a number of towboats that would drag them to the quay"],
    14: ["The statement refers to two linked details: arrows being lost and broken bows being left behind. Paragraph D says hunters could ‘easily misplace arrows’ and ‘often discarded broken bows’ rather than carry them home. Both details appear together there, so the answer is D.", "Matching two linked details to the paragraph that contains both", "Hunters would have easily misplaced arrows and they often discarded broken bows rather than take them all the way home"],
    15: ["The statement asks where the writer describes the practical difficulty of archaeological work. Paragraph C mentions hiking with all the equipment and camping on permafrost. These are the specific working conditions referred to in the question, so the answer is C.", "Locating a paragraph that describes practical fieldwork conditions", "Fieldwork is hard work – hiking with all our equipment, often camping on permafrost"],
    16: ["The question focuses on hunting becoming more important when farming was less reliable. Paragraph F says hunting helped ‘supplement failing agricultural harvests in times of low temperatures’. This directly matches the cause-and-effect relationship in the statement, so choose F.", "Matching a cause-and-effect relationship across paraphrased wording", "supplement failing agricultural harvests in times of low temperatures"],
    17: ["The key phrase is the future possibility of finding artefacts as the ice retreats. Paragraph H says archaeologists ‘could be extracting’ artefacts from retreating ice ‘in years to come’. The modal could and the time phrase both signal the prediction, so the answer is H.", "Identifying a future prediction signalled by modal language", "archaeologists could be extracting some of those artefacts from retreating ice in years to come"],
    18: ["The statement asks where particular products became valuable because of market demand. Paragraph G gives the examples of hides and antlers, describing a ‘booming demand’ for them. Those named examples match the question exactly, so the answer is G.", "Finding named examples that support an economic demand claim", "a booming demand for hides to fight off the cold, as well as antlers"],
    19: ["The statement refers to pressure to work quickly. Paragraph B explains that climate change is shrinking ice cover and that glacial archaeologists need to ‘race the clock’ to find, preserve, and study newly revealed artefacts. This phrase directly expresses the time pressure, so the answer is B.", "Recognising time-pressure language and matching it to a paraphrased statement", "With climate change shrinking ice cover around the world, glacial archaeologists need to race the clock to find newly revealed artefacts, preserve them, and study them"],
    20: ["The phrase ‘protection against ___’ needs the cause of decay. Paragraph B says that organic materials do not last unless they are protected from ‘the microorganisms that cause decay’. Microorganisms is the exact plural noun from the passage and it fits the ONE WORD ONLY instruction.", "Using surrounding grammar to locate a cause-of-decay noun", "This is because unless they’re protected from the microorganisms that cause decay, they tend not to last long"],
    21: ["The summary says that animals gathered in the mountains during summer. Paragraph C states that ‘Reindeer once congregated on these ice patches in the later summer months’. Congregated is paraphrased as gathered, so reindeer is the exact one-word answer.", "Matching a paraphrased verb and time reference to the exact noun", "Reindeer once congregated on these ice patches in the later summer months to escape biting insects"],
    22: ["The summary says the animals went to the ice patches to avoid being attacked. The passage explains that they did this ‘to escape biting insects’. Insects is the required plural noun after ‘attacked by’; biting only describes the insects and cannot complete the gap.", "Using grammar to distinguish an adjective from the required noun", "Reindeer once congregated on these ice patches in the later summer months to escape biting insects"],
    23: ["The question asks which statement the writer clearly makes about Barrett’s team’s discoveries. Option B is supported because Paragraph F says hunters “kept regularly venturing into the mountains even when the climate turned cold”. This matches the idea of entering the mountains during periods of extreme cold.", "Matching an option to the writer’s directly stated claim", "hunters kept regularly venturing into the mountains even when the climate turned cold"],
    24: ["Option C is supported because Paragraph E says some periods produced many artefacts, while other periods had “few or no signs of activity”. This matches the idea that the number of artefacts from certain time periods was relatively low.", "Comparing option wording with contrast in the passage", "some periods had produced lots of artefacts, which indicates that people had been pretty active in the mountains during those times. But there were few or no signs of activity during other periods"],
    25: ["The task asks which two Viking Age claims the writer makes. Paragraph G says that growing towns and export markets created a booming demand for hides and antlers, then concludes that business was good for hunters. That directly supports option A.", "Tracing economic demand to a stated benefit for hunters", "growing Norwegian towns, along with export markets, would have created a booming demand for hides to fight off the cold"],
    26: ["The task asks for claims directly supported about the Viking Age. Paragraph G contrasts the usual association with ships with evidence that many goods also travelled on overland routes through the mountains. This shows that ships were not the only transport method, so C is correct.", "Using contrast wording to confirm an additional transport route", "these recent discoveries show that plenty of goods travelled on overland routes, like the mountain passes of Oppland"],
    27: ["The statement needs evidence that other scientists were surprised by the Cambridge discovery. Paragraph A confirms who made the discovery, but it does not mention other scientists’ reactions. Since the required response is absent rather than contradicted, the answer is NOT GIVEN.", "Testing whether the passage states every required part", "An international team of scientists led by the University of Cambridge has discovered"],
    28: ["The statement tests whether a stated 2050 goal is secure. Paragraph D says yields need to double by 2050 but calls climate change a major threat to achieving that target. A major threat makes missing it possible, so the statement is TRUE.", "Linking a stated target to its explicit threat", "agricultural yields will need to double by 2050, but climate change is a major threat to achieving this"],
    29: ["The statement asks whether two named crops are negatively affected by higher temperatures. Paragraph D explicitly says wheat and rice are sensitive to high temperatures, then notes thermal stress reduces yields. “Suffer from a rise” is therefore a direct paraphrase, so TRUE.", "Matching a paraphrase to an explicitly named crop effect", "Key crops such as wheat and rice are sensitive to high temperatures"],
    30: ["The statement requires a future breeding possibility specifically about lower water use. Paragraph D discusses tougher crops resilient to thermal stress and climate change, but never says they would need less water. The required water-related trait is absent, so the answer is NOT GIVEN.", "Checking whether the proposed crop trait is actually stated", "Discovering the molecules that allow plants to sense temperature has the potential to accelerate the breeding of crops resilient to thermal stress and climate change"],
    31: ["The statement compares growth in sunlight and shade. Paragraph E says sunlight slows growth, whereas shade inactivates phytochromes and enables the plant to grow faster to reach sunlight. This reverses the statement’s comparison, so the correct answer is FALSE.", "Comparing opposite growth responses in sunlight and shade", "During the day, sunlight activates the molecules, slowing down growth. If a plant finds itself in shade, phytochromes are quickly inactivated – enabling it to grow faster to find sunlight again"],
    32: ["The statement claims day- and night-time state changes occur at the same speed. Paragraph E describes light-driven change as very fast, but says night-time molecules gradually change instead of rapidly deactivating. Those explicitly contrasting rates contradict the claim, so FALSE.", "Contrasting explicit day and night rates of molecular change", "Instead of a rapid deactivation following sundown, the molecules gradually change from their active to inactive state"],
    33: ["Paragraph H identifies the model system used in the research.", "Matching information", "using a mustard plant called Arabidopsis"],
    34: ["Paragraph D explains the potential benefit of breeding crops resilient to thermal stress.", "Matching information", "the potential to accelerate the breeding of crops resilient to thermal stress"],
    35: ["Paragraph G gives the science behind a traditional seasonal rhyme.", "Matching information", "provides the science behind a well-known rhyme"],
    36: ["Paragraph C says people have long used plant behaviour to predict weather and harvest times.", "Matching information", "humans have long used to predict weather and harvest times"],
    37: ["Paragraph A states that the findings were published in the journal Science.", "Matching information", "The new findings, published in the journal Science"],
    38: ["Daffodils can flower months in advance during a warm winter.", "Sentence completion", "can flower months in advance during a warm winter"],
    39: ["The rhyme explanation links a colder summer with rain.", "Sentence completion", "a colder summer is likely to be a rain-soaked one"],
    40: ["The model system was a mustard plant called Arabidopsis.", "Sentence completion", "using a mustard plant called Arabidopsis"]
  };

  var VARIANTS = { 20: ["microorganisms", "micro-organisms"], 38: ["warm", "warm winter"], 40: ["mustard", "mustard plant", "mustard plants"] };
  var CHOOSE_TWO = { 23: "B", 24: "C", 25: "A", 26: "C" };

  function isObject(value) { return Object.prototype.toString.call(value) === "[object Object]"; }
  function hasFunction(owner, name) { return Boolean(owner && typeof owner[name] === "function"); }
  function el(tag, className, text) { var node = global.document.createElement(tag); if (className) node.className = className; if (typeof text === "string") node.textContent = text; return node; }
  function html(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]; }); }
  function normal(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function scoreText(value) { return Number.isInteger(value) ? String(value) : String(value.toFixed(1)); }
  function timeText(seconds) { return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0"); }

  function validateConfig(value) {
    var error = "";
    if (!isObject(value)) error = "ReadingFeatureShell config must be an object.";
    else if (value.version !== 1) error = "ReadingFeatureShell config.version must be 1.";
    else if (!isObject(value.test) || value.test.totalQuestions !== 40 || !isObject(value.test.partRanges)) error = "ReadingFeatureShell config.test must describe 40 questions and its parts.";
    else if (!isObject(value.state) || !hasFunction(value.state, "getMode") || !hasFunction(value.state, "isTestSubmitted")) error = "ReadingFeatureShell config.state must provide getMode and isTestSubmitted.";
    else if (!isObject(value.answers) || !hasFunction(value.answers, "getAnswerKeyDisplay")) error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    else if (!isObject(value.navigation) || !hasFunction(value.navigation, "getQuestionTarget")) error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    else if (!isObject(value.study) || !isObject(value.study.scoreGuide) || !Array.isArray(value.study.scoreGuide.rows)) error = "ReadingFeatureShell config.study.scoreGuide must be configured.";
    return { ok: !error, error: error };
  }

  function currentMode() { return config ? config.state.getMode() : "test"; }
  function sectionFor(questionNumber) { return questionNumber <= 13 ? 1 : questionNumber <= 26 ? 2 : 3; }
  function isChooseTwo(questionNumber) { return Object.prototype.hasOwnProperty.call(CHOOSE_TWO, questionNumber); }
  function selectedLetters(questionNumber) {
    var groupName = questionNumber <= 24 ? "q23_24" : "q25_26";
    return Array.prototype.slice.call(global.document.querySelectorAll('input[type="checkbox"][name="' + groupName + '"]:checked')).map(function (input) { return String(input.value || "").trim().toUpperCase(); });
  }
  function answerFor(questionNumber) {
    if (isChooseTwo(questionNumber)) return selectedLetters(questionNumber).join(", ");
    var radio = global.document.querySelector('input[type="radio"][name="q' + questionNumber + '"]:checked');
    if (radio) return String(radio.value || "").trim();
    var select = global.document.querySelector('select[name="q' + questionNumber + '"]');
    if (select) return String(select.value || "").trim();
    var text = global.document.querySelector('input[type="text"][name="q' + questionNumber + '"]');
    return text ? String(text.value || "").trim() : "";
  }
  function correctFor(questionNumber) {
    var answer = answerFor(questionNumber);
    if (!answer) return false;
    if (isChooseTwo(questionNumber)) return selectedLetters(questionNumber).indexOf(CHOOSE_TWO[questionNumber]) !== -1;
    var accepted = VARIANTS[questionNumber] || [String(config.answers.getAnswerKeyDisplay(questionNumber) || "")];
    return accepted.some(function (item) { return normal(item) === normal(answer); });
  }
  function outcomeFor(questionNumber) { return correctFor(questionNumber) ? 1 : 0; }
  function rangeScore(group) { return group.questions.reduce(function (total, questionNumber) { return total + outcomeFor(questionNumber); }, 0); }
  function targetFor(questionNumber) { return config.navigation.getQuestionTarget(questionNumber); }
  function cardHost(questionNumber) {
    var summaryFeedback = global.document.querySelector('.question-block.feedback-only[data-q="' + questionNumber + '"]');
    if (summaryFeedback) return summaryFeedback;
    var target = targetFor(questionNumber);
    return target && target.closest ? target.closest(".question-block") || target : target;
  }
  function groupAnchor(group) {
    var target = targetFor(group.questions[0]);
    return target && target.closest ? target.closest(".summary-box, .question-block") || target : target;
  }
  function instructionFor(group) {
    var anchor = groupAnchor(group);
    if (!anchor) return null;
    var node = anchor.previousElementSibling;
    while (node) {
      if (node.classList && node.classList.contains("instruction-block")) return node;
      if (node.classList && (node.classList.contains("question-block") || node.classList.contains("summary-box"))) break;
      node = node.previousElementSibling;
    }
    return anchor;
  }

  function parsedResult() {
    var scoreLine = global.document.getElementById("scoreLine");
    var bandLine = global.document.getElementById("bandLine");
    var raw = scoreLine && String(scoreLine.textContent || "").match(/(\d+(?:\.5)?)\s+out of\s+40/i);
    var band = bandLine && String(bandLine.textContent || "").match(/band:\s*([0-9]+(?:\.[0-9]+)?)/i);
    return raw && band ? { rawScore: Number(raw[1]), band: band[1] } : null;
  }
  function fullReviewAvailable() {
    if (currentMode() === "test") return Boolean(config.state.isTestSubmitted() && parsedResult());
    return Boolean(currentMode() === "study" && studyReviewSubmitted && parsedResult());
  }
  function updateTimer() { if (elements) elements.timerValue.textContent = timeText(studyElapsedSeconds); }
  function stopStudyTimer() { if (studyTimerId) { global.clearInterval(studyTimerId); studyTimerId = null; } }
  function startStudyTimer() { stopStudyTimer(); studyTimerId = global.setInterval(function () { if (!studySessionActive) return; studyElapsedSeconds += 1; updateTimer(); }, 1000); }

  function closeDialog(backdrop, restore) { if (!backdrop) return; backdrop.hidden = true; backdrop.setAttribute("aria-hidden", "true"); if (restore !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus(); }
  function openDialog(backdrop, closer) { lastOpener = global.document.activeElement; backdrop.hidden = false; backdrop.setAttribute("aria-hidden", "false"); closer.focus(); }

  function updateScoreGuide() {
    if (!elements) return;
    var result = fullReviewAvailable() ? parsedResult() : null;
    elements.scoreGuideSummary.hidden = !result;
    elements.scoreGuideSummary.textContent = result ? "Your score: " + result.rawScore + " / 40 · Band " + result.band : "";
    elements.scoreGuideBody.textContent = "";
    config.study.scoreGuide.rows.forEach(function (row) {
      var match = String(row.correctAnswers).match(/^(\d+)(?:[–-](\d+))?$/);
      var current = Boolean(result && match && result.rawScore >= Number(match[1]) && result.rawScore <= Number(match[2] || match[1]));
      var tableRow = el("tr", current ? "reading-shell-score-guide-row reading-shell-current-score-row" : "reading-shell-score-guide-row");
      var range = el("td", "reading-shell-score-guide-cell", row.correctAnswers);
      if (current) range.append(el("span", "reading-shell-current-score-label", "Your current score"));
      tableRow.append(range, el("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreGuideBody.append(tableRow);
    });
  }
  function openScoreGuide() { if (!elements || elements.scoreGuideButton.hidden) return; updateScoreGuide(); openDialog(elements.scoreGuideBackdrop, elements.scoreGuideClose); }
  function closeScoreGuide(restore) { if (elements) closeDialog(elements.scoreGuideBackdrop, restore); }
  function openAnswerKey() { if (!elements || elements.answerKeyButton.hidden) return; openDialog(elements.answerKeyBackdrop, elements.answerKeyClose); }
  function closeAnswerKey(restore) { if (elements) closeDialog(elements.answerKeyBackdrop, restore); }
  function openScoreFeedback() { if (!elements || elements.scoreFeedbackButton.hidden) return; renderScoreFeedback(); openDialog(elements.scoreFeedbackBackdrop, elements.scoreFeedbackClose); }
  function closeScoreFeedback(restore) { if (elements) closeDialog(elements.scoreFeedbackBackdrop, restore); }

  function navigateTo(questionNumber) {
    closeAnswerKey(false);
    if (typeof global.switchSection === "function") global.switchSection(sectionFor(questionNumber));
    global.setTimeout(function () {
      var target = config.navigation.getQuestionTarget(questionNumber);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("reading-shell-question-focus");
      global.setTimeout(function () { target.classList.remove("reading-shell-question-focus"); }, 1400);
    }, 80);
  }

  function backdrop(className, titleId, titleText, closeLabel, closeFn) {
    var shade = el("div", className + "-backdrop");
    shade.hidden = true;
    shade.setAttribute("aria-hidden", "true");
    var dialog = el("div", className + "-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);
    var header = el("div", className + "-header");
    var titleGroup = el("div", className + "-title-group");
    var title = el("h2", className + "-title", titleText);
    title.id = titleId;
    titleGroup.append(title);
    var close = el("button", className + "-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", closeLabel);
    close.setAttribute("title", closeLabel);
    header.append(titleGroup, close);
    dialog.append(header);
    shade.append(dialog);
    close.addEventListener("click", function () { closeFn(true); });
    shade.addEventListener("click", function (event) { if (event.target === shade) closeFn(true); });
    shade.addEventListener("keydown", function (event) { if (event.key === "Escape") { event.preventDefault(); closeFn(true); } });
    return { backdrop: shade, dialog: dialog, titleGroup: titleGroup, close: close };
  }

  function buildScoreGuide() {
    var shell = backdrop("reading-shell-score-guide", "reading-shell-score-guide-title", config.study.scoreGuide.title, "Close score guide", closeScoreGuide);
    shell.titleGroup.append(el("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro));
    var summary = el("p", "reading-shell-score-guide-summary");
    summary.hidden = true;
    var scroll = el("div", "reading-shell-score-guide-scroll");
    var table = el("table", "reading-shell-score-guide-table");
    var head = el("thead", "reading-shell-score-guide-head");
    var row = el("tr", "reading-shell-score-guide-row");
    var rawHead = el("th", "reading-shell-score-guide-heading", "Correct answers");
    var bandHead = el("th", "reading-shell-score-guide-heading", "Estimated band");
    rawHead.scope = "col";
    bandHead.scope = "col";
    row.append(rawHead, bandHead);
    head.append(row);
    var body = el("tbody", "reading-shell-score-guide-body");
    table.append(head, body);
    scroll.append(table);
    shell.dialog.append(summary, scroll);
    return { backdrop: shell.backdrop, close: shell.close, summary: summary, body: body };
  }

  function buildAnswerKey() {
    var shell = backdrop("reading-shell-answer-key", "reading-shell-answer-key-title", "Answer Key", "Close answer key", closeAnswerKey);
    shell.titleGroup.append(el("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–40"));
    var scroll = el("div", "reading-shell-answer-key-scroll");
    var grid = el("div", "reading-shell-answer-key-grid");
    [1, 2, 3].forEach(function (part) {
      var range = config.test.partRanges[part];
      var section = el("section", "reading-shell-answer-key-section");
      section.append(el("h3", "reading-shell-answer-key-section-title", "Part " + part + ": Questions " + range.from + "–" + range.to));
      var list = el("div", "reading-shell-answer-key-list");
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var item = el("button", "reading-shell-answer-key-item");
        item.type = "button";
        item.setAttribute("aria-label", "Go to question " + questionNumber);
        item.append(el("span", "reading-shell-answer-key-number", String(questionNumber)), el("span", "reading-shell-answer-key-answer", String(config.answers.getAnswerKeyDisplay(questionNumber) || "")));
        item.addEventListener("click", navigateTo.bind(null, questionNumber));
        list.append(item);
      }
      section.append(list);
      grid.append(section);
    });
    scroll.append(grid);
    shell.dialog.append(scroll);
    return { backdrop: shell.backdrop, close: shell.close };
  }

  function buildScoreFeedback() {
    var shell = backdrop("reading-shell-score-feedback", "reading-shell-score-feedback-title", "Score feedback", "Close score feedback", closeScoreFeedback);
    shell.titleGroup.append(el("p", "reading-shell-score-feedback-intro", "Review your overall result and performance by part."));
    var body = el("div", "reading-shell-score-feedback-body");
    shell.dialog.append(body);
    return { backdrop: shell.backdrop, close: shell.close, body: body };
  }

  function feedbackCard(parent, title) { var card = el("section", "reading-shell-score-feedback-card"); card.append(el("h3", "reading-shell-score-feedback-heading", title)); parent.append(card); return card; }
  function renderScoreFeedback() {
    var result = parsedResult();
    if (!result || !elements) return;
    var body = elements.scoreFeedbackBody;
    body.textContent = "";
    var overall = feedbackCard(body, "Overall result");
    overall.append(el("p", "reading-shell-score-feedback-text", "You answered " + result.rawScore + " out of 40 questions correctly."), el("p", "reading-shell-score-feedback-text", "Estimated IELTS Academic Reading band: Band " + result.band + "."));
    var performance = feedbackCard(body, "Performance by part");
    [1, 2, 3].forEach(function (part) {
      var range = config.test.partRanges[part];
      var total = 0;
      for (var q = range.from; q <= range.to; q += 1) total += outcomeFor(q);
      performance.append(el("p", "reading-shell-score-feedback-part-score", "Part " + part + ": " + scoreText(total) + " / " + (range.to - range.from + 1)));
      var card = feedbackCard(body, "Part " + part + " · " + scoreText(total) + " / " + (range.to - range.from + 1));
      var strong = total / (range.to - range.from + 1) >= 0.75;
      card.append(el("h4", "reading-shell-score-feedback-subheading", strong ? "What went well" : "Focus next"), el("p", "reading-shell-score-feedback-text", strong ? "You answered most questions in this part accurately. Keep comparing the question wording carefully with the passage." : "Use the detailed Study feedback to compare your answer, the correct answer, and the passage clue for each question."));
    });
    if (currentMode() === "test") {
      var time = feedbackCard(body, "Time management");
      var line = global.document.getElementById("totalTimeLine");
      if (line && String(line.textContent || "").trim()) time.append(el("p", "reading-shell-score-feedback-text", String(line.textContent || "").trim()));
      time.append(el("p", "reading-shell-score-feedback-text", "As a flexible guide, aim to complete Parts 1 and 2 in a little under 20 minutes each. This protects time for the final part and a short final check."));
    }
  }

  function strategyMarkup(group) {
    return '<div class="reading-shell-study-strategy"><h3>' + html(group.label) + ' strategy</h3><p>' + html(group.purpose) + '</p><div class="reading-shell-study-strategy-grid">' + group.steps.map(function (step, index) { return '<div class="reading-shell-study-step"><span class="reading-shell-study-step-label"><span class="reading-shell-study-chip">' + (index + 1) + '</span>Step ' + (index + 1) + '</span><p>' + html(step) + '</p></div>'; }).join("") + '<div class="reading-shell-study-trap"><span class="reading-shell-study-step-label"><span class="reading-shell-study-chip">!</span>Common trap</span><p>' + html(group.trap) + '</p></div></div></div>';
  }

  function removeQuestionCard(questionNumber) { var card = global.document.getElementById("reading-shell-feedback-" + questionNumber); if (card) card.remove(); }
  function buildQuestionCard(questionNumber) {
    var host = cardHost(questionNumber);
    if (!host) return;
    removeQuestionCard(questionNumber);
    var user = answerFor(questionNumber);
    var correct = correctFor(questionNumber);
    var status = !user ? "unanswered" : correct ? "correct" : "incorrect";
    var statusText = !user ? "Not answered · 0 points" : (correct ? "✓ " : "✕ ") + user + (correct ? " · +1 point" : " · +0 points");
    var detail = TEST3_DETAILS[questionNumber] || ["Compare the answer carefully with the passage wording.", "Reading for detail", ""];
    var card = el("section", "reading-shell-study-feedback-card reading-shell-study-feedback-" + status);
    card.id = "reading-shell-feedback-" + questionNumber;
    card.innerHTML = '<h4>Question ' + questionNumber + '</h4><dl><dt>Your answer</dt><dd class="reading-shell-study-status reading-shell-study-status-' + status + '">' + html(statusText) + '</dd><dt>Correct answer</dt><dd>' + html(config.answers.getAnswerKeyDisplay(questionNumber) || "") + '</dd><dt>Why</dt><dd>' + html(detail[0]) + '</dd><dt>Skill</dt><dd>' + html(detail[1]) + '</dd></dl><div class="reading-shell-study-clue-row"><button class="reading-shell-study-clue-button" type="button" title="Passage clue" aria-label="Show passage clue for question ' + questionNumber + '"><svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m15.5 15.5 4.5 4.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"/></svg></button></div>';
    host.append(card);
    card.querySelector(".reading-shell-study-clue-button").addEventListener("click", function () { showEvidence(questionNumber); });
  }

  function clearEvidence(passage) { passage.querySelectorAll(".reading-shell-evidence-highlight").forEach(function (mark) { mark.replaceWith(global.document.createTextNode(mark.getAttribute("data-reading-shell-evidence-text") || "")); }); }
  function showEvidence(questionNumber) {
    var detail = TEST3_DETAILS[questionNumber];
    if (!detail) return;
    var part = sectionFor(questionNumber);
    if (typeof global.switchSection === "function") global.switchSection(part);
    global.setTimeout(function () {
      var passage = global.document.querySelector('.passage-section[data-section="' + part + '"]');
      if (!passage) return;
      clearEvidence(passage);
      var evidence = detail[2];
      var walker = global.document.createTreeWalker(passage, global.NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return global.NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest("mark,button,input,select,textarea")) return global.NodeFilter.FILTER_REJECT;
        return global.NodeFilter.FILTER_ACCEPT;
      } });
      var found = null;
      var node;
      while ((node = walker.nextNode())) { var index = node.nodeValue.indexOf(evidence); if (index !== -1) { found = { node: node, index: index }; break; } }
      if (!found) return;
      var range = global.document.createRange();
      range.setStart(found.node, found.index);
      range.setEnd(found.node, found.index + evidence.length);
      var mark = el("mark", "reading-shell-evidence-highlight");
      mark.setAttribute("data-reading-shell-evidence-text", evidence);
      try { range.surroundContents(mark); } catch (error) { return; }
      var badge = el("button", "reading-shell-clue-badge", String(questionNumber));
      badge.type = "button";
      badge.setAttribute("aria-label", "Return to question " + questionNumber);
      badge.addEventListener("click", function (event) { event.stopPropagation(); navigateTo(questionNumber); });
      mark.append(badge);
      mark.classList.add("reading-shell-evidence-focus");
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 90);
  }

  function showGroup(group) {
    var control = taskControls.find(function (item) { return item.group.id === group.id; });
    if (!control) return;
    var score = rangeScore(group);
    control.result.textContent = scoreText(score) + " / " + group.questions.length + " correct";
    control.result.hidden = false;
    control.revealButton.hidden = false;
    control.revealButton.disabled = false;
    control.revealButton.textContent = "Hide answers & feedback";
    control.revealButton.setAttribute("aria-expanded", "true");
    group.questions.forEach(buildQuestionCard);
    revealedGroups.add(group.id);
  }
  function hideGroup(group) {
    var control = taskControls.find(function (item) { return item.group.id === group.id; });
    group.questions.forEach(removeQuestionCard);
    revealedGroups.delete(group.id);
    if (control) {
      control.result.hidden = true;
      control.revealButton.hidden = currentMode() !== "study";
      control.revealButton.disabled = currentMode() !== "study";
      control.revealButton.textContent = "Show answers & feedback";
      control.revealButton.setAttribute("aria-expanded", "false");
    }
  }
  function toggleGroup(group) {
    if (currentMode() !== "study") return;
    if (revealedGroups.has(group.id)) hideGroup(group); else showGroup(group);
  }
  function revealAll() { TEST3_GROUPS.forEach(function (group) { if (!revealedGroups.has(group.id)) showGroup(group); }); }

  function syncTaskFeedback() {
    var inStudy = currentMode() === "study";
    var afterTest = currentMode() === "test" && Boolean(config.state.isTestSubmitted());
    taskControls.forEach(function (control) {
      control.strategyButton.hidden = !(inStudy || afterTest);
      control.strategyButton.disabled = !(inStudy || afterTest);
      control.revealButton.hidden = !inStudy;
      control.revealButton.disabled = !inStudy;
      if (!(inStudy || afterTest)) {
        control.result.hidden = true;
        control.panel.hidden = true;
      }
    });
  }
  function buildTaskFeedbackControls() {
    global.document.querySelectorAll(".reading-shell-study-controls,.reading-shell-study-result,.reading-shell-study-panel").forEach(function (node) { node.remove(); });
    taskControls = [];
    revealedGroups.clear();
    TEST3_GROUPS.forEach(function (group) {
      var host = instructionFor(group);
      var anchor = groupAnchor(group);
      if (!host || !anchor || !anchor.parentNode) return;
      var controls = el("span", "reading-shell-study-controls");
      var strategyButton = el("button", "reading-shell-study-icon-button", "ⓘ");
      strategyButton.type = "button";
      strategyButton.setAttribute("title", "How to tackle this task");
      strategyButton.setAttribute("aria-label", "How to tackle " + group.label);
      strategyButton.setAttribute("aria-expanded", "false");
      var revealButton = el("button", "reading-shell-study-reveal-button", "Show answers & feedback");
      revealButton.type = "button";
      revealButton.setAttribute("aria-expanded", "false");
      controls.append(strategyButton, revealButton);
      host.append(controls);
      var result = el("div", "reading-shell-study-result");
      result.hidden = true;
      var panel = el("div", "reading-shell-study-panel");
      panel.hidden = true;
      panel.innerHTML = strategyMarkup(group);
      anchor.parentNode.insertBefore(result, anchor);
      anchor.parentNode.insertBefore(panel, anchor);
      var control = { group: group, strategyButton: strategyButton, revealButton: revealButton, result: result, panel: panel };
      strategyButton.addEventListener("click", function () {
        var opening = panel.hidden;
        panel.hidden = !opening;
        strategyButton.setAttribute("aria-expanded", opening ? "true" : "false");
      });
      revealButton.addEventListener("click", function () { toggleGroup(group); });
      taskControls.push(control);
    });
    syncTaskFeedback();
  }

  function installStyles() {
    if (global.document.getElementById("reading-shell-test3-feedback-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-test3-feedback-styles";
    style.textContent = ".reading-shell-root{align-items:center;display:flex;flex-wrap:wrap;gap:6px}.reading-shell-score-guide-button,.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;padding:5px 10px;white-space:nowrap}.reading-shell-score-guide-button:hover,.reading-shell-score-guide-button:focus-visible,.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.reading-shell-score-guide-backdrop,.reading-shell-answer-key-backdrop,.reading-shell-score-feedback-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-score-guide-backdrop[hidden],.reading-shell-answer-key-backdrop[hidden],.reading-shell-score-feedback-backdrop[hidden]{display:none!important}.reading-shell-score-guide-dialog,.reading-shell-answer-key-dialog,.reading-shell-score-feedback-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(680px,96vw)}.reading-shell-answer-key-dialog{width:min(760px,96vw)}.reading-shell-score-guide-header,.reading-shell-answer-key-header,.reading-shell-score-feedback-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-score-guide-title,.reading-shell-answer-key-title,.reading-shell-score-feedback-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-score-guide-intro,.reading-shell-answer-key-intro,.reading-shell-score-feedback-intro{color:var(--text-soft);margin:0}.reading-shell-score-guide-close,.reading-shell-answer-key-close,.reading-shell-score-feedback-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-score-guide-scroll,.reading-shell-answer-key-scroll,.reading-shell-score-feedback-body{min-height:0;overflow:auto}.reading-shell-score-guide-table{border-collapse:collapse;width:100%}.reading-shell-score-guide-heading,.reading-shell-score-guide-cell{border-bottom:1px solid var(--border);padding:9px;text-align:left}.reading-shell-current-score-row .reading-shell-score-guide-cell{background:color-mix(in srgb,#bbf7d0 48%,var(--bg));border-bottom-color:color-mix(in srgb,#15803d 40%,var(--border))}.reading-shell-current-score-label{background:color-mix(in srgb,#dcfce7 74%,var(--bg));border:1px solid color-mix(in srgb,#15803d 45%,var(--border));border-radius:999px;color:color-mix(in srgb,#166534 78%,var(--text));display:inline-flex;font-size:.78rem;font-weight:800;margin-left:8px;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.reading-shell-answer-key-section{border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.reading-shell-answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;margin:0;padding:9px 10px}.reading-shell-answer-key-list{display:grid}.reading-shell-answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.reading-shell-answer-key-item:hover{background:var(--bg-secondary)}.reading-shell-answer-key-number{color:var(--text-soft);font-weight:800}.reading-shell-answer-key-answer{font-weight:700;overflow-wrap:anywhere}.reading-shell-score-feedback-button{appearance:none;background:transparent;border:0;border-radius:6px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;margin-left:12px;padding:2px 4px;white-space:nowrap}.reading-shell-score-feedback-button:hover,.reading-shell-score-feedback-button:focus-visible{background:rgba(227,24,55,.08);color:#e31837;outline:2px solid transparent}.reading-shell-score-feedback-body{display:grid;gap:16px;padding-right:5px}.reading-shell-score-feedback-card{border:1px solid var(--border);border-radius:12px;padding:14px}.reading-shell-score-feedback-heading{margin:0 0 8px}.reading-shell-score-feedback-subheading{margin:10px 0 6px}.reading-shell-score-feedback-text,.reading-shell-score-feedback-part-score{margin:6px 0}.reading-shell-score-feedback-part-score{font-weight:800}.reading-shell-study-controls{align-items:center;display:inline-flex;gap:8px;margin:8px 0 0}.reading-shell-study-icon-button{align-items:center;background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;display:inline-flex;font:inherit;font-weight:800;height:30px;justify-content:center;padding:0;width:30px}.reading-shell-study-reveal-button{background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;font:inherit;font-size:.84rem;font-weight:800;padding:6px 11px}.reading-shell-study-icon-button:hover,.reading-shell-study-icon-button:focus-visible,.reading-shell-study-reveal-button:hover,.reading-shell-study-reveal-button:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.reading-shell-study-result{color:var(--text);font-size:.88rem;font-weight:800;margin:10px 0 0}.reading-shell-study-panel{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;margin:10px 0 12px;padding:13px}.reading-shell-study-panel h3{font-size:1rem;margin:0 0 7px}.reading-shell-study-panel p{margin:6px 0}.reading-shell-study-strategy-grid{display:grid;gap:8px;margin-top:12px}.reading-shell-study-step,.reading-shell-study-trap{background:var(--bg);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:9px;padding:9px 10px}.reading-shell-study-trap{border-left-color:var(--correct)}.reading-shell-study-step-label{align-items:center;display:flex;font-size:.82rem;font-weight:800;gap:6px}.reading-shell-study-chip{align-items:center;background:var(--accent);border-radius:999px;color:#fff;display:inline-flex;font-size:.76rem;height:18px;justify-content:center;width:18px}.reading-shell-study-trap .reading-shell-study-chip{background:var(--correct)}.reading-shell-study-feedback-card{border:1px solid var(--border);border-radius:12px;margin-top:10px;padding:13px}.reading-shell-study-feedback-correct{background:color-mix(in srgb,#dcfce7 45%,var(--bg));border-color:color-mix(in srgb,#15803d 48%,var(--border))}.reading-shell-study-feedback-incorrect{background:color-mix(in srgb,#fee2e2 42%,var(--bg));border-color:color-mix(in srgb,#dc2626 42%,var(--border))}.reading-shell-study-feedback-unanswered{background:var(--bg-secondary)}.reading-shell-study-feedback-card h4{margin:0 0 10px}.reading-shell-study-feedback-card dl{display:grid;gap:3px;margin:0}.reading-shell-study-feedback-card dt{font-size:.8rem;font-weight:800;margin-top:7px}.reading-shell-study-feedback-card dd{margin:0}.reading-shell-study-status-correct{color:var(--correct);font-weight:800}.reading-shell-study-status-incorrect{color:var(--incorrect);font-weight:800}.reading-shell-study-status-unanswered{color:var(--text-soft);font-weight:800}.reading-shell-study-clue-row{display:flex;justify-content:flex-end;margin-top:10px}.reading-shell-study-clue-button{align-items:center;background:color-mix(in srgb,#dcfce7 56%,var(--bg));border:1px solid color-mix(in srgb,#15803d 55%,var(--border));border-radius:999px;color:color-mix(in srgb,#15803d 75%,var(--text));cursor:pointer;display:inline-flex;height:30px;justify-content:center;width:30px}.reading-shell-evidence-highlight{background:color-mix(in srgb,#bbf7d0 58%,var(--bg));border-radius:5px;box-shadow:0 0 0 1px color-mix(in srgb,#15803d 36%,transparent);padding:1px 2px}.reading-shell-evidence-focus{box-shadow:0 0 0 4px color-mix(in srgb,#bbf7d0 65%,transparent);outline:3px solid color-mix(in srgb,#16a34a 70%,var(--accent));outline-offset:2px}.reading-shell-clue-badge{background:#14532d;border:1px solid #14532d;border-radius:999px;color:#fff;cursor:pointer;font-size:.78em;font-weight:800;height:1.35em;margin-left:4px;min-width:1.35em;padding:0}.reading-shell-question-focus{border-radius:12px;outline:3px solid color-mix(in srgb,var(--accent) 70%,#16a34a);outline-offset:3px}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}.reading-shell-score-feedback-button{margin-left:6px}.reading-shell-study-controls{flex-wrap:wrap}}";
    global.document.head.append(style);
  }

  function buildUi() {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) { lastError = "ReadingFeatureShell mount was not found."; global.console.warn("ReadingFeatureShell: " + lastError); return false; }
    installStyles();
    mount.textContent = "";
    mount.removeAttribute("aria-hidden");
    var root = el("div", "reading-shell-root");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    var scoreGuideButton = el("button", "reading-shell-score-guide-button", "📊 Score guide");
    scoreGuideButton.type = "button";
    scoreGuideButton.setAttribute("aria-haspopup", "dialog");
    var answerKeyButton = el("button", "reading-shell-answer-key-button", "🔑");
    answerKeyButton.type = "button";
    answerKeyButton.setAttribute("aria-label", "Answer Key");
    answerKeyButton.setAttribute("title", "Answer Key");
    answerKeyButton.setAttribute("aria-haspopup", "dialog");
    var studyPill = el("span", "reading-shell-study-pill", "Study mode");
    var timer = el("span", "reading-shell-study-timer");
    var timerValue = el("span", "reading-shell-study-timer-value", "00:00");
    timer.append(el("span", "reading-shell-study-timer-label", "Study time: "), timerValue);
    var scoreGuide = buildScoreGuide();
    var answerKey = buildAnswerKey();
    var scoreFeedback = buildScoreFeedback();
    root.append(scoreGuideButton, answerKeyButton, studyPill, timer, scoreGuide.backdrop, answerKey.backdrop, scoreFeedback.backdrop);
    mount.append(root);
    var scoreFeedbackButton = el("button", "reading-shell-score-feedback-button");
    scoreFeedbackButton.type = "button";
    scoreFeedbackButton.hidden = true;
    scoreFeedbackButton.setAttribute("aria-label", "View score feedback");
    scoreFeedbackButton.setAttribute("title", "View score feedback");
    var topLeft = global.document.querySelector(".top-left");
    if (topLeft) topLeft.append(scoreFeedbackButton);
    scoreGuideButton.addEventListener("click", openScoreGuide);
    answerKeyButton.addEventListener("click", openAnswerKey);
    scoreFeedbackButton.addEventListener("click", openScoreFeedback);
    elements = { root: root, scoreGuideButton: scoreGuideButton, answerKeyButton: answerKeyButton, studyPill: studyPill, timer: timer, timerValue: timerValue, scoreGuideBackdrop: scoreGuide.backdrop, scoreGuideClose: scoreGuide.close, scoreGuideSummary: scoreGuide.summary, scoreGuideBody: scoreGuide.body, answerKeyBackdrop: answerKey.backdrop, answerKeyClose: answerKey.close, scoreFeedbackButton: scoreFeedbackButton, scoreFeedbackBackdrop: scoreFeedback.backdrop, scoreFeedbackClose: scoreFeedback.close, scoreFeedbackBody: scoreFeedback.body };
    buildTaskFeedbackControls();
    return true;
  }

  function updateReviewFromOverlay() {
    var overlay = global.document.getElementById("resultsOverlay");
    var isOpen = Boolean(overlay && String(overlay.style.display || "") === "flex" && parsedResult());
    if (currentMode() === "study" && isOpen && !reviewOverlayWasOpen) studyReviewSubmitted = true;
    reviewOverlayWasOpen = isOpen;
  }
  function observeResults() {
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay || resultObserver || !global.MutationObserver) return;
    resultObserver = new global.MutationObserver(function () { global.setTimeout(sync, 0); });
    resultObserver.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }

  function sync() {
    if (!initialized || !elements) return;
    updateReviewFromOverlay();
    var mode = currentMode();
    var studyMode = mode === "study";
    var completedTest = mode === "test" && Boolean(config.state.isTestSubmitted());
    var showRoot = studyMode || completedTest;
    var result = fullReviewAvailable() ? parsedResult() : null;
    elements.root.hidden = !showRoot;
    elements.root.setAttribute("aria-hidden", showRoot ? "false" : "true");
    elements.scoreGuideButton.hidden = !showRoot;
    elements.answerKeyButton.hidden = !showRoot;
    elements.studyPill.hidden = !studyMode;
    elements.timer.hidden = !studyMode;
    elements.scoreFeedbackButton.hidden = !result;
    elements.scoreFeedbackButton.textContent = result ? result.rawScore + " / 40 · Band " + result.band : "";
    if (!studyMode) { studySessionActive = false; stopStudyTimer(); closeScoreGuide(false); }
    if (!showRoot) { closeAnswerKey(false); closeScoreFeedback(false); }
    if (result && (studyReviewSubmitted || completedTest)) revealAll();
    syncTaskFeedback();
    if (!elements.scoreGuideBackdrop.hidden) updateScoreGuide();
  }

  function startStudySession() {
    if (!initialized) return;
    studySessionActive = true;
    studyReviewSubmitted = false;
    reviewOverlayWasOpen = false;
    studyElapsedSeconds = 0;
    TEST3_GROUPS.forEach(hideGroup);
    revealedGroups.clear();
    updateTimer();
    startStudyTimer();
    sync();
  }

  function init(value) {
    var check = validateConfig(value);
    if (!check.ok) { config = null; initialized = false; lastError = check.error; global.console.warn("ReadingFeatureShell: " + check.error); return { ok: false, error: check.error }; }
    config = value;
    initialized = true;
    lastError = "";
    studyElapsedSeconds = 0;
    studySessionActive = false;
    studyReviewSubmitted = false;
    reviewOverlayWasOpen = false;
    if (!buildUi()) { initialized = false; return { ok: false, error: lastError }; }
    observeResults();
    updateTimer();
    sync();
    return { ok: true, initialized: true };
  }
  function getStatus() { return { initialized: initialized, hasConfig: Boolean(config), version: config ? config.version : null, testId: config && config.test ? config.test.id : "", studySessionActive: studySessionActive, studyElapsedSeconds: studyElapsedSeconds, lastError: lastError }; }

  global.ReadingFeatureShell = { init: init, sync: sync, startStudySession: startStudySession, getStatus: getStatus, validateConfig: validateConfig };
})(window);
