'use client';

import React, { useRef, useState } from 'react';
import { Keyboard, Delete } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';
import { useAppState } from '../../context/AppStateContext';

interface SmartMathKeyboardProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  onSubmit?: () => void;
}

const MATH_KEYS = [
  '7',
  '8',
  '9',
  '-',
  '4',
  '5',
  '6',
  ',',
  '1',
  '2',
  '3',
  '/',
  '0',
  '√',
  '^',
  '⌫',
];

export function SmartMathKeyboard({
  value,
  onChange,
  disabled = false,
  onSubmit,
}: SmartMathKeyboardProps) {
  const { playSound } = useAppState();
  const [useSystemKeyboard, setUseSystemKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFocus = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    playSound('tap');
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < 24) {
      onChange(value + key);
    }
  };

  return (
    <div className="space-y-3">
      {/* Numeric Answer Input + System Keyboard Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label
          htmlFor="numeric-math-input"
          className="text-xs font-extrabold font-display text-[var(--text-secondary)]"
        >
          Twoja odpowiedź liczbowa:
        </label>

        <button
          type="button"
          onClick={() => {
            playSound('tap');
            setUseSystemKeyboard((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 60);
          }}
          className="min-h-[38px] px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-text)] hover:border-[var(--accent-primary)] cursor-pointer self-start sm:self-auto"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>
            {useSystemKeyboard
              ? 'Użyj SmartMathKeyboard'
              : 'Klawiatura systemowa'}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        id="numeric-math-input"
        type="text"
        inputMode={useSystemKeyboard ? 'text' : 'none'}
        disabled={disabled}
        value={value}
        onFocus={handleFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit && !disabled) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Wpisz wynik (np. 0 lub 10)"
        className="w-full min-h-[54px] px-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-lg font-extrabold font-display tabular-nums text-[var(--text-primary)]"
      />

      {/* Built-in Tactile SmartMathKeyboard */}
      {!useSystemKeyboard && (
        <div
          aria-label="Klawiatura matematyczna SmartMathKeyboard"
          className="p-3 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] grid grid-cols-4 gap-2"
        >
          {MATH_KEYS.map((k) => (
            <TactileButton
              key={k}
              variant={k === '⌫' ? 'danger' : 'secondary'}
              size="sm"
              disabled={disabled}
              onClick={() => handleKeyPress(k)}
              aria-label={k === '⌫' ? 'Usuń znak' : `Klawisz ${k}`}
              className="text-base font-extrabold tabular-nums"
            >
              {k === '⌫' ? <Delete className="w-4 h-4" /> : k}
            </TactileButton>
          ))}
        </div>
      )}
    </div>
  );
}
