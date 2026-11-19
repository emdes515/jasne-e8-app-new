'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { SPRING_SNAPPY } from '../../lib/motionPresets';

export function ToastHost() {
  const { toasts, dismissToast } = useAppState();

  return (
    <div
      className="fixed bottom-22 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-[200] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const iconMap = {
            info: <Info className="w-5 h-5 text-[var(--info)] shrink-0" />,
            success: (
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />
            ),
            warning: (
              <AlertTriangle className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
            ),
            danger: (
              <XCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
            ),
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={SPRING_SNAPPY}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 study-panel text-sm font-medium text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2.5">
                {iconMap[toast.tone]}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Zamknij powiadomienie"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
