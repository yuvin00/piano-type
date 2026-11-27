'use strict';
const { contextBridge, ipcRenderer } = require('electron');
function subscribe(channel, callback) {
  const handler = (_event, value) => callback(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
contextBridge.exposeInMainWorld('pianoDesktop', {
  getState: () => ipcRenderer.invoke('piano:state'),
  setEnabled: enabled => ipcRenderer.invoke('piano:enable', enabled === true),
  setCompact: compact => ipcRenderer.invoke('piano:compact', compact === true),
  onState: callback => subscribe('piano:state', callback),
  onTyping: callback => subscribe('piano:typing', callback)
});
