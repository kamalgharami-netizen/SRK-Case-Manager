import { Capacitor } from '@capacitor/core';
import {
  SyncStateStore,
  type NativeSyncStateEntry,
  type SyncStateStorePlugin,
} from '@srk/capacitor-sync-state';

const MAX_KEY_LENGTH = 256;
const MAX_VALUE_LENGTH = 2 * 1024 * 1024;

export interface SyncStateStorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AsyncSyncStateStorage extends SyncStateStorageDriver {
  /**
   * Atomically read and replace/remove one key from the perspective of this
   * adapter instance. The updater must be synchronous and side-effect free.
   */
  updateItem<T>(
    key: string,
    updater: (current: string | null) => { value: string | null; result: T },
  ): Promise<T>;
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
    async updateItem<T>(key, updater) {
      validateKey(key);
      const next = updater(storage.getItem(key));
      if (!next || (next.value !== null && (typeof next.value !== 'string' || next.value.length > MAX_VALUE_LENGTH))) {
        throw new Error('Sync-state update returned an invalid or oversized value.');
      }
      if (next.value === null) storage.removeItem(key);
      else storage.setItem(key, next.value);
      return next.result;
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
  return createSerializedSyncStateStorage({
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
    async updateItem<T>(key, updater) {
      validateKey(key);
      const current = await nativeStore.getItems({ keys: [key] });
      if (!current || !Array.isArray(current.items) || current.items.some(item => !item || item.key !== key || typeof item.value !== 'string') || current.items.length > 1) {
        throw new Error('Native sync-state update read returned an invalid result.');
      }
      const next = updater(current.items[0]?.value ?? null);
      if (!next || (next.value !== null && (typeof next.value !== 'string' || next.value.length > MAX_VALUE_LENGTH))) {
        throw new Error('Sync-state update returned an invalid or oversized value.');
      }
      if (next.value === null) {
        const removed = await nativeStore.removeItems({ keys: [key] });
        if (!removed || !Number.isInteger(removed.removed) || removed.removed < 0 || removed.removed > 1) {
          throw new Error('Native sync-state update removal was not verified.');
        }
      } else {
        const saved = await nativeStore.setItems({ items: [{ key, value: next.value }] });
        if (!saved || saved.saved !== 1) throw new Error('Native sync-state update write was not fully committed.');
      }
      return next.result;
    },
  });
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
  return createSerializedSyncStateStorage(createLocalSyncStateStorage(storage));
}


/**
 * Serialize operations per key for asynchronous stores. This prevents overlapping
 * read/modify/write sequences from reordering writes on the native bridge.
 * Different keys remain independent, and a rejected operation does not poison
 * the queue for later retries.
 */
export function createSerializedSyncStateStorage(
  storage: SyncStateStorageDriver,
): AsyncSyncStateStorage {
  const tails = new Map<string, Promise<void>>();

  function runExclusive<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = tails.get(key) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);
    const settled = current.then(() => undefined, () => undefined);
    tails.set(key, settled);
    void settled.then(() => {
      if (tails.get(key) === settled) tails.delete(key);
    });
    return current;
  }

  return {
    getItem(key) {
      return runExclusive(key, () => storage.getItem(key));
    },
    setItem(key, value) {
      return runExclusive(key, () => storage.setItem(key, value));
    },
    removeItem(key) {
      return runExclusive(key, () => storage.removeItem(key));
    },
    updateItem<T>(key, updater) {
      return runExclusive(key, async () => {
        // Keep the complete read/modify/write sequence inside one per-key lock.
        // Calling the public wrapper methods here would deadlock on that same lock.
        const current = await storage.getItem(key);
        const next = updater(current);
        if (!next || (next.value !== null && typeof next.value !== 'string')) {
          throw new Error('Sync-state update returned an invalid value.');
        }
        if (next.value === null) await storage.removeItem(key);
        else await storage.setItem(key, next.value);
        return next.result;
      });
    },
  };
}
