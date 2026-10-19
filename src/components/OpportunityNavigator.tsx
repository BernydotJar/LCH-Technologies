import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BrainCircuit, CloudCog, GitMerge, Workflow } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../i18n/LocaleProvider';
import type { InterestArea } from '../integrations/leadContract';
import { track } from '../analytics/client';

type Opportunity = {
  id: 'automation' | 'ai' | 'platform' | 'cloud';
  label: string;
  issue: string;
  approach: string;
  outcome: string;
  detail: string;
  destination: '#soluciones' | '#productos-reales' | '#gobierno';
  interest: InterestArea;
  icon: typeof Workflow;
};

export const OPPORTUNITIES: readonly Opportunity[] = [
  {
    id: 'automation',
    label: 'Reducir trabajo manual',
    issue: 'Aprobaciones y tareas repartidas entre correos, documentos y hojas de cálculo.',
    approach: 'Conectar los pasos, responsables y excepciones en un flujo gobernado.',
    outcome: 'De tareas sueltas a un proceso trazable.',
    detail: 'Automatización de procesos',
    destination: '#soluciones',
    interest: 'Automatización',
    icon: Workflow,
  },
  {
    id: 'ai',
    label: 'Aplicar IA con criterio',
    issue: 'Conocimiento y documentos difíciles de encontrar, analizar o aprovechar.',
    approach: 'Definir un caso útil, fuentes verificables y puntos de revisión humana.',
    outcome: 'De información dispersa a decisiones fundamentadas.',
    detail: 'Inteligencia artificial aplicada',
    destination: '#soluciones',
    interest: 'Inteligencia Artificial',
    icon: BrainCircuit,
  },
  {
    id: 'platform',
    label: 'Conectar mis operaciones',
    issue: 'Ventas, finanzas, inventario y equipos trabajando en herramientas separadas.',
    approach: 'Diseñar software e integraciones alrededor del proceso real del negocio.',
    outcome: 'De sistemas aislados a una operación conectada.',
    detail: 'Software empresarial',
    destination: '#productos-reales',
    interest: 'Software Empresarial',
    icon: GitMerge,
  },
  {
    id: 'cloud',
    label: 'Escalar sin perder control',
    issue: 'Aplicaciones difíciles de evolucionar, observar o mantener disponibles.',
    approach: 'Establecer una arquitectura cloud con despliegues controlados y observabilidad.',
    outcome: 'De infraestructura reactiva a una plataforma preparada.',
    detail: 'Arquitectura cloud',
    destination: '#soluciones',
    interest: 'Cloud',
    icon: CloudCog,
  },
] as const;

export function OpportunityNavigator({
  onContact,
  onOpenDonna,
}: {
  onContact: (interest: InterestArea) => void;
  onOpenDonna: () => void;
}) {
  const [selectedId, setSelectedId] = useState<Opportunity['id']>('automation');
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const active = OPPORTUNITIES.find((option) => option.id === selectedId) ?? OPPORTUNITIES[0];

  return (
    <div id="retos" data-testid="opportunity-navigator" className="relative w-full overflow-hidden rounded-[26px] border border-white/20 bg-[#101E38]/95 p-4 text-white shadow-[0_24px_90px_rgba(2,12,34,.48)] backdrop-blur-lg sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-teal-400/10 blur-[64px]" />
      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-[#8DE7DA]">
            <span className="h-2 w-2 rounded-full bg-[#67E8D3]" aria-hidden="true" />
            {t('Tu punto de partida')}
          </span>
          <span data-testid="opportunity-position" className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-slate-300">{String(OPPORTUNITIES.findIndex((option) => option.id === selectedId) + 1).padStart(2, '0')} / 04</span>
        </div>
        <h2 className="max-w-sm text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
          {t('¿Qué quieres resolver primero?')}
        </h2>
        <p className="mb-5 mt-2 text-sm leading-relaxed text-slate-300">
          {t('Elige un reto. Te mostramos por dónde empezar.')}
        </p>
        <div role="group" aria-label={t('Elige el reto principal')} className="grid grid-cols-2 gap-2.5">
          {OPPORTUNITIES.map((option) => {
            const Icon = option.icon;
            const activeOption = option.id === selectedId;
            return (
              <button
                key={option.id}
                type="button"
                data-testid={'opportunity-' + option.id}
                aria-pressed={activeOption}
                onClick={() => { setSelectedId(option.id); track('opportunity_select', { challenge: option.id }); }}
                className={'flex min-h-[112px] flex-col items-start justify-between gap-3 rounded-xl border p-3 text-left transition-[background-color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78E5D8] sm:min-h-[106px] sm:p-3.5 ' +
                  (activeOption
                    ? 'border-[#76E2D3]/70 bg-[#183E51] text-white shadow-[inset_0_0_0_1px_rgba(118,226,211,.13)]'
                    : 'border-white/10 bg-white/[.055] text-slate-200 hover:border-white/35 hover:bg-white/10')}
              >
                <Icon size={21} aria-hidden="true" className={activeOption ? 'text-[#8CF1E0]' : 'text-[#91B7CE]'} strokeWidth={1.7} />
                <span className="text-[13px] font-semibold leading-snug sm:text-sm">{t(option.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-[218px] rounded-xl border border-[#6DCABD]/25 bg-[linear-gradient(140deg,rgba(9,32,52,.98),rgba(17,57,65,.8))] p-4 sm:p-5" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={reducedMotion ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
            >
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-widest text-[#8DE7DA]">{t(active.detail)}</span>
              <h3 className="text-lg font-bold tracking-tight text-white">{t(active.outcome)}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-[13px]">{t(active.issue)}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#D4F4ED] sm:text-[13px]">{t(active.approach)}</p>
              <a href={active.destination} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#8DE7DA] underline decoration-[#8DE7DA]/45 underline-offset-4 transition-colors hover:text-white">
                {t('Ver cómo lo abordamos')}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={() => { track('cta_click', { section: 'hero' }); onContact(active.interest); }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#80E5D3] px-4 py-2.5 text-sm font-bold text-[#082239] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80E5D3]"
          >
            {t('Conversemos sobre este reto')} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={onOpenDonna}
            className="min-h-11 text-xs font-semibold text-white underline decoration-white/40 underline-offset-4 hover:text-[#8DE7DA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80E5D3]">
            {t('Prefiero preguntarle a Donna')}
          </button>
        </div>
      </div>
    </div>
  );
}
