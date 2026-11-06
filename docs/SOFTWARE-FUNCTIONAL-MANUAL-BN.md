# SRK Case Manager — সম্পূর্ণ সফটওয়্যার কার্যপদ্ধতি ও মডিউল নির্দেশিকা

**Repository:** `kamalgharami-netizen/SRK-Case-Manager`  
**পর্যালোচিত Branch:** `main`  
**তথ্যের ভিত্তি:** Repository-র বর্তমান Source Code, TypeScript Data Model এবং বিদ্যমান Technical Documentation।

> এই নথিতে কোডে থাকা মডিউল ও কার্যপদ্ধতি বর্ণনা করা হয়েছে। যেখানে বাস্তব সার্ভার, Google সংযোগ অথবা ডিভাইসে পরীক্ষা এখনও বাকি, সেখানে সেটিকে সম্পূর্ণ চালু বলে দাবি করা হয়নি।

## ১. সফটওয়্যারের পরিচয়

SRK Case Manager একটি বাংলা ও ইংরেজি-সমর্থিত Legal Chamber এবং West Bengal Land/Court Case Management Software। এর মূল প্রযুক্তি React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Windows-এর জন্য Electron এবং Android-এর জন্য Capacitor।

সফটওয়্যারটি Local-first পদ্ধতিতে তৈরি: চেম্বার ও মামলার মূল তথ্য ডিভাইসে সংরক্ষিত থাকে, ফলে ইন্টারনেট না থাকলেও মূল রেকর্ড ব্যবহারের ব্যবস্থা রয়েছে। Google Drive Sync এবং Backup/Export দুটি পৃথক ব্যবস্থা।

### কোন কোন প্ল্যাটফর্মের জন্য

- **Windows:** Electron Desktop Application; NSIS Installer।
- **Android:** Capacitor Android Application; APK।
- **Development/Web Preview:** Vite development ও preview ব্যবস্থা।

## ২. প্রধান Dashboard ও Navigation

প্রধান Navigation তৈরি হয়েছে `src/components/Sidebar.tsx`-এ এবং বিভিন্ন Page/Screen পরিচালিত হয় `src/App.tsx` থেকে।

Dashboard-এ সক্রিয় Chamber-এর কাজের সারাংশ, মামলা-সংক্রান্ত প্রবেশপথ এবং Backup Status/Reminder দেখানো হয়। Sidebar-এ মামলা, Chamber Tools, Office এবং Statutory কাজ আলাদা বিভাগে সাজানো আছে।

## ৩. Land ও Legal Case Management — ৯টি Register

সফটওয়্যারের TypeScript Data Model-এ ৯টি Case Category নির্ধারিত রয়েছে:

| বিভাগ | কোডে ব্যবহৃত নাম | কাজ |
|---|---|---|
| Mutation Case | `mutation` | নামজারি/রেকর্ডে নাম অন্তর্ভুক্তির মামলা |
| Miscellaneous Case | `misc` | বিবিধ ভূমি/রাজস্ব মামলা, যেমন হিস্যা সংশোধনের আবেদন |
| L.R. Appeal | `lrappeal` | ভূমি রাজস্ব সংক্রান্ত আপিল |
| First Appeal | `firstappeal` | প্রথম আপিল সংক্রান্ত মামলা |
| RTI Matter | `rti` | তথ্য অধিকার আইনের আবেদন ও সংশ্লিষ্ট বিষয় |
| WBLRTT | `lrtt` | West Bengal Land Reforms and Tenancy Tribunal-এর মামলা |
| Conversion Case | `conversion` | জমির শ্রেণি/ব্যবহার পরিবর্তন সংক্রান্ত মামলা |
| Certified Copy | `certcopy` | সার্টিফায়েড কপি আবেদনের হিসাব |
| ROR/PI | `rorpi` | Record of Rights / Plot Information সংক্রান্ত কাজ |

### প্রতিটি Case-এ যে তথ্য রাখার Data Structure রয়েছে

