import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import type { ContactHandoff, DonnaPreparedDraft } from '../App';
import type { DemoRequest } from '../integrations/leadContract';
import { CONTACT_FIELD_BY_NAME, countContactFields, normalizeContactDraft, PREPARE_CONTACT_TOOL, type ContactDraft, type ContactField } from '../contact/semanticContract';
import { reconcileAssistantDraft } from '../contact/liveDraft';
import { useLocale } from '../i18n/LocaleProvider';
import { track } from '../analytics/client';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const EMPTY_REQUEST: DemoRequest = {
  nombre: '',
  apellido: '',
  email: '',
  empresa: '',
  cargo: '',
  interes: '',
  mensaje: '',
  consentimiento: false,
};

const INPUT_STYLE =
  'w-full rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-primary placeholder:text-neutral-400 transition-colors focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60';
const LABEL_STYLE = 'mb-1.5 block text-xs font-semibold tracking-wide text-secondary';

const OPPORTUNITIES = [
  { title: 'Automatizar procesos', detail: 'Tiempo, tareas y aprobaciones', interest: 'Automatización' },
  { title: 'Aplicar IA al negocio', detail: 'Conocimiento, agentes y decisiones', interest: 'Inteligencia Artificial' },
  { title: 'Construir un sistema', detail: 'Producto, integración y software', interest: 'Software Empresarial' },
] as const;

const INTEREST_HELP: Record<string, string> = {
  'Automatización': 'Por ejemplo: aprobaciones, gestión documental, operaciones o atención al cliente.',
  'Inteligencia Artificial': 'Por ejemplo: agentes, asistentes empresariales, analítica o búsqueda con evidencia.',
  'Software Empresarial': 'Por ejemplo: aplicaciones internas, plataformas SaaS o integración de sistemas.',
  'Cloud': 'Por ejemplo: modernización, integración, arquitectura o escalabilidad.',
  'LCH Evidence AI': 'Cuéntanos qué documentos, normas o procesos deseas consultar con trazabilidad.',
  'Otro': 'Cuéntanos brevemente qué buscas y encontraremos el siguiente paso.',
};

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.startsWith('Invalid demo request:')) {
    return 'Revisa los campos del formulario y confirma tu consentimiento.';
  }
  return 'No pudimos confirmar la recepción. Conservamos lo que escribiste para que puedas intentar de nuevo.';
}

type Props = { handoff: ContactHandoff | null; preparedDraft: DonnaPreparedDraft | null; onStartDonna: (draft: ContactDraft) => void };

