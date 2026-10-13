import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { activateAnalytics, deactivateAnalytics, getConsent, measurementId, persistConsent, privacySignalEnabled, track, type Consent } from './client';
import { useLocale } from '../i18n/LocaleProvider';

type AnalyticsContextValue = { consent: Consent; available: boolean; openPreferences: () => void };
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { t, locale } = useLocale();
  const available = Boolean(measurementId()) && !privacySignalEnabled();
  const [consent, setConsent] = useState<Consent>(getConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    if (available && consent === 'granted' && activateAnalytics()) {
      track('page_view', { page_path: '/', language: locale });
    }
  // One activation per consent decision; LocaleProvider tracks subsequent language changes.
  }, [available, consent]);

  const choose = (decision: Exclude<Consent, null>) => {
    persistConsent(decision);
    if (decision === 'denied') deactivateAnalytics();
    setConsent(decision);
    setPreferencesOpen(false);
  };
  const value = useMemo<AnalyticsContextValue>(() => ({
    consent, available, openPreferences: () => setPreferencesOpen(true),
  }), [consent, available]);

  return <AnalyticsContext.Provider value={value}>
    {children}
    {available && (consent === null || preferencesOpen) && (
      <aside role="region" aria-label={t('Preferencias de analítica')} className="fixed bottom-4 left-3 z-[90] w-[min(400px,calc(100vw-1.5rem))] rounded-xl border border-slate-300 bg-white p-5 text-slate-800 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <p className="text-base font-bold text-slate-900">{t('Tu privacidad importa')}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {t('Con tu permiso utilizamos Google Analytics para medir visitas y el uso de la web. No enviamos conversaciones con Donna ni los datos del formulario. Puedes cambiar tu decisión desde el pie de página.')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" data-testid="analytics-reject" onClick={() => choose('denied')} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
            {t('Rechazar')}
          </button>
          <button type="button" data-testid="analytics-accept" onClick={() => choose('granted')} className="min-h-11 rounded-lg bg-[#0C0A50] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155E75]">
            {t('Aceptar analítica')}
          </button>
        </div>
      </aside>
    )}
  </AnalyticsContext.Provider>;
}
export function useAnalyticsPreferences(): AnalyticsContextValue {
  const value = useContext(AnalyticsContext);
  if (!value) throw new Error('useAnalyticsPreferences must be used within AnalyticsProvider');
  return value;
}
