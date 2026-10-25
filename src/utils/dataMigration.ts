import { Company, CaseItem, Party, CauseItem, VaultFile, DiaryEntry, MessageItem, User, LandSchedule, ChainLink, HearingDateItem } from '../types';
import { isDemoOrLegacyCompany } from '../context/AppContext';

const DB_NAME = 'srk_case_manager_offline_vault';
const DB_VERSION = 1;
const STORE_NAME = 'chamber_snapshots';
const KEY_LATEST = 'latest_chamber_data';

/**
 * Open or initialize IndexedDB for durable offline chamber persistence
 */
function openVaultDB(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      console.warn('IndexedDB open error:', e);
      resolve(null);
    }
  });
}

/**
 * Save chamber data snapshot into IndexedDB
 */
export async function saveToIndexedDB(data: any): Promise<boolean> {
  try {
    const db = await openVaultDB();
    if (!db) return false;
    return new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, KEY_LATEST);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('saveToIndexedDB error:', e);
    return false;
  }
}

/**
 * Load chamber data snapshot from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<any | null> {
  try {
    const db = await openVaultDB();
    if (!db) return null;
    return new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_LATEST);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('loadFromIndexedDB error:', e);
    return null;
  }
}

/**
 * Normalizes text for comparison
 */
function norm(str?: string): string {
  return (str || '').trim().toLowerCase();
}

/**
 * Merges two arrays of cases, deduplicating by ID or Case Number
 */
export function mergeCases(existing: CaseItem[] = [], incoming: CaseItem[] = []): CaseItem[] {
  const caseMap = new Map<string, CaseItem>();

  // Helper to get key for a case
  const getKey = (c: CaseItem): string => {
    if (c.id && c.id.trim()) return `id_${c.id.trim()}`;
    if (c.caseNo && c.caseNo.trim()) return `no_${norm(c.caseNo)}`;
    if (c.appNo && c.appNo.trim()) return `app_${norm(c.appNo)}`;
    if (c.rorPiNo && c.rorPiNo.trim()) return `ror_${norm(c.rorPiNo)}`;
    return `tmp_${Math.random()}`;
  };

  for (const c of existing) {
    if (!c) continue;
    caseMap.set(getKey(c), c);
    if (c.caseNo && c.caseNo.trim()) {
      caseMap.set(`no_${norm(c.caseNo)}`, c);
    }
  }

  for (const c of incoming) {
    if (!c) continue;
    const key = getKey(c);
    const byNoKey = c.caseNo && c.caseNo.trim() ? `no_${norm(c.caseNo)}` : null;

    const matched = caseMap.get(key) || (byNoKey ? caseMap.get(byNoKey) : null);

    if (!matched) {
      caseMap.set(key, c);
      if (byNoKey) caseMap.set(byNoKey, c);
    } else {
      // Deep merge fields so no land schedules, chain links, or notes are lost
      const mergedCase: CaseItem = {
        ...matched,
        ...c,
        // Combine land schedules without duplicates
        landSchedules: mergeLandSchedules(matched.landSchedules || [], c.landSchedules || []),
        // Combine chain links
        chainLinks: mergeChainLinks(matched.chainLinks || [], c.chainLinks || []),
        // Combine hearing dates
        hearingList: mergeHearingList(matched.hearingList || [], c.hearingList || []),
        hearingDates: Array.from(new Set([...(matched.hearingDates || []), ...(c.hearingDates || [])])),
        // Combine attachments
        attachments: Array.from(new Set([...(matched.attachments || []), ...(c.attachments || [])])),
        // Keep non-empty values
        party: c.party || matched.party,
        opp: c.opp || matched.opp,
        forum: c.forum || matched.forum,
        nextDate: c.nextDate || matched.nextDate,
        filingDate: c.filingDate || matched.filingDate,
        notes: [matched.notes, c.notes].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join('\n')
      };

      caseMap.set(key, mergedCase);
      if (byNoKey) caseMap.set(byNoKey, mergedCase);
    }
  }

  // Deduplicate entries by unique IDs
  const uniqueCases = new Map<string, CaseItem>();
  for (const c of caseMap.values()) {
    if (c && c.id) {
      uniqueCases.set(c.id, c);
    }
  }
  return Array.from(uniqueCases.values());
}

function mergeLandSchedules(existing: LandSchedule[] = [], incoming: LandSchedule[] = []): LandSchedule[] {
  const map = new Map<string, LandSchedule>();
  const makeKey = (s: LandSchedule) => `${norm(s.dag)}_${norm(s.khatian)}_${norm(s.mouza)}_${norm(s.plotOrKhatian)}`;

  for (const s of existing) {
    if (s) map.set(s.id || makeKey(s), s);
  }
  for (const s of incoming) {
    if (!s) continue;
    const k = s.id || makeKey(s);
    if (!map.has(k)) {
      map.set(k, s);
    }
  }
  return Array.from(map.values());
}

