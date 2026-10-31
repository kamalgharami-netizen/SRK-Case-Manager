import {
  downloadDriveJson,
  listDriveFiles,
  uploadDriveJson,
} from './googleDriveApi';
import {
  pullRemoteChanges,
  type DrivePullDependencies,
  type PullResult,
  type SyncInbox,
} from './googleDriveSyncInbox';
import {
  pushPendingChanges,
  type SyncPushDependencies,
  type SyncPushResult,
} from './googleDriveSyncTransport';
import type { SyncJournal } from './syncJournal';

export interface GoogleDriveSyncCoordinatorOptions {
  accessToken: string;
  folderId: string;
  pageToken?: string;
  signal?: AbortSignal;
  pullMaxPages?: number;
  pushBatchSize?: number;
}

export interface GoogleDriveSyncCoordinatorDependencies {
  pull: DrivePullDependencies;
  push: SyncPushDependencies;
}

export interface GoogleDriveSyncCoordinatorResult {
  pulled: PullResult;
  pushed: SyncPushResult;
  staged: number;
  conflicts: number;
  remainingInbox: number;
  remainingOutbox: number;
  nextPageToken?: string;
}

const defaultDependencies: GoogleDriveSyncCoordinatorDependencies = {
  pull: {
    listFiles: listDriveFiles,
    downloadJson: downloadDriveJson,
  },
  push: {
    listFiles: listDriveFiles,
    uploadJson: uploadDriveJson,
  },
};

/**
 * Runs one bounded, conflict-safe sync cycle.
 *
 * Pull is intentionally performed before push. This lets incoming changes be
 * compared with the local outbox before local edits are acknowledged as sent.
 * Incoming records remain staged; this coordinator never applies them to the
 * live company database. The user must review and explicitly apply staged data.
 */
export async function syncGoogleDriveNow<T>(
  journal: SyncJournal<T>,
  inbox: SyncInbox<T>,
  options: GoogleDriveSyncCoordinatorOptions,
  dependencies: GoogleDriveSyncCoordinatorDependencies = defaultDependencies,
): Promise<GoogleDriveSyncCoordinatorResult> {
  if (!options.accessToken?.trim()) throw new Error('A Google Drive access token is required.');
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');
  if (options.signal?.aborted) throw new Error('Google Drive sync was cancelled.');

  const pulled = await pullRemoteChanges(
    journal,
    inbox,
    {
      accessToken: options.accessToken,
      folderId: options.folderId,
      pageToken: options.pageToken,
      signal: options.signal,
      maxPages: options.pullMaxPages ?? 10,
    },
    dependencies.pull,
  );

  if (options.signal?.aborted) throw new Error('Google Drive sync was cancelled.');

  const pushed = await pushPendingChanges(
    journal,
    {
      accessToken: options.accessToken,
      folderId: options.folderId,
      signal: options.signal,
      batchSize: options.pushBatchSize ?? 25,
    },
    dependencies.push,
  );

  return {
    pulled,
    pushed,
    staged: pulled.staged,
    conflicts: pulled.conflicts,
    remainingInbox: inbox.getAll().length,
    remainingOutbox: journal.getPendingCount(),
    ...(pulled.nextPageToken ? { nextPageToken: pulled.nextPageToken } : {}),
  };
}
