# Android Sync-State Backup Policy

Date: 2026-10-31

## Decision

The native encrypted sync-state SQLite database is stored in Android's application
`noBackupFilesDir`, not the normal databases directory.

Reason: sync-state values are encrypted with a non-exportable Android Keystore key.
Android device backup does not back up that Keystore key. Backing up and restoring
the ciphertext database without its key would leave the restored sync state
unreadable. Excluding the database from automatic backup avoids creating that
inconsistent restore state.

## Scope

This policy applies only to `srk_sync_state_v1.db` and its SQLite sidecar files.
It does not move, delete, or modify the existing case database
`srk_case_manager_v5`, the current backup/export flow, or OAuth credential storage.

The sync-state database remains local to the Android installation. A reinstall or
device migration must not be assumed to preserve it. Pending sync data must be
safely synchronized or otherwise recovered through a separately designed and
verified mechanism before an app reset or device replacement.

## Verification

The Android instrumentation suite checks that:

- the native sync-state database is created under `getNoBackupFilesDir()`;
- the database file exists after a successful write;
- values survive database reopen;
- SQLite stores ciphertext rather than the supplied plaintext; and
- missing Keystore keys do not cause existing ciphertext to be overwritten.

The test is an automated emulator check. It does not replace physical-device
validation of app update, uninstall/reinstall, Android backup/restore, or device
migration behavior.

## Release restriction

Do not enable production migration or WorkManager until the shared-store migration
and credential-renewal release gates are independently satisfied. Never copy
OAuth tokens or signing material into this database.
