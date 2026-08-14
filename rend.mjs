import { chromium } from 'playwright';
import fs from 'fs';

const [file, out, bg = '#ffffff', w = '900', h = '500'] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage({ viewport: { width: Number(w), height: Number(h) } });
const svg = fs.readFileSync(file, 'utf8').replace(/ class /g, ' ');
await p.setContent(
  `<body style="margin:0;background:${bg};display:grid;place-items:center;height:${h}px">` +
  `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="max-width:92%;max-height:88%">` +
  `</body>`
);
await p.waitForTimeout(600);
await p.screenshot({ path: out });
await b.close();
