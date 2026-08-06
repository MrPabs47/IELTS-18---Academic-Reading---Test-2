import { chromium } from 'playwright';

const url = 'http://127.0.0.1:4173/general-training/cambridge-19/test-4/IELTS19%20Test%204%20-%20Reading%20-%20GT.html';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 920 } });
page.on('pageerror', error => console.log('PAGEERROR', error.stack || error));
page.on('console', message => console.log('CONSOLE', message.type(), message.text()));
await page.goto(url, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Study mode/i }).click();
await page.waitForFunction(() => document.body.getAttribute('data-gt-mode') === 'study');

await page.evaluate(() => {
  for (const q of [1, 4]) {
    const select = document.querySelector(`select[name="q${q}"]`);
    select.addEventListener('input', event => console.log('INPUT', q, event.target.value));
    select.addEventListener('change', event => console.log('CHANGE', q, event.target.value));
  }
  const originalSync = window.ReadingFeatureShell?.sync;
  if (typeof originalSync === 'function') {
    window.ReadingFeatureShell.sync = function (...args) {
      console.log('SHELL_SYNC_BEFORE', document.querySelector('select[name="q1"]').value, document.querySelector('select[name="q4"]').value);
      const result = originalSync.apply(this, args);
      console.log('SHELL_SYNC_AFTER', document.querySelector('select[name="q1"]').value, document.querySelector('select[name="q4"]').value);
      return result;
    };
  }
});

async function state(label) {
  console.log(label, await page.evaluate(() => ({
    q1: document.querySelector('select[name="q1"]').value,
    q4: document.querySelector('select[name="q4"]').value,
    z1: document.querySelector('.drop-zone[data-for="q1"]').textContent.trim(),
    z4: document.querySelector('.drop-zone[data-for="q4"]').textContent.trim(),
    selected: Array.from(document.querySelectorAll('.passage-match-source.selected')).map(node => node.dataset.value),
    sourcesC: document.querySelectorAll('.passage-match-source[data-value="C"]').length
  })));
}

await state('initial');
await page.locator('.passage-match-source[data-value="C"]').click();
await state('after source C');
await page.locator('.drop-zone[data-for="q1"]').click();
await state('after q1 C');
const clear = page.locator('.drop-zone[data-for="q1"]').locator('xpath=..').locator('button', { hasText: /Clear/i });
await clear.click();
await state('after q1 clear');
await page.locator('.passage-match-source[data-value="C"]').click();
await state('after source C again');
await page.locator('.drop-zone[data-for="q1"]').click();
await state('after q1 C again');
await page.locator('.drop-zone[data-for="q4"]').click();
await state('after q4 C reuse');

await browser.close();
