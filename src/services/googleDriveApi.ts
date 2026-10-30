/**
 * Google Drive REST API adapter.
 *
 * Security:
 * - Access tokens are supplied per request and are never persisted here.
 * - Never pass a client secret or refresh token to this module.
 * - Use the narrow drive.file OAuth scope for files created/opened by this app.
 *
 * This adapter is deliberately separate from AppContext. It does not enable
 * syncing until platform OAuth and the conflict-safe sync coordinator are wired.
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  parents?: string[];
  appProperties?: Record<string, string>;
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface DriveRequestOptions {
  accessToken: string;
  signal?: AbortSignal;
}

export interface DriveUploadOptions extends DriveRequestOptions {
  name: string;
  parentId?: string;
  mimeType?: string;
  appProperties?: Record<string, string>;
}

export class GoogleDriveError extends Error {
  readonly status: number;
  readonly reason?: string;

  constructor(message: string, status: number, reason?: string) {
    super(message);
    this.name = 'GoogleDriveError';
    this.status = status;
    this.reason = reason;
  }
}

function requireToken(accessToken: string): void {
  if (!accessToken || !accessToken.trim()) {
    throw new Error('A Google Drive access token is required.');
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText || 'Google Drive request failed';
    let reason: string | undefined;
    try {
      const body = await response.json();
      message = body?.error?.message || message;
      reason = body?.error?.errors?.[0]?.reason;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new GoogleDriveError(message, response.status, reason);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function authHeaders(accessToken: string): HeadersInit {
  requireToken(accessToken);
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listDriveFolders(
  options: DriveRequestOptions,
  pageToken?: string
): Promise<DriveFileList> {
  const params = new URLSearchParams({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,parents)',
    pageSize: '100',
    orderBy: 'name',
  });
  if (pageToken) params.set('pageToken', pageToken);
  if (options.pageToken) params.set('pageToken', options.pageToken);
  const response = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: authHeaders(options.accessToken),
    signal: options.signal,
  });
  return parseResponse<DriveFileList>(response);
}

export async function createDriveFolder(
  options: DriveRequestOptions & { name: string; parentId?: string }
): Promise<DriveFile> {
  const name = options.name.trim();
  if (!name) throw new Error('Folder name cannot be empty.');
  const response = await fetch(`${DRIVE_API}/files?fields=id,name,mimeType,parents`, {
    method: 'POST',
    headers: {
      ...authHeaders(options.accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(options.parentId ? { parents: [options.parentId] } : {}),
    }),
    signal: options.signal,
  });
  return parseResponse<DriveFile>(response);
}

export async function listDriveFiles(
  options: DriveRequestOptions & { parentId: string; name?: string; pageToken?: string }
): Promise<DriveFileList> {
  if (!options.parentId) throw new Error('A selected Drive folder is required.');
  const clauses = [
    `'${options.parentId.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}' in parents`,
    'trashed = false',
  ];
  if (options.name) {
    clauses.push(`name = '${options.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);
  }
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size,parents,appProperties)',
    pageSize: '100',
    orderBy: 'modifiedTime desc',
  });
  const response = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: authHeaders(options.accessToken),
    signal: options.signal,
  });
  return parseResponse<DriveFileList>(response);
}

export async function uploadDriveJson(
  options: DriveUploadOptions,
  data: unknown,
  existingFileId?: string
): Promise<DriveFile> {
  if (!options.name.trim()) throw new Error('File name cannot be empty.');
  const metadata = {
    name: options.name,
    mimeType: options.mimeType || 'application/json',
    ...(options.parentId && !existingFileId ? { parents: [options.parentId] } : {}),
    ...(options.appProperties ? { appProperties: options.appProperties } : {}),
  };
  const boundary = `srk_drive_${Math.random().toString(36).slice(2)}`;
  const body = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(data)}\r\n`,
    `--${boundary}--`,
  ].join('');
  const endpoint = existingFileId
    ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,parents,appProperties`
    : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,parents,appProperties`;
  const response = await fetch(endpoint, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      ...authHeaders(options.accessToken),
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
    signal: options.signal,
  });
  return parseResponse<DriveFile>(response);
}

export async function downloadDriveJson<T>(
  options: DriveRequestOptions & { fileId: string }
): Promise<T> {
  if (!options.fileId) throw new Error('A Drive file ID is required.');
  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(options.fileId)}?alt=media`,
    {
      headers: authHeaders(options.accessToken),
      signal: options.signal,
    }
  );
  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
  return response.json() as Promise<T>;
}

export async function deleteDriveFile(
  options: DriveRequestOptions & { fileId: string }
): Promise<void> {
  if (!options.fileId) throw new Error('A Drive file ID is required.');
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(options.fileId)}`, {
    method: 'DELETE',
    headers: authHeaders(options.accessToken),
    signal: options.signal,
  });
  if (!response.ok) await parseResponse<unknown>(response);
}