- মামলা নম্বর, আবেদন নম্বর, Docket/GRN নম্বর, Sub-type, Status, Forum।
- Filing Date, Next Date, Hearing Dates, Priority।
- আবেদনকারী/মূল পক্ষ, অপর পক্ষ, একাধিক Applicant/Respondent এবং ঠিকানা।
- Applicant Deed Number, Year, Type, ADSR এবং অন্যান্য দলিল-সংক্রান্ত তথ্য।
- Recorded Owner, Recorded Khatian, Recorded Dag/Plot।
- জেলা, ব্লক, মৌজা, JL No., খতিয়ান, দাগ, জমির পরিমাণ, একক, শ্রেণি, Record Type এবং Survey Stage।
- Grounds, Notes, Bench, Target Officer।
- Chain of Title/Deed Links, Warish/Succession Details।
- Supporting Attachments এবং রেকর্ড তৈরির সময় ও ব্যবহারকারীর পরিচয়।

সব Case Type-এ একই Field বাধ্যতামূলক নয়। Form-এর ধরন অনুযায়ী প্রাসঙ্গিক তথ্য দেখানো হয়।

### Case-সংক্রান্ত প্রধান Screen

- `CaseEntryForm.tsx` — নতুন মামলা নথিভুক্ত করা এবং বিদ্যমান তথ্য সম্পাদনা।
- `CaseDashboard.tsx` — নির্দিষ্ট Case Category-র তালিকা ও Sub-dashboard।
- `CaseDetailModal.tsx` — নির্বাচিত মামলার বিস্তারিত তথ্য।
- `ChainDeedModal.tsx` — Mutation, Misc, L.R. Appeal ও LRTT-র মতো নির্দিষ্ট বিষয়ে দলিলের ধারাবাহিকতা সংরক্ষণ।
- `App.tsx` — Screen পরিবর্তন, Modal, Case Form এবং AI Drafting-এর মধ্যে যাতায়াত নিয়ন্ত্রণ।

## ৪. Daily Cause List / Hearing Management

**Source:** `src/components/CauseList.tsx`

এখানে প্রতিটি Hearing-এর জন্য তারিখ, সময়, Case Number, Forum, Party, Bench/Room এবং Status রাখা যায়।

Status-এর Data Model:
- READY
- PENDING
- ADJOURNED
- DISPOSED

উপলব্ধ কাজের মধ্যে রয়েছে:
- নির্দিষ্ট তারিখ অনুযায়ী Hearing দেখা।
- সব তারিখের তালিকা দেখা।
- নতুন Hearing যোগ করা।
- Cause List Print করা।
- WhatsApp-এ পাঠানোর জন্য Hearing Alert Message তৈরি/খোলার ব্যবস্থা।

WhatsApp Alert তৈরি হওয়া মানেই কোনও WhatsApp Business API বা স্বয়ংক্রিয় Message Gateway সংযুক্ত আছে—এমন নয়। বাস্তবে পাঠানো ডিভাইস/অ্যাপের উপর নির্ভরশীল।

## ৫. Share Calculator

**Source:** `src/components/ShareCalculator.tsx`

এটি জমির অংশ/হিস্যা সংক্রান্ত হিসাবের জন্য পৃথক Tool। ১০,০০০ হিস্যার ভিত্তিতে অংশের অঙ্ক কষার কাজ এই প্রকল্পের অন্যতম উদ্দেশ্য।

গুরুত্বপূর্ণ: Calculator-এর ফলাফল দলিল, খতিয়ান, উত্তরাধিকার ও অন্যান্য মূল নথির সঙ্গে মিলিয়ে যাচাই করতে হবে। এটি সরকারি Banglarbhumi Record Verification Service নয়।

## ৬. AI Legal Drafting Studio

**Source:** `src/components/AiStudio.tsx`, `server.ts`, `src/data/sampleDraftTemplates.ts`

AI Studio-তে বিভিন্ন Case Type অনুযায়ী Drafting Workflow খোলার ব্যবস্থা আছে। নির্দিষ্ট মামলা থেকে AI Studio খুললে Case Type এবং উপলব্ধ Prefilled তথ্য Drafting Session-এ পাঠানো যায়; কাজ শেষে আগের Form/Screen-এ ফেরার Context-ও রাখা হয়।

Repository-তে Chain Deed, Mutation, Misc, L.R. Appeal, First Appeal, RTI, Conversion, LRTT, General এবং Limitation-সংক্রান্ত Sample Draft Template রয়েছে।

