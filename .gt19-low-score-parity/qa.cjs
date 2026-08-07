const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const tests = [1, 2, 3, 4];
const base = 'http://127.0.0.1:4173/general-training/cambridge-19';

function visibleCount(page, selector) {
  return page.locator(selector).evaluateAll(nodes => nodes.filter(node => Boolean(
    node.offsetWidth || node.offsetHeight || node.getClientRects().length
  )).length);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const number of tests) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      page.setDefaultTimeout(20000);
      const errors = [];
      const warnings = [];
      page.on('pageerror', error => errors.push(String(error)));
      page.on('console', message => {
        if (message.type() === 'warning') warnings.push(message.text());
      });
      page.on('dialog', dialog => dialog.accept());

      const url = `${base}/test-${number}/IELTS19%20Test%20${number}%20-%20Reading%20-%20GT.html`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => typeof computeBandScore === 'function');

      const boundary = await page.evaluate(() => ({
        zero: computeBandScore(0),
        one: computeBandScore(1),
        eight: computeBandScore(8),
        nine: computeBandScore(9),
      }));
      assert.deepEqual(boundary, { zero: 'Below 3', one: 'Below 3', eight: 'Below 3', nine: 3 }, `Test ${number} score boundary mismatch`);

      await page.waitForFunction(() => Boolean(window.ReadingFeatureShell));
      await page.evaluate(() => {
        window.startTest('test');
        isTestRunning = true;
        isTimerPaused = false;
        const modeScreen = document.getElementById('modeScreen');
        if (modeScreen) modeScreen.style.display = 'none';
      });
      await page.waitForSelector('#primarySubmitBtn');
      await page.locator('#primarySubmitBtn').click();
      await page.waitForFunction(() => typeof testSubmitted !== 'undefined' && testSubmitted === true);

      const bandText = (await page.locator('#bandLine').innerText()).replace(/\s+/g, ' ').trim();
      const descriptorText = (await page.locator('#descriptorLine').innerText()).replace(/\s+/g, ' ').trim();
      assert.match(bandText, /Estimated IELTS General Training Reading band: Below 3\. Skill level: Developing user/i, `Test ${number} result label`);
      assert.match(descriptorText, /below Band 3 on the current General Training Reading score guide/i, `Test ${number} descriptor`);

      await page.evaluate(() => {
        if (typeof window.closeResults === 'function') window.closeResults();
      });
      await page.waitForTimeout(300);

      const scoreFeedbackButton = page.getByRole('button', { name: /score feedback/i }).first();
      await scoreFeedbackButton.waitFor({ state: 'visible' });
      await scoreFeedbackButton.click();
      await page.getByText('Submitted band: Below 3.', { exact: true }).waitFor({ state: 'visible' });
      assert.ok(await visibleCount(page, '.reading-shell-score-feedback-text') > 0, `Test ${number} score feedback should render`);

      assert.equal(
        warnings.some(message => /could not read the explicitly enabled DOM submitted result/i.test(message)),
        false,
        `Test ${number} should not emit submitted-result parsing warnings`
      );
      assert.deepEqual(errors, [], `Test ${number} browser errors: ${errors.join(' | ')}`);
      console.log(`PASS Test ${number}: Below 3 conversion, result overlay and submitted feedback`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
