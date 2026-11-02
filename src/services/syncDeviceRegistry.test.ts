import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveSyncDevices,
  MAX_ACTIVE_SYNC_DEVICES,
  registerSyncDevice,
  revokeSyncDevice,
  validateSyncDeviceRegistry,
  type SyncDeviceRegistry,
} from './syncDeviceRegistry';

const registry = (): SyncDeviceRegistry => ({
  schemaVersion: 1,
  ownerAccountId: 'google-account-opaque-id',
  folderId: 'drive-folder-id',
  updatedAt: 100,
  devices: [],
});

const device = (index: number) => ({
  deviceId: 'srk_' + index.toString(16).padStart(32, '0'),
  platform: 'windows' as const,
  label: 'Windows ' + index,
  appVersion: '5.4.1',
});

test('accepts ten active devices and refuses an eleventh', () => {
  let current = registry();
  for (let index = 1; index <= MAX_ACTIVE_SYNC_DEVICES; index += 1) {
    const result = registerSyncDevice(current, { ownerAccountId: current.ownerAccountId, folderId: current.folderId }, device(index), 100 + index);
    assert.equal(result.ok, true);
    if (result.ok) current = result.registry;
  }
  assert.equal(getActiveSyncDevices(current).length, 10);
  const eleventh = registerSyncDevice(current, { ownerAccountId: current.ownerAccountId, folderId: current.folderId }, device(11), 200);
  assert.deepEqual(eleventh, { ok: false, reason: 'device-limit-reached' });
});

test('re-registering the same device refreshes it without consuming another slot', () => {
  const initial = registry();
  const first = registerSyncDevice(initial, { ownerAccountId: initial.ownerAccountId, folderId: initial.folderId }, device(1), 101);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const again = registerSyncDevice(first.registry, { ownerAccountId: initial.ownerAccountId, folderId: initial.folderId }, { ...device(1), label: 'Renamed PC' }, 202);
  assert.equal(again.ok, true);
  if (!again.ok) return;
  assert.equal(again.alreadyRegistered, true);
  assert.equal(again.registry.devices.length, 1);
  assert.equal(again.device.lastSeenAt, 202);
  assert.equal(again.device.label, 'Renamed PC');
});

test('rejects a registration for another Google account or Drive folder', () => {
  const current = registry();
  const result = registerSyncDevice(current, { ownerAccountId: 'different-account', folderId: current.folderId }, device(1), 101);
  assert.deepEqual(result, { ok: false, reason: 'identity-mismatch' });
});

test('revocation frees an active slot but preserves the device history', () => {
  const current = registry();
  const first = registerSyncDevice(current, { ownerAccountId: current.ownerAccountId, folderId: current.folderId }, device(1), 101);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const revoked = revokeSyncDevice(first.registry, device(1).deviceId, 202);
  assert.equal(getActiveSyncDevices(revoked).length, 0);
  assert.equal(revoked.devices.length, 1);
  assert.equal(revoked.devices[0].revokedAt, 202);
  const replacement = registerSyncDevice(revoked, { ownerAccountId: current.ownerAccountId, folderId: current.folderId }, device(2), 303);
  assert.equal(replacement.ok, true);
});

test('rejects malformed registries and duplicate device IDs', () => {
  const invalid = { ...registry(), devices: [device(1), device(1)] };
  assert.equal(validateSyncDeviceRegistry(invalid), false);
});
