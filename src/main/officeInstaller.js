import { BrowserWindow, ipcMain, shell } from "electron"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import https from "https"

let runningProcess = null

const OFFICE_DIR = "C:\\MS Office Setup"
const ODT_URL =
    "https://download.microsoft.com/download/2/7/A/27AF1BE6-DD20-4CB4-B154-EBAB8A7D4A7E/officedeploymenttool_18129-20030.exe"

function sendToWindows(channel, payload) {
    BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
            win.webContents.send(channel, payload)
        }
    })
}

function sendLog(text, type = "info", progress = null) {
    sendToWindows("office:install-log", {
        type,
        text,
        progress,
    })
}

function runProcess(file, args = [], options = {}) {
    return spawn(file, args, {
        windowsHide: false,
        shell: false,
        ...options,
    })
}

function ensureAdmin() {
    return new Promise((resolve) => {
        const proc = spawn("cmd.exe", ["/c", "fltmc"], {
            windowsHide: true,
            shell: false,
        })

        proc.on("close", (code) => {
            resolve(code === 0)
        })

        proc.on("error", () => {
            resolve(false)
        })
    })
}

function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination)

        https
            .get(url, (response) => {
                if (
                    response.statusCode === 301 ||
                    response.statusCode === 302 ||
                    response.statusCode === 307 ||
                    response.statusCode === 308
                ) {
                    file.close()
                    fs.unlink(destination, () => { })

                    return downloadFile(response.headers.location, destination)
                        .then(resolve)
                        .catch(reject)
                }

                if (response.statusCode !== 200) {
                    file.close()
                    fs.unlink(destination, () => { })

                    return reject(
                        new Error(`Falha no download. Código HTTP: ${response.statusCode}`)
                    )
                }

                const total = Number(response.headers["content-length"] || 0)
                let downloaded = 0

                response.on("data", (chunk) => {
                    downloaded += chunk.length

                    if (total > 0) {
                        const percent = Math.min(
                            65,
                            Math.round((downloaded / total) * 45) + 20
                        )

                        sendLog(`Baixando Office Deployment Tool... ${percent}%`, "info", percent)
                    }
                })

                response.pipe(file)

                file.on("finish", () => {
                    file.close(resolve)
                })
            })
            .on("error", (error) => {
                file.close()
                fs.unlink(destination, () => { })
                reject(error)
            })
    })
}

function createOfficeConfig(configPath, arch) {
    const xml = `<!-- Criado pelo Maxify -->
<Configuration ID="MS_Office_LTSC_2024">

  <Add OfficeClientEdition="${arch}" Channel="PerpetualVL2024">
    <Product ID="ProPlus2024Volume">
      <Language ID="MatchOS" />
      <ExcludeApp ID="Lync" />
      <ExcludeApp ID="OneDrive" />
    </Product>
  </Add>

  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="TRUE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
  <Display Level="Full" AcceptEULA="TRUE" />

</Configuration>`

    fs.writeFileSync(configPath, xml, "utf8")
}

function getArch() {
    const arch = process.env.PROCESSOR_ARCHITECTURE || ""
    const wow64 = process.env.PROCESSOR_ARCHITEW6432 || ""

    if (wow64 || arch.toUpperCase().includes("AMD64") || arch.toUpperCase().includes("IA64")) {
        return "64"
    }

    return "32"
}

