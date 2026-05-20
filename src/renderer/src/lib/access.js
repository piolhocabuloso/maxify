const ACCESS_KEYS = [
  "maxify:access-mode",
  "maxify:logged",
  "maxify:plan",
  "maxify:keyMasked",
  "maxify:expiresAt",
]

export const ACCESS_MODE = {
  FREE: "free",
  PREMIUM: "premium",
}

export const FREE_ROUTES = new Set([
  "/",
  "/clean",
  "/settings",
  "/login_pagina",
  "/login",

  // Funções liberadas no plano Free
  "/prioridade",
  "/aplicativos",
  "/memory",
  "/office_installer",
])

export const PREMIUM_ROUTES = new Set([
  "/backup",
  "/utilities",
  "/desativar",
  "/dns",
  "/apps",
  "/otimizacao",
  "/autoclean",
  "/essential_installer",
  "/startup",
])

export function getAccessMode() {
  const mode = localStorage.getItem("maxify:access-mode")

  if (mode === ACCESS_MODE.FREE) return ACCESS_MODE.FREE
  if (localStorage.getItem("maxify:logged") === "true") return ACCESS_MODE.PREMIUM

  return "guest"
}

export function isFreeMode() {
  return getAccessMode() === ACCESS_MODE.FREE
}

export function isPremiumMode() {
  return getAccessMode() === ACCESS_MODE.PREMIUM
}

export function canAccessRoute(pathname) {
  if (isPremiumMode()) return true

  return [...FREE_ROUTES].some((route) => {
    return pathname === route || pathname.startsWith(route + "/")
  })
}

export function saveFreeAccess() {
  localStorage.setItem("maxify:access-mode", ACCESS_MODE.FREE)
  localStorage.setItem("maxify:logged", "true")
  localStorage.setItem("maxify:plan", "Free")
  localStorage.setItem("maxify:keyMasked", "FREE-ACCESS")
  localStorage.setItem("maxify:expiresAt", "")
  localStorage.removeItem("userKey")
  localStorage.removeItem("maxify:key")
  sessionStorage.removeItem("maxify:current-key")
}

export function savePremiumAccess(data = {}) {
  localStorage.setItem("maxify:access-mode", ACCESS_MODE.PREMIUM)
  localStorage.setItem("maxify:logged", "true")
  localStorage.setItem("maxify:plan", data.plan || localStorage.getItem("maxify:plan") || "Lifetime")
}

export function clearAccess() {
  ACCESS_KEYS.forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem("userKey")
  localStorage.removeItem("maxify:key")
  sessionStorage.removeItem("maxify:current-key")
}

export const freeFeatures = [
  "Dashboard básico do sistema",
  "Limpeza completa liberada",
  "Memória RAM liberada",
  "Prioridade de jogo liberada",
  "Central de recursos liberada",
  "Configurações básicas do aplicativo",
]

export const premiumFeatures = [
  "Otimizações avançadas de Windows",
  "Backup e ponto de restauração",
  "DNS, desativação e boost avançado",
  "Instaladores, automações e ajustes premium",
]
