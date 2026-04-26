import { useEffect, useState } from "react"
import { RefreshCw, Download, CheckCircle, AlertTriangle } from "lucide-react"

export default function UpdatePopup() {
    const [update, setUpdate] = useState(null)

    useEffect(() => {
        if (!window.updater) return

        window.updater.onStatus((data) => {
            setUpdate(data)
        })
    }, [])

    if (!update || update.type === "none") return null

    return (
        <div className="fixed bottom-6 right-6 z-[9999] w-[360px] rounded-3xl border border-blue-500/30 bg-[#07111f]/95 p-5 shadow-2xl shadow-blue-500/20 backdrop-blur-xl">
            <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-500/15 border border-blue-500/30 p-3 text-blue-300">
                    {update.type === "progress" ? (
                        <Download size={24} />
                    ) : update.type === "downloaded" ? (
                        <CheckCircle size={24} />
                    ) : update.type === "error" ? (
                        <AlertTriangle size={24} />
                    ) : (
                        <RefreshCw className="animate-spin" size={24} />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-white font-bold">
                        Atualizações do Maxify
                    </h3>

                    <p className="text-sm text-slate-300 mt-1">
                        {update.message}
                    </p>

                    {update.version && (
                        <p className="text-xs text-blue-300 mt-2">
                            Versão: {update.version}
                        </p>
                    )}

                    {update.type === "progress" && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Baixando</span>
                                <span>{update.percent}%</span>
                            </div>

                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                                    style={{ width: `${update.percent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}