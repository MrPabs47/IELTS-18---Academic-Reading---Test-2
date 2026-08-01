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
  var fullPassageClueMaps = new Set();
  var clueContextStates = new Map();
  var lastActiveClueMapKey = null;
  var lastActiveClueTarget = null;
  var renderedClueContextKey = null;
  var renderedClueTarget = null;
  var reportedErrors = new Set();
  var submittedOutcomes = null;
  var submittedAnswers = null;
  var submittedOutcomeMode = null;
  var capabilities = {};
  var activeSubmittedResult = null;
  var finalTestSubmittedResult = null;
  var lastSubmissionId = null;
  var domSubmissionSequence = 0;
  var compatibleDomSubmittedResult = null;
  var studyAwaitingFreshSubmission = false;
  var blockedStudySubmissionId = null;
  var studyResetObservedNull = false;
  var studyLearningResourcesShown = false;

  function isObject(value) { return Object.prototype.toString.call(value) === "[object Object]"; }
  function hasOwn(owner, name) { return Boolean(owner && Object.prototype.hasOwnProperty.call(owner, name)); }
  function hasFunction(owner, name) { return Boolean(owner && typeof owner[name] === "function"); }
  function el(tag, className, text) { var node = global.document.createElement(tag); if (className) node.className = className; if (typeof text === "string") node.textContent = text; return node; }
  function html(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]; }); }
  function normal(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function scoreText(value) { return Number.isInteger(value) ? String(value) : String(value.toFixed(1)); }
  function timeText(seconds) { return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0"); }

  function partRangeEntries(value) {
    var ranges = value && value.test && value.test.partRanges;
    if (!isObject(ranges)) return [];
    return Object.keys(ranges).map(function (part) {
      return { part: Number(part), range: ranges[part] };
    }).sort(function (a, b) { return a.part - b.part; });
  }
  function partNumbers() { return partRangeEntries(config).map(function (entry) { return entry.part; }); }
  function rangeForPart(part, value) {
    var entry = partRangeEntries(value || config).find(function (candidate) { return candidate.part === Number(part); });
    return entry ? entry.range : null;
  }
  function sectionFor(questionNumber, value) {
    var question = Number(questionNumber);
    var entry = partRangeEntries(value || config).find(function (candidate) {
      return question >= candidate.range.from && question <= candidate.range.to;
    });
    return entry ? entry.part : null;
  }
  function validatePartRanges(value) {
    var entries = partRangeEntries(value);
    if (!entries.length) return "ReadingFeatureShell config.test.partRanges must contain at least one part.";
    var expectedQuestion = 1;
    for (var index = 0; index < entries.length; index += 1) {
      var entry = entries[index];
      var range = entry.range;
      if (!Number.isInteger(entry.part) || entry.part !== index + 1 || !isObject(range) || !Number.isInteger(range.from) || !Number.isInteger(range.to) || range.from > range.to) {
        return "ReadingFeatureShell config.test.partRanges contains an invalid part range.";
      }
      if (range.from !== expectedQuestion) return "ReadingFeatureShell config.test.partRanges must cover every question once in order.";
      expectedQuestion = range.to + 1;
    }
    if (expectedQuestion !== value.test.totalQuestions + 1) return "ReadingFeatureShell config.test.partRanges must cover every question once in order.";
    return "";
  }
  function resolveControlHost(selector) {
    if (typeof selector !== "string" || !selector.trim() || !global.document || typeof global.document.querySelector !== "function") return false;
    try { return Boolean(global.document.querySelector(selector)); } catch (error) { return false; }
  }
  function validStrategy(group) {
    return Boolean(
      String(group && group.purpose || "").trim() &&
      String(group && group.trap || "").trim() &&
      Array.isArray(group && group.steps) &&
      group.steps.length &&
      group.steps.every(function (step) { return typeof step === "string" && step.trim(); })
    );
  }
  function groupTextId(group) {
    if (group && typeof group.textId === "string" && group.textId.trim()) return group.textId.trim();
    if (group && typeof group.textId === "number" && Number.isFinite(group.textId)) return group.textId;
    if (group && (typeof group.passage === "string" || Number.isFinite(Number(group.passage)))) {
      return typeof group.passage === "string" ? group.passage.trim() : group.passage;
    }
    return group && Number.isInteger(Number(group.part)) ? Number(group.part) : "";
  }
  function textIdentityPresent(value) {
    return (typeof value === "string" && Boolean(value.trim())) ||
      (typeof value === "number" && Number.isFinite(value));
  }
  function sameTextIdentity(left, right) {
    return typeof left === typeof right && left === right;
  }
  function clueContextKey(part, textId) {
    return JSON.stringify([Number(part), typeof textId, textId]);
  }
  function validateTaskGroups(value) {
    var study = value.study;
    if (!hasOwn(study, "taskGroups")) return "";
    if (!Array.isArray(study.taskGroups) || !study.taskGroups.length) return "ReadingFeatureShell config.study.taskGroups must be a non-empty array.";
    var represented = new Map();
    var ids = new Set();
    for (var groupIndex = 0; groupIndex < study.taskGroups.length; groupIndex += 1) {
      var group = study.taskGroups[groupIndex];
      var part = Number(group && group.part);
      var range = rangeForPart(part, value);
      if (!isObject(group) || !String(group.id || "").trim() || !String(group.label || "").trim() || !Array.isArray(group.questions) || !group.questions.length) return "ReadingFeatureShell config.study.taskGroups contains an invalid group.";
      if (ids.has(group.id)) return "ReadingFeatureShell config.study.taskGroups contains a duplicate task group id.";
      ids.add(group.id);
      if (!range || !groupTextId(group)) return "ReadingFeatureShell config.study task group " + group.id + " must have a valid scoring part and text identity.";
      for (var questionIndex = 0; questionIndex < group.questions.length; questionIndex += 1) {
        var question = Number(group.questions[questionIndex]);
        if (!Number.isInteger(question) || question < 1 || question > value.test.totalQuestions || sectionFor(question, value) !== part) return "ReadingFeatureShell config.study task group " + group.id + " contains an invalid question number.";
        represented.set(question, (represented.get(question) || 0) + 1);
        if (represented.get(question) > 1) return "ReadingFeatureShell config.study.taskGroups contains an overlapping question assignment.";
      }
    }
    if (study.completeQuestionCoverage === true) {
      for (var questionNumber = 1; questionNumber <= value.test.totalQuestions; questionNumber += 1) {
        if (represented.get(questionNumber) !== 1) return "ReadingFeatureShell config.study.taskGroups must represent every question exactly once.";
      }
    }
    return "";
  }
  function validateQuestionDetails(value) {
    var study = value.study;
    if (!hasOwn(study, "questionDetails")) return "";
    if (!isObject(study.questionDetails) || !Object.keys(study.questionDetails).length) return "ReadingFeatureShell config.study.questionDetails must be a non-empty object.";
    var detailKeys = Object.keys(study.questionDetails);
    for (var keyIndex = 0; keyIndex < detailKeys.length; keyIndex += 1) {
      var questionNumber = Number(detailKeys[keyIndex]);
      var detail = study.questionDetails[questionNumber];
      if (!Number.isInteger(questionNumber) || String(questionNumber) !== detailKeys[keyIndex] || questionNumber < 1 || questionNumber > value.test.totalQuestions) {
        return "ReadingFeatureShell config.study.questionDetails contains a question outside the configured test range.";
      }
      if (!Array.isArray(detail) || detail.length < 3 || detail.slice(0, 3).some(function (item) { return typeof item !== "string" || !item.trim(); })) {
        return "ReadingFeatureShell config.study.questionDetails must provide non-empty Why and Skill values, plus textual Evidence.";
      }
    }
    return "";
  }
  function validateClueDetails(value) {
    if (value.study.completeClueCoverage !== true) return "";
    if (!hasOwn(value.study, "questionDetails")) return "ReadingFeatureShell passage-clue capability requires configured question-detail evidence.";
    if (!isObject(value.study.questionDetails)) return "ReadingFeatureShell clue evidence must be configured through valid question details.";
    var explicitTargets = hasOwn(value.study, "clueTargets");
    var source = explicitTargets ? value.study.clueTargets : value.study.questionDetails;
    if (!isObject(source)) return "ReadingFeatureShell passage-clue capability requires a valid clue-target collection.";
    var keys = Object.keys(source);
    for (var index = 0; index < keys.length; index += 1) {
      var questionNumber = Number(keys[index]);
      if (!Number.isInteger(questionNumber) || String(questionNumber) !== keys[index] || questionNumber < 1 || questionNumber > value.test.totalQuestions) {
        return "ReadingFeatureShell clue targets contain a question outside the configured test range.";
      }
      if (explicitTargets) {
        var record = source[keys[index]];
        var group = Array.isArray(value.study.taskGroups) ? value.study.taskGroups.find(function (candidate) {
          return Array.isArray(candidate && candidate.questions) && candidate.questions.indexOf(questionNumber) !== -1;
        }) : null;
        if (!isObject(record) || record.question !== questionNumber || !Number.isInteger(record.part) ||
            !textIdentityPresent(record.textId) || typeof record.target !== "string" || !record.target.trim() ||
            typeof record.clue !== "string" || !record.clue.trim()) {
          return "ReadingFeatureShell explicit clue targets must provide question, part, textId, target, and clue values.";
        }
        if (!group || Number(group.part) !== record.part || !sameTextIdentity(groupTextId(group), record.textId)) {
          return "ReadingFeatureShell explicit clue targets must match their task-group part and text identity.";
        }
      } else {
        var detail = source[keys[index]];
        if (!Array.isArray(detail) || typeof detail[2] !== "string" || !detail[2].trim()) {
          return "ReadingFeatureShell passage-clue capability requires non-empty evidence for each legacy detailed record.";
        }
      }
    }
    if (keys.length !== value.test.totalQuestions) {
      return "ReadingFeatureShell passage-clue capability requires every question when complete clue coverage is declared.";
    }
    return "";
  }
  function validateScoreGuide(value) {
    var guide = value.study && value.study.scoreGuide;
    if (!hasOwn(value.study, "scoreGuide")) return "";
    if (!isObject(guide) || !String(guide.title || "").trim() || !String(guide.intro || "").trim() || !Array.isArray(guide.rows) || !guide.rows.length) return "ReadingFeatureShell score guide must contain a title, introduction, and non-empty rows array.";
    var previousLower = null;
    for (var index = 0; index < guide.rows.length; index += 1) {
      var row = guide.rows[index];
      if (!isObject(row)) return "ReadingFeatureShell score guide contains an invalid row.";
      var validBand = (typeof row.band === "string" && Boolean(row.band.trim())) ||
        (typeof row.band === "number" && Number.isFinite(row.band));
      if (!String(row.correctAnswers == null ? "" : row.correctAnswers).trim() || !validBand) {
        return "ReadingFeatureShell score guide contains an invalid row.";
      }
      var match = String(row.correctAnswers).trim().match(/^(\d+)(?:(?:\u2013|-)(\d+))?$/);
      if (!match) return "ReadingFeatureShell score guide contains an unusable score range.";
      var lower = Number(match[1]);
      var upper = Number(match[2] || match[1]);
      if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower > upper || lower < 0 || upper > value.test.totalQuestions) {
        return "ReadingFeatureShell score guide contains contradictory numeric boundaries.";
      }
      if (previousLower !== null && upper >= previousLower) return "ReadingFeatureShell score guide contains overlapping or incoherently ordered ranges.";
      previousLower = lower;
    }
    return "";
  }
  function validateControlHosts(value, needsControls) {
    if (!needsControls || !Array.isArray(value.study.taskGroups)) return "";
    for (var index = 0; index < value.study.taskGroups.length; index += 1) {
      var group = value.study.taskGroups[index];
      if (!resolveControlHost(group.controlHost)) {
        return "ReadingFeatureShell task controls are unavailable because group " + group.id + " has an unresolved controlHost selector.";
      }
    }
    return "";
  }
  function validateOptionalCapabilities(value) {
    var diagnostics = [];
    var taskError = validateTaskGroups(value);
    var detailsError = validateQuestionDetails(value);
    var clueError = validateClueDetails(value);
    var clueCapabilityRequested = value.study.completeClueCoverage === true;
    var scoreGuideError = validateScoreGuide(value);
    var hasTaskGroups = hasOwn(value.study, "taskGroups") && !taskError;
    var strategiesStructurallyValid = hasTaskGroups && value.study.taskGroups.every(validStrategy);
    var detailsStructurallyValid = hasOwn(value.study, "questionDetails") && !detailsError && hasTaskGroups;
    var controlHostError = validateControlHosts(value, strategiesStructurallyValid || detailsStructurallyValid);
    var hasTaskStrategies = strategiesStructurallyValid && !controlHostError;
    var hasQuestionDetails = detailsStructurallyValid && !controlHostError &&
      hasFunction(value.answers, "getUserAnswer") && hasFunction(value.answers, "isCorrect");
    if (taskError) diagnostics.push(taskError);
    if (hasTaskGroups && !strategiesStructurallyValid) diagnostics.push("ReadingFeatureShell task strategy capability is unavailable because strategy metadata is incomplete.");
    if (detailsError) diagnostics.push(detailsError);
    if (clueError) diagnostics.push(clueError);
    if (controlHostError) diagnostics.push(controlHostError);
    if (scoreGuideError) diagnostics.push(scoreGuideError);
    if (detailsStructurallyValid && !controlHostError && !hasQuestionDetails) {
      diagnostics.push("ReadingFeatureShell detailed-feedback capability requires valid task groups and page-owned answer callbacks.");
    }
    return {
      diagnostics: diagnostics,
      capabilities: {
        hasAnswerKey: true,
        hasScoreGuide: hasOwn(value.study, "scoreGuide") && !scoreGuideError,
        hasTaskGroups: hasTaskGroups,
        hasCompleteTaskGroups: hasTaskGroups && value.study.completeQuestionCoverage === true,
        hasTaskStrategies: hasTaskStrategies,
        hasQuestionDetails: hasQuestionDetails,
        hasPassageClues: clueCapabilityRequested && hasQuestionDetails && !clueError,
        hasSubmittedResult: hasFunction(value.state, "getSubmittedResult") ||
          Boolean(value.compatibility && value.compatibility.allowDomSubmittedResult)
      }
    };
  }
  function reportErrorOnce(error) {
    if (!error || reportedErrors.has(error)) return;
    reportedErrors.add(error);
    global.console.warn("ReadingFeatureShell: " + error);
  }

  function validateConfig(value) {
    var error = "";
    if (!isObject(value)) error = "ReadingFeatureShell config must be an object.";
    else if (value.version !== 1) error = "ReadingFeatureShell config.version must be 1.";
    else if (!isObject(value.test) || value.test.totalQuestions !== 40 || !isObject(value.test.partRanges) || !String(value.test.partLabel || "").trim()) error = "ReadingFeatureShell config.test must describe 40 questions, its parts, and a part label.";
    else if (!isObject(value.state) || !hasFunction(value.state, "getMode") || !hasFunction(value.state, "isTestSubmitted")) error = "ReadingFeatureShell config.state must provide getMode and isTestSubmitted.";
    else if (!isObject(value.answers) || !hasFunction(value.answers, "getAnswerKeyDisplay")) error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    else if (!isObject(value.navigation) || !hasFunction(value.navigation, "getQuestionTarget")) error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    else if (!isObject(value.study)) error = "ReadingFeatureShell config.study must be an object.";
    if (!error) error = validatePartRanges(value);
    var optional = error ? { diagnostics: [], capabilities: {} } : validateOptionalCapabilities(value);
    return { ok: !error, error: error, diagnostics: optional.diagnostics, capabilities: optional.capabilities };
  }

  function currentMode() { return config ? config.state.getMode() : "test"; }
  function taskGroups() { if (!hasOwn(config && config.study, "taskGroups")) return []; return capabilities.hasTaskGroups ? config.study.taskGroups : []; }
  function questionDetails() { if (!hasOwn(config && config.study, "questionDetails")) return {}; return capabilities.hasQuestionDetails ? config.study.questionDetails : {}; }
  function clueRecord(questionNumber) {
    if (hasOwn(config && config.study, "clueTargets")) return config.study.clueTargets[questionNumber] || null;
    var detail = questionDetails()[questionNumber];
    return detail ? { question: Number(questionNumber), target: detail[2], clue: "Passage clue" } : null;
  }
  function clueTargetFor(questionNumber) {
    var record = clueRecord(questionNumber);
    return record && typeof record.target === "string" ? record.target : "";
  }
  function clueTextFor(questionNumber) {
    var record = clueRecord(questionNumber);
    return record && typeof record.clue === "string" && record.clue.trim() ? record.clue.trim() : "Passage clue";
  }
  function groupForQuestion(questionNumber) {
    return taskGroups().find(function (group) { return group.questions.indexOf(Number(questionNumber)) !== -1; }) || null;
  }
  function groupsForTextIdentity(textId, part) {
    var identity = typeof textId === "string" ? textId.trim() : textId;
    return taskGroups().filter(function (group) {
      return sameTextIdentity(groupTextId(group), identity) && (part == null || Number(group.part) === Number(part));
    });
  }
  function activeTextIdentity(part) {
    if (config && config.state && hasFunction(config.state, "getActiveTextId")) {
      try {
        var configured = config.state.getActiveTextId(Number(part));
        if (textIdentityPresent(configured)) return typeof configured === "string" ? configured.trim() : configured;
      } catch (error) {
        reportErrorOnce("ReadingFeatureShell state.getActiveTextId() threw an exception; passage clues are unavailable.");
        return "";
      }
    }
    var identities = [];
    taskGroups().filter(function (group) {
      return Number(group.part) === Number(part);
    }).map(groupTextId).forEach(function (identity) {
      if (!identities.some(function (candidate) { return sameTextIdentity(candidate, identity); })) identities.push(identity);
    });
    return identities.length === 1 ? identities[0] : "";
  }
  function textTargetForGroup(group) {
    if (!group) return null;
    if (config && config.navigation && hasFunction(config.navigation, "getTextTarget")) {
      try {
        return config.navigation.getTextTarget(groupTextId(group), group) || null;
      } catch (error) {
        reportErrorOnce("ReadingFeatureShell navigation.getTextTarget() threw an exception; passage clues are unavailable.");
        return null;
      }
    }
    if (!global.document || typeof global.document.querySelector !== "function") return null;
    var textId = groupTextId(group);
    var escaped = String(textId).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return global.document.querySelector('[data-reading-text-id="' + escaped + '"]') ||
      global.document.querySelector('.passage-section[data-section="' + Number(group.part) + '"]');
  }
  function passageForQuestion(questionNumber) {
    return textTargetForGroup(groupForQuestion(questionNumber));
  }
  function resolveClueMapContext(selection, reportUnknown) {
    var selectedTextId = "";
    var selectedPart = null;
    if (typeof selection === "string" && selection.trim()) {
      selectedTextId = selection.trim();
      var exactGroups = groupsForTextIdentity(selectedTextId);
      if (exactGroups.length) selectedPart = Number(exactGroups[0].part);
    } else if (selection && typeof selection === "object" && hasOwn(selection, "textId")) {
      selectedTextId = typeof selection.textId === "string" ? selection.textId.trim() : selection.textId;
      selectedPart = Number(selection.part);
    } else {
      selectedPart = Number(selection == null ?
        (config && config.state && hasFunction(config.state, "getActivePart") ? config.state.getActivePart() : 1) :
        selection);
      selectedTextId = activeTextIdentity(selectedPart);
    }
    var groups = groupsForTextIdentity(selectedTextId, selectedPart);
    if (!textIdentityPresent(selectedTextId) || !groups.length) {
      if (reportUnknown !== false) reportErrorOnce("ReadingFeatureShell full passage clues require a valid selected text identity.");
      return null;
    }
    var questions = Array.from(new Set(groups.reduce(function (all, group) {
      return all.concat(group.questions);
    }, []))).map(Number).sort(function (a, b) { return a - b; });
    return {
      key: clueContextKey(selectedPart, selectedTextId),
      part: selectedPart,
      textId: selectedTextId,
      groups: groups,
      questions: questions,
      target: textTargetForGroup(groups[0])
    };
  }
  function ensureClueContextState(context) {
    if (!context) return null;
    var state = clueContextStates.get(context.key);
    if (!state) {
      state = {
        key: context.key,
        part: context.part,
        textId: context.textId,
        target: context.target,
        available: null,
        disabledReason: "",
        lastAuditedTarget: null,
        rendered: false
      };
      clueContextStates.set(context.key, state);
    }
    if (state.target !== context.target) {
      if (state.target) clearEvidence(state.target);
      if (renderedClueContextKey === state.key) {
        renderedClueContextKey = null;
        renderedClueTarget = null;
      }
      state.target = context.target;
      state.available = null;
      state.disabledReason = "";
      state.lastAuditedTarget = null;
      state.rendered = false;
    }
    state.part = context.part;
    state.textId = context.textId;
    return state;
  }
  function auditClueMapContext(context) {
    if (!context || !context.target || !context.questions.length) return false;
    return context.questions.every(function (questionNumber) {
      var target = clueTargetFor(questionNumber);
      return Boolean(target && String(context.target.textContent || "").indexOf(target) !== -1);
    });
  }
  function setClueControlsForContext(context, available) {
    if (!context || !global.document || typeof global.document.querySelectorAll !== "function") return;
    var questions = new Set(context.questions.map(String));
    global.document.querySelectorAll(".reading-shell-study-clue-button").forEach(function (button) {
      var question = button.getAttribute && button.getAttribute("data-reading-shell-question");
      if (!questions.has(String(question))) return;
      button.disabled = !available;
      button.hidden = !available;
    });
  }
  function contextDiagnostic(context, reason) {
    return "ReadingFeatureShell passage clues are unavailable for scoring part " + context.part +
      ", text " + String(context.textId) + " (" + reason + ").";
  }
  function disableClueContext(context, reason) {
    if (!context) return false;
    var state = ensureClueContextState(context);
    if (state.target) clearEvidence(state.target);
    state.available = false;
    state.disabledReason = reason || (hasOwn(config && config.study, "clueTargets") ?
      "configured clue target could not be located" :
      "configured evidence could not be located");
    state.lastAuditedTarget = context.target;
    state.rendered = false;
    fullPassageClueMaps.delete(context.key);
    if (renderedClueContextKey === context.key) {
      renderedClueContextKey = null;
      renderedClueTarget = null;
    }
    setClueControlsForContext(context, false);
    reportErrorOnce(contextDiagnostic(context, state.disabledReason));
    return false;
  }
  function auditClueContext(context, force) {
    if (!context) return false;
    var state = ensureClueContextState(context);
    if (!force && state.lastAuditedTarget === context.target && state.available !== null) return state.available;
    if (!auditClueMapContext(context)) {
      return disableClueContext(context, hasOwn(config && config.study, "clueTargets") ?
        "configured clue target could not be located" :
        "configured evidence could not be located");
    }
    state.available = true;
    state.disabledReason = "";
    state.lastAuditedTarget = context.target;
    setClueControlsForContext(context, true);
    return true;
  }
  function disablePassageClues(message) {
    clearAllPassageClueMaps();
    capabilities.hasPassageClues = false;
    if (message) reportErrorOnce(message);
    if (global.document && typeof global.document.querySelectorAll === "function") {
      global.document.querySelectorAll(".reading-shell-study-clue-button").forEach(function (button) {
        button.disabled = true;
        button.hidden = true;
      });
    }
    syncPassageClueToolbar(false);
  }
  function auditClueCapability() {
    if (!capabilities.hasPassageClues) return false;
    var contexts = [];
    taskGroups().forEach(function (group) {
      var key = clueContextKey(group.part, groupTextId(group));
      if (contexts.some(function (context) { return context.key === key; })) return;
      var context = resolveClueMapContext({ part: Number(group.part), textId: groupTextId(group) }, false);
      if (context) contexts.push(context);
    });
    for (var index = 0; index < contexts.length; index += 1) {
      auditClueContext(contexts[index], true);
    }
    return contexts.some(function (context) {
      var state = clueContextStates.get(context.key);
      return state && state.available;
    });
  }
  function answerFor(questionNumber) {
    if (config && config.answers && hasFunction(config.answers, "getUserAnswer")) return String(config.answers.getUserAnswer(questionNumber) || "").trim();
    return "";
  }
  function correctFor(questionNumber) {
    if (config && config.answers && hasFunction(config.answers, "isCorrect")) return Boolean(config.answers.isCorrect(questionNumber));
    return false;
  }
  function outcomeFor(questionNumber) { return correctFor(questionNumber) ? 1 : 0; }
  function submittedAnswerFor(questionNumber) {
    return submittedAnswers && hasOwn(submittedAnswers, questionNumber) ? submittedAnswers[questionNumber] : "";
  }
  function captureSubmittedOutcomes(result) {
    submittedOutcomes = result && isObject(result.questionOutcomes) ? {} : null;
    submittedAnswers = {};
    submittedOutcomeMode = currentMode();
    for (var questionNumber = 1; questionNumber <= config.test.totalQuestions; questionNumber += 1) {
      submittedAnswers[questionNumber] = answerFor(questionNumber);
      if (submittedOutcomes) submittedOutcomes[questionNumber] = result.questionOutcomes[questionNumber] ? 1 : 0;
    }
  }
  function submittedOutcomeFor(questionNumber) {
    return submittedOutcomes && hasOwn(submittedOutcomes, questionNumber) ? submittedOutcomes[questionNumber] : 0;
  }
  function rangeScore(group) { return group.questions.reduce(function (total, questionNumber) { return total + submittedOutcomeFor(questionNumber); }, 0); }
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
    if (group && group.controlHost) {
      var configuredHost = global.document.querySelector(group.controlHost);
      if (configuredHost) return configuredHost;
    }
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
    var rawPattern = new RegExp("(\\d+(?:\\.5)?)\\s+out of\\s+" + config.test.totalQuestions, "i");
    var raw = scoreLine && String(scoreLine.textContent || "").match(rawPattern);
    var band = bandLine && String(bandLine.textContent || "").match(/band:\s*([0-9]+(?:\.[0-9]+)?)/i);
    return raw && band ? { rawScore: Number(raw[1]), band: band[1] } : null;
  }
  function resultOutcomesFromPage() {
    var outcomes = {};
    for (var questionNumber = 1; questionNumber <= config.test.totalQuestions; questionNumber += 1) outcomes[questionNumber] = correctFor(questionNumber);
    return outcomes;
  }
  function partScoresFromOutcomes(outcomes) {
    var parts = {};
    partRangeEntries(config).forEach(function (entry) {
      var score = 0;
      for (var question = entry.range.from; question <= entry.range.to; question += 1) score += outcomes[question] ? 1 : 0;
      parts[entry.part] = { score: score, max: entry.range.to - entry.range.from + 1 };
    });
    return parts;
  }
  function validSubmissionId(value) {
    return (typeof value === "number" && Number.isFinite(value)) ||
      (typeof value === "string" && Boolean(value.trim()));
  }
  function validateSubmittedResult(value) {
    if (!isObject(value)) return "ReadingFeatureShell submitted result is invalid.";
    var validBand = (typeof value.band === "string" && Boolean(value.band.trim())) ||
      (typeof value.band === "number" && Number.isFinite(value.band));
    if (!validSubmissionId(value.submissionId) || !Number.isInteger(value.rawScore) || value.rawScore < 0 || value.rawScore > config.test.totalQuestions || !validBand || !isObject(value.partScores)) return "ReadingFeatureShell submitted result is invalid.";
    var total = 0;
    var entries = partRangeEntries(config);
    for (var index = 0; index < entries.length; index += 1) {
      var entry = entries[index];
      var part = value.partScores[entry.part];
      var maximum = entry.range.to - entry.range.from + 1;
      if (!isObject(part) || !Number.isInteger(part.score) || part.score < 0 || part.score > maximum || part.max !== maximum) return "ReadingFeatureShell submitted part scores are invalid.";
      total += part.score;
    }
    if (Object.keys(value.partScores).length !== entries.length || total !== value.rawScore) return "ReadingFeatureShell submitted part scores must sum to the raw score.";
    return "";
  }
  function validateQuestionOutcomes(value) {
    if (value == null) return "";
    if (!isObject(value) || Object.keys(value).length !== config.test.totalQuestions) return "ReadingFeatureShell submitted question outcomes are invalid; outcome-dependent review is unavailable.";
    for (var question = 1; question <= config.test.totalQuestions; question += 1) {
      if (typeof value[question] !== "boolean") return "ReadingFeatureShell submitted question outcomes are invalid; outcome-dependent review is unavailable.";
    }
    return "";
  }
  function copySubmittedResult(value) {
    var copy = {
      submissionId: value.submissionId,
      rawScore: value.rawScore,
      band: value.band,
      partScores: {}
    };
    partRangeEntries(config).forEach(function (entry) {
      copy.partScores[entry.part] = {
        score: value.partScores[entry.part].score,
        max: value.partScores[entry.part].max
      };
    });
    var outcomesError = validateQuestionOutcomes(value.questionOutcomes);
    if (outcomesError) reportErrorOnce(outcomesError);
    else if (value.questionOutcomes != null) {
      copy.questionOutcomes = {};
      for (var question = 1; question <= config.test.totalQuestions; question += 1) {
        copy.questionOutcomes[question] = value.questionOutcomes[question];
      }
    }
    return copy;
  }
  function submittedResult() {
    if (config && config.state && hasFunction(config.state, "getSubmittedResult")) {
      var authoritative = null;
      try {
        authoritative = config.state.getSubmittedResult();
      } catch (error) {
        reportErrorOnce("ReadingFeatureShell state.getSubmittedResult() threw an exception; submitted review is unavailable.");
        return null;
      }
      if (authoritative == null) return null;
      var authoritativeError = validateSubmittedResult(authoritative);
      if (authoritativeError) { reportErrorOnce(authoritativeError); return null; }
      return copySubmittedResult(authoritative);
    }
    if (!(config && config.compatibility && config.compatibility.allowDomSubmittedResult)) return null;
    if (currentMode() === "test" ? !config.state.isTestSubmitted() : !studyReviewSubmitted) return null;
    if (currentMode() === "study" && !reviewOverlayWasOpen) return compatibleDomSubmittedResult;
    var parsed = parsedResult();
    if (!parsed) { reportErrorOnce("ReadingFeatureShell could not read the explicitly enabled DOM submitted result."); return null; }
    var outcomes = resultOutcomesFromPage();
    var compatible = {
      submissionId: "dom-" + domSubmissionSequence,
      rawScore: parsed.rawScore,
      band: parsed.band,
      partScores: partScoresFromOutcomes(outcomes),
      questionOutcomes: outcomes
    };
    var compatibilityError = validateSubmittedResult(compatible);
    if (compatibilityError) { reportErrorOnce(compatibilityError); return null; }
    compatibleDomSubmittedResult = copySubmittedResult(compatible);
    return compatibleDomSubmittedResult;
  }
  function fullReviewAvailable() {
    if (currentMode() === "test") return Boolean(config.state.isTestSubmitted() && activeSubmittedResult);
    return Boolean(currentMode() === "study" && activeSubmittedResult);
  }
  function learningResourcesAvailable() {
    if (currentMode() === "study") return true;
    return fullReviewAvailable();
  }
  function officialReviewAvailable() {
    return Boolean(fullReviewAvailable() && submittedOutcomes);
  }
  function detailedReviewAvailable() {
    return Boolean(learningResourcesAvailable() && capabilities.hasQuestionDetails);
  }
  function updateTimer() { if (elements) elements.timerValue.textContent = timeText(studyElapsedSeconds); }
  function stopStudyTimer() { if (studyTimerId) { global.clearInterval(studyTimerId); studyTimerId = null; } }
  function startStudyTimer() { stopStudyTimer(); studyTimerId = global.setInterval(function () { if (!studySessionActive) return; studyElapsedSeconds += 1; updateTimer(); }, 1000); }

  function closeDialog(backdrop, restore) { if (!backdrop) return; backdrop.hidden = true; backdrop.setAttribute("aria-hidden", "true"); if (restore !== false && lastOpener && typeof lastOpener.focus === "function") lastOpener.focus(); }
  function openDialog(backdrop, closer) { lastOpener = global.document.activeElement; backdrop.hidden = false; backdrop.setAttribute("aria-hidden", "false"); closer.focus(); }

  function updateScoreGuide() {
    if (!elements || !capabilities.hasScoreGuide || !elements.scoreGuideBody || !config.study.scoreGuide || !Array.isArray(config.study.scoreGuide.rows)) return;
    var result = fullReviewAvailable() ? activeSubmittedResult : null;
    elements.scoreGuideSummary.hidden = !result;
    elements.scoreGuideSummary.textContent = result ? "Your score: " + result.rawScore + " / " + config.test.totalQuestions + " · Band " + result.band : "";
    elements.scoreGuideBody.textContent = "";
    config.study.scoreGuide.rows.forEach(function (row) {
      if (!isObject(row)) return;
      var match = String(row.correctAnswers).match(/^(\d+)(?:(?:\u2013|-)(\d+))?$/);
      if (!match) return;
      var current = Boolean(result && result.rawScore >= Number(match[1]) && result.rawScore <= Number(match[2] || match[1]));
      var tableRow = el("tr", current ? "reading-shell-score-guide-row reading-shell-current-score-row" : "reading-shell-score-guide-row");
      var range = el("td", "reading-shell-score-guide-cell", row.correctAnswers);
      if (current) range.append(el("span", "reading-shell-current-score-label", "Your current score"));
      tableRow.append(range, el("td", "reading-shell-score-guide-cell", row.band));
      elements.scoreGuideBody.append(tableRow);
    });
  }
  function openScoreGuide() { if (!elements || !capabilities.hasScoreGuide || elements.scoreGuideButton.hidden || !elements.scoreGuideBackdrop) return; updateScoreGuide(); openDialog(elements.scoreGuideBackdrop, elements.scoreGuideClose); }
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
    shell.titleGroup.append(el("p", "reading-shell-answer-key-intro", "Correct answers for Questions 1–" + config.test.totalQuestions));
    var scroll = el("div", "reading-shell-answer-key-scroll");
    var grid = el("div", "reading-shell-answer-key-grid");
    partNumbers().forEach(function (part) {
      var range = rangeForPart(part);
      var section = el("section", "reading-shell-answer-key-section");
      section.append(el("h3", "reading-shell-answer-key-section-title", config.test.partLabel + " " + part + ": Questions " + range.from + "–" + range.to));
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
  function feedbackGroupPart(group) {
    var configuredPart = Number(group && (group.part || group.passage));
    return configuredPart || sectionFor(group.questions[0]);
  }
  function feedbackGroupResult(group, order) {
    var total = group.questions.length;
    var correct = group.questions.reduce(function (sum, questionNumber) { return sum + submittedOutcomeFor(questionNumber); }, 0);
    return { group: group, total: total, correct: correct, ratio: total ? correct / total : 0, order: order };
  }
  function rankFeedbackGroups(groups, type) {
    return groups.filter(function (item) {
      return item.total >= 3 && (type === "strength" ? item.ratio >= 0.75 : item.ratio < 0.60);
    }).sort(function (a, b) {
      var ratioOrder = type === "strength" ? b.ratio - a.ratio : a.ratio - b.ratio;
      return ratioOrder || (b.total - a.total) || (a.order - b.order);
    });
  }
  function selectPartFeedback(part) {
    var groups = taskGroups().map(feedbackGroupResult).filter(function (item) { return feedbackGroupPart(item.group) === Number(part); });
    var strength = rankFeedbackGroups(groups, "strength")[0] || null;
    var focus = rankFeedbackGroups(groups, "focus").filter(function (item) { return !strength || item.group !== strength.group; })[0] || null;
    return { strength: strength, focus: focus };
  }
  function strengthFeedbackAdvice(item) {
    var group = item.group;
    var detail = group.purpose || (group.steps && group.steps[0]) || "Keep using the same careful approach.";
    return "You handled " + group.label + " accurately. " + detail;
  }
  function focusFeedbackAdvice(item) {
    var group = item.group;
    var step = group.steps && group.steps[0] ? group.steps[0] : group.purpose || "Review this question type carefully.";
    return step + (group.trap ? " Avoid this common trap: " + group.trap : "");
  }
  function appendTaskTypeFeedback(parent, title, item) {
    if (!item) return;
    parent.append(
      el("h4", "reading-shell-score-feedback-subheading", title),
      el("p", "reading-shell-score-feedback-part-score", item.group.label + ": " + scoreText(item.correct) + " / " + item.total + " correct"),
      el("p", "reading-shell-score-feedback-text", title === "What went well" ? strengthFeedbackAdvice(item) : focusFeedbackAdvice(item))
    );
  }
  function renderScoreFeedback() {
    var result = activeSubmittedResult;
    if (!result || !elements) return;
    var body = elements.scoreFeedbackBody;
    body.textContent = "";
    var overall = feedbackCard(body, "Overall result");
    overall.append(el("p", "reading-shell-score-feedback-text", "You answered " + result.rawScore + " out of " + config.test.totalQuestions + " questions correctly."), el("p", "reading-shell-score-feedback-text", "Submitted band: " + result.band + "."));
    var performance = feedbackCard(body, "Performance by part");
    var hasTaskAdvice = capabilities.hasCompleteTaskGroups && capabilities.hasTaskStrategies && Boolean(result.questionOutcomes);
    partNumbers().forEach(function (part) {
      var range = rangeForPart(part);
      var total = result.partScores[part].score;
      performance.append(el("p", "reading-shell-score-feedback-part-score", config.test.partLabel + " " + part + ": " + scoreText(total) + " / " + (range.to - range.from + 1)));
      if (hasTaskAdvice) {
        var card = feedbackCard(body, config.test.partLabel + " " + part + " · " + scoreText(total) + " / " + (range.to - range.from + 1));
        var selection = selectPartFeedback(part);
        appendTaskTypeFeedback(card, "What went well", selection.strength);
        appendTaskTypeFeedback(card, "Focus next", selection.focus);
      }
    });
  }
  function strategyMarkup(group) {
    return '<div class="reading-shell-study-strategy"><h3>' + html(group.label) + ' strategy</h3><p>' + html(group.purpose) + '</p><div class="reading-shell-study-strategy-grid">' + group.steps.map(function (step, index) { return '<div class="reading-shell-study-step"><span class="reading-shell-study-step-label"><span class="reading-shell-study-chip">' + (index + 1) + '</span>Step ' + (index + 1) + '</span><p>' + html(step) + '</p></div>'; }).join("") + '<div class="reading-shell-study-trap"><span class="reading-shell-study-step-label"><span class="reading-shell-study-chip">!</span>Common trap</span><p>' + html(group.trap) + '</p></div></div></div>';
  }

  function removeQuestionCard(questionNumber) { var card = global.document.getElementById("reading-shell-feedback-" + questionNumber); if (card) card.remove(); }
  function buildQuestionCard(questionNumber) {
    var host = cardHost(questionNumber);
    if (!host) return;
    removeQuestionCard(questionNumber);
    var official = officialReviewAvailable();
    var user = official ? submittedAnswerFor(questionNumber) : "";
    var correct = official && Boolean(submittedOutcomeFor(questionNumber));
    var status = !user ? "unanswered" : correct ? "correct" : "incorrect";
    var statusText = !user ? "Not answered · 0 points" : (correct ? "✓ " : "✕ ") + user + (correct ? " · +1 point" : " · +0 points");
    var detail = questionDetails()[questionNumber];
    if (!detail) return;
    var card = el("section", "reading-shell-study-feedback-card" + (official ? " reading-shell-study-feedback-" + status : ""));
    card.id = "reading-shell-feedback-" + questionNumber;
    card.innerHTML = '<h4>Question ' + questionNumber + '</h4><dl>' +
      (official ? '<dt>Your answer</dt><dd class="reading-shell-study-status reading-shell-study-status-' + status + '">' + html(statusText) + '</dd>' : "") +
      '<dt>Correct answer</dt><dd>' + html(config.answers.getAnswerKeyDisplay(questionNumber) || "") + '</dd><dt>Why</dt><dd>' + html(detail[0]) + '</dd><dt>Skill</dt><dd>' + html(detail[1]) + '</dd>' + ((config.study && config.study.showEvidenceText === false) ? '' : '<dt>Evidence</dt><dd>' + html(detail[2]) + '</dd>') + '</dl>';
    if (!capabilities.hasPassageClues) {
      host.append(card);
      return;
    }
    var clueText = clueTextFor(questionNumber);
    card.insertAdjacentHTML("beforeend", '<div class="reading-shell-study-clue-row"><button class="reading-shell-study-clue-button" data-reading-shell-question="' + questionNumber + '" type="button" title="' + html(clueText) + '" aria-label="Passage clue for question ' + questionNumber + ': ' + html(clueText) + '"><svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m15.5 15.5 4.5 4.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"/></svg></button></div>');
    host.append(card);
    var clueButton = card.querySelector(".reading-shell-study-clue-button");
    var clueContext = resolveClueMapContext({
      part: Number(groupForQuestion(questionNumber).part),
      textId: groupTextId(groupForQuestion(questionNumber))
    }, false);
    var clueState = clueContext && ensureClueContextState(clueContext);
    clueButton.hidden = Boolean(clueState && clueState.available === false);
    clueButton.disabled = Boolean(clueState && clueState.available === false);
    clueButton.addEventListener("click", function () { showEvidence(questionNumber); });
  }

  function clearEvidence(passage) {
    if (!passage || typeof passage.querySelectorAll !== "function") return;
    passage.querySelectorAll(".reading-shell-evidence-highlight").forEach(function (mark) {
      mark.replaceWith(global.document.createTextNode(mark.getAttribute("data-reading-shell-evidence-text") || ""));
    });
    if (typeof passage.normalize === "function") passage.normalize();
  }
  function clearEvidenceFocus(passage) {
    if (!passage) return;
    passage.querySelectorAll(".reading-shell-evidence-focus, .reading-shell-evidence-attention").forEach(function (mark) {
      mark.classList.remove("reading-shell-evidence-focus", "reading-shell-evidence-attention");
      mark.removeAttribute("tabindex");
    });
  }
  function focusRenderedEvidence(passage, questionNumber) {
    if (!passage) return null;
    var target = Array.from(passage.querySelectorAll(".reading-shell-evidence-highlight")).find(function (mark) {
      return String(mark.getAttribute("data-reading-shell-clue-questions") || "").split(/\s+/).filter(Boolean).indexOf(String(questionNumber)) !== -1;
    });
    if (!target) return null;
    clearEvidenceFocus(passage);
    target.classList.add("reading-shell-evidence-focus");
    target.setAttribute("tabindex", "-1");
    global.requestAnimationFrame(function () { target.classList.add("reading-shell-evidence-attention"); });
    global.setTimeout(function () { target.classList.remove("reading-shell-evidence-attention"); }, 1400);
    var reducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
    return target;
  }
  function sharedEvidenceQuestions(target, part, questionNumber) {
    var details = questionDetails();
    var sourceGroup = groupForQuestion(questionNumber);
    var sourceTextId = sourceGroup ? groupTextId(sourceGroup) : "";
    return Object.keys(details).map(Number).filter(function (candidate) {
      var candidateGroup = groupForQuestion(candidate);
      var sameText = sourceTextId ? candidateGroup && groupTextId(candidateGroup) === sourceTextId : sectionFor(candidate) === part;
      return sameText && clueTargetFor(candidate) === target;
    }).sort(function (a, b) { return a - b; });
  }
  function evidenceBadge(questionNumber) {
    var badge = el("button", "reading-shell-clue-badge", String(questionNumber));
    badge.type = "button";
    badge.setAttribute("data-reading-shell-clue-question", String(questionNumber));
    badge.setAttribute("aria-label", "Return to question " + questionNumber);
    badge.addEventListener("click", function (event) { event.stopPropagation(); navigateTo(questionNumber); });
    return badge;
  }
  function questionsForClueMap(context) {
    return context && Array.isArray(context.questions) ? context.questions.slice() : [];
  }
  function passageTextNodes(passage) {
    var nodes = [];
    var walker = global.document.createTreeWalker(passage, global.NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return global.NodeFilter.FILTER_REJECT;
      if (node.parentElement && node.parentElement.closest("mark,button,input,select,textarea")) return global.NodeFilter.FILTER_REJECT;
      return global.NodeFilter.FILTER_ACCEPT;
    } });
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }
  function locateTextEvidence(passage, questions) {
    var nodes = passageTextNodes(passage);
    return questions.map(function (questionNumber) {
      var target = clueTargetFor(questionNumber);
      if (!target) return null;
      for (var index = 0; index < nodes.length; index++) {
        var start = nodes[index].nodeValue.indexOf(target);
        if (start !== -1) return { node: nodes[index], start: start, end: start + target.length, questionNumber: questionNumber };
      }
      return null;
    }).filter(Boolean);
  }
  function mergeLocationRecords(records) {
    var recordsByNode = new Map();
    records.forEach(function (record) {
      if (!recordsByNode.has(record.node)) recordsByNode.set(record.node, []);
      recordsByNode.get(record.node).push(record);
    });
    var merged = [];
    recordsByNode.forEach(function (nodeRecords, node) {
      nodeRecords.sort(function (a, b) { return a.start - b.start || a.end - b.end || a.questionNumber - b.questionNumber; });
      nodeRecords.forEach(function (record) {
        var current = merged.length && merged[merged.length - 1].node === node ? merged[merged.length - 1] : null;
        if (current && record.start < current.end) {
          current.end = Math.max(current.end, record.end);
          if (current.questions.indexOf(record.questionNumber) === -1) current.questions.push(record.questionNumber);
        } else {
          merged.push({ node: node, start: record.start, end: record.end, questions: [record.questionNumber] });
        }
      });
    });
    merged.forEach(function (record) { record.questions.sort(function (a, b) { return a - b; }); });
    return merged;
  }
  function representedMapQuestions(passage) {
    var questions = new Set();
    passage.querySelectorAll(".reading-shell-evidence-highlight .reading-shell-clue-badge").forEach(function (badge) {
      questions.add(Number(badge.getAttribute("data-reading-shell-clue-question")));
    });
    return questions;
  }
  function fullMapIsRendered(selection) {
    var context = selection && typeof selection === "object" && selection.key ?
      selection :
      resolveClueMapContext(selection, false);
    var passage = context && context.target;
    if (!passage || passage.querySelector(".reading-shell-evidence-highlight .reading-shell-evidence-highlight")) return false;
    var represented = representedMapQuestions(passage);
    return questionsForClueMap(context).every(function (questionNumber) { return represented.has(questionNumber); });
  }
  function suspendRenderedClueContext(nextKey, nextTarget) {
    if (renderedClueTarget && (renderedClueContextKey !== nextKey || renderedClueTarget !== nextTarget)) {
      clearEvidence(renderedClueTarget);
      var previous = clueContextStates.get(renderedClueContextKey);
      if (previous) previous.rendered = false;
      renderedClueContextKey = null;
      renderedClueTarget = null;
    }
  }
  function noteRenderedClueContext(context) {
    suspendRenderedClueContext(context.key, context.target);
    var state = ensureClueContextState(context);
    state.rendered = true;
    renderedClueContextKey = context.key;
    renderedClueTarget = context.target;
  }
  function renderFullPassageClueMap(context) {
    var passage = context && context.target;
    if (!passage) return false;
    suspendRenderedClueContext(context.key, passage);
    clearEvidence(passage);
    var questions = questionsForClueMap(context);
    var records = locateTextEvidence(passage, questions);
    if (records.length !== questions.length) return false;
    var merged = mergeLocationRecords(records);
    var orderedRecords = [];
    var recordsByNode = new Map();
    merged.forEach(function (record) {
      if (!recordsByNode.has(record.node)) recordsByNode.set(record.node, []);
      recordsByNode.get(record.node).push(record);
    });
    recordsByNode.forEach(function (nodeRecords) {
      nodeRecords.sort(function (a, b) { return b.start - a.start; }).forEach(function (record) { orderedRecords.push(record); });
    });
    try {
      orderedRecords.forEach(function (record) {
        var evidenceText = record.node.nodeValue.slice(record.start, record.end);
        var range = global.document.createRange();
        range.setStart(record.node, record.start);
        range.setEnd(record.node, record.end);
        var mark = el("mark", "reading-shell-evidence-highlight");
        mark.setAttribute("data-reading-shell-evidence-text", evidenceText);
        mark.setAttribute("data-reading-shell-clue-questions", record.questions.join(" "));
        range.surroundContents(mark);
        record.questions.forEach(function (questionNumber) { mark.append(evidenceBadge(questionNumber)); });
      });
    } catch (error) {
      clearEvidence(passage);
      return false;
    }
    if (fullMapIsRendered(context)) {
      noteRenderedClueContext(context);
      return true;
    }
    clearEvidence(passage);
    return false;
  }
  function showAllPassageClues(selection) {
    if (!detailedReviewAvailable() || !capabilities.hasPassageClues) return false;
    var context = resolveClueMapContext(selection, true);
    if (!context) return false;
    suspendRenderedClueContext(context.key, context.target);
    if (!auditClueContext(context, true)) return false;
    if (renderFullPassageClueMap(context)) {
      fullPassageClueMaps.add(context.key);
      return true;
    }
    fullPassageClueMaps.delete(context.key);
    return false;
  }
  function hideAllPassageClues(selection) {
    var context = resolveClueMapContext(selection, false);
    if (!context) return false;
    if (context.target) clearEvidence(context.target);
    var state = clueContextStates.get(context.key);
    if (state) state.rendered = false;
    if (renderedClueContextKey === context.key) {
      renderedClueContextKey = null;
      renderedClueTarget = null;
    }
    fullPassageClueMaps.delete(context.key);
    return true;
  }
  function clearAllPassageClueMaps() {
    var targets = [];
    taskGroups().forEach(function (group) {
      var target = textTargetForGroup(group);
      if (target && targets.indexOf(target) === -1) targets.push(target);
    });
    if (global.document && typeof global.document.querySelectorAll === "function") {
      global.document.querySelectorAll(".passage-section[data-section],[data-reading-text-id]").forEach(function (target) {
        if (targets.indexOf(target) === -1) targets.push(target);
      });
    }
    targets.forEach(clearEvidence);
    fullPassageClueMaps.clear();
    clueContextStates.clear();
    lastActiveClueMapKey = null;
    lastActiveClueTarget = null;
    renderedClueContextKey = null;
    renderedClueTarget = null;
  }
  function restoreFullPassageClueMap(selection) {
    var context = selection && typeof selection === "object" && selection.key ?
      selection :
      resolveClueMapContext(selection, false);
    if (!context || !fullPassageClueMaps.has(context.key)) return;
    if (!auditClueContext(context, false)) return;
    if (!fullMapIsRendered(context)) renderFullPassageClueMap(context);
  }
  function showEvidence(questionNumber) {
    if (!detailedReviewAvailable() || !capabilities.hasPassageClues) return;
    var detail = questionDetails()[questionNumber];
    if (!detail) return;
    var part = sectionFor(questionNumber);
    if (typeof global.switchSection === "function") global.switchSection(part);
    global.setTimeout(function () {
      var group = groupForQuestion(questionNumber);
      var context = group ? resolveClueMapContext({ part: Number(group.part), textId: groupTextId(group) }, false) : null;
      var passage = context && context.target;
      if (!context || !auditClueContext(context, true)) return;
      suspendRenderedClueContext(context.key, context.target);
      if (fullPassageClueMaps.has(context.key) && fullMapIsRendered(context)) {
        noteRenderedClueContext(context);
        focusRenderedEvidence(passage, questionNumber);
        syncPassageClueToolbar(currentMode() === "study" || (currentMode() === "test" && Boolean(config.state.isTestSubmitted())));
        return;
      }
      fullPassageClueMaps.delete(context.key);
      clearEvidence(passage);
      var evidence = clueTargetFor(questionNumber);
      var walker = global.document.createTreeWalker(passage, global.NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return global.NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest("mark,button,input,select,textarea")) return global.NodeFilter.FILTER_REJECT;
        return global.NodeFilter.FILTER_ACCEPT;
      } });
      var found = null;
      var node;
      while ((node = walker.nextNode())) { var index = node.nodeValue.indexOf(evidence); if (index !== -1) { found = { node: node, index: index }; break; } }
      if (!found) {
        disableClueContext(context, "configured clue target could not be located");
        return;
      }
      var range = global.document.createRange();
      range.setStart(found.node, found.index);
      range.setEnd(found.node, found.index + evidence.length);
      var mark = el("mark", "reading-shell-evidence-highlight");
      mark.setAttribute("data-reading-shell-evidence-text", evidence);
      mark.setAttribute("data-reading-shell-clue-questions", sharedEvidenceQuestions(evidence, part, questionNumber).join(" "));
      try { range.surroundContents(mark); } catch (error) {
        disableClueContext(context, hasOwn(config && config.study, "clueTargets") ?
          "configured clue target could not be rendered" :
          "configured evidence could not be rendered");
        return;
      }
      sharedEvidenceQuestions(evidence, part, questionNumber).forEach(function (relatedQuestion) { mark.append(evidenceBadge(relatedQuestion)); });
      noteRenderedClueContext(context);
      focusRenderedEvidence(passage, questionNumber);
      syncPassageClueToolbar(currentMode() === "study" || (currentMode() === "test" && Boolean(config.state.isTestSubmitted())));
    }, 90);
  }

  function showGroup(group) {
    if (!detailedReviewAvailable()) return;
    var control = taskControls.find(function (item) { return item.group.id === group.id; });
    if (!control) return;
    var official = officialReviewAvailable();
    control.result.textContent = official ? scoreText(rangeScore(group)) + " / " + group.questions.length + " correct" : "";
    control.result.hidden = !officialReviewAvailable();
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
    if (currentMode() !== "study" || !detailedReviewAvailable()) {
      var unavailable = taskControls.find(function (item) { return item.group.id === group.id; });
      if (unavailable) {
        unavailable.revealButton.hidden = true;
        unavailable.revealButton.disabled = true;
      }
      return;
    }
    if (revealedGroups.has(group.id)) hideGroup(group); else showGroup(group);
  }
  function revealAll() { taskGroups().forEach(function (group) { if (!revealedGroups.has(group.id)) showGroup(group); }); }
  function refreshAllGroups() { taskGroups().forEach(showGroup); }

  function syncTaskFeedback() {
    var inStudy = currentMode() === "study";
    var afterTest = currentMode() === "test" && Boolean(config.state.isTestSubmitted());
    var reviewComplete = detailedReviewAvailable();
    var showStrategies = capabilities.hasTaskStrategies && (inStudy || afterTest);
    var showReveal = capabilities.hasQuestionDetails && inStudy && reviewComplete;
    taskControls.forEach(function (control) {
      control.strategyButton.hidden = !showStrategies;
      control.strategyButton.disabled = !showStrategies;
      control.revealButton.hidden = !showReveal;
      control.revealButton.disabled = !showReveal;
      if (!showStrategies) {
        control.result.hidden = true;
        control.panel.hidden = true;
        control.strategyButton.setAttribute("aria-expanded", "false");
      }
    });
  }
  function syncLegacyInlineAnswers() {
    var hideLegacyAnswers = fullReviewAvailable();
    global.document.querySelectorAll('.correct-answer-text[id^="ca-"]').forEach(function (answer) { answer.hidden = hideLegacyAnswers; });
  }
  function buildTaskFeedbackControls() {
    global.document.querySelectorAll(".reading-shell-study-controls,.reading-shell-study-result,.reading-shell-study-panel").forEach(function (node) { node.remove(); });
    taskControls = [];
    revealedGroups.clear();
    if (!capabilities.hasTaskStrategies && !capabilities.hasQuestionDetails) return;
    taskGroups().forEach(function (group) {
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
      panel.innerHTML = capabilities.hasTaskStrategies ? strategyMarkup(group) : "";
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
    if (global.document.getElementById("reading-shell-feedback-styles")) return;
    var style = global.document.createElement("style");
    style.id = "reading-shell-feedback-styles";
    style.textContent = ".reading-shell-root{align-items:center;display:flex;flex-wrap:wrap;gap:6px}.reading-shell-score-guide-button,.reading-shell-answer-key-button{background:var(--bg);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;padding:5px 10px;white-space:nowrap}.reading-shell-score-guide-button:hover,.reading-shell-score-guide-button:focus-visible,.reading-shell-answer-key-button:hover,.reading-shell-answer-key-button:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.reading-shell-score-guide-backdrop,.reading-shell-answer-key-backdrop,.reading-shell-score-feedback-backdrop{align-items:center;background:rgba(15,23,42,.62);display:flex;inset:0;justify-content:center;padding:18px;position:fixed;z-index:1700}.reading-shell-score-guide-backdrop[hidden],.reading-shell-answer-key-backdrop[hidden],.reading-shell-score-feedback-backdrop[hidden],.correct-answer-text[hidden]{display:none!important}.reading-shell-score-guide-dialog,.reading-shell-answer-key-dialog,.reading-shell-score-feedback-dialog{background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-soft);color:var(--text);display:flex;flex-direction:column;max-height:88vh;overflow:hidden;padding:22px;width:min(680px,96vw)}.reading-shell-answer-key-dialog{width:min(760px,96vw)}.reading-shell-score-guide-header,.reading-shell-answer-key-header,.reading-shell-score-feedback-header{align-items:flex-start;display:flex;gap:16px;justify-content:space-between;margin-bottom:12px}.reading-shell-score-guide-title,.reading-shell-answer-key-title,.reading-shell-score-feedback-title{font-size:1.25rem;margin:0 0 4px}.reading-shell-score-guide-intro,.reading-shell-answer-key-intro,.reading-shell-score-feedback-intro{color:var(--text-soft);margin:0}.reading-shell-score-guide-close,.reading-shell-answer-key-close,.reading-shell-score-feedback-close{background:var(--bg-secondary);border:1px solid var(--border);border-radius:999px;color:var(--text);cursor:pointer;flex:0 0 auto;font:inherit;font-size:1.2rem;height:32px;line-height:1;padding:0;width:32px}.reading-shell-score-guide-summary{font-weight:800;margin:0 0 12px}.reading-shell-score-guide-scroll,.reading-shell-answer-key-scroll,.reading-shell-score-feedback-body{min-height:0;overflow:auto}.reading-shell-score-guide-table{border-collapse:collapse;width:100%}.reading-shell-score-guide-heading,.reading-shell-score-guide-cell{border-bottom:1px solid var(--border);padding:9px;text-align:left}.reading-shell-current-score-row .reading-shell-score-guide-cell{background:color-mix(in srgb,#bbf7d0 48%,var(--bg));border-bottom-color:color-mix(in srgb,#15803d 40%,var(--border))}.reading-shell-current-score-label{background:color-mix(in srgb,#dcfce7 74%,var(--bg));border:1px solid color-mix(in srgb,#15803d 45%,var(--border));border-radius:999px;color:color-mix(in srgb,#166534 78%,var(--text));display:inline-flex;font-size:.78rem;font-weight:800;margin-left:8px;padding:2px 7px;white-space:nowrap}.reading-shell-answer-key-grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}.reading-shell-answer-key-section{border:1px solid var(--border);border-radius:12px;min-width:0;overflow:hidden}.reading-shell-answer-key-section-title{background:var(--bg-secondary);border-bottom:1px solid var(--border);font-size:.95rem;margin:0;padding:9px 10px}.reading-shell-answer-key-list{display:grid}.reading-shell-answer-key-item{align-items:center;background:var(--bg);border:0;border-bottom:1px solid var(--border);color:var(--text);cursor:pointer;display:grid;font:inherit;gap:8px;grid-template-columns:2.2rem minmax(0,1fr);padding:8px 10px;text-align:left;width:100%}.reading-shell-answer-key-item:hover{background:var(--bg-secondary)}.reading-shell-answer-key-number{color:var(--text-soft);font-weight:800}.reading-shell-answer-key-answer{font-weight:700;overflow-wrap:anywhere}.reading-shell-score-feedback-button{appearance:none;background:transparent;border:0;border-radius:6px;color:var(--text);cursor:pointer;font:inherit;font-weight:700;margin-left:12px;padding:2px 4px;white-space:nowrap}.reading-shell-score-feedback-button:hover,.reading-shell-score-feedback-button:focus-visible{background:rgba(227,24,55,.08);color:#e31837;outline:2px solid transparent}.reading-shell-score-feedback-body{display:grid;gap:16px;padding-right:5px}.reading-shell-score-feedback-card{border:1px solid var(--border);border-radius:12px;padding:14px}.reading-shell-score-feedback-heading{margin:0 0 8px}.reading-shell-score-feedback-subheading{margin:10px 0 6px}.reading-shell-score-feedback-text,.reading-shell-score-feedback-part-score{margin:6px 0}.reading-shell-score-feedback-part-score{font-weight:800}.reading-shell-study-controls{align-items:center;display:inline-flex;gap:8px;margin:8px 0 0}.reading-shell-study-icon-button{align-items:center;background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;display:inline-flex;font:inherit;font-weight:800;height:30px;justify-content:center;padding:0;width:30px}.reading-shell-study-reveal-button{background:var(--accent-soft);border:1px solid var(--accent);border-radius:999px;color:var(--accent);cursor:pointer;font:inherit;font-size:.84rem;font-weight:800;padding:6px 11px}.reading-shell-study-icon-button:hover,.reading-shell-study-icon-button:focus-visible,.reading-shell-study-reveal-button:hover,.reading-shell-study-reveal-button:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent);outline:2px solid transparent}.reading-shell-study-result{color:var(--text);font-size:.88rem;font-weight:800;margin:10px 0 0}.reading-shell-study-panel{background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;margin:10px 0 12px;padding:13px}.reading-shell-study-panel h3{font-size:1rem;margin:0 0 7px}.reading-shell-study-panel p{margin:6px 0}.reading-shell-study-strategy-grid{display:grid;gap:8px;margin-top:12px}.reading-shell-study-step,.reading-shell-study-trap{background:var(--bg);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:9px;padding:9px 10px}.reading-shell-study-trap{border-left-color:var(--correct)}.reading-shell-study-step-label{align-items:center;display:flex;font-size:.82rem;font-weight:800;gap:6px}.reading-shell-study-chip{align-items:center;background:var(--accent);border-radius:999px;color:#fff;display:inline-flex;font-size:.76rem;height:18px;justify-content:center;width:18px}.reading-shell-study-trap .reading-shell-study-chip{background:var(--correct)}.reading-shell-study-feedback-card{border:1px solid var(--border);border-radius:12px;margin-top:10px;padding:13px}.reading-shell-study-feedback-correct{background:color-mix(in srgb,#dcfce7 45%,var(--bg));border-color:color-mix(in srgb,#15803d 48%,var(--border))}.reading-shell-study-feedback-incorrect{background:color-mix(in srgb,#fee2e2 42%,var(--bg));border-color:color-mix(in srgb,#dc2626 42%,var(--border))}.reading-shell-study-feedback-unanswered{background:var(--bg-secondary)}.reading-shell-study-feedback-card h4{margin:0 0 10px}.reading-shell-study-feedback-card dl{display:grid;gap:3px;margin:0}.reading-shell-study-feedback-card dt{font-size:.8rem;font-weight:800;margin-top:7px}.reading-shell-study-feedback-card dd{margin:0}.reading-shell-study-status-correct{color:var(--correct);font-weight:800}.reading-shell-study-status-incorrect{color:var(--incorrect);font-weight:800}.reading-shell-study-status-unanswered{color:var(--text-soft);font-weight:800}.reading-shell-study-clue-row{display:flex;justify-content:flex-end;margin-top:10px}.reading-shell-study-clue-button{align-items:center;background:color-mix(in srgb,#dcfce7 56%,var(--bg));border:1px solid color-mix(in srgb,#15803d 55%,var(--border));border-radius:999px;color:color-mix(in srgb,#15803d 75%,var(--text));cursor:pointer;display:inline-flex;height:30px;justify-content:center;width:30px}.reading-shell-evidence-highlight{background:color-mix(in srgb,#bbf7d0 58%,var(--bg));border-radius:5px;box-shadow:0 0 0 1px color-mix(in srgb,#15803d 36%,transparent);padding:1px 2px}.reading-shell-evidence-focus{box-shadow:0 0 0 4px color-mix(in srgb,#bbf7d0 65%,transparent);outline:3px solid color-mix(in srgb,#16a34a 70%,var(--accent));outline-offset:2px}.reading-shell-clue-badge{background:#14532d;border:1px solid #14532d;border-radius:999px;color:#fff;cursor:pointer;font-size:.78em;font-weight:800;height:1.35em;margin-left:4px;min-width:1.35em;padding:0}.reading-shell-question-focus{border-radius:12px;outline:3px solid color-mix(in srgb,var(--accent) 70%,#16a34a);outline-offset:3px}@media(max-width:820px){.reading-shell-answer-key-grid{grid-template-columns:1fr}.reading-shell-score-feedback-button{margin-left:6px}.reading-shell-study-controls{flex-wrap:wrap}}";
    global.document.head.append(style);
  }

  function buildUi() {
    var mount = global.document.getElementById("readingFeatureShellMount");
    if (!mount) { lastError = "ReadingFeatureShell mount was not found."; reportErrorOnce(lastError); return false; }
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
    var scoreGuide = capabilities.hasScoreGuide ? buildScoreGuide() : null;
    var answerKey = buildAnswerKey();
    var scoreFeedback = buildScoreFeedback();
    root.append(scoreGuideButton, answerKeyButton, studyPill, timer);
    if (scoreGuide) root.append(scoreGuide.backdrop);
    root.append(answerKey.backdrop, scoreFeedback.backdrop);
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
    elements = { root: root, scoreGuideButton: scoreGuideButton, answerKeyButton: answerKeyButton, studyPill: studyPill, timer: timer, timerValue: timerValue, scoreGuideBackdrop: scoreGuide && scoreGuide.backdrop, scoreGuideClose: scoreGuide && scoreGuide.close, scoreGuideSummary: scoreGuide && scoreGuide.summary, scoreGuideBody: scoreGuide && scoreGuide.body, answerKeyBackdrop: answerKey.backdrop, answerKeyClose: answerKey.close, scoreFeedbackButton: scoreFeedbackButton, scoreFeedbackBackdrop: scoreFeedback.backdrop, scoreFeedbackClose: scoreFeedback.close, scoreFeedbackBody: scoreFeedback.body };
    buildTaskFeedbackControls();
    return true;
  }

  function updateReviewFromOverlay() {
    var overlay = global.document.getElementById("resultsOverlay");
    var allowDomResult = Boolean(config && config.compatibility && config.compatibility.allowDomSubmittedResult);
    var isOpen = Boolean(allowDomResult && overlay && String(overlay.style.display || "") === "flex" && parsedResult());
    var studyReviewJustSubmitted = currentMode() === "study" && isOpen && !reviewOverlayWasOpen;
    if (studyReviewJustSubmitted) {
      studyReviewSubmitted = true;
      domSubmissionSequence += 1;
    }
    reviewOverlayWasOpen = isOpen;
    return studyReviewJustSubmitted;
  }
  function observeResults() {
    var overlay = global.document.getElementById("resultsOverlay");
    if (!overlay || resultObserver || !global.MutationObserver) return;
    resultObserver = new global.MutationObserver(function () { global.setTimeout(sync, 0); });
    resultObserver.observe(overlay, { attributes: true, attributeFilter: ["style"] });
  }

  function syncPassageClueToolbar(showToolbar) {
    if (!global.document || typeof global.document.getElementById !== "function") return;
    var toolbar = global.document.getElementById("passageClueToolbar");
    var toggle = global.document.getElementById("passageClueToggle");
    if (!toolbar || !toggle) return;
    var activeContext = showToolbar ? resolveClueMapContext(null, false) : null;
    var activeState = activeContext && ensureClueContextState(activeContext);
    showToolbar = Boolean(showToolbar && activeState && activeState.available !== false);
    toolbar.hidden = !showToolbar;
    toggle.hidden = !showToolbar;
    toggle.disabled = !showToolbar;
    toggle.setAttribute("aria-hidden", showToolbar ? "false" : "true");
    var fullMapVisible = Boolean(showToolbar && activeContext &&
      fullPassageClueMaps.has(activeContext.key) && fullMapIsRendered(activeContext));
    toggle.setAttribute("aria-pressed", String(fullMapVisible));
    toggle.textContent = fullMapVisible ? "Hide all passage clues" : "Show all passage clues";
  }

  function bindPassageClueToolbar() {
    var toggle = global.document.getElementById("passageClueToggle");
    if (!toggle || toggle.getAttribute("data-reading-shell-toolbar-bound") === "true") return;
    toggle.setAttribute("data-reading-shell-toolbar-bound", "true");
    toggle.addEventListener("click", function () {
      if (toggle.hidden || toggle.disabled) return;
      var activeContext = resolveClueMapContext(null, true);
      if (!activeContext) return;
      if (fullPassageClueMaps.has(activeContext.key) && fullMapIsRendered(activeContext)) hideAllPassageClues(activeContext);
      else showAllPassageClues(activeContext);
      syncPassageClueToolbar(true);
    });
  }
  function syncActiveClueContext(context, canReview) {
    var nextKey = context ? context.key : null;
    var nextTarget = context ? context.target : null;
    var changed = nextKey !== lastActiveClueMapKey || nextTarget !== lastActiveClueTarget;
    suspendRenderedClueContext(nextKey, nextTarget);
    if (changed) {
      if (lastActiveClueTarget && lastActiveClueTarget !== nextTarget) clearEvidence(lastActiveClueTarget);
      lastActiveClueMapKey = nextKey;
      lastActiveClueTarget = nextTarget;
    }
    if (!context || !canReview) return false;
    var state = ensureClueContextState(context);
    var available = changed ? auditClueContext(context, false) : state.available !== false;
    if (available && fullPassageClueMaps.has(context.key)) restoreFullPassageClueMap(context);
    return available;
  }

  function sync() {
    if (!initialized || !elements) return;
    var studyReviewJustSubmitted = updateReviewFromOverlay();
    var mode = currentMode();
    var studyMode = mode === "study";
    var completedTest = mode === "test" && Boolean(config.state.isTestSubmitted());
    var showRoot = studyMode || completedTest;
    var candidate = submittedResult();
    if (studyMode && studyAwaitingFreshSubmission) {
      if (!candidate) {
        studyResetObservedNull = true;
      } else if (!studyResetObservedNull && (blockedStudySubmissionId == null || candidate.submissionId === blockedStudySubmissionId)) {
        candidate = null;
      } else {
        studyAwaitingFreshSubmission = false;
        blockedStudySubmissionId = null;
        studyResetObservedNull = false;
      }
    }
    if (completedTest) {
      if (!finalTestSubmittedResult && candidate) finalTestSubmittedResult = candidate;
      activeSubmittedResult = finalTestSubmittedResult;
    } else if (!candidate) {
      activeSubmittedResult = null;
    } else if (!activeSubmittedResult || candidate.submissionId !== lastSubmissionId) {
      activeSubmittedResult = candidate;
    }
    var result = activeSubmittedResult;
    var hasSubmission = Boolean(result);
    var submissionChanged = hasSubmission && result.submissionId !== lastSubmissionId;
    var learningResources = studyMode || (completedTest && hasSubmission);
    elements.root.hidden = !showRoot;
    elements.root.setAttribute("aria-hidden", showRoot ? "false" : "true");
    elements.scoreGuideButton.hidden = !(showRoot && capabilities.hasScoreGuide);
    elements.answerKeyButton.hidden = !(learningResources && capabilities.hasAnswerKey);
    elements.studyPill.hidden = !studyMode;
    elements.timer.hidden = !studyMode;
    elements.scoreFeedbackButton.hidden = !result;
    elements.scoreFeedbackButton.textContent = result ? result.rawScore + " / " + config.test.totalQuestions + " · Band " + result.band : "";
    var activeClueContext = capabilities.hasPassageClues ? resolveClueMapContext(null, false) : null;
    var cluesAvailable = syncActiveClueContext(activeClueContext, learningResources && capabilities.hasPassageClues);
    syncPassageClueToolbar(learningResources && capabilities.hasPassageClues && cluesAvailable);
    if (!studyMode) { studySessionActive = false; stopStudyTimer(); }
    if (!showRoot) { closeScoreGuide(false); closeAnswerKey(false); closeScoreFeedback(false); }
    if (result && studyMode && submissionChanged) {
      captureSubmittedOutcomes(result);
      if (capabilities.hasQuestionDetails && submittedOutcomes) refreshAllGroups();
    } else if (result && completedTest) {
      if (!submittedOutcomes || submittedOutcomeMode !== "test") captureSubmittedOutcomes(result);
      if (capabilities.hasQuestionDetails && submittedOutcomes) revealAll();
    }
    if (studyMode && capabilities.hasQuestionDetails && !studyLearningResourcesShown) {
      revealAll();
      studyLearningResourcesShown = true;
    }
    if (submissionChanged) lastSubmissionId = result.submissionId;
    syncTaskFeedback();
    syncLegacyInlineAnswers();
    if (elements.scoreGuideBackdrop && !elements.scoreGuideBackdrop.hidden) updateScoreGuide();
    if (!elements.scoreFeedbackBackdrop.hidden) renderScoreFeedback();
  }

  function startStudySession() {
    if (!initialized) return;
    var staleCandidate = activeSubmittedResult || submittedResult();
    blockedStudySubmissionId = staleCandidate ? staleCandidate.submissionId : null;
    studyAwaitingFreshSubmission = true;
    studyResetObservedNull = false;
    studySessionActive = true;
    studyReviewSubmitted = false;
    reviewOverlayWasOpen = false;
    submittedOutcomes = null;
    submittedAnswers = null;
    submittedOutcomeMode = null;
    activeSubmittedResult = null;
    finalTestSubmittedResult = null;
    lastSubmissionId = null;
    domSubmissionSequence = 0;
    compatibleDomSubmittedResult = null;
    studyLearningResourcesShown = false;
    clearAllPassageClueMaps();
    studyElapsedSeconds = 0;
    taskGroups().forEach(hideGroup);
    revealedGroups.clear();
    updateTimer();
    startStudyTimer();
    sync();
  }

  function init(value) {
    var check = validateConfig(value);
    if (!check.ok) { config = null; initialized = false; lastError = check.error; reportErrorOnce(check.error); return { ok: false, error: check.error }; }
    config = value;
    capabilities = check.capabilities;
    check.diagnostics.forEach(reportErrorOnce);
    initialized = true;
    lastError = "";
    studyElapsedSeconds = 0;
    studySessionActive = false;
    studyReviewSubmitted = false;
    reviewOverlayWasOpen = false;
    submittedOutcomes = null;
    submittedAnswers = null;
    submittedOutcomeMode = null;
    activeSubmittedResult = null;
    finalTestSubmittedResult = null;
    lastSubmissionId = null;
    domSubmissionSequence = 0;
    compatibleDomSubmittedResult = null;
    studyAwaitingFreshSubmission = false;
    blockedStudySubmissionId = null;
    studyResetObservedNull = false;
    studyLearningResourcesShown = false;
    clearAllPassageClueMaps();
    auditClueCapability();
    if (!buildUi()) { initialized = false; return { ok: false, error: lastError }; }
    bindPassageClueToolbar();
    observeResults();
    updateTimer();
    sync();
    return { ok: true, initialized: true };
  }
  function getStatus() { return { initialized: initialized, hasConfig: Boolean(config), version: config ? config.version : null, testId: config && config.test ? config.test.id : "", studySessionActive: studySessionActive, studyElapsedSeconds: studyElapsedSeconds, fullPassageClueMapKeys: Array.from(fullPassageClueMaps).sort(), lastError: lastError }; }

  global.ReadingFeatureShell = { init: init, sync: sync, startStudySession: startStudySession, showAllPassageClues: showAllPassageClues, hideAllPassageClues: hideAllPassageClues, getStatus: getStatus, validateConfig: validateConfig };
})(window);
