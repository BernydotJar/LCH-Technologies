import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Cloud,
  Code2,
  FileScan,
  Headphones,
  Landmark,
  PackageCheck,
  ReceiptText,
  Settings,
  ShoppingCart,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';

const capabilities = [
  {
    id: '01',
    title: 'Inteligencia Artificial',
    description: 'Aplicamos IA sobre conocimiento, documentos, datos y procesos reales de la organización. Implementamos modelos estructurados que garantizan trazabilidad y evidencia en cada respuesta, eliminando la opacidad.',
    icon: <BrainCircuit size={48} strokeWidth={1} />,
    color: 'bg-primary text-white',
    accent: 'text-accent'
  },
  {
    id: '02',
    title: 'Automatización',
    description: 'Diseñamos automatizaciones y agentes operativos para reducir trabajo manual, conectar sistemas y aumentar consistencia. Operaciones continuas con supervisión humana estructurada.',
    icon: <Settings size={48} strokeWidth={1} />,
    color: 'bg-neutral-100 text-primary',
    accent: 'text-primary'
  },
  {
    id: '03',
    title: 'Software Empresarial',
    description: 'Construimos plataformas y aplicaciones alineadas con procesos críticos, integraciones y necesidades específicas del negocio. Arquitectura robusta, escalable y mantenible.',
    icon: <Code2 size={48} strokeWidth={1} />,
    color: 'bg-white text-primary',
    accent: 'text-accent'
  },
  {
    id: '04',
    title: 'Cloud Solutions',
    description: 'Diseñamos arquitecturas cloud escalables, seguras y observables para modernizar aplicaciones y operaciones. Infraestructura preparada para el futuro.',
    icon: <Cloud size={48} strokeWidth={1} />,
    color: 'bg-secondary text-white',
    accent: 'text-neutral-300'
  }
];

type AutomationExample = {
  title: string;
  flow: string;
  icon: typeof ReceiptText;
};

const automationExamples: AutomationExample[] = [
  {
    title: 'Cuentas por pagar',
    flow: 'factura → validación → aprobación → ERP',
    icon: ReceiptText,
  },
  {
    title: 'Órdenes de compra',
    flow: 'solicitud → aprobación → PO → seguimiento',
    icon: ShoppingCart,
  },
  {
    title: 'Remesas / remittances',
    flow: 'archivo o correo → extracción → aplicación de pagos',
    icon: WalletCards,
  },
  {
    title: 'Conciliación bancaria',
    flow: 'extractos + ERP → matching → excepciones',
    icon: Landmark,
  },
  {
    title: 'Gestión de nómina',
    flow: 'novedades → validaciones → carga → evidencia',
    icon: UsersRound,
  },
  {
    title: 'Onboarding',
    flow: 'alta → documentos → accesos → tareas',
    icon: UserPlus,
  },
  {
    title: 'Atención y soporte',
    flow: 'ticket → clasificación → respuesta → escalamiento',
    icon: Headphones,
  },
  {
    title: 'Pedidos y logística · SOLPED',
    flow: 'solicitud → compra → inventario → despacho',
    icon: PackageCheck,
  },
  {
    title: 'Reportes y análisis',
    flow: 'fuentes → consolidación → KPI → distribución',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Documentos y OCR',
    flow: 'correo o PDF → extracción → validación → sistema',
    icon: FileScan,
  },
];

const AutomationChip = ({ item }: { item: AutomationExample }) => {
  const Icon = item.icon;

  return (
    <div className="group shrink-0 min-w-[280px] sm:min-w-[330px] rounded-2xl border border-primary/10 bg-white/80 px-4 py-3.5 shadow-[0_8px_30px_rgba(17,24,39,0.05)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_16px_40px_rgba(17,24,39,0.08)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.055] text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
          <Icon size={17} strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-primary">{item.title}</div>
          <div className="mt-1 text-[12px] leading-relaxed text-secondary/75">{item.flow}</div>
        </div>
      </div>
    </div>
  );
};

const AutomationRecognitionStrip = () => {
  const reduceMotion = useReducedMotion();
  const firstRow = automationExamples.slice(0, 5);
  const secondRow = automationExamples.slice(5);

  const row = (items: AutomationExample[], reverse = false) => {
    if (reduceMotion) {
      return (
        <div className="flex flex-wrap gap-3">
          {items.map((item) => <AutomationChip key={item.title} item={item} />)}
        </div>
      );
    }

    const repeated = [...items, ...items];
    return (
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <motion.div
          aria-hidden="true"
          className="flex w-max gap-3 py-1"
          animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{ duration: reverse ? 34 : 38, ease: 'linear', repeat: Infinity }}
        >
          {repeated.map((item, index) => (
            <AutomationChip key={`${item.title}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
      className="mt-12 sm:mt-16 lg:col-span-12 rounded-[28px] border border-primary/10 bg-white/55 py-6 sm:py-8 overflow-hidden shadow-[0_24px_70px_rgba(17,24,39,0.06)]"
    >
      <div className="px-5 sm:px-7 lg:px-8 mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-3">¿Tu equipo todavía hace esto a mano?</div>
          <h5 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Probablemente ya tienes procesos listos para automatizar.</h5>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-secondary/80">
            Cuando hay volumen, reglas, aprobaciones, SLAs, excepciones o varios sistemas involucrados, suele existir una oportunidad clara para automatizar con control y trazabilidad.
          </p>
        </div>
        <a
          href="#contacto"
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
        >
          Cuéntanos cuál haces hoy
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {!reduceMotion && (
        <ul className="sr-only">
          {automationExamples.map((item) => (
            <li key={item.title}>{item.title}: {item.flow}</li>
          ))}
        </ul>
      )}

      <div className="space-y-3">
        {row(firstRow)}
        {row(secondRow, true)}
      </div>

      <div className="px-5 sm:px-7 lg:px-8 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] sm:text-xs text-secondary/55">
        <span>Finanzas</span>
        <span>Compras</span>
        <span>RR. HH.</span>
        <span>Servicio</span>
        <span>Operaciones</span>
        <span>Logística</span>
        <span>Reporting</span>
      </div>
    </motion.div>
  );
};

export const Capabilities = () => {
  return (
    <section id="soluciones" className="bg-white">
      {/* Editorial Introduction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h2 className="text-accent font-semibold tracking-widest uppercase text-xs sm:text-sm mb-6">Nuestras Capacidades</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight mb-8">
            Construimos tecnología orientada a resultados operacionales.
          </h3>
          <p className="text-lg md:text-xl text-secondary leading-relaxed">
            Integramos sistemas complejos para crear ventajas competitivas medibles, pasando de la experimentación tecnológica a la implementación gobernada.
          </p>
        </div>
      </div>

      {/* Editorial Chapters */}
      <div className="border-t border-neutral-200">
        {capabilities.map((cap) => (
          <div key={cap.id} className={`${cap.color} border-b border-neutral-200/20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                {/* ID & Icon */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <span className={`text-sm font-mono tracking-widest ${cap.accent}`}>{cap.id} / 04</span>
                  <div className={cap.accent}>{cap.icon}</div>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="lg:col-span-8 lg:col-start-5"
                >
                  <h4 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">{cap.title}</h4>
                  <p className="text-xl leading-relaxed max-w-2xl opacity-90">{cap.description}</p>
                </motion.div>

                {cap.id === '02' && <AutomationRecognitionStrip />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
