'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { AiTutorEvaluationResult } from '../../types/repositories';
import { LumiLoadout } from '../../types/domain';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';

interface OpenTaskAiBoxProps {
  value: string;
  onChange: (next: string) => void;
  isEvaluating: boolean;
  evaluation: AiTutorEvaluationResult | null;
  disabled: boolean;
  onEvaluate: () => void;
  loadout: LumiLoadout;
  hideEvaluateButton?: boolean; // true during exam mode where open task is evaluated after submission
}

export function OpenTaskAiBox({
  value,
  onChange,
  isEvaluating,
  evaluation,
  disabled,
  onEvaluate,
  loadout,
  hideEvaluateButton = false,
}: OpenTaskAiBoxProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1.5">
          <label htmlFor="open-task-textarea">
            Zapisz obliczenia lub rozumowanie — AI Tutor oceni je jak
            egzaminator CKE (0–2 pkt)
          </label>
          <span className="tabular-nums">{value.trim().length} zn.</span>
        </div>

        <textarea
          id="open-task-textarea"
          rows={4}
          disabled={disabled || isEvaluating}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Np. Pole kwadratu to 49, więc bok ma pierwiastek z 49 czyli 7 cm. Objętość sześcianu to 27, więc krawędź ma 3 cm. Suma: 7 + 3 = 10 cm."
          className="w-full p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm font-medium text-[var(--text-primary)] leading-relaxed resize-y"
        />
      </div>

      {!hideEvaluateButton && !evaluation && !isEvaluating && (
        <TactileButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={disabled}
          onClick={onEvaluate}
        >
          <Bot className="w-5 h-5" />
          <span>Oceń z AI Tutorem</span>
        </TactileButton>
      )}

      {/* 700ms Thinking Shimmer State (Choreography #11) */}
      <AnimatePresence>
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--info)] flex items-center gap-4"
          >
            <LumiMascot mood="thinking" loadout={loadout} size="xs" />
            <div className="flex-1">
              <div className="text-sm font-extrabold font-display text-[var(--info)] flex items-center gap-2">
                <span>Lumi sprawdza tok rozumowania…</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)] animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                Weryfikacja słów kluczowych i wyniku według klucza CKE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tutor Evaluation Card */}
      <AnimatePresence>
        {evaluation && !isEvaluating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`p-4 rounded-2xl border-2 space-y-3 ${
              evaluation.score === 2
                ? 'bg-[var(--success)]/12 border-[var(--success)]'
                : evaluation.score === 1
                ? 'bg-[var(--accent-primary)]/12 border-[var(--accent-primary)]'
                : 'bg-[var(--danger)]/12 border-[var(--danger)]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {evaluation.score === 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                ) : (
                  <AlertCircle
                    className={`w-5 h-5 ${
                      evaluation.score === 1
                        ? 'text-[var(--accent-text)]'
                        : 'text-[var(--danger)]'
                    }`}
                  />
                )}
                <span className="text-base font-extrabold font-display tabular-nums">
                  Wynik CKE: {evaluation.score}/{evaluation.maxScore} pkt
                </span>
              </div>

              {/* Mandatory constant Phase 1 label (AC-A1, AC-A5) */}
              <span className="text-xs font-extrabold font-display text-[var(--info)]">
                {evaluation.label}
              </span>
            </div>

            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {evaluation.feedback}
            </p>

            {/* Matched keywords & expected result breakdown */}
            <div className="pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <div>
                <strong className="text-[var(--text-primary)]">
                  Rozpoznane pojęcia z klucza ({evaluation.matchedKeywords.length}
                  ):
                </strong>{' '}
                {evaluation.matchedKeywords.length > 0
                  ? evaluation.matchedKeywords.join(', ')
                  : 'brak słów kluczowych'}
              </div>
              <div>
                <strong className="text-[var(--text-primary)]">
                  Poprawny wynik końcowy w odpowiedzi:
                </strong>{' '}
                {evaluation.expectedResultFound ? 'Tak ✓' : 'Nie wykryto'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
