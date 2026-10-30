import type { SyncEnvelope } from './driveSyncProtocol';

type JsonRecord = Record<string, unknown>;

const COLLECTIONS = [
  'cases',
  'parties',
  'causeList',
  'vaultFiles',
  'sampleDrafts',
  'financialEntries',
  'partyLedgerEntries',
  'officeAccounts',
  'accountTransactions',
] as const;

export interface TrackedCompany {
  id: string;
}

const getField = (company: TrackedCompany | undefined, key: string): unknown =>
  company ? (company as unknown as Record<string, unknown>)[key] : undefined;

export interface CompanySnapshotChange<T = unknown> {
  recordId: string;
  companyId: string;
  deleted: boolean;
  payload: T | null;
}

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Calculates record-level local changes between two AppContext snapshots.
 * User credentials, messages, activity logs and app preferences are
 * deliberately excluded from the sync payload.
 */
export function collectCompanyChanges<T extends TrackedCompany>(
  previous: readonly T[],
  current: readonly T[]
): CompanySnapshotChange[] {
  const changes: CompanySnapshotChange[] = [];
  const previousCompanies = new Map(previous.map(company => [company.id, company]));
  const currentCompanies = new Map(current.map(company => [company.id, company]));

  for (const [companyId, nextCompany] of currentCompanies) {
    const oldCompany = previousCompanies.get(companyId);

    // Company profile only; never include users or other private collections.
    const profileKeys = ['name', 'type', 'barCouncil', 'gst', 'address', 'city', 'state', 'pin', 'phone', 'email', 'logoUrl', 'logoBadge', 'logoColor'];
    const profile = Object.fromEntries(profileKeys
      .filter(key => Object.prototype.hasOwnProperty.call(nextCompany, key))
      .map(key => [key, getField(nextCompany, key)]));
    const oldProfile = oldCompany ? Object.fromEntries(profileKeys
      .filter(key => Object.prototype.hasOwnProperty.call(oldCompany, key))
      .map(key => [key, getField(oldCompany, key)])) : null;

    if (!oldCompany || stableJson(oldProfile) !== stableJson(profile)) {
      changes.push({ recordId: 'company_profile', companyId, deleted: false, payload: profile });
    }

    for (const collection of COLLECTIONS) {
      const oldItems = Array.isArray(getField(oldCompany, collection)) ? getField(oldCompany, collection) as unknown[] : [];
      const newItems = Array.isArray(getField(nextCompany, collection)) ? getField(nextCompany, collection) as unknown[] : [];
      const oldById = new Map(oldItems.filter(isRecord).filter(item => typeof item.id === 'string').map(item => [String(item.id), item]));
      const newById = new Map(newItems.filter(isRecord).filter(item => typeof item.id === 'string').map(item => [String(item.id), item]));

      for (const [id, item] of newById) {
        const before = oldById.get(id);
        if (!before || stableJson(before) !== stableJson(item)) {
          changes.push({
            recordId: collection + ':' + id,
            companyId,
            deleted: false,
            payload: { collection, item },
          });
        }
      }
      for (const id of oldById.keys()) {
        if (!newById.has(id)) {
          changes.push({ recordId: collection + ':' + id, companyId, deleted: true, payload: null });
        }
      }
    }

    // Diary entries are nested by case ID, so flatten them into stable record IDs.
    const oldDiary = isRecord(getField(oldCompany, 'diaryData')) ? getField(oldCompany, 'diaryData') as Record<string, unknown> : {};
    const newDiary = isRecord(getField(nextCompany, 'diaryData')) ? getField(nextCompany, 'diaryData') as Record<string, unknown> : {};
    const oldDiaryById = new Map<string, { caseId: string; item: JsonRecord }>();
    const newDiaryById = new Map<string, { caseId: string; item: JsonRecord }>();
    for (const [caseId, entries] of Object.entries(oldDiary)) {
      if (Array.isArray(entries)) for (const item of entries.filter(isRecord)) if (typeof item.id === 'string') oldDiaryById.set(String(item.id), { caseId, item });
    }
    for (const [caseId, entries] of Object.entries(newDiary)) {
      if (Array.isArray(entries)) for (const item of entries.filter(isRecord)) if (typeof item.id === 'string') newDiaryById.set(String(item.id), { caseId, item });
    }
    for (const [id, entry] of newDiaryById) {
      const before = oldDiaryById.get(id);
      if (!before || stableJson(before) !== stableJson(entry)) {
        changes.push({ recordId: 'diary:' + id, companyId, deleted: false, payload: { caseId: entry.caseId, item: entry.item } });
      }
    }
    for (const id of oldDiaryById.keys()) {
      if (!newDiaryById.has(id)) changes.push({ recordId: 'diary:' + id, companyId, deleted: true, payload: null });
    }
  }

  // Workspace deletion is represented as a tombstone, not a remote DB wipe.
  for (const companyId of previousCompanies.keys()) {
    if (!currentCompanies.has(companyId)) {
      changes.push({ recordId: 'company_workspace', companyId, deleted: true, payload: null });
    }
  }

  return changes;
}

export function createSyncEnvelopes<T>(
  changes: readonly CompanySnapshotChange<T>[],
  deviceId: string,
  now = Date.now()
): SyncEnvelope<T>[] {
  return changes.map((change, index) => ({
    schemaVersion: 1,
    deviceId,
    changeId: 'chg_' + now.toString(36) + '_' + index.toString(36) + '_' + Math.random().toString(36).slice(2, 10),
    recordId: change.recordId,
    companyId: change.companyId,
    updatedAt: now + index,
    deleted: change.deleted,
    payload: change.deleted ? null : change.payload,
  }));
}