export function registerOfficeInstallerHandlers() {
    ipcMain.removeHandler("office:install")
    ipcMain.removeHandler("office:stop")
    ipcMain.removeHandler("office:open-folder")

    ipcMain.handle("office:open-folder", async () => {
        if (!fs.existsSync(OFFICE_DIR)) {
            fs.mkdirSync(OFFICE_DIR, { recursive: true })
        }

        await shell.openPath(OFFICE_DIR)

        return {
            success: true,
        }
    })

    ipcMain.handle("office:install", async () => {
        if (runningProcess) {
            return {
                started: false,
                message: "A instalação já está em execução.",
            }
        }

        try {
            sendLog("Iniciando instalação interna do Office pelo Maxify...", "info", 5)

            const isAdmin = await ensureAdmin()

            if (!isAdmin) {
                sendLog("ERRO: Abra o Maxify como Administrador.", "error", 100)

                sendToWindows("office:install-done", {
                    success: false,
                    message: "Abra o Maxify como Administrador.",
                })

                return {
                    started: false,
                    message: "Abra o Maxify como Administrador.",
                }
            }

            sendLog("Permissão de Administrador detectada.", "success", 10)

            if (!fs.existsSync(OFFICE_DIR)) {
                fs.mkdirSync(OFFICE_DIR, { recursive: true })
                sendLog(`Pasta criada: ${OFFICE_DIR}`, "success", 15)
            } else {
                sendLog(`Pasta encontrada: ${OFFICE_DIR}`, "info", 15)
            }

            const arch = getArch()
            const configPath = path.join(OFFICE_DIR, "Configuracao.xml")
            const odtPath = path.join(OFFICE_DIR, "officedeploymenttool.exe")
            const setupPath = path.join(OFFICE_DIR, "setup.exe")

            sendLog(`Sistema detectado: Windows ${arch} bits`, "info", 18)

            createOfficeConfig(configPath, arch)

            if (!fs.existsSync(configPath)) {
                throw new Error("Não foi possível criar o Configuracao.xml.")
            }

            sendLog(`Configuracao.xml criado em: ${configPath}`, "success", 20)

            if (!fs.existsSync(odtPath)) {
                sendLog("Baixando Office Deployment Tool oficial da Microsoft...", "info", 25)
                await downloadFile(ODT_URL, odtPath)
                sendLog("Office Deployment Tool baixado com sucesso.", "success", 65)
            } else {
                sendLog("Office Deployment Tool já existe. Pulando download.", "info", 65)
            }

            sendLog("Extraindo Office Deployment Tool...", "info", 70)

            await new Promise((resolve, reject) => {
                const extractProc = runProcess(odtPath, ["/quiet", `/extract:${OFFICE_DIR}`])

                extractProc.on("error", reject)

                extractProc.on("close", (code) => {
                    if (code === 0) {
                        resolve()
                    } else {
                        reject(new Error(`Falha ao extrair ODT. Código: ${code}`))
                    }
                })
            })

            if (!fs.existsSync(setupPath)) {
                throw new Error(`setup.exe não encontrado em: ${setupPath}`)
            }

            sendLog("setup.exe encontrado.", "success", 75)
            sendLog("Abrindo pasta de instalação para você acompanhar.", "info", 78)

            shell.openPath(OFFICE_DIR)

            sendLog("Iniciando setup.exe /configure Configuracao.xml...", "info", 82)
            sendLog("A janela do instalador do Office deve aparecer em alguns segundos.", "info", 84)

            runningProcess = runProcess(
                setupPath,
                ["/configure", configPath],
                {
                    cwd: OFFICE_DIR,
                }
            )

            runningProcess.stdout?.on("data", (data) => {
                sendLog(data.toString("utf8"), "info", 90)
            })

            runningProcess.stderr?.on("data", (data) => {
                sendLog(data.toString("utf8"), "error", 90)
            })

            runningProcess.on("error", (error) => {
                sendLog(error.message, "error", 100)

                sendToWindows("office:install-done", {
                    success: false,
                    message: error.message,
                })

                runningProcess = null
            })

            runningProcess.on("close", (code) => {
                const success = code === 0

                sendLog(
                    success
                        ? "Office LTSC 2024 instalado com sucesso."
                        : `Instalação finalizada com código: ${code}`,
                    success ? "success" : "error",
                    100
                )

                sendToWindows("office:install-done", {
                    success,
                    code,
                    message: success
                        ? "Office LTSC 2024 instalado com sucesso."
                        : `Instalação terminou com código ${code}`,
                })

                runningProcess = null
            })

            return {
                started: true,
                message: "Instalação iniciada.",
            }
        } catch (error) {
            runningProcess = null

            sendLog(error.message, "error", 100)

            sendToWindows("office:install-done", {
                success: false,
                message: error.message,
            })

            return {
                started: false,
                message: error.message,
            }
        }
    })

    ipcMain.handle("office:stop", async () => {
        if (!runningProcess) {
            return {
                success: false,
                message: "Nenhuma instalação em execução.",
            }
        }

        try {
            runningProcess.kill()
            runningProcess = null

            sendToWindows("office:install-done", {
                success: false,
                message: "Instalação cancelada pelo usuário.",
            })

            return {
                success: true,
                message: "Instalação cancelada.",
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        }
    })
}