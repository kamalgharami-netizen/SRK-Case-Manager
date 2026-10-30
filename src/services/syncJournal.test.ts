import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncJournal, type SyncJournalStorage } from './syncJournal';
import type { SyncEnvelope } from './driveSyncProtocol';

class MemoryStorage implements SyncJournalStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  seed(key: string, value: string): void { this.values.set(key, value); }
}

function change(overrides: Partial<SyncEnvelope<{ title: string }>> = {}): SyncEnvelope<{ title: string }> {
  return {
    schemaVersion: 1,
    deviceId: 'device_1234567890123456',
    changeId: 'change_1234567890123456',
    recordId: 'case_1',
    companyId: 'company_1',
    updatedAt: 100,
    deleted: false,
    payload: { title: 'Case title' },
    ...overrides,
  };
}

test('enqueue is idempotent and preserves independent pending records', () => {
  const journal = new SyncJournal(new MemoryStorage());
  const first = change();
  const second = change({ changeId: 'change_2234567890123456', recordId: 'case_2' });
  journal.enqueue(first);
  journal.enqueue(first);
  journal.enqueue(second);
  assert.equal(journal.getPendingCount(), 2);
  assert.deepEqual(journal.getPending(1), [first]);
});

test('acknowledge removes only explicitly confirmed change IDs', () => {
  const journal = new SyncJournal(new MemoryStorage());
  const first = change();
  const second = change({ changeId: 'change_2234567890123456', recordId: 'case_2' });
  journal.enqueue(first);
  journal.enqueue(second);
  assert.equal(journal.acknowledge([first.changeId]), 1);
  assert.deepEqual(journal.getPending(), [second]);
  assert.equal(journal.acknowledge([first.changeId]), 0);
});

test('invalid entries are rejected without being stored', () => {
  const storage = new MemoryStorage();
  const journal = new SyncJournal(storage);
  assert.throws(() => journal.enqueue(change({ updatedAt: Number.NaN })), /Invalid sync journal entry/);
  assert.equal(journal.getPendingCount(), 0);
});

test('corrupt journal data fails closed and remains unchanged', () => {
  const storage = new MemoryStorage();
  storage.seed('srk_sync_journal_v1', '{not-json');
  const journal = new SyncJournal(storage);
  assert.throws(() => journal.getPending(), /unreadable/);
  assert.equal(storage.getItem('srk_sync_journal_v1'), '{not-json');
});

test('conflicts are persisted, deduplicated and can be resolved explicitly', () => {
  const journal = new SyncJournal(new MemoryStorage());
  const local = change();
  const remote = change({
    deviceId: 'device_2234567890123456',
    changeId: 'change_2234567890123456',
    payload: { title: 'Remote edit' },
  });
  const conflict = { recordId: local.recordId, local, remote };
  journal.saveConflicts([conflict, conflict]);
  assert.equal(journal.getConflicts().length, 1);
  assert.equal(journal.resolveConflict(local.recordId, local.changeId, remote.changeId), true);
  assert.equal(journal.getConflicts().length, 0);
  assert.equal(journal.resolveConflict(local.recordId, local.changeId, remote.changeId), false);
});
