import { useState, useMemo } from "react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
    Power,
    ShieldOff,
    BellOff,
    WifiOff,
    Printer,
    SearchX,
    Cpu,
    Trash2,
    Play,
    CheckCircle2,
    RefreshCw,
    Settings2,
    ChevronRight,
} from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import { toast } from "react-toastify"

const comandosDesativar = [
     {
        id: "hipervisor",
        label: "Desativar Hypervisor",
        description: "Desliga o hypervisor na inicialização.",
        icon: <Cpu size={18} />,
        category: "sistema",
        command: `bcdedit /set hypervisorlaunchtype off`,
        warning: true,
    },
    {
        id: "dynamicTick",
        label: "Desativar Dynamic Tick",
        description: "Desativa o Dynamic Tick do boot.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `bcdedit /set disabledynamictick yes`,
    },
    {
        id: "coreParking",
        label: "Desativar Core Parking",
        description: "Desativa o estacionamento de núcleos.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\54533251-82be-4824-96c1-47b60b740d00\\0cc5b647-c1df-4637-891a-dec35c318583" /v ValueMin /t REG_DWORD /d 0 /f && reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\54533251-82be-4824-96c1-47b60b740d00\\0cc5b647-c1df-4637-891a-dec35c318583" /v ValueMax /t REG_DWORD /d 0 /f`,
    },
    {
        id: "powerThrottling",
        label: "Desativar Power Throttling",
        description: "Desliga limitação de energia do Windows.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerThrottling" /v PowerThrottlingOff /t REG_DWORD /d 1 /f`,
    },
    {
        id: "aspm",
        label: "Desativar ASPM",
        description: "Desliga economia de energia do PCI Express.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `powercfg -attributes SUB_PCIEXPRESS ASPM -ATTRIB_HIDE && powercfg -setacvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0 && powercfg -setactive SCHEME_CURRENT`,
    },
    {
        id: "economiaUsb",
        label: "Desativar economia de dispositivos",
        description: "Desliga suspensão seletiva de USB.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `powercfg -setacvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVE SUSPEND 0 && powercfg -setactive SCHEME_CURRENT`,
    },
    {
        id: "hibernacao",
        label: "Desativar Hibernação / Fast Startup",
        description: "Desliga hibernação e inicialização rápida.",
        icon: <Power size={18} />,
        category: "sistema",
        command: `powercfg -h off`,
    },
    {
        id: "hybridSleep",
        label: "Desativar Hybrid Sleep",
        description: "Desliga modo de sono híbrido.",
        icon: <Power size={18} />,
        category: "sistema",
        command: `powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HYBRIDSLEEP 0 && powercfg /setactive SCHEME_CURRENT`,
    },
    {
        id: "sleepTimeout",
        label: "Desativar Standby",
        description: "Remove tempo limite de suspensão na energia.",
        icon: <Power size={18} />,
        category: "sistema",
        command: `powercfg -change -standby-timeout-ac 0`,
    },
    {
        id: "modernStandby",
        label: "Desativar Modern Standby",
        description: "Desativa o Modern Standby pelo registro.",
        icon: <Power size={18} />,
        category: "sistema",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power" /v PlatformAoAcOverride /t REG_DWORD /d 0 /f`,
    },
    {
        id: "indexacao",
        label: "Desativar Indexação",
        description: "Desativa o Windows Search.",
        icon: <SearchX size={18} />,
        category: "servicos",
        command: `sc stop WSearch && sc config WSearch start= disabled`,
    },
    {
        id: "windowsUpdate",
        label: "Desativar Windows Update",
        description: "Desliga serviços do Windows Update, UsoSvc e BITS.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `sc stop wuauserv && sc config wuauserv start= disabled && sc stop UsoSvc && sc config UsoSvc start= disabled && sc stop bits && sc config bits start= disabled`,
        warning: true,
    },
    {
        id: "bluetooth",
        label: "Desativar Bluetooth",
        description: "Desliga o serviço do Bluetooth.",
        icon: <WifiOff size={18} />,
        category: "rede",
        command: `sc stop bthserv && sc config bthserv start= disabled`,
        warning: true,
    },
    {
        id: "telemetria",
        label: "Desativar Telemetria",
        description: "Reduz coleta de dados e rastreamento do Windows.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `reg add "HKCU\\Control Panel\\International\\User Profile" /v "HttpAcceptLanguageOptOut" /t REG_DWORD /d 1 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v "Enabled" /t REG_DWORD /d 0 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AppHost" /v "EnableWebContentEvaluation" /t REG_DWORD /d 0 /f && reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f && reg add "HKLM\\Software\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f && reg add "HKLM\\Software\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v "DisabledByGroupPolicy" /t REG_DWORD /d 1 /f && reg add "HKLM\\Software\\Policies\\Microsoft\\Windows\\OneDrive" /v "DisableFileSyncNGSC" /t REG_DWORD /d 1 /f && reg add "HKLM\\Software\\Policies\\Microsoft\\Windows\\Windows Error Reporting" /v "DontSendAdditionalData" /t REG_DWORD /d 1 /f`,
        warning: true,
    },
    {
        id: "diagtrack",
        label: "Desativar DiagTrack",
        description: "Desliga o serviço de diagnóstico do Windows.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `sc stop DiagTrack && sc config DiagTrack start= disabled`,
        warning: true,
    },
    {
        id: "uac",
        label: "Desativar UAC",
        description: "Desliga o Controle de Conta de Usuário.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f`,
        warning: true,
    },
    {
        id: "notificacoes",
        label: "Desativar Notificações",
        description: "Desliga notificações toast do sistema.",
        icon: <BellOff size={18} />,
        category: "visual",
        command: `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications" /v ToastEnabled /t REG_DWORD /d 0 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v NOC_GLOBAL_SETTING_TOASTS_ENABLED /t REG_DWORD /d 0 /f`,
    },
    {
        id: "fso",
        label: "Desativar Fullscreen Optimizations",
        description: "Desliga FSO e GameDVR.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: `reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_Enabled" /t REG_DWORD /d 0 /f && reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_FSEBehaviorMode" /t REG_DWORD /d 2 /f && reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_HonorUserFSEBehaviorMode" /t REG_DWORD /d 0 /f && reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_DXGIHonorFSEWindowsCompatible" /t REG_DWORD /d 1 /f && reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_EFSEFeatureFlags" /t REG_DWORD /d 0 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v "AppCaptureEnabled" /t REG_DWORD /d 0 /f && reg add "HKLM\\SOFTWARE\\Microsoft\\PolicyManager\\default\\ApplicationManagement\\AllowGameDVR" /v "value" /t REG_DWORD /d 0 /f && reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v "AllowGameDVR" /t REG_DWORD /d 0 /f`,
    },
    {
        id: "gpuScheduling",
        label: "Desativar GPU Scheduling",
        description: "Desliga ajuste ligado ao agendamento acelerado/GameDVR.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: `reg add "HKCU\\System\\GameConfigStore" /v "GameDVR_Enabled" /t REG_DWORD /d 0 /f`,
    },
    {
        id: "transparenciaTaskbar",
        label: "Desativar transparência",
        description: "Remove transparência da barra e tema.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v EnableTransparency /t REG_DWORD /d 0 /f`,
    },
    {
        id: "roundedCorners",
        label: "Desativar cantos arredondados",
        description: "Desliga arredondamento visual do Explorer.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v EnableRoundedCorners /t REG_DWORD /d 0 /f`,
    },
    {
        id: "manutencao",
        label: "Desativar manutenção automática",
        description: "Desabilita tarefa de manutenção do Windows.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `schtasks /Change /TN "\\Microsoft\\Windows\\TaskScheduler\\Maintenance Configurator" /Disable`,
    },
    {
        id: "tarefasExperiencia",
        label: "Desativar tarefas de experiência",
        description: "Desliga tarefas ProgramDataUpdater e Consolidator.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `schtasks /Change /TN "\\Microsoft\\Windows\\Application Experience\\ProgramDataUpdater" /Disable && schtasks /Change /TN "\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator" /Disable`,
    },
    {
        id: "xbox",
        label: "Desativar serviços Xbox",
        description: "Desliga serviços do Xbox no sistema.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `sc stop XblAuthManager && sc stop XblGameSave && sc stop XboxNetApiSvc && sc config XblAuthManager start= disabled && sc config XblGameSave start= disabled && sc config XboxNetApiSvc start= disabled`,
    },
    {
        id: "sysmain",
        label: "Desativar SysMain",
        description: "Desliga o serviço SysMain.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `sc stop SysMain && sc config SysMain start= disabled`,
    },
    {
        id: "ramDiagnostic",
        label: "Desativar diagnóstico de RAM",
        description: "Desabilita tarefas de diagnóstico de memória.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `schtasks /Change /TN "\\Microsoft\\Windows\\MemoryDiagnostic\\ProcessMemoryDiagnosticEvents" /Disable && schtasks /Change /TN "\\Microsoft\\Windows\\MemoryDiagnostic\\RunFullMemoryDiagnostic" /Disable`,
    },
    {
        id: "ramErrorDiag",
        label: "Desativar erro de RAM no boot",
        description: "Restaura BootExecute sem diagnóstico extra.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager" /v BootExecute /t REG_MULTI_SZ /d "autocheck autochk *" /f`,
    },
    {
        id: "prefetcher",
        label: "Desativar Prefetcher",
        description: "Desliga o Prefetcher do Windows.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 0 /f`,
    },
    {
        id: "kernelPaging",
        label: "Desativar Kernel Paging",
        description: "Evita paginação do kernel.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management" /v DisablePagingExecutive /t REG_DWORD /d 1 /f`,
    },
    {
        id: "clearPagefile",
        label: "Limpar pagefile no desligamento",
        description: "Limpa pagefile ao desligar o Windows.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management" /v ClearPageFileAtShutdown /t REG_DWORD /d 1 /f`,
    },
    {
        id: "nagles",
        label: "Desativar Nagle / throttling de rede",
        description: "Ajusta resposta de rede para menor latência.",
        icon: <WifiOff size={18} />,
        category: "rede",
        command: `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 4294967295 /f && reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f`,
    },
    {
        id: "displayPowerSaving",
        label: "Desativar economia gráfica",
        description: "Desliga economia dinâmica de GPU/display.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v DisableDynamicPstate /t REG_DWORD /d 1 /f`,
    },
    {
        id: "energyLogging",
        label: "Desativar Energy Logging",
        description: "Desliga logs de energia e telemetria de consumo.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\EnergyEstimation\\TaggedEnergy" /v DisableTaggedEnergyLogging /t REG_DWORD /d 1 /f && reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\EnergyEstimation\\TaggedEnergy" /v TelemetryMaxApplication /t REG_DWORD /d 0 /f && reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\EnergyEstimation\\TaggedEnergy" /v TelemetryMaxTagPerApplication /t REG_DWORD /d 0 /f`,
    },
    {
        id: "memoryLogging",
        label: "Desativar Memory Logging",
        description: "Reduz logs de diagnóstico do sistema.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Diagnostics\\DiagTrack" /v ShowedToastAtLevel /t REG_DWORD /d 0 /f`,
    },
    {
        id: "nvidiaLogging",
        label: "Desativar logs da NVIDIA",
        description: "Desliga logs e preferência de telemetria da NVIDIA.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: `reg add "HKLM\\SOFTWARE\\NVIDIA Corporation\\Global\\NvTelemetry" /v EnableLogging /t REG_DWORD /d 0 /f && reg add "HKLM\\SOFTWARE\\NVIDIA Corporation\\NvControlPanel2\\Client" /v OptInOrOutPreference /t REG_DWORD /d 0 /f`,
    },
    {
        id: "nvidiaUpdate",
        label: "Desativar atualização NVIDIA",
        description: "Desliga tarefas e serviço de update da NVIDIA.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `sc stop NvContainerLocalSystem && sc config NvContainerLocalSystem start= disabled`,
    },
    {
        id: "firefoxUpdates",
        label: "Desativar update do Firefox",
        description: "Desliga atualização automática do Firefox.",
        icon: <Power size={18} />,
        category: "servicos",
        command: `reg add "HKLM\\SOFTWARE\\Policies\\Mozilla\\Firefox" /v DisableAppUpdate /t REG_DWORD /d 1 /f`,
    },
    {
        id: "bootOptimize",
        label: "Desativar Boot Optimize",
        description: "Desliga otimização de boot do desfragmentador.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: `reg add "HKLM\\SOFTWARE\\Microsoft\\Dfrg\\BootOptimizeFunction" /v Enable /t REG_SZ /d N /f`,
    },
    {
        id: "csrssPriority",
        label: "Ajustar prioridade do csrss",
        description: "Aplica prioridade maior ao csrss.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\csrss.exe\\PerfOptions" /v CpuPriorityClass /t REG_DWORD /d 4 /f && reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\csrss.exe\\PerfOptions" /v IoPriority /t REG_DWORD /d 3 /f`,
        warning: true,
    },
]

