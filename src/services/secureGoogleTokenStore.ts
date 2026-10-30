import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const TOKEN_KEY = 'google_drive_access_token';
const STORAGE_PREFIX = 'srk_case_manager_';

type ElectronTokenStore = {
  get: () => Promise<string | null>;
  set: (token: string) => Promise<boolean>;
  delete: () => Promise<boolean>;
};

type ElectronBridge = {
  secureTokenStore?: ElectronTokenStore;
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
