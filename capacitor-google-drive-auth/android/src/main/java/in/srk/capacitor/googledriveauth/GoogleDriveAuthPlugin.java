package in.srk.capacitor.googledriveauth;

import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

@CapacitorPlugin(name = "GoogleDriveAuth")
public class GoogleDriveAuthPlugin extends Plugin {
    @PluginMethod
    public void authorize(PluginCall call) {
        Intent intent = new Intent(getContext(), GoogleDriveAuthorizationActivity.class);
        intent.putExtra("showPicker", call.getBoolean("showPicker", true));
        startActivityForResult(call, intent, "authorizationActivityResult");
    }

    @ActivityCallback
    private void authorizationActivityResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        Intent data = result.getData();
        if (result.getResultCode() != android.app.Activity.RESULT_OK || data == null) {
            String error = data == null ? null : data.getStringExtra("error");
            call.reject(error == null ? "Google Drive authorization was cancelled." : error);
            return;
        }

        String accessToken = data.getStringExtra("accessToken");
        String[] pickedIds = data.getStringArrayExtra("pickedFileIds");
        String[] grantedScopes = data.getStringArrayExtra("grantedScopes");
        if (accessToken == null || accessToken.isEmpty()) {
            call.reject("Google did not return a Drive access token.");
            return;
        }

        JSObject response = new JSObject();
        response.put("accessToken", accessToken);
        JSArray ids = new JSArray();
        if (pickedIds != null) {
            for (String id : pickedIds) {
                try { ids.put(id); } catch (JSONException ignored) {}
            }
        }
        JSArray scopes = new JSArray();
        if (grantedScopes != null) {
            for (String scope : grantedScopes) {
                try { scopes.put(scope); } catch (JSONException ignored) {}
            }
        }
        response.put("pickedFileIds", ids);
        response.put("grantedScopes", scopes);
        call.resolve(response);
    }
}
