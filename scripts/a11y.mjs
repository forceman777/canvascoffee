#!/usr/bin/env node
/** Runs axe-core accessibility checks on every page. Requires `npm run preview` running. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const base = process.argv[2] || 'http://localhost:4173';
const routes = ['/', '/story', '/menu', '/order', '/reservations', '/gallery', '/contact'];
const browser = await chromium.launch();
let total = 0;
for (const [label, width] of [['mobile', 390], ['desktop', 1440]]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    await page.waitForTimeout(800);
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] })).violations);
    for (const v of res) {
      total++;
      console.log(`[${label} ${r}] ${v.impact} ${v.id}: ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`);
    }
  }
  await page.close();
}
await browser.close();
console.log(total ? `${total} violation group(s)` : 'No axe violations.');
process.exit(total ? 1 : 0);
