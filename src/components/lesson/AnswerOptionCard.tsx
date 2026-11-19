'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { TaskOption } from '../../types/domain';
import { SPRING_TACTILE } from '../../lib/motionPresets';
import { MathText } from '../ui/MathText';

interface AnswerOptionCardProps {
  option: TaskOption;
  selected: boolean;
  checkedState: 'idle' | 'correct' | 'wrong' | 'missed_correct';
  disabled: boolean;
  onSelect: (optionId: string) => void;
}

export function AnswerOptionCard({
  option,
  selected,
  checkedState,
  disabled,
  onSelect,
}: AnswerOptionCardProps) {
  const prefersReduced = useReducedMotion();

  const getCardStyle = () => {
    if (checkedState === 'correct') {
      return 'bg-[var(--success)]/15 border-[var(--success)]';
    }
    if (checkedState === 'wrong') {
      return 'bg-[var(--danger)]/15 border-[var(--danger)]';
    }
    if (checkedState === 'missed_correct') {
      return 'bg-[var(--success)]/10 border-[var(--success)]';
    }
    if (selected) {
      return 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]';
    }
    return 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]';
  };

  const getBadgeStyle = () => {
    if (checkedState === 'correct' || checkedState === 'missed_correct') {
      return 'bg-[var(--success)] text-[var(--on-success)] border-[var(--success-edge)]';
    }
    if (checkedState === 'wrong') {
      return 'bg-[var(--danger)] text-[var(--on-danger)] border-[var(--danger-edge)]';
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
      aria-pressed={selected}
      onClick={() => !disabled && onSelect(option.id)}
      whileTap={disabled || prefersReduced ? undefined : { scale: 0.99 }}
      transition={SPRING_TACTILE}
      className={`relative w-full min-h-[52px] px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3.5 text-left select-none transition-colors ${getCardStyle()} ${
        disabled
          ? 'cursor-default'
          : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Letter / Check / X Square Badge */}
        <span
          className={`w-8 h-8 rounded-md border flex items-center justify-center font-extrabold font-display text-sm shrink-0 transition-colors ${getBadgeStyle()}`}
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
    </motion.button>
  );
}
