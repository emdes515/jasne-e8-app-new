'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileCheck, LockKeyhole } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';
import { CloudAccountModal, useCloudAuthUser } from './CloudAccountModal';

const FIRST_REMINDER_MS = 8_000;
const NEXT_REMINDER_MS = 75_000;
const RETRY_MS = 2_000;

export function GuestAccountReminder({ suppressed }: { suppressed: boolean }) {
  const { configured, loading, user } = useCloudAuthUser();
  if (!configured || loading || user) return null;

  return <Reminder suppressed={suppressed} />;
}

function Reminder({ suppressed }: { suppressed: boolean }) {
  const { state } = useAppState();
  const [panel, setPanel] = useState<'reminder' | 'account' | null>(null);
  const nextReminder = useRef<number | null>(null);

  useEffect(() => {
    if (suppressed || panel) return;

    nextReminder.current ??= Date.now() + FIRST_REMINDER_MS;
    let timer = window.setTimeout(showWhenAvailable, Math.max(0, nextReminder.current - Date.now()));

    function showWhenAvailable() {
      const otherDialog = document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]');
      const activeElement = document.activeElement;
      const editing = activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable || activeElement.matches('input, textarea, select'));
      if (document.hidden || otherDialog || editing) {
        timer = window.setTimeout(showWhenAvailable, RETRY_MS);
        return;
      }

      setPanel('reminder');
    }

    return () => window.clearTimeout(timer);
  }, [suppressed, panel]);

  const dismiss = () => {
    nextReminder.current = Date.now() + NEXT_REMINDER_MS;
    setPanel(null);
  };

  return (
    <>
      {!suppressed && (
        <section
          aria-label="Korzyści z darmowego konta"
          className="border-b border-[var(--accent-primary)]/30 bg-[var(--bg-elevated)]"
        >
          <div className="mx-auto grid max-w-[1064px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-1 sm:gap-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <LockKeyhole aria-hidden="true" size={17} className="shrink-0 text-[var(--accent-text)]" />
              <p className="min-w-0 text-[11px] leading-snug text-[var(--text-secondary)] sm:text-xs">
                <strong className="block font-extrabold text-[var(--accent-text)] sm:inline sm:mr-1.5">Konto ucznia</strong>
                Odblokuj lekcje po pierwszej
              </p>
            </div>
            <TactileButton
              variant="secondary"
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => setPanel('account')}
            >
              Odblokuj
              <ArrowRight aria-hidden="true" size={14} />
            </TactileButton>
          </div>
        </section>
      )}

      {panel === 'account' && <CloudAccountModal open onClose={dismiss} />}

      <BottomSheet
        open={panel === 'reminder'}
        onClose={dismiss}
        title="Ucz się dalej z kontem ucznia"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/8 px-3.5 py-3 sm:gap-4">
            <div aria-hidden="true" className="shrink-0">
              <LumiMascot mood="supportive" loadout={state.loadout} size="sm" />
            </div>
            <p className="min-w-0 text-sm leading-snug text-[var(--text-secondary)]">
              <strong className="block font-extrabold text-[var(--text-primary)]">Pierwsza lekcja jest dostępna bez konta.</strong>
              Zaloguj się, żeby otworzyć następne tematy E8.
            </p>
          </div>

          <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] text-sm">
            <li className="flex items-start gap-2.5 py-2.5">
              <BookOpen aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-[var(--accent-text)]" />
              <span><strong>Kolejne lekcje</strong><span className="block text-xs text-[var(--text-secondary)]">Ułamki, procenty i następne dostępne tematy.</span></span>
            </li>
            <li className="flex items-start gap-2.5 py-2.5">
              <FileCheck aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-[var(--accent-text)]" />
              <span><strong>Teoria i zadania E8</strong><span className="block text-xs text-[var(--text-secondary)]">Przykłady krok po kroku i ćwiczenia w kolejnych lekcjach.</span></span>
            </li>
          </ul>

          <div className="space-y-2">
            <TactileButton fullWidth onClick={() => setPanel('account')}>
              Odblokuj za darmo
              <ArrowRight aria-hidden="true" size={16} />
            </TactileButton>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 w-full cursor-pointer rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
            >
              Może później
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
