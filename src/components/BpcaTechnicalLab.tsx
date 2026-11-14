import { useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, Check, CheckCircle2, ClipboardCheck, Code2,
  Copy, FileCode2, FileJson2, GitBranch, LockKeyhole, ShieldAlert, ShieldCheck,
  TerminalSquare, Workflow, XCircle,
} from 'lucide-react';
import { bpcaLabCommands, bpcaLabRecord, bpcaPublicEvidenceJson } from '../bpca/demoContract';
import { useLocale } from '../i18n/LocaleProvider';

type LabTab = 'contract' | 'generate' | 'verify' | 'studio';
type CodeSample = 'build' | 'actionAbi' | 'dependencies';

const labSteps: Array<{ id: LabTab; number: string; label: string }> = [
  { id: 'contract', number: '01', label: 'Contrato' },
  { id: 'generate', number: '02', label: 'Generación CLI' },
  { id: 'verify', number: '03', label: 'Quality gates' },
  { id: 'studio', number: '04', label: 'Studio DEV' },
];

const commandSamples: Array<{ key: CodeSample; label: string }> = [
  { key: 'build', label: 'Generar Process + Object' },
  { key: 'actionAbi', label: 'Verificar ABI de la Action' },
  { key: 'dependencies', label: 'Resolver dependencias nativas' },
];

function StatusPill({ status }: { status: 'pass' | 'blocked' | 'pending' }) {
  const { t } = useLocale();
  if (status === 'pass') return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-emerald-200"><CheckCircle2 size={13} /> PASS STATIC</span>;
  if (status === 'blocked') return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-amber-200"><ShieldAlert size={13} /> NO_GO</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white/65"><XCircle size={13} /> NOT_RUN</span>;
}

