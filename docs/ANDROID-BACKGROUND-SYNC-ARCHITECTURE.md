# Android Background Sync Architecture

Date: 2026-10-31
Branch: `feature/google-drive-two-way-sync`

## Status

This is an architecture decision and implementation plan, not a claim that Android background sync is implemented. The current app supports foreground/startup/resume sync and keeps remote changes staged for review.

## Audit findings

The current implementation separates state across two storage domains:

- Main business data is persisted in WebView `localStorage` under the existing key `srk_case_manager_v5`.
- Sync outbox, inbox, conflict data, device ID, selected Drive folder, and Drive pagination cursor are also stored in WebView `localStorage`.
- Android Google OAuth credentials are stored separately through `@aparajita/capacitor-secure-storage`, using the Android secure-storage implementation.
- The Android authorization flow currently records `refreshToken: null`; it receives a short-lived access token and can renew it through the native authorization flow while the app is foregrounded.

A WorkManager worker cannot safely use the WebView's `localStorage`. A worker that reads a different or empty journal would either miss pending edits or falsely report that there is nothing to upload. Moving only the token to native code would not solve this. The worker also cannot assume that a short-lived access token can be renewed silently after expiry.

## Decision

Do not add a WorkManager job that directly calls the existing TypeScript sync coordinator. Do not duplicate the current sync logic in a worker against a second, independent state store.

The next implementation should introduce one durable native sync-state store that is shared by the foreground Capacitor bridge and Android background work. The business database remains on its existing `srk_case_manager_v5` key in this phase.

### Native sync-state database

Use a versioned SQLite database owned by the Android application, with transactional operations for:

- pending outbound sync envelopes;
- staged inbound envelopes;
- conflict records;
- seen remote change IDs;
- selected Drive folder ID and display name;
- per-folder Drive page token;
- last successful sync time and last error category.

The database must have explicit schema migrations. Do not delete or overwrite malformed/unknown-version data. Use transactions for enqueue, acknowledgement, staging, conflict resolution, and cursor updates. Preserve existing WebView localStorage entries during rollout.

### Foreground bridge and compatibility migration

1. Add a Capacitor plugin API for reading and mutating the native sync state.
2. Keep the existing localStorage implementation as the active source until the native store passes tests.
3. Implement a one-time, idempotent migration that copies each existing sync key into SQLite, verifies counts and IDs, and writes a migration-complete marker only after verification.
4. Never clear the source localStorage keys during migration. Retain a recovery copy and a rollback path.
5. Switch foreground sync reads/writes to the native store only after parity tests pass on Android. Keep browser and Windows storage behavior unchanged.
6. Add crash/restart tests for every transaction boundary.

### WorkManager phase

Only after the shared native state store is active:

- Add unique periodic work with network-connected constraints and exponential backoff.
- Add one-time work when the foreground app enqueues changes or selects a Drive folder.
- Use a database lease/lock so foreground and worker sync cannot overlap.
- Reuse the same protocol rules: pull before push, idempotent Drive filenames, bounded pagination, seen-ID deduplication, and conflict staging. Never auto-apply remote records.
- Treat an expired or unavailable access token as an authentication-required result. Do not launch UI from a worker and do not claim that background sync succeeded.
- Foreground app resume must renew authorization when possible and reschedule pending work.
- Record worker outcomes without storing tokens in logs or sync payloads.

## OAuth limitation and release gate

The current Android code explicitly stores no refresh token. Therefore, background execution must not assume it can silently obtain a new token after expiry. Before enabling periodic WorkManager sync beyond the current access-token lifetime, implement and verify a supported background credential-renewal design for this exact Android OAuth client and app signing identity. If that cannot be verified, the worker must stop safely when authentication is required and the UI must ask the user to reopen the app and reconnect/renew access.

No OAuth client secret may be embedded in the APK. Never commit signing keystores, passwords, access tokens, or refresh tokens.

## Required tests before enabling background work

- Migration from an empty install and from existing localStorage sync state.
- Migration interrupted at every write boundary; retry must be idempotent.
- Existing `srk_case_manager_v5` business data remains byte-for-byte untouched by sync-state migration.
- Worker and foreground process read the same outbox, inbox, folder, and page cursor.
- Concurrent foreground/worker requests are serialized.
- Acknowledgement happens only after confirmed upload; retry does not duplicate remote changes.
- Duplicate remote IDs do not create repeated inbox entries or conflicts.
- Expired credentials produce an authentication-required state, not a false success.
- Offline/network loss and process death preserve pending work.
- Remote data remains staged until explicit user review.
- Physical-device tests cover Android app restart, force-stop behavior, Doze/battery restrictions, and account authorization.

