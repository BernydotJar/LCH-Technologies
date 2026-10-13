import { marketing } from './marketing.ts';
import { casesCopy } from './cases.ts';
import { productCopy } from './products.ts';
import { contactCopy } from './contact.ts';
import { donnaCopy } from './donna.ts';
export type Locale = 'es' | 'en' | 'pt';
const dictionaries: Record<string, readonly [string, string]> = {
  ...marketing, ...casesCopy, ...productCopy, ...contactCopy, ...donnaCopy,
};

export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input) return null;
  const prefix = input.trim().toLowerCase().split(/[-_]/)[0];
  return prefix === 'es' || prefix === 'en' || prefix === 'pt' ? prefix : null;
}
export function selectInitialLocale(requested: string | null, saved: string | null, browserLanguage: string): Locale {
  return normalizeLocale(requested) ?? normalizeLocale(saved) ?? normalizeLocale(browserLanguage) ?? 'es';
}
export function translate(locale: Locale, source: string): string {
  if (locale === 'es') return source;
  return dictionaries[source]?.[locale === 'en' ? 0 : 1] ?? source;
}
export function translationExists(source: string): boolean {
  return Object.hasOwn(dictionaries, source);
}

export const pageMetadata: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  es: {
    title: 'LCH Technologies | IA, Automatización, Software y Cloud',
    description: 'Diseñamos e implementamos Inteligencia Artificial, automatización, software empresarial y soluciones cloud para transformar procesos críticos con gobierno y trazabilidad.',
    ogLocale: 'es_GT',
  },
  en: {
    title: 'LCH Technologies | AI, Automation, Software & Cloud',
    description: 'We design and deliver enterprise AI, automation, software and cloud solutions to transform critical processes with governance and traceability.',
    ogLocale: 'en_US',
  },
  pt: {
    title: 'LCH Technologies | IA, Automação, Software e Nuvem',
    description: 'Projetamos e implementamos IA empresarial, automação, software e soluções em nuvem para transformar processos críticos com governança e rastreabilidade.',
    ogLocale: 'pt_BR',
  },
};
