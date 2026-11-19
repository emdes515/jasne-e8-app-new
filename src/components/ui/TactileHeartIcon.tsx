'use client';

import React, { useId } from 'react';

interface TactileHeartIconProps {
  variant?: 'full' | 'empty' | 'cracked';
  size?: number;
  className?: string;
}

/**
 * Autorska ikona serca w stylu Tactile 3D Gaming:
 * - `full`: pełne rubinowo-koralowe serce z połyskiem 3D i wyraźnym obrysem
 * - `empty`: wygaszony kontur dla brakujących serc
 * - `cracked`: pęknięte serce dla stanu 0 serc / utraty życia
 */
export function TactileHeartIcon({
  variant = 'full',
  size = 18,
  className = '',
}: TactileHeartIconProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `tactile-heart-grad-${uid}`;

  if (variant === 'empty') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={`shrink-0 ${className}`}
      >
        <path
          d="M12 20.6C11.6 20.6 11.2 20.45 10.9 20.18C6.35 16.15 3 13.1 3 8.95C3 5.85 5.42 3.5 8.45 3.5C10.18 3.5 11.4 4.3 12 5.25C12.6 4.3 13.82 3.5 15.55 3.5C18.58 3.5 21 5.85 21 8.95C21 13.1 17.65 16.15 13.1 20.18C12.8 20.45 12.4 20.6 12 20.6Z"
          fill="var(--bg-canvas)"
          fillOpacity="0.45"
          stroke="var(--text-secondary)"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'cracked') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={`shrink-0 ${className}`}
      >
        <path
          d="M12 20.6C11.6 20.6 11.2 20.45 10.9 20.18C6.35 16.15 3 13.1 3 8.95C3 5.85 5.42 3.5 8.45 3.5C10.18 3.5 11.4 4.3 12 5.25C12.6 4.3 13.82 3.5 15.55 3.5C18.58 3.5 21 5.85 21 8.95C21 13.1 17.65 16.15 13.1 20.18C12.8 20.45 12.4 20.6 12 20.6Z"
          fill="var(--danger)"
          fillOpacity="0.18"
          stroke="var(--danger)"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path
          d="M12.3 5.5L10.4 9.7L13.6 12.1L11.2 17.5"
          stroke="var(--danger)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="52%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>
      {/* Main 3D body */}
      <path
        d="M12 20.6C11.6 20.6 11.2 20.45 10.9 20.18C6.35 16.15 3 13.1 3 8.95C3 5.85 5.42 3.5 8.45 3.5C10.18 3.5 11.4 4.3 12 5.25C12.6 4.3 13.82 3.5 15.55 3.5C18.58 3.5 21 5.85 21 8.95C21 13.1 17.65 16.15 13.1 20.18C12.8 20.45 12.4 20.6 12 20.6Z"
        fill={`url(#${gradId})`}
        stroke="#9F1239"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Bottom 3D rim shadow */}
      <path
        d="M5.4 13.1C6.75 15.55 9.2 17.75 11.45 19.65C11.75 19.9 12.25 19.9 12.55 19.65C14.8 17.75 17.25 15.55 18.6 13.1"
        stroke="#881337"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Top-left glossy highlight */}
      <path
        d="M6.2 8.2C6.45 6.8 7.5 5.85 8.85 5.7"
        stroke="#FFE4E6"
        strokeOpacity="0.85"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="10.4" cy="6.25" r="0.75" fill="#FFE4E6" fillOpacity="0.75" />
    </svg>
  );
}
