import { useState, useEffect } from "react"
import { invoke } from "@/lib/electron"

function Greeting() {
  const [name, setName] = useState("")

  useEffect(() => {
    const cached = localStorage.getItem("maxify:user")

    if (cached) {
      setName(cached)
      return
    }

    invoke({ channel: "get-user-name" })
      .then((username) => {
        if (username) {
          setName(username)
          localStorage.setItem("maxify:user", username)
        }
      })
      .catch((err) => {
        console.error("Error fetching user name:", err)
      })
  }, [])

  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold text-maxify-text leading-tight">
        Bem-vindo,{" "}
        <span className="bg-linear-to-r from-maxify-primary to-maxify-secondary bg-clip-text text-transparent">
          {name || "friend"}
        </span>
      </h1>

      <h2 className="text-3xl md:text-4xl font-extrabold text-maxify-text leading-tight">
        Tenha o controle total do seu PC
      </h2>
    </div>
  )
}

export default Greeting