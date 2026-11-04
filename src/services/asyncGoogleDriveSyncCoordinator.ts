import { downloadDriveJson, listDriveFiles, uploadDriveJson } from './googleDriveApi';
import { pullRemoteChangesAsync, type AsyncDrivePullDependencies, type AsyncPullResult } from './asyncGoogleDriveSyncInbox';
import { pushPendingChangesAsync, type AsyncSyncPushDependencies, type AsyncSyncPushResult } from './asyncGoogleDriveSyncTransport';
import type { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';

export interface AsyncGoogleDriveSyncCoordinatorOptions {
  accessToken: string;
  folderId: string;
  pageToken?: string;
  signal?: AbortSignal;
  pullMaxPages?: number;
  pushBatchSize?: number;
}

export interface AsyncGoogleDriveSyncCoordinatorDependencies {
  pull: AsyncDrivePullDependencies;
  push: AsyncSyncPushDependencies;
}

export interface AsyncGoogleDriveSyncCoordinatorResult {
  pulled: AsyncPullResult;
  pushed: AsyncSyncPushResult;
  staged: number;
  conflicts: number;
  remainingInbox: number;
  remainingOutbox: number;
  nextPageToken?: string;
}

const defaultDependencies: AsyncGoogleDriveSyncCoordinatorDependencies = {
  pull: { listFiles: listDriveFiles, downloadJson: downloadDriveJson },
  push: { listFiles: listDriveFiles, uploadJson: uploadDriveJson, downloadJson: downloadDriveJson },
};

/** Async-storage counterpart of the bounded pull-before-push sync coordinator. */
export async function syncGoogleDriveNowAsync<T>(
  journal: AsyncSyncJournal<T>,
  inbox: AsyncSyncInbox<T>,
  options: AsyncGoogleDriveSyncCoordinatorOptions,
  dependencies: AsyncGoogleDriveSyncCoordinatorDependencies = defaultDependencies,
): Promise<AsyncGoogleDriveSyncCoordinatorResult> {
  if (!options.accessToken?.trim()) throw new Error('A Google Drive access token is required.');
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive sync folder first.');
  if (options.signal?.aborted) throw new Error('Google Drive sync was cancelled.');

  const pulled = await pullRemoteChangesAsync(journal, inbox, {
    accessToken: options.accessToken,
    folderId: options.folderId,
    pageToken: options.pageToken,
    signal: options.signal,
    maxPages: options.pullMaxPages ?? 10,
  }, dependencies.pull);

  if (options.signal?.aborted) throw new Error('Google Drive sync was cancelled.');
  const pushed = await pushPendingChangesAsync(journal, {
    accessToken: options.accessToken,
    folderId: options.folderId,
    signal: options.signal,
    batchSize: options.pushBatchSize ?? 25,
  }, dependencies.push);

  return {
    pulled,
    pushed,
    staged: pulled.staged,
    conflicts: pulled.conflicts,
    remainingInbox: (await inbox.getAll()).length,
    remainingOutbox: await journal.getPendingCount(),
    ...(pulled.nextPageToken ? { nextPageToken: pulled.nextPageToken } : {}),
  };
}
