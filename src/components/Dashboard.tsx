import React from 'react';
import { useApp } from '../context/AppContext';
import { NavPage } from './Sidebar';
import {
  FileText,
  FolderGit2,
  Send,
  Building,
  RefreshCw,
  Calendar,
  Calculator,
  Brain,
  Plus,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight,
  Gavel,
  FileSearch
} from 'lucide-react';
import { CaseType } from '../types';

interface DashboardProps {
  onNavigate: (page: NavPage) => void;
  onOpenNewCase: (type: CaseType) => void;
  onViewCaseDetail: (caseId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewCase,
  onViewCaseDetail
}) => {
  const { activeCompany, activeUser } = useApp();

  const totalCases = activeCompany?.cases?.length || 0;
  const todayHearings = activeCompany?.causeList?.length || 0;
  const pendingCases =
    activeCompany?.cases?.filter(
      c => !['Allowed', 'Rejected', 'Disposed', 'Dismissed', 'Order Passed'].includes(c.status)
    ).length || 0;
  const vaultFiles = activeCompany?.vaultFiles?.length || 0;

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases?.filter(c => c.type === type).length || 0;
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Upcoming hearings (within next 14 days)
  const upcomingHearings = (activeCompany?.cases || [])
    .filter(c => c.nextDate)
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Chamber Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-blue-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-xs border border-white/15">
              <span>🏛️ {activeCompany?.name}</span>
              <span className="opacity-50">·</span>
              <span>Bar Reg: {activeCompany?.barCouncil || 'WB/Chamber'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {activeUser?.name || 'Advocate'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Your chamber at a glance. Manage West Bengal Land Reform petitions, monitor limitation
              periods under Section 54, calculate 10000-share distributions, and print daily cause lists.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {todayStr}
              </span>
              <span>·</span>
              <span className="font-medium text-emerald-300">
                {activeCompany?.city}, West Bengal
              </span>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onOpenNewCase('mutation')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Mutation
            </button>
            <button
              onClick={() => onNavigate('case-firstappeal')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Gavel className="w-3.5 h-3.5" /> First Appeal (প্রথম আপিল)
            </button>
            <button
              onClick={() => onNavigate('case-rti')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5" /> RTI Query (তথ্য অধিকার)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Cases
          </div>
          <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-400 font-mono tabular-nums my-1">
            {totalCases}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across 7 categories (incl. RTI & Appeals)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Hearings
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums my-1">
            {todayHearings}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            On Daily Cause List
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Pending
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums my-1">
            {pendingCases}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            In hearing / inquiry
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Vault Files
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums my-1">
            {vaultFiles}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Deeds, ROR & Petitions
          </div>
        </div>
      </div>

      {/* Case Types Navigation Grid (Interactive iconic tiles) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Land Case Modules (মামলার ধরন)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click module to view dashboard
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Mutation Tile */}
          <div
            onClick={() => onNavigate('case-mutation')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {getCaseCount('mutation')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Mutation Case</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">মিউটেশন (Sec 50)</div>
            </div>
          </div>

          {/* Misc Case Tile */}
          <div
            onClick={() => onNavigate('case-misc')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                {getCaseCount('misc')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Misc Case</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">মিস কেস (10000 Share)</div>
            </div>
          </div>

          {/* LR Appeal Tile */}
          <div
            onClick={() => onNavigate('case-lrappeal')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {getCaseCount('lrappeal')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">LR Appeal</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">এল.আর. আপিল (Sec 54)</div>
            </div>
          </div>

          {/* First Appeal Tile */}
          <div
            onClick={() => onNavigate('case-firstappeal')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {getCaseCount('firstappeal')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">First Appeal</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">প্রথম আপিল (First Appeal)</div>
            </div>
          </div>

          {/* RTI Matter Tile */}
          <div
            onClick={() => onNavigate('case-rti')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSearch className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                {getCaseCount('rti')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">RTI Matter</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">তথ্য অধিকার (Sec 6 & 19)</div>
            </div>
          </div>

          {/* WBLRTT Tile */}
          <div
            onClick={() => onNavigate('case-lrtt')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {getCaseCount('lrtt')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">WBLRTT</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ট্রাইব্যুনাল O.A.</div>
            </div>
          </div>

          {/* Conversion Tile */}
          <div
            onClick={() => onNavigate('case-conversion')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {getCaseCount('conversion')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Conversion</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">কনভার্সন (Sec 4C)</div>
            </div>
          </div>
        </div>
      </div>

      {/* RTI & First Appeal Dedicated Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Appeal Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-700/50 text-white flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                <Gavel className="w-3.5 h-3.5" />
                <span>FIRST APPEAL MENU (প্রথম আপিল)</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                {getCaseCount('firstappeal')} cases
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">Statutory First Appeal Hub</h3>
            <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
              Manage statutory first appeals under Sec 54 & Sec 51A(5) of WBLR Act against Revenue Officer orders, stay petitions, and limitation countdowns.
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-4 mt-2 border-t border-indigo-800/60 flex-wrap">
            <button
              onClick={() => onNavigate('case-firstappeal')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              Open First Appeal Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCase('firstappeal')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <Plus className="w-3.5 h-3.5" /> File New Appeal
            </button>
          </div>
        </div>

        {/* RTI Cell Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 border border-teal-700/50 text-white flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                <FileSearch className="w-3.5 h-3.5" />
                <span>RTI APPLICATION & APPEAL (তথ্য অধিকার)</span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {getCaseCount('rti')} queries
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">Right to Information (RTI) Cell</h3>
            <p className="text-xs text-teal-200/80 mt-1 leading-relaxed">
              Track RTI petitions u/s 6(1), requisition certified copies of Khatian / Field Inspection Reports from BL&LRO, and file First Appeals u/s 19(1).
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-4 mt-2 border-t border-teal-800/60 flex-wrap">
            <button
              onClick={() => onNavigate('case-rti')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              Open RTI Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCase('rti')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <Plus className="w-3.5 h-3.5" /> New RTI Query
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Cause List & Upcoming Hearings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Cause List Preview (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Today's Daily Cause List ({activeCompany?.causeList?.length || 0})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('causelist')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Full List <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeCompany?.causeList && activeCompany.causeList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Case No</th>
                    <th className="py-2.5 px-4">Party & Forum</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeCompany.causeList.slice(0, 5).map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {item.caseNo}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.party}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.forum} {item.benchRoom ? `(${item.benchRoom})` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : item.status === 'DISPOSED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hearings scheduled for today on the cause list.
            </div>
          )}
        </div>

        {/* Upcoming Hearing Dates & Limitation Alerts (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Upcoming Hearing Dates</span>
              </h3>
            </div>

            <div className="space-y-3">
              {upcomingHearings.map(c => (
                <div
                  key={c.id}
                  onClick={() => onViewCaseDetail(c.id)}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="truncate">{c.caseNo}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 shrink-0">
                      {c.nextDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {c.party} · {c.forum}
                  </div>
                </div>
              ))}
              {upcomingHearings.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No upcoming hearing dates recorded.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('sharecalculator')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" /> Share Calculator
            </button>
            <button
              onClick={() => onNavigate('aistudio')}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" /> AI Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
