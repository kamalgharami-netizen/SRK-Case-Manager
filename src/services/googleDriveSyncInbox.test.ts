import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncJournal } from './syncJournal';
import { SyncInbox, pullRemoteChanges } from './googleDriveSyncInbox';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const envelope = (changeId: string, deviceId = 'remote_device_123456') => ({
  schemaVersion: 1 as const,
  deviceId,
  changeId,
  recordId: 'cases:case1',
  companyId: 'company1',
  updatedAt: 1000,
  deleted: false,
  payload: { id: 'case1', caseNo: changeId },
});

test('downloads remote change and stages it without applying to live state', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const remote = envelope('remote1');
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-remote1.json', mimeType: 'application/json' }] }),
    downloadJson: async () => remote,
  });
  assert.equal(result.downloaded, 1);
  assert.equal(result.staged, 1);
  assert.deepEqual(inbox.getAll(), [remote]);
  assert.equal(journal.getPendingCount(), 0);
});

test('stores concurrent local and remote edits as a conflict, not inbox overwrite', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  journal.enqueue(envelope('local1', 'local_device_123456'));
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-remote1.json', mimeType: 'application/json' }] }),
    downloadJson: async () => envelope('remote1'),
  });
  assert.equal(result.conflicts, 1);
  assert.equal(inbox.getAll().length, 0);
  assert.equal(journal.getConflicts().length, 1);
  assert.equal(journal.getPendingCount(), 1);
});

test('ignores duplicate inbox change IDs', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  inbox.add([envelope('remote1')]);
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-remote1.json', mimeType: 'application/json' }] }),
    downloadJson: async () => envelope('remote1'),
  });
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 1);
});

test('follows Drive pagination up to configured page limit', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const tokens: Array<string | undefined> = [];
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1', maxPages: 2 }, {
    listFiles: async options => {
      tokens.push(options.pageToken);
      return options.pageToken
        ? { files: [], nextPageToken: undefined }
        : { files: [], nextPageToken: 'page2' };
    },
    downloadJson: async () => envelope('unused'),
  });
  assert.equal(result.pages, 2);
  assert.deepEqual(tokens, [undefined, 'page2']);
});

test('requires a selected Drive folder', async () => {
  const storage = new MemoryStorage();
  await assert.rejects(
    pullRemoteChanges(new SyncJournal<unknown>(storage), new SyncInbox<unknown>(storage), { accessToken: 'token', folderId: '' }, {
      listFiles: async () => ({ files: [] }),
      downloadJson: async () => envelope('unused'),
    }),
    /Select a Google Drive sync folder/
  );
});
