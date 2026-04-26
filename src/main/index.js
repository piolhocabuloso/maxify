import { app, shell, BrowserWindow, ipcMain } from "electron"
import path, { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import * as Sentry from "@sentry/electron/main"
import { IPCMode } from "@sentry/electron/main"
import log from "electron-log"
import "./system"
import "./powershell"
import "./rpc"
import "./tweakHandler"
import "./dnsHandler"
import "./backup"
import { executePowerShell } from "./powershell"
import { createTray } from "./tray"
import { setupTweaksHandlers } from "./tweakHandler"
import { setupDNSHandlers } from "./dnsHandler"
import Store from "electron-store"
import { startDiscordRPC, stopDiscordRPC, getCurrentUserInfo } from "./rpc"
import { ensureWinget } from "./system"
import LogsManager from "./logs"
const si = require('systeminformation');
import crypto from "crypto"
import { machineIdSync } from 'node-machine-id';
import fs from "fs"
import { autoUpdater } from "electron-updater"

import os from "node:os"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

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

let updateInterval = null

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

const authFilePath = path.join(app.getPath("userData"), "saved-key.json")

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

    return {
      remember: !!parsed.remember,
      key: parsed.key || "",
    }
  } catch (error) {
    console.error("Erro ao ler key salva:", error)
    return { remember: false, key: "" }
  }
})

ipcMain.handle("auth:save-key", async (_, key) => {
  try {
    ensureAuthFolderFile()

    const data = {
      remember: true,
      key: String(key || "").trim(),
    }

    fs.writeFileSync(authFilePath, JSON.stringify(data, null, 2), "utf-8")
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar key:", error)
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

ipcMain.handle("get-monitor-lite", async () => {
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

const isDev = !app.isPackaged
// Instância do gerenciador de logs
let logsManager = null;

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

ipcMain.handle("get-system-uptime", async () => {
  return os.uptime()
})

function calculateEstimatedFPS(gameCpuUsage, systemCpuUsage) {
  const gameCpu = Math.max(0, gameCpuUsage || 0);
  const systemCpu = Math.max(0, systemCpuUsage || 0);

  if (gameCpu === 0) return 60;

  const cpuBottleneck = Math.max(0, 100 - systemCpu);
  const gameEfficiency = Math.min(100, gameCpu * 1.5);

  let baseFPS = 144;
  if (cpuBottleneck < 20) baseFPS = 60;
  else if (cpuBottleneck < 40) baseFPS = 90;
  else if (cpuBottleneck < 60) baseFPS = 120;

  const estimatedFPS = Math.round(baseFPS * (gameEfficiency / 100));
  return Math.max(30, Math.min(360, estimatedFPS));
}

const activeMonitors = new Map();

// ==================== HANDLERS DIRETOS IPC ====================

ipcMain.handle('get-hwid', async () => {
  try {
    const id = machineIdSync()
    return id
  } catch (error) {
    console.error('Erro ao obter HWID:', error)
    return `pc-${Math.random().toString(36).substring(2, 15)}`
  }
})

ipcMain.handle("get-real-time-metrics", async () => {
  try {
    const [cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.mem()
    ])

    return {
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.used / mem.total) * 100),
      disk: 0,
      gpu: 0,
      networkUpload: 0,
      networkDownload: 0,
      temp: 0
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
      temp: 0
    }
  }
})

ipcMain.handle('get-system-metrics', async () => {
  try {
    const [cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.mem()
    ]);

    return {
      cpu: {
        total: cpu.currentLoad || 0,
        user: cpu.currentLoadUser || 0,
        system: cpu.currentLoadSystem || 0,
        cores: cpu.cpus ? cpu.cpus.map(core => core.load) : []
      },
      memory: {
        total: mem.total || 0,
        used: mem.used || 0,
        free: mem.free || 0,
        active: mem.active || 0,
        available: mem.available || 0,
        percentUsed: mem.total > 0 ? (mem.used / mem.total) * 100 : 0
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      cpu: { total: 0, user: 0, system: 0, cores: [] },
      memory: { total: 0, used: 0, free: 0, active: 0, available: 0, percentUsed: 0 },
      timestamp: Date.now()
    };
  }
});

ipcMain.handle('get-gpu-metrics', async () => {
  try {
    const graphics = await si.graphics();
    return {
      controllers: graphics.controllers.map(ctrl => ({
        name: ctrl.model || 'Unknown',
        vendor: ctrl.vendor || 'Unknown',
        memoryTotal: ctrl.vram || 0,
        memoryUsed: ctrl.vramDynamic || ctrl.vramUsed || 0,
        temperature: ctrl.temperatureGpu || null,
        utilization: ctrl.utilizationGpu || null
      })),
      displays: graphics.displays.map(display => ({
        resolution: `${display.resolutionX || 0}x${display.resolutionY || 0}`,
        refreshRate: display.currentRefreshRate || 0
      }))
    };
  } catch (error) {
    console.error('Error getting GPU metrics:', error);
    return { controllers: [], displays: [] };
  }
});

ipcMain.handle('get-network-metrics', async () => {
  try {
    const network = await si.networkStats();
    return network.map(iface => ({
      name: iface.iface || 'unknown',
      rxSec: iface.rx_sec || 0,
      txSec: iface.tx_sec || 0,
      speed: iface.speed || 0
    }));
  } catch (error) {
    console.error('Error getting network metrics:', error);
    return [];
  }
});

ipcMain.handle('start-realtime-monitoring', async (event, interval = 2000) => {
  const windowId = event.sender.id;

  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
  }

  const intervalId = setInterval(async () => {
    try {
      const [cpu, memory] = await Promise.all([
        si.currentLoad(),
        si.mem()
      ]);

      let gameProcesses = [];
      let totalGameCpu = 0;

      try {
        const processes = await si.processes();
        if (processes && processes.list) {
          const gameKeywords = ['cs2', 'valorant', 'fortnite', 'overwatch', 'steam', 'game', 'minecraft', 'roblox', 'league', 'dota', 'apex', 'cod', 'battlefield'];

          gameProcesses = processes.list
            .filter(p => p && p.name && gameKeywords.some(keyword => p.name.toLowerCase().includes(keyword)))
            .slice(0, 5)
            .map(p => ({
              name: p.name || 'Unknown',
              cpu: p.cpu || 0,
              memory: p.mem || 0,
              pid: p.pid || 0
            }));

          totalGameCpu = gameProcesses.reduce((sum, p) => sum + (p.cpu || 0), 0);
        }
      } catch (processError) {
        console.warn('Could not get processes:', processError.message);
      }

      const estimatedFPS = calculateEstimatedFPS(totalGameCpu, cpu.currentLoad || 0);

      event.sender.send('realtime-metrics', {
        timestamp: new Date().toLocaleTimeString(),
        fps: estimatedFPS,
        system: {
          cpu: cpu.currentLoad || 0,
          memory: {
            used: memory.used || 0,
            total: memory.total || 0,
            percent: memory.total > 0 ? (memory.used / memory.total) * 100 : 0
          }
        },
        games: {
          processes: gameProcesses.length,
          list: gameProcesses
        }
      });
    } catch (error) {
      console.error('Monitoring error:', error);
      event.sender.send('realtime-metrics', {
        timestamp: new Date().toLocaleTimeString(),
        fps: 0,
        system: { cpu: 0, memory: { percent: 0 } },
        games: { processes: 0, list: [] }
      });
    }
  }, interval);

  activeMonitors.set(windowId, intervalId);
  return { success: true };
});

ipcMain.handle('stop-realtime-monitoring', (event) => {
  const windowId = event.sender.id;
  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
    activeMonitors.delete(windowId);
  }
  return { success: true };
});

