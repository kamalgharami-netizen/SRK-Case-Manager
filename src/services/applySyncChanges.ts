import type { SyncEnvelope } from './driveSyncProtocol';
import type { TrackedCompany } from './companyChangeTracker';

type JsonRecord = Record<string, unknown>;
const COLLECTIONS = new Set([
  'cases', 'parties', 'causeList', 'vaultFiles', 'sampleDrafts',
  'financialEntries', 'partyLedgerEntries', 'officeAccounts', 'accountTransactions',
]);
const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const getField = (company: TrackedCompany, key: string): unknown =>
  (company as unknown as Record<string, unknown>)[key];

export interface ApplySyncResult<T extends TrackedCompany> {
  companies: T[];
  applied: number;
  skipped: number;
  manualReview: number;
  appliedChangeIds: string[];
  skippedChangeIds: string[];
}

/**
 * Applies only validated, record-scoped changes to an in-memory company list.
 * Workspace deletion is never automatic. Callers should persist the returned
 * list only after the user explicitly approves applying staged inbox changes.
 */
export function applySyncEnvelopes<T extends TrackedCompany>(
  current: readonly T[],
  changes: readonly SyncEnvelope<unknown>[]
): ApplySyncResult<T> {
  let companies = [...current];
  let applied = 0;
  let skipped = 0;
  let manualReview = 0;
  const appliedChangeIds: string[] = [];
  const skippedChangeIds: string[] = [];

  for (const change of changes) {
    const appliedBefore = applied;
    const skippedBefore = skipped;
    if (!change || change.schemaVersion !== 1 || !change.companyId ||
        !change.recordId || !change.changeId || !Number.isFinite(change.updatedAt) ||
        typeof change.deleted !== 'boolean' ||
        (change.deleted ? change.payload !== null : change.payload === null || change.payload === undefined)) {
      skipped += 1;
      continue;
    }

    const companyIndex = companies.findIndex(company => company.id === change.companyId);
    if (companyIndex < 0) { skipped += 1; skippedChangeIds.push(change.changeId); continue; }
    const company = companies[companyIndex];

    if (change.recordId === 'company_workspace') {
      manualReview += 1;
      continue;
    }

    if (change.recordId === 'company_profile') {
      if (change.deleted || !isRecord(change.payload)) { skipped += 1; continue; }
      const allowed = ['name', 'type', 'barCouncil', 'gst', 'address', 'city', 'state', 'pin', 'phone', 'email', 'logoUrl', 'logoBadge', 'logoColor'];
      const profile = Object.fromEntries(Object.entries(change.payload).filter(([key]) => allowed.includes(key)));
      companies[companyIndex] = { ...company, ...profile } as T;
      applied += 1;
      continue;
    }

    const separator = change.recordId.indexOf(':');
    if (separator <= 0) { skipped += 1; continue; }
    const collection = change.recordId.slice(0, separator);
    const recordId = change.recordId.slice(separator + 1);

    if (collection === 'diary') {
      const diary = isRecord(getField(company, 'diaryData')) ? getField(company, 'diaryData') as Record<string, unknown> : {};
      if (change.deleted) {
        let found = false;
        const nextDiary = Object.fromEntries(Object.entries(diary).map(([caseId, entries]) => {
          if (!Array.isArray(entries)) return [caseId, entries];
          const next = entries.filter(item => !(isRecord(item) && item.id === recordId));
          if (next.length !== entries.length) found = true;
          return [caseId, next];
        }));
        if (!found) { skipped += 1; continue; }
        companies[companyIndex] = { ...company, diaryData: nextDiary } as T;
        applied += 1;
        continue;
      }
      if (!isRecord(change.payload) || typeof change.payload.caseId !== 'string' ||
          !isRecord(change.payload.item) || change.payload.item.id !== recordId) {
        skipped += 1; continue;
      }
      const caseId = change.payload.caseId;
      // A diary entry has one stable ID and must belong to only one case.
      // Remove it from every old case before inserting the incoming version.
      const nextDiary = Object.fromEntries(Object.entries(diary).map(([existingCaseId, entries]) => [
        existingCaseId,
        Array.isArray(entries)
          ? entries.filter(entry => !(isRecord(entry) && entry.id === recordId))
          : entries,
      ]));
      const existing = Array.isArray(nextDiary[caseId]) ? nextDiary[caseId] as unknown[] : [];
      nextDiary[caseId] = [change.payload.item, ...existing];
      companies[companyIndex] = { ...company, diaryData: nextDiary } as T;
      applied += 1;
      continue;
    }

    if (!COLLECTIONS.has(collection)) { skipped += 1; continue; }
    const existing = Array.isArray(getField(company, collection)) ? getField(company, collection) as unknown[] : [];
    if (change.deleted) {
      const next = existing.filter(item => !(isRecord(item) && item.id === recordId));
      if (next.length === existing.length) { skipped += 1; continue; }
      companies[companyIndex] = { ...company, [collection]: next } as T;
      applied += 1;
      continue;
    }
    if (!isRecord(change.payload) || change.payload.collection !== collection ||
        !isRecord(change.payload.item) || change.payload.item.id !== recordId) {
      skipped += 1; continue;
    }
    const item = change.payload.item;
    companies[companyIndex] = {
      ...company,
      [collection]: [item, ...existing.filter(entry => !(isRecord(entry) && entry.id === recordId))],
    } as T;
    applied += 1;
    if (applied > appliedBefore) appliedChangeIds.push(change.changeId);
    else if (skipped > skippedBefore) skippedChangeIds.push(change.changeId);
  }

  return { companies, applied, skipped, manualReview, appliedChangeIds, skippedChangeIds };
}
