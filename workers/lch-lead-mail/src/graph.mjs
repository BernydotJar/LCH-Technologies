import { SENDER } from './mail.mjs';

export class MailError extends Error {
  constructor(code, retryable = false, httpStatus = 0) {
    super(code);
    this.name = 'MailError';
    this.retryable = retryable;
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function retryableHttp(status) { return status === 408 || status === 429 || status >= 500; }

export async function getGraphAccessToken(env, fetchImpl = fetch) {
  const tenantId = env.M365_TENANT_ID;
  const clientId = env.M365_CLIENT_ID;
  const clientSecret = env.M365_CLIENT_SECRET;
  if (![tenantId, clientId, clientSecret].every((x) => typeof x === 'string' && x.trim())) {
    throw new MailError('m365_credentials_missing');
  }
  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
  let response;
  try {
    response = await fetchImpl(tokenUrl, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials', scope: 'https://graph.microsoft.com/.default' }).toString(),
      signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new MailError('m365_token_transport', true); }
  if (!response.ok) throw new MailError(`m365_token_http_${response.status}`, retryableHttp(response.status), response.status);
  let data;
  try { data = await response.json(); } catch { throw new MailError('m365_token_bad_json', true); }
  if (typeof data.access_token !== 'string' || !data.access_token) throw new MailError('m365_token_empty', true);
  return data.access_token;
}

export async function sendGraphEmail(accessToken, message, fetchImpl = fetch) {
  if (typeof accessToken !== 'string' || !accessToken) throw new MailError('m365_token_empty');
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER)}/sendMail`;
  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'client-request-id': crypto.randomUUID(),
        'return-client-request-id': 'true',
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(25_000),
    });
  } catch { throw new MailError('m365_mail_transport', true); }
  if (response.status !== 202) throw new MailError(`m365_mail_http_${response.status}`, retryableHttp(response.status), response.status);
  return { status: 'accepted', graphStatus: 202 };
}
