import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CaseType,
  CaseItem,
  LandSchedule,
  Applicant,
  Respondent,
  AddressItem,
  ChainLink,
  CaseAttachment,
  Party,
  HearingDateItem
} from '../types';
import { wbDistricts } from '../data/wbDistricts';
import { ChainDeedModal } from './ChainDeedModal';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Paperclip,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Users,
  UserCheck,
  ArrowRight,
  Scroll,
  Search,
  Printer,
  X,
  Phone,
  Building,
  UserPlus,
  Calendar,
  Layers
} from 'lucide-react';

export const WB_DEED_TYPES = [
  'সাফ কোবালা (Sale / Kobala)',
  'দানপত্র (Gift Deed)',
  'হেবা বিল এওয়াজ (Heba-bil-Ewaz)',
  'হেবা ঘোষণা (Declaration of Heba)',
  'বণ্টননামা / বাটোয়ারা (Partition Deed)',
  'উইল / অসিয়তনামা / প্রোবেট (Will / Probate)',
  'এওয়াজ বদল (Exchange Deed)',
  'আদালত ডিক্রি / নিলাম (Court Decree / Auction Certificate)',
  'অন্যান্য দলিল (Other Deed)'
];

interface CaseEntryFormProps {
  type: CaseType;
  editingCase?: CaseItem | null;
  onBack: () => void;
  onSaved: (savedCase: CaseItem, openChainDeed?: boolean) => void;
  onOpenAiDraft?: (type: CaseType, prefilledData: Partial<CaseItem>) => void;
}

const FORUMS_BY_TYPE: Record<CaseType, string[]> = {
  mutation: ['BL&LRO', 'SDL&LRO', 'DL&LRO'],
  misc: ['BL&LRO', 'SDL&LRO', 'DL&LRO'],
  lrappeal: ['DL&LRO', 'Additional District Magistrate (L&LR)', 'WBLRTT'],
  firstappeal: [
    'First Appellate Authority (FAA) / DL&LRO',
    'First Appellate Authority (FAA) / SDL&LRO',
    'First Appellate Authority (FAA) / BL&LRO',
    'Additional District Magistrate (L&LR)',
    'Divisional Commissioner',
    'Appellate Authority'
  ],
  rti: [
    'Police Station (SPIO / Officer-in-Charge)',
    'Block Development Officer (BDO)',
    'Gram Panchayat (Prodhan / Secretary)',
    'Municipality / Municipal Corporation',
    'SPIO / BL&LRO',
    'SPIO / SDL&LRO',
    'SPIO / DL&LRO',
    'Sub-Divisional Officer (SDO)',
    'District Magistrate (DM) Office',
    'ADSR / Sub-Registry Office',
    'First Appellate Authority (FAA)',
    'State Information Commission (SIC)'
  ],
  lrtt: ['Division Bench - I, WBLRTT', 'Division Bench - II, WBLRTT'],
  conversion: ['DL&LRO', 'SDL&LRO']
};

const SUBTYPES_BY_TYPE: Record<CaseType, string[]> = {
  mutation: [
    'Purchase Mutation',
    'Inheritance Mutation',
    'Gift Deed Mutation',
    'Court Decree Mutation'
  ],
  misc: [
    '10000 Share Overlapping / Share Problem (১০,০০০ অংশ সমাধান)',
    'Barga Revoke / De-recording of Bargadar (বর্গা রেকর্ড রদ / সংশোধন)',
    'Name Correction (নাম / পদবী সংশোধন)',
    'Share Correction / Area Rectification (অংশ ও পরিমাণ ত্রুটি সংশোধন)',
    'RS to LR Conveyance / Transfer Mapping (আর.এস. হইতে এল.আর. হস্তান্তর সমন্বয়)',
    'Record Correction / Erroneous Record (ভুল রেকর্ড সংশোধন - Sec 50/51A)',
    'Boundary Dispute / Demarcation (সীমানা বিবাদ / ডিমারকেশন)',
    'Classification Correction / Porcha Rectification (শ্রেণি পরিবর্তন / পর্চা সংশোধন)',
    'Vested Land / Ceiling Objection (ভেস্টেড / সিলিং আপত্তি সংশোধন)',
    'Other Miscellaneous Petition (অন্যান্য মিস কেস)'
  ],
  lrappeal: ['Section 54 Appeal', 'Section 51A(5) Appeal', 'Delay Condonation'],
  firstappeal: [
    'u/s 19(1) of RTI Act 2005',
    'u/s 19(2) of RTI Act 2005',
    'Other Applicable Section of RTI Act 2005'
  ],
  rti: [
    'RTI Application u/s 6(1)',
    'RTI First Appeal u/s 19(1)',
    'Second Appeal u/s 19(3)',
    'Certified Copy of ROR/Khatian Query',
    'Vested Land Record Query',
    'Inquiry Report Request'
  ],
  lrtt: [
    '10000 Share Problem',
    'Record Correction',
    'Name Correction',
    'RS to LR Conveyance',
    'Appeal against Order'
  ],
  conversion: [
    'Sali to Bastu',
    'Danga to Bastu',
    'Pond to Bastu',
    'Agricultural to Commercial',
    'Other'
  ]
};

