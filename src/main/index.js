import { app, shell, BrowserWindow, ipcMain, safeStorage } from "electron"
import path, { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import * as Sentry from "@sentry/electron/main"
import { IPCMode } from "@sentry/electron/main"
import log from "electron-log"
import "./system"
import "./powershell"
import "./rpc"
import "./dnsHandler"
import "./backup"
import { executePowerShell } from "./powershell"
import { createTray } from "./tray"
import { setupDNSHandlers } from "./dnsHandler"
import Store from "electron-store"
import { startDiscordRPC, stopDiscordRPC, getCurrentUserInfo } from "./rpc"
import LogsManager from "./logs"
import { registerDiscordAuthHandlers } from "./discordAuth"
const si = require("systeminformation")
import crypto from "crypto"
import { machineIdSync } from "node-machine-id"
import fs from "fs"
import { autoUpdater } from "electron-updater"
import { registerOfficeInstallerHandlers } from "./officeInstaller"
import { registerEssentialInstallerHandlers } from "./essentialInstaller"
import { registerStartupManagerHandlers } from "./startupManager"
import os from "node:os"
import { execFile, spawn } from "node:child_process"
import { promisify } from "node:util"
const execFileAsync = promisify(execFile)
const logsManagerRef = { current: null }

const isDev = !app.isPackaged

const isProduction = app.isPackaged

// ==================== ANTI DEBUG BÁSICO ====================
// Não é uma proteção perfeita, mas bloqueia debug simples em build instalado.
// Em desenvolvimento fica desligado para não atrapalhar npm run dev.
const BLOCKED_DEBUG_KEYS = new Set(["f12"])
const BLOCKED_DEBUG_COMBOS = [
  { ctrl: true, shift: true, key: "i" },
  { ctrl: true, shift: true, key: "j" },
  { ctrl: true, shift: true, key: "c" },
  { ctrl: true, key: "u" },
  { ctrl: true, key: "r" },
]

function hasSuspiciousDebugFlags() {
  if (!isProduction) return false

  const allArgs = [
    ...process.argv,
    ...process.execArgv,
  ].join(" ").toLowerCase()

  return [
    "--inspect",
    "--inspect-brk",
    "--remote-debugging-port",
    "--remote-allow-origins",
    "--devtools",
  ].some((flag) => allArgs.includes(flag))
}

function handleDebugDetected(reason = "Debug detectado") {
  if (!isProduction) return

  try {
    console.warn(`[Maxify Security]: ${reason}`)
    clearAuthSession?.()
  } catch { }

  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
    }
  } catch { }

  app.exit(0)
}

function blockDebugShortcuts(webContents) {
  if (!isProduction || !webContents) return

  webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase()

    const isBlockedKey = BLOCKED_DEBUG_KEYS.has(key)
    const isBlockedCombo = BLOCKED_DEBUG_COMBOS.some((combo) => {
      return (
        key === combo.key &&
        Boolean(input.control) === Boolean(combo.ctrl) &&
        Boolean(input.shift) === Boolean(combo.shift)
      )
    })

    if (isBlockedKey || isBlockedCombo) {
      event.preventDefault()
    }
  })
}

function protectWebContents(webContents) {
  if (!isProduction || !webContents) return

  blockDebugShortcuts(webContents)

  webContents.on("devtools-opened", () => {
    try {
      webContents.closeDevTools()
    } catch { }

    handleDebugDetected("DevTools aberto em build instalado")
  })

  webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })
}

function installAntiDebugRuntime() {
  if (!isProduction) return

  if (hasSuspiciousDebugFlags()) {
    handleDebugDetected("Inicialização com flags de debug")
    return
  }

  setInterval(() => {
    if (hasSuspiciousDebugFlags()) {
      handleDebugDetected("Flags de debug detectadas em runtime")
    }

    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.isDevToolsOpened()) {
      handleDebugDetected("DevTools detectado em runtime")
    }
  }, 2500)
}


// ==================== AUTH SECURITY ====================
// IMPORTANTE:
// O React/Login.jsx é apenas visual. A proteção real precisa ficar no processo main.
// Mesmo se alguém remover a tela de login do renderer, as funções protegidas abaixo não rodam sem sessão válida.
// COLE ESSE BLOCO NO src/main/index.js
// Substitua desde: // ==================== AUTH SECURITY ====================
// até antes de: // ==================== LOGGER ====================

// ==================== AUTH SECURITY ====================
// O React/Login.jsx é apenas visual. A proteção real fica no processo main.
const API_URL = process.env.MAXIFY_API_URL || "https://apikey-kohl.vercel.app"

