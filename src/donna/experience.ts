/**
 * GH-21 product copy: user-activated exploration only.
 * All prompts are verified against LCH's deterministic Donna knowledge router.
 * Never mix prospect messages with automatically generated/rotating text.
 */
import type { InterestArea } from '../integrations/leadContract';
import type { DonnaReplyKind } from './engine';

export type DonnaIdea = {
  id: string;
  eyebrow: string;
  question: string;
  context: string;
  action: string;
  prompt: string;
  expectedInterest: InterestArea;
};

export type DonnaSuggestedPrompt = {
  label: string;
  message: string;
};

export const DONNA_IDEA_ROTATION_MS = 5_800;

export const DONNA_IDEAS: readonly DonnaIdea[] = [
  {
    id: 'operations',
    eyebrow: 'Operaciones más simples',
    question: '¿Qué tarea repetitiva te gustaría agilizar?',
    context: 'Explora cómo conectar pasos y automatizar procesos cotidianos.',
    action: 'Explorar automatización',
    prompt: '¿Cómo puede LCH ayudarme a automatizar tareas manuales?',
    expectedInterest: 'Automatización',
  },
  {
    id: 'knowledge',
    eyebrow: 'Conocimiento accesible',
    question: '¿Tu equipo necesita respuestas basadas en documentos?',
    context: 'Conoce soluciones que relacionan consultas y evidencia verificable.',
    action: 'Explorar Evidence AI',
    prompt: '¿Cómo funciona Evidence AI para buscar en documentos?',
    expectedInterest: 'LCH Evidence AI',
  },
  {
    id: 'learning',
    eyebrow: 'Aprendizaje inteligente',
    question: '¿Cómo sería aprender con un camino personalizado?',
    context: 'Descubre LUMA y su enfoque de progreso respaldado por evidencia.',
    action: 'Conocer LUMA',
    prompt: '¿Qué hace LUMA?',
    expectedInterest: 'Software Empresarial',
  },
  {
    id: 'products',
    eyebrow: 'Productos LCH',
    question: '¿Quieres ver productos que ya puedes explorar?',
    context: 'Compara el enfoque de aprendizaje de LUMA y el de operaciones de I-DO.',
    action: 'Ver LUMA e I-DO',
    prompt: '¿Qué hacen LUMA e I-DO?',
    expectedInterest: 'Software Empresarial',
  },
  {
    id: 'ai',
    eyebrow: 'IA aplicada',
    question: '¿Por dónde empezar a aplicar IA en tu negocio?',
    context: 'Explora asistentes, automatización y conocimiento empresarial.',
    action: 'Explorar IA',
    prompt: '¿Qué soluciones de inteligencia artificial ofrece LCH?',
    expectedInterest: 'Inteligencia Artificial',
  },
] as const;

const CONTEXTUAL_PROMPTS: Partial<Record<InterestArea, readonly DonnaSuggestedPrompt[]>> = {
  'Automatización': [
    { label: '¿Y si integramos IA?', message: '¿Qué soluciones de inteligencia artificial ofrece LCH?' },
    { label: 'Consultar documentos con evidencia', message: '¿Cómo funciona Evidence AI para buscar en documentos?' },
  ],
  'Inteligencia Artificial': [
    { label: 'Automatizar procesos', message: '¿Cómo puede LCH ayudarme a automatizar tareas manuales?' },
    { label: 'Conocer Evidence AI', message: '¿Cómo funciona Evidence AI para buscar en documentos?' },
  ],
  'Software Empresarial': [
    { label: 'Conocer LUMA e I-DO', message: '¿Qué hacen LUMA e I-DO?' },
    { label: 'Explorar cloud', message: '¿Qué soluciones de Cloud ofrece LCH?' },
  ],
  'Cloud': [
    { label: 'Software empresarial', message: '¿Qué soluciones de software empresarial ofrece LCH?' },
    { label: 'Automatización', message: '¿Cómo automatizar procesos manuales con LCH?' },
  ],
  'LCH Evidence AI': [
    { label: 'Ver Evidencia Jurídica', message: '¿Qué hace Evidencia Jurídica?' },
    { label: 'IA para empresas', message: '¿Qué soluciones de inteligencia artificial ofrece LCH?' },
  ],
};

export function contextualPrompts(
  kind: DonnaReplyKind | undefined,
  interest: InterestArea | undefined,
  lastQuestion: string,
): readonly DonnaSuggestedPrompt[] {
  if (kind === 'greeting') {
    return [
      { label: 'Automatizar procesos', message: DONNA_IDEAS[0].prompt },
      { label: 'IA aplicada', message: DONNA_IDEAS[4].prompt },
    ];
  }
  if (kind !== 'grounded' || !interest || interest === 'Otro') return [];
  // These are suggestions for further exploration, not generated follow-up
  // questions or automatic replies. Avoid suggesting exactly what was asked.
  const previous = lastQuestion.trim().toLocaleLowerCase('es');
  return (CONTEXTUAL_PROMPTS[interest] ?? [])
    .filter((item) => item.message.toLocaleLowerCase('es') !== previous)
    .slice(0, 2);
}
