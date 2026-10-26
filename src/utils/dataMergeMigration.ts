import { Company, CaseItem, Party, CauseItem, VaultFile, User } from '../types';
import { APP_VERSION } from '../config/version';

const PRIMARY_STORAGE_KEY = 'srk_case_manager_v5';

// All known legacy and alternate storage keys used across versions
export const PREVIOUS_STORAGE_KEYS = [
  'srk_case_manager_v5',
  'srk_case_manager_v4',
  'srk_case_manager_v3',
  'srk_case_manager_v2',
  'srk_case_manager_v1',
  'srk_case_manager',
  'srk_companies',
  'srk_auto_backup_latest',
  'srk_persistent_vault_latest',
  'srk_manual_backup_latest'
];

/**
 * Normalizes string for reliable matching across versions
 */
function norm(str?: string | null): string {
  return (str || '').toLowerCase().trim().replace(/[\s\-_/\\,.]+/g, '');
}

/**
 * Extracts list of Company objects from arbitrary backup or storage format
 */
export function extractCompaniesFromPayload(raw: any): Company[] {
  if (!raw) return [];
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // 1. Array of companies
    if (Array.isArray(data)) {
      return data.filter(c => c && typeof c === 'object' && (c.name || c.id));
    }

    // 2. Object with companies array
    if (Array.isArray(data.companies)) {
      return data.companies.filter((c: any) => c && typeof c === 'object' && (c.name || c.id));
    }

    // 3. Object with allCompanies array
    if (Array.isArray(data.allCompanies)) {
      return data.allCompanies.filter((c: any) => c && typeof c === 'object' && (c.name || c.id));
    }

    // 4. Single company payload
    if (data.company && typeof data.company === 'object' && (data.company.name || data.company.id)) {
      return [data.company];
    }

    // 5. Raw single company object
    if (data.name && (Array.isArray(data.cases) || Array.isArray(data.users))) {
      return [data as Company];
    }
  } catch (e) {
    console.warn('Failed to parse payload for company extraction:', e);
  }
  return [];
}

/**
 * Merges two case lists, preserving existing cases and adding any missing cases from older versions
 */
export function mergeCaseLists(existingCases: CaseItem[] = [], incomingCases: CaseItem[] = []): { merged: CaseItem[]; addedCount: number } {
  const mergedMap = new Map<string, CaseItem>();
  const secondaryMap = new Map<string, string>(); // normalized caseNo -> id

  // Seed with existing cases
  existingCases.forEach(c => {
    if (!c || !c.id) return;
    mergedMap.set(c.id, c);
    const numKey = norm(c.caseNo || c.appNo || c.ainNo);
    if (numKey) {
      secondaryMap.set(numKey, c.id);
    }
  });

  let addedCount = 0;

  // Merge incoming cases
  incomingCases.forEach(inc => {
    if (!inc) return;

    // Check by ID first
    if (inc.id && mergedMap.has(inc.id)) {
      const existing = mergedMap.get(inc.id)!;
      mergedMap.set(inc.id, {
        ...inc,
        ...existing,
        notes: existing.notes || inc.notes || '',
        chainDeedDraft: existing.chainDeedDraft || inc.chainDeedDraft || '',
        chainLinks: (existing.chainLinks && existing.chainLinks.length > 0) ? existing.chainLinks : (inc.chainLinks || []),
        respondents: (existing.respondents && existing.respondents.length > 0) ? existing.respondents : (inc.respondents || []),
        landSchedules: (existing.landSchedules && existing.landSchedules.length > 0) ? existing.landSchedules : (inc.landSchedules || []),
        applicants: (existing.applicants && existing.applicants.length > 0) ? existing.applicants : (inc.applicants || []),
        attachments: (existing.attachments && existing.attachments.length > 0) ? existing.attachments : (inc.attachments || [])
      });
      return;
    }

    // Check by Case Number / App Number
    const numKey = norm(inc.caseNo || inc.appNo || inc.ainNo);
    if (numKey && secondaryMap.has(numKey)) {
      const targetId = secondaryMap.get(numKey)!;
      const existing = mergedMap.get(targetId)!;
      mergedMap.set(targetId, {
        ...inc,
        ...existing,
        notes: existing.notes || inc.notes || '',
        chainDeedDraft: existing.chainDeedDraft || inc.chainDeedDraft || '',
        chainLinks: (existing.chainLinks && existing.chainLinks.length > 0) ? existing.chainLinks : (inc.chainLinks || []),
        respondents: (existing.respondents && existing.respondents.length > 0) ? existing.respondents : (inc.respondents || []),
        landSchedules: (existing.landSchedules && existing.landSchedules.length > 0) ? existing.landSchedules : (inc.landSchedules || []),
        applicants: (existing.applicants && existing.applicants.length > 0) ? existing.applicants : (inc.applicants || []),
        attachments: (existing.attachments && existing.attachments.length > 0) ? existing.attachments : (inc.attachments || [])
      });
      return;
    }

    // New case found from older version/APK!
    const newId = inc.id || 'case_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const mergedCase: CaseItem = {
      ...inc,
      id: newId
    };
    mergedMap.set(newId, mergedCase);
    if (numKey) secondaryMap.set(numKey, newId);
    addedCount++;
  });

  return {
    merged: Array.from(mergedMap.values()),
    addedCount
  };
}

