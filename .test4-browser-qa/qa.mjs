import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const testUrl = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';
const browser = await chromium.launch({ headless: true });
const failures = [];

async function waitForVisible(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
}

async function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon/i.test(message.text())) errors.push(message.text());
  });
  return errors;
}

async function openStudy(page) {
  await page.goto(testUrl, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Study mode/i }).click();
  await waitForVisible(page, '#app');
  await waitForVisible(page, '.reading-shell-score-guide-button');
  await page.waitForFunction(() => window.ReadingFeatureShell?.getStatus?.().initialized === true);
}

async function findButtonByAccessibleText(page, pattern) {
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const value = [
      await button.innerText().catch(() => ''),
      await button.getAttribute('aria-label'),
      await button.getAttribute('title')
    ].filter(Boolean).join(' ');
    if (pattern.test(value)) return button;
  }
  return null;
}

async function desktopStudyCheck() {
  const page = await browser.newPage({ viewport: { width: 1680, height: 920 } });
  const errors = await collectPageErrors(page);
  await openStudy(page);

  assert.equal(await page.locator('body').getAttribute('data-gt-mode'), 'study');
  assert.equal(await page.locator('#candidateNameDisplay').isVisible(), false);
  assert.match(await page.locator('.test-title').innerText(), /IELTS 19 General Training Reading Test 4/);
  assert.match(await page.locator('#passageHeaderLine').innerText(), /^Section 1/);
  assert.ok((await page.locator('.part-chip').first().innerText()).startsWith('Section 1'));

  await page.locator('.reading-shell-score-guide-button').click();
  await waitForVisible(page, '.reading-shell-score-guide-dialog');
  const guide = await page.locator('.reading-shell-score-guide-dialog').evaluate(element => {
    const rect = element.getBoundingClientRect();
    const table = element.querySelector('.reading-shell-score-guide-table')?.getBoundingClientRect();
    return {
      width: rect.width,
      left: rect.left,
      right: rect.right,
      whiteSpace: getComputedStyle(element).whiteSpace,
      tableWidth: table?.width || 0,
      text: element.innerText
    };
  });
  assert.ok(guide.width >= 480, JSON.stringify(guide));
  assert.ok(guide.tableWidth >= 400, JSON.stringify(guide));
  assert.equal(guide.whiteSpace, 'normal');
  assert.match(guide.text, /General Training Reading score guide/);
  assert.match(guide.text, /0–8/);
  assert.match(guide.text, /Below 3/);
  await page.locator('.reading-shell-score-guide-close').click();

  await page.locator('.passage-match-source[data-value="C"]').click();
  await page.locator('.drop-zone[data-for="q1"]').click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), 'C');
  assert.equal((await page.locator('.drop-zone[data-for="q1"]').innerText()).trim(), 'C');
  const q1Clear = page.locator('.drop-zone[data-for="q1"]').locator('xpath=..').locator('button', { hasText: /Clear/i });
  await q1Clear.waitFor({ state: 'visible' });
  await q1Clear.click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), '');
  assert.match(await page.locator('.drop-zone[data-for="q1"]').innerText(), /Drop here/);

  await page.locator('.passage-match-source[data-value="C"]').click();
  await page.locator('.drop-zone[data-for="q1"]').click();
  await page.locator('.drop-zone[data-for="q4"]').click();
  assert.equal(await page.locator('select[name="q1"]').inputValue(), 'C');
  assert.equal(await page.locator('select[name="q4"]').inputValue(), 'C');

  await page.locator('.drop-zone[data-for="q2"]').focus();
  await page.keyboard.press('E');
  assert.equal(await page.locator('select[name="q2"]').inputValue(), 'E');

  assert.equal(await page.evaluate(() => computeBandScore(8)), 'Below 3');
  assert.equal(await page.evaluate(() => { document.querySelector('input[name="q38"][value="C"]').checked = true; return window.isUserAnswerCorrect(38); }), true);

  const answerKeyButton = await findButtonByAccessibleText(page, /answer key/i);
  assert.ok(answerKeyButton, 'Answer Key control was not found');
  await answerKeyButton.click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[role="dialog"],section,aside,div')).some(node => node.offsetParent && /Answer key/i.test(node.textContent || '')));
  await page.keyboard.press('Escape');

  await page.evaluate(() => setFontSize('xlarge'));
  for (const theme of ['black-on-white', 'white-on-black', 'yellow-on-black']) {
    await page.evaluate(value => setTheme(value), theme);
    await page.locator('.reading-shell-score-guide-button').click();
    await waitForVisible(page, '.reading-shell-score-guide-dialog');
    const visible = await page.locator('.reading-shell-score-guide-dialog').evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    assert.equal(visible, true);
    await page.locator('.reading-shell-score-guide-close').click();
  }

  await page.evaluate(() => submitTest());
  await waitForVisible(page, '#resultsOverlay');
  await page.locator('#resultsCloseBtn').click();
  await page.waitForFunction(() => document.body.innerText.includes('Why') && document.body.innerText.includes('Skill'));
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.close();
}

