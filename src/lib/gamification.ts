// src/lib/gamification.ts

import {
  DailyChallengeProgress,
  DailyGoalMinutes,
  RankDefinition,
  RankId,
  SessionSource,
  TaskEvalOutcome,
  TaskType,
} from '../types/domain';
import { DAILY_CHALLENGES_POOL } from '../data/dailyChallengesPool';
import { getMissedDaysCount, previousPlayerDay, hashPlayerDay } from './playerDay';

export const MAX_HEARTS = 5;
export const HEART_REFILL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
export const COMBO_TIMEOUT_MS = 90 * 1000; // 90 seconds
export const MAX_STREAK_SHIELDS = 2;
export const STREAK_SHIELD_PRICE = 450;
export const HEART_REFILL_PRICE = 80;
export const MAX_FREE_RESCUE_PER_DAY = 3;
export const MAX_VAULT_FIFO_SIZE = 200;

export const RANKS_E8: RankDefinition[] = [
  { id: 'novice', name: 'Nowicjusz E8', minXp: 0, iconName: 'Sprout' },
  { id: 'scout', name: 'Tropiciel', minXp: 500, iconName: 'Compass' },
  { id: 'tactician', name: 'Taktyk', minXp: 1500, iconName: 'Swords' },
  { id: 'master', name: 'Mistrz E8', minXp: 3500, iconName: 'Crown' },
  { id: 'legend', name: 'Legenda E8', minXp: 7000, iconName: 'Flame' },
];

/**
 * Validates nickname strictly according to Master Spec Section 6.1 & AC-M7:
 * 2-20 characters after trim, letters (including Polish diacritics), digits, space, -, _
 * Rejects < > & " '
 */
export function validateNickname(raw: string): {
  valid: boolean;
  trimmed: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (trimmed.length < 2) {
    return {
      valid: false,
      trimmed,
      error: 'Ksywka musi mieć co najmniej 2 znaki.',
    };
  }
  if (trimmed.length > 20) {
    return {
      valid: false,
      trimmed,
      error: 'Ksywka może mieć maksymalnie 20 znaków.',
    };
  }
  if (/[<>&"']/.test(trimmed)) {
    return {
      valid: false,
      trimmed,
      error: 'Ksywka zawiera niedozwolone znaki specjalne.',
    };
  }
  const allowedPattern = /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ _-]+$/;
  if (!allowedPattern.test(trimmed)) {
    return {
      valid: false,
      trimmed,
      error: 'Dozwolone są tylko litery, cyfry, spacja, myślnik i podkreślenie.',
    };
  }
  return { valid: true, trimmed };
}

/**
 * Combo multiplier determined AFTER incrementing comboCount (including current correct answer).
 * 1-2 -> x1.0
 * 3-4 -> x1.5 (3rd answer gets x1.5!)
 * 5-7 -> x2.0 (5th answer gets x2.0!)
 * 8+  -> x3.0 (8th answer gets x3.0!)
 */
export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 8) return 3.0;
  if (comboCount >= 5) return 2.0;
  if (comboCount >= 3) return 1.5;
  return 1.0;
}

/**
 * Checks if combo has expired (90s without answer in lesson or practice).
 * In exam mode, combo NEVER expires by time (AC-C3).
 */
export function isComboExpired(
  lastAnsweredAt: number | null,
  nowMs: number,
  isExam: boolean
): boolean {
  if (isExam) return false;
  if (lastAnsweredAt === null) return false;
  return nowMs - lastAnsweredAt >= COMBO_TIMEOUT_MS;
}

/**
 * Returns base XP for a task before hints, combo, or session source scaling.
 */
export function getTaskBaseXp(
  type: TaskType,
  outcome: TaskEvalOutcome,
  openScore?: 0 | 1 | 2
): number {
  if (outcome === 'wrong') return 0;
  if (type === 'open') {
    if (openScore === 2 || outcome === 'correct') return 25;
    if (openScore === 1 || outcome === 'partial') return 12;
    return 0;
  }
  if (type === 'numeric') return 15;
  return 10; // abcd | true_false
}

/**
 * Applies AI hint penalty (-33% per hint level: 1 -> 0.67, 2 -> 0.34, 3 -> 0.01, min 1 XP)
 * and combo multiplier, plus practice 50% base XP rule if source is practice.
 * Matches AC-C5, AC-C6, AC-E5.
 */
