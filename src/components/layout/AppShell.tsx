'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { useAppState } from '../../context/AppStateContext';
import { findMathLesson } from '../../data/mathLessonMock';
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
import { AppSplashLoader, SessionTransitionLoader } from '../ui/BulbLoadingScreen';
import { formatHeartCountdown } from '../../lib/lumiCopy';

const SPLASH_SEEN_KEY = 'jasne-e8:splash-seen';

export function AppShell() {
  const {
    hydrated,
    state,
    activeTab,
    lessonViewStage,
    selectedLessonId,
    secondsToNextHeart,
    setRescueModalOpen,
  } = useAppState();
  const prefersReduced = useReducedMotion();
  const [examInProgress, setExamInProgress] = useState(false);
  const [splashState, setSplashState] = useState<'checking' | 'pinned' | 'auto' | 'done'>('checking');
  const [splashProgress, setSplashProgress] = useState(18);
  const [lessonTransitionTitle, setLessonTransitionTitle] = useState<string | null>(null);
  const prevHydratedRef = useRef(false);
  const prevLessonStageRef = useRef(lessonViewStage);
  const focusMode = examInProgress || lessonViewStage !== 'none';

  // Cold-start splash reveal raz na sesję (pomijany przy ?autostart=1 i reduced-motion; wymuszany przy ?splash=1)
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    let rafId = 0;

    const initRaf = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const forceSplash = params.get('splash') === '1';
      const isAutostart = params.get('autostart') === '1';

      if (forceSplash) {
        setSplashProgress(74);
        setSplashState('pinned');
        return;
      }

      if (isAutostart || prefersReduced) {
        setSplashState('done');
        return;
      }

      let alreadySeen = false;
      try {
        alreadySeen = Boolean(sessionStorage.getItem(SPLASH_SEEN_KEY));
        if (!alreadySeen) {
          sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
        }
      } catch {
        /* sessionStorage jest opcjonalny */
      }

      if (alreadySeen) {
        setSplashState('done');
        return;
      }

      setSplashState('auto');
      setSplashProgress(18);
      const startTime = performance.now();
      const durationMs = 950;

      const step = (now: number) => {
        const ratio = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - Math.pow(1 - ratio, 2);
        setSplashProgress(Math.round(18 + eased * 82));
        if (ratio >= 1) {
          setSplashState('done');
          return;
        }
        rafId = window.requestAnimationFrame(step);
      };

      rafId = window.requestAnimationFrame(step);
    });

    return () => {
      window.cancelAnimationFrame(initRaf);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [hydrated, prefersReduced]);

  // Ekran przejścia przy otwieraniu/wznawianiu lekcji (z wyłączeniem F5 recovery, ?autostart=1 i reduced-motion)
  useLayoutEffect(() => {
    const wasHydrated = prevHydratedRef.current;
    const prevStage = prevLessonStageRef.current;
    let cancelled = false;

    if (
      wasHydrated &&
      hydrated &&
      prevStage === 'none' &&
      (lessonViewStage === 'theory' || lessonViewStage === 'tasks')
    ) {
      const isAutostart =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('autostart') === '1';

      if (!prefersReduced && !isAutostart) {
        const lessonTitle =
          lessonViewStage === 'tasks' && state.activeSession?.title
            ? state.activeSession.title
            : findMathLesson(selectedLessonId)?.title ?? 'Lekcja matematyki E8';
        queueMicrotask(() => {
          if (!cancelled) setLessonTransitionTitle(lessonTitle);
        });
      }
    }

    prevHydratedRef.current = hydrated;
    prevLessonStageRef.current = lessonViewStage;

    return () => {
      cancelled = true;
    };
  }, [hydrated, lessonViewStage, prefersReduced, selectedLessonId, state.activeSession?.title]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, lessonViewStage, state.onboardingCompleted, examInProgress]);

  if (!hydrated) {
    return (
      <MotionConfig reducedMotion="user">
        <AppSplashLoader variant="boot" progress={18} fullscreen />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {splashState !== 'done' && (
          <motion.div
            key="cold-start-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[220]"
          >
            <AppSplashLoader
              variant="boot"
              progress={splashProgress}
              allowSkip={splashState !== 'checking'}
              onSkip={() => setSplashState('done')}
              fullscreen
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lessonTransitionTitle && (
          <SessionTransitionLoader
            key="lesson-transition-loader"
            mode="lesson"
            title={lessonTransitionTitle}
            onDone={() => setLessonTransitionTitle(null)}
          />
        )}
      </AnimatePresence>

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
            <div className="sticky top-0 z-20">
              {!focusMode && <TopHud />}
              <GuestAccountReminder suppressed={focusMode} />
            </div>

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
          <ToastHost />
        </div>
      )}
    </MotionConfig>
  );
}
