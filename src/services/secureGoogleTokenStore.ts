import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const TOKEN_KEY = 'google_drive_access_token';
const STORAGE_PREFIX = 'srk_case_manager_';
const OAUTH_CREDENTIALS_KEY = 'google_drive_oauth_credentials_v1';

type ElectronTokenStore = {
  get: () => Promise<string | null>;
  set: (token: string) => Promise<boolean>;
  delete: () => Promise<boolean>;
};

type ElectronBridge = {
  secureTokenStore?: ElectronTokenStore;
  secureOAuthCredentials?: ElectronTokenStore;
};

function electronTokenStore(): ElectronTokenStore | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { electronAPI?: ElectronBridge }).electronAPI?.secureTokenStore;
}

async function androidStorageReady(): Promise<void> {
  await SecureStorage.setKeyPrefix(STORAGE_PREFIX);
}

/**
 * Platform-specific storage for short-lived Google OAuth access tokens.
 * Android uses Android Keystore-backed AES-GCM storage; Windows uses
 * Electron safeStorage through the restricted preload bridge.
 * Browser storage is deliberately rejected because the plugin's web
 * implementation is unencrypted.
 */
export async function getSecureGoogleAccessToken(): Promise<string | null> {
  const electron = electronTokenStore();
  if (electron) return electron.get();

  if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    return SecureStorage.getItem(TOKEN_KEY);
  }

  throw new Error('Secure Google token storage is unavailable on this platform.');
}

export async function setSecureGoogleAccessToken(token: string): Promise<void> {
  if (typeof token !== 'string' || token.length < 1 || token.length > 16384) {
    throw new Error('Invalid Google access token.');
  }

  const electron = electronTokenStore();
  if (electron) {
    await electron.set(token);
    return;
  }

  if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    await SecureStorage.setItem(TOKEN_KEY, token);
    return;
  }

  throw new Error('Secure Google token storage is unavailable on this platform.');
}

export async function deleteSecureGoogleAccessToken(): Promise<void> {
  const electron = electronTokenStore();
  if (electron) {
    await electron.delete();
    return;
  }

  if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    await SecureStorage.removeItem(TOKEN_KEY);
    return;
  }

  throw new Error('Secure Google token storage is unavailable on this platform.');
}


export interface StoredGoogleOAuthCredentials {
  accessToken: string;
  refreshToken: string | null;
  tokenType: 'Bearer';
  expiresAt: number;
  scope: string | null;
}

function validateCredentialBundle(value: unknown): value is StoredGoogleOAuthCredentials {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Partial<StoredGoogleOAuthCredentials>;
  return typeof item.accessToken === 'string' && item.accessToken.length > 0 &&
    item.accessToken.length <= 16384 &&
    (item.refreshToken === null ||
      (typeof item.refreshToken === 'string' && item.refreshToken.length > 0 &&
       item.refreshToken.length <= 16384)) &&
    item.tokenType === 'Bearer' &&
    Number.isSafeInteger(item.expiresAt) &&
    (item.scope === null || typeof item.scope === 'string');
}

/**
 * Persist the complete OAuth credential set only in OS-backed encrypted
 * storage. Never place this object in app state, localStorage, Drive files,
 * logs, or the sync journal.
 */
export async function getSecureGoogleOAuthCredentials():
  Promise<StoredGoogleOAuthCredentials | null> {
  const electron = typeof window !== 'undefined'
    ? (window as Window & { electronAPI?: ElectronBridge }).electronAPI?.secureOAuthCredentials
    : undefined;
  let serialized: string | null;
  if (electron) {
    serialized = await electron.get();
  } else if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    serialized = await SecureStorage.getItem(OAUTH_CREDENTIALS_KEY);
  } else {
    throw new Error('Secure Google credential storage is unavailable on this platform.');
  }
  if (serialized === null) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(serialized); } catch {
    throw new Error('Stored Google OAuth credentials are corrupt; reconnect Google Drive.');
  }
  if (!validateCredentialBundle(parsed)) {
    throw new Error('Stored Google OAuth credentials are invalid; reconnect Google Drive.');
  }
  return parsed;
}

export async function setSecureGoogleOAuthCredentials(
  credentials: StoredGoogleOAuthCredentials
): Promise<void> {
  if (!validateCredentialBundle(credentials)) {
    throw new Error('Invalid Google OAuth credential bundle.');
  }
  const serialized = JSON.stringify(credentials);
  const electron = typeof window !== 'undefined'
    ? (window as Window & { electronAPI?: ElectronBridge }).electronAPI?.secureOAuthCredentials
    : undefined;
  if (electron) {
    await electron.set(serialized);
    return;
  }
  if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    await SecureStorage.setItem(OAUTH_CREDENTIALS_KEY, serialized);
    return;
  }
  throw new Error('Secure Google credential storage is unavailable on this platform.');
}

export async function deleteSecureGoogleOAuthCredentials(): Promise<void> {
  const electron = typeof window !== 'undefined'
    ? (window as Window & { electronAPI?: ElectronBridge }).electronAPI?.secureOAuthCredentials
    : undefined;
  if (electron) {
    await electron.delete();
    return;
  }
  if (Capacitor.getPlatform() === 'android') {
    await androidStorageReady();
    await SecureStorage.removeItem(OAUTH_CREDENTIALS_KEY);
    return;
  }
  throw new Error('Secure Google credential storage is unavailable on this platform.');
}
