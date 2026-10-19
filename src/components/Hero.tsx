import { ArrowRight, ArrowDownRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../i18n/LocaleProvider';
import type { InterestArea } from '../integrations/leadContract';
import { track } from '../analytics/client';
import { OpportunityNavigator } from './OpportunityNavigator';

export function Hero({
  onContact,
  onOpenDonna,
}: {
  onContact: (interest: InterestArea) => void;
  onOpenDonna: () => void;
}) {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();

  return (
    <section id="inicio" className="site-hero relative isolate overflow-hidden bg-[#0C0A50] text-white">
      <div className="site-hero-underlay pointer-events-none absolute inset-0 z-[-1] overflow-hidden bg-[#0C0A50]">
        <div className="absolute -right-36 -top-56 h-[580px] w-[580px] rounded-full bg-teal-500/20 blur-[110px]" />
        <div className="absolute -bottom-64 -left-32 h-[540px] w-[540px] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[.12]" style={{ backgroundImage: 'linear-gradient(rgba(148,210,224,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(148,210,224,.45) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'linear-gradient(to right,transparent,black 45%,black)' }} />
        <div className="site-hero-gradient-t absolute inset-0 bg-gradient-to-t from-[#0C0A50]/90 via-transparent to-[#0C0A50]/40" />
        <div className="site-hero-gradient-r absolute inset-0 bg-gradient-to-r from-[#0C0A50]/70 via-transparent to-transparent" />
      </div>
      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:min-h-[790px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14 lg:px-10 lg:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65, ease: 'easeOut' }}
          className="flex min-w-0 flex-col items-start"
        >
          <div className="mb-7 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#85DEDA]/25 bg-[#7AE6D8]/10 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-[#9BEFE5]">
            <Sparkles size={14} aria-hidden="true" />
            {t('AI · Automation · Engineering')}
          </div>
          <h1 className="max-w-[720px] text-4xl font-bold leading-[1.07] tracking-[-.038em] text-white sm:text-5xl lg:text-[clamp(3rem,4.1vw,4.6rem)]">
            {t('Tu operación puede funcionar mejor.')}{' '}
            <span className="mt-2 block bg-gradient-to-r from-[#A9EDF2] via-[#8DE9DB] to-[#D1F9C2] bg-clip-text text-transparent">
              {t('Hagámoslo posible.')}
            </span>
          </h1>
          <p className="mt-6 max-w-[560px] text-base leading-relaxed text-slate-200 sm:text-lg lg:text-[20px]">
            {t('Conectamos personas, procesos y tecnología para que tu empresa avance con claridad, automatización y control. Empezamos por tu reto, no por una herramienta.')}
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="#retos" onClick={() => track('cta_click', { section: 'hero' })}
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-[#7DE3D3] px-6 py-3 font-bold text-[#072A40] shadow-[0_12px_35px_rgba(10,189,165,.16)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A8F8E8]">
              {t('Explorar mi reto')}
              <ArrowDownRight size={19} aria-hidden="true" />
            </a>
            <a href="#contacto" onClick={() => track('cta_click', { section: 'hero' })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-[#9BEFE5] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {t('Hablar con el equipo')} <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-10 grid w-full max-w-[580px] grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
            {[
              { icon: CheckCircle2, label: 'Entender el proceso' },
              { icon: ShieldCheck, label: 'Diseñar con control' },
              { icon: ArrowRight, label: 'Entregar algo operable' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] font-medium leading-tight text-slate-200">
                <Icon size={16} strokeWidth={1.8} className="shrink-0 text-[#8DE7DA]" aria-hidden="true" />
                {t(label)}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, ease: 'easeOut', delay: .12 }}
          className="relative min-w-0 lg:max-w-[625px]"
        >
          <div className="pointer-events-none absolute -inset-6 rounded-[40px] border border-white/5" aria-hidden="true" />
          <OpportunityNavigator onContact={onContact} onOpenDonna={onOpenDonna} />
        </motion.div>
      </div>
      <div className="relative border-t border-white/10 bg-[#071334]/70">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-300 sm:px-6 lg:px-10">
          <span>{t('Diseño responsable. Ejecución verificable.')}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#94F3E1]">
            <span>{t('IA empresarial')}</span><span className="text-white/35">·</span><span>{t('Automatización')}</span><span className="text-white/35">·</span><span>Software</span><span className="text-white/35">·</span><span>Cloud</span>
          </span>
        </div>
      </div>
    </section>
  );
}
