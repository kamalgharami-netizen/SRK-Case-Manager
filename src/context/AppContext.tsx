import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, User, CaseItem, Party, CauseItem, VaultFile, DiaryEntry, MessageItem } from '../types';

const STORAGE_KEY = 'srk_case_manager_v4';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  companies: Company[];
  activeCompany: Company | null;
  activeUser: User | null;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
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
    },
    admin: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }
  ) => boolean;
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
      // Clear legacy storage keys containing demo company
      localStorage.removeItem('srk_case_manager_v3');
      localStorage.removeItem('srk_case_manager_v2');
      localStorage.removeItem('srk_case_manager_v1');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companies && Array.isArray(parsed.companies) && parsed.companies.length > 0) {
          // Exclude any demo company IDs
          const realCompanies = parsed.companies.filter((c: Company) => c.id !== 'c_srk_main_01');
          return realCompanies;
        }
      }
    } catch (e) {
      console.error('Failed to load companies from localStorage', e);
    }
    return [];
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeCompanyId && parsed.activeCompanyId !== 'c_srk_main_01') {
          return parsed.activeCompanyId;
        }
      }
    } catch {}
    return null;
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeUserId && parsed.activeUserId !== 'u_admin_srk') {
          return parsed.activeUserId;
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

  const activeCompany = companies.find(c => c.id === activeCompanyId) || null;
  const activeUser = activeCompany?.users.find(u => u.id === activeUserId) || null;

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
    showToast(`Workspace "${details.name}" created successfully`);
    return true;
  };

  const selectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) {
      showToast('Company not found', 'error');
      return;
    }
    setActiveCompanyId(companyId);
    setActiveUserId(null); // Require login for security
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
    setActiveUserId(null);
    showToast('Logged out of session', 'info');
  };

  const switchCompany = () => {
    setActiveUserId(null);
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
        toast,
        showToast,
        createCompany,
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
