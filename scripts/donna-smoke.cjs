/*
 * Browser smoke for Donna's real same-origin HTTP endpoint and LCH form.
 * Usage: NODE_PATH=/path/to/node_modules LCH_SMOKE_URL=http://127.0.0.1:4199/ node scripts/donna-smoke.cjs
 * Requires the Playwright package and a local Chromium. No real lead is sent.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const base = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4199/';
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    for (const width of [390, 1365]) {
      const page = await browser.newPage({ viewport: { width, height: 860 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.setDefaultTimeout(9000);
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.getByRole('button', { name: 'Hablar con Donna' }).click();
      assert.equal(await page.getByRole('dialog', { name: /Conversación con Donna/ }).count(), 1);
      await page.locator('#donna-chat-panel').getByRole('button', { name: 'Aplicar IA al negocio' }).click();
      const answer = page.locator('[data-role="assistant"]').last();
      await answer.waitFor({ timeout: 9000 });
      assert.match(await answer.innerText(), /LCH aplica IA/);
      const chat = page.locator('#donna-chat-panel');
      const viewport = await page.evaluate(() => window.innerWidth);
      const rect = await chat.boundingBox();
      assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= viewport + 2, 'Donna must fit viewport');

      await page.getByRole('button', { name: /Continuar con una persona/ }).click();
      // Handoff fields are populated by a Contact useEffect after React commits.
      // Wait for the actual state, not just the click event, under production load.
      await page.waitForFunction(() => document.querySelector('#interes')?.value === 'Inteligencia Artificial', null, { timeout: 8000 });
      assert.equal(await page.locator('#interes').inputValue(), 'Inteligencia Artificial');
      assert.match(await page.locator('#mensaje').inputValue(), /inteligencia artificial ofrece LCH/);
      assert.equal(await page.locator('#consentimiento').isChecked(), false);
      assert.ok(await page.getByText(/Donna te ayudó a preparar esta consulta/).count() > 0);
      assert.equal(await page.getByRole('dialog', { name: /Conversación con Donna/ }).count(), 0);

      await page.getByRole('button', { name: 'Hablar con Donna' }).click();
      await page.getByRole('button', { name: 'Nueva conversación' }).click();
      await page.locator('#donna-message').fill('¿Qué hacen LUMA e I-DO?');
      await page.getByRole('button', { name: 'Enviar mensaje' }).click();
      await page.locator('[data-role="assistant"]').last().waitFor({ timeout: 9000 });
      assert.match(await page.locator('[data-role="assistant"]').last().innerText(), /LUMA/);
      assert.match(await page.locator('[data-role="assistant"]').last().innerText(), /I-DO/);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: /Conversación con Donna/ }).waitFor({ state: 'hidden', timeout: 4000 });
      assert.deepEqual(errors, []);

      console.log(JSON.stringify({ viewportWidth: width, api: 'PASS', handoff: 'PASS', consentPreserved: 'PASS', products: 'PASS', keyboard: 'PASS', browserErrors: errors.length }));
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
