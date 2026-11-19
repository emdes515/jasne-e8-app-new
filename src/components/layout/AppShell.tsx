'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';
import { useAppState } from '../../context/AppStateContext';
import { OnboardingFlow, ProductTourModal } from '../onboarding/OnboardingFlow';
import { TopHud } from './TopHud';
import { BottomTabBar } from './BottomTabBar';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopCompanionPanel } from './DesktopCompanionPanel';
import { StartView } from '../start/StartView';
import { LearnPathView } from '../learn/LearnPathView';
import { LessonView } from '../lesson/LessonView';
import { VaultView } from '../vault/VaultView';
import { ExamLobbyView } from '../exam/ExamLobbyView';
import { ProfileShopView } from '../profile/ProfileShopView';
import { FormulasBottomSheet } from '../formulas/FormulasBottomSheet';
import { RescueMissionModal } from '../vault/RescueMissionModal';
import { RankUpModal } from '../profile/RankUpModal';
import { ToastHost } from '../ui/ToastHost';

export function AppShell() {
  const { state, activeTab, lessonViewStage } = useAppState();

  return (
    <MotionConfig reducedMotion="user">
      {!state.onboardingCompleted ? (
        <>
          <OnboardingFlow />
          <ToastHost />
        </>
      ) : (
        <div className="relative min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex overflow-x-hidden">
          {/* Static subtle background radial glow (opacity <= 0.06 as required by Spec Section 2.2) */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-3xl"
          />

          {/* Left Desktop Sidebar (248px at >= 1024px) */}
          <DesktopSidebar />

          {/* Main Workspace Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            <TopHud />

            <div className="flex-1 w-full px-4 sm:px-6 pt-5 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-10 flex justify-center gap-6">
              {/* Primary Content Column: max-w-[760px] on 1024-1439px, max-w-[780px] on >=1440px */}
              <main className="w-full max-w-[760px] min-[1440px]:max-w-[780px] min-w-0">
                {lessonViewStage !== 'none' ? (
                  <LessonView />
                ) : (
                  <>
                    {activeTab === 'start' && <StartView />}
                    {activeTab === 'learn' && <LearnPathView />}
                    {activeTab === 'vault' && <VaultView />}
                    {activeTab === 'exam' && <ExamLobbyView />}
                    {activeTab === 'profile' && <ProfileShopView />}
                  </>
                )}
              </main>

              {/* Right Companion Panel (300px) ONLY at >= 1440px on Start & Learn views when not inside active task runner */}
              {lessonViewStage === 'none' &&
                (activeTab === 'start' || activeTab === 'learn') && (
                  <DesktopCompanionPanel />
                )}
            </div>
          </div>

          {/* Mobile Bottom Tab Bar (< 1024px) */}
          <BottomTabBar />

          {/* Global Modals & Sheets */}
          <FormulasBottomSheet />
          <RescueMissionModal />
          <ProductTourModal />
          <RankUpModal />
          <ToastHost />
        </div>
      )}
    </MotionConfig>
  );
}
