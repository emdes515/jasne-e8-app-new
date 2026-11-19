'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Flame, Shield, Heart, Coins, BookOpen } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { SubjectSwitcher } from './SubjectSwitcher';
import { CountUpNumber } from '../ui/CountUpNumber';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

function formatCompactCoins(coins: number): string {
  if (coins >= 1000) {
    const k = (coins / 1000).toFixed(1).replace('.', ',');
    return `${k}k`;
  }
  return String(coins);
}

function formatCountdown(seconds: number | null): string {
  if (seconds === null) return 'Pełne';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function TopHud() {
  const {
    state,
    activeTab,
    setActiveTab,
    setRescueModalOpen,
    setFormulasOpen,
    secondsToNextHeart,
    shieldBurstTick,
    heartEventTick,
    playSound,
  } = useAppState();

  const [streakInfoOpen, setStreakInfoOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 h-14 w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-1.5 min-[360px]:px-3 sm:px-5 flex items-center justify-between gap-1 min-[360px]:gap-2">
        {/* Left: Subject Switcher + Optional Math Formulas quick trigger on tablet/desktop */}
        <div className="flex items-center gap-1 min-[360px]:gap-2 shrink-0">
          <SubjectSwitcher />

          {/* "Wzory E8" button ONLY visible when activeSubject === 'math' and NOT in exam mode (AC-G4, AC-X4) */}
          {state.activeSubject === 'math' && activeTab !== 'exam' && (
            <button
              type="button"
              onClick={() => {
                playSound('tap');
                setFormulasOpen(true);
              }}
              aria-label="Otwórz Przydatne Wzory E8"
              className="hidden sm:inline-flex lg:hidden min-h-[44px] px-3 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] items-center gap-1.5 text-xs font-extrabold font-display text-[var(--accent-text)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Wzory E8</span>
            </button>
          )}
        </div>

        {/* Right: 3 Tactile Resource Counters (min 44x44px hitboxes, 8px gap, single-line AC-M2) */}
        <div className="flex items-center gap-1 min-[360px]:gap-2 shrink-0">
          {/* 1. Streak + Streak Shield */}
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              setStreakInfoOpen(true);
            }}
            aria-label={`Seria dni: ${state.streakDays}. Tarcze serii: ${state.streakShields}`}
            className="relative min-h-[44px] min-w-[44px] px-1.5 min-[360px]:px-2.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center justify-center gap-1 min-[360px]:gap-1.5 text-xs sm:text-sm font-extrabold font-display tabular-nums cursor-pointer hover:border-[var(--combo-fire)] transition-colors"
          >
            <Flame
              className={`w-4 h-4 shrink-0 ${
                state.streakDays > 0
                  ? 'text-[var(--combo-fire)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            />
            <span>{state.streakDays}</span>

            {state.streakShields > 0 && (
              <motion.span
                key={shieldBurstTick}
                initial={{ scale: 0.7 }}
                animate={{ scale: [1, 1.28, 1] }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[var(--info)] ml-0.5"
                title={`Aktywne Tarcze Serii: ${state.streakShields}/2`}
              >
                <Shield className="w-3.5 h-3.5 fill-[var(--info)]/20" />
                <span className="hidden min-[380px]:inline">
                  {state.streakShields}
                </span>
              </motion.span>
            )}
          </button>

          {/* 2. Hearts (below 380px shows just number e.g. '5', >= 380px shows '5/5') */}
          <motion.button
            type="button"
            key={heartEventTick?.tick ?? 'hearts-idle'}
            animate={
              heartEventTick?.type === 'loss'
                ? { x: [-4, 4, -3, 3, 0] }
                : heartEventTick?.type === 'restore'
                ? { scale: [0.85, 1.25, 1] }
                : {}
            }
            transition={{ duration: 0.35 }}
            onClick={() => {
              playSound('tap');
              setRescueModalOpen(true);
            }}
            aria-label={`Serca: ${state.hearts} z 5`}
            className="relative min-h-[44px] min-w-[44px] px-1.5 min-[360px]:px-2.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center justify-center gap-1 min-[360px]:gap-1.5 text-xs sm:text-sm font-extrabold font-display tabular-nums cursor-pointer hover:border-[var(--danger)] transition-colors"
          >
            <Heart
              className={`w-4 h-4 shrink-0 ${
                state.hearts > 0
                  ? 'text-[var(--danger)] fill-[var(--danger)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            />
            <span className="inline min-[380px]:hidden">{state.hearts}</span>
            <span className="hidden min-[380px]:inline">
              {state.hearts}/5
            </span>

            {/* Floating -1 indicator on heart loss (Choreography #8) */}
            <AnimatePresence>
              {heartEventTick?.type === 'loss' && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -22 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                  className="absolute -top-3 right-1 text-xs font-extrabold text-[var(--danger)] pointer-events-none"
                >
                  -1
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* 3. Coins */}
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              setActiveTab('profile', 'shop');
            }}
            aria-label={`Monety: ${state.coins}. Kliknij, aby przejść do Sklepu Lumi`}
            className="min-h-[44px] min-w-[44px] px-1.5 min-[360px]:px-2.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center justify-center gap-1 min-[360px]:gap-1.5 text-xs sm:text-sm font-extrabold font-display tabular-nums cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
          >
            <Coins className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
            <span className="inline min-[380px]:hidden">
              {formatCompactCoins(state.coins)}
            </span>
            <span className="hidden min-[380px]:inline">
              <CountUpNumber value={state.coins} />
            </span>
          </button>
        </div>
      </header>

      {/* Streak & Shield Info Sheet */}
      <BottomSheet
        open={streakInfoOpen}
        onClose={() => setStreakInfoOpen(false)}
        title="Seria i tarcze"
        subtitle="Dzień kończy się o północy czasu polskiego."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] mb-1">
                <Flame className="w-4 h-4 text-[var(--combo-fire)]" />
                <span>Twoja seria</span>
              </div>
              <div className="text-2xl font-extrabold font-display tabular-nums">
                {state.streakDays} dni
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Co 7 dni ciągłej serii odbierasz bonus +50 monet!
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] mb-1">
                <Shield className="w-4 h-4 text-[var(--info)]" />
                <span>Tarcze Serii</span>
              </div>
              <div className="text-2xl font-extrabold font-display tabular-nums text-[var(--info)]">
                {state.streakShields} / 2
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Każda Tarcza automatycznie ratuje 1 pominięty dzień.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-canvas)]/60 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1.5">
            <p>
              <strong className="text-[var(--text-primary)]">
                Jak zaliczyć dzień?
              </strong>{' '}
              Ukończ lekcję albo miniarkusz przed
              północą czasu polskiego.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">
                Status regeneracji serc:
              </strong>{' '}
              {state.hearts >= 5
                ? 'Masz pełne 5/5 serc.'
                : `Kolejne darmowe serce za ${formatCountdown(
                    secondsToNextHeart
                  )} (+1 co 30 min).`}
            </p>
          </div>

          <div className="flex gap-3">
            <TactileButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setStreakInfoOpen(false)}
            >
              Zamknij
            </TactileButton>
            <TactileButton
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setStreakInfoOpen(false);
                setActiveTab('profile', 'shop');
              }}
            >
              Przejdź do sklepu
            </TactileButton>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
