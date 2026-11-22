import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFirebaseAdminServiceAccount } from './firebaseAdmin';

test('Parsuje poprawny FIREBASE_SERVICE_ACCOUNT_JSON i normalizuje znaki nowej linii klucza', () => {
  const env = {
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      project_id: 'jasne-e8-app',
      client_email: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n',
    }),
  } as unknown as NodeJS.ProcessEnv;

  assert.deepEqual(parseFirebaseAdminServiceAccount(env), {
    projectId: 'jasne-e8-app',
    clientEmail: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n',
  });
});

test('Zwraca null i nie rzuca wyjątku dla uszkodzonego FIREBASE_SERVICE_ACCOUNT_JSON', () => {
  const env = {
    FIREBASE_SERVICE_ACCOUNT_JSON: '{bad',
  } as unknown as NodeJS.ProcessEnv;

  assert.equal(parseFirebaseAdminServiceAccount(env), null);
});

test('Zwraca null dla niekompletnego FIREBASE_SERVICE_ACCOUNT_JSON (brak wymaganych pól)', () => {
  const missingKey = {
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      project_id: 'jasne-e8-app',
      client_email: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
    }),
  } as unknown as NodeJS.ProcessEnv;

  const missingEmail = {
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      project_id: 'jasne-e8-app',
      private_key: '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n',
    }),
  } as unknown as NodeJS.ProcessEnv;

  const emptyProject = {
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
      project_id: '   ',
      client_email: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
      private_key: 'key',
    }),
  } as unknown as NodeJS.ProcessEnv;

  assert.equal(parseFirebaseAdminServiceAccount(missingKey), null);
  assert.equal(parseFirebaseAdminServiceAccount(missingEmail), null);
  assert.equal(parseFirebaseAdminServiceAccount(emptyProject), null);
});

test('Obsługuje rozbite zmienne środowiskowe przy braku JSON', () => {
  const env = {
    FIREBASE_PROJECT_ID: 'jasne-e8-app',
    FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: 'line1\\nline2',
  } as unknown as NodeJS.ProcessEnv;

  assert.deepEqual(parseFirebaseAdminServiceAccount(env), {
    projectId: 'jasne-e8-app',
    clientEmail: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
    privateKey: 'line1\nline2',
  });
});

test('Zwraca null dla pustego obiektu env', () => {
  assert.equal(parseFirebaseAdminServiceAccount({} as NodeJS.ProcessEnv), null);
});

test('Uszkodzony FIREBASE_SERVICE_ACCOUNT_JSON nie spada na rozbite zmienne i zwraca null', () => {
  const env = {
    FIREBASE_SERVICE_ACCOUNT_JSON: '{bad',
    FIREBASE_PROJECT_ID: 'jasne-e8-app',
    FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@jasne-e8-app.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: 'line1\\nline2',
  } as unknown as NodeJS.ProcessEnv;

  assert.equal(parseFirebaseAdminServiceAccount(env), null);
});
