import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useLocale } from '../i18n/LocaleProvider';
import { useTheme } from '../theme/ThemeProvider';
import { track } from '../analytics/client';

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Soluciones', href: '#soluciones' },
  { label: 'Productos', href: '#productos' },
  { label: 'Demos', href: '#productos-reales' },
  { label: 'Casos', href: '#casos-resueltos' },
  { label: 'Nosotros', href: '#nosotros' },
] as const;

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const { effectiveTheme, toggle } = useTheme();

  const controls = (
    <div className="flex shrink-0 items-center gap-2" role="group" aria-label={t('Idioma')}>
      <label htmlFor="lch-language" className="sr-only">{t('Idioma')}</label>
      <select
        id="lch-language"
        data-testid="language-switcher"
        className="lch-language h-10 rounded-md border border-white/30 bg-white/10 px-2 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        value={locale}
        onChange={(event) => setLocale(event.target.value as 'es' | 'en' | 'pt')}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
        <option value="pt">PT</option>
      </select>
      <button
        type="button"
        data-testid="theme-toggle"
        onClick={toggle}
        aria-label={t(effectiveTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro')}
        aria-pressed={effectiveTheme === 'dark'}
        title={t(effectiveTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro')}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
      >
        {effectiveTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );

  return (
    <header className="site-brand-surface sticky top-0 z-50 w-full bg-primary text-white shadow-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" onClick={() => track('cta_click', { section: 'hero' })} aria-label={t('LCH Technologies — Inicio')} className="inline-flex shrink-0 items-center rounded-md bg-white px-2 py-1.5">
          <img src="/assets/brand/lch-technologies-logo.svg" alt="LCH Technologies" className="h-10 w-auto sm:h-11" />
        </a>
        <nav className="ml-auto hidden items-center gap-3 xl:flex 2xl:gap-6" aria-label={t('Soluciones')}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-white transition-colors hover:text-teal-200">{t(link.label)}</a>
          ))}
          <a href="#contacto" onClick={() => track('cta_click', { section: 'contact' })} className="whitespace-nowrap rounded bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 xl:px-6">{t('Conversemos')}</a>
        </nav>
        {controls}
        <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 xl:hidden" onClick={() => setIsOpen((value) => !value)} aria-label={t(isOpen ? 'Cerrar menú' : 'Abrir menú')} aria-expanded={isOpen} aria-controls="lch-mobile-nav">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {isOpen && (
        <nav id="lch-mobile-nav" className="space-y-3 border-t border-white/10 bg-primary px-4 pb-6 pt-2 shadow-lg xl:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block rounded px-1 py-2 text-base font-medium text-white hover:text-teal-200" onClick={() => setIsOpen(false)}>{t(link.label)}</a>
          ))}
          <a href="#contacto" className="block w-full rounded bg-accent px-6 py-3 text-center font-semibold text-white" onClick={() => { setIsOpen(false); track('cta_click', { section: 'contact' }); }}>{t('Conversemos')}</a>
        </nav>
      )}
    </header>
  );
};
