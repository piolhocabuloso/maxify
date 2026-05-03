import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"
import {
    ShieldCheck,
    Sparkles,
    Download,
    Terminal,
    CheckCircle2,
    AlertTriangle,
    FileCode2,
    Rocket,
    RefreshCw,
    Power,
    MonitorCog,
    PackageCheck,
    Clock,
    Zap,
    Lock,
    Play,
    X,
    Copy,
    Trash2,
    Cpu,
    Server,
    Activity,
    StopCircle,
    Crown,
} from "lucide-react"

const steps = [
    {
        title: "Preparação",
        description: "O app prepara a instalação interna do Office.",
        icon: ShieldCheck,
    },
    {
        title: "Execução",
        description: "O Maxify executa o processo diretamente pelo sistema.",
        icon: Terminal,
    },
    {
        title: "Instalação",
        description: "O instalador oficial é iniciado e acompanhado pelo app.",
        icon: PackageCheck,
    },
    {
        title: "Finalização",
        description: "O resultado aparece no painel com logs e status.",
        icon: CheckCircle2,
    },
]

const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 3,
}))

function StatusBadge({ status }) {
    const config = {
        idle: {
            label: "Aguardando",
            className: "border-blue-500/25 bg-blue-500/10 text-blue-300",
        },
        running: {
            label: "Instalando",
            className: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
        },
        success: {
            label: "Finalizado",
            className: "border-green-500/25 bg-green-500/10 text-green-300",
        },
        error: {
            label: "Erro",
            className: "border-red-500/25 bg-red-500/10 text-red-300",
        },
    }

    const item = config[status] || config.idle

    return (
        <span
            className={`
                inline-flex items-center gap-2 rounded-full border px-3 py-1.5
                text-xs font-semibold ${item.className}
            `}
        >
            <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
            {item.label}
        </span>
    )
}

