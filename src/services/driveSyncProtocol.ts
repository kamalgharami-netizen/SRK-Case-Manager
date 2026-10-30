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
 * retained as an explicit conflict, even if timestamps happen to be equal.
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

    // Changes from the same device can be ordered by its local timestamp.
    if (local.deviceId === remote.deviceId) {
      merged.push(local.updatedAt >= remote.updatedAt ? local : remote);
      continue;
    }

    // Independent device edits are not safely orderable by wall-clock time.
    conflicts.push({ recordId: local.recordId, local, remote });
    merged.push(local);
  }

  return { merged, conflicts, unchanged };
}

/** Create a stable, non-secret device identifier for this app installation. */
export function getOrCreateSyncDeviceId(storage: Pick<Storage, 'getItem' | 'setItem'>): string {
  const key = 'srk_sync_device_id_v1';
  const existing = storage.getItem(key);
  if (existing && /^[a-zA-Z0-9_-]{16,80}$/.test(existing)) return existing;

  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const deviceId = `srk_${randomPart}`;
  storage.setItem(key, deviceId);
  return deviceId;
}
