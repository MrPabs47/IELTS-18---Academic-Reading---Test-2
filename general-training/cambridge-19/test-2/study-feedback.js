(function () {
  "use strict";

  var current = document.currentScript;
  var dataSource = current && current.src
    ? current.src.replace(/study-feedback\.js(?:\?.*)?$/, "study-feedback-data.js")
    : "study-feedback-data.js";

  function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function installIeltsPabsHomeLink() {
    "use strict";

    var HOME_URL = "../../../index.html";
    var logo = document.querySelector(".top-left .logo");
    if (!logo || logo.getAttribute("data-home-link-ready") === "true") return;

    logo.setAttribute("data-home-link-ready", "true");
    logo.classList.add("home-link");
    logo.setAttribute("role", "link");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("title", "Return to home");
    logo.setAttribute("aria-label", "Return to IELTS Pabs home");

    if (!document.getElementById("gt19-home-logo-styles")) {
      var style = document.createElement("style");
      style.id = "gt19-home-logo-styles";
      style.textContent = ".logo.home-link{cursor:pointer;user-select:none;transition:color .2s ease,opacity .2s ease}.logo.home-link:hover,.logo.home-link:focus-visible{color:#e31837;opacity:1;outline:none}.logo-char{display:inline-block;opacity:1;transform:none;filter:none;will-change:transform,opacity,filter}.logo.is-animating .logo-char{animation:gt19LogoReveal .45s cubic-bezier(.22,1,.36,1) forwards;animation-delay:calc(var(--logo-char-index)*200ms)}@keyframes gt19LogoReveal{from{opacity:0;transform:translateY(8px);filter:blur(4px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@media(prefers-reduced-motion:reduce){.logo-char{opacity:1;transform:none;filter:none;animation:none}}";
      document.head.appendChild(style);
    }

    var rawText = String(logo.textContent || "").trim();
    if (rawText === "IELTS Pabs") {
      var fragment = document.createDocumentFragment();
      Array.from(rawText).forEach(function (character, index) {
        var span = document.createElement("span");
        span.className = "logo-char";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--logo-char-index", String(index));
        span.textContent = character === " " ? "\u00a0" : character;
        fragment.appendChild(span);
      });
      logo.textContent = "";
      logo.appendChild(fragment);
    }

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      logo.addEventListener("mouseenter", function () {
        logo.classList.remove("is-animating");
        void logo.offsetWidth;
        logo.classList.add("is-animating");
      });
      logo.addEventListener("mouseleave", function () {
        logo.classList.remove("is-animating");
      });
    }

    function confirmGoHome() {
      var ok = window.confirm("Are you sure you want to leave this test and return to the home page? Your current answers may not be saved.");
      if (ok) window.location.href = HOME_URL;
    }

    window.confirmGoHome = confirmGoHome;
    logo.addEventListener("click", confirmGoHome);
    logo.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      confirmGoHome();
    });
  }

  document.write(
    '<script src="' + escapeAttribute(dataSource) + '"><\/script>' +
    '<script>(' + installIeltsPabsHomeLink.toString() + ')();<\/script>'
  );
}());
