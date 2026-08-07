const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-1/IELTS19%20Test%201%20-%20Reading%20-%20GT.html';

async function enterMode(page, selectedMode) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.startTest === 'function' && typeof window.switchSection === 'function');
  await page.evaluate(modeName => {
    window.startTest(modeName);
    if (modeName === 'test') isTestRunning = true;
    const modeScreen = document.getElementById('modeScreen');
    if (modeScreen) modeScreen.style.display = 'none';
    window.switchSection(3);
  }, selectedMode);
  await page.waitForFunction(() => document.querySelector('#questionContent > [data-section="3"]')?.style.display === 'block');
  await page.waitForTimeout(350);
}

async function layoutSnapshot(page) {
  return page.evaluate(() => {
    const box = document.querySelector('#questionContent > [data-section="3"] .summary-completion-box');
    const feedbacks = box && box.querySelector('.summary-feedbacks');
    if (!box || !feedbacks) throw new Error('Test 1 summary completion layout not found');
    const rect = node => {
      const value = node.getBoundingClientRect();
      return { width: value.width, height: value.height, top: value.top, bottom: value.bottom };
    };
    const hosts = Array.from(feedbacks.querySelectorAll(':scope > .question-block.feedback-only')).map(node => {
      const style = getComputedStyle(node);
      return {
        rect: rect(node),
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        borderTopWidth: style.borderTopWidth,
        borderBottomWidth: style.borderBottomWidth,
        visibleCards: Array.from(node.querySelectorAll('.reading-shell-study-feedback-card')).filter(card => Boolean(
          card.offsetWidth || card.offsetHeight || card.getClientRects().length
        )).length
      };
    });
    const reveal = document.querySelector('#study-instruction-s3-summary .reading-shell-study-reveal-button');
    return {
      revealExpanded: reveal ? reveal.getAttribute('aria-expanded') : null,
      box: rect(box),
      feedbacks: rect(feedbacks),
      hosts,
      visibleCards: Array.from(feedbacks.querySelectorAll('.reading-shell-study-feedback-card')).filter(card => Boolean(
        card.offsetWidth || card.offsetHeight || card.getClientRects().length
      )).length
    };
  });
}

function assertZeroHostChrome(host) {
  assert.equal(host.marginTop, '0px');
  assert.equal(host.marginBottom, '0px');
  assert.equal(host.paddingTop, '0px');
  assert.equal(host.paddingBottom, '0px');
  assert.equal(host.borderTopWidth, '0px');
  assert.equal(host.borderBottomWidth, '0px');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];
  try {
    const testPage = await browser.newPage({ viewport: { width: 1660, height: 936 } });
    testPage.setDefaultTimeout(20000);
    testPage.on('pageerror', error => pageErrors.push(`test: ${String(error)}`));
    await enterMode(testPage, 'test');

    const compact = await layoutSnapshot(testPage);
    assert.equal(compact.hosts.length, 5, 'Questions 33–37 must retain five dedicated feedback hosts.');
    assert.ok(compact.box.height < 340, `The untouched summary should stay content-sized; measured ${compact.box.height}px.`);
    assert.equal(compact.feedbacks.height, 0, 'Hidden feedback hosts must not reserve empty vertical space.');
    for (const host of compact.hosts) {
      assert.equal(host.rect.height, 0, 'An empty feedback host must collapse to zero height.');
      assertZeroHostChrome(host);
    }

    const studyPage = await browser.newPage({ viewport: { width: 1660, height: 936 } });
    studyPage.setDefaultTimeout(20000);
    studyPage.on('pageerror', error => pageErrors.push(`study: ${String(error)}`));
    await enterMode(studyPage, 'study');

    const summaryReveal = studyPage.locator('#study-instruction-s3-summary .reading-shell-study-reveal-button');
    await summaryReveal.waitFor({ state: 'visible' });
    let shown = await layoutSnapshot(studyPage);
    if (shown.revealExpanded !== 'true') {
      await summaryReveal.click();
      await studyPage.waitForTimeout(300);
      shown = await layoutSnapshot(studyPage);
    }

    assert.equal(shown.visibleCards, 5, 'All five summary answers must still render detailed feedback cards.');
    assert.ok(shown.feedbacks.height > 0, 'The feedback area must expand when feedback is intentionally shown.');
    assert.ok(shown.box.height > compact.box.height, 'The summary box must grow naturally to contain shown feedback.');
    for (const host of shown.hosts) {
      assertZeroHostChrome(host);
      assert.equal(host.visibleCards, 1, 'Each question host must retain its own feedback card.');
    }

    await summaryReveal.click();
    await studyPage.waitForTimeout(300);
    const hiddenAgain = await layoutSnapshot(studyPage);
    assert.equal(hiddenAgain.visibleCards, 0, 'Hiding feedback must remove the detailed cards.');
    assert.equal(hiddenAgain.feedbacks.height, 0, 'The feedback area must collapse again without leaving a gap.');
    assert.ok(hiddenAgain.box.height < 340, 'The summary must return to its compact content height after feedback closes.');

    assert.deepEqual(pageErrors, [], `Unexpected browser errors: ${pageErrors.join(' | ')}`);
    console.log(JSON.stringify({ compact, shown, hiddenAgain }, null, 2));
    console.log('PASS Test 1 summary remains compact while detailed Questions 33–37 feedback still expands normally');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
