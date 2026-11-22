'use client';

import { useEffect } from 'react';

/** Global Next.js error boundary rendered outside AppStateProvider. */
export default function GlobalViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[JASNE E8 ErrorBoundary]', error);
  }, [error]);

  return (
    <main
      role="alert"
      className="min-h-dvh w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-4"
    >
      <section className="study-panel w-full max-w-md p-6 sm:p-7 space-y-5 text-center">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
            Coś poszło nie tak
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Wystąpił nieoczekiwany błąd widoku. Twoje lokalne postępy są bezpieczne.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-[var(--on-accent)] border-2 border-[var(--accent-primary-edge)] shadow-[0_5px_0_0_var(--accent-primary-edge)] active:shadow-[0_1px_0_0_var(--accent-primary-edge)] active:translate-y-0.5 text-sm font-bold font-display cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Spróbuj ponownie
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] border-2 border-[var(--border-subtle)] hover:border-[var(--text-secondary)] text-sm font-bold font-display cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Wróć na start
          </button>
        </div>
      </section>
    </main>
  );
}
