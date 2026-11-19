'use client';

import { Check, Flame } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';


const dayLabel = (count: number) => count === 1 ? 'dzień' : 'dni';

export function StartStreakPanel() {
  const { state } = useAppState();
  const days = state.streakDays;
  const todayDone = state.lastCompletedPlayerDay === state.currentPlayerDay;
  const target = days < 3 ? 3 : (Math.floor(days / 7) + 1) * 7;
  const completedSteps = days < 3 ? days : days % 7;
  const stepCount = days < 3 ? 3 : 7;

  return (
    <section className="study-panel grid items-center gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-5 sm:px-5" aria-labelledby="today-streak">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--combo-fire)]/12 text-[var(--combo-fire)]">
          <Flame size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 id="today-streak" className="text-base font-extrabold">Seria nauki · {days} {dayLabel(days)}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {todayDone ? 'Dziś zaliczone. Wróć jutro, żeby przedłużyć serię.' : 'Ukończ dziś lekcję lub miniarkusz, żeby zaliczyć dzień.'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1.5">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Cel: {target} {dayLabel(target)} z rzędu</span>
        <div className="flex shrink-0 gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={stepCount} aria-valuenow={completedSteps} aria-label={`Postęp celu: ${days} z ${target} dni`}>
          {Array.from({ length: stepCount }, (_, index) => (
            <span key={index} aria-hidden="true" className={`grid size-5 place-items-center rounded-md border ${index < completedSteps ? 'border-transparent bg-[var(--accent-primary)] text-[var(--on-accent)]' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'}`}>
              {index < completedSteps && <Check size={13} strokeWidth={3} />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
