#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path

path = Path('general-training/shared/gt-reading-test-runtime.js')
text = path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    text = text.replace(old, new)

replace_once(
'''      ".passage-heading-body{margin-top:0!important}" +''',
'''      ".passage-heading-body{margin-top:0!important}" +
      ".passage-heading-source.passage-paragraph-source{align-items:center;display:inline-flex;justify-content:center;margin:14px 0 4px;min-height:30px;padding:4px 10px;width:42px}" +
      ".passage-paragraph-body{margin-top:0!important}" +''',
'Section 3 paragraph-source styles'
)

replace_once(
'''      ".test-candidate-name{color:var(--text-soft);font-weight:700;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +''',
'''      ".gt-test3-header-left{min-width:0;flex:1 1 auto;white-space:nowrap;overflow:hidden}" +
      ".gt-test3-header-left .test-title,.gt-test3-header-left #candidateNameDisplay{font-size:.95rem;color:var(--text-soft);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".gt-test3-header-left .test-title{flex:0 1 auto}" +
      ".gt-test3-header-left #candidateNameDisplay{display:none;max-width:min(24vw,260px);flex:0 1 auto}" +
      ".gt-test3-header-right{gap:12px;min-width:0;flex:0 0 auto;white-space:nowrap}" +
      "@media (max-width:980px){.gt-test3-header-left{gap:10px}.gt-test3-header-right{gap:8px}.gt-test3-header-left #candidateNameDisplay{max-width:18vw}}" +''',
'Canonical candidate/header styles'
)

replace_once(
'''  function ensureTest3CandidateName() {
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
''',
'''  function ensureTest3CandidateName() {
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
''',
'Candidate position and title parity'
)

replace_once(
'''      candidate.textContent = name ? "Candidate: " + name : "";
      candidate.title = name;
      candidate.hidden = currentMode !== "test" || !name;''',
'''      var showCandidate = currentMode === "test" && Boolean(name);
      candidate.textContent = name ? "Candidate: " + name : "";
      candidate.title = name ? "Candidate: " + name : "";
      candidate.hidden = !showCandidate;
      candidate.style.display = showCandidate ? "block" : "none";''',
'Candidate visibility parity'
)

replace_once(
'''    var section = document.querySelector('.passage-section[data-section="1"]');
    var banks = Array.from(document.querySelectorAll('.drag-bank')).filter(function (bank) {
      var range = parseBankRange(bank);
      return range && ((range.from === 1 && range.to === 8) || (range.from === 9 && range.to === 14));
    });
    var allHeadingParagraphs = section ? Array.from(section.querySelectorAll("p")).filter(function (node) {
      return node.firstElementChild && node.firstElementChild.tagName === "STRONG";
    }) : [];
    var groups = [
      { range: { from: 1, to: 8 }, paragraphs: allHeadingParagraphs.slice(0, 5) },
      { range: { from: 9, to: 14 }, paragraphs: allHeadingParagraphs.slice(5, 9) }
    ];

    if (!section || banks.length < 2 || groups[0].paragraphs.length !== 5 || groups[1].paragraphs.length !== 4) return;''',
'''    var sectionOne = document.querySelector('.passage-section[data-section="1"]');
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
    ) return;''',
'Section 1 and Section 3 drag groups'
)

replace_once(
'''        var match = rawLabel.match(/^([A-Z])\\s+(.+)$/);
        if (!match) return;

        var value = match[1];
        var title = match[2];''',
'''        var headingMatch = rawLabel.match(/^([A-Z])\\s+(.+)$/);
        var paragraphMatch = rawLabel.match(/^([A-Z])$/);
        if (!headingMatch && !paragraphMatch) return;

        var value = headingMatch ? headingMatch[1] : paragraphMatch[1];
        var title = headingMatch ? headingMatch[2] : "";
        var sourceLabel = headingMatch ? rawLabel : value;''',
'Heading and paragraph-letter source parsing'
)

replace_once(
'''        source.className = "drag-item passage-match-source passage-heading-source";''',
'''        source.className = "drag-item passage-match-source passage-heading-source" + (paragraphMatch ? " passage-paragraph-source" : "");''',
'Paragraph source class'
)

replace_once(
'''        source.setAttribute("data-source-label", rawLabel);''',
'''        source.setAttribute("data-source-label", sourceLabel);''',
'Paragraph source label'
)

