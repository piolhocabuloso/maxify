import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"
import RootDiv from "@/components/rootdiv"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { toast } from "react-toastify"
import { Globe, Shield, Settings, RefreshCw, AlertCircle, Info, Check, Zap, Cloud, Wifi, Cpu, Database, Clock, BarChart3, TrendingUp, HardDrive } from "lucide-react"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Toggle from "@/components/ui/toggle"

const dnsProviders = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    description: "Rápido, seguro e focado em privacidade",
    features: ["Fast", "Privacy", "Security"],
    recommended: true,
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    icon: <Cloud className="w-5 h-5" />,
  },
  {
    id: "google",
    name: "Google",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    description: "Serviço DNS confiável e amplamente utilizado",
    features: ["Reliable", "Fast", "Global"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "opendns",
    name: "OpenDNS",
    primary: "208.67.222.222",
    secondary: "208.67.220.220",
    description: "DNS da Cisco com filtragem de conteúdo",
    features: ["Filtering", "Reliable", "Security"],
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "quad9",
    name: "Quad9",
    primary: "9.9.9.9",
    secondary: "149.112.112.112",
    description: "DNS focado em segurança com bloqueio de ameaças",
    features: ["Security", "Threat Block", "Privacy"],
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "adguard",
    name: "AdGuard DNS",
    primary: "94.140.14.14",
    secondary: "94.140.15.15",
    description: "Bloqueia anúncios, rastreadores e malware",
    features: ["Ad Block", "Tracker Block", "Security"],
    color: "text-teal-500",
    bgColor: "bg-teal-500/20",
    icon: <Cloud className="w-5 h-5" />,
  },
  {
    id: "automatic",
    name: "Automático (DHCP)",
    primary: "Auto",
    secondary: "Auto",
    description: "Use os servidores DNS padrão do seu ISP",
    features: ["Default", "ISP", "Auto"],
    color: "text-gray-500",
    bgColor: "bg-gray-500/20",
    icon: <Settings className="w-5 h-5" />,
  },
]

const categories = [
  { id: "all", label: "Todos os DNS", icon: <Globe size={16} /> },
  { id: "privacy", label: "Privacidade", icon: <Shield size={16} /> },
  { id: "speed", label: "Velocidade", icon: <Zap size={16} /> },
  { id: "security", label: "Segurança", icon: <Shield size={16} /> },
]

