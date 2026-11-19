import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function parseServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Podaj poprawny adres e-mail.' }, { status: 400 });
    }

    const sa = parseServiceAccount();
    if (!sa) {
      return NextResponse.json({ exists: false, known: false });
    }

    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential: cert(sa) });

    try {
      await getAuth(app).getUserByEmail(email);
      return NextResponse.json({ exists: true, known: true });
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/user-not-found') {
        return NextResponse.json({ exists: false, known: true });
      }
      return NextResponse.json({ exists: false, known: false });
    }
  } catch {
    return NextResponse.json({ exists: false, known: false });
  }
}
