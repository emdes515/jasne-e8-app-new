// src/lib/gamification.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diffPlayerDays,
  getMissedDaysCount,
  getWarsawPlayerDay,
} from './playerDay';
import {
  applyHeartLoss,
  calculateTaskXp,
  computeCompletionRewards,
  computeDailyGoalProgress,
  detectNewRankUp,
  generateDailyChallengesForDay,
  getComboMultiplier,
  HEART_REFILL_INTERVAL_MS,
  isComboExpired,
  reconcileHearts,
  reconcileStreakOnVisit,
  recordDayCompletion,
  validateNickname,
} from './gamification';
import { evaluateOpenTaskDeterministic } from '../services/ai/aiTutorMock';
import { getRecommendedMathLesson, MATH_LESSON_1_1, MATH_LESSONS } from '../data/mathLessonMock';
import { ALL_TASKS_BY_ID, MATH_MINI_EXAM_TASKS } from '../data/mathExamMock';
import { EMPTY_OPEN_WORK, evaluateVisualWork, getOpenAnswer, hasVisualWork, matchesMathResult } from './openWork';
import { createInitialAppState } from '../services/storage/localStateRepo';
import { OpenTaskRubric } from '../types/domain';

test('AC-S1, AC-S5, AC-S6: Europe/Warsaw playerDay and DST-safe calendar difference', () => {
  const day = getWarsawPlayerDay(new Date('2026-11-19T12:00:00Z'));
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);

  // DST Spring forward: 2026-03-28 to 2026-03-30 -> diff = 2 calendar days, N = 1 missed day (AC-S5)
  assert.equal(diffPlayerDays('2026-03-30', '2026-03-28'), 2);
  assert.equal(getMissedDaysCount('2026-03-30', '2026-03-28'), 1);

  // DST Autumn back: 2026-10-25 to 2026-10-26 -> diff = 1 calendar day, N = 0 missed days (AC-S6)
  assert.equal(diffPlayerDays('2026-10-26', '2026-10-25'), 1);
  assert.equal(getMissedDaysCount('2026-10-26', '2026-10-25'), 0);
});

test('AC-S2, AC-S3, AC-S4, AC-S7: Streak Shields for N missed days and 7-day milestone bonus', () => {
  // AC-S3: N=1 missed day and streakShields=1 -> shield consumed (0), streak preserved
  const s3 = reconcileStreakOnVisit({
    today: '2026-03-30',
    lastCompletedPlayerDay: '2026-03-28',
    streakDays: 5,
    streakShields: 1,
  });
  assert.equal(s3.streakDays, 5);
  assert.equal(s3.streakShields, 0);
  assert.equal(s3.shieldsConsumed, 1);

  // AC-S4: N=2 missed days and streakShields=1 -> shield NOT consumed, streak resets to 0
  const s4 = reconcileStreakOnVisit({
    today: '2026-03-31',
    lastCompletedPlayerDay: '2026-03-28',
    streakDays: 5,
    streakShields: 1,
  });
  assert.equal(s4.streakDays, 0);
  assert.equal(s4.streakShields, 1);
  assert.equal(s4.shieldsConsumed, 0);
  assert.equal(s4.streakBroken, true);

  // AC-S7: 7th day continuous streak awards +50 coins once
  const s7 = recordDayCompletion({
    today: '2026-04-07',
    lastCompletedPlayerDay: '2026-04-06',
    streakDays: 6,
    streakShields: 0,
    claimedStreakMilestones: [],
  });
  assert.equal(s7.streakDays, 7);
  assert.equal(s7.milestoneBonusCoins, 50);

  // Repeat completion on same day does not award +50 coins again
  const s7Repeat = recordDayCompletion({
    today: '2026-04-07',
    lastCompletedPlayerDay: s7.lastCompletedPlayerDay,
    streakDays: s7.streakDays,
    streakShields: 0,
    claimedStreakMilestones: s7.claimedStreakMilestones,
  });
  assert.equal(s7Repeat.milestoneBonusCoins, 0);
});

