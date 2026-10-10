/*
 * GH-24: verify Donna actually writes form fields while chatting.
 * LCH_SMOKE_URL=http://127.0.0.1:4254/
 * NODE_PATH=/workspace/projects/LUMA/node_modules node scripts/donna-live-form-smoke.cjs
 * No lead or consent is submitted.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function message(page, value) {
  await page.locator('#donna-message').fill(value);
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
}
async function formValue(page, name, expected) {
  await page.waitForFunction(([field, value]) => document.querySelector('#' + field)?.value === value, [name, expected], { timeout: 9000 });
}
async function main() {
  const url = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4254/';
  const browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  try {
    for (const width of [390, 1365]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      page.setDefaultTimeout(9000);
      const errors = [];
      const forbidden = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', req => {
        if (req.method() === 'POST' && (req.url().endsWith('/api/chat') || req.url().includes('firestore.googleapis.com'))) {
          forbidden.push(req.url());
        }
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
      await page.locator('#nombre').fill('Nombre manual');
      await page.getByTestId('contact-fill-with-donna').click();
      await page.getByTestId('donna-contact-guide').waitFor();
      // The form's already-entered name skips that question, staying local.
      assert.match(await page.locator('[data-role="assistant"]').last().innerText(), /apellido/iu);
      await message(page, 'Me llamo Ana Gómez, soy directora comercial en Acme, mi correo es ana@acme.example, necesito automatizar facturas');
      // Critical assertion: fields update BEFORE pressing "Revisar formulario".
      await formValue(page, 'email', 'ana@acme.example');
      assert.equal(await page.locator('#nombre').inputValue(), 'Nombre manual');
      assert.equal(await page.locator('#apellido').inputValue(), 'Gómez');
      assert.equal(await page.locator('#empresa').inputValue(), 'Acme');
      assert.equal(await page.locator('#cargo').inputValue(), 'directora comercial');
      assert.equal(await page.locator('#interes').inputValue(), 'Automatización');
      assert.equal(await page.locator('#consentimiento').isChecked(), false);
      assert.equal(await page.getByTestId('donna-contact-guide').count(), 1);
      assert.equal(await page.getByTestId('contact-donna-live-status').count(), 1);

      await message(page, 'Mi correo correcto es corregido@acme.example');
      await formValue(page, 'email', 'corregido@acme.example');
      assert.equal(await page.locator('#nombre').inputValue(), 'Nombre manual');
      assert.deepEqual(forbidden, [], 'drafting must not write Firestore or send private data to chat API');

      await page.getByRole('button', { name: 'Nueva conversación' }).click();
      await formValue(page, 'email', '');
      assert.equal(await page.locator('#nombre').inputValue(), 'Nombre manual');
      assert.equal(await page.locator('#consentimiento').isChecked(), false);
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ width, entryFromForm: 'PASS', immediateFill: 'PASS', assistantCorrection: 'PASS', manualWins: 'PASS', consentUnchecked: 'PASS', reset: 'PASS' }));
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 850 }, reducedMotion: 'reduce' });
    const requests = [];
    page.on('request', req => {
      if (req.method() === 'POST' && (req.url().endsWith('/api/chat') || req.url().includes('firestore.googleapis.com'))) requests.push(req.url());
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
    await page.getByRole('button', { name: 'Hablar con Donna' }).click();
    await message(page, 'Me llamo Juan Pérez, soy director comercial en Acme, mi correo es juan@acme.example, quiero automatizar mi facturación');
    await formValue(page, 'empresa', 'Acme');
    assert.equal(await page.locator('#apellido').inputValue(), 'Pérez');
    assert.equal(await page.locator('#consentimiento').isChecked(), false);
    assert.deepEqual(requests, []);
    console.log(JSON.stringify({ launcherNaturalLanguage: 'PASS', liveFormBridge: 'PASS', withoutReviewClick: 'PASS' }));
    await page.close();
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; });
