import { ipcMain, BrowserWindow } from "electron"
import discordRPC from "discord-rpc"
import { logo } from "."
import jsonData from "../../package.json"
import log from "electron-log"

console.log = log.log
console.error = log.error
console.warn = log.warn

const clientId = "1444759727673184276"
let rpcClient
let currentUserInfo = null

function updateUserInfo(user) {
    currentUserInfo = user
    
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(win => {
        win.webContents.send('discord-user-updated', user)
    })
}

async function startDiscordRPC() {
    setTimeout(async () => {
        try {
            rpcClient = new discordRPC.Client({ transport: "ipc" })

            rpcClient.on("ready", () => {
                if (rpcClient && rpcClient.user) {
                    const userInfo = {
                        id: rpcClient.user.id,
                        username: rpcClient.user.username,
                        discriminator: rpcClient.user.discriminator,
                        avatar: rpcClient.user.avatar,
                        tag: rpcClient.user.discriminator === "0" 
                            ? rpcClient.user.username
                            : `${rpcClient.user.username}#${rpcClient.user.discriminator}`,
                        mention: `<@${rpcClient.user.id}>`,
                        avatarURL: rpcClient.user.avatar 
                            ? `https://cdn.discordapp.com/avatars/${rpcClient.user.id}/${rpcClient.user.avatar}.png`
                            : null
                    }
                    
                    updateUserInfo(userInfo)
                } else {
                    updateUserInfo(null)
                }

                const activityDetails = currentUserInfo && currentUserInfo.username !== "Usuário" 
                    ? `Otimizar seu PC - ${currentUserInfo.username}`
                    : "Otimizar seu PC"

                rpcClient.setActivity({
                    details: activityDetails,
                    state: `Running Maxify v${jsonData.version || "2"}`,
                    buttons: [
                        { label: "Download Maxify", url: "https://optimizex-six.vercel.app" },
                        { label: "Abrir Discord", url: "https://discord.com/invite/45zyQEe2s3" },
                    ],
                    largeImageKey: "Maxifylogo",
                    largeImageText: currentUserInfo ? `Maxify - ${currentUserInfo.username}` : "Maxify",
                    instance: false,
                }).catch(err => {})
            })

            rpcClient.on('error', (error) => {
                stopDiscordRPC()
            })

            await rpcClient.login({ clientId }).catch(error => {
                stopDiscordRPC()
            })
        } catch (error) {
            stopDiscordRPC()
        }
    }, 1000)
    
    return true
}

function stopDiscordRPC() {
    if (rpcClient) {
        rpcClient.destroy()
        rpcClient = null
        currentUserInfo = null
        
        const windows = BrowserWindow.getAllWindows()
        windows.forEach(win => {
            win.webContents.send('discord-user-updated', null)
        })
        return true
    }
    return false
}

function getCurrentUserInfo() {
    return currentUserInfo
}

ipcMain.handle("start-discord-rpc", () => {
    return startDiscordRPC()
})

ipcMain.handle("stop-discord-rpc", () => {
    return stopDiscordRPC()
})

ipcMain.handle("get-discord-user", () => {
    return currentUserInfo
})

export { startDiscordRPC, stopDiscordRPC, getCurrentUserInfo }