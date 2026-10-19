/**
 * GA4 integration: optional, consent-gated, and intentionally free of
 * user-supplied text, email addresses, lead IDs, chat contents and URL queries.
 */
export type AnalyticsEvent =
  | 'page_view' | 'language_change' | 'theme_change'
  | 'product_demo_select' | 'product_demo_auto_advance' | 'contact_submit_success' | 'contact_submit_error'
  | 'donna_open' | 'cta_click' | 'opportunity_select';
export type SafeDimensions = {
  language?: 'es' | 'en' | 'pt';
  theme?: 'dark' | 'light';
  product?: 'ido' | 'luma' | 'legal' | 'meridian';
  section?: 'hero' | 'capabilities' | 'product' | 'contact' | 'cases';
  page_path?: '/';
  challenge?: 'automation' | 'ai' | 'platform' | 'cloud';
};
export type Consent = 'granted' | 'denied' | null;
const STORAGE_KEY = 'lch.analytics.consent';
const STORAGE_VALUES = new Set(['granted', 'denied']);
let enabled = false;

declare global {
  interface Window {
    dataLayer?: unknown[]; // GA4 command queue; no visitor-provided data
    gtag?: (...args: unknown[]) => void;
  }
}

export function validMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]{5,16}$/.test(value);
}
export function measurementId(): string {
  // Vite replaces this at build time; nothing secret is stored here.
  const env = import.meta.env as unknown as { VITE_GA_MEASUREMENT_ID?: string } | undefined;
  const id = env?.VITE_GA_MEASUREMENT_ID?.trim() ?? '';
  return validMeasurementId(id) ? id : '';
}
export function privacySignalEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === '1'
    || (typeof window !== 'undefined' && (window as Window & { doNotTrack?: string }).doNotTrack === '1');
}
export function getConsent(): Consent {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && STORAGE_VALUES.has(value) ? value as Consent : null;
  } catch { return null; }
}
export function persistConsent(choice: Exclude<Consent, null>): void {
  try { window.localStorage.setItem(STORAGE_KEY, choice); } catch { /* no storage required */ }
  if (choice === 'denied') enabled = false;
}
/** Explicit opt-in only: script is never fetched before this function runs. */
export function activateAnalytics(): boolean {
  if (typeof document === 'undefined' || privacySignalEnabled()) return false;
  const id = measurementId();
  if (!id || getConsent() !== 'granted') return false;
  if (enabled) return true;
  enabled = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  if (!document.querySelector('script[data-lch-ga4]')) {
    const script = document.createElement('script');
    script.async = true;
    script.dataset.lchGa4 = 'true';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }
  return true;
}
export function deactivateAnalytics(): void {
  enabled = false;
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
  }
  // Consent revocation prevents any subsequent events this visit.
  // GA4 cookies may already exist: clear known first-party GA cookies.
  if (typeof document !== 'undefined') {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim();
      if (name === '_ga' || name?.startsWith('_ga_')) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
      }
    }
  }
}
export function track(event: AnalyticsEvent, values: SafeDimensions = {}): void {
  if (!enabled || getConsent() !== 'granted' || privacySignalEnabled()) return;
  // Rebuild from a whitelist: callers cannot send untrusted fields.
  const dimensions: Record<string, string> = {};
  if (values.language && ['es', 'en', 'pt'].includes(values.language)) dimensions.language = values.language;
  if (values.theme && ['dark', 'light'].includes(values.theme)) dimensions.theme = values.theme;
  if (values.product && ['ido', 'luma', 'legal', 'meridian'].includes(values.product)) dimensions.product = values.product;
  if (values.section && ['hero', 'capabilities', 'product', 'contact', 'cases'].includes(values.section)) dimensions.section = values.section;
  if (values.page_path === '/') dimensions.page_path = '/';
  if (values.challenge && ['automation', 'ai', 'platform', 'cloud'].includes(values.challenge)) dimensions.challenge = values.challenge;
  window.gtag?.('event', event, dimensions);
}
