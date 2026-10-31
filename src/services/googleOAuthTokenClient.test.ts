import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exchangeGoogleAuthorizationCode,
  refreshGoogleAccessToken,
} from './googleOAuthTokenClient.ts';

const response = (payload: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
}) as Response;

test('authorization code exchange uses PKCE and public-client parameters', async () => {
  let request: RequestInit | undefined;
  const credentials = await exchangeGoogleAuthorizationCode({
    clientId: 'desktop-client-id',
    code: 'one-time-code',
    codeVerifier: 'v'.repeat(64),
    redirectUri: 'http://127.0.0.1:43121/oauth2callback',
    now: 1000,
    fetcher: async (url, init) => {
      assert.equal(url, 'https://oauth2.googleapis.com/token');
      request = init;
      return response({ access_token: 'access', refresh_token: 'refresh',
        token_type: 'Bearer', expires_in: 3600, scope: 'drive.file' });
    },
  });
  const body = new URLSearchParams(String(request?.body));
  assert.equal(body.get('code_verifier'), 'v'.repeat(64));
  assert.equal(body.get('grant_type'), 'authorization_code');
  assert.equal(body.has('client_secret'), false);
  assert.equal(credentials.accessToken, 'access');
  assert.equal(credentials.refreshToken, 'refresh');
  assert.equal(credentials.expiresAt, 3601000);
});

test('refresh preserves previous refresh token when provider omits rotation', async () => {
  const credentials = await refreshGoogleAccessToken({
    clientId: 'desktop-client-id',
    refreshToken: 'long-lived-refresh',
    now: 2000,
    fetcher: async (_url, init) => {
      const body = new URLSearchParams(String(init.body));
      assert.equal(body.get('refresh_token'), 'long-lived-refresh');
      return response({ access_token: 'new-access', token_type: 'Bearer',
        expires_in: 1800 });
    },
  });
  assert.equal(credentials.refreshToken, 'long-lived-refresh');
  assert.equal(credentials.expiresAt, 1802000);
});

test('rejects malformed token response and never exposes response body in errors', async () => {
  await assert.rejects(() => exchangeGoogleAuthorizationCode({
    clientId: 'desktop-client-id', code: 'code', codeVerifier: 'v'.repeat(64),
    redirectUri: 'http://127.0.0.1:43121/oauth2callback',
    fetcher: async () => response({ access_token: 'x', token_type: 'MAC', expires_in: 0 }),
  }), /invalid OAuth token fields/);
  await assert.rejects(() => refreshGoogleAccessToken({
    clientId: 'desktop-client-id', refreshToken: 'refresh',
    fetcher: async () => response({ error: 'secret detail' }, 400),
  }), error => {
    assert.match(String(error), /HTTP 400/);
    assert.doesNotMatch(String(error), /secret detail/);
    return true;
  });
});


test('rejects non-loopback or altered callback redirect URIs before network access', async () => {
  let requested = false;
  const fetcher = async () => {
    requested = true;
    return response({ access_token: 'access', token_type: 'Bearer', expires_in: 3600 });
  };
  await assert.rejects(() => exchangeGoogleAuthorizationCode({
    clientId: 'desktop-client-id', code: 'code', codeVerifier: 'v'.repeat(64),
    redirectUri: 'https://example.com/oauth2callback', fetcher,
  }), /registered HTTP loopback callback/);
  await assert.rejects(() => exchangeGoogleAuthorizationCode({
    clientId: 'desktop-client-id', code: 'code', codeVerifier: 'v'.repeat(64),
    redirectUri: 'http://127.0.0.1:43121/other', fetcher,
  }), /registered HTTP loopback callback/);
  assert.equal(requested, false);
});

test('rejects malformed PKCE verifier and unsafe expiry timestamps', async () => {
  const fetcher = async () => response({
    access_token: 'access', token_type: 'Bearer', expires_in: 3600,
  });
  await assert.rejects(() => exchangeGoogleAuthorizationCode({
    clientId: 'desktop-client-id', code: 'code', codeVerifier: 'not-a-valid-verifier',
    redirectUri: 'http://127.0.0.1:43121/oauth2callback', fetcher,
  }), /Invalid Google authorization-code exchange parameters/);
  await assert.rejects(() => refreshGoogleAccessToken({
    clientId: 'desktop-client-id', refreshToken: 'refresh', now: Number.MAX_SAFE_INTEGER + 1,
    fetcher,
  }), /valid current timestamp/);
});
