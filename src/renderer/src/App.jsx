import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
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
import UpdatePopup from "./components/UpdatePopup"
import FirstTime from "./components/firsttime"
import Login from "./pages/Login"

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")

  // 👉 CONTROLE DE LOGIN - sem precisar de digitar a key novamente
  const [logado, setLogado] = useState(
    !!localStorage.getItem("userKey")
  )

  // // // 👉 CONTROLE DE LOGIN
  // const [logado, setLogado] = useState(false)

  useEffect(() => {

























    const sendInitialLogs = async () => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.sendLogsOnLogin();
        }
      } catch (error) {
        console.error('Erro ao enviar logs iniciais:', error);
      }
    };

    sendInitialLogs();






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

  // ✅ APP NORMAL DEPOIS DO LOGIN
  return (
    <div className="flex flex-col h-screen bg-maxify-bg text-maxify-text overflow-hidden">
      <FirstTime />
      <TitleBar />
      <UpdatePopup />
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