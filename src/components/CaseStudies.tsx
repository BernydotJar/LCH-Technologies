import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  FileCheck2,
  GitBranch,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type CaseStudy = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  maturity: string;
  recognition: string;
  description: string;
  flow: string[];
  tags: string[];
  icon: typeof UsersRound;
  span: string;
  tone: 'light' | 'dark' | 'blue';
};

const cases: CaseStudy[] = [
  {
    id: 'meridian',
    number: '01',
    title: 'Meridian',
    eyebrow: 'AI Recruiting Operations',
    maturity: 'AI product demo',
    recognition: 'CVs llegan por varios canales, el screening consume horas y el seguimiento depende de hojas, correo y memoria.',
    description: 'Un flujo de recruiting asistido por IA que convierte intake, screening, evidencia de compatibilidad, revisión humana y reporting en una sola experiencia operativa.',
    flow: ['Candidate intake', 'AI screening', 'Fit evidence', 'Recruiter decision', 'Follow-up'],
    tags: ['Talent Acquisition', 'Human-in-the-loop', 'Recruiting Analytics'],
    icon: UsersRound,
    span: 'lg:col-span-7',
    tone: 'dark',
  },
  {
    id: 'financial-automation',
    number: '02',
    title: 'Financial Automation',
    eyebrow: 'Accounting & Finance Operations',
    maturity: 'Production workflows',
    recognition: 'El cierre mensual depende de archivos, reglas contables, validaciones repetitivas y excepciones que pocas personas saben resolver.',
    description: 'Motores financieros en Python para procesar datasets de alto volumen, aplicar reglas parametrizables y producir outputs contables trazables bajo ventanas estrictas de cierre.',
    flow: ['XLSX / FTP / SFTP', 'Validation', 'Accounting rules', 'Exceptions', 'Outputs'],
    tags: ['Python', 'FastAPI', 'Accounting', 'Power Automate'],
    icon: CircleDollarSign,
    span: 'lg:col-span-5',
    tone: 'light',
  },
  {
    id: 'argos',
    number: '03',
    title: 'Argos · Dotación',
    eyebrow: 'Operations & Logistics',
    maturity: 'Enterprise MVP',
    recognition: 'Pedidos, inventario, aprobaciones, bodegas y ERP viven en sistemas distintos y el estado real depende de perseguir personas.',
    description: 'Portal corporativo para coordinar pedidos, inventario, calidad, mantenimiento y aprobaciones con integración hacia SAP y automatización de flujos operativos.',
    flow: ['Pedido', 'Aprobación', 'Inventario', 'SAP', 'Despacho'],
    tags: ['Next.js', '.NET API', 'Azure SQL', 'Power Automate'],
    icon: PackageCheck,
    span: 'lg:col-span-5',
    tone: 'light',
  },
  {
    id: 'rice',
    number: '04',
    title: 'Rice Command Center',
    eyebrow: 'Executive Operations',
    maturity: 'Enterprise pilot',
    recognition: 'La preparación ejecutiva exige saltar entre correo, calendario, documentos y seguimiento para reconstruir contexto antes de cada reunión.',
    description: 'Asistente ejecutivo multi-surface con briefs, meeting prep, attention queue, triage para EA, Google Workspace y acciones controladas con trazabilidad.',
    flow: ['Email + Calendar', 'Context', 'Brief', 'Meeting prep', 'EA triage'],
    tags: ['Executive AI', 'Google Workspace', 'Auditability'],
    icon: CalendarCheck2,
    span: 'lg:col-span-7',
    tone: 'blue',
  },
  {
    id: 'data-modernization',
    number: '05',
    title: 'Data & Workflow Modernization',
    eyebrow: 'Legacy → Governed Operations',
    maturity: 'Migration portfolio',
    recognition: 'KPIs y procesos críticos dependen de herramientas legacy, licencias costosas, reconciliaciones manuales y conocimiento concentrado en pocas personas.',
    description: 'Replataformamos pipelines y operaciones desde Pentaho, Alteryx y Autotask hacia Fabric, Power BI, Power Automate y Jira, preservando reglas mientras simplificamos la operación.',
    flow: ['Legacy tools', 'Process mapping', 'Migration', 'Governed data', 'Self-service insights'],
    tags: ['Fabric', 'Power BI', 'Power Automate', 'Jira'],
    icon: GitBranch,
    span: 'lg:col-span-12',
    tone: 'dark',
  },
];

