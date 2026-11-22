import { cert, getApps, initializeApp } from 'firebase-admin/app';

export function getFirebaseAdminApp() {
  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}