async function desktopTestCheck() {
  const page = await browser.newPage({ viewport: { width: 1680, height: 920 } });
  const errors = await collectPageErrors(page);
  await page.goto(testUrl, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Test mode/i }).click();
  await page.locator('#studentNameInput').fill('Pablo Jaramillo With A Deliberately Long Candidate Name');
  await page.getByRole('button', { name: /Start the test now/i }).click();
  await waitForVisible(page, '#app');
  await page.waitForFunction(() => document.body.getAttribute('data-gt-mode') === 'test');

  const headerOrder = await page.locator('.top-left').evaluate(element => Array.from(element.children).map(child => child.id || child.className));
  assert.deepEqual(headerOrder.slice(0, 3), ['logo home-link', 'test-title', 'candidateNameDisplay']);
  assert.match(await page.locator('#candidateNameDisplay').innerText(), /^Candidate: Pablo Jaramillo/);
  assert.equal(await page.locator('#candidateNameDisplay').isVisible(), true);
  assert.equal(await page.locator('.reading-shell-study-controls').isVisible().catch(() => false), false);

  await page.locator('.passage-match-source[data-value="C"]').click();
  await page.locator('.drop-zone[data-for="q1"]').click();
  await page.evaluate(() => submitTest());
  await waitForVisible(page, '#resultsOverlay');

  assert.equal(await page.evaluate(() => testSubmitted), true);
  assert.equal(await page.locator('.passage-match-source[data-value="C"]').getAttribute('draggable'), 'false');
  assert.equal(await page.locator('.passage-match-source[data-value="C"]').getAttribute('aria-disabled'), 'true');
  assert.equal(await page.locator('.drop-zone[data-for="q1"]').getAttribute('aria-disabled'), 'true');
  assert.equal(await page.locator('.drop-zone[data-for="q1"]').locator('xpath=..').locator('button', { hasText: /Clear/i }).isDisabled(), true);
  assert.equal(await page.locator('#primarySubmitBtn').isDisabled(), true);

  const before = await page.locator('select[name="q1"]').inputValue();
  await page.locator('.passage-match-source[data-value="E"]').click({ force: true }).catch(() => {});
  await page.locator('.drop-zone[data-for="q1"]').click({ force: true }).catch(() => {});
  assert.equal(await page.locator('select[name="q1"]').inputValue(), before);
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.close();
}

async function narrowStudyCheck() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = await collectPageErrors(page);
  await openStudy(page);
  await page.evaluate(() => setFontSize('xlarge'));
  await page.locator('.reading-shell-score-guide-button').click();
  await waitForVisible(page, '.reading-shell-score-guide-dialog');
  const layout = await page.locator('.reading-shell-score-guide-dialog').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewport: window.innerWidth,
      whiteSpace: getComputedStyle(element).whiteSpace,
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  assert.ok(layout.left >= 0, JSON.stringify(layout));
  assert.ok(layout.right <= layout.viewport + 1, JSON.stringify(layout));
  assert.ok(layout.width >= 340, JSON.stringify(layout));
  assert.equal(layout.whiteSpace, 'normal');
  assert.ok(layout.bodyOverflow <= 1, JSON.stringify(layout));
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.close();
}

for (const [name, check] of [
  ['desktop Study Mode', desktopStudyCheck],
  ['desktop Test Mode', desktopTestCheck],
  ['narrow Study Mode', narrowStudyCheck]
]) {
  try {
    await check();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.stack || error}`);
    console.error(`FAIL ${name}`);
  }
}

await browser.close();
assert.equal(failures.length, 0, failures.join('\n\n'));
