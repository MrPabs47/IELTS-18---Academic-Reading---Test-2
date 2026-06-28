(function (global) {
  "use strict";

  var validatedConfig = null;
  var initialized = false;
  var lastError = "";

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function hasFunction(container, key) {
    return Boolean(container && typeof container[key] === "function");
  }

  function validatePartRange(range, label) {
    if (!isPlainObject(range)) {
      return "test.partRanges." + label + " must be an object.";
    }
    if (!Number.isInteger(range.from) || !Number.isInteger(range.to)) {
      return "test.partRanges." + label + " must include integer from/to values.";
    }
    if (range.from < 1 || range.to < range.from) {
      return "test.partRanges." + label + " must be a valid question range.";
    }
    return "";
  }

  function validateConfig(config) {
    var requiredParts = ["1", "2", "3"];
    var error = "";

    if (!isPlainObject(config)) {
      error = "ReadingFeatureShell config must be an object.";
    } else if (config.version !== 1) {
      error = "ReadingFeatureShell config.version must be 1.";
    } else if (!isPlainObject(config.test)) {
      error = "ReadingFeatureShell config.test must be an object.";
    } else if (typeof config.test.id !== "string" || !config.test.id.trim()) {
      error = "ReadingFeatureShell config.test.id must be a non-empty string.";
    } else if (typeof config.test.title !== "string" || !config.test.title.trim()) {
      error = "ReadingFeatureShell config.test.title must be a non-empty string.";
    } else if (config.test.totalQuestions !== 40) {
      error = "ReadingFeatureShell config.test.totalQuestions must be 40.";
    } else if (!isPlainObject(config.test.partRanges)) {
      error = "ReadingFeatureShell config.test.partRanges must be an object.";
    } else if (!isPlainObject(config.state)) {
      error = "ReadingFeatureShell config.state must be an object.";
    } else if (!hasFunction(config.state, "getMode")) {
      error = "ReadingFeatureShell config.state.getMode must be a function.";
    } else if (!hasFunction(config.state, "isTestSubmitted")) {
      error = "ReadingFeatureShell config.state.isTestSubmitted must be a function.";
    } else if (!hasFunction(config.state, "getActivePart")) {
      error = "ReadingFeatureShell config.state.getActivePart must be a function.";
    } else if (!isPlainObject(config.answers) || !hasFunction(config.answers, "getAnswerKeyDisplay")) {
      error = "ReadingFeatureShell config.answers.getAnswerKeyDisplay must be a function.";
    } else if (!isPlainObject(config.navigation) || !hasFunction(config.navigation, "getQuestionTarget")) {
      error = "ReadingFeatureShell config.navigation.getQuestionTarget must be a function.";
    }

    if (!error) {
      for (var i = 0; i < requiredParts.length; i += 1) {
        error = validatePartRange(config.test.partRanges[requiredParts[i]], requiredParts[i]);
        if (error) break;
      }
    }

    return {
      ok: !error,
      error: error
    };
  }

  function init(config) {
    var validation = validateConfig(config);
    if (!validation.ok) {
      validatedConfig = null;
      initialized = false;
      lastError = validation.error;
      global.console.warn("ReadingFeatureShell: " + validation.error);
      return {
        ok: false,
        error: validation.error
      };
    }

    validatedConfig = config;
    initialized = true;
    lastError = "";

    return {
      ok: true,
      initialized: true
    };
  }

  function getStatus() {
    return {
      initialized: initialized,
      hasConfig: Boolean(validatedConfig),
      version: validatedConfig ? validatedConfig.version : null,
      testId: validatedConfig && validatedConfig.test ? validatedConfig.test.id : "",
      lastError: lastError
    };
  }

  global.ReadingFeatureShell = {
    init: init,
    getStatus: getStatus,
    validateConfig: validateConfig
  };
})(window);
