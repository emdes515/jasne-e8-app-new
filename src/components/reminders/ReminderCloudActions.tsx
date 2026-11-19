'use client';

import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { Cloud } from 'lucide-react';
import { CloudAccountModal, useCloudAuthUser } from '../auth/CloudAccountModal';
import { TactileButton } from '../ui/TactileButton';
import { parseStudyReminder } from '../../lib/studyReminders';
import type { StudyReminder } from '../../types/domain';

export function ReminderCloudActions({ schedule, onLoad }: {
  schedule: StudyReminder | null;
  onLoad: (schedule: StudyReminder) => void;
}) {
  const { user, loading, configured } = useCloudAuthUser();
  const [showAccount, setShowAccount] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const valid = parseStudyReminder(schedule);

  async function sync(method: 'GET' | 'PUT' | 'DELETE') {
    if (!user) return;
    setBusy(true);
    setMessage('');
    try {
      await user.reload();
      if (!user.emailVerified) {
        setMessage('Potwierdź adres e-mail przed zapisem lub odczytem.');
        return;
      }
      const token = await user.getIdToken(true);
      const result = await fetch('/api/study-reminder', {
        method,
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(method === 'PUT' ? { body: JSON.stringify(valid) } : {}),
      });
      const data = await result.json();
      if (!result.ok) {
        setMessage(typeof data.error === 'string' ? data.error : 'Nie udało się uzyskać dostępu do ustawień konta.');
        return;
      }

      const fromCloud = parseStudyReminder(data.schedule);
      if (method === 'GET' && fromCloud) onLoad(fromCloud);
      const messages = {
        GET: fromCloud ? 'Wczytano harmonogram z konta.' : 'Na koncie nie ma zapisanego harmonogramu.',
        PUT: 'Harmonogram zapisany na koncie.',
        DELETE: 'Usunięto harmonogram z konta.',
      };
      setMessage(messages[method]);
    } catch {
      setMessage('Połączenie z kontem nie powiodło się. Spróbuj ponownie.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    if (!user) return;
    setBusy(true);
    try {
      await sendEmailVerification(user);
      setMessage('Wysłano link potwierdzający. Otwórz go, a potem ponów zapis.');
    } catch {
      setMessage('Nie udało się teraz wysłać wiadomości. Spróbuj ponownie później.');
    } finally {
      setBusy(false);
    }
  }

  if (!configured) return null;

  return (
    <details className="rounded-xl border border-[var(--border-subtle)] px-3">
      <summary className="my-1.5 cursor-pointer rounded-md py-2 text-sm font-extrabold">
        Harmonogram na koncie rodzica
      </summary>
      <div className="space-y-2.5 pb-3 text-sm">
        <p className="text-[var(--text-secondary)]">
          Użyj własnego konta osoby dorosłej. Na konto trafiają godzina i wybrane dni. Wczytanie harmonogramu zastępuje plan na tym urządzeniu.
        </p>
        {user ? (
          <>
            <p className="break-all text-xs text-[var(--text-secondary)]">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <TactileButton variant="secondary" size="sm" disabled={busy || !valid} onClick={() => void sync('PUT')}>Zapisz na koncie</TactileButton>
              <TactileButton variant="secondary" size="sm" disabled={busy} onClick={() => void sync('GET')}>Wczytaj na tym urządzeniu</TactileButton>
              <TactileButton variant="secondary" size="sm" disabled={busy} onClick={() => void sync('DELETE')}>Usuń kopię z konta</TactileButton>
              {!user.emailVerified && (
                <TactileButton variant="secondary" size="sm" disabled={busy} onClick={() => void verifyEmail()}>Wyślij link potwierdzający</TactileButton>
              )}
            </div>
          </>
        ) : (
          <TactileButton variant="secondary" size="sm" disabled={loading} onClick={() => setShowAccount(true)}>
            <Cloud size={16} aria-hidden="true" /> Zaloguj się jako rodzic
          </TactileButton>
        )}
        {message && <p role="status" className="text-sm font-semibold text-[var(--text-secondary)]">{message}</p>}
      </div>
      {showAccount && <CloudAccountModal open onClose={() => setShowAccount(false)} showPlanLink={false} />}
    </details>
  );
}
