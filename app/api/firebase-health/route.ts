import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
const DATABASE_ID = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || 'default';

/**
 * Diagnostyka połączenia z Firestore.
 * Czyta publiczny manifest treści przez REST — nie wymaga konta ucznia.
 */
export async function GET() {
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json(
      { status: 'unconfigured', message: 'Brak konfiguracji Firebase w zmiennych środowiskowych.' },
      { status: 503 }
    );
  }

  const startedAt = Date.now();
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/meta/content_manifest?key=${API_KEY}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          projectId: PROJECT_ID,
          databaseId: DATABASE_ID,
          httpStatus: response.status,
          latencyMs,
        },
        { status: 502 }
      );
    }

    const doc = (await response.json()) as {
      fields?: Record<string, { integerValue?: string; timestampValue?: string }>;
    };

    return NextResponse.json({
      status: 'ok',
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      contentManifestVersion: doc.fields?.contentManifestVersion?.integerValue ?? null,
      manifestUpdatedAt: doc.fields?.updatedAt?.timestampValue ?? null,
      latencyMs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        projectId: PROJECT_ID,
        databaseId: DATABASE_ID,
        message: error instanceof Error ? error.message : 'Nieznany błąd',
        latencyMs: Date.now() - startedAt,
      },
      { status: 502 }
    );
  }
}
