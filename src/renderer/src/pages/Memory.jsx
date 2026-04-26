import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  MemoryStick,
  Check,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Cpu,
  Zap,
  Gauge,
  Layers3,
} from "lucide-react"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"

const RAM_OPTIONS = [4, 6, 8, 16, 32]

const PROFILE_TEXT = {
  4: {
    title: "Perfil Essencial",
    desc: "Ajustes mais leves para reduzir consumo desnecessário e deixar o sistema mais estável em PCs com pouca memória.",
    tag: "Leve",
    color: "blue",
  },
  6: {
    title: "Perfil Equilibrado",
    desc: "Configuração intermediária para melhorar a fluidez do sistema sem deixar o Windows agressivo demais.",
    tag: "Estável",
    color: "sky",
  },
  8: {
    title: "Perfil Recomendado",
    desc: "Um perfil bem balanceado para jogos leves, uso diário e melhor resposta geral do sistema.",
    tag: "Ideal",
    color: "cyan",
  },
  16: {
    title: "Perfil Performance",
    desc: "Configuração mais forte para liberar desempenho, priorizar resposta e reduzir processos em segundo plano.",
    tag: "Rápido",
    color: "blue",
  },
  32: {
    title: "Perfil Extremo",
    desc: "Perfil avançado para máquinas com muita memória, focado em resposta, multitarefa e máximo desempenho.",
    tag: "Avançado",
    color: "indigo",
  },
}

function BlueGrid() {
  return (
    <>
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(6,182,212,0.08),transparent_35%)]" />
    </>
  )
}

function FloatingGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/20 blur-3xl"
          style={{
            width: 150 + i * 30,
            height: 150 + i * 30,
            left: `${10 + i * 12}%`,
            top: `${20 + i * 8}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            opacity: [0.15, 0.25, 0.1, 0.15],
          }}
          transition={{
            duration: 12 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function RamVisualizer({ ram, pulse = false, compact = false }) {
  const bars = compact ? 12 : 20

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`relative ${compact ? "w-64 h-64" : "w-80 h-80"} flex items-center justify-center`}
    >
      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="absolute inset-4 rounded-full border border-blue-500/20 bg-maxify-card/50 backdrop-blur-sm" />
      <div className="absolute inset-8 rounded-full border border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex gap-1 mb-6">
          {[...Array(bars)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-blue-400 to-cyan-400"
              animate={{
                height: pulse ? [16, 40 + Math.sin(i) * 8, 16] : [20, 32, 20],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.03,
                ease: "easeInOut",
              }}
              style={{ height: compact ? 24 : 32 }}
            />
          ))}
        </div>
        <p className={`${compact ? "text-3xl" : "text-5xl"} font-black tracking-tight text-maxify-text`}>
          {ram}GB
        </p>
        <p className="text-xs uppercase tracking-wider text-maxify-text-secondary mt-2">
          RAM Profile
        </p>
      </div>
    </motion.div>
  )
}

function IntroStage({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card"
    >
      <BlueGrid />
      <FloatingGlow />

      <div className="relative z-10 p-8 lg:p-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-blue-300">
              <Sparkles size={14} />
              Otimizador de RAM
            </div>

            <h1 className="mt-6 text-4xl lg:text-6xl font-black leading-[1.1] text-maxify-text">
              Configure sua
              <br />
              memória RAM
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                automaticamente
              </span>
            </h1>

            <p className="mt-5 text-maxify-text-secondary text-base lg:text-lg leading-relaxed max-w-lg">
              Escolha a quantidade de memória do seu computador e aplique um perfil otimizado
              para máxima performance e estabilidade.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-2 text-sm text-maxify-text-secondary">
                Fluxo em etapas
              </div>
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-2 text-sm text-maxify-text-secondary">
                Perfis inteligentes
              </div>
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-2 text-sm text-maxify-text-secondary">
                Aplicação segura
              </div>
            </div>

            <Button
              onClick={onNext}
              className="group mt-10 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(37,99,235,0.22)]"
            >
              Começar agora
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex justify-center">
            <RamVisualizer ram={16} pulse />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SelectionStage({ selectedRam, setSelectedRam, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card"
    >
      <BlueGrid />
      <FloatingGlow />

      <div className="relative z-10 p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-maxify-text-secondary">
              Etapa 1
            </p>
            <h2 className="mt-2 text-3xl lg:text-4xl font-black text-maxify-text">
              Quantos GB de RAM?
            </h2>
            <p className="mt-2 text-maxify-text-secondary">
              Escolha a memória do computador para montar o perfil ideal.
            </p>
          </div>
          <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-3 text-sm text-maxify-text-secondary">
            Selecionado: <span className="text-blue-300 font-semibold">{selectedRam}GB</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {RAM_OPTIONS.map((ram) => {
            const isActive = selectedRam === ram
            const profile = PROFILE_TEXT[ram]

            return (
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={ram}
                onClick={() => setSelectedRam(ram)}
                className={`relative rounded-[28px] p-5 text-left transition-all ${
                  isActive
                    ? "border border-blue-500 bg-blue-500/10 shadow-[0_20px_60px_rgba(59,130,246,0.18)]"
                    : "border border-maxify-border bg-maxify-border/10 hover:border-blue-400/40"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`rounded-2xl p-3 ${isActive ? "bg-blue-500/20" : "bg-maxify-card border border-maxify-border"}`}>
                    <MemoryStick size={24} className={isActive ? "text-blue-300" : "text-maxify-text-secondary"} />
                  </div>
                  {isActive && (
                    <div className="rounded-full bg-blue-500 p-1.5">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-4xl font-black mt-8 text-maxify-text">{ram}</p>
                <p className="text-sm text-maxify-text-secondary mt-1">GB de RAM</p>
                <p className="text-xs text-blue-300/70 mt-2">{profile.tag}</p>
              </motion.button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-maxify-border/10 border border-maxify-border rounded-[24px] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-maxify-text-secondary">
              Resumo da configuração
            </p>

            <h3 className="mt-3 text-2xl font-bold text-maxify-text">
              Perfil automático de memória
            </h3>

            <p className="mt-3 text-maxify-text-secondary leading-relaxed">
              Esse modo aplica uma configuração fixa de otimização para o sistema,
              mudando apenas a memória selecionada: <span className="text-blue-300 font-semibold">{selectedRam}GB</span>.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4">
                <p className="text-xs text-maxify-text-secondary">Memória</p>
                <p className="text-xl font-semibold text-blue-300 mt-1">{selectedRam}GB</p>
              </div>
              <div className="rounded-2xl border border-maxify-border bg-maxify-card p-4">
                <p className="text-xs text-maxify-text-secondary">Modo</p>
                <p className="text-xl font-semibold text-cyan-300 mt-1">Otimização fixa</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm font-semibold text-blue-300">
                O que essa configuração faz
              </p>

              <div className="mt-3 space-y-2 text-sm leading-6 text-maxify-text-secondary">
                <p>• Desativa o tempo de espera para suspensão na energia e na bateria.</p>
                <p>• Desativa o serviço SysMain para reduzir atividade em segundo plano.</p>
                <p>• Desliga a suspensão seletiva do USB para evitar pausas em portas USB.</p>
                <p>• Desativa o serviço DiagTrack para diminuir coleta de telemetria.</p>
                <p>• Mostra e desativa uma opção oculta de economia de energia do USB.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-4 py-2 text-sm text-maxify-text-secondary">
                <Cpu size={16} className="text-blue-400" />
                Ajuste automático
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-4 py-2 text-sm text-maxify-text-secondary">
                <ShieldCheck size={16} className="text-cyan-400" />
                Aplicação guiada
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-4 py-2 text-sm text-maxify-text-secondary">
                <Gauge size={16} className="text-sky-400" />
                Mesmo perfil base
              </div>
            </div>
          </Card>

          <div className="flex justify-center items-center">
            <RamVisualizer ram={selectedRam} compact />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={onNext}
            className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(37,99,235,0.22)]"
          >
            Continuar
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function TransitionStage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card min-h-[600px] flex items-center justify-center"
    >
      <BlueGrid />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
            style={{ width: 100 + i * 20, left: -100, top: 100 + i * 40 }}
            animate={{ x: 2000 }}
            transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10"
        >
          <LoaderCircle className="h-10 w-10 text-blue-300 animate-spin" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-black text-maxify-text"
        >
          Montando perfil ideal
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-maxify-text-secondary"
        >
          Preparando interface e carregando a configuração recomendada...
        </motion.p>
      </div>
    </motion.div>
  )
}

function ApplyStage({ selectedRam, onApply, applying, applied, resetAll }) {
  const activeProfile = PROFILE_TEXT[selectedRam]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card min-h-[600px] flex items-center justify-center p-8"
    >
      <BlueGrid />
      <FloatingGlow />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: applying ? [0.9, 1.2, 0.9] : [1, 1.05, 1],
              opacity: applying ? [0.03, 0.1, 0.03] : [0.02, 0.05, 0.02],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5 + i * 0.1,
              delay: i * 0.05,
            }}
            className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <RamVisualizer ram={selectedRam} pulse={applying} compact={false} />

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.35em] text-maxify-text-secondary">
            Etapa 2
          </p>
          <h2 className="mt-2 text-2xl lg:text-4xl font-black text-maxify-text">
            {applied ? "Configuração aplicada!" : "Aplicar configuração"}
          </h2>
          <p className="mt-3 text-maxify-text-secondary max-w-md">
            {applied
              ? `Perfil ${activeProfile.title} aplicado com sucesso para ${selectedRam}GB de RAM.`
              : `Aplicar perfil otimizado para ${selectedRam}GB de RAM.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {!applied && (
            <Button
              onClick={onApply}
              disabled={applying}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all ${
                applying
                  ? "border border-maxify-border bg-maxify-border/10 text-maxify-text-secondary cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-[1.02] shadow-[0_10px_30px_rgba(37,99,235,0.22)]"
              }`}
            >
              {applying ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Aplicando
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Aplicar
                </>
              )}
            </Button>
          )}

          <Button
            onClick={resetAll}
            disabled={applying}
            variant="outline"
            className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-border/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-maxify-text-secondary transition-all hover:bg-maxify-border/20"
          >
            <RotateCcw size={15} />
            Reiniciar
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
            {activeProfile.title}
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
            {selectedRam}GB
          </div>
          <div className="rounded-xl border border-maxify-border bg-maxify-border/10 px-3 py-2 text-xs text-maxify-text-secondary">
            <span className="inline-flex items-center gap-2">
              <Layers3 size={13} />
              Perfil {activeProfile.tag}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function RamOptimizer() {
  const [stage, setStage] = useState("intro")
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

  const profileData = useMemo(
    () => ({
      ram: selectedRam,
      profileName: PROFILE_TEXT[selectedRam].title,
      appliedAt: new Date().toISOString(),
    }),
    [selectedRam]
  )

  const goToSelection = () => setStage("selection")

  const goToTransition = () => {
    setStage("transition")
    setTimeout(() => setStage("apply"), 2200)
  }

  const handleApply = async () => {
    if (applying) return
    setApplying(true)

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
          console.log("[EXEC]", command)
          const result = await invoke({
            channel: "run-powershell",
            payload: { script: command },
          })
          if (result?.success === false) throw new Error(result.error || `Falha: ${command}`)
          await delay(300)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1200))
      localStorage.setItem("ram-optimizer:lastApplied", JSON.stringify(profileData))
      localStorage.setItem("ram-optimizer:applied", "true")
      setApplied(true)
      toast.success("Configurações aplicadas com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível aplicar a configuração.")
    } finally {
      setApplying(false)
    }
  }

  const resetAll = () => {
    if (applying) return
    setApplied(false)
    setStage("intro")
  }

  return (
    <RootDiv>
      <div className="w-full px-6 py-8 md:px-8 overflow-hidden">
        <div className="mx-auto max-w-[1800px]">
          <AnimatePresence mode="wait">
            {stage === "intro" && <IntroStage onNext={goToSelection} />}

            {stage === "selection" && (
              <SelectionStage
                selectedRam={selectedRam}
                setSelectedRam={setSelectedRam}
                onNext={goToTransition}
              />
            )}

            {stage === "transition" && <TransitionStage />}

            {stage === "apply" && (
              <ApplyStage
                selectedRam={selectedRam}
                onApply={handleApply}
                applying={applying}
                applied={applied}
                resetAll={resetAll}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </RootDiv>
  )
}