const FREE_CLEAN_SCRIPT_HASHES = new Set([
  "061318f3c19a529844d0de9bc1210646fab82ad64dcb38e3ea9e389d9af16d83",
  "09ac3b20d873febfa2eb123aef548ac012c429531131b284435d561e4158180f",
  "0c905533270d502c197ebdd407555be42ee958bcc2df684a57debd1e96bdb247",
  "11b254d92430ecda2d0de90e570ee81924364ff86b78fe732f7bfdc97eff3ca8",
  "130fba9f46905b7db9f94f772337362858dc44548498b197aa29e3ca495a0428",
  "13dc67c9fe94b2fbd64a0308f4a0998c597f7cacdc3e2f70aa443db92ad94705",
  "17acc02ce4d7b1f55a6526f72978bc7e01dcfb19f8124e228324264fa21789c5",
  "1a92163a6ac0db03fe900e92fd57f11abaeadd98255bbead33424ded4a643220",
  "1bedb8a2396a606c762519a49bdb69926c7e8a095e81117d7069a9005cc52671",
  "1f11ec6591048ce0f6447d144e4caa6c998558fdb5235710c635ffd7be9d567d",
  "1f3199e0078c8e3133b044ef8e651a4b62f2ddfa71b1dabea0e90ba20f00e4cc",
  "2e94f4759b9545549554ff280f92eca5f29a2c8e5f9afa626616dd9862aaf0aa",
  "30c2437f6ee4b6c3536cf80f30a5de52600d19336971981ce554775f7ed54745",
  "362d77ea8d30e97c8f8f47494ca3d0ae6959b6bc5153b9bed54f3dc219511e86",
  "3707c9c7e858038b7ee56555ccee1b3b36d2cc0a60ef5462a4e271bc8274c19a",
  "3c1930ec99c770af9de641922e38755e551b8f163984f233b6436baaf0c8ecde",
  "41146a3c52c55b5b1e0660450f400aeb77208004485ee582bc0e17b0dc473f38",
  "43eef3a55869e6f0259ba4f56082aa9980d3e371250903c2f4817402db5fe03a",
  "495d2c8fbcf58ee48b90cca2393e1de2d273100b2a979f10df1fcd98eb5605b1",
  "49b6ac0590bf23d83125f415b7014b0b17cd32898efbb34779137a33974acc82",
  "5282ad7064a2a51c9fa75ffd5f7d5dd9f71aa94149bd8904bcfb81c76d2ca075",
  "592178f1dca3ccf6f46f27d3c16fc5577583e6a9e0f85813f9066c20c71d03ae",
  "5d66ffe22f371baf4f3b1770973e0b4a59bcfec70fef4f70992469f79a0a2b2b",
  "611e0c17057d258e6867bd58548974b45b916608c4d4883f0d4b904923886808",
  "6806901287bf086103d36b8dad6b63b940a188757a97cd021940b77d70eb0d50",
  "6831bb5d91b01c3ece3f100b77590e443f1d13cc6217c56432c11d809ef507e2",
  "68a2df011bf89216bb869e85f2a27191a0971d53923ead5c4a9b15cc3f97b4bf",
  "6aa20ae2e08003c7e71e7e2b4908ea5bc34e0490b31e566124f3218415e0c59d",
  "6abc06c455eb96fe96541cef3c2003ceb1f4e52f278105444abb947dc461f09f",
  "74b49b6961cd1c67f2776a8fce1ca98890375601cd3e5cf90492c14c2a74c119",
  "8033ef794f04956776d08bc430adbc7ad4c262e872b37eac1762df20146622f9",
  "819e56eabb4ee962149e8ba13523ede09bfbd88197bfbefa19720cbeb1f254fe",
  "87d8a8eef4bbd33685a280a218eb43c22b2cf356ed75a0f9609b7e3d150d3f1a",
  "89b121d24b52dbff5270cd5eb3386c83fc224e4e8d43c4a047856aeeb90c5045",
  "8c43c85b81e2fdb0dd0599a78d942b3290974fbfe64bd8fa7f365fd6dd35a3cb",
  "8d5caf1badaf0481def3ab75e88a9853ef70ffb85cf4a871c62c6730fa54e6d6",
  "913e609b312d4821017f5ddefc72a0d6951c4d7260e20065951cb3c867dae8fe",
  "a29343b739b0dacb1af1de609e49da5fa110fe932c82e5d6a0c2422b784a98fd",
  "a94fa699365b20e73ceba1f1ca880939073d5662d36c7bd786c65359a6b02445",
  "aa17296d8fc971bbf1bd438e04cecd214c597836601ca76348954b72b7a7e515",
  "ae7f751dca5997f5fa96731235bbda74ce3c05bee5ed7c0532bf0e9b9de14130",
  "b338d30219ee48e2f6a0ea4c3b61ade40a22454465235b506bb95d5fa91a7ad8",
  "b774b910f77a978b23374eac1db072d14fd79fdc680e3be79adb130ff246f7ab",
  "ba08090a09eafdf3cf23c58fd60c9abe3a28e99ac17fc139136bf6c8c754179d",
  "baf3ea19891d57edf4773422ef2d68efc86946f78ccee376dd03c273b8f60dad",
  "bd3c171625cbf5df90780f9a344a7675c2120ebff8d7c2c10e43bcfaa96f9a3f",
  "bfb2fb326dc9f5e3c26db2b7c33a49fb8c7a224693f251e88c3b1954d8bd9349",
  "ce64399f726598a45c292f0a771beb4af89a40db3bbb7e1b35b42cc65ba61aa0",
  "d19a3a83692eafa10b5668ab0338bd022c71d0f82cc1dd814cf77acde7e21289",
  "d26ef9843c993188a3db44f1a32a19e65a9c8f68345d009364a61247267c2534",
  "d47cfae2b8e36236b40c3706ea90481378beab80ddf539e085b6594fd04a87a6",
  "dbc7be50165856d68b8e8d34b1f790c145461d5782e7f6439e94addf6518bc3f",
  "e15ea3d435321a2bb38b8c8719ce5b77c1761dced7ed5404a0e3448de733474f",
  "e191bf178b77a7a677d746363fa49a936fbb2f70ba33e0f8980c43820c4765b5",
  "e4b05526e480ae1faca93f2993628b909dceae11e169c43ff30fc13e3be79168",
  "e56fcedfc30b94e4abd822a799709918db0276dc2d66ab33f354d62e452b1343",
  "f95fdd9bd4310b6e9d97a45248f25972eb73025435ee434ecb52b4be5c5cb213",
  "fffd9c8a29cbcc22d6987f92c2f0dc9b8a5cdac93cff1a528f4705b3a88ee62c",
])

let authSession = {
  logged: false,
  key: null,
  hwid: null,
  token: null,
  expiresAt: 0,
  plan: null,
  user: null,
  licenseExpiresAt: "",
  mode: "guest",
}

function clearAuthSession() {
  authSession = {
    logged: false,
    key: null,
    hwid: null,
    token: null,
    expiresAt: 0,
    plan: null,
    user: null,
    licenseExpiresAt: "",
    mode: "guest",
  }

  // Inicialização é PRO: remove handlers quando sair da sessão Premium.
  try {
    unregisterStartupManagerHandlers()
  } catch { }
}

function maskSensitive(value, start = 6, end = 4) {
  const text = String(value || "")
  if (!text) return ""
  if (text.length <= start + end) return "••••"
  return `${text.slice(0, start)}••••••${text.slice(-end)}`
}

function isAuthValid() {
  return Boolean(
    authSession.logged === true &&
    authSession.token &&
    authSession.hwid &&
    authSession.expiresAt > Date.now()
  )
}

function isFreeSession() {
  return isAuthValid() && authSession.mode === "free"
}

function publicAuthData(extra = {}) {
  return {
    success: true,
    logged: isAuthValid(),
    mode: authSession.mode || (authSession.plan === "Free" ? "free" : "premium"),
    plan: authSession.plan || "Lifetime",
    user: authSession.user || "Usuário Maxify",
    expiresAt: authSession.licenseExpiresAt || "",
    sessionExpiresAt: authSession.expiresAt || 0,
    keyMasked: maskSensitive(authSession.key),
    hwidMasked: maskSensitive(authSession.hwid, 8, 6),
    ...extra,
  }
}

function requireAuth() {
  if (!isAuthValid()) {
    throw new Error("Acesso negado. Faça login novamente.")
  }

  return true
}

function getScriptHashFromPayload(payload) {
  const script = typeof payload === "object" && payload !== null ? payload.script : payload

  return crypto
    .createHash("sha256")
    .update(String(script || ""))
    .digest("hex")
}

function normalizePayload(payload) {
  if (typeof payload === "object" && payload !== null) {
    return {
      name: String(payload.name || payload.id || payload.title || "").toLowerCase(),
      script: String(payload.script || payload.command || payload.code || "").toLowerCase(),
    }
  }

  return {
    name: "",
    script: String(payload || "").toLowerCase(),
  }
}

