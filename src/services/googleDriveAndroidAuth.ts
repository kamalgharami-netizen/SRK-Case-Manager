import { Capacitor } from '@capacitor/core';
import { GoogleDriveAuth } from '@srk/capacitor-google-drive-auth';
import { getDriveFileMetadata } from './googleDriveApi';
import {
  clearSelectedGoogleDriveFolder,
  saveSelectedGoogleDriveFolder,
  type SelectedGoogleDriveFolder,
} from './googleDriveSelectedFolder';
import {
  deleteSecureGoogleOAuthCredentials,
  getSecureGoogleOAuthCredentials,
  setSecureGoogleOAuthCredentials,
  type StoredGoogleOAuthCredentials,
} from './secureGoogleTokenStore';

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const ANDROID_ACCESS_TOKEN_LIFETIME_MS = 55 * 60 * 1000;

function assertAndroidPlatform(): void {
  if (Capacitor.getPlatform() !== 'android') {
    throw new Error('Native Google Drive authorization is available only in the Android app.');
  }
}

export async function connectAndroidGoogleDrive(): Promise<{
  credentials: StoredGoogleOAuthCredentials;
  folder: SelectedGoogleDriveFolder;
}> {
  assertAndroidPlatform();
  const authorization = await GoogleDriveAuth.authorize();
  if (!authorization.accessToken) {
    throw new Error('Google did not return a Drive access token.');
  }
  if (!Array.isArray(authorization.pickedFileIds) || authorization.pickedFileIds.length !== 1) {
    throw new Error('Select exactly one Google Drive folder to continue.');
  }
  if (!Array.isArray(authorization.grantedScopes) ||
      !authorization.grantedScopes.includes(DRIVE_FILE_SCOPE)) {
    throw new Error('Google Drive file access was not granted. Please try again.');
  }

  const selected = await getDriveFileMetadata({
    accessToken: authorization.accessToken,
    fileId: authorization.pickedFileIds[0],
  });
  if (selected.mimeType !== FOLDER_MIME_TYPE) {
    throw new Error('The selected Drive item is not a folder. Please select a folder.');
  }

  const credentials: StoredGoogleOAuthCredentials = {
    accessToken: authorization.accessToken,
    refreshToken: null,
    tokenType: 'Bearer',
    // Google Identity Services returns a short-lived access token, not a refresh token.
    // Re-authorize through the native SDK when this conservative local expiry is reached.
    expiresAt: Date.now() + ANDROID_ACCESS_TOKEN_LIFETIME_MS,
    scope: DRIVE_FILE_SCOPE,
  };
  const folder = { id: selected.id, name: selected.name };
  await setSecureGoogleOAuthCredentials(credentials);
  saveSelectedGoogleDriveFolder(folder);
  return { credentials, folder };
}

export async function getAndroidGoogleDriveCredentials():
  Promise<StoredGoogleOAuthCredentials | null> {
  assertAndroidPlatform();
  return getSecureGoogleOAuthCredentials();
}

export async function disconnectAndroidGoogleDrive(): Promise<void> {
  assertAndroidPlatform();
  await deleteSecureGoogleOAuthCredentials();
  clearSelectedGoogleDriveFolder();
}
