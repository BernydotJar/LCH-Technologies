import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translate, type Locale, normalizeLocale, selectInitialLocale, pageMetadata } from './messages';
import { track } from '../analytics/client';

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
    document.title = meta.title;
    updateMeta('meta[name="description"]', meta.description);
    updateMeta('meta[property="og:title"]', meta.title);
    updateMeta('meta[property="og:description"]', meta.description);
    updateMeta('meta[property="og:locale"]', meta.ogLocale);
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
    updateMeta('meta[property="og:url"]', 'https://lch-app.cloud/' + (locale === 'es' ? '' : '?lang=' + locale));
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute(
      'href', 'https://lch-app.cloud/' + (locale === 'es' ? '' : '?lang=' + locale),
    );
    for (const lang of ['es', 'en', 'pt'] as const) {
      const link = document.querySelector<HTMLLinkElement>('link[hreflang="' + lang + '"]');
      link?.setAttribute('href', 'https://lch-app.cloud/' + (lang === 'es' ? '' : '?lang=' + lang));
    }
    track('page_view', { language: locale, page_path: '/' });
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
