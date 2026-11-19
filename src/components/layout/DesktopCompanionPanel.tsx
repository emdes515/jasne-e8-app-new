'use client';

import React from 'react';
import { Crown, Trophy, Check, Coins } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  computeDailyGoalProgress,
  getRankForXp,
} from '../../lib/gamification';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';

/**
 * Right companion panel (300px wide), rendered STRICTLY at >= 1440px (min-[1440px]:flex)
 * on Start and Learn screens so that 248 + 780 + 300 + 48 = 1376px <= 1440px (AC-M6).
 */
export function DesktopCompanionPanel({ showProgress }: { showProgress: boolean }) {
  const { state, claimDailyChallenge, setActiveTab } = useAppState();

  const dailyGoal = computeDailyGoalProgress({
    dailyGoalMinutes: state.dailyGoalMinutes,
    dailyLessonsCompleted: state.dailyLessonsCompleted,
    dailyTasksChecked: state.dailyTasksChecked,
  });

  const rankInfo = getRankForXp(state.xp);

  return (
    <aside
      aria-label="Panel towarzyszący statusu Lumi"
      className="hidden min-[1440px]:flex flex-col gap-4 w-[300px] shrink-0"
    >
      {/* Lumi Companion Card */}
      <div className="p-4 study-panel flex flex-col items-center text-center space-y-2.5">
        <LumiMascot
          mood={dailyGoal.percent >= 100 ? 'celebrate' : 'idle'}
          loadout={state.loadout}
          size="sm"
        />
        <div>
          <div className="text-xs font-extrabold font-display text-[var(--accent-text)]">
            Lumi
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {dailyGoal.percent >= 100
              ? 'Dzisiejszy cel osiągnięty.'
              : 'Przymierz akcesoria z kolekcji.'}
          </p>
        </div>
        <TactileButton
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => setActiveTab('profile', 'shop')}
        >
          Przymierzalnia Lumi
        </TactileButton>
      </div>

      {showProgress && (<>{/* Cel i wyzwania są już widoczne na ekranie Start. */}
      <div className="p-4 study-panel space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-[var(--text-secondary)]">
              Cel dnia ({state.dailyGoalMinutes} min)
            </span>
            <span className="font-extrabold font-display tabular-nums text-[var(--accent-text)]">
              {dailyGoal.percent}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
              style={{ width: `${dailyGoal.percent}%` }}
            />
          </div>
          <div className="text-[11px] font-semibold text-[var(--text-secondary)] mt-1 tabular-nums">
            {dailyGoal.caption}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1 font-display text-[var(--text-primary)]">
              <Crown className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>{rankInfo.currentRank.name}</span>
            </span>
            <span className="tabular-nums text-[var(--text-secondary)]">
              {state.xp} XP
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
            <div
              className="h-full bg-[var(--success)] rounded-full transition-all"
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Compact Daily Challenges */}
      <div className="p-4 study-panel space-y-2.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[var(--accent-text)]" />
          <h3 className="text-xs font-extrabold font-display text-[var(--text-primary)]">
            Wyzwania na dziś
          </h3>
        </div>

        <div className="space-y-2">
          {state.dailyChallenges.map((ch) => {
            const done = ch.current >= ch.target;
            return (
              <div
                key={ch.challengeId}
                className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[var(--text-primary)] [overflow-wrap:anywhere]">
                    {ch.title}
                  </span>
                  <span className="font-bold tabular-nums text-[var(--text-secondary)] shrink-0">
                    {ch.current}/{ch.target}
                  </span>
                </div>

                {ch.claimed ? (
                  <div className="text-[11px] font-extrabold text-[var(--success)] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Odebrane ✓</span>
                  </div>
                ) : done ? (
                  <TactileButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => claimDailyChallenge(ch.challengeId)}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Odbierz +{ch.rewardCoins}</span>
                  </TactileButton>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      </>)}
    </aside>
  );
}
