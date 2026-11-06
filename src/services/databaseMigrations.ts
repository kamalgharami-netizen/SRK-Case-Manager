export interface DatabaseMigrationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DatabaseMigration<T = unknown> {
  fromVersion: number;
  toVersion: number;
  migrate: (current: T) => T;
  validate?: (next: unknown) => next is T;
}

export interface DatabaseMigrationOptions {
  storage: DatabaseMigrationStorage;
  dataKey: string;
  initialVersion: number;
  targetVersion: number;
  migrations: readonly DatabaseMigration[];
  versionKey?: string;
  backupPrefix?: string;
  now?: () => number;
}

export type DatabaseMigrationResult =
  | { status: 'up-to-date'; version: number }
  | { status: 'migrated'; fromVersion: number; version: number; backupKey: string };

function assertVersion(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`Invalid database ${label}.`);
  }
}

/**
 * Versioned, opt-in database migration runner.
 *
 * It does not run automatically at application startup. The caller must supply
 * an explicit migration chain and target version. A byte-for-byte backup is
 * retained before the first write; the original data and version marker are
 * restored and verified if any migration or read-back check fails.
 */
export function runDatabaseMigrations(
  options: DatabaseMigrationOptions,
): DatabaseMigrationResult {
  const {
    storage,
    dataKey,
    initialVersion,
    targetVersion,
    migrations,
    versionKey = 'srk_database_schema_version_v1',
    backupPrefix = 'srk_database_migration_backup_v1',
    now = Date.now,
  } = options;

  if (!dataKey || !versionKey || dataKey === versionKey) {
    throw new Error('Distinct database data and version keys are required.');
  }
  assertVersion(initialVersion, 'initial version');
  assertVersion(targetVersion, 'target version');
  if (targetVersion < initialVersion) {
    throw new Error('Database downgrade is not supported.');
  }

  const raw = storage.getItem(dataKey);
  if (raw === null) {
    throw new Error('Database data is missing; migration was not started.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Database data is unreadable; original data was left untouched.');
  }

  const storedVersionRaw = storage.getItem(versionKey);
  const storedVersion = storedVersionRaw === null ? initialVersion : Number(storedVersionRaw);
  assertVersion(storedVersion, 'stored version');
  if (storedVersion > targetVersion) {
    throw new Error('Database schema is newer than this application; downgrade was refused.');
  }
  if (storedVersion < initialVersion) {
    throw new Error('Stored database version is older than the supported migration baseline.');
  }
  if (storedVersion === targetVersion) {
    return { status: 'up-to-date', version: targetVersion };
  }

  const chain = new Map<number, DatabaseMigration>();
  for (const migration of migrations) {
    assertVersion(migration.fromVersion, 'migration source version');
    assertVersion(migration.toVersion, 'migration target version');
    if (migration.toVersion !== migration.fromVersion + 1) {
      throw new Error('Each database migration must advance exactly one version.');
    }
    if (chain.has(migration.fromVersion)) {
      throw new Error('Duplicate database migration source version.');
    }
    chain.set(migration.fromVersion, migration);
  }

  const ordered: DatabaseMigration[] = [];
  for (let version = storedVersion; version < targetVersion; version += 1) {
    const migration = chain.get(version);
    if (!migration || migration.toVersion !== version + 1) {
      throw new Error(`Missing database migration from version ${version} to ${version + 1}.`);
    }
    ordered.push(migration);
  }

  const backupKey = `${backupPrefix}_${now()}`;
  if (storage.getItem(backupKey) !== null) {
    throw new Error('Database migration backup key already exists; retry with a new timestamp.');
  }
  const backup = JSON.stringify({
    formatVersion: 1,
    dataKey,
    schemaVersion: storedVersion,
    capturedAt: now(),
    rawData: raw,
    rawVersionMarker: storedVersionRaw,
  });
  storage.setItem(backupKey, backup);
  if (storage.getItem(backupKey) !== backup) {
    throw new Error('Database migration backup could not be verified; migration was not started.');
  }

  let migrated: unknown = parsed;
  try {
    for (const migration of ordered) {
      migrated = migration.migrate(migrated);
      if (migration.validate && !migration.validate(migrated)) {
        throw new Error(`Database migration ${migration.fromVersion} to ${migration.toVersion} produced invalid data.`);
      }
    }

    const serialized = JSON.stringify(migrated);
    if (typeof serialized !== 'string') {
      throw new Error('Migrated database could not be serialized.');
    }
    storage.setItem(dataKey, serialized);
    if (storage.getItem(dataKey) !== serialized) {
      throw new Error('Migrated database read-back verification failed.');
    }

    storage.setItem(versionKey, String(targetVersion));
    if (storage.getItem(versionKey) !== String(targetVersion)) {
      throw new Error('Database schema version marker could not be verified.');
    }

    return {
      status: 'migrated',
      fromVersion: storedVersion,
      version: targetVersion,
      backupKey,
    };
  } catch (migrationError) {
    let rollbackError: unknown = null;
    try {
      storage.setItem(dataKey, raw);
      if (storage.getItem(dataKey) !== raw) {
        throw new Error('Original database data could not be restored and verified.');
      }
      if (storedVersionRaw === null) {
        storage.removeItem(versionKey);
        if (storage.getItem(versionKey) !== null) {
          throw new Error('Original database version marker could not be restored.');
        }
      } else {
        storage.setItem(versionKey, storedVersionRaw);
        if (storage.getItem(versionKey) !== storedVersionRaw) {
          throw new Error('Original database version marker could not be restored.');
        }
      }
    } catch (error) {
      rollbackError = error;
    }
    if (rollbackError) {
      throw new Error(
        'Database migration failed and rollback could not be verified. Keep the migration backup and do not continue writing to this database.',
        { cause: rollbackError },
      );
    }
    throw migrationError;
  }
}


