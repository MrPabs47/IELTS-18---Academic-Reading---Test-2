const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1660, height: 936 }, reducedMotion: 'no-preference' });
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.goto(URL, { waitUntil: 'networkidle' });

    await page.waitForFunction(() => document.querySelectorAll('.top-left .logo .logo-char').length === 10);
    await page.evaluate(() => {
      const app = document.getElementById('app');
      const modeScreen = document.getElementById('modeScreen');
      if (app) app.style.display = 'block';
      if (modeScreen) modeScreen.style.display = 'none';
    });

    const logo = page.locator('.top-left .logo.home-link');
    await logo.waitFor({ state: 'visible' });

    const before = await logo.evaluate(node => ({
      text: node.textContent,
      ariaLabel: node.getAttribute('aria-label'),
      charCount: node.querySelectorAll('.logo-char').length,
      className: node.className,
      title: node.getAttribute('title')
    }));

    assert.equal(before.text.replace(/\u00a0/g, ' '), 'IELTS Pabs');
    assert.equal(before.ariaLabel, 'Return to IELTS Pabs home');
    assert.equal(before.charCount, 10);
    assert.match(before.className, /home-link/);
    assert.equal(before.title, 'Return to home');

    await logo.hover();
    await page.waitForFunction(() => document.querySelector('.top-left .logo')?.classList.contains('is-animating'));

    const during = await logo.evaluate(node => {
      const first = node.querySelector('.logo-char');
      const computed = first ? getComputedStyle(first) : null;
      return {
        animating: node.classList.contains('is-animating'),
        animationName: computed ? computed.animationName : '',
        animationDuration: computed ? computed.animationDuration : '',
        colour: getComputedStyle(node).color
      };
    });

    assert.equal(during.animating, true);
    assert.equal(during.animationName, 'logoReveal');
    assert.equal(during.animationDuration, '0.45s');

    await page.mouse.move(800, 500);
    await page.waitForFunction(() => !document.querySelector('.top-left .logo')?.classList.contains('is-animating'));

    const after = await logo.evaluate(node => ({
      animating: node.classList.contains('is-animating'),
      charCount: node.querySelectorAll('.logo-char').length,
      text: node.textContent
    }));

    assert.equal(after.animating, false);
    assert.equal(after.charCount, 10);
    assert.equal(after.text.replace(/\u00a0/g, ' '), 'IELTS Pabs');
    assert.deepEqual(pageErrors, []);

    console.log(JSON.stringify({ before, during, after }, null, 2));
    console.log('PASS Test 4 IELTS Pabs logo hover animation starts and resets cleanly');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
