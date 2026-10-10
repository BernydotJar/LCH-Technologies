/**
 * GH-22 local, bounded semantic slot extraction from voluntarily supplied text.
 * This is deterministic (not a hidden LLM). It consumes semantic field names,
 * never the DOM and never writes to Firestore.
 */
import type { DonnaMessage } from '../donna/engine';
import type { InterestArea } from '../integrations/leadContract';
import {
  CONTACT_FIELDS,
  mergeContactDraft,
  normalizeContactDraft,
  type ContactDraft,
  type ContactField,
} from './semanticContract.ts';

const EMAIL = /[\p{L}\d._%+-]+@[\p{L}\d.-]+\.[a-zA-Z]{2,}/u;
const JOB_START = /^(?:el|la|un|una)?\s*(?:directora?|gerente|ceo|cto|cio|coo|cfo|presidente|fundadora?|dueña?|propietaria?|ingeniera?|consultora?|analista|coordinadora?|líder|lider|responsable|administradora?|desarrolladora?|arquitecta?)(?:\b|\s)/iu;
const NAMES = /^[\p{L}\p{M}'\-]+(?:\s+[\p{L}\p{M}'\-]+){0,7}$/u;
const NON_PERSON = /^(?:(?:una?|el|la)\s+)?(?:empresa|agencia|organización|organizacion|equipo|cliente|estudiante|modelo|software|robot|agente)\b/iu;

function clean(input: string): string {
  return input.replace(/\p{Cf}/gu, '').trim().replace(/\s+/g, ' ');
}

function sliceSegment(input: string): string {
  // Respect sentence and semantic field boundaries instead of consuming later
  // identity and organization facts as part of a person's surname or role.
  return clean(input.split(/[\n,;!?]|\.\s+(?=[\p{Lu}])/u, 1)[0] ?? '')
    .replace(/\s+(?:y\s+)?(?:mi correo|correo|mi email|mi cargo|mi rol|trabajo en|trabajo para|trabajo como|laboro en|laboro para|colaboro en|represento a|mi empresa|mi organizacion|mi organización|mi nombre|me llamo|soy|necesito|necesitamos|queremos|quiero|busco|me interesa|nos interesa|escribeme|escríbeme|para contactarme|en la empresa|de la empresa)\b.*$/iu, '')
    .trim()
    .replace(/[.\s]+$/u, '');
}

/** A clearly marked company suffix is not part of the person's surname.
 * Unmarked surnames such as "de la Cruz" remain unchanged. */
function extractNameAndClearOrganization(raw: string): ContactDraft {
  const segment = sliceSegment(raw);
  const companySuffix = segment.match(/^(.+?)\s+de\s+([\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .-]{1,100}\b(?:Corp(?:oration)?|LLC|Inc|Ltd|Technologies|Tech|GmbH|S\.?A\.?))$/iu);
  if (companySuffix) return { ...nameParts(companySuffix[1]), empresa: clean(companySuffix[2]) };
  return nameParts(segment);
}

function nameParts(text: string): ContactDraft {
  const normalized = sliceSegment(text).replace(/^(?:el|la)\s+/iu, '');
  if (!NAMES.test(normalized) || JOB_START.test(normalized) || NON_PERSON.test(normalized)) return {};
  const words = normalized.split(' ');
  if (words.length >= 2) {
    return { nombre: words[0], apellido: words.slice(1).join(' ') };
  }
  return { nombre: normalized };
}

function capture(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match?.[1] ? sliceSegment(match[1]) : '';
}

export function inferContactInterest(raw: string): InterestArea | undefined {
  const text = clean(raw).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const signals: Array<[InterestArea, RegExp]> = [
    ['LCH Evidence AI', /\bevidence ai\b|\bevidencia juridica\b|\brag (?:juridico|legal)\b|\bbusqueda con evidencia\b/u],
    ['Automatización', /automatiz|robotizar|\brpa\b|tareas manuales|procesos manuales|conciliacion bancaria|facturas repetitivas/u],
    ['Inteligencia Artificial', /inteligencia artificial|\bia\b|asistente inteligente|agentes de inteligencia artificial|chatbot|agente de ia/u],
    ['Cloud', /\bcloud\b|\bnube\b|\baws\b|\bgcp\b|\bfirebase\b|migracion de servidores/u],
    ['Software Empresarial', /\bsoftware\b|\bsaas\b|\bluma\b|\bi.do\b|crear (?:una )?(?:app|plataforma|aplicacion)|desarrollar (?:una )?(?:app|plataforma|aplicacion)|sistema empresarial/u],
  ];
  const hits = signals.filter(([, regex]) => regex.test(text)).map(([interest]) => interest);
  return hits.length === 1 ? hits[0] : undefined;
}

