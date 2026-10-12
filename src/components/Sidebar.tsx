import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  X
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
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const { activeCompany, activeUser, switchCompany, logoutUser } = useApp();
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
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
          title="Click to close sidebar"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header: Exact aligned 3-line toggle at top-left + Brand Logo */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-lg text-blue-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Close sidebar (3-line)"
              aria-label="Close sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-white tracking-tight leading-snug truncate">
                SRK Case Manager
              </div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {activeCompany?.name || 'Legal Chamber'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
                <span>Dashboard</span>
              </div>
            </button>
          </div>

          {/* Land Case Categories */}
          <div className="space-y-1">
            <button
              onClick={() => setCasesOpen(!casesOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              <span>Land Cases (মামলা)</span>
              {casesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {casesOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('case-mutation')}
                  className={navItemClass('case-mutation')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Mutation Case</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('mutation')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-misc')}
                  className={navItemClass('case-misc')}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    <span>Misc Case</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('misc')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrappeal')}
                  className={navItemClass('case-lrappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>LR Appeal (Sec 54)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('lrappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-firstappeal')}
                  className={navItemClass('case-firstappeal')}
                >
                  <div className="flex items-center gap-2.5">
                    <Gavel className="w-4 h-4 text-indigo-400" />
                    <span>First Appeal (প্রথম আপিল)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('firstappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-rti')}
                  className={navItemClass('case-rti')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSearch className="w-4 h-4 text-teal-400" />
                    <span>RTI Matter (তথ্য জানার অধিকার)</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('rti')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrtt')}
                  className={navItemClass('case-lrtt')}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>WBLRTT Tribunal</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {getCaseCount('lrtt')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-conversion')}
                  className={navItemClass('case-conversion')}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Conversion Case</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
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
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              <span>Practice Tools</span>
              {toolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {toolsOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('causelist')}
                  className={navItemClass('causelist')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Daily Cause List</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {activeCompany?.causeList?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('sharecalculator')}
                  className={navItemClass('sharecalculator')}
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-rose-400" />
                    <span>Share & Farayez Calc</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('aistudio')}
                  className={navItemClass('aistudio')}
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span>AI Drafting Studio</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('vault')}
                  className={navItemClass('vault')}
                >
                  <div className="flex items-center gap-2.5">
                    <Archive className="w-4 h-4 text-indigo-400" />
                    <span>Document Vault</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {activeCompany?.vaultFiles?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('timeline')}
                  className={navItemClass('timeline')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4 text-sky-400" />
                    <span>Case Diary</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Chamber & Statutory Library */}
          <div className="space-y-1">
            <button
              onClick={() => setChamberOpen(!chamberOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              <span>Chamber & Laws</span>
              {chamberOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {chamberOpen && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('parties')}
                  className={navItemClass('parties')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Party Registry</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">
                    {activeCompany?.parties?.length || 0}
                  </span>
                </button>

                {activeUser?.role === 'Admin' && (
                  <button
                    onClick={() => handleNav('users')}
                    className={navItemClass('users')}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                      <span>Team & Audit Log</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleNav('wblract')}
                  className={navItemClass('wblract')}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-teal-400" />
                    <span>WBLR Act & Manual</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('messages')}
                  className={navItemClass('messages')}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <span>Notices & WhatsApp</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Database Status, Switch, Logout */}
        <div className="p-3 bg-slate-900 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Local Storage</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={switchCompany}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Switch Firm"
            >
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>Switch</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Preferences & Backup"
            >
              <Settings className="w-3 h-3 text-blue-400" />
              <span>Settings</span>
            </button>
          </div>

          <button
            onClick={logoutUser}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-md border border-slate-700/60 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 transition-colors"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
