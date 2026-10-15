import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CaseType, CaseItem } from '../types';
import { CompanyLogo } from './CompanyLogo';
import {
  FileText,
  FolderGit2,
  Send,
  Building,
  RefreshCw,
  Plus,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Gavel,
  FileSearch,
  BookOpen,
  Clock,
  CheckCircle2,
  Brain,
  Sparkles,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react';

interface CaseDashboardProps {
  type: CaseType;
  onOpenNewCase: (type: CaseType) => void;
  onViewCaseDetail: (caseId: string) => void;
  onEditCase: (c: CaseItem) => void;
  onOpenChainDeed?: (c: CaseItem) => void;
  onOpenAiDraft?: (type: CaseType, c?: CaseItem) => void;
}

const MODULE_META: Record<
  CaseType,
  {
    title: string;
    bengali: string;
    icon: any;
    color: string;
    bgBadge: string;
    subTypes: string[];
    statuses: string[];
    lawRef: string;
    forum: string;
    limitation: string;
    checklist: string[];
  }
> = {
  mutation: {
    title: 'Mutation Case',
    bengali: 'মিউটেশন কেস (নামজারি ও জমা খারিজ)',
    icon: FileText,
    color: 'text-blue-600',
    bgBadge: 'bg-blue-600',
    subTypes: [
      'Purchase Mutation',
      'Inheritance Mutation',
      'Gift Deed Mutation',
      'Court Decree Mutation'
    ],
    statuses: ['Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Allowed', 'Rejected'],
    lawRef: 'Sec 50 & 50A West Bengal Land Reforms Act 1955',
    forum: 'Block Land & Land Reforms Officer (BL&LRO)',
    limitation: 'Hearing notice within 30 days of registration',
    checklist: [
      'Registered Deed copy (দলিল)',
      'Warishan / Legal Heir Certificate (ওয়ারিশান)',
      'Current ROR / Khatian Parcha (খতিয়ান পর্চা)',
      'Mutation Application Form & Self-Declaration'
    ]
  },
  misc: {
    title: 'Misc Case',
    bengali: 'মিস কেস (রেকর্ড ও হিস্যা সংশোধন)',
    icon: FolderGit2,
    color: 'text-purple-600',
    bgBadge: 'bg-purple-600',
    subTypes: [
      '10000 Share Problem',
      'Record Correction',
      'Name Correction',
      'RS to LR Conveyance',
      'Boundary Dispute',
      'Erroneous Record'
    ],
    statuses: ['Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Disposed'],
    lawRef: 'Sec 50 / 51A WBLR Act & West Bengal Land Reforms Manual',
    forum: 'Revenue Officer / BL&LRO (Section 50/51A Authority)',
    limitation: 'Filing within period of discovery of clerical/share error',
    checklist: [
      '10,000 Share reconciliation statement',
      'RS Khatian & LR Khatian comparative sheet',
      'Trace Map showing plot boundaries',
      'All Co-sharers notice addresses'
    ]
  },
  lrappeal: {
    title: 'LR Appeal (Sec 54)',
    bengali: 'এল.আর. আপিল (জেলা কালেক্টর / ডিএলঅ্যান্ডএলআরও)',
    icon: Send,
    color: 'text-emerald-600',
    bgBadge: 'bg-emerald-600',
    subTypes: ['Section 54 Appeal', 'Section 51A(5) Appeal', 'Delay Condonation'],
    statuses: ['Filed', 'Admitted', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
    lawRef: 'Section 54 of West Bengal Land Reforms Act 1955',
    forum: 'District Land & Land Reforms Officer (DL&LRO) / Collector',
    limitation: '30 Days from date of BL&LRO final order (Sec 5 Limitation Act petition if delayed)',
    checklist: [
      'Certified copy of impugned BL&LRO Order',
      'Memo of Appeal with Ground of Appeal',
      'Interim Stay Application under Sec 54(3)',
      'Court fee stamps & Process fee vouchers'
    ]
  },
  firstappeal: {
    title: 'First Appeal',
    bengali: 'প্রথম আপিল (Statutory First Appeal)',
    icon: Gavel,
    color: 'text-indigo-600',
    bgBadge: 'bg-indigo-600',
    subTypes: [
      'First Appeal u/s 54 WBLR Act',
      'First Appeal u/s 51A(5)',
      'Bargadar Hearing Appeal',
      'Civil Court First Appeal',
      'RTI First Appeal u/s 19(1)'
    ],
    statuses: ['Filed', 'Admitted', 'Notice Issued', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
    lawRef: 'Section 54 WBLR Act / Section 96 Code of Civil Procedure 1908',
    forum: 'District Collector / District Judge / Appellate Authority',
    limitation: '30 Days for Revenue Appeals; 30/90 Days for Civil First Appeals',
    checklist: [
      'Certified copy of Judgment / Impugned Order',
      'Formal Decree Sheet / Order Sheet copy',
      'Lower Court Record (LCR) requisition',
      'Caveat Search Report'
    ]
  },
  rti: {
    title: 'RTI Matter',
    bengali: 'তথ্য জানার অধিকার (RTI Application & Appeal)',
    icon: FileSearch,
    color: 'text-teal-600',
    bgBadge: 'bg-teal-600',
    subTypes: [
      'RTI Application u/s 6(1)',
      'RTI First Appeal u/s 19(1)',
      'Second Appeal u/s 19(3)',
      'Certified Copy of ROR/Khatian Query',
      'Vested Land Record Query',
      'Inquiry Report Request'
    ],
    statuses: ['Application Sent', 'PIO Replied', 'Info Provided', 'First Appeal Filed', 'Hearing', 'Disposed'],
    lawRef: 'Right to Information Act 2005 (Sec 6(1), Sec 19(1), Sec 19(3))',
    forum: 'State Public Information Officer (SPIO) / First Appellate Authority (FAA)',
    limitation: '30 Days for PIO reply; 30 Days for First Appeal; 90 Days for State Info Commission',
    checklist: [
      '₹10 Court Fee Stamp or IPO for Sec 6(1)',
      'Proof of Indian Citizenship',
      'Postal speed post tracking receipt',
      'Copy of original unanswered RTI application for 1st Appeal'
    ]
  },
  lrtt: {
    title: 'WBLRTT Tribunal',
    bengali: 'ভূমি সংস্কার ও প্রজাস্বত্ব ট্রাইব্যুনাল',
    icon: Building,
    color: 'text-cyan-600',
    bgBadge: 'bg-cyan-600',
    subTypes: [
      '10000 Share Problem',
      'Record Correction',
      'Name Correction',
      'RS to LR Conveyance',
      'Appeal against Order'
    ],
    statuses: ['OA Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Allowed', 'Dismissed'],
    lawRef: 'West Bengal Land Reforms & Tenancy Tribunal Act 1997 (Sec 6 & 10)',
    forum: 'WBLRTT Benches, Bikas Bhavan / Salt Lake, Kolkata',
    limitation: '60 Days from DL&LRO appellate order date',
    checklist: [
      'Original Application (O.A.) in prescribed format',
      'Certified copy of DL&LRO Appellate Order',
      'Certified copy of BL&LRO original order',
      'Affidavit sworn before Notary / Oath Commissioner',
      'Interim Order / Status Quo petition'
    ]
  },
  conversion: {
    title: 'Conversion Case',
    bengali: 'কনভার্সন কেস (বাস্তু রূপান্তর u/s 4C)',
    icon: RefreshCw,
    color: 'text-amber-600',
    bgBadge: 'bg-amber-600',
    subTypes: [
      'Sali to Bastu',
      'Danga to Bastu',
      'Pond to Bastu',
      'Agricultural to Commercial',
      'Other'
    ],
    statuses: ['Applied', 'Site Verified', 'Report Submitted', 'Order Passed', 'Rejected'],
    lawRef: 'Section 4C & 4D West Bengal Land Reforms Act 1955',
    forum: 'Sub-Divisional Land & Land Reforms Officer (SDL&LRO) / DL&LRO',
    limitation: 'Pre-construction mandatory permission',
    checklist: [
      'Site plan & Trace map with North point',
      'Physical inspection report by Revenue Inspector (RI)',
      'NOC from local Gram Panchayat / Municipality',
      'Conversion Fee Challan as per government circle rate'
    ]
  }
};

export const CaseDashboard: React.FC<CaseDashboardProps> = ({
  type,
  onOpenNewCase,
  onViewCaseDetail,
  onEditCase,
  onOpenChainDeed,
  onOpenAiDraft
}) => {
  const { activeCompany, deleteCase, language } = useApp();
  const meta = MODULE_META[type];
  const Icon = meta.icon;

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [subTypeFilter, setSubTypeFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const allCases = (activeCompany?.cases || []).filter(c => c.type === type);

  // Status counts
  const statusCounts: Record<string, number> = { All: allCases.length };
  meta.statuses.forEach(s => {
    statusCounts[s] = allCases.filter(c => c.status === s).length;
  });

  const pendingCount = allCases.filter(
    c => !['Allowed', 'Rejected', 'Disposed', 'Dismissed', 'Order Passed'].includes(c.status)
  ).length;
  const disposedCount = allCases.length - pendingCount;

  // Filtered cases
  const filteredCases = allCases.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSubType = subTypeFilter === 'All' || c.subType === subTypeFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.caseNo.toLowerCase().includes(q) ||
      c.party.toLowerCase().includes(q) ||
      c.opp.toLowerCase().includes(q) ||
      c.forum.toLowerCase().includes(q) ||
      c.landSchedules.some(
        s =>
          s.mouza.toLowerCase().includes(q) ||
          s.dag.toLowerCase().includes(q) ||
          s.khatian.toLowerCase().includes(q)
      );
    return matchStatus && matchSubType && matchSearch;
  });

  const printCaseSummary = (c: CaseItem) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case File: ${c.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            h1, h2, h3 { margin: 0 0 8px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #F1F5F9; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div style="font-size: 12px; color: #555;">${activeCompany?.address || ''}, ${activeCompany?.city || ''}</div>
            <div style="font-size: 12px; color: #555;">Bar Council Reg: ${activeCompany?.barCouncil || ''} · Phone: ${activeCompany?.phone || ''}</div>
          </div>
          <hr />
          <h3>CASE SUMMARY SHEET: ${c.caseNo}</h3>
          <div class="grid">
            <div><strong>Case Module:</strong> ${meta.title} (${c.subType})</div>
            <div><strong>Forum:</strong> ${c.forum || '—'}</div>
            <div><strong>Current Status:</strong> ${c.status}</div>
            <div><strong>Priority:</strong> ${c.priority || 'Normal'}</div>
            <div><strong>Filing Date:</strong> ${c.filingDate || '—'}</div>
            <div><strong>Next Hearing:</strong> ${c.nextDate || '—'}</div>
            <div><strong>Petitioner/Applicant:</strong> ${c.party}</div>
            <div><strong>Opposite Party:</strong> ${c.opp || '—'}</div>
          </div>

          ${
            c.landSchedules.length > 0
              ? `<h4>Land Schedule</h4>
                 <table>
                   <thead>
                     <tr>
                       <th>District & Block</th>
                       <th>Mouza & JL</th>
                       <th>Khatian</th>
                       <th>Dag</th>
                       <th>Area</th>
                       <th>Class</th>
                     </tr>
                   </thead>
                   <tbody>
                     ${c.landSchedules
                       .map(
                         s => `<tr>
                       <td>${s.district} / ${s.block}</td>
                       <td>${s.mouza} (JL ${s.jl})</td>
                       <td>${s.khatian}</td>
                       <td>${s.dag}</td>
                       <td>${s.area} ${s.unit}</td>
                       <td>${s.classification || '—'}</td>
                     </tr>`
                       )
                       .join('')}
                   </tbody>
                 </table>`
              : ''
          }
          <div style="margin-top: 40px; text-align: right; font-size: 12px;">
            <strong>Chamber Copy · Printed on ${new Date().toLocaleDateString('en-IN')}</strong>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const printFullModuleReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${meta.title} Chamber Report</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #F1F5F9; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div>${meta.title} — Comprehensive Status Report</div>
            <div style="font-size: 12px; color: #555;">Printed on ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <hr />
          <div><strong>Total Module Cases:</strong> ${allCases.length} · <strong>Pending:</strong> ${pendingCount} · <strong>Disposed:</strong> ${disposedCount}</div>
          <table>
            <thead>
              <tr>
                <th>Case No</th>
                <th>Sub-Type</th>
                <th>Party</th>
                <th>Forum</th>
                <th>Filing Date</th>
                <th>Next Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allCases
                .map(
                  c => `<tr>
                <td><strong>${c.caseNo}</strong></td>
                <td>${c.subType}</td>
                <td>${c.party}</td>
                <td>${c.forum}</td>
                <td>${c.filingDate || '—'}</td>
                <td>${c.nextDate || '—'}</td>
                <td>${c.status}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center -space-x-3 shrink-0">
            <CompanyLogo company={activeCompany} size="lg" className="ring-2 ring-white dark:ring-slate-900 shadow-sm z-10" />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${meta.color} ring-2 ring-white dark:ring-slate-900 shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {language === 'bn' ? meta.bengali : meta.title}
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {language === 'bn' ? meta.title : meta.bengali}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {activeCompany?.name}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Category dashboard and management book. Monitor notice status, inquiry reports,
              limitation timelines, and hearing lists.
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {allCases.length} Total
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {pendingCount} Pending
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {disposedCount} Disposed
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={printFullModuleReport}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          {type !== 'mutation' && onOpenAiDraft && (
            <button
              onClick={() => onOpenAiDraft(type)}
              className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Open AI Drafting Studio for ${meta.title}`}
            >
              <Sparkles className="w-4 h-4" /> AI Drafting ({language === 'bn' ? 'ড্রাফটিং' : 'Draft'})
            </button>
          )}
          <button
            onClick={() => onOpenNewCase(type)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New {meta.title}
          </button>
        </div>
      </div>

      {/* Statutory Law Reference & Practice Handbook Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {language === 'bn' ? 'আইন ও কার্যপদ্ধতি নির্দেশিকা' : 'Statutory & Practice Handbook'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {meta.lawRef}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {meta.limitation}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
          {/* Competent Forum */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'সংশ্লিষ্ট আদালত / ফোরাম' : 'Competent Authority / Forum'}
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">
              {meta.forum}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              West Bengal Land Revenue Jurisdiction
            </div>
          </div>

          {/* Limitation & Timeline */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'তামাদি ও সময়সীমা' : 'Limitation & Timeline'}
            </div>
            <div className="font-bold text-amber-700 dark:text-amber-400 mt-1">
              {meta.limitation}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Strict statutory compliance required
            </div>
          </div>

          {/* Essential Checklist */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'bn' ? 'প্রয়োজনীয় কাগজপত্রের তালিকা' : 'Mandatory Document Checklist'}
            </div>
            <ul className="space-y-1">
              {meta.checklist.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Subtype Distribution Progress Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Sub-Type Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {meta.subTypes.map(st => {
            const count = allCases.filter(c => c.subType === st).length;
            const pct = allCases.length > 0 ? Math.round((count / allCases.length) * 100) : 0;
            return (
              <div
                key={st}
                onClick={() => setSubTypeFilter(subTypeFilter === st ? 'All' : st)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  subTypeFilter === st
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span className="truncate">{st}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 ml-1">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Controls header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All ({statusCounts['All'] || 0})
              </button>
              {meta.statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === s
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {s} ({statusCounts[s] || 0})
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by case, party, Mouza..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          {filteredCases.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Case No</th>
                  <th className="py-3 px-4">Sub-Type</th>
                  <th className="py-3 px-4">Petitioner / Opposite</th>
                  <th className="py-3 px-4">Forum</th>
                  <th className="py-3 px-4">Land Mouza / Dag</th>
                  <th className="py-3 px-4">Next Hearing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCases.map(c => {
                  const scheduleSummary =
                    c.landSchedules.length > 0
                      ? `${c.landSchedules[0].mouza} (Dag ${c.landSchedules[0].dag})`
                      : '—';

                  const statusColor = {
                    Hearing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
                    'Notice Issued': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
                    Allowed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
                    Disposed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
                    'Order Passed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
                    Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
                    Dismissed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
                    'Stay Granted': 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
                    Admitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                  }[c.status] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                        {c.caseNo}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {c.subType}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.party}</div>
                        {c.opp && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            vs {c.opp}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {c.forum || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {scheduleSummary}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {c.nextDate || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {['mutation', 'misc', 'lrappeal', 'lrtt'].includes(c.type) && onOpenChainDeed && (
                            <button
                              onClick={() => onOpenChainDeed(c)}
                              className="p-1 rounded text-blue-600 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                              title="Make / View Chain Deed Statement (Settings > Chain Sample)"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                          {c.type !== 'mutation' && onOpenAiDraft && (
                            <button
                              onClick={() => onOpenAiDraft(c.type, c)}
                              className="p-1 rounded text-violet-600 hover:text-white hover:bg-violet-600 transition-colors cursor-pointer"
                              title="Draft Petition with AI for this case"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onViewCaseDetail(c.id)}
                            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                            title="View Full Case File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditCase(c)}
                            className="p-1 rounded text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                            title="Edit Case"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printCaseSummary(c)}
                            className="p-1 rounded text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                            title="Print Case File Sheet"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete case "${c.caseNo}"? This cannot be undone.`)) {
                                deleteCase(c.id);
                              }
                            }}
                            className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Delete Case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No {meta.title} records found
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No cases matched your filter criteria. Click below to add a new petition or case.
              </p>
              <button
                onClick={() => onOpenNewCase(type)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New {meta.title}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
