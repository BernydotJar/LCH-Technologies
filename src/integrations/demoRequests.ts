import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

type DemoRequest = {
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  cargo: string;
  interes: string;
  mensaje: string;
  consentimiento: boolean;
};

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

export async function submitDemoRequest(request: DemoRequest) {
  await addDoc(collection(db, 'demoRequests'), {
    ...request,
    createdAt: serverTimestamp(),
    source: 'website',
    status: 'new',
  });
}
