'use client';

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getDb } from '../../lib/firebase';
import { getRankForXp } from '../../lib/gamification';
import type { AppState, LegalConsentRecord } from '../../types/domain';

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
        account: {
          isAnonymous: false,
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
          ...(state.ageBracket ? { ageBracket: state.ageBracket } : {}),
          ...(state.legalConsent ? {
            consentPath: state.legalConsent.consentPath,
            policyVersion: state.legalConsent.policyVersion,
            consentAcceptedAt: state.legalConsent.acceptedAt,
          } : {}),
        },
        schemaVersion: 2,
        updatedAt: serverTimestamp(),
      });
    });
  } catch {
    // Zapis profilu w chmurze odbywa się niezależnie od logowania.
  }
}

/**
 * Zapisuje rekord zgody RODO (ścieżka wiek/opiekun) w dokumencie użytkownika.
 * Jeśli dokument nie istnieje, wykonuje pełną inicjalizację z zapisaną zgodą.
 * Błędy są połykane — zapis zgodny nigdy nie może zepsuć przepływu UI.
 */
export async function syncLegalConsentToCloud(
  user: User,
  state: AppState,
  consent: LegalConsentRecord,
): Promise<boolean> {
  if (user.isAnonymous) return false;
  const db = getDb();
  if (!db) return false;

  try {
    const rank = getRankForXp(state.xp).currentRank;
    const ref = doc(db, 'users', user.uid);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);

      if (!snapshot.exists()) {
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
          account: {
            isAnonymous: false,
            createdAt: serverTimestamp(),
            lastActiveAt: serverTimestamp(),
            ageBracket: consent.ageBracket,
            consentPath: consent.consentPath,
            policyVersion: consent.policyVersion,
            consentAcceptedAt: consent.acceptedAt,
          },
          schemaVersion: 2,
          updatedAt: serverTimestamp(),
        });
        return;
      }

      const existingAccount = (snapshot.data()?.account ?? {}) as Record<string, unknown>;
      transaction.set(ref, {
        ...(snapshot.data() ?? {}),
        account: {
          ...existingAccount,
          createdAt: existingAccount.createdAt ?? serverTimestamp(),
          isAnonymous: false,
          lastActiveAt: serverTimestamp(),
          ageBracket: consent.ageBracket,
          consentPath: consent.consentPath,
          policyVersion: consent.policyVersion,
          consentAcceptedAt: consent.acceptedAt,
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
    return true;
  } catch {
    // Zgoda RODO zostanie zsynchronizowana przy kolejnej próbie.
    return false;
  }
}
