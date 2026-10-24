import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { CaseType, CaseItem, DraftingMatterType } from '../types';
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
  Gavel,
  ChevronDown,
  Archive
} from 'lucide-react';

export type DraftLanguage = 'english' | 'bengali' | 'bilingual';

// Mutation drafting is completely removed as requested
export type TemplateType =
  // Core / Backward compatibility aliases
  | 'rti'
  | 'rtifirstappeal'
  | 'misc10000'
  | 'lrappeal'
  | 'firstappeal'
  | 'sec5delay'
  | 'conversion'
  | 'lrtt'
  | 'barga'
  // RTI Matters (u/s 6(1), 7(1), 19(1), 19(2), 19(3), 18 & 20)
  | 'rti_sec6_1'
  | 'rti_sec7_1'
  | 'rti_sec19_1'
  | 'rti_sec19_2'
  | 'rti_sec19_3'
  | 'rti_sec18_20'
  // Land Appeal u/s 54 WBLR Act
  | 'lrappeal_memo'
  | 'lrappeal_stay'
  | 'lrappeal_statusquo'
  | 'lrappeal_localinspect'
  // Delay Condonation u/s 5 Limitation Act
  | 'sec5_appeal_delay'
  | 'sec5_supported_affidavit'
  | 'sec14_exclusion'
  // Misc Cases & 10000 Share u/s 50A
  | 'misc_share10000'
  | 'misc_barga_revoke'
  | 'misc_name_rect'
  | 'misc_share_area_rect'
  | 'misc_rslr_mapping'
  | 'misc_record_rect'
  | 'misc_demarcation'
  | 'misc_class_porcha_rect'
  | 'misc_vested_ceiling'
  | 'misc_delete_wrong'
  | 'misc_reopen_hear'
  | 'misc_other_petition'
  // Land Conversion u/s 4C
  | 'conv_sec4c'
  | 'conv_regularize'
  | 'conv_khatian_update'
  // WBLRTT Tenancy Tribunal u/s 6
  | 'lrtt_oa'
  | 'lrtt_interim_stay'
  | 'lrtt_sec5_delay'
  | 'lrtt_contempt'
  // Statutory First Appeal (CPC / Sec 54)
  | 'firstappeal_memo'
  | 'firstappeal_stay'
  | 'firstappeal_addl_evidence'
  // Bargadar & Barga Matters u/s 15-21
  | 'barga_prevent_evict'
  | 'barga_recording'
  | 'barga_produce_share'
  | 'barga_surrender';

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
  initialCaseType?: CaseType | DraftingMatterType | 'all';
  lockCaseType?: boolean;
  prefilledCase?: Partial<CaseItem> | null;
  onBack?: () => void;
}

export interface TemplateOption {
  id: TemplateType;
  section: string;
  labelEn: string;
  labelBn: string;
  desc: string;
}

// Complete arranged legal setup for Land-related and RTI-related matters with statutory sections
export const CASE_TEMPLATES_MAP: Record<string, TemplateOption[]> = {
  rti: [
    {
      id: 'rti_sec6_1',
      section: '[Sec 6(1)]',
      labelEn: 'RTI Application u/s 6(1)',
      labelBn: 'তথ্য জানার অধিকার দরখাস্ত (ধারা ৬(১))',
      desc: 'Demand certified public records from SPIO'
    }
  ],
  rti_sec6_1: [
    {
      id: 'rti_sec6_1',
      section: '[Sec 6(1)]',
      labelEn: 'RTI Application u/s 6(1)',
      labelBn: 'তথ্য জানার অধিকার দরখাস্ত (ধারা ৬(১))',
      desc: 'Demand certified public records from SPIO under Sec 6(1)'
    }
  ],
  rti_sec19_1: [
    {
      id: 'rti_sec19_1',
      section: '[Sec 19(1)]',
      labelEn: 'RTI First Appeal u/s 19(1)',
      labelBn: 'আর.টি.আই. প্রথম আপিল স্মারকলিপি (ধারা ১৯(১))',
      desc: 'First Appeal before First Appellate Authority (FAA) against SPIO failure / delay'
    }
  ],
  rti_sec19_2: [
    {
      id: 'rti_sec19_2',
      section: '[Sec 19(2)]',
      labelEn: 'Third Party Appeal u/s 19(2)',
      labelBn: 'তৃতীয় পক্ষের অধিকার সুরক্ষার্থে আপিল (ধারা ১৯(২))',
      desc: 'First Appeal by affected third party against disclosure or wrongful orders u/s 19(2)'
    }
  ],
  lrappeal: [
    {
      id: 'lrappeal_memo',
      section: '[Sec 54]',
      labelEn: 'Memo of Statutory Appeal before DL&LRO against Lower Order',
      labelBn: 'এল.আর. আপিল মেমোরেন্ডাম (ধারা ৫৪ - DL&LRO)',
      desc: 'Statutory Appeal before DL&LRO against erroneous orders of Revenue Officer u/s 54'
    },
    {
      id: 'lrappeal_stay',
      section: '[Sec 54(3) / O 41 R 5]',
      labelEn: 'Application for Interim Stay of Impugned Revenue Order',
      labelBn: 'তর্কিত আদেশের কার্যক্রম স্থগিতাদেশের অন্তর্বর্তী আবেদন',
      desc: 'Interim stay petition restraining execution/implementation of lower revenue order'
    },
    {
      id: 'lrappeal_statusquo',
      section: '[Sec 54 / Injunction]',
      labelEn: 'Petition for Status Quo & Restraining Possession Change',
      labelBn: 'জমির অবস্থা ও দখল অক্ষুণ্ণ রাখার স্থিতাবস্থা আবেদন',
      desc: 'Status quo / Injunction petition preserving physical possession and nature/character of land'
    },
    {
      id: 'lrappeal_localinspect',
      section: '[Sec 54 / O 39 R 7]',
      labelEn: 'Application for Local Field Inspection & Spot Inquiry by RO',
      labelBn: 'সরজমিন তদন্ত ও স্থানীয় পরিদর্শনের আবেদন',
      desc: 'Local spot investigation through Revenue Inspector/Kanungo to ascertain ground reality'
    }
  ],
  limitation: [
    {
      id: 'sec5_appeal_delay',
      section: '[Sec 5 Limitation Act]',
      labelEn: 'Petition for Condonation of Delay in Preferring Appeal',
      labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মার্জনার দরখাস্ত',
      desc: 'Limitation Act condonation of delay explaining day-to-day sufficient cause'
    },
    {
      id: 'sec5_supported_affidavit',
      section: '[Sec 5 & O 19 CPC]',
      labelEn: 'Delay Condonation Petition with Accompanying Affidavit',
      labelBn: 'হলফনামাসহ বিলম্ব মার্জনা আবেদনপত্র',
      desc: 'Formal delay condonation petition with sworn verification affidavit'
    },
    {
      id: 'sec14_exclusion',
      section: '[Sec 14 Limitation Act]',
      labelEn: 'Exclusion of Time Spent in Good Faith in Wrong Forum',
      labelBn: 'ভুল ফোরামে সরলবিশ্বাসে মামলার সময় বাদ দেওয়ার আবেদন',
      desc: 'Statutory exclusion of time prosecuted in good faith before court lacking jurisdiction'
    }
  ],
  misc: [
    {
      id: 'misc_share10000',
      section: '[Sec 50A WBLR Act]',
      labelEn: '10000 Share Overlapping / Share Problem (Sec 50A)',
      labelBn: '১০,০০০ হিস্যা বৈষম্য নিরসন ও খতিয়ান সংশোধন (ধারা ৫০ক)',
      desc: 'Petition to RO for re-apportioning 10,000 fractional share parts and unlocking khatian on Banglarbhumi'
    },
    {
      id: 'misc_barga_revoke',
      section: '[Sec 50 / 21B]',
      labelEn: 'Barga Revoke / De-recording of Bargadar (Sec 50 / 21B)',
      labelBn: 'বর্গা রেকর্ড রদ ও অননুমোদিত বর্গাদার কর্তন (ধারা ৫০ / ২১খ)',
      desc: 'Petition for de-recording / revoking wrongful or non-existent bargadar recording from Rayati Khatian upon inquiry'
    },
    {
      id: 'misc_name_rect',
      section: '[Sec 50 / 51A]',
      labelEn: 'Name Correction / Title Rectification in ROR (Sec 50)',
      labelBn: 'রায়তের নাম, পিতার নাম ও পদবী ত্রুটি সংশোধন (ধারা ৫০)',
      desc: 'Correction of clerical spelling errors in Rayat Name, Parent/Spouse Name, or Surname in computerized Khatian'
    },
    {
      id: 'misc_share_area_rect',
      section: '[Sec 50 / 50A]',
      labelEn: 'Share Correction / Area Rectification (Sec 50 / 50A)',
      labelBn: 'অংশ ও পরিমাণ ত্রুটি সংশোধন (ধারা ৫০ / ৫০ক)',
      desc: 'Rectification of mathematical discrepancy between purchased title deed quantum and computerized Khatian area/share'
    },
    {
      id: 'misc_rslr_mapping',
      section: '[Sec 50 / LR Manual]',
      labelEn: 'RS to LR Conveyance / Transfer Mapping (Sec 50)',
      labelBn: 'আর.এস. হইতে এল.আর. দাগ-খতিয়ান হস্তান্তর সমন্বয় (ধারা ৫০)',
      desc: 'Petition for establishing chronological RS-LR trace mapping and recording Rayat in LR Khatian'
    },
    {
      id: 'misc_record_rect',
      section: '[Sec 50 / 51A(4)]',
      labelEn: 'Record Correction / Erroneous Record Rectification (Sec 50 / 51A)',
      labelBn: 'ভুল রেকর্ড সংশোধন ও শুদ্ধ রৈয়তি খতিয়ান প্রণয়ন (ধারা ৫০ / ৫১ক)',
      desc: 'Comprehensive petition for correcting erroneous entries, wrong khatian links, or omissions in computerized ROR'
    },
    {
      id: 'misc_demarcation',
      section: '[Rule 28 WBLR Manual]',
      labelEn: 'Boundary Dispute / Demarcation & Survey (Rule 28 Manual)',
      labelBn: 'সীমানা বিবাদ ও দাগের ডিমারকেশন / পরিমাপ আবেদন (২৮ বিধি)',
      desc: 'Fixation of boundaries, plot measurement, and spot demarcating of plot by official Amine/Surveyor'
    },
    {
      id: 'misc_class_porcha_rect',
      section: '[Sec 50 / 4C]',
      labelEn: 'Classification Correction / Porcha Rectification (Sec 50)',
      labelBn: 'জমির শ্রেণি সংশোধন ও কম্পিউটার পর্চা ত্রুটি নিরসন (ধারা ৫০)',
      desc: 'Correction of wrongly entered land classification in computerized Porcha based on physical character and field verification'
    },
    {
      id: 'misc_vested_ceiling',
      section: '[Sec 14T / 14Z / 50A]',
      labelEn: 'Vested Land / Ceiling Objection & Release (Sec 14T / 14Z)',
      labelBn: 'ভেস্টেড জমি / সিলিং আপত্তি নিরসন ও খতিয়ান অবমুক্তি (ধারা ১৪টি/১৪জেড)',
      desc: 'Objection against wrongful recording of land as State Vested / Ceiling Surplus and petition for release of raiyati title'
    },
    {
      id: 'misc_delete_wrong',
      section: '[Sec 50A]',
      labelEn: 'Expunge Wrong Co-Sharer / Erroneous Entry from ROR (Sec 50A)',
      labelBn: 'খতিয়ানে অনধিকার ব্যক্তির ভুল নাম কর্তন দরখাস্ত (ধারা ৫০ক)',
      desc: 'Striking off fraudulent or unauthorized stranger co-sharer entered without deed or lineage'
    },
    {
      id: 'misc_reopen_hear',
      section: '[Natural Justice / Sec 50]',
      labelEn: 'Recall Ex-Parte Misc Order & Reopen Hearing (Natural Justice)',
      labelBn: 'একতরফা শুনানি আদেশ প্রত্যাহার ও পুনর্বিবেচনার আবেদন (প্রাকৃতিক ন্যায়বিচার)',
      desc: 'Recalling ex-parte order passed without serving statutory hearing notice under principles of natural justice'
    },
    {
      id: 'misc_other_petition',
      section: '[Sec 50 WBLR Act]',
      labelEn: 'Other Miscellaneous Revenue Petition (Sec 50)',
      labelBn: 'অন্যান্য বিবিধ রাজস্ব আবেদনপত্র (ধারা ৫০)',
      desc: 'General miscellaneous petition before Revenue Officer / BL&LRO for revenue inquiry and administrative relief'
    }
  ],
  conversion: [
    {
      id: 'conv_sec4c',
      section: '[Sec 4C]',
      labelEn: 'Application for Land Use Conversion (Sali to Bastu / Comm.)',
      labelBn: 'বাস্তু / বাণিজ্যিক শ্রেণি রূপান্তর দরখাস্ত (ধারা ৪সি)',
      desc: 'Application to Collector / DL&LRO for permission to change land classification'
    },
    {
      id: 'conv_regularize',
      section: '[Sec 4C(6)]',
      labelEn: 'Regularization of Post-Facto Land Use Change & Fine Remission',
      labelBn: 'অননুমোদিত ব্যবহারের নিয়মিতকরণ দরখাস্ত',
      desc: 'Regularization of existing construction / use upon payment of statutory compounding fees'
    },
    {
      id: 'conv_khatian_update',
      section: '[Sec 4C read with 50]',
      labelEn: 'Application for Updating ROR after Conversion Order',
      labelBn: 'রূপান্তরোত্তর কম্পিউটারাইজড খতিয়ান রেকর্ড সংশোধন',
      desc: 'Updating Banglarbhumi computerized ledger reflecting new conversion certificate'
    }
  ],
  lrtt: [
    {
      id: 'lrtt_oa',
      section: '[Sec 6 WBLRTT Act]',
      labelEn: 'Original Application (O.A.) challenging Appellate Order',
      labelBn: 'ভূমি সংস্কার ট্রাইব্যুনাল মূল আবেদন (O.A.)',
      desc: 'Tribunal petition challenging order of DL&LRO or Appellate Authority u/s 6'
    },
    {
      id: 'lrtt_interim_stay',
      section: '[Sec 6(2) WBLRTT Act]',
      labelEn: 'Application for Interim Stay / Injunction pending O.A.',
      labelBn: 'ট্রাইব্যুনালে অন্তর্বর্তীকালীন স্থগিতাদেশ আবেদন (M.A.)',
      desc: 'Interim protection restraining disturbance of possession during trial'
    },
    {
      id: 'lrtt_sec5_delay',
      section: '[Sec 6 & Sec 5 Lim.]',
      labelEn: 'Delay Condonation in Filing Tribunal O.A.',
      labelBn: 'ট্রাইব্যুনালে ও.এ. দাখিলে বিলম্ব মার্জনা আবেদন',
      desc: 'Condoning delay in approaching Tenancy Tribunal within limitation'
    },
    {
      id: 'lrtt_contempt',
      section: '[Sec 15 WBLRTT Act]',
      labelEn: 'Contempt Petition for Disobedience of Tribunal Orders',
      labelBn: 'ট্রাইব্যুনালের নির্দেশ অমান্যের আদালত অবমাননা আবেদন',
      desc: 'Action against contemnors for violating Tribunal interim status quo'
    }
  ],
  firstappeal: [
    {
      id: 'firstappeal_memo',
      section: '[Sec 96 / O 41 R 1 CPC]',
      labelEn: 'Memorandum of Statutory First Appeal',
      labelBn: 'বিধিবদ্ধ প্রথম আপিলের স্মারকলিপি',
      desc: 'Appellate memorandum challenging decree or formal order on merits'
    },
    {
      id: 'firstappeal_stay',
      section: '[Order 41 Rule 5 CPC]',
      labelEn: 'Application for Stay of Execution / Lower Decree',
      labelBn: 'রায় ও ডিক্রি কার্যকর স্থগিতের আবেদনপত্র',
      desc: 'Stay of lower court decree or proceedings during pendency of appeal'
    },
    {
      id: 'firstappeal_addl_evidence',
      section: '[Order 41 Rule 27 CPC]',
      labelEn: 'Petition for Production of Additional Evidence in Appeal',
      labelBn: 'আপিল স্তরে অতিরিক্ত প্রমাণ ও দলিল দাখিলের আবেদন',
      desc: 'Application to produce certified documents not available earlier'
    }
  ],
  barga: [
    {
      id: 'barga_prevent_evict',
      section: '[Sec 17(1) WBLR Act]',
      labelEn: 'Application to Prevent Illegal Eviction / Termination of Cultivation',
      labelBn: 'বর্গাদারের বেআইনি উচ্ছেদ রোধ ও সুরক্ষা আবেদন',
      desc: 'Preventing land owner from terminating cultivation without RO order u/s 17(1)'
    },
    {
      id: 'barga_recording',
      section: '[Sec 21B WBLR Act]',
      labelEn: 'Petition for Recording Name as Bargadar in Field ROR',
      labelBn: 'খতিয়ানে বর্গাদার হিসেবে নাম রেকর্ডভুক্তির আবেদন',
      desc: 'Recording of actual tiller / cultivator under Operation Barga principles'
    },
    {
      id: 'barga_produce_share',
      section: '[Sec 16 WBLR Act]',
      labelEn: 'Petition for Tender / Deposit of Crop Produce Share before RO',
      labelBn: 'ফসলের ন্যায্য অংশ রাজস্ব আধিকারিকের নিকট জমাদানের আবেদন',
      desc: 'Tender of landlord share of produce upon refusal or non-issuance of receipt'
    },
    {
      id: 'barga_surrender',
      section: '[Sec 20B WBLR Act]',
      labelEn: 'Verification of Voluntary Surrender / Abandonment of Cultivation',
      labelBn: 'বর্গা অধিকার স্বেচ্ছায় সমর্পণ বা প্রত্যাহারের যাচাই',
      desc: 'Statutory verification by Revenue Officer regarding voluntary surrender'
    }
  ]
};

