import { motion } from "framer-motion"
import { Crown, LockKeyhole, Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/ui/button"
import { freeFeatures, premiumFeatures } from "@/lib/access"

export default function PremiumLocked({ title = "Recurso Premium" }) {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-bg p-6">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="rounded-[28px] border border-blue-500/20 bg-maxify-card/80 p-7 shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
            <Crown size={14} /> Plano Premium
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-400/25 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10">
              <LockKeyhole size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-maxify-text">{title} bloqueado no Free</h1>
              <p className="mt-1 text-sm text-maxify-text-secondary">
                Essa área usa ajustes avançados. Para liberar, entre com uma key válida.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {premiumFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-2xl border border-maxify-border bg-maxify-border/10 p-3 text-sm text-maxify-text-secondary">
                <Sparkles size={16} className="text-blue-300" />
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => navigate("/login_pagina")}
              className="!bg-gradient-to-r from-blue-500 to-blue-600 !text-white rounded-xl px-5 py-3 font-semibold shadow-lg shadow-blue-500/20"
            >
              Ver minha conta <ArrowRight size={16} className="ml-2" />
            </Button>

            <Button
              onClick={() => navigate("/clean")}
              className="!bg-maxify-border/20 !text-maxify-text hover:!bg-maxify-border/30 rounded-xl px-5 py-3"
            >
              Usar limpeza grátis
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] border border-green-500/20 bg-green-500/[0.04] p-7 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-400/20 bg-green-400/10 text-green-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-maxify-text">Seu Free continua ativo</h2>
              <p className="text-sm text-maxify-text-secondary">Você ainda pode usar as funções liberadas.</p>
            </div>
          </div>

          <div className="space-y-3">
            {freeFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-2xl border border-green-500/15 bg-green-500/[0.06] p-3 text-sm text-green-100/80">
                <Zap size={15} className="text-green-300" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
