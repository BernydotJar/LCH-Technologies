/* Optional UI smoke runner: NODE_PATH=<node_modules with playwright> node scripts/contact-smoke.cjs */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const url = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4176/';
  const live = process.env.LCH_SMOKE_LIVE === '1';
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    if (!live) await page.route('**/src/integrations/demoRequests.ts*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: "export async function submitDemoRequest(request){globalThis.__lastLchLead=request;return {leadId:'qa-intake-00001',automation:{status:'skipped'}}}",
      });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 16000 });
    page.setDefaultTimeout(9000);
    assert.equal(await page.locator('#contacto form').count(), 1);
    const contactOverflowBefore = await page.evaluate(() => [...document.querySelectorAll('#contacto *')].filter(el => { const rect = el.getBoundingClientRect(); return rect.width > 0 && rect.right > innerWidth + 3 && !el.closest('[aria-hidden="true"]'); }).slice(0, 6).map(el => ({tag: el.tagName.toLowerCase(), id: el.id, className: String(el.className).slice(0, 45)})));
    await page.getByRole('button', { name: /Automatizar procesos/ }).click();
    assert.equal(await page.locator('select[name="interes"]').inputValue(), 'Automatización');

    await page.locator('#nombre').fill('Ada');
    await page.locator('#apellido').fill('Lovelace');
    await page.locator('#email').fill(live ? 'lch-synthetic-check@example.com' : 'ada@example.com');
    await page.locator('#empresa').fill('Example Corp');
    await page.locator('#cargo').fill('Directora de Operaciones');
    await page.locator('#mensaje').fill('Reducir el tiempo de aprobaciones con evidencia trazable.');
    await page.locator('#consentimiento').check();
    await page.getByRole('button', { name: /Quiero conversar con LCH/ }).click();
    await Promise.race([
      page.getByText('Recibimos tu solicitud').waitFor({ timeout: 18000 }).then(() => 'success'),
      page.getByRole('alert').waitFor({ timeout: 18000 }).then(() => 'error'),
    ]);
    const alert = await page.getByRole('alert').count();
    if (alert) throw new Error('Submission error: ' + await page.getByRole('alert').innerText());
    assert.match(await page.locator('#contacto').innerText(), live ? /Referencia: [A-Z0-9]{10}/ : /QA-INTAKE/);
    if (!live) {
      const saved = await page.evaluate(() => globalThis.__lastLchLead);
      assert.equal(saved.interes, 'Automatización');
      assert.equal(saved.consentimiento, true);
      assert.equal(saved.email, 'ada@example.com');
    }
    assert.deepEqual(failures, []);
    const viewportOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    console.log(JSON.stringify({ mode: live ? 'firestore-live' : 'mock', form: 'PASS', receipt: 'PASS', payload: live ? 'submitted' : 'PASS', browserErrors: failures.length, viewportOverflow, contactOverflowBefore }));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
