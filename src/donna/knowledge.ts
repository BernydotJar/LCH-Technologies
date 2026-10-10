/**
 * LCH-owned, reviewed public knowledge. Adapted from the Donna POC's
 * ClientConfig -> KnowledgeEntry -> deterministic policy separation.
 *
 * No Cadre AI facts, private client data, unpublished guarantees or credentials.
 * Sources: LCH website Capabilities, ProductReferences, EvidenceAI and Contact.
 */
import type { InterestArea } from '../integrations/leadContract';

export type ApprovedLink = { label: string; url: string };
export type DonnaEntry = {
  id: string;
  label: string;
  keywords: readonly string[];
  facts: readonly string[];
  interest: InterestArea;
  links: readonly ApprovedLink[];
  followUp?: string;
};

export const CONTACT_LINK: ApprovedLink = {
  label: 'Solicitar una conversación con LCH',
  url: '#contacto',
};

export const DONNA_QUICK_PROMPTS = [
  { label: 'Automatizar procesos', message: '¿Cómo puede LCH ayudarme a automatizar tareas manuales?' },
  { label: 'Aplicar IA al negocio', message: '¿Qué soluciones de inteligencia artificial ofrece LCH?' },
  { label: 'Conocer los productos', message: '¿Qué hacen LUMA e I-DO?' },
  { label: 'Hablar con el equipo', message: 'Quiero conversar con el equipo de LCH.' },
] as const;

