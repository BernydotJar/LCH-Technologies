import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, Check, MessageCircle, RotateCcw, SendHorizontal,
  ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { DONNA_QUICK_PROMPTS } from '../donna/knowledge';
import { DONNA_IDEA_ROTATION_MS, DONNA_IDEAS, contextualPrompts } from '../donna/experience';
import './donna-experience.css';
import { DONNA_LIMITS, isDonnaReply, type DonnaMessage, type DonnaReply } from '../donna/engine';
import type { InterestArea } from '../integrations/leadContract';
import { CONTACT_REQUIRED_FIELDS, countContactFields, mergeContactDraft, missingContactFields, type ContactDraft } from '../contact/semanticContract';
import { containsPersonalContactData, extractFromDonnaMessages, extractSemanticContact, readGuidedContactAnswer, safeContactMessageFromConversation } from '../contact/semanticDraft';

type DonnaUiMessage = DonnaMessage & { id: number; links?: DonnaReply['links']; kind?: DonnaReply['kind']; interest?: InterestArea };
export type DonnaHandoff = { interest: InterestArea; message: string; draft: ContactDraft };
type Props = { onHandoff: (data: DonnaHandoff) => void };

const PUBLIC_LINKS = new Set([
  '#contacto',
  '#soluciones',
  '#productos-reales',
  '#productos',
  '#privacidad-contacto',
  'https://evidencia.lch-app.cloud/',
  'https://luma.lch-app.cloud/onboarding',
  'https://ido.lch-app.cloud/w/colombia/inicio',
]);

const MAX_VISIBLE = 20;
const REQUEST_TIMEOUT_MS = 18_000;

type OrbState = 'idle' | 'hover' | 'shaping' | 'responding';

function PersonaOrb({ size = 'launcher', state = 'idle' }: { size?: 'compact' | 'launcher'; state?: OrbState }) {
  return (
    <span className="donna-signal" data-testid="donna-orb" data-size={size} data-state={state} aria-hidden="true">
      <span className="donna-signal__aura" />
      <span className="donna-signal__sphere">
        <span className="donna-signal__lobe donna-signal__lobe--a" />
        <span className="donna-signal__lobe donna-signal__lobe--b" />
        <span className="donna-signal__shine" />
      </span>
      <span className="donna-signal__monogram">D</span>
    </span>
  );
}

