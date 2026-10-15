export type AppLanguage = 'en' | 'bn';

export interface Translations {
  // Navigation & Branding
  appTitle: string;
  dashboard: string;
  landCases: string;
  toolsLibrary: string;
  chamberOffice: string;
  closeMenu: string;
  openMenu: string;
  switchChamber: string;
  backupSettings: string;
  
  // Case Types
  mutationCase: string;
  mutationDesc: string;
  miscCase: string;
  miscDesc: string;
  lrAppeal: string;
  lrAppealDesc: string;
  firstAppeal: string;
  firstAppealDesc: string;
  rtiMatter: string;
  rtiDesc: string;
  lrttTribunal: string;
  lrttDesc: string;
  conversionCase: string;
  conversionDesc: string;

  // Tools & Modules
  dailyCauseList: string;
  causeListDesc: string;
  shareCalc: string;
  shareCalcDesc: string;
  aiLegalDrafting: string;
  aiDraftingDesc: string;
  statutoryWblr: string;
  statutoryDesc: string;
  clientRegistry: string;
  clientDesc: string;
  documentVault: string;
  vaultDesc: string;
  caseDiary: string;
  diaryDesc: string;
  clientMessaging: string;
  messageDesc: string;
  advocateTeam: string;
  teamDesc: string;

  // Common Actions
  searchPlaceholder: string;
  newCase: string;
  newMutation: string;
  newMisc: string;
  newLrAppeal: string;
  newFirstAppeal: string;
  newRti: string;
  newConversion: string;
  filter: string;
  export: string;
  print: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  viewDetails: string;
  totalCases: string;
  todaysHearings: string;
  pendingCases: string;
  disposedCases: string;
  welcomeBack: string;
  chamberOverview: string;
  switchToBengali: string;
  switchToEnglish: string;

  // Dashboard Specific Keys
  firstAppealMenuTitle: string;
  firstAppealHubTitle: string;
  firstAppealHubDesc: string;
  openFirstAppealDashboard: string;
  fileNewFirstAppeal: string;
  rtiMenuTitle: string;
  rtiHubTitle: string;
  rtiHubDesc: string;
  openRtiDashboard: string;
  fileNewRtiQuery: string;
  landCaseModulesTitle: string;
  clickModuleSubtitle: string;
  acrossCategoriesDesc: string;
  onCauseListDesc: string;
  inHearingInquiryDesc: string;
  vaultFilesTitle: string;
  deedsRorDesc: string;
  todaysCauseListTitle: string;
  openFullList: string;
  noHearingsScheduled: string;
  upcomingHearingsTitle: string;
  noUpcomingHearings: string;
  shareCalculatorBtn: string;
  aiStudioBtn: string;
  tableTime: string;
  tableCaseNo: string;
  tablePartyForum: string;
  tableStatus: string;

  // Viewing & Display Options
  viewOptions: string;
  displayPreferences: string;
  themeMode: string;
  lightTheme: string;
  darkTheme: string;
  viewDensity: string;
  comfortable: string;
  compact: string;
  readingFontSize: string;
  fontStandard: string;
  fontLarge: string;
  highContrastMode: string;
  cardGridView: string;
  tabularListView: string;
  applyPreferences: string;
  resetDefaults: string;
  mandatorySetupTitle: string;
  mandatorySetupSubtitle: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    appTitle: 'SRK Case Manager',
    dashboard: 'Dashboard',
    landCases: 'Land Cases (মামলা)',
    toolsLibrary: 'Tools & Library (টুলস)',
    chamberOffice: 'Chamber Office (চেম্বার)',
    closeMenu: 'Close Menu',
    openMenu: 'Open Menu',
    switchChamber: 'Switch Chamber',
    backupSettings: 'Chamber Backup & Data',