Drafting Matter Type-এ রয়েছে:
- RTI Section 6(1), RTI Section 19(1), RTI Section 19(2), General RTI।
- L.R. Appeal, First Appeal, Miscellaneous, Conversion, LRTT।
- Limitation এবং Barga-সংক্রান্ত Drafting।

### AI সংযোগের বাস্তব সীমা

Development Server-এর `server.ts`-এ AI API Route রয়েছে এবং Server-side `GEMINI_API_KEY` ব্যবহার করা হয়। কিন্তু Installed Windows EXE ও Android APK-এর সঙ্গে আলাদা Production Express API Server স্বয়ংক্রিয়ভাবে চলে—এমন ব্যবস্থা নেই।

অতএব:
- AI Route-এর Source Code থাকা মানেই APK/EXE থেকে Cloud AI বর্তমানে ব্যবহার করা যাচ্ছে—এটি প্রমাণিত নয়।
- Installed App-এ Cloud AI চালাতে Secure ও Reachable Backend Deployment এবং সঠিক Endpoint Configuration দরকার।
- API Key, OAuth Secret, Access Token বা Refresh Token Frontend Source/Build-এ রাখা যাবে না।
- AI-র তৈরি আইনি খসড়া দাখিলের আগে ব্যবহারকারী/আইনজীবীর Legal Verification আবশ্যক।

## ৭. Chamber, Client ও Team Management

### ৭.১ Client / Party Registry

**Source:** `PartyRegistry.tsx`

Party Record-এ Client, Opposite Party, Advocate এবং Vendor—এই ধরনের তথ্য রাখা যায়। Name, Phone, Email, Address, Notes, Created At এবং Created By Data Model-এ রয়েছে।

### ৭.২ Team & Roles

**Source:** `TeamRoles.tsx`

কোডে নির্ধারিত Role:
- Admin
- Junior Advocate
- Clerk
- Accountant

User Record-এ Name, Email, Phone, Role, Created At এবং Passcode/Password-সংক্রান্ত Field রয়েছে। Team Screen ও Role Label থাকা মানেই প্রতিটি Action-এর Permission Security Audit সম্পন্ন—এমন দাবি করা হচ্ছে না।

### ৭.৩ Chamber Profile ও Branding

Company/Chamber Record-এ Chamber Name, Type, Bar Council Registration, GST Field, Address, City, State, PIN, Phone, Email, Logo এবং Logo Emblem/Colour-এর তথ্য রাখার ব্যবস্থা রয়েছে। সমর্থিত Screen ও Print Layout-এ Chamber Logo ব্যবহার করা হয়।

## ৮. Document ও Case History

### ৮.১ Document Vault

**Source:** `DocumentVault.tsx`

Chamber-এর নথির Metadata Index রাখে। File Name, Size, Type (PDF/DOC/Image/Other), Date ও Category সংরক্ষণের Data Structure রয়েছে। AI Learned/Tracked Category-র Optional Field-ও আছে।

Vault-এ File Metadata থাকা মানেই কোনও External Cloud Document Management Service সংযুক্ত—এমন নয়।

### ৮.২ Case Diary / Timeline

**Source:** `CaseDiary.tsx`

প্রতিটি Case-এর সঙ্গে Diary Entry যুক্ত করা যায়। Entry Type:
- Hearing
- Order Passed
- Filing
- Notice Received
- Consultation

প্রতিটি Entry-তে Date, Title, Body এবং Optional Next Date রাখা যায়।

### ৮.৩ Chain of Title / Deed History

`ChainLink` Data Model-এ Deed অথবা Warish/Succession Link রাখা যায়। Deed Number, Date, Year, Type, Vendor, Purchaser, একাধিক Vendor/Purchaser, Warish Name/Details, Area, Consideration, Registration Office, Certificate Reference এবং Notes-এর Field রয়েছে।

## ৯. Statutory Library ও Communication

### ৯.১ Statutory Library

**Source:** `StatutoryLibrary.tsx`, `src/data/statutoryData.ts`

আইন ও বিধি-সংক্রান্ত Reference Data দেখার In-app Library। আইন, সংশোধনী, Rules, Notification এবং প্রযোজ্য Case Law সর্বদা সরকারি/প্রামাণিক উৎস থেকে যাচাই করতে হবে।

### ৯.২ Client Communication Center

**Source:** `CommunicationCenter.tsx`

