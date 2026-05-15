import { app, BrowserWindow, ipcMain, shell } from "electron"
import { execFile } from "child_process"
import fs from "fs"
import path from "path"
import os from "os"

const DISABLED_FILE = path.join(app.getPath("userData"), "startup-disabled.json")
const DISABLED_FOLDER = path.join(app.getPath("userData"), "Disabled Startup Items")

function sendToWindows(channel, payload) {
    BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
            win.webContents.send(channel, payload)
        }
    })
}

function ensureFiles() {
    if (!fs.existsSync(DISABLED_FOLDER)) {
        fs.mkdirSync(DISABLED_FOLDER, { recursive: true })
    }

    if (!fs.existsSync(DISABLED_FILE)) {
        fs.writeFileSync(DISABLED_FILE, JSON.stringify({ items: [] }, null, 2), "utf8")
    }
}

function readDisabledStore() {
    ensureFiles()

    try {
        return JSON.parse(fs.readFileSync(DISABLED_FILE, "utf8"))
    } catch {
        return { items: [] }
    }
}

function writeDisabledStore(store) {
    ensureFiles()
    fs.writeFileSync(DISABLED_FILE, JSON.stringify(store, null, 2), "utf8")
}

function runReg(args) {
    return new Promise((resolve) => {
        execFile("reg.exe", args, { windowsHide: true }, (error, stdout, stderr) => {
            resolve({
                success: !error,
                stdout: stdout || "",
                stderr: stderr || "",
                error,
            })
        })
    })
}

function parseRegOutput(stdout, keyPath, sourceLabel, needsAdmin = false) {
    const lines = stdout.split(/\r?\n/g)
    const items = []

    for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed || trimmed.startsWith("HKEY_")) continue

        const match = trimmed.match(/^(.+?)\s+(REG_\w+)\s+(.+)$/)

        if (!match) continue

        const valueName = match[1].trim()
        const valueType = match[2].trim()
        const command = match[3].trim()

        if (!valueName || !command) continue

        items.push({
            id: `reg::${keyPath}::${valueName}`,
            type: "registry",
            enabled: true,
            name: valueName,
            command,
            path: command,
            keyPath,
            valueName,
            valueType,
            sourceLabel,
            needsAdmin,
        })
    }

    return items
}

function getStartupFolders() {
    const userStartup = path.join(
        os.homedir(),
        "AppData",
        "Roaming",
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
        "Startup"
    )

    const allUsersStartup = path.join(
        process.env.ProgramData || "C:\\ProgramData",
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
        "Startup"
    )

    return [
        {
            folder: userStartup,
            sourceLabel: "Pasta Inicializar do usuário",
            needsAdmin: false,
        },
        {
            folder: allUsersStartup,
            sourceLabel: "Pasta Inicializar de todos os usuários",
            needsAdmin: true,
        },
    ]
}

function listStartupFolderItems() {
    const folders = getStartupFolders()
    const items = []

    folders.forEach(({ folder, sourceLabel, needsAdmin }) => {
        if (!fs.existsSync(folder)) return

        const files = fs.readdirSync(folder)

        files.forEach((file) => {
            const fullPath = path.join(folder, file)
            const stat = fs.statSync(fullPath)

            if (!stat.isFile()) return

            items.push({
                id: `file::${fullPath}`,
                type: "folder",
                enabled: true,
                name: file,
                command: fullPath,
                path: fullPath,
                sourceLabel,
                needsAdmin,
            })
        })
    })

    return items
}

async function listRegistryItems() {
    const targets = [
        {
            key: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            sourceLabel: "Registro do usuário",
            needsAdmin: false,
        },
        {
            key: "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            sourceLabel: "Registro do sistema",
            needsAdmin: true,
        },
    ]

    const results = []

    for (const target of targets) {
        const result = await runReg(["query", target.key])

        if (result.success) {
            results.push(
                ...parseRegOutput(
                    result.stdout,
                    target.key,
                    target.sourceLabel,
                    target.needsAdmin
                )
            )
        }
    }

    return results
}

function listDisabledItems() {
    const store = readDisabledStore()

    return store.items.map((item) => ({
        ...item,
        enabled: false,
    }))
}

async function getAllStartupItems() {
    const registryItems = await listRegistryItems()
    const folderItems = listStartupFolderItems()
    const disabledItems = listDisabledItems()

    const activeIds = new Set([...registryItems, ...folderItems].map((item) => item.id))

    const filteredDisabled = disabledItems.filter((item) => !activeIds.has(item.id))

    return [...registryItems, ...folderItems, ...filteredDisabled]
}

