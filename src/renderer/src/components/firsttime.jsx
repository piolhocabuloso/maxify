import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "react-toastify";
import { invoke } from "@/lib/electron";
import { CheckCircle2, AlertTriangle, Shield, Sparkles, X } from "lucide-react";
import data from "../../../../package.json";

export default function FirstTime() {
  const [open, setOpen] = useState(false);

  // Abre apenas na primeira vez
  useEffect(() => {
    const firstTime = localStorage.getItem("firstTimeMaxify");
    if (!firstTime || firstTime === "true") {
      const timer = setTimeout(() => setOpen(true), 20);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGetStarted = async () => {
    localStorage.setItem("firstTimeMaxify", "false");
    setOpen(false);

    const toastId = toast.info(
      "Criando ponto de restauração... Aguarde antes de aplicar ajustes.",
      {
        autoClose: false,
        isLoading: true,
        closeOnClick: false,
        draggable: false,
      }
    );

    try {
      await invoke({ channel: "create-maxify-restore-point" });

      toast.update(toastId, {
        render: "Ponto de restauração criado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Falha ao criar ponto de restauração.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Erro ao criar ponto de restauração:", err);
    }
  };

  const handleSkipRestorePoint = () => {
    localStorage.setItem("firstTimeMaxify", "false");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={() => {}}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={clsx(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
              "bg-gradient-to-br from-maxify-bg to-maxify-card",
              "border border-maxify-border-secondary",
              "rounded-2xl p-8",
              "shadow-2xl",
              "max-w-lg w-full mx-4"
            )}
          >
            {/* Ícone do escudo animado */}
            <div className="absolute top-6 right-6">
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Shield className="text-maxify-primary/70" size={32} />
              </motion.div>
            </div>

            {/* Botão fechar */}
            <button
              onClick={handleSkipRestorePoint}
              className="absolute top-4 right-4 text-maxify-text-secondary hover:text-maxify-text transition-colors"
            >
              <X size={20} />
            </button>

            {/* Conteúdo principal */}
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-maxify-primary/20 to-maxify-primary/5 mb-6"
              >
                <Sparkles size={36} className="text-maxify-primary" />
              </motion.div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-maxify-text to-maxify-text-secondary bg-clip-text text-transparent mb-3">
                Bem-vindo ao Maxify
              </h3>

              <p className="text-maxify-text-secondary mb-4 text-lg">
                Parece que é a primeira vez que você está usando o Maxify.
              </p>

              <div className="bg-maxify-accent/30 rounded-xl p-4 mb-6 border border-maxify-border-secondary">
                <p className="text-maxify-text-secondary text-sm">
                  Gostaria de criar um <strong className="text-maxify-primary">ponto de restauração</strong> antes de começar?
                </p>
                <p className="text-maxify-text-tertiary text-xs mt-2">
                  Ao clicar em <strong>Sim</strong>, você garante maior segurança ao aplicar ajustes.
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                    "bg-gradient-to-r from-maxify-primary to-maxify-primary/80",
                    "text-white font-semibold",
                    "shadow-lg shadow-maxify-primary/20",
                    "hover:shadow-maxify-primary/40 transition-all duration-200"
                  )}
                >
                  <CheckCircle2 size={20} />
                  Sim (Recomendado)
                </motion.button>

                <motion.button
                  onClick={handleSkipRestorePoint}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                    "border border-red-500/50",
                    "text-red-400 font-semibold",
                    "bg-red-500/5",
                    "hover:bg-red-500/15 transition-all duration-200"
                  )}
                >
                  <AlertTriangle size={20} />
                  Não (Não Recomendado)
                </motion.button>
              </div>

              {/* Footer com versão */}
              <div className="pt-4 border-t border-maxify-border-secondary/50">
                <p className="text-maxify-text-tertiary text-xs">
                  <span className="font-semibold">Versão do Maxify:</span>{" "}
                  {data?.version || "Erro ao buscar versão"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}