import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSyncEnvelopes, type SyncEnvelope } from './driveSyncProtocol';

const makeEnvelope = (changeId: string, updatedAt: number): SyncEnvelope<{ value: string }> => ({
  schemaVersion: 1,
  deviceId: 'same_device_123456',
  changeId,
  recordId: 'case-1',
  companyId: 'company-1',
  updatedAt,
  deleted: false,
  payload: { value: changeId },
});

test('same-device revisions with equal timestamps are retained as a conflict', () => {
  const first = makeEnvelope('revision-a', 1700000000000);
  const second = makeEnvelope('revision-b', 1700000000000);

  const result = mergeSyncEnvelopes([first], [second]);

  assert.equal(result.conflicts.length, 1);
  assert.equal(result.merged.length, 1);
  assert.equal(result.merged[0].changeId, first.changeId);
  assert.deepEqual(
    new Set([result.conflicts[0].local.changeId, result.conflicts[0].remote.changeId]),
    new Set(['revision-a', 'revision-b'])
  );
});

test('same-device revisions with distinct timestamps keep the later revision', () => {
  const older = makeEnvelope('revision-old', 100);
  const newer = makeEnvelope('revision-new', 200);

  const result = mergeSyncEnvelopes([older], [newer]);

  assert.equal(result.conflicts.length, 0);
  assert.equal(result.merged.length, 1);
  assert.equal(result.merged[0].changeId, newer.changeId);
});