function hasDangerousPowerShell(script) {
  const dangerousPatterns = [
    "bcdedit",
    "set-mppreference",
    "disablerealtimemonitoring",
    "reg add",
    "reg delete",
    "new-itemproperty",
    "set-itemproperty",
    "powercfg",
    "sc.exe",
    "schtasks",
    "takeown",
    "icacls",
    "netsh",
    "wmic",
    "start-process",
    "invoke-webrequest",
    "iwr ",
    "curl",
    "bitsadmin",
  ]

  return dangerousPatterns.some((item) => script.includes(item))
}

function isSafeFreeMemoryCommand(script) {
  const cleanScript = String(script || "").trim().toLowerCase()

  const allowedExact = [
    "powercfg -change -standby-timeout-ac 0",
    "powercfg -change -standby-timeout-dc 0",
    "sc config sysmain start= disabled",
    "powercfg -setacvalueindex scheme_current sub_usb usbselective suspend 0",
    "powercfg -setdcvalueindex scheme_current sub_usb usbselective suspend 0",
    "sc config diagtrack start= disabled",
    "powercfg -attributes sub_usb 2a737441-1930-4402-8d77-b2bebba308a3 -attrib_hide",
    "powercfg -setacvalueindex scheme_current sub_usb 2a737441-1930-4402-8d77-b2bebba308a3 0",
    "powercfg -setdcvalueindex scheme_current sub_usb 2a737441-1930-4402-8d77-b2bebba308a3 0",
  ]

  return allowedExact.includes(cleanScript)
}

function isSafeFreePriorityCommand(script) {
  const cleanScript = String(script || "").toLowerCase()
  const isCheckOnly =
    cleanScript.includes("get-process -name") &&
    cleanScript.includes("erroraction silentlycontinue") &&
    cleanScript.includes('write-output "found:') &&
    !hasDangerousPowerShell(cleanScript)

  if (isCheckOnly) return true
  const isCpuPriorityRegistry =
    cleanScript.includes("hklm:\software\microsoft\windows nt\currentversion\image file execution options") &&
    cleanScript.includes("\perfoptions") &&
    cleanScript.includes("cpupriorityclass") &&
    cleanScript.includes("new-item -path") &&
    cleanScript.includes("set-itemproperty -path") &&
    /-value\s+(2|3|6)/i.test(script)

  const blockedEvenHere = [
    "invoke-webrequest",
    "iwr ",
    "curl",
    "bitsadmin",
    "start-process",
    "remove-item",
    "reg delete",
    "bcdedit",
    "set-mppreference",
    "disablerealtimemonitoring",
    "netsh",
    "takeown",
    "icacls",
    "schtasks",
  ]

  return isCpuPriorityRegistry && !blockedEvenHere.some((item) => cleanScript.includes(item))
}

function isFreeCleanPayload(payload) {
  const { name, script } = normalizePayload(payload)
  const scriptHash = getScriptHashFromPayload(payload)

  if (!name.startsWith("limpeza-") && !name.includes("clean") && !name.includes("limpeza")) {
    return false
  }

  if (FREE_CLEAN_SCRIPT_HASHES.has(scriptHash)) {
    return true
  }

  const cleanSafePatterns = [
    "$env:temp",
    "windows\\temp",
    "clear-recyclebin",
    "remove-item",
    "get-childitem",
    "wevtutil",
    "ipconfig /flushdns",
    "dism.exe",
    "cleanmgr",
    "softwaredistribution\\download",
    "prefetch",
    "recent",
    "temp",
  ]

  const hasCleanPattern = cleanSafePatterns.some((item) => script.includes(item))
  return hasCleanPattern && !hasDangerousPowerShell(script)
}

function isFreeMemoryPayload(payload) {
  const { name, script } = normalizePayload(payload)

  const allowedNames = [
    "memory",
    "memoria",
    "memória",
    "ram",
    "memory-optimizer",
  ]

  const allowedScripts = [
    "empty standby",
    "clearstandbylist",
    "ram",
    "memory",
    "working set",
    "get-process",
  ]

  if (isSafeFreeMemoryCommand(script)) return true

  const allowed =
    allowedNames.some((item) => name.includes(item)) ||
    allowedScripts.some((item) => script.includes(item))

  return allowed && !hasDangerousPowerShell(script)
}

function isFreeGamePriorityPayload(payload) {
  const { name, script } = normalizePayload(payload)

  const cleanScript = script.toLowerCase()

  const allowedNames = [
    "prioridade",
    "priority",
    "game-priority",
    "prioridade-jogo",
    "prioridade_para_jogos",
    "prioridade-para-jogos",
    "jogo",
    "games",
    "game",
  ]

  const allowedScripts = [
    "get-process",
    "priorityclass",
    ".priorityclass",
    "setpriority",
    "processname",
    "start-process",
    "wmic process",
    "where name",
    "realtime",
    "high",
    "above normal",
    "abovenormal",
    "set-priority",
  ]

  const isPriorityScript =
    cleanScript.includes("get-process") &&
    cleanScript.includes("priorityclass")

  const isWmicPriorityScript =
    cleanScript.includes("wmic") &&
    cleanScript.includes("process") &&
    cleanScript.includes("setpriority")

  const isStartGameScript =
    cleanScript.includes("start-process") &&
    cleanScript.includes("priority")

  const allowed =
    allowedNames.some((item) => name.includes(item)) ||
    allowedScripts.some((item) => cleanScript.includes(item)) ||
    isPriorityScript ||
    isWmicPriorityScript ||
    isStartGameScript

  return allowed
}

function isFreeResourcesPayload(payload) {
  const { name, script } = normalizePayload(payload)

  const allowedNames = [
    "resources",
    "recursos",
    "central",
    "central-recursos",
    "monitor",
    "metric",
  ]

  const allowedScripts = [
    "get-process",
    "get-counter",
    "get-ciminstance",
    "get-wmiobject",
    "win32_processor",
    "win32_operatingsystem",
    "win32_videocontroller",
    "network interface",
    "physicaldisk",
  ]

  const allowed =
    allowedNames.some((item) => name.includes(item)) ||
    allowedScripts.some((item) => script.includes(item))

  return allowed && !hasDangerousPowerShell(script)
}

