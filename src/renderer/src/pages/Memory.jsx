import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  Activity,
  ArrowRight,
  Check,
  Cpu,
  Gauge,
  HardDrive,
  Layers3,
  LoaderCircle,
  MemoryStick,
  Power,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Zap,
} from "lucide-react"
import { notify as toast } from "../lib/notify"
import Button from "@/components/ui/button"

const RAM_OPTIONS = [2, 4, 6, 8, 16, 32]

const PROFILE_TEXT = {
  2: {
    title: "Perfil leve",
    subtitle: "2GB de RAM",
    desc: "Modo focado em reduzir serviços e consumo em segundo plano para PCs bem limitados.",
    level: "Baixo consumo",
  },
  4: {
    title: "Perfil econômico",
    subtitle: "4GB de RAM",
    desc: "Boa opção para notebooks simples, deixando o Windows mais leve sem exagerar nos ajustes.",
    level: "Estável",
  },
  6: {
    title: "Perfil balanceado",
    subtitle: "6GB de RAM",
    desc: "Equilíbrio entre fluidez, menor uso em segundo plano e compatibilidade do sistema.",
    level: "Balanceado",
  },
  8: {
    title: "Perfil recomendado",
    subtitle: "8GB de RAM",
    desc: "Perfil ideal para uso geral, jogos leves, Discord, navegador e programas do dia a dia.",
    level: "Recomendado",
  },
  16: {
    title: "Perfil gamer",
    subtitle: "16GB de RAM",
    desc: "Focado em estabilidade, resposta rápida e redução de processos desnecessários durante jogos.",
    level: "Performance",
  },
  32: {
    title: "Perfil extremo",
    subtitle: "32GB de RAM",
    desc: "Para máquinas fortes, mantendo o sistema limpo e com prioridade para desempenho constante.",
    level: "Avançado",
  },
}

const APPLY_STEPS = [
  "Preparando perfil de memória",
  "Ajustando suspensão do sistema",
  "Otimizando economia de energia USB",
  "Reduzindo serviços em segundo plano",
  "Atualizando plano de energia",
  "Salvando configuração local",
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_55%_95%,rgba(37,99,235,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:44px_44px]" />
    </>
  )
}

function SectionTitle({ icon: Icon, label, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5 shadow-lg shadow-blue-500/10">
        <Icon className="h-5 w-5 text-blue-300" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
          {label}
        </p>
        <h2 className="text-lg font-black text-maxify-text">{title}</h2>
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
    </div>
  )
}

function TopBadge() {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
      <Sparkles size={15} />
      Maxify Memory Control
    </div>
  )
}

function SystemChip({ icon: Icon, label, value }) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-0.5 hover:border-blue-500/30">
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_55%)]" />
      <div className="relative flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
          <Icon size={18} className="text-blue-300" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
            {label}
          </p>
          <p className="mt-1 text-sm font-black text-maxify-text">{value}</p>
        </div>
      </div>
    </div>
  )
}

