import { Bell, ChevronRight, Minus, Moon, Square, Sun, X } from "lucide-react"
import { close, minimize, toggleMaximize } from "../lib/electron"
import maxifylogo from "../../../../resources/maxifylogo.png"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import pkg from "../../../../package.json"

const versionAtual = pkg.version
const updates = [
  {
    title: "Central de relatos adicionada",
    text: "Agora você pode enviar bugs, sugestões e feedback direto pelo app.",
    tag: "Novo",
  },
  {
    title: "Tutorial guiado",
    text: "Use o tutorial para entender as principais páginas do Maxify.",
    tag: "Teste",
  },
  {
    title: "Melhorias visuais",
    text: "Titlebar, notificações e ajuda rápida receberam ajustes de interface.",
    tag: "UI",
  },
]

function TitleBar() {
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "dark"
  )
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    document.body.setAttribute("data-theme", newTheme)
    document.body.classList.remove("dark", "light")
    document.body.classList.add(newTheme)

    localStorage.setItem("theme", newTheme)
  }

  const startTutorial = () => {
    setNotificationsOpen(false)
    window.dispatchEvent(new CustomEvent("maxify:start-tutorial"))
  }

  return (
    <div
      style={{ WebkitAppRegion: "drag" }}
      className="fixed left-0 right-0 top-0 z-50 h-[55px] border-b border-maxify-border-secondary bg-maxify-bg/92 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-80%,rgba(59,130,246,0.18),transparent_45%)]" />

      {/* CENTRO — MAXIFY */}
      <div className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-4">
        <motion.img
          src={maxifylogo}
          alt="maxify"
          className="h-7 w-7"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <span className="text-base font-semibold tracking-wide text-maxify-text-primary">
          Maxify
        </span>

        <motion.div
          className="rounded-xl border border-blue-500/30 bg-blue-500/20 p-1.5 px-3 text-center text-xs font-medium text-blue-400"
          animate={{
            boxShadow: [
              "0 0 0px rgba(59, 130, 246, 0.5)",
              "0 0 15px rgba(59, 130, 246, 0.8)",
              "0 0 0px rgba(59, 130, 246, 0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Beta
        </motion.div>
      </div>

      {/* DIREITA — BOTÕES */}
      <div
        className="absolute right-0 top-0 flex h-full"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative flex h-[55px] w-14 items-center justify-center transition hover:bg-maxify-accent"
            title="Novidades"
          >
            <Bell size={18} />
            <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full border border-maxify-bg bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.16 }}
                className="absolute right-2 top-[62px] w-[360px] overflow-hidden rounded-[26px] border border-maxify-border bg-maxify-bg/96 p-4 text-maxify-text shadow-2xl shadow-black/35 backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_38%)]" />

                <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/80">
                      Atualizações
                    </p>
                    <h3 className="mt-1 text-base font-bold">Novidades do Maxify</h3>
                  </div>
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-200">
                    Versão {versionAtual}
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  {updates.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-maxify-border bg-maxify-card/55 p-3 transition hover:border-blue-400/20 hover:bg-maxify-card/75"
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-maxify-text">{item.title}</p>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-maxify-text-secondary">{item.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={startTutorial}
                  className="relative z-10 mt-3 flex w-full items-center justify-between rounded-2xl border border-blue-400/20 bg-blue-500/12 px-3 py-3 text-left text-sm font-semibold text-blue-100 transition hover:bg-blue-500/18"
                >
                  Iniciar tutorial do app
                  <ChevronRight size={17} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-[55px] w-14 items-center justify-center transition hover:bg-maxify-accent"
          title="Alternar tema"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={minimize}
          className="flex h-[55px] w-14 items-center justify-center transition hover:bg-maxify-accent"
          title="Minimizar"
        >
          <Minus size={18} />
        </button>

        <button
          onClick={toggleMaximize}
          className="flex h-[55px] w-14 items-center justify-center transition hover:bg-maxify-accent"
          title="Maximizar"
        >
          <Square size={16} />
        </button>

        <button
          onClick={close}
          className="flex h-[55px] w-14 items-center justify-center transition hover:bg-red-600 hover:text-white"
          title="Fechar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
