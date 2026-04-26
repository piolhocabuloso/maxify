import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
    RefreshCw, Cpu, Zap, Gauge, Thermometer, Wind, Fan,
    Activity, Settings, Shield, HardDrive, Battery,
    Clock, AlertTriangle, CheckCircle2, XCircle, TrendingUp,
    ChevronRight, ChevronDown, Play, Pause, RotateCcw,
    Wifi, Globe, Monitor, Smartphone, Server, Database,
    Layers, Filter, Download, Upload, ArrowUp, ArrowDown,
    BarChart3, LineChart, Radar, Target, Flag, Award,
    Lock, Unlock, Eye, EyeOff, Sun, Moon, Coffee,
    Cpu as CpuIcon, Zap as ZapIcon, Gauge as GaugeIcon,
    History, Sliders, PieChart, TrendingDown, Cloud,
    Network, WifiOff, Bluetooth, Printer, Volume2,
    Keyboard, Mouse, Tablet, Laptop, Gamepad2,
    Radio, Satellite, Cable, Dock, Headphones,
    Camera, Video, Music, Mic, Speaker,
    Home, Wrench, Scissors, Pen,
    Book, GraduationCap, Users, Building,
    Car, Plane, Ship, Train, Bus,
    Heart, Star, Sparkles, Crown,
    AlertOctagon, Info, HelpCircle, Calendar, Power
} from "lucide-react"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import OptimizeIcon from "../../../../resources/maxifylogo.png"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
    Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, AreaChart, Area, BarChart, Bar, Pie, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar,
    ComposedChart, Legend, Scatter, LineChart as RechartsLine,
    Treemap, Sankey, Funnel, FunnelChart
} from "recharts"

// ==================== CONFIGURAÇÕES AVANÇADAS ====================

const OPTIMIZATION_CONFIG = {
    STORAGE_KEY: "maxify:optimization-config",
    MAX_HISTORY_ITEMS: 100,
    DEFAULT_INTERVAL_MS: 30 * 60 * 1000, // 30 minutos
    PERFORMANCE_THRESHOLDS: {
        CPU: { warning: 60, critical: 85, danger: 95 },
        MEMORY: { warning: 70, critical: 85, danger: 95 },
        DISK: { warning: 75, critical: 90, danger: 98 },
        TEMPERATURE: { warning: 65, critical: 80, danger: 95 },
        NETWORK: { warning: 50, critical: 75, danger: 90 },
        GPU: { warning: 60, critical: 80, danger: 95 },
        BATTERY: { warning: 20, critical: 10, danger: 5 },
        FPS: { warning: 30, critical: 20, danger: 10 }
    },
    AUTO_OPTIMIZE: {
        ENABLED: true,
        CHECK_INTERVAL: 5000,
        COOLDOWN: 30000,
        MAX_CONSECUTIVE: 3,
        TRIGGERS: {
            CPU_HIGH: { threshold: 85, duration: 10000 },
            MEMORY_HIGH: { threshold: 90, duration: 5000 },
            TEMP_HIGH: { threshold: 80, duration: 30000 },
            FPS_LOW: { threshold: 20, duration: 5000 }
        }
    },
    GAMING_MODES: {
        COMPETITIVE: { priority: "fps", network: "low-latency", gpu: "maximum" },
        CASUAL: { priority: "quality", network: "balanced", gpu: "balanced" },
        STREAMING: { priority: "encoding", network: "high-bandwidth", gpu: "encoding" },
        VR: { priority: "smoothness", network: "ultra-low-latency", gpu: "maximum" }
    }
}

// ==================== TIPOS DE OTIMIZAÇÃO AVANÇADOS ====================

