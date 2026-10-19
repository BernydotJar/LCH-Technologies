# LCH — Modo nocturno integral y Donna no invasiva

## Problema auditado (17-10-2026)

Sobre una pantalla móvil de 375 × 812 px, la versión anterior mostraba
automáticamente una tarjeta de invitación de 300 × 211 px sobre el contenido
y un lanzador de 224 × 68 px. Al abrirse, Donna ocupaba 351 × 610 px y
comenzaba cerca de la parte superior de la pantalla. En el hero, los fondos
navy corporativos tenían el mismo valor en claro y oscuro; el cambio parecía
limitado al chat aunque algunas secciones editoriales sí variaban.

## Decisión de diseño

- **Preferencia de tema global**: un control del encabezado alterna claro/oscuro,
  persiste la selección y actúa sobre hero, navegación, contenido editorial,
  casos, productos, formulario, footer y Donna. Se respeta la identidad navy/teal.
- **Sin interrupciones**: la invitación automática de Donna se elimina;
  las ideas pasan a estar dentro del panel, visibles solo al abrirlo.
- **Lanzador pequeño y reconocible**: 64 × 64 px en móvil, fijo en esquina
  inferior derecha. En escritorio conserva una cápsula compacta.
- **Panel contextual, no modal a pantalla completa**: se alinea a la derecha
  del lanzador; su altura en móvil está limitada a min(62dvh, 500px) y
  en escritorio a min(72dvh, 580px); el transcript puede desplazarse.
- **Accesibilidad y control**: hay nombre accesible, foco visible, el botón
  expone aria-expanded, Escape cierra el chat y devuelve el foco al
  lanzador; se respeta prefers-reduced-motion y el área segura del dispositivo.
- **Privacidad**: no cambia el contrato del formulario, no marca
  consentimiento y no envía datos a Firestore por abrir Donna.

No existe una ley universal que exija ubicar un chat en una esquina específica.
Este diseño aplica buenas prácticas de control del usuario, minimalismo
visual y reducción de interferencias. Como criterios normativos comprobables
se toman WCAG 2.2, entre ellos **2.4.11 Focus Not Obscured (AA)** y
**2.5.8 Target Size (Minimum, AA)**:

https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum

https://www.w3.org/TR/WCAG22/

## Gates

- npm run check: pruebas, tipado y build de producción.
- scripts/lch-ux-smoke.cjs: Chromium con 320, 375, 390, 768 y 1365 px.
  Idiomas ES/EN/PT; comparación de colores globales claros/oscuros; botón
  cerrado y compacto; panel abajo-derecha; teclado/Escape; persistencia; overflow.
- scripts/donna-experience-smoke.cjs: QA del flujo de Donna y rotación de
  sugerencias **solo tras la apertura**. Privacidad y ausencia de peticiones
  de leads por explorar.
- scripts/donna-live-form-smoke.cjs: formulario comercial protegido en
  móvil y escritorio, sin consentimiento automático.
- GitHub Actions incluye el gate de UI junto al smoke de Donna. No mergear
  ni publicar hasta que esté verde.
