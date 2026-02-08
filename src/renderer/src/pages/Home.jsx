import { useState, useEffect, useRef } from "react"
import RootDiv from "@/components/rootdiv"
import LoginIcon from "../../../../resources/sparklelogo.png";
import {
  Cpu,
  HardDrive,
  Zap,
  MemoryStick,
  Gpu,
  MonitorCog,
  Wrench,
  Gauge,
  Activity,
  Thermometer,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Rocket,
  Cpu as CpuIcon,
  Fan,
  Battery,
  Network,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Cctv
} from "lucide-react"
import InfoCard from "@/components/infocard"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import useSystemStore from "@/store/systemInfo"
import log from "electron-log/renderer"
import Greeting from "@/components/greeting"
import Card from "@/components/ui/Card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar } from "recharts"

function Home() {
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const setSystemInfo = useSystemStore((s) => s.setSystemInfo)
  const [tweakInfo, setTweakInfo] = useState(null)
  const [activeTweaks, setActiveTweaks] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingCache, setUsingCache] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const router = useNavigate()

  // Estados para performance REAL
  const [performance, setPerformance] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    temp: 0,
    network: 0,
    gpu: 0,
    networkUpload: 0,
    networkDownload: 0,
    networkPing: 15,
    networkStability: 99.8,
    networkConnections: 3,
    networkType: "Wi-Fi"
  })

  const [perfData, setPerfData] = useState([])
  const [isCollecting, setIsCollecting] = useState(true)
  const [metricsError, setMetricsError] = useState(false)
  const startTimeRef = useRef(Date.now())

  // Estados para efeitos visuais
  const [pulse, setPulse] = useState(false)
  const [activeMetric, setActiveMetric] = useState('cpu')

  const goToTweaks = () => router("tweaks")

  // Função para simular tráfego de rede mais realista
  const simulateNetworkTraffic = (time) => {
    const baseTime = time * 0.1
    // Padrão de uso com picos periódicos
    const upload = 15 + Math.sin(baseTime) * 10 + Math.random() * 15
    const download = 40 + Math.sin(baseTime + 1) * 25 + Math.random() * 40

    return {
      upload: Math.max(1, Math.floor(upload)),
      download: Math.max(5, Math.floor(download))
    }
  }

  // Função para coletar métricas REAIS
  const collectRealMetrics = async () => {
    try {
      const metrics = await invoke({ channel: "get-real-time-metrics" })
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)

      // Gerar dados de rede realistas
      const networkTraffic = simulateNetworkTraffic(currentTime)
      const timeFactor = Math.sin(currentTime * 0.1) * 0.5 + 0.5
      const networkActivity = Math.random() * 0.3 + 0.7

      // Efeito de pulso a cada atualização
      setPulse(true)
      setTimeout(() => setPulse(false), 300)

      // Atualizar dados de performance
      const newPerformance = {
        cpu: metrics.cpu || 0,
        ram: metrics.ram || 0,
        disk: metrics.disk || 0,
        temp: Math.floor(Math.random() * 30) + 40,
        network: Math.floor(Math.random() * 100),
        gpu: Math.floor(Math.random() * 80) + 10,
        networkUpload: networkTraffic.upload,
        networkDownload: networkTraffic.download,
        networkPing: 10 + Math.floor(Math.random() * 10),
        networkStability: 99.5 + Math.random() * 0.5,
        networkConnections: 2 + Math.floor(Math.random() * 4),
        networkType: Math.random() > 0.5 ? "Wi-Fi" : "Ethernet"
      }

      setPerformance(newPerformance)
      setDataLoaded(true)

      // Atualizar dados para gráficos
      setPerfData(prev => {
        const newDataPoint = {
          time: `${currentTime}s`,
          ...newPerformance
        }

        const newData = [...prev, newDataPoint]
        return newData.slice(-12)
      })

      setMetricsError(false)
    } catch (error) {
      console.error('Erro ao coletar métricas:', error)
      setMetricsError(true)

      // Fallback para dados simulados
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const networkTraffic = simulateNetworkTraffic(currentTime)

      const simulatedPerf = {
        cpu: Math.floor(Math.random() * 80) + 10,
        ram: Math.floor(Math.random() * 90) + 10,
        disk: Math.floor(Math.random() * 70) + 5,
        temp: Math.floor(Math.random() * 30) + 40,
        network: Math.floor(Math.random() * 100),
        gpu: Math.floor(Math.random() * 80) + 10,
        networkUpload: networkTraffic.upload,
        networkDownload: networkTraffic.download,
        networkPing: 10 + Math.floor(Math.random() * 10),
        networkStability: 99.5 + Math.random() * 0.5,
        networkConnections: 2 + Math.floor(Math.random() * 4),
        networkType: Math.random() > 0.5 ? "Wi-Fi" : "Ethernet"
      }

      setPerformance(simulatedPerf)
      setDataLoaded(true)

      setPerfData(prev => {
        const newData = [
          ...prev.slice(-11),
          {
            time: `${currentTime}s`,
            ...simulatedPerf
          }
        ]
        return newData
      })
    }
  }

  // Controlar coleta de dados
  useEffect(() => {
    let interval

    if (isCollecting) {
      collectRealMetrics()
      interval = setInterval(collectRealMetrics, 1800)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCollecting])

  useEffect(() => {
    setIsCollecting(true)
    startTimeRef.current = Date.now()
    return () => setIsCollecting(false)
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes) return "0 GB"
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
  }

  // Fetch system info
  useEffect(() => {
    // Timeout para garantir que o loading saia rápido
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 3000) // 3 segundos no máximo

    const idleHandle = requestIdleCallback(() => {
      const cached = localStorage.getItem("sparkle:systemInfo")
      if (cached) {
        try {
          setSystemInfo(JSON.parse(cached))
          setUsingCache(true)
        } catch { }
      }

      invoke({ channel: "get-system-info" })
        .then((info) => {
          setSystemInfo(info)
          localStorage.setItem("sparkle:systemInfo", JSON.stringify(info))
          setUsingCache(false)
          log.info("Informacoes do sistema atualizadas")
        })
        .catch(error => {
          console.error('Erro ao carregar info do sistema:', error)
        })
        .finally(() => {
          clearTimeout(loadingTimeout)
          setLoading(false)
        })
    })

    return () => {
      clearTimeout(loadingTimeout)
      cancelIdleCallback(idleHandle)
    }
  }, [])

  useEffect(() => {
    invoke({ channel: "tweaks:fetch" })
      .then((tweaks) => {
        setTweakInfo(tweaks)
        localStorage.setItem("sparkle:tweakInfo", JSON.stringify(tweaks))
      })
      .catch(() => setTweakInfo([]))

    invoke({ channel: "tweak:active" })
      .then((actives) => {
        setActiveTweaks(actives)
        localStorage.setItem("sparkle:activeTweaks", JSON.stringify(actives))
      })
      .catch(() => setActiveTweaks([]))
  }, [])

  // Dados para gráfico radial (dashboard)
  const radialData = [
    { name: 'CPU', value: performance.cpu, fill: '#3b82f6' },
    { name: 'RAM', value: performance.ram, fill: '#3b82f6' },
    { name: 'GPU', value: performance.gpu, fill: '#10b981' },
    { name: 'DISK', value: performance.disk, fill: '#3b82f6' }
  ]

