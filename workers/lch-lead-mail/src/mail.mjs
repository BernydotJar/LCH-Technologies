/** Exact four user-approved commercial recipients: never read from a lead. */
export const RECIPIENTS = Object.freeze([
  'contacto@lch-technologies.com',
  'eduardo.sacahui@lch-technologies.com',
  'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
  'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
]);
export const SENDER = 'contacto@lch-technologies.com';
export const INTEREST_AREAS = Object.freeze([
  'Inteligencia Artificial', 'Automatización', 'Software Empresarial',
  'Cloud', 'LCH Evidence AI', 'Otro',
]);

const LIMITS = Object.freeze({ nombre: 80, apellido: 80, email: 254, empresa: 160, cargo: 160, mensaje: 2000 });
const CLEAN_CTRL = /[\u0000-\u001f\u007f]/g;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function clean(value, max) {
  return typeof value === 'string' ? value.replace(CLEAN_CTRL, ' ').trim().slice(0, max) : '';
}
export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function validateWebsiteLead(lead) {
  if (!lead || typeof lead !== 'object' || lead.consentimiento !== true || lead.source !== 'website') return false;
  if (typeof lead.createdAt !== 'string' || Number.isNaN(Date.parse(lead.createdAt))) return false;
  if (!INTEREST_AREAS.includes(lead.interes)) return false;
  if (!Object.entries(LIMITS).every(([key, max]) => typeof lead[key] === 'string' && lead[key].length <= max)) return false;
  for (const key of ['nombre', 'apellido', 'email', 'empresa', 'cargo']) {
    if (!clean(lead[key], LIMITS[key])) return false;
  }
  return EMAIL.test(clean(lead.email, LIMITS.email));
}
export function buildMessage(leadId, lead) {
  if (!/^[A-Za-z0-9_-]{5,180}$/.test(leadId) || !validateWebsiteLead(lead)) throw new Error('lead_not_valid');
  const fields = [
    ['Nombre', `${clean(lead.nombre, 80)} ${clean(lead.apellido, 80)}`],
    ['Correo', clean(lead.email, 254)],
    ['Organización', clean(lead.empresa, 160)],
    ['Cargo', clean(lead.cargo, 160)],
    ['Interés', lead.interes],
    ['Objetivo / necesidad', clean(lead.mensaje, 2000) || '(No proporcionado)'],
    ['Referencia', leadId],
  ];
  const rows = fields.map(([key, value]) => `<tr><th style="text-align:left;padding:9px;border-bottom:1px solid #e2e8f0;color:#475569">${escapeHtml(key)}</th><td style="padding:9px;border-bottom:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
  const html = `<!doctype html><html lang="es"><body style="background:#f8fafc;padding:24px;font-family:Arial,sans-serif;color:#102a43"><main style="margin:auto;max-width:660px;background:white;border-radius:12px;padding:26px;border:1px solid #e2e8f0"><p style="letter-spacing:2px;color:#0f766e;font-size:12px;font-weight:bold">LCH TECHNOLOGIES</p><h1 style="font-size:22px">Nueva solicitud de contacto</h1><p>Se recibió una solicitud del sitio con consentimiento para ser contactado.</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="font-size:12px;color:#64748b">Mensaje automático de lch-app.cloud. La referencia facilita identificar el contacto y evitar duplicados.</p></main></body></html>`;
  return {
    message: {
      subject: `[LCH] Nuevo contacto: ${clean(lead.empresa, 75)} - ${lead.interes}`,
      body: { contentType: 'HTML', content: html },
      toRecipients: RECIPIENTS.map((address) => ({ emailAddress: { address } })),
      replyTo: [{ emailAddress: { address: clean(lead.email, 254) } }],
      internetMessageHeaders: [{ name: 'x-lch-lead-id', value: leadId }],
    },
    saveToSentItems: true,
  };
}
