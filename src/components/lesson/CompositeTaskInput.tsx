'use client';

import React from 'react';
import type { TaskDefinition } from '../../types/domain';
import { MathText } from '../ui/MathText';
import { AnswerOptionCard } from './AnswerOptionCard';

interface CompositeTaskInputProps {
  task: TaskDefinition;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  onTapSound?: () => void;
}

export function isCompositeAnswerComplete(task: TaskDefinition, value: string): boolean {
  if (task.type === 'true_false_multi') {
    const count = task.statements?.length ?? 0;
    return count > 0 && value.length === count && !value.includes('_');
  }
  if (task.type === 'dual_choice' || task.type === 'choice_with_reason') {
    const [part1 = '', part2 = ''] = value.split(':');
    // Obsługa zarówno formatu bez separatora ("AC", "A1") jak i z separatorem
    if (!value.includes(':')) {
      const optMatch = task.options?.some((o) => value.startsWith(o.id));
      const reasonMatch = task.reasons?.some((r) => value.endsWith(r.id));
      return Boolean(optMatch && reasonMatch && value.length >= 2);
    }
    return part1.length > 0 && part2.length > 0;
  }
  return value.trim().length > 0;
}

function splitPairSelection(task: TaskDefinition, value: string): [string, string] {
  if (!value) return ['', ''];
  if (value.includes(':')) {
    const [a = '', b = ''] = value.split(':');
    return [a, b];
  }
  const opt = task.options?.find((o) => value.startsWith(o.id))?.id ?? '';
  const rest = opt ? value.slice(opt.length) : '';
  const reason = task.reasons?.find((r) => r.id === rest)?.id ?? '';
  return [opt, reason];
}

export function CompositeTaskInput({
  task,
  value,
  onChange,
  disabled = false,
  onTapSound,
}: CompositeTaskInputProps) {
  if (task.type === 'true_false_multi' && task.statements) {
    const chars = Array.from({ length: task.statements.length }, (_, idx) => value[idx] ?? '_');

    const handlePick = (idx: number, letter: 'P' | 'F') => {
      if (disabled) return;
      onTapSound?.();
      const next = [...chars];
      next[idx] = letter;
      onChange(next.join(''));
    };

    return (
      <div className="space-y-3">
        {task.statements.map((stmt, idx) => {
          const picked = chars[idx];
          return (
            <div
              key={stmt.id}
              className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-extrabold text-[var(--accent-text)]">
                  {idx + 1}
                </span>
                <div className="text-sm sm:text-base font-medium text-[var(--text-primary)] leading-relaxed">
                  <MathText text={stmt.text} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['P', 'F'] as const).map((letter) => {
                  const selected = picked === letter;
                  const label = letter === 'P' ? 'P · Prawda' : 'F · Fałsz';
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={disabled}
                      onClick={() => handlePick(idx, letter)}
                      className={`min-h-[44px] rounded-xl border-2 text-xs sm:text-sm font-extrabold font-display transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (
    (task.type === 'dual_choice' || task.type === 'choice_with_reason') &&
    (task.options || task.reasons)
  ) {
    const [selectedFirst, selectedSecond] = splitPairSelection(task, value);

    const updatePair = (first: string, second: string) => {
      if (!first && !second) {
        onChange('');
        return;
      }
      if (first && second) {
        onChange(`${first}${second}`);
        return;
      }
      onChange(`${first}:${second}`);
    };

    const firstTitle =
      task.type === 'choice_with_reason' ? 'Część 1 · Wybierz odpowiedź' : 'Część 1 · Pierwsza luka';
    const secondTitle =
      task.type === 'choice_with_reason' ? 'Część 2 · Wybierz uzasadnienie' : 'Część 2 · Druga luka';

    return (
      <div className="space-y-4">
        {task.options && task.options.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-text)]">
              {firstTitle}
            </p>
            <div className="space-y-2">
              {task.options.map((opt) => (
                <AnswerOptionCard
                  key={opt.id}
                  option={opt}
                  selected={selectedFirst === opt.id}
                  checkedState="idle"
                  disabled={disabled}
                  onSelect={(id) => {
                    onTapSound?.();
                    updatePair(id, selectedSecond);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {task.reasons && task.reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-text)]">
              {secondTitle}
            </p>
            <div className="space-y-2">
              {task.reasons.map((reason) => (
                <AnswerOptionCard
                  key={reason.id}
                  option={reason}
                  selected={selectedSecond === reason.id}
                  checkedState="idle"
                  disabled={disabled}
                  onSelect={(id) => {
                    onTapSound?.();
                    updatePair(selectedFirst, id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
