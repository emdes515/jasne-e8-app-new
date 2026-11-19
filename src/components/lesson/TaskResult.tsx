'use client';

import type { Ref } from 'react';
import { AlertCircle, ArrowRight, Bookmark, CheckCircle2, ChevronDown, XCircle } from 'lucide-react';
import type { TaskDefinition, TaskEvalOutcome } from '../../types/domain';
import { hasVisualWork, type OpenWorkDraft } from '../../lib/openWork';
import { MathText } from '../ui/MathText';
import { TactileButton } from '../ui/TactileButton';
import { OpenWorkPad } from './OpenWorkPad';
import { PhotoPreview } from './OpenWorkPhoto';

const outcomes = {
  correct: { title: 'Dobra odpowiedź', icon: CheckCircle2, color: 'var(--success)' },
  wrong: { title: 'Błędna odpowiedź', icon: XCircle, color: 'var(--danger)' },
  partial: { title: 'Częściowe punkty', icon: AlertCircle, color: 'var(--accent-text)' },
  ungraded: { title: 'Rozwiązanie porównane', icon: CheckCircle2, color: 'var(--accent-text)' },
};

export function TaskResult({
  task, headingRef, outcome, xpAwarded, userAnswer, tutorScore, tutorFeedback,
  isSaved, onToggleSaved, onContinue, continueLabel, visualWork,
}: {
  task: TaskDefinition;
  headingRef: Ref<HTMLHeadingElement>;
  outcome: TaskEvalOutcome;
  xpAwarded: number;
  userAnswer?: string;
  tutorScore?: number;
  tutorFeedback?: string;
  isSaved: boolean;
  onToggleSaved: () => void;
  onContinue: () => void;
  continueLabel: string;
  visualWork: OpenWorkDraft;
}) {
  const { title, icon: Icon, color } = outcomes[outcome];
  const expectedAnswer = task.options?.find((option) => option.id === task.correctAnswer)?.label ?? task.correctAnswer;
  const submittedAnswer = task.options?.find((option) => option.id === userAnswer)?.label ?? userAnswer;

  return (
    <section className="study-panel task-result" aria-labelledby="task-result-heading">
      <div className="task-result-content">
        <div className="flex items-start justify-between gap-2">
          <h2 ref={headingRef} tabIndex={-1} id="task-result-heading" className="flex items-center gap-2 text-lg font-extrabold leading-tight focus-visible:outline-none sm:text-2xl">
            <Icon size={20} className="shrink-0" style={{ color }} aria-hidden="true" />
            {title}
          </h2>
          {xpAwarded > 0 && (
            <span className="shrink-0 rounded-lg bg-[var(--accent-primary)]/12 px-2 py-1 text-xs font-bold text-[var(--accent-text)]">+{xpAwarded} XP</span>
          )}
        </div>
        {outcome === 'wrong' && <p className="text-xs text-[var(--text-secondary)]">Zapisano w Banku Błędów.</p>}
        {tutorScore !== undefined && (
          <p className="text-xs font-semibold text-[var(--text-secondary)]">{tutorScore}/2 pkt · Ocena symulowana</p>
        )}

        {outcome === 'wrong' && task.type !== 'open' && (
          <dl className="task-result-answers">
            {submittedAnswer && (
              <div>
                <dt>Twoja odpowiedź</dt>
                <dd><MathText text={submittedAnswer} /></dd>
              </div>
            )}
            <div>
              <dt>Poprawna odpowiedź</dt>
              <dd><MathText text={expectedAnswer} /></dd>
            </div>
          </dl>
        )}

        <div className="rounded-xl bg-[var(--bg-elevated)] p-3 sm:p-4">
          <h3 className="mb-1 text-sm font-extrabold">Wyjaśnienie</h3>
          <div className="text-sm leading-relaxed text-[var(--text-primary)] sm:text-base">
            <MathText text={task.explanation} />
          </div>
        </div>

        <details className="task-result-details">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            Pokaż zadanie i szczegóły
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <div className="space-y-3 pb-2 text-sm">
            <p className="break-words"><MathText text={task.prompt} /></p>
            {task.type === 'open' && userAnswer && <p className="whitespace-pre-wrap break-words"><strong>Twój zapis </strong>{userAnswer}</p>}
            {tutorFeedback && <p className="text-[var(--text-secondary)]">{tutorFeedback}</p>}
            {hasVisualWork(visualWork) && visualWork.mode === 'draw' && <OpenWorkPad strokes={visualWork.strokes} disabled onChange={() => {}} />}
            {visualWork.mode === 'photo' && visualWork.photo && <PhotoPreview file={visualWork.photo} />}
            <TactileButton size="sm" variant="secondary" aria-pressed={isSaved} onClick={onToggleSaved}>
              <Bookmark size={16} aria-hidden="true" />
              {isSaved ? 'Zapisane do powtórki' : 'Zapisz do powtórki'}
            </TactileButton>
          </div>
        </details>
      </div>

      <div className="task-result-action">
        <TactileButton fullWidth onClick={onContinue}>
          {continueLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </TactileButton>
      </div>
    </section>
  );
}
