# Versioned database migration framework

## Purpose

SRK Case Manager may start with a clean database. Existing cases/history do not need to be imported into a fresh installation. The application must nevertheless retain a controlled migration path for future schema upgrades.

## Current implementation

- `src/services/databaseMigrations.ts` provides an explicit, opt-in, sequential migration runner.
- Each migration advances exactly one schema version (`N -> N+1`).
- The caller must supply the data key, initial/target versions and complete migration chain.
- The runner refuses missing steps, duplicate steps, downgrades, unreadable data and databases newer than the running application.
- Before any database write, it creates and verifies a byte-for-byte backup under `srk_database_migration_backup_v1_<timestamp>`.
- It applies migrations in memory, optionally validates each result, writes the final data, verifies read-back, then writes and verifies the schema-version marker.
- On a failure, it restores and verifies the original data and original version marker. The recovery backup is retained.
- If rollback cannot be verified, it fails closed and instructs the caller not to continue writing to the database.

## Important activation rule

This framework is deliberately not called automatically during app startup and is not yet connected to the current case-data store. Do not wire it into production startup until the live database adapter, initial schema baseline, backup destination, recovery UX and platform-specific write guarantees have been reviewed and tested on Windows and a physical Android device.

## Future migration checklist

1. Define the authoritative current database schema version.
2. Add one immutable migration function and test per version transition.
3. Validate representative old and new database fixtures.
4. Test backup creation, data read-back, version-marker read-back and rollback.
5. Test interrupted writes and low-storage conditions on each platform.
6. Verify recovery from the retained backup before enabling the migration.
7. Never delete a recovery backup automatically as part of migration.
