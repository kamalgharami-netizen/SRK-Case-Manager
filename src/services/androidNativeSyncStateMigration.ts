import { Capacitor } from '@capacitor/core';
import { SyncStateStore, type NativeSyncStateEntry } from '@srk/capacitor-sync-state';

const MIGRATION_MARKER = 'srk_native_sync_state_migration_v1';
const SYNC_STATE_KEYS = new Set([
  'srk_sync_journal_v1',
  'srk_sync_conflicts_v1',
  'srk_sync_inbox_v1',
  'srk_google_drive_selected_folder_v1',
  'srk_drive_sync_last_success_v1',
  'srk_sync_device_id_v1',
]);

export type AndroidSyncStateMigrationResult =
  | { status: 'not-android' }
  | { status: 'already-migrated'; copied: number }
  | { status: 'migrated'; copied: number }
  | { status: 'retry-required'; copied: number };

/** Select only known sync metadata keys; business data and OAuth secrets are excluded. */
export function collectLegacyAndroidSyncState(storage: Pick<Storage, 'length' | 'key' | 'getItem'>): NativeSyncStateEntry[] {
  const entries: NativeSyncStateEntry[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    const isKnown = SYNC_STATE_KEYS.has(key) || key.startsWith('srk_drive_sync_page_token_v1_');
    if (!isKnown) continue;
    const value = storage.getItem(key);
    if (value !== null) entries.push({ key, value });
  }
  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

export interface NativeSyncStateMigrationStore {
  getItems(options: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }>;
  setItems(options: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }>;
}

/**
 * Performs migration against an injected store so recovery behavior can be
 * tested without requiring an Android device.
 */
export async function runLegacyAndroidSyncStateMigration(
  storage: Pick<Storage, 'length' | 'key' | 'getItem'>,
  nativeStore: NativeSyncStateMigrationStore,
): Promise<AndroidSyncStateMigrationResult> {
  const marker = await nativeStore.getItems({ keys: [MIGRATION_MARKER] });
  if (marker.items.some(item => item.key === MIGRATION_MARKER && item.value === '1')) {
    return { status: 'already-migrated', copied: 0 };
  }

  const snapshot = collectLegacyAndroidSyncState(storage);
  if (snapshot.length > 500) {
    throw new Error('Too many legacy sync-state entries for a safe migration batch.');
  }

  if (snapshot.length) {
    const saved = await nativeStore.setItems({ items: snapshot });
    if (saved.saved !== snapshot.length) {
      throw new Error('Native sync-state migration did not save every entry.');
    }
  }

  const readBack = await nativeStore.getItems({ keys: snapshot.map(item => item.key) });
  const values = new Map(readBack.items.map(item => [item.key, item.value]));
  const verified = snapshot.every(item => values.get(item.key) === item.value);
  const unchanged = snapshot.every(item => storage.getItem(item.key) === item.value);
  if (!verified || !unchanged) {
    return { status: 'retry-required', copied: snapshot.length };
  }

  await nativeStore.setItems({ items: [{ key: MIGRATION_MARKER, value: '1' }] });
  const finalCheck = await nativeStore.getItems({ keys: [MIGRATION_MARKER] });
  if (!finalCheck.items.some(item => item.key === MIGRATION_MARKER && item.value === '1')) {
    throw new Error('Native sync-state migration marker could not be verified.');
  }

  return { status: 'migrated', copied: snapshot.length };
}


/**
 * Android-only entry point. This remains deliberately unwired from live sync
 * until physical-device migration and recovery tests are completed.
 */
export async function migrateLegacyAndroidSyncState(
  storage: Storage = localStorage,
): Promise<AndroidSyncStateMigrationResult> {
  if (Capacitor.getPlatform() !== 'android') return { status: 'not-android' };
  return runLegacyAndroidSyncStateMigration(storage, SyncStateStore);
}
