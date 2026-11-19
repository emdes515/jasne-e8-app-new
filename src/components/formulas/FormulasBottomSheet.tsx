'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Info } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { MATH_FORMULAS_CATALOG } from '../../data/mathFormulas';
import { SPRING_SNAPPY } from '../../lib/motionPresets';
import { BottomSheet } from '../ui/BottomSheet';
import { MathText } from '../ui/MathText';

export function FormulasBottomSheet() {
  const { state, formulasOpen, setFormulasOpen, playSound } = useAppState();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    MATH_FORMULAS_CATALOG[0].id
  );

  // Strict guard: only Math has Formulas E8 (AC-G4)
  if (state.activeSubject !== 'math') {
    return null;
  }

  const activeCategory =
    MATH_FORMULAS_CATALOG.find((c) => c.id === activeCategoryId) ??
    MATH_FORMULAS_CATALOG[0];

  return (
    <BottomSheet
      open={formulasOpen}
      onClose={() => setFormulasOpen(false)}
      title="Przydatne Wzory E8 — Matematyka"
      subtitle="Podręczna ściąga do lekcji i sesji powtórkowych (przeciągnij w dół, aby zamknąć)"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Category Switcher Tabs with Shared layoutId Capsule */}
        <div
          role="tablist"
          aria-label="Kategorie wzorów matematycznych"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
        >
          {MATH_FORMULAS_CATALOG.map((cat) => {
            const isSelected = cat.id === activeCategory.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playSound('tabSwitch');
                  setActiveCategoryId(cat.id);
                }}
                className="relative min-h-[42px] px-2.5 py-1.5 rounded-xl text-xs font-extrabold font-display text-center cursor-pointer select-none flex items-center justify-center"
              >
                {isSelected && (
                  <motion.span
                    layoutId="formulas-category-capsule"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
                  />
                )}
                <span
                  className={`relative z-10 leading-tight ${
                    isSelected
                      ? 'text-[var(--on-accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Formula Items */}
        <div className="space-y-3">
          {activeCategory.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                  {item.title}
                </h3>
              </div>

              {/* KaTeX Casseton */}
              <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-center overflow-x-auto">
                <MathText text={item.latex} block />
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p>
                  <strong className="text-[var(--accent-text)]">
                    Kiedy użyć?
                  </strong>{' '}
                  {item.whenToUse}
                </p>
                <p className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[var(--info)] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--text-primary)]">
                      Przykład:
                    </strong>{' '}
                    <MathText text={item.example} />
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
