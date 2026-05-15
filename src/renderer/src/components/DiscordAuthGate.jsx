import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck, Sparkles, UserRound, Zap } from "lucide-react"
import LoginIcon from "../../../../resources/maxifylogo.png"

const steps = ["Abrindo Discord", "Validando sessão", "Carregando perfil"]

export default function DiscordAuthGate({ onAuthenticated }) {
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(0)

  const title = useMemo(() => {
    if (status === "success") return `Bem-vindo, ${user?.globalName || user?.username || "usuário"}`
    if (status === "waiting") return "Finalize no navegador"
    if (status === "error") return "Não foi possível conectar"
    return "Entre com Discord"
  }, [status, user])

  useEffect(() => {
    if (status !== "waiting") return
    const timer = setInterval(() => setStep((prev) => (prev + 1) % steps.length), 1300)
    return () => clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (status !== "waiting" || !sessionId) return
    let cancelled = false
    let attempts = 0

    const timer = setInterval(async () => {
      attempts += 1
      try {
        const result = await window.electron?.discordAuth?.status?.(sessionId)
        if (cancelled) return

        if (result?.authenticated && result?.user) {
          clearInterval(timer)
          setUser(result.user)
          setStatus("success")
          setMessage("Conta conectada. Abrindo login do Maxify...")
          setTimeout(() => onAuthenticated?.(result.user), 1200)
          return
        }

        if (attempts >= 60) {
          clearInterval(timer)
          setStatus("error")
          setMessage("Tempo esgotado. Clique para tentar novamente.")
        }
      } catch (error) {
        clearInterval(timer)
        setStatus("error")
        setMessage(error?.message || "Erro ao verificar autenticação.")
      }
    }, 2000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [status, sessionId, onAuthenticated])

  async function startDiscordAuth() {
    try {
      setStatus("starting")
      setMessage("Abrindo o auth seguro do Discord no navegador...")
      setStep(0)

      const result = await window.electron?.discordAuth?.start?.()

      if (!result?.success) {
        setStatus("error")
        setMessage(result?.error || "Não foi possível iniciar o Discord Auth.")
        return
      }

      setSessionId(result.sessionId)
      setStatus("waiting")
      setMessage("Autorize no navegador. Quando terminar, o Maxify continua sozinho.")
    } catch (error) {
      setStatus("error")
      setMessage(error?.message || "Erro ao abrir Discord Auth.")
    }
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" animate={{ x: [0, 50, 0], y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" animate={{ x: [0, -50, 0], y: [0, -25, 0] }} transition={{ duration: 9, repeat: Infinity }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 25, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }} className="relative w-full max-w-[860px] rounded-[34px] border border-maxify-border bg-maxify-card/75 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
        <div className="grid min-h-[520px] grid-cols-1 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent md:grid-cols-[1.05fr_.95fr]">
          <div className="relative flex flex-col justify-between p-8">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <ShieldCheck size={14} /> Auth obrigatório antes do login
              </div>

              <motion.img src={LoginIcon} alt="Maxify" className="mb-6 h-16 w-16 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-2 shadow-xl shadow-blue-500/20" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity }} draggable={false} />

              <AnimatePresence mode="wait">
                <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <h1 className="text-4xl font-black tracking-tight text-maxify-text">{title}</h1>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-maxify-text-secondary">
                    O Maxify confirma sua conta Discord primeiro, envia o log de acesso autorizado e depois libera o login normal da key.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[{ icon: UserRound, label: "Conta" }, { icon: Zap, label: "Log" }, { icon: Sparkles, label: "Login" }].map((item, index) => {
                const Icon = item.icon
                const active = status === "success" || index <= step
                return (
                  <div key={item.label} className="rounded-2xl border border-maxify-border bg-black/10 p-3">
                    <Icon size={18} className={active ? "text-blue-300" : "text-maxify-text-secondary"} />
                    <p className="mt-2 text-xs font-semibold text-maxify-text">{item.label}</p>
                    <p className="text-[10px] text-maxify-text-secondary">{active ? "OK" : "Aguardando"}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center bg-black/10 p-8">
            <div className="w-full max-w-[330px] rounded-[28px] border border-maxify-border bg-maxify-bg/70 p-5 shadow-xl shadow-black/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865F2]/15 text-[#9aa4ff]">
                  {status === "success" ? <CheckCircle2 size={24} /> : status === "waiting" || status === "starting" ? <Loader2 size={24} className="animate-spin" /> : <ExternalLink size={23} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-maxify-text">Discord Auth</p>
                  <p className="text-xs text-maxify-text-secondary">Navegador externo</p>
                </div>
              </div>

              {user?.avatarURL && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-400/15 bg-blue-500/10 p-3">
                  <img src={user.avatarURL} alt="Avatar" className="h-11 w-11 rounded-full border border-blue-400/30" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-maxify-text">{user.globalName || user.username}</p>
                    <p className="truncate text-xs text-maxify-text-secondary">{user.tag}</p>
                  </div>
                </div>
              )}

              <div className="mb-5 rounded-2xl border border-maxify-border bg-black/10 p-4">
                <p className="text-xs font-semibold text-maxify-text">Status</p>
                <p className="mt-1 min-h-[36px] text-xs leading-relaxed text-maxify-text-secondary">{message || "Clique no botão abaixo para começar."}</p>
                {status === "waiting" && <p className="mt-3 text-xs font-semibold text-blue-300">{steps[step]}...</p>}
              </div>

              <button type="button" onClick={startDiscordAuth} disabled={status === "starting" || status === "waiting" || status === "success"} className="w-full rounded-2xl border border-blue-400/25 bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">
                {status === "waiting" ? "Aguardando autorização..." : status === "success" ? "Conectado" : "Entrar com Discord"}
              </button>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-maxify-text-secondary">
                Mostre isso na tela para o usuário: ao continuar, ele autoriza o Maxify a ler apenas o perfil básico do Discord.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
