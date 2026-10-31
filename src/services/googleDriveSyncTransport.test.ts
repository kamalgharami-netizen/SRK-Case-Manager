import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncJournal } from './syncJournal';
import { pushPendingChanges } from './googleDriveSyncTransport';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const envelope = (changeId: string) => ({
  schemaVersion: 1 as const,
  deviceId: 'device_1234567890123456',
  changeId,
  recordId: 'cases:' + changeId,
  companyId: 'company1',
  updatedAt: 1000,
  deleted: false,
  payload: { caseId: changeId },
});

test('uploads pending changes and acknowledges only after successful upload', async () => {
  const journal = new SyncJournal<unknown>(new MemoryStorage());
  journal.enqueue(envelope('change1'));
  journal.enqueue(envelope('change2'));
  const uploaded: string[] = [];
  const result = await pushPendingChanges(journal, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [] }),
    uploadJson: async options => {
      uploaded.push(options.name);
      return { id: 'file' + uploaded.length, name: options.name, mimeType: 'application/json' };
    },
  });
  assert.equal(result.uploaded, 2);
  assert.equal(result.acknowledged, 2);
  assert.equal(result.remaining, 0);
  assert.equal(uploaded.length, 2);
});

test('recognizes an already uploaded change and avoids duplicate upload', async () => {
  const journal = new SyncJournal<unknown>(new MemoryStorage());
  journal.enqueue(envelope('change1'));
  let uploadCalls = 0;
  const result = await pushPendingChanges(journal, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'existing', name: 'existing', mimeType: 'application/json' }] }),
    uploadJson: async () => {
      uploadCalls += 1;
      return { id: 'new', name: 'new', mimeType: 'application/json' };
    },
  });
  assert.equal(uploadCalls, 0);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
});

test('keeps unacknowledged changes when a Drive upload fails', async () => {
  const journal = new SyncJournal<unknown>(new MemoryStorage());
  journal.enqueue(envelope('change1'));
  await assert.rejects(
    pushPendingChanges(journal, { accessToken: 'token', folderId: 'folder1' }, {
      listFiles: async () => ({ files: [] }),
      uploadJson: async () => { throw new Error('network unavailable'); },
    }),
    /network unavailable/
  );
  assert.equal(journal.getPendingCount(), 1);
});

test('requires an explicitly selected Drive folder', async () => {
  const journal = new SyncJournal<unknown>(new MemoryStorage());
  await assert.rejects(
    pushPendingChanges(journal, { accessToken: 'token', folderId: '' }),
    /Select a Google Drive sync folder/
  );
});
