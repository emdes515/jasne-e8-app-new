// src/services/storage/firebaseReadyStub.ts

import { AppState } from '../../types/domain';
import {
  IAppStateRepository,
  LoadStateResult,
  SaveStateResult,
} from '../../types/repositories';
import { localStateRepo } from './localStateRepo';

/**
 * Phase 2 Firebase Cloud Firestore & Firebase Auth Adapter Stub.
 *
 * In Phase 1, all calls delegate to `localStateRepo` (100% offline/localStorage).
 * In Phase 2, connecting Firebase Auth & Firestore requires only implementing:
 *  - `mergeGuestToAuthenticatedUser(guestId, firebaseUid)` to promote `jasne-e8-app:state`
 *    into `users/{firebaseUid}` document in Firestore.
 *  - Replacing `activeRepository` export with `FirestoreAppStateRepository`.
 */
export class FirebaseReadyAppStateAdapter implements IAppStateRepository {
  load(): LoadStateResult {
    return localStateRepo.load();
  }

  saveImmediate(state: AppState): SaveStateResult {
    return localStateRepo.saveImmediate(state);
  }

  saveDebounced(state: AppState, onQuotaError?: () => void): void {
    localStateRepo.saveDebounced(state, onQuotaError);
  }

  flush(): void {
    localStateRepo.flush();
  }

  clearAll(): void {
    localStateRepo.clearAll();
  }

  /**
   * Ready hook for Phase 2 Guest -> Firebase Auth migration.
   */
  async prepareGuestMigrationPayload(state: AppState): Promise<{
    guestId: string;
    firestoreDocPath: string;
    payload: AppState;
  }> {
    return {
      guestId: state.guestId,
      firestoreDocPath: `users/${state.guestId}`,
      payload: state,
    };
  }
}

export const appStateRepository: IAppStateRepository =
  new FirebaseReadyAppStateAdapter();
