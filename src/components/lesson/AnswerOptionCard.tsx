'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { TaskOption } from '../../types/domain';
import { SPRING_BOUNCY, SPRING_TACTILE } from '../../lib/motionPresets';
import { MathText } from '../ui/MathText';

interface AnswerOptionCardProps {
  option: TaskOption;
  selected: boolean;
  checkedState: 'idle' | 'correct' | 'wrong' | 'missed_correct';
  disabled: boolean;
  onSelect: (optionId: string) => void;
  showParticles?: boolean;
}

const XP_PARTICLES = [
  { id: 1, dx: -38, dy: -64, delay: 0 },
  { id: 2, dx: 24, dy: -74, delay: 0.04 },
  { id: 3, dx: -12, dy: -82, delay: 0.08 },
  { id: 4, dx: 48, dy: -56, delay: 0.06 },
  { id: 5, dx: 0, dy: -90, delay: 0.1 },
];

export function AnswerOptionCard({
  option,
  selected,
  checkedState,
  disabled,
  onSelect,
  showParticles = false,
}: AnswerOptionCardProps) {
  const prefersReduced = useReducedMotion();

  const getCardStyle = () => {
    if (checkedState === 'correct') {
      return 'bg-[var(--success)]/15 border-[var(--success)] shadow-[0_5px_0_0_var(--success-edge)]';
    }
    if (checkedState === 'wrong') {
      return 'bg-[var(--danger)]/15 border-[var(--danger)] shadow-[0_5px_0_0_var(--danger-edge)]';
    }
    if (checkedState === 'missed_correct') {
      return 'bg-[var(--success)]/10 border-[var(--success)] shadow-[0_4px_0_0_var(--success-edge)]';
    }
    if (selected) {
      return 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_5px_0_0_var(--accent-primary-edge)]';
    }
    return 'bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] hover:border-[var(--text-secondary)]';
  };

  const getBadgeStyle = () => {
    if (checkedState === 'correct' || checkedState === 'missed_correct') {
      return 'bg-[var(--success)] text-[#F8FAFC] border-[var(--success-edge)]';
    }
    if (checkedState === 'wrong') {
      return 'bg-[var(--danger)] text-[#F8FAFC] border-[var(--danger-edge)]';
    }
    if (selected) {
      return 'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)]';
    }
    return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
  };

  const badgeLabel =
    option.id === 'TRUE'
      ? 'P'
      : option.id === 'FALSE'
      ? 'F'
      : option.id;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(option.id)}
      whileTap={disabled ? undefined : { y: 4 }}
      animate={
        !prefersReduced && checkedState === 'correct'
          ? { scale: [1, 1.03, 1] }
          : !prefersReduced && checkedState === 'wrong'
          ? { x: [0, -10, 10, -7, 7, -3, 0] }
          : { scale: 1, x: 0 }
      }
      transition={
        checkedState === 'wrong'
          ? { duration: 0.34 }
          : checkedState === 'correct'
          ? SPRING_BOUNCY
          : SPRING_TACTILE
      }
      className={`relative w-full min-h-[58px] px-4 py-3 rounded-2xl border-2 flex items-center justify-between gap-3.5 text-left select-none transition-colors ${getCardStyle()} ${
        disabled
          ? 'cursor-default'
          : 'cursor-pointer active:translate-y-[4px] active:shadow-[0_1px_0_0_var(--border-3d-edge)]'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Letter / Check / X Square Badge */}
        <span
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center font-extrabold font-display text-sm shrink-0 transition-colors ${getBadgeStyle()}`}
        >
          {checkedState === 'correct' || checkedState === 'missed_correct' ? (
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-current"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: prefersReduced ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25 }}
              />
            </svg>
          ) : checkedState === 'wrong' ? (
            <X className="w-5 h-5" />
          ) : (
            badgeLabel
          )}
        </span>

        <div className="text-base font-bold text-[var(--text-primary)] min-w-0">
          <MathText text={option.label} />
        </div>
      </div>

      {/* Golden +XP Particles flying up on correct answer (Choreography #4) */}
      {!prefersReduced && showParticles && checkedState === 'correct' && (
        <div
          aria-hidden="true"
          className="absolute right-6 top-1/2 pointer-events-none"
        >
          {XP_PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.7 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.dx,
                y: p.dy,
                scale: [0.8, 1.15, 0.9],
              }}
              transition={{ duration: 0.75, delay: p.delay, ease: 'easeOut' }}
              className="absolute px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-[var(--on-accent)] text-[11px] font-extrabold font-display shadow-sm whitespace-nowrap"
            >
              +XP
            </motion.span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
