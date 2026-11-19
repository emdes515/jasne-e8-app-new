'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion, PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { SPRING_SHEET } from '../../lib/motionPresets';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

/**
 * Interactive Bottom Sheet with SPRING_SHEET and drag="y" physics (> 110px or fast flick closes).
 * Meets Choreography #10 and z-index 100 rule.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-2xl',
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 110 || info.velocity.y > 480) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={SPRING_SHEET}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.45 }}
            onDragEnd={handleDragEnd}
            className={`relative z-10 w-full ${maxWidthClass} max-h-[86vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-2xl overflow-hidden`}
          >
            {/* Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0">
              <div className="w-11 h-1.5 rounded-full bg-[var(--text-secondary)]/35" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 shrink-0">
              <div>
                <h2 className="text-lg font-extrabold font-display text-[var(--text-primary)]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zamknij panel"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
