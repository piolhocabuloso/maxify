import { Tray, Menu, app } from "electron"
import path from "path"

export function createTray(mainWindow) {
  const tray = new Tray(path.join(__dirname, "../../resources/sparkle2.ico"))

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
