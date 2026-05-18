import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
    Power,
    ShieldOff,
    BellOff,
    WifiOff,
    SearchX,
    Cpu,
    Trash2,
    Play,
    CheckCircle2,
    RefreshCw,
    Settings2,
    ChevronRight,
    Sparkles,
    Database,
    Layers3,
    Activity,
    Shield,
    Gauge,
    Zap,
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

const categoryIconMap = {
    all: Layers3,
    sistema: Database,
    servicos: Power,
    cpu: Cpu,
    rede: WifiOff,
    visual: Settings2,
    seguranca: Shield,
}

const StatCard = ({ title, value, subtitle, icon: Icon, accent = "blue" }) => {
    const accentMap = {
        blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
        cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
        sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
        red: "border-red-500/25 bg-red-500/10 text-red-300",
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:border-blue-500/25"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border p-3 ${accentMap[accent] || accentMap.blue}`}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
                    {title}
                </p>
                <p className="mt-1 text-3xl font-black leading-none text-maxify-text">
                    {value}
                </p>
                <p className="mt-2 text-xs leading-5 text-maxify-text-secondary/85">
                    {subtitle}
                </p>
            </div>
        </motion.div>
    )
}

const getStatusText = (status, carregando) => {
    if (carregando) return "Executando..."
    if (status === "success") return "Aplicado com sucesso"
    if (status === "error") return "Falhou"
    return "Pendente"
}

