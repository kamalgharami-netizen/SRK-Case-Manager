import test from 'node:test';
import assert from 'node:assert/strict';
import { syncGoogleDriveNow } from './googleDriveSyncCoordinator';
import { SyncInbox } from './googleDriveSyncInbox';
import { SyncJournal, type SyncJournalStorage } from './syncJournal';
import type { SyncEnvelope } from './driveSyncProtocol';

class MemoryStorage implements SyncJournalStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

function envelope(overrides: Partial<SyncEnvelope<{ title: string }>> = {}): SyncEnvelope<{ title: string }> {
  return {
    schemaVersion: 1,
    deviceId: 'device_local_123456789',
    changeId: 'change_local_123456789',
    recordId: 'case:1',
    companyId: 'company:1',
    updatedAt: 100,
    deleted: false,
    payload: { title: 'Local title' },
    ...overrides,
  };
}

test('coordinator pulls before pushing and records concurrent edits as conflicts', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<{ title: string }>(storage);
  const inbox = new SyncInbox<{ title: string }>(storage);
  const local = envelope();
  const remote = envelope({
    deviceId: 'device_remote_123456',
    changeId: 'change_remote_123456',
    updatedAt: 200,
    payload: { title: 'Remote title' },
  });
  journal.enqueue(local);

  const calls: string[] = [];
  const result = await syncGoogleDriveNow(journal, inbox, {
    accessToken: 'test-token',
    folderId: 'folder-1',
  }, {
    pull: {
      listFiles: async options => {
        calls.push('pull');
        return {
          files: [{ id: 'remote-file-1', name: 'srk-change-remote.json', mimeType: 'application/json' }],
        };
      },
      downloadJson: async () => remote,
    },
    push: {
      listFiles: async options => {
        calls.push('push-check');
        return { files: [] };
      },
      uploadJson: async options => {
        calls.push('push-upload');
        return { id: 'uploaded-1', name: options.name, mimeType: 'application/json' };
      },
    },
  });

  assert.equal(result.conflicts, 1);
  assert.equal(result.staged, 0);
  assert.equal(result.remainingInbox, 0);
  assert.equal(result.remainingOutbox, 0);
  assert.deepEqual(calls, ['pull', 'push-check', 'push-upload']);
  assert.equal(journal.getConflicts().length, 1);
});

test('coordinator stages non-conflicting remote changes and never auto-applies them', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<{ title: string }>(storage);
  const inbox = new SyncInbox<{ title: string }>(storage);
  const remote = envelope({
    deviceId: 'device_remote_123456',
    changeId: 'change_remote_987654',
    recordId: 'case:2',
    payload: { title: 'Remote-only record' },
  });

  const result = await syncGoogleDriveNow(journal, inbox, {
    accessToken: 'test-token',
    folderId: 'folder-1',
  }, {
    pull: {
      listFiles: async () => ({
        files: [{ id: 'remote-file-2', name: 'srk-change-remote-2.json', mimeType: 'application/json' }],
      }),
      downloadJson: async () => remote,
    },
    push: {
      listFiles: async () => ({ files: [] }),
      uploadJson: async options => ({ id: 'unused', name: options.name, mimeType: 'application/json' }),
    },
  });

  assert.equal(result.staged, 1);
  assert.equal(result.remainingInbox, 1);
  assert.equal(inbox.getAll()[0].changeId, remote.changeId);
  assert.equal(journal.getPendingCount(), 0);
});

test('coordinator rejects missing credentials or folder before network access', async () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal<{ title: string }>(storage);
  const inbox = new SyncInbox<{ title: string }>(storage);
  await assert.rejects(
    syncGoogleDriveNow(journal, inbox, { accessToken: '', folderId: 'folder-1' }),
    /access token is required/,
  );
  await assert.rejects(
    syncGoogleDriveNow(journal, inbox, { accessToken: 'test-token', folderId: '' }),
    /Select a Google Drive sync folder/,
  );
});
