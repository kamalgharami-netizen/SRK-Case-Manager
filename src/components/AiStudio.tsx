import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { CaseType, CaseItem } from '../types';
import {
  Brain,
  FileText,
  Copy,
  Download,
  FolderOpen,
  Sparkles,
  Printer,
  CheckCircle2,
  Languages,
  RotateCcw,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  X,
  Building2,
  User,
  MapPin,
  Calendar,
  Hash,
  AlertCircle,
  ArrowLeft,
  SlidersHorizontal,
  Edit3,
  Eye,
  Filter,
  FileSearch,
  FolderGit2,
  Send,
  Gavel
} from 'lucide-react';

export type DraftLanguage = 'english' | 'bengali' | 'bilingual';

// Mutation drafting is completely removed as requested
export type TemplateType =
  | 'rti'
  | 'rtifirstappeal'
  | 'misc10000'
  | 'lrappeal'
  | 'firstappeal'
  | 'sec5delay'
  | 'conversion';

export interface FormValues {
  forum: string;
  authorityAddress: string;
  spioDetails: string;
  partyName: string;
  fatherName: string;
  address: string;
  contactPhone: string;
  oppParty: string;
  showOppParty: boolean;
  showLandSchedule: boolean;
  showCaseRef: boolean;
  caseNumber: string;
  caseDate: string;
  mouzaJl: string;
  khatianDag: string;
  landAreaClass: string;
  deedNoDate: string;
  customFacts: string;
}

export interface AiStudioProps {
  initialCaseType?: CaseType | 'all';
  lockCaseType?: boolean;
  prefilledCase?: Partial<CaseItem> | null;
  onBack?: () => void;
}

// Template mapping per case/form type (Mutation completely removed)
export const CASE_TEMPLATES_MAP: Record<
  string,
  { id: TemplateType; labelEn: string; labelBn: string; desc: string }[]
> = {
  rti: [
    {
      id: 'rti',
      labelEn: 'RTI Application u/s 6(1)',
      labelBn: 'তথ্য জানার অধিকার দরখাস্ত (ধারা ৬(১))',
      desc: 'Demand certified public records from SPIO'
    },
    {
      id: 'rtifirstappeal',
      labelEn: 'RTI First Appeal u/s 19(1)',
      labelBn: 'আর.টি.আই. প্রথম আপিল (ধারা ১৯(১))',
      desc: 'First Appeal before FAA against SPIO delay/refusal'
    }
  ],
  misc: [
    {
      id: 'misc10000',
      labelEn: '10000-Share & Misc Case u/s 50A',
      labelBn: '১০,০০০ হিস্যা ও বিবিধ মোকদ্দমা আবেদনপত্র (ধারা ৫০/৫০ক)',
      desc: 'Petition to Revenue Officer for share & ROR correction'
    }
  ],
  lrappeal: [
    {
      id: 'lrappeal',
      labelEn: 'Memo of Appeal u/s 54 WBLR Act',
      labelBn: 'এল.আর. আপিল মেমোরেন্ডাম (ধারা ৫৪)',
      desc: 'Statutory Appeal before DL&LRO against lower revenue order'
    },
    {
      id: 'sec5delay',
      labelEn: 'Section 5 Delay Condonation Petition',
      labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মকুবের আবেদনপত্র',
      desc: 'Limitation Act condonation of delay in preferring appeal'
    }
  ],
  firstappeal: [
    {
      id: 'firstappeal',
      labelEn: 'Statutory First Appeal (CPC / Sec 54)',
      labelBn: 'বিধিবদ্ধ প্রথম আপিল মেমোরেন্ডাম',
      desc: 'First Appeal before Appellate Authority'
    },
    {
      id: 'sec5delay',
      labelEn: 'Section 5 Delay Condonation Petition',
      labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মার্জনার আবেদনপত্র',
      desc: 'Limitation Act condonation of delay'
    }
  ],
  conversion: [
    {
      id: 'conversion',
      labelEn: 'Conversion Petition u/s 4C WBLR Act',
      labelBn: 'বাস্তু শ্রেণি রূপান্তর দরখাস্ত (ধারা ৪সি)',
      desc: 'Application to Collector for land use conversion'
    }
  ],
  lrtt: [
    {
      id: 'lrappeal',
      labelEn: 'WBLRTT Original Application / Appeal',
      labelBn: 'ভূমি সংস্কার ট্রাইব্যুনাল (LRTT) আবেদনপত্র',
      desc: 'Tribunal application under WBLRTT Act'
    },
    {
      id: 'sec5delay',
      labelEn: 'Section 5 Delay Condonation Petition',
      labelBn: 'বিলম্ব মকুবের আবেদনপত্র',
      desc: 'Tribunal delay condonation'
    }
  ]
};

