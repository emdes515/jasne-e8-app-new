'use client';

import React, { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SPRING_BOUNCY, SPRING_TACTILE } from '../../lib/motionPresets';

export type BulbAnimationMode = 'none' | 'subtle' | 'ignition' | 'loading';

export interface JasneBulbMarkProps {
  size?: number;
  animated?: BulbAnimationMode;
  framed?: boolean;
  sparkTrigger?: number;
  className?: string;
}

const RAYS = [
  { x1: 40, y1: 6.5, x2: 40, y2: 12, delay: 0 },
  { x1: 18.5, y1: 14.5, x2: 22.5, y2: 18.5, delay: 0.16 },
  { x1: 61.5, y1: 14.5, x2: 57.5, y2: 18.5, delay: 0.32 },
  { x1: 10.5, y1: 33.5, x2: 15.8, y2: 34.2, delay: 0.48 },
  { x1: 69.5, y1: 33.5, x2: 64.2, y2: 34.2, delay: 0.64 },
] as const;

const MICRO_SPARKS = [
  { cx: 14, cy: 23, delay: 0, dx: -2 },
  { cx: 66, cy: 22, delay: 0.55, dx: 2 },
  { cx: 61, cy: 52, delay: 1.05, dx: 1.5 },
] as const;

/**
 * Autorski znak wektorowy żarówki JASNE E8 w stylu Tactile 3D Gaming.
 * Wszystkie animacje używają wyłącznie transform / opacity / pathLength (GPU 60 FPS),
 * bez pętli box-shadow/blur oraz z poszanowaniem prefers-reduced-motion.
 */