export const Contact = ({ handoff, preparedDraft, onStartDonna }: Props) => {
  const { t } = useLocale();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState<DemoRequest>(EMPTY_REQUEST);
  const [errorText, setErrorText] = useState('');
  const [confirmationId, setConfirmationId] = useState('');
  const [website, setWebsite] = useState('');
  const inFlight = useRef(false);
  const [handoffActive, setHandoffActive] = useState(false);
  const [handoffFieldCount, setHandoffFieldCount] = useState(0);
  const [liveFieldCount, setLiveFieldCount] = useState(0);
  const manualFields = useRef<Set<ContactField>>(new Set());
  const lastDonnaDraft = useRef<ContactDraft>({});

  useEffect(() => {
    if (!preparedDraft) return;
    const proposal = normalizeContactDraft(preparedDraft.draft);
    const prior = lastDonnaDraft.current;
    const edited = new Set(manualFields.current);
    setFormData((current) => reconcileAssistantDraft(current, prior, proposal, edited));
    lastDonnaDraft.current = proposal;
    setLiveFieldCount(countContactFields(proposal));
    if (!Object.keys(proposal).length) {
      setHandoffActive(false);
      setHandoffFieldCount(0);
    }
  }, [preparedDraft?.nonce]);

  useEffect(() => {
    if (!handoff) return;
    const proposal = normalizeContactDraft({
      ...handoff.draft,
      interes: handoff.draft?.interes || (handoff.interest !== 'Otro' ? handoff.interest : undefined),
      mensaje: handoff.draft?.mensaje || handoff.message,
    });
    const prior = lastDonnaDraft.current;
    const edited = new Set(manualFields.current);
    setFormData((current) => reconcileAssistantDraft(current, prior, proposal, edited));
    lastDonnaDraft.current = proposal;
    setLiveFieldCount(countContactFields(proposal));
    setStatus('idle');
    setHandoffFieldCount(countContactFields(proposal));
    setHandoffActive(true);
  }, [handoff?.nonce]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    if (Object.prototype.hasOwnProperty.call(CONTACT_FIELD_BY_NAME, name)) manualFields.current.add(name as ContactField);
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }));
    if (status === 'error') {
      setStatus('idle');
      setErrorText('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;

    // Un campo destinado exclusivamente a bots evita tráfico accidental sin añadir fricción.
    if (website.trim()) return;

    inFlight.current = true;
    setStatus('loading');
    setErrorText('');

    try {
      const { submitDemoRequest } = await import('../integrations/demoRequests');
      const result = await submitDemoRequest(formData);
      if (!result.leadId) throw new Error('Submission receipt was not returned');

      setConfirmationId(result.leadId.slice(0, 10).toUpperCase());
      setFormData({ ...EMPTY_REQUEST });
      manualFields.current.clear();
      lastDonnaDraft.current = {};
      setHandoffActive(false);
      setLiveFieldCount(0);
      setStatus('success');
      track('contact_submit_success', { section: 'contact' });
    } catch (error) {
      console.error('LCH contact form submission failed', error);
      setErrorText(errorMessage(error));
      setStatus('error');
      track('contact_submit_error', { section: 'contact' });
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <section id="contacto" className="site-brand-surface border-t border-white/10 bg-primary">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col px-4 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex flex-col justify-center py-20 lg:w-1/2 lg:py-28 lg:pr-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">{t('Hablemos de resultados')}</p>
          <h2 className="mb-7 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('El próximo avance comienza con una conversación.')}
          </h2>
          <p className="mb-11 max-w-lg text-lg leading-relaxed text-neutral-300">
            {t('Cuéntanos qué proceso, decisión o sistema quieres mejorar. Nos enfocamos en el impacto que buscas y en el siguiente paso más útil para tu organización.')}
          </p>

          <div className="space-y-6 text-neutral-300">
            {[
              'Entendemos el problema antes de recomendar tecnología.',
              'Exploramos oportunidades de automatización e IA aplicadas.',
              'Proponemos una conversación o demostración relevante a tu caso.',
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-4">
                <div className="mt-0.5 rounded-md border border-white/10 bg-white/5 p-1 text-teal-200">
                  <Check size={16} aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed sm:text-base">{t(benefit)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="theme-contact-surface flex flex-col justify-center border-neutral-200 bg-white px-5 py-14 sm:px-10 lg:w-1/2 lg:border-l lg:px-14 lg:py-20">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={32} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-primary">{t('Recibimos tu solicitud')}</h3>
              <p className="mx-auto mb-5 max-w-sm leading-relaxed text-secondary">
                {t('Gracias. Revisaremos tu solicitud y te contactaremos usando los datos que compartiste.')}
              </p>
              <p className="mb-8 text-xs font-medium tracking-wide text-secondary">
                {t('Referencia:')} <span className="font-mono text-primary">{confirmationId}</span>
              </p>
              <button
                type="button"
                onClick={() => { setStatus('idle'); setConfirmationId(''); }}
                className="font-semibold text-accent underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {t('Enviar otra solicitud')}
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-5" aria-busy={status === 'loading'} data-semantic-tool={PREPARE_CONTACT_TOOL.name} data-testid="lch-contact-form">
              {(handoffActive || liveFieldCount > 0) && <div role="status" data-testid="contact-donna-live-status" className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-xs leading-relaxed text-teal-900">
                {liveFieldCount || handoffFieldCount} {t('datos preparados en el formulario. Puedes corregirlos antes de autorizar el envío; nada se ha enviado todavía.')}
              </div>}
              <div>
                <h3 className="mb-2 text-2xl font-bold text-primary">{t('Cuéntanos qué quieres lograr')}</h3>
                <p className="text-sm leading-relaxed text-secondary">
                  {t('Selecciona una oportunidad y compártenos tus datos para coordinar el siguiente paso.')}
                </p>
                <button type="button" data-testid="contact-fill-with-donna" disabled={status === 'loading'}
                  onClick={() => onStartDonna(normalizeContactDraft(formData))}
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50">
                  <Sparkles size={16} aria-hidden="true" /> {t('Completar con Donna')}
                </button>
                <p className="mt-2 text-xs leading-relaxed text-secondary">{t('Donna prepara los campos mientras conversas. Tú revisas y decides si los envías.')}</p>
              </div>

              <fieldset>
                <legend className="mb-3 text-xs font-semibold tracking-wide text-secondary">{t('¿Dónde podemos aportar valor?')}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {OPPORTUNITIES.map(({ title, detail, interest }) => {
                    const selected = formData.interes === interest;
                    return (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={selected}
                        disabled={status === 'loading'}
                        onClick={() => { manualFields.current.add('interes'); setFormData((previous) => ({ ...previous, interes: interest })); }}
                        className={`rounded-md border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? 'border-accent bg-teal-50 text-primary' : 'border-neutral-200 bg-neutral-50 text-secondary hover:border-accent/50'}`}
                      >
                        <span className="block text-xs font-bold">{t(title)}</span>
                        <span className="mt-1 block text-[11px] leading-snug">{t(detail)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className={LABEL_STYLE}>{t('Nombre')} <span aria-hidden="true">*</span></label>
                  <input required maxLength={CONTACT_FIELD_BY_NAME.nombre.maxLength} autoComplete="given-name" type="text" id="nombre" name="nombre" data-semantic-field="nombre" placeholder={t('Tu nombre')} value={formData.nombre} onChange={handleChange} disabled={status === 'loading'} className={INPUT_STYLE} />
                </div>
                <div>
                  <label htmlFor="apellido" className={LABEL_STYLE}>{t('Apellido')} <span aria-hidden="true">*</span></label>
                  <input required maxLength={CONTACT_FIELD_BY_NAME.apellido.maxLength} autoComplete="family-name" type="text" id="apellido" name="apellido" data-semantic-field="apellido" placeholder={t('Tu apellido')} value={formData.apellido} onChange={handleChange} disabled={status === 'loading'} className={INPUT_STYLE} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={LABEL_STYLE}>{t('Correo electrónico')} <span aria-hidden="true">*</span></label>
                <input required maxLength={CONTACT_FIELD_BY_NAME.email.maxLength} autoComplete="email" type="email" id="email" name="email" data-semantic-field="email" placeholder="nombre@empresa.com" value={formData.email} onChange={handleChange} disabled={status === 'loading'} className={INPUT_STYLE} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="empresa" className={LABEL_STYLE}>{t('Organización')} <span aria-hidden="true">*</span></label>
                  <input required maxLength={CONTACT_FIELD_BY_NAME.empresa.maxLength} autoComplete="organization" type="text" id="empresa" name="empresa" data-semantic-field="empresa" placeholder={t('Nombre de empresa')} value={formData.empresa} onChange={handleChange} disabled={status === 'loading'} className={INPUT_STYLE} />
                </div>
                <div>
                  <label htmlFor="cargo" className={LABEL_STYLE}>{t('Tu rol')} <span aria-hidden="true">*</span></label>
                  <input required maxLength={CONTACT_FIELD_BY_NAME.cargo.maxLength} autoComplete="organization-title" type="text" id="cargo" name="cargo" data-semantic-field="cargo" placeholder={t('Cargo o función')} value={formData.cargo} onChange={handleChange} disabled={status === 'loading'} className={INPUT_STYLE} />
                </div>
              </div>

              <div>
                <label htmlFor="interes" className={LABEL_STYLE}>{t('Área de interés')} <span aria-hidden="true">*</span></label>
                <select required id="interes" name="interes" data-semantic-field="interes" value={formData.interes} onChange={handleChange} disabled={status === 'loading'} className={`${INPUT_STYLE} ${formData.interes ? 'text-primary' : 'text-neutral-400'}`}>
                  <option value="" disabled>{t('Selecciona el tema principal')}</option>
                  <option value="Inteligencia Artificial">{t('Inteligencia Artificial')}</option>
                  <option value="Automatización">{t('Automatización de procesos')}</option>
                  <option value="Software Empresarial">{t('Software empresarial y plataformas')}</option>
                  <option value="Cloud">{t('Cloud e infraestructura')}</option>
                  <option value="LCH Evidence AI">LCH Evidence AI</option>
                  <option value="Otro">{t('Otro desafío')}</option>
                </select>
                {formData.interes && <p className="mt-2 text-xs leading-relaxed text-secondary">{t(INTEREST_HELP[formData.interes] ?? '')}</p>}
              </div>

              <div>
                <label htmlFor="mensaje" className={LABEL_STYLE}>{t('¿Qué resultado te gustaría conseguir?')} <span className="font-normal">{t('(opcional)')}</span></label>
                <textarea id="mensaje" name="mensaje" data-semantic-field="mensaje" maxLength={CONTACT_FIELD_BY_NAME.mensaje.maxLength} rows={3} placeholder={t('Por ejemplo: reducir el tiempo de aprobación de contratos o conectar datos de varios sistemas.')} value={formData.mensaje} onChange={handleChange} disabled={status === 'loading'} className={`${INPUT_STYLE} resize-y`} />
                <p className="mt-1 text-right text-[11px] tabular-nums text-neutral-500">{formData.mensaje.length}/2000</p>
              </div>

              <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="website">{t('Deja este campo vacío')}</label>
                <input type="text" name="website" id="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input required type="checkbox" id="consentimiento" name="consentimiento" checked={formData.consentimiento} onChange={handleChange} disabled={status === 'loading'} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 text-accent focus:ring-accent" />
                <label htmlFor="consentimiento" className="text-xs leading-relaxed text-secondary">
                  {t('Autorizo el tratamiento de mis datos para evaluar y responder esta solicitud. Consulta el')} <a href="#privacidad-contacto" className="font-semibold text-accent underline underline-offset-2 hover:text-primary">{t('aviso de privacidad')}</a>.
                </label>
              </div>

              {status === 'error' && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>{t(errorText)}</span>
                </div>
              )}

              <button type="submit" disabled={status === 'loading'} className="group flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60">
                {status === 'loading' ? (
                  <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> {t('Enviando solicitud...')}</>
                ) : (
                  <>{t('Quiero conversar con LCH')} <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-secondary">
                <ShieldCheck size={15} className="shrink-0 text-accent" aria-hidden="true" />
                {t('Datos utilizados para gestionar tu solicitud. Sin necesidad de crear una cuenta.')}
              </p>

            </form>
          )}
          <details id="privacidad-contacto" className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-secondary">
            <summary className="cursor-pointer font-semibold text-primary">{t('Aviso de privacidad del formulario')}</summary>
            <p className="mt-3 leading-relaxed">
              {t('LCH Technologies registra los datos que envías (identificación, organización, correo y descripción del desafío) para analizar tu consulta, organizar el seguimiento y contactarte. La información se almacena en los sistemas de gestión de solicitudes y puede ser procesada mediante automatizaciones internas de clasificación.')}
            </p>
            <p className="mt-2 leading-relaxed">
              {t('Comparte solo la información necesaria para la conversación inicial. No incluyas contraseñas, secretos comerciales ni datos personales sensibles.')}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
};
