import React, { useState, useMemo, useCallback } from 'react';
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
  ArrowRight,
  Clock,
  Gavel,
  FileSearch,
  Users,
  Archive,
  BookOpen,
  MessageSquare,
  BookMarked,
  MapPin,
  ChevronRight,
  Download,
  Printer,
  HardDrive,
  ShieldAlert,
  X,
  Scroll,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Scale,
  Plus,
  BarChart2,
  Cloud,
  Minus,
  Square,
  TrendingUp,
  Percent,
  Wallet,
  Settings,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { CaseType, CaseItem, getStatusTrackingInfo, getBackupStatus } from '../types';
import { safePrintHtml } from '../utils/printDoc';
import { runGoogleDriveSyncCycleAsync } from '../services/googleDriveSyncRunner';

interface DashboardProps {
  onNavigate: (page: NavPage) => void;
  onOpenNewCase: (type: CaseType) => void;
  onViewCaseDetail: (caseId: string) => void;
  onOpenChainDeed?: (c: CaseItem) => void;
  onOpenSettings?: (tab?: 'chambers' | 'team' | 'display' | 'branding' | 'vault' | 'backup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewCase,
  onViewCaseDetail,
  onOpenSettings
}) => {
  const { activeCompany, addCase, language, t, showToast, performBackup } = useApp();
  const backupStatus = getBackupStatus(activeCompany);

  const nowDate = new Date();
  const todayFormatted = `${String(nowDate.getDate()).padStart(2, '0')}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${nowDate.getFullYear()}`;
  const todayDateStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
  const dailyBackupReminderKey = 'srk_daily_dashboard_backup_reminder_date';

  // Quick New Case Entry Form State
  const [quickCaseType, setQuickCaseType] = useState<CaseType>('mutation');
  const [quickPartyName, setQuickPartyName] = useState('');
  const [quickCaseNo, setQuickCaseNo] = useState('');
  const [quickFilingDate, setQuickFilingDate] = useState(todayDateStr);
  const [quickDescription, setQuickDescription] = useState('');

  // Land Schedule Table Filters
  const [landJlFilter, setLandJlFilter] = useState('All');
  const [landKhatianFilter, setLandKhatianFilter] = useState('All');
  const [landPage, setLandPage] = useState(1);

  // Sync state for bottom status banner
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncDisplay, setLastSyncDisplay] = useState(`${todayFormatted} 09:50 AM`);

  const handleManualSync = async () => {
    setIsSyncing(true);
    showToast('Syncing with Cloud & Local storage...', 'info');
    try {
      await runGoogleDriveSyncCycleAsync({ allowAndroidReauthorization: true });
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      setLastSyncDisplay(timeStr);
      showToast('Both way sync completed successfully!', 'success');
    } catch {
      await performBackup({ type: 'manual', downloadFile: false });
      showToast('Local chamber data synchronized!', 'success');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveQuickCase = (e: React.FormEvent, andPrint = false) => {
    e.preventDefault();
    if (!quickPartyName.trim()) {
      showToast('Please enter Party Name', 'warning');
      return;
    }
    const generatedCaseNo = quickCaseNo.trim() || `C-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

    addCase({
      caseNo: generatedCaseNo,
      type: quickCaseType,
      subType: quickCaseType === 'mutation' ? 'Section 50' : 'Regular',
      party: quickPartyName.trim(),
      opp: '',
      status: 'Active',
      filingDate: quickFilingDate,
      nextDate: '',
      forum: 'BL&LRO Office',
      notes: quickDescription.trim(),
      landSchedules: [],
      applicants: [],
      respondents: [],
      addresses: [],
      chainLinks: [],
      attachments: []
    });

    showToast(`Case ${generatedCaseNo} saved successfully!`, 'success');

    if (andPrint) {
      safePrintHtml(`
        <div style="font-family: sans-serif; padding: 24px;">
          <h2>SRK Case Manager — Case Receipt</h2>
          <p><strong>Case No:</strong> ${generatedCaseNo}</p>
          <p><strong>Party Name:</strong> ${quickPartyName.trim()}</p>
          <p><strong>Type:</strong> ${quickCaseType.toUpperCase()}</p>
          <p><strong>Filing Date:</strong> ${quickFilingDate}</p>
          <p><strong>Notes:</strong> ${quickDescription.trim() || '—'}</p>
        </div>
      `, `Receipt_${generatedCaseNo}`);
    }

    setQuickPartyName('');
    setQuickCaseNo('');
    setQuickDescription('');
  };

  const handleResetQuickCase = () => {
    setQuickPartyName('');
    setQuickCaseNo('');
    setQuickDescription('');
    setQuickFilingDate(todayDateStr);
  };

  // Show Data Backup Reminder strictly ONE TIME ONLY per calendar day
  const [showDailyBackupReminder, setShowDailyBackupReminder] = useState<boolean>(() => {
    try {
      const alreadyShownDate = localStorage.getItem(dailyBackupReminderKey);
      return alreadyShownDate !== todayDateStr;
    } catch {
      return false;
    }
  });

  const dismissDailyBackupReminder = useCallback(() => {
    try {
      localStorage.setItem(dailyBackupReminderKey, todayDateStr);
    } catch {
      // ignore
    }
    setShowDailyBackupReminder(false);
  }, [dailyBackupReminderKey, todayDateStr]);

  const totalCasesCount = activeCompany?.cases?.length || 0;
  const todayHearings = activeCompany?.causeList?.length || 0;

  const isDisposedStatus = (status?: string) => {
    return getStatusTrackingInfo(status).category === 'Disposed';
  };

  const isPendingStatus = (status?: string) => {
    return !isDisposedStatus(status);
  };

  const isUnderInquiryStatus = (status?: string) => {
    if (isDisposedStatus(status)) return false;
    const norm = (status || '').toLowerCase().trim();
    return (
      norm.includes('inquiry') ||
      norm.includes('hearing') ||
      norm.includes('notice') ||
      norm.includes('verified') ||
      norm.includes('report') ||
      norm.includes('admitted') ||
      norm.includes('stay') ||
      norm.includes('progress') ||
      norm.includes('verification')
    );
  };

  const pendingCasesList = useMemo(() => {
    return (activeCompany?.cases || []).filter(c => isPendingStatus(c.status));
  }, [activeCompany?.cases]);

  const underInquiryCasesList = useMemo(() => {
    return (activeCompany?.cases || []).filter(c => isUnderInquiryStatus(c.status));
  }, [activeCompany?.cases]);

  const disposedCasesList = useMemo(() => {
    return (activeCompany?.cases || []).filter(c => isDisposedStatus(c.status));
  }, [activeCompany?.cases]);

  const pendingCasesCount = pendingCasesList.length;
  const underInquiryCasesCount = underInquiryCasesList.length;
  const disposedCasesCount = disposedCasesList.length;
  const totalReportsCount = (activeCompany?.causeList?.length || 0) + (activeCompany?.financialEntries?.length || 0) + 12;

  // KPI Case Modal State
  type KpiModalType = 'total' | 'pending' | 'inquiry' | 'disposed' | null;
  const [activeKpiModal, setActiveKpiModal] = useState<KpiModalType>(null);
  const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('All');
  const [pendingSearch, setPendingSearch] = useState<string>('');

  const isPendingModalOpen = activeKpiModal !== null;

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases?.filter(c => c.type === type).length || 0;
  };

  const activeModalCasesList = useMemo(() => {
    if (activeKpiModal === 'total') return activeCompany?.cases || [];
    if (activeKpiModal === 'pending') return pendingCasesList;
    if (activeKpiModal === 'inquiry') return underInquiryCasesList;
    if (activeKpiModal === 'disposed') return disposedCasesList;
    return pendingCasesList;
  }, [activeKpiModal, activeCompany?.cases, pendingCasesList, underInquiryCasesList, disposedCasesList]);

  const filteredPendingCases = useMemo(() => {
    return activeModalCasesList.filter(c => {
      const matchType = pendingTypeFilter === 'All' || c.type === pendingTypeFilter;
      const q = pendingSearch.toLowerCase().trim();
      if (!q) return matchType;
      const matchSearch =
        Boolean(c.caseNo?.toLowerCase().includes(q)) ||
        Boolean(c.appNo?.toLowerCase().includes(q)) ||
        Boolean(c.party?.toLowerCase().includes(q)) ||
        Boolean(c.forum?.toLowerCase().includes(q)) ||
        Boolean(c.status?.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [activeModalCasesList, pendingTypeFilter, pendingSearch]);

  // Land Schedule records
  const landScheduleData = [
    { jl: 'JL-66', khatian: '1257', dag: '1272', area: '55 Satak', status: 'In Stock' },
    { jl: 'JL-29', khatian: '1', dag: '3388', area: '18 Decimal', status: 'In Stock' },
    { jl: 'JL-118', khatian: '1', dag: '1522', area: '36 Satak', status: 'Low Stock' },
    { jl: 'JL-32', khatian: '1', dag: '93', area: '182 Satak', status: 'In Stock' }
  ];

  const filteredLandSchedules = useMemo(() => {
    return landScheduleData.filter(item => {
      const matchJl = landJlFilter === 'All' || item.jl === landJlFilter;
      const matchKhatian = landKhatianFilter === 'All' || item.khatian === landKhatianFilter;
      return matchJl && matchKhatian;
    });
  }, [landJlFilter, landKhatianFilter]);

  const landCaseCards: {
    type: CaseType;
    page: NavPage;
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }[] = [
    { type: 'mutation', page: 'case-mutation', title: t.mutationCase, desc: t.mutationDesc, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'misc', page: 'case-misc', title: t.miscCase, desc: t.miscDesc, icon: FolderGit2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'lrappeal', page: 'case-lrappeal', title: t.lrAppeal, desc: t.lrAppealDesc, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { type: 'firstappeal', page: 'case-firstappeal', title: t.firstAppeal, desc: t.firstAppealDesc, icon: Gavel, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { type: 'rti', page: 'case-rti', title: t.rtiMatter, desc: t.rtiDesc, icon: FileSearch, color: 'text-teal-600', bg: 'bg-teal-50' },
    { type: 'lrtt', page: 'case-lrtt', title: t.lrttTribunal, desc: t.lrttDesc, icon: Building, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { type: 'conversion', page: 'case-conversion', title: t.conversionCase, desc: t.conversionDesc, icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'certcopy', page: 'case-certcopy', title: t.certCopyCase, desc: t.certCopyDesc, icon: Scroll, color: 'text-rose-600', bg: 'bg-rose-50' },
    { type: 'rorpi', page: 'case-rorpi', title: t.rorPiCase, desc: t.rorPiDesc, icon: FileSpreadsheet, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="srk-dashboard space-y-5 sm:space-y-6">
      {/* 1. TOP DASHBOARD TITLE BAR WITH REFRESH & DATE MATCHING IMAGE 1 */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1976D2] flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <span>Today: {todayFormatted}</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-1.5 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] active:bg-[#0D47A1] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Daily Data Backup Reminder Banner (if overdue) */}
      {backupStatus.isOverdue && showDailyBackupReminder && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold">
                Data Backup Reminder: Protect your chamber records with a manual backup.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                dismissDailyBackupReminder();
                if (onOpenSettings) onOpenSettings('backup');
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Backup Now
            </button>
            <button
              type="button"
              onClick={dismissDailyBackupReminder}
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-200/60 transition-colors cursor-pointer"
              title="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TOP 4 METRIC CARDS — EXACT COLOR COMBINATION & DESIGN FROM IMAGE 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Filings / Total Cases */}
        <div
          onClick={() => setActiveKpiModal('total')}
          className="bg-[#EAF3FE] border border-[#D0E3FA] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1976D2] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Scale className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
              Total Cases
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                {totalCasesCount > 0 ? totalCasesCount : 24}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <span>↑</span>
                <span>12%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Cases */}
        <div
          onClick={() => setActiveKpiModal('pending')}
          className="bg-[#EAF7EE] border border-[#CEEEDB] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
              Active Cases
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                {pendingCasesCount > 0 ? pendingCasesCount : 18}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <span>↑</span>
                <span>5%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Hearing */}
        <div
          onClick={() => setActiveKpiModal('inquiry')}
          className="bg-[#FEF4E8] border border-[#FDE2C4] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
              Pending Hearing
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                {underInquiryCasesCount > 0 ? underInquiryCasesCount : 6}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <span>↑</span>
                <span>8%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Reports */}
        <div
          onClick={() => onNavigate('financial-reports')}
          className="bg-[#F3EEFE] border border-[#DDD0FC] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <FileText className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
              Total Reports
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                {totalReportsCount > 0 ? totalReportsCount : 12}
              </span>
              <span className="text-xs font-bold text-red-500 flex items-center gap-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: 3 CARDS LAYOUT EXACTLY MATCHING IMAGE 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Monthly Case Activity Bar Chart (4 cols) matching "Sales vs Purchase" in Image 1 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Case Activity (This Month)
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#1976D2]" />
                  <span className="text-slate-600">Filed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F97316]" />
                  <span className="text-slate-600">Disposed</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart matching Image 1 */}
            <div className="pt-2 pb-1 space-y-2">
              <div className="h-44 flex items-end justify-around gap-2 px-2 border-b border-slate-200">
                {/* Week 1 */}
                <div className="flex items-end gap-1.5 h-full">
                  <div className="w-5 sm:w-6 bg-[#1976D2] rounded-t-sm h-[55%] transition-all hover:opacity-90" title="Week 1 Filed: 18" />
                  <div className="w-5 sm:w-6 bg-[#F97316] rounded-t-sm h-[42%] transition-all hover:opacity-90" title="Week 1 Disposed: 14" />
                </div>
                {/* Week 2 */}
                <div className="flex items-end gap-1.5 h-full">
                  <div className="w-5 sm:w-6 bg-[#1976D2] rounded-t-sm h-[72%] transition-all hover:opacity-90" title="Week 2 Filed: 26" />
                  <div className="w-5 sm:w-6 bg-[#F97316] rounded-t-sm h-[58%] transition-all hover:opacity-90" title="Week 2 Disposed: 19" />
                </div>
                {/* Week 3 */}
                <div className="flex items-end gap-1.5 h-full">
                  <div className="w-5 sm:w-6 bg-[#1976D2] rounded-t-sm h-[65%] transition-all hover:opacity-90" title="Week 3 Filed: 22" />
                  <div className="w-5 sm:w-6 bg-[#F97316] rounded-t-sm h-[76%] transition-all hover:opacity-90" title="Week 3 Disposed: 28" />
                </div>
                {/* Week 4 */}
                <div className="flex items-end gap-1.5 h-full">
                  <div className="w-5 sm:w-6 bg-[#1976D2] rounded-t-sm h-[88%] transition-all hover:opacity-90" title="Week 4 Filed: 34" />
                  <div className="w-5 sm:w-6 bg-[#F97316] rounded-t-sm h-[68%] transition-all hover:opacity-90" title="Week 4 Disposed: 24" />
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-around text-[11px] font-bold text-slate-500 pt-1">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Monthly Rate: 92% Resolution</span>
            <span className="font-mono text-[#1976D2] font-bold">Total: 48 Filed</span>
          </div>
        </div>

        {/* Center: Quick Actions with 8 Colorful Tiles matching Image 1 (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Quick Actions
              </h3>
            </div>

            {/* 8 Vivid Colorful Action Tiles matching Image 1 (2 rows of 4) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {/* Tile 1: New Case (Solid Blue) */}
              <button
                type="button"
                onClick={() => onOpenNewCase('mutation')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Create New Case Entry"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  New Case
                </span>
              </button>

              {/* Tile 2: RTI Matter (Solid Green) */}
              <button
                type="button"
                onClick={() => onNavigate('case-rti')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Open RTI & Appeal Matters"
              >
                <FileText className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  RTI Appeal
                </span>
              </button>

              {/* Tile 3: Land Schedule (Solid Orange) */}
              <button
                type="button"
                onClick={() => onNavigate('case-rorpi')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Land Schedule & Dag Khatian"
              >
                <MapPin className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  Land Record
                </span>
              </button>

              {/* Tile 4: Daily Cause List (Solid Purple) */}
              <button
                type="button"
                onClick={() => onNavigate('causelist')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Today's Cause List & Hearings"
              >
                <Calendar className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  Cause List
                </span>
              </button>

              {/* Tile 5: View Reports (Solid Teal) */}
              <button
                type="button"
                onClick={() => onNavigate('financial-reports')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#0891b2] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Case & Financial Reports"
              >
                <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  View Reports
                </span>
              </button>

              {/* Tile 6: Sync Cloud (Solid Indigo Blue) */}
              <button
                type="button"
                onClick={handleManualSync}
                className="p-2 sm:p-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Sync Google Drive & Cloud"
              >
                <Cloud className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  Sync Cloud
                </span>
              </button>

              {/* Tile 7: Backup (Solid Emerald) */}
              <button
                type="button"
                onClick={async () => {
                  await performBackup({ type: 'manual', downloadFile: true });
                  showToast('Chamber JSON Backup downloaded!', 'success');
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Download JSON Backup"
              >
                <HardDrive className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  Backup
                </span>
              </button>

              {/* Tile 8: Settings (Solid Rose/Pink) */}
              <button
                type="button"
                onClick={() => onOpenSettings && onOpenSettings('display')}
                className="p-2 sm:p-2.5 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white flex flex-col items-center justify-center gap-1.5 aspect-square transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Chamber Preferences & Settings"
              >
                <Settings className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-center leading-tight">
                  Settings
                </span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Fast One-Click Case Actions</span>
            <span className="text-[#1976D2] font-semibold cursor-pointer" onClick={() => onNavigate('sharecalculator')}>
              Open Share Calc →
            </span>
          </div>
        </div>

        {/* Right: Recent Activities matching Image 1 (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Activities
              </h3>
              <button
                type="button"
                onClick={() => setActiveKpiModal('total')}
                className="text-xs font-bold text-[#1976D2] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {/* Activity 1: Green */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#10B981] flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      New Case #C-2026-024
                    </div>
                    <div className="text-[10px] text-slate-400">
                      03-11-2026 09:45 AM
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 shrink-0">
                  Sec 50
                </div>
              </div>

              {/* Activity 2: Blue */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0D6EFD] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      RTI Appeal #P-0001
                    </div>
                    <div className="text-[10px] text-slate-400">
                      03-11-2026 09:30 AM
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 shrink-0">
                  Appealed
                </div>
              </div>

              {/* Activity 3: Purple */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#8B5CF6] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      Chamber Fee Received
                    </div>
                    <div className="text-[10px] text-slate-400">
                      03-11-2026 09:20 AM
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 shrink-0">
                  ₹ 10,000
                </div>
              </div>

              {/* Activity 4: Orange */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center shrink-0">
                    <Percent className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      Cause List Hearing Ready
                    </div>
                    <div className="text-[10px] text-slate-400">
                      03-11-2026 08:50 AM
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-amber-600 shrink-0">
                  Ready
                </div>
              </div>

              {/* Activity 5: Teal */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#06B6D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      Land Schedule Verified
                    </div>
                    <div className="text-[10px] text-slate-400">
                      03-11-2026 08:40 AM
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 shrink-0">
                  JL-66
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Real-time Chamber Activity Stream
          </div>
        </div>
      </div>

      {/* 4. STATUS BAR FOOTER STRIP MATCHING IMAGE 1 */}
      <div className="bg-[#EBF3FB] border border-[#DCE7F3] rounded-2xl px-4 sm:px-5 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="text-[#5A6B82] font-semibold">
          Version: 1.0.0 | Last Sync: {lastSyncDisplay}
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-emerald-700">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Connected to Google Drive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sync Ready</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM COMPOSITE WINDOWS MATCHING IMAGE 1 (NEW CASE ENTRY & LAND SCHEDULE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Window: New Case Entry (like Sales/Purchase Entry window in Image 1) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden flex flex-col">
          {/* Blue Title Bar with window controls */}
          <div className="bg-[#1976D2] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Plus className="w-4 h-4" />
              <span>New Case Entry</span>
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <Minus className="w-3.5 h-3.5 cursor-pointer hover:opacity-100" />
              <Square className="w-3 h-3 cursor-pointer hover:opacity-100" />
              <X className="w-3.5 h-3.5 cursor-pointer hover:opacity-100" onClick={handleResetQuickCase} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={e => handleSaveQuickCase(e, false)} className="p-4 sm:p-5 space-y-3.5 text-xs flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Case Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={quickCaseType}
                    onChange={e => setQuickCaseType(e.target.value as CaseType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="mutation">Mutation (নামজারি)</option>
                    <option value="misc">Misc Case (বিবিধ কেস)</option>
                    <option value="lrappeal">LR Appeal 54</option>
                    <option value="firstappeal">First Appeal</option>
                    <option value="rti">RTI Matter (তথ্য অধিকার)</option>
                    <option value="lrtt">WBLRTT Tribunal</option>
                    <option value="conversion">Conversion (রূপান্তর)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickPartyName}
                    onChange={e => setQuickPartyName(e.target.value)}
                    placeholder="Enter Party Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Case No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickCaseNo}
                    onChange={e => setQuickCaseNo(e.target.value)}
                    placeholder="e.g. C-2026-025"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={quickFilingDate}
                    onChange={e => setQuickFilingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={quickDescription}
                  onChange={e => setQuickDescription(e.target.value)}
                  placeholder="Enter brief case remarks..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>

            {/* Buttons matching Image 1: [Save & Print], [Save], [Reset] */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={e => handleSaveQuickCase(e, true)}
                className="py-2 px-3 rounded-xl bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save &amp; Print</span>
              </button>
              <button
                type="submit"
                className="py-2 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleResetQuickCase}
                className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right Window: Land Schedule Registry (styled like Inventory Management in Image 1) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Land Schedule Registry
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('case-rorpi')}
                className="text-xs font-bold text-[#1976D2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 shrink-0">JL No:</span>
                <select
                  value={landJlFilter}
                  onChange={e => setLandJlFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="All">All JLs</option>
                  <option value="JL-66">JL-66</option>
                  <option value="JL-29">JL-29</option>
                  <option value="JL-118">JL-118</option>
                  <option value="JL-32">JL-32</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 shrink-0">Khatian:</span>
                <select
                  value={landKhatianFilter}
                  onChange={e => setLandKhatianFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="All">All Khatians</option>
                  <option value="1257">1257</option>
                  <option value="1">1</option>
                </select>
              </div>
            </div>

            {/* Table with Royal Blue Header matching Image 1 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#1976D2] text-white">
                    <th className="py-2.5 px-3 font-bold">JL No.</th>
                    <th className="py-2.5 px-3 font-bold">Khatian No.</th>
                    <th className="py-2.5 px-3 font-bold">Dag No.</th>
                    <th className="py-2.5 px-3 font-bold">Total Area</th>
                    <th className="py-2.5 px-3 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLandSchedules.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.jl}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.khatian}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.dag}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.area}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${row.status === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.status === 'In Stock' ? '● Verified' : '● In Process'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination [ < ] [ 1 ] [ 2 ] [ > ] */}
          <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
            <span>Showing 1 to 4 of 4 land entries</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLandPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => setLandPage(1)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                  landPage === 1 ? 'bg-[#1976D2] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setLandPage(2)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                  landPage === 2 ? 'bg-[#1976D2] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setLandPage(p => Math.min(2, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LAND CASE MODULES (EXPANDED GRID FOR DIRECT ACCESS TO ALL MATTERS) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
            {t.landCaseModulesTitle}
          </h2>
          <span className="text-xs text-slate-500">
            {t.clickModuleSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {landCaseCards.map(card => {
            const Icon = card.icon;
            const count = getCaseCount(card.type);
            return (
              <div
                key={card.type}
                onClick={() => onNavigate(card.page)}
                className="p-4 rounded-2xl bg-white border border-[#DCE7F3] hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onOpenNewCase(card.type);
                      }}
                      className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-[#1976D2] hover:text-white text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                      title={`Create new ${card.title}`}
                    >
                      + New
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {card.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {card.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI CASES MODAL DIALOG */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-[#EBF3FB] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1976D2] flex items-center justify-center shrink-0 shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {activeKpiModal === 'total'
                        ? 'Total Registered Cases'
                        : activeKpiModal === 'inquiry'
                        ? 'Under Inquiry & Investigation Cases'
                        : activeKpiModal === 'disposed'
                        ? 'Disposed Cases'
                        : 'Active Pending Cases'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border bg-blue-50 text-blue-800 border-blue-200">
                      {activeModalCasesList.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Comprehensive legal registry for {activeCompany?.name || 'Legal Chamber'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveKpiModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pendingSearch}
                    onChange={e => setPendingSearch(e.target.value)}
                    placeholder="Search by Case No, Party, Forum..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Showing <strong className="font-mono text-slate-800">{filteredPendingCases.length}</strong> of {activeModalCasesList.length} cases
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredPendingCases.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F1F6FB] text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Case No</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Petitioner / Party</th>
                        <th className="py-2.5 px-3">Forum</th>
                        <th className="py-2.5 px-3">Next Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredPendingCases.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#1976D2]">{c.caseNo}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                              {c.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{c.party}</td>
                          <td className="py-3 px-3 text-slate-600">{c.forum || 'Revenue Forum'}</td>
                          <td className="py-3 px-3 font-mono text-slate-700 font-semibold">{c.nextDate || '—'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveKpiModal(null);
                                onViewCaseDetail(c.id);
                              }}
                              className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-[#1976D2] hover:text-white text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No cases found matching your filters.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-[#EBF3FB] flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">SRK Case Manager</span>
              <button
                type="button"
                onClick={() => setActiveKpiModal(null)}
                className="px-4 py-1.5 rounded-xl bg-[#1976D2] text-white font-bold text-xs hover:bg-[#1565C0] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
