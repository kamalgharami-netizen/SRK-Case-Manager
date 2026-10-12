import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
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
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export type DraftLanguage = 'english' | 'bengali' | 'bilingual';

export type TemplateType =
  | 'mutation'
  | 'misc10000'
  | 'lrappeal'
  | 'firstappeal'
  | 'sec5delay'
  | 'conversion'
  | 'rti'
  | 'rtifirstappeal';

interface FormValues {
  forum: string;
  partyName: string;
  fatherName: string;
  address: string;
  oppParty: string;
  deedNoDate: string;
  mouzaJl: string;
  khatianDag: string;
  landAreaClass: string;
  customFacts: string;
}

export const AiStudio: React.FC = () => {
  const { activeCompany, activeUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'draft' | 'learning'>('draft');

  // Drafting inputs
  const [template, setTemplate] = useState<TemplateType>('mutation');
  const [draftLang, setDraftLang] = useState<DraftLanguage>('bilingual');
  const [forum, setForum] = useState('Before the Ld. Block Land & Land Reforms Officer, Rajarhat');
  const [partyName, setPartyName] = useState('Debashis Chatterjee');
  const [fatherName, setFatherName] = useState('Late Birendra Nath Chatterjee');
  const [address, setAddress] = useState('Flat 3B, Greenwood Park, Action Area I, New Town, Kolkata - 700156');
  const [oppParty, setOppParty] = useState('The State of West Bengal');
  const [deedNoDate, setDeedNoDate] = useState('Registered Deed No. 04812/2024 dated 04-11-2024');
  const [mouzaJl, setMouzaJl] = useState('Mouza - Patharghata, J.L. No. - 36');
  const [khatianDag, setKhatianDag] = useState('L.R. Khatian No. 1428, L.R. Dag No. 482');
  const [landAreaClass, setLandAreaClass] = useState('Area 0.08 Acre, Classification - Bastu');
  const [customFacts, setCustomFacts] = useState('The petitioner purchased the subject land for valuable consideration and is in exclusive peaceful possession thereof without any interruption.');

  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  // Pure function to generate HTML draft
  const buildDraft = useCallback((
    t: TemplateType,
    lang: DraftLanguage,
    vals: FormValues
  ): string => {
    let courtHeaderEn = '';
    let courtHeaderBn = '';
    let subjectEn = '';
    let subjectBn = '';
    let factsEn = '';
    let factsBn = '';
    let prayerEn = '';
    let prayerBn = '';

    if (t === 'mutation') {
      courtHeaderEn = 'IN THE COURT OF THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
      courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার / ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে দরখাস্ত';
      subjectEn = 'PETITION UNDER SECTION 50 OF THE WEST BENGAL LAND REFORMS ACT, 1955 FOR MUTATION OF NAME AND OPENING OF SEPARATE KHATIAN';
      subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫০ ধারা মতে রৈয়তের নামপত্তন ও পৃথক খতিয়ান খোলার আবেদন';
      factsEn = `
        <p>1. That the Petitioner above-named is a citizen of India and is residing at the address mentioned in the cause title.</p>
        <p>2. That the Petitioner has purchased the land specifically described in the Schedule hereunder written by virtue of ${vals.deedNoDate} registered at ADSR Office, for valuable consideration.</p>
        <p>3. That upon execution and registration of the aforesaid deed of conveyance, possession of the schedule land was duly delivered to the Petitioner, and the Petitioner is in exclusive physical and peaceful possession thereof.</p>
        <p>4. That ${vals.customFacts}</p>
        <p>5. That the vendor of the petitioner was duly recorded in the record-of-rights and had clear, marketable and transferable title in respect of the schedule land.</p>
        <p>6. That in terms of Section 50 of the West Bengal Land Reforms Act, 1955, read with Chapter IV of the West Bengal Land Reforms Manual, 1991, the Petitioner is legally entitled to have his name mutated and recorded in the Record-of-Rights (ROR).</p>
      `;
      factsBn = `
        <p>১. আবেদনকারী ভারতের নাগরিক এবং অত্র মামলার শিরোনামে উল্লেখিত ঠিকানার স্থায়ী বাসিন্দা।</p>
        <p>২. আবেদনকারী অত্র দরখাস্তের নিম্ন তফসিল বর্ণিত জমি বিগত সাব-রেজিস্ট্রার অফিসে রেজিস্ট্রিকৃত ${vals.deedNoDate} মূলে ন্যায়সঙ্গত মূল্যে খরিদ সূত্রে বৈধ মালিক ও স্বত্বাধিকারী হইয়াছেন।</p>
        <p>৩. দলিল সম্পাদনের পর অত্র তফসিল বর্ণিত জমি আবেদনকারীকে দখল সমর্পণ করা হইয়াছে এবং আবেদনকারী নিরঙ্কুশ ও শান্তিপূর্ণ দখলে আছেন।</p>
        <p>৪. তথ্য বিবরণ: ${vals.customFacts}</p>
        <p>৫. আবেদনকারীর বিক্রেতার নাম সংশ্লিষ্ট খতিয়ানে সঠিকভাবে নথিভুক্ত ছিল এবং উক্ত জমি হস্তান্তরযোগ্য ছিল।</p>
        <p>৬. পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫০ ধারা এবং ভূমি সংস্কার ম্যানুয়াল ১৯৯১ এর চতুর্থ অধ্যায় মোতাবেক আবেদনকারী তাহার নাম রেকর্ডভুক্ত করার পূর্ণ আইনগত অধিকারী।</p>
      `;
      prayerEn = `
        In the circumstances stated above, it is most respectfully prayed that Your Honour may graciously be pleased to:
        <br/>a) Issue statutory notice to all interested co-sharers/parties;
        <br/>b) Call for a field inquiry report from the concerned Revenue Inspector;
        <br/>c) Pass an order directing mutation of the name of the Petitioner in respect of the Schedule land and opening of a separate L.R. Khatian in favour of the Petitioner;
        <br/>And pass such further or other order or orders as Your Honour may deem fit and proper.
      `;
      prayerBn = `
        অতএব মাননীয় সমীপে বিনীত প্রার্থনা, উক্ত তফসিল বর্ণিত জমিতে সরেজমিনে তদন্ত সাপেক্ষে সংশ্লিষ্ট পক্ষগণকে শুনানির নোটিশ প্রদান পূর্বক আবেদনকারীর নামে নামজারি (মিউটেশন) মঞ্জুর করিয়া পৃথক এল.আর. খতিয়ান খোলার আদেশ প্রদানে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'misc10000') {
      courtHeaderEn = 'BEFORE THE REVENUE OFFICER / BLOCK LAND & LAND REFORMS OFFICER';
      courtHeaderBn = 'মাননীয় রেভিনিউ অফিসার / ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে দরখাস্ত';
      subjectEn = 'PETITION UNDER SECTION 50 READ WITH SECTION 50A OF WBLR ACT, 1955 FOR CORRECTION OF 10000-SHARE ANOMALY';
      subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫০ ও ৫০(ক) ধারা মতে ১০,০০০ হিস্যা বৈষম্য নিরসন ও খতিয়ান সংশোধনের দরখাস্ত';
      factsEn = `
        <p>1. That the Petitioner is a recorded co-sharer in respect of the Schedule Dag.</p>
        <p>2. That upon inspection of the computerized Record-of-Rights on the Banglarbhumi portal, it appears that the aggregate sum of shares of all recorded co-sharers in Dag No. either exceeds or falls short of the statutory ceiling of 10000 parts.</p>
        <p>3. That due to this fractional discrepancy, further mutation and land tax (Khajna) payment has been locked in the computer system.</p>
        <p>4. That ${vals.customFacts}</p>
        <p>5. That under Section 50A of the West Bengal Land Reforms Act, 1955, the Revenue Officer is fully empowered to rectify clerical errors and mathematical share mismatches.</p>
      `;
      factsBn = `
        <p>১. আবেদনকারী অত্র তফসিল বর্ণিত দাগের একজন বৈধ সহ-অংশীদার (রেকর্ডভুক্ত রৈয়ত)।</p>
        <p>২. 'বাংলার ভূমি' পোর্টালের বর্তমান কম্পিউটারাইজড রেকর্ড অনুসারে দেখা যাইতেছে যে, উক্ত দাগের সকল অংশীদারের সম্মিলিত অংশ ১০,০০০ ভাগের সমান না হইয়া কম বা বেশি রহিয়াছে।</p>
        <p>৩. এই গাণিতিক অসঙ্গতির কারণে অনলাইনে খাজনা প্রদান ও নামজারি প্রক্রিয়া অবরুদ্ধ হইয়া পড়িয়াছে।</p>
        <p>৪. তথ্য বিবরণ: ${vals.customFacts}</p>
        <p>৫. পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫০(ক) ধারা অনুসারে রেভিনিউ অফিসারের উক্ত করণিক ভুল সংশোধন করিবার পূর্ণ আইনগত এখতিয়ার রহিয়াছে।</p>
      `;
      prayerEn = `
        It is therefore prayed that Your Honour may graciously be pleased to initiate a Misc Case, verify the original survey and link deeds, and re-apportion the 10000-share distribution in the computerized khatian in accordance with law.
      `;
      prayerBn = `
        অতএব প্রার্থনা, একটি বিবিধ মামলা (Misc Case) রুজু করিয়া মূল জরিপ ও দলিল পর্যালোচনা পূর্বক আইনানুযায়ী ১০,০০০ অংশের বণ্টন সংশোধন করিতে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'lrappeal') {
      courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
      courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক (DL&LRO) সমীপে আপিল স্মারকলিপি';
      subjectEn = 'MEMORANDUM OF APPEAL UNDER SECTION 54 OF THE WEST BENGAL LAND REFORMS ACT, 1955';
      subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৫৪ ধারা মতে আপিলের স্মারকলিপি (Memorandum of Appeal)';
      factsEn = `
        <p>1. That this Appeal is directed against the impugned order passed by the Ld. Revenue Officer in Mutation Case No., erroneously disposing the matter without adherence to statutory rules.</p>
        <p>2. That the Ld. Revenue Officer committed a manifest error of law and fact in failing to consider the link deeds and Waris genealogy produced by the Appellant.</p>
        <p>3. That no statutory notice was served upon the Appellant under Rule 24 of the West Bengal Land Reforms Manual, 1991, thereby causing severe prejudice and gross violation of natural justice.</p>
        <p>4. That ${vals.customFacts}</p>
        <p><strong>GROUNDS OF APPEAL:</strong><br/>
        I. For that the impugned order was passed behind the back of the recorded co-sharer.<br/>
        II. For that the impugned order is per se illegal, arbitrary, and perverse.<br/>
        III. For that the Appellant has a prima facie case with balance of convenience strongly in his favour.</p>
      `;
      factsBn = `
        <p>১. অত্র আপিলটি নিম্ন আদালতের রেভিনিউ অফিসার কর্তৃক মিউটেশন মামলায় প্রদত্ত অন্যায় ও বেআইনি আদেশের বিরুদ্ধে দায়ের করা হইল।</p>
        <p>২. নিম্ন আদালত আপিলকারীর দাখিলকৃত লিংক দলিল ও ওয়ারিশান সনদ বিবেচনা না করিয়া আইনের গুরুতর ভুল করিয়াছেন।</p>
        <p>৩. ভূমি সংস্কার ম্যানুয়াল ১৯৯১ এর ২৪ নম্বর বিধি অনুসারে আপিলকারীকে কোনো বিধিসম্মত শুনানির নোটিশ প্রদান করা হয় নাই, যাহা প্রাকৃতিক ন্যায়বিচারের পরিপন্থী।</p>
        <p>৪. আপিলের গ্রাউন্ডস: রেকর্ডভুক্ত অংশীদারের অগোচরে একতরফা আদেশ প্রদান করা হইয়াছে এবং উক্ত আদেশ বাতিলযোগ্য।</p>
      `;
      prayerEn = `
        The Appellant therefore prays that Your Honour may graciously be pleased to admit this Memorandum of Appeal, call for the lower court records, pass an interim stay order, and set aside the impugned order.
      `;
      prayerBn = `
        অতএব প্রার্থনা, অত্র আপিল শুনানির জন্য গ্রহণ করিয়া নিম্ন আদালতের মূল নথি তলব পূর্বক অন্তর্বর্তীকালীন স্থগিতাদেশ প্রদান করিয়া উক্ত বিতর্কিত আদেশ বাতিল ও খারিজ করিতে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'firstappeal') {
      courtHeaderEn = 'IN THE COURT OF THE APPELLATE AUTHORITY / DL&LRO / ADM (L&LR)';
      courtHeaderBn = 'মাননীয় বিধিবদ্ধ প্রথম আপিল কর্তৃপক্ষ / ডিএলঅ্যান্ডএলআরও / অতিরিক্ত জেলা সমাহর্তা সমীপে';
      subjectEn = 'MEMORANDUM OF STATUTORY FIRST APPEAL (ORDER 41 CPC / SEC 54 WBLR ACT)';
      subjectBn = 'বিধিবদ্ধ প্রথম আপিলের স্মারকলিপি (Statutory First Appeal)';
      factsEn = `
        <p>1. That the Appellant is severely aggrieved by and dissatisfied with the impugned judgment and order passed by the primary adjudicating authority.</p>
        <p>2. That the lower forum completely failed to appreciate the documentary chain of title and long physical possession of the Appellant.</p>
        <p>3. That the primary authority acted without jurisdiction and passed the order in contravention of statutory safeguards.</p>
        <p>4. That ${vals.customFacts}</p>
        <p><strong>GROUNDS OF FIRST APPEAL:</strong><br/>
        I. For that the finding of the lower court is contrary to law and weight of evidence.<br/>
        II. For that the lower court misdirected itself in applying the provisions of the Land Reforms law.<br/>
        III. For that unless stay of operation of the impugned order is granted, the Appellant will suffer irreparable loss and injury.</p>
      `;
      factsBn = `
        <p>১. আপিলকারী নিম্ন আদালতের তর্কিত রায় ও আদেশে সংক্ষুব্ধ হইয়া অত্র প্রথম আপিল দায়ের করিতেছেন।</p>
        <p>২. নিম্ন আদালত দলিলের সঠিক ধারাবাহিকতা ও দীর্ঘদিনের বাস্তব দখলীয় প্রমাণ বিবেচনায় গ্রহণ করিতে ব্যর্থ হইয়াছেন।</p>
        <p>৩. শুনানিতে আইনসঙ্গত সুযোগ প্রদান ব্যতিরেকেই আইনবহির্ভূতভাবে বিতর্কিত আদেশ জারি করা হইয়াছে।</p>
        <p>৪. আপিলের গ্রাউন্ডস: নিম্ন আদালতের পর্যবেক্ষণ তথ্য ও প্রমাণের পরিপন্থী এবং স্থগিতাদেশ না দিলে অপূরণীয় ক্ষতি হইবে।</p>
      `;
      prayerEn = `
        The Appellant prays that Your Honour may graciously be pleased to admit this Statutory First Appeal, stay operation of the impugned order pending disposal of the appeal, set aside the judgment of the lower court, and grant full relief.
      `;
      prayerBn = `
        অতএব প্রার্থনা, অত্র প্রথম আপিল গ্রহণ করিয়া বিতর্কিত আদেশের কার্যক্রম স্থগিত পূর্বক উক্ত রায় ও আদেশ খারিজ করিয়া আপিলকারীর পক্ষে ন্যায্য প্রতিকার প্রদানে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'sec5delay') {
      courtHeaderEn = 'IN THE COURT OF THE LD. DISTRICT LAND & LAND REFORMS OFFICER (DL&LRO)';
      courtHeaderBn = 'মাননীয় জেলা ভূমি ও ভূমি সংস্কার আধিকারিক (DL&LRO) সমীপে দরখাস্ত';
      subjectEn = 'APPLICATION UNDER SECTION 5 OF THE LIMITATION ACT, 1963 FOR CONDONATION OF DELAY IN PREFERRING APPEAL';
      subjectBn = 'তামাদি আইন, ১৯৬৩ এর ৫ ধারা মতে আপিল দাখিলে বিলম্ব মার্জনার দরখাস্ত';
      factsEn = `
        <p>1. That the Appellant has filed the accompanying Memorandum of Appeal against the order passed by the Ld. Revenue Officer.</p>
        <p>2. That the appeal could not be preferred within the statutory limitation period due to bona fide reasons beyond the control of the Appellant.</p>
        <p>3. That certified copy of the order was received after delay, and ${vals.customFacts}</p>
        <p>4. That the delay was neither intentional nor deliberate, but occasioned by sufficient cause as envisaged under Section 5 of the Limitation Act, 1963.</p>
      `;
      factsBn = `
        <p>১. আপিলকারী রেভিনিউ অফিসারের আদেশের বিরুদ্ধে সঙ্গে সংযুক্ত আপিল স্মারকলিপি দাখিল করিয়াছেন।</p>
        <p>২. নির্ধারিত ৬০ দিনের মধ্যে আপিল দাখিল করা সম্ভব হয় নাই কারণ আদেশের নকল প্রাপ্তিতে বিলম্ব ও আকস্মিক অসুস্থতা বশত আইনগত বাধা সৃষ্টি হইয়াছিল।</p>
        <p>৩. এই বিলম্ব ইচ্ছাকৃত নহে, বরং তামাদি আইনের ৫ ধারা মতে পর্যাপ্ত ও যুক্তিগ্রাহ্য কারণে ঘটিয়াছে।</p>
      `;
      prayerEn = `
        It is respectfully prayed that Your Honour may graciously be pleased to condone the delay in preferring the appeal and admit the same on merits.
      `;
      prayerBn = `
        অতএব প্রার্থনা, বিলম্ব মার্জনা করিয়া আপিলটি শুনানির জন্য গ্রহণ করিতে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'conversion') {
      courtHeaderEn = 'BEFORE THE COLLECTOR / DISTRICT LAND & LAND REFORMS OFFICER';
      courtHeaderBn = 'মাননীয় সমাহর্তা / জেলা ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে দরখাস্ত';
      subjectEn = 'PETITION UNDER SECTION 4C OF THE WEST BENGAL LAND REFORMS ACT, 1955 FOR PERMISSION TO CONVERT LAND USE';
      subjectBn = 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ এর ৪(গ) ধারা মতে ভূমির ব্যবহার ও শ্রেণি পরিবর্তনের দরখাস্ত';
      factsEn = `
        <p>1. That the Petitioner is the recorded owner and raiyat in respect of the Schedule land, currently classified in the ROR as Sali/Danga.</p>
        <p>2. That the surrounding locality has undergone comprehensive urbanization and no agricultural cultivation is feasible on the contiguous plots.</p>
        <p>3. That the Petitioner intends to utilize the schedule land for residential/homestead (Bastu) purposes.</p>
        <p>4. That ${vals.customFacts}</p>
        <p>5. That the proposed conversion will not interfere with adjoining drainage or cause any public nuisance.</p>
      `;
      factsBn = `
        <p>১. আবেদনকারী তফসিল বর্ণিত জমির রেকর্ডভুক্ত মালিক ও দখলদার, যাহা বর্তমানে শালী/ডাঙ্গা শ্রেণিভুক্ত।</p>
        <p>২. সংলগ্ন অঞ্চল সম্পূর্ণ নগরায়িত হওয়ায় উক্ত জমিতে কোনো কৃষি কাজ সম্ভব নহে।</p>
        <p>৩. আবেদনকারী উক্ত জমি নিজ বাসগৃহ নির্মাণের উপযোগী বাস্তু শ্রেণিতে রূপান্তর করিতে ইচ্ছুক।</p>
        <p>৪. এই শ্রেণি পরিবর্তনে সংলগ্ন কোনো নিকাশি বা পরিবেশগত ক্ষতি হইবে না।</p>
      `;
      prayerEn = `
        The Petitioner prays that Your Honour may be pleased to direct the Revenue Inspector to inspect the site and grant formal conversion certificate under Section 4C of WBLR Act, 1955 upon deposit of requisite government conversion fees.
      `;
      prayerBn = `
        অতএব প্রার্থনা, রাজস্ব পরিদর্শক দ্বারা স্থান পরিদর্শন পূর্বক সরকারি ফি জমাদানে শ্রেণি পরিবর্তনের অনুমতি প্রদান করিতে আজ্ঞাবহ হইবেন।
      `;
    } else if (t === 'rtifirstappeal') {
      courtHeaderEn = 'BEFORE THE FIRST APPELLATE AUTHORITY (FAA) UNDER RTI ACT, 2005';
      courtHeaderBn = 'মাননীয় প্রথম আপিল কর্তৃপক্ষ (First Appellate Authority - FAA) সমীপে আর.টি.আই. আপিল';
      subjectEn = 'MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005';
      subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ১৯(১) ধারা মতে প্রথম আপিলের স্মারকলিপি';
      factsEn = `
        <p>1. Name & Address of Appellant: ${vals.partyName}, ${vals.address}</p>
        <p>2. Details of SPIO: State Public Information Officer, Office of the BL&LRO.</p>
        <p>3. Date of RTI Application u/s 6(1): Applied with statutory fee of ₹10.</p>
        <p>4. Grounds of Appeal: The SPIO has failed to furnish the requested information within the mandatory statutory period of 30 days / furnished incomplete, misleading information.</p>
        <p>5. Specific Facts: ${vals.customFacts}</p>
      `;
      factsBn = `
        <p>১. আপিলকারীর নাম ও ঠিকানা: ${vals.partyName}, ${vals.address}</p>
        <p>২. সংশ্লিষ্ট জনতথ্য আধিকারিক (SPIO): বিএলঅ্যান্ডএলআরও কার্যালয়।</p>
        <p>৩. আরটিআই আবেদনের বিবরণ: ৬(১) ধারায় ইতিপূর্বে দরখাস্ত দাখিল করা হইয়াছিল।</p>
        <p>৪. আপিলের কারণ: জনতথ্য আধিকারিক নির্ধারিত ৩০ দিনের মধ্যে তথ্য প্রদান করেন নাই / বিভ্রান্তিকর তথ্য প্রদান করিয়াছেন।</p>
      `;
      prayerEn = `
        The Appellant prays that the First Appellate Authority may graciously be pleased to admit this Appeal and direct the SPIO to supply all certified information forthwith without further delay.
      `;
      prayerBn = `
        অতএব প্রার্থনা, অত্র প্রথম আপিল গ্রহণ করিয়া সংশ্লিষ্ট এসপিআইও-কে অবিলম্বে নিঃশর্তভাবে সম্পূর্ণ ও নির্ভুল প্রত্যয়িত তথ্য সরবরাহের নির্দেশ প্রদানে আজ্ঞাবহ হইবেন।
      `;
    } else {
      courtHeaderEn = 'BEFORE THE STATE PUBLIC INFORMATION OFFICER (SPIO) / BL&LRO';
      courtHeaderBn = 'মাননীয় রাজ্য জনতথ্য আধিকারিক (SPIO) / বিএলঅ্যান্ডএলআরও সমীপে দরখাস্ত';
      subjectEn = 'APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005';
      subjectBn = 'তথ্য জানার অধিকার আইন, ২০০৫ এর ৬(১) ধারা মতে তথ্য ও জাবেদা নকল পাইবার দরখাস্ত';
      factsEn = `
        <p>1. Full Name of Applicant: ${vals.partyName}</p>
        <p>2. Address: ${vals.address}</p>
        <p>3. Particulars of Information Sought:</p>
        <p>a) Certified inspection report submitted by the Revenue Inspector in respect of ${vals.mouzaJl}, ${vals.khatianDag}.<br/>
        b) Certified copies of notices issued in Case No.<br/>
        c) Certified copy of order-sheet dated .</p>
        <p>4. That ${vals.customFacts}</p>
        <p>5. Requisite RTI fee of ₹ 10 has been deposited through Court Fee Stamp / IPO affixed herewith.</p>
      `;
      factsBn = `
        <p>১. আবেদনকারীর নাম: ${vals.partyName}</p>
        <p>২. পূর্ণ ঠিকানা: ${vals.address}</p>
        <p>৩. প্রার্থিত তথ্যের বিবরণ:<br/>
        ক) তফসিল বর্ণিত ${vals.mouzaJl}, ${vals.khatianDag} সংক্রান্ত সরেজমিনে তদন্ত প্রতিবেদন।<br/>
        খ) সংশ্লিষ্ট মামলায় জারিকৃত সকল নোটিশের প্রত্যয়িত অনুলিপি।<br/>
        গ) সংশ্লিষ্ট আদেশনামার সহি মোহর নকল।</p>
        <p>৪. নির্ধারিত ১০ টাকার কোর্ট ফি / আইপিও অত্র দরখাস্তে সংযুক্ত করা হইল।</p>
      `;
      prayerEn = `
        The Applicant requests that the certified copies of the aforesaid documents be supplied within the statutory period of 30 days under the RTI Act, 2005.
      `;
      prayerBn = `
        অতএব প্রার্থনা, তথ্য জানার অধিকার আইন ২০০৫ অনুসারে বিধিবদ্ধ ৩০ দিনের মধ্যে প্রার্থিত তথ্যাদি ও প্রত্যয়িত নকল সরবরাহ করিতে আজ্ঞাবহ হইবেন।
      `;
    }

    let html = `<div style="font-family:'Times New Roman', serif; line-height: 1.8; color: #111;">`;

    // 1. Forum / Bench Header
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
      // Bilingual
      html += `
        <div style="text-align: center; border-bottom: 1.5px double #cbd5e1; padding-bottom: 10px; margin-bottom: 16px;">
          <div style="font-weight: bold; font-size: 14px; color: #1E3A8A;">${courtHeaderEn}</div>
          <div style="font-weight: bold; font-size: 13.5px; color: #047857; margin-top: 2px;">${courtHeaderBn}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">(${vals.forum})</div>
        </div>
      `;
    }

    // 2. Cause Title / Parties
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
      // Bilingual Cause Title
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

    // 4. Statement of Facts
    if (lang === 'english') {
      html += `
        <div style="font-size: 13px; text-align: justify; margin-bottom: 16px;">
          <p><strong>The humble petition of the Petitioner above-named most respectfully sheweth:</strong></p>
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
      // Dual language (both) parallel sections
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

    // 5. Land Schedule
    html += `
      <div style="margin: 16px 0; padding: 10px; border: 1px solid #777; font-size: 12px; background: #FAFBFD;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 6px; text-decoration: underline;">
          ${lang === 'bengali' ? 'মামলার তফসিল পরিচয় (SCHEDULE OF LAND)' : lang === 'bilingual' ? 'SCHEDULE OF LAND / জমির তফসিল বিবরণ' : 'SCHEDULE OF LAND REFERRED TO ABOVE'}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div><strong>District & Mouza (মৌজা ও জে.এল.):</strong> ${vals.mouzaJl}</div>
          <div><strong>Khatian & Dag (খতিয়ান ও দাগ):</strong> ${vals.khatianDag}</div>
          <div><strong>Area & Class (জমির পরিমাণ ও শ্রেণি):</strong> ${vals.landAreaClass}</div>
          <div><strong>Deed / Document (দলিল নম্বর ও তারিখ):</strong> ${vals.deedNoDate}</div>
        </div>
      </div>
    `;

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
      // Dual language prayer
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
            ${lang === 'bengali' ? 'আবেদনকারী / আপিলকারী' : 'Petitioner / Appellant'}<br/><br/>
            Through Advocate<br/>
            <strong>${activeUser?.name || 'Advocate'}</strong><br/>
            ${activeCompany?.name || 'SRK Legal Chamber'}<br/>
            <span style="font-size: 11px; color: #555;">Bar Reg: ${activeCompany?.barCouncil || 'WB/Chamber'}</span>
          </div>
        </div>
      </div>
    `;

    return html;
  }, [activeCompany, activeUser]);

  // Current form values packaged
  const currentFormValues: FormValues = useMemo(() => ({
    forum,
    partyName,
    fatherName,
    address,
    oppParty,
    deedNoDate,
    mouzaJl,
    khatianDag,
    landAreaClass,
    customFacts
  }), [forum, partyName, fatherName, address, oppParty, deedNoDate, mouzaJl, khatianDag, landAreaClass, customFacts]);

  // Auto-generate on mount and whenever any field/language/template changes!
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

  // AI Enhanced Drafting using Gemini
  const handleAiSmartDraft = async () => {
    setIsAiLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback to rich built-in drafting
        const html = buildDraft(template, draftLang, currentFormValues);
        setGeneratedDraft(html);
        showToast('Generated using standard West Bengal drafting engine');
        setIsAiLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Senior Revenue Advocate at the Calcutta High Court and West Bengal Land Reforms Authority.
Draft a complete, formal, court-ready legal pleading for West Bengal Revenue authorities.
Parameters:
- Template Type: ${template}
- Language: ${draftLang} (If bilingual, write parallel English and formal Bengali sections)
- Forum: ${forum}
- Petitioner: ${partyName}, S/o ${fatherName}, residing at ${address}
- Opposite Party: ${oppParty}
- Land Schedule: ${mouzaJl}, ${khatianDag}, ${landAreaClass}, ${deedNoDate}
- Facts: ${customFacts}

Format the response as clean HTML ready for court printing with:
- Formal Cause Title
- Statutory Subject Line
- Paragraphs of Facts citing relevant sections of WBLR Act 1955 and WBLR Manual 1991
- Specific Grounds of Appeal or Correction
- Schedule of Land
- Formal Prayer with interim protection / stay clauses
- Verification and Signature blocks. Return only HTML tags (div, p, table, etc.).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const output = response.text?.trim() || '';
      if (output) {
        // Clean markdown backticks if returned
        const cleanedHtml = output.replace(/^```html\s*/i, '').replace(/```$/i, '');
        setGeneratedDraft(cleanedHtml);
        showToast('AI Smart Draft generated successfully with Gemini');
      } else {
        const fallback = buildDraft(template, draftLang, currentFormValues);
        setGeneratedDraft(fallback);
      }
    } catch (e) {
      console.error('AI Smart Draft error:', e);
      const fallback = buildDraft(template, draftLang, currentFormValues);
      setGeneratedDraft(fallback);
      showToast('Generated using West Bengal standard legal model');
    } finally {
      setIsAiLoading(false);
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
            prayerStyle: 'Formal Prayer with sub-clauses (a, b, c) and interim injunction clause',
            citationStyle: 'WBLR Act 1955 & WBLR Manual 1991 Rule 21-27 format',
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            <span>AI Drafting Studio (আইনি ড্রাফটিং স্টুডিও)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated legal petition drafting in English, বাংলা (Bengali), and Dual-Language (উভয় ভাষা সম্পূর্ণ).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Petition Drafting
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'learning'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Chamber Folder Learning
          </button>
        </div>
      </div>

      {activeTab === 'draft' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>1. Select Language & Template</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">Live Auto-Draft</span>
              </div>

              {/* Language Selection Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-violet-600" />
                    <span>Drafting Language (ভাষার ধরন)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                    {draftLang === 'bilingual' ? 'উভয় ভাষা (Dual Language)' : draftLang === 'bengali' ? 'বাংলা (Bengali)' : 'English (ইংরেজি)'}
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
                    বাংলা (Bengali)
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
                    Both (উভয় ভাষা)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Drafting Template
                </label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value as TemplateType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-600"
                >
                  <option value="mutation">Mutation Petition u/s 50 (নামপত্তন ও খারিজের দরখাস্ত)</option>
                  <option value="misc10000">10000-Share Correction u/s 50A (১০,০০০ হিস্যা সংশোধন)</option>
                  <option value="lrappeal">Memo of Appeal u/s 54 (এল.আর. আপিল মেমোরেন্ডাম)</option>
                  <option value="firstappeal">Statutory First Appeal (বিধিবদ্ধ প্রথম আপিল)</option>
                  <option value="sec5delay">Section 5 Delay Condonation (তামাদি মকুবের আবেদন)</option>
                  <option value="conversion">Conversion Petition u/s 4C (বাস্তু শ্রেণি রূপান্তর)</option>
                  <option value="rti">RTI Application u/s 6(1) (তথ্য জানার অধিকার দরখাস্ত)</option>
                  <option value="rtifirstappeal">RTI First Appeal u/s 19(1) (আর.টি.আই. প্রথম আপিল)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Adjudicating Authority / Forum
                </label>
                <input
                  type="text"
                  value={forum}
                  onChange={e => setForum(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Petitioner Name (আবেদনকারী)
                  </label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={e => setPartyName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Father's Name (পিতা)
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={e => setFatherName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Petitioner Address (ঠিকানা)
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
                  Opposite Party (বিবাদী / প্রতিপক্ষ)
                </label>
                <input
                  type="text"
                  value={oppParty}
                  onChange={e => setOppParty(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Mouza & JL (মৌজা ও জে.এল.)
                  </label>
                  <input
                    type="text"
                    value={mouzaJl}
                    onChange={e => setMouzaJl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Khatian & Dag (খতিয়ান ও দাগ)
                  </label>
                  <input
                    type="text"
                    value={khatianDag}
                    onChange={e => setKhatianDag(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Area & Class (পরিমাণ ও শ্রেণি)
                  </label>
                  <input
                    type="text"
                    value={landAreaClass}
                    onChange={e => setLandAreaClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Deed No & Date (দলিল)
                  </label>
                  <input
                    type="text"
                    value={deedNoDate}
                    onChange={e => setDeedNoDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Specific Fact Remarks (ঘটনার বিবরণ)
                </label>
                <textarea
                  rows={2}
                  value={customFacts}
                  onChange={e => setCustomFacts(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-Draft
                </button>
                <button
                  type="button"
                  onClick={handleAiSmartDraft}
                  disabled={isAiLoading}
                  className="w-full py-2.5 px-3 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
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
            </div>
          </div>

          {/* Draft Preview column (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[560px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-violet-600" />
                    Legal Draft Preview
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    draftLang === 'bilingual' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300' :
                    draftLang === 'bengali' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
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
                        draftLang === 'english' ? 'bg-white dark:bg-slate-700 text-blue-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('bengali')}
                      className={`px-2.5 py-1 font-semibold rounded cursor-pointer transition-colors ${
                        draftLang === 'bengali' ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('bilingual')}
                      className={`px-2.5 py-1 font-semibold rounded cursor-pointer transition-colors ${
                        draftLang === 'bilingual' ? 'bg-white dark:bg-slate-700 text-violet-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
                  className="mt-4 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[640px] overflow-y-auto"
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

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Standard West Bengal Revenue Court Format</span>
              <span>Unicode Bengali & English Validated</span>
            </div>
          </div>
        </div>
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
