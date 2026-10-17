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
  X
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
  onViewCaseDetail,
  onOpenSettings
}) => {
  const { activeCompany, language, t, showToast } = useApp();
  const [backupDismissed, setBackupDismissed] = React.useState(false);
  const backupStatus = getBackupStatus(activeCompany);

  const todayHearings = activeCompany?.causeList?.length || 0;
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

  return (
    <div className="space-y-4">
      {/* Visual Backup Reminder Banner: if manual backup is overdue > 7 days */}
      {backupStatus.isOverdue && !backupDismissed && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold flex items-center gap-2">
                <span>
                  {language === 'bn'
                    ? `সতর্কতা: চেম্বার তথ্যের কোনো ম্যানুয়াল ব্যাকআপ ${backupStatus.daysSinceBackup} দিন ধরে নেওয়া হয়নি`
                    : `Data Backup Reminder: No manual backup performed in ${backupStatus.daysSinceBackup} days`}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded font-bold">
                  {language === 'bn' ? 'সতর্কতা' : 'Overdue'}
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
              onClick={() => (onOpenSettings ? onOpenSettings('backup') : onNavigate('vault'))}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ব্যাকআপ খুলুন' : 'Open Backup Modal'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBackupDismissed(true)}
              className="p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-200/60 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="Dismiss reminder for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Group 1: Revenue & Land Case Portfolios (7 Iconic Tiles Only — First Appeal & RTI Included) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {language === 'bn' ? 'রাজস্ব ও ভূমি কেস মডিউল' : 'Revenue & Land Case Portfolios'}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              ({language === 'bn' ? '৭টি কেস পোর্টফোলিও' : '7 Legal Case Modules'})
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {language === 'bn' ? 'যেকোনো মডিউলে ক্লিক করে কেস পরিচালনা করুন' : 'Click any module to open register'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* 1. Mutation Case */}
          <div
            onClick={() => onNavigate('case-mutation')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                {getCaseCount('mutation')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'মিউটেশন কেস' : 'Mutation Case'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'bn' ? 'নামজারি (ধারা ৫০)' : 'Sec 50 WBLR'}
              </div>
            </div>
          </div>

          {/* 2. Misc Case */}
          <div
            onClick={() => onNavigate('case-misc')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                {getCaseCount('misc')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'মিস কেস' : 'Misc Case'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'bn' ? '১০০০০ হিস্যা (৫০এ)' : '10000 Share (50A)'}
              </div>
            </div>
          </div>

          {/* 3. LR Appeal */}
          <div
            onClick={() => onNavigate('case-lrappeal')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                {getCaseCount('lrappeal')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'এল.আর. আপিল' : 'LR Appeal'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'bn' ? 'ধারা ৫৪ আপিল' : 'Sec 54 Appeal'}
              </div>
            </div>
          </div>

          {/* 4. First Appeal (Iconic menu tile only — big descriptive banner removed) */}
          <div
            onClick={() => onNavigate('case-firstappeal')}
            className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gavel className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                {getCaseCount('firstappeal')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? '১ম আপিল' : 'First Appeal'}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate mt-0.5 font-medium">
                {language === 'bn' ? 'বিধিবদ্ধ প্রথম আপিল' : 'Statutory 1st Appeal'}
              </div>
            </div>
          </div>

          {/* 5. RTI Matter (Iconic menu tile only — big descriptive banner removed) */}
          <div
            onClick={() => onNavigate('case-rti')}
            className="p-3 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-white dark:bg-slate-900 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSearch className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded">
                {getCaseCount('rti')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'তথ্য অধিকার (RTI)' : 'RTI Matter'}
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 truncate mt-0.5 font-medium">
                {language === 'bn' ? 'ধারা ৬(১) ও ১৯(১)' : 'Sec 6(1) & 19(1)'}
              </div>
            </div>
          </div>

          {/* 6. WBLRTT Tribunal */}
          <div
            onClick={() => onNavigate('case-lrtt')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded">
                {getCaseCount('lrtt')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'ভূমি ট্রাইব্যুনাল' : 'WBLRTT'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'bn' ? 'সল্টলেক ও.এ.' : 'Tribunal O.A.'}
              </div>
            </div>
          </div>

          {/* 7. Conversion 4C */}
          <div
            onClick={() => onNavigate('case-conversion')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                {getCaseCount('conversion')}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'কনভার্সন' : 'Conversion'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {language === 'bn' ? 'বাস্তু রূপান্তর (৪সি)' : 'Sec 4C Bastu'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Group 2: Chamber Practice Workspaces & Legal Utilities (9 Menus — Accommodate All Menus in Single Screen) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {language === 'bn' ? 'চেম্বার প্র্যাকটিস টুলস ও ওয়ার্কস্পেস' : 'Chamber Practice Workspaces & Tools'}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              ({language === 'bn' ? '৯টি টুলস ও রেজিস্ট্রি' : '9 Legal Utilities & Workspaces'})
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {language === 'bn' ? 'সকল টুলস এক স্ক্রিনে সজ্জিত' : 'All workspaces accessible in 1 click'}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {/* 1. AI Legal Studio */}
          <div
            onClick={() => onNavigate('aistudio')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-1 py-0.2 rounded">
                AI
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'এআই স্টুডিও' : 'AI Studio'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'ড্রাফট ও লার্নিং' : 'Smart Drafts'}
              </div>
            </div>
          </div>

          {/* 2. 10,000 Share Calculator */}
          <div
            onClick={() => onNavigate('sharecalculator')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.2 rounded">
                10k
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'হিস্যা ক্যালক' : 'Share Calc'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? '১০০০০ অংশ ও শতক' : '10,000 Hisya'}
              </div>
            </div>
          </div>

          {/* 3. Daily Cause List */}
          <div
            onClick={() => onNavigate('causelist')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1 py-0.2 rounded">
                {todayHearings}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'কজ লিস্ট' : 'Cause List'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'দৈনিক শুনানি তালিকা' : 'Daily Hearings'}
              </div>
            </div>
          </div>

          {/* 4. Case Diary */}
          <div
            onClick={() => onNavigate('timeline')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookMarked className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-1 py-0.2 rounded">
                Notes
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'কেস ডায়েরি' : 'Case Diary'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'অর্ডার ও শুনানি নোট' : 'Court Orders'}
              </div>
            </div>
          </div>

          {/* 5. Party Directory */}
          <div
            onClick={() => onNavigate('parties')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1 py-0.2 rounded">
                {activeCompany?.parties?.length || 0}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'পক্ষ রেজিস্ট্রি' : 'Parties'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'মক্কেল ও বিপক্ষ' : 'Clients & Ops'}
              </div>
            </div>
          </div>

          {/* 6. Statutory Library */}
          <div
            onClick={() => onNavigate('wblract')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded">
                WBLR
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'আইন লাইব্রেরি' : 'Law Acts'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? '১৯৫৫ অ্যাক্ট ও রুলস' : 'Act & Manual'}
              </div>
            </div>
          </div>

          {/* 7. Client Communication */}
          <div
            onClick={() => onNavigate('messages')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-1 py-0.2 rounded">
                Chat
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'ক্লায়েন্ট মেসেজ' : 'Notices'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'হোয়াটসঅ্যাপ ও এসএমএস' : 'WhatsApp Alerts'}
              </div>
            </div>
          </div>

          {/* 8. Chamber Team & Roles */}
          <div
            onClick={() => onNavigate('users')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1 py-0.2 rounded">
                {activeCompany?.users?.length || 1}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'টিম ও রোলস' : 'Team Roles'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'অ্যাডভোকেট ও ক্লার্ক' : 'Staff & Access'}
              </div>
            </div>
          </div>

          {/* 9. Document Vault */}
          <div
            onClick={() => (onOpenSettings ? onOpenSettings('vault') : onNavigate('vault'))}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Archive className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1 py-0.2 rounded">
                {vaultFiles}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? 'ডকুমেন্ট ভল্ট' : 'Vault'}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {language === 'bn' ? 'দলিল ও ড্রাফট নমুনা' : 'Samples & Files'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Chamber Pulse: Today's Cause List + Active Case Cards with Visual Status Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Today's Cause List Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {t.todaysCauseListTitle} ({todayHearings})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('causelist')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t.openFullList}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeCompany?.causeList && activeCompany.causeList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2 px-3">{t.tableTime}</th>
                      <th className="py-2 px-3">{t.tableCaseNo}</th>
                      <th className="py-2 px-3">{t.tablePartyForum}</th>
                      <th className="py-2 px-3 text-right">{t.tableStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeCompany.causeList.slice(0, 4).map(item => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.time}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap text-xs">
                          {item.caseNo}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                            {item.party}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {item.forum} {item.benchRoom ? `(${item.benchRoom})` : ''}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
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
              <div className="p-6 text-center text-slate-500 text-xs">
                {t.noHearingsScheduled}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-850/20 flex items-center justify-between">
            <span>West Bengal Revenue Cause List</span>
            <button
              onClick={() => onNavigate('causelist')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Add Hearing to Today's List
            </button>
          </div>
        </div>

        {/* Right: Active Case Cards with Visual Color-Coded Status Badges (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Active Case Tracker</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={exportTrackedCasesCSV}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                  title="Export cases to CSV spreadsheet"
                >
                  <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportTrackedCasesPDF}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors shadow-2xs cursor-pointer"
                  title="Print active case list or Save as PDF"
                >
                  <Printer className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Case Cards with Color-Coded Status Badges */}
            <div className="space-y-2">
              {trackedCases.map(c => {
                const statusInfo = getStatusTrackingInfo(c.status);

                return (
                  <div
                    key={c.id}
                    onClick={() => onViewCaseDetail(c.id)}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-700 dark:text-blue-400">
                          {c.caseNo}
                        </span>
                        <span className="text-[10px] text-slate-400">· {c.subType}</span>
                      </div>
                      <div className="text-[11px] text-slate-800 dark:text-slate-200 font-semibold truncate mt-0.5">
                        {c.party} {c.opp ? `vs ${c.opp}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                        <span>{c.forum || 'Revenue Forum'}</span>
                        {c.nextDate && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                              {c.nextDate}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Color-Coded Status Badge */}
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.badgeClass}`}
                        title={`Status: ${statusInfo.label} (${statusInfo.category})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        <span>{statusInfo.category}</span>
                      </span>
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

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[10px]">Track all mutation, misc & appeal files</span>
            <button
              onClick={() => onNavigate('case-mutation')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
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