export default function DNSPage() {
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [currentDNS, setCurrentDNS] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [customDNS, setCustomDNS] = useState({ primary: "", secondary: "" })
  const [showCustom, setShowCustom] = useState(false)
  const [categoryActive, setCategoryActive] = useState("all")
  const [dnsHistory, setDnsHistory] = useState([])
  const [autoSwitch, setAutoSwitch] = useState(false)

  // Statistics
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
    // Load auto-switch configuration
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
        
        // Try to identify current provider
        const servers = result.data[0]?.servers || ""
        let provider = dnsProviders.find(p => 
          servers.includes(p.primary.replace('.', '\\.'))
        ) || dnsProviders.find(p => p.id === "automatic")
        
        setStats(prev => ({
          ...prev,
          currentProvider: provider?.name || "Unknown"
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

  const saveToHistory = (provider, servers) => {
    const newHistory = [{
      timestamp: new Date().toISOString(),
      provider: provider.name,
      servers: `${provider.primary} / ${provider.secondary}`,
      type: provider.id
    }, ...dnsHistory.slice(0, 9)]
    
    setDnsHistory(newHistory)
    localStorage.setItem("dns:history", JSON.stringify(newHistory))
  }

  const updateStats = (providerName) => {
    const newStats = {
      totalChanges: (stats.totalChanges || 0) + 1,
      lastChanged: new Date().toISOString(),
      currentProvider: providerName
    }
    
    setStats(newStats)
    localStorage.setItem("dns:stats", JSON.stringify(newStats))
  }

  const applyDNS = async (provider) => {
    setLoading(true)
    const toastId = toast.loading(`Aplicando ${provider.name} DNS...`)

    try {
      let payload
      if (provider.id === "custom") {
        payload = {
          dnsType: "custom",
          primaryDNS: customDNS.primary,
          secondaryDNS: customDNS.secondary,
        }
      } else {
        payload = {
          dnsType: provider.id,
        }
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
        
        // Save to history
        saveToHistory(provider, `${provider.primary} / ${provider.secondary}`)
        
        // Update stats
        updateStats(provider.name)
        
        // Reset custom DNS if applied
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

  const selectCategory = (categoryId) => {
    setCategoryActive(categoryId)
  }

  const toggleAutoSwitch = () => {
    const newState = !autoSwitch
    setAutoSwitch(newState)
    
    const config = {
      enabled: newState,
      lastChanged: new Date().toISOString()
    }
    
    localStorage.setItem("dns:auto-switch", JSON.stringify(config))
    
    toast.info(`Auto DNS switch ${newState ? 'enabled' : 'disabled'}`, {
      autoClose: 3000
    })
  }

  const filteredProviders = categoryActive === "all" 
    ? dnsProviders 
    : dnsProviders.filter(provider => {
        if (categoryActive === "privacy") return ["cloudflare", "quad9"].includes(provider.id)
        if (categoryActive === "speed") return ["cloudflare", "google"].includes(provider.id)
        if (categoryActive === "security") return ["quad9", "adguard", "opendns"].includes(provider.id)
        return true
      })

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  return (
    <>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="bg-sparkle-card p-6 rounded-2xl border border-sparkle-border text-sparkle-text w-[90vw] max-w-md">
          <h2 className="text-lg font-semibold mb-4">Confirm DNS Change</h2>
          {selectedProvider && (
            <>
              <p className="mb-4">
                Você está prestes a alterar seus servidores DNS para{" "}
                <span className="text-sparkle-primary font-medium">{selectedProvider.name}</span>.
              </p>
              <div className="bg-sparkle-border-secondary border border-sparkle-border p-3 rounded-md mb-4">
                <div className="text-sm">
                  <div>
                    <strong>Primário:</strong> {selectedProvider.primary}
                  </div>
                  <div>
                    <strong>Secundário:</strong> {selectedProvider.secondary}
                  </div>
                </div>
              </div>
              <p className="text-sm text-sparkle-text-secondary mb-4">
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
      </Modal>
      
      <RootDiv>
        <div className="max-w-[2000px] mx-auto px-6 pb-16">
          {/* === HEADER WITH STATISTICS === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-transparent"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Globe className="text-blue-500" size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-sparkle-text mb-1">Configuração de DNS</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Altere os servidores DNS para uma navegação mais rápida e segura
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "DNS atual",
                    value: stats.currentProvider || "Carregando...",
                    color: "text-blue-500",
                    icon: <Wifi className="inline mr-1" size={16} />
                  },
                  {
                    label: "Total de alterações",
                    value: stats.totalChanges,
                    color: "text-purple-500",
                    icon: <RefreshCw className="inline mr-1" size={16} />
                  },
                  {
                    label: "Última alteração",
                    value: stats.lastChanged ? formatDate(stats.lastChanged) : "Nunca",
                    color: "text-green-500",
                    icon: <Clock className="inline mr-1" size={16} />
                  },
                  {
                    label: "Status",
                    value: currentDNS ? "Conectado" : "Verificando...",
                    color: currentDNS ? "text-green-500" : "text-yellow-500",
                    icon: currentDNS ? <Check className="inline mr-1" size={16} /> : <AlertCircle className="inline mr-1" size={16} />
                  },
                ].map((stat, index) => (
                  <div key={index} className="bg-sparkle-border/20 p-4 rounded-xl text-center">
                    <p className={`text-2xl font-bold ${stat.color} flex items-center justify-center`}>
                      {stat.icon}
                      {stat.value}
                    </p>
                    <p className="text-sm text-sparkle-text-secondary mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* === CURRENT DNS SETTINGS === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <HardDrive className="text-green-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Configurações Atuais de DNS</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Configuração ativa de DNS em seus adaptadores de rede
                  </p>
                </div>
              </div>
              <Button onClick={getCurrentDNS} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {currentDNS && currentDNS.length > 0 ? (
              <div className="space-y-4">
                {currentDNS.map((dns, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-sparkle-border/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-sparkle-text">
                          {dns.adapter}
                        </p>
                        <p className="text-xs text-sparkle-text-secondary">
                          {dns.servers}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-500">
                        Ativo
                      </p>
                      <p className="text-xs text-sparkle-text-secondary">
                        IPv4
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 flex-col gap-3 text-sparkle-text-secondary">
                <RefreshCw className="animate-spin" size={32} />
                <p>Carregando informações da rede...</p>
                <p className="text-sm">Isso pode levar alguns segundos</p>
              </div>
            )}
          </Card>

          {/* === DNS CATEGORIES FILTER === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Shield className="text-purple-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Categorias de DNS</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Filtrar provedores de DNS por tipo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(categoria => (
                <button
                  key={categoria.id}
                  onClick={() => selectCategory(categoria.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${categoryActive === categoria.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-sparkle-border/40 text-sparkle-text-secondary hover:bg-sparkle-border/60'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {categoria.icon}
                  {categoria.label}
                </button>
              ))}
            </div>
          </Card>

          {/* === DNS PROVIDERS GRID === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <BarChart3 className="text-blue-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Provedores de DNS</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    {filteredProviders.length} provedor(es) disponível(eis)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-sparkle-text-secondary">Troca automática</span>
                <Toggle
                  checked={autoSwitch}
                  onChange={toggleAutoSwitch}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-sparkle-primary'} ${provider.recommended ? 'ring-1 ring-orange-500 ring-opacity-50' : ''}`}
                  onClick={() => !loading && openConfirmationModal(provider)}
                >
                  {provider.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Recomendado
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg mt-1 ${provider.bgColor}`}>
                        <div className={provider.color}>
                          {provider.icon}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-sparkle-text truncate">
                            {provider.name}
                          </span>
                        </div>
                        <span className="text-sm text-sparkle-text-secondary mt-1">
                          {provider.primary} / {provider.secondary}
                        </span>
                        <p className="text-xs text-sparkle-text-secondary mt-2">
                          {provider.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {provider.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-sparkle-border text-xs rounded-md">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* === CUSTOM DNS === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-xl">
                  <Settings className="text-teal-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">DNS personalizado</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Insira seus próprios servidores DNS
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCustom(!showCustom)} 
                size="sm"
                variant={showCustom ? "secondary" : "outline"}
              >
                {showCustom ? "Hide" : "Show"}
              </Button>
            </div>

            {showCustom && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-sparkle-text">DNS primário</label>
                    <input
                      type="text"
                      value={customDNS.primary}
                      onChange={(e) =>
                        setCustomDNS((prev) => ({ ...prev, primary: e.target.value }))
                      }
                      placeholder="e.g., 1.1.1.1"
                      className="w-full px-4 py-3 bg-sparkle-card border border-sparkle-border rounded-xl text-sparkle-text focus:outline-hidden focus:border-sparkle-primary focus:ring-2 focus:ring-sparkle-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-sparkle-text">
                      DNS secundário (opcional)
                    </label>
                    <input
                      type="text"
                      value={customDNS.secondary}
                      onChange={(e) =>
                        setCustomDNS((prev) => ({ ...prev, secondary: e.target.value }))
                      }
                      placeholder="e.g., 1.0.0.1"
                      className="w-full px-4 py-3 bg-sparkle-card border border-sparkle-border rounded-xl text-sparkle-text focus:outline-hidden focus:border-sparkle-primary focus:ring-2 focus:ring-sparkle-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-sparkle-text-secondary">
                    Insira endereços IPv4 válidos para servidores DNS personalizados (por exemplo, 8.8.8.8, 1.1.1.1)
                  </span>
                </div>

                <Button
                  onClick={() =>
                    openConfirmationModal({
                      id: "custom",
                      name: "Custom DNS",
                      primary: customDNS.primary,
                      secondary: customDNS.secondary,
                    })
                  }
                  disabled={!isCustomDNSValid() || loading}
                  variant="primary"
                  className="w-full py-3 text-base font-semibold"
                >
                  {loading ? "Applying..." : "Apply Custom DNS"}
                </Button>
              </div>
            )}
          </Card>

          {/* === DNS HISTORY === */}
          {dnsHistory.length > 0 && (
            <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Clock className="text-purple-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Histórico de DNS</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Mudanças recentes de DNS
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {dnsHistory.slice(0, 5).map((history, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-sparkle-border/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-sparkle-text">
                          {history.provider}
                        </p>
                        <p className="text-xs text-sparkle-text-secondary">
                          {new Date(history.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-sparkle-text">
                        {history.servers}
                      </p>
                      <p className="text-xs text-sparkle-text-secondary">
                        {history.type === 'custom' ? 'Custom' : 'Preset'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </RootDiv>
    </>
  )
}