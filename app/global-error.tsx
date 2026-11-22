'use client';

import { useEffect } from 'react';
import './globals.css';
import { ErrorFallbackCard } from '../src/components/ui/ErrorFallbackCard';

/** Root Next.js global error boundary wrapping errors even in RootLayout. */
export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[JASNE E8 GlobalErrorBoundary]', error);
  }, [error]);

  return (
    <html lang="pl" className="dark">
      <body>
        <ErrorFallbackCard
          description="Wystąpił nieoczekiwany błąd aplikacji. Twoje lokalne postępy są bezpieczne."
          onRetry={() => reset()}
        />
      </body>
    </html>
  );
}
