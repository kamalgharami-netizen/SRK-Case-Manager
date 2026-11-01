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
