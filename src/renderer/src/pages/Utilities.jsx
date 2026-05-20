import RootDiv from "@/components/rootdiv"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import Toggle from "@/components/ui/toggle"
import {
  GpuIcon,
  HardDrive,
  Monitor,
  GlobeIcon,
  Zap,
  Computer,
  Volume2Icon,
  WifiIcon,
  RefreshCwIcon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Settings,
  Shield,
  Wrench,
  Activity,
  Cpu,
  Search,
  LayoutGrid,
  FolderOpen,
} from "lucide-react"
import React, { useState, useEffect, useMemo } from "react"
import { invoke } from "@/lib/electron"
import { notify as toast } from "../lib/notify"
import log from "electron-log/renderer"
import { Dropdown } from "@/components/ui/dropdown"

const utilityCategories = [
  {
    id: "all",
    label: "Todos",
    icon: LayoutGrid,
  },
  {
    id: "performance",
    label: "Performance",
    icon: Zap,
  },
  {
    id: "system",
    label: "Sistema",
    icon: Computer,
  },
  {
    id: "network",
    label: "Rede",
    icon: WifiIcon,
  },
  {
    id: "maintenance",
    label: "Manutenção",
    icon: Wrench,
  },
  {
    id: "settings",
    label: "Atalhos",
    icon: Settings,
  },
]

