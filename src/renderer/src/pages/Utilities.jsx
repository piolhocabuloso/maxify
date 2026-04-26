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
} from "lucide-react"
import React, { useState, useEffect, useMemo } from "react"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import { Dropdown } from "@/components/ui/dropdown"

/**
 * Array of utility objects for the Utilities page.
 * Each utility represents a system maintenance or information tool.
 */
const utilities = [
  {
    name: "Limpeza de Disco",
    description: "Libere espaço removendo arquivos desnecessários.",
    state: true,
    icon: <HardDrive />,
    type: "button",
    buttonText: "Limpar Agora",
    runScript: "cleanmgr /sagerun:1",
  },
  {
    name: "Sensor de Armazenamento",
    description: "Libere espaço automaticamente eliminando arquivos que você não precisa.",
    state: true,
    icon: <Computer />,
    type: "toggle",
    checkScript: `
$path = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\StorageSense\\Parameters\\StoragePolicy"
if (Test-Path $path) {
  $value = Get-ItemProperty -Path $path -Name "01" -ErrorAction SilentlyContinue
  if ($value."01" -eq 1) { Write-Output "enabled" } else { Write-Output "disabled" }
} else {
  Write-Output "disabled"
}`,
    applyScript: `
$path = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\StorageSense\\Parameters\\StoragePolicy"
if (-not (Test-Path $path)) {
  New-Item -Path $path -Force | Out-Null
}
Set-ItemProperty -Path $path -Name "01" -Value 1`,
    unapplyScript: `
$path = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\StorageSense\\Parameters\\StoragePolicy"
if (Test-Path $path) {
  Set-ItemProperty -Path $path -Name "01" -Value 0
}`,
  },
  {
    name: "Informações do Sistema",
    description: "Visualize informações detalhadas sobre o seu sistema.",
    state: false,
    icon: <Monitor />,
    type: "button",
    buttonText: "Ver info",
    runScript: "msinfo32",
  },
  {
    name: "Inicialização Rápida",
    description: "Melhore o tempo de inicialização otimizando as configurações de boot.",
    state: false,
    icon: <Zap />,
    type: "toggle",
    checkScript: `
$path = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power"
if (Test-Path $path) {
    $value = Get-ItemProperty -Path $path -Name "HiberbootEnabled" -ErrorAction SilentlyContinue
    if ($value.HiberbootEnabled -eq 1) { Write-Output "enabled" } else { Write-Output "disabled" }
} else {
    Write-Output "disabled"
}`,
    applyScript: `
powercfg /hibernate on
$path = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power"
if (!(Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "HiberbootEnabled" -Type DWord -Value 1
`,
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
    options: ["Default", "Manual", "Disabled"],
    checkScript: `
$service = Get-Service -Name wuauserv -ErrorAction SilentlyContinue
if ($service.StartType -eq 'Automatic') { Write-Output 'Default' }
elseif ($service.StartType -eq 'Manual') { Write-Output 'Manual' }
elseif ($service.StartType -eq 'Disabled') { Write-Output 'Disabled' }
else { Write-Output 'Unknown' }
`,
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
    buttonText: "Reiniciar",
    runScript: `
$gpus = Get-PnpDevice -Class Display -Status OK -ErrorAction SilentlyContinue
if ($gpus) {
    foreach ($gpu in $gpus) {
        Write-Output "Restarting $($gpu.FriendlyName)..."
        Disable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false
        Start-Sleep -Seconds 2
        Enable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false
    }
    Write-Output "Graphics driver restart completed."
} else {
    Write-Output "No active display devices found."
}
`,
  },
  {
    name: "Plano de Energia",
    description: "Escolha como o computador gerencia energia e desempenho.",
    state: false,
    icon: <Monitor />,
    type: "dropdown",
    options: ["Balanced", "High Performance", "Power Saver", "Ultimate Performance"],
    checkScript: `
$current = powercfg /getactivescheme
$currentGUID = ($current -split ' ')[3]

switch ($currentGUID) {
    "a1841308-3541-4fab-bc81-f71556f20b4a" { Write-Output "Power Saver" }
    "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c" { Write-Output "High Performance" }
    "e9a42b02-d5df-448d-aa00-03f14749eb61" { Write-Output "Ultimate Performance" }
    default { Write-Output "Balanced" }
}
`,
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
    buttonText: "Liberar",
    runScript: `
ipconfig /flushdns
Write-Output "DNS cache flushed."
`,
  },
  {
    name: "Reiniciar Serviço de Áudio",
    description: "Corrija problemas de som reiniciando o áudio do Windows.",
    state: false,
    icon: <Volume2Icon />,
    type: "button",
    buttonText: "Restart",
    runScript: `
Stop-Service -Name "Audiosrv" -Force -ErrorAction SilentlyContinue
Start-Service -Name "Audiosrv" -ErrorAction SilentlyContinue
Write-Output "Audio service restarted."
`,
  },
  {
    name: "Redefinir Rede",
    description: "Redefina a pilha de rede para corrigir problemas de conectividade.",
    state: false,
    icon: <WifiIcon />,
    type: "button",
    buttonText: "Reset",
    runScript: `
netsh winsock reset
netsh int ip reset
Write-Output "Network stack reset. Restart your PC to apply changes."
`,
  },
]

