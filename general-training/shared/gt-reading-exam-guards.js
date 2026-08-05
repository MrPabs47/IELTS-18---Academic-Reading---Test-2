(function () {
  "use strict";

  function ensureShortcutToast() {
    var toast = document.getElementById("shortcutToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "shortcutToast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    if (!document.getElementById("gtReadingGuardStyles")) {
      var style = document.createElement("style");
      style.id = "gtReadingGuardStyles";
      style.textContent = [
        ".logo.home-link,.logo-link,.logo-link .logo{cursor:pointer;}",
        "#shortcutToast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,12px);z-index:3000;max-width:min(420px,calc(100vw - 32px));padding:10px 14px;border-radius:999px;background:#222;color:#fff;font:600 14px/1.3 Arial,Helvetica,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.28);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;text-align:center;}",
        "#shortcutToast.visible{opacity:1;transform:translate(-50%,0);}",
        ".gt-section1-drop-row{display:flex;align-items:center;gap:8px;margin-top:6px;}",
        ".gt-section1-clear{border:1px solid var(--border);background:var(--bg-secondary);color:var(--text);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:.82rem;}",
        ".gt-section1-clear:disabled{cursor:not-allowed;opacity:.55;}",
        ".gt-test3-header-right .reading-shell-score-guide-backdrop,.gt-test3-header-right .reading-shell-answer-key-backdrop,.gt-test3-header-right .reading-shell-score-feedback-backdrop{white-space:normal;}"
      ].join("");
      document.head.appendChild(style);
    }
    return toast;
  }

  var toastTimer = 0;
  function showShortcutToast(message) {
    var toast = ensureShortcutToast();
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(function () { toast.classList.remove("visible"); }, 2200);
  }

  function activeTimedTest() {
    try {
      return mode === "test" && isTestRunning && !testSubmitted;
    } catch (error) {
      return false;
    }
  }

  function installFindGuard() {
    if (document.documentElement.dataset.gtFindGuard === "true") return;
    document.documentElement.dataset.gtFindGuard = "true";
    document.addEventListener("keydown", function (event) {
      var isFindShortcut = (event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === "f";
      if (!isFindShortcut || !activeTimedTest()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showShortcutToast("Find (CTRL + F) is disabled in Test mode.");
    }, true);
  }

  function improveLogo() {
    document.querySelectorAll(".logo.home-link, .logo-link").forEach(function (logo) {
      logo.style.cursor = "pointer";
      if (!logo.hasAttribute("tabindex")) logo.setAttribute("tabindex", "0");
      if (!logo.hasAttribute("role") && logo.tagName !== "A" && logo.tagName !== "BUTTON") logo.setAttribute("role", "link");
      if (!logo.getAttribute("aria-label")) logo.setAttribute("aria-label", "Return to home");
      logo.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        logo.click();
      });
    });
  }

  function ensureSectionOneDragDrop() {
    var section = document.querySelector('#questionContent > [data-section="1"]');
    if (!section) return;
    for (var q = 1; q <= 14; q += 1) {
      var block = section.querySelector('.question-block[data-q="' + q + '"]');
      if (!block) continue;
      var select = block.querySelector('select[name="q' + q + '"]');
      if (!select) continue;
      select.classList.add("sr-only");
      var zone = block.querySelector('.drop-zone[data-for="q' + q + '"]');
      if (!zone) {
        zone = document.createElement("div");
        zone.className = "drop-zone";
        zone.dataset.for = "q" + q;
        zone.tabIndex = 0;
        zone.setAttribute("role", "button");
        zone.setAttribute("aria-label", "Answer box for question " + q);
        zone.textContent = "Drop here";
        select.insertAdjacentElement("afterend", zone);
      }
      if (!zone.parentElement.classList.contains("gt-section1-drop-row") && !zone.parentElement.classList.contains("drop-zone-row")) {
        var row = document.createElement("div");
        row.className = "gt-section1-drop-row";
        zone.parentNode.insertBefore(row, zone);
        row.appendChild(zone);
        var clear = document.createElement("button");
        clear.type = "button";
        clear.className = "gt-section1-clear";
        clear.textContent = "Clear";
        clear.setAttribute("aria-label", "Clear answer for question " + q);
        clear.addEventListener("click", function () {
          var target = this.previousElementSibling;
          var name = target && target.dataset.for;
          var nativeSelect = name && document.querySelector('select[name="' + name + '"]');
          if (nativeSelect) {
            nativeSelect.value = "";
            nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (target) {
            target.textContent = "Drop here";
            target.classList.remove("filled");
          }
        });
        row.appendChild(clear);
      }
    }
  }

  function ensureTest3SectionThreeClearControls() {
    if (!/Reading Test 3/i.test(document.title || "") || !/General Training/i.test(document.title || "")) return;
    var section = document.querySelector('#questionContent > [data-section="3"]');
    if (!section) return;

    for (var q = 33; q <= 36; q += 1) {
      var block = section.querySelector('.question-block[data-q="' + q + '"]');
      if (!block) continue;
      var select = block.querySelector('select[name="q' + q + '"]');
      var zone = block.querySelector('.drop-zone[data-for="q' + q + '"]');
      if (!select || !zone) continue;
      if (zone.parentElement.classList.contains("gt-section1-drop-row") || zone.parentElement.classList.contains("drop-zone-row")) continue;

      var row = document.createElement("div");
      row.className = "gt-section1-drop-row";
      zone.parentNode.insertBefore(row, zone);
      row.appendChild(zone);

      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "gt-section1-clear";
      clear.textContent = "Clear";
      clear.setAttribute("aria-label", "Clear answer for question " + q);

      function syncClearState(button, answerZone, nativeSelect) {
        var locked = nativeSelect.disabled ||
          answerZone.classList.contains("reading-shell-locked") ||
          answerZone.getAttribute("aria-disabled") === "true";
        button.disabled = locked;
        button.setAttribute("aria-disabled", locked ? "true" : "false");
      }

      clear.addEventListener("click", function () {
        var target = this.previousElementSibling;
        var name = target && target.dataset.for;
        var nativeSelect = name && document.querySelector('select[name="' + name + '"]');
        if (!target || !nativeSelect || nativeSelect.disabled ||
          target.classList.contains("reading-shell-locked") ||
          target.getAttribute("aria-disabled") === "true") return;

        nativeSelect.value = "";
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        target.textContent = "Drop here";
        target.removeAttribute("data-answer-value");
        target.classList.remove("filled", "over");
        target.setAttribute("aria-label", "Answer box for question " + name.replace(/^q/, ""));
      });
      row.appendChild(clear);

      syncClearState(clear, zone, select);
      (function (button, answerZone, nativeSelect) {
        new MutationObserver(function () {
          syncClearState(button, answerZone, nativeSelect);
        }).observe(answerZone, { attributes: true, attributeFilter: ["class", "aria-disabled"] });
        new MutationObserver(function () {
          syncClearState(button, answerZone, nativeSelect);
        }).observe(nativeSelect, { attributes: true, attributeFilter: ["disabled"] });
      }(clear, zone, select));
    }
  }

  function initialise() {
    ensureShortcutToast();
    installFindGuard();
    improveLogo();
    ensureSectionOneDragDrop();
    ensureTest3SectionThreeClearControls();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();

  window.GTReadingExamGuards = {
    showShortcutToast: showShortcutToast,
    ensureSectionOneDragDrop: ensureSectionOneDragDrop,
    ensureTest3SectionThreeClearControls: ensureTest3SectionThreeClearControls
  };
})();
