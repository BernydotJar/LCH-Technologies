import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { notifyLeadAutomation, type AutomationDeliveryResult } from './leadAutomation';
import {
  buildLeadAutomationPayload,
  validateDemoRequest,
  type DemoRequest,
} from './leadContract';

const requiredConfig = {
  projectId: import.meta.env.VITE_CONTACT_PROJECT_ID,
  appId: import.meta.env.VITE_CONTACT_APP_ID,
  apiKey: import.meta.env.VITE_CONTACT_API_KEY,
  authDomain: import.meta.env.VITE_CONTACT_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_CONTACT_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_CONTACT_MESSAGING_SENDER_ID,
  databaseId: import.meta.env.VITE_CONTACT_DATABASE_ID,
};

for (const [key, value] of Object.entries(requiredConfig)) {
  if (!value) {
    throw new Error(`Missing contact integration configuration: ${key}`);
  }
}

const app = initializeApp({
  projectId: requiredConfig.projectId,
  appId: requiredConfig.appId,
  apiKey: requiredConfig.apiKey,
  authDomain: requiredConfig.authDomain,
  storageBucket: requiredConfig.storageBucket,
  messagingSenderId: requiredConfig.messagingSenderId,
});

const db = getFirestore(app, requiredConfig.databaseId);

export type DemoRequestSubmissionResult = {
  leadId: string;
  automation: AutomationDeliveryResult;
};

export async function submitDemoRequest(request: DemoRequest): Promise<DemoRequestSubmissionResult> {
  const validation = validateDemoRequest(request);
  if (!validation.valid) {
    throw new Error(`Invalid demo request: ${validation.errors.join(', ')}`);
  }

  const lead = validation.value;
  const document = await addDoc(collection(db, 'demoRequests'), {
    ...lead,
    createdAt: serverTimestamp(),
    source: 'website',
    status: 'new',
    automationStatus: 'pending',
  });

  const payload = buildLeadAutomationPayload(document.id, lead);
  const automation = await notifyLeadAutomation(import.meta.env.VITE_N8N_WEBHOOK_URL, payload);

  if (automation.status === 'failed') {
    console.warn('Lead persisted but follow-up automation delivery failed.', {
      leadId: document.id,
      httpStatus: automation.httpStatus,
      error: automation.error,
    });
  }

  return { leadId: document.id, automation };
}
