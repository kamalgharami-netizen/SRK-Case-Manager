package in.srk.capacitor.syncstate;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "SyncStateStore")
public class SyncStateStorePlugin extends Plugin {
    private static final int MAX_KEY_LENGTH = 256;
    private static final int MAX_VALUE_LENGTH = 2 * 1024 * 1024;
    private SyncStateDatabase database;

    @Override
    public void load() {
        database = new SyncStateDatabase(getContext());
    }

    @PluginMethod
    public void getItems(PluginCall call) {
        JSArray requested = call.getArray("keys");
        if (requested == null) {
            call.reject("A keys array is required.");
            return;
        }
        try {
            List<String> keys = new ArrayList<>();
            for (int i = 0; i < requested.length(); i++) {
                String key = requested.getString(i);
                if (!validKey(key)) {
                    call.reject("Invalid sync-state key.");
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
            java.util.Set<String> uniqueKeys = new java.util.HashSet<>();
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
        } catch (JSONException | RuntimeException error) {
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
            for (int i = 0; i < requested.length(); i++) {
                String key = requested.getString(i);
                if (!validKey(key)) {
                    call.reject("Invalid sync-state key.");
                    return;
                }
                keys.add(key);
            }
            JSObject response = new JSObject();
            response.put("removed", database.removeAll(keys));
            call.resolve(response);
        } catch (JSONException | RuntimeException error) {
            call.reject("Could not remove native sync state.", error);
        }
    }

    private boolean validKey(String key) {
        return key != null && !key.trim().isEmpty() && key.length() <= MAX_KEY_LENGTH;
    }
}
