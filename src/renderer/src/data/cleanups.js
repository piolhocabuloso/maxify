export const AUTO_CLEAN_CONFIG = {
    DEFAULT_INTERVAL_MS: 60 * 60 * 1000,
    MIN_INTERVAL_MS: 30 * 60 * 1000,
    MAX_INTERVAL_MS: 24 * 60 * 60 * 1000,
    MAX_HISTORY_ITEMS: 50,
    STORAGE_KEY: "maxify:auto-clean-config",
    DEFAULT_SELECTIONS: [
        "temp",
        "user-temp-deep",
        "windows-temp-old",
        "prefetch",
        "windows-update",
        "delivery-optimization",
        "thumbnails",
        "browser-cache",
        "browser-gpu-cache",
        "logs",
        "windows-error-reporting",
        "directx-shader-cache",
        "dns-cache",
        "discord-cache",
        "steam-cache",
    ],
}

export const INTERVAL_OPTIONS = [
    { label: "30 minutos", value: 30 * 60 * 1000 },
    { label: "1 hora", value: 60 * 60 * 1000 },
    { label: "2 horas", value: 2 * 60 * 60 * 1000 },
    { label: "4 horas", value: 4 * 60 * 60 * 1000 },
    { label: "8 horas", value: 8 * 60 * 60 * 1000 },
    { label: "24 horas", value: 24 * 60 * 60 * 1000 },
]

export const categories = [
    { id: "all", label: "Todos", icon: "refresh" },
    { id: "sistema", label: "Sistema", icon: "cpu" },
    { id: "desempenho", label: "Desempenho", icon: "trending" },
    { id: "navegadores", label: "Navegadores", icon: "globe" },
    { id: "privacidade", label: "Privacidade", icon: "shield" },
    { id: "atualizacao", label: "Atualização", icon: "database" },
    { id: "rede", label: "Rede", icon: "wifi" },
    { id: "apps", label: "Apps", icon: "file" },
    { id: "jogos", label: "Jogos", icon: "cpu" },
    { id: "dev", label: "Dev", icon: "file" },
    { id: "seguranca", label: "Segurança", icon: "shieldGreen" },
]

