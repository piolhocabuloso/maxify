import { useState, useEffect, lazy, Suspense } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, LockKeyhole, Sparkles, Cpu, Zap } from "lucide-react"

import TitleBar from "./components/titlebar"
import Nav from "./components/nav"
import "./App.css"

import { ToastContainer, Slide } from "react-toastify"

import FirstTime from "./components/firsttime"
import DiscordAuthGate from "./components/DiscordAuthGate"
import Login from "./pages/Login"
import PremiumLocked from "./components/PremiumLocked"
import { canAccessRoute, getAccessMode } from "./lib/access"

// Lazy loading das páginas
const Home = lazy(() => import("./pages/Home"))
const Clean = lazy(() => import("./pages/Clean"))
const Aplicativos = lazy(() => import("./pages/Aplicativos"))
const Apps = lazy(() => import("./pages/Apps"))
const Utilities = lazy(() => import("./pages/Utilities"))
const DNS = lazy(() => import("./pages/DNS"))
const Settings = lazy(() => import("./pages/Settings"))
const Desativar = lazy(() => import("./pages/Desativar"))
const Backup = lazy(() => import("./pages/Backup"))
const Otimizacao = lazy(() => import("./pages/Otimizacao"))
const Memory = lazy(() => import("./pages/Memory"))
const Prioridade = lazy(() => import("./pages/Prioridade"))
const AutoClean = lazy(() => import("./pages/AutoClean"))
const Login_pagina = lazy(() => import("./pages/Login_pagina"))
const OfficeInstaller = lazy(() => import("./pages/OfficeInstaller"))
const Startup = lazy(() => import("./pages/Startup"))
const EssentialInstaller = lazy(() => import("./pages/EssentialInstaller"))

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

function PageLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-maxify-text-secondary">
          Carregando página...
        </p>
      </div>
    </div>
  )
}

function GuardedPage({ path, children, title }) {
  if (!canAccessRoute(path)) {
    return <PremiumLocked title={title} />
  }

  return children
}

function App() {
  const navigate = useNavigate()

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
  const [discordUser, setDiscordUser] = useState(null)
  const [checkingDiscordAuth, setCheckingDiscordAuth] = useState(true)
  const [logado, setLogado] = useState(() => localStorage.getItem("maxify:logged") === "true")
  const [accessMode, setAccessMode] = useState(() => getAccessMode())
  const [verificandoLogin, setVerificandoLogin] = useState(() => getAccessMode() === "free" && localStorage.getItem("maxify:logged") === "true")

  const [navExpanded, setNavExpanded] = useState(() => {
    return localStorage.getItem("maxify:nav-expanded") === "true"
  })

  useEffect(() => {
    let mounted = true

    async function syncSessionWithMain() {
      const mode = getAccessMode()

      if (mode !== "free" && mode !== "premium") {
        if (mounted) setVerificandoLogin(false)
        return
      }

      try {
        const result = mode === "free"
          ? await window.electron?.auth?.loginFree?.()
          : await window.electron?.auth?.loginSaved?.()

        if (!mounted) return

        if (result?.success) {
          setAccessMode(mode)
          setLogado(true)
          setVerificandoLogin(false)
          return
        }

        console.warn(`Falha ao sincronizar sess??o ${mode}:`, result?.error)
        localStorage.removeItem("maxify:logged")
        localStorage.removeItem("maxify:access-mode")
        setAccessMode("guest")
        setLogado(false)
        setVerificandoLogin(false)
      } catch (error) {
        console.error(`Erro ao sincronizar sess??o ${mode} com o main:`, error)
        if (!mounted) return
        localStorage.removeItem("maxify:logged")
        localStorage.removeItem("maxify:access-mode")
        setAccessMode("guest")
        setLogado(false)
        setVerificandoLogin(false)
      }
    }

    const handleLogout = () => {
      setLogado(false)
      setAccessMode("guest")

      try {
        window.location.hash = "#/"
      } catch {}
    }

    syncSessionWithMain()

    window.addEventListener("maxify:logout", handleLogout)

    return () => {
      mounted = false
      window.removeEventListener("maxify:logout", handleLogout)
    }
  }, [])

  useEffect(() => {
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


  useEffect(() => {
    let mounted = true

    async function loadDiscordAuthUser() {
      try {
        const result = await window.electron?.discordAuth?.getUser?.()
        if (!mounted) return
        setDiscordUser(result?.user || null)
      } catch {
        if (mounted) setDiscordUser(null)
      } finally {
        if (mounted) setCheckingDiscordAuth(false)
      }
    }

    loadDiscordAuthUser()

    return () => {
      mounted = false
    }
  }, [])

  if (verificandoLogin) {
    return <CheckingAccessScreen />
  }

  if (checkingDiscordAuth) {
    return <CheckingAccessScreen />
  }

  if (!discordUser) {
    return (
      <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text">
        <TitleBar />
        <div className="flex-1 min-h-0">
          <DiscordAuthGate onAuthenticated={(user) => setDiscordUser(user)} />
        </div>
      </div>
    )
  }

  if (!logado) {
    return (
      <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text">
        <TitleBar />

        <div className="flex-1 flex items-center justify-center">
          <Login
            onLogin={() => {
              const mode = getAccessMode()
              setAccessMode(mode)
              setLogado(true)
              navigate("/", { replace: true })
            }}
          />
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

      <Nav expanded={navExpanded} setExpanded={setNavExpanded} accessMode={accessMode} />

      <div
        className="
          flex-1
          pt-[50px]
          min-h-0
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
        "
        style={{
          paddingLeft: navExpanded ? "216px" : "50px",
        }}
      >
        <main
          className="
            w-full
            h-full
            min-w-0
            p-5
            overflow-hidden
          "
        >
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/clean" element={<Clean />} />
              <Route path="/backup" element={<GuardedPage path="/backup" title="Backup"><Backup /></GuardedPage>} />
              <Route path="/utilities" element={<GuardedPage path="/utilities" title="Utilitários"><Utilities /></GuardedPage>} />
              <Route path="/aplicativos" element={<GuardedPage path="/aplicativos" title="Central de Recursos"><Aplicativos /></GuardedPage>} />
              <Route path="/desativar" element={<GuardedPage path="/desativar" title="Desativar Serviços"><Desativar /></GuardedPage>} />
              <Route path="/dns" element={<GuardedPage path="/dns" title="DNS"><DNS /></GuardedPage>} />
              <Route path="/apps" element={<GuardedPage path="/apps" title="Input Lag"><Apps /></GuardedPage>} />
              <Route path="/otimizacao" element={<GuardedPage path="/otimizacao" title="Otimização"><Otimizacao /></GuardedPage>} />
              <Route path="/prioridade" element={<GuardedPage path="/prioridade" title="Prioridade de Jogos"><Prioridade /></GuardedPage>} />
              <Route path="/memory" element={<GuardedPage path="/memory" title="Memória RAM"><Memory /></GuardedPage>} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/autoclean" element={<GuardedPage path="/autoclean" title="Limpeza Automática"><AutoClean /></GuardedPage>} />
              <Route path="/login_pagina" element={<Login_pagina />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/office_installer" element={<GuardedPage path="/office_installer" title="Instalador Office"><OfficeInstaller /></GuardedPage>} />
              <Route path="/startup" element={<GuardedPage path="/startup" title="Inicialização"><Startup /></GuardedPage>} />
              <Route path="/essential_installer" element={<GuardedPage path="/essential_installer" title="Essenciais"><EssentialInstaller /></GuardedPage>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
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
