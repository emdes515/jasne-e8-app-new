'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { ArrowLeft, Moon, Play, Sun, Zap } from 'lucide-react';
import { JasneBulbMark, JasneLogo } from '../../src/components/brand/JasneLogo';
import {
  AppSplashLoader,
  BulbContentSkeleton,
  BulbInlineLoader,
  SessionTransitionLoader,
} from '../../src/components/ui/BulbLoadingScreen';
import { OpenWorkInput } from '../../src/components/lesson/OpenWorkInput';
import { EMPTY_OPEN_WORK, type OpenWorkDraft } from '../../src/lib/openWork';
import { TactileButton } from '../../src/components/ui/TactileButton';

export default function LoadingPreviewPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sparkCount, setSparkCount] = useState(0);
  const [replaySeed, setReplaySeed] = useState(0);
  const [activeFullscreen, setActiveFullscreen] = useState<null | 'boot' | 'lesson' | 'exam'>(null);
  const [previewWork, setPreviewWork] = useState<OpenWorkDraft>({
    ...EMPTY_OPEN_WORK,
    mode: 'text',
  });
  const [previewText, setPreviewText] = useState(
    'Dane: P = 49 cm², V = 27 cm³\nObliczenia: √49 = 7 cm, ∛27 = 3 cm\nOdp.: Suma wynosi 10 cm.'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] px-4 py-6 sm:px-8 sm:py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Pasek górny podglądu */}
          <header className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
            <div className="space-y-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-1 -ml-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Wróć do aplikacji</span>
              </Link>
              <div>
                <JasneLogo size="lg" animated="subtle" showSubtitle interactive />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="min-h-[44px] px-4 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] flex items-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-[var(--accent-text)]" />
                    <span>Przełącz na Solar Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[var(--accent-text)]" />
                    <span>Przełącz na Nocturne Dark</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Sekcja 1: Warianty Logo Żarówki */}
          <section className="study-panel p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
                  Tożsamość JASNE E8 — Żarówka Tactile 3D
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Kliknij dowolne interaktywne logo albo wyzwalacz błysku, żeby zobaczyć impuls i zapłon żarnika.
                </p>
              </div>
              <TactileButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSparkCount((c) => c + 1);
                  setReplaySeed((s) => s + 1);
                }}
              >
                <Zap className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Powtórz zapłon</span>
              </TactileButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-start justify-between gap-4">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  Mały lockup (Mobile / Onboarding)
                </span>
                <JasneLogo size="sm" animated="subtle" interactive />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-start justify-between gap-4">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  Średni z podtytułem (Desktop Sidebar)
                </span>
                <JasneLogo size="md" animated="subtle" showSubtitle interactive />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-start justify-between gap-4">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  Sygnet solo (Subtle / Ignition / Loading)
                </span>
                <div key={replaySeed} className="flex items-center gap-4">
                  <JasneBulbMark size={44} animated="subtle" framed sparkTrigger={sparkCount} />
                  <JasneBulbMark size={48} animated="ignition" sparkTrigger={sparkCount} />
                  <JasneBulbMark size={48} animated="loading" sparkTrigger={sparkCount} />
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 2: Ikony Aplikacji & PWA */}
          <section className="study-panel p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold font-display">
                Ikony Aplikacji (.ico, SVG, Apple Touch &amp; PWA)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Podgląd wygenerowanych zasobów binarnych serwowanych z katalogów <code>app/</code> oraz <code>public/icons/</code>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center text-center gap-2.5">
                <Image unoptimized src="/favicon.ico" alt="Favicon 16px" width={16} height={16} className="w-4 h-4" />
                <div className="text-xs font-bold">16×16 favicon.ico</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Karta przeglądarki</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center text-center gap-2.5">
                <Image unoptimized src="/favicon.ico" alt="Favicon 32px" width={32} height={32} className="w-8 h-8" />
                <div className="text-xs font-bold">32×32 favicon.ico</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Zakładki &amp; Retiny</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center text-center gap-2.5">
                <Image unoptimized src="/icon.svg" alt="SVG App Icon 64px" width={64} height={64} className="w-16 h-16" />
                <div className="text-xs font-bold">64×64 icon.svg</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Wektorowy squircle</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center text-center gap-2.5">
                <Image
                  unoptimized
                  src="/apple-icon.png"
                  alt="Apple Touch Icon 180px"
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] rounded-2xl border border-[var(--border-subtle)]"
                />
                <div className="text-xs font-bold">180×180 apple-icon.png</div>
                <div className="text-[11px] text-[var(--text-secondary)]">iOS Homescreen</div>
              </div>
            </div>
          </section>

          {/* Sekcja 3: Ekrany Ładowania „Tungsten Ignition” */}
          <section className="study-panel p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold font-display">
                  Ekrany Ładowania — Zapłon Żarnika (Tungsten Ignition)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                  Bez zbędnych orbit i ozdobników: pojedynczy zapłon wolframowego żarnika, rozgrzanie bańki i włosowaty pasek na GPU.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <TactileButton
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveFullscreen('boot')}
                >
                  <Play className="w-4 h-4" />
                  <span>Splash Startowy</span>
                </TactileButton>
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveFullscreen('lesson')}
                >
                  <Play className="w-4 h-4" />
                  <span>Przejście Lekcji</span>
                </TactileButton>
                <TactileButton
                  variant="info"
                  size="sm"
                  onClick={() => setActiveFullscreen('exam')}
                >
                  <Play className="w-4 h-4" />
                  <span>Przejście Egzaminu</span>
                </TactileButton>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              <AppSplashLoader
                key={`embedded-${replaySeed}`}
                variant="boot"
                fullscreen={false}
              />

              <div className="space-y-4">
                <BulbContentSkeleton
                  label="Pobieram Dział 2: Ułamki i procenty (85 KB)…"
                  progressPercent={64}
                />

                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <BulbInlineLoader message="Zapisuję postęp sesji…" size={24} />
                  <BulbInlineLoader message="Wczytuję wzory CKE…" size={22} />
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 4: Edytor i klawiatura zadań otwartych */}
          <section className="study-panel p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold font-display">
                Klawiatura zadań otwartych (Tryb Klawiatura CKE)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Pasek szybkich symboli dostępny razem z klawiaturą systemową oraz 3-zakładkowa klawiatura matematyczna z kursorem, Cofnij i szablonami CKE.
              </p>
            </div>

            <div className="max-w-xl">
              <OpenWorkInput
                work={previewWork}
                onWorkChange={(patch) => setPreviewWork((prev) => ({ ...prev, ...patch }))}
                text={previewText}
                onTextChange={setPreviewText}
                disabled={false}
              />
            </div>
          </section>
        </div>

        {/* Pełnoekranowy podgląd wybranego loadera */}
        <AnimatePresence>
          {activeFullscreen === 'boot' && (
            <div className="fixed inset-0 z-50">
              <AppSplashLoader
                variant="boot"
                allowSkip
                onSkip={() => setActiveFullscreen(null)}
                fullscreen
              />
            </div>
          )}

          {activeFullscreen === 'lesson' && (
            <SessionTransitionLoader
              mode="lesson"
              title="Działania na ułamkach i procenty"
              durationMs={1400}
              onDone={() => setActiveFullscreen(null)}
            />
          )}

          {activeFullscreen === 'exam' && (
            <SessionTransitionLoader
              mode="exam"
              title="Miniarkusz · Matematyka E8"
              subtitle="5 zadań · 15 minut · bez utraty serc"
              durationMs={1400}
              onDone={() => setActiveFullscreen(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
