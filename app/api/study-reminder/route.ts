import { NextResponse } from 'next/server';
import { parseStudyReminder, STUDY_REMINDER_TIMEZONE } from '../../../src/lib/studyReminders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: object, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'private, no-store' },
});

async function withReminder(request: Request, operation: (ref: FirebaseFirestore.DocumentReference) => Promise<NextResponse>) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return json({ error: 'Zaloguj się do konta osoby dorosłej.' }, 401);

  try {
    const { getFirebaseAdminApp } = await import('../../../src/lib/firebaseAdmin');
    const app = getFirebaseAdminApp();
    if (!app) return json({ error: 'Zapis na koncie jest teraz niedostępny.' }, 503);

    const { getAuth } = await import('firebase-admin/auth');
    const identity = await getAuth(app).verifyIdToken(token, true).catch(() => null);
    if (!identity || identity.firebase.sign_in_provider === 'anonymous') {
      return json({ error: 'Sesja wygasła. Zaloguj się ponownie.' }, 401);
    }
    if (!identity.email_verified) return json({ error: 'Najpierw potwierdź e-mail konta.' }, 403);

    const { getFirestore } = await import('firebase-admin/firestore');
    const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || '(default)';
    const ref = getFirestore(app, databaseId).doc(`users/${identity.uid}/private/study_reminder`);
    return await operation(ref);
  } catch {
    return json({ error: 'Nie udało się połączyć z zapisem na koncie. Spróbuj ponownie.' }, 503);
  }
}

export async function GET(request: Request) {
  return withReminder(request, async (ref) => {
    const snapshot = await ref.get();
    return json({ schedule: parseStudyReminder(snapshot.data()?.schedule) });
  });
}

export async function PUT(request: Request) {
  return withReminder(request, async (ref) => {
    if (Number(request.headers.get('content-length')) > 1024) return json({ error: 'Za długi zapis.' }, 413);
    const raw = await request.text();
    if (raw.length > 1024) return json({ error: 'Za długi zapis.' }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Nieprawidłowy zapis.' }, 400);
    }
    const schedule = parseStudyReminder(body);
    if (!schedule) return json({ error: 'Sprawdź godzinę i dni przypomnienia.' }, 400);
    const { FieldValue } = await import('firebase-admin/firestore');
    await ref.set({ schedule, timezone: STUDY_REMINDER_TIMEZONE, updatedAt: FieldValue.serverTimestamp() });
    return json({ schedule });
  });
}

export async function DELETE(request: Request) {
  return withReminder(request, async (ref) => {
    await ref.delete();
    return json({ schedule: null });
  });
}
