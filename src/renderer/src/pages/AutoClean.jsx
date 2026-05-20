import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
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
    ChevronRight,
    ShieldCheck,
    Gauge,
    Layers3,
} from "lucide-react"
import { notify as toast } from "../lib/notify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { cleanupIconMap } from "@/utils/cleanupIcons"

const BackgroundGlow = () => {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
        </>
    )
}

const SectionTitle = ({ icon: Icon, label, title, description }) => {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <Icon className="h-5 w-5 text-blue-300" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                    {label}
                </p>
                <h2 className="text-lg font-black text-maxify-text">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-maxify-text-secondary">{description}</p>
                )}
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
        </div>
    )
}

const StatCard = ({ icon: Icon, label, value, helper, accent = "blue" }) => {
    const accentMap = {
        blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
        cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
        sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
        indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_50%)] opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border p-3 ${accentMap[accent] || accentMap.blue}`}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
                    {label}
                </p>
                <h3 className="mt-2 text-3xl font-black leading-none text-maxify-text">
                    {value}
                </h3>
                {helper && (
                    <p className="mt-3 text-xs leading-5 text-maxify-text-secondary/85">
                        {helper}
                    </p>
                )}
            </div>
        </motion.div>
    )
}

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
        <RootDiv className="min-h-full w-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
                    <BackgroundGlow />

                    <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_420px] xl:items-center">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                                <Sparkles size={14} />
                                Sistema automático
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                                    <Zap className="h-9 w-9 text-blue-300" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                                        Limpeza automática em{" "}
                                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                            modo inteligente
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                                        Configure o intervalo, escolha as rotinas seguras e deixe o Maxify manter o sistema mais limpo de forma automática.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Status: {autoCleanEnabled ? "ativo" : "inativo"}
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            {autoCleanSelections.length} limpezas selecionadas
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Próxima: {formatTimeUntilNextClean()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                                    {autoCleanRunning ? (
                                        <RefreshCw size={30} className="animate-spin text-blue-300" />
                                    ) : (
                                        <Gauge size={30} className="text-blue-300" />
                                    )}
                                </div>

                                <button
                                    onClick={() => setNotificationsEnabled((prev) => !prev)}
                                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] transition-all ${notificationsEnabled
                                            ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                            : "border-maxify-border bg-maxify-card/60 text-maxify-text-secondary"
                                        }`}
                                    title={notificationsEnabled ? "Notificações ativas" : "Notificações desativadas"}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                                        {notificationsEnabled ? "Avisos" : "Sem avisos"}
                                    </span>
                                </button>
                            </div>

                            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                                Controle rápido
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-maxify-text">
                                {autoCleanEnabled ? "Automático ativo" : "Automático pausado"}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                                Execute uma limpeza manual agora ou ligue o modo automático para seguir o intervalo escolhido.
                            </p>

                            <div className="mt-5 grid gap-3">
                                <Button
                                    onClick={() => executeAutoClean()}
                                    variant="outline"
                                    className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl"
                                    disabled={autoCleanRunning || autoCleanSelections.length === 0}
                                >
                                    <RefreshCw size={18} className={autoCleanRunning ? "animate-spin" : ""} />
                                    <span>{autoCleanRunning ? "Executando..." : "Executar agora"}</span>
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
                                    className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl"
                                    disabled={autoCleanRunning}
                                >
                                    {autoCleanEnabled ? <Pause size={20} /> : <Play size={20} />}
                                    <span>{autoCleanEnabled ? "Desativar auto" : "Ativar auto"}</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section>
                    <SectionTitle
                        icon={Activity}
                        label="Resumo"
                        title="Visão rápida da automação"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <StatCard
                            icon={Activity}
                            label="Status"
                            value={autoCleanEnabled ? "Ativo" : "Inativo"}
                            helper={autoCleanEnabled ? `Próxima limpeza em ${formatTimeUntilNextClean()}` : "Automação desligada no momento"}
                            accent="blue"
                        />

                        <StatCard
                            icon={CheckCircle2}
                            label="Execuções automáticas"
                            value={estatisticas.autoCleansExecuted || 0}
                            helper="Quantidade de execuções feitas sozinhas"
                            accent="cyan"
                        />

                        <StatCard
                            icon={Database}
                            label="Liberado no automático"
                            value={formatarBytes(estatisticas.totalAutoCleanSpace || 0)}
                            helper="Espaço total recuperado por automação"
                            accent="sky"
                        />
                    </div>
                </section>

                <section>
                    <SectionTitle
                        icon={Timer}
                        label="Intervalo"
                        title="Intervalo da limpeza automática"
                        description="Escolha de quanto em quanto tempo o sistema deve executar."
                    />

                    <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_45%)]" />

                        <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {INTERVAL_OPTIONS.map((option) => {
                                const ativo = autoCleanInterval === option.value

                                return (
                                    <motion.button
                                        key={option.value}
                                        whileHover={!autoCleanRunning ? { y: -4 } : undefined}
                                        whileTap={!autoCleanRunning ? { scale: 0.98 } : undefined}
                                        onClick={() => {
                                            if (autoCleanRunning) {
                                                toast.warning("Aguarde a limpeza atual terminar para alterar o intervalo.")
                                                return
                                            }

                                            setAutoCleanInterval(option.value)
                                        }}
                                        disabled={autoCleanRunning}
                                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${ativo
                                                ? "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10"
                                                : "border-maxify-border bg-maxify-bg/30 text-maxify-text-secondary hover:border-blue-500/20 hover:bg-blue-500/10"
                                            } ${autoCleanRunning ? "cursor-not-allowed opacity-50" : ""}`}
                                    >
                                        <Timer size={20} />
                                        <span className="text-sm font-black">{option.label}</span>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </Card>
                </section>

                <section>
                    <SectionTitle
                        icon={Layers3}
                        label="Rotinas"
                        title="Limpezas permitidas no automático"
                        description="Rotinas perigosas ficam fora do automático para evitar problemas."
                    />

                    <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_45%)]" />

                        <div className="relative z-10 max-h-[520px] overflow-y-auto pr-2 custom-clean-scroll">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {safeCleanups.map((limpeza) => {
                                    const selecionada = autoCleanSelections.includes(limpeza.id)

                                    return (
                                        <motion.button
                                            key={limpeza.id}
                                            type="button"
                                            whileHover={!autoCleanRunning ? { y: -3 } : undefined}
                                            whileTap={!autoCleanRunning ? { scale: 0.98 } : undefined}
                                            onClick={() => {
                                                if (autoCleanRunning) return

                                                const updated = selecionada
                                                    ? autoCleanSelections.filter((id) => id !== limpeza.id)
                                                    : [...autoCleanSelections, limpeza.id]

                                                setAutoCleanSelections(updated)
                                            }}
                                            className={`group rounded-2xl border p-4 text-left transition-all ${selecionada
                                                    ? "border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                                                    : "border-maxify-border bg-maxify-bg/30 hover:border-blue-500/20 hover:bg-blue-500/10"
                                                } ${autoCleanRunning ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                                                        {cleanupIconMap[limpeza.icon]}
                                                    </span>
                                                    <span className="truncate text-sm font-bold text-maxify-text">
                                                        {limpeza.label}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`h-3 w-3 shrink-0 rounded-full ${selecionada ? "bg-blue-400 shadow-lg shadow-blue-500/30" : "bg-maxify-border"
                                                        }`}
                                                />
                                            </div>

                                            <p className="mt-3 line-clamp-2 text-xs leading-5 text-maxify-text-secondary">
                                                {limpeza.description}
                                            </p>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="relative z-10 mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold text-yellow-300">
                                <AlertTriangle size={14} />
                                Só coloque no automático o que for seguro para rodar sozinho.
                            </p>
                        </div>
                    </Card>
                </section>

                {autoCleanHistory.length > 0 && (
                    <section>
                        <SectionTitle
                            icon={Clock}
                            label="Histórico"
                            title="Histórico automático"
                            description="Últimas execuções feitas sozinhas."
                        />

                        <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_45%)]" />

                            <div className="relative z-10 max-h-80 space-y-3 overflow-y-auto pr-2">
                                {autoCleanHistory.slice(0, 8).map((record, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/10"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-maxify-text">
                                                    {new Date(record.timestamp).toLocaleString()}
                                                </p>
                                                <p className="mt-1 text-xs text-maxify-text-secondary">
                                                    {record.selections} operação(ões)
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-black text-cyan-300">
                                                    {formatarBytes(record.totalLiberado)}
                                                </p>
                                                <p className="text-xs text-maxify-text-secondary">
                                                    {Math.round(record.duration / 1000)}s
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </section>
                )}

                <section className="relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-blue-500/10 p-5 shadow-xl shadow-black/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_45%)]" />

                    <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                <ShieldCheck className="h-5 w-5 text-blue-300" />
                            </div>

                            <div>
                                <h3 className="text-base font-black text-maxify-text">
                                    Segurança da automação
                                </h3>
                                <p className="text-sm leading-6 text-maxify-text-secondary">
                                    As limpezas marcadas como não seguras ficam fora da lista automática.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                            Maxify Auto Clean
                        </div>
                    </div>
                </section>
            </div>
        </RootDiv>
    )
}

export default AutoClean
