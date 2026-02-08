import { promises as fsp } from "fs"
import os from "os"
import path from "path"
import util from "util"
import { exec } from "child_process"
import { app, ipcMain } from "electron"
import { mainWindow } from "./index"
import fs from "fs-extra"  // Use fs-extra que tem ensureDir
import log from "electron-log"

const execPromise = util.promisify(exec)

console.log = log.log
console.error = log.error
console.warn = log.warn

// Função melhorada para executar PowerShell
export async function executePowerShell(event, props) {
  const { script, name = "script" } = props

  let tempFile = null;

  try {
    const tempDir = path.join(app.getPath("userData"), "scripts")
    await fs.ensureDir(tempDir)

    // Limpar arquivos antigos (> 5 minutos)
    try {
      const files = await fsp.readdir(tempDir)
      const now = Date.now()
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        const stats = await fsp.stat(filePath).catch(() => null)
        if (stats && now - stats.mtimeMs > 5 * 60 * 1000) { // 5 minutos
          await fsp.unlink(filePath).catch(() => { })
        }
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup old files:', cleanupError.message)
    }

    tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`)

    await fsp.writeFile(tempFile, script, 'utf-8')

    const { stdout, stderr } = await execPromise(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`,
      { timeout: 30000, maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    )

    // Converter e limpar output
    const outputStr = stdout ? stdout.toString().trim() : ''
    const errorStr = stderr ? stderr.toString().trim() : ''

    console.log(`PowerShell output for ${name}:`, outputStr.substring(0, 200)) // Log só os primeiros 200 chars

    // Deletar arquivo temporário
    if (tempFile && await fsp.access(tempFile).then(() => true).catch(() => false)) {
      await fsp.unlink(tempFile).catch(err => {
        console.warn(`Failed to delete ${tempFile}:`, err.message)
      })
    }

    return {
      success: true,
      output: outputStr,
      error: errorStr
    }
  } catch (error) {
    console.error(`PowerShell execution error [${name}]:`, error.message)

    // Tentar deletar arquivo em caso de erro
    if (tempFile) {
      try {
        await fsp.unlink(tempFile).catch(() => { })
      } catch { }
    }

    return {
      success: false,
      error: error.message,
      output: ''
    }
  }
}

async function runPowerShellInWindow(event, { script, name = "script", noExit = true }) {
  try {
    const tempDir = path.join(app.getPath("userData"), "scripts")
    ensureDirectoryExists(tempDir)

    const tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`)
    await fsp.writeFile(tempFile, script)
    const noExitFlag = noExit ? "-NoExit" : ""
    const command = `start powershell.exe ${noExitFlag} -ExecutionPolicy Bypass -File "${tempFile}"`

    exec(command, (error) => {
      if (error) {
        console.error(`Error launching PowerShell window [${name}]:`, error)
      }
    })

    return { success: true }
  } catch (error) {
    console.error(`Error in runPowerShellInWindow [${name}]:`, error)
    return { success: false, error: error.message }
  }
}

ipcMain.handle("run-powershell-window", runPowerShellInWindow)
ipcMain.handle("run-powershell", executePowerShell)
ipcMain.handle("handle-apps", async (event, { action, apps }) => {
  switch (action) {
    case "install":
      for (const app of apps) {
        const command = `winget install ${app} --silent --accept-package-agreements --accept-source-agreements`
        mainWindow.webContents.send("install-progress", `${app}`)
        const result = await executePowerShell(event, { script: command, name: `Install-${app}` })
        if (result.success) {
          console.log(`Instalação bem-sucedida de ${app}`)
        } else {
          console.error(`Falha ao instalar ${app}:`, result.error)
          mainWindow.webContents.send("install-error")
        }
      }
      mainWindow.webContents.send("install-complete")
      break
    case "uninstall":
      for (const app of apps) {
        const command = `winget uninstall ${app} --silent`
        mainWindow.webContents.send("install-progress", `${app}`)
        const result = await executePowerShell(event, { script: command, name: `Uninstall-${app}` })
        if (result.success) {
          console.log(`Desinstalação bem-sucedida de ${app}`)
        } else {
          console.error(`Falha ao desinstalar ${app}:`, result.error)
          mainWindow.webContents.send("install-error")
        }
      }
      mainWindow.webContents.send("install-complete")
      break
    case "check-installed":
      try {
        const result = await executePowerShell(event, {
          script: "winget list",
          name: "check-installed",
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        const escapeRegExp = (string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        }

        const installedAppIds = apps.filter((appId) => {
          const regex = new RegExp(`\\b${escapeRegExp(appId)}\\b`, "i")
          return regex.test(result.output)
        })

        mainWindow.webContents.send("installed-apps-checked", {
          success: true,
          installed: installedAppIds,
        })
      } catch (error) {
        console.error("Failed to check installed apps:", error)
        mainWindow.webContents.send("installed-apps-checked", {
          success: false,
          error: error.message,
        })
      }
      break
    default:
      console.error(`Ação desconhecida: ${action}`)
  }
})
