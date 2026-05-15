import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  CheckCircle2,
  Keyboard,
  Monitor,
  MousePointer2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"

import RootDiv from "@/components/rootdiv"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { notify as toast } from "@/lib/notify"
import LoginIcon from "../../../../resources/maxifylogo.png"

const STORAGE_KEY = "maxify:input-lag:applied"

const deviceInfoScript = "maxify-premium://mx_aa1c9f4027d84e65b301"

const modules = [
  {
    id: "mouse",
    label: "Mouse",
    title: "Refinamento do mouse",
    subtitle: "Melhora de latencia ate 1ms",
    icon: MousePointer2,
    type: "mouse",
    checkScript: "maxify-premium://mx_b6a4a50e9cc64296b6f1",
    applyScript: "maxify-premium://mx_cde12b9dcf344f418a77",
    restoreScript: "maxify-premium://mx_14a9e62adbd54922a76d",
  },
  {
    id: "keyboard",
    label: "Teclado",
    title: "Resposta do teclado",
    subtitle: "Delay minimo e repeticao maxima",
    icon: Keyboard,
    type: "keyboard",
    checkScript: "maxify-premium://mx_a8f4cb61f7444d588ef4",
    applyScript: "maxify-premium://mx_2ecf2ccfa1f54615b937",
    restoreScript: "maxify-premium://mx_73c9226c72fa4d14ad7b",
  },
  {
    id: "monitor",
    label: "Monitor",
    title: "Latencia do monitor",
    subtitle: "Tela cheia e captura sem overhead",
    icon: Monitor,
    type: "monitor",
    checkScript: "maxify-premium://mx_6b05e70ac8bc4d4bb922",
    applyScript: "maxify-premium://mx_8dd5be7fcfb5477ea2f0",
    restoreScript: "maxify-premium://mx_f2b1de5d112b4fefb022",
  },
]

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function displayValue(value, fallback = "Aguardando leitura") {
  const text = String(value || "").trim()

  if (!text || text.toLowerCase() === "n/a") return fallback

  return text
}

function DeviceVisual({ type, active }) {
  if (type === "keyboard") {
    return (
      <div className="mx-auto grid h-32 w-64 grid-cols-10 gap-1.5 rounded-[24px] border border-blue-400/20 bg-blue-950/20 p-5 shadow-xl shadow-blue-500/10">
        {Array.from({ length: 40 }).map((_, index) => (
          <span
            key={index}
            className={`rounded-[4px] border ${
              active
                  ? "border-blue-300/35 bg-blue-400/15"
                  : "border-maxify-border bg-maxify-border/20"
            }`}
          />
        ))}
      </div>
    )
  }

  if (type === "monitor") {
    return (
      <div className="mx-auto flex h-40 w-64 flex-col items-center justify-center">
        <div
          className={`h-32 w-56 rounded-[18px] border bg-[#070d18] p-3 shadow-2xl ${
            active
              ? "border-blue-300/35 shadow-blue-500/10"
              : "border-maxify-border shadow-black/20"
          }`}
        >
          <div className="h-full rounded-xl border border-blue-400/10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />
        </div>
        <div className="h-5 w-2 rounded-b bg-blue-300/25" />
        <div className="h-2 w-24 rounded-full bg-blue-300/20" />
      </div>
    )
  }

  return (
    <div className="relative mx-auto h-40 w-64">
      <div
        className={`absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2 rotate-[8deg] rounded-[55%_45%_48%_52%] border bg-[#0a111f] shadow-2xl ${
          active
            ? "border-blue-300/35 shadow-blue-500/15"
            : "border-maxify-border shadow-black/20"
        }`}
      >
        <div className="absolute left-1/2 top-2 h-10 w-px -translate-x-1/2 bg-blue-200/20" />
        <div className="absolute left-[47%] top-3 h-5 w-2 rounded-full border border-blue-200/30 bg-blue-400/20" />
        <div className="absolute bottom-5 left-8 h-px w-28 bg-blue-200/15" />
      </div>
    </div>
  )
}

function getDeviceFields(devices, activeId, applied) {
  if (activeId === "keyboard") {
    return [
      { label: "Dispositivo", value: devices?.keyboard?.name, fallback: "Teclado HID", hint: "Teclado ativo" },
      { label: "Delay", value: applied.keyboard ? "0" : "Padrao", hint: "Atraso de repeticao" },
      { label: "Speed", value: applied.keyboard ? "31" : "Auto", hint: "Repeticao do Windows" },
      { label: "Status", value: devices?.keyboard?.status, fallback: "Pronto", hint: "Estado do HID" },
    ]
  }

  if (activeId === "monitor") {
    return [
      { label: "Monitor", value: devices?.monitor?.name, fallback: "Monitor principal", hint: "Tela principal" },
      { label: "Taxa", value: devices?.monitor?.refreshRate, fallback: "Auto", hint: "Frequencia atual" },
      { label: "Resolucao", value: devices?.monitor?.resolution, fallback: "Modo atual", hint: "Modo ativo" },
      { label: "Captura", value: applied.monitor ? "Off" : "Auto", hint: "Game DVR" },
    ]
  }

  return [
    { label: "Mouse", value: devices?.mouse?.name, fallback: "Mouse HID", hint: "Dispositivo HID" },
    { label: "Polling rate", value: "1000 Hz", hint: "Frequencia estimada" },
    { label: "DPI", value: "Auto", hint: "Sensibilidade" },
    { label: "Latencia", value: applied.mouse ? "~1 ms" : "Padrao", hint: "Estimativa de atraso" },
  ]
}

