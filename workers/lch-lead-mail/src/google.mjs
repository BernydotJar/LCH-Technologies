/** OAuth2 service-account JWT for Firestore REST, using WebCrypto (Workers). */
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/datastore';
const encoding = new TextEncoder();

export function base64url(bytes) {
  const content = typeof bytes === 'string' ? encoding.encode(bytes) : new Uint8Array(bytes);
  let binary = '';
  for (const b of content) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function parseServiceAccount(raw, projectId) {
  let key;
  try { key = JSON.parse(raw || ''); } catch { throw new Error('google_service_account_invalid_json'); }
  if (key?.type !== 'service_account' || key.project_id !== projectId ||
      !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(key.client_email || '') ||
      typeof key.private_key !== 'string' || !key.private_key.startsWith('-----BEGIN PRIVATE KEY-----') ||
      (key.token_uri && key.token_uri !== TOKEN_URL)) {
    throw new Error('google_service_account_invalid_scope_or_key');
  }
  return key;
}

export async function mintGoogleAccessToken({ serviceAccountJson, projectId, now = Date.now(), fetchImpl = fetch, subtle = crypto.subtle }) {
  const account = parseServiceAccount(serviceAccountJson, projectId);
  const rawKey = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  let signingKey;
  try {
    const bytes = Uint8Array.from(atob(rawKey), (ch) => ch.charCodeAt(0));
    signingKey = await subtle.importKey('pkcs8', bytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  } catch { throw new Error('google_key_import_failed'); }
  const epoch = Math.floor(now / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: account.client_email,
    sub: account.client_email,
    aud: TOKEN_URL,
    scope: SCOPE,
    iat: epoch - 15,
    exp: epoch + 3500,
  }));
  const unsigned = `${header}.${claims}`;
  let signature;
  try { signature = await subtle.sign('RSASSA-PKCS1-v1_5', signingKey, encoding.encode(unsigned)); }
  catch { throw new Error('google_sign_failed'); }
  const assertion = `${unsigned}.${base64url(signature)}`;
  let reply;
  try {
    reply = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
      signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new Error('google_token_transport_error'); }
  if (!reply.ok) throw new Error(`google_token_http_${reply.status}`);
  let data;
  try { data = await reply.json(); } catch { throw new Error('google_token_bad_json'); }
  if (typeof data.access_token !== 'string' || !data.access_token) throw new Error('google_token_missing');
  return data.access_token;
}
