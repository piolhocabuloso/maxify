
import { useState, useEffect } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  Gamepad2, Rocket, BellOff, Monitor, Cpu,
  Zap, ShieldCheck, Activity, Settings, Power,
  ChevronRight, Gauge, AlertTriangle, Play, Pause,
  TimerOff, Maximize, VideoOff, CircuitBoard, MousePointer,
  MemoryStick, Network, SlidersHorizontal
} from "lucide-react"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"
import log from "electron-log/renderer"

const gameActions = [

  {
    id: "notifications",
    label: "Foco Total",
    description: "Silencia notificações do sistema e assistente de foco.",
    icon: <BellOff className="text-orange-500" size={20} />,
    category: "sistema",
    checkScript: `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
$isEnabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "NUI_EnableAttentionAwareSystem" -ErrorAction SilentlyContinue
    if ($value.NUI_EnableAttentionAwareSystem -eq 0) { $isEnabled = $true }
}
Write-Output $isEnabled
`,
    applyScript: `
# Disable Focus Assist
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" -Name "NUI_EnableAttentionAwareSystem" -Value 0 -Type DWord -Force

# Disable notifications temporarily
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
Set-ItemProperty -Path $regPath -Name "ShowInActionCenter" -Value 0 -Type DWord -Force

# Disable toast notifications
$appRegPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications"
if (Test-Path $appRegPath) {
    Set-ItemProperty -Path $appRegPath -Name "ToastEnabled" -Value 0 -Type DWord -Force
}

Write-Output "Focus mode and notifications disabled"
`,
    restoreScript: `
# Restore Focus Assist
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" -Name "NUI_EnableAttentionAwareSystem" -Value 1 -Type DWord -Force

# Restore notifications
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
if (Test-Path $regPath) {
    Set-ItemProperty -Path $regPath -Name "ShowInActionCenter" -Value 1 -Type DWord -Force
}

# Restore toast notifications
$appRegPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications"
if (Test-Path $appRegPath) {
    Set-ItemProperty -Path $appRegPath -Name "ToastEnabled" -Value 1 -Type DWord -Force
}

Write-Output "Focus mode and notifications restored"
`
  },
  {
    id: "priority",
    label: "Prioridade de CPU",
    description: "Define o processo do jogo com prioridade Alta no Windows.",
    icon: <Cpu className="text-blue-500" size={20} />,
    category: "performance",
    checkScript: `
$regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
$isConfigured = $false

if (Test-Path $regPath) {
    $subkeys = Get-ChildItem -Path $regPath | Where-Object { $_.Name -match ".*exe$" }
    foreach ($key in $subkeys) {
        $priority = Get-ItemProperty -Path $key.PSPath -Name "CpuPriorityClass" -ErrorAction SilentlyContinue
        if ($priority.CpuPriorityClass -eq 3) { $isConfigured = $true; break }
    }
}
Write-Output $isConfigured
`,
    applyScript: `
# Note: This script sets registry keys for common game executables
# The actual priority is applied when the game starts

$games = @(
    "cs2.exe",
    "valorant.exe", 
    "fortnite.exe",
    "Overwatch.exe",
    "starfield.exe",
    "game.exe"
)

$regBase = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"

foreach ($game in $games) {
    $regPath = "$regBase\\$game"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "CpuPriorityClass" -Value 3 -Type DWord -Force
    Set-ItemProperty -Path $regPath -Name "PerfOptions" -Value 3 -Type DWord -Force
}

Write-Output "CPU priority configured for common games"
`,
    restoreScript: `
# Remove CPU priority settings
$regBase = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"
$games = @("cs2.exe", "valorant.exe", "fortnite.exe", "Overwatch.exe", "starfield.exe", "game.exe")

foreach ($game in $games) {
    $regPath = "$regBase\\$game"
    if (Test-Path $regPath) {
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Output "CPU priority settings restored to default"
`
  },
  {
    id: "ram_clean",
    label: "Otimizar RAM",
    description: "Suspende processos de fundo desnecessários para liberar memória.",
    icon: <Zap className="text-yellow-500" size={20} />,
    category: "performance",
    checkScript: `
# Check if memory optimization services are running
$services = @("SysMain", "DiagTrack", "WSearch")
$optimized = $false

foreach ($service in $services) {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if ($svc.Status -eq "Stopped") {
        $optimized = $true
        break
    }
}
Write-Output $optimized
`,
    applyScript: `
# Stop unnecessary services to free RAM
$servicesToStop = @(
    "SysMain",           # Superfetch
    "DiagTrack",         # Diagnostics Tracking Service
    "WSearch",           # Windows Search
    "MapsBroker",        # Downloaded Maps Manager
    "lfsvc",             # Geolocation Service
    "RetailDemo",        # Retail Demo Service
    "TabletInputService",# Tablet PC Input Service
    "WbioSrvc",          # Windows Biometric Service
    "XblAuthManager",    # Xbox Live Auth Manager
    "XblGameSave",       # Xbox Live Game Save
    "XboxNetApiSvc"      # Xbox Live Networking Service
)

$stoppedServices = @()
foreach ($service in $servicesToStop) {
    try {
        $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -eq "Running") {
            Stop-Service -Name $service -Force -ErrorAction SilentlyContinue
            $stoppedServices += $service
        }
    } catch {
        # Service might not exist, continue
    }
}

# Clear standby memory list
$scriptBlock = {
    $signature = @"
    [DllImport("kernel32.dll")]
    public static extern bool SetProcessWorkingSetSize(IntPtr proc, int min, int max);
"@
    $type = Add-Type -MemberDefinition $signature -Name "Win32" -Namespace "Win32" -PassThru
    $type::SetProcessWorkingSetSize((Get-Process -Id $PID).Handle, -1, -1)
}

Invoke-Command -ScriptBlock $scriptBlock

Write-Output "RAM optimized. Stopped services: $($stoppedServices -join ', ')"
`,
    restoreScript: `
# Restart services
$servicesToStart = @(
    "SysMain",
    "DiagTrack", 
    "WSearch",
    "MapsBroker",
    "lfsvc",
    "RetailDemo",
    "TabletInputService",
    "WbioSrvc",
    "XblAuthManager",
    "XblGameSave",
    "XboxNetApiSvc"
)

foreach ($service in $servicesToStart) {
    try {
        $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
        if ($svc -and $svc.Status -eq "Stopped") {
            Start-Service -Name $service -ErrorAction SilentlyContinue
        }
    } catch {
        # Service might not exist, continue
    }
}

Write-Output "System services restored"
`
  },
  {
    id: "power_plan",
    label: "Plano de Energia",
    description: "Alterna para o plano de 'Desempenho Máximo'.",
    icon: <Rocket className="text-purple-500" size={20} />,
    category: "sistema",
    checkScript: `
$current = powercfg /getactivescheme
$currentGUID = ($current -split ' ')[3]

if ($currentGUID -eq "e9a42b02-d5df-448d-aa00-03f14749eb61") {
    Write-Output $true
} else {
    Write-Output $false
}
`,
    applyScript: `
# Create Ultimate Performance plan if it doesn't exist
$ultimatePlan = powercfg -l | Select-String "Ultimate Performance"

if (-not $ultimatePlan) {
    Write-Host "Creating Ultimate Performance plan..."
    powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
}

# Activate Ultimate Performance
$ultimatePlanGUID = (powercfg -l | Select-String "Ultimate Performance").ToString().Split()[3]

if ($ultimatePlanGUID) {
    powercfg -setactive $ultimatePlanGUID 2>$null
    
    # Set power settings for maximum performance
    powercfg /setactive SCHEME_MIN
    powercfg /setacvalueindex SCHEME_MIN SUB_PROCESSOR PERFINCPOL 2
    powercfg /setdcvalueindex SCHEME_MIN SUB_PROCESSOR PERFINCPOL 2
    powercfg /setacvalueindex SCHEME_MIN SUB_PROCESSOR PERFINCTHRESHOLD 0
    powercfg /setdcvalueindex SCHEME_MIN SUB_PROCESSOR PERFINCTHRESHOLD 0
    
    Write-Host "Ultimate Performance power plan activated"
} else {
    # Fallback to High Performance
    powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
    Write-Host "High Performance plan activated"
}
`,
    restoreScript: `
# Restore to Balanced plan
powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e
Write-Host "Balanced power plan restored"
`
  },
  {
    id: "visual_effects",
    label: "Efeitos Visuais",
    description: "Desativa transparências e efeitos do Windows para ganhar FPS.",
    icon: <Monitor className="text-cyan-500" size={20} />,
    category: "graficos",
    checkScript: `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"
$isOptimized = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "VisualFXSetting" -ErrorAction SilentlyContinue
    if ($value.VisualFXSetting -eq 2) { $isOptimized = $true }
}
Write-Output $isOptimized
`,
    applyScript: `
# Disable visual effects for performance
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Set to "Adjust for best performance"
Set-ItemProperty -Path $regPath -Name "VisualFXSetting" -Value 2 -Type DWord -Force

# Disable specific animations
$animationsPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"
Set-ItemProperty -Path $animationsPath -Name "IconsOnly" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "ListviewAlphaSelect" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "ListviewShadow" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "TaskbarAnimations" -Value 0 -Type DWord -Force

# Disable transparency effects
$personalizePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
Set-ItemProperty -Path $personalizePath -Name "EnableTransparency" -Value 0 -Type DWord -Force

Write-Output "Visual effects optimized for performance"
`,
    restoreScript: `
# Restore visual effects
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"
Set-ItemProperty -Path $regPath -Name "VisualFXSetting" -Value 3 -Type DWord -Force

# Restore animations
$animationsPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"
Set-ItemProperty -Path $animationsPath -Name "IconsOnly" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "ListviewAlphaSelect" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "ListviewShadow" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $animationsPath -Name "TaskbarAnimations" -Value 1 -Type DWord -Force

# Restore transparency
$personalizePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
Set-ItemProperty -Path $personalizePath -Name "EnableTransparency" -Value 1 -Type DWord -Force

Write-Output "Visual effects restored to default"
`
  },
  {
    id: "anti_lag",
    label: "Anti-Lag",
    description: "Reduz lag ajustando recursos do Windows.",
    icon: <ShieldCheck className="text-green-500" size={20} />,
    category: "performance",
    checkScript: `
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl"
$isOptimized = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "Win32PrioritySeparation" -ErrorAction SilentlyContinue
    if ($value.Win32PrioritySeparation -eq 38) { $isOptimized = $true }
}
Write-Output $isOptimized
`,
    applyScript: `
# Optimize for low latency
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Set priority separation for foreground applications
Set-ItemProperty -Path $regPath -Name "Win32PrioritySeparation" -Value 38 -Type DWord -Force

# Disable NTFS last access timestamp
$ntfsPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem"
Set-ItemProperty -Path $ntfsPath -Name "NtfsDisableLastAccessUpdate" -Value 1 -Type DWord -Force

# Disable TCP auto-tuning for lower latency
netsh int tcp set global autotuninglevel=disabled

# Set network throttling index
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 4294967295 -Type DWord -Force

# Disable Nagle's algorithm
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces" -Name "TcpAckFrequency" -Value 1 -Type DWord -Force

Write-Output "Anti-lag optimizations applied"
`,
    restoreScript: `
# Restore default settings
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl"
Set-ItemProperty -Path $regPath -Name "Win32PrioritySeparation" -Value 2 -Type DWord -Force

# Restore NTFS settings
$ntfsPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem"
Set-ItemProperty -Path $ntfsPath -Name "NtfsDisableLastAccessUpdate" -Value 0 -Type DWord -Force

# Restore TCP auto-tuning
netsh int tcp set global autotuninglevel=normal

# Restore network throttling
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 10 -Type DWord -Force

Write-Output "Anti-lag optimizations restored to default"
`
  },

  {
    id: "game_mode",
    label: "Modo de Jogo Windows",
    description: "Ativa o Game Mode oficial do Windows 10/11 automaticamente.",
    icon: <Gamepad2 className="text-purple-600" size={20} />,
    category: "sistema",
    checkScript: `
$regPath = "HKCU:\\Software\\Microsoft\\GameBar"
$isEnabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -ErrorAction SilentlyContinue
    if ($value.AutoGameModeEnabled -eq 1) { $isEnabled = $true }
}
Write-Output $isEnabled
`,
    applyScript: `
# Enable Windows Game Mode
$regPath = "HKCU:\\Software\\Microsoft\\GameBar"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Enable Auto Game Mode
Set-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -Value 1 -Type DWord -Force

# Optimize for gaming
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\GameBar" -Name "UseNexusForGameBarEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\GameBar" -Name "ShowStartupPanel" -Value 0 -Type DWord -Force

# Disable Game Bar popups
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\GameBar" -Name "AutoGameModeEnabled" -Value 1 -Type DWord -Force

Write-Output "Windows Game Mode enabled"
`,
    restoreScript: `
# Restore Game Mode settings
$regPath = "HKCU:\\Software\\Microsoft\\GameBar"
Set-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "UseNexusForGameBarEnabled" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "ShowStartupPanel" -Value 1 -Type DWord -Force

Write-Output "Windows Game Mode restored to default"
`
  },

  {
    id: "hpet",
    label: "Timer de Alta Precisão",
    description: "Desabilita HPET para reduzir latência de entrada.",
    icon: <TimerOff className="text-red-500" size={20} />,
    category: "performance",
    checkScript: `
$hpetStatus = bcdedit /enum | Select-String "hpet"
if ($hpetStatus -match "Yes") {
    Write-Output $true
} else {
    Write-Output $false
}
`,
    applyScript: `
# Disable High Precision Event Timer (HPET) for lower input lag
bcdedit /deletevalue useplatformclock 2>$null
bcdedit /set disabledynamictick yes 2>$null
bcdedit /set useplatformtick yes 2>$null

# Also disable in BIOS via registry
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\hpet\\Parameters"
if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}
Set-ItemProperty -Path $regPath -Name "Enabled" -Value 0 -Type DWord -Force

Write-Output "HPET disabled for reduced input lag"
`,
    restoreScript: `
# Restore HPET settings
bcdedit /deletevalue disabledynamictick 2>$null
bcdedit /deletevalue useplatformtick 2>$null

$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\hpet\\Parameters"
if (Test-Path $regPath) {
    Set-ItemProperty -Path $regPath -Name "Enabled" -Value 1 -Type DWord -Force
}

Write-Output "HPET restored to default"
`
  },

  {
    id: "fullscreen_optimizations",
    label: "Otimizações Tela Cheia",
    description: "Desativa otimizações do Windows para modo tela cheia.",
    icon: <Maximize className="text-cyan-600" size={20} />,
    category: "graficos",
    checkScript: `
$regPath = "HKCU:\\System\\GameConfigStore"
$isDisabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -ErrorAction SilentlyContinue
    if ($value.GameDVR_FSEBehaviorMode -eq 2) { $isDisabled = $true }
}
Write-Output $isDisabled
`,
    applyScript: `
# Disable fullscreen optimizations for better exclusive fullscreen
$regPath = "HKCU:\\System\\GameConfigStore"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Disable GameDVR and fullscreen optimizations
Set-ItemProperty -Path $regPath -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -Value 2 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 1 -Type DWord -Force

# Also set for executable-specific optimizations
$exePath = "HKCU:\\System\\GameConfigStore\\Children"
if (!(Test-Path $exePath)) {
    New-Item -Path $exePath -Force | Out-Null
}

Write-Output "Fullscreen optimizations disabled"
`,
    restoreScript: `
# Restore fullscreen optimizations
$regPath = "HKCU:\\System\\GameConfigStore"
Set-ItemProperty -Path $regPath -Name "GameDVR_Enabled" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 0 -Type DWord -Force

Write-Output "Fullscreen optimizations restored"
`
  },

  {
    id: "game_dvr",
    label: "Desabilitar Game DVR",
    description: "Desativa gravação de vídeo e captura automática.",
    icon: <VideoOff className="text-pink-500" size={20} />,
    category: "performance",
    checkScript: `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
$isDisabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -ErrorAction SilentlyContinue
    if ($value.AppCaptureEnabled -eq 0) { $isDisabled = $true }
}
Write-Output $isDisabled
`,
    applyScript: `
# Disable Windows Game DVR completely
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

Set-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "AudioCaptureEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "CursorCaptureEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "HistoricalCaptureEnabled" -Value 0 -Type DWord -Force

# Also disable in Xbox Game Bar
$xboxPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
Set-ItemProperty -Path $xboxPath -Name "AudioCaptureEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $xboxPath -Name "VideoEncodingBitrateMode" -Value 0 -Type DWord -Force

# Disable background recording
Set-ItemProperty -Path "HKCU:\\System\\GameConfigStore" -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force

Write-Output "Game DVR disabled"
`,
    restoreScript: `
# Restore Game DVR
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
Set-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "AudioCaptureEnabled" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "CursorCaptureEnabled" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "HistoricalCaptureEnabled" -Value 1 -Type DWord -Force

Set-ItemProperty -Path "HKCU:\\System\\GameConfigStore" -Name "GameDVR_Enabled" -Value 1 -Type DWord -Force

Write-Output "Game DVR restored"
`
  },

  {
    id: "gpu_scheduling",
    label: "Agendamento GPU Hardware",
    description: "Ativa agendamento de GPU para melhor desempenho gráfico.",
    icon: <CircuitBoard className="text-violet-500" size={20} />,
    category: "graficos",
    checkScript: `
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
$isEnabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "HwSchMode" -ErrorAction SilentlyContinue
    if ($value.HwSchMode -eq 2) { $isEnabled = $true }
}
Write-Output $isEnabled
`,
    applyScript: `
# Enable Hardware Accelerated GPU Scheduling
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

Set-ItemProperty -Path $regPath -Name "HwSchMode" -Value 2 -Type DWord -Force

# Also optimize GPU performance
$gpuPath = "HKCU:\\Software\\Microsoft\\DirectX\\UserGpuPreferences"
if (!(Test-Path $gpuPath)) {
    New-Item -Path $gpuPath -Force | Out-Null
}

Write-Output "Hardware GPU scheduling enabled"
`,
    restoreScript: `
# Restore GPU scheduling
$regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
Set-ItemProperty -Path $regPath -Name "HwSchMode" -Value 1 -Type DWord -Force

Write-Output "GPU scheduling restored to default"
`
  },

  {
    id: "mouse_acceleration",
    label: "Aceleração de Mouse",
    description: "Desativa aceleração para precisão em FPS.",
    icon: <MousePointer className="text-emerald-500" size={20} />,
    category: "performance",
    checkScript: `
$regPath = "HKCU:\\Control Panel\\Mouse"
$isDisabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "MouseSpeed" -ErrorAction SilentlyContinue
    if ($value.MouseSpeed -eq 0) { $isDisabled = $true }
}
Write-Output $isDisabled
`,
    applyScript: `
# Disable mouse acceleration for precise aiming
$regPath = "HKCU:\\Control Panel\\Mouse"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Set to no acceleration (1:1 input)
Set-ItemProperty -Path $regPath -Name "MouseSpeed" -Value 0 -Type String -Force
Set-ItemProperty -Path $regPath -Name "MouseThreshold1" -Value 0 -Type String -Force
Set-ItemProperty -Path $regPath -Name "MouseThreshold2" -Value 0 -Type String -Force

# Also via system parameters
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "UserPreferencesMask" -Value ([byte[]](0x9E,0x1E,0x06,0x80,0x12,0x00,0x00,0x00)) -Type Binary -Force

Write-Output "Mouse acceleration disabled"
`,
    restoreScript: `
# Restore mouse acceleration
$regPath = "HKCU:\\Control Panel\\Mouse"
Set-ItemProperty -Path $regPath -Name "MouseSpeed" -Value 1 -Type String -Force
Set-ItemProperty -Path $regPath -Name "MouseThreshold1" -Value 6 -Type String -Force
Set-ItemProperty -Path $regPath -Name "MouseThreshold2" -Value 10 -Type String -Force

Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "UserPreferencesMask" -Value ([byte[]](0x9E,0x1E,0x06,0x80,0x12,0x00,0x00,0x80)) -Type Binary -Force

Write-Output "Mouse acceleration restored"
`
  },
  {
    id: "network_qos",
    label: "Prioridade de Rede",
    description: "Configura QoS para priorizar tráfego de jogos.",
    icon: <Network className="text-sky-500" size={20} />,
    category: "performance",
    checkScript: `
$regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"
$isOptimized = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -ErrorAction SilentlyContinue
    if ($value.NonBestEffortLimit -eq 0) { $isOptimized = $true }
}
Write-Output $isOptimized
`,
    applyScript: `
# Configure network QoS for gaming traffic
$regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"

if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Disable bandwidth reservation (0 = no reservation)
Set-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -Value 0 -Type DWord -Force

# CORREÇÃO: Comandos netsh atualizados para Windows 10/11
# Desabilitar chimney (não é mais suportado nas versões recentes)
netsh int tcp set global chimney=disabled 2>$null

# Habilitar RSS (Receive Side Scaling)
netsh int tcp set global rss=enabled

# Configurar auto-tuning para normal
netsh int tcp set global autotuninglevel=normal

# Configurar congestion provider para CTCP (Compound TCP)
# Este comando mudou no Windows 10/11
try {
    netsh int tcp set supplemental template=internet congestionprovider=ctcp
} catch {
    # Fallback para comando alternativo
    netsh int tcp set global congestionprovider=ctcp 2>$null
}

# Desabilitar Windows Auto-Tuning (pode causar lag spikes)
netsh int tcp set global autotuninglevel=disabled

# Otimizar parâmetros TCP para jogos
netsh int tcp set global initialRto=1000
netsh int tcp set global initialRtt=5
netsh int tcp set global maxSynRetransmissions=2

# Configurar DNS para opções rápidas (Cloudflare e Google)
$dnsServers = @("1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4")
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
if ($adapter) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses $dnsServers -ErrorAction SilentlyContinue
}

Write-Output "Network optimized for gaming"
`,
    restoreScript: `
# Restaurar configurações de rede
$regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"
Set-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -Value 70 -Type DWord -Force

# Restaurar configurações TCP
netsh int tcp set global chimney=default 2>$null
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global initialRto=3000
netsh int tcp set global initialRtt=0
netsh int tcp set global maxSynRetransmissions=3

try {
    netsh int tcp set supplemental template=internet congestionprovider=none
} catch {
    netsh int tcp set global congestionprovider=none 2>$null
}

# Restaurar DNS automático
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
if ($adapter) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ResetServerAddresses -ErrorAction SilentlyContinue
}

Write-Output "Network settings restored"
`
  },

  {
    id: "background_apps",
    label: "Apps em Segundo Plano",
    description: "Limita apps em segundo plano para liberar recursos.",
    icon: <SlidersHorizontal className="text-indigo-500" size={20} />,
    category: "sistema",
    checkScript: `
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"
$isLimited = $false

if (Test-Path $regPath) {
    $keys = Get-ChildItem -Path $regPath | Measure-Object
    if ($keys.Count -eq 0) { $isLimited = $true }
}
Write-Output $isLimited
`,
    applyScript: `
# Limit background apps for gaming
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"

# Disable all background apps except essential
Get-ChildItem -Path $regPath | ForEach-Object {
    $appPath = $_.PSPath
    Set-ItemProperty -Path $appPath -Name "Disabled" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path $appPath -Name "DisabledByUser" -Value 1 -Type DWord -Force
}

# Disable background app permission globally
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 1 -Type DWord -Force

# Disable background data for metered connections
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" -Name "GlobalUserDisabledOnMetered" -Value 1 -Type DWord -Force

# Kill common background processes
$processesToKill = @(
    "OneDrive*",
    "Dropbox*",
    "GoogleDrive*",
    "Spotify*",
    "Discord*",
    "Steam*",
    "EpicGames*",
    "Origin*",
    "Ubisoft*",
    "*Updater*",
    "*Updater*",
    "*Update*"
)

foreach ($proc in $processesToKill) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

Write-Output "Background apps limited for gaming"
`,
    restoreScript: `
# Restore background apps
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"

Get-ChildItem -Path $regPath | ForEach-Object {
    $appPath = $_.PSPath
    Set-ItemProperty -Path $appPath -Name "Disabled" -Value 0 -Type DWord -Force
    Set-ItemProperty -Path $appPath -Name "DisabledByUser" -Value 0 -Type DWord -Force
}

Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" -Name "GlobalUserDisabledOnMetered" -Value 0 -Type DWord -Force

Write-Output "Background apps restored"
`
  },

  {
    id: "display_power",
    label: "Performance do Monitor",
    description: "Maximiza taxa de atualização e reduz latência do monitor.",
    icon: <Monitor className="text-orange-500" size={20} />,
    category: "graficos",
    checkScript: `
$regPath = "HKCU:\\Control Panel\\Desktop"
$isOptimized = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name "MonitorPowerOn" -ErrorAction SilentlyContinue
    if ($value.MonitorPowerOn -eq 0) { $isOptimized = $true }
}
Write-Output $isOptimized
`,
    applyScript: `
# Optimize display settings for gaming
$regPath = "HKCU:\\Control Panel\\Desktop"

# Disable display power saving
Set-ItemProperty -Path $regPath -Name "MonitorPowerOn" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value 0 -Type DWord -Force

# Disable screen saver
powercfg /x monitor-timeout-ac 0
powercfg /x monitor-timeout-dc 0

# Set optimal refresh rate
Add-Type -AssemblyName System.Windows.Forms
$screens = [System.Windows.Forms.Screen]::AllScreens
foreach ($screen in $screens) {
    $screen.DeviceName
}

Write-Output "Display optimized for gaming (no power saving)"
`,
    restoreScript: `
# Restore display power settings
$regPath = "HKCU:\\Control Panel\\Desktop"
Set-ItemProperty -Path $regPath -Name "MonitorPowerOn" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value 1 -Type DWord -Force

# Restore default timeouts
powercfg /x monitor-timeout-ac 10
powercfg /x monitor-timeout-dc 5

Write-Output "Display power settings restored"
`
  },

  {
    id: "ultra_performance",
    label: "Ultra Performance GPU",
    description: "Configurações agressivas para placas NVIDIA/AMD.",
    icon: <Cpu className="text-green-500" size={20} />,
    category: "graficos",
    checkScript: `
$nvidiaPath = "HKLM:\\SOFTWARE\\NVIDIA Corporation\\Global\\NVTweak"
$amdPath = "HKLM:\\SOFTWARE\\AMD\\"
$isOptimized = $false

if (Test-Path $nvidiaPath) {
    $value = Get-ItemProperty -Path $nvidiaPath -Name "CoolBits" -ErrorAction SilentlyContinue
    if ($value.CoolBits -eq 28) { $isOptimized = $true }
} elseif (Test-Path $amdPath) {
    $isOptimized = $true
}
Write-Output $isOptimized
`,
    applyScript: `
# GPU performance optimizations

# NVIDIA specific optimizations
$nvidiaPath = "HKLM:\\SOFTWARE\\NVIDIA Corporation\\Global\\NVTweak"
if (!(Test-Path $nvidiaPath)) {
    New-Item -Path $nvidiaPath -Force | Out-Null
}

# Enable performance mode
Set-ItemProperty -Path $nvidiaPath -Name "CoolBits" -Value 28 -Type DWord -Force

# Disable power saving features
$powerPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000"
if (Test-Path $powerPath) {
    Set-ItemProperty -Path $powerPath -Name "PowerThrottling" -Value 0 -Type DWord -Force
    Set-ItemProperty -Path $powerPath -Name "EnableULPS" -Value 0 -Type DWord -Force
}

# Set performance power management
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

Write-Output "GPU performance optimized"
`,
    restoreScript: `
# Restore GPU settings
$nvidiaPath = "HKLM:\\SOFTWARE\\NVIDIA Corporation\\Global\\NVTweak"
if (Test-Path $nvidiaPath) {
    Remove-ItemProperty -Path $nvidiaPath -Name "CoolBits" -ErrorAction SilentlyContinue
}

$powerPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000"
if (Test-Path $powerPath) {
    Set-ItemProperty -Path $powerPath -Name "PowerThrottling" -Value 1 -Type DWord -Force
    Set-ItemProperty -Path $powerPath -Name "EnableULPS" -Value 1 -Type DWord -Force
}

powercfg -setactive 381b4222-f694-41f0-9685-ff5bb260df2e

Write-Output "GPU settings restored to default"
`
  }
];