Message Data Model-এ Party ID/Name, Phone, Message Body, Timestamp এবং WhatsApp/SMS Channel Label রয়েছে।

কিন্তু Screen বা Message Model থাকা মানেই SMS Gateway, WhatsApp Business API অথবা Automated Delivery Provider যুক্ত আছে—এমন নয়। বাস্তব Delivery নির্ভর করবে Device/App বা পৃথকভাবে Configure করা Provider-এর উপর।

## ১০. Office Accounts ও Financial Management

### ১০.১ Office Accounts — Income/Expense

**Source:** `OfficeAccounts.tsx`

আয় ও ব্যয়ের Entry-তে Date, Amount, Category, Payment Mode (Cash/Bank/UPI/Other), Optional Party Link/Name, Reference এবং Notes থাকে।

### ১০.২ Client Ledger

**Source:** `ClientLedger.tsx`

Party-ভিত্তিক Charge এবং Receipt Entry রাখা যায়। Date, Amount, Description, Payment Mode ও Reference-এর মাধ্যমে Client Fee, জমা এবং বকেয়া হিসাব রাখা যায়।

### ১০.৩ Cash & Bank Register

**Source:** `CashBankRegister.tsx`

Cash, Bank, UPI বা Other Account তৈরি করা যায়। Opening Balance এবং Optional Bank/Account Details রাখা যায়। Transaction Type:
- Deposit
- Withdrawal
- Transfer In
- Transfer Out

Transaction-এ Date, Amount, Description, Reference এবং Transfer Group ID-র Field রয়েছে।

### ১০.৪ Financial Reports

**Source:** `FinancialReports.tsx`

Office Financial Entry, Client Ledger, Office Account এবং Account Transaction-এর সংরক্ষিত তথ্যের ভিত্তিতে Financial Report দেখানোর Screen। রিপোর্টের নির্ভুলতা নির্ভর করে সঠিক Entry ও Reconciliation-এর উপর।

## ১১. Local Data, Backup ও Data Safety

### ১১.১ Local Database

বর্তমান Business Data Local Storage Key `srk_case_manager_v5`-এ রাখা হয়; আগের Version-এর Storage Data পড়ার Compatibility Logic-ও রয়েছে।

Company Data-র মধ্যে Users, Cases, Parties, Financial Entries, Party Ledger, Office Accounts, Account Transactions, Vault Metadata, Cause List, Diary, Messages, Activity Log এবং Sample Drafts-এর Collection রয়েছে।

### ১১.২ Backup ব্যবস্থা

**Source:** `BackupModal.tsx`, `BackupPathModal.tsx`

সফটওয়্যারে Manual Backup, Application Close-এর সময় Automatic Backup, Backup Status/Reminder এবং Backup Storage Path Configuration-এর ব্যবস্থা রয়েছে।

Backup/Export এবং Google Drive Live Sync এক জিনিস নয়।

**অপরিহার্য Data Safety:** নতুন Build বা Sync পরীক্ষা করার জন্য বিদ্যমান Business Database মুছে ফেলা/Replace করা যাবে না। Upgrade/Restore পরীক্ষা আলাদা Test Chamber-এ করতে হবে এবং Backup যাচাই করতে হবে।

## ১২. Google Drive Two-way Sync

Repository-তে Record-level Sync Architecture-এর উপাদান রয়েছে:

- Local Outbound Change Journal বা Outbox।
- Record Change Envelope এবং Installation-ভিত্তিক Device ID।
- Google Drive API Adapter — Folder/File List, Create, Upload/Update, Download ও নির্দিষ্ট File Delete।
- Remote Change Download এবং Durable Inbox Staging।
- Duplicate Change শনাক্তকরণ।
- একাধিক Device-এ একই Record আলাদাভাবে Edit হলে Conflict Record তৈরি।
- Deletion Tombstone।
- Remote Change সরাসরি Live Case Data-তে বসিয়ে না দিয়ে User Review-এর জন্য Stage করা।
- Async Repository ও Sync Runner।
- Android-এ Sync Metadata-র জন্য Encrypted Native SQLite Storage ও Migration Gate।
- App Foreground-এ Automatic Sync Attempt এবং Backup/Sync Screen থেকে Manual Sync Now।

### Sync-এর যে সীমাবদ্ধতাগুলি স্পষ্টভাবে মনে রাখতে হবে