export function JasneBulbMark({
  size = 36,
  animated = 'subtle',
  framed = false,
  sparkTrigger = 0,
  className = '',
}: JasneBulbMarkProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReduced = useReducedMotion();
  const mode: BulbAnimationMode = prefersReduced ? 'none' : animated;

  const haloId = `bulb-halo-${uid}`;
  const glassId = `bulb-glass-${uid}`;
  const baseId = `bulb-base-${uid}`;
  const rayStroke = framed ? '#FFC933' : 'var(--accent-text)';
  const innerSize = framed ? Math.round(size * 0.78) : size;

  const bodyAnimate =
    mode === 'loading'
      ? { y: [0, -4.5, 0], rotate: [0, -1.5, 1.5, 0] }
      : mode === 'ignition'
      ? { scale: [0.76, 1.08, 1], y: [4, -2, 0] }
      : undefined;

  const bodyTransition =
    mode === 'loading'
      ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }
      : mode === 'ignition'
      ? SPRING_BOUNCY
      : undefined;

  const svgElement = (
    <svg
      width={innerSize}
      height={innerSize}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={framed ? 'overflow-visible' : `shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <radialGradient id={haloId} cx="50%" cy="44%" r="50%">
          <stop offset="0%" stopColor="#FFB800" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#FFB800" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={glassId} cx="37%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="26%" stopColor="#FEF08A" />
          <stop offset="62%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        <linearGradient id={baseId} x1="29" y1="56" x2="51" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="28%" stopColor="#64748B" />
          <stop offset="65%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      {/* Subtelne statyczne halo w tle (opacity <= 0.14 zgodnie ze specyfikacją) */}
      <circle cx="40" cy="36" r="28" fill={`url(#${haloId})`} opacity="0.62" />

      {/* Impuls błysku po kliknięciu w interaktywne logo */}
      {sparkTrigger > 0 && !prefersReduced && (
        <motion.circle
          key={`burst-${sparkTrigger}`}
          cx="40"
          cy="35"
          r="18"
          stroke="#FFC933"
          strokeWidth="2.5"
          initial={{ scale: 0.7, opacity: 0.85 }}
          animate={{ scale: 1.65, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '40px 35px' }}
        />
      )}

      {/* 3 unoszące się mikro-iskierki w trybie loading */}
      {mode === 'loading' &&
        MICRO_SPARKS.map((sp, idx) => (
          <motion.path
            key={idx}
            d={`M ${sp.cx} ${sp.cy - 3.2} L ${sp.cx + 1.1} ${sp.cy - 1.1} L ${sp.cx + 3.2} ${sp.cy} L ${sp.cx + 1.1} ${sp.cy + 1.1} L ${sp.cx} ${sp.cy + 3.2} L ${sp.cx - 1.1} ${sp.cy + 1.1} L ${sp.cx - 3.2} ${sp.cy} L ${sp.cx - 1.1} ${sp.cy - 1.1} Z`}
            fill="#FFC933"
            animate={{
              y: [0, -7, 0],
              x: [0, sp.dx, 0],
              opacity: [0.25, 0.95, 0.25],
              scale: [0.75, 1.15, 0.75],
            }}
            transition={{
              duration: 1.9,
              delay: sp.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${sp.cx}px ${sp.cy}px` }}
          />
        ))}

      <motion.g
        animate={bodyAnimate}
        transition={bodyTransition}
        style={{ transformOrigin: '40px 44px' }}
      >
        {/* 5 geometrycznych promieni świetlnych */}
        {RAYS.map((ray, index) => {
          const rayAnimate =
            mode === 'subtle'
              ? { opacity: [0.55, 1, 0.55], scale: [0.95, 1.07, 0.95] }
              : mode === 'loading'
              ? { opacity: [0.35, 1, 0.35], scale: [0.86, 1.16, 0.86] }
              : mode === 'ignition'
              ? { opacity: [0, 1], scale: [0.65, 1.12, 1] }
              : undefined;

          const rayTransition =
            mode === 'subtle'
              ? {
                  duration: 3.4,
                  delay: ray.delay,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }
              : mode === 'loading'
              ? {
                  duration: 1.4,
                  delay: index * 0.14,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }
              : mode === 'ignition'
              ? { duration: 0.42, delay: 0.14 + index * 0.04 }
              : undefined;

          return (
            <motion.line
              key={index}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke={rayStroke}
              strokeWidth="3.2"
              strokeLinecap="round"
              animate={rayAnimate}
              transition={rayTransition}
              style={{ transformOrigin: '40px 35px' }}
            />
          );
        })}

        {/* Bańka szklana 3D */}
        <path
          d="M 40 16.5 C 29.2 16.5, 21.2 24.4, 21.2 34.8 C 21.2 41.6, 24.8 46.2, 28.0 49.8 C 29.5 51.5, 30.4 53.6, 30.6 56.0 L 49.4 56.0 C 49.6 53.6, 50.5 51.5, 52.0 49.8 C 55.2 46.2, 58.8 41.6, 58.8 34.8 C 58.8 24.4, 50.8 16.5, 40 16.5 Z"
          fill={`url(#${glassId})`}
          stroke="#92400E"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Dolne cieniowanie rim-depth wewnątrz bańki */}
        <path
          d="M 25.5 41.5 C 27.5 46.2, 30.2 49.2, 31.6 53.2"
          stroke="#B45309"
          strokeOpacity="0.28"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 54.5 41.5 C 52.5 46.2, 49.8 49.2, 48.4 53.2"
          stroke="#B45309"
          strokeOpacity="0.28"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Połysk 3D w lewym górnym rogu */}
        <path
          d="M 26.8 31.8 C 27.4 25.6, 31.4 21.6, 36.8 20.6"
          stroke="#FFFFFF"
          strokeOpacity="0.82"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="40.8" cy="20.4" r="1.5" fill="#FFFFFF" fillOpacity="0.72" />

        {/* Słupki doprowadzające żarnika */}
        <line x1="35.8" y1="55.2" x2="35.8" y2="41.5" stroke="#92400E" strokeWidth="2.1" strokeLinecap="round" />
        <line x1="44.2" y1="55.2" x2="44.2" y2="41.5" stroke="#92400E" strokeWidth="2.1" strokeLinecap="round" />

        {/* Żarząca spirala / łuk eureka */}
        <motion.path
          d="M 35.8 41.5 L 35.8 35.5 C 35.8 33.2, 38.0 33.2, 40 36.2 C 42.0 33.2, 44.2 33.2, 44.2 35.5 L 44.2 41.5"
          stroke="#FFFBEB"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={mode === 'ignition' ? { pathLength: 0, opacity: 0.4 } : false}
          animate={
            mode === 'ignition'
              ? { pathLength: 1, opacity: 1 }
              : mode === 'loading'
              ? { opacity: [0.65, 1, 0.65] }
              : mode === 'subtle'
              ? { opacity: [0.85, 1, 0.85] }
              : undefined
          }
          transition={
            mode === 'ignition'
              ? { duration: 0.5, ease: 'easeOut' }
              : mode === 'loading'
              ? { duration: 1.3, repeat: Infinity, ease: 'easeInOut' }
              : mode === 'subtle'
              ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        />

        {/* 4-ramienna iskra eureka w sercu żarnika */}
        <motion.path
          d="M 40 27.5 L 41.4 31.1 L 45 32.5 L 41.4 33.9 L 40 37.5 L 38.6 33.9 L 35 32.5 L 38.6 31.1 Z"
          fill="#FFFBEB"
          animate={
            mode === 'subtle'
              ? { scale: [0.92, 1.1, 0.92], opacity: [0.78, 1, 0.78] }
              : mode === 'loading'
              ? { scale: [0.82, 1.24, 0.82], opacity: [0.65, 1, 0.65] }
              : mode === 'ignition'
              ? { scale: [0.3, 1.25, 1], opacity: [0, 1] }
              : undefined
          }
          transition={
            mode === 'subtle'
              ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
              : mode === 'loading'
              ? { duration: 1.3, repeat: Infinity, ease: 'easeInOut' }
              : mode === 'ignition'
              ? { duration: 0.45, delay: 0.1 }
              : undefined
          }
          style={{ transformOrigin: '40px 32.5px' }}
        />

        {/* Tactile 3D Gwint (trzonek metaliczny) */}
        <rect
          x="29.6"
          y="55.5"
          width="20.8"
          height="5.2"
          rx="2.6"
          fill={`url(#${baseId})`}
          stroke="#0F172A"
          strokeWidth="2.3"
        />
        <rect
          x="31.2"
          y="61.2"
          width="17.6"
          height="4.8"
          rx="2.4"
          fill={`url(#${baseId})`}
          stroke="#0F172A"
          strokeWidth="2.3"
        />
        <path
          d="M 35.2 66.2 L 44.8 66.2 C 44.4 69.2, 42.5 70.8, 40 70.8 C 37.5 70.8, 35.6 69.2, 35.2 66.2 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <rect x="31.5" y="56.8" width="4.8" height="1.8" rx="0.9" fill="#CBD5E1" fillOpacity="0.65" />
        <rect x="33.0" y="62.4" width="4.0" height="1.6" rx="0.8" fill="#CBD5E1" fillOpacity="0.58" />
      </motion.g>
    </svg>
  );

  if (!framed) {
    return svgElement;
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-xl bg-[#0C1426] border-2 border-[var(--accent-primary)]/70 shadow-[0_3px_0_0_var(--accent-primary-edge)] ${className}`}
      style={{ width: size, height: size }}
    >
      {svgElement}
    </span>
  );
}

export interface JasneLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: 'none' | 'subtle' | 'ignition';
  showSubtitle?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

const LOGO_SIZE_MAP: Record<
  NonNullable<JasneLogoProps['size']>,
  {
    markSize: number;
    titleClass: string;
    badgeClass: string;
    subtitleClass: string;
    gapClass: string;
  }
> = {
  sm: {
    markSize: 32,
    titleClass: 'text-sm sm:text-base',
    badgeClass: 'px-1.5 py-0.5 text-[10px]',
    subtitleClass: 'text-[10px]',
    gapClass: 'gap-2',
  },
  md: {
    markSize: 40,
    titleClass: 'text-lg',
    badgeClass: 'px-1.5 py-0.5 text-[11px]',
    subtitleClass: 'text-[11px]',
    gapClass: 'gap-2.5',
  },
  lg: {
    markSize: 48,
    titleClass: 'text-xl sm:text-2xl',
    badgeClass: 'px-2 py-0.5 text-xs',
    subtitleClass: 'text-xs',
    gapClass: 'gap-3',
  },
};

/**
 * Pełny poziomy znak marki JASNE E8 z animowaną żarówką Tactile 3D.
 */
export function JasneLogo({
  size = 'md',
  animated = 'subtle',
  showSubtitle = false,
  interactive = false,
  onClick,
  className = '',
}: JasneLogoProps) {
  const prefersReduced = useReducedMotion();
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const cfg = LOGO_SIZE_MAP[size];

  const triggerSpark = () => {
    setSparkTrigger((t) => t + 1);
  };

  const content = (
    <span className={`inline-flex items-center ${cfg.gapClass}`}>
      <JasneBulbMark
        size={cfg.markSize}
        animated={animated}
        framed
        sparkTrigger={sparkTrigger}
      />
      <span className="flex flex-col text-left">
        <span className="inline-flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold font-display tracking-tight text-[var(--text-primary)] ${cfg.titleClass}`}
          >
            JASNE
          </span>
          <span
            className={`rounded-md bg-[var(--accent-primary)] text-[var(--on-accent)] border border-[var(--accent-primary-edge)] font-black font-display leading-none ${cfg.badgeClass}`}
          >
            E8
          </span>
        </span>
        {showSubtitle && (
          <span className={`font-medium text-[var(--text-secondary)] mt-0.5 ${cfg.subtitleClass}`}>
            Egzamin ósmoklasisty
          </span>
        )}
      </span>
    </span>
  );

  if (!interactive) {
    return <div className={`inline-flex items-center ${className}`}>{content}</div>;
  }

  return (
    <motion.button
      type="button"
      onClick={() => {
        triggerSpark();
        onClick?.();
      }}
      onHoverStart={prefersReduced ? undefined : triggerSpark}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={SPRING_TACTILE}
      aria-label="JASNE E8 — błysk pomysłu"
      className={`inline-flex items-center rounded-2xl cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${className}`}
    >
      {content}
    </motion.button>
  );
}