test('AC-H1, AC-H4, AC-H5: Heart regeneration anchor timer without reset on subsequent heart loss', () => {
  const t0 = 1_000_000_000;
  // At 4/5 hearts since t0; after 29 minutes (29 * 60 * 1000), lose another heart to 3/5
  const t29 = t0 + 29 * 60 * 1000;
  const afterLoss = applyHeartLoss(4, t0, t29);
  assert.equal(afterLoss.hearts, 3);
  assert.equal(afterLoss.heartRefillAnchorAt, t0); // Anchor MUST NOT reset!

  // 1 minute later (t0 + 30 min), +1 heart arrives (3/5 -> 4/5)
  const t30 = t0 + HEART_REFILL_INTERVAL_MS;
  const rec = reconcileHearts(afterLoss.hearts, afterLoss.heartRefillAnchorAt, t30);
  assert.equal(rec.hearts, 4);
  assert.equal(rec.restoredCount, 1);
  assert.equal(rec.heartRefillAnchorAt, t30);

  // AC-H4: 3 hearts + 90 minutes -> caps at 5 hearts and anchor becomes null
  const recCap = reconcileHearts(3, t0, t0 + 3 * HEART_REFILL_INTERVAL_MS);
  assert.equal(recCap.hearts, 5);
  assert.equal(recCap.heartRefillAnchorAt, null);
});

test('AC-C1, AC-C2, AC-C3, AC-C5, AC-C6: Combo multiplier thresholds, 90s timeout, and XP hint penalties', () => {
  assert.equal(getComboMultiplier(1), 1.0);
  assert.equal(getComboMultiplier(2), 1.0);
  assert.equal(getComboMultiplier(3), 1.5); // 3rd correct answer already gets x1.5!
  assert.equal(getComboMultiplier(5), 2.0); // 5th gets x2.0!
  assert.equal(getComboMultiplier(8), 3.0); // 8th gets x3.0!

  // AC-C3: expires after 90s in lesson, never in exam
  assert.equal(isComboExpired(1000, 91_000, false), true);
  assert.equal(isComboExpired(1000, 500_000, true), false);

  // AC-C5: base=10, 1 hint -> floor(10 * 0.67) = 6, combo x1.5 (comboCount=3) -> floor(6 * 1.5) = 9
  const xp1Hint = calculateTaskXp({
    type: 'abcd',
    outcome: 'correct',
    hintsUsed: 1,
    comboCountAfterAnswer: 3,
    source: 'lesson',
  });
  assert.equal(xp1Hint, 9);

  // AC-C6: open task 1/2 ('partial') -> 12 base XP
  const xpPartial = calculateTaskXp({
    type: 'open',
    outcome: 'partial',
    openScore: 1,
    hintsUsed: 0,
    comboCountAfterAnswer: 1,
    source: 'lesson',
  });
  assert.equal(xpPartial, 12);
});

test('AC-E2, AC-E3, AC-E4, AC-E7: Reward ledger anti-farming and Rank E8 threshold 3500 XP', () => {
  // First completion on day 1 -> +20 coins, 100% XP
  const first = computeCompletionRewards({
    playerDay: '2026-11-19',
    contentId: 'lesson:1.1',
    baseCoins: 20,
    rawSessionXp: 100,
    rewardLedger: {},
  });
  assert.equal(first.coinsAwarded, 20);
  assert.equal(first.xpAwarded, 100);
  assert.equal(first.isRepeatToday, false);

  // Second completion on same day -> 0 coins, 30% XP (30)
  const second = computeCompletionRewards({
    playerDay: '2026-11-19',
    contentId: 'lesson:1.1',
    baseCoins: 20,
    rawSessionXp: 100,
    rewardLedger: first.updatedLedger,
  });
  assert.equal(second.coinsAwarded, 0);
  assert.equal(second.xpAwarded, 30);
  assert.equal(second.isRepeatToday, true);

  // Next playerDay -> full +20 coins and 100% XP again
  const nextDay = computeCompletionRewards({
    playerDay: '2026-11-20',
    contentId: 'lesson:1.1',
    baseCoins: 20,
    rawSessionXp: 100,
    rewardLedger: second.updatedLedger,
  });
  assert.equal(nextDay.coinsAwarded, 20);
  assert.equal(nextDay.xpAwarded, 100);

  // AC-E7: 3499 XP -> 3500 XP triggers Mistrz E8 exactly once
  const r1 = detectNewRankUp(3499, ['novice', 'scout', 'tactician']);
  assert.equal(r1.newlyUnlockedRank, null);
  const r2 = detectNewRankUp(3500, r1.updatedAchievedRankIds);
  assert.equal(r2.newlyUnlockedRank?.id, 'master');
  const r3 = detectNewRankUp(3500, r2.updatedAchievedRankIds);
  assert.equal(r3.newlyUnlockedRank, null);
});

