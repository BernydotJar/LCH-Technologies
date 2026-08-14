export const LEAD_AUTOMATION_SCHEMA_VERSION = 'lch.lead.v1' as const;

export const INTEREST_AREAS = [
  'Inteligencia Artificial',
  'Automatización',
  'Software Empresarial',
  'Cloud',
  'LCH Evidence AI',
  'Otro',
] as const;

export type InterestArea = (typeof INTEREST_AREAS)[number];

export type DemoRequest = {
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  cargo: string;
  interes: string;
  mensaje: string;
  consentimiento: boolean;
};

export type NormalizedDemoRequest = Omit<DemoRequest, 'interes'> & {
  interes: InterestArea;
};

export type LeadPriority = 'HOT' | 'WARM' | 'LOW';

export type LeadScore = {
  score: number;
  priority: LeadPriority;
  reasons: string[];
};

export type LeadAutomationPayload = {
  schemaVersion: typeof LEAD_AUTOMATION_SCHEMA_VERSION;
  leadId: string;
  source: 'website';
  status: 'new';
  submittedAt: string;
  lead: NormalizedDemoRequest;
};

export type LeadValidationResult =
  | { valid: true; value: NormalizedDemoRequest }
  | { valid: false; errors: string[] };

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
]);

const SENIOR_ROLE_TERMS = [
  'ceo',
  'cto',
  'cio',
  'coo',
  'cdo',
  'chief',
  'director',
  'directora',
  'vp',
  'vice president',
  'gerente',
  'head',
  'presidente',
  'president',
  'owner',
  'fundador',
  'founder',
];

const STRATEGIC_INTERESTS = new Set<InterestArea>([
  'Inteligencia Artificial',
  'Automatización',
  'Software Empresarial',
  'LCH Evidence AI',
]);

const LIMITS = {
  nombre: 80,
  apellido: 80,
  email: 254,
  empresa: 160,
  cargo: 160,
  mensaje: 2000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateDemoRequest(request: DemoRequest): LeadValidationResult {
  const normalized = {
    nombre: clean(request.nombre),
    apellido: clean(request.apellido),
    email: normalizeEmail(request.email),
    empresa: clean(request.empresa),
    cargo: clean(request.cargo),
    interes: clean(request.interes),
    mensaje: request.mensaje.trim(),
    consentimiento: request.consentimiento,
  };

  const errors: string[] = [];

  for (const key of ['nombre', 'apellido', 'empresa', 'cargo'] as const) {
    if (!normalized[key]) errors.push(`${key} is required`);
    if (normalized[key].length > LIMITS[key]) errors.push(`${key} is too long`);
  }

  if (!normalized.email) errors.push('email is required');
  if (normalized.email.length > LIMITS.email) errors.push('email is too long');
  if (normalized.email && !EMAIL_PATTERN.test(normalized.email)) errors.push('email is invalid');

  if (!INTEREST_AREAS.includes(normalized.interes as InterestArea)) {
    errors.push('interes is invalid');
  }

  if (normalized.mensaje.length > LIMITS.mensaje) errors.push('mensaje is too long');
  if (normalized.consentimiento !== true) errors.push('consentimiento is required');

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    value: normalized as NormalizedDemoRequest,
  };
}

export function scoreLead(lead: NormalizedDemoRequest): LeadScore {
  let score = 0;
  const reasons: string[] = [];
  const domain = lead.email.split('@')[1] ?? '';
  const cargo = lead.cargo.toLowerCase();

  if (domain && !FREE_EMAIL_DOMAINS.has(domain)) {
    score += 2;
    reasons.push('corporate_email');
  }

  if (SENIOR_ROLE_TERMS.some((term) => cargo.includes(term))) {
    score += 3;
    reasons.push('decision_maker_role');
  }

  if (STRATEGIC_INTERESTS.has(lead.interes)) {
    score += 2;
    reasons.push('strategic_interest');
  }

  if (lead.mensaje.length >= 20) {
    score += 2;
    reasons.push('described_operational_challenge');
  }

  if (lead.empresa.length >= 3) {
    score += 1;
    reasons.push('company_identified');
  }

  const priority: LeadPriority = score >= 7 ? 'HOT' : score >= 4 ? 'WARM' : 'LOW';
  return { score, priority, reasons };
}

export function buildLeadAutomationPayload(
  leadId: string,
  lead: NormalizedDemoRequest,
  submittedAt = new Date().toISOString(),
): LeadAutomationPayload {
  if (!leadId.trim()) throw new Error('leadId is required');

  return {
    schemaVersion: LEAD_AUTOMATION_SCHEMA_VERSION,
    leadId: leadId.trim(),
    source: 'website',
    status: 'new',
    submittedAt,
    lead,
  };
}
