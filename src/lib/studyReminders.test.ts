import test from 'node:test';
import assert from 'node:assert/strict';
import { getReminderDay, parseStudyReminder } from './studyReminders';

test('Harmonogram dopuszcza wyłącznie poprawną godzinę i unikalne dni', () => {
  assert.deepEqual(parseStudyReminder({ time: '07:30', days: [7, 2] }), { time: '07:30', days: [2, 7] });
  for (const invalid of [
    { time: '24:00', days: [1] },
    { time: '07:30', days: [] },
    { time: '07:30', days: [1, 1] },
    { time: '07:30', days: [0] },
    { time: '07:30', days: ['1'] },
    { time: '07:30', days: [2], uid: 'inne-konto' },
  ]) assert.equal(parseStudyReminder(invalid), null);
});

test('Przypomnienia zachowują porę w Warszawie przy zmianie czasu', () => {
  const schedule = { time: '16:30', days: [7] };
  assert.equal(getReminderDay(schedule, new Date('2026-03-29T14:30:00Z')), '2026-03-29');
  assert.equal(getReminderDay(schedule, new Date('2026-10-25T15:30:00Z')), '2026-10-25');
  assert.equal(getReminderDay(schedule, new Date('2026-10-25T15:29:59Z')), null);
  assert.equal(getReminderDay(schedule, new Date('2026-10-25T16:00:00Z')), null);
  assert.equal(getReminderDay(schedule, new Date('2026-10-26T15:30:00Z')), null);
});
