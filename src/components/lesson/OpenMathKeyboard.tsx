'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  ChevronUp,
  CornerDownLeft,
  Delete,
  Keyboard,
} from 'lucide-react';
import type { MathKeyAction } from '../../lib/mathEditor';

export type MathKeyboardTab = 'calc' | 'algebra' | 'steps';

export interface OpenMathKeyboardProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  onCloseToSystemKeyboard: () => void;
  onKeyAction: (action: MathKeyAction) => void;
  disabled?: boolean;
}

interface KeyDef {
  id: string;
  label: string;
  ariaLabel: string;
  action: MathKeyAction;
  tone?: 'digit' | 'operator';
  hint?: string;
}

const QUICK_RIBBON_KEYS: KeyDef[] = [
  { id: 'q-mul', label: '·', ariaLabel: 'Pomnóż (·)', action: { kind: 'operator', value: '·' }, tone: 'operator' },
  { id: 'q-div', label: ':', ariaLabel: 'Podziel (:)', action: { kind: 'operator', value: ':' }, tone: 'operator' },
  { id: 'q-eq', label: '=', ariaLabel: 'Równa się (=)', action: { kind: 'operator', value: '=' }, tone: 'operator' },
  { id: 'q-sub', label: '−', ariaLabel: 'Minus lub liczba ujemna (−)', action: { kind: 'operator', value: '−' }, tone: 'operator' },
  { id: 'q-sqrt', label: '√', ariaLabel: 'Pierwiastek kwadratowy (√)', action: { kind: 'raw', value: '√' } },
  { id: 'q-cbrt', label: '∛', ariaLabel: 'Pierwiastek sześcienny (∛)', action: { kind: 'raw', value: '∛' } },
  { id: 'q-sq', label: '²', ariaLabel: 'Do kwadratu (²)', action: { kind: 'raw', value: '²' } },
  { id: 'q-cube', label: '³', ariaLabel: 'Do sześcianu (³)', action: { kind: 'raw', value: '³' } },
  { id: 'q-parens', label: '( )', ariaLabel: 'Wstaw lub otocz nawiasami', action: { kind: 'pair', open: '(', close: ')' } },
  { id: 'q-pct', label: '%', ariaLabel: 'Procent (%)', action: { kind: 'raw', value: '%' } },
  { id: 'q-pi', label: 'π', ariaLabel: 'Liczba pi (π)', action: { kind: 'raw', value: 'π' } },
  { id: 'q-deg', label: '°', ariaLabel: 'Stopnie (°)', action: { kind: 'raw', value: '°' } },
];

const CALC_TOP_ROW: KeyDef[] = [
  { id: 'c-parens', label: '( )', ariaLabel: 'Nawiasy ()', action: { kind: 'pair', open: '(', close: ')' } },
  { id: 'c-sqrt', label: '√', ariaLabel: 'Pierwiastek kwadratowy (√)', action: { kind: 'raw', value: '√' } },
  { id: 'c-cbrt', label: '∛', ariaLabel: 'Pierwiastek sześcienny (∛)', action: { kind: 'raw', value: '∛' } },
  { id: 'c-sq', label: '²', ariaLabel: 'Do kwadratu (²)', action: { kind: 'raw', value: '²' } },
  { id: 'c-cube', label: '³', ariaLabel: 'Do sześcianu (³)', action: { kind: 'raw', value: '³' } },
  { id: 'c-x', label: 'x', ariaLabel: 'Niewiadoma x', action: { kind: 'raw', value: 'x' } },
];

const CALC_GRID: KeyDef[] = [
  { id: 'k-7', label: '7', ariaLabel: 'Cyfra 7', action: { kind: 'raw', value: '7' } },
  { id: 'k-8', label: '8', ariaLabel: 'Cyfra 8', action: { kind: 'raw', value: '8' } },
  { id: 'k-9', label: '9', ariaLabel: 'Cyfra 9', action: { kind: 'raw', value: '9' } },
  { id: 'k-div', label: ':', ariaLabel: 'Podziel (:)', action: { kind: 'operator', value: ':' }, tone: 'operator' },
  { id: 'k-4', label: '4', ariaLabel: 'Cyfra 4', action: { kind: 'raw', value: '4' } },
  { id: 'k-5', label: '5', ariaLabel: 'Cyfra 5', action: { kind: 'raw', value: '5' } },
  { id: 'k-6', label: '6', ariaLabel: 'Cyfra 6', action: { kind: 'raw', value: '6' } },
  { id: 'k-mul', label: '·', ariaLabel: 'Pomnóż (·)', action: { kind: 'operator', value: '·' }, tone: 'operator' },
  { id: 'k-1', label: '1', ariaLabel: 'Cyfra 1', action: { kind: 'raw', value: '1' } },
  { id: 'k-2', label: '2', ariaLabel: 'Cyfra 2', action: { kind: 'raw', value: '2' } },
  { id: 'k-3', label: '3', ariaLabel: 'Cyfra 3', action: { kind: 'raw', value: '3' } },
  { id: 'k-sub', label: '−', ariaLabel: 'Odejmij lub minus (−)', action: { kind: 'operator', value: '−' }, tone: 'operator' },
  { id: 'k-comma', label: ',', ariaLabel: 'Przecinek dziesiętny', action: { kind: 'raw', value: ',' } },
  { id: 'k-0', label: '0', ariaLabel: 'Cyfra 0', action: { kind: 'raw', value: '0' } },
  { id: 'k-eq', label: '=', ariaLabel: 'Równa się (=)', action: { kind: 'operator', value: '=' }, tone: 'operator' },
  { id: 'k-add', label: '+', ariaLabel: 'Dodaj (+)', action: { kind: 'operator', value: '+' }, tone: 'operator' },
];

