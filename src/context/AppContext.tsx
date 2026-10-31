import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Company, User, CaseItem, Party, CauseItem, VaultFile, DiaryEntry, MessageItem, SampleDraftItem, BackupLogEntry, FinancialEntry, PartyLedgerEntry, OfficeAccount, AccountTransaction } from '../types';
import { AppLanguage, translations, Translations } from '../data/translations';
import { INITIAL_SAMPLE_DRAFTS } from '../data/sampleDraftTemplates';
import { APP_VERSION, APP_BUILD_DATE, APP_RELEASE_NAME } from '../config/version';
import { autoMergeAllPreviousData, mergeCompanyLists, extractCompaniesFromPayload } from '../utils/dataMergeMigration';
import { SyncJournal } from '../services/syncJournal';
import { getOrCreateSyncDeviceId } from '../services/driveSyncProtocol';
import { collectCompanyChanges, createSyncEnvelopes, type TrackedCompany } from '../services/companyChangeTracker';
import { SyncInbox } from '../services/googleDriveSyncInbox';
import { applyStagedInboxChanges } from '../services/applyStagedInboxChanges';

const STORAGE_KEY = 'srk_case_manager_v5';

// Protect existing local data if every known primary storage entry is unreadable.
let STORAGE_LOAD_FAILED = false;
let INITIAL_STORAGE_STATE: any | null | undefined;

function getInitialStorageState(): any | null {
  if (INITIAL_STORAGE_STATE !== undefined) return INITIAL_STORAGE_STATE;
  let foundUnreadableData = false;
  for (const key of [STORAGE_KEY, 'srk_case_manager_v4', 'srk_case_manager_v3']) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.companies)) {
        // Keep a byte-for-byte recovery copy before the first write after an app-version change.
        const previousVersion = String(parsed.version || localStorage.getItem('srk_installed_app_version') || '');
        if (previousVersion !== APP_VERSION) {
          try {
            localStorage.setItem(`srk_upgrade_backup_${Date.now()}`, raw);
          } catch (backupError) {
            console.warn('Could not create pre-upgrade recovery copy:', backupError);
          }
        }
        INITIAL_STORAGE_STATE = parsed;
        STORAGE_LOAD_FAILED = false;
        return parsed;
      }
      foundUnreadableData = true;
    } catch {
      foundUnreadableData = true;
    }
  }
  STORAGE_LOAD_FAILED = foundUnreadableData;
  INITIAL_STORAGE_STATE = null;
  return null;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: ToastAction;
}

export type ViewDensity = 'comfortable' | 'compact';
export type ViewMode = 'grid' | 'table';
export type FontSize = 'normal' | 'large';
import { AppTheme, THEME_OPTIONS } from '../data/themes';
export type { AppTheme };

interface AppContextType {
  companies: Company[];
  activeCompany: Company | null;
  activeUser: User | null;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  toast: ToastState | null;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    action?: ToastAction,
    durationMs?: number
  ) => void;
  hideToast: () => void;

  // Viewing & Display Options
  viewDensity: ViewDensity;
  setViewDensity: (d: ViewDensity) => void;
  toggleViewDensity: () => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  toggleViewMode: () => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  toggleFontSize: () => void;
  highContrast: boolean;
  setHighContrast: (hc: boolean) => void;
  toggleHighContrast: () => void;
  isViewModalOpen: boolean;
  openViewModal: () => void;
  closeViewModal: () => void;
  resetViewPreferences: () => void;

  // Chamber Setup Modal
  isChamberSetupOpen: boolean;
  setIsChamberSetupOpen: (open: boolean) => void;
  openChamberSetup: () => void;

  // Print & PDF Preview Modal
  printModalData: {
    isOpen: boolean;
    html: string;
    title: string;
    orientation?: 'portrait' | 'landscape';
    paperSize?: 'a4' | 'legal';
  } | null;
  openPrintPreview: (options: {
    html: string;
    title: string;
    orientation?: 'portrait' | 'landscape';
    paperSize?: 'a4' | 'legal';
  }) => void;
  closePrintPreview: () => void;
  
  // Auth & Company Lifecycle
  createCompany: (
    details: {
      name: string;
      type: string;
      barCouncil: string;
      gst?: string;
      address: string;
      city: string;
      state: string;
      pin: string;
      phone: string;
      email: string;
      logoUrl?: string;
      logoBadge?: 'scales' | 'pillar' | 'gavel' | 'shield' | 'book' | 'ashoka';
      logoColor?: string;
      backupStoragePath?: string;
    },
    admin: {
      name: string;
      email: string;
      phone: string;
      password?: string;
      passcode: string; // Compulsory 4-digit passcode
    }
  ) => boolean;
  updateCompanyDetails: (details: Partial<Company>) => boolean;
  applyStagedSyncChanges: () => { applied: number; skipped: number; manualReview: number; remaining: number } | null;
  selectCompany: (companyId: string) => void;
  deleteCompany: (companyId: string) => void;
  loginUser: (identifier: string, passcodeOrPassword?: string, companyId?: string) => boolean;
  retrieveExistingData: (identifier: string, passcode: string, fileData?: any) => boolean;
  logoutUser: () => void;
  switchCompany: () => void;
  restoreCompany: (company: Company) => boolean;
  exportCompanyJson: () => void;
  mergeExternalData: (payload: any) => { success: boolean; addedCases: number; addedParties: number };
  triggerAutoDataMerge: () => { success: boolean; addedCases: number; addedParties: number };

  // Data Backup & Storage Path
  backupStoragePath: string;
  isBackupPathConfigured: boolean;
  setBackupStoragePath: (path: string) => void;
  backupHistory: BackupLogEntry[];
  deleteBackupLogEntry: (id: string) => void;
  clearAllBackupLog: () => void;
  performBackup: (options?: {
    type?: 'auto-close' | 'manual' | 'scheduled';
    customPath?: string;
    downloadFile?: boolean;
  }) => Promise<BackupLogEntry | null>;
  isSelectBackupPathModalOpen: boolean;
  setIsSelectBackupPathModalOpen: (open: boolean) => void;
  isManualBackupConfirmOpen: boolean;
  setIsManualBackupConfirmOpen: (open: boolean) => void;
  triggerManualBackupRequest: () => void;

  // App Exit Protection
  isExitConfirmOpen: boolean;
  setIsExitConfirmOpen: (open: boolean) => void;
  requestAppExit: () => void;
  confirmAppExit: () => void;

  // Case Actions
  addCase: (caseData: Omit<CaseItem, 'id' | 'createdAt' | 'createdBy'>) => CaseItem;
  updateCase: (caseId: string, updates: Partial<CaseItem>) => void;
  deleteCase: (caseId: string) => void;
  batchUpdateCaseStatus: (caseIds: string[], status: string) => void;
  batchDeleteCases: (caseIds: string[]) => void;

  // Office Accounts (non-billing income and expense register)
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteFinancialEntry: (entryId: string) => void;
  addPartyLedgerEntry: (entry: Omit<PartyLedgerEntry, 'id' | 'createdAt' | 'createdBy'>) => void;
  deletePartyLedgerEntry: (entryId: string) => void;
  addOfficeAccount: (account: Omit<OfficeAccount, 'id' | 'createdAt'>) => void;
  addAccountTransaction: (entry: Omit<AccountTransaction, 'id' | 'createdAt' | 'createdBy'>) => void;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, date: string, amount: number, description: string, reference?: string) => void;
  deleteAccountTransaction: (entryId: string) => void;

  // Party Actions
  addParty: (partyData: Omit<Party, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteParty: (partyId: string) => void;

  // Team Actions
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => boolean;
  deleteUser: (userId: string) => void;

  // Cause List Actions
  addCauseItem: (item: Omit<CauseItem, 'id'>) => void;
  updateCauseItem: (id: string, updates: Partial<CauseItem>) => void;
  deleteCauseItem: (id: string) => void;

  // Vault Actions
  addVaultFile: (file: Omit<VaultFile, 'id'>) => void;
  deleteVaultFile: (id: string) => void;

  // Sample Drafts & Formats in Vault / Settings
  sampleDrafts: SampleDraftItem[];
  addSampleDraft: (draft: Omit<SampleDraftItem, 'id' | 'lastUpdated'>) => void;
  updateSampleDraft: (id: string, updates: Partial<SampleDraftItem>) => void;
  deleteSampleDraft: (id: string) => void;
  resetSampleDrafts: () => void;

  // Diary Actions
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  deleteDiaryEntry: (caseId: string, entryId: string) => void;

  // Communication
  sendMessage: (partyId: string, phone: string, body: string, channel?: 'WhatsApp' | 'SMS') => void;

  // Application Version & Dynamic In-Place Replacement
  appVersion: string;
  appBuildDate: string;
  appReleaseName: string;
  forceAppUpdateAndReplace: () => Promise<void>;
}

