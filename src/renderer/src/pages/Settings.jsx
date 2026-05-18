import RootDiv from "@/components/rootdiv"
import { useEffect, useMemo, useState } from "react"
import jsonData from "../../../../package.json"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import Toggle from "@/components/ui/toggle"
import { notify as toast } from "../lib/notify"
import Card from "@/components/ui/Card"
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
  Database,
  Trash2,
  Info,
  Monitor,
  Disc3,
  Sparkles,
  CheckCircle2,
  Activity,
  RefreshCw,
  ChevronRight,
  Rocket,
  AlertTriangle,
  FolderOpen,
  Youtube,
} from "lucide-react"

const themes = [{ label: "Cinza", value: "gray" }]

const BackgroundGlow = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
    </>
  )
}

const SectionTitle = ({ icon: Icon, label, title }) => {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
        <Icon className="h-5 w-5 text-blue-300" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
          {label}
        </p>
        <h2 className="text-lg font-black text-maxify-text">{title}</h2>
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
    </div>
  )
}

function Settings({ onCheckForUpdates }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system")
  const [checking, setChecking] = useState(false)
  const [discordEnabled, setDiscordEnabled] = useState(true)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [trayEnabled, setTrayEnabled] = useState(true)
  const [trayLoading, setTrayLoading] = useState(false)
  const [posthogDisabled, setPosthogDisabled] = useState(() => {
    return localStorage.getItem("posthogDisabled") === "true"
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [autoLaunchLoading, setAutoLaunchLoading] = useState(false)

  useEffect(() => {
    document.body.classList.remove("light", "purple", "dark", "gray", "classic")
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      document.body.classList.add(systemTheme)
    } else if (theme) {
      document.body.classList.add(theme)
    } else {
      document.body.classList.add("dark")
    }
    localStorage.setItem("theme", theme || "dark")
  }, [theme])

  useEffect(() => {
    invoke({ channel: "discord-rpc:get" }).then((status) => setDiscordEnabled(status))
    invoke({ channel: "tray:get" }).then((status) => setTrayEnabled(status))
    invoke({ channel: "auto-launch:get" })
      .then((status) => setAutoLaunch(!!status))
      .catch(() => setAutoLaunch(false))
  }, [])

  useEffect(() => {
    if (posthogDisabled) {
      document.body.classList.add("ph-no-capture")
    } else {
      document.body.classList.remove("ph-no-capture")
    }
    localStorage.setItem("posthogDisabled", posthogDisabled)
  }, [posthogDisabled])

  const handleToggleDiscord = async () => {
    setDiscordLoading(true)
    const newStatus = !discordEnabled
    await invoke({ channel: "discord-rpc:toggle", payload: newStatus })
    setDiscordEnabled(newStatus)
    setDiscordLoading(false)
  }

  const handleCheckUpdates = async () => {
    setChecking(true)

    try {
      const updater = window.updater?.checkForUpdates
        ? window.updater
        : window.updater?.updater

      if (!updater?.checkForUpdates) {
        toast.error("Sistema de atualização não encontrado.")
        console.log("window.updater:", window.updater)
        return
      }

      toast.info("Verificando atualizações...")
      const result = await updater.checkForUpdates()

      if (result?.success === false) {
        toast.warning(result.message || "Não foi possível verificar atualização.")
      }
    } catch (err) {
      toast.error("Erro ao verificar atualizações.")
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  const handleToggleAutoLaunch = async () => {
    setAutoLaunchLoading(true)
    const newStatus = !autoLaunch
    await invoke({ channel: "auto-launch:set", payload: newStatus })
    setAutoLaunch(newStatus)
    setAutoLaunchLoading(false)
  }

  const clearCache = async () => {
    await invoke({ channel: "clear-maxify-cache" })
    localStorage.removeItem("maxify:systemInfo")
    localStorage.removeItem("maxify:tweakInfo")
    toast.success("Cache do Maxify limpo com sucesso!")
  }

  const handleToggleTray = async () => {
    setTrayLoading(true)
    const newStatus = !trayEnabled
    await invoke({ channel: "tray:set", payload: newStatus })
    setTrayEnabled(newStatus)
    setTrayLoading(false)
  }

  const totalTogglesAtivos = useMemo(() => {
    let total = 0
    if (autoLaunch) total++
    if (discordEnabled) total++
    if (trayEnabled) total++
    if (!posthogDisabled) total++
    return total
  }, [autoLaunch, discordEnabled, trayEnabled, posthogDisabled])

  const statusCards = useMemo(
    () => [
      {
        label: "Recursos ativos",
        value: `${totalTogglesAtivos}/4`,
        helper: "Preferências ligadas",
        icon: Activity,
        accent: "blue",
      },
      {
        label: "Inicialização",
        value: autoLaunch ? "Ativa" : "Off",
        helper: "Abrir junto com Windows",
        icon: Monitor,
        accent: "cyan",
      },
      {
        label: "Discord",
        value: discordEnabled ? "Online" : "Off",
        helper: "Rich Presence",
        icon: Disc3,
        accent: "sky",
      },
      {
        label: "Versão",
        value: `v${jsonData.version}`,
        helper: "Build instalada",
        icon: Rocket,
        accent: "indigo",
      },
    ],
    [autoLaunch, discordEnabled, totalTogglesAtivos]
  )

  return (
    <>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="mx-4 w-full max-w-md overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-7 shadow-2xl shadow-black/20">
          <div className="relative mb-6 text-center">
            <div className="absolute inset-x-0 -top-16 mx-auto h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />

            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] border border-red-500/20 bg-red-500/10">
              <Trash2 className="h-8 w-8 text-red-400" />
            </div>

            <h2 className="text-xl font-black text-maxify-text">Excluir backups antigos</h2>

            <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
              Tem certeza de que deseja excluir todos os backups antigos do registro? Isso removerá permanentemente a pasta{" "}
              <code className="rounded-md bg-maxify-border/30 px-1.5 py-0.5 text-xs text-red-300">
                C:\Maxify\Backup
              </code>{" "}
              e todos os seus arquivos.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDeleteModalOpen(false)
                invoke({ channel: "delete-old-maxify-backups" })
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <RootDiv className="min-h-full w-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
          <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
            <BackgroundGlow />

            <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_380px] xl:items-center">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                  <Sparkles size={14} />
                  Central de preferências
                </div>

                <div className="flex items-start gap-5">
                  <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                    <SettingsIcon className="h-9 w-9 text-blue-300" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                      Configurações em{" "}
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                        modo premium
                      </span>
                    </h1>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                      Gerencie integrações, privacidade, perfil, dados e atualizações do Maxify em uma interface mais limpa, modular e combinando com o tema principal.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                        4 seções principais
                      </div>

                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                        {totalTogglesAtivos} recursos ativos
                      </div>

                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                        Maxify v{jsonData.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section>
            <SectionTitle icon={Activity} label="Resumo" title="Status das configurações" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statusCards.map((stat, index) => (
                <StatusCard key={index} {...stat} />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle icon={Bell} label="Integrações" title="Serviços conectados ao Maxify" />

            <SettingCard>
              <div className="space-y-3">
                <SettingRow
                  icon={<Monitor className="text-blue-300" size={20} />}
                  iconWrap="border-blue-500/25 bg-blue-500/10"
                  title="Iniciar com o Windows"
                  description="O Maxify será iniciado automaticamente ao ligar o PC."
                  control={
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={autoLaunch}
                        onChange={handleToggleAutoLaunch}
                        disabled={autoLaunchLoading}
                      />
                      <StatusBadge enabled={autoLaunch} />
                    </div>
                  }
                />

                <SettingRow
                  icon={<Disc3 className="text-cyan-300" size={20} />}
                  iconWrap="border-cyan-500/25 bg-cyan-500/10"
                  title="Discord Rich Presence"
                  description="Mostrar sua atividade do Maxify no Discord."
                  control={
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={discordEnabled}
                        onChange={handleToggleDiscord}
                        disabled={discordLoading}
                      />
                      <StatusBadge enabled={discordEnabled} />
                    </div>
                  }
                />

                <SettingRow
                  icon={<Monitor className="text-sky-300" size={20} />}
                  iconWrap="border-sky-500/25 bg-sky-500/10"
                  title="Ícone na Bandeja do Sistema"
                  description="Ativar ou desativar o Maxify na bandeja do sistema."
                  extra="Reinício necessário"
                  control={
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={trayEnabled}
                        onChange={handleToggleTray}
                        disabled={trayLoading}
                      />
                      <StatusBadge enabled={trayEnabled} />
                    </div>
                  }
                />
              </div>
            </SettingCard>
          </section>

          <section>
            <SectionTitle icon={User} label="Perfil" title="Identificação do usuário" />

            <SettingCard>
              <div className="rounded-[26px] border border-maxify-border bg-maxify-bg/30 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <User className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-maxify-text">Nome do usuário</h3>
                    <p className="text-sm text-maxify-text-secondary">
                      Defina como o Maxify deve identificar você.
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  defaultValue={localStorage.getItem("maxify:user") || ""}
                  onChange={(e) => localStorage.setItem("maxify:user", e.target.value)}
                  className="w-full rounded-2xl border border-maxify-border bg-maxify-card px-4 py-3 text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary/50 focus:border-blue-500/50 focus:bg-blue-500/10 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Digite seu nome"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={async () => {
                      const username = await invoke({ channel: "get-user-name" })
                      localStorage.setItem("maxify:user", username)
                      toast.success("Nome redefinido para o usuário do sistema")
                    }}
                  >
                    Redefinir para o nome do sistema
                  </Button>
                </div>
              </div>
            </SettingCard>
          </section>

          <section>
            <SectionTitle icon={Shield} label="Privacidade" title="Controle de análise e captura" />

            <SettingCard>
              <SettingRow
                icon={<Shield className="text-blue-300" size={20} />}
                iconWrap="border-blue-500/25 bg-blue-500/10"
                title="Desativar análises"
                description="Desativa as análises do Posthog."
                extra="Reinício necessário"
                control={
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={posthogDisabled}
                      onChange={() => setPosthogDisabled((v) => !v)}
                    />
                    <StatusBadge enabled={!posthogDisabled} />
                  </div>
                }
              />
            </SettingCard>
          </section>

          <section>
            <SectionTitle icon={Database} label="Dados" title="Gerenciamento local" />

            <SettingCard>
              <div className="space-y-3">
                <SettingRow
                  icon={<Trash2 className="text-red-300" size={20} />}
                  iconWrap="border-red-500/25 bg-red-500/10"
                  title="Backups antigos"
                  description={
                    <>
                      Remover arquivos de backup antigos armazenados em{" "}
                      <code className="rounded-md bg-maxify-border/30 px-1.5 py-0.5 text-xs text-red-300">
                        C:\Maxify\Backup
                      </code>
                    </>
                  }
                  control={
                    <Button variant="danger" className="rounded-2xl" onClick={() => setDeleteModalOpen(true)}>
                      <Trash2 className="mr-2" size={16} />
                      Excluir backups
                    </Button>
                  }
                />

                <SettingRow
                  icon={<Database className="text-blue-300" size={20} />}
                  iconWrap="border-blue-500/25 bg-blue-500/10"
                  title="Limpar cache do Maxify"
                  description="Remove arquivos temporários e logs que o Maxify possa ter deixado."
                  control={
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="rounded-2xl" onClick={clearCache}>
                        Limpar cache
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={async () => {
                          await invoke({ channel: "open-log-folder" })
                        }}
                      >
                        <FolderOpen className="mr-2" size={16} />
                        Abrir logs
                      </Button>
                    </div>
                  }
                />
              </div>
            </SettingCard>
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <InfoCard
              icon={Info}
              label="Aviso importante"
              title="Reinício pode ser necessário"
              description="Algumas opções exigem reinício do app ou permissões elevadas para funcionar por completo."
              accent="blue"
              className="xl:col-span-1"
            />

            <Card className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25 xl:col-span-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_48%)] opacity-80" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
                    <Youtube className="text-red-300" size={22} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-red-300" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">
                  Projeto desenvolvido por
                </p>
                <h3 className="mt-2 text-2xl font-black text-maxify-text">Piolho Cabuloso</h3>
                <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                  Acompanhe o conteúdo e novidades no canal oficial.
                </p>

                <a
                  href="https://www.youtube.com/@PiolhoCabluloso"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:scale-[1.02] hover:bg-red-500/20"
                >
                  Ir para o YouTube
                </a>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25 xl:col-span-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-80" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                    {checking ? (
                      <RefreshCw className="animate-spin text-blue-300" size={22} />
                    ) : (
                      <RefreshCw className="text-blue-300" size={22} />
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                  Sistema de atualização
                </p>
                <h3 className="mt-2 text-2xl font-black text-maxify-text">Verificar atualizações</h3>
                <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                  Versão atual instalada: Maxify v{jsonData.version}
                </p>

                <button
                  onClick={handleCheckUpdates}
                  disabled={checking}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 transition hover:scale-[1.02] hover:bg-blue-500/20 disabled:opacity-60"
                >
                  {checking ? "Verificando..." : "Verificar atualização"}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </RootDiv>
    </>
  )
}

const StatusCard = ({ icon: Icon, label, value, helper, accent = "blue" }) => {
  const accentMap = {
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
  }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className={`rounded-2xl border p-3 ${accentMap[accent] || accentMap.blue}`}>
            <Icon className="h-5 w-5" />
          </div>

          <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
          {label}
        </p>
        <h3 className="mt-2 text-3xl font-black leading-none text-maxify-text">{value}</h3>
        <p className="mt-2 text-xs leading-5 text-maxify-text-secondary/85">{helper}</p>
      </div>
    </div>
  )
}

const StatusBadge = ({ enabled }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
      enabled
        ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
        : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary"
    }`}
  >
    <span className="h-2 w-2 rounded-full bg-current" />
    {enabled ? "Ativado" : "Desativado"}
  </span>
)

const SettingCard = ({ children, className = "" }) => (
  <Card className={`relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 ${className}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_46%)]" />
    <div className="relative z-10">{children}</div>
  </Card>
)

const SettingRow = ({ icon, iconWrap = "", title, description, extra, control }) => (
  <div className="group rounded-[24px] border border-maxify-border bg-maxify-bg/30 p-4 transition-all hover:border-blue-500/25 hover:bg-blue-500/5">
    <div className="flex flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className={`shrink-0 rounded-2xl border p-3 ${iconWrap}`}>{icon}</div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-[15px] font-black text-maxify-text">{title}</h3>
          <div className="text-sm leading-relaxed text-maxify-text-secondary">
            {description}
            {extra && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                {extra}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">{control}</div>
    </div>
  </div>
)

const InfoCard = ({ icon: Icon, label, title, description, className = "" }) => (
  <Card className={`group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25 ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_48%)] opacity-80" />

    <div className="relative z-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
          <Icon className="text-blue-300" size={22} />
        </div>
        <AlertTriangle className="h-4 w-4 text-yellow-400" />
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
        {label}
      </p>
      <h3 className="mt-2 text-2xl font-black text-maxify-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">{description}</p>
    </div>
  </Card>
)

export default Settings