## Current verified boundary

Build #233 passed on 2026-10-31 for both the signed Android APK and Windows EXE. This verifies the current branch build, not physical-device OAuth, Picker, two-device sync, or the architecture above. The implementation remains unmerged in Draft PR #7.


## Implementation progress (2026-10-31)

### Stage 1 — native encrypted sync-state store scaffold

Added the private Capacitor package `@srk/capacitor-sync-state`:

- Android SQLite database `srk_sync_state_v1.db` with a key/value table and transactional batch writes/deletes.
- Values are encrypted with AES-256-GCM using a non-exportable Android Keystore key; only ciphertext is stored in SQLite.
- The plugin exposes bounded `getItems`, `setItems`, and `removeItems` operations.
- Added `migrateLegacyAndroidSyncState()`, which copies only the known sync metadata keys and per-folder pagination keys, reads them back for exact verification, and writes a completion marker only after verification.
- The migration never deletes or changes the original localStorage values and explicitly excludes the business database and OAuth credentials.
- The native store is not yet connected to the live sync journal/inbox. This is intentional until native Android build and migration tests pass.

### Stage 1 verification gate

The CI run triggered by these changes must pass TypeScript checks, the Android Gradle build, signed APK packaging, and Windows EXE packaging. After CI, add tests for migration retries, read-back mismatch, localStorage mutation during migration, and native database transaction failure before switching any production reads/writes.

## Manual Android device validation checklist (release gate)

CI currently compiles and packages the native plugin, but it does not execute Android Keystore, SQLite, app-data restore, or process-restart behavior on a physical device. Complete this checklist on at least one supported Android device before enabling the migration or connecting the native store to live sync.

### A. Native storage persistence

- [ ] Install the signed APK on a test device and launch the app.
- [ ] Through a dedicated test harness for the native plugin, write a harmless test key/value; read it back and compare the exact value.
- [ ] Force-stop the app, relaunch it, and read the same key again.
- [ ] Write two keys in one batch; verify both are present.
- [ ] Remove one key; verify it is absent and the other remains.
- [ ] Submit an empty batch, a batch over 500 entries, duplicate keys, a blank key, a key over 256 characters, and a value over 2 MiB; each invalid request must be rejected without partial writes.
- [ ] Verify SQLite contains encrypted Base64 payloads rather than the supplied plain-text test values. Do not export production sync data for this check.

### B. Encryption and recovery

- [ ] Verify a value written before app process termination can be decrypted after relaunch.
- [ ] Test app update over the existing installation; confirm the stored value remains readable.
- [ ] Test uninstall/reinstall separately and record the expected data/key loss behavior; do not treat reinstall as an in-place upgrade.
- [ ] On a disposable test device only, test restoring app data onto a different device or after clearing Android Keystore state. The store must fail safely and must not silently create a replacement key and overwrite unreadable data.
- [ ] Inspect Android backup/restore behavior before release. The SQLite database may be restored independently of its Android Keystore key; decide and test an explicit backup policy before relying on restored native sync state.

### C. Migration gate

- [ ] Seed only test sync metadata in legacy localStorage; include a page-token key.
- [ ] Confirm the migration copies all allowlisted keys and exact values.
- [ ] Confirm `srk_case_manager_v5`, OAuth credentials, and unrelated settings are not copied.
- [ ] Interrupt the test migration, relaunch, and retry; the source localStorage values must remain unchanged and the completion marker must appear only after read-back verification.
- [ ] Change or add an allowlisted source key during the copy; migration must return retry-required and must not mark completion.
- [ ] Repeat after a successful migration; it must report already-migrated without rewriting the source.

### D. Current implementation boundary

The repository does not yet include a user-facing native-store test screen or Android instrumentation test harness. The checklist above is a test specification, not evidence that these device tests have passed. Do not invoke `migrateLegacyAndroidSyncState()` in production startup, switch the live sync journal/inbox to SQLite, or schedule WorkManager until the native test harness and physical-device results are reviewed. Keep the business database key `srk_case_manager_v5` and current backup/export flows unchanged.
