const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const { createGoogleOAuthLoopbackListener } = require("./googleOAuthLoopback.cjs");
const path = require("path");
const fs = require("fs/promises");


const TOKEN_FILE = "google-drive-token.enc";
const OAUTH_CREDENTIALS_FILE = "google-drive-oauth-credentials.enc";

async function getTokenFilePath() {
  return path.join(app.getPath("userData"), TOKEN_FILE);
}

function assertTrustedRenderer(event) {
  const expectedFile = path.join(__dirname, "dist", "index.html");
  let senderUrl = "";
  try {
    senderUrl = event.senderFrame && event.senderFrame.url
      ? new URL(event.senderFrame.url).href
      : "";
  } catch {
    senderUrl = "";
  }
  let expectedUrl = "";
  try {
    expectedUrl = require("url").pathToFileURL(expectedFile).href;
  } catch {
    expectedUrl = "";
  }
  if (!mainWindow || mainWindow.isDestroyed() ||
      event.sender !== mainWindow.webContents ||
      !senderUrl || senderUrl !== expectedUrl) {
    throw new Error("Untrusted renderer is not allowed to access secure application IPC.");
  }
}

function requireSecureTokenStorage() {
  if (!app.isReady() || !app.safeStorage || !app.safeStorage.isEncryptionAvailable()) {
    throw new Error("Windows secure token storage is unavailable on this device.");
  }
}

ipcMain.handle("srk-token:get", async (event) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  try {
    const encrypted = await fs.readFile(await getTokenFilePath());
    return app.safeStorage.decryptString(encrypted);
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw new Error("Unable to read the encrypted Google Drive token.");
  }
});

ipcMain.handle("srk-token:set", async (event, token) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  if (typeof token !== "string" || token.length < 1 || token.length > 16384) {
    throw new Error("Invalid Google Drive token value.");
  }
  const filePath = await getTokenFilePath();
  const tempPath = filePath + ".tmp";
  const encrypted = app.safeStorage.encryptString(token);
  await fs.writeFile(tempPath, encrypted, { mode: 0o600 });
  await fs.rename(tempPath, filePath);
  return true;
});

ipcMain.handle("srk-token:delete", async (event) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  try {
    await fs.unlink(await getTokenFilePath());
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw new Error("Unable to delete the encrypted Google Drive token.");
    }
  }
  return true;
});


async function getOAuthCredentialsFilePath() {
  return path.join(app.getPath("userData"), OAUTH_CREDENTIALS_FILE);
}

ipcMain.handle("srk-oauth-credentials:get", async (event) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  try {
    const encrypted = await fs.readFile(await getOAuthCredentialsFilePath());
    return app.safeStorage.decryptString(encrypted);
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw new Error("Unable to read encrypted Google OAuth credentials.");
  }
});

ipcMain.handle("srk-oauth-credentials:set", async (event, serializedCredentials) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  if (typeof serializedCredentials !== "string" ||
      serializedCredentials.length < 2 || serializedCredentials.length > 40000) {
    throw new Error("Invalid Google OAuth credential bundle.");
  }
  let parsed;
  try { parsed = JSON.parse(serializedCredentials); } catch {
    throw new Error("Google OAuth credentials must be valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      typeof parsed.accessToken !== "string" || !parsed.accessToken ||
      parsed.accessToken.length > 16384 ||
      !(parsed.refreshToken === null ||
        (typeof parsed.refreshToken === "string" && parsed.refreshToken.length > 0 &&
         parsed.refreshToken.length <= 16384)) ||
      parsed.tokenType !== "Bearer" ||
      !Number.isSafeInteger(parsed.expiresAt) ||
      !(parsed.scope === null || typeof parsed.scope === "string")) {
    throw new Error("Google OAuth credential bundle failed validation.");
  }
  const filePath = await getOAuthCredentialsFilePath();
  const tempPath = filePath + ".tmp";
  const encrypted = app.safeStorage.encryptString(serializedCredentials);
  await fs.writeFile(tempPath, encrypted, { mode: 0o600 });
  await fs.rename(tempPath, filePath);
  return true;
});

ipcMain.handle("srk-oauth-credentials:delete", async (event) => {
  assertTrustedRenderer(event);
  requireSecureTokenStorage();
  try {
    await fs.unlink(await getOAuthCredentialsFilePath());
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw new Error("Unable to delete encrypted Google OAuth credentials.");
    }
  }
  return true;
});


const BACKUP_DIRECTORY_FILE = "backup-directory.json";

async function getSelectedBackupDirectory() {
  try {
    const raw = await fs.readFile(path.join(app.getPath("userData"), BACKUP_DIRECTORY_FILE), "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed.directory === "string" && path.isAbsolute(parsed.directory)
      ? path.resolve(parsed.directory)
      : null;
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw new Error("Unable to read the selected backup directory.");
  }
}

ipcMain.handle("srk-backup:select-folder", async (event) => {
  assertTrustedRenderer(event);
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error("The application window is unavailable.");
  const previous = await getSelectedBackupDirectory().catch(() => null);
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select SRK Case Manager backup folder",
    defaultPath: previous || app.getPath("documents"),
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || !result.filePaths || !result.filePaths[0]) return null;
  const directory = path.resolve(result.filePaths[0]);
  const info = await fs.stat(directory);
  if (!info.isDirectory()) throw new Error("The selected backup location is not a folder.");
  const configPath = path.join(app.getPath("userData"), BACKUP_DIRECTORY_FILE);
  const tempConfigPath = configPath + ".tmp";
  await fs.writeFile(tempConfigPath, JSON.stringify({ directory }), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tempConfigPath, configPath);
  return directory;
});