function isLocalInputLagPayload(payload) {
  const { name, script } = normalizePayload(payload)

  if (!name.startsWith("inputlag-")) return false

  const blocked = [
    "invoke-webrequest",
    "invoke-expression",
    " iwr ",
    " curl",
    "bitsadmin",
    "start-process",
    "remove-item ",
    "remove-item\t",
    "bcdedit",
    "set-mppreference",
    "disablerealtimemonitoring",
    "takeown",
    "icacls",
    "schtasks",
    "netsh",
    "sc.exe",
    "downloadstring",
    "frombase64string",
  ]

  if (blocked.some((item) => script.includes(item))) return false

  const allowedNames = [
    "inputlag-device-info",
    "inputlag-check-mouse",
    "inputlag-check-keyboard",
    "inputlag-check-monitor",
    "inputlag-apply-mouse",
    "inputlag-apply-keyboard",
    "inputlag-apply-monitor",
    "inputlag-restore-mouse",
    "inputlag-restore-keyboard",
    "inputlag-restore-monitor",
  ]

  if (!allowedNames.includes(name)) return false

  const expectedSignals = [
    "get-pnpdevice",
    "class mouse",
    "class keyboard",
    "friendlyname",
    "instanceid",
    "wmimonitorid",
    "win32_desktopmonitor",
    "win32_videocontroller",
    "currenthorizontalresolution",
    "currentverticalresolution",
    "currentrefreshrate",
    "control panel\\mouse",
    "control panel\\keyboard",
    "gameconfigstore",
    "currentversion\\gamedvr",
    "graphicsdrivers",
    "accessibility\\keyboard response",
    "accessibility\\stickykeys",
    "accessibility\\togglekeys",
  ]

  return expectedSignals.some((item) => script.includes(item))
}

function getPayloadHash(payload) {
  return getScriptHashFromPayload(payload)
}

async function checkAppIntegrity() {
  if (!app.isPackaged) return true

  try {
    const asarPath = path.join(process.resourcesPath, "app.asar")

    if (!fs.existsSync(asarPath)) {
      console.warn("[Maxify Security]: app.asar não encontrado para checagem.")
      return true
    }

    const currentHash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(asarPath))
      .digest("hex")

    const response = await fetch(`${API_URL}/app-integrity?version=${encodeURIComponent(jsonData.version)}`)
    const data = await response.json().catch(() => null)

    if (!data || data.enforce !== true || !data.hash) {
      return true
    }

    if (String(data.hash).toLowerCase() !== currentHash.toLowerCase()) {
      console.error("[Maxify Security]: app.asar alterado. Fechando app.")
      clearAuthSession()
      app.quit()
      return false
    }

    return true
  } catch (error) {
    console.warn("[Maxify Security]: não foi possível validar integridade:", error.message)
    return true
  }
}


const PREMIUM_SCRIPT_PROTOCOL = "maxify-premium://"

function getRemotePremiumScriptIdFromPayload(payload) {
  const script = typeof payload === "object" && payload !== null ? payload.script : payload
  const text = String(script || "").trim()
  if (!text.startsWith(PREMIUM_SCRIPT_PROTOCOL)) return ""
  return text.slice(PREMIUM_SCRIPT_PROTOCOL.length).trim()
}

async function resolvePremiumScriptPayload(payload) {
  const scriptId = getRemotePremiumScriptIdFromPayload(payload)
  if (!scriptId) return payload

  if (!isAuthValid()) {
    throw new Error("Acesso negado. Faça login novamente.")
  }

  if (isFreeSession()) {
    throw new Error("Esse ajuste é Premium. No modo Free, essa função não está liberada.")
  }

  const response = await fetch(`${API_URL}/premium-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionToken: authSession.token,
      key: authSession.key,
      hwid: authSession.hwid,
      scriptId,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!data || !response.ok || !data.success || !data.script) {
    throw new Error(data?.message || "Não foi possível buscar o script Premium na API.")
  }

  if (typeof payload === "object" && payload !== null) {
    return {
      ...payload,
      script: String(data.script || ""),
      scriptId,
      remotePremium: true,
      name: payload.name || scriptId,
    }
  }

  return {
    script: String(data.script || ""),
    scriptId,
    remotePremium: true,
    name: scriptId,
  }
}

async function authorizePowerShellExecution(payload, action = "run-powershell") {
  if (isLocalInputLagPayload(payload)) {
    return {
      success: true,
      allowed: true,
      local: true,
    }
  }

  const isFreeAllowedPayload =
    isFreeCleanPayload(payload) ||
    isFreeMemoryPayload(payload) ||
    isFreeGamePriorityPayload(payload) ||
    isFreeResourcesPayload(payload)

  // Se estiver logado no modo Free, libera apenas funções Free, mas ainda valida a sessão na API.
  if (isFreeSession() && !isFreeAllowedPayload) {
    throw new Error("Esse ajuste é Premium. No modo Free, essa função não está liberada.")
  }

  // Segurança: se a sessão sumiu do main, NÃO libera nem Free.
  // Isso impede que alguém remova a tela de login e execute IPC direto.
  if (!isAuthValid()) {
    throw new Error("Acesso negado. Faça login novamente.")
  }

  const response = await fetch(`${API_URL}/authorize-tweak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionToken: authSession.token,
      key: authSession.key,
      hwid: authSession.hwid,
      action,
      scriptHash: getPayloadHash(payload),
    }),
  })

  const data = await response.json().catch(() => null)

  if (!data) {
    throw new Error("Resposta inválida do servidor.")
  }

  if (!response.ok || !data.success || data.allowed !== true) {
    throw new Error(data.message || "Ajuste não autorizado pelo servidor.")
  }

  return data
}
// ==================== LOGGER ====================
console.log = log.log
console.error = log.error
console.warn = log.warn
export const logo = "[Maxify]:"
log.initialize()

// ==================== SENTRY ====================
// DSN removido do código. Configure SENTRY_DSN no ambiente de build/execução se quiser usar.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    ipcMode: IPCMode.Both,
  })
}

// ==================== STORE ====================
const store = new Store()
let trayInstance = null
let logsManager = null
let updateInterval = null

if (store.get("showTray") === undefined) store.set("showTray", true)
if (store.get("autoLaunch") === undefined) store.set("autoLaunch", true)

// ==================== MAIN WINDOW ====================
export let mainWindow = null

// ==================== SINGLE INSTANCE ====================
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show()
  }

  mainWindow.focus()
  mainWindow.moveTop()
}

// ==================== AUTO UPDATER ====================
autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function sendUpdateStatus(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", data)
  }
}

export function setupAutoUpdater() {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.checkForUpdates()

  updateInterval = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60 * 1000)

  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus({
      type: "checking",
      message: "Verificando atualizações...",
    })
  })

  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus({
      type: "available",
      message: "Atualização disponível!",
      version: info.version,
    })
  })

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      type: "progress",
      message: "Baixando atualização...",
      percent: Math.round(progress.percent),
    })
  })

  autoUpdater.on("update-downloaded", (info) => {
    sendUpdateStatus({
      type: "downloaded",
      message: "Atualização baixada. Reinicie para instalar.",
      version: info.version,
    })
  })

  autoUpdater.on("update-not-available", () => {
    sendUpdateStatus({
      type: "none",
      message: "Seu app já está atualizado.",
    })
  })

  autoUpdater.on("error", (err) => {
    sendUpdateStatus({
      type: "error",
      message: err.message,
    })
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 3000)
}