export const ALL_TEMPLATES_LIST: { id: TemplateType; labelEn: string; labelBn: string; category: string }[] = [
  { id: 'rti', labelEn: 'RTI Application u/s 6(1)', labelBn: 'তথ্য জানার অধিকার দরখাস্ত (৬(১) ধারা)', category: 'RTI' },
  { id: 'rtifirstappeal', labelEn: 'RTI First Appeal u/s 19(1)', labelBn: 'আর.টি.আই. প্রথম আপিল (১৯(১) ধারা)', category: 'RTI' },
  { id: 'misc10000', labelEn: '10000-Share & Misc Case u/s 50A', labelBn: '১০,০০০ হিস্যা ও বিবিধ মোকদ্দমা আবেদনপত্র', category: 'Misc' },
  { id: 'lrappeal', labelEn: 'Memo of Appeal u/s 54 WBLR Act', labelBn: 'এল.আর. আপিল মেমোরেন্ডাম (৫৪ ধারা)', category: 'Appeal' },
  { id: 'firstappeal', labelEn: 'Statutory First Appeal', labelBn: 'বিধিবদ্ধ প্রথম আপিল মেমোরেন্ডাম', category: 'Appeal' },
  { id: 'sec5delay', labelEn: 'Section 5 Delay Condonation', labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মকুবের আবেদন', category: 'Appeal' },
  { id: 'conversion', labelEn: 'Conversion Petition u/s 4C', labelBn: 'বাস্তু শ্রেণি রূপান্তর দরখাস্ত (৪সি ধারা)', category: 'Conversion' }
];

export const AiStudio: React.FC<AiStudioProps> = ({
  initialCaseType = 'all',
  lockCaseType = false,
  prefilledCase = null,
  onBack
}) => {
  const { activeCompany, activeUser, showToast, language } = useApp();

  const [activeTab, setActiveTab] = useState<'draft' | 'learning'>('draft');

  // Active category filter: defaults to initialCaseType or 'rti'
  const [selectedCategory, setSelectedCategory] = useState<CaseType>(() => {
    if (initialCaseType && initialCaseType !== 'all' && initialCaseType !== 'mutation') {
      return initialCaseType;
    }
    return 'rti';
  });

  // Mobile View state (for small screens < 1024px)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  // Synchronize when initialCaseType prop changes
  useEffect(() => {
    if (initialCaseType && initialCaseType !== 'all' && initialCaseType !== 'mutation') {
      setSelectedCategory(initialCaseType);
      if (CASE_TEMPLATES_MAP[initialCaseType]?.length > 0) {
        setTemplate(CASE_TEMPLATES_MAP[initialCaseType][0].id);
      }
    }
  }, [initialCaseType]);

  // Determine allowed templates strictly based on form type (only show options for this form type)
  const allowedTemplates = useMemo(() => {
    if (CASE_TEMPLATES_MAP[selectedCategory]) {
      return CASE_TEMPLATES_MAP[selectedCategory];
    }
    return CASE_TEMPLATES_MAP.rti;
  }, [selectedCategory]);

  // Drafting inputs (Mutation completely removed)
  const [template, setTemplate] = useState<TemplateType>(() => {
    const initialList = CASE_TEMPLATES_MAP[initialCaseType !== 'all' && initialCaseType !== 'mutation' ? initialCaseType : 'rti'];
    if (initialList && initialList.length > 0) {
      return initialList[0].id;
    }
    return 'rti';
  });

  const [draftLang, setDraftLang] = useState<DraftLanguage>(() => {
    return language === 'bn' ? 'bengali' : 'bilingual';
  });

  // Keep draftLang updated if global language switches
  useEffect(() => {
    if (language === 'bn') {
      setDraftLang('bengali');
    } else if (language === 'en') {
      setDraftLang(prev => (prev === 'bengali' ? 'english' : prev));
    }
  }, [language]);

  // When selectedCategory changes, verify template belongs to allowed templates for that form type
  useEffect(() => {
    if (CASE_TEMPLATES_MAP[selectedCategory]) {
      const allowed = CASE_TEMPLATES_MAP[selectedCategory];
      if (!allowed.some(t => t.id === template)) {
        setTemplate(allowed[0].id);
      }
    }
  }, [selectedCategory, template]);

  // Form State
  const [forum, setForum] = useState('To: The State Public Information Officer (SPIO) / BL&LRO, Rajarhat');
  const [authorityAddress, setAuthorityAddress] = useState('Office of the Block Land & Land Reforms Officer, Rajarhat, North 24 Parganas - 700135');
  const [spioDetails, setSpioDetails] = useState('State Public Information Officer & Revenue Officer, BL&LRO Office, Rajarhat');
  const [partyName, setPartyName] = useState('Debashis Chatterjee');
  const [fatherName, setFatherName] = useState('Late Birendra Nath Chatterjee');
  const [address, setAddress] = useState('Flat 3B, Greenwood Park, Action Area I, New Town, Kolkata - 700156');
  const [contactPhone, setContactPhone] = useState('9830012345');

  // Opposite Party (default hidden for RTI and Misc Case as requested)
  const [showOppParty, setShowOppParty] = useState(false);
  const [oppParty, setOppParty] = useState('The State of West Bengal, represented by BL&LRO');

  // Land Schedule (সম্পত্তির তপশীল বিবরণ) - default hidden for RTI, default shown for Misc Case
  const [showLandSchedule, setShowLandSchedule] = useState(false);
  const [mouzaJl, setMouzaJl] = useState('Mouza - Patharghata, J.L. No. - 36');
  const [khatianDag, setKhatianDag] = useState('L.R. Khatian No. 1428, L.R. Dag No. 482');
  const [landAreaClass, setLandAreaClass] = useState('Area 0.08 Acre, Classification - Bastu');
  const [deedNoDate, setDeedNoDate] = useState('Registered Deed No. 04812/2024 dated 04-11-2024');

  // Case Reference (optional via + button)
  const [showCaseRef, setShowCaseRef] = useState(false);
  const [caseNumber, setCaseNumber] = useState('RTI/BLRO/2024/091');
  const [caseDate, setCaseDate] = useState('14-10-2024');

  // Facts of the case (observed and drafted by AI)
  const [customFacts, setCustomFacts] = useState(
    'Applicant seeks certified copy of Revenue Inspector field inquiry report and spot sketch map submitted in connection with L.R. Khatian No. 1428, Dag No. 482, Mouza Patharghata.'
  );

  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isObservingFacts, setIsObservingFacts] = useState(false);

  // Folder Learning state
  const [folderFiles, setFolderFiles] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [learnedPatterns, setLearnedPatterns] = useState<{
    chamberHeader: string;
    prayerStyle: string;
    citationStyle: string;
    totalDocsLearned: number;
  } | null>(null);

  // Populate from prefilledCase if provided from an entry form or case detail
  useEffect(() => {
    if (prefilledCase) {
      if (prefilledCase.type && prefilledCase.type !== 'mutation') {
        setSelectedCategory(prefilledCase.type);
      }
      if (prefilledCase.party) setPartyName(prefilledCase.party);
      if (prefilledCase.applicants?.[0]?.name) setPartyName(prefilledCase.applicants[0].name);
      if (prefilledCase.applicants?.[0]?.father) setFatherName(prefilledCase.applicants[0].father);
      if (prefilledCase.applicants?.[0]?.address) setAddress(prefilledCase.applicants[0].address);
      if (prefilledCase.applicants?.[0]?.phone) setContactPhone(prefilledCase.applicants[0].phone);
      if (prefilledCase.opp) {
        setOppParty(prefilledCase.opp);
        if (prefilledCase.type !== 'rti') setShowOppParty(true);
      }
      if (prefilledCase.forum) setForum(prefilledCase.forum);
      if (prefilledCase.caseNo) {
        setCaseNumber(prefilledCase.caseNo);
        setShowCaseRef(true);
      }
      if (prefilledCase.filingDate) setCaseDate(prefilledCase.filingDate);
      if (prefilledCase.grounds) {
        setCustomFacts(prefilledCase.grounds);
      } else if (prefilledCase.subType) {
        const st = prefilledCase.subType;
        if (st.includes('10000')) {
          setCustomFacts(
            'The total recorded shares in the scheduled Dag do not aggregate to 10,000 parts on the Banglarbhumi portal, causing a mathematical lock. Rectification of share allotment u/s 50/50A WBLR Act is required.'
          );
        } else if (st.includes('Record') || st.includes('Name') || st.includes('RS to LR') || st.includes('Erroneous')) {
          setCustomFacts(
            `Application for ${st} under Section 50/51A of the West Bengal Land Reforms Act, 1955 to rectify clerical/recording error in the computerized L.R. Khatian on the basis of registered title deeds and RS-LR trace verification.`
          );
        } else if (st.includes('Boundary')) {
          setCustomFacts(
            'Application for demarcation and boundary verification through official Amin/Revenue Inspector survey to resolve plot boundary discrepancy.'
          );
        } else if (st.toLowerCase().includes('first appeal') && prefilledCase.type === 'rti') {
          setTemplate('rtifirstappeal');
        }
      }
      if (prefilledCase.landSchedules && prefilledCase.landSchedules.length > 0) {
        const s = prefilledCase.landSchedules[0];
        setMouzaJl(s.mouza ? `Mouza - ${s.mouza}, J.L. No. - ${s.jl || ''}` : '');
        setKhatianDag(`L.R. Khatian No. ${s.khatian || ''}, L.R. Dag No. ${s.dag || ''}`);
        setLandAreaClass(`Area ${s.area || ''} ${s.unit || ''}, Classification - ${s.classification || ''}`);
        setShowLandSchedule(true);
      }
      if (prefilledCase.chainLinks && prefilledCase.chainLinks.length > 0) {
        setDeedNoDate(`Deed No. ${prefilledCase.chainLinks[0].deedNo} dated ${prefilledCase.chainLinks[0].deedDate}`);
      }
      showToast(
        `AI Studio adjusted for ${prefilledCase.subType || prefilledCase.caseNo || prefilledCase.type?.toUpperCase() || 'Case'}`,
        'info'
      );
    }
  }, [prefilledCase, showToast]);

  // Whenever template changes, set smart defaults per template requirements
  useEffect(() => {
    if (template === 'rti') {
      setForum(prev => (prev.toLowerCase().includes('court') || prev.toLowerCase().includes('collector') ? 'To: The State Public Information Officer (SPIO) / BL&LRO, Rajarhat' : prev));
      setAuthorityAddress('Office of the Block Land & Land Reforms Officer, Rajarhat, North 24 Parganas - 700135');
      setShowOppParty(false); // RTI has NO opposite party
      setShowLandSchedule(prefilledCase?.landSchedules?.length ? true : false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The applicant requires certified copy of the spot verification report and order-sheet of the Revenue Inspector in respect of L.R. Khatian No. 1428, Dag No. 482. Requisite RTI fee has been paid.'
        );
      }
    } else if (template === 'rtifirstappeal') {
      setForum('Before the First Appellate Authority (FAA) & District Land & Land Reforms Officer (DL&LRO)');
      setAuthorityAddress('Administrative Building, Barasat, North 24 Parganas - 700124');
      setSpioDetails('State Public Information Officer & Revenue Officer, Office of the BL&LRO Rajarhat');
      setShowOppParty(false); // RTI appeal has SPIO details
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The SPIO failed to furnish the requested certified copies within the mandatory statutory period of 30 days under Section 7(1) of the RTI Act, 2005. The delay is arbitrary, intentional, and causes gross denial of justice.'
        );
      }
    } else if (template === 'misc10000') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false); // Default hidden, user can add via + button
      setOppParty('The State of West Bengal, represented by BL&LRO');
      setShowLandSchedule(true); // Misc Case has land schedule by default!
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The total recorded shares in Dag No. 482 in Mouza Patharghata do not aggregate to 10,000 parts, leading to mathematical mismatch and system lock on the Banglarbhumi portal. Correction of shares u/s 50A WBLR Act is required.'
        );
      }
    } else if (template === 'lrappeal') {
      setForum('In the Court of the Ld. District Land & Land Reforms Officer (DL&LRO), North 24 Parganas');
      setAuthorityAddress('Collectorate Compound, Barasat');
      setShowOppParty(true);
      setOppParty('The State of West Bengal & Ors.');
      setShowLandSchedule(true);
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The Ld. Revenue Officer passed the impugned order behind the back of the appellant without serving statutory notice under Rule 24 of WBLR Manual 1991, thereby violating the fundamental principles of natural justice.'
        );
      }
    } else if (template === 'firstappeal') {
      setForum('In the Court of the Appellate Authority / Additional District Magistrate (ADM L&LR)');
      setAuthorityAddress('District Collectorate, Barasat');
      setSpioDetails('Ld. Primary Adjudicating Officer / Revenue Officer, Rajarhat');
      setShowOppParty(true);
      setOppParty('The State of West Bengal & Ors.');
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The primary adjudicating authority failed to appreciate the registered chain of title deeds and continuous uninterrupted possession of the appellant over the scheduled property.'
        );
      }
    } else if (template === 'sec5delay') {
      setForum('In the Court of the Ld. District Land & Land Reforms Officer (DL&LRO)');
      setAuthorityAddress('District Collectorate, Barasat');
      setShowOppParty(true);
      setOppParty('The State of West Bengal');
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'Certified copy of the impugned order was received late and the appellant was afflicted with severe medical ailments. The delay of 45 days is bona fide and not intentional, requiring condonation u/s 5 Limitation Act.'
        );
      }
    } else if (template === 'conversion') {
      setForum('Before the Collector / District Land & Land Reforms Officer (DL&LRO)');
      setAuthorityAddress('Office of the DL&LRO, North 24 Parganas');
      setShowOppParty(false);
      setShowLandSchedule(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The surrounding plots have undergone complete urbanization. Agricultural cultivation is no longer feasible, and the applicant intends to use the property for residential (Bastu) purpose without disturbing public drainage.'
        );
      }
    }
  }, [template, prefilledCase]);

  // Current form values packaged
  const currentFormValues: FormValues = useMemo(
    () => ({
      forum,
      authorityAddress,
      spioDetails,
      partyName,
      fatherName,
      address,
      contactPhone,
      oppParty,
      showOppParty,
      showLandSchedule,
      showCaseRef,
      caseNumber,
      caseDate,
      mouzaJl,
      khatianDag,
      landAreaClass,
      deedNoDate,
      customFacts
    }),
    [
      forum,
      authorityAddress,
      spioDetails,
      partyName,
      fatherName,
      address,
      contactPhone,
      oppParty,
      showOppParty,
      showLandSchedule,
      showCaseRef,
      caseNumber,
      caseDate,
      mouzaJl,
      khatianDag,
      landAreaClass,
      deedNoDate,
      customFacts
    ]
  );

  // Pure function to generate HTML draft adhering strictly to West Bengal practice
  const buildDraft = useCallback(
    (t: TemplateType, lang: DraftLanguage, vals: FormValues): string => {
      let courtHeaderEn = '';
      let courtHeaderBn = '';
      let subjectEn = '';
      let subjectBn = '';
      let factsEn = '';
      let factsBn = '';
      let prayerEn = '';
      let prayerBn = '';

      if (t === 'rti') {
        courtHeaderEn = 'TO THE STATE PUBLIC INFORMATION OFFICER (SPIO)';
        courtHeaderBn = 'মাননীয় রাজ্য জনতথ্য আধিকারিক (SPIO) সমীপে আবেদনপত্র';
        subjectEn = 'APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005';
        subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ৬(১) ধারা মতে তথ্য ও জাবেদা নকল পাইবার আবেদন';
        factsEn = `
          <p>1. <strong>Applicant Identity:</strong> That the Applicant is a citizen of India residing at ${vals.address}.</p>
          <p>2. <strong>Particulars of Information Sought (Observed by Counsel / AI):</strong><br/>
          ${vals.customFacts}</p>
          ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>Case / File Reference:</strong> Relating to Case / Memo No. <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `dated ${vals.caseDate}` : ''}.</p>` : ''}
          <p>${vals.showCaseRef ? '4' : '3'}. That the information sought relates to public records and does not fall within the exemptions specified under Section 8 or 9 of the RTI Act, 2005.</p>
          <p>${vals.showCaseRef ? '5' : '4'}. That statutory application fee of ₹ 10/- is affixed herewith through Court Fee Stamp / IPO.</p>
        `;
        factsBn = `
          <p>১. <strong>আবেদনকারীর পরিচয়:</strong> আবেদনকারী ভারতীয় নাগরিক এবং ${vals.address} ঠিকানার স্থায়ী বাসিন্দা।</p>
          <p>২. <strong>প্রার্থিত তথ্যের বিশদ বিবরণ (তথ্য জানার অধিকার মতে):</strong><br/>
          ${vals.customFacts}</p>
          ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>মামলা / নথি নম্বর:</strong> সংশ্লিষ্ট মেমো / কেস নং <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `তারিখ: ${vals.caseDate}` : ''}।</p>` : ''}
          <p>${vals.showCaseRef ? '৪' : '৩'}. উক্ত তথ্য তথ্য জানার অধিকার আইন ২০০৫ এর ৮ বা ৯ ধারার কোনো ব্যতিক্রমের আওতাভুক্ত নহে এবং সাধারণ জনস্বার্থের সহিত জড়িত।</p>
          <p>${vals.showCaseRef ? '৫' : '৪'}. নির্ধারিত ১০ টাকার কোর্ট ফি / আইপিও অত্র আবেদনের সহিত সংযুক্ত করা হইল।</p>
        `;
        prayerEn = `
          The Applicant prays that certified true copies of the aforesaid information and documents may kindly be furnished within the statutory period of 30 days under Section 7(1) of the RTI Act, 2005.
        `;
        prayerBn = `
          অতএব বিনীত প্রার্থনা, তথ্য জানার অধিকার আইন ২০০৫ এর ৭(১) ধারা অনুসারে বিধিবদ্ধ ৩০ দিনের মধ্যে প্রার্থিত তথ্যাদি ও প্রত্যয়িত নকল সরবরাহ করিয়া বাধিত করিবেন।
        `;
      } else if (t === 'rtifirstappeal') {
        courtHeaderEn = 'BEFORE THE FIRST APPELLATE AUTHORITY (FAA) UNDER RTI ACT, 2005';
        courtHeaderBn = 'মাননীয় প্রথম আপিল কর্তৃপক্ষ (First Appellate Authority - FAA) সমীপে আর.টি.আই. প্রথম আপিল';
        subjectEn = 'MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005';
        subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ১৯(১) ধারা মতে বিধিবদ্ধ প্রথম আপিলের স্মারকলিপি';
        factsEn = `
          <p>1. <strong>Appellant:</strong> ${vals.partyName}, residing at ${vals.address}, Contact: ${vals.contactPhone}.</p>
          <p>2. <strong>Details of Concerned SPIO:</strong> ${vals.spioDetails}, Address: ${vals.authorityAddress}.</p>
          ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>Original RTI Application Ref:</strong> Application No. <strong>${vals.caseNumber}</strong> dated ${vals.caseDate || 'earlier'}, filed with requisite fees.</p>` : '<p>3. That an application u/s 6(1) was submitted before the SPIO along with statutory fee.</p>'}
          <p>4. <strong>Grounds of Appeal & Facts Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>5. That the SPIO has arbitrarily failed to supply the requested records within the mandatory period of 30 days / supplied misleading information, violating Section 7(1) of the Act.</p>
        `;
        factsBn = `
          <p>১. <strong>আপিলকারী:</strong> ${vals.partyName}, পিতা: ${vals.fatherName}, ঠিকানা: ${vals.address}।</p>
          <p>২. <strong>সংশ্লিষ্ট এস.পি.আই.ও.-র বিবরণ:</strong> ${vals.spioDetails}।</p>
          ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>মূল আরটিআই দরখাস্তের বিবরণ:</strong> আবেদনপত্র নং <strong>${vals.caseNumber}</strong> তারিখ: ${vals.caseDate || 'পূর্বে দাখিলকৃত'}।</p>` : '<p>৩. পূর্বে ৬(১) ধারায় বিধিবদ্ধ ফিসহ দরখাস্ত দাখিল করা হইয়াছিল।</p>'}
          <p>৪. <strong>আপিলের আইনি ভিত্তি ও ঘটনার বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৫. সংশ্লিষ্ট জনতথ্য আধিকারিক নির্ধারিত ৩০ দিনের মধ্যে তথ্য প্রদানে ব্যর্থ হইয়াছেন অথবা বিভ্রান্তিকর তথ্য প্রদান করিয়াছেন।</p>
        `;
        prayerEn = `
          The Appellant prays that the First Appellate Authority may graciously be pleased to admit this Appeal, direct the SPIO to supply all certified documents forthwith free of cost under Section 7(6), and recommend penalty proceedings under Section 20 of the RTI Act.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র প্রথম আপিল গ্রহণ করিয়া সংশ্লিষ্ট এসপিআইও-কে অবিলম্বে নিঃশর্তভাবে সম্পূর্ণ ও নির্ভুল প্রত্যয়িত তথ্য বিনা খরচে সরবরাহের নির্দেশ প্রদান এবং দায়িত্বে অবহেলার বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণে মর্জি হয়।
        `;
      } else if (t === 'misc10000') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার / ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে দরখাস্ত';
        subjectEn = 'PETITION UNDER SECTION 50 READ WITH SECTION 50A OF WBLR ACT, 1955 FOR RECTIFICATION OF 10,000-SHARE ANOMALY';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫০ ও ৫০(ক) ধারা মতে ১০,০০০ হিস্যা বৈষম্য নিরসন ও খতিয়ান সংশোধনের বিবিধ মোকদ্দমা আবেদনপত্র';
        factsEn = `
          <p>1. That the Petitioner is a recorded raiyat / co-sharer in respect of the scheduled property.</p>
          <p>2. That upon inspection of the computerized Record-of-Rights on the Banglarbhumi portal, the aggregate sum of shares of all recorded co-sharers in the scheduled Dag either exceeds or falls short of the statutory ceiling of 10000 parts.</p>
          <p>3. <strong>Specific Share Discrepancy Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>4. That due to this fractional discrepancy, further mutation and land revenue (Khajna) payment has been blocked in the computer system.</p>
          <p>5. That under Section 50A of the West Bengal Land Reforms Act, 1955, the Revenue Officer is fully empowered to rectify clerical errors and mathematical share mismatches.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী অত্র তফশিল বর্ণিত দাগের একজন বৈধ সহ-অংশীদার (রেকর্ডভুক্ত রৈয়ত)।</p>
          <p>২. 'বাংলার ভূমি' পোর্টালের বর্তমান কম্পিউটারাইজড রেকর্ড অনুসারে উক্ত দাগের সকল অংশীদারের সম্মিলিত অংশ ১০,০০০ ভাগের সমান না হইয়া কম বা বেশি রহিয়াছে।</p>
          <p>৩. <strong>হিস্যা বৈষম্য ও ঘটনার বিশদ বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৪. এই গাণিতিক অসঙ্গতির কারণে অনলাইনে খাজনা প্রদান ও নামজারি প্রক্রিয়া অবরুদ্ধ হইয়া পড়িয়াছে।</p>
          <p>৫. পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০(ক) ধারা অনুসারে রেভিনিউ অফিসারের উক্ত করণিক ও গাণিতিক ভুল সংশোধন করিবার পূর্ণ আইনগত এখতিয়ার রহিয়াছে।</p>
        `;
        prayerEn = `
          It is therefore prayed that Your Honour may graciously be pleased to initiate a Misc Case, verify the original survey and link deeds, and re-apportion the 10,000-share distribution in the computerized khatian in accordance with law.
        `;
        prayerBn = `
          অতএব প্রার্থনা, একটি বিবিধ মোকদ্দমা (Misc Case) রুজু করিয়া মূল জরিপ ও দলিল পর্যালোচনা পূর্বক আইনানুযায়ী ১০,০০০ অংশের বণ্টন সংশোধন করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'lrappeal') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক (DL&LRO) সমীপে আপিল স্মারকলিপি';
        subjectEn = 'MEMORANDUM OF APPEAL UNDER SECTION 54 OF THE WEST BENGAL LAND REFORMS ACT, 1955';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫৪ ধারা মতে আপিলের স্মারকলিপি (Memorandum of Appeal)';
        factsEn = `
          <p>1. That this Appeal is directed against the impugned order passed by the Ld. Revenue Officer in ${vals.caseNumber || 'the lower case'}, erroneously disposing the matter without statutory hearing.</p>
          <p>2. That no statutory notice was served upon the Appellant under Rule 24 of the West Bengal Land Reforms Manual, 1991, thereby causing severe prejudice and gross violation of natural justice.</p>
          <p>3. <strong>Grounds of Appeal Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>4. That the Appellant has a strong prima facie case and the balance of convenience is entirely in his favour.</p>
        `;
        factsBn = `
          <p>১. অত্র আপিলটি নিম্ন আদালতের রেভিনিউ অফিসার কর্তৃক প্রদত্ত অন্যায় ও একতরফা আদেশের বিরুদ্ধে দায়ের করা হইল।</p>
          <p>২. ভূমি সংস্কার ম্যানুয়াল ১৯৯১ এর ২৪ নম্বর বিধি অনুসারে আপিলকারীকে কোনো বিধিসম্মত শুনানির নোটিশ প্রদান করা হয় নাই।</p>
          <p>৩. <strong>আপিলের আইনি গ্রাউন্ডস ও ঘটনা:</strong><br/>
          ${vals.customFacts}</p>
          <p>৪. আপিলকারীর অনুকূলে সুস্পষ্ট প্রাথমিক প্রমাণ (prima facie case) রহিয়াছে।</p>
        `;
        prayerEn = `
          The Appellant therefore prays that Your Honour may graciously be pleased to admit this Appeal, call for the lower court records, pass an interim stay order, and set aside the impugned order.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র আপিল শুনানির জন্য গ্রহণ করিয়া নিম্ন আদালতের মূল নথি তলব পূর্বক অন্তর্বর্তীকালীন স্থগিতাদেশ প্রদান করিয়া উক্ত বিতর্কিত আদেশ বাতিল ও খারিজ করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'firstappeal') {
        courtHeaderEn = 'IN THE COURT OF THE APPELLATE AUTHORITY / DL&LRO / ADM (L&LR)';
        courtHeaderBn = 'মাননীয় বিধিবদ্ধ প্রথম আপিল কর্তৃপক্ষ / ডিএলঅ্যান্ডএলআরও সমীপে';
        subjectEn = 'MEMORANDUM OF STATUTORY FIRST APPEAL (ORDER 41 CPC / SEC 54 WBLR ACT)';
        subjectBn = 'বিধিবদ্ধ প্রথম আপিলের স্মারকলিপি (Statutory First Appeal)';
        factsEn = `
          <p>1. That the Appellant is severely aggrieved by and dissatisfied with the impugned order passed by ${vals.spioDetails || 'the lower forum'}.</p>
          <p>2. <strong>Grounds of First Appeal Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That unless interim protection / stay of the impugned order is granted, the Appellant will suffer irreparable loss and injury.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী নিম্ন কর্তৃপক্ষের তর্কিত আদেশে সংক্ষুব্ধ হইয়া অত্র প্রথম আপিল দায়ের করিতেছেন।</p>
          <p>২. <strong>প্রথম আপিলের মূল গ্রাউন্ডস ও বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. স্থগিতাদেশ না দিলে আপিলকারীর অপূরণীয় ক্ষতি হইবে।</p>
        `;
        prayerEn = `
          The Appellant prays that Your Honour may graciously be pleased to admit this Statutory First Appeal, stay operation of the impugned order, and grant full relief.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র প্রথম আপিল গ্রহণ করিয়া বিতর্কিত আদেশের কার্যক্রম স্থগিত পূর্বক আপিলকারীর পক্ষে ন্যায্য প্রতিকার প্রদানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'sec5delay') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক (DL&LRO) সমীপে দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 5 OF THE LIMITATION ACT, 1963 FOR CONDONATION OF DELAY';
        subjectBn = 'তামাদি আইন, ১৯৬৩ এর ৫ ধারা মতে আপিল দাখিলে বিলম্ব মার্জনার দরখাস্ত';
        factsEn = `
          <p>1. That the Appellant has filed the accompanying Memorandum of Appeal against the order passed by the Ld. Revenue Officer.</p>
          <p>2. <strong>Cause of Delay Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the delay was neither intentional nor deliberate, but occasioned by sufficient cause as envisaged under Section 5 of the Limitation Act, 1963.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী আদেশের বিরুদ্ধে সঙ্গে সংযুক্ত আপিল স্মারকলিপি দাখিল করিয়াছেন।</p>
          <p>২. <strong>বিলম্বের পর্যাপ্ত ও যুক্তিগ্রাহ্য কারণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. এই বিলম্ব ইচ্ছাকৃত নহে, বরং তামাদি আইনের ৫ ধারা মতে পর্যাপ্ত কারণে ঘটিয়াছে।</p>
        `;
        prayerEn = `
          It is respectfully prayed that Your Honour may graciously be pleased to condone the delay in preferring the appeal and admit the same on merits.
        `;
        prayerBn = `
          অতএব প্রার্থনা, বিলম্ব মার্জনা করিয়া আপিলটি শুনানির জন্য গ্রহণ করিতে আজ্ঞাবহ হইবেন।
        `;
      } else {
        // conversion
        courtHeaderEn = 'BEFORE THE COLLECTOR / DISTRICT LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় সমাহর্তা / জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে দরখাস্ত';
        subjectEn = 'PETITION UNDER SECTION 4C OF THE WEST BENGAL LAND REFORMS ACT, 1955 FOR CONVERSION OF LAND USE';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৪(গ) ধারা মতে ভূমির ব্যবহার ও শ্রেণি পরিবর্তনের দরখাস্ত';
        factsEn = `
          <p>1. That the Petitioner is the recorded owner and raiyat in respect of the scheduled property.</p>
          <p>2. <strong>Facts & Feasibility of Conversion Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the proposed conversion will not interfere with adjoining drainage or cause any public inconvenience.</p>
        `;
        factsBn = `
          <p>১. আবেদনকারী তফশিল বর্ণিত সম্পত্তির রেকর্ডভুক্ত মালিক ও দখলদার।</p>
          <p>২. <strong>শ্রেণি পরিবর্তনের প্রাসঙ্গিক বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. এই শ্রেণি পরিবর্তনে সংলগ্ন কোনো নিকাশি বা পরিবেশগত ক্ষতি হইবে না।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may be pleased to cause spot inspection and grant formal conversion certificate under Section 4C of WBLR Act, 1955.
        `;
        prayerBn = `
          অতএব প্রার্থনা, রাজস্ব পরিদর্শক দ্বারা স্থান পরিদর্শন পূর্বক শ্রেণি পরিবর্তনের অনুমতি প্রদান করিতে আজ্ঞাবহ হইবেন।
        `;
      }

      let html = `<div style="font-family:'Times New Roman', serif; line-height: 1.8; color: #111;">`;

      // 1. Forum / Bench Header
      if (t === 'rti') {
        html += `
          <div style="background: #f8fafc; border: 1.5px solid #0284c7; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
            <div style="font-weight: bold; font-size: 13px; color: #0369a1; text-transform: uppercase;">TO:</div>
            <div style="font-weight: bold; font-size: 15px; color: #0f172a; margin-top: 2px;">${vals.forum}</div>
            <div style="font-size: 12.5px; color: #475569; margin-top: 2px;">${vals.authorityAddress}</div>
          </div>
        `;
      } else if (t === 'rtifirstappeal') {
        html += `
          <div style="background: #faf5ff; border: 1.5px solid #7c3aed; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
            <div style="font-weight: bold; font-size: 12.5px; color: #6d28d9; text-transform: uppercase;">BEFORE THE FIRST APPELLATE AUTHORITY (FAA) u/s 19(1) RTI ACT, 2005</div>
            <div style="font-weight: bold; font-size: 15px; color: #0f172a; margin-top: 2px;">${vals.forum}</div>
            <div style="font-size: 12.5px; color: #475569;">Address: ${vals.authorityAddress}</div>
            <div style="font-size: 12.5px; color: #b91c1c; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
              <strong>Impugned SPIO Details:</strong> ${vals.spioDetails}
            </div>
          </div>
        `;
      } else {
        if (lang === 'english') {
          html += `
            <div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 4px;">${vals.forum}</div>
            <div style="text-align: center; font-weight: bold; font-size: 13px; color: #1E3A8A; margin-bottom: 16px;">${courtHeaderEn}</div>
          `;
        } else if (lang === 'bengali') {
          html += `
            <div style="text-align: center; font-weight: bold; font-size: 14.5px; color: #1E3A8A; margin-bottom: 4px;">${courtHeaderBn}</div>
            <div style="text-align: center; font-weight: bold; font-size: 12.5px; margin-bottom: 16px; color: #475569;">(${vals.forum})</div>
          `;
        } else {
          html += `
            <div style="text-align: center; border-bottom: 1.5px double #cbd5e1; padding-bottom: 10px; margin-bottom: 16px;">
              <div style="font-weight: bold; font-size: 14px; color: #1E3A8A;">${courtHeaderEn}</div>
              <div style="font-weight: bold; font-size: 13.5px; color: #047857; margin-top: 2px;">${courtHeaderBn}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">(${vals.forum})</div>
            </div>
          `;
        }
      }

      // 2. Cause Title / Parties (strictly no opposite party for RTI; optional for Misc Case)
      if (t === 'rti') {
        html += `
          <div style="margin-bottom: 14px; font-size: 12.5px; background: #f8fafc; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-weight: bold; color: #0369a1; text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">
              Applicant Information (নাগরিক আবেদনকারীর বিবরণ):
            </div>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div>
                <strong>${vals.partyName}</strong><br/>
                S/o: ${vals.fatherName}<br/>
                Address: ${vals.address}<br/>
                ${vals.contactPhone ? `Contact: <strong>${vals.contactPhone}</strong>` : ''}
              </div>
              <div style="text-align: right; font-weight: bold; color: #0284c7;">
                ... Citizen Applicant (আবেদনকারী)
              </div>
            </div>
          </div>
        `;
      } else if (vals.showOppParty && vals.oppParty) {
        if (lang === 'english') {
          html += `
            <div style="margin-bottom: 14px; font-size: 12.5px;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <strong>${vals.partyName}</strong><br/>
                  S/o ${vals.fatherName}<br/>
                  Residing at ${vals.address}
                </div>
                <div style="text-align: right; font-weight: bold;">... Petitioner / Appellant</div>
              </div>
              <div style="text-align: center; margin: 6px 0; font-style: italic; font-weight: bold;">- VERSUS -</div>
              <div style="display: flex; justify-content: space-between;">
                <div><strong>${vals.oppParty}</strong></div>
                <div style="text-align: right; font-weight: bold;">... Opposite Party / Respondent</div>
              </div>
            </div>
          `;
        } else if (lang === 'bengali') {
          html += `
            <div style="margin-bottom: 14px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <strong>${vals.partyName}</strong><br/>
                  পিতা: ${vals.fatherName}<br/>
                  ঠিকানা: ${vals.address}
                </div>
                <div style="text-align: right; font-weight: bold; color: #1E3A8A;">... আবেদনকারী / আপিলকারী</div>
              </div>
              <div style="text-align: center; margin: 6px 0; font-weight: bold;">— বনাম —</div>
              <div style="display: flex; justify-content: space-between;">
                <div><strong>${vals.oppParty}</strong></div>
                <div style="text-align: right; font-weight: bold; color: #475569;">... বিবাদী / প্রতিপক্ষ</div>
              </div>
            </div>
          `;
        } else {
          html += `
            <div style="margin-bottom: 16px; font-size: 12.5px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <strong>${vals.partyName}</strong> (পিতা: ${vals.fatherName})<br/>
                  <span style="color: #475569;">Address / ঠিকানা: ${vals.address}</span>
                </div>
                <div style="text-align: right; font-weight: bold;">... Petitioner / আবেদনকারী</div>
              </div>
              <div style="text-align: center; margin: 6px 0; font-weight: bold; font-style: italic; color: #64748b;">— VERSUS / বনাম —</div>
              <div style="display: flex; justify-content: space-between;">
                <div><strong>${vals.oppParty}</strong></div>
                <div style="text-align: right; font-weight: bold;">... Opposite Party / প্রতিপক্ষ</div>
              </div>
            </div>
          `;
        }
      } else {
        html += `
          <div style="margin-bottom: 14px; font-size: 12.5px; background: #f8fafc; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
              <div>
                <strong>In the matter of: ${vals.partyName}</strong><br/>
                S/o ${vals.fatherName}<br/>
                Residing at ${vals.address}
              </div>
              <div style="text-align: right; font-weight: bold; color: #1e3a8a;">
                ... Petitioner / Applicant (আবেদনকারী)
              </div>
            </div>
          </div>
        `;
      }

      // Case / Reference Block (If Added via + button)
      if (vals.showCaseRef && vals.caseNumber) {
        html += `
          <div style="background: #f1f5f9; border: 1px dashed #64748b; padding: 6px 12px; margin-bottom: 12px; font-size: 12px; border-radius: 4px;">
            <strong>Case / Reference Details (নথি নম্বর):</strong> Case / Memo No: <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `| Date: <strong>${vals.caseDate}</strong>` : ''}
          </div>
        `;
      }

      // 3. Subject Header
      if (lang === 'english') {
        html += `
          <div style="text-align: center; font-weight: bold; font-size: 12.5px; border-top: 1px solid #777; border-bottom: 1px solid #777; padding: 6px 0; margin: 12px 0;">
            ${subjectEn}
          </div>
        `;
      } else if (lang === 'bengali') {
        html += `
          <div style="text-align: center; font-weight: bold; font-size: 13px; border-top: 1.5px solid #1E3A8A; border-bottom: 1.5px solid #1E3A8A; padding: 6px 0; margin: 12px 0; color: #1E3A8A;">
            ${subjectBn}
          </div>
        `;
      } else {
        html += `
          <div style="text-align: center; font-weight: bold; border-top: 1.5px solid #1E3A8A; border-bottom: 1.5px solid #1E3A8A; padding: 8px 0; margin: 14px 0;">
            <div style="font-size: 12.5px; color: #1E3A8A;">${subjectEn}</div>
            <div style="font-size: 12.5px; color: #047857; margin-top: 3px;">${subjectBn}</div>
          </div>
        `;
      }

      // 4. Statement of Facts (Observed by AI)
      if (lang === 'english') {
        html += `
          <div style="font-size: 13px; text-align: justify; margin-bottom: 16px;">
            <p><strong>The humble petition of the Petitioner / Applicant above-named most respectfully sheweth:</strong></p>
            ${factsEn}
          </div>
        `;
      } else if (lang === 'bengali') {
        html += `
          <div style="font-size: 13px; text-align: justify; margin-bottom: 16px;">
            <p><strong>উপরোক্ত আবেদনকারীর সশ্রদ্ধ বিনীত নিবেদন এই যে:</strong></p>
            ${factsBn}
          </div>
        `;
      } else {
        html += `
          <div style="font-size: 12.5px; text-align: justify; margin-bottom: 16px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #1E3A8A; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              STATEMENT OF FACTS / ঘটনা ও আইনগত বিবরণের সারসংক্ষেপ (DUAL LANGUAGE):
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 10px; background: #ffffff; border-left: 3px solid #2563eb; border: 1px solid #e2e8f0;">
                <div style="color: #1e40af; font-size: 11.5px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
                  [ English Version ]
                </div>
                ${factsEn}
              </div>
              <div style="padding: 10px; background: #f0fdf4; border-left: 3px solid #16a34a; border: 1px solid #bbf7d0;">
                <div style="color: #15803d; font-size: 11.5px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">
                  [ বাংলা পূর্ণ বিবরণ ]
                </div>
                ${factsBn}
              </div>
            </div>
          </div>
        `;
      }

      // 5. Land Schedule (সম্পত্তির তপশীল বিবরণ) - ONLY IF REQUIRED OR ADDED VIA + BUTTON
      if (vals.showLandSchedule) {
        html += `
          <div style="margin: 16px 0; padding: 10px; border: 1px solid #777; font-size: 12px; background: #FAFBFD;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 6px; text-decoration: underline; color: #1e3a8a;">
              ${
                lang === 'bengali'
                  ? 'সম্পত্তির তপশীল বিবরণ (SCHEDULE OF PROPERTY)'
                  : lang === 'bilingual'
                  ? 'SCHEDULE OF PROPERTY / সম্পত্তির তপশীল বিবরণ'
                  : 'SCHEDULE OF PROPERTY REFERRED TO ABOVE (সম্পত্তির তপশীল বিবরণ)'
              }
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>District & Mouza (মৌজা ও জে.এল.):</strong> ${vals.mouzaJl}</div>
              <div><strong>Khatian & Dag (খতিয়ান ও দাগ):</strong> ${vals.khatianDag}</div>
              <div><strong>Area & Class (জমির পরিমাণ ও শ্রেণি):</strong> ${vals.landAreaClass}</div>
              <div><strong>Deed / Document (দলিল নম্বর ও তারিখ):</strong> ${vals.deedNoDate}</div>
            </div>
          </div>
        `;
      }

      // 6. Prayer
      if (lang === 'english') {
        html += `
          <div style="font-size: 13px; margin: 16px 0;">
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">PRAYER</div>
            <div>${prayerEn}</div>
          </div>
        `;
      } else if (lang === 'bengali') {
        html += `
          <div style="font-size: 13px; margin: 16px 0;">
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px; color: #1E3A8A;">বিনীত প্রার্থনা (PRAYER)</div>
            <div>${prayerBn}</div>
          </div>
        `;
      } else {
        html += `
          <div style="font-size: 12.5px; margin: 16px 0; padding: 12px; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px;">
            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 8px; color: #854d0e;">
              PRAYER / বিনীত প্রার্থনা (DUAL LANGUAGE):
            </div>
            <div style="margin-bottom: 10px;">
              <strong style="color: #1e3a8a;">[ In English ]:</strong><br/>
              ${prayerEn}
            </div>
            <div style="border-top: 1px dashed #ca8a04; padding-top: 8px;">
              <strong style="color: #15803d;">[ বাংলায় ]:</strong><br/>
              ${prayerBn}
            </div>
          </div>
        `;
      }

      // 7. Footer / Verification
      html += `
          <div style="display: flex; justify-content: space-between; margin-top: 36px; font-size: 12px; border-top: 1px solid #cbd5e1; padding-top: 12px;">
            <div>
              <strong>Date / তারিখ:</strong> ${new Date().toLocaleDateString('en-IN')}<br/>
              <strong>Place / স্থান:</strong> ${activeCompany?.city || 'Kolkata'}, West Bengal
            </div>
            <div style="text-align: right;">
              <strong>${vals.partyName}</strong><br/>
              ${lang === 'bengali' ? 'আবেদনকারী / আপিলকারী' : 'Petitioner / Applicant'}<br/><br/>
              Through Advocate<br/>
              <strong>${activeUser?.name || 'Advocate'}</strong><br/>
              ${activeCompany?.name || 'SRK Legal Chamber'}<br/>
              <span style="font-size: 11px; color: #555;">Bar Reg: ${activeCompany?.barCouncil || 'WB/Chamber'}</span>
            </div>
          </div>
        </div>
      `;

      return html;
    },
    [activeCompany, activeUser]
  );

  // Auto-generate on mount and whenever form values change!
  useEffect(() => {
    const html = buildDraft(template, draftLang, currentFormValues);
    setGeneratedDraft(html);
  }, [template, draftLang, currentFormValues, buildDraft]);

  // Manual regenerate trigger
  const handleGenerate = (targetLang?: DraftLanguage) => {
    const langToUse = targetLang || draftLang;
    if (targetLang) setDraftLang(targetLang);
    const html = buildDraft(template, langToUse, currentFormValues);
    setGeneratedDraft(html);
    showToast(`Draft updated: ${langToUse.toUpperCase()}`);
  };

  // AI Fact Observer: "in all the pages facts of the case can observe by the AI and will draft the the same accordingly."
  const handleObserveFactsWithAi = async () => {
    setIsObservingFacts(true);
    try {
      const res = await fetch('/api/ai/observe-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawFacts: customFacts,
          template,
          draftLang,
          forum,
          schedule: showLandSchedule ? { mouzaJl, khatianDag, landAreaClass, deedNoDate } : null,
          caseRef: showCaseRef ? { caseNumber, caseDate } : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.observedFacts) {
          setCustomFacts(data.observedFacts);
          showToast('Case facts observed and structured by AI', 'success');
          setIsObservingFacts(false);
          return;
        }
      }
    } catch (e) {
      console.warn('AI observe facts endpoint failed, using client-side statutory pleading rules:', e);
    }

    // Client-side instant statutory pleading observation fallback
    if (template === 'rti') {
      setCustomFacts(
        `1. That the Applicant is a citizen of India seeking inspection and certified copies of official revenue records.\n2. Specific Particulars Observed: ${customFacts}\n3. That the requested records are in the lawful custody of the SPIO and not exempt under Section 8 or 9 of RTI Act 2005.`
      );
    } else if (template === 'rtifirstappeal') {
      setCustomFacts(
        `1. That the Appellant filed an application u/s 6(1) of the RTI Act 2005 before the SPIO.\n2. Grounds of Appeal: The SPIO failed to furnish the requested information within 30 statutory days / furnished misleading data.\n3. Specific Grievance Observed: ${customFacts}`
      );
    } else if (template === 'misc10000') {
      setCustomFacts(
        `1. That the Petitioner is a lawful recorded co-sharer in respect of the scheduled property.\n2. Share Anomaly Observed: The computerized ledger indicates aggregate shares in Dag No. do not tally to 10,000 parts.\n3. Case Particulars: ${customFacts}\n4. That rectification u/s 50A WBLR Act is essential to unlock the ROR.`
      );
    } else {
      setCustomFacts(
        `1. That the Petitioner has lawful title and possession over the subject property.\n2. Case Facts Observed: ${customFacts}\n3. That the balance of convenience lies entirely in favour of the Petitioner.`
      );
    }
    showToast('Case facts synthesized by statutory pleading engine', 'info');
    setIsObservingFacts(false);
  };

  // AI Full Smart Draft using Gemini
  const handleAiSmartDraft = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          draftLang,
          formValues: currentFormValues,
          companyName: activeCompany?.name,
          barCouncil: activeCompany?.barCouncil,
          advocateName: activeUser?.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.draftHtml) {
          setGeneratedDraft(data.draftHtml);
          showToast('AI Smart Draft generated successfully with Gemini AI', 'success');
          setIsAiLoading(false);
          // On mobile, switch to preview after generation so user sees result
          if (window.innerWidth < 1024) {
            setMobileView('preview');
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Backend AI draft call failed, falling back to statutory engine:', e);
    }

    const fallback = buildDraft(template, draftLang, currentFormValues);
    setGeneratedDraft(fallback);
    showToast('Legal draft generated with West Bengal statutory pleading engine', 'success');
    setIsAiLoading(false);
    if (window.innerWidth < 1024) {
      setMobileView('preview');
    }
  };

  const copyDraftToClipboard = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedDraft;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      showToast('Draft copied to clipboard');
    });
  };

  const downloadDraftWordDoc = () => {
    if (!generatedDraft) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>Legal Pleading - ${template} - ${draftLang}</title>
        </head>
        <body style="font-family:'Times New Roman',serif; padding:40px;">
          ${generatedDraft}
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Draft_${template}_${draftLang}_${partyName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Draft exported as Word document (.doc)');
  };

  // Folder Learning simulator
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files).map(f => f.name);
    setFolderFiles(names);
    showToast(`Loaded ${names.length} chamber files for learning`);
  };

  const startFolderScan = () => {
    if (folderFiles.length === 0) {
      showToast('Select chamber folder or files first', 'error');
      return;
    }
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLearnedPatterns({
            chamberHeader: `${activeCompany?.name || 'SRK Legal Chamber'}, Alipore Judges Court Bar`,
            prayerStyle: 'Formal Prayer with sub-clauses (a, b, c) and interim protection clause',
            citationStyle: 'WBLR Act 1955 & RTI Act 2005 format',
            totalDocsLearned: folderFiles.length
          });
          showToast(`Learned formatting patterns from ${folderFiles.length} files`);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-16 sm:pb-8">
      {/* Header card with contextual case back button if opened from specific menu/case */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Go back to previous menu"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600 shrink-0" />
              <span>AI Drafting Studio (আইনি ড্রাফটিং স্টুডিও)</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lockCaseType && initialCaseType !== 'all' ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md">
                <span>Form Type: {initialCaseType.toUpperCase()} Drafting</span>
                <span>• Showing only {initialCaseType.toUpperCase()} options</span>
              </span>
            ) : (
              'Automated legal petition drafting in English, বাংলা (Bengali), and Dual-Language (উভয় ভাষা).'
            )}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Petition Drafting
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'learning'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Chamber Learning
          </button>
        </div>
      </div>

      {activeTab === 'draft' && (
        <>
          {/* CATEGORY FILTER: "according to form type only show the options for ai drafting in the rti, misc case, lr appeal case or any others" */}
          {!lockCaseType ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-violet-600" />
                  <span>Select Case Form Type (মামলার ধরন অনুযায়ী ড্রাফটিং বিকল্প)</span>
                </span>
                <span className="text-[10px] text-violet-600 font-semibold uppercase bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded">
                  Showing {selectedCategory.toUpperCase()} Options Only
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('rti')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'rti'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>RTI Matter (তথ্য অধিকার)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('misc')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'misc'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Misc Case (মিস কেস / ১০,০০০ হিস্যা)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('lrappeal')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'lrappeal'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>LR Appeal (এল.আর. আপিল ধারা ৫৪)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('firstappeal')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'firstappeal'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>First Appeal (বিধিবদ্ধ প্রথম আপিল)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('conversion')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'conversion'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Conversion (বাস্তু রূপান্তর ৪সি)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('lrtt')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'lrtt'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>WBLRTT Tribunal (ট্রাইব্যুনাল আপিল)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                  Drafting Form Adjusted to: {initialCaseType.toUpperCase()} {prefilledCase?.subType ? `· ${prefilledCase.subType}` : 'Case'}
                </span>
                <span className="text-[11px] text-violet-700 dark:text-violet-400">
                  (Tailored to {prefilledCase?.subType || initialCaseType.toUpperCase()} menu &amp; sub-menu)
                </span>
              </div>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 hover:bg-violet-100 text-violet-800 dark:text-violet-300 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Menu
                </button>
              )}
            </div>
          )}

          {/* MOBILE VIEW TOGGLE: "please make fitable or adjustable according to device. which will show all the options of the device." */}
          <div className="lg:hidden flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMobileView('form')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === 'form'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>1. Form Inputs (ইনপুট)</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Draft Preview (প্রিভিউ)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Controls column (5 cols on desktop, responsive on mobile) */}
            <div className={`lg:col-span-5 space-y-4 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <span>1. Select Language & Template</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Live Auto-Draft
                  </span>
                </div>

                {/* Language Selection Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-violet-600" />
                      <span>Drafting Language (ভাষার ধরন)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                      {draftLang === 'bilingual'
                        ? 'উভয় ভাষা (Dual Language)'
                        : draftLang === 'bengali'
                        ? 'বাংলা (Bengali)'
                        : 'English (ইংরেজি)'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleGenerate('english')}
                      className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        draftLang === 'english'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('bengali')}
                      className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        draftLang === 'bengali'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('bilingual')}
                      className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer text-center ${
                        draftLang === 'bilingual'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Both (উভয়)
                    </button>
                  </div>
                </div>

                {/* Template Select filtered strictly by case/form type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Drafting Options for {selectedCategory.toUpperCase()} (ড্রাফটিং বিকল্প)
                    </label>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded">
                      {allowedTemplates.length} option{allowedTemplates.length > 1 ? 's' : ''} only
                    </span>
                  </div>

                  {/* Quick Selectable Option Cards for this specific form type */}
                  <div className="space-y-1.5 mb-2">
                    {allowedTemplates.map(t => {
                      const isSelected = template === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTemplate(t.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            isSelected
                              ? 'border-violet-600 bg-violet-50/80 dark:bg-violet-950/50 ring-1 ring-violet-500/50 text-violet-950 dark:text-violet-100 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-violet-600 bg-violet-600 text-white'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold leading-tight">
                              {language === 'bn' ? t.labelBn : t.labelEn}
                            </div>
                            {'desc' in t && t.desc && (
                              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                {t.desc}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION: Authority / SPIO fields */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      {template === 'rti'
                        ? 'To: SPIO or Authority (জনতথ্য আধিকারিক / কর্তৃপক্ষ)'
                        : template === 'rtifirstappeal'
                        ? 'Application Authority / FAA (প্রথম আপিল কর্তৃপক্ষ)'
                        : 'Adjudicating Authority / Forum (আদালত / কর্তৃপক্ষ)'}
                    </label>
                    <input
                      type="text"
                      value={forum}
                      onChange={e => setForum(e.target.value)}
                      placeholder="e.g. To: The State Public Information Officer (SPIO) & BL&LRO, Rajarhat"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      {template === 'rti' ? 'SPIO Office Address (ঠিকানা)' : 'Authority Office Address (কার্যালয়ের ঠিকানা)'}
                    </label>
                    <input
                      type="text"
                      value={authorityAddress}
                      onChange={e => setAuthorityAddress(e.target.value)}
                      placeholder="e.g. Office of the BL&LRO, Rajarhat, North 24 Parganas"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  {/* SPIO Details for First Appeal as requested */}
                  {(template === 'rtifirstappeal' || template === 'firstappeal') && (
                    <div>
                      <label className="block text-[10px] font-bold text-violet-700 dark:text-violet-400 uppercase mb-1 flex items-center justify-between">
                        <span>SPIO Details (সংশ্লিষ্ট এস.পি.আই.ও.-র বিবরণ)</span>
                        <span className="text-[9px] text-slate-400 font-normal">Against whose order/delay appealed</span>
                      </label>
                      <input
                        type="text"
                        value={spioDetails}
                        onChange={e => setSpioDetails(e.target.value)}
                        placeholder="e.g. State Public Information Officer & Revenue Officer, BL&LRO Office Rajarhat"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION: Applicant / Petitioner Details */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        {template === 'rti' ? 'Applicant Name (আবেদনকারী)' : 'Petitioner / Appellant Name'}
                      </label>
                      <input
                        type="text"
                        value={partyName}
                        onChange={e => setPartyName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Father / Husband (পিতা/স্বামী)
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={e => setFatherName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Address (আবেদনকারীর ঠিকানা)
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Phone / Mobile
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="98300..."
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION: Opposite Party - ONLY when enabled or added via + button */}
                {/* For RTI: strictly no opposite party. For Misc Case: opposite party added via + button */}
                {template !== 'rti' && (
                  <div className="pt-1">
                    {showOppParty ? (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                            Opposite Party (বিবাদী / প্রতিপক্ষ)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowOppParty(false)}
                            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer font-semibold"
                          >
                            <X className="w-3 h-3" /> Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={oppParty}
                          onChange={e => setOppParty(e.target.value)}
                          placeholder="e.g. The State of West Bengal, represented by BL&LRO"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowOppParty(true)}
                        className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <Plus className="w-3.5 h-3.5 text-violet-600" />
                        <span>+ Add Opposite Party (বিবাদী / প্রতিপক্ষ যোগ করুন)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* SECTION: Land Schedule (সম্পত্তির তপশীল বিবরণ) - Default shown for Misc, optional via + for RTI & First Appeal */}
                <div className="pt-1">
                  {showLandSchedule ? (
                    <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-blue-100 dark:border-blue-900/40">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Property Schedule (সম্পত্তির তপশীল বিবরণ)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowLandSchedule(false)}
                          className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Schedule
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Mouza & JL (মৌজা ও জে.এল.)
                          </label>
                          <input
                            type="text"
                            value={mouzaJl}
                            onChange={e => setMouzaJl(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Khatian & Dag (খতিয়ান ও দাগ)
                          </label>
                          <input
                            type="text"
                            value={khatianDag}
                            onChange={e => setKhatianDag(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Area & Class (পরিমাণ ও শ্রেণি)
                          </label>
                          <input
                            type="text"
                            value={landAreaClass}
                            onChange={e => setLandAreaClass(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Deed No & Date (দলিল)
                          </label>
                          <input
                            type="text"
                            value={deedNoDate}
                            onChange={e => setDeedNoDate(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLandSchedule(true)}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-blue-50/30 dark:bg-blue-950/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Land Schedule (সম্পত্তির তপশীল বিবরণ যোগ করুন)</span>
                    </button>
                  )}
                </div>

                {/* SECTION: Case Reference / Order Details - Optional via + button */}
                <div className="pt-0.5">
                  {showCaseRef ? (
                    <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>Case / RTI Application Reference</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCaseRef(false)}
                          className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                            Case / Memo No.
                          </label>
                          <input
                            type="text"
                            value={caseNumber}
                            onChange={e => setCaseNumber(e.target.value)}
                            placeholder="e.g. RTI/2024/091"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                            Filing / Order Date
                          </label>
                          <input
                            type="text"
                            value={caseDate}
                            onChange={e => setCaseDate(e.target.value)}
                            placeholder="DD-MM-YYYY"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCaseRef(true)}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-800 hover:border-amber-500 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-amber-50/30 dark:bg-amber-950/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Case Reference / Details (মামলা / দরখাস্ত নম্বর)</span>
                    </button>
                  )}
                </div>

                {/* SECTION: FACTS OF THE CASE (OBSERVED AND DRAFTED BY AI) */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      <span>Facts of the Case (ঘটনার বিবরণ ও আইনি ভিত্তি)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleObserveFactsWithAi}
                      disabled={isObservingFacts}
                      className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 cursor-pointer bg-violet-50 dark:bg-violet-950/60 px-2 py-1 rounded-full border border-violet-200 dark:border-violet-800 disabled:opacity-50"
                    >
                      {isObservingFacts ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Observing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> AI Observe & Draft Facts
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick 1-click observation chips tailored for the active template */}
                  <div className="flex flex-wrap gap-1">
                    {template === 'rti' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Seeking certified copy of Revenue Inspector spot inspection inquiry report and sketch map.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + RI Field Report
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Certified copy of order-sheet and hearing notices issued in the subject case.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + Order-Sheet & Notices
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Current status and certified grounds for non-disposal within statutory timeframe.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + Delay Reason Query
                        </button>
                      </>
                    )}
                    {template === 'rtifirstappeal' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• SPIO failed to respond within 30 statutory days, amounting to deemed refusal u/s 7(2).`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + 30-Day Deemed Refusal
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Furnished misleading, incomplete and uncertified documents in violation of RTI Act.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + Misleading / Incomplete
                        </button>
                      </>
                    )}
                    {template === 'misc10000' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Aggregate share in computerized Banglarbhumi Dag exceeds 10,000 parts, locking the Khatian.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + 10,000 Share Overflow
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Unrecorded inherited portion of co-sharer creating fractional calculation deficit.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + Co-Sharer Inherited Share
                        </button>
                      </>
                    )}
                    {template === 'lrappeal' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Impugned order passed without statutory hearing notice under Rule 24 WBLR Manual 1991.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + No Hearing Notice (Rule 24)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFacts(
                              prev =>
                                `${prev}\n• Primary authority ignored registered chain deeds and uninterrupted raiyati possession.`
                            )
                          }
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                        >
                          + Chain Deeds Ignored
                        </button>
                      </>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={customFacts}
                    onChange={e => setCustomFacts(e.target.value)}
                    placeholder="Enter case facts or rough notes here. The AI will observe them and draft the formal petition paragraphs accordingly..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-normal focus:ring-2 focus:ring-violet-600"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Tip: In all pages, the AI observes these facts to draft the cause title, submissions, grounds, and prayer accordingly.
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleAiSmartDraft}
                    disabled={isAiLoading}
                    className="w-full py-2.5 px-3 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 min-h-[44px]"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> AI Smart Draft
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile switch to preview quick button */}
                <div className="lg:hidden pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMobileView('preview')}
                    className="w-full py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Switch to Draft Preview →
                  </button>
                </div>
              </div>
            </div>

            {/* Draft Preview column (7 cols on desktop, responsive on mobile) */}
            <div
              className={`lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[560px] ${
                mobileView === 'form' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-violet-600" />
                      Legal Draft Preview
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        draftLang === 'bilingual'
                          ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300'
                          : draftLang === 'bengali'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}
                    >
                      {draftLang === 'bilingual' ? 'Dual Language (উভয় ভাষা)' : draftLang}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Instant language switcher tabs */}
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleGenerate('english')}
                        className={`px-2.5 py-1 font-semibold rounded cursor-pointer transition-colors ${
                          draftLang === 'english'
                            ? 'bg-white dark:bg-slate-700 text-blue-600 font-bold shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerate('bengali')}
                        className={`px-2.5 py-1 font-semibold rounded cursor-pointer transition-colors ${
                          draftLang === 'bengali'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        বাংলা
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerate('bilingual')}
                        className={`px-2.5 py-1 font-semibold rounded cursor-pointer transition-colors ${
                          draftLang === 'bilingual'
                            ? 'bg-white dark:bg-slate-700 text-violet-600 font-bold shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Both (উভয়)
                      </button>
                    </div>

                    {generatedDraft && (
                      <>
                        <button
                          onClick={copyDraftToClipboard}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Copy text to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button
                          onClick={downloadDraftWordDoc}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Export document to MS Word"
                        >
                          <Download className="w-3.5 h-3.5" /> Word (.doc)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {generatedDraft ? (
                  <div
                    className="mt-4 p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[640px] overflow-y-auto overflow-x-auto text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: generatedDraft }}
                  />
                ) : (
                  <div className="py-24 text-center space-y-2">
                    <Brain className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Preparing Live Draft...
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile switch back to form button */}
              <div className="lg:hidden pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMobileView('form')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> ← Back to Form Inputs
                </button>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span>Standard West Bengal Revenue Court Format · সম্পত্তির তপশীল বিবরণ</span>
                <span>Unicode Bengali & English Validated</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: CHAMBER FOLDER LEARNING */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                Connect Chamber Document Archive
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload historical petitions, appeals, and deeds. The learning engine analyzes title
                conventions, prayer structures, and citations to tailor new drafts to your chamber's signature style.
              </p>
            </div>

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <FolderOpen className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform mb-3" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to Select Chamber Files or Folder
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Accepts .doc, .docx, .pdf, and .txt files
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFolderSelect}
              />
            </label>

            {folderFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Selected Files: {folderFiles.length} documents</span>
                  <button
                    onClick={startFolderScan}
                    disabled={isScanning}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? 'Analyzing Patterns...' : 'Start Pattern Learning'}
                  </button>
                </div>

                {isScanning && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      Processing: {scanProgress}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Learned Patterns Card */}
          {learnedPatterns && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Learned Chamber Signature Patterns ({learnedPatterns.totalDocsLearned} Docs)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Chamber Header</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {learnedPatterns.chamberHeader}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Prayer Formula</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {learnedPatterns.prayerStyle}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Statutory Citation</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {learnedPatterns.citationStyle}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('draft');
                    showToast('Applying learned signature format to drafting engine');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Draft Petition Using Learned Style →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