const ALGEBRA_TOP_ROW: KeyDef[] = [
  { id: 'a-parens', label: '( )', ariaLabel: 'Nawiasy ()', action: { kind: 'pair', open: '(', close: ')' } },
  { id: 'a-abs', label: '|x|', ariaLabel: 'Wartość bezwzględna', action: { kind: 'pair', open: '|', close: '|' } },
  { id: 'a-pct', label: '%', ariaLabel: 'Procent (%)', action: { kind: 'raw', value: '%' } },
  { id: 'a-slash', label: '/', ariaLabel: 'Kreska ułamkowa (/)', action: { kind: 'raw', value: '/' } },
  { id: 'a-pow', label: '^', ariaLabel: 'Potęga (^)', action: { kind: 'raw', value: '^' } },
  { id: 'a-imp', label: '⇒', ariaLabel: 'Wynika, że (⇒)', action: { kind: 'operator', value: '⇒' }, tone: 'operator' },
];

const ALGEBRA_GRID: KeyDef[] = [
  { id: 'v-x', label: 'x', ariaLabel: 'Zmienna x', action: { kind: 'raw', value: 'x' } },
  { id: 'v-y', label: 'y', ariaLabel: 'Zmienna y', action: { kind: 'raw', value: 'y' } },
  { id: 'v-a', label: 'a', ariaLabel: 'Bok lub liczba a', action: { kind: 'raw', value: 'a' } },
  { id: 'v-b', label: 'b', ariaLabel: 'Bok lub liczba b', action: { kind: 'raw', value: 'b' } },
  { id: 'v-h', label: 'h', ariaLabel: 'Wysokość h', action: { kind: 'raw', value: 'h' } },
  { id: 'v-r', label: 'r', ariaLabel: 'Promień r', action: { kind: 'raw', value: 'r' } },
  { id: 'v-pi', label: 'π', ariaLabel: 'Liczba pi (π)', action: { kind: 'raw', value: 'π' } },
  { id: 'v-deg', label: '°', ariaLabel: 'Stopnie (°)', action: { kind: 'raw', value: '°' } },
  { id: 'v-sqrt', label: '√', ariaLabel: 'Pierwiastek kwadratowy (√)', action: { kind: 'raw', value: '√' } },
  { id: 'v-cbrt', label: '∛', ariaLabel: 'Pierwiastek sześcienny (∛)', action: { kind: 'raw', value: '∛' } },
  { id: 'v-sq', label: '²', ariaLabel: 'Do kwadratu (²)', action: { kind: 'raw', value: '²' } },
  { id: 'v-cube', label: '³', ariaLabel: 'Do sześcianu (³)', action: { kind: 'raw', value: '³' } },
  { id: 'v-neq', label: '≠', ariaLabel: 'Różne od (≠)', action: { kind: 'operator', value: '≠' }, tone: 'operator' },
  { id: 'v-leq', label: '≤', ariaLabel: 'Mniejsze lub równe (≤)', action: { kind: 'operator', value: '≤' }, tone: 'operator' },
  { id: 'v-geq', label: '≥', ariaLabel: 'Większe lub równe (≥)', action: { kind: 'operator', value: '≥' }, tone: 'operator' },
  { id: 'v-approx', label: '≈', ariaLabel: 'W przybliżeniu (≈)', action: { kind: 'operator', value: '≈' }, tone: 'operator' },
];

