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



## Current verification checkpoint (2026-11-01)

- The current sync implementation is wired into the application: local record changes are queued by `AppContext`; the shared runner obtains platform credentials and the selected folder; the coordinator pulls remote changes into the review inbox before pushing local outbox entries; approved remote changes and conflicts are handled through the Sync Status screen.
- Windows attempts foreground sync when the app is visible/online and retries every 15 minutes while the Electron renderer remains alive, including while the window is minimized. It does not run after the app is fully closed.
- Android supports manual sync and foreground attempts. Periodic Android WorkManager sync remains unimplemented because the current TypeScript pipeline uses WebView `localStorage`; a native worker cannot safely use it without a shared native persistence and credential design.
- Android native sync-state migration has an allowlisted copy, read-back verification, source-change detection and rollback/error tests. It is not activated as the live journal store. Do not mark migration rollout complete until a real Android device test verifies migration, app restart, recovery and preservation of existing case data.
- The three previously partial areas now have the following source/CI status:
  1. **Migration safety:** automated tests and Android instrumentation compile/run in CI; real-device migration/recovery validation remains outstanding.
  2. **Two-way sync:** coordinator, outbox, inbox, conflict resolution and platform auth paths are integrated and covered by automated tests; a real Windows-to-Android and Android-to-Windows record round trip, including offline/reconnect and simultaneous edits, remains outstanding.
  3. **Drive folder selection:** Windows and Android authorization flows select exactly one Drive folder and verify its MIME type through Drive metadata; actual Picker/OAuth permission and reconnect checks on both physical platforms remain outstanding.
- GitHub Actions run **#334** (run ID `41327423988`, source commit `3c0d6a4f92601eecad32454b227d67bce14a35d2`) completed successfully on 2026-11-01. Windows EXE build/upload, Android type-check, sync safety tests, web build, Capacitor sync, native instrumentation tests, release signing and signed APK upload all succeeded. This is CI/package verification, not physical-device end-to-end verification.
- A follow-up UI wording correction was committed after run #334 (`d9d81cd853e1bff8262d4290e17df1f2d1fa1f36`): after authorization, Settings now correctly tells the user that Sync Now is available and incoming changes remain staged. A fresh workflow run is required to verify that follow-up commit.
- The Windows backup path selector still requires a separate native folder-picker/file-write implementation before the displayed path can be treated as a verified physical backup destination. Browser download fallback must not be described as writing directly to the selected folder.
- The Android signing key previously committed in repository history remains compromised; rotate it and update the Android OAuth SHA-1 before production release. Never commit the replacement key or passwords.



## Current verification checkpoint (2026-11-02 — GitHub Actions run #362)

- Source commit: `07b72dc2b0757629c26fe9e1025ff2420afc0b1d`.
- Run #362 completed successfully: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41404522993
- Windows EXE build and artifact upload succeeded.
- Android TypeScript checks, sync-journal safety tests, web build, Capacitor sync, native instrumentation tests, release signing, APK signature verification and artifact upload succeeded.
- APK signature verification completed with `apksigner verify --verbose` and certificate fingerprint extraction. The certificate reported by this CI run is:
  - SHA-1: `d58a97a1619be31a29f10d092805853549b22a2e`
  - SHA-256: `c563d37511633a90658b4e519c27db052a773601e133c2c1156c2e55bac8527d`
- These fingerprints identify the certificate used by this particular CI build. They do **not** prove that the historical exposed keystore has been rotated. Until a replacement key is generated, stored only in GitHub Actions secrets, and independently verified, treat the historical key as compromised and do not publish a production release.
- Uploaded artifacts for this run:
  - Android APK: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41404522993/artifacts/13122924899
  - Windows EXE: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41404522993/artifacts/13122912171
- The Android emulator/instrumentation and CI checks are automated validation only. They do not replace real-device Google sign-in, Picker, or Windows↔Android data round-trip testing.
- PR #7 remains open and Draft: https://github.com/kamalgharami-netizen/SRK-Case-Manager/pull/7. Do not merge until the signing-key security gate and physical-device validation are complete.


## Current verification checkpoint (2026-11-02 — GitHub Actions run #368)

