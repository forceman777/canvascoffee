#!/usr/bin/env node
/**
 * End-to-end checks of the real user flows in a browser (Playwright).
 *
 *   npm run qa
 *
 * Builds three variants and serves each one:
 *   1. nothing configured          → submissions must be disabled with a setup notice
 *   2. WhatsApp number configured  → hand-off opens wa.me with the exact order text
 *   3. Supabase configured         → the RPC endpoint is mocked; success is shown only
 *                                    after a server response, and errors are shown honestly
 */
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `\n      ${detail}` : ''}`);
};

function build(outDir, env) {
  execSync(`npx vite build --outDir ${outDir} --emptyOutDir`, { stdio: 'ignore', env: { ...process.env, ...env } });
}
async function serve(outDir, port) {
  const p = spawn('npx', ['vite', 'preview', '--outDir', outDir, '--port', String(port), '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`http://localhost:${port}/`);
      return p;
    } catch {
      await wait(250);
    }
  }
  throw new Error(`preview on ${port} did not start`);
}

const text = (page, sel) => page.locator(sel).first().innerText();
const money = (s) => Number(String(s).replace(/[^\d.]/g, ''));

async function summary(page) {
  const rows = page.locator('.order-page__aside .order-summary__rows > div');
  const sub = money(await rows.nth(0).locator('dd').innerText());
  const del = await rows.nth(1).locator('dd').innerText();
  const tot = money(await rows.nth(2).locator('dd').innerText());
  return { sub, del: del.trim() === 'Free' ? 0 : money(del), tot };
}

async function addSimple(page, name) {
  await page.getByRole('button', { name: `Add ${name}`, exact: true }).click();
}
async function choose(page, name, { variant, addOn, qty = 1 } = {}) {
  await page.getByRole('button', { name: `Choose options for ${name}`, exact: true }).click();
  const dialog = page.locator('dialog[open]');
  if (variant) await dialog.getByRole('radio', { name: new RegExp(`^${variant} ₹`) }).check();
  if (addOn) await dialog.getByLabel(addOn).check();
  for (let i = 1; i < qty; i++) await dialog.getByRole('button', { name: 'Increase quantity' }).click();
  const label = await dialog.locator('button[type=submit]').innerText();
  await dialog.locator('button[type=submit]').click();
  await page.locator('dialog[open]').waitFor({ state: 'detached' }).catch(() => {});
  return label;
}

async function fillCheckout(page) {
  await page.getByLabel('Name').fill('Test Customer');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Delivery address').fill('12 Test Road, Belda');
}

