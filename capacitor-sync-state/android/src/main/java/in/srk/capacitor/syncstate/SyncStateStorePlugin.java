package in.srk.capacitor.syncstate;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.DocumentsContract;
import java.io.OutputStream;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "SyncStateStore")
public class SyncStateStorePlugin extends Plugin {
    private static final int MAX_KEY_LENGTH = 256;
    private static final int MAX_VALUE_LENGTH = 2 * 1024 * 1024;
    private static final String BACKUP_PREFS = "srk_backup_storage";
    private static final String BACKUP_TREE_URI = "selected_tree_uri";
    private SyncStateDatabase database;

    @Override
    public void load() {
        database = new SyncStateDatabase(getContext());
    }

    @PluginMethod
    public void getItems(PluginCall call) {
        JSArray requested = call.getArray("keys");
        if (requested == null || requested.length() > 500) {
            call.reject("A keys array with at most 500 entries is required.");
            return;
        }
        try {
            List<String> keys = new ArrayList<>();
            Set<String> uniqueKeys = new HashSet<>();
            for (int i = 0; i < requested.length(); i++) {
                String key = requested.getString(i);
                if (!validKey(key) || !uniqueKeys.add(key)) {
                    call.reject("Invalid or duplicate sync-state key.");
                    return;
                }
                keys.add(key);
            }
            List<SyncStateDatabase.SyncStateEntry> entries = database.getAll(keys);
            JSArray output = new JSArray();
            for (SyncStateDatabase.SyncStateEntry entry : entries) {
                JSObject item = new JSObject();
                item.put("key", entry.key);
                item.put("value", entry.value);
                output.put(item);
            }
            JSObject response = new JSObject();
            response.put("items", output);
            call.resolve(response);
        } catch (Exception error) {
            call.reject("Could not read native sync state.", error);
        }
    }

    @PluginMethod
    public void setItems(PluginCall call) {
        JSArray requested = call.getArray("items");
        if (requested == null || requested.length() > 500) {
            call.reject("An items array with at most 500 entries is required.");
            return;
        }
        try {
            List<SyncStateDatabase.SyncStateEntry> entries = new ArrayList<>();
            Set<String> uniqueKeys = new HashSet<>();
            for (int i = 0; i < requested.length(); i++) {
                JSObject item = JSObject.fromJSONObject(requested.getJSONObject(i));
                if (item == null) {
                    call.reject("Invalid sync-state entry.");
                    return;
                }
                String key = item.getString("key");
                String value = item.getString("value");
                if (!validKey(key) || value == null || value.length() > MAX_VALUE_LENGTH ||
                    !uniqueKeys.add(key)) {
                    call.reject("Invalid or duplicate sync-state entry.");
                    return;
                }
                entries.add(new SyncStateDatabase.SyncStateEntry(key, value));
            }
            int saved = database.putAll(entries);
            JSObject response = new JSObject();
            response.put("saved", saved);
            call.resolve(response);
        } catch (Exception error) {
            call.reject("Could not save native sync state.", error);
        }
    }

    @PluginMethod
    public void removeItems(PluginCall call) {
        JSArray requested = call.getArray("keys");
        if (requested == null || requested.length() > 500) {
            call.reject("A keys array with at most 500 entries is required.");
            return;
        }
        try {
            List<String> keys = new ArrayList<>();
            Set<String> uniqueKeys = new HashSet<>();
            for (int i = 0; i < requested.length(); i++) {
                String key = requested.getString(i);
                if (!validKey(key) || !uniqueKeys.add(key)) {
                    call.reject("Invalid or duplicate sync-state key.");
                    return;
                }
                keys.add(key);
            }
            JSObject response = new JSObject();
            response.put("removed", database.removeAll(keys));
            call.resolve(response);
        } catch (Exception error) {
            call.reject("Could not remove native sync state.", error);
        }
    }

    @PluginMethod
    public void selectBackupFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION |
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, intent, "handleBackupFolderResult");
    }

    @ActivityCallback
    private void handleBackupFolderResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null ||
                result.getData().getData() == null) {
            call.reject("Folder selection was cancelled.");
            return;
        }
        Uri treeUri = result.getData().getData();
        int flags = result.getData().getFlags() &
                (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        try {
            getContext().getContentResolver().takePersistableUriPermission(treeUri, flags);
            getContext().getSharedPreferences(BACKUP_PREFS, 0).edit()
                    .putString(BACKUP_TREE_URI, treeUri.toString()).apply();
            JSObject response = new JSObject();
            response.put("uri", treeUri.toString());
            response.put("displayName", DocumentsContract.getTreeDocumentId(treeUri));
            call.resolve(response);
        } catch (Exception error) {
            call.reject("Could not retain access to the selected backup folder.", error);
        }
    }

    @PluginMethod
    public void writeBackupFile(PluginCall call) {
        String fileName = call.getString("fileName");
        String content = call.getString("content");
        if (fileName == null || !fileName.matches("[A-Za-z0-9_-]+\\.json") ||
                content == null || content.length() > 50 * 1024 * 1024) {
            call.reject("A valid JSON backup filename and content up to 50 MiB are required.");
            return;
        }
        SharedPreferences preferences = getContext().getSharedPreferences(BACKUP_PREFS, 0);
        String savedUri = preferences.getString(BACKUP_TREE_URI, null);
        if (savedUri == null) {
            call.reject("Select an Android backup folder first.");
            return;
        }
        Uri treeUri = Uri.parse(savedUri);
        Uri parentUri = DocumentsContract.buildDocumentUriUsingTree(
                treeUri, DocumentsContract.getTreeDocumentId(treeUri));
        Uri createdUri = null;
        try {
            createdUri = DocumentsContract.createDocument(
                    getContext().getContentResolver(), parentUri, "application/json", fileName);
            if (createdUri == null) throw new IllegalStateException("Storage provider did not create the backup file.");
            try (OutputStream output = getContext().getContentResolver().openOutputStream(createdUri, "w")) {
                if (output == null) throw new IllegalStateException("Could not open the backup file for writing.");
                output.write(content.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                output.flush();
            }
            JSObject response = new JSObject();
            response.put("saved", true);
            response.put("uri", createdUri.toString());
            response.put("fileName", fileName);
            call.resolve(response);
        } catch (Exception error) {
            if (createdUri != null) {
                try { DocumentsContract.deleteDocument(getContext().getContentResolver(), createdUri); }
                catch (Exception ignored) { /* Preserve the original write error. */ }
            }
            call.reject("Could not save the backup in the selected Android folder.", error);
        }
    }

    private boolean validKey(String key) {
        return key != null && !key.trim().isEmpty() && key.length() <= MAX_KEY_LENGTH;
    }
}
