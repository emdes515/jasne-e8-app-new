'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
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
import { getFirebaseAuthClient } from '../../lib/firebase';
import { MAGIC_EMAIL_KEY, useCloudAuthUser } from './useCloudAuthUser';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

const FREE_UNLOCK_BENEFITS = [
  'Dostęp do kolejnych lekcji',
  'Teoria Bento z przykładami i pułapkami egzaminacyjnymi',
  'Zadania zamknięte ze wskazówkami i rozwiązaniami',
] as const;

export { useCloudAuthUser } from './useCloudAuthUser';

type AccountModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
  showPlanLink?: boolean;
};

export function CloudAccountModal(props: AccountModalProps) {
  return props.open ? <AccountEntry {...props} /> : null;
}

function AccountEntry(props: AccountModalProps) {
  const { user, loading, configured } = useCloudAuthUser();
  const [confirmed, setConfirmed] = useState(false);
  if (!configured || user || confirmed) return <AccountForm {...props} />;

  return (
    <BottomSheet open onClose={props.onClose} title="Konto ucznia" subtitle={props.subtitleOverride} maxWidthClass="max-w-md">
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Rodzicu lub opiekunie, załóż konto ucznia przy użyciu własnego adresu e-mail. Konto daje dostęp do kolejnych lekcji.
        </p>
        <TactileButton fullWidth disabled={loading} onClick={() => setConfirmed(true)}>
          Jestem rodzicem lub opiekunem
        </TactileButton>
        <TactileButton fullWidth variant="secondary" onClick={props.onClose}>Wróć do nauki</TactileButton>
      </div>
    </BottomSheet>
  );
}

function AccountForm({
  open,
  onClose,
  onSuccess,
  titleOverride,
  subtitleOverride,
  showPlanLink = true,
}: AccountModalProps) {
  const { user, configured } = useCloudAuthUser();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'entry' | 'login' | 'register' | 'fallback'>('entry');
  const [fallbackMode, setFallbackMode] = useState<'login' | 'register'>('login');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSuccess = () => {
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
          'Logowanie przez Google jest teraz niedostępne. Możesz zalogować się e-mailem.'
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

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError('Podaj poprawny adres e-mail.');
      return;
    }
    setEmail(cleaned);
    setError(null);
    setInfo(null);
    setEmailStep('fallback');
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
          ? 'Konto ucznia'
          : titleOverride ?? 'Konto ucznia'
      }
      subtitle={
        user
          ? 'Twoje darmowe konto jest aktywne.'
          : subtitleOverride ?? 'Rodzicu lub opiekunie, zaloguj się własnymi danymi albo załóż konto.'
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
          <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5">
            <h3 className="text-sm font-extrabold">Co daje konto ucznia?</h3>
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
                <label htmlFor={emailId} className="block text-xs font-bold text-[var(--text-secondary)]">Adres e-mail</label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Wpisz swój adres e-mail…"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
                />
                <TactileButton type="submit" variant="secondary" size="md" fullWidth disabled={busy}>
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
                  className="min-h-[44px] inline-flex items-center gap-1 px-2.5 -mr-1.5 rounded-lg font-bold text-[var(--accent-text)] hover:underline cursor-pointer shrink-0"
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
                    className={`min-h-[44px] rounded-lg text-xs font-extrabold font-display cursor-pointer ${
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
                    className={`min-h-[44px] rounded-lg text-xs font-extrabold font-display cursor-pointer ${
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
                <label htmlFor={passwordId} className="block text-xs font-bold text-[var(--text-secondary)]">
                  Hasło
                </label>
                <input
                  id={passwordId}
                  type="password"
                  autoComplete={activePasswordMode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
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
                      ? 'Załóż konto ucznia'
                      : 'Zaloguj się'}
                  </span>
                </TactileButton>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSendMagicLink}
                  className="min-h-[44px] inline-flex items-center gap-1 px-2 -ml-2 rounded-lg font-bold text-[var(--info)] hover:underline cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Wyślij link bez hasła</span>
                </button>
                {activePasswordMode === 'login' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleResetPassword}
                    className="min-h-[44px] inline-flex items-center px-2 -mr-2 rounded-lg font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Nie pamiętam hasła
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-[var(--danger)]/12 border border-[var(--danger)]/40 px-3 py-2 text-xs font-semibold text-[var(--danger)]">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="rounded-xl bg-[var(--success)]/12 border border-[var(--success)]/40 px-3 py-2 text-xs font-semibold text-[var(--success)]">
              {info}
            </p>
          )}
          {showPlanLink && emailStep === 'entry' && (
            <div className="border-t border-[var(--border-subtle)] text-center">
              <Link href="/pro" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--info)] hover:underline">
                Porównaj darmowe konto i Pro <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
