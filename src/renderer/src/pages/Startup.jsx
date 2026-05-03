import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"
import {
    ChevronRight,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Database,
    Eye,
    EyeOff,
    FileCog,
    FolderOpen,
    Gauge,
    Layers,
    MonitorCog,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    Trash2,
    XCircle,
    Zap,
} from "lucide-react"

function addLogLine(setLogs, text, type = "info") {
    setLogs((prev) => [
        ...prev,
        {
            text,
            type,
            time: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        },
    ])
}

function StatusPill({ active }) {
    return (
        <span
            className={`
                inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold
                ${active
                    ? "border-green-500/25 bg-green-500/10 text-green-300"
                    : "border-red-500/25 bg-red-500/10 text-red-300"
                }
            `}
        >
            <span className="h-2 w-2 rounded-full bg-current" />
            {active ? "Ativo" : "Desativado"}
        </span>
    )
}

function StatCard({ icon, label, value, helper }) {
    return (
        <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                    {icon}
                </div>

                <ChevronRight
                    size={16}
                    className="text-maxify-text-secondary opacity-60"
                />
            </div>

            <p className="text-sm text-maxify-text-secondary">{label}</p>

            <h3 className="mt-1 text-3xl font-bold text-blue-300">
                {value}
            </h3>

            {helper && (
                <p className="mt-2 text-xs text-maxify-text-secondary/70">
                    {helper}
                </p>
            )}
        </div>
    )
}

