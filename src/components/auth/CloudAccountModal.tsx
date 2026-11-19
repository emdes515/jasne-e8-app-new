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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  CloudOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { getFirebaseAuthClient, isFirebaseConfigured } from '../../lib/firebase';
import { useAppState } from '../../context/AppStateContext';
import { initializeCloudUserProfile } from '../../services/storage/cloudUserSync';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

const MAGIC_EMAIL_KEY = 'jasne_e8_magic_link_email';

const FREE_UNLOCK_BENEFITS = [
  'Odblokowanie kolejnych dostępnych lekcji',
  'Teoria Bento z przykładami i pułapkami egzaminacyjnymi',
  'Zadania E8 z podpowiedziami i rozwiązaniami',
] as const;

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
  onSuccess,
  titleOverride,
  subtitleOverride,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
}) {
  const { user, configured } = useCloudAuthUser();
  const { state } = useAppState();
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'entry' | 'login' | 'register' | 'fallback'>('entry');
  const [fallbackMode, setFallbackMode] = useState<'login' | 'register'>('login');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setInfo(null);
  }, [open]);

  const handleSuccess = () => {
    const auth = getFirebaseAuthClient();
    if (auth?.currentUser) {
      void initializeCloudUserProfile(auth.currentUser, state);
    }
    onSuccess?.();
    onClose();
  };

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
      handleSuccess();
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

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError('Podaj poprawny adres e-mail.');
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleaned }),
      });
      const data = (await res.json()) as { exists?: boolean; known?: boolean };
      if (data.known) {
        setEmailStep(data.exists ? 'login' : 'register');
      } else {
        setEmailStep('fallback');
      }
    } catch {
      setEmailStep('fallback');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    const auth = getFirebaseAuthClient();
    if (!auth || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      handleSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/email-already-in-use')) {
        setError('Ten e-mail ma już konto — przełączamy na logowanie hasłem.');
        setEmailStep('login');
        setFallbackMode('login');
      } else if (msg.includes('auth/weak-password')) {
        setError('Hasło musi mieć co najmniej 6 znaków.');
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Nieprawidłowe hasło. Spróbuj ponownie lub wyślij link bez hasła.');
      } else {
        setError('Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSendMagicLink = async () => {
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
      setInfo(`Wysłaliśmy link logowania na ${email.trim()}. Kliknij go na tym urządzeniu!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('Logowanie linkiem e-mail nie jest jeszcze włączone w Firebase — wpisz hasło.');
      } else {
        setError('Nie udało się wysłać linku logowania.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    const auth = getFirebaseAuthClient();
    if (!auth || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo(`Wysłano link do ustawienia nowego hasła na ${email.trim()}.`);
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
      setInfo('Wylogowano. Nadal możesz korzystać z 1. lekcji jako Gość.');
    } finally {
      setBusy(false);
    }
  };

  const activePasswordMode: 'login' | 'register' =
    emailStep === 'register'
      ? 'register'
      : emailStep === 'login'
      ? 'login'
      : fallbackMode;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={
        user
          ? 'Konto w chmurze JASNE E8'
          : titleOverride ?? 'Odblokuj pełny dostęp za darmo'
      }
      subtitle={
        user
          ? 'Twoje darmowe konto Firebase jest aktywne.'
          : subtitleOverride ?? 'Zaloguj się lub załóż darmowe konto, aby odblokować kolejne lekcje.'
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
                Wszystkie lekcje i zadania zamknięte są odblokowane.
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
          {/* Free Benefits Checklist */}
          <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider font-display text-[var(--accent-text)]">
                Co odblokujesz po zalogowaniu
              </span>
              <span className="rounded-full bg-[var(--success)]/15 border border-[var(--success)]/40 px-2 py-0.5 text-[10px] font-extrabold font-display text-[var(--success)]">
                100% ZA DARMO
              </span>
            </div>
            <ul className="space-y-1.5">
              {FREE_UNLOCK_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-xs text-[var(--text-primary)] leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {emailStep === 'entry' ? (
            <>
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

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--border-subtle)]" />
                <span className="shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  lub e-mailem
                </span>
                <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>

              <form onSubmit={handleCheckEmail} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Wpisz swój adres e-mail…"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
                />
                <TactileButton type="submit" variant="info" size="md" fullWidth disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Dalej z e-mailem</span>
                </TactileButton>
              </form>
            </>
          ) : (
            <div className="space-y-3">
              {/* Email header with change button */}
              <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-xs">
                <div className="min-w-0">
                  <span className="text-[var(--text-secondary)]">
                    {emailStep === 'login'
                      ? 'Znaleziono konto: '
                      : emailStep === 'register'
                      ? 'Nowe darmowe konto: '
                      : 'E-mail: '}
                  </span>
                  <strong className="text-[var(--text-primary)] break-all">{email.trim()}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep('entry');
                    setPassword('');
                    setError(null);
                    setInfo(null);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-[var(--accent-text)] hover:underline cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Zmień
                </button>
              </div>

              {emailStep === 'fallback' && (
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setFallbackMode('login')}
                    className={`min-h-[36px] rounded-lg text-xs font-extrabold font-display cursor-pointer ${
                      fallbackMode === 'login'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    Mam już konto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFallbackMode('register')}
                    className={`min-h-[36px] rounded-lg text-xs font-extrabold font-display cursor-pointer ${
                      fallbackMode === 'register'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    Nowe konto
                  </button>
                </div>
              )}

              <form onSubmit={(e) => handlePasswordSubmit(e, activePasswordMode)} className="space-y-2.5">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    activePasswordMode === 'register'
                      ? 'Ustaw hasło (min. 6 znaków)'
                      : 'Wpisz swoje hasło'
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
                />
                <TactileButton type="submit" variant="primary" size="md" fullWidth disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>
                    {activePasswordMode === 'register'
                      ? 'Utwórz darmowe konto'
                      : 'Zaloguj się'}
                  </span>
                </TactileButton>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSendMagicLink}
                  className="inline-flex items-center gap-1 font-bold text-[var(--info)] hover:underline cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Wyślij link bez hasła</span>
                </button>
                {activePasswordMode === 'login' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleResetPassword}
                    className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Nie pamiętam hasła
                  </button>
                )}
              </div>
            </div>
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
