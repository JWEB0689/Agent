import { contextBridge, ipcRenderer } from 'electron';

// Expose native APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File System Access
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  
  
  // Notifications
  showNotification: (title: string, body: string) => ipcRenderer.send('app:showNotification', title, body),

  // Automation / MCP (Educational use only, unverified execution)
  executeCommand: (command: string) => ipcRenderer.invoke('app:executeCommand', command),
});
