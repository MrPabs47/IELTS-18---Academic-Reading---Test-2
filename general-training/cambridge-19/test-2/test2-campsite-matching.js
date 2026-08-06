(function () {
  "use strict";

  function text(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function initialise() {
    if (document.documentElement.dataset.gtTest2Campsites === "ready") return;

    var passage = document.getElementById("text-s1-campsites");
    var section = document.querySelector('#questionContent > [data-section="1"]');
    if (!passage || !section) return;

    var sources = [];
    Array.from(passage.children).forEach(function (paragraph) {
      if (paragraph.tagName !== "P") return;
      var strong = paragraph.firstElementChild;
      var match = strong && strong.tagName === "STRONG"
        ? text(strong.textContent).match(/^([A-E])\s+(.+)$/)
        : null;
      if (!match) return;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "drag-item passage-match-source gt-test2-campsite-source";
      button.draggable = true;
      button.dataset.value = match[1];
      button.dataset.gtTest2Bank = "campsites";
      button.setAttribute("aria-label", "Choose campsite " + match[1] + ", " + match[2] + ", for Questions 1 to 7");
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = '<span class="gt-test2-campsite-letter"></span><span class="gt-test2-campsite-name"></span>';
      button.firstElementChild.textContent = match[1];
      button.lastElementChild.textContent = match[2];

      paragraph.before(button);
      strong.remove();
      if (paragraph.firstChild && paragraph.firstChild.nodeType === Node.TEXT_NODE) {
        paragraph.firstChild.nodeValue = paragraph.firstChild.nodeValue.replace(/^\s+/, "");
      }
      paragraph.classList.add("gt-test2-campsite-body");
      sources.push(button);
    });

    var zones = [];
    for (var question = 1; question <= 7; question += 1) {
      var select = section.querySelector('select[name="q' + question + '"]');
      var block = section.querySelector('.question-block[data-q="' + question + '"]');
      if (!select || !block) continue;
      select.classList.add("sr-only");

      var zone = block.querySelector('.drop-zone[data-for="q' + question + '"]');
      if (!zone) {
        var row = document.createElement("div");
        row.className = "gt-section1-drop-row";
        zone = document.createElement("div");
        zone.className = "drop-zone";
        zone.dataset.for = "q" + question;
        zone.tabIndex = 0;
        zone.setAttribute("role", "button");
        zone.textContent = "Drop here";
        var clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = "gt-section1-clear";
        clearButton.textContent = "Clear";
        row.append(zone, clearButton);
        select.after(row);
      }
      zone.dataset.gtTest2Bank = "campsites";
      zone.classList.add("gt-test2-campsite-zone");
      zone.setAttribute("aria-label", "Answer box for question " + question);
      zones.push(zone);
    }

    if (sources.length !== 5 || zones.length !== 7) return;
    document.documentElement.dataset.gtTest2Campsites = "ready";

    var style = document.createElement("style");
    style.id = "gt-test2-campsite-styles";
    style.textContent =
      ".gt-test2-campsite-source{align-items:flex-start;background:color-mix(in srgb,var(--bg) 94%,var(--bg-secondary));border:1px solid var(--border);border-radius:8px;color:var(--text);cursor:grab;display:flex;font:inherit;font-weight:700;gap:9px;line-height:1.35;margin:14px 0 6px;padding:7px 10px;text-align:left;width:100%}" +
      ".gt-test2-campsite-source:hover,.gt-test2-campsite-source.selected,.gt-test2-campsite-source:focus-visible{background:var(--accent-soft);border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent);outline:none}" +
      ".gt-test2-campsite-source.is-dragging{opacity:.68}.gt-test2-campsite-letter{font-weight:800}.gt-test2-campsite-body{margin-top:0!important}" +
      ".gt-test2-campsite-zone{min-width:104px}.gt-test2-campsite-zone.filled{font-weight:800}" +
      ".gt-test2-campsite-source.reading-shell-locked,.gt-test2-campsite-zone.reading-shell-locked{cursor:not-allowed;opacity:.72}";
    document.head.appendChild(style);

    var selected = "";
    var dragging = "";

    function sourceFor(value) {
      return sources.find(function (source) { return source.dataset.value === value; });
    }

    function selectFor(zone) {
      return document.querySelector('select[name="' + zone.dataset.for + '"]');
    }

    function clearButtonFor(zone) {
      var button = zone && zone.nextElementSibling;
      return button && button.classList.contains("gt-section1-clear") ? button : null;
    }

    function questionFor(zone) {
      return Number(String(zone.dataset.for || "").replace(/^q/, ""));
    }

    function locked(node, select) {
      return Boolean(
        (select && select.disabled) ||
        node.classList.contains("reading-shell-locked") ||
        node.getAttribute("aria-disabled") === "true" ||
        (typeof mode === "string" && mode === "test" && typeof testSubmitted !== "undefined" && testSubmitted)
      );
    }

    function syncClearLock(zone) {
      var select = selectFor(zone);
      var button = clearButtonFor(zone);
      if (!button) return;
      var isLocked = locked(zone, select);
      button.disabled = isLocked;
      button.setAttribute("aria-disabled", isLocked ? "true" : "false");
    }

    function renderSelection(value) {
      selected = value || "";
      sources.forEach(function (source) {
        var active = source.dataset.value === selected;
        source.classList.toggle("selected", active);
        source.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function choose(source) {
      if (locked(source, null)) return;
      renderSelection(selected === source.dataset.value ? "" : source.dataset.value);
    }

    function apply(zone, value) {
      var select = selectFor(zone);
      var question = questionFor(zone);
      if (!select || locked(zone, select) || !sourceFor(value)) return;
      if (!Array.from(select.options).some(function (option) { return option.value === value; })) return;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      zone.textContent = value;
      zone.dataset.answerValue = value;
      zone.classList.add("filled");
      zone.setAttribute("aria-label", "Answer " + value + " for question " + question + ". Press Delete to clear.");
    }

    function clear(zone) {
      var select = selectFor(zone);
      if (!select || locked(zone, select)) return;
      select.value = "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      zone.textContent = "Drop here";
      delete zone.dataset.answerValue;
      zone.classList.remove("filled", "over");
      zone.setAttribute("aria-label", "Answer box for question " + questionFor(zone));
    }

    document.addEventListener("dragstart", function (event) {
      var source = event.target.closest && event.target.closest(".gt-test2-campsite-source");
      if (!source) return;
      event.stopImmediatePropagation();
      if (locked(source, null)) { event.preventDefault(); return; }
      renderSelection(source.dataset.value);
      dragging = source.dataset.value;
      source.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", dragging);
        event.dataTransfer.setData("application/x-gt-test2-bank", "campsites");
      }
    }, true);

    document.addEventListener("dragend", function (event) {
      var source = event.target.closest && event.target.closest(".gt-test2-campsite-source");
      if (!source) return;
      event.stopImmediatePropagation();
      source.classList.remove("is-dragging");
      dragging = "";
      zones.forEach(function (zone) { zone.classList.remove("over"); });
    }, true);

    document.addEventListener("dragover", function (event) {
      var zone = event.target.closest && event.target.closest(".gt-test2-campsite-zone");
      if (!zone || !dragging || locked(zone, selectFor(zone))) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zone.classList.add("over");
    }, true);

    document.addEventListener("dragleave", function (event) {
      var zone = event.target.closest && event.target.closest(".gt-test2-campsite-zone");
      if (!zone) return;
      zone.classList.remove("over");
    }, true);

    document.addEventListener("drop", function (event) {
      var zone = event.target.closest && event.target.closest(".gt-test2-campsite-zone");
      if (!zone) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zone.classList.remove("over");
      var value = event.dataTransfer && event.dataTransfer.getData("text/plain");
      apply(zone, value || dragging);
      dragging = "";
    }, true);

    document.addEventListener("click", function (event) {
      var source = event.target.closest && event.target.closest(".gt-test2-campsite-source");
      if (source) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(source);
        return;
      }

      var zone = event.target.closest && event.target.closest(".gt-test2-campsite-zone");
      if (zone) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (selected) apply(zone, selected);
        else if (zone.classList.contains("filled")) clear(zone);
        return;
      }

      var clearButton = event.target.closest && event.target.closest(".gt-section1-clear");
      var clearZone = clearButton && clearButton.previousElementSibling;
      if (!clearZone || !clearZone.classList.contains("gt-test2-campsite-zone")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clear(clearZone);
    }, true);

    document.addEventListener("keydown", function (event) {
      var source = event.target.closest && event.target.closest(".gt-test2-campsite-source");
      if (source && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        choose(source);
        return;
      }

      var zone = event.target.closest && event.target.closest(".gt-test2-campsite-zone");
      if (!zone) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        event.stopImmediatePropagation();
        clear(zone);
        return;
      }
      if (!/^[a-e]$/i.test(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderSelection(event.key.toUpperCase());
      apply(zone, event.key.toUpperCase());
    }, true);

    zones.forEach(function (zone) {
      var select = selectFor(zone);
      if (select && select.value) apply(zone, select.value);

      var sync = function () { syncClearLock(zone); };
      new MutationObserver(sync).observe(zone, {
        attributes: true,
        attributeFilter: ["class", "aria-disabled", "tabindex"]
      });
      if (select) {
        new MutationObserver(sync).observe(select, {
          attributes: true,
          attributeFilter: ["disabled"]
        });
      }
      sync();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();
}());
