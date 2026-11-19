'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActiveTaskSession,
  AppState,
  DailyGoalMinutes,
  ExamAttemptRecord,
  LumiLoadout,
  NavTabId,
  RankDefinition,
  SessionSource,
  ShopItemDefinition,
  StudyStageId,
  SubjectId,
  TaskEvalOutcome,
  ThemeMode,
} from '../types/domain';
import { appStateRepository } from '../services/storage/firebaseReadyStub';
import { createInitialAppState } from '../services/storage/localStateRepo';
import { soundEngine, SoundEvent } from '../services/audio/soundEngine';
import { getWarsawPlayerDay } from '../lib/playerDay';
import {
  applyHeartLoss,
  calculateTaskXp,
  computeCompletionRewards,
  detectNewRankUp,
  generateDailyChallengesForDay,
  HEART_REFILL_INTERVAL_MS,
  HEART_REFILL_PRICE,
  MAX_FREE_RESCUE_PER_DAY,
  MAX_HEARTS,
  MAX_STREAK_SHIELDS,
  MAX_VAULT_FIFO_SIZE,
  reconcileHearts,
  reconcileStreakOnVisit,
  recordDayCompletion,
  STREAK_SHIELD_PRICE,
  validateNickname,
} from '../lib/gamification';
import { ALL_TASKS_BY_ID } from '../data/mathExamMock';
import { MATH_LESSON_1_1 } from '../data/mathLessonMock';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

export interface SessionCompletionSummary {
  source: SessionSource;
  title: string;
  xpEarned: number;
  coinsEarned: number;
  accuracyPercent: number;
  correctCount: number;
  totalCount: number;
  isRepeatToday: boolean;
  masteredMistakesCount: number;
  rescueHeartEarned: boolean;
  streakMilestoneCoins: number;
}

interface AppStateContextValue {
  state: AppState;
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;

  // Modals & Overlays
  formulasOpen: boolean;
  setFormulasOpen: (open: boolean) => void;
  rescueModalOpen: boolean;
  setRescueModalOpen: (open: boolean) => void;
  productTourOpen: boolean;
  setProductTourOpen: (open: boolean) => void;
  rankUpModalRank: RankDefinition | null;
  dismissRankUpModal: () => void;
  shieldBurstTick: number;
  heartEventTick: { type: 'loss' | 'restore'; tick: number } | null;

  // Active Lesson View mode ('none' | 'theory' | 'tasks' | 'summary')
  lessonViewStage: 'none' | 'theory' | 'tasks' | 'summary';
  setLessonViewStage: (stage: 'none' | 'theory' | 'tasks' | 'summary') => void;
  lastSessionSummary: SessionCompletionSummary | null;
  clearSessionSummary: () => void;

  // Seconds remaining to next heart refill (null if 5/5)
  secondsToNextHeart: number | null;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (text: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: string) => void;

  // Sound helper
  playSound: (event: SoundEvent, options?: { comboCount?: number }) => void;

  // Domain Actions
  completeOnboarding: (params: {
    nickname: string;
    studyStage: StudyStageId;
    activeSubject: SubjectId;
    dailyGoalMinutes: DailyGoalMinutes;
    starterColor: LumiLoadout['colorScheme'];
    startFirstLesson: boolean;
  }) => void;
  setSubject: (subject: SubjectId) => void;
  setTheme: (theme: ThemeMode) => void;
  setSfxEnabled: (enabled: boolean) => void;
  updateProfileSettings: (params: {
    nickname?: string;
    dailyGoalMinutes?: DailyGoalMinutes;
  }) => { ok: boolean; error?: string };

  // Lesson & Practice Sessions
  openLessonTheory: () => void;
  startLessonTasks: () => boolean;
  startPracticeSession: (
    source: 'saved' | 'bank' | 'rescue',
    filterSubject?: SubjectId | 'all'
  ) => boolean;
  submitSessionTaskAnswer: (params: {
    taskId: string;
    userAnswer: string;
    outcome: TaskEvalOutcome;
    hintsUsed: number;
    aiScore?: 0 | 1 | 2;
    aiFeedback?: string;
    matchedKeywords?: string[];
  }) => {
    xpAwarded: number;
    newComboCount: number;
    zeroHeartsReached: boolean;
    rescueHeartJustEarned: boolean;
  };
  advanceSessionTaskOrFinish: () => void;
  abortActiveSession: () => void;

  // Vault (Bookmarks & Mistake Bank)
  toggleTaskSaved: (taskId: string, subjectId?: SubjectId) => {
    saved: boolean;
    alreadyExisted: boolean;
  };
  removeSavedTask: (key: string) => void;

  // Daily Challenges
  claimDailyChallenge: (challengeId: string) => boolean;

  // Shop & Rescue Boosters
  purchaseOrEquipShopItem: (item: ShopItemDefinition) => {
    ok: boolean;
    action?: 'purchased' | 'equipped';
    reason?: string;
  };
  buyHeartWithCoins: () => boolean;

  // Exam Completion
  completeMiniExam: (params: {
    answers: Record<
      string,
      {
        userAnswer: string;
        outcome: TaskEvalOutcome;
        pointsEarned: number;
        pointsMax: number;
        xpEarned: number;
      }
    >;
  }) => ExamAttemptRecord;

