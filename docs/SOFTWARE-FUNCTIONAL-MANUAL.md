# SRK Case Manager — Software Functional Manual

**Repository:** `kamalgharami-netizen/SRK-Case-Manager`  
**Branch reviewed:** `main`  
**Documentation basis:** source files and project documentation present in the repository at the time this file was prepared.

> This manual describes the modules and data structures found in the source. It distinguishes implemented application screens from integrations that still require deployment or physical-device acceptance. A menu item or code module is not, by itself, proof that every external service is production-ready.

## 1. Product overview

SRK Case Manager is a bilingual (Bengali/English) legal chamber and West Bengal land/court matter management application. The project uses React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Electron for Windows packaging, and Capacitor for Android packaging.

The application is designed around a local-first model: chamber and case records are stored locally so core record work can continue without an internet connection. Google Drive synchronisation is a separate integration; it must not be confused with the local backup/export function.

### Supported package targets

- **Windows:** Electron desktop application; NSIS installer target.
- **Android:** Capacitor Android application; APK target.
- **Web development/preview:** Vite-based development and preview scripts.

## 2. Main application navigation

The main navigation is defined in `src/components/Sidebar.tsx` and page rendering is coordinated by `src/App.tsx`.

### 2.1 Dashboard

The main dashboard provides the chamber's operational overview and shortcuts into case categories and work areas. Dashboard data is based on the active chamber/company and its stored records. The dashboard also displays backup reminders/status information.

### 2.2 Land and legal case registers

The source defines the following nine case categories:

| Register | Internal type | Intended work |
|---|---|---|
| Mutation Case | `mutation` | Mutation/name-recording matters |
| Miscellaneous Case | `misc` | Miscellaneous revenue/land proceedings, including share correction matters |
| L.R. Appeal | `lrappeal` | Land-revenue appeal matters |
| First Appeal | `firstappeal` | First appeal matters, including RTI first-appeal drafting category |
| RTI Matter | `rti` | Right to Information applications and related matters |
| WBLRTT | `lrtt` | West Bengal Land Reforms and Tenancy Tribunal matters |
| Conversion Case | `conversion` | Land-use/classification conversion matters |
| Certified Copy | `certcopy` | Certified-copy application tracking |
| ROR/PI | `rorpi` | Record-of-Rights / plot-information matters |

Each case record can store, where applicable:
- Case/application/docket/GRN numbers, subtype, status, forum, filing date and next date.
- Applicant/party and opposite-party details.
- Applicant deed details, recorded owner/khatian/dag details and other matter-specific references.
- District, block, mouza, JL number, khatian, dag/plot, land area, unit, classification, record type and survey stage.
- Multiple applicants, respondents and addresses.
- Hearing dates, hearing stages, priority, grounds, notes, bench and target officer.
- Chain-of-title links, deed particulars, warish/succession details and supporting attachments.
- Creation timestamp and creator identity.

The actual fields shown in a form can vary by case type. The type model is in `src/types/index.ts`; the form and case list/detail components control the UI.

### 2.3 Case entry, editing and detail

- `CaseEntryForm.tsx` is the case creation/editing interface.
- `CaseDashboard.tsx` is the category-specific case dashboard/list view.
- `CaseDetailModal.tsx` presents a selected case's detailed information.
- The application supports opening a case-specific AI drafting workflow and returning to the originating form/context.
- A chain-deed interface is available for relevant Mutation, Miscellaneous, L.R. Appeal and LRTT matters.

## 3. Hearing and cause-list management

**Component:** `src/components/CauseList.tsx`

The Daily Cause List records hearings with:
- Date and time.
- Case number and forum.
- Party/litigant name.
- Bench/room, where supplied.
- Hearing status: READY, PENDING, ADJOURNED or DISPOSED.

The screen supports date filtering, showing records for a selected date or across dates, adding a hearing, printing the cause list, and preparing a WhatsApp hearing-alert message. External WhatsApp delivery depends on the user's device/application and is not the same as an integrated messaging gateway.

## 4. Share calculator

**Component:** `src/components/ShareCalculator.tsx`

The Share Calculator is a separate chamber tool for land-share calculations. It is intended to assist with co-sharer/share arithmetic, including the project's 10,000-share workflow. The result should be checked against source deeds, record-of-rights and applicable legal facts before being used in a filing. This tool is a calculation aid, not an official land-record verification service.

