# LCH Technologies Website

Sitio corporativo oficial de **LCH Technologies**, enfocado en presentar capacidades de transformación operacional, inteligencia artificial aplicada, automatización, software empresarial, soluciones cloud y productos de conocimiento con trazabilidad.

La experiencia está diseñada como una landing page de alto impacto: rápida, responsiva, accesible y orientada a convertir desafíos operativos en conversaciones técnicas concretas.

## Experiencia del sitio

El sitio organiza la propuesta de valor de LCH Technologies en un recorrido único y directo:

- **Hero operacional** con una propuesta de transformación clara y animación de sistema.
- **Capacidades** para IA, automatización, software empresarial y cloud.
- **LCH Evidence AI** como producto destacado.
- **Arquitectura de Confianza** para comunicar gobierno, control y trazabilidad.
- **Metodología de Ingeniería** desde entendimiento hasta mejora continua.
- **Diferenciadores de LCH** centrados en operación, integración y control.
- **Solicitud de demostración** con validación y estados de envío.

## Portafolio de productos LCH

La sección `/#productos-reales` reúne seis perfiles públicos con material visual editorial y fichas SEO independientes:

| Perfil | URL | Representación verificada |
| --- | --- | --- |
| Meridian | `/productos/meridian` | Recruiting CRM; vista conceptual, demo pública temporalmente fuera de servicio |
| LUMA | `/productos/luma` | Learning Intelligence y Learning Twin; showcase interactivo en `luma.lch-app.cloud/experience` |
| Coded Automation (BPCA) | `/productos/bpca` | Blue Prism como código; SDK/CLI en developer preview, documentación y repositorio |
| OS Electoral / CampaignOS | `/productos/electoral` | Coordinación interna con autoridad humana; demo estática de solo lectura y no productiva |
| I-DO | `/productos/ido` | Business OS; vista conceptual, demo pública en mantenimiento |
| Evidencia Jurídica | `/productos/legal` | Knowledge Lab de RAG jurídico; demo pública accesible |

Los gráficos del catálogo son ilustraciones editoriales, no capturas de datos productivos. Las visualizaciones de ejemplo indican explícitamente que contienen cifras ficticias. Las fichas usan ES/EN/PT, enlaces internos estables, metadatos Open Graph, `canonical`, `hreflang`, controles de accesibilidad y enlaces al producto solamente cuando su recurso público corresponde al estado comunicado.

La prueba `tests/productPortfolio.test.ts` verifica el contrato de seis fichas, las traducciones, los metadatos sociales y el conocimiento de Donna. El navegador se verifica mediante `scripts/portfolio-smoke.cjs` en móvil y escritorio, incluido en CI. No registrar una prueba local como publicación de producción; la integración debe pasar las políticas de release y despliegue existentes.

## Stack

- **React 19** — interfaz y composición de componentes.
- **TypeScript** — tipado estático y mantenibilidad.
- **Vite 6** — entorno de desarrollo y build de producción.
- **Tailwind CSS 4** — sistema visual y responsive design.
- **Motion** — animaciones y transiciones orientadas a producto.
- **Lucide** — iconografía consistente y liviana.

## Desarrollo local

Requisitos recomendados:

- Node.js 20 o superior.
- npm 10 o superior.

Instala dependencias y levanta el entorno local:

```bash
npm install
npm run dev
```

Vite mostrará la URL local disponible en la terminal.

## Scripts

| Comando | Propósito |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run typecheck` | Valida TypeScript sin emitir archivos. |
| `npm run build` | Genera el bundle optimizado de producción. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run check` | Ejecuta tests, typecheck y build en secuencia. |

## Estructura

```text
.
├── public/
│   └── assets/brand/       # Identidad visual oficial
├── src/
│   ├── components/         # Secciones y componentes de experiencia
│   ├── App.tsx             # Composición principal de la página
│   ├── index.css           # Tokens visuales y estilos globales
│   └── main.tsx            # Punto de entrada de React
├── index.html              # SEO, metadata y datos estructurados
├── vite.config.ts          # Configuración de Vite y Tailwind
└── tsconfig.json           # Configuración de TypeScript
```

## Idiomas, tema nocturno y analítica

El sitio ofrece español, inglés y portugués mediante el selector del encabezado; guarda la elección de idioma y tema, y respeta el modo nocturno del sistema. Los metadatos SEO se adaptan al idioma sin añadir dominios.

Google Analytics 4 es opcional y requiere consentimiento previo. Para activarlo, configurar la variable pública VITE_GA_MEASUREMENT_ID con un identificador real de GA4 en el entorno de build. No se registran textos privados de Donna ni contenido del formulario.

Guía técnica, medidas de privacidad, eventos permitidos, activación y verificación: [i18n, tema nocturno y analítica](docs/i18n-dark-analytics.md).

La presentación nocturna afecta a **toda la web**, incluido el hero. Donna permanece oculta hasta que el visitante abre el botón compacto anclado a la esquina inferior derecha. Detalles y E2E: [UX de tema y Donna](docs/night-mode-donna-ux.md).

## Identidad visual

Los recursos oficiales de marca se encuentran en `public/assets/brand/` y deben tratarse como fuente canónica para cualquier uso dentro del sitio:

- `lch-technologies-logo.svg` — logotipo principal.
- `lch-isotipo.svg` — isotipo para superficies compactas.
- `favicon.svg` — identidad para navegador.
- variantes `@2x.png` — respaldo raster de alta resolución.

El sitio utiliza como base cromática el navy corporativo `#0C0A50`, con teal `#155E75` como acento principal y gris `#5B6470` para contenido secundario.

## Calidad

Antes de integrar cambios a la rama principal, ejecuta:

```bash
npm run check
```

La implementación prioriza:

- responsive design desde mobile hasta desktop;
- navegación semántica por secciones;
- soporte para preferencias de movimiento reducido;
- metadata SEO y Open Graph;
- datos estructurados de organización;
- assets oficiales sin recoloreado ni reconstrucciones manuales;
- componentes pequeños y enfocados por responsabilidad.

## Producción

El build de producción se genera con:

```bash
npm run build
```

El resultado queda disponible en `dist/` y puede publicarse en cualquier plataforma compatible con sitios web estáticos modernos.

---

**LCH Technologies** — Operational Transformation Accelerators
