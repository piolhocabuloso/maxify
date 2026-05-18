import { useEffect, useMemo, useState } from "react"
import RootDiv from "@/components/rootdiv"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { notify as toast } from "../lib/notify"
import {
    User,
    ShieldCheck,
    KeyRound,
    Monitor,
    Cpu,
    HardDrive,
    CalendarDays,
    Crown,
    Copy,
    LogOut,
    RefreshCw,
    Sparkles,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Fingerprint,
    Lock,
    Mail,
    BadgeCheck,
    Server,
    Clock,
    ChevronRight,
    Gamepad2,
    Wifi,
} from "lucide-react"
import jsonData from "../../../../package.json"

const safeGet = (key, fallback = "") => {
    try {
        return localStorage.getItem(key) || fallback
    } catch {
        return fallback
    }
}

function detectarPlanoPelaKey(key) {
    const normalizada = String(key || "")
        .trim()
        .toUpperCase()
        .replaceAll("_", "-")

    if (normalizada.includes("SEMANAL")) return "Semanal"
    if (normalizada.includes("MENSAL")) return "Mensal"

    return "Lifetime"
}

function maskKey(key) {
    if (!key) return "Nenhuma key salva"
    if (key.length <= 12) return key
    return `${key.slice(0, 8)}••••••••${key.slice(-6)}`
}

const BackgroundGlow = () => {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
        </>
    )
}

function SectionTitle({ icon: Icon, label, title }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <Icon className="h-5 w-5 text-blue-300" />
            </div>

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                    {label}
                </p>
                <h2 className="text-lg font-black text-maxify-text">{title}</h2>
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
        </div>
    )
}

