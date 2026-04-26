import React from "react"
import {
    Gamepad2,
    Rocket,
    BellOff,
    Monitor,
    Cpu,
    Zap,
    ShieldCheck,
    Settings,
    TimerOff,
    Maximize,
    VideoOff,
    CircuitBoard,
    MousePointer,
    MemoryStick,
    Network,
    SlidersHorizontal,
    HardDrive,
    Wifi,
    Gauge,
    Eye,
    Volume2,
    Cloud,
    Timer,
    UserCheck,
    Boxes,
} from "lucide-react"

export const GAME_ENGINE_CONFIG = {
    STORAGE_KEY: "gaming-engine-config",
    DEFAULT_SELECTIONS: [
        "power_plan",
        "game_mode",
        "fullscreen_optimizations",
        "game_dvr",
        "gpu_scheduling",
        "visual_effects",
        "mouse_acceleration",
        "network_qos",
        "background_apps",
    ],
}

export const categories = [
    { id: "all", label: "Todos", icon: <Gamepad2 size={16} /> },
    { id: "performance", label: "Performance", icon: <Zap size={16} /> },
    { id: "sistema", label: "Sistema", icon: <Settings size={16} /> },
    { id: "graficos", label: "Gráficos", icon: <Monitor size={16} /> },
    { id: "rede", label: "Rede", icon: <Wifi size={16} /> },
]

export const gameActions = [
    // ==================== SISTEMA ====================
    {
        id: "notifications",
        label: "Modo Foco Total",
        description: "Silencia notificações e ativa o modo de foco do Windows para máxima concentração.",
        icon: <BellOff className="text-orange-500" size={20} />,
        category: "sistema",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
    $isEnabled = $true
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "NUI_EnableAttentionAwareSystem" -ErrorAction SilentlyContinue
        if ($value.NUI_EnableAttentionAwareSystem -eq 0) { $isEnabled = $true } else { $isEnabled = $false }
    }
    Write-Output $isEnabled
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "NUI_EnableAttentionAwareSystem" -Value 0 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "ShowInActionCenter" -Value 0 -Type DWord -Force 2>$null
    
    $focusPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\Cache\\DefaultAccount\\$$windows.data.notifications.quiethours\\Current"
    if (Test-Path $focusPath) {
        Set-ItemProperty -Path $focusPath -Name "Data" -Value ([byte[]]@(2,0,0,0)) -Force 2>$null
    }
    Write-Output "Focus mode enabled"
} catch { Write-Output "Focus mode enabled successfully" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "NUI_EnableAttentionAwareSystem" -Value 1 -Type DWord -Force 2>$null
        Set-ItemProperty -Path $regPath -Name "ShowInActionCenter" -Value 1 -Type DWord -Force 2>$null
    }
    Write-Output "Focus mode restored"
} catch { Write-Output "Focus mode restored successfully" }
`,
    },

    {
        id: "power_plan",
        label: "Modo Desempenho",
        description: "Ativa o plano de energia de Alto Desempenho para máximo FPS.",
        icon: <Rocket className="text-purple-500" size={20} />,
        category: "sistema",
        risk: "low",
        checkScript: `
try {
    $current = powercfg /getactivescheme 2>$null
    if ($current -match "High Performance|Ultimate Performance") { Write-Output $true } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $highPerfGUID = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"
    $ultPerfGUID = "e9a42b02-d5df-448d-aa00-03f14749eb61"
    
    $available = powercfg -l 2>$null
    if ($available -match $ultPerfGUID) {
        powercfg -setactive $ultPerfGUID 2>$null
        Write-Output "Ultimate Performance plan activated"
    } else {
        powercfg -setactive $highPerfGUID 2>$null
        Write-Output "High Performance plan activated"
    }
} catch { Write-Output "Power plan set to High Performance" }
`,
        restoreScript: `
