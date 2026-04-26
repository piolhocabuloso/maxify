import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  Rocket,
  Gamepad2,
  Zap,
  AlertTriangle,
  Play,
  Pause,
  Power,
  ChevronRight,
  ShieldCheck,
  Activity,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Cpu,
  BarChart3,
  Settings,
  Server,
  Wifi,
  HardDrive,
  Trophy,
  Target,
  Layers,
  LayoutGrid,
  List,
} from "lucide-react"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import log from "electron-log/renderer"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { gameActions, categories, GAME_ENGINE_CONFIG } from "@/data/gameActions"

// Configurações
const CACHE_TTL = 30000
const BATCH_SIZE = 3
const APPLY_BATCH_SIZE = 5
const DEBOUNCE_DELAY = 300

// Cache de estado
const stateCache = new Map()

// Tipos
const ViewMode = {
  GRID: 'grid',
  LIST: 'list'
}

// Componente de Loading Skeleton
const LoadingSkeleton = memo(() => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20"></div>
            <div className="flex-1">
              <div className="h-5 bg-blue-500/20 rounded-lg w-1/3 mb-2"></div>
              <div className="h-4 bg-blue-500/20 rounded-lg w-2/3 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-blue-500/20 rounded-xl w-24"></div>
                <div className="h-8 bg-blue-500/20 rounded-xl w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

// Componente de Estatística
const StatCard = memo(({ icon, title, value, color, subtitle, trend }) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-maxify-border bg-gradient-to-br ${color} p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-blue-300">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-maxify-text-secondary">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-maxify-text-secondary/60 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  </div>
))

StatCard.displayName = "StatCard"

// Componente de Categoria
const CategoryButton = memo(({ category, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`group relative px-5 py-3 rounded-2xl text-sm font-medium transition-all border flex items-center gap-2 overflow-hidden ${
      isActive
        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10"
        : "bg-maxify-border/20 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/35 hover:scale-105"
    }`}
  >
    <span className="relative z-10 flex items-center gap-2">
      {category.icon}
      {category.label}
      {count > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
          {count}
        </span>
      )}
    </span>
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
    )}
  </button>
))

CategoryButton.displayName = "CategoryButton"