ipcMain.handle('invoke', async (event, data) => {
  const { channel, payload } = data || {};

  console.log(`IPC invoke: ${channel}`, payload || '');

  try {
    switch (channel) {
      case 'run-powershell':
        return await executePowerShell(event, payload);

      case 'get-system-metrics':
        return await ipcMain._getSystemMetrics?.() || { success: false, error: 'Handler not available' };

      case 'get-gpu-metrics':
        return await ipcMain._getGpuMetrics?.() || { success: false, error: 'Handler not available' };

      case 'get-network-metrics':
        return await ipcMain._getNetworkMetrics?.() || { success: false, error: 'Handler not available' };

      case 'start-realtime-monitoring':
        return await ipcMain._startRealtimeMonitoring?.(event, payload?.interval || 2000) || { success: false, error: 'Handler not available' };

      case 'stop-realtime-monitoring':
        return await ipcMain._stopRealtimeMonitoring?.(event) || { success: false, error: 'Handler not available' };

      case 'test-connection':
        return { success: true, message: 'Connected to Electron' };

      default:
        console.warn(`Unknown IPC channel: ${channel}`);
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  } catch (error) {
    console.error(`Error in IPC handler ${channel}:`, error);
    return { success: false, error: error.message };
  }
});

// ==================== SENTRY ====================
Sentry.init({
  dsn: "https://d1e8991c715dd717e6b7b44dbc5c43dd@o4509167771648000.ingest.us.sentry.io/4509167772958720",
  ipcMode: IPCMode.Both,
})

// ==================== LOGGER ====================
console.log = log.log
console.error = log.error
console.warn = log.warn
export const logo = "[Maxify]:"
log.initialize()

// ==================== DEFENDER EXCLUSION ====================
async function Defender() {
  const Apppath = path.dirname(process.execPath)
  if (app.isPackaged) {
    const result = await executePowerShell(null, {
      script: `
        if (Get-Command Add-MpPreference -ErrorAction SilentlyContinue) {
          Add-MpPreference -ExclusionPath '${Apppath}'
          Write-Output "Success"
        } else {
          Write-Output "Skipped"
        }
      `,
      name: "Add-MpPreference",
    })

    if (result.output && result.output.includes("Skipped")) {
      console.log(logo, "Exclusão do Windows Defender ignorada (Defender não encontrado)")
    } else {
      console.log(logo, "Adicionado Maxify às exclusões do Windows Defender")
    }
  } else {
    console.log(logo, "Executando no modo de desenvolvimento, ignorando a exclusao do Windows Defender")
  }
}

// ==================== STORE ====================
const store = new Store()
let trayInstance = null
if (store.get("showTray") === undefined) store.set("showTray", true)

// ==================== TRAY HANDLERS ====================
ipcMain.handle("tray:get", () => store.get("showTray"))
ipcMain.handle("tray:set", (event, value) => {
  store.set("showTray", value)
  if (mainWindow) {
    if (value && !trayInstance) trayInstance = createTray(mainWindow)
    else if (!value && trayInstance) {
      trayInstance.destroy()
      trayInstance = null
    }
  }
  return store.get("showTray")
})

// ==================== DISCORD RPC ====================
const initDiscordRPC = () => {
  if (store.get("discord-rpc") === undefined) store.set("discord-rpc", true)

  if (store.get("discord-rpc") === true) {
    console.log(logo, "Iniciando o Discord RPC")
    startDiscordRPC().catch(err => console.warn("(main.js)", "Falha ao iniciar o Discord RPC:", err.message))
  }
}

ipcMain.handle("discord-rpc:toggle", async (event, value) => {
  try {
    if (value) {
      store.set("discord-rpc", true)
      startDiscordRPC().catch(err => console.warn("(main.js)", "Falha ao iniciar o Discord RPC:", err.message))
    } else {
      store.set("discord-rpc", false)
      stopDiscordRPC()
    }
    return { success: true, enabled: store.get("discord-rpc") }
  } catch (error) {
    console.error(logo, "Error toggling Discord RPC:", error)
    return { success: false, error: error.message, enabled: store.get("discord-rpc") }
  }
})
ipcMain.handle("discord-rpc:get", () => store.get("discord-rpc"))

// ==================== MAIN WINDOW ====================
export let mainWindow = null
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
      nodeIntegration: false
    },
  })
  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../renderer/index.html")
    )
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    if (logsManager) {
      // Função para enviar logs APÓS pegar o usuário do Discord
      const sendLogsAfterDelay = async () => {
        // Aguardar até 5 segundos para o Discord RPC conectar
        let user = null;
        for (let i = 0; i < 5; i++) {
          user = await getCurrentUserInfo();
          if (user) {
            logsManager.discordUser = user;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Enviar logs
        await logsManager.sendLogs().catch(err =>
          console.error('Erro ao enviar logs automáticos:', err)
        );
      };
      
      // Executar
      sendLogsAfterDelay();
    }
  })
}