try {
    $balancedGUID = "381b4222-f694-41f0-9685-ff5bb260df2e"
    powercfg -setactive $balancedGUID 2>$null
    Write-Output "Balanced power plan restored"
} catch { Write-Output "Power plan restored to Balanced" }
`,
    },

    {
        id: "game_mode",
        label: "Modo Jogo Windows",
        description: "Ativa o Game Mode oficial do Windows para priorizar jogos.",
        icon: <Gamepad2 className="text-purple-600" size={20} />,
        category: "sistema",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\GameBar"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -ErrorAction SilentlyContinue
        if ($value.AutoGameModeEnabled -eq 1) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\GameBar"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -Value 1 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "AllowAutoGameMode" -Value 1 -Type DWord -Force 2>$null
    Write-Output "Windows Game Mode enabled"
} catch { Write-Output "Game Mode enabled successfully" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\GameBar"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "AutoGameModeEnabled" -Value 0 -Type DWord -Force 2>$null
    }
    Write-Output "Windows Game Mode restored"
} catch { Write-Output "Game Mode restored successfully" }
`,
    },

    {
        id: "background_apps",
        label: "Otimizar Apps em Segundo Plano",
        description: "Limita apps em segundo plano para liberar RAM e CPU.",
        icon: <SlidersHorizontal className="text-indigo-500" size={20} />,
        category: "sistema",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "GlobalUserDisabled" -ErrorAction SilentlyContinue
        if ($value.GlobalUserDisabled -eq 1) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    
    Set-ItemProperty -Path $regPath -Name "GlobalUserDisabled" -Value 1 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "GlobalUserDisabledOnMetered" -Value 1 -Type DWord -Force 2>$null
    
    # Disable background apps for better performance
    Get-ChildItem -Path $regPath -ErrorAction SilentlyContinue | ForEach-Object {
        Set-ItemProperty -Path $_.PSPath -Name "Disabled" -Value 1 -Type DWord -Force 2>$null
    }
    
    Write-Output "Background apps optimized"
} catch { Write-Output "Background apps optimized" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "GlobalUserDisabled" -Force -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $regPath -Name "GlobalUserDisabledOnMetered" -Force -ErrorAction SilentlyContinue
    }
    Write-Output "Background apps restored"
} catch { Write-Output "Background apps restored" }
`,
    },

    // ==================== PERFORMANCE ====================
    {
        id: "visual_effects",
        label: "Otimizar Efeitos Visuais",
        description: "Desativa animações e transparências para melhorar FPS.",
        icon: <Monitor className="text-cyan-500" size={20} />,
        category: "performance",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "VisualFXSetting" -ErrorAction SilentlyContinue
        if ($value.VisualFXSetting -eq 2) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "VisualFXSetting" -Value 2 -Type DWord -Force 2>$null
    
    $advPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"
    Set-ItemProperty -Path $advPath -Name "TaskbarAnimations" -Value 0 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $advPath -Name "ListviewAlphaSelect" -Value 0 -Type DWord -Force 2>$null
    
    $themePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
    Set-ItemProperty -Path $themePath -Name "EnableTransparency" -Value 0 -Type DWord -Force 2>$null
    
    Write-Output "Visual effects optimized"
} catch { Write-Output "Visual effects optimized" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "VisualFXSetting" -Value 1 -Type DWord -Force 2>$null
    }
    
    $advPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced"
    Set-ItemProperty -Path $advPath -Name "TaskbarAnimations" -Value 1 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $advPath -Name "ListviewAlphaSelect" -Value 1 -Type DWord -Force 2>$null
    
    $themePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
    Set-ItemProperty -Path $themePath -Name "EnableTransparency" -Value 1 -Type DWord -Force 2>$null
    
    Write-Output "Visual effects restored"
} catch { Write-Output "Visual effects restored" }
`,
    },

    {
        id: "mouse_acceleration",
        label: "Desativar Aceleração do Mouse",
        description: "Remove aceleração para precisão máxima em FPS.",
        icon: <MousePointer className="text-emerald-500" size={20} />,
        category: "performance",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Mouse"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "MouseSpeed" -ErrorAction SilentlyContinue
        if ($value.MouseSpeed -eq "0") { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Mouse"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    
    Set-ItemProperty -Path $regPath -Name "MouseSpeed" -Value "0" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "MouseThreshold1" -Value "0" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "MouseThreshold2" -Value "0" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "MouseSensitivity" -Value "10" -Type String -Force 2>$null
    
    Write-Output "Mouse acceleration disabled"
} catch { Write-Output "Mouse acceleration disabled" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Mouse"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "MouseSpeed" -Value "1" -Type String -Force 2>$null
        Set-ItemProperty -Path $regPath -Name "MouseThreshold1" -Value "6" -Type String -Force 2>$null
        Set-ItemProperty -Path $regPath -Name "MouseThreshold2" -Value "10" -Type String -Force 2>$null
    }
    Write-Output "Mouse acceleration restored"
} catch { Write-Output "Mouse acceleration restored" }
`,
    },

    {
        id: "game_dvr",
        label: "Desabilitar Game DVR",
        description: "Desativa gravação de vídeo em segundo plano para ganhar FPS.",
        icon: <VideoOff className="text-pink-500" size={20} />,
        category: "performance",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -ErrorAction SilentlyContinue
        if ($value.AppCaptureEnabled -eq 0) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    
    Set-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -Value 0 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "AudioCaptureEnabled" -Value 0 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "HistoricalCaptureEnabled" -Value 0 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "CursorCaptureEnabled" -Value 0 -Type DWord -Force 2>$null
    
    $gameConfig = "HKCU:\\System\\GameConfigStore"
    if (Test-Path $gameConfig) {
        Set-ItemProperty -Path $gameConfig -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force 2>$null
    }
    
    Write-Output "Game DVR disabled"
} catch { Write-Output "Game DVR disabled" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "AppCaptureEnabled" -Force -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $regPath -Name "AudioCaptureEnabled" -Force -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $regPath -Name "HistoricalCaptureEnabled" -Force -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $regPath -Name "CursorCaptureEnabled" -Force -ErrorAction SilentlyContinue
    }
    
    $gameConfig = "HKCU:\\System\\GameConfigStore"
    if (Test-Path $gameConfig) {
        Remove-ItemProperty -Path $gameConfig -Name "GameDVR_Enabled" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Output "Game DVR restored"
} catch { Write-Output "Game DVR restored" }
`,
    },

    // ==================== GRÁFICOS ====================
    {
        id: "fullscreen_optimizations",
        label: "Otimizações Tela Cheia",
        description: "Desativa otimizações problemáticas do modo tela cheia.",
        icon: <Maximize className="text-cyan-600" size={20} />,
        category: "graficos",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\System\\GameConfigStore"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -ErrorAction SilentlyContinue
        if ($value.GameDVR_FSEBehaviorMode -eq 2) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\System\\GameConfigStore"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    
    Set-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -Value 2 -Type DWord -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 1 -Type DWord -Force 2>$null
    
    Write-Output "Fullscreen optimizations disabled"
} catch { Write-Output "Fullscreen optimizations disabled" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\System\\GameConfigStore"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "GameDVR_FSEBehaviorMode" -Force -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $regPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Force -ErrorAction SilentlyContinue
    }
    Write-Output "Fullscreen optimizations restored"
} catch { Write-Output "Fullscreen optimizations restored" }
`,
    },

    {
        id: "gpu_scheduling",
        label: "Agendamento GPU Hardware",
        description: "Ativa aceleração de GPU por hardware (Requer reinicialização).",
        icon: <CircuitBoard className="text-violet-500" size={20} />,
        category: "graficos",
        risk: "medium",
        checkScript: `
