import React, { useMemo, useCallback, useState, useEffect } from "react"
import RootDiv from "@/components/rootdiv"
import LoginIcon from "../../../../resources/maxifylogo.png"
import {
  EthernetPort,
  Cpu,
  HardDrive,
  MemoryStick,
  MonitorCog,
  Activity,
  Zap,
  Thermometer,
  Clock,
  BarChart3,
  Sparkles,
  Shield,
  Database,
  Cloud,
  RefreshCw,
  ChevronRight,
  Gamepad2,
  Layers3,
  Rocket,
} from "lucide-react"
import { invoke } from "@/lib/electron"
import { useNavigate } from "react-router-dom"
import useSystemStore from "@/store/systemInfo"
import { useQuery } from "@tanstack/react-query"
import Backup from "./Backup"
import Greeting from "../components/Greeting"

const QUERY_KEYS = {
  systemInfo: "systemInfo",
  tweaks: "tweaks",
  activeTweaks: "activeTweaks",
}

const fetchSystemInfo = async () => {
  return await invoke({ channel: "get-system-info" })
}

const fetchTweaks = async () => {
  return await invoke({ channel: "tweaks:fetch" })
}

const fetchActiveTweaks = async () => {
  return await invoke({ channel: "tweak:active" })
}

const LoadingScreen = React.memo(() => (
  <RootDiv>
    <div className="fixed inset-0 flex items-center justify-center bg-maxify-bg">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative animate-spin-slow">
            <img
              src={LoginIcon}
              className="w-16 h-16 drop-shadow-2xl"
              width={64}
              height={64}
              alt="Sparkle Logo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-maxify-text font-bold text-2xl tracking-tight">
            Carregando sistema
          </h1>

          <div className="flex gap-1 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-maxify-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </RootDiv>
))

const QuickStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "blue",
  percentage,
  onClick,
}) => {
  const accentMap = {
    blue: {
      wrap: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-300",
      bar: "bg-blue-500",
    },
    cyan: {
      wrap: "bg-cyan-500/10 border-cyan-500/20",
      text: "text-cyan-300",
      bar: "bg-cyan-500",
    },
    sky: {
      wrap: "bg-sky-500/10 border-sky-500/20",
      text: "text-sky-300",
      bar: "bg-sky-500",
    },
    indigo: {
      wrap: "bg-indigo-500/10 border-indigo-500/20",
      text: "text-indigo-300",
      bar: "bg-indigo-500",
    },
  }

  const styles = accentMap[accent] || accentMap.blue

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-maxify-border bg-maxify-card p-5 transition-all duration-300 hover:border-blue-500/20 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`p-3 rounded-2xl border ${styles.wrap}`}>
          <Icon className={`w-5 h-5 ${styles.text}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-maxify-text-secondary opacity-60" />
      </div>

      <div className="space-y-1">
        <p className="text-sm text-maxify-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-maxify-text leading-none">{value}</p>
        <p className="text-xs text-maxify-text-secondary/80">{subtitle}</p>
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-maxify-text-secondary mb-1">
            <span>Uso</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-maxify-border overflow-hidden">
            <div
              className={`h-full rounded-full ${styles.bar}`}
              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
const SpecCard = ({ title, icon: Icon, items, accent = "blue" }) => {
  const accentMap = {
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    sky: "text-sky-300 bg-sky-500/10 border-sky-500/20",
    indigo: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  }

  const iconStyle = accentMap[accent] || accentMap.blue

  return (
    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5 transition-all duration-300 hover:border-blue-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl border ${iconStyle}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-maxify-text font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-sm text-maxify-text-secondary">{item.label}</span>
            <span className="text-sm font-medium text-maxify-text text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ActionCard = ({ title, description, icon: Icon, onClick, accent = "blue" }) => {
  const accentMap = {
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    sky: "text-sky-300 bg-sky-500/10 border-sky-500/20",
    indigo: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-maxify-border bg-maxify-card p-5 transition-all duration-300 hover:border-blue-500/20 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl border ${accentMap[accent] || accentMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <p className="text-base font-semibold text-maxify-text">{title}</p>
          <p className="text-sm text-maxify-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </button>
  )
}

function Home() {
  const router = useNavigate()
  const setSystemInfo = useSystemStore((s) => s.setSystemInfo)

  const {
    data: systemData,
    isLoading: systemLoading,
    isFetching: systemFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.systemInfo],
    queryFn: fetchSystemInfo,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  const {
    data: tweaksData = [],
    isLoading: tweaksLoading,
  } = useQuery({
    queryKey: [QUERY_KEYS.tweaks],
    queryFn: fetchTweaks,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  const {
    data: activeTweaksData = [],
    isLoading: activeLoading,
  } = useQuery({
    queryKey: [QUERY_KEYS.activeTweaks],
    queryFn: fetchActiveTweaks,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (systemData) {
      setSystemInfo(systemData)
      localStorage.setItem("maxify:systemInfo", JSON.stringify(systemData))
    }
  }, [systemData, setSystemInfo])

  const formatBytes = useCallback((bytes) => {
    if (!bytes) return "0 GB"
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB"
  }, [])

  const formatWindowsName = useCallback((name) => {
    if (!name) return "Desconhecido"

    const lower = name.toLowerCase()

    if (lower.includes("windows 11")) return "Windows 11"
    if (lower.includes("windows 10")) return "Windows 10"
    if (lower.includes("windows 8")) return "Windows 8"
    if (lower.includes("windows 7")) return "Windows 7"

    return name
      .replace("Microsoft", "")
      .replace("Single Language", "")
      .replace("Home", "Home")
      .trim()
  }, [])


  const detailedSpecs = useMemo(() => {
    const cpuModel =
      systemData?.cpu_model?.split(" ").slice(0, 4).join(" ") || "Desconhecido"

    const gpuModel =
      systemData?.gpu_model?.split(" ").slice(0, 3).join(" ") || "Desconhecido"

    const diskModel =
      systemData?.disk_model?.split(" ").slice(0, 2).join(" ") || "SSD"

    return [
      {
        title: "Processador",
        icon: Cpu,
        accent: "blue",
        items: [
          { label: "Modelo", value: cpuModel },
          {
            label: "Núcleos",
            value: `${systemData?.cpu_cores || 0}`,
          },
        ],
      },
      {
        title: "Placa de vídeo",
        icon: Activity,
        accent: "cyan",
        items: [
          { label: "Modelo", value: gpuModel },
          { label: "VRAM", value: systemData?.vram || "N/A" },
        ],
      },
      {
        title: "Memória RAM",
        icon: MemoryStick,
        accent: "sky",
        items: [
          { label: "Total", value: formatBytes(systemData?.memory_total) },
          { label: "Tipo", value: systemData?.memory_type || "DDR4" },
        ],
      },
      {
        title: "Armazenamento",
        icon: HardDrive,
        accent: "indigo",
        items: [
          { label: "Modelo", value: diskModel },
          { label: "Capacidade", value: systemData?.disk_size || "N/A" },
        ],
      },
    ]
  }, [systemData, formatBytes])

  const isLoading = systemLoading || tweaksLoading || activeLoading

  if (isLoading && !systemData) return <LoadingScreen />

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        <div className="mt-8 rounded-[28px] border border-maxify-border bg-maxify-card p-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.18),transparent_40%)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="max-w-3xl">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-200 text-sm font-medium mb-4 shadow-sm">
                <Sparkles size={15} />
                Central de controle
              </div>

              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30 shadow-xl shadow-blue-500/20 backdrop-blur">
                  <img
                    src={LoginIcon}
                    width={32}
                    height={32}
                    className="select-none"
                    alt="Sparkle"
                  />
                </div>

                <div>

                  {/* Title */}
                  <Greeting />

                  {/* Description */}
                  <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                    Monitore desempenho, aplique otimizações e acesse tudo que importa
                    de forma rápida, simples e eficiente.
                  </p>

                  {/* Info badges */}
                  <div className="flex flex-wrap gap-3 mt-5">

                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                      {formatWindowsName(systemData?.os)}
                    </div>


                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                      Páginas disponíveis: 9
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-300" />
            <h2 className="text-maxify-text text-lg font-semibold">Especificações técnicas</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {detailedSpecs.map((spec, index) => (
              <SpecCard key={index} {...spec} />
            ))}
          </div>
        </section>



        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-300" />
            <h2 className="text-maxify-text text-lg font-semibold">Ações rápidas</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <ActionCard
              title="Abrir otimização"
              description="Acesse a área de tweaks e melhorias de desempenho."
              icon={Zap}
              accent="blue"
              onClick={() => router("/otimizacao")}
            />

            <ActionCard
              title="Abrir limpeza"
              description="Libere espaço e remova arquivos desnecessários."
              icon={Cloud}
              accent="cyan"
              onClick={() => router("/clean")}
            />

            <ActionCard
              title="Utilitários"
              description="Abra ferramentas extras do aplicativo."
              icon={Layers3}
              accent="sky"
              onClick={() => router("/utilities")}
            />

            <ActionCard
              title="Segurança"
              description="Veja proteções e recursos ligados ao sistema."
              icon={Shield}
              accent="indigo"
              onClick={() => router("/backup")}
            />
          </div>
        </section>

        {systemFetching && systemData && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 px-4 py-2 bg-maxify-card border border-maxify-border rounded-full shadow-lg">
              <RefreshCw className="w-4 h-4 text-blue-300 animate-spin" />
              <span className="text-xs text-maxify-text-secondary">Sincronizando...</span>
            </div>
          </div>
        )}
      </div>
    </RootDiv>
  )
}

export default Home