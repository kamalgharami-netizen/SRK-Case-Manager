import { createGoogleOAuthState, createWindowsGooglePkceRequest } from './googleOAuthPkce';
import { exchangeGoogleAuthorizationCode } from './googleOAuthTokenClient';
import { getDriveFileMetadata } from './googleDriveApi';
import { clearSelectedGoogleDriveFolder, saveSelectedGoogleDriveFolder, getSelectedGoogleDriveFolder, type SelectedGoogleDriveFolder } from './googleDriveSelectedFolder';
import {
  deleteSecureGoogleOAuthCredentials,
  getSecureGoogleOAuthCredentials,
  setSecureGoogleOAuthCredentials,
  type StoredGoogleOAuthCredentials,
} from './secureGoogleTokenStore';

const WINDOWS_GOOGLE_CLIENT_ID =
  '955204328722-um7epi871el2cuentnti4rq5obofh4ih.apps.googleusercontent.com';
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

interface WindowsOAuthBridge {
  listen(expectedState: string): Promise<{ redirectUri: string }>;
  wait(): Promise<{ code?: string; error?: string; pickedFileIds?: string[] }>;
  open(authorizationUrl: string): Promise<boolean>;
  cancel(): Promise<boolean>;
}

function getWindowsOAuthBridge(): WindowsOAuthBridge {
  const bridge = typeof window !== 'undefined'
    ? (window as Window & { electronAPI?: { googleOAuth?: WindowsOAuthBridge } })
        .electronAPI?.googleOAuth
    : undefined;
  if (!bridge) {
    throw new Error('Google sign-in is currently available only in the Windows desktop app.');
  }
  return bridge;
}

/**
 * Completes Windows Desktop OAuth using system-browser Authorization Code +
 * PKCE. Credentials are persisted only in the platform secure store.
 * The official Desktop/Mobile Picker selects and validates one Drive folder.\n * This does not run sync.
 */
export async function connectWindowsGoogleDrive(): Promise<{ credentials: StoredGoogleOAuthCredentials; folder: SelectedGoogleDriveFolder }> {
  const bridge = getWindowsOAuthBridge();
  const state = createGoogleOAuthState();
  const callback = await bridge.listen(state);

  try {
    const request = await createWindowsGooglePkceRequest({
      clientId: WINDOWS_GOOGLE_CLIENT_ID,
      redirectUri: callback.redirectUri,
      scopes: [DRIVE_FILE_SCOPE],
      state,
    });

    // Start waiting before opening the system browser so a fast callback is not missed.
    const callbackResultPromise = bridge.wait();
    await bridge.open(request.authorizationUrl);
    const callbackResult = await callbackResultPromise;

    if (callbackResult.error) {
      throw new Error('Google sign-in was not completed. Please try again.');
    }
    if (!callbackResult.code) {
      throw new Error('Google did not return an authorization code.');
    }
    if (!Array.isArray(callbackResult.pickedFileIds) || callbackResult.pickedFileIds.length !== 1) {
      throw new Error('Select exactly one Google Drive folder to continue.');
    }

    const credentials = await exchangeGoogleAuthorizationCode({
      clientId: WINDOWS_GOOGLE_CLIENT_ID,
      code: callbackResult.code,
      codeVerifier: request.codeVerifier,
      redirectUri: callback.redirectUri,
    });
    const selected = await getDriveFileMetadata({
      accessToken: credentials.accessToken,
      fileId: callbackResult.pickedFileIds[0],
    });
    if (selected.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('The selected Drive item is not a folder. Please select a folder.');
    }
    const folder = { id: selected.id, name: selected.name };
    await setSecureGoogleOAuthCredentials(credentials);
    saveSelectedGoogleDriveFolder(folder);
    return { credentials, folder };
  } finally {
    await bridge.cancel().catch(() => false);
  }
}

export async function getWindowsGoogleDriveCredentials():
  Promise<StoredGoogleOAuthCredentials | null> {
  getWindowsOAuthBridge();
  return getSecureGoogleOAuthCredentials();
}

/** Removes this app's locally stored Google credentials; it does not delete Drive files. */
export async function disconnectWindowsGoogleDrive(): Promise<void> {
  getWindowsOAuthBridge();
  await deleteSecureGoogleOAuthCredentials();
  clearSelectedGoogleDriveFolder();
}
