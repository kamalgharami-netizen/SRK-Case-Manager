/**
 * Google OAuth token endpoint client for installed/native public clients.
 * No client secret is accepted or sent. Callers must persist the returned
 * credential bundle only through the platform secure-storage adapter.
 */
export interface GoogleOAuthCredentialSet {
  accessToken: string;
  refreshToken: string | null;
  tokenType: 'Bearer';
  expiresAt: number;
  scope: string | null;
}

export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  scope?: string;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

function validateClientId(clientId: string): void {
  if (typeof clientId !== 'string' || !clientId.trim() ||
      clientId.length > 512 || /[\r\n]/.test(clientId)) {
    throw new Error('A valid Google OAuth client ID is required.');
  }
}

function parseTokenResponse(payload: unknown, now: number,
  previousRefreshToken: string | null = null): GoogleOAuthCredentialSet {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Google returned an invalid token response.');
  }
  const value = payload as Partial<GoogleOAuthTokenResponse>;
  if (typeof value.access_token !== 'string' || !value.access_token ||
      value.access_token.length > 16384 ||
      value.token_type?.toLowerCase() !== 'bearer' ||
      !Number.isInteger(value.expires_in) || (value.expires_in ?? 0) < 1 ||
      (value.expires_in ?? 0) > 86400 ||
      (value.refresh_token !== undefined &&
        (typeof value.refresh_token !== 'string' || !value.refresh_token ||
         value.refresh_token.length > 16384)) ||
      (value.scope !== undefined &&
        (typeof value.scope !== 'string' || value.scope.length > 4096))) {
    throw new Error('Google returned incomplete or invalid OAuth token fields.');
  }
  return {
    accessToken: value.access_token,
    refreshToken: value.refresh_token ?? previousRefreshToken,
    tokenType: 'Bearer',
    expiresAt: now + value.expires_in * 1000,
    scope: value.scope ?? null,
  };
}

async function postTokenRequest(params: URLSearchParams, fetcher: FetchLike,
  now: number, previousRefreshToken: string | null = null): Promise<GoogleOAuthCredentialSet> {
  const response = await fetcher(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'error',
  });
  if (!response.ok) {
    // Do not include response bodies: they can contain sensitive provider details.
    throw new Error(`Google OAuth token request failed (HTTP ${response.status}).`);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Google returned an unreadable OAuth token response.');
  }
  return parseTokenResponse(payload, now, previousRefreshToken);
}

export async function exchangeGoogleAuthorizationCode(options: {
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
  fetcher?: FetchLike;
  now?: number;
}): Promise<GoogleOAuthCredentialSet> {
  validateClientId(options.clientId);
  if (!options.code || options.code.length > 4096 ||
      !options.codeVerifier || options.codeVerifier.length < 43 ||
      options.codeVerifier.length > 128 ||
      !options.redirectUri || options.redirectUri.length > 2048) {
    throw new Error('Invalid Google authorization-code exchange parameters.');
  }
  const params = new URLSearchParams({
    client_id: options.clientId,
    code: options.code,
    code_verifier: options.codeVerifier,
    redirect_uri: options.redirectUri,
    grant_type: 'authorization_code',
  });
  return postTokenRequest(params, options.fetcher ?? fetch,
    options.now ?? Date.now());
}

export async function refreshGoogleAccessToken(options: {
  clientId: string;
  refreshToken: string;
  fetcher?: FetchLike;
  now?: number;
}): Promise<GoogleOAuthCredentialSet> {
  validateClientId(options.clientId);
  if (!options.refreshToken || options.refreshToken.length > 16384) {
    throw new Error('A valid Google refresh token is required.');
  }
  const params = new URLSearchParams({
    client_id: options.clientId,
    refresh_token: options.refreshToken,
    grant_type: 'refresh_token',
  });
  return postTokenRequest(params, options.fetcher ?? fetch,
    options.now ?? Date.now(), options.refreshToken);
}