export interface RestoreDatabaseMigrationBackupOptions {
  storage: DatabaseMigrationStorage;
  backupKey: string;
  dataKey: string;
  versionKey?: string;
}

/**
 * Explicit recovery from a retained migration backup.
 * This function is never invoked automatically. It validates the complete
 * backup before writing and restores the current state if recovery fails.
 */
export function restoreDatabaseMigrationBackup(
  options: RestoreDatabaseMigrationBackupOptions,
): { status: 'restored'; version: number } {
  const {
    storage,
    backupKey,
    dataKey,
    versionKey = 'srk_database_schema_version_v1',
  } = options;
  if (!backupKey || !dataKey || !versionKey || dataKey === versionKey) {
    throw new Error('Valid, distinct backup, data and version keys are required.');
  }

  const backupRaw = storage.getItem(backupKey);
  if (backupRaw === null) {
    throw new Error('Migration backup was not found; current database was not changed.');
  }

  let backup: unknown;
  try {
    backup = JSON.parse(backupRaw);
  } catch {
    throw new Error('Migration backup is unreadable; current database was not changed.');
  }

  if (!backup || typeof backup !== 'object') {
    throw new Error('Migration backup has an invalid format; current database was not changed.');
  }
  const candidate = backup as {
    formatVersion?: unknown;
    dataKey?: unknown;
    schemaVersion?: unknown;
    rawData?: unknown;
    rawVersionMarker?: unknown;
  };
  if (
    candidate.formatVersion !== 1 ||
    candidate.dataKey !== dataKey ||
    typeof candidate.rawData !== 'string' ||
    (candidate.rawVersionMarker !== null && typeof candidate.rawVersionMarker !== 'string')
  ) {
    throw new Error('Migration backup does not match this database; current database was not changed.');
  }
  assertVersion(candidate.schemaVersion as number, 'backup schema version');
  try {
    JSON.parse(candidate.rawData);
  } catch {
    throw new Error('Migration backup data is invalid; current database was not changed.');
  }
  if (
    candidate.rawVersionMarker !== null &&
    Number(candidate.rawVersionMarker) !== candidate.schemaVersion
  ) {
    throw new Error('Migration backup version marker is inconsistent; current database was not changed.');
  }

  const currentData = storage.getItem(dataKey);
  const currentVersion = storage.getItem(versionKey);
  if (currentData === null) {
    throw new Error('Current database data is missing; recovery was not started.');
  }

  try {
    storage.setItem(dataKey, candidate.rawData);
    if (storage.getItem(dataKey) !== candidate.rawData) {
      throw new Error('Restored database data could not be verified.');
    }
    if (candidate.rawVersionMarker === null) {
      storage.removeItem(versionKey);
      if (storage.getItem(versionKey) !== null) {
        throw new Error('Restored database version marker could not be verified.');
      }
    } else {
      storage.setItem(versionKey, candidate.rawVersionMarker);
      if (storage.getItem(versionKey) !== candidate.rawVersionMarker) {
        throw new Error('Restored database version marker could not be verified.');
      }
    }
    return { status: 'restored', version: candidate.schemaVersion as number };
  } catch (restoreError) {
    try {
      storage.setItem(dataKey, currentData);
      if (storage.getItem(dataKey) !== currentData) {
        throw new Error('Current database data rollback failed.');
      }
      if (currentVersion === null) {
        storage.removeItem(versionKey);
        if (storage.getItem(versionKey) !== null) {
          throw new Error('Current database version rollback failed.');
        }
      } else {
        storage.setItem(versionKey, currentVersion);
        if (storage.getItem(versionKey) !== currentVersion) {
          throw new Error('Current database version rollback failed.');
        }
      }
    } catch (rollbackError) {
      throw new Error(
        'Backup recovery failed and current-state rollback could not be verified. Preserve the backup and stop database writes.',
        { cause: rollbackError },
      );
    }
    throw restoreError;
  }
}
