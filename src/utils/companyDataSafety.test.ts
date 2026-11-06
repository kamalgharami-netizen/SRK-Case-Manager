import test from 'node:test';
import assert from 'node:assert/strict';
import { companyHasUserCreatedData } from './companyDataSafety';

test('retains demo-named workspaces containing financial records', () => {
  assert.equal(companyHasUserCreatedData({
    name: 'Demo Company',
    financialEntries: [{ id: 'income-1', amount: 500 }],
  }), true);
});

test('retains workspaces containing every supported user-record collection', () => {
  const fields = [
    'cases', 'parties', 'users', 'causeList', 'vaultFiles', 'activityLog',
    'sampleDrafts', 'financialEntries', 'partyLedgerEntries', 'officeAccounts',
    'accountTransactions', 'messages',
  ];
  for (const field of fields) {
    assert.equal(companyHasUserCreatedData({ [field]: [{ id: 'user-record' }] }), true, field);
  }
});

test('retains diary entries and custom company information', () => {
  assert.equal(companyHasUserCreatedData({ diaryData: { 'case-1': [{ id: 'd1' }] } }), true);
  assert.equal(companyHasUserCreatedData({ chainSampleTemplate: 'Custom legal template' }), true);
  assert.equal(companyHasUserCreatedData({ address: 'User-entered address' }), true);
});

test('does not classify empty demo/sample workspaces as containing user data', () => {
  assert.equal(companyHasUserCreatedData({ name: 'Demo Company', cases: [], parties: [], users: [] }), false);
  assert.equal(companyHasUserCreatedData({ name: 'Sample Company', diaryData: {} }), false);
});

test('handles malformed and non-object values safely', () => {
  assert.equal(companyHasUserCreatedData(null), false);
  assert.equal(companyHasUserCreatedData('not a workspace'), false);
  assert.equal(companyHasUserCreatedData([]), false);
});