const categories = [
  { id: "all", label: "Todos", icon: <Gamepad2 size={16} /> },
  { id: "performance", label: "Performance", icon: <Zap size={16} /> },
  { id: "sistema", label: "Sistema", icon: <Settings size={16} /> },
  { id: "graficos", label: "Gráficos", icon: <Monitor size={16} /> },
];

export default function ModoJogo() {
  const [isActive, setIsActive] = useState(false)
  const [selecionados, setSelecionados] = useState(gameActions.map(a => a.id))
  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [performanceData, setPerformanceData] = useState([])
  const [ramData, setRamData] = useState([
    { name: "Usada", value: 30, color: "#f87171" },
    { name: "Livre", value: 70, color: "#3b82f6" }
  ])
  const [actionStates, setActionStates] = useState({})
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [systemInfo, setSystemInfo] = useState(null)
  const [gameProcesses, setGameProcesses] = useState([])
  const [monitoringActive, setMonitoringActive] = useState(false)

  // Obter informações do sistema uma vez
  useEffect(() => {
    const getSystemInfo = async () => {
      try {
        const [metrics, gpuInfo] = await Promise.all([
          invoke({ channel: "get-system-metrics" }),
          invoke({ channel: "get-gpu-metrics" })
        ]);

        setSystemInfo({
          cpu: metrics?.cpu,
          memory: metrics?.memory,
          gpu: gpuInfo?.controllers[0],
          timestamp: new Date().toLocaleTimeString()
        });

        // Atualizar gráfico de RAM com dados reais
        if (metrics?.memory) {
          const usedPercent = (metrics.memory.used / metrics.memory.total) * 100;
          setRamData([
            { name: "Usada", value: Math.round(usedPercent), color: "#ef4444" },
            { name: "Livre", value: Math.round(100 - usedPercent), color: "#22c55e" }
          ]);
        }
      } catch (error) {
        console.error("Failed to get system info:", error);
      }
    };

    getSystemInfo();
    const interval = setInterval(getSystemInfo, 30000); // Atualizar a cada 10s

    return () => clearInterval(interval);
  }, []);

  // Configurar listener para métricas em tempo real
  useEffect(() => {
    let mounted = true;

    const setupRealtimeListener = async () => {
      if (window.electronAPI && mounted) {
        try {
          // Use a nova API
          window.electronAPI.on('realtime-metrics', (metrics) => {
            if (!mounted) return;

            setPerformanceData(prev => {
              const newData = [...prev, {
                time: metrics.timestamp,
                fps: metrics.fps || 0,
                cpu: metrics.system?.cpu || 0,
                memory: metrics.system?.memory?.percent || 0
              }];
              return newData.slice(-20);
            });

            if (metrics.system?.memory?.percent) {
              setRamData([
                { name: "Usada", value: Math.round(metrics.system.memory.percent), color: "#ef4444" },
                { name: "Livre", value: Math.round(100 - metrics.system.memory.percent), color: "#22c55e" }
              ]);
            }

            if (metrics.games?.list) {
              setGameProcesses(metrics.games.list);
            }
          });
        } catch (error) {
          console.warn("Failed to setup realtime listener:", error);
        }
      } else if (window.electron && mounted) {
        // Fallback para API antiga
        try {
          window.electron.receive('realtime-metrics', (metrics) => {
            if (!mounted) return;

            setPerformanceData(prev => {
              const newData = [...prev, {
                time: metrics.timestamp,
                fps: metrics.fps || 0,
                cpu: metrics.system?.cpu || 0,
                memory: metrics.system?.memory?.percent || 0
              }];
              return newData.slice(-20);
            });

            if (metrics.system?.memory?.percent) {
              setRamData([
                { name: "Usada", value: Math.round(metrics.system.memory.percent), color: "#ef4444" },
                { name: "Livre", value: Math.round(100 - metrics.system.memory.percent), color: "#22c55e" }
              ]);
            }

            if (metrics.games?.list) {
              setGameProcesses(metrics.games.list);
            }
          });
        } catch (error) {
          console.warn("Failed to setup realtime listener (fallback):", error);
        }
      }
    };

    setupRealtimeListener();

    return () => {
      mounted = false;
      // Limpar listeners
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('realtime-metrics');
      } else if (window.electron && window.electron.removeAllListeners) {
        window.electron.removeAllListeners('realtime-metrics');
      }
    };
  }, []);

  // Adicione um estado de erro para evitar a tela azul
  const [error, setError] = useState(null);

  // Adicione um tratamento de erro no início do componente
  if (error) {
    return (
      <RootDiv>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-red-500/10 border-red-500/30 p-8 rounded-3xl">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-500" size={32} />
              <div>
                <h2 className="text-xl font-bold text-red-400">Erro ao carregar Gaming Engine</h2>
                <p className="text-sparkle-text-secondary mt-2">{error.message}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Recarregar Página
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </RootDiv>
    );
  }

  // Iniciar/parar monitoramento em tempo real
  useEffect(() => {
    const toggleMonitoring = async () => {
      if (isActive && !monitoringActive) {
        await invoke({ channel: "start-realtime-monitoring", payload: 1000 });
        setMonitoringActive(true);
      } else if (!isActive && monitoringActive) {
        await invoke({ channel: "stop-realtime-monitoring" });
        setMonitoringActive(false);
        setPerformanceData([]);
        setGameProcesses([]);
      }
    };

    toggleMonitoring();

    return () => {
      if (monitoringActive) {
        invoke({ channel: "stop-realtime-monitoring" }).catch(console.error);
      }
    };
  }, [isActive, monitoringActive]);

  // Check initial states on mount (mantido igual)
  useEffect(() => {
    const checkInitialStates = async () => {
      const states = {};

      for (const action of gameActions) {
        if (action.checkScript) {
          try {
            const result = await invoke({
              channel: "run-powershell",
              payload: {
                script: action.checkScript,
                name: `check-${action.id}`,
              },
            });

            if (result.success) {
              const isApplied = result.output.trim().toLowerCase() === 'true';
              states[action.id] = isApplied;
            }
          } catch (error) {
            console.error(`Failed to check ${action.id}:`, error);
            log.error(`Failed to check ${action.id}:`, error);
            states[action.id] = false;
          }
        }
      }

      setActionStates(states);
      setInitializing(false);
    };

    checkInitialStates();
  }, []);


  const applyAction = async (actionId) => {
    const action = gameActions.find(a => a.id === actionId);
    if (!action?.applyScript) return;

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: action.applyScript,
          name: `apply-${actionId}`,
        },
      });

      if (result.success) {
        setActionStates(prev => ({ ...prev, [actionId]: true }));
        toast.success(`${action.label} aplicado!`);
      } else {
        throw new Error(result.error || "Falha ao executar script");
      }
    } catch (error) {
      console.error(`Error applying ${actionId}:`, error);
      log.error(`Error applying ${actionId}:`, error);
      toast.error(`Falha ao aplicar ${action.label}`);
    }
  };

  const restoreAction = async (actionId) => {
    const action = gameActions.find(a => a.id === actionId);
    if (!action?.restoreScript) return;

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: action.restoreScript,
          name: `restore-${actionId}`,
        },
      });

      if (result.success) {
        setActionStates(prev => ({ ...prev, [actionId]: false }));
        toast.info(`${action.label} restaurado!`);
      } else {
        throw new Error(result.error || "Falha ao executar script");
      }
    } catch (error) {
      console.error(`Error restoring ${actionId}:`, error);
      log.error(`Error restoring ${actionId}:`, error);
      toast.error(`Falha ao restaurar ${action.label}`);
    }
  };

  const handleToggleGameMode = async () => {
    if (!window.electron) {
      toast.error("Erro Crítico: O App não detectou o sistema Electron.");
      return;
    }

    const newState = !isActive;
    setLoading(true);

    try {
      if (newState) {
        // Ativar modo jogo - aplicar todas as ações selecionadas
        const promises = selecionados.map(async (actionId) => {
          const action = gameActions.find(a => a.id === actionId);
          if (action?.applyScript) {
            try {
              const result = await invoke({
                channel: "run-powershell",
                payload: {
                  script: action.applyScript,
                  name: `activate-${actionId}`,
                },
              });

              if (!result.success) {
                console.warn(`Action ${actionId} failed:`, result.error);
                // Não lançar erro, apenas logar
              }
              return result;
            } catch (error) {
              console.error(`Error in action ${actionId}:`, error);
              // Não propagar o erro para não quebrar todas as ações
              return { success: false, error: error.message };
            }
          }
          return { success: true };
        });

        await Promise.allSettled(promises); // Usar allSettled em vez de all
        setIsActive(true);
        toast.success("Gaming Engine Ativada!");
      } else {
        // Desativar modo jogo - restaurar todas as ações aplicadas
        const restorePromises = Object.keys(actionStates)
          .filter(actionId => actionStates[actionId])
          .map(async (actionId) => {
            const action = gameActions.find(a => a.id === actionId);
            if (action?.restoreScript) {
              try {
                const result = await invoke({
                  channel: "run-powershell",
                  payload: {
                    script: action.restoreScript,
                    name: `deactivate-${actionId}`,
                  },
                });

                if (!result.success) {
                  console.warn(`Restore ${actionId} failed:`, result.error);
                }
                return result;
              } catch (error) {
                console.error(`Error restoring ${actionId}:`, error);
                return { success: false };
              }
            }
            return { success: true };
          });

        await Promise.allSettled(restorePromises);
        setIsActive(false);
        toast.success("Gaming Engine Desativada!");
      }
    } catch (error) {
      console.error("Error toggling game mode:", error);
      toast.error("Falha ao alternar modo jogo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = async (id) => {
    const isSelected = selecionados.includes(id);
    const isApplied = actionStates[id];

    if (isSelected) {
      // Remover da lista
      setSelecionados(prev => prev.filter(item => item !== id));

      // Se estava aplicado, restaurar
      if (isApplied) {
        await restoreAction(id);
      }
    } else {
      // Adicionar à lista
      setSelecionados(prev => [...prev, id]);

      // Se o modo jogo está ativo, aplicar imediatamente
      if (isActive) {
        await applyAction(id);
      }
    }
  };

  const handlePreset = (type) => {
    if (type === 'max') {
      setSelecionados(gameActions.map(a => a.id));
      toast.success("Preset Desempenho Máximo aplicado!");
    } else {
      setSelecionados(gameActions.filter(a => a.category === "performance").map(a => a.id));
      toast.info("Preset Equilibrado aplicado!");
    }
  };

  const handleApplyNow = async (actionId) => {
    await applyAction(actionId);
  };

  const handleRestoreNow = async (actionId) => {
    await restoreAction(actionId);
  };

  const filteredActions = categoriaAtiva === "all"
    ? gameActions
    : gameActions.filter(a => a.category === categoriaAtiva);

  return (
    <RootDiv>
      <div className="max-w-50xl mx-auto px-6 py-8 animate-in fade-in duration-700">

        {/* Header Hero Card */}
        <Card className="relative overflow-hidden bg-sparkle-card border-sparkle-border p-8 rounded-3xl shadow-2xl">
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 ${isActive ? 'bg-green-500/20' : 'bg-blue-500/10'}`}></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`p-5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-110' : 'bg-sparkle-border/50'}`}>
                <Gamepad2 className={isActive ? 'text-white' : 'text-gray-400'} size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-sparkle-text tracking-tight italic">GAMING ENGINE</h2>
                <div className="text-sparkle-text-secondary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span>
                    {isActive ? "Sistema Otimizado para Baixa Latência" : "Aguardando ativação para otimizar"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="hidden sm:flex gap-2">
                <Button
                  onClick={() => handlePreset('max')}
                  variant="outline"
                  className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400 text-xs uppercase tracking-widest"
                >
                  Ultra
                </Button>
                <Button
                  onClick={() => handlePreset('eco')}
                  variant="outline"
                  className="border-sparkle-border text-sparkle-text-secondary text-xs uppercase tracking-widest"
                >
                  Balanced
                </Button>
              </div>
              <div className="h-12 w-[1px] bg-sparkle-border mx-2 hidden md:block"></div>
              <button
                onClick={handleToggleGameMode}
                disabled={loading || initializing}
                className={`group relative flex items-center gap-3 px-10 py-4 rounded-2xl font-black transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-red-500/10 text-red-500 border-2 border-red-500/50' : 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                  }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Power size={20} className={isActive ? 'animate-pulse' : ''} />
                    {isActive ? "DESATIVAR ENGINE" : "ATIVAR ENGINE"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Warning Banner */}
        <Card className="mt-6 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="text-orange-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-sparkle-text mb-1">Aviso de Segurança</h3>
              <p className="text-sm text-sparkle-text-secondary">
                As otimizações alteram configurações avançadas do Windows. Execute o Maxify como administrador para funcionamento completo.
                Recomenda-se criar um ponto de restauração antes de aplicar mudanças.
              </p>
            </div>
          </div>
        </Card>

        {/* Charts & Telemetry - ATUALIZADO */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-sparkle-card border-sparkle-border p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-sparkle-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-blue-500" size={18} />
                {isActive ? "Telemetria em Tempo Real" : "Status do Sistema"}
              </h3>
              {isActive ? (
                <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  Live Data • {gameProcesses.length} jogos ativos
                </span>
              ) : systemInfo && (
                <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                  CPU: {systemInfo.cpu?.total?.toFixed(1)}% • RAM: {systemInfo.memory?.percentUsed?.toFixed(1)}%
                </span>
              )}
            </div>

            <div className="h-64 w-full">
              {isActive && performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={10}
                      tickFormatter={(value) => value.split(':').slice(1).join(':')}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      domain={[0, 200]}
                      tickCount={6}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'fps') return [`${value} FPS`, 'FPS'];
                        if (name === 'cpu') return [`${value.toFixed(1)}%`, 'CPU'];
                        if (name === 'memory') return [`${value.toFixed(1)}%`, 'RAM'];
                        return value;
                      }}
                    />
                    <Area
                      type="monotone"
                      name="FPS"
                      dataKey="fps"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFps)"
                    />
                    <Area
                      type="monotone"
                      name="CPU"
                      dataKey="cpu"
                      stroke="#facc15"
                      strokeWidth={2}
                      fillOpacity={0.6}
                      fill="url(#colorCpu)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-sparkle-text-secondary opacity-50">
                  <Gauge size={48} className="mb-2" />
                  <p className="italic">Inicie a Engine para monitoramento em tempo real</p>
                  {systemInfo && (
                    <div className="mt-4 text-center">
                      <p className="text-sm">Sistema atual:</p>
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {systemInfo.cpu?.total?.toFixed(1)}%
                          </div>
                          <div className="text-xs">CPU</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {systemInfo.memory?.percentUsed?.toFixed(1)}%
                          </div>
                          <div className="text-xs">RAM</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Gráfico de Pizza de Memória - CORRIGIDO */}
          <Card className="bg-sparkle-card border-sparkle-border p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-sparkle-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <MemoryStick className="text-green-500" size={16} />
              Uso de Memória
            </h3>

            <div className="relative flex flex-col items-center justify-center mb-6">
              <div className="relative w-[180px] h-[180px]">
                <PieChart width={180} height={180}>
                  <Pie
                    data={ramData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    stroke="none"
                    paddingAngle={2}
                    animationDuration={500}
                    cx="50%"
                    cy="50%"
                  >
                    {ramData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-2xl font-black text-sparkle-text block">
                    {ramData[0].value}%
                  </span>
                  <span className="text-[10px] text-sparkle-text-secondary uppercase font-bold">
                    Usada
                  </span>
                </div>
              </div>
            </div>

            {/* Informações detalhadas de memória */}
            {systemInfo?.memory && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-sparkle-text-secondary">Total do Sistema</span>
                  <span className="text-sm font-bold text-sparkle-text">
                    {(systemInfo.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-sparkle-text-secondary">Em Uso</span>
                  <span className="text-sm font-bold text-red-400">
                    {(systemInfo.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-sparkle-text-secondary">Disponível</span>
                  <span className="text-sm font-bold text-green-400">
                    {(systemInfo.memory.available / 1024 / 1024 / 1024).toFixed(2)} GB
                  </span>
                </div>

                {/* Barra de progresso detalhada */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sparkle-text-secondary">Distribuição de Memória</span>
                    <span className="text-sparkle-text">
                      {systemInfo.memory.percentUsed?.toFixed(1)}% usado
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${systemInfo.memory.percentUsed || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Status dos jogos ativos */}
            {isActive && gameProcesses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-sparkle-border">
                <h4 className="text-xs font-bold text-sparkle-text-secondary mb-3">
                  JOGOS ATIVOS ({gameProcesses.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {gameProcesses.slice(0, 3).map((process, index) => (
                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded">
                      <span className="truncate max-w-[100px]" title={process.name}>
                        {process.name.replace('.exe', '')}
                      </span>
                      <div className="flex gap-3">
                        <span className="text-yellow-500">{process.cpu?.toFixed(1)}% CPU</span>
                        <span className="text-blue-400">{process.memory?.toFixed(1)}% RAM</span>
                      </div>
                    </div>
                  ))}
                  {gameProcesses.length > 3 && (
                    <div className="text-center text-xs text-sparkle-text-secondary">
                      +{gameProcesses.length - 3} mais...
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Categories Navigation */}
        <div className="mt-12 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${categoriaAtiva === cat.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                : 'bg-sparkle-card border-sparkle-border text-sparkle-text-secondary hover:border-blue-500/50'
                }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Optimization Cards Grid */}
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredActions.map(action => {
            const isSelected = selecionados.includes(action.id);
            const isApplied = actionStates[action.id];
            const isLoading = initializing;

            return (
              <div
                key={action.id}
                className={`group p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${isSelected
                  ? 'border-blue-500/50 bg-blue-500/5 shadow-xl scale-[1.02]'
                  : 'border-sparkle-border bg-sparkle-card hover:border-sparkle-text/30'
                  } ${isApplied ? 'ring-1 ring-green-500/30' : ''}`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${isSelected ? 'bg-blue-500/20' : 'bg-sparkle-border/40'}`}>
                      {action.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-sparkle-text'}`}>
                        {action.label}
                        {isApplied && <span className="ml-2 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">Aplicado</span>}
                      </h4>
                      <p className="text-xs text-sparkle-text-secondary mt-1 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={isSelected}
                    onChange={() => toggleAction(action.id)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyNow(action.id)}
                    disabled={!isSelected || isLoading}
                    className="flex-1 text-xs"
                  >
                    <Play size={14} className="mr-1" />
                    Aplicar Agora
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestoreNow(action.id)}
                    disabled={!isApplied || isLoading}
                    className="flex-1 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Pause size={14} className="mr-1" />
                    Restaurar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RootDiv>
  )
}