function FilterButton({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                rounded-2xl border px-4 py-3 text-sm font-medium transition-all
                ${active
                    ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
                    : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary hover:bg-maxify-border/35"
                }
            `}
        >
            {label}
        </button>
    )
}

function StartupItem({ item, index, loading, onToggle, onCopy }) {
    const isRegistry = item.type === "registry"
    const isFolder = item.type === "folder"

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ delay: index * 0.025 }}
            className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-5 transition-all hover:border-blue-400/40 hover:bg-maxify-border/15"        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 gap-4">
                    <div
                        className={`
        flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border
        ${item.enabled
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                : "border-red-500/20 bg-red-500/10 text-red-400"
                            }
    `}
                    >
                        {item.enabled ? <Power size={20} /> : <PowerOff size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-maxify-text">
                                {item.name}
                            </h3>

                            <StatusPill active={item.enabled} />

                            <span className="rounded-full border border-maxify-border bg-maxify-border/15 px-2.5 py-1 text-xs text-maxify-text-secondary">
                                {isRegistry
                                    ? "Registro"
                                    : isFolder
                                        ? "Pasta Inicializar"
                                        : "Sistema"}
                            </span>
                        </div>

                        <p className="line-clamp-2 break-all text-sm leading-relaxed text-maxify-text-secondary">
                            {item.command || item.path || "Caminho não detectado"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-lg border border-maxify-border bg-maxify-border/10 px-3 py-1 text-xs text-maxify-text-secondary">
                                {item.sourceLabel}
                            </span>

                            <span className="rounded-lg border border-maxify-border bg-maxify-border/10 px-3 py-1 text-xs text-maxify-text-secondary">
                                {item.needsAdmin ? "Administrador" : "Usuário"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Button
                        onClick={() => onToggle(item)}
                        disabled={loading}
                        variant="outline"
                        className={`
                            flex items-center gap-2 rounded-xl
                            ${item.enabled
                                ? "border-red-500/25 text-red-300 hover:bg-red-500/10"
                                : "border-green-500/25 text-green-300 hover:bg-green-500/10"
                            }
                        `}
                    >
                        {item.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                        {item.enabled ? "Desativar" : "Ativar"}
                    </Button>

                    <Button
                        onClick={() => onCopy(item)}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2 rounded-xl"
                    >
                        <Copy size={16} />
                        Copiar
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

function LogsPanel({ logs }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    if (logs.length === 0) {
        return (
            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-6 text-center">
                <Activity className="mx-auto mb-3 text-blue-400/70" size={34} />
                <h3 className="font-semibold text-maxify-text">Nenhum evento ainda</h3>
                <p className="mt-1 text-sm text-maxify-text-secondary">
                    As ações feitas nesta página aparecerão aqui.
                </p>
            </div>
        )
    }

    return (
        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1 custom-nav-scroll">
            {logs.map((log, index) => (
                <div
                    key={index}
                    className={`
                        rounded-xl border p-3
                        ${log.type === "error"
                            ? "border-red-500/20 bg-red-500/10"
                            : log.type === "success"
                                ? "border-green-500/20 bg-green-500/10"
                                : "border-maxify-border bg-maxify-border/10"
                        }
                    `}
                >
                    <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-blue-300">
                            {log.type === "error"
                                ? "Erro"
                                : log.type === "success"
                                    ? "Sucesso"
                                    : "Info"}
                        </span>

                        <span className="text-xs text-maxify-text-secondary/70">
                            {log.time}
                        </span>
                    </div>

                    <p className="text-sm leading-relaxed text-maxify-text-secondary">
                        {log.text}
                    </p>
                </div>
            ))}

            <div ref={bottomRef} />
        </div>
    )
}

function EmptyState({ search }) {
    return (
        <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-10 text-center">
            <Search className="mx-auto mb-4 text-blue-400/70" size={40} />

            <h3 className="text-xl font-bold text-maxify-text">
                Nenhum item encontrado
            </h3>

            <p className="mt-2 text-sm text-maxify-text-secondary">
                {search
                    ? "Tente usar outro termo de busca ou limpar os filtros."
                    : "Nenhum programa de inicialização foi detectado."}
            </p>
        </div>
    )
}

export default function StartupManager() {
    const [items, setItems] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")

    const loadItems = async () => {
        setLoading(true)

        try {
            addLogLine(setLogs, "Buscando programas de inicialização...", "info")

            const result = await invoke({
                channel: "startup:list",
            })

            if (!result?.success) {
                throw new Error(result?.message || "Falha ao listar inicialização.")
            }

            setItems(result.items || [])

            addLogLine(
                setLogs,
                `${result.items?.length || 0} item(ns) encontrado(s).`,
                "success"
            )
        } catch (error) {
            const message = error.message || "Erro ao carregar inicialização."
            toast.error(message)
            addLogLine(setLogs, message, "error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadItems()
    }, [])

    const stats = useMemo(() => {
        const total = items.length
        const active = items.filter((item) => item.enabled).length
        const disabled = items.filter((item) => !item.enabled).length
        const registry = items.filter((item) => item.type === "registry").length
        const folder = items.filter((item) => item.type === "folder").length

        const impact =
            active >= 12
                ? "Alto"
                : active >= 6
                    ? "Médio"
                    : active >= 1
                        ? "Baixo"
                        : "Limpo"

        return {
            total,
            active,
            disabled,
            registry,
            folder,
            impact,
        }
    }, [items])

    const filteredItems = useMemo(() => {
        let list = [...items]

        if (filter === "active") {
            list = list.filter((item) => item.enabled)
        }

        if (filter === "disabled") {
            list = list.filter((item) => !item.enabled)
        }

        if (filter === "registry") {
            list = list.filter((item) => item.type === "registry")
        }

        if (filter === "folder") {
            list = list.filter((item) => item.type === "folder")
        }

        if (search.trim()) {
            const term = search.toLowerCase()

            list = list.filter((item) => {
                return (
                    item.name?.toLowerCase().includes(term) ||
                    item.command?.toLowerCase().includes(term) ||
                    item.path?.toLowerCase().includes(term) ||
                    item.sourceLabel?.toLowerCase().includes(term)
                )
            })
        }

        return list
    }, [items, filter, search])

    const toggleItem = async (item) => {
        setActionLoading(true)

        try {
            const channel = item.enabled ? "startup:disable" : "startup:enable"

            addLogLine(
                setLogs,
                `${item.enabled ? "Desativando" : "Ativando"} ${item.name}...`,
                "info"
            )

            const result = await invoke({
                channel,
                payload: {
                    id: item.id,
                },
            })

            if (!result?.success) {
                throw new Error(result?.message || "Falha ao alterar item.")
            }

            toast.success(result.message || "Alteração concluída.")

            addLogLine(
                setLogs,
                result.message || "Alteração concluída.",
                "success"
            )

            await loadItems()
        } catch (error) {
            const message = error.message || "Erro ao alterar item."
            toast.error(message)
            addLogLine(setLogs, message, "error")
        } finally {
            setActionLoading(false)
        }
    }

    const copyItem = async (item) => {
        const text = item.command || item.path || item.name

        try {
            await navigator.clipboard.writeText(text)
            toast.success("Caminho copiado!")
            addLogLine(setLogs, `Caminho copiado: ${item.name}`, "success")
        } catch {
            toast.error("Não foi possível copiar.")
        }
    }

    const openStartupFolder = async () => {
        try {
            await invoke({
                channel: "startup:open-folder",
            })

            addLogLine(setLogs, "Pasta Inicializar aberta.", "success")
        } catch {
            toast.error("Não foi possível abrir a pasta.")
        }
    }

    const copyLogs = async () => {
        if (logs.length === 0) {
            toast.info("Nenhum log para copiar.")
            return
        }

        try {
            await navigator.clipboard.writeText(
                logs.map((l) => `[${l.time}] ${l.text}`).join("\n")
            )

            toast.success("Logs copiados!")
        } catch {
            toast.error("Não foi possível copiar os logs.")
        }
    }

    return (
        <RootDiv>
            <div className="mx-auto max-w-[1900px] space-y-8 px-6 pb-16">
                <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />

                    <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-4xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300">
                                <Sparkles size={15} />
                                Gerenciador de inicialização
                            </div>

                            <div className="flex flex-col gap-5 md:flex-row md:items-start">
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/15 p-4 shadow-lg shadow-blue-500/10">
                                    <MonitorCog className="text-blue-400" size={34} />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold leading-tight text-maxify-text md:text-4xl">
                                        Inicialização do Windows
                                    </h1>

                                    <p className="mt-3 max-w-3xl text-maxify-text-secondary">
                                        Controle quais programas abrem junto com o Windows,
                                        reduza o tempo de boot e deixe o sistema mais limpo.
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            {stats.total} itens detectados
                                        </div>

                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            {stats.active} ativos
                                        </div>

                                        <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary">
                                            Impacto {stats.impact}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="rounded-[24px] border border-maxify-border bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-6 xl:min-w-[420px]">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Impacto estimado
                                    </p>

                                    <h2 className="mt-1 text-4xl font-bold text-cyan-300">
                                        {loading ? "..." : stats.impact}
                                    </h2>
                                </div>

                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-400">
                                    {loading ? (
                                        <RefreshCw size={30} className="animate-spin" />
                                    ) : (
                                        <Gauge size={30} />
                                    )}
                                </div>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-maxify-border/40">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                    animate={{
                                        width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%`,
                                    }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button
                                    onClick={loadItems}
                                    disabled={loading || actionLoading}
                                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl !bg-blue-500 text-white"
                                >
                                    <RefreshCw
                                        size={18}
                                        className={loading ? "animate-spin" : ""}
                                    />
                                    Atualizar lista
                                </Button>

                                <Button
                                    onClick={openStartupFolder}
                                    variant="outline"
                                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl"
                                >
                                    <FolderOpen size={18} />
                                    Abrir pasta Inicializar
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<Layers size={22} />}
                        label="Total"
                        value={stats.total}
                        helper="Itens encontrados"
                    />

                    <StatCard
                        icon={<CheckCircle2 size={22} />}
                        label="Ativos"
                        value={stats.active}
                        helper="Abrem com o Windows"
                    />

                    <StatCard
                        icon={<XCircle size={22} />}
                        label="Desativados"
                        value={stats.disabled}
                        helper="Bloqueados pelo Maxify"
                    />

                    <StatCard
                        icon={<Zap size={22} />}
                        label="Impacto"
                        value={stats.impact}
                        helper="Baseado em itens ativos"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.55fr]">
                    <Card className="rounded-[26px] border border-maxify-border bg-maxify-card p-6">
                        <div className="mb-6 space-y-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                                        <MonitorCog className="text-blue-400" size={24} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-maxify-text">
                                            Programas detectados
                                        </h2>
                                        <p className="text-sm text-maxify-text-secondary">
                                            Ative ou desative itens de inicialização
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative flex-1">
                                    <Search
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar por nome, caminho ou origem..."
                                        className="
                                            w-full rounded-xl border border-maxify-border bg-maxify-border/10
                                            py-3 pl-12 pr-4 text-maxify-text outline-none transition
                                            placeholder:text-maxify-text-secondary/50
                                            focus:border-blue-500/50 focus:bg-blue-500/10
                                        "
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <FilterButton
                                        active={filter === "all"}
                                        label="Todos"
                                        onClick={() => setFilter("all")}
                                    />

                                    <FilterButton
                                        active={filter === "active"}
                                        label="Ativos"
                                        onClick={() => setFilter("active")}
                                    />

                                    <FilterButton
                                        active={filter === "disabled"}
                                        label="Desativados"
                                        onClick={() => setFilter("disabled")}
                                    />

                                    <FilterButton
                                        active={filter === "registry"}
                                        label="Registro"
                                        onClick={() => setFilter("registry")}
                                    />

                                    <FilterButton
                                        active={filter === "folder"}
                                        label="Pasta"
                                        onClick={() => setFilter("folder")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[720px] overflow-y-auto pr-2 custom-startup-scroll">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="animate-pulse rounded-2xl border border-maxify-border bg-maxify-border/10 p-5"
                                        >
                                            <div className="mb-4 h-5 w-1/3 rounded-lg bg-blue-500/20" />
                                            <div className="mb-3 h-4 w-2/3 rounded-lg bg-blue-500/10" />
                                            <div className="h-10 w-full rounded-xl bg-blue-500/10" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredItems.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    <div className="space-y-4">
                                        {filteredItems.map((item, index) => (
                                            <StartupItem
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                loading={actionLoading}
                                                onToggle={toggleItem}
                                                onCopy={copyItem}
                                            />
                                        ))}
                                    </div>
                                </AnimatePresence>
                            ) : (
                                <EmptyState search={search} />
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                                        <Activity className="text-blue-400" size={24} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-maxify-text">
                                            Histórico
                                        </h2>
                                        <p className="text-sm text-maxify-text-secondary">
                                            Ações desta sessão
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <LogsPanel logs={logs} />

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Button
                                    onClick={copyLogs}
                                    variant="outline"
                                    className="flex items-center justify-center gap-2 rounded-xl"
                                >
                                    <Copy size={16} />
                                    Copiar
                                </Button>

                                <Button
                                    onClick={() => setLogs([])}
                                    variant="outline"
                                    className="flex items-center justify-center gap-2 rounded-xl"
                                >
                                    <Trash2 size={16} />
                                    Limpar
                                </Button>
                            </div>
                        </Card>

                        <Card className="rounded-[26px] border border-maxify-border bg-maxify-card p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <ShieldCheck className="text-blue-400" size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">
                                        Recomendações
                                    </h2>
                                    <p className="text-sm text-maxify-text-secondary">
                                        Para evitar problemas
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <FileCog size={18} className="mt-0.5 text-blue-400" />
                                        <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                            Desative launchers, atualizadores e apps que você não usa no boot.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={18} className="mt-0.5 text-yellow-400" />
                                        <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                            Evite desativar antivírus, drivers, áudio e serviços importantes.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className="mt-0.5 text-green-400" />
                                        <p className="text-sm leading-relaxed text-maxify-text-secondary">
                                            Os itens desativados ficam com backup para restauração.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RootDiv>
    )
}