// src/types/domain.ts

export type SubjectId = 'math' | 'polish' | 'english';

export type NavTabId = 'start' | 'learn' | 'vault' | 'exam' | 'ranking' | 'profile';

export type ThemeMode = 'dark' | 'light';

export type StudyStageId = 'grade8' | 'grade7' | 'revision';

export type DailyGoalMinutes = 5 | 10 | 15;

export type OnboardingAudience = 'student' | 'guardian';

export interface StudyReminder {
  time: string;
  days: number[];
}

export type LumiMood =
  | 'idle'
  | 'happy'
  | 'celebrate'
  | 'thinking'
  | 'surprised'
  | 'supportive'
  | 'focused'
  | 'cool';

export type LumiColorSchemeId =
  | 'gold_spark'
  | 'blue_wave'
  | 'emerald_pulse'
  | 'ice_crystal'
  | 'crimson_comet';

export type LumiHeadgearId =
  | 'none'
  | 'gaming_headphones'
  | 'street_cap'
  | 'master_crown';

export type LumiEyewearId =
  | 'none'
  | 'pixel_glasses'
  | 'cyber_goggles';

export type LumiAuraId =
  | 'none'
  | 'plasma_ring';

export type ProfileFrameId =
  | 'default_frame'
  | 'emerald_impulse_frame'
  | 'gold_ring_frame'
  | 'cyber_plasma_frame';

export type PlayerTitleId =
  | 'novice_title'
  | 'fraction_slayer'
  | 'night_owl'
  | 'cke_sniper'
  | 'pythagoras_lord';

export interface LumiLoadout {
  colorScheme: LumiColorSchemeId;
  headgear: LumiHeadgearId;
  eyewear: LumiEyewearId;
  aura: LumiAuraId;
  profileFrame: ProfileFrameId;
  playerTitle: PlayerTitleId;
}

export type TaskType = 'abcd' | 'true_false' | 'numeric' | 'open';

export type TaskEvalOutcome = 'correct' | 'partial' | 'wrong' | 'ungraded';

export interface TaskOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'TRUE' | 'FALSE'
  label: string;
}

export interface OpenTaskRubric {
  keywords: string[];
  expectedResult: string;
  resultOnly: boolean;
}

export interface TaskDefinition {
  id: string;
  subjectId: SubjectId;
  type: TaskType;
  topicTag: string;
  prompt: string;
  options?: TaskOption[];
  correctAnswer: string; // option id for abcd/true_false, numeric string for numeric, expectedResult for open
  rubric?: OpenTaskRubric;
  explanation: string;
  explanationSteps?: string[];
  ckeTrapNote?: string;
  goldenHabit?: string;
  hints: [string, string, string]; // 3 levels, never containing the final answer
}

export interface BentoTheoryCard {
  id: 'essence' | 'formulas' | 'example' | 'trap';
  title: string;
  subtitle: string;
  bullets?: string[];
  formulas?: Array<{
    name: string;
    latex: string;
    whenToUse: string;
  }>;
  steps?: Array<{
    stepNumber: number;
    title: string;
    content: string;
    equations?: string[];
  }>;
  trap?: {
    wrongTitle: string;
    wrongMath: string;
    wrongNote: string;
    rightTitle: string;
    rightMath: string;
    rightNote: string;
  };
}

export interface LessonDefinition {
  id: string; // e.g. 'lesson:1.1'
  nodeNumber: string; // '1.1'
  subjectId: SubjectId;
  chapterNumber: number;
  chapterTitle: string;
  title: string;
  subtitle: string;
  rewardCoins: number;
  theory: BentoTheoryCard[];
  tasks: TaskDefinition[];
}

export interface SavedTaskEntry {
  key: string; // `${taskId}:${subjectId}`
  taskId: string;
  subjectId: SubjectId;
  savedAt: number;
}

export interface MistakeBankEntry {
  key: string; // `${taskId}:${subjectId}`
  taskId: string;
  subjectId: SubjectId;
  correctStreak: number; // 0 or 1; at 2 removed
  lastMistakeAt: number;
}

export type SessionSource = 'lesson' | 'saved' | 'bank' | 'rescue';

