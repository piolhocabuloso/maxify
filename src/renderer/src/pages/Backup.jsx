import { useEffect, useState, useMemo } from "react"
import {
  RefreshCw,
  PlusCircle,
  Shield,
  RotateCcw,
  Loader2,
  Search,
  Trash,
  ArchiveRestore,
  Clock3,
  FolderClock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  History,
  ArrowLeft,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import { LargeInput } from "@/components/ui/input"
import Card from "@/components/ui/Card"

export default function GerenciadorPontosRestaure() {
  const navigate = useNavigate()

  const [pontos, setPontos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [busca, setBusca] = useState("")
  const [modal, setModal] = useState({
    aberto: false,
    tipo: null,
    ponto: null,
  })

  const [modalPersonalizadoAberto, setModalPersonalizadoAberto] = useState(false)
  const [nomePersonalizado, setNomePersonalizado] = useState("")

  const buscarPontos = async () => {
    setCarregando(true)
    try {
      const resposta = await invoke({ channel: "get-restore-points" })
      if (resposta.success && Array.isArray(resposta.points)) {
        const ordenado = resposta.points.sort((a, b) => {
          const parse = (str) =>
            new Date(
              str.slice(0, 4) +
                "-" +
                str.slice(4, 6) +
                "-" +
                str.slice(6, 8) +
                "T" +
                str.slice(8, 10) +
                ":" +
                str.slice(10, 12) +
                ":" +
                str.slice(12, 14),
            )
          return parse(b.CreationTime) - parse(a.CreationTime)
        })
        setPontos(ordenado)
      } else {
        toast.error("Falha ao carregar pontos de restauração. Verifique os logs.")
        log.error("Falha ao carregar pontos de restauração:", resposta)
      }
    } catch (error) {
      toast.error("Falha ao carregar pontos de restauração. Verifique os logs.")
      log.error("Falha ao carregar pontos de restauração:", error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarPontos()
  }, [])

  const criarPontoRapido = async () => {
    setProcessando(true)
    try {
      await invoke({ channel: "create-maxify-restore-point" })
      toast.success("Ponto de restauração criado!")
      await buscarPontos()
    } catch (err) {
      toast.error("Falha ao criar ponto de restauração.")
      log.error("Falha ao criar ponto de restauração:", err)
    }
    setProcessando(false)
  }

  const restaurar = (ponto) => {
    setModal({ aberto: true, tipo: "restaurar", ponto })
  }

  const executarRestauracao = async () => {
    setProcessando(true)
    try {
      await invoke({
        channel: "restore-restore-point",
        payload: modal.ponto.SequenceNumber,
      })
      toast.success("Restauração do sistema iniciada. O PC pode reiniciar.")
    } catch (err) {
      toast.error("Falha ao iniciar restauração do sistema.")
      log.error("Falha ao iniciar restauração do sistema:", err)
    }
    setProcessando(false)
    setModal({ aberto: false, tipo: null, ponto: null })
  }

  const criarPontoPersonalizado = async () => {
    setProcessando(true)
    try {
      if (!nomePersonalizado.trim()) {
        toast.error("Digite um nome para o ponto de restauração.")
        setProcessando(false)
        return
      }
      await invoke({ channel: "create-restore-point", payload: nomePersonalizado })
      toast.success("Ponto de restauração criado!")
      setModalPersonalizadoAberto(false)
      setNomePersonalizado("")
      await buscarPontos()
    } catch (err) {
      toast.error("Falha ao criar ponto de restauração.")
      log.error("Falha ao criar ponto de restauração:", err)
    }
    setProcessando(false)
  }

  const deletarTodos = async () => {
    setProcessando(true)
    await invoke({ channel: "delete-all-restore-points" })
    toast.success("Todos os pontos de restauração foram excluídos.")
    setProcessando(false)
    await buscarPontos()
  }

  const pontosFiltrados = useMemo(() => {
    return pontos.filter((p) =>
      (p.Description || "").toLowerCase().includes(busca.toLowerCase()),
    )
  }, [pontos, busca])

  const formatarData = (creationTime) => {
    if (!creationTime) return "Data inválida"

    try {
      const data = new Date(
        creationTime.slice(0, 4) +
          "-" +
          creationTime.slice(4, 6) +
          "-" +
          creationTime.slice(6, 8) +
          "T" +
          creationTime.slice(8, 10) +
          ":" +
          creationTime.slice(10, 12) +
          ":" +
          creationTime.slice(12, 14),
      )

      return data.toLocaleString("pt-BR")
    } catch {
      return "Data inválida"
    }
  }

  const stats = [
    {
      title: "Total de pontos",
      value: pontos.length,
      icon: <History size={18} />,
      text: "text-cyan-300",
      bg: "from-cyan-500/20 to-blue-500/5",
    },
    {
      title: "Filtrados",
      value: pontosFiltrados.length,
      icon: <Search size={18} />,
      text: "text-blue-300",
      bg: "from-blue-500/20 to-sky-500/5",
    },
    {
      title: "Estado",
      icon: processando ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />,
      text: processando ? "text-blue-300" : "text-cyan-300",
      bg: "from-sky-500/20 to-cyan-500/5",
    },
  ]

  if (carregando) {
    return (
      <RootDiv>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
                <Shield className="text-blue-400" size={34} />
              </div>
              <div className="absolute -right-2 -bottom-2 w-9 h-9 rounded-xl bg-maxify-card border border-maxify-border flex items-center justify-center">
                <RotateCcw className="text-cyan-300 animate-spin" size={18} />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-maxify-text font-semibold text-lg">
                Carregando pontos de restauração...
              </h1>
              <p className="text-maxify-text-secondary text-sm mt-1">
                Lendo informações do sistema
              </p>
            </div>

            <div className="w-64 h-2 bg-maxify-border rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-cyan-400 animate-[loading_1.4s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(120%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </RootDiv>
    )
  }

  return (
    <RootDiv>
      <div className="max-w-[1900px] mx-auto px-6 pb-16 space-y-8">
        <Card className="relative overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_28%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm font-medium mb-5">
              <Sparkles size={15} />
              Proteção e recuperação
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <ArchiveRestore className="text-blue-400" size={30} />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-maxify-text leading-tight">
                    Pontos de restauração
                  </h1>
                  <p className="text-maxify-text-secondary mt-3 max-w-2xl">
                    Crie backups do estado do sistema, pesquise pontos já existentes e restaure seu Windows com mais segurança.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/aplicativos")}
                className="
                  group flex items-center gap-2
                  px-4 py-2.5 rounded-xl
                  border border-maxify-border
                  bg-maxify-card/70 backdrop-blur
                  text-maxify-text-secondary
                  transition-all duration-300
                  hover:text-maxify-text
                  hover:border-blue-500/30
                  hover:bg-blue-500/10
                "
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={criarPontoRapido}
                className="flex items-center gap-2"
                disabled={carregando || processando}
              >
                {processando ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                Ponto rápido
              </Button>

              <Button
                variant="outline"
                onClick={() => setModalPersonalizadoAberto(true)}
                disabled={carregando || processando}
                className="flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Personalizado
              </Button>

              <Button
                variant="outline"
                onClick={buscarPontos}
                className="flex items-center gap-2"
                disabled={carregando || processando}
              >
                <RefreshCw size={16} />
                Atualizar
              </Button>

              <Button
                variant="danger"
                onClick={deletarTodos}
                disabled={carregando || processando}
                className="flex items-center gap-2"
              >
                <Trash size={16} />
                Deletar todos
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-6">
          <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Search className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-maxify-text">Pesquisar e controlar</h2>
                <p className="text-sm text-maxify-text-secondary">
                  Encontre pontos e acompanhe o estado do gerenciador
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <LargeInput
                type="text"
                placeholder="Buscar pontos de restauração..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                icon={Search}
              />

              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                <p className="text-sm text-maxify-text-secondary">Status do sistema</p>
                <p className="text-lg font-bold text-maxify-text mt-1">
                  {processando ? "Executando operação..." : "Aguardando ação"}
                </p>
              </div>

              <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                <p className="text-sm text-maxify-text-secondary">Observação</p>
                <p className="text-sm text-maxify-text mt-1 leading-relaxed">
                  Restaurar um ponto pode reiniciar o computador. Arquivos pessoais normalmente não são apagados, mas apps e ajustes recentes podem voltar ao estado anterior.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-yellow-200/90 leading-relaxed">
                  A listagem de pontos de restauração está em beta e pode ser instável, mas a criação funciona normalmente.
                </p>
              </div>
            </div>
          </Card>

          {pontosFiltrados.length === 0 ? (
            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-8">
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="p-4 bg-blue-500/15 border border-blue-500/20 rounded-full mb-4">
                  <Shield size={32} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-maxify-text mb-3">
                  Nenhum ponto de restauração encontrado
                </h3>
                <p className="text-maxify-text-secondary max-w-md mb-6">
                  {busca
                    ? "Nenhum ponto corresponde à sua pesquisa."
                    : "Crie um ponto de restauração para preservar o estado do sistema e poder voltar atrás quando precisar."}
                </p>

                {!busca && (
                  <Button
                    variant="primary"
                    onClick={criarPontoRapido}
                    disabled={processando}
                    className="flex items-center gap-2"
                  >
                    {processando ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    Criar ponto rápido
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="rounded-[28px] border border-maxify-border bg-maxify-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <FolderClock className="text-cyan-300" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-maxify-text">Histórico de restauração</h2>
                    <p className="text-sm text-maxify-text-secondary">
                      {pontosFiltrados.length} ponto(s) encontrado(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {pontosFiltrados.map((ponto, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-maxify-border bg-maxify-border/10 hover:border-blue-400/40 transition-all p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-maxify-text break-words">
                            {ponto.Description}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-maxify-text-secondary">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={14} />
                              {formatarData(ponto.CreationTime)}
                            </span>

                            {ponto.SequenceNumber && (
                              <span className="px-2 py-1 rounded-full bg-maxify-card border border-maxify-border text-xs">
                                ID {ponto.SequenceNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => restaurar(ponto)}
                          disabled={processando}
                        >
                          <RotateCcw size={16} />
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={modal.aberto}
        onClose={() => !processando && setModal({ aberto: false, tipo: null, ponto: null })}
      >
        {modal.tipo === "restaurar" && modal.ponto && (
          <div className="bg-maxify-card border border-maxify-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <RotateCcw className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-maxify-text">Restaurar sistema</h3>
            </div>

            <div className="p-2">
              <p className="text-maxify-text-secondary mb-6 leading-relaxed">
                Tem certeza que deseja restaurar seu sistema para{" "}
                <span className="font-bold text-maxify-text">"{modal.ponto.Description}"</span>?
                Seu PC será reiniciado e o ponto de restauração será aplicado.
                <br />
                <br />
                Seus arquivos não serão afetados, mas aplicativos e configurações recentes podem ser perdidos.
                <br />
                <br />
                Isso reverterá alterações feitas depois da criação desse ponto.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => !processando && setModal({ aberto: false, tipo: null, ponto: null })}
                  disabled={processando}
                >
                  Cancelar
                </Button>

                <Button variant="primary" onClick={executarRestauracao} disabled={processando}>
                  {processando ? <Loader2 size={16} className="animate-spin" /> : "Restaurar sistema"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modalPersonalizadoAberto}
        onClose={() => !processando && setModalPersonalizadoAberto(false)}
      >
        <div className="bg-maxify-card border border-maxify-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <PlusCircle className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-maxify-text">Criar ponto personalizado</h3>
          </div>

          <div className="p-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-maxify-text-secondary mb-2">
                Nome do ponto de restauração
              </label>
              <input
                type="text"
                value={nomePersonalizado}
                onChange={(e) => setNomePersonalizado(e.target.value)}
                placeholder="Digite o nome do ponto de restauração"
                className="w-full px-4 py-3 bg-maxify-card border border-maxify-border rounded-xl text-maxify-text placeholder-maxify-text-secondary focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={processando}
              />
            </div>

            <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
              <p className="text-sm text-maxify-text-secondary">
                Use um nome fácil de lembrar, como antes da limpeza, antes de atualizar driver ou antes de testar algo novo.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => !processando && setModalPersonalizadoAberto(false)}
                disabled={processando}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                onClick={criarPontoPersonalizado}
                disabled={processando || !nomePersonalizado.trim()}
                className="flex items-center gap-2"
              >
                {processando ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                Criar ponto
              </Button>
            </div>

            <p className="text-xs text-center text-maxify-text-secondary">
              Isso pode levar algum tempo dependendo do seu hardware
            </p>
          </div>
        </div>
      </Modal>
    </RootDiv>
  )
}