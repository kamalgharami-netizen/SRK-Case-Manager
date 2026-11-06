import type { SyncEnvelope } from './driveSyncProtocol';
import type { AsyncSyncInbox } from './asyncSyncRepositories';
import { applySyncEnvelopes, type ApplySyncResult } from './applySyncChanges';
import type { TrackedCompany } from './companyChangeTracker';

export interface AsyncApplyStagedResult<T extends TrackedCompany> extends ApplySyncResult<T> {
  acknowledged: number;
  remaining: number;
}

/** Persist approved company data before acknowledging the durable async inbox. */
export async function applyStagedInboxChangesAsync<T extends TrackedCompany>(
  current: readonly T[],
  inbox: AsyncSyncInbox<unknown>,
  persist: (companies: T[]) => Promise<void>,
): Promise<AsyncApplyStagedResult<T>> {
  const staged: SyncEnvelope<unknown>[] = await inbox.getAll();
  if (staged.length === 0) {
    return {
      companies: [...current], applied: 0, skipped: 0, manualReview: 0,
      appliedChangeIds: [], skippedChangeIds: [], acknowledged: 0, remaining: 0,
    };
  }

  const result = applySyncEnvelopes(current, staged);
  if (result.applied > 0) {
    await persist(result.companies);
    const acknowledged = await inbox.acknowledge(result.appliedChangeIds);
    return { ...result, acknowledged, remaining: (await inbox.getAll()).length };
  }
  return { ...result, acknowledged: 0, remaining: (await inbox.getAll()).length };
}
