import type { SyncEnvelope } from './driveSyncProtocol';
import { SyncJournal } from './syncJournal';
import { downloadDriveJson, listDriveFiles, uploadDriveJson, type DriveFile, type DriveRequestOptions } from './googleDriveApi';

export interface SyncPushResult {
  uploaded: number;
  acknowledged: number;
  remaining: number;
}

export interface SyncPushDependencies {
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
    downloadJson: downloadDriveJson,
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

    if (existing.files.length > 1) {
      throw new Error(
        `Multiple Drive files exist for change "${change.changeId}". The local change was kept pending because the remote state is ambiguous.`,
      );
    }
    if (existing.files.length > 0) {
      // A deterministic filename alone is not proof that the remote content
      // matches this pending change. Verify the complete envelope before ack.
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

  const acknowledgedCount = journal.acknowledge(acknowledged);
  return {
    uploaded,
    acknowledged: acknowledgedCount,
    remaining: journal.getPendingCount(),
  };
}

/** Explicitly typed helper for callers that store the standard envelope shape. */
export type CaseManagerSyncEnvelope = SyncEnvelope<unknown>;
