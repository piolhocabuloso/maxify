import { Minus, Square, X, Moon, Sun } from "lucide-react"
import { close, minimize, toggleMaximize } from "../lib/electron"
import sparkleLogo from "../../../../resources/sparklelogo.png"
import { motion } from "framer-motion"
import { useState } from "react"

function TitleBar() {
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "dark"
  )

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    document.body.setAttribute("data-theme", newTheme)
    document.body.classList.remove("dark", "light")
    document.body.classList.add(newTheme)

    localStorage.setItem("theme", newTheme)
  }

  return (
    <div
      style={{ WebkitAppRegion: "drag" }}
      className="
    h-[55px] fixed top-0 left-0 right-0 z-50
    bg-sparkle-bg
    border-b border-sparkle-border-secondary
  "
    >
      {/* CENTRO — MAXIFY */}
      <div className="absolute left-1/2 top-0 h-full flex items-center gap-4 -translate-x-1/2">
        <motion.img
          src={sparkleLogo}
          alt="maxify"
          className="h-7 w-7"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <span
          className="
    text-base font-semibold tracking-wide
    text-sparkle-text-primary
  "
        >
          Maxify
        </span>


        <motion.div
          className="
        bg-blue-500/20 border border-blue-500/30
        p-1.5 px-3 rounded-xl text-center
        text-xs text-blue-400 font-medium
      "
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
        <button
          onClick={toggleTheme}
          className="h-[55px] w-14 flex items-center justify-center hover:bg-sparkle-accent"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>


        <button
          onClick={minimize}
          className="h-[55px] w-14 flex items-center justify-center hover:bg-sparkle-accent"
        >
          <Minus size={18} />
        </button>

        <button
          onClick={toggleMaximize}
          className="h-[55px] w-14 flex items-center justify-center hover:bg-sparkle-accent"
        >
          <Square size={16} />
        </button>

        <button
          onClick={close}
          className="h-[55px] w-14 flex items-center justify-center hover:bg-red-600 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>

  )
}

export default TitleBar
