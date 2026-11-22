'use client';

import { useEffect } from 'react';
import { ErrorFallbackCard } from '../src/components/ui/ErrorFallbackCard';

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
    <ErrorFallbackCard
      description="Wystąpił nieoczekiwany błąd widoku. Twoje lokalne postępy są bezpieczne."
      onRetry={() => reset()}
    />
  );
}