export function DonnaChat({ onHandoff }: Props) {
  const [open, setOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [messages, setMessages] = useState<DonnaUiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [lastInterest, setLastInterest] = useState<InterestArea>('Otro');
  const [contactMode, setContactMode] = useState(false);
  const [contactDraft, setContactDraft] = useState<ContactDraft>({});
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [invitationHovered, setInvitationHovered] = useState(false);
  const [invitationFocused, setInvitationFocused] = useState(false);
  const [ideaHovered, setIdeaHovered] = useState(false);
  const [ideaFocused, setIdeaFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [replyGlow, setReplyGlow] = useState(false);
  const reducedMotion = useReducedMotion();
  const busy = useRef<AbortController | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const composer = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const lastFailed = useRef<DonnaUiMessage[] | null>(null);
  const isComposing = useRef(false);
  const replyGlowTimer = useRef<number | null>(null);
  const currentIdea = DONNA_IDEAS[ideaIndex % DONNA_IDEAS.length];
  const orbState: OrbState = pending ? 'shaping' : replyGlow ? 'responding' : invitationHovered ? 'hover' : 'idle';

  const nextIdea = () => setIdeaIndex((current) => (current + 1) % DONNA_IDEAS.length);

  useEffect(() => () => {
    busy.current?.abort();
    if (timeoutId.current) clearTimeout(timeoutId.current);
    if (replyGlowTimer.current) clearTimeout(replyGlowTimer.current);
  }, []);

  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  // A single bounded hint timer; no automatic messages are ever sent.
  // Pauses on hover/focus, hidden tabs, reduced motion, drafts and active turns.
  useEffect(() => {
    const paused = reducedMotion || !pageVisible || pending || Boolean(draft.trim())
      || (open && (messages.length > 0 || ideaHovered || ideaFocused))
      || (!open && (invitationHovered || invitationFocused));
    if (paused) return;
    const timer = window.setTimeout(() => setIdeaIndex((index) => (index + 1) % DONNA_IDEAS.length), DONNA_IDEA_ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, pageVisible, pending, draft, open, messages.length, ideaHovered, ideaFocused,
    invitationHovered, invitationFocused, ideaIndex]);

  useEffect(() => {
    if (open) composer.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, pending]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  };

  function newConversation() {
    busy.current?.abort();
    busy.current = null;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = null;
    lastFailed.current = null;
    if (replyGlowTimer.current) clearTimeout(replyGlowTimer.current);
    replyGlowTimer.current = null;
    setReplyGlow(false);
    setMessages([]);
    setDraft('');
    setFailure('');
    setPending(false);
    setLastInterest('Otro');
    setContactMode(false);
    setContactDraft({});
    setAnnouncement('Nueva conversación iniciada.');
    composer.current?.focus();
  }

  async function runRequest(outbound: DonnaUiMessage[]) {
    if (busy.current) return;
    const operation = new AbortController();
    busy.current = operation;
    setPending(true);
    setFailure('');
    setAnnouncement('Donna está preparando una respuesta.');
    timeoutId.current = setTimeout(() => operation.abort('timeout'), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        cache: 'no-store',
        credentials: 'omit',
        body: JSON.stringify({
          messages: outbound.slice(-DONNA_LIMITS.maxMessages).map(({ role, content }) => ({ role, content })),
        }),
        signal: operation.signal,
      });
      if (!response.ok) {
        throw new Error(response.status === 429
          ? 'Donna ha recibido muchas consultas. Intenta nuevamente en un momento.'
          : response.status === 504
            ? 'La respuesta tardó demasiado.'
            : 'No pudimos obtener una respuesta. Puedes intentar nuevamente o solicitar contacto.');
      }
      const value: unknown = await response.json();
      if (!isDonnaReply(value)) throw new Error('Recibimos una respuesta inesperada.');
      if (operation.signal.aborted || busy.current !== operation) return;
      const answer: DonnaUiMessage = {
        id: nextId.current++,
        role: 'assistant',
        content: value.reply,
        links: value.links.filter((link) => PUBLIC_LINKS.has(link.url)),
        kind: value.kind,
        interest: value.suggestedInterest,
      };
      setMessages((previous) => [...previous, answer].slice(-MAX_VISIBLE));
      if (value.suggestedInterest !== 'Otro') setLastInterest(value.suggestedInterest);
      lastFailed.current = null;
      setAnnouncement('Donna respondió.');
      if (!reducedMotion) {
        if (replyGlowTimer.current) clearTimeout(replyGlowTimer.current);
        setReplyGlow(true);
        replyGlowTimer.current = window.setTimeout(() => {
          setReplyGlow(false);
          replyGlowTimer.current = null;
        }, 1_050);
      }
    } catch (error) {
      if (busy.current !== operation) return;
      const message = operation.signal.aborted ? 'La solicitud se detuvo o excedió el tiempo disponible.'
        : error instanceof Error ? error.message : 'No pudimos conectarnos.';
      setFailure(message);
      lastFailed.current = outbound;
      setAnnouncement(message);
    } finally {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      timeoutId.current = null;
      if (busy.current === operation) {
        busy.current = null;
        setPending(false);
      }
    }
  }

  function appendLocalContactExchange(text: string, answer: string) {
    const user: DonnaUiMessage = { id: nextId.current++, role: 'user', content: text };
    const donna: DonnaUiMessage = { id: nextId.current++, role: 'assistant', content: answer };
    setMessages((previous) => [...previous, user, donna].slice(-MAX_VISIBLE));
    setDraft('');
    setFailure('');
    setAnnouncement(answer);
  }

  function startContactAssistant() {
    if (busy.current) return;
    const fromConversation = extractFromDonnaMessages(messages, lastInterest);
    const prepared = mergeContactDraft(fromConversation, contactDraft);
    setContactDraft(prepared);
    setContactMode(true);
    setOpen(true);
    setNudgeDismissed(true);
    const missing = missingContactFields(prepared);
    const answer = missing.length
      ? `Puedo ayudarte a preparar la solicitud, sin abrir otras páginas ni enviarla. Identifiqué ${countContactFields(prepared)} datos. ${missing[0].question}`
      : 'Ya identifiqué los datos básicos. Podemos revisar el formulario ahora; también puedes corregir cualquier campo.';
    setMessages((previous) => [...previous, { id: nextId.current++, role: 'assistant' as const, content: answer }].slice(-MAX_VISIBLE));
    setAnnouncement(answer);
    window.requestAnimationFrame(() => composer.current?.focus());
  }

  function guideContactAnswer(text: string) {
    if (/^(?:cancelar|volver al chat|salir del formulario|salir)$/iu.test(text.trim())) {
      setContactMode(false);
      appendLocalContactExchange(text, 'De acuerdo. Volvemos a explorar las soluciones de LCH. Conservé el borrador en esta sesión, sin enviar ningún dato.');
      return;
    }
    const expected = missingContactFields(contactDraft)[0];
    const proposal = expected ? readGuidedContactAnswer(expected.name, text) : extractSemanticContact(text);
    const next = mergeContactDraft(contactDraft, proposal);
    setContactDraft(next);
    const missing = missingContactFields(next);
    const recognized = Object.keys(proposal).length > 0;
    const answer = !recognized
      ? `No pude identificar ese dato con suficiente certeza y prefiero no inventarlo. ${expected?.question ?? 'Puedes revisar los campos en el formulario.'}`
      : missing.length
        ? `Anotado. Ya tenemos ${countContactFields(next)} datos. ${missing[0].question}`
        : 'Ya tenemos los datos básicos. Pulsa «Revisar formulario» para comprobarlos, completar lo que desees y autorizar el envío.';
    appendLocalContactExchange(text, answer);
  }

  function send(text: string) {
    const content = text.trim();
    if (busy.current || !content) return;
    if (content.length > DONNA_LIMITS.maxMessageChars) {
      setFailure('Tu mensaje debe tener 2000 caracteres o menos.');
      return;
    }
    setOpen(true);
    setNudgeDismissed(true);
    if (contactMode) {
      guideContactAnswer(content);
      return;
    }
    const inferred = extractSemanticContact(content);
    setContactDraft((previous) => mergeContactDraft(previous, inferred));
    // Contact details go to the local semantic form helper, not the chat API.
    const hasIdentity = ['nombre', 'apellido', 'email', 'empresa', 'cargo'].some((key) => key in inferred);
    if (hasIdentity && (containsPersonalContactData(content) || Boolean(inferred.nombre || inferred.email || inferred.cargo))) {
      const prepared = mergeContactDraft(contactDraft, inferred);
      setContactDraft(prepared);
      setContactMode(true);
      const missing = missingContactFields(prepared);
      const answer = missing.length
        ? `Puedo preparar un borrador con los datos que compartiste. No los he enviado. ${missing[0].question}`
        : 'Ya tengo los datos básicos para un borrador. Puedes revisarlo antes de enviarlo.';
      appendLocalContactExchange(content, answer);
      return;
    }
    const next: DonnaUiMessage[] = [
      ...messages, { role: 'user' as const, id: nextId.current++, content },
    ].slice(-MAX_VISIBLE);
    setMessages(next);
    setDraft('');
    void runRequest(next);
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !isComposing.current) {
      event.preventDefault();
      send(draft);
    }
  };

  function handoff() {
    const recentUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
    const proposal = mergeContactDraft(extractFromDonnaMessages(messages, lastInterest), contactDraft);
    const message = proposal.mensaje || safeContactMessageFromConversation(recentUserMessage);
    // This only transfers a typed proposal into React's contact form. It cannot
    // set the consent checkbox, send a request, or write to Firestore.
    onHandoff({ interest: (proposal.interes as InterestArea | undefined) ?? lastInterest, message, draft: proposal });
    setContactMode(false);
    setOpen(false);
  }

  const hasChat = messages.length > 0;
  const latestQuestion = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  const latest = messages[messages.length - 1];
  const nextPrompts = contactMode ? [] : contextualPrompts(latest?.kind, latest?.interest, latestQuestion);
  const contactMissing = contactMode ? missingContactFields(contactDraft) : [];

  return (
    <div className="fixed bottom-4 right-3 z-[80] flex max-w-[calc(100vw-1.5rem)] flex-col items-end sm:bottom-6 sm:right-6" data-testid="lch-donna">
      <AnimatePresence>
        {open && (
          <motion.section
            key="chat-panel"
            id="donna-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Conversación con Donna, asistente de LCH"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex h-[min(76dvh,610px)] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_80px_rgba(10,15,55,0.28)]"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0C0A50] px-4 py-3.5 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <PersonaOrb size="compact" state={pending ? 'shaping' : replyGlow ? 'responding' : 'idle'} />
                <div className="min-w-0">
                  <h2 className="text-base font-bold tracking-tight">Donna <span className="ml-1 font-normal text-teal-200">/ LCH</span></h2>
                  <p className="text-[11px] text-slate-300">{pending ? 'Preparando una respuesta…' : contactMode ? 'Preparando tu solicitud · solo borrador' : 'Asistente guiado · información de LCH'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasChat && (
                  <button type="button" aria-label="Nueva conversación" title="Nueva conversación" onClick={newConversation}
                    className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>
                )}
                <button type="button" aria-label="Cerrar Donna" onClick={close}
                  className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div ref={transcript} role="region" aria-label="Historial de la conversación" tabIndex={0}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#F7FAFD] to-white px-4 py-5">
              {!hasChat && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
                    <Sparkles size={14} aria-hidden="true" /> Un siguiente paso más claro
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold leading-tight text-primary">Hola, soy Donna.</h3>
                    <p className="text-sm leading-relaxed text-secondary">
                      Cuéntame qué quieres mejorar en tu negocio. Te ayudo a explorar opciones reales y, cuando haga falta, te conecto con el equipo.
                    </p>
                  </div>
                  <div
                    className="donna-idea rounded-2xl border border-teal-100 bg-gradient-to-br from-[#eefbfa] via-white to-[#edf4ff] p-4 shadow-[0_12px_30px_rgba(21,94,117,0.07)]"
                    role="group" aria-label="Idea para comenzar"
                    data-testid="donna-idea-card"
                    onPointerEnter={() => setIdeaHovered(true)}
                    onPointerLeave={() => setIdeaHovered(false)}
                    onFocusCapture={() => setIdeaFocused(true)}
                    onBlurCapture={(event) => {
                      const next = event.relatedTarget;
                      if (!(next instanceof Node) || !event.currentTarget.contains(next)) setIdeaFocused(false);
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="donna-idea__eyebrow text-[10px] font-bold uppercase text-teal-800">
                        Una idea para empezar
                      </span>
                      <span className="text-[11px] font-semibold tabular-nums text-slate-500">
                        {ideaIndex + 1} / {DONNA_IDEAS.length}
                      </span>
                    </div>
                    <div className="donna-idea__content">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={currentIdea.id}
                          initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                        >
                          <p className="mb-1 text-[11px] font-semibold text-teal-700">{currentIdea.eyebrow}</p>
                          <p data-testid="donna-idea-question" className="text-sm font-bold leading-snug text-primary">{currentIdea.question}</p>
                          <p className="mt-1 text-xs leading-relaxed text-secondary">{currentIdea.context}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button type="button" onClick={() => send(currentIdea.prompt)}
                        className="flex min-h-9 items-center gap-1.5 text-xs font-bold text-teal-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                        {currentIdea.action}<ArrowRight size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={nextIdea} aria-label="Siguiente idea"
                        className="min-h-9 rounded-lg border border-teal-100 bg-white px-3 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                        Siguiente
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">O elige un tema</p>
                  <div className="grid gap-2">
                    {DONNA_QUICK_PROMPTS.slice(0, 2).map((prompt) => (
                      <button key={prompt.label} type="button" onClick={() => send(prompt.message)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-primary shadow-sm transition-colors hover:border-teal-400 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                        {prompt.label}<ArrowRight size={16} className="shrink-0 text-teal-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <button type="button" data-testid="donna-start-contact" onClick={startContactAssistant}
                    className="flex w-full min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                    <Check size={15} aria-hidden="true" /> Donna, ayúdame a preparar una solicitud <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
              {hasChat && (
                <ol className="space-y-4" aria-label="Mensajes">
                  {messages.map((message) => (
                    <li key={message.id} data-role={message.role} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="mb-1 text-[11px] font-semibold text-slate-500">{message.role === 'user' ? 'Tú' : 'Donna'}</span>
                      <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-[#0C0A50] text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm'}`}>
                        {message.content}
                        {message.role === 'assistant' && Boolean(message.links?.length) && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                            {message.links?.map((link) => (
                              link.url === '#contacto'
                                ? <button key={link.url} type="button" onClick={handoff} className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 underline-offset-4 hover:underline">{link.label}<ArrowRight size={13} aria-hidden="true" /></button>
                                : <a key={link.url} href={link.url} onClick={(event) => { if (link.url.startsWith('#')) { event.preventDefault(); setOpen(false); document.getElementById(link.url.slice(1))?.scrollIntoView({ behavior: 'smooth' }); } }}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 underline-offset-4 hover:underline"
                                  {...(!link.url.startsWith('#') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                                  {link.label}<ArrowUpRight size={13} aria-hidden="true" />
                                </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === 'assistant' && message.id === latest?.id && nextPrompts.length > 0 && (
                        <div className="mt-2 w-full max-w-[96%]" data-testid="donna-contextual-prompts" aria-label="Sugerencias relacionadas">
                          <p className="mb-2 pl-1 text-[11px] font-semibold text-slate-500">También puedes explorar</p>
                          <div className="flex flex-wrap gap-2">
                            {nextPrompts.map((prompt) => (
                              <button
                                type="button"
                                key={prompt.message}
                                onClick={() => send(prompt.message)}
                                disabled={pending}
                                className="rounded-full border border-teal-200 bg-white px-3 py-2 text-left text-[11px] font-semibold text-teal-900 transition-colors hover:border-teal-400 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50"
                              >{prompt.label} <ArrowRight size={12} className="ml-1 inline" aria-hidden="true" /></button>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {pending && <p className="flex items-center gap-2 text-xs text-secondary" role="status"><span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" /> Donna está respondiendo…</p>}
              {failure && (
                <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  <p>{failure}</p>
                  {lastFailed.current && <button type="button" onClick={() => { if (lastFailed.current) void runRequest(lastFailed.current); }} className="mt-2 font-bold underline underline-offset-2">Reintentar respuesta</button>}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white p-3.5">
              {contactMode && (
                <div data-testid="donna-contact-guide" role="group" aria-label="Preparar solicitud con Donna"
                  className="mb-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs leading-relaxed text-teal-950">
                  <div className="flex items-center justify-between gap-2 font-semibold">
                    <span>Tu solicitud · borrador privado</span>
                    <span data-testid="donna-contact-progress" className="tabular-nums">{countContactFields(contactDraft)}/{CONTACT_REQUIRED_FIELDS.length} datos</span>
                  </div>
                  <p className="mt-1 text-teal-900">
                    {contactMissing.length ? `Siguiente: ${contactMissing[0].label}. Puedes responder aquí o revisar los campos en el formulario.` : 'Los datos básicos están listos para revisión; puedes corregirlos antes de enviarlos.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={handoff} data-testid="donna-review-contact"
                      className="rounded-md bg-primary px-3 py-2 font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                      Revisar formulario <ArrowRight size={13} className="ml-1 inline" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setContactMode(false)}
                      className="rounded-md border border-teal-200 bg-white px-3 py-2 font-semibold text-teal-900 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                      Volver al chat
                    </button>
                  </div>
                </div>
              )}
              {hasChat && !contactMode && (
                <div className="mb-3 grid gap-2">
                  <button type="button" onClick={startContactAssistant} disabled={pending} data-testid="donna-start-contact"
                    className="flex w-full min-h-9 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50">
                    Completar mis datos con Donna <ArrowRight size={14} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={handoff} className="flex w-full min-h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                    <Check size={14} aria-hidden="true" /> Continuar con una persona <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
              <form onSubmit={submit} className="flex gap-2">
                <label className="sr-only" htmlFor="donna-message">Escribe a Donna</label>
                <textarea
                  ref={composer} id="donna-message" rows={2} maxLength={DONNA_LIMITS.maxMessageChars}
                  value={draft} onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => { isComposing.current = true; }}
                  onCompositionEnd={() => { isComposing.current = false; }}
                  placeholder={pending ? 'Esperando respuesta…' : contactMissing[0] ? contactMissing[0].question : contactMode ? 'Puedes indicar una corrección…' : 'Escribe tu pregunta…'}
                  disabled={pending}
                  className="min-h-12 max-h-28 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-primary placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 disabled:opacity-70"
                />
                <button type="submit" aria-label="Enviar mensaje" disabled={pending || !draft.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-primary text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40">
                  <SendHorizontal size={19} aria-hidden="true" />
                </button>
              </form>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-tight text-slate-500">
                <ShieldCheck size={12} className="shrink-0" aria-hidden="true" />
                No compartas contraseñas ni datos sensibles. Donna prepara borradores; tú autorizas el envío.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!open && !nudgeDismissed && (
        <div
          className="donna-idea mb-3 w-[min(300px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_14px_45px_rgba(10,15,55,0.16)]"
          data-testid="donna-invitation"
          onPointerEnter={() => setInvitationHovered(true)}
          onPointerLeave={() => setInvitationHovered(false)}
          onFocusCapture={() => setInvitationFocused(true)}
          onBlurCapture={(event) => {
            const next = event.relatedTarget;
            if (!(next instanceof Node) || !event.currentTarget.contains(next)) setInvitationFocused(false);
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="donna-idea__eyebrow text-[10px] font-bold uppercase text-teal-800">Ideas para tu negocio</span>
            <button type="button" onClick={() => setNudgeDismissed(true)} aria-label="Descartar sugerencia de Donna"
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
          <div className="donna-idea__compact">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIdea.id}
                initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <p className="mb-1 text-[11px] font-semibold text-teal-800">{currentIdea.eyebrow}</p>
                <p data-testid="donna-invitation-question" className="text-sm font-bold leading-snug text-primary">{currentIdea.question}</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{currentIdea.context}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button type="button" onClick={() => send(currentIdea.prompt)} className="flex min-h-9 items-center gap-1.5 text-xs font-bold text-teal-900 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
              {currentIdea.action} <ArrowRight size={14} aria-hidden="true" />
            </button>
            <span aria-hidden="true" className="text-[11px] font-medium tabular-nums text-slate-500">{ideaIndex + 1} / {DONNA_IDEAS.length}</span>
          </div>
        </div>
      )}

      <button
        ref={launcher} type="button" aria-label={open ? 'Cerrar chat de Donna' : 'Hablar con Donna'}
        aria-expanded={open} aria-controls="donna-chat-panel"
        onClick={() => { if (open) close(); else { setOpen(true); setNudgeDismissed(true); } }}
        onPointerEnter={() => setInvitationHovered(true)}
        onPointerLeave={() => setInvitationHovered(false)}
        onFocus={() => setInvitationFocused(true)}
        onBlur={() => setInvitationFocused(false)}
        className="group flex w-[224px] max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-full border border-white/20 bg-[#0C0A50] py-2.5 pl-2.5 pr-5 text-white shadow-[0_12px_36px_rgba(12,10,80,0.32)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
      >
        <PersonaOrb state={orbState} />
        <span className="flex min-w-0 flex-col items-start">
          <span className="flex items-center gap-1 text-sm font-bold">Donna <MessageCircle size={13} aria-hidden="true" /></span>
          <span data-testid="donna-launcher-hint" aria-hidden="true" className="max-w-[165px] truncate text-[11px] font-medium text-teal-200">{currentIdea.action}</span>
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}
