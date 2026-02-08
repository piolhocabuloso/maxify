import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"
import { useState } from "react"

import {
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
  X
} from "lucide-react"

import { broom } from "@lucide/lab"

const tabs = {
  home: { label: "Dashboard", path: "/" },
  clean: { label: "Limpeza", path: "/clean" },
  apps: { label: "Impulso", path: "/apps" },
  utilities: { label: "Utilitários", path: "/utilities" },
  dns: { label: "DNS", path: "/dns" },
  backup: { label: "Restaurar", path: "/backup" },
  settings: { label: "Configuração", path: "/settings" },
}

const tabIcons = {
  home: Home,
  clean: (props) => <Icon iconNode={broom} {...props} />,
  backup: Folder,
  utilities: Box,
  dns: EthernetPort,
  apps: Rocket,
  settings: Settings,
}

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [isHoveringDiscord, setIsHoveringDiscord] = useState(false)

  const activeTab =
    Object.entries(tabs).find(([, t]) => t.path === location.pathname)?.[0] ||
    "home"

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
      <nav
        className={clsx(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
          "bg-sparkle-card/80 backdrop-blur-xl",
          "border border-sparkle-border shadow-2xl",
          "rounded-[22px] px-3 py-2"
        )}
      >
        <div className="flex items-center gap-2">
          {Object.entries(tabs).map(([id, { path, label }]) => {
            const IconComp = tabIcons[id]
            const active = activeTab === id

            return (
              <motion.button
                key={id}
                onClick={() => navigate(path)}
                className="relative group"
                whileTap={{ scale: 0.9 }}
              >
                {active && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 bg-sparkle-primary rounded-[16px]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <div
                  className={clsx(
                    "relative z-10",
                    "w-[46px] h-[46px]",
                    "flex items-center justify-center",
                    "transition-all duration-200",
                    active
                      ? "text-sparkle-bg"
                      : "text-sparkle-text-secondary group-hover:text-sparkle-text"
                  )}
                >
                  <IconComp size={20} />
                </div>

                {/* Tooltip */}
                <div
                  className={clsx(
                    "absolute -top-8 left-1/2 -translate-x-1/2",
                    "px-2 py-1 rounded-lg text-xs",
                    "bg-sparkle-card border border-sparkle-border",
                    "opacity-0 group-hover:opacity-100",
                    "transition-all pointer-events-none"
                  )}
                >
                  {label}
                </div>
              </motion.button>
            )
          })}

          {/* Separador com efeito especial */}
          <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-sparkle-border to-transparent mx-1" />

          {/* Botão do Discord com efeito especial */}
          <motion.button
            onClick={handleDiscordClick}
            onMouseEnter={() => setIsHoveringDiscord(true)}
            onMouseLeave={() => setIsHoveringDiscord(false)}
            className="relative group"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: isHoveringDiscord
                ? "0 0 20px rgba(88, 101, 242, 0.4)"
                : "none",
            }}
          >
            {/* Efeito de brilho pulsante */}
            {isHoveringDiscord && (
              <motion.div
                className="absolute inset-0 bg-[#5865F2] rounded-[16px] blur-md opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            <div
              className={clsx(
                "relative z-10",
                "w-[46px] h-[46px]",
                "flex items-center justify-center",
                "rounded-[16px]",
                "bg-gradient-to-br from-[#5865F2] to-[#3f4ed6]",
                "text-white",
                "shadow-lg",
                "transition-all duration-300",
                "group-hover:shadow-[#5865F2]/40"
              )}
            >
              <MessageCircle size={22} />
              
              {/* Ícone de notificação/ativação */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: isHoveringDiscord ? [1, 1.5, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <div className="w-3 h-3 bg-green-400 rounded-full ring-2 ring-sparkle-card" />
              </motion.div>
            </div>

            {/* Tooltip especial para Discord */}
            <div
              className={clsx(
                "absolute -top-10 left-1/2 -translate-x-1/2",
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-gradient-to-r from-[#5865F2] to-[#3f4ed6]",
                "text-white",
                "shadow-lg",
                "opacity-0 group-hover:opacity-100",
                "transition-all pointer-events-none",
                "whitespace-nowrap"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} />
                Entrar no Discord
                <Sparkles size={10} />
              </div>
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Modal de confirmação com efeito especial */}
      <AnimatePresence>
        {showDiscordModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
              onClick={() => setShowDiscordModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className={clsx(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
                "bg-gradient-to-br from-sparkle-card to-sparkle-bg",
                "border border-sparkle-border",
                "rounded-2xl p-8",
                "shadow-2xl",
                "max-w-md w-full mx-4"
              )}
            >
              <div className="text-center">
                {/* Ícone animado */}
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

                <h3 className="text-2xl font-bold text-sparkle-text mb-2">
                  Redirecionando para o Discord! 🚀
                </h3>
                
                <p className="text-sparkle-text-secondary mb-6">
                  Você será levado para o nosso servidor do Discord em instantes...
                </p>

                {/* Loader animado */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-sparkle-border rounded-full" />
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

                <div className="text-xs text-sparkle-text-secondary">
                  Se nada acontecer, clique aqui:{' '}
                  <button
                    onClick={openDiscord}
                    className="text-[#5865F2] hover:underline font-medium"
                  >
                    discord.gg/45zyQEe2s3
                  </button>
                </div>
              </div>

              {/* Botão de fechar */}
              <button
                onClick={() => setShowDiscordModal(false)}
                className="absolute top-4 right-4 text-sparkle-text-secondary hover:text-sparkle-text transition-colors"
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