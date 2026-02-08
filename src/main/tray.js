import { Tray, Menu, app } from "electron"
import path from "path"

function getIconPath() {
  // Modo empacotado
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "sparkle2.ico")
  }

  return path.join(__dirname, "../../resources/sparkle2.ico")
}

export function createTray(mainWindow) {
  const tray = new Tray(getIconPath())

  const contextMenu = Menu.buildFromTemplate([
    { label: "🚀 Abrir Maxify", click: () => mainWindow.show() },
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
