import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Activity,
  Search,
  Shield,
  Zap,
  TerminalSquare,
  CircleDot,
  Play,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  Monitor,
  Wifi,
  Hash,
  Calendar,
  Award,
  Clock,
  Server,
  HardDrive,
  Database,
  Cpu,
} from "lucide-react"
import { notify as toast } from "../lib/notify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"

const BackgroundGlow = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(59,130,246,0.25),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_45%_105%,rgba(37,99,235,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.30)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.035)_45%,transparent_70%)]" />
    </>
  )
}

const SectionTitle = ({ icon: Icon, label, title, children }) => {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5 shadow-lg shadow-blue-500/10">
          <Icon className="h-5 w-5 text-blue-300" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">{label}</p>
          <h2 className="text-lg font-black text-maxify-text">{title}</h2>
        </div>
        <div className="hidden h-px min-w-[120px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent lg:block" />
      </div>
      {children}
    </div>
  )
}

const MiniStat = ({ icon: Icon, label, value, active }) => {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-4 transition-all ${active ? "border-blue-500/35 bg-blue-500/15 shadow-lg shadow-blue-500/10" : "border-maxify-border bg-maxify-bg/30"}`}>
      {active && (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_55%)]"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
          <Icon size={17} className="text-blue-300" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-maxify-text-secondary">{label}</p>
          <p className="truncate text-lg font-black text-maxify-text">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ActivationCard({ estaAtivando, ativacaoConcluida, error }) {
  const status = estaAtivando ? "Ativando" : ativacaoConcluida ? "Ativado" : error ? "Falha" : "Pronto"
  const stars = useMemo(() => Array.from({ length: 26 }), [])
  const particles = useMemo(() => Array.from({ length: 24 }), [])

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
      <BackgroundGlow />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(59,130,246,0.18),transparent_45%)]" />
      <div className="relative z-10 flex h-full min-h-[382px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-300">Windows Activation Center</p>
            <h2 className="mt-2 text-3xl font-black text-maxify-text">Ativacao do Windows</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-maxify-text-secondary">Ative seu Windows de forma rapida e segura usando o Microsoft Activation Scripts (MAS).</p>
          </div>
          <div className={`rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] ${estaAtivando ? "border-blue-500/30 bg-blue-500/15 text-blue-300" : ativacaoConcluida ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : error ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-yellow-500/25 bg-yellow-500/10 text-yellow-300"}`}>
            {status}
          </div>
        </div>

        <div className="relative mx-auto mt-2 flex h-[322px] w-full max-w-[440px] items-center justify-center overflow-visible">
          {stars.map((_, index) => (
            <motion.span
              key={index}
              className="absolute bg-white/60"
              style={{
                width: index % 5 === 0 ? "8px" : index % 3 === 0 ? "4px" : "2px",
                height: index % 5 === 0 ? "8px" : index % 3 === 0 ? "4px" : "2px",
                left: `${4 + ((index * 29) % 92)}%`,
                top: `${5 + ((index * 41) % 88)}%`,
                borderRadius: index % 5 === 0 ? "0px" : "999px",
                clipPath: index % 5 === 0 ? "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)" : "none",
              }}
              animate={{ opacity: [0.18, 0.75, 0.18], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + (index % 4) * 0.4, repeat: Infinity, delay: index * 0.08 }}
            />
          ))}

          <motion.div
            className="absolute bottom-[22px] h-[48px] w-[330px] rotate-[-12deg] rounded-full bg-black/45 blur-xl"
            animate={{ opacity: estaAtivando ? [0.28, 0.52, 0.28] : 0.34, scaleX: estaAtivando ? [0.88, 1.08, 0.88] : 1 }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />

          <motion.div className="relative h-[292px] w-[370px]" animate={{ y: estaAtivando ? [0, -5, 0] : [0, -2, 0], scale: estaAtivando ? [1, 1.012, 1] : 1 }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute left-[24px] top-[14px] h-[225px] w-[280px] rotate-[-14deg] scale-[1.13]">
              <div className="absolute left-[22px] top-[39px] h-[218px] w-[256px] skew-x-[-14deg] rounded-[28px] bg-[#06113f] shadow-[18px_18px_0_rgba(3,7,18,0.52)]" />
              <div className="absolute left-[13px] top-[27px] h-[220px] w-[268px] skew-x-[-14deg] rounded-[30px] bg-[linear-gradient(145deg,#0f2a76_0%,#10215f_42%,#07133a_75%,#020617_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.12),inset_-10px_-12px_24px_rgba(0,0,0,0.35)]" />
              <div className="absolute left-[20px] top-[34px] h-[194px] w-[252px] skew-x-[-14deg] rounded-[25px] border border-blue-300/10 bg-[radial-gradient(circle_at_24%_18%,rgba(96,165,250,0.22),transparent_30%),linear-gradient(145deg,rgba(30,64,175,0.78),rgba(15,23,42,0.92))]" />

              <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="flex h-[110px] w-[110px] items-center justify-center rounded-[32px] border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-2xl shadow-blue-500/20"
                  animate={{ scale: estaAtivando ? [1, 1.08, 1] : ativacaoConcluida ? [1, 1.05, 1] : 1, rotateY: estaAtivando ? [0, 360] : 0 }}
                  transition={{ duration: estaAtivando ? 2 : 0.5, repeat: estaAtivando ? Infinity : 0 }}
                >
                  {estaAtivando ? <RefreshCw className="animate-spin text-blue-300" size={58} /> : ativacaoConcluida ? <CheckCircle2 className="text-cyan-300" size={62} /> : error ? <XCircle className="text-red-400" size={58} /> : <Key className="text-blue-300" size={58} />}
                </motion.div>
              </div>

              <motion.div className="absolute left-1/2 top-1/2 z-20 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/20" animate={{ rotate: estaAtivando ? 360 : 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute left-1/2 top-1/2 z-20 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10" animate={{ rotate: estaAtivando ? -360 : 0 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />

              {particles.map((_, index) => (
                <motion.span
                  key={index}
                  className="absolute z-[100] rounded-full bg-blue-400/60"
                  style={{ width: `${2 + (index % 4)}px`, height: `${2 + (index % 4)}px`, left: `${15 + ((index * 23) % 70)}%`, top: `${10 + ((index * 17) % 80)}%` }}
                  animate={{ y: [0, -30, 0], x: [0, Math.sin(index) * 15, 0], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 3 + (index % 4), repeat: Infinity, delay: index * 0.1 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div className="absolute right-2 top-2 rounded-[22px] border border-blue-500/25 bg-[#07111f]/85 p-3 backdrop-blur-xl shadow-xl shadow-black/20" animate={{ y: estaAtivando ? [0, -8, 0] : [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            {estaAtivando ? <RefreshCw className="animate-spin text-blue-300" size={28} /> : ativacaoConcluida ? <CheckCircle2 className="text-cyan-300" size={30} /> : error ? <XCircle className="text-red-400" size={28} /> : <Lock className="text-yellow-300" size={28} />}
          </motion.div>

          <motion.div className="absolute left-2 bottom-4 rounded-[22px] border border-maxify-border bg-maxify-card/80 px-4 py-3 backdrop-blur-xl" animate={{ y: [0, 5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Metodo</p>
            <p className="text-2xl font-black text-maxify-text">HWID</p>
          </motion.div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat icon={Monitor} label="Estado" value={status} active={estaAtivando || ativacaoConcluida} />
          <MiniStat icon={Hash} label="Metodo" value="HWID / KMS38" />
          <MiniStat icon={Shield} label="Script" value="MassGrave" />
        </div>
      </div>
    </div>
  )
}

function ExecutionConsole({ logs, estaExecutando }) {
  const consoleEndRef = useRef(null)
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [logs])

  return (
    <Card className="overflow-hidden rounded-[28px] border border-maxify-border bg-[#050914]/80 p-0 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5"><TerminalSquare size={18} className="text-blue-300" /></div>
          <div><h3 className="text-sm font-black text-maxify-text">PowerShell Console</h3><p className="text-xs text-maxify-text-secondary">Execucao do script de ativacao em tempo real</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
          <CircleDot size={12} className={estaExecutando ? "animate-pulse" : ""} />
          {estaExecutando ? "Executando" : "Pronto"}
        </div>
      </div>
      <div className="max-h-[520px] min-h-[280px] overflow-y-auto p-4 font-mono text-xs">
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((item, index) => (
              <div key={index} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${item.type === "success" ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.75)]" : item.type === "error" ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.65)]" : "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.65)]"}`} />
                <p className="leading-5 text-slate-300 whitespace-pre-wrap break-words">{item.text}</p>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center text-center">
            <TerminalSquare size={38} className="mb-3 text-blue-300/70" />
            <p className="font-sans text-sm font-bold text-maxify-text">Aguardando execucao</p>
            <p className="mt-1 font-sans text-xs text-maxify-text-secondary">Clique em "Ativar Windows" para iniciar o processo.</p>
          </div>
        )}
      </div>
    </Card>
  )
}

function Ativacao() {
  const [logsExecucao, setLogsExecucao] = useState([])
  const [estaAtivando, setEstaAtivando] = useState(false)
  const [ativacaoConcluida, setAtivacaoConcluida] = useState(false)
  const [error, setError] = useState(null)
  const [lastActivation, setLastActivation] = useState(localStorage.getItem("windows-last-activation") || null)
  const [stats, setStats] = useState({ totalAttempts: parseInt(localStorage.getItem("windows-activation-attempts") || "0", 10) })

  const addLog = (text, type = "info") => {
    const time = new Date().toLocaleTimeString()
    setLogsExecucao((prev) => [...prev, { text: `[${time}] ${text}`, type }].slice(-100))
  }

  const executarScriptAtivacao = async () => {
    if (estaAtivando) { toast.warning("Ja existe uma ativacao em andamento."); return }
    setEstaAtivando(true)
    setError(null)
    setAtivacaoConcluida(false)
    setLogsExecucao([])
    addLog("Iniciando processo de ativacao do Windows...")
    addLog("Conectando ao servidor do MassGrave...")

    const script = `Set-ExecutionPolicy Bypass -Scope Process -Force
Write-Host "===== Windows Activation Script =====" -ForegroundColor Cyan
Write-Host "Iniciando processo de ativacao..." -ForegroundColor Yellow
try {
    Write-Host "[1/3] Baixando script do MassGrave..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "https://massgrave.dev/get" -UseBasicParsing -ErrorAction Stop
    $scriptContent = $response.Content
    Write-Host "[2/3] Executando script de ativacao..." -ForegroundColor Cyan
    $tempScript = [System.IO.Path]::GetTempFileName()
    $tempScript = [System.IO.Path]::ChangeExtension($tempScript, ".cmd")
    $scriptContent | Out-File -FilePath $tempScript -Encoding ASCII -Force
    Write-Host "Selecionando opcao 1 (HWID Activation)..." -ForegroundColor Yellow
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c echo 1 | ""$tempScript""" -Verb RunAs -Wait -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
    Write-Host "[3/3] Verificando ativacao..." -ForegroundColor Cyan
    $activationStatus = Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object { $_.PartialProductKey -and $_.LicenseStatus -eq 1 } | Select-Object -First 1
    if ($activationStatus) {
        Write-Host "ATIVACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
        Write-Host "MAXIFY_ACTIVATION_SUCCESS=true"
        $edition = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" -Name ProductName).ProductName
        Write-Host "MAXIFY_WINDOWS_EDITION=$edition"
    } else {
        Write-Host "ATIVACAO PODE NAO TER SIDO CONCLUIDA" -ForegroundColor Yellow
        Write-Host "MAXIFY_ACTIVATION_SUCCESS=false"
    }
} catch {
    Write-Host "ERRO durante a ativacao: $_" -ForegroundColor Red
    Write-Host "MAXIFY_ACTIVATION_ERROR=$($_.Exception.Message)"
}`

    try {
      addLog("Executando PowerShell como administrador...")
      const result = await invoke({ channel: "run-powershell", payload: { script, name: `windows-activation-${Date.now()}` } })
      const output = [result?.output, result?.stdout, result?.stderr].filter(Boolean).join("\n").toString()
      addLog("----------------------------------------------")
      
      const lines = output.split(/\r?\n/)
      let foundSuccess = false
      for (const line of lines) {
        const cleanLine = line.replace(/[^\x20-\x7E]/g, "").trim()
        if (!cleanLine) continue
        if (cleanLine.includes("SUCESSO") || cleanLine.includes("CONCLUIDA")) { addLog(cleanLine, "success"); foundSuccess = true }
        else if (cleanLine.includes("ERRO")) addLog(cleanLine, "error")
        else if (cleanLine.length > 0) addLog(cleanLine, "info")
      }
      addLog("----------------------------------------------")

      if (output.includes("MAXIFY_ACTIVATION_SUCCESS=true") || foundSuccess) {
        setAtivacaoConcluida(true)
        const now = new Date().toLocaleString()
        setLastActivation(now)
        localStorage.setItem("windows-last-activation", now)
        const newAttempts = (stats.totalAttempts || 0) + 1
        setStats(prev => ({ ...prev, totalAttempts: newAttempts }))
        localStorage.setItem("windows-activation-attempts", newAttempts.toString())
        addLog("Windows ativado com sucesso! Reinicie o sistema se necessario.", "success")
        toast.success("Windows ativado com sucesso!")
      } else {
        setError("Nao foi possivel completar a ativacao.")
        addLog("Falha na ativacao do Windows", "error")
        toast.error("Falha na ativacao do Windows.")
        const newAttempts = (stats.totalAttempts || 0) + 1
        setStats(prev => ({ ...prev, totalAttempts: newAttempts }))
        localStorage.setItem("windows-activation-attempts", newAttempts.toString())
      }
    } catch (err) {
      setError(err.message || "Erro desconhecido")
      addLog(`Erro: ${err.message}`, "error")
      toast.error(`Erro na ativacao: ${err.message}`)
    } finally {
      setEstaAtivando(false)
    }
  }

  const verificarStatusAtivacao = async () => {
    addLog("Verificando status atual da ativacao...")
    const script = `$products = Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object { $_.PartialProductKey }
$activated = $products | Where-Object { $_.LicenseStatus -eq 1 }
if ($activated) { Write-Host "STATUS: ATIVADO" -ForegroundColor Green; Write-Host "MAXIFY_ACTIVATED=true" } 
else { Write-Host "STATUS: NAO ATIVADO" -ForegroundColor Yellow; Write-Host "MAXIFY_ACTIVATED=false" }`
    try {
      const result = await invoke({ channel: "run-powershell", payload: { script, name: `check-activation-${Date.now()}` } })
      const output = [result?.output, result?.stdout, result?.stderr].filter(Boolean).join("\n").toString()
      if (output.includes("MAXIFY_ACTIVATED=true")) { setAtivacaoConcluida(true); addLog("Windows ja esta ativado!", "success"); toast.info("Windows ja esta ativado.") }
      else { addLog("Windows nao esta ativado. Execute a ativacao.", "warning") }
    } catch (err) { addLog(`Erro ao verificar status: ${err.message}`, "error") }
  }

  const topStats = [
    { title: "Status atual", value: ativacaoConcluida ? "Ativado" : error ? "Falha" : "Pendente", icon: ativacaoConcluida ? <CheckCircle2 size={18} /> : error ? <XCircle size={18} /> : <Lock size={18} />, text: ativacaoConcluida ? "text-cyan-300" : error ? "text-red-300" : "text-blue-300" },
    { title: "Metodo de ativacao", value: "HWID / KMS38", icon: <Key size={18} />, text: "text-blue-300" },
    { title: "Tentativas", value: stats.totalAttempts || 0, icon: <Activity size={18} />, text: "text-sky-300" },
    { title: "Ultima ativacao", value: lastActivation || "Nunca", icon: <Calendar size={18} />, text: lastActivation ? "text-cyan-300" : "text-slate-400" },
  ]

  return (
    <RootDiv>
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 p-4 pb-16 md:p-6">
        <div className="relative overflow-hidden rounded-[38px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 md:p-8">
          <BackgroundGlow />
          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-300"><Sparkles size={15} />Windows Activation Center</div>
              <div className="flex items-start gap-4">
                <div className="rounded-[28px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10"><Key className="text-blue-300" size={34} /></div>
                <div>
                  <h1 className="text-4xl font-black leading-[0.96] text-maxify-text md:text-6xl">Ativacao do <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Windows</span></h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">Ative seu Windows de forma rapida e segura usando o Microsoft Activation Scripts (MAS).</p>
                  <div className="mt-6 flex gap-3">
                    <Button onClick={executarScriptAtivacao} disabled={estaAtivando || ativacaoConcluida} size="lg" variant="primary" className="gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
                      {estaAtivando ? <><RefreshCw className="animate-spin" size={20} /><span>Ativando...</span></> : ativacaoConcluida ? <><CheckCircle2 size={20} /><span>Windows Ativado</span></> : <><Unlock size={20} /><span>Ativar Windows</span></>}
                    </Button>
                    <Button onClick={verificarStatusAtivacao} disabled={estaAtivando} variant="outline" size="lg" className="gap-2 rounded-2xl"><Search size={18} /><span>Verificar Status</span></Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {topStats.map((item, index) => (
                <div key={index} className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_55%)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex items-center justify-between mb-3"><span className={item.text}>{item.icon}</span><ChevronRight size={16} className="text-maxify-text-secondary opacity-60" /></div>
                  <p className={`relative z-10 text-xl font-black md:text-2xl ${item.text}`}>{item.value}</p>
                  <p className="relative z-10 mt-1 text-sm text-maxify-text-secondary">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <ActivationCard estaAtivando={estaAtivando} ativacaoConcluida={ativacaoConcluida} error={error} />
          <ExecutionConsole logs={logsExecucao} estaExecutando={estaAtivando} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
            <SectionTitle icon={Info} label="Guia Rapido" title="Como funciona">
              <div className="flex items-center gap-2 text-xs text-blue-300/70"><Shield size={14} /><span>Metodo seguro e confiavel</span></div>
            </SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3"><div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300"><TerminalSquare size={18} /></div><div><p className="text-sm font-bold text-maxify-text">PowerShell Admin</p><p className="text-xs text-maxify-text-secondary">Script executado com privilegios elevados</p></div></div>
              <div className="flex items-start gap-3 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3"><div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300"><Wifi size={18} /></div><div><p className="text-sm font-bold text-maxify-text">Conexao Internet</p><p className="text-xs text-maxify-text-secondary">Necessaria para baixar o script</p></div></div>
              <div className="flex items-start gap-3 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3"><div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300"><Key size={18} /></div><div><p className="text-sm font-bold text-maxify-text">Ativacao HWID</p><p className="text-xs text-maxify-text-secondary">Ativacao permanente por hardware</p></div></div>
              <div className="flex items-start gap-3 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3"><div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300"><CheckCircle2 size={18} /></div><div><p className="text-sm font-bold text-maxify-text">Verificacao</p><p className="text-xs text-maxify-text-secondary">Confirme em Configuracoes</p></div></div>
            </div>
            <div className="mt-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3"><div className="flex gap-3"><AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" /><div><p className="text-xs font-bold text-amber-300">Aviso importante</p><p className="text-[11px] text-maxify-text-secondary mt-1">Este metodo utiliza o Microsoft Activation Scripts (MAS), ferramenta open-source amplamente utilizada.</p></div></div></div>
          </Card>

          <Card className="rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
            <div className="mb-5 flex items-center gap-3"><div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3"><Info className="text-blue-300" size={22} /></div><div><h2 className="text-lg font-black text-maxify-text">Informacoes adicionais</h2><p className="text-sm text-maxify-text-secondary">Detalhes sobre o processo</p></div></div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"><div className="flex items-center gap-2 mb-2"><Award size={16} className="text-blue-300" /><p className="text-sm font-bold text-maxify-text">O que e HWID?</p></div><p className="text-xs text-maxify-text-secondary leading-relaxed">HWID (Hardware ID) e um metodo de ativacao permanente vinculado ao hardware do seu computador.</p></div>
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"><div className="flex items-center gap-2 mb-2"><Server size={16} className="text-blue-300" /><p className="text-sm font-bold text-maxify-text">Como funciona?</p></div><p className="text-xs text-maxify-text-secondary leading-relaxed">O script se conecta aos servidores oficiais da Microsoft e simula uma atualizacao legitima.</p></div>
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"><div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-blue-300" /><p className="text-sm font-bold text-maxify-text">Seguranca</p></div><p className="text-xs text-maxify-text-secondary leading-relaxed">O MAS e um projeto open-source amplamente auditado pela comunidade.</p></div>
            </div>
            {lastActivation && (<div className="mt-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 p-3"><div className="flex items-center gap-2"><Clock size={14} className="text-blue-300" /><p className="text-xs text-maxify-text-secondary">Ultima ativacao: <span className="text-blue-300">{lastActivation}</span></p></div></div>)}
          </Card>
        </div>
      </div>
    </RootDiv>
  )
}

export default Ativacao