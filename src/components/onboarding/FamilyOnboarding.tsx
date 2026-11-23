'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { CloudAccountModal } from '../auth/CloudAccountModal';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import styles from './familyOnboarding.module.css';

const STEPS = ['Start', 'Dla opiekuna'];

export function FamilyOnboarding() {
  const { completeOnboarding, playSound } = useAppState();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [skipGuardianGate, setSkipGuardianGate] = useState(false);
  const pendingFocusStepRef = useRef<number | null>(null);

  const setHeadingRef = useCallback((node: HTMLHeadingElement | null) => {
    if (!node) return;
    const nodeStep = Number(node.dataset.step);
    if (pendingFocusStepRef.current !== nodeStep) return;
    pendingFocusStepRef.current = null;
    node.focus({ preventScroll: true });
  }, []);

  function goTo(next: number) {
    playSound('tap');
    pendingFocusStepRef.current = next;
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function finish(startFirstLesson: boolean, audience: 'student' | 'guardian' = 'student') {
    completeOnboarding({
      nickname: 'BłyskLogiki',
      studyStage: 'grade8',
      activeSubject: 'math',
      dailyGoalMinutes: 10,
      starterColor: 'gold_spark',
      audience,
      studyReminder: null,
      startFirstLesson,
    });
  }

  function openAccountModal(skipGate: boolean) {
    playSound('tap');
    setSkipGuardianGate(skipGate);
    setAccountOpen(true);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {step > 0 ? (
          <button type="button" className={styles.back} onClick={() => goTo(0)}>
            <ArrowLeft size={18} aria-hidden="true" /> Wstecz
          </button>
        ) : (
          <span className="font-display font-extrabold">JASNE E8</span>
        )}
        <ol className={styles.steps} aria-label="Przebieg startu">
          {STEPS.map((label, index) => (
            <li key={label} data-done={index <= step} aria-current={index === step ? 'step' : undefined}>
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className={styles.workspace}>
        <div className={styles.art} aria-hidden="true">
          <div className={styles.mascotScale}>
            <motion.div
              className={styles.lumi}
              initial={reduced ? false : { y: 14, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <LumiMascot size="xl" mood={step === 1 ? 'supportive' : 'happy'} />
            </motion.div>
          </div>
          <span className={styles.stamp}>{step === 1 ? 'Dla opiekuna' : 'Matematyka E8'}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            className={styles.card}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            aria-labelledby={`family-step-${step}`}
          >
            {step === 0 && (
              <>
                <h1 id="family-step-0" data-step={0} tabIndex={-1} ref={setHeadingRef}>
                  Matematyka E8.<em>Po jednym kroku.</em>
                </h1>
                <p>
                  Krótka teoria, zadania jak na egzaminie i jasne wyjaśnienia. Pierwszą lekcję zrobisz od razu bez konta.
                </p>
                <TactileButton fullWidth size="lg" onClick={() => finish(true, 'student')}>
                  <BookOpen size={19} aria-hidden="true" />
                  <span>Zacznij pierwszą lekcję</span>
                </TactileButton>
                <div className={styles.roles}>
                  <button type="button" onClick={() => goTo(1)}>
                    <ShieldCheck className={styles.roleIcon} aria-hidden="true" />
                    <span>
                      <strong>Jestem rodzicem lub opiekunem</strong>
                      <small>Zobacz jak działa nauka i kiedy potrzebne jest konto</small>
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
                <button type="button" className={styles.textButton} onClick={() => openAccountModal(true)}>
                  Mam już konto
                </button>
              </>
            )}

            {step === 1 && (
              <>
                <h2 id="family-step-1" data-step={1} tabIndex={-1} ref={setHeadingRef}>
                  Nauka do E8 pod kontrolą
                </h2>
                <p>
                  Pierwsza lekcja działa od razu lokalnie na urządzeniu bez rejestracji. Od drugiej lekcji wymagane jest
                  bezpłatne konto — dla uczniów poniżej 16 lat zakłada je rodzic lub opiekun swoim adresem e-mail.
                </p>
                <p>
                  Aplikacja jest bezpłatna i nie zawiera ukrytych opłat. Dzienny cel nauki oraz przypomnienia w otwartej
                  aplikacji ustawicie później w Profilu.
                </p>
                <TactileButton fullWidth size="lg" onClick={() => finish(true, 'guardian')}>
                  <BookOpen size={19} aria-hidden="true" />
                  <span>Uruchom pierwszą lekcję</span>
                </TactileButton>
                <button type="button" className={styles.textButton} onClick={() => openAccountModal(false)}>
                  Załóż konto lub zaloguj się
                </button>
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {accountOpen && (
        <CloudAccountModal
          open
          onClose={() => setAccountOpen(false)}
          onSuccess={() => finish(false, step === 1 ? 'guardian' : 'student')}
          skipGuardianGate={skipGuardianGate}
          showPlanLink={false}
        />
      )}
    </main>
  );
}
