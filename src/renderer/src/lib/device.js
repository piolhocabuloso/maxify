// src/renderer/src/lib/device.js

export async function getHWIDFromElectron() {
    try {
        if (window.electron && typeof window.electron.getHWID === "function") {
            const hwid = await window.electron.getHWID()

            if (hwid && typeof hwid === "string" && hwid.length > 5) {
                return hwid
            }
        }

        return null
    } catch {
        return null
    }
}

export function generateBrowserID() {
    try {
        const navigatorInfo = window.navigator
        const screenInfo = window.screen

        const components = [
            navigatorInfo.userAgent,
            navigatorInfo.language,
            screenInfo.colorDepth,
            screenInfo.width,
            screenInfo.height,
            new Date().getTimezoneOffset(),
            navigatorInfo.hardwareConcurrency || "unknown",
            navigatorInfo.deviceMemory || "unknown",
            navigatorInfo.platform || "unknown",
            screenInfo.pixelDepth || "unknown",
        ]

        const hash = btoa(components.join("|")).replace(/=/g, "").substring(0, 30)
        return "web-" + hash
    } catch {
        return "web-fallback-" + Math.random().toString(36).substring(2, 15)
    }
}

export async function getDeviceID() {
    const electronHWID = await getHWIDFromElectron()

    if (electronHWID) {
        return electronHWID
    }

    return generateBrowserID()
}

export function clearDeviceID() {
    // Mantida por compatibilidade. Não usamos mais cache de HWID no localStorage.
}

export function getDeviceSource() {
    return window.electron ? "electron" : "browser"
}
