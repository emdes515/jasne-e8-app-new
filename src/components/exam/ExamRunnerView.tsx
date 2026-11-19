'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Timer,
  LayoutGrid,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  Send,
  X,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { MATH_MINI_EXAM_TASKS } from '../../data/mathExamMock';
import { ExamAttemptRecord, TaskEvalOutcome } from '../../types/domain';
import { aiTutorService } from '../../services/ai/aiTutorMock';
import {
  calculateTaskXp,
  getComboMultiplier,
} from '../../lib/gamification';
import { SPRING_BOUNCY } from '../../lib/motionPresets';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { SmartMathKeyboard } from '../lesson/SmartMathKeyboard';
import { OpenTaskAiBox } from '../lesson/OpenTaskAiBox';
import { ExamQuestionGrid } from './ExamQuestionGrid';
import { ExamTaskEvaluationDetail } from './ExamSummaryView';

const EXAM_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface ExamRunnerViewProps {
  onAbortExam: () => void;
  onFinishExam: (
    record: ExamAttemptRecord,
    details: ExamTaskEvaluationDetail[]
  ) => void;
}

function formatTimerMMSS(secondsLeft: number): string {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export function ExamRunnerView({
  onAbortExam,
  onFinishExam,
}: ExamRunnerViewProps) {
  const { state, toggleTaskSaved, completeMiniExam, playSound } = useAppState();
  const prefersReduced = useReducedMotion();

  const tasks = MATH_MINI_EXAM_TASKS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gridOpen, setGridOpen] = useState(false);
  const [abortModalOpen, setAbortModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [bookmarkAnimTick, setBookmarkAnimTick] = useState(0);

  // Deadline timestamp strictly in memory (F5 discards incomplete exam attempt per AC-X3!)
  const deadlineRef = useRef<number>(Date.now() + EXAM_DURATION_MS);
  const warningPlayedRef = useRef<boolean>(false);
  const submittedRef = useRef<boolean>(false);

  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);

  const currentTask = tasks[currentIndex];

  const savedTaskKeys = useMemo(
    () => new Set(state.savedTasks.map((s) => s.key)),
    [state.savedTasks]
  );

  const evaluateAndSubmitExam = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    let runningCombo = 0;
    const summaryMap: Record<
      string,
      {
        userAnswer: string;
        outcome: TaskEvalOutcome;
        pointsEarned: number;
        pointsMax: number;
        xpEarned: number;
      }
    > = {};
    const details: ExamTaskEvaluationDetail[] = [];

    for (const task of tasks) {
      const rawAns = (answers[task.id] ?? '').trim();
      let outcome: TaskEvalOutcome = 'wrong';
      let pointsEarned = 0;
      const pointsMax = task.type === 'open' ? 2 : 1;
      let aiEvaluation = undefined;

      if (task.type === 'abcd' || task.type === 'true_false') {
        if (rawAns && rawAns === task.correctAnswer) {
          outcome = 'correct';
          pointsEarned = 1;
        }
      } else if (task.type === 'numeric') {
        const cleanUser = rawAns.replace(',', '.');
        const cleanExp = task.correctAnswer.trim().replace(',', '.');
        const numU = Number(cleanUser);
        const numE = Number(cleanExp);
        if (
          cleanUser &&
          ((!Number.isNaN(numU) &&
            !Number.isNaN(numE) &&
            Math.abs(numU - numE) < 1e-9) ||
            cleanUser === cleanExp)
        ) {
          outcome = 'correct';
          pointsEarned = 1;
        }
      } else if (task.type === 'open' && task.rubric) {
        aiEvaluation = aiTutorService.evaluateOpenTaskSync(rawAns, task.rubric);
        pointsEarned = aiEvaluation.score;
        outcome =
          aiEvaluation.score === 2
            ? 'correct'
            : aiEvaluation.score === 1
            ? 'partial'
            : 'wrong';
      }

      // In exam mode, combo never expires by time (AC-C3), increments on 'correct', stays on 'partial', resets on 'wrong'
      if (outcome === 'correct') {
        runningCombo += 1;
      } else if (outcome === 'wrong') {
        runningCombo = 0;
      }

      const xpEarned = calculateTaskXp({
        type: task.type,
        outcome,
        openScore: aiEvaluation?.score,
        hintsUsed: 0,
        comboCountAfterAnswer: runningCombo,
        source: 'lesson',
      });

      summaryMap[task.id] = {
        userAnswer: rawAns,
        outcome,
        pointsEarned,
        pointsMax,
        xpEarned,
      };

      details.push({
        task,
        userAnswer: rawAns,
        outcome,
        pointsEarned,
        pointsMax,
        xpEarned,
        aiEvaluation,
      });
    }

    const record = completeMiniExam({ answers: summaryMap });
    onFinishExam(record, details);
  }, [answers, completeMiniExam, onFinishExam, tasks]);

  // Timer strictly computed from `deadline - Date.now()` + visibilitychange listener (AC-X1, AC-X2)
  useEffect(() => {
    const updateClock = () => {
      const remMs = deadlineRef.current - Date.now();
      const remSec = Math.max(0, Math.ceil(remMs / 1000));
      setSecondsLeft(remSec);

      if (remSec <= 60 && remSec > 0 && !warningPlayedRef.current) {
        warningPlayedRef.current = true;
        playSound('timerWarning');
      }

      if (remSec <= 0 && !submittedRef.current) {
        evaluateAndSubmitExam();
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 500);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        updateClock();
      }
    };
    window.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVis);
    };
  }, [evaluateAndSubmitExam, playSound]);

  const isUrgent = secondsLeft <= 60;
  const isBookmarked = savedTaskKeys.has(
    `${currentTask.id}:${currentTask.subjectId}`
  );
  const currentAnswer = answers[currentTask.id] ?? '';
  const answeredCount = tasks.filter(
    (t) => (answers[t.id] ?? '').trim().length > 0
  ).length;

  const setTaskAnswer = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentTask.id]: val,
    }));
  };

  return (
    <>
      <div className="space-y-4 pb-8">
        {/* Top Exam Bar: Exit | Timer (deadline - Date.now()) | Question Grid 1-5 */}
        {/* Note: "Wzory E8" button is STRICTLY OMITTED in Exam Mode per Section 6.6 & AC-X4! */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              setAbortModalOpen(true);
            }}
            className="min-h-[44px] px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-extrabold font-display text-[var(--text-secondary)] hover:text-[var(--danger)] cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Zakończ</span>
          </button>

          {/* Timer Pill with < 60s Urgent Pulse (Choreography #14) */}
          <motion.div
            animate={
              isUrgent && !prefersReduced
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={
              isUrgent
                ? { duration: 1.0, repeat: Infinity }
                : { duration: 0.2 }
            }
            className={`min-h-[44px] px-4 rounded-full border-2 flex items-center gap-2 font-extrabold font-display text-sm tabular-nums ${
              isUrgent
                ? 'bg-[var(--danger)]/15 border-[var(--danger)] text-[var(--danger)]'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>{formatTimerMMSS(secondsLeft)}</span>
          </motion.div>

          {/* Question Grid Trigger */}
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              setGridOpen(true);
            }}
            aria-label="Otwórz siatkę pytań 1-5"
            className="min-h-[44px] px-3 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-primary)] flex items-center gap-1.5 text-xs font-extrabold font-display text-[var(--text-primary)] tabular-nums cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[var(--accent-text)]" />
            <span>
              Siatka ({currentIndex + 1}/{tasks.length})
            </span>
          </button>
        </div>

        {/* Quick Question Step Strip 1..5 */}
        <div className="grid grid-cols-5 gap-2">
          {tasks.map((t, idx) => {
            const active = idx === currentIndex;
            const answered = (answers[t.id] ?? '').trim().length > 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playSound('tap');
                  setCurrentIndex(idx);
                }}
                className={`min-h-[40px] rounded-xl border-2 text-xs font-extrabold font-display tabular-nums cursor-pointer transition-all ${
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)]'
                    : answered
                    ? 'bg-[var(--success)]/15 border-[var(--success)] text-[var(--success)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                Zad. {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Task Toolbar (Only Bookmark "Zapisz do powtórki" — NO AI Hints and NO Formulas E8 in Exam Mode!) */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="text-xs font-bold text-[var(--text-secondary)]">
            <span>
              Zadanie {currentIndex + 1} z {tasks.length}
            </span>
            <span aria-hidden="true"> · </span>
            <span className="text-[var(--accent-text)]">
              {currentTask.type === 'open' ? '2 pkt CKE' : '1 pkt CKE'}
            </span>
          </div>

          <motion.button
            type="button"
            key={bookmarkAnimTick}
            animate={
              bookmarkAnimTick > 0 && !prefersReduced
                ? { scale: [1, 1.38, 1], rotate: [0, -14, 6, 0] }
                : {}
            }
            transition={SPRING_BOUNCY}
            onClick={() => {
              setBookmarkAnimTick(Date.now());
              toggleTaskSaved(currentTask.id, currentTask.subjectId);
            }}
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
        </div>

        {/* Task Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.16 }}
            className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)] p-5 sm:p-6 space-y-5"
          >
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                {currentTask.topicTag}
              </div>
              <div className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed">
                <MathText text={currentTask.prompt} />
              </div>
            </div>

            {/* ABCD / True-False options */}
            {(currentTask.type === 'abcd' ||
              currentTask.type === 'true_false') &&
              currentTask.options && (
                <div className="space-y-2.5">
                  {currentTask.options.map((opt) => {
                    const selected = currentAnswer === opt.id;
                    const badgeLabel =
                      opt.id === 'TRUE'
                        ? 'P'
                        : opt.id === 'FALSE'
                        ? 'F'
                        : opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          playSound('tap');
                          setTaskAnswer(opt.id);
                        }}
                        className={`w-full min-h-[56px] px-4 py-3 rounded-2xl border-2 flex items-center gap-3.5 text-left cursor-pointer transition-all ${
                          selected
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_4px_0_0_var(--accent-primary-edge)]'
                            : 'bg-[var(--bg-canvas)]/50 border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center font-extrabold font-display text-sm shrink-0 ${
                            selected
                              ? 'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)]'
                              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                          }`}
                        >
                          {badgeLabel}
                        </span>
                        <span className="text-base font-bold text-[var(--text-primary)]">
                          <MathText text={opt.label} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Numeric Input */}
            {currentTask.type === 'numeric' && (
              <SmartMathKeyboard
                value={currentAnswer}
                onChange={setTaskAnswer}
              />
            )}

            {/* Open Task (evaluated collectively after exam submit!) */}
            {currentTask.type === 'open' && (
              <div className="space-y-2">
                <OpenTaskAiBox
                  value={currentAnswer}
                  onChange={setTaskAnswer}
                  isEvaluating={false}
                  evaluation={null}
                  disabled={false}
                  onEvaluate={() => {}}
                  loadout={state.loadout}
                  hideEvaluateButton
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  W trybie egzaminu zadanie otwarte zostanie ocenione przez AI
                  Tutora zbiorczo po kliknięciu „Oddaj arkusz”.
                </p>
              </div>
            )}

            {/* Bottom Navigation Prev / Next / Submit */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <TactileButton
                variant="secondary"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => {
                  playSound('tap');
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Poprzednie</span>
              </TactileButton>

              {currentIndex + 1 < tasks.length ? (
                <TactileButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    playSound('tap');
                    setCurrentIndex((i) => Math.min(tasks.length - 1, i + 1));
                  }}
                >
                  <span>Następne zadanie</span>
                  <ArrowRight className="w-4 h-4" />
                </TactileButton>
              ) : (
                <TactileButton
                  variant="success"
                  size="md"
                  onClick={() => {
                    playSound('tap');
                    setSubmitModalOpen(true);
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>Oddaj arkusz</span>
                </TactileButton>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Question Grid Modal */}
      <ExamQuestionGrid
        open={gridOpen}
        onClose={() => setGridOpen(false)}
        tasks={tasks}
        currentIndex={currentIndex}
        answers={answers}
        savedTaskKeys={savedTaskKeys}
        onSelectIndex={(idx) => {
          playSound('tap');
          setCurrentIndex(idx);
        }}
        onSubmitExamClick={() => setSubmitModalOpen(true)}
      />

      {/* Submit Confirmation Modal */}
      <BottomSheet
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Oddać arkusz do oceny?"
        subtitle={`Odpowiedziałeś na ${answeredCount} z ${tasks.length} zadań — oddać?`}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Po oddaniu arkusza otrzymasz raport punktowy CKE, ocenę zadania
            otwartego od AI Tutora oraz nagrodę za ukończenie.
          </p>
          <div className="flex gap-3">
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setSubmitModalOpen(false)}
            >
              Wróć do zadań
            </TactileButton>
            <TactileButton
              variant="success"
              size="md"
              fullWidth
              onClick={() => {
                setSubmitModalOpen(false);
                evaluateAndSubmitExam();
              }}
            >
              Oddaj arkusz
            </TactileButton>
          </div>
        </div>
      </BottomSheet>

      {/* Abort Confirmation Modal */}
      <BottomSheet
        open={abortModalOpen}
        onClose={() => setAbortModalOpen(false)}
        title="Przerwać próbę egzaminu?"
        subtitle="Przerwiesz próbę — niezapisane odpowiedzi zostaną utracone"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Nieukończony arkusz jest w całości odrzucany (zero wpisów w Banku
            Błędów, zero XP i monet).
          </p>
          <div className="flex gap-3">
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setAbortModalOpen(false)}
            >
              Kontynuuj pisanie
            </TactileButton>
            <TactileButton
              variant="danger"
              size="md"
              fullWidth
              onClick={() => {
                setAbortModalOpen(false);
                onAbortExam();
              }}
            >
              Odrzuć próbę
            </TactileButton>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
