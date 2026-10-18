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
  ArrowRight,
  Clock,
  Gavel,
  FileSearch,
  Users,
  Archive,
  BookOpen,
  MessageSquare,
  BookMarked,
  UserCheck,
  MapPin,
  ChevronRight,
  Download,
  Printer,
  HardDrive,
  AlertTriangle,
  ShieldAlert,
  X,
  Scroll,
  FileSpreadsheet
} from 'lucide-react';
import { CaseType, CaseItem, getStatusTrackingInfo, getBackupStatus } from '../types';

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
  onOpenSettings
}) => {
  const { activeCompany, activeUser, language, t, showToast } = useApp();
  const backupStatus = getBackupStatus(activeCompany);

  const nowDate = new Date();
  const todayDateStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
  const dailyBackupReminderKey = 'srk_daily_dashboard_backup_reminder_date';

  // Show Data Backup Reminder strictly ONE TIME ONLY per calendar day in Dashboard
  const [showDailyBackupReminder, setShowDailyBackupReminder] = React.useState<boolean>(() => {
    try {
      const alreadyShownDate = localStorage.getItem(dailyBackupReminderKey);
      return alreadyShownDate !== todayDateStr;
    } catch {
      return false;
    }
  });

  const dismissDailyBackupReminder = React.useCallback(() => {
    try {
      localStorage.setItem(dailyBackupReminderKey, todayDateStr);
    } catch {
      // ignore storage errors
    }
    setShowDailyBackupReminder(false);
  }, [dailyBackupReminderKey, todayDateStr]);

  React.useEffect(() => {
    if (backupStatus.isOverdue && showDailyBackupReminder) {
      try {
        // Immediately mark today's reminder as shown so navigating back or reloading today never shows it a second time
        localStorage.setItem(dailyBackupReminderKey, todayDateStr);
      } catch {
        // ignore storage errors
      }
      // Automatically hide after 10 seconds if not manually dismissed so it doesn't stay on Dashboard all day
      const timer = window.setTimeout(() => {
        setShowDailyBackupReminder(false);
      }, 10000);
      return () => window.clearTimeout(timer);
    }
  }, [backupStatus.isOverdue, showDailyBackupReminder, dailyBackupReminderKey, todayDateStr]);

  const totalCases = activeCompany?.cases?.length || 0;
  const todayHearings = activeCompany?.causeList?.length || 0;
  const pendingCases =
    activeCompany?.cases?.filter(
      c => !['Disposed', 'Allowed', 'Dismissed', 'Rejected', 'Order Passed'].includes(c.status)
    ).length || 0;
  const vaultFiles = activeCompany?.vaultFiles?.length || 0;

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases?.filter(c => c.type === type).length || 0;
  };

  // Active cases for tracking: prioritize cases with nextDate, then recent cases
  const trackedCases = [...(activeCompany?.cases || [])]
    .sort((a, b) => {
      if (a.nextDate && b.nextDate) {
        return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
      }
      if (a.nextDate) return -1;
      if (b.nextDate) return 1;
      return 0;
    })
    .slice(0, 4);

  const printHtmlContent = (htmlContent: string) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }, 300);
      }
    } catch {
      window.print();
    }
  };

  const exportTrackedCasesCSV = () => {
    const listToExport = activeCompany?.cases || [];
    if (listToExport.length === 0) {
      showToast('No cases recorded in chamber yet.', 'info');
      return;
    }

    const headers = [
      'Case No',
      'Module Type',
      'Status Category',
      'Stage / Status',
      'Sub-Type',
      'Petitioner',
      'Opposite Party',
      'Forum',
      'Mouza',
      'Dag',
      'Khatian',
      'Filing Date',
      'Next Hearing Date'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map(c => {
      const statusInfo = getStatusTrackingInfo(c.status);
      const s0 = c.landSchedules?.[0];
      return [
        escapeCsv(c.caseNo),
        escapeCsv(c.type.toUpperCase()),
        escapeCsv(statusInfo.category),
        escapeCsv(c.status),
        escapeCsv(c.subType),
        escapeCsv(c.party),
        escapeCsv(c.opp || ''),
        escapeCsv(c.forum || ''),
        escapeCsv(s0?.mouza || ''),
        escapeCsv(s0?.dag || ''),
        escapeCsv(s0?.khatian || ''),
        escapeCsv(c.filingDate || ''),
        escapeCsv(c.nextDate || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `chamber_cases_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTrackedCasesPDF = () => {
    const listToExport = activeCompany?.cases || [];
    if (listToExport.length === 0) {
      showToast('No cases recorded in chamber yet.', 'info');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeCompany?.name || 'Legal Chamber'} — Active Cases Registry Report</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 20px; font-size: 11px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { margin: 0 0 4px 0; font-size: 18px; color: #1e3a8a; }
            .subtitle { font-size: 13px; color: #475569; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; font-weight: 700; color: #0f172a; text-transform: uppercase; font-size: 9.5px; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; text-transform: uppercase; }
            .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .badge-progress { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
            .badge-disposed { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${activeCompany?.name || 'Legal Chamber'}</h1>
              <div class="subtitle">Complete Active Cases Registry & Hearing Status Report</div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <div>Chamber: ${activeCompany?.city || 'Kolkata'}, WB</div>
              <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Case No</th>
                <th>Module</th>
                <th>Sub-Type</th>
                <th>Petitioner / Party</th>
                <th>Opposite Party</th>
                <th>Forum</th>
                <th>Next Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${listToExport
                .map((c, idx) => {
                  const statusInfo = getStatusTrackingInfo(c.status);
                  const badgeClass =
                    statusInfo.category === 'Pending'
                      ? 'badge-pending'
                      : statusInfo.category === 'In Progress'
                      ? 'badge-progress'
                      : 'badge-disposed';

                  return `<tr>
                    <td style="color: #64748b; font-family: monospace; font-size: 10px;">${idx + 1}</td>
                    <td><strong>${c.caseNo}</strong></td>
                    <td style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #2563eb;">${c.type}</td>
                    <td>${c.subType}</td>
                    <td><strong>${c.party}</strong></td>
                    <td>${c.opp || '—'}</td>
                    <td>${c.forum || '—'}</td>
                    <td style="font-weight: 600; color: #1e40af;">${c.nextDate || '—'}</td>
                    <td>
                      <span class="badge ${badgeClass}">${statusInfo.category}: ${c.status}</span>
                    </td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <span>SRK Case Manager · Confidential Legal Chamber Record</span>
            <span>Total Cases: ${listToExport.length}</span>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  const landCaseCards: {
    type: CaseType;
    page: NavPage;
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    borderHover: string;
  }[] = [
    {
      type: 'mutation',
      page: 'case-mutation',
      title: t.mutationCase,
      desc: t.mutationDesc,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      borderHover: 'hover:border-blue-500'
    },
    {
      type: 'misc',
      page: 'case-misc',
      title: t.miscCase,
      desc: t.miscDesc,
      icon: FolderGit2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      borderHover: 'hover:border-purple-500'
    },
    {
      type: 'lrappeal',
      page: 'case-lrappeal',
      title: t.lrAppeal,
      desc: t.lrAppealDesc,
      icon: Send,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderHover: 'hover:border-emerald-500'
    },
    {
      type: 'firstappeal',
      page: 'case-firstappeal',
      title: t.firstAppeal,
      desc: t.firstAppealDesc,
      icon: Gavel,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      borderHover: 'hover:border-indigo-500'
    },
    {
      type: 'rti',
      page: 'case-rti',
      title: t.rtiMatter,
      desc: t.rtiDesc,
      icon: FileSearch,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      borderHover: 'hover:border-teal-500'
    },
    {
      type: 'lrtt',
      page: 'case-lrtt',
      title: t.lrttTribunal,
      desc: t.lrttDesc,
      icon: Building,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      borderHover: 'hover:border-cyan-500'
    },
    {
      type: 'conversion',
      page: 'case-conversion',
      title: t.conversionCase,
      desc: t.conversionDesc,
      icon: RefreshCw,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      borderHover: 'hover:border-amber-500'
    },
    {
      type: 'certcopy',
      page: 'case-certcopy',
      title: t.certCopyCase,
      desc: t.certCopyDesc,
      icon: Scroll,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      borderHover: 'hover:border-rose-500'
    },
    {
      type: 'rorpi',
      page: 'case-rorpi',
      title: t.rorPiCase,
      desc: t.rorPiDesc,
      icon: FileSpreadsheet,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      borderHover: 'hover:border-orange-500'
    }
  ];

  const toolCards: {
    page: NavPage;
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    badge?: string | number;
    onClick?: () => void;
  }[] = [
    {
      page: 'causelist',
      title: t.dailyCauseList,
      desc: t.causeListDesc,
      icon: Calendar,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      badge: todayHearings
    },
    {
      page: 'sharecalculator',
      title: t.shareCalc,
      desc: t.shareCalcDesc,
      icon: Calculator,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badge: 'Share'
    },
    {
      page: 'aistudio',
      title: t.aiLegalDrafting,
      desc: t.aiDraftingDesc,
      icon: Brain,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/60',
      badge: 'AI'
    },
    {
      page: 'timeline',
      title: t.caseDiary,
      desc: t.diaryDesc,
      icon: BookMarked,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60'
    },
    {
      page: 'parties',
      title: t.clientRegistry,
      desc: t.clientDesc,
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/60',
      badge: activeCompany?.parties?.length || 0
    },
    {
      page: 'wblract',
      title: t.statutoryWblr,
      desc: t.statutoryDesc,
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      page: 'messages',
      title: t.clientMessaging,
      desc: t.messageDesc,
      icon: MessageSquare,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/60'
    },
    {
      page: 'users',
      title: t.advocateTeam,
      desc: t.teamDesc,
      icon: UserCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      badge: activeCompany?.users?.length || 1
    },
    {
      page: 'vault',
      title: t.documentVault,
      desc: t.vaultDesc,
      icon: Archive,
      color: 'text-slate-700 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
      badge: vaultFiles,
      onClick: () => (onOpenSettings ? onOpenSettings('vault') : onNavigate('vault'))
    }
  ];

  return (
    <div className="space-y-6">
      {/* Visual Data Backup Reminder Banner: displayed strictly ONE TIME ONLY in a day on Dashboard */}
      {backupStatus.isOverdue && showDailyBackupReminder && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold flex items-center gap-2 flex-wrap">
                <span>
                  {language === 'bn'
                    ? `দৈনিক ব্যাকআপ রিমাইন্ডার: ${backupStatus.daysSinceBackup} দিন ধরে কোনো ম্যানুয়াল ব্যাকআপ নেওয়া হয়নি`
                    : `Data Backup Reminder: No manual backup performed in ${backupStatus.daysSinceBackup} days`}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded font-bold">
                  {language === 'bn' ? 'দিনে ১ বার' : 'Once a Day'}
                </span>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 truncate mt-0.5">
                {language === 'bn'
                  ? 'আপনার কেস, শুনানি এবং মক্কেল তথ্য নিরাপদ রাখতে একটি সম্পূর্ণ JSON ব্যাকআপ সংরক্ষণ করুন।'
                  : 'Protect your case files, hearings, and client records by downloading a manual JSON backup.'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                dismissDailyBackupReminder();
                if (onOpenSettings) {
                  onOpenSettings('backup');
                } else {
                  onNavigate('vault');
                }
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ব্যাকআপ খুলুন' : 'Open Backup Modal'}</span>
            </button>
            <button
              type="button"
              onClick={dismissDailyBackupReminder}
              className="p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-200/60 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="Dismiss daily backup reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Row: 4 Compact KPI Summary Stat Cards (2x Smaller) — Total Cases, Today's Hearings, Active Pending, Vault Files */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div
          onClick={() => onNavigate('case-mutation')}
          className="bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-blue-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group"
          title="Click to browse all registered cases"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
            <span className="truncate">{t.totalCases}</span>
            <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200/70 dark:border-blue-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Gavel className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {totalCases}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            Mutation ({getCaseCount('mutation')}) • Misc ({getCaseCount('misc')}) • Appeal ({getCaseCount('lrappeal')})
          </div>
        </div>

        <div
          onClick={() => onNavigate('causelist')}
          className="bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-amber-500 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group"
          title="Click to view Today's Cause List"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
            <span className="truncate">{t.todaysHearings}</span>
            <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200/70 dark:border-amber-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Calendar className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {todayHearings}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            {(activeCompany?.causeList?.filter(i => i.status === 'READY').length || 0)} Ready • {Math.max(0, todayHearings - (activeCompany?.causeList?.filter(i => i.status === 'READY').length || 0))} Hearing
          </div>
        </div>

        <div
          onClick={() => onNavigate('case-misc')}
          className="bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-purple-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group"
          title="Click to view Active Pending cases"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
            <span className="truncate">{t.pendingCases}</span>
            <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {pendingCases}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            Requires follow-up &amp; dates
          </div>
        </div>

        <div
          onClick={() => (onOpenSettings ? onOpenSettings('vault') : onNavigate('vault'))}
          className="bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-emerald-500 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group"
          title="Open Document Vault"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
            <span className="truncate">{t.vaultFilesTitle}</span>
            <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Archive className="w-3 h-3 text-emerald-500" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
            {vaultFiles}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            Saved deeds, orders &amp; ROR
          </div>
        </div>
      </div>

      {/* 1. Land Case Modules (ভূমি মামলার বিভাগসমূহ) — Matching Image 4 Layout with 3D Visuals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
            {t.landCaseModulesTitle}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t.clickModuleSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {landCaseCards.map(card => {
            const Icon = card.icon;
            const count = getCaseCount(card.type);
            return (
              <div
                key={card.type}
                onClick={() => onNavigate(card.page)}
                className={`p-3.5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 ${card.borderHover} shadow-[0_8px_18px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.45)] hover:-translate-y-1 hover:shadow-[0_14px_24px_rgba(37,99,235,0.15)] active:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between gap-2.5`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shadow-[0_4px_10px_rgba(15,23,42,0.12),inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 group-hover:scale-105 transition-transform shrink-0`}
                  >
                    <Icon className="w-5 h-5 drop-shadow-2xs stroke-[2.2]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onOpenNewCase(card.type);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/80 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 transition-colors cursor-pointer"
                      title={`Create new ${card.title}`}
                    >
                      + New
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {card.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {card.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tools & Library — Same Clean 3D Card Visual Style */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
            {t.toolsLibrary} ({language === 'bn' ? 'চেম্বার টুলস ও লাইব্রেরি' : 'Chamber Utilities & AI Studio'})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn' ? 'টুল খুলতে কার্ডে ক্লিক করুন' : 'Click card to open tool or studio'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {toolCards.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.page}
                onClick={() => (tool.onClick ? tool.onClick() : onNavigate(tool.page))}
                className="p-3.5 rounded-xl bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 hover:border-blue-500 shadow-[0_8px_18px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.45)] hover:-translate-y-1 hover:shadow-[0_14px_24px_rgba(37,99,235,0.15)] active:translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`w-10 h-10 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center shadow-[0_4px_10px_rgba(15,23,42,0.12),inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 group-hover:scale-105 transition-transform shrink-0`}
                  >
                    <Icon className="w-5 h-5 drop-shadow-2xs stroke-[2.2]" />
                  </div>
                  {tool.badge !== undefined && (
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {tool.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {tool.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Today's Cause List + Active Case Tracker — Matching Image 4 with 3D Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Today's Cause List Preview (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 rounded-xl border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {t.todaysCauseListTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('causelist')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t.openFullList}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeCompany?.causeList && activeCompany.causeList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
                        <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.time}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap text-xs">
                          {item.caseNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                            {item.party}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                            {item.forum} {item.benchRoom ? `(${item.benchRoom})` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs ${
                              item.status === 'READY'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : item.status === 'DISPOSED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-850/20 flex items-center justify-between">
            <span>West Bengal Revenue Cause List</span>
            <button
              onClick={() => onNavigate('causelist')}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Add Hearing to Today's List
            </button>
          </div>
        </div>

        {/* Right: Active Case Tracker & Quick Tools (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 rounded-xl border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{t.upcomingHearingsTitle}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={exportTrackedCasesCSV}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                  title="Export cases to CSV spreadsheet"
                >
                  <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportTrackedCasesPDF}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors shadow-2xs cursor-pointer"
                  title="Print active case list or Save as PDF"
                >
                  <Printer className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {trackedCases.map(c => {
                const statusInfo = getStatusTrackingInfo(c.status);

                return (
                  <div
                    key={c.id}
                    onClick={() => onViewCaseDetail(c.id)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 border-b-slate-300 dark:border-b-slate-950 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-700 dark:text-blue-400">
                          {c.caseNo || c.docketNo || 'RTI Application'}
                        </span>
                        <span className="text-[10px] text-slate-400">· {c.subType}</span>
                      </div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate mt-0.5">
                        {c.party} {c.opp ? `vs ${c.opp}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                        <span>{c.forum || 'Revenue Forum'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      {c.nextDate && (
                        <div className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {c.nextDate}
                        </div>
                      )}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                          <span>{c.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {trackedCases.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  {t.noUpcomingHearings}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Track all mutation, misc &amp; appeal files</span>
            <button
              onClick={() => onNavigate('case-mutation')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 text-xs cursor-pointer"
            >
              <span>View All Cases</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
