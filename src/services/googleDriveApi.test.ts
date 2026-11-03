import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteDriveFile,
  downloadDriveJson,
  getDriveFileMetadata,
  GoogleDriveError,
  listDriveFiles,
  uploadDriveJson,
} from './googleDriveApi';

function jsonResponse(value: unknown, status = 200, statusText = 'OK'): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function withFetch(
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

test('rejects missing access tokens and required file or folder IDs before network access', async () => {
  let calls = 0;
  await withFetch(() => {
    calls += 1;
    return jsonResponse({});
  }, async () => {
    await assert.rejects(getDriveFileMetadata({ accessToken: '', fileId: 'file-1' }), /access token is required/);
    await assert.rejects(getDriveFileMetadata({ accessToken: 'token', fileId: '' }), /file ID is required/);
    await assert.rejects(listDriveFiles({ accessToken: 'token', parentId: '' }), /selected Drive folder is required/);
    await assert.rejects(downloadDriveJson({ accessToken: 'token', fileId: '' }), /file ID is required/);
    await assert.rejects(deleteDriveFile({ accessToken: 'token', fileId: '' }), /file ID is required/);
  });
  assert.equal(calls, 0);
});

test('escapes Drive query values and sends the bearer token when listing files', async () => {
  await withFetch((url, init) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('q'),
      "'folder\\'\\\\id' in parents and trashed = false and name = 'registry\\'\\\\v1.json'");
    assert.equal(init?.headers && (init.headers as Record<string, string>).Authorization, 'Bearer token');
    assert.equal(parsed.searchParams.get('pageToken'), 'next-page');
    return jsonResponse({ files: [{ id: 'file-1', name: 'registry.json', mimeType: 'application/json' }] });
  }, async () => {
    const result = await listDriveFiles({
      accessToken: 'token',
      parentId: "folder'\\id",
      name: "registry'\\v1.json",
      pageToken: 'next-page',
    });
    assert.equal(result.files.length, 1);
    assert.equal(result.files[0].id, 'file-1');
  });
});

test('creates a JSON Drive file with the selected parent and payload', async () => {
  await withFetch((url, init) => {
    assert.match(url, /uploadType=multipart/);
    assert.equal(init?.method, 'POST');
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, 'Bearer token');
    const boundary = headers['Content-Type'].match(/boundary=(.+)$/)?.[1];
    assert.ok(boundary);
    const body = String(init?.body);
    assert.match(body, new RegExp('name":"case-data.json"'));
    assert.match(body, new RegExp('parents":\\["folder-1"\\]'));
    assert.match(body, /"caseId":"case-123"/);
    return jsonResponse({ id: 'created-1', name: 'case-data.json', mimeType: 'application/json' });
  }, async () => {
    const result = await uploadDriveJson({
      accessToken: 'token',
      parentId: 'folder-1',
      name: 'case-data.json',
    }, { caseId: 'case-123' });
    assert.equal(result.id, 'created-1');
  });
});

test('updates an existing JSON Drive file without changing its parent', async () => {
  await withFetch((url, init) => {
    assert.ok(url.includes('/files/existing-1?uploadType=multipart'));
    assert.equal(init?.method, 'PATCH');
    const body = String(init?.body);
    assert.match(body, /"caseId":"updated"/);
    assert.doesNotMatch(body, /"parents":/);
    return jsonResponse({ id: 'existing-1', name: 'case-data.json', mimeType: 'application/json' });
  }, async () => {
    const result = await uploadDriveJson({
      accessToken: 'token',
      parentId: 'folder-1',
      name: 'case-data.json',
    }, { caseId: 'updated' }, 'existing-1');
    assert.equal(result.id, 'existing-1');
  });
});

test('preserves Google Drive HTTP status and API error reason', async () => {
  await withFetch(() => jsonResponse({
    error: { message: 'Permission denied', errors: [{ reason: 'insufficientFilePermissions' }] },
  }, 403, 'Forbidden'), async () => {
    await assert.rejects(
      getDriveFileMetadata({ accessToken: 'token', fileId: 'file-1' }),
      (error: unknown) => {
        assert.ok(error instanceof GoogleDriveError);
        assert.equal(error.status, 403);
        assert.equal(error.reason, 'insufficientFilePermissions');
        assert.equal(error.message, 'Permission denied');
        return true;
      },
    );
  });
});

test('accepts a successful empty-body delete response', async () => {
  await withFetch((url, init) => {
    assert.ok(url.endsWith('/files/file-1'));
    assert.equal(init?.method, 'DELETE');
    return new Response(null, { status: 204 });
  }, async () => {
    await assert.doesNotReject(deleteDriveFile({ accessToken: 'token', fileId: 'file-1' }));
  });
});