## 5. AI legal drafting studio

**Component:** `src/components/AiStudio.tsx`; server routes: `server.ts`

The AI Studio provides drafting workflows for supported matter categories. The application can open AI drafting with a selected case type and can pass prefilled case information into a matter-specific drafting session. The source contains sample templates for categories including chain deed, Mutation, Miscellaneous, L.R. Appeal, First Appeal, RTI, Conversion, LRTT, general and limitation-related drafting.

The drafting matter type definitions include:
- RTI Section 6(1), RTI Section 19(1), RTI Section 19(2), general RTI.
- L.R. Appeal, First Appeal, Miscellaneous, Conversion, LRTT.
- Limitation and Barga-related drafting.

### Important AI deployment boundary

The development server exposes AI routes and uses a server-side `GEMINI_API_KEY`. The installed Electron and Android packages do not themselves provide a separately deployed production Express API service. Therefore:
- Source code for AI routes does not prove that cloud AI is reachable from a released APK/EXE.
- A secure, reachable backend deployment and correct endpoint configuration are required for installed-package cloud drafting.
- API keys and OAuth secrets must remain on a trusted server/native secure boundary, never in frontend source or public build variables.
- AI-generated legal text must be reviewed and legally verified by the user before filing or service.

## 6. Chamber and client administration

### 6.1 Client / Party Registry

**Component:** `PartyRegistry.tsx`

Stores party/contact records. The party type model includes Client, Opposite Party, Advocate and Vendor. Contact data includes name, phone, email, address, notes, creation time and creator.

### 6.2 Team and roles

**Component:** `TeamRoles.tsx`

The type model defines these roles:
- Admin
- Junior Advocate
- Clerk
- Accountant

User records can include name, email, phone, role, creation time and a local passcode/password field. The existence of role labels and a team screen should not be interpreted as proof that every action has been independently security-tested for role-based access.

### 6.3 Chamber profile and branding

The Company/Chamber data model stores chamber name/type, Bar Council registration, GST field, address, city, state, PIN, phone, email, logo and logo-emblem/colour settings. The chamber logo is reused in application areas and printable chamber documents where supported.

## 7. Document and case-history tools

### 7.1 Document Vault

**Component:** `DocumentVault.tsx`

Maintains a chamber-level document index. Vault file metadata includes name, size, file type (PDF, DOC, image or other), date and category. Optional AI-learning/category-tracking fields are also present in the model. A metadata record does not, by itself, guarantee that a cloud document-management service is connected.

### 7.2 Case Diary / Timeline

**Component:** `CaseDiary.tsx`

Stores diary entries associated with a case. Entry types include Hearing, Order Passed, Filing, Notice Received and Consultation. Entries can contain date, title, body and an optional next date.

### 7.3 Chain of title / deed history

The `ChainLink` model can represent deed links or warish/succession links. It can store deed number/date/year/type, vendor and purchaser names, multiple vendors/purchasers, warish names/details, area, consideration, registration office, certificate reference and notes. The chain-deed modal is connected to selected land-case workflows.

## 8. Statutory and communication tools

### 8.1 Statutory Library

**Component:** `StatutoryLibrary.tsx`

Provides an in-app statutory/reference area. The repository also contains `src/data/statutoryData.ts` for statutory reference data. Users must verify current amendments, rules, notifications and binding case law from authoritative sources before relying on a reference.

### 8.2 Client Communication Center

**Component:** `CommunicationCenter.tsx`

The message data model stores party association, party name, phone, message body, timestamp and channel label (WhatsApp or SMS). The model and screen do not establish that a paid SMS/WhatsApp gateway or automated delivery service is configured. Any external send action depends on the connected device/app or separately configured provider.

## 9. Office finance and client balances

### 9.1 Office Accounts (Income and Expense)

**Component:** `OfficeAccounts.tsx`

Stores income/expense entries with date, amount, category, payment mode (Cash, Bank, UPI or Other), optional party link/name, reference and notes.

### 9.2 Client Ledger

**Component:** `ClientLedger.tsx`

