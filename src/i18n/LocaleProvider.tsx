import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translate, type Locale, normalizeLocale, selectInitialLocale, pageMetadata } from './messages';
import { track } from '../analytics/client';
import { getProductPageMeta } from '../products/productMeta';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (source: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORE_KEY = 'lch.language';

function readStoredLocale(): string | null {
  try { return window.localStorage.getItem(STORE_KEY); } catch { return null; }
}
function updateMeta(selector: string, value: string): void {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => selectInitialLocale(
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null,
    typeof window !== 'undefined' ? readStoredLocale() : null,
    typeof navigator !== 'undefined' ? navigator.language : 'es',
  ));

  useEffect(() => {
    document.documentElement.lang = locale;
    try { window.localStorage.setItem(STORE_KEY, locale); } catch { /* storage optional */ }
    const url = new URL(window.location.href);
    if (locale === 'es') url.searchParams.delete('lang');
    else url.searchParams.set('lang', locale);
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    const meta = pageMetadata[locale];
    const productMeta = getProductPageMeta(window.location.pathname, locale);
    const title = productMeta?.title ?? meta.title;
    const description = productMeta?.description ?? meta.description;
    const canonical = productMeta?.url ?? 'https://lch-app.cloud/' + (locale === 'es' ? '' : '?lang=' + locale);
    document.title = title;
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:locale"]', meta.ogLocale);
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta('meta[property="og:url"]', canonical);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute(
      'href', canonical,
    );
    for (const lang of ['es', 'en', 'pt'] as const) {
      const link = document.querySelector<HTMLLinkElement>('link[hreflang="' + lang + '"]');
      link?.setAttribute('href', productMeta ? 'https://lch-app.cloud/productos/' + productMeta.slug + (lang === 'es' ? '' : '?lang=' + lang) : 'https://lch-app.cloud/' + (lang === 'es' ? '' : '?lang=' + lang));
    }
    track('page_view', { language: locale, page_path: productMeta ? ('/productos/' + productMeta.slug) as '/productos/ido' | '/productos/luma' | '/productos/meridian' | '/productos/bpca' | '/productos/electoral' | '/productos/legal' : '/' });
  }, [locale]);

  useEffect(() => {
    const syncFromHistory = () => {
      const requested = new URLSearchParams(window.location.search).get('lang');
      if (requested) setLocale(normalizeLocale(requested) ?? 'es');
    };
    window.addEventListener('popstate', syncFromHistory);
    return () => window.removeEventListener('popstate', syncFromHistory);
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => {
      if (nextLocale !== locale) track('language_change', { language: nextLocale });
      setLocale(nextLocale);
    },
    t: (source) => translate(locale, source),
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used within LocaleProvider');
  return value;
}
