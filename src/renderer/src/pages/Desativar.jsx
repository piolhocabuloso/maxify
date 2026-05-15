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
import { notify as toast } from "../lib/notify"

const comandosDesativar = [
     {
        id: "hipervisor",
        label: "Desativar Hypervisor",
        description: "Desliga o hypervisor na inicialização.",
        icon: <Cpu size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_9686e52f75c282512fa9",
        warning: true,
    },
    {
        id: "dynamicTick",
        label: "Desativar Dynamic Tick",
        description: "Desativa o Dynamic Tick do boot.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_c9f1a295c6d5f6dbee3a",
    },
    {
        id: "coreParking",
        label: "Desativar Core Parking",
        description: "Desativa o estacionamento de núcleos.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_d2ff10362b73c352c35d",
    },
    {
        id: "powerThrottling",
        label: "Desativar Power Throttling",
        description: "Desliga limitação de energia do Windows.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_0832a6f513df85b3bf7f",
    },
    {
        id: "aspm",
        label: "Desativar ASPM",
        description: "Desliga economia de energia do PCI Express.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_b8656a7ca4ee8935e2d8",
    },
    {
        id: "economiaUsb",
        label: "Desativar economia de dispositivos",
        description: "Desliga suspensão seletiva de USB.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_500a58739d899126605b",
    },
    {
        id: "hibernacao",
        label: "Desativar Hibernação / Fast Startup",
        description: "Desliga hibernação e inicialização rápida.",
        icon: <Power size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_101b6d77eb906d2af10b",
    },
    {
        id: "hybridSleep",
        label: "Desativar Hybrid Sleep",
        description: "Desliga modo de sono híbrido.",
        icon: <Power size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_7fe3c693e5dffac156a6",
    },
    {
        id: "sleepTimeout",
        label: "Desativar Standby",
        description: "Remove tempo limite de suspensão na energia.",
        icon: <Power size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_9ecca3936aed0e63d5da",
    },
    {
        id: "modernStandby",
        label: "Desativar Modern Standby",
        description: "Desativa o Modern Standby pelo registro.",
        icon: <Power size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_4913188a1d10e2e9887f",
    },
    {
        id: "indexacao",
        label: "Desativar Indexação",
        description: "Desativa o Windows Search.",
        icon: <SearchX size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_28acf4cb58aeed5f2101",
    },
    {
        id: "windowsUpdate",
        label: "Desativar Windows Update",
        description: "Desliga serviços do Windows Update, UsoSvc e BITS.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_7dfbf445169ab76f9017",
        warning: true,
    },
    {
        id: "bluetooth",
        label: "Desativar Bluetooth",
        description: "Desliga o serviço do Bluetooth.",
        icon: <WifiOff size={18} />,
        category: "rede",
        command: "maxify-premium://mx_22c01c80054781948794",
        warning: true,
    },
    {
        id: "telemetria",
        label: "Desativar Telemetria",
        description: "Reduz coleta de dados e rastreamento do Windows.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_5aadd2f60840dbcfc6ba",
        warning: true,
    },
    {
        id: "diagtrack",
        label: "Desativar DiagTrack",
        description: "Desliga o serviço de diagnóstico do Windows.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_4fc7b84928ed607cbfbc",
        warning: true,
    },
    {
        id: "uac",
        label: "Desativar UAC",
        description: "Desliga o Controle de Conta de Usuário.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_a15cffe0de6a0913dbec",
        warning: true,
    },
    {
        id: "notificacoes",
        label: "Desativar Notificações",
        description: "Desliga notificações toast do sistema.",
        icon: <BellOff size={18} />,
        category: "visual",
        command: "maxify-premium://mx_d1730796d36a9372628b",
    },
    {
        id: "fso",
        label: "Desativar Fullscreen Optimizations",
        description: "Desliga FSO e GameDVR.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: "maxify-premium://mx_20b51f1fb1925ee4b90e",
    },
    {
        id: "gpuScheduling",
        label: "Desativar GPU Scheduling",
        description: "Desliga ajuste ligado ao agendamento acelerado/GameDVR.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: "maxify-premium://mx_5b7ad4e2074ad7544c45",
    },
    {
        id: "transparenciaTaskbar",
        label: "Desativar transparência",
        description: "Remove transparência da barra e tema.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: "maxify-premium://mx_9c0292379c04b3f3c48d",
    },
    {
        id: "roundedCorners",
        label: "Desativar cantos arredondados",
        description: "Desliga arredondamento visual do Explorer.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: "maxify-premium://mx_c993f97b96c40565f3e2",
    },
    {
        id: "manutencao",
        label: "Desativar manutenção automática",
        description: "Desabilita tarefa de manutenção do Windows.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_3e2da181d3298f649a1e",
    },
    {
        id: "tarefasExperiencia",
        label: "Desativar tarefas de experiência",
        description: "Desliga tarefas ProgramDataUpdater e Consolidator.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_c42071ccdfd789f7c078",
    },
    {
        id: "xbox",
        label: "Desativar serviços Xbox",
        description: "Desliga serviços do Xbox no sistema.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_e46bd6d58560b50cbb4b",
    },
    {
        id: "sysmain",
        label: "Desativar SysMain",
        description: "Desliga o serviço SysMain.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_006a4ca5f7ba910fdaaf",
    },
    {
        id: "ramDiagnostic",
        label: "Desativar diagnóstico de RAM",
        description: "Desabilita tarefas de diagnóstico de memória.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_60e1198a2fe24da33aa9",
    },
    {
        id: "ramErrorDiag",
        label: "Desativar erro de RAM no boot",
        description: "Restaura BootExecute sem diagnóstico extra.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_e2366b557ff26f434689",
    },
    {
        id: "prefetcher",
        label: "Desativar Prefetcher",
        description: "Desliga o Prefetcher do Windows.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_2c95d0c1c8a8e2655cde",
    },
    {
        id: "kernelPaging",
        label: "Desativar Kernel Paging",
        description: "Evita paginação do kernel.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_0074358d903bc3f90bd4",
    },
    {
        id: "clearPagefile",
        label: "Limpar pagefile no desligamento",
        description: "Limpa pagefile ao desligar o Windows.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_1bca4ce6d066848384e8",
    },
    {
        id: "nagles",
        label: "Desativar Nagle / throttling de rede",
        description: "Ajusta resposta de rede para menor latência.",
        icon: <WifiOff size={18} />,
        category: "rede",
        command: "maxify-premium://mx_c4a56238ef06241f13f5",
    },
    {
        id: "displayPowerSaving",
        label: "Desativar economia gráfica",
        description: "Desliga economia dinâmica de GPU/display.",
        icon: <Settings2 size={18} />,
        category: "visual",
        command: "maxify-premium://mx_fa2e298d378a279b612a",
    },
    {
        id: "energyLogging",
        label: "Desativar Energy Logging",
        description: "Desliga logs de energia e telemetria de consumo.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_5d8287ab6f752d9ff69c",
    },
    {
        id: "memoryLogging",
        label: "Desativar Memory Logging",
        description: "Reduz logs de diagnóstico do sistema.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_752e34e17bbd149aef69",
    },
    {
        id: "nvidiaLogging",
        label: "Desativar logs da NVIDIA",
        description: "Desliga logs e preferência de telemetria da NVIDIA.",
        icon: <ShieldOff size={18} />,
        category: "seguranca",
        command: "maxify-premium://mx_6ee2f9239d34967997f0",
    },
    {
        id: "nvidiaUpdate",
        label: "Desativar atualização NVIDIA",
        description: "Desliga tarefas e serviço de update da NVIDIA.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_f27ac721ea6699dcf197",
    },
    {
        id: "firefoxUpdates",
        label: "Desativar update do Firefox",
        description: "Desliga atualização automática do Firefox.",
        icon: <Power size={18} />,
        category: "servicos",
        command: "maxify-premium://mx_0fbd3dab2135215ca978",
    },
    {
        id: "bootOptimize",
        label: "Desativar Boot Optimize",
        description: "Desliga otimização de boot do desfragmentador.",
        icon: <Trash2 size={18} />,
        category: "sistema",
        command: "maxify-premium://mx_68ca85684c25c9f6e679",
    },
    {
        id: "csrssPriority",
        label: "Ajustar prioridade do csrss",
        description: "Aplica prioridade maior ao csrss.",
        icon: <Cpu size={18} />,
        category: "cpu",
        command: "maxify-premium://mx_3f322001bea521b7f2e9",
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