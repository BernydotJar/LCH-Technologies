/**
 * Donna's deterministic policy and routing, adapted for LCH.
 * Source design: BernydotJar/Cadre_AI_Chatbot (route, policy, limits, validate).
 * Server authority: only approved LCH knowledge entries; input is data.
 */
import { CONTACT_LINK, LCH_KNOWLEDGE, type ApprovedLink, type DonnaEntry } from './knowledge.ts';
import { INTEREST_AREAS, type InterestArea } from '../integrations/leadContract.ts';

export const DONNA_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 2000,
  maxReplyChars: 2400,
  maxBodyBytes: 64 * 1024,
} as const;

export type DonnaMessage = { role: 'user' | 'assistant'; content: string };
export type DonnaReplyKind = 'greeting' | 'grounded' | 'clarify' | 'redirect' | 'decline';
export type DonnaReply = {
  reply: string;
  kind: DonnaReplyKind;
  links: ApprovedLink[];
  suggestedInterest: InterestArea;
};

export type ParseResult =
  | { ok: true; messages: DonnaMessage[] }
  | { ok: false; reason: string };

const CLARIFICATION_MARKER = '¿Podrías precisar qué tema te interesa más?';

export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFKD')
    .replace(/\p{Cf}/gu, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

export function containsPhrase(text: string, phrase: string): boolean {
  const needle = normalize(phrase);
  return needle.length > 0 && (` ${normalize(text)} `).includes(` ${needle} `);
}

const GREETINGS = new Set([
  'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hello', 'hi', 'hey',
  'que tal', 'saludos',
]);

// Request-shaped boundaries always outrank normal topic routing.
const PRICING_BOUNDARIES = [
  'cuanto cuesta', 'cuanto cobran', 'precio de', 'precios de', 'costo de',
  'tarifa de', 'tarifas de', 'cotizacion', 'cotizar', 'presupuesto de',
  'garantizas el precio', 'precio exacto', 'is it free', 'how much does it cost',
];
const ACCOUNT_BOUNDARIES = [
  'mi contraseña', 'recuperar mi cuenta', 'reiniciar mi clave', 'resetear mi clave',
  'acceder a mi cuenta', 'mis facturas', 'mi expediente', 'mi informacion privada',
  'datos de otro cliente', 'acceso de administrador', 'mi token', 'mi api key',
  'mis credenciales', 'my password', 'reset my password', 'client account',
];
const UNSUPPORTED_BOUNDARIES = [
  'garantizan 100', 'garantizas 100', 'resultado garantizado', 'garantia de resultados',
  'tienen certificacion soc', 'estan certificados iso', 'cumplen gdpr',
  'que certificaciones tienen', 'aseguran cumplimiento', 'fecha garantizada de entrega',
];

function matches(text: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => containsPhrase(text, phrase));
}

function scoreEntry(text: string, entry: DonnaEntry): number {
  const words = normalize(text).split(' ').filter(Boolean);
  const spans: { start: number; length: number }[] = [];
  for (const phrase of new Set([...entry.keywords, entry.label].map(normalize))) {
    const parts = phrase.split(' ').filter(Boolean);
    for (let start = 0; parts.length && start <= words.length - parts.length; start += 1) {
      if (parts.every((part, offset) => part === words[start + offset])) {
        spans.push({ start, length: parts.length });
        break;
      }
    }
  }
  spans.sort((a, b) => b.length - a.length || a.start - b.start);
  const used = new Set<number>();
  let score = 0;
  for (const span of spans) {
    if (Array.from({ length: span.length }, (_, index) => span.start + index).some((index) => used.has(index))) {
      continue;
    }
    for (let index = span.start; index < span.start + span.length; index += 1) used.add(index);
    score += span.length;
  }
  return score;
}

type Routing =
  | { kind: 'matched'; entry: DonnaEntry }
  | { kind: 'ambiguous'; candidates: DonnaEntry[] }
  | { kind: 'unknown' };

export function routeMessage(message: string): Routing {
  const scored = LCH_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreEntry(message, entry) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return { kind: 'unknown' };
  const leaders = scored.filter((candidate) => candidate.score === scored[0].score);
  return leaders.length === 1
    ? { kind: 'matched', entry: leaders[0].entry }
    : { kind: 'ambiguous', candidates: leaders.map((candidate) => candidate.entry) };
}

function safeRedirect(reply: string, kind: DonnaReplyKind = 'redirect'): DonnaReply {
  return { reply, kind, links: [CONTACT_LINK], suggestedInterest: 'Otro' };
}

function clarifiedAlready(messages: readonly DonnaMessage[]): boolean {
  return messages.some((message) =>
    message.role === 'assistant' && message.content.includes(CLARIFICATION_MARKER));
}

