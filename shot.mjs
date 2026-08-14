import { chromium } from 'playwright';
const [url, out, full] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.screenshot({ path: out, fullPage: full === 'full' });
await b.close();
