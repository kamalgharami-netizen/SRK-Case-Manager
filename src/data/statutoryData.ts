export interface StatutoryDefinition {
  termEn: string;
  definitionEn: string;
  termBn: string;
  definitionBn: string;
}

export interface StatutoryProvision {
  id: string;
  category: 'wblract' | 'wblrmanual';
  chapter: string;
  chapterTitle: string;
  chapterTitleBn: string;
  section: string;
  sectionBn: string;
  title: string;
  titleBn: string;
  amendedNote?: string;
  amendedNoteBn?: string;
  textEn: string;
  textBn: string;
  definitions: StatutoryDefinition[];
  keyPoints: string[];
  keyPointsBn: string[];
  relevance: string;
  relevanceBn: string;
}

export const statutoryProvisions: StatutoryProvision[] = [
  // ============================================================================
  // PART A: WEST BENGAL LAND REFORMS ACT, 1955 (UPDATED WITH AMENDMENTS)
  // ============================================================================

  // CHAPTER I — PRELIMINARY (SECTIONS 1–3A)
  {
    id: 'wblr-sec-1-2',
    category: 'wblract',
    chapter: 'preliminary',
    chapterTitle: 'Chapter I — Preliminary (Sec 1–3A)',
    chapterTitleBn: 'অধ্যায় ১ — প্রারম্ভিক (ধারা ১–৩ক)',
    section: 'Sections 1 & 2',
    sectionBn: 'ধারা ১ ও ২',
    title: 'Short Title, Extent & Updated Definitions (Bargadar, Raiyat, Land, Homestead)',
    titleBn: 'সংক্ষিপ্ত শিরোনাম, প্রয়োগক্ষেত্র ও হালনাগাদ সংজ্ঞা (বর্গাদার, রায়ত, জমি, বাস্তু)',
    amendedNote: 'Updated by WBLR Amendment Acts (expanded definition of "Land" u/s 2(7) & "Bargadar" u/s 2(2))',
    amendedNoteBn: 'সংশোধিত WBLR আইন দ্বারা হালনাগাদ (ধারা ২(৭)-এ "জমি" এবং ধারা ২(২)-এ "বর্গাদার"-এর বর্ধিত সংজ্ঞা)',
    textEn:
      'Extends to the whole of West Bengal (except areas excluded under Kolkata Municipal Corporation Act as specified). Section 2(2): "Bargadar" means a person who cultivates the land of another person on condition of delivering a share of the produce of such land to that person, including lawful heirs u/s 15A. Section 2(7): "Land" means land of every description and includes agricultural land, non-agricultural land, homestead, tank, fishery, tea garden, forest, hat, bazar and structures standing thereon. Section 2(10): "Raiyat" means a person or institution holding land for any purpose whatsoever.',
    textBn:
      'পশ্চিমবঙ্গের সমগ্র রাজ্যে (নির্দিষ্ট কলকাতা পৌর এলাকা ব্যতীত) প্রযোজ্য। ধারা ২(২): "বর্গাদার" অর্থ এমন ব্যক্তি যিনি উৎপাদিত ফসলের অংশ প্রদানের শর্তে অন্যের জমি চাষ করেন (ধারা ১৫ক অনুসারে উত্তরাধিকারীসহ)। ধারা ২(৭): "জমি" বলতে কৃষি, অকৃষি, বাস্তু, পুকুর, মৎস্যচাষ, চা-বাগান, জঙ্গল, হাট-বাজার ও তৎসংলগ্ন কাঠামোসহ সর্বপ্রকার ভূমি বোঝায়। ধারা ২(১০): "রায়ত" অর্থ যেকোনো উদ্দেশ্যে জমি ধারণকারী ব্যক্তি বা প্রতিষ্ঠান।',
    definitions: [
      {
        termEn: 'Bargadar [Sec 2(2)]',
        definitionEn: 'A sharecropper who personally cultivates another landowner\'s agricultural land on condition of sharing the crop produce; does not include a paid agricultural labourer.',
        termBn: 'বর্গাদার [ধারা ২(২)]',
        definitionBn: 'যে ব্যক্তি ফসলের একটি অংশ জমির মালিককে দেওয়ার শর্তে নিজে অন্যের কৃষি জমি চাষ করেন; মজুরির বিনিময়ে কর্মরত কৃষি শ্রমিক নন।'
      },
      {
        termEn: 'Land [Sec 2(7)]',
        definitionEn: 'Expanded definition covering land of every description — agricultural, non-agricultural, bastu (homestead), doba/pukur (tank/waterbody), bheri (fishery), tea garden, and buildings.',
        termBn: 'জমি [ধারা ২(৭)]',
        definitionBn: 'ব্যাপক সংজ্ঞা অনুযায়ী কৃষি, অকৃষি, বাস্তু, পুকুর/ডোবা, মৎস্যভেরি, চা-বাগান এবং জমির উপরিস্থিত কাঠামোসহ সর্বপ্রকার ভূমি।'
      },
      {
        termEn: 'Raiyat [Sec 2(10)]',
        definitionEn: 'The recorded owner/tenant holding land directly under the State of West Bengal for agricultural, residential, commercial, or any other lawful purpose.',
        termBn: 'রায়ত [ধারা ২(১০)]',
        definitionBn: 'পশ্চিমবঙ্গ সরকারের অধীনে সরাসরি কৃষি, বসবাস, বাণিজ্য বা অন্য যেকোনো বৈধ উদ্দেশ্যে জমি ধারণকারী স্বত্বাধিকারী।'
      },
      {
        termEn: 'Homestead [Sec 2(6A)]',
        definitionEn: 'A dwelling house occupied by a raiyat/person together with any courtyard, compound, outhouse, or garden appurtenant thereto.',
        termBn: 'বাস্তু / হোমস্টেড [ধারা ২(৬ক)]',
        definitionBn: 'বসবাসের গৃহ এবং তৎসংলগ্ন উঠান, প্রাঙ্গণ, গোয়াল/আউটহাউস বা সংযুক্ত বাগান।'
      }
    ],
    keyPoints: [
      'Section 2(7) widened "land" to cover non-agricultural plots, homesteads, fisheries, tea gardens, and tanks — removing earlier exemption loopholes.',
      'Section 2(6): "Family" in relation to a raiyat is defined strictly for ceiling computation under Chapter IIB.',
      'Bargadar status cannot be terminated except through formal proceedings under Section 17/18.'
    ],
    keyPointsBn: [
      'ধারা ২(৭)-এর মাধ্যমে অকৃষি জমি, বাস্তু, মৎস্যভেরি, চা-বাগান ও পুকুর সবই আইনের আওতায় আনা হয়েছে।',
      'ধারা ২(৬)-এ অধ্যায় ২খ-এর সিলিং হিসাবের জন্য "পরিবার"-এর নির্দিষ্ট সংজ্ঞা দেওয়া হয়েছে।',
      'ধারা ১৭/১৮-এর আনুষ্ঠানিক আদেশ ব্যতীত কোনো বর্গাদারের অধিকার নষ্ট করা যায় না।'
    ],
    relevance: 'Foundational definitions cited in virtually every BL&LRO, DL&LRO, Civil Court, and WBLRTT proceeding.',
    relevanceBn: 'বিএলঅ্যান্ডএলআরও, ডিএলঅ্যান্ডএলআরও, দেওয়ানি আদালত এবং ডব্লিউবিএলআরটিটি-র প্রায় প্রতিটি মামলায় মৌলিক সূত্র হিসেবে ব্যবহৃত।'
  },
  {
    id: 'wblr-sec-3-3a',
    category: 'wblract',
    chapter: 'preliminary',
    chapterTitle: 'Chapter I — Preliminary (Sec 1–3A)',
    chapterTitleBn: 'অধ্যায় ১ — প্রারম্ভিক (ধারা ১–৩ক)',
    section: 'Sections 3 & 3A',
    sectionBn: 'ধারা ৩ ও ৩ক',
    title: 'Overriding Effect of Act & Vesting of Rights of Non-Agricultural Tenants',
    titleBn: 'আইনের প্রাধান্য ও অকৃষি প্রজার স্বত্ব রাষ্ট্রের অধীনে ন্যস্তকরণ',
    amendedNote: 'Sec 3A substituted by WBLR (Third Amendment) Act, 1986 w.e.f. 09.09.1980',
    amendedNoteBn: 'WBLR (তৃতীয় সংশোধনী) আইন, ১৯৮৬ দ্বারা ০৯.০৯.১৯৮০ থেকে ধারা ৩ক প্রতিস্থাপিত',
    textEn:
      'Section 3: Provisions of this Act shall have effect notwithstanding anything inconsistent therewith in any other law, custom, usage or decree. Section 3A: The rights and interests of all non-agricultural tenants and under-tenants under the West Bengal Non-Agricultural Tenancy Act, 1949 vest in the State free from all encumbrances, and such holders become direct Raiyats under the State subject to Chapter IIB land ceiling limits.',
    textBn:
      'ধারা ৩: অন্য কোনো আইন, প্রথা, রীতি বা আদালতের ডিক্রিতে ভিন্নতর কিছু থাকলেও এই আইনের বিধানাবলি প্রাধান্য পাবে। ধারা ৩ক: পশ্চিমবঙ্গ অকৃষি প্রজাস্বত্ব আইন, ১৯৪৯-এর অধীন সমস্ত অকৃষি প্রজা ও অধীনস্থ প্রজার স্বত্ব সকল দায়মুক্ত অবস্থায় রাষ্ট্রের উপর ন্যস্ত হবে এবং তারা সরাসরি রাষ্ট্রের অধীন রায়তে পরিণত হয়ে অধ্যায় ২খ-এর সিলিং বিধির আওতাভুক্ত হবেন।',
    definitions: [
      {
        termEn: 'Non-Agricultural Tenant',
        definitionEn: 'A tenant who previously held land not for agriculture (such as bastu, shop, mill, or factory) under the 1949 Act before Section 3A merged all into direct Raiyats.',
        termBn: 'অকৃষি প্রজা',
        definitionBn: 'ধারা ৩ক কার্যকর হওয়ার পূর্বে ১৯৪৯ সালের আইনের অধীনে বাস্তু, দোকান বা কারখানার মতো অকৃষি উদ্দেশ্যে জমি ধারণকারী প্রজা।'
      },
      {
        termEn: 'Vesting Free from Encumbrances',
        definitionEn: 'Automatic statutory transfer of intermediate landlord/under-tenant rights to the State, extinguishing prior sub-tenancy layers.',
        termBn: 'দায়মুক্তভাবে ন্যস্ত হওয়া',
        definitionBn: 'মধ্যস্বত্ব বা অধীনস্থ প্রজার পূর্ববর্তী সমস্ত দায় ও স্তর বিলুপ্ত করে সরাসরি রাষ্ট্রের অধীনে স্বত্ব চলে আসা।'
      }
    ],
    keyPoints: [
      'Section 3 grants statutory supremacy to WBLR Act over conflicting laws or customs.',
      'Section 3A brought urban/semi-urban non-agricultural lands under direct raiyati settlement and ceiling restrictions w.e.f. 09.09.1980.',
      'Crucial when tracing old "Dakhalkar" or "Chandina" non-agricultural khatians into modern LR Khatians.'
    ],
    keyPointsBn: [
      'ধারা ৩ অন্যান্য আইনের তুলনায় WBLR আইনকে আইনি প্রাধান্য দেয়।',
      'ধারা ৩ক অনুসারে ০৯.০৯.১৯৮০ থেকে শহর ও আধা-শহরের অকৃষি জমি সরাসরি রায়তি স্বত্বে ও সিলিং সীমার আওতায় আসে।',
      'পুরাতন দখনকার বা চান্দিনা অকৃষি খতিয়ান থেকে এল.আর. খতিয়ানে স্বত্ব মিলিয়ে দেখার জন্য অত্যন্ত গুরুত্বপূর্ণ।'
    ],
    relevance: 'Essential for title chain verification of urban, bastu, and commercial plots converted from non-agricultural tenancies.',
    relevanceBn: 'শহর, বাস্তু ও বাণিজ্যিক প্লটের পূর্বতন অকৃষি প্রজাস্বত্ব থেকে চেইন অব টাইটেল যাচাইয়ে অপরিহার্য।'
  },

  // CHAPTER II — RAIYATS (SECTIONS 4–14)
  {
    id: 'wblr-sec-4-4b',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Sections 4, 4A & 4B',
    sectionBn: 'ধারা ৪, ৪ক ও ৪খ',
    title: 'Rights of Raiyat, Restriction on Sub-Soil Excavation & Preservation of Land',
    titleBn: 'রায়তের অধিকার, ভূগর্ভস্থ খননে নিষেধাজ্ঞা ও জমি সংরক্ষণের দায়িত্ব',
    amendedNote: 'Includes Sec 4(2A) bar on quarrying/brick-earth extraction & Sec 4B preservation mandate',
    amendedNoteBn: 'ধারা ৪(২ক)-এ ইটভাটার মাটি/বালি খননে নিষেধাজ্ঞা ও ধারা ৪খ-এ জমি সংরক্ষণের বিধান সংযুক্ত',
    textEn:
      'Section 4: A raiyat is the owner of his holding, which is heritable and transferable. Under Section 4(2A), no raiyat shall quarry sand or permit digging of earth/clay for bricks/tiles or remove sub-soil minerals without written State permission. Section 4A empowers special restrictions in Darjeeling. Section 4B mandates every raiyat to preserve the land so its area is not diminished or its character altered without Collector permission.',
    textBn:
      'ধারা ৪: রায়ত তার জমির স্বত্বাধিকারী এবং উক্ত জমি উত্তরাধিকারযোগ্য ও হস্তান্তরযোগ্য। ধারা ৪(২ক) অনুসারে সরকারি লিখিত অনুমতি ছাড়া রায়ত বালি উত্তোলন, ইট/টালির জন্য মাটি খনন বা খনিজ পদার্থ আহরণ করতে পারবেন না। ধারা ৪ক দার্জিলিং জেলার বিশেষ বিধি নির্ধারণ করে। ধারা ৪খ অনুযায়ী প্রত্যেক রায়তকে কালেক্টরের অনুমতি ব্যতীত জমির ক্ষেত্রফল বা চরিত্র নষ্ট না করে তা সংরক্ষণ করতে হবে।',
    definitions: [
      {
        termEn: 'Heritable & Transferable Holding',
        definitionEn: 'A raiyat\'s holding passes to legal heirs upon death and can be sold, gifted, exchanged, or leased subject to statutory rules.',
        termBn: 'উত্তরাধিকারযোগ্য ও হস্তান্তরযোগ্য জোত',
        definitionBn: 'রায়তের মৃত্যুর পর তার ওয়ারিশদের নিকট স্বত্ব বর্তায় এবং আইনি শর্ত সাপেক্ষে বিক্রয়, দান বা বিনিময় করা যায়।'
      },
      {
        termEn: 'Sub-Soil / Minor Minerals [Sec 4(2A)]',
        definitionEn: 'Underground minerals, river/ordinary sand, clay, and brick-earth whose extraction requires prior Government/DM mining permission.',
        termBn: 'ভূগর্ভস্থ খনিজ / অপ্রধান খনিজ [ধারা ৪(২ক)]',
        definitionBn: 'মাটির নিচের খনিজ, বালি ও ইট তৈরির মাটি, যা উত্তোলনের জন্য সরকারের পূর্বানুমতি বাধ্যতামূলক।'
      },
      {
        termEn: 'Land Character Preservation [Sec 4B]',
        definitionEn: 'Statutory duty not to degrade agricultural plots, cut embankments, or fill ponds/waterbodies without Collector clearance.',
        termBn: 'জমির চরিত্র সংরক্ষণ [ধারা ৪খ]',
        definitionBn: 'কালেক্টরের অনুমতি ছাড়া কৃষি জমির শ্রেণি নষ্ট না করা বা পুকুর/জলাশয় ভরাট না করার আইনগত বাধ্যবাধকতা।'
      }
    ],
    keyPoints: [
      'Section 4(4) prescribes forfeiture/action if holding is diverted contrary to statutory conditions.',
      'Unauthorized pond digging or earth-cutting attracts action under Section 4(2A) & WB Minor Minerals Rules.',
      'Section 4B is the primary statutory mandate against unauthorized land degradation and wetland filling.'
    ],
    keyPointsBn: [
      'আইনবিরুদ্ধভাবে জমির ব্যবহার পরিবর্তন করলে ধারা ৪(৪) অনুযায়ী ব্যবস্থা নেওয়া যায়।',
      'অনুমতিহীন মাটি বা বালি কাটা ধারা ৪(২ক) এবং মাইনর মিনারেলস বিধিমালার অধীন দণ্ডনীয়।',
      'ধারা ৪খ কৃষি জমি ও জলাশয় ভরাট রোধের প্রধান আইনি রক্ষাকবচ।'
    ],
    relevance: 'Used in brickfield/earth-cutting disputes, Darjeeling special tenancies, and waterbody preservation cases.',
    relevanceBn: 'ইটভাটার মাটি খনন বিরোধ, দার্জিলিং বিশেষ প্রজাস্বত্ব ও জলাশয় রক্ষার মামলায় ব্যবহৃত।'
  },
  {
    id: 'wblr-sec-4c',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Section 4C',
    sectionBn: 'ধারা ৪গ (4C)',
    title: 'Permission for Change of Area, Character or Use of Land (Conversion)',
    titleBn: 'জমির এলাকা, প্রকৃতি বা ব্যবহার পরিবর্তনের (কনভার্সন/রূপান্তর) অনুমতি',
    amendedNote: 'Updated with Sec 4C(4A), Sec 4C(5) post-facto regularisation & Banglarbhumi online norms',
    amendedNoteBn: 'ধারা ৪গ(৪ক), ধারা ৪গ(৫) পরবর্তী বৈধকরণ (পোস্ট-ফ্যাক্টো) এবং বাংলার ভূমি অনলাইন বিধি সংযুক্ত',
    textEn:
      'A raiyat holding any land may apply to the Collector (DL&LRO / SDL&LRO / empowered BL&LRO) for permission to change the area, character or use of such land (e.g., Sali/Danga to Bastu/Commercial/Industrial). After inquiry ensuring no prejudice to public convenience, environment, agriculture, or wetlands, the Collector may grant permission subject to conversion fees and compensatory waterbody creation where applicable.',
    textBn:
      'কোনো রায়ত তার জমির এলাকা, প্রকৃতি বা ব্যবহার পরিবর্তনের (যেমন শালি/ডাঙা থেকে বাস্তু/বাণিজ্যিক/শিল্প) জন্য কালেক্টরের নিকট আবেদন করতে পারেন। কালেক্টর সরেজমিন তদন্ত করে জনস্বার্থ, পরিবেশ, কৃষি ও জলাশয় সংরক্ষণের দিক বিবেচনা করে নির্ধারিত ফি ও প্রযোজ্য ক্ষেত্রে বিকল্প জলাশয় তৈরির শর্তে অনুমতি প্রদান করতে পারবেন।',
    definitions: [
      {
        termEn: 'Conversion (Change of Classification)',
        definitionEn: 'Formal legal alteration of recorded plot nature in Khatian (e.g., Sali, Suno, Danga, Bagan) into Bastu (residential), Commercial, or Industrial use.',
        termBn: 'শ্রেণি রূপান্তর (কনভার্সন)',
        definitionBn: 'খতিয়ানে নথিভুক্ত জমির শ্রেণি (যেমন শালি, সুনা, ডাঙা, বাগান) আনুষ্ঠানিকভাবে বাস্তু, বাণিজ্যিক বা শিল্প শ্রেণিতে পরিবর্তন।'
      },
      {
        termEn: 'Compensatory Waterbody [Sec 4C Proviso]',
        definitionEn: 'Where conversion of a tank/waterbody larger than prescribed limit is strictly permitted for public/essential purpose, an equal/larger waterbody must be excavated elsewhere.',
        termBn: 'বিকল্প জলাশয় সৃষ্টি',
        definitionBn: 'জনস্বার্থে কোনো জলাশয় রূপান্তরের বিশেষ অনুমতি দেওয়া হলে সমপরিমাণ বা তার চেয়ে বড় বিকল্প জলাশয় খননের বাধ্যতামূলক শর্ত।'
      },
      {
        termEn: 'Post-Facto Regularisation [Sec 4C(5)]',
        definitionEn: 'Discretionary power of Collector to regularise an already-changed non-waterbody plot upon payment of higher compounding fee/penalty.',
        termBn: 'পরবর্তী বৈধকরণ [ধারা ৪গ(৫)]',
        definitionBn: 'জলাশয় ব্যতীত পূর্বে রূপান্তরিত জমির ক্ষেত্রে অতিরিক্ত ফি/জরিমানা আদায় সাপেক্ষে কালেক্টর কর্তৃক রূপান্তর নিয়মিত করার ক্ষমতা।'
      }
    ],
    keyPoints: [
      'Mandatory prior permission required before changing recorded classification from agricultural/doba to bastu/karkhana.',
      'Section 4C(5) enables post-facto regularisation in eligible cases upon payment of compounding fees.',
      'Requires RI spot enquiry report, surrounding plot clearance, and strict non-obstruction of drainage.'
    ],
    keyPointsBn: [
      'শালি/ডাঙা/ডোবা জমি বাস্তু বা কারখানায় রূপান্তরের পূর্বে অবশ্যই ধারা ৪গ অনুযায়ী অনুমতি নিতে হবে।',
      'যোগ্য ক্ষেত্রে ধারা ৪গ(৫) অনুযায়ী অতিরিক্ত ফি জমা দিয়ে পরবর্তী বৈধকরণ সম্ভব।',
      'আর.আই.-এর সরেজমিন তদন্ত ও পার্শ্ববর্তী জমির নিকাশি ব্যবস্থা অব্যাহত রাখার শর্ত যাচাই করা হয়।'
    ],
    relevance: 'Governs all Land Conversion (বাস্তু রূপান্তর) cases before BL&LRO / SDL&LRO / DL&LRO.',
    relevanceBn: 'বিএলঅ্যান্ডএলআরও, এসডিএলঅ্যান্ডএলআরও ও ডিএলঅ্যান্ডএলআরও-র সমক্ষে সমস্ত শ্রেণি রূপান্তর মামলার মূল ধারা।'
  },
  {
    id: 'wblr-sec-4d-4e',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Sections 4D & 4E',
    sectionBn: 'ধারা ৪ঘ ও ৪ঙ',
    title: 'Penalties for Unauthorized Conversion & Bar to Registration of Prohibited Deeds',
    titleBn: 'অনুমতিহীন শ্রেণি পরিবর্তনের শাস্তি ও নিষিদ্ধ দলিল রেজিস্ট্রেশনে বাধা',
    amendedNote: 'Sec 4D amended to strengthen prosecution & fine/imprisonment up to 3 years',
    amendedNoteBn: 'ধারা ৪ঘ সংশোধনের মাধ্যমে সর্বোচ্চ ৩ বছর কারাদণ্ড ও জরিমানার শাস্তি কঠোর করা হয়েছে',
    textEn:
      'Section 4D: Any change in area, character or use of land or filling of waterbody in contravention of Section 4C constitutes a cognizable and non-bailable offence punishable with imprisonment up to 3 years or fine up to ₹50,000 (or both), besides compulsory restoration. Section 4E bars registration of deeds purporting to transfer land in violation of specified urban/conversion conditions.',
    textBn:
      'ধারা ৪ঘ: ধারা ৪গ লঙ্ঘন করে অনুমতি ছাড়া জমির চরিত্র পরিবর্তন বা জলাশয় ভরাট করলে তা একটি আমলযোগ্য ও অজামিনযোগ্য অপরাধ, যার শাস্তি সর্বোচ্চ ৩ বছর কারাদণ্ড অথবা ৫০,০০০ টাকা পর্যন্ত জরিমানা (বা উভয়ই) এবং জমি পূর্বাবস্থায় ফেরানোর নির্দেশ। ধারা ৪ঙ আইনবহির্ভূত হস্তান্তর দলিল রেজিস্ট্রেশনে নিষেধাজ্ঞা আরোপ করে।',
    definitions: [
      {
        termEn: 'Cognizable & Non-Bailable Offence',
        definitionEn: 'An offence under Sec 4D where police can register an FIR and investigate without prior Magistrate warrant, and bail is at judicial discretion.',
        termBn: 'আমলযোগ্য ও অজামিনযোগ্য অপরাধ',
        definitionBn: 'এমন অপরাধ যেখানে পুলিশ আদালতের ওয়ারেন্ট ছাড়াই এফআইআর রুজু করে তদন্ত করতে পারে এবং জামিন আদালতের বিবেচনাধীন।'
      },
      {
        termEn: 'Restoration Order [Sec 4C(4)/4D]',
        definitionEn: 'Direction by Collector compelling the offender to remove illegal earth-fill/structures and restore the plot or waterbody to original condition.',
        termBn: 'পূর্বাবস্থায় ফেরানোর আদেশ',
        definitionBn: 'অবৈধ মাটি ভরাট বা নির্মাণ অপসারণ করে জমি বা জলাশয়কে আগের অবস্থায় ফিরিয়ে আনার কালেক্টরের নির্দেশ।'
      }
    ],
    keyPoints: [
      'BL&LRO/Collector can lodge Police FIR and issue restoration notice under Section 4D.',
      'Section 4D prosecution is a frequent hurdle when unpermitted filling of Doba/Pukur/Sali land is reported.',
      'May be closed/compounded in eligible non-waterbody cases if Section 4C(5) post-facto permission is granted.'
    ],
    keyPointsBn: [
      'বিএলঅ্যান্ডএলআরও বা কালেক্টর অবৈধ ভরাটের বিরুদ্ধে ধারা ৪ঘ অনুযায়ী থানায় এফআইআর ও পুনরুদ্ধার নোটিশ জারি করতে পারেন।',
      'ডোবা, পুকুর বা শালি জমি বিনা অনুমতিতে ভরাট করলে ধারা ৪ঘ মামলা হয়।',
      'জলাশয় না হলে ধারা ৪গ(৫)-এ পরবর্তী বৈধকরণের মাধ্যমে মামলা নিষ্পত্তি হতে পারে।'
    ],
    relevance: 'Crucial defense and prosecution provision in illegal pond-filling and unauthorized construction FIRs.',
    relevanceBn: 'অবৈধ পুকুর ভরাট, বেআইনি নির্মাণ ও ধারা ৪ঘ ফৌজদারি মামলার ক্ষেত্রে অপরিহার্য।'
  },
  {
    id: 'wblr-sec-5-6-7',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Sections 5, 6 & 7',
    sectionBn: 'ধারা ৫, ৬ ও ৭',
    title: 'Transferability of Raiyati Land, LT Notice & Limitation on Mortgages',
    titleBn: 'রায়তি জমি হস্তান্তর, এল.টি. নোটিশ ও বন্ধকের সময়সীমা',
    textEn:
      'Section 5: Transfer of a raiyat\'s holding (or share thereof) shall be made ONLY by a registered instrument, accompanied by prescribed notices (LT Notice) and process fee for service on co-sharers and the Revenue Officer. Section 6 preserves Scheduled Tribe restrictions under Chapter IIA. Section 7 restricts usufructuary/anomalous mortgages by a raiyat to a maximum period of 7 years (automatically redeemed after 7 years) or permitted bank mortgages.',
    textBn:
      'ধারা ৫: রায়তের জমির হস্তান্তর কেবলমাত্র রেজিস্ট্রিকৃত দলিলের মাধ্যমে করতে হবে এবং সহ-শরিক ও রাজস্ব আধিকারিকের নিকট প্রেরণের জন্য নির্ধারিত এল.টি. নোটিশ ও প্রসেস ফি জমা দিতে হবে। ধারা ৬ তফসিলি উপজাতির জমি হস্তান্তর সীমাবদ্ধতা অক্ষুণ্ণ রাখে। ধারা ৭ রায়তি জমির ভোগদখলী বন্ধককে সর্বোচ্চ ৭ বছর পর্যন্ত সীমাবদ্ধ করে (৭ বছর পর স্বয়ংক্রিয়ভাবে দায়মুক্ত)।',
    definitions: [
      {
        termEn: 'LT Notice [Sec 5(4)-(5)]',
        definitionEn: 'Statutory Notice of Transfer filled at Sub-Registry office during deed registration and transmitted to BL&LRO and non-transferring co-sharers.',
        termBn: 'এল.টি. নোটিশ (হস্তান্তরের নোটিশ)',
        definitionBn: 'দলিল রেজিস্ট্রির সময় সাব-রেজিস্ট্রি অফিসে পূরণকৃত বিধিবদ্ধ নোটিশ, যা বিএলঅ্যান্ডএলআরও ও অপর সহ-শরিকদের নিকট পাঠানো হয়।'
      },
      {
        termEn: 'Usufructuary Mortgage Limit [Sec 7]',
        definitionEn: 'A mortgage where creditor takes possession and enjoys produce/usufruct; statutorily limited to max 7 years for a raiyat, after which debt stands extinguished.',
        termBn: 'ভোগদখলী বন্ধকের ৭ বছরের সীমা [ধারা ৭]',
        definitionBn: 'যে বন্ধকে মহাজন জমির দখল নিয়ে ফসল ভোগ করেন, রায়তের ক্ষেত্রে তা সর্বোচ্চ ৭ বছর স্থায়ী হতে পারে — তারপর জমি দায়মুক্ত হয়ে ফেরত আসে।'
      }
    ],
    keyPoints: [
      'Service of Section 5(5) notice triggers the 3-month limitation clock for co-sharer Pre-emption under Section 8.',
      'Registered deed without mutation does not alter ROR; LT Notice initiates e-Mutation docket on Banglarbhumi.',
      'Private mortgages exceeding 7 years under Section 7 stand statutorily redeemed on completion of 7 years.'
    ],
    keyPointsBn: [
      'ধারা ৫(৫) অনুযায়ী এল.টি. নোটিশ জারির তারিখ থেকেই সহ-শরিকের প্রি-এম্পশনের ৩ মাসের তামাদি শুরু হয়।',
      'দলিল রেজিস্ট্রি হলেই খতিয়ান বদলায় না; ধারা ৫০ মিউটেশনের মাধ্যমে এল.টি. নোটিশ অনুসারে রেকর্ড সংশোধন হয়।',
      '৭ বছরের বেশি মেয়াদের ব্যক্তিগত ভোগদখলী বন্ধক আইনত স্বয়ংক্রিয়ভাবে খলাস বলে গণ্য হয়।'
    ],
    relevance: 'Key check for deed validity, LT Notice defects in pre-emption cases, and mortgage redemption.',
    relevanceBn: 'দলিলের বৈধতা, প্রি-এম্পশন মামলার এল.টি. নোটিশ ও বন্ধক মুক্তির ক্ষেত্রে অত্যন্ত গুরুত্বপূর্ণ।'
  },
  {
    id: 'wblr-sec-8-9-10',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Sections 8, 9 & 10',
    sectionBn: 'ধারা ৮, ৯ ও ১০',
    title: 'Right of Pre-emption (Co-Sharer / Contiguous Tenant) & Judicial Procedure',
    titleBn: 'অগ্রক্রয়াধিকার বা প্রি-এম্পশন (সহ-শরিক / সংলগ্ন জমির মালিক) ও বিচার প্রক্রিয়া',
    amendedNote: 'Amended in 2000 & interpreted by Supreme Court in Barasat Eye Hospital (2021)',
    amendedNoteBn: '২০০০ সালের সংশোধনী ও সুপ্রিম কোর্টের বারাসাত আই হসপিটাল (২০২১) রায় অনুসারে পরিমার্জিত',
    textEn:
      'Section 8: When a portion or share of a plot of land of a raiyat is transferred to a stranger (non-co-sharer), a bargadar (within 3 months), a co-sharer raiyat (within 3 months of notice u/s 5(5)), or a contiguous raiyat with longest common boundary (within 4 months of transfer) may apply to the Munsif (Civil Judge Jr. Div.) for transfer of that land to himself, depositing the ENTIRE consideration money stated in the deed plus 10% compensation. Section 9 governs adjudication of actual price; Section 10 vests title free of post-transfer encumbrances.',
    textBn:
      'ধারা ৮: কোনো রায়তের দাগের অংশ বা ভাগ সহ-শরিক ব্যতীত অন্য ব্যক্তির নিকট হস্তান্তরিত হলে বর্গাদার (৩ মাসের মধ্যে), সহ-শরিক রায়ত (ধারা ৫(৫) নোটিশের ৩ মাসের মধ্যে) অথবা সংলগ্ন দীর্ঘতম সীমানাধারী রায়ত (হস্তান্তরের ৪ মাসের মধ্যে) দলিলে উল্লিখিত সম্পূর্ণ পণমূল্য ও অতিরিক্ত ১০% ক্ষতিপূরণ জমা দিয়ে সিভিল জজ (জুনিয়র ডিভিশন) আদালতে প্রি-এম্পশনের আবেদন করতে পারবেন। ধারা ৯ প্রকৃত মূল্য যাচাই ও ধারা ১০ চূড়ান্ত স্বত্ব হস্তান্তরের ফলাফল নির্ধারণ করে।',
    definitions: [
      {
        termEn: 'Pre-emption (Akrakrayadhikar)',
        definitionEn: 'Statutory preferential right of a co-sharer, bargadar, or contiguous plot owner to step into the shoes of an outsider buyer by paying full deed price + 10%.',
        termBn: 'অগ্রক্রয়াধিকার (প্রি-এম্পশন)',
        definitionBn: 'বহিরাগত ক্রেতার বদলে দলিলের সম্পূর্ণ দাম ও অতিরিক্ত ১০% জমা দিয়ে সহ-শরিক, বর্গাদার বা লাগোয়া জমির মালিকের জমিটি কেনার অগ্রাধিকার।'
      },
      {
        termEn: 'Co-Sharer Raiyat vs Contiguous Raiyat',
        definitionEn: 'Co-sharer holds an undivided share in the same plot; Contiguous raiyat holds an adjoining plot sharing the longest common boundary.',
        termBn: 'সহ-শরিক রায়ত বনাম সংলগ্ন রায়ত',
        definitionBn: 'সহ-শরিক হলেন একই দাগে অবিভক্ত অংশীদার; সংলগ্ন রায়ত হলেন পাশের দাগের দীর্ঘতম সাধারণ সীমানাধারী মালিক।'
      },
      {
        termEn: 'Mandatory Full Deposit [Sec 8(1) & 9]',
        definitionEn: 'Condition precedent holding that the entire stated consideration + 10% must be deposited along with the application (short deposit causes dismissal).',
        termBn: 'সম্পূর্ণ অর্থ ও ১০% জমা বাধ্যতামূলক',
        definitionBn: 'সুপ্রিম কোর্টের বিধান অনুযায়ী আবেদন দাখিলের সময়ই দলিলে লেখা পুরো দাম + ১০% আদালতে জমা দিতে হবে, নচেৎ মামলা খারিজ হয়।'
      }
    ],
    keyPoints: [
      'Supreme Court rule (Barasat Eye Hospital): Entire deed consideration + 10% MUST be deposited at filing — short deposit cannot be cured later.',
      'No pre-emption lies if the transferor transfers his ENTIRE holding/share (applicable only to partial/portion transfers).',
      'Co-sharer limitation: 3 months from Sec 5(5) notice (or 1 year under Art 97 Limitation Act if unnotified); Contiguous owner: strictly 4 months from registration completion u/s 61 Registration Act.'
    ],
    keyPointsBn: [
      'দলিলে উল্লিখিত সম্পূর্ণ পণমূল্য এবং তার ১০% আবেদনের সাথেই জমা দেওয়া বাধ্যতামূলক — কম টাকা জমা দিলে মামলা টেকে না।',
      'বিক্রেতা তার দাগের সম্পূর্ণ অংশ বিক্রি করে দিলে প্রি-এম্পশন মামলা চলে না (শুধুমাত্র অংশ বিক্রয়ে প্রযোজ্য)।',
      'সংলগ্ন মালিকের জন্য রেজিস্ট্রি সম্পূর্ণ হওয়ার ৪ মাস এবং নোটিশপ্রাপ্ত সহ-শরিকের জন্য ৩ মাস তামাদি নির্ধারিত।'
    ],
    relevance: 'Governs all Pre-emption (অগ্রক্রয়াধিকার / Sec 8 WBLR) Misc Cases in Civil Courts.',
    relevanceBn: 'দেওয়ানি আদালতের সমস্ত প্রি-এম্পশন (ধারা ৮) মিস কেস পরিচালনার মূল বিধান।'
  },
  {
    id: 'wblr-sec-11-12-14',
    category: 'wblract',
    chapter: 'raiyats',
    chapterTitle: 'Chapter II — Raiyats (Sec 4–14)',
    chapterTitleBn: 'অধ্যায় ২ — রায়ত (ধারা ৪–১৪)',
    section: 'Sections 11, 12 & 14',
    sectionBn: 'ধারা ১১, ১২ ও ১৪',
    title: 'Diluvion Abatement, Alluvion Accretion & Partition of Holding Among Co-Sharers',
    titleBn: 'নদীভাঙনে (সিকস্তি) খাজনা হ্রাস, পয়স্তি জমি ও সহ-শরিকদের মধ্যে বণ্টন (ধারা ১৪)',
    textEn:
      'Section 11 provides proportionate abatement of land revenue if land is lost by diluvion (সিকস্তি). Section 12 vests land gained by gradual recess of river/alluvion (পয়স্তি) in the raiyat within ceiling limits. Section 14 stipulates that partition of a holding among co-sharer raiyats shall be made ONLY by a registered instrument (Partition Deed / বণ্টননামা) or by a Civil Court decree — oral or unregistered mutual partition ("Aposh-nama") cannot alter ROR shares u/s 50.',
    textBn:
      'ধারা ১১ নদীভাঙন (সিকস্তি) জনিত জমি হারানোর ক্ষেত্রে আনুপাতিক খাজনা হ্রাসের বিধান দেয়। ধারা ১২ পলি জমে (পয়স্তি) জেগে ওঠা জমির স্বত্ব সিলিং সীমার মধ্যে নির্ধারণ করে। ধারা ১৪ অনুযায়ী সহ-শরিক রায়তদের মধ্যে জমি বণ্টন কেবলমাত্র রেজিস্ট্রিকৃত বণ্টননামা দলিল অথবা সিভিল কোর্টের ডিক্রির মাধ্যমেই বৈধ হবে — মৌখিক বা অনিবন্ধিত আপোষ-বণ্টনে খতিয়ান ভাগ হয় না।',
    definitions: [
      {
        termEn: 'Diluvion (Sikasti) vs Alluvion (Payasti)',
        definitionEn: 'Diluvion is submergence/erosion of land by river change (entitling Khajna abatement u/s 11); Alluvion is new land formed by river silt recession (Sec 12).',
        termBn: 'সিকস্তি বনাম পয়স্তি',
        definitionBn: 'নদীভাঙনে জমি তলিয়ে গেলে তাকে সিকস্তি (ধারা ১১-এ খাজনা হ্রাস) এবং পলি জমে চর জেগে উঠলে তাকে পয়স্তি (ধারা ১২) বলে।'
      },
      {
        termEn: 'Statutory Partition [Sec 14]',
        definitionEn: 'Division of undivided joint shares among co-owners; legally valid ONLY via a Registered Partition Deed (Bantannama) or Final Partition Decree of Civil Court.',
        termBn: 'বিধিবদ্ধ বণ্টন [ধারা ১৪]',
        definitionBn: 'অবিভক্ত যৌথ সম্পত্তি শরিকদের মধ্যে ভাগ করার একমাত্র বৈধ পদ্ধতি হলো রেজিস্ট্রিকৃত বণ্টননামা দলিল বা দেওয়ানি আদালতের চূড়ান্ত ডিক্রি।'
      }
    ],
    keyPoints: [
      'Unregistered "Aposh-nama" or stamp-paper partition CANNOT be mutated u/s 50 due to Section 14.',
      'Boundary demarcation of specific portions in an undivided plot is refused by BL&LRO unless partitioned u/s 14.',
      'Section 14(2) empowers Revenue Officer to apportion revenue equitably upon registered partition.'
    ],
    keyPointsBn: [
      'ধারা ১৪-এর বাধার কারণে অনিবন্ধিত বা স্ট্যাম্প-পেপারের আপোষ-বণ্টননামা দিয়ে বিএলঅ্যান্ডএলআরও মিউটেশন করা যায় না।',
      'অবিভক্ত দাগে রেজিস্ট্রিকৃত বণ্টননামা বা আদালতের ডিক্রি ছাড়া নির্দিষ্ট অংশ পৃথক করে রেকর্ড করা যায় না।',
      'বৈধ বণ্টনের পর ধারা ১৪(২) অনুসারে রাজস্ব আধিকারিক আনুপাতিক খাজনা ভাগ করে দেন।'
    ],
    relevance: 'Frequently cited when BL&LRO rejects unregistered family partition claims in Mutation/Misc Cases.',
    relevanceBn: 'পারিবারিক অনিবন্ধিত বণ্টননামার ভিত্তিতে মিউটেশন বাতিল বা বণ্টন মামলায় প্রায়ই ব্যবহৃত।'
  },

  // CHAPTER IIA — SCHEDULED TRIBES (SECTIONS 14A–14I)
  {
    id: 'wblr-sec-14a-14i',
    category: 'wblract',
    chapter: 'tribal',
    chapterTitle: 'Chapter IIA — Restrictions on Alienation of Tribal Land (Sec 14A–14I)',
    chapterTitleBn: 'অধ্যায় ২ক — তফসিলি উপজাতির জমি হস্তান্তরে বিধিনিষেধ (ধারা ১৪ক–১৪ঝ)',
    section: 'Sections 14A to 14I',
    sectionBn: 'ধারা ১৪ক থেকে ১৪ঝ',
    title: 'Prohibition on Transfer of Scheduled Tribe Land, Collector Permission & Restoration',
    titleBn: 'তফসিলি উপজাতির জমি হস্তান্তরে নিষেধাজ্ঞা, কালেক্টরের অনুমতি ও জমি পুনরুদ্ধার',
    amendedNote: 'Mandatory Collector (DL&LRO/SDO) prior written permission for ST-to-Non-ST transfer',
    amendedNoteBn: 'উপজাতি থেকে অ-উপজাতি ব্যক্তির নিকট জমি হস্তান্তরে কালেক্টরের পূর্বলিখিত অনুমতি বাধ্যতামূলক',
    textEn:
      'Sections 14A & 14B: Chapter IIA overrides all other laws; any transfer of a holding or share by a Scheduled Tribe raiyat is VOID unless complying with Section 14C. Section 14C allows transfer only (a) to another Scheduled Tribe member, or (b) to a non-ST person ONLY with previous written permission of the Revenue Officer/Collector for bona fide necessity at fair market value. Sections 14E & 14F empower restoration of illegal transfers to the ST raiyat and bar Civil Court attachment/sale in decree execution.',
    textBn:
      'ধারা ১৪ক ও ১৪খ: এই অধ্যায়ের বিধান অন্য সকল আইনের উপর প্রাধান্য পাবে; তফসিলি উপজাতিভুক্ত রায়তের জমি হস্তান্তর ধারা ১৪গ অনুসারে না হলে তা সম্পূর্ণ বাতিল। ধারা ১৪গ অনুযায়ী উপজাতি রায়ত কেবল অন্য উপজাতি ব্যক্তিকে অথবা ন্যায্য মূল্যে প্রকৃত প্রয়োজনে কালেক্টরের পূর্বলিখিত অনুমতি সাপেক্ষে অ-উপজাতি ব্যক্তিকে জমি হস্তান্তর করতে পারেন। ধারা ১৪ঙ ও ১৪চ অবৈধ হস্তান্তর বাতিল করে দখল পুনরুদ্ধার এবং দেওয়ানি আদালতের নিলাম/ক্রোক নিষিদ্ধ করে।',
    definitions: [
      {
        termEn: 'Scheduled Tribe (ST) Raiyat',
        definitionEn: 'A landowner belonging to notified Scheduled Tribes (e.g., Santhal, Oraon, Munda, Bhumij, Lodha, etc.) whose caste/tribe status enjoys Chapter IIA statutory protection.',
        termBn: 'তফসিলি উপজাতি (ST) রায়ত',
        definitionBn: 'সংবিধান স্বীকৃত তফসিলি উপজাতিভুক্ত (যেমন সাঁওতাল, ওরাওঁ, মুণ্ডা, ভূমিজ ইত্যাদি) জমির মালিক, যার জমি অধ্যায় ২ক দ্বারা সুরক্ষিত।'
      },
      {
        termEn: 'Void Transfer & Restoration [Sec 14E]',
        definitionEn: 'A transfer made without prior Sec 14C permission conveys ZERO title; Revenue Officer can suo motu or on petition evict the buyer and restore land to the ST family.',
        termBn: 'বাতিল হস্তান্তর ও পুনরুদ্ধার [ধারা ১৪ঙ]',
        definitionBn: 'ধারা ১৪গ-এর পূর্বানুমতি ছাড়া হস্তান্তরকৃত দলিলে ক্রেতার কোনো স্বত্ব জন্মায় না; রাজস্ব আধিকারিক জমি পুনরুদ্ধার করে উপজাতি পরিবারকে ফিরিয়ে দেবেন।'
      }
    ],
    keyPoints: [
      'Mutation of a deed executed by an ST vendor to a non-ST buyer MUST be refused without prior Sec 14C order.',
      'Even decades of possession/adverse possession cannot validate a void ST transfer against Section 14E.',
      'Appeal against Section 14C/14E order lies within 30 days under Section 14H.'
    ],
    keyPointsBn: [
      'ধারা ১৪গ-এর পূর্বানুমতি না থাকলে উপজাতি বিক্রেতার দলিলের মিউটেশন অবশ্যই বাতিল করতে হবে।',
      'দীর্ঘদিনের দখল বা তামাদি (Adverse Possession) ধারা ১৪ঙ-এর অধীন উপজাতি জমি পুনরুদ্ধারে বাধা হতে পারে না।',
      'ধারা ১৪জ অনুসারে ১৪গ/১৪ঙ আদেশের বিরুদ্ধে ৩০ দিনের মধ্যে আপিল করা যায়।'
    ],
    relevance: 'Critical check during Chain of Title drafting and Mutation of tribal-recorded Khatians.',
    relevanceBn: 'আদিবাসী/উপজাতি রেকর্ডভুক্ত খতিয়ানের চেইন অব টাইটেল ও মিউটেশন যাচাইয়ে অপরিহার্য।'
  },

  // CHAPTER IIB — CEILING ON HOLDINGS (SECTIONS 14J–14Z)
  {
    id: 'wblr-sec-14j-14m',
    category: 'wblract',
    chapter: 'ceiling',
    chapterTitle: 'Chapter IIB — Ceiling on Holdings (Sec 14J–14Z)',
    chapterTitleBn: 'অধ্যায় ২খ — জমির সিলিং বা ঊর্ধ্বসীমা (ধারা ১৪ঞ–১৪য়)',
    section: 'Sections 14J to 14M',
    sectionBn: 'ধারা ১৪ঞ থেকে ১৪ঠ',
    title: 'Land Ceiling Area Limits, Family Unit & Standard Hectares',
    titleBn: 'জমির সর্বোচ্চ সিলিং সীমা, পরিবারের সংজ্ঞা ও স্ট্যান্ডার্ড হেক্টর হিসাব',
    amendedNote: 'Inserted w.e.f. 15.02.1971; includes updated non-agricultural land applicability u/s 3A',
    amendedNoteBn: '১৫.০২.১৯৭১ থেকে কার্যকর; ধারা ৩ক-এর অকৃষি জমিও এই সিলিং সীমার অন্তর্ভুক্ত',
    textEn:
      'Sections 14J & 14L: No raiyat shall hold land in excess of the ceiling area u/s 14M: (a) 2.50 standard hectares for a single adult/unmarried person; (b) 5.00 standard hectares for a family of 2 to 5 members; (c) 5.00 + 0.50 standard hectare per extra member above 5, capped at 7.00 standard hectares; (d) 7.00 standard hectares for any company/institution/trust. 1 Standard Hectare = 1.00 hectare irrigated area or 1.40 hectares non-irrigated area.',
    textBn:
      'ধারা ১৪ঞ থেকে ১৪ঠ: ধারা ১৪ঠ অনুযায়ী কোনো রায়ত নির্ধারিত সিলিং সীমার অতিরিক্ত জমি ধারণ করতে পারবেন না: (ক) একক ব্যক্তি ২.৫০ স্ট্যান্ডার্ড হেক্টর; (খ) ২ থেকে ৫ সদস্যের পরিবার ৫.০০ স্ট্যান্ডার্ড হেক্টর; (গ) ৫-এর অধিক প্রতি সদস্যের জন্য অতিরিক্ত ০.৫০ স্ট্যান্ডার্ড হেক্টর (সর্বোচ্চ ৭.০০ স্ট্যান্ডার্ড হেক্টর); (ঘ) কোম্পানি/প্রতিষ্ঠান/ট্রাস্ট ৭.০০ স্ট্যান্ডার্ড হেক্টর। (১ স্ট্যান্ডার্ড হেক্টর = সেচযুক্ত ১.০০ হেক্টর বা অসেচযুক্ত ১.৪০ হেক্টর)।',
    definitions: [
      {
        termEn: 'Family [Sec 14K(c)]',
        definitionEn: 'Raiyat, spouse, minor sons, unmarried daughters, and any adult son/unmarried daughter/widow whose spouse/son holds no separate land (excludes married daughters & major sons holding independent family).',
        termBn: 'পরিবার [ধারা ১৪ট(গ)]',
        definitionBn: 'রায়ত, স্বামী/স্ত্রী, নাবালক পুত্র, অবিবাহিতা কন্যা এবং নির্ভরশীল বিধবা পুত্রবধূ/নাতি-নাতনি — এই গোষ্ঠী মিলে এক সিলিং ইউনিট।'
      },
      {
        termEn: 'Standard Hectare [Sec 14K(f)]',
        definitionEn: 'Standardized ceiling measurement unit: 1.00 Hectare of Irrigated land (≈2.47 Acres) OR 1.40 Hectares of Non-irrigated land (≈3.46 Acres).',
        termBn: 'স্ট্যান্ডার্ড হেক্টর [ধারা ১৪ট(চ)]',
        definitionBn: 'সিলিং পরিমাপের একক: সেচযুক্ত ১.০০ হেক্টর (প্রায় ২.৪৭ একর) অথবা অসেচযুক্ত ১.৪০ হেক্টর (প্রায় ৩.৪৬ একর) জমি = ১ স্ট্যান্ডার্ড হেক্টর।'
      }
    ],
    keyPoints: [
      'Ceiling limits apply strictly from 15.02.1971 (agricultural) and 09.09.1980 (non-agricultural u/s 3A).',
      'Minor unmarried children and spouse form one family unit; major married sons are separate raiyat units.',
      '5.00 standard hectares equals ~12.35 Acres (irrigated) or ~17.30 Acres (unirrigated).'
    ],
    keyPointsBn: [
      'কৃষি জমির সিলিং ১৫.০২.১৯৭১ থেকে এবং অকৃষি জমির সিলিং ০৯.০৯.১৯৮০ (ধারা ৩ক) থেকে কার্যকর।',
      'স্বামী/স্ত্রী ও নাবালক সন্তানরা এক পরিবার হিসেবে গণ্য হয়; প্রাপ্তবয়স্ক বিবাহিত পুত্র পৃথক ইউনিট।',
      '৫.০০ স্ট্যান্ডার্ড হেক্টর মানে সেচযুক্ত প্রায় ১২.৩৫ একর বা অসেচযুক্ত প্রায় ১৭.৩০ একর জমি।'
    ],
    relevance: 'Essential for Big Raiyat vesting cases, Form 7A/7AA returns, and title clearance.',
    relevanceBn: 'বিগ রায়ত ভেস্টিং কেস, ফর্ম ৭ক/৭কক রিটার্ন এবং টাইটেল ক্লিয়ারেন্স যাচাইয়ের মূল ভিত্তি।'
  },
  {
    id: 'wblr-sec-14n-14t',
    category: 'wblract',
    chapter: 'ceiling',
    chapterTitle: 'Chapter IIB — Ceiling on Holdings (Sec 14J–14Z)',
    chapterTitleBn: 'অধ্যায় ২খ — জমির সিলিং বা ঊর্ধ্বসীমা (ধারা ১৪ঞ–১৪য়)',
    section: 'Sections 14N to 14U',
    sectionBn: 'ধারা ১৪ণ থেকে ১৪ন',
    title: 'Irrigated Area, Disregard of Post-1969 Transfers, Vesting & Form 7A/7AA Determination',
    titleBn: 'সেচযুক্ত এলাকা নির্ধারণ, ১৯৬৯ পরবর্তী হস্তান্তর অগ্রাহ্য, ভেস্টিং ও ধারা ১৪ধ (Form 7A/7AA)',
    amendedNote: 'Includes Sec 14T(3) suo motu determination, 14T(3A) review & Sec 14T(5)/(6) benami inquiry',
    amendedNoteBn: 'ধারা ১৪ধ(৩) স্বতঃপ্রণোদিত নির্ধারণ, ১৪ধ(৩ক) রিভিউ ও ১৪ধ(৫)/(৬) বেনামি তদন্ত ক্ষমতা অন্তর্ভুক্ত',
    textEn:
      'Section 14N determines irrigated areas. Section 14P disregards transfers made after 07.08.1969 (up to 15.02.1971) unless proved bona fide. Section 14S vests ceiling-excess land in the State free from encumbrances. Section 14T requires filing Return in Form 7A/7AA, empowers Revenue Officer u/s 14T(3) to determine ceiling suo motu, u/s 14T(3A) to revise orders, and u/s 14T(5)/(6) to enquire into benami holdings. Section 14U bars transfers until ceiling determination completes.',
    textBn:
      'ধারা ১৪ণ সেচযুক্ত জমি নির্ধারণ করে। ধারা ১৪ত অনুযায়ী ৭ই আগস্ট ১৯৬৯-এর পরবর্তী হস্তান্তর সিলিং গণনার ক্ষেত্রে উপেক্ষিত হয়। ধারা ১৪দ অনুসারে অতিরিক্ত জমি স্বয়ংক্রিয়ভাবে রাষ্ট্রে ন্যস্ত হয়। ধারা ১৪ধ-তে ফর্ম ৭ক/৭কক-এ রিটার্ন দাখিল, ১৪ধ(৩) অনুযায়ী স্বতঃপ্রণোদিতভাবে অতিরিক্ত জমি নির্ধারণ, ১৪ধ(৩ক) পুনর্বিবেচনা এবং ১৪ধ(৫)/(৬) বেনামি হস্তান্তর তদন্তের ক্ষমতা প্রদত্ত হয়েছে। ধারা ১৪ন নির্ধারণ সম্পন্ন না হওয়া পর্যন্ত জমি হস্তান্তরে নিষেধাজ্ঞা আরোপ করে।',
    definitions: [
      {
        termEn: 'Form 7A / Form 7AA Return [Sec 14T]',
        definitionEn: 'Statutory ceiling declaration form in which a family holding land above ceiling must disclose all plots across the State and choose retained plots.',
        termBn: 'ফর্ম ৭ক / ৭কক রিটার্ন [ধারা ১৪ধ]',
        definitionBn: 'সিলিং-এর বেশি জমি থাকলে রাজস্ব আধিকারিকের নিকট সমস্ত মৌজার জমির হিসাব ও কোন জমি রাখবেন (রিটেনশন) তা জানানোর বিধিবদ্ধ ফর্ম।'
      },
      {
        termEn: 'Retention Choice [Sec 14T]',
        definitionEn: 'Statutory right of the raiyat to select which plots (up to ceiling area) to retain before remaining excess plots vest in the State.',
        termBn: 'রিটেনশন চয়েস (পছন্দের অধিকার)',
        definitionBn: 'সিলিং সীমার মধ্যে নিজের পছন্দের দাগগুলো রাখার অধিকার, যা প্রয়োগের সুযোগ না দিয়ে খাস ঘোষণা করা যায় না।'
      },
      {
        termEn: 'Benami Transfer Inquiry [Sec 14T(5)/(6)]',
        definitionEn: 'Inquiry to test whether land standing in the name of another ostensible owner actually belongs to and is enjoyed by a ceiling-surplus raiyat.',
        termBn: 'বেনামি হস্তান্তর তদন্ত [ধারা ১৪ধ(৫)/(৬)]',
        definitionBn: 'সিলিং এড়ানোর উদ্দেশ্যে অন্য কারও নামে বেনামিতে জমি রাখা হয়েছে কি না তা যাচাই করার রাজস্ব তদন্ত।'
      }
    ],
    keyPoints: [
      'A raiyat must be allowed to exercise Retention Choice before specific plots are vested.',
      'Section 14T(3A) revision proceedings require valid material; arbitrary reopening after decades is often set aside by WBLRTT.',
      'Any transfer violating Section 14U while determination is pending is void against the State.'
    ],
    keyPointsBn: [
      'নির্দিষ্ট দাগ খাস করার পূর্বে রায়তকে ধারা ১৪ধ অনুযায়ী পছন্দমতো জমি রাখার (Retention) সুযোগ দিতেই হবে।',
      'দীর্ঘকাল পর যথাযথ কারণ ছাড়া ধারা ১৪ধ(৩ক) রিভিউ শুরু করলে ট্রাইব্যুনালে (WBLRTT) চ্যালেঞ্জ করা যায়।',
      'সিলিং নিষ্পত্তির পূর্বে ধারা ১৪ন লঙ্ঘন করে জমি বিক্রি করলে তা রাষ্ট্রের বিরুদ্ধে অকার্যকর হয়।'
    ],
    relevance: 'Core ceiling litigation provisions in BL&LRO 14T cases, DL&LRO Sec 54 appeals, and WBLRTT O.A.s.',
    relevanceBn: '১৪ধ ভেস্টিং মামলা, ডিএলআরও ধারা ৫৪ আপিল এবং WBLRTT মূল আবেদনের মূল ভিত্তি।'
  },
  {
    id: 'wblr-sec-14v-14y',
    category: 'wblract',
    chapter: 'ceiling',
    chapterTitle: 'Chapter IIB — Ceiling on Holdings (Sec 14J–14Z)',
    chapterTitleBn: 'অধ্যায় ২খ — জমির সিলিং বা ঊর্ধ্বসীমা (ধারা ১৪ঞ–১৪য়)',
    section: 'Sections 14V to 14Z',
    sectionBn: 'ধারা ১৪প থেকে ১৪য়',
    title: 'Compensation, Sec 14Y Permission to Hold Land Above Ceiling for Industrial/Township/Tea Projects',
    titleBn: 'ক্ষতিপূরণ ও শিল্প/টাউনশিপ/চা-বাগান প্রকল্পের জন্য সিলিং-বহির্ভূত জমি ধারণের অনুমতি (ধারা ১৪ব)',
    amendedNote: 'Sec 14Y amended to allow Industrial, IT, Medical, Educational, Township & Tea Tourism utilization',
    amendedNoteBn: 'শিল্প, আইটি, হাসপাতাল, শিক্ষাপ্রতিষ্ঠান, টাউনশিপ ও চা-বাগান পর্যটনের জন্য ধারা ১৪ব সংশোধিত',
    textEn:
      'Section 14V sets compensation (15 times net annual income) for vested land. Section 14Y empowers the State Government to permit a raiyat (mill, factory, workshop, tea garden, livestock farm, township, educational/medical/IT/tourism infrastructure project) to acquire or hold land in excess of ceiling subject to utilization within 3 years (extendable by Govt.), failing which excess land vests in the State. Section 14Z regulates applicability.',
    textBn:
      'ধারা ১৪প ন্যস্ত জমির ক্ষতিপূরণ (বার্ষিক নিট আয়ের ১৫ গুণ) নির্ধারণ করে। ধারা ১৪ব অনুযায়ী রাজ্য সরকার কোনো শিল্প, কারখানা, চা-বাগান, পশুপালন, টাউনশিপ, শিক্ষাপ্রতিষ্ঠান, হাসপাতাল, আইটি বা পর্যটন প্রকল্পের জন্য সিলিং সীমার অতিরিক্ত জমি ধারণ বা ক্রয়ের অনুমতি দিতে পারেন — তবে নির্ধারিত ৩ বছরের মধ্যে প্রকল্পের কাজে ব্যবহার না করলে অতিরিক্ত জমি রাষ্ট্রে ন্যস্ত হবে।',
    definitions: [
      {
        termEn: 'Section 14Y Exemption / Permission',
        definitionEn: 'Special State Government clearance allowing a company, trust, or developer to hold more than 7.00 Standard Hectares (~17.3–24.2 Acres) for approved projects.',
        termBn: 'ধারা ১৪ব ছাড়পত্র (১৪Y পারমিশন)',
        definitionBn: 'শিল্প, হাসপাতাল, শিক্ষাপ্রতিষ্ঠান বা টাউনশিপের জন্য কোম্পানি বা ট্রাস্টকে ৭.০০ স্ট্যান্ডার্ড হেক্টরের বেশি জমি রাখার রাজ্য সরকারি বিশেষ অনুমতি।'
      }
    ],
    keyPoints: [
      'Section 14Y approval is mandatory whenever any company/trust holds above 7.00 Standard Hectares.',
      'Land held under Section 14Y cannot be diverted to other uses or fragmented without fresh Govt. sanction.',
      'Tea gardens have updated tea-tourism / diversification norms under Section 14Y provisos.'
    ],
    keyPointsBn: [
      'কোনো কোম্পানি বা ট্রাস্টের মোট জমি ৭.০০ স্ট্যান্ডার্ড হেক্টর অতিক্রম করলে ধারা ১৪ব অনুমতি বাধ্যতামূলক।',
      'ধারা ১৪ব-এর জমি সরকারি অনুমতি ছাড়া অন্য কাজে ব্যবহার বা খণ্ডবিখণ্ড করে বিক্রি করা যায় না।',
      'চা-বাগানের অতিরিক্ত জমি ব্যবহারের ক্ষেত্রে চা-পর্যটন সংক্রান্ত হালনাগাদ শর্তাবলি প্রযোজ্য।'
    ],
    relevance: 'Indispensable for corporate, township, industrial park, and tea estate land compliance.',
    relevanceBn: 'কোম্পানি, টাউনশিপ, শিল্পপার্ক ও চা-বাগানের জমির আইনি অনুমোদনের জন্য অপরিহার্য।'
  },

  // CHAPTER III — BARGADARS (SECTIONS 15–21E)
  {
    id: 'wblr-sec-15-16',
    category: 'wblract',
    chapter: 'bargadar',
    chapterTitle: 'Chapter III — Bargadars / Bhagchas (Sec 15–21E)',
    chapterTitleBn: 'অধ্যায় ৩ — বর্গাদার ও ভাগচাষ (ধারা ১৫–২১ঙ)',
    section: 'Sections 15, 15A, 16 & 16A',
    sectionBn: 'ধারা ১৫, ১৫ক, ১৬ ও ১৬ক',
    title: 'Cultivation by Bargadar, Heritability of Barga Right & Division of Produce (75:25 / 50:50)',
    titleBn: 'বর্গাদারের চাষের অধিকার, উত্তরাধিকার ও ফসলের ভাগ বণ্টন (৭৫:২৫ / ৫০:৫০)',
    textEn:
      'Section 15 protects bargadars from arbitrary eviction; Section 15A makes cultivation right heritable by one lawful heir selected by heirs or Bhagchas Officer upon death. Section 16 fixes crop share: 50:50 where plough, cattle, manure and seeds are supplied by landowner, and 75:25 (75% bargadar, 25% owner) where the bargadar bears inputs. Written receipt is compulsory; Section 16A permits deposit before Bhagchas Officer if owner refuses produce.',
    textBn:
      'ধারা ১৫ বর্গাদারকে বেআইনি উচ্ছেদ থেকে সুরক্ষা দেয়; ধারা ১৫ক অনুযায়ী বর্গাদারের মৃত্যুর পর তার একজন নির্বাচিত/নির্ধারিত বৈধ উত্তরাধিকারীর চাষের অধিকার বর্তায়। ধারা ১৬ অনুযায়ী ফসলের ভাগ: জমির মালিক লাঙল, গরু, সার ও বীজ দিলে ৫০:৫০, এবং বর্গাদার নিজে উপকরণ দিলে ৭৫:২৫ (৭৫% বর্গাদার, ২৫% মালিক)। মালিক ফসল নিতে অস্বীকার করলে ধারা ১৬ক অনুযায়ী ভাগচাষ অফিসারের নিকট জমা দেওয়া যায়।',
    definitions: [
      {
        termEn: 'Heritable Barga Right [Sec 15A]',
        definitionEn: 'Upon a recorded bargadar\'s death, ONE nominated/determined heir continues cultivating — the right cannot be sold, gifted, or partitioned among multiple heirs.',
        termBn: 'বর্গার উত্তরাধিকার [ধারা ১৫ক]',
        definitionBn: 'বর্গাদারের মৃত্যুর পর তার পরিবার থেকে একজন নির্ধারিত ওয়ারিশ চাষ চালিয়ে যাবেন — তবে বর্গা স্বত্ব বিক্রি বা দান করা যায় না।'
      },
      {
        termEn: '75:25 vs 50:50 Produce Share [Sec 16]',
        definitionEn: 'Statutory division ratio of harvested crops between Bargadar and Raiyat depending on who supplies plough, cattle, seeds, and manure.',
        termBn: '৭৫:২৫ বনাম ৫০:৫০ ফসলের ভাগ [ধারা ১৬]',
        definitionBn: 'চাষের উপকরণ মালিক দিলে ফসল ৫০:৫০ এবং বর্গাদার নিজের খরচে চাষ করলে ৭৫% বর্গাদার ও ২৫% মালিক পাবেন।'
      }
    ],
    keyPoints: [
      'Barga right is HERITABLE (Sec 15A) but NEVER transferable by sale/will/gift.',
      'Landowner failure to issue produce receipt u/s 16(3) allows deposit u/s 16A before Bhagchas Officer.',
      'Only one heir inherits barga right u/s 15A to prevent fragmentation of cultivation.'
    ],
    keyPointsBn: [
      'বর্গা অধিকার উত্তরাধিকারযোগ্য (ধারা ১৫ক) কিন্তু বিক্রয় বা উইলযোগ্য নয়।',
      'মালিক ফসল গ্রহণের রসিদ না দিলে ধারা ১৬ক-এ ভগচাষ অফিসারের নিকট ফসলের মূল্য জমা রাখা যায়।',
      'চাষের সুবিধার্থে মৃত বর্গাদারের ওয়ারিশদের মধ্যে কেবল একজনকেই বর্গাদার হিসেবে নির্ধারণ করা হয়।'
    ],
    relevance: 'Vital for inheritance of Barga khatians and share-of-produce Bhagchas disputes.',
    relevanceBn: 'মৃত বর্গাদারের নাম সংশোধন ও ফসলের ভাগ সংক্রান্ত ভগচাষ মামলায় মূল বিধান।'
  },
  {
    id: 'wblr-sec-17-18-19',
    category: 'wblract',
    chapter: 'bargadar',
    chapterTitle: 'Chapter III — Bargadars / Bhagchas (Sec 15–21E)',
    chapterTitleBn: 'অধ্যায় ৩ — বর্গাদার ও ভাগচাষ (ধারা ১৫–২১ঙ)',
    section: 'Sections 17, 18, 19, 19A & 19B',
    sectionBn: 'ধারা ১৭, ১৮, ১৯, ১৯ক ও ১৯খ',
    title: 'Termination of Barga Cultivation, Bhagchas Officer Jurisdiction & Restoration of Evicted Bargadar',
    titleBn: 'বর্গা চাষ সমাপ্তির শর্ত, ভগচাষ অফিসারের এখতিয়ার ও উচ্ছেদকৃত বর্গাদার পুনরুদ্ধার',
    textEn:
      'Section 17 restricts termination of barga cultivation ONLY to statutory grounds: (a) failure to cultivate or non-agricultural use; (b) failure to tender crop share; (c) bona fide personal cultivation by small owner holding ≤3.00 hectares (leaving minimum 1.00 hectare with bargadar). Section 18 vests exclusive jurisdiction in Bhagchas Officer. Section 19 allows 30-day appeal to Collector/SDO. Section 19A penalizes illegal eviction and Section 19B restores evicted bargadar.',
    textBn:
      'ধারা ১৭ অনুযায়ী কেবলমাত্র আইনসিদ্ধ কারণে (চাষে অবহেলা/অকৃষি ব্যবহার, ফসলের ভাগ না দেওয়া, অথবা ৩ হেক্টরের কম জমির মালিকের প্রকৃত নিজস্ব চাষের প্রয়োজনে বর্গাদারের জন্য ন্যূনতম ১ হেক্টর রেখে) বর্গাদারের চাষ সমাপ্ত করা যায়। ধারা ১৮ ভগচাষ অফিসারকে একচ্ছত্র বিচারিক ক্ষমতা দেয়। ধারা ১৯-এ ৩০ দিনের মধ্যে আপিল এবং ধারা ১৯খ-তে বেআইনিভাবে উচ্ছেদকৃত বর্গাদারকে পুনরায় দখল ফিরিয়ে দেওয়ার বিধান রয়েছে।',
    definitions: [
      {
        termEn: 'Bhagchas Officer [Sec 18]',
        definitionEn: 'Officer empowered by State Govt (usually BL&LRO/Revenue Officer) with exclusive jurisdiction over crop share, barga termination, and restoration disputes.',
        termBn: 'ভগচাষ অফিসার [ধারা ১৮]',
        definitionBn: 'বর্গাদারের ফসলের ভাগ, চাষ সমাপ্তি এবং বেআইনি উচ্ছেদ পুনরুদ্ধারের একচ্ছত্র বিচারিক ক্ষমতাসম্পন্ন আধিকারিক (সাধারণত বিএলআরও)।'
      },
      {
        termEn: 'Bona Fide Personal Cultivation [Sec 17(1)(d)]',
        definitionEn: 'Exception allowing a small landowner (≤3.00 ha total) to resume land for personal cultivation by family labour, leaving ≥1.00 ha with the bargadar.',
        termBn: 'নিজস্ব চাষের প্রয়োজন [ধারা ১৭(১)(ঘ)]',
        definitionBn: '৩ হেক্টরের কম জমির মালিক পরিবারসহ নিজে চাষ করার জন্য বর্গাদারের হাতে ন্যূনতম ১ হেক্টর রেখে জমি ফেরত পাওয়ার শর্তসাপেক্ষ অধিকার।'
      }
    ],
    keyPoints: [
      'Landowner CANNOT privately evict a bargadar — prior Bhagchas Officer order u/s 17 is mandatory.',
      'Personal cultivation claim u/s 17(1)(d) fails if owner holds >3.00 ha or bargadar would be left with <1.00 ha.',
      'Appeal limitation u/s 19(2): 30 DAYS from Bhagchas Officer order.'
    ],
    keyPointsBn: [
      'ভগচাষ অফিসারের ১৭ ধারার আদেশ ছাড়া কোনো মালিক নিজে বর্গাদারকে উচ্ছেদ করতে পারেন না।',
      'মালিকের মোট জমি ৩ হেক্টরের বেশি হলে বা বর্গাদারের হাতে ১ হেক্টরের কম জমি থাকলে নিজস্ব চাষের আবেদন মঞ্জুর হয় না।',
      'ধারা ১৯ অনুযায়ী ভগচাষ অফিসারের আদেশের বিরুদ্ধে আপিলের সময়সীমা ৩০ দিন।'
    ],
    relevance: 'Core provisions for Bhagchas Officer cases, Barga termination petitions, and Sec 19B restoration.',
    relevanceBn: 'ভগচাষ মামলা, বর্গা সমাপ্তির আবেদন এবং ধারা ১৯খ পুনরুদ্ধার মামলার মূল ভিত্তি।'
  },
  {
    id: 'wblr-sec-20-21d',
    category: 'wblract',
    chapter: 'bargadar',
    chapterTitle: 'Chapter III — Bargadars / Bhagchas (Sec 15–21E)',
    chapterTitleBn: 'অধ্যায় ৩ — বর্গাদার ও ভাগচাষ (ধারা ১৫–২১ঙ)',
    section: 'Sections 20 to 21E',
    sectionBn: 'ধারা ২০ থেকে ২১ঙ',
    title: 'Voluntary Surrender Verification, Bar of Civil Court, Sec 21(3) Reference & Barga Recording',
    titleBn: 'স্বেচ্ছায় বর্গা ত্যাগ যাচাই, দেওয়ানি আদালতের এখতিয়ার বারণ, ধারা ২১(৩) রেফারেন্স ও বর্গা নথিভুক্তি',
    textEn:
      'Sections 20A/20B require Bhagchas Officer enquiry before any voluntary surrender ("Istafa") by a bargadar takes effect (owner cannot induct new bargadar). Section 21(1) bars Civil Court jurisdiction on Sec 18 matters; Section 21(3) mandates that if any question whether a person is a bargadar arises in Civil/Criminal Court, the Court MUST refer it to the prescribed Bhagchas Officer. Section 21B presumes lawful non-family cultivator is a bargadar; Section 21D mandates recording names in ROR.',
    textBn:
      'ধারা ২০ক/২০খ অনুযায়ী বর্গাদার স্বেচ্ছায় জমি ত্যাগ করলে (ইস্তফা) ভগচাষ অফিসারের যাচাই বাধ্যতামূলক। ধারা ২১(১) ভাগচাষ বিষয়ে দেওয়ানি আদালতের এখতিয়ার বারিত করে এবং ধারা ২১(৩) অনুসারে কোনো দেওয়ানি বা ফৌজদারি মামলায় কেউ বর্গাদার কি না এই প্রশ্ন উঠলে আদালত বাধ্যতামূলকভাবে বিষয়টি ভগচাষ অফিসারের নিকট পাঠাবেন। ধারা ২১খ অপরের জমি চাষকারী ব্যক্তিকে বর্গাদার বলে অনুমান করে এবং ধারা ২১ঘ খতিয়ানে নাম নথিভুক্তির নির্দেশ দেয়।',
    definitions: [
      {
        termEn: 'Mandatory Sec 21(3) Reference',
        definitionEn: 'Statutory rule compelling Civil and Criminal Courts to stay the barga issue and refer determination of "whether X is a bargadar" strictly to the BL&LRO/Bhagchas Officer.',
        termBn: 'বাধ্যতামূলক ধারা ২১(৩) রেফারেন্স',
        definitionBn: 'দেওয়ানি বা ফৌজদারি মামলায় কেউ বর্গাদার কি না এই প্রশ্ন উঠলে আদালত নিজে সিদ্ধান্ত না নিয়ে ভগচাষ অফিসারের নিকট রিপোর্টের জন্য পাঠাতে বাধ্য।'
      },
      {
        termEn: 'Voluntary Surrender (Istafa) [Sec 20B]',
        definitionEn: 'A private surrender deed by a bargadar has NO legal effect unless verified as genuine and voluntary by the Bhagchas Officer.',
        termBn: 'স্বেচ্ছায় বর্গা ত্যাগ / ইস্তফা [ধারা ২০খ]',
        definitionBn: 'বর্গাদার লিখিতভাবে বর্গা ছেড়ে দিলেও ভগচাষ অফিসারের তদন্তে অনুমোদিত না হলে তা আইনত কার্যকর হয় না।'
      }
    ],
    keyPoints: [
      'When barga plea is raised in Civil Title/Injunction suit, Court MUST refer question u/s 21(3).',
      'Private unregistered "Istafa-nama" without Section 20B enquiry is void.',
      'Recorded Operation Barga entries u/s 21D remain valid unless modified u/s 50/51A/18.'
    ],
    keyPointsBn: [
      'দেওয়ানি মামলায় বিবাদী বর্গাদার দাবি করলে আদালতকে ধারা ২১(৩) অনুযায়ী রেফারেন্স পাঠাতেই হবে।',
      'ধারা ২০খ তদন্ত ছাড়া গোপনে লেখা ইস্তফানামা আইনত বাতিল।',
      'ধারা ২১ঘ-এ রেকর্ডভুক্ত বর্গা নাম আইনসম্মত পদ্ধতি ছাড়া মুছে ফেলা যায় না।'
    ],
    relevance: 'Decisive defence and procedural rule where Title Suits overlap with Operation Barga records.',
    relevanceBn: 'টাইটেল সুট ও অপারেশন বর্গা রেকর্ডের বিরোধে প্রধান আইনি রক্ষাকবচ।'
  },

  // CHAPTERS IV, V & VI — REVENUE, CONSOLIDATION & FRAGMENTATION (SECTIONS 22–48D)
  {
    id: 'wblr-sec-22-38',
    category: 'wblract',
    chapter: 'revenue',
    chapterTitle: 'Chapters IV–VI — Revenue, Consolidation & Fragmentation (Sec 22–48D)',
    chapterTitleBn: 'অধ্যায় ৪–৬ — খাজনা, একত্রীকরণ ও খণ্ডীভবন প্রতিরোধ (ধারা ২২–৪৮ঘ)',
    section: 'Sections 22 to 38',
    sectionBn: 'ধারা ২২ থেকে ৩৮',
    title: 'Land Revenue (Khajna) Assessment, Small Agricultural Holding Exemptions & Recovery',
    titleBn: 'জমির খাজনা নির্ধারণ, ক্ষুদ্র কৃষি জমির ছাড় ও বকেয়া আদায় (পিডিআর)',
    amendedNote: 'Updated revenue slabs & agricultural exemption for small/marginal holdings',
    amendedNoteBn: 'ক্ষুদ্র ও প্রান্তিক কৃষি জমির খাজনা মকুব ও সংশোধিত বাণিজ্যিক/অকৃষি খাজনা হার সংযুক্ত',
    textEn:
      'Section 22 makes every raiyat liable to pay land revenue (first charge on holding). Sections 23–25 govern assessment and revision of revenue by irrigated/non-irrigated/non-agricultural/commercial classes (notified agricultural exemptions apply to small holdings). Sections 27–38 regulate instalments, mandatory Dakhila Rent Receipt (Sec 30), interest on arrears, and recovery as public demand under Bengal Public Demands Recovery Act, 1913.',
    textBn:
      'ধারা ২২ অনুযায়ী প্রতিটি রায়ত তার জমির খাজনা প্রদানে দায়বদ্ধ। ধারা ২৩–২৫ জমির শ্রেণি (কৃষি, অকৃষি, বাণিজ্যিক/শিল্প) অনুযায়ী খাজনার হার ও ক্ষুদ্র কৃষি জমির খাজনা মকুবের বিধান দেয়। ধারা ২৭–৩৮ কিস্তিতে খাজনা প্রদান, দাখিলা (খাজনার রসিদ) ইস্যু, বকেয়া খাজনার সুদ এবং বেঙ্গল পাবলিক ডিমান্ডস রিকভারি আইন, ১৯১৩ অনুযায়ী বকেয়া আদায়ের প্রক্রিয়া নির্ধারণ করে।',
    definitions: [
      {
        termEn: 'Land Revenue (Khajna) & Cesses',
        definitionEn: 'Annual statutory tax payable to the State by a raiyat along with Road Cess & Public Works Cess based on plot classification and area.',
        termBn: 'জমির খাজনা ও সেস',
        definitionBn: 'জমির শ্রেণি ও পরিমাণ অনুযায়ী রায়তের দ্বারা রাষ্ট্রকে প্রদেয় বার্ষিক রাজস্ব এবং পথ ও পূর্ত কর (সেস)।'
      },
      {
        termEn: 'Daakhila (Rent Receipt) [Sec 30]',
        definitionEn: 'Official numbered receipt issued on payment of Khajna/Cess — serves as evidence of possession and active Khatian status (though not standalone title).',
        termBn: 'দাখিলা (খাজনার রসিদ) [ধারা ৩০]',
        definitionBn: 'খাজনা পরিশোধের পর প্রদত্ত সরকারি রসিদ — যা দখল ও খতিয়ানের হালনাগাদ অবস্থার প্রমাণ (তবে এককভাবে স্বত্বের দলিল নয়)।'
      },
      {
        termEn: 'PDR Certificate Case [Sec 38]',
        definitionEn: 'Recovery of unpaid revenue/lease salami as a "public demand" by Certificate Officer without filing an ordinary Civil Suit.',
        termBn: 'পিডিআর সার্টিফিকেট মামলা [ধারা ৩৮]',
        definitionBn: 'বকেয়া খাজনা বা সেলামি দেওয়ানি মামলা ছাড়াই সার্টিফিকেট অফিসারের মাধ্যমে সরকারি পাওনা হিসেবে আদায়ের পদ্ধতি।'
      }
    ],
    keyPoints: [
      'Payment of Khajna (Daakhila) proves current record & possession, though not title by itself.',
      'Banglarbhumi calculates annual Khajna & Cess automatically according to plot classification.',
      'Arrears are recovered via PDR Act Certificate proceedings.'
    ],
    keyPointsBn: [
      'খাজনার দাখিলা দখল ও হাল রেকর্ডের প্রমাণ বহন করে, তবে কেবল দাখিলা দিয়ে মালিকানা প্রমাণ হয় না।',
      'বাংলার ভূমি পোর্টালে জমির শ্রেণি অনুসারে স্বয়ংক্রিয়ভাবে খাজনা ও সেস নির্ধারিত হয়।',
      'বকেয়া রাজস্ব পিডিআর আইনে সার্টিফিকেট মামলার মাধ্যমে আদায় করা হয়।'
    ],
    relevance: 'Governs Khajna assessment disputes, commercial rate revisions, and PDR certificate defences.',
    relevanceBn: 'খাজনা নির্ধারণ, বাণিজ্যিক খাজনা বৃদ্ধি আপত্তি এবং পিডিআর সার্টিফিকেট মামলার প্রতিরক্ষায় ব্যবহৃত।'
  },
  {
    id: 'wblr-sec-39-48d',
    category: 'wblract',
    chapter: 'revenue',
    chapterTitle: 'Chapters IV–VI — Revenue, Consolidation & Fragmentation (Sec 22–48D)',
    chapterTitleBn: 'অধ্যায় ৪–৬ — খাজনা, একত্রীকরণ ও খণ্ডীভবন প্রতিরোধ (ধারা ২২–৪৮ঘ)',
    section: 'Sections 39 to 48D',
    sectionBn: 'ধারা ৩৯ থেকে ৪৮ঘ',
    title: 'Consolidation of Holdings, Co-operative Farming Societies & Prevention of Fragmentation',
    titleBn: 'জমি একত্রীকরণ (কনসোলিডেশন), সমবায় কৃষি সমিতি ও খণ্ডীভবন প্রতিরোধ',
    textEn:
      'Sections 39–42 (Chapter V): State Government may formulate schemes for consolidation of scattered holdings into compact agricultural blocks. Sections 43–48 (Chapter VI): Seven or more raiyats holding land in a compact block may form a Co-operative Farming Society with statutory concessions. Sections 48A–48D: Restrict fragmentation of agricultural holdings below viable economic size in notified areas.',
    textBn:
      'ধারা ৩৯–৪২ (অধ্যায় ৫): কৃষিকাজের সুবিধার্থে বিচ্ছিন্ন খণ্ডজমি একত্রীকরণের (কনসোলিডেশন) প্রকল্প ও নিয়মাবলি। ধারা ৪৩–৪৮ (অধ্যায় ৬): সাত বা ততোধিক রায়ত মিলিতভাবে সমবায় কৃষি সমিতি গঠন ও সরকারি সুবিধা প্রাপ্তির বিধান। ধারা ৪৮ক–৪৮ঘ: নোটিফায়েড এলাকায় জমির অতি-ক্ষুদ্র বিভাজন প্রতিরোধের বিধান।',
    definitions: [
      {
        termEn: 'Consolidation of Holdings [Sec 39]',
        definitionEn: 'Amalgamation and redistribution of scattered small plots of different owners in a village into compact single-location blocks for efficient farming.',
        termBn: 'জমি একত্রীকরণ (চকবন্দি / কনসোলিডেশন)',
        definitionBn: 'চাষের সুবিধার্থে এক মৌজায় ছড়িয়ে থাকা ক্ষুদ্র জমিগুলোকে পুনর্বণ্টন করে একত্রিত ব্লকে পরিণত করা।'
      },
      {
        termEn: 'Fragmentation [Sec 48A]',
        definitionEn: 'Splitting an agricultural plot into tiny uneconomic pieces below notified minimum area.',
        termBn: 'খণ্ডীভবন / অতি-ক্ষুদ্র বিভাজন',
        definitionBn: 'কৃষি জমিকে উৎপাদন অনুপযোগী ক্ষুদ্র ক্ষুদ্র অংশে বিভক্ত করা।'
      }
    ],
    keyPoints: [
      'Consolidation schemes require draft publication and disposal of raiyat objections.',
      'Co-operative Farming Societies enjoy pooling & credit privileges under Sec 43–48.',
      'Supports prevention of uneconomic agricultural subdivision in notified tracts.'
    ],
    keyPointsBn: [
      'একত্রীকরণ প্রকল্পে খসড়া প্রকাশ ও রায়তদের আপত্তি শুনানি বাধ্যতামূলক।',
      'সমবায় কৃষি সমিতি গঠনের মাধ্যমে ক্ষুদ্র চাষিরা যৌথ সুবিধা ও ঋণ পেতে পারেন।',
      'কৃষি উৎপাদন রক্ষায় খণ্ডীভবন নিয়ন্ত্রণের বিধান রয়েছে।'
    ],
    relevance: 'Reference for consolidation notifications, society title verification, and minimum plot rules.',
    relevanceBn: 'একত্রীকরণ বিজ্ঞপ্তি, সমবায় সমিতির জমি যাচাই এবং বিভাজন সীমা নির্ধারণে সহায়ক।'
  },

  // CHAPTER VII — VESTED LAND DISTRIBUTION & PATTA (SECTIONS 49–49A)
  {
    id: 'wblr-sec-49-49a',
    category: 'wblract',
    chapter: 'vested',
    chapterTitle: 'Chapter VII — Vested Land Distribution & Patta (Sec 49–49A)',
    chapterTitleBn: 'অধ্যায় ৭ — খাস জমি বণ্টন ও পাট্টা (ধারা ৪৯–৪৯ক)',
    section: 'Sections 49 & 49A',
    sectionBn: 'ধারা ৪৯ ও ৪৯ক',
    title: 'Settlement of Vested Land (Patta Distribution), Bar on Transfer & Annulment of Fraudulent Patta',
    titleBn: 'খাস জমি পাট্টা বিলি, পাট্টা জমি হস্তান্তরে নিষেধাজ্ঞা ও প্রতারণামূলক পাট্টা বাতিল',
    amendedNote: 'Sec 49(1A) non-transferability; Sec 49(2)/(3) annulment & Sec 49(3A) 30-day Appeal',
    amendedNoteBn: 'ধারা ৪৯(১ক) হস্তান্তর নিষেধাজ্ঞা; ধারা ৪৯(২)/(৩) পাট্টা বাতিল ও ৪৯(৩ক) ৩০ দিনের আপিল',
    textEn:
      'Section 49(1): Vested agricultural/homestead lands are settled without salami by Patta with local landless or <1-acre residents (prioritizing agricultural labourers, bargadars, SC/ST & joint/female patta). Section 49(1A): Patta land is strictly NON-TRANSFERABLE except mortgage to Govt/approved banks. Section 49(2): SDL&LRO/SDO may annul a Patta obtained by fraud, mistake, or ineligibility. Section 49(3A): 30-day appeal to Collector/DL&LRO. Section 49A penalizes illegal occupation of vested/patta land.',
    textBn:
      'ধারা ৪৯(১): রাষ্ট্রের খাস কৃষি ও বাস্তু জমি বিনা সেলামিতে স্থানীয় ভূমিহীন বা ১ একরের কম জমির মালিক, বর্গাদার ও তফসিলি/মহিলাদের যৌথ পাট্টা প্রদানের মাধ্যমে বন্দোবস্ত করা হয়। ধারা ৪৯(১ক): অনুমোদিত ব্যাংক/সরকারি ঋণ ব্যতীত পাট্টাপ্রাপ্ত জমি বিক্রয়, দান বা হস্তান্তর সম্পূর্ণ নিষিদ্ধ। ধারা ৪৯(২): প্রতারণা বা অযোগ্যতার মাধ্যমে প্রাপ্ত পাট্টা মহকুমা শাসক/এসডিএলআরও বাতিল করতে পারেন। ধারা ৪৯(৩ক): বাতিল আদেশের বিরুদ্ধে ৩০ দিনের মধ্যে কালেক্টরের নিকট আপিল। ধারা ৪৯ক: খাস/পাট্টা জমি বেআইনি দখলের শাস্তি।',
    definitions: [
      {
        termEn: 'Patta [Sec 49(1)]',
        definitionEn: 'Deed of settlement issued free of salami by Govt. granting heritable (but non-transferable) cultivation/homestead rights over vested land to landless families.',
        termBn: 'পাট্টা [ধারা ৪৯(১)]',
        definitionBn: 'ভূমিহীন বা প্রান্তিক পরিবারকে খাস কৃষি বা বাস্তু জমিতে বিনা সেলামিতে সরকার প্রদত্ত উত্তরাধিকারযোগ্য (কিন্তু হস্তান্তর-অযোগ্য) বন্দোবস্ত দলিল।'
      },
      {
        termEn: 'Patta Annulment [Sec 49(2)]',
        definitionEn: 'Statutory cancellation of an improperly granted Patta by the SDL&LRO/SDO upon proving fraud, false declaration, non-residence, or ineligible holding.',
        termBn: 'পাট্টা বাতিল [ধারা ৪৯(২)]',
        definitionBn: 'তথ্য গোপন, প্রতারণা বা অযোগ্যতার কারণে প্রদত্ত পাট্টা এসডিএলআরও/এসডিও কর্তৃক তদন্ত সাপেক্ষে বাতিল করার প্রক্রিয়া।'
      }
    ],
    keyPoints: [
      'ANY sale deed executed by a Patta-holder is VOID ab initio u/s 49(1A) — buyer gets zero title and mutation must be refused.',
      'Patta Annulment cases u/s 49(2) are tried by SDO/SDL&LRO after notice & field enquiry.',
      'Dispossessed Patta-holder can seek summary restoration u/s 49(3).'
    ],
    keyPointsBn: [
      'ধারা ৪৯(১ক) অনুযায়ী পাট্টাপ্রাপ্ত ব্যক্তি জমি বিক্রি করলে সেই দলিল জন্মগতভাবে বাতিল — ক্রেতার মিউটেশন হয় না।',
      'পাট্টা বাতিল মিস কেস এসডিও বা এসডিএলআরও দ্বারা ধারা ৪৯(২) অনুসারে নিষ্পত্তি হয়।',
      'পাট্টাদার বেদখল হলে ধারা ৪৯(৩) অনুযায়ী সরাসরি দখল পুনরুদ্ধারের আবেদন করতে পারেন।'
    ],
    relevance: 'Essential for verifying Patta title defects, Patta Cancellation cases, and Govt. vested encroachments.',
    relevanceBn: 'পাট্টা জমির দলিল যাচাই, পাট্টা বাতিল মিস কেস এবং খাস জমি জবরদখল মামলায় অপরিহার্য।'
  },

  // CHAPTER VIIA — PREPARATION & MAINTENANCE OF RECORD-OF-RIGHTS (SECTIONS 50–51D)
  {
    id: 'wblr-sec-50',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA — Maintenance & Revision of ROR (Sec 50–51D)',
    chapterTitleBn: 'অধ্যায় ৭ক — রেকর্ড-অব-রাইটস সংরক্ষণ ও সংশোধন (ধারা ৫০–৫১ঘ)',
    section: 'Section 50',
    sectionBn: 'ধারা ৫০',
    title: 'Maintenance of the Record-of-Rights (Mutation by BL&LRO)',
    titleBn: 'রেকর্ড-অব-রাইটস (খতিয়ান) হালনাগাদ ও নামজারি / মিউটেশন (বিএলআরও)',
    amendedNote: 'Updated for digital Banglarbhumi ROR maintenance & Sec 50(1)(a)–(f) mutation grounds',
    amendedNoteBn: 'বাংলার ভূমি ডিজিটাল আর.ও.আর. ও ধারা ৫০(১)(ক)–(চ)-এর সমস্ত মিউটেশন ভিত্তিসহ হালনাগাদ',
    textEn:
      'The Revenue Officer (BL&LRO) especially empowered by the State Government shall maintain up-to-date the Record-of-Rights (ROR) by incorporating changes on account of: (a) succession (inheritance) or transfer inter vivos (sale, gift, exchange, partition, probated will); (b) acquisition, vesting, or patta settlement; (c) conversion u/s 4C; (d) civil court decree; (e) alluvion/diluvion; or (f) revenue alteration.',
    textBn:
      'রাজস্ব আধিকারিক (বিএলঅ্যান্ডএলআরও) নিম্নোক্ত কারণে গ্রাম্য রেকর্ড-অব-রাইটস (খতিয়ান) নিয়মিত হালনাগাদ ও সংশোধন করবেন: (ক) উত্তরাধিকার (ওয়ারিশান) বা বিক্রয়, দান, বিনিময়, বণ্টননামা দলিলমূলে নামজারি (মিউটেশন); (খ) অধিগ্রহণ, ন্যস্তকরণ বা পাট্টা; (গ) ধারা ৪গ অনুযায়ী শ্রেণি পরিবর্তন; (ঘ) দেওয়ানি আদালতের ডিক্রি; (ঙ) সিকস্তি/পয়স্তি; (চ) খাজনা পরিবর্তন।',
    definitions: [
      {
        termEn: 'Record-of-Rights (ROR / Khatian)',
        definitionEn: 'Official village land ledger recording Khatian No., Raiyat/co-sharer names, plot (Dag) numbers, land classification, area, 10,000 share, and Bargadar notations.',
        termBn: 'রেকর্ড-অব-রাইটস (আর.ও.আর. / খতিয়ান)',
        definitionBn: 'মৌজার সরকারি ভূমি খতিয়ান যেখানে মালিকের নাম, দাগ নম্বর, জমির শ্রেণি, পরিমাণ, ১০,০০০ হিস্যা ও বর্গাদারের তথ্য লিপিবদ্ধ থাকে।'
      },
      {
        termEn: 'Mutation (Namjari / Jama-Kharij)',
        definitionEn: 'The statutory administrative process of updating the ROR under Sec 50 to delete the transferor\'s/deceased\'s share and enter the purchaser\'s/heir\'s name.',
        termBn: 'মিউটেশন / নামজারি / জমা-খারিজ',
        definitionBn: 'বিক্রি বা ওয়ারিশান সূত্রে প্রাপ্তির পর পূর্বতন মালিকের নাম খারিজ করে নতুন মালিকের নাম ও অংশ সরকারি খতিয়ানে তোলার প্রক্রিয়া।'
      }
    ],
    keyPoints: [
      'BL&LRO acts under Section 50; Registration of Deed alone does not alter ROR without Mutation.',
      'Requires prima facie title + possession, unbroken chain of deeds, and 15-day notice to co-sharers/vendors.',
      'Appeal lies u/s 54 against BL&LRO mutation orders (mutation does not confer title if vendor lacked title).'
    ],
    keyPointsBn: [
      'দলিল রেজিস্ট্রি করলেই খতিয়ানে নাম ওঠে না — ধারা ৫০ অনুযায়ী মিউটেশন করা বাধ্যতামূলক।',
      'পিঠ দলিলের (চেন ডিড) ধারাবাহিকতা, দখল যাচাই এবং শরিকদের ১৫ দিনের নোটিশ দেওয়া আবশ্যক।',
      'মিউটেশন আদেশের বিরুদ্ধে ধারা ৫৪-এ আপিল চলে; তবে মিউটেশন সরাসরি স্বত্ব সৃষ্টি করে না, দখল ও কর আদায়ের নথি মাত্র।'
    ],
    relevance: 'Core statutory provision for every Mutation Case and Heirship Mutation.',
    relevanceBn: 'সকল দলিল মিউটেশন ও ওয়ারিশান নামজারি মামলার মূল আইনি ভিত্তি।'
  },
  {
    id: 'wblr-sec-50a',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA — Maintenance & Revision of ROR (Sec 50–51D)',
    chapterTitleBn: 'অধ্যায় ৭ক — রেকর্ড-অব-রাইটস সংরক্ষণ ও সংশোধন (ধারা ৫০–৫১ঘ)',
    section: 'Section 50A',
    sectionBn: 'ধারা ৫০ক (50A)',
    title: 'Correction of Bona Fide Clerical Mistakes & Share Anomalies in ROR',
    titleBn: 'খতিয়ানের করণিক ভুল ও ১০,০০০ হিস্যার অসঙ্গতি সংশোধন',
    textEn:
      'Section 50A empowers the Revenue Officer, suo motu or upon application, to correct at any time any bona fide clerical or arithmetical mistake or omission in the Record-of-Rights maintained u/s 50 (e.g., spelling errors in name, wrong Dag/Khatian posting, or 10000 fractional share discrepancy). Complex disputed title questions cannot be adjudicated under Section 50A.',
    textBn:
      'ধারা ৫০ক অনুযায়ী রাজস্ব আধিকারিক স্বপ্রণোদিতভাবে বা আবেদনের প্রেক্ষিতে যেকোনো সময় রেকর্ড-অব-রাইটসে ঘটে যাওয়া করণিক, ছাপাজনিত বা গাণিতিক ভুল (যেমন নাম/পিতার নামের বানান ভুল, খতিয়ান/দাগের ভুল পোস্টিং বা ১০,০০০ হিস্যা গরমিল) সংশোধন করতে পারবেন। তবে জটিল স্বত্বগত বিরোধ এই ধারায় নিষ্পত্তি করা যায় না।',
    definitions: [
      {
        termEn: 'Bona Fide Clerical Mistake',
        definitionEn: 'An unintentional drafting, data-entry, spelling, or arithmetic error apparent from underlying records (such as RS-to-LR digit slip or 10,000-share total mismatch).',
        termBn: 'অনিচ্ছাকৃত করণিক / ছাপাজনিত ভুল',
        definitionBn: 'তথ্য এন্ট্রি বা কম্পিউটার পোস্টিংয়ের সময় ঘটে যাওয়া বানান ভুল, দাগ/পরিমাণের ভুল বা হিস্যার যোগফলের অসঙ্গতি যা মূল নথি দেখলেই স্পষ্ট বোঝা যায়।'
      }
    ],
    keyPoints: [
      'Primary legal tool for Name/Dag/Area/10000-Share Correction Misc Cases on Banglarbhumi.',
      'Cannot alter substantive shares or override a Civil Court decree without hearing all co-sharers.',
      'Appeal lies u/s 54 against refusal or erroneous correction order.'
    ],
    keyPointsBn: [
      'বাংলার ভূমি পোর্টালে নাম, দাগ, পরিমাণ ও ১০,০০০ হিস্যা সংশোধন মিস কেসের প্রধান ধারা।',
      'সমস্ত শরিকের শুনানি ছাড়া বা দেওয়ানি আদালতের ডিক্রি উপেক্ষা করে অংশ পরিবর্তন করা যায় না।',
      'আদেশের বিরুদ্ধে ধারা ৫৪ অনুযায়ী আপিল করা যায়।'
    ],
    relevance: 'Basis for all Misc Cases seeking clerical, Dag, Khatian, or 10,000 share corrections.',
    relevanceBn: 'বানান ভুল, খতিয়ান ভুল ও ১০,০০০ হিস্যা সংশোধনের সমস্ত মিস কেসের ভিত্তি।'
  },
  {
    id: 'wblr-sec-51-51a',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA — Maintenance & Revision of ROR (Sec 50–51D)',
    chapterTitleBn: 'অধ্যায় ৭ক — রেকর্ড-অব-রাইটস সংরক্ষণ ও সংশোধন (ধারা ৫০–৫১ঘ)',
    section: 'Sections 51 & 51A',
    sectionBn: 'ধারা ৫১ ও ৫১ক',
    title: 'Revision/Preparation of ROR, Draft & Final Publication, Objection & 30-Day Appeal',
    titleBn: 'আর.ও.আর. প্রণয়ন/সংশোধন, খসড়া ও চূড়ান্ত প্রকাশনা, আপত্তি ও ৩০ দিনের আপিল',
    amendedNote: 'Sec 51A(1) Objection, Sec 51A(4) Final Publication, Sec 51A(5) 30-day Appeal & Sec 51A(9) Presumption',
    amendedNoteBn: 'ধারা ৫১ক(১) আপত্তি, ৫১ক(৪) চূড়ান্ত প্রকাশ, ৫১ক(৫) ৩০ দিনের আপিল এবং ৫১ক(৯) অনুমান',
    textEn:
      'Section 51 empowers State Govt. to notify preparation/revision of ROR (settlement operations). Section 51A(1): Publication of Draft ROR inviting objections within prescribed time. Section 51A(4): Final Publication of ROR. Section 51A(5): Appeal against order on objection lies within STRICT 30 DAYS. Section 51A(9): Every entry in finally published ROR is presumed correct until proved otherwise (rebuttable presumption of possession/record, not title).',
    textBn:
      'ধারা ৫১ রাজ্য সরকারকে রেকর্ড-অব-রাইটস প্রণয়ন বা সংশোধনের বিজ্ঞপ্তি জারির ক্ষমতা দেয়। ধারা ৫১ক(১): খসড়া আর.ও.আর. প্রকাশ ও আপত্তি দাখিল। ধারা ৫১ক(৪): চূড়ান্ত রেকর্ড প্রকাশ। ধারা ৫১ক(৫): আপত্তি আদেশের বিরুদ্ধে ৩০ দিনের মধ্যে আপিল। ধারা ৫১ক(৯): চূড়ান্ত প্রকাশিত রেকর্ড বিপরীত প্রমাণিত না হওয়া পর্যন্ত সঠিক বলে গণ্য হবে (খণ্ডনযোগ্য অনুমান)।',
    definitions: [
      {
        termEn: 'Rebuttable Presumption [Sec 51A(9)]',
        definitionEn: 'Law presumes a finally published LR Khatian entry to be accurate on possession/facts, unless disproved by stronger registered deeds or Civil Court evidence.',
        termBn: 'খণ্ডনযোগ্য বৈধ অনুমান [ধারা ৫১ক(৯)]',
        definitionBn: 'চূড়ান্ত প্রকাশিত এল.আর. খতিয়ান প্রাথমিকভাবে সঠিক ধরে নেওয়া হয়, তবে শক্তিশালী দলিল ও সাক্ষ্যপ্রমাণের দ্বারা আদালতে তা ভুল প্রমাণ করা যায়।'
      }
    ],
    keyPoints: [
      'Section 51A(9) presumption does NOT create or extinguish title; a Civil Suit can rebut wrong ROR entries.',
      'Section 51A(5) Appeal limitation is STRICT 30 DAYS.',
      'During active Section 51 settlement operations in a Mouza, Section 50 mutation yields to settlement objection/correction.'
    ],
    keyPointsBn: [
      'ধারা ৫১ক(৯)-এর রেকর্ড কেবল দখলগত অনুমান দেয়, স্বত্ব তৈরি করে না — দেওয়ানি মামলায় ভুল খতিয়ান খণ্ডন করা যায়।',
      'ধারা ৫১ক(৫) আপিলের তামাদি কঠোরভাবে ৩০ দিন।',
      'কোনো মৌজায় ৫১ ধারার জরিপ চলাকালীন সাধারণ ৫০ ধারার মিউটেশন স্থগিত রেখে জরিপ আপত্তিতে নিষ্পত্তি হয়।'
    ],
    relevance: 'Governs Settlement Objection/Appeal cases and evidentiary weight of LR Khatians in courts.',
    relevanceBn: 'সেটেলমেন্ট আপত্তি ও আপিল মামলা এবং আদালতে খতিয়ানের সাক্ষ্যমূল্য নির্ধারণে ব্যবহৃত।'
  },
  {
    id: 'wblr-sec-51b-51d',
    category: 'wblract',
    chapter: 'ror',
    chapterTitle: 'Chapter VIIA — Maintenance & Revision of ROR (Sec 50–51D)',
    chapterTitleBn: 'অধ্যায় ৭ক — রেকর্ড-অব-রাইটস সংরক্ষণ ও সংশোধন (ধারা ৫০–৫১ঘ)',
    section: 'Sections 51B, 51BB, 51C & 51D',
    sectionBn: 'ধারা ৫১খ, ৫১খখ, ৫১গ ও ৫১ঘ',
    title: 'Revision Before/After Final Publication, Suo Motu Sec 51B(1) & Bar of Civil Court u/s 51C',
    titleBn: 'চূড়ান্ত প্রকাশনার আগে/পরে রেকর্ড রিভিশন এবং ধারা ৫১গ অনুযায়ী দেওয়ানি আদালতের এখতিয়ার বাধা',
    textEn:
      'Sections 51B & 51BB empower specially empowered Revenue Officers to revise or correct ROR entries before or after final publication upon application or suo motu after notice and hearing. Section 51C bars Civil Courts from entertaining suits solely directing alteration/preparation of ROR (while retaining full Civil Court jurisdiction to declare substantive title/possession, which Revenue Officers implement u/s 50). Section 51D applies Ch. VIIA provisions mutatis mutandis.',
    textBn:
      'ধারা ৫১খ ও ৫১খখ চূড়ান্ত প্রকাশনার পূর্বে বা পরে বিশেষভাবে ক্ষমতাপ্রাপ্ত রাজস্ব আধিকারিককে নোটিশ ও শুনানি সাপেক্ষে ভুল বা প্রতারণামূলক এন্ট্রি সংশোধন বা পুনর্বিবেচনার ক্ষমতা দেয়। ধারা ৫১গ অনুযায়ী রেকর্ড-অব-রাইটস প্রণয়ন বা সংশোধনের আদেশ নিয়ে দেওয়ানি আদালতে সরাসরি মামলা করা যায় না (তবে স্বত্ব ঘোষণার মামলা করা যায়)।',
    definitions: [
      {
        termEn: 'Bar of Civil Court Jurisdiction [Sec 51C]',
        definitionEn: 'Prohibits a Civil Court from directly ordering correction of Khatian; however, Civil Courts have full power to pass a Title Decree u/s 34 Specific Relief Act.',
        termBn: 'দেওয়ানি আদালতের এখতিয়ার বাধা [ধারা ৫১গ]',
        definitionBn: 'দেওয়ানি আদালত সরাসরি খতিয়ান সংশোধনের ডিক্রি দিতে পারেন না, তবে স্বত্ব ও দখল ঘোষণার পূর্ণ ক্ষমতা রাখেন — যে ডিক্রি মেনে বিএলআরও খতিয়ান বদলাতে বাধ্য।'
      }
    ],
    keyPoints: [
      'Always frame Civil Suits for Declaration of Title + Injunction (not merely "correction of ROR") to avoid Sec 51C bar.',
      'Section 51B/51BB orders passed without hearing recorded owners violate natural justice.',
      'Post-decree implementation is carried out by BL&LRO u/s 50(1)(d).'
    ],
    keyPointsBn: [
      'ধারা ৫১গ-এর বাধা এড়াতে দেওয়ানি মামলা সর্বদা স্বত্ব ঘোষণা ও নিষেধাজ্ঞার (Declaration of Title) প্রার্থনায় দায়ের করা উচিত।',
      'রেকর্ডীয় মালিককে নোটিশ না দিয়ে ধারা ৫১খ/৫১খখ আদেশ দিলে তা প্রাকৃতিক ন্যায়বিচারের পরিপন্থী।',
      'দেওয়ানি আদালতের ডিক্রি পাওয়ার পর বিএলআরও ধারা ৫০(১)(ঘ) অনুসারে খতিয়ান সংশোধন করতে বাধ্য।'
    ],
    relevance: 'Key jurisdictional defense against Civil Court maintainability objections (Sec 51C vs Sec 9 CPC).',
    relevanceBn: 'দেওয়ানি মামলায় রক্ষণাবেক্ষণযোগ্যতা (Maintainability) প্রশ্নে ধারা ৫১গ বনাম সিপিসি ধারা ৯ যুক্তিতে ব্যবহৃত।'
  },

  // CHAPTER VIII — MANAGEMENT OF ESTATES, APPEALS & MISCELLANEOUS (SECTIONS 52–63)
  {
    id: 'wblr-sec-52-53a',
    category: 'wblract',
    chapter: 'appeal',
    chapterTitle: 'Chapter VIII — Management, Appeals & Suits (Sec 52–63)',
    chapterTitleBn: 'অধ্যায় ৮ — ব্যবস্থাপনা, আপিল ও দেওয়ানি মামলা (ধারা ৫২–৬৩)',
    section: 'Sections 52, 53 & 53A',
    sectionBn: 'ধারা ৫২, ৫৩ ও ৫৩ক',
    title: 'Management of Vested Estates/Sairati, Delegation & Revenue Officer as Necessary Party in Civil Suits',
    titleBn: 'খাস সম্পত্তি/সায়রাতি ব্যবস্থাপনা, ক্ষমতা অর্পণ ও দেওয়ানি মামলায় রাজস্ব আধিকারিক আবশ্যিক পক্ষ',
    textEn:
      'Section 52 provides management of vested lands and Sairati interests (hats, bazars, ferries, fisheries, mines/minerals) by State Government through prescribed officers. Section 53 permits delegation of powers. Section 53A mandates that in ANY Civil Suit involving vested land or rights under this Act, the Revenue Officer / State of West Bengal MUST be joined as a NECESSARY PARTY.',
    textBn:
      'ধারা ৫২ অনুসারে সমস্ত খাস জমি ও সায়রাতি স্বত্ব (হাট, বাজার, খেয়াঘাট, জলকর/মৎস্যচাষ ও খনি) রাজ্য সরকার নির্ধারিত রাজস্ব আধিকারিকের মাধ্যমে পরিচালনা করবে। ধারা ৫৩ ক্ষমতা অর্পণের বিধান দেয়। ধারা ৫৩ক অনুযায়ী খাস জমি বা এই আইনের অধীন স্বত্ব সংক্রান্ত যেকোনো দেওয়ানি মামলায় রাজস্ব আধিকারিক বা পশ্চিমবঙ্গ সরকারকে আবশ্যিক পক্ষ (Necessary Party) করতে হবে।',
    definitions: [
      {
        termEn: 'Sairati Interests [Sec 52]',
        definitionEn: 'Non-tenanted vested State revenue sources such as public Hats, Bazars, Ferry Ghats, Jalkars (fishery tanks/beels), and minor mineral rights.',
        termBn: 'সায়রাতি স্বত্ব [ধারা ৫২]',
        definitionBn: 'রাষ্ট্রে ন্যস্ত হওয়া হাট, বাজার, খেয়াঘাট, সরকারি পুকুর/বিল (জলকর) এবং খনিজ সম্পদ থেকে প্রাপ্ত রাজস্ব অধিকার।'
      },
      {
        termEn: 'Necessary Party [Sec 53A]',
        definitionEn: 'A party without whose joinder no effective Civil Decree can be passed — failure to implead State/BL&LRO u/s 53A renders a suit on vested land defective.',
        termBn: 'আবশ্যিক পক্ষ (Necessary Party) [ধারা ৫৩ক]',
        definitionBn: 'খাস/পাট্টা/সিলিং বা বর্গা সংক্রান্ত দেওয়ানি মামলায় পশ্চিমবঙ্গ সরকার (কালেক্টর) ও বিএলআরও-কে বিবাদী করা আইনত বাধ্যতামূলক।'
      }
    ],
    keyPoints: [
      'Non-joinder of State/DL&LRO/BL&LRO u/s 53A makes a Title Suit involving vested land liable to fail.',
      'Serve mandatory Section 80 CPC notice (or obtain Sec 80(2) urgent leave) before suing State & Revenue Officer.',
      'Governs Jalkar, Hat, and Ferry Ghat settlement disputes.'
    ],
    keyPointsBn: [
      'ধারা ৫৩ক লঙ্ঘন করে রাষ্ট্র বা বিএলআরও-কে পক্ষ না করলে খাস জমি সংক্রান্ত দেওয়ানি মামলা ত্রুটিপূর্ণ হয়।',
      'রাজস্ব আধিকারিককে পক্ষ করার পূর্বে সিপিসি ধারা ৮০ অনুযায়ী ২ মাসের নোটিশ (বা জরুরি ক্ষেত্রে ৮০(২) অনুমতি) প্রয়োজন।',
      'জলকর, হাট ও খেয়াঘাট ইজারার বিরোধ নিষ্পত্তিতে ধারা ৫২ প্রযোজ্য।'
    ],
    relevance: 'Essential pleading check before drafting any Civil Title Suit or Injunction affecting vested/patta land.',
    relevanceBn: 'খাস, পাট্টা বা বর্গা সংক্রান্ত দেওয়ানি মামলা দায়েরের পূর্বে অবশ্যপাঠ্য।'
  },
  {
    id: 'wblr-sec-54-55',
    category: 'wblract',
    chapter: 'appeal',
    chapterTitle: 'Chapter VIII — Management, Appeals & Suits (Sec 52–63)',
    chapterTitleBn: 'অধ্যায় ৮ — ব্যবস্থাপনা, আপিল ও দেওয়ানি মামলা (ধারা ৫২–৬৩)',
    section: 'Sections 54 & 55',
    sectionBn: 'ধারা ৫৪ ও ৫৫',
    title: 'Statutory Appeals Against Revenue Officer Orders & Limitation Periods (30 / 60 Days)',
    titleBn: 'রাজস্ব আধিকারিকের আদেশের বিরুদ্ধে আপিল ও তামাদি সময়সীমা (৩০ / ৬০ দিন)',
    amendedNote: 'Read with West Bengal Land Reforms & Tenancy Tribunal Act, 1997 (WBLRTT Jurisdiction)',
    amendedNoteBn: 'পশ্চিমবঙ্গ ভূমি সংস্কার ও প্রজাস্বত্ব ট্রাইব্যুনাল আইন, ১৯৯৭ (WBLRTT)-এর সাথে পঠিতব্য',
    textEn:
      'Section 54(1): Subject to special provisions, an appeal lies from orders passed by a Revenue Officer/Collector: (a) against BL&LRO/Revenue Officer order — to Collector/DL&LRO; (b) further challenge against DL&LRO appellate order lies before WBLRTT u/s 6 & 10 of WBLRTT Act, 1997. Section 55 specifies Limitation: 30 days (to Collector/SDO/Revenue Officer appellate forum) and 60 days (to Commissioner / as prescribed); Section 5 of Limitation Act applies for delay condonation.',
    textBn:
      'ধারা ৫৪(১): এই আইনের অধীন রাজস্ব আধিকারিকের যেকোনো আদেশের বিরুদ্ধে আপিল দায়ের করা যায় — বিএলঅ্যান্ডএলআরও-এর আদেশের বিরুদ্ধে কালেক্টর / ডিএলঅ্যান্ডএলআরও-এর নিকট এবং পরবর্তী প্রতিকার পশ্চিমবঙ্গ ভূমি সংস্কার ও প্রজাস্বত্ব ট্রাইব্যুনাল (WBLRTT)-এ। ধারা ৫৫ আপিলের তামাদি সময়সীমা (বিধিমতে ৩০ দিন বা ৬০ দিন) নির্ধারণ করে এবং বিলম্ব মকুবের জন্য তামাদি আইনের ৫ ধারা প্রযোজ্য হয়।',
    definitions: [
      {
        termEn: 'Appellate Forum Hierarchy [Sec 54]',
        definitionEn: 'Original order by BL&LRO → First Appeal to DL&LRO/Collector u/s 54 → Original Application (O.A.) before WBLRTT (Kolkata) → Division Bench of Calcutta High Court.',
        termBn: 'আপিলের স্তরবিন্যাস [ধারা ৫৪]',
        definitionBn: 'বিএলঅ্যান্ডএলআরও-এর আদেশ → ডিএলঅ্যান্ডএলআরও/কালেক্টরের নিকট ধারা ৫৪ আপিল → WBLRTT ট্রাইব্যুনালে মূল আবেদন (O.A.) → কলকাতা হাইকোর্টের ডিভিশন বেঞ্চ।'
      },
      {
        termEn: 'Condonation of Delay [Sec 55 r/w Sec 5 Limitation Act]',
        definitionEn: 'Application showing "sufficient cause" (illness, non-service of notice, certified copy delay) requesting Appellate Authority to admit an appeal filed past 30/60 days.',
        termBn: 'বিলম্ব মকুব [ধারা ৫৫ ও তামাদি আইনের ধারা ৫]',
        definitionBn: '৩০/৬০ দিন অতিক্রান্ত হওয়ার পর পর্যাপ্ত কারণ (অসুস্থতা, নোটিশ না পাওয়া, সার্টিফাইড কপির বিলম্ব) দর্শিয়ে আপিল গ্রহণের আবেদন।'
      }
    ],
    keyPoints: [
      'Apply immediately for Certified Copy of Order-sheet — copying time is excluded u/s 12 Limitation Act.',
      'Always attach a separate Section 5 Limitation Act petition with Affidavit if filing beyond prescribed limitation.',
      'Single-bench Writ Petition u/Art 226 before High Court is barred at first instance; remedy lies before WBLRTT.'
    ],
    keyPointsBn: [
      'আদেশ পাওয়ার সাথে সাথে সার্টিফাইড কপির আবেদন করুন — নকল তোলার সময় তামাদি থেকে বাদ যায়।',
      'সময় পেরিয়ে গেলে হলফনামাসহ তামাদি আইনের ৫ ধারায় বিলম্ব মকুবের আবেদন আলাদাভাবে দাখিল করুন।',
      'ডিএলআরও-এর আপিল আদেশের বিরুদ্ধে প্রথমে WBLRTT ট্রাইব্যুনালে আবেদন করতে হয়।'
    ],
    relevance: 'Backbone of all L.R. Appeals (Sec 54), Sec 5 Condonation Petitions, and WBLRTT O.A.s.',
    relevanceBn: 'সমস্ত এল.আর. আপিল (ধারা ৫৪), ধারা ৫ বিলম্ব মকুব এবং WBLRTT মামলার মূল স্তম্ভ।'
  },
  {
    id: 'wblr-sec-56-63',
    category: 'wblract',
    chapter: 'appeal',
    chapterTitle: 'Chapter VIII — Management, Appeals & Suits (Sec 52–63)',
    chapterTitleBn: 'অধ্যায় ৮ — ব্যবস্থাপনা, আপিল ও দেওয়ানি মামলা (ধারা ৫২–৬৩)',
    section: 'Sections 56, 57, 57B & 58–63',
    sectionBn: 'ধারা ৫৬, ৫৭, ৫৭খ ও ৫৮–৬৩',
    title: 'Powers of Inquiry (Sec 57 Summons), Bar of Civil Court u/s 57B & Rule-Making Power',
    titleBn: 'তদন্ত ও সমন ক্ষমতা (ধারা ৫৭ নোটিশ), দেওয়ানি আদালতের বাধা (ধারা ৫৭খ) ও বিধি প্রণয়ন (ধারা ৬০)',
    textEn:
      'Section 56 authorizes entry/survey of land. Section 57 vests Revenue Officers with Civil Court powers under CPC to summon witnesses, examine on oath, and compel production of documents (routine 57-Notice hearings). Section 57B bars Civil Courts from questioning ceiling/vesting/barga matters within Revenue jurisdiction (excluding nullity or violation of natural justice). Sections 58–63 cover good-faith protection, rule-making u/s 60 (WBLR Rules, 1965), and savings.',
    textBn:
      'ধারা ৫৬ রাজস্ব আধিকারিককে জমি পরিদর্শন ও জরিপের ক্ষমতা দেয়। ধারা ৫৭ সাক্ষী তলব, শপথ গ্রহণ ও নথিপত্র দাখিলের জন্য দেওয়ানি আদালতের সমতুল্য ক্ষমতা প্রদান করে (৫৭ ধারার নোটিশ)। ধারা ৫৭খ সিলিং ও খাস সংক্রান্ত বিষয়ে দেওয়ানি আদালতের এখতিয়ার সীমিত করে (তবে প্রাকৃতিক ন্যায়বিচার লঙ্ঘন ব্যতিক্রম)। ধারা ৫৮–৬৩ সরল বিশ্বাসে কৃত কাজের সুরক্ষা ও বিধি প্রণয়নের (ধারা ৬০ — WBLR Rules 1965) ক্ষমতা প্রদান করে।',
    definitions: [
      {
        termEn: 'Section 57 Notice (Summons)',
        definitionEn: 'Quasi-judicial hearing notice issued by BL&LRO/Revenue Officer compelling parties and witnesses to appear with original deeds, khatians, and chain documents.',
        termBn: '৫৭ ধারার নোটিশ (শুনানির সমন)',
        definitionBn: 'মিউটেশন, কনভার্সন বা মিস কেসে বিএলআরও কর্তৃক প্রদত্ত শুনানির নোটিশ — যেখানে মূল দলিল ও কাগজপত্রসহ হাজির থাকতে হয়।'
      },
      {
        termEn: 'Bar of Jurisdiction [Sec 57B]',
        definitionEn: 'Bars Civil Courts from re-deciding vesting/ceiling/barga questions exclusively entrusted to Revenue Authorities, unless the order is null & void or violates natural justice.',
        termBn: 'দেওয়ানি আদালতের এখতিয়ারে বাধা [ধারা ৫৭খ]',
        definitionBn: 'খাস/সিলিং/বর্গা সংক্রান্ত বিষয় রাজস্ব কর্তৃপক্ষের এখতিয়ারভুক্ত হওয়ায় দেওয়ানি আদালতে প্রশ্ন তোলা যায় না — তবে বেআইনি বা শুনানি-বিহীন আদেশ চ্যালেঞ্জযোগ্য।'
      }
    ],
    keyPoints: [
      'Section 57 Notice is the standard hearing notice issued in Mutation, Conversion & Misc Cases.',
      'Section 57B does not bar a Civil Suit challenging an order passed in total violation of natural justice (without notice).',
      'Read with West Bengal Land Reforms Rules, 1965 framed under Section 60.'
    ],
    keyPointsBn: [
      'মিউটেশন, রূপান্তর বা মিস কেসের প্রতিটি শুনানিতে ৫৭ ধারার নোটিশ বাধ্যতামূলক।',
      'শুনানির সুযোগ না দিয়ে বা একতরফা বেআইনি আদেশ দিলে ধারা ৫৭খ দেওয়ানি মামলা আটকাতে পারে না।',
      'ধারা ৬০-এর অধীনে প্রণীত পশ্চিমবঙ্গ ভূমি সংস্কার বিধিমালা, ১৯৬৫ এর সাথে প্রযোজ্য।'
    ],
    relevance: 'Explains legal force of Section 57 hearing notices and Sec 57B jurisdictional bar arguments.',
    relevanceBn: '৫৭ ধারার শুনানির নোটিশ এবং দেওয়ানি আদালতে ৫৭খ ধারার আপত্তি খণ্ডনের জন্য অপরিহার্য।'
  },

  // ============================================================================
  // PART B: WEST BENGAL LAND & LAND REFORMS MANUAL, 1991 (COMPLETE CHAPTERS I–XXI)
  // ============================================================================
  {
    id: 'wblr-manual-ch1-2',
    category: 'wblrmanual',
    chapter: 'manual-admin',
    chapterTitle: 'WBLR Manual 1991 — Chapters I & II (Administrative Setup & Revenue Officers)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ১ ও ২ (প্রশাসনিক কাঠামো ও রাজস্ব আধিকারিক)',
    section: 'Rules 1–20 (Ch. I–II)',
    sectionBn: 'বিধি ১–২০ (অধ্যায় ১–২)',
    title: 'Integrated Land Reforms Hierarchy, Powers, Case Registers & Field Inspection',
    titleBn: 'সমন্বিত ভূমি সংস্কার কাঠামো, আধিকারিকদের ক্ষমতা, কেস রেজিস্টার ও পরিদর্শন বিধি',
    textEn:
      'Chapters I & II establish the unified Land & Land Reforms administration at State (Board of Revenue / LRC), District (DL&LRO), Sub-Division (SDL&LRO), Block (BL&LRO), and Gram Panchayat Revenue Inspector (R.I.) levels, integrating Settlement & Management wings. Prescribes delegation of powers under WBLR Act & WBEA Act, case diaries, Cause Lists, and periodic inspections.',
    textBn:
      'অধ্যায় ১ ও ২-এ রাজ্য (বোর্ড অব রেভিনিউ / এল.আর.সি.), জেলা (ডিএলঅ্যান্ডএলআরও), মহকুমা (এসডিএলঅ্যান্ডএলআরও), ব্লক (বিএলঅ্যান্ডএলআরও) ও গ্রাম পঞ্চায়েত স্তরে রাজস্ব পরিদর্শকের (আর.আই.) সমন্বিত প্রশাসনিক কাঠামো, ক্ষমতা অর্পণ, কেস ডায়েরি, দৈনিক কার্যতালিকা ও পরিদর্শন বিধি বর্ণিত হয়েছে।',
    definitions: [
      {
        termEn: 'Integrated Setup (BL&LRO / SDL&LRO / DL&LRO)',
        definitionEn: 'Merger of Revenue Settlement and Estate Management branches into single-window Block, Sub-Divisional, and District Land Reforms Offices.',
        termBn: 'সমন্বিত ভূমি সংস্কার কাঠামো',
        definitionBn: 'সেটেলমেন্ট ও ম্যানেজমেন্ট দপ্তর একীভূত হয়ে ব্লক (BL&LRO), মহকুমা (SDL&LRO) ও জেলা (DL&LRO) স্তরে একক প্রশাসন ব্যবস্থা।'
      },
      {
        termEn: 'Revenue Inspector (R.I.) & Amin',
        definitionEn: 'Gram Panchayat-level revenue official (R.I.) responsible for field enquiry & Khajna collection, assisted by technical surveyor (Amin).',
        termBn: 'রাজস্ব পরিদর্শক (আর.আই.) ও আমিন',
        definitionBn: 'গ্রাম পঞ্চায়েত স্তরে সরেজমিন তদন্ত ও খাজনা আদায়কারী আধিকারিক (R.I.) এবং মাপজোখ ও ম্যাপ বিশেষজ্ঞ জরিপকর্মী (আমিন)।'
      }
    ],
    keyPoints: [
      'Defines administrative & quasi-judicial hierarchy from RI and Amin up to BL&LRO, SDL&LRO & DL&LRO.',
      'Mandates display of Cause List and chronological order-sheet maintenance for every Revenue Case.',
      'Periodic inspection schedules by DL&LRO/SDL&LRO ensure procedural compliance.'
    ],
    keyPointsBn: [
      'আর.আই. ও আমিন থেকে শুরু করে বিএলআরও, এসডিএলআরও ও ডিএলআরও পর্যন্ত কাজের পরিধি নির্ধারিত।',
      'প্রতিটি মামলার ধারাবাহিক অর্ডারশিট ও দৈনিক কার্যতালিকা (Cause List) সংরক্ষণ বাধ্যতামূলক।',
      'উর্ধ্বতন আধিকারিকদের নিয়মিত দপ্তর পরিদর্শনের নিয়মাবলি নির্ধারিত।'
    ],
    relevance: 'Establishes proper forum hierarchy and procedural accountability in BL&LRO/SDL&LRO/DL&LRO offices.',
    relevanceBn: 'বিএলআরও, এসডিএলআরও ও ডিএলআরও অফিসের এখতিয়ার ও কাজের শৃঙ্খলা বোঝার জন্য সহায়ক।'
  },
  {
    id: 'wblr-manual-ch3',
    category: 'wblrmanual',
    chapter: 'manual-ror',
    chapterTitle: 'WBLR Manual 1991 — Chapter III (Preparation & Revision of Record-of-Rights)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৩ (রেকর্ড-অব-রাইটস প্রণয়ন ও সংশোধন)',
    section: 'Rules 21–40 (Ch. III)',
    sectionBn: 'বিধি ২১–৪০ (অধ্যায় ৩)',
    title: 'Settlement Stages: Traverse, Kistwar, Khanapuri, Bujharat, Attestation & Final Publication',
    titleBn: 'জরিপের ধাপসমূহ: ট্রাভার্স, কিস্তওয়ার, খানাপুরি, বুঝারত, তসদিক ও চূড়ান্ত প্রকাশনা',
    textEn:
      'Chapter III prescribes step-by-step settlement operations u/s 51 & 51A: (1) Traverse & Kistwar (cadastral map drawing by Amin); (2) Khanapuri (preliminary Plot Index & Draft Khatians); (3) Bujharat (explaining entries on spot & resolving Badar/map errors); (4) Attestation / Tasdik (quasi-judicial verification of deeds); (5) Draft Publication u/s 51A(1); (6) Disposal of Objections & Sec 51A(5) Appeals; (7) Final Publication u/s 51A(4).',
    textBn:
      'অধ্যায় ৩-এ ধারা ৫১ ও ৫১ক অনুসারে জরিপ ও রেকর্ড প্রণয়নের ধাপসমূহ বিবৃত: (১) ট্রাভার্স ও কিস্তওয়ার (মৌজা ম্যাপ অঙ্কন); (২) খানাপুরি (প্রাথমিক দাগ ও খতিয়ান লিখন); (৩) বুঝারত (মাঠে উপস্থিত থেকে রায়তদের বুঝিয়ে দেওয়া ও বদর সংশোধন); (৪) তসদিক / অ্যাটেস্টেশন (দলিল যাচাই); (৫) খসড়া প্রকাশনা; (৬) আপত্তি ও আপিল নিষ্পত্তি; এবং (৭) চূড়ান্ত প্রকাশনা।',
    definitions: [
      {
        termEn: 'Kistwar & Khanapuri',
        definitionEn: 'Kistwar is internal boundary survey & drawing of Mouza plot map (16 inch = 1 mile); Khanapuri is preliminary numbering of Dags and filling initial Khatian columns.',
        termBn: 'কিস্তওয়ার ও খানাপুরি',
        definitionBn: 'কিস্তওয়ার হলো মৌজা নকশায় প্রতিটি জমির সীমানা অঙ্কন এবং খানাপুরি হলো প্রাথমিক দাগ নম্বর ও খতিয়ান লেখা।'
      },
      {
        termEn: 'Bujharat & Tasdik (Attestation)',
        definitionEn: 'Bujharat is explaining field draft records to owners on the ground with Badar corrections; Tasdik is formal verification of deeds & title by Revenue Officer.',
        termBn: 'বুঝারত ও তসদিক (অ্যাটেস্টেশন)',
        definitionBn: 'বুঝারত হলো মাঠে দাঁড়িয়ে রায়তদের খসড়া পর্চা বুঝিয়ে দেওয়া ও বদর সংশোধন; তসদিক হলো আধিকারিকের সামনে দলিল যাচাই করে সত্যায়ন।'
      }
    ],
    keyPoints: [
      'Distinguishing Khanapuri, Bujharat, and Tasdik explains historical RS/LR settlement discrepancies.',
      'Badar correction fixes mismatches between drawn Mouza Map area and actual field possession.',
      'Forms the evidentiary benchmark when challenging LR entries.'
    ],
    keyPointsBn: [
      'খানাপুরি, বুঝারত ও তসদিক ধাপগুলো জানলে আর.এস. থেকে এল.আর. রেকর্ডের ভুল সহজে চিহ্নিত করা যায়।',
      'বদর সংশোধনের মাধ্যমে মৌজা ম্যাপ ও বাস্তব দখলের মধ্যকার অমিল ঠিক করা হয়।',
      'এল.আর. খতিয়ানের ভুল প্রমাণে জরিপের নথি গুরুত্বপূর্ণ সাক্ষ্য হিসেবে ব্যবহৃত হয়।'
    ],
    relevance: 'Crucial for Settlement Misc Cases, Sec 51A(5) appeals, and RS-to-LR Hal-Sabek verification.',
    relevanceBn: 'সেটেলমেন্ট মিস কেস, ধারা ৫১ক(৫) আপিল এবং আর.এস. থেকে এল.আর. হাল-সাবেক মিলিয়ে দেখার জন্য জরুরি।'
  },
  {
    id: 'wblr-manual-ch4',
    category: 'wblrmanual',
    chapter: 'manual-mutation',
    chapterTitle: 'WBLR Manual 1991 — Chapter IV (Mutation Rules & Disposal Procedure)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৪ (মিউটেশন বা নামজারি বিধিমালা)',
    section: 'Rules 41–54 (Ch. IV)',
    sectionBn: 'বিধি ৪১–৫৪ (অধ্যায় ৪)',
    title: 'Procedure for Disposal of Mutation Petitions (Succession, Deed Transfer & Notice)',
    titleBn: 'মিউটেশন আবেদন নিষ্পত্তির নিয়মাবলি (ওয়ারিশান, দলিল হস্তান্তর ও ১৫ দিনের নোটিশ)',
    amendedNote: 'Aligned with Banglarbhumi online e-Mutation & Suo Motu LT Notice workflow',
    amendedNoteBn: 'বাংলার ভূমি অনলাইন ই-মিউটেশন ও স্বয়ংক্রিয় এল.টি. নোটিশ পদ্ধতির সাথে সমন্বিত',
    textEn:
      'Petitions for mutation u/s 50 (with Deed/Chain Deeds, Warishan/Death Certificate, up-to-date Khajna receipt & Declaration) are verified through mandatory RI field enquiry on possession and unbroken chain of title back to recorded RS/LR Khatian. Mandatory 15-day statutory notice (Section 57) must be served on all vendors and recorded co-sharers before passing speaking mutation order and issuing corrected Khatian.',
    textBn:
      'ধারা ৫০ এর অধীন মিউটেশনের আবেদনগুলি মূল/প্রত্যয়িত দলিল, ধারাবাহিক চেন-ডিড, ওয়ারিশান সনদ, হাল খাজনার রসিদসহ দাখিলের পর আর.আই.-এর সরেজমিন দখল ও স্বত্ব-পরম্পরা তদন্ত প্রতিবেদনের মাধ্যমে যাচাই করতে হবে। আদেশ দানের পূর্বে বিক্রেতা ও সকল সহ-শরিককে ন্যূনতম ১৫ দিনের নোটিশ (ধারা ৫৭) প্রদান ও শুনানি বাধ্যতামূলক।',
    definitions: [
      {
        termEn: 'Chain of Deeds (Pith Dalil)',
        definitionEn: 'Unbroken chronological sequence of registered sale/gift deeds & Warishan records linking the present buyer back to the last recorded RS/LR Khatian owner.',
        termBn: 'ধারাবাহিক দলিল (চেন ডিড / পিঠ দলিল)',
        definitionBn: 'আদি রেকর্ডীয় মালিক থেকে বর্তমান ক্রেতা পর্যন্ত হস্তান্তরের প্রতিটি ক্রয়-বিক্রয় দলিল ও ওয়ারিশান সনদের অবিচ্ছিন্ন পরম্পরা।'
      },
      {
        termEn: 'Field Enquiry Report (RI Report)',
        definitionEn: 'On-spot verification report submitted by the Revenue Inspector confirming physical possession, land classification, and absence of vesting/patta/barga bars.',
        termBn: 'সরেজমিন তদন্ত প্রতিবেদন (R.I. রিপোর্ট)',
        definitionBn: 'জমিতে প্রকৃত দখল কার, শ্রেণি কী এবং জমি খাস বা পাট্টা কি না তা যাচাই করে রাজস্ব পরিদর্শকের দেওয়া প্রতিবেদন।'
      }
    ],
    keyPoints: [
      'Strict verification of Link Deeds linking vendor to recorded RS/LR raiyat.',
      'Mutation MUST be refused if vendor already exhausted share or transferred Patta/vested land.',
      'Speaking order required with generation of updated e-Khatian on Banglarbhumi.'
    ],
    keyPointsBn: [
      'রেকর্ডীয় মালিক থেকে বিক্রেতার নিকট স্বত্ব আসার সমস্ত পিঠ দলিল যাচাই বাধ্যতামূলক।',
      'বিক্রেতা পূর্বেই তার অংশ বিক্রি করে থাকলে অথবা জমি পাট্টা/খাস হলে মিউটেশন বাতিল হয়।',
      'যথাযথ কারণ দর্শানো আদেশ (Speaking Order) সহ ডিজিটাল ই-খতিয়ান প্রদান করা হয়।'
    ],
    relevance: 'Official standard procedure governing every Mutation Case & Appeal across West Bengal.',
    relevanceBn: 'সমস্ত মিউটেশন মামলা ও আপিল নিষ্পত্তির জন্য বিএলআরও অফিসের আদর্শ কার্যবিধি।'
  },
  {
    id: 'wblr-manual-ch5',
    category: 'wblrmanual',
    chapter: 'manual-ror',
    chapterTitle: 'WBLR Manual 1991 — Chapter V (Record Correction & 10,000 Share Rules)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৫ (রেকর্ড সংশোধন ও ১০,০০০ হিস্যা বিধি)',
    section: 'Rules 55–68 (Ch. V)',
    sectionBn: 'বিধি ৫৫–৬৮ (অধ্যায় ৫)',
    title: 'Correction of Clerical Mistakes (Sec 50A) & 10,000 Share Discrepancies in Khatians',
    titleBn: 'করণিক ভুল সংশোধন (ধারা ৫০ক) ও খতিয়ানের ১০,০০০ হিস্যা গরমিল নিরসন',
    textEn:
      'Governs correction of bona fide clerical mistakes in ROR u/s 50A/51B and resolution of 10,000-share anomalies. In computerized LR Khatians, total share of all co-sharers in an undivided Dag must equal exactly 1.0000 (10,000 parts = 16 Annas in RS). Where total falls short or exceeds 10,000 parts (causing Banglarbhumi lock), a Misc Case is initiated for proportional re-apportionment after field verification and notice to all co-sharers.',
    textBn:
      'অধ্যায় ৫-এ ধারা ৫০ক/৫১খ অনুসারে করণিক ভুল সংশোধন ও খতিয়ানের ১০,০০০ হিস্যা গরমিল নিরসনের নিয়মাবলি বর্ণিত। কম্পিউটারাইজড এল.আর. রেকর্ডে কোনো দাগের সকল শরিকের মোট অংশ অবশ্যই ঠিক ১.০০০০ (১০,০০০ অংশ, যা আর.এস.-এ ১৬ আনা) হতে হবে। কম বা বেশি হলে বাংলার ভূমি পোর্টালে দাগ লক হয়ে যায়, যা মিস কেস ও সকল শরিকের শুনানির মাধ্যমে সমানুপাতিক পুনর্বণ্টন করে সংশোধন করতে হয়।',
    definitions: [
      {
        termEn: '10,000-Share System (16 Anna = 1.0000)',
        definitionEn: 'Decimal share notation in West Bengal LR ROR where the whole plot equals 1.0000 (10,000 parts), replacing traditional Anna-Gonda-Kora-Kranti fractions.',
        termBn: '১০,০০০ হিস্যা পদ্ধতি (১৬ আনা = ১.০০০০)',
        definitionBn: 'এল.আর. খতিয়ানে পুরো দাগকে ১.০০০০ (১০,০০০ অংশ) ধরে শরিকদের অংশ বণ্টন পদ্ধতি — যা আর.এস.-এ ১৬ আনার সমতুল্য।'
      },
      {
        termEn: 'Dag Share Lock (System Anomaly)',
        definitionEn: 'Computer lock on Banglarbhumi preventing mutation/parcha when sum of recorded co-sharer shares in a Dag ≠ 10,000 parts.',
        termBn: 'দাগ লক / হিস্যা গরমিল',
        definitionBn: 'একই দাগে সমস্ত খতিয়ানের অংশ যোগ করে ১০,০০০ অংশের কম বা বেশি হলে কম্পিউটারে মিউটেশন বা পর্চা বন্ধ হয়ে যাওয়া।'
      }
    ],
    keyPoints: [
      'Total Dag share across all Khatians MUST equal 10,000 parts (1.0000).',
      'Explains conversion between Anna-Gonda-Kora-Kranti and LR 10,000 share.',
      'Covers Map/Area (Badar) correction procedures when area in Khatian mismatches possession/deed.'
    ],
    keyPointsBn: [
      'একটি দাগের সকল শরিকের মোট হিস্যা সর্বদা ঠিক ১০,০০০ অংশ (১.০০০০) হতে হবে।',
      'আনা-গণ্ডা-কড়া-ক্রান্তি থেকে ১০,০০০ অংশে রূপান্তরের নিয়ম প্রযোজ্য।',
      'দাগের ক্ষেত্রফল বা নকশার অমিল বদর সংশোধনের মাধ্যমে ঠিক করা হয়।'
    ],
    relevance: 'Primary manual rules cited in 10,000 Share Misc Cases and Khatian/Dag Name Correction petitions.',
    relevanceBn: '১০,০০০ হিস্যা সংশোধন মিস কেস ও খতিয়ানের বানান/পরিমাণ ভুল সংশোধনে সরাসরি ব্যবহৃত।'
  },
  {
    id: 'wblr-manual-ch6',
    category: 'wblrmanual',
    chapter: 'manual-conversion',
    chapterTitle: 'WBLR Manual 1991 — Chapter VI (Conversion of Land Use)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৬ (জমির শ্রেণি পরিবর্তন / কনভার্সন)',
    section: 'Rules 69–82 (Ch. VI)',
    sectionBn: 'বিধি ৬৯–৮২ (অধ্যায় ৬)',
    title: 'Procedure for Land Conversion Applications (Sec 4C), Environmental & Waterbody Safeguards',
    titleBn: 'ধারা ৪গ রূপান্তর আবেদনের কার্যবিধি, পরিবেশ ও জলাশয় সংরক্ষণের শর্তাবলি',
    textEn:
      'Sets procedural rules for conversion u/s 4C: mandatory spot verification by RI/Revenue Officer confirming whether plot is agricultural, fallow, or wetland/waterbody (Doba/Pukur/Khal/Bheri); PCB NOC for industries; bar on converting waterbodies without equal/larger compensatory tank; calculation of conversion fees; and prosecution u/s 4D for illegal conversion.',
    textBn:
      'অধ্যায় ৬-এ ধারা ৪গ অনুযায়ী জমির শ্রেণি রূপান্তর (কনভার্সন) প্রক্রিয়া নির্ধারিত: আর.আই. কর্তৃক সরেজমিন তদন্তে জমি কৃষি, পতিত নাকি জলাশয় (ডোবা/পুকুর/খাল) তা যাচাই; জলাশয় ভরাটে কঠোর নিষেধাজ্ঞা ও প্রযোজ্য ক্ষেত্রে বিকল্প জলাশয় সৃষ্টির শর্ত; নির্ধারিত রূপান্তর ফি আদায় এবং বেআইনি রূপান্তরে ধারা ৪ঘ অনুযায়ী মামলা দায়েরের নির্দেশিকা।',
    definitions: [
      {
        termEn: 'Wetland / Waterbody (Doba / Pukur)',
        definitionEn: 'Natural or excavated low-lying water-retaining plot protected against arbitrary earth-filling under WBLR Act & WB Inland Fisheries Act.',
        termBn: 'জলাশয় / ডোবা / পুকুর',
        definitionBn: 'প্রাকৃতিক বা খননকৃত জলাধার, যা সরকারি বিশেষ অনুমতি ও বিকল্প জলাশয় ব্যতীত ভরাট করা দণ্ডনীয় অপরাধ।'
      },
      {
        termEn: 'Conversion Fee',
        definitionEn: 'Statutory fee paid by Treasury Challan/GRIPS based on area, location (rural/municipal), and target classification (Bastu/Commercial/Industrial).',
        termBn: 'কনভার্সন ফি (রূপান্তর মাশুল)',
        definitionBn: 'গ্রামীণ বা পৌর এলাকা এবং প্রস্তাবিত শ্রেণির (বাস্তু/বাণিজ্যিক/শিল্প) ওপর ভিত্তি করে সরকারি চালানে প্রদেয় রূপান্তর ফি।'
      }
    ],
    keyPoints: [
      'Defines competency limits of BL&LRO, SDL&LRO & DL&LRO for sanctioning Sec 4C conversion.',
      'Mandatory check that adjacent agricultural drainage & irrigation channels remain unobstructed.',
      'Follow-up ROR classification update & re-assessment of Khajna u/s 23.'
    ],
    keyPointsBn: [
      'জমির পরিমাণ ও এলাকা অনুযায়ী বিএলআরও, এসডিএলআরও বা ডিএলআরও-এর অনুমোদনের সীমা নির্ধারিত।',
      'পার্শ্ববর্তী জমির সেচ ও জলনিকাশি ব্যবস্থা যাতে ব্যাহত না হয় তা যাচাই করা বাধ্যতামূলক।',
      'রূপান্তরের পর খতিয়ানে নতুন শ্রেণি (বাস্তু/বাণিজ্যিক) ও সংশোধিত খাজনা ধার্য করা হয়।'
    ],
    relevance: 'Operational blueprint for all Section 4C Conversion cases and Section 4D defense.',
    relevanceBn: 'সমস্ত ধারা ৪গ রূপান্তর আবেদন ও ধারা ৪ঘ প্রতিরোধ মামলার নির্দেশিকা।'
  },
  {
    id: 'wblr-manual-ch7-8',
    category: 'wblrmanual',
    chapter: 'manual-barga-ceiling',
    chapterTitle: 'WBLR Manual 1991 — Chapters VII & VIII (Bargadars & Ceiling-Surplus Vesting)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৭ ও ৮ (বর্গাদার রেকর্ড ও সিলিং-খাস নির্ধারণ)',
    section: 'Rules 83–135 (Ch. VII–VIII)',
    sectionBn: 'বিধি ৮৩–১৩৫ (অধ্যায় ৭–৮)',
    title: 'Barga Recording (Ch. VII), Retention Choice, Big Raiyat Enquiry & Vesting (Ch. VIII)',
    titleBn: 'বর্গা রেকর্ড ও সার্টিফিকেট (অধ্যায় ৭) এবং বিগ রায়ত তদন্ত, রিটেইন চয়েস ও ভেস্টিং (অধ্যায় ৮)',
    textEn:
      'Chapter VII (Rules 83–102): Enquiry procedure u/s 21D for recording Bargadars, issuing Barga Certificates, deciding crop-share/termination cases u/s 17–18, and single-heir nomination u/s 15A. Chapter VIII (Rules 103–135): Processing Form 7A/7AA Returns, Big Raiyat & Benami enquiries u/s 14T(3)/(5), serving retention choice notices, recording vested lands into Collectorate Khatian No. 1, and processing Sec 14Y project exemptions.',
    textBn:
      'অধ্যায় ৭ (নিয়ম ৮৩–১০২): ধারা ২১ঘ অনুযায়ী বর্গাদারের নাম রেকর্ড, বর্গা সার্টিফিকেট প্রদান, ধারা ১৭–১৮ অনুযায়ী ফসলের ভাগ ও বর্গা উচ্ছেদ মামলার নিষ্পত্তি এবং ধারা ১৫ক উত্তরাধিকার নির্ধারণ। অধ্যায় ৮ (নিয়ম ১০৩–১৩৫): ফর্ম ৭ক/৭কক সিলিং রিটার্ন যাচাই, ধারা ১৪ধ(৩)/(৫) অনুযায়ী বেনামি ও অতিরিক্ত জমি নির্ধারণ, রায়তের রিটেইন চয়েস গ্রহণ এবং ন্যস্ত জমি কালেক্টরের খতিয়ান নং ১-এ অন্তর্ভুক্ত করার পদ্ধতি।',
    definitions: [
      {
        termEn: 'Collector\'s Khatian No. 1 (Khas)',
        definitionEn: 'Primary State-owned Khatian maintained for every Mouza into which all ceiling-surplus, acquired, or vested lands are mutated.',
        termBn: 'কালেক্টরের ১ নং খতিয়ান (খাস খতিয়ান)',
        definitionBn: 'প্রতিটি মৌজায় পশ্চিমবঙ্গ সরকারের নামে রক্ষিত মূল খতিয়ান, যেখানে সিলিং-বহির্ভূত ও খাস হওয়া সমস্ত জমি তোলা হয়।'
      },
      {
        termEn: 'Barga Certificate',
        definitionEn: 'Official certificate issued to a recorded bargadar after statutory enquiry u/s 21D confirming cultivated plots and landowner details.',
        termBn: 'বর্গা সার্টিফিকেট',
        definitionBn: 'ধারা ২১ঘ অনুযায়ী সরেজমিন তদন্তে নাম নথিভুক্ত হওয়ার পর বর্গাদারকে প্রদত্ত সরকারি শংসাপত্র।'
      }
    ],
    keyPoints: [
      'Requires independent witnesses from neighbouring plots before recording any new Barga claim.',
      'Vested ceiling-surplus plots are entered in Collector\'s Khatian No. 1 ("Khas") before Patta settlement.',
      'Details verification of post-07.08.1969 registered transfers during 14T proceedings.'
    ],
    keyPointsBn: [
      'নতুন বর্গাদার রেকর্ডের পূর্বে পার্শ্ববর্তী জমির মালিক/সাক্ষীদের বক্তব্য গ্রহণ বাধ্যতামূলক।',
      'ভেস্ট হওয়া জমি প্রথমে ১ নং খাস খতিয়ানে নিয়ে পরে পাট্টা বা বন্দোবস্তের জন্য চিহ্নিত করা হয়।',
      '১৪ধ মামলায় ৭ই আগস্ট ১৯৬৯-এর পরবর্তী দলিলগুলো সিলিং ফাঁকির জন্য ছিল কি না তা খতিয়ে দেখা হয়।'
    ],
    relevance: 'Governs Barga recording/cancellation proceedings and Big Raiyat 14T/7A retention disputes.',
    relevanceBn: 'বর্গা রেকর্ড/বাতিল মামলা এবং বিগ রায়ত ১৪ধ/৭ক রিটেনশন মামলায় প্রযোজ্য।'
  },
  {
    id: 'wblr-manual-ch9-11',
    category: 'wblrmanual',
    chapter: 'manual-patta-sairati',
    chapterTitle: 'WBLR Manual 1991 — Chapters IX, X & XI (Patta, Long-Term Lease & Sairati)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ৯, ১০ ও ১১ (পাট্টা, দীর্ঘমেয়াদি লিজ ও সায়রাতি)',
    section: 'Rules 136–225 (Ch. IX–XI)',
    sectionBn: 'বিধি ১৩৬–২২৫ (অধ্যায় ৯–১১)',
    title: 'Patta Settlement (Ch. IX), Long/Short-Term Leases & Tea Gardens (Ch. X) & Sairati / Jalkar / Mines (Ch. XI)',
    titleBn: 'পাট্টা বণ্টন (অধ্যায় ৯), দীর্ঘমেয়াদি লিজ ও চা-বাগান (অধ্যায় ১০) ও সায়রাতি / জলকর / খনি (অধ্যায় ১১)',
    textEn:
      'Chapter IX (Rules 136–168): Landless priority list via Panchayat Samiti (Bono-O-Bhumi Sanskar Sthayee Samiti), Joint/Female Patta u/s 49, Patta Register, and annulment enquiries u/s 49(2). Chapter X (Rules 169–195): Long-Term Settlement (30/99 years) on Salami & rent for non-agricultural/industrial/tea garden/institutional uses. Chapter XI (Rules 196–225): Settlement of Sairati interests — vested tanks/fisheries (Jalkars) prioritizing Fishermen\'s Co-operatives, Hats, Ferry Ghats, and minor mineral/brickfield permits.',
    textBn:
      'অধ্যায় ৯ (নিয়ম ১৩৬–১৬৮): পঞ্চায়েত সমিতির বন ও ভূমি সংস্কার স্থায়ী সমিতির অনুমোদনে ভূমিহীনদের অগ্রাধিকার তালিকা, যৌথ/মহিলা পাট্টা প্রদান, পাট্টা রেজিস্টার ও ধারা ৪৯(২) পাট্টা বাতিল তদন্ত। অধ্যায় ১০ (নিয়ম ১৬৯–১৯৫): অকৃষি, শিল্প, চা-বাগান ও প্রাতিষ্ঠানিক প্রয়োজনে সেলামি ও বার্ষিক খাজনায় দীর্ঘমেয়াদি লিজ বন্দোবস্ত ও নবায়ন। অধ্যায় ১১ (নিয়ম ১৯৬–২২৫): সায়রাতি স্বত্ব তথা সরকারি পুকুর/জলকর (মৎস্যজীবী সমবায়কে অগ্রাধিকার), হাট-বাজার, খেয়াঘাট ও ইটভাটা/বালিখাদান পরিচালনা।',
    definitions: [
      {
        termEn: 'Salami & Annual Lease Rent',
        definitionEn: 'One-time premium (Salami) fixed as percentage of market land valuation plus recurring annual rent payable for Government Long-Term Settlement (LTS).',
        termBn: 'সেলামি ও বার্ষিক লিজ খাজনা',
        definitionBn: 'সরকারি খাস জমি দীর্ঘমেয়াদি লিজে নেওয়ার সময় জমির বাজারদরের নির্দিষ্ট শতাংশ হিসেবে প্রদেয় এককালীন প্রিমিয়াম (সেলামি) এবং বাৎসরিক ভাড়া।'
      },
      {
        termEn: 'Jalkar Settlement',
        definitionEn: 'Period lease of vested fisheries/tanks/beels with mandatory priority to Primary Fishermen\'s Co-operative Societies.',
        termBn: 'জলকর বন্দোবস্ত',
        definitionBn: 'সরকারি খাস পুকুর, দিঘি বা বিল নির্দিষ্ট মেয়াদের জন্য নিবন্ধিত মৎস্যজীবী সমবায় সমিতিকে অগ্রাধিকার দিয়ে ইজারা প্রদান।'
      }
    ],
    keyPoints: [
      'Patta beneficiary family must hold <1 acre total and permanently reside in locality.',
      'Long-Term Lease (Ch X) requires Collector/State Govt sanction based on valuation & salami.',
      'Jalkar leases (Ch XI) enforce preference to Fishermen Co-operatives before open auction.'
    ],
    keyPointsBn: [
      'পাট্টা প্রাপকের পরিবারের মোট জমি ১ একরের কম ও স্থানীয় বাসিন্দা হওয়া বাধ্যতামূলক।',
      'দীর্ঘমেয়াদি লিজ (অধ্যায় ১০) জমি ও সেলামির পরিমাণ অনুযায়ী কালেক্টর বা রাজ্য সরকার মঞ্জুর করেন।',
      'জলকর ইজারায় মৎস্যজীবী সমবায় সমিতিকে প্রথম অগ্রাধিকার দিতে হয়।'
    ],
    relevance: 'Reference for Patta eligibility/annulment, Govt. lease renewals, and Jalkar/Hat/Ferry/Mineral permits.',
    relevanceBn: 'পাট্টা বাতিল/যোগ্যতা, সরকারি লিজ নবায়ন এবং জলকর/হাট/খেয়াঘাট/বালিখাদান মামলায় প্রযোজ্য।'
  },
  {
    id: 'wblr-manual-ch12-13',
    category: 'wblrmanual',
    chapter: 'manual-tribal-acq',
    chapterTitle: 'WBLR Manual 1991 — Chapters XII & XIII (Tribal Land & Land Acquisition)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ১২ ও ১৩ (উপজাতি জমি ও ভূমি অধিগ্রহণ)',
    section: 'Rules 226–258 (Ch. XII–XIII)',
    sectionBn: 'বিধি ২২৬–২৫৮ (অধ্যায় ১২–১৩)',
    title: 'ST Land Transfer Scrutiny/Restoration (Ch. XII) & Land Acquisition ROR Update (Ch. XIII)',
    titleBn: 'তফসিলি উপজাতির জমি হস্তান্তর যাচাই/পুনরুদ্ধার (অধ্যায় ১২) ও ভূমি অধিগ্রহণ রেকর্ড সমন্বয় (অধ্যায় ১৩)',
    textEn:
      'Chapter XII (Rules 226–242): Detailed enquiry rules before granting Sec 14C permission to transfer Scheduled Tribe land (fair consideration, necessity, no ST buyer), and restoration execution u/s 14E with police assistance if required. Chapter XIII (Rules 243–258): Coordination with LA Collector; mutating acquired plots directly into Requiring Body / Collector Khatian after Award & Possession Certificate; and proportionate Khajna abatement on unacquired remainder.',
    textBn:
      'অধ্যায় ১২ (নিয়ম ২২৬–২৪২): ধারা ১৪গ অনুসারে তফসিলি উপজাতির জমি হস্তান্তরের অনুমতি প্রদানের পূর্বে ন্যায্য বাজারমূল্য, প্রকৃত প্রয়োজন ও উপজাতি ক্রেতার অনুপস্থিতি যাচাই এবং ধারা ১৪ঙ অনুযায়ী বেদখল জমি পুনরুদ্ধার প্রক্রিয়া। অধ্যায় ১৩ (নিয়ম ২৪৩–২৫৮): ভূমি অধিগ্রহণ (এল.এ.) সম্পন্ন হলে এবং দখল হস্তান্তরিত হলে অধিগ্রহণকারী সংস্থা বা সরকারের নামে খতিয়ান পরিবর্তন ও অবশিষ্ট জমির খাজনা সমন্বয়।',
    definitions: [
      {
        termEn: 'Possession Certificate (LA Proceeding)',
        definitionEn: 'Formal handover record issued by Land Acquisition Collector transferring physical possession of acquired land to the Requiring Body (Govt dept/highway/railway).',
        termBn: 'দখল হস্তান্তর শংসাপত্র (অধিগ্রহণ)',
        definitionBn: 'ভূমি অধিগ্রহণ কালেক্টর কর্তৃক অধিগ্রহণকৃত জমির দখল প্রকল্প সংস্থাকে (যেমন হাইওয়ে/রেল/সরকার) বুঝিয়ে দেওয়ার নথি, যার ভিত্তিতে খতিয়ান বদলায়।'
      }
    ],
    keyPoints: [
      'Buyers must verify parent RS/LR caste notations — "ignorance of ST status" is no legal defence.',
      'Acquired plots must be shifted out of private Khatians into State/Requiring Body Khatian to avoid double sale.',
      'Provides abatement procedure for partially acquired holdings.'
    ],
    keyPointsBn: [
      'ক্রেতার "বিক্রেতা উপজাতি ছিলেন জানতাম না" — এই অজুহাত ধারা ১৪ঙ পুনরুদ্ধার মামলায় গ্রহণযোগ্য নয়।',
      'অধিগ্রহণকৃত দাগ ব্যক্তিগত খতিয়ান থেকে বাদ দিয়ে সরকারি খতিয়ানে তোলা বাধ্যতামূলক।',
      'আংশিক জমি অধিগ্রহণ হলে অবশিষ্ট জমির খাজনা আনুপাতিক হারে কমানো হয়।'
    ],
    relevance: 'Used in Tribal Land restoration petitions and correcting ROR entries of acquired plots.',
    relevanceBn: 'উপজাতি জমি পুনরুদ্ধার এবং অধিগ্রহণকৃত জমির খতিয়ান সংশোধন মিস কেসে ব্যবহৃত।'
  },
  {
    id: 'wblr-manual-ch14-15-19',
    category: 'wblrmanual',
    chapter: 'manual-rev-survey',
    chapterTitle: 'WBLR Manual 1991 — Chapters XIV, XV & XIX (Revenue Collection, Amin Survey & Alluvion)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ১৪, ১৫ ও ১৯ (খাজনা আদায়, আমিন মাপজোখ ও চর/নদীভাঙন)',
    section: 'Rules 259–302 & 355–368 (Ch. XIV, XV, XIX)',
    sectionBn: 'বিধি ২৫৯–৩০২ ও ৩৫৫–৩৬৮ (অধ্যায় ১৪, ১৫, ১৯)',
    title: 'Khajna & Register II (Ch. XIV), Amin Boundary Demarcation (Ch. XV) & Char/Diluvion (Ch. XIX)',
    titleBn: 'খাজনা ও রেজিস্টার ২ (অধ্যায় ১৪), আমিন সীমানা নির্ধারণ (অধ্যায় ১৫) ও চর/সিকস্তি বিধি (অধ্যায় ১৯)',
    textEn:
      'Chapter XIV (Rules 259–288): Assessment & collection of Land Revenue & Cesses, Tenants\' Ledger (Register II), numbered Dakhila receipts, and PDR Certificate cases. Chapter XV (Rules 289–302): Boundary Demarcation upon raiyat application and deposit of Amin Survey Fee, verification against Mouza Map & FMB, and pillar fixation. Chapter XIX (Rules 355–368): Management of Char lands, alluvion survey (Sec 12), and diluvion/calamity revenue remission (Sec 11).',
    textBn:
      'অধ্যায় ১৪ (নিয়ম ২৫৯–২৮৮): খাজনা ও সেস ধার্য ও আদায়, প্রজা লেজার (রেজিস্টার ২) সংরক্ষণ, ক্রমিক নং যুক্ত দাখিলা প্রদান এবং খেলাপিদের বিরুদ্ধে পিডিআর সার্টিফিকেট মামলা। অধ্যায় ১৫ (নিয়ম ২৮৯–৩০২): আবেদন ও আমিন ফি জমা সাপেক্ষে মৌজা ম্যাপ মিলিয়ে সরকারি/ব্যক্তিগত জমির সীমানা নির্ধারণ (ডিমার্কেশন)। অধ্যায় ১৯ (নিয়ম ৩৫৫–৩৬৮): চর জমি ব্যবস্থাপনা, পয়স্তি জরিপ ও নদীভাঙন বা প্রাকৃতিক দুর্যোগে খাজনা মকুব/হ্রাস।',
    definitions: [
      {
        termEn: 'Register II (Tenants\' Ledger / Tauzi)',
        definitionEn: 'Block/RI-level demand and collection register recording Khatian-wise annual Khajna, Cesses, arrears, and Dakhila numbers.',
        termBn: 'রেজিস্টার ২ (প্রজা লেজার / তৌজি)',
        definitionBn: 'আর.আই. ও ব্লক দপ্তরে রক্ষিত খতিয়ানভিত্তিক বার্ষিক খাজনা, সেস, বকেয়া ও দাখিলার হিসাব বই।'
      },
      {
        termEn: 'Boundary Demarcation (Amin Survey) [Ch. XV]',
        definitionEn: 'Official measurement by BL&LRO Amin using Mouza Map & chain/digital instruments upon depositing prescribed Govt. survey fee.',
        termBn: 'সীমানা নির্ধারণ / সরকারি আমিন জরিপ [অধ্যায় ১৫]',
        definitionBn: 'নির্ধারিত সরকারি আমিন ফি জমা দিয়ে আবেদনের প্রেক্ষিতে বিএলআরও অফিসের আমিন দ্বারা মৌজা ম্যাপ অনুযায়ী জমির সীমানা চিহ্নিতকরণ।'
      }
    ],
    keyPoints: [
      'Any recorded raiyat can apply to BL&LRO under Chapter XV for official Amin boundary demarcation.',
      'Register II is audited annually against Treasury Challan deposits.',
      'Diluvion abatement under Ch XIX prevents accumulation of arrears on river-eroded land.'
    ],
    keyPointsBn: [
      'অধ্যায় ১৫ অনুযায়ী যেকোনো রেকর্ডীয় রায়ত সরকারি ফি জমা দিয়ে বিএলআরও অফিসে সীমানা চিহ্নিতকরণের (ডিমার্কেশন) আবেদন করতে পারেন।',
      'রেজিস্টার ২-এর হিসাব প্রতি বছর ট্রেজারি চালানের সাথে অডিট করা হয়।',
      'নদীতে তলিয়ে যাওয়া জমির খাজনা অধ্যায় ১৯ অনুসারে মকুব করানো যায়।'
    ],
    relevance: 'Directly applicable to Boundary Demarcation applications, Khajna remission, and Char land disputes.',
    relevanceBn: 'সীমানা চিহ্নিতকরণ (ডিমার্কেশন), খাজনা মকুব ও চর জমি বিরোধ নিষ্পত্তিতে প্রযোজ্য।'
  },
  {
    id: 'wblr-manual-ch16-18-20-21',
    category: 'wblrmanual',
    chapter: 'manual-records-law',
    chapterTitle: 'WBLR Manual 1991 — Chapters XVI–XVIII & XX–XXI (Certified Copies, Litigation, Records & Registers)',
    chapterTitleBn: 'WBLR ম্যানুয়াল ১৯৯১ — অধ্যায় ১৬–১৮ ও ২০–২১ (সার্টিফাইড কপি, মামলা পরিচালনা, নথিপত্র ও রেজিস্টার)',
    section: 'Rules 303–400 (Ch. XVI–XVIII, XX–XXI)',
    sectionBn: 'বিধি ৩০৩–৪০০ (অধ্যায় ১৬–১৮, ২০–২১)',
    title: 'Certified Copies & Maps (Ch. XVI), Suits & WBLRTT Cell (Ch. XVII), Record Room (Ch. XVIII) & Accounts/Registers (Ch. XX–XXI)',
    titleBn: 'সার্টিফাইড কপি ও ম্যাপ (অধ্যায় ১৬), মামলা ও WBLRTT সেল (অধ্যায় ১৭), রেকর্ড রুম (অধ্যায় ১৮) ও হিসাব/রেজিস্টার (অধ্যায় ২০–২১)',
    textEn:
      'Chapter XVI (Rules 303–320): Entitlement to inspect records and obtain Certified Copies of ROR/Parcha, Case Ordersheets, and Mouza Maps on searching & folio fees (Ordinary/Urgent). Chapter XVII (Rules 321–338): Law Cell protocol for defending Civil Suits (Sec 80 CPC / Sec 53A WBLR), preparing Statement of Facts (SOF) before High Court/WBLRTT, and compliance. Chapter XVIII (Rules 339–354): Record Room custody & A/B/C weeding schedules of CS/RS/LR Khatians & Maps. Chapters XX & XXI (Rules 369–400): Cash Book, TR-7 Treasury Challan audit, Register VIII (Vested Land), Register IX (Mutation), and Forms.',
    textBn:
      'অধ্যায় ১৬ (নিয়ম ৩০৩–৩২০): সাধারণ ও জরুরি ভিত্তিতে আর.ও.আর./খতিয়ান, মামলার আদেশনামা এবং মৌজা ম্যাপের প্রত্যয়িত নকল (সার্টিফাইড কপি) প্রদানের নিয়ম ও ফি। অধ্যায় ১৭ (নিয়ম ৩২১–৩৩৮): দেওয়ানি মামলা, হাইকোর্ট ও ডব্লিউবিএলআরটিটি ট্রাইব্যুনালে সরকারি স্বার্থ রক্ষায় এস.ও.এফ. (SOF) প্রস্তুত ও আদালতের আদেশ পালনের বিধি। অধ্যায় ১৮ (নিয়ম ৩৩৯–৩৫৪): সি.এস./আর.এস./এল.আর. খতিয়ান, মৌজা ম্যাপ ও কেস রেকর্ড সংরক্ষণ ও বিনষ্টিকরণ সূচি। অধ্যায় ২০ ও ২১ (নিয়ম ৩৬৯–৪০০): ট্রেজারি চালান (TR-7), ক্যাশবুক অডিট, মিউটেশন রেজিস্টার (নং ৯), খাস জমি রেজিস্টার (নং ৮) ও সরকারি ফর্মসমূহ।',
    definitions: [
      {
        termEn: 'Certified Copy (CC) & Searching Fee [Ch. XVI]',
        definitionEn: 'Authenticated copy of Order-sheet, ROR Khatian, or Mouza Map issued under Revenue Seal for filing in Appeal/Civil Suits/Title Verification.',
        termBn: 'সার্টিফাইড কপি (প্রত্যয়িত নকল) ও সার্চিং ফি [অধ্যায় ১৬]',
        definitionBn: 'আপিল, দেওয়ানি মামলা বা স্বত্ব যাচাইয়ের জন্য নির্ধারিত কোর্ট ফি ও সার্চিং ফি-তে প্রদত্ত খতিয়ান, আদেশনামা বা মৌজা ম্যাপের সিলমোহরযুক্ত নকল।'
      },
      {
        termEn: 'Register VIII & Register IX [Ch. XXI]',
        definitionEn: 'Register VIII records all Vested & Patta lands; Register IX records all Mutation petitions and disposal orders.',
        termBn: 'রেজিস্টার ৮ ও রেজিস্টার ৯ [অধ্যায় ২১]',
        definitionBn: 'রেজিস্টার ৮-এ সমস্ত খাস ও পাট্টা জমির হিসাব এবং রেজিস্টার ৯-এ সমস্ত মিউটেশন মামলার আবেদন ও নিষ্পত্তির রেকর্ড রাখা হয়।'
      },
      {
        termEn: 'Statement of Facts (SOF) [Ch. XVII]',
        definitionEn: 'Detailed chronological para-wise factual report prepared by BL&LRO/DL&LRO Law Cell for State Advocates defending WBLRTT or High Court cases.',
        termBn: 'স্টেটমেন্ট অব ফ্যাক্টস (SOF) [অধ্যায় ১৭]',
        definitionBn: 'হাইকোর্ট বা WBLRTT ট্রাইব্যুনালে সরকারি কৌঁসুলির মাধ্যমে মামলা লড়ার জন্য বিএলআরও/ডিএলআরও দপ্তর থেকে প্রেরিত দফাওয়ারি তথ্য-প্রতিবেদন।'
      }
    ],
    keyPoints: [
      'Urgent Certified Copy applications of Case Order-sheets under Ch. XVI are crucial for Sec 54 Appeal limitation.',
      'Register VIII (Vested Land) and Register IX (Mutation) are the primary inspection registers.',
      'Chapter XVII enforces strict tracking of Sec 53A State joinder notices and WBLRTT compliance.'
    ],
    keyPointsBn: [
      'ধারা ৫৪ আপিলের তামাদি রক্ষার জন্য অধ্যায় ১৬ অনুযায়ী আদেশনামার জরুরি সার্টিফাইড কপি তোলা জরুরি।',
      'রেজিস্টার ৮ (খাস জমি) এবং রেজিস্টার ৯ (মিউটেশন) ভূমি দপ্তরের প্রধান পরিদর্শন রেজিস্টার।',
      'হাইকোর্ট বা WBLRTT-এর আদেশ পালন ও দেওয়ানি মামলার এস.ও.এফ. প্রেরণ অধ্যায় ১৭ দ্বারা নিয়ন্ত্রিত।'
    ],
    relevance: 'Governs Certified Copy applications, Record Room searches, Register VIII/IX audits, and WBLRTT compliance.',
    relevanceBn: 'সার্টিফাইড কপি উত্তোলন, রেকর্ড রুম তল্লাশি, রেজিস্টার ৮/৯ যাচাই এবং ট্রাইব্যুনাল মামলার নথি ব্যবস্থাপনায় ব্যবহৃত।'
  }
];
