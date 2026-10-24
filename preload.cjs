const { contextBridge, ipcRenderer } = require("electron");

const api = {
  closeApp: () => {
    try {
      ipcRenderer.send("app-close");
    } catch (e) {
      console.warn("Failed to send app-close ipc:", e);
    }
  },
  exitApp: () => {
    try {
      ipcRenderer.send("app-close");
    } catch (e) {
      console.warn("Failed to send app-close ipc:", e);
    }
  },
  minimizeApp: () => {
    try {
      ipcRenderer.send("app-minimize");
    } catch (e) {
      console.warn("Failed to send app-minimize ipc:", e);
    }
  }
};

try {
  contextBridge.exposeInMainWorld("electronAPI", api);
  contextBridge.exposeInMainWorld("electron", api);
} catch (e) {
  try {
    window.electronAPI = api;
    window.electron = api;
  } catch (err) {
    console.warn("Failed to expose electronAPI:", err);
  }
}
