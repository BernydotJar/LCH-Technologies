import { ArrowLeft, ArrowRight, CheckCheck, CircleCheck, Compass, ExternalLink, Layers3, ShieldCheck } from 'lucide-react';
import { useLocale } from '../i18n/LocaleProvider';
import { track } from '../analytics/client';
import { ProductArt } from './ProductArt';
import { products, type ProductReference } from './ProductReferences';

export function ProductDetailPage({ product }: { product: ProductReference | null }) {
  const { t } = useLocale();

  if (!product) return (
    <main className="min-h-[62vh] bg-[#0b1130] px-5 py-28 text-center text-white">
      <h1 className="text-4xl font-bold">{t('Producto no encontrado')}</h1>
      <p className="mx-auto mt-4 max-w-lg text-white/60">{t('Visita nuestro portafolio para explorar los productos disponibles.')}</p>
      <a className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary" href="/#productos-reales"><ArrowLeft size={16} /> {t('Volver al portafolio')}</a>
    </main>
  );

  const Icon = product.icon;
  const others = products.filter((item) => item.id !== product.id).slice(0, 3);
  const linkLabel = product.actionLabel ? t(product.actionLabel) : t('Abrir experiencia');

  return (
    <main id="producto" className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#090d29] px-4 pb-20 pt-12 text-white sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
        <div className="pointer-events-none absolute -right-36 -top-24 h-[500px] w-[500px] rounded-full bg-teal-400/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-44 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl">
          <nav aria-label={t('Ruta de navegación')} className="mb-12 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            <a className="transition-colors hover:text-white" href="/#inicio">LCH Technologies</a>
            <ArrowRight size={12} />
            <a className="transition-colors hover:text-white" href="/#productos-reales">{t('Portafolio')}</a>
            <ArrowRight size={12} />
            <span aria-current="page" className="text-sky-200">{product.name}</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-sky-200/15 bg-white/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
                <Icon size={17} /> {t(product.kicker)}
              </div>
              <h1 className="mt-7 text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{product.name}</h1>
              <p className="mt-7 max-w-xl text-xl font-medium leading-snug text-white sm:text-2xl">{t(product.label)}</p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60">{t(product.description)}</p>
              <div className="mt-7 inline-flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2.5 text-xs text-sky-100/85">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${product.live ? 'bg-emerald-300' : product.publicAvailable ? 'bg-sky-300' : 'bg-amber-300'}`} />
                {t(product.availabilityLabel)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {product.publicAvailable ? (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
                    onClick={() => track('product_demo_select', { product: product.id })}
                  >
                    {linkLabel} <ExternalLink size={16} />
                  </a>
                ) : (
                  <a href="/#contacto" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-sky-100">
                    {t('Solicitar una demostración')} <ArrowRight size={16} />
                  </a>
                )}
                <a href="/#contacto" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.11]">
                  {t('Hablar con LCH')} <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.06] p-2 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:p-3">
              <div className="flex h-9 items-center gap-2 rounded-t-[16px] bg-[#11192d] px-4">
                <div className="flex gap-1.5" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-rose-300/80"/><span className="h-2 w-2 rounded-full bg-amber-200/80"/><span className="h-2 w-2 rounded-full bg-teal-300/80"/></div>
                <span className="mx-auto max-w-[62%] truncate text-center font-mono text-[10px] text-white/45">{product.displayUrl}</span>
              </div>
              <div className="h-[275px] overflow-hidden rounded-b-[16px] sm:h-[390px] lg:h-[440px]"><ProductArt id={product.id}/></div>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-light-surface bg-[#f7f9fc] px-4 py-20 text-primary sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-accent">{t('Dentro del producto')}</div>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl">{t('Diseñado para problemas reales.')}</h2>
            <p className="mt-6 text-base leading-relaxed text-secondary sm:text-lg">{t(product.whatIsIt)}</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <article className="theme-card-light rounded-3xl border border-primary/10 bg-white p-7 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-accent"><Compass size={20}/></span>
              <h3 className="mt-6 text-xl font-bold">{t('Para quién está pensado')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('Contextos donde esta solución puede aportar valor.')}</p>
              <ul className="mt-6 space-y-3">{product.idealFor.map((item)=><li key={item} className="flex items-start gap-2 text-sm"><CircleCheck size={16} className="mt-0.5 shrink-0 text-accent"/>{t(item)}</li>)}</ul>
            </article>
            <article className="theme-card-light rounded-3xl border border-primary/10 bg-white p-7 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-accent"><Layers3 size={20}/></span>
              <h3 className="mt-6 text-xl font-bold">{t('Su enfoque de ingeniería')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('Capacidades y principios que definen la experiencia.')}</p>
              <div className="mt-6 flex flex-wrap gap-2">{product.tags.map((tag)=><span key={tag} className="rounded-full border border-primary/10 bg-primary/[0.04] px-3 py-2 text-xs font-semibold text-primary">{t(tag)}</span>)}</div>
            </article>
            <article className="theme-card-light rounded-3xl border border-primary/10 bg-white p-7 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-accent"><ShieldCheck size={20}/></span>
              <h3 className="mt-6 text-xl font-bold">{t('Disponibilidad y confianza')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('Distinguimos una demostración, un preview y una solución productiva.')}</p>
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-primary/10 bg-primary/[0.035] p-4 text-sm font-semibold"><CheckCheck size={18} className="mt-0.5 shrink-0 text-accent"/>{t(product.availabilityLabel)}</div>
            </article>
          </div>
        </div>
      </section>

      <section className="site-product-lab bg-[#0a1028] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">{t('Explora más')}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t('Más productos de LCH')}</h2>
            </div>
            <a href="/#productos-reales" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">{t('Ver todo el portafolio')} <ArrowRight size={16}/></a>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {others.map((item)=><a key={item.id} href={`/productos/${item.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] transition-all hover:-translate-y-1 hover:border-sky-200/35">
              <div className="h-36"><ProductArt id={item.id} compact/></div>
              <div className="flex items-center justify-between gap-3 p-5"><div><p className="text-[10px] uppercase tracking-widest text-sky-200">{t(item.kicker)}</p><h3 className="mt-1 text-xl font-bold">{item.name}</h3></div><ArrowRight size={18} className="shrink-0 text-sky-200 transition-transform group-hover:translate-x-1"/></div>
            </a>)}
          </div>
        </div>
      </section>
    </main>
  );
}