export function calculateTaskXp(params: {
  type: TaskType;
  outcome: TaskEvalOutcome;
  openScore?: 0 | 1 | 2;
  hintsUsed: number;
  comboCountAfterAnswer: number;
  source?: SessionSource;
}): number {
  const {
    type,
    outcome,
    openScore,
    hintsUsed,
    comboCountAfterAnswer,
    source = 'lesson',
  } = params;

  if (outcome === 'wrong') return 0;

  let baseXp = getTaskBaseXp(type, outcome, openScore);
  if (baseXp <= 0) return 0;

  // Practice sessions (saved, bank, rescue) always use 50% of base XP (AC-E5, 7.5.1)
  if (source === 'saved' || source === 'bank' || source === 'rescue') {
    baseXp = Math.max(1, Math.floor(baseXp * 0.5));
  }

  let adjustedBase = baseXp;
  if (hintsUsed === 1) {
    adjustedBase = Math.max(1, Math.floor(baseXp * 0.67));
  } else if (hintsUsed === 2) {
    adjustedBase = Math.max(1, Math.floor(baseXp * 0.34));
  } else if (hintsUsed >= 3) {
    adjustedBase = Math.max(1, Math.floor(baseXp * 0.01));
  }

  const multiplier = getComboMultiplier(comboCountAfterAnswer);
  return Math.max(1, Math.floor(adjustedBase * multiplier));
}

/**
 * Calculates content completion rewards (coins & session XP scaling) using the rewardLedger
 * (`${playerDay}:${contentId}:coins` and `${playerDay}:${contentId}:xp`).
 * First completion on playerDay: 100% coins, 100% XP.
 * Subsequent completions on same playerDay: 0 coins, 30% XP (Math.floor(xp * 0.3)).
 * Practice sessions always get 0 completion coins and aren't subject to 30% ledger scaling.
 */
export function computeCompletionRewards(params: {
  playerDay: string;
  contentId: string;
  baseCoins: number;
  rawSessionXp: number;
  rewardLedger: Record<string, boolean>;
}): {
  coinsAwarded: number;
  xpAwarded: number;
  isRepeatToday: boolean;
  updatedLedger: Record<string, boolean>;
} {
  const { playerDay, contentId, baseCoins, rawSessionXp, rewardLedger } = params;
  const coinsKey = `${playerDay}:${contentId}:coins`;
  const xpKey = `${playerDay}:${contentId}:xp`;

  const alreadyClaimedToday = Boolean(rewardLedger[coinsKey] || rewardLedger[xpKey]);
  const updatedLedger = {
    ...rewardLedger,
    [coinsKey]: true,
    [xpKey]: true,
  };

  if (alreadyClaimedToday) {
    return {
      coinsAwarded: 0,
      xpAwarded: rawSessionXp > 0 ? Math.floor(rawSessionXp * 0.3) : 0,
      isRepeatToday: true,
      updatedLedger,
    };
  }

  return {
    coinsAwarded: baseCoins,
    xpAwarded: rawSessionXp,
    isRepeatToday: false,
    updatedLedger,
  };
}

/**
 * Offline & real-time heart regeneration with anchor timestamp (AC-H1, AC-H4, AC-H5).
 * When hearts < 5, heartRefillAnchorAt marks when the timer started.
 * Losing another heart while hearts < 5 does NOT reset heartRefillAnchorAt!
 */
export function reconcileHearts(
  hearts: number,
  heartRefillAnchorAt: number | null,
  nowMs: number
): {
  hearts: number;
  heartRefillAnchorAt: number | null;
  restoredCount: number;
} {
  if (hearts >= MAX_HEARTS) {
    return {
      hearts: MAX_HEARTS,
      heartRefillAnchorAt: null,
      restoredCount: 0,
    };
  }

  if (heartRefillAnchorAt === null) {
    return {
      hearts,
      heartRefillAnchorAt: nowMs,
      restoredCount: 0,
    };
  }

  const elapsed = nowMs - heartRefillAnchorAt;
  if (elapsed < HEART_REFILL_INTERVAL_MS) {
    return {
      hearts,
      heartRefillAnchorAt,
      restoredCount: 0,
    };
  }

  const gained = Math.floor(elapsed / HEART_REFILL_INTERVAL_MS);
  const newHearts = Math.min(MAX_HEARTS, hearts + gained);
  const actualRestored = newHearts - hearts;

  if (newHearts >= MAX_HEARTS) {
    return {
      hearts: MAX_HEARTS,
      heartRefillAnchorAt: null,
      restoredCount: actualRestored,
    };
  }

  return {
    hearts: newHearts,
    heartRefillAnchorAt: heartRefillAnchorAt + actualRestored * HEART_REFILL_INTERVAL_MS,
    restoredCount: actualRestored,
  };
}

