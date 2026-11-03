import { APP_VERSION } from '../config/version';
import { getOrCreateSyncDeviceId } from './driveSyncProtocol';
import { getDriveFileMetadata, listDriveFiles, uploadDriveJson } from './googleDriveApi';
import { getGoogleDriveAccountIdentity } from './googleDriveAccountIdentity';
import {
  getActiveSyncDevices,
  registerSyncDevice,
  validateSyncDeviceRegistry,
  type SyncDeviceRegistry,
} from './syncDeviceRegistry';

const REGISTRY_FILE_NAME = 'srk-device-registry-v1.json';
const REGISTRY_MIME_TYPE = 'application/json';

export interface RegisteredSyncDeviceResult {
  registry: SyncDeviceRegistry;
  deviceId: string;
  activeDeviceCount: number;
  alreadyRegistered: boolean;
  accountEmail?: string;
}

/**
 * Loads or creates the shared device registry in the selected customer folder.
 * Drive does not offer compare-and-swap, so this is explicitly best-effort
 * registration, not race-free enforcement of the ten-device limit.
 */
export async function registerCurrentGoogleDriveDevice(options: {
  accessToken: string;
  folderId: string;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
}): Promise<RegisteredSyncDeviceResult> {
  if (!options.accessToken?.trim()) throw new Error('Connect Google Drive before registering this device.');
  if (!options.folderId?.trim()) throw new Error('Select a Google Drive folder before registering this device.');

  const [identity, folder] = await Promise.all([
    getGoogleDriveAccountIdentity(options.accessToken),
    getDriveFileMetadata({ accessToken: options.accessToken, fileId: options.folderId }),
  ]);
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('The selected Google Drive item is no longer a folder. Select the SRK data folder again.');
  }

  const matches = await listDriveFiles({
    accessToken: options.accessToken,
    parentId: options.folderId,
    name: REGISTRY_FILE_NAME,
  });
  if (matches.files.length > 1) {
    throw new Error('Multiple SRK device registries were found in this folder. Sync is paused to prevent device-limit bypass.');
  }

  let registry: SyncDeviceRegistry;
  let existingFileId: string | undefined;
  if (matches.files.length === 1) {
    existingFileId = matches.files[0].id;
    const metadata = await getDriveFileMetadata({ accessToken: options.accessToken, fileId: existingFileId });
    if (metadata.parents && !metadata.parents.includes(options.folderId)) {
      throw new Error('The device registry is outside the selected SRK data folder.');
    }
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(existingFileId)}?alt=media`, {
      headers: { Authorization: `Bearer ${options.accessToken}` },
    });
    if (!response.ok) throw new Error('The shared device registry could not be downloaded.');
    const parsed: unknown = await response.json();
    if (!validateSyncDeviceRegistry(parsed)) {
      throw new Error('The shared device registry is invalid or uses an unsupported schema. Sync is paused.');
    }
    registry = parsed;
  } else {
    registry = {
      schemaVersion: 1,
      ownerAccountId: identity.accountId,
      folderId: options.folderId,
      updatedAt: Date.now(),
      devices: [],
    };
  }

  const deviceId = getOrCreateSyncDeviceId(options.storage);
  const platform = /android/i.test(navigator.userAgent) ? 'android'
    : (typeof window !== 'undefined' && Boolean(
        (window as Window & { electronAPI?: unknown }).electronAPI
      )) ? 'windows' : 'unknown';
  const label = platform === 'android' ? 'Android device'
    : platform === 'windows' ? 'Windows desktop' : 'SRK device';

  const result = registerSyncDevice(registry, {
    ownerAccountId: identity.accountId,
    folderId: options.folderId,
  }, {
    deviceId,
    platform,
    label,
    appVersion: APP_VERSION,
  });
  if (!result.ok) {
    if (result.reason === 'identity-mismatch') {
      throw new Error('This SRK folder is registered to a different Google account or folder. Sync has been stopped.');
    }
    if (result.reason === 'device-revoked') {\n      throw new Error('This device was revoked from SRK sync. Register a replacement device instead.');\n    }\n    if (result.reason === 'device-limit-reached') {
      throw new Error('The maximum of 10 active SRK devices has been reached. Revoke an old device before connecting another.');
    }
    throw new Error('The shared SRK device registry is invalid. Sync has been stopped.');
  }

  await uploadDriveJson({
    accessToken: options.accessToken,
    parentId: options.folderId,
    name: REGISTRY_FILE_NAME,
    mimeType: REGISTRY_MIME_TYPE,
  }, result.registry, existingFileId);

  return {
    registry: result.registry,
    deviceId,
    activeDeviceCount: getActiveSyncDevices(result.registry).length,
    alreadyRegistered: result.alreadyRegistered,
    ...(identity.email ? { accountEmail: identity.email } : {}),
  };
}
