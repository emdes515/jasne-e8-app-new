'use client';

import { useId, useRef, useState } from 'react';
import { Camera, Keyboard, Pencil } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';
import { OpenWorkPad } from './OpenWorkPad';
import { OpenWorkPhoto } from './OpenWorkPhoto';
import type { OpenWorkDraft, OpenWorkMode } from '../../lib/openWork';

const methods = [
  { id: 'draw', label: 'Odręcznie', Icon: Pencil },
  { id: 'photo', label: 'Zdjęcie', Icon: Camera },
  { id: 'text', label: 'Klawiatura', Icon: Keyboard },
] as const;

const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '−', '×', '÷', '/', ',', '(', ')', '=', '%', '√', '²', '^'];

export function OpenWorkInput({ work, onWorkChange, text, onTextChange, disabled, optionalResult = false }: {
  work: OpenWorkDraft;
  onWorkChange: (patch: Partial<OpenWorkDraft>) => void;
  text: string;
  onTextChange: (value: string) => void;
  disabled: boolean;
  optionalResult?: boolean;
}) {
  const textField = useRef<HTMLTextAreaElement>(null);
  const textId = useId();
  const resultId = useId();
  const [mathPadOpen, setMathPadOpen] = useState(false);

  function selectMode(mode: OpenWorkMode) {
    onWorkChange({ mode });
  }

  function insert(symbol: string) {
    const field = textField.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const next = text.slice(0, start) + symbol + text.slice(end);
    if (next.length > 1000) return;
    onTextChange(next);
    requestAnimationFrame(() => {
      field.focus({ preventScroll: true });
      field.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  }

  return (
    <div className="space-y-4">
      <fieldset disabled={disabled}>
        <legend className="mb-2 text-sm font-bold">Jak zapiszesz rozwiązanie?</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {methods.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={work.mode === id}
              onClick={() => selectMode(id)}
              className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border px-1.5 text-xs font-semibold sm:gap-2 sm:text-sm ${work.mode === id ? 'border-[var(--accent-text)] bg-[var(--accent-primary)]/12 text-[var(--accent-text)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}
            >
              <Icon size={16} className="hidden shrink-0 min-[360px]:block" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {work.mode === 'draw' && <OpenWorkPad strokes={work.strokes} disabled={disabled} onChange={(strokes) => onWorkChange({ strokes })} />}
      {work.mode === 'photo' && <OpenWorkPhoto savesDraft={optionalResult} photo={work.photo} disabled={disabled} onChange={(photo) => onWorkChange({ photo })} />}
      {work.mode === 'text' ? (
        <div className="space-y-2">
          <label htmlFor={textId} className="block text-sm font-semibold">Zapisz obliczenia lub uzasadnienie</label>
          <textarea
            ref={textField}
            id={textId}
            rows={4}
            maxLength={1000}
            disabled={disabled}
            inputMode={mathPadOpen ? 'none' : 'text'}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Wpisz obliczenia i końcowy wynik"
            className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-base"
          />
          {!disabled && (
            <TactileButton variant="secondary" size="sm" aria-expanded={mathPadOpen} onClick={() => setMathPadOpen((open) => !open)}>
              <Keyboard size={16} /> {mathPadOpen ? 'Ukryj klawiaturę matematyczną' : 'Pokaż klawiaturę matematyczną'}
            </TactileButton>
          )}
          {!disabled && mathPadOpen && (
            <div aria-label="Klawiatura matematyczna" className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
              {symbols.map((symbol) => (
                <TactileButton key={symbol} variant="secondary" size="sm" className="!px-0 text-base" onMouseDown={(event) => event.preventDefault()} onClick={() => insert(symbol)}>
                  {symbol}
                </TactileButton>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor={resultId} className="block text-sm font-semibold">{optionalResult ? "Wynik końcowy (opcjonalnie)" : "Wynik końcowy"}</label>
          <input
            id={resultId}
            type="text"
            inputMode="decimal"
            value={work.result}
            disabled={disabled}
            maxLength={32}
            placeholder="Wpisz samą liczbę"
            aria-describedby={resultId + '-check'}
            className="min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-base tabular-nums"
            onChange={(event) => onWorkChange({ result: event.target.value })}
          />
          <p id={resultId + '-check'} className="text-xs text-[var(--text-secondary)]">
            {optionalResult
              ? 'Możesz porównać swój zapis z rozwiązaniem albo wpisać liczbę do sprawdzenia.'
              : 'Sprawdzamy wpisany wynik. Zapis obliczeń porównasz z rozwiązaniem.'}
          </p>
        </div>
      )}
    </div>
  );
}
