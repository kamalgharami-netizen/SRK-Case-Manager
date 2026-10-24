const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

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

  win.loadFile(path.join(__dirname, "dist", "index.html"));

  // Ensure window closes cleanly when user clicks OS title bar 'X'
  win.on("close", (event) => {
    if (!isQuitting) {
      isQuitting = true;
      try {
        if (!win.isDestroyed()) {
          win.destroy();
        }
      } catch (err) {
        console.warn("Window destroy error on close:", err);
      }
      app.quit();
      app.exit(0);
    }
  });
}

// Ensure app closes immediately without being blocked by beforeunload
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
