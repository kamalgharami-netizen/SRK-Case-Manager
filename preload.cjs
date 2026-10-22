const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeApp: () => {
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
});
