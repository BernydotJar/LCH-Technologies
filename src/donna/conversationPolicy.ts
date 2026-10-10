/**
 * GH-23: deterministic boundaries between exploration and contact intake.
 * The user can ask business questions freely; explicit contact requests and
 * volunteered contact details stay in the local React helper.
 */
import { normalize, type DonnaMessage } from './engine.ts';
import { containsOutOfSchemaPrivateData, containsPersonalContactData, extractSemanticContact } from '../contact/semanticDraft.ts';
import { countContactFields, missingContactFields, type ContactDraft } from '../contact/semanticContract.ts';

export type HistoryTurn = DonnaMessage & { private?: boolean };

const DIRECT_CONTACT_INTENTS = [
  /\b(?:quiero|necesito|quisiera|deseo|busco|me gustaria|me encantaria)\s+(?:hablar|conversar)\s+(?:con\s+)?(?:alguien|una persona|un asesor|un humano|el equipo|su equipo|ustedes|ventas|lch)\b/u,
  /\b(?:quiero|necesito|quisiera|deseo|busco|me gustaria|me encantaria)\s+(?:contactar(?:me)?|agendar|reservar|programar)\b/u,
  /\b(?:quiero|necesito|quisiera|deseo|busco|me gustaria)\s+(?:una?\s+)?(?:cotizacion|propuesta|demostracion|demo|reunion|llamada|asesoria|consulta comercial)\b/u,
  /\b(?:me pueden|pueden|podrian|podemos)\s+(?:contactar|llamar|agendar una reunion|agendar una llamada)\b/u,
  /\b(?:contactenme|contactame|contactarme|agendemos una reunion|agendemos una llamada|hablar con el equipo|hablar con ventas|hablar con lch|hablar con una persona)\b/u,
  /\b(?:quiero|necesito|quisiera)\s+(?:que\s+)?(?:me\s+)?(?:contacten|llamen|escriban)\b/u,
  /\b(?:llenar|completar|preparar|enviar)\s+(?:el|un|mi|una)?\s*(?:formulario|solicitud de contacto)\b/u,
];

export function isDirectContactIntent(text: string): boolean {
  const value = normalize(text);
  // Discussing a feature or asking a price is not the same as authorizing a
  // guided personal-data collection flow.
  if (/\b(?:como|que|cual|por que)\s+(?:puedo|se|hacer|funciona|cuesta|es)\b/u.test(value)
      && !/\b(?:quiero|necesito|quisiera|agendemos)\b/u.test(value)) {
    return false;
  }
  return DIRECT_CONTACT_INTENTS.some((pattern) => pattern.test(value));
}

export function isSensitiveContactText(text: string): boolean {
  if (containsPersonalContactData(text) || containsOutOfSchemaPrivateData(text)) return true;
  const proposal = extractSemanticContact(text);
  return ['nombre', 'apellido', 'email', 'empresa', 'cargo'].some((key) => key in proposal);
}

/**
 * Only public, non-contact turns are sent to the existing grounded chat
 * endpoint. Even after returning from intake, private user text and local
 * assistant questions stay in memory only.
 */
export function safeKnowledgeHistory(turns: readonly HistoryTurn[], limit: number): DonnaMessage[] {
  return turns
    .filter((turn) => !turn.private && !isSensitiveContactText(turn.content))
    .slice(-Math.max(1, limit))
    .map(({ role, content }) => ({ role, content }));
}

export function contactIntro(draft: ContactDraft): string {
  const missing = missingContactFields(draft);
  if (!missing.length) {
    return 'Ya tenemos los datos básicos. Puedes revisarlos o corregirlos antes de enviar la solicitud.';
  }
  if (!countContactFields(draft)) {
    return `Con gusto. Te ayudo a preparar la solicitud. Empecemos: ${missing[0].question}`;
  }
  return `Ya tengo parte de tu solicitud. Para continuar, ${missing[0].question}`;
}

export function contactProgressLabel(draft: ContactDraft): string {
  const count = countContactFields(draft);
  return count === 0 ? 'Empecemos' : count >= 6 ? 'Datos listos' : `${count}/6 datos`;
}

export function contactAnswerFeedback(draft: ContactDraft, recognized: boolean, invalidPrivate = false): string {
  const remaining = missingContactFields(draft);
  if (!recognized) {
    return invalidPrivate
      ? `Ese dato no forma parte del formulario y no lo incorporaré. ${remaining[0]?.question ?? 'Puedes revisar tu solicitud.'}`
      : `No pude validar ese dato. ${remaining[0]?.question ?? 'Puedes revisarlo directamente en el formulario.'}`;
  }
  if (!remaining.length) {
    return 'Ya tenemos los datos básicos. Revísalos antes de autorizar el envío.';
  }
  return `Anotado. ${remaining[0].question}`;
}