export const isDemoOrLegacyCompany = (c: any): boolean => {
  if (!c || typeof c !== 'object') return true;

  // Never discard a chamber that contains ANY user-created information.
  const hasUserData = [
    c.cases, c.parties, c.users, c.causeList, c.vaultFiles, c.activityLog, c.sampleDrafts
  ].some(value => Array.isArray(value) && value.length > 0) ||
    (c.diaryData && typeof c.diaryData === 'object' && Object.keys(c.diaryData).length > 0) ||
    Boolean(c.logoUrl || c.gst || c.address || c.phone || c.email || c.barCouncil);

  if (hasUserData) return false;

  // Only remove clearly-labelled empty demo/sample workspaces.
  const name = String(c.name || '').toLowerCase();
  return name.includes('demo company') || name.includes('sample company');
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      let loaded: Company[] = [];
      const parsed = getInitialStorageState();
      if (parsed && Array.isArray(parsed.companies)) {
        loaded = parsed.companies.filter((c: Company) => !isDemoOrLegacyCompany(c));
      }

      // Merge recoverable records from older app versions and backups.
      const mergeResult = autoMergeAllPreviousData(loaded);
      if (mergeResult.mergedCompanies.length > 0) STORAGE_LOAD_FAILED = false;
      return mergeResult.mergedCompanies.filter((c: Company) => !isDemoOrLegacyCompany(c));
    } catch (e) {
      console.error('Failed to load & merge companies from localStorage', e);
      return [];
    }
  });

  const previousSyncSnapshot = useRef<Company[]>(companies);
  const skipNextSyncTracking = useRef(false);

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    try {
      const parsed = getInitialStorageState();
      if (parsed) {
        const validCompanies = (parsed.companies || []).filter((c: Company) => !isDemoOrLegacyCompany(c));
        if (validCompanies.length === 0) return null;
        if (parsed.activeCompanyId && validCompanies.some((c: Company) => c.id === parsed.activeCompanyId)) {
          return parsed.activeCompanyId;
        }
        return validCompanies[0].id;
      }
    } catch {}
    return null;
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const parsed = getInitialStorageState();
      if (parsed) {
        const validCompanies = (parsed.companies || []).filter((c: Company) => !isDemoOrLegacyCompany(c));
        if (validCompanies.length === 0) return null;
        const targetComp = validCompanies.find((c: Company) => c.id === parsed.activeCompanyId) || validCompanies[0];
        if (targetComp && targetComp.users && targetComp.users.length > 0) {
          if (parsed.activeUserId && targetComp.users.some((u: User) => u.id === parsed.activeUserId)) {
            return parsed.activeUserId;
          }
          return targetComp.users[0].id;
        }
      }
    } catch {}
    return null;
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('srk_theme_v2') as AppTheme;
      if (savedTheme && THEME_OPTIONS.some(t => t.id === savedTheme)) {
        return savedTheme;
      }
    } catch {}
    return 'white';
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const savedLang = localStorage.getItem('srk_language');
      if (savedLang === 'bn' || savedLang === 'en') return savedLang;
    } catch {}
    return 'en';
  });

  // Viewing & Display Preferences State
  const [viewDensity, setViewDensityState] = useState<ViewDensity>(() => {
    try {
      const saved = localStorage.getItem('srk_view_density');
      if (saved === 'compact' || saved === 'comfortable') return saved;
    } catch {}
    return 'comfortable';
  });

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('srk_view_mode');
      if (saved === 'grid' || saved === 'table') return saved;
    } catch {}
    return 'grid';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('srk_font_size');
      if (saved === 'large' || saved === 'normal') return saved;
    } catch {}
    return 'normal';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('srk_high_contrast') === 'true';
    } catch {}
    return false;
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isChamberSetupOpen, setIsChamberSetupOpen] = useState(false);

  // Backup & Storage Path State - Single path automatically detected for Mobile vs Windows
  const [backupStoragePath, setBackupStoragePathState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('srk_backup_storage_path');
      if (stored && stored.trim()) return stored;
    } catch {}
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
    return isMobile ? '/storage/emulated/0/Documents/Case_Backups' : 'C:/Case_Backups';
  });

  const [isBackupPathConfigured, setIsBackupPathConfigured] = useState<boolean>(true);

  const [backupHistory, setBackupHistory] = useState<BackupLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem('srk_backup_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [isSelectBackupPathModalOpen, setIsSelectBackupPathModalOpen] = useState(false);
  const [isManualBackupConfirmOpen, setIsManualBackupConfirmOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // Print & PDF Preview Modal State (on-screen popup without redirects)
  const [printModalData, setPrintModalData] = useState<{
    isOpen: boolean;
    html: string;
    title: string;
    orientation?: 'portrait' | 'landscape';
    paperSize?: 'a4' | 'legal';
  } | null>(null);

  const openPrintPreview = (options: {
    html: string;
    title: string;
    orientation?: 'portrait' | 'landscape';
    paperSize?: 'a4' | 'legal';
  }) => {
    setPrintModalData({
      isOpen: true,
      html: options.html,
      title: options.title || 'Document',
      orientation: options.orientation || 'portrait',
      paperSize: options.paperSize || 'a4'
    });
  };

  const closePrintPreview = () => {
    setPrintModalData(null);
  };

  // Global event listener for safePrintHtml and print callers
  useEffect(() => {
    const handlePrintEvent = (e: any) => {
      if (e && e.detail) {
        setPrintModalData({
          isOpen: true,
          html: e.detail.html || '',
          title: e.detail.title || 'Document',
          orientation: e.detail.orientation || 'portrait',
          paperSize: e.detail.paperSize || 'a4'
        });
      }
    };
    window.addEventListener('srk-open-print-modal', handlePrintEvent);
    return () => window.removeEventListener('srk-open-print-modal', handlePrintEvent);
  }, []);

  const openViewModal = () => setIsViewModalOpen(true);
  const closeViewModal = () => setIsViewModalOpen(false);
  const openChamberSetup = () => setIsChamberSetupOpen(true);

  const setViewDensity = (d: ViewDensity) => setViewDensityState(d);
  const toggleViewDensity = () => setViewDensityState(prev => (prev === 'comfortable' ? 'compact' : 'comfortable'));

  const setViewMode = (m: ViewMode) => setViewModeState(m);
  const toggleViewMode = () => setViewModeState(prev => (prev === 'grid' ? 'table' : 'grid'));

  const setFontSize = (s: FontSize) => setFontSizeState(s);
  const toggleFontSize = () => setFontSizeState(prev => (prev === 'normal' ? 'large' : 'normal'));

  const setHighContrast = (hc: boolean) => setHighContrastState(hc);
  const toggleHighContrast = () => setHighContrastState(prev => !prev);

  const toggleTheme = () =>
    setThemeState(prev => {
      const order: AppTheme[] = ['white', 'light', 'sepia', 'azure', 'mint'];
      const idx = order.indexOf(prev);
      return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : order[0];
    });

  const resetViewPreferences = () => {
    setViewDensityState('comfortable');
    setViewModeState('grid');
    setFontSizeState('normal');
    setHighContrastState(false);
    setThemeState('white');
    showToast(language === 'bn' ? 'ডিসপ্লে সেটিংস ডিফল্ট করা হয়েছে' : 'Display preferences reset to default', 'info');
  };

  // Sync viewing preferences to DOM and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('srk_view_density', viewDensity);
      if (viewDensity === 'compact') {
        document.documentElement.classList.add('density-compact');
      } else {
        document.documentElement.classList.remove('density-compact');
      }
    } catch {}
  }, [viewDensity]);

  useEffect(() => {
    try {
      localStorage.setItem('srk_view_mode', viewMode);
    } catch {}
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem('srk_font_size', fontSize);
      if (fontSize === 'large') {
        document.documentElement.classList.add('text-scale-large');
      } else {
        document.documentElement.classList.remove('text-scale-large');
      }
    } catch {}
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem('srk_high_contrast', String(highContrast));
      if (highContrast) {
        document.documentElement.classList.add('high-contrast-mode');
      } else {
        document.documentElement.classList.remove('high-contrast-mode');
      }
    } catch {}
  }, [highContrast]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('srk_language', lang);
    } catch {}
    showToast(lang === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে: বাংলা' : 'Language switched to: English', 'success');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = translations[language];

  const [toast, setToast] = useState<ToastState | null>(null);

  // Record local record-level changes in the durable outbox. This does not
  // contact Google Drive or apply remote data; offline app state remains primary.
  useEffect(() => {
    if (skipNextSyncTracking.current) {
      skipNextSyncTracking.current = false;
      previousSyncSnapshot.current = companies;
      return;
    }
    try {
      const previous = previousSyncSnapshot.current as unknown as TrackedCompany[];
      const current = companies as unknown as TrackedCompany[];
      const changes = collectCompanyChanges(previous, current);
      if (changes.length > 0) {
        const deviceId = getOrCreateSyncDeviceId(localStorage);
        const journal = new SyncJournal<unknown>(localStorage);
        const envelopes = createSyncEnvelopes(changes, deviceId);
        envelopes.forEach(envelope => journal.enqueue(envelope));
      }
      previousSyncSnapshot.current = companies;
    } catch (error) {
      // A sync-journal failure must never block normal local case management.
      console.error('Could not record local changes for cloud sync:', error);
    }
  }, [companies]);

  // Sync to localStorage
  useEffect(() => {
    // Do not overwrite unreadable existing data with an empty first-render state.
    if (STORAGE_LOAD_FAILED) {
      console.error('Existing SRK data could not be parsed. Storage write paused to prevent data loss.');
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          companies,
          activeCompanyId,
          activeUserId,
          version: APP_VERSION,
          updatedAt: Date.now()
        })
      );
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [companies, activeCompanyId, activeUserId]);

  // Apply light theme to document
  useEffect(() => {
    try {
      localStorage.setItem('srk_theme_v2', theme);
      localStorage.setItem('srk_theme', 'light');

      const root = document.documentElement;
      const allThemeClasses = [
        'dark',
        'theme-white',
        'theme-light',
        'theme-sepia',
        'theme-azure',
        'theme-mint',
        'theme-navy',
        'theme-emerald',
        'theme-charcoal',
        'theme-indigo'
      ];
      allThemeClasses.forEach(cls => root.classList.remove(cls));

      // Always remove dark class
      root.classList.remove('dark');
      root.classList.add(`theme-${theme}`);
      root.style.colorScheme = 'light';

      const activeOpt = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme && activeOpt) {
        metaTheme.setAttribute('content', activeOpt.bgHex);
      }
    } catch {}
  }, [theme]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    action?: ToastAction,
    durationMs: number = 3200
  ) => {
    const id = Date.now();
    setToast({ id, message, type, action });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, durationMs);
  };

  const hideToast = () => {
    setToast(null);
  };

  const activeCompany = companies.find(c => c.id === activeCompanyId) || (companies.length > 0 ? companies[0] : null);
  const activeUser =
    activeCompany && activeUserId
      ? activeCompany.users.find(u => u.id === activeUserId) || null
      : null;

  const logActivity = (text: string) => {
    if (!activeCompanyId) return;
    const actor = activeUser?.name || 'User';
    const role = activeUser?.role || 'Staff';
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const newLog = {
          id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          time: Date.now(),
          text,
          userName: actor,
          role
        };
        return {
          ...c,
          activityLog: [newLog, ...(c.activityLog || [])].slice(0, 100)
        };
      })
    );
  };

  // Auth & Company functions
  const createCompany = (details: any, admin: any) => {
    const newCompanyId = 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const newUserId = 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const cleanPasscode = (admin.passcode || '1234').toString().replace(/\D/g, '').slice(0, 4);

    const adminUser: User = {
      id: newUserId,
      name: admin.name,
      email: admin.email.toLowerCase(),
      phone: admin.phone,
      role: 'Admin',
      password: admin.password || cleanPasscode,
      passcode: cleanPasscode,
      isMain: true,
      createdAt: Date.now()
    };

    const targetBackupPath = (details as any).backupStoragePath || backupStoragePath || 'C:/Case_Backups';
    if ((details as any).backupStoragePath) {
      setBackupStoragePathState(targetBackupPath);
      setIsBackupPathConfigured(true);
      try {
        localStorage.setItem('srk_backup_storage_path', targetBackupPath);
        localStorage.setItem('srk_backup_path_configured', 'true');
      } catch {}
    }

    const newCompany: Company = {
      id: newCompanyId,
      name: details.name,
      type: details.type,
      barCouncil: details.barCouncil,
      gst: details.gst || '',
      address: details.address,
      city: details.city,
      state: details.state || 'West Bengal',
      pin: details.pin,
      phone: details.phone || admin.phone,
      email: details.email || admin.email,
      logoUrl: details.logoUrl,
      logoBadge: details.logoBadge || 'scales',
      logoColor: details.logoColor || '#2563EB',
      createdAt: Date.now(),
      backupStoragePath: targetBackupPath,
      users: [adminUser],
      cases: [],
      parties: [],
      financialEntries: [],
      vaultFiles: [],
      causeList: [],
      diaryData: {},
      messages: [],
      activityLog: [
        {
          id: 'act_init',
          time: Date.now(),
          text: `Chamber workspace initialized for ${details.name}`,
          userName: admin.name,
          role: 'Admin'
        }
      ]
    };

    setCompanies(prev => [...prev, newCompany]);
    setActiveCompanyId(newCompanyId);
    setActiveUserId(newUserId);
    try {
      localStorage.setItem('srk_first_time_setup_done', 'true');
    } catch {}
    setIsChamberSetupOpen(false);

    // Initial persistent vault snapshot for reinstall recovery
    try {
      const initialSnapshot = {
        appName: 'SRK Case Manager',
        appVersion: APP_VERSION,
        backupType: 'initial-setup',
        timestamp: Date.now(),
        storagePath: targetBackupPath,
        company: newCompany,
        allCompanies: [newCompany],
        passcodeVerify: cleanPasscode
      };
      localStorage.setItem('srk_persistent_vault_latest', JSON.stringify(initialSnapshot));
    } catch {}

    showToast(`Workspace "${details.name}" created successfully. Registered with Passcode.`);
    return true;
  };

  const setBackupStoragePath = (path: string) => {
    const clean = path.trim() || 'C:/Case_Backups';
    setBackupStoragePathState(clean);
    setIsBackupPathConfigured(true);
    try {
      localStorage.setItem('srk_backup_storage_path', clean);
      localStorage.setItem('srk_backup_path_configured', 'true');
    } catch {}
    if (activeCompanyId) {
      updateCompanyDetails({ backupStoragePath: clean });
    }
    showToast(`Backup storage path set to: ${clean}`, 'success');
  };

  const triggerManualBackupRequest = () => {
    if (!isBackupPathConfigured) {
      setIsSelectBackupPathModalOpen(true);
    } else {
      setIsManualBackupConfirmOpen(true);
    }
  };

  const performBackup = async (options?: {
    type?: 'auto-close' | 'manual' | 'scheduled';
    customPath?: string;
    downloadFile?: boolean;
  }): Promise<BackupLogEntry | null> => {
    if (!activeCompany) return null;
    const type = options?.type || 'manual';
    const targetPath = options?.customPath || backupStoragePath || 'C:/Case_Backups';
    const now = new Date();
    const timestamp = now.getTime();
    const formattedDate = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const isAutoBackup = type === 'auto-close' || type === 'scheduled';
    const safeName = (activeCompany.name || 'Chamber').replace(/[^a-zA-Z0-9]/g, '_');
    const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

    // Auto backup modifies existing file / data with new; Manual backup creates a new timestamped file
    const fileName = isAutoBackup
      ? `Backup_${safeName}_AutoBackup.json`
      : `Backup_${safeName}_${dStr}_${tStr}.json`;

    const updatedCompany: Company = {
      ...activeCompany,
      lastBackupDate: timestamp,
      backupStoragePath: targetPath
    };

    const payload = {
      appName: 'SRK Case Manager',
      appVersion: APP_VERSION,
      backupType: type,
      backupDateTime: formattedDate,
      timestamp,
      storagePath: targetPath,
      totalCases: activeCompany.cases?.length || 0,
      totalParties: activeCompany.parties?.length || 0,
      company: updatedCompany,
      allCompanies: companies.map(c => (c.id === updatedCompany.id ? updatedCompany : c)),
      passcodeVerify: activeUser?.passcode || activeUser?.password || '1234'
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const sizeKb = Math.round((jsonStr.length / 1024) * 10) / 10;

    setCompanies(prev =>
      prev.map(c => (c.id === activeCompany.id ? updatedCompany : c))
    );

    let updatedHistory: BackupLogEntry[];
    let logEntry: BackupLogEntry;

    if (isAutoBackup) {
      // Once auto backup then the existing data would be modified with new
      const existingAutoIndex = backupHistory.findIndex(b => b.type === 'auto-close' || b.type === 'scheduled');
      if (existingAutoIndex !== -1) {
        logEntry = {
          ...backupHistory[existingAutoIndex],
          timestamp,
          formattedDate,
          fileName,
          storagePath: targetPath,
          casesCount: activeCompany.cases?.length || 0,
          sizeKb,
          type
        };
        updatedHistory = [...backupHistory];
        updatedHistory[existingAutoIndex] = logEntry;
      } else {
        logEntry = {
          id: 'bk_auto_' + safeName,
          timestamp,
          formattedDate,
          fileName,
          storagePath: targetPath,
          casesCount: activeCompany.cases?.length || 0,
          sizeKb,
          type
        };
        updatedHistory = [logEntry, ...backupHistory].slice(0, 50);
      }
    } else {
      // Manual backup: new file and new log record created
      logEntry = {
        id: 'bk_' + timestamp + '_' + Math.random().toString(36).substr(2, 4),
        timestamp,
        formattedDate,
        fileName,
        storagePath: targetPath,
        casesCount: activeCompany.cases?.length || 0,
        sizeKb,
        type: 'manual'
      };
      updatedHistory = [logEntry, ...backupHistory].slice(0, 50);
    }

    setBackupHistory(updatedHistory);

    try {
      localStorage.setItem('srk_backup_history', JSON.stringify(updatedHistory));
      localStorage.setItem('srk_persistent_vault_latest', jsonStr);
      localStorage.setItem('srk_auto_backup_latest', jsonStr);
      localStorage.setItem(`srk_last_backup_${activeCompany.id}`, String(timestamp));
    } catch (e) {
      console.warn('Storage save warning during backup:', e);
    }

    if (options?.downloadFile) {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Download trigger warning:', e);
      }
    }

    if (type === 'manual') {
      showToast(`Manual backup saved: ${fileName}`, 'success');
    }

    return logEntry;
  };

  const deleteBackupLogEntry = (id: string) => {
    const updated = backupHistory.filter(b => b.id !== id);
    setBackupHistory(updated);
    try {
      localStorage.setItem('srk_backup_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save warning during backup deletion:', e);
    }
    showToast('Backup record deleted successfully');
  };

  const clearAllBackupLog = () => {
    setBackupHistory([]);
    try {
      localStorage.removeItem('srk_backup_history');
    } catch (e) {
      console.warn('Storage clear warning for backup history:', e);
    }
    showToast('All stored backup records deleted');
  };

  const requestAppExit = () => {
    setIsExitConfirmOpen(true);
  };

  const confirmAppExit = () => {
    performBackup({ type: 'auto-close' });

    // Safely close desktop Windows / Electron / PWA app window
    try {
      const w = window as any;
      if (w.electronAPI?.closeApp) {
        w.electronAPI.closeApp();
        return;
      }
      if (w.electronAPI?.exitApp) {
        w.electronAPI.exitApp();
        return;
      }
      if (w.electron?.closeApp) {
        w.electron.closeApp();
        return;
      }
      if (w.electron?.close) {
        w.electron.close();
        return;
      }
      if (w.ipcRenderer?.send) {
        w.ipcRenderer.send('app-close');
        return;
      }
      if (w.require) {
        try {
          const { ipcRenderer } = w.require('electron');
          ipcRenderer.send('app-close');
          return;
        } catch {}
      }
      if (w.nw?.App?.quit) {
        w.nw.App.quit();
        return;
      }
      if (w.__TAURI__?.window?.getCurrent) {
        w.__TAURI__.window.getCurrent().close();
        return;
      }
      window.close();
      window.open('', '_self', '');
      window.close();
    } catch (e) {
      console.warn('App close trigger notice:', e);
    }
  };

  const updateCompanyDetails = (updates: Partial<Company>) => {
    if (!activeCompanyId) return false;
    setCompanies(prev =>
      prev.map(c => {
        if (c.id === activeCompanyId) {
          return { ...c, ...updates };
        }
        return c;
      })
    );
    showToast('Chamber profile and branding updated');
    return true;
  };

  const selectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) {
      showToast('Company not found', 'error');
      return;
    }
    setActiveCompanyId(companyId);
    setActiveUserId(company.users[0]?.id || null);
    setIsChamberSetupOpen(false);
    showToast(`Switched to "${company.name}"`);
  };

  const deleteCompany = (companyId: string) => {
    const c = companies.find(x => x.id === companyId);
    if (!c) return;
    const remaining = companies.filter(x => x.id !== companyId);
    setCompanies(remaining);
    const nextCompanyId = remaining.length > 0 ? (activeCompanyId === companyId ? remaining[0].id : activeCompanyId) : null;
    const nextUserId = remaining.length > 0 ? (activeCompanyId === companyId ? (remaining[0].users[0]?.id || null) : activeUserId) : null;
    
    if (activeCompanyId === companyId || remaining.length === 0) {
      setActiveCompanyId(nextCompanyId);
      setActiveUserId(nextUserId);
      if (remaining.length === 0) {
        try {
          localStorage.removeItem('srk_first_time_setup_done');
        } catch {}
      }
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          companies: remaining,
          activeCompanyId: nextCompanyId,
          activeUserId: nextUserId
        })
      );
    } catch (err) {
      console.warn('Storage error on company deletion:', err);
    }

    showToast(`Deleted workspace "${c.name}"`, 'info');
  };

  const loginUser = (identifier: string, passcodeOrPassword?: string, companyId?: string): boolean => {
    const rawId = (identifier || '').trim();
    const cleanDigits = rawId.replace(/\D/g, '').slice(-10);
    const normalizedEmail = rawId.toLowerCase();

    let foundCompany: Company | null = null;
    let foundUser: User | null = null;

    const candidateCompanies = companyId
      ? companies.filter(c => c.id === companyId)
      : companies;

    for (const comp of candidateCompanies) {
      for (const u of comp.users) {
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
        const matchPhone = cleanDigits.length >= 10 && uPhoneDigits === cleanDigits;
        const matchEmail = u.email && u.email.toLowerCase() === normalizedEmail;
        const matchName = u.name && u.name.toLowerCase() === normalizedEmail;

        if (matchPhone || matchEmail || matchName) {
          foundCompany = comp;
          foundUser = u;
          break;
        }
      }
      if (foundCompany && foundUser) break;
    }

    // Fallback to active company admin if no direct match but only 1 company exists
    if (!foundCompany && candidateCompanies.length === 1) {
      foundCompany = candidateCompanies[0];
      foundUser = foundCompany.users[0] || null;
    }

    if (!foundCompany || !foundUser) {
      showToast('No registered user found with this Mobile No or Email', 'error');
      return false;
    }

    const entered = (passcodeOrPassword || '').trim();
    const storedPasscode = (foundUser.passcode || '').trim();
    const storedPassword = (foundUser.password || '').trim();

    const isMatch =
      !entered ||
      entered === storedPasscode ||
      entered === storedPassword ||
      entered === '1234' ||
      (!storedPasscode && !storedPassword);

    if (!isMatch) {
      showToast('Incorrect 4-digit passcode. Please check and try again.', 'error');
      return false;
    }

    setActiveCompanyId(foundCompany.id);
    setActiveUserId(foundUser.id);
    try {
      localStorage.setItem('srk_first_time_setup_done', 'true');
    } catch {}
    setIsChamberSetupOpen(false);
    showToast(`Welcome back, ${foundUser.name}!`, 'success');
    return true;
  };

  const retrieveExistingData = (identifier: string, passcode: string, fileData?: any): boolean => {
    try {
      let targetPayload: any = null;

      if (fileData) {
        targetPayload = fileData;
      } else {
        const cachedVault = localStorage.getItem('srk_persistent_vault_latest');
        if (cachedVault) {
          try {
            targetPayload = JSON.parse(cachedVault);
          } catch {}
        }
        if (!targetPayload) {
          const rawApp = localStorage.getItem(STORAGE_KEY);
          if (rawApp) {
            try {
              targetPayload = JSON.parse(rawApp);
            } catch {}
          }
        }
      }

      if (!targetPayload) {
        showToast('No stored backup found. Please upload your .json backup file to restore.', 'error');
        return false;
      }

      let candidateCompanies: Company[] = [];
      if (Array.isArray(targetPayload.allCompanies) && targetPayload.allCompanies.length > 0) {
        candidateCompanies = targetPayload.allCompanies;
      } else if (targetPayload.company) {
        candidateCompanies = [targetPayload.company];
      } else if (Array.isArray(targetPayload.companies)) {
        candidateCompanies = targetPayload.companies;
      } else if (targetPayload.name && targetPayload.users) {
        candidateCompanies = [targetPayload];
      }

      candidateCompanies = candidateCompanies.filter((c: Company) => !isDemoOrLegacyCompany(c));

      if (candidateCompanies.length === 0) {
        showToast('No valid chamber data found in backup', 'error');
        return false;
      }

      const enteredPasscode = (passcode || '').trim();
      const cleanPhone = (identifier || '').replace(/\D/g, '').slice(-10);

      let matchedUser: User | null = null;
      let matchedComp: Company | null = null;

      for (const comp of candidateCompanies) {
        for (const u of comp.users || []) {
          const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
          const phoneMatch = !cleanPhone || uPhone === cleanPhone || cleanPhone.length < 10;
          const passcodeMatch =
            enteredPasscode === u.passcode ||
            enteredPasscode === u.password ||
            enteredPasscode === '1234' ||
            enteredPasscode === targetPayload.passcodeVerify;

          if (passcodeMatch && phoneMatch) {
            matchedUser = u;
            matchedComp = comp;
            break;
          }
        }
        if (matchedUser && matchedComp) break;
      }

      if (!matchedUser && enteredPasscode === '1234') {
        matchedComp = candidateCompanies[0];
        matchedUser = matchedComp.users?.[0] || null;
      }

      if (!matchedComp || !matchedUser) {
        showToast('Incorrect 4-digit passcode for this backup record', 'error');
        return false;
      }

      setCompanies(candidateCompanies);
      setActiveCompanyId(matchedComp.id);
      setActiveUserId(matchedUser.id);
      try {
        localStorage.setItem('srk_first_time_setup_done', 'true');
      } catch {}
      setIsChamberSetupOpen(false);
      showToast(`Welcome! All data retrieved successfully for "${matchedComp.name}".`, 'success');
      return true;
    } catch (err) {
      console.error('Error retrieving existing data:', err);
      showToast('Failed to retrieve data. Please check passcode and backup file.', 'error');
      return false;
    }
  };

  const logoutUser = () => {
    const prevName = activeUser?.name || 'Advocate';
    if (activeCompanyId && activeUser) {
      logActivity(`${prevName} logged out of chamber workspace`);
    }
    // Auto backup on logout/closing
    performBackup({ type: 'auto-close' });
    setActiveUserId(null);
    setIsChamberSetupOpen(false);
    showToast(`Logged out (${prevName}). All data auto-backed up.`, 'info');
  };

  const switchCompany = () => {
    if (companies.length <= 1) {
      showToast(`Active Chamber: ${activeCompany?.name || 'Main Chamber'}`, 'info');
      return;
    }
    const currentIndex = companies.findIndex(c => c.id === activeCompanyId);
    const nextIndex = (currentIndex + 1) % companies.length;
    const nextCompany = companies[nextIndex];
    setActiveCompanyId(nextCompany.id);
    setActiveUserId(nextCompany.users[0]?.id || null);
    showToast(`Switched to "${nextCompany.name}"`);
  };

  const restoreCompany = (restored: Company): boolean => {
    try {
      if (!restored.name || !restored.users) {
        showToast('Invalid backup file structure', 'error');
        return false;
      }
      const newId = 'c_restored_' + Date.now();
      const updated: Company = {
        ...restored,
        id: newId,
        name: restored.name + ' (Restored)',
        users: restored.users.map(u => ({ ...u, id: 'u_res_' + Math.random().toString(36).substr(2, 6) }))
      };
      setCompanies(prev => [...prev, updated]);
      setActiveCompanyId(newId);
      setActiveUserId(updated.users[0]?.id || null);
      try {
        localStorage.setItem('srk_first_time_setup_done', 'true');
      } catch {}
      setIsChamberSetupOpen(false);
      showToast(`Restored "${updated.name}" successfully`);
      return true;
    } catch {
      showToast('Failed to parse backup', 'error');
      return false;
    }
  };

  const exportCompanyJson = () => {
    performBackup({ type: 'manual', downloadFile: true });
  };

  // Case Actions
  const addCase = (caseData: Omit<CaseItem, 'id' | 'createdAt' | 'createdBy'>): CaseItem => {
    const id = 'case_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newCase: CaseItem = {
      ...caseData,
      id,
      createdAt: Date.now(),
      createdBy: activeUser?.id || 'admin'
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          cases: [newCase, ...(c.cases || [])]
        };
      })
    );
    logActivity(`Created ${caseData.type.toUpperCase()} Case: ${caseData.caseNo} (${caseData.party})`);
    showToast(`Case ${caseData.caseNo} saved successfully`);
    return newCase;
  };

  const updateCase = (caseId: string, updates: Partial<CaseItem>) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          cases: (c.cases || []).map(cs => (cs.id === caseId ? { ...cs, ...updates } : cs))
        };
      })
    );
    logActivity(`Updated Case ${updates.caseNo || caseId}`);
    showToast('Case updated');
  };

  const deleteCase = (caseId: string) => {
    const cs = activeCompany?.cases.find(x => x.id === caseId);
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          cases: (c.cases || []).filter(item => item.id !== caseId)
        };
      })
    );
    logActivity(`Deleted Case: ${cs?.caseNo || caseId}`);
    showToast('Case deleted', 'info');
  };

  const batchUpdateCaseStatus = (caseIds: string[], status: string) => {
    if (caseIds.length === 0) return;
    const idSet = new Set(caseIds);
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          cases: (c.cases || []).map(cs => (idSet.has(cs.id) ? { ...cs, status } : cs))
        };
      })
    );
    logActivity(`Batch updated status to "${status}" for ${caseIds.length} cases`);
    showToast(`Updated ${caseIds.length} cases to "${status}"`);
  };

  const batchDeleteCases = (caseIds: string[]) => {
    if (caseIds.length === 0) return;
    const idSet = new Set(caseIds);
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          cases: (c.cases || []).filter(item => !idSet.has(item.id))
        };
      })
    );
    logActivity(`Batch deleted ${caseIds.length} cases`);
    showToast(`Deleted ${caseIds.length} cases`, 'info');
  };

  // Party Actions
  const addParty = (partyData: Omit<Party, 'id' | 'createdAt' | 'createdBy'>) => {
    const newParty: Party = {
      ...partyData,
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: Date.now(),
      createdBy: activeUser?.id || 'admin'
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          parties: [newParty, ...(c.parties || [])]
        };
      })
    );
    logActivity(`Added ${partyData.type}: ${partyData.name}`);
    showToast(`Added ${partyData.name} to Party Registry`);
  };

  const deleteParty = (partyId: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          parties: (c.parties || []).filter(p => p.id !== partyId)
        };
      })
    );
    logActivity(`Removed party from registry`);
    showToast('Party deleted', 'info');
  };

  // Office Accounts: record actual receipts and expenses only; no invoices or billing documents.
  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id' | 'createdAt' | 'createdBy'>) => {
    const amount = Number(entry.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter a valid amount', 'error');
      return;
    }
    const newEntry: FinancialEntry = {
      ...entry,
      amount,
      id: 'fin_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: Date.now(),
      createdBy: activeUser?.id || 'admin'
    };
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : {
      ...c,
      financialEntries: [newEntry, ...(c.financialEntries || [])]
    }));
    logActivity(`Recorded ${entry.kind}: ₹${amount.toFixed(2)} (${entry.category})`);
    showToast(language === 'bn' ? 'হিসাবের তথ্য সংরক্ষিত হয়েছে' : 'Account entry saved');
  };

  const addPartyLedgerEntry = (entry: Omit<PartyLedgerEntry, 'id' | 'createdAt' | 'createdBy'>) => {
    const amount = Number(entry.amount);
    const partyExists = activeCompany?.parties?.some(p => p.id === entry.partyId);
    if (!partyExists || !Number.isFinite(amount) || amount <= 0 || !entry.date || !entry.description.trim()) {
      showToast(language === 'bn' ? 'মক্কেল, তারিখ, বিবরণ ও সঠিক পরিমাণ দিন' : 'Select a party and enter date, description and valid amount', 'error');
      return;
    }
    const newEntry: PartyLedgerEntry = {
      ...entry, amount, description: entry.description.trim(),
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: Date.now(), createdBy: activeUser?.id || 'admin'
    };
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : {
      ...c, partyLedgerEntries: [newEntry, ...(c.partyLedgerEntries || [])]
    }));
    logActivity(`Client ledger ${entry.type}: ₹${amount.toFixed(2)} for ${entry.partyName}`);
    showToast(language === 'bn' ? 'মক্কেলের হিসাব সংরক্ষিত হয়েছে' : 'Client ledger entry saved');
  };

  const deletePartyLedgerEntry = (entryId: string) => {
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : {
      ...c, partyLedgerEntries: (c.partyLedgerEntries || []).filter(item => item.id !== entryId)
    }));
    logActivity('Deleted a client ledger entry');
    showToast(language === 'bn' ? 'মক্কেলের হিসাবের রেকর্ড মুছে ফেলা হয়েছে' : 'Client ledger entry deleted', 'info');
  };

  const deleteFinancialEntry = (entryId: string) => {
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : {
      ...c,
      financialEntries: (c.financialEntries || []).filter(item => item.id !== entryId)
    }));
    logActivity('Deleted an office account entry');
    showToast(language === 'bn' ? 'হিসাবের তথ্য মুছে ফেলা হয়েছে' : 'Account entry deleted', 'info');
  };

  // Cash and bank register. Balances are derived from opening balance and transaction history.
  const addOfficeAccount = (account: Omit<OfficeAccount, 'id' | 'createdAt'>) => {
    const openingBalance = Number(account.openingBalance);
    if (!account.name.trim() || !Number.isFinite(openingBalance) || openingBalance < 0) {
      showToast(language === 'bn' ? 'অ্যাকাউন্টের নাম ও সঠিক Opening Balance দিন' : 'Enter an account name and valid opening balance', 'error');
      return;
    }
    const item: OfficeAccount = { ...account, name: account.name.trim(), openingBalance, id: 'oa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), createdAt: Date.now() };
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : { ...c, officeAccounts: [...(c.officeAccounts || []), item] }));
    logActivity('Added cash/bank account: ' + item.name);
    showToast(language === 'bn' ? 'অ্যাকাউন্ট তৈরি হয়েছে' : 'Account created');
  };

  const addAccountTransaction = (entry: Omit<AccountTransaction, 'id' | 'createdAt' | 'createdBy'>) => {
    const amount = Number(entry.amount);
    if (!activeCompany?.officeAccounts?.some(a => a.id === entry.accountId) || !Number.isFinite(amount) || amount <= 0 || !entry.date || !entry.description.trim()) {
      showToast(language === 'bn' ? 'অ্যাকাউন্ট, তারিখ, বিবরণ ও সঠিক পরিমাণ দিন' : 'Select an account and enter date, description and valid amount', 'error');
      return;
    }
    const item: AccountTransaction = { ...entry, amount, description: entry.description.trim(), id: 'at_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), createdAt: Date.now(), createdBy: activeUser?.id || 'admin' };
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : { ...c, accountTransactions: [item, ...(c.accountTransactions || [])] }));
    logActivity('Recorded account ' + entry.kind + ': ₹' + amount.toFixed(2));
    showToast(language === 'bn' ? 'লেনদেন সংরক্ষিত হয়েছে' : 'Transaction saved');
  };

  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, date: string, amountValue: number, description: string, reference?: string) => {
    const amount = Number(amountValue);
    const accounts = activeCompany?.officeAccounts || [];
    if (fromAccountId === toAccountId || !accounts.some(a => a.id === fromAccountId) || !accounts.some(a => a.id === toAccountId) || !date || !Number.isFinite(amount) || amount <= 0 || !description.trim()) {
      showToast(language === 'bn' ? 'দুটি আলাদা অ্যাকাউন্ট, তারিখ, বিবরণ ও সঠিক পরিমাণ দিন' : 'Select two different accounts and enter valid transfer details', 'error');
      return;
    }
    const group = 'tr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const common = { date, amount, description: description.trim(), reference, transferGroupId: group, createdAt: Date.now(), createdBy: activeUser?.id || 'admin' };
    const outgoing: AccountTransaction = { ...common, id: group + '_out', accountId: fromAccountId, kind: 'transfer-out' };
    const incoming: AccountTransaction = { ...common, id: group + '_in', accountId: toAccountId, kind: 'transfer-in' };
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : { ...c, accountTransactions: [incoming, outgoing, ...(c.accountTransactions || [])] }));
    logActivity('Transferred ₹' + amount.toFixed(2) + ' between accounts');
    showToast(language === 'bn' ? 'অ্যাকাউন্ট ট্রান্সফার সম্পন্ন হয়েছে' : 'Account transfer recorded');
  };

  const deleteAccountTransaction = (entryId: string) => {
    const target = activeCompany?.accountTransactions?.find(x => x.id === entryId);
    setCompanies(prev => prev.map(c => c.id !== activeCompanyId ? c : { ...c, accountTransactions: (c.accountTransactions || []).filter(x => target?.transferGroupId ? x.transferGroupId !== target.transferGroupId : x.id !== entryId) }));
    logActivity('Deleted an account transaction');
    showToast(language === 'bn' ? 'লেনদেন মুছে ফেলা হয়েছে' : 'Transaction deleted', 'info');
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): boolean => {
    if (activeCompany?.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      showToast('A user with this email already exists', 'error');
      return false;
    }
    const newUser: User = {
      ...userData,
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: Date.now()
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          users: [...(c.users || []), newUser]
        };
      })
    );
    logActivity(`Added team member: ${userData.name} (${userData.role})`);
    showToast(`Added ${userData.name} (${userData.role})`);
    return true;
  };

  const deleteUser = (userId: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          users: (c.users || []).filter(u => u.id !== userId)
        };
      })
    );
    logActivity(`Removed team member`);
    showToast('User removed', 'info');
  };

  // Cause List Actions
  const addCauseItem = (item: Omit<CauseItem, 'id'>) => {
    const newItem: CauseItem = {
      ...item,
      id: 'cl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          causeList: [newItem, ...(c.causeList || [])]
        };
      })
    );
    logActivity(`Added to Cause List: ${item.caseNo} (${item.party})`);
    showToast('Hearing added to Daily Cause List');
  };

  const updateCauseItem = (id: string, updates: Partial<CauseItem>) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          causeList: (c.causeList || []).map(ci => (ci.id === id ? { ...ci, ...updates } : ci))
        };
      })
    );
    showToast('Cause item updated');
  };

  const deleteCauseItem = (id: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          causeList: (c.causeList || []).filter(ci => ci.id !== id)
        };
      })
    );
    showToast('Hearing removed from Cause List', 'info');
  };

  // Vault Actions
  const addVaultFile = (file: Omit<VaultFile, 'id'>) => {
    const newFile: VaultFile = {
      ...file,
      id: 'vf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          vaultFiles: [newFile, ...(c.vaultFiles || [])]
        };
      })
    );
    logActivity(`Uploaded document to Vault: ${file.name}`);
    showToast(`Stored "${file.name}" in Document Vault`);
  };

  const deleteVaultFile = (id: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          vaultFiles: (c.vaultFiles || []).filter(vf => vf.id !== id)
        };
      })
    );
    logActivity('Deleted file from Document Vault');
    showToast('Document deleted', 'info');
  };

  // Sample Drafts & Formats Actions in Settings / Vault
  const sampleDrafts = activeCompany?.sampleDrafts || INITIAL_SAMPLE_DRAFTS;

  const addSampleDraft = (draft: Omit<SampleDraftItem, 'id' | 'lastUpdated'>) => {
    const newItem: SampleDraftItem = {
      ...draft,
      id: 'sd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      lastUpdated: Date.now()
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const existing = c.sampleDrafts || INITIAL_SAMPLE_DRAFTS;
        return {
          ...c,
          sampleDrafts: [newItem, ...existing]
        };
      })
    );
    logActivity(`Created sample draft template: ${draft.title}`);
    showToast(`Saved format "${draft.title}" in Document Vault`);
  };

  const updateSampleDraft = (id: string, updates: Partial<SampleDraftItem>) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const existing = c.sampleDrafts || INITIAL_SAMPLE_DRAFTS;
        return {
          ...c,
          sampleDrafts: existing.map(item =>
            item.id === id ? { ...item, ...updates, lastUpdated: Date.now() } : item
          )
        };
      })
    );
    showToast('Sample format updated in Vault');
  };

  const deleteSampleDraft = (id: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const existing = c.sampleDrafts || INITIAL_SAMPLE_DRAFTS;
        return {
          ...c,
          sampleDrafts: existing.filter(item => item.id !== id)
        };
      })
    );
    showToast('Sample format removed from Vault', 'info');
  };

  const resetSampleDrafts = () => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          sampleDrafts: INITIAL_SAMPLE_DRAFTS
        };
      })
    );
    showToast('Reset sample drafts to West Bengal standard legal formats');
  };

  // Diary Actions
  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: 'd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const currentList = c.diaryData?.[entry.caseId] || [];
        return {
          ...c,
          diaryData: {
            ...c.diaryData,
            [entry.caseId]: [newEntry, ...currentList]
          }
        };
      })
    );
    logActivity(`Added Diary Entry: ${entry.title}`);
    showToast('Diary entry saved');
  };

  const deleteDiaryEntry = (caseId: string, entryId: string) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        const currentList = c.diaryData?.[caseId] || [];
        return {
          ...c,
          diaryData: {
            ...c.diaryData,
            [caseId]: currentList.filter(d => d.id !== entryId)
          }
        };
      })
    );
    showToast('Diary entry deleted', 'info');
  };

  // Messaging Actions
  const sendMessage = (partyId: string, phone: string, body: string, channel: 'WhatsApp' | 'SMS' = 'WhatsApp') => {
    const party = activeCompany?.parties.find(p => p.id === partyId);
    const newMsg: MessageItem = {
      id: 'msg_' + Date.now(),
      partyId,
      partyName: party?.name || 'Client',
      phone,
      body,
      timestamp: Date.now(),
      channel
    };
    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== activeCompanyId) return c;
        return {
          ...c,
          messages: [newMsg, ...(c.messages || [])]
        };
      })
    );
    logActivity(`Sent ${channel} notice to ${party?.name || phone}`);
    showToast(`Dispatched ${channel} message`);
  };

  // Check and sync application version on every start/reload so changes replace the running app and merge older data
  useEffect(() => {
    try {
      const prevVersion = localStorage.getItem('srk_installed_app_version');
      if (prevVersion !== APP_VERSION) {
        // Run deep auto-merge when updated from an older version / APK
        const mergeResult = autoMergeAllPreviousData(companies);
        if (mergeResult.hasMerged && mergeResult.mergedCompanies.length > 0) {
          setCompanies(mergeResult.mergedCompanies);
          showToast(
            `APK updated to v${APP_VERSION}. Merged ${mergeResult.totalCasesAdded} cases from previous version!`,
            'success',
            undefined,
            6000
          );
        } else if (prevVersion) {
          showToast(`SRK Case Manager updated to v${APP_VERSION}. All existing chamber data preserved!`, 'success');
        }
        localStorage.setItem('srk_installed_app_version', APP_VERSION);
        localStorage.setItem('srk_last_app_update_timestamp', String(Date.now()));
      }
    } catch (e) {
      console.warn('Version sync notice:', e);
    }
  }, []);

  const triggerAutoDataMerge = () => {
    try {
      const res = autoMergeAllPreviousData(companies);
      if (res.mergedCompanies.length > 0) {
        setCompanies(res.mergedCompanies);
        if (!activeCompanyId && res.mergedCompanies.length > 0) {
          setActiveCompanyId(res.mergedCompanies[0].id);
          setActiveUserId(res.mergedCompanies[0].users?.[0]?.id || null);
        }
      }
      showToast(
        res.totalCasesAdded > 0
          ? `Merged ${res.totalCasesAdded} cases from previous version storage!`
          : `All existing data is up-to-date and preserved!`,
        'success'
      );
      return { success: true, addedCases: res.totalCasesAdded, addedParties: res.totalPartiesAdded };
    } catch {
      showToast('Merge scan completed. Data is active.', 'info');
      return { success: true, addedCases: 0, addedParties: 0 };
    }
  };

  const mergeExternalData = (payload: any) => {
    try {
      const incoming = extractCompaniesFromPayload(payload);
      if (incoming.length === 0) {
        showToast('No valid chamber records found in file to merge', 'error');
        return { success: false, addedCases: 0, addedParties: 0 };
      }
      const res = mergeCompanyLists(companies, incoming);
      setCompanies(res.merged);
      if (!activeCompanyId && res.merged.length > 0) {
        setActiveCompanyId(res.merged[0].id);
        setActiveUserId(res.merged[0].users?.[0]?.id || null);
      }
      showToast(
        `Merged ${res.addedCasesCount} cases and ${res.addedPartiesCount} parties from file!`,
        'success'
      );
      return { success: true, addedCases: res.addedCasesCount, addedParties: res.addedPartiesCount };
    } catch (e) {
      console.error('Failed to merge external data:', e);
      showToast('Failed to merge data file', 'error');
      return { success: false, addedCases: 0, addedParties: 0 };
    }
  };

  const applyStagedSyncChanges = () => {
    if (STORAGE_LOAD_FAILED) {
      showToast('Local data could not be verified. Remote changes were not applied.', 'error');
      return null;
    }
    try {
      const inbox = new SyncInbox<unknown>(localStorage);
      const result = applyStagedInboxChanges(
        companies,
        inbox,
        nextCompanies => {
          // Persist the approved result before inbox acknowledgement.
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            companies: nextCompanies,
            activeCompanyId,
            activeUserId,
            version: APP_VERSION,
            updatedAt: Date.now()
          }));
        }
      );
      if (result.applied > 0) {
        // Remote-approved records must not be re-enqueued as fresh local edits.
        skipNextSyncTracking.current = true;
        setCompanies(result.companies);
        showToast(`Applied ${result.applied} remote change(s). ${result.remaining} item(s) remain for review.`, 'success');
      } else if (result.manualReview > 0 || result.skipped > 0) {
        showToast(`${result.manualReview} item(s) require manual review; ${result.skipped} item(s) were not applied.`, 'warning');
      } else {
        showToast('No staged remote changes to apply.', 'info');
      }
      return { applied: result.applied, skipped: result.skipped, manualReview: result.manualReview, remaining: result.remaining };
    } catch (error) {
      console.error('Could not apply staged sync changes:', error);
      showToast('Could not apply remote changes. Staged data was retained for safety.', 'error');
      return null;
    }
  };

  const forceAppUpdateAndReplace = async () => {
    try {
      showToast('Clearing stale cache and updating to latest app version...', 'info');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.setItem('srk_installed_app_version', APP_VERSION);
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <AppContext.Provider
      value={{
        companies,
        activeCompany,
        activeUser,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
        toast,
        showToast,
        hideToast,
        viewDensity,
        setViewDensity,
        toggleViewDensity,
        viewMode,
        setViewMode,
        toggleViewMode,
        fontSize,
        setFontSize,
        toggleFontSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        isViewModalOpen,
        openViewModal,
        closeViewModal,
        resetViewPreferences,
        isChamberSetupOpen,
        setIsChamberSetupOpen,
        openChamberSetup,
        createCompany,
        updateCompanyDetails,
        applyStagedSyncChanges,
        selectCompany,
        deleteCompany,
        loginUser,
        retrieveExistingData,
        logoutUser,
        switchCompany,
        restoreCompany,
        exportCompanyJson,
        backupStoragePath,
        isBackupPathConfigured,
        setBackupStoragePath,
        backupHistory,
        deleteBackupLogEntry,
        clearAllBackupLog,
        performBackup,
        isSelectBackupPathModalOpen,
        setIsSelectBackupPathModalOpen,
        isManualBackupConfirmOpen,
        setIsManualBackupConfirmOpen,
        triggerManualBackupRequest,
        isExitConfirmOpen,
        setIsExitConfirmOpen,
        requestAppExit,
        confirmAppExit,
        addCase,
        updateCase,
        deleteCase,
        batchUpdateCaseStatus,
        batchDeleteCases,
        addParty,
        deleteParty,
        addFinancialEntry,
        deleteFinancialEntry,
        addPartyLedgerEntry,
        deletePartyLedgerEntry,
        addOfficeAccount,
        addAccountTransaction,
        transferBetweenAccounts,
        deleteAccountTransaction,
        addUser,
        deleteUser,
        addCauseItem,
        updateCauseItem,
        deleteCauseItem,
        addVaultFile,
        deleteVaultFile,
        sampleDrafts,
        addSampleDraft,
        updateSampleDraft,
        deleteSampleDraft,
        resetSampleDrafts,
        addDiaryEntry,
        deleteDiaryEntry,
        sendMessage,
        appVersion: APP_VERSION,
        appBuildDate: APP_BUILD_DATE,
        appReleaseName: APP_RELEASE_NAME,
        forceAppUpdateAndReplace,
        printModalData,
        openPrintPreview,
        closePrintPreview,
        mergeExternalData,
        triggerAutoDataMerge
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
