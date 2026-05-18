import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"
import RootDiv from "@/components/rootdiv"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { notify as toast } from "../lib/notify"
import {
  Globe,
  Shield,
  Settings,
  RefreshCw,
  AlertCircle,
  Info,
  Check,
  Zap,
  Cloud,
  Wifi,
  Database,
  Clock,
  BarChart3,
  HardDrive,
  Sparkles,
  ChevronRight,
  Network,
  Gauge,
  Activity,
} from "lucide-react"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Toggle from "@/components/ui/toggle"
import { useNavigate } from "react-router-dom"

const dnsProviders = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    description: "Rápido, seguro e focado em privacidade",
    features: ["Fast", "Privacy", "Security"],
    recommended: true,
    color: "text-blue-300",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: <Cloud className="h-5 w-5" />,
  },
  {
    id: "google",
    name: "Google",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    description: "Serviço DNS confiável e amplamente utilizado",
    features: ["Reliable", "Fast", "Global"],
    color: "text-cyan-300",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "opendns",
    name: "OpenDNS",
    primary: "208.67.222.222",
    secondary: "208.67.220.220",
    description: "DNS da Cisco com filtragem de conteúdo",
    features: ["Filtering", "Reliable", "Security"],
    color: "text-sky-300",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "quad9",
    name: "Quad9",
    primary: "9.9.9.9",
    secondary: "149.112.112.112",
    description: "DNS focado em segurança com bloqueio de ameaças",
    features: ["Security", "Threat Block", "Privacy"],
    color: "text-indigo-300",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "adguard",
    name: "AdGuard DNS",
    primary: "94.140.14.14",
    secondary: "94.140.15.15",
    description: "Bloqueia anúncios, rastreadores e malware",
    features: ["Ad Block", "Tracker Block", "Security"],
    color: "text-cyan-300",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    icon: <Cloud className="h-5 w-5" />,
  },
  {
    id: "automatic",
    name: "Automático (DHCP)",
    primary: "Auto",
    secondary: "Auto",
    description: "Use os servidores DNS padrão do seu ISP",
    features: ["Default", "ISP", "Auto"],
    color: "text-maxify-text-secondary",
    bgColor: "bg-maxify-border/15 border-maxify-border",
    icon: <Settings className="h-5 w-5" />,
  },
]

const categories = [
  { id: "all", label: "Todos os DNS", icon: <Globe size={16} /> },
  { id: "privacy", label: "Privacidade", icon: <Shield size={16} /> },
  { id: "speed", label: "Velocidade", icon: <Zap size={16} /> },
  { id: "security", label: "Segurança", icon: <Shield size={16} /> },
]

const BackgroundGlow = () => (
  <>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
  </>
)

function SectionTitle({ icon: Icon, label, title, description }) {
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
        {description && (
          <p className="mt-1 text-sm text-maxify-text-secondary">{description}</p>
        )}
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
    </div>
  )
}

