const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-2/IELTS19%20Test%202%20-%20Reading%20-%20GT.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const study = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    study.setDefaultTimeout(10000);
    await study.goto(URL, { waitUntil: 'networkidle' });
    await study.getByRole('button', { name: /Study mode/i }).click();
    await study.waitForFunction(() => getComputedStyle(document.getElementById('app')).display !== 'none');
    await study.waitForSelector('.reading-shell-study-icon-button');
    assert.equal(await study.locator('html').getAttribute('data-gt-test2-mode'), 'study');
    assert.ok(await study.locator('.reading-shell-study-icon-button:visible').count() > 0, 'info buttons visible in Study mode');
    assert.equal(await study.locator('.gt-test2-campsite-source').count(), 5);
    assert.equal(await study.locator('.gt-test2-campsite-zone').count(), 7);

    const test = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    test.setDefaultTimeout(10000);
    await test.goto(URL, { waitUntil: 'networkidle' });
    await test.getByRole('button', { name: /Test mode/i }).click();
    assert.equal(await test.locator('html').getAttribute('data-gt-test2-mode'), 'test');
    await test.evaluate(() => {
      window.startTest('test');
      isTestRunning = true;
      document.getElementById('modeScreen').style.display = 'none';
    });
    await test.waitForFunction(() => getComputedStyle(document.getElementById('app')).display !== 'none');
    await test.waitForSelector('.reading-shell-study-icon-button');
    assert.equal(await test.locator('.reading-shell-study-icon-button:visible').count(), 0, 'info buttons hidden in Test mode');
    assert.equal(await test.locator('.gt-test2-campsite-source').count(), 5);
    assert.equal(await test.locator('.gt-test2-campsite-zone').count(), 7);

    const source = test.locator('.gt-test2-campsite-source[data-value="C"]');
    const zone = test.locator('.gt-test2-campsite-zone[data-for="q1"]');
    await source.click();
    await zone.click();
    assert.equal(await test.locator('select[name="q1"]').inputValue(), 'C');

    console.log('PASS: Study info visible, Test info hidden, matching preserved');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
