import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  HardDrive,
  Shield,
  Database,
  Clock,
  XCircle,
  Zap,
  Bell,
  BellOff,
  Pause,
  Play,
  Timer,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import CleanIcon from "../../../../resources/maxifylogo.png"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { cleanupIconMap, categoryIconMap } from "@/utils/cleanupIcons"

function Limpeza() {
  const [cleanups, setCleanups] = useState([])
  const [categories, setCategories] = useState([])
  const [AUTO_CLEAN_CONFIG, setAutoCleanConfigData] = useState(null)
  const [INTERVAL_OPTIONS, setIntervalOptions] = useState([])

  const [selecionados, setSelecionados] = useState([])
  const [filaCarregando, setFilaCarregando] = useState([])
  const [ultimaLimpeza, setUltimaLimpeza] = useState(localStorage.getItem("ultima-limpeza") || "Ainda não limpo.")
  const [estaLimpando, setEstaLimpando] = useState(false)
  const [resultados, setResultados] = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [historicoLimpezas, setHistoricoLimpezas] = useState([])

  const [autoCleanEnabled, setAutoCleanEnabled] = useState(false)
  const [autoCleanSelections, setAutoCleanSelections] = useState([])
  const [autoCleanInterval, setAutoCleanInterval] = useState(60 * 60 * 1000)
  const [nextAutoClean, setNextAutoClean] = useState(null)
  const [autoCleanHistory, setAutoCleanHistory] = useState([])
  const [autoCleanRunning, setAutoCleanRunning] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const autoCleanTimeoutRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const autoCleanRunningRef = useRef(false)
  const estaLimpandoRef = useRef(false)

  const [estatisticas, setEstatisticas] = useState({
    totalLiberado: 0,
    totalExecucoes: 0,
    limpezasHoje: 0,
    autoCleansExecuted: 0,
    totalAutoCleanSpace: 0,
  })

  const [performanceData, setPerformanceData] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    async function loadModule() {
      const mod = await import("@/data/cleanups")
      setCleanups(mod.cleanups || [])
      setCategories(mod.categories || [])
      setAutoCleanConfigData(mod.AUTO_CLEAN_CONFIG || null)
      setIntervalOptions(mod.INTERVAL_OPTIONS || [])
    }

    loadModule()
  }, [])

  useEffect(() => {
    if (!AUTO_CLEAN_CONFIG) return

    const historico = JSON.parse(localStorage.getItem("maxify:historico-limpezas") || "[]")
    setHistoricoLimpezas(historico)

    const stats = JSON.parse(localStorage.getItem("maxify:estatisticas-limpeza") || "{}")
    setEstatisticas({
      totalLiberado: stats.totalLiberado || 0,
      totalExecucoes: stats.totalExecucoes || 0,
      limpezasHoje: stats.limpezasHoje || 0,
      autoCleansExecuted: stats.autoCleansExecuted || 0,
      totalAutoCleanSpace: stats.totalAutoCleanSpace || 0,
    })

    const resultadosAnteriores = JSON.parse(localStorage.getItem("maxify:resultados-limpeza") || "{}")
    setResultados(resultadosAnteriores)

    const autoCleanConfig = JSON.parse(localStorage.getItem(AUTO_CLEAN_CONFIG.STORAGE_KEY) || "{}")
    const enabled = autoCleanConfig.enabled || false
    const selections = autoCleanConfig.selections || AUTO_CLEAN_CONFIG.DEFAULT_SELECTIONS || []
    const interval = autoCleanConfig.interval || AUTO_CLEAN_CONFIG.DEFAULT_INTERVAL_MS || 60 * 60 * 1000
    const notifications = autoCleanConfig.notifications !== false
    const lastRun = autoCleanConfig.lastRun || localStorage.getItem("maxify:auto-clean-last-run")

    setAutoCleanEnabled(enabled)
    setAutoCleanSelections(selections)
    setAutoCleanInterval(interval)
    setNotificationsEnabled(notifications)

    const autoHistory = JSON.parse(localStorage.getItem("maxify:auto-clean-history") || "[]")
    setAutoCleanHistory(autoHistory)

    if (enabled) {
      const baseTime = lastRun ? new Date(lastRun).getTime() : Date.now()
      setNextAutoClean(baseTime + interval)
    }

    setDataLoaded(true)
  }, [AUTO_CLEAN_CONFIG])

  useEffect(() => {
    autoCleanRunningRef.current = autoCleanRunning
  }, [autoCleanRunning])

  useEffect(() => {
    estaLimpandoRef.current = estaLimpando
  }, [estaLimpando])

  const formatarBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 B"
    const tamanhos = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${tamanhos[i]}`
  }

  const executarScriptComTimeout = async (script, timeout = 60000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout: A operação demorou muito tempo")), timeout)
    })

    const scriptPromise = invoke({
      channel: "run-powershell",
      payload: { script, name: `limpeza-${Date.now()}` },
    }).catch((err) => {
      console.error("Invoke error:", err)
      return null
    })

    return Promise.race([scriptPromise, timeoutPromise])
  }

  const saveAutoCleanConfig = useCallback((override = {}) => {
    if (!AUTO_CLEAN_CONFIG) return

    const config = {
      enabled: override.enabled ?? autoCleanEnabled,
      selections: override.selections ?? autoCleanSelections,
      interval: override.interval ?? autoCleanInterval,
      notifications: override.notifications ?? notificationsEnabled,
      lastRun:
        override.lastRun ??
        localStorage.getItem("maxify:auto-clean-last-run") ??
        null,
    }

    localStorage.setItem(AUTO_CLEAN_CONFIG.STORAGE_KEY, JSON.stringify(config))
  }, [
    AUTO_CLEAN_CONFIG,
    autoCleanEnabled,
    autoCleanSelections,
    autoCleanInterval,
    notificationsEnabled,
  ])

  const clearAutoCleanTimers = useCallback(() => {
    if (autoCleanTimeoutRef.current) {
      clearTimeout(autoCleanTimeoutRef.current)
      autoCleanTimeoutRef.current = null
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  const updateNextCleanTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    countdownTimerRef.current = setInterval(() => {
      setNextAutoClean((prev) => {
        if (!prev) return null
        return prev
      })
    }, 1000)
  }, [])

  const scheduleNextAutoClean = useCallback((baseTimestamp = Date.now()) => {
    clearAutoCleanTimers()

    if (!autoCleanEnabled || autoCleanInterval <= 0) {
      setNextAutoClean(null)
      return
    }

    const nextRun = baseTimestamp + autoCleanInterval
    const delay = Math.max(nextRun - Date.now(), 0)

    setNextAutoClean(nextRun)

    autoCleanTimeoutRef.current = setTimeout(async () => {
      await executeAutoClean()
    }, delay)

    updateNextCleanTimer()
  }, [autoCleanEnabled, autoCleanInterval, clearAutoCleanTimers, updateNextCleanTimer])

  const executeAutoClean = useCallback(async () => {
    if (autoCleanRunningRef.current || estaLimpandoRef.current || autoCleanSelections.length === 0) {
      return
    }

    autoCleanRunningRef.current = true
    setAutoCleanRunning(true)

    if (notificationsEnabled) {
      toast.info("Iniciando limpeza automática...", { autoClose: 2000 })
    }

    let totalLiberado = 0
    const startTime = Date.now()
    const novosResultados = {}

    for (const limpezaId of autoCleanSelections) {
      const limpeza = cleanups.find((l) => l.id === limpezaId)
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

        novosResultados[limpezaId] = espacoLiberado
      } catch (err) {
        novosResultados[limpezaId] = 0
        log.error(`Auto clean failed for ${limpezaId}: ${err.message}`)
      }
    }

    setResultados((prev) => {
      const merged = { ...prev, ...novosResultados }
      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(merged))
      return merged
    })

    const duration = Date.now() - startTime
    const nowIso = new Date().toISOString()

    const autoCleanRecord = {
      timestamp: nowIso,
      totalLiberado,
      duration,
      selections: autoCleanSelections.length,
    }

    setAutoCleanHistory((prev) => {
      const updatedHistory = [
        autoCleanRecord,
        ...prev.slice(0, (AUTO_CLEAN_CONFIG?.MAX_HISTORY_ITEMS || 50) - 1),
      ]
      localStorage.setItem("maxify:auto-clean-history", JSON.stringify(updatedHistory))
      return updatedHistory
    })

    setEstatisticas((prev) => {
      const newStats = {
        ...prev,
        autoCleansExecuted: (prev.autoCleansExecuted || 0) + 1,
        totalAutoCleanSpace: (prev.totalAutoCleanSpace || 0) + totalLiberado,
        totalLiberado: (prev.totalLiberado || 0) + totalLiberado,
        totalExecucoes: (prev.totalExecucoes || 0) + 1,
      }
      localStorage.setItem("maxify:estatisticas-limpeza", JSON.stringify(newStats))
      return newStats
    })

    localStorage.setItem("maxify:auto-clean-last-run", nowIso)
    saveAutoCleanConfig({ lastRun: nowIso })

    if (notificationsEnabled) {
      toast.success("Limpeza automática concluída!", { autoClose: 4000 })
    }

    log.info(`Auto clean completed: ${formatarBytes(totalLiberado)} freed in ${duration}ms`)

    autoCleanRunningRef.current = false
    setAutoCleanRunning(false)

    if (autoCleanEnabled) {
      scheduleNextAutoClean(new Date(nowIso).getTime())
    }
  }, [
    autoCleanSelections,
    cleanups,
    notificationsEnabled,
    AUTO_CLEAN_CONFIG,
    autoCleanEnabled,
    saveAutoCleanConfig,
    scheduleNextAutoClean,
  ])

  useEffect(() => {
    if (!AUTO_CLEAN_CONFIG || !dataLoaded) return

    saveAutoCleanConfig()
  }, [
    AUTO_CLEAN_CONFIG,
    dataLoaded,
    autoCleanEnabled,
    autoCleanSelections,
    autoCleanInterval,
    notificationsEnabled,
    saveAutoCleanConfig,
  ])

  useEffect(() => {
    if (!AUTO_CLEAN_CONFIG || !dataLoaded) return

    clearAutoCleanTimers()

    if (!autoCleanEnabled) {
      setNextAutoClean(null)
      return
    }

    const lastRun = localStorage.getItem("maxify:auto-clean-last-run")
    const baseTime = lastRun ? new Date(lastRun).getTime() : Date.now()
    scheduleNextAutoClean(baseTime)

    if (notificationsEnabled) {
      const intervalOption = INTERVAL_OPTIONS.find((opt) => opt.value === autoCleanInterval)
      toast.info(`Limpeza automática ativada! Executando a cada ${intervalOption?.label || "1 hora"}.`, {
        autoClose: 2500,
      })
    }

    return () => {
      clearAutoCleanTimers()
    }
  }, [
    autoCleanEnabled,
    autoCleanInterval,
    AUTO_CLEAN_CONFIG,
    dataLoaded,
    INTERVAL_OPTIONS,
    notificationsEnabled,
    clearAutoCleanTimers,
    scheduleNextAutoClean,
  ])

  useEffect(() => {
    let interval
    if (isCollecting && estaLimpando) {
      const collectPerformanceData = () => {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const espacoLiberado = Object.values(resultados).reduce((acc, curr) => acc + curr, 0)

        setPerformanceData((prev) => {
          const newData = [
            ...prev,
            {
              time: `${currentTime}s`,
              espaco: espacoLiberado / (1024 * 1024),
              operacoes: Object.keys(resultados).length,
              selecionados: selecionados.length,
            },
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

  const formatTimeUntilNextClean = () => {
    if (!nextAutoClean) return "—"

    const now = Date.now()
    const diff = nextAutoClean - now

    if (diff <= 0) return "Agora"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const alternarLimpeza = (id) => {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selecionarCategoria = (categoriaId) => {
    setCategoriaAtiva(categoriaId)
  }

  const getTextoStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "Executando..."
    if (resultado !== undefined) return resultado > 0 ? `${formatarBytes(resultado)} liberados` : "Concluído (0 B)"
    return "Pendente"
  }

  const getCorStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "text-blue-400"
    if (resultado !== undefined) return resultado > 0 ? "text-cyan-400" : "text-slate-400"
    return "text-slate-400"
  }

  async function executarLimpezas() {
    setEstaLimpando(true)
    setFilaCarregando([...selecionados])
    setPerformanceData([])
    startTimeRef.current = Date.now()
    setIsCollecting(true)

    let algumaSucesso = false
    let novosResultados = { ...resultados }
    let totalLiberadoNestaExecucao = 0
    const inicioLimpeza = new Date().toISOString()

    for (const limpeza of cleanups) {
      if (!selecionados.includes(limpeza.id)) continue

      const toastId = toast.loading(`Executando ${limpeza.label}...`)

      try {
        const result = await executarScriptComTimeout(limpeza.script, 60000)

        let espacoLiberado = 0
        if (result?.output) {
          const outputStr = result.output.toString().trim()
          const parsedSize = parseInt(outputStr)
          if (!isNaN(parsedSize)) espacoLiberado = parsedSize
        }

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
        novosResultados[limpeza.id] = 0

        toast.update(toastId, {
          render: `Falha em ${limpeza.label}: ${err.message || "Erro desconhecido"}`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        })

        log.error(`Falha ao executar ${limpeza.id}: ${err.message || err}`)
      } finally {
        setFilaCarregando((q) => q.filter((id) => id !== limpeza.id))
        setResultados({ ...novosResultados })
      }
    }

    if (algumaSucesso) {
      const agora = new Date().toLocaleString()
      setUltimaLimpeza(agora)
      localStorage.setItem("ultima-limpeza", agora)
      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))

      const novoHistorico = [
        {
          timestamp: inicioLimpeza,
          totalLiberado: totalLiberadoNestaExecucao,
          selecionados: selecionados.length,
        },
        ...historicoLimpezas.slice(0, 9),
      ]
      setHistoricoLimpezas(novoHistorico)
      localStorage.setItem("maxify:historico-limpezas", JSON.stringify(novoHistorico))

      const hoje = new Date().toDateString()
      const ultimaExecucao = historicoLimpezas[0]
        ? new Date(historicoLimpezas[0].timestamp).toDateString()
        : null

      const stats = {
        totalLiberado: (estatisticas.totalLiberado || 0) + totalLiberadoNestaExecucao,
        totalExecucoes: (estatisticas.totalExecucoes || 0) + 1,
        limpezasHoje: hoje === ultimaExecucao ? (estatisticas.limpezasHoje || 0) + 1 : 1,
        autoCleansExecuted: estatisticas.autoCleansExecuted || 0,
        totalAutoCleanSpace: estatisticas.totalAutoCleanSpace || 0,
      }

      setEstatisticas(stats)
      localStorage.setItem("maxify:estatisticas-limpeza", JSON.stringify(stats))

      toast.success(`Limpeza concluída! ${formatarBytes(totalLiberadoNestaExecucao)} liberados no total.`, {
        autoClose: 5000,
      })
    }

    setEstaLimpando(false)
    setIsCollecting(false)
    setDataLoaded(true)
  }

  const resetarLimpeza = (limpezaId) => {
    setResultados((prev) => {
      const novosResultados = { ...prev }
      delete novosResultados[limpezaId]
      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))
      return novosResultados
    })

    toast.info(`${cleanups.find((l) => l.id === limpezaId)?.label} resetado.`)
  }

  const selecionarTodosDaCategoria = () => {
    if (categoriaAtiva === "all") {
      setSelecionados(cleanups.map((limpeza) => limpeza.id))
    } else {
      const limpezasDaCategoria = cleanups
        .filter((limpeza) => limpeza.category === categoriaAtiva)
        .map((limpeza) => limpeza.id)
      setSelecionados(limpezasDaCategoria)
    }
  }

  const desmarcarTodos = () => {
    setSelecionados([])
  }

  const limpezasFiltradas = useMemo(() => {
    if (categoriaAtiva === "all") return cleanups
    return cleanups.filter((limpeza) => limpeza.category === categoriaAtiva)
  }, [categoriaAtiva, cleanups])

  const espacoTotalLiberado = useMemo(() => {
    return Object.values(resultados).reduce((acc, curr) => acc + curr, 0)
  }, [resultados])

  const totalHistoricoLiberado = useMemo(() => {
    return historicoLimpezas.reduce((acc, curr) => acc + curr.totalLiberado, 0)
  }, [historicoLimpezas])

  const dadosCategorias = useMemo(() => {
    return categories
      .map((cat) => {
        const limpezasCategoria = cleanups.filter((l) => l.category === cat.id)
        const espacoCategoria = limpezasCategoria.reduce(
          (acc, limpeza) => acc + (resultados[limpeza.id] || 0),
          0
        )

        return {
          name: cat.label,
          value: espacoCategoria / (1024 * 1024),
          categoria: cat.id,
        }
      })
      .filter((item) => item.value > 0)
  }, [categories, cleanups, resultados])

  const COLORS = ["#2563eb", "#3b82f6", "#0ea5e9", "#06b6d4", "#38bdf8", "#60a5fa", "#1d4ed8"]

  const topStats = [
    {
      title: "Espaço liberado",
      value: formatarBytes(espacoTotalLiberado),
      icon: <HardDrive size={18} />,
      color: "from-blue-500/20 to-cyan-500/10",
      text: "text-cyan-300",
    },
    {
      title: "Histórico total",
      value: formatarBytes(totalHistoricoLiberado),
      icon: <Database size={18} />,
      color: "from-blue-600/20 to-sky-500/10",
      text: "text-blue-300",
    },
    {
      title: "Execuções",
      value: estatisticas.totalExecucoes,
      icon: <Activity size={18} />,
      color: "from-sky-500/20 to-blue-500/10",
      text: "text-sky-300",
    },
    {
      title: "Última limpeza",
      value: ultimaLimpeza === "Ainda não limpo." ? "Nunca" : "Feita",
      icon: estaLimpando ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />,
      color: "from-cyan-500/20 to-blue-500/10",
      text: estaLimpando ? "text-blue-300" : "text-cyan-300",
    },
  ]

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-4">
                <Sparkles size={15} />
                Central de limpeza inteligente
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <Trash2 className="text-blue-400" size={30} />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                    Limpeza do sistema
                  </h1>
                  <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                    Gerencie limpezas manuais, acompanhe resultados em tempo real e deixe o modo automático cuidando do resto.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      {cleanups.length} rotinas disponíveis
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      {selecionados.length} selecionadas
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      Auto limpeza {autoCleanEnabled ? "ativa" : "desativada"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-full xl:min-w-[420px] xl:max-w-[460px]">
              {topStats.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border border-maxify-border bg-gradient-to-br ${item.color} p-4 backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${item.text}`}>{item.icon}</span>
                    <ChevronRight size={16} className="text-maxify-text-secondary opacity-60" />
                  </div>
                  <p className={`text-xl md:text-2xl font-bold ${item.text}`}>{item.value}</p>
                  <p className="text-sm text-maxify-text-secondary mt-1">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Desempenho da execução</h2>
                <p className="text-sm text-maxify-text-secondary">Veja o avanço do espaço liberado durante a limpeza</p>
              </div>

              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                {estaLimpando ? "Coletando dados..." : "Aguardando execução"}
              </div>
            </div>

            <div className="h-72">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="cleanArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(value) => [`${value} MB`, "Espaço liberado"]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e40af",
                        borderRadius: "14px",
                      }}
                    />
                    <Area type="monotone" dataKey="espaco" stroke="#3b82f6" fill="url(#cleanArea)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-maxify-border flex flex-col items-center justify-center text-center px-6">
                  <TrendingUp size={42} className="text-blue-400 opacity-70 mb-3" />
                  <p className="text-maxify-text font-medium">Nenhum gráfico ainda</p>
                  <p className="text-sm text-maxify-text-secondary mt-1">Quando executar uma limpeza, o progresso aparece aqui.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Categorias</h2>
                <p className="text-sm text-maxify-text-secondary">Distribuição do espaço</p>
              </div>
            </div>

            <div className="h-72">
              {dadosCategorias.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      outerRadius={82}
                      innerRadius={45}
                      dataKey="value"
                      labelLine={false}
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value.toFixed(2)} MB`, "Espaço liberado"]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e40af",
                        borderRadius: "14px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-maxify-border flex flex-col items-center justify-center text-center px-6">
                  <Database size={42} className="text-blue-400 opacity-70 mb-3" />
                  <p className="text-maxify-text font-medium">Sem dados ainda</p>
                  <p className="text-sm text-maxify-text-secondary mt-1">As categorias aparecem depois da primeira limpeza.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Shield className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Filtrar por categoria</h2>
                <p className="text-sm text-maxify-text-secondary">Escolha um grupo para focar só no que interessa</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={selecionarTodosDaCategoria} disabled={estaLimpando || autoCleanRunning} variant="outline" size="sm">
                Selecionar todos
              </Button>
              <Button onClick={desmarcarTodos} disabled={estaLimpando || autoCleanRunning} variant="outline" size="sm">
                Limpar seleção
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => selecionarCategoria(categoria.id)}
                disabled={estaLimpando || autoCleanRunning}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all border flex items-center gap-2 ${
                  categoriaAtiva === categoria.id
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "bg-maxify-border/20 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/35"
                } ${estaLimpando || autoCleanRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {categoryIconMap[categoria.icon]}
                {categoria.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <img src={CleanIcon} width={24} height={24} className="select-none" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-maxify-text">Rotinas de limpeza</h2>
                  <p className="text-sm text-maxify-text-secondary">
                    {limpezasFiltradas.length} disponíveis • {selecionados.length} selecionadas
                  </p>
                </div>
              </div>

              {(estaLimpando || autoCleanRunning) && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <RefreshCw className="animate-spin" size={16} />
                  <span className="text-sm font-medium">
                    {autoCleanRunning ? "Auto limpeza em execução" : "Executando limpeza"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {limpezasFiltradas.map((limpeza) => {
                const estaSelecionado = selecionados.includes(limpeza.id)
                const estaCarregando = filaCarregando.includes(limpeza.id)
                const resultado = resultados[limpeza.id]
                const isAutoSelected = autoCleanSelections.includes(limpeza.id)

                return (
                  <div
                    key={limpeza.id}
                    className={`relative rounded-2xl border p-4 transition-all ${
                      estaSelecionado
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-maxify-border bg-maxify-border/10 hover:border-blue-400/40"
                    } ${estaCarregando ? "opacity-80" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${
                            limpeza.warning ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {cleanupIconMap[limpeza.icon]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold text-maxify-text">
                              {limpeza.label}
                            </span>

                            {limpeza.warning && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-500/15 text-red-400">
                                Cuidado
                              </span>
                            )}

                            {isAutoSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] bg-cyan-500/15 text-cyan-300">
                                Auto
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-maxify-text-secondary mt-1 leading-relaxed">
                            {limpeza.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-medium ${getCorStatus(limpeza.id)}`}>
                              {getTextoStatus(limpeza.id)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {resultado !== undefined && (
                          <button
                            onClick={() => resetarLimpeza(limpeza.id)}
                            className="p-1.5 rounded-lg text-maxify-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Resetar"
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
                      <div className="absolute inset-0 rounded-2xl bg-maxify-card/75 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <RefreshCw className="animate-spin text-blue-400" size={16} />
                          <span className="text-sm font-medium text-blue-300">Executando...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle2 className="text-blue-400" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-maxify-text">Resumo rápido</h2>
                  <p className="text-sm text-maxify-text-secondary">Estado atual da limpeza</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Selecionados</p>
                  <p className="text-2xl font-bold text-blue-300 mt-1">{selecionados.length}</p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Liberado nesta base</p>
                  <p className="text-2xl font-bold text-cyan-300 mt-1">{formatarBytes(espacoTotalLiberado)}</p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Última limpeza</p>
                  <p className="text-sm font-medium text-maxify-text mt-1 break-words">{ultimaLimpeza}</p>
                </div>
              </div>

              {selecionados.length > 0 && (
                <Button
                  onClick={executarLimpezas}
                  disabled={estaLimpando || selecionados.length === 0 || autoCleanRunning}
                  size="lg"
                  variant="primary"
                  className="w-full mt-5 min-h-[52px] flex items-center justify-center gap-3 text-base font-semibold"
                >
                  {estaLimpando ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>Limpando...</span>
                    </>
                  ) : (
                    <>
                      <img src={CleanIcon} width={22} height={22} className="select-none filter brightness-0 invert" />
                      <span>Executar limpeza</span>
                    </>
                  )}
                </Button>
              )}
            </Card>

            {historicoLimpezas.length > 0 && (
              <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <Clock className="text-blue-400" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-maxify-text">Histórico</h2>
                    <p className="text-sm text-maxify-text-secondary">Últimas limpezas</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {historicoLimpezas.slice(0, 5).map((historico, index) => (
                    <div key={index} className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-maxify-text">{new Date(historico.timestamp).toLocaleString()}</p>
                          <p className="text-xs text-maxify-text-secondary mt-1">{historico.selecionados} operação(ões)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-cyan-300">{formatarBytes(historico.totalLiberado)}</p>
                          <p className="text-xs text-maxify-text-secondary">liberados</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl border ${autoCleanEnabled ? "bg-blue-500/10 border-blue-500/20" : "bg-maxify-border/10 border-maxify-border"}`}>
                <Zap className={autoCleanEnabled ? "text-blue-400" : "text-slate-400"} size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-maxify-text">Limpeza automática</h2>
                <p className="text-sm text-maxify-text-secondary">
                  Configure um intervalo e deixe o sistema limpar sozinho
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setNotificationsEnabled((prev) => !prev)}
                className={`p-3 rounded-2xl border transition-all ${
                  notificationsEnabled
                    ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                    : "bg-maxify-border/10 text-slate-400 border-maxify-border"
                }`}
                title={notificationsEnabled ? "Notificações ativas" : "Notificações desativadas"}
              >
                {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>

              <Button
                onClick={() => executeAutoClean()}
                variant="outline"
                className="min-w-[170px] flex items-center justify-center gap-3"
                disabled={autoCleanRunning || estaLimpando || autoCleanSelections.length === 0}
              >
                <RefreshCw size={18} />
                <span>Executar agora</span>
              </Button>

              <Button
                onClick={() => {
                  if (autoCleanRunning) {
                    toast.warning("Aguarde a limpeza automática atual terminar.")
                    return
                  }
                  setAutoCleanEnabled((prev) => !prev)
                }}
                variant={autoCleanEnabled ? "danger" : "primary"}
                className="min-w-[190px] flex items-center justify-center gap-3"
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
                    <span>Desativar auto</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Ativar auto</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
              <p className="text-sm text-maxify-text-secondary">Status</p>
              <p className={`text-lg font-bold mt-2 ${autoCleanEnabled ? "text-blue-300" : "text-slate-400"}`}>
                {autoCleanEnabled ? "Ativo" : "Inativo"}
              </p>
              {autoCleanEnabled && nextAutoClean && (
                <p className="text-sm text-maxify-text-secondary mt-2">
                  Próxima em <span className="text-cyan-300 font-semibold">{formatTimeUntilNextClean()}</span>
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
              <p className="text-sm text-maxify-text-secondary">Execuções automáticas</p>
              <p className="text-lg font-bold mt-2 text-blue-300">{estatisticas.autoCleansExecuted || 0}</p>
              <p className="text-sm text-maxify-text-secondary mt-2">
                Liberado: <span className="text-cyan-300 font-semibold">{formatarBytes(estatisticas.totalAutoCleanSpace || 0)}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
              <p className="text-sm text-maxify-text-secondary">Última automática</p>
              <p className="text-lg font-bold mt-2 text-blue-300">
                {autoCleanHistory[0]
                  ? new Date(autoCleanHistory[0].timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
              <p className="text-sm text-maxify-text-secondary mt-2">
                {autoCleanHistory[0] ? `${formatarBytes(autoCleanHistory[0].totalLiberado)} liberados` : "Sem execução"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-maxify-text mb-4">Intervalo da limpeza automática</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INTERVAL_OPTIONS.map((option) => {
                const ativo = autoCleanInterval === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (autoCleanRunning) {
                        toast.warning("Aguarde a limpeza automática atual terminar para alterar o intervalo.")
                        return
                      }
                      setAutoCleanInterval(option.value)
                    }}
                    disabled={autoCleanRunning}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                      ativo
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10"
                        : "border-maxify-border bg-maxify-border/10 text-maxify-text-secondary hover:border-blue-500/20"
                    } ${autoCleanRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Timer size={20} />
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-maxify-text mb-4">Limpezas permitidas no automático</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {cleanups
                .filter((limpeza) => limpeza.safeForAuto !== false)
                .map((limpeza) => (
                  <div
                    key={limpeza.id}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      autoCleanSelections.includes(limpeza.id)
                        ? "border-blue-500/30 bg-blue-500/10"
                        : "border-maxify-border bg-maxify-border/10 hover:border-blue-500/20"
                    } ${autoCleanRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => {
                      if (autoCleanRunning) return

                      const updated = autoCleanSelections.includes(limpeza.id)
                        ? autoCleanSelections.filter((id) => id !== limpeza.id)
                        : [...autoCleanSelections, limpeza.id]

                      setAutoCleanSelections(updated)
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {cleanupIconMap[limpeza.icon]}
                        <span className="text-sm font-medium text-maxify-text truncate">{limpeza.label}</span>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          autoCleanSelections.includes(limpeza.id) ? "bg-blue-400" : "bg-slate-500"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-maxify-text-secondary mt-2 line-clamp-2">{limpeza.description}</p>
                  </div>
                ))}
            </div>

            <p className="text-xs text-maxify-text-secondary mt-4 flex items-center gap-1.5">
              <AlertTriangle size={13} />
              Rotinas marcadas como perigosas ficam fora do automático.
            </p>
          </div>

          {autoCleanHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-maxify-text mb-4">Histórico automático</h3>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                {autoCleanHistory.slice(0, 5).map((record, index) => (
                  <div key={index} className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-maxify-text">{new Date(record.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-maxify-text-secondary mt-1">{record.selections} operação(ões)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-cyan-300">{formatarBytes(record.totalLiberado)}</p>
                        <p className="text-xs text-maxify-text-secondary">{Math.round(record.duration / 1000)}s</p>
                      </div>
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