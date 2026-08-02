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
        ".gt-section1-clear{border:1px solid var(--border);background:var(--bg-secondary);color:var(--text);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:.82rem;}"
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
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 2200);
  }

  function activeTimedTest() {
    return window.mode === "test" && window.isTestRunning && !window.testSubmitted;
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

  function initialise() {
    ensureShortcutToast();
    installFindGuard();
    improveLogo();
    ensureSectionOneDragDrop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();

  window.GTReadingExamGuards = {
    showShortcutToast: showShortcutToast,
    ensureSectionOneDragDrop: ensureSectionOneDragDrop
  };
})();