// ==================== WINDOW CONTROLS ====================
ipcMain.on("window-minimize", () => mainWindow?.minimize())
ipcMain.on("window-toggle-maximize", () => mainWindow && (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()))
ipcMain.on("window-close", () => {
  if (mainWindow) {
    if (store.get("showTray")) mainWindow.hide()
    else app.quit()
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
if (store.get("autoLaunch") === undefined) store.set("autoLaunch", true)

app.setLoginItemSettings({
  openAtLogin: store.get("autoLaunch")
})

ipcMain.handle("auto-launch:get", () => {
  return store.get("autoLaunch")
})

ipcMain.handle("auto-launch:set", (event, value) => {
  store.set("autoLaunch", value)

  app.setLoginItemSettings({
    openAtLogin: value,
    path: process.execPath
  })

  return store.get("autoLaunch")
})

// ==================== APP READY ====================
app.whenReady().then(() => {
  setupAutoUpdater()
  
  // Inicializar LogsManager
  logsManager = new LogsManager();
  
  // Configurar listener para usuário do Discord
  ipcMain.on('discord-user-updated', (event, userInfo) => {
    if (logsManager) {
      if (userInfo) {
        logsManager.discordUser = userInfo;
        console.log(logo, `Usuário Discord recebido no LogsManager: ${userInfo.tag}`);
      } else {
        logsManager.discordUser = null;
        console.log(logo, "Usuário Discord desconectado");
      }
    }
  });
  
  // Sincronização periódica do usuário Discord como fallback
  setInterval(async () => {
    if (logsManager) {
      try {
        const user = await getCurrentUserInfo();
        if (user && (!logsManager.discordUser || logsManager.discordUser.id !== user.id)) {
          logsManager.discordUser = user;
          console.log(logo, `Usuário Discord sincronizado via polling: ${user.tag}`);
        }
      } catch (error) {
        // Ignorar erros
      }
    }
  }, 10000);
  
  createWindow()

  if (store.get("showTray")) setTimeout(() => (trayInstance = createTray(mainWindow)), 50)
  setTimeout(() => {
    void Defender()
    setupTweaksHandlers()
    setupDNSHandlers()
    initDiscordRPC()
  }, 0)

  electronApp.setAppUserModelId("com.parcoil.maxify")
  app.on("browser-window-created", (_, window) => optimizer.watchWindowShortcuts(window))

  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) app.quit()
  else
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  app.on("before-quit", () => {
    if (updateInterval) clearInterval(updateInterval)
  })
})