import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"

function isInvalidDisplayName(value) {
  const text = String(value || "").trim()

  if (!text) return true

  const normalized = text.toLowerCase()
  const genericNames = ["Usuário Maxify", "Usuario Maxify", "friend"].map((item) =>
    item.toLowerCase()
  )

  const hexLike = /^[a-f0-9]{32,}$/i.test(text)
  const uuidLike =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(text)
  const maskedHwidLike = /^[a-f0-9]{8,}\.{3,}[a-f0-9]{6,}$/i.test(text)

  return (
    genericNames.includes(normalized) ||
    normalized.includes("hwid") ||
    hexLike ||
    uuidLike ||
    maskedHwidLike ||
    text.length > 40
  )
}

function getDiscordName(user) {
  return user?.globalName || user?.username || user?.tag || ""
}

function Greeting() {
  const [name, setName] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadName() {
      const cached = String(localStorage.getItem("maxify:user") || "").trim()

      if (cached && !isInvalidDisplayName(cached)) {
        if (mounted) setName(cached)
        return
      }

      if (cached) {
        localStorage.removeItem("maxify:user")
      }

      try {
        const discordResult = await window.electron?.discordAuth?.getUser?.()
        const discordName = getDiscordName(discordResult?.user)

        if (!isInvalidDisplayName(discordName) && mounted) {
          setName(discordName)
          localStorage.setItem("maxify:user", discordName)
          return
        }
      } catch (err) {
        console.error("Error fetching Discord user name:", err)
      }

      try {
        const account = await window.electron?.auth?.getAccount?.()
        const accountName = account?.user

        if (!isInvalidDisplayName(accountName) && mounted) {
          setName(accountName)
          localStorage.setItem("maxify:user", accountName)
          return
        }
      } catch (err) {
        console.error("Error fetching account user name:", err)
      }

      try {
        const username = await invoke({ channel: "get-user-name" })

        if (!isInvalidDisplayName(username) && mounted) {
          setName(username)
          localStorage.setItem("maxify:user", username)
          return
        }
      } catch (err) {
        console.error("Error fetching user name:", err)
      }

      if (mounted) {
        setName("Usuário")
      }
    }

    loadName()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <h1 className="text-[30px] md:text-[34px] font-black text-white tracking-[-0.04em] leading-none">
      Bem-vindo,{" "}
      <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
        {name || "Usuário"}
      </span>
    </h1>
  )
}

export default Greeting