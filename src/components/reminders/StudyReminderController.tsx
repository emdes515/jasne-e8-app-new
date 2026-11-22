'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { getReminderDay, parseStudyReminder } from '../../lib/studyReminders';

export function StudyReminderController({ paused }: { paused: boolean }) {
  const { state, pushToast } = useAppState();
  const { studyReminder, guestId } = state;
  const lastDay = useRef<string | null>(null);

  useEffect(() => {
    const schedule = parseStudyReminder(studyReminder);
    if (!schedule || paused) return;

    function check() {
      if (!schedule || document.hidden || document.querySelector('dialog[open]')) return;
      const day = getReminderDay(schedule, new Date());
      if (!day) return;
      const deliveryId = `${guestId}:${day}`;
      if (lastDay.current === deliveryId) return;

      try {
        const key = 'jasne-e8:reminder-delivery';
        if (localStorage.getItem(key) === deliveryId) return;
        localStorage.setItem(key, deliveryId);
      } catch {
        // Przy niedostępnej pamięci deduplikacja obowiązuje w bieżącej karcie.
      }
      lastDay.current = deliveryId;
      pushToast('Pora na zaplanowaną powtórkę. Wybierz, od czego dziś zaczniesz.', 'info');
    }

    check();
    const interval = window.setInterval(check, 15_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
  }, [studyReminder, guestId, paused, pushToast]);

  return null;
}
