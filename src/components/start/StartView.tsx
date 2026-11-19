'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  RotateCcw,
  Timer,
  CheckCircle2,
  BookmarkCheck,
  Flame,
  Crown,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  computeDailyGoalProgress,
  getRankForXp,
} from '../../lib/gamification';
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { DailyChallengesCard } from './DailyChallengesCard';
import { MATH_LESSON_1_1 } from '../../data/mathLessonMock';

export function StartView() {
  const {
    state,
    setActiveTab,
    openLessonTheory,
    startLessonTasks,
    setFormulasOpen,
    playSound,
  } = useAppState();

  const dailyGoal = computeDailyGoalProgress({
    dailyGoalMinutes: state.dailyGoalMinutes,
    dailyLessonsCompleted: state.dailyLessonsCompleted,
    dailyTasksChecked: state.dailyTasksChecked,
  });

  const rankInfo = getRankForXp(state.xp);

  // Global accuracy excluding practice sessions (Master Spec Section 6.3.2)
  const accuracyDisplay =
    state.accuracyPointsPossible > 0
      ? `${Math.round(
          (state.accuracyPointsEarned / state.accuracyPointsPossible) * 100
        )}%`
      : '—';

  const vaultWaitingCount =
    state.mistakeBank.length + state.savedTasks.length;

  const isLesson1Completed = state.completedLessonIds.includes(
    MATH_LESSON_1_1.id
  );
  const hasPausedLesson =
    state.activeSession && state.activeSession.source === 'lesson';

  // Contextual Lumi dialogue bubble
  const getLumiDialogue = (): string => {
    if (hasPausedLesson) {
      return 'Mamy rozpoczętą lekcję! Wskakuj z powrotem — dokończymy zadania.';
    }
    if (dailyGoal.percent >= 100) {
      return 'Dzisiejszy cel zaliczony — seria rośnie! Chcesz zagrać Mini-Arkusz E8?';
    }
    const remainingTasks = Math.max(
      1,
      dailyGoal.targetTasks - state.dailyTasksChecked
    );
    if (remainingTasks === 1) {
      return 'Zostało Ci tylko 1 zadanie do zaliczenia dzisiejszego celu!';
    }
    return `Zostało Ci ${remainingTasks} zadań do zaliczenia dzisiejszego celu (${state.dailyGoalMinutes} min).`;
  };

  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* 1. Hero Card with Lumi Mascot, Daily Goal, Rank Progress & Primary CTA */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        aria-label="Panel główny ucznia"
        className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)] p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="shrink-0 flex flex-col items-center">
            <LumiMascot
              mood={dailyGoal.percent >= 100 ? 'celebrate' : 'happy'}
              loadout={state.loadout}
              size="md"
            />
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="text-xs font-bold text-[var(--accent-text)] mb-1">
              Centrum Dowodzenia E8
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)] mb-2">
              Cześć, {state.nickname}!
            </h1>

            {/* Lumi Speech Bubble */}
            <div className="inline-block rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-4">
              „{getLumiDialogue()}”
            </div>

            {/* Progress Bars: Daily Goal (Single unit: percent + caption!) & Rank E8 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-left">
              {/* Daily Goal */}
              <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-[var(--text-secondary)]">
                    Dzienny Cel ({state.dailyGoalMinutes} min)
                  </span>
                  <span className="font-extrabold font-display tabular-nums text-[var(--accent-text)]">
                    {dailyGoal.percent}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden mb-1">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
                    style={{ width: `${dailyGoal.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-semibold text-[var(--text-secondary)] tabular-nums">
                  {dailyGoal.caption}
                </div>
              </div>

              {/* Rank E8 Progress */}
              <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-[var(--text-primary)] font-display">
                    <Crown className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>{rankInfo.currentRank.name}</span>
                  </span>
                  <span className="font-extrabold font-display tabular-nums text-[var(--text-secondary)]">
                    {state.xp} XP
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden mb-1">
                  <div
                    className="h-full bg-[var(--success)] rounded-full transition-all duration-300"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] font-semibold text-[var(--text-secondary)] tabular-nums">
                  {rankInfo.nextRank
                    ? `Do rangi ${rankInfo.nextRank.name}: brakuje ${rankInfo.xpToNext} XP`
                    : 'Osiągnięto maksymalną rangę Legenda E8!'}
                </div>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {hasPausedLesson ? (
                <TactileButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => startLessonTasks()}
                >
                  <Play className="w-5 h-5" />
                  <span>Wznów: Potęgi i Pierwiastki — Lekcja 1.1</span>
                </TactileButton>
              ) : !isLesson1Completed ? (
                <TactileButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={openLessonTheory}
                >
                  <Play className="w-5 h-5" />
                  <span>Kontynuuj: Potęgi i Pierwiastki — Lekcja 1</span>
                </TactileButton>
              ) : (
                <>
                  <TactileButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={openLessonTheory}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Powtórz Lekcję 1.1 (Potęgi i Pierwiastki)</span>
                  </TactileButton>
                  <TactileButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setActiveTab('exam')}
                  >
                    <Timer className="w-5 h-5 text-[var(--accent-text)]" />
                    <span>Zagraj Mini-Arkusz E8</span>
                  </TactileButton>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Bento Grid of 3 Stats */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        aria-label="Statystyki ucznia"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
      >
        {/* Stat 1: Solved tasks & Accuracy */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[var(--success)]/15 border border-[var(--success)] text-[var(--success)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)]">
              Rozwiązane zadania
            </div>
            <div className="text-xl font-extrabold font-display tabular-nums text-[var(--text-primary)]">
              {state.totalTasksSolved}{' '}
              <span className="text-xs font-bold text-[var(--accent-text)]">
                ({accuracyDisplay} skut.)
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Mistake Bank / Saved (clickable -> Vault) */}
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] hover:border-[var(--accent-primary)] transition-colors flex items-center justify-between gap-3 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--info)]/15 border border-[var(--info)] text-[var(--info)] flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)]">
                Bank Błędów / Zapisane
              </div>
              <div className="text-xl font-extrabold font-display tabular-nums text-[var(--text-primary)]">
                {vaultWaitingCount}{' '}
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  ({state.mistakeBank.length} błędów)
                </span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        </button>

        {/* Stat 3: Best Combo */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[var(--combo-fire)]/15 border border-[var(--combo-fire)] text-[var(--combo-fire)] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-secondary)]">
              Najlepsze Combo
            </div>
            <div className="text-xl font-extrabold font-display tabular-nums text-[var(--text-primary)]">
              {state.bestCombo} z rzędu
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Daily Challenges Card (shared globally across subjects) */}
      <DailyChallengesCard />

      {/* 4. Quick Shortcut to Mini-Arkusz E8 + Math Formulas (if Math) */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
      >
        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] flex flex-col justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[var(--accent-text)] mb-1">
              Symulator CKE • Bez utraty serc
            </div>
            <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
              Mini-Arkusz Testowy E8
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              5 przekrojowych zadań w 15 minut. Zalicza dzisiejszą serię i daje
              +40 monet za pierwsze ukończenie dnia!
            </p>
          </div>
          <TactileButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setActiveTab('exam')}
          >
            <Timer className="w-4 h-4 text-[var(--accent-text)]" />
            <span>Przejdź do Mini-Arkusza</span>
          </TactileButton>
        </div>

        {state.activeSubject === 'math' ? (
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] flex flex-col justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--info)] mb-1">
                Matematyka E8 • Ściąga KaTeX
              </div>
              <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
                Przydatne Wzory E8
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Potęgi, pierwiastki, procenty, Pitagoras i objętości brył z
                przykładami „kiedy użyć”.
              </p>
            </div>
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                playSound('tap');
                setFormulasOpen(true);
              }}
            >
              <BookOpen className="w-4 h-4 text-[var(--accent-text)]" />
              <span>Otwórz Wzory E8</span>
            </TactileButton>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] flex flex-col justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--accent-text)] mb-1">
                {state.activeSubject === 'polish'
                  ? 'Język Polski E8 • Wkrótce'
                  : 'Język Angielski E8 • Wkrótce'}
              </div>
              <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
                {state.activeSubject === 'polish'
                  ? 'Ściąga Lektur & Form (Wkrótce)'
                  : 'Bank Zwrotów & Czasów (Wkrótce)'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                W Fazie 1 pełna mechanika zadań i wzorów działa na Matematyce
                E8. Kliknij, aby zobaczyć mapę działów.
              </p>
            </div>
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setActiveTab('learn')}
            >
              <span>Zobacz mapę przedmiotu</span>
              <ArrowRight className="w-4 h-4" />
            </TactileButton>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
