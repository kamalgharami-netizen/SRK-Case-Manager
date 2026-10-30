import type { SyncEnvelope, SyncConflict } from './driveSyncProtocol';
import { mergeSyncEnvelopes } from './driveSyncProtocol';
import type { SyncJournal, SyncJournalStorage } from './syncJournal';

const INBOX_KEY = 'srk_sync_inbox_v1';

export interface SyncInboxState<T> {
  schemaVersion: 1;
  changes: SyncEnvelope<T>[];
}

function validEnvelope<T>(value: unknown): value is SyncEnvelope<T> {
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
}

/** Durable staging area: downloaded data is never applied to live AppContext automatically. */
export class SyncInbox<T> {
  constructor(private readonly storage: SyncJournalStorage) {}

  private read(): SyncInboxState<T> {
    const raw = this.storage.getItem(INBOX_KEY);
    if (!raw) return { schemaVersion: 1, changes: [] };
    let state: SyncInboxState<T>;
    try {
      state = JSON.parse(raw) as SyncInboxState<T>;
    } catch {
      throw new Error('Sync inbox is unreadable; existing data was left untouched.');
    }
    if (state.schemaVersion !== 1 || !Array.isArray(state.changes) || !state.changes.every(validEnvelope)) {
      throw new Error('Sync inbox format is invalid; existing data was left untouched.');
    }
    return state;
  }

  add(changes: readonly SyncEnvelope<T>[]): number {
    const state = this.read();
    const ids = new Set(state.changes.map(change => change.changeId));
    let added = 0;
    for (const change of changes) {
      if (!validEnvelope(change)) throw new Error('Invalid remote sync envelope.');
      if (ids.has(change.changeId)) continue;
      ids.add(change.changeId);
      state.changes.push(change);
      added += 1;
    }
    if (added) this.storage.setItem(INBOX_KEY, JSON.stringify(state));
    return added;
  }

  getAll(): SyncEnvelope<T>[] {
    return this.read().changes;
  }

  acknowledge(changeIds: readonly string[]): number {
    const ids = new Set(changeIds);
    if (!ids.size) return 0;
    const state = this.read();
    const before = state.changes.length;
    state.changes = state.changes.filter(change => !ids.has(change.changeId));
    if (before !== state.changes.length) this.storage.setItem(INBOX_KEY, JSON.stringify(state));
    return before - state.changes.length;
  }
}

export interface PullResult {
  downloaded: number;
  staged: number;
  duplicates: number;
  conflicts: number;
  pages: number;
}

export interface DrivePullDependencies {
  listFiles: (options: { accessToken: string; signal?: AbortSignal; parentId: string; pageToken?: string }) => Promise<{ files: Array<{ id: string; name: string; mimeType: string }>; nextPageToken?: string }>;
  downloadJson: <T>(options: { accessToken: string; signal?: AbortSignal; fileId: string }) => Promise<T>;
}

/**
 * Downloads remote change files, compares them with local pending edits, and
 * stages safe changes in the inbox. It deliberately does not mutate AppContext.
 */
export async function pullRemoteChanges<T>(
  journal: SyncJournal<T>,
  inbox: SyncInbox<T>,
  options: { accessToken: string; folderId: string; signal?: AbortSignal; maxPages?: number },
  dependencies: DrivePullDependencies
): Promise<PullResult> {
  if (!options.accessToken?.trim()) throw new Error('A Google Drive access token is required.');
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');

  const localPending = journal.getPending(500);
  const localByRecord = new Map(localPending.map(change => [change.companyId + ':' + change.recordId, change]));
  const remote: SyncEnvelope<T>[] = [];
  let pageToken: string | undefined;
  let pages = 0;
  const maxPages = Math.max(1, Math.min(100, Math.floor(options.maxPages ?? 10)));

  do {
    const page = await dependencies.listFiles({
      accessToken: options.accessToken,
      signal: options.signal,
      parentId: options.folderId,
      ...(pageToken ? { pageToken } : {}),
    });
    pages += 1;
    for (const file of page.files) {
      if (!file.name.startsWith('srk-change-') || !file.name.endsWith('.json') || file.mimeType !== 'application/json') continue;
      const value = await dependencies.downloadJson<unknown>({
        accessToken: options.accessToken,
        signal: options.signal,
        fileId: file.id,
      });
      if (!validEnvelope<T>(value)) continue;
      remote.push(value);
    }
    pageToken = page.nextPageToken;
  } while (pageToken && pages < maxPages);

  const safeToStage: SyncEnvelope<T>[] = [];
  const conflicts: SyncConflict<T>[] = [];
  let duplicates = 0;
  for (const change of remote) {
    const local = localByRecord.get(change.companyId + ':' + change.recordId);
    if (!local) {
      safeToStage.push(change);
      continue;
    }
    if (local.changeId === change.changeId) {
      duplicates += 1;
      continue;
    }
    const result = mergeSyncEnvelopes([local], [change]);
    if (result.conflicts.length) conflicts.push(...result.conflicts);
    else safeToStage.push(...result.merged.filter(item => item.changeId !== local.changeId));
  }

  if (conflicts.length) journal.saveConflicts(conflicts);
  const staged = inbox.add(safeToStage);
  return {
    downloaded: remote.length,
    staged,
    duplicates,
    conflicts: conflicts.length,
    pages,
  };
}