export const LCH_KNOWLEDGE: readonly DonnaEntry[] = [
  {
    id: 'overview',
    label: 'servicios de LCH',
    keywords: ['que hace lch', 'que hacen', 'quienes son', 'que es lch', 'que ofrece lch',
      'servicios de lch', 'servicios', 'soluciones empresariales', 'sobre lch',
      'help my business', 'what does lch do', 'lch technologies', 'transformacion operacional'],
    facts: [
      'LCH Technologies desarrolla inteligencia artificial aplicada, automatización, software empresarial y soluciones cloud para procesos reales de negocio.',
      'El punto de partida es entender el proceso y el resultado esperado; después se evalúan la arquitectura, las integraciones y la forma de medir el impacto.',
    ],
    interest: 'Otro',
    links: [{ label: 'Explorar soluciones', url: '#soluciones' }, CONTACT_LINK],
    followUp: '¿Qué proceso de tu organización te gustaría mejorar primero?',
  },
  {
    id: 'automation',
    label: 'automatización de procesos',
    keywords: ['automatizacion', 'automatizar', 'robotizacion', 'rpa', 'uipath',
      'tareas manuales', 'trabajo repetitivo', 'aprobaciones', 'aprobacion de facturas',
      'conciliacion bancaria', 'ordenes de compra', 'cuentas por pagar', 'documentos y ocr',
      'workflows', 'flujo de trabajo', 'proceso manual', 'procesos manuales'],
    facts: [
      'LCH diseña automatizaciones para reducir trabajo manual, conectar sistemas y dejar evidencia de cada operación.',
      'Entre los flujos que presenta están cuentas por pagar, órdenes de compra, conciliaciones, onboarding, soporte y gestión documental. Cada caso necesita entender sus reglas, excepciones y sistemas actuales.',
    ],
    interest: 'Automatización',
    links: [{ label: 'Ver automatización empresarial', url: '#soluciones' }, CONTACT_LINK],
    followUp: '¿Qué tarea te consume más tiempo o genera más errores hoy?',
  },
  {
    id: 'ai',
    label: 'inteligencia artificial aplicada',
    keywords: ['inteligencia artificial', 'ia empresarial', 'ai agents', 'agentes de ia',
      'agentes inteligentes', 'agente de inteligencia artificial', 'chatbot', 'asistentes de ia',
      'ia generativa', 'modelos de ia', 'aplicar ia', 'aplicacion de ia', 'hacer con ia',
      'automatizar con ia', 'soluciones de ia'],
    facts: [
      'LCH aplica IA sobre documentos, conocimiento, datos y procesos empresariales; incluye asistentes, agentes operativos y sistemas que permiten supervisión humana.',
      'El diseño prioriza trazabilidad de las respuestas, evidencia consultable y límites claros cuando el sistema no puede verificar algo.',
    ],
    interest: 'Inteligencia Artificial',
    links: [{ label: 'Conocer capacidades de IA', url: '#soluciones' }, CONTACT_LINK],
    followUp: '¿La oportunidad está en documentos, decisiones o interacción con usuarios?',
  },
  {
    id: 'evidence',
    label: 'Evidence AI y Evidencia Jurídica',
    keywords: ['evidence ai', 'evidencia juridica', 'rag legal', 'rag juridico',
      'busqueda con evidencia', 'citas verificables', 'fuentes juridicas',
      'normativa', 'documentos legales', 'citar fuentes', 'evidencia documental',
      'buscar en documentos', 'conocimiento corporativo'],
    facts: [
      'LCH Evidence AI permite consultar conocimiento corporativo y respaldar respuestas con evidencia trazable.',
      'La demostración Evidencia Jurídica se centra en consultas normativas con citas y límites de confianza explícitos. Para un caso empresarial se revisan primero las fuentes y permisos de acceso.',
    ],
    interest: 'LCH Evidence AI',
    links: [
      { label: 'Ver Evidencia Jurídica', url: 'https://evidencia.lch-app.cloud/' },
      { label: 'Ver Evidence AI', url: '#productos' },
      CONTACT_LINK,
    ],
    followUp: '¿Qué documentos o fuentes necesitas consultar con confianza?',
  },
  {
    id: 'software',
    label: 'software empresarial',
    keywords: ['software empresarial', 'software a medida', 'desarrollo de software',
      'aplicacion empresarial', 'sistema empresarial', 'integracion de aplicaciones',
      'app web', 'aplicaciones web', 'aplicacion movil', 'plataforma saas',
      'desarrollo de plataformas', 'crear un sistema', 'crear una app'],
    facts: [
      'LCH construye plataformas y aplicaciones alineadas con procesos empresariales e integraciones existentes.',
      'El diseño considera mantenibilidad, escalabilidad, control de acceso y operación después de la entrega.',
    ],
    interest: 'Software Empresarial',
    links: [{ label: 'Ver proyectos reales', url: '#productos-reales' }, CONTACT_LINK],
    followUp: '¿Buscas construir una plataforma nueva o mejorar un sistema existente?',
  },
  {
    id: 'cloud',
    label: 'arquitectura cloud',
    keywords: ['cloud', 'nube', 'infraestructura', 'arquitectura aws', 'arquitectura gcp',
      'migracion cloud', 'migracion a la nube', 'cloud solutions', 'observabilidad',
      'firebase', 'google cloud', 'despliegue', 'desplegar'],
    facts: [
      'LCH diseña arquitectura cloud para modernizar aplicaciones y conectar operaciones, contemplando escalabilidad, seguridad y observabilidad.',
      'La arquitectura recomendada depende de cargas, integraciones y requisitos concretos; no se fija un proveedor sin analizar el caso.',
    ],
    interest: 'Cloud',
    links: [{ label: 'Explorar servicios cloud', url: '#soluciones' }, CONTACT_LINK],
    followUp: '¿La prioridad es modernizar, integrar o desplegar una nueva aplicación?',
  },
  {
    id: 'products',
    label: 'productos LUMA e I-DO',
    keywords: ['luma e i do', 'luma y i do', 'luma e ido', 'luma y ido',
      'productos de lch', 'productos lch', 'que productos ofrecen', 'que productos tienen'],
    facts: [
      'LCH presenta productos con enfoques distintos: LUMA trabaja inteligencia de aprendizaje y evidencia de progreso mediante un Learning Twin; I-DO concentra operaciones, finanzas y procesos empresariales en un Business OS multi-tenant.',
      'También presenta Evidencia Jurídica, una experiencia de consulta normativa respaldada por fuentes. Puedes explorar los productos desde la sección de proyectos.',
    ],
    interest: 'Software Empresarial',
    links: [
      { label: 'Probar LUMA', url: 'https://luma.lch-app.cloud/onboarding' },
      { label: 'Explorar I-DO', url: 'https://ido.lch-app.cloud/w/colombia/inicio' },
      { label: 'Ver todos los proyectos', url: '#productos-reales' },
    ],
    followUp: '¿Te interesa aprendizaje, operaciones empresariales o consulta documental?',
  },
  {
    id: 'luma',
    label: 'LUMA Learning Intelligence',
    keywords: ['luma', 'learning twin', 'learning intelligence', 'aprendizaje adaptativo',
      'aprendizaje personalizado', 'coach de aprendizaje', 'plataforma educativa',
      'plataforma de aprendizaje', 'educacion con ia', 'seres de excelencia'],
    facts: [
      'LUMA es una experiencia de aprendizaje inteligente que utiliza un Learning Twin para conectar objetivos, progreso y evidencia de capacidades.',
      'Puedes explorar su demostración de onboarding. Su aplicación a programas educativos concretos requiere revisar el modelo de enseñanza y la operación de la institución.',
    ],
    interest: 'Software Empresarial',
    links: [{ label: 'Explorar LUMA', url: 'https://luma.lch-app.cloud/onboarding' }, CONTACT_LINK],
    followUp: '¿Quieres explorar LUMA como organización educativa, coach o empresa?',
  },
  {
    id: 'ido',
    label: 'I-DO Business OS',
    keywords: ['i do', 'ido', 'i-do', 'business os', 'erp empresarial', 'erp saas',
      'sistema financiero empresarial', 'operaciones financieras',
      'multi tenant', 'plataforma de operaciones', 'gestion operativa empresarial'],
    facts: [
      'I-DO es una plataforma empresarial orientada a operaciones, finanzas y procesos en un sistema gobernado, con arquitectura multi-tenant.',
      'La presentación de LCH incluye una referencia pública de la experiencia. Las integraciones y alcances se acuerdan para cada organización.',
    ],
    interest: 'Software Empresarial',
    links: [{ label: 'Conocer I-DO', url: 'https://ido.lch-app.cloud/w/colombia/inicio' }, CONTACT_LINK],
    followUp: '¿Qué parte de la operación quisieras unificar?',
  },
  {
    id: 'contact',
    label: 'solicitar una conversación',
    keywords: ['contacto', 'hablar con el equipo', 'hablar con alguien', 'quiero conversar',
      'agendar una reunion', 'reservar una demo', 'demostracion', 'solicitar contacto',
      'reunion comercial', 'llamada comercial', 'pedir una propuesta',
      'contactar ventas', 'hablar con lch', 'como contactar a lch', 'como puedo contactar a lch',
      'como me comunico con lch', 'como contactar al equipo', 'donde puedo escribirles'],
    facts: [
      'Puedes enviar una solicitud desde el formulario de contacto de LCH. Allí indicas tu organización, el área de interés y, si quieres, el resultado que buscas.',
      'El envío de una solicitud no confirma automáticamente una reunión ni fija una fecha de respuesta.',
    ],
    interest: 'Otro',
    links: [CONTACT_LINK],
    followUp: '¿Quieres que traslademos el contexto de esta conversación al formulario para revisarlo antes de enviarlo?',
  },
  {
    id: 'privacy',
    label: 'privacidad y tratamiento de datos',
    keywords: ['privacidad', 'proteccion de datos', 'uso de mis datos', 'informacion sensible',
      'retencion de datos', 'tratamiento de datos', 'politica de privacidad'],
    facts: [
      'El formulario de contacto de LCH solicita consentimiento para registrar y gestionar una consulta comercial.',
      'No compartas contraseñas, credenciales, documentación confidencial ni información personal sensible en esta conversación. Si necesitas condiciones de tratamiento específicas, el equipo podrá revisarlas contigo.',
    ],
    interest: 'Otro',
    links: [{ label: 'Ver aviso de privacidad', url: '#privacidad-contacto' }, CONTACT_LINK],
  },
  {
    id: 'donna',
    label: 'Donna, asistente de LCH',
    keywords: ['donna', 'quien eres', 'quien me atiende', 'eres un bot',
      'eres humana', 'eres un chatbot', 'como funciona este chat'],
    facts: [
      'Soy Donna, la guía conversacional de LCH. Respondo desde información revisada de este sitio y puedo orientarte hacia una solución o una persona del equipo.',
      'En esta versión no accedo a cuentas privadas, no hago reservas y no envío información al equipo por el simple hecho de conversar. Para solicitar contacto debes confirmar el formulario.',
    ],
    interest: 'Otro',
    links: [CONTACT_LINK],
    followUp: '¿Qué reto empresarial te gustaría explorar?',
  },
];
