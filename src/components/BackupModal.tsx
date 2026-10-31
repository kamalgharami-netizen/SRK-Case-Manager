import React, { useRef, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building2,
  Plus,
  Users,
  ShieldAlert,
  SlidersHorizontal,
  Sun,
  Palette,
  Archive,
  Download,
  Upload,
  Trash2,
  LogOut,
  FolderOpen,
  Eye,
  X,
  AlertTriangle,
  Check,
  CheckCircle2,
  UserPlus,
  Activity,
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  Type,
  LayoutGrid,
  List,
  ArrowRight,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { CompanyLogo, BADGE_OPTIONS, COLOR_OPTIONS } from './CompanyLogo';
import { THEME_OPTIONS } from '../data/themes';
import { VaultFile, Role } from '../types';
import {
  connectWindowsGoogleDrive,
  disconnectWindowsGoogleDrive,
  getWindowsGoogleDriveCredentials,
} from '../services/googleDriveWindowsAuth';
import {
  connectAndroidGoogleDrive,
  disconnectAndroidGoogleDrive,
  getAndroidGoogleDriveCredentials,
} from '../services/googleDriveAndroidAuth';
import {
  getSelectedGoogleDriveFolder,
  type SelectedGoogleDriveFolder,
} from '../services/googleDriveSelectedFolder';
import { getValidWindowsGoogleDriveCredentials } from '../services/googleDriveWindowsAuth';
import { getValidAndroidGoogleDriveCredentials } from '../services/googleDriveAndroidAuth';
import { SyncJournal } from '../services/syncJournal';
import type { SyncConflict } from '../services/driveSyncProtocol';
import { SyncInbox } from '../services/googleDriveSyncInbox';
import { syncGoogleDriveNow } from '../services/googleDriveSyncCoordinator';

export const VAULT_CATEGORIES = [
  'Mutation Petitions & Orders',
  'Misc Case Petitions & Orders',
  'First Appeal Drafts & Petitions',
  'LR Appeal Drafts & Petitions',
  'WBLRTT Tribunal Applications',
  'RTI Applications & Appeals',
  'Conversion Applications & Sanctions',
  'Registered Deeds & Title Documents',
  'Khatian Copies & Land Records',
  'Court Orders & Precedents',
  'General Legal Formats & Affidavits'
];

export type SettingsTab = 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup' | 'sync';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chambers'
}) => {
  const {
    companies,
    activeCompany,
    activeUser,
    selectCompany,
    deleteCompany,
    openChamberSetup,
    updateCompanyDetails,
    applyStagedSyncChanges,
    addUser,
    deleteUser,
    theme,
    setTheme,
    viewDensity,
    setViewDensity,
    viewMode,
    setViewMode,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    resetViewPreferences,
    exportCompanyJson,
    restoreCompany,
    showToast,
    addVaultFile,
    deleteVaultFile,
    logoutUser,
    backupStoragePath,
    backupHistory,
    deleteBackupLogEntry,
    clearAllBackupLog,
    triggerManualBackupRequest,
    setIsSelectBackupPathModalOpen,
    language,
    t,
    mergeExternalData,
    triggerAutoDataMerge,
    resolveSyncConflict
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const vaultUploadInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [syncCounts, setSyncCounts] = useState({ pending: 0, staged: 0, conflicts: 0, error: false });
  const [driveAuthStatus, setDriveAuthStatus] = useState<'checking' | 'disconnected' | 'authorized' | 'unsupported' | 'error'>('disconnected');
  const [driveAuthBusy, setDriveAuthBusy] = useState(false);
  const [selectedDriveFolder, setSelectedDriveFolder] = useState<SelectedGoogleDriveFolder | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict<unknown>[]>([]);

  const refreshSyncCounts = () => {
    try {
      const readCount = (key: string, field: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return 0;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed?.[field]) ? parsed[field].length : 0;
      };
      const conflicts = new SyncJournal<unknown>(localStorage).getConflicts();
      setSyncConflicts(conflicts);
      setSyncCounts({ pending: readCount('srk_sync_journal_v1', 'pending'), staged: readCount('srk_sync_inbox_v1', 'changes'), conflicts: conflicts.length, error: false });
    } catch {
      setSyncCounts(previous => ({ ...previous, error: true }));
    }
  };

  // Vault Tab state - category dropdown selection strictly without 'All'
  const [selectedVaultCategory, setSelectedVaultCategory] = useState<string>(VAULT_CATEGORIES[0]);
  const [fileSearch, setFileSearch] = useState('');

  // Preview popup state
  const [previewVaultFile, setPreviewVaultFile] = useState<VaultFile | null>(null);

  // Company delete confirmation state
  const [showDeleteCompanyConfirm, setShowDeleteCompanyConfirm] = useState(false);

  // Add Member state inside Team tab
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Role>('Junior Advocate');
  const [newMemberPasscode, setNewMemberPasscode] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'sync') refreshSyncCounts();
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'sync') return;
    const isAndroid = Capacitor.getPlatform() === 'android';
    const isWindowsDesktop = typeof window !== 'undefined' &&
      Boolean((window as Window & { electronAPI?: { googleOAuth?: unknown } })
        .electronAPI?.googleOAuth);
    if (!isAndroid && !isWindowsDesktop) {
      setDriveAuthStatus('unsupported');
      return;
    }
    let active = true;
    setDriveAuthStatus('checking');
    setSelectedDriveFolder(getSelectedGoogleDriveFolder());
    const credentialCheck = isAndroid
      ? getAndroidGoogleDriveCredentials()
      : getWindowsGoogleDriveCredentials();
    credentialCheck
      .then(credentials => {
        if (active) setDriveAuthStatus(credentials ? 'authorized' : 'disconnected');
      })
      .catch(() => {
        if (active) setDriveAuthStatus('error');
      });
    return () => { active = false; };
  }, [isOpen, activeTab]);

  const handleConnectGoogleDrive = async () => {
    setDriveAuthBusy(true);
    try {
      const result = Capacitor.getPlatform() === 'android'
        ? await connectAndroidGoogleDrive()
        : await connectWindowsGoogleDrive();
      setSelectedDriveFolder(result.folder);
      setDriveAuthStatus('authorized');
      showToast('Google account authorized and Drive folder selected. Sync is not yet active.', 'success');
    } catch (error) {
      setDriveAuthStatus('error');
      showToast(error instanceof Error ? error.message : 'Google sign-in failed.', 'error');
    } finally {
      setDriveAuthBusy(false);
    }
  };


  const handleSyncGoogleDriveNow = async () => {
    if (syncBusy) return;
    setSyncBusy(true);
    setSyncMessage('Synchronisation started…');
    try {
      const folder = getSelectedGoogleDriveFolder();
      if (!folder?.id) throw new Error('Select a Google Drive folder before syncing.');
      const credentials = Capacitor.getPlatform() === 'android'
        ? await getValidAndroidGoogleDriveCredentials()
        : await getValidWindowsGoogleDriveCredentials();
      const journal = new SyncJournal<unknown>(localStorage);
      const inbox = new SyncInbox<unknown>(localStorage);
      const pageTokenKey = `srk_drive_sync_page_token_v1_${folder.id}`;
      const pageToken = localStorage.getItem(pageTokenKey) || undefined;
      const result = await syncGoogleDriveNow(journal, inbox, {
        accessToken: credentials.accessToken,
        folderId: folder.id,
        pageToken,
        pullMaxPages: 10,
        pushBatchSize: 25,
      });
      if (result.nextPageToken) localStorage.setItem(pageTokenKey, result.nextPageToken);
      else localStorage.removeItem(pageTokenKey);
      refreshSyncCounts();
      setSyncMessage(
        `Completed: downloaded ${result.pulled.downloaded}, staged ${result.staged}, uploaded ${result.pushed.uploaded}, conflicts ${result.conflicts}. Pending local: ${result.remainingOutbox}; awaiting review: ${result.remainingInbox}.${result.nextPageToken ? ' More remote pages remain; press Sync Now again to continue.' : ' Remote listing is up to date.'}`
      );
      showToast('Google Drive sync cycle completed. Remote changes remain staged for review.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google Drive sync failed.';
      setSyncMessage(message);
      showToast(message, 'error');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    if (!window.confirm('Remove the Google sign-in credentials stored by this app? No Google Drive files will be deleted.')) return;
    setDriveAuthBusy(true);
    try {
      if (Capacitor.getPlatform() === 'android') {
        await disconnectAndroidGoogleDrive();
      } else {
        await disconnectWindowsGoogleDrive();
      }
      setDriveAuthStatus('disconnected');
      setSelectedDriveFolder(null);
      showToast('Google sign-in credentials and selected folder removed from this device.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to disconnect Google.', 'error');
    } finally {
      setDriveAuthBusy(false);
    }
  };

  if (!isOpen || !activeCompany) return null;

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const ok = restoreCompany(parsed);
        if (ok) onClose();
      } catch {
        showToast('Invalid backup file JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMergeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        mergeExternalData(parsed);
      } catch {
        showToast('Invalid backup file JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      updateCompanyDetails({ logoUrl: dataUrl });
      showToast('Dynamic custom logo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBadge = (badgeId: string) => {
    updateCompanyDetails({
      logoBadge: badgeId as any,
      logoUrl: undefined
    });
  };

  const handleSelectColor = (colorId: string) => {
    updateCompanyDetails({ logoColor: colorId });
  };

  const handleRemoveCustomLogo = () => {
    updateCompanyDetails({ logoUrl: undefined });
    showToast('Switched to dynamic insignia crest');
  };

  // Vault File Upload Handler
  const handleVaultFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    Array.from(uploaded).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      let fType: 'pdf' | 'doc' | 'img' | 'other' = 'other';
      if (ext === 'pdf') fType = 'pdf';
      else if (['doc', 'docx'].includes(ext || '')) fType = 'doc';
      else if (['jpg', 'jpeg', 'png'].includes(ext || '')) fType = 'img';

      const sizeStr =
        f.size < 1024 * 1024
          ? (f.size / 1024).toFixed(1) + ' KB'
          : (f.size / (1024 * 1024)).toFixed(2) + ' MB';

      addVaultFile({
        name: f.name,
        size: sizeStr,
        type: fType,
        date: new Date().toISOString().slice(0, 10),
        category: selectedVaultCategory,
        aiLearned: true,
        aiTrackedCategory: selectedVaultCategory
      });
    });

    showToast(`Files uploaded under "${selectedVaultCategory}". Tracked by AI exclusively for this category.`);
    if (vaultUploadInputRef.current) {
      vaultUploadInputRef.current.value = '';
    }
  };

  const vaultFiles = activeCompany?.vaultFiles || [];
  const filteredFiles = vaultFiles.filter(f => {
    const matchCat = f.category === selectedVaultCategory || f.aiTrackedCategory === selectedVaultCategory;
    const q = fileSearch.toLowerCase().trim();
    const matchSearch = !q || f.name.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleDeleteChamber = () => {
    const name = activeCompany.name;
    deleteCompany(activeCompany.id);
    setShowDeleteCompanyConfirm(false);
    onClose();
    showToast(`Chamber "${name}" deleted.`);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      showToast('Member name is required', 'error');
      return;
    }
    if (!newMemberEmail.trim()) {
      showToast('Email address is required', 'error');
      return;
    }
    const cleanPasscode = newMemberPasscode.replace(/\D/g, '').slice(0, 4) || '1234';

    const ok = addUser({
      name: newMemberName.trim(),
      email: newMemberEmail.trim().toLowerCase(),
      phone: newMemberPhone.trim(),
      role: newMemberRole,
      password: cleanPasscode,
      passcode: cleanPasscode,
      isMain: false
    });

    if (ok) {
      setIsAddMemberOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      setNewMemberRole('Junior Advocate');
      setNewMemberPasscode('');
      showToast(`Added ${newMemberName} to chamber team`);
    }
  };

  const roleColors: Record<Role, string> = {
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    'Junior Advocate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    Clerk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    Accountant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Settings (সেটিংস ও কনফিগারেশন)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage firm workspaces, switch chambers, team staff, display preferences, Document Vault, and data backups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                logoutUser();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Logout from Chamber Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <CompanyLogo company={activeCompany} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Unified Tab Navigator */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('chambers')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'chambers'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Chambers, + Firm & Switch"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">Chambers &amp; Switch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'team'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Team & Chamber Staff"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate">Team &amp; Staff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'display'
                ? 'bg-white text-blue-700 shadow-xs font-extrabold ring-1 ring-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Theme & Display Settings (কালার থিম ও ডিসপ্লে)"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">Theme &amp; Display</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'branding'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Logo & Brand Crest"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">Logo &amp; Brand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'vault'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Document Vault"
          >
            <Archive className="w-3.5 h-3.5 text-violet-600" />
            <span className="truncate">Document Vault</span>
          </button>

          <button type="button" onClick={() => setActiveTab('sync')} className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${activeTab === 'sync' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`} title="Google Drive Synchronisation">
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" /><span className="truncate">Sync Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Data Backup & Storage"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">Data Backup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Chambers & Workspaces (+ Firm & Switch) */}
          {activeTab === 'chambers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <CompanyLogo company={activeCompany} size="lg" />
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Currently Active Chamber (বর্তমান সক্রিয় চেম্বার)
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {activeCompany.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activeCompany.city}, {activeCompany.state} · {activeCompany.cases?.length || 0} Cases · {activeCompany.users?.length || 0} Members
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openChamberSetup();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Register New Firm (+ নতুন ফার্ম)</span>
                </button>
              </div>

              {/* Chamber Workspaces Switch List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Switch Chamber Workspace ({companies.length} Registered)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {companies.map(c => {
                    const isActive = c.id === activeCompany.id;
                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isActive
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-600/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <CompanyLogo company={c} size="md" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {c.city} · {c.type}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Reg: {c.barCouncil || 'WB/Chamber'} · {c.cases?.length || 0} cases
                              </div>
                            </div>
                          </div>

                          {isActive ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shrink-0">
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                selectCompany(c.id);
                                showToast(`Switched workspace to "${c.name}"`);
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                            >
                              <span>Switch</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {!isActive && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Permanently delete chamber "${c.name}"?`)) {
                                  deleteCompany(c.id);
                                }
                              }}
                              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>Delete Chamber</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Team & Chamber Staff (Shifted to Settings!) */}
          {activeTab === 'team' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                <div>
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>Chamber Team &amp; Staff (টিম ও স্টাফ ম্যানেজমেন্ট)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage associate advocates, junior advocates, clerks, and accountants for {activeCompany.name}.
                  </p>
                </div>

                {activeUser?.role === 'Admin' && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAddMemberOpen ? 'Cancel' : '+ Add Chamber Member'}</span>
                  </button>
                )}
              </div>

              {/* Add Member Form */}
              {isAddMemberOpen && (
                <form
                  onSubmit={handleCreateMember}
                  className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    New Member Registration
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        placeholder="e.g. Adv. Amit Sen"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="sen.advocate@gmail.com"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={newMemberPhone}
                        onChange={e => setNewMemberPhone(e.target.value)}
                        placeholder="9830012345"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Role Designation
                      </label>
                      <select
                        value={newMemberRole}
                        onChange={e => setNewMemberRole(e.target.value as Role)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="Junior Advocate">Junior Advocate</option>
                        <option value="Clerk">Clerk / Muhuri</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Admin">Admin / Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-500">
                      Default 4-digit passcode: <strong>1234</strong>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddMemberOpen(false)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Save Member
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(activeCompany.users || []).map(u => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                          <span>{u.name}</span>
                          {u.isMain && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                              Lead
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {u.email} {u.phone ? `· ${u.phone}` : ''}
                        </div>
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!u.isMain && activeUser?.role === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${u.name} from chamber staff?`)) {
                            deleteUser(u.id);
                            showToast(`Removed ${u.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Remove User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Display & View Settings (Shifted to Settings!) */}
          {activeTab === 'display' && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs font-bold text-cyan-900 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                    <span>Display &amp; View Settings (ডিসপ্লে ও ভিউ কনফিগারেশন)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize courtroom theme, reading typography scale, case cards density, and high contrast.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetViewPreferences}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              {/* Theme Modes */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span>Courtroom Color Theme (কালার থিম নির্বাচন)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        theme === opt.id
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-5 h-5 rounded-full border shadow-2xs"
                          style={{ backgroundColor: opt.bgHex }}
                        />
                        {theme === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                      <div className="text-[10px] text-slate-500">{opt.nameBn}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Information Density & View Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>View Density (তথ্য ঘনত্ব)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewDensity('comfortable')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        viewDensity === 'comfortable'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      Comfortable (স্বাচ্ছন্দ্যময়)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewDensity('compact')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        viewDensity === 'compact'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      Compact (সংক্ষিপ্ত)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-emerald-600" />
                    <span>Case Layout Mode (কেস ভিউ মোড)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        viewMode === 'grid'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        viewMode === 'table'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table Rows</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Scale & High Contrast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-purple-600" />
                    <span>Font Size (ফন্ট সাইজ)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize('normal')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        fontSize === 'normal'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      Standard (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('large')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        fontSize === 'large'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                      }`}
                    >
                      Large (110%)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>High Contrast Accessibility</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      highContrast
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                    }`}
                  >
                    <span>High Contrast Mode</span>
                    <span>{highContrast ? 'Enabled (সক্রিয়)' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Logo & Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <CompanyLogo company={activeCompany} size="xl" />
                <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {activeCompany.name}
                  </div>
                  <div className="text-slate-500 font-mono">
                    Bar Reg: {activeCompany.barCouncil || 'WB/Chamber'}
                  </div>
                  <div className="text-slate-500 truncate">
                    {activeCompany.city}, West Bengal · {activeCompany.phone}
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                    Integrated Dynamic Logo displays automatically across Header, Sidebar, Dashboard &amp; Case Prints.
                  </div>
                </div>
              </div>

              {/* Custom Logo Upload */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Upload Custom Chamber Logo Image</span>
                  </div>
                  {activeCompany.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomLogo}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Custom Image</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload your law firm's official PNG, JPG, or SVG seal/emblem. It will be stored in your browser storage and rendered smoothly offline.
                </p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{activeCompany.logoUrl ? 'Change Custom Logo Image' : 'Upload Firm Logo Image'}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>

              {/* Dynamic Legal Insignia Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Or Select Pre-Designed Professional Legal Insignia
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BADGE_OPTIONS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBadge(b.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        activeCompany.logoBadge === b.id && !activeCompany.logoUrl
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-600 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">{b.label}</div>
                      <div className="text-[10px] text-slate-500">{b.bengali}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Color Theme Palette */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chamber Brand Accent Theme</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectColor(c.id)}
                      className={`p-2 rounded-lg text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        activeCompany.logoColor === c.id
                          ? 'border-blue-600 ring-2 ring-blue-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: c.id }}
                      />
                      <span className="text-[11px] truncate text-slate-800 dark:text-slate-200">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete Chamber Workspace Option */}
              <div className="pt-4 border-t border-rose-200 dark:border-rose-900/60">
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Delete Chamber Workspace (চেম্বার মুছুন)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Permanently delete "{activeCompany.name}" and its local cases from browser storage.
                    </div>
                  </div>

                  {!showDeleteCompanyConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteCompanyConfirm(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Workspace</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteCompanyConfirm(false)}
                        className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteChamber}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Permanent Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Document Vault (Shifted to Settings!) */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                  <Archive className="w-4 h-4 text-indigo-600" />
                  <span>Document Vault (দলিল ভল্ট) — Category-Specific AI Tracking</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900/80 dark:text-indigo-300/80">
                  Select a category from the dropdown to upload documents and sample formats. The AI will strictly track and isolate uploaded samples to that specific category and will not blend them with any other case type.
                </p>
              </div>

              {/* Category Selector Dropdown (strictly NO "All" option) & Upload Bar */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Select Target Document Category (শ্রেণী নির্বাচন করুন):</span>
                    </label>
                    <select
                      value={selectedVaultCategory}
                      onChange={e => setSelectedVaultCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-xs"
                    >
                      {VAULT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => vaultUploadInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to "{selectedVaultCategory.split(' ')[0]}"</span>
                    </button>
                    <input
                      ref={vaultUploadInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleVaultFileUpload}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <span className="text-[11px] font-semibold">
                      AI Scope: <strong>{selectedVaultCategory}</strong> only. Isolated from other categories.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-bold">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
              </div>

              {/* Search Within Selected Category */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={e => setFileSearch(e.target.value)}
                  placeholder={`Search documents in ${selectedVaultCategory}...`}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Documents Grid */}
              {filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFiles.map(f => (
                    <div
                      key={f.id}
                      className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-500 transition-colors flex flex-col justify-between space-y-2.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Archive className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={f.name}>
                            {f.name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {f.size} · Uploaded: {f.date}
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[10px] text-indigo-800 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate">Tracked by AI for <strong>{f.aiTrackedCategory || f.category}</strong></span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewVaultFile(f)}
                          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${f.name}" from Vault?`)) {
                              deleteVaultFile(f.id);
                              showToast(`Deleted "${f.name}"`);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <Archive className="w-8 h-8 mx-auto text-slate-400" />
                  <div>No documents stored under "{selectedVaultCategory}".</div>
                  <div className="text-[11px] text-slate-400">
                    Click "Upload to {selectedVaultCategory.split(' ')[0]}" to store files for AI tracking in this category.
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Google Drive Sync Status</h3><p className="text-xs text-slate-500 mt-1">Local synchronisation queue and review status</p></div>
                <button type="button" onClick={refreshSyncCounts} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Refresh</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="text-xs text-slate-500">Pending local changes</div><div className="text-2xl font-extrabold mt-1">{syncCounts.pending}</div></div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="text-xs text-slate-500">Remote changes awaiting review</div><div className="text-2xl font-extrabold mt-1">{syncCounts.staged}</div></div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="text-xs text-slate-500">Conflicts requiring decision</div><div className="text-2xl font-extrabold mt-1">{syncCounts.conflicts}</div></div>
              </div>
              {syncCounts.error && <div className="p-3 rounded-lg border border-rose-300 text-xs text-rose-700">Stored sync status could not be read. Existing data has not been changed.</div>}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={driveAuthStatus !== 'authorized' || !selectedDriveFolder?.id || syncBusy || syncCounts.error}
                  onClick={handleSyncGoogleDriveNow}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold"
                >
                  {syncBusy ? 'Synchronising…' : 'Sync Now'}
                </button>
                <button
                  type="button"
                  disabled={syncCounts.staged === 0 || syncCounts.error}
                  onClick={() => {
                    if (!window.confirm(`Apply all eligible ${syncCounts.staged} staged remote change(s) to this device? This applies eligible changes in one operation; it does not show a per-record preview. Conflicting or unsupported changes may remain for manual review. This action updates local records and cannot be automatically undone. Please ensure you have a current backup.`)) return;
                    const result = applyStagedSyncChanges();
                    if (result) refreshSyncCounts();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold"
                >
                  Apply Eligible Staged Changes
                </button>
              </div>
              {syncMessage && <div className="p-3 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 text-xs text-sky-900 dark:text-sky-200">{syncMessage}</div>}
              {syncConflicts.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 space-y-3">
                  <div>
                    <div className="font-bold text-sm text-amber-900 dark:text-amber-200">Conflict Review</div>
                    <p className="text-xs text-slate-500 mt-1">The same record was changed on more than one device. Compare both versions and choose which version should be kept. Your choice is queued as a new sync change.</p>
                  </div>
                  {syncConflicts.map((conflict) => (
                    <div key={`${conflict.recordId}:${conflict.local.changeId}:${conflict.remote.changeId}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
                      <div className="text-xs font-bold break-all">Record: {conflict.recordId} · Company: {conflict.local.companyId}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="text-xs font-bold text-sky-700 dark:text-sky-300">LOCAL VERSION</div>
                          <div className="text-[10px] text-slate-500 break-all">Device: {conflict.local.deviceId} · {new Date(conflict.local.updatedAt).toLocaleString()}</div>
                          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-100 dark:bg-slate-900 p-2 text-[10px]">{JSON.stringify(conflict.local.deleted ? '[Record deleted]' : conflict.local.payload, null, 2)?.slice(0, 1600)}</pre>
                          <button type="button" onClick={() => {
                            if (!window.confirm('Keep the LOCAL version for this record and queue it for synchronisation?')) return;
                            if (resolveSyncConflict(conflict, 'local')) refreshSyncCounts();
                          }} className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold">Keep Local Version</button>
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">REMOTE VERSION</div>
                          <div className="text-[10px] text-slate-500 break-all">Device: {conflict.remote.deviceId} · {new Date(conflict.remote.updatedAt).toLocaleString()}</div>
                          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-100 dark:bg-slate-900 p-2 text-[10px]">{JSON.stringify(conflict.remote.deleted ? '[Record deleted]' : conflict.remote.payload, null, 2)?.slice(0, 1600)}</pre>
                          <button type="button" onClick={() => {
                            if (!window.confirm('Use the REMOTE version on this device and queue it for synchronisation? This will update the local record.')) return;
                            if (resolveSyncConflict(conflict, 'remote')) refreshSyncCounts();
                          }} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Use Remote Version</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Google Drive account authorization</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {driveAuthStatus === 'checking' ? 'Checking secure sign-in status…' :
                       driveAuthStatus === 'authorized' ? 'Google account authorization is stored securely on this device.' :
                       driveAuthStatus === 'unsupported' ? 'Google Drive sign-in is available in the Windows desktop and Android apps, not in this browser.' :
                       driveAuthStatus === 'error' ? 'Sign-in status could not be verified, or the last sign-in attempt failed.' :
                       'No Google account is authorized on this device.'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${driveAuthStatus === 'authorized' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                    {driveAuthStatus === 'authorized' ? 'AUTHORIZED' : driveAuthStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {driveAuthStatus !== 'authorized' && (
                    <button type="button" disabled={driveAuthBusy || driveAuthStatus === 'unsupported' || driveAuthStatus === 'checking'}
                      onClick={handleConnectGoogleDrive}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold">
                      {driveAuthBusy ? 'Please wait…' : 'Sign in with Google'}
                    </button>
                  )}
                  {driveAuthStatus === 'authorized' && (
                    <button type="button" disabled={driveAuthBusy} onClick={handleDisconnectGoogleDrive}
                      className="px-4 py-2 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold disabled:opacity-40">
                      Disconnect this device
                    </button>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Selected Google Drive folder</div>
  {selectedDriveFolder ? (
    <div className="text-xs text-slate-700 dark:text-slate-300 break-all">
      {selectedDriveFolder.name}
      <span className="block font-mono text-[10px] text-slate-500 mt-1">{selectedDriveFolder.id}</span>
    </div>
  ) : (
    <p className="text-xs text-slate-500">No Drive folder has been selected on this device.</p>
  )}
  <p className="text-xs text-slate-500">Use “Connect Google” or reconnect to choose or change the folder.</p>
</div>
<div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-1">
  <div className="font-bold text-xs text-amber-900 dark:text-amber-300">Folder selection is ready; manual sync is available</div>
  <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
    The selected folder is saved on this device. Use Sync Now to transfer queued changes. Downloaded records remain staged until you explicitly review and apply them. Automatic background sync and detailed conflict resolution are still pending.
  </p>
</div>
              </div>
            </div>
          )}

          {/* TAB 6: Data Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chamber Database Preservation &amp; Portability
              </div>

              {/* Designated Storage Path Box */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-indigo-600" />
                    <span>Designated Data Storage Path (নির্দিষ্ট ব্যাকআপ সংরক্ষণ পাথ):</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Configured
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800/60 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all shadow-inner">
                    {backupStoragePath || 'C:/Case_Backups'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSelectBackupPathModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-colors"
                    title="Browse or change storage location"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Browse &amp; Change</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-indigo-100/60 dark:border-indigo-900/60">
                  <span>Automatic backup executes to this selected path on every app closing.</span>
                  <button
                    type="button"
                    onClick={triggerManualBackupRequest}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Manual Backup Now</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={exportCompanyJson}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all group cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Export Timestamped Backup (.json)
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Save complete database with date and time mentioned into your selected storage path.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-left transition-all group cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Restore Chamber from Backup
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Import a previously exported .json archive file to restore all chamber records instantly.
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestoreFile}
                  />
                </button>

                {/* Merge Older APK / Version Data */}
                <button
                  type="button"
                  onClick={triggerAutoDataMerge}
                  className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-600 hover:bg-indigo-50/60 text-left transition-all group cursor-pointer space-y-2"
                  title="Scan and merge all cases from older version storage"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Merge Older APK Data</span>
                      <span className="text-[10px] font-mono bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">Auto</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Scan all previous versions and merge existing cases, clients, and deeds into current app without losing any data.
                    </div>
                  </div>
                </button>

                {/* Merge from Backup JSON File */}
                <button
                  type="button"
                  onClick={() => mergeFileInputRef.current?.click()}
                  className="p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/30 dark:bg-purple-950/20 hover:border-purple-600 hover:bg-purple-50/60 text-left transition-all group cursor-pointer space-y-2"
                  title="Merge external JSON file without overwriting"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Merge Backup JSON File
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Select an exported backup file to safely merge all its cases into your active chamber records.
                    </div>
                  </div>
                  <input
                    ref={mergeFileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleMergeFile}
                  />
                </button>
              </div>

              {/* Stored Backups History with Date, Time and Deletion Option */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Stored Backups Log (তারিখ ও সময়সহ সংরক্ষিত ব্যাকআপ)</span>
                  {backupHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete all stored backup history records? (আপনার সংরক্ষিত সব ব্যাকআপ লগ মুছে ফেলতে চান?)')) {
                          clearAllBackupLog();
                        }
                      }}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All Backups</span>
                    </button>
                  )}
                </div>

                {backupHistory.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {backupHistory.map(b => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                            {b.fileName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span>Date &amp; Time: <strong className="text-slate-700 dark:text-slate-300">{b.formattedDate}</strong></span>
                            <span>·</span>
                            <span>Path: <span className="font-mono">{b.storagePath}</span></span>
                            <span>·</span>
                            <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">{b.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {b.sizeKb} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete backup record "${b.fileName}"?`)) {
                                deleteBackupLogEntry(b.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete this backup entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No backups logged yet. Manual and auto backups will record here with date and time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Chamber: {activeCompany.name} · {activeCompany.city}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                logoutUser();
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              title="Logout from Current Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white cursor-pointer transition-colors shadow-xs"
            >
              Close Settings
            </button>
          </div>
        </div>
      </div>

      {/* Vault Document Preview Popup */}
      {previewVaultFile && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={previewVaultFile.name}>
                    {previewVaultFile.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: {previewVaultFile.category} · Size: {previewVaultFile.size} · Uploaded: {previewVaultFile.date}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVaultFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Close Document Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mx-auto flex items-center justify-center shadow-inner">
                <Archive className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {previewVaultFile.name}
                </div>
                <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Document stored securely in chamber vault under <strong>{previewVaultFile.category}</strong>. Tracked by AI exclusively for this specific domain.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Chamber Vault Document · Confidential
              </span>
              <button
                type="button"
                onClick={() => setPreviewVaultFile(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white cursor-pointer transition-colors shadow-xs"
              >
                Close (বন্ধ করুন)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
