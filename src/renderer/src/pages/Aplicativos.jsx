import React from "react"
import RootDiv from "@/components/rootdiv"
import {
    Palette,
    PackageCheck,
    Crown,
    Shield,
    Globe,
    Zap,
    Network,
    Wrench,
    ChevronRight,
    Sparkles,
    Boxes,
    Rocket,
    Lock,
    LayoutGrid,
    Star,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const BackgroundGlow = () => {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
        </>
    )
}

const SectionTitle = ({ icon: Icon, label, title, description }) => {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <Icon className="h-5 w-5 text-blue-300" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                    {label}
                </p>
                <h2 className="text-lg font-black text-maxify-text">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-maxify-text-secondary">{description}</p>
                )}
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
        </div>
    )
}

const InfoMiniCard = ({ icon: Icon, label, value, accent = "blue" }) => {
    const accentMap = {
        blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
        cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
        indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
    }

    return (
        <div className="rounded-[24px] border border-maxify-border bg-maxify-card/70 p-4 shadow-xl shadow-black/5">
            <div className="flex items-center gap-3">
                <div className={`rounded-2xl border p-3 ${accentMap[accent] || accentMap.blue}`}>
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-maxify-text-secondary">
                        {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-maxify-text">{value}</p>
                </div>
            </div>
        </div>
    )
}

const ResourceCard = ({
    title,
    description,
    icon: Icon,
    badge,
    onClick,
    accent = "blue",
    disabled = false,
}) => {
    const accentMap = {
        blue: {
            wrap: "border-blue-500/25 bg-blue-500/10",
            icon: "text-blue-300",
            badge: "border-blue-500/20 bg-blue-500/10 text-blue-300",
            bar: "from-blue-500/20",
        },
        cyan: {
            wrap: "border-cyan-500/25 bg-cyan-500/10",
            icon: "text-cyan-300",
            badge: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
            bar: "from-cyan-500/20",
        },
        sky: {
            wrap: "border-sky-500/25 bg-sky-500/10",
            icon: "text-sky-300",
            badge: "border-sky-500/20 bg-sky-500/10 text-sky-300",
            bar: "from-sky-500/20",
        },
        indigo: {
            wrap: "border-indigo-500/25 bg-indigo-500/10",
            icon: "text-indigo-300",
            badge: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
            bar: "from-indigo-500/20",
        },
    }

    const styles = accentMap[accent] || accentMap.blue

    return (
        <div className="group relative">
            <button
                type="button"
                onClick={!disabled ? onClick : undefined}
                className={`
          relative w-full overflow-hidden rounded-[28px] border border-maxify-border
          bg-maxify-card p-5 text-left shadow-xl shadow-black/5 transition-all duration-300
          ${disabled ? "cursor-default" : "hover:-translate-y-1 hover:border-blue-500/25"}
        `}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.bar} to-transparent opacity-70`} />

                <div className={`relative z-10 ${disabled ? "blur-[2px] select-none" : ""}`}>
                    <div className="mb-6 flex items-start justify-between gap-3">
                        <div className={`rounded-2xl border p-3 ${styles.wrap}`}>
                            <Icon className={`h-5 w-5 ${styles.icon}`} />
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${styles.badge}`}
                            >
                                {badge}
                            </div>

                            <ChevronRight className="h-4 w-4 text-maxify-text-secondary opacity-60 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black leading-tight text-maxify-text md:text-[22px]">
                            {title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                            {description}
                        </p>
                    </div>
                </div>
            </button>

            {disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[28px]">
                    <div className="absolute inset-0 rounded-[28px] border border-blue-500/20 bg-black/35 backdrop-blur-md" />
                    <div className="relative z-10 px-6 text-center">
                        <div className="mx-auto mb-3 w-fit rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3">
                            <Lock className="h-5 w-5 text-blue-300" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-200/80">
                            Em breve
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
                            Recurso em preparação
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function Apps() {
    const router = useNavigate()

    const resourcePages = [
        {
            title: "Office Setup",
            description:
                "Instale o Microsoft Office diretamente pelo Maxify, com logs em tempo real e acompanhamento visual.",
            icon: Crown,
            badge: "Office",
            accent: "blue",
            onClick: () => router("/office_installer"),
        },
        {
            title: "Ponto de restauração",
            description:
                "Gerencie segurança, restauração e recuperação do sistema em uma área dedicada.",
            icon: Shield,
            badge: "Sistema",
            accent: "indigo",
            onClick: () => router("/backup"),
        },
        {
            title: "Limpeza automática",
            description:
                "Configure limpezas automáticas, escolha o intervalo e deixe o sistema cuidar sozinho.",
            icon: Zap,
            badge: "Automático",
            accent: "blue",
            onClick: () => router("/autoclean"),
        },
        {
            title: "DNS",
            description:
                "Troque, restaure e gerencie os DNS do sistema de forma rápida e simples.",
            icon: Globe,
            badge: "Rede",
            accent: "sky",
            onClick: () => router("/dns"),
        },
        {
            title: "Utilitários",
            description:
                "Abra ferramentas extras e recursos úteis do aplicativo para uso diário.",
            icon: Wrench,
            badge: "Ferramentas",
            accent: "indigo",
            onClick: () => router("/utilities"),
        },
        {
            title: "Personalização",
            description:
                "Mude tema, cores, wallpaper e aparência do Windows pelo Maxify.",
            icon: Palette,
            badge: "Visual",
            accent: "blue",
            onClick: () => router("/personalizacao"),
            disabled: true,
        },
        {
            title: "Programas Essenciais",
            description:
                "Instale navegadores, launchers, ferramentas e recursos básicos do Windows.",
            icon: PackageCheck,
            badge: "Essenciais",
            accent: "cyan",
            onClick: () => router("/essentials"),
            disabled: true,
        },
        {
            title: "Rede avançada",
            description:
                "Recursos voltados para conexão, estabilidade, diagnóstico e ajustes avançados de rede.",
            icon: Network,
            badge: "Conexão",
            accent: "cyan",
            disabled: true,
        },
        {
            title: "Área experimental",
            description:
                "Novos recursos e ferramentas extras que ainda estão sendo preparados.",
            icon: Star,
            badge: "Beta",
            accent: "indigo",
            disabled: true,
        },
    ]

    const availableCount = resourcePages.filter((item) => !item.disabled).length
    const blockedCount = resourcePages.filter((item) => item.disabled).length

    return (
        <RootDiv className="min-h-full w-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
                    <BackgroundGlow />

                    <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_390px] xl:items-center">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                                <Sparkles size={14} />
                                Central de Recursos
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                                    <Boxes className="h-9 w-9 text-blue-300" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                                        Tudo em{" "}
                                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                                            um só lugar
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                                        Acesse recursos essenciais, ferramentas úteis e áreas em desenvolvimento em uma página limpa, organizada e com o visual premium do Maxify.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Recursos disponíveis: {availableCount}
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Em breve: {blockedCount}
                                        </div>

                                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                                            Visual renovado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <InfoMiniCard
                                icon={LayoutGrid}
                                label="Organização"
                                value="Acesso rápido"
                                accent="blue"
                            />

                            <InfoMiniCard
                                icon={Rocket}
                                label="Navegação"
                                value="Mais prática"
                                accent="cyan"
                            />

                            <InfoMiniCard
                                icon={Star}
                                label="Estilo"
                                value="Mais premium"
                                accent="indigo"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <SectionTitle
                        icon={Rocket}
                        label="Recursos"
                        title="Recursos do aplicativo"
                        description="Escolha uma área abaixo para abrir ou visualizar o que está em preparação."
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {resourcePages.map((item, index) => (
                            <ResourceCard key={`${item.title}-${index}`} {...item} />
                        ))}
                    </div>
                </section>
            </div>
        </RootDiv>
    )
}

export default Apps
