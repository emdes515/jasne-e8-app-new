// src/types/repositories.ts

import { AppState, OpenTaskRubric } from './domain';

export interface LoadStateResult {
  state: AppState;
  wasCorruptedOrReset: boolean;
  warningMessage?: string;
}

export interface SaveStateResult {
  ok: boolean;
  quotaExceeded?: boolean;
  prunedVaultEntries?: boolean;
}

export interface IAppStateRepository {
  load(): LoadStateResult;
  saveImmediate(state: AppState): SaveStateResult;
  saveDebounced(state: AppState, onQuotaError?: () => void): void;
  flush(): void;
  clearAll(): void;
}

export interface AiTutorEvaluationResult {
  score: 0 | 1 | 2;
  maxScore: 2;
  feedback: string;
  matchedKeywords: string[];
  expectedResultFound: boolean;
  isSimulatedPhase1: true;
  label: 'Ocena symulowana (Faza 1)';
}

export interface IAiTutorService {
  evaluateOpenTask(
    userAnswer: string,
    rubric: OpenTaskRubric,
    latencyMs?: number
  ): Promise<AiTutorEvaluationResult>;
  evaluateOpenTaskSync(
    userAnswer: string,
    rubric: OpenTaskRubric
  ): AiTutorEvaluationResult;
}
