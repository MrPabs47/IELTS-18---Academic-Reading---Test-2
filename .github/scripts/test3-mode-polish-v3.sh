#!/usr/bin/env bash
set -euo pipefail

# Reuse the corrected patch and static checks, but stop before its browser phase.
awk '/^npm install --prefix \/tmp\/test3-mode-polish/{exit} {print}' \
  .github/scripts/test3-mode-polish-v2.sh > /tmp/test3-mode-polish-patch.sh
bash /tmp/test3-mode-polish-patch.sh

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

function watchPage(page, errors) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/404 \(File not found\)/.test(message.text())) errors.push(message.text());
  });
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN, headless: true, args: ['--no-sandbox'] });
  const errors = [];
  const url = 'http://127.0.0.1:8765/general-training/cambridge-19/test-3/IELTS19%20Test%203%20-%20Reading%20-%20GT.html';

  const testPage = await browser.newPage();
  watchPage(testPage, errors);
  await testPage.goto(url, { waitUntil: 'networkidle0' });
  await testPage.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await testPage.evaluate(() => {
    studentName = 'Pablo Test';
    startTest('test');
  });
  await testPage.waitForFunction(() => {
    const candidate = document.getElementById('testCandidateName');
    const controls = document.querySelector('.reading-shell-study-controls');
    return candidate && !candidate.hidden && candidate.textContent.trim() === 'Candidate: Pablo Test' &&
      controls && controls.hidden && getComputedStyle(controls).display === 'none';
  });

  const testState = await testPage.evaluate(() => {
    const candidate = document.getElementById('testCandidateName');
    const controls = document.querySelector('.reading-shell-study-controls');
    const zone = document.querySelector('.drop-zone[data-for="q1"]');
    const question = document.querySelector('.question-block[data-q="1"] .question-text');
    return {
      mode: document.body.dataset.gtMode,
      candidate: candidate.textContent.trim(),
      candidateVisible: !candidate.hidden && getComputedStyle(candidate).display !== 'none',
      controlsHidden: controls.hidden && getComputedStyle(controls).display === 'none',
      placeholder: zone.textContent.trim(),
      zoneWidth: zone.getBoundingClientRect().width,
      zoneHeight: zone.getBoundingClientRect().height,
      zoneFont: parseFloat(getComputedStyle(zone).fontSize),
      questionFont: parseFloat(getComputedStyle(question).fontSize)
    };
  });
  assert.deepStrictEqual(
    [testState.mode, testState.candidate, testState.candidateVisible, testState.controlsHidden, testState.placeholder],
    ['test', 'Candidate: Pablo Test', true, true, 'Drop here']
  );
  assert(testState.zoneWidth <= 108, `Placeholder width was ${testState.zoneWidth}`);
  assert(testState.zoneHeight <= 32, `Placeholder height was ${testState.zoneHeight}`);
  assert(testState.zoneFont < testState.questionFont);

  const studyPage = await browser.newPage();
  watchPage(studyPage, errors);
  await studyPage.goto(url, { waitUntil: 'networkidle0' });
  await studyPage.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await studyPage.click('[data-mode="study"]');
  await studyPage.waitForFunction(() => {
    const controls = document.querySelector('.reading-shell-study-controls');
    const candidate = document.getElementById('testCandidateName');
    return document.body.dataset.gtMode === 'study' && controls && !controls.hidden &&
      getComputedStyle(controls).display !== 'none' && candidate && candidate.hidden;
  });
  const studyState = await studyPage.evaluate(() => ({
    mode: document.body.dataset.gtMode,
    candidateHidden: document.getElementById('testCandidateName').hidden,
    controlsVisible: getComputedStyle(document.querySelector('.reading-shell-study-controls')).display !== 'none'
  }));
  assert.deepStrictEqual(studyState, { mode: 'study', candidateHidden: true, controlsVisible: true });
  assert.deepStrictEqual(errors, []);

  await browser.close();
  console.log('Test 3 mode polish regression: PASS');
})().catch(error => { console.error(error); process.exit(1); });
NODE

CHROME_BIN="$CHROME_BIN" node /tmp/test3-mode-polish.js
