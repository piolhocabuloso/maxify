import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

const customAPI = {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  send: (channel, payload) => ipcRenderer.send(channel, payload),
  on: (channel, callback) =>
    ipcRenderer.on(channel, (_, ...args) => callback(...args))
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("electron", {
    auth: {
      getSavedKey: () => ipcRenderer.invoke("auth:get-saved-key"),
      saveKey: (key) => ipcRenderer.invoke("auth:save-key", key),
      clearSavedKey: () => ipcRenderer.invoke("auth:clear-saved-key"),
    },

    openExternal: (url) => shell.openExternal(url),

    getHWID: () => ipcRenderer.invoke('get-hwid'),
    discord: {
      login: () => ipcRenderer.send("discord-login"),

      onSuccess: (callback) => {
        ipcRenderer.on("discord-auth-success", (event, data) => {
          console.log("📦 preload recebeu:", data)
          callback(data)
        })
      },

      onError: (callback) => {
        ipcRenderer.on("discord-auth-error", (event, err) => {
          callback(err)
        })
      }
    },

    ...electronAPI,
    ...customAPI
  })

  contextBridge.exposeInMainWorld("api", {})
} else {
  window.electron = {
    ...electronAPI,
    ...customAPI
  }

  window.api = {}
}
