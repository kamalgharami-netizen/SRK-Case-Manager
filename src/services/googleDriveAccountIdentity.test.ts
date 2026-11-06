import test from 'node:test';
import assert from 'node:assert/strict';
import { getGoogleDriveAccountIdentity } from './googleDriveAccountIdentity';

test('resolves the stable Google subject and optional email without persisting either', async () => {
  const originalFetch = globalThis.fetch;
  let requestAuthorization = '';
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestAuthorization = new Headers(init?.headers).get('Authorization') || '';
    return new Response(JSON.stringify({ sub: 'opaque-google-subject-123', email: 'customer@example.com' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  try {
    const result = await getGoogleDriveAccountIdentity('temporary-access-token');
    assert.deepEqual(result, { accountId: 'opaque-google-subject-123', email: 'customer@example.com' });
    assert.equal(requestAuthorization, 'Bearer temporary-access-token');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects missing tokens and unsuccessful Google identity responses', async () => {
  await assert.rejects(getGoogleDriveAccountIdentity(''), /access token is required/);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response('{}', { status: 401 })) as typeof fetch;
  try {
    await assert.rejects(getGoogleDriveAccountIdentity('expired-token'), /permission is missing or expired/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects an identity response without a stable subject', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ email: 'customer@example.com' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;
  try {
    await assert.rejects(getGoogleDriveAccountIdentity('token'), /valid account identity/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
