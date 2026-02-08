import { useState, useEffect, useRef } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import { RefreshCw, Trash2, AlertTriangle, CheckCircle2, BarChart3, TrendingUp, HardDrive, Shield, Database, Clock, XCircle, Folder, Cpu, Globe, FileText, History, Wifi, Zap, Bell, BellOff, Pause, Play } from "lucide-react"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import CleanIcon from "../../../../resources/sparklelogo.png"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

// Configurações da limpeza automática
const AUTO_CLEAN_CONFIG = {
  INTERVAL_MS: 10 * 1000,
  DEFAULT_SELECTIONS: ["temp", "prefetch", "browser-cache", "logs"], // Limpezas padrão para auto
  MAX_HISTORY_ITEMS: 50,
  STORAGE_KEY: "sparkle:auto-clean-config"
}

const cleanups = [
  {
    id: "temp",
    label: "Arquivos Temporários",
    description: "Remove arquivos .tmp, cache do usuário e arquivos temporários do sistema.",
    script: `
      $tempPaths = @("$env:TEMP", "C:\\Windows\\Temp")
      $totalSize = 0
      foreach ($path in $tempPaths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
          foreach ($file in $files) {
            $totalSize += $file.Length
          }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
    icon: <Folder className="text-blue-500" size={20} />,
    category: "sistema",
    safeForAuto: true
  },
  {
    id: "prefetch",
    label: "Arquivos Prefetch",
    description: "Apaga arquivos de cache de inicialização do Windows.",
    script: `
      $path = "C:\\Windows\\Prefetch"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          $totalSize += $file.Length
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
    icon: <Cpu className="text-green-500" size={20} />,
    category: "desempenho",
    safeForAuto: true
  },
  {
    id: "recyclebin",
    label: "Lixeira",
    description: "Esvazia completamente a lixeira do sistema.",
    script: `
      $shell = New-Object -ComObject Shell.Application
      $recycleBin = $shell.NameSpace(0xa)
      $totalSize = 0
      if ($recycleBin.Items().Count -gt 0) {
        foreach ($item in $recycleBin.Items()) {
          $totalSize += $item.Size
        }
        $recycleBin.Items() | foreach { 
          Remove-Item $_.Path -Recurse -Force -ErrorAction SilentlyContinue 
        }
      }
      Write-Output $totalSize
    `,
    icon: <Trash2 className="text-red-500" size={20} />,
    category: "sistema",
    warning: true,
    safeForAuto: false
  },
  {
    id: "windows-update",
    label: "Cache Windows Update",
    description: "Limpa arquivos de atualização baixados e cache do Windows Update.",
    script: `
      $path = "C:\\Windows\\SoftwareDistribution\\Download"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          $totalSize += $file.Length
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
    icon: <RefreshCw className="text-purple-500" size={20} />,
    category: "atualizacao",
    safeForAuto: true
  },
  {
    id: "thumbnails",
    label: "Cache de Miniaturas",
    description: "Remove thumbnails em cache do Explorador de Arquivos.",
    script: `
      $path = "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Include "thumbcache_*.db" -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          $totalSize += $file.Length
        }
        Remove-Item -Path "$path\\thumbcache_*.db" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
    icon: <FileText className="text-orange-500" size={20} />,
    category: "sistema",
    safeForAuto: true
  },
  {
    id: "browser-cache",
    label: "Cache de Navegadores",
    description: "Limpa cache do Chrome, Edge e Firefox.",
    script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache",
        "$env:APPDATA\\Mozilla\\Firefox\\Profiles"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
          foreach ($file in $files) {
            $totalSize += $file.Length
          }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
    icon: <Globe className="text-cyan-500" size={20} />,
    category: "navegadores",
    safeForAuto: true
  },
  {
    id: "logs",
    label: "Arquivos de Log",
    description: "Remove logs antigos do sistema e aplicações.",
    script: `
      $paths = @("C:\\Windows\\Logs", "$env:LOCALAPPDATA\\Temp")
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-30)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Include "*.log", "*.dmp" -Recurse -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LastWriteTime -lt $cutoffDate }
          foreach ($file in $files) {
            $totalSize += $file.Length
          }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
    icon: <History className="text-gray-500" size={20} />,
    category: "sistema",
    safeForAuto: true
  },
  {
    id: "memory-dump",
    label: "Arquivos de Memory Dump",
    description: "Remove arquivos de despejo de memória antigos.",
    script: `
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-7)
      $files = Get-ChildItem -Path "C:\\Windows\\" -Include "*.dmp", "MEMORY.DMP" -ErrorAction SilentlyContinue |
               Where-Object { $_.LastWriteTime -lt $cutoffDate }
      foreach ($file in $files) {
        $totalSize += $file.Length
      }
      $files | Remove-Item -Force -ErrorAction SilentlyContinue
      Write-Output $totalSize
    `,
    icon: <Database className="text-red-500" size={20} />,
    category: "sistema",
    warning: true,
    safeForAuto: false
  },
  {
    id: "recent-files",
    label: "Arquivos Recentes",
    description: "Limpa histórico de arquivos recentes do Windows.",
    script: `
      $path = "$env:APPDATA\\Microsoft\\Windows\\Recent"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          $totalSize += $file.Length
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
    icon: <Clock className="text-yellow-500" size={20} />,
    category: "privacidade",
    safeForAuto: true
  },
  {
    id: "dns-cache",
    label: "Cache DNS",
    description: "Limpa cache DNS do sistema.",
    script: `ipconfig /flushdns; Write-Output "0"`,
    icon: <Wifi className="text-blue-500" size={20} />,
    category: "rede",
    safeForAuto: true
  }
]

