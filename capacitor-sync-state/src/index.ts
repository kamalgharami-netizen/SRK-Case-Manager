import { registerPlugin } from '@capacitor/core';

export interface NativeSyncStateEntry {
  key: string;
  value: string;
}

export interface SyncStateStorePlugin {
  getItems(options: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }>;
  setItems(options: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }>;
  removeItems(options: { keys: string[] }): Promise<{ removed: number }>;
}

export const SyncStateStore = registerPlugin<SyncStateStorePlugin>('SyncStateStore');
