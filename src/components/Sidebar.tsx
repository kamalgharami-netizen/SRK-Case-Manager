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
  | 'client-ledger'
  | 'cash-bank'
  | 'financial-reports'
  | 'users'
  | 'wblract'
  | 'vault'
  | 'timeline';

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
    language,
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
    const isRoyal = theme === 'azure';
    if (isRoyal) {
      return `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        isActive
          ? 'bg-[#0284C7] text-white shadow-md shadow-sky-950/40 font-bold'
          : 'text-blue-100/90 hover:text-white hover:bg-white/10'
      }`;
    }
    return `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
        : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/90'
    }`;
  };

  const countBadgeClass = (page: NavPage) => {
    const isActive = currentPage === page;
    const isRoyal = theme === 'azure';
    if (isRoyal) {
      return `text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
        isActive
          ? 'bg-white/25 text-white'
          : 'bg-white/10 text-sky-200 border border-white/15'
      }`;
    }
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

  const isRoyal = theme === 'azure';

  const sidebarSurfaceClass =
    theme === 'azure'
      ? 'bg-[#0B3A75] text-white border-r border-[#082C5A]'
      : theme === 'white'
      ? 'bg-white text-slate-800 border-slate-200'
      : theme === 'light'
      ? 'bg-slate-50 text-slate-800 border-slate-200'
      : theme === 'sepia'
      ? 'bg-[#FBF5E8] text-[#291A08] border-[#E2D2BA]'
      : theme === 'mint'
      ? 'bg-emerald-50/60 text-slate-800 border-emerald-200'
      : 'bg-[#0B3A75] text-white border-r border-[#082C5A]';

  const sidebarHeaderFooterClass =
    theme === 'azure'
      ? 'bg-[#082C5A]/80 border-[#082C5A]'
      : theme === 'white'
      ? 'bg-white border-slate-200'
      : theme === 'light'
      ? 'bg-slate-100/80 border-slate-200'
      : theme === 'sepia'
      ? 'bg-[#F4ECDC] border-[#E2D2BA]'
      : theme === 'mint'
      ? 'bg-emerald-100/70 border-emerald-200'
      : 'bg-[#082C5A]/80 border-[#082C5A]';

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
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-20 px-4 border-b flex items-center justify-between gap-2.5 ${sidebarHeaderFooterClass} shrink-0`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 ring-2 ring-amber-400/50 flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(2,6,23,0.35)]">
              <Scale className="w-5 h-5 text-amber-300 drop-shadow-xs" />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-black tracking-tight leading-snug truncate ${isRoyal ? 'text-white' : 'text-slate-900'}`}>
                SRK Case Manager
              </div>
              <div className={`text-[11px] font-semibold truncate ${isRoyal ? 'text-sky-300' : 'text-blue-600'}`}>
                Your Legal Companion
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isRoyal
                ? 'text-sky-200 hover:text-white hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
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
                  onClick={() => handleNav('client-ledger')}
                  className={navItemClass('client-ledger')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Client Ledger (বকেয়া)</span>
                  </div>
                  <span className={countBadgeClass('client-ledger')}>
                    {activeCompany?.partyLedgerEntries?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('cash-bank')}
                  className={navItemClass('cash-bank')}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cash &amp; Bank (নগদ/ব্যাংক)</span>
                  </div>
                  <span className={countBadgeClass('cash-bank')}>
                    {activeCompany?.officeAccounts?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('financial-reports')}
                  className={navItemClass('financial-reports')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>Financial Reports (আর্থিক রিপোর্ট)</span>
                  </div>
                  <span className={countBadgeClass('financial-reports')}>
                    {(activeCompany?.financialEntries?.length || 0) + (activeCompany?.partyLedgerEntries?.length || 0)}
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
              </div>
            )}
          </div>

          {/* SETTINGS & BACKUP (Scrollable inside menu, NEVER sticks) */}
          <div className="space-y-1 pt-3 border-t border-white/15 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onOpenSettings('display');
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isRoyal
                  ? 'text-blue-100/90 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/90'
              }`}
              title="Settings"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-sky-300" />
                <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerManualBackupRequest();
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isRoyal
                  ? 'text-blue-100/90 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/90'
              }`}
              title="Manual Data Backup"
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-sky-300" />
                <span>{language === 'bn' ? 'ডাটা ব্যাকআপ' : 'Backup'}</span>
              </div>
            </button>
          </div>

          {/* Full-width Red Logout Button matching Image 1 (Scrolls naturally, does NOT stick) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={logoutUser}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-extrabold rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-md shadow-red-950/30 transition-all cursor-pointer"
              title="Logout from Current Session"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>

          {/* Application Version & In-Place Replacement Sync (Scrolls naturally, does NOT stick) */}
          <div className="pt-2 pb-2 border-t border-white/10 dark:border-slate-800 flex items-center justify-between text-[10px] text-sky-200/70 dark:text-slate-400 px-1">
            <span className="font-mono font-bold tracking-tight">
              v{appVersion}
            </span>
            <button
              type="button"
              onClick={forceAppUpdateAndReplace}
              className="flex items-center gap-1 hover:text-white dark:hover:text-blue-400 font-semibold cursor-pointer transition-colors"
              title="Replace existing app with latest build and refresh"
            >
              <RefreshCw className="w-2.5 h-2.5 text-sky-300" />
              <span>Update / Sync</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
