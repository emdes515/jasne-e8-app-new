'use client';

import { ArrowRight, BookOpen, Check, Clock, Coins } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { HEART_REFILL_PRICE, MAX_FREE_RESCUE_PER_DAY, MAX_HEARTS } from '../../lib/gamification';
import { formatHeartCountdown } from '../../lib/lumiCopy';
import { getRescueTaskIds } from '../../lib/rescueMission';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';
import { TactileHeartIcon } from '../ui/TactileHeartIcon';

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

  if (!rescueModalOpen) return null;

  const heartsFull = state.hearts >= MAX_HEARTS;
  const missionsLeft = Math.max(0, MAX_FREE_RESCUE_PER_DAY - state.rescueMissionsCompletedToday);
  const progress = state.rescueMissionCurrentProgress;
  const taskCount = getRescueTaskIds(state).length;
  const missingCoins = Math.max(0, HEART_REFILL_PRICE - state.coins);
  const nextHeart = secondsToNextHeart === null
    ? 'Serca odnawiają się automatycznie.'
    : `Kolejne serce za ${formatHeartCountdown(secondsToNextHeart)}`;

  return (
    <BottomSheet open onClose={() => setRescueModalOpen(false)} title="Serca i Misja ratunkowa" maxWidthClass="max-w-lg">
      <div className="space-y-3.5">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 sm:px-4">
          <div className="shrink-0" aria-hidden="true">
            <LumiMascot mood={heartsFull ? 'happy' : 'supportive'} loadout={state.loadout} size="sm" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-base font-extrabold tabular-nums font-display">
              <span aria-hidden="true"><TactileHeartIcon size={20} variant={state.hearts === 0 ? 'cracked' : 'full'} /></span>
              <span>{heartsFull ? 'Masz pełny zapas serc' : `Serca ${state.hearts}/${MAX_HEARTS}`}</span>
            </div>
            {!heartsFull && (
              <p className="flex items-center gap-1.5 text-sm tabular-nums text-[var(--text-secondary)]">
                <Clock size={15} className="shrink-0 text-[var(--info)]" aria-hidden="true" />
                {nextHeart}
              </p>
            )}
          </div>
        </div>

        {!heartsFull && (
          <>
            <section className="space-y-3 rounded-2xl border border-[var(--info)]/45 bg-gradient-to-br from-[var(--info)]/10 to-[var(--bg-surface)] p-3.5 sm:p-4" aria-labelledby="rescue-mission-title">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 id="rescue-mission-title" className="text-lg font-extrabold tracking-tight">Odzyskaj serce w powtórce</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Rozwiąż poprawnie dwa różne zadania.</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-extrabold text-[var(--info)]">
                  <span aria-hidden="true"><TactileHeartIcon size={14} /></span> +1 serce
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs font-bold text-[var(--text-secondary)] tabular-nums">
                  <span>Poprawne zadania {progress}/2</span>
                  <span>Dostępne dziś {missionsLeft}/{MAX_FREE_RESCUE_PER_DAY} misje</span>
                </div>
                <div aria-hidden="true" className="grid grid-cols-2 gap-2">
                  {[1, 2].map((step) => (
                    <div key={step} className={`grid h-7 place-items-center rounded-md border text-xs font-extrabold ${progress >= step
                      ? 'border-[var(--success)]/45 bg-[var(--success)]/10 text-[var(--success)]'
                      : 'border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}>
                      {progress >= step ? <Check size={15} /> : step}
                    </div>
                  ))}
                </div>
              </div>

              {missionsLeft === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">Wszystkie dzisiejsze misje zostały wykorzystane. Kolejne będą dostępne jutro.</p>
              ) : taskCount === 0 ? (
                <>
                  <p className="text-sm text-[var(--text-secondary)]">Brak kolejnych zadań do tej misji w Banku błędów i Zapisanych. W czasie oczekiwania możesz powtórzyć teorię.</p>
                  <TactileButton variant="secondary" size="md" fullWidth onClick={() => {
                    setRescueModalOpen(false);
                    openLessonTheory();
                  }}>
                    <BookOpen size={17} aria-hidden="true" /> Otwórz teorię
                  </TactileButton>
                </>
              ) : (
                <>
                  {taskCount < 2 - progress && (
                    <p className="text-sm text-[var(--text-secondary)]">Możesz zrobić jedno zadanie teraz. Do ukończenia misji potrzebne będzie jeszcze jedno inne zadanie.</p>
                  )}
                  <TactileButton variant="info" size="md" fullWidth onClick={() => startPracticeSession('rescue')}>
                    {progress ? 'Kontynuuj misję' : 'Rozpocznij darmową misję'} <ArrowRight size={18} aria-hidden="true" />
                  </TactileButton>
                </>
              )}
            </section>

            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4" aria-labelledby="rescue-coins-title">
              <div>
                <h3 id="rescue-coins-title" className="flex items-center gap-2 text-sm font-extrabold">
                  <Coins size={17} className="text-[var(--accent-text)]" aria-hidden="true" />
                  Serce za monety z gry
                </h3>
                <p className="mt-1 text-xs tabular-nums text-[var(--text-secondary)]">
                  Koszt {HEART_REFILL_PRICE} · saldo {state.coins}
                </p>
              </div>
              {missingCoins > 0 ? (
                <p className="text-xs font-bold text-[var(--text-secondary)]">Brakuje {missingCoins} monet</p>
              ) : (
                <TactileButton variant="secondary" size="sm" onClick={buyHeartWithCoins}>
                  Wymień {HEART_REFILL_PRICE} monet
                </TactileButton>
              )}
            </section>
          </>
        )}
      </div>
    </BottomSheet>
  );
}