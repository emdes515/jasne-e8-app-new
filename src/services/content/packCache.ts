import type { ContentManifest } from '../../types/contentPacks';

const DB_NAME = 'jasne-e8-content-packs';
const DB_VERSION = 1;
const STORE_META = 'meta';
const STORE_PACKS = 'packs';
const MANIFEST_KEY = 'content_manifest';

export interface CachedPackRecord<T = unknown> {
  packId: string;
  sha256: string;
  cachedAt: number;
  data: T;
}

const memoryMeta = new Map<string, unknown>();
const memoryPacks = new Map<string, CachedPackRecord>();

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openPackDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
      if (!db.objectStoreNames.contains(STORE_PACKS)) {
        db.createObjectStore(STORE_PACKS, { keyPath: 'packId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openPackDb();
  try {
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
    });
  } finally {
    db.close();
  }
}

async function idbPut<T>(storeName: string, value: T, key?: string): Promise<void> {
  const db = await openPackDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      if (key !== undefined) store.put(value, key);
      else store.put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB put failed'));
    });
  } finally {
    db.close();
  }
}

async function idbClear(storeName: string): Promise<void> {
  const db = await openPackDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB clear failed'));
    });
  } finally {
    db.close();
  }
}

export async function getCachedManifest(): Promise<ContentManifest | null> {
  if (!hasIndexedDb()) {
    return (memoryMeta.get(MANIFEST_KEY) as ContentManifest | undefined) ?? null;
  }
  try {
    return await idbGet<ContentManifest>(STORE_META, MANIFEST_KEY);
  } catch {
    return (memoryMeta.get(MANIFEST_KEY) as ContentManifest | undefined) ?? null;
  }
}

export async function setCachedManifest(manifest: ContentManifest): Promise<void> {
  memoryMeta.set(MANIFEST_KEY, manifest);
  if (!hasIndexedDb()) return;
  try {
    await idbPut(STORE_META, manifest, MANIFEST_KEY);
  } catch {
    // Fallback w pamięci już zapisany
  }
}

export async function getCachedPack<T>(packId: string): Promise<CachedPackRecord<T> | null> {
  if (!hasIndexedDb()) {
    return (memoryPacks.get(packId) as CachedPackRecord<T> | undefined) ?? null;
  }
  try {
    return await idbGet<CachedPackRecord<T>>(STORE_PACKS, packId);
  } catch {
    return (memoryPacks.get(packId) as CachedPackRecord<T> | undefined) ?? null;
  }
}

export async function setCachedPack<T>(record: CachedPackRecord<T>): Promise<void> {
  memoryPacks.set(record.packId, record);
  if (!hasIndexedDb()) return;
  try {
    await idbPut(STORE_PACKS, record);
  } catch {
    // Fallback w pamięci już zapisany
  }
}

export async function clearAllPackCache(): Promise<void> {
  memoryMeta.clear();
  memoryPacks.clear();
  if (!hasIndexedDb()) return;
  try {
    await Promise.all([idbClear(STORE_META), idbClear(STORE_PACKS)]);
  } catch {
    // Ignoruj błąd czyszczenia IDB
  }
}
