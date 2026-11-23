#!/usr/bin/env node
/**
 * Screenshot every route at mobile / tablet / desktop widths and report console errors
 * and horizontal overflow. Usage: node scripts/screens.mjs [outDir] [baseUrl]
 * Requires a running server (npm run preview) and Playwright.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const out = process.argv[2] || 'qa-output/screens';
const base = process.argv[3] || 'http://localhost:4173';
const routes = ['/', '/story', '/menu', '/order', '/reservations', '/gallery', '/contact', '/nope'];
const viewports = [
  ['mobile', 390, 844],
  ['tablet', 834, 1112],
  ['desktop', 1440, 900],
];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
let problems = 0;
for (const [name, width, height] of viewports) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    // Scroll through so reveal animations trigger, then return to the top.
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) {
      problems++;
      console.log(`OVERFLOW ${name} ${route}: ${overflow}px`);
    }
    const file = `${out}/${name}${route === '/' ? '-home' : route.replace(/\//g, '-')}.png`;
    await page.screenshot({ path: file, fullPage: true });
  }
  if (errors.length) {
    problems++;
    console.log(`CONSOLE ERRORS (${name}):\n  ${[...new Set(errors)].join('\n  ')}`);
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `${problems} problem(s) found` : 'No overflow or console errors.');
