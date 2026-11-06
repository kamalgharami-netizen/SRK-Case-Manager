import test from 'node:test';
import assert from 'node:assert/strict';
import { AsyncSyncJournal } from './asyncSyncRepositories';
import { pushPendingChangesAsync } from './asyncGoogleDriveSyncTransport';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';

class MemoryStorage implements AsyncSyncStateStorage {
  private values = new Map<string, string>();
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

const change = (changeId: string) => ({
  schemaVersion: 1 as const,
  deviceId: 'device_1234567890123456',
  changeId,
  recordId: 'cases:' + changeId,
  companyId: 'company1',
  updatedAt: 1000,
  deleted: false,
  payload: { caseId: changeId },
});

test('async transport uploads and acknowledges only after a successful upload', async () => {
  const journal = new AsyncSyncJournal<unknown>(new MemoryStorage());
  await journal.enqueue(change('async-change-1'));
  const result = await pushPendingChangesAsync(journal, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [] }),
    downloadJson: async () => null,
    uploadJson: async options => ({ id: 'uploaded', name: options.name, mimeType: 'application/json' }),
  });
  assert.deepEqual(result, { uploaded: 1, acknowledged: 1, remaining: 0 });
});

test('async transport verifies an existing remote file before acknowledging', async () => {
  const journal = new AsyncSyncJournal<unknown>(new MemoryStorage());
  const pending = change('async-change-2');
  await journal.enqueue(pending);
  await assert.rejects(
    pushPendingChangesAsync(journal, { accessToken: 'token', folderId: 'folder1' }, {
      listFiles: async () => ({ files: [{ id: 'existing', name: 'existing', mimeType: 'application/json' }] }),
      downloadJson: async () => ({ ...pending, payload: { caseId: 'different' } }),
      uploadJson: async () => ({ id: 'unused', name: 'unused', mimeType: 'application/json' }),
    }),
    /content does not match/
  );
  assert.equal(await journal.getPendingCount(), 1);
});


test('async transport fails closed when duplicate Drive files exist for one change', async () => {
  const journal = new AsyncSyncJournal<unknown>(new MemoryStorage());
  await journal.enqueue(change('async-change-duplicate'));
  let downloadCalls = 0;
  await assert.rejects(
    pushPendingChangesAsync(journal, { accessToken: 'token', folderId: 'folder1' }, {
      listFiles: async () => ({
        files: [
          { id: 'existing-a', name: 'srk-change-async-change-duplicate.json', mimeType: 'application/json' },
          { id: 'existing-b', name: 'srk-change-async-change-duplicate.json', mimeType: 'application/json' },
        ],
      }),
      downloadJson: async () => { downloadCalls += 1; return change('async-change-duplicate'); },
      uploadJson: async () => ({ id: 'unused', name: 'unused', mimeType: 'application/json' }),
    }),
    /Multiple Drive files exist for change/,
  );
  assert.equal(downloadCalls, 0);
  assert.equal(await journal.getPendingCount(), 1);
});

test('async transport keeps outbox entries when upload fails', async () => {
  const journal = new AsyncSyncJournal<unknown>(new MemoryStorage());
  await journal.enqueue(change('async-change-3'));
  await assert.rejects(
    pushPendingChangesAsync(journal, { accessToken: 'token', folderId: 'folder1' }, {
      listFiles: async () => ({ files: [] }),
      downloadJson: async () => null,
      uploadJson: async () => { throw new Error('network unavailable'); },
    }),
    /network unavailable/
  );
  assert.equal(await journal.getPendingCount(), 1);
});
