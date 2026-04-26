import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"
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
} from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/button"
import LoginIcon from "../../../../resources/maxifylogo.png"
import jsonData from "../../../../package.json"
import { supabase } from "../lib/supabase"
import { getDeviceID, getDeviceSource } from "../lib/device"

const DISCORD_INVITE_URL = "https://discord.gg/45zyQEe2s3"

export default function Login({ onLogin }) {
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

    useEffect(() => {
        const icons = [
            { id: 1, icon: Shield, x: 10, y: 20, delay: 0 },
            { id: 2, icon: Zap, x: 85, y: 60, delay: 0.5 },
            { id: 3, icon: Key, x: 15, y: 100, delay: 1 },
            { id: 4, icon: ChevronsLeftRightEllipsis, x: 90, y: 30, delay: 1.5 },
            { id: 5, icon: BrainCircuit, x: -10, y: 70, delay: 1.5 },
        ]
        setFloatingIcons(icons)
    }, [])

    useEffect(() => {
        async function loadSavedKey() {
            try {
                if (window.electron?.auth?.getSavedKey) {
                    const saved = await window.electron.auth.getSavedKey()

                    if (saved?.remember && saved?.key) {
                        setRememberKey(true)
                        setKey(saved.key)
                    } else {
                        setRememberKey(false)
                        setKey("")
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

    const openDiscord = () => {
        window.open(DISCORD_INVITE_URL, "_blank")
    }

    const handleDiscordClick = () => {
        setShowDiscordModal(true)
        setTimeout(() => {
            openDiscord()
            setShowDiscordModal(false)
        }, 1500)
    }

    async function verificarKey() {
        if (loading) return

        setLoading(true)
        setPulse(true)
        setErrorMessage("")

        try {
            const deviceID = await getDeviceID()
            const deviceSource = getDeviceSource()

            console.log("📱 Device ID:", deviceID)
            console.log("🔧 Fonte do device:", deviceSource)

            const { data: keyData, error: keyError } = await supabase
                .from("keys")
                .select("*")
                .eq("key", key.trim())
                .single()

            if (keyError || !keyData) {
                console.error("❌ Erro na busca da key:", keyError)
                return falha("Key inválida.")
            }

            console.log("✅ Key encontrada:", keyData)

            if (keyData.used) {
                if (keyData.user !== deviceID) {
                    return falha("Esta key já está vinculada a outro computador.")
                }
            }

            if (keyData.expires_at) {
                const exp = new Date(keyData.expires_at)
                const now = new Date()

                if (exp < now) {
                    return falha("Key expirada.")
                }
            }

            if (!keyData.used) {
                const updateData = {
                    used: true,
                    user: deviceID,
                }

                const { data: updateResult, error: updateError } = await supabase
                    .from("keys")
                    .update(updateData)
                    .eq("key", key.trim())
                    .select()

                if (updateError) {
                    console.error("❌ Erro ao atualizar key:", updateError)
                    return falha("Erro ao registrar uso da key.")
                }

                console.log("✅ Key atualizada com sucesso:", updateResult)
            }

            await salvarKeySeNecessario(key, rememberKey)
            sucesso()
        } catch (err) {
            console.error("💥 Erro inesperado:", err)
            falha("Erro ao verificar key. Tente novamente.")
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

        localStorage.setItem("isLoggedIn", "true")

        setTimeout(() => {
            onLogin()
        }, 2000)
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

            if (checked) {
                if (key.trim()) {
                    await window.electron.auth.saveKey(key.trim())
                }
            } else {
                await window.electron.auth.clearSavedKey()
            }
        } catch (error) {
            console.error("Erro ao alterar opção de lembrar key:", error)
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

    useEffect(() => {
        if (erroAnim) {
            const timer = setTimeout(() => {
                setErroAnim(false)
                setErrorMessage("")
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [erroAnim])

    useEffect(() => {
        async function testarConexao() {
            try {
                const { error } = await supabase.from("keys").select("*").limit(1)

                if (error) {
                    console.error("❌ Erro na conexão com Supabase:", error)
                } else {
                    console.log("✅ Supabase conectado com sucesso!")
                }
            } catch (err) {
                console.error("💥 Erro no teste de conexão:", err)
            }
        }

        testarConexao()
    }, [])

    return (
        <MotionConfig transition={{ duration: 0.8, ease: "easeInOut" }}>
            <div className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-maxify-text-secondary rounded-full opacity-40"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            animate={{
                                y: [null, -20, 0],
                                opacity: [0.4, 0.8, 0.4],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute top-0 left-0 w-96 h-96 bg-maxify-border/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div
                        className="absolute bottom-0 right-0 w-96 h-96 bg-maxify-border/10 rounded-full blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="bg-maxify-card border border-maxify-border rounded-2xl p-5 shadow-lg w-[260px]">

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-maxify-border/30 flex items-center justify-center">
                                    <MessageCircle size={18} className="text-blue-400" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-maxify-text">
                                        Precisa de uma key?
                                    </span>

                                    <span className="text-xs text-maxify-text-secondary">
                                        Acesse o Discord e ative seu acesso
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleDiscordClick}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="
                    mt-4 w-full
                    flex items-center justify-between
                    px-4 py-3
                    rounded-xl
                    border border-maxify-border
                    bg-maxify-border/20
                    hover:bg-maxify-border/30
                    transition-all
                "
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
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
                                onClick={() => setShowDiscordModal(false)}
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                className="
                                    fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]
                                    bg-gradient-to-br from-maxify-bg to-maxify-card
                                    border border-maxify-border-secondary
                                    rounded-2xl p-8
                                    shadow-2xl
                                    max-w-md w-full mx-4
                                "
                            >
                                <div className="text-center">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 10, -10, 10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#5865F2] to-[#3f4ed6] mb-6"
                                    >
                                        <MessageCircle size={36} className="text-white" />
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-maxify-text mb-2">
                                        Redirecionando para o Discord! 🚀
                                    </h3>

                                    <p className="text-maxify-text-secondary mb-6">
                                        Você será levado para o nosso servidor do Discord em instantes...
                                    </p>

                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="w-12 h-12 border-4 border-maxify-border-secondary rounded-full" />
                                            <motion.div
                                                className="absolute top-0 left-0 w-12 h-12 border-4 border-[#5865F2] rounded-full border-t-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-xs text-maxify-text-secondary">
                                        Se nada acontecer, clique aqui:{" "}
                                        <button
                                            onClick={openDiscord}
                                            className="text-[#5865F2] hover:underline font-medium"
                                        >
                                            discord.gg/45zyQEe2s3
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDiscordModal(false)}
                                    className="absolute top-4 right-4 text-maxify-text-secondary hover:text-maxify-text transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {erroAnim && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 z-[9990]"
                            />

                            <motion.div
                                className="fixed top-1/2 left-1/2 z-[9999]"
                                initial={{
                                    scale: 0,
                                    opacity: 0.8,
                                    x: "-50%",
                                    y: "-50%",
                                }}
                                animate={{
                                    scale: [0, 1.5, 4, 6],
                                    opacity: [0.8, 1, 0.9, 0],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    times: [0, 0.3, 0.6, 1],
                                }}
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    borderRadius: "50%",
                                    boxShadow: `
                    0 0 40px 20px rgba(255, 0, 0, 0.9),
                    0 0 120px rgba(255, 0, 0, 0.6),
                    inset 0 0 40px rgba(255, 0, 0, 0.9)
                  `,
                                    background:
                                        "radial-gradient(circle, rgba(255,0,0,0.6) 20%, rgba(140,0,0,0.4) 60%, transparent 100%)",
                                    backdropFilter: "blur(10px)",
                                    filter: "blur(2px)",
                                }}
                            />

                            <motion.div
                                className="fixed top-1/2 left-1/2 text-red-500 font-bold z-[9999] text-center"
                                initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                                animate={{
                                    scale: [0, 1.3, 1],
                                    opacity: [0, 1, 1],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    fontSize: "120px",
                                    textShadow: "0 0 30px rgba(255,0,0,0.8)",
                                }}
                            >
                                ✖
                                {errorMessage && (
                                    <motion.div
                                        className="text-white text-lg mt-4 font-normal max-w-xs"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div
                                className="fixed inset-0 z-[9998]"
                                animate={{ x: [-10, 10, -10, 10, 0] }}
                                transition={{ duration: 0.4 }}
                            />
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
                                className="fixed inset-0 bg-black z-[9990]"
                            />

                            <motion.img
                                src={LoginIcon}
                                className="fixed top-1/2 left-1/2 w-32 h-32 z-[9999]"
                                initial={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                                animate={{
                                    scale: [1, 1.3, 2.5, 0],
                                    rotate: [0, 90, 360],
                                    opacity: [1, 1, 0.3, 0],
                                }}
                                transition={{ duration: 2.3 }}
                            />

                            <motion.div
                                className="fixed top-1/2 left-1/2 z-[9998]"
                                initial={{
                                    scale: 0,
                                    opacity: 0.7,
                                    x: "-50%",
                                    y: "-50%",
                                }}
                                animate={{
                                    scale: [0, 1.5, 4, 8, 12],
                                    opacity: [0.7, 1, 1, 0.8, 1],
                                }}
                                transition={{
                                    duration: 1.8,
                                    ease: "easeInOut",
                                    times: [0, 0.2, 0.5, 0.8, 1],
                                    delay: 0.6,
                                }}
                                style={{
                                    width: "250px",
                                    height: "250px",
                                    borderRadius: "50%",
                                    boxShadow: `
                    0 0 40px 20px rgba(0, 140, 255, 0.9),
                    0 0 120px rgba(0, 140, 255, 0.6),
                    inset 0 0 40px rgba(0, 140, 255, 0.9)
                  `,
                                    background:
                                        "radial-gradient(circle, rgba(0,120,255,0.6) 20%, rgba(0,50,150,0.8) 60%, rgba(0,20,100,1) 100%)",
                                    backdropFilter: "blur(10px)",
                                    filter: "blur(2px)",
                                }}
                            />
                        </>
                    )}
                </AnimatePresence>

                <motion.div
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="max-w-md w-full relative">
                        {floatingIcons.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <motion.div
                                    key={item.id}
                                    className="absolute text-maxify-text-secondary/30"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: item.delay, duration: 0.5 }}
                                    style={{
                                        left: `${item.x}%`,
                                        top: `${item.y}%`,
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 5, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: item.delay,
                                        }}
                                    >
                                        <IconComponent size={24} />
                                    </motion.div>
                                </motion.div>
                            )
                        })}

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-8">
                                <motion.div
                                    animate={pulse ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.6 }}
                                    className="flex items-center justify-center gap-3 mb-4"
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-maxify-card border border-maxify-border rounded-2xl flex items-center justify-center shadow-lg"
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <img src={LoginIcon} className="w-12 h-12" alt="Logo" />
                                    </motion.div>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl font-bold text-maxify-text mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Maxify
                                </motion.h1>

                                <motion.p
                                    className="text-maxify-text-secondary text-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Sistema de Autenticação Segura
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="bg-maxify-card border border-maxify-border rounded-2xl p-8 shadow-lg shadow-maxify-border/30">
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-maxify-text-secondary mb-2 flex items-center gap-2">
                                                    <Key size={16} />
                                                    Chave de Acesso
                                                </label>

                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={key}
                                                        onChange={(e) => handleKeyChange(e.target.value)}
                                                        placeholder={
                                                            loadingSavedKey
                                                                ? "Carregando key salva..."
                                                                : "Digite sua chave de acesso"
                                                        }
                                                        className="w-full p-4 bg-maxify-border/20 border border-maxify-border rounded-xl text-maxify-text placeholder-maxify-text-secondary transition-all hover:border-blue-400 hover:bg-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 outline-none pr-12"
                                                        required
                                                        disabled={loading || loadingSavedKey}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maxify-text-secondary hover:text-maxify-text transition-colors"
                                                        disabled={loading || loadingSavedKey}
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-maxify-border/40 bg-maxify-border/10 px-4 py-3 hover:bg-maxify-border/20 transition-all">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={rememberKey}
                                                        onChange={(e) => handleRememberChange(e.target.checked)}
                                                        className="sr-only"
                                                        disabled={loading || loadingSavedKey}
                                                    />

                                                    <div
                                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberKey
                                                            ? "bg-blue-500 border-blue-500 text-white"
                                                            : "border-maxify-border bg-transparent text-transparent"
                                                            }`}
                                                    >
                                                        <Check size={14} />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-maxify-text">
                                                        Lembrar key neste computador
                                                    </span>
                                                    <span className="text-xs text-maxify-text-secondary/70">
                                                        Salva a key automaticamente e apaga ao desmarcar
                                                    </span>
                                                </div>
                                            </label>
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: loading ? 1 : 1.02 }}
                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                        >
                                            <Button
                                                type="submit"
                                                disabled={loading || loadingSavedKey}
                                                className="w-full !bg-gradient-to-r from-blue-500 to-blue-600 hover:!bg-gradient-to-l !text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                        />
                                                        Verificando Key...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Zap size={20} />
                                                        <span>Acessar Sistema</span>
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>
                                </Card>
                            </motion.div>

                            <motion.div
                                className="text-center mt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <p className="text-maxify-text-secondary/60 text-sm">
                                    v{jsonData.version || "2.1.0"} • Piolho OptimizeX
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </MotionConfig>
    )
}