import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompanyLogo } from './CompanyLogo';
import {
  Scale,
  LayoutDashboard,
  FileText,
  FolderGit2,
  Send,
  Building,
  RefreshCw,
  Calendar,
  Calculator,
  Brain,
  Users,
  ShieldAlert,
  BookOpen,
  MessageSquare,
  Archive,
  BookMarked,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  ChevronRight,
  Database,
  Menu,
  FileSearch,
  Gavel,
  X,
  Sun,
  Moon,
  SlidersHorizontal,
  Plus,
  Scroll,
  FileSpreadsheet,
  HardDrive,
  Wallet
} from 'lucide-react';
import { CaseType } from '../types';

export type NavPage =
  | 'dashboard'
  | 'case-mutation'
  | 'case-misc'
  | 'case-lrappeal'
  | 'case-firstappeal'
  | 'case-rti'
  | 'case-lrtt'
  | 'case-conversion'
  | 'case-certcopy'
  | 'case-rorpi'
  | 'causelist'
  | 'sharecalculator'
  | 'aistudio'
  | 'parties'
  | 'accounts'
  | 'users'
  | 'wblract'
  | 'vault'
  | 'timeline'
  | 'messages';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const {
    activeCompany,
    activeUser,
    switchCompany,
    logoutUser,
    t,
    theme,
    setTheme,
    viewDensity,
    setViewDensity,
    fontSize,
    setFontSize,
    openViewModal,
    openChamberSetup,
    appVersion,
    forceAppUpdateAndReplace,
    triggerManualBackupRequest,
    backupStoragePath
  } = useApp();
  const [casesOpen, setCasesOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [chamberOpen, setChamberOpen] = useState(true);

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases.filter(c => c.type === type).length || 0;
  };

  const navItemClass = (page: NavPage) => {
    const isActive = currentPage === page;
    return `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
        : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/90'
    }`;
  };

  const countBadgeClass = (page: NavPage) => {
    const isActive = currentPage === page;
    return `text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'bg-slate-100 text-slate-700 border border-slate-200/70'
    }`;
  };

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const sidebarSurfaceClass =
    theme === 'white'
      ? 'bg-white text-slate-800 border-slate-200'
      : theme === 'light'
      ? 'bg-slate-50 text-slate-800 border-slate-200'
      : theme === 'sepia'
      ? 'bg-[#FBF5E8] text-[#291A08] border-[#E2D2BA]'
      : theme === 'azure'
      ? 'bg-sky-50/70 text-slate-800 border-sky-200'
      : theme === 'mint'
      ? 'bg-emerald-50/60 text-slate-800 border-emerald-200'
      : 'bg-white text-slate-800 border-slate-200';

  const sidebarHeaderFooterClass =
    theme === 'white'
      ? 'bg-white border-slate-200'
      : theme === 'light'
      ? 'bg-slate-100/80 border-slate-200'
      : theme === 'sepia'
      ? 'bg-[#F4ECDC] border-[#E2D2BA]'
      : theme === 'azure'
      ? 'bg-sky-100/70 border-sky-200'
      : theme === 'mint'
      ? 'bg-emerald-100/70 border-emerald-200'
      : 'bg-white border-slate-200';

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
          title="Click to close sidebar"
        />
      )}

      {/* Theme-aware Sidebar drawer - Fixed size for mobile, perfectly docked */}
      <aside
        className={`fixed lg:static inset-y-0 top-0 bottom-0 left-0 z-50 lg:z-30 w-[280px] max-w-[85vw] lg:w-64 h-full max-h-[100dvh] my-0 ${sidebarSurfaceClass} border-r lg:border rounded-r-2xl lg:rounded-2xl shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out shrink-0 flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:flex'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 px-4 border-b flex items-center justify-between gap-2.5 ${sidebarHeaderFooterClass} shrink-0`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <CompanyLogo company={activeCompany} size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                SRK Case Manager
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                {activeCompany?.name || 'Legal Chamber'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable navigation menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {/* MAIN */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              MAIN
            </div>
            <button
              onClick={() => handleNav('dashboard')}
              className={navItemClass('dashboard')}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.dashboard}</span>
              </div>
            </button>
          </div>

          {/* LAND CASE CATEGORIES */}
          <div className="space-y-1">
            <button
              onClick={() => setCasesOpen(!casesOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>{t.landCases}</span>
              {casesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {casesOpen && (
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('case-mutation')}
                  className={navItemClass('case-mutation')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t.mutationCase}</span>
                  </div>
                  <span className={countBadgeClass('case-mutation')}>
                    {getCaseCount('mutation')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-misc')}
                  className={navItemClass('case-misc')}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{t.miscCase}</span>
                  </div>
                  <span className={countBadgeClass('case-misc')}>
                    {getCaseCount('misc')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrappeal')}
                  className={navItemClass('case-lrappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.lrAppeal}</span>
                  </div>
                  <span className={countBadgeClass('case-lrappeal')}>
                    {getCaseCount('lrappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-firstappeal')}
                  className={navItemClass('case-firstappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{t.firstAppeal}</span>
                  </div>
                  <span className={countBadgeClass('case-firstappeal')}>
                    {getCaseCount('firstappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-rti')}
                  className={navItemClass('case-rti')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSearch className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{t.rtiMatter}</span>
                  </div>
                  <span className={countBadgeClass('case-rti')}>
                    {getCaseCount('rti')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrtt')}
                  className={navItemClass('case-lrtt')}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>{t.lrttTribunal}</span>
                  </div>
                  <span className={countBadgeClass('case-lrtt')}>
                    {getCaseCount('lrtt')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-conversion')}
                  className={navItemClass('case-conversion')}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t.conversionCase}</span>
                  </div>
                  <span className={countBadgeClass('case-conversion')}>
                    {getCaseCount('conversion')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-certcopy')}
                  className={navItemClass('case-certcopy')}
                >
                  <div className="flex items-center gap-2.5">
                    <Scroll className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t.certCopyCase}</span>
                  </div>
                  <span className={countBadgeClass('case-certcopy')}>
                    {getCaseCount('certcopy')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-rorpi')}
                  className={navItemClass('case-rorpi')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span>{t.rorPiCase}</span>
                  </div>
                  <span className={countBadgeClass('case-rorpi')}>
                    {getCaseCount('rorpi')}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* CHAMBER TOOLS */}
          <div className="space-y-1">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>{t.toolsLibrary}</span>
              {toolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {toolsOpen && (
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('causelist')}
                  className={navItemClass('causelist')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t.dailyCauseList}</span>
                  </div>
                  <span className={countBadgeClass('causelist')}>
                    {activeCompany?.causeList?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('sharecalculator')}
                  className={navItemClass('sharecalculator')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t.shareCalc}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('aistudio')}
                  className={navItemClass('aistudio')}
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>{t.aiLegalDrafting}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('timeline')}
                  className={navItemClass('timeline')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{t.caseDiary}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* CHAMBER & STATUTORY LIBRARY */}
          <div className="space-y-1">
            <button
              onClick={() => setChamberOpen(!chamberOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>{t.chamberOffice}</span>
              {chamberOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {chamberOpen && (
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('parties')}
                  className={navItemClass('parties')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.clientRegistry}</span>
                  </div>
                  <span className={countBadgeClass('parties')}>
                    {activeCompany?.parties?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('accounts')}
                  className={navItemClass('accounts')}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Office Accounts (আয়-ব্যয়)</span>
                  </div>
                  <span className={countBadgeClass('accounts')}>
                    {activeCompany?.financialEntries?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('wblract')}
                  className={navItemClass('wblract')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{t.statutoryWblr}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('messages')}
                  className={navItemClass('messages')}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span>{t.clientMessaging}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Theme-aware Footer with Backup Now, Settings & Logout */}
        <div className={`p-3 border-t space-y-2.5 ${sidebarHeaderFooterClass}`}>
          {/* Backup Now Option */}
          <button
            type="button"
            onClick={triggerManualBackupRequest}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            title={`Immediate manual backup to: ${backupStoragePath || 'Local Storage'}`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Backup Now (এখনই ব্যাকআপ)</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Local Storage</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              onClick={() => onOpenSettings('display')}
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Theme & Chamber Settings"
            >
              <Settings className="w-3.5 h-3.5 text-blue-600" />
              <span>Settings</span>
            </button>

            <button
              onClick={logoutUser}
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
              title="Logout from Current Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Application Version & In-Place Replacement Sync */}
          <div className="pt-2 mt-1 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
            <span className="font-mono font-bold tracking-tight text-slate-700 dark:text-slate-300">
              v{appVersion}
            </span>
            <button
              type="button"
              onClick={forceAppUpdateAndReplace}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-semibold cursor-pointer transition-colors"
              title="Replace existing app with latest build and refresh"
            >
              <RefreshCw className="w-2.5 h-2.5 text-blue-500" />
              <span>Update / Sync</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
