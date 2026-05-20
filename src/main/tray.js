import { Tray, Menu, app, shell } from "electron"
import path from "path"

function getIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "maxify2.ico")
  }

  return path.join(__dirname, "../../resources/maxify2.ico")
}

export function createTray(mainWindow) {
  const tray = new Tray(getIconPath())

  const contextMenu = Menu.buildFromTemplate([
    { label: "🚀 Abrir Maxify", click: () => mainWindow.show() },

    { type: "separator" },

    { label: "💬 Discord", click: () => shell.openExternal("https://discord.gg/45zyQEe2s3") },
    { label: "📺 YouTube", click: () => shell.openExternal("https://www.youtube.com/@PiolhoCabluloso") },

    { type: "separator" },

    { label: "❌ Fechar", click: () => app.quit() },
  ])

  tray.setToolTip("Maxify")
  tray.setTitle("Maxify")
  tray.setContextMenu(contextMenu)

  tray.on("click", () => ToggleWindowState(mainWindow))
}

function ToggleWindowState(mainWindow) {
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
}