function StepCard({ step, index, active, done }) {
    const Icon = step.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`
                relative overflow-hidden rounded-2xl border p-4 transition-all duration-300
                ${
                    active
                        ? "border-blue-500/40 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                        : done
                            ? "border-green-500/25 bg-green-500/10"
                            : "border-maxify-border bg-maxify-border/10"
                }
            `}
        >
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative z-10 flex items-start gap-3">
                <div
                    className={`
                        rounded-2xl border p-3
                        ${
                            done
                                ? "border-green-500/25 bg-green-500/10 text-green-300"
                                : active
                                    ? "border-blue-500/30 bg-blue-500/20 text-blue-300"
                                    : "border-maxify-border bg-maxify-border/20 text-blue-400"
                        }
                    `}
                >
                    {done ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>

                <div>
                    <h3 className="font-bold text-maxify-text">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-maxify-text-secondary">
                        {step.description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

function MiniStat({ icon, title, value }) {
    return (
        <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
            <div className="mb-3 text-blue-400">{icon}</div>
            <p className="text-sm text-maxify-text-secondary">{title}</p>
            <h3 className="mt-1 font-bold text-maxify-text">{value}</h3>
        </div>
    )
}

function TerminalLog({ logs }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    return (
        <div className="relative overflow-hidden rounded-[24px] border border-maxify-border bg-black/30">
            <div className="flex items-center justify-between border-b border-maxify-border bg-maxify-border/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-400/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                        <span className="h-3 w-3 rounded-full bg-green-400/80" />
                    </div>

                    <span className="ml-2 text-sm font-semibold text-maxify-text">
                        Console interno do Maxify
                    </span>
                </div>

                <Terminal size={18} className="text-blue-400" />
            </div>

            <div className="h-[340px] overflow-y-auto p-4 font-mono text-sm custom-nav-scroll">
                {logs.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <Terminal className="mb-3 text-blue-400/70" size={36} />
                        <p className="text-maxify-text-secondary">
                            Nenhum processo iniciado ainda.
                        </p>
                        <p className="mt-1 text-xs text-maxify-text-secondary/60">
                            Os logs aparecerão aqui durante a instalação.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((line, index) => (
                            <div
                                key={index}
                                className={`
                                    whitespace-pre-wrap break-words
                                    ${
                                        line.type === "error"
                                            ? "text-red-300"
                                            : line.type === "success"
                                                ? "text-green-300"
                                                : "text-blue-100/85"
                                    }
                                `}
                            >
                                <span className="text-blue-400/70">
                                    {String(index + 1).padStart(2, "0")} │{" "}
                                </span>
                                {line.text}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OfficeInstaller() {
    const [status, setStatus] = useState("idle")
    const [logs, setLogs] = useState([])
    const [progress, setProgress] = useState(0)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const running = status === "running"

    const activeStep = useMemo(() => {
        if (status === "idle") return 0

        if (status === "running") {
            if (progress < 30) return 1
            if (progress < 85) return 2
            return 3
        }

        if (status === "success") return 4

        return 1
    }, [status, progress])

    useEffect(() => {
        let removeLogListener = null
        let removeDoneListener = null

        if (window.electron?.on) {
            removeLogListener = window.electron.on("office:install-log", (payload) => {
                setLogs((prev) => [
                    ...prev,
                    {
                        type: payload?.type || "info",
                        text: payload?.text || "",
                    },
                ])

                if (typeof payload?.progress === "number") {
                    setProgress(payload.progress)
                }
            })

            removeDoneListener = window.electron.on("office:install-done", (payload) => {
                if (payload?.success) {
                    setStatus("success")
                    setProgress(100)
                    toast.success("Instalação finalizada!")
                } else {
                    setStatus("error")
                    setProgress(100)
                    toast.error(payload?.message || "Erro durante a instalação.")
                }
            })
        }

        return () => {
            if (typeof removeLogListener === "function") removeLogListener()
            if (typeof removeDoneListener === "function") removeDoneListener()
        }
    }, [])

    const addLocalLog = (text, type = "info") => {
        setLogs((prev) => [...prev, { text, type }])
    }

    const startInstall = async () => {
        if (running) return

        setConfirmOpen(false)
        setLogs([])
        setStatus("running")
        setProgress(8)

        addLocalLog("Preparando instalação pelo próprio Maxify...", "info")
        addLocalLog("Nenhum arquivo externo será chamado pela interface.", "info")

        try {
            const result = await invoke({
                channel: "office:install",
            })

            if (result?.started) {
                setProgress(20)
                addLocalLog("Processo interno iniciado com sucesso.", "success")
            } else {
                setStatus("error")
                setProgress(100)
                addLocalLog(result?.message || "Não foi possível iniciar a instalação.", "error")
                toast.error(result?.message || "Falha ao iniciar.")
            }
        } catch (error) {
            setStatus("error")
            setProgress(100)
            addLocalLog(error?.message || "Erro inesperado ao iniciar.", "error")
            toast.error("Erro ao iniciar instalação.")
        }
    }

    const stopInstall = async () => {
        if (!running) return

        try {
            const result = await invoke({
                channel: "office:stop",
            })

            if (result?.success) {
                setStatus("error")
                addLocalLog("Instalação cancelada pelo usuário.", "error")
                toast.info("Instalação cancelada.")
            } else {
                toast.warning(result?.message || "Não foi possível cancelar.")
            }
        } catch {
            toast.error("Erro ao cancelar instalação.")
        }
    }

    const copyLogs = async () => {
        if (logs.length === 0) {
            toast.info("Nenhum log para copiar.")
            return
        }

        try {
            await navigator.clipboard.writeText(logs.map((l) => l.text).join("\n"))
            toast.success("Logs copiados!")
        } catch {
            toast.error("Não foi possível copiar os logs.")
        }
    }

    const clearLogs = () => {
        setLogs([])
        setProgress(0)
        setStatus("idle")
    }

    return (
        <RootDiv>
            <div className="mx-auto max-w-[1900px] space-y-8 px-6 pb-16">
                <div className="relative mt-8 overflow-hidden rounded-[34px] border border-maxify-border bg-gradient-to-br from-maxify-card via-maxify-card to-blue-950/20 p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_40%)]" />

                    {particles.map((particle) => (
                        <motion.span
                            key={particle.id}
                            className="absolute h-1 w-1 rounded-full bg-blue-300/50"
                            style={{
                                left: particle.left,
                                top: particle.top,
                            }}
                            animate={{
                                y: [0, -24, 0],
                                opacity: [0.25, 0.9, 0.25],
                                scale: [1, 1.8, 1],
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay,
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-blue-500/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    />

                    <motion.div
                        className="absolute -right-8 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full border border-cyan-500/10"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                                <Sparkles size={16} />
                                Assistente interno de instalação
                            </div>

                            <div className="flex flex-col gap-5 md:flex-row md:items-start">
                                <div className="rounded-[28px] border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-5 shadow-xl shadow-blue-500/10">
                                    <Crown className="text-blue-400" size={46} />
                                </div>

                                <div>
                                    <h1 className="bg-gradient-to-r from-white via-blue-300 to-cyan-300 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
                                        Office Setup
                                    </h1>

                                    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-maxify-text-secondary">
                                        Instale o Office diretamente pelo Maxify, com acompanhamento visual,
                                        logs em tempo real e controle do processo em uma interface moderna.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <StatusBadge status={status} />

                                        <div className="rounded-full border border-maxify-border bg-maxify-border/20 px-4 py-2 text-xs font-semibold text-maxify-text-secondary">
                                            Execução interna
                                        </div>

                                        <div className="rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
                                            Sem arquivo externo
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="relative overflow-hidden rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6">
                            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

                            <div className="relative z-10">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-maxify-text-secondary">
                                            Progresso
                                        </p>

                                        <h2 className="mt-1 text-3xl font-bold text-maxify-text">
                                            {progress}%
                                        </h2>
                                    </div>

                                    <motion.div
                                        animate={running ? { rotate: 360 } : { rotate: 0 }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: running ? Infinity : 0,
                                            ease: "linear",
                                        }}
                                        className="rounded-3xl border border-blue-500/30 bg-blue-500/20 p-4 text-blue-300"
                                    >
                                        {running ? <RefreshCw size={30} /> : <Rocket size={30} />}
                                    </motion.div>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-maxify-border/40">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <MiniStat
                                        icon={<Clock size={20} />}
                                        title="Estado"
                                        value={running ? "Em execução" : "Pronto"}
                                    />

                                    <MiniStat
                                        icon={<MonitorCog size={20} />}
                                        title="Modo"
                                        value="Interno"
                                    />

                                    <MiniStat
                                        icon={<Cpu size={20} />}
                                        title="Origem"
                                        value="Maxify"
                                    />

                                    <MiniStat
                                        icon={<Server size={20} />}
                                        title="Logs"
                                        value={`${logs.length}`}
                                    />
                                </div>

                                <div className="mt-6 space-y-3">
                                    <Button
                                        onClick={() => setConfirmOpen(true)}
                                        disabled={running}
                                        className="
                                            flex min-h-[52px] w-full items-center justify-center gap-3
                                            rounded-2xl !bg-gradient-to-r from-blue-500 to-cyan-500
                                            text-base font-bold text-white shadow-lg shadow-blue-500/20
                                            transition-all hover:scale-[1.01] disabled:opacity-60
                                        "
                                    >
                                        {running ? (
                                            <>
                                                <RefreshCw size={20} className="animate-spin" />
                                                Instalando...
                                            </>
                                        ) : (
                                            <>
                                                <Power size={20} />
                                                Iniciar instalação
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={stopInstall}
                                        disabled={!running}
                                        variant="outline"
                                        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl"
                                    >
                                        <StopCircle size={18} />
                                        Cancelar instalação
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.title}
                            step={step}
                            index={index}
                            active={activeStep === index}
                            done={status === "success" || activeStep > index}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3">
                                    <Terminal className="text-blue-400" size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Saída da instalação
                                    </h2>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Logs recebidos em tempo real pelo app
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={copyLogs}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Copy size={16} />
                                    Copiar logs
                                </Button>

                                <Button
                                    onClick={clearLogs}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    disabled={running}
                                >
                                    <Trash2 size={16} />
                                    Limpar
                                </Button>
                            </div>
                        </div>

                        <TerminalLog logs={logs} />
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-[28px] border border-maxify-border bg-gradient-to-br from-maxify-card to-maxify-card/95 p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3">
                                    <ShieldCheck className="text-blue-400" size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Segurança
                                    </h2>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Antes de executar
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <Lock size={18} className="mt-0.5 text-blue-400" />
                                        <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                            A instalação é executada internamente pelo Maxify usando o sistema.
                                        </p>
                                    </div>
                                </div>


                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <Zap size={18} className="mt-0.5 text-blue-400" />
                                        <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                            Permissão de administrador pode ser necessária para concluir tudo corretamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3">
                                    <Download className="text-blue-400" size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Instalação
                                    </h2>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Funcionamento atual
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                                <p className="text-sm leading-relaxed text-blue-300">
                                    O Maxify inicia a instalação diretamente pelo processo interno do app.
                                    Nenhum instalador externo é selecionado pela interface.
                                </p>
                            </div>
                        </Card>

                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3">
                                    <Activity className="text-blue-400" size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Resumo
                                    </h2>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Estado do processo
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <span className="text-sm text-maxify-text-secondary">Status</span>
                                    <StatusBadge status={status} />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <span className="text-sm text-maxify-text-secondary">Progresso</span>
                                    <span className="font-bold text-blue-300">{progress}%</span>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <span className="text-sm text-maxify-text-secondary">Linhas de log</span>
                                    <span className="font-bold text-blue-300">{logs.length}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <AnimatePresence>
                    {confirmOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                                onClick={() => setConfirmOpen(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88, y: 20 }}
                                className="
                                    fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg
                                    -translate-x-1/2 -translate-y-1/2 px-4
                                "
                            >
                                <Card className="relative overflow-hidden rounded-[30px] border border-blue-500/25 bg-gradient-to-br from-maxify-card to-maxify-bg p-7 shadow-2xl">
                                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

                                    <button
                                        onClick={() => setConfirmOpen(false)}
                                        className="absolute right-5 top-5 rounded-xl p-2 text-maxify-text-secondary transition hover:bg-maxify-border/20 hover:text-maxify-text"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="relative z-10">
                                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/15">
                                            <Play className="text-blue-400" size={30} />
                                        </div>

                                        <h2 className="text-2xl font-bold text-maxify-text">
                                            Iniciar instalação?
                                        </h2>

                                        <p className="mt-3 text-sm leading-relaxed text-maxify-text-secondary">
                                            O Maxify irá iniciar a instalação diretamente pelo app.
                                            Continue apenas se você possui licença válida e sabe o que está executando.
                                        </p>

                                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => setConfirmOpen(false)}
                                            >
                                                Cancelar
                                            </Button>

                                            <Button
                                                onClick={startInstall}
                                                className="flex items-center justify-center gap-2 !bg-blue-500 text-white"
                                            >
                                                <Rocket size={18} />
                                                Executar agora
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </RootDiv>
    )
}