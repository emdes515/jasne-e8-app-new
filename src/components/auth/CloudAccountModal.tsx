'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type Ref } from 'react';
import Link from 'next/link';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { ArrowRight, CheckCircle2, Cloud, CloudOff, KeyRound, Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getFirebaseAuthClient } from '../../lib/firebase';
import {
  AGE_BRACKET_OPTIONS,
  createLegalConsentRecord,
  requiresGuardianConsent,
  validateRegistrationConsent,
  type AgeBracket,
  type ConsentPath,
} from '../../lib/legalAgeGate';
import { syncLegalConsentToCloud } from '../../services/storage/cloudUserSync';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';
import { MAGIC_CONSENT_KEY, MAGIC_EMAIL_KEY, useCloudAuthUser } from './useCloudAuthUser';

export { useCloudAuthUser } from './useCloudAuthUser';

const FREE_UNLOCK_BENEFITS = [
  'Dostęp do kolejnych lekcji',
  'Teoria Bento z przykładami i pułapkami egzaminacyjnymi',
  'Zadania zamknięte ze wskazówkami i rozwiązaniami',
] as const;

const textButtonClass = 'min-h-11 rounded-xl px-2 text-sm font-bold text-[var(--info)] hover:underline cursor-pointer';
const inputClass = 'w-full min-h-11 px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--text-secondary)]/70 focus:border-[var(--accent-primary)] focus:outline-none text-sm';

type AuthMode = 'login' | 'register';
type EntryStep = 'age' | 'guardian' | 'adult';
type Registration = { consentPath: ConsentPath; ageBracket: AgeBracket };

type AccountModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
  showPlanLink?: boolean;
  skipGuardianGate?: boolean;
  initialAgeBracket?: AgeBracket;
  initialConsentPath?: ConsentPath;
  initialMode?: 'gate' | 'login' | 'register';
};

export function CloudAccountModal(props: AccountModalProps) {
  return props.open ? <AccountEntry {...props} /> : null;
}

