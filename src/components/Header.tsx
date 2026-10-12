import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Sun, Moon, Search, Building2 } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings,
  searchQuery,
  onSearchChange
}) => {
  const { activeCompany, activeUser, theme, setTheme, switchCompany, showToast } = useApp();

  const roleBadgeColor = {
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    'Junior Advocate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    Clerk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    Accountant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  }[activeUser?.role || 'Admin'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: 3-line Toggle + Chamber Wordmark / Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center ${
            isSidebarOpen ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30' : ''
          }`}
          title={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={switchCompany}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-left transition-colors max-w-[200px] sm:max-w-[260px]"
          title="Switch Chamber Workspace"
        >
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {activeCompany?.name || 'SRK Legal Chamber'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {activeCompany?.city || 'Kolkata'} · Switch
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Real-time search filter */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search case no, party name, Dag, Mouza, Khatian..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions, Language badge, Theme & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => showToast('Language toggle: English & Bengali terms active', 'info')}
          className="hidden md:inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          EN / বাংলা
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
          title="User Account & Chamber Settings"
        >
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {activeUser?.name
              ? activeUser.name
                  .split(' ')
                  .slice(-2)
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()
              : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeUser?.name || 'Advocate'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${roleBadgeColor}`}>
                {activeUser?.role || 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