function mergeChainLinks(existing: ChainLink[] = [], incoming: ChainLink[] = []): ChainLink[] {
  const map = new Map<string, ChainLink>();
  const makeKey = (l: ChainLink) => `${norm(l.deedNo)}_${norm(l.deedYear)}_${norm(l.vendor)}_${norm(l.purchaser)}_${norm(l.certificateRef)}`;

  for (const l of existing) {
    if (l) map.set(l.id || makeKey(l), l);
  }
  for (const l of incoming) {
    if (!l) continue;
    const k = l.id || makeKey(l);
    if (!map.has(k)) {
      map.set(k, l);
    }
  }
  return Array.from(map.values());
}

function mergeHearingList(existing: HearingDateItem[] = [], incoming: HearingDateItem[] = []): HearingDateItem[] {
  const map = new Map<string, HearingDateItem>();
  for (const h of existing) {
    if (h && h.date) map.set(h.date, h);
  }
  for (const h of incoming) {
    if (h && h.date && !map.has(h.date)) {
      map.set(h.date, h);
    }
  }
  return Array.from(map.values());
}

/**
 * Merges parties deduplicating by ID or name + phone
 */
export function mergeParties(existing: Party[] = [], incoming: Party[] = []): Party[] {
  const map = new Map<string, Party>();
  for (const p of existing) {
    if (!p) continue;
    map.set(p.id || norm(p.name), p);
  }
  for (const p of incoming) {
    if (!p) continue;
    const k = p.id || norm(p.name);
    if (!map.has(k)) {
      map.set(k, p);
    }
  }
  return Array.from(map.values());
}

/**
 * Merges cause list items deduplicating by ID or caseNo + date + time
 */
export function mergeCauseList(existing: CauseItem[] = [], incoming: CauseItem[] = []): CauseItem[] {
  const map = new Map<string, CauseItem>();
  const makeKey = (ci: CauseItem) => `${norm(ci.caseNo)}_${ci.date}_${ci.time}`;

  for (const ci of existing) {
    if (!ci) continue;
    map.set(ci.id || makeKey(ci), ci);
  }
  for (const ci of incoming) {
    if (!ci) continue;
    const k = ci.id || makeKey(ci);
    if (!map.has(k)) {
      map.set(k, ci);
    }
  }
  return Array.from(map.values());
}

/**
 * Merges vault files deduplicating by ID or name + category
 */
export function mergeVaultFiles(existing: VaultFile[] = [], incoming: VaultFile[] = []): VaultFile[] {
  const map = new Map<string, VaultFile>();
  const makeKey = (f: VaultFile) => `${norm(f.name)}_${norm(f.category)}`;

  for (const f of existing) {
    if (!f) continue;
    map.set(f.id || makeKey(f), f);
  }
  for (const f of incoming) {
    if (!f) continue;
    const k = f.id || makeKey(f);
    if (!map.has(k)) {
      map.set(k, f);
    }
  }
  return Array.from(map.values());
}

/**
 * Merges diary entries keyed by caseId
 */
export function mergeDiaryData(
  existing: Record<string, DiaryEntry[]> = {},
  incoming: Record<string, DiaryEntry[]> = {}
): Record<string, DiaryEntry[]> {
  const result: Record<string, DiaryEntry[]> = { ...existing };

  for (const [caseId, entries] of Object.entries(incoming)) {
    if (!Array.isArray(entries)) continue;
    const currentList = result[caseId] || [];
    const entryMap = new Map<string, DiaryEntry>();

    for (const d of currentList) {
      if (d) entryMap.set(d.id || `${d.date}_${norm(d.title)}`, d);
    }
    for (const d of entries) {
      if (d) {
        const k = d.id || `${d.date}_${norm(d.title)}`;
        if (!entryMap.has(k)) {
          entryMap.set(k, d);
        }
      }
    }
    result[caseId] = Array.from(entryMap.values());
  }

  return result;
}

/**
 * Merges user profiles preserving credentials and passcodes
 */
