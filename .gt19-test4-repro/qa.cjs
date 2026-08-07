const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', msg => console.log('BROWSER', msg.type(), msg.text()));
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
  await page.locator('#primarySubmitBtn').click();
  await page.waitForFunction(() => testSubmitted === true);
  await page.evaluate(() => window.closeResults());
  await page.waitForTimeout(250);

  const diagnostics = await page.evaluate(() => ({
    status: window.ReadingFeatureShell.getStatus(),
    bodyMode: document.body.getAttribute('data-gt-mode'),
    bodySubmitted: document.body.getAttribute('data-gt-test-submitted'),
    controls: Array.from(document.querySelectorAll('.reading-shell-study-controls')).map(node => ({
      tag: node.tagName,
      hidden: node.hidden,
      inlineDisplay: node.style.display,
      computedDisplay: getComputedStyle(node).display,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    })),
    infoButtons: Array.from(document.querySelectorAll('.reading-shell-study-icon-button')).map(node => ({
      hidden: node.hidden,
      disabled: node.disabled,
      computedDisplay: getComputedStyle(node).display,
      visible: Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length)
    })),
    feedbackCards: document.querySelectorAll('[id^="reading-shell-feedback-"]').length,
    visibleFeedbackCards: Array.from(document.querySelectorAll('[id^="reading-shell-feedback-"]')).filter(node => Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length)).length,
    scoreFeedback: Array.from(document.querySelectorAll('.reading-shell-score-feedback,.reading-shell-score-feedback-panel')).map(node => ({
      cls: node.className,
      hidden: node.hidden,
      computedDisplay: getComputedStyle(node).display,
      visible: Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length),
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
    }))
  }));
  console.log('DIAGNOSTICS', JSON.stringify(diagnostics, null, 2));

  await page.evaluate(() => {
    const logo = document.querySelector('.top-left .logo');
    if (logo) logo.click();
  });
  await page.waitForTimeout(250);
  console.log('AFTER_LOGO_URL', page.url());
  console.log('PAGE_ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
