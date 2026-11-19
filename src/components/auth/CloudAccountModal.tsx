'use client';

import React, { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { Cloud, CloudOff, KeyRound, Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { getFirebaseAuthClient, isFirebaseConfigured } from '../../lib/firebase';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

const MAGIC_EMAIL_KEY = 'jasne_e8_magic_link_email';

export function useCloudAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuthClient();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Complete passwordless email link sign-in if returning from magic link
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

  return { user, loading, configured };
}

export function CloudAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, configured } = useCloudAuthUser();
  const [tab, setTab] = useState<'magic' | 'password'>('magic');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    const auth = getFirebaseAuthClient();
    if (!auth) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setInfo('Zalogowano przez Google! Twoje konto jest połączone z chmurą.');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError(
          'Logowanie Google wymaga włączenia w konsoli Firebase (Authentication → Sign-in method → Google). Możesz teraz użyć e-maila.'
        );
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Zamknięto okno logowania Google.');
      } else {
        setError('Nie udało się zalogować przez Google. Spróbuj ponownie lub użyj e-maila.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getFirebaseAuthClient();
    if (!auth || !email.trim()) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: window.location.origin,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(MAGIC_EMAIL_KEY, email.trim());
      setInfo(`Wysłaliśmy link logowania na adres ${email.trim()}. Kliknij go na tym urządzeniu!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('Logowanie bez hasła (Email Link) nie jest jeszcze włączone w Firebase. Użyj zakładki „E-mail i hasło”.');
      } else {
        setError('Nie udało się wysłać linku. Sprawdź poprawność adresu e-mail.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getFirebaseAuthClient();
    if (!auth || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setInfo('Konto utworzone! Twoje postępy są przypisane do konta.');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setInfo('Zalogowano pomyślnie!');
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/email-already-in-use')) {
        setError('Ten e-mail ma już konto — przełącz na logowanie.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Hasło musi mieć co najmniej 6 znaków.');
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Nieprawidłowy e-mail lub hasło.');
      } else {
        setError('Błąd logowania. Sprawdź dane i spróbuj ponownie.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    const auth = getFirebaseAuthClient();
    if (!auth || !email.trim()) {
      setError('Wpisz najpierw adres e-mail, aby zresetować hasło.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo(`Wysłano link resetu hasła na ${email.trim()}.`);
    } catch {
      setError('Nie udało się wysłać linku resetu hasła.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    const auth = getFirebaseAuthClient();
    if (!auth) return;
    setBusy(true);
    try {
      await signOut(auth);
      setInfo('Wylogowano. Nadal możesz korzystać z aplikacji w trybie gościa.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={user ? 'Konto w chmurze JASNE E8' : 'Zapisz swoje postępy'}
      subtitle={
        user
          ? 'Twoje konto Firebase jest aktywne.'
          : 'Uczysz się jako Gość. Zaloguj się, aby nie stracić serii, monet i Lumi.'
      }
    >
      {!configured ? (
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-secondary)] flex items-start gap-3">
          <CloudOff className="w-5 h-5 shrink-0 text-[var(--text-secondary)] mt-0.5" />
          <span>Brak konfiguracji Firebase w tym środowisku. Postępy zapisują się lokalnie.</span>
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--success)]/10 border border-[var(--success)]/40 p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[var(--success)] shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                {user.email ?? user.displayName ?? 'Konto zalogowane'}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                ID: {user.uid.slice(0, 12)}… · Połączono z Firebase
              </div>
            </div>
          </div>

          <TactileButton variant="secondary" size="md" fullWidth disabled={busy} onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            <span>Wyloguj się</span>
          </TactileButton>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Primary Google Sign-In */}
          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            onClick={handleGoogleSignIn}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
            <span>Kontynuuj z Google</span>
          </TactileButton>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-[var(--border-subtle)]" />
            <span className="bg-[var(--bg-surface)] px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              lub e-mailem
            </span>
            <span className="w-full border-t border-[var(--border-subtle)]" />
          </div>

          {/* 2. Mode switch: Magic Link vs Password */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setTab('magic');
                setError(null);
              }}
              className={`min-h-[38px] rounded-lg text-xs font-extrabold font-display cursor-pointer transition-colors ${
                tab === 'magic'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Link bez hasła
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('password');
                setError(null);
              }}
              className={`min-h-[38px] rounded-lg text-xs font-extrabold font-display cursor-pointer transition-colors ${
                tab === 'password'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              E-mail i hasło
            </button>
          </div>

          {tab === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
              />
              <TactileButton type="submit" variant="info" size="md" fullWidth disabled={busy}>
                <Mail className="w-4 h-4" />
                <span>Wyślij link logowania</span>
              </TactileButton>
            </form>
          ) : (
            <form onSubmit={handlePasswordAuth} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hasło (min. 6 znaków)"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
              />
              <TactileButton type="submit" variant="secondary" size="md" fullWidth disabled={busy}>
                <KeyRound className="w-4 h-4" />
                <span>{isRegister ? 'Utwórz konto' : 'Zaloguj się'}</span>
              </TactileButton>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsRegister((v) => !v)}
                  className="font-bold text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  {isRegister ? 'Mam już konto — zaloguj' : 'Nie masz konta? Zarejestruj się'}
                </button>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Nie pamiętam hasła
                  </button>
                )}
              </div>
            </form>
          )}

          {error && (
            <p className="rounded-xl bg-[var(--danger)]/12 border border-[var(--danger)]/40 px-3 py-2 text-xs font-semibold text-[var(--danger)]">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-[var(--success)]/12 border border-[var(--success)]/40 px-3 py-2 text-xs font-semibold text-[var(--success)]">
              {info}
            </p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
