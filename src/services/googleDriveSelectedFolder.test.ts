import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSelectedGoogleDriveFolderAsync,
  saveSelectedGoogleDriveFolderAsync,
  clearSelectedGoogleDriveFolderAsync,
} from './googleDriveSelectedFolder';

class MemoryStore {
  values = new Map<string, string>();
  async getItem(key: string): Promise<string | null> { return this.values.get(key) ?? null; }
  async setItem(key: string, value: string): Promise<void> { this.values.set(key, value); }
  async removeItem(key: string): Promise<void> { this.values.delete(key); }
}

test('async selected folder is saved, loaded and cleared through the supplied store', async () => {
  const store = new MemoryStore();
  await saveSelectedGoogleDriveFolderAsync({ id: 'folder-1', name: 'SRK Data' }, store);
  assert.deepEqual(await getSelectedGoogleDriveFolderAsync(store), { id: 'folder-1', name: 'SRK Data' });
  await clearSelectedGoogleDriveFolderAsync(store);
  assert.equal(await getSelectedGoogleDriveFolderAsync(store), null);
});

test('async selected folder rejects corrupt metadata instead of hiding storage failure', async () => {
  const store = new MemoryStore();
  store.values.set('srk_google_drive_selected_folder_v1', '{bad-json');
  await assert.rejects(getSelectedGoogleDriveFolderAsync(store), /unreadable/);
});

test('async selected folder requires valid folder metadata', async () => {
  const store = new MemoryStore();
  await assert.rejects(
    saveSelectedGoogleDriveFolderAsync({ id: '', name: 'Invalid' }, store),
    /valid Google Drive folder/
  );
});
