import React, { useRef, useState, useEffect } from 'react';
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
  Search,
  ChevronDown,
  MessageCircle,
  Smartphone,
  Send,
  Cloud,
  RefreshCw,
  Laptop,
  ArrowLeftRight,
  CloudUpload,
  CloudDownload,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { CompanyLogo, BADGE_OPTIONS, COLOR_OPTIONS } from './CompanyLogo';
import { THEME_OPTIONS } from '../data/themes';
import { VaultFile, Role } from '../types';
import { safeOpenWhatsApp } from '../utils/printDoc';
import { buildHearingNoticeText, buildDeliveryNoticeText } from '../utils/whatsappHelper';
import { WhatsAppSessionSetup } from './WhatsAppSessionSetup';
import { GoogleSignInButton } from './GoogleSignInButton';
import { DRIVE_SYNC_FILE_NAME, getDeviceLabel } from '../utils/googleDriveSync';

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

export type SettingsTab = 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup' | 'whatsapp';

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
    showToast,
    addVaultFile,
    deleteVaultFile,
    logoutUser,
    language,
    t,
    driveUser,
    driveSyncStatus,
    connectGoogleDrive,
    disconnectGoogleDrive,
    enableDriveAutoSync,
    disableDriveAutoSync,
    syncWithGoogleDrive,
    deleteGoogleDriveSyncFile
  } = useApp();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const vaultUploadInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Google Drive confirmation dialog state for any mutating / destructive Drive API operation
  const [driveConfirmAction, setDriveConfirmAction] = useState<{
    type: 'enable-autosync' | 'sync-now' | 'overwrite-drive' | 'delete-drive-file';
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
  } | null>(null);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

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

  // WhatsApp Settings state
  const [waEnabled, setWaEnabled] = useState<boolean>(activeCompany?.whatsappSettings?.enabled ?? true);
  const [waSenderPhone, setWaSenderPhone] = useState<string>(activeCompany?.whatsappSettings?.senderPhone || activeCompany?.phone || '');
  const [waLanguage, setWaLanguage] = useState<'bilingual' | 'bn' | 'en'>(activeCompany?.whatsappSettings?.defaultLanguage || 'bilingual');
  const [waSignature, setWaSignature] = useState<string>(activeCompany?.whatsappSettings?.chamberSignature || activeCompany?.name || '');
  const [waIncludeBar, setWaIncludeBar] = useState<boolean>(activeCompany?.whatsappSettings?.includeBarCouncil ?? true);

  // Test WhatsApp dispatcher state
  const [testRecipientPhone, setTestRecipientPhone] = useState<string>(activeCompany?.phone || '');
  const [testTemplateType, setTestTemplateType] = useState<'hearing' | 'delivery'>('hearing');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (activeCompany && isOpen) {
      setWaEnabled(activeCompany.whatsappSettings?.enabled ?? true);
      setWaSenderPhone(activeCompany.whatsappSettings?.senderPhone || activeCompany.phone || '');
      setWaLanguage(activeCompany.whatsappSettings?.defaultLanguage || 'bilingual');
      setWaSignature(activeCompany.whatsappSettings?.chamberSignature || activeCompany.name || '');
      setWaIncludeBar(activeCompany.whatsappSettings?.includeBarCouncil ?? true);
      setTestRecipientPhone(activeCompany.phone || '');
    }
  }, [isOpen, activeCompany]);

  if (!isOpen || !activeCompany) return null;

  const handleConnectDriveClick = async () => {
    setIsConnectingDrive(true);
    await connectGoogleDrive();
    setIsConnectingDrive(false);
  };

  const executeConfirmedDriveAction = async () => {
    if (!driveConfirmAction) return;
    const actionType = driveConfirmAction.type;
    setDriveConfirmAction(null);

    if (actionType === 'enable-autosync') {
      await enableDriveAutoSync();
    } else if (actionType === 'sync-now') {
      await syncWithGoogleDrive({ mode: 'two-way', silent: false });
    } else if (actionType === 'overwrite-drive') {
      await syncWithGoogleDrive({ mode: 'push-overwrite', silent: false });
    } else if (actionType === 'delete-drive-file') {
      await deleteGoogleDriveSyncFile();
    }
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs font-bold">
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

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold ring-1 ring-blue-200'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Google Drive Automatic Sync (Mobile ↔ Computer)"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">Google Drive Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-extrabold ring-1 ring-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="WhatsApp Notice & Dispatch Setup"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">WhatsApp</span>
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

              {/* 1. Courtroom Color Theme Dropdown List */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="courtroom-theme-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-600" />
                    <span>Courtroom Color Theme (কালার থিম নির্বাচন)</span>
                  </label>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-2xs shrink-0"
                      style={{ backgroundColor: THEME_OPTIONS.find(opt => opt.id === theme)?.bgHex || '#F0F4F8' }}
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {THEME_OPTIONS.find(opt => opt.id === theme)?.name || 'Theme'}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <select
                    id="courtroom-theme-select"
                    value={theme}
                    onChange={e => setTheme(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                  >
                    {THEME_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} — {opt.nameBn} ({opt.tagline})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-0.5">
                  {THEME_OPTIONS.find(opt => opt.id === theme)?.description}
                </div>
              </div>

              {/* 2. Grid of Dropdowns: View Density & Case Layout Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* View Density Dropdown */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="view-density-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>View Density (তথ্য ঘনত্ব)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="view-density-select"
                      value={viewDensity}
                      onChange={e => setViewDensity(e.target.value as 'comfortable' | 'compact')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="comfortable">Comfortable (স্বাচ্ছন্দ্যময়) — Standard courtroom spacing</option>
                      <option value="compact">Compact (সংক্ষিপ্ত) — Dense data-rich view</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Adjusts vertical row height, table cell margins, and card padding.
                  </p>
                </div>

                {/* Case Layout Mode Dropdown */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="case-layout-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-emerald-600" />
                    <span>Case Layout Mode (কেস ভিউ মোড)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="case-layout-select"
                      value={viewMode}
                      onChange={e => setViewMode(e.target.value as 'grid' | 'table')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="table">Table Rows (টেবিল তালিকা) — Professional registry rows</option>
                      <option value="grid">Grid Cards (কার্ড ভিউ) — Visual case tiles</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Controls whether cases display as detailed spreadsheet rows or card tiles.
                  </p>
                </div>
              </div>

              {/* 3. Grid of Dropdowns: Font Size & High Contrast Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Font Size Dropdown */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="font-size-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-purple-600" />
                    <span>Font Size (ফন্ট সাইজ)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="font-size-select"
                      value={fontSize}
                      onChange={e => setFontSize(e.target.value as 'normal' | 'large')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="normal">Standard (সাধারণ - 100%) — Balanced legal typography</option>
                      <option value="large">Large (বড় টেক্সট - 110%) — High readability scale</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Scales base font hierarchy across dashboard cards, tables, and modal forms.
                  </p>
                </div>

                {/* High Contrast Accessibility Dropdown */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="high-contrast-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>High Contrast Accessibility (উচ্চ বৈসাদৃশ্য)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="high-contrast-select"
                      value={highContrast ? 'enabled' : 'disabled'}
                      onChange={e => setHighContrast(e.target.value === 'enabled')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="disabled">Standard Contrast (স্বাভাবিক) — Subtle borders & natural shadows</option>
                      <option value="enabled">High Contrast (সক্রিয়) — Sharp borders & reinforced depth</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Amplifies line borders and removes faint gray shades for high visibility.
                  </p>
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

              {/* Dynamic Legal Insignia Dropdown & Selector */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="legal-insignia-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pre-Designed Legal Insignia (আইনি প্রতীক)</span>
                  </label>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {BADGE_OPTIONS.find(b => b.id === (activeCompany.logoBadge || 'scales'))?.label}
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="legal-insignia-select"
                    value={activeCompany.logoBadge || 'scales'}
                    onChange={e => handleSelectBadge(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                  >
                    {BADGE_OPTIONS.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.label} — {b.bengali}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Chamber Brand Accent Theme Dropdown List */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="chamber-brand-accent-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chamber Brand Accent Theme (ব্র্যান্ড কালার থিম)</span>
                  </label>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-2xs shrink-0"
                      style={{ backgroundColor: activeCompany.logoColor || '#2563EB' }}
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {COLOR_OPTIONS.find(c => c.id === (activeCompany.logoColor || '#2563EB'))?.label || 'Custom Color'}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <select
                    id="chamber-brand-accent-select"
                    value={activeCompany.logoColor || '#2563EB'}
                    onChange={e => handleSelectColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none shadow-xs"
                  >
                    {COLOR_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Select the primary accent tint used for official chamber firm branding and printable dossier headers.
                </p>
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

          {/* TAB 6: Google Drive Two-Way Auto Sync (Mobile <-> Computer) */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              {/* Hero Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-sky-50/80 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                        <span>Google Drive Automatic Sync</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          <ArrowLeftRight className="w-2.5 h-2.5" />
                          <Laptop className="w-3 h-3" />
                          <span>Mobile ↔ Computer</span>
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Automatically keeps your cases, cause list, parties, and diaries updated between your Mobile and Computer via your Google Drive.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Auth State / Account Card */}
                {driveSyncStatus.needsAuth ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {driveUser
                          ? `Re-authorize Google Drive (${driveUser.email})`
                          : 'Connect Your Google Account'}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {driveUser
                          ? 'Session authorization refreshed on reload. Sign in to resume automatic two-way sync.'
                          : 'Sign in with the same Google account on both your Mobile and Computer to sync chamber data automatically.'}
                      </p>
                    </div>
                    <GoogleSignInButton
                      onClick={handleConnectDriveClick}
                      isLoading={isConnectingDrive || driveSyncStatus.isSyncing}
                      label={driveUser ? 'Reconnect Google Drive' : 'Sign in with Google'}
                    />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {driveUser?.photoURL ? (
                        <img
                          src={driveUser.photoURL}
                          alt={driveUser.displayName || 'Google User'}
                          className="w-9 h-9 rounded-full border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {(driveUser?.displayName || driveUser?.email || 'G')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="truncate">{driveUser?.displayName || 'Google Account'}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                            Connected
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{driveUser?.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={disconnectGoogleDrive}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0 transition-colors"
                    >
                      Disconnect Account
                    </button>
                  </div>
                )}
              </div>

              {/* Automatic Sync Controls (Available when Connected) */}
              {!driveSyncStatus.needsAuth && (
                <>
                  {/* Auto-Sync Toggle Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <RefreshCw className={`w-4 h-4 text-blue-600 ${driveSyncStatus.isSyncing ? 'animate-spin' : ''}`} />
                          <span>Automatic Two-Way Data Updating (Mobile ↔ Computer)</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          When ON, edits made on your mobile phone or computer automatically upload to and download from Google Drive.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (driveSyncStatus.autoSyncEnabled) {
                            disableDriveAutoSync();
                          } else {
                            setDriveConfirmAction({
                              type: 'enable-autosync',
                              title: 'Enable Automatic Two-Way Google Drive Sync?',
                              message: `This will automatically sync and update '${DRIVE_SYNC_FILE_NAME}' in your Google Drive whenever changes are made on this device (${getDeviceLabel()}) or your other signed-in devices.`,
                              confirmLabel: 'Confirm & Enable Auto-Sync'
                            });
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                          driveSyncStatus.autoSyncEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        }`}
                      >
                        {driveSyncStatus.autoSyncEnabled ? 'Auto-Sync ON' : 'Enable Auto-Sync'}
                      </button>
                    </div>

                    {/* Status Details Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">This Device</div>
                        <div className="font-bold text-slate-800 mt-0.5">{getDeviceLabel()}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Last Synced Update</div>
                        <div className="font-bold text-slate-800 mt-0.5">
                          {driveSyncStatus.lastSyncedAt
                            ? new Date(driveSyncStatus.lastSyncedAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not synced yet'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Updated From</div>
                        <div className="font-bold text-blue-700 mt-0.5">
                          {driveSyncStatus.lastSyncedByDevice || 'Waiting for first sync'}
                        </div>
                      </div>
                    </div>

                    {driveSyncStatus.error && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{driveSyncStatus.error}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Sync Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={driveSyncStatus.isSyncing}
                      onClick={() =>
                        setDriveConfirmAction({
                          type: 'sync-now',
                          title: 'Sync Chamber Data with Google Drive?',
                          message: `Check '${DRIVE_SYNC_FILE_NAME}' for updates from your other devices and update Google Drive with any new records from this device (${getDeviceLabel()}).`,
                          confirmLabel: 'Confirm & Sync Now'
                        })
                      }
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 text-left transition-all cursor-pointer flex items-start gap-3 disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        {driveSyncStatus.isSyncing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowLeftRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Sync Now (Two-Way)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Smart merge &amp; update between this device and Google Drive.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={driveSyncStatus.isSyncing}
                      onClick={() => syncWithGoogleDrive({ mode: 'pull-only', silent: false })}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-500 text-left transition-all cursor-pointer flex items-start gap-3 disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CloudDownload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Fetch Updates from Drive</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Download latest chamber updates saved from your other device.
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Advanced / Overwrite & Delete File Controls */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Cloud File: <span className="font-mono font-semibold text-slate-700">{DRIVE_SYNC_FILE_NAME}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={driveSyncStatus.isSyncing}
                        onClick={() =>
                          setDriveConfirmAction({
                            type: 'overwrite-drive',
                            title: 'Overwrite Google Drive with Current Device Data?',
                            message: `This will replace the contents of '${DRIVE_SYNC_FILE_NAME}' in your Google Drive with the current chamber data on this device (${activeCompany.cases.length} cases).`,
                            confirmLabel: 'Confirm Overwrite'
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Push Local Copy</span>
                      </button>

                      {driveSyncStatus.driveFileId && (
                        <button
                          type="button"
                          disabled={driveSyncStatus.isSyncing}
                          onClick={() =>
                            setDriveConfirmAction({
                              type: 'delete-drive-file',
                              title: 'Delete Sync File from Google Drive?',
                              message: `Are you sure you want to permanently delete '${DRIVE_SYNC_FILE_NAME}' from your Google Drive? Local data on this device will remain, but cloud sync will pause.`,
                              confirmLabel: 'Delete Drive File',
                              danger: true
                            })
                          }
                          className="px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Cloud File</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Explicit Confirmation Dialog for Mutating / Destructive Google Drive API Calls */}
              {driveConfirmAction && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          driveConfirmAction.danger
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {driveConfirmAction.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {driveConfirmAction.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDriveConfirmAction(null)}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={executeConfirmedDriveAction}
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer ${
                          driveConfirmAction.danger
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {driveConfirmAction.confirmLabel}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: WhatsApp Chamber Notice Setup */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Header Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                      In-App WhatsApp Login &amp; Dispatch Setup (হোয়াটসঅ্যাপ লগইন ও কনফিগারেশন)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Link your WhatsApp account inside the app to send transaction receipts, client ledger alerts &amp; case notices directly without redirecting to WhatsApp Desktop or Browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${waEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {waEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Direct In-App WhatsApp Linked Device Login (QR Code or Pairing Code) */}
              <WhatsAppSessionSetup />

              {/* Status and Master Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                <label htmlFor="wa-status-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Alert Service Status (সার্ভিস স্ট্যাটাস)</span>
                </label>
                <div className="relative">
                  <select
                    id="wa-status-select"
                    value={waEnabled ? 'enabled' : 'disabled'}
                    onChange={e => setWaEnabled(e.target.value === 'enabled')}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none shadow-xs"
                  >
                    <option value="enabled">Active (সক্রিয়) — WhatsApp dispatch links active across cause list & cases</option>
                    <option value="disabled">Paused (নিষ্ক্রিয়) — Pause WhatsApp dispatch links</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Sender & Language Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chamber WhatsApp Number */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Chamber Sender Mobile Number (চেম্বার মোবাইল নম্বর)
                  </label>
                  <input
                    type="tel"
                    value={waSenderPhone}
                    onChange={e => setWaSenderPhone(e.target.value)}
                    placeholder="9830012345"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold shadow-xs"
                  />
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Indian numbers automatically format with +91 country code when opening WhatsApp.
                  </p>
                </div>

                {/* Default Notice Language Dropdown */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="wa-language-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Default Message Language (নোটিশের ভাষা)
                  </label>
                  <div className="relative">
                    <select
                      id="wa-language-select"
                      value={waLanguage}
                      onChange={e => setWaLanguage(e.target.value as 'bilingual' | 'bn' | 'en')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="bilingual">Bilingual (বাংলা ও English - Recommended)</option>
                      <option value="bn">Bengali Only (শুধুমাত্র বাংলা)</option>
                      <option value="en">English Only (শুধুমাত্র ইংরেজি)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Determines the language format used when pre-filling client notices.
                  </p>
                </div>
              </div>

              {/* Chamber Signature & Bar Council Inclusion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Custom Chamber Signature */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Chamber Sign-Off / Signature (স্বাক্ষর ও পদবি)
                  </label>
                  <input
                    type="text"
                    value={waSignature}
                    onChange={e => setWaSignature(e.target.value)}
                    placeholder="Adv. Kamal Gharami · High Court / District Bar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs"
                  />
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Appended at the end of each outgoing WhatsApp notice.
                  </p>
                </div>

                {/* Include Bar Council Reg */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2">
                  <label htmlFor="wa-bar-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Include Bar Council Registration No. (বার রেজিস্ট্রেশন)
                  </label>
                  <div className="relative">
                    <select
                      id="wa-bar-select"
                      value={waIncludeBar ? 'yes' : 'no'}
                      onChange={e => setWaIncludeBar(e.target.value === 'yes')}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="yes">Yes — Include Bar Reg ({activeCompany.barCouncil || 'WB/Chamber'})</option>
                      <option value="no">No — Omit Bar Reg number</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Prints official registration particulars on legal communications.
                  </p>
                </div>
              </div>

              {/* Template Live Preview */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Live Notice Template Preview (লাইভ নোটিশ নমুনা)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    {waLanguage.toUpperCase()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {buildHearingNoticeText(
                    {
                      ...activeCompany,
                      whatsappSettings: {
                        enabled: waEnabled,
                        senderPhone: waSenderPhone,
                        defaultLanguage: waLanguage,
                        chamberSignature: waSignature,
                        includeBarCouncil: waIncludeBar
                      }
                    },
                    {
                      clientName: 'সুনীল মণ্ডল (Sunil Mondal)',
                      clientPhone: '9830012345',
                      caseNo: 'MN/2026/142',
                      subType: 'Section 50 Mutation',
                      forum: 'BL&LRO Office, Rajarhat',
                      nextDate: '24/11/2026 at 11:30 AM',
                      mouza: 'Rajarhat (JL 14)',
                      dag: '1240',
                      khatian: '892'
                    }
                  )}
                </div>
              </div>

              {/* Interactive Notice Tester */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Test Notice Dispatch (হোয়াটসঅ্যাপ টেস্ট মেসেজ পাঠান)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter a mobile number to send a test WhatsApp message directly from your linked account inside this app (no external browser/desktop redirect).
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="tel"
                    value={testRecipientPhone}
                    onChange={e => setTestRecipientPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!testRecipientPhone) {
                        showToast('Please enter a test mobile number', 'error');
                        return;
                      }
                      const testMsg = buildHearingNoticeText(
                        {
                          ...activeCompany,
                          whatsappSettings: {
                            enabled: waEnabled,
                            senderPhone: waSenderPhone,
                            defaultLanguage: waLanguage,
                            chamberSignature: waSignature,
                            includeBarCouncil: waIncludeBar
                          }
                        },
                        {
                          clientName: 'Sample Litigant',
                          clientPhone: testRecipientPhone,
                          caseNo: 'TEST/2026/01',
                          subType: 'Chamber Test Notice',
                          forum: 'Legal Chamber Test',
                          nextDate: new Date().toLocaleDateString('en-IN')
                        }
                      );
                      safeOpenWhatsApp(testRecipientPhone, testMsg, {
                        autoSendIfConnected: true,
                        partyName: 'Test Recipient',
                        title: 'Test In-App WhatsApp Dispatch'
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Test WhatsApp Notice</span>
                  </button>
                </div>
              </div>

              {/* Action Save Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Settings are stored locally in your chamber profile.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateCompanyDetails({
                      whatsappSettings: {
                        enabled: waEnabled,
                        senderPhone: waSenderPhone,
                        defaultLanguage: waLanguage,
                        chamberSignature: waSignature,
                        includeBarCouncil: waIncludeBar
                      }
                    });
                    showToast('WhatsApp notice preferences saved successfully!', 'success');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Save WhatsApp Settings</span>
                </button>
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
