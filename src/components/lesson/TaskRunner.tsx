'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Bookmark,
  BookOpen,
  Lightbulb,
  Flame,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { loadLessonDraftPhoto, saveLessonDraftPhoto } from '../../services/storage/lessonDraftPhoto';
import { aiTutorService, AI_ANALYSIS_UI_DURATION_MS } from '../../services/ai/aiTutorMock';
import { AiTutorEvaluationResult } from '../../types/repositories';
import { TaskEvalOutcome } from '../../types/domain';
import {
  getComboMultiplier,
  HEART_REFILL_PRICE,
  isComboExpired,
} from '../../lib/gamification';
import { SPRING_BOUNCY } from '../../lib/motionPresets';
import { formatHeartCountdown } from '../../lib/lumiCopy';
import { LumiMascot } from '../mascot/LumiMascot';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';
import { TactileHeartIcon } from '../ui/TactileHeartIcon';
import { BottomSheet } from '../ui/BottomSheet';
import { AnswerOptionCard } from './AnswerOptionCard';
import { SmartMathKeyboard } from './SmartMathKeyboard';
import { OpenTaskAiBox } from './OpenTaskAiBox';
import { TaskResult } from './TaskResult';
import { EMPTY_OPEN_WORK, evaluateVisualWork, getOpenAnswer, matchesMathResult, type OpenWorkDraft } from '../../lib/openWork';

export function TaskRunner() {
  const { state: { activeSession: session } } = useAppState();
  if (!session) return null;
  return <TaskRunnerQuestion key={session.sessionId + ':' + session.currentIndex} />;
}

