package in.srk.capacitor.googledriveauth;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.os.Bundle;

import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.common.api.Scope;

import java.util.Collections;
import java.util.List;

public class GoogleDriveAuthorizationActivity extends Activity {
    private static final int AUTHORIZATION_REQUEST_CODE = 7314;
    private static final String DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) return;

        boolean showPicker = getIntent().getBooleanExtra("showPicker", true);
        AuthorizationRequest.Builder builder = AuthorizationRequest.builder()
            .setRequestedScopes(Collections.singletonList(new Scope(DRIVE_FILE_SCOPE)))
            .setOptOutIncludingGrantedScopes(true);
        if (showPicker) {
            builder.setPrompt(AuthorizationRequest.Prompt.CONSENT)
                .addResourceParameter(AuthorizationRequest.ResourceParameter.PICKER_OAUTH_TRIGGER, "true")
                .addResourceParameter(AuthorizationRequest.ResourceParameter.PICKER_ALLOW_FOLDER_SELECTION, "true");
        }
        AuthorizationRequest request = builder.build();

        Identity.getAuthorizationClient(this).authorize(request)
            .addOnSuccessListener(this, this::handleAuthorizationResult)
            .addOnFailureListener(this, error -> finishWithError("Google authorization could not be started. Please check Google Play services and try again."));
    }

    private void handleAuthorizationResult(AuthorizationResult result) {
        if (result.hasResolution()) {
            try {
                startIntentSenderForResult(
                    result.getPendingIntent().getIntentSender(),
                    AUTHORIZATION_REQUEST_CODE,
                    null,
                    0,
                    0,
                    0
                );
            } catch (IntentSender.SendIntentException error) {
                finishWithError("Unable to open the Google authorization screen.");
            }
            return;
        }
        finishWithAuthorization(result);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != AUTHORIZATION_REQUEST_CODE) return;
        if (resultCode != RESULT_OK || data == null) {
            finishWithError("Google Drive authorization was cancelled.");
            return;
        }
        try {
            AuthorizationResult result = Identity.getAuthorizationClient(this).getAuthorizationResultFromIntent(data);
            finishWithAuthorization(result);
        } catch (Exception error) {
            finishWithError("Google did not return a valid authorization result.");
        }
    }

    private void finishWithAuthorization(AuthorizationResult result) {
        String accessToken = result.getAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            finishWithError("Google did not grant a Drive access token.");
            return;
        }

        Bundle params = result.getTokenResponseParams();
        String rawIds = params == null ? null : params.getString("picked_file_ids");
        String[] ids = rawIds == null || rawIds.trim().isEmpty()
            ? new String[0]
            : rawIds.split(",");
        for (String id : ids) {
            if (!id.matches("[A-Za-z0-9_-]{1,256}")) {
                finishWithError("Google returned an invalid selected Drive item.");
                return;
            }
        }

        List<String> scopes = result.getGrantedScopes();
        String[] scopeArray = scopes == null ? new String[0] : scopes.toArray(new String[0]);
        Intent response = new Intent();
        response.putExtra("accessToken", accessToken);
        response.putExtra("pickedFileIds", ids);
        response.putExtra("grantedScopes", scopeArray);
        setResult(RESULT_OK, response);
        finish();
    }

    private void finishWithError(String message) {
        Intent response = new Intent();
        response.putExtra("error", message);
        setResult(RESULT_CANCELED, response);
        finish();
    }
}
