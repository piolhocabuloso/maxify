import React, { useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import LoginIcon from "../../../../resources/maxifylogo.png"
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Zap,
  Sparkles,
  Shield,
  Database,
  Cloud,
  RefreshCw,
  ChevronRight,
  Layers3,
  Rocket,
  MonitorCog,
  Gauge,
  CheckCircle2,
} from "lucide-react"
import { invoke } from "@/lib/electron"
import { useNavigate } from "react-router-dom"
import useSystemStore from "@/store/systemInfo"
import { useQuery } from "@tanstack/react-query"
import Greeting from "../components/Greeting"

const QUERY_KEYS = {
  systemInfo: "systemInfo",
}

const fetchSystemInfo = async () => {
  return await invoke({ channel: "get-system-info" })
}

const BackgroundGlow = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
    </>
  )
}

const SectionTitle = ({ icon: Icon, label, title }) => {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
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

const LoadingScreen = React.memo(() => (
  <RootDiv>
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          className="relative p-0"
        >
          <img
            src={LoginIcon}
            className="h-16 w-16 select-none drop-shadow-2xl"
            width={64}
            height={64}
            alt="Maxify"
          />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black tracking-tight text-maxify-text">
            Carregando sistema
          </h1>

          <div className="flex justify-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
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
      wrap: "border-blue-500/25 bg-blue-500/10",
      text: "text-blue-300",
      bar: "bg-blue-500",
      glow: "from-blue-500/20",
    },
    cyan: {
      wrap: "border-cyan-500/25 bg-cyan-500/10",
      text: "text-cyan-300",
      bar: "bg-cyan-500",
      glow: "from-cyan-500/20",
    },
    sky: {
      wrap: "border-sky-500/25 bg-sky-500/10",
      text: "text-sky-300",
      bar: "bg-sky-500",
      glow: "from-sky-500/20",
    },
    indigo: {
      wrap: "border-indigo-500/25 bg-indigo-500/10",
      text: "text-indigo-300",
      bar: "bg-indigo-500",
      glow: "from-indigo-500/20",
    },
  }

  const styles = accentMap[accent] || accentMap.blue

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 text-left shadow-xl shadow-black/5 transition-all hover:border-blue-500/25"
    >
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100`} />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className={`rounded-2xl border p-3 ${styles.wrap}`}>
            <Icon className={`h-5 w-5 ${styles.text}`} />
          </div>

          <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
            {title}
          </p>
          <p className="text-3xl font-black leading-none text-maxify-text">{value}</p>
          <p className="text-xs leading-5 text-maxify-text-secondary/85">{subtitle}</p>
        </div>

        {percentage !== undefined && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-bold text-maxify-text-secondary">
              <span>Uso</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-maxify-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                transition={{ duration: 0.7 }}
                className={`h-full rounded-full ${styles.bar}`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.button>
  )
}

const SpecCard = ({ title, icon: Icon, items, accent = "blue" }) => {
  const accentMap = {
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
  }

  const iconStyle = accentMap[accent] || accentMap.blue

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_50%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-3">
          <div className={`rounded-2xl border p-3 ${iconStyle}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
              Hardware
            </p>
            <h3 className="text-lg font-black text-maxify-text">{title}</h3>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-2xl border border-maxify-border bg-maxify-bg/30 px-4 py-3"
            >
              <span className="text-sm text-maxify-text-secondary">{item.label}</span>
              <span className="max-w-[58%] truncate text-right text-sm font-bold text-maxify-text">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const ActionCard = ({ title, description, icon: Icon, onClick, accent = "blue" }) => {
  const accentMap = {
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 text-left shadow-xl shadow-black/5 transition-all hover:border-blue-500/25"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 flex items-start gap-4">
        <div className={`rounded-[22px] border p-3.5 ${accentMap[accent] || accentMap.blue}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-black text-maxify-text">{title}</p>
            <ChevronRight className="mt-1 h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
          </div>
          <p className="mt-2 text-sm leading-6 text-maxify-text-secondary">{description}</p>
        </div>
      </div>
    </motion.button>
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
          { label: "Núcleos", value: `${systemData?.cpu_cores || 0}` },
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

  const quickStats = useMemo(() => {
    return [
      {
        title: "Sistema",
        value: formatWindowsName(systemData?.os),
        subtitle: "Ambiente detectado automaticamente",
        icon: MonitorCog,
        accent: "blue",
      },
      {
        title: "CPU",
        value: `${systemData?.cpu_cores || 0} cores`,
        subtitle: systemData?.cpu_model?.split(" ").slice(0, 4).join(" ") || "Processador não detectado",
        icon: Cpu,
        accent: "cyan",
      },
      {
        title: "RAM",
        value: formatBytes(systemData?.memory_total),
        subtitle: `${systemData?.memory_type || "DDR4"} pronta para otimização`,
        icon: MemoryStick,
        accent: "sky",
      },
      {
        title: "Painel",
        value: "9 páginas",
        subtitle: "Atalhos e ferramentas disponíveis",
        icon: Gauge,
        accent: "indigo",
      },
    ]
  }, [systemData, formatBytes, formatWindowsName])

  const isLoading = systemLoading

  if (isLoading && !systemData) return <LoadingScreen />

  return (
    <RootDiv className="min-h-full w-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
        <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
          <BackgroundGlow />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_380px] xl:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                <Sparkles size={14} />
                Maxify Control Center
              </div>

              <div className="flex items-start gap-5">
                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                  <img
                    src={LoginIcon}
                    width={38}
                    height={38}
                    className="select-none drop-shadow-xl"
                    alt="Maxify"
                  />
                </div>

                <div className="min-w-0">
                  <Greeting />

                  <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                    Painel principal em{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                      modo inteligente
                    </span>
                  </h1>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                    Monitore desempenho, veja as especificações do computador e acesse as principais ferramentas do Maxify com um visual mais limpo, modular e premium.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      {formatWindowsName(systemData?.os)}
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      Páginas disponíveis: 9
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <Rocket size={30} className="text-blue-300" />
                </div>

                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Online
                </div>
              </div>

              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                Status do painel
              </p>

              <h2 className="mt-2 text-3xl font-black text-maxify-text">
                Sistema pronto
              </h2>

              <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                Suas informações foram carregadas e os atalhos principais estão disponíveis para uso.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-300" />
                  <span className="text-sm font-semibold text-maxify-text">
                    Dados sincronizados
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section>
          <SectionTitle icon={Activity} label="Resumo" title="Visão rápida do sistema" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat, index) => (
              <QuickStatCard key={index} {...stat} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={Database} label="Hardware" title="Especificações técnicas" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {detailedSpecs.map((spec, index) => (
              <SpecCard key={index} {...spec} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={Rocket} label="Acesso rápido" title="Ferramentas principais" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <div className="flex items-center gap-2 rounded-full border border-maxify-border bg-maxify-card px-4 py-2 shadow-lg shadow-black/10">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-300" />
              <span className="text-xs font-bold text-maxify-text-secondary">
                Sincronizando...
              </span>
            </div>
          </div>
        )}
      </div>
    </RootDiv>
  )
}

export default Home
