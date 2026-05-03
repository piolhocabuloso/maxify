import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"

function Greeting() {
  const [name, setName] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadName() {
      const cached = localStorage.getItem("maxify:user")

      const isGenericName =
        !cached ||
        cached === "Usuário Maxify" ||
        cached === "Usuario Maxify" ||
        cached === "friend"

      if (cached && !isGenericName) {
        setName(cached)
        return
      }

      try {
        const username = await invoke({ channel: "get-user-name" })

        if (username && mounted) {
          setName(username)
          localStorage.setItem("maxify:user", username)
          return
        }
      } catch (err) {
        console.error("Error fetching user name:", err)
      }

      if (mounted) {
        setName(cached || "Usuário")
      }
    }

    loadName()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold text-maxify-text leading-tight">
        Bem-vindo,{" "}
        <span className="bg-linear-to-r from-maxify-primary to-maxify-secondary bg-clip-text text-transparent">
          {name || "Usuário"}
        </span>
      </h1>

      <h2 className="text-3xl md:text-4xl font-extrabold text-maxify-text leading-tight">
        Tenha o controle total do seu PC
      </h2>
    </div>
  )
}

export default Greeting