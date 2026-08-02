#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path

path = Path('general-training/shared/gt-reading-test-runtime.js')
text = path.read_text(encoding='utf-8')

old_styles = '''      ".passage-heading-drop-zone{justify-content:flex-start;line-height:1.35;max-width:100%;min-height:42px;text-align:left;white-space:normal;width:min(100%,430px)}" +
      ".passage-heading-drop-zone.filled{font-weight:700}" +'''
new_styles = '''      ".test-candidate-name{color:var(--text-soft);font-weight:700;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "body[data-gt-mode=\\\"test\\\"] .reading-shell-study-controls{display:none!important}" +
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
    if (!candidate) return;
    var name = typeof studentName === "string" ? studentName.trim() : "";
    candidate.textContent = name ? "Candidate: " + name : "";
    candidate.title = name;
    candidate.hidden = currentMode !== "test" || !name;
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

python - <<'PY'
from pathlib import Path
text = Path('general-training/shared/gt-reading-test-runtime.js').read_text(encoding='utf-8')
required = [
    'id = "testCandidateName"',
    '"Candidate: " + name',
    'body[data-gt-mode=\\"test\\"] .reading-shell-study-controls{display:none!important}',
    '.passage-heading-drop-zone:not(.filled)',
    'font-size:.84rem',
    'width:104px',
    'installTest3ModeUi();'
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit('Missing expected contracts: ' + ', '.join(missing))
PY

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
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN,
    headless: true,
    args: ['--no-sandbox']
  });
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
    const input = document.getElementById('studentNameInput');
    if (input) input.value = 'Pablo Test';
    studentName = 'Pablo Test';
    startTest('test');
  });
  await page.waitForFunction(() => {
    const candidate = document.getElementById('testCandidateName');
    return candidate && !candidate.hidden && candidate.textContent.trim() === 'Candidate: Pablo Test';
  });

  const testState = await page.evaluate(() => {
    const candidate = document.getElementById('testCandidateName');
    const info = document.querySelector('.reading-shell-study-icon-button');
    const zone = document.querySelector('.drop-zone[data-for="q1"]');
    const question = document.querySelector('.question-block[data-q="1"] .question-text');
    const zoneStyle = getComputedStyle(zone);
    return {
      mode: document.body.getAttribute('data-gt-mode'),
      candidate: candidate.textContent.trim(),
      candidateVisible: !candidate.hidden && getComputedStyle(candidate).display !== 'none',
      infoHidden: info ? getComputedStyle(info).display === 'none' : false,
      placeholder: zone.textContent.trim(),
      zoneWidth: zone.getBoundingClientRect().width,
      zoneHeight: zone.getBoundingClientRect().height,
      zoneFont: parseFloat(zoneStyle.fontSize),
      questionFont: parseFloat(getComputedStyle(question).fontSize)
    };
  });
  assert.strictEqual(testState.mode, 'test');
  assert.strictEqual(testState.candidate, 'Candidate: Pablo Test');
  assert.strictEqual(testState.candidateVisible, true);
  assert.strictEqual(testState.infoHidden, true);
  assert.strictEqual(testState.placeholder, 'Drop here');
  assert(testState.zoneWidth <= 108, `Placeholder width was ${testState.zoneWidth}`);
  assert(testState.zoneHeight <= 32, `Placeholder height was ${testState.zoneHeight}`);
  assert(testState.zoneFont < testState.questionFont);

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await page.click('[data-mode="study"]');
  await page.waitForFunction(() => document.body.getAttribute('data-gt-mode') === 'study');
  const studyState = await page.evaluate(() => {
    const candidate = document.getElementById('testCandidateName');
    const info = document.querySelector('.reading-shell-study-icon-button');
    return {
      candidateHidden: candidate && (candidate.hidden || getComputedStyle(candidate).display === 'none'),
      infoVisible: info && getComputedStyle(info).display !== 'none'
    };
  });
  assert.strictEqual(studyState.candidateHidden, true);
  assert.strictEqual(studyState.infoVisible, true);
  assert.deepStrictEqual(errors, []);

  await browser.close();
  console.log('Test 3 mode polish regression: PASS');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
NODE

CHROME_BIN="$CHROME_BIN" node /tmp/test3-mode-polish.js
