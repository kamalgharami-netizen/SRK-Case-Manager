package in.srk.capacitor.syncstate;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

final class SyncStateDatabase extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "srk_sync_state_v1.db";
    private static final int DATABASE_VERSION = 1;
    private static final String TABLE = "sync_state";
    private static final String KEY_ALIAS = "srk_sync_state_aes_gcm_v1";
    private static final int GCM_TAG_LENGTH_BITS = 128;

    SyncStateDatabase(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        setWriteAheadLoggingEnabled(true);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + TABLE +
            " (state_key TEXT PRIMARY KEY NOT NULL, state_value TEXT NOT NULL, updated_at INTEGER NOT NULL)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // No destructive migrations. Future schema changes must be additive and versioned.
        throw new IllegalStateException("Unsupported sync-state database upgrade: " + oldVersion + " -> " + newVersion);
    }

    int putAll(java.util.List<SyncStateEntry> entries) throws Exception {
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            long now = System.currentTimeMillis();
            for (SyncStateEntry entry : entries) {
                ContentValues values = new ContentValues();
                values.put("state_key", entry.key);
                values.put("state_value", encrypt(entry.value));
                values.put("updated_at", now);
                long rowId = db.insertWithOnConflict(TABLE, null, values, SQLiteDatabase.CONFLICT_REPLACE);
                if (rowId == -1) throw new IllegalStateException("Native sync-state row could not be saved.");
            }
            db.setTransactionSuccessful();
            return entries.size();
        } finally {
            db.endTransaction();
        }
    }

    java.util.List<SyncStateEntry> getAll(java.util.List<String> keys) throws Exception {
        java.util.List<SyncStateEntry> result = new java.util.ArrayList<>();
        if (keys.isEmpty()) return result;
        SQLiteDatabase db = getReadableDatabase();
        for (String key : keys) {
            try (Cursor cursor = db.query(TABLE, new String[]{"state_key", "state_value"},
                    "state_key = ?", new String[]{key}, null, null, null)) {
                if (cursor.moveToFirst()) {
                    result.add(new SyncStateEntry(cursor.getString(0), decrypt(cursor.getString(1))));
                }
            }
        }
        return result;
    }

    int removeAll(java.util.List<String> keys) {
        if (keys.isEmpty()) return 0;
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            int removed = 0;
            for (String key : keys) {
                removed += db.delete(TABLE, "state_key = ?", new String[]{key});
            }
            db.setTransactionSuccessful();
            return removed;
        } finally {
            db.endTransaction();
        }
    }

    private String encrypt(String plainText) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
        return Base64.encodeToString(combined, Base64.NO_WRAP);
    }

    private String decrypt(String encoded) throws Exception {
        byte[] combined = Base64.decode(encoded, Base64.NO_WRAP);
        if (combined.length <= 12) throw new IllegalStateException("Encrypted sync-state value is malformed.");
        byte[] iv = new byte[12];
        byte[] encrypted = new byte[combined.length - iv.length];
        System.arraycopy(combined, 0, iv, 0, iv.length);
        System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
        return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        java.security.Key existing = keyStore.getKey(KEY_ALIAS, null);
        if (existing instanceof SecretKey) return (SecretKey) existing;

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setRandomizedEncryptionRequired(true)
                .build());
        return generator.generateKey();
    }

    static final class SyncStateEntry {
        final String key;
        final String value;

        SyncStateEntry(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }
}