    mutationCase: 'Mutation Case',
    mutationDesc: 'Sec 50 WBLR Act · নামজারি ও জমা খারিজ',
    miscCase: 'Misc Case',
    miscDesc: '10000 Share · রেকর্ড ও হিস্যা সংশোধন',
    lrAppeal: 'LR Appeal (Sec 54)',
    lrAppealDesc: 'Sec 54 WBLR Act · জেলা সমাহর্তা আপিল',
    firstAppeal: 'First Appeal (প্রথম আপিল)',
    firstAppealDesc: 'Statutory First Appeal · বিধিবদ্ধ ১ম আপিল',
    rtiMatter: 'RTI Matter (তথ্য অধিকার)',
    rtiDesc: 'Right to Information · তথ্য জানার অধিকার',
    lrttTribunal: 'WBLRTT Tribunal',
    lrttDesc: 'Tribunal O.A. · ভূমি ট্রাইব্যুনাল',
    conversionCase: 'Conversion Case',
    conversionDesc: 'Sec 4C WBLR Act · বাস্তু রূপান্তর',

    dailyCauseList: 'Daily Cause List',
    causeListDesc: 'Court & Hearing Board · দৈনিক কার্যতালিকা',
    shareCalc: '10000-Share Calculator',
    shareCalcDesc: 'Hissya & Decimal Math · হিস্যা নির্ণয়',
    aiLegalDrafting: 'AI Drafting Studio',
    aiDraftingDesc: 'Smart Legal Petitions · আইনি খসড়া',
    statutoryWblr: 'WBLR Act 1955 Library',
    statutoryDesc: 'Statutory Sections & Rules · আইন গ্রন্থ',
    clientRegistry: 'Party & Client Registry',
    clientDesc: 'Clients & Opponents · মক্কেল তালিকা',
    documentVault: 'Document Vault',
    vaultDesc: 'Deeds, Parcha, ROR, Orders · নথিপত্র সংগ্রহ',
    caseDiary: 'Daily Case Diary',
    diaryDesc: 'Court Orders & Next Steps · মামলা ডায়েরি',
    clientMessaging: 'Communication Hub',
    messageDesc: 'WhatsApp & SMS Notice · নোটিশ ও মেসেজ',
    advocateTeam: 'Team & Chamber Staff',
    teamDesc: 'Advocates & Permissions · চেম্বার কর্মী',

    searchPlaceholder: 'Search case no, party name, Dag, Mouza, Khatian...',
    newCase: '+ New Case',
    newMutation: '+ New Mutation',
    newMisc: '+ New Misc Case',
    newLrAppeal: '+ New LR Appeal',
    newFirstAppeal: '+ New First Appeal',
    newRti: '+ New RTI Application',
    newConversion: '+ New Conversion',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    viewDetails: 'View Details',
    totalCases: 'Total Cases',
    todaysHearings: "Today's Hearings",
    pendingCases: 'Active Pending',
    disposedCases: 'Disposed / Allowed',
    welcomeBack: 'Welcome back',
    chamberOverview: 'Manage West Bengal Land Reform petitions, monitor limitation periods under Section 54, calculate 10000-share distributions, and print daily cause lists.',
    switchToBengali: 'বাংলায় পরিবর্তন করুন',
    switchToEnglish: 'Switch to English',

