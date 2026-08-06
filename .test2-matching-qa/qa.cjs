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
  await page.getByRole('button', { name: /Study mode/i }).click();
  await page.waitForFunction(() => document.documentElement.dataset.gtTest2Campsites === 'ready');
  await page.waitForSelector('.reading-shell-study-icon-button:not([hidden])');

  assert.equal(await page.locator('.gt-test2-campsite-source').count(), 5, 'five campsite sources');
  assert.equal(await page.locator('.gt-test2-campsite-zone').count(), 7, 'seven campsite answer zones');
  assert.equal(await page.locator('#questionContent > [data-section="1"] select[name^="q"].sr-only').count(), 7, 'q1–7 selects hidden behind answer boxes');

  const sourceD = page.locator('.gt-test2-campsite-source[data-value="D"]');
  const q1 = page.locator('.gt-test2-campsite-zone[data-for="q1"]');
  const q4 = page.locator('.gt-test2-campsite-zone[data-for="q4"]');
  await sourceD.click();
  await q1.click();
  await q4.click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), 'D');
  assert.equal(await page.locator('select[name="q4"]').inputValue(), 'D');
  assert.equal((await q1.innerText()).trim(), 'D');
  assert.equal((await q4.innerText()).trim(), 'D');

  const q2 = page.locator('.gt-test2-campsite-zone[data-for="q2"]');
  await q2.focus();
  await page.keyboard.press('A');
  assert.equal(await page.locator('select[name="q2"]').inputValue(), 'A');
  assert.equal((await q2.innerText()).trim(), 'A');

  const sourceC = page.locator('.gt-test2-campsite-source[data-value="C"]');
  const q3 = page.locator('.gt-test2-campsite-zone[data-for="q3"]');
  await sourceC.dragTo(q3);
  assert.equal(await page.locator('select[name="q3"]').inputValue(), 'C');
  assert.equal((await q3.innerText()).trim(), 'C');

  const clearQ1 = q1.locator('xpath=following-sibling::button[contains(@class,"gt-section1-clear")]');
  await clearQ1.click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), '');
  assert.match(await q1.innerText(), /Drop here/i);

  const info = page.locator('.reading-shell-study-icon-button:not([hidden])').first();
  await info.click();
  const panel = page.locator('.reading-shell-study-panel:not([hidden])').first();
  await panel.waitFor({ state: 'visible' });
  assert.match(await panel.innerText(), /strategy/i);

  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);

  console.log('PASS IELTS 19 GT Test 2 Section 1 matching QA');
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
