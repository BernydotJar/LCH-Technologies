import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getProductPageMeta, productMeta, productSlugFromPath } from '../src/products/productMeta.ts';
import { renderProductHead } from '../server/productHead.ts';
import { renderLocalizedHead } from '../server/localizedHead.ts';
import { translationExists, translate } from '../src/i18n/messages.ts';
import { respondToDonnaLocalized } from '../src/donna/localized.ts';

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
  assert.match(productSource, /Developer preview · repositorio y documentación/);
  assert.match(productSource, /Demostración estática · no productiva/);
  assert.match(productSource, /Vista conceptual · demo temporalmente fuera de servicio/);
});

test('new portfolio copy is translated and Donna can explain developer previews accurately', () => {
  for (const source of [
    'Catálogo de productos LCH', 'Conocer el producto', 'Explora cada experiencia',
    'Diseñado para problemas reales.', 'Developer preview · repositorio y documentación',
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
