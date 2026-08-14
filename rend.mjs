import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 420, height: 620 } });
await p.setContent(`<body style="margin:0;background:#fff;display:grid;place-items:center;height:620px">
<img src="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(process.argv[2])).toString('base64')}" style="height:560px">
</body>`);
await p.waitForTimeout(600);
await p.screenshot({ path: process.argv[3] });
await b.close();
