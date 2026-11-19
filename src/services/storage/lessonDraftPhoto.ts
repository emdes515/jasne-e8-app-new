const DATABASE = 'jasne-e8-lesson-drafts';
const STORE = 'photos';

async function withPhotos<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const request = operation(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function loadLessonDraftPhoto(sessionId: string): Promise<File | undefined> {
  return withPhotos('readonly', (store) => store.get(sessionId));
}

export function saveLessonDraftPhoto(sessionId: string, photo: File | null) {
  if (photo) return withPhotos('readwrite', (store) => store.put(photo, sessionId));
  return withPhotos('readwrite', (store) => store.delete(sessionId));
}

export function clearLessonDraftPhotos() {
  return withPhotos('readwrite', (store) => store.clear());
}
