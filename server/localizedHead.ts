import { normalizeLocale, pageMetadata } from '../src/i18n/messages.ts';
import type { Locale } from '../src/i18n/messages.ts';

const DEFAULT_ORIGIN = 'https://lch-app.cloud';
const ALLOWED_CANONICAL_ORIGINS = new Set([
  DEFAULT_ORIGIN,
  'https://lch-technologies.com',
]);

/** Explicit allowlist: never let a Host header or arbitrary env value inject public metadata. */
export function validateCanonicalOrigin(origin: string): string {
  const value = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  if (!ALLOWED_CANONICAL_ORIGINS.has(value)) {
    throw new Error('Invalid LCH_CANONICAL_ORIGIN: only approved HTTPS domains are allowed');
  }
  return value;
}
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function replaceMeta(html: string, kind: 'name' | 'property', key: string, value: string): string {
  // key only comes from fixed, trusted metadata identifiers below
  const needle = new RegExp('(<meta\\s+' + kind + '="' + key + '"\\s+content=")[^"]*(")', 'i');
  return html.replace(needle, (_, begin: string, end: string) => begin + escapeHtml(value) + end);
}

/** Crawler-visible metadata for the same locale links used by the SPA switcher. */
export function renderLocalizedHead(html: string, language: string | null, canonicalOrigin = DEFAULT_ORIGIN): string {
  const origin = validateCanonicalOrigin(canonicalOrigin);
  const brandedHtml = html.replaceAll(DEFAULT_ORIGIN, origin);
  const locale: Locale | null = normalizeLocale(language);
  if (!locale || locale === 'es') return brandedHtml;
  const meta = pageMetadata[locale];
  const href = origin + '/?lang=' + locale;
  return [
    (value: string) => value.replace(/(<html\b[^>]*\blang=")[^"]*(")/i, (_, a: string, b: string) => a + locale + b),
    (value: string) => value.replace(/<title>[^<]*<\/title>/i, '<title>' + escapeHtml(meta.title) + '</title>'),
    (value: string) => replaceMeta(value, 'name', 'description', meta.description),
    (value: string) => replaceMeta(value, 'property', 'og:title', meta.title),
    (value: string) => replaceMeta(value, 'property', 'og:description', meta.description),
    (value: string) => replaceMeta(value, 'property', 'og:locale', meta.ogLocale),
    (value: string) => replaceMeta(value, 'property', 'og:url', href),
    (value: string) => replaceMeta(value, 'name', 'twitter:title', meta.title),
    (value: string) => replaceMeta(value, 'name', 'twitter:description', meta.description),
    (value: string) => value.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, (_, a: string, b: string) => a + href + b),
  ].reduce((content, transform) => transform(content), brandedHtml);
}
