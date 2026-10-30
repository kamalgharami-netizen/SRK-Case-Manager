import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncInbox } from './googleDriveSyncInbox';
import { applyStagedInboxChanges } from './applyStagedInboxChanges';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const change = {
  schemaVersion: 1 as const, deviceId: 'remote_device_123456789',
  changeId: 'remote_change_1', recordId: 'cases:c1', companyId: 'company1',
  updatedAt: 100, deleted: false,
  payload: { collection: 'cases', item: { id: 'c1', title: 'Remote case' } },
};

test('persists approved staged changes before acknowledging inbox entries', () => {
  const storage = new MemoryStorage();
  const inbox = new SyncInbox<unknown>(storage);
  inbox.add([change]);
  let saved: Array<{ id: string; cases: unknown[] }> | null = null;
  const result = applyStagedInboxChanges([{ id: 'company1', cases: [] }], inbox, companies => { saved = companies; });
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
  assert.deepEqual(saved?.[0].cases, [{ id: 'c1', title: 'Remote case' }]);
});

test('keeps staged entries when persistence fails', () => {
  const inbox = new SyncInbox<unknown>(new MemoryStorage());
  inbox.add([change]);
  assert.throws(() => applyStagedInboxChanges([{ id: 'company1', cases: [] }], inbox, () => {
    throw new Error('storage unavailable');
  }), /storage unavailable/);
  assert.equal(inbox.getAll().length, 1);
});

test('does not acknowledge workspace deletions requiring manual review', () => {
  const inbox = new SyncInbox<unknown>(new MemoryStorage());
  inbox.add([{ ...change, changeId: 'workspace_delete', recordId: 'company_workspace', deleted: true, payload: null }]);
  const result = applyStagedInboxChanges([{ id: 'company1', cases: [] }], inbox, () => {
    throw new Error('must not persist');
  });
  assert.equal(result.manualReview, 1);
  assert.equal(result.acknowledged, 0);
  assert.equal(result.remaining, 1);
});
