import test from 'node:test';
import assert from 'node:assert/strict';
import { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';
import { pullRemoteChangesAsync } from './asyncGoogleDriveSyncInbox';
import { syncGoogleDriveNowAsync } from './asyncGoogleDriveSyncCoordinator';
import type { AsyncSyncPushDependencies } from './asyncGoogleDriveSyncTransport';
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

test('async pull fails closed when Drive contains multiple files for one change ID', async () => {
  const storage = new MemoryStorage();
  const journal = new AsyncSyncJournal<unknown>(storage);
  const inbox = new AsyncSyncInbox<unknown>(storage);
  let downloads = 0;
  await assert.rejects(
    pullRemoteChangesAsync(journal, inbox, { accessToken: 'token', folderId: 'folder-1' }, {
      listFiles: async () => ({
        files: [
          { id: 'file-1', name: 'srk-change-duplicate-async.json', mimeType: 'application/json' },
          { id: 'file-2', name: 'srk-change-duplicate-async.json', mimeType: 'application/json' },
        ],
      }),
      downloadJson: async () => { downloads += 1; return remote('duplicate-async'); },
    }),
    /Multiple Drive files exist for change/
  );
  assert.equal(downloads, 1);
  assert.equal((await inbox.getAll()).length, 0);
  assert.equal(await inbox.hasSeen('duplicate-async'), false);
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
      uploadJson: async (options: Parameters<AsyncSyncPushDependencies['uploadJson']>[0]) => {
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

test('async coordinator checkpoints durable pull before a failed push', async () => {
  const storage = new MemoryStorage();
  const journal = new AsyncSyncJournal<unknown>(storage);
  const inbox = new AsyncSyncInbox<unknown>(storage);
  const remoteChange = remote('remote-checkpoint-async');
  let checkpoint: string | undefined;
  await assert.rejects(
    syncGoogleDriveNowAsync(journal, inbox, {
      accessToken: 'token',
      folderId: 'folder-1',
      pullMaxPages: 1,
      onPullCheckpoint: nextPageToken => { checkpoint = nextPageToken; },
    }, {
      pull: {
        listFiles: async () => ({
          files: [{ id: 'file-checkpoint', name: 'srk-change-remote-checkpoint-async.json', mimeType: 'application/json' }],
          nextPageToken: 'page-after-checkpoint',
        }),
        downloadJson: async () => remoteChange,
      },
      push: {
        listFiles: async () => ({ files: [] }),
        downloadJson: async () => null,
        uploadJson: async () => { throw new Error('temporary async push failure'); },
      },
    }),
    /temporary async push failure/
  );
  assert.equal(checkpoint, 'page-after-checkpoint');
  assert.deepEqual(await inbox.getAll(), [remoteChange]);
});

test('async coordinator preserves staged inbox and local outbox across a failed push and retry', async () => {
  const storage = new MemoryStorage();
  const firstJournal = new AsyncSyncJournal<unknown>(storage);
  const firstInbox = new AsyncSyncInbox<unknown>(storage);
  await firstJournal.enqueue({
    schemaVersion: 1, deviceId: 'local_device_123456', changeId: 'local-pending-1',
    recordId: 'cases:local-case', companyId: 'company-1', updatedAt: 100,
    deleted: false, payload: { id: 'local-case' },
  });
  const remoteChange = remote('remote-change-retry');
  let failUpload = true;
  let remoteListCalls = 0;
  const dependencies = {
    pull: {
      listFiles: async () => {
        remoteListCalls += 1;
        return { files: [{ id: 'remote-drive-file', name: 'srk-change-remote-change-retry.json', mimeType: 'application/json' }] };
      },
      downloadJson: async () => remoteChange,
    },
    push: {
      listFiles: async () => ({ files: [] }),
      downloadJson: async () => null,
      uploadJson: async (options: Parameters<AsyncSyncPushDependencies['uploadJson']>[0]) => {
        if (failUpload) throw new Error('temporary network interruption');
        return { id: 'uploaded-after-retry', name: options.name, mimeType: 'application/json' };
      },
    },
  };
  await assert.rejects(() => syncGoogleDriveNowAsync(
    firstJournal, firstInbox, { accessToken: 'token', folderId: 'folder-1' }, dependencies,
  ), /temporary network interruption/);
  const restartedJournal = new AsyncSyncJournal<unknown>(storage);
  const restartedInbox = new AsyncSyncInbox<unknown>(storage);
  assert.equal(await restartedJournal.getPendingCount(), 1);
  assert.deepEqual(await restartedInbox.getAll(), [remoteChange]);
  failUpload = false;
  const retried = await syncGoogleDriveNowAsync(
    restartedJournal, restartedInbox, { accessToken: 'token', folderId: 'folder-1' }, dependencies,
  );
  assert.equal(remoteListCalls, 2);
  assert.equal(retried.pulled.staged, 0);
  assert.equal(retried.pulled.duplicates, 1);
  assert.equal(retried.pushed.acknowledged, 1);
  assert.equal(retried.remainingOutbox, 0);
  assert.deepEqual(await restartedInbox.getAll(), [remoteChange]);
});
