/** Cloud Firestore REST adapter with conditional writes. No Firebase Admin SDK. */
const API = 'https://firestore.googleapis.com/v1';
export const PAGE_SIZE = 40;
export const MAX_PAGES = 5;

export function firestoreBase(projectId, databaseId) {
  if (projectId !== 'rag-municipalidades' || databaseId !== 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7') {
    throw new Error('wrong_firestore_database');
  }
  return `${API}/projects/${projectId}/databases/${databaseId}/documents`;
}

export function decodeValue(value) {
  if (value?.stringValue !== undefined) return value.stringValue;
  if (value?.booleanValue !== undefined) return value.booleanValue;
  if (value?.integerValue !== undefined) return Number(value.integerValue);
  if (value?.doubleValue !== undefined) return Number(value.doubleValue);
  if (value?.timestampValue !== undefined) return value.timestampValue;
  if (value?.nullValue !== undefined) return null;
  if (value?.mapValue) return decodeFields(value.mapValue.fields ?? {});
  if (value?.arrayValue) return (value.arrayValue.values ?? []).map(decodeValue);
  return undefined;
}

export function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([key, value]) => [key, decodeValue(value)]));
}

function writeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number' && Number.isSafeInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number' && Number.isFinite(value)) return { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'object' && !Array.isArray(value)) {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, writeValue(v)])) } };
  }
  throw new Error('unsupported_notification_value');
}

export function isFirestoreConflict(errorOrStatus) {
  const status = typeof errorOrStatus === 'object' ? errorOrStatus?.status : errorOrStatus;
  return status === 409 || status === 412 || (status === 400 && errorOrStatus?.remoteCode === 'FAILED_PRECONDITION');
}

export function notificationField(notification) { return writeValue(notification); }

async function requestJson(url, options, fetchImpl) {
  let response;
  try { response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(20_000) }); }
  catch { throw new Error('firestore_transport_failure'); }
  if (!response.ok) {
    // Firestore REST maps a failed optimistic updateTime precondition to HTTP
    // 400 with canonical status FAILED_PRECONDITION in many deployments.
    // Inspect only its machine code; never log backend error messages/PII.
    let remoteCode = '';
    if (response.status === 400 || response.status === 409 || response.status === 412) {
      try { remoteCode = (await response.json())?.error?.status ?? ''; } catch { /* no body */ }
    }
    const err = new Error(`firestore_http_${response.status}`);
    err.status = response.status;
    err.remoteCode = remoteCode;
    throw err;
  }
  try { return await response.json(); } catch { throw new Error('firestore_invalid_json'); }
}

function headers(token, hasBody = false) {
  return { authorization: `Bearer ${token}`, ...(hasBody ? { 'content-type': 'application/json' } : {}) };
}

export async function listRecentLeads({ base, token, since, offset = 0, limit = PAGE_SIZE, fetchImpl = fetch }) {
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(since) || Number.isNaN(Date.parse(since))) throw new Error('invalid_launch_time');
  if (!Number.isSafeInteger(offset) || offset < 0 || limit > PAGE_SIZE || limit < 1) throw new Error('invalid_query_pagination');
  const structuredQuery = {
    from: [{ collectionId: 'demoRequests' }],
    where: { fieldFilter: {
      field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: since },
    } },
    orderBy: [
      { field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' },
      { field: { fieldPath: '__name__' }, direction: 'DESCENDING' },
    ],
    limit, offset,
  };
  const result = await requestJson(`${base}:runQuery`, {
    method: 'POST', headers: headers(token, true), body: JSON.stringify({ structuredQuery }),
  }, fetchImpl);
  if (!Array.isArray(result)) throw new Error('firestore_invalid_query_response');
  return result.filter((x) => x?.document?.name && x.document.fields).map((x) => ({
    id: x.document.name.split('/').at(-1),
    name: x.document.name,
    updateTime: x.document.updateTime,
    fields: decodeFields(x.document.fields),
  }));
}

/** Firestore PATCH currentDocument.updateTime is a CAS/optimistic lock. */
export async function patchNotification({ base, token, document, updateTime, notification, fetchImpl = fetch }) {
  if (!document.startsWith(base + '/demoRequests/') || !updateTime || !document.endsWith('/' + document.split('/').at(-1))) {
    throw new Error('invalid_document_update');
  }
  const url = new URL(document);
  url.searchParams.append('updateMask.fieldPaths', 'notification');
  url.searchParams.set('currentDocument.updateTime', updateTime);
  return requestJson(url.toString(), {
    method: 'PATCH', headers: headers(token, true), body: JSON.stringify({
      name: document,
      fields: { notification: notificationField(notification) },
    }),
  }, fetchImpl);
}

export async function readLead({ document, base, token, fetchImpl = fetch }) {
  if (!document.startsWith(base + '/demoRequests/')) throw new Error('invalid_document_read');
  const result = await requestJson(document, {
    method: 'GET', headers: headers(token),
  }, fetchImpl);
  return { id: document.split('/').at(-1), name: document, updateTime: result.updateTime, fields: decodeFields(result.fields) };
}
