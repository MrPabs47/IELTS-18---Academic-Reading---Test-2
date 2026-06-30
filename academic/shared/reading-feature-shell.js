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
  var taskControls = [];
  var revealedGroups = new Set();

  var TEST3 = {
    groups: [
      { id: "p1-tfng", label: "True / False / Not Given", questions: [1, 2, 3, 4, 5], strategy: { purpose: "Use this task to compare the meaning of each statement with the information in the passage.", steps: ["Underline the key words and any limits in the statement, such as most, all, only, or always.", "Find the relevant idea in the passage and compare the whole meaning, not just one matching word.", "Choose FALSE for a contradiction and NOT GIVEN only when the passage does not provide enough information."], commonTrap: "A statement can use familiar vocabulary but still change the writer’s meaning." } },
      { id: "p1-summary", label: "Summary completion", questions: [6, 7, 8, 9, 10, 11, 12, 13], strategy: { purpose: "Use the wording around each gap to predict the missing word before you scan the passage.", steps: ["Read the words before and after the gap to decide the grammar and meaning needed.", "Scan for the same idea in the passage, using synonyms rather than expecting identical wording.", "Copy ONE WORD exactly and check that it fits grammatically in the completed summary."], commonTrap: "Do not add extra words, even when a longer phrase in the passage seems more natural." } },
      { id: "p2-matching", label: "Matching information", questions: [14, 15, 16, 17, 18, 19], strategy: { purpose: "Match each specific detail with the paragraph that contains that idea.", steps: ["Underline the distinctive idea in the question, not every word.", "Scan the paragraph headings and opening sentences, then read closely where the same meaning appears.", "Confirm the full statement before choosing a letter."], commonTrap: "A paragraph may contain one repeated word but not the information the question asks for." } },
      { id: "p2-summary", label: "Summary completion", questions: [20, 21, 22], strategy: { purpose: "Complete the summary using one word taken directly from the passage.", steps: ["Use the context around the gap to predict the missing information.", "Locate the relevant sentence in the passage.", "Copy ONE WORD only and check spelling carefully."], commonTrap: "The correct word must come from the passage, not from your own paraphrase." } },
      { id: "p2-choose-one", label: "Choose TWO letters", questions: [23, 24], strategy: { purpose: "Identify the two statements that the writer clearly supports.", steps: ["Treat every option as a separate claim.", "Return to the relevant paragraph and test the full meaning of the option.", "Choose only the two options with direct support."], commonTrap: "Reject an option that is only partly true or changes a detail from the passage." } },
      { id: "p2-choose-two", label: "Choose TWO letters", questions: [25, 26], strategy: { purpose: "Find the writer’s point about the Viking Age before deciding which two claims are supported.", steps: ["Locate the paragraph about the Viking Age.", "Compare every option with the writer’s exact claims.", "Select only two letters, and make sure both are supported."], commonTrap: "A plausible statement is not enough; the passage must support it." } },
      { id: "p3-tfng", label: "True / False / Not Given", questions: [27, 28, 29, 30, 31, 32], strategy: { purpose: "Compare each statement with the relevant section of the passage.", steps: ["Look for the exact relationship between the statement and the text.", "Choose TRUE when they agree and FALSE when the passage contradicts it.", "Use NOT GIVEN only when the missing information cannot be found or inferred from the passage."], commonTrap: "Words such as may, could, all, and only can completely change the answer." } },
      { id: "p3-matching", label: "Matching information", questions: [33, 34, 35, 36, 37], strategy: { purpose: "Find the paragraph that contains each specific idea.", steps: ["Identify the unique focus of the question.", "Scan for a paraphrase of that focus rather than an exact word match.", "Check the whole paragraph before you choose a letter."], commonTrap: "Do not select a paragraph simply because it contains a related topic." } },
      { id: "p3-sentence", label: "Sentence completion", questions: [38, 39, 40], strategy: { purpose: "Complete each sentence with no more than two words from the passage.", steps: ["Predict what kind of word or phrase the gap needs.", "Find the matching idea in the passage.", "Copy no more than TWO WORDS and read the completed sentence again."], commonTrap: "Check both the word limit and whether your answer fits the grammar of the sentence." } }
    ],
    answerVariants: {
      20: ["microorganisms", "micro-organisms"],
      38: ["warm", "warm winter"],
      40: ["mustard", "mustard plant", "mustard plants"]
    },
    chooseTwoAnswers: { 23: "B", 24: "C", 25: "A", 26: "C" },
    questions: {
      1: { passage: 1, skill: "Distinguishing a contradiction", why: "The passage says that the Romans learned from the Greeks and Egyptians, not that they passed their skills on to them.", evidence: "learned to build ships from the people that they conquered, namely the Greeks and the Egyptians" },
      2: { passage: 1, skill: "Identifying missing information", why: "The passage explains the mortise and tenon method, but it says nothing about skilled craftsmen being needed.", evidence: "they were fixed using a method called mortise and tenon" },
      3: { passage: 1, skill: "Checking word order and meaning", why: "The later method was frame first and then hull, so the statement reverses the order.", evidence: "building the frame first and then proceeding with the hull" },
      4: { passage: 1, skill: "Matching a paraphrase", why: "The Romans called it Mare Nostrum after their navy became the largest and most powerful in the Mediterranean.", evidence: "Rome’s navy became the largest and most powerful in the Mediterranean" },
      5: { passage: 1, skill: "Reading specific detail", why: "The passage says the rowers were mostly Roman citizens enrolled in the military.", evidence: "mostly Roman citizens enrolled in the military" },
      6: { passage: 1, skill: "Locating an exact word", why: "The passage directly describes warships as lightweight.", evidence: "Warships were built to be lightweight" },
      7: { passage: 1, skill: "Locating an exact word", why: "The battering ram is described as bronze.", evidence: "They had a bronze battering ram" },
      8: { passage: 1, skill: "Using a summary clue", why: "The three groups of rowers were in top, middle, and lower levels.", evidence: "rowers in the top, middle and lower levels" },
      9: { passage: 1, skill: "Using surrounding grammar", why: "Merchant ships had a wider hull.", evidence: "They had a wider hull" },
      10: { passage: 1, skill: "Scanning for a contrast", why: "Merchant ships had square sails and a small triangular sail.", evidence: "large square sails and a small triangular sail" },
      11: { passage: 1, skill: "Finding a stated detail", why: "Music helped the rowers keep time together.", evidence: "music would be played on an instrument, and oars would then keep time with this" },
      12: { passage: 1, skill: "Selecting a category example", why: "Grain is the agricultural product named in the passage.", evidence: "agricultural products (e.g. grain from Egypt’s Nile valley)" },
      13: { passage: 1, skill: "Matching a paraphrase", why: "Towboats dragged large merchant ships to the quay.", evidence: "a number of towboats that would drag them to the quay" },
      14: { passage: 2, skill: "Matching information", why: "Paragraph D explains that hunters could misplace arrows and discard broken bows instead of carrying them home.", evidence: "Hunters would have easily misplaced arrows and they often discarded broken bows rather than take them all the way home" },
      15: { passage: 2, skill: "Matching information", why: "Paragraph C describes the physical demands of hiking with equipment and camping on permafrost.", evidence: "Fieldwork is hard work – hiking with all our equipment, often camping on permafrost" },
      16: { passage: 2, skill: "Matching cause and effect", why: "Paragraph F explains that cold conditions could cause crop failures, so hunting became more important.", evidence: "supplement failing agricultural harvests in times of low temperatures" },
      17: { passage: 2, skill: "Finding a future possibility", why: "Paragraph H says archaeologists could extract artefacts from retreating ice in future years.", evidence: "archaeologists could be extracting some of those artefacts from retreating ice in years to come" },
      18: { passage: 2, skill: "Identifying examples", why: "Paragraph G gives hides and antlers as goods linked to trade and demand.", evidence: "a booming demand for hides to fight off the cold, as well as antlers" },
      19: { passage: 2, skill: "Matching a paraphrase", why: "Paragraph B says glacial archaeologists must race the clock as ice melts.", evidence: "glacial archaeologists need to race the clock" },
      20: { passage: 2, skill: "Using an exact noun", why: "Organic materials decay unless they are protected from microorganisms.", evidence: "protected from the microorganisms that cause decay" },
      21: { passage: 2, skill: "Locating a key noun", why: "Reindeer gathered on the ice patches in late summer.", evidence: "Reindeer once congregated on these ice patches in the later summer months" },
      22: { passage: 2, skill: "Using an exact noun", why: "The reindeer went there to escape biting insects.", evidence: "to escape biting insects" },
      23: { passage: 2, skill: "Checking writer claims", why: "The writer says hunters continued going into the mountains even in extreme cold.", evidence: "hunters kept regularly venturing into the mountains even when the climate turned cold" },
      24: { passage: 2, skill: "Checking writer claims", why: "The team found high levels of activity in some periods but few or none in others.", evidence: "some periods had produced lots of artefacts ... But there were few or no signs of activity during other periods" },
      25: { passage: 2, skill: "Finding a supported inference", why: "Expanding markets created a booming demand for hunting products, benefiting hunters.", evidence: "growing Norwegian towns, along with export markets, would have created a booming demand" },
      26: { passage: 2, skill: "Rejecting an assumption", why: "The discoveries show that goods travelled overland as well as by ship.", evidence: "plenty of goods travelled on overland routes" },
      27: { passage: 3, skill: "Identifying missing information", why: "The passage reports the discovery but does not say whether other scientists were surprised.", evidence: "An international team of scientists led by the University of Cambridge has discovered" },
      28: { passage: 3, skill: "Matching a warning", why: "Climate change is described as a major threat to the target of doubling agricultural yields by 2050.", evidence: "climate change is a major threat to achieving this" },
      29: { passage: 3, skill: "Matching a stated effect", why: "Wheat and rice are explicitly described as sensitive to high temperatures.", evidence: "Key crops such as wheat and rice are sensitive to high temperatures" },
      30: { passage: 3, skill: "Identifying missing information", why: "The passage discusses heat resilience, not developing crops that use less water.", evidence: "breed tougher crops" },
      31: { passage: 3, skill: "Checking a contrast", why: "The passage says plants can grow faster in shade in order to find sunlight again.", evidence: "If a plant finds itself in shade ... enabling it to grow faster" },
      32: { passage: 3, skill: "Comparing processes", why: "Light-driven changes are very fast, but night-time dark reversion is gradual.", evidence: "Light-driven changes to phytochrome activity occur very fast, in less than a second" },
      33: { passage: 3, skill: "Matching information", why: "Paragraph H identifies the model system used for the research.", evidence: "The work was done in a model system, using a mustard plant called Arabidopsis" },
      34: { passage: 3, skill: "Matching information", why: "Paragraph D explains the potential benefit of breeding crops resilient to thermal stress.", evidence: "the potential to accelerate the breeding of crops resilient to thermal stress" },
      35: { passage: 3, skill: "Matching information", why: "Paragraph G explains the scientific basis for a traditional seasonal rhyme.", evidence: "provides the science behind a well-known rhyme" },
      36: { passage: 3, skill: "Matching information", why: "Paragraph C says people have long used plant behaviour to predict weather and harvest times.", evidence: "humans have long used to predict weather and harvest times" },
      37: { passage: 3, skill: "Matching information", why: "Paragraph A states that the new findings were published in the journal Science.", evidence: "The new findings, published in the journal Science" },
      38: { passage: 3, skill: "Sentence completion", why: "Daffodils can flower months in advance during a warm winter.", evidence: "can flower months in advance during a warm winter" },
      39: { passage: 3, skill: "Sentence completion", why: "The rhyme explanation says that ash before oak is linked to a colder, rain-soaked summer.", evidence: "a colder summer is likely to be a rain-soaked one" },
      40: { passage: 3, skill: "Sentence completion", why: "The model system was a mustard plant called Arabidopsis.", evidence: "using a mustard plant called Arabidopsis" }
    }
  };

  function isPlainObject(value) { return Object.prototype.toString.call(value) === "[object Object]"; }
  function hasFunction(owner, key) { return Boolean(owner && typeof owner[key] === "function"); }
  function nonEmptyString(value) { return typeof value === "string" && Boolean(value.trim()); }
  function createElement(tag, className, text) { var node = global.document.createElement(tag); if (className) node.className = className; if (typeof text === "string") node.textContent = text; return node; }
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]; }); }
  function normalise(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function formatTime(totalSeconds) { return String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0"); }
  function formatScore(score) { return Number.isInteger(score) ? String(score) : String(score.toFixed(1)); }

  function validateConfig(value) {
    var error = "";
    if (!isPlainObject(value)) error = "ReadingFeatureShell config must be an object.";
    else if (value.version !== 1) error = "ReadingFeatureShell config.version must be 1.";
    else if (!isPlainObject(value.test) || value.test.totalQuestions !== 40) error = "ReadingFeatureShell config.test must describe a 40-question test.";
    else if (!isPlainObject(value.state) || !hasFunction(value.state, "getMode") || !hasFunction(value.state, "isTestSubmitted")) error = "ReadingFeatureShell config.state must provide getMode and isTestSubmitted.";
    else if (!isPlainObject(value.answers) || !hasFunction(value.answers, "getAnswerKeyDisplay")) error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    else if (!isPlainObject(value.navigation) || !hasFunction(value.navigation, "getQuestionTarget")) error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    else if (!isPlainObject(value.study) || !isPlainObject(value.study.scoreGuide) || !Array.isArray(value.study.scoreGuide.rows)) error = "ReadingFeatureShell config.study.scoreGuide must be configured.";
    return { ok: !error, error: error };
  }

  function getMode() { return config ? config.state.getMode() : "test"; }
  function isTestSubmitted() { return Boolean(config && config.state.isTestSubmitted()); }
  function sectionForQuestion(questionNumber) { return questionNumber <= 13 ? 1 : questionNumber <= 26 ? 2 : 3; }
  function isChooseTwoQuestion(questionNumber) { return Object.prototype.hasOwnProperty.call(TEST3.chooseTwoAnswers, questionNumber); }
  function getSelectedLetters(questionNumber) {
    var name = questionNumber <= 24 ? "q23_24" : "q25_26";
    return Array.prototype.slice.call(global.document.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) { return String(input.value || "").trim().toUpperCase(); });
  }
  function getUserAnswer(questionNumber) {
    if (isChooseTwoQuestion(questionNumber)) return getSelectedLetters(questionNumber).join(", ");
    var checked = global.document.querySelector('input[name="q' + questionNumber + '"]:checked');
    if (checked) return String(checked.value || "").trim();
    var select = global.document.querySelector('select[name="q' + questionNumber + '"]');
    if (select) return String(select.value || "").trim();
    var text = global.document.querySelector('input[name="q' + questionNumber + '"]');
    return text ? String(text.value || "").trim() : "";
  }
  function isQuestionCorrect(questionNumber) {
    if (isChooseTwoQuestion(questionNumber)) return getSelectedLetters(questionNumber).indexOf(TEST3.chooseTwoAnswers[questionNumber]) >= 0;
    var answer = normalise(getUserAnswer(questionNumber));
    if (!answer) return false;
    var variants = TEST3.answerVariants[questionNumber];
    if (variants) return variants.some(function (variant) { return normalise(variant) === answer; });
    return normalise(config.answers.getAnswerKeyDisplay(questionNumber)) === answer;
  }
  function questionOutcome(questionNumber) { return isQuestionCorrect(questionNumber) ? 1 : 0; }
  function groupScore(group) { return group.questions.reduce(function (total, questionNumber) { return total + questionOutcome(questionNumber); }, 0); }
  function findQuestionBlock(questionNumber) {
    return global.document.querySelector('.question-block[data-q="' + questionNumber + '"]') || global.document.querySelector('.question-block[data-pair-targets~="' + questionNumber + '"]');
  }
  function findInstructionHost(group) {
    var target = config.navigation.getQuestionTarget(group.questions[0]);
    var structural = target && target.closest ? target.closest(".summary-box, .question-block") : findQuestionBlock(group.questions[0]);
    if (!structural) return null;
    var node = structural.previousElementSibling;
    while (node) {
      if (node.classList && node.classList.contains("instruction-block")) return node;
      if (node.classList && (node.classList.contains("question-block") || node.classList.contains("summary-box"))) break;
      node = node.previousElementSibling;
    }
    return structural;
  }
  function findGroupAnchor(group) {
    var target = config.navigation.getQuestionTarget(group.questions[0]);
    return target && target.closest ? target.closest(".summary-box, .question-block") : findQuestionBlock(group.questions[0]);
  }

  function parseCurrentResult() {
    var scoreLine = global.document.getElementById("scoreLine");
    var bandLine = global.document.getElementById("bandLine");
    var scoreMatch = scoreLine && String(scoreLine.textContent || "").match(/(\d+(?:\.5)?)\s+out of\s+40/i);
    var bandMatch = bandLine && String(bandLine.textContent || "").match(/band:\s*([0-9]+(?:\.[0-9]+)?)/i);
    return scoreMatch && bandMatch ? { rawScore: Number(scoreMatch[1]), band: bandMatch[1] } : null;
  }
  function fullResultAvailable() {
    if (getMode() === "test") return isTestSubmitted() && Boolean(parseCurrentResult());
    return getMode() === "study" && studyReviewSubmitted && Boolean(parseCurrentResult());
  }

  function updateTimer() { if (elements) elements.timerValue.textContent = formatTime(studyElapsedSeconds); }
  function stopStudyTimer() { if (studyTimerId) { global.clearInterval(studyTimerId); studyTimerId = null; } }
  function startStudyTimer() { stopStudyTimer(); studyTimerId = global.setInterval(function () { if (!studySessionActive) return; studyElapsedSeconds += 1; updateTimer(); }, 1000); }

  function parseBandRange(value) {
    var match = String(value || "").match(/^(\d+)(?:[–-](\d+))?$/);
    return match ? { min: Number(match[1]), max: match[2] ? Number(match[2]) : Number(match[1]) } : null;
  }
  function refreshScoreGuide() {
    if (!elements) return;
    var result = fullResultAvailable() ? parseCurrentResult() : null;
    elements.scoreSummary.hidden = !result;
    elements.scoreSummary.textContent = result ? "Your score: " + result.rawScore + " / 40 · Band " + result.band : "";
    elements.scoreBody.textContent = "";
    config.study.scoreGuide.rows.forEach(function (row) {
      var range = parseBandRange(row.correctAnswers);
      var isCurrent = Boolean(result && range && result.rawScore >= range.min && result.rawScore <= range.max);
      var tr = createElement("tr", isCurrent ? "reading-shell-score-guide-row current-score-row" : "reading-shell-score-guide-row");
      var rangeCell = createElement("td", "reading-shell-score-guide-cell", row.correctAnswers);
      if (isCurrent) rangeCell.append(createElement("span", "current-score-label", "Your current score"));
      tr.append(rangeCell, createElement("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreBody.append(tr);
    });
  }

  function openDialog(backdrop, closeButton) { lastOpener = global.document.activeElement; backdrop.hidden = false; backdrop.setAttribute("aria-hidden", "false"); closeButton.focus(); }
  function closeDialog(backdrop, restoreFocus) { backdrop.hidden = true; backdrop.setAttribute("aria-hidden", "true"); if (restoreFocus !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus(); }
  function openScoreGuide() { if (!elements || elements.scoreGuideButton.hidden) return; refreshScoreGuide(); openDialog(elements.scoreGuideBackdrop, elements.scoreGuideClose); }
  function closeScoreGuide(restoreFocus) { if (elements) closeDialog(elements.scoreGuideBackdrop, restoreFocus); }
  function openAnswerKey() { if (!elements || elements.answerKeyButton.hidden) return; openDialog(elements.answerKeyBackdrop, elements.answerKeyClose); }
  function closeAnswerKey(restoreFocus) { if (elements) closeDialog(elements.answerKeyBackdrop, restoreFocus); }
  function openScoreFeedback() { if (!elements || elements.scoreFeedbackButton.hidden) return; renderScoreFeedback(); openDialog(elements.scoreFeedbackBackdrop, elements.scoreFeedbackClose); }
  function closeScoreFeedback(restoreFocus) { if (elements) closeDialog(elements.scoreFeedbackBackdrop, restoreFocus); }

  function focusQuestion(questionNumber) {
    closeAnswerKey(false);
    var section = sectionForQuestion(questionNumber);
    if (typeof global.switchSection === "function") global.switchSection(section);
    global.setTimeout(function () {
      var target = config.navigation.getQuestionTarget(questionNumber);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("focused-question-flash");
      global.setTimeout(function () { target.classList.remove("focused-question-flash"); }, 1400);
    }, 80);
  }

  function createBackdrop(className, titleId, titleText, closeLabel, onClose) {
    var backdrop = createElement("div", className + "-backdrop");
    backdrop.hidden = true;
    backdrop.setAttribute("aria-hidden", "true");
    var dialog = createElement("div", className + "-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);
    var header = createElement("div", className + "-header");
    var titleGroup = createElement("div", className + "-title-group");
    var title = createElement("h2", className + "-title", titleText);
    title.id = titleId;
    titleGroup.append(title);
    var close = createElement("button", className + "-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", closeLabel);
    close.setAttribute("title", closeLabel);
    header.append(titleGroup, close);
    dialog.append(header);
    backdrop.append(dialog);
    close.addEventListener("click", function () { onClose(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) onClose(true); });
    backdrop.addEventListener("keydown", function (event) { if (event.key === "Escape") { event.preventDefault(); onClose(true); } });
    return { backdrop: backdrop, dialog: dialog, titleGroup: titleGroup, close: close };
  }

  function buildScoreGuideDialog() {
    var shell = createBackdrop("reading-shell-score-guide", "reading-shell-score-guide-title", config.study.scoreGuide.title, "Close score guide", closeScoreGuide);
    shell.titleGroup.append(createElement("p", "reading-shell-score-guide-intro", config.study.scoreGuide.intro));
    var summary = createElement("p", "reading-shell-score-guide-summary");
    summary.hidden = true;
    var tableWrap = createElement("div", "reading-shell-score-guide-scroll");
    var table = createElement("table", "reading-shell-score-guide-table");
    var head = createElement("thead");
    var row = createElement("tr");
    row.append(createElement("th", "reading-shell-score-guide-heading", "Correct answers"), createElement("th", "reading-shell-score-guide-heading", "Estimated band"));
    head.append(row);
    var body = createElement("tbody", "reading-shell-score-guide-body");
    table.append(head, body);
    tableWrap.append(table);
    shell.dialog.append(summary, tableWrap);
    return { backdrop: shell.backdrop, close: shell.close, summary: summary, body: body };
  }

  function buildAnswerKeyDialog() {
    var shell = createBackdrop("reading-shell-answer-key", "reading-shell-answer-key-title", "Answer Key", "Close answer key", closeAnswerKey);
    shell.titleGroup.append(createElement("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–40"));
    var scroll = createElement("div", "reading-shell-answer-key-scroll");
    var grid = createElement("div", "reading-shell-answer-key-grid");
    [1, 2, 3].forEach(function (part) {
      var range = config.test.partRanges[part];
      var section = createElement("section", "answer-key-section");
      section.append(createElement("h3", "answer-key-section-title", "Part " + part + ": Questions " + range.from + "–" + range.to));
      var list = createElement("div", "answer-key-list");
      for (var questionNumber = range.from; questionNumber <= range.to; questionNumber += 1) {
        var item = createElement("button", "answer-key-item");
        item.type = "button";
        item.setAttribute("aria-label", "Go to question " + questionNumber);
        item.append(createElement("span", "answer-key-number", String(questionNumber)), createElement("span", "answer-key-answer", String(config.answers.getAnswerKeyDisplay(questionNumber) || "")));
        item.addEventListener("click", focusQuestion.bind(null, questionNumber));
        list.append(item);
      }
      section.append(list);
      grid.append(section);
    });
    scroll.append(grid);
    shell.dialog.append(scroll);
    return { backdrop: shell.backdrop, close: shell.close };
  }

  function buildScoreFeedbackDialog() {
    var shell = createBackdrop("reading-shell-score-feedback", "reading-shell-score-feedback-title", "Score feedback", "Close score feedback", closeScoreFeedback);
    shell.titleGroup.append(createElement("p", "reading-shell-score-feedback-intro", "Review your overall result and performance by part."));
    var body = createElement("div", "score-feedback-body");
    shell.dialog.append(body);
    return { backdrop: shell.backdrop, close: shell.close, body: body };
  }

  function appendScoreFeedbackCard(parent, title) { var card = createElement("section", "score-feedback-card"); card.append(createElement("h3", "score-feedback-heading", title)); parent.append(card); return card; }
  function renderScoreFeedback() {
    var result = parseCurrentResult();
    if (!result || !elements) return;
    var body = elements.scoreFeedbackBody;
    body.textContent = "";
    var overall = appendScoreFeedbackCard(body, "Overall result");
    overall.append(createElement("p", "score-feedback-text", "You answered " + result.rawScore + " out of 40 questions correctly."), createElement("p", "score-feedback-text", "Estimated IELTS Academic Reading band: Band " + result.band + "."));
    var performance = appendScoreFeedbackCard(body, "Performance by part");
    [1, 2, 3].forEach(function (part) {
      var range = config.test.partRanges[part];
      var score = 0;
      for (var q = range.from; q <= range.to; q += 1) score += questionOutcome(q);
      performance.append(createElement("p", "score-feedback-part-score", "Part " + part + ": " + formatScore(score) + " / " + (range.to - range.from + 1)));
      var card = appendScoreFeedbackCard(body, "Part " + part + " · " + formatScore(score) + " / " + (range.to - range.from + 1));
      var ratio = score / (range.to - range.from + 1);
      card.append(createElement("h4", "score-feedback-subheading", ratio >= 0.75 ? "What went well" : "Focus next"));
      card.append(createElement("p", "score-feedback-text", ratio >= 0.75 ? "You answered most questions in this part accurately. Keep comparing the question wording carefully with the passage." : "Use the detailed Study feedback to compare your answer, the correct answer, and the passage clue for each question."));
    });
    if (getMode() === "test") {
      var time = appendScoreFeedbackCard(body, "Time management");
      var totalTime = global.document.getElementById("totalTimeLine");
      if (totalTime && String(totalTime.textContent || "").trim()) time.append(createElement("p", "score-feedback-text", String(totalTime.textContent || "").trim()));
      time.append(createElement("p", "score-feedback-text", "As a flexible guide, aim to complete Parts 1 and 2 in a little under 20 minutes each. This protects time for the final part and a short final check."));
    }
  }

  function renderStrategyPanel(group, panel) {
    var strategy = group.strategy;
    panel.innerHTML = '<div class="study-strategy-content"><h3>' + escapeHtml(group.label) + ' strategy</h3><p>' + escapeHtml(strategy.purpose) + '</p><div class="study-strategy-grid">' + strategy.steps.map(function (step, index) { return '<div class="study-strategy-step"><span class="study-strategy-label"><span class="study-strategy-chip">' + (index + 1) + '</span>Step ' + (index + 1) + '</span><p>' + escapeHtml(step) + '</p></div>'; }).join("") + '<div class="study-common-trap"><span class="study-strategy-label"><span class="study-strategy-chip">!</span>Common trap</span><p>' + escapeHtml(strategy.commonTrap) + '</p></div></div></div>';
  }

  function clearGroupFeedback(group) {
    group.questions.forEach(function (questionNumber) {
      var card = global.document.getElementById("study-feedback-" + questionNumber);
      if (card) card.remove();
    });
    var control = taskControls.find(function (item) { return item.group.id === group.id; });
    if (control) {
      control.result.hidden = true;
      control.result.textContent = "";
      control.revealButton.textContent = "Show answers & feedback";
      control.revealButton.setAttribute("aria-expanded", "false");
    }
    revealedGroups.delete(group.id);
  }

  function focusEvidence(questionNumber) {
    var info = TEST3.questions[questionNumber] || {};
    var section = info.passage || sectionForQuestion(questionNumber);
    if (typeof global.switchSection === "function") global.switchSection(section);
    global.setTimeout(function () {
      var passage = global.document.querySelector('.passage-section[data-section="' + section + '"]');
      if (!passage || !info.evidence) return;
      passage.querySelectorAll('.study-evidence-highlight').forEach(function (mark) { mark.classList.remove("focused-clue"); });
      var walker = global.document.createTreeWalker(passage, global.NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return global.NodeFilter.FILTER_REJECT;
          if (node.parentElement && node.parentElement.closest("mark, button, input, select, textarea")) return global.NodeFilter.FILTER_REJECT;
          return global.NodeFilter.FILTER_ACCEPT;
        }
      });
      var node;
      var found = null;
      while ((node = walker.nextNode())) {
        var index = node.nodeValue.indexOf(info.evidence);
        if (index >= 0) { found = { node: node, index: index }; break; }
      }
      if (!found) return;
      var range = global.document.createRange();
      range.setStart(found.node, found.index);
      range.setEnd(found.node, found.index + info.evidence.length);
      var mark = createElement("mark", "study-evidence-highlight");
      mark.dataset.question = String(questionNumber);
      try { range.surroundContents(mark); } catch (error) { return; }
      var badge = createElement("button", "study-clue-badge", String(questionNumber));
      badge.type = "button";
      badge.setAttribute("aria-label", "Return to question " + questionNumber);
      badge.addEventListener("click", function (event) { event.stopPropagation(); focusQuestion(questionNumber); });
      mark.append(badge);
      mark.classList.add("focused-clue", "attention-pulse");
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function renderQuestionFeedbackCard(questionNumber) {
    var block = findQuestionBlock(questionNumber);
    if (!block) return;
    var old = global.document.getElementById("study-feedback-" + questionNumber);
    if (old) old.remove();
    var userAnswer = getUserAnswer(questionNumber);
    var correct = isQuestionCorrect(questionNumber);
    var unanswered = !userAnswer;
    var info = TEST3.questions[questionNumber] || {};
    var status = unanswered ? "unanswered" : correct ? "correct" : "incorrect";
    var statusText = unanswered ? "Not answered · 0 points" : (correct ? "✓ " : "✕ ") + userAnswer + (correct ? " · +1 point" : " · +0 points");
    var card = createElement("div", "study-feedback-card tfng-feedback-card " + status);
    card.id = "study-feedback-" + questionNumber;
    card.innerHTML = '<h4>Question ' + questionNumber + '</h4><dl><dt class="label-your-answer">Your answer</dt><dd class="feedback-status ' + status + '-status">' + escapeHtml(statusText) + '</dd><dt class="label-correct-answer">Correct answer</dt><dd>' + escapeHtml(config.answers.getAnswerKeyDisplay(questionNumber) || "") + '</dd><dt class="label-why">Why</dt><dd>' + escapeHtml(info.why || "Compare the answer carefully with the relevant wording in the passage.") + '</dd><dt class="label-skill">Skill</dt><dd>' + escapeHtml(info.skill || "Reading for detail") + '</dd></dl><div class="evidence-action-row"><button type="button" class="study-clue-btn" aria-label="Show passage clue for question ' + questionNumber + '" title="Passage clue"><svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m15.5 15.5 4.5 4.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"/></svg></button></div>';
    block.append(card);
    var clue = card.querySelector(".study-clue-btn");
    if (clue) clue.addEventListener("click", function () { focusEvidence(questionNumber); });
  }

  function showGroup(groupId) {
    var control = taskControls.find(function (item) { return item.group.id === groupId; });
    if (!control) return;
    var group = control.group;
    var correct = groupScore(group);
    control.result.textContent = formatScore(correct) + " / " + group.questions.length + " correct";
    control.result.hidden = false;
    control.revealButton.textContent = "Hide answers & feedback";
    control.revealButton.setAttribute("aria-expanded", "true");
    group.questions.forEach(renderQuestionFeedbackCard);
    revealedGroups.add(groupId);
  }

  function toggleGroup(groupId) {
    if (!(getMode() === "study" && !studyReviewSubmitted)) return;
    if (revealedGroups.has(groupId)) {
      var group = taskControls.find(function (item) { return item.group.id === groupId; });
      if (group) clearGroupFeedback(group.group);
    } else {
      showGroup(groupId);
    }
  }

  function updateTaskFeedbackVisibility() {
    var inStudy = getMode() === "study";
    var afterTest = getMode() === "test" && isTestSubmitted();
    taskControls.forEach(function (control) {
      control.strategyButton.hidden = !(inStudy || afterTest);
      control.strategyButton.disabled = !(inStudy || afterTest);
      control.revealButton.hidden = !(inStudy && !studyReviewSubmitted);
      control.revealButton.disabled = !(inStudy && !studyReviewSubmitted);
      if (!(inStudy || afterTest)) {
        control.result.hidden = true;
        control.panel.hidden = true;
      }
    });
  }

  function revealAllFeedback() {
    TEST3.groups.forEach(function (group) { if (!revealedGroups.has(group.id)) showGroup(group.id); });
    updateTaskFeedbackVisibility();
  }

  function buildTaskFeedbackControls() {
    global.document.querySelectorAll(".study-feedback-controls, .study-task-result, .study-task-panel").forEach(function (node) { node.remove(); });
    taskControls = [];
    revealedGroups.clear();
    TEST3.groups.forEach(function (group) {
      var host = findInstructionHost(group);
      var anchor = findGroupAnchor(group);
      if (!host || !anchor || !anchor.parentNode) return;
      var controls = createElement("span", "study-feedback-controls");
      var strategyButton = createElement("button", "study-strategy-toggle study-icon-btn", "ⓘ");
      strategyButton.type = "button";
      strategyButton.setAttribute("aria-label", "How to tackle " + group.label);
      strategyButton.setAttribute("title", "How to tackle this task");
      strategyButton.setAttribute("aria-expanded", "false");
      var revealButton = createElement("button", "study-task-toggle study-reveal-btn", "Show answers & feedback");
      revealButton.type = "button";
      revealButton.setAttribute("aria-expanded", "false");
      controls.append(strategyButton, revealButton);
      host.append(controls);
      var result = createElement("div", "study-task-result study-task-result-line");
      result.hidden = true;
      var panel = createElement("div", "study-task-panel tfng-study-panel");
      panel.hidden = true;
      renderStrategyPanel(group, panel);
      anchor.parentNode.insertBefore(result, anchor);
      anchor.parentNode.insertBefore(panel, anchor);
      var control = { group: group, strategyButton: strategyButton, revealButton: revealButton, result: result, panel: panel };
      strategyButton.addEventListener("click", function () {
        var opening = panel.hidden;
        panel.hidden = !opening;
        strategyButton.setAttribute("aria-expanded", opening ? "true" : "false");
      });
      revealButton.addEventListener("click", function () { toggleGroup(group.id); });
      taskControls.push(control);
    });
    updateTaskFeedbackVisibility();
  }

  function installStyles() {
    if (global.document.getElementById("reading-shell-test3-parity-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-test3-parity-styles";
    style.textContent = ".reading-shell-root{align-items:center;display:flex;flex-wrap:wrap;gap:6px}.reading-shell-score-guide-button,.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;padding:5px 10px;white-space:nowrap}.reading-shell-score-guide-button:hover,.reading-shell-score-guide-button:focus-visible,.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.reading-shell-score-guide-backdrop,.reading-shell-answer-key-backdrop,.reading-shell-score-feedback-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-score-guide-backdrop[hidden],.reading-shell-answer-key-backdrop[hidden],.reading-shell-score-feedback-backdrop[hidden]{display:none!important}.reading-shell-score-guide-dialog,.reading-shell-answer-key-dialog,.reading-shell-score-feedback-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(680px,96vw)}.reading-shell-answer-key-dialog{width:min(760px,96vw)}.reading-shell-score-guide-header,.reading-shell-answer-key-header,.reading-shell-score-feedback-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-score-guide-title,.reading-shell-answer-key-title,.reading-shell-score-feedback-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-score-guide-intro,.reading-shell-answer-key-intro,.reading-shell-score-feedback-intro{color:var(--text-soft);margin:0}.reading-shell-score-guide-close,.reading-shell-answer-key-close,.reading-shell-score-feedback-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-score-guide-scroll,.reading-shell-answer-key-scroll,.score-feedback-body{min-height:0;overflow:auto}.reading-shell-score-guide-table{border-collapse:collapse;width:100%}.reading-shell-score-guide-heading,.reading-shell-score-guide-cell{border-bottom:1px solid var(--border);padding:9px;text-align:left}.current-score-row .reading-shell-score-guide-cell{background:color-mix(in srgb,#bbf7d0 48%,var(--bg));border-bottom-color:color-mix(in srgb,#15803d 40%,var(--border))}.current-score-label{background:color-mix(in srgb,#dcfce7 74%,var(--bg));border:1px solid color-mix(in srgb,#15803d 45%,var(--border));border-radius:999px;color:color-mix(in srgb,#166534 78%,var(--text));display:inline-flex;font-size:.78rem;font-weight:800;margin-left:8px;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.answer-key-section{border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;margin:0;padding:9px 10px}.answer-key-list{display:grid}.answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.answer-key-item:hover{background:var(--bg-secondary)}.answer-key-number{color:var(--text-soft);font-weight:800}.answer-key-answer{font-weight:700;overflow-wrap:anywhere}.reading-shell-score-feedback-button{appearance:none;background:transparent;border:0;border-radius:6px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;margin-left:12px;padding:2px 4px;white-space:nowrap}.reading-shell-score-feedback-button:hover,.reading-shell-score-feedback-button:focus-visible{background:rgba(227,24,55,.08);color:#e31837;outline:2px solid transparent}.score-feedback-body{display:grid;gap:16px;padding-right:5px}.score-feedback-card{border:1px solid var(--border);border-radius:12px;padding:14px}.score-feedback-heading{margin:0 0 8px}.score-feedback-subheading{margin:10px 0 6px}.score-feedback-text,.score-feedback-part-score{margin:6px 0}.score-feedback-part-score{font-weight:800}.study-feedback-controls{align-items:center;display:inline-flex;gap:8px;margin:8px 0 0}.study-icon-btn{align-items:center;background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;display:inline-flex;font:inherit;font-weight:800;height:30px;justify-content:center;padding:0;width:30px}.study-reveal-btn{background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;font:inherit;font-size:.84rem;font-weight:800;padding:6px 11px}.study-icon-btn:hover,.study-icon-btn:focus-visible,.study-reveal-btn:hover,.study-reveal-btn:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.study-task-result-line{color:var(--text);font-size:.88rem;font-weight:800;margin:10px 0 0}.study-task-panel{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;margin:10px 0 12px;padding:13px}.study-task-panel h3{font-size:1rem;margin:0 0 7px}.study-task-panel p{margin:6px 0}.study-strategy-grid{display:grid;gap:8px;margin-top:12px}.study-strategy-step,.study-common-trap{background:var(--bg);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:9px;padding:9px 10px}.study-common-trap{border-left-color:var(--correct)}.study-strategy-label{align-items:center;display:flex;font-size:.82rem;font-weight:800;gap:6px}.study-strategy-chip{align-items:center;background:var(--accent);border-radius:999px;color:#fff;display:inline-flex;font-size:.76rem;height:18px;justify-content:center;width:18px}.study-common-trap .study-strategy-chip{background:var(--correct)}.study-feedback-card{border:1px solid var(--border);border-radius:12px;margin-top:10px;padding:13px}.study-feedback-card.correct{background:color-mix(in srgb,#dcfce7 45%,var(--bg));border-color:color-mix(in srgb,#15803d 48%,var(--border))}.study-feedback-card.incorrect{background:color-mix(in srgb,#fee2e2 42%,var(--bg));border-color:color-mix(in srgb,#dc2626 42%,var(--border))}.study-feedback-card.unanswered{background:var(--bg-secondary)}.study-feedback-card h4{margin:0 0 10px}.study-feedback-card dl{display:grid;gap:3px;margin:0}.study-feedback-card dt{font-size:.8rem;font-weight:800;margin-top:7px}.study-feedback-card dd{margin:0}.feedback-status.correct-status{color:var(--correct);font-weight:800}.feedback-status.incorrect-status{color:var(--incorrect);font-weight:800}.feedback-status.unanswered-status{color:var(--text-soft);font-weight:800}.evidence-action-row{display:flex;justify-content:flex-end;margin-top:10px}.study-clue-btn{align-items:center;background:color-mix(in srgb,#dcfce7 56%,var(--bg));border:1px solid color-mix(in srgb,#15803d 55%,var(--border));border-radius:999px;color:color-mix(in srgb,#15803d 75%,var(--text));cursor:pointer;display:inline-flex;height:30px;justify-content:center;width:30px}.study-evidence-highlight{background:color-mix(in srgb,#bbf7d0 58%,var(--bg));border-radius:5px;box-shadow:0 0 0 1px color-mix(in srgb,#15803d 36%,transparent);padding:1px 2px}.study-evidence-highlight.focused-clue{box-shadow:0 0 0 4px color-mix(in srgb,#bbf7d0 65%,transparent);outline:3px solid color-mix(in srgb,#16a34a 70%,var(--accent));outline-offset:2px}.study-clue-badge{background:#14532d;border:1px solid #14532d;border-radius:999px;color:#fff;cursor:pointer;font-size:.78em;font-weight:800;height:1.35em;margin-left:4px;min-width:1.35em;padding:0}.focused-question-flash{border-radius:12px;outline:3px solid color-mix(in srgb,var(--accent) 70%,#16a34a);outline-offset:3px}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}.reading-shell-score-feedback-button{margin-left:6px}.study-feedback-controls{flex-wrap:wrap}}";
    global.document.head.append(style);
  }

  function buildUi() {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) { lastError = "ReadingFeatureShell mount was not found."; global.console.warn("ReadingFeatureShell: " + lastError); return false; }
    installStyles();
    mount.textContent = "";
    mount.removeAttribute("aria-hidden");
    var root = createElement("div", "reading-shell-root");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    var scoreGuideButton = createElement("button", "reading-shell-score-guide-button", "📊 Score guide");
    scoreGuideButton.type = "button";
    var answerKeyButton = createElement("button", "reading-shell-answer-key-button", "🔑");
    answerKeyButton.type = "button";
    answerKeyButton.setAttribute("aria-label", "Answer Key");
    answerKeyButton.setAttribute("title", "Answer Key");
    var studyPill = createElement("span", "reading-shell-study-pill", "Study mode");
    var timer = createElement("span", "reading-shell-study-timer");
    var timerValue = createElement("span", "reading-shell-study-timer-value", "00:00");
    timer.append(createElement("span", "reading-shell-study-timer-label", "Study time: "), timerValue);
    var scoreGuide = buildScoreGuideDialog();
    var answerKey = buildAnswerKeyDialog();
    var scoreFeedback = buildScoreFeedbackDialog();
    root.append(scoreGuideButton, answerKeyButton, studyPill, timer, scoreGuide.backdrop, answerKey.backdrop, scoreFeedback.backdrop);
    mount.append(root);
    var scoreFeedbackButton = createElement("button", "reading-shell-score-feedback-button");
    scoreFeedbackButton.type = "button";
    scoreFeedbackButton.hidden = true;
    scoreFeedbackButton.setAttribute("aria-label", "View score feedback");
    scoreFeedbackButton.setAttribute("title", "View score feedback");
    var topLeft = global.document.querySelector(".top-left");
    if (topLeft) topLeft.append(scoreFeedbackButton);
    scoreGuideButton.addEventListener("click", openScoreGuide);
    answerKeyButton.addEventListener("click", openAnswerKey);
    scoreFeedbackButton.addEventListener("click", openScoreFeedback);
    elements = { root: root, scoreGuideButton: scoreGuideButton, answerKeyButton: answerKeyButton, studyPill: studyPill, timer: timer, timerValue: timerValue, scoreGuideBackdrop: scoreGuide.backdrop, scoreGuideClose: scoreGuide.close, scoreSummary: scoreGuide.summary, scoreBody: scoreGuide.body, answerKeyBackdrop: answerKey.backdrop, answerKeyClose: answerKey.close, scoreFeedbackButton: scoreFeedbackButton, scoreFeedbackBackdrop: scoreFeedback.backdrop, scoreFeedbackClose: scoreFeedback.close, scoreFeedbackBody: scoreFeedback.body };
    buildTaskFeedbackControls();
    return true;
  }

  function updateResultStateFromOverlay() {
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay || String(overlay.style.display || "") !== "flex" || !parseCurrentResult()) return;
    if (getMode() === "study") studyReviewSubmitted = true;
  }

  function sync() {
    if (!initialized || !elements) return;
    updateResultStateFromOverlay();
    var mode = getMode();
    var studyMode = mode === "study";
    var reviewedTest = mode === "test" && isTestSubmitted();
    var showReviewControls = studyMode || reviewedTest;
    elements.root.hidden = !showReviewControls;
    elements.root.setAttribute("aria-hidden", showReviewControls ? "false" : "true");
    elements.scoreGuideButton.hidden = !showReviewControls;
    elements.answerKeyButton.hidden = !showReviewControls;
    elements.studyPill.hidden = !studyMode;
    elements.timer.hidden = !studyMode;
    var result = fullResultAvailable() ? parseCurrentResult() : null;
    elements.scoreFeedbackButton.hidden = !result;
    elements.scoreFeedbackButton.textContent = result ? result.rawScore + " / 40 · Band " + result.band : "";
    if (!studyMode) { studySessionActive = false; stopStudyTimer(); closeScoreGuide(false); }
    if (!showReviewControls) { closeAnswerKey(false); closeScoreFeedback(false); }
    if (result && (studyReviewSubmitted || reviewedTest)) revealAllFeedback();
    updateTaskFeedbackVisibility();
    if (!elements.scoreGuideBackdrop.hidden) refreshScoreGuide();
  }

  function observeResults() {
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay || resultObserver || !global.MutationObserver) return;
    resultObserver = new global.MutationObserver(function () { global.setTimeout(sync, 0); });
    resultObserver.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }

  function startStudySession() {
    if (!initialized) return;
    studySessionActive = true;
    studyReviewSubmitted = false;
    studyElapsedSeconds = 0;
    revealedGroups.forEach(function (groupId) { var group = TEST3.groups.find(function (item) { return item.id === groupId; }); if (group) clearGroupFeedback(group); });
    revealedGroups.clear();
    updateTimer();
    startStudyTimer();
    sync();
  }

  function init(value) {
    var validation = validateConfig(value);
    if (!validation.ok) { config = null; initialized = false; lastError = validation.error; global.console.warn("ReadingFeatureShell: " + validation.error); return { ok: false, error: validation.error }; }
    config = value;
    initialized = true;
    lastError = "";
    studyElapsedSeconds = 0;
    studySessionActive = false;
    studyReviewSubmitted = false;
    if (!buildUi()) { initialized = false; return { ok: false, error: lastError }; }
    observeResults();
    updateTimer();
    sync();
    return { ok: true, initialized: true };
  }

  function getStatus() { return { initialized: initialized, hasConfig: Boolean(config), version: config ? config.version : null, testId: config && config.test ? config.test.id : "", studySessionActive: studySessionActive, studyElapsedSeconds: studyElapsedSeconds, lastError: lastError }; }

  global.ReadingFeatureShell = { init: init, sync: sync, startStudySession: startStudySession, getStatus: getStatus, validateConfig: validateConfig };
})(window);