- Source commit: `21e965fb436db2b95c770eec9d67ae869e041fb2`.
- GitHub Actions run #368 (run ID `41412277647`) completed successfully: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41412277647
- Windows EXE build and artifact upload succeeded. Artifact: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41412277647/artifacts/13126420842
- Android TypeScript check, sync-journal safety tests, web build, Capacitor sync, native sync-store instrumentation tests on Android Emulator, release APK build, signature verification and artifact upload succeeded. APK artifact: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41412277647/artifacts/13126412755
- Android instrumentation report artifact: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41412277647/artifacts/13126417709
- The successful CI run confirms that the source commit builds and the automated emulator tests pass. It does not establish physical-device Google OAuth/Picker success or a real Windows↔Android Drive round trip.
- Commit `21e965fb436db2b95c770eec9d67ae869e041fb2` clears block, mouza and JL when a schedule's district changes; clears mouza and JL when its block changes; validates a selected block against the selected district; and does not copy the previous schedule's block/mouza/JL into a new schedule.
- Mouza serial/order must never be used as a J.L. number. J.L. must remain a text identifier (not an integer) so leading zeros and official formatting are preserved. District/block/mouza linkage must use verified identifiers and reject ambiguous duplicate names.
- No complete, authoritative, machine-readable West Bengal district→block→mouza→J.L. dataset has yet been verified for bulk import. Do not populate guessed records or treat LGD village codes as J.L. numbers. Bulk import remains gated on an official Banglarbhumi/BL&LRO export or another authoritative source with provenance and validation.
- PR #7 remains open and Draft. Do not merge until the exposed historical signing-key risk is resolved and real-device OAuth/Picker plus cross-device sync tests are completed.


## Current verification checkpoint (2026-11-02 — GitHub Actions run #372)

- Source commit: `8a674e49a1c67c21a0181fcb9c5848b8d65617a3`.
- GitHub Actions run #372 (run ID `41414718650`) completed successfully: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41414718650
- Windows EXE job: dependency installation, installer build and artifact upload all succeeded.
- Android APK job: TypeScript check, sync-journal safety tests, web build, Capacitor sync, Android Emulator sync-store instrumentation tests, release APK build, signature verification and artifact upload all succeeded.
- The UI now explicitly distinguishes the official J.L. number from the Mouza list serial and instructs users to preserve leading zeros. This is a data-entry safeguard, not proof that the entered J.L. value has been checked against an official source.
- The immediately preceding documentation-only workflow for commit `e0d7c6640c7472e7ac54b96219ae4f9213b3ec68` was cancelled when a newer workflow superseded it. The subsequent run #372 on the branch head succeeded; the documentation change itself does not affect application build output.
- CI verifies build, packaging and automated emulator tests only. Physical Android OAuth/Picker and actual Windows↔Android Drive round-trip testing remain release gates.
- PR #7 remains open and Draft. The historical signing-key exposure and replacement-key verification remain unresolved release gates. Do not merge or call Google Drive sync production-ready until those gates are completed.


## Device/account binding implementation (2026-11-03 — coding completed; tests pending)

- Added OpenID Connect account identity lookup using Google's user-info endpoint. The registry stores the stable opaque `sub` identifier, not the account email.
- Windows and Android authorization now request `openid`, `email`, and the existing narrow `drive.file` scope so the account can be bound before sync.
- Added a Drive-backed `srk-device-registry-v1.json` in the selected customer folder. It binds the registry to the Google account subject and exact Drive folder ID.
- The sync runner now validates/registers the current installation before pulling or uploading case changes. An account/folder mismatch, malformed/duplicate registry, revoked installation, or full 10-device snapshot stops the sync cycle.
- Added device listing and revocation operations and a Registered Devices section under Settings → Sync Status. Revocation preserves registration history and cloud case data; the current device cannot revoke itself from this screen.
- A revoked installation ID cannot re-register itself. A replacement installation receives a new random device ID.
- Added account-identity tests and expanded device-registry tests; included the identity tests in `npm test`. These tests have not yet been run in this coding-first stage.
- Important limitation: Drive JSON files do not support atomic compare-and-swap. The Drive-only 10-device registry is best-effort and cannot guarantee race-free enforcement if multiple new devices register simultaneously. The UI and documentation disclose this; do not claim strict 10-device enforcement until an authoritative concurrency-safe registration service exists.
- Physical Google sign-in, Picker, account binding, device listing/revocation, and cross-device round-trip tests remain pending. No production-ready claim is made.

- Updated `npm test` to use `scripts/run-tests-serial.mjs`: each test file is launched as a separate Node test process in a fixed order, and the sequence stops immediately on the first failure. This is the configured verification order for the next CI run.


---

## Updated implementation status — 2026-11-04

The historical status above describes the earlier staged milestones. The following subsequent work has since been added on `feature/google-drive-two-way-sync`:

