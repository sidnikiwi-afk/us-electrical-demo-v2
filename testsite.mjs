import { chromium } from 'playwright';

const base = process.argv[2];
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const bad = [];

// desktop: FAQ accordion + counters + anchor nav
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
p.on('pageerror', (e) => bad.push('JS ERROR: ' + e.message));
await p.goto(base, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

const firstQ = p.locator('[data-faq-toggle]').first();
console.log('FAQ collapsed at start:', (await firstQ.getAttribute('aria-expanded')) === 'false');
await firstQ.click();
await p.waitForTimeout(300);
console.log('FAQ opens on click:    ', (await firstQ.getAttribute('aria-expanded')) === 'true');
await firstQ.click();
await p.waitForTimeout(300);
console.log('FAQ closes again:      ', (await firstQ.getAttribute('aria-expanded')) === 'false');

await p.goto(base + '#landlords', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const counters = await p.locator('[data-count-to]').allTextContents();
console.log('counters animated:     ', counters.every((c) => c.trim() !== '' && c.trim() !== '0'), counters);

console.log('call links (tel:):     ', await p.locator('a[href^="tel:"]').count());
console.log('service tiles:         ', await p.locator('li.svc-card').count());

// mobile: burger menu
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('pageerror', (e) => bad.push('MOBILE JS ERROR: ' + e.message));
await m.goto(base, { waitUntil: 'networkidle' });
await m.waitForTimeout(600);
const burger = m.locator('[data-burger]');
console.log('mobile menu hidden:    ', await m.locator('[data-mobile-menu]').isHidden());
await burger.click();
await m.waitForTimeout(400);
console.log('burger opens menu:     ', await m.locator('[data-mobile-menu]').isVisible());
await m.locator('[data-mobile-link]').first().click();
await m.waitForTimeout(400);
console.log('menu closes on nav:    ', await m.locator('[data-mobile-menu]').isHidden());

console.log('\nerrors / failed requests:', bad.length ? bad : 'none');
await b.close();