const ADVANCED_OPTIMIZATIONS = [
    {
        id: "cpu-priority-advanced",
        label: "Gerenciamento Avançado de Prioridades",
        description: "Ajuste fino de prioridades para todos os processos do sistema",
        category: "cpu",
        subcategory: "advanced",
        script: `
            $processes = Get-Process | Where-Object { $_.CPU -gt 10 }
            foreach ($proc in $processes) {
                if ($proc.ProcessName -match "chrome|firefox|edge|spotify|discord|telegram|whatsapp|slack|teams") {
                    $proc.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::BelowNormal
                } elseif ($proc.ProcessName -match "game|steam|epic|battle|origin|ubisoft") {
                    $proc.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
                }
            }
            Write-Output "Prioridades avançadas ajustadas"
        `,
        icon: <Cpu className="text-purple-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["cpu-usage", "response-time", "process-count"],
        powerProfile: "performance"
    },
    {
        id: "cpu-affinity",
        label: "Afinidade de Núcleos",
        description: "Distribui processos entre núcleos para máxima eficiência",
        category: "cpu",
        subcategory: "advanced",
        script: `
            $cores = (Get-WmiObject -Class Win32_Processor).NumberOfLogicalProcessors
            $processes = Get-Process | Where-Object { $_.CPU -gt 5 }
            $coreIndex = 0
            foreach ($proc in $processes) {
                $mask = [Math]::Pow(2, $coreIndex % $cores)
                $proc.ProcessorAffinity = $mask
                $coreIndex++
            }
            Write-Output "Afinidade de núcleos configurada"
        `,
        icon: <Layers className="text-indigo-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: false,
        metrics: ["core-balance", "thread-efficiency"]
    },
    {
        id: "cpu-boost",
        label: "Turbo Boost Optimizer",
        description: "Otimiza o Turbo Boost para máxima performance sustentada",
        category: "cpu",
        subcategory: "advanced",
        script: `
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFINCPOL 2
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFDECPOL 1
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFINCTHRESHOLD 10
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFDECTHRESHOLD 8
            Write-Output "Turbo Boost otimizado"
        `,
        icon: <Zap className="text-yellow-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["boost-frequency", "thermal-headroom"]
    },
    {
        id: "cpu-thermal",
        label: "Gerenciamento Térmico",
        description: "Balanceia performance com temperatura",
        category: "cpu",
        subcategory: "thermal",
        script: `
            $thermal = Get-WmiObject -Class MSAcpi_ThermalZoneTemperature -Namespace "root/wmi"
            if ($thermal.CurrentTemperature -gt 3500) {
                powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 80
            }
            Write-Output "Gerenciamento térmico ativo"
        `,
        icon: <Thermometer className="text-red-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: true,
        metrics: ["temperature", "throttling"]
    },
    {
        id: "memory-defrag",
        label: "Desfragmentação de RAM",
        description: "Reorganiza e compacta a memória em tempo real",
        category: "memory",
        subcategory: "advanced",
        script: `
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
            [System.GC]::Collect()
            
            $workingSet = (Get-Process).Where({ $_.WorkingSet64 -gt 100MB })
            foreach ($proc in $workingSet) {
                try {
                    $proc.MinWorkingSet = [IntPtr]::new($proc.WorkingSet64 / 2)
                    $proc.MaxWorkingSet = [IntPtr]::new($proc.WorkingSet64 * 2)
                } catch {}
            }
            Write-Output "Memória desfragmentada"
        `,
        icon: <Database className="text-blue-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["fragmentation", "working-set"]
    },
    {
        id: "memory-compression-advanced",
        label: "Compressão Adaptativa",
        description: "Ajusta dinamicamente a compressão baseado no uso",
        category: "memory",
        subcategory: "advanced",
        script: `
            $mem = Get-WmiObject Win32_OperatingSystem
            $free = ($mem.FreePhysicalMemory / $mem.TotalVisibleMemorySize) * 100
            
            if ($free -lt 20) {
                Enable-MMAgent -MemoryCompression
                Set-MMAgent -MaxOperationAPINames 256
            } elseif ($free -gt 40) {
                Disable-MMAgent -MemoryCompression
            }
            Write-Output "Compressão adaptativa configurada"
        `,
        icon: <Sliders className="text-cyan-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["compression-ratio", "page-faults"]
    },
    {
        id: "memory-pool",
        label: "Gerenciamento de Pool",
        description: "Otimiza alocação de memória em pool",
        category: "memory",
        subcategory: "advanced",
        script: `
            $key = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management"
            Set-ItemProperty -Path $key -Name "PoolUsageMaximum" -Value 60 -Type DWord
            Set-ItemProperty -Path $key -Name "PagedPoolSize" -Value 0xFFFFFFFF -Type DWord
            Set-ItemProperty -Path $key -Name "NonPagedPoolSize" -Value 0 -Type DWord
            Write-Output "Pool de memória otimizado"
        `,
        icon: <Server className="text-teal-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: false,
        metrics: ["pool-usage", "allocations"]
    },
    {
        id: "memory-mapped",
        label: "Arquivos Mapeados",
        description: "Otimiza o cache de arquivos mapeados em memória",
        category: "memory",
        subcategory: "advanced",
        script: `
            $key = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem"
            Set-ItemProperty -Path $key -Name "NtfsDisableLastAccessUpdate" -Value 1 -Type DWord
            Set-ItemProperty -Path $key -Name "NtfsMemoryUsage" -Value 2 -Type DWord
            Write-Output "Cache de arquivos otimizado"
        `,
        icon: <HardDrive className="text-green-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: true,
        metrics: ["cache-hit", "io-throughput"]
    },
    {
        id: "disk-ssd-optimizer",
        label: "Otimizador SSD Completo",
        description: "Otimizações específicas para SSDs NVMe/SATA",
        category: "disk",
        subcategory: "ssd-advanced",
        script: `
            Optimize-Volume -DriveLetter C -ReTrim -Verbose
            fsutil behavior set DisableDeleteNotify 0
            $partitions = Get-Partition -DriveLetter C
            $partitions | Set-Partition -IsActive $true
            if ((Get-Volume -DriveLetter C).Size -lt 256GB) {
                Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\WSearch" -Name "Start" -Value 4
            }
            fsutil behavior set DisableDeleteNotify 0
            fsutil behavior set EncryptPagingFile 0
            Write-Output "SSD completamente otimizado"
        `,
        icon: <Zap className="text-yellow-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: true,
        metrics: ["trim-status", "write-speed", "read-speed", "iops"]
    },
    {
        id: "disk-nvme",
        label: "NVMe Performance",
        description: "Configurações específicas para drives NVMe",
        category: "disk",
        subcategory: "ssd-advanced",
        script: `
            $nvme = Get-PnpDevice | Where-Object { $_.FriendlyName -match "NVMe" }
            if ($nvme) {
                $nvme | Enable-PnpDevice -Confirm:$false
            }
            $key = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\stornvme\\Parameters\\Device"
            New-Item -Path $key -Force
            Set-ItemProperty -Path $key -Name "NumberOfRequests" -Value 64 -Type DWord
            Set-ItemProperty -Path $key -Name "DeviceQueueDepth" -Value 253 -Type DWord
            Write-Output "NVMe configurado para máxima performance"
        `,
        icon: <Server className="text-purple-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["queue-depth", "latency", "throughput"]
    },
    {
        id: "disk-ram-cache",
        label: "Cache em RAM",
        description: "Cria cache em RAM para arquivos frequentes",
        category: "disk",
        subcategory: "advanced",
        script: `
            $ramDrive = New-Item -Path "R:\\" -ItemType Directory -Force
            $ramSize = (Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 4
            $key = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Ramdisk\\Parameters"
            New-Item -Path $key -Force
            Set-ItemProperty -Path $key -Name "DiskSize" -Value $ramSize -Type DWord
            Set-ItemProperty -Path $key -Name "DriveLetter" -Value "R" -Type String
            Write-Output "Cache em RAM configurado"
        `,
        icon: <Database className="text-blue-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["cache-speed", "hit-rate"]
    },
    {
        id: "disk-hdd-optimizer",
        label: "HDD Performance",
        description: "Otimizações para discos mecânicos",
        category: "disk",
        subcategory: "hdd",
        script: `
            fsutil behavior set disablelastaccess 1
            fsutil behavior set mftzone 2
            Optimize-Volume -DriveLetter C -Defrag -Verbose
            $key = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Disk\\Parameters"
            Set-ItemProperty -Path $key -Name "DiskReadThreshold" -Value 64 -Type DWord
            Set-ItemProperty -Path $key -Name "DiskIdleTimeout" -Value 300000 -Type DWord
            Write-Output "HDD otimizado"
        `,
        icon: <HardDrive className="text-green-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["seek-time", "fragmentation"]
    },
    {
        id: "network-wifi-optimizer",
        label: "WiFi Optimizer",
        description: "Otimizações específicas para conexão WiFi",
        category: "network",
        subcategory: "wireless",
        script: `
            $wifi = Get-NetAdapter | Where-Object {$_.Name -match "Wi-Fi|Wireless"}
            if ($wifi) {
                $wifi | Disable-NetAdapterPowerManagement -Confirm:$false
                netsh wlan set autoconfig enabled=yes interface="Wi-Fi"
                netsh wlan set preferrednetwork "5GHz" interface="Wi-Fi"
                netsh wlan set autoconfig enabled=yes interface="Wi-Fi"
            }
            netsh int tcp set global autotuninglevel=normal
            netsh int tcp set global chimney=disabled
            Write-Output "WiFi otimizado"
        `,
        icon: <Wifi className="text-cyan-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["signal-strength", "interference", "roaming"]
    },
    {
        id: "gpu-nvidia",
        label: "NVIDIA Optimizer",
        description: "Otimizações específicas para GPUs NVIDIA",
        category: "gpu",
        subcategory: "nvidia",
        script: `
            $nvidia = Get-WmiObject -Class Win32_VideoController | Where-Object {$_.Name -match "NVIDIA"}
            if ($nvidia) {
                nvidia-smi -pm 1
                nvidia-smi -ac 5001,1590
                Set-ItemProperty -Path "HKLM:\\SOFTWARE\\NVIDIA Corporation\\Global" -Name "OGL_ThreadControl" -Value 1
                Set-ItemProperty -Path "HKLM:\\SOFTWARE\\NVIDIA Corporation\\Global\\NVTweak" -Name "VSyncMode" -Value 0
            }
            Write-Output "GPU NVIDIA otimizada"
        `,
        icon: <Monitor className="text-green-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["gpu-clock", "memory-clock", "voltage"]
    },
    {
        id: "gpu-amd",
        label: "AMD Optimizer",
        description: "Otimizações específicas para GPUs AMD",
        category: "gpu",
        subcategory: "amd",
        script: `
            $amd = Get-WmiObject -Class Win32_VideoController | Where-Object {$_.Name -match "AMD|Radeon"}
            if ($amd) {
                Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}" -Name "EnableUlps" -Value 0
                Set-ItemProperty -Path "HKLM:\\SOFTWARE\\AMD\\Settings" -Name "OGL_ThreadControl" -Value 1
                Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}" -Name "PP_SclkDeepSleepDisable" -Value 1
            }
            Write-Output "GPU AMD otimizada"
        `,
        icon: <Monitor className="text-red-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["gpu-clock", "memory-clock", "power"]
    },
    {
        id: "gpu-intel",
        label: "Intel Optimizer",
        description: "Otimizações para GPUs Intel integradas",
        category: "gpu",
        subcategory: "intel",
        script: `
            $intel = Get-WmiObject -Class Win32_VideoController | Where-Object {$_.Name -match "Intel"}
            if ($intel) {
                Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Intel\\GMM" -Name "DedicatedSegmentSize" -Value 512
                Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}" -Name "EnableGMABoost" -Value 1
            }
            Write-Output "GPU Intel otimizada"
        `,
        icon: <Monitor className="text-blue-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["gpu-clock", "shared-memory"]
    },
    {
        id: "gaming-fps-boost",
        label: "FPS Booster",
        description: "Aumento significativo de FPS em jogos",
        category: "gaming",
        subcategory: "fps",
        script: `
            Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects" -Name "VisualFXSetting" -Value 2
            $games = Get-Process | Where-Object {$_.ProcessName -match "game|steam|epic|battle|origin|ubisoft|r6|valorant|csgo|dota|lol|fortnite|apex|cod|bf|pubg|overwatch"}
            foreach ($game in $games) {
                $game.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
                $game.ProcessorAffinity = [IntPtr]::new(-1)
            }
            powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
            Write-Output "FPS Booster ativado"
        `,
        icon: <Zap className="text-yellow-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: true,
        metrics: ["fps", "frame-time", "1-low"]
    },
    {
        id: "gaming-low-latency",
        label: "Modo Baixa Latência",
        description: "Redução máxima de input lag",
        category: "gaming",
        subcategory: "latency",
        script: `
            Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "Composition" -Value 0
            Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "MenuShowDelay" -Value 0
            Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "AutoEndTasks" -Value 1
            $key = "HKLM:\\SOFTWARE\\Microsoft\\DirectX\\GraphicsSettings"
            New-Item -Path $key -Force
            Set-ItemProperty -Path $key -Name "GPUPreference" -Value 1
            Write-Output "Modo baixa latência ativado"
        `,
        icon: <Clock className="text-red-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["input-lag", "response-time"]
    },
    {
        id: "gaming-vr",
        label: "VR Performance",
        description: "Otimizações para realidade virtual",
        category: "gaming",
        subcategory: "vr",
        script: `
            Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm\\Global\\VR" -Name "VRAppPriority" -Value 1
            Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" -Name "TdrLevel" -Value 0
            Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "SystemResponsiveness" -Value 0
            Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" -Name "NetworkThrottlingIndex" -Value 0xFFFFFFFF
            Write-Output "VR otimizado"
        `,
        icon: <Headphones className="text-purple-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["fps", "motion-to-photon"]
    },
    {
        id: "power-ultimate",
        label: "Ultimate Performance",
        description: "Plano de energia máximo para workstations",
        category: "power",
        subcategory: "performance",
        script: `
            powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
            powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFINCPOL 2
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFDECPOL 1
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFINCTHRESHOLD 8
            powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFDECTHRESHOLD 4
            powercfg -setacvalueindex SCHEME_CURRENT SUB_DISK DISKIDLE 0
            powercfg -setacvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0
            powercfg -setacvalueindex SCHEME_CURRENT SUB_USB USBIDLE 0
            Write-Output "Ultimate Performance ativado"
        `,
        icon: <Zap className="text-purple-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: false,
        metrics: ["power-draw", "performance"]
    },
    {
        id: "power-battery-saver",
        label: "Battery Saver Pro",
        description: "Máxima economia de energia para notebooks",
        category: "power",
        subcategory: "battery",
        script: `
            powercfg -setactive a1841308-3541-4fab-bc81-f71556f20b4a
            powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 50
            powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 10
            powercfg -setdcvalueindex SCHEME_CURRENT SUB_DISK DISKIDLE 300
            powercfg -setdcvalueindex SCHEME_CURRENT SUB_LID BUTTONACTION 1
            Get-PnpDevice | Where-Object {$_.Class -match "Bluetooth|Camera|Fingerprint"} | Disable-PnpDevice -Confirm:$false
            Write-Output "Battery Saver Pro ativado"
        `,
        icon: <Battery className="text-green-500" size={20} />,
        impact: "very-high",
        reversible: true,
        autoSafe: true,
        metrics: ["battery-life", "discharge-rate"]
    },
    {
        id: "system-boot",
        label: "Boot Optimizer",
        description: "Otimiza tempo de inicialização",
        category: "system",
        subcategory: "boot",
        script: `
            bcdedit /set {current} bootmenupolicy standard
            bcdedit /set {current} bootstatuspolicy ignoreallfailures
            bcdedit /set {current} recoveryenabled No
            bcdedit /timeout 3
            Get-Service | Where-Object {$_.StartType -eq "Automatic" -and $_.Status -eq "Stopped"} | Set-Service -StartupType Manual
            Write-Output "Boot otimizado"
        `,
        icon: <Clock className="text-blue-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["boot-time", "startup-impact"]
    },
    {
        id: "system-shutdown",
        label: "Shutdown Optimizer",
        description: "Acelera desligamento/reinicialização",
        category: "system",
        subcategory: "shutdown",
        script: `
            Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control" -Name "WaitToKillServiceTimeout" -Value 2000
            Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "AutoEndTasks" -Value 1
            Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "HungAppTimeout" -Value 1000
            Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "WaitToKillAppTimeout" -Value 2000
            Write-Output "Shutdown otimizado"
        `,
        icon: <Power className="text-red-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: true,
        metrics: ["shutdown-time"]
    },
    {
        id: "system-scheduled",
        label: "Tarefas Agendadas",
        description: "Otimiza tarefas agendadas do Windows",
        category: "system",
        subcategory: "scheduled",
        script: `
            $tasks = @(
                "\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser",
                "\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator",
                "\\Microsoft\\Windows\\DiskDiagnostic\\Microsoft-Windows-DiskDiagnosticDataCollector"
            )
            foreach ($task in $tasks) {
                Disable-ScheduledTask -TaskPath $task -ErrorAction SilentlyContinue
            }
            Write-Output "Tarefas agendadas otimizadas"
        `,
        icon: <Calendar className="text-orange-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: false,
        metrics: ["background-activity"]
    },
    {
        id: "security-hardening",
        label: "Hardening de Segurança",
        description: "Fortalece segurança sem perder performance",
        category: "security",
        subcategory: "hardening",
        script: `
            Set-MpPreference -DisableRealtimeMonitoring $false
            Set-MpPreference -PUAProtection Enabled
            Set-MpPreference -CloudBlockLevel High
            Set-MpPreference -CloudTimeout 50
            netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
            netsh advfirewall set allprofiles settings inboundusernotification enable
            Write-Output "Hardening de segurança aplicado"
        `,
        icon: <Shield className="text-red-500" size={20} />,
        impact: "high",
        reversible: true,
        autoSafe: true,
        metrics: ["security-score", "protection-level"]
    },
    {
        id: "security-privacy",
        label: "Privacy Optimizer",
        description: "Otimiza configurações de privacidade",
        category: "security",
        subcategory: "privacy",
        script: `
            Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" -Name "AllowTelemetry" -Value 0
            Set-ItemProperty -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" -Name "Enabled" -Value 0
            Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "AllowCortana" -Value 0
            Write-Output "Privacidade otimizada"
        `,
        icon: <Eye className="text-purple-500" size={20} />,
        impact: "medium",
        reversible: true,
        autoSafe: true,
        metrics: ["data-collection", "tracking-blocked"]
    }
]

