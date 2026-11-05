import { registerPlugin } from '@capacitor/core';

export interface NativeSyncStateEntry {
  key: string;
  value: string;
}

export interface SyncStateStorePlugin {
  acquireSyncLease(options: { ownerId: string; leaseDurationMs: number }): Promise<{ acquired: boolean; leaseUntil: number }>;
  releaseSyncLease(options: { ownerId: string }): Promise<{ released: boolean }>;
  selectBackupFolder(): Promise<{ uri: string; displayName: string }>;
  writeBackupFile(options: { fileName: string; content: string }): Promise<{ saved: boolean; uri: string; fileName: string }>;
  getItems(options: { keys: string[] }): Promise<{ items: NativeSyncStateEntry[] }>;
  setItems(options: { items: NativeSyncStateEntry[] }): Promise<{ saved: number }>;
  removeItems(options: { keys: string[] }): Promise<{ removed: number }>;
}

export const SyncStateStore = registerPlugin<SyncStateStorePlugin>('SyncStateStore');
