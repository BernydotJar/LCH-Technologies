import { useLocale } from '../i18n/LocaleProvider';
import { useAnalyticsPreferences } from '../analytics/AnalyticsProvider';

export const Footer = () => {
  const { t } = useLocale();
  const { available, openPreferences } = useAnalyticsPreferences();

  return (
    <footer className="border-t border-white/10 bg-primary pb-8 pt-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <a href="#inicio" aria-label={t('LCH Technologies — Inicio')} className="mb-6 inline-flex items-center rounded-md bg-white px-2 py-1.5">
              <img src="/assets/brand/lch-technologies-logo.svg" alt="LCH Technologies" className="h-10 w-auto" />
            </a>
            <p className="text-sm text-neutral-400">Operational Transformation Accelerators</p>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{t('Soluciones')}</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#soluciones" className="transition-colors hover:text-white">{t('Inteligencia Artificial')}</a></li>
              <li><a href="#soluciones" className="transition-colors hover:text-white">{t('Automatización')}</a></li>
              <li><a href="#soluciones" className="transition-colors hover:text-white">{t('Software Empresarial')}</a></li>
              <li><a href="#soluciones" className="transition-colors hover:text-white">{t('Cloud Solutions')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{t('Productos')}</h4>
            <ul className="space-y-4 text-sm text-neutral-400"><li><a href="#productos" className="transition-colors hover:text-white">LCH Evidence AI</a></li></ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{t('Compañía')}</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#nosotros" className="transition-colors hover:text-white">{t('Enfoque')}</a></li>
              <li><a href="#contacto" className="transition-colors hover:text-white">{t('Contacto')}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-neutral-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} LCH Technologies. {t('Todos los derechos reservados.')}</p>
          <div className="flex flex-wrap gap-6">
            <a href="#privacidad-contacto" className="transition-colors hover:text-white">{t('Aviso de privacidad')}</a>
            {available && <button type="button" onClick={openPreferences} className="rounded underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{t('Preferencias de analítica')}</button>}
          </div>
        </div>
      </div>
    </footer>
  );
};
