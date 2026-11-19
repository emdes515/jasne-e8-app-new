'use client';

import { useId, useRef, useState } from 'react';
import { Camera, Eraser, Keyboard, Pencil, Undo2 } from 'lucide-react';
import { OpenWorkPad } from './OpenWorkPad';
import { OpenWorkPhoto } from './OpenWorkPhoto';
import { OpenMathKeyboard } from './OpenMathKeyboard';
import {
  applyMathKeyAction,
  clampSelection,
  insertRawText,
  MAX_OPEN_TEXT_LENGTH,
  type MathKeyAction,
} from '../../lib/mathEditor';
import type { OpenWorkDraft, OpenWorkMode } from '../../lib/openWork';

const methods = [
  { id: 'draw', label: 'Odręcznie', Icon: Pencil },
  { id: 'photo', label: 'Zdjęcie', Icon: Camera },
  { id: 'text', label: 'Klawiatura', Icon: Keyboard },
] as const;

const RESULT_HELPER_CHARS = [
  { char: '−' as const, label: '−', ariaLabel: 'Wstaw znak minus (−)' },
  { char: '/' as const, label: '/', ariaLabel: 'Wstaw kreskę ułamkową (/)' },
  { char: ',' as const, label: ',', ariaLabel: 'Wstaw przecinek (,)' },
];

