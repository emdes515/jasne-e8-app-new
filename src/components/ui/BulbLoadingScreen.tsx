'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { JasneBulbMark } from '../brand/JasneLogo';
import { useHydrationSafeReducedMotion } from '../../lib/useHydrationSafeReducedMotion';

export type SplashVariant = 'boot' | 'lesson' | 'exam' | 'sync';

export interface AppSplashLoaderProps {
  variant?: SplashVariant;
  title?: string;
  subtitle?: string;
  progress?: number;
  allowSkip?: boolean;
  onSkip?: () => void;
  fullscreen?: boolean;
  className?: string;
}

const ROTATING_MESSAGES: Record<SplashVariant, readonly string[]> = {
  boot: [
    'Rozgrzewam żarnik pomysłów…',
    'Szykuję Twoją serię i wzory E8…',
    'Włączam światło na matematykę…',
  ],
  lesson: [
    'Układam 4 karty teorii Bento…',
    'Przygotowuję 5 zadań CKE…',
    'Rozgrzewam podpowiedzi krok po kroku…',
  ],
  exam: [
    'Przygotowuję miniarkusz na czas…',
    'Wyłączam wzory i podpowiedzi — tryb E8…',
    'Wszystko gotowe. Powodzenia!',
  ],
  sync: [
    'Sprawdzam aktualny manifest treści…',
    'Synchronizuję Twój postęp nauki…',
    'Już za chwilę wracasz do gry…',
  ],
};

