import test from 'node:test';
import assert from 'node:assert/strict';
import { runDatabaseMigrations, restoreDatabaseMigrationBackup, type DatabaseMigrationStorage } from './databaseMigrations';

class MemoryStorage implements DatabaseMigrationStorage {
  values = new Map<string, string>();
  failSetKey: string | null = null;
  failSetOnce = false;
  failReadBackKey: string | null = null;

  getItem(key: string): string | null {
    if (key === this.failReadBackKey) return null;
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (key === this.failSetKey) {
      if (this.failSetOnce) this.failSetKey = null;
      throw new Error(`simulated write failure: ${key}`);
    }
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const isObject = (value: unknown): value is { records: string[]; schema: number } =>
  Boolean(value && typeof value === 'object' &&
    Array.isArray((value as { records?: unknown }).records) &&
    typeof (value as { schema?: unknown }).schema === 'number');

function options(storage: MemoryStorage, overrides: Partial<Parameters<typeof runDatabaseMigrations>[0]> = {}) {
  return {
    storage,
    dataKey: 'srk_case_manager_data',
    initialVersion: 1,
    targetVersion: 3,
    now: () => 123456,
    migrations: [
      {
        fromVersion: 1,
        toVersion: 2,
        migrate: (value: any) => ({ ...value, schema: 2 }),
        validate: isObject,
      },
      {
        fromVersion: 2,
        toVersion: 3,
        migrate: (value: any) => ({ ...value, schema: 3, records: [...value.records, 'added'] }),
        validate: isObject,
      },
    ],
    ...overrides,
  };
}

test('runs sequential versioned migrations and preserves a byte-for-byte backup', () => {
  const storage = new MemoryStorage();
  const original = JSON.stringify({ records: ['existing'], schema: 1 });
  storage.setItem('srk_case_manager_data', original);

  const result = runDatabaseMigrations(options(storage));

  assert.deepEqual(result, {
    status: 'migrated',
    fromVersion: 1,
    version: 3,
    backupKey: 'srk_database_migration_backup_v1_123456',
  });
  assert.deepEqual(JSON.parse(storage.getItem('srk_case_manager_data')!), {
    records: ['existing', 'added'],
    schema: 3,
  });
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '3');
  const backup = JSON.parse(storage.getItem(result.backupKey)!);
  assert.equal(backup.rawData, original);
  assert.equal(backup.schemaVersion, 1);
});

test('does not write when database content is unreadable', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_case_manager_data', '{broken');

  assert.throws(() => runDatabaseMigrations(options(storage)), /unreadable/);
  assert.equal(storage.getItem('srk_case_manager_data'), '{broken');
  assert.equal(storage.getItem('srk_database_schema_version_v1'), null);
});

test('refuses missing migration steps before creating a backup or writing', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_case_manager_data', JSON.stringify({ records: [], schema: 1 }));

  assert.throws(() => runDatabaseMigrations(options(storage, { migrations: [] })), /Missing database migration/);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), null);
  assert.equal(storage.values.size, 1);
});

test('retains the backup and restores original data if a migration throws', () => {
  const storage = new MemoryStorage();
  const original = JSON.stringify({ records: ['keep'], schema: 1 });
  storage.setItem('srk_case_manager_data', original);
  const migrations = [
    { fromVersion: 1, toVersion: 2, migrate: () => { throw new Error('migration failed'); } },
    { fromVersion: 2, toVersion: 3, migrate: (value: unknown) => value },
  ];

  assert.throws(() => runDatabaseMigrations(options(storage, { migrations })), /migration failed/);
  assert.equal(storage.getItem('srk_case_manager_data'), original);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), null);
  assert.ok(storage.getItem('srk_database_migration_backup_v1_123456'));
});

test('restores original version marker when final version write fails', () => {
  const storage = new MemoryStorage();
  const original = JSON.stringify({ records: ['keep'], schema: 1 });
  storage.setItem('srk_case_manager_data', original);
  storage.setItem('srk_database_schema_version_v1', '1');
  storage.failSetKey = 'srk_database_schema_version_v1';
  storage.failSetOnce = true;

  assert.throws(() => runDatabaseMigrations(options(storage)), /simulated write failure/);
  assert.equal(storage.getItem('srk_case_manager_data'), original);
  storage.failSetKey = null;
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '1');
});