Stores party-wise charge and receipt entries. Each ledger item includes party, date, type (charge/receipt), amount, description and optional payment mode/reference. This is intended to track client fees, receipts and outstanding balances.

### 9.3 Cash & Bank Register

**Component:** `CashBankRegister.tsx`

Stores office accounts such as Cash, Bank, UPI or Other, with opening balance and optional bank/account details. Transactions include deposit, withdrawal, transfer-in and transfer-out, amount, date, description, reference and transfer-group ID.

### 9.4 Financial Reports

**Component:** `FinancialReports.tsx`

Provides a reporting view based on stored financial entries, client-ledger entries, office accounts and account transactions. Reports are only as accurate as the data entered and reconciled by the chamber.

## 10. Backup, local storage and data protection

### 10.1 Local-first business data

The application stores its existing company/case data under the local storage key `srk_case_manager_v5`, with compatibility reads for earlier versions. The company data model includes cases, users, parties, financial records, office accounts, vault metadata, cause-list entries, diary data, messages, activity log and sample drafts.

### 10.2 Backup and restore interfaces

Relevant components include `BackupModal.tsx` and `BackupPathModal.tsx`. The app includes manual backup, automatic backup on application close, backup status/reminder information, and backup storage-path configuration. Backup/export is separate from two-way Google Drive synchronisation.

**Data safety rule:** never clear or replace the existing business database merely to test a new build or sync feature. Test upgrade/restore operations on a separate test chamber and verify the backup before any destructive action.

## 11. Google Drive synchronisation

The repository contains a record-level synchronisation architecture with:
- A local outbound change journal (outbox).
- Change envelopes and per-installation device identity.
- Google Drive API adapter for folder/file operations.
- Remote change download and durable inbox staging.
- Duplicate-change detection and bounded/paginated transfer.
- Conflict records for independent edits to the same record.
- Explicit deletion tombstones.
- User-reviewed staged changes rather than silently overwriting live case records.
- Asynchronous repositories and a shared sync runner.
- Android encrypted native SQLite storage for sync metadata and migration checks.
- Automatic foreground sync attempts and a manual Sync Now workflow in the backup/sync interface.

### Sync limitations that must remain visible

- A code path or CI emulator test is not proof of a real Windows↔Android data round trip.
- Physical Google sign-in, Picker, native key/store persistence, restart recovery, offline retry, simultaneous edits, deletion propagation, device revocation and two-device reconciliation require physical-device acceptance testing.
- Android WorkManager background sync is not implemented.
- Windows retry is best-effort while the application remains running; it does not continue after the app is fully exited.
- The 10-device registry is best-effort under simultaneous registrations; strict race-free enforcement is not established.
- Do not display a successful/synchronised state unless an authenticated Drive operation actually succeeds.

See the detailed sync documents in `docs/`: `GOOGLE-DRIVE-SYNC-IMPLEMENTATION-STATUS.md`, `MULTI-DEVICE-GOOGLE-DRIVE-SYNC.md`, `LIVE-SYNC-STORAGE-CONSUMER-AUDIT.md`, and `PHYSICAL-DEVICE-SYNC-ACCEPTANCE.md`.

## 12. Settings and display customisation

The application settings/display interfaces include chamber, team, display, branding, vault, backup and sync areas.

### 12.1 Colour themes

The theme data currently defines nine dark themes:
1. Deep Sapphire
2. Steel Graphite
3. Bronze Chamber
4. Deep Courtroom Blue
5. Deep Land Record Green
6. Midnight Navy
7. Graphite Charcoal
8. Forest Emerald
9. Royal Indigo

### 12.2 UI layout styles

The Viewing Options screen defines twelve separate UI presentation styles:
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

Colour theme and UI layout style are separate preferences. The display settings also include information density, view mode, font size and high-contrast preferences. These preferences change presentation; they are not intended to change case records.

## 13. Language, navigation and application controls

- Bengali and English translations are defined in `src/data/translations.ts`.
- The sidebar groups the dashboard, land-case registers, chamber tools and office/statutory modules.
- Mobile navigation supports a collapsible sidebar and back-navigation through open forms, modals and pages.
- The app includes toast notifications, exit confirmation and backup-on-close behaviour.
- The application version is shown in the navigation footer; an in-place update/replace action is present in the UI.

## 14. Main data entities

