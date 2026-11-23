'use client';

import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';
import { CloudAccountModal, useCloudAuthUser } from './CloudAccountModal';

export function GuestAccountReminder({ suppressed }: { suppressed: boolean }) {
  const { configured, loading, user } = useCloudAuthUser();
  const [accountOpen, setAccountOpen] = useState(false);

  if (!configured || loading || user) return null;

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
              onClick={() => setAccountOpen(true)}
            >
              Odblokuj
              <ArrowRight aria-hidden="true" size={14} />
            </TactileButton>
          </div>
        </section>
      )}

      {accountOpen && <CloudAccountModal open onClose={() => setAccountOpen(false)} />}
    </>
  );
}