export const CASE_FORM_TYPE_OPTIONS: { id: DraftingMatterType; labelEn: string; labelBn: string }[] = [
  { id: 'rti_sec6_1', labelEn: 'RTI Application (u/s 6(1) RTI Act)', labelBn: 'তথ্য জানার অধিকার দরখাস্ত (ধারা ৬(১))' },
  { id: 'rti_sec19_1', labelEn: 'RTI First Appeal (u/s 19(1) RTI Act)', labelBn: 'আর.টি.আই. প্রথম আপিল (ধারা ১৯(১))' },
  { id: 'rti_sec19_2', labelEn: 'RTI Appeal u/s 19(2) [Third Party]', labelBn: 'আর.টি.আই. তৃতীয় পক্ষের আপিল (ধারা ১৯(২))' },
  { id: 'lrappeal', labelEn: 'Land Appeal (u/s 54 WBLR Act 1955)', labelBn: 'এল.আর. আপিল (ধারা ৫৪ - DL&LRO)' },
  { id: 'limitation', labelEn: 'Delay Condonation (u/s 5 of Limitation Act 1963)', labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মার্জনা' },
  { id: 'misc', labelEn: 'Misc Cases & 10000 Share (u/s 50A WBLR Act)', labelBn: 'বিবিধ মোকদ্দমা ও ১০,০০০ হিস্যা বৈষম্য (ধারা ৫০ক)' },
  { id: 'conversion', labelEn: 'Land Conversion (u/s 4C WBLR Act 1955)', labelBn: 'বাস্তু ও শ্রেণি রূপান্তর (ধারা ৪সি)' },
  { id: 'lrtt', labelEn: 'WBLRTT Tenancy Tribunal (u/s 6 Act 1997)', labelBn: 'ভূমি সংস্কার ট্রাইব্যুনাল (WBLRTT Tribunal)' },
  { id: 'firstappeal', labelEn: 'Statutory First Appeal (CPC / Sec 54)', labelBn: 'বিধিবদ্ধ প্রথম আপিল (First Appeal - CPC/৫৪)' },
  { id: 'barga', labelEn: 'Bargadar & Barga Matters (u/s 15–21 WBLR Act)', labelBn: 'বর্গাদার ও বর্গা সংক্রান্ত (ধারা ১৫-২১)' }
];

export const ALL_TEMPLATES_LIST: { id: TemplateType; section: string; labelEn: string; labelBn: string; category: string }[] = [
  // RTI
  { id: 'rti_sec6_1', section: '[Sec 6(1)]', labelEn: 'RTI Application u/s 6(1)', labelBn: 'তথ্য জানার অধিকার দরখাস্ত (৬(১) ধারা)', category: 'RTI' },
  { id: 'rti_sec7_1', section: '[Sec 7(1)]', labelEn: 'Urgent RTI u/s 7(1)', labelBn: 'জরুরি আরটিআই দরখাস্ত (৭(১) ধারা)', category: 'RTI' },
  { id: 'rti_sec19_1', section: '[Sec 19(1)]', labelEn: 'RTI First Appeal u/s 19(1)', labelBn: 'আরটিআই প্রথম আপিল (১৯(১) ধারা)', category: 'RTI' },
  { id: 'rti_sec19_2', section: '[Sec 19(2)]', labelEn: 'Third Party Appeal u/s 19(2)', labelBn: 'তৃতীয় পক্ষের আপিল (১৯(২) ধারা)', category: 'RTI' },
  { id: 'rti_sec19_3', section: '[Sec 19(3)]', labelEn: 'Second Appeal u/s 19(3)', labelBn: 'দ্বিতীয় আপিল (১৯(৩) ধারা)', category: 'RTI' },
  { id: 'rti_sec18_20', section: '[Sec 18 & 20]', labelEn: 'RTI Complaint & Penalty', labelBn: 'অভিযোগ ও জরিমানা দরখাস্ত (১৮ ও ২০ ধারা)', category: 'RTI' },
  // Land Appeal
  { id: 'lrappeal_memo', section: '[Sec 54]', labelEn: 'Memo of Appeal u/s 54 WBLR Act', labelBn: 'এল.আর. আপিল মেমোরেন্ডাম (৫৪ ধারা)', category: 'Appeal' },
  { id: 'lrappeal_stay', section: '[Sec 54(3)]', labelEn: 'Stay Petition u/s 54(3)', labelBn: 'স্থগিতাদেশ আবেদন (৫৪(৩) ধারা)', category: 'Appeal' },
  { id: 'lrappeal_statusquo', section: '[Injunction]', labelEn: 'Status Quo Application', labelBn: 'স্থিতাবস্থা আবেদন', category: 'Appeal' },
  { id: 'lrappeal_localinspect', section: '[O 39 R 7]', labelEn: 'Local Inspection Application', labelBn: 'সরজমিন তদন্ত আবেদন', category: 'Appeal' },
  // Delay Condonation
  { id: 'sec5_appeal_delay', section: '[Sec 5]', labelEn: 'Section 5 Delay Condonation', labelBn: 'তামাদি আইন ৫ ধারা মতে বিলম্ব মকুব', category: 'Limitation' },
  { id: 'sec5_supported_affidavit', section: '[Sec 5 & Aff.]', labelEn: 'Delay Petition with Affidavit', labelBn: 'হলফনামাসহ বিলম্ব মার্জনা দরখাস্ত', category: 'Limitation' },
  { id: 'sec14_exclusion', section: '[Sec 14]', labelEn: 'Exclusion of Time u/s 14', labelBn: 'সময় গণনা বাদ দেওয়ার আবেদন (১৪ ধারা)', category: 'Limitation' },
  // Misc
  { id: 'misc_share10000', section: '[Sec 50A]', labelEn: '10000-Share Anomaly u/s 50A', labelBn: '১০,০০০ হিস্যা বৈষম্য সংশোধন (৫০ক ধারা)', category: 'Misc' },
  { id: 'misc_barga_revoke', section: '[Sec 50 / 21B]', labelEn: 'Barga Revoke / De-recording', labelBn: 'বর্গা রেকর্ড রদ ও কর্তন (৫০/২১খ ধারা)', category: 'Misc' },
  { id: 'misc_name_rect', section: '[Sec 50]', labelEn: 'Name Correction in ROR', labelBn: 'রায়তের নাম ও পদবী সংশোধন (৫০ ধারা)', category: 'Misc' },
  { id: 'misc_share_area_rect', section: '[Sec 50 / 50A]', labelEn: 'Share & Area Rectification', labelBn: 'অংশ ও পরিমাণ ত্রুটি সংশোধন (৫০/৫০ক ধারা)', category: 'Misc' },
  { id: 'misc_rslr_mapping', section: '[Sec 50]', labelEn: 'RS to LR Conveyance Mapping', labelBn: 'আর.এস. হইতে এল.আর. সমন্বয় (৫০ ধারা)', category: 'Misc' },
  { id: 'misc_record_rect', section: '[Sec 50]', labelEn: 'Clerical Error Rectification', labelBn: 'খতিয়ান করণিক ভুল সংশোধন (৫০ ধারা)', category: 'Misc' },
  { id: 'misc_demarcation', section: '[Demarcation]', labelEn: 'Plot Demarcation Petition', labelBn: 'দাগের সীমানা চিহ্নিতকরণ আবেদন', category: 'Misc' },
  { id: 'misc_class_porcha_rect', section: '[Sec 50 / 4C]', labelEn: 'Classification Correction', labelBn: 'জমির শ্রেণি সংশোধন (৫০/৪সি ধারা)', category: 'Misc' },
  { id: 'misc_vested_ceiling', section: '[Sec 14T / 14Z]', labelEn: 'Vested Land / Ceiling Objection', labelBn: 'ভেস্টেড জমি / সিলিং আপত্তি (১৪টি/১৪জেড)', category: 'Misc' },
  { id: 'misc_delete_wrong', section: '[Sec 50A]', labelEn: 'Expunge Erroneous Entry', labelBn: 'অনধিকার ব্যক্তির নাম কর্তন', category: 'Misc' },
  { id: 'misc_reopen_hear', section: '[Reopen]', labelEn: 'Reopen Ex-Parte Hearing', labelBn: 'একতরফা আদেশ পুনর্বিবেচনা', category: 'Misc' },
  { id: 'misc_other_petition', section: '[Sec 50]', labelEn: 'Other Misc Petition', labelBn: 'অন্যান্য বিবিধ রাজস্ব দরখাস্ত (৫০ ধারা)', category: 'Misc' },
  // Conversion
  { id: 'conv_sec4c', section: '[Sec 4C]', labelEn: 'Conversion Petition u/s 4C', labelBn: 'বাস্তু শ্রেণি রূপান্তর দরখাস্ত (৪সি ধারা)', category: 'Conversion' },
  { id: 'conv_regularize', section: '[Sec 4C(6)]', labelEn: 'Conversion Regularization', labelBn: 'অননুমোদিত ব্যবহারের নিয়মিতকরণ', category: 'Conversion' },
  { id: 'conv_khatian_update', section: '[Sec 50]', labelEn: 'ROR Update post-Conversion', labelBn: 'রূপান্তরোত্তর রেকর্ড সংশোধন', category: 'Conversion' },
  // LRTT
  { id: 'lrtt_oa', section: '[Sec 6 LRTT]', labelEn: 'WBLRTT Original Application', labelBn: 'ভূমি সংস্কার ট্রাইব্যুনাল মূল আবেদন', category: 'LRTT' },
  { id: 'lrtt_interim_stay', section: '[Sec 6(2)]', labelEn: 'LRTT Interim Stay / Injunction', labelBn: 'ট্রাইব্যুনাল অন্তর্বর্তী স্থগিতাদেশ', category: 'LRTT' },
  { id: 'lrtt_sec5_delay', section: '[Sec 6 & 5]', labelEn: 'LRTT Delay Condonation', labelBn: 'ট্রাইব্যুনাল বিলম্ব মার্জনা আবেদন', category: 'LRTT' },
  { id: 'lrtt_contempt', section: '[Sec 15 LRTT]', labelEn: 'LRTT Contempt Petition', labelBn: 'ট্রাইব্যুনাল আদালত অবমাননা আবেদন', category: 'LRTT' },
  // First Appeal
  { id: 'firstappeal_memo', section: '[Sec 96 CPC]', labelEn: 'Statutory First Appeal Memo', labelBn: 'বিধিবদ্ধ প্রথম আপিল স্মারকলিপি', category: 'First Appeal' },
  { id: 'firstappeal_stay', section: '[O 41 R 5]', labelEn: 'First Appeal Stay of Execution', labelBn: 'প্রথম আপিল কার্যকর স্থগিতের আবেদন', category: 'First Appeal' },
  { id: 'firstappeal_addl_evidence', section: '[O 41 R 27]', labelEn: 'Additional Evidence in Appeal', labelBn: 'আপিল স্তরে অতিরিক্ত প্রমাণ দাখিল', category: 'First Appeal' },
  // Barga
  { id: 'barga_prevent_evict', section: '[Sec 17(1)]', labelEn: 'Restrain Bargadar Eviction', labelBn: 'বর্গাদারের বেআইনি উচ্ছেদ রোধ', category: 'Barga' },
  { id: 'barga_recording', section: '[Sec 21B]', labelEn: 'Bargadar Name Recording', labelBn: 'খতিয়ানে বর্গাদার নাম রেকর্ডভুক্তি', category: 'Barga' },
  { id: 'barga_produce_share', section: '[Sec 16]', labelEn: 'Tender Crop Produce Share', labelBn: 'ফসলের ন্যায্য অংশ রাজস্ব অফিসে জমা', category: 'Barga' },
  { id: 'barga_surrender', section: '[Sec 20B]', labelEn: 'Barga Surrender Verification', labelBn: 'বর্গা অধিকার সমর্পণ বা প্রত্যাহারের যাচাই', category: 'Barga' }
];

function normalizeDraftingCategory(cat?: CaseType | DraftingMatterType | 'all' | null): DraftingMatterType {
  if (!cat || cat === 'all' || cat === 'mutation') {
    return 'rti_sec6_1';
  }
  if (cat === 'rti') {
    return 'rti_sec6_1';
  }
  if (cat === 'certcopy' || cat === 'rorpi') {
    return 'misc';
  }
  return cat as DraftingMatterType;
}

export const AiStudio: React.FC<AiStudioProps> = ({
  initialCaseType = 'all',
  lockCaseType = false,
  prefilledCase = null,
  onBack
}) => {
  const { activeCompany, activeUser, showToast, language, sampleDrafts } = useApp();

  const [activeTab, setActiveTab] = useState<'draft' | 'learning'>('draft');

  // Active category filter: defaults to initialCaseType or 'rti_sec6_1'
  const [selectedCategory, setSelectedCategory] = useState<DraftingMatterType>(() => {
    return normalizeDraftingCategory(initialCaseType);
  });

  // Mobile View state (for small screens < 1024px)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  // Synchronize when initialCaseType prop changes
  useEffect(() => {
    if (initialCaseType && initialCaseType !== 'all' && initialCaseType !== 'mutation') {
      const cat = normalizeDraftingCategory(initialCaseType);
      setSelectedCategory(cat);
      if (CASE_TEMPLATES_MAP[cat]?.length > 0) {
        setTemplate(CASE_TEMPLATES_MAP[cat][0].id);
      }
    }
  }, [initialCaseType]);

  // Determine allowed templates strictly based on form type (only show options for this form type)
  const allowedTemplates = useMemo(() => {
    if (CASE_TEMPLATES_MAP[selectedCategory]) {
      return CASE_TEMPLATES_MAP[selectedCategory];
    }
    return CASE_TEMPLATES_MAP.rti_sec6_1 || CASE_TEMPLATES_MAP.rti;
  }, [selectedCategory]);

  // Whether active matter is an RTI application/appeal
  const isRtiCategory = selectedCategory === 'rti' || selectedCategory.startsWith('rti');

  // Drafting inputs (Mutation completely removed)
  const [template, setTemplate] = useState<TemplateType>(() => {
    const defaultCat = initialCaseType && initialCaseType !== 'all' && initialCaseType !== 'mutation' && initialCaseType !== 'rti'
      ? initialCaseType
      : 'rti_sec6_1';
    const initialList = CASE_TEMPLATES_MAP[defaultCat] || CASE_TEMPLATES_MAP.rti_sec6_1 || CASE_TEMPLATES_MAP.rti;
    if (initialList && initialList.length > 0) {
      return initialList[0].id;
    }
    return 'rti_sec6_1';
  });

  const [draftLang, setDraftLang] = useState<DraftLanguage>(() => {
    return language === 'bn' ? 'bengali' : 'bilingual';
  });

  // Resolve matching internal draft format attached in Document Vault according to present application matter
  const activeVaultDraftRef = useMemo(() => {
    const vaultFiles = activeCompany?.vaultFiles || [];
    const matter = (selectedCategory || 'rti_sec6_1').toLowerCase();

    // 1. Check custom uploaded vault files attached to Document Vault
    const relevantVaultFiles = vaultFiles.filter(vf => {
      const cat = (vf.category || '').toLowerCase();
      const nm = (vf.name || '').toLowerCase();
      return (
        cat.includes(matter) ||
        nm.includes(matter) ||
        (matter.includes('rti') && (nm.includes('rti') || cat.includes('rti'))) ||
        (matter === 'misc' && (nm.includes('share') || nm.includes('50a') || cat.includes('misc') || cat.includes('petition'))) ||
        (matter === 'lrappeal' && (nm.includes('appeal') || nm.includes('54') || cat.includes('appeal'))) ||
        (matter === 'limitation' && (nm.includes('delay') || nm.includes('limitation') || cat.includes('limitation'))) ||
        (matter === 'firstappeal' && (nm.includes('first') || nm.includes('appeal'))) ||
        (matter === 'conversion' && (nm.includes('conversion') || nm.includes('4c'))) ||
        (matter === 'lrtt' && (nm.includes('tribunal') || nm.includes('lrtt') || nm.includes('oa'))) ||
        (matter === 'barga' && (nm.includes('barga') || nm.includes('bargadar')))
      );
    });

    // 2. Check sample drafts attached to Document Vault
    const matchingSample = (sampleDrafts || []).find(sd => {
      if ((template === 'rti' || template === 'rti_sec6_1') && (sd.category === 'rti' || sd.id.includes('rti_sec6'))) return true;
      if ((template === 'rtifirstappeal' || template === 'rti_sec19_1' || template === 'rti_sec19_2') && (sd.category === 'rti' || sd.id.includes('rti'))) return true;
      if ((template === 'misc10000' || template.startsWith('misc')) && sd.category === 'misc') return true;
      if ((template === 'lrappeal' || template.startsWith('lrappeal')) && (sd.category === 'lrappeal' || sd.id.includes('lrappeal'))) return true;
      if ((template === 'firstappeal' || template.startsWith('firstappeal')) && (sd.category === 'firstappeal' || sd.category === 'lrappeal')) return true;
      if ((template === 'sec5delay' || template.startsWith('sec5') || template.startsWith('sec14')) && (sd.id.includes('delay') || sd.templateText.includes('Section 5'))) return true;
      if ((template === 'conversion' || template.startsWith('conv')) && sd.category === 'conversion') return true;
      if ((template === 'lrtt' || template.startsWith('lrtt')) && (sd.category === 'lrtt' || sd.id.includes('lrtt'))) return true;
      if (template.startsWith('barga') && (sd.category === 'barga' || sd.id.includes('barga'))) return true;
      if (sd.category === selectedCategory) return true;
      return false;
    });

    const title = matchingSample?.title || (relevantVaultFiles.length > 0 ? relevantVaultFiles[0].name : `${selectedCategory.toUpperCase()} Statutory Master Format`);
    const formatText = matchingSample?.templateText || '';

    return {
      title,
      formatText,
      sampleId: matchingSample?.id,
      vaultFilesCount: relevantVaultFiles.length,
      isInternalVaultAttached: Boolean(matchingSample || relevantVaultFiles.length > 0)
    };
  }, [selectedCategory, template, activeCompany?.vaultFiles, sampleDrafts]);

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
        setSelectedCategory(normalizeDraftingCategory(prefilledCase.type));
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
          setTemplate('misc_share10000');
          setCustomFacts(
            'The total recorded shares in the scheduled Dag do not aggregate to 10,000 parts on the Banglarbhumi portal, causing a mathematical lock. Rectification of share allotment u/s 50/50A WBLR Act is required.'
          );
        } else if (st.includes('Barga') || st.includes('বর্গা')) {
          setTemplate('misc_barga_revoke');
          setCustomFacts(
            'Petition for de-recording of wrongfully or erroneously recorded Bargadar from the scheduled land as no barga cultivation ever existed and applicant is in personal cultivation.'
          );
        } else if (st.includes('Name') || st.includes('নাম')) {
          setTemplate('misc_name_rect');
          setCustomFacts(
            'Application for correction of clerical spelling of Rayat name, parent name, and surname in the computerized L.R. Khatian in accordance with registered title deeds and official identity documents.'
          );
        } else if (st.includes('Share Correction') || st.includes('Area Rectification') || st.includes('অংশ ও পরিমাণ')) {
          setTemplate('misc_share_area_rect');
          setCustomFacts(
            'Application for correction of fractional share and net area calculation in computerized L.R. Khatian to reflect genuine deed quantum.'
          );
        } else if (st.includes('RS to LR') || st.includes('আর.এস. হইতে এল.আর.')) {
          setTemplate('misc_rslr_mapping');
          setCustomFacts(
            'Application for establishing RS to LR conveyance transfer mapping and updating corresponding L.R. Khatian based on ancestral RS Record-of-Rights and valid link deeds.'
          );
        } else if (st.includes('Record Correction') || st.includes('Erroneous Record') || st.includes('ভুল রেকর্ড')) {
          setTemplate('misc_record_rect');
          setCustomFacts(
            'Application under Section 50/51A of WBLR Act, 1955 for correction of erroneous recording and issuance of corrected Rayati Khatian on the basis of title deeds and trace map.'
          );
        } else if (st.includes('Boundary') || st.includes('Demarcation') || st.includes('সীমানা')) {
          setTemplate('misc_demarcation');
          setCustomFacts(
            'Application under Section 50 read with Rule 28 of WBLR Manual 1991 for official demarcation and boundary pillar fixation through Government Amine / Surveyor.'
          );
        } else if (st.includes('Classification') || st.includes('Porcha') || st.includes('শ্রেণি')) {
          setTemplate('misc_class_porcha_rect');
          setCustomFacts(
            'Application for rectification of wrongly recorded classification in computerized Porcha to Bastu/Danga based on spot inspection and physical nature of land.'
          );
        } else if (st.includes('Vested') || st.includes('Ceiling') || st.includes('ভেস্টেড')) {
          setTemplate('misc_vested_ceiling');
          setCustomFacts(
            'Objection against wrongful recording of rayat land as vested and petition for de-vesting and restoration of rayat khatian under Section 14T/14Z and Section 50A.'
          );
        } else if (st.includes('Expunge') || st.includes('অনধিকার')) {
          setTemplate('misc_delete_wrong');
          setCustomFacts(
            'Application under Section 50A of WBLR Act to expunge fraudulent and unauthorized stranger entry from computerized Khatian.'
          );
        } else if (st.includes('Reopen') || st.includes('একতরফা')) {
          setTemplate('misc_reopen_hear');
          setCustomFacts(
            'Petition to recall ex-parte order passed without notice and reopen hearing on merits in compliance with natural justice.'
          );
        } else if (st.includes('Other') || st.includes('অন্যান্য')) {
          setTemplate('misc_other_petition');
          setCustomFacts(
            'Miscellaneous petition under Section 50 of the West Bengal Land Reforms Act, 1955 before the Revenue Officer for inquiry and necessary administrative relief.'
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
    if (template === 'rti' || template === 'rti_sec6_1' || template === 'rti_sec7_1') {
      setForum(prev => (prev.toLowerCase().includes('court') || prev.toLowerCase().includes('collector') ? 'To: The State Public Information Officer (SPIO) / BL&LRO, Rajarhat' : prev));
      setAuthorityAddress('Office of the Block Land & Land Reforms Officer, Rajarhat, North 24 Parganas - 700135');
      setShowOppParty(false); // RTI has NO opposite party
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The applicant requires certified copy of the spot verification report and order-sheet of the Revenue Inspector in respect of L.R. Khatian No. 1428, Dag No. 482. Requisite RTI fee has been paid.'
        );
      }
    } else if (template === 'rtifirstappeal' || template === 'rti_sec19_1') {
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
    } else if (template === 'rti_sec19_2') {
      setForum('Before the First Appellate Authority (FAA) & District Land & Land Reforms Officer (DL&LRO)');
      setAuthorityAddress('Administrative Building, Barasat, North 24 Parganas - 700124');
      setSpioDetails('State Public Information Officer & Revenue Officer, Office of the BL&LRO Rajarhat');
      setShowOppParty(false);
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The SPIO has issued notice to disclose personal and confidential land transaction records of the Appellant third party without providing adequate opportunity of hearing under Section 11 of the RTI Act, 2005.'
        );
      }
    } else if (template === 'misc10000' || template === 'misc_share10000') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false); // Default hidden, user can add via + button
      setOppParty('The State of West Bengal, represented by BL&LRO');
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The total recorded shares in Dag No. 482 in Mouza Patharghata do not aggregate to 10,000 parts, leading to mathematical mismatch and system lock on the Banglarbhumi portal. Correction of shares u/s 50A WBLR Act is required.'
        );
      }
    } else if (template === 'misc_barga_revoke') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'Petition for revocation and de-recording of wrongful Bargadar entry from the L.R. Khatian. The opposite party has never cultivated the land nor tendered any crop share, and the Petitioner personally cultivates the scheduled land.'
        );
      }
    } else if (template === 'misc_name_rect') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The recorded name and parentage in the computerized L.R. Khatian has been distorted by inadvertent clerical typographical error. Rectification is prayed based on registered title deeds and official identity credentials.'
        );
      }
    } else if (template === 'misc_share_area_rect') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'Mathematical discrepancy between purchased land area in registered title deed and fractional share recorded in computerized L.R. Khatian. Re-apportionment and correction of area is sought u/s 50A of WBLR Act.'
        );
      }
    } else if (template === 'misc_rslr_mapping') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'Application for establishing RS to LR conveyance transfer mapping and updating corresponding L.R. Khatian based on ancestral RS Record-of-Rights and unbroken chain deeds.'
        );
      }
    } else if (template === 'misc_class_porcha_rect') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The scheduled land is settled homestead (Bastu / Danga) on ground, but is erroneously recorded as agricultural (Sali) in the computerized Porcha. Spot verification through Revenue Inspector is prayed.'
        );
      }
    } else if (template === 'misc_vested_ceiling') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The scheduled plot has been erroneously marked as vested / 14Z without serving statutory Section 14T notice. Total holding is strictly within statutory ceiling and de-vesting is prayed.'
        );
      }
    } else if (template === 'misc_other_petition') {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'Miscellaneous revenue petition under Section 50 of the West Bengal Land Reforms Act, 1955 before the Revenue Officer for inquiry, spot inspection, and appropriate administrative relief.'
        );
      }
    } else if (template.startsWith('misc')) {
      setForum('Before the Ld. Revenue Officer / Block Land & Land Reforms Officer, Rajarhat');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(false);
    } else if (template === 'lrappeal' || template.startsWith('lrappeal')) {
      setForum('In the Court of the Ld. District Land & Land Reforms Officer (DL&LRO), North 24 Parganas');
      setAuthorityAddress('Collectorate Compound, Barasat');
      setShowOppParty(true);
      setOppParty('The State of West Bengal & Ors.');
      setShowCaseRef(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The Ld. Revenue Officer passed the impugned order behind the back of the appellant without serving statutory notice under Rule 24 of WBLR Manual 1991, thereby violating the fundamental principles of natural justice.'
        );
      }
    } else if (template === 'firstappeal' || template.startsWith('firstappeal')) {
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
    } else if (template === 'sec5delay' || template.startsWith('sec5') || template.startsWith('sec14')) {
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
    } else if (template === 'conversion' || template.startsWith('conv')) {
      setForum('Before the Collector / District Land & Land Reforms Officer (DL&LRO)');
      setAuthorityAddress('Office of the DL&LRO, North 24 Parganas');
      setShowOppParty(false);
      setShowLandSchedule(true);
      if (!prefilledCase?.grounds) {
        setCustomFacts(
          'The surrounding plots have undergone complete urbanization. Agricultural cultivation is no longer feasible, and the applicant intends to use the property for residential (Bastu) purpose without disturbing public drainage.'
        );
      }
    } else if (template.startsWith('lrtt')) {
      setForum('Before the West Bengal Land Reforms Tenancy Tribunal (WBLRTT)');
      setAuthorityAddress('Salt Lake, Kolkata');
      setShowOppParty(true);
      setOppParty('The State of West Bengal & Ors.');
      setShowLandSchedule(true);
      setShowCaseRef(true);
    } else if (template.startsWith('barga')) {
      setForum('Before the Ld. Revenue Officer & Special Officer (Barga), BL&LRO Office');
      setAuthorityAddress('Office of the BL&LRO, Rajarhat');
      setShowOppParty(true);
      setOppParty('The Recorded Land Owner / Raityat');
      setShowLandSchedule(true);
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

      const isRti = t === 'rti' || t === 'rti_sec6_1' || t === 'rti_sec7_1';
      const isRtiAppeal = t === 'rtifirstappeal' || t === 'rti_sec19_1' || t === 'rti_sec19_2' || t === 'rti_sec19_3' || t === 'rti_sec18_20';

      // 1. RTI Matters
      if (isRti) {
        courtHeaderEn = 'TO THE STATE PUBLIC INFORMATION OFFICER (SPIO)';
        courtHeaderBn = 'মাননীয় রাজ্য জনতথ্য আধিকারিক (SPIO) সমীপে আবেদনপত্র';
        if (t === 'rti_sec7_1') {
          subjectEn = 'URGENT APPLICATION UNDER SECTION 6(1) READ WITH PROVISO TO SECTION 7(1) OF THE RTI ACT, 2005 (CONCERNING LIFE & LIBERTY)';
          subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ৭(১) ধারার শর্তানুসারে জীবন ও ব্যক্তিগত স্বাধীনতা সংক্রান্ত তথ্যের জরুরি আবেদন (৪৮ ঘণ্টার মধ্যে)';
          factsEn = `
            <p>1. <strong>Applicant Identity:</strong> That the Applicant is a citizen of India residing at ${vals.address}, Contact: ${vals.contactPhone}.</p>
            <p>2. <strong>Urgent Particulars of Information Sought (Directly Concerning Life & Liberty):</strong><br/>
            ${vals.customFacts}</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>Case / Reference Details:</strong> Relating to Case / Memo No. <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `dated ${vals.caseDate}` : ''}.</p>` : ''}
            <p>${vals.showCaseRef ? '4' : '3'}. That this application directly concerns the life and liberty of the applicant / citizen, warranting immediate mandatory disclosure within 48 hours pursuant to the proviso to Section 7(1) of the RTI Act, 2005.</p>
            <p>${vals.showCaseRef ? '5' : '4'}. That statutory application fee of ₹ 10/- is affixed herewith through Court Fee Stamp / IPO.</p>
          `;
          factsBn = `
            <p>১. <strong>আবেদনকারীর পরিচয়:</strong> আবেদনকারী ভারতীয় নাগরিক এবং ${vals.address} ঠিকানার স্থায়ী বাসিন্দা।</p>
            <p>২. <strong>জীবন ও ব্যক্তিগত স্বাধীনতা সংক্রান্ত জরুরি তথ্যের বিবরণ:</strong><br/>
            ${vals.customFacts}</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>মামলা / নথি নম্বর:</strong> সংশ্লিষ্ট মেমো / কেস নং <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `তারিখ: ${vals.caseDate}` : ''}।</p>` : ''}
            <p>${vals.showCaseRef ? '৪' : '৩'}. অত্র চাহিদাকৃত তথ্য সরাসরি জীবন ও স্বাধীনতার সহিত জড়িত বিধায় তথ্য জানার অধিকার আইন ২০০৫ এর ৭(১) ধারার বিধানমতে আবেদন প্রাপ্তির ৪৮ ঘণ্টার মধ্যে সরবরাহ বিধিবদ্ধ বাধ্যতামূলক।</p>
            <p>${vals.showCaseRef ? '৫' : '৪'}. নির্ধারিত ১০ টাকার কোর্ট ফি / আইপিও অত্র আবেদনের সহিত সংযুক্ত করা হইল।</p>
          `;
          prayerEn = `
            The Applicant prays that the requested certified records directly concerning life and liberty may kindly be furnished within 48 hours of receipt of this application as mandated by the proviso to Section 7(1) of the RTI Act, 2005.
          `;
          prayerBn = `
            অতএব প্রার্থনা, তথ্য জানার অধিকার আইন ২০০৫ এর ৭(১) ধারার বিধানমতে অত্র আবেদন প্রাপ্তির ৪৮ ঘণ্টার মধ্যে প্রার্থিত প্রত্যয়িত তথ্য ও রেকর্ড সরবরাহ করিয়া বাধিত করিবেন।
          `;
        } else {
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
        }
      } else if (isRtiAppeal) {
        if (t === 'rti_sec19_2') {
          courtHeaderEn = 'BEFORE THE FIRST APPELLATE AUTHORITY (FAA) UNDER RTI ACT, 2005';
          courtHeaderBn = 'মাননীয় প্রথম আপিল কর্তৃপক্ষ সমীপে সংক্ষুব্ধ তৃতীয় পক্ষের আপিল';
          subjectEn = 'MEMORANDUM OF THIRD PARTY APPEAL UNDER SECTION 19(2) READ WITH SECTION 11 OF RTI ACT, 2005';
          subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ১৯(২) ধারা মতে সংক্ষুব্ধ তৃতীয় পক্ষের প্রথম আপিল';
          factsEn = `
            <p>1. <strong>Appellant (Affected Third Party):</strong> ${vals.partyName}, residing at ${vals.address}, Contact: ${vals.contactPhone}.</p>
            <p>2. <strong>Details of Concerned SPIO:</strong> ${vals.spioDetails}, Address: ${vals.authorityAddress}.</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>Impugned SPIO Notice / Case Ref:</strong> Notice / Memo No. <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `dated ${vals.caseDate}` : ''}.</p>` : ''}
            <p>4. <strong>Grounds of Third Party Appeal Observed by AI:</strong><br/>
            ${vals.customFacts}</p>
            <p>5. That the SPIO arbitrarily decided to disclose confidential, proprietary, or personal documents without properly serving Section 11 notice and without granting fair opportunity of representation.</p>
          `;
          factsBn = `
            <p>১. <strong>আপিলকারী (সংক্ষুব্ধ তৃতীয় পক্ষ):</strong> ${vals.partyName}, পিতা: ${vals.fatherName}, ঠিকানা: ${vals.address}।</p>
            <p>২. <strong>সংশ্লিষ্ট এস.পি.আই.ও.-র বিবরণ:</strong> ${vals.spioDetails}।</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>বিতর্কিত নোটিশ / কেস নং:</strong> স্মারক নং <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `তারিখ: ${vals.caseDate}` : ''}।</p>` : ''}
            <p>৪. <strong>তৃতীয় পক্ষের আপিলের মূল গ্রাউন্ডস ও বিবরণ:</strong><br/>
            ${vals.customFacts}</p>
            <p>৫. এসপিআইও ধারা ১১ মতে কোনো শুনানি ও আপত্তি বিবেচনা ব্যতিরেকে আবেদনকারীর ব্যক্তিগত ও ব্যবসায়িক গোপনীয় নথি প্রকাশের সিদ্ধান্ত গ্রহণ করিয়া অন্যায় করিয়াছেন।</p>
          `;
          prayerEn = `
            The Appellant prays that the First Appellate Authority may graciously be pleased to admit this Third Party Appeal, stay and set aside the SPIO disclosure order, and protect the confidential documents under Section 8(1)(j) & Section 11 of the RTI Act.
          `;
          prayerBn = `
            অতএব প্রার্থনা, অত্র তৃতীয় পক্ষের আপিল গ্রহণ করিয়া বিতর্কিত তথ্য প্রকাশের আদেশ বাতিল ও ব্যক্তিগত তথ্যাদি সুরক্ষিত রাখিতে আদেশদানে মর্জি হয়।
          `;
        } else if (t === 'rti_sec19_3') {
          courtHeaderEn = 'BEFORE THE HON\'BLE WEST BENGAL STATE INFORMATION COMMISSION';
          courtHeaderBn = 'মাননীয় পশ্চিমবঙ্গ রাজ্য তথ্য কমিশন সমীপে দ্বিতীয় আপিল';
          subjectEn = 'MEMORANDUM OF SECOND APPEAL UNDER SECTION 19(3) OF THE RIGHT TO INFORMATION ACT, 2005';
          subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ১৯(৩) ধারা মতে দ্বিতীয় আপিলের স্মারকলিপি';
          factsEn = `
            <p>1. <strong>Appellant:</strong> ${vals.partyName}, residing at ${vals.address}, Contact: ${vals.contactPhone}.</p>
            <p>2. <strong>Respondent Public Authority:</strong> SPIO & First Appellate Authority (FAA), ${vals.authorityAddress}.</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>First Appeal Order / Ref:</strong> FAA Order No. <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `dated ${vals.caseDate}` : ''}.</p>` : ''}
            <p>4. <strong>Grounds of Second Appeal Observed by AI:</strong><br/>
            ${vals.customFacts}</p>
            <p>5. That the FAA failed to enforce statutory compliance or arbitrarily rejected the First Appeal, frustrating the statutory objects of transparency under the RTI Act, 2005.</p>
          `;
          factsBn = `
            <p>১. <strong>আপিলকারী:</strong> ${vals.partyName}, পিতা: ${vals.fatherName}, ঠিকানা: ${vals.address}।</p>
            <p>২. <strong>প্রতিপক্ষ কর্তৃপক্ষ:</strong> জনতথ্য আধিকারিক ও প্রথম আপিল কর্তৃপক্ষ (FAA)।</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>প্রথম আপিলের আদেশ নং:</strong> আদেশ নং <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `তারিখ: ${vals.caseDate}` : ''}।</p>` : ''}
            <p>৪. <strong>দ্বিতীয় আপিলের আইনি ভিত্তি ও ঘটনাবলী:</strong><br/>
            ${vals.customFacts}</p>
            <p>৫. প্রথম আপিল কর্তৃপক্ষ বিধিবদ্ধ দায়িত্ব পালনে অবহেলা করিয়া আবেদনকারীর আইনানুগ তথ্য অধিকার নস্যাৎ করিয়াছেন।</p>
          `;
          prayerEn = `
            The Appellant prays that the Hon'ble Commission may admit this Second Appeal, summon the original revenue records, direct immediate supply of certified documents free of cost, and initiate penalty proceedings under Section 20 of the RTI Act against the delinquent officers.
          `;
          prayerBn = `
            অতএব প্রার্থনা, অত্র দ্বিতীয় আপিল গ্রহণ করিয়া মূল রেকর্ড তলব পূর্বক নিঃশর্তভাবে তথ্য সরবরাহের নির্দেশ এবং ধারা ২০ মতে এসপিআইও-র বিরুদ্ধে জরিমানা ও বিভাগীয় ব্যবস্থার আদেশে মর্জি হয়।
          `;
        } else if (t === 'rti_sec18_20') {
          courtHeaderEn = 'BEFORE THE HON\'BLE STATE INFORMATION COMMISSION, WEST BENGAL';
          courtHeaderBn = 'মাননীয় রাজ্য তথ্য কমিশন সমীপে অভিযোগ ও জরিমানা প্রার্থনা দরখাস্ত';
          subjectEn = 'COMPLAINT UNDER SECTION 18 READ WITH SECTION 20 OF THE RTI ACT, 2005';
          subjectBn = 'তথ্য জানার অধিকার আইন ২০০৫ এর ১৮ ধারা মতে অভিযোগ ও ২০ ধারা মতে জরিমানা আরোপের আবেদন';
          factsEn = `
            <p>1. <strong>Complainant:</strong> ${vals.partyName}, residing at ${vals.address}, Contact: ${vals.contactPhone}.</p>
            <p>2. <strong>Delinquent Public Official:</strong> ${vals.spioDetails}, ${vals.authorityAddress}.</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>3. <strong>Application Reference:</strong> RTI Application No. <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `dated ${vals.caseDate}` : ''}.</p>` : ''}
            <p>4. <strong>Particulars of Malafide Refusal Observed by AI:</strong><br/>
            ${vals.customFacts}</p>
            <p>5. That the SPIO persistently, obstinately, and malafidely refused to receive the RTI application / failed to furnish records without reasonable cause, attracting maximum penalty under Section 20(1) and disciplinary action under Section 20(2).</p>
          `;
          factsBn = `
            <p>১. <strong>অভিযোগকারী:</strong> ${vals.partyName}, পিতা: ${vals.fatherName}, ঠিকানা: ${vals.address}।</p>
            <p>২. <strong>অভিযুক্ত আধিকারিক:</strong> ${vals.spioDetails}।</p>
            ${vals.showCaseRef && vals.caseNumber ? `<p>৩. <strong>আবেদন রেফারেন্স:</strong> আরটিআই দরখাস্ত নং <strong>${vals.caseNumber}</strong> ${vals.caseDate ? `তারিখ: ${vals.caseDate}` : ''}।</p>` : ''}
            <p>৪. <strong>আইন অমান্য ও দায়িত্বহীনতার বিবরণ:</strong><br/>
            ${vals.customFacts}</p>
            <p>৫. সংশ্লিষ্ট আধিকারিক কোনো যুক্তিসঙ্গত কারণ ব্যতীত ইচ্ছাকৃতভাবে তথ্য প্রদান অস্বীকার করিয়াছেন বিধায় ধারা ২০(১) মতে দৈনিক ২৫০ টাকা হারে সর্বোচ্চ ২৫,০০০ টাকা জরিমানা আরোপযোগ্য।</p>
          `;
          prayerEn = `
            The Complainant prays that the Hon'ble Commission may be pleased to inquire into this complaint, impose statutory maximum penalty of ₹ 25,000/- upon the SPIO under Section 20(1), and recommend disciplinary action under Section 20(2) of the Act.
          `;
          prayerBn = `
            অতএব প্রার্থনা, অত্র অভিযোগের প্রেক্ষিতে তদন্ত করিয়া অভিযুক্ত এসপিআইও-র উপর সর্বোচ্চ ২৫,০০০ টাকা জরিমানা আরোপ ও সার্ভিস রুল অনুসারে শাস্তিমূলক ব্যবস্থার সুপারিশে মর্জি হয়।
          `;
        } else {
          // rti_sec19_1 or rtifirstappeal
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
        }
      } else if (t === 'lrappeal' || t === 'lrappeal_memo') {
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
      } else if (t === 'lrappeal_stay') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে অন্তর্বর্তী স্থগিতাদেশের দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 54(3) OF WBLR ACT, 1955 READ WITH ORDER 41 RULE 5 CPC FOR STAY OF IMPUGNED ORDER';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫৪(৩) ধারা মতে তর্কিত আদেশের কার্যক্রম স্থগিতের অন্তর্বর্তী আবেদন';
        factsEn = `
          <p>1. That the Appellant has preferred the connected Statutory Appeal challenging the order passed in ${vals.caseNumber || 'the lower case'}.</p>
          <p>2. <strong>Grounds for Immediate Interim Stay Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That if the operation of the impugned order is not stayed immediately, the opposite parties will change the physical possession and create third-party encumbrances, rendering the main appeal infructuous.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী নিম্ন আদালতের তর্কিত আদেশের বিরুদ্ধে অত্র মূল আপিল মেমোরেন্ডাম দাখিল করিয়াছেন।</p>
          <p>২. <strong>অবিলম্বে স্থগিতাদেশের জরুরি ভিত্তি ও বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. অন্তর্বর্তী স্থগিতাদেশ প্রদান না করিলে প্রতিপক্ষ জমির দখল পরিবর্তন করিয়া তৃতীয় পক্ষের স্বত্ব সৃষ্টি করিবে, যাহার ফলে মূল আপিলটি ফলহীন হইয়া পড়িবে।</p>
        `;
        prayerEn = `
          The Appellant prays that Your Honour may graciously be pleased to stay all further proceedings and operation of the impugned order pending disposal of the Appeal.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র আপিল নিষ্পত্তি না হওয়া পর্যন্ত নিম্ন আদালতের তর্কিত আদেশের কার্যক্রম সম্পূর্ণ স্থগিত রাখিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'lrappeal_statusquo') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে স্থিতাবস্থা বজায় রাখার আবেদন';
        subjectEn = 'PETITION FOR STATUS QUO AND TEMPORARY RESTRAINING ORDER IN RESPECT OF SCHEDULED PROPERTY';
        subjectBn = 'তফশিল বর্ণিত সম্পত্তির দখল ও প্রকৃতির স্থিতাবস্থা বজায় রাখার আবেদনপত্র';
        factsEn = `
          <p>1. That the Appellant is in actual physical possession and cultivating the scheduled land.</p>
          <p>2. <strong>Facts & Threat of Dispossession Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the opposite parties are actively attempting to alter the nature and character of the scheduled land and construct boundary structures illegally.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী তফশিল বর্ণিত সম্পত্তিতে প্রকৃত দখলদার ও চাষাবাদকারী।</p>
          <p>২. <strong>দখলচ্যুতি ও বিরোধের বিশদ বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. প্রতিপক্ষগণ বেআইনিভাবে জমির শ্রেণি ও প্রকৃতি পরিবর্তন করিয়া সীমানা প্রাচীর নির্মাণের অপচেষ্টা চালাইতেছে।</p>
        `;
        prayerEn = `
          The Appellant prays that Your Honour may be pleased to issue an order directing both parties to maintain strict status quo as to possession, nature, and character of the scheduled land.
        `;
        prayerBn = `
          অতএব প্রার্থনা, তফশিল বর্ণিত সম্পত্তির বর্তমান দখল ও প্রকৃতির উপর কঠোর স্থিতাবস্থা (Status Quo) বজায় রাখার আদেশ প্রদানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'lrappeal_localinspect') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে স্থানীয় তদন্তের আবেদন';
        subjectEn = 'APPLICATION UNDER SECTION 54 OF WBLR ACT READ WITH ORDER 39 RULE 7 CPC FOR LOCAL INQUIRY & SPOT INSPECTION';
        subjectBn = 'রাজস্ব পরিদর্শক দ্বারা সরজমিন পরিদর্শন ও স্থানীয় তদন্তের আবেদনপত্র';
        factsEn = `
          <p>1. That there exists a serious dispute regarding actual physical possession, boundary demarcation, and standing constructions on the scheduled Dag.</p>
          <p>2. <strong>Necessity of Spot Inspection Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That an on-spot inquiry and sketch map by a competent Revenue Inspector is essential for elucidating the matter in dispute and doing complete justice.</p>
        `;
        factsBn = `
          <p>১. অত্র তফশিলভুক্ত দাগের বাস্তব দখল, সীমানা ও বর্তমান অবকাঠামো লইয়া মারাত্মক বিরোধ বিদ্যমান রহিয়াছে।</p>
          <p>২. <strong>সরজমিন তদন্তের আবশ্যকতা ও বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. একজন উপযুক্ত রাজস্ব পরিদর্শক দ্বারা স্থান পরিদর্শন ও নকশাসহ সরজমিন প্রতিবেদন তলব করা ন্যায়বিচারের স্বার্থে একান্ত আবশ্যক।</p>
        `;
        prayerEn = `
          The Appellant prays that Your Honour may be pleased to depute a Revenue Officer / Inspector for holding local inquiry and spot verification to ascertain actual physical possession and ground reality.
        `;
        prayerBn = `
          অতএব প্রার্থনা, একজন নিরপেক্ষ রাজস্ব পরিদর্শক নিয়োগ করিয়া সরজমিন তদন্ত পূর্বক বস্তুনিষ্ঠ রিপোর্ট তলবে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'sec5delay' || t === 'sec5_appeal_delay') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক (DL&LRO) সমীপে দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 5 OF THE LIMITATION ACT, 1963 FOR CONDONATION OF DELAY IN PREFERRING APPEAL';
        subjectBn = 'তামাদি আইন, ১৯৬৩ এর ৫ ধারা মতে আপিল দাখিলে বিলম্ব মার্জনার দরখাস্ত';
        factsEn = `
          <p>1. That the Appellant has filed the accompanying Memorandum of Appeal against the order passed by the Ld. Revenue Officer in ${vals.caseNumber || 'the lower case'}.</p>
          <p>2. <strong>Cause of Delay Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the delay was neither intentional nor deliberate, but occasioned by sufficient cause as envisaged under Section 5 of the Limitation Act, 1963.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী নিম্ন রাজস্ব আদেশের বিরুদ্ধে সঙ্গে সংযুক্ত আপিল স্মারকলিপি দাখিল করিয়াছেন।</p>
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
      } else if (t === 'sec5_supported_affidavit') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে হলফনামাসহ বিলম্ব মার্জনা আবেদন';
        subjectEn = 'PETITION UNDER SECTION 5 LIMITATION ACT, 1963 SUPPORTED BY SWORN VERIFICATION AFFIDAVIT';
        subjectBn = 'হলফনামা দ্বারা সমর্থিত তামাদি আইন ১৯৬৩ এর ৫ ধারা মতে বিলম্ব মকুবের আবেদনপত্র';
        factsEn = `
          <p>1. That the Deponent / Appellant is preferring the connected appeal with a delay occasioned by extraordinary bona fide circumstances.</p>
          <p>2. <strong>Day-to-day Explanation of Delay Supported by Affidavit:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That medical documents and certified copy delivery challans are annexed hereto and sworn on oath.</p>
        `;
        factsBn = `
          <p>১. হলফকারী / আপিলকারী অনিবার্য কারণবশত তামাদি অতিক্রান্তের পর সংযুক্ত আপিলটি দায়ের করিতেছেন।</p>
          <p>২. <strong>হলফনামা দ্বারা সমর্থিত প্রতিদিনের বিলম্বের ব্যাখ্যা:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. চিকিৎসার কাগজপত্র ও নকল সরবরাহের রসিদ অত্র হলফনামার সহিত সংযুক্ত করা হইল।</p>
        `;
        prayerEn = `
          The Deponent prays that Your Honour may graciously accept the sworn explanations and condone the statutory delay in the interest of justice.
        `;
        prayerBn = `
          অতএব প্রার্থনা, শপথপূর্বক প্রদত্ত কারণসমূহ গ্রহণ পূর্বক ন্যায়বিচারের স্বার্থে বিধিবদ্ধ বিলম্ব মার্জনার আদেশদানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'sec14_exclusion') {
        courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
        courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে সময় গণনা বাদ দেওয়ার দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 14 OF THE LIMITATION ACT, 1963 FOR EXCLUSION OF TIME SPENT IN WRONG FORUM';
        subjectBn = 'তামাদি আইন ১৯৬৩ এর ১৪ ধারা মতে ভুল ফোরামে সরলবিশ্বাসে মামলার সময় গণনা বাদ দেওয়ার আবেদন';
        factsEn = `
          <p>1. That the Applicant was diligently prosecuting the grievance with bona fide belief before another authority / forum.</p>
          <p>2. <strong>Particulars of Bona Fide Proceedings Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That pursuant to Section 14 of the Limitation Act, 1963, the time spent bona fide in prosecuting proceedings before a forum lacking inherent jurisdiction must be excluded in computing limitation.</p>
        `;
        factsBn = `
          <p>১. আবেদনকারী সরলবিশ্বাসে অন্য ফোরামে ন্যায়বিচার পাইবার উদ্দেশ্যে নিষ্ঠার সহিত মামলা পরিচালনা করিতেছিলেন।</p>
          <p>২. <strong>পূর্ববর্তী ফোরামের মামলার বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. তামাদি আইন ১৯৬৩ এর ১৪ ধারা মতে এখতিয়ারহীন ফোরামে সরলবিশ্বাসে অতিক্রান্ত কাল তামাদি গণনায় বাদ দেওয়া বিধিবদ্ধ নিয়ম।</p>
        `;
        prayerEn = `
          The Applicant prays that the time bona fide spent prosecuting the matter before the former forum be excluded in computing limitation and the appeal be admitted.
        `;
        prayerBn = `
          অতএব প্রার্থনা, সরলবিশ্বাসে পূর্ববর্তী ফোরামে অতিক্রান্ত সময় গণনা হইতে বাদ দিয়া অত্র মামলা আইনানুযায়ী শুনানিতে গ্রহণের মর্জি হয়।
        `;
      } else if (t === 'misc10000' || t === 'misc_share10000') {
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
      } else if (t === 'misc_record_rect') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে খতিয়ান সংশোধনের বিবিধ আবেদন';
        subjectEn = 'MISC PETITION UNDER SECTION 50/51A(4) OF WBLR ACT, 1955 FOR RECTIFICATION OF CLERICAL ERROR IN KHATIAN';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০/৫১ক(৪) ধারা মতে খতিয়ানের করণিক ও মুদ্রণ ভুল সংশোধনের আবেদন';
        factsEn = `
          <p>1. That the Petitioner is the lawful recorded raiyat / successor in respect of the scheduled land.</p>
          <p>2. <strong>Clerical / Printing Discrepancy Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the error is apparent on the face of the record and can be rectified summarily under Section 50 / 51A(4) of the Act.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত ভূমির বৈধ রেকর্ডীয় মালিক / উত্তরাধিকারী।</p>
          <p>২. <strong>করণিক ও মুদ্রণ প্রমাদের বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. উক্ত ভুলটি নথিপত্র দৃষ্টে স্পষ্ট ও প্রকাশ্য, যাহা ধারা ৫০/৫১ক(৪) মতে অবিলম্বে সংশোধনযোগ্য।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may be pleased to rectify the clerical spelling / area errors in the computerized L.R. Khatian on the basis of registered title deeds.
        `;
        prayerBn = `
          অতএব প্রার্থনা, মূল রেজিস্টার্ড দলিল ও জরিপ রেকর্ড দৃষ্টে খতিয়ানের করণিক ভুল সংশোধন করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_demarcation') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে দাগের সীমানা নির্ধারণের আবেদন';
        subjectEn = 'MISC APPLICATION UNDER SECTION 50 OF WBLR ACT READ WITH RULE 28 OF WBLR MANUAL, 1991 FOR DEMARCATION';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার ম্যানুয়াল ১৯৯১ এর ২৮ বিধি মতে দাগের সীমানা চিহ্নিতকরণ ও ডিমারকেশন আবেদন';
        factsEn = `
          <p>1. That the Petitioner is in exclusive possession of the purchased land within the scheduled Dag.</p>
          <p>2. <strong>Boundary Dispute & Field Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That adjoining owners are encroaching upon the plot, necessitating scientific demarcation and boundary pillar fixation through a Government Amine.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিলভুক্ত দাগের স্বীয় খরিদকৃত জমিতে প্রত্যক্ষ দখলদার।</p>
          <p>২. <strong>সীমানা বিরোধ ও ঘটনার বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. সীমানা অস্পষ্ট থাকার কারণে সংলগ্ন অংশীদারগণ জবরদখলের চেষ্টা করিতেছে বিধায় সরকারি আমিন দ্বারা মাপজোক একান্ত জরুরি।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may be pleased to depute a Government Amine for holding scientific demarcation and fixing boundary pillars.
        `;
        prayerBn = `
          অতএব প্রার্থনা, সরকারি আমিন দ্বারা সরজমিনে মাপজোক পূর্বক সীমানা নির্ধারণ ও সীমানা খুঁটি স্থাপনের আদেশদানে মর্জি হয়।
        `;
      } else if (t === 'misc_delete_wrong') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে অনধিকার ব্যক্তির নাম কর্তন আবেদন';
        subjectEn = 'APPLICATION UNDER SECTION 50A OF WBLR ACT, 1955 TO EXPUNGE ERRONEOUS RECORDING OF STRANGER CO-SHARER';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০(ক) ধারা মতে খতিয়ানে অনধিকার ব্যক্তির ভুল নাম কর্তন দরখাস্ত';
        factsEn = `
          <p>1. That the Petitioner and lawful co-sharers own and possess 16 Annas share of the scheduled property.</p>
          <p>2. <strong>Erroneous Entry Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the name of the opposite party was fraudulently or inadvertently inserted into the computerized ledger without any basis of deed or lineage.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী ও তাহার বৈধ অংশীদারগণ তফশিলভুক্ত সম্পত্তির ষোলো আনা অংশের মালিক ও দখলদার।</p>
          <p>২. <strong>অনধিকার ব্যক্তির ভুল এন্ট্রির বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. প্রতিপক্ষের নামে কোনো রেজিস্টার্ড দলিল বা ওয়ারিশান স্বত্ব না থাকা সত্ত্বেও অবৈধভাবে নাম এন্ট্রি হইয়াছে।</p>
        `;
        prayerEn = `
          The Petitioner prays that the unauthorized and erroneous entry in the computerized ROR be expunged and struck off in accordance with law.
        `;
        prayerBn = `
          অতএব প্রার্থনা, খতিয়ান হইতে উক্ত অনধিকার ব্যক্তির অবৈধ এন্ট্রি অবিলম্বে কর্তন ও বাতিল করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_reopen_hear') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে একতরফা আদেশ প্রত্যাহারের আবেদন';
        subjectEn = 'PETITION TO RECALL EX-PARTE MISC ORDER AND RE-OPEN HEARING ON MERITS';
        subjectBn = 'প্রাকৃতিক ন্যায়বিচারের স্বার্থে একতরফা বিবিধ মোকদ্দমা আদেশ প্রত্যাহার ও পুনঃশুনানির আবেদন';
        factsEn = `
          <p>1. That the Petitioner was severely prejudiced by the ex-parte disposal of ${vals.caseNumber || 'the Misc Case'}.</p>
          <p>2. <strong>Grounds for Recalling Ex-Parte Order Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That no statutory notice of hearing was ever served upon the Petitioner, violating the fundamental principle of audi alteram partem.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারীকে কোনো শুনানির নোটিশ না দিয়া একতরফা আদেশ প্রদান করায় দরখাস্তকারী মারাত্মক ক্ষতিগ্রস্ত হইয়াছেন।</p>
          <p>২. <strong>একতরফা আদেশ প্রত্যাহারের কারণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. শুনানির কোনো বিধিবদ্ধ নোটিশ জারি করা হয় নাই, যাহা প্রাকৃতিক ন্যায়বিচারের পরিপন্থী।</p>
        `;
        prayerEn = `
          The Petitioner prays that the ex-parte order passed without notice be recalled and the matter be re-heard on merits in presence of both parties.
        `;
        prayerBn = `
          অতএব প্রার্থনা, নোটিশবিহীন একতরফা আদেশটি প্রত্যাহার পূর্বক উভয় পক্ষের উপস্থিতিতে পুনর্বিবেচনায় আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_barga_revoke') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে বর্গা রেকর্ড রদের বিবিধ আবেদন';
        subjectEn = 'MISC PETITION UNDER SECTION 50 READ WITH SECTION 21B & 14(1) OF WBLR ACT, 1955 FOR REVOCATION & DE-RECORDING OF WRONGFUL BARGA ENTRY';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ও ২১খ ধারা মতে ভুল বর্গা রেকর্ড রদ ও বর্গাদার নাম কর্তন দরখাস্ত';
        factsEn = `
          <p>1. That the Petitioner is the lawful absolute owner, recorded raiyat, and in continuous physical cultivating possession of the scheduled land.</p>
          <p>2. That the opposite party has been wrongfully or erroneously entered as a Bargadar in the remarks column of the computerized L.R. Khatian without any spot inquiry or notification to the Petitioner.</p>
          <p>3. <strong>Specific Grounds for Barga Revocation Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>4. That the opposite party has never cultivated the scheduled land nor tendered any crop produce share under Section 16 of the WBLR Act, and the Petitioner cultivates the plot personally with family labour.</p>
          <p>5. That the wrongful barga entry casts an illegal cloud over the Petitioner's title and prevents statutory mutation and updating of records.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত ভূমির নিরঙ্কুশ ও বৈধ রেকর্ডীয় মালিক এবং জমিতে নিরবচ্ছিন্ন চাষাবাদে প্রত্যক্ষ দখলদার।</p>
          <p>২. প্রতিপক্ষের নাম কোনো বাস্তব চাষাবাদ বা বিধিবদ্ধ সরজমিন তদন্ত ব্যতিরেকে ভুলবশত / বেআইনিভাবে এল.আর. খতিয়ানের মন্তব্য কলামে বর্গাদার হিসেবে রেকর্ডভুক্ত হইয়াছে।</p>
          <p>৩. <strong>বর্গা রেকর্ড রদের সুনির্দিষ্ট কারণ ও বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৪. প্রতিপক্ষ কখনো অত্র জমিতে বর্গাচাষ করেন নাই কিংবা আইনের ১৬ ধারা মতে কোনো ফসলের ভাগও প্রদান করেন নাই; দরখাস্তকারী স্বয়ং নিজ পরিবারবর্গ দ্বারা জমিতে চাষাবাদ পরিচালনা করিতেছেন।</p>
          <p>৫. উক্ত ভুল বর্গা রেকর্ড দরখাস্তকারীর স্বত্বে অন্যায় বাধা সৃষ্টি করিতেছে এবং কম্পিউটার খতিয়ান হালনাগাদে প্রতিবন্ধকতা তৈরি করিয়াছে।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may graciously be pleased to initiate field inquiry through the Revenue Inspector, cancel and expunge the wrongful barga recording from the computerized L.R. Khatian, and confirm the Petitioner's unencumbered Rayati possession.
        `;
        prayerBn = `
          অতএব প্রার্থনা, রাজস্ব পরিদর্শক দ্বারা সরজমিন তদন্ত পূর্বক খতিয়ানের মন্তব্য কলাম হইতে প্রতিপক্ষের অবৈধ বর্গা রেকর্ড অবিলম্বে রদ ও কর্তন করিয়া দরখাস্তকারীর নিরঙ্কুশ রৈয়তি স্বত্ব বহাল রাখিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_name_rect') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে নাম ও পদবী সংশোধনের বিবিধ আবেদন';
        subjectEn = 'MISC APPLICATION UNDER SECTION 50 OF WBLR ACT, 1955 FOR CORRECTION OF SPELLING / PARENTAGE / SURNAME IN KHATIAN';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ধারা মতে কম্পিউটারাইজড খতিয়ানে নাম, পিতার নাম ও পদবী সংশোধনের আবেদন';
        factsEn = `
          <p>1. That the Petitioner is the absolute owner and recorded raiyat of the scheduled property by virtue of Registered Deed / Ancestral Inheritance.</p>
          <p>2. <strong>Name & Parentage Rectification Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That in the computerized L.R. Khatian on Banglarbhumi, the name / father's name / surname of the Petitioner has been erroneously spelled or distorted due to inadvertent typographical data entry error.</p>
          <p>4. That the Petitioner's official identity credentials (Aadhaar, Voter ID/EPIC) and registered title deed confirm the correct particulars without any ambiguity.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী রেজিস্টার্ড দলিল / উত্তরাধিকার সূত্রে তফশিল বর্ণিত সম্পত্তির নিরঙ্কুশ মালিক ও রৈয়ত।</p>
          <p>২. <strong>নাম ও পদবী সংশোধনের সুনির্দিষ্ট বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. 'বাংলার ভূমি' অনলাইন পোর্টালে ডেটা এন্ট্রি করণিক প্রমাদবশত দরখাস্তকারীর নাম / পিতার নাম / পদবীর বানান বিকৃত বা ভুলভাবে লিপিবদ্ধ হইয়াছে।</p>
          <p>৪. দরখাস্তকারীর সরকারি পরিচয়পত্র (আধার, ভোটার কার্ড) ও মূল রেজিস্টার্ড দলিলের সহিত খতিয়ানের বানান সংগতিপূর্ণ করিয়া সংশোধন করা আবশ্যক।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may kindly be pleased to verify the registered title deed and statutory identity credentials, and order rectification of the petitioner's name and parentage in the computerized L.R. Khatian.
        `;
        prayerBn = `
          অতএব প্রার্থনা, পরিচয়পত্র ও মূল দলিল দৃষ্টে কম্পিউটারাইজড খতিয়ানে দরখাস্তকারীর নাম, পিতার নাম ও পদবীর ভুল বানান সংশোধন করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_share_area_rect') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে অংশ ও পরিমাণ ত্রুটি সংশোধনের আবেদন';
        subjectEn = 'MISC PETITION UNDER SECTION 50 READ WITH SECTION 50A OF WBLR ACT, 1955 FOR RECTIFICATION OF FRACTIONAL SHARE & LAND AREA';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ও ৫০ক ধারা মতে খতিয়ানে অংশ ও জমির পরিমাণ ত্রুটি সংশোধনের বিবিধ আবেদন';
        factsEn = `
          <p>1. That the Petitioner is a lawful co-sharer / raiyat in respect of the scheduled Plot / Dag No.</p>
          <p>2. <strong>Share & Area Discrepancy Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That while the Petitioner acquired a specific quantum of land under Registered Deed No. ${vals.deedNoDate || 'on record'}, during computerization the fractional share was wrongly calculated, resulting in a deficit in recorded area.</p>
          <p>4. That the total plot area remains intact on ground and the error is purely arithmetical and clerical, falling squarely within the jurisdiction of the Revenue Officer under Section 50A.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত দাগের একজন বৈধ সহ-অংশীদার ও রৈয়ত।</p>
          <p>২. <strong>অংশ ও পরিমাণ বৈষম্যের বিশদ বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. দরখাস্তকারী রেজিস্টার্ড দলিলমূলে সুনির্দিষ্ট পরিমাণ জমি খরিদ করা সত্ত্বেও কম্পিউটারাইজেশনের সময় গাণিতিক অংশ ভুলভাবে এন্ট্রি হওয়ায় খতিয়ানে জমির পরিমাণ কম আসিয়াছে।</p>
          <p>৪. জমিতে মোট দাগের পরিমাণ অটুট রহিয়াছে এবং এই ত্রুটি সম্পূর্ণ গাণিতিক ও করণিক, যাহা ধারা ৫০ক মতে সংশোধনযোগ্য।</p>
        `;
        prayerEn = `
          It is prayed that Your Honour may kindly cause recalculation of the fractional share on the basis of registered title deed and update the recorded area in Khatian in accordance with Section 50A of WBLR Act.
        `;
        prayerBn = `
          অতএব প্রার্থনা, রেজিস্টার্ড দলিল মোতাবেক সঠিক হিস্যা পুনঃগণনা পূর্বক খতিয়ানে জমির পরিমাণের করণিক ভুল সংশোধন করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_rslr_mapping') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে আর.এস. হইতে এল.আর. হস্তান্তর সমন্বয় আবেদন';
        subjectEn = 'APPLICATION UNDER SECTION 50 OF WBLR ACT, 1955 FOR RS TO LR CONVEYANCE TRANSFER MAPPING & KHATIAN CORRECTION';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ধারা মতে আর.এস. হইতে এল.আর. দাগ-খতিয়ান হস্তান্তর সমন্বয় ও রেকর্ড হালনাগাদ আবেদন';
        factsEn = `
          <p>1. That the scheduled land was originally held and recorded in the name of the predecessor-in-interest in the R.S. Settlement Record-of-Rights.</p>
          <p>2. <strong>Conveyance & Trace Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That during the LR survey and subsequent digitization, the corresponding LR Dag and Khatian were improperly mapped or left unlinked to the registered conveyance deeds.</p>
          <p>4. That the petitioner holds unbroken registered link deeds from the recorded RS rayats with continuous peaceful possession on spot.</p>
        `;
        factsBn = `
          <p>১. তফশিল বর্ণিত সম্পত্তি আর.এস. রেকর্ড অব রাইটসে মূল মালিক / পূর্বসূরির নামে যথাযথভাবে রেকর্ডভুক্ত ছিল।</p>
          <p>২. <strong>হস্তান্তর ও আর.এস.-এল.আর. সমন্বয়ের বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. এল.আর. জরিপ ও কম্পিউটারাইজেশনের সময় আর.এস. দাগ হইতে এল.আর. দাগের সঠিক রূপান্তর বা লিঙ্কিং বাদ পড়িয়া ভুল রেকর্ড সৃষ্টি হইয়াছে।</p>
          <p>৪. দরখাস্তকারীর নিকট আর.এস. রায়ত হইতে ধারাবাহিক রেজিস্টার্ড ভায়া দলিল এবং ভূমিতে নিরবচ্ছিন্ন প্রত্যক্ষ দখল বিদ্যমান।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may be pleased to verify the RS-LR comparison trace map, establish the flow of conveyance, and record the Petitioner in the appropriate L.R. Khatian.
        `;
        prayerBn = `
          অতএব প্রার্থনা, আর.এস. ও এল.আর. তুলনামূলক ট্রেস ম্যাপ ও ধারাবাহিক দলিল যাচাই পূর্বক এল.আর. খতিয়ানে আবেদনকারীর নাম সমন্বয় করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_class_porcha_rect') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে জমির শ্রেণি ও পর্চা সংশোধনের বিবিধ আবেদন';
        subjectEn = 'MISC PETITION UNDER SECTION 50 OF WBLR ACT, 1955 FOR CORRECTION OF LAND CLASSIFICATION IN COMPUTERIZED PORCHA';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ধারা মতে কম্পিউটারাইজড পর্চায় ভুল শ্রেণি সংশোধন ও হালনাগাদের আবেদন';
        factsEn = `
          <p>1. That the Petitioner is the recorded raiyat in possession of the scheduled Dag.</p>
          <p>2. <strong>Classification Rectification Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the land on ground is non-agricultural / settled homestead (Bastu / Danga) since decades and is surrounded by developed habitation, but has been inadvertently entered as agricultural (Sali) in the computerized Porcha.</p>
          <p>4. That spot inspection by the Revenue Inspector will substantiate that the character of the land on spot does not match the erroneously generated entry.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিলভুক্ত দাগের জমিতে দখলদার ও রেকর্ডীয় মালিক।</p>
          <p>২. <strong>শ্রেণি প্রমাদের বিশদ বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. জমিতে বাস্তবোচিত দীর্ঘস্থায়ী বাস্তু/ডাঙ্গা অবস্থান থাকা সত্ত্বেও কম্পিউটারে অসাবধানতাবশত কৃষি বা অন্য শ্রেণি হিসেবে ভুল মুদ্রিত হইয়াছে।</p>
          <p>৪. সরজমিনে রাজস্ব পরিদর্শক দ্বারা তদন্ত করিলে জমির প্রকৃত শ্রেণি ও চরিত্র প্রত্যক্ষ প্রমাণ হইবে।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may cause a spot verification report and order rectification of the classification entry in the computerized Porcha.
        `;
        prayerBn = `
          অতএব প্রার্থনা, রাজস্ব পরিদর্শক দ্বারা স্থান পরিদর্শন প্রতিবেদন তলব পূর্বক কম্পিউটার পর্চায় জমির সঠিক শ্রেণি লিপিবদ্ধ করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_vested_ceiling') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে ভেস্টেড রেকর্ড আপত্তি ও অবমুক্তি আবেদন';
        subjectEn = 'OBJECTION & PETITION UNDER SECTION 50A READ WITH SECTIONS 14T & 14Z OF WBLR ACT, 1955 AGAINST WRONGFUL VESTED ENTRY';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ১৪টি, ১৪জেড ও ৫০ক ধারা মতে জমিতে ভুল ভেস্টেড এন্ট্রি আপত্তি ও খতিয়ান অবমুক্তি আবেদন';
        factsEn = `
          <p>1. That the Petitioner is the bona fide purchaser / rayat of the scheduled property having acquired the same through valid registered conveyance.</p>
          <p>2. <strong>Vested / Ceiling Particulars Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the total land holding of the petitioner and predecessor never exceeded the ceiling limits prescribed under Section 14M of the WBLR Act, 1955.</p>
          <p>4. That the entry of "Vested / 14Z" in respect of the scheduled plot is arbitrary, without notice of vesting proceeding under Section 14T(3), and hit by the principles of natural justice.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী বৈধ রেজিস্টার্ড দলিলের মাধ্যমে তফশিল বর্ণিত জমি খরিদ করিয়া নিরঙ্কুশ স্বত্ব ও দখলে রহিয়াছেন।</p>
          <p>২. <strong>ভেস্টেড ও সিলিং সংক্রান্ত বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. দরখাস্তকারী বা তাহার পূর্বসূরির মোট ভূমির পরিমাণ কখনোই ভূমি সংস্কার আইনের ১৪এম ধারার নির্ধারিত সিলিং সীমা অতিক্রম করে নাই।</p>
          <p>৪. কোনো বিধিবদ্ধ ১৪টি(৩) নোটিশ বা শুনানি ব্যতিরেকে অন্যায়ভাবে খতিয়ানে 'ভেস্টেড' বা '১৪জেড' লিপিবদ্ধ করা হইয়াছে যাহা বাতিলযোগ্য।</p>
        `;
        prayerEn = `
          The Petitioner prays that Your Honour may kindly call for the alleged vesting case records, verify ceiling returns, expunge the wrongful vesting remarks, and restore the Rayati Khatian in favour of the Petitioner.
        `;
        prayerBn = `
          অতএব প্রার্থনা, তথাকথিত ভেস্টিং কেসের নথি তলব ও সিলিং যাচাই পূর্বক অবৈধ ভেস্টেড এন্ট্রি কর্তন করিয়া আবেদনকারীর নামে রৈয়তি খতিয়ান পুনর্বহাল করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'misc_other_petition') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার / ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে বিবিধ আবেদন';
        subjectEn = 'MISCELLANEOUS REVENUE PETITION UNDER SECTION 50 OF THE WEST BENGAL LAND REFORMS ACT, 1955';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ধারা মতে বিবিধ রাজস্ব আবেদনপত্র';
        factsEn = `
          <p>1. That the Petitioner has lawful interest and title over the scheduled property as described hereinbelow.</p>
          <p>2. <strong>Case Facts & Grievance Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the statutory intervention of the Revenue Officer is urgently required under Section 50 of the WBLR Act, 1955 to prevent miscarriage of revenue administration.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী নিম্নে বর্ণিত তফশিল সম্পত্তির একজন বৈধ স্বত্বাধিকারী ও স্বার্থসংশ্লিষ্ট ব্যক্তি।</p>
          <p>২. <strong>ঘটনার বিবরণ ও রাজস্ব অসঙ্গতি:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. রাজস্ব প্রশাসনের যথাযথ প্রয়োগ ও ন্যায়বিচারের স্বার্থে পশ্চিমবঙ্গ ভূমি সংস্কার আইনের ৫০ ধারা মতে রাজস্ব আধিকারিকের সুবিবেচনা একান্ত আবশ্যক।</p>
        `;
        prayerEn = `
          It is therefore prayed that Your Honour may graciously be pleased to admit this Misc Petition, call for official reports from the concerned Revenue Inspector, and pass appropriate statutory orders as deemed fit.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র বিবিধ আবেদনটি গ্রহণ পূর্বক সংশ্লিষ্ট রাজস্ব পরিদর্শকের রিপোর্ট তলব এবং আইনানুযায়ী সুবিহিত আদেশ প্রদানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'conversion' || t === 'conv_sec4c') {
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
      } else if (t === 'conv_regularize') {
        courtHeaderEn = 'BEFORE THE COLLECTOR / DISTRICT LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় সমাহর্তা / জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে নিয়মিতকরণ আবেদন';
        subjectEn = 'APPLICATION UNDER SECTION 4C(6) OF WBLR ACT, 1955 FOR POST-FACTO REGULARIZATION OF LAND CONVERSION';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৪সি(৬) ধারা মতে অননুমোদিত ব্যবহারের নিয়মিতকরণ দরখাস্ত';
        factsEn = `
          <p>1. That the scheduled land had undergone change of use prior to the enactment of stringent conversion guidelines.</p>
          <p>2. <strong>Particulars of Land Use Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the Petitioner is ready and willing to deposit statutory compounding fees and fine as provided under Section 4C(6) of the Act.</p>
        `;
        factsBn = `
          <p>১. তফশিল বর্ণিত জমিতে বাস্তব প্রয়োজনে পূর্ব হইতেই ভিন্ন প্রকৃতির ব্যবহার প্রচলিত রহিয়াছে।</p>
          <p>২. <strong>বর্তমান ব্যবহারের বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. আবেদনকারী সরকার নির্ধারিত বিধিবদ্ধ ক্ষতিপূরণ ফি ও জরিমানা পরিশোধ করিতে প্রস্তুত আছেন।</p>
        `;
        prayerEn = `
          The Petitioner prays that post-facto regularization of the land use be granted upon payment of assessed statutory compounding fees.
        `;
        prayerBn = `
          অতএব প্রার্থনা, নির্ধারিত বিধিবদ্ধ ফি গ্রহণান্তে জমির বর্তমান ব্যবহার নিয়মিতকরণের অনুমতি প্রদানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'conv_khatian_update') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে রূপান্তরোত্তর খতিয়ান রেকর্ড সংশোধন দরখাস্ত';
        subjectEn = 'PETITION UNDER SECTION 50 READ WITH SECTION 4C OF WBLR ACT, 1955 FOR RECORDING CONVERSION IN ROR';
        subjectBn = 'রূপান্তর সনদপত্র প্রাপ্তির প্রেক্ষিতে কম্পিউটারাইজড এল.আর. খতিয়ানে শ্রেণি হালনাগাদের আবেদন';
        factsEn = `
          <p>1. That the Collector / DL&LRO has duly issued formal Conversion Certificate in respect of the scheduled plot.</p>
          <p>2. <strong>Conversion Certificate Details Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That under Section 50 of WBLR Act, 1955, the Revenue Officer is bound to update the computerized Record-of-Rights accordingly.</p>
        `;
        factsBn = `
          <p>১. জেলা সমাহর্তা / ডিএলঅ্যান্ডএলআরও কর্তৃক তফশিল বর্ণিত দাগের রূপান্তর সনদপত্র জারি করা হইয়াছে।</p>
          <p>২. <strong>সনদপত্রের বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০ ধারা অনুসারে অনলাইন খতিয়ানে উক্ত শ্রেণি হালনাগাদ করা বিধিবদ্ধ বিধান।</p>
        `;
        prayerEn = `
          The Petitioner prays that the computerized Record-of-Rights (L.R. Khatian) be formally updated reflecting the conversion certificate.
        `;
        prayerBn = `
          অতএব প্রার্থনা, প্রাপ্ত রূপান্তর সনদ মোতাবেক অনলাইন খতিয়ানে শ্রেণি সংশোধন করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'lrtt' || t === 'lrtt_oa') {
        courtHeaderEn = 'BEFORE THE WEST BENGAL LAND REFORMS TENANCY TRIBUNAL (WBLRTT)';
        courtHeaderBn = 'মাননীয় পশ্চিমবঙ্গ ভূমি সংস্কার ট্রাইব্যুনাল সমীপে মূল আবেদন';
        subjectEn = 'ORIGINAL APPLICATION UNDER SECTION 6 OF THE WBLRTT ACT, 1997';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার ট্রাইব্যুনাল আইন ১৯৯৭ এর ৬ ধারা মতে মূল আবেদন (Original Application)';
        factsEn = `
          <p>1. That this Original Application challenges the arbitrary and illegal order passed by the Appellate Authority in ${vals.caseNumber || 'the appeal'}.</p>
          <p>2. <strong>Grounds of Challenge Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the impugned order violates Section 54 of WBLR Act and infringes the constitutional rights guaranteed under Article 300A of the Constitution of India.</p>
        `;
        factsBn = `
          <p>১. আপিল কর্তৃপক্ষের বেআইনি ও একতরফা আদেশের বিরুদ্ধে অত্র মূল আবেদন দায়ের করা হইল।</p>
          <p>২. <strong>আইনি গ্রাউন্ডস ও ঘটনা:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. উক্ত বিতর্কিত আদেশটি ভারতীয় সংবিধানের ৩০০ক অনুচ্ছেদ এবং ভূমি সংস্কার আইনের সুস্পষ্ট লঙ্ঘন।</p>
        `;
        prayerEn = `
          The Applicant prays that the Tribunal may admit this Original Application, call for lower records, and set aside the impugned appellate order.
        `;
        prayerBn = `
          অতএব প্রার্থনা, অত্র মূল আবেদন গ্রহণ করিয়া সংশ্লিষ্ট বিতর্কিত আদেশ বাতিল ও ন্যায়সঙ্গত প্রতিকার প্রদানে মর্জি হয়।
        `;
      } else if (t === 'lrtt_interim_stay') {
        courtHeaderEn = 'BEFORE THE WEST BENGAL LAND REFORMS TENANCY TRIBUNAL (WBLRTT)';
        courtHeaderBn = 'মাননীয় ট্রাইব্যুনাল সমীপে অন্তর্বর্তীকালীন স্থগিতাদেশ আবেদন';
        subjectEn = 'MISCELLANEOUS APPLICATION UNDER SECTION 6(2) OF WBLRTT ACT, 1997 FOR INTERIM STAY / STATUS QUO';
        subjectBn = 'ট্রাইব্যুনাল মূল মোকদ্দমা নিষ্পত্তি না হওয়া পর্যন্ত অন্তর্বর্তীকালীন স্থগিতাদেশের আবেদন';
        factsEn = `
          <p>1. That the Applicant has filed the connected Original Application challenging the revenue appellate order.</p>
          <p>2. <strong>Grounds for Interim Protection Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That unless the operation of the impugned order is stayed, the applicant will be forcibly dispossessed, causing irreparable injury.</p>
        `;
        factsBn = `
          <p>১. আবেদনকারী ট্রাইব্যুনালে মূল ও.এ. আবেদন দাখিল করিয়াছেন।</p>
          <p>২. <strong>জরুরি অন্তর্বর্তীকালীন সুরক্ষার কারণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. স্থগিতাদেশ না দিলে আবেদনকারীকে বলপূর্বক দখলচ্যুত করা হইবে, যাহার ক্ষতি অপূরণীয়।</p>
        `;
        prayerEn = `
          The Applicant prays for an interim order staying the operation of the impugned order and directing maintenance of status quo.
        `;
        prayerBn = `
          অতএব প্রার্থনা, মোকদ্দমা চলাকালীন বিতর্কিত আদেশ কার্যকর স্থগিত ও স্থিতাবস্থা বজায় রাখার আদেশ প্রদানে মর্জি হয়।
        `;
      } else if (t === 'lrtt_sec5_delay') {
        courtHeaderEn = 'BEFORE THE WEST BENGAL LAND REFORMS TENANCY TRIBUNAL (WBLRTT)';
        courtHeaderBn = 'মাননীয় ট্রাইব্যুনাল সমীপে ও.এ. দাখিলে বিলম্ব মার্জনা দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 6 OF WBLRTT ACT READ WITH SECTION 5 OF LIMITATION ACT, 1963 FOR CONDONATION OF DELAY';
        subjectBn = 'তামাদি আইন ১৯৬৩ এর ৫ ধারা মতে ট্রাইব্যুনালে মূল আবেদন দাখিলে বিলম্ব মার্জনার দরখাস্ত';
        factsEn = `
          <p>1. That the Applicant was prevented by sufficient bona fide cause from approaching the Hon'ble Tribunal within the period of limitation.</p>
          <p>2. <strong>Cause of Delay Observed by Counsel / AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the delay was not intentional and justice warrants condonation of delay.</p>
        `;
        factsBn = `
          <p>১. আবেদনকারী পর্যাপ্ত ও যুক্তিসঙ্গত কারণে নির্ধারিত সময়ের মধ্যে ট্রাইব্যুনালে আসিতে পারেন নাই।</p>
          <p>২. <strong>বিলম্বের সুনির্দিষ্ট কারণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. এই বিলম্ব অনিচ্ছাকৃত বিধায় ন্যায়বিচারের স্বার্থে মার্জনাযোগ্য।</p>
        `;
        prayerEn = `
          The Applicant prays that the Tribunal may condone the delay in preferring the Original Application and hear the same on merits.
        `;
        prayerBn = `
          অতএব প্রার্থনা, বিলম্ব মার্জনা করিয়া মূল আবেদনটি শুনানির জন্য গ্রহণ করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'lrtt_contempt') {
        courtHeaderEn = 'BEFORE THE WEST BENGAL LAND REFORMS TENANCY TRIBUNAL (WBLRTT)';
        courtHeaderBn = 'মাননীয় ভূমি সংস্কার ট্রাইব্যুনাল সমীপে আদালত অবমাননার দরখাস্ত';
        subjectEn = 'CONTEMPT PETITION UNDER SECTION 15 OF THE WBLRTT ACT, 1997 READ WITH CONTEMPT OF COURTS ACT, 1971';
        subjectBn = 'ট্রাইব্যুনালের নির্দেশ ইচ্ছাকৃত অমান্য করায় ১৫ ধারা মতে আদালত অবমাননার আবেদনপত্র';
        factsEn = `
          <p>1. That the Hon'ble Tribunal was pleased to pass a solemn order of status quo / injunction on [DATE].</p>
          <p>2. <strong>Acts of Contempt & Wilful Disobedience Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the contemnors had full knowledge of the Tribunal order and yet deliberately flouted it.</p>
        `;
        factsBn = `
          <p>১. মহামান্য ট্রাইব্যুনাল কর্তৃক ইতিপূর্বে স্থিতাবস্থা / আদেশ জারি করা হইয়াছিল।</p>
          <p>২. <strong>আদেশ অমান্যের বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. বিবাদীগণ আদেশ অবগত থাকা সত্ত্বেও ইচ্ছাকৃতভাবে তা অমান্য করিয়া অবমাননা করিয়াছেন।</p>
        `;
        prayerEn = `
          The Petitioner prays that contempt proceedings be initiated against the contemnors for willful violation of Tribunal orders.
        `;
        prayerBn = `
          অতএব প্রার্থনা, ট্রাইব্যুনালের নির্দেশ অমান্যকারী বিবাদীদের বিরুদ্ধে আদালত অবমাননার আইনানুগ ব্যবস্থা গ্রহণে মর্জি হয়।
        `;
      } else if (t === 'firstappeal' || t === 'firstappeal_memo') {
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
      } else if (t === 'firstappeal_stay') {
        courtHeaderEn = 'IN THE COURT OF THE APPELLATE AUTHORITY / ADM (L&LR)';
        courtHeaderBn = 'মাননীয় বিধিবদ্ধ প্রথম আপিল কর্তৃপক্ষ সমীপে ডিক্রি স্থগিতের আবেদন';
        subjectEn = 'APPLICATION UNDER ORDER 41 RULE 5 OF CPC FOR STAY OF EXECUTION PENDING APPEAL';
        subjectBn = 'দেওয়ানি কার্যবিধির ৪১ আদেশ ৫ নিয়ম মতে মূল রায় ও ডিক্রি কার্যকর স্থগিতের আবেদন';
        factsEn = `
          <p>1. That the Appellant has filed the connected Statutory First Appeal against the lower decree / order.</p>
          <p>2. <strong>Irreparable Loss & Grounds for Stay Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That substantial loss will result to the appellant unless stay is granted.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী নিম্ন আদালতের রায় ও ডিক্রির বিরুদ্ধে অত্র প্রথম আপিল দায়ের করিয়াছেন।</p>
          <p>২. <strong>স্থগিতাদেশের প্রয়োজনীয়তা ও বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. ডিক্রি কার্যকর স্থগিত না করিলে আপিলকারীর অপূরণীয় ক্ষতি হইবে।</p>
        `;
        prayerEn = `
          The Appellant prays that the execution and operation of the lower decree/order be stayed pending disposal of this appeal.
        `;
        prayerBn = `
          অতএব প্রার্থনা, আপিল চলাকালীন নিম্ন আদালতের রায় ও ডিক্রি কার্যকর স্থগিত রাখিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'firstappeal_addl_evidence') {
        courtHeaderEn = 'IN THE COURT OF THE APPELLATE AUTHORITY / ADM (L&LR)';
        courtHeaderBn = 'মাননীয় প্রথম আপিল আদালত সমীপে অতিরিক্ত সাক্ষ্য প্রমাণ দাখিলের আবেদন';
        subjectEn = 'PETITION UNDER ORDER 41 RULE 27 OF CPC FOR PRODUCTION OF ADDITIONAL EVIDENCE IN APPEAL';
        subjectBn = 'দেওয়ানি কার্যবিধির ৪১ আদেশ ২৭ নিয়ম মতে আপিল স্তরে অতিরিক্ত প্রামাণ্য দলিল দাখিলের দরখাস্ত';
        factsEn = `
          <p>1. That the Appellant seeks to produce vital certified revenue documents in the appellate court.</p>
          <p>2. <strong>Relevance & Non-availability Earlier Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That notwithstanding due diligence, the documents could not be produced before the primary authority.</p>
        `;
        factsBn = `
          <p>১. আপিলকারী আপিল নিষ্পত্তির স্বার্থে অতীব প্রয়োজনীয় সরকারি প্রত্যয়িত দলিল দাখিল করিতে চাহেন।</p>
          <p>২. <strong>দলিলের প্রাসঙ্গিকতা ও পূর্বে দাখিল না পারার কারণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. নিম্ন আদালতে যথাযথ চেষ্টা সত্ত্বেও উক্ত দলিল হস্তগত হয় নাই।</p>
        `;
        prayerEn = `
          The Appellant prays for leave to produce the accompanying certified records and deeds as additional evidence in appeal.
        `;
        prayerBn = `
          অতএব প্রার্থনা, ন্যায়বিচারের স্বার্থে সংযোজিত অতিরিক্ত প্রামাণ্য দলিলসমূহ সাক্ষ্য হিসেবে গ্রহণের অনুমতি দানে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'barga' || t === 'barga_prevent_evict') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে বর্গাদারের বেআইনি উচ্ছেদ রোধের দরখাস্ত';
        subjectEn = 'APPLICATION UNDER SECTION 17(1) OF THE WEST BENGAL LAND REFORMS ACT, 1955 TO PREVENT ILLEGAL TERMINATION OF CULTIVATION';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ১৭(১) ধারা মতে জোতদার কর্তৃক বেআইনি উচ্ছেদ রোধের আবেদনপত্র';
        factsEn = `
          <p>1. That the Applicant is cultivating the scheduled land as a lawful Bargadar.</p>
          <p>2. <strong>Threat of Illegal Eviction Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That under Section 17(1) of the WBLR Act, 1955, no bargadar shall be terminated or evicted except by an order of the Revenue Officer passed on statutory grounds.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত ভূমিতে দীর্ঘকাল যাবৎ বৈধ বর্গাদার হিসেবে চাষাবাদ করিতেছেন।</p>
          <p>২. <strong>বেআইনি উচ্ছেদের হুমকির বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ১৭(১) ধারা মতে রেভিনিউ অফিসারের বিধিবদ্ধ আদেশ ব্যতীত কোনো বর্গাদারকে উচ্ছেদ করা সম্পূর্ণ বেআইনি।</p>
        `;
        prayerEn = `
          The Applicant Bargadar prays that the Opposite Party landowner be restrained from evicting or terminating cultivation without due process of law.
        `;
        prayerBn = `
          অতএব প্রার্থনা, বিধিসম্মত আদেশ ব্যতীত দরখাস্তকারী বর্গাদারকে চাষাবাদ হইতে অন্যায়ভাবে উচ্ছেদ না করিতে জোতদারকে নির্দেশ দানে মর্জি হয়।
        `;
      } else if (t === 'barga_recording') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে বর্গাদার হিসেবে নাম রেকর্ডভুক্তির আবেদন';
        subjectEn = 'PETITION UNDER SECTION 21B OF THE WEST BENGAL LAND REFORMS ACT, 1955 FOR RECORDING AS BARGADAR';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ২১(খ) ধারা মতে চাষি হিসেবে বর্গাদার নাম অন্তর্ভুক্তির দরখাস্ত';
        factsEn = `
          <p>1. That the Petitioner is the actual tiller cultivating the scheduled agricultural land.</p>
          <p>2. <strong>Cultivation Proof & Field Facts Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That under Section 21B of the WBLR Act, 1955, the person who cultivates land of another person is presumed to be a bargadar and entitled to be recorded in the ROR.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত জমিতে প্রকৃত চাষি হিসেবে চাষাবাদ করিতেছেন।</p>
          <p>২. <strong>চাষাবাদের প্রামাণ্য বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ২১(খ) ধারা অনুসারে অপরের জমি চাষকারী ব্যক্তি বর্গাদার বলিয়া গণ্য হইবেন এবং খতিয়ানে নাম এন্ট্রি পাইবার অধিকারী।</p>
        `;
        prayerEn = `
          The Petitioner prays that upon holding spot inquiry, the name of the Petitioner be recorded as Bargadar in respect of the scheduled land in the ROR.
        `;
        prayerBn = `
          অতএব প্রার্থনা, সরজমিন তদন্তপূর্বক তফশিল বর্ণিত জমিতে দরখাস্তকারীর নাম বিধিবদ্ধ বর্গাদার হিসেবে রেকর্ডভুক্ত করিতে আজ্ঞাবহ হইবেন।
        `;
      } else if (t === 'barga_produce_share') {
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে উৎপন্ন ফসলের অংশ জমাদানের দরখাস্ত';
        subjectEn = 'PETITION UNDER SECTION 16 OF THE WEST BENGAL LAND REFORMS ACT, 1955 FOR TENDER & DEPOSIT OF PRODUCE SHARE';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ১৬ ধারা মতে জোতদারের ফসলের হিস্যা জমা প্রদানের আবেদন';
        factsEn = `
          <p>1. That the Applicant Bargadar harvested the seasonal paddy / crops from the scheduled land.</p>
          <p>2. <strong>Refusal of Landowner to Accept Produce Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That the landowner refused to receive the share or grant receipt, obligating tender before the Revenue Officer under Section 16 of the Act.</p>
        `;
        factsBn = `
          <p>১. দরখাস্তকারী তফশিল বর্ণিত জমি হইতে মৌসুমী ফসল উৎপাদন করিয়াছেন।</p>
          <p>২. <strong>জোতদার কর্তৃক ফসল গ্রহণে অস্বীকৃতির বিবরণ:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. জোতদার ফসল গ্রহণ বা রসিদ প্রদানে অস্বীকার করায় ধারা ১৬ মতে রেভিনিউ অফিসারের সমীপে জমা প্রদান আবশ্যক হইয়াছে।</p>
        `;
        prayerEn = `
          The Bargadar prays that the tendered share of produce or its market price be accepted and deposited in the office, granting statutory receipt.
        `;
        prayerBn = `
          অতএব প্রার্থনা, ফসলের বিধিসম্মত ন্যায্য হিস্যা সরকারি কোষাগারে জমা গ্রহণ করিয়া আইনানুগ রসিদ প্রদান করিতে আজ্ঞাবহ হইবেন।
        `;
      } else {
        // barga_surrender
        courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
        courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার সমীপে বর্গা সমর্পণ যাচাইয়ের আবেদন';
        subjectEn = 'VERIFICATION APPLICATION UNDER SECTION 20B OF WBLR ACT, 1955 REGARDING VOLUNTARY SURRENDER OF BARGA';
        subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ২০(খ) ধারা মতে বর্গা অধিকার স্বেচ্ছায় সমর্পণ বা প্রত্যাহারের সত্যতা যাচাই আবেদন';
        factsEn = `
          <p>1. That an alleged surrender of cultivation has been represented regarding the scheduled land.</p>
          <p>2. <strong>Circumstances of Alleged Surrender Observed by AI:</strong><br/>
          ${vals.customFacts}</p>
          <p>3. That Section 20B of the WBLR Act mandates statutory personal verification by the Revenue Officer to determine whether the surrender is voluntary and genuine.</p>
        `;
        factsBn = `
          <p>১. তফশিলভুক্ত জমিতে বর্গা চাষ সমর্পণ বা প্রত্যাহারের দাবি উত্থাপিত হইয়াছে।</p>
          <p>২. <strong>সমর্পণ সংক্রান্ত ঘটনাবলী:</strong><br/>
          ${vals.customFacts}</p>
          <p>৩. ধারা ২০(খ) অনুসারে রেভিনিউ অফিসার কর্তৃক নিরপেক্ষ যাচাই আবশ্যক যে উক্ত সমর্পণ স্বেচ্ছাপ্রণোদিত কিনা।</p>
        `;
        prayerEn = `
          The Applicant prays that statutory verification be conducted to determine whether the alleged surrender of barga cultivation was voluntary and lawful.
        `;
        prayerBn = `
          অতএব প্রার্থনা, সংশ্লিষ্ট বর্গাদারকে ব্যক্তিগত তলব পূর্বক বর্গা সমর্পণ স্বেচ্ছাপ্রণোদিত কিনা তাহা বিধিসম্মতভাবে যাচাই করিতে আজ্ঞাবহ হইবেন।
        `;
      }

      let html = `<div style="font-family:'Times New Roman', serif; line-height: 1.8; color: #111;">`;

      // 1. Forum / Bench Header
      if (isRti) {
        html += `
          <div style="background: #f8fafc; border: 1.5px solid #0284c7; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
            <div style="font-weight: bold; font-size: 13px; color: #0369a1; text-transform: uppercase;">TO:</div>
            <div style="font-weight: bold; font-size: 15px; color: #0f172a; margin-top: 2px;">${vals.forum}</div>
            <div style="font-size: 12.5px; color: #475569; margin-top: 2px;">${vals.authorityAddress}</div>
          </div>
        `;
      } else if (isRtiAppeal) {
        html += `
          <div style="background: #faf5ff; border: 1.5px solid #7c3aed; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
            <div style="font-weight: bold; font-size: 12.5px; color: #6d28d9; text-transform: uppercase;">
              ${t === 'rti_sec19_3' || t === 'rti_sec18_20' ? 'BEFORE THE STATE INFORMATION COMMISSION' : 'BEFORE THE FIRST APPELLATE AUTHORITY (FAA) u/s 19 RTI ACT'}
            </div>
            <div style="font-weight: bold; font-size: 15px; color: #0f172a; margin-top: 2px;">${vals.forum}</div>
            <div style="font-size: 12.5px; color: #475569;">Address: ${vals.authorityAddress}</div>
            <div style="font-size: 12.5px; color: #b91c1c; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
              <strong>Concerned SPIO / Authority Details:</strong> ${vals.spioDetails}
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
              ${activeCompany?.name || 'Legal Chamber'}<br/>
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
          advocateName: activeUser?.name,
          vaultFormatReference: activeVaultDraftRef.formatText,
          vaultDraftTitle: activeVaultDraftRef.title
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.draftHtml) {
          setGeneratedDraft(data.draftHtml);
          showToast(`AI Smart Draft modeled on Document Vault format: ${activeVaultDraftRef.title}`, 'success');
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
            chamberHeader: `${activeCompany?.name || 'Legal Chamber'}`,
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
              <span>DRAFTING WITH AI (আইনি ড্রাফটিং)</span>
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
          {/* CATEGORY FILTER: Select Case Form Type dropdown list */}
          {!lockCaseType ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 flex items-center justify-between">
                <label htmlFor="case-form-type-select" className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-violet-600" />
                  <span>Select Case Form Type (মামলার বিষয় ও ধরন নির্বাচন)</span>
                </label>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800/60">
                  {selectedCategory.replace(/_/g, ' ').toUpperCase()} Active
                </span>
              </div>
              <div className="relative">
                <select
                  id="case-form-type-select"
                  value={selectedCategory}
                  onChange={e => {
                    const nextCat = e.target.value as DraftingMatterType;
                    setSelectedCategory(nextCat);
                    if (CASE_TEMPLATES_MAP[nextCat]?.length > 0) {
                      setTemplate(CASE_TEMPLATES_MAP[nextCat][0].id);
                    }
                  }}
                  className="w-full appearance-none px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-xs cursor-pointer"
                >
                  {CASE_FORM_TYPE_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {language === 'bn' ? `${opt.labelBn} (${opt.labelEn})` : `${opt.labelEn} — ${opt.labelBn}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Document Vault Draft Format Auto-Sync Status */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Archive className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Document Vault Format:
                    </span>{' '}
                    <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-400 underline decoration-violet-300">
                      {activeVaultDraftRef.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Vault Formats Synced</span>
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    (Matter assumed internally)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
                  <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                    Drafting Form Adjusted to: {initialCaseType.toUpperCase()} {prefilledCase?.subType ? `· ${prefilledCase.subType}` : 'Case'}
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
              <div className="flex items-center gap-2 pt-1.5 border-t border-violet-200/60 dark:border-violet-800/60 text-[11px] text-violet-800 dark:text-violet-300">
                <Archive className="w-3.5 h-3.5 shrink-0 text-violet-600" />
                <span>Document Vault Format: <strong>{activeVaultDraftRef.title}</strong> (Assumed for {initialCaseType.toUpperCase()})</span>
              </div>
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
                  <span>1. Select Language {!isRtiCategory ? '& Sub Type' : ''}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Live Auto-Draft
                  </span>
                </div>

                {/* Drafting Language Dropdown List */}
                <div>
                  <label htmlFor="drafting-language-select" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 cursor-pointer">
                      <Languages className="w-3.5 h-3.5 text-violet-600" />
                      <span>Drafting Language (ভাষার ধরন)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                      {draftLang === 'english' ? 'English (ইংরেজি)' : draftLang === 'bengali' ? 'বাংলা (Bengali)' : 'Bilingual (উভয় ভাষা)'}
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="drafting-language-select"
                      value={draftLang}
                      onChange={e => handleGenerate(e.target.value as DraftLanguage)}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-xs cursor-pointer"
                    >
                      <option value="english">English (ইংরেজি)</option>
                      <option value="bengali">বাংলা (Bengali)</option>
                      <option value="bilingual">English + বাংলা (Dual / উভয় ভাষা)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Drafting Options for Form Type as a Dropdown List - Completely removed for RTI as requested ("Drafting Options for RTI (ড্রাফটিং বিকল্প) to be removed from DRAFTING WITH AI form") */}
                {!isRtiCategory && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="drafting-template-select" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase cursor-pointer">
                        Select Sub Type & Matter with Sections (উপ-ধরন ও প্রযোজ্য ধারা)
                      </label>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded">
                        {allowedTemplates.length} option{allowedTemplates.length > 1 ? 's' : ''} available
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        id="drafting-template-select"
                        value={template}
                        onChange={e => setTemplate(e.target.value as TemplateType)}
                        className="w-full appearance-none px-3.5 py-2.5 pr-10 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-xs cursor-pointer"
                      >
                        {allowedTemplates.map(t => (
                          <option key={t.id} value={t.id}>
                            {language === 'bn' ? `${t.labelBn} (${t.labelEn})` : `${t.labelEn} — ${t.labelBn}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Active Template Description info pill */}
                    {(() => {
                      const activeMeta = allowedTemplates.find(t => t.id === template);
                      if (!activeMeta?.desc) return null;
                      return (
                        <div className="mt-2 p-2.5 rounded-lg bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 text-[11px] text-violet-800 dark:text-violet-300 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-violet-600" />
                          <span>{activeMeta.desc}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* SECTION: Authority / SPIO fields */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      {template === 'rti' || template === 'rti_sec6_1' || template === 'rti_sec7_1'
                        ? 'To: SPIO or Authority (জনতথ্য আধিকারিক / কর্তৃপক্ষ)'
                        : template === 'rtifirstappeal' || template === 'rti_sec19_1' || template === 'rti_sec19_2' || template === 'rti_sec19_3'
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
                      {isRtiCategory ? 'SPIO Office Address (ঠিকানা)' : 'Authority Office Address (কার্যালয়ের ঠিকানা)'}
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
                  {(template === 'rtifirstappeal' || template === 'rti_sec19_1' || template === 'rti_sec19_2' || template === 'firstappeal') && (
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
                        {isRtiCategory ? 'Applicant Name (আবেদনকারী)' : 'Petitioner / Appellant Name'}
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
                {!isRtiCategory && (
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
                      <span>+ Add Schedule</span>
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
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Archive className="w-3 h-3 text-violet-600" />
                      <span className="truncate max-w-[140px]" title={activeVaultDraftRef.title}>
                        Vault: {activeVaultDraftRef.title}
                      </span>
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