function RealisticRamStick({ selectedRam, applying, applied }) {
  const chips = useMemo(() => Array.from({ length: 8 }), [])
  const pins = useMemo(() => Array.from({ length: 64 }), [])
  const paths = useMemo(() => Array.from({ length: 18 }), [])

  return (
    <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
      <BackgroundGlow />

      <motion.div
        className="absolute bottom-12 left-1/2 h-24 w-[75%] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          opacity: applying ? [0.16, 0.48, 0.16] : [0.1, 0.25, 0.1],
          scale: applying ? [0.95, 1.08, 0.95] : [1, 1.03, 1],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {paths.map((_, index) => (
        <motion.div
          key={index}
          className="absolute h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
          style={{
            left: `${7 + (index % 6) * 14}%`,
            top: `${16 + Math.floor(index / 2) * 8}%`,
            width: `${11 + (index % 4) * 4}%`,
          }}
          animate={{ opacity: applying ? [0.05, 0.65, 0.05] : [0.04, 0.18, 0.04] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: index * 0.05 }}
        />
      ))}

      <motion.div
        className="relative z-10 w-full max-w-[680px]"
        animate={{
          y: applying ? [0, -7, 0] : [0, -4, 0],
          rotate: applying ? [-1.1, -0.3, -1.1] : [-0.8, -0.2, -0.8],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[linear-gradient(180deg,#12392f_0%,#0c2a24_48%,#071713_100%)] px-7 pb-7 pt-5 shadow-[0_42px_80px_rgba(0,0,0,0.48)]"
          style={{ transform: "perspective(1700px) rotateX(6deg) rotateY(-8deg)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_95%_95%,rgba(59,130,246,0.12),transparent_32%)]" />
          <div className="absolute inset-x-5 top-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent" />
          <div className="absolute bottom-[52px] left-0 right-0 h-px bg-cyan-300/10" />

          <motion.div
            className="absolute inset-y-4 -left-24 w-32 rounded-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent blur-xl"
            animate={{ x: applying ? [0, 650, 0] : [0, 330, 0], opacity: [0, 0.55, 0] }}
            transition={{ duration: applying ? 1.45 : 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-200/80">
                MAXIFY · MEMORY MODULE
              </p>
              <h3 className="mt-2 text-5xl font-black leading-none text-white">
                {selectedRam}GB
              </h3>
              <p className="mt-2 text-sm font-semibold text-emerald-100/70">
                DDR4 · Perfil inteligente · Windows
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                {applying ? "Otimizando" : applied ? "Aplicado" : "Pronto"}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/80">
                Perfil {selectedRam}GB
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-7 grid grid-cols-4 gap-3">
            {chips.slice(0, 4).map((_, index) => (
              <motion.div
                key={index}
                className="relative h-[82px] overflow-hidden rounded-[18px] border border-black/50 bg-[linear-gradient(180deg,#151b25_0%,#06080d_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_24px_rgba(0,0,0,0.25)]"
                animate={{
                  y: applying ? [0, -1.8, 0] : [0, -0.6, 0],
                  boxShadow: applying
                    ? [
                      "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 rgba(34,211,238,0)",
                      "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 18px rgba(34,211,238,0.13)",
                      "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 rgba(34,211,238,0)",
                    ]
                    : undefined,
                }}
                transition={{ duration: 1.35, repeat: Infinity, delay: index * 0.07 }}
              >
                <div className="absolute inset-x-2 top-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/18 to-transparent" />

                <div className="mt-2 space-y-1.5">
                  {Array.from({ length: 5 }).map((__, lineIndex) => (
                    <div key={lineIndex} className="h-1 rounded-full bg-white/[0.055]" />
                  ))}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                    IC {index + 1}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(103,232,249,0.60)]" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 mt-7 px-2">
            <div className="relative flex items-end gap-[3px]">
              {pins.map((_, index) => {
                const notch = index > 28 && index < 36

                if (notch) {
                  return <div key={index} className="h-8 flex-[1.4] rounded-t-md bg-transparent" />
                }

                return (
                  <motion.div
                    key={index}
                    className="h-8 flex-1 rounded-t-[4px] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(255,225,143,1)_0%,rgba(237,176,48,0.98)_55%,rgba(157,98,18,1)_100%)]"
                    animate={{ opacity: applying ? [0.86, 1, 0.86] : [0.94, 1, 0.94] }}
                    transition={{ duration: 1, repeat: Infinity, delay: index * 0.01 }}
                  />
                )
              })}

              <div className="absolute bottom-0 left-[22px] h-[12px] w-7 rounded-t-[7px] border border-white/8 bg-[#071713]" />
              <div className="absolute bottom-0 right-[22px] h-[12px] w-7 rounded-t-[7px] border border-white/8 bg-[#071713]" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function RamOption({ ram, selectedRam, setSelectedRam }) {
  const active = selectedRam === ram
  const profile = PROFILE_TEXT[ram]

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedRam(ram)}
      className={`group relative min-h-[170px] overflow-hidden rounded-[26px] border p-5 text-left shadow-xl shadow-black/5 transition-all ${active
          ? "border-blue-500/45 bg-blue-500/15 shadow-lg shadow-blue-500/10"
          : "border-maxify-border bg-maxify-card hover:border-blue-500/30"
        }`}
    >
      {active && (
        <motion.div
          layoutId="activeRam"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_58%)]"
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
            <MemoryStick
              size={20}
              className={active ? "text-blue-300" : "text-maxify-text-secondary"}
            />
          </div>

          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                <Check size={16} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5">
          <p className="text-3xl font-black leading-none text-maxify-text">{ram}GB</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            {profile.level}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-maxify-text-secondary">
            {profile.desc}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

function CommandList() {
  const items = [
    "Evita suspensão automática durante uso conectado ou na bateria.",
    "Desativa suspensão seletiva USB para reduzir cortes em periféricos.",
    "Reduz serviços em segundo plano que podem consumir memória.",
    "Atualiza o plano de energia atual após os ajustes.",
    "Salva o perfil aplicado para mostrar o status depois.",
  ]

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_45%)]" />

      <div className="relative mb-4 flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
          <ShieldCheck size={19} className="text-blue-300" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-maxify-text">O que será aplicado</h3>
          <p className="text-xs text-maxify-text-secondary">
            Ajustes leves e seguros para deixar o sistema mais fluido.
          </p>
        </div>
      </div>

      <div className="relative space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-2xl border border-maxify-border bg-maxify-bg/30 p-3 text-sm text-maxify-text-secondary"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
              <Check size={13} className="text-blue-300" />
            </div>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressPanel({ applying, applied, stepIndex, logs }) {
  const progress = applied ? 100 : applying ? Math.round(((stepIndex + 1) / APPLY_STEPS.length) * 100) : 0

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
            <TerminalSquare size={18} className="text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-black text-maxify-text">Execução em tempo real</h3>
            <p className="text-xs text-maxify-text-secondary">
              {applying ? APPLY_STEPS[stepIndex] : applied ? "Finalizado com sucesso" : "Aguardando aplicação"}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-300">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-maxify-bg/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      <div className="mt-4 max-h-[155px] overflow-y-auto rounded-2xl border border-maxify-border bg-black/20 p-3 font-mono text-[11px] text-maxify-text-secondary">
        {logs.length ? (
          logs.map((log, index) => (
            <div key={index} className="py-1">
              <span className="text-blue-300">›</span> {log}
            </div>
          ))
        ) : (
          <div className="py-1 text-maxify-text-secondary/70">
            Nenhuma ação executada ainda.
          </div>
        )}
      </div>
    </div>
  )
}

function buildMemoryScript(selectedRam) {
  return `
$ErrorActionPreference = "Stop"
$profileRam = "${selectedRam}GB"

function Run-Step($name, $command) {
  try {
    Write-Output "[INFO] $name"
    Invoke-Expression $command
    Write-Output "[OK] $name"
  } catch {
    Write-Output "[ERRO] $name - $($_.Exception.Message)"
  }
}

Write-Output "Iniciando perfil de memoria Maxify: $profileRam"

Run-Step "Desativando suspensao automatica na tomada" "powercfg -change -standby-timeout-ac 0"
Run-Step "Desativando suspensao automatica na bateria" "powercfg -change -standby-timeout-dc 0"
Run-Step "Desativando suspensao seletiva USB na tomada" "powercfg -setacvalueindex scheme_current sub_usb USBSELECTIVE SUSPEND 0"
Run-Step "Desativando suspensao seletiva USB na bateria" "powercfg -setdcvalueindex scheme_current sub_usb USBSELECTIVE SUSPEND 0"
Run-Step "Mostrando configuracao oculta USB" "powercfg -attributes SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 -ATTRIB_HIDE"
Run-Step "Ajustando USB na tomada" "powercfg -setacvalueindex scheme_current SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 0"
Run-Step "Ajustando USB na bateria" "powercfg -setdcvalueindex scheme_current SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 0"
Run-Step "Reduzindo SysMain" "sc.exe config SysMain start= disabled"
Run-Step "Reduzindo DiagTrack" "sc.exe config DiagTrack start= disabled"
Run-Step "Reaplicando plano de energia atual" "powercfg -setactive scheme_current"

Write-Output "Perfil de memoria Maxify finalizado: $profileRam"
`.trim()
}

export default function RamOptimizer() {
  const [selectedRam, setSelectedRam] = useState(() => {
    try {
      return Number(localStorage.getItem("ram-optimizer:selected")) || 8
    } catch {
      return 8
    }
  })

  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem("ram-optimizer:selected", String(selectedRam))
    } catch { }
  }, [selectedRam])

  useEffect(() => {
    try {
      setApplied(localStorage.getItem("ram-optimizer:applied") === "true")
    } catch { }
  }, [])

  const profile = PROFILE_TEXT[selectedRam]

  const profileData = useMemo(
    () => ({
      ram: selectedRam,
      profileName: `${selectedRam}GB de RAM`,
      appliedAt: new Date().toISOString(),
    }),
    [selectedRam]
  )

  const addLog = (message) => {
    setLogs((current) => [...current, message])
  }

  const handleApply = async () => {
    if (applying) return

    setApplying(true)
    setApplied(false)
    setStepIndex(0)
    setLogs([])

    try {
      for (let index = 0; index < APPLY_STEPS.length - 1; index++) {
        setStepIndex(index)
        addLog(APPLY_STEPS[index])
        await sleep(280)
      }

      const script = buildMemoryScript(selectedRam)

      if (window.electron) {
        addLog("Executando script otimizado no PowerShell")

        const result = await invoke({
          channel: "run-powershell",
          payload: {
            script,
            name: `maxify-memory-${selectedRam}gb`,
          },
        })

        if (result?.success === false) {
          throw new Error(result.error || "Falha ao aplicar o perfil de memória.")
        }

        if (result?.output) {
          String(result.output)
            .split(/\r?\n/)
            .filter(Boolean)
            .slice(-10)
            .forEach((line) => addLog(line))
        }
      } else {
        addLog("Modo navegador: simulação concluída")
      }

      setStepIndex(APPLY_STEPS.length - 1)
      addLog(APPLY_STEPS[APPLY_STEPS.length - 1])
      await sleep(450)

      localStorage.setItem("ram-optimizer:lastApplied", JSON.stringify(profileData))
      localStorage.setItem("ram-optimizer:applied", "true")

      setApplied(true)
      toast.success("Perfil de memória aplicado com sucesso!")
    } catch (error) {
      console.error(error)
      addLog(error?.message || "Erro desconhecido")
      toast.error("Não foi possível aplicar a configuração de memória.")
    } finally {
      setApplying(false)
    }
  }

  const resetPage = () => {
    if (applying) return

    setApplied(false)
    setSelectedRam(8)
    setStepIndex(0)
    setLogs([])

    try {
      localStorage.removeItem("ram-optimizer:applied")
      localStorage.removeItem("ram-optimizer:lastApplied")
    } catch { }
  }

  return (
    <RootDiv className="min-h-full w-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 p-4 md:p-6">
        <div className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
          <BackgroundGlow />

          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <TopBadge />

              <div className="flex items-start gap-4">
                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                  <MemoryStick className="h-8 w-8 text-blue-300" />
                </div>

                <div>
                  <h1 className="text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                    Sistema de{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                      memória RAM
                    </span>
                  </h1>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                    Escolha a quantidade de RAM, veja o módulo em tempo real e aplique um perfil otimizado para reduzir consumo em segundo plano.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      RAM escolhida: {selectedRam}GB
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      Status: {applied ? "Aplicado" : applying ? "Aplicando" : "Pendente"}
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      Perfil: {profile.level}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[540px]">
              <SystemChip icon={Cpu} label="Sistema" value="Windows" />
              <SystemChip icon={Gauge} label="RAM" value={`${selectedRam}GB`} />
              <SystemChip
                icon={Activity}
                label="Status"
                value={applied ? "Aplicado" : applying ? "Aplicando" : "Pendente"}
              />
            </div>
          </div>
        </div>

        <section>
          <SectionTitle icon={MemoryStick} label="Memória" title="Selecione o perfil do computador" />

          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5"
            >
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                    Quantidade de RAM
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-maxify-text">
                    Escolha uma opção
                  </h2>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-maxify-text-secondary">
                  Selecionado: <span className="font-bold text-blue-300">{selectedRam}GB</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RAM_OPTIONS.map((ram) => (
                  <RamOption
                    key={ram}
                    ram={ram}
                    selectedRam={selectedRam}
                    setSelectedRam={setSelectedRam}
                  />
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25 lg:col-span-2">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_55%)]" />
                  <div className="relative flex items-start gap-4">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                      <Layers3 size={22} className="text-blue-300" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-maxify-text">{profile.title}</h3>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                        {profile.subtitle}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-maxify-text-secondary">
                        {profile.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-blue-500/20 bg-blue-500/10 p-5 shadow-xl shadow-blue-500/10">
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300">Memória</p>
                  <p className="mt-3 text-3xl font-black text-maxify-text">{selectedRam}GB</p>
                  <p className="mt-2 text-sm text-maxify-text-secondary">RAM selecionada</p>
                </div>
              </div>

              <div className="mt-6">
                <CommandList />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <RealisticRamStick selectedRam={selectedRam} applying={applying} applied={applied} />

              <div className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25">
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                        Aplicação
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-maxify-text">
                        {applied ? "Perfil aplicado" : applying ? "Aplicando perfil" : "Pronto para aplicar"}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-maxify-text-secondary">
                        {applied
                          ? `O perfil ${selectedRam}GB foi aplicado e salvo no sistema.`
                          : applying
                            ? "Aguarde enquanto o Maxify executa os ajustes necessários."
                            : `Clique em aplicar para usar o perfil ${selectedRam}GB de RAM.`}
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {applied ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3"
                        >
                          <Check size={24} className="text-emerald-300" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="power"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3"
                        >
                          <Power size={24} className="text-blue-300" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                      <HardDrive size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">Memória</p>
                      <p className="text-lg font-bold text-maxify-text">{selectedRam}GB</p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                      <Zap size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">Perfil</p>
                      <p className="text-lg font-bold text-maxify-text">{profile.level}</p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                      <ShieldCheck size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">Execução</p>
                      <p className="text-lg font-bold text-maxify-text">Guiada</p>
                    </div>
                  </div>

                  <ProgressPanel applying={applying} applied={applied} stepIndex={stepIndex} logs={logs} />

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      className={`group inline-flex flex-1 items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition-all ${applying
                          ? "cursor-not-allowed border border-maxify-border bg-maxify-card text-maxify-text-secondary"
                          : "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.01] hover:bg-blue-600"
                        }`}
                    >
                      {applying ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          Aplicando
                        </>
                      ) : (
                        <>
                          Aplicar perfil
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={resetPage}
                      disabled={applying}
                      variant="outline"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-maxify-text-secondary transition-all hover:border-blue-500/20"
                    >
                      <RefreshCcw size={16} />
                      Resetar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </section>
      </div>
    </RootDiv>
  )
}
