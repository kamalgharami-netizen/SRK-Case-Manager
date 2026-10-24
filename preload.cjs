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
  },
  onExitRequested: (callback) => {
    try {
      ipcRenderer.on("show-exit-confirmation", callback);
    } catch (e) {
      console.warn("Failed to register onExitRequested:", e);
    }
  }
};

// Dispatch DOM event when main process requests exit confirmation popup
ipcRenderer.on("show-exit-confirmation", () => {
  try {
    window.dispatchEvent(new CustomEvent("srk-request-exit"));
  } catch (e) {
    console.warn("Failed to dispatch srk-request-exit event:", e);
  }
});

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
