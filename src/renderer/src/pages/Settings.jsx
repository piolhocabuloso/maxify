import RootDiv from "@/components/rootdiv"
import { useEffect, useState } from "react"
import jsonData from "../../../../package.json"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import Toggle from "@/components/ui/toggle"
import { toast } from "react-toastify"
import Card from "@/components/ui/Card"
import { Settings as SettingsIcon, Bell, Shield, User, Download, Database, Trash2, Info, Monitor, Disc3 } from "lucide-react"

const themes = [
  { label: "Cinza", value: "gray" }
]

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

  const checkForUpdates = async () => {
    try {
      setChecking(true)
      const res = await invoke({ channel: "updater:check" })
      if (res?.ok && !res.updateInfo) {
        toast.success("Você já está na versão mais recente")
      }
    } catch (e) {
      toast.error(String(e))
    } finally {
      setChecking(false)
    }
  }

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

  const clearCache = async () => {
    await invoke({ channel: "clear-sparkle-cache" })
    localStorage.removeItem("sparkle:systemInfo")
    localStorage.removeItem("sparkle:tweakInfo")
    toast.success("Cache do Sparkle limpo com sucesso!")
  }

  const handleToggleTray = async () => {
    setTrayLoading(true)
    const newStatus = !trayEnabled
    await invoke({ channel: "tray:set", payload: newStatus })
    setTrayEnabled(newStatus)
    setTrayLoading(false)
  }

  return (
    <>
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">Excluir Backups Antigos</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tem certeza de que deseja excluir todos os backups antigos do registro? Isso removerá permanentemente a pasta{" "}
              <code className="bg-sparkle-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
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
                invoke({ channel: "delete-old-sparkle-backups" })
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
      
      <RootDiv>
        <div className="max-w-[2000px] mx-auto px-6 pb-16">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <SettingsIcon className="text-blue-500" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sparkle-text">Configurações</h1>
              <p className="text-sparkle-text-secondary">Gerencie as preferências do Maxify</p>
            </div>
          </div>

          <div className="space-y-8">
            

            {/* Integrações */}
            <SettingSection 
              title="Integrações" 
              icon={<Bell className="text-teal-500" size={20} />}
            >
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Disc3 className="text-purple-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-sparkle-text mb-1">
                        Discord Rich Presence
                      </h3>
                      <p className="text-sm text-sparkle-text-secondary">
                        Mostrar sua atividade do Maxify no Discord
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={discordEnabled}
                      onChange={handleToggleDiscord}
                      disabled={discordLoading}
                    />
                    <StatusBadge enabled={discordEnabled} />
                  </div>
                </div>
              </SettingCard>

              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Monitor className="text-orange-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-sparkle-text mb-1">
                        Ícone na Bandeja do Sistema
                      </h3>
                      <p className="text-sm text-sparkle-text-secondary">
                        Ativar ou desativar o Maxify na bandeja do sistema
                        <span className="inline-flex items-center gap-1 ml-2 text-yellow-500">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                          Reinício necessário
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={trayEnabled}
                      onChange={handleToggleTray}
                      disabled={trayLoading}
                    />
                    <StatusBadge enabled={trayEnabled} />
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            

            {/* Perfil */}
            <SettingSection 
              title="Perfil" 
              icon={<User className="text-purple-500" size={20} />}
            >
              <SettingCard>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-purple-500" size={20} />
                    <h3 className="text-base font-medium text-sparkle-text">Nome do Usuário</h3>
                  </div>
                  <input
                    type="text"
                    defaultValue={localStorage.getItem("sparkle:user") || ""}
                    onChange={(e) => localStorage.setItem("sparkle:user", e.target.value)}
                    className="w-full bg-sparkle-card border border-sparkle-border rounded-xl px-4 py-3 text-sparkle-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Digite seu nome"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        const username = await invoke({ channel: "get-user-name" })
                        localStorage.setItem("sparkle:user", username)
                        toast.success("Nome redefinido para o usuário do sistema")
                      }}
                    >
                      Redefinir para o Nome do Sistema
                    </Button>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            {/* Privacidade */}
            <SettingSection 
              title="Privacidade" 
              icon={<Shield className="text-red-500" size={20} />}
            >
              <SettingCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Shield className="text-red-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-sparkle-text mb-1">
                        Desativar Análises
                      </h3>
                      <p className="text-sm text-sparkle-text-secondary">
                        Desativa as análises do Posthog
                        <span className="inline-flex items-center gap-1 ml-2 text-yellow-500">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                          Reinício necessário
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={posthogDisabled}
                      onChange={() => setPosthogDisabled((v) => !v)}
                    />
                    <StatusBadge enabled={!posthogDisabled} />
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            {/* Gerenciamento de Dados */}
            <SettingSection 
              title="Gerenciamento de Dados" 
              icon={<Database className="text-orange-500" size={20} />}
            >
              <SettingCard>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Trash2 className="text-red-500" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-sparkle-text mb-1">
                          Backups Antigos
                        </h3>
                        <p className="text-sm text-sparkle-text-secondary">
                          Remover arquivos de backup antigos armazenados em{" "}
                          <code className="bg-sparkle-border-secondary/20 px-1 py-0.5 rounded-sm text-xs">
                            C:\Maxify\Backup
                          </code>
                        </p>
                      </div>
                    </div>
                    <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                      <Trash2 className="mr-2" size={16} />
                      Excluir Backups
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Database className="text-blue-500" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-sparkle-text mb-1">
                          Limpar Cache do Maxify
                        </h3>
                        <p className="text-sm text-sparkle-text-secondary">
                          Remove arquivos temporários e logs que o Maxify possa ter deixado
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={clearCache}>
                        Limpar Cache
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await invoke({ channel: "open-log-folder" })
                        }}
                      >
                        Abrir Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </SettingCard>
            </SettingSection>

            
          </div>
        </div>
      </RootDiv>
    </>
  )
}

// Componente auxiliar para badge de status
const StatusBadge = ({ enabled }) => (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full ${
      enabled
        ? "text-green-400 bg-green-400/10"
        : "text-sparkle-text-secondary bg-sparkle-border-secondary/20"
    }`}
  >
    {enabled ? "Ativado" : "Desativado"}
  </span>
)

// Componentes de seção e card
const SettingCard = ({ children, className = "" }) => (
  <Card className={`p-6 bg-sparkle-card border border-sparkle-border rounded-2xl ${className}`}>
    {children}
  </Card>
)

const SettingSection = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-xl font-bold text-sparkle-text">{title}</h2>
    </div>
    {children}
  </div>
)

export default Settings