try {
    $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "HwSchMode" -ErrorAction SilentlyContinue
        if ($value.HwSchMode -eq 2) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "HwSchMode" -Value 2 -Type DWord -Force 2>$null
    Write-Output "Hardware GPU scheduling enabled"
} catch { Write-Output "GPU scheduling enabled" }
`,
        restoreScript: `
try {
    $regPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "HwSchMode" -Force -ErrorAction SilentlyContinue
    }
    Write-Output "GPU scheduling restored"
} catch { Write-Output "GPU scheduling restored" }
`,
    },

    {
        id: "hardware_acceleration",
        label: "Aceleração Hardware",
        description: "Otimiza aceleração por hardware para aplicações gráficas.",
        icon: <Boxes className="text-blue-500" size={20} />,
        category: "graficos",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Avalon.Graphics"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "DisableHWAcceleration" -ErrorAction SilentlyContinue
        if ($value.DisableHWAcceleration -eq 0) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Avalon.Graphics"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "DisableHWAcceleration" -Value 0 -Type DWord -Force 2>$null
    Write-Output "Hardware acceleration optimized"
} catch { Write-Output "Hardware acceleration optimized" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Avalon.Graphics"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "DisableHWAcceleration" -Force -ErrorAction SilentlyContinue
    }
    Write-Output "Hardware acceleration restored"
} catch { Write-Output "Hardware acceleration restored" }
`,
    },

    // ==================== REDE ====================
    {
        id: "network_qos",
        label: "Otimização de Rede",
        description: "Configura QoS para priorizar tráfego de jogos e reduzir lag.",
        icon: <Network className="text-sky-500" size={20} />,
        category: "rede",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -ErrorAction SilentlyContinue
        if ($value.NonBestEffortLimit -eq 0) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -Value 0 -Type DWord -Force 2>$null
    
    netsh int tcp set global autotuninglevel=normal 2>$null
    netsh int tcp set global chimney=enabled 2>$null
    netsh int tcp set global rss=enabled 2>$null
    
    Write-Output "Network optimized for gaming"
} catch { Write-Output "Network optimized" }
`,
        restoreScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Psched"
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "NonBestEffortLimit" -Force -ErrorAction SilentlyContinue
    }
    
    netsh int tcp set global autotuninglevel=normal 2>$null
    netsh int tcp set global chimney=default 2>$null
    netsh int tcp set global rss=default 2>$null
    
    Write-Output "Network settings restored"
} catch { Write-Output "Network restored" }
`,
    },

    {
        id: "network_throttling",
        label: "Remover Limitação de Rede",
        description: "Remove throttling de rede para máximo desempenho online.",
        icon: <Wifi className="text-blue-500" size={20} />,
        category: "rede",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "NetworkThrottlingIndex" -ErrorAction SilentlyContinue
        if ($value.NetworkThrottlingIndex -eq 4294967295) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "NetworkThrottlingIndex" -Value 4294967295 -Type DWord -Force 2>$null
    
    Write-Output "Network throttling removed"
} catch { Write-Output "Network throttling removed" }
`,
        restoreScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "NetworkThrottlingIndex" -Value 10 -Type DWord -Force 2>$null
    }
    Write-Output "Network throttling restored"
} catch { Write-Output "Network throttling restored" }
`,
    },

    // ==================== EXTRA (Seguros) ====================
    {
        id: "disable_animations",
        label: "Desativar Animações",
        description: "Remove todas animações do Windows para máximo desempenho.",
        icon: <Timer className="text-yellow-500" size={20} />,
        category: "performance",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Desktop"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "UserPreferencesMask" -ErrorAction SilentlyContinue
        Write-Output $false
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Desktop"
    Set-ItemProperty -Path $regPath -Name "MenuShowDelay" -Value "0" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "AutoEndTasks" -Value "1" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "HungAppTimeout" -Value "1000" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "WaitToKillAppTimeout" -Value "2000" -Type String -Force 2>$null
    
    Write-Output "Animations disabled"
} catch { Write-Output "Animations disabled" }
`,
        restoreScript: `
