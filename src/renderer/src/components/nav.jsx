import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"
import { useState } from "react"

import {
  Gamepad2,
  MemoryStick,
  Power,
  Home,
  Box,
  EthernetPort,
  Folder,
  LayoutGrid,
  Settings,
  Icon,
  Rocket,
  MessageCircle,
  Sparkles,
  X,
  ChartColumn,
  Minimize2,
  Maximize2,
} from "lucide-react"

import { broom } from "@lucide/lab"

const tabs = {
  home: { label: "Dashboard", path: "/" },
  clean: { label: "Limpeza", path: "/clean" },
  otimizacao: { label: "Otimização", path: "/otimizacao" },
  memory: { label: "Memória RAM", path: "/memory" },
  desativar: { label: "Desativar", path: "/desativar" },
  prioridade: { label: "Prioridade de Jogos", path: "/prioridade" },
  apps: { label: "Impulso", path: "/apps" },
  aplicativos: { label: "Central de Recursos", path: "/aplicativos" },
  settings: { label: "Configuração", path: "/settings" },
}

const tabIcons = {
  home: Home,
  clean: (props) => <Icon iconNode={broom} {...props} />,
  otimizacao: ChartColumn,
  aplicativos: Box,
  dns: EthernetPort,
  memory: MemoryStick,
  apps: Rocket,
  settings: Settings,
  desativar: Power,
  prioridade: Gamepad2,
}

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  const activeTab =
    Object.entries(tabs).find(([, t]) => t.path === location.pathname)?.[0] ?? null

  const openDiscord = () => {
    window.open("https://discord.gg/45zyQEe2s3", "_blank")
  }

  const handleDiscordClick = () => {
    setShowDiscordModal(true)
    setTimeout(() => {
      openDiscord()
      setShowDiscordModal(false)
    }, 1500)
  }

  return (
    <>
      <motion.nav
        animate={{
          width: "auto",
          padding: isCompact ? "10px 6px" : "8px 8px"
        }}
        className={clsx(
          "fixed left-6 top-1/2 -translate-y-1/2 z-50",
          "bg-maxify-bg/90 backdrop-blur-xl",
          "border border-maxify-border-secondary/50 shadow-2xl",
          "rounded-2xl",
          "flex flex-col items-center",
          "transition-all duration-300 ease-out"
        )}
      >
        <div className={clsx(
          "flex flex-col items-center gap-2 transition-all duration-300",
          isCompact ? "gap-1.5" : "gap-2"
        )}>
          {Object.entries(tabs).map(([id, { path, label }]) => {
            const IconComp = tabIcons[id]
            const active = activeTab === id

            return (
              <motion.button
                key={id}
                onClick={() => navigate(path)}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className={clsx(
                      "absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-maxify-primary",
                      isCompact ? "w-0.5 h-4" : "w-1 h-6"
                    )}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    width: isCompact ? 40 : 48,
                    height: isCompact ? 40 : 48,
                    borderRadius: isCompact ? 10 : 12,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={clsx(
                    "relative z-10",
                    "flex items-center justify-center",
                    "transition-all duration-200",
                    active
                      ? "bg-gradient-to-br from-maxify-primary/20 to-maxify-primary/5 text-maxify-primary"
                      : "text-maxify-text-secondary hover:text-maxify-text hover:bg-maxify-accent"
                  )}
                >
                  <motion.div
                    animate={{
                      scale: isCompact ? 0.85 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComp size={20} strokeWidth={active ? 2 : 1.5} />
                  </motion.div>
                </motion.div>

                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-maxify-bg/90 backdrop-blur-md border border-maxify-border-secondary shadow-lg text-maxify-text">
                    {label}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-maxify-bg/90 border-l border-b border-maxify-border-secondary rotate-45" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          animate={{
            width: isCompact ? 24 : 32,
            marginTop: isCompact ? 8 : 12,
            marginBottom: isCompact ? 8 : 12,
          }}
          transition={{ duration: 0.2 }}
          className="h-px bg-gradient-to-r from-transparent via-maxify-border-secondary to-transparent"
        />

        <motion.button
          onClick={handleDiscordClick}
          className="relative group mb-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              width: isCompact ? 40 : 48,
              height: isCompact ? 40 : 48,
              borderRadius: isCompact ? 10 : 12,
            }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex items-center justify-center bg-gradient-to-br from-[#5865F2] to-[#4752c4] text-white shadow-lg shadow-[#5865F2]/20 group-hover:shadow-[#5865F2]/40"
          >
            <motion.div
              animate={{
                scale: isCompact ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={20} />
            </motion.div>

            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-maxify-bg" />
            </motion.div>
          </motion.div>

          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0">
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-gradient-to-r from-[#5865F2] to-[#4752c4] text-white shadow-lg">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} />
                Entrar no Discord
                <Sparkles size={10} />
              </div>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#4752c4] border-l border-b border-[#5865F2]/30 rotate-45" />
            </div>
          </div>
        </motion.button>

      </motion.nav>

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
              className={clsx(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
                "bg-gradient-to-br from-maxify-bg to-maxify-card",
                "border border-maxify-border-secondary",
                "rounded-2xl p-8",
                "shadow-2xl",
                "max-w-md w-full mx-4"
              )}
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
                  Se nada acontecer, clique aqui:{' '}
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
    </>
  )
}