/**
 * Applies a heart loss (-1) preserving an existing heartRefillAnchorAt if already < 5 (AC-H5).
 */
export function applyHeartLoss(
  currentHearts: number,
  currentAnchor: number | null,
  nowMs: number
): {
  hearts: number;
  heartRefillAnchorAt: number | null;
} {
  const nextHearts = Math.max(0, currentHearts - 1);
  const nextAnchor =
    currentHearts >= MAX_HEARTS ? nowMs : currentAnchor ?? nowMs;
  return {
    hearts: nextHearts,
    heartRefillAnchorAt: nextHearts >= MAX_HEARTS ? null : nextAnchor,
  };
}

/**
 * Reconciles streak and Streak Shields when the user opens the app on `today` (AC-S2..AC-S6).
 * If N >= 1 missed days:
 *  - if streakShields >= N: consumes N shields, keeps streakDays, updates lastCompletedPlayerDay to yesterday so streak remains intact
 *  - if streakShields < N: does NOT consume shields, resets streakDays to 0
 */
export function reconcileStreakOnVisit(params: {
  today: string;
  lastCompletedPlayerDay: string | null;
  streakDays: number;
  streakShields: number;
}): {
  streakDays: number;
  streakShields: number;
  shieldsConsumed: number;
  streakBroken: boolean;
  lastCompletedPlayerDay: string | null;
} {
  const { today, lastCompletedPlayerDay, streakDays, streakShields } = params;
  if (!lastCompletedPlayerDay || streakDays <= 0) {
    return {
      streakDays: 0,
      streakShields,
      shieldsConsumed: 0,
      streakBroken: false,
      lastCompletedPlayerDay,
    };
  }

  const missedDays = getMissedDaysCount(today, lastCompletedPlayerDay);
  if (missedDays <= 0) {
    return {
      streakDays,
      streakShields,
      shieldsConsumed: 0,
      streakBroken: false,
      lastCompletedPlayerDay,
    };
  }

  if (streakShields >= missedDays) {
    return {
      streakDays,
      streakShields: streakShields - missedDays,
      shieldsConsumed: missedDays,
      streakBroken: false,
      lastCompletedPlayerDay: previousPlayerDay(today),
    };
  }

  // Not enough shields -> shields are NOT consumed, streak resets to 0 (AC-S4)
  return {
    streakDays: 0,
    streakShields,
    shieldsConsumed: 0,
    streakBroken: true,
    lastCompletedPlayerDay,
  };
}

/**
 * Marks `today` as completed when a player finishes a Bento lesson or Mini-Exam (7.4, AC-S7).
 * Awards +50 coins once per 7-day multiple (7, 14, 21...).
 */
export function recordDayCompletion(params: {
  today: string;
  lastCompletedPlayerDay: string | null;
  streakDays: number;
  streakShields: number;
  claimedStreakMilestones: string[];
}): {
  streakDays: number;
  lastCompletedPlayerDay: string;
  streakShields: number;
  shieldsConsumed: number;
  milestoneBonusCoins: number;
  claimedStreakMilestones: string[];
} {
  const {
    today,
    lastCompletedPlayerDay,
    streakDays,
    streakShields,
    claimedStreakMilestones,
  } = params;

  if (lastCompletedPlayerDay === today) {
    return {
      streakDays,
      lastCompletedPlayerDay: today,
      streakShields,
      shieldsConsumed: 0,
      milestoneBonusCoins: 0,
      claimedStreakMilestones,
    };
  }

  // First reconcile any missed days if not yet reconciled
  const reconciled = reconcileStreakOnVisit({
    today,
    lastCompletedPlayerDay,
    streakDays,
    streakShields,
  });

  const nextStreak = reconciled.streakDays + 1;
  const milestoneKey = `${nextStreak}:${today}`;
  let milestoneBonusCoins = 0;
  let nextMilestones = claimedStreakMilestones;

  if (
    nextStreak > 0 &&
    nextStreak % 7 === 0 &&
    !claimedStreakMilestones.includes(milestoneKey)
  ) {
    milestoneBonusCoins = 50;
    nextMilestones = [...claimedStreakMilestones, milestoneKey];
  }

  return {
    streakDays: nextStreak,
    lastCompletedPlayerDay: today,
    streakShields: reconciled.streakShields,
    shieldsConsumed: reconciled.shieldsConsumed,
    milestoneBonusCoins,
    claimedStreakMilestones: nextMilestones,
  };
}