- Async journal and inbox repositories, async Drive pull/push coordinator, and async selected-folder persistence.
- `getReadyPlatformSyncStateStorage` gates Android sync-state use on successful legacy metadata migration to encrypted native SQLite; migration errors stop sync rather than falling back to localStorage.
- Automatic foreground sync in `src/App.tsx` and manual Sync Now in `src/components/BackupModal.tsx` use `runGoogleDriveSyncCycleAsync`.
- AppContext local change capture uses the async journal. Snapshot batches are persisted with one `enqueueMany` update; a failed journal write produces a recoverable warning and does not advance the captured snapshot.
- Staged remote changes and conflict actions use async repositories. Approved company data is persisted before inbox acknowledgement.
- Remote deletion tombstones are idempotent when a retry finds the target already absent.
- The same in-process sync-cycle lock is shared by legacy and async runner entry points.
- The serial test script runs 25 test files, including async repository, async transport, async inbox, Android migration, native storage adapter, staged apply, and tombstone tests.

### Current CI verification snapshot

- Run #702 (`41777306522`): Windows EXE job completed successfully. Android APK job reached the signed release APK build step; signature verification and artifact upload had not completed at the last inspection.
- Later commits after run #702 changed only sync-runner documentation and must receive a fresh CI run before those exact commits are considered verified.
- A successful CI package build is not proof of actual Google Drive sync between physical Windows and Android devices.

### Remaining release gates

1. Verify the latest CI run including Android instrumentation tests, signed APK signature verification, and artifact upload.
2. Test Google sign-in and Drive folder Picker on a physical Windows installation and Android device.
3. Test actual Windows→Android and Android→Windows changes, conflicts, deletions, pagination, offline retry, process termination, restart, and migration recovery.
4. Rotate the signing key previously exposed in Git history and update the Android OAuth SHA-1 registration before production release.
5. Do not enable Android WorkManager until persistent-store and restart/recovery tests pass.

PR #7 remains draft/unmerged until the release gates above are satisfied.


## Latest verified CI checkpoint — 2026-11-04 (Run #712)

- Source commit: `eeec4f08440ddeea93ec038d2cf6f23224b3dbb7`.
- GitHub Actions run #712 completed successfully: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41791512459
- Windows EXE job, Android APK job, and build-status report job all completed successfully.
- Android TypeScript check, serial sync safety test suite, web build, Capacitor sync, native instrumentation-test compilation, and Android Emulator instrumentation execution all passed.
- The Android instrumentation runner reported **6 tests, 0 failed, 0 ignored**. This is the first verified successful runtime execution after the previous emulator package-integrity installation failures.
- Android Release APK packaging succeeded. `apksigner verify --verbose` succeeded; APK Signature Scheme v2 was verified. The signer fingerprint reported by this CI build is SHA-1 `d58a97a1619be31a29f10d092805853549b22a2e` and SHA-256 `c563d37511633a90658b4e519c27db052a773601e133c2c1156c2e55bac8527d`.
- These fingerprints identify the certificate currently used by CI. They do not establish that the historically committed signing key has been rotated. Treat that historical key as exposed; replacement-key generation, GitHub secret replacement, and Google Cloud Android OAuth SHA-1 alignment remain release gates.
- Artifacts uploaded for this run:
  - Android APK: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41791512459/artifacts/13303868382
  - Windows EXE: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41791512459/artifacts/13303742435
  - Android instrumentation reports: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41791512459/artifacts/13303693839
- Run #711 was also queued for the same source commit and remained active at the last inspection; Run #712 independently completed all required jobs successfully for the current PR head. The PR remains Draft and unmerged.

### Remaining release gates after CI success

1. Generate and install a replacement signing key after confirming the app distribution/update path; never send keystore material or passwords in chat.
2. Replace GitHub Actions signing secrets with the replacement key and compare the resulting signed APK certificate fingerprint with the configured Android OAuth client SHA-1.
3. Test physical Android Google authorization/Picker and Windows OAuth/Picker.
4. Perform actual Windows-to-Android and Android-to-Windows sync round trips, including conflicts, deletions, offline retry, process restart, folder/account mismatch and revocation.
5. Keep Android WorkManager and full-exit Windows background sync marked unimplemented until separately designed and verified.

Do not merge PR #7 or label the release production-ready until the remaining signing and physical-device gates are passed.


## Latest verified CI checkpoint — 2026-11-04 (Run #714)

