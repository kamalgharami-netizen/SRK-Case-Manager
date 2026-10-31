import type { StoredGoogleOAuthCredentials } from './secureGoogleTokenStore';
import { refreshGoogleAccessToken } from './googleOAuthTokenClient';

export interface OAuthCredentialStore {
  get(): Promise<StoredGoogleOAuthCredentials | null>;
  set(credentials: StoredGoogleOAuthCredentials): Promise<void>;
  delete(): Promise<void>;
}

export interface AccessTokenDependencies {
  store: OAuthCredentialStore;
  clientId: string;
  now?: () => number;
  refresh?: (options: { clientId: string; refreshToken: string; now: number }) =>
    Promise<StoredGoogleOAuthCredentials>;
  refreshSkewMs?: number;
}

/**
 * Returns a usable access token, refreshing it before expiry.
 * Credentials stay inside the platform secure-store adapter; callers receive
 * only the short-lived access token. No background timer or localStorage use.
 */
export async function getValidGoogleAccessToken(
  dependencies: AccessTokenDependencies
): Promise<string> {
  const now = dependencies.now?.() ?? Date.now();
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new Error('Invalid current time for Google token validation.');
  }
  const credentials = await dependencies.store.get();
  if (!credentials) throw new Error('Google Drive is not connected. Sign in first.');

  const skew = dependencies.refreshSkewMs ?? 60_000;
  if (!Number.isSafeInteger(skew) || skew < 0 || skew > 10 * 60_000) {
    throw new Error('Invalid Google token refresh window.');
  }
  if (credentials.expiresAt > now + skew) return credentials.accessToken;
  if (!credentials.refreshToken) {
    await dependencies.store.delete();
    throw new Error('Google sign-in has expired. Reconnect Google Drive.');
  }

  try {
    const refresh = dependencies.refresh ?? (async options =>
      refreshGoogleAccessToken({
        clientId: options.clientId,
        refreshToken: options.refreshToken,
        now: options.now,
      }));
    const updated = await refresh({
      clientId: dependencies.clientId,
      refreshToken: credentials.refreshToken,
      now,
    });
    await dependencies.store.set(updated);
    return updated.accessToken;
  } catch (error) {
    // A provider rejection may mean revocation/expiry. Keep credentials for
    // transient network errors; never erase them based on an ambiguous failure.
    throw error;
  }
}
