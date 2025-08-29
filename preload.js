const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  callClaudeAPI: (prompt) => ipcRenderer.invoke('claude-api', prompt)
});
