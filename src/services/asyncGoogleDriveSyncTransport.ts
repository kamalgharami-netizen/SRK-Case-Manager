import type { SyncEnvelope } from './driveSyncProtocol';
import { downloadDriveJson, listDriveFiles, uploadDriveJson, type DriveFile, type DriveRequestOptions } from './googleDriveApi';
import type { AsyncSyncJournal } from './asyncSyncRepositories';

export interface AsyncSyncPushResult {
  uploaded: number;
  acknowledged: number;
  remaining: number;
}

export interface AsyncSyncPushDependencies {
  listFiles: (options: DriveRequestOptions & { parentId: string; name?: string }) => Promise<{ files: DriveFile[] }>;
  uploadJson: (options: DriveRequestOptions & { name: string; parentId?: string; appProperties?: Record<string, string> }, data: unknown) => Promise<DriveFile>;
  downloadJson: (options: DriveRequestOptions & { fileId: string }) => Promise<unknown>;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return '{' + Object.keys(record).sort().map(key =>
      JSON.stringify(key) + ':' + canonicalJson(record[key]),
    ).join(',') + '}';
  }
  return JSON.stringify(value);
}

/** Async-storage counterpart of pushPendingChanges; acknowledgements follow verified uploads only. */
export async function pushPendingChangesAsync<T>(
  journal: AsyncSyncJournal<T>,
  options: DriveRequestOptions & { folderId: string; batchSize?: number },
  dependencies: AsyncSyncPushDependencies = {
    listFiles: listDriveFiles,
    uploadJson: uploadDriveJson,
    downloadJson: downloadDriveJson,
  },
): Promise<AsyncSyncPushResult> {
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');
  const batch = await journal.getPending(options.batchSize ?? 25);
  const acknowledged: string[] = [];
  let uploaded = 0;

  for (const change of batch) {
    const name = 'srk-change-' + encodeURIComponent(change.changeId) + '.json';
    const existing = await dependencies.listFiles({
      accessToken: options.accessToken,
      signal: options.signal,
      parentId: options.folderId,
      name,
    });
    if (existing.files.length > 0) {
      const remote = await dependencies.downloadJson({
        accessToken: options.accessToken,
        signal: options.signal,
        fileId: existing.files[0].id,
      });
      if (canonicalJson(remote) !== canonicalJson(change)) {
        throw new Error(
          `A Drive file already exists for change "${change.changeId}", but its content does not match the local pending change. The local change was kept pending.`,
        );
      }
      acknowledged.push(change.changeId);
      continue;
    }
    await dependencies.uploadJson({
      accessToken: options.accessToken,
      signal: options.signal,
      parentId: options.folderId,
      name,
      appProperties: {
        srkApp: 'case-manager',
        schemaVersion: '1',
        changeId: change.changeId,
        companyId: change.companyId,
        deviceId: change.deviceId,
      },
    }, change);
    uploaded += 1;
    acknowledged.push(change.changeId);
  }

  const acknowledgedCount = await journal.acknowledge(acknowledged);
  return {
    uploaded,
    acknowledged: acknowledgedCount,
    remaining: await journal.getPendingCount(),
  };
}

export type AsyncCaseManagerSyncEnvelope = SyncEnvelope<unknown>;
