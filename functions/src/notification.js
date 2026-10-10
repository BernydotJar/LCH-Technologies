/** GH-25: only the four explicitly approved commercial mailboxes. */
export const LEAD_NOTIFICATION_RECIPIENTS = Object.freeze([
  'contacto@lch-technologies.com',
  'eduardo.sacahui@lch-technologies.com',
  'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
  'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
]);

export const LEAD_MAIL_SENDER = 'contacto@lch-technologies.com';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safe(value, maxLength = 256) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function validateLead(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return false;
  if (lead.consentimiento !== true || lead.source !== 'website') return false;
  return ['nombre', 'apellido', 'email', 'empresa', 'cargo', 'interes'].every(
    (field) => typeof lead[field] === 'string' && lead[field].trim().length > 0,
  ) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim());
}

export function buildLeadEmail(leadId, lead, sender = LEAD_MAIL_SENDER) {
  if (!/^[a-zA-Z0-9_-]{5,180}$/.test(leadId) || !validateLead(lead)) {
    throw new Error('Invalid lead input for notification');
  }
  const fields = [
    ['Nombre', `${safe(lead.nombre, 80)} ${safe(lead.apellido, 80)}`],
    ['Correo de contacto', safe(lead.email, 254)],
    ['Organización', safe(lead.empresa, 160)],
    ['Cargo', safe(lead.cargo, 160)],
    ['Interés', safe(lead.interes, 80)],
    ['Resultado esperado', safe(lead.mensaje, 2000) || '(No proporcionado)'],
    ['Referencia LCH', leadId],
  ];
  const rows = fields.map(([label, value]) =>
    `<tr><th style="text-align:left;padding:11px 12px;vertical-align:top;border-bottom:1px solid #e5e7eb;color:#475569">${escapeHtml(label)}</th><td style="padding:11px 12px;vertical-align:top;border-bottom:1px solid #e5e7eb;color:#102a43;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  ).join('');
  const html = `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#102a43;background:#f8fafc;padding:24px"><div style="max-width:680px;margin:auto;background:white;border:1px solid #e2e8f0;border-radius:12px;padding:26px"><div style="font-size:12px;letter-spacing:2px;color:#0d9488;font-weight:700">LCH TECHNOLOGIES</div><h1 style="font-size:24px;margin:10px 0 4px">Nueva solicitud de contacto</h1><p style="color:#475569">Una persona completó el formulario de LCH y autorizó que se le contacte.</p><table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table><p style="font-size:12px;color:#64748b;margin-top:24px">Solicitud generada automáticamente desde lch-app.cloud. Responde al correo del contacto cuando corresponda. No compartas estos datos fuera del equipo comercial.</p></div></body></html>`;
  const contactAddress = safe(lead.email, 254);
  const subjectCompany = safe(lead.empresa, 85).replace(/[\r\n]/g, ' ');
  const subjectInterest = safe(lead.interes, 60).replace(/[\r\n]/g, ' ');
  return {
    message: {
      subject: `[LCH] Nuevo contacto: ${subjectCompany} - ${subjectInterest}`,
      body: { contentType: 'HTML', content: html },
      toRecipients: LEAD_NOTIFICATION_RECIPIENTS.map((address) => ({
        emailAddress: { address },
      })),
      replyTo: [{ emailAddress: { address: contactAddress } }],
      internetMessageHeaders: [{ name: 'x-lch-lead-id', value: leadId }],
    },
    saveToSentItems: true,
  };
}
