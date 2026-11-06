/**
 * Conflict-safe primitives for SRK Case Manager cloud synchronisation.
 *
 * This module deliberately does not perform Google authentication or network
 * requests. Platform OAuth and Drive transport must be added only after their
 * native redirect/callback flows are configured and verified.
 *
 * The existing localStorage database remains authoritative for offline use.
 * Callers must never replace the whole database with a remote snapshot.
 */

export interface SyncEnvelope<T> {
  schemaVersion: 1;
  deviceId: string;
  changeId: string;
  recordId: string;
  companyId: string;
  updatedAt: number;
  deleted: boolean;
  payload: T | null;
}

export interface SyncConflict<T> {
  recordId: string;
  local: SyncEnvelope<T>;
  remote: SyncEnvelope<T>;
}

export interface SyncMergeResult<T> {
  merged: SyncEnvelope<T>[];
  conflicts: SyncConflict<T>[];
  unchanged: number;
}

const isValidEnvelope = <T>(value: unknown): value is SyncEnvelope<T> => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SyncEnvelope<T>>;
  return item.schemaVersion === 1 &&
    typeof item.deviceId === 'string' && item.deviceId.length > 0 &&
    typeof item.changeId === 'string' && item.changeId.length > 0 &&
    typeof item.recordId === 'string' && item.recordId.length > 0 &&
    typeof item.companyId === 'string' && item.companyId.length > 0 &&
    typeof item.updatedAt === 'number' && Number.isFinite(item.updatedAt) &&
    typeof item.deleted === 'boolean' &&
    (item.deleted ? item.payload === null : item.payload !== null && item.payload !== undefined);
};

/**
 * Merge record-level changes without silently overwriting concurrent edits.
 * Equal change IDs are duplicates. Different changes to the same record are
 * retained as an explicit conflict when their order cannot be established.
 */
export function mergeSyncEnvelopes<T>(
  localChanges: readonly SyncEnvelope<T>[],
  remoteChanges: readonly SyncEnvelope<T>[]
): SyncMergeResult<T> {
  const localById = new Map<string, SyncEnvelope<T>>();
  const remoteById = new Map<string, SyncEnvelope<T>>();

  for (const change of localChanges) {
    if (!isValidEnvelope<T>(change)) throw new Error('Invalid local sync change envelope');
    localById.set(`${change.companyId}:${change.recordId}`, change);
  }
  for (const change of remoteChanges) {
    if (!isValidEnvelope<T>(change)) throw new Error('Invalid remote sync change envelope');
    remoteById.set(`${change.companyId}:${change.recordId}`, change);
  }

  const merged: SyncEnvelope<T>[] = [];
  const conflicts: SyncConflict<T>[] = [];
  let unchanged = 0;
  const recordIds = new Set([...localById.keys(), ...remoteById.keys()]);

  for (const recordId of recordIds) {
    const local = localById.get(recordId);
    const remote = remoteById.get(recordId);
    if (!local && remote) {
      merged.push(remote);
      continue;
    }
    if (local && !remote) {
      merged.push(local);
      continue;
    }
    if (!local || !remote) continue;

    if (local.changeId === remote.changeId) {
      merged.push(local);
      unchanged += 1;
      continue;
    }

    // Same-device revisions are orderable only when their timestamps differ.
    // Equal timestamps can occur within one millisecond; choosing either would
    // make the result depend on Drive listing order, so preserve both as a conflict.
    if (local.deviceId === remote.deviceId && local.updatedAt !== remote.updatedAt) {
      merged.push(local.updatedAt > remote.updatedAt ? local : remote);
      continue;
    }

    // Independent device edits, or same-device edits with indistinguishable
    // timestamps, are not safely orderable.
    conflicts.push({ recordId: local.recordId, local, remote });
    merged.push(local);
  }

  return { merged, conflicts, unchanged };
}

/** Create a stable, non-secret device identifier for this app installation.
 *
 * IDs are generated only with a cryptographically secure random source. A
 * weak Math.random fallback could cause collisions across installations and
 * is therefore deliberately not used. If secure randomness is unavailable,
 * fail closed rather than registering an unreliable device identity.
 */
export function getOrCreateSyncDeviceId(storage: Pick<Storage, 'getItem' | 'setItem'>): string {
  const key = 'srk_sync_device_id_v1';
  const existing = storage.getItem(key);
  if (existing && /^srk_[a-f0-9]{32}$/.test(existing)) return existing;

  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Secure random generation is unavailable; this device cannot be registered safely.');
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const randomPart = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const deviceId = `srk_${randomPart}`;
  storage.setItem(key, deviceId);
  return deviceId;
}


/** Async variant used when device identity is stored in the selected sync-state adapter. */
export async function getOrCreateSyncDeviceIdAsync(storage: {
  updateItem<T>(
    key: string,
    updater: (current: string | null) => { value: string | null; result: T },
  ): Promise<T>;
}): Promise<string> {
  return storage.updateItem('srk_sync_device_id_v1', current => {
    if (current && /^srk_[a-f0-9]{32}$/.test(current)) {
      return { value: current, result: current };
    }
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      throw new Error('Secure random generation is unavailable; this device cannot be registered safely.');
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const randomPart = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const deviceId = `srk_${randomPart}`;
    return { value: deviceId, result: deviceId };
  });
}
