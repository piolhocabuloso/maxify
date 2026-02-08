
import RootDiv from "@/components/rootdiv"
import { useNavigate } from "react-router-dom"
import { Info, Users, Globe, Award } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Greeting from "@/components/greeting"

function About() {
    const router = useNavigate()
    const goBack = () => router("/")

    return (
        <RootDiv>
            <div className="max-w-[1800px] mx-auto px-5 pb-14">

                <h1 className="text-3xl font-bold text-sparkle-text mt-6">
                    Sobre a <span className="text-sparkle-primary">Piolho Optimize</span>
                </h1>

                <p className="text-sparkle-text-secondary mt-2 max-w-3xl">
                    A Piolho Optimize é uma empresa dedicada a desenvolver soluções de software para otimização
                    de computadores e produtividade digital. Nosso objetivo é oferecer ferramentas leves,
                    eficientes e seguras, sempre focando na experiência do usuário.
                </p>

                {/* Cards informativos */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Info className="text-blue-500" />
                            <h3 className="font-semibold text-sparkle-text">Missão</h3>
                        </div>
                        <p className="text-sparkle-text-secondary text-sm">
                            Desenvolver softwares que melhorem o desempenho e a experiência digital de nossos usuários.
                        </p>
                    </Card>

                    <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="text-purple-500" />
                            <h3 className="font-semibold text-sparkle-text">Equipe</h3>
                        </div>
                        <p className="text-sparkle-text-secondary text-sm">
                            Formada por desenvolvedores apaixonados por tecnologia, inovação e desempenho de sistemas.
                        </p>
                    </Card>

                    <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="text-teal-500" />
                            <h3 className="font-semibold text-sparkle-text">Visão</h3>
                        </div>
                        <p className="text-sparkle-text-secondary text-sm">
                            Ser referência em soluções de otimização de PCs, sempre com foco na inovação e segurança.
                        </p>
                    </Card>

                    <Card className="bg-sparkle-card border border-sparkle-border rounded-2xl p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Award className="text-orange-500" />
                            <h3 className="font-semibold text-sparkle-text">Valores</h3>
                        </div>
                        <p className="text-sparkle-text-secondary text-sm">
                            Transparência, qualidade, segurança e foco no usuário em todas as soluções que desenvolvemos.
                        </p>
                    </Card>
                </div>

                {/* Bloco de ação */}
                <Card className="mt-8 bg-gradient-to-r from-sparkle-primary/10 via-sparkle-primary/5 to-transparent border border-sparkle-border rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-all">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                        <Info className="text-blue-500" size={26} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-sparkle-text">Quer saber mais?</h1>
                        <p className="text-sparkle-text-secondary text-sm">
                            Visite nosso site, acompanhe nossas redes sociais e conheça todas as soluções da Piolho Optimize.
                        </p>
                    </div>
                    <div className="ml-auto">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 transition-all hover:scale-[1.05]"
                            onClick={() => window.open("https://optimizex-six.vercel.app", "_blank")}
                        >
                            Acessar site
                        </Button>
                    </div>
                </Card>
            </div>
        </RootDiv>
    )
}

export default About