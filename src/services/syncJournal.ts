import type { SyncConflict, SyncEnvelope } from './driveSyncProtocol';

const JOURNAL_KEY = 'srk_sync_journal_v1';
const CONFLICT_KEY = 'srk_sync_conflicts_v1';
const JOURNAL_SCHEMA = 1;

export interface SyncJournalState<T> {
  schemaVersion: typeof JOURNAL_SCHEMA;
  pending: SyncEnvelope<T>[];
  syncedChangeIds: string[];
}

export interface SyncConflictState<T> {
  schemaVersion: typeof JOURNAL_SCHEMA;
  conflicts: SyncConflict<T>[];
}

export interface SyncJournalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function readJson<T>(storage: SyncJournalStorage, key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Do not overwrite corrupted data. Fail closed and let the caller recover.
    throw new Error(`Sync data at ${key} is unreadable; it was left untouched.`);
  }
}

function validateEnvelope<T>(change: SyncEnvelope<T>): void {
  if (
    change.schemaVersion !== 1 ||
    !change.deviceId ||
    !change.changeId ||
    !change.recordId ||
    !change.companyId ||
    !Number.isFinite(change.updatedAt) ||
    typeof change.deleted !== 'boolean' ||
    (change.deleted ? change.payload !== null : change.payload === null || change.payload === undefined)
  ) {
    throw new Error('Invalid sync journal entry.');
  }
}

/**
 * Durable append-only local outbox.
 * Acknowledgements remove only explicitly confirmed change IDs; unrelated
 * pending entries are never replaced by a remote snapshot.
 */
export class SyncJournal<T> {
  constructor(private readonly storage: SyncJournalStorage) {}

  private readState(): SyncJournalState<T> {
    const state = readJson<SyncJournalState<T>>(this.storage, JOURNAL_KEY, {
      schemaVersion: JOURNAL_SCHEMA,
      pending: [],
      syncedChangeIds: [],
    });
    if (state.schemaVersion !== JOURNAL_SCHEMA || !Array.isArray(state.pending) || !Array.isArray(state.syncedChangeIds)) {
      throw new Error('Sync journal format is unsupported; existing data was left untouched.');
    }
    state.pending.forEach(validateEnvelope);
    return state;
  }

  private writeState(state: SyncJournalState<T>): void {
    this.storage.setItem(JOURNAL_KEY, JSON.stringify(state));
  }

  enqueue(change: SyncEnvelope<T>): void {
    validateEnvelope(change);
    const state = this.readState();
    if (state.pending.some(item => item.changeId === change.changeId) ||
        state.syncedChangeIds.includes(change.changeId)) return;
    if (state.pending.some(item => item.recordId === change.recordId && item.companyId === change.companyId && item.changeId === change.changeId)) return;
    state.pending.push(change);
    this.writeState(state);
  }

  getPending(limit = 100): SyncEnvelope<T>[] {
    const state = this.readState();
    const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
    return state.pending.slice(0, safeLimit);
  }

  acknowledge(changeIds: readonly string[]): number {
    const acknowledged = new Set(changeIds.filter(id => typeof id === 'string' && id.length > 0));
    if (!acknowledged.size) return 0;
    const state = this.readState();
    const before = state.pending.length;
    const confirmed = state.pending.filter(item => acknowledged.has(item.changeId));
    state.pending = state.pending.filter(item => !acknowledged.has(item.changeId));
    state.syncedChangeIds = [...new Set([...state.syncedChangeIds, ...confirmed.map(item => item.changeId)])].slice(-2000);
    this.writeState(state);
    return before - state.pending.length;
  }

  getPendingCount(): number {
    return this.readState().pending.length;
  }

  saveConflicts(conflicts: readonly SyncConflict<T>[]): void {
    if (!conflicts.length) return;
    const state = readJson<SyncConflictState<T>>(this.storage, CONFLICT_KEY, {
      schemaVersion: JOURNAL_SCHEMA,
      conflicts: [],
    });
    if (state.schemaVersion !== JOURNAL_SCHEMA || !Array.isArray(state.conflicts)) {
      throw new Error('Sync conflict data is unsupported; existing data was left untouched.');
    }
    const byKey = new Map(state.conflicts.map(item => [
      `${item.recordId}:${item.local.changeId}:${item.remote.changeId}`,
      item,
    ]));
    for (const conflict of conflicts) {
      validateEnvelope(conflict.local);
      validateEnvelope(conflict.remote);
      const key = `${conflict.recordId}:${conflict.local.changeId}:${conflict.remote.changeId}`;
      byKey.set(key, conflict);
    }
    state.conflicts = [...byKey.values()];
    this.storage.setItem(CONFLICT_KEY, JSON.stringify(state));
  }

  getConflicts(): SyncConflict<T>[] {
    const state = readJson<SyncConflictState<T>>(this.storage, CONFLICT_KEY, {
      schemaVersion: JOURNAL_SCHEMA,
      conflicts: [],
    });
    if (state.schemaVersion !== JOURNAL_SCHEMA || !Array.isArray(state.conflicts)) {
      throw new Error('Sync conflict data is unsupported; existing data was left untouched.');
    }
    return state.conflicts;
  }

  /**
   * Queue the user's selected conflict version as a new local change before
   * removing the conflict. The superseded local edit is acknowledged only
   * after the replacement is safely stored in the outbox.
   */
  resolveConflictAndQueue(
    recordId: string,
    localChangeId: string,
    remoteChangeId: string,
    choice: 'local' | 'remote',
    deviceId: string,
    now = Date.now()
  ): boolean {
    if (!deviceId || !Number.isFinite(now)) throw new Error('A valid device ID and timestamp are required.');
    const state = readJson<SyncConflictState<T>>(this.storage, CONFLICT_KEY, {
      schemaVersion: JOURNAL_SCHEMA,
      conflicts: [],
    });
    if (state.schemaVersion !== JOURNAL_SCHEMA || !Array.isArray(state.conflicts)) {
      throw new Error('Sync conflict data is unsupported; existing data was left untouched.');
    }
    const conflict = state.conflicts.find(item =>
      item.recordId === recordId &&
      item.local.changeId === localChangeId &&
      item.remote.changeId === remoteChangeId
    );
    if (!conflict) return false;

    const selected = choice === 'local' ? conflict.local : conflict.remote;
    const resolution: SyncEnvelope<T> = {
      ...selected,
      deviceId,
      changeId: 'chg_resolution_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 12),
      updatedAt: now,
    };

    // Persist the chosen version first. If anything fails, the conflict remains available.
    this.enqueue(resolution);
    if (choice === 'remote') this.acknowledge([conflict.local.changeId]);

    state.conflicts = state.conflicts.filter(item => item !== conflict);
    this.storage.setItem(CONFLICT_KEY, JSON.stringify(state));
    return true;
  }

  resolveConflict(recordId: string, localChangeId: string, remoteChangeId: string): boolean {
    const state = readJson<SyncConflictState<T>>(this.storage, CONFLICT_KEY, {
      schemaVersion: JOURNAL_SCHEMA,
      conflicts: [],
    });
    const before = state.conflicts.length;
    state.conflicts = state.conflicts.filter(item =>
      !(item.recordId === recordId &&
        item.local.changeId === localChangeId &&
        item.remote.changeId === remoteChangeId)
    );
    if (state.conflicts.length === before) return false;
    this.storage.setItem(CONFLICT_KEY, JSON.stringify(state));
    return true;
  }
}
