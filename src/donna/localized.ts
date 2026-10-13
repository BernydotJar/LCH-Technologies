/**
 * Curated translations of Donna's approved public knowledge, not an external
 * translation API or a generative rewriting layer. Server routing and security
 * boundaries remain deterministic in every supported language.
 */
import { routeMessage, respondToDonna, type DonnaMessage, type DonnaReply } from './engine.ts';
import type { Locale } from '../i18n/messages.ts';

type EntryTranslation = { facts: readonly [string, string]; followUp?: string };
type LanguageDictionary = Record<string, EntryTranslation>;
const en: LanguageDictionary = {
  overview: { facts: [
    'LCH Technologies develops applied AI, automation, enterprise software and cloud solutions for real business processes.',
    'We start by understanding your process and desired outcome, then assess architecture, integrations and how to measure impact.',
  ], followUp: 'Which process in your organization would you like to improve first?' },
  automation: { facts: [
    'LCH designs automation to reduce manual work, connect systems and preserve evidence of every operation.',
    'Examples include accounts payable, purchase orders, reconciliations, onboarding, support and document processing. Each case requires understanding its rules, exceptions and existing systems.',
  ], followUp: 'Which task takes up the most time or causes the most errors today?' },
  ai: { facts: [
    'LCH applies AI to business documents, knowledge, data and processes, including assistants and operational agents with human oversight.',
    'We prioritize answer traceability, verifiable evidence and clear limits when a system cannot verify a claim.',
  ], followUp: 'Is your opportunity mainly in documents, decisions or user interactions?' },
  evidence: { facts: [
    'LCH Evidence AI lets teams query corporate knowledge with traceable supporting evidence.',
    'The Legal Evidence demo focuses on regulations, citations and explicit confidence limits. For enterprise use, we first review sources and access permissions.',
  ], followUp: 'Which documents or sources do you need to search with confidence?' },
  software: { facts: [
    'LCH builds platforms and applications aligned with business processes and existing integrations.',
    'Our architecture considers maintainability, scalability, access controls and ongoing operations.',
  ], followUp: 'Are you building a new platform or improving an existing system?' },
  cloud: { facts: [
    'LCH designs cloud architectures to modernize applications and connect operations, considering scalability, security and observability.',
    'The right architecture depends on workloads, integrations and requirements; we do not select a provider before reviewing the use case.',
  ], followUp: 'Is your priority modernization, integration or deploying a new application?' },
  products: { facts: [
    'LCH presents distinct products: LUMA focuses on learning intelligence and evidence of progress through a Learning Twin, while I-DO brings operations, finance and business processes into a multi-tenant Business OS.',
    'We also showcase Legal Evidence, a regulations assistant supported by verifiable sources. You can explore the products on this website.',
  ], followUp: 'Are you interested in learning, enterprise operations or document search?' },
  luma: { facts: [
    'LUMA is an intelligent learning experience using a Learning Twin to connect objectives, progress and evidence of capabilities.',
    'You can try its onboarding demo. Adapting it to an educational program requires reviewing the institution’s teaching model and operations.',
  ], followUp: 'Would you explore LUMA as an education provider, coach or business?' },
  ido: { facts: [
    'I-DO is a governed multi-tenant enterprise platform for operations, finance and business processes.',
    'LCH offers a public preview of the experience. Integrations and scope are agreed with each organization.',
  ], followUp: 'Which part of your operation would you like to bring together?' },
  contact: { facts: [
    'You can submit an inquiry through LCH’s contact form, including your organization, area of interest and the outcome you are seeking.',
    'Submitting a request does not automatically book a meeting or guarantee a response date.',
  ], followUp: 'Would you like to review the context of this conversation in the form before sending it?' },
  privacy: { facts: [
    'LCH’s contact form asks for consent to record and manage a business inquiry.',
    'Do not share passwords, credentials, confidential documents or sensitive personal information in this chat. The LCH team can discuss specific data-processing terms with you.',
  ] },
  donna: { facts: [
    'I am Donna, LCH’s conversational guide. I answer using reviewed information on this site and can help you find a solution or reach the team.',
    'I cannot access private accounts or make reservations. Chatting alone does not send information to the team; you must explicitly submit the contact form.',
  ], followUp: 'Which business challenge would you like to explore?' },
};
const pt: LanguageDictionary = {
  overview: { facts: [
    'A LCH Technologies desenvolve IA aplicada, automação, software empresarial e soluções em nuvem para processos reais de negócio.',
    'Começamos entendendo o processo e o resultado esperado; depois avaliamos a arquitetura, as integrações e como medir o impacto.',
  ], followUp: 'Qual processo da sua organização você gostaria de melhorar primeiro?' },
  automation: { facts: [
    'A LCH desenvolve automações para reduzir o trabalho manual, conectar sistemas e registrar evidências de cada operação.',
    'Os exemplos incluem contas a pagar, pedidos de compra, conciliações, onboarding, suporte e gestão documental. Cada caso exige entender regras, exceções e sistemas existentes.',
  ], followUp: 'Qual tarefa consome mais tempo ou gera mais erros hoje?' },
  ai: { facts: [
    'A LCH aplica IA a documentos, conhecimento, dados e processos empresariais, incluindo assistentes e agentes operacionais com supervisão humana.',
    'Priorizamos rastreabilidade das respostas, evidências verificáveis e limites claros quando uma afirmação não pode ser confirmada.',
  ], followUp: 'A oportunidade está em documentos, decisões ou interação com usuários?' },
  evidence: { facts: [
    'O LCH Evidence AI permite consultar conhecimento corporativo com evidências rastreáveis.',
    'A demonstração Evidência Jurídica foca em normas, citações e limites explícitos de confiança. Para uso empresarial, primeiro revisamos fontes e permissões de acesso.',
  ], followUp: 'Quais documentos ou fontes você precisa consultar com confiança?' },
  software: { facts: [
    'A LCH cria plataformas e aplicativos alinhados a processos empresariais e integrações existentes.',
    'A arquitetura considera manutenção, escalabilidade, controle de acesso e operação após a entrega.',
  ], followUp: 'Você quer criar uma plataforma nova ou melhorar um sistema existente?' },
  cloud: { facts: [
    'A LCH projeta arquiteturas em nuvem para modernizar aplicativos e conectar operações, considerando escalabilidade, segurança e observabilidade.',
    'A arquitetura depende das cargas, integrações e requisitos específicos; não escolhemos um provedor antes de analisar o caso.',
  ], followUp: 'A prioridade é modernizar, integrar ou implantar uma nova aplicação?' },
  products: { facts: [
    'A LCH apresenta produtos com objetivos diferentes: a LUMA trabalha inteligência de aprendizagem e evidências de progresso com um Learning Twin; o I-DO reúne operações, finanças e processos em um Business OS multilocatário.',
    'Também oferecemos a demonstração Evidência Jurídica, com consultas normativas baseadas em fontes verificáveis. Você pode explorar os produtos neste site.',
  ], followUp: 'Seu interesse é aprendizagem, operações empresariais ou consulta documental?' },
  luma: { facts: [
    'A LUMA é uma experiência de aprendizagem inteligente que usa um Learning Twin para conectar objetivos, progresso e evidências de capacidades.',
    'Você pode experimentar a demonstração de onboarding. A aplicação em programas educacionais exige analisar o modelo de ensino e a operação da instituição.',
  ], followUp: 'Você quer explorar a LUMA como instituição educacional, coach ou empresa?' },
  ido: { facts: [
    'O I-DO é uma plataforma empresarial multilocatária e governada para operações, finanças e processos.',
    'A LCH disponibiliza uma prévia pública. As integrações e o escopo são definidos com cada organização.',
  ], followUp: 'Qual parte da sua operação você gostaria de unificar?' },
  contact: { facts: [
    'Você pode enviar uma solicitação pelo formulário de contato da LCH, informando sua organização, área de interesse e o resultado desejado.',
    'O envio não confirma automaticamente uma reunião nem garante prazo de resposta.',
  ], followUp: 'Quer revisar o contexto desta conversa no formulário antes de enviá-lo?' },
  privacy: { facts: [
    'O formulário de contato da LCH solicita consentimento para registrar e gerenciar uma consulta comercial.',
    'Não compartilhe senhas, credenciais, documentos confidenciais nem informações pessoais sensíveis neste chat. A equipe poderá discutir condições específicas de tratamento de dados.',
  ] },
  donna: { facts: [
    'Sou Donna, a guia conversacional da LCH. Respondo com informações revisadas deste site e posso ajudar você a encontrar uma solução ou entrar em contato com a equipe.',
    'Não acesso contas privadas nem faço reservas. A conversa por si só não envia informações à equipe; é necessário confirmar o formulário de contato.',
  ], followUp: 'Qual desafio empresarial você gostaria de explorar?' },
};