export function OpenWorkInput({
  work,
  onWorkChange,
  text,
  onTextChange,
  disabled,
  optionalResult = false,
}: {
  work: OpenWorkDraft;
  onWorkChange: (patch: Partial<OpenWorkDraft>) => void;
  text: string;
  onTextChange: (value: string) => void;
  disabled: boolean;
  optionalResult?: boolean;
}) {
  const textField = useRef<HTMLTextAreaElement>(null);
  const resultField = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: text.length,
    end: text.length,
  });
  const textId = useId();
  const resultId = useId();
  const [mathPadOpen, setMathPadOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  function selectMode(mode: OpenWorkMode) {
    onWorkChange({ mode });
  }

  function syncSelectionFromField() {
    const field = textField.current;
    if (
      !field ||
      (typeof document !== 'undefined' && document.activeElement !== field)
    ) {
      return;
    }
    selectionRef.current = {
      start: field.selectionStart ?? text.length,
      end: field.selectionEnd ?? text.length,
    };
  }

  function focusAndSetCaret(start: number, end: number) {
    selectionRef.current = { start, end };
    requestAnimationFrame(() => {
      const field = textField.current;
      if (!field) return;
      field.focus({ preventScroll: true });
      field.setSelectionRange(start, end);
    });
  }

  function pushUndoSnapshot(snapshot: string) {
    setUndoStack((prev) => [...prev.slice(-24), snapshot]);
  }

  function handleKeyAction(action: MathKeyAction) {
    if (disabled) return;
    const field = textField.current;
    const isFieldFocused =
      typeof document !== 'undefined' && field !== null && document.activeElement === field;
    const rawStart = isFieldFocused
      ? field.selectionStart ?? selectionRef.current.start
      : selectionRef.current.start;
    const rawEnd = isFieldFocused
      ? field.selectionEnd ?? selectionRef.current.end
      : selectionRef.current.end;
    const clamped = clampSelection(text, rawStart, rawEnd);

    const next = applyMathKeyAction(
      { text, start: clamped.start, end: clamped.end },
      action,
      MAX_OPEN_TEXT_LENGTH
    );

    if (next.text !== text) {
      pushUndoSnapshot(text);
      onTextChange(next.text);
    }

    focusAndSetCaret(next.start, next.end);
  }

  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    if (nextValue !== text) {
      pushUndoSnapshot(text);
      onTextChange(nextValue);
    }
    selectionRef.current = {
      start: event.target.selectionStart ?? nextValue.length,
      end: event.target.selectionEnd ?? nextValue.length,
    };
  }

  function handleUndo() {
    if (disabled || undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    onTextChange(previous);
    const caret = previous.length;
    focusAndSetCaret(caret, caret);
  }

  function handleClear() {
    if (disabled || text.length === 0) return;
    pushUndoSnapshot(text);
    onTextChange('');
    focusAndSetCaret(0, 0);
  }

  function handleSwitchToSystemKeyboard() {
    setMathPadOpen(false);
    const field = textField.current;
    const isFieldFocused =
      typeof document !== 'undefined' && field !== null && document.activeElement === field;
    const pos = isFieldFocused
      ? field.selectionEnd ?? selectionRef.current.end
      : selectionRef.current.end;
    const clamped = clampSelection(text, pos, pos);
    requestAnimationFrame(() => {
      const target = textField.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(clamped.start, clamped.end);
    });
  }

  function handleInsertResultChar(ch: '−' | '/' | ',') {
    if (disabled) return;
    const input = resultField.current;
    const isInputFocused =
      typeof document !== 'undefined' && input !== null && document.activeElement === input;
    const start = isInputFocused ? input.selectionStart ?? work.result.length : work.result.length;
    const end = isInputFocused ? input.selectionEnd ?? work.result.length : work.result.length;
    const next = insertRawText({ text: work.result, start, end }, ch, 32);
    onWorkChange({ result: next.text });
    requestAnimationFrame(() => {
      const target = resultField.current;
      if (!target) return;
      target.focus({ preventScroll: true });
      target.setSelectionRange(next.start, next.end);
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
              className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border px-1.5 text-xs font-semibold sm:gap-2 sm:text-sm cursor-pointer transition-colors ${
                work.mode === id
                  ? 'border-[var(--accent-text)] bg-[var(--accent-primary)]/12 text-[var(--accent-text)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Icon size={16} className="hidden shrink-0 min-[360px]:block" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {work.mode === 'draw' && (
        <OpenWorkPad
          strokes={work.strokes}
          disabled={disabled}
          onChange={(strokes) => onWorkChange({ strokes })}
        />
      )}
      {work.mode === 'photo' && (
        <OpenWorkPhoto
          savesDraft={optionalResult}
          photo={work.photo}
          disabled={disabled}
          onChange={(photo) => onWorkChange({ photo })}
        />
      )}
      {work.mode === 'text' ? (
        <div className="space-y-1.5">
          {/* Zintegrowana karta Notatnika Matematycznego */}
          <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden focus-within:border-[var(--accent-primary)] transition-colors">
            {/* Nagłówek edytora z Cofnij / Wyczyść */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65">
              <label
                htmlFor={textId}
                className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate"
              >
                Zapisz obliczenia i wynik
              </label>

              {!disabled && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={undoStack.length === 0}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleUndo}
                    aria-label="Cofnij ostatnią zmianę"
                    className={`min-h-[32px] px-2 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors select-none ${
                      undoStack.length === 0
                        ? 'border-transparent text-[var(--text-secondary)]/45 cursor-not-allowed'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
                    }`}
                  >
                    <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden min-[380px]:inline">Cofnij</span>
                  </button>

                  {text.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleClear}
                      aria-label="Wyczyść zapis rozwiązania"
                      className="min-h-[32px] px-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--danger)] inline-flex items-center gap-1 transition-colors cursor-pointer select-none"
                    >
                      <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden min-[440px]:inline">Wyczyść</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pole tekstowe 16px (zapobiega przybliżaniu na iOS) */}
            <textarea
              ref={textField}
              id={textId}
              rows={5}
              maxLength={MAX_OPEN_TEXT_LENGTH}
              disabled={disabled}
              inputMode={mathPadOpen ? 'none' : 'text'}
              value={text}
              onChange={handleTextareaChange}
              onSelect={syncSelectionFromField}
              onClick={syncSelectionFromField}
              onKeyUp={syncSelectionFromField}
              onFocus={syncSelectionFromField}
              placeholder={
                'Np. Dane: a = 7 cm\nObliczenia: P = 7 · 7 = 49 cm²\nOdp.: Pole wynosi 49 cm².'
              }
              className="w-full resize-y bg-transparent px-3.5 py-3 text-base leading-relaxed tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/65 focus:outline-none"
            />

            {/* Dokowana hybrydowa klawiatura matematyczna */}
            <OpenMathKeyboard
              expanded={mathPadOpen}
              onToggleExpanded={() => {
                syncSelectionFromField();
                setMathPadOpen((prev) => !prev);
              }}
              onCloseToSystemKeyboard={handleSwitchToSystemKeyboard}
              onKeyAction={handleKeyAction}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-[var(--text-secondary)]">
            <span>Łącz tekst z klawiatury i symbole z paska.</span>
            <span className="tabular-nums font-semibold shrink-0">
              {text.length}/{MAX_OPEN_TEXT_LENGTH}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor={resultId} className="block text-sm font-semibold">
            {optionalResult ? 'Wynik końcowy (opcjonalnie)' : 'Wynik końcowy'}
          </label>
          <div className="flex items-center gap-1.5">
            <input
              ref={resultField}
              id={resultId}
              type="text"
              inputMode="decimal"
              value={work.result}
              disabled={disabled}
              maxLength={32}
              placeholder="Wpisz samą liczbę"
              aria-describedby={resultId + '-check'}
              className="min-h-12 flex-1 min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-base tabular-nums"
              onChange={(event) => onWorkChange({ result: event.target.value })}
            />
            {!disabled && (
              <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Znaki wyniku">
                {RESULT_HELPER_CHARS.map((btn) => (
                  <button
                    key={btn.char}
                    type="button"
                    aria-label={btn.ariaLabel}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertResultChar(btn.char)}
                    className="min-h-[44px] min-w-[42px] sm:min-w-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-base font-extrabold font-display text-[var(--accent-text)] shadow-[0_2px_0_0_var(--border-3d-edge)] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer select-none"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
