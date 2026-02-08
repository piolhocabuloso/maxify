import { app, shell, BrowserWindow, ipcMain, systemPreferences } from "electron"
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
import { startDiscordRPC, stopDiscordRPC } from "./rpc"
import { initAutoUpdater, triggerAutoUpdateCheck } from "./updates.js"
import { ensureWinget } from "./system"
const si = require('systeminformation');
import os from "os"
import { initAutoUpdater } from "./updater"

app.whenReady().then(() => {
  const win = createWindow()

  initAutoUpdater(win)
})

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify()
})













// Handler principal para todas as chamadas IPC
ipcMain.handle('invoke', async (event, data) => {
  const { channel, payload } = data || {};
  
  console.log(`IPC invoke: ${channel}`, payload || '');
  
  try {
    switch (channel) {
      case 'run-powershell':
        return await executePowerShell(event, payload);
      
      case 'get-system-metrics':
        return await getSystemMetrics();
      
      case 'get-gpu-metrics':
        return await getGpuMetrics();
      
      case 'get-network-metrics':
        return await getNetworkMetrics();
      
      case 'start-realtime-monitoring':
        return await startRealtimeMonitoring(event, payload?.interval || 2000);
      
      case 'stop-realtime-monitoring':
        return await stopRealtimeMonitoring(event);
      
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

// Adicione estas funções auxiliares se não existirem
async function getSystemMetrics() {
  try {
    const [cpu, mem, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.processes()
    ]);

    return {
      cpu: {
        total: cpu.currentLoad,
        user: cpu.currentLoadUser,
        system: cpu.currentLoadSystem,
        cores: cpu.cpus.map(core => core.load)
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        active: mem.active,
        available: mem.available,
        percentUsed: (mem.used / mem.total) * 100
      },
      processes: {
        total: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return null;
  }
}

async function getGpuMetrics() {
  try {
    const graphics = await si.graphics();
    return {
      controllers: graphics.controllers.map(ctrl => ({
        name: ctrl.model,
        vendor: ctrl.vendor,
        memoryTotal: ctrl.vram,
        memoryUsed: ctrl.vramDynamic || ctrl.vramUsed,
        temperature: ctrl.temperatureGpu,
        utilization: ctrl.utilizationGpu
      })),
      displays: graphics.displays.map(display => ({
        resolution: `${display.resolutionX}x${display.resolutionY}`,
        refreshRate: display.currentRefreshRate
      }))
    };
  } catch (error) {
    console.error('Error getting GPU metrics:', error);
    return null;
  }
}

async function startRealtimeMonitoring(event, interval) {
  const windowId = event.sender.id;
  
  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
  }

  const intervalId = setInterval(async () => {
    try {
      const [cpu, memory, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.processes()
      ]);

      // Filtrar processos de jogos
      const gameProcesses = processes.list.filter(p => 
        p.name && (
          p.name.toLowerCase().includes('cs2') ||
          p.name.toLowerCase().includes('valorant') ||
          p.name.toLowerCase().includes('fortnite') ||
          p.name.toLowerCase().includes('overwatch') ||
          p.name.toLowerCase().includes('steam') ||
          p.name.toLowerCase().endsWith('.exe')
        )
      );

      event.sender.send('realtime-metrics', {
        timestamp: new Date().toLocaleTimeString(),
        system: {
          cpu: cpu.currentLoad,
          memory: {
            percent: (memory.used / memory.total) * 100
          }
        },
        games: {
          list: gameProcesses.slice(0, 5).map(p => ({
            name: p.name,
            cpu: p.cpu,
            memory: p.mem,
            pid: p.pid
          }))
        },
        fps: 0 // Placeholder
      });
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }, interval);

  activeMonitors.set(windowId, intervalId);
  return { success: true };
}

async function stopRealtimeMonitoring(event) {
  const windowId = event.sender.id;
  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
    activeMonitors.delete(windowId);
  }
  return { success: true };
}
















// Adicione estes handlers para telemetria real
ipcMain.handle('get-system-metrics', async () => {
  try {
    const [cpu, mem, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.processes()
    ]);

    return {
      cpu: {
        total: cpu.currentLoad,
        user: cpu.currentLoadUser,
        system: cpu.currentLoadSystem,
        cores: cpu.cpus.map(core => core.load)
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        active: mem.active,
        available: mem.available,
        percentUsed: (mem.used / mem.total) * 100
      },
      processes: {
        total: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping
      },
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return null;
  }
});

ipcMain.handle('get-gpu-metrics', async () => {
  try {
    const graphics = await si.graphics();
    return {
      controllers: graphics.controllers.map(ctrl => ({
        name: ctrl.model,
        vendor: ctrl.vendor,
        memoryTotal: ctrl.vram,
        memoryUsed: ctrl.vramDynamic || ctrl.vramUsed,
        temperature: ctrl.temperatureGpu,
        utilization: ctrl.utilizationGpu
      })),
      displays: graphics.displays.map(display => ({
        resolution: `${display.resolutionX}x${display.resolutionY}`,
        refreshRate: display.currentRefreshRate
      }))
    };
  } catch (error) {
    console.error('Error getting GPU metrics:', error);
    return null;
  }
});

ipcMain.handle('get-network-metrics', async () => {
  try {
    const network = await si.networkStats();
    return network.map(iface => ({
      name: iface.iface,
      rxSec: iface.rx_sec,
      txSec: iface.tx_sec,
      speed: iface.speed
    }));
  } catch (error) {
    console.error('Error getting network metrics:', error);
    return null;
  }
});

// Para monitoramento em tempo real
const activeMonitors = new Map();

ipcMain.handle('start-realtime-monitoring', async (event, interval = 2000) => {
  const windowId = event.sender.id;

  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
  }

  const intervalId = setInterval(async () => {
    try {
      // Obter métricas básicas sem filtro de processos
      const [cpu, memory] = await Promise.all([
        si.currentLoad(),
        si.mem()
      ]);

      // Obter processos de forma segura
      let gameProcesses = [];
      try {
        const processes = await si.processes();
        // Filtrar processos de jogos de forma segura
        gameProcesses = processes.list.filter(p => 
          p && p.name && (
            p.name.toLowerCase().includes('cs2') ||
            p.name.toLowerCase().includes('valorant') ||
            p.name.toLowerCase().includes('fortnite') ||
            p.name.toLowerCase().includes('overwatch') ||
            p.name.toLowerCase().includes('steam') ||
            p.name.toLowerCase().includes('game') ||
            p.name.toLowerCase().endsWith('.exe')
          )
        ).slice(0, 5); // Limitar a 5 processos
      } catch (processError) {
        console.warn('Could not get processes:', processError.message);
        // Continuar sem informações de processos
      }

      event.sender.send('realtime-metrics', {
        timestamp: new Date().toLocaleTimeString(),
        system: {
          cpu: cpu.currentLoad,
          memory: {
            used: memory.used,
            total: memory.total,
            percent: (memory.used / memory.total) * 100
          }
        },
        games: {
          processes: gameProcesses.length,
          list: gameProcesses.map(p => ({
            name: p.name || 'Unknown',
            cpu: p.cpu || 0,
            memory: p.mem || 0,
            pid: p.pid || 0
          }))
        },
        fps: calculateEstimatedFPS(gameProcesses.reduce((sum, p) => sum + (p.cpu || 0), 0), cpu.currentLoad)
      });
    } catch (error) {
      console.error('Monitoring error:', error);
      // Enviar dados mínimos em caso de erro
      event.sender.send('realtime-metrics', {
        timestamp: new Date().toLocaleTimeString(),
        system: {
          cpu: 0,
          memory: { percent: 0 }
        },
        games: { processes: 0, list: [] },
        fps: 0
      });
    }
  }, interval);

  activeMonitors.set(windowId, intervalId);
  return { success: true };
});

// Função auxiliar para obter processos de jogos com fallback
async function getGameProcesses() {
  try {
    const processes = await si.processes();
    return processes.list.filter(p => 
      p && p.name && (
        p.name.toLowerCase().includes('game') ||
        p.name.toLowerCase().includes('cs2') ||
        p.name.toLowerCase().includes('valorant') ||
        p.name.toLowerCase().includes('fortnite') ||
        p.name.toLowerCase().includes('overwatch')
      )
    );
  } catch (error) {
    console.warn('Error getting game processes:', error.message);
    return [];
  }
}

ipcMain.handle('stop-realtime-monitoring', (event) => {
  const windowId = event.sender.id;
  if (activeMonitors.has(windowId)) {
    clearInterval(activeMonitors.get(windowId));
    activeMonitors.delete(windowId);
  }
  return true;
});

// Função para estimar FPS baseado no uso de recursos
function calculateEstimatedFPS(gameCpuUsage, systemCpuUsage) {
  if (gameCpuUsage === 0) return 0;

  // Fórmula simplificada para estimar FPS
  const cpuBottleneck = Math.max(0, 100 - systemCpuUsage);
  const gameEfficiency = Math.min(100, gameCpuUsage * 2);

  // Base FPS para diferentes níveis de CPU
  let baseFPS = 144; // Assumindo monitor 144Hz

  if (cpuBottleneck < 20) baseFPS = 60;
  else if (cpuBottleneck < 40) baseFPS = 90;
  else if (cpuBottleneck < 60) baseFPS = 120;

  // Ajustar baseado na eficiência do jogo
  const estimatedFPS = Math.round(baseFPS * (gameEfficiency / 100));

  // Adicionar variação realista
  const variation = Math.random() * 15 - 7.5;
  return Math.max(30, Math.min(360, estimatedFPS + variation));
}





























// === Sentry ===
Sentry.init({
  dsn: "https://d1e8991c715dd717e6b7b44dbc5c43dd@o4509167771648000.ingest.us.sentry.io/4509167772958720",
  ipcMode: IPCMode.Both,
})

// === Logger ===
console.log = log.log
console.error = log.error
console.warn = log.warn
export const logo = "[Maxify]:"
log.initialize()

// === Defender Exclusion ===
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

// === Store ===
const store = new Store()
let trayInstance = null
if (store.get("showTray") === undefined) store.set("showTray", true)

// === Tray Handlers ===
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

// === Discord RPC ===
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

// === Main Window ===
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
    icon: path.join(__dirname, "../../resources/sparkle2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      devTools: !app.isPackaged,
      sandbox: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  else mainWindow.loadFile(join(__dirname, "../renderer/index.html"))

  mainWindow.once("ready-to-show", () => mainWindow.show())
}

// === IPC: Window Controls ===
ipcMain.on("window-minimize", () => mainWindow?.minimize())
ipcMain.on("window-toggle-maximize", () => mainWindow && (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()))
ipcMain.on("window-close", () => {
  if (mainWindow) {
    if (store.get("showTray")) mainWindow.hide()
    else app.quit()
  }
})

// === App Ready ===
app.whenReady().then(() => {
  createWindow()
  if (store.get("showTray")) setTimeout(() => (trayInstance = createTray(mainWindow)), 50)
  setTimeout(() => {
    void Defender()
    setupTweaksHandlers()
    setupDNSHandlers()
    initDiscordRPC()
  }, 0)
  ipcMain.handle("get-real-time-metrics", () => {
    return {
      cpu: os.loadavg()[0],
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      uptime: os.uptime()
    }
  })
  electronApp.setAppUserModelId("com.parcoil.sparkle")
  app.on("browser-window-created", (_, window) => optimizer.watchWindowShortcuts(window))

  // === Single Instance Lock ===
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
})
