(function () {
  "use strict";

  var toastTimer = null;

  function isVisible(node) {
    if (!node) return false;
    var style = window.getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function installStyles() {
    if (document.getElementById("gt-reading-runtime-styles")) return;
    var style = document.createElement("style");
    style.id = "gt-reading-runtime-styles";
    style.textContent =
      ".logo.home-link{cursor:pointer!important;user-select:none}" +
      ".logo.home-link:focus-visible{border-radius:4px;outline:2px solid var(--accent);outline-offset:4px}" +
      "#shortcutToast{background:rgba(17,24,39,.96);border:1px solid rgba(255,255,255,.18);border-radius:999px;bottom:82px;color:#fff;font-size:.9rem;font-weight:700;left:50%;max-width:min(92vw,520px);opacity:0;padding:10px 16px;pointer-events:none;position:fixed;text-align:center;transform:translate(-50%,12px);transition:opacity .16s ease,transform .16s ease;visibility:hidden;z-index:2400}" +
      "#shortcutToast.visible{opacity:1;transform:translate(-50%,0);visibility:visible}" +
      ".drag-item.passage-match-source{cursor:grab}" +
      ".passage-heading-source{align-items:flex-start;background:color-mix(in srgb,var(--bg) 94%,var(--bg-secondary));border:1px solid var(--border);border-radius:7px;color:var(--text);display:flex;font:inherit;font-weight:700;gap:8px;line-height:1.35;margin:14px 0 6px;padding:6px 9px;text-align:left;width:100%}" +
      ".passage-heading-source:hover,.passage-heading-source.selected,.passage-heading-source:focus-visible{background:var(--accent-soft);border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent);outline:none}" +
      ".passage-heading-source.is-dragging{opacity:.68}" +
      ".passage-heading-letter{flex:0 0 auto;font-weight:800}" +
      ".passage-heading-wording{min-width:0}" +
      ".passage-heading-body{margin-top:0!important}" +
      ".passage-heading-source.passage-paragraph-source{align-items:center;display:inline-flex;justify-content:center;margin:14px 0 4px;min-height:30px;padding:4px 10px;width:42px}" +
      ".passage-paragraph-body{margin-top:0!important}" +
      ".gt-test3-header-left{min-width:0;flex:1 1 auto;white-space:nowrap;overflow:hidden}" +
      ".gt-test3-header-left .test-title,.gt-test3-header-left #candidateNameDisplay{font-size:.95rem;color:var(--text-soft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".gt-test3-header-left .test-title{flex:0 1 auto}" +
      ".gt-test3-header-left #candidateNameDisplay{display:none;max-width:min(24vw,260px);flex:0 1 auto}" +
      ".gt-test3-header-right{gap:12px;min-width:0;flex:0 0 auto;white-space:nowrap}" +
      "@media (max-width:980px){.gt-test3-header-left{gap:10px}.gt-test3-header-right{gap:8px}.gt-test3-header-left #candidateNameDisplay{max-width:18vw}}" +
      "body[data-gt-mode=test] .reading-shell-study-controls{display:none!important}" +
      ".passage-heading-drop-zone{justify-content:flex-start;line-height:1.3;max-width:100%;text-align:left;white-space:normal}" +
      ".passage-heading-drop-zone:not(.filled){color:var(--text-soft);font-size:.84rem;font-weight:600;height:30px;min-height:30px;width:104px}" +
      ".passage-heading-drop-zone.filled{font-weight:700;height:auto;min-height:38px;width:min(100%,430px)}" +
      ".drag-item.passage-match-source:focus-visible,.drop-zone:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
      ".drag-item.passage-match-source.reading-shell-locked,.drop-zone.reading-shell-locked{cursor:not-allowed;opacity:.72}";
    document.head.appendChild(style);
  }

  function installLogoHomeLink() {
    var logo = document.querySelector(".top-left .logo");
    if (!logo) return;

    logo.classList.add("home-link");
    logo.setAttribute("role", "link");
    if (!logo.hasAttribute("tabindex")) logo.setAttribute("tabindex", "0");
    if (!logo.getAttribute("title")) logo.setAttribute("title", "Return to home");
    if (!logo.getAttribute("aria-label")) logo.setAttribute("aria-label", "Return to IELTS Pabs home");

    if (logo.getAttribute("data-home-link-ready") === "true" || logo.getAttribute("data-gt-runtime-keyboard") === "true") return;
    logo.setAttribute("data-gt-runtime-keyboard", "true");
    logo.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      logo.click();
    });
  }

  function ensureShortcutToast() {
    var toast = document.getElementById("shortcutToast");
    if (toast) return toast;
    toast = document.createElement("div");
    toast.id = "shortcutToast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
    document.body.appendChild(toast);
    return toast;
  }

  function showShortcutToast(message) {
    var toast = ensureShortcutToast();
    toast.textContent = message;
    toast.classList.add("visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 1800);
  }

  function isActiveTestAttempt() {
    var app = document.getElementById("app");
    var timer = document.getElementById("timerContainer");
    var submit = document.getElementById("primarySubmitBtn") ||
      document.querySelector('.check-btn[onclick*="handlePrimarySubmit"]') ||
      document.querySelector('.submit-button[onclick*="handlePrimarySubmit"]');
    var submitted = Boolean(submit && (
      submit.disabled ||
      submit.getAttribute("aria-disabled") === "true" ||
      /submitted/i.test(submit.textContent || "")
    ));
    return isVisible(app) && isVisible(timer) && timer.getAttribute("aria-hidden") !== "true" && !submitted;
  }

  function installFindShortcutGuard() {
    if (document.documentElement.getAttribute("data-gt-find-guard") === "true") return;
    document.documentElement.setAttribute("data-gt-find-guard", "true");
    ensureShortcutToast();

    document.addEventListener("keydown", function (event) {
      var isFindShortcut = (event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "f";
      if (!isFindShortcut || !isActiveTestAttempt()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showShortcutToast("Find (CTRL + F) is disabled in Test mode.");
    }, true);
  }

  function isTest3Page() {
    return /Reading Test 3/i.test(document.title || "") && /General Training/i.test(document.title || "");
  }

  function ensureTest3CandidateName() {
    if (!isTest3Page()) return null;
    var topLeft = document.querySelector(".top-left");
    var topRight = document.querySelector(".top-right");
    if (!topLeft) return null;
    topLeft.classList.add("gt-test3-header-left");
    if (topRight) topRight.classList.add("gt-test3-header-right");

    var title = topLeft.querySelector(".test-title");
    if (title) title.textContent = "IELTS 19 General Training Reading Test 3";
    document.title = "IELTS 19 General Training Reading Test 3 | IELTS Pabs";

    var existing = document.getElementById("candidateNameDisplay") || document.getElementById("testCandidateName");
    if (existing) {
      existing.id = "candidateNameDisplay";
      existing.classList.remove("test-candidate-name");
      if (title && existing.previousElementSibling !== title) title.insertAdjacentElement("afterend", existing);
      return existing;
    }

    var candidate = document.createElement("div");
    candidate.id = "candidateNameDisplay";
    candidate.hidden = true;
    candidate.setAttribute("aria-live", "polite");
    if (title) title.insertAdjacentElement("afterend", candidate);
    else topLeft.appendChild(candidate);
    return candidate;
  }

  function syncTest3ModeUi() {
    if (!isTest3Page() || !document.body) return;
    var currentMode = typeof mode === "string" ? mode : "";
    document.body.setAttribute("data-gt-mode", currentMode);
    var candidate = ensureTest3CandidateName();
    if (candidate) {
      var name = typeof studentName === "string" ? studentName.trim() : "";
      var showCandidate = currentMode === "test" && Boolean(name);
      candidate.textContent = name ? "Candidate: " + name : "";
      candidate.title = name ? "Candidate: " + name : "";
      candidate.hidden = !showCandidate;
      candidate.style.display = showCandidate ? "block" : "none";
    }
    document.querySelectorAll(".reading-shell-study-controls").forEach(function (controls) {
      var hideForTest = currentMode === "test";
      controls.hidden = hideForTest;
      controls.style.display = hideForTest ? "none" : "";
      controls.setAttribute("aria-hidden", hideForTest ? "true" : "false");
    });
  }

  function installTest3ModeUi() {
    if (!isTest3Page() || document.documentElement.getAttribute("data-gt-mode-ui") === "true") return;
    document.documentElement.setAttribute("data-gt-mode-ui", "true");
    var originalStartTest = window.startTest;
    if (typeof originalStartTest === "function") {
      window.startTest = function () {
        var result = originalStartTest.apply(this, arguments);
        window.setTimeout(syncTest3ModeUi, 0);
        return result;
      };
    }
    new MutationObserver(function () {
      window.setTimeout(syncTest3ModeUi, 0);
    }).observe(document.body, { childList: true, subtree: true });
    syncTest3ModeUi();
  }

  function parseBankRange(bank) {
    var label = bank.getAttribute("aria-label") || "";
    var match = label.match(/questions?\s+(\d+)\s+(?:to|–|-)\s+(\d+)/i);
    if (!match) return null;
    return { from: Number(match[1]), to: Number(match[2]) };
  }

  function normalPassageHeadingText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function passageHeadingParagraphs(parent) {
    if (!parent) return [];
    return Array.from(parent.children).filter(function (node) {
      return node.tagName === "P" && node.firstElementChild && node.firstElementChild.tagName === "STRONG";
    });
  }

  function installTest3DragMatching() {
    if (!isTest3Page() || document.documentElement.getAttribute("data-gt-drag-upgrade") === "true") return;

    var sectionOne = document.querySelector('.passage-section[data-section="1"]');
    var sectionThree = document.querySelector('.passage-section[data-section="3"]');
    var banks = Array.from(document.querySelectorAll('.drag-bank')).filter(function (bank) {
      var range = parseBankRange(bank);
      return range && (
        (range.from === 1 && range.to === 8) ||
        (range.from === 9 && range.to === 14) ||
        (range.from === 33 && range.to === 36)
      );
    });
    var allHeadingParagraphs = sectionOne ? Array.from(sectionOne.querySelectorAll("p")).filter(function (node) {
      return node.firstElementChild && node.firstElementChild.tagName === "STRONG";
    }) : [];
    var sectionThreeParagraphs = sectionThree ? Array.from(sectionThree.children).filter(function (node) {
      var strong = node.tagName === "P" && node.firstElementChild && node.firstElementChild.tagName === "STRONG" ? node.firstElementChild : null;
      return strong && /^[A-G]$/.test(normalPassageHeadingText(strong.textContent));
    }) : [];
    var groups = [
      { range: { from: 1, to: 8 }, paragraphs: allHeadingParagraphs.slice(0, 5) },
      { range: { from: 9, to: 14 }, paragraphs: allHeadingParagraphs.slice(5, 9) },
      { range: { from: 33, to: 36 }, paragraphs: sectionThreeParagraphs.slice(0, 7) }
    ];

    if (
      !sectionOne || !sectionThree || banks.length < 3 ||
      groups[0].paragraphs.length !== 5 ||
      groups[1].paragraphs.length !== 4 ||
      groups[2].paragraphs.length !== 7
    ) return;

    document.documentElement.setAttribute("data-gt-drag-upgrade", "true");
    var bankRecords = [];
    var selectedByBank = new Map();
    var activeDrag = null;

    groups.forEach(function (group, index) {
      var bank = banks.find(function (candidate) {
        var range = parseBankRange(candidate);
        return range && range.from === group.range.from && range.to === group.range.to;
      }) || banks[index];
      if (!bank) return;

      var id = "gt-passage-source-group-" + (index + 1);
      var sources = [];

      group.paragraphs.forEach(function (paragraph) {
        var strong = paragraph.firstElementChild;
        var rawLabel = normalPassageHeadingText(strong && strong.textContent);
        var headingMatch = rawLabel.match(/^([A-Z])\s+(.+)$/);
        var paragraphMatch = rawLabel.match(/^([A-Z])$/);
        if (!headingMatch && !paragraphMatch) return;

        var value = headingMatch ? headingMatch[1] : paragraphMatch[1];
        var title = headingMatch ? headingMatch[2] : "";
        var sourceLabel = headingMatch ? rawLabel : value;
        var source = document.createElement("button");
        source.type = "button";
        source.className = "drag-item passage-match-source passage-heading-source" + (paragraphMatch ? " passage-paragraph-source" : "");
        source.draggable = true;
        source.setAttribute("data-value", value);
        source.setAttribute("data-source-label", sourceLabel);
        source.setAttribute("data-gt-drag-bank", id);
        source.setAttribute("aria-label", "Choose " + sourceLabel + " for Questions " + group.range.from + " to " + group.range.to);
        source.setAttribute("aria-pressed", "false");

        var letter = document.createElement("span");
        letter.className = "passage-heading-letter";
        letter.textContent = value;
        source.appendChild(letter);
        if (title) {
          var wording = document.createElement("span");
          wording.className = "passage-heading-wording";
          wording.textContent = title;
          source.appendChild(wording);
        }

        paragraph.parentNode.insertBefore(source, paragraph);
        strong.remove();
        if (paragraph.firstChild && paragraph.firstChild.nodeType === Node.TEXT_NODE) {
          paragraph.firstChild.nodeValue = paragraph.firstChild.nodeValue.replace(/^\s+/, "");
        }
        paragraph.classList.add(paragraphMatch ? "passage-paragraph-body" : "passage-heading-body");
        sources.push(source);
      });

      if (!sources.length) return;
      bankRecords.push({ id: id, bank: bank, range: group.range, sources: sources });

      var sourceLabels = new Set(sources.map(function (source) {
        return normalPassageHeadingText(source.getAttribute("data-source-label"));
      }));
      var sibling = bank.previousElementSibling;
      while (sibling && sibling.tagName === "P") {
        var previous = sibling.previousElementSibling;
        if (!sourceLabels.has(normalPassageHeadingText(sibling.textContent))) break;
        sibling.hidden = true;
        sibling.classList.add("passage-option-list-hidden");
        sibling = previous;
      }

      bank.hidden = true;
      bank.style.display = "none";
      bank.setAttribute("aria-hidden", "true");
    });

    function recordForQuestion(questionNumber) {
      return bankRecords.find(function (record) {
        return questionNumber >= record.range.from && questionNumber <= record.range.to;
      }) || null;
    }

    function recordForNode(node) {
      var id = node && node.getAttribute && node.getAttribute("data-gt-drag-bank");
      return bankRecords.find(function (record) { return record.id === id; }) || null;
    }

    function sourceForValue(record, value) {
      return record && record.sources.find(function (source) {
        return source.getAttribute("data-value") === value;
      });
    }

    function zoneQuestion(zone) {
      return Number(String(zone.getAttribute("data-for") || "").replace(/^q/, ""));
    }

    function selectForZone(zone) {
      return document.querySelector('select[name="' + zone.getAttribute("data-for") + '"]');
    }

    function locked(node, select) {
      return Boolean(
        (select && select.disabled) ||
        (node && node.classList.contains("reading-shell-locked")) ||
        (node && node.getAttribute("aria-disabled") === "true")
      );
    }

    function clearSelections() {
      selectedByBank.clear();
      document.querySelectorAll(".passage-heading-source.selected").forEach(function (source) {
        source.classList.remove("selected");
        source.setAttribute("aria-pressed", "false");
      });
    }

    function choose(source) {
      var record = recordForNode(source);
      if (!record || locked(source, null)) return false;
      clearSelections();
      selectedByBank.set(record.id, source.getAttribute("data-value"));
      source.classList.add("selected");
      source.setAttribute("aria-pressed", "true");
      return true;
    }

    function apply(zone, value, sourceRecord) {
      var question = zoneQuestion(zone);
      var targetRecord = recordForQuestion(question);
      var select = selectForZone(zone);
      if (!targetRecord || !select || locked(zone, select)) return false;
      if (sourceRecord && sourceRecord.id !== targetRecord.id) return false;
      var allowed = Array.from(select.options).some(function (option) { return option.value === value; });
      if (!allowed) return false;

      var source = sourceForValue(targetRecord, value);
      var label = source ? source.getAttribute("data-source-label") : value;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      zone.textContent = label;
      zone.setAttribute("data-answer-value", value);
      zone.classList.add("filled", "passage-heading-drop-zone");
      zone.setAttribute("aria-label", label + " selected for Question " + question + ". Press Delete to clear.");
      clearSelections();
      return true;
    }

    function clear(zone) {
      var question = zoneQuestion(zone);
      var select = selectForZone(zone);
      if (!select || locked(zone, select)) return false;
      select.value = "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      zone.textContent = "Drop here";
      zone.removeAttribute("data-answer-value");
      zone.classList.remove("filled", "over");
      zone.setAttribute("aria-label", "Answer box for question " + question);
      clearSelections();
      return true;
    }

    document.addEventListener("dragstart", function (event) {
      var source = event.target.closest && event.target.closest(".passage-heading-source[data-gt-drag-bank]");
      if (!source) return;
      event.stopImmediatePropagation();
      if (!choose(source)) {
        event.preventDefault();
        return;
      }
      var record = recordForNode(source);
      activeDrag = { record: record, value: source.getAttribute("data-value") };
      source.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", activeDrag.value);
        event.dataTransfer.setData("application/x-gt-reading-bank", record.id);
      }
    }, true);

    document.addEventListener("dragend", function (event) {
      var source = event.target.closest && event.target.closest(".passage-heading-source[data-gt-drag-bank]");
      if (!source) return;
      event.stopImmediatePropagation();
      source.classList.remove("is-dragging");
      activeDrag = null;
      document.querySelectorAll(".drop-zone.over").forEach(function (zone) { zone.classList.remove("over"); });
    }, true);

    document.addEventListener("dragover", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      var targetRecord = recordForQuestion(zoneQuestion(zone));
      var select = selectForZone(zone);
      if (!activeDrag || !targetRecord || activeDrag.record.id !== targetRecord.id || locked(zone, select)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zone.classList.add("over");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    }, true);

    document.addEventListener("dragleave", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      event.stopImmediatePropagation();
      zone.classList.remove("over");
    }, true);

    document.addEventListener("drop", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zone.classList.remove("over");
      var bankId = event.dataTransfer && event.dataTransfer.getData("application/x-gt-reading-bank");
      var value = event.dataTransfer && event.dataTransfer.getData("text/plain");
      var sourceRecord = bankRecords.find(function (record) { return record.id === bankId; }) || (activeDrag && activeDrag.record);
      apply(zone, value || (activeDrag && activeDrag.value), sourceRecord);
      activeDrag = null;
    }, true);

    document.addEventListener("click", function (event) {
      var source = event.target.closest && event.target.closest(".passage-heading-source[data-gt-drag-bank]");
      if (source) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(source);
        return;
      }

      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var record = recordForQuestion(zoneQuestion(zone));
      var selected = record && selectedByBank.get(record.id);
      if (selected) apply(zone, selected, record);
      else if (selectedByBank.size > 0) return;
      else if (zone.classList.contains("filled")) clear(zone);
    }, true);

    document.addEventListener("dblclick", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clear(zone);
    }, true);

    document.addEventListener("keydown", function (event) {
      var source = event.target.closest && event.target.closest(".passage-heading-source[data-gt-drag-bank]");
      if (source && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(source);
        return;
      }

      var zone = event.target.closest && event.target.closest(".drop-zone[data-gt-drag-bank]");
      if (!zone) return;
      var key = String(event.key || "");
      if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        event.stopImmediatePropagation();
        clear(zone);
        return;
      }
      if (!/^[a-z]$/i.test(key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var record = recordForQuestion(zoneQuestion(zone));
      apply(zone, key.toUpperCase(), record);
    }, true);

    document.querySelectorAll(".drop-zone").forEach(function (zone) {
      var question = zoneQuestion(zone);
      var record = recordForQuestion(question);
      if (!record) return;
      zone.setAttribute("data-gt-drag-bank", record.id);
      zone.classList.add("passage-heading-drop-zone");
      var select = selectForZone(zone);
      if (select && select.value) apply(zone, select.value, record);
    });
  }

  function init() {
    installStyles();
    installLogoHomeLink();
    installFindShortcutGuard();
    installTest3ModeUi();
    installTest3DragMatching();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
