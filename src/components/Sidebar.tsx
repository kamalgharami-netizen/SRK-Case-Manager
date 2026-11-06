import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Home,
  Plus,
  Briefcase,
  MapPin,
  FileText,
  BarChart2,
  Settings,
  Info,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  Send,
  Gavel,
  FileSearch,
  Building,
  RefreshCw,
  Scroll,
  FileSpreadsheet,
  Calendar,
  Calculator,
  HardDrive,
  X,
  TrendingUp
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
  | 'timeline'
  | 'messages'
  | 'about';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup' | 'sync') => void;
  onOpenNewCase?: (type: CaseType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onOpenSettings,
  onOpenNewCase
}) => {
  const {
    activeCompany,
    logoutUser,
    appVersion
  } = useApp();

  const [myCasesExpanded, setMyCasesExpanded] = useState(() => currentPage.startsWith('case-') && currentPage !== 'case-rorpi' && currentPage !== 'case-rti');
  const [reportsExpanded, setReportsExpanded] = useState(() => ['financial-reports', 'causelist', 'accounts', 'client-ledger', 'cash-bank', 'sharecalculator'].includes(currentPage));

  // Keep the active section expanded when navigation changes from another page.
  useEffect(() => {
    if (currentPage.startsWith('case-') && currentPage !== 'case-rorpi' && currentPage !== 'case-rti') {
      setMyCasesExpanded(true);
    }
    if (['financial-reports', 'causelist', 'accounts', 'client-ledger', 'cash-bank', 'sharecalculator'].includes(currentPage)) {
      setReportsExpanded(true);
    }
  }, [currentPage]);

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases.filter(c => c.type === type).length || 0;
  };

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleNewCaseClick = () => {
    if (onOpenNewCase) {
      onOpenNewCase('mutation');
    } else {
      handleNav('case-mutation');
    }
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
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
          title="Click to close sidebar"
        />
      )}

      {/* Deep Navy Blue Sidebar matching Image 1 */}
      <aside
        className={`fixed lg:static inset-y-0 top-0 bottom-0 left-0 z-50 lg:z-30 w-[270px] max-w-[85vw] h-full max-h-[100dvh] my-0 bg-gradient-to-b from-[#083265] to-[#06264D] text-[#E2EDF8] border-r border-blue-950 shadow-2xl lg:shadow-none transition-[transform,width] duration-300 ease-in-out shrink-0 flex flex-col overflow-hidden ${
          isOpen
            ? 'translate-x-0 lg:w-64'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 lg:border-0'
        }`}
      >
        {/* Brand Header matching Image 1: White logo box + bold SRK + Case Manager */}
        <div className="h-24 px-5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/10">
          <div className="flex items-center gap-3 min-w-0">
            {/* White rounded box emblem with blue icon */}
            <div className="w-12 h-12 rounded-2xl bg-white text-[#1976D2] flex flex-col items-center justify-center shrink-0 shadow-md">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xl font-black text-white tracking-tight leading-none">
                SRK
              </div>
              <div className="text-xs font-bold text-white tracking-wider leading-tight mt-0.5">
                Case Manager
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menus matching exact Case Manager requirements */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentPage === 'dashboard'
                ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                : 'text-[#E2EDF8] hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* 2. + New Case */}
          <button
            onClick={handleNewCaseClick}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[#E2EDF8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ New Case</span>
          </button>

          {/* 3. My Cases */}
          <div>
            <div
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                currentPage.startsWith('case-') && currentPage !== 'case-rorpi' && currentPage !== 'case-rti'
                  ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                  : 'text-[#E2EDF8] hover:text-white hover:bg-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => handleNav('case-mutation')}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <Briefcase className="w-4 h-4" />
                <span>My Cases</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMyCasesExpanded(!myCasesExpanded);
                }}
                className="p-1 hover:bg-white/15 rounded-md transition-colors"
                title="Expand / collapse case types"
              >
                {myCasesExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                )}
              </button>
            </div>

            {/* Sub-categories */}
            {myCasesExpanded && (
              <div className="pl-4 pr-1 pt-1 pb-1 space-y-1">
                <button
                  onClick={() => handleNav('case-mutation')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-mutation'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                    <span>Mutation (নামজারি)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('mutation')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-misc')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-misc'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-300" />
                    <span>Misc Case (বিবিধ কেস)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('misc')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrappeal')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-lrappeal'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-emerald-300" />
                    <span>LR Appeal 54</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('lrappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-firstappeal')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-firstappeal'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Gavel className="w-3.5 h-3.5 text-indigo-300" />
                    <span>First Appeal</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('firstappeal')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-lrtt')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-lrtt'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-cyan-300" />
                    <span>WBLRTT Tribunal</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('lrtt')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-conversion')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-conversion'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Conversion (রূপান্তর)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('conversion')}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('case-certcopy')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'case-certcopy'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scroll className="w-3.5 h-3.5 text-rose-300" />
                    <span>Certified Copy</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10">
                    {getCaseCount('certcopy')}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Land Schedule */}
          <button
            onClick={() => handleNav('case-rorpi')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentPage === 'case-rorpi'
                ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                : 'text-[#E2EDF8] hover:text-white hover:bg-white/10'
            }`}
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Land Schedule</span>
          </button>

          {/* 5. RTI & Appeal */}
          <button
            onClick={() => handleNav('case-rti')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentPage === 'case-rti'
                ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                : 'text-[#E2EDF8] hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>RTI &amp; Appeal</span>
          </button>

          {/* 6. Reports */}
          <div>
            <div
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                ['financial-reports', 'causelist', 'accounts', 'client-ledger', 'cash-bank', 'sharecalculator'].includes(currentPage)
                  ? 'bg-[#1976D2] text-white shadow-sm font-bold'
                  : 'text-[#E2EDF8] hover:text-white hover:bg-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => handleNav('financial-reports')}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <BarChart2 className="w-4 h-4 text-violet-400" />
                <span>Reports</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReportsExpanded(!reportsExpanded);
                }}
                className="p-1 hover:bg-white/15 rounded-md transition-colors"
                title="Expand / collapse reports"
              >
                {reportsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                )}
              </button>
            </div>

            {/* Nested Reports */}
            {reportsExpanded && (
              <div className="pl-4 pr-1 pt-1 pb-1 space-y-1">
                <button
                  onClick={() => handleNav('causelist')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'causelist'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daily Cause List (কার্যতালিকা)</span>
                </button>

                <button
                  onClick={() => handleNav('financial-reports')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'financial-reports'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Financial Statement (আর্থিক রিপোর্ট)</span>
                </button>

                <button
                  onClick={() => handleNav('accounts')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'accounts'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Office Accounts (আয়-ব্যয়)</span>
                </button>

                <button
                  onClick={() => handleNav('sharecalculator')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors cursor-pointer ${
                    currentPage === 'sharecalculator'
                      ? 'bg-blue-600/60 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-rose-400" />
                  <span>Share Calc (হিস্যা বণ্টন)</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Settings */}
          <button
            onClick={() => onOpenSettings('display')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[#E2EDF8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Settings</span>
          </button>

          {/* 8. About */}
          <button
            onClick={() => onOpenSettings('branding')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[#E2EDF8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Info className="w-4 h-4 text-sky-300" />
            <span>About</span>
          </button>
        </div>

        {/* Bottom Section: Red Logout Pill Button & Online Telemetry Status matching Image 1 */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/15 shrink-0">
          <button
            type="button"
            onClick={logoutUser}
            className="w-full py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            title="Logout from Chamber Session"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-[#E2EDF8] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="font-semibold text-emerald-300">Online</span>
              <span className="text-[10px] text-slate-400">(Sync Ready)</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">v{appVersion}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
