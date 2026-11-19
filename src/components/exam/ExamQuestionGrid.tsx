'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { TaskDefinition } from '../../types/domain';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

interface ExamQuestionGridProps {
  open: boolean;
  onClose: () => void;
  tasks: TaskDefinition[];
  currentIndex: number;
  answers: Record<string, string>;
  savedTaskKeys: Set<string>;
  onSelectIndex: (idx: number) => void;
  onSubmitExamClick: () => void;
}

export function ExamQuestionGrid({
  open,
  onClose,
  tasks,
  currentIndex,
  answers,
  savedTaskKeys,
  onSelectIndex,
  onSubmitExamClick,
}: ExamQuestionGridProps) {
  const answeredCount = tasks.filter(
    (t) => (answers[t.id] ?? '').trim().length > 0
  ).length;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Siatka pytań Mini-Arkusza (1–5)"
      subtitle={`Odpowiedziano na ${answeredCount} z ${tasks.length} zadań`}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-5 gap-2.5">
          {tasks.map((task, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = (answers[task.id] ?? '').trim().length > 0;
            const isBookmarked = savedTaskKeys.has(
              `${task.id}:${task.subjectId}`
            );

            let btnStyle =
              'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]';
            if (isCurrent) {
              btnStyle =
                'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)] shadow-[0_4px_0_0_var(--accent-primary-edge)]';
            } else if (isAnswered) {
              btnStyle =
                'bg-[var(--success)]/15 border-[var(--success)] text-[var(--success)]';
            }

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                aria-label={`Przejdź do zadania ${idx + 1} (${
                  isAnswered ? 'odpowiedziane' : 'pominięte'
                })`}
                className={`relative min-h-[56px] rounded-2xl border-2 font-extrabold font-display text-base flex flex-col items-center justify-center cursor-pointer transition-all tabular-nums ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {isBookmarked && (
                  <Bookmark className="w-3.5 h-3.5 fill-current absolute top-1.5 right-1.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--accent-primary)] inline-block" />
            <span>Aktualne</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--success)] inline-block" />
            <span>Odpowiedziane</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] inline-block" />
            <span>Pominięte</span>
          </span>
        </div>

        <TactileButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            onClose();
            onSubmitExamClick();
          }}
        >
          Oddaj arkusz ({answeredCount}/{tasks.length})
        </TactileButton>
      </div>
    </BottomSheet>
  );
}
