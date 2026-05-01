import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, LockKeyhole, Sparkles, Cpu, Zap } from "lucide-react"

import TitleBar from "./components/titlebar"
import Nav from "./components/nav"
import "./app.css"

import { ToastContainer, Slide } from "react-toastify"

import Home from "./pages/Home"
import Clean from "./pages/Clean"
import Aplicativos from "./pages/Aplicativos"
import Apps from "./pages/Apps"
import Utilities from "./pages/Utilities"
import DNS from "./pages/DNS"
import Settings from "./pages/Settings"
import Desativar from "./pages/Desativar"
import Backup from "./pages/Backup"
import Otimizacao from "./pages/Otimizacao"
import Memory from "./pages/Memory"
import Prioridade from "./pages/Prioridade"
import FirstTime from "./components/firsttime"
import Login from "./pages/Login"

import { getDeviceID } from "./lib/device"

const API_URL = "https://apikey-kohl.vercel.app"

function CheckingAccessScreen() {
  return (
    <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text overflow-hidden relative">
      <TitleBar />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -bottom-28 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {[...Array(18)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 rounded-full bg-blue-400/50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.25, 0.8, 0.25],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="
            w-[420px] max-w-[90%]
            rounded-3xl
            border border-maxify-border
            bg-maxify-card/80
            backdrop-blur-xl
            shadow-2xl shadow-blue-500/10
            p-8
            relative
            overflow-hidden
          "
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-700/10"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-7">
              <motion.div
                className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-xl"
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="
                  relative
                  w-24 h-24
                  rounded-3xl
                  border border-blue-400/40
                  bg-blue-500/10
                  flex items-center justify-center
                  shadow-lg shadow-blue-500/20
                "
                animate={{
                  rotate: [0, 2, -2, 0],
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ShieldCheck size={42} className="text-blue-400" />

                <motion.div
                  className="absolute -right-2 -top-2 w-8 h-8 rounded-xl bg-maxify-card border border-maxify-border flex items-center justify-center"
                  animate={{
                    y: [0, -4, 0],
                    rotate: [0, 8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <LockKeyhole size={16} className="text-blue-300" />
                </motion.div>
              </motion.div>
            </div>

            <motion.h1
              className="text-3xl font-bold text-maxify-text mb-2"
              animate={{
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Validando acesso
            </motion.h1>

            <p className="text-sm text-maxify-text-secondary max-w-xs leading-relaxed mb-7">
              Estamos confirmando sua sessão com segurança antes de liberar o Maxify.
            </p>

            <div className="w-full mb-6">
              <div className="w-full h-2 rounded-full bg-maxify-border/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              <motion.div
                className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-3 flex flex-col items-center gap-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                <Cpu size={18} className="text-blue-400" />
                <span className="text-[11px] text-maxify-text-secondary">
                  HWID
                </span>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-3 flex flex-col items-center gap-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              >
                <Sparkles size={18} className="text-blue-400" />
                <span className="text-[11px] text-maxify-text-secondary">
                  Sessão
                </span>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-3 flex flex-col items-center gap-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              >
                <Zap size={18} className="text-blue-400" />
                <span className="text-[11px] text-maxify-text-secondary">
                  Maxify
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
  const [logado, setLogado] = useState(false)
  const [verificandoLogin, setVerificandoLogin] = useState(false)

  

  useEffect(() => {
    const sendInitialLogs = async () => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.sendLogsOnLogin()
        }
      } catch (error) {
        console.error("Erro ao enviar logs iniciais:", error)
      }
    }

    sendInitialLogs()

    const applyTheme = (selectedTheme) => {
      document.body.classList.remove("light", "dark")

      if (selectedTheme === "system" || !selectedTheme) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"

        document.body.classList.add(systemTheme)
        document.body.setAttribute("data-theme", systemTheme)
      } else {
        document.body.classList.add(selectedTheme)
        document.body.setAttribute("data-theme", selectedTheme)
      }
    }

    applyTheme(theme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleSystemThemeChange = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        applyTheme("system")
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === "theme") setTheme(e.newValue || "system")
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [theme])

  if (verificandoLogin) {
    return <CheckingAccessScreen />
  }

  if (!logado) {
    return (
      <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text">
        <TitleBar />

        <div className="flex-1 flex items-center justify-center">
          <Login onLogin={() => setLogado(true)} />
        </div>

        <ToastContainer
          stacked
          limit={5}
          position="bottom-right"
          theme="dark"
          transition={Slide}
          hideProgressBar
          pauseOnFocusLoss={false}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text overflow-hidden">
      <FirstTime />
      <TitleBar />
      <Nav />

      <div className="flex flex-1 pt-[50px] relative">
        <main className="flex-1 p-6 transition-all duration-300 ease-in-out ml-[70px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clean" element={<Clean />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/aplicativos" element={<Aplicativos />} />
            <Route path="/desativar" element={<Desativar />} />
            <Route path="/dns" element={<DNS />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/otimizacao" element={<Otimizacao />} />
            <Route path="/prioridade" element={<Prioridade />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ToastContainer
        stacked
        limit={5}
        position="bottom-right"
        theme="dark"
        transition={Slide}
        hideProgressBar
        pauseOnFocusLoss={false}
      />
    </div>
  )
}

export default App