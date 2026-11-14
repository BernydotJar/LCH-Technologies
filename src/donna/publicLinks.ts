/**
 * Exact public navigation allowlist for Donna.
 * Keep independent from model/API responses: published knowledge alone must not
 * automatically authorize an outbound link or user-controlled redirect.
 */
export const PUBLIC_LINKS: ReadonlySet<string> = new Set([
  '#contacto',
  '#soluciones',
  '#productos-reales',
  '#productos',
  '#privacidad-contacto',
  'https://evidencia.lch-app.cloud/',
  'https://luma.lch-app.cloud/onboarding',
  'https://lch-app.cloud/productos/ido',
  'https://lch-app.cloud/productos/luma',
  'https://lch-app.cloud/productos/meridian',
  'https://lch-app.cloud/productos/bpca',
  'https://lch-app.cloud/productos/electoral',
  'https://lch-app.cloud/productos/legal',
]);

export function isApprovedPublicLink(url: string): boolean {
  return PUBLIC_LINKS.has(url);
}