function AccountEntry(props: AccountModalProps) {
  const { user, loading, configured } = useCloudAuthUser();
  const { state, setAgeBracket, recordLegalConsent } = useAppState();
  const [selectedAgeBracket, setSelectedAgeBracket] = useState(props.initialAgeBracket);
  const effectiveAgeBracket = selectedAgeBracket ?? state.ageBracket;
  const needsGuardian = Boolean(effectiveAgeBracket && requiresGuardianConsent(effectiveAgeBracket));
  const [consentPath, setConsentPath] = useState(() => {
    if (props.initialMode === 'gate') return undefined;
    if (needsGuardian && props.initialConsentPath === 'self_16_plus') return undefined;
    return props.initialConsentPath;
  });
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    if (props.initialMode === 'login') return 'login';
    if (props.initialMode === 'gate' || props.initialMode === 'register' || consentPath) return 'register';
    return props.skipGuardianGate ? 'login' : 'register';
  });
  const [chosenEntryStep, setEntryStep] = useState<EntryStep>();
  const entryStep = chosenEntryStep ?? (needsGuardian ? 'guardian' : 'age');
  const [shareStatus, setShareStatus] = useState('');
  const [signOutError, setSignOutError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const entryHeading = useRef<HTMLHeadingElement>(null);
  const registration = consentPath && effectiveAgeBracket && (!needsGuardian || consentPath === 'guardian_for_minor')
    ? { consentPath, ageBracket: effectiveAgeBracket }
    : undefined;
  const flow = authMode === 'login' || registration ? 'form' : entryStep;
  const previousFlow = useRef(flow);

  useEffect(() => {
    if (previousFlow.current !== flow) {
      entryHeading.current?.focus();
    }
    previousFlow.current = flow;
  }, [flow]);

  const chooseAge = (bracket: AgeBracket) => {
    setSelectedAgeBracket(bracket);
    setAgeBracket(bracket);
    setShareStatus('');

    if (requiresGuardianConsent(bracket)) {
      setConsentPath(consentPath === 'guardian_for_minor' ? consentPath : undefined);
      setEntryStep('guardian');
    } else if (bracket === 'age_16_17') {
      setConsentPath('self_16_plus');
    } else {
      setConsentPath(undefined);
      setEntryStep('adult');
    }
  };

  const returnToAgeGate = () => {
    setConsentPath(undefined);
    setEntryStep('age');
  };

  const shareGuardianLink = async () => {
    const url = new URL('/prywatnosc#wiek', window.location.origin).href;
    setShareStatus('');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'JASNE E8 — zasady dla uczniów i opiekunów', url });
        setShareStatus('Udostępniono link dla opiekuna.');
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Skopiowano link dla opiekuna.');
    } catch {
      setShareStatus('Nie udało się skopiować linku. Otwórz zasady prywatności, aby skopiować adres.');
    }
  };

  const saveConsent = async (account: User, { consentPath, ageBracket }: Registration) => {
    const consent = createLegalConsentRecord({ consentPath, ageBracket, uid: account.uid });
    recordLegalConsent(consent);
    await syncLegalConsentToCloud(account, { ...state, ageBracket, legalConsent: consent }, consent);
  };

  const handleSignOut = async () => {
    const auth = getFirebaseAuthClient();
    if (!auth) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      await signOut(auth);
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <BottomSheet
      open
      onClose={props.onClose}
      title={user ? 'Konto ucznia' : props.titleOverride ?? 'Konto ucznia'}
      subtitle={user ? 'Twoje darmowe konto jest aktywne.' : props.subtitleOverride}
      maxWidthClass="max-w-md"
    >
      {!configured ? (
        <div className="space-y-3">
          <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="flex items-start gap-3">
              <CloudOff className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              Brak konfiguracji Firebase w tym środowisku. Postępy zapisują się lokalnie.
            </p>
            <Link href="/prywatnosc" className={'inline-flex items-center ' + textButtonClass}>Prywatność i RODO</Link>
          </div>
          <TactileButton variant="secondary" fullWidth onClick={props.onClose}>
            Wróć do nauki
          </TactileButton>
        </div>
      ) : loading ? (
        <p role="status" className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Sprawdzamy konto…
        </p>
      ) : user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-4">
            <ShieldCheck className="size-6 shrink-0 text-[var(--success)]" aria-hidden="true" />
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-[var(--text-primary)]">
                {user.email ?? user.displayName ?? 'Konto zalogowane'}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Wszystkie lekcje i zadania zamknięte są odblokowane.
              </div>
            </div>
          </div>
          <TactileButton variant="secondary" fullWidth disabled={signingOut} onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Wyloguj się
          </TactileButton>
          {signOutError && <p role="alert" className="text-sm text-[var(--danger)]">Nie udało się wylogować. Spróbuj ponownie.</p>}
        </div>
      ) : flow === 'form' ? (
        <AccountForm
          authMode={authMode}
          registration={registration}
          onModeChange={setAuthMode}
          onChangePath={returnToAgeGate}
          onRegister={saveConsent}
          onSuccess={() => {
            props.onSuccess?.();
            props.onClose();
          }}
          headingRef={entryHeading}
          showPlanLink={props.showPlanLink}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div aria-hidden="true" className="shrink-0">
              <LumiMascot size="xs" mood="supportive" loadout={state.loadout} />
            </div>
            <div>
              <h3 ref={entryHeading} tabIndex={-1} className="text-sm font-extrabold">
                {entryStep === 'guardian' ? 'Przekaż telefon rodzicowi lub opiekunowi' :
                  entryStep === 'adult' ? 'Dla kogo zakładasz konto?' : 'Wybierz swój przedział wieku'}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                {entryStep === 'guardian'
                  ? 'Kodeks cywilny od 13 lat daje ograniczoną zdolność do czynności prawnych. W Polsce próg samodzielnej zgody z art. 8 RODO wynosi 16 lat. Wcześniej bezpłatne konto zakłada rodzic lub opiekun prawny.'
                  : 'Bezpłatne konto ucznia odblokowuje kolejne lekcje.'}
              </p>
            </div>
          </div>

          {entryStep === 'guardian' ? (
            <>
              <TactileButton fullWidth onClick={() => setConsentPath('guardian_for_minor')}>
                Rodzic jest obok — przejdź do zgody i rejestracji
              </TactileButton>
              <TactileButton fullWidth variant="secondary" onClick={shareGuardianLink}>
                Udostępnij / skopiuj link dla rodzica
              </TactileButton>
              <p role="status" className="empty:hidden text-sm text-[var(--text-secondary)]">{shareStatus}</p>
              {shareStatus.startsWith('Nie udało') && (
                <Link href="/pro#opiekunowie" className={'inline-flex items-center ' + textButtonClass}>Informacje dla opiekunów</Link>
              )}
            </>
          ) : entryStep === 'adult' ? (
            <>
              <TactileButton fullWidth variant="secondary" onClick={() => setConsentPath('guardian_for_minor')}>
                Zakładam konto dla ucznia (&lt; 16 lat)
              </TactileButton>
              <TactileButton fullWidth variant="secondary" onClick={() => setConsentPath('self_16_plus')}>
                Zakładam konto dla siebie (18+)
              </TactileButton>
              <button type="button" className={textButtonClass} onClick={returnToAgeGate}>Zmień przedział wieku</button>
            </>
          ) : (
            <div className="grid gap-2">
              {AGE_BRACKET_OPTIONS.map(({ id, label }) => (
                <TactileButton key={id} fullWidth size="sm" variant="secondary" onClick={() => chooseAge(id)}>
                  {label}
                </TactileButton>
              ))}
            </div>
          )}

          <button type="button" onClick={() => setAuthMode('login')} className={'w-full ' + textButtonClass}>
            Mam już konto — zaloguj się
          </button>
          <TactileButton fullWidth variant="secondary" onClick={props.onClose}>Wróć do nauki bez konta</TactileButton>
        </div>
      )}
    </BottomSheet>
  );
}

