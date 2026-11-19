'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { JasneBulbMark } from '../brand/JasneLogo';

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

const EASE_OUT_CUBIC = [0.22, 1, 0.36, 1] as const;

const STATUS_MESSAGES: Record<SplashVariant, string> = {
  boot: 'Wczytuję postęp nauki…',
  lesson: 'Otwieram teorię i zadania…',
  exam: 'Przygotowuję miniarkusz E8…',
  sync: 'Synchronizuję materiały…',
};

/**
 * Minimalistyczny ekran ładowania „Tungsten Filament Ignition”.
 * Czyste płótno, bezpośrednia sylwetka żarówki bez orbit/iskier/pudełek oraz włosowaty pasek wolframowy (GPU-only).
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
  const prefersReduced = useReducedMotion();

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

  const activeMessage = subtitle ?? STATUS_MESSAGES[variant];
  const progressRatio =
    typeof progress === 'number'
      ? Math.max(0.04, Math.min(1, progress / 100))
      : null;
  const isExam = variant === 'exam';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title ?? 'Ładowanie aplikacji JASNE E8'}
      onClick={allowSkip && onSkip ? onSkip : undefined}
      className={`relative overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center px-6 py-8 select-none ${
        fullscreen
          ? 'min-h-dvh w-full'
          : 'min-h-[380px] w-full rounded-3xl border border-[var(--border-subtle)]'
      } ${allowSkip && onSkip ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Bardzo dyskretna, statyczna poświata za żarówką (max ~5% nasycenia) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isExam
            ? 'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--info) 5%, transparent) 0%, transparent 56%)'
            : 'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--accent-primary) 5%, transparent) 0%, transparent 56%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        {/* Samodzielna żarówka bez kart, orbit ani iskier */}
        <div className="mb-4 flex items-center justify-center">
          <JasneBulbMark size={84} animated="loading" />
        </div>

        {/* Typografia wchodząca raz z lekkim wyhamowaniem */}
        <motion.div
          initial={
            prefersReduced
              ? { opacity: 1 }
              : { opacity: 0, transform: 'translateY(6px)' }
          }
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.24, delay: 0.08, ease: EASE_OUT_CUBIC }}
          className="space-y-1.5"
        >
          {title ? (
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-[var(--text-primary)] text-balance">
              {title}
            </h2>
          ) : (
            <div className="inline-flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--text-primary)]">
                JASNE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)] text-[var(--on-accent)] border border-[var(--accent-primary-edge)] text-sm font-black font-display leading-none">
                E8
              </span>
            </div>
          )}

          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            {activeMessage}
          </p>
        </motion.div>

        {/* Włosowaty pasek wolframowy (wyłącznie transform: scaleX / translateX na GPU) */}
        <div
          aria-hidden="true"
          className="mt-5 w-32 sm:w-36 h-[3px] rounded-full bg-[var(--border-subtle)]/75 overflow-hidden relative"
        >
          {progressRatio !== null ? (
            <div
              className={`h-full w-full rounded-full transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isExam ? 'bg-[var(--info)]' : 'bg-[var(--accent-primary)]'
              }`}
              style={{
                transform: `scaleX(${progressRatio})`,
                transformOrigin: 'left center',
              }}
            />
          ) : (
            <div
              className={`bulb-filament-sweep absolute inset-y-0 left-0 w-1/2 rounded-full ${
                isExam ? 'bg-[var(--info)]' : 'bg-[var(--accent-primary)]'
              }`}
            />
          )}
        </div>

        {/* Dyskretna opcja pominięcia */}
        {allowSkip && onSkip && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="mt-5 min-h-[44px] px-4 rounded-xl text-xs font-semibold text-[var(--text-secondary)]/75 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
 * Krótki, przerywalny ekran przejścia przy otwieraniu lekcji lub miniarkusza E8.
 */
export function SessionTransitionLoader({
  mode,
  title,
  subtitle,
  durationMs = 480,
  onDone,
}: SessionTransitionLoaderProps) {
  const prefersReduced = useReducedMotion();
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

    const timerId = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current();
      }
    }, durationMs);

    return () => {
      window.clearTimeout(timerId);
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
      animate={{ opacity: 1, transform: 'scale(1)' }}
      exit={
        prefersReduced
          ? { opacity: 0 }
          : { opacity: 0, transform: 'scale(0.985)' }
      }
      transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
      className="fixed inset-0 z-50"
    >
      <AppSplashLoader
        variant={mode}
        title={title}
        subtitle={
          subtitle ??
          (mode === 'lesson'
            ? 'Otwieram teorię i zadania…'
            : '5 zadań · 15 minut · bez utraty serc')
        }
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
 * Czysty szkielet 1:1 odpowiadający układowi kart lekcji i działów bez zagnieżdżonych pudełek.
 */
export function BulbContentSkeleton({
  label = 'Ładuję materiały działu…',
  progressPercent,
  className = '',
}: BulbContentSkeletonProps) {
  const ratio =
    typeof progressPercent === 'number'
      ? Math.max(0.04, Math.min(1, progressPercent / 100))
      : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`study-panel p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* Nagłówek statusu zintegrowany bezpośrednio z kartą */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <JasneBulbMark size={24} animated="loading" />
          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
            {label}
          </p>
        </div>
        {ratio !== null && typeof progressPercent === 'number' && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              aria-hidden="true"
              className="w-16 h-[3px] rounded-full bg-[var(--border-subtle)] overflow-hidden"
            >
              <div
                className="h-full w-full rounded-full bg-[var(--accent-primary)] transition-transform duration-150 ease-out"
                style={{
                  transform: `scaleX(${ratio})`,
                  transformOrigin: 'left center',
                }}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-[var(--text-secondary)]">
              {Math.round(progressPercent)}%
            </span>
          </div>
        )}
      </div>

      {/* Strukturalny szkielet treści */}
      <div aria-hidden="true" className="space-y-3.5 opacity-60">
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-md bg-[var(--bg-elevated)]" />
          <div className="h-3.5 w-4/5 rounded-md bg-[var(--bg-elevated)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="h-20 rounded-2xl bg-[var(--bg-elevated)]" />
          <div className="h-20 rounded-2xl bg-[var(--bg-elevated)]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Lekki wskaźnik ładowania inline z sygnetem żarówki.
 */
export function BulbInlineLoader({
  message = 'Wczytuję…',
  size = 24,
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
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] ${className}`}
    >
      <JasneBulbMark size={size} animated="loading" />
      <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
        {message}
      </span>
    </div>
  );
}