  // Full Local Reset
  resetAllLocalProgress: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialAppState());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTabState] = useState<NavTabId>('start');
  const [formulasOpen, setFormulasOpen] = useState(false);
  const [rescueModalOpen, setRescueModalOpen] = useState(false);
  const [productTourOpen, setProductTourOpen] = useState(false);
  const [rankUpModalRank, setRankUpModalRank] = useState<RankDefinition | null>(
    null
  );
  const [shieldBurstTick, setShieldBurstTick] = useState(0);
  const [heartEventTick, setHeartEventTick] = useState<{
    type: 'loss' | 'restore';
    tick: number;
  } | null>(null);
  const [lessonViewStage, setLessonViewStage] = useState<
    'none' | 'theory' | 'tasks' | 'summary'
  >('none');
  const [lastSessionSummary, setLastSessionSummary] =
    useState<SessionCompletionSummary | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const pushToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'info') => {
      const id =
        'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3400);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const playSound = useCallback(
    (event: SoundEvent, options?: { comboCount?: number }) => {
      soundEngine.play(event, options);
    },
    []
  );

  // Initial load from localStateRepo + ?autostart=1 support + day & heart reconciliation
  useEffect(() => {
    const loaded = appStateRepository.load();
    let current = loaded.state;
    const nowMs = Date.now();
    const today = getWarsawPlayerDay(new Date(nowMs));

    // Support ?autostart=1 for automated testing or skipping onboarding
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !current.onboardingCompleted) {
        current = {
          ...current,
          onboardingCompleted: true,
        };
      }
    }

    // Reconcile offline hearts
    const heartRec = reconcileHearts(
      current.hearts,
      current.heartRefillAnchorAt,
      nowMs
    );
    current = {
      ...current,
      hearts: heartRec.hearts,
      heartRefillAnchorAt: heartRec.heartRefillAnchorAt,
    };

    // Reconcile day rollover & Streak Shields
    let shieldsUsedToast = false;
    if (current.currentPlayerDay !== today) {
      const streakRec = reconcileStreakOnVisit({
        today,
        lastCompletedPlayerDay: current.lastCompletedPlayerDay,
        streakDays: current.streakDays,
        streakShields: current.streakShields,
      });
      if (streakRec.shieldsConsumed > 0) {
        shieldsUsedToast = true;
      }
      current = {
        ...current,
        currentPlayerDay: today,
        streakDays: streakRec.streakDays,
        streakShields: streakRec.streakShields,
        dailyLessonsCompleted: 0,
        dailyTasksChecked: 0,
        dailyChallenges: generateDailyChallengesForDay(today),
        rescueMissionsCompletedToday: 0,
        rescueMissionCurrentProgress: 0,
        rescueMissionCountedTaskIds: [],
      };
    } else {
      // Even within same currentPlayerDay, ensure streak vs lastCompletedPlayerDay is consistent
      const streakRec = reconcileStreakOnVisit({
        today,
        lastCompletedPlayerDay: current.lastCompletedPlayerDay,
        streakDays: current.streakDays,
        streakShields: current.streakShields,
      });
      if (streakRec.shieldsConsumed > 0) {
        shieldsUsedToast = true;
      }
      current = {
        ...current,
        streakDays: streakRec.streakDays,
        streakShields: streakRec.streakShields,
      };
    }

    soundEngine.setEnabled(current.sfxEnabled);

    setState(current);
    setHydrated(true);

    if (loaded.wasCorruptedOrReset && loaded.warningMessage) {
      setTimeout(() => {
        pushToast(loaded.warningMessage!, 'warning');
      }, 200);
    }

    if (shieldsUsedToast) {
      setTimeout(() => {
        pushToast('Tarcza Serii uratowała Twoją serię!', 'info');
      }, 350);
    }

    // If there was an active lesson/practice session before F5, restore view
    if (current.activeSession && current.onboardingCompleted) {
      setLessonViewStage('tasks');
      setTimeout(() => {
        pushToast('Wróciliśmy do Twojej przerwanej sesji!', 'info');
      }, 400);
    }
  }, [pushToast]);

  // Sync theme to documentElement immediately
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [state.theme]);

  // Sync sound engine enabled flag
  useEffect(() => {
    soundEngine.setEnabled(state.sfxEnabled);
  }, [state.sfxEnabled]);

  // Save debounced on state change + flush on visibilitychange
  useEffect(() => {
    if (!hydrated) return;
    appStateRepository.saveDebounced(state, () => {
      pushToast(
        'Pamięć przeglądarki jest pełna — postęp działa w bieżącej sesji.',
        'warning'
      );
    });
  }, [state, hydrated, pushToast]);

  useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === 'hidden') {
        appStateRepository.flush();
      }
    };
    window.addEventListener('visibilitychange', handleVis);
    return () => window.removeEventListener('visibilitychange', handleVis);
  }, []);

  // Periodic 1s timer to update heart regeneration countdown and auto-grant hearts
  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      const cur = stateRef.current;
      if (cur.hearts < MAX_HEARTS && cur.heartRefillAnchorAt !== null) {
        const rec = reconcileHearts(cur.hearts, cur.heartRefillAnchorAt, now);
        if (rec.restoredCount > 0) {
          setState((prev) => ({
            ...prev,
            hearts: rec.hearts,
            heartRefillAnchorAt: rec.heartRefillAnchorAt,
          }));
          setHeartEventTick({ type: 'restore', tick: now });
          soundEngine.play('heartRestore');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrated]);

  const secondsToNextHeart = useMemo(() => {
    if (state.hearts >= MAX_HEARTS || state.heartRefillAnchorAt === null) {
      return null;
    }
    const elapsed = Math.max(0, nowTick - state.heartRefillAnchorAt);
    const remainingMs = Math.max(0, HEART_REFILL_INTERVAL_MS - elapsed);
    return Math.ceil(remainingMs / 1000);
  }, [state.hearts, state.heartRefillAnchorAt, nowTick]);

  const setActiveTab = useCallback(
    (tab: NavTabId) => {
      playSound('tabSwitch');
      setActiveTabState(tab);
      if (tab === 'exam') {
        setFormulasOpen(false);
      }
      if (tab !== 'learn' && tab !== 'start' && tab !== 'vault') {
        if (lessonViewStage === 'theory' || lessonViewStage === 'summary') {
          setLessonViewStage('none');
        }
      }
    },
    [playSound, lessonViewStage]
  );

  // Remember to close FormulasBottomSheet when switching away from Math (AC-G4)
  const setSubject = useCallback(
    (subject: SubjectId) => {
      playSound('tap');
      if (subject !== 'math') {
        setFormulasOpen(false);
      }
      setState((prev) => ({
        ...prev,
        activeSubject: subject,
      }));
    },
    [playSound]
  );

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      playSound('tap');
      setState((prev) => ({ ...prev, theme }));
    },
    [playSound]
  );

  const setSfxEnabled = useCallback((enabled: boolean) => {
    soundEngine.setEnabled(enabled);
    if (enabled) {
      soundEngine.play('tap');
    }
    setState((prev) => ({ ...prev, sfxEnabled: enabled }));
  }, []);

  const updateProfileSettings = useCallback(
    (params: { nickname?: string; dailyGoalMinutes?: DailyGoalMinutes }) => {
      if (params.nickname !== undefined) {
        const v = validateNickname(params.nickname);
        if (!v.valid) {
          return { ok: false, error: v.error };
        }
        setState((prev) => ({
          ...prev,
          nickname: v.trimmed,
          dailyGoalMinutes: params.dailyGoalMinutes ?? prev.dailyGoalMinutes,
        }));
        pushToast('Zapisano ustawienia profilu!', 'success');
        return { ok: true };
      }
      if (params.dailyGoalMinutes !== undefined) {
        setState((prev) => ({
          ...prev,
          dailyGoalMinutes: params.dailyGoalMinutes!,
        }));
        pushToast('Zmieniono dzienny cel nauki!', 'success');
      }
      return { ok: true };
    },
    [pushToast]
  );

  const completeOnboarding = useCallback(
    (params: {
      nickname: string;
      studyStage: StudyStageId;
      activeSubject: SubjectId;
      dailyGoalMinutes: DailyGoalMinutes;
      starterColor: LumiLoadout['colorScheme'];
      startFirstLesson: boolean;
    }) => {
      const v = validateNickname(params.nickname);
      const safeNick = v.valid ? v.trimmed : 'BłyskLogiki';
      const today = getWarsawPlayerDay();

      setState((prev) => ({
        ...prev,
        onboardingCompleted: true,
        nickname: safeNick,
        studyStage: params.studyStage,
        activeSubject: params.activeSubject,
        dailyGoalMinutes: params.dailyGoalMinutes,
        coins: 120,
        hearts: MAX_HEARTS,
        heartRefillAnchorAt: null,
        xp: 0,
        achievedRankIds: ['novice'],
        streakShields: 0,
        currentPlayerDay: today,
        dailyChallenges: generateDailyChallengesForDay(today),
        loadout: {
          ...prev.loadout,
          colorScheme: params.starterColor,
        },
      }));

      playSound('purchase');

      if (params.startFirstLesson) {
        setState((prev) => ({ ...prev, activeSubject: 'math' }));
        setActiveTabState('learn');
        setLessonViewStage('theory');
      } else {
        setActiveTabState('start');
        setLessonViewStage('none');
      }
    },
    [playSound]
  );

  const openLessonTheory = useCallback(() => {
    playSound('tap');
    setState((prev) => ({ ...prev, activeSubject: 'math' }));
    setLessonViewStage('theory');
  }, [playSound]);

  const startLessonTasks = useCallback((): boolean => {
    const cur = stateRef.current;
    if (cur.hearts <= 0) {
      playSound('wrong');
      setRescueModalOpen(true);
      return false;
    }

    playSound('tap');

    // If there is already an active lesson session (e.g. resumed after 0 hearts), continue from first unanswered task
    if (cur.activeSession && cur.activeSession.source === 'lesson') {
      const firstUnansweredIdx = cur.activeSession.taskIds.findIndex(
        (tid) => !cur.activeSession!.answers[tid]
      );
      const nextIdx =
        firstUnansweredIdx >= 0 ? firstUnansweredIdx : cur.activeSession.currentIndex;
      setState((prev) => ({
        ...prev,
        activeSession: prev.activeSession
          ? {
              ...prev.activeSession,
              currentIndex: nextIdx,
              interruptedByZeroHearts: false,
            }
          : null,
      }));
      setLessonViewStage('tasks');
      return true;
    }

    const newSession: ActiveTaskSession = {
      sessionId: 'sess-lesson-' + Date.now(),
      source: 'lesson',
      contentId: MATH_LESSON_1_1.id,
      subjectId: 'math',
      title: MATH_LESSON_1_1.title,
      taskIds: MATH_LESSON_1_1.tasks.map((t) => t.id),
      currentIndex: 0,
      answers: {},
      comboCount: 0,
      lastAnsweredAt: null,
      interruptedByZeroHearts: false,
    };

    setState((prev) => ({
      ...prev,
      activeSubject: 'math',
      activeSession: newSession,
    }));
    setLessonViewStage('tasks');
    return true;
  }, [playSound]);

  const startPracticeSession = useCallback(
    (
      source: 'saved' | 'bank' | 'rescue',
      filterSubject: SubjectId | 'all' = 'all'
    ): boolean => {
      const cur = stateRef.current;

      if (source !== 'rescue' && cur.hearts <= 0) {
        playSound('wrong');
        setRescueModalOpen(true);
        return false;
      }

      if (
        source === 'rescue' &&
        cur.rescueMissionsCompletedToday >= MAX_FREE_RESCUE_PER_DAY
      ) {
        pushToast('Wykorzystano 3/3 darmowe misje dzisiaj — wróć jutro!', 'warning');
        return false;
      }

      // Deduplicate taskIds by taskId + subjectId
      const seenKeys = new Set<string>();
      const taskIds: string[] = [];

      const addEntries = (
        entries: Array<{ key: string; taskId: string; subjectId: SubjectId }>
      ) => {
        for (const entry of entries) {
          if (filterSubject !== 'all' && entry.subjectId !== filterSubject) {
            continue;
          }
          if (!seenKeys.has(entry.key) && ALL_TASKS_BY_ID[entry.taskId]) {
            seenKeys.add(entry.key);
            taskIds.push(entry.taskId);
          }
        }
      };

      if (source === 'saved') {
        addEntries(cur.savedTasks);
      } else if (source === 'bank') {
        addEntries(cur.mistakeBank);
      } else {
        // rescue uses mistakeBank first, then savedTasks
        addEntries(cur.mistakeBank);
        addEntries(cur.savedTasks);
      }

      if (taskIds.length === 0) {
        pushToast(
          'Brak zadań w Banku Błędów lub Zapisanych do uruchomienia sesji powtórkowej.',
          'info'
        );
        return false;
      }

      playSound('tap');
      setRescueModalOpen(false);

      const titleMap: Record<'saved' | 'bank' | 'rescue', string> = {
        saved: 'Powtórka: Zapisane zadania',
        bank: 'Powtórka: Bank Błędów',
        rescue: 'Misja Ratunkowa (+1 Serce za 2 poprawne)',
      };

      const newSession: ActiveTaskSession = {
        sessionId: `sess-${source}-${Date.now()}`,
        source,
        contentId: `practice:${source}`,
        subjectId: 'math',
        title: titleMap[source],
        taskIds,
        currentIndex: 0,
        answers: {},
        comboCount: 0,
        lastAnsweredAt: null,
        interruptedByZeroHearts: false,
      };

      setState((prev) => ({
        ...prev,
        activeSession: newSession,
      }));
      setLessonViewStage('tasks');
      return true;
    },
    [playSound, pushToast]
  );

  /**
   * Single unified order of events after checking a task (Master Spec Section 6.5 Step C.5):
   * 1. evaluate outcome
   * 2. subtract heart (if wrong)
   * 3. update combo (with 90s expiration check in lesson/practice)
   * 4. calculate XP
   * 5. update daily challenges & daily goal progress
   * 6. add to Mistake Bank (if wrong) or increment correctStreak (if bank/rescue)
   */
  const submitSessionTaskAnswer = useCallback(
    (params: {
      taskId: string;
      userAnswer: string;
      outcome: TaskEvalOutcome;
      hintsUsed: number;
      aiScore?: 0 | 1 | 2;
      aiFeedback?: string;
      matchedKeywords?: string[];
    }) => {
      const cur = stateRef.current;
      const session = cur.activeSession;
      const task = ALL_TASKS_BY_ID[params.taskId];
      const nowMs = Date.now();

      if (!session || !task) {
        return {
          xpAwarded: 0,
          newComboCount: 0,
          zeroHeartsReached: false,
          rescueHeartJustEarned: false,
        };
      }

      const isPractice =
        session.source === 'saved' ||
        session.source === 'bank' ||
        session.source === 'rescue';

      // Check 90s combo timeout before applying new outcome
      let baseCombo = session.comboCount;
      if (
        session.lastAnsweredAt !== null &&
        nowMs - session.lastAnsweredAt >= 90_000
      ) {
        baseCombo = 0;
      }

      // 2. Heart loss on 'wrong' (never on 'partial' 1/2!)
      let nextHearts = cur.hearts;
      let nextHeartAnchor = cur.heartRefillAnchorAt;
      if (params.outcome === 'wrong') {
        const loss = applyHeartLoss(cur.hearts, cur.heartRefillAnchorAt, nowMs);
        nextHearts = loss.hearts;
        nextHeartAnchor = loss.heartRefillAnchorAt;
      }

      // 3. Combo update: 'correct' -> +1, 'partial' (1/2) -> unchanged, 'wrong' -> 0
      let nextCombo = baseCombo;
      if (params.outcome === 'correct') {
        nextCombo = baseCombo + 1;
      } else if (params.outcome === 'wrong') {
        nextCombo = 0;
      }

      // 4. XP calculation
      const xpAwarded = calculateTaskXp({
        type: task.type,
        outcome: params.outcome,
        openScore: params.aiScore,
        hintsUsed: params.hintsUsed,
        comboCountAfterAnswer: nextCombo,
        source: session.source,
      });

      // Audio feedback
      if (params.outcome === 'correct' || params.outcome === 'partial') {
        playSound('correct', { comboCount: Math.max(1, nextCombo) });
        if (nextCombo === 3 || nextCombo === 5 || nextCombo === 8) {
          setTimeout(() => playSound('comboUp'), 140);
        }
      } else {
        playSound('wrong');
        setTimeout(() => playSound('heartLoss'), 90);
        setHeartEventTick({ type: 'loss', tick: nowMs });
      }

      // 5 & 6. Update Mistake Bank & Rescue Mission progress
      const mistakeKey = `${task.id}:${task.subjectId}`;
      let nextMistakeBank = [...cur.mistakeBank];
      let nextRescueProgress = cur.rescueMissionCurrentProgress;
      let nextRescueCompletedToday = cur.rescueMissionsCompletedToday;
      let nextRescueCountedIds = [...cur.rescueMissionCountedTaskIds];
      let rescueHeartJustEarned = false;

      if (params.outcome === 'wrong') {
        const existingIdx = nextMistakeBank.findIndex((m) => m.key === mistakeKey);
        if (existingIdx >= 0) {
          nextMistakeBank[existingIdx] = {
            ...nextMistakeBank[existingIdx],
            correctStreak: 0,
            lastMistakeAt: nowMs,
          };
        } else {
          nextMistakeBank.unshift({
            key: mistakeKey,
            taskId: task.id,
            subjectId: task.subjectId,
            correctStreak: 0,
            lastMistakeAt: nowMs,
          });
          if (nextMistakeBank.length > MAX_VAULT_FIFO_SIZE) {
            nextMistakeBank = nextMistakeBank
              .sort((a, b) => b.lastMistakeAt - a.lastMistakeAt)
              .slice(0, MAX_VAULT_FIFO_SIZE);
          }
        }
      } else if (
        params.outcome === 'correct' &&
        (session.source === 'bank' || session.source === 'rescue')
      ) {
        // Increment correctStreak in Mistake Bank; remove at 2/2 (AC-P3)
        const existingIdx = nextMistakeBank.findIndex((m) => m.key === mistakeKey);
        if (existingIdx >= 0) {
          const newStreak = nextMistakeBank[existingIdx].correctStreak + 1;
          if (newStreak >= 2) {
            nextMistakeBank.splice(existingIdx, 1);
          } else {
            nextMistakeBank[existingIdx] = {
              ...nextMistakeBank[existingIdx],
              correctStreak: newStreak,
            };
          }
        }
      }

      // Rescue mission progress (persists per playerDay, deduplicated by taskId within current mission)
      if (
        params.outcome === 'correct' &&
        (session.source === 'rescue' || session.source === 'bank') &&
        nextRescueCompletedToday < MAX_FREE_RESCUE_PER_DAY &&
        nextHearts < MAX_HEARTS &&
        !nextRescueCountedIds.includes(task.id)
      ) {
        nextRescueCountedIds.push(task.id);
        nextRescueProgress += 1;
        if (nextRescueProgress >= 2) {
          nextRescueProgress = 0;
          nextRescueCountedIds = [];
          nextRescueCompletedToday += 1;
          nextHearts = Math.min(MAX_HEARTS, nextHearts + 1);
          if (nextHearts >= MAX_HEARTS) {
            nextHeartAnchor = null;
          }
          rescueHeartJustEarned = true;
          setHeartEventTick({ type: 'restore', tick: nowMs });
          setTimeout(() => playSound('heartRestore'), 200);
          pushToast('Misja Ratunkowa ukończona! Odzyskano +1 Serce!', 'success');
        }
      }

      const zeroHeartsReached =
        params.outcome === 'wrong' && nextHearts <= 0 && session.source !== 'rescue';

      // Accuracy stats (excluding practice sessions, per Section 6.3.2)
      let addPointsEarned = 0;
      let addPointsPossible = 0;
      if (!isPractice) {
        if (task.type === 'open') {
          addPointsEarned = params.aiScore ?? 0;
          addPointsPossible = 2;
        } else {
          addPointsEarned = params.outcome === 'correct' ? 1 : 0;
          addPointsPossible = 1;
        }
      }

      // Update Daily Challenges
      const updatedSessionAnswers = {
        ...session.answers,
        [task.id]: {
          userAnswer: params.userAnswer,
          outcome: params.outcome,
          xpAwarded,
          hintsUsed: params.hintsUsed,
          aiScore: params.aiScore,
          aiFeedback: params.aiFeedback,
          matchedKeywords: params.matchedKeywords,
        },
      };

      const practiceCorrectCount = isPractice
        ? Object.values(updatedSessionAnswers).length
        : 0;

      const nextChallenges = cur.dailyChallenges.map((ch) => {
        if (ch.kind === 'sprint_5_in_row') {
          return {
            ...ch,
            current: Math.min(ch.target, Math.max(ch.current, nextCombo)),
          };
        }
        if (
          ch.kind === 'open_task_ai' &&
          task.type === 'open' &&
          (params.outcome === 'correct' || params.outcome === 'partial')
        ) {
          return {
            ...ch,
            current: Math.min(ch.target, ch.current + 1),
          };
        }
        if (ch.kind === 'practice_3_tasks' && isPractice) {
          return {
            ...ch,
            current: Math.min(
              ch.target,
              Math.max(ch.current, practiceCorrectCount)
            ),
          };
        }
        return ch;
      });

      setState((prev) => ({
        ...prev,
        hearts: nextHearts,
        heartRefillAnchorAt: nextHeartAnchor,
        bestCombo: Math.max(prev.bestCombo, nextCombo),
        totalTasksSolved: prev.totalTasksSolved + 1,
        accuracyPointsEarned: prev.accuracyPointsEarned + addPointsEarned,
        accuracyPointsPossible: prev.accuracyPointsPossible + addPointsPossible,
        dailyTasksChecked: prev.dailyTasksChecked + 1,
        dailyChallenges: nextChallenges,
        mistakeBank: nextMistakeBank,
        rescueMissionCurrentProgress: nextRescueProgress,
        rescueMissionsCompletedToday: nextRescueCompletedToday,
        rescueMissionCountedTaskIds: nextRescueCountedIds,
        activeSession: prev.activeSession
          ? {
              ...prev.activeSession,
              answers: updatedSessionAnswers,
              comboCount: nextCombo,
              lastAnsweredAt: nowMs,
              interruptedByZeroHearts: zeroHeartsReached,
            }
          : null,
      }));

      return {
        xpAwarded,
        newComboCount: nextCombo,
        zeroHeartsReached,
        rescueHeartJustEarned,
      };
    },
    [playSound, pushToast]
  );

  const advanceSessionTaskOrFinish = useCallback(() => {
    const cur = stateRef.current;
    const session = cur.activeSession;
    if (!session) return;

    playSound('tap');

    // If hearts ran out mid-session, stay in interrupted view
    if (session.interruptedByZeroHearts && cur.hearts <= 0) {
      return;
    }

    const nextIdx = session.currentIndex + 1;
    if (nextIdx < session.taskIds.length) {
      setState((prev) => ({
        ...prev,
        activeSession: prev.activeSession
          ? {
              ...prev.activeSession,
              currentIndex: nextIdx,
            }
          : null,
      }));
      return;
    }

    // All tasks in session completed!
    const answersList = Object.values(session.answers);
    const rawSessionXp = answersList.reduce((acc, a) => acc + a.xpAwarded, 0);
    const correctCount = answersList.filter(
      (a) => a.outcome === 'correct' || a.outcome === 'partial'
    ).length;
    const totalCount = session.taskIds.length;
    const accuracyPercent =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

    const today = getWarsawPlayerDay();
    const isLesson = session.source === 'lesson';

    let coinsAwarded = 0;
    let xpAwarded = rawSessionXp;
    let isRepeatToday = false;
    let updatedLedger = cur.rewardLedger;
    let streakUpdate = {
      streakDays: cur.streakDays,
      lastCompletedPlayerDay: cur.lastCompletedPlayerDay,
      streakShields: cur.streakShields,
      shieldsConsumed: 0,
      milestoneBonusCoins: 0,
      claimedStreakMilestones: cur.claimedStreakMilestones,
    };

    if (isLesson) {
      const rewardRes = computeCompletionRewards({
        playerDay: today,
        contentId: session.contentId,
        baseCoins: MATH_LESSON_1_1.rewardCoins,
        rawSessionXp,
        rewardLedger: cur.rewardLedger,
      });
      coinsAwarded = rewardRes.coinsAwarded;
      xpAwarded = rewardRes.xpAwarded;
      isRepeatToday = rewardRes.isRepeatToday;
      updatedLedger = rewardRes.updatedLedger;

      const dayRec = recordDayCompletion({
        today,
        lastCompletedPlayerDay: cur.lastCompletedPlayerDay,
        streakDays: cur.streakDays,
        streakShields: cur.streakShields,
        claimedStreakMilestones: cur.claimedStreakMilestones,
      });
      streakUpdate = {
        ...dayRec,
      };
    }

    const totalNewXp = cur.xp + xpAwarded;
    const totalNewCoins =
      cur.coins + coinsAwarded + streakUpdate.milestoneBonusCoins;

    const rankCheck = detectNewRankUp(totalNewXp, cur.achievedRankIds);
    if (rankCheck.newlyUnlockedRank) {
      setTimeout(() => {
        setRankUpModalRank(rankCheck.newlyUnlockedRank);
        playSound('rankUp');
      }, 650);
    } else if (coinsAwarded > 0) {
      playSound('coin');
    }

    const nextChallenges = cur.dailyChallenges.map((ch) => {
      if (isLesson && ch.kind === 'complete_lesson') {
        return { ...ch, current: Math.min(ch.target, ch.current + 1) };
      }
      return ch;
    });

    const completedIds =
      isLesson && !cur.completedLessonIds.includes(session.contentId)
        ? [...cur.completedLessonIds, session.contentId]
        : cur.completedLessonIds;

    setLastSessionSummary({
      source: session.source,
      title: session.title,
      xpEarned: xpAwarded,
      coinsEarned: coinsAwarded,
      accuracyPercent,
      correctCount,
      totalCount,
      isRepeatToday,
      masteredMistakesCount:
        session.source === 'bank' || session.source === 'rescue'
          ? correctCount
          : 0,
      rescueHeartEarned: false,
      streakMilestoneCoins: streakUpdate.milestoneBonusCoins,
    });

    setState((prev) => ({
      ...prev,
      xp: totalNewXp,
      coins: totalNewCoins,
      achievedRankIds: rankCheck.updatedAchievedRankIds,
      streakDays: streakUpdate.streakDays,
      lastCompletedPlayerDay: streakUpdate.lastCompletedPlayerDay,
      streakShields: streakUpdate.streakShields,
      claimedStreakMilestones: streakUpdate.claimedStreakMilestones,
      dailyLessonsCompleted: isLesson
        ? prev.dailyLessonsCompleted + 1
        : prev.dailyLessonsCompleted,
      dailyChallenges: nextChallenges,
      completedLessonIds: completedIds,
      rewardLedger: updatedLedger,
      activeSession: null,
    }));

    setLessonViewStage('summary');
  }, [playSound]);

  const abortActiveSession = useCallback(() => {
    playSound('tap');
    setLessonViewStage('none');
  }, [playSound]);

  const clearSessionSummary = useCallback(() => {
    playSound('tap');
    setLastSessionSummary(null);
    setLessonViewStage('none');
  }, [playSound]);

  const toggleTaskSaved = useCallback(
    (taskId: string, subjectId: SubjectId = 'math') => {
      const cur = stateRef.current;
      const key = `${taskId}:${subjectId}`;
      const nowMs = Date.now();
      const existingIdx = cur.savedTasks.findIndex((s) => s.key === key);

      playSound('bookmark');

      let nextSaved = [...cur.savedTasks];
      let alreadyExisted = false;

      if (existingIdx >= 0) {
        alreadyExisted = true;
        nextSaved[existingIdx] = {
          ...nextSaved[existingIdx],
          savedAt: nowMs,
        };
        nextSaved.sort((a, b) => b.savedAt - a.savedAt);
        pushToast('Już zapisane — zaktualizowano czas zapisu.', 'info');
      } else {
        nextSaved.unshift({
          key,
          taskId,
          subjectId,
          savedAt: nowMs,
        });
        if (nextSaved.length > MAX_VAULT_FIFO_SIZE) {
          nextSaved = nextSaved
            .sort((a, b) => b.savedAt - a.savedAt)
            .slice(0, MAX_VAULT_FIFO_SIZE);
          pushToast(
            'Osiągnięto limit 200 zapisanych zadań — usunięto najstarszy wpis.',
            'info'
          );
        } else {
          pushToast('Zapisano do powtórek!', 'success');
        }
      }

      const nextChallenges = cur.dailyChallenges.map((ch) => {
        if (ch.kind === 'save_task') {
          return { ...ch, current: Math.min(ch.target, ch.current + 1) };
        }
        return ch;
      });

      setState((prev) => ({
        ...prev,
        savedTasks: nextSaved,
        dailyChallenges: nextChallenges,
      }));

      return { saved: true, alreadyExisted };
    },
    [playSound, pushToast]
  );

  const removeSavedTask = useCallback(
    (key: string) => {
      playSound('tap');
      setState((prev) => ({
        ...prev,
        savedTasks: prev.savedTasks.filter((s) => s.key !== key),
      }));
      pushToast('Usunięto zadanie z zapisanych.', 'info');
    },
    [playSound, pushToast]
  );

  const claimDailyChallenge = useCallback(
    (challengeId: string): boolean => {
      const cur = stateRef.current;
      const target = cur.dailyChallenges.find(
        (c) => c.challengeId === challengeId
      );
      if (!target || target.claimed || target.current < target.target) {
        return false;
      }

      // Hard limit: max 45 coins from daily challenges per playerDay (AC-D2)
      const alreadyClaimedCount = cur.dailyChallenges.filter((c) => c.claimed).length;
      if (alreadyClaimedCount >= 3) {
        return false;
      }

      playSound('coin');
      setState((prev) => ({
        ...prev,
        coins: prev.coins + target.rewardCoins,
        dailyChallenges: prev.dailyChallenges.map((c) =>
          c.challengeId === challengeId ? { ...c, claimed: true } : c
        ),
      }));
      pushToast(`Odebrano +${target.rewardCoins} monet za wyzwanie!`, 'success');
      return true;
    },
    [playSound, pushToast]
  );

  const purchaseOrEquipShopItem = useCallback(
    (item: ShopItemDefinition) => {
      const cur = stateRef.current;

      if (item.comingSoon) {
        pushToast(
          'Pakiety Premium będą dostępne w Fazie 2 — w prototypie wszystko zdobywasz za monety z nauki!',
          'info'
        );
        return { ok: false, reason: 'coming_soon' };
      }

      // Booster 1: Streak Shield
      if (item.boosterKind === 'streak_shield') {
        if (cur.streakShields >= MAX_STREAK_SHIELDS) {
          pushToast('Osiągnięto limit 2/2 Tarcz Serii!', 'warning');
          return { ok: false, reason: 'max_shields' };
        }
        if (cur.coins < STREAK_SHIELD_PRICE) {
          const diff = STREAK_SHIELD_PRICE - cur.coins;
          pushToast(
            `Zbierz jeszcze ${diff} monet — nagrody czekają w lekcjach i wyzwaniach`,
            'warning'
          );
          return { ok: false, reason: 'not_enough_coins' };
        }

        playSound('purchase');
        setShieldBurstTick(Date.now());
        setState((prev) => ({
          ...prev,
          coins: Math.max(0, prev.coins - STREAK_SHIELD_PRICE),
          streakShields: Math.min(MAX_STREAK_SHIELDS, prev.streakShields + 1),
        }));
        pushToast('Kupiono Tarczę Serii! Twoja seria jest chroniona.', 'success');
        return { ok: true, action: 'purchased' as const };
      }

      // Booster 2: Heart Refill
      if (item.boosterKind === 'heart_refill') {
        if (cur.hearts >= MAX_HEARTS) {
          pushToast('Masz już pełne serca (5/5)!', 'info');
          return { ok: false, reason: 'hearts_full' };
        }
        if (cur.coins < HEART_REFILL_PRICE) {
          const diff = HEART_REFILL_PRICE - cur.coins;
          pushToast(
            `Zbierz jeszcze ${diff} monet — albo odzyskaj serce za darmo w Misji Ratunkowej!`,
            'warning'
          );
          return { ok: false, reason: 'not_enough_coins' };
        }

        playSound('heartRestore');
        setHeartEventTick({ type: 'restore', tick: Date.now() });
        setState((prev) => {
          const nextH = Math.min(MAX_HEARTS, prev.hearts + 1);
          return {
            ...prev,
            coins: Math.max(0, prev.coins - HEART_REFILL_PRICE),
            hearts: nextH,
            heartRefillAnchorAt:
              nextH >= MAX_HEARTS ? null : prev.heartRefillAnchorAt,
          };
        });
        pushToast('Doładowano +1 Serce!', 'success');
        return { ok: true, action: 'purchased' as const };
      }

      // Cosmetic item: check if already owned
      const isOwned = cur.ownedItemIds.includes(item.id);
      if (isOwned) {
        if (item.slot && item.slotValue) {
          playSound('tap');
          setState((prev) => ({
            ...prev,
            loadout: {
              ...prev.loadout,
              [item.slot!]: item.slotValue,
            },
          }));
          pushToast(`Założono: ${item.name}`, 'success');
        }
        return { ok: true, action: 'equipped' as const };
      }

      if (cur.coins < item.price) {
        const diff = item.price - cur.coins;
        pushToast(
          `Zbierz jeszcze ${diff} monet — nagrody czekają w lekcjach i wyzwaniach`,
          'warning'
        );
        return { ok: false, reason: 'not_enough_coins' };
      }

      playSound('purchase');
      setState((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - item.price),
        ownedItemIds: [...prev.ownedItemIds, item.id],
        loadout:
          item.slot && item.slotValue
            ? {
                ...prev.loadout,
                [item.slot]: item.slotValue,
              }
            : prev.loadout,
      }));
      pushToast(`Kupiono i założono: ${item.name}!`, 'success');
      return { ok: true, action: 'purchased' as const };
    },
    [playSound, pushToast]
  );

  const buyHeartWithCoins = useCallback((): boolean => {
    const cur = stateRef.current;
    if (cur.hearts >= MAX_HEARTS) {
      pushToast('Serca są już pełne (5/5)!', 'info');
      return false;
    }
    if (cur.coins < HEART_REFILL_PRICE) {
      pushToast(
        `Brakuje ${HEART_REFILL_PRICE - cur.coins} monet — skorzystaj z darmowej Misji Ratunkowej!`,
        'warning'
      );
      return false;
    }
    playSound('heartRestore');
    setHeartEventTick({ type: 'restore', tick: Date.now() });
    setState((prev) => {
      const nextH = Math.min(MAX_HEARTS, prev.hearts + 1);
      return {
        ...prev,
        coins: Math.max(0, prev.coins - HEART_REFILL_PRICE),
        hearts: nextH,
        heartRefillAnchorAt:
          nextH >= MAX_HEARTS ? null : prev.heartRefillAnchorAt,
      };
    });
    pushToast('Odzyskano +1 Serce za 80 monet!', 'success');
    return true;
  }, [playSound, pushToast]);

  const completeMiniExam = useCallback(
    (params: {
      answers: Record<
        string,
        {
          userAnswer: string;
          outcome: TaskEvalOutcome;
          pointsEarned: number;
          pointsMax: number;
          xpEarned: number;
        }
      >;
    }): ExamAttemptRecord => {
      const cur = stateRef.current;
      const nowMs = Date.now();
      const today = getWarsawPlayerDay(new Date(nowMs));

      const entries = Object.entries(params.answers);
      let pointsEarned = 0;
      let pointsMax = 0;
      let rawXp = 0;

      let nextMistakeBank = [...cur.mistakeBank];

      for (const [taskId, ans] of entries) {
        pointsEarned += ans.pointsEarned;
        pointsMax += ans.pointsMax;
        rawXp += ans.xpEarned;

        // Only outcome === 'wrong' (0/2 on open, wrong option/number) enters Mistake Bank (AC-X5)
        if (ans.outcome === 'wrong') {
          const task = ALL_TASKS_BY_ID[taskId];
          if (task) {
            const key = `${task.id}:${task.subjectId}`;
            const idx = nextMistakeBank.findIndex((m) => m.key === key);
            if (idx >= 0) {
              nextMistakeBank[idx] = {
                ...nextMistakeBank[idx],
                correctStreak: 0,
                lastMistakeAt: nowMs,
              };
            } else {
              nextMistakeBank.unshift({
                key,
                taskId: task.id,
                subjectId: task.subjectId,
                correctStreak: 0,
                lastMistakeAt: nowMs,
              });
            }
          }
        }
      }

      if (nextMistakeBank.length > MAX_VAULT_FIFO_SIZE) {
        nextMistakeBank = nextMistakeBank
          .sort((a, b) => b.lastMistakeAt - a.lastMistakeAt)
          .slice(0, MAX_VAULT_FIFO_SIZE);
      }

      const scorePercent =
        pointsMax > 0 ? Math.round((pointsEarned / pointsMax) * 100) : 0;

      const rewardRes = computeCompletionRewards({
        playerDay: today,
        contentId: 'mini-exam:default',
        baseCoins: 40,
        rawSessionXp: rawXp,
        rewardLedger: cur.rewardLedger,
      });

      const dayRec = recordDayCompletion({
        today,
        lastCompletedPlayerDay: cur.lastCompletedPlayerDay,
        streakDays: cur.streakDays,
        streakShields: cur.streakShields,
        claimedStreakMilestones: cur.claimedStreakMilestones,
      });

      const totalNewXp = cur.xp + rewardRes.xpAwarded;
      const totalNewCoins =
        cur.coins + rewardRes.coinsAwarded + dayRec.milestoneBonusCoins;

      const rankCheck = detectNewRankUp(totalNewXp, cur.achievedRankIds);
      if (rankCheck.newlyUnlockedRank) {
        setTimeout(() => {
          setRankUpModalRank(rankCheck.newlyUnlockedRank);
          playSound('rankUp');
        }, 700);
      } else {
        playSound('coin');
      }

      const checkedTasksCount = entries.filter(
        ([, a]) => a.userAnswer.trim().length > 0
      ).length;

      const hasOpenSolved = entries.some(([tid, a]) => {
        const t = ALL_TASKS_BY_ID[tid];
        return (
          t?.type === 'open' &&
          (a.outcome === 'correct' || a.outcome === 'partial')
        );
      });

      const nextChallenges = cur.dailyChallenges.map((ch) => {
        if (ch.kind === 'complete_mini_exam') {
          return { ...ch, current: Math.min(ch.target, ch.current + 1) };
        }
        if (ch.kind === 'exam_80_percent' && scorePercent >= 80) {
          return { ...ch, current: Math.min(ch.target, ch.current + 1) };
        }
        if (ch.kind === 'open_task_ai' && hasOpenSolved) {
          return { ...ch, current: Math.min(ch.target, ch.current + 1) };
        }
        return ch;
      });

      const record: ExamAttemptRecord = {
        id: 'exam-' + nowMs,
        completedAt: nowMs,
        playerDay: today,
        subjectId: 'math',
        scorePercent,
        pointsEarned,
        pointsMax,
        xpEarned: rewardRes.xpAwarded,
        coinsEarned: rewardRes.coinsAwarded,
      };

      setState((prev) => ({
        ...prev,
        xp: totalNewXp,
        coins: totalNewCoins,
        achievedRankIds: rankCheck.updatedAchievedRankIds,
        streakDays: dayRec.streakDays,
        lastCompletedPlayerDay: dayRec.lastCompletedPlayerDay,
        streakShields: dayRec.streakShields,
        claimedStreakMilestones: dayRec.claimedStreakMilestones,
        totalTasksSolved: prev.totalTasksSolved + entries.length,
        accuracyPointsEarned: prev.accuracyPointsEarned + pointsEarned,
        accuracyPointsPossible: prev.accuracyPointsPossible + pointsMax,
        dailyTasksChecked: prev.dailyTasksChecked + Math.max(1, checkedTasksCount),
        dailyChallenges: nextChallenges,
        mistakeBank: nextMistakeBank,
        rewardLedger: rewardRes.updatedLedger,
        examHistory: [record, ...prev.examHistory].slice(0, 30),
      }));

      return record;
    },
    [playSound]
  );

  const resetAllLocalProgress = useCallback(() => {
    appStateRepository.clearAll();
    const fresh = createInitialAppState();
    soundEngine.setEnabled(fresh.sfxEnabled);
    setState(fresh);
    setActiveTabState('start');
    setLessonViewStage('none');
    setFormulasOpen(false);
    setRescueModalOpen(false);
    setProductTourOpen(false);
    setRankUpModalRank(null);
    pushToast('Postępy wyczyszczone', 'info');
  }, [pushToast]);

  const dismissRankUpModal = useCallback(() => {
    playSound('tap');
    setRankUpModalRank(null);
  }, [playSound]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      activeTab,
      setActiveTab,
      formulasOpen,
      setFormulasOpen,
      rescueModalOpen,
      setRescueModalOpen,
      productTourOpen,
      setProductTourOpen,
      rankUpModalRank,
      dismissRankUpModal,
      shieldBurstTick,
      heartEventTick,
      lessonViewStage,
      setLessonViewStage,
      lastSessionSummary,
      clearSessionSummary,
      secondsToNextHeart,
      toasts,
      pushToast,
      dismissToast,
      playSound,
      completeOnboarding,
      setSubject,
      setTheme,
      setSfxEnabled,
      updateProfileSettings,
      openLessonTheory,
      startLessonTasks,
      startPracticeSession,
      submitSessionTaskAnswer,
      advanceSessionTaskOrFinish,
      abortActiveSession,
      toggleTaskSaved,
      removeSavedTask,
      claimDailyChallenge,
      purchaseOrEquipShopItem,
      buyHeartWithCoins,
      completeMiniExam,
      resetAllLocalProgress,
    }),
    [
      state,
      activeTab,
      setActiveTab,
      formulasOpen,
      rescueModalOpen,
      productTourOpen,
      rankUpModalRank,
      dismissRankUpModal,
      shieldBurstTick,
      heartEventTick,
      lessonViewStage,
      lastSessionSummary,
      clearSessionSummary,
      secondsToNextHeart,
      toasts,
      pushToast,
      dismissToast,
      playSound,
      completeOnboarding,
      setSubject,
      setTheme,
      setSfxEnabled,
      updateProfileSettings,
      openLessonTheory,
      startLessonTasks,
      startPracticeSession,
      submitSessionTaskAnswer,
      advanceSessionTaskOrFinish,
      abortActiveSession,
      toggleTaskSaved,
      removeSavedTask,
      claimDailyChallenge,
      purchaseOrEquipShopItem,
      buyHeartWithCoins,
      completeMiniExam,
      resetAllLocalProgress,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
