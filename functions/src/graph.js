/** Microsoft Graph mail delivery: server-side credentials only. */
export class GraphMailError extends Error {
  constructor(code, retryable, status = 0) {
    super(code);
    this.name = 'GraphMailError';
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

const authEndpoint = (tenantId) => `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
const sendEndpoint = (sender) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`;

export async function sendLeadMail({ tenantId, clientId, clientSecret, sender, mail, fetchImpl = fetch }) {
  if (!tenantId || !clientId || !clientSecret || !sender) {
    throw new GraphMailError('missing_microsoft_configuration', false);
  }
  let tokenResponse;
  try {
    tokenResponse = await fetchImpl(authEndpoint(tenantId), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (_err) {
    throw new GraphMailError('microsoft_token_transport', true);
  }
  if (!tokenResponse.ok) {
    throw new GraphMailError('microsoft_token_http_' + tokenResponse.status, tokenResponse.status >= 500 || tokenResponse.status === 429, tokenResponse.status);
  }
  let accessToken;
  try {
    const data = await tokenResponse.json();
    accessToken = data.access_token;
  } catch (_err) {
    throw new GraphMailError('microsoft_token_invalid_response', true);
  }
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new GraphMailError('microsoft_token_missing', true);
  }
  let result;
  try {
    result = await fetchImpl(sendEndpoint(sender), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'client-request-id': crypto.randomUUID(),
        'return-client-request-id': 'true',
      },
      body: JSON.stringify(mail),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (_err) {
    throw new GraphMailError('graph_mail_transport', true);
  }
  if (result.status !== 202) {
    throw new GraphMailError('graph_mail_http_' + result.status, result.status >= 500 || result.status === 429 || result.status === 408, result.status);
  }
  // Graph returns 202 Accepted, not a recipient inbox delivery receipt.
  return { status: 'accepted', graphStatus: 202 };
}
