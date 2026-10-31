import test from 'node:test';
import assert from 'node:assert/strict';
import { getValidGoogleAccessToken } from './googleOAuthSession.ts';
import type { StoredGoogleOAuthCredentials } from './secureGoogleTokenStore';

const valid: StoredGoogleOAuthCredentials = {
  accessToken: 'old-access', refreshToken: 'refresh-token',
  tokenType: 'Bearer', expiresAt: 1000, scope: 'drive.file',
};

function store(initial: StoredGoogleOAuthCredentials | null) {
  let value = initial;
  let deleted = false;
  return {
    api: {
      get: async (): Promise<StoredGoogleOAuthCredentials | null> => value,
      set: async (next: StoredGoogleOAuthCredentials): Promise<void> => { value = next; },
      delete: async (): Promise<void> => { value = null; deleted = true; },
    },
    current: () => value,
    wasDeleted: () => deleted,
  };
}

test('returns unexpired token without refreshing', async () => {
  const s = store({ ...valid, expiresAt: 500000 });
  const token = await getValidGoogleAccessToken({ store: s.api, clientId: 'client', now: () => 1000 });
  assert.equal(token, 'old-access');
});

test('refreshes expiring token and persists rotated credentials securely', async () => {
  const s = store(valid);
  const token = await getValidGoogleAccessToken({
    store: s.api, clientId: 'client', now: () => 1000,
    refresh: async () => ({ ...valid, accessToken: 'new-access', refreshToken: 'rotated', expiresAt: 900000 }),
  });
  assert.equal(token, 'new-access');
  assert.equal(s.current()?.refreshToken, 'rotated');
});

test('clears expired credentials when no refresh token exists', async () => {
  const s = store({ ...valid, refreshToken: null, expiresAt: 1000 });
  await assert.rejects(() => getValidGoogleAccessToken({
    store: s.api, clientId: 'client', now: () => 1000,
  }), /Reconnect Google Drive/);
  assert.equal(s.wasDeleted(), true);
});

test('does not discard credentials on transient refresh failure', async () => {
  const s = store(valid);
  await assert.rejects(() => getValidGoogleAccessToken({
    store: s.api, clientId: 'client', now: () => 1000,
    refresh: async () => { throw new Error('network unavailable'); },
  }), /network unavailable/);
  assert.equal(s.current()?.refreshToken, 'refresh-token');
});
