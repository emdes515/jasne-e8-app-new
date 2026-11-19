'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Timer,
  Coins,
  Lock,
  Play,
  History,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ExamAttemptRecord } from '../../types/domain';
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { SessionTransitionLoader } from '../ui/BulbLoadingScreen';
import { ExamRunnerView } from './ExamRunnerView';
import {
  ExamSummaryView,
  ExamTaskEvaluationDetail,
} from './ExamSummaryView';

export function ExamLobbyView({ onRunningChange }: { onRunningChange: (running: boolean) => void }) {
  const { state, playSound } = useAppState();
  const [examMode, setExamMode] = useState<'lobby' | 'running' | 'summary'>(
    'lobby'
  );
  const [startingExam, setStartingExam] = useState(false);
  const [lastRecord, setLastRecord] = useState<ExamAttemptRecord | null>(null);
  const [lastDetails, setLastDetails] = useState<ExamTaskEvaluationDetail[]>(
    []
  );

  useEffect(() => {
    onRunningChange(examMode === 'running');
    return () => onRunningChange(false);
  }, [examMode, onRunningChange]);

  if (examMode === 'running') {
    return (
      <ExamRunnerView
        onAbortExam={() => setExamMode('lobby')}
        onFinishExam={(rec, det) => {
          setLastRecord(rec);
          setLastDetails(det);
          setExamMode('summary');
        }}
      />
    );
  }

  if (examMode === 'summary' && lastRecord) {
    return (
      <ExamSummaryView
        record={lastRecord}
        details={lastDetails}
        onBackToLobby={() => setExamMode('lobby')}
        onRetryExam={() => {
          playSound('tap');
          setExamMode('running');
        }}
      />
    );
  }

  return (
    <>
      <AnimatePresence>
        {startingExam && (
          <SessionTransitionLoader
            key="exam-transition-loader"
            mode="exam"
            title="Miniarkusz · Matematyka E8"
            subtitle="5 zadań · 15 minut · bez utraty serc"
            onDone={() => {
              setStartingExam(false);
              setExamMode('running');
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial={false}
        animate="visible"
        className="space-y-5"
      >
      {/* Top Header with Focused Lumi */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="study-panel p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5"
      >
        <LumiMascot mood="focused" loadout={state.loadout} size="md" />
        <div className="text-center sm:text-left">
          <h1 className="page-heading">
            Egzamin
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
            Rozwiąż zadania na czas. Arkusz nie zużywa serc. Podpowiedzi i wzory są w nim wyłączone.
          </p>
        </div>
      </motion.section>

      {/* 2 Exam Cards: Mini-Arkusz (Active) & Pełny Arkusz (Coming Soon Phase 2) */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Card 1: Miniarkusz (ACTIVE) */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)] shadow-[0_6px_0_0_var(--accent-primary-edge)] p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold font-display text-[var(--accent-text)]">
                Matematyka
              </span>
              <Timer className="w-5 h-5 text-[var(--accent-text)]" />
            </div>

            <h2 className="text-xl font-extrabold font-display text-[var(--text-primary)]">
              Miniarkusz
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
              <span>5 zadań</span>
              <span aria-hidden="true">·</span>
              <span>15 minut</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--accent-text)]">+40 monet</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--success)]">Bez utraty serc</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
Cztery zadania zamknięte lub liczbowe i jedno otwarte. Po oddaniu zobaczysz wynik i rozwiązania.
            </p>
          </div>

          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              playSound('tap');
              setStartingExam(true);
            }}
          >
            <Play className="w-5 h-5" />
            <span>Rozpocznij miniarkusz</span>
          </TactileButton>
        </div>

        {/* Card 2: Pełny arkusz próbny (COMING SOON — PHASE 2) */}
        <div className="study-panel p-5 sm:p-6 flex flex-col justify-between gap-5 opacity-95">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold font-display text-[var(--text-secondary)]">
                W przygotowaniu
              </span>
              <Lock className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>

            <h2 className="text-xl font-extrabold font-display text-[var(--text-primary)]">
              Pełny arkusz próbny
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
              <span>19 zadań</span>
              <span aria-hidden="true">·</span>
              <span>100 minut</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--accent-text)]">+80 monet</span>
              <span aria-hidden="true">·</span>
              <span>25 punktów CKE</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Pełna symulacja majowego egzaminu: 15 zadań zamkniętych (15 pkt)
              oraz 4 rozbudowane zadania otwarte (10 pkt) z raportem działów.
            </p>
          </div>

        </div>
      </motion.section>

      {/* Recent Mini-Exam Attempts History */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="study-panel p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--accent-text)]" />
          <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
            Historia podejść ({state.examHistory.length})
          </h2>
        </div>

        {state.examHistory.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] py-2">
            Wynik pojawi się tutaj po oddaniu pierwszego arkusza.
          </p>
        ) : (
          <div className="space-y-2">
            {state.examHistory.map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                    Mini-Arkusz Matematyka E8
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                    Dzień: {att.playerDay} • Punkty CKE: {att.pointsEarned}/
                    {att.pointsMax}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="text-xs font-bold text-[var(--accent-text)]">
                    +{att.xpEarned} XP
                  </span>
                  {att.coinsEarned > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-text)]">
                      <Coins className="w-3.5 h-3.5" />+{att.coinsEarned}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-xl font-extrabold font-display text-sm ${
                      att.scorePercent >= 80
                        ? 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]'
                        : 'bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {att.scorePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
      </motion.div>
    </>
  );
}