ipcMain.handle("check-for-updates", async () => {
  console.log("🔥 CHECK UPDATE CHAMADO")

  try {
    if (!app.isPackaged) {
      return {
        success: false,
        message: "Só funciona no app instalado",
      }
    }

    await autoUpdater.checkForUpdates()

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, message: err.message }
  }
})

ipcMain.handle("install-update-now", () => {
  autoUpdater.quitAndInstall()
})

// ==================== POWERSHELL HELPER ====================
async function runPowerShell(script) {
  const { stdout } = await execFileAsync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script,
    ],
    {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    }
  )

  return stdout.trim()
}


function fixPowerShellEncoding(text) {
  return String(text || "")
    .replace(/opera��o/gi, "operação")
    .replace(/opera��es/gi, "operações")
    .replace(/conclu�da/gi, "concluída")
    .replace(/conclu�do/gi, "concluído")
    .replace(/�xito/gi, "êxito")
    .replace(/pr�/gi, "pré")
    .replace(/aplica��o/gi, "aplicação")
    .replace(/otimiza��o/gi, "otimização")
    .replace(/otimiza��es/gi, "otimizações")
    .replace(/m�dulo/gi, "módulo")
    .replace(/m�dulos/gi, "módulos")
    .replace(/n�o/gi, "não")
    .replace(/autom�tico/gi, "automático")
    .replace(/poss�vel/gi, "possível")
}

function buildLivePowerShellScript(script) {
  return `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
chcp 65001 > $null
$ProgressPreference = "SilentlyContinue"
${String(script || "")}
`
}

async function executePowerShellLive(event, payload) {
  return new Promise((resolve) => {
    const script = typeof payload === "object" && payload !== null
      ? String(payload.script || payload.command || payload.code || "")
      : String(payload || "")

    const name = typeof payload === "object" && payload !== null
      ? String(payload.name || payload.id || payload.title || "maxify-script")
      : "maxify-script"

    const ps = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NoLogo",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        buildLivePowerShellScript(script),
      ],
      {
        windowsHide: true,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      }
    )

    let output = ""
    let errorOutput = ""

    const sendLine = (line, fallbackType = "info") => {
      const cleanLine = fixPowerShellEncoding(String(line || "").trim())
      if (!cleanLine) return

      const lower = cleanLine.toLowerCase()
      const type =
        lower.includes("[erro]") ||
        lower.includes("falhou") ||
        lower.includes("error")
          ? "error"
          : lower.includes("[ok]") ||
              lower.includes("sucesso") ||
              lower.includes("concluído") ||
              lower.includes("concluída") ||
              lower.includes("êxito")
            ? "success"
            : fallbackType

      try {
        event.sender.send("powershell-live-log", {
          name,
          text: cleanLine,
          type,
        })
      } catch { }
    }

    const handleChunk = (chunk, fallbackType = "info") => {
      const text = fixPowerShellEncoding(Buffer.from(chunk).toString("utf8"))
      if (fallbackType === "error") {
        errorOutput += text
      } else {
        output += text
      }

      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => sendLine(line, fallbackType))
    }

    ps.stdout.on("data", (data) => handleChunk(data, "info"))
    ps.stderr.on("data", (data) => handleChunk(data, "error"))

    ps.on("error", (error) => {
      const message = error?.message || "Falha ao iniciar PowerShell."
      errorOutput += message
      sendLine(message, "error")

      resolve({
        success: false,
        code: -1,
        output,
        error: message,
      })
    })

    ps.on("close", (code) => {
      resolve({
        success: code === 0,
        code,
        output: fixPowerShellEncoding(output),
        error: fixPowerShellEncoding(errorOutput),
      })
    })
  })
}


function unregisterStartupManagerHandlers() {
  ipcMain.removeHandler("startup:list")
  ipcMain.removeHandler("startup:disable")
  ipcMain.removeHandler("startup:enable")
  ipcMain.removeHandler("startup:open-folder")
}

function registerStartupManagerForPremium() {
  unregisterStartupManagerHandlers()
  registerStartupManagerHandlers()
}


// ==================== AUTH KEY FILE ====================
const authFilePath = path.join(app.getPath("userData"), "saved-key.json")

function encryptText(text) {
  const cleanText = String(text || "")

  if (!cleanText) return ""

  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(cleanText).toString("base64")
    }
  } catch (error) {
    console.warn("safeStorage indisponível:", error.message)
  }

  return Buffer.from(cleanText, "utf8").toString("base64")
}

function decryptText(encrypted) {
  const cleanEncrypted = String(encrypted || "")

  if (!cleanEncrypted) return ""

  const buffer = Buffer.from(cleanEncrypted, "base64")

  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(buffer)
    }
  } catch (error) {
    console.warn("Falha ao descriptografar com safeStorage:", error.message)
  }

  return buffer.toString("utf8")
}


function ensureAuthFolderFile() {
  const dir = path.dirname(authFilePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(authFilePath)) {
    fs.writeFileSync(
      authFilePath,
      JSON.stringify({ remember: false, key: "" }, null, 2),
      "utf-8"
    )
  }
}

ipcMain.handle("auth:get-saved-key", async () => {
  try {
    ensureAuthFolderFile()

    const raw = fs.readFileSync(authFilePath, "utf-8")
    const parsed = JSON.parse(raw)

    if (!parsed.remember || !parsed.key) {
      return {
        remember: false,
        hasKey: false,
        key: "",
      }
    }

    const savedKey = parsed.encrypted
      ? decryptText(parsed.key)
      : String(parsed.key || "")

    return {
      remember: true,
      hasKey: !!savedKey,
      key: savedKey,
    }
  } catch (error) {
    console.error("Erro ao carregar key salva:", error)

    return {
      remember: false,
      hasKey: false,
      key: "",
    }
  }
})

