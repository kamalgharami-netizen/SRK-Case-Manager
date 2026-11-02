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
