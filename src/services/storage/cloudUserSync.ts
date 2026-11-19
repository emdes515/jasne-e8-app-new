'use client';

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getDb } from '../../lib/firebase';
import { getRankForXp } from '../../lib/gamification';
import type { AppState } from '../../types/domain';

/**
 * Inicjalizuje dokument ucznia w Firestore danymi z urządzenia.
 * Istniejący dokument pozostaje źródłem danych konta.
 */
export async function initializeCloudUserProfile(user: User, state: AppState): Promise<void> {
  if (user.isAnonymous) return;
  const db = getDb();
  if (!db) return;

  try {
    const rank = getRankForXp(state.xp).currentRank;
    const ref = doc(db, 'users', user.uid);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (snapshot.exists()) return;

      transaction.set(ref, {
        profile: {
          nickname: state.nickname || 'Uczeń E8',
          studyStage: state.studyStage,
          activeSubject: state.activeSubject,
          dailyGoalMinutes: state.dailyGoalMinutes,
          avatarLoadout: state.loadout,
        },
        prefs: {
          theme: state.theme,
          sfxEnabled: state.sfxEnabled,
        },
        gamificationPublic: {
          xp: state.xp,
          rankId: rank.id,
          streakDays: state.streakDays,
          bestCombo: state.bestCombo,
          lastCompletedPlayerDay: state.lastCompletedPlayerDay,
          totalTasksSolved: state.totalTasksSolved,
        },
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      });
    });
  } catch {
    // Zapis profilu w chmurze odbywa się niezależnie od logowania.
  }
}
