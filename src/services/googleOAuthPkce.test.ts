import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGoogleOAuthState,
  createWindowsGooglePkceRequest,
  isMatchingGoogleOAuthState,
} from './googleOAuthPkce.ts';

test('generates a cryptographically random URL-safe OAuth state', () => {
  const first = createGoogleOAuthState();
  const second = createGoogleOAuthState();
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.equal(isMatchingGoogleOAuthState(first, first), true);
  assert.equal(isMatchingGoogleOAuthState(first, second), false);
});

test('builds a Windows authorization request with caller-matched state and PKCE S256', async () => {
  const state = createGoogleOAuthState();
  const request = await createWindowsGooglePkceRequest({
    clientId: 'windows-desktop-client-id',
    redirectUri: 'http://127.0.0.1:43121/oauth2callback',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    state,
  });
  const url = new URL(request.authorizationUrl);
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.equal(url.searchParams.get('client_id'), 'windows-desktop-client-id');
  assert.equal(url.searchParams.get('redirect_uri'), 'http://127.0.0.1:43121/oauth2callback');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('state'), state);
  assert.match(url.searchParams.get('code_challenge') || '', /^[A-Za-z0-9_-]{43}$/);
  assert.match(request.codeVerifier, /^[A-Za-z0-9_-]{86}$/);
});

test('rejects an invalid caller-supplied OAuth state', async () => {
  await assert.rejects(() => createWindowsGooglePkceRequest({
    clientId: 'windows-desktop-client-id',
    redirectUri: 'http://127.0.0.1:43121/oauth2callback',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    state: 'short',
  }), /cryptographically random OAuth state/);
});
