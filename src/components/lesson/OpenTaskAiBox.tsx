'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { AiTutorEvaluationResult } from '../../types/repositories';
import { LumiLoadout } from '../../types/domain';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { getOpenAnswer, hasVisualWork, type OpenWorkDraft } from '../../lib/openWork';
import { OpenWorkInput } from './OpenWorkInput';

interface OpenTaskAiBoxProps {
  work: OpenWorkDraft;
  onWorkChange: (patch: Partial<OpenWorkDraft>) => void;
  value: string;
  onChange: (next: string) => void;
  isEvaluating: boolean;
  evaluation: AiTutorEvaluationResult | null;
  disabled: boolean;
  onEvaluate: () => void;
  onCompare?: () => void;
  loadout: LumiLoadout;
  hideEvaluateButton?: boolean; // true during exam mode where open task is evaluated after submission
}

export function OpenTaskAiBox({
  work,
  onWorkChange,
  value,
  onChange,
  isEvaluating,
  evaluation,
  disabled,
  onEvaluate,
  onCompare,
  loadout,
  hideEvaluateButton = false,
}: OpenTaskAiBoxProps) {
  const canCompare = Boolean(onCompare) && hasVisualWork(work) && !getOpenAnswer(work, value);
  return (
    <div className="space-y-4">
      <OpenWorkInput
        work={work}
        onWorkChange={onWorkChange}
        text={value}
        onTextChange={onChange}
        disabled={disabled || isEvaluating}
        optionalResult={Boolean(onCompare)}
      />

      {!hideEvaluateButton && !evaluation && !isEvaluating && (
        <TactileButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={disabled || (!canCompare && !getOpenAnswer(work, value))}
          onClick={canCompare ? onCompare : onEvaluate}
        >
          {canCompare ? <BookOpen className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          <span>{canCompare ? 'Porównaj z rozwiązaniem' : 'Sprawdź odpowiedź'}</span>
        </TactileButton>
      )}

      {isEvaluating && (
        <div className="tutor-analysis" role="status">
          <div className="tutor-analysis-figure" aria-hidden="true">
            <LumiMascot mood="thinking" loadout={loadout} size="xs" />
            <span className="tutor-scan" />
          </div>
          <div>
            <p className="text-sm font-extrabold">Lumi sprawdza odpowiedź…</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {work.mode === 'text' ? 'Porównuje Twój zapis z kluczem.' : 'Porównuje wpisaną liczbę z wynikiem.'}
            </p>
          </div>
        </div>
      )}

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
                  Wynik: {evaluation.score}/{evaluation.maxScore} pkt
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

            {work.mode === 'text' && <div className="pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <div>
                <strong className="text-[var(--text-primary)]">
                  Rozpoznane pojęcia ({evaluation.matchedKeywords.length}
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
            </div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
