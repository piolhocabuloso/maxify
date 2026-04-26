// src/renderer/src/lib/device.js

// Função para obter HWID via Electron (assíncrona)
export async function getHWIDFromElectron() {
    try {
        // Verifica se está no Electron
        if (window.electron && typeof window.electron.getHWID === 'function') {
            console.log("🔍 Solicitando HWID do Electron...")
            const hwid = await window.electron.getHWID()
            console.log("✅ HWID recebido do Electron:", hwid)
            
            if (hwid && typeof hwid === 'string' && hwid.length > 5) {
                return hwid
            }
        }
        return null
    } catch (error) {
        console.error("❌ Erro ao obter HWID do Electron:", error)
        return null
    }
}

// Função para gerar um ID baseado no navegador (fallback)
export function generateBrowserID() {
    try {
        const navigator = window.navigator
        const screen = window.screen
        
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
            // Adicionar mais componentes para tornar mais único
            navigator.platform || 'unknown',
            screen.pixelDepth || 'unknown'
        ]
        
        // Criar um hash simples
        const hash = btoa(components.join('|')).replace(/=/g, '').substring(0, 30)
        return 'web-' + hash
    } catch (error) {
        console.error('Erro ao gerar browser ID:', error)
        return 'web-fallback-' + Math.random().toString(36).substring(2, 15)
    }
}

// Função principal para obter device ID (agora assíncrona)
export async function getDeviceID() {
    try {
        // Primeiro tenta obter do Electron (para o executável)
        const electronHWID = await getHWIDFromElectron()
        if (electronHWID) {
            // Salva no localStorage para cache
            localStorage.setItem('device_id', electronHWID)
            localStorage.setItem('device_source', 'electron')
            console.log("💻 Usando HWID do Electron:", electronHWID)
            return electronHWID
        }
        
        // Se não conseguiu do Electron, tenta do cache
        const cachedID = localStorage.getItem('device_id')
        const cachedSource = localStorage.getItem('device_source')
        
        if (cachedID) {
            console.log(`💾 Usando ID em cache (fonte: ${cachedSource || 'desconhecida'}):`, cachedID)
            return cachedID
        }
        
        // Se não tem cache, gera um novo ID do navegador
        const browserID = generateBrowserID()
        localStorage.setItem('device_id', browserID)
        localStorage.setItem('device_source', 'browser')
        console.log("🌐 Gerado novo browser ID:", browserID)
        
        return browserID
        
    } catch (error) {
        console.error('Erro ao obter device ID:', error)
        // Fallback final
        return 'fallback-' + Math.random().toString(36).substring(2, 15)
    }
}

// Função para limpar o device ID
export function clearDeviceID() {
    localStorage.removeItem('device_id')
    localStorage.removeItem('device_source')
    console.log("🧹 Device ID limpo do cache")
}

// Função para verificar a fonte do device ID
export function getDeviceSource() {
    return localStorage.getItem('device_source') || 'unknown'
}