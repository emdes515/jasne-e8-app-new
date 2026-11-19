'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Home, Map, BookmarkCheck, Timer, User } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { NavTabId } from '../../types/domain';
import { SPRING_SNAPPY } from '../../lib/motionPresets';

export const NAV_TABS: Array<{
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'start', label: 'Start', icon: Home },
  { id: 'learn', label: 'Nauka', icon: Map },
  { id: 'vault', label: 'Powtórki', icon: BookmarkCheck },
  { id: 'exam', label: 'Egzamin', icon: Timer },
  { id: 'profile', label: 'Profil', icon: User },
];

export function BottomTabBar() {
  const { state, activeTab, setActiveTab } = useAppState();
  const mistakeCount = state.mistakeBank.length;

  return (
    <nav
      aria-label="Główna nawigacja dolna"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t-2 border-[var(--border-subtle)] px-2 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {NAV_TABS.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative min-h-[48px] min-w-[44px] rounded-2xl flex flex-col items-center justify-center py-1 cursor-pointer select-none"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-capsule"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 rounded-2xl bg-[var(--accent-primary)]/15 border-2 border-[var(--accent-primary)]"
                />
              )}

              <motion.div
                key={isActive ? `${tab.id}-active` : `${tab.id}-idle`}
                initial={isActive ? { scale: 1 } : false}
                animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.24 }}
                className="relative z-10 flex items-center justify-center"
              >
                <IconComp
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-[var(--accent-text)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                {tab.id === 'vault' && mistakeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--danger)] text-[#F8FAFC] text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                    {mistakeCount}
                  </span>
                )}
              </motion.div>

              <span
                className={`relative z-10 text-[11px] font-extrabold font-display mt-0.5 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
