import RootDiv from "@/components/rootdiv"
import { useEffect, useState, useMemo } from "react"
import jsonData from "../../../../package.json"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import Toggle from "@/components/ui/toggle"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
  Download,
  Database,
  Trash2,
  Info,
  Monitor,
  Disc3,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Activity,
  Wrench,
} from "lucide-react"

const themes = [{ label: "Cinza", value: "gray" }]

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

 

  return (
    <>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="bg-maxify-card border border-maxify-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">Excluir Backups Antigos</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tem certeza de que deseja excluir todos os backups antigos do registro? Isso removerá
              permanentemente a pasta{" "}
              <code className="bg-maxify-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
                C:\Maxify\Backup
              </code>{" "}
              e todos os seus arquivos.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
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

      <RootDiv>
        <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
          <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-4">
                  <Sparkles size={15} />
                  Central de preferências do Maxify
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                    <SettingsIcon className="text-blue-400" size={30} />
                  </div>

                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                      Configurações
                    </h1>
                    <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                      Gerencie integrações, privacidade, perfil e dados do Maxify em um só lugar.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5">
                      <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                        4 seções principais
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                        {totalTogglesAtivos} recursos ativos
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                        Maxify v{jsonData.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>


          <SettingSection
            title="Integrações"
            icon={<Bell className="text-blue-400" size={20} />}
          >
            <SettingCard>
              <div className="space-y-3">
                <SettingRow
                  icon={<Monitor className="text-blue-400" size={20} />}
                  iconWrap="bg-blue-500/10 border border-blue-500/20"
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
                  iconWrap="bg-cyan-500/10 border border-cyan-500/20"
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
                  icon={<Monitor className="text-blue-300" size={20} />}
                  iconWrap="bg-sky-500/10 border border-sky-500/20"
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
          </SettingSection>

          <SettingSection
            title="Perfil"
            icon={<User className="text-blue-400" size={20} />}
          >
            <SettingCard>
              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <User className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-maxify-text">Nome do usuário</h3>
                    <p className="text-sm text-maxify-text-secondary">
                      Defina como o Maxify deve identificar você.
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  defaultValue={localStorage.getItem("maxify:user") || ""}
                  onChange={(e) => localStorage.setItem("maxify:user", e.target.value)}
                  className="w-full bg-maxify-card border border-maxify-border rounded-xl px-4 py-3 text-maxify-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Digite seu nome"
                />

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
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
          </SettingSection>

          <SettingSection
            title="Privacidade"
            icon={<Shield className="text-blue-400" size={20} />}
          >
            <SettingCard>
              <SettingRow
                icon={<Shield className="text-blue-400" size={20} />}
                iconWrap="bg-blue-500/10 border border-blue-500/20"
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
          </SettingSection>

          <SettingSection
            title="Gerenciamento de dados"
            icon={<Database className="text-blue-400" size={20} />}
          >
            <SettingCard>
              <div className="space-y-3">
                <SettingRow
                  icon={<Trash2 className="text-red-400" size={20} />}
                  iconWrap="bg-red-500/10 border border-red-500/20"
                  title="Backups antigos"
                  description={
                    <>
                      Remover arquivos de backup antigos armazenados em{" "}
                      <code className="bg-maxify-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
                        C:\Maxify\Backup
                      </code>
                    </>
                  }
                  control={
                    <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                      <Trash2 className="mr-2" size={16} />
                      Excluir backups
                    </Button>
                  }
                />

                <SettingRow
                  icon={<Database className="text-blue-400" size={20} />}
                  iconWrap="bg-blue-500/10 border border-blue-500/20"
                  title="Limpar cache do Maxify"
                  description="Remove arquivos temporários e logs que o Maxify possa ter deixado."
                  control={
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={clearCache}>
                        Limpar cache
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await invoke({ channel: "open-log-folder" })
                        }}
                      >
                        Abrir logs
                      </Button>
                    </div>
                  }
                />
              </div>
            </SettingCard>
          </SettingSection>
          
          <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Info className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Aviso importante</h2>
                <p className="text-sm text-maxify-text-secondary">
                  Algumas opções exigem reinício do app ou permissões elevadas para funcionar por completo.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
              <p className="text-sm text-maxify-text-secondary leading-relaxed">
                Alterações como bandeja do sistema, inicialização com o Windows e privacidade podem
                depender de reinício para refletirem totalmente.
              </p>
            </div>
          </Card>
          <div className="relative overflow-hidden rounded-[24px] border border-maxify-border bg-maxify-card p-6 mt-6">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_35%),radial-gradient(circle_at_left,rgba(59,130,246,0.10),transparent_30%)]" />

  <div className="relative z-10 flex flex-col gap-3">
    <span className="text-sm text-maxify-text-secondary">Projeto desenvolvido por</span>

    <h3 className="text-2xl font-bold text-maxify-text">
      Piolho Cabuloso
    </h3>

    <p className="text-sm text-maxify-text-secondary">
      Acompanhe o conteúdo e novidades no canal oficial.
    </p>

    <a
      href="https://www.youtube.com/@PiolhoCabluloso"
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-fit items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:scale-[1.02] hover:bg-red-500/20"
    >
      Ir para o YouTube
    </a>
  </div>
</div>
        </div>
      </RootDiv>
    </>
  )
}

const StatusBadge = ({ enabled }) => (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full ${enabled
        ? "text-cyan-300 bg-cyan-500/10"
        : "text-maxify-text-secondary bg-maxify-border-secondary/20"
      }`}
  >
    {enabled ? "Ativado" : "Desativado"}
  </span>
)

const SettingCard = ({ children, className = "" }) => (
  <Card className={`bg-maxify-card border border-maxify-border rounded-[24px] p-6 ${className}`}>
    {children}
  </Card>
)

const SettingSection = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-maxify-text">{title}</h2>
      </div>
    </div>
    {children}
  </div>
  
)

const SettingRow = ({ icon, iconWrap = "", title, description, extra, control }) => (
  <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
    <div className="flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconWrap}`}>{icon}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-maxify-text mb-1">{title}</h3>
          <div className="text-sm text-maxify-text-secondary leading-relaxed">
            {description}
            {extra && (
              <span className="inline-flex items-center gap-1 ml-2 text-yellow-500">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
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

export default Settings