    firstAppealMenuTitle: 'FIRST APPEAL MENU (প্রথম আপিল)',
    firstAppealHubTitle: 'Statutory First Appeal Hub',
    firstAppealHubDesc: 'Manage statutory first appeals under Sec 54 & Sec 51A(5) of WBLR Act against Revenue Officer orders, stay petitions, and limitation countdowns.',
    openFirstAppealDashboard: 'Open First Appeal Dashboard',
    fileNewFirstAppeal: 'File New Appeal',
    rtiMenuTitle: 'RTI APPLICATION & APPEAL (তথ্য অধিকার)',
    rtiHubTitle: 'Right to Information (RTI) Cell',
    rtiHubDesc: 'Track RTI petitions u/s 6(1), requisition certified copies of Khatian / Field Inspection Reports from BL&LRO, and file First Appeals u/s 19(1).',
    openRtiDashboard: 'Open RTI Dashboard',
    fileNewRtiQuery: 'New RTI Query',
    landCaseModulesTitle: 'Land Case Modules (মামলার ধরন)',
    clickModuleSubtitle: 'Click module to view dashboard',
    acrossCategoriesDesc: 'Across 7 categories (incl. RTI & Appeals)',
    onCauseListDesc: 'On Daily Cause List',
    inHearingInquiryDesc: 'In hearing / inquiry',
    vaultFilesTitle: 'Vault Files',
    deedsRorDesc: 'Deeds, ROR & Petitions',
    todaysCauseListTitle: "Today's Daily Cause List",
    openFullList: 'Open Full List',
    noHearingsScheduled: 'No hearings scheduled for today on the cause list.',
    upcomingHearingsTitle: 'Upcoming Hearing Dates',
    noUpcomingHearings: 'No upcoming hearing dates recorded.',
    shareCalculatorBtn: 'Share Calculator',
    aiStudioBtn: 'AI Studio',
    tableTime: 'Time',
    tableCaseNo: 'Case No',
    tablePartyForum: 'Party & Forum',
    tableStatus: 'Status',

