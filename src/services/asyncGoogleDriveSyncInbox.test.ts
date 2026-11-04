import test from 'node:test';
import assert from 'node:assert/strict';
import { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';
import { pullRemoteChangesAsync } from './asyncGoogleDriveSyncInbox';
import { syncGoogleDriveNowAsync } from './asyncGoogleDriveSyncCoordinator';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';

class MemoryStorage implements AsyncSyncStateStorage {
  values = new Map<string, string>();
  async getItem(key: string) { return this.values.get(key) ?? null; }
  async setItem(key: string, value: string) { this.values.set(key, value); }
  async removeItem(key: string) { this.values.delete(key); }
  async updateItem<T>(key: string, updater: (current: string | null) => { value: string | null; result: T }) {
    const next = updater(this.values.get(key) ?? null);
    if (next.value === null) this.values.delete(key);
    else this.values.set(key, next.value);
    return next.result;
  }
}

const remote = (changeId: string) => ({
  schemaVersion: 1 as const,
  deviceId: 'remote_device_123456',
  changeId,
  recordId: 'cases:case-1',
  companyId: 'company-1',
  updatedAt: 100,
  deleted: false,
  payload: { id: 'case-1', title: 'Remote case' },
});

test('async pull stages verified remote records and returns Drive continuation token', async () => {
  const storage = new MemoryStorage();
  const journal = new AsyncSyncJournal<unknown>(storage);
  const inbox = new AsyncSyncInbox<unknown>(storage);
  const result = await pullRemoteChangesAsync(journal, inbox, {
    accessToken: 'token', folderId: 'folder-1', maxPages: 1,
  }, {
    listFiles: async () => ({
      files: [{ id: 'drive-file-1', name: 'srk-change-remote-change-1.json', mimeType: 'application/json' }],
      nextPageToken: 'page-2',
    }),
    downloadJson: async () => remote('remote-change-1'),
  });
  assert.equal(result.downloaded, 1);
  assert.equal(result.staged, 1);
  assert.equal(result.nextPageToken, 'page-2');
  assert.deepEqual(await inbox.getAll(), [remote('remote-change-1')]);
  assert.equal(await journal.getPendingCount(), 0);
});

test('async coordinator performs pull before push and keeps remote data staged', async () => {
  const storage = new MemoryStorage();
  const journal = new AsyncSyncJournal<unknown>(storage);
  const inbox = new AsyncSyncInbox<unknown>(storage);
  await journal.enqueue({
    schemaVersion: 1, deviceId: 'local_device_123456', changeId: 'local-change-1',
    recordId: 'cases:local-case', companyId: 'company-1', updatedAt: 100,
    deleted: false, payload: { id: 'local-case' },
  });
  const calls: string[] = [];
  const result = await syncGoogleDriveNowAsync(journal, inbox, {
    accessToken: 'token', folderId: 'folder-1',
  }, {
    pull: {
      listFiles: async () => { calls.push('pull'); return { files: [] }; },
      downloadJson: async () => null,
    },
    push: {
      listFiles: async () => { calls.push('push-check'); return { files: [] }; },
      uploadJson: async options => {
        calls.push('push-upload');
        return { id: 'uploaded', name: options.name, mimeType: 'application/json' };
      },
      downloadJson: async () => null,
    },
  });
  assert.equal(calls[0], 'pull');
  assert.equal(result.pushed.acknowledged, 1);
  assert.equal(result.remainingOutbox, 0);
  assert.equal(result.remainingInbox, 0);
});
