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
  }
> = {
  gold_spark: {
    primary: '#FFCA28',
    secondary: '#F59E0B',
    edge: '#B45309',
    cheek: '#FB7185',
    coreLight: '#FEF08A',
  },
  blue_wave: {
    primary: '#38BDF8',
    secondary: '#0284C7',
    edge: '#0369A1',
    cheek: '#F472B6',
    coreLight: '#E0F2FE',
  },
  emerald_pulse: {
    primary: '#34D399',
    secondary: '#059669',
    edge: '#065F46',
    cheek: '#FBBF24',
    coreLight: '#D1FAE5',
  },
  ice_crystal: {
    primary: '#7DD3FC',
    secondary: '#0EA5E9',
    edge: '#075985',
    cheek: '#A78BFA',
    coreLight: '#F0F9FF',
  },
  crimson_comet: {
    primary: '#FB7185',
    secondary: '#E11D48',
    edge: '#9F1239',
    cheek: '#FBBF24',
    coreLight: '#FFE4E6',
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

  // Automatic blinking every 3.4 - 4.8s
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

  // Body animation variants by mood
  const getBodyAnimation = () => {
    if (prefersReduced) {
      return { y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
    }
    switch (mood) {
      case 'idle':
        return {
          y: [0, -6, 0],
          rotate: [0, 1, -1, 0],
          transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'happy':
        return {
          y: [0, -11, 0],
          scaleX: [1, 0.95, 1.04, 1],
          scaleY: [1, 1.06, 0.95, 1],
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'celebrate':
        return {
          y: [0, -16, 0],
          rotate: [0, -10, 10, 0],
          scaleX: [1, 0.94, 1.05, 1],
          scaleY: [1, 1.08, 0.94, 1],
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'thinking':
        return {
          y: [0, -4, 0],
          rotate: -7,
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
          rotate: [-4, 4, -4],
          transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
        };
    }
  };

  // Shadow scale inversely proportional to jump height
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

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: pxSize, height: pxSize }}
      aria-label={`Maskotka Lumi (${mood})`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`lumiBody-${uid}`}
            x1="100"
            y1="30"
            x2="100"
            y2="165"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={palette.coreLight} />
            <stop offset="32%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>
        </defs>

        {/* Ground Shadow (scales inversely with jump height!) */}
        <motion.ellipse
          cx="100"
          cy="182"
          rx="42"
          ry="9"
          fill="#050811"
          initial={false}
          animate={getShadowAnimation()}
          style={{ transformOrigin: '100px 182px' }}
        />

        {/* Layer 1: Static/Subtle Vector Aura behind character (opacity <= 0.15 as mandated) */}
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
          {/* Floating Left & Right Spark Hands / Wings */}
          <ellipse
            cx="36"
            cy={mood === 'celebrate' || mood === 'happy' ? '88' : '112'}
            rx="13"
            ry="9"
            transform={
              mood === 'celebrate'
                ? 'rotate(-32 36 88)'
                : 'rotate(-15 36 112)'
            }
            fill={palette.primary}
            stroke={palette.edge}
            strokeWidth="4"
          />
          <ellipse
            cx="164"
            cy={
              mood === 'celebrate' || mood === 'happy'
                ? '88'
                : mood === 'thinking'
                ? '124'
                : '112'
            }
            rx="13"
            ry="9"
            transform={
              mood === 'celebrate'
                ? 'rotate(32 164 88)'
                : 'rotate(15 164 112)'
            }
            fill={palette.primary}
            stroke={palette.edge}
            strokeWidth="4"
          />

          {/* Main Spark Teardrop / Bulb Body with 3D Tactile Edge */}
          <path
            d="M100 30 C115 48 152 72 152 115 C152 146 130 166 100 166 C70 166 48 146 48 115 C48 72 85 48 100 30 Z"
            fill={`url(#lumiBody-${uid})`}
            stroke={palette.edge}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Top Flame Crest */}
          <path
            d="M100 18 C107 28 112 36 100 44 C88 36 93 28 100 18 Z"
            fill={palette.coreLight}
            stroke={palette.edge}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

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

          {/* Warm Rosy Cheeks */}
          <ellipse
            cx="68"
            cy="118"
            rx="8"
            ry="4.5"
            fill={palette.cheek}
            opacity="0.55"
          />
          <ellipse
            cx="132"
            cy="118"
            rx="8"
            ry="4.5"
            fill={palette.cheek}
            opacity="0.55"
          />

          {/* Eyes Layer */}
          {blinking || mood === 'happy' || mood === 'celebrate' ? (
            // Happy Arched Eyes ^ ^
            <g
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M70 104 Q80 92 90 104" />
              <path d="M110 104 Q120 92 130 104" />
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

              {/* Focused / Cool Eyebrows */}
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
              d="M89 120 Q100 130 111 120"
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}

          {/* Supportive Heart Badge held in front when mood === 'supportive' */}
          {mood === 'supportive' && (
            <path
              d="M100 152 C100 152 84 141 84 132 C84 127 88 123 93 123 C96 123 99 125 100 128 C101 125 104 123 107 123 C112 123 116 127 116 132 C116 141 100 152 100 152 Z"
              fill="#F43F5E"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          )}

          {/* Thinking Floating Idea Bulb when mood === 'thinking' */}
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
              {/* 8-bit Pixel Deal-With-It Glasses */}
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
              {/* Cyber Alchemist Visor Goggles */}
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