export default function InputLagSystem() {
  const [devices, setDevices] = useState(null)
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [applied, setApplied] = useState(() =>
    safeParse(localStorage.getItem(STORAGE_KEY), {})
  )
  const [activeId, setActiveId] = useState("mouse")
  const [runningId, setRunningId] = useState("")
  const [progress, setProgress] = useState(0)

  const activeModule = modules.find((item) => item.id === activeId) || modules[0]
  const activeApplied = Boolean(applied[activeId])
  const appliedCount = Object.values(applied).filter(Boolean).length
  const systemActive = appliedCount === modules.length
  const progressPercent = Math.round((appliedCount / modules.length) * 100)

  const fields = useMemo(
    () => getDeviceFields(devices, activeId, applied),
    [activeId, applied, devices]
  )

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true)

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: { script: deviceInfoScript, name: "inputlag-device-info" },
      })

      if (!result.success) {
        throw new Error(result.error || "Falha ao detectar dispositivos.")
      }

      const parsedDevices = safeParse(result.output, null)
      setDevices(parsedDevices)
      localStorage.setItem("maxify:input-lag:devices", JSON.stringify(parsedDevices))
    } catch (error) {
      toast.error(error.message || "Nao foi possivel carregar os dispositivos.")
      setDevices(null)
    } finally {
      setLoadingDevices(false)
    }
  }, [])

  const checkAppliedStates = useCallback(async () => {
    const states = {}

    await Promise.all(
      modules.map(async (item) => {
        try {
          const result = await invoke({
            channel: "run-powershell",
            payload: { script: item.checkScript, name: `inputlag-check-${item.id}` },
          })

          states[item.id] =
            result.success && result.output.trim().toLowerCase() === "true"
        } catch {
          states[item.id] = false
        }
      })
    )

    setApplied(states)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  }, [])

  useEffect(() => {
    const cachedDevices = safeParse(
      localStorage.getItem("maxify:input-lag:devices"),
      null
    )

    if (cachedDevices) {
      setDevices(cachedDevices)
    }

    setLoadingDevices(false)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applied))
  }, [applied])

  async function runAction(item, mode = "apply") {
    setRunningId(item.id)

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: mode === "apply" ? item.applyScript : item.restoreScript,
          name: `inputlag-${mode}-${item.id}`,
        },
      })

      if (!result.success) {
        throw new Error(result.error || "Falha ao executar otimizacao.")
      }

      setApplied((prev) => ({ ...prev, [item.id]: mode === "apply" }))
      toast.success(
        mode === "apply"
          ? `${item.label} otimizado com sucesso.`
          : `${item.label} revertido com sucesso.`
      )
    } catch (error) {
      toast.error(error.message || `Falha em ${item.label}.`)
    } finally {
      setRunningId("")
    }
  }

  async function applyAll() {
    setProgress(0)

    for (let index = 0; index < modules.length; index += 1) {
      await runAction(modules[index], "apply")
      setProgress(Math.round(((index + 1) / modules.length) * 100))
    }

    toast.success("Sistema de input lag aplicado por completo.")
  }

  async function restoreAll() {
    setProgress(0)

    for (let index = 0; index < modules.length; index += 1) {
      await runAction(modules[index], "restore")
      setProgress(Math.round(((index + 1) / modules.length) * 100))
    }

    toast.info("Sistema de input lag revertido.")
  }

  return (
    <RootDiv>
      <div className="mx-auto max-w-[1900px] px-6 pb-16">
        <section className="relative mt-8 min-h-[calc(100vh-120px)] overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-7 text-maxify-text shadow-2xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_86%_18%,rgba(14,165,233,0.10),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.08),rgba(8,13,24,0.18))]" />
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(96,165,250,0.55)_1px,transparent_1.5px)] [background-size:120px_92px]" />

          {(runningId || progress > 0) && progress < 100 && (
            <div className="absolute inset-x-0 top-0 z-20">
              <div
                className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${progress || 35}%` }}
              />
            </div>
          )}

          <div className="relative z-10">
            <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-[22px] border border-maxify-border bg-maxify-bg/55 p-1 shadow-xl shadow-black/10">
                  <div className="flex gap-1">
                    {modules.map((item) => {
                      const Icon = item.icon
                      const active = activeId === item.id

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveId(item.id)}
                          className={`flex min-h-[46px] min-w-[120px] items-center justify-center gap-2 rounded-[18px] px-4 text-xs font-black uppercase tracking-wide transition ${
                            active
                              ? "bg-blue-500/80 text-white shadow-lg shadow-blue-500/15"
                              : "text-maxify-text-secondary hover:bg-blue-500/10 hover:text-blue-200"
                          }`}
                        >
                          <Icon size={15} />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadDevices}
                  disabled={loadingDevices || Boolean(runningId)}
                  className="flex min-h-[52px] items-center gap-3 rounded-[22px] border border-maxify-border bg-blue-500/10 px-6 text-sm font-black uppercase tracking-wide text-blue-200 transition hover:border-blue-400/30 hover:bg-blue-500/15 disabled:opacity-60"
                >
                  <Activity size={17} />
                  Monitoramento local
                </button>
              </div>
            </header>

            <div className="grid gap-7 xl:grid-cols-[330px_1fr]">
              <aside className="rounded-[28px] border border-maxify-border bg-maxify-bg/35 p-6 shadow-xl shadow-black/10">
                <div className="flex min-h-[270px] items-center justify-center rounded-[24px] border border-maxify-border bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.13),transparent_62%)]">
                  <DeviceVisual type={activeModule.type} active={activeApplied} />
                </div>

                <p className="mt-7 text-center text-[11px] font-black uppercase tracking-[0.36em] text-blue-400">
                  {activeApplied ? "Equipamento calibrado" : "Equipamento pronto"}
                </p>

                <div className="mt-6 grid gap-3">
                  {modules.map((item) => {
                    const Icon = item.icon
                    const active = activeId === item.id

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-blue-400/35 bg-blue-500/10"
                            : "border-maxify-border bg-maxify-card/55 hover:border-blue-400/25"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="text-blue-300" size={17} />
                          <span className="text-sm font-black">{item.label}</span>
                        </span>
                        <span className={applied[item.id] ? "text-green-300" : "text-maxify-text-secondary"}>
                          {applied[item.id] ? <CheckCircle2 size={16} /> : <Activity size={16} />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <main className="rounded-[28px] border border-maxify-border bg-maxify-bg/35 p-6 shadow-xl shadow-black/10">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-xl border border-blue-400/25 bg-blue-500/10 p-2 text-blue-300">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.34em]">
                          Input reduct
                        </p>
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-maxify-text-secondary/60">
                          Otimizacao de frequencia e resposta
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => runAction(activeModule, "apply")}
                    disabled={Boolean(runningId)}
                    className="min-h-[46px] justify-center gap-2 rounded-2xl px-7 text-sm font-black uppercase tracking-wide"
                  >
                    {runningId === activeId ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <Zap size={16} />
                    )}
                    Input reduct
                  </Button>
                </div>

                <div className="rounded-[24px] border border-maxify-border bg-maxify-card/65 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-maxify-text-secondary/70">
                        Otimizacao de {activeModule.label}
                      </p>
                      <h2 className="mt-3 text-2xl font-black uppercase tracking-wide">
                        {activeModule.title}
                      </h2>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400">
                        {activeModule.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        activeApplied
                          ? runAction(activeModule, "restore")
                          : runAction(activeModule, "apply")
                      }
                      disabled={Boolean(runningId)}
                      className={`flex min-h-[50px] min-w-[170px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black uppercase tracking-wide transition ${
                        activeApplied
                          ? "border-green-400/20 bg-green-500/10 text-green-300"
                          : "border-maxify-border bg-maxify-card/70 text-maxify-text-secondary hover:border-blue-400/30 hover:text-blue-300"
                      }`}
                    >
                      {runningId === activeId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : activeApplied ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Activity size={16} />
                      )}
                      {activeApplied ? "Otimizado" : "Pendente"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {fields.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-maxify-border bg-maxify-card/55 p-5"
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-maxify-text-secondary/70">
                        {item.label}
                      </p>
                      <p className="mt-3 truncate text-xl font-black">
                        {loadingDevices
                          ? "Detectando..."
                          : displayValue(item.value, item.fallback)}
                      </p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-maxify-text-secondary/50">
                        {item.hint}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="rounded-[22px] border border-blue-400/15 bg-blue-500/10 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-maxify-text-secondary">
                        Sistema completo
                      </span>
                      <span className="text-xl font-black text-blue-300">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-maxify-border">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={restoreAll}
                      variant="outline"
                      disabled={Boolean(runningId) || appliedCount === 0}
                      className="min-h-[42px] justify-center gap-2 rounded-2xl"
                    >
                      <RotateCcw size={16} />
                      Reverter tudo
                    </Button>
                    <Button
                      onClick={applyAll}
                      disabled={Boolean(runningId)}
                      className="min-h-[42px] justify-center gap-2 rounded-2xl"
                    >
                      {runningId ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      Aplicar tudo
                    </Button>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-maxify-border bg-maxify-card/55 p-4">
                  <p className="text-sm leading-relaxed text-maxify-text-secondary">
                    {systemActive
                      ? "Mouse, teclado e monitor estao calibrados no perfil de baixa latencia."
                      : "Escolha um modulo acima ou aplique tudo para reduzir atrasos de entrada sem trocar drivers ou firmware."}
                  </p>
                </div>
              </main>
            </div>
          </div>
        </section>
      </div>
    </RootDiv>
  )
}
