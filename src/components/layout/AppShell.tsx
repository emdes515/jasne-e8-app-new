'use client';

import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useAppState } from '../../context/AppStateContext';
import { OnboardingFlow, ProductTourModal } from '../onboarding/OnboardingFlow';
import { GuestAccountReminder } from '../auth/GuestAccountReminder';
import { TopHud } from './TopHud';
import { BottomTabBar } from './BottomTabBar';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopCompanionPanel } from './DesktopCompanionPanel';
import { StartView } from '../start/StartView';
import { LearnPathView } from '../learn/LearnPathView';
import { LessonView } from '../lesson/LessonView';
import { VaultView } from '../vault/VaultView';
import { ExamLobbyView } from '../exam/ExamLobbyView';
import { RankingView } from '../ranking/RankingView';
import { ProfileShopView } from '../profile/ProfileShopView';
import { FormulasBottomSheet } from '../formulas/FormulasBottomSheet';
import { RescueMissionModal } from '../vault/RescueMissionModal';
import { RankUpModal } from '../profile/RankUpModal';
import { ToastHost } from '../ui/ToastHost';
import { AppUpdateModal } from '../ui/AppUpdateModal';
import { TactileHeartIcon } from '../ui/TactileHeartIcon';
import { formatHeartCountdown } from '../../lib/lumiCopy';

export function AppShell() {
  const {
    hydrated,
    state,
    activeTab,
    lessonViewStage,
    secondsToNextHeart,
    setRescueModalOpen,
  } = useAppState();
  const [examInProgress, setExamInProgress] = useState(false);
  const focusMode = examInProgress || lessonViewStage !== 'none';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, lessonViewStage, state.onboardingCompleted, examInProgress]);

  if (!hydrated) return <div className="min-h-dvh bg-[var(--bg-canvas)]" />;

  return (
    <MotionConfig reducedMotion="user">
      {!state.onboardingCompleted ? (
        <>
          <OnboardingFlow />
          <ToastHost />
        </>
      ) : (
        <div className="relative min-h-dvh w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex">
          {/* Left Desktop Sidebar (248px at >= 1024px) */}
          {!focusMode && <DesktopSidebar />}

          {/* Main Workspace Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            {!focusMode && <TopHud />}

            {!focusMode && state.hearts === 0 && (
              <div
                role="status"
                className="w-full bg-[var(--danger)]/10 border-b border-[var(--danger)]/35 px-3.5 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TactileHeartIcon size={17} variant="cracked" />
                  <span className="font-bold text-[var(--text-primary)]">
                    Brak serc do zadań
                    {secondsToNextHeart !== null && (
                      <span className="ml-1.5 font-extrabold tabular-nums text-[var(--danger)]">
                        · +1 serce za {formatHeartCountdown(secondsToNextHeart)}
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRescueModalOpen(true)}
                  className="shrink-0 rounded-lg bg-[var(--danger)] px-2.5 py-1 text-[11px] font-extrabold font-display text-[var(--on-danger)] cursor-pointer hover:opacity-95 transition-opacity"
                >
                  Odzyskaj serce
                </button>
              </div>
            )}

            <div className={`flex-1 w-full px-3.5 sm:px-6 pt-[max(0.875rem,env(safe-area-inset-top))] sm:pt-5 lg:pt-4 flex justify-center gap-6 ${focusMode ? 'pb-[max(1.5rem,env(safe-area-inset-bottom))]' : 'pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-8'}`}>
              {/* Primary Content Column: max-w-[760px] on 1024-1439px, max-w-[780px] on >=1440px */}
              <main className="w-full max-w-[760px] min-[1440px]:max-w-[780px] min-w-0">
                {lessonViewStage !== 'none' ? (
                  <LessonView />
                ) : (
                  <>
                    {activeTab === 'start' && <StartView />}
                    {activeTab === 'learn' && <LearnPathView />}
                    {activeTab === 'vault' && <VaultView />}
                    {activeTab === 'exam' && <ExamLobbyView onRunningChange={setExamInProgress} />}
                    {activeTab === 'ranking' && <RankingView />}
                    {activeTab === 'profile' && <ProfileShopView />}
                  </>
                )}
              </main>

              {/* Right Companion Panel (300px) ONLY at >= 1440px on Start & Learn views when not inside active task runner */}
              {lessonViewStage === 'none' &&
                (activeTab === 'start' || activeTab === 'learn') && (
                  <DesktopCompanionPanel showProgress={activeTab === 'learn'} />
                )}
            </div>
          </div>

          {/* Mobile Bottom Tab Bar (< 1024px) */}
          {!focusMode && <BottomTabBar />}

          {/* Global Modals & Sheets */}
          <FormulasBottomSheet />
          <RescueMissionModal />
          <ProductTourModal />
          <RankUpModal />
          <AppUpdateModal suppressed={focusMode} />
          <GuestAccountReminder suppressed={focusMode} />
          <ToastHost />
        </div>
      )}
    </MotionConfig>
  );
}
