'use client';

import { useState } from 'react';
import { BookOpen, Check, Lock, Flag, Play, RotateCcw, Timer } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLessonAttempt, getRecommendedMathLesson, MATH_CHAPTERS_MAP, MATH_LESSONS, type ChapterMeta } from '../../data/mathLessonMock';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { SubjectComingSoonView } from './SubjectComingSoonView';

export function LearnPathView() {
  const { state, hasStudentAccount, openLessonTheory, startLessonTasks, startPracticeSession, setFormulasOpen, setActiveTab } = useAppState();
  const [previewChapter, setPreviewChapter] = useState<ChapterMeta | null>(null);

  if (state.activeSubject !== 'math') return <SubjectComingSoonView />;

  const recommendedId = getRecommendedMathLesson(state).id;
  const finished = MATH_LESSONS.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;

  return (
    <div className="space-y-7">
      <header className="learn-map-header study-feature relative overflow-hidden p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold text-[var(--accent-text)]">Matematyka · Dział 1 z 7</p>
            <h1 className="page-heading">Liczby, potęgi i pierwiastki</h1>
          </div>
          <TactileButton variant="secondary" size="sm" className="sm:hidden" onClick={() => setFormulasOpen(true)}>
            <BookOpen size={16} />
            Wzory E8
          </TactileButton>
        </div>
        <progress className="study-progress my-3" aria-label="Ukończone lekcje działu" value={finished} max={MATH_LESSONS.length} />
        <p className="text-sm text-[var(--text-secondary)]">Ukończono {finished} z {MATH_LESSONS.length} lekcji</p>
      </header>

      <ol aria-label="Lekcje z matematyki" className="learn-route">
        {MATH_LESSONS.map((lesson, lessonIdx) => {
          const done = state.completedLessonIds.includes(lesson.id);
          const attempt = getLessonAttempt(state, lesson.id);
          const theoryCard = state.theoryCards?.[lesson.id];
          const theoryIndex = theoryCard ? lesson.theory.findIndex((card) => card.id === theoryCard) : -1;
          const reviewIds = state.lessonReviewTasks?.[lesson.id] ??
            lesson.tasks.filter((task) => state.mistakeBank.some((entry) => entry.taskId === task.id)).map((task) => task.id);
          const lockedByGuest = lessonIdx > 0 && !hasStudentAccount;
          const current = !done && !lockedByGuest && lesson.id === recommendedId;
          return (
            <li key={lesson.id} className="learn-stop" data-state={lockedByGuest ? 'locked' : done ? 'done' : current ? 'current' : 'ready'}>
              <span className="learn-marker" aria-hidden="true">
                {lockedByGuest ? <Lock size={17} /> : done ? <Check size={21} /> : current ? <Flag size={19} /> : <span className="learn-marker-dot" />}
              </span>
              <article className="learn-lesson study-panel min-w-0 p-3.5 sm:p-5">
                <p className="mb-1 text-xs font-bold text-[var(--accent-text)]">
                  Lekcja {lesson.nodeNumber}
                  {lockedByGuest
                    ? ' · Wymagane konto ucznia'
                    : done
                    ? ' · Ukończona'
                    : current
                    ? ' · Następna na ścieżce'
                    : ''}
                </p>
                <h2 className="text-base font-extrabold text-pretty sm:text-xl">{lesson.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{lesson.subtitle}</p>
                {lockedByGuest ? (
                  <div className="mt-3">
                    <TactileButton variant="info" size="sm" onClick={() => openLessonTheory(lesson.id)}>
                      <Lock size={15} /> Odblokuj lekcję
                    </TactileButton>
                  </div>
                ) : (
                  <>
                    {(attempt || theoryIndex >= 0) && (
                      <p className="mt-2 text-xs font-bold text-[var(--text-secondary)]">
                        {theoryIndex >= 0
                          ? 'Karta ' + (theoryIndex + 1) + ' z ' + lesson.theory.length
                          : attempt && 'Zapisano ' + Object.keys(attempt.answers).length + ' z ' + attempt.taskIds.length + ' odpowiedzi'}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attempt && (
                        <TactileButton size="sm" onClick={() => startLessonTasks(lesson.id)}>
                          <Play size={16} /> Wznów zadania
                        </TactileButton>
                      )}
                      <TactileButton variant={current && !attempt ? 'primary' : 'secondary'} size="sm" onClick={() => openLessonTheory(lesson.id, done)}>
                        <BookOpen size={16} /> {theoryIndex >= 0 ? 'Wznów teorię' : done ? 'Powtórz materiał' : attempt ? 'Przeczytaj teorię' : 'Otwórz lekcję'}
                      </TactileButton>
                      {done && !attempt && (
                        <TactileButton variant="secondary" size="sm" onClick={() => startLessonTasks(lesson.id)}>
                          <Play size={16} /> Rozwiąż zadania ponownie
                        </TactileButton>
                      )}
                      {done && reviewIds.length > 0 && (
                        <TactileButton variant="secondary" size="sm" onClick={() => startPracticeSession('bank', 'all', reviewIds, lesson.id)}>
                          <RotateCcw size={16} /> Powtórz błędy ({reviewIds.length})
                        </TactileButton>
                      )}
                    </div>
                  </>
                )}
              </article>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="coming-chapters" className="space-y-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="coming-chapters" className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            Kolejne działy
          </h2>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Działy 2–7 · w przygotowaniu
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MATH_CHAPTERS_MAP.slice(1).map((chapter) => (
            <button
              key={chapter.chapterNumber}
              type="button"
              onClick={() => setPreviewChapter(chapter)}
              className="study-panel group flex items-start gap-3.5 p-4 text-left transition-all hover:border-[var(--accent-primary)]/45 hover:bg-[var(--bg-elevated)] active:translate-y-[1px] cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-display text-sm font-black tabular-nums text-[var(--accent-text)] transition-colors group-hover:border-[var(--accent-primary)]/40"
              >
                {String(chapter.chapterNumber).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-extrabold leading-snug text-[var(--text-primary)]">
                    {chapter.title}
                  </h3>
                  <Lock
                    size={15}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[var(--text-secondary)] opacity-75 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  {chapter.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
      <BottomSheet
        open={previewChapter !== null}
        onClose={() => setPreviewChapter(null)}
        title={previewChapter?.title ?? 'Kolejny dział'}
        subtitle={previewChapter ? `Matematyka · Dział ${previewChapter.chapterNumber} z 7 · w przygotowaniu` : 'Dział w przygotowaniu.'}
      >
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{previewChapter?.subtitle}</p>
        <TactileButton variant="secondary" onClick={() => setActiveTab('exam')}>
          <Timer size={16} /> Przejdź do miniarkusza
        </TactileButton>
      </BottomSheet>

    </div>
  );
}
