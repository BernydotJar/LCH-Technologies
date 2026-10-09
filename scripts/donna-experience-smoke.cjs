/*
 * GH-21 browser smoke:
 * NODE_PATH=/workspace/projects/LUMA/node_modules \
 * LCH_SMOKE_URL=http://127.0.0.1:4231/ node scripts/donna-experience-smoke.cjs
 * Tests live, same-origin /api/chat; never submits a real lead.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = process.env.LCH_SMOKE_URL || 'http://127.0.0.1:4231/';
const accelerated = process.env.GH21_ACCELERATED === '1';
const dwellMs = accelerated ? 1_650 : 6_300;
const installAcceleratedRotation = async (page) => {
  if (!accelerated) return;
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window);
    window.setTimeout = (callback, timeout, ...args) => original(callback, timeout === 5800 ? 1200 : timeout, ...args);
  });
};
const launch = {
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
};

async function run() {
  const browser = await chromium.launch(launch);
  try {
    for (const width of [390, 1365]) {
      const page = await browser.newPage({
        viewport: { width, height: 860 },
        reducedMotion: 'no-preference',
      });
      const errors = [];
      const chatPosts = [];
      const firestorePosts = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (request.method() !== 'POST') return;
        if (request.url().endsWith('/api/chat')) chatPosts.push(request.url());
        if (request.url().includes('firestore.googleapis.com')) firestorePosts.push(request.url());
      });
      await installAcceleratedRotation(page);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      const invitation = page.getByTestId('donna-invitation');
      const question = page.getByTestId('donna-invitation-question');
      await invitation.waitFor();
      const original = (await question.innerText()).trim();
      const launcherWidth = (await page.getByRole('button', { name: 'Hablar con Donna' }).boundingBox())?.width;

      // Test real wall-clock rotation on mobile. Mock clocks can race React's
      // effect registration and produce a false negative for this interaction.
      if (width === 390 || accelerated) {
        await page.waitForTimeout(accelerated ? 1_900 : 6_500);
        await page.waitForFunction(
          (old) => document.querySelector('[data-testid="donna-invitation-question"]')?.textContent?.trim() !== old,
          original,
          { timeout: 3000 },
        );
        assert.notEqual((await question.innerText()).trim(), original);
      }
      assert.equal(chatPosts.length, 0);
      const launcherWidthAfter = (await page.getByRole('button', { name: 'Hablar con Donna' }).boundingBox())?.width;
      assert.equal(launcherWidthAfter, launcherWidth, 'launcher should not resize as prompts rotate');

      // Keyboard focus should also pause an invitation while a user reads it.
      if (width === 1365) {
        await invitation.getByRole('button', { name: 'Descartar sugerencia de Donna' }).focus();
        await page.waitForTimeout(360);
        const focusedQuestion = (await question.innerText()).trim();
        await page.waitForTimeout(dwellMs);
        assert.equal((await question.innerText()).trim(), focusedQuestion, 'focus should pause rotation');
      }

      // Hover pauses automatic ideas; the launcher signal responds.
      await invitation.hover();
      const hovered = (await question.innerText()).trim();
      if (width === 390 || accelerated) {
        await page.waitForTimeout(dwellMs);
        assert.equal((await question.innerText()).trim(), hovered, 'hover should pause auto ideas');
      }
      await page.getByRole('button', { name: 'Hablar con Donna' }).hover();
      await page.getByTestId('donna-orb').last().waitFor();
      assert.equal(await page.getByTestId('donna-orb').last().getAttribute('data-state'), 'hover');

      // The chat has a separate suggestion surface and an animated orb.
      await page.getByRole('button', { name: 'Hablar con Donna' }).click();
      const dialog = page.getByRole('dialog', { name: /Conversación con Donna/ });
      await dialog.waitFor();
      const initialIdea = await page.getByTestId('donna-idea-question').innerText();
      await page.getByRole('button', { name: 'Siguiente idea' }).click();
      await page.waitForTimeout(280);
      assert.notEqual(await page.getByTestId('donna-idea-question').innerText(), initialIdea);
      if (width === 1365) {
        await page.locator('#donna-message').fill('Estoy escribiendo mi pregunta');
        await page.waitForTimeout(360);
        const whileTyping = await page.getByTestId('donna-idea-question').innerText();
        await page.waitForTimeout(accelerated ? 1_700 : 6_250);
        assert.equal(await page.getByTestId('donna-idea-question').innerText(), whileTyping, 'typing pauses suggestions');
        await page.locator('#donna-message').fill('');
      }
      const panel = await dialog.boundingBox();
      assert.ok(panel && panel.x >= 0 && panel.x + panel.width <= width + 2, 'chat remains inside viewport');

      // Delay only the API response to inspect request and success orb phases.
      await page.route('**/api/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 650));
        await route.continue();
      });
      await page.getByTestId('donna-idea-card').getByRole('button', { name: /Explorar Evidence AI|Conocer LUMA|Ver LUMA e I-DO|Explorar IA|Explorar automatización/ }).click();
      await page.locator('#donna-chat-panel [data-state="shaping"]').waitFor({ timeout: 3000 });
      await page.locator('[data-role="assistant"]').last().waitFor({ timeout: 12000 });
      assert.ok((await page.locator('[data-role="assistant"]').last().innerText()).length > 35);
      assert.equal(await page.getByTestId('donna-orb').first().getAttribute('data-state'), 'responding');
      const next = page.getByTestId('donna-contextual-prompts');
      await next.waitFor({ timeout: 3000 });
      assert.ok(await next.getByRole('button').count() >= 1);
      assert.equal(chatPosts.length, 1, 'one click triggers one request');

      await next.getByRole('button').first().click();
      await page.locator('[data-role="assistant"]').nth(1).waitFor({ timeout: 12000 });
      assert.equal(chatPosts.length, 2);
      assert.deepEqual(firestorePosts, [], 'chat and suggestions must not generate leads');
      assert.deepEqual(errors, [], 'no JS page errors');

      console.log(JSON.stringify({
        viewport: width, mode: accelerated ? 'accelerated-clock' : 'real-clock', rotation: width === 390 || accelerated ? 'PASS' : 'covered on mobile', hoverPause: width === 390 || accelerated ? 'PASS' : 'covered on mobile', focusPause: width === 1365 ? 'PASS' : 'covered on desktop', typingPause: width === 1365 ? 'PASS' : 'covered on desktop', orbState: 'PASS',
        manualNext: 'PASS', contextualPrompts: 'PASS', privacy: 'PASS', errors: errors.length,
      }));
      await page.close();
    }

    const reduced = await browser.newPage({
      viewport: { width: 390, height: 860 },
      reducedMotion: 'reduce',
    });
    await installAcceleratedRotation(reduced);
    await reduced.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const firstQuestion = await reduced.getByTestId('donna-invitation-question').innerText();
    await reduced.waitForTimeout(dwellMs);
    assert.equal(await reduced.getByTestId('donna-invitation-question').innerText(), firstQuestion);
    const animation = await reduced.getByTestId('donna-orb').first()
      .locator('.donna-signal__sphere')
      .evaluate((el) => getComputedStyle(el).animationName);
    assert.equal(animation, 'none', 'reduced motion must disable orb animation');
    await reduced.getByRole('button', { name: 'Hablar con Donna' }).click();
    const beforeManual = await reduced.getByTestId('donna-idea-question').innerText();
    await reduced.getByRole('button', { name: 'Siguiente idea' }).click();
    await reduced.waitForTimeout(300);
    assert.notEqual(await reduced.getByTestId('donna-idea-question').innerText(), beforeManual);
    console.log(JSON.stringify({ reducedMotion: 'PASS', manualNext: 'PASS' }));
    await reduced.close();
  } finally {
    await browser.close();
  }
}
run().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
