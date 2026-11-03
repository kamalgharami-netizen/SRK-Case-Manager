import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLocalSyncStateStorage,
  createNativeSyncStateStorage,
  createPlatformSyncStateStorage,
  type NativeSyncStatePlugin,
} from './syncStateStorageAdapter';
import type { NativeSyncStateEntry } from '@srk/capacitor-sync-state';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

class MemoryNativeStore implements NativeSyncStatePlugin {
  values = new Map<string, string>();
  async getItems({ keys }: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }> {
    return { items: keys.filter(key => this.values.has(key)).map(key => ({ key, value: this.values.get(key)! })) };
  }
  async setItems({ items }: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }> {
    for (const item of items) this.values.set(item.key, item.value);
    return { saved: items.length };
  }
  async removeItems({ keys }: { keys: string[] }): Promise<{ removed: number }> {
    let removed = 0;
    for (const key of keys) if (this.values.delete(key)) removed += 1;
    return { removed };
  }
}

test('local adapter preserves existing localStorage key/value behavior', async () => {
  const storage = new MemoryStorage();
  const adapter = createLocalSyncStateStorage(storage as unknown as Storage);
  await adapter.setItem('srk_sync_journal_v1', 'journal');
  assert.equal(await adapter.getItem('srk_sync_journal_v1'), 'journal');
  await adapter.removeItem('srk_sync_journal_v1');
  assert.equal(await adapter.getItem('srk_sync_journal_v1'), null);
});

test('native adapter reads, writes, and removes through the native plugin', async () => {
  const native = new MemoryNativeStore();
  const adapter = createNativeSyncStateStorage(native);
  await adapter.setItem('srk_sync_inbox_v1', 'inbox');
  assert.equal(await adapter.getItem('srk_sync_inbox_v1'), 'inbox');
  await adapter.removeItem('srk_sync_inbox_v1');
  assert.equal(await adapter.getItem('srk_sync_inbox_v1'), null);
  assert.equal(native.values.size, 0);
});

test('native adapter rejects malformed, unexpected, and duplicate read results', async () => {
  const malformed = new MemoryNativeStore();
  malformed.getItems = async () => ({ items: null as unknown as NativeSyncStateEntry[] });
  await assert.rejects(
    createNativeSyncStateStorage(malformed).getItem('srk_sync_journal_v1'),
    /read returned an invalid result/,
  );

  const unexpected = new MemoryNativeStore();
  unexpected.getItems = async () => ({
    items: [{ key: 'different-key', value: 'unrelated' }],
  });
  await assert.rejects(
    createNativeSyncStateStorage(unexpected).getItem('srk_sync_journal_v1'),
    /unexpected key/,
  );

  const malformedEntry = new MemoryNativeStore();
  malformedEntry.getItems = async () => ({
    items: [{ key: 'srk_sync_journal_v1', value: 7 as unknown as string }],
  });
  await assert.rejects(
    createNativeSyncStateStorage(malformedEntry).getItem('srk_sync_journal_v1'),
    /malformed entry/,
  );

  const duplicate = new MemoryNativeStore();
  duplicate.getItems = async () => ({
    items: [
      { key: 'srk_sync_journal_v1', value: 'first' },
      { key: 'srk_sync_journal_v1', value: 'second' },
    ],
  });
  await assert.rejects(
    createNativeSyncStateStorage(duplicate).getItem('srk_sync_journal_v1'),
    /duplicate entries/,
  );
});

test('native adapter rejects malformed native removal results', async () => {
  const native = new MemoryNativeStore();
  native.removeItems = async () => ({ removed: 2 });
  const adapter = createNativeSyncStateStorage(native);
  await assert.rejects(
    adapter.removeItem('srk_sync_inbox_v1'),
    /removal returned an invalid result/,
  );
});

test('native adapter fails closed when a native write is incomplete', async () => {
  const native = new MemoryNativeStore();
  native.setItems = async () => ({ saved: 0 });
  const adapter = createNativeSyncStateStorage(native);
  await assert.rejects(adapter.setItem('srk_sync_journal_v1', 'data'), /not fully committed/);
});

test('native adapter propagates bridge and Keystore failures without local fallback', async () => {
  const native = new MemoryNativeStore();
  native.getItems = async () => { throw new Error('Keystore unavailable'); };
  const local = new MemoryStorage();
  local.setItem('srk_sync_journal_v1', 'legacy');
  const adapter = createPlatformSyncStateStorage({
    platform: 'android',
    localStorage: local as unknown as Storage,
    nativeStore: native,
  });
  await assert.rejects(adapter.getItem('srk_sync_journal_v1'), /Keystore unavailable/);
  assert.equal(local.getItem('srk_sync_journal_v1'), 'legacy');
});

test('platform selector uses localStorage outside Android and native storage on Android', async () => {
  const local = new MemoryStorage();
  const native = new MemoryNativeStore();
  const desktop = createPlatformSyncStateStorage({
    platform: 'electron',
    localStorage: local as unknown as Storage,
    nativeStore: native,
  });
  const android = createPlatformSyncStateStorage({
    platform: 'android',
    localStorage: local as unknown as Storage,
    nativeStore: native,
  });
  await desktop.setItem('srk_sync_device_id_v1', 'desktop-device');
  await android.setItem('srk_sync_device_id_v1', 'android-device');
  assert.equal(local.getItem('srk_sync_device_id_v1'), 'desktop-device');
  assert.equal(native.values.get('srk_sync_device_id_v1'), 'android-device');
});

test('adapter rejects invalid keys and oversized values before calling storage', async () => {
  const native = new MemoryNativeStore();
  const adapter = createNativeSyncStateStorage(native);
  await assert.rejects(adapter.getItem('   '), /key is invalid/);
  await assert.rejects(adapter.setItem('valid-key', 'x'.repeat(2 * 1024 * 1024 + 1)), /value is invalid/);
  assert.equal(native.values.size, 0);
});

test('Android platform does not silently fall back when native plugin is absent', async () => {
  const local = new MemoryStorage();
  const brokenNative = {
    getItems: async () => { throw new Error('native plugin unavailable'); },
    setItems: async () => { throw new Error('native plugin unavailable'); },
    removeItems: async () => { throw new Error('native plugin unavailable'); },
  };
  const adapter = createPlatformSyncStateStorage({
    platform: 'android',
    localStorage: local as unknown as Storage,
    nativeStore: brokenNative,
  });
  await assert.rejects(adapter.getItem('srk_sync_journal_v1'), /native plugin unavailable/);
  assert.equal(local.getItem('srk_sync_journal_v1'), null);
});


test('native adapter rejects malformed write acknowledgement objects', async () => {
  for (const response of [null, {}, { saved: 0 }, { saved: 2 }, { saved: Number.NaN }]) {
    const native = new MemoryNativeStore();
    native.setItems = async () => response as { saved: number };
    await assert.rejects(
      createNativeSyncStateStorage(native).setItem('srk_sync_journal_v1', 'journal'),
      /write was not fully committed/,
    );
  }
});

test('native adapter rejects malformed removal acknowledgement objects', async () => {
  for (const response of [null, {}, { removed: -1 }, { removed: 2 }, { removed: Number.NaN }]) {
    const native = new MemoryNativeStore();
    native.removeItems = async () => response as { removed: number };
    await assert.rejects(
      createNativeSyncStateStorage(native).removeItem('srk_sync_journal_v1'),
      /removal returned an invalid result/,
    );
  }
});
