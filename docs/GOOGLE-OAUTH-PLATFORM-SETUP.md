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
3. The repository now includes Windows PKCE request primitives in `src/services/googleOAuthPkce.ts`.
4. The Electron main process now provides a loopback callback listener bound to `127.0.0.1` on a dynamically selected port, with a fixed callback path, state validation, a three-minute timeout, and explicit cancellation.
5. The main process opens only HTTPS authorization URLs on `accounts.google.com` in the system browser. The renderer receives a narrow preload API; it cannot choose an arbitrary URL or listener address.
6. The callback listener is covered by Node tests for valid state, rejected state, OAuth errors, and invalid state input.
7. The Windows Desktop client ID, end-to-end authorization-code exchange using the PKCE verifier, token expiry/revocation handling, and UI connection flow are still outstanding. Store any access token only through the platform secure-storage adapter. Do not log tokens or include them in sync journal records.

## Current implementation boundary

The repository now has platform-specific secure storage for short-lived access tokens:
- Windows: Electron `safeStorage`, exposed through IPC restricted to the exact local application frame.
- Android: Capacitor secure-storage plugin backed by Android Keystore encryption.

The Windows OAuth callback listener is included in the packaged EXE. It binds only to `127.0.0.1`, uses a dynamically assigned port and fixed callback path, validates the per-request state, times out, and is cancelled when the app closes. Its tests are part of the project test command.

The storage adapter is not itself a complete OAuth implementation. Windows now has PKCE request preparation and a main-process loopback callback listener, but no verified Windows Desktop client ID or authorization-code token exchange has been configured. Android native Google authorization is also not yet implemented. Token expiry/refresh, revocation, and the UI connection state remain outstanding. Until each platform's complete sign-in and token lifecycle is implemented and tested, Google Drive must remain visibly disconnected and live sync must remain disabled.

## Authoritative Google documentation

- Desktop installed-app flow and PKCE: https://developers.google.com/identity/protocols/oauth2/native-app
- OAuth platform-specific client policy: https://developers.google.com/identity/protocols/oauth2/policies
- Secure token handling: https://developers.google.com/identity/protocols/oauth2/resources/best-practices
