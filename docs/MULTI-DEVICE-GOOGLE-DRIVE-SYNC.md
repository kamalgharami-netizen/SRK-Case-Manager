# Multi-device Google Drive Sync — Product and Engineering Requirements

Date: 2026-11-02
Repository: `kamalgharami-netizen/SRK-Case-Manager`
Target branch: `feature/google-drive-two-way-sync`

## Product requirement

A customer installs SRK Case Manager on Windows and/or Android, connects their own Google Account using the in-app Google sign-in flow, and can use the same customer data on up to 10 registered devices.

- Each customer connects their own Google Account. The developer's Google Account must never be used as a shared storage account.
- One Google Drive account is the shared cloud store for that customer's devices.
- The supported device limit is 10 active registered devices per customer/Drive account.
- A change made on one device must be discoverable and synchronized to the other connected devices.
- Offline edits remain local and enter the outbound queue; they are uploaded when connectivity and authorization are available.
- Remote edits are staged and reviewed under the existing conflict-safety policy; no silent last-write-wins overwrite of business/legal records.
- A device can be disconnected/revoked, and a replacement device can be registered.
- Windows and Android must use the same sync protocol and compatible data format.

## User experience

1. Open Settings → Google Drive Sync.
2. Select Connect Google Drive.
3. Choose the user's own Google Account and approve the requested permissions.
4. Create or select the SRK Case Manager data folder.
5. Show connection status, account identity (non-secret), last successful sync, and registered-device count.
6. On another device, repeat the same flow with the same Google Account and select the same SRK data folder.
7. Show a clear warning when the 10-device limit is reached and provide a device-management screen to revoke an old device.

No API key, OAuth client secret, refresh token, or developer credential is entered by the customer. OAuth client configuration belongs to the distributed app and must not contain a client secret in the APK.

## Data isolation and security

- A customer's Drive data is isolated by that customer's Google account and selected SRK data folder.
- Never mix records between different Google accounts or tenants.
- Store OAuth tokens only in platform secure storage; never in Drive files, logs, exported business records, or repository files.
- Store only non-secret device metadata in the device registry: stable random device ID, platform, app version, friendly device label, created/last-seen timestamps, and revoked status.
- Do not store passwords, signing keys, or private credentials in the sync folder.
- Disconnect must revoke/clear local authorization where supported and stop future sync on that device. It must not delete the customer's cloud data.
- Provide an explicit separate action for deleting cloud data, with confirmation and backup safeguards.

## Sync protocol requirements

- Keep stable globally unique record IDs and change IDs.
- Use an append-only change journal or equivalent idempotent envelopes, with per-device outbound acknowledgement.
- Include schema version, entity type, record ID, change ID, origin device ID, base revision, creation time, and tombstone/delete marker.
- Pull remote changes before pushing local changes; deduplicate by change ID.
- Acknowledge an outbound change only after Drive confirms the upload.
- Use bounded pagination and persist Drive page tokens safely.
- Detect concurrent edits using base revision / entity revision; stage conflicts for user review.
- Deletions must be represented by tombstones so they propagate to other devices; do not infer deletion from a missing file.
- Retries must be idempotent and must not create duplicate records.
- Preserve pending changes through app restart, device restart, network loss, and token expiry.
- Surface authentication-required, quota, network, permission, and conflict states distinctly.
- Never report sync success until all required upload/download operations have been confirmed.

## Device limit and concurrency caveat

Google Drive file storage does not provide a transactional database, atomic compare-and-swap, or reliable server-side enforcement of a strict 10-device cap. A registry file in Drive alone cannot guarantee race-free device registration if several new devices register simultaneously.

Therefore:
- Treat the 10-device limit as a release requirement, not as already implemented.
- Before claiming a strict enforced limit, implement an authoritative registration/lease mechanism (for example, a small authenticated sync service) or document and test a clearly bounded best-effort Drive-only approach.
- If a service is introduced, it must not become the sole copy of customer business data unless separately designed and approved; Drive remains the customer's data store.
- Device registration, revocation, and simultaneous sync must have automated concurrency tests.

## Background sync boundary

The current architecture document records that Android's native SQLite sync-state scaffold is not yet wired to the live sync journal, and Android currently has no verified refresh-token/background credential-renewal path. Do not enable WorkManager or claim unattended background sync until the shared durable state and supported credential renewal are implemented and tested.

## Implementation sequence

1. Audit and document the existing Drive data format, account binding, sync journal, conflict handling, and device identity.
2. Add account/folder identity validation so devices cannot accidentally sync different accounts or folders.
3. Implement and test the shared device registry and device-management UI, including the 10-device policy and revocation.
4. Harden durable sync state and idempotent change envelopes across Windows and Android.
5. Implement tombstones, conflict handling, crash/retry, pagination, and simultaneous-edit tests.
6. Complete OAuth consent/verification and test independent customer Google Accounts.
7. Complete physical tests with 2, then 3, then 10 devices; include Windows↔Android and Android↔Android round trips.
8. Only then describe the 10-device experience as production-ready.

## Acceptance tests

- Two different customer Google Accounts cannot see or overwrite each other's data.
- Two devices using the same account and folder exchange a new record in both directions.
- Update and delete on one device propagate safely to the other devices.
- Offline edits sync after reconnect without duplication.
- Two devices editing the same record produce a visible conflict; neither edit is silently lost.
- A revoked device cannot continue syncing after its authorization/registration expires.
- The 10th device can register; an 11th active device is refused with a clear message (after authoritative enforcement exists).
- Replacing a device does not delete the customer's cloud data.
- Reinstall/replacement-PC recovery is documented and tested.
- No signing key, OAuth secret, access token, or private credential appears in logs, repository, or Drive business data.

## Verified implementation status on 2026-11-02

This document records the approved product requirement and implementation plan. It does not claim that 10-device registration, strict device-limit enforcement, independent-customer OAuth onboarding, or 10-device synchronization is implemented or tested. The existing Draft PR and release gates remain in force.


## Initial code audit (2026-11-02)

Reviewed the current branch implementation:

- `syncGoogleDriveNow()` validates that an access token and folder ID exist, then performs a bounded pull before push. It stages inbound changes and reports staged conflicts; it does not apply remote data directly to the live database.
- `pushPendingChanges()` writes immutable per-change JSON files with deterministic names and verifies an existing file's complete envelope before acknowledging a retry. This is a useful idempotency foundation.
- The current sync journal stores pending changes and a bounded list of acknowledged change IDs. It validates change envelopes and preserves unreadable journal data rather than overwriting it.
- The coordinator receives an access token and folder ID from its caller. The reviewed coordinator itself does not establish a cross-device account/folder identity binding or a registered-device limit.
- The OAuth token-session service can refresh a token only when a refresh token exists. The previously recorded Android authorization flow currently stores `refreshToken: null`; therefore unattended Android background sync is not yet verified.
- The existing native Android encrypted SQLite sync-state scaffold is not yet the live journal/inbox store, as recorded in `ANDROID-BACKGROUND-SYNC-ARCHITECTURE.md`.

### Audit conclusion

The existing immutable change-envelope and staged-conflict design can be extended, but it is not evidence of a completed multi-device product. Before implementing a device registry, inspect and test the actual account-selection, folder-picker, device-ID creation, and Windows/Android storage adapters. Do not enable a production 10-device cap or claim all-device automatic updates until those paths and a concurrency-safe registration authority are implemented.
