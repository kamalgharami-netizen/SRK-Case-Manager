# SRK Case Manager

A bilingual (Bengali/English) legal case-management and document-drafting application built with React, TypeScript, Vite, Electron and Capacitor.

## Supported application packages

- **Windows:** Electron application packaged as an NSIS installer.
- **Android:** Capacitor application packaged as an APK.
- **Local data:** Existing company, case and legal-workflow data remains in the app's local storage. Sync metadata uses platform-specific storage; Android's native sync-state store is encrypted.

## Development

Requirements: Node.js 22 and npm. Android builds additionally require Java 21 and the Android SDK. Windows installer builds require Windows and Electron Builder.

```bash
npm install --legacy-peer-deps
npm run dev
```

Validation commands:

```bash
npm run lint
npm test
npm run build
```

Build a Windows installer locally on Windows:

```bash
npm run dist:win
```

For Android, build the web app, add/synchronise the Capacitor platform if needed, then run the Gradle build from the `android` directory. GitHub Actions is the maintained path for producing the paired Android and Windows artifacts.

## GitHub Actions builds

The workflow **SRK Case Manager - Android APK + Windows EXE** builds both packages for the feature branch and pull requests targeting `main`. Open the Actions run for the exact commit and download the APK and Windows installer from that run's **Artifacts** section. Do not mix artifacts from different commits.

The verified run #890 for source commit `81b3ef2dfef0aee77ac1b55792d9e7a4bb8bd3ac` completed successfully:
- TypeScript check, serial sync safety tests and web build passed.
- Android native sync-store instrumentation tests passed on the CI emulator.
- Signed Android release APK packaging and APK signature verification passed.
- Windows installer packaging and artifact upload passed.

The next build is triggered by subsequent UI preset changes and must pass before those changes are considered CI-verified. CI success is not a substitute for testing the installed packages on physical devices.

## Google Drive synchronisation — current boundary

The project contains a foreground Google Drive sync flow, local outbound journal, remote change inbox, staged review, conflict handling, tombstones, device registry, and Android encrypted sync-state storage. Automatic foreground sync and the Settings **Sync Now** action use the asynchronous sync runner. Remote changes are staged for review rather than silently overwriting local legal/business records.

The following must still be verified before production release:
- Physical Android Google sign-in, folder Picker, encrypted native-store migration and restart/recovery.
- Physical Windows Google OAuth and folder Picker.
- Real Windows-to-Android and Android-to-Windows record round trips.
- Concurrent edits, conflict resolution, deletion/tombstone propagation, pagination, offline retry, restart/recovery, account/folder mismatch and device revocation.
- The 10-device registry is best-effort under simultaneous registrations; strict race-free device-limit enforcement is not established.

**Background-sync limits:** Android WorkManager background sync is not implemented. Windows retry is limited to the running application; full-exit background sync is not implemented. Do not treat a successful package build or an account-authorized status as proof that cross-device data has synchronised.

See:
- `docs/GOOGLE-DRIVE-SYNC-IMPLEMENTATION-STATUS.md`
- `docs/MULTI-DEVICE-GOOGLE-DRIVE-SYNC.md`
- `docs/ANDROID-BACKGROUND-SYNC-ARCHITECTURE.md`
- `docs/PHYSICAL-DEVICE-SYNC-ACCEPTANCE.md`

## AI and connectivity

The development API routes are implemented in `server.ts` and use the server-side `GEMINI_API_KEY` environment variable. The packaged Electron and Capacitor applications do not include a separately deployed Express API service. Therefore, cloud AI requests in installed packages require a secure, reachable backend deployment; a successful APK/EXE build does not prove cloud AI is configured.

Never put API keys, OAuth client secrets, refresh tokens, access tokens or private signing material in frontend code, `VITE_*` variables, committed files or logs.

## Environment variables

For local server development, create `.env.local` from `.env.example` and set the required server-side variables. Never commit the real `.env.local` file.

## Security and release gates

- The Android CI workflow uses a persistent release-signing identity and verifies the APK signature. The existing signing identity has a known historical exposure in Git history; the owner has deferred key rotation during direct-APK testing to avoid disrupting test updates. Resolve the final Play App Signing/upload-key arrangement and update the Android OAuth SHA-1 registration before Google Play production release.
- Windows installer Authenticode signing is not configured; a successful EXE build is not a signed Windows release.
- Keep PR #7 Draft and unmerged until physical-device acceptance tests and the remaining production release gates are complete.
- Test upgrades with a separate test company and a verified backup. Never test destructive sync operations against the only copy of real case data.
