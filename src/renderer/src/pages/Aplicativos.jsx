import React from "react"
import RootDiv from "@/components/rootdiv"
import {
    Palette,
    PackageCheck,
    Crown,
    Shield,
    Globe,
    Zap,
    HardDrive,
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
            soft: "from-blue-500/20 via-blue-500/10 to-transparent",
            iconWrap: "bg-blue-500/15 border-blue-400/20",
            icon: "text-blue-300",
            badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
            glow: "shadow-blue-500/10",
        },
        cyan: {
            soft: "from-cyan-500/20 via-cyan-500/10 to-transparent",
            iconWrap: "bg-cyan-500/15 border-cyan-400/20",
            icon: "text-cyan-300",
            badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
            glow: "shadow-cyan-500/10",
        },
        sky: {
            soft: "from-sky-500/20 via-sky-500/10 to-transparent",
            iconWrap: "bg-sky-500/15 border-sky-400/20",
            icon: "text-sky-300",
            badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
            glow: "shadow-sky-500/10",
        },

        indigo: {
            soft: "from-indigo-500/20 via-indigo-500/10 to-transparent",
            iconWrap: "bg-indigo-500/15 border-indigo-400/20",
            icon: "text-indigo-300",
            badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
            glow: "shadow-indigo-500/10",
        },
    }

    const styles = accentMap[accent] || accentMap.blue

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={!disabled ? onClick : undefined}
                className={`
                    relative w-full overflow-hidden rounded-[26px] border border-maxify-border
                    bg-maxify-card text-left p-5 md:p-6 transition-all duration-300
                    ${disabled
                        ? "cursor-default"
                        : "hover:-translate-y-1.5 hover:border-blue-500/25 hover:shadow-2xl"}
                    ${styles.glow}
                `}
            >
                <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${styles.soft}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%)]" />

                <div className={`relative z-10 ${disabled ? "blur-md select-none" : ""}`}>
                    <div className="flex items-start justify-between gap-3 mb-6">
                        <div className={`p-3.5 rounded-2xl border ${styles.iconWrap} backdrop-blur-sm`}>
                            <Icon className={`w-5 h-5 ${styles.icon}`} />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.22em] ${styles.badge}`}>
                                {badge}
                            </div>
                            <ChevronRight className="w-4 h-4 text-maxify-text-secondary opacity-60" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl md:text-[22px] font-bold text-maxify-text leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm leading-6 text-maxify-text-secondary">
                            {description}
                        </p>
                    </div>
                </div>
            </button>

            {disabled && (
                <div className="absolute inset-0 rounded-[26px] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-[26px] bg-black/35 backdrop-blur-md border border-blue-500/20" />
                    <div className="relative z-10 text-center px-6">
                        <div className="mx-auto mb-3 w-fit rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3">
                            <Lock className="w-5 h-5 text-blue-300" />
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/80">
                            Em breve
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
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
            title: "Ponto de restauração",
            description: "Gerencie segurança, restauração e recuperação do sistema em uma área dedicada.",
            icon: Shield,
            badge: "Sistema",
            accent: "indigo",
            onClick: () => router("/backup"),
        },
        {
            title: "Limpeza automática",
            description: "Configure limpezas automáticas, escolha o intervalo e deixe o sistema cuidar sozinho.",
            icon: Zap,
            badge: "Automático",
            accent: "blue",
            onClick: () => router("/autoclean"),
        },
        {
            title: "Office Setup",
            description: "Instale o Microsoft Office diretamente pelo Maxify, com logs em tempo real e acompanhamento visual.",
            icon: Crown,
            badge: "Office",
            accent: "blue",
            onClick: () => router("/office_installer"),
        },
        {
            title: "DNS",
            description: "Troque, restaure e gerencie os DNS do sistema de forma rápida e simples.",
            icon: Globe,
            badge: "Rede",
            accent: "sky",
            onClick: () => router("/dns"),
        },
        {
            title: "Utilitários",
            description: "Abra ferramentas extras e recursos úteis do aplicativo para uso diário.",
            icon: Wrench,
            badge: "Ferramentas",
            accent: "indigo",
            onClick: () => router("/utilities"),
        },
        {
            title: "Personalização",
            description: "Mude tema, cores, wallpaper e aparência do Windows pelo Maxify.",
            icon: Palette,
            badge: "Visual",
            accent: "blue",
            onClick: () => router("/personalizacao"),
        },
        {
            title: "Programas Essenciais",
            description: "Instale navegadores, launchers, ferramentas e recursos básicos do Windows.",
            icon: PackageCheck,
            badge: "PackageCheck",
            accent: "blue",
            onClick: () => router("/essentials"),
            disabled: true,
        },
        {
            title: "Rede avançada",
            description: "Recursos voltados para conexão, estabilidade, diagnóstico e ajustes avançados de rede.",
            icon: Network,
            badge: "Conexão",
            accent: "cyan",
            disabled: true,
        },
        {
            title: "Utilitários",
            description: "Abra ferramentas extras e recursos úteis do aplicativo para uso diário.",
            icon: Wrench,
            badge: "Ferramentas",
            accent: "indigo",
            disabled: true,
        },
    ]

    const availableCount = resourcePages.filter((item) => !item.disabled).length
    const blockedCount = resourcePages.filter((item) => item.disabled).length

    return (
        <RootDiv>
            <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
                <div className="mt-8 relative overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-7 md:p-9">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(14,165,233,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
                    <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:30px_30px]" />

                    <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-8 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-200 text-sm font-medium mb-5 shadow-sm">
                                <Sparkles size={15} />
                                Central de Recursos
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30 shadow-xl shadow-blue-500/10 backdrop-blur">
                                    <Boxes className="w-8 h-8 text-blue-300" />
                                </div>

                                <div>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-maxify-text leading-tight">
                                        Tudo em um só lugar
                                    </h1>

                                    <p className="text-maxify-text-secondary mt-3 max-w-3xl text-sm md:text-base leading-7">
                                        Acesse os recursos do aplicativo em uma página mais limpa,
                                        bonita e organizada. Aqui ficam os recursos essenciais do sistema,
                                        ferramentas úteis e áreas em desenvolvimento.
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                                            Recursos disponíveis: {availableCount}
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-white/5 text-maxify-text-secondary text-sm border border-maxify-border">
                                            Em breve: {blockedCount}
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                                            Visual renovado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                            <div className="rounded-2xl border border-maxify-border bg-white/[0.03] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <LayoutGrid className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-maxify-text-secondary">
                                            Organização
                                        </p>
                                        <p className="text-maxify-text font-semibold">
                                            Acesso rápido
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-maxify-border bg-white/[0.03] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                        <Rocket className="w-4 h-4 text-cyan-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-maxify-text-secondary">
                                            Navegação
                                        </p>
                                        <p className="text-maxify-text font-semibold">
                                            Mais prática
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-maxify-border bg-white/[0.03] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <Star className="w-4 h-4 text-indigo-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-maxify-text-secondary">
                                            Estilo
                                        </p>
                                        <p className="text-maxify-text font-semibold">
                                            Mais premium
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Rocket className="w-4 h-4 text-blue-300" />
                        </div>

                        <div>
                            <h2 className="text-maxify-text text-lg md:text-xl font-semibold">
                                Recursos do aplicativo
                            </h2>
                            <p className="text-sm text-maxify-text-secondary">
                                Escolha uma área abaixo para abrir ou visualizar o que está em preparação.
                            </p>
                        </div>

                        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {resourcePages.map((item, index) => (
                            <ResourceCard key={index} {...item} />
                        ))}
                    </div>
                </section>
            </div>
        </RootDiv>
    )
}

export default Apps