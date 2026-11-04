import type { SyncConflict, SyncEnvelope } from './driveSyncProtocol';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';

const JOURNAL_KEY = 'srk_sync_journal_v1';
const CONFLICT_KEY = 'srk_sync_conflicts_v1';
const INBOX_KEY = 'srk_sync_inbox_v1';
const SCHEMA_VERSION = 1;

export interface AsyncSyncJournalState<T> {
  schemaVersion: 1;
  pending: SyncEnvelope<T>[];
  syncedChangeIds: string[];
}

export interface AsyncSyncConflictState<T> {
  schemaVersion: 1;
  conflicts: SyncConflict<T>[];
}

export interface AsyncSyncInboxState<T> {
  schemaVersion: 1;
  changes: SyncEnvelope<T>[];
  seenChangeIds: string[];
}

function parseState<T>(raw: string | null, fallback: T, key: string): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Sync data at ${key} is unreadable; existing data was left untouched.`);
  }
}

function validateEnvelope<T>(change: SyncEnvelope<T>): void {
  if (
    !change || change.schemaVersion !== SCHEMA_VERSION ||
    typeof change.deviceId !== 'string' || !change.deviceId ||
    typeof change.changeId !== 'string' || !change.changeId ||
    typeof change.recordId !== 'string' || !change.recordId ||
    typeof change.companyId !== 'string' || !change.companyId ||
    !Number.isFinite(change.updatedAt) ||
    typeof change.deleted !== 'boolean' ||
    (change.deleted ? change.payload !== null : change.payload === null || change.payload === undefined)
  ) throw new Error('Invalid sync journal entry.');
}

function validateJournal<T>(state: AsyncSyncJournalState<T>): void {
  if (state.schemaVersion !== SCHEMA_VERSION || !Array.isArray(state.pending) ||
      !Array.isArray(state.syncedChangeIds) ||
      !state.syncedChangeIds.every(id => typeof id === 'string' && id.length > 0)) {
    throw new Error('Sync journal format is unsupported; existing data was left untouched.');
  }
  state.pending.forEach(validateEnvelope);
}

function validateConflicts<T>(state: AsyncSyncConflictState<T>): void {
  if (state.schemaVersion !== SCHEMA_VERSION || !Array.isArray(state.conflicts)) {
    throw new Error('Sync conflict data is unsupported; existing data was left untouched.');
  }
  state.conflicts.forEach(conflict => {
    if (!conflict || typeof conflict.recordId !== 'string') throw new Error('Sync conflict data is invalid.');
    validateEnvelope(conflict.local);
    validateEnvelope(conflict.remote);
  });
}

function validateInbox<T>(state: AsyncSyncInboxState<T>): void {
  if (state.schemaVersion !== SCHEMA_VERSION || !Array.isArray(state.changes) ||
      (state.seenChangeIds !== undefined &&
        (!Array.isArray(state.seenChangeIds) ||
          !state.seenChangeIds.every(id => typeof id === 'string' && id.length > 0)))) {
    throw new Error('Sync inbox format is invalid; existing data was left untouched.');
  }
  // Version-1 inboxes created by the original SyncInbox omitted this optional field.
  state.seenChangeIds = state.seenChangeIds ?? [];
  state.changes.forEach(validateEnvelope);
}

/** Async durable outbox. Each key update is serialized by the injected storage adapter. */
export class AsyncSyncJournal<T> {
  constructor(private readonly storage: AsyncSyncStateStorage) {}

  private async readJournal(): Promise<AsyncSyncJournalState<T>> {
    const state = parseState(await this.storage.getItem(JOURNAL_KEY), {
      schemaVersion: SCHEMA_VERSION, pending: [], syncedChangeIds: [],
    } as AsyncSyncJournalState<T>, JOURNAL_KEY);
    validateJournal(state);
    return state;
  }

  async enqueue(change: SyncEnvelope<T>): Promise<void> {
    validateEnvelope(change);
    await this.storage.updateItem(JOURNAL_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, pending: [], syncedChangeIds: [],
      } as AsyncSyncJournalState<T>, JOURNAL_KEY);
      validateJournal(state);
      if (state.pending.some(item => item.changeId === change.changeId) ||
          state.syncedChangeIds.includes(change.changeId)) {
        return { value: raw, result: undefined };
      }
      state.pending.push(change);
      return { value: JSON.stringify(state), result: undefined };
    });
  }

  async getPending(limit = 100): Promise<SyncEnvelope<T>[]> {
    const state = await this.readJournal();
    return state.pending.slice(0, Math.max(1, Math.min(500, Math.floor(limit))));
  }

  async getPendingCount(): Promise<number> {
    return (await this.readJournal()).pending.length;
  }

  async acknowledge(changeIds: readonly string[]): Promise<number> {
    const acknowledged = new Set(changeIds.filter(id => typeof id === 'string' && id.length > 0));
    if (!acknowledged.size) return 0;
    return this.storage.updateItem(JOURNAL_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, pending: [], syncedChangeIds: [],
      } as AsyncSyncJournalState<T>, JOURNAL_KEY);
      validateJournal(state);
      const before = state.pending.length;
      const confirmed = state.pending.filter(item => acknowledged.has(item.changeId));
      state.pending = state.pending.filter(item => !acknowledged.has(item.changeId));
      state.syncedChangeIds = [...new Set([...state.syncedChangeIds, ...confirmed.map(item => item.changeId)])].slice(-2000);
      return { value: JSON.stringify(state), result: before - state.pending.length };
    });
  }

  async saveConflicts(conflicts: readonly SyncConflict<T>[]): Promise<void> {
    if (!conflicts.length) return;
    conflicts.forEach(conflict => {
      validateEnvelope(conflict.local);
      validateEnvelope(conflict.remote);
    });
    await this.storage.updateItem(CONFLICT_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, conflicts: [],
      } as AsyncSyncConflictState<T>, CONFLICT_KEY);
      validateConflicts(state);
      const byKey = new Map(state.conflicts.map(item => [
        `${item.recordId}:${item.local.changeId}:${item.remote.changeId}`, item,
      ]));
      for (const conflict of conflicts) {
        byKey.set(`${conflict.recordId}:${conflict.local.changeId}:${conflict.remote.changeId}`, conflict);
      }
      state.conflicts = [...byKey.values()];
      return { value: JSON.stringify(state), result: undefined };
    });
  }

  async getConflicts(): Promise<SyncConflict<T>[]> {
    const state = parseState(await this.storage.getItem(CONFLICT_KEY), {
      schemaVersion: SCHEMA_VERSION, conflicts: [],
    } as AsyncSyncConflictState<T>, CONFLICT_KEY);
    validateConflicts(state);
    return state.conflicts;
  }

  async resolveConflictAndQueue(
    recordId: string,
    localChangeId: string,
    remoteChangeId: string,
    choice: 'local' | 'remote',
    deviceId: string,
    now = Date.now(),
  ): Promise<boolean> {
    if (!deviceId || !Number.isFinite(now)) throw new Error('A valid device ID and timestamp are required.');
    const conflict = (await this.getConflicts()).find(item =>
      item.recordId === recordId && item.local.changeId === localChangeId &&
      item.remote.changeId === remoteChangeId
    );
    if (!conflict) return false;
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      throw new Error('Secure random generation is unavailable; conflict resolution cannot be queued safely.');
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const suffix = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const selected = choice === 'local' ? conflict.local : conflict.remote;
    const resolution: SyncEnvelope<T> = {
      ...selected, deviceId, changeId: `chg_resolution_${now.toString(36)}_${suffix}`, updatedAt: now,
    };

    // Preserve the same crash-safe ordering as the synchronous implementation:
    // durable replacement outbox entry, then superseded ack, then conflict removal.
    await this.enqueue(resolution);
    await this.acknowledge([conflict.local.changeId]);
    await this.storage.updateItem(CONFLICT_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, conflicts: [],
      } as AsyncSyncConflictState<T>, CONFLICT_KEY);
      validateConflicts(state);
      const before = state.conflicts.length;
      state.conflicts = state.conflicts.filter(item => !(
        item.recordId === recordId && item.local.changeId === localChangeId &&
        item.remote.changeId === remoteChangeId
      ));
      return { value: JSON.stringify(state), result: before !== state.conflicts.length };
    });
    return true;
  }
}

/** Async durable inbox. Downloaded records remain staged until explicit user approval. */
export class AsyncSyncInbox<T> {
  constructor(private readonly storage: AsyncSyncStateStorage) {}

  private async read(): Promise<AsyncSyncInboxState<T>> {
    const state = parseState(await this.storage.getItem(INBOX_KEY), {
      schemaVersion: SCHEMA_VERSION, changes: [], seenChangeIds: [],
    } as AsyncSyncInboxState<T>, INBOX_KEY);
    validateInbox(state);
    state.seenChangeIds = [...new Set([...state.seenChangeIds, ...state.changes.map(item => item.changeId)])].slice(-10000);
    return state;
  }

  async add(changes: readonly SyncEnvelope<T>[]): Promise<number> {
    changes.forEach(validateEnvelope);
    return this.storage.updateItem(INBOX_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, changes: [], seenChangeIds: [],
      } as AsyncSyncInboxState<T>, INBOX_KEY);
      validateInbox(state);
      const ids = new Set([...state.seenChangeIds, ...state.changes.map(item => item.changeId)]);
      let added = 0;
      for (const change of changes) {
        if (ids.has(change.changeId)) continue;
        ids.add(change.changeId);
        state.changes.push(change);
        added += 1;
      }
      state.seenChangeIds = [...ids].slice(-10000);
      return { value: JSON.stringify(state), result: added };
    });
  }

  async getAll(): Promise<SyncEnvelope<T>[]> {
    return (await this.read()).changes;
  }

  async hasSeen(changeId: string): Promise<boolean> {
    return (await this.read()).seenChangeIds.includes(changeId);
  }

  async markSeen(changeIds: readonly string[]): Promise<void> {
    if (!changeIds.length) return;
    await this.storage.updateItem(INBOX_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, changes: [], seenChangeIds: [],
      } as AsyncSyncInboxState<T>, INBOX_KEY);
      validateInbox(state);
      state.seenChangeIds = [...new Set([...state.seenChangeIds, ...changeIds])].slice(-10000);
      return { value: JSON.stringify(state), result: undefined };
    });
  }

  async acknowledge(changeIds: readonly string[]): Promise<number> {
    const ids = new Set(changeIds);
    if (!ids.size) return 0;
    return this.storage.updateItem(INBOX_KEY, raw => {
      const state = parseState(raw, {
        schemaVersion: SCHEMA_VERSION, changes: [], seenChangeIds: [],
      } as AsyncSyncInboxState<T>, INBOX_KEY);
      validateInbox(state);
      const before = state.changes.length;
      state.changes = state.changes.filter(item => !ids.has(item.changeId));
      state.seenChangeIds = [...new Set([...state.seenChangeIds, ...ids])].slice(-10000);
      return { value: JSON.stringify(state), result: before - state.changes.length };
    });
  }
}
