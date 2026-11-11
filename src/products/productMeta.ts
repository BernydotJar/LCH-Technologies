/** Public, route-specific metadata. No private capabilities or unverified production claims. */
export type PortfolioLocale = 'es' | 'en' | 'pt';
export type PortfolioSlug = 'ido' | 'luma' | 'meridian' | 'bpca' | 'electoral' | 'legal';

type LocalizedText = Record<PortfolioLocale, string>;
type ProductMeta = { name: string; description: LocalizedText };

export const productMeta: Record<PortfolioSlug, ProductMeta> = {
  ido: {
    name: 'I-DO',
    description: {
      es: 'I-DO, Business OS para operaciones y finanzas con automatización y gobierno. Conoce su propuesta en LCH Technologies.',
      en: 'I-DO Business OS for operations, finance, automation, and governance. Explore the product at LCH Technologies.',
      pt: 'I-DO, Business OS para operações, finanças, automação e governança. Conheça o produto na LCH Technologies.',
    },
  },
  luma: {
    name: 'LUMA',
    description: {
      es: 'LUMA Learning Intelligence: aprendizaje personalizado con Learning Twin, evidencia de capacidades y acompañamiento.',
      en: 'LUMA Learning Intelligence: personalized learning with a Learning Twin, capability evidence, and guided practice.',
      pt: 'LUMA Learning Intelligence: aprendizagem personalizada com Learning Twin, evidências de capacidade e orientação.',
    },
  },
  meridian: {
    name: 'Meridian',
    description: {
      es: 'Meridian: Recruiting CRM y Talent Intelligence con seguimiento de candidatos, vacantes y revisión humana.',
      en: 'Meridian: a recruiting CRM and talent intelligence experience for candidate pipelines and human-led decisions.',
      pt: 'Meridian: CRM de recrutamento e inteligência de talentos com pipeline de candidatos e decisões humanas.',
    },
  },
  bpca: {
    name: 'Coded Automation',
    description: {
      es: 'Coded Automation (BPCA), SDK y CLI en developer preview para ingeniería y verificación de automatizaciones Blue Prism.',
      en: 'Coded Automation (BPCA), a developer-preview SDK and CLI for engineering and verifying Blue Prism automations.',
      pt: 'Coded Automation (BPCA), SDK e CLI em developer preview para engenharia e verificação de automações Blue Prism.',
    },
  },
  electoral: {
    name: 'OS Electoral',
    description: {
      es: 'OS Electoral / CampaignOS: coordinación interna de campañas, autoridad humana y evidencia. Demostración estática no productiva.',
      en: 'OS Electoral / CampaignOS: internal campaign coordination, human authority, and evidence. Static non-production demo.',
      pt: 'OS Electoral / CampaignOS: coordenação interna de campanhas, autoridade humana e evidências. Demo estática não produtiva.',
    },
  },
  legal: {
    name: 'Evidencia Jurídica',
    description: {
      es: 'Evidencia Jurídica: laboratorio de RAG jurídico con recuperación de fuentes, citas y trazabilidad verificable.',
      en: 'Evidencia Jurídica: a legal RAG knowledge lab with cited sources and verifiable traceability.',
      pt: 'Evidencia Jurídica: laboratório de RAG jurídico com fontes citadas e rastreabilidade verificável.',
    },
  },
};

export function productSlugFromPath(pathname: string): PortfolioSlug | null {
  const match = /^\/productos\/([a-z-]+)\/?$/.exec(pathname);
  return match && Object.hasOwn(productMeta, match[1]) ? match[1] as PortfolioSlug : null;
}

export function getProductPageMeta(pathname: string, locale: PortfolioLocale) {
  const slug = productSlugFromPath(pathname);
  if (!slug) return null;
  return {
    slug,
    title: `${productMeta[slug].name} | Productos LCH Technologies`,
    description: productMeta[slug].description[locale],
    url: `https://lch-app.cloud/productos/${slug}${locale === 'es' ? '' : '?lang=' + locale}`,
  };
}
