// src/services/ai/aiTutorMock.ts

import { OpenTaskRubric } from '../../types/domain';
import { AiTutorEvaluationResult, IAiTutorService } from '../../types/repositories';

export const MOCK_AI_LATENCY_MS = 700;

/**
 * Strips Polish diacritics from a lowercase string.
 */
function stripPolishDiacritics(input: string): string {
  const map: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
  };
  return input.replace(/[ąćęłńóśźż]/g, (ch) => map[ch] || ch);
}

/**
 * Normalizes text in the exact mandatory order from Master Spec Section 7.6:
 * 1. trim and toLowerCase
 * 2. replace decimal commas between digits with dots BEFORE removing punctuation (10,0 -> 10.0, 4,50 -> 4.50)
 * 3. strip diacritics and remove remaining punctuation (preserving dots inside decimal numbers)
 * 4. split into tokens by whitespace
 */
export function normalizeForAiTutor(raw: string): {
  normalizedText: string;
  tokens: string[];
} {
  const step1 = raw.trim().toLowerCase();
  if (!step1) {
    return { normalizedText: '', tokens: [] };
  }

  // Step 2: replace decimal comma between digits with a dot
  const step2 = step1.replace(/(\d),(\d)/g, '$1.$2');

  // Step 3: strip Polish diacritics and remove non-alphanumeric punctuation except decimal dots between digits
  const step3Diacritics = stripPolishDiacritics(step2);
  // Protect decimal dots between digits, replace other symbols (like =, +, -, *, /, (, ), cm^2) with spaces
  const step3Clean = step3Diacritics
    .replace(/(\d)\.(\d)/g, '$1DOTPLACEHOLDER$2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/DOTPLACEHOLDER/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = step3Clean ? step3Clean.split(/\s+/) : [];
  return {
    normalizedText: step3Clean,
    tokens,
  };
}

/**
 * Compares two single tokens as either numeric values (10 === 10.0, 4.5 === 4.50, 10 !== 100)
 * or exact normalized word tokens. NEVER matches substrings ('3' never matches '30' or '13').
 */
export function tokensMatch(tokenA: string, tokenB: string): boolean {
  if (!tokenA || !tokenB) return false;
  const numA = Number(tokenA);
  const numB = Number(tokenB);
  const isNumA = !Number.isNaN(numA) && /^-?\d+(\.\d+)?$/.test(tokenA);
  const isNumB = !Number.isNaN(numB) && /^-?\d+(\.\d+)?$/.test(tokenB);

  if (isNumA && isNumB) {
    return Math.abs(numA - numB) < 1e-9;
  }
  return tokenA === tokenB;
}

/**
 * Checks if a target value/keyword appears as a whole token in `tokens`.
 * Note: for keywords like '450' (from 4,50) we also check normalized token forms.
 */
export function containsWholeToken(tokens: string[], targetRaw: string): boolean {
  const { tokens: targetTokens } = normalizeForAiTutor(targetRaw);
  if (targetTokens.length === 0) return false;
  const target = targetTokens[0];

  for (const t of tokens) {
    if (tokensMatch(t, target)) return true;
    // Also support legacy rubric keywords like '450' for '4.50' or '1350' for '13.50'
    if (/^\d+\.\d+$/.test(t) && t.replace('.', '') === target) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether the normalized response consists ONLY of a single number/result (with optional unit like cm or zl).
 */
function isSingleNumberOnlyResponse(tokens: string[]): {
  isNumberOnly: boolean;
  numberToken: string | null;
} {
  const filtered = tokens.filter((t) => !['zl', 'cm', 'cm2', 'cm3', 'pkt'].includes(t));
  if (filtered.length === 1 && /^-?\d+(\.\d+)?$/.test(filtered[0])) {
    return { isNumberOnly: true, numberToken: filtered[0] };
  }
  return { isNumberOnly: false, numberToken: null };
}

/**
 * Deterministic evaluation of an open task strictly following Master Spec Section 7.6 & AC-A1..AC-A5.
 */
export function evaluateOpenTaskDeterministic(
  userAnswer: string,
  rubric: OpenTaskRubric
): AiTutorEvaluationResult {
  const { normalizedText, tokens } = normalizeForAiTutor(userAnswer);

  // Rule 1: Empty response -> 0/2
  if (!normalizedText || tokens.length === 0) {
    return {
      score: 0,
      maxScore: 2,
      feedback: 'Odpowiedź jest pusta — zapisz tok obliczeń i wynik końcowy.',
      matchedKeywords: [],
      expectedResultFound: false,
      isSimulatedPhase1: true,
      label: 'Ocena symulowana (Faza 1)',
    };
  }

  const expectedResultFound = containsWholeToken(tokens, rubric.expectedResult);
  const matchedKeywords = rubric.keywords.filter((kw) =>
    containsWholeToken(tokens, kw)
  );

  // Rule 2: resultOnly === true
  if (rubric.resultOnly) {
    if (expectedResultFound) {
      return {
        score: 2,
        maxScore: 2,
        feedback: 'Brawo! Wynik końcowy w pełni zgadza się z kluczem CKE.',
        matchedKeywords,
        expectedResultFound: true,
        isSimulatedPhase1: true,
        label: 'Ocena symulowana (Faza 1)',
      };
    }
    return {
      score: 1,
      maxScore: 2,
      feedback: 'Wynik nie zgadza się z kluczem — sprawdź ostatni krok obliczeń.',
      matchedKeywords,
      expectedResultFound: false,
      isSimulatedPhase1: true,
      label: 'Ocena symulowana (Faza 1)',
    };
  }

  // Rule 3: Answer consists only of a single number/result when resultOnly is false
  const singleNumCheck = isSingleNumberOnlyResponse(tokens);
  if (singleNumCheck.isNumberOnly && singleNumCheck.numberToken) {
    if (expectedResultFound) {
      return {
        score: 1,
        maxScore: 2,
        feedback:
          'Wynik wygląda dobrze, ale na E8 egzaminator wymaga pokazania obliczeń!',
        matchedKeywords,
        expectedResultFound: true,
        isSimulatedPhase1: true,
        label: 'Ocena symulowana (Faza 1)',
      };
    }
    return {
      score: 0,
      maxScore: 2,
      feedback:
        'Podano sam błędny wynik bez obliczeń — zapisz kroki rozumowania.',
      matchedKeywords,
      expectedResultFound: false,
      isSimulatedPhase1: true,
      label: 'Ocena symulowana (Faza 1)',
    };
  }

  // Rule 4: Normalized length < 20 chars -> 0/2
  if (normalizedText.length < 20) {
    return {
      score: 0,
      maxScore: 2,
      feedback: 'Odpowiedź jest zbyt krótka — dopisz kroki rozwiązania.',
      matchedKeywords,
      expectedResultFound,
      isSimulatedPhase1: true,
      label: 'Ocena symulowana (Faza 1)',
    };
  }

  // Rule 5 & 7: 2/2 requires length >= 40 AND >= 2 matched keywords AND expectedResultFound as a whole token
  if (
    normalizedText.length >= 40 &&
    matchedKeywords.length >= 2 &&
    expectedResultFound
  ) {
    return {
      score: 2,
      maxScore: 2,
      feedback:
        'Wzorowe rozwiązanie CKE! Pokazałeś pełny tok obliczeń i poprawny wynik końcowy.',
      matchedKeywords,
      expectedResultFound: true,
      isSimulatedPhase1: true,
      label: 'Ocena symulowana (Faza 1)',
    };
  }

  // Rule 6 & 7: Any other case (e.g. 20-39 chars, < 2 keywords, or right keywords with wrong final result) -> 1/2
  const feedback = !expectedResultFound
    ? 'Dobry kierunek rozumowania, ale końcowy wynik różni się od klucza — sprawdź rachunki.'
    : 'Dobry kierunek — rozwiń uzasadnienie i użyj kluczowych pojęć z zadania.';

  return {
    score: 1,
    maxScore: 2,
    feedback,
    matchedKeywords,
    expectedResultFound,
    isSimulatedPhase1: true,
    label: 'Ocena symulowana (Faza 1)',
  };
}

export class MockAiTutorService implements IAiTutorService {
  evaluateOpenTaskSync(
    userAnswer: string,
    rubric: OpenTaskRubric
  ): AiTutorEvaluationResult {
    return evaluateOpenTaskDeterministic(userAnswer, rubric);
  }

  async evaluateOpenTask(
    userAnswer: string,
    rubric: OpenTaskRubric,
    latencyMs: number = MOCK_AI_LATENCY_MS
  ): Promise<AiTutorEvaluationResult> {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
    return evaluateOpenTaskDeterministic(userAnswer, rubric);
  }
}

export const aiTutorService: IAiTutorService = new MockAiTutorService();
