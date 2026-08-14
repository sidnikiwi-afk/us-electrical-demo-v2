import { chromium } from 'playwright';

const [url, out, sel, w] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage({ viewport: { width: Number(w || 1440), height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
if (sel) await p.locator(sel).screenshot({ path: out });
else await p.screenshot({ path: out });
await b.close();
