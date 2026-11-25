// src/services/storage/localStateRepo.ts

import { AppState } from '../../types/domain';
import {
  IAppStateRepository,
  LoadStateResult,
  SaveStateResult,
} from '../../types/repositories';
import { FREE_STARTER_ITEM_IDS } from '../../data/shopCatalog';
import {
  generateDailyChallengesForDay,
  MAX_HEARTS,
  MAX_VAULT_FIFO_SIZE,
} from '../../lib/gamification';
import { isValidAgeBracket, isValidLegalConsentRecord } from '../../lib/legalAgeGate';
import { getWarsawPlayerDay } from '../../lib/playerDay';

export const STORAGE_KEY = 'jasne-e8-app:state';
export const CURRENT_SCHEMA_VERSION = 1;
const SOFT_BYTE_LIMIT = 3 * 1024 * 1024; // 3 MB

function generateGuestUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'guest-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}

export function createInitialAppState(now: Date = new Date()): AppState {
  const playerDay = getWarsawPlayerDay(now);
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    accountMode: 'guest',
    guestId: generateGuestUuid(),
    onboardingCompleted: false,
    nickname: 'BłyskLogiki',
    studyStage: 'grade8',
    activeSubject: 'math',
    preferredSubjects: ['math', 'polish', 'english'],
    dailyGoalMinutes: 10,
    theme: 'dark',
    sfxEnabled: true,

    coins: 120,
    xp: 0,
    achievedRankIds: ['novice'],
    hearts: MAX_HEARTS,
    heartRefillAnchorAt: null,
    streakDays: 0,
    lastCompletedPlayerDay: null,
    streakShields: 0,
    claimedStreakMilestones: [],

    totalTasksSolved: 0,
    accuracyPointsEarned: 0,
    accuracyPointsPossible: 0,
    bestCombo: 0,
    completedLessonIds: [],

    currentPlayerDay: playerDay,
    dailyLessonsCompleted: 0,
    dailyTasksChecked: 0,
    dailyChallenges: generateDailyChallengesForDay(playerDay),
    rescueMissionsCompletedToday: 0,
    rescueMissionCurrentProgress: 0,
    rescueMissionCountedTaskIds: [],

    rewardLedger: {},
    savedTasks: [],
    mistakeBank: [],
    activeSession: null,
    examHistory: [],

    ownedItemIds: [...FREE_STARTER_ITEM_IDS],
    loadout: {
      colorScheme: 'gold_spark',
      headgear: 'none',
      eyewear: 'none',
      aura: 'none',
      profileFrame: 'default_frame',
      playerTitle: 'novice_title',
    },
  };
}

function isValidAppStateShape(raw: unknown): raw is AppState {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.schemaVersion !== 'number') return false;
  if (typeof obj.guestId !== 'string') return false;
  if (typeof obj.coins !== 'number' || typeof obj.xp !== 'number') return false;
  if (typeof obj.hearts !== 'number') return false;
  if (!Array.isArray(obj.savedTasks) || !Array.isArray(obj.mistakeBank)) return false;
  if (!obj.loadout || typeof obj.loadout !== 'object') return false;
  return true;
}

/**
 * Enforces FIFO 200 cap on savedTasks and mistakeBank, plus 3 MB soft pruning.
 */
export function enforceVaultCaps(state: AppState): {
  nextState: AppState;
  pruned: boolean;
} {
  let pruned = false;
  let savedTasks = state.savedTasks;
  let mistakeBank = state.mistakeBank;

  if (savedTasks.length > MAX_VAULT_FIFO_SIZE) {
    // Keep newest 200 by savedAt
    savedTasks = [...savedTasks]
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, MAX_VAULT_FIFO_SIZE);
    pruned = true;
  }

  if (mistakeBank.length > MAX_VAULT_FIFO_SIZE) {
    // Keep newest 200 by lastMistakeAt
    mistakeBank = [...mistakeBank]
      .sort((a, b) => b.lastMistakeAt - a.lastMistakeAt)
      .slice(0, MAX_VAULT_FIFO_SIZE);
    pruned = true;
  }

  let candidate: AppState = pruned
    ? { ...state, savedTasks, mistakeBank }
    : state;

  const serialized = JSON.stringify(candidate);
  if (serialized.length * 2 > SOFT_BYTE_LIMIT) {
    candidate = {
      ...candidate,
      savedTasks: candidate.savedTasks.slice(0, 100),
      mistakeBank: candidate.mistakeBank.slice(0, 100),
      examHistory: candidate.examHistory.slice(0, 30),
    };
    pruned = true;
  }

  return { nextState: candidate, pruned };
}

export class LocalAppStateRepository implements IAppStateRepository {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingState: AppState | null = null;

  load(): LoadStateResult {
    if (typeof window === 'undefined') {
      return {
        state: createInitialAppState(),
        wasCorruptedOrReset: false,
      };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          state: createInitialAppState(),
          wasCorruptedOrReset: false,
        };
      }

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON root');
      }

      const version = (parsed as Record<string, unknown>).schemaVersion;
      if (typeof version === 'number' && version > CURRENT_SCHEMA_VERSION) {
        const fresh = createInitialAppState();
        this.saveImmediate(fresh);
        return {
          state: fresh,
          wasCorruptedOrReset: true,
          warningMessage:
            'Wykryto nowszą wersję schematu danych — przywrócono bezpieczny stan początkowy.',
        };
      }

      if (!isValidAppStateShape(parsed)) {
        throw new Error('Corrupted state shape');
      }

      const sanitized: AppState = {
        ...parsed,
        ageBracket: isValidAgeBracket(parsed.ageBracket) ? parsed.ageBracket : undefined,
        legalConsent: isValidLegalConsentRecord(parsed.legalConsent)
          ? parsed.legalConsent
          : undefined,
      };

      return {
        state: sanitized,
        wasCorruptedOrReset: false,
      };
    } catch {
      const fresh = createInitialAppState();
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {
        // Ignore write error during recovery
      }
      return {
        state: fresh,
        wasCorruptedOrReset: true,
        warningMessage:
          'Wykryto uszkodzone dane lokalne — stan został bezpiecznie zresetowany.',
      };
    }
  }

  saveImmediate(state: AppState): SaveStateResult {
    if (typeof window === 'undefined') {
      return { ok: true };
    }

    const { nextState, pruned } = enforceVaultCaps(state);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      this.pendingState = null;
      return { ok: true, prunedVaultEntries: pruned };
    } catch (err: unknown) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      return {
        ok: false,
        quotaExceeded: isQuota || true,
        prunedVaultEntries: pruned,
      };
    }
  }

  saveDebounced(state: AppState, onQuotaError?: () => void): void {
    this.pendingState = state;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      if (this.pendingState) {
        const res = this.saveImmediate(this.pendingState);
        if (!res.ok && res.quotaExceeded && onQuotaError) {
          onQuotaError();
        }
      }
      this.debounceTimer = null;
    }, 300);
  }

  flush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.pendingState) {
      this.saveImmediate(this.pendingState);
    }
  }

  clearAll(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingState = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }
}

export const localStateRepo = new LocalAppStateRepository();