ipcMain.handle("auth:save-key", async (_, key) => {
  try {
    ensureAuthFolderFile()

    const data = {
      remember: true,
      key: encryptText(String(key || "").trim()),
      encrypted: true,
    }

    fs.writeFileSync(authFilePath, JSON.stringify(data, null, 2), "utf-8")

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("auth:clear-saved-key", async () => {
  try {
    ensureAuthFolderFile()

    const data = {
      remember: false,
      key: "",
    }

    fs.writeFileSync(authFilePath, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (error) {
    console.error("Erro ao apagar key:", error)
    return { success: false, error: error.message }
  }
})


// ==================== AUTH LOGIN REAL NO MAIN ====================
async function loginWithKey(cleanKey, cleanHwid) {
  if (!cleanKey || !cleanHwid) {
    return {
      success: false,
      error: "Key ou HWID inválido.",
    }
  }

  const response = await fetch(`${API_URL}/verify-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: cleanKey,
      hwid: cleanHwid,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!data) {
    clearAuthSession()
    return {
      success: false,
      error: "Resposta inválida do servidor.",
    }
  }

  if (!response.ok || !data.success) {
    clearAuthSession()
    return {
      success: false,
      error: data.message || "Key inválida.",
    }
  }

  if (!data.sessionToken) {
    clearAuthSession()
    return {
      success: false,
      error: "Servidor não retornou sessão.",
    }
  }

  authSession = {
    logged: true,
    key: cleanKey,
    hwid: cleanHwid,
    token: data.sessionToken,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3,
    plan: data.plan || "Lifetime",
    user: data.user || "Usuário Maxify",
    licenseExpiresAt: data.expiresAt || "",
    mode: "premium",
  }

  // Inicialização é PRO: só registra os handlers depois do login Premium.
  registerStartupManagerForPremium()

  // Nunca retorna sessionToken, key completa ou HWID completo para o renderer.
  return publicAuthData({
    message: data.message || "Login aprovado.",
  })
}

ipcMain.handle("auth:login", async (_, { key, hwid }) => {
  try {
    return await loginWithKey(
      String(key || "").trim(),
      String(hwid || "").trim()
    )
  } catch (error) {
    clearAuthSession()
    return {
      success: false,
      error: error.message || "Erro ao validar key.",
    }
  }
})



async function loginFreeWithServer() {
  unregisterStartupManagerHandlers()

  const hwid = gerarHWID()

  const response = await fetch(`${API_URL}/free-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hwid }),
  })

  const data = await response.json().catch(() => null)

  if (!data || !response.ok || !data.success || !data.sessionToken) {
    clearAuthSession()
    return {
      success: false,
      error: data?.message || "Não foi possível iniciar o modo grátis.",
    }
  }

  authSession = {
    logged: true,
    key: "FREE-ACCESS",
    hwid,
    token: data.sessionToken,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12,
    plan: "Free",
    user: "Usuário Free",
    licenseExpiresAt: "",
    mode: "free",
  }

  return publicAuthData({
    message: data.message || "Modo grátis liberado.",
  })
}

ipcMain.handle("auth:login-free", async () => {
  try {
    return await loginFreeWithServer()
  } catch (error) {
    clearAuthSession()
    return {
      success: false,
      error: error.message || "Erro ao iniciar modo grátis.",
    }
  }
})

ipcMain.handle("auth:login-saved", async () => {
  clearAuthSession()

  try {
    ensureAuthFolderFile()

    const raw = fs.readFileSync(authFilePath, "utf-8")
    const parsed = JSON.parse(raw)
    const hasSavedKey = parsed?.remember && parsed?.key

    if (!hasSavedKey) {
      return {
        success: false,
        error: "Nenhuma key salva para login autom??tico.",
      }
    }

    const savedKey = parsed.encrypted
      ? decryptText(parsed.key)
      : String(parsed.key || "")

    const cleanKey = String(savedKey || "").trim()
    const cleanHwid = gerarHWID()

    if (!cleanKey || !cleanHwid) {
      return {
        success: false,
        error: "N??o foi poss??vel restaurar o login salvo.",
      }
    }

    return await loginWithKey(cleanKey, cleanHwid)
  } catch (error) {
    clearAuthSession()
    return {
      success: false,
      error: error.message || "Falha ao fazer login autom??tico.",
    }
  }
})

ipcMain.handle("auth:check-session", async () => {
  return publicAuthData({
    success: isAuthValid(),
  })
})

ipcMain.handle("auth:get-account", async () => {
  if (!isAuthValid()) {
    return {
      success: false,
      logged: false,
      mode: "guest",
      plan: "Guest",
      user: "Visitante",
      expiresAt: "",
      sessionExpiresAt: 0,
      keyMasked: "",
      hwidMasked: "",
    }
  }

  return publicAuthData()
})

ipcMain.handle("auth:logout", async () => {
  clearAuthSession()
  return { success: true }
})

// ==================== FUNÇÕES AUXILIARES ====================
function gerarHWID() {
  const data = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()[0]?.model,
    os.totalmem(),
  ].join("|")

  return crypto.createHash("sha256").update(data).digest("hex")
}

function calculateEstimatedFPS(gameCpuUsage, systemCpuUsage) {
  const gameCpu = Math.max(0, gameCpuUsage || 0)
  const systemCpu = Math.max(0, systemCpuUsage || 0)

  if (gameCpu === 0) return 60

  const cpuBottleneck = Math.max(0, 100 - systemCpu)
  const gameEfficiency = Math.min(100, gameCpu * 1.5)

  let baseFPS = 144

  if (cpuBottleneck < 20) baseFPS = 60
  else if (cpuBottleneck < 40) baseFPS = 90
  else if (cpuBottleneck < 60) baseFPS = 120

  const estimatedFPS = Math.round(baseFPS * (gameEfficiency / 100))

  return Math.max(30, Math.min(360, estimatedFPS))
}

const activeMonitors = new Map()

// ==================== MONITOR LITE ====================
ipcMain.handle("get-monitor-lite", async () => {
  requireAuth()

  try {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    const psScript = `
      $cpu = (Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue

      $down = (Get-Counter '\\Network Interface(*)\\Bytes Received/sec').CounterSamples |
        Where-Object { $_.InstanceName -notmatch 'isatap|loopback|teredo' } |
        Measure-Object -Property CookedValue -Sum

      $up = (Get-Counter '\\Network Interface(*)\\Bytes Sent/sec').CounterSamples |
        Where-Object { $_.InstanceName -notmatch 'isatap|loopback|teredo' } |
        Measure-Object -Property CookedValue -Sum

      $diskRead = (Get-Counter '\\PhysicalDisk(_Total)\\Disk Read Bytes/sec').CounterSamples.CookedValue
      $diskWrite = (Get-Counter '\\PhysicalDisk(_Total)\\Disk Write Bytes/sec').CounterSamples.CookedValue

      [PSCustomObject]@{
        cpu = [math]::Round($cpu, 1)
        download = [math]::Round(($down.Sum), 1)
        upload = [math]::Round(($up.Sum), 1)
        diskRead = [math]::Round($diskRead, 1)
        diskWrite = [math]::Round($diskWrite, 1)
      } | ConvertTo-Json -Compress
    `

    const raw = await runPowerShell(psScript)
    const perf = JSON.parse(raw)

    return {
      success: true,
      cpu: Number(perf.cpu || 0),
      ram: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: totalMem ? (usedMem / totalMem) * 100 : 0,
      },
      network: {
        download: Number(perf.download || 0),
        upload: Number(perf.upload || 0),
      },
      disk: {
        read: Number(perf.diskRead || 0),
        write: Number(perf.diskWrite || 0),
      },
      uptime: os.uptime(),
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error("Erro get-monitor-lite:", error)

    return {
      success: false,
      error: error.message,
    }
  }
})

// ==================== HANDLERS DIRETOS IPC ====================
ipcMain.handle("get-hwid", async () => {
  try {
    const id = machineIdSync()
    return id
  } catch (error) {
    console.error("Erro ao obter HWID:", error)
    return `pc-${Math.random().toString(36).substring(2, 15)}`
  }
})

ipcMain.handle("get-system-uptime", async () => {
  return os.uptime()
})

ipcMain.handle("get-real-time-metrics", async () => {
  requireAuth()

  try {
    const [cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.mem(),
    ])

    return {
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.used / mem.total) * 100),
      disk: 0,
      gpu: 0,
      networkUpload: 0,
      networkDownload: 0,
      temp: 0,
    }
  } catch (err) {
    console.error("Erro métricas:", err)

    return {
      cpu: 0,
      ram: 0,
      disk: 0,
      gpu: 0,
      networkUpload: 0,
      networkDownload: 0,
      temp: 0,
    }
  }
})