1. Code বা CI Emulator Test থাকা মানেই বাস্তব Windows↔Android Data Round Trip সফল—এমন নয়।
2. Physical Google Sign-in, Picker, Native Key/Store Persistence, Restart Recovery, Offline Retry, Simultaneous Edit, Deletion Propagation, Device Revocation এবং দুই Device-এর Reconciliation বাস্তব ডিভাইসে পরীক্ষা করা বাকি।
3. Android WorkManager Background Sync এখনও Implemented নয়।
4. Windows Retry App চালু থাকা অবস্থায় Best-effort; App সম্পূর্ণ বন্ধ হলে Sync চলতে থাকে না।
5. একসঙ্গে একাধিক Device Register হলে ১০-Device Registry-র Strict Race-free Enforcement প্রতিষ্ঠিত নয়।
6. বাস্তবে Authenticated Drive Operation সফল না হলে Connected/Synced Status দেখানো উচিত নয়।

বিস্তারিত: `docs/GOOGLE-DRIVE-SYNC-IMPLEMENTATION-STATUS.md`, `MULTI-DEVICE-GOOGLE-DRIVE-SYNC.md`, `LIVE-SYNC-STORAGE-CONSUMER-AUDIT.md`, `PHYSICAL-DEVICE-SYNC-ACCEPTANCE.md`।

## ১৩. Settings ও UI Customisation

Settings-এর Navigation-এ Chamber, Team, Display, Branding, Vault, Backup এবং Sync বিভাগ রয়েছে।

### ১৩.১ Colour Theme — ৯টি

1. Deep Sapphire
2. Steel Graphite
3. Bronze Chamber
4. Deep Courtroom Blue
5. Deep Land Record Green
6. Midnight Navy
7. Graphite Charcoal
8. Forest Emerald
9. Royal Indigo

### ১৩.২ UI Design/Layout Style — ১২টি

1. SRK Reference 3D
2. Modern Blue Workspace
3. Layered Blue Panels
4. Classic Navy Office
5. Executive Legal Suite
6. Royal Blue Chamber
7. Compact Case Desk
8. Soft Blue Workspace
9. Midnight Docket
10. Ocean Command
11. Emerald Chamber
12. Copper Heritage

Colour Theme এবং UI Layout Style পৃথক Preference। Display Settings-এ Information Density, View Mode, Font Size এবং High Contrast Preference-ও রয়েছে। এগুলি Presentation পরিবর্তন করে; Case Record পরিবর্তনের উদ্দেশ্যে নয়।

## ১৪. ভাষা, Navigation ও App Control

- বাংলা ও ইংরেজি অনুবাদ: `src/data/translations.ts`।
- Sidebar-এ Dashboard, Land Case Register, Chamber Tools, Office এবং Statutory Module ভাগ করা।
- Mobile-এ Collapsible Sidebar এবং Page/Form/Modal অনুযায়ী Back Navigation রয়েছে।
- Toast Notification, Exit Confirmation এবং Close-এর সময় Backup Trigger-এর ব্যবস্থা রয়েছে।
- Navigation Footer-এ App Version এবং In-place Update/Replace Action রয়েছে।

## ১৫. প্রধান Data Model

`src/types/index.ts`-এ গুরুত্বপূর্ণ Type/Interface:
- `Company` — Chamber Profile ও তার সব Data Collection।
- `User` — User এবং Role।
- `CaseItem` — মামলা ও সংশ্লিষ্ট তথ্য।
- `LandSchedule` — জমির তপশিল।
- `Applicant`, `Respondent`, `AddressItem` — পক্ষ ও ঠিকানা।
- `ChainLink` — দলিল/উত্তরাধিকার ধারাবাহিকতা।
- `HearingDateItem`, `CauseItem` — Hearing ও Cause List।
- `Party` — Client/অপর পক্ষ/Advocate/Vendor Contact।
- `FinancialEntry`, `PartyLedgerEntry` — আয়-ব্যয় ও Client Ledger।
- `OfficeAccount`, `AccountTransaction` — Cash/Bank Account ও Transaction।
- `VaultFile` — Document Metadata।
- `DiaryEntry` — Case Diary।
- `MessageItem` — Communication Log।
- `ActivityLogItem` — Activity Record।
- `SampleDraftItem` — Draft Template।
- `BackupLogEntry`, `BackupStatusInfo` — Backup History/Status।

