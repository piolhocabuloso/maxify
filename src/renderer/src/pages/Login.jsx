// src/renderer/src/pages/Login.jsx
import { useState, useEffect } from "react"
import { MotionConfig, motion, AnimatePresence } from "framer-motion"
import { Shield, Zap, Key, Eye, EyeOff, ChevronsLeftRightEllipsis, BrainCircuit } from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/button"
import LoginIcon from "../../../../resources/sparklelogo.png"

export default function Login({ onLogin }) {
    const [key, setKey] = useState("")
    const [loading, setLoading] = useState(false)
    const [pulse, setPulse] = useState(false)
    const [animando, setAnimando] = useState(false)
    const [erroAnim, setErroAnim] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [floatingIcons, setFloatingIcons] = useState([])
    const [errorMessage, setErrorMessage] = useState("")

    // Adicionar ícones flutuantes
    useEffect(() => {
        const icons = [
            { id: 1, icon: Shield, x: 10, y: 20, delay: 0 },
            { id: 2, icon: Zap, x: 85, y: 60, delay: 0.5 },
            { id: 3, icon: Key, x: 15, y: 100, delay: 1 },
            { id: 4, icon: ChevronsLeftRightEllipsis, x: 90, y: 30, delay: 1.5 },
            { id: 5, icon: BrainCircuit, x: -10, y: 70, delay: 1.5 }
        ]
        setFloatingIcons(icons)
    }, [])

    async function verificarKey() {
        if (loading) return

        setLoading(true)
        setPulse(true)
        setErrorMessage("")

        // Simulação de delay para animação
        await new Promise(resolve => setTimeout(resolve, 800))

        // VERIFICAÇÃO SIMPLES - APENAS A KEY "123321"
        if (key === "123321") {
            sucesso()
        } else {
            falha("Key inválida. Use: 123321")
        }
    }

    function falha(msg) {
        console.log("❌ FALHA:", msg)
        setErrorMessage(msg)
        setErroAnim(true)
        setLoading(false)
        setPulse(false)
    }

    function sucesso() {
        console.log("✅ SUCESSO - Login autorizado")
        setAnimando(true)
        setLoading(false)
        setPulse(false)

        // Salva no localStorage
        localStorage.setItem("userKey", "123321")

        setTimeout(() => {
            onLogin()
        }, 2000)
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        if (!key.trim()) {
            return falha("Por favor, digite uma key.")
        }

        console.log("🎯 Iniciando processo de login...")
        await verificarKey()
    }

    // Resetar erro quando a animação terminar
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
        <MotionConfig transition={{ duration: 0.8, ease: "easeInOut" }}>
            <div className="w-full h-full relative overflow-hidden">
                {/* BACKGROUND ANIMADO */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Partículas de fundo */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-sparkle-text-secondary rounded-full opacity-40"
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

                    {/* Gradientes animados */}
                    <motion.div
                        className="absolute top-0 left-0 w-96 h-96 bg-sparkle-border/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-0 right-0 w-96 h-96 bg-sparkle-border/10 rounded-full blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* ❌ ANIMAÇÃO DE ERRO — PORTAL VERMELHO */}
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
                                animate={{
                                    x: [-10, 10, -10, 10, 0],
                                }}
                                transition={{ duration: 0.4 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* ANIMAÇÃO AO ACERTAR LOGIN */}
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
                                    background: "radial-gradient(circle, rgba(0,120,255,0.6) 20%, rgba(0,50,150,0.8) 60%, rgba(0,20,100,1) 100%)",
                                    backdropFilter: "blur(10px)",
                                    filter: "blur(2px)",
                                }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* CONTEÚDO PRINCIPAL COM ANIMAÇÃO DE TRANSIÇÃO */}
                <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    animate={animando ? { opacity: 0, scale: 0.8 } : {}}
                    className="h-full flex items-center justify-center p-6"
                    style={{ WebkitAppRegion: "no-drag", overflowY: "auto" }}
                >
                    <div className="max-w-md w-full relative">
                        {/* Ícones flutuantes decorativos */}
                        {floatingIcons.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <motion.div
                                    key={item.id}
                                    className="absolute text-sparkle-text-secondary/30"
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
                                        className="w-20 h-20 bg-sparkle-card border border-sparkle-border rounded-2xl flex items-center justify-center shadow-lg"
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <img src={LoginIcon} className="w-12 h-12" alt="Logo" />
                                    </motion.div>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl font-bold text-sparkle-text mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Maxify
                                </motion.h1>
                                <motion.p
                                    className="text-sparkle-text-secondary text-lg"
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
                                <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-8 shadow-lg shadow-sparkle-border/30">
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-sparkle-text-secondary mb-2 flex items-center gap-2">
                                                    <Key size={16} />
                                                    Chave de Acesso
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={key}
                                                        onChange={(e) => setKey(e.target.value)}
                                                        placeholder="Digite 123321"
                                                        className="w-full p-4 bg-sparkle-border/20 border border-sparkle-border rounded-xl text-sparkle-text placeholder-sparkle-text-secondary transition-all hover:border-blue-400 hover:bg-blue-500/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 outline-none pr-12"
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sparkle-text-secondary hover:text-sparkle-text transition-colors"
                                                        disabled={loading}
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full !bg-gradient-to-r from-blue-500 to-blue-600 hover:!bg-gradient-to-l !text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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

                                    {/* Informações adicionais */}
                                    <motion.div
                                        className="mt-6 pt-6 border-t border-sparkle-border/30 text-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <p className="text-sm text-sparkle-text-secondary flex items-center justify-center gap-2">
                                            <Shield size={14} />
                                            Key de demonstração: 123321
                                        </p>

                                        <p className="text-xs text-sparkle-text-secondary/70 mt-2">
                                            Sistema de autenticação local - sem conexão externa
                                        </p>
                                    </motion.div>
                                </Card>
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                                className="text-center mt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <p className="text-sparkle-text-secondary/60 text-sm">
                                    v2.1.0 • Local Authentication System
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </MotionConfig>
    )
}