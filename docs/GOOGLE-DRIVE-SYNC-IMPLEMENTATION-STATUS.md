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
- Added `src/services/googleDriveSyncTransport.ts`: it pushes bounded outbox batches to a user-selected Drive folder as immutable one-change-per-file JSON records. Deterministic file names make retries idempotent; local entries are acknowledged only after an existing matching file is found or an upload succeeds. Failed requests leave pending entries intact. This remains a transport primitive; Windows OAuth and official folder selection are now connected, but the transport is not yet called by a live sync coordinator.
- Added `src/services/googleDriveSyncTransport.test.ts` covering successful upload/acknowledgement, retry detection, failed-upload retention, and mandatory folder selection. The test script includes all three sync test files.
- Added `src/services/companyChangeTracker.ts` and wired it into `AppContext`: local company profile changes, supported record collection additions/edits/deletions, diary entry changes, and workspace deletion are converted into record-level outbox envelopes. User credentials, messages, activity logs, and UI preferences are deliberately excluded. Journal failures are logged without blocking normal offline use.
- Added `src/services/companyChangeTracker.test.ts` for additions/edits, deletion tombstones, nested diary changes, workspace deletion, credential exclusion, and envelope creation. `npm test` now runs both sync test files.
- `AppContext` local company changes are automatically collected into the outbox; remote inbox changes are not automatically applied to live records.

## Still required before live Google Drive sync can be enabled

1. Complete Android native Google authorization and test the Windows OAuth + Desktop/Mobile Picker flow in the packaged EXE.
2. Complete and test the secure credential lifecycle on each platform. Client secrets and refresh tokens must never be embedded in Vite assets, APKs, EXEs, or source control.
3. Connect the selected Drive folder and Drive REST adapter to a user-controlled sync coordinator. Add pagination, retry and incremental transfer coordination.
4. Wire the journal into every local record mutation and deletion, with migration/recovery tests. Do not upload or replace the complete local database as one last-write-wins file.
5. Add user-visible sync status, manual sync, notifications and recovery controls.
6. Run Android APK and Windows EXE builds and test on actual devices, including offline operation, concurrent edits, deletion, reinstall and recovery.

## Safety status

Live sync is not enabled by this change. The app must not show a connected or synced status until a real authenticated Drive operation succeeds. Existing local records and backup behaviour remain the source of truth until the remaining integration and device tests are complete.

- Added `src/services/googleDriveSyncInbox.ts` to list and download remote change files with bounded pagination, validate envelopes, deduplicate change IDs, and stage incoming changes in a durable local inbox. Concurrent edits to the same record from different devices are saved as explicit conflicts; local pending changes remain untouched. Remote data is staged only and is not automatically applied to live AppContext.
- Extended `listDriveFiles` with Drive page-token support and added `src/services/googleDriveSyncInbox.test.ts` for staging, conflict detection, inbox deduplication, pagination, and folder validation. The test script now includes four sync test files.

- Fixed record-key isolation in `mergeSyncEnvelopes`: matching record IDs in different companies are now independent and cannot collide.
- Added `src/services/applySyncChanges.ts` as a validated, record-level apply primitive for supported collections, company profile fields, and nested diary entries. It preserves unrelated records, validates payload IDs and collection names, and never automatically deletes a company workspace.
- Added `src/services/applySyncChanges.test.ts` covering collection updates, tombstones, diary changes, workspace-deletion review, invalid payload rejection, and cross-company record isolation. The package test script includes this test file.
- Applying inbox entries is still not wired to AppContext or a user-facing approval screen. This service is deliberately a safe foundation, not a claim that two-way sync is live.


## Local sync status screen

- Added a Sync Status tab to Settings. It reads the local outbox, staged inbox and conflict counts without modifying any stored sync data.
- The screen displays local queue counts and distinguishes Google account authorization from a connected Drive folder or completed synchronisation. It does not display a false connected/synced state.
- The counts can be refreshed manually. This is a local diagnostic screen only; it does not start a Drive request or apply incoming changes.


## Platform secure-token storage foundation

- Added `src/services/secureGoogleTokenStore.ts` as a platform adapter for short-lived Google access tokens.
- Windows uses Electron `safeStorage` through `preload.cjs`; main-process IPC rejects calls from any renderer other than the active application window.
- Android uses `@aparajita/capacitor-secure-storage` 7.1.6, compatible with the project's Capacitor 7 dependency line.
- Browser storage is rejected because the plugin's web implementation is not encrypted.
- The adapter stores the complete access/refresh credential bundle through the platform secure-storage path when the Windows OAuth flow completes. Android native authorization is still outstanding.
- The Android APK + Windows EXE workflow completed successfully for commit `109f3228b6740253dcd1c660c039d50001909a43`. This validates the repository workflow at that commit; it is not a substitute for real-device OAuth and secure-storage testing.