const ORBIT_SYMBOLS = [
  { symbol: '√', posClass: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { symbol: 'π', posClass: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
  { symbol: 'x²', posClass: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
  { symbol: '%', posClass: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
] as const;

const FLOATING_SPARKS = [
  { className: 'top-8 right-10', delay: 0, size: 12 },
  { className: 'bottom-12 left-8', delay: 0.45, size: 10 },
  { className: 'top-16 left-9', delay: 0.9, size: 9 },
] as const;

/**
 * Pełnoekranowy lub osadzony ekran ładowania „Zapalanie Światła” z animowaną żarówką JASNE E8.
 */
export function AppSplashLoader({
  variant = 'boot',
  title,
  subtitle,
  progress,
  allowSkip = false,
  onSkip,
  fullscreen = true,
  className = '',
}: AppSplashLoaderProps) {
  const prefersReduced = useHydrationSafeReducedMotion();
  const [messageIdx, setMessageIdx] = useState(0);
  const messages = ROTATING_MESSAGES[variant];

  useEffect(() => {
    if (subtitle || messages.length <= 1) return;
    const id = window.setInterval(() => {
      setMessageIdx((idx) => (idx + 1) % messages.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [subtitle, messages.length]);

  useEffect(() => {
    if (!allowSkip || !onSkip) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [allowSkip, onSkip]);

  const activeMessage = subtitle ?? messages[messageIdx % messages.length];
  const clampedProgress =
    typeof progress === 'number' ? Math.max(4, Math.min(100, progress)) : null;
  const isExam = variant === 'exam';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title ?? 'Ładowanie aplikacji JASNE E8'}
      onClick={allowSkip && onSkip ? onSkip : undefined}
      className={`relative overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center px-6 py-8 select-none ${
        fullscreen ? 'min-h-dvh w-full' : 'min-h-[420px] w-full rounded-3xl border-2 border-[var(--border-subtle)]'
      } ${allowSkip && onSkip ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Tło siatki matematycznej + statyczny radialny blask */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bulb-grid-backdrop opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isExam
            ? 'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--info) 9%, transparent) 0%, color-mix(in srgb, var(--accent-primary) 5%, transparent) 32%, transparent 66%)'
            : 'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--accent-primary) 10%, transparent) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        {/* Centralna scena orbitalna */}
        <div
          aria-hidden="true"
          className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-5"
        >
          {/* Zewnętrzny pierścień orbitalny z 4 symbolami matematycznymi */}
          <div className="absolute inset-4 bulb-orbit-spin">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" fill="none">
              <circle
                cx="100"
                cy="100"
                r="98"
                stroke={isExam ? 'var(--info)' : 'var(--border-subtle)'}
                strokeOpacity={isExam ? '0.45' : '0.9'}
                strokeWidth="1.75"
                strokeDasharray="5 8"
              />
            </svg>
            {ORBIT_SYMBOLS.map((item) => (
              <span
                key={item.symbol}
                className={`absolute ${item.posClass}`}
              >
                <span
                  className={`bulb-orbit-counter-spin inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] text-xs font-extrabold font-display ${
                    isExam ? 'text-[var(--info)]' : 'text-[var(--accent-text)]'
                  }`}
                >
                  {item.symbol}
                </span>
              </span>
            ))}
          </div>

          {/* Wewnętrzny pulsujący pierścień energii (tylko scale + opacity) */}
          <motion.div
            animate={
              prefersReduced
                ? { scale: 1, opacity: 0.25 }
                : { scale: [0.92, 1.06, 0.92], opacity: [0.16, 0.36, 0.16] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-11 rounded-full border-2 ${
              isExam ? 'border-[var(--info)]' : 'border-[var(--accent-primary)]'
            }`}
          />

          {/* 3 unoszące się iskierki rombowe */}
          {!prefersReduced &&
            FLOATING_SPARKS.map((spark, index) => (
              <motion.svg
                key={index}
                width={spark.size}
                height={spark.size}
                viewBox="0 0 16 16"
                fill="none"
                className={`absolute ${spark.className}`}
                animate={{
                  y: [0, -8, 0],
                  scale: [0.8, 1.18, 0.8],
                  opacity: [0.35, 0.95, 0.35],
                }}
                transition={{
                  duration: 2.1,
                  delay: spark.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <path
                  d="M8 1 L9.8 6.2 L15 8 L9.8 9.8 L8 15 L6.2 9.8 L1 8 L6.2 6.2 Z"
                  fill={isExam ? 'var(--info)' : 'var(--accent-text)'}
                />
              </motion.svg>
            ))}

          {/* Główna 3D żarówka w centrum */}
          <div className="relative z-10 flex items-center justify-center rounded-3xl bg-[var(--bg-surface)]/80 border-2 border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)] p-3.5">
            <JasneBulbMark size={108} animated="loading" />
          </div>
        </div>

        {/* Tytuł / Lockup marki */}
        {title ? (
          <div className="space-y-1.5 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-display border ${
                isExam
                  ? 'bg-[var(--info)]/12 text-[var(--info)] border-[var(--info)]/40'
                  : 'bg-[var(--accent-primary)]/12 text-[var(--accent-text)] border-[var(--accent-primary)]/40'
              }`}
            >
              {isExam ? 'Tryb egzaminu E8' : 'Lekcja E8'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-[var(--text-primary)] text-balance">
              {title}
            </h2>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--text-primary)]">
              JASNE
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-primary)] text-[var(--on-accent)] border-2 border-[var(--accent-primary-edge)] shadow-[0_2px_0_0_var(--accent-primary-edge)] text-sm sm:text-base font-black font-display leading-none">
              E8
            </span>
          </div>
        )}

        {/* Rotujący komunikat mikro-copy */}
        <div className="min-h-[1.75rem] flex items-center justify-center mb-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeMessage}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              {activeMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tactile 3D pasek postępu z GPU shimmerem */}
        <div className="w-full max-w-[260px] space-y-2">
          <div className="relative h-3.5 w-full rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] overflow-hidden p-0.5">
            <div
              className={`relative h-full rounded-full overflow-hidden transition-[width] duration-200 ease-out ${
                isExam ? 'bg-[var(--info)]' : 'bg-[var(--accent-primary)]'
              }`}
              style={{
                width: clampedProgress !== null ? `${clampedProgress}%` : '72%',
              }}
            >
              <span
                aria-hidden="true"
                className="bulb-shimmer-slide absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
            </div>
          </div>

          {clampedProgress !== null && (
            <div className="text-xs font-extrabold font-display tabular-nums text-[var(--text-secondary)]">
              {Math.round(clampedProgress)}%
            </div>
          )}
        </div>

        {/* Podpowiedź pominięcia */}
        {allowSkip && onSkip && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="mt-5 min-h-[44px] px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Dotknij, aby pominąć
          </button>
        )}
      </div>
    </div>
  );
}

export interface SessionTransitionLoaderProps {
  mode: 'lesson' | 'exam';
  title: string;
  subtitle?: string;
  durationMs?: number;
  onDone: () => void;
}

/**
 * Kinowy ekran przejścia podczas otwierania lekcji lub miniarkusza E8.
 */
export function SessionTransitionLoader({
  mode,
  title,
  subtitle,
  durationMs = 750,
  onDone,
}: SessionTransitionLoaderProps) {
  const prefersReduced = useReducedMotion();
  const [progress, setProgress] = useState(14);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const autostartParam =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1';

    if (prefersReduced || autostartParam || durationMs <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current();
      }
      return;
    }

    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      setProgress(Math.round(14 + eased * 86));

      if (ratio >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDoneRef.current();
        }
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [durationMs, prefersReduced]);

  const handleSkip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50"
    >
      <AppSplashLoader
        variant={mode}
        title={title}
        subtitle={
          subtitle ??
          (mode === 'lesson'
            ? 'Układam 4 karty Bento i 5 zadań CKE…'
            : 'Miniarkusz E8 · 5 zadań · 15 minut · bez utraty serc')
        }
        progress={progress}
        allowSkip
        onSkip={handleSkip}
        fullscreen
      />
    </motion.div>
  );
}

export interface BulbContentSkeletonProps {
  label?: string;
  progressPercent?: number;
  className?: string;
}

/**
 * Szkielet ładowania 1:1 odpowiadający kartom Bento / paczkom działu z animowaną żarówką.
 */
export function BulbContentSkeleton({
  label = 'Ładuję materiały działu…',
  progressPercent,
  className = '',
}: BulbContentSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative study-panel p-5 sm:p-6 overflow-hidden space-y-5 ${className}`}
    >
      {/* Układ szkieletu 1:1 pod karty */}
      <div aria-hidden="true" className="space-y-4 opacity-55">
        <div className="flex items-center justify-between gap-4">
          <div className="relative h-6 w-40 rounded-lg bg-[var(--bg-elevated)] overflow-hidden">
            <span className="bulb-shimmer-slide absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
          <div className="h-6 w-20 rounded-full bg-[var(--bg-elevated)]" />
        </div>

        <div className="space-y-2.5">
          <div className="relative h-4 w-full rounded-md bg-[var(--bg-elevated)] overflow-hidden">
            <span className="bulb-shimmer-slide absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
          <div className="relative h-4 w-4/5 rounded-md bg-[var(--bg-elevated)] overflow-hidden">
            <span className="bulb-shimmer-slide absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="h-24 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]" />
          <div className="h-24 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]" />
        </div>
      </div>

      {/* Wyśrodkowana taktylna pigułka żarówki */}
      <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] shadow-[0_4px_0_0_var(--border-3d-edge)]">
          <JasneBulbMark size={34} animated="loading" />
          <div className="text-left">
            <p className="text-xs sm:text-sm font-extrabold font-display text-[var(--text-primary)]">
              {label}
            </p>
            {typeof progressPercent === 'number' && (
              <div className="mt-1 flex items-center gap-2">
                <div className="w-28 h-2 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-[width] duration-200"
                    style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums text-[var(--accent-text)]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Kompaktowy wskaźnik ładowania z żarówką do sekcji i modali.
 */
export function BulbInlineLoader({
  message = 'Wczytuję…',
  size = 28,
  className = '',
}: {
  message?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] ${className}`}
    >
      <JasneBulbMark size={size} animated="loading" />
      <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
        {message}
      </span>
    </div>
  );
}
