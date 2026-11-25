import { doc, getDoc } from 'firebase/firestore';
import { getDb, getFirebaseApp } from '../../lib/firebase';
import type { SubjectId } from '../../types/domain';
import type {
  ContentManifest,
  ContentPackEntry,
  RemoteChapterPack,
  RemoteCkeSheetsPack,
} from '../../types/contentPacks';
import {
  clearAllPackCache,
  getCachedManifest,
  getCachedPack,
  setCachedManifest,
  setCachedPack,
} from './packCache';

const DEFAULT_PROJECT_ID = 'jasne-e8-app';

const SUBJECT_CHAPTER_IDS: Record<SubjectId, readonly string[]> = {
  math: [
    'math_ch01',
    'math_ch02',
    'math_ch03',
    'math_ch04',
    'math_ch05',
    'math_ch06',
    'math_ch07',
  ],
  polish: [
    'pol_ch01',
    'pol_ch02',
    'pol_ch03',
    'pol_ch04',
    'pol_ch05',
    'pol_ch06',
    'pol_ch07',
  ],
  english: [
    'eng_ch01',
    'eng_ch02',
    'eng_ch03',
    'eng_ch04',
    'eng_ch05',
    'eng_ch06',
  ],
};

export interface ContentPackDependencies {
  getRemoteManifestVersion: () => Promise<number | null>;
  fetchManifestFromFirestore: () => Promise<ContentManifest | null>;
  fetchPackJson: <T>(url: string) => Promise<T>;
}

async function defaultGetRemoteManifestVersion(): Promise<number | null> {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const { getRemoteConfig, fetchAndActivate, getValue } = await import(
      'firebase/remote-config'
    );
    const rc = getRemoteConfig(app);
    rc.settings.minimumFetchIntervalMillis = 5 * 60 * 1000;
    await fetchAndActivate(rc);
    const num = getValue(rc, 'contentManifestVersion').asNumber();
    return Number.isFinite(num) && num > 0 ? num : null;
  } catch {
    return null;
  }
}

async function defaultFetchManifestFromFirestore(): Promise<ContentManifest | null> {
  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'meta', 'content_manifest'));
      if (snap.exists()) {
        return snap.data() as ContentManifest;
      }
    } catch {
      // Spróbuj fallbacku REST poniżej
    }
  }

  // Fallback REST (publiczny odczyt zgodnie z firestore.rules: allow read: if true)
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meta/content_manifest`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = (await res.json()) as { fields?: Record<string, unknown> };
    return raw.fields ? (decodeFsMap(raw.fields) as unknown as ContentManifest) : null;
  } catch {
    return null;
  }
}

function decodeFsValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const arr = (val.arrayValue as { values?: Array<Record<string, unknown>> })?.values ?? [];
    return arr.map(decodeFsValue);
  }
  if ('mapValue' in val) {
    const fields = (val.mapValue as { fields?: Record<string, Record<string, unknown>> })?.fields ?? {};
    return decodeFsMap(fields);
  }
  return undefined;
}

function decodeFsMap(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v && typeof v === 'object') {
      out[k] = decodeFsValue(v as Record<string, unknown>);
    }
  }
  return out;
}

async function defaultFetchPackJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Nie udało się pobrać paczki treści (${res.status})`);
  }
  return (await res.json()) as T;
}

export function createContentPackService(
  overrides: Partial<ContentPackDependencies> = {}
) {
  const deps: ContentPackDependencies = {
    getRemoteManifestVersion:
      overrides.getRemoteManifestVersion ?? defaultGetRemoteManifestVersion,
    fetchManifestFromFirestore:
      overrides.fetchManifestFromFirestore ?? defaultFetchManifestFromFirestore,
    fetchPackJson: overrides.fetchPackJson ?? defaultFetchPackJson,
  };

  let inFlightManifest: Promise<ContentManifest | null> | null = null;

  /**
   * Synchronizuje `meta/content_manifest` tylko wtedy, gdy wersja w Remote Config
   * jest wyższa od lokalnej (0 readów Firestore przy braku zmian).
   */
  async function syncContentManifest(force = false): Promise<ContentManifest | null> {
    if (inFlightManifest && !force) return inFlightManifest;

    inFlightManifest = (async () => {
      const local = await getCachedManifest();
      if (!force && local) {
        const remoteVer = await deps.getRemoteManifestVersion();
        if (remoteVer !== null && remoteVer <= local.contentManifestVersion) {
          return local;
        }
        // Gdy Remote Config nie jest skonfigurowany lokalnie, użyj cache
        if (remoteVer === null) {
          return local;
        }
      }

      const fresh = await deps.fetchManifestFromFirestore();
      if (fresh) {
        await setCachedManifest(fresh);
        return fresh;
      }
      return local;
    })();

    try {
      return await inFlightManifest;
    } finally {
      inFlightManifest = null;
    }
  }

  async function loadPackByEntry<T>(
    packId: string,
    entry: ContentPackEntry
  ): Promise<T> {
    const cached = await getCachedPack<T>(packId);
    if (cached && cached.sha256 === entry.sha256) {
      return cached.data;
    }

    const data = await deps.fetchPackJson<T>(entry.url);
    await setCachedPack({
      packId,
      sha256: entry.sha256,
      cachedAt: Date.now(),
      data,
    });
    return data;
  }

  async function loadChapterPack(
    chapterId: string,
    forceManifest = false
  ): Promise<RemoteChapterPack | null> {
    const manifest = await syncContentManifest(forceManifest);
    const entry = manifest?.packs?.[chapterId];
    if (!entry) return null;
    return loadPackByEntry<RemoteChapterPack>(chapterId, entry);
  }

  async function loadCkeSheetsPack(
    subjectId: SubjectId,
    forceManifest = false
  ): Promise<RemoteCkeSheetsPack | null> {
    const packId = `cke_sheets_${subjectId}`;
    const manifest = await syncContentManifest(forceManifest);
    const entry = manifest?.packs?.[packId];
    if (!entry) return null;
    return loadPackByEntry<RemoteCkeSheetsPack>(packId, entry);
  }

  async function prefetchSubjectPacks(subjectId: SubjectId): Promise<number> {
    const manifest = await syncContentManifest(false);
    if (!manifest) return 0;

    const ids = [...SUBJECT_CHAPTER_IDS[subjectId], `cke_sheets_${subjectId}`];
    let loaded = 0;
    await Promise.all(
      ids.map(async (id) => {
        const entry = manifest.packs[id];
        if (!entry) return;
        try {
          await loadPackByEntry(id, entry);
          loaded += 1;
        } catch {
          // Prefetch w tle nie przerywa pracy
        }
      })
    );
    return loaded;
  }

  return {
    syncContentManifest,
    loadChapterPack,
    loadCkeSheetsPack,
    prefetchSubjectPacks,
    clearCache: clearAllPackCache,
  };
}

export const contentPackService = createContentPackService();
