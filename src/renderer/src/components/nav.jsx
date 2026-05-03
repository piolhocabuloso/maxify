import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"

import {
  Gauge,
  Gamepad2,
  MemoryStick,
  Power,
  Home,
  Box,
  Settings,
  Icon,
  Rocket,
  ChartColumn,
  User,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react"

import { broom } from "@lucide/lab"
import { invoke } from "@/lib/electron"

const tabs = {
  home: { label: "Dashboard", path: "/" },
  clean: { label: "Limpeza", path: "/clean" },
  otimizacao: { label: "Otimização", path: "/otimizacao" },
  memory: { label: "Memória RAM", path: "/memory" },
  desativar: { label: "Desativar", path: "/desativar" },
  prioridade: { label: "Prioridade de Jogos", path: "/prioridade" },
  apps: { label: "Impulso", path: "/apps" },
  startup: { label: "Inicialização", path: "/startup" },
  aplicativos: { label: "Central de Recursos", path: "/aplicativos" },
  settings: { label: "Configuração", path: "/settings" },
}

const tabIcons = {
  home: Home,
  clean: (props) => <Icon iconNode={broom} {...props} />,
  otimizacao: ChartColumn,
  memory: MemoryStick,
  desativar: Power,
  prioridade: Gamepad2,
  apps: Rocket,
  aplicativos: Box,
  settings: Settings,
  startup: Gauge,
}

function NavTooltip({ label, expanded }) {
  if (expanded) return null

  return (
    <div
      className="
        pointer-events-none
        absolute left-[58px] top-1/2 -translate-y-1/2
        opacity-0 invisible
        group-hover:opacity-100 group-hover:visible
        translate-x-[-6px] group-hover:translate-x-0
        transition-all duration-200
        z-[999]
      "
    >
      <div
        className="
          relative px-3 py-1.5 rounded-xl
          bg-maxify-card border border-maxify-border
          text-[11px] font-medium text-maxify-text
          whitespace-nowrap
          shadow-xl shadow-black/20
          backdrop-blur-xl
        "
      >
        {label}

        <div
          className="
            absolute -left-1 top-1/2 -translate-y-1/2
            w-2 h-2 rotate-45
            bg-maxify-card
            border-l border-b border-maxify-border
          "
        />
      </div>
    </div>
  )
}

function NavButton({ id, tab, active, expanded, onClick }) {
  const IconComp = tabIcons[id]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        `
          relative group
          w-full h-11
          flex items-center
          rounded-2xl
          outline-none
          transition-all duration-300
        `,
        expanded ? "justify-start px-2.5 gap-3" : "justify-center px-0"
      )}
      title={tab.label}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="nav-active-pill"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 36,
            }}
            className="
              absolute inset-0
              rounded-2xl
              bg-blue-500/15
              border border-blue-400/15
              shadow-[0_0_20px_rgba(59,130,246,0.16)]
            "
          />
        )}
      </AnimatePresence>

      {active && (
        <motion.div
          layoutId="nav-active-line"
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 34,
          }}
          className="
            absolute left-0 top-1/2 -translate-y-1/2
            w-[3px] h-6
            rounded-r-full
            bg-blue-400
            shadow-[0_0_14px_rgba(96,165,250,0.7)]
          "
        />
      )}

      <motion.div
        whileHover={{ y: -1, scale: 1.04 }}
        transition={{ duration: 0.18 }}
        className={clsx(
          `
            relative z-10
            min-w-9 w-9 h-9
            rounded-2xl
            flex items-center justify-center
            transition-all duration-200
          `,
          active
            ? "text-blue-400"
            : "text-maxify-text-secondary hover:text-blue-300/90 hover:bg-maxify-border/20"
        )}
      >
        <IconComp
          size={17}
          strokeWidth={active ? 2.3 : 1.75}
          className="transition-all duration-200"
        />
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className={clsx(
              `
                relative z-10
                text-[13px] font-medium
                whitespace-nowrap
                overflow-hidden
                max-w-[145px]
                text-left
              `,
              active ? "text-maxify-text" : "text-maxify-text-secondary"
            )}
          >
            {tab.label}
          </motion.span>
        )}
      </AnimatePresence>

      <NavTooltip label={tab.label} expanded={expanded} />
    </motion.button>
  )
}