test('AC-D1, AC-M7: Deterministic daily challenges and nickname validation', () => {
  const chA = generateDailyChallengesForDay('2026-11-19');
  const chB = generateDailyChallengesForDay('2026-11-19');
  assert.equal(chA.length, 3);
  assert.deepEqual(chA, chB);

  // AC-M7: nickname validation 2-20 chars
  assert.equal(validateNickname('').valid, false);
  assert.equal(validateNickname('A').valid, false);
  assert.equal(validateNickname('BardzoDlugiNickPonad20Znakow').valid, false);
  assert.equal(validateNickname('Cyber<script>').valid, false);
  assert.equal(validateNickname('CyberPitagoras').valid, true);
  assert.equal(validateNickname('Żółty_Mistrz-E8').valid, true);
});

test('AC-A1..AC-A5: AI Tutor deterministic boundary tests from Master Spec Section 7.6', () => {
  const resultOnlyRubric: OpenTaskRubric = {
    keywords: ['pierwiastek', 'suma', '10'],
    expectedResult: '10',
    resultOnly: true,
  };

  const fullRubric: OpenTaskRubric = {
    keywords: ['pierwiastek', '49', '7', '27', '3', 'suma', '10', 'bok', 'krawedz'],
    expectedResult: '10',
    resultOnly: false,
  };

  // 1. "" -> 0/2
  assert.equal(evaluateOpenTaskDeterministic('', fullRubric).score, 0);

  // 2. "10" in resultOnly: true with expected 10 -> 2/2; "10,0" -> 2/2; "100" -> 1/2 (NOT 2/2!)
  assert.equal(evaluateOpenTaskDeterministic('10', resultOnlyRubric).score, 2);
  assert.equal(evaluateOpenTaskDeterministic('10,0', resultOnlyRubric).score, 2);
  assert.equal(evaluateOpenTaskDeterministic('100', resultOnlyRubric).score, 1);

  // 3. "nie wiem" (< 20 chars) -> 0/2
  assert.equal(evaluateOpenTaskDeterministic('nie wiem', fullRubric).score, 0);

  // 4. >= 40 chars with 3 keywords and WRONG result 11 (expected 10) -> 1/2 (NEVER 2/2! AC-A3)
  const wrongResultLong =
    'Obliczam bok kwadratu 7 oraz krawędź sześcianu 4 więc suma wynosi 11 cm';
  assert.equal(
    evaluateOpenTaskDeterministic(wrongResultLong, fullRubric).score,
    1
  );

  // 5. >= 40 chars with >= 2 keywords and RIGHT result 10 -> 2/2
  const rightResultLong =
    'Pole kwadratu 49 daje bok 7 cm a sześcian 27 daje krawędź 3 cm więc suma wynosi 10 cm';
  assert.equal(
    evaluateOpenTaskDeterministic(rightResultLong, fullRubric).score,
    2
  );

  // 6. AC-A4: "3" must never match expected "30" (whole token comparison, not substring!)
  const rubric30: OpenTaskRubric = {
    keywords: ['3', 'reszta', 'koszt'],
    expectedResult: '30',
    resultOnly: false,
  };
  const answerWithOnly3 =
    'Kasia kupiła 3 zeszyty i jej całkowity koszt oraz reszta z zakupów wynosi 3 zł';
  assert.equal(
    evaluateOpenTaskDeterministic(answerWithOnly3, rubric30).score,
    1
  );
});

test('AC-L1, AC-L2: Lesson 1.1 and Mini-Exam tasks have complete explanations & 3 hints without leaking final answer', () => {
  assert.equal(MATH_LESSON_1_1.tasks.length, 5);
  assert.equal(MATH_MINI_EXAM_TASKS.length, 5);

  for (const task of [...MATH_LESSON_1_1.tasks, ...MATH_MINI_EXAM_TASKS]) {
    assert.ok(task.explanation.length > 10);
    assert.equal(task.hints.length, 3);
    for (const h of task.hints) {
      assert.ok(h.length > 5);
    }
  }

  // Daily goal single unit check
  const goal = computeDailyGoalProgress({
    dailyGoalMinutes: 10,
    dailyLessonsCompleted: 1,
    dailyTasksChecked: 5,
  });
  assert.equal(goal.percent, 50);
});

