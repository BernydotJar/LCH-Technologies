#!/usr/bin/env node
/* Product portfolio E2E. No login, private data, external navigation or lead submission. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const base = (process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4254').replace(/\/$/, '');
const screenshotDir = process.env.LCH_SCREENSHOTS || '';
const slugs = ['ido', 'luma', 'meridian', 'bpca', 'electoral', 'legal'];

async function verify(browser, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', colorScheme: 'light', locale: 'es-GT' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const home = await page.goto(base + '/#productos-reales', { waitUntil: 'domcontentloaded' });
    assert.equal(home.status(), 200);
    await page.locator('#productos-reales').waitFor();
    const links = await page.locator('#productos-reales a[href^="/productos/"]').evaluateAll(
      (anchors) => [...new Set(anchors.map((link) => link.getAttribute('href')))],
    );
    assert.deepEqual(links.sort(), slugs.map((slug) => '/productos/' + slug).sort(), 'six visible product links');
    assert.equal(await page.locator('#productos-reales a[href="/productos/bpca"]').count() >= 1, true);
    assert.match(await page.locator('#productos-reales').innerText(), /Developer preview/);
    assert.match(await page.locator('#productos-reales').innerText(), /Demostración estática/);

    const bpca = await page.goto(base + '/productos/bpca', { waitUntil: 'domcontentloaded' });
    assert.equal(bpca.status(), 200);
    await page.getByRole('heading', { name: 'Coded Automation', exact: true }).waitFor();
    assert.match(await page.locator('main').innerText(), /Blue Prism/);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://lch-app.cloud/productos/bpca');
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), 'https://lch-app.cloud/productos/bpca');
    const sourceLink = page.locator('main a[href="https://github.com/BernydotJar/bp-coded-agents"]');
    assert.equal(await sourceLink.getAttribute('target'), '_blank');
    assert.equal(await sourceLink.getAttribute('rel'), 'noopener noreferrer');

    await page.getByTestId('language-switcher').selectOption('en');
    assert.match(await page.locator('main').innerText(), /developer preview/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://lch-app.cloud/productos/bpca?lang=en');

    const os = await page.goto(base + '/productos/electoral?lang=pt', { waitUntil: 'domcontentloaded' });
    assert.equal(os.status(), 200);
    await page.getByRole('heading', { name: 'OS Electoral', exact: true }).waitFor();
    assert.match(await page.locator('main').innerText(), /não produtiva/i);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://lch-app.cloud/productos/electoral?lang=pt');

    const meridian = await page.goto(base + '/productos/meridian?lang=es', { waitUntil: 'domcontentloaded' });
    assert.equal(meridian.status(), 200);
    await page.getByRole('heading', { name: 'Meridian', exact: true }).waitFor();
    assert.equal(await page.locator('main a[href="https://meridian.lch-app.cloud/"]').count(), 0, 'no broken public-demo CTA');
    assert.equal(await page.locator('main a[href="/#contacto"]').count() > 0, true);

    const tooWide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    assert.equal(tooWide, false, 'profile layout does not overflow at ' + viewport.width);
    assert.deepEqual(errors, [], 'no browser runtime exceptions');
    if (screenshotDir) {
      mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: resolve(screenshotDir, 'portfolio-profile-' + viewport.width + '.png'), fullPage: true, animations: 'disabled' });
    }
    console.log('LCH_PORTFOLIO_E2E=PASS', viewport.width);
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 900 }]) await verify(browser, viewport);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
