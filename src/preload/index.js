import { contextBridge, ipcRenderer, shell } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

const updaterAPI = {
  onStatus: (callback) => {
    const listener = (_, data) => callback(data)

    ipcRenderer.on("update-status", listener)

    return () => {
      ipcRenderer.removeListener("update-status", listener)
    }
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

const powershellLogsAPI = {
  onLog: (callback) => {
    const listener = (_, data) => callback(data)

    ipcRenderer.on("powershell-live-log", listener)

    return () => {
      ipcRenderer.removeListener("powershell-live-log", listener)
    }
  },

  removeAll: () => {
    ipcRenderer.removeAllListeners("powershell-live-log")
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("updater", updaterAPI)

  contextBridge.exposeInMainWorld("powershellLogs", powershellLogsAPI)

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

    powershellLogs: powershellLogsAPI,

    openExternal: (url) => shell.openExternal(url),
    getHWID: () => ipcRenderer.invoke("get-hwid"),

    discordAuth: {
      start: () => ipcRenderer.invoke("discord-auth:start"),
      status: (sessionId) => ipcRenderer.invoke("discord-auth:status", sessionId),
      getUser: () => ipcRenderer.invoke("discord-auth:get-user"),
      logout: () => ipcRenderer.invoke("discord-auth:logout"),
    },

    discord: {
      login: () => ipcRenderer.send("discord-login"),
      onSuccess: (callback) => {
        ipcRenderer.removeAllListeners("discord-auth-success")
        ipcRenderer.on("discord-auth-success", (_, data) => callback(data))
      },
      onError: (callback) => {
        ipcRenderer.removeAllListeners("discord-auth-error")
        ipcRenderer.on("discord-auth-error", (_, err) => callback(err))
      },
    },

    ...electronAPI,
    ...customAPI,
  })

  contextBridge.exposeInMainWorld("api", {})
} else {
  window.updater = updaterAPI
  window.powershellLogs = powershellLogsAPI
  window.electron = {
    ...electronAPI,
    ...customAPI,
    powershellLogs: powershellLogsAPI,
  }
  window.api = {}
}