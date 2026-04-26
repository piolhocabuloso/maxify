import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  Gamepad2,
  Zap,
  RotateCcw,
  Search,
  ShieldCheck,
  Cpu,
  LoaderCircle,
  Check,
  Sparkles,
} from "lucide-react"
import { toast } from "react-toastify"
import Button from "@/components/ui/button"
import valorantImg from "@/assets/games/valorant.jpg"
import fortniteImg from "@/assets/games/fortnite.jpg"
import minecraftImg from "@/assets/games/minecraft.png"

const GAMES = [
  {
    id: "apex",
    name: "Apex Legends",
    exe: ["r5apex.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
  },
  {
    id: "cs2",
    name: "Counter Strike 2",
    exe: ["cs2.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  },
  {
    id: "valorant",
    name: "Valorant",
    exe: ["VALORANT-Win64-Shipping.exe"],
    image: valorantImg,
  },
  {
    id: "fortnite",
    name: "Fortnite",
    exe: ["FortniteClient-Win64-Shipping.exe"],
    image: fortniteImg,
  },
  {
    id: "gta5",
    name: "GTA V",
    exe: ["GTA5.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
  },
  {
    id: "minecraft",
    name: "Minecraft",
    exe: ["javaw.exe"],
    image: minecraftImg,
  },
  {
    id: "pubg",
    name: "PUBG",
    exe: ["TslGame.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
  },
  {
    id: "dota2",
    name: "Dota 2",
    exe: ["dota2.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
  },
  {
    id: "rocketleague",
    name: "Rocket League",
    exe: ["RocketLeague.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
  },
  {
    id: "dbd",
    name: "Dead by Daylight",
    exe: ["DeadByDaylight-Win64-Shipping.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/381210/header.jpg",
  },
  {
    id: "cod-warzone",
    name: "Call of Duty: Warzone",
    exe: ["ModernWarfare.exe", "cod.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1962663/header.jpg",
  },
  {
    id: "rainbowsix",
    name: "Rainbow Six Siege",
    exe: ["RainbowSix.exe", "RainbowSix_Vulkan.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/359550/header.jpg",
  },
  {
    id: "rust",
    name: "Rust",
    exe: ["RustClient.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
  },
  {
    id: "eldenring",
    name: "Elden Ring",
    exe: ["eldenring.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
  },
  {
    id: "cyberpunk2077",
    name: "Cyberpunk 2077",
    exe: ["Cyberpunk2077.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  },
  {
    id: "reddead2",
    name: "Red Dead Redemption 2",
    exe: ["RDR2.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
  },
  {
    id: "warframe",
    name: "Warframe",
    exe: ["Warframe.x64.exe", "Warframe.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/230410/header.jpg",
  },
  {
    id: "destiny2",
    name: "Destiny 2",
    exe: ["destiny2.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header.jpg",
  },
  {
    id: "baldursgate3",
    name: "Baldur's Gate 3",
    exe: ["bg3.exe", "bg3_dx11.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
  },
  {
    id: "lol",
    name: "League of Legends",
    exe: ["League of Legends.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/20590/header.jpg",
  },
  {
    id: "terraria",
    name: "Terraria",
    exe: ["Terraria.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
  },
  {
    id: "dayz",
    name: "DayZ",
    exe: ["DayZ_x64.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
  },
  {
    id: "arma3",
    name: "Arma 3",
    exe: ["arma3.exe", "arma3_x64.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
  },
  {
    id: "pathofexile",
    name: "Path of Exile",
    exe: ["PathOfExile.exe", "PathOfExile_x64.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/238960/header.jpg",
  },
  {
    id: "poe2",
    name: "Path of Exile 2",
    exe: ["PathOfExile2.exe", "PathOfExile2_x64.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2694490/header.jpg",
  },
  {
    id: "thefinals",
    name: "The Finals",
    exe: ["Discovery.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2073850/header.jpg",
  },
  {
    id: "battlefield2042",
    name: "Battlefield 2042",
    exe: ["BF2042.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1517290/header.jpg",
  },
  {
    id: "battlefield5",
    name: "Battlefield V",
    exe: ["bfv.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1238810/header.jpg",
  },
  {
    id: "overwatch2",
    name: "Overwatch 2",
    exe: ["Overwatch.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2357570/header.jpg",
  },
  {
    id: "paladins",
    name: "Paladins",
    exe: ["Paladins.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/444090/header.jpg",
  },
  {
    id: "smite",
    name: "SMITE",
    exe: ["Smite.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/386360/header.jpg",
  },
  {
    id: "hearthstone",
    name: "Hearthstone",
    exe: ["Hearthstone.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/323190/header.jpg",
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    exe: ["GenshinImpact.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1904730/header.jpg",
  },
  {
    id: "hogwarts",
    name: "Hogwarts Legacy",
    exe: ["HogwartsLegacy.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg",
  },
  {
    id: "starfield",
    name: "Starfield",
    exe: ["Starfield.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg",
  },
  {
    id: "fallout4",
    name: "Fallout 4",
    exe: ["Fallout4.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/377160/header.jpg",
  },
  {
    id: "skyrim",
    name: "Skyrim Special Edition",
    exe: ["SkyrimSE.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg",
  },
  {
    id: "thesims4",
    name: "The Sims 4",
    exe: ["TS4_x64.exe", "TS4.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg",
  },
  {
    id: "stardewvalley",
    name: "Stardew Valley",
    exe: ["Stardew Valley.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
  },
  {
    id: "valheim",
    name: "Valheim",
    exe: ["valheim.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
  },
  {
    id: "lostark",
    name: "Lost Ark",
    exe: ["LOSTARK.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1599340/header.jpg",
  },
  {
    id: "new-world",
    name: "New World",
    exe: ["NewWorld.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1063730/header.jpg",
  },
  {
    id: "ffxiv",
    name: "Final Fantasy XIV",
    exe: ["ffxiv_dx11.exe", "ffxiv.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg",
  },
  {
    id: "wow",
    name: "World of Warcraft",
    exe: ["Wow.exe", "WowClassic.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1250410/header.jpg",
  },
  {
    id: "diablo4",
    name: "Diablo IV",
    exe: ["Diablo IV.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2344520/header.jpg",
  },
  {
    id: "monsterhunter",
    name: "Monster Hunter: World",
    exe: ["MonsterHunterWorld.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg",
  },
  {
    id: "sekiro",
    name: "Sekiro: Shadows Die Twice",
    exe: ["sekiro.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg",
  },
  {
    id: "darksouls3",
    name: "Dark Souls III",
    exe: ["DarkSoulsIII.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg",
  },
  {
    id: "forzahorizon5",
    name: "Forza Horizon 5",
    exe: ["ForzaHorizon5.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg",
  },
  {
    id: "halo-infinite",
    name: "Halo Infinite",
    exe: ["HaloInfinite.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg",
  },
  {
    id: "satisfactory",
    name: "Satisfactory",
    exe: ["FactoryGame-Win64-Shipping.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
  },
  {
    id: "subnautica",
    name: "Subnautica",
    exe: ["Subnautica.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg",
  },
  {
    id: "witcher3",
    name: "The Witcher 3: Wild Hunt",
    exe: ["witcher3.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
  },
  {
    id: "doom-eternal",
    name: "DOOM Eternal",
    exe: ["DOOMEternalx64vk.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg",
  },
  {
    id: "bordelands3",
    name: "Borderlands 3",
    exe: ["Borderlands3.exe"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/397540/header.jpg",
  },
]

function getGameImage(imageName) {
  if (window.electron?.isDev) {
    return `/resources/${imageName}`
  }

  return `${window.electron.resourcesPath}/${imageName}`
}

function BlueGrid() {
  return (
    <>
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom,rgba(6,182,212,0.08),transparent_35%)]" />
    </>
  )
}

function FloatingGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/20 blur-3xl"
          style={{
            width: 140 + i * 35,
            height: 140 + i * 35,
            left: `${8 + i * 13}%`,
            top: `${15 + i * 8}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 25, 0],
            opacity: [0.12, 0.24, 0.1, 0.12],
          }}
          transition={{
            duration: 12 + i,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function createPriorityScript(exes, priorityValue) {
  return exes
    .map(
      (exe) => `
New-Item -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exe}\\PerfOptions" -Force | Out-Null
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${exe}\\PerfOptions" -Name "CpuPriorityClass" -Type DWord -Value ${priorityValue}
`
    )
    .join("\n")
}

function GameCard({ game, activeId, loadingId, onApply, onNormal }) {
  const isActive = activeId === game.id
  const isLoading = loadingId === game.id

  return (
    <motion.div
      layout
      className={`
        group relative overflow-hidden rounded-[28px] border bg-maxify-card
        ${isActive ? "border-blue-500/60 shadow-[0_20px_70px_rgba(37,99,235,0.22)]" : "border-maxify-border"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />

      <div className="relative h-44 overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="h-full w-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/600x300/020617/60a5fa?text=Imagem+do+Jogo"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md px-3 py-2 text-xs text-white/80">
          {game.exe.length > 1 ? `${game.exe.length} processos` : game.exe[0]}
        </div>

        {isActive && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-200 backdrop-blur-md">
            <Check size={14} />
            Ativo
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-black text-white">{game.name}</h3>
          <p className="mt-1 text-sm text-white/60">
            Prioridade de CPU pelo Registro do Windows
          </p>
        </div>
      </div>

      <div className="relative p-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onApply(game)}
            disabled={isLoading}
            className="
              inline-flex items-center justify-center gap-2 rounded-2xl
              bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3
              text-sm font-bold text-white transition-all hover:scale-[1.02]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            Priorizar
          </button>

          <button
            onClick={() => onNormal(game)}
            disabled={isLoading}
            className="
              inline-flex items-center justify-center gap-2 rounded-2xl
              border border-maxify-border bg-maxify-border/10 px-4 py-3
              text-sm font-bold text-maxify-text-secondary transition-all
              hover:bg-maxify-border/20 disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <RotateCcw size={16} />
            Normal
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3">
          <p className="text-xs text-maxify-text-secondary">
            Aplica prioridade alta ou volta para prioridade normal neste jogo.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function GamePriority() {
  const [search, setSearch] = useState("")
  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem("maxify:game-priority:active") || ""
    } catch {
      return ""
    }
  })
  const [loadingId, setLoadingId] = useState("")

  const filteredGames = useMemo(() => {
    const value = search.toLowerCase().trim()

    if (!value) return GAMES

    return GAMES.filter(
      (game) =>
        game.name.toLowerCase().includes(value) ||
        game.exe.join(" ").toLowerCase().includes(value)
    )
  }, [search])

  const checkGameRunningScript = (exes) => {
    return exes
      .map((exe) => {
        const processName = exe.replace(".exe", "")
        return `$p = Get-Process -Name "${processName}" -ErrorAction SilentlyContinue
if ($p) { Write-Output "FOUND:${exe}" }`
      })
      .join("\n")
  }

  const runScript = async (game, priorityValue, mode) => {
    if (loadingId) return

    setLoadingId(game.id)

    try {
      const checkScript = checkGameRunningScript(game.exe)

      const checkResult = await invoke({
        channel: "run-powershell",
        payload: { script: checkScript },
      })

      const output =
        checkResult?.output ||
        checkResult?.stdout ||
        checkResult?.data ||
        ""

      if (!String(output).includes("FOUND:")) {
        toast.error(`Abra o ${game.name} primeiro para aplicar a prioridade.`)
        return
      }

      const script = createPriorityScript(game.exe, priorityValue)

      const result = await invoke({
        channel: "run-powershell",
        payload: { script },
      })

      if (result?.success === false) {
        throw new Error(result.error || "Falha ao executar comando.")
      }

      if (mode === "high") {
        setActiveId(game.id)
        localStorage.setItem("maxify:game-priority:active", game.id)
        toast.success(`${game.name} agora está com prioridade alta!`)
      } else {
        if (activeId === game.id) {
          setActiveId("")
          localStorage.removeItem("maxify:game-priority:active")
        }

        toast.success(`${game.name} voltou para prioridade normal!`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao aplicar. Tente abrir o app como administrador.")
    } finally {
      setLoadingId("")
    }
  }

  const applyPriority = (game) => runScript(game, 3, "high")
  const normalPriority = (game) => runScript(game, 2, "normal")

  return (
    <RootDiv>
      <div className="w-full px-6 py-8 md:px-8 overflow-hidden">
        <div className="mx-auto max-w-[1800px] space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[32px] border border-maxify-border bg-maxify-card"
          >
            <BlueGrid />
            <FloatingGlow />

            <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-blue-300">
                  <Sparkles size={14} />
                  Prioridade de Jogos
                </div>

                <h1 className="mt-6 text-4xl lg:text-6xl font-black leading-[1.05] text-maxify-text">
                  Priorize seus
                  <br />
                  jogos favoritos
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    com um clique
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg leading-relaxed text-maxify-text-secondary">
                  Escolha um jogo para aplicar prioridade alta de CPU ou volte para
                  o modo normal quando quiser.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-3 text-sm text-maxify-text-secondary">
                    <Cpu size={17} className="text-blue-400" />
                    Prioridade por processo
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-3 text-sm text-maxify-text-secondary">
                    <ShieldCheck size={17} className="text-cyan-400" />
                    Voltar ao normal
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 py-3 text-sm text-maxify-text-secondary">
                    <Gamepad2 size={17} className="text-sky-400" />
                    {GAMES.length} jogos
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-72 w-72 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10"
                >
                  <div className="absolute inset-6 rounded-full border border-cyan-500/20 bg-cyan-500/5" />
                  <div className="absolute inset-12 rounded-full border border-maxify-border bg-maxify-card/80 backdrop-blur-xl" />
                  <Gamepad2 size={88} className="relative z-10 text-blue-300" />
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[28px] border border-maxify-border bg-maxify-card p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-maxify-text-secondary">
                  Biblioteca
                </p>
                <h2 className="mt-2 text-2xl font-black text-maxify-text">
                  Escolha o jogo
                </h2>
              </div>

              <div className="relative w-full lg:w-[420px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-maxify-text-secondary"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar jogo..."
                  className="
                    w-full rounded-2xl border border-maxify-border
                    bg-maxify-border/10 py-4 pl-11 pr-4 text-sm
                    text-maxify-text outline-none transition-all
                    placeholder:text-maxify-text-secondary
                    focus:border-blue-500/50 focus:bg-blue-500/5
                  "
                />
              </div>
            </div>
          </motion.section>

          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  activeId={activeId}
                  loadingId={loadingId}
                  onApply={applyPriority}
                  onNormal={normalPriority}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </RootDiv>
  )
}