const messages = {
  en: {
    greeting: "Hi! I'm Donna, LCH's conversational guide. I can help you explore automation, applied AI, software, cloud and products such as LUMA and I-DO. What would you like to improve?",
    pricing: 'Scope and pricing depend on your processes, integrations and requirements. I do not have a verified price to quote here. Please describe your use case to the LCH team.',
    account: 'For security, I cannot access accounts, credentials or private information. Avoid sharing them in chat. The LCH team can advise you through the contact form.',
    unsupported: 'I cannot verify that guarantee, certification or commitment. The team would need to review it before we can make that claim.',
    clarify: 'I can help with the published LCH topics: automation, applied AI, software, cloud and our products. Which would you like to explore first?',
  },
  pt: {
    greeting: 'Olá! Sou Donna, a guia conversacional da LCH. Posso ajudar a explorar automação, IA aplicada, software, nuvem e produtos como LUMA e I-DO. O que você gostaria de melhorar?',
    pricing: 'O escopo e o preço dependem dos processos, integrações e requisitos. Não tenho uma tarifa verificada para informar aqui. Você pode apresentar seu caso à equipe da LCH.',
    account: 'Por segurança, não posso acessar contas, credenciais nem dados privados. Evite compartilhá-los no chat. A equipe da LCH pode orientar você pelo formulário.',
    unsupported: 'Não tenho evidências suficientes para confirmar essa garantia, certificação ou compromisso. A equipe precisa revisar antes de afirmar isso.',
    clarify: 'Posso ajudar com os temas publicados pela LCH: automação, IA aplicada, software, nuvem e nossos produtos. Qual deseja explorar primeiro?',
  },
} as const;