ipcMain.handle("srk-backup:write-file", async (event, request) => {
  assertTrustedRenderer(event);
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    throw new Error("Invalid backup write request.");
  }
  const { directory, fileName, content } = request;
  if (typeof directory !== "string" || !path.isAbsolute(directory) ||
      typeof fileName !== "string" || fileName.length > 180 ||
      path.basename(fileName) !== fileName || !/^[A-Za-z0-9_-]+\.json$/i.test(fileName) ||
      typeof content !== "string" || Buffer.byteLength(content, "utf8") > 50 * 1024 * 1024) {
    throw new Error("Backup file details are invalid or exceed the supported size.");
  }
  const selectedDirectory = await getSelectedBackupDirectory();
  const resolvedDirectory = path.resolve(directory);
  if (!selectedDirectory || resolvedDirectory !== selectedDirectory) {
    throw new Error("Choose the backup folder using Browse before saving to it.");
  }
  const info = await fs.stat(resolvedDirectory);
  if (!info.isDirectory()) throw new Error("The selected backup location is no longer available.");
  const destination = path.join(resolvedDirectory, fileName);
  const temporary = destination + ".tmp-" + process.pid;
  try {
    await fs.writeFile(temporary, content, { encoding: "utf8", mode: 0o600 });
    await fs.rename(temporary, destination);
  } catch (error) {
    try { await fs.unlink(temporary); } catch {}
    throw new Error("The backup file could not be written to the selected folder.");
  }
  return { saved: true, filePath: destination };
});

let mainWindow = null;
let isQuitting = false;
let googleOAuthListener = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow = win;

  win.loadFile(path.join(__dirname, "dist", "index.html"));

  // Intercept window close from OS titlebar 'X' or Alt+F4 to show confirmation popup
  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();

      let notifiedRenderer = false;
      try {
        if (win.webContents && !win.webContents.isDestroyed()) {
          win.webContents.send("show-exit-confirmation");
          notifiedRenderer = true;
        }
      } catch (err) {
        console.warn("Could not dispatch show-exit-confirmation to webContents:", err);
      }

      // Fallback if renderer is unresponsive or closed
      if (!notifiedRenderer) {
        const choice = dialog.showMessageBoxSync(win, {
          type: "question",
          buttons: ["Yes, Close App", "No, Stay in App"],
          defaultId: 1,
          cancelId: 1,
          title: "SRK Case Manager - Confirm Exit",
          message: "Are you sure you want to close the app?",
          detail: "All chamber data and records will be automatically backed up."
        });

        if (choice === 0) {
          isQuitting = true;
          try {
            if (!win.isDestroyed()) {
              win.destroy();
            }
          } catch (e) {}
          app.quit();
          app.exit(0);
        }
      }
    }
  });

  win.on("closed", () => {
    mainWindow = null;
  });
}

// When user confirms close in the in-app confirmation popup

ipcMain.handle("srk-oauth:listen", async (event, expectedState) => {
  assertTrustedRenderer(event);
  if (googleOAuthListener) {
    googleOAuthListener.close();
    googleOAuthListener = null;
  }
  const listener = createGoogleOAuthLoopbackListener({ expectedState });
  googleOAuthListener = listener;
  try {
    return await listener.ready;
  } catch (error) {
    if (googleOAuthListener === listener) googleOAuthListener = null;
    listener.close();
    throw new Error("Unable to start the Google sign-in callback listener.");
  }
});

ipcMain.handle("srk-oauth:wait", async (event) => {
  assertTrustedRenderer(event);
  const listener = googleOAuthListener;
  if (!listener) throw new Error("No Google sign-in request is active.");
  try {
    return await listener.waitForCallback();
  } finally {
    listener.close();
    if (googleOAuthListener === listener) googleOAuthListener = null;
  }
});

ipcMain.handle("srk-oauth:open", async (event, authorizationUrl) => {
  assertTrustedRenderer(event);
  let parsed;
  try {
    parsed = new URL(authorizationUrl);
  } catch {
    throw new Error("Invalid Google authorization URL.");
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "accounts.google.com" ||
      parsed.username || parsed.password) {
    throw new Error("Only the official Google sign-in page can be opened.");
  }
  await shell.openExternal(parsed.toString());
  return true;
});

ipcMain.handle("srk-oauth:cancel", async (event) => {
  assertTrustedRenderer(event);
  if (googleOAuthListener) {
    googleOAuthListener.close();
    googleOAuthListener = null;
  }
  return true;
});

ipcMain.on("app-close", () => {
  isQuitting = true;
  if (googleOAuthListener) {
    googleOAuthListener.close();
    googleOAuthListener = null;
  }
  BrowserWindow.getAllWindows().forEach((win) => {
    try {
      win.removeAllListeners("close");
      if (!win.isDestroyed()) {
        win.destroy();
      }
    } catch (err) {
      console.warn("Window destroy error:", err);
    }
  });
  app.quit();
  app.exit(0);
});

ipcMain.on("app-minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.minimize();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  isQuitting = true;
  if (googleOAuthListener) {
    googleOAuthListener.close();
    googleOAuthListener = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    app.exit(0);
  }
});
