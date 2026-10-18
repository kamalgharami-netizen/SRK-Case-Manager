import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Sun, Moon, Search, Building2, Languages, Scale, SlidersHorizontal, ArrowLeft, HardDrive, LogOut } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { getBackupStatus } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  onOpenSettings: (tab?: 'branding' | 'vault' | 'chainSample' | 'backup') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  currentPageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  canGoBack = false,
  onGoBack,
  currentPageTitle
}) => {
  const { activeCompany, activeUser, theme, setTheme, switchCompany, language, toggleLanguage, openViewModal, t, logoutUser } = useApp();

  const backupStatus = getBackupStatus(activeCompany);

  const roleBadgeColor = {
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    'Junior Advocate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    Clerk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    Accountant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  }[activeUser?.role || 'Admin'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
      {/* Zone 1: Back Button (Mobile/Subpage) + Toggle + Brand Logo Type + Chamber Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
        {canGoBack && onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Go Back to Previous Menu / Option (পেছনে যান)"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Back</span>
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
            isSidebarOpen ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30' : ''
          }`}
          title={isSidebarOpen ? 'Toggle navigation menu' : 'Open navigation menu'}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic legal logo emblem and chamber branding */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <CompanyLogo company={activeCompany} size="sm" />
          <div className="text-left leading-tight hidden xs:block sm:block">
            <div className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              SRK Case Manager
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[130px] sm:max-w-[170px]">
              {activeCompany?.name || 'Legal Chamber'}
            </div>
          </div>
        </div>

        <button
          onClick={switchCompany}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-left transition-colors max-w-[140px] sm:max-w-[220px]"
          title="Switch Chamber Workspace"
        >
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {activeCompany?.city || 'Kolkata'} Office
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Switch Chamber
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
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions, Language switcher, Theme & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-xs transition-all cursor-pointer"
          title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bengali)' : 'Switch to English'}
          aria-label="Switch language English / Bengali"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">{language === 'en' ? 'EN' : 'বাংলা'}</span>
          <span className="text-[10px] opacity-60">|</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            {language === 'en' ? 'বাংলা' : 'EN'}
          </span>
        </button>

        {/* Background Theme Switcher: White / Light / Dark */}
        <div
          className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
          title="Background Theme (White / Light / Dark)"
        >
          <button
            type="button"
            onClick={() => setTheme('white')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              theme === 'white'
                ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Pure White Background (#FFFFFF)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block shrink-0" />
            <span>{language === 'bn' ? 'সাদা' : 'White'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer hidden md:flex items-center gap-1 ${
              theme === 'light'
                ? 'bg-white text-blue-600 shadow-2xs ring-1 ring-slate-200'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Soft Light Background (#F8FAFC)"
          >
            <Sun className="w-3 h-3 text-amber-500" />
            <span>{language === 'bn' ? 'হালকা' : 'Light'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              theme === 'dark'
                ? 'bg-slate-900 text-amber-400 shadow-2xs ring-1 ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Dark Mode Background"
          >
            <Moon className="w-3 h-3" />
            <span className="hidden sm:inline">{language === 'bn' ? 'ডার্ক' : 'Dark'}</span>
          </button>
        </div>

        <button
          onClick={openViewModal}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          title="Display & Viewing Options (ভিউ ও ডিসপ্লে বিকল্পসমূহ)"
          aria-label="Display & Viewing Options"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
            View
          </span>
        </button>

        <div
          onClick={() => onOpenSettings('branding')}
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

        <button
          type="button"
          onClick={logoutUser}
          className="px-2.5 py-1.5 rounded-lg border border-b-2 border-rose-200 dark:border-rose-800 border-b-rose-400 dark:border-b-rose-950 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
          title={language === 'bn' ? 'লগ আউট করুন (Logout)' : 'Logout from Chamber'}
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};
