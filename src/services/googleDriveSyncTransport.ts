import type { SyncEnvelope } from './driveSyncProtocol';
import { SyncJournal } from './syncJournal';
import { listDriveFiles, uploadDriveJson, type DriveFile, type DriveRequestOptions } from './googleDriveApi';

export interface SyncPushResult {
  uploaded: number;
  acknowledged: number;
  remaining: number;
}

export interface SyncPushDependencies {
  listFiles: (options: DriveRequestOptions & { parentId: string; name?: string }) => Promise<{ files: DriveFile[] }>;
  uploadJson: (options: DriveRequestOptions & { name: string; parentId?: string; appProperties?: Record<string, string> }, data: unknown) => Promise<DriveFile>;
}

/**
 * Pushes the local outbox as immutable, one-change-per-file records.
 * Each remote file has a deterministic name, so retrying after a network
 * interruption does not create a second copy when the first upload succeeded.
 * The local entry is acknowledged only after a matching remote file is found
 * or the upload has returned successfully.
 */
export async function pushPendingChanges<T>(
  journal: SyncJournal<T>,
  options: DriveRequestOptions & { folderId: string; batchSize?: number },
  dependencies: SyncPushDependencies = {
    listFiles: listDriveFiles,
    uploadJson: uploadDriveJson,
  }
): Promise<SyncPushResult> {
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');
  const batch = journal.getPending(options.batchSize ?? 25);
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

  const acknowledgedCount = journal.acknowledge(acknowledged);
  return {
    uploaded,
    acknowledged: acknowledgedCount,
    remaining: journal.getPendingCount(),
  };
}

/** Explicitly typed helper for callers that store the standard envelope shape. */
export type CaseManagerSyncEnvelope = SyncEnvelope<unknown>;
