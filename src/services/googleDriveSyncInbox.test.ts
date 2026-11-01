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

test('downloads a repeated Drive change ID only once during a single pull', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  let downloads = 0;
  const remote = envelope('same-change');
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({
      files: [
        { id: 'file1', name: 'srk-change-same-change.json', mimeType: 'application/json' },
        { id: 'file2', name: 'srk-change-same-change.json', mimeType: 'application/json' },
      ],
    }),
    downloadJson: async () => { downloads += 1; return remote; },
  });

  assert.equal(downloads, 1);
  assert.equal(result.downloaded, 1);
  assert.equal(result.duplicates, 1);
  assert.equal(result.staged, 1);
  assert.equal(inbox.getAll().length, 1);
});

test('does not download a remote change again after it has been acknowledged', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const remote = envelope('already-reviewed');
  inbox.add([remote]);
  inbox.acknowledge([remote.changeId]);
  let downloads = 0;
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-already-reviewed.json', mimeType: 'application/json' }] }),
    downloadJson: async () => { downloads += 1; return remote; },
  });
  assert.equal(downloads, 0);
  assert.equal(result.duplicates, 1);
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 0);
});

test('remembers remote conflicts so repeated pulls do not recreate them', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  journal.enqueue(envelope('local-conflict', 'local_device_123456'));
  let downloads = 0;
  const remote = envelope('remote-conflict');
  const dependencies = {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-remote-conflict.json', mimeType: 'application/json' }] }),
    downloadJson: async () => { downloads += 1; return remote; },
  };
  const first = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, dependencies);
  const second = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, dependencies);
  assert.equal(first.conflicts, 1);
  assert.equal(second.conflicts, 0);
  assert.equal(downloads, 1);
  assert.equal(journal.getConflicts().length, 1);
});

test('routes concurrent remote edits from different devices to conflict review', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const first = envelope('remote-device-a', 'device_a_123456789');
  const second = envelope('remote-device-b', 'device_b_123456789');
  let downloads = 0;

  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({
      files: [
        { id: 'file-a', name: 'srk-change-remote-device-a.json', mimeType: 'application/json' },
        { id: 'file-b', name: 'srk-change-remote-device-b.json', mimeType: 'application/json' },
      ],
    }),
    downloadJson: async options => {
      downloads += 1;
      return options.fileId === 'file-a' ? first : second;
    },
  });

  assert.equal(downloads, 2);
  assert.equal(result.downloaded, 2);
  assert.equal(result.conflicts, 1);
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 0);
  const conflicts = journal.getConflicts();
  assert.equal(conflicts.length, 1);
  assert.deepEqual(
    new Set([conflicts[0].local.changeId, conflicts[0].remote.changeId]),
    new Set(['remote-device-a', 'remote-device-b'])
  );
});

test('keeps the newest revision when repeated remote changes come from the same device', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const older = { ...envelope('same-device-old'), updatedAt: 100 };
  const newer = { ...envelope('same-device-new'), updatedAt: 200 };

  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({
      files: [
        { id: 'file-old', name: 'srk-change-same-device-old.json', mimeType: 'application/json' },
        { id: 'file-new', name: 'srk-change-same-device-new.json', mimeType: 'application/json' },
      ],
    }),
    downloadJson: async options => options.fileId === 'file-old' ? older : newer,
  });

  assert.equal(result.conflicts, 0);
  assert.equal(result.staged, 1);
  assert.deepEqual(inbox.getAll(), [newer]);
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

test('returns a continuation token when the pull page limit is reached', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const requestedTokens: Array<string | undefined> = [];
  const result = await pullRemoteChanges(
    journal,
    inbox,
    { accessToken: 'token', folderId: 'folder1', maxPages: 1 },
    {
      listFiles: async options => {
        requestedTokens.push(options.pageToken);
        return { files: [], nextPageToken: 'page-2' };
      },
      downloadJson: async () => envelope('unused'),
    }
  );
  assert.equal(result.pages, 1);
  assert.equal(result.nextPageToken, 'page-2');
  assert.equal(requestedTokens[0], undefined);

  const next = await pullRemoteChanges(
    journal,
    inbox,
    { accessToken: 'token', folderId: 'folder1', maxPages: 1, pageToken: result.nextPageToken },
    {
      listFiles: async options => {
        requestedTokens.push(options.pageToken);
        return { files: [], nextPageToken: undefined };
      },
      downloadJson: async () => envelope('unused'),
    }
  );
  assert.equal(next.pages, 1);
  assert.equal(next.nextPageToken, undefined);
  assert.deepEqual(requestedTokens, [undefined, 'page-2']);
});

