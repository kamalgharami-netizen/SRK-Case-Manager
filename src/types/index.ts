export type Role = 'Admin' | 'Junior Advocate' | 'Clerk' | 'Accountant';

export type CaseType =
  | 'mutation'
  | 'misc'
  | 'lrappeal'
  | 'firstappeal'
  | 'rti'
  | 'lrtt'
  | 'conversion';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  password?: string;
  isMain?: boolean;
  createdAt: number;
}

export interface LandSchedule {
  id: string;
  district: string;
  block: string;
  mouza: string;
  jl: string;
  khatian: string;
  dag: string;
  area: string;
  unit: 'acre' | 'bigha' | 'katha' | 'satak' | 'sqft' | 'decimal';
  classification: string;
}

export interface Applicant {
  id: string;
  name: string;
  father: string;
  age?: string;
  address: string;
  phone?: string;
}

export interface Respondent {
  id: string;
  name: string;
  father?: string;
  type: 'Private' | 'State' | 'Govt Dept';
  address: string;
  phone?: string;
}

export interface HearingDateItem {
  id: string;
  date: string;
  stage?: string;
}

export interface AddressItem {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pin: string;
  state: string;
}

export interface ChainLink {
  id: string;
  linkType?: 'deed' | 'warish';
  deedNo?: string;
  deedDate?: string;
  deedYear?: string;
  deedType?: string;
  vendor: string;
  purchaser: string;
  vendors?: string[];
  purchasers?: string[];
  warishNames?: string[];
  area?: string;
  consideration?: string;
  registrationOffice?: string;
  warishDetails?: string;
  certificateRef?: string;
  notes?: string;
}

export const WB_DEED_TYPES = [
  'সাফ কোবালা (Sale / Kobala)',
  'হেবা বিল এওয়াজ (Heba-bil-Ewaz)',
  'দানপত্র (Gift Deed)',
  'বণ্টননামা (Partition Deed)',
  'এওয়াজ বদল (Exchange Deed)',
  'উইল / অছিয়তনামা (Will / Probate)',
  'ডিক্রি / নিলাম সার্টিফিকেট (Court Decree / Auction Certificate)',
  'অন্যান্য দলিল (Other Deed)'
] as const;

export interface CaseAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'img' | 'other';
  date: string;
  category?: string;
}

export interface CaseItem {
  id: string;
  type: CaseType;
  caseNo: string;
  subType: string;
  status: string;
  party: string;
  opp: string;
  forum: string;
  filingDate: string;
  nextDate: string;
  hearingDates?: string[];
  hearingList?: HearingDateItem[];
  priority?: 'Normal' | 'High' | 'Urgent';
  appNo?: string;
  grnNo?: string;
  docketNo?: string;
  impugnedOrderNo?: string;
  impugnedOrderDate?: string;
  grounds?: string;
  bench?: string;
  targetOfficer?: string;
  notes?: string;
  // Applicant Deed Particulars
  applicantDeedNo?: string;
  applicantDeedYear?: string;
  applicantDeedType?: string;
  applicantAdsr?: string;
  // Broker / Muhuri (Omitted from client/court prints; shown only in report & entry)
  brokerName?: string;
  brokerPhone?: string;
  recordedOwner?: string;
  recordedKhatian?: string;
  recordedDag?: string;
  landSchedules: LandSchedule[];
  applicants: Applicant[];
  respondents: Respondent[];
  addresses: AddressItem[];
  chainLinks: ChainLink[];
  chainDeedDraft?: string;
  attachments: CaseAttachment[];
  createdAt: number;
  createdBy: string;
}

export interface CauseItem {
  id: string;
  time: string;
  caseNo: string;
  forum: string;
  party: string;
  status: 'READY' | 'PENDING' | 'ADJOURNED' | 'DISPOSED';
  date: string;
  benchRoom?: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'Client' | 'Opposite Party' | 'Advocate' | 'Vendor';
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: number;
  createdBy: string;
}

export interface VaultFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'img' | 'other';
  date: string;
  category: string;
  aiLearned?: boolean;
}

