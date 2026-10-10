/* GH-22 end-to-end browser verification of Donna -> semantic fields -> Contact.
 * No Firestore write is attempted. Only a human may tick consent and submit.
 * NODE_PATH=/workspace/projects/LUMA/node_modules \
 * LCH_SMOKE_URL=http://127.0.0.1:4241/ node scripts/semantic-contact-smoke.cjs
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const base = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4241/';
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  try {
    for (const width of [390, 1365]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      page.setDefaultTimeout(11_000);
      const failures = [];
      let apiPosts = 0, firestorePosts = 0;
      page.on('pageerror', error => failures.push(error.message));
      page.on('request', request => {
        if (request.method() !== 'POST') return;
        if (request.url().endsWith('/api/chat')) apiPosts++;
        if (request.url().includes('firestore.googleapis.com')) firestorePosts++;
      });

      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 22_000 });
      await page.getByRole('button', { name: 'Hablar con Donna' }).click();
      await page.locator('#donna-message').fill(
        'Me llamo Ana Perez, soy directora de operaciones, trabajo en Acme y necesito automatizar facturas, mi correo es ana@acme.com',
      );
      await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      const guide = page.getByTestId('donna-contact-guide');
      await guide.waitFor();
      await page.waitForFunction(() => document.querySelector('[data-testid="donna-contact-progress"]')?.textContent?.includes('6/6'));
      assert.equal(apiPosts, 0, 'contact details never sent to /api/chat');
      assert.equal(firestorePosts, 0, 'no auto-write');
      await page.getByTestId('donna-review-contact').click();

      const form = page.getByTestId('lch-contact-form');
      await page.waitForFunction(() => document.querySelector('#nombre')?.value === 'Ana');
      assert.equal(await form.getAttribute('data-semantic-tool'), 'prepare_lch_contact_form');
      const expectedFields = ['nombre', 'apellido', 'email', 'empresa', 'cargo', 'interes', 'mensaje'];
      const actualFields = await form.locator('[data-semantic-field]').evaluateAll(els => els.map(el => el.getAttribute('data-semantic-field')));
      assert.deepEqual(actualFields.sort(), expectedFields.sort());
      assert.equal(await page.locator('#nombre').inputValue(), 'Ana');
      assert.equal(await page.locator('#apellido').inputValue(), 'Perez');
      assert.equal(await page.locator('#email').inputValue(), 'ana@acme.com');
      assert.equal(await page.locator('#empresa').inputValue(), 'Acme');
      assert.equal(await page.locator('#cargo').inputValue(), 'directora de operaciones');
      assert.equal(await page.locator('#interes').inputValue(), 'Automatización');
      assert.equal(await page.locator('#mensaje').inputValue(), 'necesito automatizar facturas');
      assert.equal(await page.locator('#consentimiento').isChecked(), false);
      assert.equal(firestorePosts, 0);
      assert.equal(await page.getByText('Recibimos tu solicitud').count(), 0);
      assert.deepEqual(failures, []);
      console.log(JSON.stringify({ width, fullSentence: 'PASS', semanticContract: 'PASS', privacy: 'PASS', browserErrors: 0 }));
      await page.close();
    }

    const guided = await browser.newPage({ viewport: { width: 390, height: 850 }, reducedMotion: 'reduce' });
    guided.setDefaultTimeout(11_000);
    let unwantedPosts = 0;
    guided.on('request', r => { if (r.method() === 'POST' && (r.url().includes('firestore.googleapis.com') || r.url().endsWith('/api/chat'))) unwantedPosts++; });
    await guided.goto(base, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await guided.locator('#nombre').fill('Nombre escrito manualmente');
    await guided.getByRole('button', { name: 'Hablar con Donna' }).click();
    await guided.getByTestId('donna-start-contact').first().click();
    const ask = async (response) => {
      await guided.locator('#donna-message').fill(response);
      await guided.getByRole('button', { name: 'Enviar mensaje' }).click();
    };
    await ask('Maria Lopez');
    await ask('maria@example.com');
    await ask('Acme Labs');
    await ask('Directora de operaciones');
    await ask('Automatización');
    await guided.waitForFunction(() => document.querySelector('[data-testid="donna-contact-progress"]')?.textContent?.includes('6/6'));
    await guided.getByTestId('donna-review-contact').click();
    await guided.waitForFunction(() => document.querySelector('#email')?.value === 'maria@example.com');
    assert.equal(await guided.locator('#nombre').inputValue(), 'Nombre escrito manualmente', 'human edit must win');
    assert.equal(await guided.locator('#apellido').inputValue(), 'Lopez');
    assert.equal(await guided.locator('#empresa').inputValue(), 'Acme Labs');
    assert.equal(await guided.locator('#cargo').inputValue(), 'Directora de operaciones');
    assert.equal(await guided.locator('#interes').inputValue(), 'Automatización');
    assert.equal(await guided.locator('#consentimiento').isChecked(), false);
    assert.equal(unwantedPosts, 0, 'guided slot filling is local and never sends/saves data');
    console.log(JSON.stringify({ guided: 'PASS', humanEditsPreserved: 'PASS', consentUnchecked: 'PASS', networkWrites: unwantedPosts }));
    await guided.close();
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