/**
 * Merges two party lists
 */
export function mergePartyLists(existingParties: Party[] = [], incomingParties: Party[] = []): { merged: Party[]; addedCount: number } {
  const map = new Map<string, Party>();
  const phoneMap = new Map<string, string>();

  existingParties.forEach(p => {
    if (!p || !p.id) return;
    map.set(p.id, p);
    const pPhone = norm(p.phone);
    if (pPhone) phoneMap.set(pPhone, p.id);
  });

  let addedCount = 0;

  incomingParties.forEach(inc => {
    if (!inc) return;
    if (inc.id && map.has(inc.id)) {
      const ex = map.get(inc.id)!;
      map.set(inc.id, { ...inc, ...ex });
      return;
    }
    const pPhone = norm(inc.phone);
    if (pPhone && phoneMap.has(pPhone)) {
      const targetId = phoneMap.get(pPhone)!;
      const ex = map.get(targetId)!;
      map.set(targetId, { ...inc, ...ex });
      return;
    }

    const newId = inc.id || 'party_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    map.set(newId, { ...inc, id: newId });
    if (pPhone) phoneMap.set(pPhone, newId);
    addedCount++;
  });

  return {
    merged: Array.from(map.values()),
    addedCount
  };
}

/**
 * Merges two company lists, merging data into matching companies and keeping distinct ones
 */
export function mergeCompanyLists(
  currentCompanies: Company[] = [],
  incomingCompanies: Company[] = []
): { merged: Company[]; addedCasesCount: number; addedPartiesCount: number } {
  let totalCasesAdded = 0;
  let totalPartiesAdded = 0;

  const result: Company[] = [...currentCompanies];

  incomingCompanies.forEach(inc => {
    if (!inc || (!inc.name && !inc.id)) return;

    // Find matching existing company by ID or normalized name
    const matchIndex = result.findIndex(
      cur => cur.id === inc.id || norm(cur.name) === norm(inc.name)
    );

    if (matchIndex !== -1) {
      const cur = result[matchIndex];

      // Merge cases
      const caseMerge = mergeCaseLists(cur.cases || [], inc.cases || []);
      totalCasesAdded += caseMerge.addedCount;

      // Merge parties
      const partyMerge = mergePartyLists(cur.parties || [], inc.parties || []);
      totalPartiesAdded += partyMerge.addedCount;

      // Merge cause list
      const causeMap = new Map<string, CauseItem>();
      (cur.causeList || []).forEach(ci => ci?.id && causeMap.set(ci.id, ci));
      (inc.causeList || []).forEach(ci => {
        if (!ci) return;
        const key = ci.id || `${norm(ci.caseNo)}_${ci.date}`;
        if (!causeMap.has(key)) causeMap.set(key, ci);
      });

      // Merge vault
      const vaultMap = new Map<string, VaultFile>();
      (cur.vaultFiles || []).forEach(vf => vf?.id && vaultMap.set(vf.id, vf));
      (inc.vaultFiles || []).forEach(vf => {
        if (!vf) return;
        const key = vf.id || norm(vf.name);
        if (!vaultMap.has(key)) vaultMap.set(key, vf);
      });

      // Merge users (retain current admin & credentials)
      const userMap = new Map<string, User>();
      (cur.users || []).forEach(u => u?.id && userMap.set(u.id, u));
      (inc.users || []).forEach(u => {
        if (!u) return;
        const key = u.id || norm(u.phone || u.email);
        if (!userMap.has(key)) userMap.set(key, u);
      });

      // Merge diary data
      const mergedDiary = { ...(inc.diaryData || {}), ...(cur.diaryData || {}) };

      result[matchIndex] = {
        ...inc,
        ...cur,
        cases: caseMerge.merged,
        parties: partyMerge.merged,
        causeList: Array.from(causeMap.values()),
        vaultFiles: Array.from(vaultMap.values()),
        users: Array.from(userMap.values()),
        diaryData: mergedDiary,
        backupStoragePath: cur.backupStoragePath || inc.backupStoragePath || 'C:/Case_Backups'
      };
    } else {
      // Incoming company does not exist in current list; add it directly
      result.push(inc);
      totalCasesAdded += inc.cases?.length || 0;
      totalPartiesAdded += inc.parties?.length || 0;
    }
  });

  return {
    merged: result,
    addedCasesCount: totalCasesAdded,
    addedPartiesCount: totalPartiesAdded
  };
}

