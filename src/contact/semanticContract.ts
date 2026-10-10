/**
 * GH-22: One declarative contract for semantic preparation of the LCH form.
 * It describes ALLOWED fields, not DOM selectors. No agent or model has a
 * submit tool, access to an email sender, or write permission to consentimiento.
 */
import { INTEREST_AREAS, type DemoRequest } from '../integrations/leadContract.ts';

export type ContactField = Exclude<keyof DemoRequest, 'consentimiento'>;
export type ContactDraft = Partial<Pick<DemoRequest, ContactField>>;

export type ContactFieldDefinition = {
  name: ContactField;
  label: string;
  description: string;
  question: string;
  required: boolean;
  maxLength: number;
};

export const CONTACT_FIELDS: readonly ContactFieldDefinition[] = [
  { name: 'nombre', label: 'Nombre', description: 'Nombre de pila de la persona que solicita contacto, solo si lo proporcionó.', question: '¿Cuál es tu nombre?', required: true, maxLength: 80 },
  { name: 'apellido', label: 'Apellido', description: 'Apellido(s) del contacto; no inventes uno si falta.', question: '¿Cuál es tu apellido?', required: true, maxLength: 80 },
  { name: 'email', label: 'Correo electrónico', description: 'Correo válido para responder la solicitud. No inferirlo a partir de la empresa.', question: '¿A qué correo electrónico podemos responder?', required: true, maxLength: 254 },
  { name: 'empresa', label: 'Organización', description: 'Nombre de la empresa u organización proporcionado por la persona.', question: '¿En qué organización trabajas?', required: true, maxLength: 160 },
  { name: 'cargo', label: 'Rol', description: 'Cargo o función de la persona; no deducirlo de su correo.', question: '¿Cuál es tu cargo o función?', required: true, maxLength: 160 },
  { name: 'interes', label: 'Área de interés', description: 'Una de las áreas comerciales que admite el formulario existente.', question: '¿Tu interés principal es IA, automatización, software, cloud, Evidence AI u otro?', required: true, maxLength: 80 },
  { name: 'mensaje', label: 'Resultado esperado', description: 'Reto o resultado empresarial expresado por la persona, sin duplicar datos personales.', question: '¿Qué resultado te gustaría conseguir? (opcional)', required: false, maxLength: 2000 },
] as const;

export const CONTACT_FIELD_BY_NAME = Object.fromEntries(CONTACT_FIELDS.map((field) => [field.name, field])) as Record<ContactField, ContactFieldDefinition>;
export const CONTACT_REQUIRED_FIELDS = CONTACT_FIELDS.filter((field) => field.required);
export const CONTACT_FIELD_NAMES = CONTACT_FIELDS.map((field) => field.name);

// A machine-readable tool signature that can later be attached to an LLM or
// MCP adapter. In Donna V1 it drives deterministic, local slot interpretation.
// The tool PREPARES data; it cannot submit or approve processing.
export const PREPARE_CONTACT_TOOL = {
  name: 'prepare_lch_contact_form',
  description: 'Prepara un borrador del formulario comercial de LCH usando únicamente datos expresados por la persona. Omite datos desconocidos. Nunca lo envíes ni marques consentimiento.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      nombre: { type: 'string', maxLength: 80, description: 'Nombre explícitamente proporcionado.' },
      apellido: { type: 'string', maxLength: 80, description: 'Apellido explícitamente proporcionado.' },
      email: { type: 'string', format: 'email', maxLength: 254, description: 'Correo proporcionado, no generado.' },
      empresa: { type: 'string', maxLength: 160, description: 'Organización proporcionada.' },
      cargo: { type: 'string', maxLength: 160, description: 'Rol indicado expresamente.' },
      interes: { type: 'string', enum: [...INTEREST_AREAS], description: 'Área comercial explícita o claramente expresada.' },
      mensaje: { type: 'string', maxLength: 2000, description: 'Objetivo empresarial expresado, sin contraseñas ni otros datos sensibles.' },
    },
  },
} as const;

const CONTACT_NAMES = new Set<string>(CONTACT_FIELD_NAMES);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanValue(value: string): string {
  return value.replace(/\p{Cf}/gu, '').trim().replace(/\s+/g, ' ');
}

export function normalizeContactDraft(input: unknown): ContactDraft {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const result: ContactDraft = {};
  for (const [name, inputValue] of Object.entries(input)) {
    if (!CONTACT_NAMES.has(name) || typeof inputValue !== 'string') continue;
    const field = CONTACT_FIELDS.find((item) => item.name === name);
    if (!field) continue;
    const value = cleanValue(inputValue);
    if (!value || value.length > field.maxLength) continue;
    if (name === 'email' && !EMAIL.test(value)) continue;
    if (name === 'interes' && !INTEREST_AREAS.includes(value as typeof INTEREST_AREAS[number])) continue;
    result[name as ContactField] = name === 'email' ? value.toLowerCase() : value;
  }
  return result;
}

export function mergeContactDraft(current: ContactDraft, proposal: unknown): ContactDraft {
  return { ...current, ...normalizeContactDraft(proposal) };
}

/** Human edits always win. The assistant may only fill empty string fields. */
export function applyContactDraft(current: DemoRequest, proposal: unknown): DemoRequest {
  const patch = normalizeContactDraft(proposal);
  const next = { ...current };
  for (const field of CONTACT_FIELDS) {
    const value = patch[field.name];
    if (typeof value === 'string' && !next[field.name].trim()) next[field.name] = value;
  }
  return next;
}

export function missingContactFields(draft: ContactDraft): ContactFieldDefinition[] {
  const cleaned = normalizeContactDraft(draft);
  return CONTACT_REQUIRED_FIELDS.filter(({ name }) => !cleaned[name]);
}

export function countContactFields(draft: ContactDraft): number {
  return Object.keys(normalizeContactDraft(draft)).filter((key) => key !== 'mensaje').length;
}
