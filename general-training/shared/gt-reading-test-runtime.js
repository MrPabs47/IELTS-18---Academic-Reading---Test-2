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

  function parseBankRange(bank) {
    var label = bank.getAttribute("aria-label") || "";
    var match = label.match(/questions?\s+(\d+)\s+(?:to|–|-)\s+(\d+)/i);
    if (!match) return null;
    return { from: Number(match[1]), to: Number(match[2]) };
  }

  function installTest3DragMatching() {
    if (!isTest3Page() || document.documentElement.getAttribute("data-gt-drag-upgrade") === "true") return;
    var banks = Array.from(document.querySelectorAll(".drag-bank"));
    if (!banks.length) return;

    document.documentElement.setAttribute("data-gt-drag-upgrade", "true");
    var bankRecords = [];
    var selectedByBank = new Map();
    var activeDrag = null;

    banks.forEach(function (bank, index) {
      var range = parseBankRange(bank);
      if (!range) return;
      var id = "gt-drag-bank-" + (index + 1);
      bank.setAttribute("data-gt-drag-bank", id);
      var record = { id: id, bank: bank, range: range };
      bankRecords.push(record);

      Array.from(bank.querySelectorAll(".drag-item")).forEach(function (item) {
        item.classList.add("passage-match-source");
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", "Choose " + item.getAttribute("data-value") + " for questions " + range.from + " to " + range.to);
        item.setAttribute("data-gt-drag-bank", id);
      });
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
      document.querySelectorAll(".drag-item.selected").forEach(function (item) {
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
      });
    }

    function choose(item) {
      var record = recordForNode(item);
      if (!record || locked(item, null)) return false;
      clearSelections();
      selectedByBank.set(record.id, item.getAttribute("data-value"));
      item.classList.add("selected");
      item.setAttribute("aria-pressed", "true");
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

      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      zone.textContent = value;
      zone.classList.add("filled");
      zone.setAttribute("aria-label", "Answer " + value + " for question " + question + ". Press Delete to clear.");
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
      zone.classList.remove("filled", "over");
      zone.setAttribute("aria-label", "Answer box for question " + question);
      clearSelections();
      return true;
    }

    document.addEventListener("dragstart", function (event) {
      var item = event.target.closest && event.target.closest(".drag-item[data-gt-drag-bank]");
      if (!item) return;
      event.stopImmediatePropagation();
      if (!choose(item)) {
        event.preventDefault();
        return;
      }
      var record = recordForNode(item);
      activeDrag = { record: record, value: item.getAttribute("data-value") };
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", activeDrag.value);
        event.dataTransfer.setData("application/x-gt-reading-bank", record.id);
      }
    }, true);

    document.addEventListener("dragend", function (event) {
      var item = event.target.closest && event.target.closest(".drag-item[data-gt-drag-bank]");
      if (!item) return;
      event.stopImmediatePropagation();
      activeDrag = null;
      document.querySelectorAll(".drop-zone.over").forEach(function (zone) { zone.classList.remove("over"); });
    }, true);

    document.addEventListener("dragover", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone");
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
      var zone = event.target.closest && event.target.closest(".drop-zone");
      if (!zone) return;
      event.stopImmediatePropagation();
      zone.classList.remove("over");
    }, true);

    document.addEventListener("drop", function (event) {
      var zone = event.target.closest && event.target.closest(".drop-zone");
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
      var item = event.target.closest && event.target.closest(".drag-item[data-gt-drag-bank]");
      if (item) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(item);
        return;
      }

      var zone = event.target.closest && event.target.closest(".drop-zone");
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
      var zone = event.target.closest && event.target.closest(".drop-zone");
      if (!zone) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clear(zone);
    }, true);

    document.addEventListener("keydown", function (event) {
      var item = event.target.closest && event.target.closest(".drag-item[data-gt-drag-bank]");
      if (item && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(item);
        return;
      }

      var zone = event.target.closest && event.target.closest(".drop-zone");
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
      var select = selectForZone(zone);
      if (select && select.value) apply(zone, select.value, record);
    });
  }

  function init() {
    installStyles();
    installLogoHomeLink();
    installFindShortcutGuard();
    installTest3DragMatching();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
}());
