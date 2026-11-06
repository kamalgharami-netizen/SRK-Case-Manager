const USER_DATA_ARRAY_FIELDS = [
  'cases',
  'parties',
  'users',
  'causeList',
  'vaultFiles',
  'activityLog',
  'sampleDrafts',
  'financialEntries',
  'partyLedgerEntries',
  'officeAccounts',
  'accountTransactions',
  'messages',
] as const;

const USER_DATA_TEXT_FIELDS = [
  'logoUrl',
  'gst',
  'address',
  'city',
  'phone',
  'email',
  'barCouncil',
  'chainSampleTemplate',
] as const;

/**
 * Returns true when a workspace contains user-entered records or custom
 * company information. Empty demo/sample workspaces may be discarded, but
 * a demo-named workspace containing any supported data must be retained.
 */
export function companyHasUserCreatedData(company: unknown): boolean {
  if (!company || typeof company !== 'object' || Array.isArray(company)) return false;

  const value = company as Record<string, unknown>;
  const hasNonEmptyArray = USER_DATA_ARRAY_FIELDS.some((field) => {
    const candidate = value[field];
    return Array.isArray(candidate) && candidate.length > 0;
  });

  const diaryData = value.diaryData;
  const hasDiaryEntries =
    Boolean(diaryData) &&
    typeof diaryData === 'object' &&
    !Array.isArray(diaryData) &&
    Object.keys(diaryData as Record<string, unknown>).length > 0;

  const hasCustomCompanyInformation = USER_DATA_TEXT_FIELDS.some((field) => {
    const candidate = value[field];
    return typeof candidate === 'string' && candidate.trim().length > 0;
  });

  return hasNonEmptyArray || hasDiaryEntries || hasCustomCompanyInformation;
}
