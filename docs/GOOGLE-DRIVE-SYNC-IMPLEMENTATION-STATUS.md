# Google Drive sync implementation status

## Verified repository facts

- The app keeps its existing local database in `srk_case_manager_v5`.
- Existing backup/export flows are separate from live synchronisation and must remain unchanged.
- The Android package ID is `in.srk.casemanage`.
- The Android OAuth client ID supplied by the project owner is:
  `955204328722-v1ua9pml2su9smmv5v5ll3071vn03lms.apps.googleusercontent.com`
- The owner reports that the Android OAuth package name and SHA-1 details have been checked and are correct in Google Cloud project `helical-crowbar-513210-p6`.

## Work in this branch

- Added `src/services/driveSyncProtocol.ts` with typed record-level sync envelopes.
- Duplicate changes are recognised by change ID.
- Independent edits to the same record from different devices are surfaced as conflicts rather than resolved by last-write-wins.
- Tombstones are represented explicitly so a deletion can be synchronised without confusing it with a missing record.
- A per-installation device ID helper is provided.
- This protocol module does not authenticate or change the existing local database.
- Added `src/services/googleDriveApi.ts` as a token-in/token-out Drive REST adapter: list folders, create a folder, list files in a selected folder, upload/update JSON, download JSON, and delete a specific Drive file.
- The adapter never stores access tokens and never accepts client secrets or refresh tokens.
- The adapter is not yet connected to the UI or AppContext; it cannot initiate sign-in or background sync by itself.
- Added `src/services/syncJournal.ts`: an append-only local outbox, bounded pending reads, exact-ID acknowledgements, and persistent conflict records/resolution. Corrupt or unsupported journal data fails closed and is not overwritten.
- Added `src/services/syncJournal.test.ts` with Node's built-in test runner. It covers idempotent enqueue, selective acknowledgements, invalid-entry rejection, fail-closed handling of corrupt data, and explicit conflict resolution. `npm test` is included in the Android validation workflow.
- Added `src/services/googleDriveSyncTransport.ts`: it pushes bounded outbox batches to a user-selected Drive folder as immutable one-change-per-file JSON records. Deterministic file names make retries idempotent; local entries are acknowledged only after an existing matching file is found or an upload succeeds. Failed requests leave pending entries intact. This is a transport primitive only; OAuth, remote download/merge, and UI folder selection are not yet connected.
- Added `src/services/googleDriveSyncTransport.test.ts` covering successful upload/acknowledgement, retry detection, failed-upload retention, and mandatory folder selection. The test script includes all three sync test files.
- Added `src/services/companyChangeTracker.ts` and wired it into `AppContext`: local company profile changes, supported record collection additions/edits/deletions, diary entry changes, and workspace deletion are converted into record-level outbox envelopes. User credentials, messages, activity logs, and UI preferences are deliberately excluded. Journal failures are logged without blocking normal offline use.
- Added `src/services/companyChangeTracker.test.ts` for additions/edits, deletion tombstones, nested diary changes, workspace deletion, credential exclusion, and envelope creation. `npm test` now runs both sync test files.
- The journal is a storage primitive only. AppContext mutations are not yet automatically recorded, and no remote changes are applied to live records.

## Still required before live Google Drive sync can be enabled

1. Confirm that the Google Drive API and Google Picker API are enabled in the same Google Cloud project used by the app's OAuth configuration.
2. Obtain the project number (Picker App ID) and a restricted API key for Google Picker.
3. Configure and verify a supported OAuth flow for both Electron/Windows and Capacitor/Android. An Android OAuth client alone does not authenticate the Windows desktop app.
4. Implement platform-specific secure token storage. Client secrets and refresh tokens must never be embedded in Vite assets, APKs, EXEs, or source control.
5. Add and verify platform OAuth, then connect Drive folder selection and the REST adapter to a user-controlled sync screen. Add pagination, retry and incremental transfer coordination.
6. Wire the new journal into every local record mutation and deletion, with migration/recovery tests. Do not upload or replace the complete local database as one last-write-wins file.
7. Add user-visible sync status, manual sync, notifications and recovery controls.
8. Run Android APK and Windows EXE builds and test on actual devices, including offline operation, concurrent edits, deletion, reinstall and recovery.

## Safety status

Live sync is not enabled by this change. The app must not show a connected or synced status until a real authenticated Drive operation succeeds. Existing local records and backup behaviour remain the source of truth until the remaining integration and device tests are complete.
