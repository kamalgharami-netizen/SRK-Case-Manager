/**
 * Validated device-registry model for multi-device sync.
 *
 * This module is deliberately storage-agnostic. It enforces the 10-active-device
 * policy within one registry snapshot, but it does NOT provide atomic cloud
 * registration or prevent concurrent devices from racing on a Drive JSON file.
 * Do not present this as authoritative enforcement until backed by an atomic
 * registration service or equivalent concurrency-safe authority.
 */
export const MAX_ACTIVE_SYNC_DEVICES = 10;
export const DEVICE_REGISTRY_SCHEMA_VERSION = 1 as const;

export interface SyncDeviceRegistration {
  deviceId: string;
  platform: 'windows' | 'android' | 'unknown';
  label: string;
  appVersion: string;
  registeredAt: number;
  lastSeenAt: number;
  revokedAt: number | null;
}

export interface SyncDeviceRegistry {
  schemaVersion: typeof DEVICE_REGISTRY_SCHEMA_VERSION;
  ownerAccountId: string;
  folderId: string;
  updatedAt: number;
  devices: SyncDeviceRegistration[];
}

export type DeviceRegistrationResult =
  | { ok: true; registry: SyncDeviceRegistry; device: SyncDeviceRegistration; alreadyRegistered: boolean }
  | { ok: false; reason: 'device-limit-reached' | 'identity-mismatch' | 'invalid-registry' | 'device-revoked' };

function validDevice(device: SyncDeviceRegistration): boolean {
  return Boolean(
    device &&
    /^srk_[a-f0-9]{32}$/.test(device.deviceId) &&
    ['windows', 'android', 'unknown'].includes(device.platform) &&
    typeof device.label === 'string' && device.label.length > 0 && device.label.length <= 80 &&
    typeof device.appVersion === 'string' && device.appVersion.length <= 40 &&
    Number.isFinite(device.registeredAt) &&
    Number.isFinite(device.lastSeenAt) &&
    (device.revokedAt === null || Number.isFinite(device.revokedAt))
  );
}

export function validateSyncDeviceRegistry(value: unknown): value is SyncDeviceRegistry {
  if (!value || typeof value !== 'object') return false;
  const registry = value as Partial<SyncDeviceRegistry>;
  return registry.schemaVersion === DEVICE_REGISTRY_SCHEMA_VERSION &&
    typeof registry.ownerAccountId === 'string' && registry.ownerAccountId.length > 0 &&
    typeof registry.folderId === 'string' && registry.folderId.length > 0 &&
    Number.isFinite(registry.updatedAt) &&
    Array.isArray(registry.devices) &&
    registry.devices.every(validDevice) &&
    new Set(registry.devices.map(device => device.deviceId)).size === registry.devices.length;
}

export function getActiveSyncDevices(registry: SyncDeviceRegistry): SyncDeviceRegistration[] {
  if (!validateSyncDeviceRegistry(registry)) throw new Error('Device registry is invalid.');
  return registry.devices.filter(device => device.revokedAt === null);
}

/** Register or refresh a device against a previously loaded registry snapshot. */
export function registerSyncDevice(
  registry: SyncDeviceRegistry,
  identity: { ownerAccountId: string; folderId: string },
  device: Omit<SyncDeviceRegistration, 'registeredAt' | 'lastSeenAt' | 'revokedAt'>,
  now = Date.now(),
): DeviceRegistrationResult {
  if (!validateSyncDeviceRegistry(registry) || !Number.isFinite(now) || !validDevice({
    ...device, registeredAt: now, lastSeenAt: now, revokedAt: null,
  })) return { ok: false, reason: 'invalid-registry' };

  if (registry.ownerAccountId !== identity.ownerAccountId || registry.folderId !== identity.folderId) {
    return { ok: false, reason: 'identity-mismatch' };
  }

  const existing = registry.devices.find(item => item.deviceId === device.deviceId);
  const isAlreadyActive = existing?.revokedAt === null;
  const activeCount = getActiveSyncDevices(registry).length;
  if (!isAlreadyActive && activeCount >= MAX_ACTIVE_SYNC_DEVICES) {
    return { ok: false, reason: 'device-limit-reached' };
  }

  const nextDevice: SyncDeviceRegistration = existing && isAlreadyActive
    ? { ...existing, ...device, lastSeenAt: now, revokedAt: null }
    : { ...device, registeredAt: now, lastSeenAt: now, revokedAt: null };

  const devices = existing
    ? registry.devices.map(item => item.deviceId === device.deviceId ? nextDevice : item)
    : [...registry.devices, nextDevice];

  return {
    ok: true,
    alreadyRegistered: Boolean(isAlreadyActive),
    device: nextDevice,
    registry: { ...registry, updatedAt: now, devices },
  };
}

/** Revoke a device without deleting its registration history or cloud data. */
export function revokeSyncDevice(
  registry: SyncDeviceRegistry,
  deviceId: string,
  now = Date.now(),
): SyncDeviceRegistry {
  if (!validateSyncDeviceRegistry(registry)) throw new Error('Device registry is invalid.');
  if (!Number.isFinite(now)) throw new Error('A valid revocation timestamp is required.');
  return {
    ...registry,
    updatedAt: now,
    devices: registry.devices.map(device =>
      device.deviceId === deviceId && device.revokedAt === null
        ? { ...device, revokedAt: now }
        : device
    ),
  };
}