/**
 * Deterministically picks 3 daily challenges for a given playerDay (seeded ONLY by playerDay, never subjectId).
 * Matches AC-D1..AC-D4.
 */
export function generateDailyChallengesForDay(
  playerDay: string
): DailyChallengeProgress[] {
  const seed = hashPlayerDay(playerDay);
  const pool = [...DAILY_CHALLENGES_POOL];
  const selected: DailyChallengeProgress[] = [];

  let state = seed || 123456789;
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const idx = Math.abs(state) % pool.length;
    const picked = pool.splice(idx, 1)[0];
    selected.push({
      challengeId: picked.id,
      kind: picked.kind,
      title: picked.title,
      description: picked.description,
      current: 0,
      target: picked.target,
      rewardCoins: picked.rewardCoins,
      claimed: false,
    });
  }

  return selected;
}

/**
 * Computes current rank and checks if any new rank was unlocked (idempotent via achievedRankIds).
 * Matches AC-E7.
 */
export function getRankForXp(xp: number): {
  currentRank: RankDefinition;
  nextRank: RankDefinition | null;
  progressPercent: number;
  xpToNext: number;
} {
  let currentRank = RANKS_E8[0];
  let nextRank: RankDefinition | null = null;

  for (let i = 0; i < RANKS_E8.length; i++) {
    if (xp >= RANKS_E8[i].minXp) {
      currentRank = RANKS_E8[i];
      nextRank = RANKS_E8[i + 1] ?? null;
    }
  }

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpToNext: 0,
    };
  }

  const span = nextRank.minXp - currentRank.minXp;
  const into = xp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((into / span) * 100)));

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpToNext: Math.max(0, nextRank.minXp - xp),
  };
}

export function detectNewRankUp(
  xp: number,
  achievedRankIds: RankId[]
): {
  newlyUnlockedRank: RankDefinition | null;
  updatedAchievedRankIds: RankId[];
} {
  let newlyUnlockedRank: RankDefinition | null = null;
  const updated = new Set<RankId>(achievedRankIds);
  updated.add('novice');

  for (const rank of RANKS_E8) {
    if (xp >= rank.minXp && !updated.has(rank.id)) {
      updated.add(rank.id);
      newlyUnlockedRank = rank;
    }
  }

  return {
    newlyUnlockedRank,
    updatedAchievedRankIds: Array.from(updated),
  };
}

/**
 * Computes the single Daily Goal percentage and caption from lessons or tasks (Section 6.3).
 * 5 min -> 1 lesson OR 5 tasks
 * 10 min -> 2 lessons OR 10 tasks
 * 15 min -> 3 lessons OR 15 tasks
 */
export function computeDailyGoalProgress(params: {
  dailyGoalMinutes: DailyGoalMinutes;
  dailyLessonsCompleted: number;
  dailyTasksChecked: number;
}): {
  percent: number;
  caption: string;
  targetLessons: number;
  targetTasks: number;
} {
  const { dailyGoalMinutes, dailyLessonsCompleted, dailyTasksChecked } = params;
  const targetLessons = dailyGoalMinutes === 5 ? 1 : dailyGoalMinutes === 10 ? 2 : 3;
  const targetTasks = dailyGoalMinutes === 5 ? 5 : dailyGoalMinutes === 10 ? 10 : 15;

  const lessonPct = Math.min(100, Math.round((dailyLessonsCompleted / targetLessons) * 100));
  const taskPct = Math.min(100, Math.round((dailyTasksChecked / targetTasks) * 100));

  if (lessonPct >= taskPct && dailyLessonsCompleted > 0) {
    return {
      percent: lessonPct,
      caption: `${Math.min(dailyLessonsCompleted, targetLessons)} z ${targetLessons} lekcji`,
      targetLessons,
      targetTasks,
    };
  }

  return {
    percent: Math.max(lessonPct, taskPct),
    caption: `${Math.min(dailyTasksChecked, targetTasks)} z ${targetTasks} zadań`,
    targetLessons,
    targetTasks,
  };
}