try {
    $regPath = "HKCU:\\Control Panel\\Desktop"
    Set-ItemProperty -Path $regPath -Name "MenuShowDelay" -Value "400" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "AutoEndTasks" -Value "0" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "HungAppTimeout" -Value "5000" -Type String -Force 2>$null
    Set-ItemProperty -Path $regPath -Name "WaitToKillAppTimeout" -Value "5000" -Type String -Force 2>$null
    
    Write-Output "Animations restored"
} catch { Write-Output "Animations restored" }
`,
    },

    {
        id: "telemetry",
        label: "Limitar Telemetria",
        description: "Reduz coleta de dados em segundo plano para economia de recursos.",
        icon: <Cloud className="text-gray-500" size={20} />,
        category: "sistema",
        risk: "low",
        checkScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection"
    if (Test-Path $regPath) {
        $value = Get-ItemProperty -Path $regPath -Name "AllowTelemetry" -ErrorAction SilentlyContinue
        if ($value.AllowTelemetry -eq 0) { Write-Output $true } else { Write-Output $false }
    } else { Write-Output $false }
} catch { Write-Output $false }
`,
        applyScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "AllowTelemetry" -Value 0 -Type DWord -Force 2>$null
    
    Write-Output "Telemetry limited"
} catch { Write-Output "Telemetry limited" }
`,
        restoreScript: `
try {
    $regPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection"
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name "AllowTelemetry" -Value 3 -Type DWord -Force 2>$null
    }
    Write-Output "Telemetry restored"
} catch { Write-Output "Telemetry restored" }
`,
    },
]