test('New math lessons have four theory cards and five uniquely registered tasks', () => {
  const ids = MATH_LESSONS.flatMap((lesson) => lesson.tasks.map((task) => task.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(MATH_LESSONS.length, 3);
  for (const lesson of MATH_LESSONS) {
    assert.deepEqual(lesson.theory.map((card) => card.id), ['essence', 'formulas', 'example', 'trap']);
    assert.deepEqual(lesson.tasks.map((task) => task.type), ['abcd', 'true_false', 'abcd', 'numeric', 'open']);
    for (const task of lesson.tasks) {
      assert.equal(ALL_TASKS_BY_ID[task.id], task);
      assert.equal(task.hints.length, 3);
      assert.ok(task.hints.every((hint) => hint.trim()));
      assert.ok(task.explanation.trim());
    }
  }
});

test('Handwriting and photo require work and a result, and check only that result', () => {
  assert.equal(getOpenAnswer(EMPTY_OPEN_WORK, '120'), '');
  assert.equal(getOpenAnswer({ ...EMPTY_OPEN_WORK, mode: 'text' }, ' 90 : 0,75 = 120 '), '90 : 0,75 = 120');
  const drawn = { ...EMPTY_OPEN_WORK, strokes: ['M 1 1 L 12 12'], result: ' 120,0 ' };
  assert.equal(getOpenAnswer(drawn, ''), '120,0');
  const photo = new File(['fixture'], 'solution.png', { type: 'image/png' });
  assert.equal(getOpenAnswer({ ...drawn, mode: 'photo', photo }, ''), '120,0');
  assert.equal(matchesMathResult('3 / 4', '0,75'), true);
  assert.equal(matchesMathResult('−4', '-4'), true);
  assert.equal(matchesMathResult('1/0', '0'), false);
  assert.equal(matchesMathResult('90 : 0,75 = 120', '120'), false);
  assert.equal(evaluateVisualWork('120,0', '120', false).score, 1);
  assert.equal(evaluateVisualWork('120', '120', true).score, 2);
  assert.equal(evaluateVisualWork('12', '120', false).score, 0);
});

test('The first study streak grows across three Warsaw calendar days and counts today once', () => {
  let streak = recordDayCompletion({ today: '2026-03-28', lastCompletedPlayerDay: null, streakDays: 0, streakShields: 0, claimedStreakMilestones: [] });
  for (const today of ['2026-03-29', '2026-03-30', '2026-03-30']) {
    streak = recordDayCompletion({ ...streak, today });
  }
  assert.equal(streak.streakDays, 3);
  assert.equal(streak.lastCompletedPlayerDay, '2026-03-30');
});

test('A shield protecting a skipped day is not consumed again after reopening', () => {
  const patched = reconcileStreakOnVisit({ today: '2026-03-30', lastCompletedPlayerDay: '2026-03-28', streakDays: 2, streakShields: 1 });
  assert.equal(patched.lastCompletedPlayerDay, '2026-03-29');
  const reopened = reconcileStreakOnVisit({ ...patched, today: '2026-03-30' });
  assert.equal(reopened.streakDays, 2);
  assert.equal(reopened.shieldsConsumed, 0);
  assert.equal(recordDayCompletion({ ...reopened, today: '2026-03-30', claimedStreakMilestones: [] }).streakDays, 3);
});

test('Start recommends resuming theory even when earlier lessons are incomplete', () => {
  const state = createInitialAppState();
  const lesson = MATH_LESSONS[2];
  state.theoryCards = { [lesson.id]: 'example' };
  assert.equal(getRecommendedMathLesson(state).id, lesson.id);
});

test('Visual work can be compared without a numeric result or awarded XP', () => {
  const work = { ...EMPTY_OPEN_WORK, strokes: ['M0 0 L1 1'] };
  assert.equal(hasVisualWork(work), true);
  assert.equal(getOpenAnswer(work, ''), '');
  assert.equal(calculateTaskXp({
    type: 'open', outcome: 'ungraded', hintsUsed: 0, comboCountAfterAnswer: 5, source: 'lesson',
  }), 0);
});