replace_once(
'''        source.setAttribute("aria-label", "Choose " + rawLabel + " for Questions " + group.range.from + " to " + group.range.to);''',
'''        source.setAttribute("aria-label", "Choose " + sourceLabel + " for Questions " + group.range.from + " to " + group.range.to);''',
'Paragraph source accessible label'
)

replace_once(
'''        var wording = document.createElement("span");
        wording.className = "passage-heading-wording";
        wording.textContent = title;
        source.append(letter, wording);''',
'''        source.appendChild(letter);
        if (title) {
          var wording = document.createElement("span");
          wording.className = "passage-heading-wording";
          wording.textContent = title;
          source.appendChild(wording);
        }''',
'Letter-only source rendering'
)

replace_once(
'''        paragraph.classList.add("passage-heading-body");''',
'''        paragraph.classList.add(paragraphMatch ? "passage-paragraph-body" : "passage-heading-body");''',
'Paragraph body layout class'
)

path.write_text(text, encoding='utf-8')
PY

node --check general-training/shared/gt-reading-test-runtime.js

python - <<'PY'
from pathlib import Path
text = Path('general-training/shared/gt-reading-test-runtime.js').read_text(encoding='utf-8')
required = [
    'IELTS 19 General Training Reading Test 3',
    'candidateNameDisplay',
    'gt-test3-header-left',
    'range.from === 33 && range.to === 36',
    'passage-paragraph-source',
    'passage-paragraph-body',
    'groups[2].paragraphs.length !== 7'
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit('Missing expected contracts: ' + ', '.join(missing))
PY

npm install --prefix /tmp/gt19-test3-parity --no-save puppeteer-core@24.16.0 >/dev/null
CHROME_BIN="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium || true)"
test -n "$CHROME_BIN"
python -m http.server 8765 --bind 127.0.0.1 >/tmp/gt19-test3-parity-http.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2

cat > /tmp/gt19-test3-parity.js <<'NODE'
const puppeteer = require('/tmp/gt19-test3-parity/node_modules/puppeteer-core');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN,
    headless: true,
    args: ['--no-sandbox']
  });
  const url = 'http://127.0.0.1:8765/general-training/cambridge-19/test-3/IELTS19%20Test%203%20-%20Reading%20-%20GT.html';
  const longName = 'Pablo Jaramillo Very Long Candidate Name For Header Truncation';

  const testPage = await browser.newPage();
  await testPage.setViewport({ width: 1833, height: 828 });
  const errors = [];
  testPage.on('pageerror', error => errors.push(error.message));
  testPage.on('console', message => {
    if (message.type() === 'error' && !/404 \(File not found\)/.test(message.text())) errors.push(message.text());
  });
  await testPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await testPage.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await testPage.waitForFunction(() => document.documentElement.getAttribute('data-gt-drag-upgrade') === 'true');

  await testPage.evaluate(name => {
    const input = document.getElementById('studentNameInput');
    if (input) input.value = name;
    studentName = name;
    startTest('test');
    switchSection(3);
  }, longName);

  await testPage.waitForFunction(() => {
    const candidate = document.getElementById('candidateNameDisplay');
    return candidate && !candidate.hidden && candidate.textContent.includes('Candidate:');
  });
  await testPage.waitForFunction(() => document.querySelectorAll('.passage-section[data-section="3"] .passage-paragraph-source').length === 7);

  const state = await testPage.evaluate(() => {
    const topBar = document.querySelector('.top-bar');
    const topLeft = document.querySelector('.top-left');
    const topRight = document.querySelector('.top-right');
    const title = topLeft.querySelector('.test-title');
    const candidate = document.getElementById('candidateNameDisplay');
    const sources = Array.from(document.querySelectorAll('.passage-section[data-section="3"] .passage-paragraph-source'));
    const targets = [33, 34, 35, 36].map(number => document.querySelector(`.drop-zone[data-for="q${number}"]`));
    const bank = Array.from(document.querySelectorAll('.drag-bank')).find(node => /33 to 36/.test(node.getAttribute('aria-label') || ''));
    const candidateRect = candidate.getBoundingClientRect();
    const topRightRect = topRight.getBoundingClientRect();
    const firstTargetStyle = getComputedStyle(targets[0]);
    return {
      title: title.textContent.trim(),
      documentTitle: document.title,
      candidateText: candidate.textContent.trim(),
      candidateParentIsLeft: candidate.parentElement === topLeft,
      candidateImmediatelyAfterTitle: title.nextElementSibling === candidate,
      candidateVisible: !candidate.hidden && getComputedStyle(candidate).display !== 'none',
      candidateWidth: candidateRect.width,
      candidateTruncated: candidate.scrollWidth > candidate.clientWidth,
      candidateBeforeRightControls: candidateRect.right <= topRightRect.left,
      topBarHeight: topBar.getBoundingClientRect().height,
      sourceValues: sources.map(source => source.getAttribute('data-value')).join(''),
      sourceParagraphFlow: sources.every(source => {
        const paragraph = source.nextElementSibling;
        if (!paragraph || !paragraph.classList.contains('passage-paragraph-body')) return false;
        return paragraph.getBoundingClientRect().top >= source.getBoundingClientRect().bottom;
      }),
      sourcesAreLettersOnly: sources.every(source => source.textContent.trim().length === 1),
      targetCount: targets.filter(Boolean).length,
      targetsScoped: targets.every(target => target && target.hasAttribute('data-gt-drag-bank')),
      targetWidth: targets[0].getBoundingClientRect().width,
      targetHeight: targets[0].getBoundingClientRect().height,
      targetFont: parseFloat(firstTargetStyle.fontSize),
      bankHidden: bank && (bank.hidden || getComputedStyle(bank).display === 'none')
    };
  });

  assert.strictEqual(state.title, 'IELTS 19 General Training Reading Test 3');
  assert.strictEqual(state.documentTitle, 'IELTS 19 General Training Reading Test 3 | IELTS Pabs');
  assert.strictEqual(state.candidateText, `Candidate: ${longName}`);
  assert.strictEqual(state.candidateParentIsLeft, true);
  assert.strictEqual(state.candidateImmediatelyAfterTitle, true);
  assert.strictEqual(state.candidateVisible, true);
  assert(state.candidateWidth <= 261, `Candidate width was ${state.candidateWidth}`);
  assert.strictEqual(state.candidateTruncated, true);
  assert.strictEqual(state.candidateBeforeRightControls, true);
  assert(state.topBarHeight <= 58, `Top bar height was ${state.topBarHeight}`);
  assert.strictEqual(state.sourceValues, 'ABCDEFG');
  assert.strictEqual(state.sourceParagraphFlow, true);
  assert.strictEqual(state.sourcesAreLettersOnly, true);
  assert.strictEqual(state.targetCount, 4);
  assert.strictEqual(state.targetsScoped, true);
  assert(state.targetWidth <= 108, `Target width was ${state.targetWidth}`);
  assert(state.targetHeight <= 32, `Target height was ${state.targetHeight}`);
  assert(state.targetFont < 15, `Target font was ${state.targetFont}`);
  assert.strictEqual(state.bankHidden, true);

  await testPage.click('.passage-section[data-section="3"] .passage-paragraph-source[data-value="B"]');
  await testPage.click('.drop-zone[data-for="q33"]');
  const placed = await testPage.evaluate(() => ({
    value: document.querySelector('select[name="q33"]').value,
    label: document.querySelector('.drop-zone[data-for="q33"]').textContent.trim(),
    filled: document.querySelector('.drop-zone[data-for="q33"]').classList.contains('filled')
  }));
  assert.deepStrictEqual(placed, { value: 'B', label: 'B', filled: true });

  const studyPage = await browser.newPage();
  await studyPage.setViewport({ width: 1440, height: 900 });
  await studyPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await studyPage.waitForFunction(() => window.ReadingFeatureShell && window.ReadingFeatureShell.getStatus().initialized === true);
  await studyPage.waitForFunction(() => document.documentElement.getAttribute('data-gt-drag-upgrade') === 'true');
  await studyPage.evaluate(() => {
    startTest('study');
    switchSection(3);
  });
  const studyState = await studyPage.evaluate(() => {
    const candidate = document.getElementById('candidateNameDisplay');
    const info = document.querySelector('.reading-shell-study-icon-button');
    return {
      candidateHidden: candidate && (candidate.hidden || getComputedStyle(candidate).display === 'none'),
      infoVisible: info && getComputedStyle(info).display !== 'none',
      sourceCount: document.querySelectorAll('.passage-section[data-section="3"] .passage-paragraph-source').length
    };
  });
  assert.strictEqual(studyState.candidateHidden, true);
  assert.strictEqual(studyState.infoVisible, true);
  assert.strictEqual(studyState.sourceCount, 7);
  assert.deepStrictEqual(errors, []);

  await browser.close();
  console.log('GT19 Test 3 Section 3 and header parity: PASS');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
NODE

CHROME_BIN="$CHROME_BIN" node /tmp/gt19-test3-parity.js