const utilities = [
  {
    name: "Limpeza de Disco",
    description: "Libere espaço removendo arquivos desnecessários.",
    state: true,
    icon: <HardDrive />,
    type: "button",
    category: "maintenance",
    badge: "Limpeza",
    buttonText: "Limpar agora",
    runScript: "maxify-premium://mx_2f58a535580ad39241cb",
  },
  {
    name: "Sensor de Armazenamento",
    description: "Libere espaço automaticamente eliminando arquivos que você não precisa.",
    state: true,
    icon: <Computer />,
    type: "toggle",
    category: "maintenance",
    badge: "Automático",
    checkScript: "maxify-premium://mx_ee6f6026ddddde950d55",
    applyScript: "maxify-premium://mx_0da027ae0aa283de563b",
  },
  {
    name: "Inicialização Rápida",
    description: "Melhore o tempo de inicialização otimizando as configurações de boot.",
    state: false,
    icon: <Zap />,
    type: "toggle",
    category: "performance",
    badge: "Boot",
    checkScript: "maxify-premium://mx_36397ee6aa28ccd4537f",
    applyScript: "maxify-premium://mx_17b3c808bca0fcdc670a",
    unapplyScript: `
$path = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power"
if (Test-Path $path) { Set-ItemProperty -Path $path -Name "HiberbootEnabled" -Type DWord -Value 0 }
`,
  },
  {
    name: "Atualizações do Windows",
    description: "Controle como o Windows lida com atualizações automáticas.",
    state: false,
    icon: <RefreshCwIcon />,
    type: "dropdown",
    category: "system",
    badge: "Windows",
    options: ["Default", "Manual", "Disabled"],
    checkScript: "maxify-premium://mx_3a608cc298c69a51a1fd",
    applyScript: {
      Default: `
Set-Service -Name wuauserv -StartupType Automatic
Start-Service -Name wuauserv -ErrorAction SilentlyContinue
Write-Output "Windows Update set to Default (Automatic)."
`,
      Manual: `
Set-Service -Name wuauserv -StartupType Manual
Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
Write-Output "Windows Update set to Manual."
`,
      Disabled: `
Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
Set-Service -Name wuauserv -StartupType Disabled
Write-Output "Windows Update service disabled."
`,
    },
  },
  {
    name: "Driver de Vídeo",
    description: "Reinicie o driver gráfico para corrigir problemas de exibição.",
    state: false,
    icon: <GpuIcon />,
    type: "button",
    category: "system",
    badge: "GPU",
    buttonText: "Reiniciar",
    runScript: "maxify-premium://mx_de50d50384a36f526f11",
  },
  {
    name: "Plano de Energia",
    description: "Escolha como o computador gerencia energia e desempenho.",
    state: false,
    icon: <Monitor />,
    type: "dropdown",
    category: "performance",
    badge: "Energia",
    options: ["Balanced", "High Performance", "Power Saver", "Ultimate Performance"],
    checkScript: "maxify-premium://mx_f4151fa0100b5652c87e",
    applyScript: {
      Balanced: `powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e`,
      "High Performance": `powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c`,
      "Power Saver": `powercfg /setactive a1841308-3541-4fab-bc81-f71556f20b4a`,
      "Ultimate Performance": `
$ultimatePlan = powercfg -l | Select-String "Ultimate Performance"

if (-not $ultimatePlan) {
    Write-Host "Ultimate Performance plan not found. Creating..."
    powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
} else {
    Write-Host "Ultimate Performance plan already exists."
}

$ultimatePlanGUID = (powercfg -l | Select-String "Ultimate Performance").ToString().Split()[3]

if ($ultimatePlanGUID) {
    powercfg -setactive $ultimatePlanGUID 2>$null
    Write-Host "Ultimate Performance power plan is now active."
} else {
    Write-Host "Failed to find Ultimate Performance plan GUID."
}
`,
    },
  },
  {
    name: "Limpar Cache DNS",
    description: "Corrija problemas de conexão limpando o cache do DNS.",
    state: false,
    icon: <GlobeIcon />,
    type: "button",
    category: "network",
    badge: "DNS",
    buttonText: "Liberar",
    runScript: "maxify-premium://mx_b3849dc39b42748e8b0e",
  },
  {
    name: "Reiniciar Serviço de Áudio",
    description: "Corrija problemas de som reiniciando o áudio do Windows.",
    state: false,
    icon: <Volume2Icon />,
    type: "button",
    category: "system",
    badge: "Áudio",
    buttonText: "Reiniciar",
    runScript: "maxify-premium://mx_6c1ca9155c048046b8d1",
  },
  {
    name: "Redefinir Rede",
    description: "Redefina a pilha de rede para corrigir problemas de conectividade.",
    state: false,
    icon: <WifiIcon />,
    type: "button",
    category: "network",
    badge: "Rede",
    buttonText: "Resetar",
    runScript: "maxify-premium://mx_9a81624381b9b4adf81d",
  },
  {
    name: "Reiniciar Explorer",
    description: "Reinicie a interface do Windows sem precisar reiniciar o PC.",
    state: false,
    icon: <RefreshCwIcon />,
    type: "button",
    category: "system",
    badge: "Explorer",
    buttonText: "Reiniciar",
    runScript: `
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Process explorer.exe
Write-Output "Explorer reiniciado com sucesso."
`,
  },
  {
    name: "Configurações de Vídeo",
    description: "Abra rapidamente as configurações de tela do Windows.",
    state: false,
    icon: <Monitor />,
    type: "button",
    category: "settings",
    badge: "Tela",
    buttonText: "Abrir",
    runScript: `
Start-Process "ms-settings:display"
Write-Output "Configurações de vídeo abertas."
`,
  },
  {
    name: "Configurações do Mouse",
    description: "Acesse as opções clássicas do mouse no Windows.",
    state: false,
    icon: <Settings />,
    type: "button",
    category: "settings",
    badge: "Mouse",
    buttonText: "Abrir",
    runScript: `
Start-Process "main.cpl"
Write-Output "Configurações do mouse abertas."
`,
  },
  {
    name: "Configurações de Rede",
    description: "Abra as configurações de internet e adaptadores de rede.",
    state: false,
    icon: <WifiIcon />,
    type: "button",
    category: "settings",
    badge: "Rede",
    buttonText: "Abrir",
    runScript: `
Start-Process "ms-settings:network"
Write-Output "Configurações de rede abertas."
`,
  },
  {
    name: "Sons do Windows",
    description: "Acesse rapidamente o painel clássico de áudio.",
    state: false,
    icon: <Volume2Icon />,
    type: "button",
    category: "settings",
    badge: "Áudio",
    buttonText: "Abrir",
    runScript: `
Start-Process "mmsys.cpl"
Write-Output "Painel de som aberto."
`,
  },
  {
    name: "Gerenciador de Dispositivos",
    description: "Abra o Gerenciador de Dispositivos para verificar drivers.",
    state: false,
    icon: <Computer />,
    type: "button",
    category: "settings",
    badge: "Drivers",
    buttonText: "Abrir",
    runScript: `
Start-Process "devmgmt.msc"
Write-Output "Gerenciador de Dispositivos aberto."
`,
  },
  {
    name: "Informações do Sistema",
    description: "Veja detalhes completos do hardware e do Windows.",
    state: false,
    icon: <Cpu />,
    type: "button",
    category: "settings",
    badge: "Hardware",
    buttonText: "Abrir",
    runScript: `
Start-Process "msinfo32.exe"
Write-Output "Informações do sistema abertas."
`,
  },
  {
    name: "Abrir Pasta Temp",
    description: "Abra a pasta temporária do usuário para análise manual.",
    state: false,
    icon: <FolderOpen />,
    type: "button",
    category: "maintenance",
    badge: "Temp",
    buttonText: "Abrir",
    runScript: `
Start-Process "$env:TEMP"
Write-Output "Pasta Temp aberta."
`,
  },
  {
    name: "Limpeza de Disco Clássica",
    description: "Abra a ferramenta clássica de limpeza de disco do Windows.",
    state: false,
    icon: <HardDrive />,
    type: "button",
    category: "maintenance",
    badge: "Windows",
    buttonText: "Abrir",
    runScript: `
Start-Process "cleanmgr.exe"
Write-Output "Limpeza de Disco aberta."
`,
  },
]