function addDisabledBackup(item) {
    const store = readDisabledStore()

    const exists = store.items.some((entry) => entry.id === item.id)

    if (!exists) {
        store.items.push(item)
        writeDisabledStore(store)
    }
}

function removeDisabledBackup(id) {
    const store = readDisabledStore()
    store.items = store.items.filter((item) => item.id !== id)
    writeDisabledStore(store)
}

async function findItemById(id) {
    const items = await getAllStartupItems()
    return items.find((item) => item.id === id)
}

export function registerStartupManagerHandlers() {
    ipcMain.removeHandler("startup:list")
    ipcMain.removeHandler("startup:disable")
    ipcMain.removeHandler("startup:enable")
    ipcMain.removeHandler("startup:open-folder")

    ipcMain.handle("startup:list", async () => {
        try {
            const items = await getAllStartupItems()

            return {
                success: true,
                items,
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                items: [],
            }
        }
    })

    ipcMain.handle("startup:disable", async (_, payload) => {
        try {
            const id = payload?.id

            if (!id) {
                return {
                    success: false,
                    message: "ID inválido.",
                }
            }

            const item = await findItemById(id)

            if (!item) {
                return {
                    success: false,
                    message: "Item não encontrado.",
                }
            }

            if (!item.enabled) {
                return {
                    success: true,
                    message: "Item já está desativado.",
                }
            }

            if (item.type === "registry") {
                addDisabledBackup(item)

                const result = await runReg([
                    "delete",
                    item.keyPath,
                    "/v",
                    item.valueName,
                    "/f",
                ])

                if (!result.success) {
                    return {
                        success: false,
                        message: result.stderr || "Não foi possível remover do registro.",
                    }
                }

                return {
                    success: true,
                    message: `${item.name} desativado com sucesso.`,
                }
            }

            if (item.type === "folder") {
                ensureFiles()

                const originalPath = item.path
                const targetPath = path.join(
                    DISABLED_FOLDER,
                    `${Date.now()}-${path.basename(originalPath)}`
                )

                fs.renameSync(originalPath, targetPath)

                addDisabledBackup({
                    ...item,
                    originalPath,
                    disabledPath: targetPath,
                })

                return {
                    success: true,
                    message: `${item.name} desativado com sucesso.`,
                }
            }

            return {
                success: false,
                message: "Tipo de item não suportado.",
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        }
    })

    ipcMain.handle("startup:enable", async (_, payload) => {
        try {
            const id = payload?.id

            if (!id) {
                return {
                    success: false,
                    message: "ID inválido.",
                }
            }

            const store = readDisabledStore()
            const item = store.items.find((entry) => entry.id === id)

            if (!item) {
                return {
                    success: false,
                    message: "Backup do item não encontrado.",
                }
            }

            if (item.type === "registry") {
                const result = await runReg([
                    "add",
                    item.keyPath,
                    "/v",
                    item.valueName,
                    "/t",
                    item.valueType || "REG_SZ",
                    "/d",
                    item.command || item.path,
                    "/f",
                ])

                if (!result.success) {
                    return {
                        success: false,
                        message: result.stderr || "Não foi possível restaurar no registro.",
                    }
                }

                removeDisabledBackup(id)

                return {
                    success: true,
                    message: `${item.name} ativado com sucesso.`,
                }
            }

            if (item.type === "folder") {
                if (!item.disabledPath || !item.originalPath) {
                    return {
                        success: false,
                        message: "Caminho de restauração inválido.",
                    }
                }

                const originalFolder = path.dirname(item.originalPath)

                if (!fs.existsSync(originalFolder)) {
                    fs.mkdirSync(originalFolder, { recursive: true })
                }

                fs.renameSync(item.disabledPath, item.originalPath)

                removeDisabledBackup(id)

                return {
                    success: true,
                    message: `${item.name} ativado com sucesso.`,
                }
            }

            return {
                success: false,
                message: "Tipo de item não suportado.",
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        }
    })

    ipcMain.handle("startup:open-folder", async () => {
        const userStartup = getStartupFolders()[0].folder

        if (!fs.existsSync(userStartup)) {
            fs.mkdirSync(userStartup, { recursive: true })
        }

        await shell.openPath(userStartup)

        return {
            success: true,
        }
    })
}