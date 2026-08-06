const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const PAGE_URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-2/IELTS19%20Test%202%20-%20Reading%20-%20GT.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.gtTest2Campsites === 'ready');
  await page.getByRole('button', { name: /Test mode/i }).click();
  await page.locator('#studentNameInput').fill('Test Candidate');
  await page.getByRole('button', { name: /Start the test now/i }).click();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('app')).display !== 'none');

  assert.equal(await page.locator('.reading-shell-study-icon-button:not([hidden])').count(), 0, 'Study strategy controls hidden during Test mode');
  assert.equal(await page.locator('.gt-test2-campsite-source').count(), 5);
  assert.equal(await page.locator('.gt-test2-campsite-zone').count(), 7);

  const sourceE = page.locator('.gt-test2-campsite-source[data-value="E"]');
  const q1 = page.locator('.gt-test2-campsite-zone[data-for="q1"]');
  await sourceE.click();
  await q1.click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), 'E');

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#primarySubmitBtn').click();
  await page.locator('#resultsOverlay').waitFor({ state: 'visible' });

  assert.equal(await sourceE.getAttribute('aria-disabled'), 'true');
  assert.equal(await q1.getAttribute('aria-disabled'), 'true');
  assert.equal(await q1.getAttribute('tabindex'), '-1');
  assert.equal(await page.locator('select[name="q1"]').isDisabled(), true);
  assert.equal(await q1.locator('xpath=following-sibling::button[contains(@class,"gt-section1-clear")]').isDisabled(), true);

  const before = await page.locator('select[name="q2"]').inputValue();
  await page.locator('.gt-test2-campsite-source[data-value="A"]').dispatchEvent('click');
  await page.locator('.gt-test2-campsite-zone[data-for="q2"]').dispatchEvent('click');
  assert.equal(await page.locator('select[name="q2"]').inputValue(), before, 'submitted answer controls remain locked');

  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);
  console.log('PASS IELTS 19 GT Test 2 Test-mode matching and locking QA');
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
