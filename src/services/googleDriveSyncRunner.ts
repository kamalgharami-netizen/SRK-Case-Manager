import { Capacitor } from '@capacitor/core';
import {
  getAndroidGoogleDriveCredentials,
  getValidAndroidGoogleDriveCredentials,
} from './googleDriveAndroidAuth';
import { getValidWindowsGoogleDriveCredentials } from './googleDriveWindowsAuth';
import { getSelectedGoogleDriveFolder } from './googleDriveSelectedFolder';
import { registerCurrentGoogleDriveDevice } from './googleDriveDeviceRegistry';
import { SyncJournal } from './syncJournal';
import { SyncInbox } from './googleDriveSyncInbox';
import { AsyncSyncInbox, AsyncSyncJournal } from './asyncSyncRepositories';
import { getOrCreateSyncDeviceIdAsync } from './driveSyncProtocol';
import type { AsyncSyncStateStorage } from './syncStateStorageAdapter';
import { getReadyPlatformSyncStateStorage } from './readySyncStateStorage';
import { getSelectedGoogleDriveFolderAsync } from './googleDriveSelectedFolder';
import { syncGoogleDriveNowAsync } from './asyncGoogleDriveSyncCoordinator';
import { syncGoogleDriveNow, type GoogleDriveSyncCoordinatorResult } from './googleDriveSyncCoordinator';

let activeCycle: Promise<GoogleDriveSyncCoordinatorResult | null> | null = null;

export interface GoogleDriveSyncCycleOptions {
  /** Manual user action may renew Android credentials; automatic foreground sync must not prompt. */
  allowAndroidReauthorization?: boolean;
}

/**
 * Shared sync entry point for manual and automatic foreground sync.
 * A single in-process lock prevents two UI entry points from running overlapping cycles.
 */
export function runGoogleDriveSyncCycle(
  options: GoogleDriveSyncCycleOptions = {},
): Promise<GoogleDriveSyncCoordinatorResult | null> {
  if (activeCycle) return activeCycle;

  activeCycle = (async () => {
    const folder = getSelectedGoogleDriveFolder();
    if (!folder?.id) return null;

    let credentials: Awaited<ReturnType<typeof getAndroidGoogleDriveCredentials>> = null;
    if (Capacitor.getPlatform() === 'android') {
      if (options.allowAndroidReauthorization) {
        credentials = await getValidAndroidGoogleDriveCredentials();
      } else {
        credentials = await getAndroidGoogleDriveCredentials();
        // Do not unexpectedly open a Google authorization prompt in the background.
        if (!credentials || credentials.expiresAt <= Date.now() + 5 * 60 * 1000) return null;
      }
    } else {
      const isWindowsDesktop = typeof window !== 'undefined' &&
        Boolean((window as Window & { electronAPI?: { googleOAuth?: unknown } }).electronAPI?.googleOAuth);
      if (!isWindowsDesktop) return null;
      credentials = await getValidWindowsGoogleDriveCredentials();
    }

    if (!credentials) return null;

    // Bind this installation to the signed-in Google account and selected folder
    // before any business-record transfer is attempted.
    await registerCurrentGoogleDriveDevice({
      accessToken: credentials.accessToken,
      folderId: folder.id,
      storage: localStorage,
    });

    const pageTokenKey = `srk_drive_sync_page_token_v1_${folder.id}`;
    const pageToken = localStorage.getItem(pageTokenKey) || undefined;
    const journal = new SyncJournal<unknown>(localStorage);
    const inbox = new SyncInbox<unknown>(localStorage);
    const result = await syncGoogleDriveNow(journal, inbox, {
      accessToken: credentials.accessToken,
      folderId: folder.id,
      pageToken,
      pullMaxPages: 10,
      pushBatchSize: 25,
      onPullCheckpoint: nextPageToken => {
        if (nextPageToken) localStorage.setItem(pageTokenKey, nextPageToken);
        else localStorage.removeItem(pageTokenKey);
      },
    });
    localStorage.setItem('srk_drive_sync_last_success_v1', String(Date.now()));
    return result;
  })().finally(() => {
    activeCycle = null;
  });

  return activeCycle;
}


/**
 * Unified async-storage sync path used by automatic foreground sync and the
 * Backup UI's manual Sync Now action. Android migration is completed by the
 * ready-storage gate before any sync metadata is read; Android never falls
 * back to localStorage after native storage initialization fails.
 */
export function runGoogleDriveSyncCycleAsync(
  options: GoogleDriveSyncCycleOptions & { storage?: AsyncSyncStateStorage } = {},
): Promise<GoogleDriveSyncCoordinatorResult | null> {
  if (activeCycle) return activeCycle;

  activeCycle = (async () => {
    const storage = options.storage ?? await getReadyPlatformSyncStateStorage();
    const folder = await getSelectedGoogleDriveFolderAsync(storage);
    if (!folder?.id) return null;

    let credentials: Awaited<ReturnType<typeof getAndroidGoogleDriveCredentials>> = null;
    if (Capacitor.getPlatform() === 'android') {
      if (options.allowAndroidReauthorization) {
        credentials = await getValidAndroidGoogleDriveCredentials();
      } else {
        credentials = await getAndroidGoogleDriveCredentials();
        if (!credentials || credentials.expiresAt <= Date.now() + 5 * 60 * 1000) return null;
      }
    } else {
      const isWindowsDesktop = typeof window !== 'undefined' &&
        Boolean((window as Window & { electronAPI?: { googleOAuth?: unknown } }).electronAPI?.googleOAuth);
      if (!isWindowsDesktop) return null;
      credentials = await getValidWindowsGoogleDriveCredentials();
    }
    if (!credentials) return null;

    const deviceId = await getOrCreateSyncDeviceIdAsync(storage);
    await registerCurrentGoogleDriveDevice({
      accessToken: credentials.accessToken,
      folderId: folder.id,
      deviceId,
    });

    const pageTokenKey = `srk_drive_sync_page_token_v1_${folder.id}`;
    const pageToken = (await storage.getItem(pageTokenKey)) || undefined;
    const journal = new AsyncSyncJournal<unknown>(storage);
    const inbox = new AsyncSyncInbox<unknown>(storage);
    const result = await syncGoogleDriveNowAsync(journal, inbox, {
      accessToken: credentials.accessToken,
      folderId: folder.id,
      pageToken,
      pullMaxPages: 10,
      pushBatchSize: 25,
      onPullCheckpoint: async nextPageToken => {
        if (nextPageToken) await storage.setItem(pageTokenKey, nextPageToken);
        else await storage.removeItem(pageTokenKey);
      },
    });
    await storage.setItem('srk_drive_sync_last_success_v1', String(Date.now()));
    return result;
  })().finally(() => {
    activeCycle = null;
  });

  return activeCycle;
}