## OAuth implementation progress (2026-10-31)

- Added Windows OAuth authorization-code exchange and refresh-token handling using PKCE; the token endpoint is fixed to Google's HTTPS endpoint, and the native public-client flow does not send a client secret.
- Added validation tests for token responses, refresh-token preservation, callback state, PKCE verifier format, and expiry values.
- Added a credential-bundle lifecycle manager that refreshes expiring access tokens on demand and persists rotated credentials through the platform secure-store interface. Failed refresh requests preserve the existing stored credentials.
- Added encrypted credential-bundle storage adapters for Windows Electron safeStorage and Android secure storage.
- These are tested service foundations only. They are not connected to a sign-in screen or sync coordinator. Android native Google authorization, a verified Windows Desktop OAuth client ID, revocation/reconnect handling, folder picker configuration, and end-to-end device testing remain outstanding.
- The Android signing keystore previously tracked at `android-keystore/srk-fixed.keystore` has now been removed from the current branch and signing-key file patterns are ignored. **This deletion does not remove the key from earlier Git commits. Treat that signing key as exposed and replace/rotate it before using it for a release.** Update the Android OAuth SHA-1 registration to match the replacement signing certificate. Never commit the replacement keystore or its passwords.
- Latest verified GitHub Actions run for commit `e58f736e3ff873b39a4846165adb8c016477afc5`: Windows EXE, Android APK and build-status jobs all succeeded. This build preceded the keystore-removal commits; a fresh build is required to validate the latest branch state.


## Windows OAuth client ID supplied (2026-10-31)

- The project owner supplied this separate Windows Desktop OAuth client ID: `955204328722-um7epi871el2cuentnti4rq5obofh4ih.apps.googleusercontent.com`.
- It is different from the Android OAuth client ID. The owner should ensure its Google Cloud application type is **Desktop app** and that it belongs to project `helical-crowbar-513210-p6`.
- The ID has been recorded in the platform setup documentation. This does not yet connect the sign-in UI or enable live Google Drive sync.


## Windows OAuth UI wiring (2026-10-31)

- Added a reusable cryptographically random OAuth state helper and allowed the Windows PKCE request builder to use that pre-generated state so it can be matched to the Electron loopback listener before opening the system browser.
- Added the Windows sign-in orchestration service and connected it to Settings > Sync Status.
- Google credentials are stored using the existing secure credential-bundle adapter; disconnect removes only this app's locally stored credentials and does not delete any Drive files.
- This stage completes Windows account authorization wiring only. It does not choose a Drive folder, perform a Drive API read/write, transfer local case records, or enable automatic/two-way sync.


## Windows Desktop/Mobile Picker folder selection (2026-10-31)

- The owner confirmed that Google Picker API is enabled in Cloud project `helical-crowbar-513210-p6`.
- Windows OAuth now requests only `drive.file` and adds Google's required `prompt=consent` and `trigger_onepick=true` parameters, plus `allow_folder_selection=true` and `access_type=offline`.
- The loopback callback validates OAuth state and parses `picked_file_ids`; the Windows flow requires exactly one selected item and verifies through Drive API metadata that it is a Google Drive folder.
- The selected folder ID and name are stored locally as configuration; OAuth credentials remain in encrypted platform storage. Disconnect removes both local credentials and local folder selection but does not delete Drive data.
- The Settings > Sync Status screen displays the selected folder and explicitly states that live sync is still inactive.
- This stage does not upload/download case data, run automatic sync, implement Android authorization, or complete conflict approval.
- Official reference: https://developers.google.com/workspace/drive/picker/guides/desktop-mobile-picker


## Android Native Google Drive authorization (2026-10-31)

