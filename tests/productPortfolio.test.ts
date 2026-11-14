import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getProductPageMeta, productMeta, productSlugFromPath } from '../src/products/productMeta.ts';
import { renderProductHead } from '../server/productHead.ts';
import { renderLocalizedHead } from '../server/localizedHead.ts';
import { translationExists, translate } from '../src/i18n/messages.ts';
import { respondToDonnaLocalized } from '../src/donna/localized.ts';
import { DONNA_QUICK_PROMPTS, LCH_KNOWLEDGE } from '../src/donna/knowledge.ts';
import { isApprovedPublicLink } from '../src/donna/publicLinks.ts';
import { routeMessage } from '../src/donna/engine.ts';

const slugs = ['ido', 'luma', 'meridian', 'bpca', 'electoral', 'legal'] as const;

test('all six public portfolio profiles have stable, safe slugs and localized descriptions', () => {
  assert.equal(Object.keys(productMeta).length, 6);
  for (const slug of slugs) {
    assert.equal(productSlugFromPath('/productos/' + slug), slug);
    assert.equal(productSlugFromPath('/productos/' + slug + '/'), slug);
    for (const lang of ['es', 'en', 'pt'] as const) {
      const meta = getProductPageMeta('/productos/' + slug, lang);
      assert.ok(meta);
      assert.match(meta.title, /LCH Technologies/);
      assert.ok(meta.description.length > 70);
      assert.equal(meta.url, 'https://lch-app.cloud/productos/' + slug + (lang === 'es' ? '' : '?lang=' + lang));
    }
  }
  assert.equal(productSlugFromPath('/productos/no-existe'), null);
  assert.equal(productSlugFromPath('/productos/../legal'), null);
  assert.equal(productSlugFromPath('/productos/LEGAL'), null);
  assert.equal(productSlugFromPath('/api/chat'), null);
});

test('server renders crawler-visible product title, description, canonical and language variants', () => {
  const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const lang of ['es', 'en', 'pt'] as const) {
    const page = renderProductHead(renderLocalizedHead(source, lang), '/productos/bpca', lang);
    assert.match(page, /<title>Coded Automation \| Productos LCH Technologies<\/title>/);
    assert.match(page, /rel="canonical" href="https:\/\/lch-app.cloud\/productos\/bpca/);
    assert.match(page, /property="og:url" content="https:\/\/lch-app.cloud\/productos\/bpca/);
    assert.match(page, /hreflang="en" href="https:\/\/lch-app.cloud\/productos\/bpca\?lang=en"/);
    assert.match(page, /hreflang="pt" href="https:\/\/lch-app.cloud\/productos\/bpca\?lang=pt"/);
    assert.match(page, /property="og:description"/);
  }
  const original = renderLocalizedHead(source, 'en');
  assert.equal(renderProductHead(original, '/productos/not-valid', 'en'), original);
});

test('product profiles and portfolio navigation remain integrated into the LCH site', () => {
  const productSource = readFileSync(new URL('../src/components/ProductReferences.tsx', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8');
  for (const slug of slugs) {
    assert.match(productSource, new RegExp("id: '" + slug + "'"));
    assert.match(footer, new RegExp("'" + slug + "'"));
  }
  assert.match(productSource, /Catálogo de productos LCH/);
  assert.match(productSource, /ProductArt/);
  assert.match(appSource, /ProductDetailPage/);
  assert.match(productSource, /Developer preview · laboratorio técnico disponible/);
  assert.doesNotMatch(productSource, /github\.com\/BernydotJar\/bp-coded-agents/, 'never advertise private BPCA repo in public portfolio');
  assert.match(productSource, /Demostración estática · no productiva/);
  assert.match(productSource, /Vista conceptual · demo temporalmente fuera de servicio/);
});

test('new portfolio copy is translated and Donna can explain developer previews accurately', () => {
  for (const source of [
    'Catálogo de productos LCH', 'Conocer el producto', 'Explora cada experiencia',
    'Diseñado para problemas reales.', 'Developer preview · laboratorio técnico disponible',
    'Demostración estática · no productiva', 'Coded Automation',
    'Construir automatizaciones en Blue Prism con la disciplina de ingeniería de software.',
    'Coordinación de campañas con decisiones humanas y evidencia verificable.',
  ].filter((key) => key !== 'Coded Automation')) {
    assert.ok(translationExists(source), source);
    for (const lang of ['en', 'pt'] as const) {
      assert.ok(translate(lang, source).length > 4);
    }
  }
  for (const lang of ['es', 'en', 'pt'] as const) {
    const bpca = respondToDonnaLocalized([{ role: 'user', content: 'BPCA' }], lang);
    assert.equal(bpca.kind, 'grounded');
    assert.match(bpca.reply, /preview/i);
    const meridian = respondToDonnaLocalized([{ role: 'user', content: 'Meridian' }], lang);
    assert.equal(meridian.kind, 'grounded');
    assert.match(meridian.reply, /recruit|recrut|CRM/i);
    const campaign = respondToDonnaLocalized([{ role: 'user', content: 'OS Electoral' }], lang);
    assert.equal(campaign.kind, 'grounded');
    assert.match(campaign.reply, /demo|demonstração|demostración|read.only|somente leitura|solo lectura/i);
  }
});


test('Donna product quick action routes to portfolio and every authored link is allowed by the UI', () => {
  const quick = DONNA_QUICK_PROMPTS.find((prompt) => prompt.label === 'Conocer los productos');
  assert.ok(quick, 'product quick prompt must exist');
  const route = routeMessage(quick.message);
  assert.equal(route.kind, 'matched', 'portfolio prompt must not require clarification');
  if (route.kind === 'matched') assert.equal(route.entry.id, 'products');
  for (const lang of ['es', 'en', 'pt'] as const) {
    const answer = respondToDonnaLocalized([{ role: 'user', content: quick.message }], lang);
    assert.equal(answer.kind, 'grounded', 'catalog quick prompt must work in ' + lang);
    assert.match(answer.reply, /BPCA|Coded Automation/i);
  }
  for (const entry of LCH_KNOWLEDGE) {
    for (const link of entry.links) {
      assert.ok(isApprovedPublicLink(link.url), entry.id + ' must have a UI-visible, explicitly reviewed link: ' + link.url);
    }
  }
  for (const slug of ['ido', 'luma', 'meridian', 'bpca', 'electoral', 'legal']) {
    assert.equal(isApprovedPublicLink('https://lch-app.cloud/productos/' + slug), true, slug);
  }
  assert.equal(isApprovedPublicLink('https://evil.example/'), false);
  assert.equal(isApprovedPublicLink('https://lch-app.cloud/productos/bpca?redirect=https://evil.example'), false);
});