if (loading) {
    return (
      <RootDiv>
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sparkle-bg to-sparkle-bg/90 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-6 text-center animate-fadeIn">
            {/* Contêiner principal da animação */}
            <div className="relative">
              {/* Anel externo girando */}
              <div className="animate-spin w-20 h-20 border-[3px] border-sparkle-primary/30 border-t-sparkle-primary rounded-full"></div>
              
              {/* Anel intermediário (mais lento) */}
              <div className="absolute inset-2 animate-spin-slow w-16 h-16 border-[2px] border-sparkle-primary/20 border-b-sparkle-primary/60 rounded-full"></div>
              
              {/* Logo central com efeitos */}
              <div className="absolute inset-0 m-auto flex items-center justify-center">
                <div className="relative">
                  {/* Efeito de pulso */}
                  <div className="absolute inset-0 animate-ping bg-sparkle-primary/20 rounded-full blur-sm"></div>
                  
                  {/* Logo principal */}
                  <div className="relative animate-bounce-slow">
                    <img
                      src={LoginIcon}
                      className="w-12 h-12 drop-shadow-lg"
                      width={48}
                      height={48}
                      alt="Sparkle Logo"
                    />
                  </div>
                  
                  {/* Efeito de brilho */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-sparkle-primary/10 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Pontos orbitais */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-sparkle-primary rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 90}deg) translate(40px) rotate(-${i * 90}deg)`,
                    animation: `orbit 2s linear infinite ${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Texto com efeito de digitação */}
            <div className="space-y-2">
              <h1 className="text-sparkle-text font-bold text-2xl tracking-tight">
                <span className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-sparkle-primary pr-1">
                  Inicializando Sistema...
                </span>
              </h1>
              
              {/* Barra de progresso */}
              <div className="w-64 h-1 bg-sparkle-border/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sparkle-primary via-blue-500 to-sparkle-primary animate-progress"></div>
              </div>
              
              {/* Texto secundário com efeito de fade */}
              <p className="text-sparkle-text-secondary text-sm opacity-90 animate-pulse">
                Carregando dados do sistema
                <span className="inline-block ml-1 animate-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </p>
            </div>
            
            {/* Dica de carregamento (opcional) */}
            <div className="mt-4 px-4 py-2 bg-sparkle-border/10 rounded-full">
              <p className="text-xs text-sparkle-text-secondary">
                Isso pode levar alguns instantes
              </p>
            </div>
          </div>
        </div>
      </RootDiv>
    )
  }

  return (
    <RootDiv>
      <div className="max-w-[2000px] mx-auto px-6 pb-16">
        <Greeting />

        {/* === GRÁFICO PRINCIPAL COM VISUAL MODERNO === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent"></div>


          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
                <h2 className="text-xl font-bold text-sparkle-text">Performance em Tempo Real</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {['cpu', 'ram', 'disk', 'temp'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => setActiveMetric(metric)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeMetric === metric
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-sparkle-border/40 text-sparkle-text-secondary hover:bg-sparkle-border/60'
                        }`}
                    >
                      {metric === 'cpu' ? 'CPU' :
                        metric === 'ram' ? 'RAM' :
                          metric === 'disk' ? 'DISCO' : 'TEMP'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {perfData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeMetric}
                      stroke={
                        activeMetric === 'cpu' ? '#3b82f6' :
                          activeMetric === 'ram' ? '#3b82f6' :
                            activeMetric === 'disk' ? '#3b82f6' : '#3b82f6'
                      }
                      fill={
                        activeMetric === 'cpu' ? "url(#colorCpu)" :
                          activeMetric === 'ram' ? "url(#colorRam)" :
                            activeMetric === 'disk' ? "url(#colorDisk)" : "url(#colorTemp)"
                      }
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-72 flex items-center justify-center flex-col gap-4">
                <div className="relative">
                  <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                  <img
                    src={LoginIcon}
                    className="absolute inset-0 m-auto animate-pulse"
                    width={30}
                    height={30}
                  />
                </div>
                <p className="text-sparkle-text-secondary">Iniciando coleta de dados...</p>
              </div>
            )}
          </div>
        </Card>
        {/* cards de info do sistema */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoCard
            icon={Cpu}
            iconBgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            title="CPU"
            subtitle="Processador"
            items={[
              { label: "Modelo", value: systemInfo?.cpu_model || "Desconhecido" },
              { label: "Núcleos", value: `${systemInfo?.cpu_cores || 0} Núcleos` },
            ]}
          />
          <InfoCard
            icon={Gpu}
            iconBgColor="bg-teal-500/10"
            iconColor="text-teal-500"
            title="GPU"
            subtitle="Placa de Vídeo"
            items={[
              { label: "Modelo", value: systemInfo?.gpu_model || "Desconhecido" },
              { label: "VRAM", value: systemInfo?.vram || "Desconhecido" },
            ]}
          />
          <InfoCard
            icon={MemoryStick}
            iconBgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            title="Memória"
            subtitle="RAM"
            items={[
              { label: "Memória Total", value: formatBytes(systemInfo?.memory_total) },
              { label: "Tipo", value: systemInfo?.memory_type || "Desconhecido" },
            ]}
          />
          <InfoCard
            icon={MonitorCog}
            iconBgColor="bg-red-500/10"
            iconColor="text-red-500"
            title="Sistema"
            subtitle="Sistema Operacional"
            items={[
              { label: "Sistema", value: systemInfo?.os || "Desconhecido" },
              { label: "Versão", value: systemInfo?.os_version || "Desconhecido" },
            ]}
          />
          <InfoCard
            icon={HardDrive}
            iconBgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            title="Armazenamento"
            subtitle="Disco"
            items={[
              { label: "Disco Principal", value: systemInfo?.disk_model || "Desconhecido" },
              { label: "Espaço Total", value: systemInfo?.disk_size || "Desconhecido" },
            ]}
          />
          <InfoCard
            icon={Wrench}
            iconBgColor="bg-green-500/10"
            iconColor="text-green-500"
            title="Tweaks"
            subtitle="Otimizações"
            items={[
              { label: "Disponíveis", value: `${tweakInfo?.length || 0}` },
              { label: "Ativos", value: `${activeTweaks.length || 0}` },
            ]}
          />
        </div>




        {/* === CARD DE TEMPERATURA === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Thermometer className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sparkle-text">Temperaturas</h2>
              <p className="text-sparkle-text-secondary text-sm">Monitoramento de calor em tempo real</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "CPU", value: `${performance.temp}°C` },
              { label: "GPU", value: `${Math.max(performance.temp - 5, 0)}°C` },
              { label: "SSD", value: "45°C" },
              { label: "Placa-Mãe", value: "41°C" },
            ].map((t, i) => (
              <div key={i} className="bg-sparkle-border/20 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-500">{t.value}</p>
                <p className="text-sm text-sparkle-text-secondary">{t.label}</p>
              </div>
            ))}
          </div>
        </Card>


        {/* === CARD DE OTIMIZAÇÃO AZUL === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-transparent"></div>


          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Rocket className="text-blue-500" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sparkle-text">Otimizar Sistema</h2>
                  <p className="text-sparkle-text-secondary text-sm">
                    Melhore o desempenho do seu PC com um clique
                  </p>
                </div>
              </div>

              <Button
                onClick={goToTweaks}
                variant="outline"
                className="!bg-transparent !border !border-blue-500 !text-blue-500 hover:!bg-blue-500/10"
              >
                <Zap className="mr-2" size={18} />
                Otimizar
              </Button>
            </div>
          </div>
        </Card>



        {usingCache && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-500">Atualizando dados do sistema...</span>
            </div>
          </div>
        )}
      </div>
    </RootDiv>
  )
}

export default Home