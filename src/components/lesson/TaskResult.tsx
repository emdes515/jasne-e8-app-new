'use client';

import { useEffect, useState, type Ref } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Flame,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { LumiLoadout, LumiMood, TaskDefinition, TaskEvalOutcome } from '../../types/domain';
import { hasVisualWork, type OpenWorkDraft } from '../../lib/openWork';
import { SPRING_BOUNCY, SPRING_SNAPPY } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';
import { OpenWorkPad } from './OpenWorkPad';
import { PhotoPreview } from './OpenWorkPhoto';

const OUTCOME_CONFIG = {
  correct: {
    title: 'Świetna robota!',
    subtitle: 'Dokładnie tak na egzaminie E8.',
    icon: CheckCircle2,
    color: 'var(--success)',
    bannerClass: 'bg-[var(--success)]/12 border-[var(--success)]/45',
    badgeClass: 'bg-[var(--success)] text-[var(--on-success)]',
  },
  wrong: {
    title: 'Tym razem inaczej',
    subtitle: 'Zapisano w Banku Błędów — zobacz krok po kroku.',
    icon: XCircle,
    color: 'var(--danger)',
    bannerClass: 'bg-[var(--danger)]/12 border-[var(--danger)]/45',
    badgeClass: 'bg-[var(--danger)] text-[var(--on-danger)]',
  },
  partial: {
    title: 'Częściowe punkty',
    subtitle: 'Dobry kierunek — sprawdź brakujący element.',
    icon: AlertCircle,
    color: 'var(--accent-text)',
    bannerClass: 'bg-[var(--accent-primary)]/12 border-[var(--accent-primary)]/45',
    badgeClass: 'bg-[var(--accent-primary)] text-[var(--on-accent)]',
  },
  ungraded: {
    title: 'Rozwiązanie porównane',
    subtitle: 'Sprawdź swój tok rozumowania z kluczem CKE.',
    icon: CheckCircle2,
    color: 'var(--accent-text)',
    bannerClass: 'bg-[var(--info)]/12 border-[var(--info)]/40',
    badgeClass: 'bg-[var(--info)] text-[var(--on-info)]',
  },
} as const;

/**
 * Dzieli tekst wyjaśnienia na czytelne kroki bez rozcinania wyrażeń KaTeX `$...$`.
 */
