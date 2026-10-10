import { mintGoogleAccessToken } from './google.mjs';
import { getGraphAccessToken, sendGraphEmail, MailError } from './graph.mjs';
import { firestoreBase, listRecentLeads, patchNotification, readLead, isFirestoreConflict, PAGE_SIZE, MAX_PAGES } from './firestore.mjs';
import { buildMessage, validateWebsiteLead } from './mail.mjs';

export const MAX_MAILS_PER_RUN = 6;
export const MAX_ATTEMPTS = 7;
const LEASE_DURATION_MS = 2 * 60 * 1000;

export function preflight(env, now = Date.now()) {
  if (!env || env.FIRESTORE_PROJECT_ID !== 'rag-municipalidades' ||
      env.FIRESTORE_DATABASE_ID !== 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7') return { ready: false, reason: 'firebase_scope' };
  for (const key of ['GOOGLE_SERVICE_ACCOUNT_JSON', 'M365_TENANT_ID', 'M365_CLIENT_ID', 'M365_CLIENT_SECRET', 'LCH_NOTIFY_FROM']) {
    if (typeof env[key] !== 'string' || !env[key].trim()) return { ready: false, reason: 'missing_' + key.toLowerCase() };
  }
  const start = Date.parse(env.LCH_NOTIFY_FROM);
  if (!Number.isFinite(start) || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(env.LCH_NOTIFY_FROM) || start > now + 30_000) {
    return { ready: false, reason: 'invalid_notification_start' };
  }
  return { ready: true, since: new Date(start).toISOString() };
}

function notification(current, patch, now) {
  return {
    ...current,
    provider: 'microsoft_graph',
    version: 1,
    ...patch,
    updatedAt: new Date(now).toISOString(),
  };
}

export async function runNotificationScan(env, opts = {}) {
  const now = opts.now ?? Date.now();
  const ready = preflight(env, now);
  if (!ready.ready) return { state: 'not_configured', reason: ready.reason, sent: 0 };

  const fetchImpl = opts.fetchImpl ?? fetch;
  const funcs = {
    googleToken: opts.googleToken ?? mintGoogleAccessToken,
    graphToken: opts.graphToken ?? getGraphAccessToken,
    sendMail: opts.sendMail ?? sendGraphEmail,
    list: opts.list ?? listRecentLeads,
    patch: opts.patch ?? patchNotification,
    read: opts.read ?? readLead,
  };
  const counters = { state: 'complete', sent: 0, attempted: 0, invalid: 0, skipped: 0, blocked: 0, conflict: 0, pages: 0, capped: false };
  const base = firestoreBase(env.FIRESTORE_PROJECT_ID, env.FIRESTORE_DATABASE_ID);
  // Fail closed on missing or rejected credentials before reading visitor data.
  const [googleToken, graphToken] = await Promise.all([
    funcs.googleToken({ serviceAccountJson: env.GOOGLE_SERVICE_ACCOUNT_JSON, projectId: env.FIRESTORE_PROJECT_ID, now, fetchImpl }),
    funcs.graphToken(env, fetchImpl),
  ]);
  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await funcs.list({ base, token: googleToken, since: ready.since, offset, limit: PAGE_SIZE, fetchImpl });
    counters.pages++;
    for (const row of rows) {
      if (counters.attempted >= MAX_MAILS_PER_RUN) break;
      const lead = row.fields;
      const prior = lead.notification ?? {};
      if (['accepted', 'blocked', 'invalid', 'needs_review'].includes(prior.state)) { counters.skipped++; continue; }
      if (!validateWebsiteLead(lead) || Date.parse(lead.createdAt) < Date.parse(ready.since)) { counters.invalid++; continue; }
      if (prior.state === 'sending' && Number(prior.leaseUntilMs || 0) > now) { counters.skipped++; continue; }
      const attempts = Number(prior.attempts || 0);
      if (!Number.isSafeInteger(attempts) || attempts >= MAX_ATTEMPTS) {
        counters.attempted++;
        try {
          await funcs.patch({ base, token: googleToken, document: row.name, updateTime: row.updateTime,
            notification: notification(prior, { state: 'needs_review', errorCode: 'retry_limit' }, now), fetchImpl });
        } catch (err) { if (!isFirestoreConflict(err)) throw err; counters.conflict++; }
        counters.blocked++;
        continue;
      }
      counters.attempted++;
      const leaseId = crypto.randomUUID();
      const claim = notification(prior, {
        state: 'sending', attempts: attempts + 1,
        leaseId, leaseUntilMs: now + LEASE_DURATION_MS,
        errorCode: null,
      }, now);
      try {
        await funcs.patch({ base, token: googleToken, document: row.name, updateTime: row.updateTime,
          notification: claim, fetchImpl });
      } catch (err) {
        if (!isFirestoreConflict(err)) throw err;
        counters.conflict++;
        continue;
      }

      const finalize = async (nextState, errorCode = null) => {
        // Other systems may update the lead while email is in flight. Re-read
        // updateTime so the final patch does not overwrite n8n metadata.
        for (let attempt = 0; attempt < 3; attempt++) {
          const fresh = await funcs.read({ base, token: googleToken, document: row.name, fetchImpl });
          const current = fresh.fields.notification ?? {};
          if (current.leaseId !== leaseId || current.state !== 'sending') return false;
          const patch = notification(current, {
            state: nextState,
            leaseUntilMs: 0,
            errorCode,
            ...(nextState === 'accepted' ? { acceptedAt: new Date(now).toISOString() } : {}),
          }, now);
          try {
            await funcs.patch({ base, token: googleToken, document: row.name,
              updateTime: fresh.updateTime, notification: patch, fetchImpl });
            return true;
          } catch (err) {
            if (!isFirestoreConflict(err)) throw err;
          }
        }
        return false;
      };
      try {
        const message = buildMessage(row.id, lead);
        const outcome = await funcs.sendMail(graphToken, message, fetchImpl);
        if (outcome.status !== 'accepted') throw new MailError('graph_unexpected_result', true);
        if (!await finalize('accepted')) throw new Error('notification_ack_not_persisted');
        counters.sent++;
      } catch (err) {
        // Graph 202 followed by a lost acknowledgement is ambiguous; leave
        // lease to expire and retry. Stable x-lch-lead-id supports trace.
        if (err?.message === 'notification_ack_not_persisted') throw err;
        const code = err instanceof MailError ? err.code : 'unexpected_mail_error';
        const permanent = err instanceof MailError && !err.retryable;
        await finalize(permanent ? 'blocked' : 'retry', code);
        if (permanent) counters.blocked++;
        else throw err;
      }
    }
    if (counters.attempted >= MAX_MAILS_PER_RUN) { counters.capped = true; break; }
    if (rows.length < PAGE_SIZE) break;
    offset += rows.length;
    if (page === MAX_PAGES - 1) counters.capped = true;
  }
  return counters;
}
