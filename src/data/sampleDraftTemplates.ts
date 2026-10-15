import { SampleDraftItem } from '../types';

export const INITIAL_SAMPLE_DRAFTS: SampleDraftItem[] = [
  {
    id: 'sample_chain_master',
    category: 'chain',
    title: 'Chain of Title Deed Master Template (চেইন দলিল নমুনা খসড়া)',
    description: 'Chronological recital of sequential deeds for mutation, misc case, and title flow verification.',
    lastUpdated: Date.now(),
    templateText: `CHRONOLOGICAL CHAIN OF TITLE & CONVEYANCE STATEMENT
(মালিকানা স্বত্ব ও ধারাবাহিক দলিল হস্তান্তরের খসড়া বিবরণী)
Before the Competent Revenue Forum / Court: {{FORUM}}
Case Reference No: {{CASE_NO}}
Subject: Land Title Verification & Flow of Ownership

1. PARTICULARS OF THE PRESENT PROCEEDING (মামলার বিবরণ):
• Case Number: {{CASE_NO}}
• Competent Forum: {{FORUM}}
• Present Transferee / Petitioner: {{PARTY}}
• Present Transferor / Opposite Party: {{OPP}}
• Case Sub-Type: {{SUBTYPE}}
• Filing Date: {{FILING_DATE}}
• Next Hearing Date: {{NEXT_DATE}}

2. SCHEDULE OF SUBJECT PROPERTY (সম্পত্তির তপশীল বিবরণ):
• District: {{DISTRICT}}
• Sub-Division / Block: {{BLOCK}}
• Mouza & J.L. No.: {{MOUZA}} (J.L. No. {{JL}})
• Khatian No. (খতিয়ান): {{KHATIAN}}
• Dag No. (দাগ নং): {{DAG}}
• Land Classification (জমির শ্রেণি): {{CLASSIFICATION}}
• Quantum of Land (জমির পরিমাণ): {{AREA}} {{UNIT}}
• Co-Sharer / Transfer Share: {{SHARE}}

3. CHRONOLOGICAL SUMMARY OF REGISTERED VIA DEEDS (ধারাবাহিক ভায়া দলিলের বিবরণ):
{{CHAIN_DEEDS_TABLE}}

4. DETAILED RECITAL & FLOW OF OWNERSHIP (মালিকানা হস্তান্তরের ধারাবাহিক ইতিহাস):
(A) Origin of Title (মূল স্বত্বাধিকারী):
Originally, the schedule land comprised in Mouza {{MOUZA}}, J.L. No. {{JL}}, Khatian No. {{KHATIAN}}, Dag No. {{DAG}} was validly recorded in the name of the original recorded Rayat in C.S. / R.S. settlement records under the Government of West Bengal, with absolute title and peaceful possession.

(B) Successive Registered Conveyances (পর্যায়ক্রমিক হস্তান্তর বিবরণ):
{{CHAIN_DEED_NARRATIVE}}

(C) Present Title & Lawful Possession of {{PARTY}}:
By virtue of the latest registered deed(s) and physical possession delivered on spot, the petitioner {{PARTY}} has acquired indefeasible, valid, unencumbered right, title, interest, and physical possession over the schedule land. The said land is not vested in the State under Section 14Z or Section 14M of the WBLR Act 1955, nor is there any ceiling violation or court attachment.

(D) Advocate Title Conclusion:
The Chain of Title Deeds has been verified chronologically without any break or discrepancy. The petitioner is in exclusive possession and paying revenue to the State. Requisite mutation / relief is prayed to be recorded in favour of the petitioner {{PARTY}}.

Advocate for the Petitioner
Chamber: {{CHAMBER_NAME}}
Bar Council Registration: {{BAR_COUNCIL}}
Place: {{CITY}}, West Bengal
Date: {{TODAY_DATE}}`
  },
  {
    id: 'sample_chain_bengali_master',
    category: 'chain',
    title: 'ধারাবাহিক চেইন দলিল প্রামাণ্য খসড়া (বাংলা মাস্টার টেমপ্লেট)',
    description: 'পশ্চিমবঙ্গ ভূমি ও ভূমি সংস্কার দপ্তর (BL&LRO) সমীপে পর্যায়ক্রমিক স্বত্ব হস্তান্তরের নির্ভুল বাংলা বিবরণী।',
    lastUpdated: Date.now(),
    templateText: `বিজ্ঞ ব্লক ভূমি ও ভূমি সংস্কার আধিকারিক সমীপে: {{FORUM}}
মিউটেশন কেস নং: {{CASE_NO}} | আবেদন নং: {{APP_NO}}
বিষয়: সম্পত্তির ধারাবাহিক স্বত্ব ও মালিকানা হস্তান্তরের প্রমাণ বিবরণী।

১. আবেদনকারী ও মামলার বিবরণ:
• বর্তমান আবেদনকারী: {{PARTY}}
• পিতার / স্বামীর নাম: {{FATHER}}
• ঠিকানা: {{ADDRESS}}
• আবেদনকারীর দলিল নং: {{DEED_NO}} | সাল: {{REG_YEAR}} | ধরন: {{DEED_TYPE}} | অফিস: {{SRO_OFFICE}}
• প্রতিপক্ষ / সহ-অংশীদার: {{OPP}}

২. সম্পত্তির তপশীল বিবরণ:
• জেলা: {{DISTRICT}} | ব্লক: {{BLOCK}}
• মৌজা: {{MOUZA}} (জে.এল. নং {{JL}})
• খতিয়ান নং: {{KHATIAN}} | দাগ নং: {{DAG}}
• জমির শ্রেণি: {{CLASSIFICATION}} | পরিমাণ: {{AREA}} {{UNIT}}

৩. ধারাবাহিক চেইন দলিল ও ওয়ারিশান হস্তান্তরের সূচি:
{{CHAIN_DEEDS_TABLE}}

৪. পর্যায়ক্রমিক স্বত্ব হস্তান্তরের ইতিহাস:
{{CHAIN_DEED_NARRATIVE}}

৫. ঘোষণা ও প্রার্থনা:
উক্ত ধারাবাহিক হস্তান্তরের মাধ্যমে আবেদনকারী {{PARTY}} তফসিলভুক্ত ভূমির নিরঙ্কুশ ও বৈধ দখলদার হইয়াছেন। অতএব, সুবিবেচনাপূর্বক আবেদনকারীর নামে মিউটেশন মঞ্জুর করিতে আজ্ঞা হয়।`
  },
  {
    id: 'sample_mutation_sec50',
    category: 'mutation',
    title: 'Sec 50 WBLR Act Formal Mutation Application Petition (নামজারি আবেদন)',
    description: 'Standard West Bengal revenue petition for transfer of rayat name in land records before BL&LRO.',
    lastUpdated: Date.now(),
    templateText: `BEFORE THE BLOCK LAND & LAND REFORMS OFFICER: {{BLOCK}}
DISTRICT: {{DISTRICT}}, WEST BENGAL

In the matter of:
An application under Section 50 read with Section 51A of the West Bengal Land Reforms Act, 1955.

AND
In the matter of:
Mutation Case No: {{CASE_NO}}

Applicant:
{{PARTY}}, residing at West Bengal.
...Petitioner / Transferee

-VERSUS-
1. {{OPP}}
2. The State of West Bengal, represented by the B.L. & L.R.O., {{BLOCK}}.
...Opposite Parties

MOST RESPECTFULLY SHEWETH:
1. That the petitioner has purchased / acquired land measuring {{AREA}} in Mouza: {{MOUZA}}, J.L. No: {{JL}}, Khatian No: {{KHATIAN}}, Plot / Dag No: {{DAG}}, Classification: {{CLASSIFICATION}} by virtue of Registered Deed of Sale / Gift No. {{DEED_NO}} of {{REG_YEAR}} registered at the office of {{SRO_OFFICE}}.

2. That the vendor had valid, transferable, and marketable title without any encumbrance, and physical delivery of vacant possession was handed over to the petitioner on the date of execution.

3. That the subject land does not exceed ceiling limits under Section 14M and is not hit by Section 14Z of the WBLR Act.

4. That the petitioner has been possessing the said land peacefully and paying all municipal and panchayat taxes.

PRAYER:
In the premises, it is respectfully prayed that Your Honour may kindly be pleased to:
a) Register this Mutation Proceeding;
b) Direct spot enquiry / verification through the Revenue Inspector;
c) Order recording and opening of a separate Rayati Khatian in the name of the Petitioner {{PARTY}} for the schedule land;
And pass such other order or orders as Your Honour may deem fit and proper.

Advocate for the Petitioner`
  },
  {
    id: 'sample_misc_sec50a',
    category: 'misc',
    title: 'Sec 50A WBLR Act Misc Case Petition for Share Correction (১০,০০০ হিস্যা ত্রুটি সংশোধন)',
    description: 'Petition before Revenue Officer / BL&LRO for correction of 10,000 hisya share discrepancy.',
    lastUpdated: Date.now(),
    templateText: `BEFORE THE COMPETENT REVENUE OFFICER / B.L. & L.R.O.: {{BLOCK}}
DISTRICT: {{DISTRICT}}, WEST BENGAL

Misc Case No: {{CASE_NO}}
Under Section 50A / Rule 21 of the West Bengal Land Reforms Act, 1955

Applicant:
{{PARTY}}
...Petitioner

-VERSUS-
1. {{OPP}}
2. The State of West Bengal.
...Opposite Parties

SUBJECT: CORRECTION OF ARITHMETICAL / CLERICAL ERROR IN 10,000 SHARE DISTRIBUTION (হিস্যা ত্রুটি সংশোধন)

RESPECTFULLY SHEWETH:
1. That the petitioner is a recorded co-sharer in respect of Mouza: {{MOUZA}}, J.L. No: {{JL}}, Khatian No: {{KHATIAN}}, Dag No: {{DAG}}.

2. That due to an erroneous clerical calculation during computerized data entry in the Banglarbhumi portal, the petitioner's genuine share of {{SHARE_CORRECT}} has been erroneously recorded as {{SHARE_WRONG}}, creating a mathematical shortfall and prejudice to petitioner's title.

3. That the petitioner's registered title deed clearly confirms the purchase of {{AREA}} out of total plot quantum.

PRAYER:
It is therefore prayed that Your Honour may kindly be pleased to cause an enquiry, verify the ancestral Farayez / registered deed shares, and pass an order correcting the 10,000 share entry in Khatian No: {{KHATIAN}} in accordance with Section 50A of the Act.

Advocate for the Petitioner`
  },
  {
    id: 'sample_lrappeal_sec54',
    category: 'lrappeal',
    title: 'Sec 54 WBLR Act Memo of Appeal before DL&LRO (এল.আর. আপিল মেমো)',
    description: 'Formal Memo of Appeal before District Land & Land Reforms Officer challenging impugned order.',
    lastUpdated: Date.now(),
    templateText: `IN THE COURT OF THE DISTRICT LAND & LAND REFORMS OFFICER
DISTRICT: {{DISTRICT}}, WEST BENGAL

L.R. Appeal Case No: {{CASE_NO}} of {{YEAR}}
Under Section 54 of the West Bengal Land Reforms Act, 1955

In the matter of:
An Appeal against Impugned Order No: {{IMPUGNED_ORDER_NO}} dated {{IMPUGNED_ORDER_DATE}} passed by B.L. & L.R.O., {{BLOCK}} in Mutation Case No: {{LOWER_CASE_NO}}.

{{PARTY}}
...Appellant / Petitioner

-VERSUS-
1. {{OPP}}
2. The State of West Bengal.
...Respondents

MEMORANDUM OF APPEAL:
The Appellant above-named begs to prefer this Memorandum of Appeal against the impugned order on the following amongst other:

GROUNDS:
I. FOR THAT the Learned Lower Authority erred in law as well as in facts in rejecting the Appellant's lawful prayer without appreciating the registered chain deeds.
II. FOR THAT the Learned Authority failed to consider that the Appellant is in actual physical possession of the schedule land.
III. FOR THAT the impugned order was passed in gross violation of natural justice without serving mandatory notice under Section 57.

PRAYER:
The Appellant therefore prays that Your Honour may graciously be pleased to admit the Appeal, stay operation of the impugned order, set aside the order of the Learned Lower Authority, and direct issuance of Khatian in favour of the Appellant.

Advocate for the Appellant`
  },
  {
    id: 'sample_lrtt_tribunal',
    category: 'lrtt',
    title: 'WBLRTT Land Reforms Tenancy Tribunal O.A. Petition (সল্টলেক বিকাশ ভবন ট্রাইব্যুনাল)',
    description: 'Original Application under Section 6 of the W.B. Land Reforms and Tenancy Tribunal Act, 1997.',
    lastUpdated: Date.now(),
    templateText: `BEFORE THE WEST BENGAL LAND REFORMS AND TENANCY TRIBUNAL
AT BIKASH BHAVAN, SALT LAKE, KOLKATA

O.A. No: {{CASE_NO}} of {{YEAR}}

IN THE MATTER OF:
An Application under Section 6 of the West Bengal Land Reforms and Tenancy Tribunal Act, 1997.

AND
IN THE MATTER OF:
{{PARTY}}
...Applicant

-VERSUS-
1. State of West Bengal, service through the Secretary, Land & Land Reforms Dept, Nabanna, Howrah.
2. The District Magistrate and Collector, {{DISTRICT}}.
3. The District Land and Land Reforms Officer, {{DISTRICT}}.
4. The Block Land and Land Reforms Officer, {{BLOCK}}.
5. {{OPP}}
...Respondents

SYNOPSIS & FACTS OF THE CASE:
1. The Applicant is a citizen of India and rightful owner of the subject land situated at Mouza: {{MOUZA}}, J.L. No: {{JL}}, Dag No: {{DAG}}.
2. The Respondent authorities have sat tight over the statutory appeal / representation submitted by the Applicant without passing any reasoned order.
3. Being aggrieved by and dissatisfied with the inaction of the respondent authorities, the Applicant approaches this Learned Tribunal.

PRAYER:
The Applicant most humbly prays that Your Lordships may be pleased to issue a Mandamus directing Respondent No. 3 & 4 to dispose of the proceeding in accordance with law within a stipulated time frame.

Advocate for the Applicant`
  },
  {
    id: 'sample_rti_sec6',
    category: 'rti',
    title: 'RTI Sec 6(1) Information Application Format (তথ্য জানার অধিকার আবেদন)',
    description: 'Application to State Public Information Officer (BL&LRO / DL&LRO) under RTI Act 2005.',
    lastUpdated: Date.now(),
    templateText: `FORM - A
[See Rule 3(1)]
APPLICATION FOR INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To:
The State Public Information Officer (SPIO) & B.L. & L.R.O.
Office of the Block Land & Land Reforms Officer: {{BLOCK}}
District: {{DISTRICT}}, West Bengal.

1. Full Name of the Applicant: {{PARTY}}
2. Address: {{ADDRESS}}
3. Mobile Number: {{PHONE}}

4. Particulars of Information Required:
a) Subject Matter: Certified inspection and records pertaining to Mouza: {{MOUZA}}, J.L. No: {{JL}}, Khatian No: {{KHATIAN}}, Dag No: {{DAG}}.
b) Specific Points:
   i. Certified true copy of the Field Enquiry Report in Case No: {{CASE_NO}}.
   ii. Certified copy of the order-sheet entries from inception till date.
   iii. Current classification and recording status of the subject plot in LR database.

5. Application Fee: Enclosed Indian Postal Order (IPO) / Court Fee Stamp of Rs. 10/- bearing No: {{IPO_NO}}.

Applicant Signature: __________________
Date: {{TODAY_DATE}}`
  },
  {
    id: 'sample_conversion_sec4c',
    category: 'conversion',
    title: 'Sec 4C WBLR Act Land Conversion Format (জমির শ্রেণি পরিবর্তন আবেদন)',
    description: 'Formal application for change of character/classification of land before DL&LRO / BL&LRO.',
    lastUpdated: Date.now(),
    templateText: `BEFORE THE DISTRICT LAND AND LAND REFORMS OFFICER: {{DISTRICT}}
(Through the Block Land & Land Reforms Officer: {{BLOCK}})

Application under Section 4C of the West Bengal Land Reforms Act, 1955
Case No: {{CASE_NO}}

Applicant:
{{PARTY}}

SUBJECT: APPLICATION FOR CONVERSION / CHANGE OF CLASSIFICATION OF LAND FROM '{{OLD_CLASS}}' TO '{{NEW_CLASS}}'

RESPECTFULLY SHEWETH:
1. That the applicant is the absolute owner in possession of Rayati land measuring {{AREA}} comprised in Mouza: {{MOUZA}}, J.L. No: {{JL}}, Khatian No: {{KHATIAN}}, Dag No: {{DAG}}.
2. That the recorded classification of the land is '{{OLD_CLASS}}', but the surrounding locality has undergone comprehensive urbanization.
3. That the proposed change to '{{NEW_CLASS}}' will not disrupt local environment, drainage, or water harvesting.
4. That the applicant is willing to pay necessary conversion fees prescribed under Schedule of the Act.

PRAYER:
It is prayed that after spot inspection and clearance, permission for conversion under Section 4C may kindly be accorded.

Advocate for the Applicant`
  }
];
