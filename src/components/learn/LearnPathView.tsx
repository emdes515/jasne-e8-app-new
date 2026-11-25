'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Check, Lock, Flag, Play, RotateCcw, Loader2 } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLessonAttempt } from '../../data/mathLessonMock';
import {
  contentRegistry,
  useSubjectContent,
} from '../../services/content/contentRegistry';
import { TactileButton } from '../ui/TactileButton';

const SUBJECT_NAMES = {
  math: 'Matematyka',
  polish: 'Język polski',
  english: 'Język angielski',
} as const;

function isStarterLesson(lessonId: string): boolean {
  return (
    lessonId === 'lesson:1.1' ||
    lessonId === 'lesson:p1.1' ||
    lessonId === 'lesson:e1.1'
  );
}

export function LearnPathView() {
  const {
    state,
    hasStudentAccount,
    openLessonTheory,
    startLessonTasks,
    startPracticeSession,
    setFormulasOpen,
  } = useAppState();
  const { chapters, loading, error } = useSubjectContent(state.activeSubject);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapters[0]?.chapterId ?? 'math_ch01'
  );

  useEffect(() => {
    setSelectedChapterId(chapters[0]?.chapterId ?? 'math_ch01');
  }, [state.activeSubject, chapters]);

  const activeChapter =
    chapters.find((ch) => ch.chapterId === selectedChapterId) ?? chapters[0];
  const chapterLessons = activeChapter
    ? contentRegistry.getLessonsForChapter(state.activeSubject, activeChapter.chapterId)
    : [];

  const recommendedId = contentRegistry.getRecommendedLesson(
    state,
    state.activeSubject
  ).id;
  const finished = chapterLessons.filter((lesson) =>
    state.completedLessonIds.includes(lesson.id)
  ).length;

  return (
    <div className="space-y-7">
      <header className="learn-map-header study-feature relative overflow-hidden p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold text-[var(--accent-text)]">
              {SUBJECT_NAMES[state.activeSubject]} · Dział {activeChapter?.chapterNumber ?? 1} z{' '}
              {chapters.length}
            </p>
            <h1 className="page-heading">{activeChapter?.title ?? 'Ścieżka nauki'}</h1>
          </div>
          {state.activeSubject === 'math' && (
            <TactileButton
              variant="secondary"
              size="sm"
              className="sm:hidden"
              onClick={() => setFormulasOpen(true)}
            >
              <BookOpen size={16} />
              Wzory E8
            </TactileButton>
          )}
        </div>
        <progress
          className="study-progress my-3"
          aria-label="Ukończone lekcje działu"
          value={finished}
          max={Math.max(1, chapterLessons.length)}
        />
        <p className="text-sm text-[var(--text-secondary)]">
          {loading && chapterLessons.length === 0
            ? 'Pobieram lekcje i zadania z Firebase…'
            : `Ukończono ${finished} z ${chapterLessons.length} lekcji`}
        </p>
      </header>

      {error && chapterLessons.length === 0 && (
        <div className="study-panel p-4 text-sm text-[var(--danger)]">
          Nie udało się pobrać paczki zadań ({error}). Sprawdź połączenie i odśwież stronę.
        </div>
      )}

      {loading && chapterLessons.length === 0 ? (
        <div className="study-panel flex items-center gap-3 p-5 text-sm text-[var(--text-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-text)]" />
          <span>Ładowanie lekcji działu z Firebase…</span>
        </div>
      ) : (
        <ol aria-label={`Lekcje — ${SUBJECT_NAMES[state.activeSubject]}`} className="learn-route">
          {chapterLessons.map((lesson) => {
            const done = state.completedLessonIds.includes(lesson.id);
            const attempt = getLessonAttempt(state, lesson.id);
            const theoryCard = state.theoryCards?.[lesson.id];
            const theoryIndex = theoryCard
              ? lesson.theory.findIndex((card) => card.id === theoryCard)
              : -1;
            const reviewIds =
              state.lessonReviewTasks?.[lesson.id] ??
              lesson.tasks
                .filter((task) => state.mistakeBank.some((entry) => entry.taskId === task.id))
                .map((task) => task.id);
            const lockedByGuest = !isStarterLesson(lesson.id) && !hasStudentAccount;
            const current = !done && !lockedByGuest && lesson.id === recommendedId;

            return (
              <li
                key={lesson.id}
                className="learn-stop"
                data-state={lockedByGuest ? 'locked' : done ? 'done' : current ? 'current' : 'ready'}
              >
                <span className="learn-marker" aria-hidden="true">
                  {lockedByGuest ? (
                    <Lock size={17} />
                  ) : done ? (
                    <Check size={21} />
                  ) : current ? (
                    <Flag size={19} />
                  ) : (
                    <span className="learn-marker-dot" />
                  )}
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
                      <TactileButton
                        variant="info"
                        size="sm"
                        onClick={() => openLessonTheory(lesson.id)}
                      >
                        <Lock size={15} /> Odblokuj lekcję
                      </TactileButton>
                    </div>
                  ) : (
                    <>
                      {(attempt || theoryIndex >= 0) && (
                        <p className="mt-2 text-xs font-bold text-[var(--text-secondary)]">
                          {theoryIndex >= 0
                            ? 'Karta ' + (theoryIndex + 1) + ' z ' + lesson.theory.length
                            : attempt &&
                              'Zapisano ' +
                                Object.keys(attempt.answers).length +
                                ' z ' +
                                attempt.taskIds.length +
                                ' odpowiedzi'}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {attempt && (
                          <TactileButton size="sm" onClick={() => startLessonTasks(lesson.id)}>
                            <Play size={16} /> Wznów zadania
                          </TactileButton>
                        )}
                        <TactileButton
                          variant={current && !attempt ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => openLessonTheory(lesson.id, done)}
                        >
                          <BookOpen size={16} />{' '}
                          {theoryIndex >= 0
                            ? 'Wznów teorię'
                            : done
                            ? 'Powtórz materiał'
                            : attempt
                            ? 'Przeczytaj teorię'
                            : 'Otwórz lekcję'}
                        </TactileButton>
                        {!attempt && (
                          <TactileButton
                            variant="secondary"
                            size="sm"
                            onClick={() => startLessonTasks(lesson.id)}
                          >
                            <Play size={16} /> {done ? 'Rozwiąż ponownie' : 'Rozwiąż zadania'}
                          </TactileButton>
                        )}
                        {done && reviewIds.length > 0 && (
                          <TactileButton
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              startPracticeSession('bank', 'all', reviewIds, lesson.id)
                            }
                          >
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
      )}

      <section aria-labelledby="all-chapters" className="space-y-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="all-chapters"
            className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]"
          >
            Wszystkie działy ({chapters.length})
          </h2>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Wybierz dział, aby zobaczyć lekcje
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.map((chapter) => {
            const isSelected = chapter.chapterId === activeChapter?.chapterId;
            const chLessons = contentRegistry.getLessonsForChapter(
              state.activeSubject,
              chapter.chapterId
            );
            const chTasks = contentRegistry.getChapterTaskCount(chapter.chapterId);

            return (
              <button
                key={chapter.chapterId}
                type="button"
                onClick={() => {
                  setSelectedChapterId(chapter.chapterId);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`study-panel flex items-start justify-between gap-3 p-4 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent-primary)] bg-[var(--bg-elevated)]'
                    : 'hover:border-[var(--accent-primary)]'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[var(--accent-text)]">
                    Dział {chapter.chapterNumber}
                    {chTasks > 0 ? ` · ${chTasks} zadań` : ''}
                  </p>
                  <h3 className="mt-1 text-base font-extrabold text-[var(--text-primary)]">
                    {chapter.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {chapter.subtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-extrabold text-[var(--text-secondary)]">
                  {chLessons.length > 0 ? `${chLessons.length} lekcji` : '…'}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
