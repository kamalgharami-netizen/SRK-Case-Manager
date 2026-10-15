import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, User, CaseItem, Party, CauseItem, VaultFile, DiaryEntry, MessageItem, SampleDraftItem } from '../types';
import { AppLanguage, translations, Translations } from '../data/translations';
import { initialChamberData } from '../data/seedData';
import { INITIAL_SAMPLE_DRAFTS } from '../data/sampleDraftTemplates';

const STORAGE_KEY = 'srk_case_manager_v4';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ViewDensity = 'comfortable' | 'compact';
export type ViewMode = 'grid' | 'table';
export type FontSize = 'normal' | 'large';

interface AppContextType {
  companies: Company[];
  activeCompany: Company | null;
  activeUser: User | null;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

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
    },
    admin: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }
  ) => boolean;
  updateCompanyDetails: (details: Partial<Company>) => boolean;
  selectCompany: (companyId: string) => void;
  deleteCompany: (companyId: string) => void;
  loginUser: (email: string, password?: string) => boolean;
  logoutUser: () => void;
  switchCompany: () => void;
  restoreCompany: (company: Company) => boolean;
  exportCompanyJson: () => void;

  // Case Actions
  addCase: (caseData: Omit<CaseItem, 'id' | 'createdAt' | 'createdBy'>) => CaseItem;
  updateCase: (caseId: string, updates: Partial<CaseItem>) => void;
  deleteCase: (caseId: string) => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
    // First time opening the app: Empty, company creation is mandatory!
    return [];
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const isSetupDone = localStorage.getItem('srk_first_time_setup_done') === 'true';
      if (saved && isSetupDone) {
        const parsed = JSON.parse(saved);
        if (parsed.activeCompanyId) {
          return parsed.activeCompanyId;
        }
        if (parsed.companies && parsed.companies.length > 0) {
          return parsed.companies[0].id;
        }
      }
    } catch {}
    return null;
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const isSetupDone = localStorage.getItem('srk_first_time_setup_done') === 'true';
      if (saved && isSetupDone) {
        const parsed = JSON.parse(saved);
        if (parsed.activeUserId) {
          return parsed.activeUserId;
        }
        if (parsed.companies && parsed.companies.length > 0 && parsed.companies[0].users?.length > 0) {
          return parsed.companies[0].users[0].id;
        }
      }
    } catch {}
    return null;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('srk_theme');
      if (savedTheme === 'dark') return 'dark';
    } catch {}
    return 'light';
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

  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  const resetViewPreferences = () => {
    setViewDensityState('comfortable');
    setViewModeState('grid');
    setFontSizeState('normal');
    setHighContrastState(false);
    setThemeState('light');
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
      localStorage.setItem('srk_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const activeCompany = companies.find(c => c.id === activeCompanyId) || (companies.length > 0 ? companies[0] : null);
  const activeUser = activeCompany ? (activeCompany.users.find(u => u.id === activeUserId) || activeCompany.users[0] || null) : null;

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

    const adminUser: User = {
      id: newUserId,
      name: admin.name,
      email: admin.email.toLowerCase(),
      phone: admin.phone,
      role: 'Admin',
      password: admin.password,
      isMain: true,
      createdAt: Date.now()
    };

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
      phone: details.phone,
      email: details.email,
      logoUrl: details.logoUrl,
      logoBadge: details.logoBadge || 'scales',
      logoColor: details.logoColor || '#2563EB',
      createdAt: Date.now(),
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
    showToast(`Workspace "${details.name}" created successfully`);
    return true;
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

  const loginUser = (email: string, password?: string): boolean => {
    if (!activeCompany) {
      showToast('Please select a company first', 'error');
      return false;
    }
    const user = activeCompany.users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) {
      showToast('No user found with this email', 'error');
      return false;
    }
    if (user.password && password && user.password !== password) {
      showToast('Incorrect password', 'error');
      return false;
    }
    setActiveUserId(user.id);
    showToast(`Welcome back, ${user.name}`);
    return true;
  };

  const logoutUser = () => {
    showToast(`Current active advocate: ${activeUser?.name || 'Admin'}`, 'info');
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
    if (!activeCompany) return;
    const jsonStr = JSON.stringify(activeCompany, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRK_Backup_${activeCompany.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Exported complete chamber workspace data');
    showToast('Workspace backup exported');
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
        logoutUser,
        switchCompany,
        restoreCompany,
        exportCompanyJson,
        addCase,
        updateCase,
        deleteCase,
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
        sendMessage
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
