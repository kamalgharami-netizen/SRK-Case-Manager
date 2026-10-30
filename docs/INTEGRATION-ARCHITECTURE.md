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

## Client WhatsApp and SMS automation

The product requirement includes automatic client-facing WhatsApp and SMS reminders, separately from Google Drive sync notifications.

### Required behaviour

- Provide per-client mobile number, preferred channel (WhatsApp, SMS, or both), language, consent status, consent timestamp/source, and opt-out status.
- Provide configurable reminder rules for hearing dates, next dates, payment due dates, document requests and manually approved case updates.
- Schedule reminders using the case's saved date and the user's configured local timezone. Re-check that the case/date is still current immediately before dispatch so rescheduled hearings do not trigger stale reminders.
- Use a durable server-side queue with retries, idempotency keys, delivery-status webhooks and an audit log. Do not send from a background timer that only runs while the Windows or Android app is open.
- Keep provider credentials on the HTTPS backend only. Never expose API keys in the frontend, APK, EXE or repository.
- Provide message templates in Bengali and English, preview/approval controls, quiet hours, duplicate prevention, delivery status and a manual pause/disable switch.
- Do not send sensitive legal case details in notification text by default. Use a neutral reminder and require the user to open the secured app for details.
- Respect client opt-in and opt-out. WhatsApp-initiated messages outside the active customer-service window must use approved templates. SMS sent in India must follow applicable TRAI/TCCCPR and DLT registration, sender header and content-template requirements.
- Do not claim a message was delivered based only on an API acceptance response; distinguish queued, submitted, delivered, failed and unknown statuses.

### Provider integration boundary

Implement a provider-neutral messaging interface with separate WhatsApp and SMS adapters. MSG91 is the selected provider following the user's approval. Its published API supports approved WhatsApp template messages and template-based SMS. Meta WhatsApp Business setup, approved templates, SMS DLT configuration, account onboarding and pricing review are still required before production use.

### Required user setup before live sending

- Select and register the WhatsApp Business sender/account with the chosen provider and complete Meta approval/template requirements.
- Register the sender entity, SMS header and applicable content templates on the relevant DLT portal/provider chain for Indian SMS.
- Configure backend-only API credentials and delivery-status webhooks.
- Record and verify each client's consent before enabling automated messages.

### Implementation status

- A server-only MSG91 transport adapter now exists at `messaging/msg91.ts` for the documented SMS Flow API and WhatsApp template API.
- The adapter reads `MSG91_AUTH_KEY`, `MSG91_SMS_TEMPLATE_ID` and `MSG91_WHATSAPP_INTEGRATED_NUMBER` from server environment variables. The example names are listed in `.env.example`; no real credentials are committed.
- The adapter is deliberately not exposed as a public Express route. The app currently has no verified remote user-authentication/session system, so adding a public send endpoint would allow unauthorized message abuse. It must only be called from a trusted backend queue worker after authentication, consent and scheduling checks.
- The scheduler, durable queue, authenticated backend API, consent UI, template-management UI, delivery webhook verification, delivery log and automatic reminders are not yet implemented.
- A provider acceptance response is not proof of delivery. Delivery must be confirmed through a validated MSG91 delivery webhook.

No message may be sent until provider onboarding, DLT/WhatsApp template setup, secure backend deployment, user authentication and explicit client consent are complete.

## Release acceptance checks

- Existing case records survive app restart and app upgrade.
- Core screens and local drafting remain usable in airplane mode.
- No API secret appears in the built frontend assets or repository.
- Cloud AI reports a clear unavailable state when the backend cannot be reached.
- Local AI is only shown as connected after a real health check succeeds.
- Android and Windows builds complete independently in GitHub Actions.

## Important

This document is a technical plan, not a claim that the local AI bridge, cloud deployment, or cross-device synchronisation has already been completed.
