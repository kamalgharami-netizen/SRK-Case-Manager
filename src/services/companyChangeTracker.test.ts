import test from 'node:test';
import assert from 'node:assert/strict';
import { collectCompanyChanges, createSyncEnvelopes } from './companyChangeTracker';

test('detects added and edited records without including user credentials', () => {
  const previous = [{ id: 'co1', name: 'Chamber', users: [{ id: 'u1', password: 'secret' }], cases: [] }];
  const current = [{ id: 'co1', name: 'Updated Chamber', users: [{ id: 'u1', password: 'changed-secret' }], cases: [{ id: 'case1', caseNo: '12/26' }] }];
  const changes = collectCompanyChanges(previous, current);
  assert.equal(changes.length, 2);
  assert.ok(changes.some(change => change.recordId === 'company_profile'));
  assert.ok(changes.some(change => change.recordId === 'cases:case1'));
  assert.equal(JSON.stringify(changes).includes('secret'), false);
});

test('detects record deletion as a tombstone', () => {
  const previous = [{ id: 'co1', cases: [{ id: 'case1', caseNo: '12/26' }] }];
  const current = [{ id: 'co1', cases: [] }];
  const changes = collectCompanyChanges(previous, current);
  assert.deepEqual(changes, [{
    recordId: 'cases:case1',
    companyId: 'co1',
    deleted: true,
    payload: null,
  }]);
});

test('tracks nested diary additions and deletions by entry ID', () => {
  const previous = [{ id: 'co1', diaryData: { case1: [{ id: 'd1', title: 'Old' }] } }];
  const current = [{ id: 'co1', diaryData: { case1: [{ id: 'd2', title: 'New' }] } }];
  const changes = collectCompanyChanges(previous, current);
  assert.ok(changes.some(change => change.recordId === 'diary:d2' && !change.deleted));
  assert.ok(changes.some(change => change.recordId === 'diary:d1' && change.deleted));
});

test('tracks workspace deletion without emitting a whole-database replacement', () => {
  const changes = collectCompanyChanges([{ id: 'co1', name: 'Chamber' }], []);
  assert.deepEqual(changes, [{
    recordId: 'company_workspace',
    companyId: 'co1',
    deleted: true,
    payload: null,
  }]);
});

test('creates valid envelopes with unique change identifiers', () => {
  const changes = [
    { recordId: 'cases:1', companyId: 'co1', deleted: false, payload: { id: '1' } },
    { recordId: 'cases:2', companyId: 'co1', deleted: true, payload: null },
  ];
  const envelopes = createSyncEnvelopes(changes, 'device_1234567890123456', 1000);
  assert.equal(envelopes.length, 2);
  assert.notEqual(envelopes[0].changeId, envelopes[1].changeId);
  assert.equal(envelopes[1].payload, null);
  assert.equal(envelopes[1].updatedAt, 1001);
});
