import { useState, useEffect, useRef, useMemo } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  RefreshCw,
  Trash2,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  HardDrive,
  Shield,
  Database,
  Clock,
  XCircle,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import CleanIcon from "../../../../resources/maxifylogo.png"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { cleanupIconMap, categoryIconMap } from "@/utils/cleanupIcons"

function Limpeza() {
  const [cleanups, setCleanups] = useState([])
  const [categories, setCategories] = useState([])
  const [buscaLimpeza, setBuscaLimpeza] = useState("")
  const [selecionados, setSelecionados] = useState([])
  const [filaCarregando, setFilaCarregando] = useState([])
  const [ultimaLimpeza, setUltimaLimpeza] = useState(
    localStorage.getItem("ultima-limpeza") || "Ainda não limpo."
  )
  const [estaLimpando, setEstaLimpando] = useState(false)
  const [resultados, setResultados] = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [historicoLimpezas, setHistoricoLimpezas] = useState([])

  const [estatisticas, setEstatisticas] = useState({
    totalLiberado: 0,
    totalExecucoes: 0,
    limpezasHoje: 0,
    autoCleansExecuted: 0,
    totalAutoCleanSpace: 0,
  })

  const [performanceData, setPerformanceData] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    async function loadModule() {
      const mod = await import("@/data/cleanups")

      setCleanups(mod.cleanups || [])
      setCategories(mod.categories || [])
      setDataLoaded(true)
    }

    loadModule()
  }, [])

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem("maxify:historico-limpezas") || "[]")
    setHistoricoLimpezas(historico)

    const stats = JSON.parse(localStorage.getItem("maxify:estatisticas-limpeza") || "{}")
    setEstatisticas({
      totalLiberado: stats.totalLiberado || 0,
      totalExecucoes: stats.totalExecucoes || 0,
      limpezasHoje: stats.limpezasHoje || 0,
      autoCleansExecuted: stats.autoCleansExecuted || 0,
      totalAutoCleanSpace: stats.totalAutoCleanSpace || 0,
    })

    const resultadosAnteriores = JSON.parse(
      localStorage.getItem("maxify:resultados-limpeza") || "{}"
    )
    setResultados(resultadosAnteriores)
  }, [])

  const formatarBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 B"

    const tamanhos = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${tamanhos[i]}`
  }

  const executarScriptComTimeout = async (script, timeout = 60000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout: A operação demorou muito tempo")), timeout)
    })

    const scriptPromise = invoke({
      channel: "run-powershell",
      payload: {
        script,
        name: `limpeza-${Date.now()}`,
      },
    }).catch((err) => {
      console.error("Invoke error:", err)
      return null
    })

    return Promise.race([scriptPromise, timeoutPromise])
  }

  useEffect(() => {
    let interval

    if (isCollecting && estaLimpando) {
      const collectPerformanceData = () => {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const espacoLiberado = Object.values(resultados).reduce((acc, curr) => acc + curr, 0)

        setPerformanceData((prev) => {
          const newData = [
            ...prev,
            {
              time: `${currentTime}s`,
              espaco: espacoLiberado / (1024 * 1024),
              operacoes: Object.keys(resultados).length,
              selecionados: selecionados.length,
            },
          ]

          return newData.slice(-15)
        })
      }

      interval = setInterval(collectPerformanceData, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCollecting, estaLimpando, resultados, selecionados])

  const alternarLimpeza = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selecionarCategoria = (categoriaId) => {
    setCategoriaAtiva(categoriaId)
  }

  const getTextoStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "Executando..."
    if (resultado !== undefined) {
      return resultado > 0 ? `${formatarBytes(resultado)} liberados` : "Concluído (0 B)"
    }

    return "Pendente"
  }

  const getCorStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "text-blue-400"
    if (resultado !== undefined) {
      return resultado > 0 ? "text-cyan-400" : "text-slate-400"
    }

    return "text-slate-400"
  }

  async function executarLimpezas() {
    if (selecionados.length === 0) {
      toast.warning("Selecione pelo menos uma limpeza.")
      return
    }

    setEstaLimpando(true)
    setFilaCarregando([...selecionados])
    setPerformanceData([])
    startTimeRef.current = Date.now()
    setIsCollecting(true)

    let algumaSucesso = false
    let novosResultados = { ...resultados }
    let totalLiberadoNestaExecucao = 0
    const inicioLimpeza = new Date().toISOString()

    for (const limpeza of cleanups) {
      if (!selecionados.includes(limpeza.id)) continue

      const toastId = toast.loading(`Executando ${limpeza.label}...`)

      try {
        const result = await executarScriptComTimeout(limpeza.script, 60000)

        let espacoLiberado = 0

        if (result?.output) {
          const outputStr = result.output.toString().trim()
          const parsedSize = parseInt(outputStr)

          if (!isNaN(parsedSize)) {
            espacoLiberado = parsedSize
          }
        }

        novosResultados[limpeza.id] = espacoLiberado
        totalLiberadoNestaExecucao += espacoLiberado

        toast.update(toastId, {
          render: `${limpeza.label} concluído! ${formatarBytes(espacoLiberado)} liberados.`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })

        algumaSucesso = true
      } catch (err) {
        novosResultados[limpeza.id] = 0

        toast.update(toastId, {
          render: `Falha em ${limpeza.label}: ${err.message || "Erro desconhecido"}`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        })

        log.error(`Falha ao executar ${limpeza.id}: ${err.message || err}`)
      } finally {
        setFilaCarregando((q) => q.filter((id) => id !== limpeza.id))
        setResultados({ ...novosResultados })
      }
    }

    if (algumaSucesso) {
      const agora = new Date().toLocaleString()

      setUltimaLimpeza(agora)
      localStorage.setItem("ultima-limpeza", agora)
      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))

      const novoHistorico = [
        {
          timestamp: inicioLimpeza,
          totalLiberado: totalLiberadoNestaExecucao,
          selecionados: selecionados.length,
        },
        ...historicoLimpezas.slice(0, 9),
      ]

      setHistoricoLimpezas(novoHistorico)
      localStorage.setItem("maxify:historico-limpezas", JSON.stringify(novoHistorico))

      const hoje = new Date().toDateString()
      const ultimaExecucao = historicoLimpezas[0]
        ? new Date(historicoLimpezas[0].timestamp).toDateString()
        : null

      const stats = {
        totalLiberado: (estatisticas.totalLiberado || 0) + totalLiberadoNestaExecucao,
        totalExecucoes: (estatisticas.totalExecucoes || 0) + 1,
        limpezasHoje: hoje === ultimaExecucao ? (estatisticas.limpezasHoje || 0) + 1 : 1,
        autoCleansExecuted: estatisticas.autoCleansExecuted || 0,
        totalAutoCleanSpace: estatisticas.totalAutoCleanSpace || 0,
      }

      setEstatisticas(stats)
      localStorage.setItem("maxify:estatisticas-limpeza", JSON.stringify(stats))

      toast.success(
        `Limpeza concluída! ${formatarBytes(totalLiberadoNestaExecucao)} liberados no total.`,
        {
          autoClose: 5000,
        }
      )
    }

    setEstaLimpando(false)
    setIsCollecting(false)
    setDataLoaded(true)
  }

  const resetarLimpeza = (limpezaId) => {
    setResultados((prev) => {
      const novosResultados = { ...prev }

      delete novosResultados[limpezaId]

      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))

      return novosResultados
    })

    toast.info(`${cleanups.find((l) => l.id === limpezaId)?.label} resetado.`)
  }

  const selecionarTodosDaCategoria = () => {
    if (categoriaAtiva === "all") {
      setSelecionados(cleanups.map((limpeza) => limpeza.id))
    } else {
      const limpezasDaCategoria = cleanups
        .filter((limpeza) => limpeza.category === categoriaAtiva)
        .map((limpeza) => limpeza.id)

      setSelecionados(limpezasDaCategoria)
    }
  }

  const desmarcarTodos = () => {
    setSelecionados([])
  }

  const limpezasFiltradas = useMemo(() => {
    let lista = cleanups

    if (categoriaAtiva !== "all") {
      lista = lista.filter((limpeza) => limpeza.category === categoriaAtiva)
    }

    if (buscaLimpeza.trim()) {
      const termo = buscaLimpeza.toLowerCase().trim()

      lista = lista.filter((limpeza) => {
        return (
          limpeza.label?.toLowerCase().includes(termo) ||
          limpeza.description?.toLowerCase().includes(termo) ||
          limpeza.category?.toLowerCase().includes(termo) ||
          limpeza.id?.toLowerCase().includes(termo)
        )
      })
    }

    return lista
  }, [categoriaAtiva, cleanups, buscaLimpeza])

  const espacoTotalLiberado = useMemo(() => {
    return Object.values(resultados).reduce((acc, curr) => acc + curr, 0)
  }, [resultados])

  const totalHistoricoLiberado = useMemo(() => {
    return historicoLimpezas.reduce((acc, curr) => acc + curr.totalLiberado, 0)
  }, [historicoLimpezas])

  const dadosCategorias = useMemo(() => {
    return categories
      .map((cat) => {
        const limpezasCategoria = cleanups.filter((l) => l.category === cat.id)

        const espacoCategoria = limpezasCategoria.reduce(
          (acc, limpeza) => acc + (resultados[limpeza.id] || 0),
          0
        )

        return {
          name: cat.label,
          value: espacoCategoria / (1024 * 1024),
          categoria: cat.id,
        }
      })
      .filter((item) => item.value > 0)
  }, [categories, cleanups, resultados])

  const COLORS = [
    "#2563eb",
    "#3b82f6",
    "#0ea5e9",
    "#06b6d4",
    "#38bdf8",
    "#60a5fa",
    "#1d4ed8",
  ]

  const topStats = [
    {
      title: "Espaço liberado",
      value: formatarBytes(espacoTotalLiberado),
      icon: <HardDrive size={18} />,
      color: "from-blue-500/20 to-cyan-500/10",
      text: "text-cyan-300",
    },
    {
      title: "Histórico total",
      value: formatarBytes(totalHistoricoLiberado),
      icon: <Database size={18} />,
      color: "from-blue-600/20 to-sky-500/10",
      text: "text-blue-300",
    },
    {
      title: "Execuções",
      value: estatisticas.totalExecucoes,
      icon: <Activity size={18} />,
      color: "from-sky-500/20 to-blue-500/10",
      text: "text-sky-300",
    },
    {
      title: "Última limpeza",
      value: ultimaLimpeza === "Ainda não limpo." ? "Nunca" : "Feita",
      icon: estaLimpando ? (
        <RefreshCw className="animate-spin" size={18} />
      ) : (
        <CheckCircle2 size={18} />
      ),
      color: "from-cyan-500/20 to-blue-500/10",
      text: estaLimpando ? "text-blue-300" : "text-cyan-300",
    },
  ]

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-4">
                <Sparkles size={15} />
                Central de limpeza inteligente
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <Trash2 className="text-blue-400" size={30} />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                    Limpeza do sistema
                  </h1>

                  <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                    Gerencie limpezas manuais, acompanhe resultados em tempo real e veja o
                    histórico das últimas execuções.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      {cleanups.length} rotinas disponíveis
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      {selecionados.length} selecionadas
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                      Modo manual
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-full xl:min-w-[420px] xl:max-w-[460px]">
              {topStats.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border border-maxify-border bg-gradient-to-br ${item.color} p-4 backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${item.text}`}>{item.icon}</span>
                    <ChevronRight
                      size={16}
                      className="text-maxify-text-secondary opacity-60"
                    />
                  </div>

                  <p className={`text-xl md:text-2xl font-bold ${item.text}`}>
                    {item.value}
                  </p>

                  <p className="text-sm text-maxify-text-secondary mt-1">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-maxify-text">
                  Desempenho da execução
                </h2>

                <p className="text-sm text-maxify-text-secondary">
                  Veja o avanço do espaço liberado durante a limpeza
                </p>
              </div>

              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                {estaLimpando ? "Coletando dados..." : "Aguardando execução"}
              </div>
            </div>

            <div className="h-72">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="cleanArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />

                    <Tooltip
                      formatter={(value) => [`${value} MB`, "Espaço liberado"]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e40af",
                        borderRadius: "14px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="espaco"
                      stroke="#3b82f6"
                      fill="url(#cleanArea)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-maxify-border flex flex-col items-center justify-center text-center px-6">
                  <TrendingUp size={42} className="text-blue-400 opacity-70 mb-3" />

                  <p className="text-maxify-text font-medium">
                    Nenhum gráfico ainda
                  </p>

                  <p className="text-sm text-maxify-text-secondary mt-1">
                    Quando executar uma limpeza, o progresso aparece aqui.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="text-blue-400" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-maxify-text">
                  Categorias
                </h2>

                <p className="text-sm text-maxify-text-secondary">
                  Distribuição do espaço
                </p>
              </div>
            </div>

            <div className="h-72">
              {dadosCategorias.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      outerRadius={82}
                      innerRadius={45}
                      dataKey="value"
                      labelLine={false}
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [`${value.toFixed(2)} MB`, "Espaço liberado"]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #1e40af",
                        borderRadius: "14px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-maxify-border flex flex-col items-center justify-center text-center px-6">
                  <Database size={42} className="text-blue-400 opacity-70 mb-3" />

                  <p className="text-maxify-text font-medium">
                    Sem dados ainda
                  </p>

                  <p className="text-sm text-maxify-text-secondary mt-1">
                    As categorias aparecem depois da primeira limpeza.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Shield className="text-blue-400" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-maxify-text">
                  Filtrar por categoria
                </h2>

                <p className="text-sm text-maxify-text-secondary">
                  Escolha um grupo para focar só no que interessa
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={selecionarTodosDaCategoria}
                disabled={estaLimpando}
                variant="outline"
                size="sm"
              >
                Selecionar todos
              </Button>

              <Button
                onClick={desmarcarTodos}
                disabled={estaLimpando}
                variant="outline"
                size="sm"
              >
                Limpar seleção
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => selecionarCategoria(categoria.id)}
                disabled={estaLimpando}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all border flex items-center gap-2 ${
                  categoriaAtiva === categoria.id
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "bg-maxify-border/20 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/35"
                } ${estaLimpando ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {categoryIconMap[categoria.icon]}
                {categoria.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                    <img
                      src={CleanIcon}
                      width={24}
                      height={24}
                      className="select-none"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-maxify-text">
                      Rotinas de limpeza
                    </h2>

                    <p className="text-sm text-maxify-text-secondary">
                      {limpezasFiltradas.length} encontradas • {selecionados.length} selecionadas
                    </p>
                  </div>
                </div>

                {estaLimpando && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    <RefreshCw className="animate-spin" size={16} />

                    <span className="text-sm font-medium">
                      Executando limpeza
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                <input
                  value={buscaLimpeza}
                  onChange={(e) => setBuscaLimpeza(e.target.value)}
                  placeholder="Pesquisar limpeza, app, cache, jogo..."
                  className="w-full h-12 rounded-2xl bg-maxify-border/10 border border-maxify-border px-4 text-sm text-maxify-text outline-none focus:border-blue-500/40 placeholder:text-maxify-text-secondary"
                />

                <Button
                  onClick={selecionarTodosDaCategoria}
                  disabled={estaLimpando}
                  variant="outline"
                  size="sm"
                  className="h-12 px-5"
                >
                  Selecionar categoria
                </Button>

                <Button
                  onClick={desmarcarTodos}
                  disabled={estaLimpando}
                  variant="outline"
                  size="sm"
                  className="h-12 px-5"
                >
                  Limpar seleção
                </Button>
              </div>

            </div>

            <div className="max-h-[720px] overflow-y-auto pr-2 custom-clean-scroll">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {limpezasFiltradas.map((limpeza) => {
                  const estaSelecionado = selecionados.includes(limpeza.id)
                  const estaCarregando = filaCarregando.includes(limpeza.id)
                  const resultado = resultados[limpeza.id]

                  return (
                    <div
                      key={limpeza.id}
                      onClick={() => {
                        if (!estaLimpando && !estaCarregando) {
                          alternarLimpeza(limpeza.id)
                        }
                      }}
                      className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${
                        estaSelecionado
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                          : "border-maxify-border bg-maxify-border/10 hover:border-blue-400/40 hover:bg-maxify-border/15"
                      } ${estaCarregando ? "opacity-80" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${
                              limpeza.warning
                                ? "bg-red-500/10 text-red-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {cleanupIconMap[limpeza.icon]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[15px] font-semibold text-maxify-text">
                                {limpeza.label}
                              </span>

                              {limpeza.warning && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-500/15 text-red-400">
                                  Cuidado
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-maxify-text-secondary mt-1 leading-relaxed line-clamp-2">
                              {limpeza.description}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={`text-sm font-medium ${getCorStatus(limpeza.id)}`}>
                                {getTextoStatus(limpeza.id)}
                              </span>

                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-maxify-border/20 border border-maxify-border text-maxify-text-secondary">
                                {limpeza.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {resultado !== undefined && (
                            <button
                              onClick={() => resetarLimpeza(limpeza.id)}
                              className="p-1.5 rounded-lg text-maxify-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Resetar"
                              disabled={estaLimpando}
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <Toggle
                            checked={estaSelecionado}
                            onChange={() => alternarLimpeza(limpeza.id)}
                            disabled={estaLimpando || estaCarregando}
                          />
                        </div>
                      </div>

                      {estaCarregando && (
                        <div className="absolute inset-0 rounded-2xl bg-maxify-card/75 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <RefreshCw className="animate-spin text-blue-400" size={16} />

                            <span className="text-sm font-medium text-blue-300">
                              Executando...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {limpezasFiltradas.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-maxify-border p-8 text-center">
                <p className="text-maxify-text font-semibold">
                  Nenhuma limpeza encontrada
                </p>

                <p className="text-sm text-maxify-text-secondary mt-1">
                  Tente pesquisar outro nome ou trocar a categoria.
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle2 className="text-blue-400" size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-maxify-text">
                    Resumo rápido
                  </h2>

                  <p className="text-sm text-maxify-text-secondary">
                    Estado atual da limpeza
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">
                    Selecionados
                  </p>

                  <p className="text-2xl font-bold text-blue-300 mt-1">
                    {selecionados.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">
                    Liberado nesta base
                  </p>

                  <p className="text-2xl font-bold text-cyan-300 mt-1">
                    {formatarBytes(espacoTotalLiberado)}
                  </p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">
                    Última limpeza
                  </p>

                  <p className="text-sm font-medium text-maxify-text mt-1 break-words">
                    {ultimaLimpeza}
                  </p>
                </div>
              </div>

              <Button
                onClick={executarLimpezas}
                disabled={estaLimpando || selecionados.length === 0}
                size="lg"
                variant="primary"
                className="w-full mt-5 min-h-[52px] flex items-center justify-center gap-3 text-base font-semibold"
              >
                {estaLimpando ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Limpando...</span>
                  </>
                ) : (
                  <>
                    <img
                      src={CleanIcon}
                      width={22}
                      height={22}
                      className="select-none filter brightness-0 invert"
                    />

                    <span>Executar limpeza</span>
                  </>
                )}
              </Button>
            </Card>

            {historicoLimpezas.length > 0 && (
              <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <Clock className="text-blue-400" size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-maxify-text">
                      Histórico
                    </h2>

                    <p className="text-sm text-maxify-text-secondary">
                      Últimas limpezas
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {historicoLimpezas.slice(0, 5).map((historico, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-maxify-text">
                            {new Date(historico.timestamp).toLocaleString()}
                          </p>

                          <p className="text-xs text-maxify-text-secondary mt-1">
                            {historico.selecionados} operação(ões)
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-cyan-300">
                            {formatarBytes(historico.totalLiberado)}
                          </p>

                          <p className="text-xs text-maxify-text-secondary">
                            liberados
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RootDiv>
  )
}

export default Limpeza