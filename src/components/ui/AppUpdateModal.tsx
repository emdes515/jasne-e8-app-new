'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { fetchAppUpdatePolicy, type UpdateCheckResult } from '../../lib/remoteConfig';
import { LumiMascot } from '../mascot/LumiMascot';
import { BottomSheet } from './BottomSheet';
import { TactileButton } from './TactileButton';

const SNOOZE_KEY = 'jasne_e8_update_snooze_until';

export function AppUpdateModal({ suppressed }: { suppressed: boolean }) {
  const { state } = useAppState();
  const [result, setResult] = useState<UpdateCheckResult>({ mode: 'none', policy: null });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchAppUpdatePolicy().then((res) => {
      if (!active || res.mode === 'none') return;
      if (res.mode === 'soft') {
        try {
          const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) || '0');
          if (snoozeUntil > Date.now()) return;
        } catch {
          // ignore storage errors
        }
      }
      setResult(res);
    });
    return () => {
      active = false;
    };
  }, []);

  if (result.mode === 'none' || dismissed) return null;
  if (result.mode === 'soft' && suppressed) return null;

  const title = result.policy?.titlePl || 'Nowa wersja JASNE E8 jest gotowa!';
  const highlights = result.policy?.highlightsPl?.length
    ? result.policy.highlightsPl
    : ['Poprawki wydajności, animacji i nowe zadania E8.'];

  const handleUpdateNow = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleSnooze = () => {
    const hours = Math.max(1, result.policy?.remindAfterHours ?? 24);
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + hours * 3600 * 1000));
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (result.mode === 'force') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-update-title"
        className="fixed inset-0 z-[160] bg-[var(--bg-canvas)]/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)] shadow-[0_6px_0_0_var(--accent-primary-edge)] p-6 text-center space-y-5">
          <div className="flex justify-center">
            <LumiMascot mood="supportive" loadout={state.loadout} size="md" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-primary)]/15 px-3 py-1 text-xs font-extrabold font-display text-[var(--accent-text)]">
              Wymagana aktualizacja {result.latestLabel ? `· ${result.latestLabel}` : ''}
            </span>
            <h2 id="force-update-title" className="text-xl font-extrabold font-display text-[var(--text-primary)]">
              {title}
            </h2>
          </div>

          <ul className="text-left space-y-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-primary)]">
            {highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent-text)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <TactileButton variant="primary" size="lg" fullWidth onClick={handleUpdateNow}>
            <RefreshCw className="w-4 h-4" />
            <span>Zaktualizuj teraz</span>
          </TactileButton>
        </div>
      </div>
    );
  }

  return (
    <BottomSheet
      open
      onClose={handleSnooze}
      title={title}
      subtitle={result.latestLabel ? `Dostępna wersja ${result.latestLabel}` : 'Nowości w JASNE E8'}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5">
          <LumiMascot mood="happy" loadout={state.loadout} size="xs" />
          <ul className="space-y-1 text-xs sm:text-sm text-[var(--text-primary)]">
            {highlights.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <TactileButton variant="primary" size="md" fullWidth onClick={handleUpdateNow}>
            <RefreshCw className="w-4 h-4" />
            <span>Zaktualizuj teraz</span>
          </TactileButton>
          <TactileButton variant="secondary" size="md" fullWidth onClick={handleSnooze}>
            Później
          </TactileButton>
        </div>
      </div>
    </BottomSheet>
  );
}