const getStatusClass = (status, carregando) => {
    if (carregando) return "text-blue-300"
    if (status === "success") return "text-cyan-300"
    if (status === "error") return "text-red-400"
    return "text-maxify-text-secondary"
}

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
    const totalAvisos = comandosDesativar.filter((item) => item.warning).length

    const stats = [
        {
            title: "Disponíveis",
            value: comandosDesativar.length,
            subtitle: "Recursos e serviços para controle",
            icon: Layers3,
            accent: "blue",
        },
        {
            title: "Selecionadas",
            value: selecionados.length,
            subtitle: "Opções prontas para aplicar",
            icon: CheckCircle2,
            accent: "cyan",
        },
        {
            title: "Aplicadas",
            value: totalSucesso,
            subtitle: "Ações concluídas nessa sessão",
            icon: Zap,
            accent: "sky",
        },
        {
            title: "Cuidados",
            value: totalAvisos,
            subtitle: `${totalErro} falha(s) registrada(s)`,
            icon: ShieldOff,
            accent: totalErro > 0 ? "red" : "blue",
        },
    ]

    return (
        <RootDiv className="min-h-full w-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
                    <BackgroundGlow />

                    <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_420px] xl:items-center">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                                <Sparkles size={14} />
                                Maxify Control Center
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                                    <Power className="h-9 w-9 text-blue-300" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">
                                        Central de desativação
                                    </p>

                                    <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                                        Controle avançado de{" "}
                                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                            recursos do Windows
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                                        Desative serviços, funções visuais, recursos de energia e ajustes do sistema em um painel mais limpo, modular e premium.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            {comandosDesativar.length} opções disponíveis
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            {selecionados.length} selecionadas
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Status: {executando ? "Executando" : "Pronto"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section>
                    <SectionTitle icon={Activity} label="Resumo" title="Visão rápida da desativação" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item, index) => (
                            <StatCard key={index} {...item} />
                        ))}
                    </div>
                </section>

                <section>
                    <SectionTitle icon={Shield} label="Filtros" title="Categorias de ajustes" />

                    <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_45%)]" />

                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                <div>
                                    <h2 className="text-xl font-black text-maxify-text">
                                        Filtrar por categoria
                                    </h2>
                                    <p className="mt-1 text-sm text-maxify-text-secondary">
                                        Escolha um grupo para visualizar apenas o que interessa.
                                    </p>
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
                                {categorias.map((categoria) => {
                                    const Icon = categoryIconMap[categoria.id] || Layers3
                                    const active = categoriaAtiva === categoria.id

                                    return (
                                        <button
                                            key={categoria.id}
                                            onClick={() => setCategoriaAtiva(categoria.id)}
                                            disabled={executando}
                                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${active
                                                    ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-500/10"
                                                    : "border-maxify-border bg-maxify-border/20 text-maxify-text-secondary hover:border-blue-400/30 hover:bg-maxify-border/35"
                                                } ${executando ? "cursor-not-allowed opacity-60" : ""}`}
                                        >
                                            <Icon size={16} />
                                            {categoria.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                </section>

                <section>
                    <SectionTitle icon={Power} label="Ajustes" title="Opções de desativação" />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                        <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_48%)]" />

                            <div className="relative z-10">
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                                            Lista de comandos
                                        </p>
                                        <h2 className="mt-1 text-xl font-black text-maxify-text">
                                            {filtrados.length} disponíveis
                                        </h2>
                                        <p className="mt-1 text-sm text-maxify-text-secondary">
                                            {selecionados.length} selecionadas para aplicar.
                                        </p>
                                    </div>

                                    {executando && (
                                        <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-blue-300">
                                            <RefreshCw className="animate-spin" size={16} />
                                            <span className="text-sm font-bold">Executando</span>
                                        </div>
                                    )}
                                </div>

                                <div className="max-h-[760px] overflow-y-auto pr-2">
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {filtrados.map((item) => {
                                            const ativo = selecionados.includes(item.id)
                                            const carregando = fila.includes(item.id)
                                            const status = resultados[item.id]

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -3 }}
                                                    onClick={() => {
                                                        if (!executando && !carregando) alternar(item.id)
                                                    }}
                                                    className={`group relative cursor-pointer rounded-2xl border p-4 shadow-black/5 transition-all ${ativo
                                                            ? "border-blue-500/45 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                                                            : "border-maxify-border bg-maxify-bg/30 hover:border-blue-400/40 hover:bg-maxify-border/15"
                                                        } ${carregando ? "opacity-80" : ""}`}
                                                >
                                                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_45%)] opacity-0 transition-opacity group-hover:opacity-100" />

                                                    <div className="relative z-10 flex items-start justify-between gap-3">
                                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                                            <div
                                                                className={`mt-0.5 shrink-0 rounded-xl border p-2.5 ${item.warning
                                                                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                                                                        : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                                                    }`}
                                                            >
                                                                {item.icon}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-[15px] font-bold text-maxify-text">
                                                                        {item.label}
                                                                    </span>

                                                                    {item.warning && (
                                                                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">
                                                                            Cuidado
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-maxify-text-secondary">
                                                                    {item.description}
                                                                </p>

                                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                                    <span className={`text-sm font-bold ${getStatusClass(status, carregando)}`}>
                                                                        {getStatusText(status, carregando)}
                                                                    </span>

                                                                    <span className="rounded-full border border-maxify-border bg-maxify-border/20 px-2 py-0.5 text-[11px] font-bold text-maxify-text-secondary">
                                                                        {item.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Toggle
                                                                checked={ativo}
                                                                onChange={() => alternar(item.id)}
                                                                disabled={executando || carregando}
                                                            />
                                                        </div>
                                                    </div>

                                                    {carregando && (
                                                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-maxify-card/75 backdrop-blur-[2px]">
                                                            <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
                                                                <RefreshCw className="animate-spin text-blue-400" size={16} />
                                                                <span className="text-sm font-bold text-blue-300">
                                                                    Executando...
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_48%)]" />

                                <div className="relative z-10">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                            <CheckCircle2 className="text-blue-300" size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-black text-maxify-text">
                                                Resumo rápido
                                            </h2>
                                            <p className="text-sm text-maxify-text-secondary">
                                                Estado atual das ações
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                                            <p className="text-sm text-maxify-text-secondary">Selecionados</p>
                                            <p className="mt-1 text-2xl font-black text-blue-300">
                                                {selecionados.length}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                                            <p className="text-sm text-maxify-text-secondary">Aplicados</p>
                                            <p className="mt-1 text-2xl font-black text-cyan-300">
                                                {totalSucesso}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-maxify-border bg-maxify-bg/30 p-4">
                                            <p className="text-sm text-maxify-text-secondary">Falhas</p>
                                            <p className="mt-1 text-2xl font-black text-red-400">
                                                {totalErro}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={executarSelecionados}
                                        disabled={executando || selecionados.length === 0}
                                        size="lg"
                                        variant="primary"
                                        className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-3 rounded-2xl text-base font-black uppercase tracking-[0.12em]"
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
                                </div>
                            </Card>

                            <Card className="relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_48%)]" />

                                <div className="relative z-10">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                                            <ShieldOff className="text-blue-300" size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-black text-maxify-text">
                                                Atenção
                                            </h2>
                                            <p className="text-sm text-maxify-text-secondary">
                                                Algumas opções podem alterar comportamento do Windows.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-red-500/15 bg-red-500/10 p-4">
                                            <p className="text-sm font-semibold text-red-300">
                                                Itens com “Cuidado” devem ser usados apenas se você sabe o que está desativando.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/15 bg-blue-500/10 p-4">
                                            <p className="text-sm text-maxify-text-secondary">
                                                Se algum recurso parar de funcionar, reative manualmente pelo Windows ou use um ponto de restauração.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </RootDiv>
    )
}
