export const AUTO_CLEAN_CONFIG = {
    DEFAULT_INTERVAL_MS: 60 * 60 * 1000,
    MIN_INTERVAL_MS: 30 * 60 * 1000,
    MAX_INTERVAL_MS: 24 * 60 * 60 * 1000,
    MAX_HISTORY_ITEMS: 50,
    STORAGE_KEY: "maxify:auto-clean-config",
    DEFAULT_SELECTIONS: ["temp", "prefetch", "windows-update", "thumbnails", "browser-cache", "logs", "dns-cache"],
}

export const INTERVAL_OPTIONS = [
    { label: "30 minutos", value: 30 * 60 * 1000 },
    { label: "1 hora", value: 60 * 60 * 1000 },
    { label: "2 horas", value: 2 * 60 * 60 * 1000 },
    { label: "4 horas", value: 4 * 60 * 60 * 1000 },
]

export const categories = [
    { id: "all", label: "Todos", icon: "refresh" },
    { id: "sistema", label: "Sistema", icon: "cpu" },
    { id: "desempenho", label: "Desempenho", icon: "trending" },
    { id: "navegadores", label: "Navegadores", icon: "globe" },
    { id: "privacidade", label: "Privacidade", icon: "shield" },
    { id: "atualizacao", label: "Atualização", icon: "database" },
    { id: "rede", label: "Rede", icon: "wifi" },
]

export const cleanups = [
    {
        id: "temp",
        label: "Arquivos Temporários",
        description: "Remove arquivos .tmp, cache do usuário e arquivos temporários do sistema.",
        script: `
      $tempPaths = @("$env:TEMP", "C:\\Windows\\Temp")
      $totalSize = 0
      foreach ($path in $tempPaths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
          foreach ($file in $files) {
            if ($file.PSIsContainer -eq $false) {
              $totalSize += $file.Length
            }
          }
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
        id: "prefetch",
        label: "Arquivos Prefetch",
        description: "Apaga arquivos de cache de inicialização do Windows.",
        script: `
      $path = "C:\\Windows\\Prefetch"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          if ($file.PSIsContainer -eq $false) {
            $totalSize += $file.Length
          }
        }
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
      $shell = New-Object -ComObject Shell.Application
      $recycleBin = $shell.NameSpace(0xa)
      $totalSize = 0
      if ($recycleBin.Items().Count -gt 0) {
        foreach ($item in $recycleBin.Items()) {
          $totalSize += $item.Size
        }
        $recycleBin.Items() | ForEach-Object {
          Remove-Item $_.Path -Recurse -Force -ErrorAction SilentlyContinue
        }
      }
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
        description: "Limpa arquivos de atualização baixados e cache do Windows Update.",
        script: `
      $path = "C:\\Windows\\SoftwareDistribution\\Download"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          if ($file.PSIsContainer -eq $false) {
            $totalSize += $file.Length
          }
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "refresh",
        category: "atualizacao",
        safeForAuto: true,
    },
    {
        id: "thumbnails",
        label: "Cache de Miniaturas",
        description: "Remove thumbnails em cache do Explorador de Arquivos.",
        script: `
      $path = "$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Include "thumbcache_*.db" -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          if ($file.PSIsContainer -eq $false) {
            $totalSize += $file.Length
          }
        }
        Remove-Item -Path "$path\\thumbcache_*.db" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "file",
        category: "sistema",
        safeForAuto: true,
    },
    {
        id: "browser-cache",
        label: "Cache de Navegadores",
        description: "Limpa cache do Chrome, Edge e Firefox.",
        script: `
      $paths = @(
        "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache",
        "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache",
        "$env:APPDATA\\Mozilla\\Firefox\\Profiles"
      )
      $totalSize = 0
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
          foreach ($file in $files) {
            if ($file.PSIsContainer -eq $false) {
              $totalSize += $file.Length
            }
          }
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
        id: "logs",
        label: "Arquivos de Log",
        description: "Remove logs antigos do sistema e aplicações.",
        script: `
      $paths = @("C:\\Windows\\Logs", "$env:LOCALAPPDATA\\Temp")
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-30)
      foreach ($path in $paths) {
        if (Test-Path $path) {
          $files = Get-ChildItem -Path $path -Include "*.log", "*.dmp" -Recurse -ErrorAction SilentlyContinue |
                   Where-Object { $_.LastWriteTime -lt $cutoffDate }
          foreach ($file in $files) {
            if ($file.PSIsContainer -eq $false) {
              $totalSize += $file.Length
            }
          }
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
        id: "memory-dump",
        label: "Arquivos de Memory Dump",
        description: "Remove arquivos de despejo de memória antigos.",
        script: `
      $totalSize = 0
      $cutoffDate = (Get-Date).AddDays(-7)
      $files = Get-ChildItem -Path "C:\\Windows\\" -Include "*.dmp", "MEMORY.DMP" -ErrorAction SilentlyContinue |
               Where-Object { $_.LastWriteTime -lt $cutoffDate }
      foreach ($file in $files) {
        if ($file.PSIsContainer -eq $false) {
          $totalSize += $file.Length
        }
      }
      $files | Remove-Item -Force -ErrorAction SilentlyContinue
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
      $path = "$env:APPDATA\\Microsoft\\Windows\\Recent"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          if ($file.PSIsContainer -eq $false) {
            $totalSize += $file.Length
          }
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "clock",
        category: "privacidade",
        safeForAuto: true,
    },
    {
        id: "dns-cache",
        label: "Cache DNS",
        description: "Limpa cache DNS do sistema.",
        script: `ipconfig /flushdns; Write-Output "0"`,
        icon: "wifi",
        category: "rede",
        safeForAuto: true,
    },
    {
        id: "defender",
        label: "Cache do Defender",
        description: "Remove logs e cache do antivírus do Windows.",
        script: `
      $path = "C:\\ProgramData\\Microsoft\\Windows Defender\\Scans\\History"
      $totalSize = 0
      if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
          if ($file.PSIsContainer -eq $false) {
            $totalSize += $file.Length
          }
        }
        Remove-Item -Path "$path\\*" -Force -Recurse -ErrorAction SilentlyContinue
      }
      Write-Output $totalSize
    `,
        icon: "shieldGreen",
        category: "seguranca",
        safeForAuto: true,
    },
]