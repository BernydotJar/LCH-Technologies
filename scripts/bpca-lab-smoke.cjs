#!/usr/bin/env node
/* BPCA public lab smoke: no private SDK, authentication, Studio import or robot execution. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const base = (process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4254').replace(/\/$/, '');
const screenshots = process.env.LCH_SCREENSHOTS || '';

async function verify(browser, viewport) {
  const context = await browser.newContext({ viewport, acceptDownloads: true, locale: 'es-GT', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const exceptions = [];
  page.on('pageerror', (error) => exceptions.push(error.message));
  try {
    const response = await page.goto(base + '/productos/bpca', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    await page.getByRole('heading', { name: 'Coded Automation', exact: true }).waitFor();
    const lab = page.getByTestId('bpca-lab');
    await lab.waitFor();
    assert.equal(await lab.count(), 1);
    assert.match(await lab.innerText(), /STATIC CLI/);
    assert.match(await lab.innerText(), /NO_GO/);

    await page.getByTestId('bpca-lab-cta').click();
    assert.equal(new URL(page.url()).hash, '#laboratorio-bpca');
    assert.equal(await page.getByTestId('bpca-select-contract').getAttribute('aria-selected'), 'true');
    assert.match(await lab.innerText(), /HELLO REA/);
    assert.match(await lab.innerText(), /no ejecutado/i);

    await page.getByTestId('bpca-select-generate').click();
    assert.equal(await page.getByTestId('bpca-select-generate').getAttribute('aria-selected'), 'true');
    assert.match(await lab.innerText(), /bp_coded_agents build-pair/);
    assert.match(await lab.innerText(), /verify-action-abi/);
    await page.getByTestId('bpca-copy-build').click();
    await lab.locator('[role="status"]').filter({ hasText: /Comando copiado|No fue posible copiar/i }).waitFor({ timeout: 10000 });

    await page.getByTestId('bpca-select-verify').click();
    const evidence = page.getByTestId('bpca-evidence');
    await evidence.waitFor();
    assert.match(await evidence.innerText(), /PASS STATIC/);
    assert.match(await evidence.innerText(), /NO_GO/);
    assert.match(await evidence.innerText(), /NOT_RUN/);
    assert.match(await evidence.innerText(), /MANAGED_ASSEMBLY_TARGET_REGISTRY_V2_MISSING/);
    assert.match(await page.getByTestId('bpca-object-sha').innerText(), /^[a-f0-9]{64}$/);

    const event = page.waitForEvent('download');
    await page.getByTestId('bpca-download-evidence').click();
    const download = await event;
    assert.equal(download.suggestedFilename(), 'lch-bpca-evidencia-estatica.json');
    const downloaded = JSON.parse(readFileSync(await download.path(), 'utf8'));
    assert.equal(downloaded.gates.build, 'PASS_STATIC_PAIR_ONLY');
    assert.equal(downloaded.gates.dependencies, 'NO_GO');
    assert.equal(downloaded.gates.nativeExecution, 'NOT_RUN');

    await page.getByTestId('bpca-select-studio').click();
    assert.match(await lab.innerText(), /Blue Prism Studio DEV/);
    assert.match(await lab.innerText(), /Check Code/);
    assert.equal(await lab.locator('a[href="/#contacto"]').count(), 1);

    await page.getByTestId('language-switcher').selectOption('en');
    assert.match(await lab.getByRole('heading', { level: 2 }).innerText(), /From contract to artifact/);
    assert.match(await lab.innerText(), /Not runtime-certified/);

    await page.getByTestId('language-switcher').selectOption('pt');
    assert.match(await lab.getByRole('heading', { level: 2 }).innerText(), /Do contrato ao artefato/);
    assert.match(await lab.innerText(), /Não certificado/);

    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), true, 'no horizontal overflow');
    assert.deepEqual(exceptions, [], 'no browser runtime exceptions');

    if (screenshots) {
      mkdirSync(screenshots, { recursive: true });
      await page.getByTestId('language-switcher').selectOption('es');
      await page.getByTestId('bpca-select-contract').click();
      await page.screenshot({ path: resolve(screenshots, 'bpca-lab-' + viewport.width + '.png'), fullPage: true, animations: 'disabled' });
    }

    const other = await page.goto(base + '/productos/luma', { waitUntil: 'domcontentloaded' });
    assert.equal(other.status(), 200);
    assert.equal(await page.getByTestId('bpca-lab').count(), 0, 'BPCA lab must not appear for other products');
    console.log('LCH_BPCA_LAB_E2E=PASS', viewport.width);
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