function AccountForm({
  authMode,
  registration,
  onModeChange,
  onChangePath,
  onRegister,
  onSuccess,
  headingRef,
  showPlanLink = true,
}: {
  authMode: AuthMode;
  registration?: Registration;
  onModeChange: (mode: AuthMode) => void;
  onChangePath: () => void;
  onRegister: (user: User, registration: Registration) => Promise<void>;
  onSuccess: () => void;
  headingRef: Ref<HTMLHeadingElement>;
  showPlanLink?: boolean;
}) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageOrGuardianConfirmed, setAgeOrGuardianConfirmed] = useState(false);
  const [privacyAndTermsAccepted, setPrivacyAndTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const isRegistering = authMode === 'register';
  const isGuardian = registration?.consentPath === 'guardian_for_minor';

  const changeMode = (mode: AuthMode) => {
    if (mode === authMode) return;
    setAgeOrGuardianConfirmed(false);
    setPrivacyAndTermsAccepted(false);
    setPassword('');
    setError(null);
    setInfo(null);
    onModeChange(mode);
  };

  const validateConsent = (): Registration | undefined => {
    setInfo(null);
    if (!registration) {
      setError('Wybierz, kto zakłada konto.');
      return;
    }
    const result = validateRegistrationConsent({
      consentPath: registration.consentPath,
      ageOrGuardianConfirmed,
      privacyAndTermsAccepted,
    });
    if (!result.ok) {
      setError(result.error ?? 'Potwierdź wymagane zgody.');
      return;
    }
    return registration;
  };

  const getEmail = () => {
    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setInfo(null);
      setError('Podaj poprawny adres e-mail.');
      return;
    }
    return cleaned;
  };

  const handleGoogleSignIn = async () => {
    const consent = isRegistering ? validateConsent() : undefined;
    if (isRegistering && !consent) return;
    const auth = getFirebaseAuthClient();
    if (!auth) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const isNewUser = Boolean(getAdditionalUserInfo(cred)?.isNewUser);
      if (!isRegistering && isNewUser) {
        await deleteUser(cred.user).catch(() => signOut(auth));
        onChangePath();
        onModeChange('register');
        setError('To konto Google nie ma jeszcze profilu w JASNE E8 — wybierz przedział wieku i potwierdź zasady prywatności.');
        return;
      }
      if (consent) await onRegister(cred.user, consent);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('Logowanie przez Google jest teraz niedostępne. Użyj e-maila.');
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Zamknięto okno logowania Google.');
      } else {
        setError('Nie udało się połączyć z Google. Spróbuj ponownie lub użyj e-maila.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>, mode: AuthMode) => {
    event.preventDefault();
    const consent = mode === 'register' ? validateConsent() : undefined;
    if (mode === 'register' && !consent) return;
    const auth = getFirebaseAuthClient();
    const address = getEmail();
    if (!auth || !address || !password) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (consent) {
        const cred = await createUserWithEmailAndPassword(auth, address, password);
        await onRegister(cred.user, consent);
      } else {
        await signInWithEmailAndPassword(auth, address, password);
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('auth/email-already-in-use')) {
        changeMode('login');
        setError('Ten e-mail ma już konto — przełączamy na logowanie hasłem.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Hasło musi mieć co najmniej 6 znaków.');
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Nie udało się zalogować. Sprawdź dane lub wyślij link bez hasła.');
      } else {
        setError('Nie udało się połączyć z kontem. Sprawdź dane i spróbuj ponownie.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSendMagicLink = async () => {
    const consent = isRegistering ? validateConsent() : undefined;
    if (isRegistering && !consent) return;
    const auth = getFirebaseAuthClient();
    const address = getEmail();
    if (!auth || !address) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await sendSignInLinkToEmail(auth, address, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(MAGIC_EMAIL_KEY, address);
      if (consent) {
        window.localStorage.setItem(
          MAGIC_CONSENT_KEY,
          JSON.stringify({
            email: address,
            ageBracket: consent.ageBracket,
            consentPath: consent.consentPath,
            expiresAt: Date.now() + 30 * 60 * 1000,
          }),
        );
      } else {
        window.localStorage.removeItem(MAGIC_CONSENT_KEY);
      }
      setInfo('Wysłaliśmy link na ' + address + '. Kliknij go na tym urządzeniu w ciągu 30 minut.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('auth/operation-not-allowed')
        ? 'Logowanie linkiem e-mail nie jest jeszcze włączone w Firebase — wpisz hasło.'
        : 'Nie udało się wysłać linku logowania.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    const auth = getFirebaseAuthClient();
    const address = getEmail();
    if (!auth || !address) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await sendPasswordResetEmail(auth, address);
      setInfo('Jeśli dla tego adresu istnieje konto, otrzymasz link do ustawienia nowego hasła.');
    } catch {
      setError('Nie udało się wysłać linku resetu hasła.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 ref={headingRef} tabIndex={-1} className="sr-only">Logowanie i rejestracja</h3>
      <div role="group" aria-label="Sposób dostępu do konta" className="grid grid-cols-2 gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
        {(['register', 'login'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={busy}
            aria-pressed={authMode === mode}
            onClick={() => changeMode(mode)}
            className={'min-h-[44px] cursor-pointer rounded-lg px-2 text-xs font-extrabold font-display ' +
              (authMode === mode ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}
          >
            {mode === 'register' ? 'Załóż nowe konto' : 'Mam już konto'}
          </button>
        ))}
      </div>

      {isRegistering && registration && (
        <>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3">
            <p className="py-2 text-xs font-bold">
              {isGuardian ? 'Rejestracja przez rodzica/opiekuna (uczeń < 16 lat)' : 'Rejestracja samodzielna (16+ lat)'}
            </p>
            <button type="button" disabled={busy} className={textButtonClass} onClick={onChangePath} aria-label="Zmień ścieżkę rejestracji">Zmień</button>
          </div>

          <fieldset disabled={busy} className="space-y-2">
            <legend className="mb-2 text-sm font-extrabold">Oświadczenie i zasady pilotażu</legend>
            <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--text-secondary)]/55 p-3 text-sm leading-snug">
              <input
                type="checkbox"
                required
                checked={ageOrGuardianConfirmed}
                onChange={(event) => setAgeOrGuardianConfirmed(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--accent-primary)]"
              />
              <span>
                {isGuardian
                  ? 'Potwierdzam, że jestem rodzicem lub opiekunem prawnym ucznia poniżej 16 lat i wyrażam zgodę na założenie konta oraz przetwarzanie danych (art. 8 RODO, art. 17–18 KC).'
                  : 'Potwierdzam, że mam ukończone 16 lat i samodzielnie zakładam bezpłatne konto ucznia (art. 8 RODO).'}
              </span>
            </label>
            <div className="rounded-xl border border-[var(--text-secondary)]/55 p-3 text-sm leading-snug">
              <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  checked={privacyAndTermsAccepted}
                  onChange={(event) => setPrivacyAndTermsAccepted(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--accent-primary)]"
                />
                <span>
                  Akceptuję Zasady pilotażu (v2026-11-24) i potwierdzam zapoznanie się z Polityką prywatności (art. 13 RODO).
                </span>
              </label>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-6">
                <Link href="/prywatnosc#regulamin" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-xs font-bold text-[var(--info)] underline">
                  Zasady pilotażu
                </Link>
                <Link href="/prywatnosc" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-xs font-bold text-[var(--info)] underline">
                  Polityka prywatności
                </Link>
              </div>
            </div>
          </fieldset>

          <details className="rounded-xl border border-[var(--text-secondary)]/55 px-3 text-sm">
            <summary className="min-h-11 cursor-pointer py-3 font-bold">Skrócona informacja o danych (art. 13 RODO)</summary>
            <p className="pb-3 leading-relaxed text-[var(--text-secondary)]">
              Do obsługi konta używamy adresu e-mail, ksywki i zgody. Nie wyświetlamy reklam.
              Baza Firestore działa w regionie europe-central2 (Warszawa), a uwierzytelnianie Firebase Auth
              (Google LLC) przetwarza dane w USA na podstawie standardowych klauzul umownych (SCC).
              Masz prawo żądać usunięcia danych i złożyć skargę do Prezesa UODO.
            </p>
          </details>
        </>
      )}

      <TactileButton size="lg" fullWidth disabled={busy} onClick={handleGoogleSignIn}>
        {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Cloud className="size-4" aria-hidden="true" />}
        Kontynuuj z Google
      </TactileButton>

      <form onSubmit={(event) => handlePasswordSubmit(event, authMode)} className="space-y-2.5">
        <label htmlFor={emailId} className="block text-xs font-bold text-[var(--text-secondary)]">Adres e-mail</label>
        <input id={emailId} type="email" autoComplete="email" required disabled={busy} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        <label htmlFor={passwordId} className="block text-xs font-bold text-[var(--text-secondary)]">Hasło{isRegistering && ' (co najmniej 6 znaków)'}</label>
        <input id={passwordId} type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} required minLength={isRegistering ? 6 : undefined} disabled={busy} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        <TactileButton type="submit" variant="secondary" fullWidth disabled={busy}>
          <KeyRound className="size-4" aria-hidden="true" />
          {isRegistering ? 'Załóż konto ucznia' : 'Zaloguj się'}
        </TactileButton>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <button type="button" disabled={busy} onClick={handleSendMagicLink} className={'inline-flex items-center gap-1 ' + textButtonClass}>
          <Mail className="size-3.5" aria-hidden="true" />
          Wyślij link bez hasła
        </button>
        {!isRegistering && (
          <button type="button" disabled={busy} onClick={handleResetPassword} className={textButtonClass}>Nie pamiętam hasła</button>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/12 px-3 py-2 text-sm text-[var(--danger)]">{error}</p>}
      {info && <p role="status" className="rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/12 px-3 py-2 text-sm text-[var(--success)]">{info}</p>}

      {isRegistering && (
        <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5">
          <h4 className="text-sm font-extrabold">Co daje konto ucznia?</h4>
          <ul className="space-y-1.5">
            {FREE_UNLOCK_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-xs leading-snug">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showPlanLink && (
        <div className="border-t border-[var(--border-subtle)] text-center">
          <Link href="/pro" className={'inline-flex items-center gap-1.5 ' + textButtonClass}>
            Porównaj darmowe konto i Pro <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
