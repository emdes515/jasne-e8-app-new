'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Coins,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ExamAttemptRecord, TaskDefinition, TaskEvalOutcome } from '../../types/domain';
import { AiTutorEvaluationResult } from '../../types/repositories';
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { CountUpNumber } from '../ui/CountUpNumber';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';

export interface ExamTaskEvaluationDetail {
  task: TaskDefinition;
  userAnswer: string;
  outcome: TaskEvalOutcome;
  pointsEarned: number;
  pointsMax: number;
  xpEarned: number;
  aiEvaluation?: AiTutorEvaluationResult;
}

interface ExamSummaryViewProps {
  record: ExamAttemptRecord;
  details: ExamTaskEvaluationDetail[];
  onBackToLobby: () => void;
  onRetryExam: () => void;
}

export function ExamSummaryView({
  record,
  details,
  onBackToLobby,
  onRetryExam,
}: ExamSummaryViewProps) {
  const { state, setActiveTab, playSound } = useAppState();
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const mistakesAddedCount = details.filter((d) => d.outcome === 'wrong').length;

  const toggleExpand = (taskId: string) => {
    playSound('tap');
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial={false}
      animate="visible"
      className="space-y-5 pb-8"
    >
      {/* Hero Summary Card with Circular Score Ring */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="study-panel p-6 sm:p-8 text-center space-y-5"
      >
        <div className="flex justify-center">
          <LumiMascot
            mood={record.scorePercent >= 80 ? 'celebrate' : 'happy'}
            loadout={state.loadout}
            size="md"
          />
        </div>

        <div>
          <div className="text-xs font-extrabold font-display text-[var(--accent-text)] mb-1">
            Miniarkusz z matematyki
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-primary)]">
            Wynik arkusza:{' '}
            <CountUpNumber
              value={record.scorePercent}
              durationMs={700}
              suffix="%"
            />
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 tabular-nums">
            Zadanie otwarte ma ocenę symulowaną. Porównaj swoje obliczenia z rozwiązaniem.
          </p>
        </div>

        {/* Reward Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
            <Trophy className="w-5 h-5 text-[var(--accent-text)] mb-1" />
            <span className="text-lg font-extrabold font-display tabular-nums">
              <CountUpNumber
                value={record.xpEarned}
                durationMs={700}
                prefix="+"
                suffix=" XP"
              />
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Zdobyte XP
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
            <Coins className="w-5 h-5 text-[var(--accent-text)] mb-1" />
            <span className="text-lg font-extrabold font-display tabular-nums">
              <CountUpNumber
                value={record.coinsEarned}
                durationMs={700}
                prefix="+"
              />
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Monety
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
            <CheckCircle2 className="w-5 h-5 text-[var(--success)] mb-1" />
            <span className="text-lg font-extrabold font-display tabular-nums">
              {record.pointsEarned}/{record.pointsMax}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Punkty
            </span>
          </div>
        </div>

        {mistakesAddedCount > 0 ? (
          <div className="p-3.5 rounded-2xl bg-[var(--danger)]/12 border border-[var(--danger)] text-xs font-bold text-[var(--text-primary)]">
            Błędne zadania ({mistakesAddedCount}) zostały automatycznie dodane
            do Banku Błędów.
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--success)]/12 border border-[var(--success)] text-xs font-bold text-[var(--success)]">
            Nie dodano nowych zadań do banku błędów.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <TactileButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={onRetryExam}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rozwiąż ponownie</span>
          </TactileButton>
          <TactileButton
            variant="primary"
            size="md"
            fullWidth
            onClick={onBackToLobby}
          >
            <span>Wróć do egzaminu</span>
            <ArrowRight className="w-4 h-4" />
          </TactileButton>
        </div>
      </motion.section>

      {/* Detailed Task-by-Task Breakdown */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
            Rozwiązania
          </h2>
          {mistakesAddedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className="text-xs font-extrabold font-display text-[var(--accent-text)] hover:underline cursor-pointer"
            >
              Otwórz powtórki
            </button>
          )}
        </div>

        {details.map((item, idx) => {
          const isOpen = Boolean(expandedTaskIds[item.task.id]);

          return (
            <div
              key={item.task.id}
              className="study-panel overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleExpand(item.task.id)}
                aria-expanded={isOpen}
                className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[var(--bg-elevated)]/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.outcome === 'correct' ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />
                  ) : item.outcome === 'partial' ? (
                    <AlertCircle className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)]">Zadanie {idx + 1} · {item.task.topicTag}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-extrabold font-display tabular-nums">
                    {item.pointsEarned}/{item.pointsMax} pkt
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="font-bold text-[var(--text-secondary)] mb-1">
                      Treść zadania:
                    </div>
                    <div className="text-[var(--text-primary)]">
                      <MathText text={item.task.prompt} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                      <div className="text-xs font-bold text-[var(--text-secondary)]">
                        Twoja odpowiedź:
                      </div>
                      <div className="font-extrabold font-display text-[var(--text-primary)] mt-0.5 [overflow-wrap:anywhere]">
                        {item.userAnswer.trim() ? (
                          <MathText text={item.userAnswer} />
                        ) : (
                          <span className="text-[var(--danger)]">
                            Brak odpowiedzi (pominięto)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                      <div className="text-xs font-bold text-[var(--text-secondary)]">
                        Poprawna odpowiedź
                      </div>
                      <div className="font-extrabold font-display text-[var(--success)] mt-0.5">
                        <MathText text={item.task.correctAnswer} />
                      </div>
                    </div>
                  </div>

                  {item.aiEvaluation && (
                    <div className="p-3.5 rounded-xl bg-[var(--info)]/10 border border-[var(--info)] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-extrabold font-display text-xs text-[var(--info)]">
                          <Bot className="w-4 h-4" />
                          <span>{item.aiEvaluation.score}/2 pkt</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-[var(--info)]">
                          {item.aiEvaluation.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)]">
                        {item.aiEvaluation.feedback}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">
                      Rozwiązanie
                    </strong>{' '}
                    <MathText text={item.task.explanation} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </motion.section>
    </motion.div>
  );
}