test('refuses downgrades and databases newer than the running application', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_case_manager_data', JSON.stringify({ records: [], schema: 4 }));
  storage.setItem('srk_database_schema_version_v1', '4');

  assert.throws(() => runDatabaseMigrations(options(storage)), /newer than this application/);
  assert.throws(() => runDatabaseMigrations(options(storage, { initialVersion: 2, targetVersion: 1 })), /downgrade is not supported/);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '4');
});

test('returns without writing when the database is already at target version', () => {
  const storage = new MemoryStorage();
  storage.setItem('srk_case_manager_data', JSON.stringify({ records: [], schema: 3 }));
  storage.setItem('srk_database_schema_version_v1', '3');

  assert.deepEqual(runDatabaseMigrations(options(storage)), { status: 'up-to-date', version: 3 });
  assert.equal(storage.values.size, 2);
});

test('fails closed and keeps backup when migrated output fails validation', () => {
  const storage = new MemoryStorage();
  const original = JSON.stringify({ records: ['keep'], schema: 1 });
  storage.setItem('srk_case_manager_data', original);
  const migrations = [
    { fromVersion: 1, toVersion: 2, migrate: () => ({ invalid: true }), validate: isObject },
    { fromVersion: 2, toVersion: 3, migrate: (value: unknown) => value },
  ];

  assert.throws(() => runDatabaseMigrations(options(storage, { migrations })), /produced invalid data/);
  assert.equal(storage.getItem('srk_case_manager_data'), original);
  assert.ok(storage.getItem('srk_database_migration_backup_v1_123456'));
});

test('restores a retained backup and verifies restored data and schema version', () => {
  const storage = new MemoryStorage();
  const original = JSON.stringify({ records: ['before'], schema: 1 });
  storage.setItem('srk_case_manager_data', original);
  const migration = runDatabaseMigrations(options(storage));
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '3');

  const result = restoreDatabaseMigrationBackup({
    storage,
    backupKey: migration.backupKey,
    dataKey: 'srk_case_manager_data',
  });

  assert.deepEqual(result, { status: 'restored', version: 1 });
  assert.equal(storage.getItem('srk_case_manager_data'), original);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), null);
  assert.ok(storage.getItem(migration.backupKey));
});

test('refuses a backup belonging to a different database without changing current data', () => {
  const storage = new MemoryStorage();
  const current = JSON.stringify({ records: ['current'], schema: 3 });
  storage.setItem('srk_case_manager_data', current);
  storage.setItem('srk_database_schema_version_v1', '3');
  storage.setItem('foreign_backup', JSON.stringify({
    formatVersion: 1,
    dataKey: 'another_database',
    schemaVersion: 1,
    rawData: JSON.stringify({ records: [], schema: 1 }),
    rawVersionMarker: null,
  }));

  assert.throws(() => restoreDatabaseMigrationBackup({
    storage,
    backupKey: 'foreign_backup',
    dataKey: 'srk_case_manager_data',
  }), /does not match this database/);
  assert.equal(storage.getItem('srk_case_manager_data'), current);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '3');
});

test('restores the current state if a backup recovery write fails', () => {
  const storage = new MemoryStorage();
  const current = JSON.stringify({ records: ['current'], schema: 3 });
  storage.setItem('srk_case_manager_data', current);
  storage.setItem('srk_database_schema_version_v1', '3');
  storage.setItem('valid_backup', JSON.stringify({
    formatVersion: 1,
    dataKey: 'srk_case_manager_data',
    schemaVersion: 1,
    rawData: JSON.stringify({ records: ['backup'], schema: 1 }),
    rawVersionMarker: null,
  }));
  storage.failSetKey = 'srk_case_manager_data';
  storage.failSetOnce = true;

  assert.throws(() => restoreDatabaseMigrationBackup({
    storage,
    backupKey: 'valid_backup',
    dataKey: 'srk_case_manager_data',
  }), /simulated write failure/);
  assert.equal(storage.getItem('srk_case_manager_data'), current);
  assert.equal(storage.getItem('srk_database_schema_version_v1'), '3');
});
