'use client';

import { ArrowRight, RotateCcw } from 'lucide-react';
import { type SessionCompletionSummary, useAppState } from '../../context/AppStateContext';
import { MATH_LESSONS } from '../../data/mathLessonMock';
import { ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { getRankForXp } from '../../lib/gamification';
import { requiresGuardianConsent } from '../../lib/legalAgeGate';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';

export function LessonSummaryModal({ summary }: { summary: SessionCompletionSummary }) {
  const { state, hasStudentAccount, clearSessionSummary, setActiveTab, openLessonTheory, startPracticeSession } = useAppState();
  const rank = getRankForXp(state.xp);
  const isLesson = summary.source === 'lesson';
  const lessonIndex = MATH_LESSONS.findIndex((lesson) => lesson.id === summary.contentId);
  const nextLesson = isLesson && lessonIndex >= 0 ? MATH_LESSONS[lessonIndex + 1] : undefined;
  const isRescue = summary.source === 'rescue';
  const hasReview = isLesson && summary.reviewTaskIds.length > 0;
  const assessedCount = summary.totalCount - summary.ungradedCount;
  const reviewTopics = [...new Set(summary.reviewTaskIds.map((id) => ALL_TASKS_BY_ID[id]?.topicTag).filter(Boolean))];

  function leaveSummary() {
    clearSessionSummary();
    setActiveTab(isLesson ? 'start' : summary.reviewLessonId ? 'learn' : 'vault');
  }

  return (
    <section className="study-panel space-y-5 p-4 sm:space-y-6 sm:p-7" aria-labelledby="lesson-summary-title">
      <header className="border-b border-[var(--border-subtle)] pb-4">
        <p className="text-xs font-extrabold text-[var(--accent-text)]">
          {isLesson ? 'Lekcja ukończona' : isRescue ? 'Koniec misji ratunkowej' : 'Powtórka ukończona'}
        </p>
        <h1 id="lesson-summary-title" className="mt-1 text-balance font-display text-xl font-extrabold sm:text-3xl">
          {summary.title}
        </h1>
      </header>

      <section aria-labelledby="lesson-diagnosis" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="lesson-diagnosis" className="text-lg font-extrabold">Wynik i następny krok</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {assessedCount > 0
                ? summary.correctCount + ' z ' + assessedCount + ' ocenionych zadań w pełni poprawnie · ' + summary.accuracyPercent + '% punktów'
                : 'Rozwiązania porównane samodzielnie.'}
            </p>
          </div>
          <div aria-hidden="true" className="shrink-0">
            <LumiMascot mood={hasReview ? 'supportive' : 'happy'} loadout={state.loadout} size="sm" />
          </div>
        </div>
        {summary.ungradedCount > 0 && assessedCount > 0 && (
          <p className="text-xs text-[var(--text-secondary)]">Samodzielnie porównane zadania ({summary.ungradedCount}) są poza wynikiem punktowym.</p>
        )}
        {hasReview && (
          <div className="space-y-3 rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/8 p-3.5 sm:p-4">
            <div>
              <h3 className="font-extrabold">Zadania do poprawy · {summary.reviewTaskIds.length}</h3>
              {reviewTopics.length > 0 && (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {reviewTopics.slice(0, 3).join(' · ')}
                  {reviewTopics.length > 3 && ' · +' + (reviewTopics.length - 3)}
                </p>
              )}
            </div>
            <TactileButton fullWidth onClick={() => startPracticeSession('bank', 'all', summary.reviewTaskIds, summary.contentId)}>
              <RotateCcw size={17} aria-hidden="true" /> Powtórz błędy
            </TactileButton>
          </div>
        )}
        {nextLesson && (
          <div className="space-y-2">
            {!hasStudentAccount && (
              <p className="text-sm text-[var(--text-secondary)]">
                {state.ageBracket && requiresGuardianConsent(state.ageBracket)
                  ? 'Kolejne lekcje odblokujesz po założeniu bezpłatnego konta przez rodzica lub opiekuna.'
                  : 'Kolejne lekcje odblokujesz po założeniu bezpłatnego konta ucznia.'}
              </p>
            )}
            <TactileButton onClick={() => openLessonTheory(nextLesson.id)}>
              {hasStudentAccount ? 'Otwórz następną lekcję' : 'Odblokuj kolejną lekcję'}
              <ArrowRight size={17} aria-hidden="true" />
            </TactileButton>
          </div>
        )}
        {isRescue && summary.rescueHeartEarned && <p className="text-sm font-bold text-[var(--success)]">Odzyskano serce.</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {isLesson && (
            <TactileButton variant="secondary" onClick={() => {
              clearSessionSummary();
              openLessonTheory(summary.contentId, true);
            }}>
              <RotateCcw size={16} aria-hidden="true" /> Powtórz materiał
            </TactileButton>
          )}
          <TactileButton variant={hasReview || nextLesson ? 'secondary' : 'primary'} onClick={leaveSummary}>
            {isLesson ? 'Wróć na Start' : summary.reviewLessonId ? 'Wróć do ścieżki nauki' : 'Wróć do powtórek'}
            <ArrowRight size={17} aria-hidden="true" />
          </TactileButton>
        </div>
      </section>

      <section className="space-y-2 border-t border-[var(--border-subtle)] pt-4" aria-labelledby="lesson-rewards">
        <h2 id="lesson-rewards" className="text-xs font-extrabold text-[var(--text-secondary)]">Nagrody i ranga</h2>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold tabular-nums">
          <span>+{summary.xpEarned} XP</span>
          <span>+{summary.coinsEarned} monet</span>
          <span className="text-[var(--accent-text)]">{rank.currentRank.name}</span>
        </p>
        <progress className="study-progress" aria-label="Postęp rangi E8" max={100} value={rank.progressPercent} />
        <p className="text-xs text-[var(--text-secondary)]">
          {state.xp} XP łącznie{rank.nextRank ? ' · ' + rank.xpToNext + ' XP do rangi ' + rank.nextRank.name : ' · Najwyższa ranga'}
        </p>
        {summary.streakMilestoneCoins > 0 && <p className="text-xs text-[var(--text-secondary)]">Bonus za serię: +{summary.streakMilestoneCoins} monet.</p>}
        {isLesson && summary.isRepeatToday && (
          <p className="text-xs text-[var(--text-secondary)]">Przy powtórce tej samej lekcji dziś zdobywasz 30% XP. Monety są przyznawane raz dziennie.</p>
        )}
        {!isLesson && <p className="text-xs text-[var(--text-secondary)]">W trybie powtórkowym zdobywasz 50% bazowego XP zadań.</p>}
      </section>
    </section>
  );
}
