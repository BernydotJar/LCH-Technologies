import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, Check, MessageCircle, RotateCcw, SendHorizontal,
  ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { DONNA_QUICK_PROMPTS } from '../donna/knowledge';
import { DONNA_LIMITS, isDonnaReply, type DonnaMessage, type DonnaReply } from '../donna/engine';
import type { InterestArea } from '../integrations/leadContract';

type DonnaUiMessage = DonnaMessage & { id: number; links?: DonnaReply['links']; kind?: DonnaReply['kind'] };
export type DonnaHandoff = { interest: InterestArea; message: string };
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

function PersonaOrb({ small = false, active = false }: { small?: boolean; active?: boolean }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${small ? 'h-9 w-9' : 'h-12 w-12'}`} aria-hidden="true">
      <span className={`absolute inset-0 rounded-full bg-cyan-300/35 blur-md ${active ? 'motion-safe:animate-pulse' : ''}`} />
      <span className="relative flex h-full w-full items-center justify-center rounded-full border border-cyan-100/65 bg-gradient-to-tr from-teal-700 via-sky-500 to-indigo-300 text-base font-bold text-white shadow-[inset_0_2px_9px_rgba(255,255,255,0.5)]">
        D
      </span>
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
  const reducedMotion = useReducedMotion();
  const busy = useRef<AbortController | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const composer = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const lastFailed = useRef<DonnaUiMessage[] | null>(null);
  const isComposing = useRef(false);

  useEffect(() => () => {
    busy.current?.abort();
    if (timeoutId.current) clearTimeout(timeoutId.current);
  }, []);

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
    setMessages([]);
    setDraft('');
    setFailure('');
    setPending(false);
    setLastInterest('Otro');
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
      };
      setMessages((previous) => [...previous, answer].slice(-MAX_VISIBLE));
      if (value.suggestedInterest !== 'Otro') setLastInterest(value.suggestedInterest);
      lastFailed.current = null;
      setAnnouncement('Donna respondió.');
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

  function send(text: string) {
    const content = text.trim();
    if (busy.current || !content) return;
    if (content.length > DONNA_LIMITS.maxMessageChars) {
      setFailure('Tu mensaje debe tener 2000 caracteres o menos.');
      return;
    }
    setOpen(true);
    setNudgeDismissed(true);
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
    // An explicit action is required: the conversation itself never becomes a
    // lead or enters Firestore without the existing contact form and consent.
    onHandoff({ interest: lastInterest, message: recentUserMessage });
    setOpen(false);
  }

  const hasChat = messages.length > 0;

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
                <PersonaOrb small active={pending} />
                <div className="min-w-0">
                  <h2 className="text-base font-bold tracking-tight">Donna <span className="ml-1 font-normal text-teal-200">/ LCH</span></h2>
                  <p className="text-[11px] text-slate-300">{pending ? 'Analizando tu pregunta…' : 'Asistente guiado · información de LCH'}</p>
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
                  <div className="grid gap-2">
                    {DONNA_QUICK_PROMPTS.map((prompt) => (
                      <button key={prompt.label} type="button" onClick={() => send(prompt.message)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-primary shadow-sm transition-colors hover:border-teal-400 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                        {prompt.label}<ArrowRight size={16} className="shrink-0 text-teal-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
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
              {hasChat && (
                <button type="button" onClick={handoff} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-100">
                  <Check size={14} aria-hidden="true" /> Continuar con una persona <ArrowRight size={14} aria-hidden="true" />
                </button>
              )}
              <form onSubmit={submit} className="flex gap-2">
                <label className="sr-only" htmlFor="donna-message">Escribe a Donna</label>
                <textarea
                  ref={composer} id="donna-message" rows={2} maxLength={DONNA_LIMITS.maxMessageChars}
                  value={draft} onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => { isComposing.current = true; }}
                  onCompositionEnd={() => { isComposing.current = false; }}
                  placeholder={pending ? 'Esperando respuesta…' : 'Escribe tu pregunta…'}
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
                No compartas datos sensibles. El chat no envía solicitudes comerciales automáticamente.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!open && !nudgeDismissed && (
        <div className="mb-3 max-w-[260px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(10,15,55,0.15)]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-primary">¿Qué podríamos mejorar en tu operación?</p>
            <button type="button" onClick={() => setNudgeDismissed(true)} aria-label="Descartar sugerencia de Donna" className="text-slate-400 hover:text-primary"><X size={14} /></button>
          </div>
          <button type="button" onClick={() => { setOpen(true); setNudgeDismissed(true); }} className="mt-2 flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline">
            Conversemos <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}

      <button
        ref={launcher} type="button" aria-label={open ? 'Cerrar chat de Donna' : 'Hablar con Donna'}
        aria-expanded={open} aria-controls="donna-chat-panel"
        onClick={() => { if (open) close(); else { setOpen(true); setNudgeDismissed(true); } }}
        className="group flex items-center gap-3 rounded-full border border-white/20 bg-[#0C0A50] py-2.5 pl-2.5 pr-5 text-white shadow-[0_12px_36px_rgba(12,10,80,0.32)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
      >
        <PersonaOrb small />
        <span className="flex flex-col items-start">
          <span className="flex items-center gap-1 text-sm font-bold">Donna <MessageCircle size={13} aria-hidden="true" /></span>
          <span className="text-[11px] font-medium text-teal-200">Asistente LCH</span>
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}
