/*
 * GH-23 end-to-end UX and privacy:
 *   NODE_PATH=/workspace/projects/LUMA/node_modules LCH_SMOKE_URL=http://127.0.0.1:4251/ node scripts/donna-cx-smoke.cjs
 * Browser -> /api/chat -> grounded response OR local contact draft -> Contact review.
 * No Firestore writes are made by this test.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function send(page, content) {
  await page.locator('#donna-message').fill(content);
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
}

async function open(page) {
  await page.getByRole('button', { name: 'Hablar con Donna' }).click();
  await page.getByRole('dialog', { name: /Conversación con Donna/ }).waitFor();
}

async function main() {
  const base = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4251/';
  const widths = process.env.GH23_VIEWPORT
    ? [Number(process.env.GH23_VIEWPORT)]
    : [390, 1365];
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 850 },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      page.setDefaultTimeout(9_000);
      const errors = [];
      const apiCalls = [];
      const firestorePosts = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (request.method() !== 'POST') return;
        if (request.url().endsWith('/api/chat')) apiCalls.push(request.postData() ?? '');
        if (request.url().includes('firestore.googleapis.com')) firestorePosts.push(request.url());
      });
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 22_000 });
      await open(page);
      await send(page, '¿Cuál es la extensión de la oficina de Lima?');
      await page.locator('[data-role="assistant"]').last().getByText(/No encuentro ese detalle/).waitFor();
      const options = page.getByTestId('donna-contextual-prompts');
      await options.waitFor();
      assert.ok(await options.getByRole('button').count() >= 2, 'unknown request must offer grounded topics');
      assert.equal(await page.getByTestId('donna-start-contact').count(), 1, 'one primary contact CTA');
      assert.equal(await page.getByText('Solicitar una conversación con LCH').count(), 0, 'no duplicate inline sales CTA');
      await options.getByRole('button', { name: /IA para empresas/ }).click();
      await page.locator('[data-role="assistant"]').last().getByText(/LCH aplica IA/).waitFor();
      await page.getByTestId('donna-start-contact').click();
      const guide = page.getByTestId('donna-contact-guide');
      await guide.waitFor();
      assert.equal(await page.getByTestId('donna-start-contact').count(), 0);
      const intro = await page.locator('[data-role="assistant"]').last().innerText();
      assert.match(intro, /¿Cuál es tu nombre\?/);
      assert.doesNotMatch(intro, /0 datos|Identifiqué 0/i);
      assert.equal(await page.getByTestId('donna-contact-progress').innerText(), '1/6 datos', 'the grounded IA interest is legitimately prefilled');
      assert.equal(await page.getByTestId('donna-review-contact').count(), 1);
      // The guide repeats neither its question nor another primary contact CTA.
      assert.doesNotMatch(await guide.innerText(), /¿Cuál es tu nombre\?/);
      await send(page, 'Ana Perez');
      await page.locator('[data-role="assistant"]').last().getByText(/correo electrónico/).waitFor();
      assert.equal(await page.getByTestId('donna-contact-progress').innerText(), '3/6 datos', 'interest + first and last names');
      await guide.getByRole('button', { name: 'Volver a explorar' }).click();
      await send(page, '¿Qué hace LUMA?');
      await page.locator('[data-role="assistant"]').last().getByText(/LUMA es una experiencia/).waitFor();

      assert.ok(apiCalls.length >= 3, 'normal product questions should use grounded API');
      assert.ok(apiCalls.every((payload) => !/Ana Perez|correo electrónico|¿Cuál es tu nombre\?|Anotado\.\s+¿/i.test(payload)), 'private guide turns must never be replayed to the API');
      assert.deepEqual(firestorePosts, [], 'no submission before consent');
      assert.deepEqual(errors, [], 'no browser runtime errors');
      const rect = await page.getByRole('dialog', { name: /Conversación con Donna/ }).boundingBox();
      assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= width + 2, 'chat stays within the viewport');
      console.log(JSON.stringify({ width, unknownClarification: 'PASS', singleContactCTA: 'PASS', guidedCopy: 'PASS', returnWithoutPIILeak: 'PASS', publicKnowledge: 'PASS' }));
      await context.close();

      const directPage = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      const directCalls = [];
      directPage.on('request', (request) => {
        if (request.method() === 'POST') directCalls.push(request.url());
      });
      await directPage.goto(base, { waitUntil: 'domcontentloaded', timeout: 22_000 });
      await open(directPage);
      await send(directPage, 'Quiero hablar con el equipo');
      await directPage.getByTestId('donna-contact-guide').waitFor();
      assert.equal(await directPage.getByTestId('donna-contact-progress').innerText(), 'Empecemos');
      assert.equal(await directPage.getByTestId('donna-start-contact').count(), 0);
      assert.equal(await directPage.locator('[data-role="assistant"]').count(), 1, 'direct contact intent should not show generic fallback first');
      assert.deepEqual(directCalls, [], 'no API call or CRM submission on direct contact request');
      await directPage.getByTestId('donna-review-contact').click();
      await directPage.waitForFunction(() => window.location.hash === '#contacto');
      assert.equal(await directPage.locator('#consentimiento').isChecked(), false);
      assert.equal(await directPage.locator('#nombre').inputValue(), '');
      console.log(JSON.stringify({ width, directContactIntent: 'PASS', noAutoConsent: 'PASS', noNetworkSubmission: 'PASS' }));
      await directPage.close();

      const pricePage = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      await pricePage.goto(base, { waitUntil: 'domcontentloaded', timeout: 22_000 });
      await open(pricePage);
      await send(pricePage, '¿Cuánto cuesta LUMA?');
      await pricePage.locator('[data-role="assistant"]').last().getByText(/alcance y el precio dependen/).waitFor();
      assert.equal(await pricePage.getByTestId('donna-contact-guide').count(), 0);
      assert.equal(await pricePage.getByTestId('donna-start-contact').count(), 1);
      assert.equal(await pricePage.getByText('Solicitar una conversación con LCH').count(), 0);
      await pricePage.getByTestId('donna-contact-direct-link').click();
      await pricePage.waitForFunction(() => window.location.hash === '#contacto');
      assert.equal(await pricePage.locator('#consentimiento').isChecked(), false);
      console.log(JSON.stringify({ width, pricingBoundary: 'PASS', directFormBypass: 'PASS' }));
      await pricePage.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
