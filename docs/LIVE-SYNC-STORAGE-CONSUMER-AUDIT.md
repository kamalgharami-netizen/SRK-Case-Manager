# Live Sync Storage Consumer Audit

Date: 2026-11-04
Branch: `feature/google-drive-two-way-sync`

## Current implementation status

The live application entry points now use the asynchronous Google Drive sync path and a shared platform storage initializer:

- `src/App.tsx` automatic foreground sync calls `runGoogleDriveSyncCycleAsync`.
- `src/components/BackupModal.tsx` manual Sync Now, selected-folder read/write/clear, sync counts, staged apply, and conflict actions use the async repositories.
- `src/context/AppContext.tsx` local change capture uses the same ready storage and an async journal; staged apply and conflict resolution are asynchronous.
- `src/services/readySyncStateStorage.ts` runs the Android legacy metadata migration before returning the native adapter. A failed migration rejects initialization; there is no Android localStorage fallback.
- `src/services/googleDriveSyncRunner.ts` injects one store into device ID, journal, inbox, folder, cursor, and last-success operations.
- The Android native encrypted SQLite adapter remains separate from the main case database. The main business database remains localStorage-backed.

The prior synchronous runner/repositories remain in the code for compatibility and tests, but current app call sites were switched to the async runner.

## Consumer cutover

| Area | Current implementation | Verification still required |
|---|---|---|
| Outbox and conflicts | `AsyncSyncJournal` over injected `AsyncSyncStateStorage`; atomic `enqueueMany` for AppContext snapshot batches | CI test run for latest commit; crash/restart testing on physical devices |
| Remote inbox | `AsyncSyncInbox` over the same injected store | CI test run for latest commit; native persistence/restart testing |
| Pull and push | Async transport and coordinator; cursor is persisted after pull processing | Real Drive roundtrip and pagination/failure injection |
| Sync runner | App startup/resume and manual Sync Now call `runGoogleDriveSyncCycleAsync` | Real Google OAuth/Picker and Windows↔Android tests |
| Selected folder | Async get/save/clear using ready platform store | Android upgrade migration and folder persistence test |
| Device identity | Async ID generated from the same store and passed into Drive registry | Physical reinstall/restore and registry concurrency tests |
| Company change capture | Serialized AppContext queue; complete snapshot batch persisted through atomic `enqueueMany` | Test rapid edits, process termination, and quota/native write failures |
| Apply staged changes | Async inbox; approved company data persists before inbox acknowledgement | Physical crash between database persistence and acknowledgement |
| Conflict resolution | Async journal; remote value persists before resolution envelope/ack sequence | Physical crash/retry and competing-device conflict tests |
| UI callers | Manual sync, status refresh, staged apply, and conflict controls use async APIs | Manual UI verification on Windows and Android |

## Safety constraints retained

1. Android migration must complete with `migrated` or `already-migrated` before the ready native adapter is returned. Errors/retry-required results block sync.
2. Outbox, inbox, conflicts, selected folder, device ID, page cursor, and last-success metadata use the same injected store during an async sync cycle.
3. Android native storage has no silent localStorage fallback.
4. The main case database key `srk_case_manager_v5` and OAuth credentials are excluded from the sync-metadata migration.
5. Outbound acknowledgements and remote cursor advancement occur only after the corresponding durable operations complete.
6. AppContext snapshot batches are written as one journal update, avoiding partial batches being re-created with new change IDs.
7. Remote delete tombstones are idempotent when retried after the target record has already been removed.
8. Windows/browser use the localStorage-backed async adapter.
9. Android WorkManager/background sync is not enabled.

## Known limitations and open release gates

- The storage adapter serializes read/modify/write operations per key **within one adapter instance**. It is not a cross-process lock or database compare-and-swap primitive. Do not describe it as globally atomic across app processes.
- Google Drive device-registry updates are best-effort because Drive does not provide compare-and-swap; the ten-device limit is not race-free under simultaneous registrations.
- Android refresh tokens are not stored for silent background renewal; background WorkManager remains out of scope.
- The main business database still uses the existing localStorage persistence path; this cutover only unifies sync metadata.
- Physical Android upgrade/restart/Keystore-recovery tests, real Google sign-in and Picker tests, and actual Windows-to-Android / Android-to-Windows roundtrip tests remain outstanding.
- A signing keystore previously exposed in Git history must be rotated and the Google OAuth Android SHA-1 registration updated before release.

## CI status at audit time

- Earlier CI run `41771448060` completed Windows EXE Build successfully and passed TypeScript check, web build, Capacitor sync, and native instrumentation-test compilation; the Android emulator instrumentation step was still running at the last inspection.
- CI run `41775632340` failed at TypeScript check because one `App.tsx` automatic-sync call still referenced the old runner. That call was corrected in commit `5def1b56aaca22d4bcd5a6e830706ae7a691fea7`.
- CI run `41776711580` passed TypeScript check, sync-journal safety tests, web build, Capacitor sync, and native instrumentation-test compilation; Windows EXE build succeeded. Android emulator instrumentation was still running at the last inspection.
- Later commits added atomic snapshot batch enqueue and idempotent tombstone retry tests. Their CI run is `41777026470` and must be checked before treating those additions as verified.

Keep PR #7 draft/unmerged until the latest CI is green and physical-device / real Drive release gates are completed.
