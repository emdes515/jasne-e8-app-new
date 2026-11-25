'use client';

import { useEffect, useState } from 'react';
import {
  deleteUser,
  getAdditionalUserInfo,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuthClient, isFirebaseConfigured } from '../../lib/firebase';
import {
  createLegalConsentRecord,
  isValidAgeBracket,
  type AgeBracket,
  type ConsentPath,
} from '../../lib/legalAgeGate';
import { syncLegalConsentToCloud } from '../../services/storage/cloudUserSync';
import { localStateRepo } from '../../services/storage/localStateRepo';

export const MAGIC_EMAIL_KEY = 'jasne_e8_magic_link_email';
export const MAGIC_CONSENT_KEY = 'jasne_e8_magic_link_consent';
export const ONBOARDING_DRAFT_KEY = 'jasne_e8_onboarding_draft';

type PendingMagicConsent = {
  email: string;
  ageBracket: AgeBracket;
  consentPath: ConsentPath;
  expiresAt: number;
};

let magicLinkCompletionPromise: Promise<void> | null = null;

function readPendingMagicConsent(email: string): PendingMagicConsent | null {
  try {
    const raw = window.localStorage.getItem(MAGIC_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingMagicConsent>;
    if (
      typeof parsed.email !== 'string' ||
      parsed.email.toLowerCase() !== email.toLowerCase() ||
      !isValidAgeBracket(parsed.ageBracket) ||
      (parsed.consentPath !== 'guardian_for_minor' && parsed.consentPath !== 'self_16_plus') ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt < Date.now()
    ) {
      return null;
    }
    return parsed as PendingMagicConsent;
  } catch {
    return null;
  }
}

export function useCloudAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const auth = getFirebaseAuthClient();
    if (!auth) return;

    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem(MAGIC_EMAIL_KEY);
      if (storedEmail && !magicLinkCompletionPromise) {
        magicLinkCompletionPromise = (async () => {
          try {
            const cred = await signInWithEmailLink(auth, storedEmail, window.location.href);
            const isNewUser = Boolean(getAdditionalUserInfo(cred)?.isNewUser);
            const pendingConsent = readPendingMagicConsent(storedEmail);

            if (isNewUser && !pendingConsent) {
              await deleteUser(cred.user).catch(() => signOut(auth));
            } else if (pendingConsent) {
              const consent = createLegalConsentRecord({
                consentPath: pendingConsent.consentPath,
                ageBracket: pendingConsent.ageBracket,
                uid: cred.user.uid,
              });
              const loaded = localStateRepo.load().state;
              const updatedState = {
                ...loaded,
                ageBracket: pendingConsent.ageBracket,
                legalConsent: consent,
              };
              localStateRepo.saveImmediate(updatedState);
              await syncLegalConsentToCloud(cred.user, updatedState, consent);
            }
          } catch {
            // Obsłużone cicho — użytkownik może ponowić logowanie w modalu
          } finally {
            window.localStorage.removeItem(MAGIC_EMAIL_KEY);
            window.localStorage.removeItem(MAGIC_CONSENT_KEY);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })();
      }
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser && !fbUser.isAnonymous ? fbUser : null);
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  return { user, loading: configured && loading, configured };
}
