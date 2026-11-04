import type { SyncEnvelope, SyncConflict } from './driveSyncProtocol';
import { mergeSyncEnvelopes } from './driveSyncProtocol';
import type { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';

export interface AsyncPullResult {
  downloaded: number;
  staged: number;
  duplicates: number;
  conflicts: number;
  pages: number;
  nextPageToken?: string;
}

export interface AsyncDrivePullDependencies {
  listFiles: (options: { accessToken: string; signal?: AbortSignal; parentId: string; pageToken?: string }) =>
    Promise<{ files: Array<{ id: string; name: string; mimeType: string }>; nextPageToken?: string }>;
  downloadJson: (options: { accessToken: string; signal?: AbortSignal; fileId: string }) => Promise<unknown>;
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

/** Async-storage counterpart of pullRemoteChanges; downloaded data remains staged. */
export async function pullRemoteChangesAsync<T>(
  journal: AsyncSyncJournal<T>,
  inbox: AsyncSyncInbox<T>,
  options: { accessToken: string; folderId: string; signal?: AbortSignal; maxPages?: number; pageToken?: string },
  dependencies: AsyncDrivePullDependencies,
): Promise<AsyncPullResult> {
  if (!options.accessToken?.trim()) throw new Error('A Google Drive access token is required.');
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');

  const pendingCount = await journal.getPendingCount();
  if (pendingCount > 500) {
    throw new Error('More than 500 local changes are pending. Sync the local outbox before downloading remote changes.');
  }
  const localPending = await journal.getPending(500);
  if (localPending.length !== pendingCount) {
    throw new Error('The local sync outbox changed during conflict validation. Please retry the sync.');
  }
  const localByRecord = new Map(localPending.map(change => [change.companyId + ':' + change.recordId, change]));
  const remote: SyncEnvelope<T>[] = [];
  const remoteChangeIds = new Set<string>();
  let duplicates = 0;
  let pageToken: string | undefined = options.pageToken;
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
      const encodedChangeId = file.name.slice('srk-change-'.length, -'.json'.length);
      let fileChangeId: string;
      try {
        fileChangeId = decodeURIComponent(encodedChangeId);
      } catch {
        continue;
      }
      if (!fileChangeId) continue;
      // Multiple Drive objects with one deterministic change ID are ambiguous.
      if (remoteChangeIds.has(fileChangeId)) {
        throw new Error(`Multiple Drive files exist for change "${fileChangeId}". Remote state is ambiguous; no changes were staged.`);
      }
      remoteChangeIds.add(fileChangeId);
      if (await inbox.hasSeen(fileChangeId)) {
        duplicates += 1;
        continue;
      }
      const value = await dependencies.downloadJson({
        accessToken: options.accessToken,
        signal: options.signal,
        fileId: file.id,
      });
      if (!validEnvelope<T>(value) || value.changeId !== fileChangeId) continue;
      remoteChangeIds.add(fileChangeId);
      remote.push(value);
    }
    pageToken = page.nextPageToken;
  } while (pageToken && pages < maxPages);

  const safeToStage: SyncEnvelope<T>[] = [];
  const conflicts: SyncConflict<T>[] = [];
  const remoteByRecord = new Map<string, SyncEnvelope<T>>();
  const remoteConflictedRecords = new Set<string>();
  for (const change of remote) {
    const key = change.companyId + ':' + change.recordId;
    const previous = remoteByRecord.get(key);
    if (!previous) {
      remoteByRecord.set(key, change);
      continue;
    }
    const result = mergeSyncEnvelopes([previous], [change]);
    if (result.conflicts.length) {
      conflicts.push(...result.conflicts);
      remoteConflictedRecords.add(key);
    } else if (result.merged[0]) {
      remoteByRecord.set(key, result.merged[0]);
    }
  }

  for (const [key, change] of remoteByRecord) {
    if (remoteConflictedRecords.has(key)) continue;
    const local = localByRecord.get(key);
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

  if (conflicts.length) await journal.saveConflicts(conflicts);
  const staged = await inbox.add(safeToStage);
  // Mark only after conflict and inbox records have been durably stored.
  await inbox.markSeen(remote.map(change => change.changeId));
  return {
    downloaded: remote.length,
    staged,
    duplicates,
    conflicts: conflicts.length,
    pages,
    ...(pageToken ? { nextPageToken: pageToken } : {}),
  };
}