function splitExplanationIntoSteps(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts: string[] = [];
  let current = '';
  let inMath = false;

  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    if (ch === '$' && trimmed[i - 1] !== '\\') {
      inMath = !inMath;
      current += ch;
      continue;
    }

    current += ch;

    if (!inMath && (ch === '.' || ch === ';') && (trimmed[i + 1] === ' ' || i === trimmed.length - 1)) {
      const candidate = current.trim();
      if (candidate.length > 0) {
        parts.push(candidate);
        current = '';
      }
    }
  }

  const tail = current.trim();
  if (tail) parts.push(tail);

  // Merge tiny fragments (e.g. "Np.") with the following step so steps stay meaningful.
  const merged: string[] = [];
  for (const part of parts) {
    if (merged.length > 0 && part.length < 18) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${part}`;
    } else {
      merged.push(part);
    }
  }

  return merged.length > 0 ? merged : [trimmed];
}

export function TaskResult({
  task,
  headingRef,
  outcome,
  xpAwarded,
  comboMultiplier = 1,
  loadout,
  userAnswer,
  tutorScore,
  tutorFeedback,
  isSaved,
  onToggleSaved,
  onContinue,
  continueLabel,
  visualWork,
}: {
  task: TaskDefinition;
  headingRef: Ref<HTMLHeadingElement>;
  outcome: TaskEvalOutcome;
  xpAwarded: number;
  comboMultiplier?: number;
  loadout?: LumiLoadout;
  userAnswer?: string;
  tutorScore?: number;
  tutorFeedback?: string;
  isSaved: boolean;
  onToggleSaved: () => void;
  onContinue: () => void;
  continueLabel: string;
  visualWork: OpenWorkDraft;
}) {
  const prefersReduced = useReducedMotion();
  const cfg = OUTCOME_CONFIG[outcome];
  const Icon = cfg.icon;
  const expectedAnswer = task.options?.find((option) => option.id === task.correctAnswer)?.label ?? task.correctAnswer;
  const submittedAnswer = task.options?.find((option) => option.id === userAnswer)?.label ?? userAnswer;

  // Lumi emotional choreography: surprised -> supportive after 900ms on wrong answer
  const [wrongSettled, setWrongSettled] = useState(false);
  useEffect(() => {
    if (outcome !== 'wrong') return;
    const timer = window.setTimeout(() => setWrongSettled(true), 900);
    return () => window.clearTimeout(timer);
  }, [outcome, task.id]);

  const lumiMood: LumiMood =
    outcome === 'correct'
      ? comboMultiplier >= 1.5
        ? 'celebrate'
        : 'happy'
      : outcome === 'wrong'
      ? wrongSettled
        ? 'supportive'
        : 'surprised'
      : 'thinking';

  const steps =
    task.explanationSteps && task.explanationSteps.length > 0
      ? task.explanationSteps
      : splitExplanationIntoSteps(task.explanation);

  const trapNote =
    task.ckeTrapNote?.trim() ||
    (outcome === 'wrong'
      ? 'Na egzaminie E8 dystraktory często powstają przez pominięcie znaku, zamianę kolejności działań lub złe zaokrąglenie. Sprawdź krok po kroku, gdzie rozeszły się wyniki.'
      : '');

  const goldenHabit = task.goldenHabit?.trim() || task.hints[0];

  return (
    <motion.section
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
      animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={prefersReduced ? { duration: 0.12 } : SPRING_SNAPPY}
      className="study-panel task-result overflow-hidden"
      aria-labelledby="task-result-heading"
    >
      <div className="task-result-content">
        {/* 1. Tactile Outcome Banner with Lumi */}
        <div
          className={`rounded-2xl border-2 p-3 sm:p-4 flex items-center gap-3 ${cfg.bannerClass}`}
        >
          <div className="shrink-0">
            <LumiMascot mood={lumiMood} loadout={loadout} size="sm" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                ref={headingRef}
                tabIndex={-1}
                id="task-result-heading"
                className="flex items-center gap-2 text-lg font-extrabold leading-tight focus-visible:outline-none sm:text-xl"
              >
                <Icon size={20} className="shrink-0" style={{ color: cfg.color }} aria-hidden="true" />
                <span>{cfg.title}</span>
              </h2>

              <div className="flex items-center gap-1.5 shrink-0">
                {comboMultiplier > 1.0 && outcome === 'correct' && (
                  <motion.span
                    initial={prefersReduced ? false : { scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_BOUNCY}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface)] border border-[var(--combo-fire)] px-2 py-0.5 text-xs font-extrabold font-display text-[var(--combo-fire)] tabular-nums"
                  >
                    <Flame size={12} className="fill-current" aria-hidden="true" />
                    x{comboMultiplier.toFixed(1)}
                  </motion.span>
                )}
                {xpAwarded > 0 && (
                  <motion.span
                    initial={prefersReduced ? false : { scale: 0.65, y: 4 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={SPRING_BOUNCY}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-primary)] px-2.5 py-0.5 text-xs font-extrabold font-display text-[var(--on-accent)] tabular-nums"
                  >
                    <Sparkles size={12} aria-hidden="true" />
                    +{xpAwarded} XP
                  </motion.span>
                )}
              </div>
            </div>

            <p className="text-xs font-medium text-[var(--text-secondary)]">
              {tutorScore !== undefined
                ? `${tutorScore}/2 pkt · Ocena symulowana · ${cfg.subtitle}`
                : cfg.subtitle}
            </p>
          </div>
        </div>

        {/* 2. Answer comparison on wrong closed/numeric tasks */}
        {outcome === 'wrong' && task.type !== 'open' && (
          <dl className="task-result-answers">
            {submittedAnswer && (
              <div className="border-[var(--danger)]/40 bg-[var(--danger)]/8">
                <dt>Twoja odpowiedź</dt>
                <dd className="text-[var(--danger)]">
                  <MathText text={submittedAnswer} />
                </dd>
              </div>
            )}
            <div className="border-[var(--success)]/45 bg-[var(--success)]/10">
              <dt>Poprawna odpowiedź</dt>
              <dd className="text-[var(--success)]">
                <MathText text={expectedAnswer} />
              </dd>
            </div>
          </dl>
        )}

        {/* 3. Structured 3-Section Explanation */}
        <div className="space-y-2.5">
          {/* Section A: Step-by-step solution */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 sm:p-4 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
              1. Rozwiązanie krok po kroku
            </h3>
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--text-primary)] sm:text-[15px]"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-extrabold font-display text-[var(--accent-text)] tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 break-words">
                    <MathText text={step} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Section B: E8 Trap / Why other options tempt */}
          {trapNote && (
            <div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/6 p-3 sm:p-3.5 flex items-start gap-2.5">
              <ShieldAlert size={17} className="mt-0.5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--danger)]">
                  2. Pułapka E8 — na co uważać
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
                  <MathText text={trapNote} />
                </div>
              </div>
            </div>
          )}

          {/* Section C: Golden Exam Habit */}
          {goldenHabit && (
            <div className="rounded-2xl border border-[var(--info)]/35 bg-[var(--info)]/8 p-3 sm:p-3.5 flex items-start gap-2.5">
              <Lightbulb size={17} className="mt-0.5 shrink-0 text-[var(--info)]" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--info)]">
                  {trapNote ? '3. Złoty odruch egzaminacyjny' : '2. Złoty odruch egzaminacyjny'}
                </h4>
                <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
                  <MathText text={goldenHabit} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Collapsible Task & User Work Details */}
        <details className="task-result-details">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            Pokaż zadanie i szczegóły
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <div className="space-y-3 pb-2 text-sm">
            <p className="break-words"><MathText text={task.prompt} /></p>
            {task.type === 'open' && userAnswer && (
              <p className="whitespace-pre-wrap break-words">
                <strong>Twój zapis: </strong>{userAnswer}
              </p>
            )}
            {tutorFeedback && <p className="text-[var(--text-secondary)]">{tutorFeedback}</p>}
            {hasVisualWork(visualWork) && visualWork.mode === 'draw' && (
              <OpenWorkPad strokes={visualWork.strokes} disabled onChange={() => {}} />
            )}
            {visualWork.mode === 'photo' && visualWork.photo && <PhotoPreview file={visualWork.photo} />}
            <TactileButton size="sm" variant="secondary" aria-pressed={isSaved} onClick={onToggleSaved}>
              <Bookmark size={16} aria-hidden="true" />
              {isSaved ? 'Zapisane do powtórki' : 'Zapisz do powtórki'}
            </TactileButton>
          </div>
        </details>
      </div>

      <div className="task-result-action">
        <TactileButton fullWidth onClick={onContinue}>
          {continueLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </TactileButton>
      </div>
    </motion.section>
  );
}
