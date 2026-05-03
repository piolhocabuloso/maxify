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
  ShieldCheck,
  Activity,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Trophy,
  Target,
  Layers,
  LayoutGrid,
  List,
  Search,
} from "lucide-react"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import log from "electron-log/renderer"
import { useQueryClient } from "@tanstack/react-query"
import { gameActions, categories, GAME_ENGINE_CONFIG } from "@/data/gameActions"

const CACHE_TTL = 30000
const BATCH_SIZE = 3
const APPLY_BATCH_SIZE = 5
const DEBOUNCE_DELAY = 300

const PAGE_CACHE_KEY = "maxify:gaming-engine-page-cache"
const PAGE_QUERY_KEY = ["gaming:page-cache"]

const stateCache = new Map()

const ViewMode = {
  GRID: "grid",
  LIST: "list",
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function loadPageCache() {
  try {
    return safeParse(localStorage.getItem(PAGE_CACHE_KEY), null)
  } catch {
    return null
  }
}

function savePageCache(data) {
  try {
    localStorage.setItem(PAGE_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function getCachedValue(cache, key, fallback) {
  if (cache && Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key]
  }

  return fallback
}

const LoadingSkeleton = memo(() => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20"></div>

            <div className="flex-1">
              <div className="mb-2 h-5 w-1/3 rounded-lg bg-blue-500/20"></div>
              <div className="mb-3 h-4 w-2/3 rounded-lg bg-blue-500/20"></div>

              <div className="flex gap-2">
                <div className="h-8 w-24 rounded-xl bg-blue-500/20"></div>
                <div className="h-8 w-24 rounded-xl bg-blue-500/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

const StatCard = memo(({ icon, title, value, color, subtitle, trend }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border border-maxify-border bg-gradient-to-br ${color} p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl`}
  >
    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-white/5 to-transparent"></div>

    <div className="relative z-10">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-blue-300">{icon}</span>

        {trend && (
          <span
            className={`text-xs font-medium ${
              trend > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      <p className="mb-1 text-3xl font-bold text-white md:text-4xl">
        {value}
      </p>

      <p className="text-sm text-maxify-text-secondary">{title}</p>

      {subtitle && (
        <p className="mt-2 text-xs text-maxify-text-secondary/60">
          {subtitle}
        </p>
      )}
    </div>
  </div>
))

StatCard.displayName = "StatCard"

const CategoryButton = memo(({ category, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-2 overflow-hidden rounded-2xl border px-5 py-3 text-sm font-medium transition-all ${
      isActive
        ? "border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 shadow-lg shadow-blue-500/10"
        : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary hover:scale-105 hover:bg-maxify-border/35"
    }`}
  >
    <span className="relative z-10 flex items-center gap-2">
      {category.icon}
      {category.label}

      {count > 0 && (
        <span className="ml-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
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

const ActionCard = memo(
  ({
    action,
    isSelected,
    isApplied,
    isLoading,
    onToggle,
    onApply,
    onRestore,
    viewMode,
  }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative rounded-2xl border transition-all duration-300 ${
          viewMode === ViewMode.GRID ? "p-5" : "p-4"
        } ${
          isSelected
            ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg shadow-blue-500/10"
            : "border-maxify-border bg-maxify-border/5 hover:border-blue-400/40 hover:bg-maxify-border/10"
        } ${isLoading ? "opacity-80" : ""} ${
          isHovered ? "-translate-y-1 transform" : ""
        }`}
      >
        {action.badge && (
          <div className="absolute -right-2 -top-2 z-10">
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
              {action.badge}
            </div>
          </div>
        )}

        <div
          className={`flex ${
            viewMode === ViewMode.GRID
              ? "flex-col"
              : "items-start justify-between"
          } gap-4`}
        >
          <div
            className={`flex ${
              viewMode === ViewMode.GRID ? "flex-col" : "flex-row"
            } min-w-0 flex-1 items-start gap-3`}
          >
            <div
              className={`mt-0.5 rounded-xl p-3 transition-all duration-300 ${
                isApplied
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20"
                  : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
              } ${isHovered ? "scale-110" : ""}`}
            >
              {action.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-maxify-text">
                  {action.label}
                </span>

                {isApplied && (
                  <span className="rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                    ✓ Aplicado
                  </span>
                )}

                {action.risk && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      action.risk === "low"
                        ? "bg-green-500/20 text-green-300"
                        : action.risk === "medium"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {action.risk === "low"
                      ? "🟢 Baixo risco"
                      : action.risk === "medium"
                        ? "🟡 Médio risco"
                        : "🔴 Alto risco"}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-maxify-text-secondary">
                {action.description}
              </p>

              <div
                className={`mt-4 flex flex-wrap gap-2 ${
                  viewMode === ViewMode.GRID ? "justify-start" : ""
                }`}
              >
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
                  className="flex items-center gap-2 border-red-500/30 text-red-400 transition-all hover:scale-105 hover:bg-red-500/10"
                >
                  <RefreshCw size={14} />
                  Restaurar
                </Button>
              </div>
            </div>
          </div>

          <div
            className={`${
              viewMode === ViewMode.GRID ? "flex justify-end" : "shrink-0"
            }`}
          >
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
  }
)

ActionCard.displayName = "ActionCard"

export default function ModoJogo() {
  const queryClient = useQueryClient()

  const cachedPage = useMemo(() => {
    return queryClient.getQueryData(PAGE_QUERY_KEY) || loadPageCache()
  }, [queryClient])

  const [isActive, setIsActive] = useState(() =>
    getCachedValue(cachedPage, "isActive", false)
  )

  const [selecionados, setSelecionados] = useState(() =>
    getCachedValue(
      cachedPage,
      "selecionados",
      GAME_ENGINE_CONFIG.DEFAULT_SELECTIONS
    )
  )

  const [categoriaAtiva, setCategoriaAtiva] = useState(() =>
    getCachedValue(cachedPage, "categoriaAtiva", "all")
  )

  const [actionStates, setActionStates] = useState(() =>
    getCachedValue(cachedPage, "actionStates", {})
  )

  const [viewMode, setViewMode] = useState(() =>
    getCachedValue(cachedPage, "viewMode", ViewMode.GRID)
  )

  const [searchTerm, setSearchTerm] = useState(() =>
    getCachedValue(cachedPage, "searchTerm", "")
  )

  const [loading, setLoading] = useState(false)

  const [initializing, setInitializing] = useState(() => {
    const cachedStates = getCachedValue(cachedPage, "actionStates", null)
    return !cachedStates || Object.keys(cachedStates).length === 0
  })

  const [monitoringActive, setMonitoringActive] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [applyingAction, setApplyingAction] = useState(null)

  const mountedRef = useRef(true)
  const debounceTimer = useRef(null)

  const filteredActions = useMemo(() => {
    let filtered =
      categoriaAtiva === "all"
        ? gameActions
        : gameActions.filter((a) => a.category === categoriaAtiva)

    if (searchTerm) {
      filtered = filtered.filter(
        (action) =>
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

  const stats = [
    {
      title: "Otimizações Totais",
      value: totalActions,
      icon: <Zap size={22} />,
      color: "from-blue-500/20 to-cyan-500/10",
      subtitle: `${totalSelected} selecionadas`,
    },
    {
      title: "Aplicadas com Sucesso",
      value: totalApplied,
      icon: <CheckCircle2 size={22} />,
      color: "from-cyan-500/20 to-blue-500/10",
      subtitle: `${progressPercentage.toFixed(0)}% do selecionado`,
    },
    {
      title: "Engine Status",
      value: isActive ? "ATIVA" : "INATIVA",
      icon: <Gamepad2 size={22} />,
      color: isActive
        ? "from-green-500/20 to-emerald-500/10"
        : "from-gray-500/20 to-slate-500/10",
      subtitle: isActive ? "Otimizações em execução" : "Sistema padrão",
    },
    {
      title: "Performance Boost",
      value: isActive ? "+35%" : "0%",
      icon: <Trophy size={22} />,
      color: "from-purple-500/20 to-pink-500/10",
      subtitle: "Estimado em jogos",
    },
  ]

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const pageData = {
      isActive,
      selecionados,
      categoriaAtiva,
      actionStates,
      viewMode,
      searchTerm,
      savedAt: Date.now(),
    }

    savePageCache(pageData)
    queryClient.setQueryData(PAGE_QUERY_KEY, pageData)
    queryClient.setQueryData(["gaming:isActive"], isActive)
    queryClient.setQueryData(["gaming:selecionados"], selecionados)
    queryClient.setQueryData(["gaming:actionStates"], actionStates)
    queryClient.setQueryData(["gaming:categoriaAtiva"], categoriaAtiva)
    queryClient.setQueryData(["gaming:viewMode"], viewMode)
    queryClient.setQueryData(["gaming:searchTerm"], searchTerm)

    localStorage.setItem("gaming-engine-active", JSON.stringify(isActive))
    localStorage.setItem("gaming-engine-selecionados", JSON.stringify(selecionados))
    localStorage.setItem("gaming-engine-action-states", JSON.stringify(actionStates))
  }, [
    isActive,
    selecionados,
    categoriaAtiva,
    actionStates,
    viewMode,
    searchTerm,
    queryClient,
  ])

  useEffect(() => {
    const checkInitialStates = async () => {
      try {
        if (cachedPage?.actionStates && Object.keys(cachedPage.actionStates).length > 0) {
          setInitializing(false)
        }

        const states = {}

        for (let i = 0; i < gameActions.length; i += BATCH_SIZE) {
          const batch = gameActions.slice(i, i + BATCH_SIZE)

          const checkPromises = batch.map(async (action) => {
            if (!action.checkScript) return null

            const cached = stateCache.get(action.id)

            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
              return {
                id: action.id,
                result: cached.value,
              }
            }

            const result = await invoke({
              channel: "run-powershell",
              payload: {
                script: action.checkScript,
                name: `check-${action.id}`,
              },
            })

            const isApplied =
              result.success &&
              result.output.trim().toLowerCase() === "true"

            stateCache.set(action.id, {
              value: isApplied,
              timestamp: Date.now(),
            })

            return {
              id: action.id,
              result: isApplied,
            }
          })

          const results = await Promise.all(checkPromises)

          if (mountedRef.current) {
            results.forEach((item) => {
              if (item) {
                states[item.id] = item.result
              }
            })

            setActionStates((prev) => ({
              ...prev,
              ...states,
            }))
          }
        }
      } catch (err) {
        console.error("Failed to check initial states:", err)
        log.error("Failed to check initial states:", err)

        if (!cachedPage) {
          setError(err)
        }
      } finally {
        if (mountedRef.current) {
          setInitializing(false)
        }
      }
    }

    checkInitialStates()
  }, [cachedPage])

  const applyAction = useCallback(async (actionId) => {
    const action = gameActions.find((a) => a.id === actionId)
    if (!action?.applyScript) return

    setApplyingAction(actionId)

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: action.applyScript,
          name: `apply-${actionId}`,
        },
      })

      if (result.success) {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: true,
        }))

        stateCache.set(actionId, {
          value: true,
          timestamp: Date.now(),
        })

        toast.success(`✨ ${action.label} aplicado com sucesso!`, {
          position: "bottom-right",
        })
      } else {
        throw new Error(result.error || "Falha ao executar script")
      }
    } catch (err) {
      console.error(`Error applying ${actionId}:`, err)
      log.error(`Error applying ${actionId}:`, err)

      toast.error(`Falha ao aplicar ${action.label}`, {
        position: "bottom-right",
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
        payload: {
          script: action.restoreScript,
          name: `restore-${actionId}`,
        },
      })

      if (result.success) {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: false,
        }))

        stateCache.set(actionId, {
          value: false,
          timestamp: Date.now(),
        })

        toast.info(`${action.label} restaurado com sucesso!`, {
          position: "bottom-right",
        })
      } else {
        throw new Error(result.error || "Falha ao executar script")
      }
    } catch (err) {
      console.error(`Error restoring ${actionId}:`, err)
      log.error(`Error restoring ${actionId}:`, err)

      toast.error(`Falha ao restaurar ${action.label}`, {
        position: "bottom-right",
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
                  payload: {
                    script: action.applyScript,
                    name: `activate-${actionId}`,
                  },
                })

                if (result.success && mountedRef.current) {
                  setActionStates((prev) => ({
                    ...prev,
                    [actionId]: true,
                  }))

                  stateCache.set(actionId, {
                    value: true,
                    timestamp: Date.now(),
                  })
                }
              } catch (err) {
                console.error(`Error in action ${actionId}:`, err)
              }
            })
          )

          completed += batch.length

          setProgress(
            actionsToApply.length > 0
              ? (completed / actionsToApply.length) * 100
              : 100
          )
        }

        setIsActive(true)

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Gaming Engine Ativada!</span>
            <span className="text-sm">Otimizações aplicadas</span>
          </div>,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        )
      } else {
        const actionsToRestore = Object.keys(actionStates).filter(
          (id) => actionStates[id]
        )

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
                  payload: {
                    script: action.restoreScript,
                    name: `deactivate-${actionId}`,
                  },
                })

                if (result.success && mountedRef.current) {
                  setActionStates((prev) => ({
                    ...prev,
                    [actionId]: false,
                  }))

                  stateCache.set(actionId, {
                    value: false,
                    timestamp: Date.now(),
                  })
                }
              } catch (err) {
                console.error(`Error restoring ${actionId}:`, err)
              }
            })
          )

          completed += batch.length

          setProgress(
            actionsToRestore.length > 0
              ? (completed / actionsToRestore.length) * 100
              : 100
          )
        }

        setIsActive(false)

        toast.info(
          <div className="flex flex-col">
            <span className="font-bold">Gaming Engine Desativada</span>
            <span className="text-sm">Sistema restaurado ao estado original</span>
          </div>,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        )
      }
    } catch (err) {
      console.error("Error toggling game mode:", err)
      toast.error("Falha ao alternar modo jogo: " + err.message)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }, [isActive, selecionados, actionStates])

  const toggleAction = useCallback(
    async (id) => {
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
    },
    [selecionados, actionStates, isActive, applyAction, restoreAction]
  )

  const handlePreset = useCallback((type) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      if (type === "max") {
        setSelecionados(gameActions.map((a) => a.id))

        toast.success(
          <div>
            <span className="font-bold">Preset Máximo Carregado</span>
            <br />
            <span className="text-sm">Todas as otimizações selecionadas</span>
          </div>,
          {
            position: "bottom-right",
            autoClose: 2000,
          }
        )
      } else if (type === "eco") {
        setSelecionados(
          gameActions
            .filter((a) => a.category === "performance" && a.risk !== "high")
            .map((a) => a.id)
        )

        toast.info(
          <div>
            <span className="font-bold">Preset Equilibrado Carregado</span>
            <br />
            <span className="text-sm">Otimizações seguras selecionadas</span>
          </div>,
          {
            position: "bottom-right",
            autoClose: 2000,
          }
        )
      }
    }, DEBOUNCE_DELAY)
  }, [])

  useEffect(() => {
    const toggleMonitoring = async () => {
      try {
        if (isActive && !monitoringActive) {
          await invoke({
            channel: "start-realtime-monitoring",
            payload: 1000,
          })

          setMonitoringActive(true)
        } else if (!isActive && monitoringActive) {
          await invoke({
            channel: "stop-realtime-monitoring",
          })

          setMonitoringActive(false)
        }
      } catch (err) {
        console.error("Erro no monitoramento:", err)
      }
    }

    toggleMonitoring()

    return () => {
      if (monitoringActive) {
        invoke({
          channel: "stop-realtime-monitoring",
        }).catch(console.error)
      }
    }
  }, [isActive, monitoringActive])

  if (error) {
    return (
      <RootDiv>
        <div className="mx-auto max-w-[1900px] px-6 py-8">
          <Card className="rounded-[28px] border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 p-8">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-red-500/20 p-4">
                <AlertTriangle className="text-red-500" size={40} />
              </div>

              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-red-400">
                  Erro ao Carregar Gaming Engine
                </h2>

                <p className="text-maxify-text-secondary">{error.message}</p>

                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-500/20 text-red-400 hover:bg-red-500/30"
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
      <div className="mx-auto max-w-[1900px] space-y-8 px-6 pb-16">
        <div className="relative mt-8 overflow-hidden rounded-[32px] border border-maxify-border bg-gradient-to-br from-maxify-card via-maxify-card to-blue-900/10 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_40%)]" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm">
                <Sparkles size={16} />
                Central de Otimização Avançada
              </div>

              <div className="flex items-start gap-5">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 shadow-xl backdrop-blur-sm">
                  <Gamepad2 className="text-blue-400" size={36} />
                </div>

                <div>
                  <h1 className="bg-gradient-to-r from-white via-blue-300 to-cyan-300 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                    Gaming Engine
                  </h1>

                  <p className="mt-3 max-w-2xl text-lg text-maxify-text-secondary">
                    Ative otimizações avançadas, reduza latência e maximize o desempenho
                    do seu sistema para uma experiência de jogo incomparável.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary backdrop-blur-sm">
                      {totalActions} otimizações
                    </div>

                    <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary backdrop-blur-sm">
                      {totalSelected} selecionadas
                    </div>

                    <div className="rounded-xl border border-maxify-border bg-maxify-border/20 px-4 py-2 text-sm text-maxify-text-secondary backdrop-blur-sm">
                      Boost de +35%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-full grid-cols-2 gap-4 xl:min-w-[480px] xl:max-w-[520px]">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {(loading || initializing) && progress > 0 && (
          <div className="fixed left-0 right-0 top-0 z-50">
            <div
              className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        )}

        <Card className="rounded-[28px] border border-maxify-border bg-gradient-to-br from-maxify-card to-maxify-card/95 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
                <ShieldCheck className="text-blue-400" size={24} />
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-maxify-text">
                  Centro de Segurança
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-300">
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

                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 transition-transform duration-500 group-hover:translate-x-full"></div>
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

                <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 transition-transform duration-500 group-hover:translate-x-full"></div>
              </Button>

              <Button
                onClick={handleToggleGameMode}
                disabled={loading || initializing}
                variant={isActive ? "danger" : "primary"}
                className="flex min-w-[200px] items-center justify-center gap-3 font-semibold shadow-lg transition-all hover:scale-105"
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

        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
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

            <div className="flex gap-2 rounded-2xl border border-maxify-border bg-maxify-border/20 p-1">
              <button
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`rounded-xl p-2 transition-all ${
                  viewMode === ViewMode.GRID
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-maxify-text-secondary"
                }`}
              >
                <LayoutGrid size={18} />
              </button>

              <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`rounded-xl p-2 transition-all ${
                  viewMode === ViewMode.LIST
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-maxify-text-secondary"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                isActive={categoriaAtiva === cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                count={
                  cat.id === "all"
                    ? totalActions
                    : gameActions.filter((a) => a.category === cat.id).length
                }
              />
            ))}
          </div>

          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar otimização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-maxify-border bg-maxify-border/10 px-5 py-3 text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary/50 focus:border-blue-500/50"
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
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
                <div className="flex animate-pulse items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-blue-300">
                  <RefreshCw className="animate-spin" size={16} />
                  <span className="text-sm font-medium">
                    Carregando otimizações...
                  </span>
                </div>
              )}
            </div>

            {initializing ? (
              <LoadingSkeleton />
            ) : (
              <div
                className={`grid ${
                  viewMode === ViewMode.GRID
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                } gap-4`}
              >
                {filteredActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    isSelected={selecionados.includes(action.id)}
                    isApplied={actionStates[action.id]}
                    isLoading={
                      initializing || loading || applyingAction === action.id
                    }
                    onToggle={toggleAction}
                    onApply={applyAction}
                    onRestore={restoreAction}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {filteredActions.length === 0 && !initializing && (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-maxify-text-secondary opacity-50" />

                <p className="text-maxify-text-secondary">
                  Nenhuma otimização encontrada
                </p>

                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[28px] border border-maxify-border bg-gradient-to-br from-maxify-card to-maxify-card/95 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
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
                <div className="relative rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-maxify-text-secondary">
                      Progresso de Aplicação
                    </p>

                    <p className="text-2xl font-bold text-blue-300">
                      {progressPercentage.toFixed(0)}%
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-maxify-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-maxify-text-secondary">
                      Otimizações Selecionadas
                    </p>

                    <p className="text-2xl font-bold text-blue-300">
                      {totalSelected}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-maxify-text-secondary">
                      Aplicadas com Sucesso
                    </p>

                    <p className="text-2xl font-bold text-cyan-300">
                      {totalApplied}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-maxify-text-secondary">
                        Status da Engine
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${
                          isActive ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isActive ? "🟢 ATIVA" : "🔴 INATIVA"}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <Activity
                        className={`${
                          isActive
                            ? "animate-pulse text-green-400"
                            : "text-red-400"
                        }`}
                        size={24}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleToggleGameMode}
                disabled={loading || initializing}
                size="lg"
                variant="primary"
                className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-3 text-base font-semibold shadow-lg transition-all hover:scale-105"
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

            <Card className="rounded-[28px] border border-maxify-border bg-gradient-to-br from-maxify-card to-maxify-card/95 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
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
                <div className="group rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 transition-all hover:border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="mt-0.5 text-blue-400" />

                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">
                        Permissões de Administrador:
                      </span>
                      <br />
                      Algumas otimizações requerem privilégios elevados para funcionar corretamente.
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 transition-all hover:border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <RefreshCw size={18} className="mt-0.5 text-cyan-400" />

                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">
                        Restauração Automática:
                      </span>
                      <br />
                      Desativar a engine restaura automaticamente todas as otimizações aplicadas.
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 transition-all hover:border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Target size={18} className="mt-0.5 text-green-400" />

                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">
                        Controle Individual:
                      </span>
                      <br />
                      Você pode aplicar ou restaurar cada otimização separadamente, mesmo com a engine desativada.
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 transition-all hover:border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Trophy size={18} className="mt-0.5 text-yellow-400" />

                    <p className="text-sm text-maxify-text-secondary">
                      <span className="font-semibold text-maxify-text">
                        Performance Máxima:
                      </span>
                      <br />
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