const categorias = [
    { id: "all", label: "Tudo" },
    { id: "sistema", label: "Sistema" },
    { id: "servicos", label: "Serviços" },
    { id: "cpu", label: "CPU" },
    { id: "rede", label: "Rede" },
    { id: "visual", label: "Visual" },
    { id: "seguranca", label: "Segurança" },
]


export default function Desativar() {
    const [selecionados, setSelecionados] = useState([])
    const [executando, setExecutando] = useState(false)
    const [fila, setFila] = useState([])
    const [categoriaAtiva, setCategoriaAtiva] = useState("all")
    const [resultados, setResultados] = useState({})

    const alternar = (id) => {
        setSelecionados((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const selecionarTodos = () => {
        if (categoriaAtiva === "all") {
            setSelecionados(comandosDesativar.map((item) => item.id))
            return
        }

        setSelecionados(
            comandosDesativar
                .filter((item) => item.category === categoriaAtiva)
                .map((item) => item.id)
        )
    }

    const limparSelecao = () => {
        setSelecionados([])
    }

    const filtrados = useMemo(() => {
        if (categoriaAtiva === "all") return comandosDesativar
        return comandosDesativar.filter((item) => item.category === categoriaAtiva)
    }, [categoriaAtiva])

    const executarSelecionados = async () => {
        if (selecionados.length === 0) {
            toast.warning("Selecione pelo menos uma opção.")
            return
        }

        setExecutando(true)
        let novosResultados = {}

        for (const item of comandosDesativar) {
            if (!selecionados.includes(item.id)) continue

            setFila((prev) => [...prev, item.id])
            const toastId = toast.loading(`Aplicando ${item.label}...`)

            try {
                await invoke({
                    channel: "run-powershell",
                    payload: {
                        script: item.command,
                        name: `desativar-${item.id}-${Date.now()}`
                    },
                })

                novosResultados[item.id] = "success"

                toast.update(toastId, {
                    render: `${item.label} aplicado com sucesso.`,
                    type: "success",
                    isLoading: false,
                    autoClose: 2500,
                })
            } catch (err) {
                novosResultados[item.id] = "error"

                toast.update(toastId, {
                    render: `Erro em ${item.label}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                })
            } finally {
                setFila((prev) => prev.filter((x) => x !== item.id))
                setResultados((prev) => ({ ...prev, ...novosResultados }))
            }
        }

        setExecutando(false)
        toast.success("Processo concluído.")
    }

    const totalSucesso = Object.values(resultados).filter((x) => x === "success").length
    const totalErro = Object.values(resultados).filter((x) => x === "error").length

    return (
        <RootDiv>
            <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
                <div className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-8 mt-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_30%)]" />
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-4">
                                <Power size={15} />
                                Central de desativação
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                    <Power className="text-blue-400" size={30} />
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                                        Desativar recursos do sistema
                                    </h1>
                                    <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                                        Gerencie opções para desligar serviços, funções e recursos que podem afetar desempenho.
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-5">
                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            {comandosDesativar.length} opções disponíveis
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            {selecionados.length} selecionadas
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-maxify-border/20 text-maxify-text-secondary text-sm border border-maxify-border">
                                            {totalSucesso} aplicadas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-maxify-text">Filtrar por categoria</h2>
                            <p className="text-sm text-maxify-text-secondary">Escolha o grupo que deseja visualizar</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={selecionarTodos} disabled={executando} variant="outline" size="sm">
                                Selecionar todos
                            </Button>
                            <Button onClick={limparSelecao} disabled={executando} variant="outline" size="sm">
                                Limpar seleção
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categorias.map((categoria) => (
                            <button
                                key={categoria.id}
                                onClick={() => setCategoriaAtiva(categoria.id)}
                                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all border ${categoriaAtiva === categoria.id
                                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10"
                                    : "bg-maxify-border/20 text-maxify-text-secondary border-maxify-border hover:bg-maxify-border/35"
                                    }`}
                            >
                                {categoria.label}
                            </button>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
                    <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-maxify-text">Opções de desativação</h2>
                                <p className="text-sm text-maxify-text-secondary">
                                    {filtrados.length} disponíveis • {selecionados.length} selecionadas
                                </p>
                            </div>

                            {executando && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                                    <RefreshCw className="animate-spin" size={16} />
                                    <span className="text-sm font-medium">Executando</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filtrados.map((item) => {
                                const ativo = selecionados.includes(item.id)
                                const carregando = fila.includes(item.id)
                                const status = resultados[item.id]

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative rounded-2xl border p-4 transition-all ${ativo
                                            ? "border-blue-500 bg-blue-500/10"
                                            : "border-maxify-border bg-maxify-border/10 hover:border-blue-400/40"
                                            } ${carregando ? "opacity-80" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div
                                                    className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${item.warning ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                                                        }`}
                                                >
                                                    {item.icon}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[15px] font-semibold text-maxify-text">
                                                            {item.label}
                                                        </span>

                                                        {item.warning && (
                                                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-500/15 text-red-400">
                                                                Cuidado
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-maxify-text-secondary mt-1 leading-relaxed">
                                                        {item.description}
                                                    </p>

                                                    <div className="mt-2">
                                                        {status === "success" && (
                                                            <span className="text-sm font-medium text-cyan-400">Aplicado com sucesso</span>
                                                        )}
                                                        {status === "error" && (
                                                            <span className="text-sm font-medium text-red-400">Falhou</span>
                                                        )}
                                                        {!status && (
                                                            <span className="text-sm font-medium text-slate-400">Pendente</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Toggle
                                                checked={ativo}
                                                onChange={() => alternar(item.id)}
                                                disabled={executando || carregando}
                                            />
                                        </div>

                                        {carregando && (
                                            <div className="absolute inset-0 rounded-2xl bg-maxify-card/75 backdrop-blur-[2px] flex items-center justify-center">
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                    <RefreshCw className="animate-spin text-blue-400" size={16} />
                                                    <span className="text-sm font-medium text-blue-300">Executando...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-maxify-card border border-maxify-border rounded-[24px] p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <CheckCircle2 className="text-blue-400" size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-maxify-text">Resumo rápido</h2>
                                    <p className="text-sm text-maxify-text-secondary">Estado atual</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Selecionados</p>
                                    <p className="text-2xl font-bold text-blue-300 mt-1">{selecionados.length}</p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Aplicados</p>
                                    <p className="text-2xl font-bold text-cyan-300 mt-1">{totalSucesso}</p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                                    <p className="text-sm text-maxify-text-secondary">Falhas</p>
                                    <p className="text-2xl font-bold text-red-400 mt-1">{totalErro}</p>
                                </div>
                            </div>

                            <Button
                                onClick={executarSelecionados}
                                disabled={executando || selecionados.length === 0}
                                size="lg"
                                variant="primary"
                                className="w-full mt-5 min-h-[52px] flex items-center justify-center gap-3 text-base font-semibold"
                            >
                                {executando ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={20} />
                                        <span>Executando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} />
                                        <span>Aplicar desativações</span>
                                    </>
                                )}
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </RootDiv>
    )
}