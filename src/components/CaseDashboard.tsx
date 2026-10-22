import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
  LayoutGrid,
  List,
  MapPin,
  User,
  Calendar,
  ChevronDown,
  RotateCcw,
  Download,
  CheckSquare,
  Square,
  Check,
  X,
  AlertTriangle,
  Scale,
  MessageSquare,
  Calculator,
  ShieldAlert,
  FileCheck,
  Scroll,
  FileSpreadsheet,
  Archive,
  PackageCheck
} from 'lucide-react';
import { getStatusTrackingInfo } from '../types';
import { wbDistricts } from '../data/wbDistricts';

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
    bengali: 'প্রথম আপিল (u/s 19(1) / 19(2) of RTI Act 2005)',
    icon: Gavel,
    color: 'text-indigo-600',
    bgBadge: 'bg-indigo-600',
    subTypes: [
      'u/s 19(1) of RTI Act 2005',
      'u/s 19(2) of RTI Act 2005',
      'Other Applicable Section of RTI Act 2005'
    ],
    statuses: ['Filed', 'Admitted', 'Notice Issued', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
    lawRef: 'u/s 19(1), u/s 19(2) & applicable sections of the Right to Information Act, 2005',
    forum: 'First Appellate Authority (FAA) under RTI Act 2005',
    limitation: '30 Days from expiry of SPIO reply period or receipt of reply',
    checklist: [
      'Docket No & Postal Tracking No',
      'Copy of original RTI Application u/s 6(1)',
      'Copy of SPIO reply (if any received)',
      'Grounds of First Appeal under RTI Act 2005'
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
    forum: 'Police Station, BDO, Gram Panchayat, Municipality, BL&LRO / SPIO (Optional)',
    limitation: '30 Days for PIO reply; 30 Days for First Appeal; 90 Days for State Info Commission',
    checklist: [
      'Docket No / Tracking ID',
      '₹10 Court Fee Stamp or IPO for Sec 6(1)',
      'Proof of Indian Citizenship',
      'Postal speed post tracking receipt'
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
      'Bagan to Bastu',
      'Doba to Bastu',
      'Pond to Bastu',
      'Pukur Par to Bastu',
      'Agricultural to Commercial Bastu',
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
  },
  certcopy: {
    title: 'Certified Copy of Deed',
    bengali: 'সার্টিফাইড কপি (Certified Copy of Deed)',
    icon: Scroll,
    color: 'text-rose-600',
    bgBadge: 'bg-rose-600',
    subTypes: [
      'Registered Deed Copy (দলিলের নকল)',
      'Deed Index Search (তল্লাশ ও ইন্ডেক্স)',
      'Judgement / Decree Certified Copy',
      'Order Sheet Copy',
      'Field Survey Trace Map Copy',
      'Other Certified Copy'
    ],
    statuses: ['pending for apply', 'applied', 'downloaded', 'printed', 'sent to WhatsApp', 'delivered'],
    lawRef: 'Registration Act 1908 (Sec 57) / Indian Stamp Act',
    forum: 'ADSR / Sub-Registry Office / DR Record Room',
    limitation: 'Statutory delivery period 7-15 working days',
    checklist: [
      'Deed Number, Year & Volume particulars',
      'GRN Search Fee & Copying Challan receipt',
      'Applicant identity verification',
      'Index-II property schedule details'
    ]
  },
  rorpi: {
    title: 'ROR / PI Tracking',
    bengali: 'খতিয়ান / পরচা ও পি.আই (ROR/PI Tracking)',
    icon: FileSpreadsheet,
    color: 'text-orange-600',
    bgBadge: 'bg-orange-600',
    subTypes: [
      'Certified ROR (খতিয়ান নকল / পরচা)',
      'Plot Information (PI / দাগের তথ্য)',
      'RS Porcha (আর.এস পরচা)',
      'LR Khatian Porcha (এল.আর খতিয়ান)',
      'Field Inspection Report Copy',
      'Other ROR/PI'
    ],
    statuses: ['pending for apply', 'applied', 'downloaded', 'printed', 'sent to WhatsApp', 'delivered'],
    lawRef: 'West Bengal Land Reforms Act 1955 (Sec 50 / Rule 103)',
    forum: 'BL&LRO Office / Banglarbhumi Online Portal',
    limitation: 'Statutory delivery period 7-15 working days',
    checklist: [
      'Banglarbhumi Application Number & GRN Challan',
      'Mouza, JL Number, Khatian & Dag No verification',
      'Application fee receipt',
      'Applicant photo ID / self-declaration'
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
  const {
    activeCompany,
    deleteCase,
    batchUpdateCaseStatus,
    batchDeleteCases,
    showToast,
    language
  } = useApp();
  const meta = MODULE_META[type];
  const Icon = meta.icon;

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Disposed'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [subTypeFilter, setSubTypeFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [underInquiryFilter, setUnderInquiryFilter] = useState<boolean>(false);
  const [todayHearingsFilter, setTodayHearingsFilter] = useState<boolean>(false);
  const [attachmentFilter, setAttachmentFilter] = useState<boolean>(false);
  const [rtiOverdueFilter, setRtiOverdueFilter] = useState<boolean>(false);
  const [search, setSearch] = useState('');

  // Reset filters when case sub menu / type changes
  useEffect(() => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSubTypeFilter('All');
    setDistrictFilter('All');
    setUnderInquiryFilter(false);
    setTodayHearingsFilter(false);
    setAttachmentFilter(false);
    setRtiOverdueFilter(false);
    setSearch('');
    setSelectedCaseIds([]);
    setIsBatchMode(false);
  }, [type]);

  // Batch Selection Mode states
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [batchTargetStatus, setBatchTargetStatus] = useState<string>('');
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState<boolean>(false);
  const [singleCaseToDelete, setSingleCaseToDelete] = useState<CaseItem | null>(null);

  const allCases = (activeCompany?.cases || []).filter(c => c.type === type);

  // Helper to identify cases under inquiry, hearing, or verification
  const isUnderInquiry = (status: string) => {
    const norm = (status || '').toLowerCase().trim();
    return (
      norm.includes('inquiry') ||
      norm.includes('hearing') ||
      norm.includes('notice') ||
      norm.includes('verified') ||
      norm.includes('report') ||
      norm.includes('admitted') ||
      norm.includes('stay') ||
      norm.includes('progress')
    );
  };

  // Helper to identify overdue RTI cases (>30 days statutory deadline or explicit overdue status)
  const isRtiOverdue = (c: CaseItem) => {
    if (c.type !== 'rti') return false;
    const norm = (c.status || '').toLowerCase().trim();
    if (['disposed', 'allowed', 'dismissed', 'complete', 'delivered', 'inquiry complete'].includes(norm)) return false;
    if (norm.includes('overdue') || norm.includes('delayed') || norm.includes('expired')) return true;
    if (c.filingDate) {
      const fileTime = new Date(c.filingDate).getTime();
      if (!isNaN(fileTime)) {
        const daysDiff = (Date.now() - fileTime) / (1000 * 60 * 60 * 24);
        if (daysDiff > 30) return true;
      }
    }
    return false;
  };

  const rtiOverdueCount = allCases.filter(isRtiOverdue).length;

  const nowDate = new Date();
  const todayDateStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;

  // Rigorous calculation logic: Single source of truth from getStatusTrackingInfo
  const isCaseDisposed = (status: string) => {
    return getStatusTrackingInfo(status).category === 'Disposed';
  };

  const isCasePending = (status: string) => {
    return !isCaseDisposed(status);
  };

  const isCaseUnderInquiry = (status: string) => {
    if (isCaseDisposed(status)) return false;
    return isUnderInquiry(status);
  };

  const isCaseTodayHearing = (c: CaseItem) => {
    return Boolean(
      c.nextDate === todayDateStr ||
      (c.hearingDates && c.hearingDates.includes(todayDateStr)) ||
      (c.hearingList && c.hearingList.some(h => h.date === todayDateStr))
    );
  };

  // Mathematical calculation identity: allCases.length === pendingCount + disposedCount
  const disposedCount = allCases.filter(c => isCaseDisposed(c.status)).length;
  const pendingCount = allCases.filter(c => isCasePending(c.status)).length;
  const underInquiryCount = allCases.filter(c => isCaseUnderInquiry(c.status)).length;
  const todayHearingCount = allCases.filter(c => isCaseTodayHearing(c)).length;
  const activePendingCount = pendingCount;

  const moduleVaultCount = (activeCompany?.vaultFiles || []).filter(
    f => f.category === type || f.category.toLowerCase().includes(type)
  ).length;
  const totalAttachments = allCases.reduce((acc, c) => acc + (c.attachments?.length || 0), 0);
  const vaultDisplayCount = moduleVaultCount > 0 ? moduleVaultCount : (totalAttachments > 0 ? totalAttachments : (activeCompany?.vaultFiles?.length || 0));

  // Status counts for status pills
  const statusCounts: Record<string, number> = { All: allCases.length };
  meta.statuses.forEach(s => {
    statusCounts[s] = allCases.filter(c => c.status === s).length;
  });

  const categoryCounts = {
    All: allCases.length,
    Pending: pendingCount,
    'In Progress': allCases.filter(c => getStatusTrackingInfo(c.status).category === 'In Progress').length,
    Disposed: disposedCount
  };

  const isCertOrRorPi = type === 'certcopy' || type === 'rorpi';

  // Filtered cases strictly linked with calculation logic
  const filteredCases = allCases.filter(c => {
    const statusInfo = getStatusTrackingInfo(c.status);
    const matchCategory =
      categoryFilter === 'All'
        ? true
        : categoryFilter === 'Pending'
        ? isCasePending(c.status)
        : categoryFilter === 'Disposed'
        ? isCaseDisposed(c.status)
        : statusInfo.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSubType = type === 'rorpi'
      ? (subTypeFilter === 'All' || c.subType === subTypeFilter)
      : type === 'certcopy'
      ? true
      : (subTypeFilter === 'All' || c.subType === subTypeFilter);
    const matchDistrict = !isCertOrRorPi || districtFilter === 'All' || c.district === districtFilter || Boolean(c.landSchedules?.some(s => s.district === districtFilter));
    const matchUnderInquiry = !underInquiryFilter || isCaseUnderInquiry(c.status);
    const matchToday = !todayHearingsFilter || isCaseTodayHearing(c);
    const matchAttachment = !attachmentFilter || (c.attachments && c.attachments.length > 0);
    const matchRtiOverdue = !rtiOverdueFilter || isRtiOverdue(c);
    const q = search.toLowerCase().trim();

    let matchSearch = !q;
    if (q) {
      if (type === 'rorpi') {
        // Scoped to ROR/PI fields: ROR/PI No, GRN No, applicant name, and land schedule (dag, khatian, district, block, jl, mouza)
        matchSearch =
          Boolean((c.appNo && c.appNo.toLowerCase().includes(q)) ||
          (c.rorPiNo && c.rorPiNo.toLowerCase().includes(q)) ||
          (c.ainNo && c.ainNo.toLowerCase().includes(q)) ||
          (c.caseNo && c.caseNo.toLowerCase().includes(q))) ||
          Boolean(c.grnNo && c.grnNo.toLowerCase().includes(q)) ||
          Boolean(c.party && c.party.toLowerCase().includes(q)) ||
          Boolean(c.applicants?.some(a => a.name && a.name.toLowerCase().includes(q))) ||
          Boolean(c.subType && c.subType.toLowerCase().includes(q)) ||
          Boolean(c.district && c.district.toLowerCase().includes(q)) ||
          Boolean(c.landSchedules?.some(s =>
            (s.dag && s.dag.toLowerCase().includes(q)) ||
            (s.khatian && s.khatian.toLowerCase().includes(q)) ||
            (s.district && s.district.toLowerCase().includes(q)) ||
            (s.block && s.block.toLowerCase().includes(q)) ||
            (s.jl && s.jl.toLowerCase().includes(q)) ||
            (s.mouza && s.mouza.toLowerCase().includes(q))
          ));
      } else if (type === 'certcopy') {
        // Scoped to deed entry fields: deed no, deed year, applicant name, broker name, AIN, GRN, district, office
        matchSearch =
          Boolean(c.applicantDeedNo && c.applicantDeedNo.toLowerCase().includes(q)) ||
          Boolean(c.applicantDeedYear && c.applicantDeedYear.toLowerCase().includes(q)) ||
          Boolean(c.deedNo && c.deedNo.toLowerCase().includes(q)) ||
          Boolean(c.deedYear && c.deedYear.toLowerCase().includes(q)) ||
          Boolean(c.party && c.party.toLowerCase().includes(q)) ||
          Boolean(c.applicants?.some(a => a.name && a.name.toLowerCase().includes(q))) ||
          Boolean(c.brokerName && c.brokerName.toLowerCase().includes(q)) ||
          Boolean(c.appNo && c.appNo.toLowerCase().includes(q)) ||
          Boolean(c.ainNo && c.ainNo.toLowerCase().includes(q)) ||
          Boolean(c.grnNo && c.grnNo.toLowerCase().includes(q)) ||
          Boolean(c.district && c.district.toLowerCase().includes(q)) ||
          Boolean(c.applicantAdsr && c.applicantAdsr.toLowerCase().includes(q)) ||
          Boolean(c.adsr && c.adsr.toLowerCase().includes(q));
      } else if (type === 'rti') {
        matchSearch =
          Boolean(c.docketNo && c.docketNo.toLowerCase().includes(q)) ||
          Boolean(c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
          Boolean(c.party && c.party.toLowerCase().includes(q)) ||
          Boolean(c.forum && c.forum.toLowerCase().includes(q)) ||
          Boolean(c.subType && c.subType.toLowerCase().includes(q));
      } else if (type === 'firstappeal') {
        matchSearch =
          Boolean(c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
          Boolean(c.docketNo && c.docketNo.toLowerCase().includes(q)) ||
          Boolean(c.grnNo && c.grnNo.toLowerCase().includes(q)) ||
          Boolean(c.party && c.party.toLowerCase().includes(q)) ||
          Boolean(c.opp && c.opp.toLowerCase().includes(q)) ||
          Boolean(c.forum && c.forum.toLowerCase().includes(q)) ||
          Boolean(c.subType && c.subType.toLowerCase().includes(q));
      } else {
        matchSearch =
          Boolean(c.caseNo && c.caseNo.toLowerCase().includes(q)) ||
          Boolean(c.appNo && c.appNo.toLowerCase().includes(q)) ||
          Boolean(c.docketNo && c.docketNo.toLowerCase().includes(q)) ||
          Boolean(c.grnNo && c.grnNo.toLowerCase().includes(q)) ||
          Boolean(c.party && c.party.toLowerCase().includes(q)) ||
          Boolean(c.opp && c.opp.toLowerCase().includes(q)) ||
          Boolean(c.forum && c.forum.toLowerCase().includes(q)) ||
          Boolean(c.applicantDeedNo && c.applicantDeedNo.toLowerCase().includes(q)) ||
          Boolean(c.brokerName && c.brokerName.toLowerCase().includes(q)) ||
          Boolean(c.landSchedules?.some(
            s =>
              s.mouza.toLowerCase().includes(q) ||
              s.dag.toLowerCase().includes(q) ||
              s.khatian.toLowerCase().includes(q)
          ));
      }
    }
    return matchCategory && matchStatus && matchSubType && matchDistrict && matchUnderInquiry && matchToday && matchAttachment && matchRtiOverdue && matchSearch;
  });

  // Applicable iconic stage options according to case type
  const applicableStages = (() => {
    switch (type) {
      case 'mutation':
        return [
          {
            id: 'hearing',
            label: language === 'bn' ? 'শুনানি' : 'Hearing',
            subLabel: 'BL&LRO',
            count: allCases.filter(c => c.status === 'Hearing').length,
            icon: Calendar,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'Hearing'
          },
          {
            id: 'notice',
            label: language === 'bn' ? 'নোটিশ জারি' : 'Notice Issued',
            subLabel: 'Summons',
            count: allCases.filter(c => c.status === 'Notice Issued').length,
            icon: Send,
            iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
            activeBorder: 'border-cyan-600',
            activeRing: 'ring-cyan-600/30',
            activeBg: 'bg-cyan-50/70 dark:bg-cyan-950/40',
            badgeActiveText: 'text-cyan-600 dark:text-cyan-400',
            filterMode: 'status' as const,
            value: 'Notice Issued'
          },
          {
            id: 'allowed',
            label: language === 'bn' ? 'মঞ্জুর' : 'Allowed',
            subLabel: 'Order Passed',
            count: allCases.filter(c => c.status === 'Allowed').length,
            icon: Check,
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            activeBorder: 'border-emerald-600',
            activeRing: 'ring-emerald-600/30',
            activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
            badgeActiveText: 'text-emerald-600 dark:text-emerald-400',
            filterMode: 'status' as const,
            value: 'Allowed'
          }
        ];
      case 'misc':
        return [
          {
            id: 'hearing',
            label: language === 'bn' ? 'শুনানি' : 'Hearing',
            subLabel: 'RO / BL&LRO',
            count: allCases.filter(c => c.status === 'Hearing').length,
            icon: Calendar,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'Hearing'
          },
          {
            id: 'notice',
            label: language === 'bn' ? 'নোটিশ জারি' : 'Notice Issued',
            subLabel: 'Sec 50 / 51A',
            count: allCases.filter(c => c.status === 'Notice Issued').length,
            icon: Send,
            iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
            activeBorder: 'border-cyan-600',
            activeRing: 'ring-cyan-600/30',
            activeBg: 'bg-cyan-50/70 dark:bg-cyan-950/40',
            badgeActiveText: 'text-cyan-600 dark:text-cyan-400',
            filterMode: 'status' as const,
            value: 'Notice Issued'
          },
          {
            id: '10000share',
            label: language === 'bn' ? '১০০০০ হিস্যা' : '10,000 Share',
            subLabel: 'Correction',
            count: allCases.filter(c => c.subType === '10000 Share Problem').length,
            icon: Calculator,
            iconBg: 'bg-purple-100 dark:bg-purple-950/60',
            iconColor: 'text-purple-600 dark:text-purple-400',
            activeBorder: 'border-purple-600',
            activeRing: 'ring-purple-600/30',
            activeBg: 'bg-purple-50/70 dark:bg-purple-950/40',
            badgeActiveText: 'text-purple-600 dark:text-purple-400',
            filterMode: 'subtype' as const,
            value: '10000 Share Problem'
          }
        ];
      case 'lrappeal':
      case 'firstappeal':
        return [
          {
            id: 'stay',
            label: language === 'bn' ? 'স্টে অর্ডার' : 'Stay Granted',
            subLabel: 'Sec 54(3)',
            count: allCases.filter(c => c.status === 'Stay Granted').length,
            icon: ShieldAlert,
            iconBg: 'bg-rose-100 dark:bg-rose-950/60',
            iconColor: 'text-rose-600 dark:text-rose-400',
            activeBorder: 'border-rose-600',
            activeRing: 'ring-rose-600/30',
            activeBg: 'bg-rose-50/70 dark:bg-rose-950/40',
            badgeActiveText: 'text-rose-600 dark:text-rose-400',
            filterMode: 'status' as const,
            value: 'Stay Granted'
          },
          {
            id: 'hearing',
            label: language === 'bn' ? 'আপিল শুনানি' : 'Hearing',
            subLabel: 'Collector / DL&LRO',
            count: allCases.filter(c => c.status === 'Hearing').length,
            icon: Calendar,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'Hearing'
          },
          {
            id: 'admitted',
            label: language === 'bn' ? 'আপিল গৃহীত' : 'Admitted',
            subLabel: 'Admission Stage',
            count: allCases.filter(c => c.status === 'Admitted').length,
            icon: CheckSquare,
            iconBg: 'bg-blue-100 dark:bg-blue-950/60',
            iconColor: 'text-blue-600 dark:text-blue-400',
            activeBorder: 'border-blue-600',
            activeRing: 'ring-blue-600/30',
            activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
            badgeActiveText: 'text-blue-600 dark:text-blue-400',
            filterMode: 'status' as const,
            value: 'Admitted'
          }
        ];
      case 'rti':
        return [
          {
            id: 'appsent',
            label: language === 'bn' ? 'আবেদন প্রেরিত' : 'App Sent',
            subLabel: 'Sec 6(1)',
            count: allCases.filter(c => c.status === 'Application Sent').length,
            icon: Send,
            iconBg: 'bg-teal-100 dark:bg-teal-950/60',
            iconColor: 'text-teal-600 dark:text-teal-400',
            activeBorder: 'border-teal-600',
            activeRing: 'ring-teal-600/30',
            activeBg: 'bg-teal-50/70 dark:bg-teal-950/40',
            badgeActiveText: 'text-teal-600 dark:text-teal-400',
            filterMode: 'status' as const,
            value: 'Application Sent'
          },
          {
            id: 'pioreply',
            label: language === 'bn' ? 'এসপিআইও উত্তর' : 'PIO Replied',
            subLabel: 'Response Recd',
            count: allCases.filter(c => c.status === 'PIO Replied').length,
            icon: MessageSquare,
            iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
            activeBorder: 'border-cyan-600',
            activeRing: 'ring-cyan-600/30',
            activeBg: 'bg-cyan-50/70 dark:bg-cyan-950/40',
            badgeActiveText: 'text-cyan-600 dark:text-cyan-400',
            filterMode: 'status' as const,
            value: 'PIO Replied'
          },
          {
            id: 'firstappeal',
            label: language === 'bn' ? '১ম আপিল' : 'First Appeal',
            subLabel: 'Sec 19(1)',
            count: allCases.filter(c => c.status === 'First Appeal Filed').length,
            icon: Gavel,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'First Appeal Filed'
          }
        ];
      case 'lrtt':
        return [
          {
            id: 'oafiled',
            label: language === 'bn' ? 'ও.এ. দাখিল' : 'OA Filed',
            subLabel: 'Sec 6 & 10',
            count: allCases.filter(c => c.status === 'OA Filed').length,
            icon: FileText,
            iconBg: 'bg-blue-100 dark:bg-blue-950/60',
            iconColor: 'text-blue-600 dark:text-blue-400',
            activeBorder: 'border-blue-600',
            activeRing: 'ring-blue-600/30',
            activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
            badgeActiveText: 'text-blue-600 dark:text-blue-400',
            filterMode: 'status' as const,
            value: 'OA Filed'
          },
          {
            id: 'hearing',
            label: language === 'bn' ? 'বেঞ্চ শুনানি' : 'Hearing',
            subLabel: 'Tribunal Bench',
            count: allCases.filter(c => c.status === 'Hearing').length,
            icon: Calendar,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'Hearing'
          },
          {
            id: 'reserved',
            label: language === 'bn' ? 'রায় সংরক্ষিত' : 'Order Reserved',
            subLabel: 'CAV Stage',
            count: allCases.filter(c => c.status === 'Order Reserved').length,
            icon: Clock,
            iconBg: 'bg-purple-100 dark:bg-purple-950/60',
            iconColor: 'text-purple-600 dark:text-purple-400',
            activeBorder: 'border-purple-600',
            activeRing: 'ring-purple-600/30',
            activeBg: 'bg-purple-50/70 dark:bg-purple-950/40',
            badgeActiveText: 'text-purple-600 dark:text-purple-400',
            filterMode: 'status' as const,
            value: 'Order Reserved'
          }
        ];
      case 'conversion':
        return [
          {
            id: 'siteverified',
            label: language === 'bn' ? 'ফিল্ড ভেরিফাইড' : 'Site Verified',
            subLabel: 'RI Inspection',
            count: allCases.filter(c => c.status === 'Site Verified').length,
            icon: MapPin,
            iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
            activeBorder: 'border-cyan-600',
            activeRing: 'ring-cyan-600/30',
            activeBg: 'bg-cyan-50/70 dark:bg-cyan-950/40',
            badgeActiveText: 'text-cyan-600 dark:text-cyan-400',
            filterMode: 'status' as const,
            value: 'Site Verified'
          },
          {
            id: 'reportsub',
            label: language === 'bn' ? 'রিপোর্ট দাখিল' : 'Report Submitted',
            subLabel: 'Inquiry Report',
            count: allCases.filter(c => c.status === 'Report Submitted').length,
            icon: FileCheck,
            iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            activeBorder: 'border-indigo-600',
            activeRing: 'ring-indigo-600/30',
            activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
            badgeActiveText: 'text-indigo-600 dark:text-indigo-400',
            filterMode: 'status' as const,
            value: 'Report Submitted'
          },
          {
            id: 'orderpassed',
            label: language === 'bn' ? '৪সি অর্ডার পাশ' : 'Order Passed',
            subLabel: 'SDL&LRO NOC',
            count: allCases.filter(c => c.status === 'Order Passed').length,
            icon: CheckCircle2,
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            activeBorder: 'border-emerald-600',
            activeRing: 'ring-emerald-600/30',
            activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
            badgeActiveText: 'text-emerald-600 dark:text-emerald-400',
            filterMode: 'status' as const,
            value: 'Order Passed'
          }
        ];
      case 'certcopy':
        return [
          {
            id: 'pendingapply',
            label: language === 'bn' ? 'আবেদন অপেক্ষমাণ' : 'Pending for Apply',
            subLabel: 'Ready to Apply',
            count: allCases.filter(c => (c.status || '').toLowerCase() === 'pending for apply').length,
            icon: Clock,
            iconBg: 'bg-amber-100 dark:bg-amber-950/60',
            iconColor: 'text-amber-600 dark:text-amber-400',
            activeBorder: 'border-amber-600',
            activeRing: 'ring-amber-600/30',
            activeBg: 'bg-amber-50/70 dark:bg-amber-950/40',
            badgeActiveText: 'text-amber-600 dark:text-amber-400',
            filterMode: 'status' as const,
            value: 'pending for apply'
          },
          {
            id: 'downloaded',
            label: language === 'bn' ? 'ডাউনলোড ও প্রিন্ট' : 'Downloaded / Printed',
            subLabel: 'Ready Copy',
            count: allCases.filter(c => ['downloaded', 'printed'].includes((c.status || '').toLowerCase())).length,
            icon: Download,
            iconBg: 'bg-blue-100 dark:bg-blue-950/60',
            iconColor: 'text-blue-600 dark:text-blue-400',
            activeBorder: 'border-blue-600',
            activeRing: 'ring-blue-600/30',
            activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
            badgeActiveText: 'text-blue-600 dark:text-blue-400',
            filterMode: 'status' as const,
            value: 'downloaded'
          },
          {
            id: 'delivered',
            label: language === 'bn' ? 'সরবরাহ সম্পন্ন' : 'Delivered',
            subLabel: 'Handed to Party',
            count: allCases.filter(c => (c.status || '').toLowerCase().includes('delivered')).length,
            icon: PackageCheck,
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            activeBorder: 'border-emerald-600',
            activeRing: 'ring-emerald-600/30',
            activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
            badgeActiveText: 'text-emerald-600 dark:text-emerald-400',
            filterMode: 'status' as const,
            value: 'delivered'
          }
        ];
      case 'rorpi':
        return [
          {
            id: 'pendingapply',
            label: language === 'bn' ? 'আবেদন অপেক্ষমাণ' : 'Pending for Apply',
            subLabel: 'Ready to Apply',
            count: allCases.filter(c => (c.status || '').toLowerCase() === 'pending for apply').length,
            icon: Clock,
            iconBg: 'bg-amber-100 dark:bg-amber-950/60',
            iconColor: 'text-amber-600 dark:text-amber-400',
            activeBorder: 'border-amber-600',
            activeRing: 'ring-amber-600/30',
            activeBg: 'bg-amber-50/70 dark:bg-amber-950/40',
            badgeActiveText: 'text-amber-600 dark:text-amber-400',
            filterMode: 'status' as const,
            value: 'pending for apply'
          },
          {
            id: 'downloaded',
            label: language === 'bn' ? 'ডাউনলোড ও প্রিন্ট' : 'Downloaded / Printed',
            subLabel: 'Ready Document',
            count: allCases.filter(c => ['downloaded', 'printed'].includes((c.status || '').toLowerCase())).length,
            icon: Download,
            iconBg: 'bg-blue-100 dark:bg-blue-950/60',
            iconColor: 'text-blue-600 dark:text-blue-400',
            activeBorder: 'border-blue-600',
            activeRing: 'ring-blue-600/30',
            activeBg: 'bg-blue-50/70 dark:bg-blue-950/40',
            badgeActiveText: 'text-blue-600 dark:text-blue-400',
            filterMode: 'status' as const,
            value: 'downloaded'
          },
          {
            id: 'delivered',
            label: language === 'bn' ? 'সরবরাহ সম্পন্ন' : 'Delivered',
            subLabel: 'Handed to Party',
            count: allCases.filter(c => (c.status || '').toLowerCase().includes('delivered')).length,
            icon: PackageCheck,
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            activeBorder: 'border-emerald-600',
            activeRing: 'ring-emerald-600/30',
            activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
            badgeActiveText: 'text-emerald-600 dark:text-emerald-400',
            filterMode: 'status' as const,
            value: 'delivered'
          }
        ];
    }
  })();

  // Batch Selection Handlers
  const toggleSelectAll = () => {
    if (selectedCaseIds.length === filteredCases.length && filteredCases.length > 0) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredCases.map(c => c.id));
    }
  };

  const toggleSelectCase = (id: string) => {
    setSelectedCaseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApplyBatchStatus = () => {
    if (!batchTargetStatus) {
      showToast('Please select a status to apply', 'info');
      return;
    }
    if (selectedCaseIds.length === 0) {
      showToast('Please select at least one case', 'info');
      return;
    }
    batchUpdateCaseStatus(selectedCaseIds, batchTargetStatus);
    setBatchTargetStatus('');
    setSelectedCaseIds([]);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedCaseIds.length === 0) return;
    const count = selectedCaseIds.length;
    batchDeleteCases(selectedCaseIds);
    setSelectedCaseIds([]);
    setBatchDeleteModalOpen(false);
  };

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

  const printCaseSummary = (c: CaseItem) => {
    const isDeedOrRor = c.type === 'certcopy' || c.type === 'rorpi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${c.type === 'rorpi' ? 'ROR/PI Application' : c.type === 'certcopy' ? 'Certified Copy' : 'Case File'}: ${c.type === 'rorpi' ? (c.rorPiNo || c.appNo || c.caseNo) : isDeedOrRor ? (c.appNo || c.ainNo || c.caseNo) : c.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            h1, h2, h3, h4 { margin: 0 0 8px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #F1F5F9; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; font-size: 13px; }
            .highlight-box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 14px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div style="font-size: 12px; color: #555;">${activeCompany?.address || ''}, ${activeCompany?.city || ''}</div>
            <div style="font-size: 12px; color: #555;">Bar Council Reg: ${activeCompany?.barCouncil || ''} · Phone: ${activeCompany?.phone || ''}</div>
          </div>
          <hr />
          <h3>${c.type === 'rorpi' ? 'ROR / PLOT INFORMATION (PI) APPLICATION SHEET' : c.type === 'certcopy' ? 'CERTIFIED COPY OF DEED APPLICATION SHEET' : `CASE SUMMARY SHEET: ${c.caseNo}`}</h3>
          
          ${c.type === 'rorpi' ? `
            <div class="highlight-box">
              <div class="grid">
                <div><strong>ROR/PI NO:</strong> ${c.rorPiNo || c.appNo || c.caseNo || '—'}</div>
                <div><strong>GRN Fee Challan:</strong> ${c.grnNo || '—'}</div>
                <div><strong>Record Sub-Type:</strong> ${c.subType || 'Certified ROR'}</div>
                <div><strong>Current Status:</strong> ${c.status}</div>
                <div><strong>Application Date:</strong> ${c.filingDate || '—'}</div>
                <div><strong>Issuing Authority:</strong> ${c.forum || 'BL&LRO Certified Copy Section'}</div>
              </div>
            </div>

            ${c.landSchedules && c.landSchedules.length > 0 ? `
              <h4>Schedule of Land (জমির তপশীল বিবরণ — প্লট / খতিয়ান)</h4>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>District & Block</th>
                    <th>J.L. No</th>
                    <th>Record Type</th>
                    <th>Survey Stage</th>
                    <th>Plot / Khatian No</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.landSchedules.map((s, idx) => {
                    const isPlot = s.recordType === 'Plot' || (s.dag && !s.khatian);
                    return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${s.district || c.district || '—'} / ${s.block || '—'}</td>
                      <td>${s.jl ? `JL: ${s.jl}` : '—'}</td>
                      <td><strong>${s.recordType || (isPlot ? 'Plot' : 'ROR')}</strong></td>
                      <td><strong>${s.surveyStage || 'LR'}</strong></td>
                      <td><strong>${isPlot ? (s.dag || s.plotOrKhatian || '—') : (s.khatian || s.plotOrKhatian || '—')}</strong></td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            ` : ''}

            <h4 style="margin-top: 16px;">Applicant Particulars</h4>
            <div class="grid">
              <div><strong>Applicant Name:</strong> ${c.party}</div>
              ${c.applicants?.[0]?.phone ? `<div><strong>Applicant Contact:</strong> ${c.applicants[0].phone}</div>` : ''}
            </div>
          ` : c.type === 'certcopy' ? `
            <div class="highlight-box">
              <div class="grid">
                <div><strong>AIN NO:</strong> ${c.appNo || c.ainNo || c.caseNo || '—'}</div>
                <div><strong>GRN Fee Challan:</strong> ${c.grnNo || '—'}</div>
                <div><strong>DEED NO:</strong> ${c.applicantDeedNo || c.deedNo || '—'}</div>
                <div><strong>DEED YEAR:</strong> ${c.applicantDeedYear || c.deedYear || '—'}</div>
                <div><strong>DISTRICT:</strong> ${c.district || 'West Bengal'}</div>
                <div><strong>OFFICE:</strong> ${c.applicantAdsr || c.adsr || 'ADSR'}</div>
                <div><strong>Current Status:</strong> ${c.status}</div>
                <div><strong>Application Date:</strong> ${c.filingDate || '—'}</div>
                <div><strong>Expected Delivery Date:</strong> ${c.nextDate || '—'}</div>
              </div>
            </div>
            <h4>Applicant & Broker Reference</h4>
            <div class="grid">
              <div><strong>Applicant Full Name:</strong> ${c.party}</div>
              <div><strong>Broker / Muhuri:</strong> ${c.brokerName || '—'} ${c.brokerPhone ? `(${c.brokerPhone})` : ''}</div>
              ${c.applicants?.[0]?.father ? `<div><strong>Father / Husband:</strong> ${c.applicants[0].father}</div>` : ''}
              ${c.applicants?.[0]?.phone ? `<div><strong>Applicant Contact:</strong> ${c.applicants[0].phone}</div>` : ''}
              ${c.applicants?.[0]?.address ? `<div><strong>Address:</strong> ${c.applicants[0].address}</div>` : ''}
            </div>
          ` : `
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
          `}
          <div style="margin-top: 40px; text-align: right; font-size: 12px;">
            <strong>Chamber Copy · Printed on ${new Date().toLocaleDateString('en-IN')}</strong>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  const exportFilteredCasesCSV = () => {
    const targetList =
      selectedCaseIds.length > 0
        ? filteredCases.filter(c => selectedCaseIds.includes(c.id))
        : filteredCases;

    if (targetList.length === 0) {
      showToast('No cases available to export with current selection/filter.', 'info');
      return;
    }

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let headers: string[];
    let rows: string[];

    if (type === 'rorpi') {
      headers = [
        'SL',
        'ROR/PI NO',
        'GRN Fee Challan',
        'Record Sub-Type',
        'Applicant Name',
        'Plot / Dag No',
        'Khatian No',
        'District',
        'Block',
        'J.L. No',
        'Mouza',
        'Filing Date',
        'Status'
      ];
      rows = targetList.map((c, idx) => {
        const s0 = c.landSchedules?.[0];
        return [
          escapeCsv(idx + 1),
          escapeCsv(c.rorPiNo || c.appNo || c.caseNo || ''),
          escapeCsv(c.grnNo || ''),
          escapeCsv(c.subType || 'Certified ROR'),
          escapeCsv(c.party || ''),
          escapeCsv(s0?.dag || ''),
          escapeCsv(s0?.khatian || ''),
          escapeCsv(s0?.district || c.district || ''),
          escapeCsv(s0?.block || ''),
          escapeCsv(s0?.jl || ''),
          escapeCsv(s0?.mouza || ''),
          escapeCsv(c.filingDate || ''),
          escapeCsv(c.status || '')
        ].join(',');
      });
    } else if (type === 'certcopy') {
      headers = [
        'SL',
        'AIN NO',
        'GRN Fee Challan',
        'Deed No',
        'Deed Year',
        'District',
        'Registry Office',
        'Applicant Name',
        'Broker / Muhuri Name',
        'Filing Date',
        'Expected Delivery Date',
        'Status'
      ];
      rows = targetList.map((c, idx) => [
        escapeCsv(idx + 1),
        escapeCsv(c.appNo || c.ainNo || c.caseNo || ''),
        escapeCsv(c.grnNo || ''),
        escapeCsv(c.applicantDeedNo || c.deedNo || ''),
        escapeCsv(c.applicantDeedYear || c.deedYear || ''),
        escapeCsv(c.district || ''),
        escapeCsv(c.applicantAdsr || c.adsr || ''),
        escapeCsv(c.party || ''),
        escapeCsv(c.brokerName || ''),
        escapeCsv(c.filingDate || ''),
        escapeCsv(c.nextDate || ''),
        escapeCsv(c.status || '')
      ].join(','));
    } else {
      headers = [
        'Case No',
        'Status Category',
        'Stage / Status',
        'Sub-Type',
        'Petitioner / Applicant',
        'Opposite Party / Respondent',
        'Forum',
        'Mouza',
        'J.L. No',
        'Khatian',
        'Plot / Dag',
        'Share / Area',
        'Filing Date',
        'Next Hearing Date',
        'Application / Docket No'
      ];
      rows = targetList.map(c => {
        const statusInfo = getStatusTrackingInfo(c.status);
        const s0 = c.landSchedules?.[0];
        return [
          escapeCsv(c.caseNo),
          escapeCsv(statusInfo.category),
          escapeCsv(c.status),
          escapeCsv(c.subType),
          escapeCsv(c.party),
          escapeCsv(c.opp || ''),
          escapeCsv(c.forum || ''),
          escapeCsv(s0?.mouza || ''),
          escapeCsv(s0?.jl || ''),
          escapeCsv(s0?.khatian || ''),
          escapeCsv(s0?.dag || ''),
          escapeCsv(s0?.area ? `${s0.area} ${s0.unit}` : ''),
          escapeCsv(c.filingDate || ''),
          escapeCsv(c.nextDate || ''),
          escapeCsv(c.appNo || c.docketNo || '')
        ].join(',');
      });
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterTag =
      selectedCaseIds.length > 0
        ? `selected_${selectedCaseIds.length}`
        : statusFilter !== 'All'
        ? statusFilter
        : categoryFilter !== 'All'
        ? categoryFilter
        : 'all';
    link.href = url;
    link.setAttribute('download', `${type}_cases_${filterTag.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${targetList.length} ${isCertOrRorPi ? 'records' : 'cases'} to CSV`);
  };

  const exportFilteredCasesPDF = () => {
    const targetList =
      selectedCaseIds.length > 0
        ? filteredCases.filter(c => selectedCaseIds.includes(c.id))
        : filteredCases;

    if (targetList.length === 0) {
      showToast('No cases available to print/export with current selection/filter.', 'info');
      return;
    }

    const activeFilterLabel =
      selectedCaseIds.length > 0
        ? `Selected: ${selectedCaseIds.length} Cases`
        : statusFilter !== 'All'
        ? `Status: ${statusFilter}`
        : categoryFilter !== 'All'
        ? `Category: ${categoryFilter}`
        : 'All Statuses';

    const searchLabel = search ? ` | Search: "${search}"` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${meta.title} — ${selectedCaseIds.length > 0 ? 'Selected' : 'Filtered'} Case List (${targetList.length} ${isCertOrRorPi ? 'Records' : 'Cases'})</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 20px; font-size: 11px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { margin: 0 0 4px 0; font-size: 18px; color: #1e3a8a; }
            .subtitle { font-size: 13px; color: #475569; font-weight: 600; }
            .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; display: flex; justify-content: space-between; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; font-weight: 700; color: #0f172a; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px; }
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
              <div class="subtitle">${meta.title} — ${selectedCaseIds.length > 0 ? 'Batch Selected' : 'Filtered'} Registry Report</div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <div>Chamber: ${activeCompany?.city || 'Kolkata'}, WB</div>
              <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="meta-box">
            <div><strong>Report Scope:</strong> ${activeFilterLabel}${searchLabel}</div>
            <div><strong>Exporting:</strong> ${targetList.length} of ${allCases.length} Total ${isCertOrRorPi ? 'Applications' : 'Cases'}</div>
          </div>

          <table>
            <thead>
              ${type === 'rorpi' ? `
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>ROR/PI NO.</th>
                  <th>GRN Challan</th>
                  <th>Record Sub-Type</th>
                  <th>Plot / Dag & Khatian</th>
                  <th>District, Block & JL</th>
                  <th>Applicant Name</th>
                  <th>Filing Date</th>
                  <th>Status</th>
                </tr>
              ` : type === 'certcopy' ? `
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>AIN NO.</th>
                  <th>GRN Challan</th>
                  <th>Deed No & Year</th>
                  <th>District & Office</th>
                  <th>Applicant Name</th>
                  <th>Broker / Muhuri</th>
                  <th>Filing Date</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                </tr>
              ` : `
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>Case No</th>
                  <th>Sub-Type</th>
                  <th>Petitioner / Applicant</th>
                  <th>Opposite Party</th>
                  <th>Forum</th>
                  <th>Land Schedule</th>
                  <th>Filing Date</th>
                  <th>Next Date</th>
                  <th>Status</th>
                </tr>
              `}
            </thead>
            <tbody>
              ${targetList
                .map((c, idx) => {
                  const statusInfo = getStatusTrackingInfo(c.status);
                  const badgeClass =
                    statusInfo.category === 'Pending'
                      ? 'badge-pending'
                      : statusInfo.category === 'In Progress'
                      ? 'badge-progress'
                      : 'badge-disposed';
                  const s0 = c.landSchedules?.[0];
                  const scheduleStr = s0 ? `${s0.mouza} (Dag ${s0.dag})` : '—';

                  if (type === 'rorpi') {
                    const isPlot = s0?.recordType === 'Plot' || (s0?.dag && !s0?.khatian);
                    const plotKhatian = s0 ? `${s0.surveyStage || 'LR'} · ${isPlot ? `Plot: ${s0.dag || s0.plotOrKhatian || '—'}` : `Kh: ${s0.khatian || s0.plotOrKhatian || '—'}`}` : '—';
                    const location = s0 ? `${s0.district || c.district || '—'}, ${s0.block || '—'} (JL: ${s0.jl || '—'})` : (c.district || '—');
                    return `<tr>
                      <td style="color: #64748b; font-family: monospace; font-size: 10px;">${idx + 1}</td>
                      <td><strong>${c.rorPiNo || c.appNo || c.caseNo || '—'}</strong></td>
                      <td style="font-family: monospace;">${c.grnNo || '—'}</td>
                      <td>${c.subType || 'Certified ROR'}</td>
                      <td style="font-family: monospace;"><strong>${plotKhatian}</strong></td>
                      <td>${location}</td>
                      <td><strong>${c.party}</strong></td>
                      <td>${c.filingDate || '—'}</td>
                      <td>
                        <span class="badge ${badgeClass}">${c.status}</span>
                      </td>
                    </tr>`;
                  }

                  if (type === 'certcopy') {
                    return `<tr>
                      <td style="color: #64748b; font-family: monospace; font-size: 10px;">${idx + 1}</td>
                      <td><strong>${c.appNo || c.ainNo || c.caseNo || '—'}</strong></td>
                      <td style="font-family: monospace;">${c.grnNo || '—'}</td>
                      <td style="font-family: monospace;"><strong>${c.applicantDeedNo || c.deedNo || '—'}</strong> / ${c.applicantDeedYear || c.deedYear || '—'}</td>
                      <td>${c.district || '—'} (${c.applicantAdsr || c.adsr || 'ADSR'})</td>
                      <td><strong>${c.party}</strong></td>
                      <td>${c.brokerName || '—'}</td>
                      <td>${c.filingDate || '—'}</td>
                      <td style="font-weight: 600; color: #1e40af;">${c.nextDate || '—'}</td>
                      <td>
                        <span class="badge ${badgeClass}">${c.status}</span>
                      </td>
                    </tr>`;
                  }

                  return `<tr>
                    <td style="color: #64748b; font-family: monospace; font-size: 10px;">${idx + 1}</td>
                    <td><strong>${c.caseNo}</strong></td>
                    <td>${c.subType}</td>
                    <td><strong>${c.party}</strong></td>
                    <td>${c.opp || '—'}</td>
                    <td>${c.forum || '—'}</td>
                    <td>${scheduleStr}</td>
                    <td>${c.filingDate || '—'}</td>
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
            <span>Total Records: ${targetList.length}</span>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  const printFullModuleReport = exportFilteredCasesPDF;

  return (
    <div className="space-y-4">
      {/* Sub-Dashboard Header & Statutory Overview Card — Matching Image 3 with 3D Visuals */}
      <div className="w-full rounded-xl p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-4">
        {/* Top Row: 3D Icon Badge + Title + Bengali Pill + Law Ref + 3D Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-slate-800 ${meta.color} border border-blue-200/60 dark:border-slate-700 shrink-0 shadow-[0_4px_10px_rgba(15,23,42,0.1),inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(0,0,0,0.1)]`}>
              <Icon className="w-6 h-6 drop-shadow-2xs stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {language === 'bn' ? meta.bengali : meta.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                  {language === 'bn' ? meta.title : meta.bengali}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {meta.lawRef} • {meta.forum}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {type !== 'mutation' && type !== 'misc' && type !== 'certcopy' && type !== 'rorpi' && type !== 'conversion' && type !== 'lrappeal' && type !== 'lrtt' && onOpenAiDraft && (
              <button
                type="button"
                onClick={() => onOpenAiDraft(type)}
                className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 border-b-3 border-b-violet-800 active:translate-y-0.5 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={`Open AI Drafting Studio for ${meta.title}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এআই ড্রাফট' : 'AI Draft'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={printFullModuleReport}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 border-b-3 border-b-slate-300 dark:border-b-slate-950 active:translate-y-0.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Print Case Registry Report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Print Report</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenNewCase(type)}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 border-b-3 border-b-blue-950 active:translate-y-0.5 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title={`Enter new ${meta.title}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'bn' ? '+ নতুন এন্ট্রি' : 'New Entry'}</span>
            </button>
          </div>
        </div>

        {/* Top KPI Stat Cards */}
        {isCertOrRorPi ? (
          /* Keep ror/pi & certified copy of deed dashboard unchanged as requested */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Total Applications */}
            {(() => {
              const isActive =
                categoryFilter === 'All' &&
                statusFilter === 'All' &&
                subTypeFilter === 'All' &&
                !underInquiryFilter &&
                !todayHearingsFilter &&
                !attachmentFilter;
              return (
                <div
                  onClick={() => {
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setSubTypeFilter('All');
                    setUnderInquiryFilter(false);
                    setTodayHearingsFilter(false);
                    setAttachmentFilter(false);
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-blue-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-blue-500/40 bg-blue-50/40 dark:bg-blue-950/30' : ''
                  }`}
                  title="Click to view all registered applications in this module"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'মোট আবেদন' : 'Total Applications'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200/70 dark:border-blue-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                    {allCases.length}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    {pendingCount} Processing • {disposedCount} Delivered
                  </div>
                </div>
              );
            })()}

            {/* 2. Expected Delivery Today */}
            {(() => {
              const isActive = todayHearingsFilter;
              return (
                <div
                  onClick={() => {
                    setTodayHearingsFilter(prev => !prev);
                    if (!todayHearingsFilter) {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-amber-500 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-amber-500/50 bg-amber-50/50 dark:bg-amber-950/40' : ''
                  }`}
                  title="Filter by records with expected delivery scheduled today"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'আজকের সম্ভাব্য ডেলিভারি' : 'Delivery Due Today'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200/70 dark:border-amber-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Calendar className="w-3 h-3 text-amber-500" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-amber-600 dark:text-amber-400 leading-tight">
                    {todayHearingCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Due for delivery today
                  </div>
                </div>
              );
            })()}

            {/* 3. In Progress */}
            {(() => {
              const isActive =
                (categoryFilter === 'Pending' || underInquiryFilter) &&
                !todayHearingsFilter &&
                !attachmentFilter;
              return (
                <div
                  onClick={() => {
                    if (isActive) {
                      setCategoryFilter('All');
                      setUnderInquiryFilter(false);
                    } else {
                      setCategoryFilter('Pending');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-purple-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-purple-500/50 bg-purple-50/50 dark:bg-purple-950/40' : ''
                  }`}
                  title="Filter by active in-progress applications"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'চলমান আবেদন' : 'In Progress'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 leading-tight">
                    {activePendingCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Under verification &amp; processing
                  </div>
                </div>
              );
            })()}

            {/* 4. Delivered */}
            {(() => {
              const deliveredCount = allCases.filter(c => c.status.toLowerCase().includes('delivered')).length;
              const isActive = statusFilter.toLowerCase().includes('delivered');
              return (
                <div
                  onClick={() => {
                    const deliveredStatus = type === 'rorpi' ? 'delivered' : 'Delivered';
                    if (statusFilter === deliveredStatus) {
                      setStatusFilter('All');
                    } else {
                      setStatusFilter(deliveredStatus);
                      setCategoryFilter('All');
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-emerald-500 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/40' : ''
                  }`}
                  title="Filter by delivered entries"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'সরবরাহ সম্পন্ন' : 'Delivered'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
                    {deliveredCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Completed &amp; handed to party
                  </div>
                </div>
              );
            })()}
          </div>
        ) : type === 'rti' ? (
          /* RTI Dashboard: TOTAL CASES, DISPOSED, OVERDUE CASES, ACTIVE PENDING CASES (Vault Files omitted) */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Total Cases */}
            {(() => {
              const isActive =
                categoryFilter === 'All' &&
                statusFilter === 'All' &&
                !rtiOverdueFilter &&
                !todayHearingsFilter &&
                !underInquiryFilter;
              return (
                <div
                  onClick={() => {
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setSubTypeFilter('All');
                    setRtiOverdueFilter(false);
                    setUnderInquiryFilter(false);
                    setTodayHearingsFilter(false);
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-blue-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-blue-500/40 bg-blue-50/40 dark:bg-blue-950/30' : ''
                  }`}
                  title="Click to view all RTI applications"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'মোট আরটিআই' : 'TOTAL CASES'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200/70 dark:border-blue-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <FileSearch className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                    {allCases.length}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    {pendingCount} Active • {disposedCount} Replied
                  </div>
                </div>
              );
            })()}

            {/* 2. Disposed */}
            {(() => {
              const isActive = categoryFilter === 'Disposed';
              return (
                <div
                  onClick={() => {
                    if (categoryFilter === 'Disposed') {
                      setCategoryFilter('All');
                    } else {
                      setCategoryFilter('Disposed');
                      setStatusFilter('All');
                      setRtiOverdueFilter(false);
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-emerald-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/40' : ''
                  }`}
                  title="Filter by replied and disposed RTI matters"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'নিষ্পত্তিকৃত (তথ্য প্রাপ্ত)' : 'DISPOSED'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
                    {disposedCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Information provided &amp; closed
                  </div>
                </div>
              );
            })()}

            {/* 3. Overdue Cases */}
            {(() => {
              const isActive = rtiOverdueFilter;
              return (
                <div
                  onClick={() => {
                    setRtiOverdueFilter(prev => !prev);
                    if (!rtiOverdueFilter) {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-rose-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-rose-500/50 bg-rose-50/50 dark:bg-rose-950/40' : ''
                  }`}
                  title="Filter by RTI matters exceeding statutory 30-day response limit"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'মেয়াদোত্তীর্ণ (৩০ দিন+)' : 'OVERDUE CASES'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200/70 dark:border-rose-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-rose-600 dark:text-rose-400 leading-tight">
                    {rtiOverdueCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    &gt; 30-day statutory reply window
                  </div>
                </div>
              );
            })()}

            {/* 4. Active Pending Cases */}
            {(() => {
              const rtiPendingCount = allCases.filter(c => getStatusTrackingInfo(c.status).category === 'Pending' || getStatusTrackingInfo(c.status).category === 'In Progress').length;
              const isActive = (categoryFilter === 'Pending' || categoryFilter === 'In Progress') && !rtiOverdueFilter;
              return (
                <div
                  onClick={() => {
                    if (categoryFilter === 'Pending') {
                      setCategoryFilter('All');
                    } else {
                      setCategoryFilter('Pending');
                      setStatusFilter('All');
                      setRtiOverdueFilter(false);
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-purple-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-purple-500/50 bg-purple-50/50 dark:bg-purple-950/40' : ''
                  }`}
                  title="Filter by active pending RTI applications"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'সক্রিয় বিচারাধীন' : 'ACTIVE PENDING CASES'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 leading-tight">
                    {rtiPendingCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Awaiting PIO / Appellate reply
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* All other sub dashboards (mutation, misc, lrappeal, firstappeal, lrtt, conversion): 5 cards (Vault Files omitted) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. Total Cases */}
            {(() => {
              const isActive =
                categoryFilter === 'All' &&
                statusFilter === 'All' &&
                subTypeFilter === 'All' &&
                !underInquiryFilter &&
                !todayHearingsFilter &&
                !attachmentFilter;
              return (
                <div
                  onClick={() => {
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setSubTypeFilter('All');
                    setUnderInquiryFilter(false);
                    setTodayHearingsFilter(false);
                    setAttachmentFilter(false);
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-blue-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-blue-500/40 bg-blue-50/40 dark:bg-blue-950/30' : ''
                  }`}
                  title="Click to view all registered cases in this module"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'মোট কেস (Total Cases)' : 'TOTAL CASES'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200/70 dark:border-blue-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                    {allCases.length}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    {pendingCount} Pending • {disposedCount} Disposed
                  </div>
                </div>
              );
            })()}

            {/* 2. Pending Cases */}
            {(() => {
              const isActive = categoryFilter === 'Pending' && !underInquiryFilter && !todayHearingsFilter;
              return (
                <div
                  onClick={() => {
                    if (categoryFilter === 'Pending') {
                      setCategoryFilter('All');
                    } else {
                      setCategoryFilter('Pending');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-purple-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-purple-500/50 bg-purple-50/50 dark:bg-purple-950/40' : ''
                  }`}
                  title="Filter by active pending cases"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'চলমান বিচারাধীন' : 'PENDING CASES'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 leading-tight">
                    {pendingCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Requires follow-up &amp; dates
                  </div>
                </div>
              );
            })()}

            {/* 3. Today's Hearings */}
            {(() => {
              const isActive = todayHearingsFilter;
              return (
                <div
                  onClick={() => {
                    setTodayHearingsFilter(prev => !prev);
                    if (!todayHearingsFilter) {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-amber-500 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-amber-500/50 bg-amber-50/50 dark:bg-amber-950/40' : ''
                  }`}
                  title="Filter by cases with hearings scheduled today"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'আজকের শুনানি' : "TODAYS HEARING"}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200/70 dark:border-amber-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <Calendar className="w-3 h-3 text-amber-500" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-amber-600 dark:text-amber-400 leading-tight">
                    {todayHearingCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Scheduled hearings today
                  </div>
                </div>
              );
            })()}

            {/* 4. Under Inquiry */}
            {(() => {
              const isActive = underInquiryFilter;
              return (
                <div
                  onClick={() => {
                    setUnderInquiryFilter(prev => !prev);
                    if (!underInquiryFilter) {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setTodayHearingsFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-indigo-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/40' : ''
                  }`}
                  title="Filter by cases currently under inquiry, verification, or hearing report"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'তদন্তাধীন মামলা' : 'UNDER INQUIRY'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <FileSearch className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400 leading-tight">
                    {underInquiryCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Field inquiry &amp; verification
                  </div>
                </div>
              );
            })()}

            {/* 5. Disposed */}
            {(() => {
              const isActive = categoryFilter === 'Disposed';
              return (
                <div
                  onClick={() => {
                    if (categoryFilter === 'Disposed') {
                      setCategoryFilter('All');
                    } else {
                      setCategoryFilter('Disposed');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setTodayHearingsFilter(false);
                      setAttachmentFilter(false);
                    }
                  }}
                  className={`bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800 border-l-3 border-l-emerald-600 border-b-3 border-b-slate-300 dark:border-b-slate-950 shadow-[0_4px_10px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer group ${
                    isActive ? 'ring-2 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/40' : ''
                  }`}
                  title="Filter by disposed &amp; allowed cases"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="truncate">
                      {language === 'bn' ? 'নিষ্পত্তিকৃত মামলা' : 'DISPOSED'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
                    {disposedCount}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                    Order passed &amp; finalized
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Filter and Case List / Table Container — Matching Image 3 with 3D Visuals */}
      <div className="w-full rounded-xl bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Row 1 (Visual from Image 3): Status Filter Pills on Left + Sub-Type Dropdown & Search Input on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Status Filter Pills (`All (N)`, `Filed (N)`, `Notice Issued (N)`, `Hearing (N)`, etc.) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setUnderInquiryFilter(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-b-2 ${
                  categoryFilter === 'All' && statusFilter === 'All' && !underInquiryFilter
                    ? 'bg-slate-900 text-white border-b-slate-950 dark:bg-blue-600 dark:text-white dark:border-b-blue-800 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b-slate-300 dark:border-b-slate-950 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({allCases.length})
              </button>

              {meta.statuses.map(st => {
                const isSelectedStatus = statusFilter === st && !underInquiryFilter;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      if (isSelectedStatus) {
                        setStatusFilter('All');
                      } else {
                        setStatusFilter(st);
                        setCategoryFilter('All');
                        setUnderInquiryFilter(false);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-b-2 ${
                      isSelectedStatus
                        ? 'bg-slate-900 text-white border-b-slate-950 dark:bg-blue-600 dark:text-white dark:border-b-blue-800 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b-slate-300 dark:border-b-slate-950 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st} ({statusCounts[st] || 0})
                  </button>
                );
              })}
            </div>

            {/* Right Side: District or Sub-Type Dropdown + Search Input organized per entry form */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {isCertOrRorPi ? (
                <div className="relative">
                  <select
                    value={districtFilter}
                    onChange={e => setDistrictFilter(e.target.value)}
                    className="pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
                    title="Filter by District"
                  >
                    <option value="All">All Districts</option>
                    {Object.keys(wbDistricts)
                      .sort()
                      .map(d => (
                        <option key={d} value={d}>
                          {d} ({allCases.filter(c => c.district === d).length})
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={subTypeFilter}
                    onChange={e => setSubTypeFilter(e.target.value)}
                    className="pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
                    title="Filter by Case Sub-Type"
                  >
                    <option value="All">All Sub-Types</option>
                    {meta.subTypes.map(st => (
                      <option key={st} value={st}>
                        {st} ({allCases.filter(c => c.subType === st).length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              )}

              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={
                    isCertOrRorPi
                      ? "Search by Deed No, Year, Applicant, Broker, AIN, GRN..."
                      : type === 'rti'
                      ? "Search Docket No, Tracking ID, Applicant, Public Authority..."
                      : type === 'firstappeal'
                      ? "Search FA Case No, Docket No, Tracking No, Appellant..."
                      : type === 'misc'
                      ? "Search Misc Case No, Docket No, Matter, Party, Mouza..."
                      : type === 'lrappeal'
                      ? "Search Appeal No, Docket No, Appellant, Forum, Mouza..."
                      : "Search Case No, MUTE App No, Deed No, Party, Mouza, Dag..."
                  }
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Action & Utility Bar (shown when cases exist) */}
          {filteredCases.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{filteredCases.length}</span> of {allCases.length} {isCertOrRorPi ? 'records' : 'cases'}
                </span>

                {(categoryFilter !== 'All' || statusFilter !== 'All' || subTypeFilter !== 'All' || districtFilter !== 'All' || underInquiryFilter || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                      setSubTypeFilter('All');
                      setDistrictFilter('All');
                      setUnderInquiryFilter(false);
                      setSearch('');
                    }}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Filters</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={exportFilteredCasesCSV}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Export filtered case list to CSV spreadsheet"
                >
                  <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={exportFilteredCasesPDF}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Print filtered case list or Save as PDF"
                >
                  <Printer className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchMode(prev => {
                      if (prev) setSelectedCaseIds([]);
                      return !prev;
                    });
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isBatchMode
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isBatchMode ? 'Exit Batch' : 'Batch Select'}</span>
                  {selectedCaseIds.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-[10px] font-extrabold">
                      {selectedCaseIds.length}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="View as Table"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="View as Cards"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Batch Actions Toolbar */}
        {isBatchMode && (
          <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/80 dark:via-indigo-950/70 dark:to-blue-950/80 border-b border-blue-200 dark:border-blue-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-2.5 py-1 text-xs font-bold rounded-md bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {selectedCaseIds.length === filteredCases.length && filteredCases.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedCaseIds.length === filteredCases.length && filteredCases.length > 0
                    ? 'Deselect All'
                    : `Select All Filtered (${filteredCases.length})`}
                </span>
              </button>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                <strong className="text-blue-700 dark:text-blue-300 font-mono text-sm">{selectedCaseIds.length}</strong> of {filteredCases.length} cases selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Status:
                </span>
                <select
                  value={batchTargetStatus}
                  onChange={e => setBatchTargetStatus(e.target.value)}
                  className="text-xs font-bold rounded bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">Update status to...</option>
                  {meta.statuses.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!batchTargetStatus || selectedCaseIds.length === 0}
                  onClick={handleApplyBatchStatus}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-colors cursor-pointer shadow-2xs"
                >
                  Apply Status
                </button>
              </div>

              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={exportFilteredCasesCSV}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>CSV ({selectedCaseIds.length})</span>
              </button>

              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={exportFilteredCasesPDF}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>PDF ({selectedCaseIds.length})</span>
              </button>

              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={() => setBatchDeleteModalOpen(true)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedCaseIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedCaseIds([]);
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Mode: Table (Visual from Image 2) vs Cards Grid */}
        {filteredCases.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCases.map(c => {
                const statusInfo = getStatusTrackingInfo(c.status);
                const s0 = c.landSchedules?.[0];
                const extraPlots = (c.landSchedules?.length || 0) - 1;
                const scheduleSummary =
                  c.landSchedules.length > 0
                    ? `${c.landSchedules[0].mouza} (Dag ${c.landSchedules[0].dag})`
                    : '—';
                const isSelected = selectedCaseIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (isBatchMode) {
                        toggleSelectCase(c.id);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between group relative ${
                      isBatchMode ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-600 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-500/70 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {type === 'rorpi' ? (
                        <div>
                          {/* Card Top: ROR/PI NO. & GRN + Status Badge */}
                          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                              {isBatchMode && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleSelectCase(c.id);
                                  }}
                                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                                </button>
                              )}
                              <div className="min-w-0">
                                <span className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-400 block truncate">
                                  {c.rorPiNo || c.appNo || c.caseNo || 'ROR/PI Pending'}
                                </span>
                                {c.grnNo && (
                                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                                    GRN: {c.grnNo}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${statusInfo.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                              <span>{c.status}</span>
                            </div>
                          </div>

                          {/* SubType Tag */}
                          <div className="mb-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              {c.subType || 'Certified ROR'}
                            </span>
                          </div>

                          {/* Land Schedule Box: Plot/Khatian, Survey Stage, District, Block, JL */}
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1.5 text-xs mb-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-[9px] font-bold uppercase text-slate-400">
                                  {s0?.recordType === 'Plot' || (s0?.dag && !s0?.khatian) ? 'Plot (Dag) No' : 'Khatian No'}
                                </div>
                                <div className="font-mono font-bold text-blue-700 dark:text-blue-300 text-xs">
                                  {s0?.recordType === 'Plot' || (s0?.dag && !s0?.khatian)
                                    ? (s0?.dag || s0?.plotOrKhatian || '—')
                                    : (s0?.khatian || s0?.plotOrKhatian || '—')}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold uppercase text-slate-400">Record &amp; Stage</div>
                                <div className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                                  {s0?.surveyStage || 'LR'} · {s0?.recordType || (s0?.dag && !s0?.khatian ? 'Plot' : 'ROR')}
                                </div>
                              </div>
                            </div>
                            <div className="pt-1 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 block">District &amp; Block</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                                  {s0?.district || c.district || '—'} / {s0?.block || '—'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 block">J.L. No</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">
                                  {s0?.jl ? `JL: ${s0.jl}` : '—'}
                                </span>
                              </div>
                            </div>
                            {extraPlots > 0 && (
                              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 pt-0.5">
                                +{extraPlots} more schedule{extraPlots > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>

                          {/* Applicant Box */}
                          <div className="space-y-1 py-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                                {c.party}
                              </span>
                            </div>
                            {c.applicants?.[0]?.phone && (
                              <div className="text-[11px] font-mono text-slate-500 pl-5">
                                {c.applicants[0].phone}
                              </div>
                            )}
                          </div>

                          {/* Filing Date */}
                          <div className="flex items-center justify-between text-[11px] py-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <span className="truncate">
                              Filing / App Date: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{c.filingDate || '—'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {c.forum || 'BL&LRO Portal'}
                            </span>
                          </div>
                        </div>
                      ) : type === 'certcopy' ? (
                        <div>
                          {/* Card Top: AIN NO. & GRN + Status Badge */}
                          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                              {isBatchMode && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleSelectCase(c.id);
                                  }}
                                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                                </button>
                              )}
                              <div className="min-w-0">
                                <span className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-400 block truncate">
                                  {c.appNo || c.ainNo || c.caseNo || 'AIN Pending'}
                                </span>
                                {c.grnNo && (
                                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                                    GRN: {c.grnNo}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${statusInfo.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                              <span>{c.status}</span>
                            </div>
                          </div>

                          {/* Primary Registry Box matching entry form */}
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                              <div className="text-[9px] font-bold uppercase text-slate-400">Deed No & Year</div>
                              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {c.applicantDeedNo || c.deedNo || '—'} / {c.applicantDeedYear || c.deedYear || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold uppercase text-slate-400">District & Office</div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate" title={c.district}>
                                {c.district || 'West Bengal'}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate" title={c.applicantAdsr || c.adsr}>
                                {c.applicantAdsr || c.adsr || 'ADSR'}
                              </div>
                            </div>
                          </div>

                          {/* Applicant & Broker Box */}
                          <div className="space-y-1 py-1.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                                {c.party}
                              </span>
                            </div>
                            {c.brokerName && (
                              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pl-5 truncate">
                                Broker: {c.brokerName}
                              </div>
                            )}
                          </div>

                          {/* Delivery & Filing */}
                          <div className="flex items-center justify-between text-[11px] py-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <span className="truncate">
                              Filed: <span className="font-mono">{c.filingDate || '—'}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono font-bold text-blue-700 dark:text-blue-400">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Delivery: {c.nextDate || 'No date set'}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {isBatchMode && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleSelectCase(c.id);
                                  }}
                                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                                </button>
                              )}
                              <div className="min-w-0">
                                <span className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-400 block truncate">
                                  {c.caseNo || c.docketNo || 'RTI Application'}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                                  {c.subType}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border shrink-0 ${statusInfo.badgeClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                              <span>{c.status}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex items-start gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                                  {c.party}
                                </span>
                                {type !== 'rti' && c.opp ? (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                                    vs. {c.opp}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                              <Gavel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {c.forum || (type === 'rti' ? 'Public Authority (Optional)' : 'West Bengal Revenue Forum')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate">
                                {scheduleSummary}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] py-2 text-slate-500 dark:text-slate-400">
                            <span className="truncate">
                              Filed: <span className="font-mono font-medium">{c.filingDate || '—'}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{c.nextDate || 'No date set'}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {!isCertOrRorPi && ['mutation', 'misc'].includes(c.type) && onOpenChainDeed && (
                          <button
                            type="button"
                            onClick={() => onOpenChainDeed(c)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Make Chain Deed Statement"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Chain Deed</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewCaseDetail(c.id)}
                          className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 hover:text-blue-600 dark:text-slate-400 transition-colors cursor-pointer"
                          title="View Case File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCase(c)}
                          className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-600 hover:text-amber-600 dark:text-slate-400 transition-colors cursor-pointer"
                          title="Edit Case"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => printCaseSummary(c)}
                          className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 hover:text-emerald-600 dark:text-slate-400 transition-colors cursor-pointer"
                          title="Print Case Summary"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSingleCaseToDelete(c)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-400 transition-colors cursor-pointer"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View matching Image 2 */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {isBatchMode && (
                      <th className="py-3 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors cursor-pointer mx-auto bg-white dark:bg-slate-800"
                        >
                          {selectedCaseIds.length === filteredCases.length && filteredCases.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="py-3.5 px-4">
                      {type === 'rorpi'
                        ? 'ROR/PI NO. & GRN Fee Challan'
                        : isCertOrRorPi
                        ? 'AIN NO. & GRN Fee Challan'
                        : type === 'rti'
                        ? 'Docket / Tracking ID & Case No'
                        : type === 'firstappeal'
                        ? 'Case No, Docket & Tracking No'
                        : type === 'lrappeal' || type === 'misc'
                        ? 'Case No & Docket No'
                        : 'Case No & App No'}
                    </th>
                    <th className="py-3.5 px-4">
                      {type === 'rorpi'
                        ? 'Record Sub-Type'
                        : isCertOrRorPi
                        ? 'Deed No & Year'
                        : type === 'rti'
                        ? 'RTI Matter'
                        : 'Sub-Type'}
                    </th>
                    <th className="py-3.5 px-4">
                      {type === 'rorpi'
                        ? 'Plot & Khatian'
                        : isCertOrRorPi
                        ? 'District & Office'
                        : type === 'rti'
                        ? 'Applicant & Authority / Forum'
                        : 'Petitioner & Opp. Party'}
                    </th>
                    <th className="py-3.5 px-4">
                      {type === 'rorpi'
                        ? 'District, Block & J.L.'
                        : isCertOrRorPi
                        ? 'Applicant & Broker Name'
                        : type === 'rti'
                        ? 'Public Authority / SPIO'
                        : 'Land Schedule (Mouza/Dag)'}
                    </th>
                    <th className="py-3.5 px-4">
                      {type === 'rorpi'
                        ? 'Applicant Name'
                        : isCertOrRorPi
                        ? 'Expected Delivery'
                        : 'Hearing Date'}
                    </th>
                    <th className="py-3.5 px-4">
                      {type === 'rorpi' ? 'Filing Date' : 'Status'}
                    </th>
                    {type === 'rorpi' && <th className="py-3.5 px-4">Status</th>}
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCases.map(c => {
                    const statusInfo = getStatusTrackingInfo(c.status);
                    const s0 = c.landSchedules?.[0];
                    const extraPlots = (c.landSchedules?.length || 0) - 1;
                    const isSelected = selectedCaseIds.includes(c.id);

                    return (
                      <tr
                        key={c.id}
                        onClick={() => {
                          if (isBatchMode) {
                            toggleSelectCase(c.id);
                          }
                        }}
                        className={`transition-colors ${isBatchMode ? 'cursor-pointer' : ''} ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {isBatchMode && (
                          <td
                            className="py-3.5 px-3 text-center whitespace-nowrap"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSelectCase(c.id)}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            </button>
                          </td>
                        )}

                        {type === 'rorpi' ? (
                          <>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                <div className="font-mono font-extrabold text-blue-700 dark:text-blue-400 text-xs">
                                  {c.rorPiNo || c.appNo || c.caseNo || 'ROR/PI Pending'}
                                </div>
                                {c.grnNo && (
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                    GRN: {c.grnNo}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {c.subType || 'Certified ROR'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                {s0?.recordType === 'Plot' || (s0?.dag && !s0?.khatian) ? (
                                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
                                    <span className="text-[10px] font-semibold text-slate-400 mr-1">{s0?.surveyStage || 'LR'} · Plot:</span>
                                    <span className="text-blue-700 dark:text-blue-400 font-extrabold">{s0?.dag || s0?.plotOrKhatian || '—'}</span>
                                  </div>
                                ) : (
                                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
                                    <span className="text-[10px] font-semibold text-slate-400 mr-1">{s0?.surveyStage || 'LR'} · Kh:</span>
                                    <span className="text-indigo-700 dark:text-indigo-400 font-extrabold">{s0?.khatian || s0?.plotOrKhatian || '—'}</span>
                                  </div>
                                )}
                                {extraPlots > 0 && (
                                  <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    +{extraPlots} more schedule{extraPlots > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                  {s0?.district || c.district || 'West Bengal'}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {s0?.block ? `Block: ${s0.block}` : ''} {s0?.jl ? `· JL: ${s0.jl}` : ''}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">{c.party}</div>
                                {c.applicants?.[0]?.phone && (
                                  <div className="text-[11px] font-mono text-slate-500">{c.applicants[0].phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                {c.filingDate || '—'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                              >
                                <span>{c.status}</span>
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {type === 'certcopy' ? (
                                <div>
                                  <div className="font-mono font-extrabold text-blue-700 dark:text-blue-400 text-xs">
                                    {c.appNo || c.ainNo || c.caseNo || 'AIN Pending'}
                                  </div>
                                  {c.grnNo && (
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                      GRN: {c.grnNo}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="font-mono font-extrabold text-blue-700 dark:text-blue-400 text-xs">
                                    {c.caseNo || c.docketNo || 'RTI Application'}
                                  </div>
                                  {(c.appNo || c.docketNo) && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                      {c.type === 'rti'
                                        ? `Docket/Track: ${c.docketNo}`
                                        : c.docketNo
                                        ? `Docket: ${c.docketNo}`
                                        : `App: ${c.appNo}`}
                                    </div>
                                  )}
                                  {c.grnNo && !['misc', 'lrappeal', 'rti'].includes(c.type) && (
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                      {c.type === 'firstappeal' ? `Tracking: ${c.grnNo}` : `GRN: ${c.grnNo}`}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {type === 'certcopy' ? (
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs font-mono">
                                    Deed: {c.applicantDeedNo || c.deedNo || '—'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    Year: {c.applicantDeedYear || c.deedYear || '—'}
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {c.subType}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {type === 'certcopy' ? (
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">
                                    {c.district || 'West Bengal'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {c.applicantAdsr || c.adsr || 'ADSR Office'}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100">{c.party}</div>
                                  {type === 'rti' ? (
                                    <div className="text-[11px] text-teal-600 dark:text-teal-400 truncate max-w-[220px]">
                                      {c.forum ? `To: ${c.forum}` : 'Authority: Optional / Not specified'}
                                    </div>
                                  ) : (
                                    c.opp && (
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                                        vs. {c.opp}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {type === 'certcopy' ? (
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100">{c.party}</div>
                                  {c.brokerName && (
                                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                      Broker: {c.brokerName}
                                    </div>
                                  )}
                                </div>
                              ) : s0 ? (
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">
                                    {s0.mouza} {s0.jl ? `(JL: ${s0.jl})` : ''}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                    Kh: {s0.khatian || '—'} • Dag: {s0.dag || '—'} ({s0.area} {s0.unit})
                                  </div>
                                  {extraPlots > 0 && (
                                    <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                      +{extraPlots} more plot{extraPlots > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {c.nextDate ? (
                                <div>
                                  <div className="flex items-center gap-1 font-mono font-bold text-blue-700 dark:text-blue-400">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>{c.nextDate}</span>
                                  </div>
                                  {c.filingDate && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      Filed: {c.filingDate}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400">
                                  {c.filingDate ? `Filed: ${c.filingDate}` : '—'}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                              >
                                <span>{c.status}</span>
                              </span>
                            </td>
                          </>
                        )}
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {['mutation', 'misc'].includes(c.type) && onOpenChainDeed && (
                              <button
                                onClick={() => onOpenChainDeed(c)}
                                className="p-1.5 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                title="Make / View Chain Deed Statement"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onViewCaseDetail(c.id)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                              title="View Full Case File"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditCase(c)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                              title="Edit Case"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => printCaseSummary(c)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                              title="Print Case File Sheet"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSingleCaseToDelete(c)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
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
            </div>
          )
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center shadow-[0_4px_10px_rgba(15,23,42,0.08),inset_0_2px_2px_rgba(255,255,255,0.8)] border border-slate-200/80 dark:border-slate-700">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 border-b-3 border-b-blue-950 active:translate-y-0.5 text-white text-xs font-semibold shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add New {meta.title}
            </button>
          </div>
        )}
      </div>

      {/* Batch Deletion Confirmation Modal */}
      {batchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Delete {selectedCaseIds.length} Selected Cases?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              You are about to permanently remove {selectedCaseIds.length} cases from the {meta.title} register along with all their linked schedules, diary entries, and records.
            </p>

            {/* Preview of cases being deleted */}
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 mb-5 text-xs">
              {filteredCases
                .filter(c => selectedCaseIds.includes(c.id))
                .slice(0, 5)
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between font-medium py-0.5">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{c.caseNo}</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{c.party}</span>
                  </div>
                ))}
              {selectedCaseIds.length > 5 && (
                <div className="text-[11px] text-slate-400 italic text-center pt-1">
                  ...and {selectedCaseIds.length - 5} more cases
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBatchDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete ({selectedCaseIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Case Delete Confirmation Modal */}
      {singleCaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Delete Case Record?
                </h3>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {singleCaseToDelete.caseNo}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              Are you sure you want to delete case <strong>{singleCaseToDelete.caseNo}</strong> ({singleCaseToDelete.party})?
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              This record will be permanently removed from this chamber.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSingleCaseToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCase(singleCaseToDelete.id);
                  setSingleCaseToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Delete Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
