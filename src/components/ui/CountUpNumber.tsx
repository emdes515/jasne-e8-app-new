'use client';

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface CountUpNumberProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({
  value,
  durationMs = 600,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpNumberProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    let rafId: number;
    const startVal = displayValue;
    const diff = value - startVal;
    if (diff === 0) return;

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startVal + diff * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, prefersReduced]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
