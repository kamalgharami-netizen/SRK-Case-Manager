import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectLegacyAndroidSyncState,
  runLegacyAndroidSyncStateMigration,
  type NativeSyncStateMigrationStore,
} from './androidNativeSyncStateMigration';
import type { NativeSyncStateEntry } from '@srk/capacitor-sync-state';

class MemoryStorage {
  private values = new Map<string, string>();

  constructor(entries: Array<[string, string]>) {
    for (const [key, value] of entries) this.values.set(key, value);
  }

  get length(): number { return this.values.size; }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class MemoryNativeStore implements NativeSyncStateMigrationStore {
  values = new Map<string, string>();
  beforeSet?: (items: NativeSyncStateEntry[]) => void;
  omitReadBackKeys = new Set<string>();

  async getItems({ keys }: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }> {
    return {
      items: keys
        .filter(key => this.values.has(key) && !this.omitReadBackKeys.has(key))
        .map(key => ({ key, value: this.values.get(key)! })),
    };
  }

  async setItems({ items }: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }> {
    this.beforeSet?.(items);
    for (const item of items) this.values.set(item.key, item.value);
    return { saved: items.length };
  }
}

test('migration collects only the explicit sync metadata allowlist', () => {
  const storage = new MemoryStorage([
    ['srk_sync_journal_v1', 'journal'],
    ['srk_sync_conflicts_v1', 'conflicts'],
    ['srk_sync_inbox_v1', 'inbox'],
    ['srk_google_drive_selected_folder_v1', 'folder'],
    ['srk_drive_sync_last_success_v1', 'timestamp'],
    ['srk_sync_device_id_v1', 'device'],
    ['srk_drive_sync_page_token_v1_company_a', 'page-token'],
    ['srk_case_manager_v5', 'BUSINESS_DATABASE'],
    ['srk_google_oauth_access_token', 'OAUTH_SECRET'],
    ['unrelated-setting', 'setting'],
  ]);

  assert.deepEqual(collectLegacyAndroidSyncState(storage), [
    { key: 'srk_drive_sync_last_success_v1', value: 'timestamp' },
    { key: 'srk_drive_sync_page_token_v1_company_a', value: 'page-token' },
    { key: 'srk_google_drive_selected_folder_v1', value: 'folder' },
    { key: 'srk_sync_conflicts_v1', value: 'conflicts' },
    { key: 'srk_sync_device_id_v1', value: 'device' },
    { key: 'srk_sync_inbox_v1', value: 'inbox' },
    { key: 'srk_sync_journal_v1', value: 'journal' },
  ]);
});

test('migration collector sorts keys deterministically and ignores missing storage values', () => {
  const storage = {
    length: 3,
    key(index: number): string | null {
      return ['srk_sync_inbox_v1', 'srk_sync_journal_v1', null][index] ?? null;
    },
    getItem(key: string): string | null {
      return key === 'srk_sync_inbox_v1' ? 'inbox' : null;
    },
  };

  assert.deepEqual(collectLegacyAndroidSyncState(storage), [
    { key: 'srk_sync_inbox_v1', value: 'inbox' },
  ]);
});

test('migration verifies native read-back and keeps every legacy source value', async () => {
  const storage = new MemoryStorage([
    ['srk_sync_journal_v1', 'journal-data'],
    ['srk_sync_inbox_v1', 'inbox-data'],
    ['srk_case_manager_v5', 'business-data'],
  ]);
  const nativeStore = new MemoryNativeStore();

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'migrated', copied: 2 });
  assert.equal(storage.getItem('srk_sync_journal_v1'), 'journal-data');
  assert.equal(storage.getItem('srk_sync_inbox_v1'), 'inbox-data');
  assert.equal(storage.getItem('srk_case_manager_v5'), 'business-data');
  assert.equal(nativeStore.values.get('srk_sync_journal_v1'), 'journal-data');
  assert.equal(nativeStore.values.get('srk_sync_inbox_v1'), 'inbox-data');
  assert.equal(nativeStore.values.get('srk_native_sync_state_migration_v1'), '1');
  assert.equal(nativeStore.values.has('srk_case_manager_v5'), false);
});

test('migration does not mark completion when source changes during copy and succeeds on retry', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'old-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_sync_journal_v1')) {
      storage.setItem('srk_sync_journal_v1', 'new-value');
    }
  };

  const firstAttempt = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);
  assert.deepEqual(firstAttempt, { status: 'retry-required', copied: 1 });
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);

  nativeStore.beforeSet = undefined;
  const retry = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(retry, { status: 'migrated', copied: 1 });
  assert.equal(nativeStore.values.get('srk_sync_journal_v1'), 'new-value');
  assert.equal(nativeStore.values.get('srk_native_sync_state_migration_v1'), '1');
});

test('migration refuses to set completion marker when native read-back differs', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.omitReadBackKeys.add('srk_sync_journal_v1');

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'retry-required', copied: 1 });
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('completed migration marker makes retries idempotent', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.values.set('srk_native_sync_state_migration_v1', '1');

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'already-migrated', copied: 0 });
  assert.equal(nativeStore.values.has('srk_sync_journal_v1'), false);
});
