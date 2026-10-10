import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { processLeadNotification } from './src/process.js';

initializeApp();

const DATABASE_ID = 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7';
const tenantId = defineSecret('LCH_M365_TENANT_ID');
const clientId = defineSecret('LCH_M365_CLIENT_ID');
const clientSecret = defineSecret('LCH_M365_CLIENT_SECRET');

/** One cloud-side notification for every consented website lead. */
export const lchLeadMailNotification = onDocumentCreated({
  document: 'demoRequests/{leadId}',
  database: DATABASE_ID,
  region: 'us-west1',
  secrets: [tenantId, clientId, clientSecret],
  retry: true,
  maxInstances: 3,
  memory: '256MiB',
  timeoutSeconds: 90,
}, async (event) => {
  if (!event.data || !event.params?.leadId) return;
  const leadId = event.params.leadId;
  try {
    const result = await processLeadNotification({
      db: getFirestore(DATABASE_ID),
      leadId,
      credentials: {
        tenantId: tenantId.value(),
        clientId: clientId.value(),
        clientSecret: clientSecret.value(),
      },
    });
    logger.info('lch_lead_notification_processed', { leadId, state: result.status, reason: result.reason ?? null });
  } catch (error) {
    // Do not put contact PII, Microsoft tokens, or secrets into cloud logs.
    logger.error('lch_lead_notification_retry', { leadId, code: error.code ?? 'transient_error' });
    throw error;
  }
});
