import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bug, CheckCircle2, HelpCircle, Lightbulb, Loader2, MessageSquarePlus, Send, Sparkles, X } from "lucide-react"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"

const categories = [
  { id: "bug", label: "Bug", icon: Bug, description: "Algo não funcionou direito" },
  { id: "suggestion", label: "Sugestão", icon: Lightbulb, description: "Ideia para melhorar o Maxify" },
  { id: "feedback", label: "Feedback", icon: MessageSquarePlus, description: "Opinião geral do app" },
]

function getStoredUser() {
  try {
    const raw = localStorage.getItem("maxify:discord-user") || localStorage.getItem("discordUser")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function FeedbackCloud() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("bug")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState(false)
  const [account, setAccount] = useState(null)

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === category) || categories[0],
    [category]
  )

  useEffect(() => {
    let mounted = true

    async function loadAccount() {
      try {
        const result = await window.electron?.auth?.getAccount?.()
        if (mounted) setAccount(result?.account || result?.user || result || null)
      } catch {
        if (mounted) setAccount(getStoredUser())
      }
    }

    loadAccount()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit() {
    const cleanMessage = message.trim()

    if (cleanMessage.length < 8) {
      toast.warning("Escreva um pouco mais antes de enviar.")
      return
    }

    setSending(true)
    setLastSent(false)

    try {
      const payload = {
        category,
        categoryLabel: selectedCategory.label,
        message: cleanMessage,
        page: window.location.hash || window.location.pathname,
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
        user: account || getStoredUser(),
      }

      const result = await invoke({ channel: "feedback:send", payload })

      if (!result?.success) {
        throw new Error(result?.message || "Não foi possível enviar agora.")
      }

      setMessage("")
      setLastSent(true)
      toast.success("Relato enviado para o suporte.")
    } catch (error) {
      toast.error(error?.message || "Erro ao enviar o relato.")
    } finally {
      setSending(false)
    }
  }

  function startTutorial() {
    window.dispatchEvent(new CustomEvent("maxify:start-tutorial"))
    setOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-5 right-5 z-[65]"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-3 rounded-full bg-blue-500/10 blur-xl"
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileHover={{ y: -3, scale: 1.035 }}
            whileTap={{ scale: 0.96 }}
            className="
    group relative flex h-14 items-center gap-3 overflow-hidden rounded-[24px]
    border border-blue-400/25 bg-[#07111f]/90 px-4 text-white
    shadow-[0_18px_55px_rgba(0,0,0,0.45),0_0_28px_rgba(59,130,246,0.18)]
    backdrop-blur-2xl transition-all duration-300
    hover:border-blue-300/45 hover:bg-[#0a1728]/95 hover:shadow-[0_22px_65px_rgba(0,0,0,0.5),0_0_38px_rgba(59,130,246,0.26)]
  "
            title="Relatar bug ou enviar sugestão"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.32),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)] opacity-80" />

            <motion.div
              className="pointer-events-none absolute -left-10 top-0 h-full w-10 bg-white/10 blur-md"
              animate={{ x: [0, 190, 190] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />

            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-500/15 text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_0_18px_rgba(59,130,246,0.18)]">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={18} />
              </motion.span>

              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border border-[#07111f] bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]" />
              </span>
            </span>

            <span className="relative hidden text-left md:block">
              <span className="flex items-center gap-1.5 text-[13px] font-bold leading-none tracking-tight">
                Ajuda rápida
                <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-blue-200">
                  Novo
                </span>
              </span>

              <span className="mt-1 block text-[11px] text-blue-100/55">
                Bug, sugestão ou tutorial
              </span>
            </span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-end bg-black/35 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-[470px] overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-bg/95 p-5 text-maxify-text shadow-2xl shadow-black/40 backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/80">Central Maxify</p>
                  <h2 className="mt-1 text-xl font-bold">Relatar bug ou sugestão</h2>
                  <p className="mt-1 text-sm text-maxify-text-secondary">Seu relato vai direto para o Discord do suporte.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-maxify-border bg-maxify-card/60 p-2 text-maxify-text-secondary transition hover:text-maxify-text hover:bg-maxify-border/20"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
                {categories.map((item) => {
                  const Icon = item.icon
                  const active = item.id === category

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`rounded-2xl border p-3 text-left transition ${active
                          ? "border-blue-400/35 bg-blue-500/15 text-blue-200"
                          : "border-maxify-border bg-maxify-card/50 text-maxify-text-secondary hover:border-blue-400/20 hover:text-maxify-text"
                        }`}
                    >
                      <Icon size={17} />
                      <span className="mt-2 block text-[12px] font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] opacity-75">{item.description}</span>
                    </button>
                  )
                })}
              </div>

              <div className="relative z-10 mt-4">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={900}
                  placeholder="Escreva aqui o problema, sugestão ou ideia..."
                  className="h-36 w-full resize-none rounded-3xl border border-maxify-border bg-black/20 p-4 text-sm text-maxify-text outline-none transition placeholder:text-maxify-text-secondary/70 focus:border-blue-400/35 focus:bg-black/25"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-maxify-text-secondary">
                  <span>{message.trim().length}/900 caracteres</span>
                  <span>Categoria: {selectedCategory.label}</span>
                </div>
              </div>

              {lastSent && (
                <div className="relative z-10 mt-3 flex items-center gap-2 rounded-2xl border border-green-400/20 bg-green-500/10 px-3 py-2 text-xs text-green-300">
                  <CheckCircle2 size={15} /> Enviado com sucesso.
                </div>
              )}

              <div className="relative z-10 mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={startTutorial}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card/60 px-4 py-3 text-sm font-semibold text-maxify-text-secondary transition hover:border-blue-400/25 hover:text-maxify-text"
                >
                  <HelpCircle size={17} /> Ver tutorial
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  {sending ? "Enviando..." : "Enviar relato"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