function Utilities() {
  const [dropdownValues, setDropdownValues] = useState({})
  const [toggleStates, setToggleStates] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 1200)

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

  const activeToggles = useMemo(() => {
    return Object.values(toggleStates).filter(Boolean).length
  }, [toggleStates])

  const topStats = [
    {
      title: "Utilitários",
      value: totalUtilities,
      icon: <Wrench size={18} />,
      color: "from-blue-500/20 to-cyan-500/10",
      text: "text-cyan-300",
    },
    {
      title: "Ativos",
      value: activeToggles,
      icon: <CheckCircle2 size={18} />,
      color: "from-blue-600/20 to-sky-500/10",
      text: "text-blue-300",
    },
    {
      title: "Ações rápidas",
      value: buttonCount,
      icon: <Zap size={18} />,
      color: "from-sky-500/20 to-blue-500/10",
      text: "text-sky-300",
    },
    {
      title: "Alternâncias",
      value: toggleCount,
      icon: <Settings size={18} />,
      color: "from-cyan-500/20 to-blue-500/10",
      text: "text-cyan-300",
    },
  ]

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">


        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="text-blue-400" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-maxify-text">Aviso importante</h2>
              <p className="text-sm text-maxify-text-secondary">
                Algumas utilidades exigem privilégios de administrador. As alterações feitas aqui afetam diretamente configurações do Windows.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4 flex items-start gap-3">
            <AlertTriangle className="text-blue-400 mt-0.5 shrink-0" size={18} />
            <p className="text-sm text-maxify-text-secondary leading-relaxed">
              Execute o Maxify como administrador para funcionamento completo. Algumas ações podem pedir reinicialização do PC para aplicar tudo corretamente.
            </p>
          </div>
        </Card>

        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Wrench className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Ferramentas disponíveis</h2>
                <p className="text-sm text-maxify-text-secondary">
                  {utilities.length} utilitários prontos para uso
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {utilities.map((util) => {
              const isToggle = util.type === "toggle"
              const isButton = util.type === "button"
              const isDropdown = util.type === "dropdown"
              const isBusy = loadingStates[util.name]

              return (
                <div
                  key={util.name}
                  className="relative rounded-2xl border border-maxify-border bg-maxify-border/10 hover:border-blue-400/40 p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 p-2.5 rounded-xl shrink-0 bg-blue-500/10 text-blue-400">
                        {util.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-maxify-text">
                            {util.name}
                          </span>

                          {isToggle && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] ${
                                toggleStates[util.name]
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-slate-500/15 text-slate-300"
                              }`}
                            >
                              {toggleStates[util.name] ? "Ativo" : "Inativo"}
                            </span>
                          )}

                          {isDropdown && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-500/15 text-blue-300">
                              Seleção
                            </span>
                          )}

                          {isButton && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-500/15 text-blue-300">
                              Ação rápida
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-maxify-text-secondary mt-1 leading-relaxed">
                          {util.description}
                        </p>

                        <div className="mt-4">
                          {isButton && (
                            <Button
                              onClick={() => handleButtonClick(util)}
                              className="min-w-[140px] flex items-center justify-center gap-2"
                              variant="primary"
                            >
                              {util.buttonText}
                            </Button>
                          )}

                          {isDropdown && (
                            <div className="w-full">
                              <p className="text-xs text-maxify-text-secondary mb-2">
                                Configuração atual
                              </p>
                              <Dropdown
                                options={util.options}
                                value={dropdownValues[util.name] || util.options[0]}
                                onChange={(value) => handleDropdownChange(util, value)}
                              />
                            </div>
                          )}

                          {isToggle && (
                            <div className="text-xs text-maxify-text-secondary">
                              Status atual:{" "}
                              <span
                                className={`font-medium ${
                                  toggleStates[util.name] ? "text-cyan-300" : "text-slate-300"
                                }`}
                              >
                                {toggleStates[util.name] ? "Ativado" : "Desativado"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isToggle && (
                      <div className="shrink-0">
                        {isBusy ? (
                          <div className="w-6 h-6 border-2 border-maxify-border-secondary border-t-maxify-primary rounded-full animate-spin" />
                        ) : (
                          <Toggle
                            checked={toggleStates[util.name] || false}
                            onChange={(e) => handleToggleChange(util, e.target.checked)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {isDropdown && isBusy && (
                    <div className="absolute inset-0 rounded-2xl bg-maxify-card/75 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <RefreshCwIcon className="animate-spin text-blue-400" size={16} />
                        <span className="text-sm font-medium text-blue-300">Carregando...</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </RootDiv>
  )
}

export default Utilities