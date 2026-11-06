# SRK Case Manager — Physical Device Acceptance Test

Branch: `main`  
Merged PR: https://github.com/kamalgharami-netizen/SRK-Case-Manager/pull/7  
Merge commit: `7a2fc999e518b6848dfa3c8c138412ea623da133`

This checklist is for validating the packaged app on actual Windows and Android devices. CI emulator success is not a substitute. Do not use the only copy of real case data: create a test company and test records, and export a separate backup before starting.

## 1. Prepare test installations

- [ ] Download the Windows installer and Android APK from the same successful GitHub Actions run for the exact branch commit being tested.
- [ ] Record the commit SHA and run number for both artifacts; do not mix artifacts from different runs.
- [ ] Install/update the Windows app and Android app using the existing test signing identity. Do not change the signing key during this direct-APK testing phase.
- [ ] Confirm the app opens and the existing local case data is still present on each device.
- [ ] Create a clearly labelled test company/workspace on each device, or use a dedicated test account. Never test destructive operations on production case records.

## 2. Verify sign-in and folder selection on each platform

### Windows
- [ ] Open Settings → Sync Status.
- [ ] Sign in with the intended Google test account.
- [ ] Confirm the account identity shown by the app is the expected test account.
- [ ] Select exactly one dedicated test folder through Google Picker.
- [ ] Confirm the selected folder is displayed and is not a shared folder containing unrelated documents.
- [ ] Disconnect and reconnect once; verify that local case data and Drive files are not deleted.

### Android
- [ ] Repeat the same steps on the physical Android device.
- [ ] Confirm Google authorization returns to the app without a crash.
- [ ] Confirm exactly one folder is selected and the folder name/identity matches the intended test folder.
- [ ] Close and reopen the app; verify that selected-folder configuration and encrypted sync metadata remain readable.
- [ ] Do not clear app data or uninstall during this persistence test.

## 3. Windows → Android record round trip

- [ ] On Windows, create one uniquely named test case with a unique marker such as `SYNC-WIN-<date-time>`.
- [ ] Run Sync Now and wait for a successful transfer result.
- [ ] On Android, run Sync Now.
- [ ] Open the staged inbox/review screen; verify the test change is present and the company/record identity is correct.
- [ ] Approve the staged change only after checking its contents.
- [ ] Verify the record appears exactly once in the Android test company.
- [ ] Run Sync Now again on both devices; verify the same change is not duplicated.

## 4. Android → Windows record round trip

- [ ] On Android, create a different uniquely named test case with marker `SYNC-ANDROID-<date-time>`.
- [ ] Run Sync Now.
- [ ] On Windows, run Sync Now.
- [ ] Review and approve the staged change.
- [ ] Verify the record appears exactly once in the Windows test company.
- [ ] Run Sync Now again on both devices; verify no duplicate record is created.

## 5. Conflict and deletion safety

- [ ] Start with one test record already synced to both devices.
- [ ] Disconnect both devices from the network.
- [ ] Edit the same record differently on Windows and Android.
- [ ] Reconnect and sync both devices.
- [ ] Confirm the app presents a conflict; it must not silently overwrite either version.
- [ ] Choose Keep Local Version; sync again and verify the selected resolution reaches the other device.
- [ ] Repeat with a disposable test record and choose Use Remote Version.
- [ ] Delete a disposable test record on one device; sync the other device and verify deletion is staged/handled according to the app's explicit review flow. Do not infer that a missing record means a successful tombstone transfer.

## 6. Offline, restart and recovery

- [ ] Create a test change while offline; confirm it remains pending.
- [ ] Restore network access and run Sync Now; confirm pending work is eventually transferred.
- [ ] Force-close/reopen the Android app with pending work; confirm the outbox/inbox state remains.
- [ ] Exit/reopen the Windows app with pending work; confirm the outbox/inbox state remains.
- [ ] Simulate a failed or interrupted sync by briefly disabling network access during transfer; confirm a retry does not create duplicate Drive changes.
- [ ] Confirm an account or selected-folder mismatch stops sync with a clear error rather than uploading to another account/folder.
- [ ] Confirm a revoked device cannot continue syncing.

## 7. Limits to record accurately

- Android WorkManager background sync is not implemented. Android sync is foreground/startup/resume/network-return based; do not expect continuous sync while the app is force-stopped or closed.
- Windows periodic retry is best-effort while the application remains running. It does not run after full application exit.
- Android authorization currently has no persisted refresh token. If access expires and native renewal is unavailable, the app must require foreground reauthorization rather than report a false successful sync.
- The Drive-only 10-device registry is best-effort under simultaneous registrations because Drive JSON does not provide compare-and-swap. Do not claim strict concurrency-safe enforcement.
- CI emulator tests do not verify Google account OAuth, Picker permissions, device-specific Keystore persistence, or real two-device data consistency.

## 8. Record results

For each test, record: date/time, app version, commit SHA, Actions run number, Windows OS build, Android model/OS version, test account label (never password/token), test folder label (never share private Drive links), expected result, actual result, and pass/fail.

Do not paste access tokens, refresh tokens, passwords, private keys, or real client case data into GitHub issues or chat.

## Release decision

PR #7 has been merged into `main`; merge status does not mean the app is production-ready. Keep the release marked as **not physically validated** until both physical platforms pass sign-in/Picker checks and all applicable round-trip, conflict, deletion, offline, restart and recovery tests. Record failures and fix them before publishing a production release. Do not use emulator results as a substitute for these device checks.
