'use client';

import { useState } from 'react';
import { TactileButton } from '../ui/TactileButton';
import type { StudyReminder } from '../../types/domain';
import { useAppState } from '../../context/AppStateContext';
import { parseStudyReminder } from '../../lib/studyReminders';
import { ReminderCloudActions } from './ReminderCloudActions';
import { ReminderPreferences } from './ReminderPreferences';

export function StudyReminderSettings() {
  const { state, setStudyReminder } = useAppState();
  return <ReminderSettingsForm initialValue={parseStudyReminder(state.studyReminder)} onSave={setStudyReminder} />;
}

function ReminderSettingsForm({ initialValue, onSave }: {
  initialValue: StudyReminder | null;
  onSave: (schedule: StudyReminder | null) => void;
}) {
  const [draft, setDraft] = useState(initialValue);
  const valid = parseStudyReminder(draft);
  const dirty = JSON.stringify(valid) !== JSON.stringify(initialValue);
  return (
    <section className="space-y-3 border-b border-[var(--border-subtle)] pb-4" aria-labelledby="reminder-settings-title">
      <h3 id="reminder-settings-title" className="text-sm font-extrabold">Plan powtórek</h3>
      <ReminderPreferences value={draft} onChange={setDraft} />
      <TactileButton size="sm" variant="secondary" disabled={!dirty || (draft !== null && !valid)} onClick={() => onSave(valid)}>
        Zapisz na tym urządzeniu
      </TactileButton>
      <ReminderCloudActions schedule={initialValue} onLoad={(schedule) => { setDraft(schedule); onSave(schedule); }} />
    </section>
  );
}
