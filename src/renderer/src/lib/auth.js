export function detectarPlanoPelaKey(key) {
    const normalizada = String(key || "")
        .trim()
        .toUpperCase()
        .replaceAll("_", "-")

    if (normalizada.includes("SEMANAL")) return "Semanal"
    if (normalizada.includes("MENSAL")) return "Mensal"
    return "Lifetime"
}

export async function validateKey(key, hwid) {
    const cleanKey = String(key || "").trim()

    if (!cleanKey) {
        throw new Error("Digite uma key válida.")
    }

    if (!window.electron?.auth?.login) {
        throw new Error("Sistema de autenticação não encontrado.")
    }

    const data = await window.electron.auth.login({
        key: cleanKey,
        hwid,
    })

    if (!data?.success) {
        throw new Error(data?.error || data?.message || "Key inválida.")
    }

    return {
        ...data,
        plan: data.plan || detectarPlanoPelaKey(cleanKey),
        expiresAt: data.expiresAt || "",
        user: data.user || "Usuário Maxify",
        keyMasked: data.keyMasked || "Key protegida",
    }
}

export function saveAuth(data) {
    // Não salva sessionToken, key completa ou HWID no localStorage.
    localStorage.setItem("maxify:access-mode", "premium")
    localStorage.setItem("maxify:logged", "true")
    localStorage.setItem("maxify:plan", data?.plan || "Lifetime")
    localStorage.setItem("maxify:keyMasked", data?.keyMasked || "Key protegida")
    localStorage.setItem("maxify:expiresAt", data?.expiresAt || "")

    if (data?.user && data.user !== "Usuário Maxify") {
        localStorage.setItem("maxify:user", data.user)
    }
}

export function isLogged() {
    return localStorage.getItem("maxify:logged") === "true"
}

export function getAuth() {
    return {
        key: "",
        keyMasked: localStorage.getItem("maxify:keyMasked") || "Key protegida",
        sessionToken: "",
        plan: localStorage.getItem("maxify:plan") || "Lifetime",
        user: localStorage.getItem("maxify:user") || "Usuário Maxify",
        expiresAt: localStorage.getItem("maxify:expiresAt") || "",
        logged: localStorage.getItem("maxify:logged") === "true",
    }
}

export function logout() {
    localStorage.removeItem("maxify:access-mode")
    localStorage.removeItem("userKey")
    localStorage.removeItem("maxify:key")
    sessionStorage.removeItem("maxify:current-key")
    localStorage.removeItem("maxify:logged")
    localStorage.removeItem("maxify:plan")
    localStorage.removeItem("maxify:keyMasked")
    localStorage.removeItem("maxify:user")
    localStorage.removeItem("maxify:expiresAt")
}
