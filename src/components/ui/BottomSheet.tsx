'use client';

import { useLayoutEffect, useId, useRef, type ReactNode } from 'react';
import { motion, useDragControls, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { SPRING_SHEET } from '../../lib/motionPresets';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

function SheetDialog({
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-2xl',
}: Omit<BottomSheetProps, 'open'>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const subtitleId = useId();
  const dragControls = useDragControls();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement;
    element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      className="study-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}

        transition={SPRING_SHEET}
        drag={reducedMotion ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.45 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 480) onClose();
        }}
        className={`w-full ${maxWidthClass} max-h-[min(86dvh,55rem)] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]`}
      >
        {!reducedMotion && (
          <div
            aria-hidden="true"
            onPointerDown={(event) => dragControls.start(event)}
            className="flex h-6 shrink-0 touch-none cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <span className="h-1 w-9 rounded-full bg-[var(--text-secondary)]/40" />
          </div>
        )}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-extrabold text-pretty">{title}</h2>
            {subtitle && <p id={subtitleId} className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Zamknij panel"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5">
          {children}
        </div>
      </motion.div>
    </dialog>
  );
}

export function BottomSheet({ open, ...props }: BottomSheetProps) {
  return open ? <SheetDialog {...props} /> : null;
}
