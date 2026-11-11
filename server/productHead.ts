import { normalizeLocale } from '../src/i18n/messages.ts';
import { getProductPageMeta } from '../src/products/productMeta.ts';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function replaceMeta(html: string, kind: 'name' | 'property', key: string, value: string): string {
  const pattern = new RegExp('(<meta\\s+' + kind + '="' + key + '"\\s+content=")[^"]*(")', 'i');
  return html.replace(pattern, (_, a: string, b: string) => a + escapeHtml(value) + b);
}

/** SSR metadata for each shareable product profile. No dynamic untrusted content. */
export function renderProductHead(html: string, pathname: string, language: string | null): string {
  const locale = normalizeLocale(language) ?? 'es';
  const meta = getProductPageMeta(pathname, locale);
  if (!meta) return html;
  let result = html.replace(/<title>[^<]*<\/title>/i, '<title>' + escapeHtml(meta.title) + '</title>');
  for (const [kind, key, value] of [
    ['name', 'description', meta.description],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['property', 'og:url', meta.url],
    ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
  ] as const) {
    result = replaceMeta(result, kind, key, value);
  }
  result = result.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
    (_, a: string, b: string) => a + escapeHtml(meta.url) + b,
  );
  for (const lang of ['es', 'en', 'pt'] as const) {
    const href = 'https://lch-app.cloud/productos/' + meta.slug + (lang === 'es' ? '' : '?lang=' + lang);
    const pattern = new RegExp('(<link\\s+rel="alternate"\\s+hreflang="' + lang + '"\\s+href=")[^"]*(")', 'i');
    result = result.replace(pattern, (_, a: string, b: string) => a + escapeHtml(href) + b);
  }
  result = result.replace(
    /(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")[^"]*(")/i,
    (_, a: string, b: string) => a + 'https://lch-app.cloud/productos/' + meta.slug + b,
  );
  return result;
}