ipcMain.handle("get-system-metrics", async () => {
  requireAuth()

  try {
    const [cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.mem(),
    ])

    return {
      cpu: {
        total: cpu.currentLoad || 0,
        user: cpu.currentLoadUser || 0,
        system: cpu.currentLoadSystem || 0,
        cores: cpu.cpus ? cpu.cpus.map((core) => core.load) : [],
      },
      memory: {
        total: mem.total || 0,
        used: mem.used || 0,
        free: mem.free || 0,
        active: mem.active || 0,
        available: mem.available || 0,
        percentUsed: mem.total > 0 ? (mem.used / mem.total) * 100 : 0,
      },
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error("Error getting system metrics:", error)

    return {
      cpu: {
        total: 0,
        user: 0,
        system: 0,
        cores: [],
      },
      memory: {
        total: 0,
        used: 0,
        free: 0,
        active: 0,
        available: 0,
        percentUsed: 0,
      },
      timestamp: Date.now(),
    }
  }
})

ipcMain.handle("get-gpu-metrics", async () => {
  requireAuth()

  try {
    const graphics = await si.graphics()

    return {
      controllers: graphics.controllers.map((ctrl) => ({
        name: ctrl.model || "Unknown",
        vendor: ctrl.vendor || "Unknown",
        memoryTotal: ctrl.vram || 0,
        memoryUsed: ctrl.vramDynamic || ctrl.vramUsed || 0,
        temperature: ctrl.temperatureGpu || null,
        utilization: ctrl.utilizationGpu || null,
      })),
      displays: graphics.displays.map((display) => ({
        resolution: `${display.resolutionX || 0}x${display.resolutionY || 0}`,
        refreshRate: display.currentRefreshRate || 0,
      })),
    }
  } catch (error) {
    console.error("Error getting GPU metrics:", error)
    return { controllers: [], displays: [] }
  }
})

ipcMain.handle("get-network-metrics", async () => {
  requireAuth()

  try {
    const network = await si.networkStats()

    return network.map((iface) => ({
      name: iface.iface || "unknown",
      rxSec: iface.rx_sec || 0,
      txSec: iface.tx_sec || 0,
      speed: iface.speed || 0,
    }))
  } catch (error) {
    console.error("Error getting network metrics:", error)
    return []
  }
})

ipcMain.handle("start-realtime-monitoring", async (event, interval = 2000) => {
  requireAuth()

  const windowId = event.sender.id

  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId))
  }

  const intervalId = setInterval(async () => {
    try {
      const [cpu, memory] = await Promise.all([
        si.currentLoad(),
        si.mem(),
      ])

      let gameProcesses = []
      let totalGameCpu = 0

      try {
        const processes = await si.processes()

        if (processes && processes.list) {
          const gameKeywords = [
            "cs2",
            "valorant",
            "fortnite",
            "overwatch",
            "steam",
            "game",
            "minecraft",
            "roblox",
            "league",
            "dota",
            "apex",
            "cod",
            "battlefield",
          ]

          gameProcesses = processes.list
            .filter(
              (p) =>
                p &&
                p.name &&
                gameKeywords.some((keyword) =>
                  p.name.toLowerCase().includes(keyword)
                )
            )
            .slice(0, 5)
            .map((p) => ({
              name: p.name || "Unknown",
              cpu: p.cpu || 0,
              memory: p.mem || 0,
              pid: p.pid || 0,
            }))

          totalGameCpu = gameProcesses.reduce(
            (sum, p) => sum + (p.cpu || 0),
            0
          )
        }
      } catch (processError) {
        console.warn("Could not get processes:", processError.message)
      }

      const estimatedFPS = calculateEstimatedFPS(
        totalGameCpu,
        cpu.currentLoad || 0
      )

      event.sender.send("realtime-metrics", {
        timestamp: new Date().toLocaleTimeString(),
        fps: estimatedFPS,
        system: {
          cpu: cpu.currentLoad || 0,
          memory: {
            used: memory.used || 0,
            total: memory.total || 0,
            percent:
              memory.total > 0 ? (memory.used / memory.total) * 100 : 0,
          },
        },
        games: {
          processes: gameProcesses.length,
          list: gameProcesses,
        },
      })
    } catch (error) {
      console.error("Monitoring error:", error)

      event.sender.send("realtime-metrics", {
        timestamp: new Date().toLocaleTimeString(),
        fps: 0,
        system: {
          cpu: 0,
          memory: {
            percent: 0,
          },
        },
        games: {
          processes: 0,
          list: [],
        },
      })
    }
  }, interval)

  activeMonitors.set(windowId, intervalId)

  return { success: true }
})

ipcMain.handle("stop-realtime-monitoring", (event) => {
  requireAuth()

  const windowId = event.sender.id

  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId))
    activeMonitors.delete(windowId)
  }

  return { success: true }
})

ipcMain.handle("invoke", async (event, data) => {
  const { channel, payload } = data || {}

  console.log(`IPC invoke: ${channel}`)

  try {
    switch (channel) {
      case "auth:login":
        return await loginWithKey(
          String(payload?.key || "").trim(),
          String(payload?.hwid || "").trim()
        )

      case "auth:login-free":
        return await loginFreeWithServer()

      case "auth:check-session":
        return publicAuthData({
          success: isAuthValid(),
        })

      case "auth:logout":
        clearAuthSession()
        return { success: true }

      case "run-powershell": {
        const securedPayload = await resolvePremiumScriptPayload(payload)
        await authorizePowerShellExecution(securedPayload)
        return await executePowerShellLive(event, securedPayload)
      }

      case "test-connection":
        return {
          success: true,
          message: "Connected to Electron",
        }

      default:
        console.warn(`Unknown IPC channel: ${channel}`)

        return {
          success: false,
          error: `Unknown channel: ${channel}`,
        }
    }
  } catch (error) {
    console.error(`Error in IPC handler ${channel}:`, error)

    return {
      success: false,
      error: error.message,
    }
  }
})

