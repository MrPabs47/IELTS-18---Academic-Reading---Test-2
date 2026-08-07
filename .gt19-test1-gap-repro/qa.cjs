const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4173/general-training/cambridge-19/test-1/IELTS19%20Test%201%20-%20Reading%20-%20GT.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1660, height: 936 } });
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => console.log('BROWSER', message.type(), message.text()));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.startTest === 'function' && typeof window.switchSection === 'function');
    await page.evaluate(() => {
      window.startTest('test');
      isTestRunning = true;
      const modeScreen = document.getElementById('modeScreen');
      if (modeScreen) modeScreen.style.display = 'none';
      window.switchSection(3);
    });
    await page.waitForFunction(() => document.querySelector('#questionContent > [data-section="3"]')?.style.display === 'block');
    await page.waitForTimeout(500);

    const diagnostics = await page.evaluate(() => {
      const box = document.querySelector('#questionContent > [data-section="3"] .summary-completion-box');
      if (!box) throw new Error('Summary completion box not found');
      const rect = node => {
        const r = node.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      };
      const style = node => {
        const cs = getComputedStyle(node);
        return {
          display: cs.display,
          position: cs.position,
          height: cs.height,
          minHeight: cs.minHeight,
          maxHeight: cs.maxHeight,
          flex: cs.flex,
          flexGrow: cs.flexGrow,
          flexShrink: cs.flexShrink,
          alignSelf: cs.alignSelf,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
          boxSizing: cs.boxSizing,
          overflow: cs.overflow,
          contain: cs.contain
        };
      };
      const matchedRules = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        if (!rules) continue;
        const walk = list => {
          for (const rule of Array.from(list)) {
            if (rule.cssRules) walk(rule.cssRules);
            if (!rule.selectorText) continue;
            let matches = false;
            try { matches = box.matches(rule.selectorText); } catch {}
            if (!matches) continue;
            matchedRules.push({
              sheet: sheet.href || 'inline',
              selector: rule.selectorText,
              cssText: rule.style.cssText
            });
          }
        };
        walk(rules);
      }
      return {
        box: { rect: rect(box), style: style(box), html: box.outerHTML.slice(0, 800) },
        parent: { tag: box.parentElement.tagName, cls: box.parentElement.className, rect: rect(box.parentElement), style: style(box.parentElement) },
        children: Array.from(box.children).map(node => ({ tag: node.tagName, cls: node.className, rect: rect(node), style: style(node), text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) })),
        matchedRules,
        questionPane: { rect: rect(document.getElementById('questionContent')), scrollHeight: document.getElementById('questionContent').scrollHeight, clientHeight: document.getElementById('questionContent').clientHeight }
      };
    });

    diagnostics.pageErrors = errors;
    console.log('DIAGNOSTICS', JSON.stringify(diagnostics, null, 2));
    await page.screenshot({ path: '/tmp/gt19-test1-summary-gap.png', fullPage: false });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
