import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
    RefreshCw,
    Zap,
    Bell,
    BellOff,
    Pause,
    Play,
    Timer,
    Sparkles,
    AlertTriangle,
    Clock,
    Database,
    Activity,
    CheckCircle2,
} from "lucide-react"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { cleanupIconMap } from "@/utils/cleanupIcons"

function AutoClean() {
    const [cleanups, setCleanups] = useState([])
    const [AUTO_CLEAN_CONFIG, setAutoCleanConfigData] = useState(null)
    const [INTERVAL_OPTIONS, setIntervalOptions] = useState([])

    const [dataLoaded, setDataLoaded] = useState(false)
    const [autoCleanEnabled, setAutoCleanEnabled] = useState(false)
    const [autoCleanSelections, setAutoCleanSelections] = useState([])
    const [autoCleanInterval, setAutoCleanInterval] = useState(60 * 60 * 1000)
    const [nextAutoClean, setNextAutoClean] = useState(null)
    const [autoCleanHistory, setAutoCleanHistory] = useState([])
    const [autoCleanRunning, setAutoCleanRunning] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    const timerRef = useRef(null)
    const countdownRef = useRef(null)
    const autoCleanRunningRef = useRef(false)

    const [estatisticas, setEstatisticas] = useState({
        autoCleansExecuted: 0,
        totalAutoCleanSpace: 0,
        totalLiberado: 0,
        totalExecucoes: 0,
    })

    useEffect(() => {
        async function loadModule() {
            const mod = await import("@/data/cleanups")

            setCleanups(mod.cleanups || [])
            setAutoCleanConfigData(mod.AUTO_CLEAN_CONFIG || null)
            setIntervalOptions(mod.INTERVAL_OPTIONS || [])
        }

        loadModule()
    }, [])

    useEffect(() => {
        if (!AUTO_CLEAN_CONFIG) return

        const stats = JSON.parse(localStorage.getItem("maxify:estatisticas-limpeza") || "{}")

        setEstatisticas({
            autoCleansExecuted: stats.autoCleansExecuted || 0,
            totalAutoCleanSpace: stats.totalAutoCleanSpace || 0,
            totalLiberado: stats.totalLiberado || 0,
            totalExecucoes: stats.totalExecucoes || 0,
        })

        const config = JSON.parse(localStorage.getItem(AUTO_CLEAN_CONFIG.STORAGE_KEY) || "{}")

        setAutoCleanEnabled(config.enabled || false)
        setAutoCleanSelections(config.selections || AUTO_CLEAN_CONFIG.DEFAULT_SELECTIONS || [])
        setAutoCleanInterval(config.interval || AUTO_CLEAN_CONFIG.DEFAULT_INTERVAL_MS || 60 * 60 * 1000)
        setNotificationsEnabled(config.notifications !== false)

        const history = JSON.parse(localStorage.getItem("maxify:auto-clean-history") || "[]")
        setAutoCleanHistory(history)

        setDataLoaded(true)
    }, [AUTO_CLEAN_CONFIG])

    useEffect(() => {
        autoCleanRunningRef.current = autoCleanRunning
    }, [autoCleanRunning])

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
            payload: {
                script,
                name: `auto-limpeza-${Date.now()}`,
            },
        }).catch((err) => {
            console.error("Invoke error:", err)
            return null
        })

        return Promise.race([scriptPromise, timeoutPromise])
    }

    const salvarConfig = useCallback(
        (override = {}) => {
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
        },
        [
            AUTO_CLEAN_CONFIG,
            autoCleanEnabled,
            autoCleanSelections,
            autoCleanInterval,
            notificationsEnabled,
        ]
    )

    useEffect(() => {
        if (!AUTO_CLEAN_CONFIG || !dataLoaded) return

        salvarConfig()
    }, [
        AUTO_CLEAN_CONFIG,
        dataLoaded,
        autoCleanEnabled,
        autoCleanSelections,
        autoCleanInterval,
        notificationsEnabled,
        salvarConfig,
    ])

    const executeAutoClean = useCallback(async () => {
        if (autoCleanRunningRef.current || autoCleanSelections.length === 0) return

        autoCleanRunningRef.current = true
        setAutoCleanRunning(true)

        if (notificationsEnabled) {
            toast.info("Iniciando limpeza automática...", {
                autoClose: 2000,
            })
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

        const resultadosAntigos = JSON.parse(localStorage.getItem("maxify:resultados-limpeza") || "{}")
        const resultadosAtualizados = {
            ...resultadosAntigos,
            ...novosResultados,
        }

        localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(resultadosAtualizados))

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
        salvarConfig({ lastRun: nowIso })

        if (notificationsEnabled) {
            toast.success(`Limpeza automática concluída! ${formatarBytes(totalLiberado)} liberados.`, {
                autoClose: 4000,
            })
        }

        log.info(`Auto clean completed: ${formatarBytes(totalLiberado)} freed in ${duration}ms`)

        autoCleanRunningRef.current = false
        setAutoCleanRunning(false)

        setNextAutoClean(Date.now() + autoCleanInterval)
    }, [
        autoCleanSelections,
        cleanups,
        notificationsEnabled,
        AUTO_CLEAN_CONFIG,
        salvarConfig,
        autoCleanInterval,
    ])

    useEffect(() => {
        if (!dataLoaded || !autoCleanEnabled) {
            setNextAutoClean(null)

            if (timerRef.current) clearTimeout(timerRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)

            return
        }

        const lastRun = localStorage.getItem("maxify:auto-clean-last-run")
        let baseTime = lastRun ? new Date(lastRun).getTime() : Date.now()
        let nextRun = baseTime + autoCleanInterval

        if (nextRun <= Date.now()) {
            nextRun = Date.now() + autoCleanInterval
        }

        setNextAutoClean(nextRun)

        const delay = Math.max(nextRun - Date.now(), 0)

        timerRef.current = setTimeout(() => {
            executeAutoClean()
        }, delay)

        countdownRef.current = setInterval(() => {
            setNextAutoClean((prev) => prev)
        }, 1000)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [dataLoaded, autoCleanEnabled, autoCleanInterval, executeAutoClean])

    const formatTimeUntilNextClean = () => {
        if (!nextAutoClean) return "—"

        const diff = nextAutoClean - Date.now()

        if (diff <= 0) return "Agora"

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        if (hours > 0) return `${hours}h ${minutes}m`
        if (minutes > 0) return `${minutes}m ${seconds}s`

        return `${seconds}s`
    }

    const safeCleanups = useMemo(() => {
        return cleanups.filter((limpeza) => limpeza.safeForAuto !== false)
    }, [cleanups])

    return (
        <RootDiv>
            <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
                <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />

                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-4">
                                <Sparkles size={15} />
                                Sistema automático
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                    <Zap className="text-blue-400" size={30} />
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                                        Limpeza automática
                                    </h1>

                                    <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                                        Configure um intervalo, escolha as limpezas permitidas e deixe o Maxify cuidar disso sozinho.
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-5">
                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            Status: {autoCleanEnabled ? "ativo" : "inativo"}
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            {autoCleanSelections.length} limpezas selecionadas
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            Próxima: {formatTimeUntilNextClean()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => setNotificationsEnabled((prev) => !prev)}
                                className={`p-3 rounded-2xl border transition-all ${notificationsEnabled
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
                                disabled={autoCleanRunning || autoCleanSelections.length === 0}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center gap-3">
                            <Activity className={autoCleanEnabled ? "text-blue-400" : "text-slate-400"} size={24} />
                            <div>
                                <p className="text-sm text-maxify-text-secondary">Status</p>
                                <p className={`text-xl font-bold ${autoCleanEnabled ? "text-blue-300" : "text-slate-400"}`}>
                                    {autoCleanEnabled ? "Ativo" : "Inativo"}
                                </p>
                            </div>
                        </div>

                        {autoCleanEnabled && (
                            <p className="text-sm text-maxify-text-secondary mt-4">
                                Próxima limpeza em{" "}
                                <span className="text-cyan-300 font-semibold">{formatTimeUntilNextClean()}</span>
                            </p>
                        )}
                    </Card>

                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-blue-400" size={24} />
                            <div>
                                <p className="text-sm text-maxify-text-secondary">Execuções automáticas</p>
                                <p className="text-xl font-bold text-blue-300">
                                    {estatisticas.autoCleansExecuted || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center gap-3">
                            <Database className="text-cyan-400" size={24} />
                            <div>
                                <p className="text-sm text-maxify-text-secondary">Liberado no automático</p>
                                <p className="text-xl font-bold text-cyan-300">
                                    {formatarBytes(estatisticas.totalAutoCleanSpace || 0)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
                    <h2 className="text-xl font-bold text-maxify-text mb-2">
                        Intervalo da limpeza automática
                    </h2>

                    <p className="text-sm text-maxify-text-secondary mb-5">
                        Escolha de quanto em quanto tempo o sistema deve executar.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {INTERVAL_OPTIONS.map((option) => {
                            const ativo = autoCleanInterval === option.value

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        if (autoCleanRunning) {
                                            toast.warning("Aguarde a limpeza atual terminar para alterar o intervalo.")
                                            return
                                        }

                                        setAutoCleanInterval(option.value)
                                    }}
                                    disabled={autoCleanRunning}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${ativo
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
                </Card>

                <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
                    <h2 className="text-xl font-bold text-maxify-text mb-2">
                        Limpezas permitidas no automático
                    </h2>

                    <p className="text-sm text-maxify-text-secondary mb-5">
                        Rotinas perigosas ficam fora do automático para evitar problemas.
                    </p>

                    <div className="max-h-[520px] overflow-y-auto pr-2 custom-clean-scroll">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {safeCleanups.map((limpeza) => {
                                const selecionada = autoCleanSelections.includes(limpeza.id)

                                return (
                                    <div
                                        key={limpeza.id}
                                        onClick={() => {
                                            if (autoCleanRunning) return

                                            const updated = selecionada
                                                ? autoCleanSelections.filter((id) => id !== limpeza.id)
                                                : [...autoCleanSelections, limpeza.id]

                                            setAutoCleanSelections(updated)
                                        }}
                                        className={`rounded-2xl border p-4 cursor-pointer transition-all ${selecionada
                                                ? "border-blue-500/30 bg-blue-500/10"
                                                : "border-maxify-border bg-maxify-border/10 hover:border-blue-500/20"
                                            } ${autoCleanRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-blue-400">{cleanupIconMap[limpeza.icon]}</span>
                                                <span className="text-sm font-medium text-maxify-text truncate">
                                                    {limpeza.label}
                                                </span>
                                            </div>

                                            <div
                                                className={`w-3 h-3 rounded-full ${selecionada ? "bg-blue-400" : "bg-slate-500"
                                                    }`}
                                            />
                                        </div>

                                        <p className="text-xs text-maxify-text-secondary mt-2 line-clamp-2">
                                            {limpeza.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <p className="text-xs text-maxify-text-secondary mt-4 flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        Só coloque no automático o que for seguro para rodar sozinho.
                    </p>
                </Card>

                {autoCleanHistory.length > 0 && (
                    <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <Clock className="text-blue-400" size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">Histórico automático</h2>
                                <p className="text-sm text-maxify-text-secondary">Últimas execuções feitas sozinhas</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {autoCleanHistory.slice(0, 8).map((record, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-maxify-text">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-maxify-text-secondary mt-1">
                                                {record.selections} operação(ões)
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-bold text-cyan-300">
                                                {formatarBytes(record.totalLiberado)}
                                            </p>
                                            <p className="text-xs text-maxify-text-secondary">
                                                {Math.round(record.duration / 1000)}s
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </RootDiv>
    )
}

export default AutoClean