## ১৬. Build ও Test Commands

`package.json`-এ বর্তমান Scripts:
- `npm run dev` — Development Server।
- `npm run build` — Vite Production Build।
- `npm run lint` — TypeScript No-Emit Check।
- `npm test` — Serial Test Runner।
- `npm run dist:win` — Windows NSIS Installer Build।
- `npm run cap:sync` — Capacitor Sync।
- `npm run cap:android` — Android Project খোলা।

GitHub Actions Workflow: `.github/workflows/build-android.yml`। Build যাচাই করার সময় নির্দিষ্ট Commit SHA, প্রতিটি Job এবং Artifact পরীক্ষা করতে হবে। CI Emulator Test বাস্তব Android Device Test-এর বিকল্প নয়।

## ১৭. কোনটি কোডে আছে, কোনটি এখনও নিশ্চিত নয়

| বিভাগ | Source Code থেকে যা নিশ্চিত | যা ধরে নেওয়া যাবে না |
|---|---|---|
| Case Register ও Local Data | UI, Data Model ও Local Persistence Code রয়েছে | সব ধরনের বাস্তব মামলা দিয়ে পূর্ণ Field Test হয়েছে |
| Legal Template | Template Data ও Drafting Interface রয়েছে | AI Draft আইনগতভাবে নির্ভুল/দাখিলের জন্য প্রস্তুত |
| Cloud AI | Development Server Route রয়েছে | Installed APK/EXE-তে Deployed Backend সচল |
| Backup | Backup Interface ও Local Backup Logic রয়েছে | Backup মানেই Live Two-way Sync |
| Google Drive Sync | Journal, Inbox, Transport/Coordinator ও Sync UI Path রয়েছে | Physical Two-device Sync সম্পূর্ণ Acceptance পেয়েছে |
| Messaging | Communication Screen ও Message Model রয়েছে | SMS/WhatsApp Provider Gateway যুক্ত এবং Delivery নিশ্চিত |
| Roles | Role Type ও Team Screen রয়েছে | সব Permission Security Audit সম্পন্ন |
| Windows/Android | Packaging Configuration ও Workflow রয়েছে | সর্বশেষ Commit-এর জন্য Release Artifact সফলভাবে যাচাই হয়েছে |

## ১৮. Source Code-এর গুরুত্বপূর্ণ ফাইলের তালিকা

| কাজ | প্রধান ফাইল |
|---|---|
| App Shell ও Navigation | `src/App.tsx`, `Sidebar.tsx`, `Header.tsx` |
| Shared State ও Local Persistence | `src/context/AppContext.tsx`, `src/types/index.ts` |
| Dashboard ও Case Workflow | `Dashboard.tsx`, `CaseDashboard.tsx`, `CaseEntryForm.tsx`, `CaseDetailModal.tsx` |
| Cause List ও Calculator | `CauseList.tsx`, `ShareCalculator.tsx` |
| AI Drafting | `AiStudio.tsx`, `src/data/sampleDraftTemplates.ts`, `server.ts` |
| Party ও Team | `PartyRegistry.tsx`, `TeamRoles.tsx` |
| Document ও Diary | `DocumentVault.tsx`, `CaseDiary.tsx` |
| Statutory ও Communication | `StatutoryLibrary.tsx`, `CommunicationCenter.tsx`, `src/data/statutoryData.ts` |
| Office Finance | `OfficeAccounts.tsx`, `ClientLedger.tsx`, `CashBankRegister.tsx`, `FinancialReports.tsx` |
| Backup ও Sync | `BackupModal.tsx`, `BackupPathModal.tsx`, `src/services/googleDriveSyncRunner.ts`, `googleDriveSyncInbox.ts`, `readySyncStateStorage.ts` |
| Appearance ও Language | `ViewingOptionsModal.tsx`, `ThemeDropdown.tsx`, `src/data/themes.ts`, `src/data/translations.ts` |
| Build Configuration | `package.json`, `.github/workflows/build-android.yml`, `android/`, Electron Entry Files |

---
**নথির শেষ।** এটি Repository-র Source Code-ভিত্তিক Functional Description; Legal Opinion, Security Certification অথবা Physical-device Acceptance Certificate নয়।
