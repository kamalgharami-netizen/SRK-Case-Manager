/**
 * PKCE primitives for the Windows installed-app OAuth flow.
 *
 * This module only prepares and validates an authorization request. It does
 * not open a browser, receive a callback, exchange codes, or enable sync.
 */
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export interface GooglePkceRequest {
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
}

function randomUrlSafeString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function assertWindowsLoopbackRedirect(redirectUri: string): void {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    throw new Error('A valid Windows loopback redirect URI is required.');
  }
  const isLoopbackHost = parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]';
  const hasDynamicPort = Boolean(parsed.port);
  if (parsed.protocol !== 'http:' || !isLoopbackHost || !hasDynamicPort ||
      parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Windows OAuth redirect must use an HTTP loopback IP address and an explicit port.');
  }
}

export function createGoogleOAuthState(): string {
  return randomUrlSafeString(32);
}

export async function createWindowsGooglePkceRequest(options: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
}): Promise<GooglePkceRequest> {
  if (!options.clientId?.trim()) throw new Error('A Windows Desktop OAuth client ID is required.');
  if (!Array.isArray(options.scopes) || options.scopes.length === 0 ||
      options.scopes.some(scope => typeof scope !== 'string' || !scope.trim())) {
    throw new Error('At least one valid OAuth scope is required.');
  }
  assertWindowsLoopbackRedirect(options.redirectUri);

  const codeVerifier = randomUrlSafeString(64);
  const state = options.state ?? createGoogleOAuthState();
  if (typeof state !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/.test(state)) {
    throw new Error('A valid cryptographically random OAuth state is required.');
  }
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );
  const codeChallenge = encodeBase64Url(new Uint8Array(digest));

  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.search = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: options.scopes.join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  }).toString();

  return { authorizationUrl: url.toString(), state, codeVerifier };
}

export function isMatchingGoogleOAuthState(expected: string, received: string): boolean {
  return typeof expected === 'string' && expected.length >= 32 &&
    typeof received === 'string' && received.length > 0 && expected === received;
}
