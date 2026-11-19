'use client';

import React, { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LumiColorSchemeId, LumiLoadout, LumiMood } from '../../types/domain';
import { SPRING_BOUNCY } from '../../lib/motionPresets';

interface LumiMascotProps {
  mood?: LumiMood;
  loadout?: Partial<LumiLoadout>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLOR_PALETTES: Record<
  LumiColorSchemeId,
  {
    primary: string;
    secondary: string;
    edge: string;
    cheek: string;
    coreLight: string;
    rimLight: string;
  }
> = {
  gold_spark: {
    primary: '#FFCA28',
    secondary: '#F59E0B',
    edge: '#B45309',
    cheek: '#FB7185',
    coreLight: '#FEF08A',
    rimLight: '#FDE68A',
  },
  blue_wave: {
    primary: '#38BDF8',
    secondary: '#0284C7',
    edge: '#0369A1',
    cheek: '#F472B6',
    coreLight: '#E0F2FE',
    rimLight: '#BAE6FD',
  },
  emerald_pulse: {
    primary: '#34D399',
    secondary: '#059669',
    edge: '#065F46',
    cheek: '#FBBF24',
    coreLight: '#D1FAE5',
    rimLight: '#A7F3D0',
  },
  ice_crystal: {
    primary: '#7DD3FC',
    secondary: '#0EA5E9',
    edge: '#075985',
    cheek: '#A78BFA',
    coreLight: '#F0F9FF',
    rimLight: '#E0F2FE',
  },
  crimson_comet: {
    primary: '#FB7185',
    secondary: '#E11D48',
    edge: '#9F1239',
    cheek: '#FBBF24',
    coreLight: '#FFE4E6',
    rimLight: '#FECDD3',
  },
};

const SIZE_MAP: Record<NonNullable<LumiMascotProps['size']>, number> = {
  xs: 48,
  sm: 72,
  md: 108,
  lg: 148,
  xl: 184,
};

export function LumiMascot({
  mood = 'idle',
  loadout,
  size = 'md',
  className = '',
}: LumiMascotProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReduced = useReducedMotion();
  const [blinking, setBlinking] = useState(false);

  const colorScheme: LumiColorSchemeId = loadout?.colorScheme ?? 'gold_spark';
  const headgear = loadout?.headgear ?? 'none';
  const eyewear = loadout?.eyewear ?? 'none';
  const aura = loadout?.aura ?? 'none';

  const palette = COLOR_PALETTES[colorScheme] ?? COLOR_PALETTES.gold_spark;
  const pxSize = SIZE_MAP[size];
  const hideFlameCrest = headgear === 'street_cap' || headgear === 'master_crown';

  // Automatic blinking every 3.2 - 5.0s
  useEffect(() => {
    if (prefersReduced) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 1800;
      timeoutId = setTimeout(() => {
        setBlinking(true);
        timeoutId = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, [prefersReduced]);

  const getBodyAnimation = () => {
    if (prefersReduced) {
      return { y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
    }
    switch (mood) {
      case 'idle':
        return {
          y: [0, -5, 0],
          rotate: [0, 1.2, -1.2, 0],
          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'happy':
        return {
          y: [0, -10, 0],
          scaleX: [1, 0.96, 1.04, 1],
          scaleY: [1, 1.05, 0.96, 1],
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'celebrate':
        return {
          y: [0, -14, 0],
          rotate: [0, -8, 8, 0],
          scaleX: [1, 0.94, 1.05, 1],
          scaleY: [1, 1.07, 0.95, 1],
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'thinking':
        return {
          y: [0, -4, 0],
          rotate: -6,
          transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'surprised':
        return {
          x: [-5, 5, -3, 3, 0],
          y: [0, -4, 0],
          transition: { duration: 0.45 },
        };
      case 'supportive':
        return {
          y: [0, -4, 0],
          rotate: [0, 2, -2, 0],
          transition: { duration: 3.0, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'focused':
        return {
          y: [0, -3, 0],
          scaleY: [1, 1.02, 1],
          transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'cool':
        return {
          y: [0, -5, 0],
          rotate: [-3, 3, -3],
          transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
    }
  };

  const getShadowAnimation = () => {
    if (prefersReduced) return { scaleX: 1, opacity: 0.28 };
    if (mood === 'celebrate') {
      return {
        scaleX: [1, 0.72, 1],
        opacity: [0.3, 0.14, 0.3],
        transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    if (mood === 'happy') {
      return {
        scaleX: [1, 0.8, 1],
        opacity: [0.3, 0.18, 0.3],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    return {
      scaleX: [1, 0.88, 1],
      opacity: [0.28, 0.2, 0.28],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
    };
  };

  const getHandsAnimation = () => {
    if (prefersReduced) return { y: 0 };
    if (mood === 'celebrate' || mood === 'happy') {
      return {
        y: [0, -4, 0],
        transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' as const },
      };
    }
    return {
      y: [0, 2, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
    };
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: pxSize, height: pxSize }}
      aria-label={`Maskotka Lumi (${mood})`}
    >
      {/* Expanded viewBox keeps jump, aura, stars & thinking bulb safely inside bounds */}
      <svg
        viewBox="-14 -12 228 218"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id={`lumiBody-${uid}`}
            cx="38%"
            cy="30%"
            r="68%"
            fx="36%"
            fy="26%"
          >
            <stop offset="0%" stopColor={palette.coreLight} />
            <stop offset="42%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </radialGradient>

          <radialGradient id={`lumiCheek-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.cheek} stopOpacity="0.65" />
            <stop offset="100%" stopColor={palette.cheek} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Shadow (scales inversely with jump height) */}
        <motion.ellipse
          cx="100"
          cy="184"
          rx="42"
          ry="8.5"
          fill="#050811"
          initial={false}
          animate={getShadowAnimation()}
          style={{ transformOrigin: '100px 184px' }}
        />

        {/* Layer 1: Static Vector Aura behind character (opacity <= 0.15) */}
        {(aura === 'plasma_ring' || mood === 'celebrate') && (
          <g opacity="0.15">
            <circle
              cx="100"
              cy="104"
              r="76"
              stroke={aura === 'plasma_ring' ? '#38BDF8' : '#FFB800'}
              strokeWidth="4"
              strokeDasharray="12 8"
            />
            <circle
              cx="100"
              cy="104"
              r="64"
              fill={aura === 'plasma_ring' ? '#38BDF8' : '#FFB800'}
            />
          </g>
        )}

        {/* Animated Character Container */}
        <motion.g
          animate={getBodyAnimation()}
          transition={SPRING_BOUNCY}
          style={{ transformOrigin: '100px 115px' }}
        >
          {/* Floating Left & Right Spark Hands */}
          <motion.g animate={getHandsAnimation()}>
            <ellipse
              cx={mood === 'supportive' ? '68' : '36'}
              cy={
                mood === 'celebrate' || mood === 'happy'
                  ? '88'
                  : mood === 'supportive'
                  ? '142'
                  : '112'
              }
              rx="13"
              ry="9"
              transform={
                mood === 'celebrate'
                  ? 'rotate(-32 36 88)'
                  : mood === 'supportive'
                  ? 'rotate(24 68 142)'
                  : 'rotate(-15 36 112)'
              }
              fill={palette.primary}
              stroke={palette.edge}
              strokeWidth="4"
            />
            <ellipse
              cx={mood === 'supportive' ? '132' : mood === 'thinking' ? '136' : '164'}
              cy={
                mood === 'celebrate' || mood === 'happy'
                  ? '88'
                  : mood === 'thinking'
                  ? '132'
                  : mood === 'supportive'
                  ? '142'
                  : '112'
              }
              rx="13"
              ry="9"
              transform={
                mood === 'celebrate'
                  ? 'rotate(32 164 88)'
                  : mood === 'supportive'
                  ? 'rotate(-24 132 142)'
                  : mood === 'thinking'
                  ? 'rotate(-22 136 132)'
                  : 'rotate(15 164 112)'
              }
              fill={palette.primary}
              stroke={palette.edge}
              strokeWidth="4"
            />
          </motion.g>

          {/* Main Spark Teardrop / Bulb Body with 3D Tactile Edge */}
          <path
            d="M100 30 C115 48 152 72 152 115 C152 146 130 166 100 166 C70 166 48 146 48 115 C48 72 85 48 100 30 Z"
            fill={`url(#lumiBody-${uid})`}
            stroke={palette.edge}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Subtle Bottom 3D Rim-Light */}
          <path
            d="M66 144 C76 156 124 156 134 144"
            stroke={palette.rimLight}
            strokeOpacity="0.55"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Top Flame Crest (hidden under cap or crown so cosmetics never collide) */}
          {!hideFlameCrest && (
            <motion.path
              d="M100 16 C108 27 112 36 100 44 C88 36 92 27 100 16 Z"
              fill={palette.coreLight}
              stroke={palette.edge}
              strokeWidth="3.5"
              strokeLinejoin="round"
              animate={
                prefersReduced
                  ? undefined
                  : { rotate: [-4, 4, -4], scaleY: [1, 1.06, 1] }
              }
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 42px' }}
            />
          )}

          {/* 3D Specular Forehead Highlight */}
          <ellipse
            cx="78"
            cy="72"
            rx="14"
            ry="7"
            transform="rotate(-25 78 72)"
            fill="#FFFFFF"
            opacity="0.55"
          />

          {/* Soft Radial Rosy Cheeks */}
          <ellipse
            cx="68"
            cy="118"
            rx="11"
            ry="6.5"
            fill={`url(#lumiCheek-${uid})`}
          />
          <ellipse
            cx="132"
            cy="118"
            rx="11"
            ry="6.5"
            fill={`url(#lumiCheek-${uid})`}
          />

          {/* Eyes Layer: Happy/Celebrate arches vs Blinking closed lids vs Open eyes */}
          {mood === 'happy' || mood === 'celebrate' ? (
            <g
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M70 104 Q80 92 90 104" />
              <path d="M110 104 Q120 92 130 104" />
            </g>
          ) : blinking ? (
            <g
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M70 102 Q80 108 90 102" />
              <path d="M110 102 Q120 108 130 102" />
            </g>
          ) : (
            <g>
              {/* Left Eye */}
              <circle cx="80" cy="102" r="11" fill="#0F172A" />
              <circle
                cx={mood === 'thinking' ? '83' : '77'}
                cy="98"
                r="4"
                fill="#FFFFFF"
              />
              <circle cx="83" cy="105" r="1.8" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="120" cy="102" r="11" fill="#0F172A" />
              <circle
                cx={mood === 'thinking' ? '123' : '117'}
                cy="98"
                r="4"
                fill="#FFFFFF"
              />
              <circle cx="123" cy="105" r="1.8" fill="#FFFFFF" />

              {mood === 'focused' && (
                <g stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round">
                  <path d="M68 87 L90 92" />
                  <path d="M132 87 L110 92" />
                </g>
              )}
              {mood === 'thinking' && (
                <g stroke="#0F172A" strokeWidth="4" strokeLinecap="round">
                  <path d="M69 89 Q80 84 90 89" />
                  <path d="M110 91 L130 87" />
                </g>
              )}
            </g>
          )}

          {/* Mouth Layer by Mood */}
          {mood === 'surprised' ? (
            <circle
              cx="100"
              cy="124"
              r="6"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ) : mood === 'celebrate' || mood === 'happy' ? (
            <path
              d="M88 120 Q100 135 112 120 Z"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : mood === 'thinking' ? (
            <path
              d="M93 124 Q100 121 107 125"
              stroke="#0F172A"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : mood === 'focused' ? (
            <path
              d="M91 124 L109 124"
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M89 120 Q100 129 111 120"
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}

          {/* Supportive Heart Badge held cleanly at chest level below mouth */}
          {mood === 'supportive' && (
            <path
              d="M100 162 C100 162 85 152 85 144 C85 139.5 88.5 136 93 136 C96 136 98.8 137.8 100 140.2 C101.2 137.8 104 136 107 136 C111.5 136 115 139.5 115 144 C115 152 100 162 100 162 Z"
              fill="#F43F5E"
              stroke="#FFE4E6"
              strokeWidth="2.2"
            />
          )}

          {/* Thinking Floating Idea Bulb */}
          {mood === 'thinking' && (
            <g transform="translate(148, 42)">
              <circle
                cx="14"
                cy="14"
                r="11"
                fill="#FEF08A"
                stroke="#B45309"
                strokeWidth="3"
              />
              <path
                d="M10 25 L18 25 M12 29 L16 29"
                stroke="#B45309"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Happy / Celebrate Floating Stars */}
          {(mood === 'happy' || mood === 'celebrate') && (
            <g fill="#FFB800">
              <path d="M35 52 L38 44 L41 52 L49 55 L41 58 L38 66 L35 58 L27 55 Z" />
              <path d="M162 46 L164 40 L166 46 L172 48 L166 50 L164 56 L162 50 L156 48 Z" />
            </g>
          )}

          {/* Cosmetic Layer: Eyewear */}
          {eyewear === 'pixel_glasses' && (
            <g>
              <rect
                x="58"
                y="91"
                width="36"
                height="18"
                rx="2"
                fill="#0F172A"
                stroke="#F8FAFC"
                strokeWidth="2.5"
              />
              <rect
                x="106"
                y="91"
                width="36"
                height="18"
                rx="2"
                fill="#0F172A"
                stroke="#F8FAFC"
                strokeWidth="2.5"
              />
              <rect x="94" y="96" width="12" height="6" fill="#0F172A" />
              <rect x="64" y="95" width="8" height="4" fill="#38BDF8" />
              <rect x="112" y="95" width="8" height="4" fill="#38BDF8" />
            </g>
          )}

          {eyewear === 'cyber_goggles' && (
            <g>
              <rect
                x="56"
                y="89"
                width="88"
                height="24"
                rx="12"
                fill="#0284C7"
                fillOpacity="0.82"
                stroke="#38BDF8"
                strokeWidth="3.5"
              />
              <path
                d="M68 95 L84 95 M116 95 L132 95"
                stroke="#E0F2FE"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Cosmetic Layer: Headgear */}
          {headgear === 'gaming_headphones' && (
            <g>
              <path
                d="M46 105 C46 56 154 56 154 105"
                stroke="#1E293B"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <rect
                x="34"
                y="88"
                width="16"
                height="32"
                rx="8"
                fill="#10B981"
                stroke="#0F172A"
                strokeWidth="3.5"
              />
              <rect
                x="150"
                y="88"
                width="16"
                height="32"
                rx="8"
                fill="#10B981"
                stroke="#0F172A"
                strokeWidth="3.5"
              />
            </g>
          )}

          {headgear === 'street_cap' && (
            <g>
              <path
                d="M60 58 C64 34 136 34 140 58 Z"
                fill="#2563EB"
                stroke="#0F172A"
                strokeWidth="4"
              />
              <path
                d="M56 56 L156 56 C160 56 160 64 152 64 L56 64 Z"
                fill="#1D4ED8"
                stroke="#0F172A"
                strokeWidth="3.5"
              />
            </g>
          )}

          {headgear === 'master_crown' && (
            <g>
              <path
                d="M68 54 L74 28 L90 42 L100 22 L110 42 L126 28 L132 54 Z"
                fill="#FFB800"
                stroke="#92400E"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="44" r="4" fill="#F43F5E" />
              <circle cx="81" cy="46" r="3" fill="#38BDF8" />
              <circle cx="119" cy="46" r="3" fill="#10B981" />
            </g>
          )}
        </motion.g>
      </svg>
    </div>
  );
}
