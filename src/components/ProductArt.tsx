import { ArrowRight, BookOpenCheck, CheckCheck, CircleCheck, Code2, FileCheck2, GitBranch, Layers3, LockKeyhole, Scale, ShieldCheck, Users, Workflow } from 'lucide-react';
import { useLocale } from '../i18n/LocaleProvider';

export type ProductVisualId = 'ido' | 'luma' | 'meridian' | 'bpca' | 'electoral' | 'legal';

const tones: Record<ProductVisualId, string> = {
  ido: 'from-[#091b36] via-[#10335a] to-[#091528]',
  luma: 'from-[#291634] via-[#573156] to-[#231830]',
  meridian: 'from-[#171636] via-[#40346f] to-[#1a193b]',
  bpca: 'from-[#071b29] via-[#12394a] to-[#081923]',
  electoral: 'from-[#102423] via-[#1f423f] to-[#0d2024]',
  legal: 'from-[#17243b] via-[#304663] to-[#142039]',
};

const panels: Record<ProductVisualId, string> = {
  ido: 'border-cyan-200/20 bg-cyan-50/[0.08]',
  luma: 'border-rose-200/20 bg-rose-50/[0.08]',
  meridian: 'border-violet-200/20 bg-violet-50/[0.08]',
  bpca: 'border-teal-200/20 bg-teal-50/[0.07]',
  electoral: 'border-emerald-200/20 bg-emerald-50/[0.07]',
  legal: 'border-sky-200/20 bg-sky-50/[0.07]',
};

