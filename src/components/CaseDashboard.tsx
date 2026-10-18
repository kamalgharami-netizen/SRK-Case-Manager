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
  FileCheck
} from 'lucide-react';
import { getStatusTrackingInfo } from '../types';

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
    bengali: 'প্রথম আপিল (u/s 19(1) of RTI Act 2005)',
    icon: Gavel,
    color: 'text-indigo-600',
    bgBadge: 'bg-indigo-600',
    subTypes: [
      'u/s 19(1) of RTI Act 2005'
    ],
    statuses: ['Filed', 'Admitted', 'Notice Issued', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
    lawRef: 'Section 19(1) of the Right to Information Act, 2005',
    forum: 'First Appellate Authority (FAA) / DL&LRO / SDL&LRO',
    limitation: '30 Days from expiry of SPIO reply period or receipt of reply',
    checklist: [
      'Copy of original RTI Application u/s 6(1)',
      'Postal / Speed Post Tracking Receipt',
      'Copy of SPIO reply (if any received)',
      'Grounds of First Appeal u/s 19(1) of RTI Act 2005'
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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Disposed'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [subTypeFilter, setSubTypeFilter] = useState<string>('All');
  const [underInquiryFilter, setUnderInquiryFilter] = useState<boolean>(false);
  const [search, setSearch] = useState('');

  // Reset filters when case sub menu / type changes
  useEffect(() => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSubTypeFilter('All');
    setUnderInquiryFilter(false);
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

  // Status & Category counts
  const statusCounts: Record<string, number> = { All: allCases.length };
  meta.statuses.forEach(s => {
    statusCounts[s] = allCases.filter(c => c.status === s).length;
  });

  const categoryCounts = {
    All: allCases.length,
    Pending: allCases.filter(c => getStatusTrackingInfo(c.status).category === 'Pending').length,
    'In Progress': allCases.filter(c => getStatusTrackingInfo(c.status).category === 'In Progress').length,
    Disposed: allCases.filter(c => getStatusTrackingInfo(c.status).category === 'Disposed').length
  };

  const pendingCount = categoryCounts.Pending;
  const underInquiryCount = allCases.filter(c => isUnderInquiry(c.status)).length;
  const disposedCount = categoryCounts.Disposed;

  // Filtered cases
  const filteredCases = allCases.filter(c => {
    const statusInfo = getStatusTrackingInfo(c.status);
    const matchCategory = categoryFilter === 'All' || statusInfo.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSubType = subTypeFilter === 'All' || c.subType === subTypeFilter;
    const matchUnderInquiry = !underInquiryFilter || isUnderInquiry(c.status);
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
    return matchCategory && matchStatus && matchSubType && matchUnderInquiry && matchSearch;
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
    const html = `
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

    const headers = [
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

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetList.map(c => {
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
    showToast(`Exported ${targetList.length} cases to CSV`);
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
          <title>${meta.title} — ${selectedCaseIds.length > 0 ? 'Selected' : 'Filtered'} Case List (${targetList.length} Cases)</title>
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
              <div class="subtitle">${meta.title} — ${selectedCaseIds.length > 0 ? 'Batch Selected' : 'Filtered'} Case Registry Report</div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <div>Chamber: ${activeCompany?.city || 'Kolkata'}, WB</div>
              <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="meta-box">
            <div><strong>Report Scope:</strong> ${activeFilterLabel}${searchLabel}</div>
            <div><strong>Exporting:</strong> ${targetList.length} of ${allCases.length} Total Cases</div>
          </div>

          <table>
            <thead>
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
      {/* Sub Menu Header: Clean, iconic, NO descriptive things, ONLY Case Entry + button on right top */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3.5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center -space-x-2 shrink-0">
            <CompanyLogo company={activeCompany} size="md" className="ring-2 ring-white dark:ring-slate-900 shadow-xs z-10" />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${meta.color} ring-2 ring-white dark:ring-slate-900 shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {language === 'bn' ? meta.bengali : meta.title}
              </h1>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                · {language === 'bn' ? meta.title : meta.bengali}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              <span className="truncate">{meta.forum}</span>
              <span>•</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{allCases.length} Cases</span>
            </div>
          </div>
        </div>

        {/* ONLY Case Entry + button in right top according to case type */}
        <button
          type="button"
          onClick={() => onOpenNewCase(type)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          title={`Enter new ${meta.title}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="whitespace-nowrap font-bold">
            {language === 'bn' ? `+ নতুন ${meta.title}` : `+ New ${meta.title}`}
          </span>
        </button>
      </div>

      {/* Iconic Options Bar: Total, Pending, Under Inquiry, Disposed, + Applicable Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* 1. Total */}
        {(() => {
          const isActive =
            categoryFilter === 'All' &&
            statusFilter === 'All' &&
            subTypeFilter === 'All' &&
            !underInquiryFilter;
          return (
            <div
              onClick={() => {
                setCategoryFilter('All');
                setStatusFilter('All');
                setSubTypeFilter('All');
                setUnderInquiryFilter(false);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-22 sm:h-24 ${
                isActive
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-600/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-mono font-extrabold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {allCases.length}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {language === 'bn' ? 'মোট কেস' : 'Total Cases'}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                  {language === 'bn' ? 'সকল পোর্টফোলিও' : 'Full Register'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. Pending */}
        {(() => {
          const isActive =
            categoryFilter === 'Pending' &&
            !underInquiryFilter &&
            statusFilter === 'All' &&
            subTypeFilter === 'All';
          return (
            <div
              onClick={() => {
                if (isActive) {
                  setCategoryFilter('All');
                } else {
                  setCategoryFilter('Pending');
                  setStatusFilter('All');
                  setSubTypeFilter('All');
                  setUnderInquiryFilter(false);
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-22 sm:h-24 ${
                isActive
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-mono font-extrabold ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {pendingCount}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {language === 'bn' ? 'পেন্ডিং' : 'Pending'}
                </div>
                <div className="text-[9px] text-amber-600 dark:text-amber-400 truncate font-medium">
                  {language === 'bn' ? 'অপেক্ষমাণ' : 'Awaiting Action'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. Under Inquiry */}
        {(() => {
          const isActive = underInquiryFilter;
          return (
            <div
              onClick={() => {
                if (isActive) {
                  setUnderInquiryFilter(false);
                } else {
                  setUnderInquiryFilter(true);
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setSubTypeFilter('All');
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-22 sm:h-24 ${
                isActive
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <FileSearch className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-mono font-extrabold ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {underInquiryCount}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {language === 'bn' ? 'তদন্তাধীন' : 'Under Inquiry'}
                </div>
                <div className="text-[9px] text-sky-600 dark:text-sky-400 truncate font-medium">
                  {language === 'bn' ? 'শুনানি ও তদন্ত' : 'Hearing / Inq.'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. Disposed */}
        {(() => {
          const isActive =
            categoryFilter === 'Disposed' &&
            !underInquiryFilter &&
            statusFilter === 'All' &&
            subTypeFilter === 'All';
          return (
            <div
              onClick={() => {
                if (isActive) {
                  setCategoryFilter('All');
                } else {
                  setCategoryFilter('Disposed');
                  setStatusFilter('All');
                  setSubTypeFilter('All');
                  setUnderInquiryFilter(false);
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-22 sm:h-24 ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-mono font-extrabold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {disposedCount}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {language === 'bn' ? 'নিষ্পত্তি' : 'Disposed'}
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                  {language === 'bn' ? 'রায় ও সমাপ্ত' : 'Final Order'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 5, 6, 7. Applicable Stage Options according to Case Type */}
        {applicableStages.map(st => {
          const StageIcon = st.icon;
          const isActive =
            st.filterMode === 'status'
              ? statusFilter === st.value && !underInquiryFilter
              : subTypeFilter === st.value && !underInquiryFilter;

          return (
            <div
              key={st.id}
              onClick={() => {
                if (st.filterMode === 'status') {
                  if (isActive) {
                    setStatusFilter('All');
                  } else {
                    setStatusFilter(st.value);
                    setCategoryFilter('All');
                    setSubTypeFilter('All');
                    setUnderInquiryFilter(false);
                  }
                } else if (st.filterMode === 'subtype') {
                  if (isActive) {
                    setSubTypeFilter('All');
                  } else {
                    setSubTypeFilter(st.value);
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setUnderInquiryFilter(false);
                  }
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-22 sm:h-24 ${
                isActive
                  ? `${st.activeBorder} ${st.activeBg} ring-2 ${st.activeRing} shadow-xs`
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-lg ${st.iconBg} ${st.iconColor} flex items-center justify-center`}>
                  <StageIcon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-mono font-extrabold ${isActive ? st.badgeActiveText : 'text-slate-800 dark:text-slate-200'}`}>
                  {st.count}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {st.label}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                  {st.subLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Case List / Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Controls header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Top Row: Search input + Sub-Type Dropdown + Status Filter Dropdown + Reset + Batch + View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Dropdown & Quick Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="case-status-filter-select"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Filter by Status:</span>
              </label>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  id="case-status-filter-select"
                  value={
                    statusFilter !== 'All'
                      ? `status:${statusFilter}`
                      : categoryFilter !== 'All'
                      ? `category:${categoryFilter}`
                      : 'all'
                  }
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'all') {
                      setCategoryFilter('All');
                      setStatusFilter('All');
                    } else if (val.startsWith('category:')) {
                      setCategoryFilter(val.replace('category:', '') as any);
                      setStatusFilter('All');
                    } else if (val.startsWith('status:')) {
                      setStatusFilter(val.replace('status:', ''));
                      setCategoryFilter('All');
                    }
                  }}
                  className="pl-3 pr-8 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs appearance-none min-w-[170px]"
                >
                  <option value="all">All Statuses ({categoryCounts.All})</option>
                  <optgroup label="Tracking Categories">
                    <option value="category:Pending">🟡 Pending ({categoryCounts.Pending})</option>
                    <option value="category:In Progress">🔵 In Progress ({categoryCounts['In Progress']})</option>
                    <option value="category:Disposed">🟢 Disposed ({categoryCounts.Disposed})</option>
                  </optgroup>
                  <optgroup label="Specific Case Stages">
                    {meta.statuses.map(s => (
                      <option key={s} value={`status:${s}`}>
                        {s} ({statusCounts[s] || 0})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sub-type filter dropdown */}
              <div className="relative">
                <select
                  value={subTypeFilter}
                  onChange={e => setSubTypeFilter(e.target.value)}
                  className="pl-2.5 pr-7 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs appearance-none max-w-[170px]"
                  title="Filter by Case Sub-Type"
                >
                  <option value="All">All Sub-Types</option>
                  {meta.subTypes.map(st => (
                    <option key={st} value={st}>
                      {st} ({allCases.filter(c => c.subType === st).length})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* Quick Tracking Category Pills */}
              <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('All');
                    setStatusFilter('All');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    categoryFilter === 'All' && statusFilter === 'All'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All ({categoryCounts.All})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('Pending');
                    setStatusFilter('All');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    categoryFilter === 'Pending'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Pending ({categoryCounts.Pending})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('In Progress');
                    setStatusFilter('All');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    categoryFilter === 'In Progress'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>In Progress ({categoryCounts['In Progress']})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('Disposed');
                    setStatusFilter('All');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    categoryFilter === 'Disposed'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Disposed ({categoryCounts.Disposed})</span>
                </button>
              </div>

              {/* Reset filter button if any active filter */}
              {(categoryFilter !== 'All' || statusFilter !== 'All' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('All');
                    setStatusFilter('All');
                    setSearch('');
                  }}
                  className="px-2 py-1 text-xs font-semibold rounded-md text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[11px]">Clear</span>
                </button>
              )}
            </div>

            {/* View Mode Toggle and Batch Selection Mode Button */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Batch Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsBatchMode(prev => {
                    if (prev) {
                      setSelectedCaseIds([]);
                    }
                    return !prev;
                  });
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isBatchMode
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
                title="Toggle Batch Selection Mode to update status or delete multiple cases in one go"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isBatchMode ? 'Exit Batch' : 'Batch Select'}</span>
                {selectedCaseIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-[10px] font-extrabold ml-0.5">
                    {selectedCaseIds.length}
                  </span>
                )}
              </button>

              {/* View Mode Toggle: Grid Cards vs Table */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title="View as Case Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  title="View as Table"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-status chips + search + count indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{filteredCases.length}</span> of {allCases.length} cases
              </span>
              {(categoryFilter !== 'All' || statusFilter !== 'All') && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Filtered by: {statusFilter !== 'All' ? statusFilter : categoryFilter}
                </span>
              )}

              {/* Quick Export & Tool buttons for filtered list */}
              <div className="flex items-center gap-1 sm:ml-2">
                {type !== 'mutation' && onOpenAiDraft && (
                  <button
                    type="button"
                    onClick={() => onOpenAiDraft(type)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.8 text-[11px] font-bold rounded-md bg-violet-600 hover:bg-violet-700 text-white shadow-2xs transition-colors cursor-pointer"
                    title={`Open AI Drafting Studio for ${meta.title}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'bn' ? 'এআই ড্রাফট' : 'AI Draft'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={exportFilteredCasesCSV}
                  className="inline-flex items-center gap-1 px-2 py-0.8 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                  title="Export filtered case list to CSV spreadsheet"
                >
                  <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportFilteredCasesPDF}
                  className="inline-flex items-center gap-1 px-2 py-0.8 text-[11px] font-bold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors shadow-2xs cursor-pointer"
                  title="Print filtered case list or Save as PDF"
                >
                  <Printer className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search case, party, Mouza, Dag..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Batch Actions Toolbar (Visible when isBatchMode is true) */}
        {isBatchMode && (
          <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/80 dark:via-indigo-950/70 dark:to-blue-950/80 border-b border-blue-200 dark:border-blue-900 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Select / Deselect All Button */}
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-2.5 py-1 text-xs font-bold rounded-md bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 flex items-center gap-1.5 shadow-2xs cursor-pointer"
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

            {/* Batch Action Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Batch Status Update */}
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
                  title="Update status for selected cases"
                >
                  Apply Status
                </button>
              </div>

              {/* Batch Export CSV */}
              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={exportFilteredCasesCSV}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Export selected cases to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>CSV ({selectedCaseIds.length})</span>
              </button>

              {/* Batch Export PDF */}
              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={exportFilteredCasesPDF}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Print selected cases as PDF report"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PDF ({selectedCaseIds.length})</span>
              </button>

              {/* Batch Delete */}
              <button
                type="button"
                disabled={selectedCaseIds.length === 0}
                onClick={() => setBatchDeleteModalOpen(true)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Delete all selected cases"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedCaseIds.length})</span>
              </button>

              {/* Exit Batch Mode */}
              <button
                type="button"
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedCaseIds([]);
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                title="Exit Batch Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Mode: Cards Grid vs Table */}
        {filteredCases.length > 0 ? (
          viewMode === 'grid' ? (
            /* Cards View with Color-Coded Status Badges & Batch Selection */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCases.map(c => {
                const statusInfo = getStatusTrackingInfo(c.status);
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
                      {/* Top Header of Card: Case No & Visual Status Indicator Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Batch Checkbox */}
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
                              title={isSelected ? 'Deselect case' : 'Select case'}
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

                        {/* Visual Status Indicator with Color-Coded Badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border shrink-0 ${statusInfo.badgeClass}`}
                          title={`Status: ${statusInfo.label} (${statusInfo.category})`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                          <span className="uppercase text-[9px] font-extrabold tracking-wider">
                            {statusInfo.category}
                          </span>
                          <span>·</span>
                          <span className="truncate max-w-[90px]">{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Party Info */}
                      <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-start gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                              {c.party}
                            </span>
                            {c.opp && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                                vs {c.opp}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Forum */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <Gavel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.forum || 'West Bengal Revenue Forum'}</span>
                        </div>

                        {/* Land Schedule */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{scheduleSummary}</span>
                        </div>
                      </div>

                      {/* Dates Strip */}
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

                    {/* Card Actions Footer */}
                    <div
                      className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {['mutation', 'misc', 'lrappeal', 'lrtt'].includes(c.type) && onOpenChainDeed && (
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
                        {c.type !== 'mutation' && onOpenAiDraft && (
                          <button
                            type="button"
                            onClick={() => onOpenAiDraft(c.type, c)}
                            className="px-2 py-1 rounded bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Draft with AI"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Draft</span>
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
            /* Table View with Status Indicators & Batch Checkbox Column */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {isBatchMode && (
                      <th className="py-3 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors cursor-pointer mx-auto bg-white dark:bg-slate-800"
                          title="Toggle Select All Filtered Cases"
                        >
                          {selectedCaseIds.length === filteredCases.length && filteredCases.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="py-3 px-4">Case No</th>
                    <th className="py-3 px-4">Sub-Type</th>
                    <th className="py-3 px-4">Petitioner / Opposite</th>
                    <th className="py-3 px-4">Forum</th>
                    <th className="py-3 px-4">Land Mouza / Dag</th>
                    <th className="py-3 px-4">Next Hearing</th>
                    <th className="py-3 px-4">Tracking Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCases.map(c => {
                    const statusInfo = getStatusTrackingInfo(c.status);
                    const scheduleSummary =
                      c.landSchedules.length > 0
                        ? `${c.landSchedules[0].mouza} (Dag ${c.landSchedules[0].dag})`
                        : '—';
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
                            className="py-3 px-3 text-center whitespace-nowrap"
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
                              title={isSelected ? 'Deselect case' : 'Select case'}
                            >
                              {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                            </button>
                          </td>
                        )}
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                          {c.caseNo || c.docketNo || 'RTI Application'}
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
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusInfo.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            <span className="uppercase text-[9px] opacity-80">{statusInfo.category}</span>
                            <span>·</span>
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>
                        <td
                          className="py-3 px-4 text-right whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {['mutation', 'misc', 'lrappeal', 'lrtt'].includes(c.type) && onOpenChainDeed && (
                              <button
                                onClick={() => onOpenChainDeed(c)}
                                className="p-1 rounded text-blue-600 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"
                                title="Make / View Chain Deed Statement"
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
                              className="p-1 rounded text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors cursor-pointer"
                              title="Edit Case"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => printCaseSummary(c)}
                              className="p-1 rounded text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                              title="Print Case File Sheet"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSingleCaseToDelete(c)}
                              className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm cursor-pointer"
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