const CKE_STEP_KEYS: KeyDef[] = [
  { id: 's-data', label: 'Dane:', ariaLabel: 'Wstaw sekcję Dane', action: { kind: 'step', value: 'Dane: ' }, tone: 'operator' },
  { id: 's-calc', label: 'Obliczenia:', ariaLabel: 'Wstaw sekcję Obliczenia', action: { kind: 'step', value: 'Obliczenia: ' }, tone: 'operator' },
  { id: 's-thus', label: 'Stąd:', ariaLabel: 'Wstaw sekcję Stąd', action: { kind: 'step', value: 'Stąd: ' }, tone: 'operator' },
  { id: 's-ans', label: 'Odp.:', ariaLabel: 'Wstaw sekcję Odpowiedź', action: { kind: 'step', value: 'Odp.: ' }, tone: 'operator' },
];

const UNIT_KEYS: KeyDef[] = [
  { id: 'u-cm', label: 'cm', ariaLabel: 'Jednostka centymetry (cm)', action: { kind: 'unit', value: 'cm' } },
  { id: 'u-cm2', label: 'cm²', ariaLabel: 'Jednostka centymetry kwadratowe (cm²)', action: { kind: 'unit', value: 'cm²' } },
  { id: 'u-cm3', label: 'cm³', ariaLabel: 'Jednostka centymetry sześcienne (cm³)', action: { kind: 'unit', value: 'cm³' } },
  { id: 'u-m', label: 'm', ariaLabel: 'Jednostka metry (m)', action: { kind: 'unit', value: 'm' } },
  { id: 'u-km', label: 'km', ariaLabel: 'Jednostka kilometry (km)', action: { kind: 'unit', value: 'km' } },
  { id: 'u-zl', label: 'zł', ariaLabel: 'Jednostka złote (zł)', action: { kind: 'unit', value: 'zł' } },
  { id: 'u-kg', label: 'kg', ariaLabel: 'Jednostka kilogramy (kg)', action: { kind: 'unit', value: 'kg' } },
  { id: 'u-l', label: 'l', ariaLabel: 'Jednostka litry (l)', action: { kind: 'unit', value: 'l' } },
];

const TAB_DEFS: { id: MathKeyboardTab; label: string; title: string }[] = [
  { id: 'calc', label: '123', title: 'Liczby i działania' },
  { id: 'algebra', label: 'f(x)', title: 'Algebra i geometria' },
  { id: 'steps', label: 'Odp.', title: 'Kroki CKE i jednostki' },
];

/**
 * Hybrydowa klawiatura matematyczna do zadań otwartych E8:
 * - Zawsze dostępny pasek szybkich symboli współpracujący z klawiaturą QWERTY telefonu
 * - Rozwijana 3-zakładkowa klawiatura (123 / f(x) / Odp.) z przypiętym paskiem nawigacji i ⌫
 */
