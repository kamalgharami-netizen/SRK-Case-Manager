import { spawnSync } from 'node:child_process';

const testFiles = [
  'googleOAuthLoopback.test.cjs',
  'src/services/googleOAuthPkce.test.ts',
  'src/services/googleOAuthTokenClient.test.ts',
  'src/services/googleOAuthSession.test.ts',
  'src/services/syncJournal.test.ts',
  'src/services/companyChangeTracker.test.ts',
  'src/services/googleDriveSyncTransport.test.ts',
  'src/services/googleDriveSyncInbox.test.ts',
  'src/services/driveSyncProtocol.equalTimestamp.test.ts',
  'src/services/driveSyncProtocol.deviceId.test.ts',
  'src/services/syncDeviceRegistry.test.ts',
  'src/services/googleDriveAccountIdentity.test.ts',
  'src/services/googleDriveDeviceRegistry.test.ts',
  'src/services/applySyncChanges.test.ts',
  'src/services/applyStagedInboxChanges.test.ts',
  'src/services/googleDriveSyncCoordinator.test.ts',
  'src/services/androidNativeSyncStateMigration.test.ts',
  'src/services/databaseMigrations.test.ts',
  'src/utils/localDate.test.ts',
];

for (const [index, file] of testFiles.entries()) {
  process.stdout.write(`\n[TEST ${index + 1}/${testFiles.length}] ${file}\n`);
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', file], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) {
    process.stderr.write(`Unable to start test ${file}: ${result.error.message}\n`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.stderr.write(`\nStopping after failed test file: ${file}\n`);
    process.exit(result.status ?? 1);
  }
}
process.stdout.write(`\nAll ${testFiles.length} test files passed sequentially.\n`);
