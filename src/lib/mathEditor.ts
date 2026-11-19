export const MAX_OPEN_TEXT_LENGTH = 1000;

export interface EditorSelectionState {
  text: string;
  start: number;
  end: number;
}

export type MathKeyAction =
  | { kind: 'raw'; value: string }
  | { kind: 'operator'; value: string }
  | { kind: 'pair'; open: string; close: string }
  | { kind: 'unit'; value: string }
  | { kind: 'step'; value: string }
  | { kind: 'backspace' }
  | { kind: 'caret'; delta: -1 | 1 };

const UNARY_MINUS_PRECEDERS = new Set([
  '\n',
  '(',
  '[',
  '=',
  '+',
  '−',
  '-',
  '·',
  ':',
  '/',
  '^',
  '√',
  '∛',
  '⇒',
  '≠',
  '≤',
  '≥',
  '≈',
]);

const PADDED_OPERATOR_SUFFIXES = [
  ' + ',
  ' − ',
  ' · ',
  ' : ',
  ' = ',
  ' ≠ ',
  ' ≤ ',
  ' ≥ ',
  ' ≈ ',
  ' ⇒ ',
] as const;

export function clampSelection(
  text: string,
  rawStart: number,
  rawEnd: number
): { start: number; end: number } {
  const start = Math.max(0, Math.min(text.length, rawStart));
  const end = Math.max(start, Math.min(text.length, rawEnd));
  return { start, end };
}

export function insertRawText(
  state: EditorSelectionState,
  content: string,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  const next = state.text.slice(0, start) + content + state.text.slice(end);
  if (next.length > maxLength) {
    return { text: state.text, start, end };
  }
  const caret = start + content.length;
  return { text: next, start: caret, end: caret };
}

export function insertMathOperator(
  state: EditorSelectionState,
  op: string,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  const before = state.text.slice(0, start);
  const after = state.text.slice(end);

  if (op === '−') {
    const trimmedBefore = before.replace(/[ \t]+$/, '');
    const lastTrimmedChar = trimmedBefore.slice(-1);
    const isUnary =
      trimmedBefore.length === 0 || UNARY_MINUS_PRECEDERS.has(lastTrimmedChar);
    if (isUnary) {
      return insertRawText({ text: state.text, start, end }, '−', maxLength);
    }
  }

  const lastBeforeChar = before.slice(-1);
  const needsLeadingSpace =
    before.length > 0 && !/[\s([]/.test(lastBeforeChar);

  const firstAfterChar = after.slice(0, 1);
  const needsTrailingSpace =
    after.length === 0 || !/[\s)\]]/.test(firstAfterChar);

  const inserted = `${needsLeadingSpace ? ' ' : ''}${op}${needsTrailingSpace ? ' ' : ''}`;
  const next = before + inserted + after;
  if (next.length > maxLength) {
    return { text: state.text, start, end };
  }
  const caret = start + inserted.length;
  return { text: next, start: caret, end: caret };
}

export function wrapOrInsertPair(
  state: EditorSelectionState,
  open: string,
  close: string,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  const before = state.text.slice(0, start);
  const selected = state.text.slice(start, end);
  const after = state.text.slice(end);

  const inserted = `${open}${selected}${close}`;
  const next = before + inserted + after;
  if (next.length > maxLength) {
    return { text: state.text, start, end };
  }

  const caret =
    start !== end ? start + inserted.length : start + open.length;
  return { text: next, start: caret, end: caret };
}

export function insertUnit(
  state: EditorSelectionState,
  unit: string,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  const before = state.text.slice(0, start);
  const lastChar = before.slice(-1);
  const needsSpace = before.length > 0 && !/[\s([=]/.test(lastChar);
  return insertRawText(
    { text: state.text, start, end },
    `${needsSpace ? ' ' : ''}${unit}`,
    maxLength
  );
}

export function insertStepTemplate(
  state: EditorSelectionState,
  label: string,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  const before = state.text.slice(0, start);
  const lastNewline = before.lastIndexOf('\n');
  const currentLineBefore = before.slice(lastNewline + 1);
  const needsNewline = currentLineBefore.trim().length > 0;
  return insertRawText(
    { text: state.text, start, end },
    `${needsNewline ? '\n' : ''}${label}`,
    maxLength
  );
}

export function applySmartBackspace(
  state: EditorSelectionState
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  if (start !== end) {
    return {
      text: state.text.slice(0, start) + state.text.slice(end),
      start,
      end: start,
    };
  }
  if (start === 0) {
    return { text: state.text, start: 0, end: 0 };
  }

  const prevChar = state.text[start - 1];
  const nextChar = state.text[start];
  if (
    (prevChar === '(' && nextChar === ')') ||
    (prevChar === '|' && nextChar === '|')
  ) {
    return {
      text: state.text.slice(0, start - 1) + state.text.slice(start + 1),
      start: start - 1,
      end: start - 1,
    };
  }

  if (start >= 3) {
    const tail3 = state.text.slice(start - 3, start);
    if (
      PADDED_OPERATOR_SUFFIXES.includes(
        tail3 as (typeof PADDED_OPERATOR_SUFFIXES)[number]
      )
    ) {
      return {
        text: state.text.slice(0, start - 3) + state.text.slice(start),
        start: start - 3,
        end: start - 3,
      };
    }
  }

  return {
    text: state.text.slice(0, start - 1) + state.text.slice(start),
    start: start - 1,
    end: start - 1,
  };
}

export function moveCaret(
  state: EditorSelectionState,
  delta: -1 | 1
): EditorSelectionState {
  const { start, end } = clampSelection(state.text, state.start, state.end);
  if (start !== end) {
    const collapsed = delta < 0 ? start : end;
    return { text: state.text, start: collapsed, end: collapsed };
  }
  const nextCaret = Math.max(0, Math.min(state.text.length, start + delta));
  return { text: state.text, start: nextCaret, end: nextCaret };
}

export function applyMathKeyAction(
  state: EditorSelectionState,
  action: MathKeyAction,
  maxLength: number = MAX_OPEN_TEXT_LENGTH
): EditorSelectionState {
  switch (action.kind) {
    case 'raw':
      return insertRawText(state, action.value, maxLength);
    case 'operator':
      return insertMathOperator(state, action.value, maxLength);
    case 'pair':
      return wrapOrInsertPair(state, action.open, action.close, maxLength);
    case 'unit':
      return insertUnit(state, action.value, maxLength);
    case 'step':
      return insertStepTemplate(state, action.value, maxLength);
    case 'backspace':
      return applySmartBackspace(state);
    case 'caret':
      return moveCaret(state, action.delta);
  }
}
