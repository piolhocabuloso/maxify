import { ipcMain } from "electron"
import discordRPC from "discord-rpc"
import { logo } from "."
import jsonData from "../../package.json"
import log from "electron-log"
console.log = log.log
console.error = log.error
console.warn = log.warn
const clientId = "1444759727673184276"
let rpcClient

async function startDiscordRPC() {
  setTimeout(async () => {
    try {
      rpcClient = new discordRPC.Client({ transport: "ipc" })

      rpcClient.on("ready", () => {
        console.log("(rpc.js) ", logo, "Discord RPC conectado")

        rpcClient.setActivity({
          details: "Otimizar seu PC",
          state: `Running Maxify v${jsonData.version || "2"}`,
          buttons: [
             // keep this as parcoil incase of the domain going down
            { label: "Download Maxify", url: "https://optimizex-six.vercel.app" },
            { label: "Abrir Discord", url: "https://discord.com/invite/45zyQEe2s3" },
          ],
          largeImageKey: "Maxifylogo",
          largeImageText: "Maxify",
          instance: false,
        }).catch(err => {
          console.warn("(rpc.js) ", "Falha ao definir a atividade Discord RPC:", err.message)
        })
      })

      rpcClient.on('error', (error) => {
        console.warn("(rpc.js) ", "Erro de discórdia RPC:", error.message)
        stopDiscordRPC()
      })

      await rpcClient.login({ clientId }).catch(error => {
        console.warn("(rpc.js) ", "Falha ao fazer login no Discord RPC:", error.message)
        stopDiscordRPC()
      })
    } catch (error) {
      console.warn("(rpc.js) ", "Falha ao inicializar o Discord RPC:", error.message)
      stopDiscordRPC()
    }
  }, 1000)
  
  return true
}

function stopDiscordRPC() {
  if (rpcClient) {
    rpcClient.destroy()
    rpcClient = null
    console.log("(rpc.js) ", "Discord RPC desconectado")
    return true
  }
  return false
}

ipcMain.handle("start-discord-rpc", () => {
  return startDiscordRPC()
})

ipcMain.handle("stop-discord-rpc", () => {
  return stopDiscordRPC()
})

export { startDiscordRPC, stopDiscordRPC }
