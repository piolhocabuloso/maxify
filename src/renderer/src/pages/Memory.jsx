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
  Zap,
} from "lucide-react"
import { notify as toast } from "../lib/notify"
import Button from "@/components/ui/button"

const RAM_OPTIONS = [2, 4, 6, 8, 16, 32]

const PROFILE_TEXT = {
  2: {
    title: "2GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 2GB de memória RAM.",
  },
  4: {
    title: "4GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 4GB de memória RAM.",
  },
  6: {
    title: "6GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 6GB de memória RAM.",
  },
  8: {
    title: "8GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 8GB de memória RAM.",
  },
  16: {
    title: "16GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 16GB de memória RAM.",
  },
  32: {
    title: "32GB de RAM",
    desc: "Selecione essa opção caso seu computador tenha 32GB de memória RAM.",
  },
}

function TopBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-200 text-sm font-medium mb-4 shadow-sm">
      <Sparkles size={15} />
      Gerenciador de memória
    </div>
  )
}

function SystemChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4 transition-all duration-300 hover:border-blue-500/20">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10">
          <Icon size={18} className="text-blue-300" />
        </div>

        <div>
          <p className="text-xs text-maxify-text-secondary">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-maxify-text">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function MemoryCore({ selectedRam, applying }) {
  const blocks = useMemo(() => Array.from({ length: 18 }), [])

  return (
    <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 transition-all duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_left,rgba(14,165,233,0.14),transparent_42%)]" />

      {[1, 2, 3].map((item) => (
        <motion.div
          key={item}
          className="absolute rounded-full border border-blue-500/10"
          style={{
            width: 150 + item * 70,
            height: 150 + item * 70,
          }}
          animate={{
            scale: applying ? [1, 1.12, 1] : [1, 1.04, 1],
            opacity: applying ? [0.2, 0.45, 0.2] : [0.1, 0.22, 0.1],
          }}
          transition={{
            duration: 1.6 + item * 0.25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[360px] rounded-[28px] border border-maxify-border bg-maxify-card/80 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
              Memória RAM
            </p>

            <h3 className="mt-1 text-4xl font-black text-maxify-text">
              {selectedRam}GB
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/10">
            <MemoryStick className="text-blue-300" size={26} />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {blocks.map((_, index) => (
            <motion.div
              key={index}
              className="h-10 rounded-xl border border-blue-500/20 bg-blue-500/10"
              animate={{
                opacity: applying ? [0.25, 1, 0.25] : [0.35, 0.7, 0.35],
                y: applying ? [0, -4, 0] : [0, -2, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.04,
              }}
            />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-maxify-border bg-maxify-card p-4">
          <div className="flex items-center justify-between text-xs text-maxify-text-secondary">
            <span>RAM escolhida</span>
            <span className="text-blue-300 font-semibold">{selectedRam}GB</span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-maxify-border">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              animate={{
                width: `${Math.min(100, selectedRam * 3.2)}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RamOption({ ram, selectedRam, setSelectedRam }) {
  const active = selectedRam === ram

  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setSelectedRam(ram)}
      className={`group relative min-h-[220px] overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? "border-blue-500/40 bg-blue-500/15 shadow-lg shadow-blue-500/10"
          : "border-maxify-border bg-maxify-card hover:border-blue-500/20 hover:-translate-y-0.5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeRam"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_55%)]"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <MemoryStick
              size={20}
              className={active ? "text-blue-300" : "text-maxify-text-secondary"}
            />
          </div>

          {active && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/20">
              <Check size={16} className="text-white" />
            </div>
          )}
        </div>

        <p className="mt-5 text-3xl font-black text-maxify-text">{ram}GB</p>

        <p className="mt-1 text-sm text-maxify-text-secondary">
          Memória RAM
        </p>

        <div
          className={`mt-5 flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
            active
              ? "border-blue-500/30 bg-blue-500/15 text-blue-200"
              : "border-blue-500/20 bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/15"
          }`}
        >
          {active ? "Selecionado" : "Selecionar"}
        </div>
      </div>
    </motion.button>
  )
}

function CommandList() {
  const items = [
    "Desativa suspensão automática no carregador e na bateria.",
    "Desativa SysMain para reduzir atividade em segundo plano.",
    "Desliga suspensão seletiva de USB.",
    "Desativa DiagTrack para reduzir telemetria.",
    "Ajusta opções ocultas de energia do USB.",
  ]

  return (
    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5 transition-all duration-300 hover:border-blue-500/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10">
          <ShieldCheck size={19} className="text-blue-300" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-maxify-text">
            O que será aplicado
          </h3>

          <p className="text-xs text-maxify-text-secondary">
            A configuração aplicada é a mesma. A escolha serve apenas para registrar
            a quantidade de RAM do computador.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-maxify-border bg-maxify-card p-3 text-sm text-maxify-text-secondary"
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

  useEffect(() => {
    try {
      localStorage.setItem("ram-optimizer:selected", String(selectedRam))
    } catch {}
  }, [selectedRam])

  const profile = PROFILE_TEXT[selectedRam]

  const profileData = useMemo(
    () => ({
      ram: selectedRam,
      profileName: `${selectedRam}GB de RAM`,
      appliedAt: new Date().toISOString(),
    }),
    [selectedRam]
  )

  const handleApply = async () => {
    if (applying) return

    setApplying(true)
    setApplied(false)

    try {
      const commands = [
        `powercfg -change -standby-timeout-ac 0`,
        `powercfg -change -standby-timeout-dc 0`,
        `sc config SysMain start= disabled`,
        `powercfg -setacvalueindex scheme_current sub_usb USBSELECTIVE SUSPEND 0`,
        `powercfg -setdcvalueindex scheme_current sub_usb USBSELECTIVE SUSPEND 0`,
        `sc config DiagTrack start= disabled`,
        `powercfg -attributes SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 -ATTRIB_HIDE`,
        `powercfg -setacvalueindex scheme_current SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 0`,
        `powercfg -setdcvalueindex scheme_current SUB_USB 2a737441-1930-4402-8d77-b2bebba308a3 0`,
      ]

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

      if (window.electron) {
        for (const command of commands) {
          console.log("[RAM OPTIMIZER]", command)

          const result = await invoke({
            channel: "run-powershell",
            payload: {
              script: command,
              name: "memory-optimizer",
            },
          })

          if (result?.success === false) {
            throw new Error(result.error || `Falha ao executar: ${command}`)
          }

          await delay(300)
        }
      }

      await delay(900)

      localStorage.setItem("ram-optimizer:lastApplied", JSON.stringify(profileData))
      localStorage.setItem("ram-optimizer:applied", "true")

      setApplied(true)
      toast.success("Configuração de memória aplicada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível aplicar a configuração de memória.")
    } finally {
      setApplying(false)
    }
  }

  const resetPage = () => {
    if (applying) return

    setApplied(false)
    setSelectedRam(8)
  }

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        <div className="mt-8 rounded-[28px] border border-maxify-border bg-maxify-card p-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.14),transparent_40%)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="max-w-3xl">
              <TopBadge />

              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30 shadow-xl shadow-blue-500/20 backdrop-blur">
                  <MemoryStick className="w-8 h-8 text-blue-300" />
                </div>

                <div>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight text-maxify-text">
                    Otimização de{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      memória RAM
                    </span>
                  </h1>

                  <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                    Escolha a quantidade de memória RAM do seu computador e aplique
                    a configuração automática do sistema.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                      RAM escolhida: {selectedRam}GB
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                      Status: {applied ? "Aplicado" : "Pendente"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:min-w-[520px]">
              <SystemChip icon={Cpu} label="Sistema" value="Windows" />
              <SystemChip icon={Gauge} label="RAM escolhida" value={`${selectedRam}GB`} />
              <SystemChip
                icon={Activity}
                label="Status"
                value={applied ? "Aplicado" : "Pendente"}
              />
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <MemoryStick className="w-5 h-5 text-blue-300" />
            <h2 className="text-maxify-text text-lg font-semibold">
              Selecione a memória do PC
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 transition-all duration-300"
            >
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-300">
                    Quantidade de RAM
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-maxify-text">
                    Escolha uma opção
                  </h2>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-maxify-text-secondary">
                  Selecionado:{" "}
                  <span className="font-bold text-blue-300">{selectedRam}GB</span>
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
                <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5 transition-all duration-300 hover:border-blue-500/20 lg:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl border border-blue-500/20 bg-blue-500/10">
                      <Layers3 size={22} className="text-blue-300" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-maxify-text">
                        {profile.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-maxify-text-secondary">
                        {profile.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300">
                    Memória
                  </p>

                  <p className="mt-3 text-3xl font-black text-maxify-text">
                    {selectedRam}GB
                  </p>

                  <p className="mt-1 text-sm text-maxify-text-secondary">
                    RAM selecionada
                  </p>
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
              <MemoryCore selectedRam={selectedRam} applying={applying} />

              <div className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 transition-all duration-300 hover:border-blue-500/20">
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-300">
                        Aplicação
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-maxify-text">
                        {applied ? "Configuração aplicada" : "Pronto para aplicar"}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-maxify-text-secondary">
                        {applied
                          ? `A configuração foi aplicada para ${selectedRam}GB de RAM.`
                          : `Clique em aplicar para usar a configuração automática para ${selectedRam}GB de RAM.`}
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {applied ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                          <Check size={24} className="text-emerald-300" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="power"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20"
                        >
                          <Power size={24} className="text-blue-300" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4">
                      <HardDrive size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">
                        Memória
                      </p>
                      <p className="text-lg font-bold text-maxify-text">
                        {selectedRam}GB
                      </p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4">
                      <Zap size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">
                        Configuração
                      </p>
                      <p className="text-lg font-bold text-maxify-text">
                        Automática
                      </p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4">
                      <ShieldCheck size={18} className="text-blue-300" />
                      <p className="mt-3 text-xs text-maxify-text-secondary">
                        Execução
                      </p>
                      <p className="text-lg font-bold text-maxify-text">
                        Guiada
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      className={`group inline-flex flex-1 items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition-all ${
                        applying
                          ? "cursor-not-allowed border border-maxify-border bg-maxify-card text-maxify-text-secondary"
                          : "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:scale-[1.01]"
                      }`}
                    >
                      {applying ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          Aplicando
                        </>
                      ) : (
                        <>
                          Aplicar configuração
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