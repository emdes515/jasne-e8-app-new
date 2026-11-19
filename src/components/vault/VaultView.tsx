'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  ShieldAlert,
  Play,
  Trash2,
  Star,
  Heart,
  BookOpen,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { SubjectId } from '../../types/domain';
import { MAX_FREE_RESCUE_PER_DAY, MAX_HEARTS } from '../../lib/gamification';
import {
  SPRING_SNAPPY,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { SUBJECT_META } from '../layout/SubjectSwitcher';
import { LumiMascot } from '../mascot/LumiMascot';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';

export function VaultView() {
  const {
    state,
    startPracticeSession,
    removeSavedTask,
    setRescueModalOpen,
    openLessonTheory,
    setActiveTab,
    playSound,
  } = useAppState();

  const [vaultTab, setVaultTab] = useState<'saved' | 'bank'>('saved');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');

  const filteredSaved = [...state.savedTasks]
    .sort((a, b) => b.savedAt - a.savedAt)
    .filter(
      (entry) =>
        subjectFilter === 'all' || entry.subjectId === subjectFilter
    );

  const filteredBank = [...state.mistakeBank]
    .sort((a, b) => b.lastMistakeAt - a.lastMistakeAt)
    .filter(
      (entry) =>
        subjectFilter === 'all' || entry.subjectId === subjectFilter
    );

  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial={false}
      animate="visible"
      className="space-y-5"
    >
      {/* Top 2-state Switcher with Shared layoutId Capsule: Zapisane (N) | Bank błędów (M) */}
      <motion.section
        variants={STAGGER_ITEM_VARIANTS}
        className="study-panel p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="page-heading">
              Powtórki
            </h1>
          </div>

          {state.hearts < MAX_HEARTS && (
            <TactileButton
              variant="info"
              size="sm"
              onClick={() => setRescueModalOpen(true)}
            >
              <Heart className="w-4 h-4" />
              <span>
                Misja ratunkowa ({state.rescueMissionCurrentProgress}/2 · dziś{' '}
                {state.rescueMissionsCompletedToday}/{MAX_FREE_RESCUE_PER_DAY})
              </span>
            </TactileButton>
          )}
        </div>

        {/* Segmented Control */}
        <div
          role="tablist"
          aria-label="Tryb powtórek"
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border-2 border-[var(--border-subtle)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={vaultTab === 'saved'}
            onClick={() => {
              playSound('tabSwitch');
              setVaultTab('saved');
            }}
            className="relative min-h-[46px] px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer select-none"
          >
            {vaultTab === 'saved' && (
              <motion.span
                layoutId="vault-main-capsule"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
              />
            )}
            <Bookmark
              className={`relative z-10 w-4 h-4 ${
                vaultTab === 'saved'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--accent-text)]'
              }`}
            />
            <span
              className={`relative z-10 tabular-nums ${
                vaultTab === 'saved'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Zapisane ({state.savedTasks.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={vaultTab === 'bank'}
            onClick={() => {
              playSound('tabSwitch');
              setVaultTab('bank');
            }}
            className="relative min-h-[46px] px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer select-none"
          >
            {vaultTab === 'bank' && (
              <motion.span
                layoutId="vault-main-capsule"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
              />
            )}
            <ShieldAlert
              className={`relative z-10 w-4 h-4 ${
                vaultTab === 'bank'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--danger)]'
              }`}
            />
            <span
              className={`relative z-10 tabular-nums ${
                vaultTab === 'bank'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Bank błędów ({state.mistakeBank.length})
            </span>
          </button>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'Wszystkie' },
              { id: 'math', label: 'Matematyka' },
              { id: 'polish', label: 'Polski' },
              { id: 'english', label: 'Angielski' },
            ] as const
          ).map((f) => {
            const active = subjectFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playSound('tap');
                  setSubjectFilter(f.id);
                }}
                className={`min-h-[38px] px-3.5 rounded-xl border text-xs font-extrabold font-display transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] text-[var(--accent-text)]'
                    : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Tab 1: Saved Tasks View */}
      {vaultTab === 'saved' && (
        <motion.section
          variants={STAGGER_ITEM_VARIANTS}
          className="space-y-4"
        >
          {filteredSaved.length > 0 ? (
            <>
              <div className="p-4 study-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                    Trening z zapisanych zadań
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Uruchamia sesję wyłącznie z unikalnych zapisanych zadań (50%
                    bazowego XP).
                  </p>
                </div>
                <TactileButton
                  variant="primary"
                  size="md"
                  onClick={() =>
                    startPracticeSession('saved', subjectFilter)
                  }
                >
                  <Play className="w-4 h-4" />
                  <span>Rozwiąż zapisane ({filteredSaved.length})</span>
                </TactileButton>
              </div>

              <div className="space-y-3">
                {filteredSaved.map((entry) => {
                  const task = ALL_TASKS_BY_ID[entry.taskId];
                  if (!task) return null;
                  const subMeta = SUBJECT_META[entry.subjectId];

                  return (
                    <div
                      key={entry.key}
                      className="p-4 study-panel flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-[var(--text-secondary)]">
                          <span className="text-[var(--accent-text)]">
                            {subMeta.name}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{task.topicTag}</span>
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                          <MathText text={task.prompt} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSavedTask(entry.key)}
                        aria-label={`Usuń zakładkę zadania ${task.topicTag}`}
                        className="min-w-[44px] min-h-[44px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="study-panel p-8 text-center space-y-4">
              <div className="flex justify-center">
                <LumiMascot
                  mood="supportive"
                  loadout={state.loadout}
                  size="md"
                />
              </div>
              <div>
                <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
                  Nic tu jeszcze nie ma
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                  Podczas rozwiązywania lekcji lub Mini-Arkusza kliknij przycisk
                  „Zapisz do powtórki”, aby przypiąć trudniejsze zadania!
                </p>
              </div>
              <TactileButton
                variant="primary"
                size="md"
                onClick={() => {
                  setActiveTab('learn');
                  openLessonTheory();
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span>Zapisz pierwsze zadanie w lekcji</span>
              </TactileButton>
            </div>
          )}
        </motion.section>
      )}

      {/* Tab 2: Mistake Bank View */}
      {vaultTab === 'bank' && (
        <motion.section
          variants={STAGGER_ITEM_VARIANTS}
          className="space-y-4"
        >
          {filteredBank.length > 0 ? (
            <>
              <div className="p-4 study-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                    Opanuj swoje błędy (2 poprawne z rzędu = usunięcie z Banku!)
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Błąd w trakcie powtórki zeruje licznik opanowania danego
                    zadania do 0/2.
                  </p>
                </div>
                <TactileButton
                  variant="primary"
                  size="md"
                  onClick={() => startPracticeSession('bank', subjectFilter)}
                >
                  <Play className="w-4 h-4" />
                  <span>Wyczyść błędy ({filteredBank.length})</span>
                </TactileButton>
              </div>

              <div className="space-y-3">
                {filteredBank.map((entry) => {
                  const task = ALL_TASKS_BY_ID[entry.taskId];
                  if (!task) return null;
                  const subMeta = SUBJECT_META[entry.subjectId];

                  return (
                    <div
                      key={entry.key}
                      className="p-4 study-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-[var(--text-secondary)]">
                          <span className="text-[var(--danger)]">
                            {subMeta.name}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{task.topicTag}</span>
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                          <MathText text={task.prompt} />
                        </div>
                      </div>

                      {/* Visual mastery counter: 2 stars/dots correctStreak (0/2 -> 1/2 -> Mastered!) */}
                      <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] self-start sm:self-center">
                        <div className="flex items-center gap-1">
                          {[1, 2].map((step) => (
                            <Star
                              key={step}
                              className={`w-4 h-4 ${
                                entry.correctStreak >= step
                                  ? 'text-[var(--success)] fill-[var(--success)]'
                                  : 'text-[var(--text-secondary)]/35'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-extrabold font-display tabular-nums text-[var(--text-primary)]">
                          {entry.correctStreak}/2
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="study-panel p-8 text-center space-y-4">
              <div className="flex justify-center">
                <LumiMascot
                  mood="celebrate"
                  loadout={state.loadout}
                  size="md"
                />
              </div>
              <div>
                <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
                  Bank błędów jest czysty!
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                  Nie masz żadnych zaległych błędów. Każde potknięcie w lekcji
                  lub Mini-Arkuszu trafi tutaj automatycznie, żebyś mógł je
                  spokojnie przećwiczyć.
                </p>
              </div>
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}
