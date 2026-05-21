import { BrowserWindow, ipcMain } from "electron"
import { spawn } from "child_process"
import path from "path"
import os from "os"

let runningProcess = null

function sendToWindows(channel, payload) {
    BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
            win.webContents.send(channel, payload)
        }
    })
}

function sendLog(text, type = "info", progress = null) {
    sendToWindows("essential:install-log", {
        type,
        text,
        progress,
    })
}

function getWindowsAppsPath() {
    return path.join(os.homedir(), "AppData", "Local", "Microsoft", "WindowsApps")
}

function runCommand(command) {
    const windowsApps = getWindowsAppsPath()

    const env = {
        ...process.env,
        PATH: `${process.env.PATH || ""};${windowsApps}`,
        Path: `${process.env.Path || process.env.PATH || ""};${windowsApps}`,
    }

    return spawn("cmd.exe", ["/d", "/s", "/c", command], {
        windowsHide: false,
        shell: false,
        env,
    })
}

export function registerEssentialInstallerHandlers() {
    ipcMain.removeHandler("essential:install")
    ipcMain.removeHandler("essential:stop")

    ipcMain.handle("essential:install", async (_, payload) => {
        if (runningProcess) {
            return {
                started: false,
                message: "JÃ¡ existe uma instalaÃ§Ã£o em andamento.",
            }
        }

        const programs = Array.isArray(payload?.programs) ? payload.programs : []

        if (programs.length === 0) {
            return {
                started: false,
                message: "Nenhum programa selecionado.",
            }
        }

        const safePrograms = programs
            .filter((program) => program?.name && program?.wingetId)
            .map((program) => ({
                name: String(program.name).replace(/"/g, ""),
                wingetId: String(program.wingetId).replace(/"/g, ""),
            }))

        const commands = safePrograms
            .map((program, index) => {
                const progress = Math.round(((index + 1) / safePrograms.length) * 90)

                return `
echo.
echo ============================================================
echo Instalando: ${program.name}
echo Pacote: ${program.wingetId}
echo ============================================================

winget install --id "${program.wingetId}" --exact --silent --accept-package-agreements --accept-source-agreements

if errorlevel 1 (
  echo ERRO ao instalar ${program.name}
) else (
  echo SUCESSO ao instalar ${program.name}
)

echo __MAXIFY_PROGRESS_${progress}__
`
            })
            .join("\n")

        const command = `
@echo off
chcp 65001 > nul

echo Iniciando instalador de programas essenciais...
echo Verificando winget...

where winget > nul 2> nul

if errorlevel 1 (
  echo Winget nÃ£o encontrado.
  echo Atualize ou instale o App Installer pela Microsoft Store.
  exit /b 2
)

echo Winget encontrado.
echo Total de programas: ${safePrograms.length}

${commands}

echo.
echo InstalaÃ§Ã£o finalizada.
exit /b 0
`

        try {
            sendLog("Preparando instalador de programas essenciais...", "info", 5)

            runningProcess = runCommand(command)

            sendLog("Processo iniciado pelo Maxify.", "info", 10)

            runningProcess.stdout?.on("data", (data) => {
                const text = data.toString("utf8")

                const progressMatch = text.match(/__MAXIFY_PROGRESS_(\d+)__/)

                if (progressMatch) {
                    const progress = Number(progressMatch[1])

                    sendLog("Progresso atualizado.", "info", progress)
                    return
                }

                sendLog(
                    text,
                    text.toLowerCase().includes("erro")
                        ? "error"
                        : text.toLowerCase().includes("sucesso")
                            ? "success"
                            : "info",
                    null
                )
            })

            runningProcess.stderr?.on("data", (data) => {
                sendLog(data.toString("utf8"), "error", null)
            })

            runningProcess.on("error", (error) => {
                sendLog(error.message, "error", 100)

                sendToWindows("essential:install-done", {
                    success: false,
                    message: error.message,
                })

                runningProcess = null
            })

            runningProcess.on("close", (code) => {
                const success = code === 0

                sendLog(
                    success
                        ? "InstalaÃ§Ã£o finalizada."
                        : `InstalaÃ§Ã£o finalizada com cÃ³digo: ${code}`,
                    success ? "success" : "error",
                    100
                )

                sendToWindows("essential:install-done", {
                    success,
                    code,
                    message: success
                        ? "InstalaÃ§Ã£o finalizada."
                        : `InstalaÃ§Ã£o terminou com cÃ³digo ${code}`,
                })

                runningProcess = null
            })

            return {
                started: true,
                message: "InstalaÃ§Ã£o iniciada.",
            }
        } catch (error) {
            runningProcess = null

            return {
                started: false,
                message: error.message,
            }
        }
    })

    ipcMain.handle("essential:stop", async () => {
        if (!runningProcess) {
            return {
                success: false,
                message: "Nenhuma instalaÃ§Ã£o em andamento.",
            }
        }

        try {
            runningProcess.kill()
            runningProcess = null

            sendToWindows("essential:install-done", {
                success: false,
                message: "InstalaÃ§Ã£o cancelada pelo usuÃ¡rio.",
            })

            return {
                success: true,
                message: "InstalaÃ§Ã£o cancelada.",
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        }
    })
}