const toneClasses = {
  light: {
    shell: 'bg-white text-primary border-primary/10',
    subtle: 'text-secondary/70',
    border: 'border-primary/10',
    pill: 'border-primary/10 bg-primary/[0.035] text-secondary',
    badge: 'bg-primary/[0.05] text-primary border-primary/10',
    icon: 'bg-primary/[0.055] text-primary border-primary/10',
  },
  dark: {
    shell: 'bg-[#0d0c2b] text-white border-white/10',
    subtle: 'text-white/58',
    border: 'border-white/10',
    pill: 'border-white/10 bg-white/[0.045] text-white/65',
    badge: 'bg-white/[0.07] text-sky-200 border-white/10',
    icon: 'bg-white/[0.07] text-sky-200 border-white/10',
  },
  blue: {
    shell: 'bg-primary text-white border-white/10',
    subtle: 'text-white/60',
    border: 'border-white/10',
    pill: 'border-white/10 bg-white/[0.055] text-white/68',
    badge: 'bg-accent/15 text-sky-200 border-sky-300/15',
    icon: 'bg-accent/15 text-sky-200 border-sky-300/15',
  },
};

const CaseCard = ({ item, index }: { item: CaseStudy; index: number }) => {
  const reduceMotion = useReducedMotion();
  const Icon = item.icon;
  const tone = toneClasses[item.tone];

  return (
    <motion.article
      id={`caso-${item.id}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.045, ease: 'easeOut' }}
      className={`${item.span} ${tone.shell} group relative overflow-hidden rounded-[28px] border p-6 sm:p-8 lg:p-9 shadow-[0_22px_70px_rgba(17,24,39,0.055)]`}
    >
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent/10 blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${tone.icon}`}>
              <Icon size={20} strokeWidth={1.6} />
            </span>
            <div>
              <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${tone.subtle}`}>{item.number} / 05</div>
              <div className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.tone === 'light' ? 'text-accent' : 'text-sky-300'}`}>{item.eyebrow}</div>
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tone.badge}`}>
            {item.maturity}
          </span>
        </div>

        <h3 className="mt-8 text-3xl sm:text-4xl font-bold tracking-[-0.03em]">{item.title}</h3>

        <div className={`mt-6 border-l-2 pl-4 ${item.tone === 'light' ? 'border-accent/50' : 'border-sky-300/35'}`}>
          <div className={`text-[10px] font-mono uppercase tracking-[0.18em] ${tone.subtle}`}>¿Te suena?</div>
          <p className={`mt-2 text-sm sm:text-[15px] leading-relaxed ${tone.subtle}`}>{item.recognition}</p>
        </div>

        <p className={`mt-6 text-sm sm:text-base leading-relaxed ${tone.subtle}`}>{item.description}</p>

        <div className={`mt-7 border-y py-4 ${tone.border}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {item.flow.map((step, flowIndex) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${tone.pill}`}>{step}</span>
                {flowIndex < item.flow.length - 1 && <ArrowRight size={12} className={tone.subtle} aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className={`rounded-full border px-3 py-1 text-[10px] ${tone.pill}`}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

const proofSignals = [
  { icon: BriefcaseBusiness, text: 'Finanzas, RR. HH., operaciones y dirección ejecutiva' },
  { icon: Boxes, text: 'Procesos que cruzan múltiples sistemas y equipos' },
  { icon: ShieldCheck, text: 'Control humano, trazabilidad y gobernanza desde diseño' },
  { icon: BarChart3, text: 'Automatización conectada con KPIs y resultados operativos' },
];

export const CaseStudies = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="casos-resueltos" className="relative overflow-hidden bg-[#f6f7fb] py-24 sm:py-32 border-b border-neutral-200">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12 sm:mb-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-8"
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">
              <Sparkles size={13} />
              Casos seleccionados
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-[-0.035em] leading-[0.98]">
              Problemas que ya hemos resuelto.
            </h2>
            <p className="mt-6 max-w-3xl text-lg sm:text-xl text-secondary/75 leading-relaxed">
              Los productos muestran lo que puedes tocar. Estos casos muestran algo distinto: problemas operativos parecidos a los que probablemente ya existen dentro de tu organización.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-4 lg:pl-4"
          >
            <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-secondary/55">La pregunta útil</div>
              <p className="mt-2 text-lg font-bold text-primary leading-snug">¿Se parece alguno de estos flujos a cómo trabaja tu equipo hoy?</p>
              <a href="#contacto" className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary transition-colors">
                Conversemos sobre ese proceso
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 sm:gap-6">
          {cases.map((item, index) => <CaseCard key={item.id} item={item} index={index} />)}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {proofSignals.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white/75 px-4 py-4 text-sm text-secondary/75">
              <Icon size={17} className="mt-0.5 shrink-0 text-accent" strokeWidth={1.7} />
              <span className="leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-primary/10 pt-7">
          <div className="flex items-center gap-2 text-xs text-secondary/55">
            <FileCheck2 size={15} className="text-accent" />
            Casos con alcance y madurez explícitos; el objetivo es mostrar patrones reales, no vender promesas genéricas.
          </div>
          <a href="#contacto" className="group inline-flex items-center gap-2 font-semibold text-sm text-primary hover:text-accent transition-colors">
            Tengo un proceso parecido
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
