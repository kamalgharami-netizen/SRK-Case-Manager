import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Scale, Building2, FolderOpen, RotateCcw, ArrowRight, UserPlus, Trash2, CheckCircle2, AlertCircle, X, Upload, Sparkles, LogIn, KeyRound, Mail, UserCheck, Eye, EyeOff } from 'lucide-react';
import { wbDistricts } from '../data/wbDistricts';
import { CompanyLogo, BADGE_OPTIONS, COLOR_OPTIONS } from './CompanyLogo';
import { Toast } from './Toast';

interface LaunchScreenProps {
  onClose?: () => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onClose }) => {
  const { companies, activeCompany, selectCompany, createCompany, deleteCompany, restoreCompany, loginUser, showToast } = useApp();
  const logoFileRef = useRef<HTMLInputElement>(null);

  const isFirstLaunch = companies.length === 0;

  // When no companies exist (First-Time Launch), default to 'create'.
  // When companies exist (e.g. after Logout), default to 'login'.
  const [view, setView] = useState<'login' | 'create' | 'restore' | 'select'>(
    companies.length === 0 ? 'create' : 'login'
  );

  // Login states
  const [selectedLoginCompanyId, setSelectedLoginCompanyId] = useState<string>(
    activeCompany?.id || companies[0]?.id || ''
  );
  const targetLoginCompany =
    companies.find(c => c.id === selectedLoginCompanyId) || activeCompany || companies[0] || null;

  const [loginEmail, setLoginEmail] = useState<string>(
    targetLoginCompany?.users?.[0]?.email || ''
  );
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Sync login email when selected company changes
  const handleSelectLoginCompany = (compId: string) => {
    setSelectedLoginCompanyId(compId);
    const comp = companies.find(c => c.id === compId);
    if (comp && comp.users.length > 0) {
      setLoginEmail(comp.users[0].email);
      setLoginPassword('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLoginCompany) {
      showToast('Please create or restore a chamber workspace first', 'error');
      return;
    }
    if (!loginEmail.trim()) {
      showToast('Please enter your registered email address', 'error');
      return;
    }
    loginUser(loginEmail.trim(), loginPassword, targetLoginCompany.id);
  };

  // Form states for creation
  const [name, setName] = useState('');
  const [type, setType] = useState('Advocate Chamber');
  const [barCouncil, setBarCouncil] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Dynamic Logo states (Vyapar style)
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoBadge, setLogoBadge] = useState<any>('scales');
  const [logoColor, setLogoColor] = useState('#2563EB');

  // Admin user states
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const districtList = Object.keys(wbDistricts);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Firm / Chamber name is required', 'error');
      return;
    }
    if (!adminName.trim()) {
      showToast('Advocate name is required', 'error');
      return;
    }
    if (!adminEmail.trim()) {
      showToast('Email address is required', 'error');
      return;
    }

    createCompany(
      {
        name: name.trim(),
        type,
        barCouncil: barCouncil.trim() || 'WB/Advocate',
        gst: gst.trim(),
        address: address.trim(),
        city: city.trim() || 'Kolkata',
        state: state.trim() || 'West Bengal',
        pin: pin.trim(),
        phone: phone.trim() || adminPhone.trim(),
        email: email.trim() || adminEmail.trim(),
        logoUrl,
        logoBadge,
        logoColor
      },
      {
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        password: adminPassword.trim()
      }
    );
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

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        restoreCompany(parsed);
      } catch {
        showToast('Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <Toast />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[94vh] overflow-y-auto">
        {/* Optional Close button if launched as modal inside existing session */}
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
                  Mandatory First-Time Setup · চেম্বার নিবন্ধন বাধ্যতামূলক
                </strong>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  Welcome Senior Advocate / Learned Counsel. Before you can begin managing West Bengal land cases, daily cause lists, or AI drafts, registering your legal chamber or law firm is mandatory. All records remain 100% private and stored offline in your device.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mode switcher tabs */}
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
              <span>Sign In</span>
            </button>
          )}

          {!isFirstLaunch && (
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
            <span>{isFirstLaunch ? '1. Create Chamber / Firm' : 'New Chamber'}</span>
          </button>

          <button
            type="button"
            onClick={() => setView('restore')}
            className={`flex-1 pb-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              view === 'restore'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isFirstLaunch ? '2. Restore Backup Data' : 'Restore JSON'}</span>
          </button>
        </div>

        {/* VIEW 0: Sign In to Existing Chamber */}
        {view === 'login' && !isFirstLaunch && targetLoginCompany && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CompanyLogo company={targetLoginCompany} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {targetLoginCompany.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {targetLoginCompany.type} · {targetLoginCompany.city} · {targetLoginCompany.cases?.length || 0} Cases
                  </div>
                </div>
              </div>
              {companies.length > 1 && (
                <select
                  value={targetLoginCompany.id}
                  onChange={e => handleSelectLoginCompany(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
                  title="Switch Chamber Workspace"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Select Registered Advocate / Team Member Profile */}
            {targetLoginCompany.users && targetLoginCompany.users.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">
                  Select Chamber Account (অ্যাডভোকেট / স্টাফ প্রোফাইল)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {targetLoginCompany.users.map(u => {
                    const isSelectedUser = loginEmail.toLowerCase() === u.email.toLowerCase();
                    const requiresCustomPass = Boolean(u.password && u.password !== 'admin123');
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setLoginEmail(u.email);
                          if (!requiresCustomPass) {
                            loginUser(u.email, '', targetLoginCompany.id);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelectedUser
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {u.email}
                            </div>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                              {u.role}
                            </span>
                          </div>
                        </div>
                        <UserCheck className={`w-4 h-4 shrink-0 ${isSelectedUser ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Registered Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="advocate@chamber.in"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Password (If configured)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter password (or leave blank)"
                    className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <span>Sign In &amp; Enter Chamber Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 1: Create Chamber / Firm (First time setup) */}
        {view === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Chamber / Firm Registration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup your legal practice details once. You will be logged in permanently.
              </p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                1. Chamber / Firm Information
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Chamber / Firm Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. S.R. Khan Legal Chamber & Associates"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Firm Type
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Advocate Chamber</option>
                  <option>Law Firm</option>
                  <option>Solo Practice</option>
                  <option>Legal Consultancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Bar Council Reg No
                </label>
                <input
                  type="text"
                  value={barCouncil}
                  onChange={e => setBarCouncil(e.target.value)}
                  placeholder="WB/1482/2012"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  GST / PAN (Optional)
                </label>
                <input
                  type="text"
                  value={gst}
                  onChange={e => setGst(e.target.value)}
                  placeholder="19AAACS8841M1ZU"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Chamber Office Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Alipore Judges Court Bar Association Building, Kolkata"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  District (WB) *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {districtList.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="700027"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pt-2 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                2. Senior Advocate Profile (Chamber Head)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Advocate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="Adv. S. R. Khan"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Advocate Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="advocate@chamber.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Mobile / WhatsApp
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  placeholder="+91 98301 23456"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* 3. Dynamic Logo & Insignia Branding */}
            <div className="border-b border-slate-200 dark:border-slate-800 pt-2 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Chamber Legal Insignia & Branding</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3">
              <div className="flex items-center gap-3">
                <CompanyLogo
                  company={{ name: name || 'Legal Chamber', logoUrl, logoBadge, logoColor } as any}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Dynamic Logo Preview
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Displays on Header, Sidebar, Dashboard & printed case briefs
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoUrl ? 'Change' : 'Upload Logo'}</span>
                </button>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFile}
                />
              </div>

              {/* Insignia Badges */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {BADGE_OPTIONS.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setLogoBadge(b.id);
                      setLogoUrl(undefined);
                    }}
                    className={`py-1 px-1.5 rounded-lg text-center border text-[11px] transition-all cursor-pointer ${
                      logoBadge === b.id && !logoUrl
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate block">{b.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Color Scheme Picker */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500">Accent Color:</span>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setLogoColor(c.id)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        logoColor === c.id ? 'scale-125 ring-2 ring-blue-600' : 'hover:scale-110 opacity-70'
                      }`}
                      style={{ backgroundColor: c.id }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch & Enter Chamber Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: Restore from Backup */}
        {view === 'restore' && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Restore Existing Chamber from Backup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                If you already have an exported SRK backup JSON file, restore it here to resume work immediately.
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 transition-all cursor-pointer group text-center">
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <RotateCcw className="w-8 h-8" />
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                Click to Select Backup JSON File
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Restores cases, cause list, diary, parties, and documents without any password barrier
              </div>
            </label>
          </div>
        )}

        {/* VIEW 3: Existing Chambers List (if multiple chambers exist) */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCompany(c.id);
                      }}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {companies.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete chamber workspace "${c.name}"?`)) {
                            deleteCompany(c.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