/** Editorial product artwork. Never a screenshot, a real customer dashboard or live metrics. */
export function ProductArt({ id, compact = false }: { id: ProductVisualId; compact?: boolean }) {
  const { t } = useLocale();
  const unit = compact ? 'text-[10px]' : 'text-xs sm:text-sm';
  return (
    <div
      aria-hidden="true"
      className={`relative isolate h-full min-h-[180px] w-full overflow-hidden bg-gradient-to-br text-white ${tones[id]}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-[70px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-32 h-72 w-72 rounded-full bg-cyan-300/10 blur-[80px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className={`relative flex h-full flex-col justify-center p-5 ${compact ? 'sm:p-6' : 'sm:p-10 lg:p-14'}`}>
        {id === 'meridian' && (
          <div className="mx-auto w-full max-w-[520px] space-y-3">
            <div className="flex items-center justify-between gap-2 text-violet-100/75">
              <span className={`flex items-center gap-2 font-semibold ${unit}`}><Users size={15} /> Talent workspace</span>
              <span className="rounded-full border border-white/20 px-2 py-1 text-[9px] uppercase tracking-widest">Human-led</span>
            </div>
            <div className={`rounded-2xl border p-3 shadow-2xl backdrop-blur-md ${panels[id]} ${compact ? '' : 'sm:p-5'}`}>
              <div className="mb-3 flex items-center justify-between"><span className={`font-semibold ${unit}`}>{t('Pipeline de talento')}</span><GitBranch size={15} className="text-violet-200" /></div>
              <div className="grid grid-cols-3 gap-2">
                {['Intake', 'Review', 'Decision'].map((stage, i) => (
                  <div key={stage} className="rounded-lg border border-white/10 bg-white/[0.08] p-2">
                    <div className={`mb-2 h-1.5 rounded-full ${i === 2 ? 'bg-rose-200/70' : 'bg-violet-300/70'}`} />
                    <div className="text-[9px] font-semibold sm:text-[11px]">{stage}</div>
                    <div className="mt-2 h-5 rounded bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[9px] text-white/65 sm:text-[11px]"><ShieldCheck size={13} /> {t('La IA aporta evidencia. La persona decide.')}</div>
            </div>
          </div>
        )}
        {id === 'luma' && (
          <div className="mx-auto flex w-full max-w-[500px] items-center justify-between gap-3">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center sm:h-44 sm:w-44">
              <div className="absolute inset-0 rounded-full border border-rose-100/30" />
              <div className="absolute inset-3 rounded-full border border-dashed border-pink-200/30" />
              <div className="absolute inset-7 rounded-full bg-gradient-to-br from-fuchsia-200/40 to-pink-300/10 shadow-[0_0_60px_rgba(244,114,182,0.25)]" />
              <BookOpenCheck className="relative text-pink-50" size={compact ? 31 : 44} strokeWidth={1.2} />
              <div className="absolute right-0 top-1 h-3 w-3 rounded-full border-2 border-[#b58cab] bg-pink-200" />
              <div className="absolute bottom-3 left-1 h-2.5 w-2.5 rounded-full bg-violet-200" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className={`font-bold tracking-tight ${compact ? 'text-sm' : 'text-xl sm:text-2xl'}`}>Learning Twin</div>
              {['Objetivos', 'Evidencia', 'Siguiente acción'].map((label, index) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-2.5 py-2 text-[9px] sm:text-xs">
                  <CircleCheck size={12} className="shrink-0 text-rose-200" />
                  <span className="truncate">{t(label)}</span>
                  <span className="ml-auto h-1 w-5 rounded bg-pink-200/60" style={{ opacity: 1 - index * 0.2 }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {id === 'bpca' && (
          <div className="mx-auto w-full max-w-[535px] space-y-3">
            <div className="flex items-center justify-between gap-2 text-teal-100/80"><span className={`flex items-center gap-2 font-semibold ${unit}`}><Code2 size={16}/> Coded Automation</span><span className="text-[10px] font-mono">BPCA / CLI</span></div>
            <div className={`overflow-hidden rounded-xl border shadow-2xl ${panels[id]}`}>
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-300/80" /><span className="h-1.5 w-1.5 rounded-full bg-amber-200/80" /><span className="h-1.5 w-1.5 rounded-full bg-teal-200/80" />
                <span className="ml-auto text-[9px] text-white/50">automation.spec</span>
              </div>
              <div className={`space-y-1.5 p-3 font-mono ${compact ? 'text-[9px]' : 'text-xs sm:p-5'}`}>
                <div><span className="text-sky-300">foundation</span><span className="text-white/60">: governed</span></div>
                <div><span className="text-teal-300">build</span><span className="text-white/75">: process + object</span></div>
                <div><span className="text-violet-300">verify</span><span className="text-white/75">: contracts + evidence</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[11px] text-teal-100/80">{['Spec', 'Process', 'Object', 'Gates'].map((label,i)=><div key={label} className="flex items-center gap-1.5"><span className="rounded-md border border-teal-100/20 bg-teal-100/[0.08] px-2 py-1">{label}</span>{i!==3&&<ArrowRight size={11}/>}</div>)}</div>
          </div>
        )}
        {id === 'electoral' && (
          <div className="mx-auto w-full max-w-[540px] space-y-3">
            <div className="flex items-center justify-between gap-2 text-emerald-100/80"><span className={`flex items-center gap-2 font-semibold ${unit}`}><Layers3 size={15}/> Campaign command center</span><span className="rounded-full border border-white/20 px-2 py-1 text-[9px] tracking-widest">READ ONLY</span></div>
            <div className={`rounded-xl border p-3 shadow-2xl ${panels[id]} ${compact ? '' : 'sm:p-5'}`}>
              <div className="mb-4 flex items-center gap-2 text-[10px] text-emerald-100/85 sm:text-xs"><LockKeyhole size={14}/>{t('Autoridad humana')}<span className="ml-auto text-white/45">01 / 03</span></div>
              <div className="grid grid-cols-3 gap-2">
                {[[Users,'Equipo'],[Workflow,'War Room'],[FileCheck2,'Evidencia']].map(([Icon, label]) => {
                  const Component = Icon as typeof Users;
                  return <div key={label as string} className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] p-2.5 text-center">
                    <Component size={compact ? 17 : 22} className="text-emerald-200"/><span className="text-[9px] sm:text-[11px]">{t(label as string)}</span>
                  </div>;
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] text-white/60 sm:text-[11px]"><span>{t('Decisiones trazables')}</span><CheckCheck size={15} className="text-emerald-200"/></div>
            </div>
          </div>
        )}
        {id === 'ido' && (
          <div className="mx-auto w-full max-w-[530px] space-y-3">
            <div className="flex items-center justify-between gap-2 text-sky-100/80"><span className={`flex items-center gap-2 font-semibold ${unit}`}><Layers3 size={15}/> Business OS</span><span className="text-[9px] font-mono">OPERATIONS / FINANCE</span></div>
            <div className={`rounded-xl border p-3 shadow-2xl ${panels[id]} ${compact ? '' : 'sm:p-5'}`}>
              <div className="grid grid-cols-3 gap-2">
                {[[Layers3,'Operaciones'],[ShieldCheck,'Finanzas'],[Workflow,'Automatización']].map(([Icon,label])=>{
                  const Component=Icon as typeof Layers3;
                  return <div key={label as string} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-1 py-2 text-center"><Component className="text-cyan-200" size={compact?20:26}/><span className="text-[9px] sm:text-xs">{t(label as string)}</span></div>;
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[9px] text-white/65 sm:text-xs"><ShieldCheck size={14}/>{t('Control y trazabilidad en una sola operación')}</div>
            </div>
          </div>
        )}
        {id === 'legal' && (
          <div className="mx-auto w-full max-w-[520px] space-y-3">
            <div className="flex items-center justify-between text-sky-100/80"><span className={`flex items-center gap-2 font-semibold ${unit}`}><Scale size={15}/> Evidence-first RAG</span><span className="text-[9px] font-mono">KNOWLEDGE LAB</span></div>
            <div className={`rounded-xl border p-3 shadow-2xl ${panels[id]} ${compact ? '' : 'sm:p-5'}`}>
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  {['Fuente normativa 01','Fuente normativa 02','Fuente normativa 03'].map((label,i)=><div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.07] p-2 text-[9px] sm:text-xs"><FileCheck2 size={12} className="shrink-0 text-sky-200"/><span className="truncate">{t(label)}</span><span className="ml-auto text-white/50">{i+1}</span></div>)}
                </div>
                <ArrowRight size={15} className="mt-9 shrink-0 text-sky-200"/>
                <div className="flex w-[36%] flex-col items-center justify-center gap-3 rounded-lg border border-sky-200/25 bg-sky-200/[0.09] px-2 py-3 text-center"><Scale size={compact?23:30} className="text-sky-200"/><span className="text-[10px] sm:text-xs">{t('Respuesta verificable')}</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[9px] text-white/60 sm:text-xs"><CheckCheck size={14}/>{t('Fuentes y citas antes que confianza ciega')}</div>
            </div>
          </div>
        )}
      </div>
      <span className="absolute bottom-2 right-3 rounded-full border border-white/15 bg-black/15 px-2 py-1 text-[8px] font-semibold uppercase tracking-widest text-white/50">{t('Visualización ilustrativa')}</span>
    </div>
  );
}
