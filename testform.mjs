import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:8099/';
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });

const bad = [];
p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
p.on('pageerror', (e) => bad.push('JS ERROR: ' + e.message));

await p.goto(base + '#quote', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

// 1. empty submit must not navigate, must flag required fields
await p.click('.quote__submit');
await p.waitForTimeout(400);
console.log('empty submit -> status:', (await p.locator('.quote__status').textContent())?.trim());
console.log('  invalid fields:', await p.locator('.is-invalid').count());
console.log('  url unchanged:', p.url().endsWith('#quote'));
await p.locator('.quote__form').screenshot({ path: 'form-invalid.png' });

// 2. valid submit must confirm without a network POST
await p.fill('#q-name', 'Saeed Khan');
await p.fill('#q-phone', '07700 900123');
await p.fill('#q-postcode', 'LS1 4AP');
await p.selectOption('#q-job', { index: 1 });
await p.fill('#q-detail', 'Consumer unit keeps tripping.');
await p.click('.quote__submit');
await p.waitForTimeout(900);
console.log('valid submit -> confirmation shown:', await p.locator('.quote__done').isVisible());
console.log('  text:', (await p.locator('.quote__done').textContent())?.trim().slice(0, 110));
await p.locator('.quote__done').screenshot({ path: 'form-done.png' });

console.log('failed requests / js errors:', bad.length ? bad : 'none');
await b.close();