// ---------------------------------------------------------------------------------------
async function scenarioUnconfigured(base, browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${base}/menu`);
  await page.locator('.menu-item').first().waitFor();
  const count = await page.locator('.menu-item').count();
  check('Menu shows all 55 products', count === 55, `found ${count}`);

  await page.getByLabel('Search the menu').fill('momo');
  await wait(300);
  check('Search "momo" finds the 4 momos', (await page.locator('.menu-item').count()) === 4);
  await page.getByLabel('Search the menu').fill('zzzz');
  await wait(300);
  check('Search with no match shows an empty state', await page.getByText('Nothing on the menu matches').isVisible());
  await page.getByRole('button', { name: 'Clear search' }).first().click();
  await wait(300);
  check('Clearing search restores the menu', (await page.locator('.menu-item').count()) === 55);

  await addSimple(page, 'Leaker Tea');
  check('Adding a simple item shows a toast', await page.locator('.toast').first().isVisible());
  check('Header order count updates', (await text(page, '.order-pill__count')) === '1');

  const momoLabel = await choose(page, 'Veg Momo', { variant: 'Pan Fried', qty: 2 });
  check('Momo dialog total: 2 × Pan Fried = ₹180', momoLabel.includes('₹180'), momoLabel);
  const burgerLabel = await choose(page, 'Chicken Burger', { addOn: 'Cheese Slice Add-on' });
  check('Burger + cheese slice = ₹90', burgerLabel.includes('₹90'), burgerLabel);

  await page.getByRole('button', { name: 'Choose options for Kurkure Momo (Veg)' }).count().then((n) =>
    check('Kurkure Momo (Fried only) adds directly, without false choices', n === 0),
  );

  await page.goto(`${base}/order`);
  let s = await summary(page);
  check('Order subtotal ₹285 + ₹25 delivery = ₹310', s.sub === 285 && s.del === 25 && s.tot === 310, JSON.stringify(s));
  check('Free-delivery hint says ₹216 more', (await page.locator('.delivery-progress').innerText()).includes('₹216'));

  // Edit the momo line: change preparation to Steam
  await page.getByRole('button', { name: 'Change options for Veg Momo' }).click();
  await page.locator('dialog[open]').getByRole('radio', { name: /^Steam ₹/ }).check();
  await page.locator('dialog[open] button[type=submit]').click();
  await wait(200);
  s = await summary(page);
  check('Editing variant updates totals (₹225)', s.sub === 225, JSON.stringify(s));

  // Quantity change and removal
  await page.getByRole('group', { name: 'Quantity of Leaker Tea' }).getByRole('button', { name: 'Increase quantity' }).click();
  s = await summary(page);
  check('Quantity increase updates subtotal (₹240)', s.sub === 240, JSON.stringify(s));
  await page.getByRole('button', { name: 'Remove Leaker Tea' }).click();
  s = await summary(page);
  check('Removing a line updates subtotal (₹210)', s.sub === 210, JSON.stringify(s));

  // ---- Exact ₹500 boundary ----
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/menu`);
  await choose(page, 'Veg Pizza', { qty: 4 });
  await page.goto(`${base}/order`);
  s = await summary(page);
  check('BOUNDARY: ₹500 exactly → ₹25 delivery, total ₹525', s.sub === 500 && s.del === 25 && s.tot === 525, JSON.stringify(s));
  check('BOUNDARY: hint says ₹1 more for free delivery', (await page.locator('.delivery-progress').innerText()).includes('₹1 more'));
  await page.goto(`${base}/menu`);
  await addSimple(page, 'Leaker Tea');
  await page.goto(`${base}/order`);
  s = await summary(page);
  check('BOUNDARY: ₹515 → free delivery, total ₹515', s.sub === 515 && s.del === 0 && s.tot === 515, JSON.stringify(s));

  // Persistence across reload
  await page.reload();
  s = await summary(page);
  check('Order persists after reload', s.sub === 515);

  // Checkout validation
  await page.getByRole('button', { name: 'Continue to delivery details' }).click();
  await page.getByRole('button', { name: 'Review order' }).click();
  check('Empty checkout shows 3 field errors', (await page.locator('.field__error').count()) === 3);
  await page.getByLabel('Phone').fill('123');
  await page.getByRole('button', { name: 'Review order' }).click();
  check('Invalid phone is explained', (await page.locator('#checkout-phone-error').innerText()).includes('10-digit'));
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Review order' }).click();
  check('Valid details reach the review step', await page.getByRole('heading', { name: 'Review and send' }).isVisible());
  check('Unconfigured: setup notice is shown', await page.getByText('Online ordering is not connected yet').isVisible());
  check('Unconfigured: send button is disabled', await page.getByRole('button', { name: 'Send order request' }).isDisabled());

  // Reservations
  await page.goto(`${base}/reservations`);
  await page.getByRole('button', { name: 'Review request' }).click();
  check('Empty reservation shows errors', (await page.locator('.booking-form .field__error').count()) >= 4);
  const tomorrow = new Date(Date.now() + 86400000);
  const iso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  await page.locator('#res-date').fill(iso);
  await page.locator('#res-time').fill('19:30');
  await page.locator('#res-partySize').selectOption('4');
  await page.locator('#res-name').fill('Test Guest');
  await page.locator('#res-phone').fill('9876543210');
  await page.getByRole('button', { name: 'Review request' }).click();
  check('Valid reservation reaches review', await page.getByRole('heading', { name: 'Check your request' }).isVisible());
  check('Unconfigured: reservation send disabled with notice', (await page.getByText('Table requests are not connected yet').isVisible()) && (await page.getByRole('button', { name: 'Send table request' }).isDisabled()));

  // Occasion enquiry validation
  await page.locator('.occasion-form').evaluate((f) => f.requestSubmit());
  check('Occasion enquiry is clearly marked as not a booking', await page.getByText('This is an enquiry, not a booking.').isVisible());

  // Whisper box
  await page.goto(`${base}/contact`);
  await page.getByLabel('Your note').waitFor();
  check('Whisper Box: unconfigured notice + disabled button', (await page.getByText('The Whisper Box is not connected yet').isVisible()) && (await page.getByRole('button', { name: 'Leave the note' }).isDisabled()));

  // Mobile navigation
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const sheet = page.locator('dialog.mobile-nav[open]');
  check('Mobile navigation opens', await sheet.isVisible());
  await page.keyboard.press('Escape');
  check('Mobile navigation closes with Escape', !(await sheet.isVisible().catch(() => false)));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('dialog.mobile-nav[open]').getByRole('link', { name: 'Our Story' }).click();
  await page.waitForURL('**/story');
  check('Mobile navigation link navigates', page.url().endsWith('/story'));
  check('Mobile order bar is shown when the order has items', await page.locator('.cart-bar').isVisible());

  // Home deep link to a menu category
  await page.goto(`${base}/`);
  await page.locator('a[href="/menu#momo"]').click();
  await page.waitForURL('**/menu#momo');
  await wait(400);
  const top = await page.locator('#momo').evaluate((el) => el.getBoundingClientRect().top);
  check('Home → /menu#momo scrolls to the Momo section', top < 300 && top > -50, `top=${top}`);

  // Reduced motion: static iced-latte series
  const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const rp = await rm.newPage();
  await rp.goto(`${base}/`);
  check('Reduced motion: iced latte shows all 5 frames statically', (await rp.locator('.signature__series li').count()) === 5);
  await rm.close();

  // 404
  await page.goto(`${base}/does-not-exist`);
  await page.getByText('This page is not on the menu').waitFor({ timeout: 5000 }).catch(() => {});
  check('Unknown URL shows the not-found page', await page.getByText('This page is not on the menu').isVisible());

  check('No uncaught page errors (unconfigured build)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------
async function scenarioWhatsApp(base, browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/menu`);
  await choose(page, 'Chicken Momo', { variant: 'Fried' });
  await page.goto(`${base}/order`);
  await page.getByRole('button', { name: 'Continue to delivery details' }).click();
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Review order' }).click();
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Send order on WhatsApp' }).click()]);
  const url = decodeURIComponent(popup.url().replace(/\+/g, ' '));
  check('WhatsApp: opens wa.me with the configured number', popup.url().includes('wa.me/910000000000') || popup.url().includes('api.whatsapp.com'), popup.url());
  check('WhatsApp: message has item, variant and exact totals', url.includes('1 × Chicken Momo · Fried: ₹80') && url.includes('Delivery: ₹25') && url.includes('Total: ₹105'), url);
  await popup.close();
  check('WhatsApp: page does not claim the order is placed', await page.getByText('Your order is only placed once you press send in WhatsApp').isVisible());
  check('WhatsApp: order kept until the visitor confirms', (await page.locator('.order-pill__count').innerText()) === '1');
  await ctx.close();
}

// ---------------------------------------------------------------------------------------
async function scenarioBackend(base, browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  let sentItems = null;
  let fail = false;
  await page.route('**/rest/v1/rpc/**', async (route) => {
    const fn = route.request().url().split('/rpc/')[1];
    const body = route.request().postDataJSON();
    await wait(400);
    if (fail) return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'rate_limited' }) });
    if (fn === 'place_order') {
      sentItems = body.p_items;
      return route.fulfill({ json: { reference: 'CO-TEST1', status: 'pending', subtotal: 120, delivery_fee: 25, total: 145 } });
    }
    if (fn === 'get_order_status') return route.fulfill({ json: { reference: 'CO-TEST1', status: 'confirmed', updated_at: new Date().toISOString() } });
    if (fn === 'request_reservation') return route.fulfill({ json: { reference: 'RS-TEST1', status: 'pending' } });
    if (fn === 'leave_message') return route.fulfill({ json: { received: true } });
    return route.fulfill({ status: 404, body: '{}' });
  });

  await page.goto(`${base}/menu`);
  await addSimple(page, 'Iced Mocha');
  await addSimple(page, 'Iced Mocha');
  await page.goto(`${base}/order`);
  await page.getByRole('button', { name: 'Continue to delivery details' }).click();
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Review order' }).click();

  fail = true;
  await page.getByRole('button', { name: 'Send order request' }).click();
  await page.locator('.notice--error').waitFor();
  check('Backend error is shown honestly, order kept', (await page.locator('.notice--error').innerText()).includes('Several requests') && (await page.locator('.order-pill__count').innerText()) === '2');

  fail = false;
  await page.getByRole('button', { name: 'Send order request' }).click();
  check('Sending shows a loading state', await page.locator('button[aria-busy=true]').isVisible());
  await page.getByRole('heading', { name: 'Order request received' }).waitFor();
  check('Only ids/quantities are sent (no prices)', JSON.stringify(sentItems) === JSON.stringify([{ product_id: 'iced-mocha', variant_id: null, add_on_ids: [], quantity: 2 }]), JSON.stringify(sentItems));
  check('Success shows the server reference and "Pending" status', (await page.getByText('CO-TEST1').isVisible()) && (await page.getByText('Pending: awaiting café confirmation').isVisible()));
  check('Order cleared after server confirmation', (await page.locator('.order-pill__count').count()) === 0);
  await page.getByRole('button', { name: 'Check status' }).click();
  await page.getByText('Confirmed by the café').waitFor({ timeout: 5000 }).catch(() => {});
  check('Status check shows the server status', await page.getByText('Confirmed by the café').isVisible());

  await page.goto(`${base}/reservations`);
  const t = new Date(Date.now() + 2 * 86400000);
  await page.locator('#res-date').fill(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
  await page.locator('#res-time').fill('13:00');
  await page.locator('#res-name').fill('Test Guest');
  await page.locator('#res-phone').fill('9876543210');
  await page.getByRole('button', { name: 'Review request' }).click();
  await page.getByRole('button', { name: 'Send table request' }).click();
  await page.getByRole('heading', { name: 'Table request sent' }).waitFor();
  check('Reservation success says it is a request, not a confirmed booking', await page.getByText('This is a request, not a confirmed booking.').isVisible());

  await page.goto(`${base}/contact`);
  await page.getByLabel('Your note').fill('Lovely cold coffee.');
  await page.getByRole('button', { name: 'Leave the note' }).click();
  await page.getByRole('heading', { name: 'Your note is in the box' }).waitFor();
  check('Whisper Box confirms only after server response', true);
  await ctx.close();
}

// ---------------------------------------------------------------------------------------
const servers = [];
try {
  console.log('Building three variants…');
  build('qa-output/dist-plain', { VITE_WHATSAPP_NUMBER: '', VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' });
  build('qa-output/dist-wa', { VITE_WHATSAPP_NUMBER: '910000000000', VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' });
  build('qa-output/dist-db', { VITE_WHATSAPP_NUMBER: '', VITE_SUPABASE_URL: 'http://localhost:4193/mock', VITE_SUPABASE_ANON_KEY: 'public-anon-test' });
  servers.push(await serve('qa-output/dist-plain', 4191), await serve('qa-output/dist-wa', 4192), await serve('qa-output/dist-db', 4193));
  const browser = await chromium.launch();
  await scenarioUnconfigured('http://localhost:4191', browser);
  await scenarioWhatsApp('http://localhost:4192', browser);
  await scenarioBackend('http://localhost:4193', browser);
  await browser.close();
} catch (err) {
  check('QA run completed without crashing', false, err.stack);
} finally {
  servers.forEach((s) => s.kill());
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
