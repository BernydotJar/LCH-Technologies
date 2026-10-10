import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Building2,
  CircleCheck,
  Database,
  Layers3,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type ProductReference = {
  id: 'ido' | 'luma' | 'legal';
  name: string;
  kicker: string;
  label: string;
  description: string;
  whatIsIt: string;
  idealFor: string[];
  url: string;
  displayUrl: string;
  tags: string[];
  embed: boolean;
  live: boolean;
  publicAvailable: boolean;
  availabilityLabel: string;
  stat: string;
  statLabel: string;
  icon: typeof Building2;
};

const products: ProductReference[] = [
  {
    id: 'ido',
    name: 'I-DO',
    kicker: 'AI-native Business OS',
    label: 'Un sistema operativo empresarial para conectar operaciones, finanzas y decisiones.',
    description:
      'ERP/SaaS multi-tenant diseñado para integrar procesos, equipos y sistemas con un núcleo financiero gobernado y automatización incorporada.',
    whatIsIt:
      'Un SaaS empresarial multi-tenant que reúne finanzas, compras, ventas, inventario, personas y automatizaciones en una misma capa operativa, con IA aplicada donde aporta contexto y decisión.',
    idealFor: ['Operaciones', 'Finanzas', 'Back office', 'Procesos multi-sistema'],
    url: 'https://ido.lch-app.cloud/w/colombia/inicio',
    displayUrl: 'ido.lch-app.cloud / colombia',
    tags: ['ERP', 'Multi-tenant', 'AI-native'],
    embed: false,
    live: true,
    publicAvailable: true,
    availabilityLabel: 'Demo interactiva disponible',
    stat: 'BUSINESS OS',
    statLabel: 'enterprise SaaS',
    icon: Building2,
  },
  {
    id: 'luma',
    name: 'LUMA',
    kicker: 'Learning Intelligence',
    label: 'Aprendizaje que entiende a la persona, no solo al curso.',
    description:
      'Un Learning Twin explicable conecta objetivos, evidencia, confianza y progreso para decidir la siguiente mejor acción.',
    whatIsIt:
      'Una plataforma de learning intelligence que construye un Learning Twin de cada participante para adaptar práctica, contenido y acompañamiento según evidencia real de progreso.',
    idealFor: ['Academias', 'Educación premium', 'L&D', 'Programas high-ticket'],
    url: 'https://luma.lch-app.cloud/onboarding',
    displayUrl: 'luma.lch-app.cloud / onboarding',
    tags: ['Learning Twin', 'Evidence', 'Adaptive learning'],
    embed: true,
    live: true,
    publicAvailable: true,
    availabilityLabel: 'Demo interactiva disponible',
    stat: 'LIVE',
    statLabel: 'demo interactiva',
    icon: BookOpenCheck,
  },
  {
    id: 'legal',
    name: 'Evidencia Jurídica',
    kicker: 'Evidence-first RAG',
    label: 'Respuestas jurídicas con trazabilidad antes que confianza ciega.',
    description:
      'Consulta normativa y procedimientos con citas, clasificación de fuentes y límites explícitos de confianza.',
    whatIsIt:
      'Un asistente jurídico RAG que responde desde fuentes normativas verificables y muestra la evidencia, citas y límites de confianza detrás de cada respuesta.',
    idealFor: ['Legal', 'Compliance', 'Gobierno', 'Knowledge operations'],
    url: 'https://evidencia.lch-app.cloud/',
    displayUrl: 'evidencia.lch-app.cloud / public demo',
    tags: ['RAG', 'Legal AI', 'Citations'],
    embed: true,
    live: true,
    publicAvailable: true,
    availabilityLabel: 'Demo interactiva disponible',
    stat: 'RAG',
    statLabel: 'evidence-first',
    icon: Scale,
  },
];

