import { ipcMain, shell } from "electron"
import Store from "electron-store"
import os from "node:os"
import crypto from "node:crypto"
import si from "systeminformation"

const store = new Store({ name: "maxify-discord-auth" })

const AUTH_SERVER_URL = "https://api-auth-blue.vercel.app"
const APP_NAME = "Maxify"

function publicUser(user = null) {
  if (!user) return null

  const avatarURL =
    user.avatarURL ||
    (user.avatar && user.id
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : "")

  return {
    id: String(user.id || ""),
    username: String(user.username || "Usuário"),
    globalName: String(
      user.globalName ||
        user.global_name ||
        user.username ||
        "Usuário"
    ),
    tag: String(
      user.tag ||
        (user.discriminator && user.discriminator !== "0"
          ? `${user.username}#${user.discriminator}`
          : user.username || "Usuário")
    ),
    avatarURL,
    authenticatedAt: user.authenticatedAt || new Date().toISOString()
  }
}

async function collectSafeDeviceInfo() {
  try {
    const [cpu, mem, osInfo, graphics] = await Promise.all([
      si.cpu().catch(() => null),
      si.mem().catch(() => null),
      si.osInfo().catch(() => null),
      si.graphics().catch(() => null)
    ])

    const hwidSeed = [
      os.hostname(),
      os.platform(),
      os.arch(),
      os.totalmem(),
      os.cpus()?.[0]?.model
    ].join("|")

    const hwidHash = crypto
      .createHash("sha256")
      .update(hwidSeed)
      .digest("hex")

    return {
      app: APP_NAME,
      pcName: os.hostname(),
      systemUser: os.userInfo()?.username || "Desconhecido",
      os: osInfo
        ? `${osInfo.distro || os.platform()} ${osInfo.release || ""} (${osInfo.arch || os.arch()})`.trim()
        : `${os.platform()} ${os.release()}`,
      cpu: cpu
        ? `${cpu.manufacturer || ""} ${cpu.brand || ""}`.trim()
        : os.cpus()?.[0]?.model || "Desconhecido",
      gpu: graphics?.controllers?.[0]?.model || "Desconhecido",
      ramGB: mem?.total
        ? Number(mem.total / 1024 / 1024 / 1024).toFixed(1)
        : "Desconhecido",
      hwidHash: `${hwidHash.slice(0, 12)}...${hwidHash.slice(-8)}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      authenticatedAt: new Date().toISOString()
    }
  } catch {
    return {
      app: APP_NAME,
      pcName: os.hostname(),
      systemUser: os.userInfo()?.username || "Desconhecido",
      os: `${os.platform()} ${os.release()}`,
      authenticatedAt: new Date().toISOString()
    }
  }
}

async function getJson(url) {
  const response = await fetch(url)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `Erro HTTP ${response.status}`)
  }

  return data
}

export function registerDiscordAuthHandlers({ logsManagerRef } = {}) {
  ipcMain.handle("discord-auth:get-user", async () => {
    return {
      success: true,
      user: publicUser(store.get("user"))
    }
  })

  ipcMain.handle("discord-auth:logout", async () => {
    store.delete("user")
    store.delete("sessionId")

    return {
      success: true
    }
  })

  ipcMain.handle("discord-auth:start", async () => {
    try {
      const sessionId = crypto.randomUUID()

      store.set("sessionId", sessionId)

      const authUrl = `${AUTH_SERVER_URL}/auth/discord/start?session=${encodeURIComponent(sessionId)}&app=maxify`

      console.log("[Discord Auth] Abrindo:", authUrl)

      await shell.openExternal(authUrl)

      return {
        success: true,
        sessionId,
        authUrl
      }
    } catch (error) {
      console.error("[Discord Auth] Erro ao iniciar:", error)

      return {
        success: false,
        error: error.message || "Erro ao iniciar login com Discord."
      }
    }
  })

  ipcMain.handle("discord-auth:status", async (_, sessionId) => {
    try {
      const activeSession = String(sessionId || store.get("sessionId") || "")

      if (!activeSession) {
        return {
          success: false,
          authenticated: false,
          error: "Sessão de auth não iniciada."
        }
      }

      const statusUrl = `${AUTH_SERVER_URL}/auth/discord/status?session=${encodeURIComponent(activeSession)}`

      const data = await getJson(statusUrl)

      if (!data?.authenticated || !data?.user) {
        return {
          success: true,
          authenticated: false
        }
      }

      const user = publicUser(data.user)

      store.set("user", user)

      try {
        if (logsManagerRef?.current) {
          logsManagerRef.current.setDiscordUser(user)
        }
      } catch (error) {
        console.warn("[Discord Auth] Falha ao sincronizar usuário no LogsManager:", error.message)
      }

      return {
        success: true,
        authenticated: true,
        user
      }
    } catch (error) {
      console.error("[Discord Auth] Erro ao verificar status:", error)

      return {
        success: false,
        authenticated: false,
        error: error.message || "Erro ao verificar login com Discord."
      }
    }
  })
}