function TaskRunnerQuestion() {
  const {
    state,
    secondsToNextHeart,
    submitSessionTaskAnswer,
    saveTaskDraft,
    pushToast,
    advanceSessionTaskOrFinish,
    abortActiveSession,
    toggleTaskSaved,
    setFormulasOpen,
    setRescueModalOpen,
    buyHeartWithCoins,
    resumeActiveTasks,
    playSound,
  } = useAppState();
  const prefersReduced = useReducedMotion();

  const session = state.activeSession;
  const currentTaskId = session?.taskIds[session.currentIndex] ?? '';
  const currentTask = ALL_TASKS_BY_ID[currentTaskId];
  const priorAnswer = session?.answers[currentTaskId];

  const savedDraft = session?.draft?.taskId === currentTaskId ? session.draft : undefined;
  const [selectedOption, setSelectedOption] = useState(priorAnswer?.userAnswer ?? savedDraft?.value ?? '');
  const [numericAnswer, setNumericAnswer] = useState(priorAnswer?.userAnswer ?? savedDraft?.value ?? '');
  const [openAnswer, setOpenAnswer] = useState(priorAnswer?.userAnswer ?? savedDraft?.value ?? '');
  const [openWork, setOpenWork] = useState({ ...EMPTY_OPEN_WORK, ...savedDraft?.work });
  const [hintsUsed, setHintsUsed] = useState(priorAnswer?.hintsUsed ?? savedDraft?.hintsUsed ?? 0);
  const [comparing, setComparing] = useState(false);
  const evaluationVersion = useRef(0);
  const photoEdited = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [hintsSheetOpen, setHintsSheetOpen] = useState<boolean>(false);
  const [aiHintLoading, setAiHintLoading] = useState<boolean>(false);
  const [aiHintText, setAiHintText] = useState<string | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState<boolean>(false);
  const [bookmarkAnimTick, setBookmarkAnimTick] = useState<number>(0);

  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiEvaluation, setAiEvaluation] =
    useState<AiTutorEvaluationResult | null>(null);

  const [checkedFeedback, setCheckedFeedback] = useState<{
    outcome: TaskEvalOutcome;
    xpAwarded: number;
  } | null>(() => priorAnswer ? {
    outcome: priorAnswer.outcome,
    xpAwarded: priorAnswer.xpAwarded,
  } : null);
  const [revealPhase, setRevealPhase] = useState<{
    outcome: TaskEvalOutcome;
    xpAwarded: number;
  } | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const hasResult = Boolean(checkedFeedback);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (hasResult && !showRecovery) resultHeading.current?.focus({ preventScroll: true });
  }, [hasResult, showRecovery]);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const sessionId = session?.sessionId;
  const taskType = currentTask?.type;
  useEffect(() => {
    if (!sessionId || taskType !== 'open' || priorAnswer) return;
    let active = true;
    void loadLessonDraftPhoto(sessionId).then((photo) => {
      if (active && photo && !photoEdited.current) setOpenWork((work) => ({ ...work, photo }));
    }).catch(() => {});
    return () => { active = false; };
  }, [sessionId, taskType, priorAnswer]);

  useEffect(() => () => { evaluationVersion.current += 1; }, []);

  function changeOpenWork(patch: Partial<OpenWorkDraft>) {
    if ('photo' in patch && sessionId) {
      photoEdited.current = true;
      void saveLessonDraftPhoto(sessionId, patch.photo ?? null).catch(() => {
        pushToast('Zdjęcie jest widoczne teraz, ale nie udało się zapisać go do wznowienia.', 'warning');
      });
    }
    setOpenWork((work) => ({ ...work, ...patch }));
  }
  useLayoutEffect(() => {
    if (!sessionId || !taskType || priorAnswer) return;
    const value = taskType === 'open' ? openAnswer : taskType === 'numeric' ? numericAnswer : selectedOption;
    const work = taskType === 'open' ? { mode: openWork.mode, strokes: openWork.strokes, result: openWork.result } : undefined;
    saveTaskDraft(sessionId, { taskId: currentTaskId, value, hintsUsed, work });
  }, [sessionId, currentTaskId, taskType, priorAnswer, openAnswer, numericAnswer, selectedOption, openWork, hintsUsed, saveTaskDraft]);

  // Tick every second to check 90s combo expiration in lesson/practice
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!session || !currentTask) {
    return null;
  }

  // Check if session was interrupted by reaching 0 hearts (Section 6.5 Step C.1 & AC-H7)
  if (session.interruptedByZeroHearts && (!checkedFeedback || showRecovery)) {
    return (
      <div className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--danger)]/70 shadow-[0_6px_0_0_var(--danger-edge)] p-5 sm:p-8 text-center space-y-5">
        <div className="flex justify-center">
          <LumiMascot mood="supportive" loadout={state.loadout} size="lg" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger)]/12 border border-[var(--danger)]/40 px-3 py-1 text-xs font-extrabold font-display text-[var(--danger)] tabular-nums">
            <TactileHeartIcon size={15} variant="cracked" />
            <span>
              Stan Serc: {state.hearts}/5
              {state.hearts < 5 && secondsToNextHeart !== null
                ? ` · +1 serce za ${formatHeartCountdown(secondsToNextHeart)}`
                : ''}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-[var(--text-primary)]">
            Serca się skończyły!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Twój dotychczasowy postęp w lekcji ({Object.keys(session.answers).length}{' '}
            z {session.taskIds.length} zadań) jest bezpiecznie zapisany.
            Odzyskaj serce, aby kontynuować dokładnie od kolejnego zadania!
          </p>
        </div>

        {state.hearts > 0 ? (
          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              resumeActiveTasks();
            }}
          >
            <Play className="w-5 h-5" />
            <span>Wznów zadania</span>
          </TactileButton>
        ) : (
          <div className="space-y-3 text-left">
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

            {/* Pass E8 Pro ("Kup Pro") card */}
            <div className="rounded-2xl border-2 border-[var(--accent-primary)]/45 bg-[var(--accent-primary)]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold font-display text-[var(--accent-text)]">
                    Pass E8 Pro
                  </span>
                  <span className="rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[10px] font-extrabold font-display text-[var(--on-accent)]">
                    WKRÓTCE
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-snug">
                  Nielimitowane serca bez czekania + pełny AI Tutor do zadań otwartych.
                </p>
              </div>
              <TactileButton
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() =>
                  pushToast(
                    'Pass E8 Pro będzie dostępny wkrótce — teraz możesz odzyskać serce darmową Misją Ratunkową!',
                    'info'
                  )
                }
              >
                Kup Pro
              </TactileButton>
            </div>
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
  const completedTaskCount = session.currentIndex + (checkedFeedback ? 1 : 0);

  // Active combo count (0 if 90s expired) + live remaining % bar
  const comboExpired = isComboExpired(session.lastAnsweredAt, nowMs, false);
  const activeComboCount = comboExpired ? 0 : session.comboCount;
  const comboMultiplier = getComboMultiplier(activeComboCount);
  const comboRemainingPct =
    !comboExpired && session.lastAnsweredAt && comboMultiplier > 1.0
      ? Math.max(0, Math.min(100, Math.round(((90_000 - (nowMs - session.lastAnsweredAt)) / 90_000) * 100)))
      : 0;

  const isBookmarked = state.savedTasks.some(
    (s) => s.key === `${currentTask.id}:${currentTask.subjectId}`
  );

  const handleCheckClosedOrNumeric = () => {
    if (checkedFeedback || revealPhase) return;

    const finalizeCheck = (outcome: TaskEvalOutcome, xpAwarded: number) => {
      if (prefersReduced) {
        setCheckedFeedback({ outcome, xpAwarded });
        return;
      }
      setRevealPhase({ outcome, xpAwarded });
      revealTimerRef.current = window.setTimeout(() => {
        setRevealPhase(null);
        setCheckedFeedback({ outcome, xpAwarded });
      }, 120);
    };

    if (
      currentTask.type === 'abcd' ||
      currentTask.type === 'true_false'
    ) {
      if (!selectedOption) return;
      const isCorrect = selectedOption === currentTask.correctAnswer;
      const outcome: TaskEvalOutcome = isCorrect ? 'correct' : 'wrong';
      const res = submitSessionTaskAnswer({
        sessionId: session.sessionId,
        taskId: currentTask.id,
        userAnswer: selectedOption,
        outcome,
        hintsUsed,
      });
      finalizeCheck(outcome, res.xpAwarded);
      return;
    }

    if (currentTask.type === 'numeric') {
      if (!numericAnswer.trim()) return;
      const isCorrect = matchesMathResult(numericAnswer, currentTask.correctAnswer);

      const outcome: TaskEvalOutcome = isCorrect ? 'correct' : 'wrong';
      const res = submitSessionTaskAnswer({
        sessionId: session.sessionId,
        taskId: currentTask.id,
        userAnswer: numericAnswer.trim(),
        outcome,
        hintsUsed,
      });
      finalizeCheck(outcome, res.xpAwarded);
    }
  };

  const handleEvaluateOpenTask = async () => {
    const answer = getOpenAnswer(openWork, openAnswer);
    const rubric = currentTask.rubric;
    if (checkedFeedback || isAiEvaluating || !rubric || !answer) return;
    const version = ++evaluationVersion.current;
    playSound('tap');
    setIsAiEvaluating(true);

    const uiDelay = prefersReduced ? 400 : AI_ANALYSIS_UI_DURATION_MS;
    const [evalRes] = await Promise.all([
      openWork.mode === 'text'
        ? aiTutorService.evaluateOpenTask(answer, rubric)
        : Promise.resolve(evaluateVisualWork(answer, rubric.expectedResult, rubric.resultOnly)),
      new Promise<void>((resolve) => window.setTimeout(resolve, uiDelay)),
    ]);
    if (version !== evaluationVersion.current) return;
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
      sessionId: session.sessionId,
      taskId: currentTask.id,
      userAnswer: answer,
      outcome,
      hintsUsed,
      aiScore: evalRes.score,
      aiFeedback: evalRes.feedback,
      matchedKeywords: evalRes.matchedKeywords,
    });

    setCheckedFeedback({
      outcome,
      xpAwarded: res.xpAwarded,
    });
  };

  const finishSelfReview = (reviewRequested: boolean) => {
    if (checkedFeedback || !comparing) return;
    submitSessionTaskAnswer({
      sessionId: session.sessionId,
      taskId: currentTask.id,
      userAnswer: '',
      outcome: 'ungraded',
      hintsUsed,
      reviewRequested,
    });
    setComparing(false);
    setCheckedFeedback({ outcome: 'ungraded', xpAwarded: 0 });
  };

  const taskTypeLabel =
    currentTask.type === 'abcd'
      ? 'Wybór ABCD'
      : currentTask.type === 'true_false'
      ? 'Prawda / Fałsz'
      : currentTask.type === 'numeric'
      ? 'Wpisz wynik'
      : 'Zadanie otwarte';

  return (
    <>
      <div className={hasResult ? "space-y-3" : "space-y-3 sm:space-y-3.5 pb-6"}>
        <section className="study-panel space-y-3 p-3.5 sm:p-4" aria-label="Postęp sesji">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[var(--accent-text)]">
                {session.source === 'rescue' ? `Misja Ratunkowa · ${state.rescueMissionCurrentProgress}/2 do +1 serca` : `Zadanie ${currentStepNum} z ${totalTasks}`}
              </p>
              <p className="mt-0.5 text-base font-extrabold leading-snug text-[var(--text-primary)] sm:text-lg">
                {currentTask.topicTag}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound('tap');
                setExitConfirmOpen(true);
              }}
              aria-label="Przerwij sesję"
              className="min-h-11 shrink-0 rounded-lg px-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              Wyjdź
            </button>
          </div>

          <div
            role="progressbar"
            aria-label="Ukończone zadania"
            aria-valuemin={0}
            aria-valuemax={totalTasks}
            aria-valuenow={completedTaskCount}
          >
            {totalTasks <= 12 ? (
              <div className="flex gap-1.5" aria-hidden="true">
                {session.taskIds.map((taskId, index) => (
                  <span
                    key={taskId}
                    className={`h-1.5 min-w-0 flex-1 rounded-sm ${
                      index < completedTaskCount
                        ? 'bg-[var(--accent-primary)]'
                        : index === session.currentIndex
                          ? 'bg-[var(--accent-primary)]/30 ring-1 ring-[var(--accent-primary)]/55'
                          : 'bg-[var(--border-subtle)]'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-1.5 overflow-hidden rounded-sm bg-[var(--border-subtle)]" aria-hidden="true">
                <div className="h-full bg-[var(--accent-primary)]" style={{ width: `${completedTaskCount / totalTasks * 100}%` }} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div
              className={`min-h-8 inline-flex items-center gap-1.5 text-xs font-bold tabular-nums ${
                state.hearts === 0
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--text-secondary)]'
              }`}
              title={
                state.hearts < 5 && secondsToNextHeart !== null
                  ? `Kolejne serce za ${formatHeartCountdown(secondsToNextHeart)}`
                  : 'Pełny zapas serc'
              }
            >
              <TactileHeartIcon
                size={17}
                variant={state.hearts > 0 ? 'full' : 'cracked'}
              />
              <span>{state.hearts} / 5 serc</span>
              {state.hearts < 5 && secondsToNextHeart !== null && (
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  · {formatHeartCountdown(secondsToNextHeart)}
                </span>
              )}
            </div>
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
                  {comboRemainingPct > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-[var(--bg-canvas)] overflow-hidden"
                    >
                      <span
                        className="block h-full bg-[var(--combo-fire)] transition-[width] duration-500 ease-linear"
                        style={{ width: `${comboRemainingPct}%` }}
                      />
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {checkedFeedback ? (
          <TaskResult
            task={currentTask}
            headingRef={resultHeading}
            outcome={checkedFeedback.outcome}
            xpAwarded={checkedFeedback.xpAwarded}
            comboMultiplier={comboMultiplier}
            loadout={state.loadout}
            userAnswer={priorAnswer?.userAnswer}
            tutorScore={aiEvaluation?.score ?? priorAnswer?.aiScore}
            tutorFeedback={aiEvaluation?.feedback ?? priorAnswer?.aiFeedback}
            isSaved={isBookmarked}
            onToggleSaved={() => toggleTaskSaved(currentTask.id, currentTask.subjectId)}
            onContinue={() => {
              if (session.interruptedByZeroHearts) setShowRecovery(true);
              else advanceSessionTaskOrFinish();
            }}
            continueLabel={session.interruptedByZeroHearts ? 'Odzyskaj serce' : currentStepNum < totalTasks ? 'Dalej' : 'Zobacz podsumowanie'}
            visualWork={openWork}
          />
        ) : (
          <>
            {/* Task Toolbar (No scratchpad! Bookmark "Zapisz do powtórki" + Wzory E8 + Podpowiedź AI) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="text-xs font-bold text-[var(--text-secondary)]">
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
                  transition={{ duration: 0.36, ease: 'easeOut' }}
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
                  <span>Podpowiedzi ({hintsUsed}/3)</span>
                </button>
              </div>
            </div>

            {/* Horizontal Slide Between Questions (Choreography #6: AnimatePresence mode="wait") */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTask.id}
                initial={prefersReduced ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.18 }}
                className="study-panel p-4 sm:p-5 space-y-4"
              >
                {/* Topic Kicker & Question Prompt */}
                <div>
                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
                    <MathText text={currentTask.prompt} />
                  </div>
                </div>

                {/* Task Type 1: ABCD or True/False */}
                {(currentTask.type === 'abcd' ||
                  currentTask.type === 'true_false') &&
                  currentTask.options && (
                    <div className="space-y-2.5">
                      {currentTask.options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        const checkedState = revealPhase
                          ? isSelected && revealPhase.outcome === 'correct'
                            ? 'correct'
                            : isSelected && revealPhase.outcome === 'wrong'
                            ? 'wrong'
                            : !isSelected &&
                              revealPhase.outcome === 'wrong' &&
                              opt.id === currentTask.correctAnswer
                            ? 'missed_correct'
                            : 'idle'
                          : 'idle';

                        return (
                          <AnswerOptionCard
                            key={opt.id}
                            option={opt}
                            selected={isSelected}
                            checkedState={checkedState}
                            disabled={Boolean(revealPhase) || Boolean(checkedFeedback)}
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
                    disabled={Boolean(checkedFeedback) || Boolean(revealPhase)}
                    onSubmit={handleCheckClosedOrNumeric}
                  />
                )}

                {/* Task Type 3: Open Task with AI Tutor */}
                {currentTask.type === 'open' && (
                  <OpenTaskAiBox
                    work={openWork}
                    onWorkChange={changeOpenWork}
                    value={openAnswer}
                    onChange={setOpenAnswer}
                    isEvaluating={isAiEvaluating}
                    evaluation={null}
                    disabled={Boolean(checkedFeedback) || comparing}
                    onEvaluate={handleEvaluateOpenTask}
                    onCompare={() => setComparing(true)}
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
                        Boolean(revealPhase) ||
                        ((currentTask.type === 'abcd' ||
                          currentTask.type === 'true_false') &&
                        !selectedOption
                          ? true
                          : currentTask.type === 'numeric' &&
                            !numericAnswer.trim())
                      }
                      onClick={handleCheckClosedOrNumeric}
                    >
                      Sprawdź odpowiedź
                    </TactileButton>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {comparing && !checkedFeedback && (
              <section className="study-panel space-y-3 p-4" aria-labelledby="self-review-heading">
                <h3 id="self-review-heading" className="font-extrabold">Porównaj swoje obliczenia</h3>
                <p className="text-sm text-[var(--text-secondary)]"><MathText text={currentTask.explanation} /></p>
                <div className="flex flex-wrap gap-2">
                  <TactileButton variant="secondary" onClick={() => finishSelfReview(true)}>Chcę powtórzyć</TactileButton>
                  <TactileButton onClick={() => finishSelfReview(false)}>Rozumiem rozwiązanie</TactileButton>
                </div>
              </section>
            )}

          </>
        )}
      </div>

      {/* 3-Level Socratic AI Hints Bottom Sheet (-33% XP per level) */}
      <BottomSheet
        open={hintsSheetOpen}
        onClose={() => setHintsSheetOpen(false)}
        title="Podpowiedzi"
        subtitle="Każda podpowiedź obniża nagrodę XP za to zadanie o 33%. Minimum to 1 XP."
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
          {currentTask.type === 'open' && (
            <div className="p-4 rounded-2xl border-2 border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/8 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold font-display text-[var(--accent-text)]">
                  Lumi Tutor AI · Wskazówka do zadania otwartego
                </span>
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  Koszt: 1 zapytanie AI (Faza 2)
                </span>
              </div>

              {aiHintLoading ? (
                <div className="flex items-center gap-3 py-1">
                  <LumiMascot mood="thinking" loadout={state.loadout} size="xs" tutorScholarCap />
                  <div className="text-xs text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)] block">
                      Lumi Tutor analizuje zadanie…
                    </strong>
                    Przygotowuję wskazówkę bez zdradzania gotowego wyniku (~5 s).
                  </div>
                </div>
              ) : aiHintText ? (
                <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                  <MathText text={aiHintText} />
                </p>
              ) : (
                <TactileButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    playSound('tap');
                    setAiHintLoading(true);
                    const delay = prefersReduced ? 350 : AI_ANALYSIS_UI_DURATION_MS;
                    window.setTimeout(() => {
                      setAiHintLoading(false);
                      setAiHintText(
                        `Zacznij od wypisania danych z treści zadania i zapisz równanie krok po kroku. W tym zadaniu kluczowe jest: ${currentTask.hints[1]}`
                      );
                    }, delay);
                  }}
                >
                  Zapytaj AI Tutora o wskazówkę (0 zł w prototypie)
                </TactileButton>
              )}
            </div>
          )}
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
            Wrócisz do bieżącego zadania po wznowieniu. Nagrody za lekcję otrzymasz po jej ukończeniu.
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