function AccountButton({ discordUser, active, expanded, onClick }) {
  const avatarURL = discordUser?.avatarURL
  const label = discordUser?.tag || discordUser?.username || "Conta"

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        `
          relative group
          w-full h-12
          flex items-center
          rounded-2xl
          outline-none
          transition-all duration-300
        `,
        expanded ? "justify-start px-2.5 gap-3" : "justify-center px-0"
      )}
      title={label}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="nav-active-pill-account"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 36,
            }}
            className="
              absolute inset-0
              rounded-2xl
              bg-blue-500/15
              border border-blue-400/15
              shadow-[0_0_18px_rgba(59,130,246,0.14)]
            "
          />
        )}
      </AnimatePresence>

      {active && (
        <motion.div
          layoutId="nav-active-line-account"
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 34,
          }}
          className="
            absolute left-0 top-1/2 -translate-y-1/2
            w-[3px] h-6
            rounded-r-full
            bg-blue-400
            shadow-[0_0_14px_rgba(96,165,250,0.7)]
          "
        />
      )}

      <motion.div
        whileHover={{ y: -1, scale: 1.04 }}
        transition={{ duration: 0.18 }}
        className="
          relative z-10
          min-w-10 w-10 h-10
          rounded-[18px]
          border border-maxify-border
          bg-blue-500/10
          flex items-center justify-center
          transition-all duration-200
          hover:bg-blue-500/15
          hover:border-blue-400/25
          overflow-hidden
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
        "
      >
        {avatarURL ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <img
              src={avatarURL}
              alt="Avatar Discord"
              className="
                h-[30px] w-[30px]
                rounded-full
                object-cover
                border border-blue-400/25
                shadow-[0_0_12px_rgba(59,130,246,0.20)]
              "
              draggable={false}
            />

            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        ) : (
          <User size={16} strokeWidth={1.9} className="text-blue-300/80" />
        )}

        <span
          className={clsx(
            `
              absolute right-[5px] bottom-[5px]
              w-2.5 h-2.5
              rounded-full
              border-[2px] border-maxify-bg
            `,
            discordUser
              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.65)]"
              : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.55)]"
          )}
        />
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 min-w-0 text-left"
          >
            <p className="text-[13px] font-medium text-maxify-text truncate max-w-[125px]">
              {discordUser ? label : "Conta"}
            </p>
            <p className="text-[10px] text-maxify-text-secondary truncate max-w-[125px]">
              {discordUser ? "Conectado" : "Entrar"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <NavTooltip label={discordUser ? label : "Conta"} expanded={expanded} />
    </motion.button>
  )
}

export default function Nav({ expanded, setExpanded }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [discordUser, setDiscordUser] = useState(null)

  const activeTab =
    Object.entries(tabs).find(([, tab]) => tab.path === location.pathname)?.[0] ??
    null

  const allTabs = Object.entries(tabs)

  const mainTabs = allTabs.filter(([id]) => id !== "settings")
  const settingsTab = allTabs.filter(([id]) => id === "settings")

  const accountActive =
    location.pathname === "/login_pagina" || location.pathname === "/conta"

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev
      localStorage.setItem("maxify:nav-expanded", String(next))
      return next
    })
  }

  useEffect(() => {
    let removeDiscordListener = null
    let mounted = true

    async function loadDiscordUser() {
      try {
        const user = await invoke({ channel: "get-discord-user" })

        if (mounted) {
          setDiscordUser(user || null)
        }
      } catch {
        if (mounted) {
          setDiscordUser(null)
        }
      }
    }

    loadDiscordUser()

    if (window.electron?.on) {
      removeDiscordListener = window.electron.on(
        "discord-user-updated",
        (user) => {
          setDiscordUser(user || null)
        }
      )
    }

    return () => {
      mounted = false

      if (typeof removeDiscordListener === "function") {
        removeDiscordListener()
      }
    }
  }, [])

  return (
    <motion.aside
      initial={{ x: -22, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        width: expanded ? 230 : 66,
      }}
      transition={{
        width: {
          type: "spring",
          stiffness: 360,
          damping: 34,
        },
        opacity: { duration: 0.25 },
        x: { duration: 0.35, ease: "easeOut" },
      }}
      className="
        fixed left-0 top-[50px] bottom-0 z-40
        bg-maxify-bg/80
        backdrop-blur-2xl
        border-r border-maxify-border
        flex flex-col items-center
        overflow-visible
      "
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-blue-400/20 via-blue-500/5 to-transparent" />
        <div className="absolute -left-12 top-10 w-28 h-28 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -right-12 bottom-10 w-28 h-28 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div
        className="
          relative z-10
          w-full h-full
          flex flex-col
          py-3
        "
      >
        <div
          className={clsx(
            `
              w-full
              px-3
              mb-3
              flex items-center
              transition-all duration-300
            `,
            expanded ? "justify-end" : "justify-center"
          )}
        >
          <motion.button
            type="button"
            onClick={toggleExpanded}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            className="
              w-10 h-10
              rounded-xl
              bg-maxify-card/70
              border border-maxify-border
              flex items-center justify-center
              text-maxify-text-secondary
              transition-all duration-200
              hover:text-maxify-text
              hover:bg-maxify-border/20
              hover:border-blue-400/20
            "
            title={expanded ? "Recolher menu" : "Expandir menu"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={expanded ? "close" : "open"}
                initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 10, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {expanded ? (
                  <PanelLeftClose size={18} strokeWidth={2} />
                ) : (
                  <PanelLeftOpen size={18} strokeWidth={2} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        <div
          className={clsx(
            "mx-3 h-px bg-maxify-border/70 mb-2 transition-all duration-300",
            expanded ? "w-[calc(100%-24px)]" : "w-8 self-center"
          )}
        />

        <nav
          className="
            flex-1
            w-full
            px-2
            space-y-1.5
            overflow-y-auto
            overflow-x-visible
            custom-nav-scroll
          "
        >
          {mainTabs.map(([id, tab]) => (
            <NavButton
              key={id}
              id={id}
              tab={tab}
              active={activeTab === id}
              expanded={expanded}
              onClick={() => navigate(tab.path)}
            />
          ))}
        </nav>

        <div className="w-full px-2 pt-2 mt-2 border-t border-maxify-border/60 space-y-1.5">
          {settingsTab.map(([id, tab]) => (
            <NavButton
              key={id}
              id={id}
              tab={tab}
              active={activeTab === id}
              expanded={expanded}
              onClick={() => navigate(tab.path)}
            />
          ))}

          <AccountButton
            discordUser={discordUser}
            active={accountActive}
            expanded={expanded}
            onClick={() => navigate("/login_pagina")}
          />
        </div>
      </div>
    </motion.aside>
  )
}