ipcMain.removeHandler("run-powershell")

ipcMain.handle("run-powershell", async (event, payload) => {
  try {
    const securedPayload = await resolvePremiumScriptPayload(payload)
    await authorizePowerShellExecution(securedPayload)
    return await executePowerShellLive(event, securedPayload)
  } catch (error) {
    console.error("Erro em run-powershell protegido:", error)
    return {
      success: false,
      error: error.message || "Erro ao executar ajuste.",
    }
  }
})

// ==================== TRAY HANDLERS ====================
ipcMain.handle("tray:get", () => store.get("showTray"))

ipcMain.handle("tray:set", (event, value) => {
  store.set("showTray", value)

  if (mainWindow) {
    if (value && !trayInstance) {
      trayInstance = createTray(mainWindow)
    } else if (!value && trayInstance) {
      trayInstance.destroy()
      trayInstance = null
    }
  }

  return store.get("showTray")
})

// ==================== DISCORD RPC ====================
const initDiscordRPC = () => {
  if (store.get("discord-rpc") === undefined) {
    store.set("discord-rpc", true)
  }

  if (store.get("discord-rpc") === true) {
    console.log(logo, "Iniciando o Discord RPC")

    startDiscordRPC().catch((err) =>
      console.warn("(main.js)", "Falha ao iniciar o Discord RPC:", err.message)
    )
  }
}

ipcMain.handle("discord-rpc:toggle", async (event, value) => {
  try {
    if (value) {
      store.set("discord-rpc", true)

      startDiscordRPC().catch((err) =>
        console.warn("(main.js)", "Falha ao iniciar o Discord RPC:", err.message)
      )
    } else {
      store.set("discord-rpc", false)
      stopDiscordRPC()
    }

    return {
      success: true,
      enabled: store.get("discord-rpc"),
    }
  } catch (error) {
    console.error(logo, "Error toggling Discord RPC:", error)

    return {
      success: false,
      error: error.message,
      enabled: store.get("discord-rpc"),
    }
  }
})
registerEssentialInstallerHandlers()
registerOfficeInstallerHandlers()
// Inicialização é PRO: os handlers startup:* só são registrados após login Premium.
ipcMain.handle("discord-rpc:get", () => store.get("discord-rpc"))

// ==================== MAIN WINDOW CREATE ====================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 760,
    minWidth: 790,
    center: true,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0c121f",
    icon: path.join(__dirname, "../../resources/maxify2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      devTools: !app.isPackaged,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,

    },

  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
  }

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    mainWindow.show()
    mainWindow.focus()

    // Logs automáticos removidos: agora o log é enviado somente após o usuário autorizar no Discord Auth.
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// ==================== WINDOW CONTROLS ====================
ipcMain.on("window-minimize", () => {
  mainWindow?.minimize()
})

ipcMain.on("window-toggle-maximize", () => {
  if (!mainWindow) return

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.on("window-close", () => {
  if (!mainWindow) return

  clearAuthSession()

  try {
    mainWindow.webContents.send("auth:force-logout")
  } catch { }

  if (store.get("showTray")) {
    mainWindow.hide()
  } else {
    app.quit()
  }
})

// ==================== COMMAND LINE SWITCHES ====================
app.commandLine.appendSwitch("disable-renderer-backgrounding")
app.commandLine.appendSwitch("disable-background-timer-throttling")
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows")
app.commandLine.appendSwitch("enable-gpu-rasterization")
app.commandLine.appendSwitch("enable-zero-copy")
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096")
app.commandLine.appendSwitch("ignore-certificate-errors")
app.commandLine.appendSwitch("allow-insecure-localhost")

// ==================== AUTO LAUNCH ====================
app.setLoginItemSettings({
  openAtLogin: store.get("autoLaunch"),
})

ipcMain.handle("auto-launch:get", () => {
  return store.get("autoLaunch")
})

ipcMain.handle("auto-launch:set", (event, value) => {
  store.set("autoLaunch", value)

  app.setLoginItemSettings({
    openAtLogin: value,
    path: process.execPath,
  })

  return store.get("autoLaunch")
})

// ==================== APP READY ====================
if (gotTheLock) {
  app.on("second-instance", () => {
    showMainWindow()
  })

  app.on("web-contents-created", (_, contents) => {
    protectWebContents(contents)
  })

  app.whenReady().then(async () => {
    installAntiDebugRuntime()

    setTimeout(() => {
      setupAutoUpdater()
    }, 8000)
    clearAuthSession()
    logsManager = new LogsManager()
    logsManagerRef.current = logsManager
    registerDiscordAuthHandlers({ logsManagerRef })
    if (!app.isPackaged) {
      try {
        const ses = await import("electron").then((m) => m.session)

        await ses.defaultSession.clearCache()
        await ses.defaultSession.clearStorageData({
          storages: ["appcache", "shadercache", "serviceworkers", "cachestorage"],
        })

        console.log("[Maxify]: Cache de desenvolvimento limpo")
      } catch (error) {
        console.warn("[Maxify]: Falha ao limpar cache dev:", error.message)
      }
    }
    ipcMain.on("discord-user-updated", (event, userInfo) => {
      if (logsManager) {
        if (userInfo) {
          logsManager.discordUser = userInfo
          console.log(
            logo,
            `Usuário Discord recebido no LogsManager: ${userInfo.tag}`
          )
        } else {
          logsManager.discordUser = null
          console.log(logo, "Usuário Discord desconectado")
        }
      }
    })

    setInterval(async () => {
      if (logsManager) {
        try {
          const user = await getCurrentUserInfo()

          if (
            user &&
            (!logsManager.discordUser || logsManager.discordUser.id !== user.id)
          ) {
            logsManager.discordUser = user
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    }, 10000)

    setTimeout(async () => {
      try {
        if (!logsManager) return

        const savedAuthUser = store.get("user")
        if (savedAuthUser && typeof savedAuthUser === "object") {
          logsManager.setDiscordUser(savedAuthUser)
        } else {
          const rpcUser = await Promise.resolve(getCurrentUserInfo()).catch(() => null)
          if (rpcUser) {
            logsManager.setDiscordUser(rpcUser)
          }
        }

        await logsManager.sendLogs()
      } catch (error) {
      }
    }, 15000)

    createWindow()

    if (store.get("showTray")) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          trayInstance = createTray(mainWindow)
        }
      }, 50)
    }

    setTimeout(() => {
      setupDNSHandlers()
    }, 0)

    setTimeout(() => {
      initDiscordRPC()
    }, 5000)

    electronApp.setAppUserModelId("com.parcoil.maxify")

    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on("activate", () => {
      showMainWindow()
    })

    app.on("before-quit", () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })
  })
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (!store.get("showTray")) {
      app.quit()
    }
  }
})
