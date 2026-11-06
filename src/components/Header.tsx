import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Search, ArrowLeft, RefreshCw, Minus, Square, X, Calendar, Scale, Languages } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

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
  onRefresh?: () => void;
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
  onRefresh
}) => {
  const {
    activeCompany,
    activeUser,
    language,
    setLanguage,
    t
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      setCurrentDate(datePart);
      setCurrentTime(timePart);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayName = activeUser?.name || 'Kamal Gharami';
  const roleName = activeUser?.role || 'Administrator';

  return (
    <header className="sticky top-0 z-30 min-h-16 h-auto bg-white border-b border-[#DCE7F3] px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-xs">
      {/* Left Section: Mobile Menu Toggle / Back Button & App Lockup matching Image 1 */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {canGoBack && onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline font-semibold">Back</span>
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
            isSidebarOpen ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/30' : ''
          }`}
          title={isSidebarOpen ? 'Toggle navigation menu' : 'Open navigation menu'}
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* SRK Case Manager Logo & Title Lockup matching Image 1 */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1976D2] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="text-left leading-tight min-w-0">
            <div className="text-sm sm:text-base font-extrabold text-[#0A2540] tracking-tight truncate">
              SRK Case Manager
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#5A6B82] font-semibold truncate mt-0.5">
              Grow Your Practice, Comply with Law
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Real-time search box */}
      <div className="order-3 basis-full max-w-none sm:order-none sm:basis-auto sm:flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md min-w-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={language === 'bn' ? 'মামলা নম্বর, মক্কেল বা সারসংক্ষেপ খুঁজুন...' : 'Search case no, client or summary...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Section: Language Toggle, User Profile, Window Controls matching Image 1 */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dual Language Switcher [বাংলা] [English] */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              language === 'bn'
                ? 'bg-[#1976D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="বাংলা ইন্টারফেস বেছে নিন"
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#1976D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to English interface"
          >
            English
          </button>
        </div>

        {/* User Profile Avatar with Name & Administrator Role matching Image 1 */}
        <div
          onClick={() => onOpenSettings('branding')}
          className="flex items-center gap-2 cursor-pointer group pl-1.5 border-l border-slate-200"
          title="Account Settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#1976D2] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-100">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-bold text-[#0A2540]">
              {displayName}
            </div>
            <div className="text-[10px] text-[#5A6B82] font-semibold">
              {roleName}
            </div>
          </div>
        </div>

        {/* Window controls (minimize, maximize, close) matching Image 1 */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 text-slate-400">
          <button
            type="button"
            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