export const cleanups = [
    {
        id: "temp",
        label: "Arquivos Temporários",
        description: "Remove arquivos temporários do usuário e do sistema.",
        script: `
      $paths = @("$env:TEMP", "$env:LOCALAPPDATA\\Temp", "C:\\Windows\\Temp")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "folder",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "user-temp-deep",
        label: "Temp Avançado do Usuário",
        description: "Remove temporários extras dentro do perfil do usuário.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Temp", "$env:APPDATA\\Temp", "$env:USERPROFILE\\AppData\\Local\\Temp")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "folder",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "windows-temp-old",
        label: "Temporários Antigos do Windows",
        description: "Remove temporários antigos, mantendo arquivos recentes para evitar erro de uso.",
        script: `
      $paths = @("C:\\Windows\\Temp", "$env:TEMP", "$env:LOCALAPPDATA\\Temp")
      $cutoff = (Get-Date).AddDays(-2)
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { !$_.PSIsContainer -and $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { $totalSize += $file.Length }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "folder",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "prefetch",
        label: "Arquivos Prefetch",
        description: "Apaga arquivos de cache de inicialização do Windows.",
        script: `
      $path = "C:\\Windows\\Prefetch"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "desempenho",
        safeForAuto: true,
    },
    {
        id: "recyclebin",
        label: "Lixeira",
        description: "Esvazia completamente a lixeira do sistema.",
        script: `
      $totalSize = 0
      try {
        $shell = New-Object -ComObject Shell.Application
        $recycleBin = $shell.NameSpace(0xa)
        foreach ($item in $recycleBin.Items()) { $totalSize += $item.Size }
        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
      } catch {}
      Write-Output $totalSize
    `,
        icon: "trash",
        category: "sistema",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "windows-update",
        label: "Cache Windows Update",
        description: "Limpa arquivos baixados pelo Windows Update.",
        script: `
      $path = "C:\\Windows\\SoftwareDistribution\\Download"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "refresh",
        category: "atualizacao",
        safeForAuto: true,
    },
    {
        id: "delivery-optimization",
        label: "Cache de Otimização de Entrega",
        description: "Remove cache usado pelo Windows para downloads e atualizações em segundo plano.",
        script: `
      $paths = @(
        "C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache",
        "C:\\ProgramData\\Microsoft\\Windows\\DeliveryOptimization\\Cache"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "database",
        category: "atualizacao",
        safeForAuto: true,
    },
    {
        id: "thumbnails",
        label: "Cache de Miniaturas",
        description: "Remove miniaturas em cache do Explorador de Arquivos.",
        script: `
      $path = "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Include "thumbcache_*.db" -Recurse -Force -ErrorAction SilentlyContinue
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
        Remove-Item -Path "$path\\thumbcache_*.db" -Force -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "icon-cache",
        label: "Cache de Ícones",
        description: "Remove cache de ícones antigos do Windows Explorer.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\IconCache.db", "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer\\iconcache_*.db")
      $totalSize = 0
      foreach ($path in $paths) {
        $items = Get-ChildItem -Path $path -Force -ErrorAction SilentlyContinue
        foreach ($item in $items) { if (!$item.PSIsContainer) { $totalSize += $item.Length } }
        $items | Remove-Item -Force -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "sistema",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "font-cache",
        label: "Cache de Fontes",
        description: "Remove cache de fontes do Windows. Útil quando fontes ficam bugadas.",
        script: `
      $paths = @("$env:WINDIR\\ServiceProfiles\\LocalService\\AppData\\Local\\FontCache", "$env:WINDIR\\System32\\FNTCACHE.DAT")
      $totalSize = 0
      try { Stop-Service FontCache -Force -ErrorAction SilentlyContinue } catch {}
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $items = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($item in $items) { if (!$item.PSIsContainer) { $totalSize += $item.Length } }
          Remove-Item -Path $path -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      try { Start-Service FontCache -ErrorAction SilentlyContinue } catch {}
      Write-Output $totalSize
    `,
        icon: "file",
        category: "sistema",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "logs",
        label: "Arquivos de Log",
        description: "Remove logs antigos do sistema e aplicações.",
        script: `
      $paths = @("C:\\Windows\\Logs", "$env:LOCALAPPDATA\\Temp", "C:\\ProgramData\\Microsoft\\Windows\\WER")
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-30)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Include "*.log", "*.dmp", "*.etl", "*.tmp" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "history",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "cbs-logs",
        label: "Logs CBS Antigos",
        description: "Remove logs antigos do Windows Component Based Servicing.",
        script: `
      $path = "C:\\Windows\\Logs\\CBS"
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-14)
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Include "*.log", "*.cab" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
        $files | Remove-Item -Force -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "history",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "event-logs-old",
        label: "Logs de Eventos Antigos",
        description: "Remove arquivos antigos de logs arquivados do Visualizador de Eventos.",
        script: `
      $path = "$env:WINDIR\\System32\\winevt\\Logs"
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-30)
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Include "Archive-*.evtx", "*.etl" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
        $files | Remove-Item -Force -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "history",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "windows-error-reporting",
        label: "Relatórios de Erro do Windows",
        description: "Remove relatórios antigos de erro e travamentos do Windows.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Microsoft\\Windows\\WER", "C:\\ProgramData\\Microsoft\\Windows\\WER")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "databaseRed",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "memory-dump",
        label: "Arquivos de Memory Dump",
        description: "Remove arquivos de despejo de memória antigos.",
        script: `
      $paths = @("C:\\Windows\\MEMORY.DMP", "C:\\Windows\\Minidump", "$env:LOCALAPPDATA\\CrashDumps")
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $items = Get-ChildItem -Path $path -Include "*.dmp", "*.mdmp" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
          foreach ($item in $items) { if (!$item.PSIsContainer) { $totalSize += $item.Length } }
          $items | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "databaseRed",
        category: "sistema",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "recent-files",
        label: "Arquivos Recentes",
        description: "Limpa histórico de arquivos recentes do Windows.",
        script: `
      $paths = @("$env:APPDATA\\Microsoft\\Windows\\Recent", "$env:APPDATA\\Microsoft\\Windows\\Recent\\AutomaticDestinations", "$env:APPDATA\\Microsoft\\Windows\\Recent\\CustomDestinations")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "clock",
        category: "privacidade",
        safeForAuto: true,
    },
    {
        id: "run-history",
        label: "Histórico do Executar",
        description: "Remove histórico da janela Executar do Windows.",
        script: `
      try { Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU" -Name "*" -ErrorAction SilentlyContinue } catch {}
      Write-Output 0
    `,
        icon: "clock",
        category: "privacidade",
        safeForAuto: true,
    },
    {
        id: "explorer-history",
        label: "Histórico do Explorador",
        description: "Limpa histórico de pesquisa e caminhos digitados no Explorador de Arquivos.",
        script: `
      try {
        Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\TypedPaths" -Name "*" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\WordWheelQuery" -Name "*" -ErrorAction SilentlyContinue
      } catch {}
      Write-Output 0
    `,
        icon: "clock",
        category: "privacidade",
        safeForAuto: true,
    },
    {
        id: "clipboard",
        label: "Área de Transferência",
        description: "Limpa o conteúdo copiado na área de transferência.",
        script: `
      try { Set-Clipboard -Value "" } catch {}
      Write-Output 0
    `,
        icon: "file",
        category: "privacidade",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "dns-cache",
        label: "Cache DNS",
        description: "Limpa cache DNS do sistema.",
        script: `
      ipconfig /flushdns | Out-Null
      Write-Output 0
    `,
        icon: "wifi",
        category: "rede",
        safeForAuto: true,
    },
    {
        id: "network-temp",
        label: "Cache de Rede",
        description: "Remove cache temporário relacionado a rede e diagnóstico.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Microsoft\\Windows\\INetCache", "$env:LOCALAPPDATA\\Microsoft\\Windows\\WebCache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "wifi",
        category: "rede",
        safeForAuto: true,
    },
    {
        id: "browser-cache",
        label: "Cache de Navegadores",
        description: "Limpa cache comum do Chrome, Edge, Brave, Opera e Firefox sem apagar senhas.",
        script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache",
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Code Cache",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Code Cache",
        "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Cache",
        "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Code Cache",
        "$env:APPDATA\\Opera Software\\Opera Stable\\Cache",
        "$env:APPDATA\\Opera Software\\Opera GX Stable\\Cache",
        "$env:LOCALAPPDATA\\Vivaldi\\User Data\\Default\\Cache"
      )
      $firefoxProfiles = "$env:APPDATA\\Mozilla\\Firefox\\Profiles"
      if (Test-Path $firefoxProfiles) { Get-ChildItem -Path $firefoxProfiles -Directory -ErrorAction SilentlyContinue | ForEach-Object { $paths += "$($_.FullName)\\cache2" } }
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "globe",
        category: "navegadores",
        safeForAuto: true,
    },
    {
        id: "browser-gpu-cache",
        label: "Cache GPU dos Navegadores",
        description: "Remove GPUCache de navegadores Chromium.",
        script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\GPUCache",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\GPUCache",
        "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\User Data\\Default\\GPUCache",
        "$env:APPDATA\\Opera Software\\Opera Stable\\GPUCache",
        "$env:APPDATA\\Opera Software\\Opera GX Stable\\GPUCache",
        "$env:LOCALAPPDATA\\Vivaldi\\User Data\\Default\\GPUCache"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "globe",
        category: "navegadores",
        safeForAuto: true,
    },
    {
        id: "browser-service-worker-cache",
        label: "Cache Service Worker",
        description: "Remove cache de sites salvos em segundo plano nos navegadores.",
        script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Service Worker\\CacheStorage",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Service Worker\\CacheStorage",
        "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Service Worker\\CacheStorage",
        "$env:LOCALAPPDATA\\Vivaldi\\User Data\\Default\\Service Worker\\CacheStorage"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "globe",
        category: "navegadores",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "browser-crash-reports",
        label: "Relatórios de Crash dos Navegadores",
        description: "Remove relatórios antigos de crash de navegadores.",
        script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Crashpad\\reports",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Crashpad\\reports",
        "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\User Data\\Crashpad\\reports"
      )
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "globe",
        category: "navegadores",
        safeForAuto: true,
    },
    {
        id: "directx-shader-cache",
        label: "Cache Shader DirectX",
        description: "Remove cache de shaders do DirectX, útil para jogos e travamentos gráficos.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\D3DSCache", "$env:LOCALAPPDATA\\Microsoft\\DirectX Shader Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "desempenho",
        safeForAuto: true,
    },
    {
        id: "nvidia-cache",
        label: "Cache NVIDIA",
        description: "Remove cache gráfico da NVIDIA, como DXCache e GLCache.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\NVIDIA\\DXCache", "$env:LOCALAPPDATA\\NVIDIA\\GLCache", "C:\\ProgramData\\NVIDIA Corporation\\NV_Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "desempenho",
        safeForAuto: true,
    },
    {
        id: "amd-cache",
        label: "Cache AMD",
        description: "Remove cache gráfico da AMD.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\AMD\\DxCache", "$env:LOCALAPPDATA\\AMD\\GLCache", "$env:LOCALAPPDATA\\AMD\\DxcCache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "desempenho",
        safeForAuto: true,
    },
    {
        id: "intel-gpu-cache",
        label: "Cache Intel Graphics",
        description: "Remove cache gráfico da Intel.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Intel\\ShaderCache", "$env:LOCALAPPDATA\\Intel\\IGN\\ShaderCache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "desempenho",
        safeForAuto: true,
    },
    {
        id: "defender",
        label: "Cache do Defender",
        description: "Remove histórico e cache antigo do Windows Defender.",
        script: `
      $paths = @("C:\\ProgramData\\Microsoft\\Windows Defender\\Scans\\History", "C:\\ProgramData\\Microsoft\\Windows Defender\\Support")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "shieldGreen",
        category: "seguranca",
        safeForAuto: true,
    },
    {
        id: "windows-store-cache",
        label: "Cache Microsoft Store",
        description: "Remove cache temporário da Microsoft Store.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Packages\\Microsoft.WindowsStore_8wekyb3d8bbwe\\LocalCache", "$env:LOCALAPPDATA\\Packages\\Microsoft.WindowsStore_8wekyb3d8bbwe\\TempState")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "database",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "discord-cache",
        label: "Cache do Discord",
        description: "Remove cache, imagens e arquivos temporários do Discord.",
        script: `
      $paths = @(
        "$env:APPDATA\\discord\\Cache", "$env:APPDATA\\discord\\Code Cache", "$env:APPDATA\\discord\\GPUCache",
        "$env:APPDATA\\discordcanary\\Cache", "$env:APPDATA\\discordcanary\\Code Cache", "$env:APPDATA\\discordcanary\\GPUCache",
        "$env:APPDATA\\discordptb\\Cache", "$env:APPDATA\\discordptb\\Code Cache", "$env:APPDATA\\discordptb\\GPUCache"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "spotify-cache",
        label: "Cache do Spotify",
        description: "Remove cache local do Spotify.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Spotify\\Storage", "$env:LOCALAPPDATA\\Spotify\\Browser\\Cache", "$env:APPDATA\\Spotify\\Storage")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "teams-cache",
        label: "Cache do Microsoft Teams",
        description: "Remove cache do Microsoft Teams clássico e novo.",
        script: `
      $paths = @("$env:APPDATA\\Microsoft\\Teams\\Cache", "$env:APPDATA\\Microsoft\\Teams\\Code Cache", "$env:APPDATA\\Microsoft\\Teams\\GPUCache", "$env:LOCALAPPDATA\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "telegram-cache",
        label: "Cache do Telegram",
        description: "Remove cache local do Telegram Desktop.",
        script: `
      $paths = @("$env:APPDATA\\Telegram Desktop\\tdata\\user_data", "$env:APPDATA\\Telegram Desktop\\tdata\\emoji")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "whatsapp-cache",
        label: "Cache WhatsApp Desktop",
        description: "Remove cache temporário do WhatsApp Desktop.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Packages\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\\LocalCache", "$env:LOCALAPPDATA\\WhatsApp\\Cache", "$env:APPDATA\\WhatsApp\\Cache", "$env:APPDATA\\WhatsApp\\GPUCache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "vscode-cache",
        label: "Cache do VS Code",
        description: "Remove cache temporário do Visual Studio Code.",
        script: `
      $paths = @("$env:APPDATA\\Code\\Cache", "$env:APPDATA\\Code\\CachedData", "$env:APPDATA\\Code\\GPUCache", "$env:APPDATA\\Code\\Code Cache", "$env:APPDATA\\Code - Insiders\\Cache", "$env:APPDATA\\Code - Insiders\\CachedData")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        safeForAuto: true,
    },
    {
        id: "npm-cache",
        label: "Cache NPM",
        description: "Limpa cache do NPM usado em projetos JavaScript.",
        script: `
      $path = "$env:APPDATA\\npm-cache"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
      }
      try { npm cache clean --force | Out-Null } catch { if (Test-Path $path) { Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue } }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "yarn-cache",
        label: "Cache Yarn",
        description: "Remove cache do Yarn.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Yarn\\Cache", "$env:APPDATA\\Yarn\\Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "pnpm-cache",
        label: "Cache PNPM",
        description: "Remove cache/store do PNPM.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\pnpm\\store", "$env:USERPROFILE\\.pnpm-store")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "pip-cache",
        label: "Cache PIP Python",
        description: "Remove cache do pip Python.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\pip\\Cache", "$env:USERPROFILE\\AppData\\Local\\pip\\Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "python-cache",
        label: "Cache Python",
        description: "Remove pastas __pycache__ e arquivos .pyc em Desktop, Documentos e Downloads.",
        script: `
      $paths = @("$env:USERPROFILE\\Desktop", "$env:USERPROFILE\\Documents", "$env:USERPROFILE\\Downloads")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $items = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "__pycache__" -or $_.Extension -eq ".pyc" }
          foreach ($item in $items) {
            if ($item.PSIsContainer) {
              $files = Get-ChildItem -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
              foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
            } else { $totalSize += $item.Length }
          }
          $items | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "dev",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "electron-app-cache",
        label: "Cache Apps Electron",
        description: "Remove Cache, Code Cache e GPUCache comuns em apps Electron.",
        script: `
      $basePaths = @("$env:APPDATA", "$env:LOCALAPPDATA")
      $cacheNames = @("Cache", "Code Cache", "GPUCache", "DawnCache")
      $totalSize = 0
      foreach ($base in $basePaths) {
        if (Test-Path $base) {
          $dirs = Get-ChildItem -Path $base -Directory -Force -ErrorAction SilentlyContinue
          foreach ($dir in $dirs) {
            foreach ($cache in $cacheNames) {
              $target = Join-Path $dir.FullName $cache
              if (Test-Path $target) {
                $files = Get-ChildItem -Path $target -Recurse -Force -ErrorAction SilentlyContinue
                foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
                Remove-Item -Path "$target\\*" -Force -Recurse -ErrorAction SilentlyContinue
              }
            }
          }
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "zoom-cache",
        label: "Cache Zoom",
        description: "Remove cache e logs antigos do Zoom.",
        script: `
      $paths = @("$env:APPDATA\\Zoom\\logs", "$env:APPDATA\\Zoom\\data\\WebviewCache", "$env:APPDATA\\Zoom\\data\\Cache")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "obs-cache",
        label: "Cache OBS Studio",
        description: "Remove logs antigos e cache temporário do OBS Studio.",
        script: `
      $paths = @("$env:APPDATA\\obs-studio\\logs", "$env:APPDATA\\obs-studio\\crashes")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-14)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "adobe-cache",
        label: "Cache Adobe",
        description: "Remove caches temporários comuns de apps Adobe.",
        script: `
      $paths = @("$env:APPDATA\\Adobe\\Common\\Media Cache", "$env:APPDATA\\Adobe\\Common\\Media Cache Files", "$env:LOCALAPPDATA\\Adobe\\Common\\Media Cache", "$env:LOCALAPPDATA\\Adobe\\Common\\Media Cache Files")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "onedrive-cache",
        label: "Cache OneDrive",
        description: "Remove logs e cache temporário do OneDrive.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Microsoft\\OneDrive\\logs", "$env:LOCALAPPDATA\\Microsoft\\OneDrive\\setup\\logs")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-14)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "apps",
        safeForAuto: true,
    },
    {
        id: "steam-cache",
        label: "Cache da Steam",
        description: "Remove cache web e arquivos temporários da Steam.",
        script: `
      $pf86 = [Environment]::GetFolderPath('ProgramFilesX86')
      $steamPaths = @(
        "$pf86\\Steam\\appcache\\httpcache",
        "$pf86\\Steam\\config\\htmlcache",
        "$env:LOCALAPPDATA\\Steam\\htmlcache"
      )
      $totalSize = 0
      foreach ($path in $steamPaths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "epic-cache",
        label: "Cache da Epic Games",
        description: "Remove webcache da Epic Games Launcher.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\EpicGamesLauncher\\Saved\\webcache", "$env:LOCALAPPDATA\\EpicGamesLauncher\\Saved\\webcache_4147", "$env:LOCALAPPDATA\\EpicGamesLauncher\\Saved\\webcache_4430")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "riot-cache",
        label: "Cache Riot Games",
        description: "Remove logs e cache antigo da Riot Client.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Riot Games\\Riot Client\\Logs", "$env:LOCALAPPDATA\\Riot Games\\Riot Client\\Cache", "C:\\ProgramData\\Riot Games\\Metadata")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "fivem-cache",
        label: "Cache do FiveM",
        description: "Remove cache temporário do FiveM. Alguns servidores podem baixar arquivos novamente.",
        script: `
      $base = "$env:LOCALAPPDATA\\FiveM\\FiveM.app\\data"
      $paths = @("$base\\cache", "$base\\server-cache", "$base\\server-cache-priv", "$base\\nui-storage", "$base\\crashes", "$base\\logs")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        warning: true,
        safeForAuto: false,
    },
    {
        id: "roblox-cache",
        label: "Cache do Roblox",
        description: "Remove logs e cache temporário do Roblox.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Roblox\\logs", "$env:LOCALAPPDATA\\Roblox\\http", "$env:TEMP\\Roblox")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "minecraft-logs",
        label: "Logs do Minecraft",
        description: "Remove logs e relatórios antigos de crash do Minecraft.",
        script: `
      $paths = @("$env:APPDATA\\.minecraft\\logs", "$env:APPDATA\\.minecraft\\crash-reports")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "battle-net-cache",
        label: "Cache Battle.net",
        description: "Remove cache temporário do Battle.net.",
        script: `
      $paths = @("C:\\ProgramData\\Battle.net\\Cache", "$env:LOCALAPPDATA\\Battle.net\\Cache", "$env:APPDATA\\Battle.net\\Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "ea-app-cache",
        label: "Cache EA App",
        description: "Remove cache temporário do EA App.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Electronic Arts\\EA Desktop\\cache", "$env:LOCALAPPDATA\\Electronic Arts\\EA Desktop\\CEF\\Cache", "C:\\ProgramData\\EA Desktop\\Cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "ubisoft-cache",
        label: "Cache Ubisoft Connect",
        description: "Remove cache temporário do Ubisoft Connect.",
        script: `
      $pf86 = [Environment]::GetFolderPath('ProgramFilesX86')
      $paths = @("$env:LOCALAPPDATA\\Ubisoft Game Launcher\\cache", "$pf86\\Ubisoft\\Ubisoft Game Launcher\\cache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "rockstar-cache",
        label: "Cache Rockstar Launcher",
        description: "Remove cache e logs antigos do Rockstar Games Launcher.",
        script: `
      $paths = @("$env:LOCALAPPDATA\\Rockstar Games\\Launcher\\webcache", "$env:USERPROFILE\\Documents\\Rockstar Games\\Launcher\\logs")
      $totalSize = 0
      $cutoff = (Get-Date).AddDays(-7)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff -or $path -match "webcache" }
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          $files | Remove-Item -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
    {
        id: "gog-cache",
        label: "Cache GOG Galaxy",
        description: "Remove cache temporário do GOG Galaxy.",
        script: `
      $paths = @("$env:PROGRAMDATA\\GOG.com\\Galaxy\\webcache", "$env:LOCALAPPDATA\\GOG.com\\Galaxy\\Applications\\webcache")
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue
          foreach ($file in $files) { if (!$file.PSIsContainer) { $totalSize += $file.Length } }
          Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
        }
      }
      Write-Output $totalSize
    `,
        icon: "cpu",
        category: "jogos",
        safeForAuto: true,
    },
]
