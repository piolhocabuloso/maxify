const { contextBridge, ipcRenderer } = require("electron");

// Canais válidos para segurança
const validChannels = [
  "window-minimize",
  "window-toggle-maximize", 
  "window-close",
  "run-powershell",
  "run-powershell-window",
  "get-system-metrics",
  "get-gpu-metrics",
  "get-network-metrics",
  "start-realtime-monitoring",
  "stop-realtime-monitoring",
  "get-real-time-metrics",
  "invoke", // Canal principal para compatibilidade
];

const validListenerChannels = [
  "realtime-metrics",
  "system-info", 
  "game-detected",
  "install-progress",
  "install-complete",
  "install-error",
  "installed-apps-checked"
];

contextBridge.exposeInMainWorld("electron", {
  // Controles de janela
  minimize: () => ipcRenderer.send("window-minimize"),
  toggleMaximize: () => ipcRenderer.send("window-toggle-maximize"),
  close: () => ipcRenderer.send("window-close"),
  
  // Método principal para invocar handlers (compatibilidade)
  invoke: (data) => {
    if (data && data.channel) {
      // Se for um objeto com channel e payload
      return ipcRenderer.invoke("invoke", data);
    }
    // Compatibilidade com chamadas antigas
    return ipcRenderer.invoke(data.channel || data, data.payload || {});
  },
  
  // Métodos específicos para PowerShell
  runPowershell: (script, name = "script") => 
    ipcRenderer.invoke("run-powershell", { script, name }),
  
  // Sistema de eventos/listeners
  on: (channel, func) => {
    if (validListenerChannels.includes(channel)) {
      // Função wrapper para remover o listener mais tarde se necessário
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      
      // Retorna função para remover o listener
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    console.warn(`Attempted to listen to invalid channel: ${channel}`);
  },
  
  // Remover listeners específicos
  off: (channel, func) => {
    if (validListenerChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
  
  // Remover todos os listeners de um canal
  removeAllListeners: (channel) => {
    if (validListenerChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  
  // Método receive para compatibilidade com código existente
  receive: (channel, func) => {
    if (validListenerChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`Attempted to receive from invalid channel: ${channel}`);
    }
  },
  
  // Método específico para telemetria em tempo real
  startRealtimeMonitoring: (interval = 2000) => 
    ipcRenderer.invoke("start-realtime-monitoring", interval),
  
  stopRealtimeMonitoring: () => 
    ipcRenderer.invoke("stop-realtime-monitoring"),
  
  // Obter métricas do sistema
  getSystemMetrics: () => ipcRenderer.invoke("get-system-metrics"),
  getGpuMetrics: () => ipcRenderer.invoke("get-gpu-metrics"),
  getNetworkMetrics: () => ipcRenderer.invoke("get-network-metrics"),
  
  // Método simplificado para métricas em tempo real (alternativa)
  onMetricsUpdate: (callback) => {
    let intervalId;
    
    const startUpdates = () => {
      intervalId = setInterval(async () => {
        try {
          const metrics = await ipcRenderer.invoke("get-real-time-metrics");
          callback(metrics);
        } catch (error) {
          console.error("Error in metrics interval:", error);
        }
      }, 2000);
    };
    
    const stopUpdates = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    // Iniciar atualizações automaticamente
    startUpdates();
    
    // Retorna objeto com controle
    return {
      stop: stopUpdates,
      restart: startUpdates
    };
  },
  
  // Verificar conexão
  testConnection: () => ipcRenderer.invoke("invoke", { channel: "test-connection" }),
  
  // Logger para depuração
  log: {
    info: (message, ...args) => console.log(`[Electron] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[Electron] ${message}`, ...args),
    error: (message, ...args) => console.error(`[Electron] ${message}`, ...args),
  }
});

// Para compatibilidade com código antigo que usa electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (data) => ipcRenderer.invoke("invoke", data),
  on: (channel, callback) => {
    if (validListenerChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  removeAllListeners: (channel) => {
    if (validListenerChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});