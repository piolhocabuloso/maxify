import { useMemo, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"
import {
    Sparkles,
    PackageCheck,
    Download,
    Search,
    CheckCircle2,
    RefreshCw,
    Terminal,
    Copy,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    MonitorDown,
    Gamepad2,
    Globe,
    Code2,
    Box,
    Layers,
    Wrench,
    HardDrive,
    Play,
    X,
} from "lucide-react"

const PROGRAMS = [
    {
        id: "google-chrome",
        name: "Google Chrome",
        description: "Navegador rápido e popular.",
        category: "internet",
        wingetId: "Google.Chrome",
        icon: Globe,
        tag: "Navegador",
    },
    {
        id: "discord",
        name: "Discord",
        description: "Comunicação para comunidades e jogos.",
        category: "social",
        wingetId: "Discord.Discord",
        icon: Gamepad2,
        tag: "Chat",
    },
    {
        id: "steam",
        name: "Steam",
        description: "Launcher de jogos para PC.",
        category: "games",
        wingetId: "Valve.Steam",
        icon: Gamepad2,
        tag: "Jogos",
    },
    {
        id: "epic-games",
        name: "Epic Games",
        description: "Launcher da Epic Games.",
        category: "games",
        wingetId: "EpicGames.EpicGamesLauncher",
        icon: Gamepad2,
        tag: "Jogos",
    },
    {
        id: "winrar",
        name: "WinRAR",
        description: "Compactador e extrator de arquivos.",
        category: "tools",
        wingetId: "RARLab.WinRAR",
        icon: Box,
        tag: "Arquivo",
    },
    {
        id: "7zip",
        name: "7-Zip",
        description: "Compactador leve e gratuito.",
        category: "tools",
        wingetId: "7zip.7zip",
        icon: Box,
        tag: "Arquivo",
    },
    {
        id: "vscode",
        name: "Visual Studio Code",
        description: "Editor de código moderno.",
        category: "dev",
        wingetId: "Microsoft.VisualStudioCode",
        icon: Code2,
        tag: "Dev",
    },
    {
        id: "nodejs",
        name: "Node.js LTS",
        description: "Ambiente JavaScript para desenvolvimento.",
        category: "dev",
        wingetId: "OpenJS.NodeJS.LTS",
        icon: Code2,
        tag: "Dev",
    },
    {
        id: "git",
        name: "Git",
        description: "Controle de versão para projetos.",
        category: "dev",
        wingetId: "Git.Git",
        icon: Code2,
        tag: "Dev",
    },
    {
        id: "vlc",
        name: "VLC",
        description: "Player de vídeo e áudio.",
        category: "media",
        wingetId: "VideoLAN.VLC",
        icon: MonitorDown,
        tag: "Mídia",
    },
    {
        id: "spotify",
        name: "Spotify",
        description: "Aplicativo de música.",
        category: "media",
        wingetId: "Spotify.Spotify",
        icon: MonitorDown,
        tag: "Mídia",
    },
    {
        id: "powertoys",
        name: "Microsoft PowerToys",
        description: "Ferramentas extras para Windows.",
        category: "tools",
        wingetId: "Microsoft.PowerToys",
        icon: Wrench,
        tag: "Windows",
    },
]

const CATEGORIES = [
    { id: "all", label: "Todos", icon: Layers },
    { id: "internet", label: "Internet", icon: Globe },
    { id: "social", label: "Social", icon: PackageCheck },
    { id: "games", label: "Jogos", icon: Gamepad2 },
    { id: "dev", label: "Desenvolvimento", icon: Code2 },
    { id: "tools", label: "Utilitários", icon: Wrench },
    { id: "media", label: "Mídia", icon: MonitorDown },
]

function ProgramCard({ program, selected, disabled, onToggle }) {
    const Icon = program.icon

    return (
        <motion.button
            layout
            type="button"
            onClick={() => onToggle(program.id)}
            disabled={disabled}
            whileTap={{ scale: 0.98 }}
            className={`
        relative overflow-hidden rounded-2xl border p-5 text-left transition-all
        ${selected
                    ? "border-blue-500/40 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                    : "border-maxify-border bg-maxify-card hover:border-blue-400/35 hover:bg-maxify-border/10"
                }
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
      `}
        >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 flex items-start gap-4">
                <div
                    className={`
            rounded-2xl border p-3
            ${selected
                            ? "border-blue-500/30 bg-blue-500/20 text-blue-300"
                            : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        }
          `}
                >
                    <Icon size={24} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="truncate text-lg font-bold text-maxify-text">
                            {program.name}
                        </h3>

                        {selected ? (
                            <CheckCircle2 size={18} className="shrink-0 text-green-400" />
                        ) : (
                            <div className="h-[18px] w-[18px] shrink-0 rounded-full border border-maxify-border" />
                        )}
                    </div>

                    <p className="line-clamp-2 text-sm leading-relaxed text-maxify-text-secondary">
                        {program.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                            {program.tag}
                        </span>

                        <span className="rounded-full border border-maxify-border bg-maxify-border/20 px-2.5 py-1 text-xs text-maxify-text-secondary">
                            winget
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    )
}

function LogPanel({ logs }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    return (
        <div className="relative overflow-hidden rounded-2xl border border-maxify-border bg-black/25">
            <div className="flex items-center justify-between border-b border-maxify-border bg-maxify-border/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-400/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                        <span className="h-3 w-3 rounded-full bg-green-400/80" />
                    </div>

                    <span className="ml-2 text-sm font-semibold text-maxify-text">
                        Console de instalação
                    </span>
                </div>

                <Terminal size={18} className="text-blue-400" />
            </div>

            <div className="h-[340px] overflow-y-auto p-4 font-mono text-sm custom-startup-scroll">
                {logs.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <Terminal className="mb-3 text-blue-400/70" size={36} />
                        <p className="text-maxify-text-secondary">
                            Nenhuma instalação iniciada ainda.
                        </p>
                        <p className="mt-1 text-xs text-maxify-text-secondary/60">
                            Os logs aparecerão aqui durante o processo.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((line, index) => (
                            <div
                                key={index}
                                className={`
                  whitespace-pre-wrap break-words
                  ${line.type === "error"
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

export default function EssentialInstaller() {
    const [selected, setSelected] = useState([])
    const [category, setCategory] = useState("all")
    const [search, setSearch] = useState("")
    const [logs, setLogs] = useState([])
    const [installing, setInstalling] = useState(false)
    const [progress, setProgress] = useState(0)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const selectedPrograms = useMemo(() => {
        return PROGRAMS.filter((program) => selected.includes(program.id))
    }, [selected])

    const filteredPrograms = useMemo(() => {
        let list = [...PROGRAMS]

        if (category !== "all") {
            list = list.filter((program) => program.category === category)
        }

        if (search.trim()) {
            const term = search.toLowerCase()

            list = list.filter((program) => {
                return (
                    program.name.toLowerCase().includes(term) ||
                    program.description.toLowerCase().includes(term) ||
                    program.tag.toLowerCase().includes(term)
                )
            })
        }

        return list
    }, [category, search])

    const toggleProgram = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const selectCategory = () => {
        const ids = filteredPrograms.map((program) => program.id)
        setSelected((prev) => Array.from(new Set([...prev, ...ids])))
    }

    const clearSelected = () => {
        setSelected([])
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
    }

    useEffect(() => {
        let removeLog = null
        let removeDone = null

        if (window.electron?.on) {
            removeLog = window.electron.on("essential:install-log", (payload) => {
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

            removeDone = window.electron.on("essential:install-done", (payload) => {
                setInstalling(false)
                setProgress(100)

                if (payload?.success) {
                    toast.success("Instalação finalizada!")
                } else {
                    toast.error(payload?.message || "Instalação finalizada com erro.")
                }
            })
        }

        return () => {
            if (typeof removeLog === "function") removeLog()
            if (typeof removeDone === "function") removeDone()
        }
    }, [])

    const startInstall = async () => {
        if (selectedPrograms.length === 0) {
            toast.warning("Selecione pelo menos um programa.")
            return
        }

        setConfirmOpen(false)
        setInstalling(true)
        setProgress(5)
        setLogs([])

        try {
            const result = await invoke({
                channel: "essential:install",
                payload: {
                    programs: selectedPrograms.map((program) => ({
                        id: program.id,
                        name: program.name,
                        wingetId: program.wingetId,
                    })),
                },
            })

            if (!result?.started) {
                setInstalling(false)
                toast.error(result?.message || "Não foi possível iniciar.")
            }
        } catch (error) {
            setInstalling(false)
            toast.error(error?.message || "Erro ao iniciar instalação.")
        }
    }

    const stopInstall = async () => {
        try {
            const result = await invoke({
                channel: "essential:stop",
            })

            if (result?.success) {
                setInstalling(false)
                toast.info("Instalação cancelada.")
            }
        } catch {
            toast.error("Erro ao cancelar instalação.")
        }
    }

    return (
        <RootDiv>
            <div className="mx-auto max-w-[1900px] space-y-8 px-6 pb-16">
                <div className="relative mt-8 overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />

                    <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px] xl:items-start">
                        <div className="min-w-0">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300">
                                <Sparkles size={15} />
                                Instalador inteligente
                            </div>

                            <div className="flex flex-col gap-5 md:flex-row md:items-start">
                                <div className="shrink-0 rounded-2xl border border-blue-500/20 bg-blue-500/15 p-4 shadow-lg shadow-blue-500/10">
                                    <PackageCheck className="text-blue-400" size={34} />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="text-3xl font-bold leading-tight text-maxify-text md:text-4xl">
                                        Programas Essenciais
                                    </h1>

                                    <p className="mt-3 max-w-3xl text-maxify-text-secondary">
                                        Instale rapidamente os principais aplicativos para preparar
                                        seu PC depois de uma formatação ou limpeza.
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            {PROGRAMS.length} programas
                                        </div>

                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            {selected.length} selecionados
                                        </div>

                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            Instalação via winget
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="self-start rounded-[24px] border border-maxify-border bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Progresso
                                    </p>

                                    <h2 className="mt-1 text-4xl font-bold text-cyan-300">
                                        {progress}%
                                    </h2>
                                </div>

                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-400">
                                    {installing ? (
                                        <RefreshCw size={30} className="animate-spin" />
                                    ) : (
                                        <Download size={30} />
                                    )}
                                </div>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-maxify-border/40">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={installing || selected.length === 0}
                                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl !bg-blue-500 text-white"
                                >
                                    {installing ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Instalando...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} />
                                            Instalar selecionados
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={stopInstall}
                                    disabled={!installing}
                                    variant="outline"
                                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl"
                                >
                                    Cancelar instalação
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <Card className="rounded-[24px] border border-maxify-border bg-maxify-card p-6">
                        <div className="mb-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                        <Layers className="text-blue-400" size={22} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-maxify-text">
                                            Catálogo de programas
                                        </h2>

                                        <p className="text-sm text-maxify-text-secondary">
                                            {filteredPrograms.length} encontrados • {selected.length} selecionados
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={selectCategory}
                                        disabled={installing}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Selecionar visíveis
                                    </Button>

                                    <Button
                                        onClick={clearSelected}
                                        disabled={installing}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Limpar seleção
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Pesquisar programa..."
                                        className="h-12 w-full rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 pl-12 text-sm text-maxify-text outline-none placeholder:text-maxify-text-secondary/50 focus:border-blue-500/40"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon

                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            disabled={installing}
                                            className={`
                        flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all
                        ${category === cat.id
                                                    ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
                                                    : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary hover:bg-maxify-border/35"
                                                }
                      `}
                                        >
                                            <Icon size={16} />
                                            {cat.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="max-h-[720px] overflow-y-auto pr-2 custom-startup-scroll">
                            <AnimatePresence mode="popLayout">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {filteredPrograms.map((program) => (
                                        <ProgramCard
                                            key={program.id}
                                            program={program}
                                            selected={selected.includes(program.id)}
                                            disabled={installing}
                                            onToggle={toggleProgram}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>

                            {filteredPrograms.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-maxify-border p-10 text-center">
                                    <Search className="mx-auto mb-4 text-blue-400/70" size={40} />

                                    <h3 className="text-xl font-bold text-maxify-text">
                                        Nenhum programa encontrado
                                    </h3>

                                    <p className="mt-2 text-sm text-maxify-text-secondary">
                                        Tente trocar a categoria ou pesquisar outro nome.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-[24px] border border-maxify-border bg-maxify-card p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                    <ShieldCheck className="text-blue-400" size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Resumo
                                    </h2>

                                    <p className="text-sm text-maxify-text-secondary">
                                        Instalação atual
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">
                                        Selecionados
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-blue-300">
                                        {selected.length}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">
                                        Modo
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-cyan-300">
                                        winget
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">
                                        Status
                                    </p>

                                    <p
                                        className={`mt-1 text-lg font-bold ${installing ? "text-blue-300" : "text-green-300"
                                            }`}
                                    >
                                        {installing ? "Instalando" : "Pronto"}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[24px] border border-maxify-border bg-maxify-card p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                                    <AlertTriangle className="text-yellow-400" size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Atenção
                                    </h2>

                                    <p className="text-sm text-maxify-text-secondary">
                                        Antes de instalar
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                        O Windows precisa ter o winget instalado.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                        Alguns instaladores podem abrir janelas próprias durante o processo.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                        Para melhor funcionamento, abra o Maxify como administrador.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <Card className="rounded-[24px] border border-maxify-border bg-maxify-card p-6">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                <Terminal className="text-blue-400" size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">
                                    Logs da instalação
                                </h2>

                                <p className="text-sm text-maxify-text-secondary">
                                    Acompanhe tudo que está acontecendo
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
                                Copiar
                            </Button>

                            <Button
                                onClick={clearLogs}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={installing}
                            >
                                <Trash2 size={16} />
                                Limpar
                            </Button>
                        </div>
                    </div>

                    <LogPanel logs={logs} />
                </Card>

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
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
                            >
                                <Card className="relative overflow-hidden rounded-[28px] border border-blue-500/25 bg-gradient-to-br from-maxify-card to-maxify-bg p-7 shadow-2xl">
                                    <button
                                        onClick={() => setConfirmOpen(false)}
                                        className="absolute right-5 top-5 rounded-xl p-2 text-maxify-text-secondary transition hover:bg-maxify-border/20 hover:text-maxify-text"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/15">
                                        <Download className="text-blue-400" size={30} />
                                    </div>

                                    <h2 className="text-2xl font-bold text-maxify-text">
                                        Instalar programas?
                                    </h2>

                                    <p className="mt-3 text-sm leading-relaxed text-maxify-text-secondary">
                                        O Maxify irá instalar {selected.length} programa(s) usando winget.
                                        O processo pode demorar alguns minutos.
                                    </p>

                                    <div className="mt-5 max-h-[180px] overflow-y-auto rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 custom-startup-scroll">
                                        <div className="space-y-2">
                                            {selectedPrograms.map((program) => (
                                                <div
                                                    key={program.id}
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <span className="text-sm text-maxify-text">
                                                        {program.name}
                                                    </span>

                                                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                                                        {program.tag}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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
                                            <Download size={18} />
                                            Instalar agora
                                        </Button>
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