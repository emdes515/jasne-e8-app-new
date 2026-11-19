'use client';

import { useState } from 'react';
import { BookOpen, Check, ChevronRight, Lock, Play, Timer } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getLessonAttempt, MATH_CHAPTERS_MAP, MATH_LESSONS, type ChapterMeta } from '../../data/mathLessonMock';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { SubjectComingSoonView } from './SubjectComingSoonView';

export function LearnPathView() {
  const { state, openLessonTheory, startLessonTasks, setFormulasOpen, setActiveTab } = useAppState();
  const [previewChapter, setPreviewChapter] = useState<ChapterMeta | null>(null);

  if (state.activeSubject !== 'math') return <SubjectComingSoonView />;

  const finished = MATH_LESSONS.filter((lesson) => state.completedLessonIds.includes(lesson.id)).length;

  return (
    <div className="space-y-7">
      <header className="study-panel p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold text-[var(--accent-text)]">Dział 1 z 7</p>
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

      <ol aria-label="Lekcje z matematyki" className="relative space-y-4 before:absolute before:inset-y-10 before:left-[1.2rem] before:w-0.5 before:bg-[var(--border-subtle)] sm:space-y-5">
        {MATH_LESSONS.map((lesson) => {
          const done = state.completedLessonIds.includes(lesson.id);
          const attempt = getLessonAttempt(state, lesson.id);
          return (
            <li key={lesson.id} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 sm:gap-5">
              <span className={`mt-4 grid size-10 place-items-center rounded-xl border font-bold tabular-nums ${done ? 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]' : 'border-[var(--accent-primary-edge)] bg-[var(--accent-primary)] text-[var(--on-accent)]'}`} aria-label={done ? `Lekcja ${lesson.nodeNumber}, ukończona` : `Lekcja ${lesson.nodeNumber}`}>
                {done ? <Check size={19} /> : lesson.nodeNumber}
              </span>
              <article className="study-panel p-4 sm:p-5">
                <h2 className="text-base font-extrabold text-pretty sm:text-xl">{lesson.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{lesson.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {attempt && state.hearts > 0 && (
                    <TactileButton size="sm" onClick={() => startLessonTasks(lesson.id)}>
                      <Play size={16} /> Wznów zadania
                    </TactileButton>
                  )}
                  <TactileButton variant={attempt && state.hearts > 0 ? 'secondary' : 'primary'} size="sm" onClick={() => openLessonTheory(lesson.id)}>
                    <BookOpen size={16} /> {attempt || done ? 'Otwórz teorię' : 'Otwórz lekcję'}
                  </TactileButton>
                </div>
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
    </div>
  );
}
