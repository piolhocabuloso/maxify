import { contextBridge, ipcRenderer, shell } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

const updaterAPI = {
  onStatus: (callback) => {
    ipcRenderer.removeAllListeners("update-status")
    ipcRenderer.on("update-status", (_, data) => callback(data))
  },
  installNow: () => ipcRenderer.invoke("install-update-now"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
}

const customAPI = {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  send: (channel, payload) => ipcRenderer.send(channel, payload),
  on: (channel, callback) =>
    ipcRenderer.on(channel, (_, ...args) => callback(...args)),
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("updater", updaterAPI)

  contextBridge.exposeInMainWorld("electron", {
    auth: {
      login: (data) => ipcRenderer.invoke("auth:login", data),
      loginFree: () => ipcRenderer.invoke("auth:login-free"),
      loginSaved: () => ipcRenderer.invoke("auth:login-saved"),
      checkSession: () => ipcRenderer.invoke("auth:check-session"),
      getAccount: () => ipcRenderer.invoke("auth:get-account"),
      logout: () => ipcRenderer.invoke("auth:logout"),

      getSavedKey: () => ipcRenderer.invoke("auth:get-saved-key"),
      saveKey: (key) => ipcRenderer.invoke("auth:save-key", key),
      clearSavedKey: () => ipcRenderer.invoke("auth:clear-saved-key"),
    },

    tweaks: {
      runPowerShell: (payload) => ipcRenderer.invoke("run-powershell", payload),
    },

    openExternal: (url) => shell.openExternal(url),
    getHWID: () => ipcRenderer.invoke("get-hwid"),

    discord: {
      login: () => ipcRenderer.send("discord-login"),
      onSuccess: (callback) => {
        ipcRenderer.on("discord-auth-success", (_, data) => callback(data))
      },
      onError: (callback) => {
        ipcRenderer.on("discord-auth-error", (_, err) => callback(err))
      },
    },

    ...electronAPI,
    ...customAPI,
  })

  contextBridge.exposeInMainWorld("api", {})
} else {
  window.updater = updaterAPI
  window.electron = {
    ...electronAPI,
    ...customAPI,
  }
  window.api = {}
}