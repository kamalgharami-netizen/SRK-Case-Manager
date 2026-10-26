import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Building2,
  FolderOpen,
  RotateCcw,
  ArrowRight,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Sparkles,
  LogIn,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  Database,
  Lock,
  Folder,
  HardDrive
} from 'lucide-react';
import { wbDistricts } from '../data/wbDistricts';
import { CompanyLogo, BADGE_OPTIONS, COLOR_OPTIONS } from './CompanyLogo';
import { Toast } from './Toast';

interface LaunchScreenProps {
  onClose?: () => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onClose }) => {
  const {
    companies,
    activeCompany,
    selectCompany,
    createCompany,
    deleteCompany,
    loginUser,
    retrieveExistingData,
    showToast,
    language,
    backupStoragePath
  } = useApp();

  const logoFileRef = useRef<HTMLInputElement>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  // Check if first-time launch - strictly false if any registered company exists
  const isFirstLaunch = companies.length === 0;

  // Views: 'login' | 'create' | 'retrieve' | 'select'
  const [view, setView] = useState<'login' | 'create' | 'retrieve' | 'select'>(
    isFirstLaunch ? 'create' : 'login'
  );

  // LOGIN STATE (Mobile No + 4-digit Passcode)
  const [selectedLoginCompanyId, setSelectedLoginCompanyId] = useState<string>(() => {
    return activeCompany?.id || companies[0]?.id || '';
  });
  const targetLoginCompany = companies.find(c => c.id === selectedLoginCompanyId) || activeCompany || companies[0] || null;
  const [loginMobile, setLoginMobile] = useState<string>(() => {
    return targetLoginCompany?.users?.[0]?.phone || '';
  });
  const [loginPasscode, setLoginPasscode] = useState<string>('');
  const [showLoginPasscode, setShowLoginPasscode] = useState<boolean>(false);

  // REGISTRATION STATE (Mandatory First-Time)
  const [name, setName] = useState('');
  const [type, setType] = useState('Advocate Chamber');
  const [barCouncil, setBarCouncil] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [pin, setPin] = useState('');

  // Compulsory registration fields
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regConfirmPasscode, setRegConfirmPasscode] = useState('');
  const [showRegPasscode, setShowRegPasscode] = useState(false);

  // Branding Crest
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoBadge, setLogoBadge] = useState<any>('scales');
  const [logoColor, setLogoColor] = useState('#2563EB');

  // Compulsory Data Storage Path for initial registration
  const [regStoragePath, setRegStoragePath] = useState<string>(backupStoragePath || 'C:/Case_Backups');
  const regFolderInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseRegFolder = async () => {
    let succeeded = false;
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        if (dirHandle && dirHandle.name) {
          const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent);
          const sanitized = dirHandle.name.replace(/[^a-zA-Z0-9_\-\s]/g, '_');
          const cleanPath = isWindows ? `C:/${sanitized}` : `/Documents/${sanitized}`;
          setRegStoragePath(cleanPath);
          showToast(`Directory selected: ${dirHandle.name}`, 'success');
          succeeded = true;
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.info('showDirectoryPicker restricted in iframe, opening folder picker input:', err);
      }
    }
    if (!succeeded && regFolderInputRef.current) {
      regFolderInputRef.current.value = '';
      regFolderInputRef.current.click();
    }
  };

  const handleRegFolderInputSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const first = files[0];
    const relPath = first.webkitRelativePath || first.name;
    const folderName = relPath.includes('/') ? relPath.split('/')[0] : 'Selected_Folder';
    const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent);
    const chosen = isWindows
      ? `C:/Users/Advocate/Documents/${folderName}`
      : `/Internal_Storage/Documents/${folderName}`;
    setRegStoragePath(chosen);
    showToast(`Directory selected: ${folderName}`, 'success');
  };

  // REINSTALL RETRIEVAL STATE
  const [retrieveMobile, setRetrieveMobile] = useState('');
  const [retrievePasscode, setRetrievePasscode] = useState('');
  const [showRetrievePasscode, setShowRetrievePasscode] = useState(false);
  const [uploadedBackupPayload, setUploadedBackupPayload] = useState<any>(null);
  const [backupFileName, setBackupFileName] = useState<string>('');

  const districtList = Object.keys(wbDistricts);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMobile.trim()) {
      showToast('Please enter your 10-digit registered mobile number', 'error');
      return;
    }
    if (!loginPasscode.trim()) {
      showToast('Please enter your 4-digit passcode', 'error');
      return;
    }
    if (loginPasscode.trim().length !== 4) {
      showToast('Passcode must be exactly 4 digits', 'error');
      return;
    }

    const success = loginUser(loginMobile.trim(), loginPasscode.trim());
    if (success && onClose) {
      onClose();
    }
  };

  // Handle Registration Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Chamber / Firm name is required', 'error');
      return;
    }
    if (!adminName.trim()) {
      showToast('Advocate / Practitioner name is required', 'error');
      return;
    }
    // Mobile No is COMPULSORY
    const cleanMobile = adminPhone.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length < 10) {
      showToast('Compulsory: Please enter a valid 10-digit Mobile Number', 'error');
      return;
    }
    // Email ID is COMPULSORY
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      showToast('Compulsory: Please enter a valid Email ID', 'error');
      return;
    }
    // 4-Digit Passcode is COMPULSORY
    const cleanPasscode = regPasscode.replace(/\D/g, '').slice(0, 4);
    if (cleanPasscode.length !== 4) {
      showToast('Compulsory: Please enter a 4-digit numeric Passcode', 'error');
      return;
    }
    if (regPasscode !== regConfirmPasscode) {
      showToast('Passcodes do not match. Please verify your 4-digit passcode.', 'error');
      return;
    }

    const ok = createCompany(
      {
        name: name.trim(),
        type,
        barCouncil: barCouncil.trim() || 'WB/Advocate',
        gst: gst.trim(),
        address: address.trim(),
        city: city.trim() || 'Kolkata',
        state: state.trim() || 'West Bengal',
        pin: pin.trim(),
        phone: cleanMobile,
        email: adminEmail.trim(),
        logoUrl,
        logoBadge,
        logoColor,
        backupStoragePath: regStoragePath.trim() || 'C:/Case_Backups'
      },
      {
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone: cleanMobile,
        passcode: cleanPasscode
      }
    );

    if (ok && onClose) {
      onClose();
    }
  };

  // Handle Reinstall Retrieval
  const handleRetrieveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = retrievePasscode.replace(/\D/g, '').slice(0, 4);
    if (cleanPasscode.length !== 4) {
      showToast('Please enter your 4-digit passcode to retrieve data', 'error');
      return;
    }

    const ok = retrieveExistingData(
      retrieveMobile.trim(),
      cleanPasscode,
      uploadedBackupPayload
    );

    if (ok && onClose) {
      onClose();
    }
  };

  const handleBackupFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        setUploadedBackupPayload(parsed);
        setBackupFileName(file.name);
        showToast(`Loaded backup file "${file.name}". Enter your 4-digit passcode to retrieve.`, 'info');
      } catch {
        showToast('Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo file should be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      setLogoUrl(evt.target?.result as string);
      showToast('Logo image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <Toast />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[94vh] overflow-y-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/25 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-900 dark:text-blue-400">
            SRK Case Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            West Bengal Legal Chamber &amp; Land Case Management Platform
          </p>

          {isFirstLaunch && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs text-left">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-800 dark:text-amber-300 block text-xs sm:text-sm">
                  Mandatory First-Time Registration · প্রথমবার চেম্বার নিবন্ধন বাধ্যতামূলক
                </strong>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  First-time registration is mandatory for all new advocates, law firms, and chambers. Mobile Number, Email ID, and 4-Digit Passcode are compulsory. If you already have existing data from a previous installation, use the <strong>Retrieve Data</strong> tab with only your 4-digit passcode.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 mb-6 gap-1">
          {!isFirstLaunch && (
            <button
              type="button"
              onClick={() => setView('login')}
              className={`flex-1 pb-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                view === 'login'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In (লগইন)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setView('create')}
            className={`flex-1 pb-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              view === 'create'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isFirstLaunch ? '1. Registration (নিবন্ধন)' : 'New Chamber'}</span>
          </button>

          <button
            type="button"
            onClick={() => setView('retrieve')}
            className={`flex-1 pb-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              view === 'retrieve'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isFirstLaunch ? '2. Retrieve Data (পুনরুদ্ধার)' : 'Retrieve / Restore'}</span>
          </button>

          {companies.length > 0 && (
            <button
              type="button"
              onClick={() => setView('select')}
              className={`flex-1 pb-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                view === 'select'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Chambers ({companies.length})</span>
            </button>
          )}
        </div>

        {/* VIEW 0: Sign In through Mobile No & 4-Digit Passcode */}
        {view === 'login' && !isFirstLaunch && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <CompanyLogo company={targetLoginCompany} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {targetLoginCompany?.name || 'Legal Chamber'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {targetLoginCompany?.type} · {targetLoginCompany?.city} · {targetLoginCompany?.cases?.length || 0} Cases
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                  4-Digit Passcode Auth
                </span>
                {targetLoginCompany && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete chamber workspace "${targetLoginCompany.name}"? This action permanently removes this company and its data.`
                        )
                      ) {
                        deleteCompany(targetLoginCompany.id);
                        if (companies.length <= 1) {
                          setView('create');
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-colors cursor-pointer"
                    title={`Delete chamber "${targetLoginCompany.name}"`}
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Profile Select if users exist */}
            {targetLoginCompany?.users && targetLoginCompany.users.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                  Registered Advocate / Member Profile:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {targetLoginCompany.users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setLoginMobile(u.phone || u.email);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {u.phone || u.email}
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 dark:bg-blue-950 text-blue-600">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs: Mobile No & 4-Digit Passcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={loginMobile}
                    onChange={e => setLoginMobile(e.target.value)}
                    placeholder="9830123456"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  4-Digit Pass Code *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPasscode ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={loginPasscode}
                    onChange={e => setLoginPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-9 py-2 text-sm font-mono tracking-widest rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPasscode(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-blue-700 hover:bg-blue-800 border-b-4 border-b-blue-950 active:translate-y-0.5 text-white shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Pass Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 1: Mandatory Registration */}
        {view === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Chamber / Firm Registration (নিবন্ধন)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup your legal practice details once. Mobile No, Email ID, and 4-Digit Passcode are compulsory.
              </p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                1. Chamber / Firm Information
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Chamber / Law Firm Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Legal Chamber & Associates"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Entity / Practice Type
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Advocate Chamber</option>
                  <option>Law Firm</option>
                  <option>Muhuri &amp; Registry Practitioner</option>
                  <option>Legal Consultancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  District (West Bengal) *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {districtList.map(dist => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Bar Council Reg / License
                </label>
                <input
                  type="text"
                  value={barCouncil}
                  onChange={e => setBarCouncil(e.target.value)}
                  placeholder="WB/1482/2012"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Office / Chamber Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Alipore Judges Court Bar Association Building, Kolkata"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Advocate Credentials Section with Compulsory Mobile, Email, Passcode */}
            <div className="border-b border-slate-200 dark:border-slate-800 pt-2 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                2. Compulsory Practitioner Profile &amp; 4-Digit Passcode
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Advocate / Practitioner Full Name *
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="e.g. Adv. R. K. Mukherjee"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Mobile Number (10 Digits) * (COMPULSORY)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={adminPhone}
                    onChange={e => setAdminPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9830123456"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Email ID * (COMPULSORY)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="advocate@chamber.in"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <div>
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 uppercase mb-1 flex items-center justify-between">
                  <span>4-Digit Pass Code *</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">4 NUMBERS</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPasscode ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={regPasscode}
                    onChange={e => setRegPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-9 py-2 text-base font-mono tracking-widest font-bold rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPasscode(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 uppercase mb-1">
                  Confirm 4-Digit Pass Code *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPasscode ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={regConfirmPasscode}
                    onChange={e => setRegConfirmPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-3 py-2 text-base font-mono tracking-widest font-bold rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Legal Insignia Crest */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2">
              <div className="flex items-center gap-3">
                <CompanyLogo
                  company={{ name: name || 'Legal Chamber', logoUrl, logoBadge, logoColor } as any}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Chamber Emblem
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Displayed on dossier headers and cause lists
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.slice(0, 4).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setLogoColor(c.id)}
                      className={`w-4 h-4 rounded-full cursor-pointer ${
                        logoColor === c.id ? 'scale-125 ring-2 ring-blue-600' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: c.id }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Designated Data Backup Storage Path with Browse Option */}
            <div className="border-b border-slate-200 dark:border-slate-800 pt-2 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                3. Mandatory Data Backup Storage Path
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                  <span>Backup Destination Path *</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  Auto-Exit Backup Enabled
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Folder className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regStoragePath}
                    onChange={e => setRegStoragePath(e.target.value)}
                    placeholder="e.g. C:/Case_Backups or D:/Legal_Chamber_Vault"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBrowseRegFolder}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  title="Browse folder via OS dialog"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Browse...</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold self-center mr-1">Quick Presets:</span>
                {[
                  'C:/Case_Backups',
                  'D:/Legal_Chamber_Vault',
                  'C:/Users/Advocate/Documents/Chamber_Data',
                  '/storage/emulated/0/Documents/Case_Backups'
                ].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setRegStoragePath(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                      regStoragePath === p
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    {p.split('/').pop() || p}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                On every closing of the app, all chamber data will be automatically backed up into this selected path with date and time mentioned.
              </p>
            </div>

            {/* Hidden native directory picker for registration */}
            <input
              ref={regFolderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory="true"
              directory=""
              multiple
              className="hidden"
              onChange={handleRegFolderInputSelected}
            />

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register &amp; Launch Chamber Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: Reinstall Recovery (Retrieve Existing Data with Passcode) */}
        {view === 'retrieve' && (
          <form onSubmit={handleRetrieveSubmit} className="space-y-5 py-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Retrieve Existing Data (পূর্বের তথ্য পুনরুদ্ধার)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                If you have reinstalled the app or changed devices, retrieve your entire chamber database instantly without filling in registration forms. Only your 4-digit pass code is required.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>Registered Mobile Number</span>
                  <span className="text-[10px] text-slate-400 font-mono">OPTIONAL</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={retrieveMobile}
                    onChange={e => setRetrieveMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9830123456"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>Enter 4-Digit Pass Code *</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">ONLY PASSCODE REQUIRED</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRetrievePasscode ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={retrievePasscode}
                    onChange={e => setRetrievePasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-9 py-2 text-base font-mono tracking-widest font-bold rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRetrievePasscode(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRetrievePasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Optional backup JSON file selection */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-center space-y-2">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {backupFileName ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Backup File Loaded: {backupFileName}</span>
                  </span>
                ) : (
                  <span>Device storage cleared? You can also select your auto-backup JSON file:</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => restoreFileRef.current?.click()}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{backupFileName ? 'Choose Different File' : 'Select Backup JSON File'}</span>
              </button>
              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleBackupFileUpload}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={retrievePasscode.length !== 4}
                className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retrieve All Data &amp; Enter App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: Multiple Chambers List */}
        {view === 'select' && companies.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Your Chamber Workspaces
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any chamber to open it directly.
              </p>
            </div>

            <div className="space-y-2.5">
              {companies.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors group cursor-pointer"
                  onClick={() => selectCompany(c.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {c.type} · {c.cases?.length || 0} cases · {c.city || 'West Bengal'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        selectCompany(c.id);
                      }}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete chamber workspace "${c.name}"? This will permanently delete this chamber.`)) {
                          deleteCompany(c.id);
                          if (companies.length <= 1) {
                            setView('create');
                          }
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setView('create')}
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Register Another Chamber Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