function StatCard({ label, value, icon, tone = "blue" }) {
  const toneMap = {
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    green: "border-green-500/25 bg-green-500/10 text-green-300",
    yellow: "border-yellow-500/25 bg-yellow-500/10 text-yellow-300",
  }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_50%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`rounded-2xl border p-3 ${toneMap[tone] || toneMap.blue}`}>
            {icon}
          </div>
          <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
          {label}
        </p>
        <p className="mt-2 break-words text-2xl font-black leading-tight text-maxify-text">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function DNSPage() {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [currentDNS, setCurrentDNS] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [customDNS, setCustomDNS] = useState({ primary: "", secondary: "" })
  const [showCustom, setShowCustom] = useState(false)
  const [categoryActive, setCategoryActive] = useState("all")
  const [dnsHistory, setDnsHistory] = useState([])
  const [autoSwitch, setAutoSwitch] = useState(false)

  const [stats, setStats] = useState({
    totalChanges: 0,
    lastChanged: null,
    currentProvider: null,
  })

  useEffect(() => {
    getCurrentDNS()
    loadDNSHistory()
    loadStats()
  }, [])

  useEffect(() => {
    const autoConfig = JSON.parse(localStorage.getItem("dns:auto-switch") || "{}")
    setAutoSwitch(autoConfig.enabled || false)
  }, [])

  const getCurrentDNS = async () => {
    try {
      const result = await invoke({
        channel: "dns:get-current",
      })

      if (result.success) {
        setCurrentDNS(result.data)

        const servers = result.data[0]?.servers || ""
        const provider =
          dnsProviders.find((p) => servers.includes(p.primary.replace(".", "\\."))) ||
          dnsProviders.find((p) => p.id === "automatic")

        setStats((prev) => ({
          ...prev,
          currentProvider: provider?.name || "Unknown",
        }))
      }
    } catch (error) {
      console.error("Erro ao obter o DNS atual:", error)
      log.error("Erro ao obter o DNS atual:", error)
    }
  }

  const loadDNSHistory = () => {
    const history = JSON.parse(localStorage.getItem("dns:history") || "[]")
    setDnsHistory(history)
  }

  const loadStats = () => {
    const savedStats = JSON.parse(localStorage.getItem("dns:stats") || "{}")
    setStats({
      totalChanges: savedStats.totalChanges || 0,
      lastChanged: savedStats.lastChanged || null,
      currentProvider: savedStats.currentProvider || null,
    })
  }

  const saveToHistory = (provider) => {
    const newHistory = [
      {
        timestamp: new Date().toISOString(),
        provider: provider.name,
        servers: `${provider.primary} / ${provider.secondary}`,
        type: provider.id,
      },
      ...dnsHistory.slice(0, 9),
    ]

    setDnsHistory(newHistory)
    localStorage.setItem("dns:history", JSON.stringify(newHistory))
  }

  const updateStats = (providerName) => {
    const newStats = {
      totalChanges: (stats.totalChanges || 0) + 1,
      lastChanged: new Date().toISOString(),
      currentProvider: providerName,
    }

    setStats(newStats)
    localStorage.setItem("dns:stats", JSON.stringify(newStats))
  }

  const applyDNS = async (provider) => {
    setLoading(true)
    const toastId = toast.loading(`Aplicando ${provider.name} DNS...`)

    try {
      const payload =
        provider.id === "custom"
          ? {
              dnsType: "custom",
              primaryDNS: customDNS.primary,
              secondaryDNS: customDNS.secondary,
            }
          : {
              dnsType: provider.id,
            }

      const result = await invoke({
        channel: "dns:apply",
        payload,
      })

      if (result.success) {
        toast.update(toastId, {
          render: `${provider.name} DNS aplicado com sucesso!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })

        saveToHistory(provider)
        updateStats(provider.name)

        if (provider.id === "custom") {
          setCustomDNS({ primary: "", secondary: "" })
        }

        await getCurrentDNS()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.update(toastId, {
        render: `Falha ao aplicar DNS: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      })
      log.error("Falha ao aplicar DNS:", error)
    } finally {
      setLoading(false)
      setModalOpen(false)
    }
  }

  const openConfirmationModal = (provider) => {
    setSelectedProvider(provider)
    setModalOpen(true)
  }

  const validateCustomDNS = (dns) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipRegex.test(dns)
  }

  const isCustomDNSValid = () => {
    return (
      customDNS.primary &&
      validateCustomDNS(customDNS.primary) &&
      (!customDNS.secondary || validateCustomDNS(customDNS.secondary))
    )
  }

  const toggleAutoSwitch = () => {
    const newState = !autoSwitch
    setAutoSwitch(newState)

    const config = {
      enabled: newState,
      lastChanged: new Date().toISOString(),
    }

    localStorage.setItem("dns:auto-switch", JSON.stringify(config))

    toast.info(`Troca automática ${newState ? "ativada" : "desativada"}`, {
      autoClose: 3000,
    })
  }

  const filteredProviders =
    categoryActive === "all"
      ? dnsProviders
      : dnsProviders.filter((provider) => {
          if (categoryActive === "privacy") return ["cloudflare", "quad9"].includes(provider.id)
          if (categoryActive === "speed") return ["cloudflare", "google"].includes(provider.id)
          if (categoryActive === "security") return ["quad9", "adguard", "opendns"].includes(provider.id)
          return true
        })

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca"
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="relative mx-4 w-[90vw] max-w-md overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-7 text-maxify-text shadow-2xl shadow-black/20">
          <BackgroundGlow />

          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                <Globe className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">
                  Confirmação
                </p>
                <h2 className="text-xl font-black text-maxify-text">Alterar DNS</h2>
              </div>
            </div>

            {selectedProvider && (
              <>
                <p className="mb-4 text-sm leading-6 text-maxify-text-secondary">
                  Você está prestes a alterar seus servidores DNS para{" "}
                  <span className="font-bold text-blue-300">{selectedProvider.name}</span>.
                </p>

                <div className="mb-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="space-y-2 text-sm text-maxify-text-secondary">
                    <div className="flex justify-between gap-3">
                      <strong className="text-maxify-text">Primário</strong>
                      <span>{selectedProvider.primary}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <strong className="text-maxify-text">Secundário</strong>
                      <span>{selectedProvider.secondary}</span>
                    </div>
                  </div>
                </div>

                <p className="mb-5 text-xs leading-5 text-maxify-text-secondary">
                  Isso irá alterar as configurações de DNS para todos os adaptadores de rede ativos e limpar o cache DNS.
                </p>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalOpen(false)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={() => applyDNS(selectedProvider)} disabled={loading}>
                {loading ? "Aplicando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <RootDiv>
        <div className="mx-auto flex w-full max-w-[1900px] flex-col gap-6 px-4 pb-16 md:px-6">
          <section className="relative mt-8 overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5 md:p-8">
            <BackgroundGlow />

            <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_380px] xl:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                  <Sparkles size={14} />
                  Central de rede
                </div>

                <div className="flex items-start gap-5">
                  <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                    <Globe className="h-9 w-9 text-blue-300" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                      Configuração de{" "}
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                        DNS inteligente
                      </span>
                    </h1>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                      Altere servidores DNS, acompanhe o status atual da rede e use provedores focados em velocidade, privacidade e segurança.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                        DNS atual: {stats.currentProvider || "Carregando..."}
                      </div>

                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                        {filteredProviders.length} provedor(es)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <Network size={30} className="text-blue-300" />
                  </div>

                  <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                    {currentDNS ? "Online" : "Verificando"}
                  </div>
                </div>

                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                  Status da conexão
                </p>

                <h2 className="mt-2 text-3xl font-black text-maxify-text">
                  {currentDNS ? "DNS detectado" : "Buscando rede"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                  Use os cards abaixo para aplicar provedores, ver adaptadores ativos e consultar seu histórico de alterações.
                </p>

                <div className="mt-5 flex gap-3">
                  <Button
                    onClick={getCurrentDNS}
                    variant="outline"
                    disabled={loading}
                    className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="DNS atual"
              value={stats.currentProvider || "Carregando..."}
              tone="blue"
              icon={<Wifi className="h-5 w-5" />}
            />
            <StatCard
              label="Total de alterações"
              value={stats.totalChanges}
              tone="cyan"
              icon={<RefreshCw className="h-5 w-5" />}
            />
            <StatCard
              label="Última alteração"
              value={stats.lastChanged ? formatDate(stats.lastChanged) : "Nunca"}
              tone="sky"
              icon={<Clock className="h-5 w-5" />}
            />
            <StatCard
              label="Status"
              value={currentDNS ? "Conectado" : "Verificando..."}
              tone={currentDNS ? "green" : "yellow"}
              icon={currentDNS ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            />
          </section>

          <section>
            <SectionTitle
              icon={HardDrive}
              label="Adaptadores"
              title="Configurações atuais de DNS"
              description="Configuração ativa de DNS em seus adaptadores de rede."
            />

            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
              {currentDNS && currentDNS.length > 0 ? (
                <div className="space-y-3">
                  {currentDNS.map((dns, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4 transition-all hover:border-blue-500/25 hover:bg-blue-500/10"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-maxify-text">
                            {dns.adapter}
                          </p>
                          <p className="mt-1 truncate text-xs text-maxify-text-secondary">
                            {dns.servers}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-green-300">Ativo</p>
                        <p className="text-xs text-maxify-text-secondary">IPv4</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-maxify-text-secondary">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-300" />
                  <p className="font-semibold text-maxify-text">Carregando informações da rede...</p>
                  <p className="text-sm">Isso pode levar alguns segundos</p>
                </div>
              )}
            </Card>
          </section>

          <section>
            <SectionTitle
              icon={Shield}
              label="Filtro"
              title="Categorias de DNS"
              description="Filtre provedores por velocidade, privacidade ou segurança."
            />

            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
              <div className="flex flex-wrap gap-2">
                {categories.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoryActive(categoria.id)}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                      categoryActive === categoria.id
                        ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
                        : "border-maxify-border bg-maxify-border/15 text-maxify-text-secondary hover:border-blue-500/25 hover:bg-blue-500/10"
                    } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {categoria.icon}
                    {categoria.label}
                  </button>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <SectionTitle
              icon={BarChart3}
              label="Provedores"
              title="Provedores de DNS"
              description={`${filteredProviders.length} provedor(es) disponível(eis).`}
            />

            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 rounded-2xl border border-maxify-border bg-maxify-bg/30 px-4 py-3">
                  <Gauge className="h-5 w-5 text-blue-300" />
                  <span className="text-sm font-semibold text-maxify-text-secondary">
                    Troca automática
                  </span>
                  <Toggle checked={autoSwitch} onChange={toggleAutoSwitch} disabled={loading} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProviders.map((provider) => (
                  <button
                    type="button"
                    key={provider.id}
                    onClick={() => !loading && openConfirmationModal(provider)}
                    disabled={loading}
                    className={`group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-bg/25 p-5 text-left transition-all ${
                      loading
                        ? "cursor-not-allowed opacity-50"
                        : "hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/10 hover:shadow-xl hover:shadow-blue-500/10"
                    } ${provider.recommended ? "ring-1 ring-blue-500/30" : ""}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_52%)] opacity-0 transition-opacity group-hover:opacity-100" />

                    {provider.recommended && (
                      <div className="absolute right-4 top-4 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                        Recomendado
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className={`rounded-2xl border p-3 ${provider.bgColor}`}>
                          <div className={provider.color}>{provider.icon}</div>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                      </div>

                      <h3 className="text-xl font-black text-maxify-text">{provider.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-blue-300">
                        {provider.primary} / {provider.secondary}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                        {provider.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {provider.features.map((feature, index) => (
                          <span
                            key={index}
                            className="rounded-xl border border-maxify-border bg-maxify-border/15 px-3 py-1 text-xs font-semibold text-maxify-text-secondary"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <SectionTitle
              icon={Settings}
              label="Manual"
              title="DNS personalizado"
              description="Insira seus próprios servidores DNS."
            />

            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <Settings className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-maxify-text">Configuração manual</h3>
                    <p className="text-sm text-maxify-text-secondary">
                      Use IPv4 válido, como 1.1.1.1 ou 8.8.8.8.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowCustom(!showCustom)}
                  size="sm"
                  variant={showCustom ? "secondary" : "outline"}
                  className="rounded-2xl"
                >
                  {showCustom ? "Ocultar" : "Mostrar"}
                </Button>
              </div>

              {showCustom && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-maxify-text">
                        DNS primário
                      </label>
                      <input
                        type="text"
                        value={customDNS.primary}
                        onChange={(e) =>
                          setCustomDNS((prev) => ({ ...prev, primary: e.target.value }))
                        }
                        placeholder="ex: 1.1.1.1"
                        className="w-full rounded-2xl border border-maxify-border bg-maxify-bg/30 px-4 py-3 text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary/50 focus:border-blue-500/50 focus:bg-blue-500/10 focus:ring-2 focus:ring-blue-500/15"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-maxify-text">
                        DNS secundário opcional
                      </label>
                      <input
                        type="text"
                        value={customDNS.secondary}
                        onChange={(e) =>
                          setCustomDNS((prev) => ({ ...prev, secondary: e.target.value }))
                        }
                        placeholder="ex: 1.0.0.1"
                        className="w-full rounded-2xl border border-maxify-border bg-maxify-bg/30 px-4 py-3 text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary/50 focus:border-blue-500/50 focus:bg-blue-500/10 focus:ring-2 focus:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <Info className="mt-0.5 h-4 w-4 text-blue-300" />
                    <span className="text-sm leading-6 text-maxify-text-secondary">
                      Insira endereços IPv4 válidos para servidores DNS personalizados.
                    </span>
                  </div>

                  <Button
                    onClick={() =>
                      openConfirmationModal({
                        id: "custom",
                        name: "DNS personalizado",
                        primary: customDNS.primary,
                        secondary: customDNS.secondary,
                      })
                    }
                    disabled={!isCustomDNSValid() || loading}
                    variant="primary"
                    className="min-h-[48px] w-full rounded-2xl text-base font-bold"
                  >
                    {loading ? "Aplicando..." : "Aplicar DNS personalizado"}
                  </Button>
                </div>
              )}
            </Card>
          </section>

          {dnsHistory.length > 0 && (
            <section>
              <SectionTitle
                icon={Clock}
                label="Histórico"
                title="Histórico de DNS"
                description="Mudanças recentes de DNS."
              />

              <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                <div className="space-y-3">
                  {dnsHistory.slice(0, 5).map((history, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-maxify-text">
                            {history.provider}
                          </p>
                          <p className="mt-1 text-xs text-maxify-text-secondary">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-blue-300">{history.servers}</p>
                        <p className="text-xs text-maxify-text-secondary">
                          {history.type === "custom" ? "Custom" : "Preset"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>
      </RootDiv>
    </>
  )
}
