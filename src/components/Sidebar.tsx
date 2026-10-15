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
  Plus
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
  | 'causelist'
  | 'sharecalculator'
  | 'aistudio'
  | 'parties'
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
  onOpenSettings: (tab?: 'branding' | 'vault' | 'chainSample' | 'backup') => void;
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
    openChamberSetup
  } = useApp();
  const [casesOpen, setCasesOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [chamberOpen, setChamberOpen] = useState(true);

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases.filter(c => c.type === type).length || 0;
  };

  const navItemClass = (page: NavPage) => {
    const isActive = currentPage === page;
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
        : 'text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/70'
    }`;
  };

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
          title="Click to close sidebar"
        />
      )}

      {/* Sidebar drawer: Crisp, no dark black, light/dark adaptive */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-30 w-64 sm:w-72 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl lg:shadow-none transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Header: Exact aligned 3-line toggle at top-left + Brand Logo */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 bg-slate-100/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
              title="Close sidebar (3-line)"
              aria-label="Close sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <CompanyLogo company={activeCompany} size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
                SRK Case Manager
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                {activeCompany?.name || 'Legal Chamber'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable navigation menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {/* Main */}
          <div className="space-y-1">
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

          {/* Land Case Categories */}
          <div className="space-y-1">
            <button
              onClick={() => setCasesOpen(!casesOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <span>{t.landCases}</span>
              {casesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {casesOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('case-mutation')}
                  className={navItemClass('case-mutation')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{t.mutationCase}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('mutation')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-misc')}
                  className={navItemClass('case-misc')}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-purple-500" />
                    <span>{t.miscCase}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('misc')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrappeal')}
                  className={navItemClass('case-lrappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-emerald-500" />
                    <span>{t.lrAppeal}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('lrappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-firstappeal')}
                  className={navItemClass('case-firstappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Gavel className="w-4 h-4 text-indigo-500" />
                    <span>{t.firstAppeal}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('firstappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-rti')}
                  className={navItemClass('case-rti')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSearch className="w-4 h-4 text-teal-500" />
                    <span>{t.rtiMatter}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('rti')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrtt')}
                  className={navItemClass('case-lrtt')}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-cyan-500" />
                    <span>{t.lrttTribunal}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('lrtt')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-conversion')}
                  className={navItemClass('case-conversion')}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    <span>{t.conversionCase}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {getCaseCount('conversion')}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Chamber Tools */}
          <div className="space-y-1">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <span>{t.toolsLibrary}</span>
              {toolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {toolsOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('causelist')}
                  className={navItemClass('causelist')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{t.dailyCauseList}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {activeCompany?.causeList?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('sharecalculator')}
                  className={navItemClass('sharecalculator')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-rose-500" />
                    <span>{t.shareCalc}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('aistudio')}
                  className={navItemClass('aistudio')}
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-violet-500" />
                    <span>{t.aiLegalDrafting}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings('vault');
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                  title="Document Vault shifted to Settings: stores all samples & formats"
                >
                  <div className="flex items-center gap-2.5">
                    <Archive className="w-4 h-4 text-indigo-500" />
                    <span>{t.documentVault} (Settings)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Vault
                  </span>
                </button>

                <button
                  onClick={() => handleNav('timeline')}
                  className={navItemClass('timeline')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-sky-500" />
                    <span>{t.caseDiary}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Chamber & Statutory Library */}
          <div className="space-y-1">
            <button
              onClick={() => setChamberOpen(!chamberOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <span>{t.chamberOffice}</span>
              {chamberOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {chamberOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('parties')}
                  className={navItemClass('parties')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>{t.clientRegistry}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {activeCompany?.parties?.length || 0}
                  </span>
                </button>

                {activeUser?.role === 'Admin' && (
                  <button
                    onClick={() => handleNav('users')}
                    className={navItemClass('users')}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-blue-500" />
                      <span>{t.advocateTeam}</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleNav('wblract')}
                  className={navItemClass('wblract')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-teal-500" />
                    <span>{t.statutoryWblr}</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('messages')}
                  className={navItemClass('messages')}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span>{t.clientMessaging}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Attractive Display & Viewing Menu Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{t.displayPreferences}</span>
              </span>
              <button
                type="button"
                onClick={openViewModal}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer"
              >
                Configure
              </button>
            </div>

            {/* Dark / Light Theme Segmented Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Switch to Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Switch to Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>

            {/* Viewing Options Button with Density badge */}
            <button
              type="button"
              onClick={openViewModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:rotate-45 transition-transform" />
                <span>{t.viewOptions}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
                {viewDensity}
              </span>
            </button>

            {/* Quick density pills */}
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setViewDensity('comfortable')}
                className={`py-1 px-1.5 rounded text-center transition-colors cursor-pointer border ${
                  viewDensity === 'comfortable'
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {t.comfortable}
              </button>

              <button
                type="button"
                onClick={() => setViewDensity('compact')}
                className={`py-1 px-1.5 rounded text-center transition-colors cursor-pointer border ${
                  viewDensity === 'compact'
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {t.compact}
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Database Status, Switch, Logout (No dark black) */}
        <div className="p-3 bg-slate-100/90 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Offline Local Storage</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={openChamberSetup}
              className="flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-md bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer shadow-xs"
              title="Register New Chamber"
            >
              <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>+ Firm</span>
            </button>

            <button
              onClick={switchCompany}
              className="flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Switch Firm Workspace"
            >
              <Building2 className="w-3 h-3 text-amber-500" />
              <span>Switch</span>
            </button>

            <button
              onClick={() => onOpenSettings('branding')}
              className="flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              title="Chamber Settings & Preferences"
            >
              <Settings className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Settings</span>
            </button>
          </div>

          <button
            onClick={() => onOpenSettings('vault')}
            className="w-full flex items-center justify-between py-1.5 px-2.5 text-[11px] font-semibold rounded-md border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-300 transition-colors cursor-pointer shadow-xs"
            title="Open Document Vault & Legal Sample Formats in Settings"
          >
            <div className="flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Document Vault &amp; Samples</span>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
