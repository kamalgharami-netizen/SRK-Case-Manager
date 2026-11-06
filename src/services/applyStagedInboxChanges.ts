import type { SyncEnvelope } from './driveSyncProtocol';
import type { SyncInbox } from './googleDriveSyncInbox';
import { applySyncEnvelopes, type ApplySyncResult } from './applySyncChanges';
import type { TrackedCompany } from './companyChangeTracker';

export interface ApplyStagedResult<T extends TrackedCompany> extends ApplySyncResult<T> {
  acknowledged: number;
  remaining: number;
}

/**
 * Applies only the currently staged inbox snapshot. The caller must invoke this
 * only after an explicit user action. Persist must succeed before inbox entries
 * are acknowledged, so a failed save never discards staged remote changes.
 */
export function applyStagedInboxChanges<T extends TrackedCompany>(
  current: readonly T[],
  inbox: SyncInbox<unknown>,
  persist: (companies: T[]) => void
): ApplyStagedResult<T> {
  const staged: SyncEnvelope<unknown>[] = inbox.getAll();
  if (staged.length === 0) {
    return { companies: [...current], applied: 0, skipped: 0, manualReview: 0, appliedChangeIds: [], skippedChangeIds: [], acknowledged: 0, remaining: 0 };
  }

  const result = applySyncEnvelopes(current, staged);
  if (result.applied > 0) {
    // Persist first. If this throws, the inbox remains unchanged for retry.
    persist(result.companies);
    const acknowledged = inbox.acknowledge(result.appliedChangeIds);
    return { ...result, acknowledged, remaining: inbox.getAll().length };
  }

  return { ...result, acknowledged: 0, remaining: inbox.getAll().length };
}