function extractBusinessNeed(raw: string): string | undefined {
  const text = clean(raw);
  const possible = text.match(/\b(?:necesito|necesitamos|quiero|queremos|busco|buscamos|deseo|deseamos|quisiera|me interesa|nos interesa|nos gustaria|nos gustaría|nuestro reto es|mi reto es|el problema es)\b[^,;.!?\n]*/iu);
  if (!possible?.[0]) return;
  let proposal = sliceSegment(possible[0]);
  proposal = proposal.replace(EMAIL, '').replace(/\s+(?:y\s+)?(?:me llamo|mi nombre|mi correo|mi email|mi tel[eé]fono|mi whatsapp|mi dpi|mi contrase(?:n|ñ)a|mi clave|soy\s+(?:ceo|cto|gerente|directora?|el|la)|trabajo en|trabajo para)\b.*$/iu, '').trim();
  proposal = proposal.replace(/\s+y$/iu, '').trim();
  if (proposal.length < 14 || /^(?:quiero|necesito|busco|quisiera)\s+(?:hablar|contacto|una cita|una llamada|un presupuesto|mas informacion|más información)\b/iu.test(proposal)) {
    return;
  }
  if (/@|contrase(?:n|ñ)a|password|token|api.?key/iu.test(proposal)) return;
  return proposal.slice(0, 2000);
}

/** Infer only what was plainly stated; unknown or ambiguous values stay blank. */
export function extractSemanticContact(raw: string): ContactDraft {
  const text = clean(raw).slice(0, 2000);
  if (!text) return {};
  const patch: ContactDraft = {};
  const email = text.match(EMAIL)?.[0];
  if (email) patch.email = email.toLowerCase();

  const labelledName = capture(text, /\b(?:me llamo|mi nombre es|nombre completo:?)\s+([^\n]+)/iu);
  const shortName = labelledName || capture(text, /(?:^|[,;]\s*)soy\s+([\p{L}][^,;\n]+)/iu);
  if (shortName && !JOB_START.test(shortName) && !NON_PERSON.test(shortName)) Object.assign(patch, extractNameAndClearOrganization(shortName));

  const first = capture(text, /(?:^|[,;]\s*)(?:nombre|nombre de pila):\s*([^,;\n]+)/iu);
  const last = capture(text, /\b(?:mi apellido es|apellidos?:)\s+([^,;\n]+)/iu);
  if (first && NAMES.test(first) && !JOB_START.test(first)) patch.nombre = first;
  if (last && NAMES.test(last)) patch.apellido = last;

  const company = capture(text, /\b(?:mi empresa (?:es|se llama)|mi organizaci[oó]n (?:es|se llama)|trabajo (?:en|para)|laboro (?:en|para)|colaboro en|represento a|de la empresa|empresa:)\s+([^,;\n]+)/iu)
    || capture(text, /\b(?:soy\s+(?:el|la|un|una)?\s*)?(?:cto|ceo|cio|coo|cfo|directora?|gerente|fundadora?)\b[^,;.!?\n]{0,100}?\s+en\s+([\p{L}][^,;.!?\n]+)/iu);
  if (company && !JOB_START.test(company) && !/@/.test(company) && !/^automatizar\b/i.test(company)) {
    patch.empresa = company.replace(/\s+(?:como|en calidad de|con el cargo de)\s+.+$/iu, '').trim();
  }

  let cargo = capture(text, /\b(?:mi cargo es|mi rol es|trabajo como|ocupo el puesto de|cargo:|soy\s+(?:el|la|un|una)?\s*)([^,;\n]+)/iu);
  if (!cargo || !JOB_START.test(cargo)) cargo = capture(text, /(?:^|[,;]\s*)((?:directora?|gerente|cto|ceo|coo|cio|cfo|fundadora?|consultora?)\b[^,;\n]*)/iu);
  if (!cargo || !JOB_START.test(cargo)) cargo = capture(text, /\bcomo\s+((?:directora?|gerente|cto|ceo|coo|cio|cfo|fundadora?|consultora?)\b[^,;\n]*)/iu);
  if (cargo) {
    const normalized = cargo.replace(/^(?:el|la|un|una)\s+/iu, '').replace(/\s+en\s+[^,;\n]+$/iu, '').replace(/\s+de$/iu, '').trim();
    if (JOB_START.test(normalized)) patch.cargo = normalized;
  }

  const interest = inferContactInterest(text);
  if (interest) patch.interes = interest;
  const need = extractBusinessNeed(text);
  if (need) patch.mensaje = need;
  return normalizeContactDraft(patch);
}

