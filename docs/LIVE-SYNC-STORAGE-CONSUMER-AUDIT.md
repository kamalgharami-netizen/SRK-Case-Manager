# Live Sync Storage Consumer Audit

Date: 2026-11-04
Branch: `feature/google-drive-two-way-sync`

## Result

The Android encrypted SQLite sync-state adapter exists, but it is **not yet connected to the live Google Drive sync path**. The current live path still reads and writes sync metadata through synchronous `localStorage` APIs. Enabling the native adapter only in the runner would split one sync cycle across two stores and is therefore unsafe.

This audit records the concrete consumers that must move together. It does not change runtime behavior.

## Confirmed consumers

| Area | Current synchronous access | Required change |
|---|---|---|
| Outbox and conflict journal | `SyncJournal` in `src/services/syncJournal.ts` | Introduce async repository methods over `AsyncSyncStateStorage`; preserve validation, idempotent enqueue, explicit acknowledgements, and conflict-resolution ordering. |
| Remote inbox | `SyncInbox` in `src/services/googleDriveSyncInbox.ts` | Async reads/writes for staged changes and seen IDs; preserve write-before-ack ordering. |
| Pull and push | `pullRemoteChanges`, `pushPendingChanges`, `syncGoogleDriveNow` | Await every repository operation; never advance a Drive page cursor or acknowledge an outbox item before durable storage confirms success. |
| Sync runner | `src/services/googleDriveSyncRunner.ts` | Initialize one platform store, run Android migration before any repository read, then inject that same store into all sync consumers. |
| Selected folder | `src/services/googleDriveSelectedFolder.ts` | Replace direct `localStorage` calls with the injected storage; selection, clearing, and reading must use the same store. |
| Device identity / registry | `src/services/googleDriveDeviceRegistry.ts` | Replace the `Storage` dependency with the async store and await device-ID persistence before Drive registration. |
| Company change capture | `src/context/AppContext.tsx` company-change effect | Queue tracked changes asynchronously without blocking ordinary case edits; serialize writes and surface recoverable sync-state errors. |
| Apply staged changes | `src/context/AppContext.tsx` + `applyStagedInboxChanges.ts` | Make the action async; persist approved company data first, then acknowledge inbox IDs in the same injected store. |
| Conflict resolution | `src/context/AppContext.tsx` | Make the action async; persist selected live data before queueing the resolution envelope and removing the conflict. |
| UI callers | Context consumers of `applyStagedSyncChanges` and `resolveSyncConflict` | Await the new Promise results and prevent duplicate submissions while an action is running. |

## Non-negotiable safety constraints

1. Android migration must complete with `migrated` or `already-migrated` before the first sync-state read. A retry/error result blocks sync.
2. One injected store instance must be used for outbox, inbox, conflicts, selected folder, device ID, page cursor, and last-success metadata for the whole cycle.
3. No Android fallback to localStorage after a native read/write error.
4. The main case database key `srk_case_manager_v5` and OAuth credentials remain outside this migration.
5. A failed durable write must not acknowledge a remote inbox item, acknowledge an outbound change, or advance the Drive pagination cursor.
6. Foreground sync cycles and conflict/apply operations must not race on the same sync state.
7. Windows and browser builds continue using the localStorage-backed async adapter.
8. Do not enable Android WorkManager until this cutover and its physical-device recovery tests pass.

## Implementation order

1. Add asynchronous journal and inbox repositories with parity tests against the existing synchronous behavior.
2. Convert pull/push/coordinator APIs to await those repositories and add failure-ordering tests.
3. Convert selected-folder and device-ID consumers.
4. Convert AppContext change capture, apply, and conflict-resolution actions plus their UI callers.
5. Wire the Android migration gate before creating any repository.
6. Run typecheck, unit tests, Windows package build, Android APK build, and instrumentation tests.
7. Only then perform physical Android upgrade/restart/Keystore-recovery and real Windows-to-Android / Android-to-Windows Drive roundtrip tests.

## Current release status

The existing API 34 CI run previously verified Windows packaging, Android APK packaging, and Android instrumentation tests. Those CI results do not prove live native-store integration or real Google Drive interoperability. The pull request must remain draft/unmerged until the implementation and physical-device release gates above are satisfied. The historical signing-key exposure also remains a release blocker until the key is rotated and the Google OAuth Android SHA-1 registration is updated.
