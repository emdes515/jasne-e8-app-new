// src/lib/playerDay.ts

/**
 * Computes YYYY-MM-DD strictly in Europe/Warsaw timezone using Intl.DateTimeFormat(...).formatToParts()
 * as mandated by Master Spec Section 7.4 and AC-S1.
 */
const warsawDayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getWarsawPlayerDay(date: Date = new Date()): string {
  const parts = warsawDayFormatter.formatToParts(date);
  let year = '2026';
  let month = '01';
  let day = '01';
  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Converts a YYYY-MM-DD string into an integer UTC day index immune to DST transitions.
 * Never divides raw timestamp differences by 86_400_000 (AC-S5, AC-S6).
 */
export function playerDayToIndex(playerDay: string): number {
  const [y, m, d] = playerDay.split('-').map(Number);
  if (!y || !m || !d) return 0;
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Returns the exact calendar difference in days between two YYYY-MM-DD strings.
 * E.g. 2026-03-28 to 2026-03-30 -> 2 (which means N = 1 full missed day).
 */
export function previousPlayerDay(playerDay: string): string {
  return new Date((playerDayToIndex(playerDay) - 1) * 86_400_000).toISOString().slice(0, 10);
}

export function diffPlayerDays(laterDay: string, earlierDay: string): number {
  return playerDayToIndex(laterDay) - playerDayToIndex(earlierDay);
}

/**
 * Returns the number of full missed days N between lastCompletedDay and today.
 * If today === lastCompletedDay -> -1 (already completed today)
 * If today is the very next day -> 0 (0 missed days)
 * If 1 calendar day was skipped -> 1 (1 missed day)
 */
export function getMissedDaysCount(today: string, lastCompletedDay: string | null): number {
  if (!lastCompletedDay) return 0;
  const diff = diffPlayerDays(today, lastCompletedDay);
  if (diff <= 0) return -1;
  return diff - 1;
}

/**
 * Deterministic string hash for seeding daily challenges from playerDay ONLY (never subjectId).
 */
export function hashPlayerDay(playerDay: string): number {
  let hash = 2166136261;
  for (let i = 0; i < playerDay.length; i++) {
    hash ^= playerDay.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
