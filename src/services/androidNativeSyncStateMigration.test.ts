import test from 'node:test';
import assert from 'node:assert/strict';
import { collectLegacyAndroidSyncState } from './androidNativeSyncStateMigration';

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