- Added a local Capacitor plugin at `capacitor-google-drive-auth/` using Google Play services Identity AuthorizationClient; it is registered through Capacitor plugin autolinking.
- Android authorization requests only `https://www.googleapis.com/auth/drive.file`, opts out of previously granted scopes, and uses the official Picker OAuth trigger plus folder-selection resource parameters.
- The native authorization activity returns the access token, granted scopes and Picker `picked_file_ids` to the TypeScript service. The service requires exactly one item and verifies its MIME type through Drive API before saving the folder.
- Access tokens are saved only through the existing Android Keystore-backed secure storage adapter. Android's native authorization SDK provides a short-lived access token; the service records a conservative expiry and can request a fresh token without reopening the Picker.
- The selected folder ID/name uses the same local configuration key as Windows. No case data is uploaded or downloaded by this authorization stage.
- The Android OAuth client is associated with the app's package ID `in.srk.casemanage` and signing certificate fingerprint in Google Cloud; the Identity SDK uses the installed app identity. The release signing certificate must match the SHA-1 configured on the Android OAuth client.
- Live/two-way sync, conflict approval, scheduled/automatic sync and actual device authorization testing remain outstanding.
- Official references: https://developers.google.com/workspace/drive/picker/guides/desktop-mobile-picker and https://developers.google.com/android/reference/com/google/android/gms/auth/api/identity/AuthorizationClient

## Latest implementation update (2026-10-31)

The following items supersede earlier notes above that described these components as not yet wired:

- Added the Android native Google authorization and folder-selection flow alongside the Windows PKCE + Picker flow. Both platforms use the shared selected-folder configuration.
- Added a bounded Google Drive sync coordinator. A manual **Sync Now** action pulls remote change files into the review inbox, then pushes pending local change envelopes. It does not automatically apply remote changes to the live case database.
- Windows access tokens are refreshed on demand using the stored refresh token. Android authorization is renewed through the native authorization flow when the short-lived access token approaches expiry.
- The Sync Status screen now shows the manual sync action, transfer counts and pagination continuation status.
- Remote change IDs are persisted in the inbox's seen-ID ledger (bounded to the latest 10,000 IDs). Acknowledged changes and conflicts are skipped on later pulls instead of being downloaded and staged repeatedly.
- Drive pagination continuation tokens are stored per selected folder so a later manual sync can continue after the configured page limit.
- Added side-by-side Conflict Review with explicit **Keep Local Version** and **Use Remote Version** actions. Choosing the remote version applies that validated record locally; either choice queues a new resolution envelope for the next sync.
- Fixed conflict resolution so the original local pending change is superseded after the selected resolution envelope has been safely queued, preventing the original and resolution versions from both being uploaded.
- Added tests for acknowledged-change deduplication, conflict deduplication, and local-choice conflict resolution.

### Build verification

- GitHub Actions run #215, commit `40252b0001e670a361d82ba284a86dc2eab57dbd`, completed successfully: signed Android APK and Windows installer artifacts were built and uploaded. This verifies that commit's source and workflow.
- Subsequent commits add the persistent seen-ID ledger, pagination continuation and Conflict Review UI. Their latest GitHub Actions run must also pass before these newest changes are treated as build-verified.
- Real Android/Windows device sign-in, Picker, Drive upload/download and cross-device record consistency still require manual device testing. CI success alone does not prove end-to-end Google Drive sync.
- Automatic/background sync is not yet implemented. Sync currently requires the user to press **Sync Now**.
- PR #7 remains open and Draft; it has not been merged.

## Verification update (2026-10-31 — Build #232)

- Commit: `27194e94ad292cdad6c312c69a9be89a6681628a`.
- GitHub Actions run #232 completed with conclusion `success`.
- Android job: TypeScript check, sync safety tests, web build, Capacitor sync, signed Release APK build, and APK artifact upload all succeeded.
- Windows job: dependency installation, Windows installer build, and EXE artifact upload all succeeded.
- Uploaded artifacts: `SRK-Case-Manager-Android-APK` (4,293,453 bytes) and `SRK-Case-Manager-Windows-EXE` (115,822,522 bytes). GitHub artifact retention expiry shown for this run: 2026-11-14.
- Windows foreground renderer now retries sync every 15 minutes while the app remains running, including when its window is minimized. It does not run after the application exits.
- Android periodic WorkManager sync is **not implemented**. The current sync journal, inbox, selected-folder setting, and pagination cursor are stored in the WebView's `localStorage`; the OAuth access token is held separately in Android Keystore-backed secure storage. A native worker cannot safely execute the current TypeScript sync pipeline or access the WebView's localStorage. Android background sync therefore requires a deliberate shared persistence/native sync design and a verified credential-renewal strategy; it must not be simulated by copying tokens into ordinary preferences.
- Windows sync after full application exit is also **not implemented**. The current periodic retry runs only while the Electron renderer is alive.
- Incoming remote records remain staged for review; this build does not silently overwrite the live case database.
- CI success confirms compilation and packaging, not real-device Google OAuth, Drive Picker, offline/reconnect, or two-device end-to-end behavior. Those still require manual device testing.

