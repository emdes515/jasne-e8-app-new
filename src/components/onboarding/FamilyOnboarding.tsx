'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, ShieldCheck, Timer } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { parseStudyReminder, WEEKDAYS } from '../../lib/studyReminders';
import type { DailyGoalMinutes, OnboardingAudience, StudyReminder, StudyStageId } from '../../types/domain';
import { CloudAccountModal } from '../auth/CloudAccountModal';
import { LumiMascot } from '../mascot/LumiMascot';
import { ReminderCloudActions } from '../reminders/ReminderCloudActions';
import { ReminderPreferences } from '../reminders/ReminderPreferences';
import { TactileButton } from '../ui/TactileButton';
import styles from './familyOnboarding.module.css';

const GOALS: DailyGoalMinutes[] = [5, 10, 15];
const STEPS = ['Start', 'Tempo', 'Plan', 'Pierwsza lekcja'];

export function FamilyOnboarding() {
  const { completeOnboarding, playSound } = useAppState();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<OnboardingAudience>('student');
  const [goal, setGoal] = useState<DailyGoalMinutes>(10);
  const [stage, setStage] = useState<StudyStageId>('grade8');
  const [reminder, setReminder] = useState<StudyReminder | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const pendingFocusStepRef = useRef<number | null>(null);
  const schedule = parseStudyReminder(reminder);

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

  function finish(startFirstLesson: boolean) {
    completeOnboarding({
      nickname: 'BłyskLogiki',
      studyStage: stage,
      activeSubject: 'math',
      dailyGoalMinutes: goal,
      starterColor: 'gold_spark',
      audience,
      studyReminder: schedule,
      startFirstLesson,
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {step > 0 ? (
          <button type="button" className={styles.back} onClick={() => goTo(step - 1)}><ArrowLeft size={18} aria-hidden="true" /> Wstecz</button>
        ) : <span className="font-display font-extrabold">JASNE E8</span>}
        <ol className={styles.steps} aria-label="Przebieg konfiguracji">
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
              <LumiMascot size="xl" mood={step === 3 ? 'celebrate' : step === 2 ? 'thinking' : 'happy'} />
            </motion.div>
          </div>
          <span className={styles.stamp}>{step === 3 ? 'Gotowe do startu' : 'Matematyka E8'}</span>
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
                <h1 id="family-step-0" data-step={0} tabIndex={-1} ref={setHeadingRef}>Matematyka E8.<em>Po jednym kroku.</em></h1>
                <p>Krótka teoria, zadania jak na egzaminie i jasne wyjaśnienia. Kto zaczyna?</p>
                <div className={styles.roles}>
                  <button type="button" onClick={() => { setAudience('student'); goTo(1); }}>
                    <GraduationCap className={styles.roleIcon} aria-hidden="true" />
                    <span><strong>Uczę się</strong><small>Zacznij pierwszą lekcję bez konta</small></span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => { setAudience('guardian'); goTo(1); }}>
                    <ShieldCheck className={styles.roleIcon} aria-hidden="true" />
                    <span><strong>Jestem rodzicem lub opiekunem</strong><small>Ustaw plan razem z uczniem</small></span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
                <button type="button" className={styles.textButton} onClick={() => setAccountOpen(true)}>Mam już konto ucznia</button>
              </>
            )}

            {step === 1 && (
              <>
                <h2 id="family-step-1" data-step={1} tabIndex={-1} ref={setHeadingRef}>{audience === 'guardian' ? 'Ustalcie tempo nauki' : 'Ile czasu masz na matematykę?'}</h2>
                <p>{audience === 'guardian' ? 'Wybierzcie krótki cel, który pasuje do planu ucznia.' : 'Wybierz dzienny cel. Możesz zmienić go później w ustawieniach.'}</p>
                <fieldset className={styles.goal}>
                  <legend className="sr-only">Dzienny cel nauki</legend>
                  {GOALS.map((minutes) => (
                    <button key={minutes} type="button" aria-pressed={goal === minutes} onClick={() => setGoal(minutes)}>
                      <Timer size={16} aria-hidden="true" /> <strong>{minutes} min</strong>
                    </button>
                  ))}
                </fieldset>
                <label className={styles.stage}>
                  Przygotowania
                  <select value={stage} onChange={(event) => setStage(event.target.value as StudyStageId)}>
                    <option value="grade8">Klasa 8</option>
                    <option value="grade7">Klasa 7</option>
                    <option value="revision">Powtórka materiału</option>
                  </select>
                </label>
                <TactileButton fullWidth onClick={() => goTo(2)}>Dalej <ArrowRight size={18} aria-hidden="true" /></TactileButton>
                {audience === 'student' && <button type="button" className={styles.textButton} onClick={() => finish(true)}>Otwórz lekcję od razu</button>}
              </>
            )}

            {step === 2 && (
              <>
                <h2 id="family-step-2" data-step={2} tabIndex={-1} ref={setHeadingRef}>Przypomnienia o nauce</h2>
                <p>Możesz włączyć codzienne przypomnienie teraz albo pominąć ten krok i wrócić w ustawieniach.</p>
                <ReminderPreferences value={reminder} onChange={setReminder} />
                <TactileButton fullWidth disabled={reminder !== null && !schedule} onClick={() => goTo(3)}>
                  {schedule ? 'Dalej z tym planem' : 'Dalej bez przypomnień'} <ArrowRight size={18} aria-hidden="true" />
                </TactileButton>
              </>
            )}

            {step === 3 && (
              <>
                <h2 id="family-step-3" data-step={3} tabIndex={-1} ref={setHeadingRef}>Zacznij od jednego zadania</h2>
                <p>Lumi pokaże Ci przykład i pomoże przejść do ćwiczeń.</p>
                <dl className={styles.summary}>
                  <div><dt>Dzienny cel</dt><dd>{goal} min</dd></div>
                  <div><dt>Przypomnienia</dt><dd>{schedule ? `${schedule.time} · ${schedule.days.map((day) => WEEKDAYS[day - 1]).join(', ')}` : 'Wyłączone'}</dd></div>
                </dl>
                <TactileButton fullWidth size="lg" onClick={() => finish(true)}><BookOpen size={19} aria-hidden="true" /> Otwórz pierwszą lekcję</TactileButton>
                <button type="button" className={styles.textButton} onClick={() => finish(false)}>Przejdź do Startu</button>
                {audience === 'guardian' && <ReminderCloudActions schedule={schedule} onLoad={setReminder} />}
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
      {accountOpen && <CloudAccountModal open onClose={() => setAccountOpen(false)} showPlanLink={false} />}
    </main>
  );
}
