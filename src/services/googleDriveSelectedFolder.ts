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