const IdoPreview = () => (
  <div className="relative h-full overflow-hidden bg-[#f5f7fb] text-primary">
    <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_80%_10%,rgba(21,94,117,0.20),transparent_32%)]" />
    <div className="relative h-full grid grid-cols-[72px_1fr] sm:grid-cols-[86px_1fr]">
      <aside className="border-r border-slate-200 bg-white/90 p-3 sm:p-4 flex flex-col items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">I</div>
        {[Layers3, Database, CircleCheck, ShieldCheck].map((Icon, index) => (
          <div
            key={index}
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            <Icon size={17} />
          </div>
        ))}
      </aside>

      <div className="min-w-0 p-4 sm:p-7 lg:p-9">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Workspace Colombia</div>
            <h4 className="text-xl sm:text-2xl font-bold mt-1">Business command center</h4>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Operación saludable
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            ['Ingresos', '$1.28M', '+12.4%'],
            ['Órdenes', '1,842', '+8.1%'],
            ['Automatizado', '76%', '+5.0%'],
            ['Alertas', '03', 'controladas'],
          ].map(([name, value, delta]) => (
            <div key={name} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[10px] sm:text-xs text-slate-400 mb-2">{name}</div>
              <div className="text-lg sm:text-2xl font-bold">{value}</div>
              <div className="text-[10px] sm:text-xs text-accent mt-1">{delta}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[230px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="font-semibold">Operación consolidada</div>
                <div className="text-xs text-slate-400 mt-1">Últimos 6 periodos</div>
              </div>
              <span className="text-[10px] border border-slate-200 px-2 py-1 rounded-md text-slate-500">COP</span>
            </div>
            <div className="h-28 flex items-end gap-2 sm:gap-3">
              {[45, 62, 54, 78, 68, 92, 80, 98, 88, 100].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.035 }}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-accent/70"
                />
              ))}
            </div>
          </div>

          <div className="bg-primary text-white rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[230px]">
            <div>
              <div className="flex items-center gap-2 text-xs text-sky-200 mb-4">
                <Sparkles size={14} />
                AI operations
              </div>
              <div className="text-lg font-bold leading-tight">3 decisiones requieren atención.</div>
              <p className="text-sm text-white/55 mt-3 leading-relaxed">I-DO priorizó impacto financiero, inventario y riesgo operativo.</p>
            </div>
            <div className="space-y-2 mt-6">
              {['Inventario crítico', 'Conciliación pendiente', 'Orden fuera de SLA'].map((item) => (
                <div key={item} className="flex items-center justify-between text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                  <span>{item}</span>
                  <ArrowRight size={13} className="text-sky-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ProductReferences = () => {
  const [activeId, setActiveId] = useState<ProductReference['id']>('ido');
  const reduceMotion = useReducedMotion();
  const active = useMemo(
    () => products.find((product) => product.id === activeId) ?? products[0],
    [activeId],
  );

  return (
    <section id="productos-reales" className="relative overflow-hidden bg-[#080720] text-white py-24 sm:py-32 border-y border-white/10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute bottom-[-220px] right-[-120px] w-[620px] h-[620px] rounded-full bg-[#4138b8]/20 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center mb-12 sm:mb-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-[0.22em] uppercase text-sky-200 border border-white/10 bg-white/[0.04] px-4 py-2 rounded-full mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
            Real products · real environments
          </motion.div>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.92]"
          >
            ¿Quieres ver demos?
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-400">Mira.</span>
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.1 }}
            className="mt-7 max-w-2xl mx-auto text-base sm:text-lg text-white/55 leading-relaxed"
          >
            Las ideas son fáciles. Los productos funcionando, no tanto. Explora sistemas que LCH ya convirtió en software real.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto mb-7" role="tablist" aria-label="Demos de productos LCH">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-2xl bg-white/[0.045] border border-white/10 backdrop-blur-xl">
            {products.map((product) => {
              const Icon = product.icon;
              const selected = product.id === active.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="product-demo-stage"
                  onClick={() => setActiveId(product.id)}
                  className={`relative overflow-hidden flex items-center gap-3 text-left px-4 py-4 rounded-xl transition-colors duration-300 ${
                    selected ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {selected && (
                    <motion.div
                      layoutId="active-product-tab"
                      className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    />
                  )}
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${selected ? 'bg-accent border-sky-300/25' : 'bg-white/[0.04] border-white/10'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base truncate">{product.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.publicAvailable ? 'bg-emerald-400' : 'bg-amber-300'}`} aria-hidden="true" />
                    </div>
                    <div className="text-[10px] sm:text-xs mt-0.5 text-white/40 truncate">{product.kicker}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.id}-identity`}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-[1240px] mx-auto mb-7 grid lg:grid-cols-[1.45fr_0.55fr] gap-4 rounded-[22px] border border-white/10 bg-white/[0.045] p-5 sm:p-6 lg:p-7 backdrop-blur-xl"
          >
            <div>
              <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-sky-300">¿Qué es?</div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{active.name}</h3>
                <span className="text-sm sm:text-base font-semibold text-sky-200">{active.kicker}</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-white/62">{active.whatIsIt}</p>
            </div>

            <div className="lg:border-l lg:border-white/10 lg:pl-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">Tiene sentido para</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {active.idealFor.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] text-white/60">{item}</span>
                ))}
              </div>
              <div className={`mt-4 inline-flex items-center gap-2 text-[11px] font-medium ${active.publicAvailable ? 'text-emerald-300' : 'text-amber-200'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${active.publicAvailable ? 'bg-emerald-400' : 'bg-amber-300'}`} />
                {active.availabilityLabel}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          layout
          id="product-demo-stage"
          role="tabpanel"
          className="relative max-w-[1240px] mx-auto"
        >
          <div className="absolute -inset-5 sm:-inset-8 bg-gradient-to-b from-accent/10 to-transparent blur-3xl rounded-[40px] pointer-events-none" />
          <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] border border-white/15 bg-[#11102d] shadow-[0_45px_130px_rgba(0,0,0,0.55)]">
            <div className="h-13 sm:h-14 flex items-center gap-3 px-4 sm:px-5 border-b border-white/10 bg-[#0d0c27]/95">
              <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff655f]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5be4f]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#46c95b]" />
              </div>
              <div className="min-w-0 flex-1 max-w-xl mx-auto rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-[10px] sm:text-xs text-white/45 font-mono truncate text-center">
                {active.displayUrl}
              </div>
              {active.publicAvailable ? (
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 shrink-0 rounded-lg inline-flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={`Abrir ${active.name} en una pestaña nueva`}
                >
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <span
                  className="w-8 h-8 shrink-0 rounded-lg inline-flex items-center justify-center text-amber-200/65 bg-amber-300/[0.06]"
                  aria-label={`${active.name}: demo pública temporalmente indisponible`}
                  title="Demo pública temporalmente indisponible"
                >
                  <ArrowUpRight size={16} />
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.992, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.994, y: -5 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="relative h-[600px] sm:h-[680px] lg:h-[720px] bg-white"
              >
                {active.embed ? (
                  <iframe
                    src={active.url}
                    title={`${active.name} — demo interactiva`}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="absolute inset-0 w-full h-full border-0 bg-white"
                  />
                ) : (
                  <IdoPreview />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.id}-meta`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1240px] mx-auto mt-7 grid md:grid-cols-[1fr_auto] gap-6 items-start"
          >
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">{active.kicker}</span>
                <span className="text-white/20">/</span>
                <span className="text-xs text-white/40">{active.stat} · {active.statLabel}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{active.label}</h3>
              <p className="mt-3 text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl">{active.description}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {active.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-white/55 border border-white/10 bg-white/[0.035] rounded-full px-3 py-1.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {active.publicAvailable ? (
              <a
                href={active.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-3 bg-white text-primary px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-sky-100 transition-colors"
              >
                Explorar {active.name}
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <div className="inline-flex items-center justify-center gap-3 border border-amber-200/15 bg-amber-300/[0.06] text-amber-100 px-5 py-3.5 rounded-xl font-semibold text-sm cursor-not-allowed">
                Demo pública en mantenimiento
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="max-w-[1240px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[10px] sm:text-xs text-white/30 font-mono tracking-wide uppercase">
          <span>Built by LCH Technologies · systems, not slides</span>
          <span>Product Lab / 03 product references</span>
        </div>
      </div>
    </section>
  );
};
