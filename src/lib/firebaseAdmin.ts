import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Parses and validates Firebase Admin credentials from JSON or split env vars. */
export function parseFirebaseAdminServiceAccount(
  env: NodeJS.ProcessEnv = process.env
): ServiceAccount | null {
  const rawJson = asNonEmptyString(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (rawJson) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return null;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const projectId = asNonEmptyString(record.projectId ?? record.project_id);
    const clientEmail = asNonEmptyString(record.clientEmail ?? record.client_email);
    const rawPrivateKey = asNonEmptyString(record.privateKey ?? record.private_key);
    if (!projectId || !clientEmail || !rawPrivateKey) {
      return null;
    }

    return {
      projectId,
      clientEmail,
      privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
    };
  }

  const projectId = asNonEmptyString(env.FIREBASE_PROJECT_ID);
  const clientEmail = asNonEmptyString(env.FIREBASE_CLIENT_EMAIL);
  const rawPrivateKey = asNonEmptyString(env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
  };
}

/** Returns the initialized default Firebase Admin app or null when unconfigured. */
export function getFirebaseAdminApp() {
  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  if (existing) return existing;

  const serviceAccount = parseFirebaseAdminServiceAccount();
  if (!serviceAccount) return null;

  try {
    return initializeApp({ credential: cert(serviceAccount) });
  } catch {
    return null;
  }
}
