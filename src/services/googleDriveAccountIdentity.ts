/**
 * Resolves the signed-in Google account to its stable OpenID Connect subject.
 * The subject is used only as an opaque account binding; email is never stored
 * in the shared device registry.
 */
export interface GoogleDriveAccountIdentity {
  accountId: string;
  email?: string;
}

export async function getGoogleDriveAccountIdentity(accessToken: string): Promise<GoogleDriveAccountIdentity> {
  if (!accessToken?.trim()) throw new Error('A Google access token is required to identify the connected account.');
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(response.status === 401 || response.status === 403
      ? 'Google account identity permission is missing or expired. Reconnect Google Drive.'
      : 'Google account identity could not be verified. Please try again.');
  }
  const profile = await response.json() as { sub?: unknown; email?: unknown };
  if (typeof profile.sub !== 'string' || !profile.sub.trim() || profile.sub.length > 256) {
    throw new Error('Google did not return a valid account identity.');
  }
  return {
    accountId: profile.sub,
    ...(typeof profile.email === 'string' && profile.email.length <= 320 ? { email: profile.email } : {}),
  };
}
