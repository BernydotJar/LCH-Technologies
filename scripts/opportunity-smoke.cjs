#!/usr/bin/env node
/* GH-32: exact-build business-journey E2E. No lead submission or PII. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const baseUrl = (process.env.LCH_SMOKE_URL || 'http://127.0.0.1:42131').replace(/\/$/, '');
const screenshotDir = process.env.LCH_SCREENSHOTS || '';
const expectedOrigin = process.env.LCH_EXPECTED_CANONICAL || 'https://lch-technologies.com';

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, colorScheme: 'light', reducedMotion: 'reduce', locale: 'es-GT' });
      const page = await context.newPage();
      const requests = [];
      page.on('request', (request) => {
        if (request.method() === 'POST' &&
          (request.url().includes('firestore.googleapis.com') || request.url().includes('/api/chat'))) {
          requests.push(request.url());
        }
      });

      const response = await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      await page.locator('#inicio h1').waitFor({ state: 'visible' });
      await page.getByTestId('opportunity-navigator').waitFor();
      assert.match(await page.locator('#inicio h1').innerText(), /operación puede funcionar mejor/);
      assert.equal(await page.locator('#retos button[data-testid^=opportunity-]').count(), 4);
      assert.equal(await page.getByTestId('opportunity-automation').getAttribute('aria-pressed'), 'true');
      assert.match(await page.locator('#retos').innerText(), /proceso trazable/);

      const cases = [
        ['ai', 'Inteligencia Artificial', 'decisiones fundamentadas'],
        ['platform', 'Software Empresarial', 'operación conectada'],
        ['cloud', 'Cloud', 'plataforma preparada'],
        ['automation', 'Automatización', 'proceso trazable'],
      ];
      for (const [id, , phrase] of cases) {
        await page.getByTestId('opportunity-' + id).click();
        assert.equal(await page.getByTestId('opportunity-' + id).getAttribute('aria-pressed'), 'true');
        const indexById = { automation: '01', ai: '02', platform: '03', cloud: '04' };
        assert.equal(await page.getByTestId('opportunity-position').innerText(), indexById[id] + ' / 04');
        await page.waitForFunction((text) => document.querySelector('#retos h3')?.textContent?.toLowerCase().includes(text.toLowerCase()), phrase);
      }

      await page.getByTestId('opportunity-platform').click();
      await page.waitForFunction(() => document.querySelector('#retos a[href="#productos-reales"]') !== null);
      assert.equal(await page.locator('#retos a', { hasText: 'Ver cómo lo abordamos' }).getAttribute('href'), '#productos-reales');
      await page.getByRole('button', { name: 'Prefiero preguntarle a Donna' }).click();
      await page.getByRole('dialog', { name: /Donna/ }).waitFor({ state: 'visible' });
      assert.equal(requests.length, 0, 'Opening Donna must not submit chat or contact');

      await page.getByRole('button', { name: 'Cerrar Donna' }).click();
      await page.getByTestId('opportunity-ai').click();
      await page.getByRole('button', { name: 'Conversemos sobre este reto' }).click();
      await page.waitForTimeout(120);
      assert.equal(new URL(page.url()).hash, '#contacto');
      assert.equal(await page.locator('select[name=interes]').inputValue(), 'Inteligencia Artificial');
      assert.equal(await page.locator('input[name=consentimiento]').isChecked(), false);
      assert.equal(requests.length, 0, 'Opportunity navigation must not write Firestore or call Donna');

      await page.getByTestId('language-switcher').selectOption('en');
      assert.match(await page.locator('#inicio h1').innerText(), /Your operations can work better/);
      assert.match(await page.getByTestId('opportunity-navigator').innerText(), /What would you like to solve first/);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), expectedOrigin + '/?lang=en');
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), expectedOrigin + '/?lang=en');

      await page.getByTestId('language-switcher').selectOption('pt');
      assert.match(await page.locator('#inicio h1').innerText(), /Sua operação pode funcionar melhor/);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), expectedOrigin + '/?lang=pt');
      await page.getByTestId('language-switcher').selectOption('es');

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      assert.equal(overflow, false, 'No horizontal overflow at ' + viewport.width);
      if (screenshotDir) {
        mkdirSync(screenshotDir, { recursive: true });
        await page.locator('#inicio').screenshot({ path: resolve(screenshotDir, 'hero-' + viewport.width + '.png'), animations: 'disabled' });
      }
      console.log('GH-32 opportunity E2E PASS:', viewport.width, 'selector + Donna + consent + ES/EN/PT canonical');
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
