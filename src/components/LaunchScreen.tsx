import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Scale, Building2, FolderOpen, RotateCcw, ArrowRight, UserPlus, LogIn, Trash2, Shield } from 'lucide-react';

export const LaunchScreen: React.FC = () => {
  const { companies, selectCompany, createCompany, deleteCompany, loginUser, restoreCompany, showToast } = useApp();
  const [view, setView] = useState<'welcome' | 'create' | 'select' | 'login'>(
    companies.length === 0 ? 'create' : 'welcome'
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Form states for creation
  const [name, setName] = useState('');
  const [type, setType] = useState('Advocate Chamber');
  const [barCouncil, setBarCouncil] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('West Bengal');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Admin user states
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const targetCompany = companies.find(c => c.id === selectedCompanyId) || (companies.length > 0 ? companies[0] : null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Firm/Company name is required', 'error');
      return;
    }
    if (!adminName.trim()) {
      showToast('Admin Advocate name is required', 'error');
      return;
    }
    if (!adminEmail.trim()) {
      showToast('Admin email is required', 'error');
      return;
    }
    if (adminPassword.length < 3) {
      showToast('Password must be at least 3 characters', 'error');
      return;
    }

    createCompany(
      {
        name,
        type,
        barCouncil,
        gst,
        address,
        city,
        state,
        pin,
        phone,
        email
      },
      {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword
      }
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Enter your login email', 'error');
      return;
    }
    loginUser(loginEmail, loginPassword);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
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
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/25 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-900 dark:text-blue-400">
            SRK Case Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            West Bengal Legal Chamber & Land Case Management Platform
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full ${view === 'welcome' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${view === 'create' || view === 'select' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${view === 'login' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>

        {/* VIEW: Welcome */}
        {view === 'welcome' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold">Chamber Workspace Setup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage mutation petitions, misc cases, LR appeals, WBLRTT filings, daily cause lists & calculations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setView('create')}
                className="flex flex-col items-center p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm">Create Firm</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Start fresh chamber workspace
                </div>
              </button>

              <button
                onClick={() => setView('select')}
                className={`flex flex-col items-center p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 transition-all text-center group ${
                  companies.length > 0
                    ? 'hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={companies.length === 0}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm">Open Firm ({companies.length})</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Select saved chamber
                </div>
              </button>

              <label className="flex flex-col items-center p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-center group cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreFile}
                />
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm">Restore Data</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  From backup .json file
                </div>
              </label>
            </div>

            {companies.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Quick Access
                </div>
                <div
                  onClick={() => {
                    setSelectedCompanyId(companies[0].id);
                    setView('login');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {companies[0].name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{companies[0].name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {companies[0].cases?.length || 0} cases · {companies[0].users?.length || 0} members · {companies[0].city}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Create Company */}
        {view === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Register Chamber / Firm</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These credentials will appear on generated pleadings, drafts, and cause lists.
              </p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                1. Firm Information
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
                placeholder="e.g. SRK Legal Chamber & Associates"
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
                placeholder="Room No. 14, Alipore Judges Court Bar Association Building"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Kolkata / Alipore"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                2. Senior Advocate / Admin User
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Full Name *
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
                  Email Address *
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
                  Login Password *
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Min 3 characters"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Create Workspace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW: Select Company */}
        {view === 'select' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Select Chamber Workspace</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between your legal chambers or solo practice books.
              </p>
            </div>

            <div className="space-y-2.5">
              {companies.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors group"
                >
                  <div
                    onClick={() => {
                      setSelectedCompanyId(c.id);
                      setView('login');
                    }}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {c.type} · {c.users?.length || 0} user(s) · {c.cases?.length || 0} cases · {c.city || 'West Bengal'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCompanyId(c.id);
                        setView('login');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      Login
                    </button>
                    {companies.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete chamber workspace "${c.name}"?`)) {
                            deleteCompany(c.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setView('create')}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create Another Firm
              </button>
            </div>
          </div>
        )}

        {/* VIEW: Login */}
        {view === 'login' && targetCompany && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mb-2">
                {targetCompany.name}
              </div>
              <h2 className="text-lg font-bold">Sign In to Chamber</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your user account or enter your credentials.
              </p>
            </div>

            {/* Quick user selection pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
                Chamber Members
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {targetCompany.users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setLoginEmail(u.email);
                      setLoginPassword(u.password || '');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      loginEmail.toLowerCase() === u.email.toLowerCase()
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {u.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-600" />
                        {u.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="user@chamber.in"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setView('select')}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Enter Chamber
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
