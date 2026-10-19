/**
 * HCI regression: a site-wide dark theme and a user-invoked, corner-docked
 * Donna assistant. Exercises shipped production-style Node bundle.
 *
 * CHROMIUM_PATH=/usr/bin/chromium LCH_SMOKE_URL=http://127.0.0.1:5191/ \
 *   NODE_PATH=/workspace/projects/LUMA/node_modules node scripts/lch-ux-smoke.cjs
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const origin = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:5191/';

const css = async (page, selector, property) => page.locator(selector).first()
  .evaluate((element, prop) => getComputedStyle(element)[prop], property);

async function testViewport(browser, width, height, locale) {
  const page = await browser.newPage({
    viewport: { width, height },
    colorScheme: 'light',
    locale: locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-GT',
    reducedMotion: 'reduce',
  });
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '?lang=' + locale, { waitUntil: 'domcontentloaded', timeout: 30000 });
  try {
    await page.getByTestId('theme-toggle').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.getByTestId('donna-invitation').count(), 0, 'no unrequested invitation overlays');

    const brand = await css(page, '#inicio', 'backgroundColor');
    const brandHeader = await css(page, '.site-brand-surface', 'backgroundColor');
    const editorial = await css(page, '#soluciones', 'backgroundColor');
    const cases = await css(page, '#casos-resueltos', 'backgroundColor');
    const contact = await css(page, '.theme-contact-surface', 'backgroundColor');
    const trigger = page.getByTestId('donna-launcher');
    const dockClosed = await trigger.boundingBox();
    assert.ok(dockClosed && dockClosed.width > 42, 'launcher has a substantial pointer target');
    if (width < 640) {
      assert.ok(dockClosed.width <= 68 && dockClosed.height <= 68, 'mobile launcher is compact');
    } else {
      assert.ok(dockClosed.width <= 210, 'desktop launcher stays unobtrusive');
    }
    assert.ok(dockClosed.x + dockClosed.width >= width - 32, 'launcher anchored to right');
    assert.ok(dockClosed.y + dockClosed.height >= height - 60, 'launcher anchored to bottom');

    await page.getByTestId('theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.notEqual(await css(page, '#inicio', 'backgroundColor'), brand, 'hero changes in dark mode');
    assert.notEqual(await css(page, '.site-brand-surface', 'backgroundColor'), brandHeader, 'header changes in dark mode');
    assert.notEqual(await css(page, '#soluciones', 'backgroundColor'), editorial, 'editorial changes in dark mode');
    assert.notEqual(await css(page, '#casos-resueltos', 'backgroundColor'), cases, 'case studies change in dark mode');
    assert.notEqual(await css(page, '.theme-contact-surface', 'backgroundColor'), contact, 'contact form changes in dark mode');
    assert.equal(await page.evaluate(() => localStorage.getItem('lch.theme')), 'dark', 'theme persisted');

    await trigger.click();
    const panel = page.locator('#donna-chat-panel');
    await panel.waitFor();
    const dockOpen = await panel.boundingBox();
    const triggerOpen = await trigger.boundingBox();
    assert.ok(dockOpen, 'chat exists after explicit opening');
    assert.ok(dockOpen.x >= 0 && dockOpen.x + dockOpen.width <= width + 1, 'panel horizontally in viewport');
    assert.ok(Math.abs(dockOpen.x + dockOpen.width - (triggerOpen.x + triggerOpen.width)) <= 2, 'chat panel right aligned with launcher');
    assert.ok(dockOpen.y + dockOpen.height <= triggerOpen.y - 2, 'chat rises from the bottom-right dock');
    assert.ok(dockOpen.height <= height * (width < 640 ? .67 : .76), 'chat panel not a viewport-height overlay');
    assert.ok(dockOpen.height > 250, 'chat has enough vertical room for controls');
    assert.notEqual(await css(page, '.donna-transcript', 'backgroundColor'), 'rgb(255, 255, 255)', 'chat surface not white in dark mode');
    assert.notEqual(await css(page, '.donna-composer', 'backgroundColor'), 'rgb(255, 255, 255)', 'composer not white in dark mode');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
    assert.ok(await page.locator('#donna-message').isVisible(), 'composer accessible');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, 'no sideways document scrolling');

    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-controls') === 'donna-chat-panel');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('theme-toggle').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'theme remains dark after reload');
    assert.deepEqual(errors, [], 'no browser errors');
    console.log(JSON.stringify({
      width, height, locale,
      theme: 'PASS',
      compactDock: 'PASS',
      position: 'PASS',
      keyboard: 'PASS',
      persistence: 'PASS',
      errors: errors.length,
    }));
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    for (const [width,height,locale] of [
      [320,568,'es'],
      [375,812,'es'],
      [390,844,'en'],
      [768,1024,'pt'],
      [1365,860,'es'],
    ]) {
      await testViewport(browser,width,height,locale);
    }
    console.log('LCH_UX_SITE_DARK_DONNA_DOCK=PASS');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