function buildGrounded(entry: DonnaEntry): DonnaReply {
  // Donna POC principle: facts are app-controlled. No generative completion
  // can invent claims, prices, dates, links or authentication actions.
  const content = entry.facts.join('\n\n');
  const reply = entry.followUp ? `${content}\n\n${entry.followUp}` : content;
  return {
    reply,
    kind: 'grounded',
    links: [...entry.links],
    suggestedInterest: entry.interest,
  };
}

export function respondToDonna(messages: readonly DonnaMessage[]): DonnaReply {
  const latest = messages[messages.length - 1]?.content ?? '';
  if (matches(latest, ACCOUNT_BOUNDARIES)) {
    return safeRedirect('Por seguridad, no puedo consultar cuentas, credenciales ni datos privados. Evita compartirlos por chat. El equipo de LCH puede orientarte por el formulario.');
  }
  if (matches(latest, PRICING_BOUNDARIES)) {
    return safeRedirect('El alcance y el precio dependen del proceso, las integraciones y los requisitos. No tengo una tarifa verificada para cotizar aquí. Puedes describir tu caso al equipo de LCH.', 'decline');
  }
  if (matches(latest, UNSUPPORTED_BOUNDARIES)) {
    return safeRedirect('No tengo evidencia suficiente para confirmar esa garantía, certificación o compromiso. Prefiero no afirmarlo sin una revisión del equipo.', 'decline');
  }
  if (GREETINGS.has(normalize(latest))) {
    return {
      reply: '¡Hola! Soy Donna, la guía conversacional de LCH. Puedo ayudarte a explorar automatización, IA aplicada, software, cloud y productos como LUMA e I-DO. ¿Qué te gustaría mejorar?',
      kind: 'greeting',
      links: [],
      suggestedInterest: 'Otro',
    };
  }
  const routed = routeMessage(latest);
  if (routed.kind === 'matched') return buildGrounded(routed.entry);
  if (routed.kind === 'ambiguous') {
    if (clarifiedAlready(messages)) {
      return safeRedirect('Quiero orientarte con precisión. Para no elegir un tema equivocado, puedes compartir los detalles con el equipo mediante el formulario.');
    }
    const options = routed.candidates.slice(0, 4).map((candidate) => candidate.label);
    return {
      kind: 'clarify',
      reply: `${CLARIFICATION_MARKER} Puedo ayudarte con: ${options.join(', ')}. ¿Cuál quieres explorar primero?`,
      links: [],
      suggestedInterest: 'Otro',
    };
  }
  return safeRedirect('Todavía no tengo información verificada para responder esa pregunta. Puedo orientarte sobre las soluciones de LCH o conectarte con una persona mediante el formulario.');
}

export function parseDonnaRequest(input: unknown): ParseResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, reason: 'El cuerpo de la solicitud debe ser un objeto JSON.' };
  }
  const data = input as Record<string, unknown>;
  if (!Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > DONNA_LIMITS.maxMessages) {
    return { ok: false, reason: 'La conversación debe contener entre 1 y 20 mensajes.' };
  }
  const messages: DonnaMessage[] = [];
  for (const value of data.messages) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { ok: false, reason: 'Mensaje inválido.' };
    }
    const candidate = value as Record<string, unknown>;
    if ((candidate.role !== 'assistant' && candidate.role !== 'user') || typeof candidate.content !== 'string') {
      return { ok: false, reason: 'El mensaje debe incluir rol y texto válidos.' };
    }
    const content = candidate.content.trim();
    if (!content || content.length > DONNA_LIMITS.maxMessageChars) {
      return { ok: false, reason: 'Cada mensaje debe tener entre 1 y 2000 caracteres.' };
    }
    messages.push({ role: candidate.role, content });
  }
  if (messages[messages.length - 1].role !== 'user') {
    return { ok: false, reason: 'El último mensaje debe provenir del usuario.' };
  }
  return { ok: true, messages };
}

export function isDonnaReply(value: unknown): value is DonnaReply {
  if (!value || typeof value !== 'object') return false;
  const reply = value as Record<string, unknown>;
  const allowedKinds: DonnaReplyKind[] = ['greeting', 'grounded', 'clarify', 'redirect', 'decline'];
  return typeof reply.reply === 'string' && reply.reply.length > 0
    && reply.reply.length <= DONNA_LIMITS.maxReplyChars
    && allowedKinds.includes(reply.kind as DonnaReplyKind)
    && Array.isArray(reply.links)
    && reply.links.every((link) => typeof link?.label === 'string' && typeof link?.url === 'string')
    && typeof reply.suggestedInterest === 'string'
    && INTEREST_AREAS.includes(reply.suggestedInterest as InterestArea);
}
