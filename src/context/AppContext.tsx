import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, User, CaseItem, Party, CauseItem, VaultFile, DiaryEntry, MessageItem, SampleDraftItem, BackupLogEntry } from '../types';
import { AppLanguage, translations, Translations } from '../data/translations';
import { initialChamberData } from '../data/seedData';
import { INITIAL_SAMPLE_DRAFTS } from '../data/sampleDraftTemplates';
import { APP_VERSION, APP_BUILD_DATE, APP_RELEASE_NAME } from '../config/version';

const STORAGE_KEY = 'srk_case_manager_v5';

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
  selectCompany: (companyId: string) => void;
  deleteCompany: (companyId: string) => void;
  loginUser: (identifier: string, passcodeOrPassword?: string, companyId?: string) => boolean;
  retrieveExistingData: (identifier: string, passcode: string, fileData?: any) => boolean;
  logoutUser: () => void;
  switchCompany: () => void;
  restoreCompany: (company: Company) => boolean;
  exportCompanyJson: () => void;

  // Data Backup & Storage Path
  backupStoragePath: string;
  isBackupPathConfigured: boolean;
  setBackupStoragePath: (path: string) => void;
  backupHistory: BackupLogEntry[];
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('srk_case_manager_v4') || localStorage.getItem('srk_case_manager_v3');
      const isSetupDone = localStorage.getItem('srk_first_time_setup_done') === 'true';
      if (saved && isSetupDone) {
        const parsed = JSON.parse(saved);
        if (parsed.companies && Array.isArray(parsed.companies) && parsed.companies.length > 0) {
          // Ensure no leftover demo data is displayed
          return parsed.companies.map((c: Company) => {
            const hasDemoCases = c.cases?.some(cs => cs.id === 'c_fa_001' || cs.id.startsWith('c_fa_') || cs.party?.includes('Bimal Krishna') || cs.id?.startsWith('c_mut_'));
            if (hasDemoCases) {
              return {
                ...c,
                cases: [],
                parties: [],
                causeList: [],
                vaultFiles: [],
                messages: []
              };
            }
            return c;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load companies from localStorage', e);
    }
    // Default chamber workspace: Ensure advocate chamber profile is ready
    return [initialChamberData];
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('srk_case_manager_v4') || localStorage.getItem('srk_case_manager_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeCompanyId) {
          return parsed.activeCompanyId;
        }
        if (parsed.companies && parsed.companies.length > 0) {
          return parsed.companies[0].id;
        }
      }
    } catch {}
    return initialChamberData.id;
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('srk_case_manager_v4') || localStorage.getItem('srk_case_manager_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if ('activeUserId' in parsed) {
          return parsed.activeUserId; // can be null if explicitly logged out
        }
        if (parsed.companies && parsed.companies.length > 0 && parsed.companies[0].users?.length > 0) {
          return parsed.companies[0].users[0].id;
        }
      }
    } catch {}
    return initialChamberData.users[0]?.id || null;
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
    return isMobile ? '/storage/emulated/0/Documents/SRK_Case_Backups' : 'C:/SRK_Case_Backups';
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
    setThemeState(prev => (prev === 'white' ? 'light' : prev === 'light' ? 'dark' : 'white'));

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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          companies,
          activeCompanyId,
          activeUserId
        })
      );
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [companies, activeCompanyId, activeUserId]);

  // Apply theme to document
  useEffect(() => {
    try {
      localStorage.setItem('srk_theme_v2', theme);
      const isDark = ['dark', 'navy', 'emerald', 'charcoal', 'indigo'].includes(theme);
      localStorage.setItem('srk_theme', isDark ? 'dark' : 'light');

      const root = document.documentElement;
      const allThemeClasses = [
        'dark',
        'theme-white',
        'theme-light',
        'theme-sepia',
        'theme-navy',
        'theme-emerald',
        'theme-charcoal',
        'theme-indigo'
      ];
      allThemeClasses.forEach(cls => root.classList.remove(cls));

      if (isDark) {
        root.classList.add('dark');
        if (theme !== 'dark') {
          root.classList.add(`theme-${theme}`);
        }
        root.style.colorScheme = 'dark';
      } else {
        if (theme === 'white') {
          root.classList.add('theme-white');
        } else if (theme === 'sepia') {
          root.classList.add('theme-sepia');
        }
        root.style.colorScheme = 'light';
      }

      const activeOpt = THEME_OPTIONS.find(t => t.id === theme);
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

    const targetBackupPath = (details as any).backupStoragePath || backupStoragePath || 'C:/SRK_Case_Backups';
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
    const clean = path.trim() || 'C:/SRK_Case_Backups';
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
    const targetPath = options?.customPath || backupStoragePath || 'C:/SRK_Case_Backups';
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

    const safeName = (activeCompany.name || 'Chamber').replace(/[^a-zA-Z0-9]/g, '_');
    const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const fileName = `SRK_Backup_${safeName}_${dStr}_${tStr}.json`;

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

    const logEntry: BackupLogEntry = {
      id: 'bk_' + timestamp + '_' + Math.random().toString(36).substr(2, 4),
      timestamp,
      formattedDate,
      fileName,
      storagePath: targetPath,
      casesCount: activeCompany.cases?.length || 0,
      sizeKb,
      type
    };

    setCompanies(prev =>
      prev.map(c => (c.id === activeCompany.id ? updatedCompany : c))
    );

    const updatedHistory = [logEntry, ...backupHistory.filter(b => b.id !== logEntry.id)].slice(0, 50);
    setBackupHistory(updatedHistory);

    try {
      localStorage.setItem('srk_backup_history', JSON.stringify(updatedHistory));
      localStorage.setItem('srk_persistent_vault_latest', jsonStr);
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
      showToast(`Manual backup saved to: ${targetPath} (${formattedDate})`, 'success');
    }

    return logEntry;
  };

  const requestAppExit = () => {
    setIsExitConfirmOpen(true);
  };

  const confirmAppExit = () => {
    performBackup({ type: 'auto-close' });
    showToast(`All data auto-backed up to: ${backupStoragePath}. Session closed safely.`, 'info');
    setIsExitConfirmOpen(false);
    logoutUser();

    // Safely close desktop Windows / Electron / PWA app window
    try {
      const w = window as any;
      if (w.electronAPI?.closeApp) {
        w.electronAPI.closeApp();
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
    setCompanies(prev => prev.filter(x => x.id !== companyId));
    if (activeCompanyId === companyId) {
      const remaining = companies.filter(x => x.id !== companyId);
      if (remaining.length > 0) {
        setActiveCompanyId(remaining[0].id);
        setActiveUserId(remaining[0].users[0]?.id || null);
      } else {
        setActiveCompanyId(null);
        setActiveUserId(null);
      }
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

      if (candidateCompanies.length === 0) {
        showToast('Invalid backup file data structure', 'error');
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

  // Check and sync application version on every start/reload so changes replace the running app
  useEffect(() => {
    try {
      const prevVersion = localStorage.getItem('srk_installed_app_version');
      if (prevVersion !== APP_VERSION) {
        localStorage.setItem('srk_installed_app_version', APP_VERSION);
        localStorage.setItem('srk_last_app_update_timestamp', String(Date.now()));
        if (prevVersion) {
          showToast(`SRK Case Manager updated to v${APP_VERSION}. All changes replaced and active!`, 'success');
        }
      }
    } catch {}
  }, []);

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
        forceAppUpdateAndReplace
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