const labels: Record<string, readonly [string, string]> = {
  'Solicitar una conversación con LCH': ['Request a conversation with LCH', 'Solicitar uma conversa com a LCH'],
  'Explorar soluciones': ['Explore solutions', 'Explorar soluções'],
  'Ver automatización empresarial': ['Explore enterprise automation', 'Ver automação empresarial'],
  'Conocer capacidades de IA': ['Explore AI capabilities', 'Conhecer recursos de IA'],
  'Ver Evidencia Jurídica': ['Explore Legal Evidence', 'Ver Evidência Jurídica'],
  'Ver Evidence AI': ['Explore Evidence AI', 'Ver Evidence AI'],
  'Ver proyectos reales': ['See real projects', 'Ver projetos reais'],
  'Explorar servicios cloud': ['Explore cloud services', 'Explorar serviços em nuvem'],
  'Probar LUMA': ['Try LUMA', 'Experimentar LUMA'],
  'Explorar I-DO': ['Explore I-DO', 'Explorar I-DO'],
  'Ver todos los proyectos': ['View all projects', 'Ver todos os projetos'],
  'Explorar LUMA': ['Explore LUMA', 'Explorar LUMA'],
  'Conocer I-DO': ['Discover I-DO', 'Conhecer I-DO'],
  'Ver aviso de privacidad': ['View privacy notice', 'Ver aviso de privacidade'],
};


export function respondToDonnaLocalized(messagesIn: readonly DonnaMessage[], locale: Locale = 'es'): DonnaReply {
  const original = respondToDonna(messagesIn);
  if (locale === 'es') return original;
  const dictionary = locale === 'en' ? en : pt;
  const last = messagesIn.at(-1)?.content ?? '';
  let reply: string;
  if (original.kind === 'grounded') {
    const route = routeMessage(last);
    const localized = route.kind === 'matched' ? dictionary[route.entry.id] : undefined;
    if (!localized) return { ...original, reply: messages[locale].clarify, links: [] };
    reply = [...localized.facts, ...(localized.followUp ? [localized.followUp] : [])].join('\n\n');
  } else if (original.kind === 'greeting') {
    reply = messages[locale].greeting;
  } else if (original.kind === 'clarify') {
    reply = messages[locale].clarify;
  } else if (original.reply.startsWith('Por seguridad')) {
    reply = messages[locale].account;
  } else if (original.reply.startsWith('El alcance y el precio')) {
    reply = messages[locale].pricing;
  } else {
    reply = messages[locale].unsupported;
  }
  return {
    ...original, reply,
    links: original.links.map((link) => ({
      url: link.url,
      label: labels[link.label]?.[locale === 'en' ? 0 : 1] ?? link.label,
    })),
  };
}
