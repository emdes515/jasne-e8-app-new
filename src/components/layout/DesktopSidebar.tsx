'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Volume2, VolumeX, BookOpen, Trophy } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { NAV_TABS } from './BottomTabBar';
import { SPRING_SNAPPY } from '../../lib/motionPresets';
import { getRankForXp } from '../../lib/gamification';
import { PLAYER_TITLE_LABELS } from '../../data/shopCatalog';
import { JasneLogo } from '../brand/JasneLogo';

export function DesktopSidebar() {
  const {
    state,
    activeTab,
    setActiveTab,
    setTheme,
    setSfxEnabled,
    setFormulasOpen,
    playSound,
  } = useAppState();

  const rankInfo = getRankForXp(state.xp);
  const mistakeCount = state.mistakeBank.length;

  return (
    <aside
      aria-label="Panel nawigacji bocznej"
      className="hidden lg:flex flex-col justify-between w-[248px] shrink-0 min-h-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-4 sticky top-0 h-dvh overflow-y-auto gap-4"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1.5 pt-1">
          <JasneLogo
            size="md"
            animated="subtle"
            showSubtitle
            interactive
            onClick={() => {
              playSound('tap');
              setActiveTab('start');
            }}
          />
        </div>

        {/* Navigation Links with Shared layoutId Capsule */}
        <nav aria-label="Menu główne" className="space-y-1.5">
          {NAV_TABS.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative w-full min-h-[48px] px-4 rounded-2xl flex items-center justify-between text-left cursor-pointer select-none group"
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-sidebar-capsule"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]/12"
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <IconComp
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'text-[var(--accent-text)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span
                    className={`text-sm font-extrabold font-display ${
                      isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>

                {tab.id === 'vault' && mistakeCount > 0 && (
                  <span className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--danger)] text-[var(--on-danger)] text-xs font-extrabold flex items-center justify-center tabular-nums">
                    {mistakeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Contextual Math Formulas Drawer Trigger (ONLY for Math and NOT in Exam! AC-G4, AC-X4) */}
        {state.activeSubject === 'math' && activeTab !== 'exam' && (
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                playSound('tap');
                setFormulasOpen(true);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-primary)] flex items-center gap-2.5 text-xs font-extrabold font-display text-[var(--accent-text)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Wzory E8</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mini Player Card & Quick Theme/SFX toggles */}
      <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
        <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="text-xs font-extrabold font-display text-[var(--text-primary)] truncate">
            {state.nickname}
          </div>
          <div className="text-[11px] text-[var(--accent-text)] font-semibold truncate">
            {PLAYER_TITLE_LABELS[state.loadout.playerTitle]}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-secondary)] tabular-nums">
            <span>{rankInfo.currentRank.name}</span>
            <span className="font-bold text-[var(--text-primary)]">
              {state.xp} XP
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setTheme(state.theme === 'dark' ? 'light' : 'dark')
            }
            aria-label={
              state.theme === 'dark'
                ? 'Przełącz na motyw jasny Solar'
                : 'Przełącz na motyw ciemny Nocturne'
            }
            className="min-h-[44px] px-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            {state.theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Solar</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Nocturne</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSfxEnabled(!state.sfxEnabled)}
            aria-label={
              state.sfxEnabled ? 'Wyłącz dźwięki SFX' : 'Włącz dźwięki SFX'
            }
            className="min-h-[44px] px-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            {state.sfxEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[var(--success)]" />
                <span>Dźwięk</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>Cisza</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
