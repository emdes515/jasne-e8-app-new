'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileCheck, Sparkles } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';
import { CloudAccountModal, useCloudAuthUser } from './CloudAccountModal';

const FIRST_REMINDER_MS = 30_000;
const NEXT_REMINDER_MS = 120_000;
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
      if (document.hidden || otherDialog) {
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
              <Sparkles aria-hidden="true" size={17} className="shrink-0 text-[var(--accent-text)]" />
              <p className="min-w-0 text-[11px] leading-snug text-[var(--text-secondary)] sm:text-xs">
                <strong className="block font-extrabold text-[var(--accent-text)] sm:inline sm:mr-1.5">Darmowe konto</strong>
                Pełne lekcje, zadania E8 i miniarkusze
              </p>
            </div>
            <TactileButton
              variant="secondary"
              size="sm"
              className="shrink-0 whitespace-nowrap"
              onClick={() => setPanel('account')}
            >
              Zaloguj się
              <ArrowRight aria-hidden="true" size={14} />
            </TactileButton>
          </div>
        </section>
      )}

      {panel === 'account' && <CloudAccountModal open onClose={dismiss} />}

      <BottomSheet
        open={panel === 'reminder'}
        onClose={dismiss}
        title="Odblokuj kolejne lekcje"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 p-3.5">
            <div aria-hidden="true" className="shrink-0">
              <LumiMascot mood="supportive" loadout={state.loadout} size="sm" />
            </div>
            <p className="text-sm font-bold leading-snug text-[var(--text-primary)]">
              Zaloguj się za darmo i ucz się z Lumi we wszystkich działach.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 text-xs font-bold text-[var(--text-primary)]">
            <li className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5">
              <BookOpen aria-hidden="true" size={16} className="shrink-0 text-[var(--accent-text)]" />
              Wszystkie lekcje
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5">
              <FileCheck aria-hidden="true" size={16} className="shrink-0 text-[var(--accent-text)]" />
              Zadania i miniarkusze
            </li>
          </ul>

          <div className="space-y-2">
            <TactileButton fullWidth onClick={() => setPanel('account')}>
              Zaloguj się lub załóż konto
              <ArrowRight aria-hidden="true" size={16} />
            </TactileButton>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 w-full cursor-pointer rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
            >
              Uczę się dalej bez konta
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
