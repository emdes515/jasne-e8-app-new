'use client';

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Coins,
  CheckCircle2,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  SessionCompletionSummary,
  useAppState,
} from '../../context/AppStateContext';
import { getRankForXp } from '../../lib/gamification';
import { SPRING_BOUNCY, STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { CountUpNumber } from '../ui/CountUpNumber';
import { TactileButton } from '../ui/TactileButton';

interface LessonSummaryModalProps {
  summary: SessionCompletionSummary;
}

export function LessonSummaryModal({ summary }: LessonSummaryModalProps) {
  const {
    state,
    clearSessionSummary,
    setActiveTab,
    openLessonTheory,
    startPracticeSession,
  } = useAppState();
  const prefersReduced = useReducedMotion();

  const rankInfo = getRankForXp(state.xp);
  const isPractice =
    summary.source === 'saved' ||
    summary.source === 'bank' ||
    summary.source === 'rescue';

  useEffect(() => {
    if (!prefersReduced) {
      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#FFB800', '#10B981', '#38BDF8'],
        });
      } catch {
        // Ignore in headless environments
      }
    }
  }, [prefersReduced]);

  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial={false}
      animate="visible"
      className="study-panel p-6 sm:p-8 text-center space-y-6"
    >
      <motion.div variants={STAGGER_ITEM_VARIANTS} className="flex justify-center">
        <LumiMascot mood="celebrate" loadout={state.loadout} size="lg" />
      </motion.div>

      <motion.div variants={STAGGER_ITEM_VARIANTS}>
        <div className="text-xs font-extrabold font-display text-[var(--accent-text)] mb-1">
          {isPractice ? 'Powtórka ukończona' : 'Lekcja ukończona'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-primary)]">
          {summary.title}
        </h1>
        {summary.isRepeatToday && !isPractice && (
          <p className="text-xs font-bold text-[var(--accent-text)] mt-1.5">
            Powtórka — monety przyznawane raz dziennie, XP 30%
          </p>
        )}
        {isPractice && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Tryb powtórkowy: 50% bazowego XP zadań • 0 monet
          </p>
        )}
      </motion.div>

      {/* 3 Result Stat Tiles with CountUpNumber (700ms) */}
      <motion.div
        variants={STAGGER_ITEM_VARIANTS}
        className="grid grid-cols-3 gap-3"
      >
        {/* Tile 1: XP */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
          <Trophy className="w-5 h-5 text-[var(--accent-text)] mb-1" />
          <div className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)]">
            <CountUpNumber
              value={summary.xpEarned}
              durationMs={700}
              prefix="+"
              suffix=" XP"
            />
          </div>
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
            Zdobyte XP
          </span>
        </div>

        {/* Tile 2: Accuracy % */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)] mb-1" />
          <div className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)]">
            <CountUpNumber
              value={summary.accuracyPercent}
              durationMs={700}
              suffix="%"
            />
          </div>
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
            Skuteczność
          </span>
        </div>

        {/* Tile 3: Coins */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
          <Coins className="w-5 h-5 text-[var(--accent-text)] mb-1" />
          <div className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)]">
            <CountUpNumber
              value={summary.coinsEarned}
              durationMs={700}
              prefix="+"
            />
          </div>
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
            Zdobyte Monety
          </span>
        </div>
      </motion.div>

      {summary.ungradedCount > 0 && (
        <p className="text-sm text-[var(--text-secondary)]">
          Samodzielnie porównane zadania ({summary.ungradedCount}) nie wliczają się do skuteczności.
        </p>
      )}

      {/* Streak Milestone Bonus if any */}
      {summary.streakMilestoneCoins > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING_BOUNCY}
          className="p-3.5 rounded-2xl bg-[var(--combo-fire)]/15 border-2 border-[var(--combo-fire)] text-xs font-extrabold font-display text-[var(--text-primary)] flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 text-[var(--combo-fire)]" />
          <span>
            Bonus za {state.streakDays} dni ciągłej serii: +
            {summary.streakMilestoneCoins} monet!
          </span>
        </motion.div>
      )}

      {/* Rank E8 Progress Bar Fill */}
      <motion.div
        variants={STAGGER_ITEM_VARIANTS}
        className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] text-left"
      >
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="font-extrabold font-display text-[var(--text-primary)]">
            Ranga: {rankInfo.currentRank.name}
          </span>
          <span className="tabular-nums text-[var(--accent-text)]">
            {state.xp} XP
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${rankInfo.progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="h-full bg-[var(--accent-primary)] rounded-full"
          />
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] mt-1 tabular-nums">
          {rankInfo.nextRank
            ? `Brakuje ${rankInfo.xpToNext} XP do rangi ${rankInfo.nextRank.name}`
            : 'Najwyższa ranga Legenda E8 osiągnięta!'}
        </div>
      </motion.div>

      {summary.source === 'lesson' && summary.reviewTaskIds.length > 0 && (
        <section className="study-feature p-4 sm:p-5" aria-labelledby="lesson-review">
          <h2 id="lesson-review" className="text-lg font-extrabold">Powtórz trudne zadania</h2>
          <p className="mt-1 mb-3 text-sm text-[var(--text-secondary)]">
            Zadania do poprawy: {summary.reviewTaskIds.length}.
          </p>
          <TactileButton fullWidth onClick={() => startPracticeSession('bank', 'all', summary.reviewTaskIds, summary.contentId)}>
            <RotateCcw size={17} /> Powtórz błędy
          </TactileButton>
        </section>
      )}

      {/* Action Buttons */}
      <motion.div
        variants={STAGGER_ITEM_VARIANTS}
        className="flex flex-col sm:flex-row gap-3"
      >
        {isPractice ? (
          <TactileButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              clearSessionSummary();
              setActiveTab(summary.reviewLessonId ? 'learn' : 'vault');
            }}
          >
            <span>{summary.reviewLessonId ? 'Wróć do ścieżki nauki' : 'Wróć do powtórek'}</span>
            <ArrowRight className="w-5 h-5" />
          </TactileButton>
        ) : (
          <>
            <TactileButton
              variant="secondary"
              size="lg"
              onClick={() => {
                clearSessionSummary();
                openLessonTheory(summary.contentId, true);
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Powtórz materiał</span>
            </TactileButton>
            <TactileButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                clearSessionSummary();
                setActiveTab('start');
              }}
            >
              <span>Wróć na Start</span>
              <ArrowRight className="w-5 h-5" />
            </TactileButton>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
