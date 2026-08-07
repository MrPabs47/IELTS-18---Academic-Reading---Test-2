const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';

function visibleCount(page, selector) {
  return page.locator(selector).evaluateAll(nodes => nodes.filter(node => Boolean(
    node.offsetWidth || node.offsetHeight || node.getClientRects().length
  )).length);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(20000);
  const pageErrors = [];
  const warnings = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  page.on('dialog', dialog => dialog.accept());

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.ReadingFeatureShell));
  await page.evaluate(() => {
    window.startTest('test');
    isTestRunning = true;
    const modeScreen = document.getElementById('modeScreen');
    if (modeScreen) modeScreen.style.display = 'none';
  });
  await page.waitForSelector('#primarySubmitBtn');
  await page.waitForFunction(() => document.body.getAttribute('data-gt-test-submitted') === 'false');

  assert.equal(
    await visibleCount(page, '.reading-shell-study-controls'),
    0,
    'Learning controls must stay hidden during the active Test attempt.'
  );

  await page.locator('#primarySubmitBtn').click();
  await page.waitForFunction(() => testSubmitted === true);
  await page.waitForFunction(() => document.body.getAttribute('data-gt-test-submitted') === 'true');
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    return text.includes('Submitted band: Below 3.');
  });
  await page.evaluate(() => window.closeResults());
  await page.waitForTimeout(300);

  assert.ok(
    await visibleCount(page, '.reading-shell-study-controls') > 0,
    'Learning controls must return after final Test submission.'
  );
  assert.ok(
    await visibleCount(page, '.reading-shell-study-icon-button') > 0,
    'The visible feedback/info buttons must return after submission.'
  );
  assert.ok(
    await visibleCount(page, '.reading-shell-score-feedback-text') > 0,
    'Submitted score feedback must be visibly rendered, including below-Band-3 results.'
  );
  assert.equal(await page.locator('#primarySubmitBtn').isDisabled(), true, 'Final Test submission must remain locked.');
  assert.equal(
    await page.locator('#questionContent select:not(:disabled), #questionContent input:not(:disabled)').count(),
    0,
    'Submitted answers must remain immutable.'
  );
  assert.equal(
    warnings.some(message => /could not read the explicitly enabled DOM submitted result/i.test(message)),
    false,
    'Test 4 must use its authoritative submitted-result snapshot rather than DOM parsing.'
  );

  const firstInfo = page.locator('.reading-shell-study-icon-button').filter({ visible: true }).first();
  await firstInfo.click();
  await page.waitForTimeout(150);
  assert.ok(
    await visibleCount(page, '[id^="reading-shell-feedback-"]') > 0,
    'Question-level feedback must open after Test submission.'
  );

  await page.locator('.top-left .logo').click();
  await page.waitForURL(url => /\/index\.html(?:$|[?#])/.test(url.href));
  assert.deepEqual(pageErrors, [], `Unexpected browser errors: ${pageErrors.join(' | ')}`);

  console.log('PASS IELTS 19 GT Reading Test 4 submitted feedback, immutable review and Live Hub logo navigation');
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
