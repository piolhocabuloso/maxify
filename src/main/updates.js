import { autoUpdater } from "electron-updater"
import log from "electron-log"
import { ipcMain } from "electron"

log.transports.file.level = "info"
autoUpdater.logger = log

export function initAutoUpdater(mainWindow) {

  console.log("[Maxify]: AutoUpdater iniciado")

  // ===== EVENTOS DO UPDATER =====

  autoUpdater.on("checking-for-update", () => {
    log.info("Verificando atualizações...")
  })

  autoUpdater.on("update-available", (info) => {
    log.info("Atualização disponível:", info.version)

    mainWindow.webContents.send("updater:available", {
      version: info.version
    })
  })

  autoUpdater.on("update-not-available", () => {
    log.info("Sem atualizações")

    mainWindow.webContents.send("updater:not-available")
  })

  autoUpdater.on("error", (err) => {
    log.error("Erro no updater:", err)

    mainWindow.webContents.send("updater:error", {
      message: err?.message || String(err)
    })
  })

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("updater:download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on("update-downloaded", () => {
    log.info("Update baixado!")

    mainWindow.webContents.send("updater:downloaded")
  })

  // ===== IPC DO FRONT =====

  ipcMain.handle("updater:download", async () => {
    await autoUpdater.downloadUpdate()
    return true
  })

  ipcMain.handle("updater:install", async () => {
    autoUpdater.quitAndInstall()
    return true
  })

  // Checar automaticamente ao iniciar
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 4000)
}

// Para botão manual de verificar
export async function triggerAutoUpdateCheck() {
  await autoUpdater.checkForUpdates()
}
