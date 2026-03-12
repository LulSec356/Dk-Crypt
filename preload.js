/**
 * NOVA-Φ ULTRA — Preload Script
 * Secure contextBridge: only expose what renderer needs
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novaElectron', {
  // App info
  getVersion:  ()      => ipcRenderer.invoke('get-app-version'),
  getPlatform: ()      => ipcRenderer.invoke('get-platform'),

  // Native dialogs (safer than HTML file input for large files)
  showSaveDialog: (opts) => ipcRenderer.invoke('show-save-dialog', opts),
  showOpenDialog: (opts) => ipcRenderer.invoke('show-open-dialog', opts),

  // Receive file paths from menu File > Open
  onOpenFiles: (callback) => {
    ipcRenderer.on('open-files', (_, paths) => callback(paths));
  },
});
