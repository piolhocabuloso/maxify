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
]