export function OpenMathKeyboard({
  expanded,
  onToggleExpanded,
  onCloseToSystemKeyboard,
  onKeyAction,
  disabled = false,
}: OpenMathKeyboardProps) {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<MathKeyboardTab>('calc');

  if (disabled) {
    return null;
  }

  const preventFocusLoss = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const getKeyButtonClass = (tone: KeyDef['tone'] = 'digit') =>
    tone === 'operator'
      ? 'bg-[var(--bg-surface)] text-[var(--accent-text)] border border-[var(--accent-primary)]/45 shadow-[0_2px_0_0_var(--border-3d-edge)] font-extrabold'
      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] font-bold';

  return (
    <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/65">
      {/* Zawsze dostępny pasek szybkich symboli (działa również podczas pisania z klawiatury systemowej) */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <div
          role="toolbar"
          aria-label="Szybkie symbole matematyczne"
          className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto no-scrollbar"
        >
          {QUICK_RIBBON_KEYS.map((key) => (
            <button
              key={key.id}
              type="button"
              aria-label={key.ariaLabel}
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction(key.action)}
              className={`min-h-[44px] min-w-[44px] px-2 shrink-0 rounded-lg text-sm font-display tabular-nums flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                key.tone
              )}`}
            >
              {key.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-label={
            expanded
              ? 'Zwiń klawiaturę matematyczną i wróć do ABC'
              : 'Otwórz pełną klawiaturę matematyczną'
          }
          onMouseDown={preventFocusLoss}
          onClick={onToggleExpanded}
          className={`shrink-0 min-h-[44px] px-2.5 rounded-lg border font-display font-extrabold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
            expanded
              ? 'bg-[var(--accent-primary)] text-[var(--on-accent)] border-[var(--accent-primary-edge)]'
              : 'bg-[var(--bg-surface)] text-[var(--accent-text)] border-[var(--accent-primary)]/45 hover:border-[var(--accent-primary)]'
          }`}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zwiń</span>
            </>
          ) : (
            <>
              <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
              <span>123</span>
            </>
          )}
        </button>
      </div>

      {/* Rozwijana 3-zakładkowa klawiatura matematyczna */}
      {expanded && (
        <motion.div
          aria-label="Pełna klawiatura matematyczna"
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, transform: 'translateY(6px)' }
          }
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-[var(--border-subtle)] p-2 space-y-2"
        >
          {/* Pasek 3 zakładek */}
          <div
            role="tablist"
            aria-label="Kategorie klawiatury matematycznej"
            className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--bg-canvas)]/70 p-1 border border-[var(--border-subtle)]"
          >
            {TAB_DEFS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  title={tab.title}
                  onMouseDown={preventFocusLoss}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] min-w-0 px-1 rounded-lg text-xs font-extrabold font-display truncate transition-colors cursor-pointer select-none ${
                    selected
                      ? 'bg-[var(--accent-primary)] text-[var(--on-accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Zawartość aktywnej zakładki */}
          {activeTab === 'calc' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                {CALC_TOP_ROW.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    aria-label={key.ariaLabel}
                    onMouseDown={preventFocusLoss}
                    onClick={() => onKeyAction(key.action)}
                    className={`min-h-[44px] min-w-0 px-0 rounded-lg text-[13px] font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                      key.tone
                    )}`}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {CALC_GRID.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    aria-label={key.ariaLabel}
                    onMouseDown={preventFocusLoss}
                    onClick={() => onKeyAction(key.action)}
                    className={`min-h-[44px] min-w-0 px-0 rounded-xl text-base font-display tabular-nums flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                      key.tone
                    )}`}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'algebra' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                {ALGEBRA_TOP_ROW.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    aria-label={key.ariaLabel}
                    onMouseDown={preventFocusLoss}
                    onClick={() => onKeyAction(key.action)}
                    className={`min-h-[44px] min-w-0 px-0 rounded-lg text-[13px] font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                      key.tone
                    )}`}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {ALGEBRA_GRID.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    aria-label={key.ariaLabel}
                    onMouseDown={preventFocusLoss}
                    onClick={() => onKeyAction(key.action)}
                    className={`min-h-[44px] min-w-0 px-0 rounded-xl text-base font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                      key.tone
                    )}`}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="px-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
                  Szablony zapisu CKE (nowa linia):
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CKE_STEP_KEYS.map((key) => (
                    <button
                      key={key.id}
                      type="button"
                      aria-label={key.ariaLabel}
                      onMouseDown={preventFocusLoss}
                      onClick={() => onKeyAction(key.action)}
                      className={`min-h-[44px] min-w-0 px-2 rounded-xl text-xs sm:text-sm font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                        key.tone
                      )}`}
                    >
                      {key.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="px-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
                  Jednostki E8:
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {UNIT_KEYS.map((key) => (
                    <button
                      key={key.id}
                      type="button"
                      aria-label={key.ariaLabel}
                      onMouseDown={preventFocusLoss}
                      onClick={() => onKeyAction(key.action)}
                      className={`min-h-[44px] min-w-0 px-1 rounded-xl text-xs sm:text-sm font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none ${getKeyButtonClass(
                        key.tone
                      )}`}
                    >
                      {key.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Przypięty dolny pasek sterowania widoczny na każdej zakładce (bezpieczny od 320px wzwyż) */}
          <div className="grid grid-cols-3 sm:grid-cols-[1.25fr_0.9fr_0.9fr_1.15fr_0.9fr_1.15fr] gap-1 pt-0.5">
            <button
              type="button"
              aria-label="Przełącz na klawiaturę systemową ABC"
              onMouseDown={preventFocusLoss}
              onClick={onCloseToSystemKeyboard}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--bg-surface)] text-[var(--accent-text)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] text-[11px] font-extrabold font-display inline-flex items-center justify-center gap-1 transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <Keyboard className="w-3.5 h-3.5 shrink-0 hidden sm:inline" aria-hidden="true" />
              <span>ABC</span>
            </button>

            <button
              type="button"
              aria-label="Przesuń kursor w lewo"
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction({ kind: 'caret', delta: -1 })}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Przesuń kursor w prawo"
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction({ kind: 'caret', delta: 1 })}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Wstaw spację"
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction({ kind: 'raw', value: ' ' })}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] text-xs font-bold font-display flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <span className="sm:hidden">␣</span>
              <span className="hidden sm:inline">Spacja</span>
            </button>

            <button
              type="button"
              aria-label="Wstaw nową linię"
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction({ kind: 'raw', value: '\n' })}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[0_2px_0_0_var(--border-3d-edge)] flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <CornerDownLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Usuń znak lub operator"
              onMouseDown={preventFocusLoss}
              onClick={() => onKeyAction({ kind: 'backspace' })}
              className="min-h-[44px] min-w-0 px-0 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/35 shadow-[0_2px_0_0_var(--border-3d-edge)] flex items-center justify-center transition-transform active:translate-y-[1px] cursor-pointer select-none"
            >
              <Delete className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