function InfoCard({ icon, title, value, subtitle }) {
    return (
        <div className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-3 text-blue-300">
                        {icon}
                    </div>

                    <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
                        {title}
                    </p>
                    <h3 className="truncate text-2xl font-black text-maxify-text">{value}</h3>
                    {subtitle && (
                        <p className="text-xs leading-5 text-maxify-text-secondary/85">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function ActionButton({ icon, title, description, onClick, danger = false }) {
    return (
        <button
            onClick={onClick}
            className={`group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[24px] border p-4 text-left shadow-xl shadow-black/5 transition-all hover:-translate-y-1 ${danger
                    ? "border-red-500/25 bg-red-500/10 hover:bg-red-500/15"
                    : "border-maxify-border bg-maxify-card hover:border-blue-500/25"
                }`}
        >
            {!danger && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_50%)] opacity-0 transition-opacity group-hover:opacity-100" />
            )}

            <div className="relative z-10 flex min-w-0 items-center gap-3">
                <div
                    className={`rounded-[20px] border p-3 ${danger
                            ? "border-red-500/25 bg-red-500/10 text-red-400"
                            : "border-blue-500/25 bg-blue-500/10 text-blue-300"
                        }`}
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <h3 className="font-black text-maxify-text">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-maxify-text-secondary">{description}</p>
                </div>
            </div>

            <ChevronRight
                size={18}
                className={`relative z-10 shrink-0 transition-transform group-hover:translate-x-1 ${danger ? "text-red-400" : "text-blue-300"
                    }`}
            />
        </button>
    )
}

function SecurityItem({ icon, title, description, active = true }) {
    return (
        <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-4 transition-all hover:border-blue-500/25 hover:bg-blue-500/5">
            <div className="flex items-start gap-3">
                <div
                    className={`rounded-2xl border p-2.5 ${active
                            ? "border-blue-500/25 bg-blue-500/10 text-blue-300"
                            : "border-yellow-500/25 bg-yellow-500/10 text-yellow-300"
                        }`}
                >
                    {icon}
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-maxify-text">{title}</h3>

                        <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${active
                                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                                }`}
                        >
                            {active ? "Ativo" : "Atenção"}
                        </span>
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-maxify-text-secondary">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function Conta() {
    const [loading, setLoading] = useState(true)
    const [discordUser, setDiscordUser] = useState(null)

    const [account, setAccount] = useState({
        username: "Usuário Maxify",
        email: "Não informado",
        key: "",
        hwid: "Carregando...",
        version: "Carregando...",
        plan: "Lifetime",
        status: "Ativo",
        createdAt: "Hoje",
        lastLogin: "Agora",
    })

    const visibleKey = useMemo(() => maskKey(account.key), [account.key])

    const displayName = useMemo(() => {
        return discordUser?.tag || discordUser?.username || account.username
    }, [discordUser, account.username])

    const avatarURL = discordUser?.avatarURL || null

    useEffect(() => {
        let mounted = true
        let removeDiscordListener = null

        async function loadAccount() {
            setLoading(true)

            try {
                const accessMode = safeGet("maxify:access-mode")

                let savedKey =
                    accessMode === "free"
                        ? "FREE-ACCESS"
                        : sessionStorage.getItem("maxify:current-key") ||
                        safeGet("userKey") ||
                        safeGet("maxify:key") ||
                        safeGet("sparkle:key") ||
                        safeGet("auth:key")

                if (!savedKey && window.electron?.auth?.getSavedKey) {
                    try {
                        const saved = await window.electron.auth.getSavedKey()
                        if (saved?.key) savedKey = saved.key
                    } catch (error) {
                        console.warn("Não foi possível buscar key salva:", error)
                    }
                }

                const savedPlan =
                    accessMode === "free"
                        ? "Free"
                        : safeGet("maxify:plan") || detectarPlanoPelaKey(savedKey)

                const savedUser =
                    safeGet("sparkle:user") ||
                    safeGet("username") ||
                    safeGet("maxify:user") ||
                    "Usuário Maxify"

                let hwid = "Não disponível"
                let currentDiscordUser = null
                const version = jsonData.version || "Não identificada"

                try {
                    const result = await invoke({ channel: "get-hwid" })
                    hwid = typeof result === "string" ? result : result?.hwid || result?.id || "Não disponível"
                } catch {
                    hwid = "Não disponível"
                }

                try {
                    currentDiscordUser = await invoke({ channel: "get-discord-user" })
                } catch {
                    currentDiscordUser = null
                }

                if (!mounted) return

                setDiscordUser(currentDiscordUser || null)

                setAccount((prev) => ({
                    ...prev,
                    username: savedUser,
                    key: savedKey,
                    hwid,
                    version,
                    plan: savedPlan,
                    lastLogin: new Date().toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }))
            } catch {
                toast.error("Não foi possível carregar os dados da conta.")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadAccount()

        if (window.electron?.on) {
            removeDiscordListener = window.electron.on("discord-user-updated", (user) => {
                setDiscordUser(user || null)
            })
        }

        return () => {
            mounted = false
            if (typeof removeDiscordListener === "function") removeDiscordListener()
        }
    }, [])

    const copyKey = async () => {
        if (!account.key) {
            toast.info("Nenhuma key encontrada para copiar.")
            return
        }

        try {
            await navigator.clipboard.writeText(account.key)
            toast.success("Key copiada com sucesso!")
        } catch {
            toast.error("Não foi possível copiar a key.")
        }
    }

    const copyHwid = async () => {
        if (!account.hwid || account.hwid === "Não disponível") {
            toast.info("HWID não disponível.")
            return
        }

        try {
            await navigator.clipboard.writeText(account.hwid)
            toast.success("HWID copiado com sucesso!")
        } catch {
            toast.error("Não foi possível copiar o HWID.")
        }
    }

    const copyDiscordId = async () => {
        if (!discordUser?.id) {
            toast.info("Discord não conectado.")
            return
        }

        try {
            await navigator.clipboard.writeText(discordUser.id)
            toast.success("ID do Discord copiado!")
        } catch {
            toast.error("Não foi possível copiar o ID.")
        }
    }

    const refreshAccount = () => {
        toast.info("Atualizando dados...")
        window.location.reload()
    }

    const logout = async () => {
        try {
            try {
                if (window.electron?.auth?.logout) await window.electron.auth.logout()
            } catch (err) {
                console.warn("[Conta] Erro no auth.logout:", err)
            }

            try {
                if (window.electron?.auth?.clearSavedKey) await window.electron.auth.clearSavedKey()
            } catch (err) {
                console.warn("[Conta] Erro no clearSavedKey:", err)
            }

            const keysToRemove = [
                "userKey",
                "maxify:key",
                "sparkle:key",
                "auth:key",
                "maxify:access-mode",
                "maxify:logged",
                "maxify:keyMasked",
                "maxify:expiresAt",
                "maxify:plan",
                "sparkle:user",
                "username",
                "maxify:user",
                "rememberKey",
                "savedKey",
                "isLogged",
                "logado",
                "auth",
                "token",
            ]

            keysToRemove.forEach((key) => {
                localStorage.removeItem(key)
                sessionStorage.removeItem(key)
            })

            localStorage.clear()
            sessionStorage.clear()

            toast.success("Conta desconectada com sucesso.")

            setTimeout(() => {
                window.dispatchEvent(new Event("maxify:logout"))
            }, 300)
        } catch (error) {
            console.error("[Conta] Erro ao sair da conta:", error)
            toast.error("Não foi possível sair da conta.")
        }
    }

    return (
        <RootDiv className="min-h-full w-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
                    <BackgroundGlow />

                    <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_420px] xl:items-center">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                                <Sparkles size={14} />
                                Central da Conta
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                                    <User className="text-blue-300" size={38} />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                                        Minha conta em{" "}
                                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                            modo {account.plan}
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                                        Gerencie sua licença, visualize os dados do dispositivo, copie sua key e acompanhe o status do Discord RPC em uma interface mais limpa.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Plano {account.plan}
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Versão {account.version}
                                        </div>

                                        <div
                                            className={`rounded-2xl border px-4 py-2 text-sm font-bold ${discordUser
                                                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                                                }`}
                                        >
                                            {discordUser ? "Discord conectado" : "Discord desconectado"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6 shadow-xl shadow-blue-500/10">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    {avatarURL ? (
                                        <img
                                            src={avatarURL}
                                            alt="Avatar Discord"
                                            className="h-20 w-20 rounded-[26px] border border-blue-500/30 object-cover shadow-xl shadow-blue-500/10"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-blue-500/30 bg-blue-500/10 text-3xl font-black text-blue-300">
                                            {displayName?.charAt(0)?.toUpperCase() || "M"}
                                        </div>
                                    )}

                                    <div className={`absolute -bottom-1 -right-1 rounded-full border border-maxify-card p-1.5 ${discordUser ? "bg-blue-500" : "bg-yellow-500"}`}>
                                        <CheckCircle2 size={14} className="text-white" />
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                                        Perfil
                                    </p>
                                    <h2 className="mt-1 truncate text-2xl font-black text-maxify-text">
                                        {displayName}
                                    </h2>

                                    <p className="mt-2 flex items-center gap-2 truncate text-sm text-maxify-text-secondary">
                                        <Mail size={14} />
                                        {discordUser ? `Discord ID: ${discordUser.id}` : account.email}
                                    </p>

                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                                        <BadgeCheck size={14} />
                                        {discordUser ? "Discord RPC ativo" : "Conta local"}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

                <section>
                    <SectionTitle icon={Activity} label="Resumo" title="Informações rápidas" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <InfoCard
                            icon={<Crown size={22} />}
                            title="Plano Atual"
                            value={account.plan}
                            subtitle="Licença ativa no dispositivo"
                        />

                        <InfoCard
                            icon={<KeyRound size={22} />}
                            title="Key de Ativação"
                            value={visibleKey}
                            subtitle="Sua chave está protegida"
                        />

                        <InfoCard
                            icon={<Gamepad2 size={22} />}
                            title="Discord RPC"
                            value={discordUser ? "Conectado" : "Desconectado"}
                            subtitle={discordUser ? discordUser.tag : "Abra o Discord e ative o RPC"}
                        />

                        <InfoCard
                            icon={<Clock size={22} />}
                            title="Último Login"
                            value={account.lastLogin}
                            subtitle="Sessão local do aplicativo"
                        />
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-6">
                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-3">
                                        <ShieldCheck className="text-blue-300" size={24} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                                            Licença
                                        </p>
                                        <h2 className="text-xl font-black text-maxify-text">Status da Licença</h2>
                                        <p className="text-sm text-maxify-text-secondary">Informações principais da sua ativação</p>
                                    </div>
                                </div>

                                <Button onClick={refreshAccount} variant="outline" className="flex items-center gap-2" disabled={loading}>
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    Atualizar
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-[24px] border border-maxify-border bg-maxify-bg/30 p-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm text-maxify-text-secondary">Status</p>
                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                                            Ativo
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black text-maxify-text">Licença validada</h3>

                                    <p className="mt-2 text-sm leading-relaxed text-maxify-text-secondary">
                                        Sua conta está liberada para usar os recursos do app neste dispositivo.
                                    </p>
                                </div>

                                <div className="rounded-[24px] border border-maxify-border bg-maxify-bg/30 p-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm text-maxify-text-secondary">Expiração</p>
                                        <CalendarDays size={18} className="text-blue-300" />
                                    </div>

                                    <h3 className="text-2xl font-black text-maxify-text">
                                        {account.plan === "Lifetime" ? "Sem expiração" : account.plan}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-maxify-text-secondary">
                                        {account.plan === "Lifetime"
                                            ? "Seu plano Lifetime não possui data de expiração."
                                            : `Plano identificado como ${account.plan}. A expiração depende da validade configurada na key.`}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <p className="mb-1 text-sm text-maxify-text-secondary">Key vinculada</p>
                                        <h3 className="truncate font-mono text-lg font-black text-blue-300">{visibleKey}</h3>
                                    </div>

                                    <Button onClick={copyKey} variant="outline" className="flex items-center gap-2">
                                        <Copy size={16} />
                                        Copiar Key
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-3">
                                        <Gamepad2 className="text-blue-300" size={24} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                                            Integração
                                        </p>
                                        <h2 className="text-xl font-black text-maxify-text">Discord RPC</h2>
                                        <p className="text-sm text-maxify-text-secondary">Informações detectadas pelo Discord</p>
                                    </div>
                                </div>

                                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${discordUser ? "border-blue-500/20 bg-blue-500/10 text-blue-300" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"}`}>
                                    {discordUser ? "RPC Ativo" : "Offline"}
                                </span>
                            </div>

                            {discordUser ? (
                                <div className="space-y-5">
                                    <div className="relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-blue-500/10 p-5">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)]" />

                                        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center">
                                            <div className="relative shrink-0">
                                                {discordUser.avatarURL ? (
                                                    <img
                                                        src={discordUser.avatarURL}
                                                        alt="Avatar Discord"
                                                        className="h-24 w-24 rounded-[28px] border border-blue-400/30 object-cover shadow-xl shadow-blue-500/10"
                                                    />
                                                ) : (
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                                        <User size={36} />
                                                    </div>
                                                )}

                                                <div className="absolute -bottom-1 -right-1 rounded-full border-4 border-maxify-card bg-blue-500 p-2 shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-2xl font-black text-maxify-text">{discordUser.tag}</h3>

                                                    <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-300">
                                                        Discord detectado
                                                    </span>
                                                </div>

                                                <p className="truncate text-sm text-maxify-text-secondary">Usuário: {discordUser.username}</p>
                                                <p className="mt-1 truncate text-sm text-maxify-text-secondary">ID: {discordUser.id}</p>
                                                <p className="mt-1 truncate text-sm text-blue-300">Menção: {discordUser.mention}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 md:flex-col">
                                                <Button onClick={copyDiscordId} variant="outline" className="flex items-center gap-2">
                                                    <Copy size={16} />
                                                    Copiar ID
                                                </Button>

                                                <Button
                                                    onClick={async () => {
                                                        if (!discordUser?.mention) return
                                                        await navigator.clipboard.writeText(discordUser.mention)
                                                        toast.success("Menção copiada!")
                                                    }}
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    <BadgeCheck size={16} />
                                                    Copiar menção
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="rounded-[22px] border border-blue-500/20 bg-blue-500/10 p-4">
                                            <Wifi className="mb-2 text-blue-300" size={20} />
                                            <p className="text-sm text-maxify-text-secondary">Conexão</p>
                                            <h3 className="font-black text-blue-300">Online</h3>
                                        </div>

                                        <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-4">
                                            <User className="mb-2 text-blue-300" size={20} />
                                            <p className="text-sm text-maxify-text-secondary">Usuário</p>
                                            <h3 className="truncate font-black text-maxify-text">{discordUser.username}</h3>
                                        </div>

                                        <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-4">
                                            <BadgeCheck className="mb-2 text-blue-300" size={20} />
                                            <p className="text-sm text-maxify-text-secondary">Tag</p>
                                            <h3 className="truncate font-black text-maxify-text">{discordUser.tag}</h3>
                                        </div>

                                        <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-4">
                                            <Monitor className="mb-2 text-blue-300" size={20} />
                                            <p className="text-sm text-maxify-text-secondary">Avatar</p>
                                            <h3 className="truncate font-black text-maxify-text">{discordUser.avatarURL ? "Detectado" : "Padrão"}</h3>
                                        </div>
                                    </div>

                                    <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="font-black text-maxify-text">Dados disponíveis via RPC</h3>
                                                <p className="mt-1 text-sm text-maxify-text-secondary">
                                                    O Discord RPC permite detectar apenas informações básicas da conta conectada.
                                                </p>
                                            </div>

                                            <Button onClick={() => window.open("https://discord.com/app", "_blank")} variant="outline">
                                                Abrir Discord
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-[22px] border border-yellow-500/20 bg-yellow-500/10 p-5">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={22} className="mt-0.5 text-yellow-400" />

                                        <div>
                                            <h3 className="font-black text-yellow-300">Discord não conectado</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-maxify-text-secondary">
                                                Abra o Discord no computador e ative o Discord RPC no app para aparecerem suas informações aqui.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <SectionTitle icon={Monitor} label="Dispositivo" title="Dispositivo vinculado" />

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-5">
                                    <Cpu className="mb-3 text-blue-300" size={22} />
                                    <p className="text-sm text-maxify-text-secondary">Sistema</p>
                                    <h3 className="mt-1 font-black text-maxify-text">Windows</h3>
                                </div>

                                <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-5">
                                    <HardDrive className="mb-3 text-blue-300" size={22} />
                                    <p className="text-sm text-maxify-text-secondary">App</p>
                                    <h3 className="mt-1 font-black text-maxify-text">Maxify {account.version}</h3>
                                </div>

                                <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/30 p-5">
                                    <Server className="mb-3 text-blue-300" size={22} />
                                    <p className="text-sm text-maxify-text-secondary">Servidor</p>
                                    <h3 className="mt-1 font-black text-blue-300">Online</h3>
                                </div>
                            </div>

                            <div className="mt-5 rounded-[24px] border border-maxify-border bg-maxify-bg/30 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <p className="mb-1 flex items-center gap-2 text-sm text-maxify-text-secondary">
                                            <Fingerprint size={15} />
                                            HWID do dispositivo
                                        </p>

                                        <h3 className="truncate font-mono text-sm font-black text-maxify-text">{account.hwid}</h3>
                                    </div>

                                    <Button onClick={copyHwid} variant="outline" className="flex items-center gap-2">
                                        <Copy size={16} />
                                        Copiar HWID
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <SectionTitle icon={Activity} label="Conta" title="Ações rápidas" />

                            <div className="space-y-3">
                                <ActionButton
                                    icon={<Gamepad2 size={18} />}
                                    title="Abrir Discord"
                                    description="Entrar no servidor oficial do Maxify."
                                    onClick={() => window.open("https://discord.gg/45zyQEe2s3", "_blank")}
                                />

                                <ActionButton
                                    icon={<Copy size={18} />}
                                    title="Copiar key"
                                    description="Copie sua key de ativação."
                                    onClick={copyKey}
                                />

                                <ActionButton
                                    icon={<LogOut size={18} />}
                                    title="Sair da conta"
                                    description="Remove a key salva neste dispositivo."
                                    onClick={logout}
                                    danger
                                />
                            </div>
                        </Card>

                        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                            <SectionTitle icon={Lock} label="Proteção" title="Segurança" />

                            <div className="space-y-3">
                                <SecurityItem
                                    icon={<ShieldCheck size={18} />}
                                    title="Key protegida"
                                    description="A key é exibida parcialmente para evitar exposição visual."
                                    active
                                />

                                <SecurityItem
                                    icon={<KeyRound size={18} />}
                                    title="Não compartilhe sua key"
                                    description="Sua key está vinculada ao seu dispositivo e não deve ser enviada para outras pessoas."
                                    active={false}
                                />

                                <SecurityItem
                                    icon={<Fingerprint size={18} />}
                                    title="Vínculo por HWID"
                                    description="A ativação pode ser vinculada ao dispositivo atual."
                                    active
                                />

                                <SecurityItem
                                    icon={<Gamepad2 size={18} />}
                                    title="Discord RPC"
                                    description={discordUser ? "O Discord está conectado e enviando dados básicos." : "O Discord não está conectado no momento."}
                                    active={!!discordUser}
                                />

                                <SecurityItem
                                    icon={<AlertTriangle size={18} />}
                                    title="Troca de PC"
                                    description="Formatar ou trocar peças pode alterar o HWID."
                                    active={false}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RootDiv>
    )
}
