package in.srk.capacitor.syncstate;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

final class SyncStateDatabase extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "srk_sync_state_v1.db";
    private static final int DATABASE_VERSION = 1;
    private static final String TABLE = "sync_state";

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

    int putAll(java.util.List<SyncStateEntry> entries) {
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            long now = System.currentTimeMillis();
            for (SyncStateEntry entry : entries) {
                ContentValues values = new ContentValues();
                values.put("state_key", entry.key);
                values.put("state_value", entry.value);
                values.put("updated_at", now);
                db.insertWithOnConflict(TABLE, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            }
            db.setTransactionSuccessful();
            return entries.size();
        } finally {
            db.endTransaction();
        }
    }

    java.util.List<SyncStateEntry> getAll(java.util.List<String> keys) {
        java.util.List<SyncStateEntry> result = new java.util.ArrayList<>();
        if (keys.isEmpty()) return result;
        SQLiteDatabase db = getReadableDatabase();
        for (String key : keys) {
            try (Cursor cursor = db.query(TABLE, new String[]{"state_key", "state_value"},
                    "state_key = ?", new String[]{key}, null, null, null)) {
                if (cursor.moveToFirst()) {
                    result.add(new SyncStateEntry(cursor.getString(0), cursor.getString(1)));
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

    static final class SyncStateEntry {
        final String key;
        final String value;

        SyncStateEntry(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }
}
