'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sprout, Compass, Swords, Crown, Flame, Check } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { SPRING_BOUNCY } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';

const RANK_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Sprout,
  Compass,
  Swords,
  Crown,
  Flame,
};

export function RankUpModal() {
  const { state, rankUpModalRank, dismissRankUpModal } = useAppState();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (rankUpModalRank && !prefersReduced) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#FFB800', '#10B981', '#38BDF8', '#F97316'],
        });
      } catch {
        // Ignore in headless environments
      }
    }
  }, [rankUpModalRank, prefersReduced]);

  return (
    <AnimatePresence>
      {rankUpModalRank && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Awans Rangi E8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissRankUpModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.78, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={SPRING_BOUNCY}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)] shadow-[0_8px_0_0_var(--accent-primary-edge)] p-6 sm:p-8 text-center space-y-5"
          >
            <div className="flex justify-center">
              <LumiMascot
                mood="celebrate"
                loadout={state.loadout}
                size="lg"
              />
            </div>

            {(() => {
              const IconComp =
                RANK_ICON_MAP[rankUpModalRank.iconName] ?? Crown;
              return (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent-primary)] text-[var(--on-accent)] border-2 border-[var(--accent-primary-edge)] flex items-center justify-center">
                  <IconComp className="w-8 h-8" />
                </div>
              );
            })()}

            <div>
              <div className="text-xs font-extrabold font-display text-[var(--accent-text)] mb-1">
                Nowa ranga
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-primary)]">
                {rankUpModalRank.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">
                Przekroczyłeś próg {rankUpModalRank.minXp} XP! Twoja nowa
                odznaka jest już widoczna w Profilu.
              </p>
            </div>

            <TactileButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={dismissRankUpModal}
            >
              <Check className="w-5 h-5" />
              <span>Super, gramy dalej!</span>
            </TactileButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
