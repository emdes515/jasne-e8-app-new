'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Info, Search, Sparkles, X } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { findMathLesson } from '../../data/mathLessonMock';
import {
  MATH_FORMULAS_CATALOG,
  resolveFormulaCategoryForContext,
} from '../../data/mathFormulas';
import { SPRING_SNAPPY } from '../../lib/motionPresets';
import { BottomSheet } from '../ui/BottomSheet';
import { MathText } from '../ui/MathText';

export function FormulasBottomSheet() {
  const { state, formulasOpen } = useAppState();

  // Strict guard: only Math has Formulas E8 (AC-G4); mounted content resets cleanly per open.
  if (state.activeSubject !== 'math' || !formulasOpen) {
    return null;
  }

  return <FormulasBottomSheetContent />;
}

function FormulasBottomSheetContent() {
  const {
    state,
    selectedLessonId,
    lessonViewStage,
    formulasOpen,
    setFormulasOpen,
    playSound,
  } = useAppState();

  // Detect active study context (current task topicTag -> active session -> active lesson)
  const detectedContext = useMemo(() => {
    const session = state.activeSession;
    const activeTaskId =
      lessonViewStage === 'tasks' && session
        ? session.taskIds[session.currentIndex]
        : undefined;
    const activeTask = activeTaskId ? ALL_TASKS_BY_ID[activeTaskId] : undefined;
    const activeLesson =
      lessonViewStage !== 'none' && selectedLessonId
        ? findMathLesson(selectedLessonId)
        : undefined;

    const combinedText = [
      activeTask?.topicTag,
      lessonViewStage !== 'none' ? session?.title : null,
      activeLesson?.title,
      activeLesson?.id,
    ]
      .filter(Boolean)
      .join(' ');

    const matchedCategoryId = resolveFormulaCategoryForContext(combinedText);
    const contextLabel =
      activeTask?.topicTag ||
      activeLesson?.title ||
      (lessonViewStage !== 'none' ? session?.title : null) ||
      null;

    return { matchedCategoryId, contextLabel };
  }, [state.activeSession, selectedLessonId, lessonViewStage]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    () => detectedContext.matchedCategoryId ?? 'all'
  );
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    const baseGroups =
      activeCategoryId === 'all' || normalizedQuery.length > 0
        ? MATH_FORMULAS_CATALOG
        : MATH_FORMULAS_CATALOG.filter((c) => c.id === activeCategoryId);

    if (!normalizedQuery) return baseGroups;

    return baseGroups
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.whenToUse.toLowerCase().includes(normalizedQuery) ||
            cat.label.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [activeCategoryId, normalizedQuery]);

  const tabs = [
    ...(detectedContext.matchedCategoryId
      ? MATH_FORMULAS_CATALOG.filter((c) => c.id === detectedContext.matchedCategoryId)
      : []),
    { id: 'all', label: 'Wszystkie' },
    ...MATH_FORMULAS_CATALOG.filter((c) => c.id !== detectedContext.matchedCategoryId),
  ];

  return (
    <BottomSheet
      open={formulasOpen}
      onClose={() => setFormulasOpen(false)}
      title="Przydatne Wzory E8 — Matematyka"
      subtitle={
        detectedContext.contextLabel
          ? `Kontekst: ${detectedContext.contextLabel}`
          : 'Karta szybkiego dostępu podczas nauki i powtórek.'
      }
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Context match pill when opened inside a specific lesson/task */}
        {detectedContext.matchedCategoryId && activeCategoryId === detectedContext.matchedCategoryId && !normalizedQuery && (
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--accent-primary)]/12 border border-[var(--accent-primary)]/40 px-3.5 py-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-extrabold font-display text-[var(--accent-text)]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Dopasowano do bieżącego działu</span>
            </span>
            <button
              type="button"
              onClick={() => {
                playSound('tabSwitch');
                setActiveCategoryId('all');
              }}
              className="font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer shrink-0"
            >
              Pokaż wszystkie
            </button>
          </div>
        )}

        {/* Quick Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj wzoru (np. Pitagoras, procent, ułamek)…"
            className="w-full min-h-[42px] pl-10 pr-9 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
          />
          {query && (
            <button
              type="button"
              aria-label="Wyczyść wyszukiwanie"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Kategorie wzorów matematycznych"
          className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
        >
          {tabs.map((cat) => {
            const isSelected = !normalizedQuery && cat.id === activeCategoryId;
            const isMatched = cat.id === detectedContext.matchedCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playSound('tabSwitch');
                  setQuery('');
                  setActiveCategoryId(cat.id);
                }}
                className="relative min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold font-display cursor-pointer select-none flex items-center gap-1.5"
              >
                {isSelected && (
                  <motion.span
                    layoutId="formulas-category-capsule"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
                  />
                )}
                <span
                  className={`relative z-10 whitespace-nowrap ${
                    isSelected
                      ? 'text-[var(--on-accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat.label}
                </span>
                {isMatched && (
                  <span
                    className={`relative z-10 inline-block w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[var(--on-accent)]' : 'bg-[var(--accent-primary)]'
                    }`}
                    title="Bieżący dział"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Formula Cards */}
        {visibleGroups.length === 0 ? (
          <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-secondary)]">
            Brak wzorów pasujących do „{query}”. Spróbuj wpisać np. „potęgi” lub „trójkąt”.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleGroups.map((group) => (
              <div key={group.id} className="space-y-2.5">
                {(activeCategoryId === 'all' || normalizedQuery.length > 0) && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider font-display text-[var(--accent-text)]">
                      {group.label}
                    </span>
                    <span className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                )}

                {group.items.map((item, idx) => (
                  <div
                    key={`${group.id}-${idx}`}
                    className="rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] overflow-hidden"
                  >
                    <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                      <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)] leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* High-contrast KaTeX showcase */}
                    <div className="mx-3.5 mb-3 px-3.5 py-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] border-l-4 border-l-[var(--accent-primary)] text-center overflow-x-auto">
                      <MathText text={item.latex} block />
                    </div>

                    <div className="px-4 pb-3.5 text-xs text-[var(--text-secondary)] space-y-1.5">
                      <p className="leading-relaxed">
                        <strong className="text-[var(--accent-text)]">Kiedy użyć:</strong>{' '}
                        {item.whenToUse}
                      </p>
                      <div className="rounded-xl bg-[var(--bg-surface)]/80 border border-[var(--border-subtle)] px-3 py-2 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-[var(--info)] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-[var(--text-primary)]">Przykład:</strong>{' '}
                          <MathText text={item.example} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
