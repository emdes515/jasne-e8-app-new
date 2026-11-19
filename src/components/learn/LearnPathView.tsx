'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Play,
  Star,
  Coins,
  HeartCrack,
  Timer,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  ChapterMeta,
  ChapterNodeMeta,
  MATH_CHAPTERS_MAP,
  MATH_LESSON_1_1,
} from '../../data/mathLessonMock';
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { SubjectComingSoonView } from './SubjectComingSoonView';

export function LearnPathView() {
  const {
    state,
    openLessonTheory,
    startLessonTasks,
    setFormulasOpen,
    setRescueModalOpen,
    setActiveTab,
    playSound,
  } = useAppState();

  const [lockedPreviewModal, setLockedPreviewModal] = useState<{
    title: string;
    subtitle: string;
    previewTopics?: string[];
  } | null>(null);

  const [node1ActionSheetOpen, setNode1ActionSheetOpen] = useState(false);

  // If Polish or English is selected, render dedicated SubjectComingSoonView without "Wzory E8"
  if (state.activeSubject !== 'math') {
    return <SubjectComingSoonView />;
  }

  const isLesson1Completed = state.completedLessonIds.includes(
    MATH_LESSON_1_1.id
  );
  const progressPercent = isLesson1Completed ? Math.round(100 / MATH_CHAPTERS_MAP[0].nodes.length) : 0;

  const handleNodeClick = (node: ChapterNodeMeta) => {
    playSound('tap');
    if (node.unlocked) {
      setNode1ActionSheetOpen(true);
    } else {
      setLockedPreviewModal({
        title: `Lekcja ${node.nodeNumber}: ${node.title}`,
        subtitle: node.subtitle,
        previewTopics: node.previewTopics,
      });
    }
  };

  const handleLockedChapterClick = (ch: ChapterMeta) => {
    playSound('tap');
    setLockedPreviewModal({
      title: `Dział ${ch.chapterNumber}: ${ch.title}`,
      subtitle: ch.subtitle,
    });
  };

  return (
    <>
      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial={false}
        animate="visible"
        className="space-y-6"
      >
        {/* Top Chapter Banner with Progress & "Wzory E8" Button */}
        <motion.section
          variants={STAGGER_ITEM_VARIANTS}
          aria-label="Nagłówek ścieżki Matematyka E8"
          className="study-panel p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold font-display text-[var(--accent-text)] mb-1 tabular-nums">
                Dział 1 z 7 · {progressPercent}%
              </div>
              <h1 className="page-heading">
                Liczby, potęgi i pierwiastki
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Przećwicz działania na potęgach i wyłączanie czynnika przed pierwiastek.
              </p>
            </div>

            <div className="shrink-0 sm:hidden">
              <TactileButton
                variant="secondary"
                size="md"
                onClick={() => {
                  playSound('tap');
                  setFormulasOpen(true);
                }}
              >
                <BookOpen className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Wzory E8</span>
              </TactileButton>
            </div>
          </div>
        </motion.section>

        {/* Active Chapter 1 Zig-Zag Gaming Node Path */}
        <motion.section
          variants={STAGGER_ITEM_VARIANTS}
          aria-label="Mapa węzłów Działu 1"
          className="study-panel p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="max-w-lg mx-auto relative flex flex-col items-center space-y-8">
            {MATH_CHAPTERS_MAP[0].nodes.map((node, idx) => {
              const offsetClass =
                idx === 0
                  ? 'self-center sm:self-start sm:ml-6'
                  : idx === 1
                  ? 'self-center sm:self-end sm:mr-6'
                  : 'self-center';

              return (
                <div
                  key={node.id}
                  className={`relative w-full max-w-sm ${offsetClass}`}
                >
                  {/* Connector line to next node */}
                  {idx < MATH_CHAPTERS_MAP[0].nodes.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="hidden sm:block absolute left-1/2 -bottom-9 w-1 h-9 bg-[var(--border-subtle)] -translate-x-1/2"
                    />
                  )}

                  {node.unlocked ? (
                    <div className="relative p-5 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--accent-primary)] shadow-[0_6px_0_0_var(--accent-primary-edge)]">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center font-extrabold font-display text-base shrink-0">
                            {node.nodeNumber}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[var(--accent-text)] flex items-center gap-1.5">
                              {isLesson1Completed ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                  <span className="text-[var(--success)]">
                                    Ukończono
                                  </span>
                                </>
                              ) : (
                                <span>Gotowa do rozpoczęcia</span>
                              )}
                            </div>
                            <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                              {node.title}
                            </h2>
                          </div>
                        </div>

                        {/* Lumi standing right next to active node 1.1 */}
                        <LumiMascot
                          mood={isLesson1Completed ? 'celebrate' : 'happy'}
                          loadout={state.loadout}
                          size="xs"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-4">
                        <span>Teoria i 5 zadań</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[var(--accent-text)] tabular-nums">
                          <Coins className="w-3.5 h-3.5" />
                          <span>+{node.rewardCoins} monet</span>
                        </span>
                      </div>

                      {/* Stars row */}
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-4 h-4 ${
                              isLesson1Completed
                                ? 'text-[var(--accent-primary)] fill-[var(--accent-primary)]'
                                : 'text-[var(--text-secondary)]/40'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-[var(--text-secondary)] ml-1.5">
                          {isLesson1Completed
                            ? '3/3 Gwiazdki opanowania'
                            : 'Zdobądź 3 gwiazdki za ukończenie'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <TactileButton
                          variant="primary"
                          size="md"
                          fullWidth
                          onClick={openLessonTheory}
                        >
                          <Play className="w-4 h-4" />
                          <span>
                            {isLesson1Completed
                              ? 'Otwórz lekcję 1.1'
                              : 'Otwórz lekcję'}
                          </span>
                        </TactileButton>
                        <TactileButton
                          variant="secondary"
                          size="md"
                          onClick={() => handleNodeClick(node)}
                        >
                          Opcje
                        </TactileButton>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNodeClick(node)}
                      className="w-full text-left p-4 rounded-3xl bg-[var(--bg-canvas)]/60 border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)] hover:border-[var(--text-secondary)] transition-all flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-extrabold font-display text-sm text-[var(--text-secondary)] shrink-0">
                          {node.nodeNumber}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--text-secondary)]">
                            W przygotowaniu
                          </div>
                          <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                            {node.title}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Zobacz zakres
                          </p>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Subsequent Chapters 2 - 7 ("W przygotowaniu") */}
        <motion.section
          variants={STAGGER_ITEM_VARIANTS}
          aria-label="Kolejne działy Matematyki E8"
          className="space-y-3"
        >
          <h2 className="text-sm font-extrabold font-display text-[var(--text-secondary)] px-1">
            Kolejne działy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MATH_CHAPTERS_MAP.slice(1).map((ch) => (
              <button
                key={ch.chapterNumber}
                type="button"
                onClick={() => handleLockedChapterClick(ch)}
                className="text-left p-4 study-panel hover:border-[var(--text-secondary)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-extrabold font-display text-sm text-[var(--text-secondary)] shrink-0 tabular-nums">
                    0{ch.chapterNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                      Dział {ch.chapterNumber} · W przygotowaniu
                    </div>
                    <h3 className="text-sm font-extrabold font-display text-[var(--text-primary)] truncate">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {ch.subtitle}
                    </p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </button>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Node 1.1 Options Sheet (respects AC-H2 & AC-H3 when hearts === 0) */}
      <BottomSheet
        open={node1ActionSheetOpen}
        onClose={() => setNode1ActionSheetOpen(false)}
        title={`Lekcja ${MATH_LESSON_1_1.nodeNumber}: ${MATH_LESSON_1_1.title}`}
        subtitle="Teoria jest dostępna także bez serc."
      >
        <div className="space-y-4">
          {state.hearts <= 0 && (
            <div className="p-4 rounded-2xl bg-[var(--danger)]/15 border-2 border-[var(--danger)] flex items-start gap-3">
              <HeartCrack className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-extrabold font-display text-[var(--text-primary)]">
                  Masz 0/5 serc — start zadań jest zablokowany
                </div>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  Możesz swobodnie przeglądać <strong>teorię</strong> i{' '}
                  <strong>Wzory E8</strong>, albo odzyskać serce za darmo w
                  Misji Ratunkowej!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            <TactileButton
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => {
                setNode1ActionSheetOpen(false);
                openLessonTheory();
              }}
            >
              <BookOpen className="w-5 h-5 text-[var(--accent-text)]" />
              <span>Otwórz teorię</span>
            </TactileButton>

            <TactileButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={state.hearts <= 0}
              onClick={() => {
                setNode1ActionSheetOpen(false);
                startLessonTasks();
              }}
            >
              <Play className="w-5 h-5" />
              <span>
                {state.hearts <= 0
                  ? 'Przejdź do zadań (Wymaga ≥ 1 serca)'
                  : 'Rozpocznij 5 zadań lekcji'}
              </span>
            </TactileButton>

            {state.hearts <= 0 && (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <TactileButton
                  variant="info"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setNode1ActionSheetOpen(false);
                    setRescueModalOpen(true);
                  }}
                >
                  Misja Ratunkowa
                </TactileButton>
                <TactileButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setNode1ActionSheetOpen(false);
                    setActiveTab('profile');
                  }}
                >
                  Sklep (80 monet)
                </TactileButton>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Locked Node / Chapter Popover Modal (Never uses window.alert! AC-G5) */}
      <BottomSheet
        open={Boolean(lockedPreviewModal)}
        onClose={() => setLockedPreviewModal(null)}
        title={lockedPreviewModal?.title ?? 'Moduł w przygotowaniu'}
        subtitle="Lekcja w przygotowaniu."
      >
        {lockedPreviewModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)]">
              <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                Ten dział jest w przygotowaniu do kolejnej aktualizacji — na
                razie przetestuj pełną mechanikę w{' '}
                <strong className="text-[var(--accent-text)]">
                  Dziale 1 (Lekcja 1.1: Potęgi i pierwiastki)
                </strong>{' '}
                lub w{' '}
                <strong className="text-[var(--accent-text)]">
                  Mini-Arkuszu E8
                </strong>
                !
              </p>

              {lockedPreviewModal.previewTopics &&
                lockedPreviewModal.previewTopics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="text-xs font-extrabold font-display text-[var(--text-secondary)] mb-1.5">
                      Co znajdziesz w tej lekcji w Fazie 2:
                    </div>
                    <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside">
                      {lockedPreviewModal.previewTopics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <TactileButton
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  setLockedPreviewModal(null);
                  openLessonTheory();
                }}
              >
                <Play className="w-4 h-4" />
                <span>Zagraj Lekcję 1.1</span>
              </TactileButton>
              <TactileButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => {
                  setLockedPreviewModal(null);
                  setActiveTab('exam');
                }}
              >
                <Timer className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Mini-Arkusz E8</span>
              </TactileButton>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
