'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, BookmarkCheck, Flame, Play, Timer } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLessonAttempt, getRecommendedMathLesson } from '../../data/mathLessonMock';
import { computeDailyGoalProgress } from '../../lib/gamification';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { DailyChallengesCard } from './DailyChallengesCard';
import { StartStreakPanel } from './StartStreakPanel';

export function StartView() {
  const { state, setActiveTab, openLessonTheory, startLessonTasks, setFormulasOpen, playSound } = useAppState();
  const goal = computeDailyGoalProgress(state);
  const isMath = state.activeSubject === 'math';
  const lesson = getRecommendedMathLesson(state);
  const hasPausedTasks = Boolean(getLessonAttempt(state, lesson.id));
  const hasPausedTheory = Boolean(state.theoryCards?.[lesson.id]);
  const [playWelcome] = useState(() => {
    try { return !sessionStorage.getItem('jasne-e8:welcomed'); } catch { return false; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('jasne-e8:welcomed', '1'); } catch { /* Storage is optional. */ }
  }, []);
  const completed = state.completedLessonIds.includes(lesson.id);
  const reviewCount = state.mistakeBank.length + state.savedTasks.length;
  const accuracy = state.accuracyPointsPossible
    ? Math.round((state.accuracyPointsEarned / state.accuracyPointsPossible) * 100)
    : null;

  const lessonAction = (hasPausedTasks || hasPausedTheory) ? 'Wznów lekcję' : completed ? 'Powtórz materiał' : 'Otwórz lekcję';
  const subjectName = state.activeSubject === 'polish' ? 'Język polski' : 'Język angielski';

  return (
    <div className="space-y-7">
      <header className={playWelcome ? 'welcome-header welcome-entrance' : 'welcome-header'}>
        <div className="min-w-0">
          <h1 className="page-heading [overflow-wrap:anywhere]">{state.totalTasksSolved > 0 ? 'Miło Cię widzieć' : 'Cześć'}, {state.nickname}!</h1>
        </div>
        <div className="welcome-orbit" aria-hidden="true">
          <span className="welcome-track" />
          <span className="welcome-spark">✦</span>
          <LumiMascot
            mood={state.totalTasksSolved > 0 ? 'happy' : 'idle'}
            loadout={state.loadout}
            size="sm"
          />
        </div>
      </header>

      <StartStreakPanel />

      <section aria-labelledby="start-lesson" className="study-feature grid gap-5 p-4 sm:gap-7 sm:p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,42%)] sm:items-center">
        <div className="study-board study-lesson-art flex min-h-28 items-center justify-center sm:order-last sm:self-stretch" aria-hidden="true">
          <span className="study-board-mark">{isMath ? '2³' : 'A'}</span>
          <span className="study-lesson-symbol" aria-hidden="true">{isMath ? '½' : '↗'}</span>
          <span className="study-board-mark">{isMath ? '√9' : 'B'}</span>
        </div>
        <div className="min-w-0 sm:py-2">
          <h2 id="start-lesson" className="text-xl sm:text-2xl font-extrabold tracking-tight text-pretty">
            {isMath ? lesson.title : subjectName}
          </h2>
          <p className="mt-2 mb-4 text-sm text-[var(--text-secondary)]">
            {isMath ? 'Krótka teoria, przykład i 5 zadań.' : 'Lekcje w przygotowaniu. Możesz już zobaczyć plan działów.'}
          </p>
          <TactileButton
            onClick={() => {
              if (!isMath) setActiveTab('learn');
              else if (hasPausedTasks && !hasPausedTheory) startLessonTasks(lesson.id);
              else openLessonTheory(lesson.id, completed);
            }}
            className="w-full sm:w-auto"
          >
            {isMath ? <Play size={17} /> : <ArrowRight size={17} />}
            {isMath ? lessonAction : 'Zobacz plan działów'}
          </TactileButton>
        </div>
      </section>

      <section aria-label="Postępy w nauce" className="study-panel p-4 sm:p-5">
        <div className="flex justify-between gap-3 text-sm font-semibold">
          <h2>Cel na dziś</h2>
          <span className="text-[var(--text-secondary)]">{state.dailyGoalMinutes} min</span>
        </div>
        <progress className="study-progress my-2" aria-label="Realizacja celu na dziś" value={goal.percent} max={100} />
        <p className="text-sm text-[var(--text-secondary)]">{goal.percent >= 100 ? 'Cel osiągnięty' : goal.caption}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-4 sm:gap-4">
          <div><dt className="text-xs sm:text-sm text-[var(--text-secondary)]">Zadania</dt><dd className="study-stat">{state.totalTasksSolved}</dd></div>
          <div><dt className="text-xs sm:text-sm text-[var(--text-secondary)]">Skuteczność</dt><dd className="study-stat">{accuracy === null ? '—' : `${accuracy}%`}</dd></div>
          <div><dt className="text-xs sm:text-sm text-[var(--text-secondary)]">Rekord combo</dt><dd className="study-stat inline-flex items-center gap-1"><Flame size={16} className="text-[var(--combo-fire)]" />{state.bestCombo}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="start-tools">
        <h2 id="start-tools" className="mb-2 text-lg font-extrabold">Do ćwiczenia</h2>
        <div className="study-panel divide-y divide-[var(--border-subtle)]">
          <button className="study-link" onClick={() => setActiveTab('vault')} type="button">
            <BookmarkCheck size={20} />
            <span>Powtórki</span>
            <small>{reviewCount}</small>
            <ArrowRight size={16} />
          </button>
          {isMath && (
            <>
              <button className="study-link" onClick={() => setActiveTab('exam')} type="button">
                <Timer size={20} />
                <span>Miniarkusz</span>
                <small>5 zadań, 15 min</small>
                <ArrowRight size={16} />
              </button>
              <button className="study-link" onClick={() => { playSound('tap'); setFormulasOpen(true); }} type="button">
                <BookOpen size={20} />
                <span>Wzory E8</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </section>

      <DailyChallengesCard />
    </div>
  );
}
