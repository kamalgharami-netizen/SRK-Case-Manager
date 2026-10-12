export interface StatutoryProvision {
  id: string;
  category: 'wblract' | 'wblrmanual';
  chapter: string;
  chapterTitle: string;
  section: string;
  title: string;
  textEn: string;
  textBn: string;
  keyPoints?: string[];
  relevance: string;
}

export const statutoryProvisions: StatutoryProvision[] = [
  {
    id: 'wblr-sec-2',
    category: 'wblract',
    chapter: 'preliminary',
    chapterTitle: 'Chapter I - Preliminary',
    section: 'Section 2',
    title: 'Definitions (Bargadar, Raiyat, Ceiling)',
    textEn: '"Bargadar" means a person who cultivates the land of another person on condition of delivering a share of the produce of such land to that person; "Raiyat" means a person or an institution holding land for any purpose whatsoever.',
    textBn: '"বর্গাদার" অর্থ এমন একজন ব্যক্তি যিনি অপর ব্যক্তির জমি চাষ করেন এই শর্তে যে তিনি উৎপাদিত ফসলের একটি অংশ উক্ত ব্যক্তিকে হস্তান্তর করবেন; "রায়ত" অর্থ এমন ব্যক্তি বা প্রতিষ্ঠান যিনি যেকোনো উদ্দেশ্যে জমি ধারণ করেন।',
    keyPoints: [
      'Bargadar status cannot be terminated without statutory proceedings under Section 17/18.',
      'Raiyatee interest is heritable and transferable under Section 4.',
      'Ceiling area limits defined under Section 14M.'
    ],
    relevance: 'Fundamental basis for mutation, tenancy defense, bargadar determination, and ceiling disputes.'
  },
  {
    id: 'wblr-sec-4c',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II - Raiyats',
    section: 'Section 4C',
    title: 'Permission for change of area, character or use of land (Conversion)',
    textEn: 'A raiyat holding any land may apply to the Collector for change of area of character of such land or for conversion of the same for any purpose other than the purpose for which it was settled or was being previously used.',
    textBn: 'কোনো রায়ত জমি ধারণ করলে উক্ত জমির চরিত্র বা এলাকা পরিবর্তন বা যে উদ্দেশ্যে এটি বন্দোবস্ত বা ব্যবহৃত ছিল তা ব্যতীত অন্য উদ্দেশ্যে রূপান্তরের (কনভার্সন) জন্য কালেক্টরের নিকট আবেদন করতে পারেন।',
    keyPoints: [
      'Mandatory prior permission required before changing land use (e.g. Sali/Danga to Bastu/Commercial).',
      'Site verification report from Revenue Inspector / BL&LRO required.',
      'Unlawful conversion invites penal provisions under Section 4D.'
    ],
    relevance: 'Governs all Land Conversion cases (বাস্তু রূপান্তর) before DL&LRO / SDL&LRO.'
  },
  {
    id: 'wblr-sec-50',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA - Preparation and Maintenance of Record-of-Rights',
    section: 'Section 50',
    title: 'Maintenance of the record-of-rights (Mutation by BL&LRO)',
    textEn: 'The Revenue Officer especially empowered by the State Government shall maintain the record-of-rights by correcting the same upon the transfer by succession or transfer inter vivos by sale, gift or mortgage, or by reason of alluvion or diluvion.',
    textBn: 'রাজস্ব আধিকারিক উত্তরাধিকার বা বিক্রয়, দান, বন্ধকের মাধ্যমে হস্তান্তরের প্রেক্ষিতে অথবা সিকস্তি বা পয়স্তির কারণে রেকর্ড-অব-রাইটস সংশোধন করে তা হালনাগাদ রাখবেন।',
    keyPoints: [
      'BL&LRO acts as Revenue Officer under Section 50.',
      'Registration deed does not automatically alter ROR; formal Section 50 mutation petition is statutory requirement.',
      'Notice to all recorded co-sharers or interested parties is mandatory before passing order.'
    ],
    relevance: 'Core statutory basis for all Mutation cases (নামজারি ও জমা খারিজ).'
  },
  {
    id: 'wblr-sec-50a',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA - Preparation and Maintenance of Record-of-Rights',
    section: 'Section 50A',
    title: 'Correction of bona fide clerical mistakes in ROR',
    textEn: 'The Revenue Officer may at any time correct any bona fide clerical mistake or omission in the record-of-rights either of his own motion or upon application.',
    textBn: 'রাজস্ব আধিকারিক স্বপ্রণোদিতভাবে অথবা আবেদনের প্রেক্ষিতে যেকোনো সময় রেকর্ড-অব-রাইটসে ঘটে যাওয়া করণিক বা ছাপাজনিত অনিচ্ছাকৃত ভুল সংশোধন করতে পারেন।',
    keyPoints: [
      'Applies to typographical errors in Khatians, Dag numbers, and names.',
      'Does not require protracted appellate proceedings if error is apparent on the face of the record.'
    ],
    relevance: 'Key section for Misc Cases regarding Name and Khatian corrections.'
  },
  {
    id: 'wblr-sec-51a',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA - Preparation and Maintenance of Record-of-Rights',
    section: 'Section 51A',
    title: 'Draft and Final Publication of ROR & Section 51A(5) Appeal',
    textEn: '(1) The Revenue Officer shall publish a draft of the record-of-rights. (4) The Revenue Officer shall finally publish the record-of-rights. (5) Any person aggrieved by an order passed by a Revenue Officer on any objection filed may appeal within 30 days from the date of such order.',
    textBn: '(১) রাজস্ব আধিকারিক খসড়া রেকর্ড-অব-রাইটস প্রকাশ করবেন। (৪) রাজস্ব আধিকারিক চূড়ান্ত রেকর্ড-অব-রাইটস প্রকাশ করবেন। (৫) কোনো আপত্তির আদেশে ক্ষুব্ধ ব্যক্তি উক্ত আদেশের ৩০ দিনের মধ্যে আপিল করতে পারবেন।',
    keyPoints: [
      'Objections under Section 51A(1) during settlement operation.',
      'Final publication under Section 51A(4) carries legal presumption of correctness under Section 51A(9).',
      'Section 51A(5) Appeal limitation: STRICT 30 DAYS.'
    ],
    relevance: 'Applicable in Settlement appeals and disputed entries during survey operations.'
  },
  {
    id: 'wblr-sec-54',
    category: 'wblract',
    chapter: 'appeal',
    chapterTitle: 'Chapter VIII - Management of Estates & Appeals',
    section: 'Section 54',
    title: 'Appeals against orders of Revenue Officers (To DL&LRO / Tribunal)',
    textEn: '(1) From any order passed by a Revenue Officer or Collector, an appeal shall lie to the Collector of the District or District Land & Land Reforms Officer (DL&LRO) within 60 days from the date of order.',
    textBn: '(১) রাজস্ব আধিকারিক বা কালেক্টরের যেকোনো আদেশের বিরুদ্ধে আদেশের তারিখ থেকে ৬০ দিনের মধ্যে জেলাশাসক বা জেলা ভূমি ও ভূমি সংস্কার আধিকারিকের (ডিএলঅ্যান্ডএলআরও) নিকট আপিল দায়ের করা যাবে।',
    keyPoints: [
      'Statutory Limitation Period: 60 DAYS from the date of impugned order.',
      'If filed after 60 days, must be accompanied by an Application under Section 5 of Limitation Act for Condonation of Delay.',
      'Appeals against DL&LRO appellate orders lie to the West Bengal Land Reforms and Tenancy Tribunal (WBLRTT).'
    ],
    relevance: 'Core appellate provision for LR Appeals (এল.আর. আপিল).'
  },
  {
    id: 'wblr-manual-mutation-rule',
    category: 'wblrmanual',
    chapter: 'mutation',
    chapterTitle: 'WBLR Manual 1991 - Chapter IV (Mutation Rules)',
    section: 'Rule 21-27',
    title: 'Procedure for disposal of Mutation Petitions',
    textEn: 'Petitions for mutation under Section 50 must be verified against field inspection reports, chain of deeds, Waris certificates, and the 10000-share distribution ledger. All co-sharers must receive statutory 15-day notice.',
    textBn: 'ধারা ৫০ এর অধীন মিউটেশনের আবেদনগুলি সরেজমিনে তদন্ত প্রতিবেদন, ধারাবাহিক দলিল (চেন ডিড), ওয়ারিশান সনদ এবং ১০০০০ হিস্যা বণ্টনের লেজারের সাথে মিলিয়ে দেখতে হবে। সকল শরিককে ১৫ দিনের নোটিশ প্রদান বাধ্যতামূলক।',
    keyPoints: [
      'Mandatory field report by Revenue Inspector within 30 days.',
      'Verification of link deeds up to parent RS/LR khatian.',
      'Hearing opportunity to registered purchasers and recorded co-owners.'
    ],
    relevance: 'Official standard of procedure followed by all BL&LRO offices across West Bengal.'
  },
  {
    id: 'wblr-manual-10000-share',
    category: 'wblrmanual',
    chapter: 'shares',
    chapterTitle: 'WBLR Manual 1991 - Chapter V (Record Correction)',
    section: 'Rule 35-39',
    title: 'Correction of 10000 Share Discrepancies in Khatians',
    textEn: 'Where the total sum of co-sharers shares in an undivided Dag/Khatian either falls short of or exceeds 10000 parts (equivalent to 16 Annas in RS nomenclature), a Misc Case shall be initiated for proportional re-allotment.',
    textBn: 'যেখানে কোনো অবিভক্ত দাগ বা খতিয়ানে সহ-শরিকদের মোট হিস্যা ১০০০০ অংশের কম বা বেশি হয় (যা আরএস রেকর্ডে ১৬ আনার সমতুল্য), সেখানে সমানুপাতিক পুনর্বণ্টনের জন্য মিস কেস রুজু করতে হবে।',
    keyPoints: [
      'Total Dag share is always normalized to 10000 parts.',
      'Over-recording or under-recording causes computer block on Banglarbhumi portal.',
      'Resolved via Revenue Officer inquiry and re-apportionment order.'
    ],
    relevance: 'Fundamental rule for 10000 Share Misc Cases.'
  }
];
