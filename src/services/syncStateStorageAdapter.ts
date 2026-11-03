import { Capacitor } from '@capacitor/core';
import {
  SyncStateStore,
  type NativeSyncStateEntry,
  type SyncStateStorePlugin,
} from '@srk/capacitor-sync-state';

const MAX_KEY_LENGTH = 256;
const MAX_VALUE_LENGTH = 2 * 1024 * 1024;

export interface AsyncSyncStateStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface NativeSyncStatePlugin {
  getItems(options: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }>;
  setItems(options: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }>;
  removeItems(options: { keys: string[] }): Promise<{ removed: number }>;
}

function validateKey(key: string): void {
  if (typeof key !== 'string' || !key.trim() || key.length > MAX_KEY_LENGTH) {
    throw new Error('Sync-state key is invalid or exceeds the native storage limit.');
  }
}

/** Async wrapper for browser/Windows localStorage; it preserves the existing key layout. */
export function createLocalSyncStateStorage(storage: Storage): AsyncSyncStateStorage {
  return {
    async getItem(key) {
      validateKey(key);
      return storage.getItem(key);
    },
    async setItem(key, value) {
      validateKey(key);
      if (typeof value !== 'string' || value.length > MAX_VALUE_LENGTH) {
        throw new Error('Sync-state value is invalid or exceeds the native storage limit.');
      }
      storage.setItem(key, value);
    },
    async removeItem(key) {
      validateKey(key);
      storage.removeItem(key);
    },
  };
}

/**
 * Native adapter deliberately has no localStorage fallback. A native bridge or
 * Keystore failure must stop the caller rather than split one sync cycle across
 * two independent stores.
 */
export function createNativeSyncStateStorage(
  nativeStore: NativeSyncStatePlugin = SyncStateStore as SyncStateStorePlugin,
): AsyncSyncStateStorage {
  return {
    async getItem(key) {
      validateKey(key);
      const result = await nativeStore.getItems({ keys: [key] });
      if (!result || !Array.isArray(result.items)) {
        throw new Error('Native sync-state read returned an invalid result.');
      }
      const matches = result.items.filter(item => {
        if (!item || typeof item.key !== 'string' || typeof item.value !== 'string') {
          throw new Error('Native sync-state read returned a malformed entry.');
        }
        if (item.key !== key) {
          throw new Error('Native sync-state read returned an unexpected key.');
        }
        return true;
      });
      if (matches.length > 1) {
        throw new Error('Native sync-state read returned duplicate entries.');
      }
      return matches[0]?.value ?? null;
    },
    async setItem(key, value) {
      validateKey(key);
      if (typeof value !== 'string' || value.length > MAX_VALUE_LENGTH) {
        throw new Error('Sync-state value is invalid or exceeds the native storage limit.');
      }
      const result = await nativeStore.setItems({ items: [{ key, value }] });
      if (!result || !Number.isInteger(result.saved) || result.saved !== 1) {
        throw new Error('Native sync-state write was not fully committed.');
      }
    },
    async removeItem(key) {
      validateKey(key);
      const result = await nativeStore.removeItems({ keys: [key] });
      // Removing an absent key is idempotent (0); a single-key request may
      // remove exactly one entry. Treat malformed or impossible counts as a
      // failed operation so callers never advance state after an unverified delete.
      if (!result || !Number.isInteger(result.removed) || result.removed < 0 || result.removed > 1) {
        throw new Error('Native sync-state removal returned an invalid result.');
      }
    },
  };
}

/** Select one complete storage implementation; never silently fall back on Android. */
export function createPlatformSyncStateStorage(options: {
  platform?: string;
  localStorage?: Storage;
  nativeStore?: NativeSyncStatePlugin;
} = {}): AsyncSyncStateStorage {
  const platform = options.platform ?? Capacitor.getPlatform();
  if (platform === 'android') {
    return createNativeSyncStateStorage(options.nativeStore);
  }
  const storage = options.localStorage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
  if (!storage) throw new Error('Local sync-state storage is unavailable on this platform.');
  return createLocalSyncStateStorage(storage);
}
