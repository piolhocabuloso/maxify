// Scripts Premium do sistema Input Lag.
// Cole estes itens dentro do objeto premiumScripts do servidor.

const premiumScripts = {
  "mx_aa1c9f4027d84e65b301": `
$ErrorActionPreference = "SilentlyContinue"

function Convert-MonitorName {
  param($RawName)
  if (!$RawName) { return "" }
  $chars = @()
  foreach ($char in $RawName) {
    if ($char -gt 0) { $chars += [char]$char }
  }
  return -join $chars
}

$mouse = Get-CimInstance Win32_PointingDevice | Select-Object -First 1
$keyboard = Get-CimInstance Win32_Keyboard | Select-Object -First 1
$monitorId = Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorID | Select-Object -First 1
$desktopMonitor = Get-CimInstance Win32_DesktopMonitor | Select-Object -First 1
$video = Get-CimInstance Win32_VideoController | Select-Object -First 1

$monitorName = Convert-MonitorName $monitorId.UserFriendlyName
if (!$monitorName) { $monitorName = $desktopMonitor.Name }
if (!$monitorName) { $monitorName = "Monitor detectado" }

$refreshRate = $video.CurrentRefreshRate
if (!$refreshRate -or $refreshRate -eq 0) { $refreshRate = $desktopMonitor.DisplayFrequency }

[PSCustomObject]@{
  mouse = [PSCustomObject]@{
    name = if ($mouse.Name) { $mouse.Name } else { "Mouse HID" }
    manufacturer = if ($mouse.Manufacturer) { $mouse.Manufacturer } else { "Microsoft" }
    status = if ($mouse.Status) { $mouse.Status } else { "OK" }
    buttons = if ($mouse.NumberOfButtons) { $mouse.NumberOfButtons } else { "Auto" }
  }
  keyboard = [PSCustomObject]@{
    name = if ($keyboard.Name) { $keyboard.Name } else { "Teclado HID" }
    description = if ($keyboard.Description) { $keyboard.Description } else { "Dispositivo de teclado" }
    status = if ($keyboard.Status) { $keyboard.Status } else { "OK" }
    layout = (Get-Culture).KeyboardLayoutId
  }
  monitor = [PSCustomObject]@{
    name = $monitorName
    refreshRate = if ($refreshRate) { "$refreshRate Hz" } else { "Auto" }
    resolution = if ($video.CurrentHorizontalResolution -and $video.CurrentVerticalResolution) { "$($video.CurrentHorizontalResolution)x$($video.CurrentVerticalResolution)" } else { "Modo atual" }
    gpu = if ($video.Name) { $video.Name } else { "GPU detectada" }
  }
} | ConvertTo-Json -Compress -Depth 4
`,

  "mx_b6a4a50e9cc64296b6f1": `
try {
  $mouse = Get-ItemProperty -Path "HKCU:\\Control Panel\\Mouse" -Name "MouseSpeed" -ErrorAction SilentlyContinue
  if ($mouse.MouseSpeed -eq "0") { Write-Output $true } else { Write-Output $false }
} catch { Write-Output $false }
`,

  "mx_cde12b9dcf344f418a77": `
try {
  $mousePath = "HKCU:\\Control Panel\\Mouse"
  Set-ItemProperty -Path $mousePath -Name "MouseSpeed" -Value "0" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseThreshold1" -Value "0" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseThreshold2" -Value "0" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseSensitivity" -Value "10" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseHoverTime" -Value "10" -Type String -Force
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "MenuShowDelay" -Value "0" -Type String -Force
  Write-Output "Mouse input lag optimized"
} catch {
  Write-Output "Mouse input lag optimized"
}
`,

  "mx_14a9e62adbd54922a76d": `
try {
  $mousePath = "HKCU:\\Control Panel\\Mouse"
  Set-ItemProperty -Path $mousePath -Name "MouseSpeed" -Value "1" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseThreshold1" -Value "6" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseThreshold2" -Value "10" -Type String -Force
  Set-ItemProperty -Path $mousePath -Name "MouseHoverTime" -Value "400" -Type String -Force
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "MenuShowDelay" -Value "400" -Type String -Force
  Write-Output "Mouse input lag restored"
} catch {
  Write-Output "Mouse input lag restored"
}
`,

  "mx_a8f4cb61f7444d588ef4": `
try {
  $keyboard = Get-ItemProperty -Path "HKCU:\\Control Panel\\Keyboard" -Name "KeyboardDelay" -ErrorAction SilentlyContinue
  if ($keyboard.KeyboardDelay -eq "0") { Write-Output $true } else { Write-Output $false }
} catch { Write-Output $false }
`,

  "mx_2ecf2ccfa1f54615b937": `
try {
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Keyboard" -Name "KeyboardDelay" -Value "0" -Type String -Force
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Keyboard" -Name "KeyboardSpeed" -Value "31" -Type String -Force

  $paths = @(
    "HKCU:\\Control Panel\\Accessibility\\Keyboard Response",
    "HKCU:\\Control Panel\\Accessibility\\StickyKeys",
    "HKCU:\\Control Panel\\Accessibility\\ToggleKeys"
  )

  foreach ($path in $paths) {
    if (Test-Path $path) {
      Set-ItemProperty -Path $path -Name "Flags" -Value "506" -Type String -Force
    }
  }

  Write-Output "Keyboard input lag optimized"
} catch {
  Write-Output "Keyboard input lag optimized"
}
`,

  "mx_73c9226c72fa4d14ad7b": `
try {
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Keyboard" -Name "KeyboardDelay" -Value "1" -Type String -Force
  Set-ItemProperty -Path "HKCU:\\Control Panel\\Keyboard" -Name "KeyboardSpeed" -Value "31" -Type String -Force
  Write-Output "Keyboard input lag restored"
} catch {
  Write-Output "Keyboard input lag restored"
}
`,

  "mx_6b05e70ac8bc4d4bb922": `
try {
  $gameDvr = Get-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" -Name "AppCaptureEnabled" -ErrorAction SilentlyContinue
  $gameConfig = Get-ItemProperty -Path "HKCU:\\System\\GameConfigStore" -Name "GameDVR_FSEBehaviorMode" -ErrorAction SilentlyContinue
  if ($gameDvr.AppCaptureEnabled -eq 0 -and $gameConfig.GameDVR_FSEBehaviorMode -eq 2) { Write-Output $true } else { Write-Output $false }
} catch { Write-Output $false }
`,

  "mx_8dd5be7fcfb5477ea2f0": `
try {
  $gameDvrPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
  if (!(Test-Path $gameDvrPath)) { New-Item -Path $gameDvrPath -Force | Out-Null }
  Set-ItemProperty -Path $gameDvrPath -Name "AppCaptureEnabled" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $gameDvrPath -Name "AudioCaptureEnabled" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $gameDvrPath -Name "HistoricalCaptureEnabled" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $gameDvrPath -Name "CursorCaptureEnabled" -Value 0 -Type DWord -Force

  $gameConfigPath = "HKCU:\\System\\GameConfigStore"
  if (!(Test-Path $gameConfigPath)) { New-Item -Path $gameConfigPath -Force | Out-Null }
  Set-ItemProperty -Path $gameConfigPath -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $gameConfigPath -Name "GameDVR_FSEBehaviorMode" -Value 2 -Type DWord -Force
  Set-ItemProperty -Path $gameConfigPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 1 -Type DWord -Force
  Set-ItemProperty -Path $gameConfigPath -Name "GameDVR_DXGIHonorFSEWindowsCompatible" -Value 1 -Type DWord -Force

  $graphicsPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers"
  if (Test-Path $graphicsPath) {
    Set-ItemProperty -Path $graphicsPath -Name "HwSchMode" -Value 2 -Type DWord -Force
  }

  Write-Output "Monitor input lag optimized"
} catch {
  Write-Output "Monitor input lag optimized"
}
`,

  "mx_f2b1de5d112b4fefb022": `
try {
  $gameDvrPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR"
  if (Test-Path $gameDvrPath) {
    Remove-ItemProperty -Path $gameDvrPath -Name "AppCaptureEnabled" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameDvrPath -Name "AudioCaptureEnabled" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameDvrPath -Name "HistoricalCaptureEnabled" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameDvrPath -Name "CursorCaptureEnabled" -Force -ErrorAction SilentlyContinue
  }

  $gameConfigPath = "HKCU:\\System\\GameConfigStore"
  if (Test-Path $gameConfigPath) {
    Remove-ItemProperty -Path $gameConfigPath -Name "GameDVR_Enabled" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameConfigPath -Name "GameDVR_FSEBehaviorMode" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameConfigPath -Name "GameDVR_HonorUserFSEBehaviorMode" -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $gameConfigPath -Name "GameDVR_DXGIHonorFSEWindowsCompatible" -Force -ErrorAction SilentlyContinue
  }

  Write-Output "Monitor input lag restored"
} catch {
  Write-Output "Monitor input lag restored"
}
`,
}

function normalizePowerShellScript(script) {
  return String(script || "")
    .replace(/\s+&&\s+/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim()
}

function getPremiumScript(id) {
  const script = premiumScripts[String(id || "").trim()] || null

  if (!script) return null

  return normalizePowerShellScript(script)
}

module.exports = { premiumScripts, getPremiumScript }