export function BpcaTechnicalLab() {
  const { t } = useLocale();
  const [tab, setTab] = useState<LabTab>('contract');
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  async function copyCode(key: string, value: string) {
    setCopied(null);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
    } catch {
      setCopyError(true);
    }
  }

  function downloadEvidence() {
    const blob = new Blob([bpcaPublicEvidenceJson()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lch-bpca-evidencia-estatica.json';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      id="laboratorio-bpca"
      data-testid="bpca-lab"
      aria-labelledby="bpca-lab-heading"
      className="site-product-lab scroll-mt-20 overflow-hidden bg-[#080f22] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute -left-36 top-20 h-72 w-72 rounded-full bg-teal-400/10 blur-[110px]" />
        <div className="pointer-events-none absolute -right-40 top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[110px]" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-12">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/[0.075] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
              <TerminalSquare size={15} /> {t('Laboratorio técnico BPCA')} <span className="text-white/25">/</span> STATIC CLI
            </div>
            <h2 id="bpca-lab-heading" className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {t('Del contrato al artefacto.')} <span className="text-teal-200">{t('Con evidencia.')}</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              {t('Explora un caso reproducible de Automation as Code. El CLI genera un Business Object, un Process y verifica sus firmas; mostramos también el bloqueo nativo que queda por resolver.')}
            </p>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-teal-100/75">
              {t('Evidencia capturada en un entorno local el 14/11/2026. Esta web no compila XML, no accede a credenciales y no ejecuta robots Blue Prism.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/75">Blue Prism {bpcaLabRecord.targetBuild}</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/75">Process + Object</span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-3 py-1.5 text-[11px] text-amber-100">{t('No certificado para runtime')}</span>
            </div>
          </div>

          <div aria-label={t('Flujo de ingeniería BPCA')} className="relative overflow-hidden rounded-[26px] border border-teal-200/15 bg-[#0c2030] p-5 shadow-[0_30px_110px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-100"><Code2 size={17} /> BPCA / ENGINEERING</span>
              <span className="rounded-full border border-white/15 bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-white/60">v0.1 preview</span>
            </div>
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold"><FileJson2 size={18} className="text-sky-200" /> {t('Especificación tipada')}</span><span className="font-mono text-[10px] text-white/45">JSON</span>
              </div>
              <ArrowRight className="rotate-90 text-teal-200/70" size={17} aria-hidden="true"/>
              <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-teal-200/25 bg-teal-200/[0.09] px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold"><TerminalSquare size={18} className="text-teal-200" /> bpca build-pair</span><StatusPill status="pass"/>
              </div>
              <ArrowRight className="rotate-90 text-teal-200/70" size={17} aria-hidden="true"/>
              <div className="grid w-full grid-cols-2 gap-2">
                <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.055] p-3"><FileCode2 size={17} className="mb-2 text-sky-200"/><p className="text-xs font-semibold">.bpobject</p><p className="mt-1 text-[10px] text-white/50">Business Object</p></div>
                <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.055] p-3"><Workflow size={17} className="mb-2 text-sky-200"/><p className="text-xs font-semibold">.bpprocess</p><p className="mt-1 text-[10px] text-white/50">Process</p></div>
              </div>
              <div className="mt-1 flex w-full items-center gap-2 rounded-xl border border-amber-200/20 bg-amber-100/[0.065] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
                <ShieldAlert size={16} className="shrink-0" /> {t('El gate de dependencias bloquea el GO nativo hasta verificar System.dll.')}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-14 overflow-hidden rounded-[26px] border border-white/10 bg-[#101c31]/95 shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4 sm:px-7">
            <span className="flex items-center gap-2 text-xs font-semibold text-white/75"><GitBranch size={16} className="text-teal-200"/> {t('Caso sintético')} / Normalize Text</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t('Interactivo · sin ejecución remota')}</span>
          </div>

          <div className="grid grid-cols-2 border-b border-white/10 lg:grid-cols-4" role="tablist" aria-label={t('Etapas del laboratorio')}>
            {labSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                role="tab"
                id={'bpca-tab-' + step.id}
                aria-controls="bpca-lab-panel"
                aria-selected={tab === step.id}
                data-testid={'bpca-select-' + step.id}
                onClick={() => { setTab(step.id); setCopied(null); setCopyError(false); }}
                className={(tab === step.id ? 'border-b-2 border-teal-300 bg-teal-200/[0.065] text-white' : 'border-b-2 border-transparent text-white/55 hover:bg-white/[0.045] hover:text-white') + ' flex min-h-16 items-center gap-2 px-4 py-4 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-teal-300 sm:px-7 sm:text-sm'}
              >
                <span className={tab === step.id ? 'font-mono text-teal-200' : 'font-mono text-white/30'}>{step.number}</span>
                <span>{t(step.label)}</span>
              </button>
            ))}
          </div>

          <div id="bpca-lab-panel" role="tabpanel" aria-labelledby={'bpca-tab-' + tab} className="min-h-[350px] p-5 sm:p-8">
            {tab === 'contract' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <article className="min-w-0 rounded-2xl border border-white/10 bg-[#081427] p-5 sm:p-7">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200"><FileJson2 size={17} /> {t('Contrato de entrada')}</p>
                  <h3 className="mt-4 text-2xl font-bold">BPCA_Text_Normalizer</h3>
                  <p className="mt-1 text-sm text-white/50">Action: <span className="font-semibold text-white">Normalize Text</span></p>
                  <dl className="mt-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"><dt className="text-sm text-white/55">{t('Entrada')}</dt><dd className="font-mono text-xs text-sky-100">{bpcaLabRecord.inputPort}</dd></div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"><dt className="text-sm text-white/55">{t('Salida')}</dt><dd className="font-mono text-xs text-sky-100">{bpcaLabRecord.outputPort}</dd></div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3"><dt className="text-sm text-white/55">{t('Versión objetivo')}</dt><dd className="font-mono text-xs text-sky-100">{bpcaLabRecord.targetBuild}</dd></div>
                  </dl>
                </article>
                <article className="min-w-0 rounded-2xl border border-white/10 bg-[#081427] p-5 sm:p-7">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200"><Workflow size={17}/>{t('Flujo del Process')}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Start, Normalize Text, End">
                    {['Start', 'Normalize Text', 'End'].map((stage, index) => (
                      <div key={stage} className="flex items-center gap-2">
                        <span className={(index === 1 ? 'border-teal-200/40 bg-teal-200/10 text-teal-100' : 'border-white/15 bg-white/5 text-white/75') + ' rounded-lg border px-3 py-2 font-mono text-xs'}>{stage}</span>
                        {index < 2 && <ArrowRight size={15} className="text-white/40" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">{t('Ejemplo de entrada')}</p>
                    <p className="mt-1 font-mono text-sm text-sky-100">"  hello rea  "</p>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-white/45">{t('Resultado esperado · no ejecutado')}</p>
                    <p className="mt-1 font-mono text-lg font-bold text-teal-200">{bpcaLabRecord.expectedOutputIfNativeValidated}</p>
                  </div>
                </article>
              </div>
            )}

            {tab === 'generate' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="text-xl font-bold">{t('Comandos reproducibles del CLI')}</h3><p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/55">{t('Requieren acceso autorizado al SDK BPCA y sus fixtures sintéticos. Se ejecutan localmente, no desde esta web.')}</p></div>
                  <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-2 font-mono text-[11px] text-teal-100">{bpcaLabRecord.targetBuild}</span>
                </div>
                {commandSamples.map((sample) => (
                  <div key={sample.key} className="overflow-hidden rounded-2xl border border-white/10 bg-[#070e1d]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
                      <p className="flex items-center gap-2 text-xs font-semibold text-white/75"><TerminalSquare size={15} className="text-teal-200" /> {t(sample.label)}</p>
                      <button type="button" onClick={() => { void copyCode(sample.key, bpcaLabCommands[sample.key]); }} data-testid={'bpca-copy-' + sample.key} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-sky-100 transition-colors hover:bg-white/[0.11] focus-visible:outline-2 focus-visible:outline-teal-300">
                        {copied === sample.key ? <Check size={14}/> : <Copy size={14}/>}
                        {t(copied === sample.key ? 'Copiado' : 'Copiar comando')}
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-emerald-100 sm:p-5 sm:text-xs"><code>{bpcaLabCommands[sample.key]}</code></pre>
                  </div>
                ))}
                <p role="status" aria-live="polite" className="text-xs text-white/60">{copyError ? t('No fue posible copiar automáticamente. Selecciona el comando para copiarlo manualmente.') : copied ? t('Comando copiado al portapapeles.') : t('Los comandos no modifican la web ni el entorno del visitante.')}</p>
              </div>
            )}

            {tab === 'verify' && (
              <div data-testid="bpca-evidence" className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#081427]">
                  <h3 className="border-b border-white/10 px-5 py-4 text-lg font-bold sm:px-6">{t('Evidencia registrada del CLI')}</h3>
                  {([
                    [t('Generación de Process y Object'), 'build', 'pass'],
                    [t('Firma de la Action y puertos'), 'actionAbi', 'pass'],
                    [t('Dependencias nativas del destino'), 'dependencies', 'blocked'],
                    [t('Importación y Check Code en Studio'), 'nativeStudioImport', 'pending'],
                    [t('Ejecución real del Process'), 'nativeExecution', 'pending'],
                  ] as const).map(([label, key, result]) => (
                    <div key={key} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 last:border-0 sm:px-6">
                      <p className="max-w-[65%] text-sm text-white/80">{label}</p>
                      <StatusPill status={result} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <article className="rounded-2xl border border-amber-300/25 bg-amber-200/[0.06] p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200"><ShieldAlert size={17}/> {t('Bloqueo que debe resolverse')}</p>
                    <p className="mt-3 break-all font-mono text-xs leading-relaxed text-amber-100">{bpcaLabRecord.gates.dependencyIssue}</p>
                    <p className="mt-4 text-sm leading-relaxed text-white/65">{t('El Process referencia System.dll, pero falta un registro del destino que permita verificar esa dependencia. No implica que la DLL esté ausente de Windows; significa que BPCA no tiene evidencia suficiente.')}</p>
                  </article>
                  <article className="min-w-0 rounded-2xl border border-white/10 bg-[#081427] p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200"><ClipboardCheck size={17}/>{t('Huella de los candidatos')}</p>
                    <p className="mt-3 text-xs text-white/50">Object SHA-256</p>
                    <p data-testid="bpca-object-sha" className="mt-1 break-all font-mono text-[11px] text-white/80">{bpcaLabRecord.outputSha256.object}</p>
                    <p className="mt-4 text-xs text-white/50">Process SHA-256</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-white/80">{bpcaLabRecord.outputSha256.process}</p>
                    <p className="mt-4 text-xs leading-relaxed text-white/45">{t('Huellas de una muestra local con seed fija. No son certificados ni firmas de aprobación.')}</p>
                  </article>
                </div>
              </div>
            )}

            {tab === 'studio' && (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-2xl border border-white/10 bg-[#081427] p-5 sm:p-7">
                  <h3 className="flex items-center gap-2 text-xl font-bold"><LockKeyhole size={20} className="text-teal-200"/>{t('Siguiente gate: Blue Prism Studio DEV')}</h3>
                  <ol className="mt-6 space-y-4">
                    {[
                      t('1. Verificar build exacto y referencias .NET en el destino autorizado.'),
                      t('2. Importar primero el Business Object generado y ejecutar Check Code.'),
                      t('3. Importar el Process y confirmar que su Action resuelve los puertos.'),
                      t('4. Ejecutar en DEV y comprobar el resultado real, incluyendo un caso negativo.'),
                      t('5. Reexportar los archivos, conservar SHA y registrar aceptación independiente.'),
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                        <ShieldCheck className="mt-0.5 shrink-0 text-teal-200" size={17}/>{line}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-[#081427] p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">{t('Demostración supervisada')}</p>
                  <h3 className="mt-4 text-2xl font-bold leading-tight">{t('De la evidencia estática a una prueba real.')}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{t('La validación en Studio requiere un entorno DEV autorizado y un operador con acceso. BPCA no instala VBO, no accede a credenciales y no ejecuta el runtime desde este laboratorio.')}</p>
                  <a href="/#contacto" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#101a2e] transition-colors hover:bg-sky-100">
                    {t('Solicitar demostración guiada')} <ArrowRight size={16}/>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#0a1729] px-5 py-4 sm:px-8">
            <p className="max-w-2xl text-[11px] leading-relaxed text-white/50">{t('La evidencia es de validación estática local. Importación, Check Code y ejecución Blue Prism: NOT_RUN. El estado de dependencias: NO_GO.')}</p>
            <button type="button" onClick={downloadEvidence} data-testid="bpca-download-evidence" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200/30 bg-teal-200/[0.085] px-4 py-3 text-xs font-semibold text-teal-100 transition-colors hover:bg-teal-100/[0.14] focus-visible:outline-2 focus-visible:outline-teal-300">
              <ArrowDownToLine size={16}/> {t('Descargar evidencia JSON')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