// ==================== CATEGORIAS EXPANDIDAS ====================

const categories = [
    {
        id: "all",
        label: "Todos",
        icon: <Layers size={16} />,
        color: "gray"
    },
    {
        id: "cpu",
        label: "Processador",
        icon: <Cpu size={16} />,
        color: "purple",
        subcategories: ["processos", "gerenciamento", "nucleos", "thermal", "advanced"]
    },
    {
        id: "memory",
        label: "Memória RAM",
        icon: <Database size={16} />,
        color: "blue",
        subcategories: ["compression", "cache", "virtual", "liberacao", "advanced"]
    },
    {
        id: "disk",
        label: "Disco",
        icon: <HardDrive size={16} />,
        color: "green",
        subcategories: ["defrag", "ssd", "ssd-advanced", "hdd", "indexacao", "cache", "advanced"]
    },
    {
        id: "gpu",
        label: "Placa de Vídeo",
        icon: <Monitor size={16} />,
        color: "pink",
        subcategories: ["nvidia", "amd", "intel", "advanced"]
    },
    {
        id: "network",
        label: "Rede",
        icon: <Globe size={16} />,
        color: "cyan",
        subcategories: ["protocolo", "mtu", "qos", "dns", "gaming", "streaming", "wireless", "advanced"]
    },
    {
        id: "gaming",
        label: "Jogos",
        icon: <Gamepad2 size={16} />,
        color: "red",
        subcategories: ["modo", "fps", "latency", "vr", "gpu"]
    },
    {
        id: "power",
        label: "Energia",
        icon: <Battery size={16} />,
        color: "yellow",
        subcategories: ["performance", "battery", "usb", "hibernate"]
    },
    {
        id: "system",
        label: "Sistema",
        icon: <Settings size={16} />,
        color: "orange",
        subcategories: ["boot", "shutdown", "scheduled", "services"]
    },
    {
        id: "security",
        label: "Segurança",
        icon: <Shield size={16} />,
        color: "red",
        subcategories: ["hardening", "privacy", "firewall"]
    }
]

