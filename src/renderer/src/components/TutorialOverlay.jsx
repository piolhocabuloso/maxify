import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CheckCircle2, Map, MousePointerClick, Sparkles, X } from "lucide-react"

const tutorialSteps = [
  {
    path: "/",
    title: "Dashboard",
    text: "Aqui você vê a visão geral do Maxify, sua conta e os principais atalhos do painel.",
    tip: "Use essa tela como ponto inicial antes de entrar nas ferramentas.",
  },
  {
    path: "/clean",
    title: "Limpeza",
    text: "Nessa página você encontra as opções de limpeza do app, separadas por cards e ações.",
    tip: "Leia o nome de cada ação antes de aplicar para saber exatamente o que será feito.",
  },
  {
    path: "/otimizacao",
    title: "Otimização",
    text: "Aqui ficam os ajustes principais. Escolha uma opção, veja a descrição e aplique somente o que fizer sentido para seu PC.",
    tip: "Depois de aplicar ajustes importantes, reiniciar o computador pode ajudar.",
  },
  {
    path: "/memory",
    title: "Memória RAM",
    text: "Essa área mostra opções ligadas à memória. Selecione o perfil correto de acordo com seu computador.",
    tip: "Não use uma opção de RAM diferente da sua máquina.",
  },
  {
    path: "/prioridade",
    title: "Prioridade de Jogos",
    text: "Use essa página para gerenciar jogos e entender quais ações estão disponíveis para cada um.",
    tip: "Se um jogo não aparecer, abra ele uma vez ou confira se foi instalado corretamente.",
  },
  {
    path: "/settings",
    title: "Configurações",
    text: "Aqui você ajusta preferências do app, tema, conta e detalhes gerais do Maxify.",
    tip: "Volte aqui sempre que quiser mudar a experiência do app.",
  },
]

export default function TutorialOverlay() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const step = tutorialSteps[index]
  const progress = useMemo(
    () => Math.round(((index + 1) / tutorialSteps.length) * 100),
    [index]
  )

  useEffect(() => {
    const openTutorial = () => {
      setIndex(0)
      setOpen(true)
      navigate(tutorialSteps[0].path)
    }

    window.addEventListener("maxify:start-tutorial", openTutorial)

    const shouldAutoOpen = localStorage.getItem("maxify:tutorial-seen") !== "true"
    if (shouldAutoOpen) {
      const timer = setTimeout(() => {
        setOpen(true)
        navigate(tutorialSteps[0].path)
      }, 900)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("maxify:start-tutorial", openTutorial)
      }
    }

    return () => {
      window.removeEventListener("maxify:start-tutorial", openTutorial)
    }
  }, [navigate])

  function closeTutorial() {
    localStorage.setItem("maxify:tutorial-seen", "true")
    setOpen(false)
  }

  function goToStep(nextIndex) {
    const safeIndex = Math.max(0, Math.min(tutorialSteps.length - 1, nextIndex))
    setIndex(safeIndex)
    navigate(tutorialSteps[safeIndex].path)
  }

  function next() {
    if (index >= tutorialSteps.length - 1) {
      closeTutorial()
      return
    }

    goToStep(index + 1)
  }

  function previous() {
    goToStep(index - 1)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-5 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24 }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] border border-blue-400/20 bg-maxify-bg/95 p-6 text-maxify-text shadow-[0_25px_80px_rgba(0,0,0,0.50)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/15 text-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.15)]">
                  <Map size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-300/80">Tutorial Maxify</p>
                  <h2 className="mt-1 text-2xl font-bold">{step.title}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeTutorial}
                className="rounded-2xl border border-maxify-border bg-maxify-card/60 p-2 text-maxify-text-secondary transition hover:text-maxify-text hover:bg-maxify-border/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10 mt-6 rounded-[26px] border border-maxify-border bg-black/18 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-200">
                <MousePointerClick size={17} /> Passo {index + 1} de {tutorialSteps.length}
              </div>

              <p className="text-[15px] leading-relaxed text-maxify-text-secondary">{step.text}</p>

              <div className="mt-4 rounded-2xl border border-blue-400/15 bg-blue-500/10 p-3 text-sm text-blue-100/90">
                <div className="mb-1 flex items-center gap-2 font-semibold text-blue-200">
                  <Sparkles size={15} /> Dica rápida
                </div>
                {step.tip}
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="mb-2 flex items-center justify-between text-[11px] text-maxify-text-secondary">
                <span>Progresso do tutorial</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-maxify-border/50">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={previous}
                disabled={index === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card/60 px-4 py-3 text-sm font-semibold text-maxify-text-secondary transition hover:text-maxify-text disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowLeft size={17} /> Anterior
              </button>

              <button
                type="button"
                onClick={next}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25"
              >
                {index >= tutorialSteps.length - 1 ? (
                  <>
                    <CheckCircle2 size={17} /> Finalizar
                  </>
                ) : (
                  <>
                    Próximo <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
