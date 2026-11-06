import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateSyncDeviceId } from './driveSyncProtocol';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test('creates and persists a cryptographically random installation device ID', () => {
  const storage = new MemoryStorage();
  const id = getOrCreateSyncDeviceId(storage);
  assert.match(id, /^srk_[a-f0-9]{32}$/);
  assert.equal(storage.getItem('srk_sync_device_id_v1'), id);
});

test('reuses the existing valid installation device ID', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_sync_device_id_v1', 'srk_0123456789abcdef0123456789abcdef');
  assert.equal(getOrCreateSyncDeviceId(storage), 'srk_0123456789abcdef0123456789abcdef');
});

test('replaces a malformed legacy device ID with a secure ID', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_sync_device_id_v1', 'device_1234567890123456');
  const id = getOrCreateSyncDeviceId(storage);
  assert.match(id, /^srk_[a-f0-9]{32}$/);
  assert.notEqual(id, 'device_1234567890123456');
});


test('async device identifier is stable across calls and stored through the adapter', async () => {
  const { getOrCreateSyncDeviceIdAsync } = await import('./driveSyncProtocol');
  const values = new Map<string, string>();
  const storage = {
    async updateItem<T>(key: string, updater: (current: string | null) => { value: string | null; result: T }): Promise<T> {
      const next = updater(values.get(key) ?? null);
      if (next.value === null) values.delete(key);
      else values.set(key, next.value);
      return next.result;
    },
  };
  const first = await getOrCreateSyncDeviceIdAsync(storage);
  const second = await getOrCreateSyncDeviceIdAsync(storage);
  assert.match(first, /^srk_[a-f0-9]{32}$/);
  assert.equal(second, first);
  assert.equal(values.get('srk_sync_device_id_v1'), first);
});