function StatCard({ title, value, icon, helper }) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
            {icon}
          </div>

          <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
          {title}
        </p>

        <h3 className="mt-1 text-3xl font-black text-maxify-text">
          {value}
        </h3>

        {helper && (
          <p className="mt-2 text-xs leading-5 text-maxify-text-secondary/80">
            {helper}
          </p>
        )}
      </div>
    </div>
  )
}

function CategoryButton({ item, active, count, onClick }) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all
        ${
          active
            ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
            : "border-maxify-border bg-maxify-card text-maxify-text-secondary hover:border-blue-500/25 hover:bg-blue-500/10 hover:text-blue-300"
        }
      `}
    >
      <Icon size={16} />
      <span>{item.label}</span>
      <span
        className={`
          rounded-full px-2 py-0.5 text-[11px]
          ${active ? "bg-blue-500/20 text-blue-200" : "bg-maxify-border/40 text-maxify-text-secondary"}
        `}
      >
        {count}
      </span>
    </button>
  )
}

function UtilityCard({
  util,
  isBusy,
  isToggle,
  isButton,
  isDropdown,
  toggleValue,
  dropdownValue,
  onButtonClick,
  onToggleChange,
  onDropdownChange,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
              {util.icon}
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-black text-maxify-text">
                  {util.name}
                </h3>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                  {util.badge}
                </span>
              </div>

              <p className="line-clamp-2 text-sm leading-6 text-maxify-text-secondary">
                {util.description}
              </p>
            </div>
          </div>

          {isToggle && (
            <div className="shrink-0">
              {isBusy ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-maxify-border border-t-blue-400" />
              ) : (
                <Toggle
                  checked={toggleValue || false}
                  onChange={(e) => onToggleChange(util, e.target.checked)}
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-auto rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
          {isButton && (
            <Button
              onClick={() => onButtonClick(util)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl"
              variant="primary"
            >
              <Zap size={16} />
              {util.buttonText}
            </Button>
          )}

          {isDropdown && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                Configuração atual
              </p>

              <Dropdown
                options={util.options}
                value={dropdownValue || util.options[0]}
                onChange={(value) => onDropdownChange(util, value)}
              />
            </div>
          )}

          {isToggle && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Status atual
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    toggleValue ? "text-cyan-300" : "text-maxify-text-secondary"
                  }`}
                >
                  {toggleValue ? "Ativado" : "Desativado"}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  toggleValue
                    ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                    : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary"
                }`}
              >
                {toggleValue ? "ON" : "OFF"}
              </span>
            </div>
          )}
        </div>
      </div>

      {isDropdown && isBusy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-maxify-card/75 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
            <RefreshCwIcon className="animate-spin text-blue-400" size={16} />
            <span className="text-sm font-bold text-blue-300">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Utilities() {
  const [dropdownValues, setDropdownValues] = useState({})
  const [toggleStates, setToggleStates] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 900)

    return () => clearTimeout(loadingTimeout)
  }, [])

  useEffect(() => {
    const checkAllStates = async () => {
      const checkPromises = utilities.map(async (util) => {
        if (util.type === "toggle" && util.checkScript) {
          setLoadingStates((prev) => ({ ...prev, [util.name]: true }))

          try {
            const result = await invoke({
              channel: "run-powershell",
              payload: {
                script: util.checkScript,
                name: `check-${util.name}`,
              },
            })

            if (result.success) {
              const isEnabled = result.output.trim().toLowerCase() === "enabled"
              setToggleStates((prev) => ({ ...prev, [util.name]: isEnabled }))
            }
          } catch (error) {
            console.error(`Failed to check ${util.name}:`, error)
            log.error(`Failed to check ${util.name}:`, error)
          } finally {
            setLoadingStates((prev) => ({ ...prev, [util.name]: false }))
          }
        } else if (util.type === "dropdown" && util.checkScript) {
          setLoadingStates((prev) => ({ ...prev, [util.name]: true }))

          try {
            const result = await invoke({
              channel: "run-powershell",
              payload: {
                script: util.checkScript,
                name: `check-${util.name}`,
              },
            })

            if (result.success) {
              const value = result.output.trim()
              setDropdownValues((prev) => ({ ...prev, [util.name]: value }))
            }
          } catch (error) {
            console.error(`Failed to check ${util.name}:`, error)
            log.error(`Failed to check ${util.name}:`, error)
          } finally {
            setLoadingStates((prev) => ({ ...prev, [util.name]: false }))
          }
        }
      })

      await Promise.all(checkPromises)
    }

    checkAllStates()
  }, [])

  const handleToggleChange = async (util, newState) => {
    const previousState = toggleStates[util.name]
    setToggleStates((prev) => ({ ...prev, [util.name]: newState }))

    const script = newState ? util.applyScript : util.unapplyScript

    if (script) {
      const loadingToastId = toast.loading(
        `${newState ? "Aplicando" : "Desativando"} ${util.name}...`
      )

      try {
        const result = await invoke({
          channel: "run-powershell",
          payload: {
            script,
            name: `${newState ? "apply" : "unapply"}-${util.name}`,
          },
        })

        if (!result.success) {
          throw new Error(result.error || "Falha ao executar script")
        }

        toast.update(loadingToastId, {
          render: `${newState ? "Aplicado" : "Desativado"} ${util.name}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      } catch (error) {
        console.error(`Error toggling ${util.name}:`, error)
        log.error(`Error toggling ${util.name}:`, error)
        setToggleStates((prev) => ({ ...prev, [util.name]: previousState }))

        toast.update(loadingToastId, {
          render: `Falha ao alterar ${util.name}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        })
      }
    }
  }

  const handleDropdownChange = async (util, value) => {
    const previousValue = dropdownValues[util.name]
    setDropdownValues((prev) => ({ ...prev, [util.name]: value }))

    if (util.applyScript) {
      const script =
        typeof util.applyScript === "object" ? util.applyScript[value] : util.applyScript

      if (script) {
        const loadingToastId = toast.loading(`Aplicando ${util.name}: ${value}...`)

        try {
          const result = await invoke({
            channel: "run-powershell",
            payload: {
              script,
              name: `apply-${util.name}-${value}`,
            },
          })

          if (!result.success) {
            throw new Error(result.error || "Falha ao executar script")
          }

          toast.update(loadingToastId, {
            render: `${util.name} aplicado: ${value}`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          })
        } catch (error) {
          console.error(`Error applying ${util.name}:`, error)
          log.error(`Error applying ${util.name}:`, error)
          setDropdownValues((prev) => ({ ...prev, [util.name]: previousValue }))

          toast.update(loadingToastId, {
            render: `Falha ao aplicar ${util.name}: ${value}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          })
        }
      }
    }
  }

  const handleButtonClick = async (util) => {
    if (util.runScript) {
      const loadingToastId = toast.loading(`Executando ${util.name}...`)

      try {
        const result = await invoke({
          channel: "run-powershell",
          payload: {
            script: util.runScript,
            name: `run-${util.name}`,
          },
        })

        if (!result.success) {
          throw new Error(result.error || "Falha ao executar script")
        }

        toast.update(loadingToastId, {
          render: `${util.name} concluído`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      } catch (error) {
        console.error(`Error running ${util.name}:`, error)
        log.error(`Error running ${util.name}:`, error)

        toast.update(loadingToastId, {
          render: `Falha ao executar ${util.name}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        })
      }
    }
  }

  const totalUtilities = utilities.length

  const toggleCount = useMemo(
    () => utilities.filter((util) => util.type === "toggle").length,
    []
  )

  const buttonCount = useMemo(
    () => utilities.filter((util) => util.type === "button").length,
    []
  )

  const dropdownCount = useMemo(
    () => utilities.filter((util) => util.type === "dropdown").length,
    []
  )

  const activeToggles = useMemo(() => {
    return Object.values(toggleStates).filter(Boolean).length
  }, [toggleStates])

  const categoryCounts = useMemo(() => {
    return utilityCategories.reduce((acc, item) => {
      if (item.id === "all") {
        acc[item.id] = utilities.length
      } else {
        acc[item.id] = utilities.filter((util) => util.category === item.id).length
      }

      return acc
    }, {})
  }, [])

  const filteredUtilities = useMemo(() => {
    let list = [...utilities]

    if (activeCategory !== "all") {
      list = list.filter((util) => util.category === activeCategory)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()

      list = list.filter((util) => {
        return (
          util.name.toLowerCase().includes(term) ||
          util.description.toLowerCase().includes(term) ||
          util.badge.toLowerCase().includes(term)
        )
      })
    }

    return list
  }, [activeCategory, search])

  return (
    <RootDiv>
      <div className="mx-auto max-w-[1900px] space-y-8 px-6 pb-16">
        <section className="relative mt-8 overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_390px] xl:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                <Sparkles size={14} />
                Central de utilitários
              </div>

              <div className="flex items-start gap-5">
                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                  <Wrench className="h-9 w-9 text-blue-300" />
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                    Ferramentas do{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                      Windows
                    </span>
                  </h1>

                  <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                    Acesse comandos rápidos, atalhos do sistema, ajustes de rede, manutenção e recursos de desempenho em uma área mais organizada.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      {totalUtilities} utilitários
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                      {activeToggles} recursos ativos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <Activity size={30} className="text-blue-300" />
                </div>

                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Organizado
                </div>
              </div>

              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                Painel de ações
              </p>

              <h2 className="mt-2 text-3xl font-black text-maxify-text">
                Tudo separado por categoria
              </h2>

              <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                Use a busca ou os filtros para encontrar cada ferramenta sem bagunça.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total"
            value={totalUtilities}
            icon={<Wrench size={20} />}
            helper="Ferramentas disponíveis"
          />

          <StatCard
            title="Ações"
            value={buttonCount}
            icon={<Zap size={20} />}
            helper="Botões de execução rápida"
          />

          <StatCard
            title="Alternâncias"
            value={toggleCount}
            icon={<Settings size={20} />}
            helper="Recursos ativáveis"
          />

          <StatCard
            title="Menus"
            value={dropdownCount}
            icon={<LayoutGrid size={20} />}
            helper="Configurações por seleção"
          />
        </section>

        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
              <Shield className="text-blue-400" size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-maxify-text">Aviso importante</h2>
              <p className="text-sm leading-6 text-maxify-text-secondary">
                Algumas utilidades exigem privilégios de administrador e podem alterar configurações do Windows.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-blue-300" size={18} />
              <p className="text-sm leading-relaxed text-maxify-text-secondary">
                Execute o Maxify como administrador para funcionamento completo. Algumas ações podem pedir reinicialização do PC para aplicar tudo corretamente.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                <Search className="text-blue-400" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-maxify-text">Buscar e filtrar</h2>
                <p className="text-sm text-maxify-text-secondary">
                  {filteredUtilities.length} resultado(s) encontrado(s)
                </p>
              </div>
            </div>

            <div className="relative w-full xl:max-w-[420px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar utilitário..."
                className="w-full rounded-2xl border border-maxify-border bg-maxify-bg/40 py-3 pl-11 pr-4 text-sm text-maxify-text outline-none transition placeholder:text-maxify-text-secondary/50 focus:border-blue-500/40 focus:bg-blue-500/10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {utilityCategories.map((category) => (
              <CategoryButton
                key={category.id}
                item={category}
                count={categoryCounts[category.id] || 0}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                <Wrench className="text-blue-400" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-maxify-text">Ferramentas disponíveis</h2>
                <p className="text-sm text-maxify-text-secondary">
                  Selecione uma ação, alternância ou configuração abaixo.
                </p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                <RefreshCwIcon className="animate-spin" size={16} />
                Carregando estados...
              </div>
            )}
          </div>

          {filteredUtilities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredUtilities.map((util) => {
                const isToggle = util.type === "toggle"
                const isButton = util.type === "button"
                const isDropdown = util.type === "dropdown"
                const isBusy = loadingStates[util.name]

                return (
                  <UtilityCard
                    key={util.name}
                    util={util}
                    isBusy={isBusy}
                    isToggle={isToggle}
                    isButton={isButton}
                    isDropdown={isDropdown}
                    toggleValue={toggleStates[util.name]}
                    dropdownValue={dropdownValues[util.name]}
                    onButtonClick={handleButtonClick}
                    onToggleChange={handleToggleChange}
                    onDropdownChange={handleDropdownChange}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-maxify-border bg-maxify-bg/30 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                <Search className="text-blue-300" size={24} />
              </div>

              <h3 className="text-xl font-black text-maxify-text">
                Nenhum utilitário encontrado
              </h3>

              <p className="mt-2 text-sm text-maxify-text-secondary">
                Tente limpar a busca ou selecionar outra categoria.
              </p>
            </div>
          )}
        </Card>
      </div>
    </RootDiv>
  )
}

export default Utilities