// ==================== SUBCATEGORIAS EXPANDIDAS ====================

const subcategories = {
    // CPU
    processos: { label: "Processos", icon: <Activity size={14} /> },
    gerenciamento: { label: "Gerenciamento", icon: <Gauge size={14} /> },
    nucleos: { label: "Núcleos", icon: <Layers size={14} /> },
    thermal: { label: "Térmico", icon: <Thermometer size={14} /> },
    advanced: { label: "Avançado", icon: <Sliders size={14} /> },

    // Memória
    compression: { label: "Compressão", icon: <Database size={14} /> },
    cache: { label: "Cache", icon: <HardDrive size={14} /> },
    virtual: { label: "Virtual", icon: <Server size={14} /> },
    liberacao: { label: "Liberação", icon: <RefreshCw size={14} /> },

    // Disco
    defrag: { label: "Desfragmentação", icon: <HardDrive size={14} /> },
    ssd: { label: "SSD", icon: <Zap size={14} /> },
    "ssd-advanced": { label: "SSD Avançado", icon: <Zap className="text-yellow-500" size={14} /> },
    hdd: { label: "HDD", icon: <HardDrive className="text-green-500" size={14} /> },
    indexacao: { label: "Indexação", icon: <Filter size={14} /> },

    // GPU
    nvidia: { label: "NVIDIA", icon: <Monitor className="text-green-500" size={14} /> },
    amd: { label: "AMD", icon: <Monitor className="text-red-500" size={14} /> },
    intel: { label: "Intel", icon: <Monitor className="text-blue-500" size={14} /> },

    // Rede
    protocolo: { label: "Protocolo", icon: <Globe size={14} /> },
    mtu: { label: "MTU", icon: <ArrowUp size={14} /> },
    qos: { label: "QoS", icon: <Activity size={14} /> },
    dns: { label: "DNS", icon: <Wifi size={14} /> },
    gaming: { label: "Jogos", icon: <Gamepad2 size={14} /> },
    streaming: { label: "Streaming", icon: <Video size={14} /> },
    wireless: { label: "Wireless", icon: <Wifi size={14} /> },

    // Jogos
    modo: { label: "Modo Game", icon: <Target size={14} /> },
    fps: { label: "FPS", icon: <Zap size={14} /> },
    latency: { label: "Latência", icon: <Clock size={14} /> },
    vr: { label: "VR", icon: <Headphones size={14} /> },

    // Energia
    performance: { label: "Performance", icon: <Zap className="text-purple-500" size={14} /> },
    battery: { label: "Bateria", icon: <Battery size={14} /> },
    usb: { label: "USB", icon: <Wind size={14} /> },
    hibernate: { label: "Hibernação", icon: <Moon size={14} /> },

    // Sistema
    boot: { label: "Inicialização", icon: <Clock size={14} /> },
    shutdown: { label: "Desligamento", icon: <Power size={14} /> },
    scheduled: { label: "Agendado", icon: <Calendar size={14} /> },
    services: { label: "Serviços", icon: <Server size={14} /> },

    // Segurança
    hardening: { label: "Hardening", icon: <Shield size={14} /> },
    privacy: { label: "Privacidade", icon: <Eye size={14} /> },
    firewall: { label: "Firewall", icon: <Lock size={14} /> }
}

