import { LEAD_MAIL_SENDER, LEAD_NOTIFICATION_RECIPIENTS, buildLeadEmail, validateLead } from './notification.js';
import { GraphMailError, sendLeadMail } from './graph.js';

const LEASE_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS = 7;

/**
 * Firestore is the durable system of record. A transactional lease prevents
 * concurrent Eventarc deliveries from submitting two Graph requests.
 * Graph is at-least-once: an ambiguous network timeout after acceptance may
 * still result in a duplicate email on retry; the stable lead ID helps audit it.
 */
export async function processLeadNotification({
  db,
  leadId,
  credentials,
  mailSender = LEAD_MAIL_SENDER,
  now = () => Date.now(),
  mailer = sendLeadMail,
}) {
  if (!/^[A-Za-z0-9_-]{5,180}$/.test(leadId)) throw new Error('invalid_lead_id');
  const ref = db.collection('demoRequests').doc(leadId);
  const lease = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return { action: 'absent' };
    const lead = snapshot.data();
    const previous = lead.notification ?? {};
    if (previous.state === 'accepted') return { action: 'accepted' };
    if (previous.state === 'blocked' || previous.state === 'invalid' || previous.state === 'needs_review') {
      return { action: previous.state };
    }
    if (!validateLead(lead)) {
      tx.update(ref, {
        notification: { provider: 'microsoft_graph', state: 'invalid', updatedAt: new Date(now()), errorCode: 'lead_not_valid_for_notification' },
      });
      return { action: 'invalid' };
    }
    const attempt = Number(previous.attempts || 0) + 1;
    if (attempt > MAX_ATTEMPTS) {
      tx.update(ref, {
        notification: { provider: 'microsoft_graph', state: 'needs_review', attempts: attempt - 1, updatedAt: new Date(now()), errorCode: 'retry_limit' },
      });
      return { action: 'needs_review' };
    }
    if (previous.state === 'sending' && Number(previous.leaseUntilMs || 0) > now()) {
      return { action: 'leased' };
    }
    const version = `${leadId}-${attempt}`;
    tx.update(ref, {
      notification: {
        provider: 'microsoft_graph',
        state: 'sending',
        attempts: attempt,
        leaseVersion: version,
        leaseUntilMs: now() + LEASE_MS,
        recipientCount: LEAD_NOTIFICATION_RECIPIENTS.length,
        updatedAt: new Date(now()),
      },
    });
    return { action: 'send', lead, version, attempt };
  });

  if (lease.action === 'leased') {
    // Don't acknowledge a duplicate event while another instance has a lease:
    // allow Eventarc retry to recheck state after the original handler finishes.
    throw new GraphMailError('notification_lease_active', true);
  }
  if (lease.action !== 'send') return { status: 'skipped', reason: lease.action };

  const finalize = async (state, errorCode = '') => {
    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists) return;
      const previous = current.data().notification ?? {};
      if (previous.leaseVersion !== lease.version || previous.state !== 'sending') return;
      tx.update(ref, {
        notification: {
          provider: 'microsoft_graph',
          state,
          attempts: lease.attempt,
          recipientCount: LEAD_NOTIFICATION_RECIPIENTS.length,
          acceptedAt: state === 'accepted' ? new Date(now()) : null,
          updatedAt: new Date(now()),
          errorCode: errorCode || null,
        },
      });
    });
  };

  try {
    const mail = buildLeadEmail(leadId, lease.lead, mailSender);
    const response = await mailer({ ...credentials, sender: mailSender, mail });
    if (response.status !== 'accepted') throw new GraphMailError('graph_unexpected_status', true);
    await finalize('accepted');
    return { status: 'accepted', recipients: LEAD_NOTIFICATION_RECIPIENTS.length };
  } catch (error) {
    const graphError = error instanceof GraphMailError ? error : new GraphMailError('unexpected_mail_error', true);
    if (graphError.retryable) {
      await finalize('retry', graphError.code);
      throw graphError;
    }
    await finalize('blocked', graphError.code);
    return { status: 'blocked', reason: graphError.code };
  }
}
