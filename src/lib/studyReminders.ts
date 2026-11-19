import type { StudyReminder } from '../types/domain';
import { getWarsawPlayerDay } from './playerDay';

export const STUDY_REMINDER_TIMEZONE = 'Europe/Warsaw';
export const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'] as const;
export const DEFAULT_STUDY_REMINDER: StudyReminder = { time: '16:30', days: [1, 2, 3, 4, 5] };

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: STUDY_REMINDER_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function parseStudyReminder(value: unknown): StudyReminder | null {
  if (typeof value !== 'object' || value === null) return null;
  const { time, days } = value as Partial<StudyReminder>;
  if (Object.keys(value).length !== 2 ||
      typeof time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !Array.isArray(days) || days.length < 1 || days.length > 7 ||
      !days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7) ||
      new Set(days).size !== days.length) return null;
  return { time, days: [...days].sort((a, b) => a - b) };
}

export function getReminderDay(schedule: StudyReminder, now: Date): string | null {
  const day = getWarsawPlayerDay(now);
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay() || 7;
  if (!schedule.days.includes(weekday)) return null;
  const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const elapsed = minutes(timeFormatter.format(now)) - minutes(schedule.time);
  return elapsed >= 0 && elapsed < 30 ? day : null;
}
