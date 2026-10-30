# Google OAuth platform setup for SRK Case Manager

## Security rules

- Register a separate OAuth client for each native platform.
- Android must use an Android OAuth client registered for package `in.srk.casemanage` and the signing certificate SHA-1 of the APK being tested.
- Windows must use a separate OAuth client of type **Desktop app**.
- Never put a client secret, refresh token, keystore, or signing password in the repository, Vite environment variables, APK, or EXE.
- Use the system browser for authorization. Do not use an embedded WebView.
- Use Authorization Code + PKCE (S256) for the Windows installed-app flow.
- Do not use loopback redirects on Android. Google documents that loopback redirects are deprecated for mobile apps and custom URI schemes are no longer supported on Android.
- Request only the minimum Google Drive scope needed by the sync design. The current Drive adapter is designed around app-created/app-opened files; do not broaden scopes without reviewing the data-access requirements.

## Android configuration

1. In Google Cloud Console, select the exact project that owns the enabled Google Drive API and OAuth consent configuration.
2. Open Google Auth Platform / Clients and verify the Android client is registered for package `in.srk.casemanage`.
3. Verify the SHA-1 fingerprint against the certificate that signs the APK installed on the device. A debug APK and a release-signed APK normally have different signing certificates.
4. Keep the Android client ID in the Android-specific configuration only. Do not copy a Windows Desktop client ID into the Android build.
5. Use Google's supported Android authorization integration. Do not implement a guessed redirect URI or custom scheme.

The project owner previously supplied this Android client ID:
`955204328722-v1ua9pml2su9smmv5v5ll3071vn03lms.apps.googleusercontent.com`
The owner reported its package/SHA-1 registration was checked in project `helical-crowbar-513210-p6`. This note records that report; it is not an independent Google Cloud verification.

## Windows configuration

1. In the same intended Google Cloud project, create a separate OAuth client with application type **Desktop app**.
2. Record its client ID for the Windows build configuration. Do not put its client secret into the application; installed desktop apps are public clients and cannot keep secrets confidential.
3. Implement the system-browser authorization-code flow with a loopback listener on a dynamically selected local port and PKCE S256.
4. Validate the returned OAuth `state`, bind the callback to the active authorization attempt, and close the listener after success, failure, or timeout.
5. Store any long-lived user token only through the platform secure-storage adapter. Do not log tokens or include them in sync journal records.

## Current implementation boundary

The repository now has platform-specific secure storage for short-lived access tokens:
- Windows: Electron `safeStorage`, exposed through restricted IPC from the trusted application window.
- Android: Capacitor secure-storage plugin backed by Android Keystore encryption.

The storage adapter is not itself an OAuth implementation. OAuth sign-in, PKCE, token expiry/refresh, revocation, and UI connection state are not yet wired. Until those parts are implemented and tested on both platforms, Google Drive must remain visibly disconnected and live sync must remain disabled.

## Authoritative Google documentation

- Desktop installed-app flow and PKCE: https://developers.google.com/identity/protocols/oauth2/native-app
- OAuth platform-specific client policy: https://developers.google.com/identity/protocols/oauth2/policies
- Secure token handling: https://developers.google.com/identity/protocols/oauth2/resources/best-practices