export interface ActiveTaskSession {
  sessionId: string;
  source: SessionSource;
  contentId: string; // e.g. 'lesson:1.1' or 'practice:saved'
  reviewLessonId?: string;
  subjectId: SubjectId;
  title: string;
  taskIds: string[];
  currentIndex: number;
  draft?: {
    taskId: string;
    value: string;
    hintsUsed: number;
    work?: { mode: 'draw' | 'photo' | 'text'; strokes: string[]; result: string };
  };
  answers: Record<
    string,
    {
      userAnswer: string;
      outcome: TaskEvalOutcome;
      xpAwarded: number;
      hintsUsed: number;
      aiScore?: 0 | 1 | 2;
      aiFeedback?: string;
      reviewRequested?: boolean;
      matchedKeywords?: string[];
    }
  >;
  comboCount: number;
  lastAnsweredAt: number | null;
  interruptedByZeroHearts: boolean;
}

export interface ExamAttemptRecord {
  id: string;
  completedAt: number;
  playerDay: string;
  subjectId: SubjectId;
  scorePercent: number;
  pointsEarned: number;
  pointsMax: number;
  xpEarned: number;
  coinsEarned: number;
}

export type DailyChallengeKind =
  | 'complete_lesson'
  | 'sprint_5_in_row'
  | 'save_task'
  | 'open_task_ai'
  | 'complete_mini_exam'
  | 'exam_80_percent'
  | 'practice_3_tasks';

export interface DailyChallengeDefinition {
  id: string;
  kind: DailyChallengeKind;
  title: string;
  description: string;
  target: number;
  rewardCoins: number; // 15
}

export interface DailyChallengeProgress {
  challengeId: string;
  kind: DailyChallengeKind;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCoins: number;
  claimed: boolean;
}

export type ShopCategory = 'mascot' | 'profile' | 'boosters' | 'premium';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItemDefinition {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  rarity: ItemRarity;
  slot?: keyof LumiLoadout;
  slotValue?: string;
  boosterKind?: 'streak_shield' | 'heart_refill';
  comingSoon?: boolean;
  pricePLN?: string;
}

export type RankId = 'novice' | 'scout' | 'tactician' | 'master' | 'legend';

export interface RankDefinition {
  id: RankId;
  name: string;
  minXp: number;
  iconName: string;
}

export interface AppState {
  schemaVersion: 1;
  accountMode: 'guest';
  guestId: string;
  onboardingCompleted: boolean;
  onboardingAudience?: OnboardingAudience;
  studyReminder?: StudyReminder | null;
  nickname: string;
  studyStage: StudyStageId;
  activeSubject: SubjectId;
  dailyGoalMinutes: DailyGoalMinutes;
  theme: ThemeMode;
  sfxEnabled: boolean;

  // Economy & Gamification
  coins: number;
  xp: number;
  achievedRankIds: RankId[];
  hearts: number;
  heartRefillAnchorAt: number | null;
  streakDays: number;
  lastCompletedPlayerDay: string | null;
  streakShields: number;
  claimedStreakMilestones: string[]; // `${streakMilestone}:${playerDay}`

  // Stats (excluding practice sessions for accuracy)
  totalTasksSolved: number;
  accuracyPointsEarned: number;
  accuracyPointsPossible: number;
  bestCombo: number;
  completedLessonIds: string[];

  // Daily tracking per playerDay
  currentPlayerDay: string;
  dailyLessonsCompleted: number;
  dailyTasksChecked: number;
  dailyChallenges: DailyChallengeProgress[];
  rescueMissionsCompletedToday: number;
  rescueMissionCurrentProgress: number; // 0 or 1 (/2)
  rescueMissionCountedTaskIds: string[]; // deduplicate within current rescue mission

  // Reward ledger: `${playerDay}:${contentId}:${rewardKind}` -> true
  rewardLedger: Record<string, boolean>;

  // Vault
  savedTasks: SavedTaskEntry[];
  mistakeBank: MistakeBankEntry[];

  // Active Lesson / Practice session (survives F5)
  activeSession: ActiveTaskSession | null;
  pausedLessonSession?: ActiveTaskSession;
  pausedLessons?: Record<string, ActiveTaskSession>;
  theoryCards?: Record<string, BentoTheoryCard['id']>;
  openTheory?: { lessonId: string; review: boolean };
  taskSessionPaused?: boolean;
  lessonReviewTasks?: Record<string, string[]>;

  // Exam history
  examHistory: ExamAttemptRecord[];

  // Cosmetics & Shop
  ownedItemIds: string[];
  loadout: LumiLoadout;
}
