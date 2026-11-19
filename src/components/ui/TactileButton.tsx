'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SPRING_TACTILE } from '../../lib/motionPresets';

export type TactileButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'info';

interface TactileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function TactileButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...rest
}: TactileButtonProps) {
  const variantStyles: Record<TactileButtonVariant, string> = {
    primary:
      'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)] shadow-[0_5px_0_0_var(--accent-primary-edge)] active:shadow-[0_1px_0_0_var(--accent-primary-edge)]',
    secondary:
      'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] active:shadow-[0_1px_0_0_var(--border-3d-edge)]',
    success:
      'bg-[var(--success)] text-[#F8FAFC] border-[var(--success-edge)] shadow-[0_5px_0_0_var(--success-edge)] active:shadow-[0_1px_0_0_var(--success-edge)]',
    danger:
      'bg-[var(--danger)] text-[#F8FAFC] border-[var(--danger-edge)] shadow-[0_5px_0_0_var(--danger-edge)] active:shadow-[0_1px_0_0_var(--danger-edge)]',
    info:
      'bg-[var(--info)] text-[#080C16] border-[var(--info-edge)] shadow-[0_5px_0_0_var(--info-edge)] active:shadow-[0_1px_0_0_var(--info-edge)]',
  };

  const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl',
    md: 'min-h-[48px] px-5 py-2.5 text-sm font-bold rounded-2xl',
    lg: 'min-h-[54px] px-6 py-3.5 text-base font-extrabold rounded-2xl',
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { y: 4 }}
      transition={SPRING_TACTILE}
      className={`inline-flex items-center justify-center gap-2 border-2 font-display tracking-tight select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
        disabled
          ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] shadow-[0_3px_0_0_var(--border-3d-edge)] opacity-75 cursor-not-allowed active:translate-y-0'
          : `${variantStyles[variant]} cursor-pointer active:translate-y-[4px]`
      } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
