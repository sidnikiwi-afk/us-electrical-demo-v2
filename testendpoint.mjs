import { chromium } from 'playwright';

// Exercises the real submit path but INTERCEPTS the request, so nothing is
// actually delivered to info@uselectrical.co.uk during testing.
const base = process.argv[2] || 'http://127.0.0.1:8099/';
const b = await chromium.launch({
  executablePath: '/home/hermes/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});

async function run(label, fulfil) {
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  let seen = null;
  await p.route('**/formsubmit.co/**', async (route) => {
    const r = route.request();
    seen = { method: r.method(), url: r.url(), body: r.postData() };
    await route.fulfill(fulfil);
  });
  await p.goto(base + '#quote', { waitUntil: 'networkidle' });
  await p.fill('#q-name', 'Saeed Khan');
  await p.fill('#q-phone', '07700 900123');
  await p.fill('#q-postcode', 'LS1 4AP');
  await p.selectOption('#q-job', { index: 1 });
  await p.fill('#q-detail', 'Consumer unit keeps tripping.');
  await p.click('.quote__submit');
  await p.waitForTimeout(1000);

  console.log(`\n--- ${label}`);
  console.log('  request sent:', seen ? `${seen.method} ${seen.url}` : 'NONE');
  if (seen?.body) {
    const fields = [...seen.body.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r]*)/g)]
      .map(([, k, v]) => `${k}=${v}`);
    console.log('  payload:', fields.join(' | '));
  }
  const done = await p.locator('.quote__done').count();
  console.log('  confirmation shown:', done > 0);
  if (!done) console.log('  status message:', (await p.locator('.quote__status').textContent())?.trim());
  await p.close();
}

await run('success response', {
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ success: 'true', message: 'The form was submitted successfully.' }),
});

await run('failure response', {
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ success: 'false', message: 'Email not activated.' }),
});

await b.close();
