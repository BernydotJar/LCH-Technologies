import { contactAnswerFeedback, contactIntro, contactProgressLabel } from './conversationPolicy.ts';
import { containsOutOfSchemaPrivateData } from '../contact/semanticDraft.ts';
import { missingContactFields, countContactFields, normalizeContactDraft, type ContactDraft, type ContactField } from '../contact/semanticContract.ts';
import type { Locale } from '../i18n/messages.ts';

const questions: Record<ContactField, readonly [string, string]> = {
  nombre: ['What is your first name?', 'Qual é seu nome?'],
  apellido: ['What is your last name?', 'Qual é seu sobrenome?'],
  email: ['Which email address can we reply to?', 'Em qual e-mail podemos responder?'],
  empresa: ['Which organization do you work for?', 'Em qual organização você trabalha?'],
  cargo: ['What is your role or job title?', 'Qual é seu cargo ou função?'],
  interes: ['Is your main interest AI, automation, software, cloud, Evidence AI, or something else?', 'Seu interesse principal é IA, automação, software, nuvem, Evidence AI ou outro?'],
  mensaje: ['What outcome would you like to achieve? (optional)', 'Que resultado você gostaria de alcançar? (opcional)'],
};
const translations: Record<Exclude<Locale, 'es'>, {
  first: string; partial: string; ready: string; noted: string;
  unrecognized: string; rejected: string; review: string;
  start: string; complete: string; readyProgress: string; count: string;
  correction: string; cancel: string;
}> = {
  en: {
    first: 'Sure. I can help you prepare your request. Let’s begin:',
    partial: 'I have some of your details. To continue:',
    ready: 'We have your basic details. You can review or edit them before submitting the request.',
    noted: 'Recorded.',
    unrecognized: 'I could not validate that detail.',
    rejected: 'That information is not part of the contact form and will not be added.',
    review: 'You can review your request in the contact form.',
    start: 'Let’s start', complete: 'Details ready', readyProgress: 'details',
    count: 'details', correction: 'You can review the permitted fields.',
    cancel: 'Okay. Back to exploring LCH solutions. Your draft remains in this session; nothing has been sent.',
  },
  pt: {
    first: 'Claro. Posso ajudar a preparar sua solicitação. Vamos começar:',
    partial: 'Já tenho parte dos seus dados. Para continuar:',
    ready: 'Já temos os dados básicos. Você pode revisá-los ou corrigi-los antes de enviar a solicitação.',
    noted: 'Registrado.',
    unrecognized: 'Não consegui validar essa informação.',
    rejected: 'Essa informação não faz parte do formulário e não será incluída.',
    review: 'Você pode revisar sua solicitação no formulário.',
    start: 'Vamos começar', complete: 'Dados prontos', readyProgress: 'dados',
    count: 'dados', correction: 'Você pode revisar os campos permitidos.',
    cancel: 'Certo. Voltamos a explorar as soluções da LCH. Seu rascunho permanece nesta sessão; nenhum dado foi enviado.',
  },
};
export function localContactQuestion(locale: Locale, field: ContactField): string {
  return locale === 'es' ? ({
    nombre: '¿Cuál es tu nombre?', apellido: '¿Cuál es tu apellido?',
    email: '¿A qué correo electrónico podemos responder?', empresa: '¿En qué organización trabajas?',
    cargo: '¿Cuál es tu cargo o función?',
    interes: '¿Tu interés principal es IA, automatización, software, cloud, Evidence AI u otro?',
    mensaje: '¿Qué resultado te gustaría conseguir? (opcional)',
  })[field] : questions[field][locale === 'en' ? 0 : 1];
}
export function localContactIntro(locale: Locale, draft: ContactDraft): string {
  if (locale === 'es') return contactIntro(draft);
  const missing = missingContactFields(draft);
  const tr = translations[locale];
  if (!missing.length) return tr.ready;
  return (countContactFields(draft) ? tr.partial : tr.first) + ' ' + localContactQuestion(locale, missing[0].name);
}
export function localContactFeedback(locale: Locale, draft: ContactDraft, recognized: boolean, invalidPrivate = false): string {
  if (locale === 'es') return contactAnswerFeedback(draft, recognized, invalidPrivate);
  const remaining = missingContactFields(draft);
  const tr = translations[locale];
  if (!recognized) return (invalidPrivate ? tr.rejected : tr.unrecognized)
    + ' ' + (remaining.length ? localContactQuestion(locale, remaining[0].name) : tr.review);
  if (!remaining.length) return tr.ready;
  return tr.noted + ' ' + localContactQuestion(locale, remaining[0].name);
}
export function localContactProgress(locale: Locale, draft: ContactDraft): string {
  if (locale === 'es') return contactProgressLabel(draft);
  const count = countContactFields(draft);
  const tr = translations[locale];
  return count === 0 ? tr.start : count >= 6 ? tr.complete : count + '/6 ' + tr.count;
}
export function localContactCancel(locale: Locale): string {
  return locale === 'es'
    ? 'De acuerdo. Volvemos a explorar las soluciones de LCH. Conservé el borrador en esta sesión, sin enviar ningún dato.'
    : translations[locale].cancel;
}
export function localContactUnsupported(locale: Locale, draft: ContactDraft): string {
  const next = missingContactFields(draft)[0];
  if (locale === 'es') return 'Ese dato no forma parte del formulario. No lo enviaré ni lo incorporaré a tu solicitud. ' + (next?.question ?? 'Puedes revisar los campos permitidos.');
  return translations[locale].rejected + ' ' + (next ? localContactQuestion(locale, next.name) : translations[locale].correction);
}
/** Explicit validated guided interests; canonical Spanish values are retained in Firestore. */
export function localizedInterestAnswer(locale: Locale, expected: ContactField | undefined, text: string): ContactDraft {
  if (!expected || locale === 'es' || containsOutOfSchemaPrivateData(text)) return {};
  const input = text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim();
  if (expected === 'interes') {
    const possibilities: readonly [RegExp, string][] = [
      [/^(?:ai|artificial intelligence|inteligencia artificial|ia)$/u, 'Inteligencia Artificial'],
      [/^(?:automation|automacao|process automation)$/u, 'Automatización'],
      [/^(?:software|enterprise software|software empresarial)$/u, 'Software Empresarial'],
      [/^(?:cloud|nuvem|cloud solutions)$/u, 'Cloud'],
      [/^(?:evidence ai|legal ai|evidencia juridica)$/u, 'LCH Evidence AI'],
      [/^(?:other|outro|not sure)$/u, 'Otro'],
    ];
    const interest = possibilities.find(([matcher]) => matcher.test(input))?.[1];
    return interest ? normalizeContactDraft({ interes: interest }) : {};
  }
  if (expected === 'cargo' && /^[\p{L}][\p{L}\s./-]{1,79}$/u.test(text.trim())
    && !/\b(?:password|senha|api key|token|secret|segredo)\b/iu.test(text)) {
    return normalizeContactDraft({ cargo: text.trim() });
  }
  return {};
}
