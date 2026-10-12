import { loadEnv } from 'vite';

const config = loadEnv('production', process.cwd(), 'VITE_');
const required = [
  'VITE_CONTACT_PROJECT_ID',
  'VITE_CONTACT_APP_ID',
  'VITE_CONTACT_API_KEY',
  'VITE_CONTACT_AUTH_DOMAIN',
  'VITE_CONTACT_STORAGE_BUCKET',
  'VITE_CONTACT_MESSAGING_SENDER_ID',
  'VITE_CONTACT_DATABASE_ID',
];
const missing = required.filter((key) => !config[key]?.trim());

if (missing.length) {
  console.error('Deployment blocked: missing Firebase contact configuration:', missing.join(', '));
  process.exitCode = 1;
} else if (config.VITE_N8N_WEBHOOK_URL?.trim()) {
  console.error('Deployment blocked: direct public n8n webhook is not approved. Use the private Firestore processor.');
  process.exitCode = 1;
} else {
  console.log('Production contact configuration validated: 7 required fields, no public n8n webhook.');
}