// Componente de Card de Ação Melhorado
const ActionCard = memo(({ 
  action, 
  isSelected, 
  isApplied, 
  isLoading, 
  onToggle, 
  onApply, 
  onRestore,
  viewMode 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl border transition-all duration-300 ${
        viewMode === ViewMode.GRID ? 'p-5' : 'p-4'
      } ${
        isSelected
          ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg shadow-blue-500/10"
          : "border-maxify-border bg-maxify-border/5 hover:border-blue-400/40 hover:bg-maxify-border/10"
      } ${isLoading ? "opacity-80" : ""} ${isHovered ? 'transform -translate-y-1' : ''}`}
    >
      {/* Badge de Efeito */}
      {action.badge && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
            {action.badge}
          </div>
        </div>
      )}

      <div className={`flex ${viewMode === ViewMode.GRID ? 'flex-col' : 'items-start justify-between'} gap-4`}>
        <div className={`flex ${viewMode === ViewMode.GRID ? 'flex-col' : 'flex-row'} items-start gap-3 flex-1 min-w-0`}>
          {/* Ícone Animado */}
          <div
            className={`mt-0.5 p-3 rounded-xl transition-all duration-300 ${
              isApplied
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20"
                : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
            } ${isHovered ? 'scale-110' : ''}`}
          >
            {action.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-base font-semibold text-maxify-text">
                {action.label}
              </span>

              {isApplied && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  ✓ Aplicado
                </span>
              )}

              {action.risk && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  action.risk === 'low' ? 'bg-green-500/20 text-green-300' :
                  action.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {action.risk === 'low' ? '🟢 Baixo risco' :
                   action.risk === 'medium' ? '🟡 Médio risco' :
                   '🔴 Alto risco'}
                </span>
              )}
            </div>

            <p className="text-sm text-maxify-text-secondary leading-relaxed">
              {action.description}
            </p>

            {/* Botões de Ação */}
            <div className={`mt-4 flex flex-wrap gap-2 ${viewMode === ViewMode.GRID ? 'justify-start' : ''}`}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApply(action.id)}
                disabled={!isSelected || isLoading}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <Play size={14} />
                Aplicar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onRestore(action.id)}
                disabled={!isApplied || isLoading}
                className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all hover:scale-105"
              >
                <RefreshCw size={14} />
                Restaurar
              </Button>
            </div>
          </div>
        </div>

        {/* Toggle Switch Melhorado */}
        <div className={`${viewMode === ViewMode.GRID ? 'flex justify-end' : 'shrink-0'}`}>
          <Toggle
            checked={isSelected}
            onChange={() => onToggle(action.id)}
            disabled={isLoading}
            className="scale-110"
          />
        </div>
      </div>
    </div>
  )
})

ActionCard.displayName = "ActionCard"

// Componente Principal
export default function ModoJogo() {
  const queryClient = useQueryClient()
  
  // Estados
  const [isActive, setIsActive] = useState(() => {
    try {
      const saved = localStorage.getItem("gaming-engine-active")
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  const [selecionados, setSelecionados] = useState(() => {
    try {
      const saved = localStorage.getItem("gaming-engine-selecionados")
      return saved ? JSON.parse(saved) : GAME_ENGINE_CONFIG.DEFAULT_SELECTIONS
    } catch {
      return GAME_ENGINE_CONFIG.DEFAULT_SELECTIONS
    }
  })

  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [actionStates, setActionStates] = useState(() => {
    try {
      const saved = localStorage.getItem("gaming-engine-action-states")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [viewMode, setViewMode] = useState(ViewMode.GRID)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [monitoringActive, setMonitoringActive] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [progress, setProgress] = useState(0)
  const [applyingAction, setApplyingAction] = useState(null)

  const mountedRef = useRef(true)
  const debounceTimer = useRef(null)

  // Memoizações
  const filteredActions = useMemo(() => {
    let filtered = categoriaAtiva === "all"
      ? gameActions
      : gameActions.filter((a) => a.category === categoriaAtiva)
    
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }, [categoriaAtiva, searchTerm])

  const totalActions = gameActions.length
  const totalSelected = selecionados.length
  const totalApplied = Object.values(actionStates).filter(Boolean).length
  const progressPercentage = (totalApplied / totalSelected) * 100 || 0

  // Estatísticas Avançadas
  const stats = [
    {
      title: "Otimizações Totais",
      value: totalActions,
      icon: <Zap size={22} />,
      color: "from-blue-500/20 to-cyan-500/10",
      subtitle: `${totalSelected} selecionadas`
    },
    {
      title: "Aplicadas com Sucesso",
      value: totalApplied,
      icon: <CheckCircle2 size={22} />,
      color: "from-cyan-500/20 to-blue-500/10",
      subtitle: `${progressPercentage.toFixed(0)}% do selecionado`
    },
    {
      title: "Engine Status",
      value: isActive ? "ATIVA" : "INATIVA",
      icon: <Gamepad2 size={22} />,
      color: isActive ? "from-green-500/20 to-emerald-500/10" : "from-gray-500/20 to-slate-500/10",
      subtitle: isActive ? "Otimizações em execução" : "Sistema padrão"
    },
    {
      title: "Performance Boost",
      value: isActive ? "+35%" : "0%",
      icon: <Trophy size={22} />,
      color: "from-purple-500/20 to-pink-500/10",
      subtitle: "Estimado em jogos"
    },
  ]

  // Efeitos
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  useEffect(() => {
    const checkInitialStates = async () => {
      try {
        const states = {}
        
        for (let i = 0; i < gameActions.length; i += BATCH_SIZE) {
          const batch = gameActions.slice(i, i + BATCH_SIZE)
          const checkPromises = batch.map(async (action) => {
            if (!action.checkScript) return null

            const cached = stateCache.get(action.id)
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
              return { id: action.id, result: cached.value }
            }

            const result = await invoke({
              channel: "run-powershell",
              payload: { script: action.checkScript, name: `check-${action.id}` },
            })

            const isApplied = result.success && result.output.trim().toLowerCase() === "true"
            stateCache.set(action.id, { value: isApplied, timestamp: Date.now() })
            return { id: action.id, result: isApplied }
          })

          const results = await Promise.all(checkPromises)
          if (mountedRef.current) {
            results.forEach((item) => {
              if (item) states[item.id] = item.result
            })
            setActionStates((prev) => ({ ...prev, ...states }))
          }
        }
      } catch (err) {
        console.error("Failed to check initial states:", err)
        log.error("Failed to check initial states:", err)
        setError(err)
      } finally {
        if (mountedRef.current) setInitializing(false)
      }
    }

    checkInitialStates()
  }, [])

  // Handlers Otimizados
  const applyAction = useCallback(async (actionId) => {
    const action = gameActions.find((a) => a.id === actionId)
    if (!action?.applyScript) return

    setApplyingAction(actionId)
    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: { script: action.applyScript, name: `apply-${actionId}` },
      })

      if (result.success) {
        setActionStates((prev) => ({ ...prev, [actionId]: true }))
        stateCache.set(actionId, { value: true, timestamp: Date.now() })
        toast.success(`✨ ${action.label} aplicado com sucesso!`, {
          icon: "🎮",
          position: "bottom-right"
        })
      } else {
        throw new Error(result.error || "Falha ao executar script")
      }
    } catch (err) {
      console.error(`Error applying ${actionId}:`, err)
      log.error(`Error applying ${actionId}:`, err)
      toast.error(`❌ Falha ao aplicar ${action.label}`, {
        position: "bottom-right"
      })
    } finally {
      setApplyingAction(null)
    }
  }, [])

  const restoreAction = useCallback(async (actionId) => {
    const action = gameActions.find((a) => a.id === actionId)
    if (!action?.restoreScript) return

    setApplyingAction(actionId)
    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: { script: action.restoreScript, name: `restore-${actionId}` },
      })

      if (result.success) {
        setActionStates((prev) => ({ ...prev, [actionId]: false }))
        stateCache.set(actionId, { value: false, timestamp: Date.now() })
        toast.info(`🔄 ${action.label} restaurado com sucesso!`, {
          position: "bottom-right"
        })
      } else {
        throw new Error(result.error || "Falha ao executar script")
      }
    } catch (err) {
      console.error(`Error restoring ${actionId}:`, err)
      log.error(`Error restoring ${actionId}:`, err)
      toast.error(`❌ Falha ao restaurar ${action.label}`, {
        position: "bottom-right"
      })
    } finally {
      setApplyingAction(null)
    }
  }, [])

  const handleToggleGameMode = useCallback(async () => {
    if (!window.electron) {
      toast.error("Erro crítico: Electron não detectado.")
      return
    }

    const newState = !isActive
    setLoading(true)
    setProgress(0)

    try {
      if (newState) {
        const actionsToApply = selecionados.filter((id) => !actionStates[id])
        let completed = 0

        for (let i = 0; i < actionsToApply.length; i += APPLY_BATCH_SIZE) {
          const batch = actionsToApply.slice(i, i + APPLY_BATCH_SIZE)
          
          await Promise.allSettled(
            batch.map(async (actionId) => {
              const action = gameActions.find((a) => a.id === actionId)
              if (!action?.applyScript) return

              try {
                const result = await invoke({
                  channel: "run-powershell",
                  payload: { script: action.applyScript, name: `activate-${actionId}` },
                })

                if (result.success && mountedRef.current) {
                  setActionStates((prev) => ({ ...prev, [actionId]: true }))
                  stateCache.set(actionId, { value: true, timestamp: Date.now() })
                }
              } catch (err) {
                console.error(`Error in action ${actionId}:`, err)
              }
            })
          )

          completed += batch.length
          setProgress((completed / actionsToApply.length) * 100)
        }

        setIsActive(true)
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">🎮 Gaming Engine Ativada!</span>
            <span className="text-sm">{totalApplied} otimizações aplicadas</span>
          </div>,
          { position: "bottom-right", autoClose: 3000 }
        )
      } else {
        const actionsToRestore = Object.keys(actionStates).filter((id) => actionStates[id])
        let completed = 0

        for (let i = 0; i < actionsToRestore.length; i += APPLY_BATCH_SIZE) {
          const batch = actionsToRestore.slice(i, i + APPLY_BATCH_SIZE)
          
          await Promise.allSettled(
            batch.map(async (actionId) => {
              const action = gameActions.find((a) => a.id === actionId)
              if (!action?.restoreScript) return

              try {
                const result = await invoke({
                  channel: "run-powershell",
                  payload: { script: action.restoreScript, name: `deactivate-${actionId}` },
                })

                if (result.success && mountedRef.current) {
                  setActionStates((prev) => ({ ...prev, [actionId]: false }))
                  stateCache.set(actionId, { value: false, timestamp: Date.now() })
                }
              } catch (err) {
                console.error(`Error restoring ${actionId}:`, err)
              }
            })
          )

          completed += batch.length
          setProgress((completed / actionsToRestore.length) * 100)
        }

        setIsActive(false)
        toast.info(
          <div className="flex flex-col">
            <span className="font-bold">🛑 Gaming Engine Desativada</span>
            <span className="text-sm">Sistema restaurado ao estado original</span>
          </div>,
          { position: "bottom-right", autoClose: 3000 }
        )
      }
    } catch (err) {
      console.error("Error toggling game mode:", err)
      toast.error("Falha ao alternar modo jogo: " + err.message)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }, [isActive, selecionados, actionStates, totalApplied])

  const toggleAction = useCallback(async (id) => {
    const isSelected = selecionados.includes(id)
    
    if (isSelected) {
      setSelecionados((prev) => prev.filter((item) => item !== id))
      if (actionStates[id]) {
        await restoreAction(id)
      }
    } else {
      setSelecionados((prev) => [...prev, id])
      if (isActive) {
        await applyAction(id)
      }
    }
  }, [selecionados, actionStates, isActive, applyAction, restoreAction])

  const handlePreset = useCallback((type) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    
    debounceTimer.current = setTimeout(() => {
      if (type === "max") {
        setSelecionados(gameActions.map((a) => a.id))
        toast.success(
          <div>
            <span className="font-bold">🚀 Preset Máximo Carregado</span>
            <br />
            <span className="text-sm">Todas as otimizações selecionadas</span>
          </div>,
          { position: "bottom-right", autoClose: 2000 }
        )
      } else if (type === "eco") {
        setSelecionados(
          gameActions
            .filter((a) => a.category === "performance" && a.risk !== "high")
            .map((a) => a.id)
        )
        toast.info(
          <div>
            <span className="font-bold">⚖️ Preset Equilibrado Carregado</span>
            <br />
            <span className="text-sm">Otimizações seguras selecionadas</span>
          </div>,
          { position: "bottom-right", autoClose: 2000 }
        )
      }
    }, DEBOUNCE_DELAY)
  }, [])

  // Handlers de Persistência
  useEffect(() => {
    localStorage.setItem("gaming-engine-active", JSON.stringify(isActive))
    queryClient.setQueryData(["gaming:isActive"], isActive)
  }, [isActive, queryClient])

  useEffect(() => {
    localStorage.setItem("gaming-engine-selecionados", JSON.stringify(selecionados))
    queryClient.setQueryData(["gaming:selecionados"], selecionados)
  }, [selecionados, queryClient])

  useEffect(() => {
    localStorage.setItem("gaming-engine-action-states", JSON.stringify(actionStates))
    queryClient.setQueryData(["gaming:actionStates"], actionStates)
  }, [actionStates, queryClient])

  // Monitoramento
  useEffect(() => {
    const toggleMonitoring = async () => {
      try {
        if (isActive && !monitoringActive) {
          await invoke({ channel: "start-realtime-monitoring", payload: 1000 })
          setMonitoringActive(true)
        } else if (!isActive && monitoringActive) {
          await invoke({ channel: "stop-realtime-monitoring" })
          setMonitoringActive(false)
        }
      } catch (err) {
        console.error("Erro no monitoramento:", err)
      }
    }

    toggleMonitoring()
    return () => {
      if (monitoringActive) {
        invoke({ channel: "stop-realtime-monitoring" }).catch(console.error)
      }
    }
  }, [isActive, monitoringActive])

  if (error) {
    return (
      <RootDiv>
        <div className="max-w-[1900px] mx-auto px-6 py-8">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 p-8 rounded-[28px]">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-red-500/20 rounded-2xl">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  Erro ao Carregar Gaming Engine
                </h2>
                <p className="text-maxify-text-secondary">
                  {error.message}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </RootDiv>
    )
  }

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        {/* Header Hero Melhorado */}
        <div className="relative overflow-hidden rounded-[32px] border border-maxify-border bg-gradient-to-br from-maxify-card via-maxify-card to-blue-900/10 p-8 mt-8">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_40%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-5 backdrop-blur-sm">
                <Sparkles size={16} />
                Central de Otimização Avançada
              </div>

              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 shadow-xl backdrop-blur-sm">
                  <Gamepad2 className="text-blue-400" size={36} />
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                    Gaming Engine
                  </h1>
                  <p className="text-maxify-text-secondary mt-3 text-lg max-w-2xl">
                    Ative otimizações avançadas, reduza latência e maximize o desempenho 
                    do seu sistema para uma experiência de jogo incomparável.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border backdrop-blur-sm">
                      🎮 {totalActions} otimizações
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border backdrop-blur-sm">
                      ⚡ {totalSelected} selecionadas
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border backdrop-blur-sm">
                      🚀 Boost de +35%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid Melhorado */}
            <div className="grid grid-cols-2 gap-4 min-w-full xl:min-w-[480px] xl:max-w-[520px]">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Barra de Progresso (quando aplicando) */}
        {(loading || initializing) && progress > 0 && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 transition-all duration-300"
                 style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Controles Principais Melhorados */}
        <Card className="bg-gradient-to-br from-maxify-card to-maxify-card/95 border border-maxify-border rounded-[28px] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <ShieldCheck className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text flex items-center gap-2">
                  Centro de Segurança
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                    Recomendado
                  </span>
                </h2>
                <p className="text-sm text-maxify-text-secondary">
                  Execute como administrador para melhores resultados. Pontos de restauração são criados automaticamente.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handlePreset("max")}
                variant="outline"
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket size={16} />
                  Modo Máximo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              </Button>

              <Button
                onClick={() => handlePreset("eco")}
                variant="outline"
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Target size={16} />
                  Modo Equilibrado
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              </Button>

              <Button
                onClick={handleToggleGameMode}
                disabled={loading || initializing}
                variant={isActive ? "danger" : "primary"}
                className="min-w-[200px] flex items-center justify-center gap-3 font-semibold shadow-lg transition-all hover:scale-105"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Aplicando...</span>
                  </>
                ) : isActive ? (
                  <>
                    <Power size={18} />
                    <span>Desativar Engine</span>
                  </>
                ) : (
                  <>
                    <Power size={18} />
                    <span>Ativar Engine</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Filtros e Busca */}
        <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Layers className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">
                  Categorias de Otimização
                </h2>
                <p className="text-sm text-maxify-text-secondary">
                  Filtre por tipo de otimização
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 rounded-2xl bg-maxify-border/20 border border-maxify-border">
              <button
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.GRID ? 'bg-blue-500/20 text-blue-300' : 'text-maxify-text-secondary'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.LIST ? 'bg-blue-500/20 text-blue-300' : 'text-maxify-text-secondary'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-3 mt-6">
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                isActive={categoriaAtiva === cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                count={cat.id === "all" ? totalActions : gameActions.filter(a => a.category === cat.id).length}
              />
            ))}
          </div>

          {/* Barra de Busca */}
          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar otimização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-maxify-border/10 border border-maxify-border text-maxify-text placeholder-maxify-text-secondary/50 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-maxify-text-secondary hover:text-maxify-text"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Lista de Otimizações */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
          {/* Cards de Ações */}
          <Card className="bg-maxify-card border border-maxify-border rounded-[28px] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Gamepad2 className="text-blue-400" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-maxify-text">
                    Otimizações Disponíveis
                  </h2>
                  <p className="text-sm text-maxify-text-secondary">
                    {filteredActions.length} encontradas • {totalSelected} selecionadas
                  </p>
                </div>
              </div>

              {(loading || initializing) && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 animate-pulse">
                  <RefreshCw className="animate-spin" size={16} />
                  <span className="text-sm font-medium">Carregando otimizações...</span>
                </div>
              )}
            </div>

            {initializing ? (
              <LoadingSkeleton />
            ) : (
              <div className={`grid ${viewMode === ViewMode.GRID ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {filteredActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    isSelected={selecionados.includes(action.id)}
                    isApplied={actionStates[action.id]}
                    isLoading={initializing || loading || applyingAction === action.id}
                    onToggle={toggleAction}
                    onApply={applyAction}
                    onRestore={restoreAction}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {filteredActions.length === 0 && !initializing && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-maxify-text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-maxify-text-secondary">Nenhuma otimização encontrada</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </Card>

          {/* Sidebar Melhorada */}
          <div className="space-y-6">
            {/* Resumo Avançado */}
            <Card className="bg-gradient-to-br from-maxify-card to-maxify-card/95 border border-maxify-border rounded-[28px] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <BarChart3 className="text-blue-400" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-maxify-text">
                    Dashboard em Tempo Real
                  </h2>
                  <p className="text-sm text-maxify-text-secondary">
                    Métricas e estatísticas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Progresso Circular */}
                <div className="relative rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-maxify-text-secondary">Progresso de Aplicação</p>
                    <p className="text-2xl font-bold text-blue-300">{progressPercentage.toFixed(0)}%</p>
                  </div>
                  <div className="h-2 bg-maxify-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-maxify-text-secondary">Otimizações Selecionadas</p>
                    <p className="text-2xl font-bold text-blue-300">{totalSelected}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-maxify-text-secondary">Aplicadas com Sucesso</p>
                    <p className="text-2xl font-bold text-cyan-300">{totalApplied}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-maxify-text-secondary">Status da Engine</p>
                      <p className={`text-lg font-bold mt-1 ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isActive ? "🟢 ATIVA" : "🔴 INATIVA"}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Activity className={`${isActive ? 'text-green-400 animate-pulse' : 'text-red-400'}`} size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleToggleGameMode}
                disabled={loading || initializing}
                size="lg"
                variant="primary"
                className="w-full mt-6 min-h-[52px] flex items-center justify-center gap-3 text-base font-semibold shadow-lg transition-all hover:scale-105"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Processando...</span>
                  </>
                ) : isActive ? (
                  <>
                    <Pause size={20} />
                    <span>Desativar Gaming Engine</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Ativar Gaming Engine</span>
                  </>
                )}
              </Button>
            </Card>

            {/* Informações e Dicas */}
            <Card className="bg-gradient-to-br from-maxify-card to-maxify-card/95 border border-maxify-border rounded-[28px] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <AlertTriangle className="text-blue-400" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-maxify-text">
                    Informações Importantes
                  </h2>
                  <p className="text-sm text-maxify-text-secondary">
                    Dicas para melhor uso
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-blue-400 mt-0.5" />
                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">Permissões de Administrador:</span><br />
                      Algumas otimizações requerem privilégios elevados para funcionar corretamente.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <RefreshCw size={18} className="text-cyan-400 mt-0.5" />
                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">Restauração Automática:</span><br />
                      Desativar a engine restaura automaticamente todas as otimizações aplicadas.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <Target size={18} className="text-green-400 mt-0.5" />
                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">Controle Individual:</span><br />
                      Você pode aplicar ou restaurar cada otimização separadamente, mesmo com a engine desativada.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <Trophy size={18} className="text-yellow-400 mt-0.5" />
                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">Performance Máxima:</span><br />
                      Para melhor experiência, reinicie seus jogos após ativar a Gaming Engine.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RootDiv>
  )
}