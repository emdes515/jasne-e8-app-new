'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Coins } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { TactileButton } from '../ui/TactileButton';
import { STAGGER_ITEM_VARIANTS } from '../../lib/motionPresets';

export function DailyChallengesCard() {
  const { state, claimDailyChallenge } = useAppState();
  const claimedCount = state.dailyChallenges.filter((c) => c.claimed).length;

  return (
    <motion.section
      variants={STAGGER_ITEM_VARIANTS}
      aria-label="Wyzwania na dziś"
      className="study-panel p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">

          <div>
            <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
              Wyzwania na dziś
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Nowe wyzwania o północy.
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold font-display tabular-nums text-[var(--accent-text)]">
          {claimedCount}/3 odebrane
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {state.dailyChallenges.map((ch) => {
          const isCompleted = ch.current >= ch.target;
          const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));

          return (
            <div
              key={ch.challengeId}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                    {ch.title}
                  </h3>
                  <span className="text-xs font-bold tabular-nums text-[var(--text-secondary)] shrink-0">
                    {ch.current}/{ch.target}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  {ch.description}
                </p>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[var(--success)]'
                        : 'bg-[var(--accent-primary)]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                {ch.claimed ? (
                  <div className="min-h-[44px] px-3.5 rounded-xl bg-[var(--success)]/15 border-2 border-[var(--success)] text-[var(--success)] text-xs font-extrabold font-display inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Odebrane</span>
                  </div>
                ) : isCompleted ? (
                  <TactileButton
                    variant="primary"
                    size="sm"
                    onClick={() => claimDailyChallenge(ch.challengeId)}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Odbierz +{ch.rewardCoins}</span>
                  </TactileButton>
                ) : (
                  <div className="min-h-[44px] px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-bold font-display text-[var(--accent-text)] inline-flex items-center gap-1 tabular-nums">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{ch.rewardCoins}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