test('fails closed when more than 500 local changes prevent complete conflict detection', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  for (let index = 0; index < 501; index += 1) {
    journal.enqueue({
      ...envelope(`local-${index}`, 'local_device_123456'),
      recordId: `cases:case-${index}`,
    });
  }
  let listCalls = 0;

  await assert.rejects(
    pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
      listFiles: async () => {
        listCalls += 1;
        return { files: [{ id: 'file1', name: 'srk-change-remote1.json', mimeType: 'application/json' }] };
      },
      downloadJson: async () => envelope('remote1'),
    }),
    /More than 500 local changes are pending/
  );

  assert.equal(listCalls, 0);
  assert.equal(journal.getPendingCount(), 501);
  assert.equal(inbox.getAll().length, 0);
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


test('stages remote deletion tombstones and does not apply them during pull', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const tombstone = {
    ...envelope('remote-delete'),
    recordId: 'cases:case1',
    deleted: true,
    payload: null,
  };
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'delete-file', name: 'srk-change-remote-delete.json', mimeType: 'application/json' }] }),
    downloadJson: async () => tombstone,
  });

  assert.equal(result.downloaded, 1);
  assert.equal(result.staged, 1);
  assert.deepEqual(inbox.getAll(), [tombstone]);
  assert.equal(journal.getPendingCount(), 0);
});

test('routes a remote deletion against a pending local edit to conflict review', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  journal.enqueue({
    ...envelope('local-edit', 'local_device_123456'),
    payload: { id: 'case1', caseNo: 'locally edited' },
  });
  const tombstone = {
    ...envelope('remote-delete'),
    recordId: 'cases:case1',
    deleted: true,
    payload: null,
  };

  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'delete-file', name: 'srk-change-remote-delete.json', mimeType: 'application/json' }] }),
    downloadJson: async () => tombstone,
  });

  assert.equal(result.conflicts, 1);
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 0);
  const conflicts = journal.getConflicts();
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].remote.deleted, true);
  assert.equal(conflicts[0].remote.payload, null);
  assert.equal(journal.getPendingCount(), 1);
});

test('does not download a previously seen remote deletion tombstone again', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  const tombstone = {
    ...envelope('remote-delete'),
    deleted: true,
    payload: null,
  };
  inbox.add([tombstone]);
  inbox.acknowledge([tombstone.changeId]);
  let downloads = 0;

  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'delete-file', name: 'srk-change-remote-delete.json', mimeType: 'application/json' }] }),
    downloadJson: async () => { downloads += 1; return tombstone; },
  });

  assert.equal(downloads, 0);
  assert.equal(result.duplicates, 1);
  assert.equal(inbox.getAll().length, 0);
});

test('rejects a Drive filename whose change ID does not match its envelope', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  let downloads = 0;
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-filename-id.json', mimeType: 'application/json' }] }),
    downloadJson: async () => { downloads += 1; return envelope('payload-id'); },
  });

  assert.equal(downloads, 1);
  assert.equal(result.downloaded, 0);
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 0);
  assert.equal(inbox.hasSeen('payload-id'), false);
});

test('does not download a change with a malformed encoded Drive filename', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<unknown>(storage);
  const inbox = new SyncInbox<unknown>(storage);
  let downloads = 0;
  const result = await pullRemoteChanges(journal, inbox, { accessToken: 'token', folderId: 'folder1' }, {
    listFiles: async () => ({ files: [{ id: 'file1', name: 'srk-change-%E0%A4%A.json', mimeType: 'application/json' }] }),
    downloadJson: async () => { downloads += 1; return envelope('unused'); },
  });

  assert.equal(downloads, 0);
  assert.equal(result.downloaded, 0);
  assert.equal(result.staged, 0);
  assert.equal(inbox.getAll().length, 0);
});