export function mergeUsers(existing: User[] = [], incoming: User[] = []): User[] {
  const map = new Map<string, User>();
  for (const u of existing) {
    if (!u) continue;
    map.set(u.id || norm(u.email) || norm(u.phone), u);
  }
  for (const u of incoming) {
    if (!u) continue;
    const k = u.id || norm(u.email) || norm(u.phone);
    if (!map.has(k)) {
      map.set(k, u);
    } else {
      const curr = map.get(k)!;
      map.set(k, {
        ...curr,
        ...u,
        passcode: u.passcode || curr.passcode,
        password: u.password || curr.password || u.passcode || curr.passcode
      });
    }
  }
  return Array.from(map.values());
}

/**
 * Deep non-destructive merger for Company lists
 */
export function mergeCompanyLists(baseList: Company[] = [], incomingList: Company[] = []): Company[] {
  const result: Company[] = [...baseList];

  for (const inc of incomingList) {
    if (!inc || isDemoOrLegacyCompany(inc)) continue;

    const matchedIndex = result.findIndex(
      b => b.id === inc.id || (norm(b.name) === norm(inc.name) && norm(b.city) === norm(inc.city))
    );

    if (matchedIndex === -1) {
      // New company from older version, preserve it!
      result.push(inc);
    } else {
      // Company exists in both versions, merge all sub-collections!
      const target = result[matchedIndex];
      result[matchedIndex] = {
        ...target,
        ...inc,
        name: inc.name || target.name,
        barCouncil: inc.barCouncil || target.barCouncil,
        backupStoragePath: inc.backupStoragePath || target.backupStoragePath,
        cases: mergeCases(target.cases || [], inc.cases || []),
        parties: mergeParties(target.parties || [], inc.parties || []),
        causeList: mergeCauseList(target.causeList || [], inc.causeList || []),
        vaultFiles: mergeVaultFiles(target.vaultFiles || [], inc.vaultFiles || []),
        diaryData: mergeDiaryData(target.diaryData || {}, inc.diaryData || {}),
        messages: Array.from(new Set([...(target.messages || []), ...(inc.messages || [])])),
        users: mergeUsers(target.users || [], inc.users || [])
      };
    }
  }

  return result.filter(c => !isDemoOrLegacyCompany(c));
}

/**
 * Scans all possible localStorage keys from any previous versions or backups
 */
export function harvestAllStorageSources(): {
  companies: Company[];
  activeCompanyId: string | null;
  activeUserId: string | null;
  foundSourcesCount: number;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { companies: [], activeCompanyId: null, activeUserId: null, foundSourcesCount: 0 };
  }

  const candidateCompanies: Company[] = [];
  let foundSourcesCount = 0;
  let bestActiveCompanyId: string | null = null;
  let bestActiveUserId: string | null = null;

  // Known storage keys across all version evolutions
  const knownKeys = [
    'srk_case_manager_v5',
    'srk_case_manager_v4',
    'srk_case_manager_v3',
    'srk_case_manager_v2',
    'srk_case_manager_v1',
    'srk_case_manager',
    'srk_persistent_vault_latest',
    'srk_auto_backup_latest',
    'srk_backup_restore_cache',
    'srk_app_data',
    'srk_cases'
  ];

  // Also harvest dynamically any keys in localStorage
  const allStorageKeys = new Set<string>(knownKeys);
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('srk_') || k.startsWith('Backup_') || k.includes('case') || k.includes('chamber'))) {
      allStorageKeys.add(k);
    }
  }

  for (const key of allStorageKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;

      let extracted: Company[] = [];

      if (Array.isArray(parsed.companies)) {
        extracted = parsed.companies;
        if (!bestActiveCompanyId && parsed.activeCompanyId) bestActiveCompanyId = parsed.activeCompanyId;
        if (!bestActiveUserId && parsed.activeUserId) bestActiveUserId = parsed.activeUserId;
      } else if (Array.isArray(parsed.allCompanies)) {
        extracted = parsed.allCompanies;
      } else if (parsed.company && typeof parsed.company === 'object') {
        extracted = [parsed.company];
      } else if (parsed.name && Array.isArray(parsed.cases) && Array.isArray(parsed.users)) {
        // Direct single company object
        extracted = [parsed];
      }

      const valid = extracted.filter(c => !isDemoOrLegacyCompany(c));
      if (valid.length > 0) {
        foundSourcesCount++;
        for (const comp of valid) {
          candidateCompanies.push(comp);
        }
      }
    } catch {
      // Ignore non-json storage values
    }
  }

  const merged = mergeCompanyLists([], candidateCompanies);

  return {
    companies: merged,
    activeCompanyId: bestActiveCompanyId || (merged.length > 0 ? merged[0].id : null),
    activeUserId: bestActiveUserId || (merged.length > 0 && merged[0].users?.[0]?.id ? merged[0].users[0].id : null),
    foundSourcesCount
  };
}