export interface DiaryEntry {
  id: string;
  caseId: string;
  date: string;
  type: 'Hearing' | 'Order Passed' | 'Filing' | 'Notice Received' | 'Consultation';
  title: string;
  body: string;
  nextDate?: string;
}

export interface ActivityLogItem {
  id: string;
  time: number;
  text: string;
  userName: string;
  role: string;
}

export interface MessageItem {
  id: string;
  partyId: string;
  partyName: string;
  phone: string;
  body: string;
  timestamp: number;
  channel: 'WhatsApp' | 'SMS';
}

export interface SampleDraftItem {
  id: string;
  category: 'chain' | 'mutation' | 'misc' | 'lrappeal' | 'firstappeal' | 'rti' | 'conversion' | 'lrtt' | 'general';
  title: string;
  description: string;
  templateText: string;
  lastUpdated: number;
  aiAssisted?: boolean;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  barCouncil: string;
  gst?: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
  email: string;
  logoUrl?: string;
  logoBadge?: 'scales' | 'pillar' | 'gavel' | 'shield' | 'book' | 'ashoka';
  logoColor?: string;
  createdAt: number;
  users: User[];
  cases: CaseItem[];
  parties: Party[];
  vaultFiles: VaultFile[];
  causeList: CauseItem[];
  diaryData: Record<string, DiaryEntry[]>;
  messages: MessageItem[];
  activityLog: ActivityLogItem[];
  chainSampleTemplate?: string;
  sampleDrafts?: SampleDraftItem[];
  lastBackupDate?: number;
}

export interface BackupStatusInfo {
  lastBackupDate: number | null;
  daysSinceBackup: number;
  isOverdue: boolean;
  statusText: string;
}

export function getBackupStatus(company?: Company | null): BackupStatusInfo {
  if (!company) {
    return { lastBackupDate: null, daysSinceBackup: 0, isOverdue: false, statusText: 'No chamber loaded' };
  }
  let ts = company.lastBackupDate;
  if (!ts && typeof window !== 'undefined') {
    const stored = localStorage.getItem(`srk_last_backup_${company.id}`);
    if (stored) {
      ts = parseInt(stored, 10);
    }
  }

  if (!ts) {
    const createdAgoDays = Math.floor((Date.now() - (company.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
    const effectiveDays = Math.max(createdAgoDays, 8);
    return {
      lastBackupDate: null,
      daysSinceBackup: effectiveDays,
      isOverdue: true,
      statusText: 'Never backed up'
    };
  }

  const daysSinceBackup = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  const isOverdue = daysSinceBackup >= 7;

  return {
    lastBackupDate: ts,
    daysSinceBackup,
    isOverdue,
    statusText: daysSinceBackup === 0 ? 'Backed up today' : `${daysSinceBackup} days ago`
  };
}

export interface AppData {
  companies: Company[];
  activeCompanyId: string | null;
  activeUserId: string | null;
}

export interface StatusTrackingInfo {
  category: 'Pending' | 'In Progress' | 'Disposed';
  badgeClass: string;
  dotClass: string;
  label: string;
}

export function getStatusTrackingInfo(status?: string): StatusTrackingInfo {
  const norm = (status || '').toLowerCase().trim();

  if (['allowed', 'disposed', 'dismissed', 'rejected', 'order passed', 'complete', 'inquiry complete'].includes(norm)) {
    if (['rejected', 'dismissed'].includes(norm)) {
      return {
        category: 'Disposed',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        dotClass: 'bg-rose-500',
        label: status || 'Disposed'
      };
    }
    return {
      category: 'Disposed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
      label: status || 'Disposed'
    };
  }

  if (['hearing', 'notice issued', 'stay granted', 'admitted', 'inquiry pending', 'in progress'].includes(norm)) {
    return {
      category: 'In Progress',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      dotClass: 'bg-blue-500',
      label: status || 'In Progress'
    };
  }

  return {
    category: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-500',
    label: status || 'Pending'
  };
}
