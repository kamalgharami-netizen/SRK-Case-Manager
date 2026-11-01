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

  async removeItems({ keys }: { keys: string[] }): Promise<{ removed: number }> {
    let removed = 0;
    for (const key of keys) if (this.values.delete(key)) removed += 1;
    return { removed };
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

test('migration fails closed if changed-source rollback cannot remove newly copied values', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'old-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_sync_journal_v1')) {
      storage.setItem('srk_sync_journal_v1', 'new-value');
    }
  };
  nativeStore.removeItems = async () => {
    throw new Error('simulated destination rollback failure');
  };

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /simulated destination rollback failure/,
  );
  assert.equal(storage.getItem('srk_sync_journal_v1'), 'new-value');
  assert.equal(nativeStore.values.get('srk_sync_journal_v1'), 'old-value');
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('migration refuses to set completion marker when native read-back differs', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.omitReadBackKeys.add('srk_sync_journal_v1');

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'retry-required', copied: 1 });
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('migration refuses to overwrite a different value already present in native storage', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'legacy-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.values.set('srk_sync_journal_v1', 'different-native-value');

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /destination already contains a different value/,
  );
  assert.equal(storage.getItem('srk_sync_journal_v1'), 'legacy-value');
  assert.equal(nativeStore.values.get('srk_sync_journal_v1'), 'different-native-value');
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('migration invalidates a marker when native marker write throws after committing', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'legacy-value']]);
  const nativeStore = new MemoryNativeStore();
  const originalSetItems = nativeStore.setItems.bind(nativeStore);
  nativeStore.setItems = async ({ items }) => {
    const result = await originalSetItems({ items });
    if (items.some(item => item.key === 'srk_native_sync_state_migration_v1' && item.value === '1')) {
      throw new Error('simulated bridge failure after marker commit');
    }
    return result;
  };
  nativeStore.removeItems = async () => {
    throw new Error('simulated marker removal failure');
  };

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /simulated bridge failure after marker commit/,
  );
  assert.equal(nativeStore.values.get('srk_native_sync_state_migration_v1'), '0');
  assert.equal(storage.getItem('srk_sync_journal_v1'), 'legacy-value');
});

test('completed migration marker makes retries idempotent', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.values.set('srk_native_sync_state_migration_v1', '1');

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'already-migrated', copied: 0 });
  assert.equal(nativeStore.values.has('srk_sync_journal_v1'), false);
});


test('migration rejects more than 500 legacy entries before writing anything', async () => {
  const entries: Array<[string, string]> = Array.from(
    { length: 501 },
    (_, index) => [`srk_drive_sync_page_token_v1_${index.toString().padStart(3, '0')}`, `token-${index}`],
  );
  const storage = new MemoryStorage(entries);
  const nativeStore = new MemoryNativeStore();

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /Too many legacy sync-state entries/,
  );
  assert.equal(nativeStore.values.size, 0);
});

test('migration rejects an incomplete native batch write and does not set the marker', async () => {
  const storage = new MemoryStorage([
    ['srk_sync_journal_v1', 'journal-data'],
    ['srk_sync_inbox_v1', 'inbox-data'],
  ]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.setItems = async ({ items }) => ({ saved: items.length - 1 });

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /did not save every entry/,
  );
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('migration rejects completion when the marker cannot be read back', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.omitReadBackKeys.add('srk_native_sync_state_migration_v1');

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /marker could not be verified/,
  );
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});


test('migration retries when a new allowlisted key appears during the native copy', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'journal-data']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_sync_journal_v1')) {
      storage.setItem('srk_sync_inbox_v1', 'added-during-migration');
    }
  };

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'retry-required', copied: 1 });
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
  assert.equal(storage.getItem('srk_sync_inbox_v1'), 'added-during-migration');
});


test('migration rejects a native key longer than 256 characters before writing', async () => {
  const longKey = 'srk_drive_sync_page_token_v1_' + 'x'.repeat(256);
  const storage = new MemoryStorage([[longKey, 'page-token']]);
  const nativeStore = new MemoryNativeStore();

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /exceeds the native store size limits/,
  );
  assert.equal(nativeStore.values.size, 0);
  assert.equal(storage.getItem(longKey), 'page-token');
});

test('migration rejects a native value larger than 2 MiB before writing', async () => {
  const oversizedValue = 'x'.repeat(2 * 1024 * 1024 + 1);
  const storage = new MemoryStorage([['srk_sync_journal_v1', oversizedValue]]);
  const nativeStore = new MemoryNativeStore();

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /exceeds the native store size limits/,
  );
  assert.equal(nativeStore.values.size, 0);
  assert.equal(storage.getItem('srk_sync_journal_v1'), oversizedValue);
});


test('migration invalidates completion marker if legacy source changes during marker commit', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'original-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_native_sync_state_migration_v1')) {
      storage.setItem('srk_sync_journal_v1', 'changed-during-finalization');
    }
  };

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'retry-required', copied: 1 });
  assert.equal(storage.getItem('srk_sync_journal_v1'), 'changed-during-finalization');
  assert.equal(nativeStore.values.has('srk_native_sync_state_migration_v1'), false);
});

test('migration falls back to an invalid marker when marker removal throws', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'original-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_native_sync_state_migration_v1')) {
      storage.setItem('srk_sync_journal_v1', 'changed-during-finalization');
    }
  };
  nativeStore.removeItems = async () => {
    throw new Error('simulated native database removal failure');
  };

  const result = await runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore);

  assert.deepEqual(result, { status: 'retry-required', copied: 1 });
  assert.equal(nativeStore.values.get('srk_native_sync_state_migration_v1'), '0');
});

test('migration fails closed if marker removal and invalidation both fail', async () => {
  const storage = new MemoryStorage([['srk_sync_journal_v1', 'original-value']]);
  const nativeStore = new MemoryNativeStore();
  nativeStore.beforeSet = items => {
    if (items.some(item => item.key === 'srk_native_sync_state_migration_v1')) {
      storage.setItem('srk_sync_journal_v1', 'changed-during-finalization');
    }
  };
  nativeStore.removeItems = async () => {
    throw new Error('simulated remove failure');
  };
  const originalSetItems = nativeStore.setItems.bind(nativeStore);
  nativeStore.setItems = async ({ items }) => {
    if (items.some(item => item.key === 'srk_native_sync_state_migration_v1' && item.value === '0')) {
      throw new Error('simulated marker invalidation failure');
    }
    return originalSetItems({ items });
  };

  await assert.rejects(
    runLegacyAndroidSyncStateMigration(storage as unknown as Storage, nativeStore),
    /marker could not be invalidated/,
  );
  assert.equal(nativeStore.values.get('srk_native_sync_state_migration_v1'), '1');
});
