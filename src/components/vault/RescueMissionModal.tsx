'use client';

import React from 'react';
import { Heart, Coins, Clock, Play, BookOpen } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  HEART_REFILL_PRICE,
  MAX_FREE_RESCUE_PER_DAY,
  MAX_HEARTS,
} from '../../lib/gamification';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

function formatCountdown(seconds: number | null): string {
  if (seconds === null) return 'Pełne (5/5)';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s < 10 ? '0' : ''}${s} s`;
}

export function RescueMissionModal() {
  const {
    state,
    rescueModalOpen,
    setRescueModalOpen,
    secondsToNextHeart,
    startPracticeSession,
    buyHeartWithCoins,
    openLessonTheory,
  } = useAppState();

  const freeLimitReached =
    state.rescueMissionsCompletedToday >= MAX_FREE_RESCUE_PER_DAY;
  const totalVaultTasks =
    state.mistakeBank.length + state.savedTasks.length;
  const heartsFull = state.hearts >= MAX_HEARTS;

  return (
    <BottomSheet
      open={rescueModalOpen}
      onClose={() => setRescueModalOpen(false)}
      title="Misja Ratunkowa & Serca"
      subtitle="Zero paywalla — w JASNE E8 zawsze możesz odzyskać serce nauką!"
    >
      <div className="space-y-4">
        {/* Top Status Header with Lumi */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center gap-4">
          <LumiMascot
            mood={state.hearts === 0 ? 'supportive' : 'happy'}
            loadout={state.loadout}
            size="sm"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--danger)] fill-[var(--danger)]" />
              <span className="text-lg font-extrabold font-display tabular-nums">
                Twoje Serca: {state.hearts} / {MAX_HEARTS}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[var(--info)] shrink-0" />
              <span>
                {heartsFull
                  ? 'Masz pełny zapas serc (5/5)!'
                  : `Kolejne darmowe serce za: ${formatCountdown(
                      secondsToNextHeart
                    )} (+1 co 30 min)`}
              </span>
            </div>
          </div>
        </div>

        {/* Option 1: Free Rescue Mission (2 correct tasks = +1 Heart, max 3/day) */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--info)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold font-display text-[var(--info)]">
                Wariant darmowy • Nauka zamiast czekania
              </div>
              <h3 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                Misja Ratunkowa: 2 poprawne zadania = +1 Serce
              </h3>
            </div>
            <span className="text-xs font-extrabold font-display tabular-nums text-[var(--text-secondary)]">
              Dziś: {state.rescueMissionsCompletedToday}/{MAX_FREE_RESCUE_PER_DAY}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Rozwiąż poprawnie 2 zadania z Banku Błędów lub Zapisanych. Postęp
            bieżącej misji ({state.rescueMissionCurrentProgress}/2) nie przepada
            przy wyjściu!
          </p>

          {freeLimitReached ? (
            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-extrabold font-display text-[var(--accent-text)] text-center">
              Wykorzystano 3/3 dzisiaj — wróć jutro
            </div>
          ) : totalVaultTasks === 0 ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                Twój Bank Błędów i Zapisane są obecnie puste — zapisz dowolne
                zadanie zakładką w lekcji lub przeglądaj Teorię Bento i Wzory E8
                bez blokad!
              </div>
              <TactileButton
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setRescueModalOpen(false);
                  openLessonTheory();
                }}
              >
                <BookOpen className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Otwórz Teorię Bento (zawsze dostępna)</span>
              </TactileButton>
            </div>
          ) : (
            <TactileButton
              variant="info"
              size="md"
              fullWidth
              disabled={heartsFull}
              onClick={() => {
                startPracticeSession('rescue');
              }}
            >
              <Play className="w-4 h-4" />
              <span>
                {heartsFull
                  ? 'Serca pełne (5/5)'
                  : `Start Misji Ratunkowej (${state.rescueMissionCurrentProgress}/2)`}
              </span>
            </TactileButton>
          )}
        </div>

        {/* Option 2: Paid with in-game coins (80 coins = +1 Heart, no daily limit) */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold font-display text-[var(--accent-text)]">
              Natychmiastowe doładowanie • Bez limitu dziennego
            </div>
            <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)]">
              Doładowanie +1 Serca za {HEART_REFILL_PRICE} monet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
              Masz obecnie: {state.coins} monet
            </p>
          </div>

          <TactileButton
            variant="primary"
            size="md"
            disabled={heartsFull || state.coins < HEART_REFILL_PRICE}
            onClick={() => {
              buyHeartWithCoins();
            }}
          >
            <Coins className="w-4 h-4" />
            <span>
              {heartsFull
                ? 'Serca pełne (5/5)'
                : state.coins < HEART_REFILL_PRICE
                ? `Brakuje ${HEART_REFILL_PRICE - state.coins} monet`
                : `Kup +1 Serce (${HEART_REFILL_PRICE})`}
            </span>
          </TactileButton>
        </div>
      </div>
    </BottomSheet>
  );
}
