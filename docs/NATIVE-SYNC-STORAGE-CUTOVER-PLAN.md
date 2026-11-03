# Native Sync Storage — Safe Live-Sync Cutover Plan

Date: 2026-11-03
Branch: `feature/google-drive-two-way-sync`
Status: planning and verification gate; no production cutover is enabled.

## Verified current boundary

- The Android Capacitor plugin exposes bounded `getItems`, `setItems`, and `removeItems` operations backed by encrypted SQLite.
- The Android database uses AES-GCM with an Android Keystore key and is stored under `getNoBackupFilesDir()`.
- Instrumentation tests cover database reopen/removal, ciphertext at rest, missing-key preservation, transaction rollback, and corrupted-ciphertext failure.
- The legacy migration is implemented with an allowlist, source preservation, destination conflict checks, read-back verification, retry handling, and a completion marker.
- The migration function is deliberately not called by app startup or the live sync runner.
- The live sync runner continues to use WebView `localStorage` for the journal, inbox, selected folder, pagination cursor, and last-success timestamp.
- The business database key `srk_case_manager_v5` and OAuth credentials are excluded from migration.

## Current CI observations

At the time this note was added, workflow runs #546 and #547 were still running on commit `bbc6fb8d89402fa5922d08cca293c677b718f9f7`. Both Windows EXE jobs had completed successfully; both Android jobs were still executing the native sync-store instrumentation step. Do not record the emulator suite as passed until those jobs complete successfully.

The workflow uses API 34 Google APIs, x86_64 Pixel 2, 4 GiB emulator memory, and two cores. The emulator action's animation toggle is disabled to avoid the fragile ADB input-keyevent startup path. This is CI emulator configuration only and does not constitute physical-device verification.

## Required implementation sequence

### Gate 1 — establish a production-safe store adapter

1. Define one typed sync-state storage interface for journal, inbox, conflict records, folder metadata, page cursors, and last-success metadata.
2. Keep browser and Windows implementations backed by their current `localStorage` behavior.
3. Add an Android implementation backed by the native Capacitor plugin.
4. Ensure all callers in the sync runner, journal, inbox, conflict resolution, folder selection, and device registry use the same injected adapter. Do not allow one component to read native state while another writes WebView storage.
5. Preserve the current Android localStorage implementation as a fallback until cutover verification is complete.

### Gate 2 — safe Android cutover

1. On Android only, run the existing migration before any sync-state consumer is initialized.
2. Require migration result `migrated` or `already-migrated`; if it returns `retry-required` or throws, do not start a sync cycle and show a recoverable error.
3. After migration, read every allowlisted key back through the adapter and compare exact values before enabling native reads.
4. Keep the original localStorage values intact throughout the observation period.
5. Do not copy business records or OAuth credentials into this store.
6. Provide a rollback switch that returns the entire sync-state subsystem to localStorage as one unit; never split reads and writes across stores.
7. Only remove the rollback path after upgrade, restart, and recovery tests pass on physical Android devices.

### Gate 3 — required tests before enabling the adapter

- Empty-install migration and populated-install migration.
- Migration interruption before and after each native write and before/after marker creation.
- Existing destination values that match and values that conflict.
- Source mutation while migration is running.
- Native bridge unavailable, database locked, Keystore key unavailable, and corrupted ciphertext.
- App process death and restart after migration but before first sync.
- Exact parity for outbox, inbox, conflicts, selected folder, device ID, page token, and last-success timestamp.
- A failed write must never acknowledge an outbound envelope or advance a remote page cursor.
- Concurrent foreground sync attempts must remain serialized.
- Windows and browser builds must continue using their existing storage implementation.

### Gate 4 — background sync

Do not add WorkManager until Gate 2 is complete. The worker must use the same native database and protocol, share a database-backed lease with foreground sync, use network constraints and retry backoff, and stop safely when authentication renewal is required. The current Android authorization flow stores no refresh token; therefore no silent background renewal may be assumed.

## Release gates that remain separate

- Physical Android device: native storage persistence, app update, restart, Keystore recovery, and migration.
- Real Google sign-in and Drive Picker on Android and Windows.
- Windows-to-Android and Android-to-Windows roundtrip with edits made on both devices.
- Offline queueing, reconnect retry, duplicate delivery, deletion/tombstone handling, and conflict review.
- Rotate the signing key previously exposed in repository history before release.
- Keep Draft PR #7 unmerged until the above checks are complete.

## Safety rule

A green CI build or emulator instrumentation run does not prove real Google OAuth, Drive Picker, physical-device persistence, or two-device synchronization. Never describe those release gates as complete without corresponding test evidence.
