import { Capacitor } from '@capacitor/core';
import {
  getAndroidGoogleDriveCredentials,
  getValidAndroidGoogleDriveCredentials,
} from './googleDriveAndroidAuth';
import { getValidWindowsGoogleDriveCredentials } from './googleDriveWindowsAuth';
import { getSelectedGoogleDriveFolder } from './googleDriveSelectedFolder';
import { SyncJournal } from './syncJournal';
import { SyncInbox } from './googleDriveSyncInbox';
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
    });

    if (result.nextPageToken) localStorage.setItem(pageTokenKey, result.nextPageToken);
    else localStorage.removeItem(pageTokenKey);
    localStorage.setItem('srk_drive_sync_last_success_v1', String(Date.now()));
    return result;
  })().finally(() => {
    activeCycle = null;
  });

  return activeCycle;
}
