import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import { toast } from "react-toastify";
import { invoke } from "@/lib/electron";
import { CheckCircle2, AlertTriangle, Shield } from "lucide-react";
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
      await invoke({ channel: "create-sparkle-restore-point" });

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
    <Modal open={open}>
      <div className="bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 border border-sparkle-border rounded-3xl p-10 shadow-2xl max-w-xl w-full mx-4 flex flex-col items-center text-center relative">
        
        <div className="absolute top-6 right-6">
          <Shield className="text-blue-500/70" size={32} />
        </div>

        <h1 className="text-4xl font-extrabold text-sparkle-text mb-4">
          Bem-vindo ao Maxify
        </h1>

        <p className="text-sparkle-text-secondary mb-6 text-lg">
          Parece que é a primeira vez que você está usando o Maxify.<br />
          Gostaria de criar um <strong>ponto de restauração</strong> antes de começar?
        </p>

        <p className="text-sparkle-text-secondary mb-4 text-sm">
          Ao clicar em <strong>Sim</strong>, você garante maior segurança ao aplicar ajustes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
          <Button
            onClick={handleGetStarted}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={20} />
            Sim (Recomendado)
          </Button>

          <Button
            onClick={handleSkipRestorePoint}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10 px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle size={20} />
            Não (Não Recomendado)
          </Button>
        </div>

        <p className="text-sparkle-text-secondary mt-2 text-sm">
          <span className="font-semibold">Versão do Maxify:</span> {data?.version || "Erro ao buscar versão"}
        </p>
      </div>
    </Modal>
  );
}
