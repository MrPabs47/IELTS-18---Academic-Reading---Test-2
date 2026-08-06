const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4173/general-training/cambridge-19';
const tests = [1, 2, 3, 4].map(number => ({
  number,
  url: `${BASE}/test-${number}/IELTS19%20Test%20${number}%20-%20Reading%20-%20GT.html`,
}));

async function waitForShell(page) {
  await page.waitForFunction(() => Boolean(window.ReadingFeatureShell));
  await page.waitForFunction(() => document.querySelectorAll('.reading-shell-study-icon-button').length > 0);
}

async function startStudy(page) {
  await page.getByRole('button', { name: /Study mode/i }).click();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('app')).display !== 'none');
  await waitForShell(page);
  await page.waitForFunction(() => document.querySelectorAll('.reading-shell-study-icon-button:not([hidden])').length > 0);
}

async function startActiveTest(page) {
  await waitForShell(page);
  await page.evaluate(() => {
    window.startTest('test');
    if (typeof isTestRunning !== 'undefined') isTestRunning = true;
    if (typeof isTimerPaused !== 'undefined') isTimerPaused = false;
    const modeScreen = document.getElementById('modeScreen');
    if (modeScreen) modeScreen.style.display = 'none';
    if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === 'function') {
      window.ReadingFeatureShell.sync();
    }
  });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('app')).display !== 'none');
}

async function submitTest(page) {
  page.on('dialog', dialog => dialog.accept());
  const primary = page.locator('#primarySubmitBtn');
  await primary.waitFor({ state: 'visible' });
  await primary.click();
  await page.waitForFunction(() => typeof testSubmitted !== 'undefined' && testSubmitted === true);
  await page.evaluate(() => {
    if (typeof window.closeResults === 'function') window.closeResults();
    if (window.ReadingFeatureShell && typeof window.ReadingFeatureShell.sync === 'function') {
      window.ReadingFeatureShell.sync();
    }
  });
  await page.waitForFunction(() => document.querySelectorAll('.reading-shell-study-icon-button:not([hidden])').length > 0);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const test of tests) {
      const study = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      study.setDefaultTimeout(15000);
      const studyErrors = [];
      study.on('pageerror', error => studyErrors.push(String(error)));
      await study.goto(test.url, { waitUntil: 'networkidle' });
      await startStudy(study);
      assert.ok(
        await study.locator('.reading-shell-study-icon-button:not([hidden])').count() > 0,
        `Test ${test.number}: strategy buttons visible in Study mode`,
      );
      assert.deepEqual(studyErrors, [], `Test ${test.number} Study page errors: ${studyErrors.join(' | ')}`);
      await study.close();

      const exam = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      exam.setDefaultTimeout(15000);
      const examErrors = [];
      exam.on('pageerror', error => examErrors.push(String(error)));
      await exam.goto(test.url, { waitUntil: 'networkidle' });
      await startActiveTest(exam);
      assert.equal(
        await exam.locator('.reading-shell-study-icon-button:not([hidden])').count(),
        0,
        `Test ${test.number}: strategy buttons hidden during active Test mode`,
      );

      if (test.number === 2) {
        assert.equal(await exam.locator('.gt-test2-campsite-source').count(), 5, 'Test 2 campsite sources preserved');
        assert.equal(await exam.locator('.gt-test2-campsite-zone').count(), 7, 'Test 2 campsite zones preserved');
        await exam.locator('.gt-test2-campsite-source[data-value="C"]').click();
        await exam.locator('.gt-test2-campsite-zone[data-for="q1"]').click();
        assert.equal(await exam.locator('select[name="q1"]').inputValue(), 'C', 'Test 2 matching still records answers');
      }

      await submitTest(exam);
      assert.ok(
        await exam.locator('.reading-shell-study-icon-button:not([hidden])').count() > 0,
        `Test ${test.number}: strategy buttons restored after Test submission`,
      );
      assert.equal(await exam.locator('#primarySubmitBtn').isDisabled(), true, `Test ${test.number}: final submit locked`);
      assert.deepEqual(examErrors, [], `Test ${test.number} Test page errors: ${examErrors.join(' | ')}`);
      await exam.close();

      console.log(`PASS IELTS 19 GT Reading Test ${test.number}`);
    }

    console.log('PASS IELTS 19 GT Reading Tests 1–4 info-control lifecycle parity');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
