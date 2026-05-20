import { ipcMain, BrowserWindow } from "electron"
import discordRPC from "discord-rpc"
import jsonData from "../../package.json"
import log from "electron-log"

console.log = log.log
console.error = log.error
console.warn = log.warn

const clientId = "1444759727673184276"

discordRPC.register(clientId)

let rpcClient = null
let currentUserInfo = null
let reconnectTimer = null
let isStarting = false
let rpcEnabled = true

function sendDiscordUserToWindows(user) {
    const windows = BrowserWindow.getAllWindows()

    windows.forEach((win) => {
        if (!win.isDestroyed()) {
            win.webContents.send("discord-user-updated", user)
        }
    })
}

function updateUserInfo(user) {
    currentUserInfo = user
    sendDiscordUserToWindows(user)
}

function buildUserInfo(user) {
    if (!user) return null

    return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        tag:
            user.discriminator === "0"
                ? user.username
                : `${user.username}#${user.discriminator}`,
        mention: `<@${user.id}>`,
        avatarURL: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : null,
    }
}

async function setDiscordActivity() {
    if (!rpcClient) return

    const username = currentUserInfo?.username || null

    const activityDetails = username
        ? `Otimizando o PC de ${username}`
        : "Otimizando o PC"

    try {
        await rpcClient.setActivity({
            details: activityDetails,
            state: `Running Maxify v${jsonData.version || "2"}`,
            buttons: [
                {
                    label: "Download Maxify",
                    url: "https://optimizex-six.vercel.app",
                },
                {
                    label: "Abrir Discord",
                    url: "https://discord.com/invite/45zyQEe2s3",
                },
            ],
            largeImageKey: "maxifylogo",
            largeImageText: username ? `Maxify - ${username}` : "Maxify",
            instance: false,
            startTimestamp: Date.now(),
        })

    } catch (error) {
    }
}

function scheduleReconnect(delay = 5000) {
    if (!rpcEnabled) return
    if (reconnectTimer) return


    reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        startDiscordRPC()
    }, delay)
}

async function startDiscordRPC() {
    if (!rpcEnabled) return false

    if (isStarting) {
        return true
    }

    if (rpcClient) {
        return true
    }

    isStarting = true

    try {

        rpcClient = new discordRPC.Client({
            transport: "ipc",
        })

        rpcClient.on("ready", async () => {

            const userInfo = buildUserInfo(rpcClient.user)

            if (userInfo) {
                updateUserInfo(userInfo)
            } else {
                updateUserInfo(null)
            }

            await setDiscordActivity()
        })

        rpcClient.on("error", (error) => {
            stopDiscordRPC(false)
            scheduleReconnect(5000)
        })

        rpcClient.on("disconnected", () => {
            stopDiscordRPC(false)
            scheduleReconnect(5000)
        })

        await rpcClient.login({
            clientId,
        })

        return true
    } catch (error) {

        stopDiscordRPC(false)
        scheduleReconnect(5000)

        return false
    } finally {
        isStarting = false
    }
}

function stopDiscordRPC(disable = true) {
    if (disable) {
        rpcEnabled = false
    }

    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
    }

    if (rpcClient) {
        try {
            rpcClient.destroy()
        } catch (error) {
            console.warn("[Discord RPC] Erro ao destruir client:", error.message)
        }
    }

    rpcClient = null
    currentUserInfo = null
    isStarting = false

    updateUserInfo(null)


    return true
}

function restartDiscordRPC() {
    rpcEnabled = true

    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
    }

    if (rpcClient) {
        try {
            rpcClient.destroy()
        } catch {}
    }

    rpcClient = null
    currentUserInfo = null
    isStarting = false

    return startDiscordRPC()
}

function getCurrentUserInfo() {
    return currentUserInfo
}

ipcMain.handle("start-discord-rpc", async () => {
    rpcEnabled = true
    return await startDiscordRPC()
})

ipcMain.handle("stop-discord-rpc", () => {
    return stopDiscordRPC(true)
})

ipcMain.handle("restart-discord-rpc", async () => {
    return await restartDiscordRPC()
})

ipcMain.handle("get-discord-user", () => {
    return currentUserInfo
})

export {
    startDiscordRPC,
    stopDiscordRPC,
    restartDiscordRPC,
    getCurrentUserInfo,
}