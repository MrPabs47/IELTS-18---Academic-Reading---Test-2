#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path

path = Path('general-training/shared/gt-reading-test-runtime.js')
text = path.read_text(encoding='utf-8')

old_styles = '''      ".passage-heading-drop-zone{justify-content:flex-start;line-height:1.35;max-width:100%;min-height:42px;text-align:left;white-space:normal;width:min(100%,430px)}" +
      ".passage-heading-drop-zone.filled{font-weight:700}" +'''
new_styles = '''      ".test-candidate-name{color:var(--text-soft);font-weight:700;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "body[data-gt-mode=test] .reading-shell-study-controls{display:none!important}" +
      ".passage-heading-drop-zone{justify-content:flex-start;line-height:1.3;max-width:100%;text-align:left;white-space:normal}" +
      ".passage-heading-drop-zone:not(.filled){color:var(--text-soft);font-size:.84rem;font-weight:600;height:30px;min-height:30px;width:104px}" +
      ".passage-heading-drop-zone.filled{font-weight:700;height:auto;min-height:38px;width:min(100%,430px)}" +'''
if text.count(old_styles) != 1:
    raise SystemExit('Expected Test 3 drop-zone style contract exactly once')
text = text.replace(old_styles, new_styles)

marker = '''  function isTest3Page() {
    return /Reading Test 3/i.test(document.title || "") && /General Training/i.test(document.title || "");
  }

'''
addition = marker + '''  function ensureTest3CandidateName() {
    if (!isTest3Page()) return null;
    var existing = document.getElementById("testCandidateName");
    if (existing) return existing;
    var topRight = document.querySelector(".top-right");
    if (!topRight) return null;
    var candidate = document.createElement("span");
    candidate.id = "testCandidateName";
    candidate.className = "test-candidate-name";
    candidate.hidden = true;
    candidate.setAttribute("aria-live", "polite");
    var mount = document.getElementById("readingFeatureShellMount");
    var timer = document.getElementById("timerContainer");
    topRight.insertBefore(candidate, mount || timer || topRight.firstChild);
    return candidate;
  }

  function syncTest3ModeUi() {
    if (!isTest3Page() || !document.body) return;
    var currentMode = typeof mode === "string" ? mode : "";
    document.body.setAttribute("data-gt-mode", currentMode);
    var candidate = ensureTest3CandidateName();
    if (candidate) {
      var name = typeof studentName === "string" ? studentName.trim() : "";
      candidate.textContent = name ? "Candidate: " + name : "";
      candidate.title = name;
      candidate.hidden = currentMode !== "test" || !name;
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

'''
if text.count(marker) != 1:
    raise SystemExit('Expected Test 3 page marker exactly once')
text = text.replace(marker, addition)

old_init = '''    installLogoHomeLink();
    installFindShortcutGuard();
    installTest3DragMatching();'''
new_init = '''    installLogoHomeLink();
    installFindShortcutGuard();
    installTest3ModeUi();
    installTest3DragMatching();'''
if text.count(old_init) != 1:
    raise SystemExit('Expected runtime init contract exactly once')
text = text.replace(old_init, new_init)
path.write_text(text, encoding='utf-8')
PY

node --check general-training/shared/gt-reading-test-runtime.js

grep -Fq 'Candidate: " + name' general-training/shared/gt-reading-test-runtime.js
grep -Fq 'body[data-gt-mode=test] .reading-shell-study-controls{display:none!important}' general-training/shared/gt-reading-test-runtime.js
grep -Fq '.passage-heading-drop-zone:not(.filled)' general-training/shared/gt-reading-test-runtime.js
grep -Fq 'installTest3ModeUi();' general-training/shared/gt-reading-test-runtime.js

npm install --prefix /tmp/test3-mode-polish --no-save puppeteer-core@24.16.0 >/dev/null
CHROME_BIN="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium || true)"
test -n "$CHROME_BIN"
python -m http.server 8765 --bind 127.0.0.1 >/tmp/test3-mode-polish-http.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2

cat > /tmp/test3-mode-polish.js <<'NODE'
const puppeteer = require('/tmp/test3-mode-polish/node_modules/puppeteer-core');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/404 \(File not found\)/.test(message.text())) errors.push(message.text());
  });

  const url = 'http://127.0.0.1:8765/general-training/cambridge-19/test-3/IELTS19%20Test%203%20-%20Reading%20-%20GT.html';
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await page.evaluate(() => {
    studentName = 'Pablo Test';
    startTest('test');
  });
  await page.waitForFunction(() => {
    const candidate = document.getElementById('testCandidateName');
    const info = document.querySelector('.reading-shell-study-controls');
    return candidate && !candidate.hidden && candidate.textContent.trim() === 'Candidate: Pablo Test' && info && getComputedStyle(info).display === 'none';
  });

  const testState = await page.evaluate(() => {
    const candidate = document.getElementById('testCandidateName');
    const controls = document.querySelector('.reading-shell-study-controls');
    const zone = document.querySelector('.drop-zone[data-for="q1"]');
    const question = document.querySelector('.question-block[data-q="1"] .question-text');
    return {
      mode: document.body.dataset.gtMode,
      candidate: candidate.textContent.trim(),
      candidateVisible: !candidate.hidden && getComputedStyle(candidate).display !== 'none',
      controlsHidden: controls.hidden && getComputedStyle(controls).display === 'none',
      zoneWidth: zone.getBoundingClientRect().width,
      zoneHeight: zone.getBoundingClientRect().height,
      zoneFont: parseFloat(getComputedStyle(zone).fontSize),
      questionFont: parseFloat(getComputedStyle(question).fontSize)
    };
  });
  assert.deepStrictEqual([testState.mode, testState.candidate, testState.candidateVisible, testState.controlsHidden], ['test', 'Candidate: Pablo Test', true, true]);
  assert(testState.zoneWidth <= 108, `Placeholder width was ${testState.zoneWidth}`);
  assert(testState.zoneHeight <= 32, `Placeholder height was ${testState.zoneHeight}`);
  assert(testState.zoneFont < testState.questionFont);

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await page.click('[data-mode="study"]');
  await page.waitForFunction(() => {
    const controls = document.querySelector('.reading-shell-study-controls');
    return document.body.dataset.gtMode === 'study' && controls && !controls.hidden && getComputedStyle(controls).display !== 'none';
  });
  const studyState = await page.evaluate(() => ({
    candidateHidden: document.getElementById('testCandidateName').hidden,
    controlsVisible: getComputedStyle(document.querySelector('.reading-shell-study-controls')).display !== 'none'
  }));
  assert.deepStrictEqual(studyState, { candidateHidden: true, controlsVisible: true });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log('Test 3 mode polish regression: PASS');
})().catch(error => { console.error(error); process.exit(1); });
NODE

CHROME_BIN="$CHROME_BIN" node /tmp/test3-mode-polish.js
