'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Lightbulb,
  BookOpen,
  ListOrdered,
  ShieldAlert,
  Play,
  X,
  HeartCrack,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { BentoTheoryCard, LessonDefinition } from '../../types/domain';
import { SPRING_SNAPPY } from '../../lib/motionPresets';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';

interface BentoTheoryTabsProps {
  lesson: LessonDefinition;
  onClose: () => void;
  onStartTasks: () => void;
}

const TAB_CONFIG: Array<{
  id: BentoTheoryCard['id'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'essence', label: 'Esencja', icon: Lightbulb },
  { id: 'formulas', label: 'Reguły', icon: BookOpen },
  { id: 'example', label: 'Przykład', icon: ListOrdered },
  { id: 'trap', label: 'Pułapka E8', icon: ShieldAlert },
];

export function BentoTheoryTabs({
  lesson,
  onClose,
  onStartTasks,
}: BentoTheoryTabsProps) {
  const {
    state,
    setFormulasOpen,
    setRescueModalOpen,
    setActiveTab,
    playSound,
  } = useAppState();

  const [activeCardId, setActiveCardId] =
    useState<BentoTheoryCard['id']>('essence');

  const currentCard =
    lesson.theory.find((c) => c.id === activeCardId) ?? lesson.theory[0];

  const isZeroHearts = state.hearts <= 0;

  return (
    <div className="space-y-5 pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 p-4 study-panel">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Wróć z lekcji"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-extrabold font-display text-[var(--accent-text)]">
              Lekcja {lesson.nodeNumber}
            </div>
            <h1 className="text-base sm:text-lg font-extrabold font-display text-[var(--text-primary)] [overflow-wrap:anywhere]">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* "Wzory E8" strictly only when activeSubject === 'math' */}
        {state.activeSubject === 'math' && (
          <TactileButton
            variant="secondary"
            size="sm"
            className="sm:hidden"
            onClick={() => {
              playSound('tap');
              setFormulasOpen(true);
            }}
          >
            <BookOpen className="w-4 h-4 text-[var(--accent-text)]" />
            <span>Wzory E8</span>
          </TactileButton>
        )}
      </div>

      {/* 4 Pill Tabs with Shared layoutId Capsule */}
      <div
        role="tablist"
        aria-label="Karty teorii"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)]"
      >
        {TAB_CONFIG.map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeCardId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                playSound('tabSwitch');
                setActiveCardId(tab.id);
              }}
              className="relative min-h-[46px] px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer select-none"
            >
              {isSelected && (
                <motion.span
                  layoutId="bento-theory-capsule"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
                />
              )}
              <IconComp
                className={`relative z-10 w-4 h-4 shrink-0 ${
                  isSelected
                    ? 'text-[var(--on-accent)]'
                    : 'text-[var(--accent-text)]'
                }`}
              />
              <span
                className={`relative z-10 whitespace-nowrap ${
                  isSelected
                    ? 'text-[var(--on-accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Bento Card Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="study-panel p-5 sm:p-6 space-y-4"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold font-display text-[var(--text-primary)]">
              <MathText text={currentCard.title} />
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              <MathText text={currentCard.subtitle} />
            </p>
          </div>

          {/* 1. Essence Bullets */}
          {currentCard.bullets && (
            <div className="space-y-3">
              {currentCard.bullets.map((b, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-start gap-3 text-sm sm:text-base text-[var(--text-primary)]"
                >
                  <span className="w-6 h-6 rounded-lg bg-[var(--accent-primary)] text-[var(--on-accent)] font-extrabold font-display text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="leading-relaxed">
                    <MathText text={b} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Formulas Cassetons */}
          {currentCard.formulas && (
            <div className="space-y-3">
              {currentCard.formulas.map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] space-y-2"
                >
                  <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                    {f.name}
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-center">
                    <MathText text={f.latex} block />
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <strong className="text-[var(--accent-text)]">
                      Kiedy użyć:
                    </strong>{' '}
                    <MathText text={f.whenToUse} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Example 3 Steps */}
          {currentCard.steps && (
            <div className="space-y-3">
              {currentCard.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] text-[var(--on-accent)] font-extrabold font-display text-sm flex items-center justify-center shrink-0 tabular-nums">
                    {st.stepNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                      {st.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                      <MathText text={st.content} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Trap E8 (ŹLE vs DOBRZE) */}
          {currentCard.trap && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* WRONG */}
              <div className="p-4 rounded-2xl bg-[var(--danger)]/10 border-2 border-[var(--danger)] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-extrabold font-display text-[var(--danger)]">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{currentCard.trap.wrongTitle}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-center">
                  <MathText text={currentCard.trap.wrongMath} block />
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {currentCard.trap.wrongNote}
                </p>
              </div>

              {/* RIGHT */}
              <div className="p-4 rounded-2xl bg-[var(--success)]/10 border-2 border-[var(--success)] space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-extrabold font-display text-[var(--success)]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{currentCard.trap.rightTitle}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-center">
                  <MathText text={currentCard.trap.rightMath} block />
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {currentCard.trap.rightNote}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Sticky Action Area (Respects AC-H2 & AC-H3 when 0 hearts!) */}
      <div className="p-4 study-panel space-y-3">
        {isZeroHearts && (
          <div className="p-3.5 rounded-2xl bg-[var(--danger)]/15 border border-[var(--danger)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <HeartCrack className="w-5 h-5 text-[var(--danger)] shrink-0" />
              <span className="font-bold text-[var(--text-primary)]">
                Masz 0 serc — odzyskaj serce, żeby rozwiązywać zadania
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <TactileButton
                variant="info"
                size="sm"
                onClick={() => setRescueModalOpen(true)}
              >
                Misja Ratunkowa
              </TactileButton>
              <TactileButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  setActiveTab('profile');
                }}
              >
                Sklep (80 monet)
              </TactileButton>
            </div>
          </div>
        )}

        <TactileButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={isZeroHearts}
          onClick={onStartTasks}
        >
          <Play className="w-5 h-5" />
          <span>Przejdź do zadań (5 zadań)</span>
        </TactileButton>
      </div>
    </div>
  );
}
