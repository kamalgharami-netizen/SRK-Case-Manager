import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavPage } from './Sidebar';
import { CompanyLogo } from './CompanyLogo';
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
  FileSearch,
  Languages,
  Users,
  Archive,
  BookOpen,
  MessageSquare,
  BookMarked,
  Scale,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { CaseType, CaseItem } from '../types';

interface DashboardProps {
  onNavigate: (page: NavPage) => void;
  onOpenNewCase: (type: CaseType) => void;
  onViewCaseDetail: (caseId: string) => void;
  onOpenChainDeed?: (c: CaseItem) => void;
  onOpenSettings?: (tab?: 'branding' | 'vault' | 'chainSample' | 'backup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewCase,
  onViewCaseDetail,
  onOpenChainDeed,
  onOpenSettings
}) => {
  const { activeCompany, activeUser, language, toggleLanguage, openViewModal, viewDensity, t } = useApp();

  // Embedded Quick Share Calculator state on Main Dashboard
  const [calcTotalLand, setCalcTotalLand] = useState('1.0');
  const [calcTotalUnit, setCalcTotalUnit] = useState<'acre' | 'bigha' | 'katha' | 'satak' | 'sqft'>('acre');
  const [calcSharePortion, setCalcSharePortion] = useState('25');
  const [calcPortionUnit, setCalcPortionUnit] = useState<'satak' | 'katha' | 'acre' | 'sqft'>('satak');

  const UNIT_TO_SQFT_MAP: Record<string, number> = {
    acre: 43560,
    bigha: 14400,
    katha: 720,
    satak: 435.6,
    sqft: 1
  };

  const totalSqft = (parseFloat(calcTotalLand) || 0) * (UNIT_TO_SQFT_MAP[calcTotalUnit] || 43560);
  const portionSqft = (parseFloat(calcSharePortion) || 0) * (UNIT_TO_SQFT_MAP[calcPortionUnit] || 435.6);
  const share10000 = totalSqft > 0 ? Math.min(10000, Math.round(((portionSqft / totalSqft) * 10000) * 100) / 100) : 0;
  const pct = totalSqft > 0 ? Math.min(100, Math.round(((portionSqft / totalSqft) * 100) * 100) / 100) : 0;
  const remainingSqft = Math.max(0, totalSqft - portionSqft);
  const remaining10000 = Math.max(0, Math.round((10000 - share10000) * 100) / 100);
  const equivalentSatak = Math.round((portionSqft / 435.6) * 100) / 100;
  const equivalentKatha = Math.round((portionSqft / 720) * 100) / 100;

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

  const todayStr = new Date().toLocaleDateString(language === 'bn' ? 'bn-IN' : 'en-IN', {
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
      {/* Compact Top Welcome Strip with Integrated Dynamic Logo (Vyapar App style - Very Small in Top) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo company={activeCompany} size="md" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {activeCompany?.name || 'Legal Chamber'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                🏛️ {activeCompany?.city || 'Kolkata'}, WB
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                Bar: {activeCompany?.barCouncil || 'WB/Chamber'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t.welcomeBack}, <span className="text-blue-600 dark:text-blue-400 font-bold">{activeUser?.name || 'Advocate'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3 text-amber-500" />
                {todayStr}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Language Switcher + Compact Action Badges */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
            title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Quick Create buttons in top strip */}
          <button
            onClick={() => onOpenNewCase('mutation')}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> <span>{language === 'bn' ? 'মিউটেশন' : 'Mutation'}</span>
          </button>
          <button
            onClick={() => onOpenNewCase('conversion')}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> <span>{language === 'bn' ? 'কনভার্সন' : 'Conversion'}</span>
          </button>
          <button
            onClick={() => onOpenNewCase('firstappeal')}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer hidden md:flex"
          >
            <Plus className="w-3.5 h-3.5" /> <span>{language === 'bn' ? '১ম আপিল' : '1st Appeal'}</span>
          </button>
          <button
            onClick={() => onOpenNewCase('rti')}
            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer hidden sm:flex"
          >
            <Plus className="w-3.5 h-3.5" /> <span>{language === 'bn' ? 'RTI' : 'RTI'}</span>
          </button>
        </div>
      </div>

      {/* Case Types Navigation Grid (Interactive iconic tiles with RTI & First Appeal) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {t.landCaseModulesTitle}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.clickModuleSubtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={openViewModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shadow-xs"
            title="Configure Viewing Options"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">View Mode:</span>
            <span className="capitalize font-bold text-blue-600 dark:text-blue-400">{viewDensity}</span>
          </button>
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
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'মিউটেশন কেস' : 'Mutation Case'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'নামজারি (ধারা ৫০)' : 'Sec 50 WBLR'}
              </div>
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
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'মিস কেস' : 'Misc Case'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? '১০০০০ হিস্যা (Sec 50A)' : '10000 Share Sec 50A'}
              </div>
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
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'এল.আর. আপিল' : 'LR Appeal'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'ধারা ৫৪ আপিল' : 'Sec 54 Appeal'}
              </div>
            </div>
          </div>

          {/* First Appeal Tile */}
          <div
            onClick={() => onNavigate('case-firstappeal')}
            className="p-4 rounded-xl border-2 border-indigo-500/40 dark:border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                {getCaseCount('firstappeal')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                {language === 'bn' ? '১ম আপিল (First Appeal)' : 'First Appeal'}
              </div>
              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5 font-medium">
                {language === 'bn' ? 'বিধিবদ্ধ প্রথম আপিল' : 'Statutory 1st Appeal'}
              </div>
            </div>
          </div>

          {/* RTI Matter Tile */}
          <div
            onClick={() => onNavigate('case-rti')}
            className="p-4 rounded-xl border-2 border-teal-500/40 dark:border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSearch className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-900/50 px-1.5 py-0.5 rounded">
                {getCaseCount('rti')}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-teal-950 dark:text-teal-200">
                {language === 'bn' ? 'তথ্য অধিকার (RTI)' : 'RTI Matter'}
              </div>
              <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5 font-medium">
                {language === 'bn' ? 'ধারা ৬(১) ও ১৯(১)' : 'Sec 6(1) & 19(1)'}
              </div>
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
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'ভূমি ট্রাইব্যুনাল' : 'WBLRTT'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'সল্টলেক ও.এ.' : 'Tribunal O.A.'}
              </div>
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
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'কনভার্সন' : 'Conversion'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'বাস্তু রূপান্তর (৪সি)' : 'Sec 4C Bastu'}
              </div>
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
                <span>{t.firstAppealMenuTitle}</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                {getCaseCount('firstappeal')} cases
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">{t.firstAppealHubTitle}</h3>
            <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
              {t.firstAppealHubDesc}
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-4 mt-2 border-t border-indigo-800/60 flex-wrap">
            <button
              onClick={() => onNavigate('case-firstappeal')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {t.openFirstAppealDashboard} <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCase('firstappeal')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <Plus className="w-3.5 h-3.5" /> {t.fileNewFirstAppeal}
            </button>
          </div>
        </div>

        {/* RTI Cell Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 border border-teal-700/50 text-white flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                <FileSearch className="w-3.5 h-3.5" />
                <span>{t.rtiMenuTitle}</span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {getCaseCount('rti')} queries
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">{t.rtiHubTitle}</h3>
            <p className="text-xs text-teal-200/80 mt-1 leading-relaxed">
              {t.rtiHubDesc}
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-4 mt-2 border-t border-teal-800/60 flex-wrap">
            <button
              onClick={() => onNavigate('case-rti')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {t.openRtiDashboard} <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCase('rti')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-white/20"
            >
              <Plus className="w-3.5 h-3.5" /> {t.fileNewRtiQuery}
            </button>
          </div>
        </div>
      </div>

      {/* Chamber Practice Tools & Workspaces Grid (All menus directly on Main Dashboard) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>{language === 'bn' ? 'চেম্বার প্র্যাকটিস টুলস ও সুবিধাসমূহ' : 'Chamber Practice Tools & Utilities'}</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn' ? 'সকল ওয়ার্কস্পেস মেনু' : 'All chamber workspaces & utilities'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* AI Legal Studio */}
          <div
            onClick={() => onNavigate('aistudio')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Gemini AI
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'এআই লিগ্যাল স্টুডিও' : 'AI Legal Studio'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'আবেদন ড্রাফট ও চেম্বার লার্নিং' : 'Smart petitions & WB drafts'}
              </div>
            </div>
          </div>

          {/* Share & Area Calculator */}
          <div
            onClick={() => onNavigate('sharecalculator')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                10,000 Share
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'হিস্যা ক্যালকুলেটর' : 'Share Calculator'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'আনা-গণ্ডা-কান্তি-তিল ও শতক' : 'Decimal & Ana-Ganda land math'}
              </div>
            </div>
          </div>

          {/* Daily Cause List */}
          <div
            onClick={() => onNavigate('causelist')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {activeCompany?.causeList?.length || 0} Listed
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'দৈনিক কজ লিস্ট' : 'Daily Cause List'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'শুনানির সময় ও বেঞ্চ নম্বর' : 'Hearings & Court Benches'}
              </div>
            </div>
          </div>

          {/* Document Vault (Shifted to Settings) */}
          <div
            onClick={() => (onOpenSettings ? onOpenSettings('vault') : onNavigate('vault'))}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Archive className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Settings Vault
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'ডকুমেন্ট ভল্ট ও নমুনা' : 'Document Vault & Samples'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'সকল নমুনা ড্রাফট, দলিল ও ভল্ট (সেটিংস)' : 'All sample drafts & vault files (Settings)'}
              </div>
            </div>
          </div>

          {/* Party Registry */}
          <div
            onClick={() => onNavigate('parties')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {activeCompany?.parties?.length || 0} Contacts
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'পক্ষ রেজিস্ট্রি' : 'Party Registry'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'মক্কেল ও বিপক্ষ তালিকা' : 'Client & Opponent Directory'}
              </div>
            </div>
          </div>

          {/* Case Diary */}
          <div
            onClick={() => onNavigate('timeline')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookMarked className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Daily Notes
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'কেস ডায়েরি' : 'Case Diary'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'প্রতিদিনের অর্ডার শিট ও নোটস' : 'Court Orders & Proceedings'}
              </div>
            </div>
          </div>

          {/* Statutory Library */}
          <div
            onClick={() => onNavigate('wblract')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Law Acts
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'আইন লাইব্রেরি' : 'Statutory Library'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'WBLR আইন ১৯৫৫ ও ম্যানুয়াল' : 'WBLR Act, Manual & Rules'}
              </div>
            </div>
          </div>

          {/* Client Communication */}
          <div
            onClick={() => onNavigate('messages')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                WhatsApp
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'ক্লায়েন্ট মেসেজ' : 'Client Notices'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' ? 'শুনানির মেসেজ ও নোটিশ প্রেরণ' : 'WhatsApp & SMS alerts'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chamber KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.totalCases}
          </div>
          <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-400 font-mono tabular-nums my-1">
            {totalCases}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.acrossCategoriesDesc}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.todaysHearings}
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums my-1">
            {todayHearings}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.onCauseListDesc}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.pendingCases}
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums my-1">
            {pendingCases}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.inHearingInquiryDesc}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.vaultFilesTitle}
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums my-1">
            {vaultFiles}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.deedsRorDesc}
          </div>
        </div>
      </div>

      {/* Main Dashboard Embedded Land Share & 10,000 Hisya Calculator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {language === 'bn' ? '১০,০০০ হিস্যা ও জমি শেয়ার ক্যালকুলেটর' : '10,000 Hisya & Land Share Calculator'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  WB Revenue Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'পশ্চিমবঙ্গ রাজস্ব খতিয়ান ও দলিলের অংশ ও শতক রূপান্তর — ড্যাশবোর্ড থেকে সরাসরি হিসাব করুন'
                  : 'Instant Bengal Land Record 10,000 Hisya, Satak, Katha & Percentage Math'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('sharecalculator')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>{language === 'bn' ? 'সম্পূর্ণ ফারায়েজ ও মাল্টি-হিস্যা ওপেন করুন' : 'Open Full Farayez & Multi-Sharer Tool'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Land Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{language === 'bn' ? 'মোট জমির পরিমাণ (Total Area)' : 'Total Land Area'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">খতিয়ান / দাগের মোট জমি</span>
                </label>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                  <input
                    type="number"
                    step="any"
                    value={calcTotalLand}
                    onChange={e => setCalcTotalLand(e.target.value)}
                    placeholder="1.0"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <select
                    value={calcTotalUnit}
                    onChange={e => setCalcTotalUnit(e.target.value as any)}
                    className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-750 text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="acre">Acre (একর)</option>
                    <option value="bigha">Bigha (বিঘা)</option>
                    <option value="katha">Katha (কাঠা)</option>
                    <option value="satak">Satak / Dec (শতক)</option>
                    <option value="sqft">Sq. Ft.</option>
                  </select>
                </div>
              </div>

              {/* Co-Sharer / Transfer Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{language === 'bn' ? 'শরিকের জমি (Share / Sold)' : 'Co-Sharer / Sold Land'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">বিক্রীত বা নির্দিষ্ট অংশ</span>
                </label>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                  <input
                    type="number"
                    step="any"
                    value={calcSharePortion}
                    onChange={e => setCalcSharePortion(e.target.value)}
                    placeholder="25"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <select
                    value={calcPortionUnit}
                    onChange={e => setCalcPortionUnit(e.target.value as any)}
                    className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-750 text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="satak">Satak (শতক)</option>
                    <option value="katha">Katha (কাঠা)</option>
                    <option value="acre">Acre (একর)</option>
                    <option value="sqft">Sq. Ft.</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Share Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'দ্রুত হিস্যা প্রি-সেট (Quick Presets)' : 'Quick Share Presets'}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('acre');
                    setCalcSharePortion('50');
                    setCalcPortionUnit('satak');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  ½ Share (5,000 Hisya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('acre');
                    setCalcSharePortion('25');
                    setCalcPortionUnit('satak');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  ¼ Share (2,500 Hisya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('acre');
                    setCalcSharePortion('12.5');
                    setCalcPortionUnit('satak');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  ⅛ Share (1,250 Hisya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('bigha');
                    setCalcSharePortion('4');
                    setCalcPortionUnit('katha');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  4 Katha in 1 Bigha (2,000 Hisya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('acre');
                    setCalcSharePortion('1');
                    setCalcPortionUnit('satak');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  1 Satak (100 Hisya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcTotalLand('1.0');
                    setCalcTotalUnit('acre');
                    setCalcSharePortion('0');
                    setCalcPortionUnit('satak');
                  }}
                  className="px-2.5 py-1 text-xs rounded-md text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Statutory West Bengal Conversion Guide Table */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100">1 Acre = 100 Satak</div>
                <div className="text-[10px] text-slate-500">3 Bigha 8 Katha (43,560 sq.ft)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100">1 Bigha = 20 Katha</div>
                <div className="text-[10px] text-slate-500">14,400 sq.ft (33.05 Satak)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100">1 Katha = 16 Chittak</div>
                <div className="text-[10px] text-slate-500">720 sq.ft (1.65 Satak)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100">1 Satak = 435.6 sq.ft</div>
                <div className="text-[10px] text-slate-500">1 Chittak = 45 sq.ft</div>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Result Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-br from-rose-50 via-slate-50 to-amber-50 dark:from-rose-950/30 dark:via-slate-850 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-rose-200/80 dark:border-rose-900/40 mb-3 border-b">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'হিস্যা ও অংশ ফলাফল' : 'Share & Hisya Result'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  {pct}% Share
                </span>
              </div>

              {/* Main 10000 Hisya Display */}
              <div className="text-center py-2">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'পশ্চিমবঙ্গ খতিয়ান দশ হাজারি হিস্যা' : 'WB Khatian 10,000 Share Fraction'}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight my-1">
                  {share10000.toFixed(2)}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal ml-1">
                    / 10,000
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {share10000 > 0 ? (share10000 / 10000).toFixed(4) : '0.0000'} অংশ (Parcha Share Notation)
                </div>
              </div>

              {/* Area Equivalent Breakdown */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 text-xs">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-rose-900/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Satak / Decimal (শতক)</div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {equivalentSatak} Satak
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-rose-900/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Katha / Chittak (কাঠা)</div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {equivalentKatha} Katha
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-rose-900/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Square Feet</div>
                  <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {portionSqft.toLocaleString()} sq.ft
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-rose-900/40">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">অবশিষ্ট হিস্যা (Balance)</div>
                  <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {remaining10000.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ready for Deed / Parcha Draft</span>
              </span>

              <button
                type="button"
                onClick={() => onNavigate('sharecalculator')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Farayez Tree</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                {t.todaysCauseListTitle} ({activeCompany?.causeList?.length || 0})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('causelist')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {t.openFullList} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeCompany?.causeList && activeCompany.causeList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">{t.tableTime}</th>
                    <th className="py-2.5 px-4">{t.tableCaseNo}</th>
                    <th className="py-2.5 px-4">{t.tablePartyForum}</th>
                    <th className="py-2.5 px-4 text-right">{t.tableStatus}</th>
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
              {t.noHearingsScheduled}
            </div>
          )}
        </div>

        {/* Upcoming Hearing Dates & Limitation Alerts (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{t.upcomingHearingsTitle}</span>
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
                  {t.noUpcomingHearings}
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-3 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('sharecalculator')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" /> {t.shareCalculatorBtn}
            </button>
            <button
              onClick={() => onNavigate('aistudio')}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5" /> {t.aiStudioBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
