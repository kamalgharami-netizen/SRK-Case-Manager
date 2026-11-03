import test from 'node:test';
import assert from 'node:assert/strict';
import { registerCurrentGoogleDriveDevice } from './googleDriveDeviceRegistry';

const folder = {
  id: 'folder-1',
  name: 'SRK Data',
  mimeType: 'application/vnd.google-apps.folder',
  parents: [],
};

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function withDriveFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
  run: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init)) as typeof fetch;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('stops device registration when the selected Drive item is not a folder', async () => {
  const requests: string[] = [];
  await withDriveFetch((url) => {
    requests.push(url);
    if (url.includes('openidconnect.googleapis.com')) {
      return jsonResponse({ sub: 'google-subject-1' });
    }
    if (url.includes('/files/folder-1?')) {
      return jsonResponse({ ...folder, mimeType: 'application/pdf' });
    }
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    await assert.rejects(
      registerCurrentGoogleDriveDevice({
        accessToken: 'access-token',
        folderId: 'folder-1',
        storage: { getItem: () => null, setItem: () => undefined },
      }),
      /no longer a folder/,
    );
  });
  assert.equal(requests.some(url => url.includes('/files?')), false);
  assert.equal(requests.some(url => url.includes('upload/drive')), false);
});

test('fails closed when duplicate device registries exist in the selected folder', async () => {
  const requests: string[] = [];
  await withDriveFetch((url) => {
    requests.push(url);
    if (url.includes('openidconnect.googleapis.com')) {
      return jsonResponse({ sub: 'google-subject-1' });
    }
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) {
      return jsonResponse({
        files: [
          { id: 'registry-a', name: 'srk-device-registry-v1.json', mimeType: 'application/json' },
          { id: 'registry-b', name: 'srk-device-registry-v1.json', mimeType: 'application/json' },
        ],
      });
    }
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    await assert.rejects(
      registerCurrentGoogleDriveDevice({
        accessToken: 'access-token',
        folderId: 'folder-1',
        storage: { getItem: () => null, setItem: () => undefined },
      }),
      /Multiple SRK device registries/,
    );
  });
  assert.equal(requests.some(url => url.includes('upload/drive')), false);
});

test('does not upload changes when an existing registry belongs to another Google account', async () => {
  const requests: string[] = [];
  const foreignRegistry = {
    schemaVersion: 1,
    ownerAccountId: 'different-google-subject',
    folderId: 'folder-1',
    updatedAt: 100,
    devices: [],
  };
  await withDriveFetch((url) => {
    requests.push(url);
    if (url.includes('openidconnect.googleapis.com')) {
      return jsonResponse({ sub: 'google-subject-1' });
    }
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) {
      return jsonResponse({
        files: [{ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json' }],
      });
    }
    if (url.includes('/files/registry-1?') && !url.includes('alt=media')) {
      return jsonResponse({
        id: 'registry-1',
        name: 'srk-device-registry-v1.json',
        mimeType: 'application/json',
        parents: ['folder-1'],
      });
    }
    if (url.includes('/files/registry-1?alt=media')) return jsonResponse(foreignRegistry);
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    await assert.rejects(
      registerCurrentGoogleDriveDevice({
        accessToken: 'access-token',
        folderId: 'folder-1',
        storage: { getItem: () => null, setItem: () => undefined },
      }),
      /different Google account or folder/,
    );
  });
  assert.equal(requests.some(url => url.includes('upload/drive')), false);
});
