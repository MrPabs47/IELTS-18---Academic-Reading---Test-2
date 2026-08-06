import { chromium } from 'playwright';

const url = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';
const browser = await chromium.launch({ headless: true });

async function inspect(label, action) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', error => { errors.push(`pageerror: ${error.stack || error}`); console.log(errors.at(-1)); });
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.push(`console ${message.type()}: ${message.text()}`);
      console.log(errors.at(-1));
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log(label, 'before', await page.evaluate(() => ({
    readyState: document.readyState,
    appDisplay: getComputedStyle(document.getElementById('app')).display,
    modeDisplay: getComputedStyle(document.getElementById('modeScreen')).display,
    startTestType: typeof window.startTest,
    beginTimedTestType: typeof window.beginTimedTest,
    buttons: Array.from(document.querySelectorAll('.mode-btn[data-mode]')).map(button => ({ text: button.textContent.trim(), mode: button.dataset.mode })),
    shell: window.ReadingFeatureShell?.getStatus?.() || null
  })));
  await action(page);
  await page.waitForTimeout(1000);
  console.log(label, 'after click', await page.evaluate(() => ({
    appInline: document.getElementById('app').style.display,
    appDisplay: getComputedStyle(document.getElementById('app')).display,
    modeInline: document.getElementById('modeScreen').style.display,
    modeDisplay: getComputedStyle(document.getElementById('modeScreen')).display,
    startScreenInline: document.getElementById('testStartScreen').style.display,
    bodyMode: document.body.getAttribute('data-gt-mode'),
    lexicalMode: typeof mode === 'undefined' ? 'undefined' : mode,
    testRunning: typeof isTestRunning === 'undefined' ? 'undefined' : isTestRunning,
    shell: window.ReadingFeatureShell?.getStatus?.() || null
  })));
  if ((await page.locator('#app').isVisible()) === false) {
    console.log(label, 'calling window.startTest directly');
    await page.evaluate(() => window.startTest('study'));
    await page.waitForTimeout(500);
    console.log(label, 'after direct call', await page.evaluate(() => ({
      appDisplay: getComputedStyle(document.getElementById('app')).display,
      modeDisplay: getComputedStyle(document.getElementById('modeScreen')).display,
      bodyMode: document.body.getAttribute('data-gt-mode'),
      lexicalMode: typeof mode === 'undefined' ? 'undefined' : mode
    })));
  }
  console.log(label, 'errors', errors);
  await page.close();
}

await inspect('study', async page => {
  await page.getByRole('button', { name: /Study mode/i }).click();
});

await inspect('test', async page => {
  await page.getByRole('button', { name: /Test mode/i }).click();
  await page.waitForTimeout(200);
  console.log('test start screen visible', await page.locator('#testStartScreen').isVisible());
  if (await page.locator('#testStartScreen').isVisible()) {
    await page.locator('#studentNameInput').fill('Diagnostic Candidate');
    await page.getByRole('button', { name: /Start the test now/i }).click();
  }
});

await browser.close();