const categories = [
  { id: "all", label: "Todos", icon: <RefreshCw size={16} /> },
  { id: "sistema", label: "Sistema", icon: <Cpu size={16} /> },
  { id: "desempenho", label: "Desempenho", icon: <TrendingUp size={16} /> },
  { id: "navegadores", label: "Navegadores", icon: <Globe size={16} /> },
  { id: "privacidade", label: "Privacidade", icon: <Shield size={16} /> },
  { id: "atualizacao", label: "Atualização", icon: <Database size={16} /> },
  { id: "rede", label: "Rede", icon: <Wifi size={16} /> }
]

function Limpeza() {
  const [selecionados, setSelecionados] = useState([])
  const [filaCarregando, setFilaCarregando] = useState([])
  const [ultimaLimpeza, setUltimaLimpeza] = useState(
    localStorage.getItem("ultima-limpeza") || "Ainda não limpo."
  )
  const [estaLimpando, setEstaLimpando] = useState(false)
  const [resultados, setResultados] = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [historicoLimpezas, setHistoricoLimpezas] = useState([])
  
  // Estados para limpeza automática
  const [autoCleanEnabled, setAutoCleanEnabled] = useState(false)
  const [autoCleanSelections, setAutoCleanSelections] = useState([])
  const [nextAutoClean, setNextAutoClean] = useState(null)
  const [autoCleanHistory, setAutoCleanHistory] = useState([])
  const [autoCleanRunning, setAutoCleanRunning] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  
  const autoCleanIntervalRef = useRef(null)
  const autoCleanTimerRef = useRef(null)
  
  const [estatisticas, setEstatisticas] = useState({
    totalLiberado: 0,
    totalExecucoes: 0,
    limpezasHoje: 0,
    autoCleansExecuted: 0,
    totalAutoCleanSpace: 0
  })

  // Dados para gráficos
  const [performanceData, setPerformanceData] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const startTimeRef = useRef(Date.now())

  // Carregar configurações ao inicializar
  useEffect(() => {
    // Carregar histórico
    const historico = JSON.parse(localStorage.getItem("sparkle:historico-limpezas") || "[]")
    setHistoricoLimpezas(historico)

    // Carregar estatísticas
    const stats = JSON.parse(localStorage.getItem("sparkle:estatisticas-limpeza") || "{}")
    setEstatisticas({
      totalLiberado: stats.totalLiberado || 0,
      totalExecucoes: stats.totalExecucoes || 0,
      limpezasHoje: stats.limpezasHoje || 0,
      autoCleansExecuted: stats.autoCleansExecuted || 0,
      totalAutoCleanSpace: stats.totalAutoCleanSpace || 0
    })

    // Carregar resultados anteriores
    const resultadosAnteriores = JSON.parse(localStorage.getItem("sparkle:resultados-limpeza") || "{}")
    setResultados(resultadosAnteriores)
    
    // Carregar configuração de limpeza automática
    const autoCleanConfig = JSON.parse(localStorage.getItem(AUTO_CLEAN_CONFIG.STORAGE_KEY) || "{}")
    setAutoCleanEnabled(autoCleanConfig.enabled || false)
    setAutoCleanSelections(autoCleanConfig.selections || AUTO_CLEAN_CONFIG.DEFAULT_SELECTIONS)
    setNotificationsEnabled(autoCleanConfig.notifications !== false)
    
    // Carregar histórico de auto limpeza
    const autoHistory = JSON.parse(localStorage.getItem("sparkle:auto-clean-history") || "[]")
    setAutoCleanHistory(autoHistory)
    
    // Calcular próxima limpeza automática
    if (autoCleanConfig.enabled && autoCleanConfig.lastRun) {
      const nextRun = new Date(autoCleanConfig.lastRun).getTime() + AUTO_CLEAN_CONFIG.INTERVAL_MS
      setNextAutoClean(nextRun)
    }
    
    setDataLoaded(true)
  }, [])

  // Iniciar/Parar limpeza automática
  useEffect(() => {
    if (autoCleanEnabled) {
      startAutoClean()
      saveAutoCleanConfig()
    } else {
      stopAutoClean()
      saveAutoCleanConfig()
    }
    
    return () => {
      stopAutoClean()
    }
  }, [autoCleanEnabled])

  // Atualizar timer da próxima limpeza
  useEffect(() => {
    if (autoCleanEnabled && nextAutoClean) {
      updateNextCleanTimer()
    }
    
    return () => {
      if (autoCleanTimerRef.current) {
        clearInterval(autoCleanTimerRef.current)
      }
    }
  }, [autoCleanEnabled, nextAutoClean])

  // Coletar dados de performance apenas durante a limpeza
  useEffect(() => {
    let interval
    if (isCollecting && estaLimpando) {
      const collectPerformanceData = () => {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const espacoLiberado = Object.values(resultados).reduce((acc, curr) => acc + curr, 0)

        setPerformanceData(prev => {
          const newData = [
            ...prev,
            {
              time: `${currentTime}s`,
              espaco: espacoLiberado / (1024 * 1024), // Converter para MB
              operacoes: Object.keys(resultados).length,
              selecionados: selecionados.length
            }
          ]
          return newData.slice(-15)
        })
      }

      interval = setInterval(collectPerformanceData, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCollecting, estaLimpando, resultados, selecionados])

  // Funções para limpeza automática
  const startAutoClean = () => {
    if (autoCleanIntervalRef.current) {
      clearInterval(autoCleanIntervalRef.current)
    }
    
    // Executar limpeza imediatamente ao ativar
    executeAutoClean()
    
    // Configurar intervalo para execução a cada 1 hora
    autoCleanIntervalRef.current = setInterval(() => {
      executeAutoClean()
    }, AUTO_CLEAN_CONFIG.INTERVAL_MS)
    
    // Salvar data da última execução
    const now = new Date().toISOString()
    localStorage.setItem("sparkle:auto-clean-last-run", now)
    
    if (notificationsEnabled) {
      toast.info("Limpeza automática ativada! Executando a cada 1 hora.", {
        autoClose: 3000
      })
    }
  }

  const stopAutoClean = () => {
    if (autoCleanIntervalRef.current) {
      clearInterval(autoCleanIntervalRef.current)
      autoCleanIntervalRef.current = null
    }
    
    if (autoCleanTimerRef.current) {
      clearInterval(autoCleanTimerRef.current)
      autoCleanTimerRef.current = null
    }
    
    setNextAutoClean(null)
    
    if (notificationsEnabled && autoCleanEnabled) {
      toast.info("Limpeza automática desativada.", {
        autoClose: 3000
      })
    }
  }

  const executeAutoClean = async () => {
    if (autoCleanRunning || estaLimpando || autoCleanSelections.length === 0) {
      return
    }
    
    setAutoCleanRunning(true)
    
    if (notificationsEnabled) {
      toast.info("Iniciando limpeza automática...", {
        autoClose: 2000
      })
    }
    
    // Executar limpezas selecionadas
    let totalLiberado = 0
    const startTime = Date.now()
    
    for (const limpezaId of autoCleanSelections) {
      const limpeza = cleanups.find(l => l.id === limpezaId)
      if (!limpeza) continue
      
      try {
        const result = await executarScriptComTimeout(limpeza.script, 30000)
        
        let espacoLiberado = 0
        if (result?.output) {
          const outputStr = result.output.toString().trim()
          const parsedSize = parseInt(outputStr)
          if (!isNaN(parsedSize)) {
            espacoLiberado = parsedSize
            totalLiberado += espacoLiberado
          }
        }
        
        // Atualizar resultados
        setResultados(prev => ({
          ...prev,
          [limpezaId]: espacoLiberado
        }))
        
      } catch (err) {
        log.error(`Auto clean failed for ${limpezaId}: ${err.message}`)
      }
    }
    
    // Atualizar estatísticas
    const duration = Date.now() - startTime
    const autoCleanRecord = {
      timestamp: new Date().toISOString(),
      totalLiberado,
      duration,
      selections: autoCleanSelections.length
    }
    
    // Atualizar histórico
    const updatedHistory = [autoCleanRecord, ...autoCleanHistory.slice(0, AUTO_CLEAN_CONFIG.MAX_HISTORY_ITEMS - 1)]
    setAutoCleanHistory(updatedHistory)
    localStorage.setItem("sparkle:auto-clean-history", JSON.stringify(updatedHistory))
    
    // Atualizar estatísticas gerais
    const newStats = {
      ...estatisticas,
      autoCleansExecuted: (estatisticas.autoCleansExecuted || 0) + 1,
      totalAutoCleanSpace: (estatisticas.totalAutoCleanSpace || 0) + totalLiberado,
      totalLiberado: (estatisticas.totalLiberado || 0) + totalLiberado,
      totalExecucoes: (estatisticas.totalExecucoes || 0) + 1
    }
    setEstatisticas(newStats)
    localStorage.setItem("sparkle:estatisticas-limpeza", JSON.stringify(newStats))
    
    // Salvar última execução
    const now = new Date().toISOString()
    localStorage.setItem("sparkle:auto-clean-last-run", now)
    
    // Calcular próxima execução
    const nextRun = new Date().getTime() + AUTO_CLEAN_CONFIG.INTERVAL_MS
    setNextAutoClean(nextRun)
    
    // Notificação de conclusão
    if (notificationsEnabled) {
      toast.success(`Limpeza automática concluída!`, {
        autoClose: 5000
      })
    }
    
    // Registrar no log do app
    log.info(`Auto clean completed: ${formatarBytes(totalLiberado)} freed in ${duration}ms`)
    
    setAutoCleanRunning(false)
  }

  const updateNextCleanTimer = () => {
    if (autoCleanTimerRef.current) {
      clearInterval(autoCleanTimerRef.current)
    }
    
    autoCleanTimerRef.current = setInterval(() => {
      const now = Date.now()
      if (nextAutoClean && now >= nextAutoClean) {
        executeAutoClean()
      }
    }, 1000) // Verificar a cada segundo
  }

  const saveAutoCleanConfig = () => {
    const config = {
      enabled: autoCleanEnabled,
      selections: autoCleanSelections,
      notifications: notificationsEnabled,
      lastRun: localStorage.getItem("sparkle:auto-clean-last-run")
    }
    localStorage.setItem(AUTO_CLEAN_CONFIG.STORAGE_KEY, JSON.stringify(config))
  }

  const toggleAutoClean = () => {
    if (autoCleanRunning) {
      toast.warning("Aguarde a limpeza automática atual terminar.")
      return
    }
    
    setAutoCleanEnabled(!autoCleanEnabled)
  }

  const toggleAutoCleanSelection = (limpezaId) => {
    if (autoCleanRunning) return
    
    setAutoCleanSelections(prev => {
      if (prev.includes(limpezaId)) {
        return prev.filter(id => id !== limpezaId)
      } else {
        return [...prev, limpezaId]
      }
    })
  }

  const formatTimeUntilNextClean = () => {
    if (!nextAutoClean) return "—"
    
    const now = Date.now()
    const diff = nextAutoClean - now
    
    if (diff <= 0) return "Agora"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const alternarLimpeza = (id) => {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const formatarBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 B"
    const tamanhos = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${tamanhos[i]}`
  }

  const selecionarCategoria = (categoriaId) => {
    setCategoriaAtiva(categoriaId)
  }

  // Função com timeout para evitar carregamento infinito
  const executarScriptComTimeout = async (script, timeout = 60000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout: A operação demorou muito tempo")), timeout)
    })

    const scriptPromise = invoke({
      channel: "run-powershell",
      payload: { script, name: `limpeza-${Date.now()}` },
    })

    return Promise.race([scriptPromise, timeoutPromise])
  }

  // Obter texto do status
  const getTextoStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) {
      return "Executando..."
    } else if (resultado !== undefined) {
      if (resultado > 0) {
        return `${formatarBytes(resultado)} liberados`
      } else {
        return "Concluído (0 B)"
      }
    } else {
      return "Pendente"
    }
  }

  // Obter cor do status
  const getCorStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) {
      return "text-blue-500"
    } else if (resultado !== undefined) {
      return resultado > 0 ? "text-green-500" : "text-gray-500"
    } else {
      return "text-gray-500"
    }
  }

  async function executarLimpezas() {
    setEstaLimpando(true)
    setFilaCarregando([...selecionados])
    setPerformanceData([])
    startTimeRef.current = Date.now()
    setIsCollecting(true)

    let algumaSucesso = false
    let novosResultados = { ...resultados } // Começa com resultados existentes
    let totalLiberadoNestaExecucao = 0

    const inicioLimpeza = new Date().toISOString()

    for (const limpeza of cleanups) {
      if (!selecionados.includes(limpeza.id)) continue

      const toastId = toast.loading(`Executando ${limpeza.label}...`)

      try {
        console.log(`Iniciando limpeza: ${limpeza.label}`)

        const result = await executarScriptComTimeout(limpeza.script, 60000)

        console.log(`Limpeza ${limpeza.label} concluída:`, result)

        // Extrair o tamanho real dos arquivos limpos
        let espacoLiberado = 0
        if (result?.output) {
          const outputStr = result.output.toString().trim()
          // Tentar parsear como número (bytes)
          const parsedSize = parseInt(outputStr)
          if (!isNaN(parsedSize)) {
            espacoLiberado = parsedSize
          }
        }

        // Atualiza o resultado (sobrescreve se já existir)
        novosResultados[limpeza.id] = espacoLiberado
        totalLiberadoNestaExecucao += espacoLiberado

        toast.update(toastId, {
          render: `${limpeza.label} concluído! ${formatarBytes(espacoLiberado)} liberados.`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
        algumaSucesso = true

      } catch (err) {
        console.error(`Erro na limpeza ${limpeza.label}:`, err)

        // Em caso de erro, definir como 0 bytes
        novosResultados[limpeza.id] = 0

        toast.update(toastId, {
          render: `Falha em ${limpeza.label}: ${err.message || 'Erro desconhecido'}`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        })
        log.error(`Falha ao executar ${limpeza.id}: ${err.message || err}`)
      } finally {
        // Remove da fila de carregando
        setFilaCarregando((q) => q.filter(id => id !== limpeza.id))

        // Atualiza os resultados imediatamente após cada limpeza
        setResultados({ ...novosResultados })
      }
    }

    if (algumaSucesso) {
      const agora = new Date().toLocaleString()
      setUltimaLimpeza(agora)
      localStorage.setItem("ultima-limpeza", agora)

      // Salvar resultados no localStorage
      localStorage.setItem("sparkle:resultados-limpeza", JSON.stringify(novosResultados))

      // Atualizar histórico apenas se houve alguma execução bem-sucedida
      const novoHistorico = [
        {
          timestamp: inicioLimpeza,
          totalLiberado: totalLiberadoNestaExecucao,
          selecionados: selecionados.length
        },
        ...historicoLimpezas.slice(0, 9)
      ]
      setHistoricoLimpezas(novoHistorico)
      localStorage.setItem("sparkle:historico-limpezas", JSON.stringify(novoHistorico))

      // Atualizar estatísticas
      const hoje = new Date().toDateString()
      const ultimaExecucao = historicoLimpezas[0] ? new Date(historicoLimpezas[0].timestamp).toDateString() : null

      const stats = {
        totalLiberado: (estatisticas.totalLiberado || 0) + totalLiberadoNestaExecucao,
        totalExecucoes: (estatisticas.totalExecucoes || 0) + 1,
        limpezasHoje: hoje === ultimaExecucao ? (estatisticas.limpezasHoje || 0) + 1 : 1,
        autoCleansExecuted: estatisticas.autoCleansExecuted || 0,
        totalAutoCleanSpace: estatisticas.totalAutoCleanSpace || 0
      }
      setEstatisticas(stats)
      localStorage.setItem("sparkle:estatisticas-limpeza", JSON.stringify(stats))

      toast.success(`Limpeza concluída! ${formatarBytes(totalLiberadoNestaExecucao)} liberados no total.`, {
        autoClose: 5000,
      })
    }

    setEstaLimpando(false)
    setIsCollecting(false)
    setDataLoaded(true)
  }

  // Função para resetar uma limpeza específica
  const resetarLimpeza = (limpezaId) => {
    setResultados(prev => {
      const novosResultados = { ...prev }
      delete novosResultados[limpezaId]
      localStorage.setItem("sparkle:resultados-limpeza", JSON.stringify(novosResultados))
      return novosResultados
    })

    toast.info(`${cleanups.find(l => l.id === limpezaId)?.label} resetado. Pode executar novamente.`)
  }

  // Função para selecionar todos de uma categoria
  const selecionarTodosDaCategoria = () => {
    if (categoriaAtiva === "all") {
      setSelecionados(cleanups.map(limpeza => limpeza.id))
    } else {
      const limpezasDaCategoria = cleanups
        .filter(limpeza => limpeza.category === categoriaAtiva)
        .map(limpeza => limpeza.id)
      setSelecionados(limpezasDaCategoria)
    }
  }

  // Função para desmarcar todos
  const desmarcarTodos = () => {
    setSelecionados([])
  }

  const limpezasFiltradas = categoriaAtiva === "all"
    ? cleanups
    : cleanups.filter(limpeza => limpeza.category === categoriaAtiva)

  const espacoTotalLiberado = Object.values(resultados).reduce((acc, curr) => acc + curr, 0)
  const totalHistoricoLiberado = historicoLimpezas.reduce((acc, curr) => acc + curr.totalLiberado, 0)

  // Dados para gráficos
  const dadosCategorias = categories.map(cat => {
    const limpezasCategoria = cleanups.filter(l => l.category === cat.id)
    const espacoCategoria = limpezasCategoria.reduce((acc, limpeza) => {
      return acc + (resultados[limpeza.id] || 0)
    }, 0)

    return {
      name: cat.label,
      value: espacoCategoria / (1024 * 1024), // MB
      categoria: cat.id
    }
  }).filter(item => item.value > 0)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

  return (
    <RootDiv>
      <div className="max-w-[2000px] mx-auto px-6 pb-16">
        {/* === HEADER COM ESTATÍSTICAS === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-transparent"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <Trash2 className="text-teal-500" size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-sparkle-text mb-1">Limpeza do Sistema</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  Mantenha seu sistema otimizado e libere espaço em disco
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Espaço Liberado",
                  value: formatarBytes(espacoTotalLiberado),
                  color: "text-teal-500",
                  icon: <HardDrive className="inline mr-1" size={16} />
                },
                {
                  label: "Total Histórico",
                  value: formatarBytes(totalHistoricoLiberado),
                  color: "text-blue-500",
                  icon: <Database className="inline mr-1" size={16} />
                },
                {
                  label: "Execuções",
                  value: estatisticas.totalExecucoes,
                  color: "text-purple-500",
                  icon: <Clock className="inline mr-1" size={16} />
                },
                {
                  label: "Status",
                  value: estaLimpando ? "Limpando..." : "Pronto",
                  color: estaLimpando ? "text-yellow-500" : "text-green-500",
                  icon: estaLimpando ? <RefreshCw className="inline mr-1 animate-spin" size={16} /> : <CheckCircle2 className="inline mr-1" size={16} />
                },
              ].map((stat, index) => (
                <div key={index} className="bg-sparkle-border/20 p-4 rounded-xl text-center">
                  <p className={`text-2xl font-bold ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                    {stat.value}
                  </p>
                  <p className="text-sm text-sparkle-text-secondary mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>


        {/* === GRÁFICOS DE PERFORMANCE === */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Espaço Liberado */}
          <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Progresso da Limpeza</h2>
                <p className="text-sparkle-text-secondary text-sm">Espaço liberado durante a execução</p>
              </div>
            </div>

            <div className="w-full h-64">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorEspaco" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(value) => [`${value} MB`, "Espaço Liberado"]}
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="espaco"
                      stroke="#3b82f6"
                      fill="url(#colorEspaco)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-sparkle-text-secondary">
                  <TrendingUp size={48} className="opacity-50" />
                  <p>Execute uma limpeza para ver o progresso</p>
                </div>
              )}
            </div>
          </Card>

          {/* Gráfico de Distribuição por Categoria */}
          <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <BarChart3 className="text-green-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Distribuição por Categoria</h2>
                <p className="text-sparkle-text-secondary text-sm">Espaço liberado por tipo de limpeza</p>
              </div>
            </div>

            <div className="w-full h-64">
              {dadosCategorias.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}MB`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value.toFixed(2)} MB`, "Espaço Liberado"]}
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-sparkle-text-secondary">
                  <BarChart3 size={48} className="opacity-50" />
                  <p>Execute uma limpeza para ver as estatísticas</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* === FILTROS POR CATEGORIA === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Shield className="text-purple-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Categorias de Limpeza</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  Filtre as opções por categoria
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={selecionarTodosDaCategoria}
                disabled={estaLimpando || autoCleanRunning}
                variant="outline"
                size="sm"
              >
                Selecionar Todos
              </Button>
              <Button
                onClick={desmarcarTodos}
                disabled={estaLimpando || autoCleanRunning}
                variant="outline"
                size="sm"
              >
                Desmarcar Todos
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => selecionarCategoria(categoria.id)}
                disabled={estaLimpando || autoCleanRunning}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${categoriaAtiva === categoria.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-sparkle-border/40 text-sparkle-text-secondary hover:bg-sparkle-border/60'
                  } ${estaLimpando || autoCleanRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {categoria.icon}
                {categoria.label}
              </button>
            ))}
          </div>
        </Card>

        {/* === LISTA DE LIMPEZAS === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <img
                  src={CleanIcon}
                  width={24}
                  height={24}
                  className="select-none"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Opções de Limpeza</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  {limpezasFiltradas.length} opção(ões) disponível(eis) - {selecionados.length} selecionado(s)
                </p>
              </div>
            </div>
            {(estaLimpando || autoCleanRunning) && (
              <div className="flex items-center gap-2 text-yellow-500">
                <RefreshCw className="animate-spin" size={18} />
                <span className="text-sm font-medium">
                  {autoCleanRunning ? "Auto-Limpando..." : "Limpando..."}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limpezasFiltradas.map((limpeza) => {
              const estaSelecionado = selecionados.includes(limpeza.id)
              const estaCarregando = filaCarregando.includes(limpeza.id)
              const resultado = resultados[limpeza.id]
              const isAutoSelected = autoCleanSelections.includes(limpeza.id)

              return (
                <div
                  key={limpeza.id}
                  className={`relative border-2 rounded-xl p-4 transition-all duration-200 ${estaSelecionado
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-sparkle-border hover:border-sparkle-border-secondary'
                    } ${estaCarregando ? 'animate-pulse bg-blue-500/10' : ''} ${isAutoSelected ? 'ring-1 ring-green-500 ring-opacity-50' : ''}`}
                >
                  {isAutoSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={10} />
                        <span>Auto</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg mt-1 ${limpeza.warning ? 'bg-red-500/10' : 'bg-blue-500/10'
                        }`}>
                        {limpeza.icon}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-sparkle-text truncate">
                            {limpeza.label}
                          </span>
                          {limpeza.warning && (
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded-full font-medium">
                              Perigoso
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-sparkle-text-secondary mt-1">
                          {limpeza.description}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${getCorStatus(limpeza.id)}`}>
                            {getTextoStatus(limpeza.id)}
                          </span>
                          {isAutoSelected && (
                            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                              Automático
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      {resultado !== undefined && (
                        <button
                          onClick={() => resetarLimpeza(limpeza.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Resetar limpeza"
                          disabled={autoCleanRunning}
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <Toggle
                        checked={estaSelecionado}
                        onChange={() => alternarLimpeza(limpeza.id)}
                        disabled={estaLimpando || estaCarregando || autoCleanRunning}
                      />
                    </div>
                  </div>

                  {estaCarregando && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-sparkle-card/80 backdrop-blur-sm">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <RefreshCw className="animate-spin text-blue-500" size={18} />
                        <span className="text-sm font-medium text-blue-500">Executando...</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* === BOTÃO DE AÇÃO === */}
        {selecionados.length > 0 && (
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/20 rounded-xl">
                  <CheckCircle2 className="text-teal-500" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Pronto para Limpar</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    {selecionados.length} item(s) selecionado(s)
                  </p>
                </div>
              </div>

              <Button
                onClick={executarLimpezas}
                disabled={estaLimpando || selecionados.length === 0 || autoCleanRunning}
                size="lg"
                variant="primary"
                className="min-w-[200px] flex items-center justify-center gap-3 text-base font-semibold"
              >
                {estaLimpando ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Limpando...</span>
                  </>
                ) : (
                  <>
                    <img
                      src={CleanIcon}
                      width={24}
                      height={24}
                      className="select-none filter brightness-0 invert"
                    />
                    <span>Executar Limpeza</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* === HISTÓRICO DE LIMPEZAS === */}
        {historicoLimpezas.length > 0 && (
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Clock className="text-purple-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Histórico de Limpezas</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  Últimas execuções de limpeza
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {historicoLimpezas.slice(0, 5).map((historico, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sparkle-border/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-sparkle-text">
                        {new Date(historico.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-sparkle-text-secondary">
                        {historico.selecionados} operação(ões) executada(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-500">
                      {formatarBytes(historico.totalLiberado)}
                    </p>
                    <p className="text-xs text-sparkle-text-secondary">liberados</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* === LIMPEZA AUTOMÁTICA === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${autoCleanEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                <Zap className={autoCleanEnabled ? 'text-green-500' : 'text-gray-500'} size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-sparkle-text mb-1">Limpeza Automática</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  Limpa automaticamente a cada 1 hora (app aberto ou em segundo plano)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled)
                  saveAutoCleanConfig()
                }}
                className={`p-2 rounded-lg ${notificationsEnabled ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}`}
                title={notificationsEnabled ? "Notificações ativas" : "Notificações desativadas"}
              >
                {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
              
              <Button
                onClick={toggleAutoClean}
                variant={autoCleanEnabled ? "danger" : "primary"}
                className="min-w-[180px] flex items-center justify-center gap-3"
                disabled={autoCleanRunning}
              >
                {autoCleanRunning ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Executando...</span>
                  </>
                ) : autoCleanEnabled ? (
                  <>
                    <Pause size={20} />
                    <span>Desativar Auto</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Ativar Auto</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Status da Limpeza Automática */}
            <div className="bg-sparkle-border/20 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sparkle-text-secondary">Status</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${autoCleanEnabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {autoCleanEnabled ? 'ATIVO' : 'INATIVO'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className={autoCleanEnabled ? 'text-green-500' : 'text-gray-500'} />
                <span className="text-lg font-bold text-sparkle-text">
                  {autoCleanEnabled ? 'Monitorando sistema' : 'Desativado'}
                </span>
              </div>
              {autoCleanEnabled && nextAutoClean && (
                <p className="text-sm text-sparkle-text-secondary mt-2">
                  Próxima limpeza em: <span className="font-bold text-blue-500">{formatTimeUntilNextClean()}</span>
                </p>
              )}
            </div>

            {/* Estatísticas Auto */}
            <div className="bg-sparkle-border/20 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sparkle-text-secondary">Execuções Automáticas</span>
                <RefreshCw size={16} className="text-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-sparkle-text">
                  {estatisticas.autoCleansExecuted || 0}
                </span>
              </div>
              <p className="text-sm text-sparkle-text-secondary mt-2">
                Total liberado: <span className="font-bold text-green-500">
                  {formatarBytes(estatisticas.totalAutoCleanSpace || 0)}
                </span>
              </p>
            </div>

            {/* Última Execução */}
            <div className="bg-sparkle-border/20 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sparkle-text-secondary">Última Execução</span>
                <Clock size={16} className="text-purple-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-sparkle-text">
                  {autoCleanHistory[0] ? new Date(autoCleanHistory[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                </span>
              </div>
              <p className="text-sm text-sparkle-text-secondary mt-2">
                {autoCleanHistory[0] ? `${formatarBytes(autoCleanHistory[0].totalLiberado)} liberados` : 'Nenhuma execução'}
              </p>
            </div>
          </div>

          {/* Seleção de Limpezas Automáticas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-sparkle-text mb-4">Selecionar Limpezas Automáticas</h3>
            <p className="text-sparkle-text-secondary text-sm mb-3">
              Selecione quais limpezas serão executadas automaticamente a cada 1 hora:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cleanups
                .filter(limpeza => limpeza.safeForAuto !== false)
                .map(limpeza => (
                  <div
                    key={limpeza.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${autoCleanSelections.includes(limpeza.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-sparkle-border hover:border-sparkle-border-secondary'
                    } ${autoCleanRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!autoCleanRunning) {
                        toggleAutoCleanSelection(limpeza.id)
                        saveAutoCleanConfig()
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {limpeza.icon}
                        <span className="text-sm font-medium text-sparkle-text">{limpeza.label}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${autoCleanSelections.includes(limpeza.id) ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    </div>
                    <p className="text-xs text-sparkle-text-secondary mt-1 truncate">
                      {limpeza.description}
                    </p>
                  </div>
                ))}
            </div>
            <p className="text-xs text-sparkle-text-secondary mt-3">
              <AlertTriangle className="inline mr-1" size={12} />
              Limpezas marcadas como "Perigosas" não estão disponíveis para auto-limpeza por segurança.
            </p>
          </div>

          {/* Histórico de Limpezas Automáticas */}
          {autoCleanHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-sparkle-text mb-4">Histórico Automático</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {autoCleanHistory.slice(0, 5).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-sparkle-border/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-sparkle-text">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-sparkle-text-secondary">
                          {record.selections} operação(ões)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-500">
                        {formatarBytes(record.totalLiberado)}
                      </p>
                      <p className="text-xs text-sparkle-text-secondary">
                        {Math.round(record.duration / 1000)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </RootDiv>
  )
}

export default Limpeza