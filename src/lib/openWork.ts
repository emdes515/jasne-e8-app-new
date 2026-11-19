import type { AiTutorEvaluationResult } from '../types/repositories';

export type OpenWorkMode = 'draw' | 'photo' | 'text';

export interface OpenWorkDraft {
  mode: OpenWorkMode;
  strokes: string[];
  photo: File | null;
  result: string;
}

export const EMPTY_OPEN_WORK: OpenWorkDraft = {
  mode: 'draw',
  strokes: [],
  photo: null,
  result: '',
};

export function hasVisualWork(draft: OpenWorkDraft): boolean {
  return draft.mode === 'draw' ? draft.strokes.length > 0 : draft.mode === 'photo' && Boolean(draft.photo);
}

export function getOpenAnswer(draft: OpenWorkDraft, text: string): string {
  if (draft.mode === 'text') return text.trim();
  return hasVisualWork(draft) ? draft.result.trim() : '';
}

function parseMathResult(input: string): number | null {
  const normalized = input.trim().replace('−', '-').replaceAll(',', '.');
  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*\/\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)))?$/);
  if (!match) return null;
  const parsed = Number(match[1]) / Number(match[2] ?? 1);
  return Number.isFinite(parsed) ? parsed : null;
}

export function matchesMathResult(answer: string, expected: string): boolean {
  const submitted = parseMathResult(answer);
  const target = parseMathResult(expected);
  return submitted !== null && target !== null && Math.abs(submitted - target) < 1e-9;
}

export function evaluateVisualWork(
  answer: string,
  expected: string,
  resultOnly: boolean
): AiTutorEvaluationResult {
  const matched = matchesMathResult(answer, expected);
  return {
    score: matched ? (resultOnly ? 2 : 1) : 0,
    maxScore: 2,
    feedback: matched
      ? 'Wpisany wynik jest poprawny. Porównaj swoje obliczenia z rozwiązaniem.'
      : 'Wpisany wynik różni się od oczekiwanego. Sprawdź kolejność i zapis obliczeń.',
    matchedKeywords: [],
    expectedResultFound: matched,
    isSimulatedPhase1: true,
    label: 'Ocena symulowana (Faza 1)',
  };
}
