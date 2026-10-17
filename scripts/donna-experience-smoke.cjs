/*
 * Donna product-CX smoke after UX redesign: intentional dock, not unsolicited
 * callouts. No lead or consent is submitted.
 *
 * GH21_ACCELERATED=1 CHROMIUM_PATH=/usr/bin/chromium \
 * LCH_SMOKE_URL=http://127.0.0.1:5191/ \
 * NODE_PATH=/workspace/projects/LUMA/node_modules node scripts/donna-experience-smoke.cjs
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4231/';
const accelerated = process.env.GH21_ACCELERATED === '1';
const dwell = accelerated ? 1800 : 6350;
const installClock = async (page) => {
  if (!accelerated) return;
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window);
    window.setTimeout = (callback, timeout, ...args) =>
      original(callback, timeout === 5800 ? 1200 : timeout, ...args);
  });
};

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    for (const width of [390, 1365]) {
      const page = await browser.newPage({
        viewport: { width, height: 860 },
        reducedMotion: 'no-preference',
        locale: 'es-GT',
      });
      page.setDefaultTimeout(12000);
      await installClock(page);
      const errors = [];
      const chatPosts = [];
      const firestorePosts = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        if (request.method() !== 'POST') return;
        if (request.url().endsWith('/api/chat')) chatPosts.push(request.url());
        if (request.url().includes('firestore.googleapis.com')) firestorePosts.push(request.url());
      });
      await page.goto(url + '?lang=es', { waitUntil: 'domcontentloaded', timeout: 25000 });
      const launcher = page.getByTestId('donna-launcher');
      await launcher.waitFor();
      assert.equal(await page.getByTestId('donna-invitation').count(), 0, 'no unsolicited invitation');
      const bounds = await launcher.boundingBox();
      assert.ok(bounds && (width < 640 ? bounds.width <= 68 : bounds.width <= 210));
      assert.deepEqual(chatPosts, [], 'no chat request before visitor interaction');
      await launcher.hover();
      assert.equal(await launcher.getByTestId('donna-orb').getAttribute('data-state'), 'hover');

      await launcher.click();
      const dialog = page.locator('#donna-chat-panel');
      await dialog.waitFor();
      const initial = (await page.getByTestId('donna-idea-question').innerText()).trim();
      await page.waitForTimeout(dwell);
      const rotated = (await page.getByTestId('donna-idea-question').innerText()).trim();
      assert.notEqual(rotated, initial, 'idea rotation occurs only inside opened chat');

      await page.getByTestId('donna-idea-card').hover();
      const paused = (await page.getByTestId('donna-idea-question').innerText()).trim();
      await page.waitForTimeout(dwell);
      assert.equal((await page.getByTestId('donna-idea-question').innerText()).trim(), paused, 'hover pauses suggestions');
      const original = paused;
      await page.getByRole('button', { name: 'Siguiente idea' }).click();
      await page.waitForTimeout(300);
      assert.notEqual((await page.getByTestId('donna-idea-question').innerText()).trim(), original, 'user manually advances suggestions');

      await page.locator('#donna-message').fill('Estoy redactando un mensaje');
      const typingIdea = (await page.getByTestId('donna-idea-question').innerText()).trim();
      await page.waitForTimeout(dwell);
      assert.equal((await page.getByTestId('donna-idea-question').innerText()).trim(), typingIdea, 'typing pauses suggestions');
      await page.locator('#donna-message').fill('');

      await page.route('**/api/chat', async route => {
        await new Promise(resolve => setTimeout(resolve, 650));
        await route.continue();
      });
      await page.getByTestId('donna-idea-card').getByRole('button', { name: /Explorar Evidence AI|Conocer LUMA|Ver LUMA e I-DO|Explorar IA|Explorar automatización/ }).click();
      await page.locator('#donna-chat-panel [data-state="shaping"]').waitFor({ timeout: 4500 });
      await page.locator('[data-role="assistant"]').last().waitFor({ timeout: 15000 });
      assert.ok((await page.locator('[data-role="assistant"]').last().innerText()).length >= 35);
      assert.ok(await page.getByTestId('donna-contextual-prompts').getByRole('button').count() > 0);
      assert.equal(chatPosts.length, 1, 'exactly one chat request');
      assert.deepEqual(firestorePosts, [], 'no lead request from Donna');
      assert.deepEqual(errors, [], 'no runtime page errors');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-controls') === 'donna-chat-panel');
      console.log(JSON.stringify({
        width,
        hiddenUntilInvoked: 'PASS',
        cornerLauncher: 'PASS',
        openIdeaRotation: 'PASS',
        pauseOnHoverAndTyping: 'PASS',
        manualNext: 'PASS',
        guidedAnswer: 'PASS',
        privacy: 'PASS',
        escapeAndFocus: 'PASS',
      }));
      await page.close();
    }

    const reduced = await browser.newPage({
      viewport: { width: 390, height: 860 },
      reducedMotion: 'reduce',
      locale: 'es-GT',
    });
    await installClock(reduced);
    await reduced.goto(url + '?lang=es', { waitUntil: 'domcontentloaded', timeout: 25000 });
    assert.equal(await reduced.getByTestId('donna-invitation').count(), 0);
    const animation = await reduced.getByTestId('donna-orb').first()
      .locator('.donna-signal__sphere').evaluate(element => getComputedStyle(element).animationName);
    assert.equal(animation, 'none');
    await reduced.getByTestId('donna-launcher').click();
    const initial = await reduced.getByTestId('donna-idea-question').innerText();
    await reduced.waitForTimeout(dwell);
    assert.equal(await reduced.getByTestId('donna-idea-question').innerText(), initial, 'reduced motion stops auto rotation');
    await reduced.getByRole('button', { name: 'Siguiente idea' }).click();
    await reduced.waitForTimeout(250);
    assert.notEqual(await reduced.getByTestId('donna-idea-question').innerText(), initial, 'manual advance still works');
    console.log(JSON.stringify({ reducedMotion: 'PASS', manualNext: 'PASS' }));
    await reduced.close();
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
