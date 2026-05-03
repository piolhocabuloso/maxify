const API_URL = "https://apikey-kohl.vercel.app"

export function detectarPlanoPelaKey(key) {
    const normalizada = String(key || "")
        .trim()
        .toUpperCase()
        .replaceAll("_", "-")

    if (normalizada.includes("SEMANAL")) {
        return "Semanal"
    }

    if (normalizada.includes("MENSAL")) {
        return "Mensal"
    }

    return "Lifetime"
}

export async function validateKey(key, hwid) {
    const cleanKey = String(key || "").trim()

    if (!cleanKey) {
        throw new Error("Digite uma key válida.")
    }

    const response = await fetch(`${API_URL}/verify-key`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            key: cleanKey,
            hwid,
        }),
    })

    const data = await response.json().catch(() => null)

    if (!data) {
        throw new Error("Resposta inválida do servidor.")
    }

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Key inválida.")
    }

    if (!data.sessionToken) {
        throw new Error("Servidor não retornou sessão.")
    }

    return {
        ...data,
        key: cleanKey,
        plan: data.plan || detectarPlanoPelaKey(cleanKey),
        expiresAt: data.expiresAt || "",
        user: data.user || "Usuário Maxify",
    }
}

export function saveAuth(data) {
    const key = data?.key || ""
    const plan = data?.plan || detectarPlanoPelaKey(key)

    localStorage.setItem("maxifySessionToken", data.sessionToken || "")
    localStorage.setItem("userKey", key)
    localStorage.setItem("maxify:key", key)

    localStorage.setItem("maxify:plan", plan)
    if (data.user && data.user !== "Usuário Maxify") {
        localStorage.setItem("maxify:user", data.user)
    }
    localStorage.setItem("maxify:expiresAt", data.expiresAt || "")
    localStorage.setItem("maxify:logged", "true")
}

export function isLogged() {
    const logged = localStorage.getItem("maxify:logged") === "true"
    const token = localStorage.getItem("maxifySessionToken")
    const key = localStorage.getItem("userKey") || localStorage.getItem("maxify:key")

    return logged && !!token && !!key
}

export function getAuth() {
    const key = localStorage.getItem("userKey") || localStorage.getItem("maxify:key") || ""

    return {
        key,
        sessionToken: localStorage.getItem("maxifySessionToken") || "",
        plan: localStorage.getItem("maxify:plan") || detectarPlanoPelaKey(key),
        user: localStorage.getItem("maxify:user") || "Usuário Maxify",
        expiresAt: localStorage.getItem("maxify:expiresAt") || "",
        logged: localStorage.getItem("maxify:logged") === "true",
    }
}

export function logout() {
    localStorage.removeItem("maxifySessionToken")
    localStorage.removeItem("userKey")
    localStorage.removeItem("maxify:key")
    localStorage.removeItem("maxify:plan")
    localStorage.removeItem("maxify:user")
    localStorage.removeItem("maxify:expiresAt")
    localStorage.removeItem("maxify:logged")
}