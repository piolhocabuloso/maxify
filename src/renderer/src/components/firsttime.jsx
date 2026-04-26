import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"
import {
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react"
import data from "../../../../package.json"

export default function FirstTime() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!window.updater) return

    window.updater.onStatus((data) => {
      setStatus(data)

      if (
        data.type === "available" ||
        data.type === "progress" ||
        data.type === "downloaded" ||
        data.type === "error"
      ) {
        setOpen(true)
      }
      if (data.type === "none") {
        toast.success("Seu Maxify já está atualizado.")
      }
    })
  }, [])

  const closeModal = () => {
    setOpen(false)
  }

  const updateNow = async () => {
    const updater = window.updater?.installNow
      ? window.updater
      : window.updater?.updater

    await updater?.installNow?.()
  }

  const percent = status?.percent || 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 25 }}
            className={clsx(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
              "max-w-lg w-full mx-4 overflow-hidden",
              "rounded-[28px] border border-blue-500/25",
              "bg-gradient-to-br from-maxify-bg via-maxify-card to-maxify-bg",
              "shadow-2xl shadow-blue-500/20 p-8"
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_35%)]" />

            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-20 text-maxify-text-secondary hover:text-maxify-text transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/15 border border-blue-500/25 mb-6 shadow-lg shadow-blue-500/20"
              >
                {status?.type === "progress" ? (
                  <Download size={38} className="text-blue-300" />
                ) : status?.type === "downloaded" ? (
                  <CheckCircle2 size={38} className="text-cyan-300" />
                ) : status?.type === "error" ? (
                  <AlertTriangle size={38} className="text-red-400" />
                ) : (
                  <Sparkles size={38} className="text-blue-300" />
                )}
              </motion.div>

              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-300 via-white to-cyan-300 bg-clip-text text-transparent mb-3">
                Atualização disponível
              </h3>

              <p className="text-maxify-text-secondary text-base mb-5">
                {status?.message || "Uma nova versão do Maxify foi encontrada."}
              </p>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 mb-6">
                <p className="text-sm text-maxify-text-secondary">
                  Versão instalada:
                  <strong className="text-blue-300"> {data?.version}</strong>
                </p>

                {status?.version && (
                  <p className="text-sm text-maxify-text-secondary mt-1">
                    Nova versão:
                    <strong className="text-cyan-300"> {status.version}</strong>
                  </p>
                )}
              </div>

              {status?.type === "progress" && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-maxify-text-secondary mb-2">
                    <span>Baixando atualização</span>
                    <span>{percent}%</span>
                  </div>

                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {status?.type === "downloaded" ? (
                  <motion.button
                    onClick={updateNow}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25"
                  >
                    <RefreshCw size={20} />
                    Atualizar agora
                  </motion.button>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 text-blue-300 font-bold border border-blue-500/25"
                  >
                    <RefreshCw
                      size={20}
                      className={status?.type === "progress" ? "animate-spin" : ""}
                    />
                    {status?.type === "progress"
                      ? "Baixando..."
                      : "Preparando atualização"}
                  </button>
                )}

                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-maxify-border-secondary text-maxify-text-secondary font-semibold bg-white/5 hover:bg-white/10 transition-all"
                >
                  Depois
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}