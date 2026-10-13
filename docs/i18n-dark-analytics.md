# LCH — i18n, tema nocturno y analítica

Rama de implementación: **feat/i18n-dark-analytics-20261012**. Arquitectura: React 19, Vite 6, TypeScript y servidor Node same-origin. No se modifica la integración Firestore → n8n → Microsoft 365.

## Idiomas

La interfaz soporta español (es), inglés (en) y portugués brasileño (pt), con selector visible en escritorio y móvil.

Orden de preferencia: parámetro de URL (?lang=...) → idioma guardado en localStorage bajo «lch.language» → idioma del navegador → español. Se actualizan el atributo HTML lang, los textos y los metadatos.

URLs canónicas del dominio existente:
- https://lch-app.cloud/ — español
- https://lch-app.cloud/?lang=en — inglés
- https://lch-app.cloud/?lang=pt — portugués

No se crean dominios nuevos. Los enlaces a LUMA, I-DO y Evidencia Jurídica y los identificadores de secciones permanecen intactos. Los valores internos del formulario (INTEREST_AREAS, consentimiento, Firestore) **no se traducen**: solo las etiquetas.

Diccionarios en src/i18n/. El SEO incluye title, description, OG, Twitter, canonical y hreflang; server/localizedHead.ts permite servir un head localizado a crawlers para cada parámetro de idioma. El cuerpo del sitio continúa renderizado en React (no se presume SSR completo).

Donna acepta opcionalmente locale: es, en o pt en /api/chat y conserva las respuestas españolas si se omite. Las respuestas inglesas y portuguesas están curadas a partir de conocimiento público revisado: no hay traducción generativa de afirmaciones de producto. Alias multilingües permiten reconocer preguntas frecuentes. Se mantienen los límites de precios, credenciales y promesas no verificadas.

La preparación local del formulario también utiliza preguntas en el idioma elegido. Los datos personales escritos en ES/EN/PT permanecen fuera de la API general de consultas; el asistente nunca marca el consentimiento ni envía el formulario.

## Tema oscuro

src/theme/ThemeProvider.tsx respeta inicialmente prefers-color-scheme; el botón superior alterna claro y oscuro. La preferencia se guarda como «lch.theme». Un script inicial en index.html previene el destello de tema incorrecto.

Las secciones, formulario y Donna usan superficies nocturnas con contraste y acentos navy/teal de LCH. Se respetan las preferencias de movimiento reducido y se evita el desbordamiento lateral en móvil. El cambio de tema no modifica el comportamiento del formulario.

## Google Analytics 4

Integración opcional y **solo con consentimiento explícito**. Se habilita proporcionando el Measurement ID público de una propiedad GA4 real de LCH en el entorno de compilación:

    VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

La variable también figura en .env.example. Si falta o no es válida, no se carga Google Analytics y no se presenta un banner inerte. No incluir secretos privados.

Antes de aceptar no se inyecta gtag.js y no se emiten eventos. Tras aceptar se deshabilitan las señales publicitarias y se registra la navegación sin pageviews duplicados. La preferencia se guarda bajo «lch.analytics.consent». Rechazar o revocar en el footer detiene eventos futuros. Global Privacy Control y Do Not Track impiden activarlo.

Eventos permitidos: page_view, language_change, theme_change, cta_click, product_demo_select, donna_open, contact_submit_success y contact_submit_error. Dimensiones: idioma, tema, producto, sección y ruta raíz. **No se envían** texto de conversaciones, correos, nombres, datos de formularios, IDs comerciales ni querystrings. Un evento de envío exitoso solo verifica el estado del formulario, NO confirma la entrega del correo por M365.

### Activación de producción

1. Obtener el Measurement ID del web data stream en la propiedad de Google Analytics de LCH.
2. Configurar VITE_GA_MEASUREMENT_ID en el entorno del build y desplegar la rama aprobada.
3. Comprobar aceptación, page_view, selección de LUMA y un envío controlado autorizado.
4. Comprobar rechazo, revocación y privacidad GPC/DNT antes de llevarlo a producción.

Implementar el código no crea automáticamente la propiedad GA4 ni implica que los eventos estén llegando a ella.

## QA

- npm run check: tests unitarios/de API, typecheck y build — 99 pruebas aprobadas en la primera validación integral.
- tests/i18nThemeAnalytics.test.ts: selección de idioma, traducciones, SEO, Donna y límites de privacidad, contrato de datos y validación GA4.
- QA Chromium headless/CDP local: EN→PT, modo oscuro y su persistencia, etiquetas y valores del formulario, aceptación y revocación GA4, evento de selector de LUMA y ancho de viewport 375 px sin overflow.
- No se ejecutó en esta rama una prueba real de correo Donna → Firestore → n8n → Microsoft 365. Esa integración no fue modificada.

**Estado:** implementación en rama Git local, no desplegada a producción. La activación real de métricas requiere una propiedad GA4 y su Measurement ID.
