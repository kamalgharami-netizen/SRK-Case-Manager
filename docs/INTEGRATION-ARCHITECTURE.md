# SRK Case Manager — integration plan

## Chosen operating model

The application is intended to support three selectable capabilities in one offline-first product:

| Capability | Windows | Android | Internet |
|---|---|---|---|
| Core case management and local records | Local | Local | Not required |
| Local AI provider | Local model service such as Ollama/LM Studio | Only where a compatible on-device/local-network model is available | Not inherently required |
| Cloud AI and remote services | HTTPS backend | HTTPS backend | Required |

These are complementary modes, not three separate applications. Offline records must remain available when a cloud service is unreachable.

## Current integration boundary

- The React application is built by Vite.
- Electron loads the generated static web application.
- Capacitor packages the generated static web application for Android.
- `server.ts` exposes Express routes including `/api/ai/observe-facts` and `/api/ai/draft`.
- The Electron and Android packages do not currently include or start a production Express service. A relative `/api/...` request from an installed package is therefore not a valid production backend connection by itself.

## Required implementation stages

1. Keep the Windows and Android build pipelines reproducible and independent.
2. Introduce a typed provider boundary for AI: local provider, remote HTTPS provider, and unavailable/offline fallback.
3. Keep Gemini credentials exclusively on a server. The mobile/desktop client must never contain a Gemini secret.
4. Package a supported local-service bridge for Windows, and define a separately tested Android local-model strategy rather than assuming Android can run Ollama.
5. Configure a remote HTTPS backend URL and deployment environment for cloud AI. Do not hard-code an unowned hosting URL.
6. Add visible connection status, provider selection, timeouts, retry handling and graceful offline behavior.
7. Test the Windows installer and Android APK on actual devices, including loss of internet and restoration of connectivity.

## Selected cloud provider: Google Drive

Google Drive is the selected cloud storage provider for cross-device backup and synchronisation. The selected Drive folder is a cloud destination, not a local Windows/Android filesystem path.

### Intended behaviour

- Keep the existing local-first case database available offline on both Windows and Android.
- Let the user sign in with Google and select a Drive folder using the official Google Picker flow.
- Store the selected Drive folder ID and account identity as configuration; do not store a guessed local path.
- Upload local changes and download remote changes through the Google Drive API when connectivity is available.
- Track per-record change IDs/revisions and device IDs. Do not replace the entire local database with a remote snapshot.
- Detect concurrent edits and retain both versions for user resolution rather than silently overwriting data.
- Show last successful sync time, pending changes, errors and a manual Sync Now action. Notify the user when sync succeeds or fails.
- Keep backup/export separate from live two-way sync. A backup file alone is not a conflict-safe sync protocol.

### Google Cloud setup required before live integration

Create or choose one Google Cloud project and enable Google Drive API and Google Picker API. Create a restricted API key for Picker and OAuth 2.0 client IDs appropriate to the actual application platforms (web, Android and desktop as applicable). The Picker requires the project number (App ID), API key and an OAuth access token. Request the narrow https://www.googleapis.com/auth/drive.file scope where it satisfies the selected-file/folder workflow.

The exact OAuth redirect/callback configuration must be implemented and tested separately for the Electron desktop package and Capacitor Android package. Do not put a client secret or refresh token in frontend source, Vite environment variables, the APK or the EXE. Persist long-lived credentials only through an appropriate secure native/backend design.

Required configuration values to supply during implementation:

- Google Cloud project number (Picker App ID)
- Google Picker / Drive API key (with API restrictions)
- OAuth client ID(s) for the approved app platforms
- Verified redirect/callback URI(s), after the app OAuth flow is selected

No Google credentials have been configured in this repository yet. The Google Drive picker, live sync, conflict handling and sync notifications are not yet implemented. Do not display a connected/synced status until a real Google API operation succeeds.

## Release acceptance checks

- Existing case records survive app restart and app upgrade.
- Core screens and local drafting remain usable in airplane mode.
- No API secret appears in the built frontend assets or repository.
- Cloud AI reports a clear unavailable state when the backend cannot be reached.
- Local AI is only shown as connected after a real health check succeeds.
- Android and Windows builds complete independently in GitHub Actions.

## Important

This document is a technical plan, not a claim that the local AI bridge, cloud deployment, or cross-device synchronisation has already been completed.
