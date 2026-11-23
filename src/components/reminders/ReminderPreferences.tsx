'use client';

import { useId } from 'react';
import { Bell, Check, Clock3 } from 'lucide-react';
import { DEFAULT_STUDY_REMINDER, parseStudyReminder, WEEKDAYS } from '../../lib/studyReminders';
import type { StudyReminder } from '../../types/domain';

const PRESETS = [
  { label: 'Rano', time: '07:30' },
  { label: 'Po szkole', time: '16:30' },
  { label: 'Wieczorem', time: '19:00' },
];

export function ReminderPreferences({
  value,
  onChange,
}: {
  value: StudyReminder | null;
  onChange: (value: StudyReminder | null) => void;
}) {
  const id = useId();
  const enabled = value !== null;

  return (
    <div className="space-y-3">
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5">
        <Bell size={18} className="shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
        <span className="flex-1 text-sm font-bold">Przypomnienia o nauce</span>
        <input
          type="checkbox"
          className="size-5 shrink-0 cursor-pointer accent-[var(--accent-primary)]"
          checked={enabled}
          onChange={(event) => onChange(event.target.checked ? DEFAULT_STUDY_REMINDER : null)}
        />
      </label>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        Przypomnienie pojawia się wyłącznie w otwartej, widocznej aplikacji (bez powiadomień w tle). Możesz je wyłączyć w ustawieniach.
      </p>

      {value && (
        <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-3 sm:p-4">
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Pora nauki</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map(({ label, time }) => (
                <button
                  key={time}
                  type="button"
                  aria-pressed={value.time === time}
                  onClick={() => onChange({ ...value, time })}
                  className="min-h-12 rounded-lg border border-[var(--border-subtle)] px-1.5 py-2 text-xs font-bold hover:bg-[var(--bg-elevated)] aria-pressed:border-[var(--info)] aria-pressed:text-[var(--info)]"
                >
                  <span className="block">{label}</span>
                  <span className="tabular-nums">{time}</span>
                </button>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold">
                <Clock3 size={15} aria-hidden="true" /> Własna godzina
              </label>
              <input
                id={id}
                type="time"
                required
                value={value.time}
                onChange={(event) => onChange({ ...value, time: event.target.value })}
                className="min-h-11 w-28 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 text-sm"
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Dni tygodnia</legend>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
              {WEEKDAYS.map((label, index) => {
                const day = index + 1;
                const checked = value.days.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    aria-pressed={checked}
                    onClick={() => onChange({
                      ...value,
                      days: checked ? value.days.filter((item) => item !== day) : [...value.days, day],
                    })}
                    className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-[var(--border-subtle)] px-1 text-xs font-bold hover:bg-[var(--bg-elevated)] aria-pressed:border-[var(--info)] aria-pressed:bg-[var(--info)]/10 aria-pressed:text-[var(--info)]"
                  >
                    {checked && <Check size={12} aria-hidden="true" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {!parseStudyReminder(value) && (
            <p role="status" className="text-sm text-[var(--text-secondary)]">Ustaw godzinę i wybierz co najmniej jeden dzień.</p>
          )}
          <p className="text-xs text-[var(--text-secondary)]">Czas polski · jedno przypomnienie w wybranym dniu</p>
        </div>
      )}
    </div>
  );
}