export function extractFromDonnaMessages(
  messages: readonly DonnaMessage[],
  suggestedInterest?: InterestArea,
): ContactDraft {
  let result: ContactDraft = {};
  for (const item of messages) {
    if (item.role === 'user') result = mergeContactDraft(result, extractSemanticContact(item.content));
  }
  if (!result.interes && suggestedInterest && suggestedInterest !== 'Otro') {
    result.interes = suggestedInterest;
  }
  return normalizeContactDraft(result);
}

const FIELD_PREFIXES: Partial<Record<ContactField, RegExp>> = {
  nombre: /^(?:me llamo|mi nombre es|nombre:?)\s+/iu,
  apellido: /^(?:mi apellido es|apellidos?:)\s+/iu,
  empresa: /^(?:trabajo en|mi empresa (?:es|se llama)|mi organizaci[oó]n (?:es|se llama)|empresa:?)\s+/iu,
  cargo: /^(?:mi cargo es|mi rol es|trabajo como|cargo:?)\s+/iu,
};

/** Explicit guided answer to the one requested field, validated by the same schema. */
export function readGuidedContactAnswer(expected: ContactField, raw: string): ContactDraft {
  const text = clean(raw).slice(0, 2100);
  if (!text) return {};
  const semantic = extractSemanticContact(text);
  if (containsOutOfSchemaPrivateData(text)) return semantic;
  // Never turn a whole multi-field sentence into a company or job just because
  // that slot was next: keep the explicit facts and ask again if needed.
  if (Object.keys(semantic).length > 0) return semantic;

  const prefix = FIELD_PREFIXES[expected];
  const value = clean(prefix ? text.replace(prefix, '') : text);
  if (!value || /@/.test(value) && expected !== 'email') return semantic;

  let proposal: ContactDraft = {};
  if (expected === 'email') {
    const mail = value.match(EMAIL);
    if (mail && mail[0] === value) proposal.email = value.toLowerCase();
  } else if (expected === 'interes') {
    const intent = inferContactInterest(value);
    if (intent) proposal.interes = intent;
    else if (/^(?:otro|no estoy seguro|no se|no sé)$/iu.test(value)) proposal.interes = 'Otro';
  } else if (expected === 'nombre') {
    if (NAMES.test(value) && !JOB_START.test(value)) proposal = nameParts(value);
  } else if (expected === 'apellido') {
    if (NAMES.test(value) && !JOB_START.test(value)) proposal.apellido = value;
  } else if ((expected === 'empresa' || expected === 'cargo') && value.length < 160 && !/\b(?:contraseña|password|token|api key)\b/iu.test(value)) {
    if (expected === 'cargo' && !JOB_START.test(value)) return semantic;
    proposal[expected] = value;
  } else if (expected === 'mensaje') {
    if (value.length >= 12) proposal.mensaje = value;
  }
  return mergeContactDraft(semantic, proposal);
}

export function containsPersonalContactData(text: string): boolean {
  return EMAIL.test(text) || /(?:me llamo|mi nombre es|mi apellido|mi correo|mi email|mi tel[eé]fono|mi cargo es|trabajo en|mi empresa es)\b/iu.test(text);
}

/** Values that are not part of the lead schema must remain in the browser.
 * This detects obvious volunteered credentials and identifiers, not every PII case.
 */
export function containsOutOfSchemaPrivateData(raw: string): boolean {
  const value = raw.normalize('NFKC');
  return /\b(?:mi|mis|el|la)\s+(?:tel[eé]fono|n[uú]mero de tel[eé]fono|whatsapp|dpi|documento de identidad|pasaporte|contrase(?:n|ñ)a|password|clave de acceso|api[ _-]?key|token de acceso|tarjeta de cr[eé]dito)\b/iu.test(value)
    || /\b(?:password|contrase(?:n|ñ)a|api[ _-]?key|secret(?:o|a)?|access[ _-]?token)\s*[:=]\s*\S+/iu.test(value);
}

export function safeContactMessageFromConversation(raw: string): string {
  const profile = extractSemanticContact(raw);
  const carriesIdentity = ['nombre', 'apellido', 'email', 'empresa', 'cargo'].some((field) => field in profile);
  return containsPersonalContactData(raw) || containsOutOfSchemaPrivateData(raw) || carriesIdentity
    ? profile.mensaje ?? ''
    : clean(raw).slice(0, 2000);
}
