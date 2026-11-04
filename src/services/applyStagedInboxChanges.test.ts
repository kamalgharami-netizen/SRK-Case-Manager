import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncInbox } from './googleDriveSyncInbox';
import { applyStagedInboxChanges } from './applyStagedInboxChanges';
import { AsyncSyncInbox } from './asyncSyncRepositories';
import { applyStagedInboxChangesAsync } from './applyStagedInboxChangesAsync';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';

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
  const saved: { value: Array<{ id: string; cases: unknown[] }> | null } = { value: null };
  const result = applyStagedInboxChanges([{ id: 'company1', cases: [] }], inbox, companies => { saved.value = companies as Array<{ id: string; cases: unknown[] }>; });
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
  assert.deepEqual(saved.value?.[0].cases, [{ id: 'c1', title: 'Remote case' }]);
});

test('acknowledges applied record deletions after persistence', () => {
  const inbox = new SyncInbox<unknown>(new MemoryStorage());
  inbox.add([{
    ...change,
    changeId: 'delete_case_change',
    deleted: true,
    payload: null,
  }]);
  let saved: Array<{ id: string; cases: unknown[] }> = [];
  const result = applyStagedInboxChanges(
    [{ id: 'company1', cases: [{ id: 'c1', title: 'Old case' }] }],
    inbox,
    companies => { saved = companies as Array<{ id: string; cases: unknown[] }>; }
  );
  assert.deepEqual(saved[0].cases, []);
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
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


test('acknowledges applied company profile changes after persistence', () => {
  const inbox = new SyncInbox<unknown>(new MemoryStorage());
  inbox.add([{ ...change, changeId: 'profile_change', recordId: 'company_profile', payload: { name: 'Updated Chamber' } }]);
  let saved: Array<{ id: string; name?: string }> = [];
  const result = applyStagedInboxChanges([{ id: 'company1', name: 'Old Chamber', cases: [] }], inbox, companies => {
    saved = companies as Array<{ id: string; name?: string }>;
  });
  assert.equal(saved[0].name, 'Updated Chamber');
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
});

test('acknowledges applied diary changes after persistence', () => {
  const inbox = new SyncInbox<unknown>(new MemoryStorage());
  inbox.add([{
    ...change,
    changeId: 'diary_change',
    recordId: 'diary:d1',
    payload: { caseId: 'case1', item: { id: 'd1', title: 'Hearing note' } },
  }]);
  const result = applyStagedInboxChanges([{ id: 'company1', cases: [], diaryData: {} }], inbox, () => undefined);
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
});


class AsyncMemoryStorage implements AsyncSyncStateStorage {
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

test('async staged apply persists company data before acknowledging native inbox state', async () => {
  const inbox = new AsyncSyncInbox<unknown>(new AsyncMemoryStorage());
  await inbox.add([change]);
  let persisted = false;
  const result = await applyStagedInboxChangesAsync(
    [{ id: 'company1', cases: [] }],
    inbox,
    async companies => {
      assert.deepEqual((companies[0] as { cases: unknown[] }).cases, [{ id: 'c1', title: 'Remote case' }]);
      persisted = true;
    },
  );
  assert.equal(persisted, true);
  assert.equal(result.applied, 1);
  assert.equal(result.acknowledged, 1);
  assert.equal(result.remaining, 0);
});

test('async staged apply retains inbox data when durable company persistence fails', async () => {
  const inbox = new AsyncSyncInbox<unknown>(new AsyncMemoryStorage());
  await inbox.add([change]);
  await assert.rejects(
    () => applyStagedInboxChangesAsync([{ id: 'company1', cases: [] }], inbox, async () => {
      throw new Error('native persistence unavailable');
    }),
    /native persistence unavailable/,
  );
  assert.equal((await inbox.getAll()).length, 1);
});