// Requirement 6: Added 'Inquiry Pending' and 'Inquiry Complete' to mutation case statuses
const STATUSES_BY_TYPE: Record<CaseType, string[]> = {
  mutation: [
    'Filed',
    'Inquiry Pending',
    'Inquiry Complete',
    'Notice Issued',
    'Hearing',
    'Order Reserved',
    'Allowed',
    'Rejected'
  ],
  misc: ['Filed', 'Inquiry Pending', 'Inquiry Complete', 'Notice Issued', 'Hearing', 'Order Reserved', 'Disposed'],
  lrappeal: ['Filed', 'Admitted', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
  firstappeal: ['Filed', 'Admitted', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
  rti: ['Application Sent', 'PIO Replied', 'Info Provided', 'First Appeal Filed', 'Hearing', 'Disposed'],
  lrtt: ['OA Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Allowed', 'Dismissed'],
  conversion: ['Applied', 'Site Verified', 'Report Submitted', 'Order Passed', 'Rejected']
};

export const CaseEntryForm: React.FC<CaseEntryFormProps> = ({
  type,
  editingCase,
  onBack,
  onSaved,
  onOpenAiDraft
}) => {
  const { addCase, updateCase, showToast, activeCompany, addParty, sampleDrafts } = useApp();

  // Active editing tracking (from props or from search box)
  const [activeEditingCase, setActiveEditingCase] = useState<CaseItem | null>(editingCase || null);

  const isMisc = type === 'misc';
  const isLrAppeal = type === 'lrappeal';
  const isFirstAppeal = type === 'firstappeal';
  const isRti = type === 'rti';
  const isDocketBased = isMisc || isLrAppeal || isFirstAppeal || isRti;
  const isGrnOmitted = isMisc || isLrAppeal || isRti;
  const isChainDeedHidden = isRti || isFirstAppeal;
  const isMutation = type === 'mutation';

  // Search box for updating existing data through deed no, app no / docket no, applicant name, case no
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Requirement 3: Mutation case no starts with MN/, Misc case no starts with MISC/
  const defaultCaseNo = () => {
    if (editingCase?.caseNo) return editingCase.caseNo;
    if (type === 'mutation') {
      return `MN/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    }
    if (type === 'misc') {
      return `MISC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    }
    if (type === 'lrappeal') {
      return `LRA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    }
    if (type === 'firstappeal') {
      return `FA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    }
    return '';
  };

  // Requirement 2: mutation application no starts with MUTE
  const defaultAppNo = () => {
    if (editingCase?.appNo) return editingCase.appNo;
    if (type === 'mutation') {
      return `MUTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return '';
  };

  // Requirement 1 for Misc, LR Appeal & First Appeal: Docket No starts with DOC
  const defaultDocketNo = () => {
    if (editingCase?.docketNo) return editingCase.docketNo;
    if (type === 'misc' || type === 'lrappeal' || type === 'firstappeal') {
      return `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return '';
  };

  // Basic Details
  const [caseNo, setCaseNo] = useState(defaultCaseNo);
  const [subType, setSubType] = useState(
    editingCase?.subType || SUBTYPES_BY_TYPE[type][0] || ''
  );
  const [status, setStatus] = useState(
    editingCase?.status || STATUSES_BY_TYPE[type][0] || ''
  );
  const [party, setParty] = useState(editingCase?.party || '');
  const [opp, setOpp] = useState(type === 'rti' ? '' : (editingCase?.opp || ''));
  const [forum, setForum] = useState(
    editingCase?.forum !== undefined
      ? editingCase.forum
      : type === 'rti'
      ? ''
      : FORUMS_BY_TYPE[type][0] || ''
  );
  const [filingDate, setFilingDate] = useState(
    editingCase?.filingDate || new Date().toISOString().slice(0, 10)
  );
  const [nextDate, setNextDate] = useState(editingCase?.nextDate || '');

  // Requirement 6: Multiple hearing dates with + button
  const [hearingList, setHearingList] = useState<HearingDateItem[]>(() => {
    if (editingCase?.hearingList && editingCase.hearingList.length > 0) {
      return editingCase.hearingList;
    }
    if (editingCase?.hearingDates && editingCase.hearingDates.length > 0) {
      return editingCase.hearingDates.map((d, i) => ({
        id: `hd_${i}_${Date.now()}`,
        date: d,
        stage: i === 0 ? 'Hearing / Inquiry' : `Hearing #${i + 1}`
      }));
    }
    if (editingCase?.nextDate) {
      return [{ id: 'hd_init', date: editingCase.nextDate, stage: 'Next Hearing' }];
    }
    return [{ id: 'hd_init', date: '', stage: 'Hearing / Inquiry' }];
  });

  const addHearingDate = () => {
    setHearingList(prev => [
      ...prev,
      {
        id: `hd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: '',
        stage: `Hearing #${prev.length + 1}`
      }
    ]);
  };

  const updateHearingDate = (idx: number, field: 'date' | 'stage', val: string) => {
    setHearingList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      if (field === 'date' && idx === 0) {
        setNextDate(val);
      }
      return copy;
    });
  };

  const removeHearingDate = (idx: number) => {
    setHearingList(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      const res = filtered.length > 0 ? filtered : [{ id: `hd_${Date.now()}`, date: '', stage: 'Hearing' }];
      setNextDate(res.find(h => h.date)?.date || '');
      return res;
    });
  };

  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>(
    editingCase?.priority || 'Normal'
  );
  const [appNo, setAppNo] = useState(defaultAppNo);
  const [grnNo, setGrnNo] = useState(editingCase?.grnNo || '');
  const [docketNo, setDocketNo] = useState(defaultDocketNo);
  const [impugnedOrderNo, setImpugnedOrderNo] = useState(
    editingCase?.impugnedOrderNo || ''
  );
  const [impugnedOrderDate, setImpugnedOrderDate] = useState(
    editingCase?.impugnedOrderDate || ''
  );
  const [grounds, setGrounds] = useState(editingCase?.grounds || '');
  const [bench, setBench] = useState(editingCase?.bench || '');
  const [targetOfficer, setTargetOfficer] = useState(
    editingCase?.targetOfficer || ''
  );
  const [notes, setNotes] = useState(editingCase?.notes || '');

  // Requirement 9: Applicant's Deed Details
  const [applicantDeedNo, setApplicantDeedNo] = useState(editingCase?.applicantDeedNo || '');
  const [applicantDeedYear, setApplicantDeedYear] = useState(editingCase?.applicantDeedYear || '');
  const [applicantDeedType, setApplicantDeedType] = useState(
    editingCase?.applicantDeedType || 'সাফ কোবালা (Sale / Kobala)'
  );
  const [applicantAdsr, setApplicantAdsr] = useState(editingCase?.applicantAdsr || '');

  // Requirement 10: Broker / Muhuri Name & Phone (Omitted from client/court prints; shown only in report & entry)
  const [brokerName, setBrokerName] = useState(editingCase?.brokerName || '');
  const [brokerPhone, setBrokerPhone] = useState(editingCase?.brokerPhone || '');

  // Party Autocomplete suggestions
  const [partySuggestions, setPartySuggestions] = useState<Party[]>([]);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);

  // Sub-collections
  const [landSchedules, setLandSchedules] = useState<LandSchedule[]>(
    editingCase?.landSchedules || [
      {
        id: 'ls_init',
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: '',
        jl: '',
        khatian: '',
        dag: '',
        area: '',
        unit: 'acre',
        classification: 'Bastu'
      }
    ]
  );

  const [applicants, setApplicants] = useState<Applicant[]>(
    editingCase?.applicants || [
      {
        id: 'app_init',
        name: '',
        father: '',
        age: '',
        address: '',
        phone: ''
      }
    ]
  );

  const isMutationOrMisc = type === 'mutation' || type === 'misc';

  const [respondents, setRespondents] = useState<Respondent[]>(() => {
    if (type === 'rti') {
      return [];
    }
    if (editingCase?.respondents && editingCase.respondents.length > 0) {
      return editingCase.respondents;
    }
    if (isMutationOrMisc) {
      if (editingCase?.opp && editingCase.opp.trim() && editingCase.opp !== 'The State of West Bengal') {
        return [
          {
            id: 'resp_' + Date.now(),
            name: editingCase.opp,
            father: '',
            type: 'Private',
            address: '',
            phone: ''
          }
        ];
      }
      return [];
    }
    return [
      {
        id: 'resp_init',
        name: 'The State of West Bengal',
        father: '',
        type: 'State',
        address: '',
        phone: ''
      }
    ];
  });

  // Recorded Owner (Kept for Misc / Appeal, but omitted for Mutation as per Requirement 13)
  const [recordedOwner, setRecordedOwner] = useState(editingCase?.recordedOwner || '');
  const [recordedKhatian, setRecordedKhatian] = useState(
    editingCase?.recordedKhatian || editingCase?.landSchedules?.[0]?.khatian || ''
  );
  const [recordedDag, setRecordedDag] = useState(
    editingCase?.recordedDag || editingCase?.landSchedules?.[0]?.dag || ''
  );

  const [addresses, setAddresses] = useState<AddressItem[]>(
    editingCase?.addresses || []
  );

  // Chain of Title Links with multiple sellers/donors, buyers, and warish names
  const [chainLinks, setChainLinks] = useState<ChainLink[]>(() => {
    const raw = editingCase?.chainLinks || [];
    return raw.map(l => ({
      ...l,
      vendors: l.vendors && l.vendors.length > 0 ? l.vendors : (l.vendor ? [l.vendor] : ['']),
      purchasers: l.purchasers && l.purchasers.length > 0 ? l.purchasers : (l.purchaser ? [l.purchaser] : ['']),
      warishNames: l.warishNames && l.warishNames.length > 0 ? l.warishNames : (l.purchaser ? [l.purchaser] : [''])
    }));
  });

  const [attachments, setAttachments] = useState<CaseAttachment[]>(
    editingCase?.attachments || []
  );

  // Chain verification & modal states
  const [chainSummaryHtml, setChainSummaryHtml] = useState<string>('');
  const [chainGaps, setChainGaps] = useState<string[]>([]);
  const [postSaveCase, setPostSaveCase] = useState<CaseItem | null>(null);
  const [activeChainDeedModalCase, setActiveChainDeedModalCase] = useState<CaseItem | null>(null);

  // Synchronize when editingCase prop changes
  useEffect(() => {
    if (editingCase) {
      loadCaseDataIntoForm(editingCase);
    }
  }, [editingCase]);

  // Load case into form (used by Search Box and Props)
  const loadCaseDataIntoForm = (targetCase: CaseItem) => {
    setActiveEditingCase(targetCase);
    setCaseNo(targetCase.caseNo);
    setSubType(targetCase.subType);
    setStatus(targetCase.status);
    setParty(targetCase.party);
    setOpp(targetCase.opp);
    setForum(targetCase.forum);
    setFilingDate(targetCase.filingDate);
    setNextDate(targetCase.nextDate || '');
    setPriority(targetCase.priority || 'Normal');
    setAppNo(targetCase.appNo || '');
    setGrnNo(targetCase.grnNo || '');
    setDocketNo(targetCase.docketNo || '');
    setImpugnedOrderNo(targetCase.impugnedOrderNo || '');
    setImpugnedOrderDate(targetCase.impugnedOrderDate || '');
    setGrounds(targetCase.grounds || '');
    setBench(targetCase.bench || '');
    setTargetOfficer(targetCase.targetOfficer || '');
    setNotes(targetCase.notes || '');

    setApplicantDeedNo(targetCase.applicantDeedNo || '');
    setApplicantDeedYear(targetCase.applicantDeedYear || '');
    setApplicantDeedType(targetCase.applicantDeedType || 'সাফ কোবালা (Sale / Kobala)');
    setApplicantAdsr(targetCase.applicantAdsr || '');
    setBrokerName(targetCase.brokerName || '');
    setBrokerPhone(targetCase.brokerPhone || '');

    setRecordedOwner(targetCase.recordedOwner || '');
    setRecordedKhatian(targetCase.recordedKhatian || '');
    setRecordedDag(targetCase.recordedDag || '');

    if (targetCase.landSchedules && targetCase.landSchedules.length > 0) {
      setLandSchedules(targetCase.landSchedules);
    }
    if (targetCase.applicants && targetCase.applicants.length > 0) {
      setApplicants(targetCase.applicants);
    }
    if (targetCase.respondents && targetCase.respondents.length > 0) {
      setRespondents(targetCase.respondents);
    }
    if (targetCase.chainLinks && targetCase.chainLinks.length > 0) {
      setChainLinks(
        targetCase.chainLinks.map(l => ({
          ...l,
          vendors: l.vendors && l.vendors.length > 0 ? l.vendors : (l.vendor ? [l.vendor] : ['']),
          purchasers: l.purchasers && l.purchasers.length > 0 ? l.purchasers : (l.purchaser ? [l.purchaser] : ['']),
          warishNames: l.warishNames && l.warishNames.length > 0 ? l.warishNames : (l.purchaser ? [l.purchaser] : [''])
        }))
      );
    }
    if (targetCase.attachments) {
      setAttachments(targetCase.attachments);
    }
    if (targetCase.hearingList && targetCase.hearingList.length > 0) {
      setHearingList(targetCase.hearingList);
    } else if (targetCase.hearingDates && targetCase.hearingDates.length > 0) {
      setHearingList(
        targetCase.hearingDates.map((d, i) => ({
          id: `hd_${i}_${Date.now()}`,
          date: d,
          stage: i === 0 ? 'Hearing / Inquiry' : `Hearing #${i + 1}`
        }))
      );
    } else if (targetCase.nextDate) {
      setHearingList([{ id: 'hd_init', date: targetCase.nextDate, stage: 'Next Hearing' }]);
    } else {
      setHearingList([{ id: 'hd_init', date: '', stage: 'Hearing / Inquiry' }]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    showToast(`Loaded Case ${targetCase.caseNo} for updating`);
  };

  const handleClearFormToNew = () => {
    setActiveEditingCase(null);
    setCaseNo(
      type === 'mutation'
        ? `MN/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
        : type === 'misc'
        ? `MISC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
        : type === 'lrappeal'
        ? `LRA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
        : type === 'firstappeal'
        ? `FA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
        : ''
    );
    setAppNo(type === 'mutation' ? `MUTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : '');
    setDocketNo(
      type === 'misc' || type === 'lrappeal' || type === 'firstappeal'
        ? `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        : ''
    );
    setParty('');
    setOpp('');
    setGrnNo('');
    setHearingList([{ id: 'hd_init', date: '', stage: 'Hearing / Inquiry' }]);
    setNextDate('');
    setApplicantDeedNo('');
    setApplicantDeedYear('');
    setApplicantDeedType('সাফ কোবালা (Sale / Kobala)');
    setApplicantAdsr('');
    setBrokerName('');
    setBrokerPhone('');
    setChainLinks([]);
    setApplicants([
      { id: 'app_' + Date.now(), name: '', father: '', age: '', address: '', phone: '' }
    ]);
    setRespondents([]);
    showToast('Switched to New Case Entry mode');
  };

  // Filter existing cases for Search Box
  const matchingCases = (activeCompany?.cases || []).filter(c => {
    if (!searchQuery.trim()) return false;
    if (c.type !== type) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchCaseNo = c.caseNo?.toLowerCase().includes(q);
    const matchAppNo = c.appNo?.toLowerCase().includes(q);
    const matchDocketNo = c.docketNo?.toLowerCase().includes(q);
    const matchGrnOrTracking = c.grnNo?.toLowerCase().includes(q);
    const matchParty = c.party?.toLowerCase().includes(q);
    const matchDeed =
      c.applicantDeedNo?.toLowerCase().includes(q) ||
      c.chainLinks?.some(l => l.deedNo?.toLowerCase().includes(q));
    return matchCaseNo || matchAppNo || matchDocketNo || matchGrnOrTracking || matchParty || matchDeed;
  });

  // Handle party name typing and suggestions (Requirement 8)
  const handlePartyChange = (val: string) => {
    setParty(val);
    updateMainApplicantField('name', val);

    if (val.trim().length >= 2 && activeCompany?.parties) {
      const q = val.toLowerCase().trim();
      const matches = activeCompany.parties.filter(p => p.name.toLowerCase().includes(q));
      setPartySuggestions(matches);
      setShowPartySuggestions(matches.length > 0);
    } else {
      setShowPartySuggestions(false);
    }
  };

  const handleSelectPartySuggestion = (selectedParty: Party) => {
    setParty(selectedParty.name);
    updateMainApplicantField('name', selectedParty.name);
    if (selectedParty.phone) updateMainApplicantField('phone', selectedParty.phone);
    if (selectedParty.address) updateMainApplicantField('address', selectedParty.address);
    if (selectedParty.notes && selectedParty.notes.includes('Father:')) {
      const fName = selectedParty.notes.replace('Father:', '').trim();
      updateMainApplicantField('father', fName);
    }
    setShowPartySuggestions(false);
    showToast(`Linked to Party Ledger: ${selectedParty.name}`);
  };

  // Requirement 12: Land Schedule Details with + option to add more schedule
  const addLandSchedule = () => {
    setLandSchedules(prev => [
      ...prev,
      {
        id: 'ls_' + Date.now(),
        district: landSchedules[0]?.district || 'North 24 Parganas',
        block: landSchedules[0]?.block || 'Rajarhat',
        mouza: landSchedules[0]?.mouza || '',
        jl: landSchedules[0]?.jl || '',
        khatian: '',
        dag: '',
        area: '',
        unit: 'acre',
        classification: 'Bastu'
      }
    ]);
    showToast('New property schedule added');
  };

  const removeLandSchedule = (idx: number) => {
    setLandSchedules(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSchedule = (idx: number, field: keyof LandSchedule, val: any) => {
    setLandSchedules(prev =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (field === 'district') {
          const blocks = wbDistricts[val] || [];
          return { ...s, district: val, block: blocks[0] || '' };
        }
        return { ...s, [field]: val };
      })
    );
  };

  // Sync opposite party string from respondents array
  const syncOppFromRespondents = (resps: Respondent[]) => {
    const names = resps.map(r => r.name.trim()).filter(Boolean);
    setOpp(names.join(', '));
  };

  // Requirement 11: Opposite Party / Respondent(s) + option for more respondents and address
  const addRespondent = () => {
    const newResp: Respondent = {
      id: 'resp_' + Date.now(),
      name: '',
      father: '',
      type: 'Private',
      address: '',
      phone: ''
    };
    setRespondents(prev => {
      const updated = [...prev, newResp];
      if (isMutationOrMisc) {
        syncOppFromRespondents(updated);
      }
      return updated;
    });
  };

  const removeRespondent = (idx: number) => {
    setRespondents(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (isMutationOrMisc) {
        syncOppFromRespondents(updated);
      }
      return updated;
    });
  };

  const updateRespondent = (idx: number, field: keyof Respondent, val: any) => {
    setRespondents(prev => {
      const updated = prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r));
      if (isMutationOrMisc && field === 'name') {
        syncOppFromRespondents(updated);
      }
      return updated;
    });
  };

  const updateMainApplicantField = (field: keyof Applicant, val: string) => {
    setApplicants(prev => {
      const first = prev[0] || { id: 'app_1', name: party, father: '', age: '', address: '', phone: '' };
      return [{ ...first, [field]: val }, ...prev.slice(1)];
    });
  };

  // Requirement 14: Chain deed adding + button: chain deed no, deed year, buyer one or more, saler/donor one or more
  const addChainBuyerLink = () => {
    const lastLink = chainLinks[chainLinks.length - 1];
    const defaultVendor = lastLink ? (lastLink.purchasers?.join(', ') || lastLink.purchaser) : (recordedOwner || '');
    setChainLinks(prev => [
      ...prev,
      {
        id: 'cl_' + Date.now(),
        linkType: 'deed',
        deedNo: '',
        deedDate: '',
        deedYear: '',
        deedType: 'সাফ কোবালা (Sale / Kobala)',
        vendor: defaultVendor,
        purchaser: '',
        vendors: defaultVendor ? [defaultVendor] : [''],
        purchasers: [''],
        area: landSchedules[0] ? `${landSchedules[0].area} ${landSchedules[0].unit}` : '',
        consideration: '',
        registrationOffice: applicantAdsr || '',
        notes: ''
      }
    ]);
  };

  // Add / remove multiple sellers/donors in a chain link
  const addVendorToLink = (linkIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const curr = cl.vendors && cl.vendors.length > 0 ? cl.vendors : (cl.vendor ? [cl.vendor] : ['']);
        return { ...cl, vendors: [...curr, ''] };
      })
    );
  };

  const removeVendorFromLink = (linkIdx: number, vIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.vendors || []).filter((_, idx) => idx !== vIdx);
        return { ...cl, vendors: updated, vendor: updated.join(', ') };
      })
    );
  };

  const updateVendorInLink = (linkIdx: number, vIdx: number, val: string) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.vendors || ['']).map((v, idx) => (idx === vIdx ? val : v));
        return { ...cl, vendors: updated, vendor: updated.join(', ') };
      })
    );
  };

  // Add / remove multiple buyers in a chain link
  const addPurchaserToLink = (linkIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const curr = cl.purchasers && cl.purchasers.length > 0 ? cl.purchasers : (cl.purchaser ? [cl.purchaser] : ['']);
        return { ...cl, purchasers: [...curr, ''] };
      })
    );
  };

  const removePurchaserFromLink = (linkIdx: number, pIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.purchasers || []).filter((_, idx) => idx !== pIdx);
        return { ...cl, purchasers: updated, purchaser: updated.join(', ') };
      })
    );
  };

  const updatePurchaserInLink = (linkIdx: number, pIdx: number, val: string) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.purchasers || ['']).map((p, idx) => (idx === pIdx ? val : p));
        return { ...cl, purchasers: updated, purchaser: updated.join(', ') };
      })
    );
  };

  // Requirement 15: Warish adding option with adding option name of the warishes
  const addWarishLink = () => {
    const lastLink = chainLinks[chainLinks.length - 1];
    const defaultDeceased = lastLink ? (lastLink.purchasers?.join(', ') || lastLink.purchaser) : (recordedOwner || '');
    setChainLinks(prev => [
      ...prev,
      {
        id: 'cl_' + Date.now(),
        linkType: 'warish',
        deedNo: '',
        deedDate: '',
        deedYear: '',
        deedType: 'ওয়ারিশান সূত্রে হস্তান্তর',
        vendor: defaultDeceased,
        purchaser: '',
        warishNames: [''],
        area: landSchedules[0] ? `${landSchedules[0].area} ${landSchedules[0].unit}` : '',
        consideration: 'উত্তরাধিকার সূত্রে প্রাপ্ত',
        registrationOffice: '',
        warishDetails: '',
        certificateRef: '',
        notes: ''
      }
    ]);
  };

  const addWarishNameToLink = (linkIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const curr = cl.warishNames && cl.warishNames.length > 0 ? cl.warishNames : (cl.purchaser ? [cl.purchaser] : ['']);
        return { ...cl, warishNames: [...curr, ''] };
      })
    );
  };

  const removeWarishNameFromLink = (linkIdx: number, wIdx: number) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.warishNames || []).filter((_, idx) => idx !== wIdx);
        return { ...cl, warishNames: updated, purchaser: updated.join(', ') };
      })
    );
  };

  const updateWarishNameInLink = (linkIdx: number, wIdx: number, val: string) => {
    setChainLinks(prev =>
      prev.map((cl, i) => {
        if (i !== linkIdx) return cl;
        const updated = (cl.warishNames || ['']).map((w, idx) => (idx === wIdx ? val : w));
        return { ...cl, warishNames: updated, purchaser: updated.join(', ') };
      })
    );
  };

  const removeChainLink = (idx: number) => {
    setChainLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const updateChainLink = (idx: number, field: keyof ChainLink, val: string) => {
    setChainLinks(prev =>
      prev.map((cl, i) => (i === idx ? { ...cl, [field]: val } : cl))
    );
  };

  // Continuity check
  const verifyAndGenerateChain = () => {
    const applicantName = party.trim();
    const gaps: string[] = [];

    for (let i = 1; i < chainLinks.length; i++) {
      const prevP = (chainLinks[i - 1].purchaser || chainLinks[i - 1].purchasers?.join(', ') || '').trim().toLowerCase();
      const currV = (chainLinks[i].vendor || chainLinks[i].vendors?.join(', ') || '').trim().toLowerCase();
      if (prevP && currV && !prevP.includes(currV) && !currV.includes(prevP)) {
        gaps.push(
          `Title transition alert between Step ${i} and Step ${i + 1}: Predecessor "${chainLinks[i - 1].purchaser}" does not match subsequent Transferor "${chainLinks[i].vendor}". (Verify intermediate deed or Warishan certificate).`
        );
      }
    }

    if (applicantName && chainLinks.length > 0) {
      const lastP = (chainLinks[chainLinks.length - 1].purchaser || '').trim().toLowerCase();
      const applicant = applicantName.toLowerCase();
      if (lastP && applicant && !lastP.includes(applicant) && !applicant.includes(lastP)) {
        gaps.push(
          `Last step buyer "${chainLinks[chainLinks.length - 1].purchaser}" does not match Present Applicant "${party}". Ensure the latest deed or applicant deed conveys title directly to the applicant.`
        );
      }
    }

    setChainGaps(gaps);
    if (gaps.length === 0) {
      showToast('Unbroken title chain verified successfully!');
    } else {
      showToast(`Chain verified with ${gaps.length} notice(s)`, 'error');
    }
  };

  // AI Drafting Trigger for Misc Case & Other Non-Mutation Cases (Requirement 5)
  const handleTriggerAiDraft = () => {
    if (!onOpenAiDraft) return;
    const primaryNextDate = hearingList.find(h => h.date)?.date || nextDate;
    const allHearingDates = hearingList.map(h => h.date).filter(Boolean);
    const prefillData: Partial<CaseItem> = {
      id: activeEditingCase?.id || editingCase?.id,
      type,
      caseNo: caseNo.trim(),
      subType,
      status,
      party: party.trim(),
      opp: opp.trim(),
      forum,
      filingDate,
      nextDate: primaryNextDate,
      hearingDates: allHearingDates,
      hearingList,
      appNo: isDocketBased ? '' : appNo.trim(),
      grnNo: isGrnOmitted ? '' : grnNo.trim(),
      docketNo: docketNo.trim(),
      applicantDeedNo: applicantDeedNo.trim(),
      applicantDeedYear: applicantDeedYear.trim(),
      applicantDeedType,
      applicantAdsr: applicantAdsr.trim(),
      brokerName: brokerName.trim(),
      brokerPhone: brokerPhone.trim(),
      landSchedules,
      applicants,
      respondents,
      chainLinks,
      notes,
      grounds
    };
    onOpenAiDraft(type, prefillData);
  };

  // Requirement 16 & 18: Save and Update handlers
  const handleSaveOrUpdate = (isUpdate = false, andSendWhatsApp = false) => {
    if (!caseNo.trim() && !isRti) {
      showToast('Case Number is required', 'error');
      return;
    }
    if (!party.trim()) {
      showToast('Petitioner / Applicant Name is required', 'error');
      return;
    }

    // Requirement 8: If party does not exist in Party Ledger, automatically add it
    const trimmedParty = party.trim();
    const partyExists = (activeCompany?.parties || []).some(
      p => p.name.trim().toLowerCase() === trimmedParty.toLowerCase()
    );
    if (!partyExists) {
      addParty({
        name: trimmedParty,
        type: 'Client',
        phone: applicants[0]?.phone || '',
        email: '',
        address: applicants[0]?.address || '',
        notes: applicants[0]?.father ? `Father/Husband: ${applicants[0].father}` : `Created from ${isMisc ? 'Misc' : 'Mutation'} entry`
      });
      showToast(`Added ${trimmedParty} to Party Ledger automatically`);
    }

    const primaryNextDate = hearingList.find(h => h.date)?.date || nextDate;
    const allHearingDates = hearingList.map(h => h.date).filter(Boolean);

    const casePayload = {
      type,
      caseNo: caseNo.trim(),
      subType,
      status,
      party: trimmedParty,
      opp: isRti ? '' : opp.trim(),
      forum: forum.trim(),
      filingDate,
      nextDate: primaryNextDate,
      hearingDates: allHearingDates,
      hearingList,
      priority,
      appNo: isDocketBased ? '' : appNo.trim(),
      grnNo: isGrnOmitted ? '' : grnNo.trim(),
      docketNo: docketNo.trim(),
      impugnedOrderNo,
      impugnedOrderDate,
      grounds,
      bench,
      targetOfficer,
      notes,
      applicantDeedNo: applicantDeedNo.trim(),
      applicantDeedYear: applicantDeedYear.trim(),
      applicantDeedType,
      applicantAdsr: applicantAdsr.trim(),
      brokerName: brokerName.trim(),
      brokerPhone: brokerPhone.trim(),
      recordedOwner: recordedOwner.trim(),
      recordedKhatian: recordedKhatian.trim(),
      recordedDag: recordedDag.trim(),
      landSchedules: isRti
        ? landSchedules.filter(
            s => s.mouza.trim() !== '' || s.khatian.trim() !== '' || s.dag.trim() !== '' || s.area.trim() !== ''
          )
        : landSchedules,
      applicants,
      respondents: isRti ? [] : respondents,
      addresses,
      chainLinks: isChainDeedHidden ? [] : chainLinks,
      attachments
    };

    let resultCase: CaseItem;
    const targetCaseId = activeEditingCase?.id || editingCase?.id;

    if (isUpdate && targetCaseId) {
      updateCase(targetCaseId, casePayload);
      resultCase = { ...(activeEditingCase || editingCase)!, ...casePayload };
      showToast(`Case ${caseNo} updated successfully!`);
    } else {
      resultCase = addCase(casePayload);
      showToast(`New case ${caseNo} created and registered!`);
    }

    if (andSendWhatsApp) {
      const applicantPhone = applicants[0]?.phone || '';
      const typeDisplay = isMisc ? 'Misc Case' : isMutation ? 'Mutation Case' : `${type.toUpperCase()} Case`;
      const textMsg = encodeURIComponent(
        `Dear ${party}, your ${typeDisplay} ${caseNo} (${subType}) before ${forum} has been registered/updated. Hearing Date: ${
          primaryNextDate || 'To be notified'
        }. - ${activeCompany?.name || 'Legal Chamber'}`
      );
      const cleanPhone = applicantPhone.replace(/[^0-9]/g, '');
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${textMsg}`
        : `https://wa.me/?text=${textMsg}`;
      window.open(waUrl, '_blank');
    }

    // Requirement 16 & 20: Forward to concern page / Show make chain deed option
    setPostSaveCase(resultCase);
  };

  // Requirement 19: Print Dossier (excluding broker/muhuri name & phone as per Requirement 10)
  const handlePrintDossier = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    const docTitle = isMisc ? 'MISC CASE REGISTRY DOSSIER' : isLrAppeal ? 'LR APPEAL CASE REGISTRY DOSSIER' : isMutation ? 'MUTATION CASE REGISTRY DOSSIER' : `${type.toUpperCase()} CASE REGISTRY DOSSIER`;
    const subIdentifier = isDocketBased ? `Docket No: ${docketNo || '—'}` : `App No: ${appNo || '—'}`;
    const allHearingDatesText = hearingList.filter(h => h.date).map((h, i) => `${i + 1}. ${h.date} (${h.stage || 'Hearing'})`).join(', ');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} - ${caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; font-size: 13px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
            th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
            th { background: #F1F5F9; font-weight: bold; }
            .section-title { font-weight: bold; color: #1E3A8A; font-size: 13px; margin-top: 14px; margin-bottom: 4px; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; }
            .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>${docTitle}</h2>
          <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">Competent Revenue Forum: ${forum} | Case No: ${caseNo} | ${subIdentifier}</div>
          
          <div class="section-title">1. CASE PARTICULARS (মামলার বিবরণ)</div>
          <div class="grid-info">
            <div><strong>Case Number:</strong> ${caseNo || '—'}</div>
            <div><strong>${isRti ? 'Docket No / Tracking ID' : isDocketBased ? 'Docket Number' : 'Application Number'}:</strong> ${isDocketBased ? (docketNo || '—') : (appNo || '—')}</div>
            <div><strong>Sub-Type / Matter:</strong> ${subType}</div>
            ${!isGrnOmitted ? `<div><strong>${isFirstAppeal ? 'Tracking Number' : 'GRN Fee Challan'}:</strong> ${grnNo || '—'}</div>` : ''}
            <div><strong>Case Status:</strong> ${status}</div>
            <div><strong>${isRti ? 'Public Authority / Forum' : 'Adjudicating Forum'}:</strong> ${forum || '—'}</div>
            <div><strong>Filing Date:</strong> ${filingDate}</div>
            <div><strong>Hearing Date(s):</strong> ${allHearingDatesText || nextDate || '—'}</div>
          </div>

          <div class="section-title">2. PETITIONER / APPLICANT (আবেদনকারী বিবরণ)</div>
          <div class="grid-info">
            <div><strong>Applicant Name:</strong> ${party}</div>
            <div><strong>Father / Husband:</strong> ${applicants[0]?.father || '—'}</div>
            <div><strong>Contact Phone:</strong> ${applicants[0]?.phone || '—'}</div>
            <div><strong>Residential Address:</strong> ${applicants[0]?.address || '—'}</div>
            <div><strong>Applicant Deed No & Year:</strong> ${applicantDeedNo ? `Deed No ${applicantDeedNo} of ${applicantDeedYear || '—'}` : '—'}</div>
            <div><strong>Deed Type & ADSR:</strong> ${applicantDeedType || '—'} (${applicantAdsr || '—'})</div>
          </div>

          ${!isRti ? `
          <div class="section-title">3. OPPOSITE PARTY / RESPONDENT(S) (প্রতিপক্ষ / নোটিশ প্রাপক)</div>
          ${respondents.length > 0 ? `
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Phone</th><th>Notice Address</th></tr></thead>
              <tbody>
                ${respondents.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.type}</td><td>${r.phone || '—'}</td><td>${r.address || '—'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : '<div>Uncontested / No Opposite Party recorded.</div>'}
          ` : ''}

          <div class="section-title">4. সম্পত্তির তপশীল বিবরণ (PROPERTY SCHEDULE)</div>
          <table>
            <thead><tr><th>#</th><th>District / Block</th><th>Mouza & JL</th><th>Khatian</th><th>Dag</th><th>Area</th><th>Classification</th></tr></thead>
            <tbody>
              ${landSchedules.map((s, i) => `<tr><td>${i + 1}</td><td>${s.district} / ${s.block}</td><td>${s.mouza} (JL ${s.jl})</td><td>${s.khatian}</td><td>${s.dag}</td><td>${s.area} ${s.unit}</td><td>${s.classification}</td></tr>`).join('')}
            </tbody>
          </table>

          ${!isChainDeedHidden ? `
          <div class="section-title">5. CHRONOLOGICAL CHAIN OF TITLE (ধারাবাহিক চেইন দলিল)</div>
          ${chainLinks.length > 0 ? `
            <table>
              <thead><tr><th>#</th><th>Type</th><th>Deed / Cert No</th><th>Year</th><th>Transferor / Deceased</th><th>Transferee / Warishan</th><th>Office</th><th>Area</th></tr></thead>
              <tbody>
                ${chainLinks.map((l, i) => {
                  const from = l.vendors && l.vendors.length > 0 ? l.vendors.join(', ') : l.vendor;
                  const to = l.linkType === 'warish' 
                    ? (l.warishNames && l.warishNames.length > 0 ? l.warishNames.join(', ') : l.purchaser)
                    : (l.purchasers && l.purchasers.length > 0 ? l.purchasers.join(', ') : l.purchaser);
                  return `<tr>
                    <td>${i + 1}</td>
                    <td>${l.linkType === 'warish' ? 'Warishan' : (l.deedType || 'Deed')}</td>
                    <td>${l.linkType === 'warish' ? (l.certificateRef || 'Warishan Cert') : (l.deedNo || '—')}</td>
                    <td>${l.deedYear || l.deedDate || '—'}</td>
                    <td>${from || '—'}</td>
                    <td>${to || '—'}</td>
                    <td>${l.registrationOffice || '—'}</td>
                    <td>${l.area || '—'}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          ` : '<div>No intermediate chain deeds recorded.</div>'}
          ` : ''}

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>Verified &amp; Submitted by: __________________</div>
            <div>Revenue Authority Seal &amp; Signature: __________________</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  // Requirement 20: Direct Make Chain Deed button opener
  const handleOpenChainDeedDirectly = () => {
    const currentCase: CaseItem = {
      id: activeEditingCase?.id || editingCase?.id || 'temp_' + Date.now(),
      type,
      caseNo: caseNo || 'MN/Draft',
      subType,
      status,
      party: party || 'Applicant',
      opp: opp || '—',
      forum: forum || 'BL&LRO',
      filingDate,
      nextDate,
      priority,
      appNo,
      grnNo,
      docketNo,
      applicantDeedNo,
      applicantDeedYear,
      applicantDeedType,
      applicantAdsr,
      landSchedules,
      applicants,
      respondents,
      addresses,
      chainLinks,
      attachments,
      createdAt: Date.now(),
      createdBy: 'admin'
    };
    setActiveChainDeedModalCase(currentCase);
  };

  const isEditingExisting = Boolean(activeEditingCase || editingCase);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Chain Deed Modal (Requirement 20) */}
      {activeChainDeedModalCase && (
        <ChainDeedModal
          caseItem={activeChainDeedModalCase}
          isOpen={true}
          onClose={() => setActiveChainDeedModalCase(null)}
          onSaveCase={updated => {
            if (activeEditingCase || editingCase) {
              updateCase(updated.id, updated);
            }
            setActiveChainDeedModalCase(null);
            showToast('Chain Deed updated and saved to case!');
          }}
        />
      )}

      {/* Post-Save / Post-Update Forwarding Modal (Requirement 16 & 20) */}
      {postSaveCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {postSaveCase.type === 'misc'
                  ? 'Misc Case Saved Successfully!'
                  : postSaveCase.type === 'firstappeal'
                  ? 'First Appeal Saved Successfully!'
                  : postSaveCase.type === 'rti'
                  ? 'RTI Application Saved Successfully!'
                  : postSaveCase.type === 'lrappeal'
                  ? 'LR Appeal Saved Successfully!'
                  : 'Mutation Case Saved Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Case No: <strong className="text-blue-600 dark:text-blue-400 font-mono">{postSaveCase.caseNo || '—'}</strong> · {isDocketBased ? 'Docket / Tracking: ' : 'App No: '}
                <strong className="font-mono">{(isDocketBased ? postSaveCase.docketNo : postSaveCase.appNo) || '—'}</strong>
              </p>
            </div>

            {!isChainDeedHidden && (
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span>Make &amp; Print Chain Deed (ধারাবাহিক চেইন দলিল তৈরি)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                  Generate and print the complete, case-specific title statement chronologically from record owner to applicant using AI and Data Vault samples.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              {!isChainDeedHidden && (
                <button
                  type="button"
                  onClick={() => {
                    const saved = postSaveCase;
                    setPostSaveCase(null);
                    setActiveChainDeedModalCase(saved);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Proceed to Make &amp; Print Chain Deed</span>
                </button>
              )}

              {postSaveCase.type !== 'mutation' && onOpenAiDraft && (
                <button
                  type="button"
                  onClick={() => {
                    const saved = postSaveCase;
                    setPostSaveCase(null);
                    onOpenAiDraft(saved.type, saved);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to AI Drafting Studio</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSaved(postSaveCase, false)}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <span>Return to Case Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel and Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {isEditingExisting
                  ? `Edit ${caseNo || (isMisc ? 'Misc Case' : isMutation ? 'Mutation Case' : type)}`
                  : `New ${isMisc ? 'Misc Case' : isMutation ? 'Mutation Case' : type} Entry`}
              </h1>
              {isEditingExisting && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Update Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chamber Case Entry · {activeCompany?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons: Save, Update, Cancel, Print, Make Chain Deed, AI Drafting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Requirement 5: AI Drafting Option in Misc Case entry form */}
          {type !== 'mutation' && onOpenAiDraft && (
            <button
              type="button"
              onClick={handleTriggerAiDraft}
              className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open AI Drafting Studio for this Case"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Drafting Studio</span>
            </button>
          )}

          {/* Requirement 20: Make Chain Deed direct button (Removed for RTI & First Appeal) */}
          {!isChainDeedHidden && (
            <button
              type="button"
              onClick={handleOpenChainDeedDirectly}
              className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Make and print case-only Chain of Title statement"
            >
              <Scroll className="w-4 h-4 text-indigo-600" />
              <span>Make Chain Deed</span>
            </button>
          )}

          {/* Requirement 19: Print Dossier button */}
          <button
            type="button"
            onClick={handlePrintDossier}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Print Case Dossier (Excluding broker/muhuri)"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          {/* Requirement 18: Update Button */}
          {isEditingExisting && (
            <button
              type="button"
              onClick={() => handleSaveOrUpdate(true, false)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update {isMisc ? 'Misc Case' : isMutation ? 'Mutation' : 'Case'}</span>
            </button>
          )}

          {/* Requirement 16: Save Button */}
          <button
            type="button"
            onClick={() => handleSaveOrUpdate(false, false)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save {isMisc ? 'Misc Case' : isMutation ? 'Case File' : 'Case'}</span>
          </button>

          {/* Requirement 17: Cancel Button */}
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Search Box for updating existing data through deed no, app no / docket no, applicant name, case no */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/30 space-y-2 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Search Existing {isMisc ? 'Misc' : isMutation ? 'Mutation' : type} Case to Load &amp; Update (বিদ্যমান কেস অনুসন্ধান ও আপডেট)</span>
          </label>
          {isEditingExisting && (
            <button
              type="button"
              onClick={handleClearFormToNew}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear / Start New {isMisc ? 'Misc Case' : 'Mutation'}
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
            placeholder={
              isMisc
                ? "Type Deed No, Docket No (DOC..), Applicant Name, or Misc Case No (MISC/..) to search & edit..."
                : isLrAppeal
                ? "Type Deed No, Docket No (DOC..), Applicant Name, or LR Appeal Case No (LRA/..) to search & edit..."
                : isFirstAppeal
                ? "Type Docket No (DOC..), Tracking No, Applicant Name, or First Appeal Case No (FA/..) to search & edit..."
                : isRti
                ? "Type Docket No / Tracking ID, Applicant Name, Authority, or Case No to search & edit..."
                : "Type Deed No, Application No (MUTE..), Applicant Name, or Case No (MN/..) to search & edit..."
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />

          {showSearchResults && matchingCases.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
              {matchingCases.map(c => (
                <div
                  key={c.id}
                  onClick={() => loadCaseDataIntoForm(c)}
                  className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400">{c.caseNo}</span>
                      {c.docketNo && <span className="font-mono text-purple-600 text-[11px]">({c.docketNo})</span>}
                      {c.appNo && <span className="font-mono text-slate-500 text-[11px]">({c.appNo})</span>}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Applicant: <strong>{c.party}</strong> · Forum: {c.forum}
                      {c.applicantDeedNo ? ` · Deed: ${c.applicantDeedNo}` : ''}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    Load &amp; Edit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchQuery.trim().length > 0 && matchingCases.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs text-slate-500 text-center">
              No matching case found for "{searchQuery}". Continue entering new case details below.
            </div>
          )}
        </div>

        {isEditingExisting && (
          <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1 pt-0.5">
            <span>● Currently Editing:</span>
            <strong className="font-mono">{caseNo}</strong>
            <span>({party || 'Applicant'})</span>
            <span className="text-slate-500">— Click "Update {isMisc ? 'Misc Case' : isMutation ? 'Mutation' : 'Case'}" when done.</span>
          </div>
        )}
      </div>

      {/* Requirement 4: Misc Case Type Box at top of Misc Case entry form with dropdown */}
      {isMisc && (
        <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-800/80 bg-violet-50/70 dark:bg-violet-950/30 space-y-2.5">
          <div className="flex items-center justify-between border-b border-violet-200/60 dark:border-violet-800/60 pb-1.5">
            <label className="text-xs font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>Misc Case Type / Matter (মিস কেসের ধরন ও বিষয়) *</span>
            </label>
            <span className="text-[11px] text-violet-700 dark:text-violet-300 font-semibold">
              Select Specific Matter
            </span>
          </div>
          <div>
            <select
              value={subType}
              onChange={e => setSubType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 text-violet-950 dark:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-2xs cursor-pointer"
            >
              {SUBTYPES_BY_TYPE.misc.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-violet-800/80 dark:text-violet-300/80 leading-relaxed">
            Revenue Proceedings: 10,000 Share Overlapping, Barga Revoke / De-recording, Name Correction, Share Correction, RS to LR Conveyance Transfer, Boundary Demarcation, and Porcha Classification Rectification.
          </p>
        </div>
      )}

      {/* 1. Core Case Details */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
          <span>1. Primary Case Registry Details</span>
          <span className="text-[11px] font-normal text-slate-400">Fields marked * are mandatory</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isGrnOmitted ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3`}>
          {/* Requirement 3: Mutation Case No starts with MN/, Misc Case No starts with MISC/, RTI Case No is optional */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              {isMisc
                ? 'Misc Case No (Starts with MISC/) *'
                : isLrAppeal
                ? 'LR Appeal Case No *'
                : isFirstAppeal
                ? 'First Appeal Case No *'
                : isRti
                ? 'Case No (Optional)'
                : isMutation
                ? 'Case No (Starts with MN/) *'
                : 'Case Number *'}
            </label>
            <input
              type="text"
              required={!isRti}
              value={caseNo}
              onChange={e => setCaseNo(e.target.value)}
              placeholder={
                isMisc
                  ? 'MISC/2026/0418'
                  : isLrAppeal
                  ? 'LRA/2026/0418'
                  : isFirstAppeal
                  ? 'FA/2026/0418'
                  : isRti
                  ? 'Optional (Not compulsory)'
                  : isMutation
                  ? 'MN/2026/0418'
                  : 'Case/2026/001'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Application No replaced with Docket No for Misc, LR Appeal, First Appeal, and Docket No/Tracking ID for RTI */}
          {isDocketBased ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                {isRti ? 'Docket No / Tracking ID (ডকেট নং / ট্র্যাকিং আইডি)' : 'Docket No (ডকেট নং) *'}
              </label>
              <input
                type="text"
                value={docketNo}
                onChange={e => setDocketNo(e.target.value)}
                placeholder={isRti ? 'e.g. DOC-2026-XXXX / Tracking ID' : 'DOC-2026-XXXX'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Mutation App No (Starts with MUTE) *
              </label>
              <input
                type="text"
                value={appNo}
                onChange={e => setAppNo(e.target.value)}
                placeholder="MUTE-2026-XXXX"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          )}

          {/* Sub-type / Matter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              {isFirstAppeal ? 'Sub-Type / Section (RTI Act 2005)' : 'Sub-Type / Matter'}
            </label>
            {isFirstAppeal ? (
              <>
                <input
                  type="text"
                  list="firstappeal-subtypes"
                  value={subType}
                  onChange={e => setSubType(e.target.value)}
                  placeholder="u/s 19(1) or u/s 19(2) of RTI Act 2005"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <datalist id="firstappeal-subtypes">
                  {SUBTYPES_BY_TYPE.firstappeal.map(st => (
                    <option key={st} value={st} />
                  ))}
                </datalist>
              </>
            ) : (
              <select
                value={subType}
                onChange={e => setSubType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {SUBTYPES_BY_TYPE[type].map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* GRN No omitted for Misc, LR Appeal & RTI; replaced with Tracking No for First Appeal */}
          {!isGrnOmitted && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                {isFirstAppeal ? 'Tracking No (ট্র্যাকিং নং)' : 'GRN Fee Challan No'}
              </label>
              <input
                type="text"
                value={grnNo}
                onChange={e => setGrnNo(e.target.value)}
                placeholder={isFirstAppeal ? 'EW123456789IN / Tracking No' : '19202600XXXXXX'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Current Case Status with Inquiry Pending & Inquiry Complete */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Current Case Status *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {STATUSES_BY_TYPE[type].map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Adjudicating Forum / Authority (Optional & editable for RTI: Police Station, BDO, Panchayat, Municipality, etc.) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              {isRti ? 'Adjudicating Forum / Authority (Optional)' : 'Adjudicating Forum'}
            </label>
            {isRti ? (
              <>
                <input
                  type="text"
                  list="rti-forum-authorities"
                  value={forum}
                  onChange={e => setForum(e.target.value)}
                  placeholder="Police Station / BDO / Panchayat / Municipality / BL&LRO (Optional)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <datalist id="rti-forum-authorities">
                  {FORUMS_BY_TYPE.rti.map(f => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </>
            ) : (
              <select
                value={forum}
                onChange={e => setForum(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {FORUMS_BY_TYPE[type].map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Filing / Application Date
            </label>
            <input
              type="date"
              value={filingDate}
              onChange={e => setFilingDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        {/* Requirement 6: More than one hearing date with + button for every entry form */}
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2.5">
          <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-800/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Hearing / Inquiry Date(s) (শুনানি ও তদন্তের তারিখসমূহ)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({hearingList.length} date{hearingList.length > 1 ? 's' : ''})</span>
            </div>
            <button
              type="button"
              onClick={addHearingDate}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Hearing Date</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {hearingList.map((h, hIdx) => (
              <div
                key={h.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2 shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {hIdx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    type="date"
                    value={h.date}
                    onChange={e => updateHearingDate(hIdx, 'date', e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <input
                    type="text"
                    value={h.stage || ''}
                    onChange={e => updateHearingDate(hIdx, 'stage', e.target.value)}
                    placeholder="e.g. 1st Hearing / Spot Inquiry / Final Order"
                    className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 focus:outline-none"
                  />
                </div>
                {hearingList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHearingDate(hIdx)}
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                    title="Remove this hearing date"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 1 Litigants & Dates */}
        <div className="space-y-4 pt-1">
          {/* Requirement 8: Applicant Profile Card with Party Ledger auto-lookup and auto-creation */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>Petitioner / Applicant Details (আবেদনকারী বিবরণ) *</span>
              </span>
              <span className="text-[10px] text-slate-500">Auto-synced with Party Ledger (খতিয়ানভুক্ত মক্কেল)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative">
              {/* Applicant Name with Ledger Autocomplete */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={party}
                  onChange={e => handlePartyChange(e.target.value)}
                  placeholder="e.g. Sri Nirmal Sen"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />

                {/* Autocomplete dropdown for existing parties */}
                {showPartySuggestions && partySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {partySuggestions.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPartySuggestion(p)}
                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer text-xs"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[10px] px-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700">
                            {p.type}
                          </span>
                        </div>
                        {p.phone && <div className="text-[10px] text-slate-400 font-mono">{p.phone}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                  Father / Husband Name
                </label>
                <input
                  type="text"
                  value={applicants[0]?.father || ''}
                  onChange={e => updateMainApplicantField('father', e.target.value)}
                  placeholder="Father / Husband Name"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                  Phone / WhatsApp No
                </label>
                <input
                  type="text"
                  value={applicants[0]?.phone || ''}
                  onChange={e => updateMainApplicantField('phone', e.target.value)}
                  placeholder="98300XXXXX"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                Residential Address (স্থায়ী ঠিকানা)
              </label>
              <input
                type="text"
                value={applicants[0]?.address || ''}
                onChange={e => updateMainApplicantField('address', e.target.value)}
                placeholder="Vill, P.O., P.S., Dist, Pin"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Requirement 9: Applicant's Deed Details (Deed No, Year, Type of Deed, and ADSR) */}
            <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 mt-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <Scroll className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applicant Purchase / Acquisition Deed Details (আবেদনকারীর দলিলের বিবরণ)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    {isRti || isFirstAppeal ? 'Applicant Deed No (Optional)' : 'Applicant Deed No (দলিল নং) *'}
                  </label>
                  <input
                    type="text"
                    value={applicantDeedNo}
                    onChange={e => setApplicantDeedNo(e.target.value)}
                    placeholder="e.g. 1045 / I-240"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    {isRti || isFirstAppeal ? 'Deed Year (Optional)' : 'Deed Year (দলিল বছর) *'}
                  </label>
                  <input
                    type="text"
                    value={applicantDeedYear}
                    onChange={e => setApplicantDeedYear(e.target.value)}
                    placeholder="e.g. 2021"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-mono font-bold text-indigo-700 dark:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    {isRti || isFirstAppeal ? 'Type of Deed (Optional)' : 'Type of Deed (দলিলের ধরন) *'}
                  </label>
                  <select
                    value={applicantDeedType}
                    onChange={e => setApplicantDeedType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    {WB_DEED_TYPES.map(dt => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    ADSR / SRO (রেজিস্ট্রি অফিস)
                  </label>
                  <input
                    type="text"
                    value={applicantAdsr}
                    onChange={e => setApplicantAdsr(e.target.value)}
                    placeholder="e.g. ADSR Rajarhat / Cossipore"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Requirement 10: Broker / Muhuri Name & Phone (Omitted from printing forms, shown only in report & entry) */}
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Broker / Muhuri Reference (মুহুরি / মধ্যস্থতাকারীর বিবরণ - চেম্বার রেকর্ড)</span>
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                  * শুধুমাত্র চেম্বার রেকর্ডে থাকবে, কোনো সাধারণ প্রিন্ট বা দলিলে যাবে না
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    Broker / Muhuri Full Name
                  </label>
                  <input
                    type="text"
                    value={brokerName}
                    onChange={e => setBrokerName(e.target.value)}
                    placeholder="e.g. Subir Ghosh (Muhuri)"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                    Broker / Muhuri Phone Number
                  </label>
                  <input
                    type="text"
                    value={brokerPhone}
                    onChange={e => setBrokerPhone(e.target.value)}
                    placeholder="98310XXXXX"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Requirement 11: Opposite Party / Respondent Section with + option (Removed for RTI entry page) */}
          {!isRti && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Opposite Party / Respondent(s) (প্রতিপক্ষ / নোটিশ প্রাপক)</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Add respondents if statutory 15-day notice is to be served on vendors, co-sharers or adverse parties.
                </p>
              </div>
              <button
                type="button"
                onClick={addRespondent}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Respondent &amp; Address</span>
              </button>
            </div>

            {respondents.length === 0 ? (
              <div className="py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                No opposite party currently added (Uncontested mutation). Use <strong>+ Add Respondent &amp; Address</strong> above if notice is to be served.
              </div>
            ) : (
              <div className="space-y-2.5">
                {respondents.map((r, i) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span>Opposite Party #{i + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRespondent(i)}
                        className="text-rose-600 hover:text-rose-700 p-0.5 rounded cursor-pointer"
                        title="Remove Respondent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Respondent Name / Authority *
                        </label>
                        <input
                          type="text"
                          value={r.name}
                          onChange={e => updateRespondent(i, 'name', e.target.value)}
                          placeholder="e.g. Sri Subhas Sen (Co-sharer)"
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Category / Type
                        </label>
                        <select
                          value={r.type}
                          onChange={e => updateRespondent(i, 'type', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="Private">Private Party / Co-sharer / Vendor</option>
                          <option value="Govt Dept">Govt Dept / BL&amp;LRO</option>
                          <option value="State">State of West Bengal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Contact Phone (Optional)
                        </label>
                        <input
                          type="text"
                          value={r.phone || ''}
                          onChange={e => updateRespondent(i, 'phone', e.target.value)}
                          placeholder="Phone / Mobile"
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Notice Service Address (নোটিশ প্রেরণের সম্পূর্ণ ঠিকানা) *
                      </label>
                      <input
                        type="text"
                        value={r.address}
                        onChange={e => updateRespondent(i, 'address', e.target.value)}
                        placeholder="Full residential or official address for summons / notice"
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Requirement 12: 2. Land Schedule(s) with + option to add more schedule (Optional / Not Compulsory for RTI) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isRti
                ? '2. সম্পত্তির তপশীল বিবরণ (Schedule of Land — Optional / Not Compulsory)'
                : '2. সম্পত্তির তপশীল বিবরণ (Property Schedule Details)'}
            </span>
            <span className="text-[11px] text-slate-400 ml-2">
              ({landSchedules.length} Schedule{landSchedules.length !== 1 ? 's' : ''})
            </span>
            {isRti && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Schedule of Land is optional for RTI applications (e.g. Police Station, BDO, Panchayat, Municipality queries). Leave blank or remove if not applicable.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addLandSchedule}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Schedule (আরেকটি তপশীল যোগ করুন)</span>
          </button>
        </div>

        <div className="space-y-3">
          {landSchedules.length === 0 && isRti && (
            <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
              No land schedule attached (Not compulsory for RTI). Click <strong>+ Add Schedule</strong> above only if this RTI relates to a specific land plot.
            </div>
          )}
          {landSchedules.map((sched, idx) => (
            <div
              key={sched.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Schedule #{idx + 1} {isRti ? '(Optional)' : ''}
                </div>
                {(landSchedules.length > 1 || isRti) && (
                  <button
                    type="button"
                    onClick={() => removeLandSchedule(idx)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Schedule
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    District (জেলা)
                  </label>
                  <select
                    value={sched.district}
                    onChange={e => updateSchedule(idx, 'district', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {Object.keys(wbDistricts)
                      .sort()
                      .map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Block (ব্লক / থানা)
                  </label>
                  <select
                    value={sched.block}
                    onChange={e => updateSchedule(idx, 'block', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {(wbDistricts[sched.district] || []).map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Mouza Name (মৌজা)
                  </label>
                  <input
                    type="text"
                    value={sched.mouza}
                    onChange={e => updateSchedule(idx, 'mouza', e.target.value)}
                    placeholder="e.g. Patharghata / Sarisha"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    J.L. No (জে.এল)
                  </label>
                  <input
                    type="text"
                    value={sched.jl}
                    onChange={e => updateSchedule(idx, 'jl', e.target.value)}
                    placeholder="36"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Khatian No (খতিয়ান)
                  </label>
                  <input
                    type="text"
                    value={sched.khatian}
                    onChange={e => updateSchedule(idx, 'khatian', e.target.value)}
                    placeholder="1428"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Dag No (দাগ)
                  </label>
                  <input
                    type="text"
                    value={sched.dag}
                    onChange={e => updateSchedule(idx, 'dag', e.target.value)}
                    placeholder="482"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Area (পরিমাণ)
                  </label>
                  <input
                    type="text"
                    value={sched.area}
                    onChange={e => updateSchedule(idx, 'area', e.target.value)}
                    placeholder="0.08"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Unit (একক)
                  </label>
                  <select
                    value={sched.unit}
                    onChange={e => updateSchedule(idx, 'unit', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="acre">Acre (একর)</option>
                    <option value="satak">Satak / Decimal (শতক)</option>
                    <option value="bigha">Bigha (বিঘা)</option>
                    <option value="katha">Katha (কাঠা)</option>
                    <option value="sqft">Sq. Ft.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Class (শ্রেণি)
                  </label>
                  <select
                    value={sched.classification}
                    onChange={e => updateSchedule(idx, 'classification', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Bastu">Bastu (বাস্তু)</option>
                    <option value="Sali">Sali (শালি)</option>
                    <option value="Danga">Danga (ডাঙা)</option>
                    <option value="Pond">Pond / Pukur (পুকুর)</option>
                    <option value="Commercial">Commercial (বাণিজ্যিক)</option>
                    <option value="Karkhana">Factory / Karkhana</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Complete Chronological Chain of Title Builder (Removed for RTI and First Appeal entry forms) */}
      {!isChainDeedHidden && (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                3. Chronological Chain of Title Builder (ধারাবাহিক স্বত্ব ও চেইন দলিল নির্মাতা)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Add Registered Chain Buyer deeds and Warish inheritances to establish continuous title down to the Applicant.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Requirement 14: + Button for Chain Buyer Deed */}
            <button
              type="button"
              onClick={addChainBuyerLink}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Scroll className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Add Chain Buyer Deed (দলিলমূলে চেইন ক্রেতা)</span>
            </button>
            {/* Requirement 15: + Button for Warish */}
            <button
              type="button"
              onClick={addWarishLink}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>+ Add Warish (ওয়ারিশান সূত্রে হস্তান্তর)</span>
            </button>
            <button
              type="button"
              onClick={verifyAndGenerateChain}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verify Continuity</span>
            </button>
          </div>
        </div>

        {/* Step 0 (Origin of Title: Original Recorded Owner) is removed for mutation and misc cases */}
        {!['mutation', 'misc'].includes(type) && (
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/60 dark:bg-amber-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                  0
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Origin of Title: Original Recorded Owner (মূল রেকর্ডীয় রায়ত)
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  Recorded Owner Name
                </label>
                <input
                  type="text"
                  value={recordedOwner}
                  onChange={e => setRecordedOwner(e.target.value)}
                  placeholder="e.g. Sri Haripada Mondal"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  Khatian No
                </label>
                <input
                  type="text"
                  value={recordedKhatian}
                  onChange={e => setRecordedKhatian(e.target.value)}
                  placeholder="1428"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  Dag No
                </label>
                <input
                  type="text"
                  value={recordedDag}
                  onChange={e => setRecordedDag(e.target.value)}
                  placeholder="482"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Visual Continuity Flowchart Pipeline */}
        <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max text-xs">
            <div className="px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Origin of Title</span>
            </div>

            {chainLinks.map((cl, i) => (
              <React.Fragment key={cl.id}>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <div
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
                    cl.linkType === 'warish'
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                      : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  {cl.linkType === 'warish' ? (
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                  ) : (
                    <Scroll className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>
                    Step {i + 1}: {cl.purchaser || (cl.linkType === 'warish' ? 'Warishan' : 'Chain Buyer')}
                    {cl.deedYear ? ` (${cl.deedYear})` : ''}
                  </span>
                </div>
              </React.Fragment>
            ))}

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Applicant: {party || 'Applicant'}</span>
            </div>
          </div>
        </div>

        {/* Chain Items List */}
        {chainLinks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
            No intermediate title transitions added yet (Direct conveyance / Unbroken title). Use <strong>+ Add Chain Buyer Deed</strong> or <strong>+ Add Warish</strong> above to construct the chain.
          </div>
        ) : (
          <div className="space-y-3.5">
            {chainLinks.map((cl, i) => (
              <div
                key={cl.id}
                className={`p-4 rounded-xl border space-y-3 shadow-2xs transition-colors ${
                  cl.linkType === 'warish'
                    ? 'border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-blue-200 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                        cl.linkType === 'warish' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {cl.linkType === 'warish' ? (
                        <>
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>Step #{i + 1}: Warishan Succession (ওয়ারিশান সূত্রে প্রাপ্ত হস্তান্তর)</span>
                        </>
                      ) : (
                        <>
                          <Scroll className="w-3.5 h-3.5 text-blue-600" />
                          <span>Step #{i + 1}: Registered Deed Conveyance (দলিলমূলে চেইন হস্তান্তর)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={cl.linkType || 'deed'}
                      onChange={e => updateChainLink(i, 'linkType', e.target.value)}
                      className="px-2 py-0.5 text-[11px] font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <option value="deed">Deed / Conveyance</option>
                      <option value="warish">Warish / Inheritance</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeChainLink(i)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded cursor-pointer"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Requirement 14: FORM FIELDS FOR DEED CONVEYANCE with multiple sellers and buyers */}
                {cl.linkType !== 'warish' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Deed No (দলিল নং) *
                        </label>
                        <input
                          type="text"
                          value={cl.deedNo || ''}
                          onChange={e => updateChainLink(i, 'deedNo', e.target.value)}
                          placeholder="e.g. 1120 / I-3418"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Year of Deed (দলিল বছর) *
                        </label>
                        <input
                          type="text"
                          value={cl.deedYear || ''}
                          onChange={e => updateChainLink(i, 'deedYear', e.target.value)}
                          placeholder="e.g. 1985 / 2004"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-indigo-700 dark:text-indigo-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Type of Deed (দলিলের ধরন) *
                        </label>
                        <select
                          value={cl.deedType || 'সাফ কোবালা (Sale / Kobala)'}
                          onChange={e => updateChainLink(i, 'deedType', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                        >
                          {WB_DEED_TYPES.map(dt => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Sub-Registry (ADSR / SRO)
                        </label>
                        <input
                          type="text"
                          value={cl.registrationOffice || ''}
                          onChange={e => updateChainLink(i, 'registrationOffice', e.target.value)}
                          placeholder="e.g. A.D.S.R. Rajarhat"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    {/* Requirement 14: Saler or Doner one or more can be added */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          Transferor(s) / Saler(s) / Donor(s) (দাতা / বিক্রেতা - এক বা একাধিক যোগ করুন)
                        </label>
                        <button
                          type="button"
                          onClick={() => addVendorToLink(i)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Saler / Donor
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {(cl.vendors && cl.vendors.length > 0 ? cl.vendors : [cl.vendor || '']).map((v, vIdx) => (
                          <div key={vIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={v}
                              onChange={e => updateVendorInLink(i, vIdx, e.target.value)}
                              placeholder={`Seller / Donor #${vIdx + 1}`}
                              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                            />
                            {(cl.vendors?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVendorFromLink(i, vIdx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirement 14: Buyer one or more can be added */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                          Chain Buyer(s) / Transferee(s) (গ্রহীতা / ক্রেতা - এক বা একাধিক যোগ করুন) *
                        </label>
                        <button
                          type="button"
                          onClick={() => addPurchaserToLink(i)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Buyer
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {(cl.purchasers && cl.purchasers.length > 0 ? cl.purchasers : [cl.purchaser || '']).map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={p}
                              onChange={e => updatePurchaserInLink(i, pIdx, e.target.value)}
                              placeholder={`Buyer #${pIdx + 1}`}
                              className="w-full px-2.5 py-1.5 text-xs rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-bold text-blue-700 dark:text-blue-300"
                            />
                            {(cl.purchasers?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => removePurchaserFromLink(i, pIdx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Date of Registration (তারিখ)
                        </label>
                        <input
                          type="date"
                          value={cl.deedDate || ''}
                          onChange={e => updateChainLink(i, 'deedDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Transferred Area (পরিমাণ)
                        </label>
                        <input
                          type="text"
                          value={cl.area || ''}
                          onChange={e => updateChainLink(i, 'area', e.target.value)}
                          placeholder="e.g. 0.08 Acre"
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">
                          Consideration (পণ মূল্য)
                        </label>
                        <input
                          type="text"
                          value={cl.consideration || ''}
                          onChange={e => updateChainLink(i, 'consideration', e.target.value)}
                          placeholder="₹ 15,00,000"
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Requirement 15: FORM FIELDS FOR WARISH with option to add names of the warishes */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase mb-0.5">
                          Deceased Owner (মৃত পূর্ববর্তী ব্যক্তি) *
                        </label>
                        <input
                          type="text"
                          value={cl.vendor}
                          onChange={e => updateChainLink(i, 'vendor', e.target.value)}
                          placeholder="e.g. Late Haripada Mondal"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase mb-0.5">
                          Warish Year (সনদ / মৃত্যুর বছর)
                        </label>
                        <input
                          type="text"
                          value={cl.deedYear || ''}
                          onChange={e => updateChainLink(i, 'deedYear', e.target.value)}
                          placeholder="e.g. 1998"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase mb-0.5">
                          Warishan Certificate Ref No
                        </label>
                        <input
                          type="text"
                          value={cl.certificateRef || ''}
                          onChange={e => updateChainLink(i, 'certificateRef', e.target.value)}
                          placeholder="e.g. Cert No. 240/GP dt 15/04/1998"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase mb-0.5">
                          Issuing Authority (কর্তৃপক্ষ)
                        </label>
                        <input
                          type="text"
                          value={cl.registrationOffice || ''}
                          onChange={e => updateChainLink(i, 'registrationOffice', e.target.value)}
                          placeholder="e.g. Pradhan, Patharghata Gram Panchayat"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    {/* Requirement 15: Adding option name of the warishes */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-purple-200 dark:border-purple-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                          Names of Warishes (ওয়ারিশানদের নাম - একাধিক যোগ করুন) *
                        </label>
                        <button
                          type="button"
                          onClick={() => addWarishNameToLink(i)}
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Warish Name
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {(cl.warishNames && cl.warishNames.length > 0 ? cl.warishNames : [cl.purchaser || '']).map((w, wIdx) => (
                          <div key={wIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={w}
                              onChange={e => updateWarishNameInLink(i, wIdx, e.target.value)}
                              placeholder={`Warish #${wIdx + 1} Name`}
                              className="w-full px-2.5 py-1.5 text-xs rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-bold text-purple-800 dark:text-purple-200"
                            />
                            {(cl.warishNames?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWarishNameFromLink(i, wIdx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Verification Alert */}
        {chainGaps.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Title Continuity Notices:</span>
            </div>
            {chainGaps.map((gap, idx) => (
              <div key={idx} className="pl-5 text-[11px]">
                • {gap}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Bottom Sticky Actions Bar */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {!isChainDeedHidden && (
            <button
              type="button"
              onClick={handleOpenChainDeedDirectly}
              className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Scroll className="w-4 h-4 text-indigo-600" />
              <span>Make Chain Deed</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintDossier}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          {isEditingExisting && (
            <button
              type="button"
              onClick={() => handleSaveOrUpdate(true, false)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update {isMisc ? 'Misc Case' : isMutation ? 'Mutation Case' : 'Case'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveOrUpdate(false, false)}
            className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save {isMisc ? 'Misc Case' : isMutation ? 'Mutation Case' : 'Case'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveOrUpdate(false, true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Save and launch WhatsApp client update"
          >
            <Share2 className="w-4 h-4" />
            <span>Save &amp; Alert WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
