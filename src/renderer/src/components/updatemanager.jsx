import { useState, useEffect, useMemo } from "react"
import Modal from "@/components/ui/modal"
import Button from "@/components/ui/button"
import { toast } from "react-toastify"

export default function UpdateManager() {
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateVersion, setUpdateVersion] = useState(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadPercent, setDownloadPercent] = useState(0)
  const [checking, setChecking] = useState(true)

  const isDownloaded = useMemo(
    () => downloadPercent >= 100,
    [downloadPercent]
  )

  useEffect(() => {
    const onAvailable = (_e, payload) => {
      setChecking(false)
      setUpdateVersion(payload?.version ?? null)
      setUpdateOpen(true)
      setIsDownloading(false)
      setDownloadPercent(0)
    }

    const onNotAvailable = () => {
      setChecking(false)
      toast.success("Você já está na versão mais recente")
    }

    const onError = (_e, payload) => {
      setChecking(false)
      toast.error(payload?.message ?? "Erro ao atualizar")
      setIsDownloading(false)
    }

    const onProgress = (_e, payload) => {
      setIsDownloading(true)

      const percent = Math.max(
        0,
        Math.min(100, payload?.percent || 0)
      )

      setDownloadPercent(percent)
    }

    const onDownloaded = () => {
      setIsDownloading(false)
      setDownloadPercent(100)
    }

    // LISTENERS
    window.electron.ipcRenderer.on("updater:available", onAvailable)
    window.electron.ipcRenderer.on("updater:not-available", onNotAvailable)
    window.electron.ipcRenderer.on("updater:error", onError)
    window.electron.ipcRenderer.on("updater:download-progress", onProgress)
    window.electron.ipcRenderer.on("updater:downloaded", onDownloaded)

    return () => {
      window.electron.ipcRenderer.removeListener("updater:available", onAvailable)
      window.electron.ipcRenderer.removeListener("updater:not-available", onNotAvailable)
      window.electron.ipcRenderer.removeListener("updater:error", onError)
      window.electron.ipcRenderer.removeListener("updater:download-progress", onProgress)
      window.electron.ipcRenderer.removeListener("updater:downloaded", onDownloaded)
    }
  }, [])

  const handleUpdateNow = async () => {
    try {
      if (isDownloaded) {
        await window.electron.ipcRenderer.invoke("updater:install")
        return
      }

      setIsDownloading(true)
      setDownloadPercent(0)

      await window.electron.ipcRenderer.invoke("updater:download")
    } catch (err) {
      toast.error("Falha ao iniciar atualização")
      setIsDownloading(false)
    }
  }

  return (
    <Modal open={updateOpen} onClose={() => {}}>
      <div className="bg-sparkle-card border border-sparkle-border rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">

        <h2 className="text-xl font-semibold mb-2 text-sparkle-primary">
          Atualização disponível
          {updateVersion ? ` (${updateVersion})` : ""}
        </h2>

        <p className="mb-4 text-sparkle-text">
          {checking && "Verificando atualizações..."}

          {isDownloaded &&
            "Atualização baixada! Reinicie para instalar agora."}

          {isDownloading &&
            !isDownloaded &&
            `Baixando atualização… ${Math.floor(downloadPercent)}%`}

          {!isDownloading &&
            !isDownloaded &&
            !checking &&
            "Uma nova versão está disponível. Atualize para continuar com o Maxify funcionando corretamente."}
        </p>

        {/* BARRA DE PROGRESSO */}
        {isDownloading && (
          <div className="w-full bg-sparkle-border rounded-full h-2 mb-4">
            <div
              className="bg-sparkle-primary h-2 rounded-full transition-all"
              style={{ width: `${downloadPercent}%` }}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleUpdateNow}
            disabled={isDownloading && !isDownloaded}
          >
            {isDownloaded
              ? "Reiniciar e instalar"
              : isDownloading
              ? "Baixando…"
              : "Atualizar agora"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
