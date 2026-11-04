import { Capacitor } from '@capacitor/core';
import { SyncStateStore } from '@srk/capacitor-sync-state';
import { runLegacyAndroidSyncStateMigration } from './androidNativeSyncStateMigration';
import { createPlatformSyncStateStorage, type AsyncSyncStateStorage } from './syncStateStorageAdapter';

let readyStoragePromise: Promise<AsyncSyncStateStorage> | null = null;

/**
 * Returns the single process-wide sync-state store.
 * Android migration is completed and verified before the native adapter is exposed.
 * A failed/retry-required migration rejects and blocks every sync-state consumer.
 */
export function getReadyPlatformSyncStateStorage(): Promise<AsyncSyncStateStorage> {
  if (readyStoragePromise) return readyStoragePromise;

  readyStoragePromise = (async () => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      const migration = await runLegacyAndroidSyncStateMigration(
        localStorage,
        SyncStateStore,
      );
      if (migration.status !== 'migrated' && migration.status !== 'already-migrated') {
        throw new Error('Android sync-state migration has not completed. Google Drive sync is paused to protect existing data.');
      }
      return createPlatformSyncStateStorage({ platform });
    }

    return createPlatformSyncStateStorage({
      platform,
      localStorage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    });
  })().catch(error => {
    // Do not cache a rejected promise permanently; a transient bridge/DB failure
    // can be retried by the next explicit sync attempt.
    readyStoragePromise = null;
    throw error;
  });

  return readyStoragePromise;
}

/** Test-only reset hook is intentionally not exported from the application barrel. */
export function resetReadyPlatformSyncStateStorageForTests(): void {
  readyStoragePromise = null;
}
