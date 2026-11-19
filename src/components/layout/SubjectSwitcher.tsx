'use client';

import React, { useState } from 'react';
import { Calculator, BookType, Globe, ChevronDown, Check } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { SubjectId } from '../../types/domain';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

export const SUBJECT_META: Record<
  SubjectId,
  {
    id: SubjectId;
    name: string;
    shortName: string; // below 380px: Mat., Pol., Ang.
    mediumName: string;
    accentColor: string;
    statusLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  math: {
    id: 'math',
    name: 'Matematyka E8',
    shortName: 'Mat.',
    mediumName: 'Matma',
    accentColor: '#FFB800',
    statusLabel: 'Pełny prototyp Fazy 1',
    icon: Calculator,
  },
  polish: {
    id: 'polish',
    name: 'Język Polski E8',
    shortName: 'Pol.',
    mediumName: 'Polski',
    accentColor: '#F43F5E',
    statusLabel: 'Podgląd — Wkrótce (Faza 2)',
    icon: BookType,
  },
  english: {
    id: 'english',
    name: 'Język Angielski E8',
    shortName: 'Ang.',
    mediumName: 'Angielski',
    accentColor: '#10B981',
    statusLabel: 'Podgląd — Wkrótce (Faza 2)',
    icon: Globe,
  },
};

export function SubjectSwitcher() {
  const {
    state,
    setSubject,
    lessonViewStage,
    abortActiveSession,
    playSound,
  } = useAppState();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingSubject, setPendingSubject] = useState<SubjectId | null>(null);

  const currentMeta = SUBJECT_META[state.activeSubject];
  const IconComp = currentMeta.icon;

  const handleSelectSubject = (subId: SubjectId) => {
    if (subId === state.activeSubject) {
      setSheetOpen(false);
      return;
    }

    // If an active task session is currently open on screen, ask for confirmation (Section 6.2 & 6.5 Step C.4)
    if (lessonViewStage === 'tasks' && state.activeSession) {
      playSound('tap');
      setPendingSubject(subId);
      return;
    }

    setSubject(subId);
    setSheetOpen(false);
  };

  const confirmSwitchDuringSession = () => {
    if (!pendingSubject) return;
    setSubject(pendingSubject);
    abortActiveSession();
    setPendingSubject(null);
    setSheetOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSound('tap');
          setSheetOpen(true);
        }}
        aria-label={`Zmień przedmiot (obecnie ${currentMeta.name})`}
        className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center gap-1.5 text-xs sm:text-sm font-extrabold font-display text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer shrink-0"
      >
        <IconComp className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
        {/* Below 380px shows Mat./Pol./Ang., >= 380px shows Matma/Polski/Angielski */}
        <span className="inline min-[380px]:hidden">{currentMeta.shortName}</span>
        <span className="hidden min-[380px]:inline">{currentMeta.mediumName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setPendingSubject(null);
        }}
        title="Wybierz przedmiot E8"
        subtitle="Przełączaj się swobodnie między 3 obowiązkowymi przedmiotami"
      >
        {pendingSubject ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)]">
              <h3 className="text-base font-extrabold font-display mb-1">
                Zmienić przedmiot w trakcie sesji?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Twój dotychczasowy postęp w lekcji zostanie zapisany w tle i
                będziesz mógł do niego wrócić w dowolnej chwili przyciskiem
                „Kontynuuj” na ekranie Start.
              </p>
            </div>
            <div className="flex gap-3">
              <TactileButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setPendingSubject(null)}
              >
                Zostań w lekcji
              </TactileButton>
              <TactileButton
                variant="primary"
                size="md"
                fullWidth
                onClick={confirmSwitchDuringSession}
              >
                Przełącz przedmiot
              </TactileButton>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(['math', 'polish', 'english'] as SubjectId[]).map((subId) => {
              const meta = SUBJECT_META[subId];
              const SubIcon = meta.icon;
              const isSelected = state.activeSubject === subId;

              return (
                <button
                  key={subId}
                  type="button"
                  onClick={() => handleSelectSubject(subId)}
                  className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_4px_0_0_var(--accent-primary-edge)]'
                      : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/20 text-[#080C16]"
                      style={{ backgroundColor: meta.accentColor }}
                    >
                      <SubIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                        {meta.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {meta.statusLabel}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
