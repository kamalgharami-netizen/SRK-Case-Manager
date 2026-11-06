import test from 'node:test';
import assert from 'node:assert/strict';
import { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';
import type { SyncEnvelope } from './driveSyncProtocol';

class MemoryAsyncStorage implements AsyncSyncStateStorage {
  private values = new Map<string, string>();
  async getItem(key: string): Promise<string | null> { return this.values.get(key) ?? null; }
  async setItem(key: string, value: string): Promise<void> { this.values.set(key, value); }
  async removeItem(key: string): Promise<void> { this.values.delete(key); }
  async updateItem<T>(key: string, updater: (current: string | null) => { value: string | null; result: T }): Promise<T> {
    const next = updater(this.values.get(key) ?? null);
    if (next.value === null) this.values.delete(key);
    else this.values.set(key, next.value);
    return next.result;
  }
  seed(key: string, value: string): void { this.values.set(key, value); }
}

function envelope(changeId: string, title = 'Case'): SyncEnvelope<{ title: string }> {
  return {
    schemaVersion: 1,
    deviceId: 'device_1234567890123456',
    changeId,
    recordId: 'case_1',
    companyId: 'company_1',
    updatedAt: 100,
    deleted: false,
    payload: { title },
  };
}

test('async journal enqueue is idempotent and acknowledges only confirmed IDs', async () => {
  const storage = new MemoryAsyncStorage();
  const journal = new AsyncSyncJournal<{ title: string }>(storage);
  const first = envelope('change_1');
  const second = { ...envelope('change_2'), recordId: 'case_2' };
  await journal.enqueue(first);
  await journal.enqueue(first);
  await journal.enqueue(second);
  assert.equal(await journal.getPendingCount(), 2);
  assert.equal(await journal.acknowledge(['change_1']), 1);
  assert.deepEqual(await journal.getPending(), [second]);
});

test('async inbox deduplicates seen changes and retains acknowledged IDs', async () => {
  const storage = new MemoryAsyncStorage();
  const inbox = new AsyncSyncInbox<{ title: string }>(storage);
  const first = envelope('remote_1');
  assert.equal(await inbox.add([first, first]), 1);
  assert.equal(await inbox.acknowledge([first.changeId]), 1);
  assert.equal(await inbox.hasSeen(first.changeId), true);
  assert.equal(await inbox.add([first]), 0);
  assert.deepEqual(await inbox.getAll(), []);
});

test('async journal fails closed on corrupt data without overwriting it', async () => {
  const storage = new MemoryAsyncStorage();
  storage.seed('srk_sync_journal_v1', '{broken');
  const journal = new AsyncSyncJournal<{ title: string }>(storage);
  await assert.rejects(journal.getPending(), /unreadable/);
  assert.equal(await storage.getItem('srk_sync_journal_v1'), '{broken');
});

test('async conflict resolution queues selected value before removing conflict', async () => {
  const storage = new MemoryAsyncStorage();
  const journal = new AsyncSyncJournal<{ title: string }>(storage);
  const local = envelope('local_1', 'Local');
  const remote = { ...envelope('remote_1', 'Remote'), deviceId: 'device_2234567890123456' };
  await journal.enqueue(local);
  await journal.saveConflicts([{ recordId: local.recordId, local, remote }]);
  assert.equal(await journal.resolveConflictAndQueue(
    local.recordId, local.changeId, remote.changeId, 'remote',
    'device_3234567890123456', 500
  ), true);
  const pending = await journal.getPending();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].payload?.title, 'Remote');
  assert.notEqual(pending[0].changeId, remote.changeId);
  assert.deepEqual(await journal.getConflicts(), []);
});

test('async inbox accepts version-1 inboxes created before seenChangeIds existed', async () => {
  const storage = new MemoryAsyncStorage();
  const remote = envelope('legacy_remote_1');
  storage.seed('srk_sync_inbox_v1', JSON.stringify({ schemaVersion: 1, changes: [remote] }));
  const inbox = new AsyncSyncInbox<{ title: string }>(storage);
  assert.deepEqual(await inbox.getAll(), [remote]);
  assert.equal(await inbox.hasSeen(remote.changeId), true);
  assert.equal(await inbox.add([remote]), 0);
});


test('async journal atomically enqueues a snapshot batch and deduplicates IDs', async () => {
  const storage = new MemoryAsyncStorage();
  const journal = new AsyncSyncJournal<{ title: string }>(storage);
  const first = envelope('batch_1');
  const second = { ...envelope('batch_2'), recordId: 'case_2' };
  assert.equal(await journal.enqueueMany([first, second, first]), 2);
  assert.equal(await journal.enqueueMany([first, second]), 0);
  assert.equal(await journal.getPendingCount(), 2);
  assert.deepEqual(await journal.getPending(), [first, second]);
});

test('async journal validates an entire batch before writing any entry', async () => {
  const storage = new MemoryAsyncStorage();
  const journal = new AsyncSyncJournal<{ title: string }>(storage);
  const first = envelope('valid_batch_entry');
  const invalid = { ...envelope('invalid_batch_entry'), updatedAt: Number.NaN };
  await assert.rejects(journal.enqueueMany([first, invalid]), /invalid|envelope/i);
  assert.equal(await journal.getPendingCount(), 0);
});
