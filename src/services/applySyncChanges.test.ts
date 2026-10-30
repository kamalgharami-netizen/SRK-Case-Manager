import test from 'node:test';
import assert from 'node:assert/strict';
import { applySyncEnvelopes } from './applySyncChanges';

const envelope = (recordId: string, payload: unknown, deleted = false, companyId = 'company1') => ({
  schemaVersion: 1 as const, deviceId: 'device_1234567890123456',
  changeId: 'change_' + recordId, recordId, companyId, updatedAt: 100,
  deleted, payload: deleted ? null : payload,
});

test('applies a validated collection record without replacing other records', () => {
  const initial = [{ id: 'company1', cases: [{ id: 'case-old' }, { id: 'case1', title: 'old' }] }];
  const result = applySyncEnvelopes(initial, [
    envelope('cases:case1', { collection: 'cases', item: { id: 'case1', title: 'remote' } }),
  ]);
  assert.equal(result.applied, 1);
  assert.deepEqual(result.companies[0].cases, [{ id: 'case1', title: 'remote' }, { id: 'case-old' }]);
});

test('applies record tombstones only to the matching collection record', () => {
  const initial = [{ id: 'company1', parties: [{ id: 'p1' }, { id: 'p2' }] }];
  const result = applySyncEnvelopes(initial, [envelope('parties:p1', null, true)]);
  assert.equal(result.applied, 1);
  assert.deepEqual(result.companies[0].parties, [{ id: 'p2' }]);
});

test('updates diary entries and deletes them by stable entry ID', () => {
  const initial = [{ id: 'company1', diaryData: { case1: [{ id: 'd1', title: 'old' }] } }];
  const updated = applySyncEnvelopes(initial, [
    envelope('diary:d1', { caseId: 'case2', item: { id: 'd1', title: 'new' } }),
  ]);
  assert.deepEqual(updated.companies[0].diaryData, { case1: [], case2: [{ id: 'd1', title: 'new' }] });
  const deleted = applySyncEnvelopes(updated.companies, [envelope('diary:d1', null, true)]);
  assert.deepEqual(deleted.companies[0].diaryData, { case1: [], case2: [] });
});

test('never automatically deletes a company workspace', () => {
  const initial = [{ id: 'company1', cases: [{ id: 'c1' }] }];
  const result = applySyncEnvelopes(initial, [envelope('company_workspace', null, true)]);
  assert.equal(result.manualReview, 1);
  assert.equal(result.applied, 0);
  assert.equal(result.companies.length, 1);
});

test('rejects malformed payloads and ignores unknown companies', () => {
  const initial = [{ id: 'company1', cases: [] }];
  const result = applySyncEnvelopes(initial, [
    envelope('cases:c1', { collection: 'parties', item: { id: 'c1' } }),
    envelope('cases:c2', { collection: 'cases', item: { id: 'c2' } }, false, 'missing-company'),
  ]);
  assert.equal(result.skipped, 2);
  assert.deepEqual(result.companies[0].cases, []);
});
