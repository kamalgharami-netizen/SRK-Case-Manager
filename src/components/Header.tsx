import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Search, Building2, Languages, Scale, ArrowLeft, LogOut, Power, X, Settings, Calculator } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { getBackupStatus } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  onOpenSettings: (tab?: 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup') => void;
  onOpenShareCalculator?: () => void;
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
  onOpenShareCalculator,
  searchQuery,
  onSearchChange,
  canGoBack = false,
  onGoBack,
  currentPageTitle
}) => {
  const {
    activeCompany,
    activeUser,
    switchCompany,
    language,
    toggleLanguage,
    t,
    logoutUser,
    requestAppExit
  } = useApp();

  const backupStatus = getBackupStatus(activeCompany);

  const roleBadgeColor = {
    Admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    'Junior Advocate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    Clerk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    Accountant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  }[activeUser?.role || 'Admin'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-2xs">
      {/* Zone 1: Back Button (Mobile/Subpage) + Toggle + Brand Logo Type + Chamber Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
        {canGoBack && onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Go Back to Previous Menu / Option (পেছনে যান)"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Back</span>
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
            isSidebarOpen ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/30' : ''
          }`}
          title={isSidebarOpen ? 'Toggle navigation menu' : 'Open navigation menu'}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic legal logo emblem and chamber branding */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <CompanyLogo company={activeCompany} size="sm" />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 truncate">
              SRK Case Manager
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-blue-600 truncate max-w-[130px] sm:max-w-[170px]">
              {activeCompany?.name || 'Legal Chamber'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenSettings('chambers')}
          className="hidden md:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 bg-slate-50 text-left transition-colors max-w-[160px] sm:max-w-[220px] cursor-pointer"
          title="Chamber Settings & Switch Workspace"
        >
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
              {activeCompany?.city || 'Office'}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">
              Switch &amp; Settings
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

      {/* Zone 3: Actions, Language switcher, Share Calculator & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-xs transition-all cursor-pointer"
          title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bengali)' : 'Switch to English'}
          aria-label="Switch language English / Bengali"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold">{language === 'en' ? 'EN' : 'বাংলা'}</span>
          <span className="text-[10px] opacity-60">|</span>
          <span className="text-[11px] font-normal text-slate-500">
            {language === 'en' ? 'বাংলা' : 'EN'}
          </span>
        </button>

        {/* Share Calculator Button */}
        <button
          type="button"
          onClick={onOpenShareCalculator}
          className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
          title={language === 'bn' ? 'হিস্যা ক্যালকুলেটর ও মুসলিম ফারায়েজ (Share Calculator)' : 'Share Calculator & Muslim Farayez'}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">{language === 'bn' ? 'হিস্যা ক্যালকুলেটর' : 'Share Calculator'}</span>
        </button>

        {/* Settings Shortcut Button */}
        <button
          type="button"
          onClick={() => onOpenSettings('display')}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
          title={language === 'bn' ? 'থিম ও ডিসপ্লে সেটিংস (Theme & Display Settings)' : 'Theme & Display Settings'}
          aria-label="Theme and Display Settings"
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden lg:inline text-[11px]">Settings</span>
        </button>

        <div
          onClick={() => onOpenSettings('branding')}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
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
            <div className="text-xs font-bold text-slate-900 leading-tight">
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
          title={language === 'bn' ? 'লগ আউট করুন' : 'Logout'}
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
        </button>

        {/* Desktop Close/Exit App Button - Prompts Confirmation */}
        <button
          type="button"
          onClick={requestAppExit}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-rose-600 hover:border-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-600 hover:text-white dark:text-slate-300 dark:hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
          title={language === 'bn' ? 'অ্যাপ বন্ধ করুন' : 'Close App'}
          aria-label="Close App"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline">Close</span>
        </button>
      </div>
    </header>
  );
};
