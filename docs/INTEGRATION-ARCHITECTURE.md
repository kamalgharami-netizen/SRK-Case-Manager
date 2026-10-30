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

## Release acceptance checks

- Existing case records survive app restart and app upgrade.
- Core screens and local drafting remain usable in airplane mode.
- No API secret appears in the built frontend assets or repository.
- Cloud AI reports a clear unavailable state when the backend cannot be reached.
- Local AI is only shown as connected after a real health check succeeds.
- Android and Windows builds complete independently in GitHub Actions.

## Important

This document is a technical plan, not a claim that the local AI bridge, cloud deployment, or cross-device synchronisation has already been completed.
