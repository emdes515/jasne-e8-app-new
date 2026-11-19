'use client';

import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, onAuthStateChanged, signInWithEmailLink, type User } from 'firebase/auth';
import { getFirebaseAuthClient, isFirebaseConfigured } from '../../lib/firebase';

export const MAGIC_EMAIL_KEY = 'jasne_e8_magic_link_email';

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
      if (storedEmail) {
        void signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem(MAGIC_EMAIL_KEY);
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(() => {});
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