/**
 * Deep scans all previous storage locations (v1, v2, v3, v4, auto-backups, manual backups),
 * and automatically merges everything into current state.
 * Returns the merged company list and stats.
 */
export function autoMergeAllPreviousData(currentCompanies: Company[] = []): {
  mergedCompanies: Company[];
  totalCasesAdded: number;
  totalPartiesAdded: number;
  hasMerged: boolean;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { mergedCompanies: currentCompanies, totalCasesAdded: 0, totalPartiesAdded: 0, hasMerged: false };
  }

  let workingCompanies = [...currentCompanies];
  let grandTotalCases = 0;
  let grandTotalParties = 0;
  let hasMergedAnything = false;

  try {
    // 1. Gather all candidates from previous known keys
    const discoveredPayloads: any[] = [];

    PREVIOUS_STORAGE_KEYS.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          discoveredPayloads.push(item);
        }
      } catch {}
    });

    // 2. Also scan dynamic keys (e.g. srk_backup_..., srk_persistent_..., case_backup_...)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('srk_backup_') ||
         k.startsWith('case_backup_') ||
         k.startsWith('srk_pre_migration_') ||
         k.startsWith('srk_vault_'))
      ) {
        try {
          const val = localStorage.getItem(k);
          if (val && val.length > 50) {
            discoveredPayloads.push(val);
          }
        } catch {}
      }
    }

    // 3. Extract all companies from discovered items
    const allDiscoveredCompanies: Company[] = [];
    discoveredPayloads.forEach(payload => {
      const extracted = extractCompaniesFromPayload(payload);
      extracted.forEach(comp => {
        // Exclude empty test companies without cases or custom profile
        if (comp && (comp.name || (comp.cases && comp.cases.length > 0))) {
          allDiscoveredCompanies.push(comp);
        }
      });
    });

    if (allDiscoveredCompanies.length > 0) {
      const mergeResult = mergeCompanyLists(workingCompanies, allDiscoveredCompanies);
      workingCompanies = mergeResult.merged;
      grandTotalCases = mergeResult.addedCasesCount;
      grandTotalParties = mergeResult.addedPartiesCount;

      if (grandTotalCases > 0 || grandTotalParties > 0 || workingCompanies.length > currentCompanies.length) {
        hasMergedAnything = true;

        // Save pre-migration safety copy
        try {
          localStorage.setItem(
            `srk_pre_migration_backup_${Date.now()}`,
            JSON.stringify({
              timestamp: Date.now(),
              appVersion: APP_VERSION,
              companies: currentCompanies
            })
          );
        } catch {}

        // Persist merged state into PRIMARY_STORAGE_KEY
        try {
          const activeCompanyId = localStorage.getItem('srk_active_company_id') || workingCompanies[0]?.id || null;
          const activeUserId = workingCompanies[0]?.users?.[0]?.id || null;

          localStorage.setItem(
            PRIMARY_STORAGE_KEY,
            JSON.stringify({
              companies: workingCompanies,
              activeCompanyId,
              activeUserId,
              version: APP_VERSION,
              lastMergedAt: Date.now()
            })
          );
          localStorage.setItem('srk_first_time_setup_done', 'true');
          localStorage.setItem('srk_data_migrated_to_v5_4', 'true');
        } catch (e) {
          console.error('Failed to save merged storage:', e);
        }
      }
    }
  } catch (err) {
    console.error('Error during autoMergeAllPreviousData:', err);
  }

  return {
    mergedCompanies: workingCompanies,
    totalCasesAdded: grandTotalCases,
    totalPartiesAdded: grandTotalParties,
    hasMerged: hasMergedAnything
  };
}
