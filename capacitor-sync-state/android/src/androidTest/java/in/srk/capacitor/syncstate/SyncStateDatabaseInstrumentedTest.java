package in.srk.capacitor.syncstate;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

@RunWith(AndroidJUnit4.class)
public class SyncStateDatabaseInstrumentedTest {
    private static final String DATABASE_NAME = "srk_sync_state_v1.db";
    private static final String KEY_ALIAS = "srk_sync_state_aes_gcm_v1";
    private Context context;

    @Before
    public void setUp() throws Exception {
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        databaseFile().delete();
        deleteKeystoreAlias();
    }

    @After
    public void tearDown() throws Exception {
        if (context != null) databaseFile().delete();
        deleteKeystoreAlias();
    }

    @Test
    public void valuesSurviveDatabaseReopenAndCanBeRemoved() throws Exception {
        SyncStateDatabase database = new SyncStateDatabase(context);
        database.putAll(Arrays.asList(
            new SyncStateDatabase.SyncStateEntry("test.one", "first-value"),
            new SyncStateDatabase.SyncStateEntry("test.two", "second-value")
        ));
        database.close();

        SyncStateDatabase reopened = new SyncStateDatabase(context);
        List<SyncStateDatabase.SyncStateEntry> restored =
            reopened.getAll(Arrays.asList("test.one", "test.two"));
        assertEquals(2, restored.size());
        assertEquals("first-value", restored.get(0).value);
        assertEquals("second-value", restored.get(1).value);

        assertEquals(1, reopened.removeAll(Arrays.asList("test.one")));
        assertEquals(1, reopened.getAll(Arrays.asList("test.two")).size());
        assertTrue(reopened.getAll(Arrays.asList("test.one")).isEmpty());
        reopened.close();
    }

    @Test
    public void databaseIsStoredOutsideAndroidAutoBackupDirectory() throws Exception {
        SyncStateDatabase database = new SyncStateDatabase(context);
        database.putAll(Arrays.asList(
            new SyncStateDatabase.SyncStateEntry("test.backup-policy", "local-only")
        ));
        database.close();

        String noBackupPath = context.getNoBackupFilesDir().getAbsolutePath() + File.separator;
        assertTrue("Sync database must be in Android's no-backup directory",
            databaseFile().getAbsolutePath().startsWith(noBackupPath));
        assertTrue(databaseFile().isFile());
    }

    @Test
    public void sqliteStoresCiphertextRatherThanPlaintext() throws Exception {
        String plainText = "do-not-store-this-plain-text";
        SyncStateDatabase database = new SyncStateDatabase(context);
        database.putAll(Arrays.asList(
            new SyncStateDatabase.SyncStateEntry("test.encrypted", plainText)
        ));
        database.close();

        SQLiteDatabase raw = SQLiteDatabase.openDatabase(
            databaseFile().getAbsolutePath(),
            null,
            SQLiteDatabase.OPEN_READONLY
        );
        try (Cursor cursor = raw.rawQuery(
                "SELECT state_value FROM sync_state WHERE state_key = ?",
                new String[]{"test.encrypted"})) {
            assertTrue(cursor.moveToFirst());
            String stored = cursor.getString(0);
            assertNotNull(stored);
            assertFalse("SQLite must not contain the supplied plaintext", stored.contains(plainText));
            assertTrue("Stored payload should be Base64 ciphertext", stored.matches("[A-Za-z0-9+/]+=*"));
        } finally {
            raw.close();
        }
    }

    @Test
    public void missingKeystoreKeyDoesNotReplaceOrOverwriteExistingCiphertext() throws Exception {
        SyncStateDatabase database = new SyncStateDatabase(context);
        database.putAll(Arrays.asList(
            new SyncStateDatabase.SyncStateEntry("test.preserve", "preserve-this-value")
        ));
        database.close();

        String ciphertextBefore = readStoredCiphertext("test.preserve");
        deleteKeystoreAlias();

        SyncStateDatabase reopened = new SyncStateDatabase(context);
        try {
            reopened.getAll(Arrays.asList("test.preserve"));
            fail("A missing key with existing encrypted rows must fail safely.");
        } catch (IllegalStateException expected) {
            assertTrue(expected.getMessage().contains("encrypted sync data still exists"));
        } finally {
            reopened.close();
        }

        assertEquals(ciphertextBefore, readStoredCiphertext("test.preserve"));
    }

    private File databaseFile() {
        return new File(context.getNoBackupFilesDir(), DATABASE_NAME);
    }

    private String readStoredCiphertext(String key) {
        SQLiteDatabase raw = SQLiteDatabase.openDatabase(
            databaseFile().getAbsolutePath(),
            null,
            SQLiteDatabase.OPEN_READONLY
        );
        try (Cursor cursor = raw.rawQuery(
                "SELECT state_value FROM sync_state WHERE state_key = ?",
                new String[]{key})) {
            assertTrue(cursor.moveToFirst());
            return cursor.getString(0);
        } finally {
            raw.close();
        }
    }

    private void deleteKeystoreAlias() throws Exception {
        java.security.KeyStore keyStore = java.security.KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) keyStore.deleteEntry(KEY_ALIAS);
    }
}