The principal TypeScript models in `src/types/index.ts` include:
- `Company`: chamber profile and all chamber-owned collections.
- `User`: chamber user and role information.
- `CaseItem`: a legal/land matter and its associated details.
- `LandSchedule`: land parcel identifiers and area.
- `Applicant`, `Respondent`, `AddressItem`: case parties and addresses.
- `ChainLink`: deed/succession chain information.
- `HearingDateItem`, `CauseItem`: hearing and cause-list records.
- `Party`: client/opposite-party/advocate/vendor contact.
- `FinancialEntry`, `PartyLedgerEntry`: office income/expense and party ledger.
- `OfficeAccount`, `AccountTransaction`: cash/bank accounts and movements.
- `VaultFile`: document metadata.
- `DiaryEntry`: case diary history.
- `MessageItem`: communication log entry.
- `ActivityLogItem`: user activity record.
- `SampleDraftItem`: reusable legal-drafting template.
- `BackupLogEntry`, `BackupStatusInfo`: backup history/status.

## 15. Build and quality checks

The project scripts in `package.json` include:
- `npm run dev`: development server.
- `npm run build`: Vite production web build.
- `npm run lint`: TypeScript no-emit check.
- `npm test`: serial test runner.
- `npm run dist:win`: Windows NSIS installer build.
- `npm run cap:sync`: Capacitor sync.
- `npm run cap:android`: open Android project.

The maintained GitHub Actions workflow is `.github/workflows/build-android.yml`. A successful CI run should be checked for the exact commit SHA and its individual jobs/artifacts. Emulator tests are not physical-device tests.

## 16. Important distinction: available code vs release-ready service

| Area | What source establishes | What must not be assumed |
|---|---|---|
| Case registers and local data | UI, data models and local persistence code exist | That every possible workflow has been field-tested |
| Legal templates | Template data and drafting interfaces exist | That AI text is legally correct or filing-ready |
| AI cloud service | Development server routes exist | That installed APK/EXE has a deployed reachable backend |
| Backup | Backup interfaces and local backup logic exist | That backup is equivalent to live two-way sync |
| Google Drive sync | Journal, inbox, transport/coordinator and sync UI paths exist | That real physical two-device sync is accepted |
| Messaging | Communication screen and message model exist | That a provider gateway is connected and delivery is guaranteed |
| Roles | Role types and team UI exist | That all permissions have passed a security audit |
| Windows/Android | Packaging configuration and workflows exist | That every latest source commit has a verified release artifact |

## 17. Source map

| Area | Main source files |
|---|---|
| Application shell/navigation | `src/App.tsx`, `src/components/Sidebar.tsx`, `src/components/Header.tsx` |
| Shared state and local persistence | `src/context/AppContext.tsx`, `src/types/index.ts` |
| Dashboard and case workflows | `src/components/Dashboard.tsx`, `CaseDashboard.tsx`, `CaseEntryForm.tsx`, `CaseDetailModal.tsx` |
| Cause list and calculator | `src/components/CauseList.tsx`, `ShareCalculator.tsx` |
| AI drafting and templates | `src/components/AiStudio.tsx`, `src/data/sampleDraftTemplates.ts`, `server.ts` |
| People/team and documents | `PartyRegistry.tsx`, `TeamRoles.tsx`, `DocumentVault.tsx`, `CaseDiary.tsx` |
| Statutory and communication | `StatutoryLibrary.tsx`, `CommunicationCenter.tsx`, `src/data/statutoryData.ts` |
| Office finance | `OfficeAccounts.tsx`, `ClientLedger.tsx`, `CashBankRegister.tsx`, `FinancialReports.tsx` |
| Backup and sync | `BackupModal.tsx`, `BackupPathModal.tsx`, `src/services/googleDriveSyncRunner.ts`, `src/services/googleDriveSyncInbox.ts`, `src/services/readySyncStateStorage.ts` |
| Appearance and language | `ViewingOptionsModal.tsx`, `ThemeDropdown.tsx`, `src/data/themes.ts`, `src/data/translations.ts` |
| Build configuration | `package.json`, `.github/workflows/build-android.yml`, `android/`, Electron entry files |

---
**End of functional manual.** This document is a source-based description, not a legal opinion, security certification, or physical-device acceptance certificate.
