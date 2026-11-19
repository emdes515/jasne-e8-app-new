import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';

/**
 * Konfiguracja klienta Firebase dla JASNE E8.
 *
 * Klucze `NEXT_PUBLIC_*` są publiczne z założenia — bezpieczeństwo danych
 * trzymają reguły Firestore (firestore.rules), a nie ukrywanie configu.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

/** Baza Firestore w projekcie `jasne-e8-prod` nazywa się `default` (nie `(default)`). */
export const FIRESTORE_DATABASE_ID =
  process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || 'default';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return cachedApp;
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app, FIRESTORE_DATABASE_ID) : null;
}

export function getFirebaseAuthClient(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}
