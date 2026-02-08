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
  Cpu,
  MemoryStick,
  Thermometer,
  TrendingUp,
  Rocket,
  Settings,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from "lucide-react"
import React, { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import { Dropdown } from "@/components/ui/dropdown"
import Modal from "@/components/ui/modal"
import LoginIcon from "../../../../resources/sparklelogo.png"

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
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(loadingTimeout)
  }, [])

  useEffect(() => {
    if (localStorage.getItem("utilitiesModalShown") !== "true") {
      setModalOpen(true)
    }
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
        `${newState ? "Applying" : "Unapplying"} ${util.name}...`,
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
          throw new Error(result.error || "Failed to execute script")
        }
        toast.update(loadingToastId, {
          render: `${newState ? "Applied" : "Unapplied"} ${util.name}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      } catch (error) {
        console.error(`Error toggling ${util.name}:`, error)
        log.error(`Error toggling ${util.name}:`, error)
        setToggleStates((prev) => ({ ...prev, [util.name]: previousState }))
        toast.update(loadingToastId, {
          render: `Failed to ${newState ? "apply" : "unapply"} ${util.name}`,
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
        const loadingToastId = toast.loading(`Applying ${util.name}: ${value}...`)
        try {
          const result = await invoke({
            channel: "run-powershell",
            payload: {
              script,
              name: `apply-${util.name}-${value}`,
            },
          })
          if (!result.success) {
            throw new Error(result.error || "Failed to execute script")
          }
          toast.update(loadingToastId, {
            render: `Applied ${util.name}: ${value}`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          })
        } catch (error) {
          console.error(`Error applying ${util.name}:`, error)
          log.error(`Error applying ${util.name}:`, error)
          setDropdownValues((prev) => ({ ...prev, [util.name]: previousValue }))
          toast.update(loadingToastId, {
            render: `Failed to apply ${util.name}: ${value}`,
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
      const loadingToastId = toast.loading(`Running ${util.name}...`)
      try {
        const result = await invoke({
          channel: "run-powershell",
          payload: {
            script: util.runScript,
            name: `run-${util.name}`,
          },
        })
        if (!result.success) {
          throw new Error(result.error || "Failed to execute script")
        }
        toast.update(loadingToastId, {
          render: `${util.name} completed`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      } catch (error) {
        console.error(`Error running ${util.name}:`, error)
        log.error(`Error running ${util.name}:`, error)
        toast.update(loadingToastId, {
          render: `Failed to run ${util.name}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        })
      }
    }
  }


  return (
    <>
      <RootDiv>
        <div className="max-w-[2000px] mx-auto px-6 pb-16">


          {/* === UTILITIES GRID === */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {utilities.map((util) => {
              const isToggle = util.type === "toggle"
              const isButton = util.type === "button"
              const isDropdown = util.type === "dropdown"

              return (
                <Card
                  key={util.name}
                  className="bg-sparkle-card border border-sparkle-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <div className="text-blue-500">{util.icon}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-sparkle-text">{util.name}</h3>
                        {isToggle && (
                          loadingStates[util.name] ? (
                            <div className="w-6 h-6 border-2 border-sparkle-border-secondary border-t-sparkle-primary rounded-full animate-spin" />
                          ) : (
                            <Toggle
                              checked={toggleStates[util.name] || false}
                              onChange={(e) => handleToggleChange(util, e.target.checked)}
                            />
                          )
                        )}
                      </div>

                      <p className="text-sm text-sparkle-text-secondary mb-4">
                        {util.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {isButton && (
                          <Button
                            onClick={() => handleButtonClick(util)}
                            className="!bg-blue-500 hover:!bg-blue-600 !text-white"
                          >
                            {util.buttonText}
                          </Button>
                        )}

                        {isDropdown && (
                          loadingStates[util.name] ? (
                            <div className="w-6 h-6 border-2 border-sparkle-border-secondary border-t-sparkle-primary rounded-full animate-spin" />
                          ) : (
                            <div className="w-full">
                              <p className="text-xs text-sparkle-text-secondary mb-2">Current Setting:</p>
                              <Dropdown
                                options={util.options}
                                value={dropdownValues[util.name] || util.options[0]}
                                onChange={(value) => handleDropdownChange(util, value)}
                              />
                            </div>
                          )
                        )}

                        {isToggle && (
                          <div className="text-xs text-sparkle-text-secondary">
                            Status: <span className={`font-medium ${toggleStates[util.name] ? 'text-green-500' : 'text-red-500'}`}>
                              {toggleStates[util.name] ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* === INFO BANNER === */}
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <AlertTriangle className="text-blue-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-sparkle-text mb-1">Aviso Importante</h3>
                  <p className="text-sm text-sparkle-text-secondary">
                    Algumas utilidades exigem privilégios de administrador. Certifique-se de executar o Maxify como administrador para funcionalidade completa.
                    As alterações feitas aqui afetam diretamente as configurações do seu sistema Windows.
                  </p>

                </div>
              </div>
            </div>
          </Card>
        </div>
      </RootDiv>
    </>
  )
}

export default Utilities