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
