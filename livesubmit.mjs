import { chromium } from 'playwright';

// Real submission against the live site. Sends for real - no interception.
const base = 'https://sidnikiwi-afk.github.io/us-electrical-demo-v2/';
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });

let resp = null;
p.on('response', async (r) => {
  if (r.url().includes('formsubmit.co')) {
    resp = { status: r.status(), body: await r.text().catch(() => '') };
  }
});
p.on('pageerror', (e) => console.log('JS ERROR:', e.message));

await p.goto(base + '#quote', { waitUntil: 'networkidle' });
await p.fill('#q-name', 'TEST SUBMISSION - website form check');
await p.fill('#q-phone', '0113 880 5535');
await p.fill('#q-postcode', 'LS1 4AP');
await p.selectOption('#q-job', { index: 1 });
await p.fill('#q-detail', 'Automated test of the quote form. Please ignore.');
await p.click('.quote__submit');
await p.waitForTimeout(6000);

console.log('endpoint response:', resp ? `${resp.status} ${resp.body.slice(0, 300)}` : 'NO RESPONSE');
console.log('confirmation shown:', (await p.locator('.quote__done').count()) > 0);
const st = await p.locator('.quote__status').count();
if (st) console.log('status message:', (await p.locator('.quote__status').textContent())?.trim());
await p.screenshot({ path: 'livesubmit.png' });
await b.close();