- Source commit: `ae7942f6fe7fe45b366f6a575e5b591b5d4b95a2`.
- GitHub Actions run #714 (run ID `41794777782`) completed successfully: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41794777782
- Android APK job, Windows EXE job, and build-status report job all completed successfully.
- The Android job passed TypeScript checks, all 25 serial test files, web build, Capacitor sync, native instrumentation-test compilation, and Android API 34 emulator instrumentation. The instrumentation suite reported **6 tests, 0 failures**.
- Signed release APK packaging and `apksigner verify --verbose` succeeded. Windows installer packaging and artifact upload also succeeded.
- Artifacts (available from the Actions run page; retention is controlled by GitHub):
  - Android APK artifact ID: `13305712879` (about 4.3 MB).
  - Windows EXE artifact ID: `13304967393` (about 114.3 MB).
  - Android instrumentation reports artifact ID: `13305891834`.
- This confirms CI build, packaging, and emulator instrumentation only. It does not verify physical-device OAuth/Picker or a real Windows↔Android Drive round trip.

### Owner decision — signing-key rotation deferred during direct-APK testing

- The owner confirmed that the app has been installed directly by APK and is intended for Google Play publication later.
- Do not rotate the Android signing key during the current testing phase. Keep the existing CI signing configuration unchanged so existing direct-APK test installations are not unexpectedly blocked from normal updates.
- The previously committed keystore remains exposed in Git history. This is a known production-release security issue, not a reason to disrupt current test installations now.
- Before the first Google Play production release, establish the intended Play App Signing/upload-key arrangement, rotate or replace the compromised key as appropriate, update the Android OAuth SHA-1 registration to the certificate actually used by the installed app, and verify the final release identity. Do not distribute a production APK until this is resolved.

### Work still outstanding

1. Physical Android Google sign-in, folder Picker, native-store migration persistence and recovery checks.
2. Physical Windows OAuth/Picker checks.
3. Actual Windows→Android and Android→Windows Drive round trips, including conflicts, deletions, pagination, offline retry, restart/recovery, account/folder mismatch and device revocation.
4. Android WorkManager remains unimplemented. Do not add a worker until shared native sync state, cross-process locking, and a supported credential-renewal path are implemented and tested.
5. Windows retry remains limited to the running application; full-exit background sync is not implemented.

PR #7 remains Draft and unmerged. CI success must not be presented as proof of production readiness.

## Latest verified CI checkpoint — 2026-11-04 (Run #718)

- Source commit: `d905fb26b30d709e21725ac2a69b0552a5bb88c8` (current PR #7 head at verification time).
- GitHub Actions run #718 (run ID `41799664993`) completed with conclusion `success`: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41799664993
- All three jobs succeeded: Android APK, Windows EXE, and build-status report.
- Android API 34 instrumentation runner reported **6 tests, 0 failed, 0 ignored**.
- Android Release APK packaging completed and `apksigner verify --verbose` succeeded.
- Windows installer packaging and artifact upload completed successfully.
- Artifacts:
  - Android APK: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41799664993/artifacts/13308418481 (about 4.3 MB).
  - Windows EXE installer: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41799664993/artifacts/13307612668 (about 114.3 MB).
  - Android instrumentation reports: https://github.com/kamalgharami-netizen/SRK-Case-Manager/actions/runs/41799664993/artifacts/13309216040.
- The Windows packaging log states that no code-signing certificate is configured, so Windows installer Authenticode signing was skipped. The installer build succeeding must not be described as a signed Windows release.
- GitHub Actions emitted a non-blocking Node.js 20 deprecation warning for several `actions/*@v4` workflow dependencies. Review and upgrade compatible action versions in a separate CI-maintenance change; do not make unverified major-version substitutions.
- Emulator instrumentation emitted Android keystore diagnostic warnings, but the test runner completed all 6 tests with no failures. This is emulator evidence only, not proof of physical Android Keystore persistence.
- This run verifies build, packaging, APK signature verification and emulator instrumentation for the exact source commit. It does not verify physical-device OAuth/Picker or a real Windows↔Android Drive round trip.

### Current next actions

1. Use the APK and Windows installer artifacts from this same run/commit for controlled physical-device acceptance testing.
2. Complete Windows and Android Google sign-in/Picker, then both directions of record sync, conflict resolution, deletion, offline retry and restart/recovery using disposable test records.
3. Keep the PR Draft and unmerged until physical-device checks pass.
4. Preserve the owner's decision to defer signing-key rotation during direct-APK testing. Before Google Play production release, resolve the historical exposed-key issue and verify the final Play App Signing/upload-key and Android OAuth SHA-1 arrangement.
5. Windows installer code signing is not configured in this run; decide and configure a trusted Windows signing certificate before distributing a production installer.

Android WorkManager and full-exit Windows background sync remain unimplemented. The Drive-only 10-device registry remains best-effort under simultaneous registrations. Do not claim continuous background sync or strict race-free device-cap enforcement.

