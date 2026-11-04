export interface SelectedGoogleDriveFolder {
  id: string;
  name: string;
}

const SELECTED_FOLDER_KEY = 'srk_google_drive_selected_folder_v1';

export function saveSelectedGoogleDriveFolder(folder: SelectedGoogleDriveFolder): void {
  if (!folder.id || !folder.name) throw new Error('A valid Google Drive folder is required.');
  localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(folder));
}

export function getSelectedGoogleDriveFolder(): SelectedGoogleDriveFolder | null {
  try {
    const raw = localStorage.getItem(SELECTED_FOLDER_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value.id !== 'string' || !value.id ||
        typeof value.name !== 'string' || !value.name) return null;
    return { id: value.id, name: value.name };
  } catch {
    return null;
  }
}

export function clearSelectedGoogleDriveFolder(): void {
  localStorage.removeItem(SELECTED_FOLDER_KEY);
}


/**
 * Async selected-folder access for the unified sync-state repository.
 * Native storage errors are allowed to propagate; callers must not silently
 * fall back to a different store during a sync cycle.
 */
export async function saveSelectedGoogleDriveFolderAsync(
  folder: SelectedGoogleDriveFolder,
  storage: { setItem(key: string, value: string): Promise<void> },
): Promise<void> {
  if (!folder.id?.trim() || !folder.name?.trim()) {
    throw new Error('A valid Google Drive folder is required.');
  }
  await storage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(folder));
}

export async function getSelectedGoogleDriveFolderAsync(
  storage: { getItem(key: string): Promise<string | null> },
): Promise<SelectedGoogleDriveFolder | null> {
  const raw = await storage.getItem(SELECTED_FOLDER_KEY);
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('The saved Google Drive folder is unreadable; existing sync data was left untouched.');
  }
  if (!value || typeof value !== 'object' ||
      typeof (value as SelectedGoogleDriveFolder).id !== 'string' ||
      !(value as SelectedGoogleDriveFolder).id ||
      typeof (value as SelectedGoogleDriveFolder).name !== 'string' ||
      !(value as SelectedGoogleDriveFolder).name) {
    throw new Error('The saved Google Drive folder is invalid; select the sync folder again.');
  }
  return { id: (value as SelectedGoogleDriveFolder).id, name: (value as SelectedGoogleDriveFolder).name };
}

export async function clearSelectedGoogleDriveFolderAsync(
  storage: { removeItem(key: string): Promise<void> },
): Promise<void> {
  await storage.removeItem(SELECTED_FOLDER_KEY);
}
