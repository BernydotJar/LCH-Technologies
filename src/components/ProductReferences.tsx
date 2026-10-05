import { useMemo, useState } from 'react';
import { ArrowUpRight, BookOpenCheck, Building2, Scale, ShieldCheck } from 'lucide-react';

type ProductReference = {
  id: 'ido' | 'luma' | 'legal';
  name: string;
  label: string;
  description: string;
  url: string;
  displayUrl: string;
  tags: string[];
  embed: boolean;
  available: boolean;
  status: string;
  icon: typeof Building2;
};

const products: ProductReference[] = [
  {
    id: 'ido',
    name: 'I-DO',
    label: 'AI-native business operating system',
    description:
      'Plataforma ERP/SaaS multi-tenant para operar, integrar y evolucionar procesos de negocio con un núcleo financiero gobernado y arquitectura por servicios.',
    url: 'https://ido.textilesdemedellin.com/w/colombia/inicio',
    displayUrl: 'ido.textilesdemedellin.com/w/colombia/inicio',
    tags: ['ERP', 'Multi-tenant', 'Colombia + Guatemala'],
    embed: false,
    available: true,
    status: 'Demo en operación',
    icon: Building2,
  },
  {
    id: 'luma',
    name: 'LUMA',
    label: 'Learning intelligence',
    description:
      'Experiencia de aprendizaje centrada en la persona, con un Learning Twin explicable que usa metas, evidencia, confianza y progreso para decidir la siguiente mejor acción.',
    url: 'https://luma--luma-learning-intelligence.us-central1.hosted.app/onboarding',
    displayUrl: 'luma--luma-learning-intelligence.us-central1.hosted.app/onboarding',
    tags: ['Learning Twin', 'Evidence', 'Adaptive learning'],
    embed: true,
    available: true,
    status: 'Demo interactiva',
    icon: BookOpenCheck,
  },
  {
    id: 'legal',
    name: 'Evidencia Jurídica',
    label: 'Evidence-first legal RAG',
    description:
      'Sistema RAG orientado a evidencia para consultar normativa y procedimientos con trazabilidad, citas, clasificación de fuentes y límites explícitos de confianza.',
    url: 'https://evidencia-juridica.textilesdemedellin.com',
    displayUrl: 'evidencia-juridica.textilesdemedellin.com',
    tags: ['RAG', 'Legal AI', 'Citations'],
    embed: false,
    available: false,
    status: 'Caso de referencia',
    icon: Scale,
  },
];

export const ProductReferences = () => {
  const [activeId, setActiveId] = useState<ProductReference['id']>('luma');
  const active = useMemo(
    () => products.find((product) => product.id === activeId) ?? products[1],
    [activeId],
  );

  return (
    <section id="productos-reales" className="bg-[#F6F7F9] py-28 sm:py-32 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs mb-5 block">
            Productos reales
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary mb-6">
            Tecnología que se puede explorar.
          </h2>
          <p className="text-lg sm:text-xl text-secondary leading-relaxed">
            Una muestra de sistemas construidos por LCH para operaciones, aprendizaje y conocimiento especializado.
            Selecciona un producto para conocer la experiencia y abrir su entorno de referencia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-4 space-y-3" role="tablist" aria-label="Productos LCH">
            {products.map((product) => {
              const Icon = product.icon;
              const isActive = active.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="product-reference-panel"
                  onClick={() => setActiveId(product.id)}
                  className={`w-full text-left p-5 sm:p-6 border transition-all duration-300 rounded-sm ${
                    isActive
                      ? 'bg-white border-primary shadow-[0_18px_50px_rgba(12,10,80,0.10)]'
                      : 'bg-transparent border-neutral-200 hover:bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-primary text-white' : 'bg-white text-primary border border-neutral-200'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-primary">{product.name}</h3>
                        {product.embed && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-accent mb-2">{product.label}</p>
                      <p className="text-sm leading-relaxed text-secondary">{product.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            <div
              id="product-reference-panel"
              role="tabpanel"
              className="bg-white border border-neutral-200 rounded-sm shadow-[0_24px_70px_rgba(12,10,80,0.10)] overflow-hidden"
            >
              <div className="h-12 px-4 sm:px-5 border-b border-neutral-200 bg-[#FBFBFC] flex items-center gap-3">
                <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                </div>
                <div className="min-w-0 flex-1 bg-white border border-neutral-200 rounded-sm px-3 py-1.5 text-[11px] sm:text-xs text-neutral-600 truncate font-mono">
                  {active.displayUrl}
                </div>
                {active.available ? (
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir ${active.name} en una pestaña nueva`}
                    className="w-8 h-8 inline-flex items-center justify-center text-primary hover:text-accent transition-colors"
                  >
                    <ArrowUpRight size={17} />
                  </a>
                ) : (
                  <span
                    className="w-8 h-8 inline-flex items-center justify-center text-neutral-400"
                    aria-label="Referencia de producto"
                  >
                    <ShieldCheck size={16} />
                  </span>
                )}
              </div>

              {active.embed ? (
                <div className="relative bg-white h-[560px] sm:h-[640px]">
                  <iframe
                    key={active.url}
                    src={active.url}
                    title={`${active.name} — demo interactiva`}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="min-h-[500px] sm:min-h-[560px] bg-primary text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-neutral-300 mb-8">
                      <ShieldCheck size={15} className="text-accent" />
                      {active.status}
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{active.name}</h3>
                    <p className="text-xl sm:text-2xl text-neutral-300 font-medium mb-8">{active.label}</p>
                    <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl">
                      {active.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-8">
                      {active.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 text-xs font-medium border border-white/15 bg-white/5 text-neutral-300 rounded-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                      Vista segura de referencia. La experiencia completa se abre en su entorno dedicado.
                    </p>
                    {active.available ? (
                      <a
                        href={active.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white text-primary px-5 py-3 rounded-sm font-semibold text-sm hover:bg-neutral-100 transition-colors"
                      >
                        Abrir {active.name}
                        <ArrowUpRight size={16} />
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 text-neutral-300 px-5 py-3 rounded-sm font-semibold text-sm">
                        Demo pública en restauración
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
              <span>Referencia de producto · entorno separado de la website corporativa</span>
              <span className="font-mono">LCH / PRODUCT SYSTEMS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
