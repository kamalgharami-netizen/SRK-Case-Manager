import { registerPlugin } from '@capacitor/core';

export interface GoogleDriveAuthorizationResult {
  accessToken: string;
  pickedFileIds: string[];
  grantedScopes: string[];
}

export interface GoogleDriveAuthPlugin {
  authorize(options?: { showPicker?: boolean }): Promise<GoogleDriveAuthorizationResult>;
}

export const GoogleDriveAuth = registerPlugin<GoogleDriveAuthPlugin>('GoogleDriveAuth');
