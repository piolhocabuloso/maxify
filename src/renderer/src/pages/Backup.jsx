import { useEffect, useState } from "react"
import { RefreshCw, PlusCircle, Shield, RotateCcw, Loader2, Search, Trash } from "lucide-react"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { toast } from "react-toastify"
import log from "electron-log/renderer"
import { LargeInput } from "@/components/ui/input"
import Card from "@/components/ui/Card"
import CleanIcon from "../../../../resources/sparklelogo.png";

export default function GerenciadorPontosRestaure() {
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
      await invoke({ channel: "create-sparkle-restore-point" })
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

  const pontosFiltrados = pontos.filter((p) =>
    (p.Description || "").toLowerCase().includes(busca.toLowerCase()),
  )

  if (carregando) {
    return (
      <RootDiv>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">

            {/* ícone mais simples e sério */}
            <div className="flex items-center gap-3">
              <Shield className="text-blue-500 animate-pulse" size={26} />
              <RotateCcw className="text-sparkle-text-secondary animate-spin" size={22} />
            </div>

            <h1 className="text-sparkle-text font-medium text-lg">
              Carregando pontos de restauração
              <span className="animate-pulse">...</span>
            </h1>

            {/* barrinha clean */}
            <div className="w-56 h-1 bg-sparkle-border rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-blue-500 animate-[loading_1.4s_ease-in-out_infinite]" />
            </div>

            <p className="text-sparkle-text-secondary text-sm">
              Lendo informações do sistema
            </p>
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
      <div className="max-w-[2000px] mx-auto px-6 pb-16">
        {/* === HEADER COM CONTROLES === */}
        <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Shield className="text-blue-500" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sparkle-text">Gerenciador de Pontos de Restauração</h1>
                  <p className="text-sparkle-text-secondary text-sm">
                    Crie e restaure pontos de recuperação do sistema
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="danger"
                  onClick={deletarTodos}
                  disabled={carregando || processando}
                  className="flex items-center gap-2"
                >
                  <Trash size={16} /> Deletar Todos
                </Button>
                <Button
                  variant="secondary"
                  onClick={buscarPontos}
                  className="flex items-center gap-2"
                  disabled={carregando || processando}
                >
                  <RefreshCw size={16} /> Atualizar
                </Button>
                <Button
                  variant="primary"
                  onClick={criarPontoRapido}
                  className="flex items-center gap-2"
                  disabled={carregando || processando}
                >
                  {processando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  Ponto Rápido
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setModalPersonalizadoAberto(true)}
                  disabled={carregando || processando}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Personalizado
                </Button>
              </div>
            </div>

            {/* Barra de busca */}
            <div className="mt-6">
              <div className="relative w-full md:w-96">
                <LargeInput
                  type="text"
                  placeholder="Buscar pontos de restauração..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  icon={Search}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* === LISTA DE PONTOS DE RESTAURAÇÃO === */}
        {pontosFiltrados.length === 0 ? (
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-8 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="p-4 bg-blue-500/20 rounded-full mb-4">
                <Shield size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-sparkle-text">
                Nenhum ponto de restauração encontrado
              </h3>
              <p className="text-sparkle-text-secondary max-w-md mb-6">
                {busca
                  ? "Nenhum ponto corresponde à sua pesquisa."
                  : "Crie um ponto de restauração para preservar o estado do sistema. Você poderá restaurar seu sistema a qualquer momento."}
              </p>
              {!busca && (
                <Button
                  variant="primary"
                  icon={<PlusCircle size={16} />}
                  onClick={criarPontoRapido}
                  disabled={processando}
                  className="flex items-center gap-2"
                >
                  {processando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  Criar Ponto Rápido
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="mt-8 bg-sparkle-card border border-sparkle-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Shield className="text-green-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sparkle-text">Pontos de Restauração</h2>
                <p className="text-sparkle-text-secondary text-sm">
                  {pontosFiltrados.length} ponto(s) encontrado(s)
                </p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-sparkle-text-secondary uppercase bg-sparkle-card sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Descrição</th>
                    <th className="px-6 py-4 w-32 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pontosFiltrados.map((ponto, index) => (
                    <tr key={index} className="border-t border-sparkle-border hover:bg-sparkle-border/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-sparkle-text">
                        {ponto.Description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          className="p-2 hover:bg-blue-500/20 rounded-xl transition-all"
                          onClick={() => restaurar(ponto)}
                          disabled={processando}
                          title="Restaurar Sistema"
                        >
                          <RotateCcw size={18} className="text-blue-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Mensagem de beta */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-500">
              A listagem de pontos de restauração está em beta e pode ser instável, mas a criação funciona normalmente.
            </span>
          </div>
        </div>
      </div>

      {/* Modal de restauração */}
      <Modal
        open={modal.aberto}
        onClose={() =>
          !processando && setModal({ aberto: false, tipo: null, ponto: null })
        }
      >
        {modal.tipo === "restaurar" && modal.ponto && (
          <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <RotateCcw className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-sparkle-text">Restaurar Sistema</h3>
            </div>

            <div className="p-4">
              <p className="text-sparkle-text-secondary mb-6">
                Tem certeza que deseja restaurar seu sistema para{" "}
                <span className="font-bold text-sparkle-text">"{modal.ponto.Description}"?</span> Seu PC será
                reiniciado e o ponto de restauração será aplicado.
                <br /><br />
                Seus arquivos não serão afetados, mas aplicativos e configurações recentes podem
                ser perdidos.
                <br /><br />
                Isso reverterá todas as alterações feitas pelo Maxify desde a criação deste ponto.
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
                  {processando ? <Loader2 size={16} className="animate-spin" /> : "Restaurar Sistema"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de ponto personalizado */}
      <Modal open={modalPersonalizadoAberto} onClose={() => !processando && setModalPersonalizadoAberto(false)}>
        <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <PlusCircle className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-sparkle-text">Criar Ponto Personalizado</h3>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-sparkle-text-secondary mb-2">
                Nome do ponto de restauração
              </label>
              <input
                type="text"
                value={nomePersonalizado}
                onChange={(e) => setNomePersonalizado(e.target.value)}
                placeholder="Digite o nome do ponto de restauração"
                className="w-full px-4 py-3 bg-sparkle-card border border-sparkle-border rounded-xl text-sparkle-text placeholder-sparkle-text-secondary focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={processando}
              />
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
                {processando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <PlusCircle size={16} />
                )}
                Criar Ponto
              </Button>
            </div>

            <p className="text-xs text-center text-sparkle-text-secondary">
              Isso pode levar algum tempo dependendo do seu hardware
            </p>
          </div>
        </div>
      </Modal>
    </RootDiv>
  )
}