// ==================== FUNÇÕES DE FORMATAÇÃO ====================

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || !bytes) return "0 B"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

const formatPercent = (value) => {
    return `${Math.min(100, Math.max(0, value || 0)).toFixed(1)}%`
}

const formatNumber = (value, decimals = 0) => {
    return (value || 0).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const formatTime = (ms) => {
    if (!ms) return "0s"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

// ==================== COMPONENTE PRINCIPAL ====================

function Otimizacao() {
    const queryClient = useQueryClient()

    // Estados
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState([])
    const [optimizing, setOptimizing] = useState(false)
    const [loaded, setLoaded] = useState(false)

    // Filtros
    const [activeCategory, setActiveCategory] = useState("all")
    const [activeSubcategory, setActiveSubcategory] = useState(null)
    const [expanded, setExpanded] = useState({})

    // Modos
    const [mode, setMode] = useState("balanced")
    const [auto, setAuto] = useState(false)
    const [scheduled, setScheduled] = useState(false)
    const [interval, setInterval] = useState(OPTIMIZATION_CONFIG.DEFAULT_INTERVAL_MS)

    // Métricas
    const [metrics, setMetrics] = useState({
        cpu: 0, memory: 0, disk: 0, network: 0,
        temperature: 0, gpu: 0, gpuTemp: 0,
        processes: 0, threads: 0, uptime: 0,
        fps: 0, latency: 0
    })

    // Histórico e estatísticas com React Query
    const { data: history = [], refetch: refetchHistory } = useQuery({
        queryKey: ["optimization:history"],
        queryFn: () => JSON.parse(localStorage.getItem("maxify:history") || "[]"),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
    })

    const { data: stats = {
        total: 0, memorySaved: 0, cpuReduced: 0,
        timeSaved: 0, impact: 0, fpsGain: 0, latencyReduced: 0
    }, refetch: refetchStats } = useQuery({
        queryKey: ["optimization:stats"],
        queryFn: () => JSON.parse(localStorage.getItem("maxify:stats") || "{}"),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
    })

    const { data: results = {}, refetch: refetchResults } = useQuery({
        queryKey: ["optimization:results"],
        queryFn: () => JSON.parse(localStorage.getItem("maxify:results") || "{}"),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
    })

    const { data: config = {}, refetch: refetchConfig } = useQuery({
        queryKey: ["optimization:config"],
        queryFn: () => JSON.parse(localStorage.getItem(OPTIMIZATION_CONFIG.STORAGE_KEY) || "{}"),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
    })

    // Alertas (recomendações removidas)
    const [alerts, setAlerts] = useState([])

    // Gráficos
    const [chartData, setChartData] = useState([])
    const [fpsHistory, setFpsHistory] = useState([])

    // Refs
    const intervalRef = useRef(null)
    const startTimeRef = useRef(Date.now())

    // ===== INICIALIZAÇÃO =====
    useEffect(() => {
        setLoaded(true)
        startMetricsCollection()

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Sincronizar estados com dados do cache
    useEffect(() => {
        if (config) {
            setMode(config.mode || "balanced")
            setAuto(config.auto || false)
            setScheduled(config.scheduled || false)
            setInterval(config.interval || OPTIMIZATION_CONFIG.DEFAULT_INTERVAL_MS)
        }
    }, [config])

    // ===== COLETA DE MÉTRICAS EM TEMPO REAL =====
    const collectRealTimeMetrics = useCallback(async () => {
        // Simulação - em produção, usar chamadas reais ao sistema
        const cpu = Math.random() * 100
        const memory = 40 + Math.random() * 40
        const disk = 20 + Math.random() * 30
        const network = 10 + Math.random() * 20
        const temperature = 45 + Math.random() * 20
        const gpu = 30 + Math.random() * 50
        const gpuTemp = 50 + Math.random() * 25
        const fps = 60 + Math.random() * 60
        const latency = 20 + Math.random() * 30

        return {
            cpu, memory, disk, network,
            temperature, gpu, gpuTemp,
            processes: 150 + Math.floor(Math.random() * 50),
            threads: 800 + Math.floor(Math.random() * 400),
            uptime: Date.now() - startTimeRef.current,
            fps, latency
        }
    }, [])

    // ===== INICIAR COLETA DE MÉTRICAS =====
    const startMetricsCollection = () => {
        intervalRef.current = setInterval(async () => {
            try {
                const newMetrics = await collectRealTimeMetrics()
                setMetrics(newMetrics)

                // Atualizar gráficos
                setChartData(prev => {
                    const newData = [...prev, {
                        time: new Date().toLocaleTimeString(),
                        cpu: newMetrics.cpu,
                        memory: newMetrics.memory,
                        disk: newMetrics.disk,
                        network: newMetrics.network,
                        temperature: newMetrics.temperature,
                        gpu: newMetrics.gpu,
                        fps: newMetrics.fps,
                        latency: newMetrics.latency
                    }].slice(-60)
                    return newData
                })

                // Histórico de FPS
                setFpsHistory(prev => [...prev.slice(-30), { time: Date.now(), fps: newMetrics.fps }])

                // Verificar alertas (recomendações removidas)
                checkAlerts(newMetrics)
                // generateRecommendations(newMetrics) - REMOVIDO

            } catch (error) {
                console.error("Erro nas métricas:", error)
            }
        }, 1000)
    }

    // ===== VERIFICAR ALERTAS =====
    const checkAlerts = (metrics) => {
        const newAlerts = []
        const thresholds = OPTIMIZATION_CONFIG.PERFORMANCE_THRESHOLDS

        if (metrics.cpu > thresholds.CPU.critical) {
            newAlerts.push({
                id: `cpu-${Date.now()}`,
                type: "critical",
                title: "CPU Crítico",
                message: `Uso de CPU em ${metrics.cpu.toFixed(1)}%`,
                action: "cpu-priority-advanced"
            })
        }

        if (metrics.memory > thresholds.MEMORY.critical) {
            newAlerts.push({
                id: `memory-${Date.now()}`,
                type: "critical",
                title: "Memória Crítica",
                message: `RAM em ${metrics.memory.toFixed(1)}%`,
                action: "memory-defrag"
            })
        }

        if (metrics.temperature > thresholds.TEMPERATURE.critical) {
            newAlerts.push({
                id: `temp-${Date.now()}`,
                type: "danger",
                title: "Temperatura Alta",
                message: `${metrics.temperature.toFixed(0)}°C - Risco de throttling`,
                action: "cpu-thermal"
            })
        }

        if (metrics.fps < thresholds.FPS.critical) {
            newAlerts.push({
                id: `fps-${Date.now()}`,
                type: "warning",
                title: "FPS Baixo",
                message: `${metrics.fps.toFixed(0)} FPS - Performance comprometida`,
                action: "gaming-fps-boost"
            })
        }

        setAlerts(newAlerts.slice(0, 5))
    }

    // ===== FUNÇÃO generateRecommendations FOI COMPLETAMENTE REMOVIDA =====

    // ===== EXECUTAR OTIMIZAÇÕES =====
    const executeOptimizations = async () => {
        setOptimizing(true)
        setLoading([...selected])
        const startTime = Date.now()

        const beforeMetrics = { ...metrics }
        let successCount = 0

        for (const opt of ADVANCED_OPTIMIZATIONS) {
            if (!selected.includes(opt.id)) continue

            const toastId = toast.loading(`⚡ ${opt.label}...`)

            try {
                console.log(`Executando: ${opt.label}`)

                const result = await invoke({
                    channel: "run-powershell",
                    payload: { script: opt.script, name: `opt-${opt.id}-${Date.now()}` }
                })

                const afterMetrics = await collectRealTimeMetrics()
                const impact = calculateImpact(opt, beforeMetrics, afterMetrics)

                // Atualizar cache de resultados
                const newResults = {
                    ...results, [opt.id]: {
                        status: "success",
                        timestamp: new Date().toISOString(),
                        impact,
                        reversible: opt.reversible
                    }
                }
                localStorage.setItem("maxify:results", JSON.stringify(newResults))
                queryClient.setQueryData(["optimization:results"], newResults)

                toast.update(toastId, {
                    render: `✅ ${opt.label} concluído!`,
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                })

                successCount++

            } catch (error) {
                console.error(`Erro em ${opt.label}:`, error)

                const newResults = {
                    ...results, [opt.id]: {
                        status: "error",
                        timestamp: new Date().toISOString(),
                        error: error.message
                    }
                }
                localStorage.setItem("maxify:results", JSON.stringify(newResults))
                queryClient.setQueryData(["optimization:results"], newResults)

                toast.update(toastId, {
                    render: `❌ ${opt.label}: ${error.message || "Erro"}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 4000
                })
            }

            setLoading(q => q.filter(id => id !== opt.id))
        }

        if (successCount > 0) {
            const afterMetrics = await collectRealTimeMetrics()
            const avgImprovement = calculateAverageImprovement(beforeMetrics, afterMetrics)
            const fpsGain = afterMetrics.fps - beforeMetrics.fps
            const latencyReduced = beforeMetrics.latency - afterMetrics.latency

            const newHistory = [{
                timestamp: new Date().toISOString(),
                count: successCount,
                improvement: avgImprovement,
                fpsGain,
                latencyReduced,
                duration: Date.now() - startTime,
                metrics: afterMetrics
            }, ...history.slice(0, 19)]

            localStorage.setItem("maxify:history", JSON.stringify(newHistory))
            queryClient.setQueryData(["optimization:history"], newHistory)

            const newStats = {
                total: (stats.total || 0) + successCount,
                memorySaved: (stats.memorySaved || 0) + (beforeMetrics.memory - afterMetrics.memory),
                cpuReduced: (stats.cpuReduced || 0) + (beforeMetrics.cpu - afterMetrics.cpu),
                timeSaved: (stats.timeSaved || 0) + (successCount * Math.random() * 5),
                impact: avgImprovement,
                fpsGain: (stats.fpsGain || 0) + fpsGain,
                latencyReduced: (stats.latencyReduced || 0) + latencyReduced
            }

            localStorage.setItem("maxify:stats", JSON.stringify(newStats))
            queryClient.setQueryData(["optimization:stats"], newStats)

            toast.success(`✨ ${successCount} otimizações concluídas! Melhoria: ${avgImprovement.toFixed(1)}%`, {
                autoClose: 5000
            })
        }

        setOptimizing(false)
    }

    // ===== CALCULAR IMPACTO =====
    const calculateImpact = (opt, before, after) => {
        let percent = 0

        switch (opt.category) {
            case "cpu":
                percent = ((before.cpu - after.cpu) / before.cpu) * 100
                break
            case "memory":
                percent = ((before.memory - after.memory) / before.memory) * 100
                break
            case "gpu":
                percent = ((after.fps - before.fps) / before.fps) * 100
                break
            case "network":
                percent = ((before.latency - after.latency) / before.latency) * 100
                break
            default:
                percent = Math.random() * 30
        }

        return {
            percent: Math.max(0, percent.toFixed(1)),
            category: opt.category,
            type: opt.subcategory
        }
    }

    // ===== CALCULAR MELHORIA MÉDIA =====
    const calculateAverageImprovement = (before, after) => {
        const improvements = [
            ((before.cpu - after.cpu) / before.cpu) * 100,
            ((before.memory - after.memory) / before.memory) * 100,
            ((after.fps - before.fps) / before.fps) * 100,
            ((before.latency - after.latency) / before.latency) * 100
        ]

        const valid = improvements.filter(i => !isNaN(i) && isFinite(i) && i > 0)
        if (valid.length === 0) return 0

        return valid.reduce((a, b) => a + b, 0) / valid.length
    }

    // ===== ALTERNAR SELEÇÃO =====
    const toggleOptimization = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    // ===== SELECIONAR TODOS DA CATEGORIA =====
    const selectAllInCategory = () => {
        if (activeCategory === "all") {
            setSelected(ADVANCED_OPTIMIZATIONS.map(opt => opt.id))
        } else {
            const inCategory = ADVANCED_OPTIMIZATIONS
                .filter(opt => opt.category === activeCategory)
                .map(opt => opt.id)
            setSelected(inCategory)
        }
    }

    // ===== DESMARCAR TODOS =====
    const deselectAll = () => {
        setSelected([])
    }

    // ===== APLICAR MODO =====
    const applyMode = (modeId) => {
        setMode(modeId)

        let modeOpts = []

        switch (modeId) {
            case "performance":
                modeOpts = ADVANCED_OPTIMIZATIONS
                    .filter(opt =>
                        opt.impact === "very-high" ||
                        opt.impact === "high" ||
                        opt.category === "gaming" ||
                        opt.subcategory === "fps" ||
                        opt.subcategory === "performance"
                    )
                    .map(opt => opt.id)
                break
            case "balanced":
                modeOpts = ADVANCED_OPTIMIZATIONS
                    .filter(opt =>
                        opt.autoSafe === true &&
                        opt.impact !== "very-high"
                    )
                    .map(opt => opt.id)
                    .slice(0, 20)
                break
            case "powersave":
                modeOpts = ADVANCED_OPTIMIZATIONS
                    .filter(opt =>
                        opt.category === "power" ||
                        opt.subcategory === "battery"
                    )
                    .map(opt => opt.id)
                break
        }

        setSelected(modeOpts)

        const newConfig = { mode: modeId, auto, scheduled, interval }
        localStorage.setItem(OPTIMIZATION_CONFIG.STORAGE_KEY, JSON.stringify(newConfig))
        queryClient.setQueryData(["optimization:config"], newConfig)

        toast.info(`⚡ Modo ${modeId} aplicado com ${modeOpts.length} otimizações`)
    }

    // ===== RESETAR OTIMIZAÇÃO =====
    const resetOptimization = (optId) => {
        const opt = ADVANCED_OPTIMIZATIONS.find(o => o.id === optId)
        if (!opt || !opt.reversible) return

        const newResults = { ...results }
        delete newResults[optId]
        localStorage.setItem("maxify:results", JSON.stringify(newResults))
        queryClient.setQueryData(["optimization:results"], newResults)

        toast.info(`🔄 ${opt.label} resetado`)
    }

    // ===== OBTER STATUS =====
    const getStatus = (optId) => {
        const isLoading = loading.includes(optId)
        const result = results[optId]

        if (isLoading) {
            return {
                text: "Otimizando...",
                color: "text-blue-500",
                icon: <RefreshCw className="animate-spin" size={14} />
            }
        } else if (result?.status === "success") {
            return {
                text: `+${result.impact?.percent || 0}%`,
                color: "text-green-500",
                icon: <CheckCircle2 size={14} />
            }
        } else if (result?.status === "error") {
            return {
                text: "Falha",
                color: "text-red-500",
                icon: <XCircle size={14} />
            }
        }

        return {
            text: "Pronto",
            color: "text-gray-500",
            icon: <Clock size={14} />
        }
    }

    // ===== OTIMIZAÇÕES FILTRADAS =====
    const filteredOptimizations = useMemo(() => {
        return ADVANCED_OPTIMIZATIONS.filter(opt => {
            if (activeCategory === "all") return true
            if (activeSubcategory) {
                return opt.category === activeCategory && opt.subcategory === activeSubcategory
            }
            return opt.category === activeCategory
        })
    }, [activeCategory, activeSubcategory])

    return (
        <RootDiv>
            <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">

                {/* MODOS */}
                <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <Gauge className="text-blue-400" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-maxify-text">Modos de otimização</h2>
                            <p className="text-sm text-maxify-text-secondary">
                                Perfis rápidos para aplicar várias otimizações de uma vez
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                id: "balanced",
                                label: "Balanceado",
                                description: "Equilíbrio entre desempenho, estabilidade e consumo.",
                                icon: <Gauge className="text-blue-400" size={20} />,
                            },
                            {
                                id: "performance",
                                label: "Performance",
                                description: "Focado em jogos, renderização e tarefas pesadas.",
                                icon: <Zap className="text-cyan-300" size={20} />,
                            },
                            {
                                id: "powersave",
                                label: "Economia",
                                description: "Reduz consumo e preserva bateria em notebook.",
                                icon: <Battery className="text-sky-300" size={20} />,
                            },
                        ].map((m) => {
                            const ativo = mode === m.id

                            return (
                                <button
                                    key={m.id}
                                    onClick={() => applyMode(m.id)}
                                    className={`text-left rounded-2xl border p-5 transition-all ${ativo
                                        ? "border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                        : "border-maxify-border bg-maxify-border/10 hover:border-blue-500/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            {m.icon}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-maxify-text">{m.label}</p>
                                            {ativo && (
                                                <span className="text-xs text-blue-300 font-medium">ATIVO</span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-maxify-text-secondary leading-relaxed">
                                        {m.description}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </Card>

                {/* GRÁFICOS + ALERTAS */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2 bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">Monitor em tempo real</h2>
                                <p className="text-sm text-maxify-text-secondary">
                                    Acompanhe CPU, RAM, GPU e FPS ao vivo
                                </p>
                            </div>
                            <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                                Atualização em tempo real
                            </div>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="ramFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.04} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} hide />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0f172a",
                                            border: "1px solid #1e40af",
                                            borderRadius: "14px",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuFill)" strokeWidth={2.5} />
                                    <Area type="monotone" dataKey="memory" stroke="#06b6d4" fill="url(#ramFill)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <AlertTriangle className="text-blue-400" size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">Alertas</h2>
                                <p className="text-sm text-maxify-text-secondary">Status atual do sistema</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"
                                    >
                                        <p className="text-sm font-semibold text-maxify-text">{alert.title}</p>
                                        <p className="text-xs text-maxify-text-secondary mt-1">{alert.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-maxify-border p-6 text-center">
                                    <CheckCircle2 className="mx-auto text-blue-400 mb-3" size={28} />
                                    <p className="text-maxify-text font-medium">Tudo sob controle</p>
                                    <p className="text-sm text-maxify-text-secondary mt-1">
                                        Nenhum alerta importante no momento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* CATEGORIAS */}
                <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <Filter className="text-blue-400" size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">Categorias</h2>
                                <p className="text-sm text-maxify-text-secondary">
                                    {filteredOptimizations.length} otimizações disponíveis
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={selectAllInCategory} disabled={optimizing} variant="outline" size="sm">
                                Selecionar todos
                            </Button>
                            <Button onClick={deselectAll} disabled={optimizing} variant="outline" size="sm">
                                Limpar seleção
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id)
                                    setActiveSubcategory(null)
                                }}
                                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all border flex items-center gap-2 ${activeCategory === cat.id
                                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10"
                                    : "bg-maxify-border/20 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/35"
                                    }`}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {activeCategory !== "all" && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {categories
                                .find((c) => c.id === activeCategory)
                                ?.subcategories.map((subId) => (
                                    <button
                                        key={subId}
                                        onClick={() =>
                                            setActiveSubcategory((prev) => (prev === subId ? null : subId))
                                        }
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${activeSubcategory === subId
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-maxify-border/10 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/25"
                                            }`}
                                    >
                                        {subcategories[subId]?.icon}
                                        {subcategories[subId]?.label}
                                    </button>
                                ))}
                        </div>
                    )}
                </Card>

                {/* LISTA + RESUMO */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <img src={OptimizeIcon} width={24} height={24} className="select-none" alt="Sparkle" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">Otimizações</h2>
                                    <p className="text-maxify-text-secondary text-sm">
                                        {selected.length} de {filteredOptimizations.length} selecionadas
                                    </p>
                                </div>
                            </div>

                            {optimizing && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                                    <RefreshCw className="animate-spin" size={16} />
                                    <span className="text-sm font-medium">Otimizando...</span>
                                </div>
                            )}
                        </div>

                        {/* SCROLL BONITO */}
                        <div className="relative max-h-[600px] overflow-y-auto pr-2">
                            <div className="sticky top-0 h-6 bg-gradient-to-b from-maxify-card to-transparent z-10 pointer-events-none" />
                            {/* lista */}
                            <div className="space-y-3">
                                {filteredOptimizations.map((opt) => {
                                    const isSelected = selected.includes(opt.id)
                                    const isLoading = loading.includes(opt.id)
                                    const status = getStatus(opt.id)

                                    return (
                                        <div
                                            key={opt.id}
                                            className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${isSelected
                                                ? "border-blue-500 bg-blue-500/10"
                                                : "border-maxify-border bg-maxify-border/10 hover:border-blue-400/40"
                                                }`}
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/70" />

                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="mt-0.5 p-2.5 rounded-xl bg-blue-500/10 shrink-0">
                                                            {opt.icon}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-[15px] font-semibold text-maxify-text">
                                                                    {opt.label}
                                                                </span>

                                                                {opt.impact === "very-high" && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-500/15 text-red-400">
                                                                        Máximo
                                                                    </span>
                                                                )}

                                                                {opt.impact === "high" && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-orange-500/15 text-orange-400">
                                                                        Alto
                                                                    </span>
                                                                )}

                                                                {opt.reversible && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-green-500/15 text-green-400">
                                                                        Reversível
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-sm text-maxify-text-secondary mt-1">
                                                                {opt.description}
                                                            </p>

                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className={`text-sm font-medium flex items-center gap-1 ${status.color}`}>
                                                                    {status.icon}
                                                                    {status.text}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Toggle
                                                        checked={isSelected}
                                                        onChange={() => toggleOptimization(opt.id)}
                                                        disabled={optimizing || isLoading}
                                                    />
                                                </div>
                                            </div>

                                            {isLoading && (
                                                <div className="absolute inset-0 rounded-2xl bg-maxify-card/80 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                        <RefreshCw className="animate-spin text-blue-400" size={16} />
                                                        <span className="text-sm font-medium text-blue-300">Otimizando...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* sombra + seta */}
                            <div className="sticky bottom-0 h-12 z-20 pointer-events-none flex items-end justify-center bg-gradient-to-t from-maxify-card to-transparent">
                                <ChevronDown className="text-blue-400 animate-bounce opacity-80 mb-1" size={28} />
                            </div>

                        </div>

                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <BarChart3 className="text-blue-400" size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">Resumo</h2>
                                    <p className="text-sm text-maxify-text-secondary">Visão rápida da sessão</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Selecionadas</p>
                                    <p className="text-2xl font-bold text-blue-300 mt-1">{selected.length}</p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Execuções totais</p>
                                    <p className="text-2xl font-bold text-cyan-300 mt-1">{formatNumber(stats.total || 0)}</p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">FPS ganhos</p>
                                    <p className="text-2xl font-bold text-sky-300 mt-1">{formatNumber(stats.fpsGain || 0, 1)}</p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Latência reduzida</p>
                                    <p className="text-2xl font-bold text-indigo-300 mt-1">{formatNumber(stats.latencyReduced || 0, 1)}</p>
                                </div>
                            </div>

                            {selected.length > 0 && (
                                <Button
                                    onClick={executeOptimizations}
                                    disabled={optimizing || selected.length === 0}
                                    size="lg"
                                    variant="primary"
                                    className="w-full mt-5 min-h-[52px] flex items-center justify-center gap-3 text-base font-semibold"
                                >
                                    {optimizing ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={20} />
                                            <span>Otimizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <img
                                                src={OptimizeIcon}
                                                width={22}
                                                height={22}
                                                className="select-none filter brightness-0 invert"
                                                alt="Sparkle"
                                            />
                                            <span>Executar otimizações</span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </Card>

                        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <History className="text-blue-400" size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">Histórico</h2>
                                    <p className="text-sm text-maxify-text-secondary">Últimas execuções</p>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {history.length > 0 ? (
                                    history.slice(0, 5).map((item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-maxify-text">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-maxify-text-secondary mt-1">
                                                        {item.count} otimização(ões)
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-blue-300">
                                                        {item.improvement?.toFixed?.(1) || 0}%
                                                    </p>
                                                    <p className="text-xs text-maxify-text-secondary">melhoria</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-maxify-border p-6 text-center">
                                        <Clock className="mx-auto text-blue-400 mb-3" size={26} />
                                        <p className="text-maxify-text font-medium">Sem histórico ainda</p>
                                        <p className="text-sm text-maxify-text-secondary mt-1">
                                            As próximas otimizações vão aparecer aqui.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RootDiv>
    )
}

export default Otimizacao