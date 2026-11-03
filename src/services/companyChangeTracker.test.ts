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


test('tracks the custom chain deed template without syncing private workspace data', () => {
  const previous = [{
    id: 'co1',
    name: 'Chamber',
    chainSampleTemplate: 'Old template',
    users: [{ id: 'u1', password: 'private-password' }],
    messages: [{ id: 'm1', body: 'private message' }],
    activityLog: [{ id: 'a1', action: 'private activity' }],
  }];
  const current = [{
    id: 'co1',
    name: 'Chamber',
    chainSampleTemplate: 'Updated template',
    users: [{ id: 'u1', password: 'new-private-password' }],
    messages: [{ id: 'm1', body: 'updated private message' }],
    activityLog: [{ id: 'a1', action: 'updated private activity' }],
  }];

  const changes = collectCompanyChanges(previous, current);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].recordId, 'company_profile');
  assert.deepEqual(changes[0].payload, {
    name: 'Chamber',
    chainSampleTemplate: 'Updated template',
  });
  assert.equal(JSON.stringify(changes).includes('private'), false);
});


test('tracks every supported business collection and its deletions', () => {
  const previous = [{
    id: 'co1',
    parties: [{ id: 'party1', name: 'Old party' }],
    causeList: [{ id: 'cause1', title: 'Old cause' }],
    vaultFiles: [{ id: 'vault1', name: 'old.pdf' }],
    sampleDrafts: [{ id: 'draft1', title: 'Old draft' }],
    financialEntries: [{ id: 'fin1', amount: 100 }],
    partyLedgerEntries: [{ id: 'ledger1', amount: 50 }],
    officeAccounts: [{ id: 'account1', name: 'Cash' }],
    accountTransactions: [{ id: 'txn1', amount: 25 }],
  }];
  const current = [{
    id: 'co1',
    parties: [{ id: 'party1', name: 'Updated party' }],
    causeList: [],
    vaultFiles: [{ id: 'vault1', name: 'new.pdf' }],
    sampleDrafts: [],
    financialEntries: [{ id: 'fin1', amount: 200 }],
    partyLedgerEntries: [],
    officeAccounts: [{ id: 'account1', name: 'Bank' }],
    accountTransactions: [],
  }];

  const changes = collectCompanyChanges(previous, current);
  const byId = new Map(changes.map(change => [change.recordId, change]));
  assert.equal(byId.get('parties:party1')?.deleted, false);
  assert.equal(byId.get('causeList:cause1')?.deleted, true);
  assert.equal(byId.get('vaultFiles:vault1')?.deleted, false);
  assert.equal(byId.get('sampleDrafts:draft1')?.deleted, true);
  assert.equal(byId.get('financialEntries:fin1')?.deleted, false);
  assert.equal(byId.get('partyLedgerEntries:ledger1')?.deleted, true);
  assert.equal(byId.get('officeAccounts:account1')?.deleted, false);
  assert.equal(byId.get('accountTransactions:txn1')?.deleted, true);
  assert.equal(changes.length, 8);
});
