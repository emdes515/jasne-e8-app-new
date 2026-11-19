'use client';

import { useState } from 'react';
import { BookOpen, Check, ChevronRight, Lock, Flag, Play, RotateCcw, Timer } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLessonAttempt, getRecommendedMathLesson, MATH_CHAPTERS_MAP, MATH_LESSONS, type ChapterMeta } from '../../data/mathLessonMock';
import { CloudAccountModal, useCloudAuthUser } from '../auth/CloudAccountModal';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { SubjectComingSoonView } from './SubjectComingSoonView';

export function LearnPathView() {
  const { state, openLessonTheory, startLessonTasks, startPracticeSession, setFormulasOpen, setActiveTab } = useAppState();
  const [previewChapter, setPreviewChapter] = useState<ChapterMeta | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user: cloudUser } = useCloudAuthUser();

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
          const lockedByGuest = lessonIdx > 0 && !cloudUser;
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
                    ? ' · Odblokuj za darmo po zalogowaniu'
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
                    <TactileButton variant="info" size="sm" onClick={() => setLoginModalOpen(true)}>
                      <Lock size={15} /> Odblokuj za darmo (Zaloguj)
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

      <section aria-labelledby="coming-chapters" className="space-y-3">
        <h2 id="coming-chapters" className="text-lg font-extrabold">Kolejne działy</h2>
        <div className="study-panel divide-y divide-[var(--border-subtle)]">
          {MATH_CHAPTERS_MAP.slice(1).map((chapter) => (
            <button key={chapter.chapterNumber} type="button" className="study-link" onClick={() => setPreviewChapter(chapter)}>
              <Lock size={16} aria-hidden="true" />
              <span>{chapter.title}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <BottomSheet
        open={previewChapter !== null}
        onClose={() => setPreviewChapter(null)}
        title={previewChapter?.title ?? 'Kolejny dział'}
        subtitle="Dział w przygotowaniu."
      >
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{previewChapter?.subtitle}</p>
        <TactileButton variant="secondary" onClick={() => setActiveTab('exam')}>
          <Timer size={16} /> Przejdź do miniarkusza
        </TactileButton>
      </BottomSheet>

      <CloudAccountModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        titleOverride="Odblokuj wszystkie lekcje za darmo"
        subtitleOverride="Pierwsza lekcja jest otwarta dla Gościa. Zaloguj się za darmo, aby odblokować kolejne lekcje."
      />
    </div>
  );
}
