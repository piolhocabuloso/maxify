import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import TitleBar from "./components/titlebar"
import Nav from "./components/nav"
import "./app.css"

import { ToastContainer, Slide } from "react-toastify"

import Home from "./pages/Home"
import Clean from "./pages/Clean"
import Apps from "./pages/Apps"
import Utilities from "./pages/Utilities"
import DNS from "./pages/DNS"
import Settings from "./pages/Settings"
import Backup from "./pages/Backup"

import FirstTime from "./components/firsttime"
import UpdateManager from "./components/updatemanager"
import Login from "./pages/Login" // ← CORRIGIDO: Importando da pasta pages

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
  
  // 👉 CONTROLE DE LOGIN - sem precisar de digitar a key novamente
  // const [logado, setLogado] = useState(
  //   !!localStorage.getItem("userKey")
  // )

  // 👉 CONTROLE DE LOGIN
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    const applyTheme = (theme) => {
      document.body.classList.remove("light", "dark")

      if (theme === "system" || !theme) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"

        document.body.classList.add(systemTheme)
        document.body.setAttribute("data-theme", systemTheme)
      } else {
        document.body.classList.add(theme)
        document.body.setAttribute("data-theme", theme)
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

  // 🔐 SE NÃO TIVER LOGADO → MOSTRA LOGIN COM TITLEBAR
  if (!logado) {
    return (
      <div className="flex flex-col h-screen bg-sparkle-bg text-sparkle-text">
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

  // ✅ APP NORMAL DEPOIS DO LOGIN
  return (
    <div className="flex flex-col h-screen bg-sparkle-bg text-sparkle-text overflow-hidden">
      <FirstTime />

      <TitleBar />

      <Nav />

      <div className="flex flex-1 pt-[50px] relative">
        <main className="flex-1 p-6 transition-all duration-300 ease-in-out">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clean" element={<Clean />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/dns" element={<DNS />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <UpdateManager />

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