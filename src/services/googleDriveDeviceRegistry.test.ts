import test from 'node:test';
import assert from 'node:assert/strict';
import { listRegisteredGoogleDriveDevices, registerCurrentGoogleDriveDevice, revokeGoogleDriveDevice } from './googleDriveDeviceRegistry';

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



test('fails closed when an existing registry response omits its parent folder', async () => {
  const requests: string[] = [];
  await withDriveFetch((url) => {
    requests.push(url);
    if (url.includes('openidconnect.googleapis.com')) return jsonResponse({ sub: 'google-subject-1' });
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
      /outside the selected SRK data folder/,
    );
  });
  assert.equal(requests.some(url => url.includes('alt=media')), false);
  assert.equal(requests.some(url => url.includes('/upload/drive')), false);
});


test('registers a new device and creates one account-bound registry in the selected folder', async () => {
  const requests: Array<{ url: string; method: string; body?: string }> = [];
  const deviceId = 'srk_00000000000000000000000000000001';
  await withDriveFetch((url, init) => {
    requests.push({ url, method: init?.method || 'GET', body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.includes('openidconnect.googleapis.com')) {
      return jsonResponse({ sub: 'google-subject-1', email: 'owner@example.com' });
    }
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) return jsonResponse({ files: [] });
    if (url.includes('/upload/drive/v3/files?')) {
      return jsonResponse({ id: 'created-registry', name: 'srk-device-registry-v1.json', mimeType: 'application/json', parents: ['folder-1'] });
    }
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    const result = await registerCurrentGoogleDriveDevice({
      accessToken: 'access-token',
      folderId: 'folder-1',
      storage: {
        getItem: (key: string) => key === 'srk_sync_device_id_v1' ? deviceId : null,
        setItem: () => undefined,
      },
    });
    assert.equal(result.deviceId, deviceId);
    assert.equal(result.activeDeviceCount, 1);
    assert.equal(result.alreadyRegistered, false);
    assert.equal(result.accountEmail, 'owner@example.com');
    assert.equal(result.registry.ownerAccountId, 'google-subject-1');
    assert.equal(result.registry.folderId, 'folder-1');
    assert.equal(result.registry.devices[0].deviceId, deviceId);
    assert.equal(result.registry.devices[0].revokedAt, null);
  });
  const upload = requests.find(request => request.url.includes('/upload/drive/v3/files?'));
  assert.ok(upload, 'expected exactly one registry creation upload');
  assert.equal(upload?.method, 'POST');
  assert.equal(requests.filter(request => request.url.includes('/upload/drive/v3/files?')).length, 1);
  assert.match(upload?.body || '', /google-subject-1/);
  assert.match(upload?.body || '', /srk-device-registry-v1\.json/);
});

test('refuses to reactivate a revoked installation and does not upload registry changes', async () => {
  const requests: string[] = [];
  const deviceId = 'srk_00000000000000000000000000000002';
  const revokedRegistry = {
    schemaVersion: 1,
    ownerAccountId: 'google-subject-1',
    folderId: 'folder-1',
    updatedAt: 200,
    devices: [{
      deviceId,
      platform: 'unknown',
      label: 'SRK device',
      appVersion: '5.4.1',
      registeredAt: 100,
      lastSeenAt: 100,
      revokedAt: 150,
    }],
  };
  await withDriveFetch((url) => {
    requests.push(url);
    if (url.includes('openidconnect.googleapis.com')) return jsonResponse({ sub: 'google-subject-1' });
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) {
      return jsonResponse({ files: [{ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json' }] });
    }
    if (url.includes('/files/registry-1?') && !url.includes('alt=media')) {
      return jsonResponse({ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json', parents: ['folder-1'] });
    }
    if (url.includes('/files/registry-1?alt=media')) return jsonResponse(revokedRegistry);
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    await assert.rejects(
      registerCurrentGoogleDriveDevice({
        accessToken: 'access-token',
        folderId: 'folder-1',
        storage: { getItem: () => deviceId, setItem: () => undefined },
      }),
      /device was revoked/,
    );
  });
  assert.equal(requests.some(url => url.includes('/upload/drive/v3/files')), false);
});


test('lists registered devices only for the matching Google account and selected folder', async () => {
  const registered = {
    schemaVersion: 1,
    ownerAccountId: 'google-subject-1',
    folderId: 'folder-1',
    updatedAt: 200,
    devices: [{
      deviceId: 'srk_00000000000000000000000000000003',
      platform: 'windows',
      label: 'Windows desktop',
      appVersion: '5.4.1',
      registeredAt: 100,
      lastSeenAt: 200,
      revokedAt: null,
    }],
  };
  await withDriveFetch((url) => {
    if (url.includes('openidconnect.googleapis.com')) return jsonResponse({ sub: 'google-subject-1' });
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) {
      return jsonResponse({ files: [{ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json' }] });
    }
    if (url.includes('/files/registry-1?alt=media')) return jsonResponse(registered);
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    const result = await listRegisteredGoogleDriveDevices({ accessToken: 'access-token', folderId: 'folder-1' });
    assert.equal(result.devices.length, 1);
    assert.equal(result.devices[0].deviceId, registered.devices[0].deviceId);
  });
});

test('revokes a device by updating the shared registry without deleting its audit entry', async () => {
  const requests: Array<{ url: string; method: string; body?: string }> = [];
  const registered = {
    schemaVersion: 1,
    ownerAccountId: 'google-subject-1',
    folderId: 'folder-1',
    updatedAt: 200,
    devices: [{
      deviceId: 'srk_00000000000000000000000000000004',
      platform: 'android',
      label: 'Android device',
      appVersion: '5.4.1',
      registeredAt: 100,
      lastSeenAt: 200,
      revokedAt: null,
    }],
  };
  await withDriveFetch((url, init) => {
    requests.push({ url, method: init?.method || 'GET', body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.includes('openidconnect.googleapis.com')) return jsonResponse({ sub: 'google-subject-1' });
    if (url.includes('/files/folder-1?')) return jsonResponse(folder);
    if (url.includes('/files?')) {
      return jsonResponse({ files: [{ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json' }] });
    }
    if (url.includes('/files/registry-1?alt=media')) return jsonResponse(registered);
    if (url.includes('/upload/drive/v3/files/registry-1?')) {
      return jsonResponse({ id: 'registry-1', name: 'srk-device-registry-v1.json', mimeType: 'application/json' });
    }
    throw new Error('Unexpected Drive request: ' + url);
  }, async () => {
    const result = await revokeGoogleDriveDevice({
      accessToken: 'access-token',
      folderId: 'folder-1',
      deviceId: registered.devices[0].deviceId,
    });
    assert.equal(result.devices.length, 1);
    assert.notEqual(result.devices[0].revokedAt, null);
    assert.ok(Number.isFinite(result.devices[0].revokedAt));
  });
  const update = requests.find(request => request.url.includes('/upload/drive/v3/files/registry-1?'));
  assert.ok(update, 'expected registry update request');
  assert.equal(update?.method, 'PATCH');
  assert.match(update?.body || '', /"revokedAt":\d+/);
  assert.equal(requests.some(request => request.method === 'DELETE'), false);
});
