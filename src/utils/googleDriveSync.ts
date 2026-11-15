import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Company } from '../types';

export const DRIVE_SYNC_FILE_NAME = 'SRK_Case_Manager_Live_Sync.json';
export const GOOGLE_DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Reuse existing Firebase app instance if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

// Strictly in-memory token caching (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface GoogleDriveUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface DriveFileMeta {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export interface DriveSyncPayload {
  appName: string;
  schemaVersion: number;
  lastUpdatedAt: number;
  lastUpdatedByDeviceId: string;
  lastUpdatedByDeviceLabel: string;
  activeCompanyId: string | null;
  companies: Company[];
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    let id = localStorage.getItem('srk_sync_device_id');
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('srk_sync_device_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).slice(2, 8);
  }
}

export function getDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Desktop Browser';
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'Mobile (Android)';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'Mobile (iOS)';
  if (/Mobile/i.test(ua)) return 'Mobile Device';
  if (/Windows/i.test(ua)) return 'Computer (Windows)';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Computer (Mac)';
  if (/Linux/i.test(ua)) return 'Computer (Linux)';
  return 'Web Browser';
}

export const initGoogleDriveAuth = (
  onAuthSuccess?: (user: GoogleDriveUser, token: string) => void,
  onAuthFailure?: (userPresentWithoutToken?: GoogleDriveUser | null) => void
) => {
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      const mappedUser: GoogleDriveUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      if (cachedAccessToken) {
        onAuthSuccess?.(mappedUser, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.(mappedUser);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.(null);
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{
  user: GoogleDriveUser;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Drive authorization token.');
    }

    cachedAccessToken = credential.accessToken;
    const mappedUser: GoogleDriveUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };

    return { user: mappedUser, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const clearDriveAccessToken = () => {
  cachedAccessToken = null;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  cachedAccessToken = null;
  await auth.signOut();
};

/**
 * Finds the dedicated chamber sync JSON file on the user's Google Drive.
 */
export async function findDriveSyncFile(accessToken: string): Promise<DriveFileMeta | null> {
  const query = encodeURIComponent(`name='${DRIVE_SYNC_FILE_NAME}' and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc&spaces=drive`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive search failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (Array.isArray(data.files) && data.files.length > 0) {
    return data.files[0] as DriveFileMeta;
  }
  return null;
}

/**
 * Downloads and parses the chamber sync payload from Google Drive.
 */
export async function downloadDriveSyncPayload(
  accessToken: string,
  fileId: string
): Promise<DriveSyncPayload | null> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive download failed (${res.status}): ${errText}`);
  }

  const parsed = await res.json();
  if (parsed && Array.isArray(parsed.companies)) {
    return parsed as DriveSyncPayload;
  }
  return null;
}

/**
 * Creates or updates SRK_Case_Manager_Live_Sync.json on Google Drive using multipart upload.
 */
export async function uploadDriveSyncPayload(
  accessToken: string,
  payload: DriveSyncPayload,
  existingFileId?: string | null
): Promise<DriveFileMeta> {
  const metadata = existingFileId
    ? {
        name: DRIVE_SYNC_FILE_NAME,
        mimeType: 'application/json'
      }
    : {
        name: DRIVE_SYNC_FILE_NAME,
        mimeType: 'application/json',
        description: 'SRK Case Manager Automatic Two-Way Sync Data (Mobile <-> Computer)'
      };

  const boundary = 'srk_sync_boundary_' + Math.random().toString(36).slice(2);
  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(payload)}\r\n`,
    `--${boundary}--`
  ];
  const body = bodyParts.join('');

  const baseUrl = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`;

  const res = await fetch(baseUrl, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (res.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive upload failed (${res.status}): ${errText}`);
  }

  return (await res.json()) as DriveFileMeta;
}

/**
 * Deletes the sync file from Google Drive (only invoked after explicit user confirmation).
 */
export async function deleteDriveSyncFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.status === 401) {
    cachedAccessToken = null;
    throw new Error('AUTH_EXPIRED');
  }

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Drive delete failed (${res.status}): ${errText}`);
  }
}
