const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises");


const TOKEN_FILE = "google-drive-token.enc";

async function getTokenFilePath() {
  return path.join(app.getPath("userData"), TOKEN_FILE);
}

function requireSecureTokenStorage() {
  if (!app.isReady() || !app.safeStorage || !app.safeStorage.isEncryptionAvailable()) {
    throw new Error("Windows secure token storage is unavailable on this device.");
  }
}

ipcMain.handle("srk-token:get", async () => {
  requireSecureTokenStorage();
  try {
    const encrypted = await fs.readFile(await getTokenFilePath());
    return app.safeStorage.decryptString(encrypted);
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw new Error("Unable to read the encrypted Google Drive token.");
  }
});

ipcMain.handle("srk-token:set", async (_event, token) => {
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

ipcMain.handle("srk-token:delete", async () => {
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

let mainWindow = null;
let isQuitting = false;

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
ipcMain.on("app-close", () => {
  isQuitting = true;
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    app.exit(0);
  }
});
