'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, BookOpen, CheckCircle2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { AiTutorEvaluationResult } from '../../types/repositories';
import { LumiLoadout } from '../../types/domain';
import { AI_ANALYSIS_UI_DURATION_MS } from '../../services/ai/aiTutorMock';
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

const ANALYSIS_STAGES = [
  'Odczytuję obliczenia i zapis…',
  'Sprawdzam metodę według klucza CKE…',
  'Przygotowuję ocenę i wskazówkę…',
] as const;

function AiAnalysisScannerCard({
  loadout,
  mode,
}: {
  loadout: LumiLoadout;
  mode: OpenWorkDraft['mode'];
}) {
  const prefersReduced = useReducedMotion();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setElapsedMs(Math.min(AI_ANALYSIS_UI_DURATION_MS, Date.now() - startedAt));
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const progress = Math.min(100, Math.round((elapsedMs / AI_ANALYSIS_UI_DURATION_MS) * 100));
  const activeStage = progress < 34 ? 0 : progress < 72 ? 1 : 2;
  const remainingSec = Math.max(1, Math.ceil((AI_ANALYSIS_UI_DURATION_MS - elapsedMs) / 1000));

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border-2 border-[var(--info)]/55 bg-[var(--bg-elevated)] p-4 sm:p-5 space-y-4"
    >
      {/* Animated horizontal scanner sweep */}
      {!prefersReduced && (
        <motion.div
          aria-hidden="true"
          animate={{ y: ['0%', '340%', '0%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-[var(--info)]/12 to-transparent"
        />
      )}

      <div className="relative z-10 flex items-center gap-3.5">
        <div className="shrink-0 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1.5">
          <LumiMascot mood="thinking" loadout={loadout} size="xs" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-extrabold font-display text-[var(--text-primary)]">
              AI Tutor analizuje rozwiązanie
            </p>
            <span className="shrink-0 rounded-full bg-[var(--info)]/15 px-2 py-0.5 text-[11px] font-extrabold font-display text-[var(--info)] tabular-nums">
              ~{remainingSec} s
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            {mode === 'text'
              ? 'Sprawdzam tok rozumowania i klucz punktowania E8.'
              : 'Analizuję zapis i wynik z Twojej pracy.'}
          </p>
        </div>
      </div>

      {/* Smooth 5s progress bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="h-2.5 w-full rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--info)] transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.max(6, progress)}%` }}
          />
        </div>
      </div>

      {/* 3-step live checklist */}
      <ol className="relative z-10 space-y-1.5">
        {ANALYSIS_STAGES.map((label, idx) => {
          const isDone = idx < activeStage;
          const isActive = idx === activeStage;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                isDone
                  ? 'text-[var(--success)]'
                  : isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)]/60'
              }`}
            >
              {isDone ? (
                <Check className="w-3.5 h-3.5 shrink-0 text-[var(--success)]" />
              ) : isActive ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-[var(--info)]" />
              ) : (
                <span className="inline-block w-3.5 h-3.5 rounded-full border border-current opacity-40 shrink-0" />
              )}
              <span>{label}</span>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
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
        <AiAnalysisScannerCard loadout={loadout} mode={work.mode} />
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
