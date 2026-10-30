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
- This protocol module does not authenticate, call Google APIs, or change the existing local database.

## Still required before live Google Drive sync can be enabled

1. Confirm that the Google Drive API and Google Picker API are enabled in the same Google Cloud project used by the app's OAuth configuration.
2. Obtain the project number (Picker App ID) and a restricted API key for Google Picker.
3. Configure and verify a supported OAuth flow for both Electron/Windows and Capacitor/Android. An Android OAuth client alone does not authenticate the Windows desktop app.
4. Implement platform-specific secure token storage. Client secrets and refresh tokens must never be embedded in Vite assets, APKs, EXEs, or source control.
5. Implement Drive file/folder selection, incremental upload/download, retry and pagination.
6. Persist a durable per-record change journal and conflict copies. Do not upload or replace the complete local database as one last-write-wins file.
7. Add user-visible sync status, manual sync, notifications and recovery controls.
8. Run Android APK and Windows EXE builds and test on actual devices, including offline operation, concurrent edits, deletion, reinstall and recovery.

## Safety status

Live sync is not enabled by this change. The app must not show a connected or synced status until a real authenticated Drive operation succeeds. Existing local records and backup behaviour remain the source of truth until the remaining integration and device tests are complete.
