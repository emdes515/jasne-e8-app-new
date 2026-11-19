'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  X,
  Bookmark,
  BookOpen,
  Lightbulb,
  Heart,
  Flame,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { aiTutorService } from '../../services/ai/aiTutorMock';
import { AiTutorEvaluationResult } from '../../types/repositories';
import { LumiMood, TaskEvalOutcome } from '../../types/domain';
import {
  getComboMultiplier,
  HEART_REFILL_PRICE,
  isComboExpired,
} from '../../lib/gamification';
import { SPRING_BOUNCY, SPRING_SNAPPY } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { AnswerOptionCard } from './AnswerOptionCard';
import { SmartMathKeyboard } from './SmartMathKeyboard';
import { OpenTaskAiBox } from './OpenTaskAiBox';

export function TaskRunner() {
  const {
    state,
    submitSessionTaskAnswer,
    advanceSessionTaskOrFinish,
    abortActiveSession,
    toggleTaskSaved,
    setFormulasOpen,
    setRescueModalOpen,
    buyHeartWithCoins,
    startLessonTasks,
    playSound,
  } = useAppState();
  const prefersReduced = useReducedMotion();

  const session = state.activeSession;
  const currentTaskId = session?.taskIds[session.currentIndex] ?? '';
  const currentTask = ALL_TASKS_BY_ID[currentTaskId];

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [openAnswer, setOpenAnswer] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintsSheetOpen, setHintsSheetOpen] = useState<boolean>(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState<boolean>(false);
  const [bookmarkAnimTick, setBookmarkAnimTick] = useState<number>(0);

  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiEvaluation, setAiEvaluation] =
    useState<AiTutorEvaluationResult | null>(null);

  const [checkedFeedback, setCheckedFeedback] = useState<{
    outcome: TaskEvalOutcome;
    xpAwarded: number;
    lumiMood: LumiMood;
  } | null>(null);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Tick every second to check 90s combo expiration in lesson/practice
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset local input states when currentTaskId changes
  useEffect(() => {
    setSelectedOption('');
    setNumericAnswer('');
    setOpenAnswer('');
    setHintsUsed(0);
    setAiEvaluation(null);
    setIsAiEvaluating(false);
    setCheckedFeedback(null);
  }, [currentTaskId]);

  // Surprised mood transitions to supportive after 1s on wrong answer (Master Spec Section 3.2 #5)
  useEffect(() => {
    if (checkedFeedback?.lumiMood === 'surprised') {
      const timer = setTimeout(() => {
        setCheckedFeedback((prev) =>
          prev ? { ...prev, lumiMood: 'supportive' } : null
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkedFeedback?.lumiMood]);

  if (!session || !currentTask) {
    return null;
  }

  // Check if session was interrupted by reaching 0 hearts (Section 6.5 Step C.1 & AC-H7)
  if (session.interruptedByZeroHearts) {
    return (
      <div className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--danger)] shadow-[0_6px_0_0_var(--danger-edge)] p-6 sm:p-8 text-center space-y-5">
        <div className="flex justify-center">
          <LumiMascot mood="supportive" loadout={state.loadout} size="lg" />
        </div>

        <div>
          <div className="text-xs font-extrabold font-display text-[var(--danger)] mb-1">
            Stan Serc: {state.hearts}/5
          </div>
          <h2 className="text-2xl font-extrabold font-display text-[var(--text-primary)]">
            Serca się skończyły!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-md mx-auto leading-relaxed">
            Twój dotychczasowy postęp w lekcji ({Object.keys(session.answers).length}{' '}
            z {session.taskIds.length} zadań) został bezpiecznie zapisany.
            Odzyskaj serce, aby wznowić dokładnie od kolejnego zadania!
          </p>
        </div>

        {state.hearts > 0 ? (
          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              startLessonTasks();
            }}
          >
            <Play className="w-5 h-5" />
            <span>Kontynuuj lekcję (od zadania {session.currentIndex + 2})</span>
          </TactileButton>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TactileButton
              variant="info"
              size="lg"
              fullWidth
              onClick={() => setRescueModalOpen(true)}
            >
              Misja Ratunkowa (+1 Serce)
            </TactileButton>
            <TactileButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                buyHeartWithCoins();
              }}
            >
              Sklep — {HEART_REFILL_PRICE} monet (+1 Serce)
            </TactileButton>
          </div>
        )}

        <TactileButton
          variant="secondary"
          size="md"
          fullWidth
          onClick={abortActiveSession}
        >
          Wróć później (postęp zapisany)
        </TactileButton>
      </div>
    );
  }

  const totalTasks = session.taskIds.length;
  const currentStepNum = session.currentIndex + 1;
  const progressPct = Math.round(
    ((session.currentIndex + (checkedFeedback ? 1 : 0)) / totalTasks) * 100
  );

  // Active combo count (0 if 90s expired)
  const comboExpired = isComboExpired(session.lastAnsweredAt, nowMs, false);
  const activeComboCount = comboExpired ? 0 : session.comboCount;
  const comboMultiplier = getComboMultiplier(activeComboCount);

  const isBookmarked = state.savedTasks.some(
    (s) => s.key === `${currentTask.id}:${currentTask.subjectId}`
  );

  const handleCheckClosedOrNumeric = () => {
    if (checkedFeedback) return;

    if (
      currentTask.type === 'abcd' ||
      currentTask.type === 'true_false'
    ) {
      if (!selectedOption) return;
      const isCorrect = selectedOption === currentTask.correctAnswer;
      const outcome: TaskEvalOutcome = isCorrect ? 'correct' : 'wrong';
      const res = submitSessionTaskAnswer({
        taskId: currentTask.id,
        userAnswer: selectedOption,
        outcome,
        hintsUsed,
      });
      setCheckedFeedback({
        outcome,
        xpAwarded: res.xpAwarded,
        lumiMood:
          outcome === 'correct'
            ? res.newComboCount >= 5
              ? 'celebrate'
              : 'happy'
            : 'surprised',
      });
      return;
    }

    if (currentTask.type === 'numeric') {
      const cleaned = numericAnswer.trim().replace(',', '.');
      if (!cleaned) return;
      const expected = currentTask.correctAnswer.trim().replace(',', '.');
      const numUser = Number(cleaned);
      const numExp = Number(expected);
      const isCorrect =
        (!Number.isNaN(numUser) &&
          !Number.isNaN(numExp) &&
          Math.abs(numUser - numExp) < 1e-9) ||
        cleaned === expected;

      const outcome: TaskEvalOutcome = isCorrect ? 'correct' : 'wrong';
      const res = submitSessionTaskAnswer({
        taskId: currentTask.id,
        userAnswer: numericAnswer.trim(),
        outcome,
        hintsUsed,
      });
      setCheckedFeedback({
        outcome,
        xpAwarded: res.xpAwarded,
        lumiMood:
          outcome === 'correct'
            ? res.newComboCount >= 5
              ? 'celebrate'
              : 'happy'
            : 'surprised',
      });
    }
  };

  const handleEvaluateOpenTask = async () => {
    if (checkedFeedback || isAiEvaluating || !currentTask.rubric) return;
    playSound('tap');
    setIsAiEvaluating(true);

    const evalRes = await aiTutorService.evaluateOpenTask(
      openAnswer,
      currentTask.rubric
    );
    setIsAiEvaluating(false);
    setAiEvaluation(evalRes);

    // Map 2/2 -> 'correct', 1/2 -> 'partial' (no heart loss, combo unchanged, no Mistake Bank!), 0/2 -> 'wrong'
    const outcome: TaskEvalOutcome =
      evalRes.score === 2
        ? 'correct'
        : evalRes.score === 1
        ? 'partial'
        : 'wrong';

    const res = submitSessionTaskAnswer({
      taskId: currentTask.id,
      userAnswer: openAnswer,
      outcome,
      hintsUsed,
      aiScore: evalRes.score,
      aiFeedback: evalRes.feedback,
      matchedKeywords: evalRes.matchedKeywords,
    });

    setCheckedFeedback({
      outcome,
      xpAwarded: res.xpAwarded,
      lumiMood:
        outcome === 'correct'
          ? 'celebrate'
          : outcome === 'partial'
          ? 'happy'
          : 'surprised',
    });
  };

  const taskTypeLabel =
    currentTask.type === 'abcd'
      ? 'Wybór ABCD'
      : currentTask.type === 'true_false'
      ? 'Prawda / Fałsz'
      : currentTask.type === 'numeric'
      ? 'Wpisz wynik'
      : 'Otwarte • AI Tutor';

  return (
    <>
      <div className="space-y-4 pb-8">
        {/* Session Top Progress & Combo Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              setExitConfirmOpen(true);
            }}
            aria-label="Przerwij sesję"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Progress Bar with Shimmer & Combo x3.0 Border Opacity Pulse (Choreography #5 & #6) */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-extrabold font-display tabular-nums">
              <span className="text-[var(--text-secondary)] truncate">
                {session.source === 'rescue'
                  ? `Misja Ratunkowa (${state.rescueMissionCurrentProgress}/2 do +1 Serca)`
                  : session.title}
              </span>
              <span className="text-[var(--text-primary)] shrink-0 ml-2">
                {currentStepNum} / {totalTasks}
              </span>
            </div>

            <div className="relative h-3.5 w-full rounded-full bg-[var(--bg-canvas)] border-2 border-[var(--border-subtle)] overflow-hidden">
              {comboMultiplier >= 3.0 && !prefersReduced && (
                <motion.span
                  aria-hidden="true"
                  animate={{ opacity: [0.45, 0.85, 0.45] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-[var(--combo-fire)] pointer-events-none z-10"
                />
              )}
              <motion.div
                className="relative h-full bg-[var(--accent-primary)] rounded-full overflow-hidden"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={SPRING_SNAPPY}
              >
                {!prefersReduced && (
                  <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-progress-shimmer" />
                )}
              </motion.div>
            </div>
          </div>

          {/* Dynamic Combo Badge (x1.5 / x2.0 / x3.0) + Hearts Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <AnimatePresence>
              {comboMultiplier > 1.0 && (
                <motion.div
                  key={`combo-${comboMultiplier}`}
                  initial={{ scale: 0.5, rotate: -6, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.75, opacity: 0 }}
                  transition={SPRING_BOUNCY}
                  className="relative px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--combo-fire)] flex items-center gap-1 text-xs font-extrabold font-display tabular-nums text-[var(--combo-fire)]"
                >
                  {comboMultiplier >= 2.0 && !prefersReduced && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [0.55, 0.9, 0.55] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-[var(--combo-fire)] pointer-events-none"
                    />
                  )}
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>x{comboMultiplier.toFixed(1)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="min-h-[40px] px-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-1 text-xs font-extrabold font-display tabular-nums">
              <Heart className="w-4 h-4 text-[var(--danger)] fill-[var(--danger)]" />
              <span>{state.hearts}</span>
            </div>
          </div>
        </div>

        {/* Task Toolbar (No scratchpad! Bookmark "Zapisz do powtórki" + Wzory E8 + Podpowiedź AI) */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            <span>Zadanie {currentStepNum} z {totalTasks}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-[var(--accent-text)]">{taskTypeLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 1. Bookmark "Zapisz do powtórki" (Choreography #7) */}
            <motion.button
              type="button"
              key={bookmarkAnimTick}
              animate={
                bookmarkAnimTick > 0 && !prefersReduced
                  ? {
                      scale: [1, 1.38, 1],
                      rotate: [0, -14, 6, 0],
                    }
                  : {}
              }
              transition={SPRING_BOUNCY}
              onClick={() => {
                setBookmarkAnimTick(Date.now());
                toggleTaskSaved(currentTask.id, currentTask.subjectId);
              }}
              aria-label="Zapisz do powtórki"
              className={`min-h-[44px] px-3 rounded-xl border-2 flex items-center gap-1.5 text-xs font-extrabold font-display transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)] text-[var(--accent-text)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
              />
              <span>{isBookmarked ? 'Zapisane' : 'Zapisz do powtórki'}</span>
            </motion.button>

            {/* 2. "Wzory E8" strictly only for Math (AC-G4) */}
            {state.activeSubject === 'math' && (
              <button
                type="button"
                onClick={() => {
                  playSound('tap');
                  setFormulasOpen(true);
                }}
                className="min-h-[44px] px-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-primary)] flex items-center gap-1.5 text-xs font-extrabold font-display text-[var(--text-primary)] cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Wzory E8</span>
              </button>
            )}

            {/* 3. AI Hints Button (-33% XP per level) */}
            <button
              type="button"
              onClick={() => {
                playSound('tap');
                setHintsSheetOpen(true);
              }}
              className="min-h-[44px] px-3 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[var(--info)] flex items-center gap-1.5 text-xs font-extrabold font-display text-[var(--info)] cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Podpowiedź AI ({hintsUsed}/3)</span>
            </button>
          </div>
        </div>

        {/* Horizontal Slide Between Questions (Choreography #6: AnimatePresence mode="wait") */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.18 }}
            className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)] p-5 sm:p-6 space-y-5"
          >
            {/* Topic Kicker & Question Prompt */}
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                {currentTask.topicTag}
              </div>
              <div className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
                <MathText text={currentTask.prompt} />
              </div>
            </div>

            {/* Task Type 1: ABCD or True/False */}
            {(currentTask.type === 'abcd' ||
              currentTask.type === 'true_false') &&
              currentTask.options && (
                <div className="space-y-3">
                  {currentTask.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    let checkedState:
                      | 'idle'
                      | 'correct'
                      | 'wrong'
                      | 'missed_correct' = 'idle';

                    if (checkedFeedback) {
                      if (opt.id === currentTask.correctAnswer) {
                        checkedState = isSelected
                          ? 'correct'
                          : 'missed_correct';
                      } else if (isSelected) {
                        checkedState = 'wrong';
                      }
                    }

                    return (
                      <AnswerOptionCard
                        key={opt.id}
                        option={opt}
                        selected={isSelected}
                        checkedState={checkedState}
                        disabled={Boolean(checkedFeedback)}
                        showParticles={
                          Boolean(checkedFeedback) &&
                          checkedFeedback?.outcome === 'correct' &&
                          isSelected
                        }
                        onSelect={(id) => {
                          playSound('tap');
                          setSelectedOption(id);
                        }}
                      />
                    );
                  })}
                </div>
              )}

            {/* Task Type 2: Numeric Input with SmartMathKeyboard */}
            {currentTask.type === 'numeric' && (
              <SmartMathKeyboard
                value={numericAnswer}
                onChange={setNumericAnswer}
                disabled={Boolean(checkedFeedback)}
                onSubmit={handleCheckClosedOrNumeric}
              />
            )}

            {/* Task Type 3: Open Task with AI Tutor */}
            {currentTask.type === 'open' && (
              <OpenTaskAiBox
                value={openAnswer}
                onChange={setOpenAnswer}
                isEvaluating={isAiEvaluating}
                evaluation={aiEvaluation}
                disabled={Boolean(checkedFeedback)}
                onEvaluate={handleEvaluateOpenTask}
                loadout={state.loadout}
              />
            )}

            {/* Primary Check Button for Closed & Numeric Tasks */}
            {!checkedFeedback && currentTask.type !== 'open' && (
              <div className="pt-2">
                <TactileButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={
                    (currentTask.type === 'abcd' ||
                      currentTask.type === 'true_false') &&
                    !selectedOption
                      ? true
                      : currentTask.type === 'numeric' &&
                        !numericAnswer.trim()
                  }
                  onClick={handleCheckClosedOrNumeric}
                >
                  Sprawdź odpowiedź
                </TactileButton>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Feedback Sheet / Card after checking answer */}
        <AnimatePresence>
          {checkedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={SPRING_SNAPPY}
              className={`rounded-3xl border-2 p-5 sm:p-6 space-y-4 ${
                checkedFeedback.outcome === 'correct'
                  ? 'bg-[var(--bg-surface)] border-[var(--success)] shadow-[0_6px_0_0_var(--success-edge)]'
                  : checkedFeedback.outcome === 'partial'
                  ? 'bg-[var(--bg-surface)] border-[var(--accent-primary)] shadow-[0_6px_0_0_var(--accent-primary-edge)]'
                  : 'bg-[var(--bg-surface)] border-[var(--danger)] shadow-[0_6px_0_0_var(--danger-edge)]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <LumiMascot
                    mood={checkedFeedback.lumiMood}
                    loadout={state.loadout}
                    size="xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {checkedFeedback.outcome === 'correct' ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                      ) : checkedFeedback.outcome === 'partial' ? (
                        <AlertCircle className="w-5 h-5 text-[var(--accent-text)]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--danger)]" />
                      )}
                      <h3 className="text-base sm:text-lg font-extrabold font-display text-[var(--text-primary)]">
                        {checkedFeedback.outcome === 'correct'
                          ? 'Świetna robota!'
                          : checkedFeedback.outcome === 'partial'
                          ? 'Częściowe punkty (1/2 pkt CKE — bez utraty serca!)'
                          : 'Tym razem pudło — zadanie trafiło do Banku Błędów'}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      <strong className="text-[var(--text-primary)]">
                        Wyjaśnienie:
                      </strong>{' '}
                      <MathText text={currentTask.explanation} />
                    </p>
                  </div>
                </div>

                {checkedFeedback.xpAwarded > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--on-accent)] text-xs font-extrabold font-display tabular-nums shrink-0">
                    +{checkedFeedback.xpAwarded} XP
                  </div>
                )}
              </div>

              <TactileButton
                variant={
                  checkedFeedback.outcome === 'correct'
                    ? 'success'
                    : checkedFeedback.outcome === 'partial'
                    ? 'primary'
                    : 'danger'
                }
                size="lg"
                fullWidth
                onClick={advanceSessionTaskOrFinish}
              >
                <span>
                  {session.currentIndex + 1 < totalTasks
                    ? 'Dalej'
                    : 'Zakończ i odbierz podsumowanie'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </TactileButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3-Level Socratic AI Hints Bottom Sheet (-33% XP per level) */}
      <BottomSheet
        open={hintsSheetOpen}
        onClose={() => setHintsSheetOpen(false)}
        title="Podpowiedzi Sokratyczne AI Tutora"
        subtitle="Każdy odkryty poziom obniża maks. XP tego zadania o 33% (zawsze min. 1 XP, bez wpływu na Combo i Serca!)"
      >
        <div className="space-y-3">
          {currentTask.hints.map((hintText, idx) => {
            const level = idx + 1;
            const isUnlocked = hintsUsed >= level;
            const isNextToUnlock = hintsUsed === idx;

            return (
              <div
                key={level}
                className={`p-4 rounded-2xl border-2 ${
                  isUnlocked
                    ? 'bg-[var(--bg-elevated)] border-[var(--info)]'
                    : 'bg-[var(--bg-canvas)]/60 border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-extrabold font-display text-[var(--info)]">
                    Poziom {level} z 3{' '}
                    {level === 1
                      ? '(Pojęcie • -33% XP)'
                      : level === 2
                      ? '(Pierwszy krok • -66% XP)'
                      : '(Szkielet obliczeń • min. 1 XP)'}
                  </span>
                  {isUnlocked && (
                    <span className="text-[11px] font-bold text-[var(--success)]">
                      Odkryta ✓
                    </span>
                  )}
                </div>

                {isUnlocked ? (
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                    <MathText text={hintText} />
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Podpowiedź ukryta — nie zdradza gotowego wyniku.
                    </span>
                    {isNextToUnlock && !checkedFeedback && (
                      <TactileButton
                        variant="info"
                        size="sm"
                        onClick={() => {
                          playSound('tap');
                          setHintsUsed(level);
                        }}
                      >
                        Odkryj poziom {level}
                      </TactileButton>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* Exit Session Confirmation Modal (Section 6.5 Step C.2) */}
      <BottomSheet
        open={exitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        title="Przerwać sesję?"
        subtitle="Postęp zostanie zapisany, ale lekcja nie zostanie jeszcze ukończona"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Możesz wrócić do swoich rozwiązanych zadań w każdej chwili z ekranu
            Start. Monety i pełne podsumowanie otrzymasz po rozwiązaniu
            wszystkich zadań w sesji.
          </p>
          <div className="flex gap-3">
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setExitConfirmOpen(false)}
            >
              Zostań w zadaniach
            </TactileButton>
            <TactileButton
              variant="danger"
              size="md"
              fullWidth
              onClick={() => {
                setExitConfirmOpen(false);
                abortActiveSession();
              }}
            >
              Przerwij i zapisz
            </TactileButton>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
