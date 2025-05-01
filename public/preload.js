const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    args: () => ipcRenderer.invoke('get-args'),
    data: () => ipcRenderer.invoke('get-data'),
    getSiteData: () => ipcRenderer.invoke('get-site-data'),
    getMol: (action) => ipcRenderer.invoke('get-mol', action),
    getFileFromPath: (action) => ipcRenderer.invoke('get-file-from-path', action),
    getLigandPaths: () => ipcRenderer.invoke('get-ligand-paths'),
    saveData: (action) => ipcRenderer.invoke('save-data', action),
    saveSiteData: (action) => ipcRenderer.invoke('save-site-data', action),
    saveModel: (action) => ipcRenderer.invoke('save-model', action),

    // we can also expose variables, not just functions
})