    viewOptions: 'Viewing Options',
    displayPreferences: 'Display & View Settings',
    themeMode: 'Theme Mode',
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    viewDensity: 'Information Density',
    comfortable: 'Comfortable',
    compact: 'Compact Courtroom',
    readingFontSize: 'Reading Font Size',
    fontStandard: 'Standard (100%)',
    fontLarge: 'Large & Legible (115%)',
    highContrastMode: 'High-Contrast Mode',
    cardGridView: 'Visual Grid View',
    tabularListView: 'Structured Docket List',
    applyPreferences: 'Apply & Save Settings',
    resetDefaults: 'Reset to Defaults',
    mandatorySetupTitle: 'Mandatory Chamber Registration',
    mandatorySetupSubtitle: 'Please register your legal practice / chamber once to initialize your private workspace.'
  },
  bn: {
    appTitle: 'এসআরকে কেস ম্যানেজার',
    dashboard: 'মূল ড্যাশবোর্ড (Dashboard)',
    landCases: 'ভূমি মামলাসমূহ (Land Cases)',
    toolsLibrary: 'আইনি সরঞ্জাম ও লাইব্রেরি (Tools)',
    chamberOffice: 'চেম্বার ও কার্যালয় (Chamber)',
    closeMenu: 'মেনু বন্ধ করুন',
    openMenu: 'মেনু খুলুন',
    switchChamber: 'চেম্বার পরিবর্তন',
    backupSettings: 'চেম্বার ব্যাকআপ ও ডেটা',

    mutationCase: 'মিউটেশন কেস (নামজারি)',
    mutationDesc: 'ধারা ৫০ ডব্লিউবিএলআর অ্যাক্ট · নামজারি ও জমা খারিজ',
    miscCase: 'মিস কেস (রেকর্ড সংশোধন)',
    miscDesc: '১০০০০ হিস্যা · রেকর্ড ও হিস্যা সংশোধন',
    lrAppeal: 'এল.আর. আপিল (ধারা ৫৪)',
    lrAppealDesc: 'ধারা ৫৪ আপিল · জেলা সমাহর্তা/ডিএলঅ্যান্ডএলআরও',
    firstAppeal: 'প্রথম আপিল (First Appeal)',
    firstAppealDesc: 'বিধিবদ্ধ প্রথম আপিল (Statutory First Appeal)',
    rtiMatter: 'তথ্য জানার অধিকার (RTI)',
    rtiDesc: 'তথ্য জানার অধিকার আইন · আবেদন ও আপিল',
    lrttTribunal: 'ভূমি সংস্কার ট্রাইব্যুনাল (WBLRTT)',
    lrttDesc: 'ট্রাইব্যুনাল ও.এ. · সল্টলেক আদালত',
    conversionCase: 'কনভার্সন কেস (শ্রেণি পরিবর্তন)',
    conversionDesc: 'ধারা ৪সি ডব্লিউবিএলআর অ্যাক্ট · বাস্তু রূপান্তর',

    dailyCauseList: 'দৈনিক কার্যতালিকা (Cause List)',
    causeListDesc: 'শুনানি বোর্ড ও দৈনন্দিন তালিকা',
    shareCalc: '১০০০০-হিস্যা ক্যালকুলেটর',
    shareCalcDesc: 'জমির হিস্যা ও শতক হিসাব',
    aiLegalDrafting: 'এআই লিগ্যাল ড্রাফটিং (AI Studio)',
    aiDraftingDesc: 'স্বয়ংক্রিয় আইনি পিটিশন খসড়া',
    statutoryWblr: 'ডব্লিউবিএলআর অ্যাক্ট ১৯৫৫ আইন সংকলন',
    statutoryDesc: 'আইন ধারা ও বিধিমালা',
    clientRegistry: 'মক্কেল ও পক্ষ তালিকা (Party)',
    clientDesc: 'মক্কেল, বিবাদী ও যোগাযোগ',
    documentVault: 'নথিপত্র ভল্ট (Document Vault)',
    vaultDesc: 'দলিল, খতিয়ান, পর্চা ও রায় সংরক্ষণ',
    caseDiary: 'মামলা ডায়েরি (Case Diary)',
    diaryDesc: 'দৈনিক আদেশ ও ভবিষ্যৎ শুনানির তারিখ',
    clientMessaging: 'যোগাযোগ ও মেসেজিং (WhatsApp)',
    messageDesc: 'হোয়াটসঅ্যাপ ও এসএমএস বিজ্ঞপ্তিসমূহ',
    advocateTeam: 'আইনজীবী দল ও কর্মী (Team)',
    teamDesc: 'আইনজীবী ও সহকারীগণের ভূমিকা',

    searchPlaceholder: 'কেস নং, পক্ষ, দাগ নং, মৌজা, খতিয়ান দিয়ে খুঁজুন...',
    newCase: '+ নতুন মামলা',
    newMutation: '+ নতুন মিউটেশন কেস',
    newMisc: '+ নতুন মিস কেস',
    newLrAppeal: '+ নতুন এল.আর. আপিল',
    newFirstAppeal: '+ নতুন প্রথম আপিল',
    newRti: '+ নতুন আরটিআই আবেদন',
    newConversion: '+ নতুন রূপান্তর কেস',
    filter: 'ফিল্টার',
    export: 'রপ্তানি',
    print: 'প্রিন্ট',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    viewDetails: 'বিস্তারিত দেখুন',
    totalCases: 'মোট মামলা',
    todaysHearings: 'আজকের শুনানি',
    pendingCases: 'চলমান মামলা',
    disposedCases: 'নিষ্পত্তি মামলা',
    welcomeBack: 'স্বাগতম',
    chamberOverview: 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন অনুযায়ী পিটিশন পরিচালনা, ধারা ৫৪ তামাদি পর্যবেক্ষণ, ১০০০০-হিস্যা বণ্টন গণনাকারী এবং দৈনিক কার্যতালিকা মুদ্রণ করুন।',
    switchToBengali: 'বাংলা ভাষায় সক্রিয়',
    switchToEnglish: 'Switch to English',

    firstAppealMenuTitle: 'প্রথম আপিল মেনু (FIRST APPEAL MENU)',
    firstAppealHubTitle: 'বিধিবদ্ধ প্রথম আপিল কেন্দ্র (First Appeal Hub)',
    firstAppealHubDesc: 'পশ্চিমবঙ্গ ভূমি সংস্কার আইনের ৫৪ ও ৫১এ(৫) ধারা মতে রেভিনিউ অফিসারের আদেশের বিরুদ্ধে বিধিবদ্ধ ১ম আপিল, স্থগিতাদেশ আবেদন ও ৬০ দিনের তামাদি পর্যবেক্ষণ।',
    openFirstAppealDashboard: 'প্রথম আপিল ড্যাশবোর্ড খুলুন',
    fileNewFirstAppeal: 'নতুন ১ম আপিল দাখিল',
    rtiMenuTitle: 'তথ্য অধিকার সেল (RTI APPLICATION & APPEAL)',
    rtiHubTitle: 'তথ্য জানার অধিকার সেল (RTI Cell)',
    rtiHubDesc: 'তথ্য জানার অধিকার আইন ২০০৫ এর ৬(১) ধারায় বিএলঅ্যান্ডএলআরও দপ্তরে খতিয়ান ও তদন্ত রিপোর্টের জন্য দরখাস্ত এবং ১৯(১) ধারায় ১ম আপিল পর্যবেক্ষণ।',
    openRtiDashboard: 'আরটিআই ড্যাশবোর্ড খুলুন',
    fileNewRtiQuery: 'নতুন আরটিআই আবেদন',
    landCaseModulesTitle: 'ভূমি মামলার প্রধান মেনু ও মডিউল (Land Case Modules)',
    clickModuleSubtitle: 'সংশ্লিষ্ট মডিউল খুলতে ক্লিক করুন',
    acrossCategoriesDesc: '৭টি ক্যাটাগরি (১ম আপিল ও আরটিআই সহ)',
    onCauseListDesc: 'দৈনিক কার্যতালিকায় অন্তর্ভুক্ত',
    inHearingInquiryDesc: 'চলমান শুনানি ও তদন্তাধীন',
    vaultFilesTitle: 'নথিপত্র সংগ্রহ (Vault)',
    deedsRorDesc: 'দলিল, খতিয়ান ও পিটিশন',
    todaysCauseListTitle: 'আজকের দৈনিক কার্যতালিকা (Daily Cause List)',
    openFullList: 'সম্পূর্ণ কার্যতালিকা দেখুন',
    noHearingsScheduled: 'আজকের কার্যতালিকার কোনো শুনানি তালিকাভুক্ত নাই।',
    upcomingHearingsTitle: 'আসন্ন শুনানির তারিখসমূহ',
    noUpcomingHearings: 'কোনো আসন্ন শুনানির তারিখ লিপিবদ্ধ নাই।',
    shareCalculatorBtn: 'হিস্যা ক্যালকুলেটর',
    aiStudioBtn: 'এআই ড্রাফটিং স্টুডিও',
    tableTime: 'সময়',
    tableCaseNo: 'মামলা নং',
    tablePartyForum: 'পক্ষ ও আদালত',
    tableStatus: 'অবস্থা',

    viewOptions: 'ভিউ ও ডিসপ্লে অপশন',
    displayPreferences: 'ডিসপ্লে ও ভিউ মোড সেটিংস',
    themeMode: 'থিম মোড',
    lightTheme: 'লাইট মোড (ক্লাসিক পেপার)',
    darkTheme: 'ডার্ক মোড (কোর্টরুম ডার্ক)',
    viewDensity: 'তথ্য ঘনত্ব',
    comfortable: 'স্বাচ্ছন্দ্যময় ভিউ',
    compact: 'সংক্ষিপ্ত তালিকা ভিউ',
    readingFontSize: 'পড়ার ফন্ট সাইজ',
    fontStandard: 'সাধারণ (১০০%)',
    fontLarge: 'বড় ও স্পষ্ট (১১৫%)',
    highContrastMode: 'উচ্চ বৈসাদৃশ্য (High-Contrast)',
    cardGridView: 'কার্ড গ্রিড ভিউ',
    tabularListView: 'তালিকা ডকেট ভিউ',
    applyPreferences: 'সেটিংস প্রয়োগ ও সংরক্ষণ',
    resetDefaults: 'ডিফল্ট রিসেট',
    mandatorySetupTitle: 'চেম্বার নিবন্ধন বাধ্যতামূলক',
    mandatorySetupSubtitle: 'অ্যাপ ব্যবহারের পূর্বে আপনার আইনজীবী চেম্বার বা ল ফার্ম নিবন্ধন সম্পন্ন করা আবশ্যক।'
  }
};
