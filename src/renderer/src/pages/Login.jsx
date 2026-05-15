import { useState, useEffect, useRef } from "react"
import { MotionConfig, motion, AnimatePresence } from "framer-motion"
import {
    Shield,
    Zap,
    Key,
    Eye,
    EyeOff,
    ChevronsLeftRightEllipsis,
    BrainCircuit,
    Check,
    MessageCircle,
    X,
    ClipboardPaste,
    ClipboardCopy,
    Eraser,
    MousePointerClick,
    Crown,
    LockKeyholeOpen,
    Gift,
} from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/button"
import LoginIcon from "../../../../resources/maxifylogo.png"
import jsonData from "../../../../package.json"
import { getDeviceID } from "../lib/device"
import { saveAuth } from "../lib/auth"
import { saveFreeAccess, savePremiumAccess } from "../lib/access"

const DISCORD_INVITE_URL = "https://discord.gg/45zyQEe2s3"

export default function Login({ onLogin }) {
    const inputKeyRef = useRef(null)

    const [contextMenu, setContextMenu] = useState({
        open: false,
        x: 0,
        y: 0,
    })

    const [key, setKey] = useState("")
    const [loading, setLoading] = useState(false)
    const [pulse, setPulse] = useState(false)
    const [animando, setAnimando] = useState(false)
    const [erroAnim, setErroAnim] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [floatingIcons, setFloatingIcons] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    const [rememberKey, setRememberKey] = useState(false)
    const [loadingSavedKey, setLoadingSavedKey] = useState(true)
    const [showDiscordModal, setShowDiscordModal] = useState(false)

    const closeContextMenu = () => {
        setContextMenu({
            open: false,
            x: 0,
            y: 0,
        })
    }

    const handleKeyContextMenu = (e) => {
        e.preventDefault()

        if (loading || loadingSavedKey) return

        setContextMenu({
            open: true,
            x: Math.min(e.clientX, window.innerWidth - 235),
            y: Math.min(e.clientY, window.innerHeight - 265),
        })

        setTimeout(() => {
            inputKeyRef.current?.focus()
        }, 10)
    }

    const inserirTextoNaKey = (texto) => {
        const input = inputKeyRef.current

        if (!input) {
            handleKeyChange(texto)
            return
        }

        const start = input.selectionStart ?? key.length
        const end = input.selectionEnd ?? key.length

        const novaKey = key.slice(0, start) + texto + key.slice(end)

        handleKeyChange(novaKey)

        setTimeout(() => {
            input.focus()
            const pos = start + texto.length
            input.setSelectionRange(pos, pos)
        }, 0)
    }

    const colarKey = async () => {
        try {
            const texto = await navigator.clipboard.readText()

            if (!texto.trim()) {
                return falha("Área de transferência vazia.")
            }

            inserirTextoNaKey(texto.trim())
            closeContextMenu()
        } catch (error) {
            console.error("Erro ao colar:", error)
            falha("Não foi possível colar a key.")
            closeContextMenu()
        }
    }

    const copiarKey = async () => {
        try {
            if (!key.trim()) {
                return falha("Nenhuma key para copiar.")
            }

            await navigator.clipboard.writeText(key.trim())
            closeContextMenu()
        } catch (error) {
            console.error("Erro ao copiar:", error)
            falha("Não foi possível copiar a key.")
            closeContextMenu()
        }
    }

    const limparKey = async () => {
        await handleKeyChange("")
        closeContextMenu()

        setTimeout(() => {
            inputKeyRef.current?.focus()
        }, 0)
    }

    useEffect(() => {
        const handleClick = () => closeContextMenu()

        const handleEsc = (e) => {
            if (e.key === "Escape") closeContextMenu()
        }

        window.addEventListener("click", handleClick)
        window.addEventListener("keydown", handleEsc)
        window.addEventListener("blur", closeContextMenu)

        return () => {
            window.removeEventListener("click", handleClick)
            window.removeEventListener("keydown", handleEsc)
            window.removeEventListener("blur", closeContextMenu)
        }
    }, [])

    useEffect(() => {
        setFloatingIcons([
            { id: 1, icon: Shield, x: 5, y: 15, delay: 0 },
            { id: 2, icon: Zap, x: 88, y: 50, delay: 0.5 },
            { id: 3, icon: Key, x: 10, y: 86, delay: 1 },
            { id: 4, icon: ChevronsLeftRightEllipsis, x: 82, y: 20, delay: 1.5 },
            { id: 5, icon: BrainCircuit, x: 0, y: 58, delay: 1.5 },
        ])
    }, [])

    useEffect(() => {
        async function loadSavedKey() {
            try {
                if (window.electron?.auth?.getSavedKey) {
                    const saved = await window.electron.auth.getSavedKey()

                    if (saved?.remember) {
                        setRememberKey(true)

                        if (saved?.key) {
                            setKey(saved.key)
                        }
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar key salva:", error)
            } finally {
                setLoadingSavedKey(false)
            }
        }

        loadSavedKey()
    }, [])

    async function salvarKeySeNecessario(currentKey, currentRemember) {
        try {
            if (!window.electron?.auth) return

            if (currentRemember && currentKey.trim()) {
                await window.electron.auth.saveKey(currentKey.trim())
            } else {
                await window.electron.auth.clearSavedKey()
            }
        } catch (error) {
            console.error("Erro ao salvar/apagar key:", error)
        }
    }

    function falha(msg) {
        setErrorMessage(msg)
        setErroAnim(true)
        setLoading(false)
        setPulse(false)
    }

    function sucesso() {
        setAnimando(true)
        setLoading(false)
        setPulse(false)
        setTimeout(() => {
            onLogin()
        }, 2000)
    }

    async function verificarKey() {
        if (loading) return

        setLoading(true)
        setPulse(true)
        setErrorMessage("")

        try {
            const cleanKey = key.trim()

            if (!cleanKey) {
                return falha("Por favor, digite uma key.")
            }

            const deviceID = await getDeviceID()

            if (!window.electron?.auth?.login) {
                throw new Error("Sistema de autenticação não encontrado no preload.")
            }

            const result = await window.electron.auth.login({
                key: cleanKey,
                hwid: deviceID,
            })

            if (!result?.success) {
                throw new Error(result?.error || "Key inválida.")
            }

            await salvarKeySeNecessario(cleanKey, rememberKey)

            sessionStorage.setItem("maxify:current-key", cleanKey)
            localStorage.setItem("userKey", cleanKey)
            localStorage.setItem("maxify:key", cleanKey)

            const normalKey = cleanKey.toUpperCase()

            let plan = "Lifetime"

            if (normalKey.includes("SEMANAL")) {
                plan = "Semanal"
            } else if (normalKey.includes("MENSAL")) {
                plan = "Mensal"
            }

            localStorage.setItem("maxify:plan", result?.plan || plan)

            saveAuth({ ...result, plan: result?.plan || plan })
            savePremiumAccess({ plan: result?.plan || plan })

            sucesso()
        } catch (err) {
            console.error("Erro ao verificar key:", err)
            falha(err.message || "Erro ao conectar com o servidor.")
        }
    }

    async function entrarModoFree() {
        if (loading) return

        setLoading(true)
        setPulse(true)
        setErrorMessage("")

        try {
            if (window.electron?.auth?.loginFree) {
                const result = await window.electron.auth.loginFree()

                if (!result?.success) {
                    throw new Error(result?.error || "Não foi possível entrar no modo grátis.")
                }
            }

            await salvarKeySeNecessario("", false)
            saveFreeAccess()
            sucesso()
        } catch (err) {
            console.error("Erro ao entrar no Free:", err)
            falha(err.message || "Erro ao liberar modo grátis.")
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!key.trim()) {
            return falha("Por favor, digite uma key.")
        }

        await verificarKey()
    }

    const handleRememberChange = async (checked) => {
        setRememberKey(checked)

        try {
            if (!window.electron?.auth) return

            if (checked && key.trim()) {
                await window.electron.auth.saveKey(key.trim())
            } else {
                await window.electron.auth.clearSavedKey()
            }
        } catch (error) {
            console.error("Erro ao alterar lembrar key:", error)
        }
    }

    const handleKeyChange = async (value) => {
        setKey(value)

        if (!rememberKey) return

        try {
            if (window.electron?.auth?.saveKey) {
                if (value.trim()) {
                    await window.electron.auth.saveKey(value.trim())
                } else {
                    await window.electron.auth.clearSavedKey()
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar key salva:", error)
        }
    }

    const openDiscord = () => {
        window.open(DISCORD_INVITE_URL, "_blank")
    }

    const handleDiscordClick = () => {
        setShowDiscordModal(true)

        setTimeout(() => {
            openDiscord()
            setShowDiscordModal(false)
        }, 1200)
    }

    useEffect(() => {
        if (erroAnim) {
            const timer = setTimeout(() => {
                setErroAnim(false)
                setErrorMessage("")
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [erroAnim])

    return (
        <MotionConfig transition={{ duration: 0.55, ease: "easeInOut" }}>
            <div className="relative h-full w-full overflow-hidden bg-maxify-bg">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[...Array(16)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-1 w-1 rounded-full bg-maxify-text-secondary opacity-40"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            animate={{
                                y: [null, -20, 0],
                                opacity: [0.25, 0.75, 0.25],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-maxify-border/20 blur-3xl"
                        animate={{
                            x: [0, 80, 0],
                            y: [0, 45, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div
                        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-maxify-border/10 blur-3xl"
                        animate={{
                            x: [0, -80, 0],
                            y: [0, -45, 0],
                            scale: [1, 1.25, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.35 }}
                    className="fixed bottom-4 right-4 z-40 hidden xl:block"
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="w-[235px] rounded-2xl border border-maxify-border bg-maxify-card/95 p-4 shadow-lg backdrop-blur-xl">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-maxify-border/30">
                                    <MessageCircle size={17} className="text-blue-400" />
                                </div>

                                <div className="min-w-0 flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-maxify-text">
                                        Precisa de uma key?
                                    </span>

                                    <span className="text-xs leading-snug text-maxify-text-secondary">
                                        Entre no Discord e ative seu acesso
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleDiscordClick}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-3 flex w-full items-center justify-between rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2.5 transition-all hover:bg-maxify-border/30"
                            >
                                <span className="text-sm font-medium text-maxify-text">
                                    Ir para o Discord
                                </span>

                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="text-blue-400"
                                >
                                    →
                                </motion.span>
                            </motion.button>
                        </Card>
                    </motion.div>
                </motion.div>

                <AnimatePresence>
                    {showDiscordModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowDiscordModal(false)}
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 14 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 14 }}
                                className="fixed left-1/2 top-1/2 z-[9999] w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-maxify-border-secondary bg-gradient-to-br from-maxify-bg to-maxify-card p-6 shadow-2xl"
                            >
                                <div className="text-center">
                                    <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#5865F2] to-[#3f4ed6]">
                                        <MessageCircle size={30} className="text-white" />
                                    </div>

                                    <h3 className="mb-2 text-xl font-bold text-maxify-text">
                                        Redirecionando para o Discord
                                    </h3>

                                    <p className="mb-5 text-sm text-maxify-text-secondary">
                                        Você será levado para o servidor oficial.
                                    </p>

                                    <button
                                        onClick={openDiscord}
                                        className="text-sm font-medium text-[#5865F2] hover:underline"
                                    >
                                        discord.gg/45zyQEe2s3
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowDiscordModal(false)}
                                    className="absolute right-4 top-4 text-maxify-text-secondary transition-colors hover:text-maxify-text"
                                >
                                    <X size={20} />
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {contextMenu.open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 8 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="fixed z-[10000] w-[220px] overflow-hidden rounded-2xl border border-maxify-border bg-maxify-card/95 p-2 shadow-2xl shadow-blue-500/20 backdrop-blur-xl"
                            style={{
                                left: contextMenu.x,
                                top: contextMenu.y,
                            }}
                        >
                            <div className="mb-1 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                                    <MousePointerClick size={14} />
                                    Ações da key
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={colarKey}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-maxify-text transition-all hover:bg-blue-500/15"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                                    <ClipboardPaste size={16} />
                                </div>

                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">Colar</span>
                                    <span className="text-[11px] text-maxify-text-secondary">
                                        Colar key copiada
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={copiarKey}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-maxify-text transition-all hover:bg-blue-500/15"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-maxify-border/30 text-blue-300">
                                    <ClipboardCopy size={16} />
                                </div>

                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">Copiar</span>
                                    <span className="text-[11px] text-maxify-text-secondary">
                                        Copiar key digitada
                                    </span>
                                </div>
                            </button>

                            <div className="my-1 h-px bg-maxify-border/50" />

                            <button
                                type="button"
                                onClick={limparKey}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300 transition-all hover:bg-red-500/15"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
                                    <Eraser size={16} />
                                </div>

                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">Limpar</span>
                                    <span className="text-[11px] text-maxify-text-secondary">
                                        Apagar campo da key
                                    </span>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {erroAnim && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9990] bg-black/80"
                            />

                            <motion.div
                                className="fixed left-1/2 top-1/2 z-[9999] text-center font-bold text-red-500"
                                initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45 }}
                                style={{
                                    fontSize: "clamp(76px, 12vw, 110px)",
                                    textShadow: "0 0 30px rgba(255,0,0,0.8)",
                                }}
                            >
                                ✖

                                {errorMessage && (
                                    <motion.div
                                        className="mt-3 max-w-xs text-base font-normal text-white"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {animando && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.75 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9990] bg-black"
                            />

                            <motion.img
                                src={LoginIcon}
                                className="fixed left-1/2 top-1/2 z-[9999] h-28 w-28"
                                initial={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                                animate={{
                                    scale: [1, 1.25, 2.3, 0],
                                    rotate: [0, 90, 360],
                                    opacity: [1, 1, 0.3, 0],
                                }}
                                transition={{ duration: 2.3 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                <div className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden px-4 py-3">
                    <motion.div
                        className="mx-auto flex min-h-full w-full max-w-[825px] items-center justify-center"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="relative w-full max-w-[430px] py-2">
                            {floatingIcons.map((item) => {
                                const IconComponent = item.icon

                                return (
                                    <motion.div
                                        key={item.id}
                                        className="pointer-events-none absolute text-maxify-text-secondary/25"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: item.delay, duration: 0.4 }}
                                        style={{
                                            left: `${item.x}%`,
                                            top: `${item.y}%`,
                                        }}
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -8, 0],
                                                rotate: [0, 5, 0],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: item.delay,
                                            }}
                                        >
                                            <IconComponent size={22} />
                                        </motion.div>
                                    </motion.div>
                                )
                            })}

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className="mb-5 text-center">
                                    <motion.div
                                        animate={pulse ? { scale: [1, 1.08, 1] } : {}}
                                        transition={{ duration: 0.6 }}
                                        className="mb-3 flex items-center justify-center"
                                    >
                                        <motion.div
                                            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-maxify-border bg-maxify-card shadow-lg"
                                            whileHover={{ scale: 1.05, rotate: 4 }}
                                        >
                                            <img src={LoginIcon} className="h-10 w-10" alt="Logo" />
                                        </motion.div>
                                    </motion.div>

                                    <motion.h1
                                        className="mb-1 text-3xl font-bold text-maxify-text"
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        Maxify
                                    </motion.h1>

                                    <motion.p
                                        className="text-sm text-maxify-text-secondary"
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Acesso Premium ou modo Free
                                    </motion.p>
                                </div>

                                <Card className="rounded-2xl border border-maxify-border bg-maxify-card/95 p-5 shadow-lg shadow-maxify-border/30 backdrop-blur-xl">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-maxify-text-secondary">
                                                <Key size={15} />
                                                Chave de Acesso
                                            </label>

                                            <div className="relative">
                                                <input
                                                    ref={inputKeyRef}
                                                    type={showPassword ? "text" : "password"}
                                                    value={key}
                                                    onChange={(e) => handleKeyChange(e.target.value)}
                                                    onContextMenu={handleKeyContextMenu}
                                                    placeholder={
                                                        loadingSavedKey
                                                            ? "Carregando key salva..."
                                                            : "Digite sua chave de acesso"
                                                    }
                                                    className="w-full rounded-xl border border-maxify-border bg-maxify-border/20 p-3.5 pr-12 text-sm text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary hover:border-blue-400 hover:bg-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                                                    required
                                                    disabled={loading || loadingSavedKey}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-maxify-text-secondary transition-colors hover:text-maxify-text"
                                                    disabled={loading || loadingSavedKey}
                                                >
                                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                                </button>
                                            </div>
                                        </div>

                                        <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-maxify-border/40 bg-maxify-border/10 px-3.5 py-3 transition-all hover:bg-maxify-border/20">
                                            <input
                                                type="checkbox"
                                                checked={rememberKey}
                                                onChange={(e) => handleRememberChange(e.target.checked)}
                                                className="sr-only"
                                                disabled={loading || loadingSavedKey}
                                            />

                                            <div
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${rememberKey
                                                        ? "border-blue-500 bg-blue-500 text-white"
                                                        : "border-maxify-border bg-transparent text-transparent"
                                                    }`}
                                            >
                                                <Check size={14} />
                                            </div>

                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-sm font-medium text-maxify-text">
                                                    Lembrar key neste computador
                                                </span>
                                                <span className="text-xs text-maxify-text-secondary/70">
                                                    Salva a key automaticamente
                                                </span>
                                            </div>
                                        </label>

                                        <motion.div
                                            whileHover={{ scale: loading ? 1 : 1.01 }}
                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                        >
                                            <Button
                                                type="submit"
                                                disabled={loading || loadingSavedKey}
                                                className="flex w-full items-center justify-center gap-3 rounded-xl !bg-gradient-to-r from-blue-500 to-blue-600 py-3.5 text-base font-semibold !text-white shadow-md shadow-blue-500/30 transition-all duration-300 hover:!bg-gradient-to-l hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: "linear",
                                                            }}
                                                            className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                                                        />
                                                        Verificando acesso...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Crown size={19} />
                                                        <span>Entrar com Key Premium</span>
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-maxify-border/70" />
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-maxify-text-secondary/70">
                                                ou
                                            </span>
                                            <div className="h-px flex-1 bg-maxify-border/70" />
                                        </div>

                                        <motion.button
                                            type="button"
                                            onClick={entrarModoFree}
                                            disabled={loading || loadingSavedKey}
                                            whileHover={{ scale: loading ? 1 : 1.01 }}
                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                            className="w-full rounded-xl border border-green-400/25 bg-green-500/10 px-3.5 py-3 text-left transition-all hover:border-green-300/40 hover:bg-green-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-green-400/25 bg-green-400/10 text-green-300">
                                                        <Gift size={19} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-maxify-text">
                                                            Entrar no modo Free
                                                        </div>
                                                        <div className="mt-0.5 text-xs leading-snug text-maxify-text-secondary">
                                                            Limpeza, memória ram e prioridade de jogos liberados
                                                        </div>
                                                    </div>
                                                </div>
                                                <LockKeyholeOpen size={18} className="shrink-0 text-green-300/80" />
                                            </div>
                                        </motion.button>

                                        <button
                                            type="button"
                                            onClick={handleDiscordClick}
                                            disabled={loading || loadingSavedKey}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-maxify-border/50 bg-maxify-border/10 px-4 py-3 text-sm font-medium text-maxify-text transition-all hover:bg-maxify-border/20 xl:hidden"
                                        >
                                            <MessageCircle size={17} className="text-blue-400" />
                                            Precisa de uma key? Entrar no Discord
                                        </button>
                                    </form>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="text-xs text-maxify-text-secondary/60">
                                        v{jsonData.version || "2.1.0"} • Piolho OptimizeX
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </MotionConfig>
    )
}