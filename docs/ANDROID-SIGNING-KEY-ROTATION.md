# Android signing-key rotation runbook

## Why this is required

A signing keystore was previously committed to Git history. Removing it from the current branch and adding ignore rules does not remove historical copies. Treat the old key as exposed. Do not use it for a production release.

This runbook deliberately does not contain a keystore, password, alias secret, or encoded key.

## Before starting

- Confirm whether this app has already been distributed through Google Play.
- If Google Play App Signing is enabled, distinguish the **upload key** from the **app-signing key**. Resetting an upload key must follow the Play Console process; do not assume a newly generated key can replace the app-signing key.
- If the app has only been distributed by direct APK installation, confirm the update/signature implications before replacing the signing certificate. Android normally will not install an update over an app signed by a different certificate without an uninstall, which can remove local app data.
- Keep an independent encrypted backup of the new keystore. Never commit it to GitHub or attach it to an issue/chat.

## Create a replacement key on the owner's Windows computer

1. Use Android Studio's **Build > Generate Signed Bundle / APK** wizard and choose APK.
2. In the signing wizard, choose **Create new** for the Key store path. Save it outside the repository, for example in a private backup folder.
3. Create a strong keystore password, key alias, and key password. Keep them in a password manager.
4. Use a long validity period appropriate for the app's expected lifetime. Do not lose the keystore or passwords.
5. Record the public certificate SHA-1 and SHA-256 fingerprints using Android Studio's signing wizard or the Android SDK's `keytool -list -v -keystore <path>` command. Never share the keystore file itself.

## Configure GitHub Actions secrets

In the repository, open **Settings > Secrets and variables > Actions > New repository secret** and create/update these four names:

- `ANDROID_KEYSTORE_BASE64`: Base64 encoding of the replacement keystore file.
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password.
- `ANDROID_KEY_ALIAS`: the key alias.
- `ANDROID_KEY_PASSWORD`: the key password.

For Windows PowerShell, the keystore can be encoded locally without placing it in the repository:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\private\srk-release.keystore")) | Set-Clipboard
```
Paste the clipboard value directly into the GitHub secret field. Do not paste it into a chat, issue, commit, source file, or workflow log. Replace the example path with the actual private path.

## Update Google Cloud OAuth registration

1. Open the Android OAuth client in Google Cloud project `helical-crowbar-513210-p6`.
2. Confirm package name `in.srk.casemanage`.
3. Replace/add the SHA-1 fingerprint corresponding to the signing certificate that will actually sign the distributed APK. Keep SHA-256 recorded for verification.
4. If Google Play App Signing is used, register the Play app-signing certificate for installed Play builds and the upload certificate only where the relevant Google configuration requires it. Verify the exact distribution path before changing OAuth fingerprints.

## Verify the replacement

1. Trigger the Android + Windows GitHub Actions workflow on `feature/google-drive-two-way-sync`.
2. Confirm the Android job used the signed Release APK path, not the debug fallback artifact.
3. Download the APK artifact and inspect its signer with Android SDK `apksigner verify --print-certs`.
4. Compare the reported SHA-1 and SHA-256 with the replacement certificate and Google Cloud configuration.
5. Test installation/update behaviour on a real device with a backup of important local case data.
6. Test Android Google sign-in and Drive Picker on the signed APK. Then test a real Windows-to-Android and Android-to-Windows sync round trip.

## Release gate

Do not merge PR #7 or describe Google Drive sync as production-ready until:
- replacement signing material is stored only in GitHub Actions secrets and independently backed up securely;
- the signed APK fingerprint is verified and the OAuth registration matches;
- physical-device authorization/Picker and cross-device sync tests pass.

CI build success alone is not proof of these release conditions.
