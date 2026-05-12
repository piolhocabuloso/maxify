import { useEffect, useState } from "react";

export default function UpdateCard() {
    const [newVersion, setNewVersion] = useState(null);

    useEffect(() => {
        async function check() {
            const version = await window.api.checkUpdate();
            if (version) {
                setNewVersion(version);
            }
        }

        check();
    }, []);

    if (!newVersion) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#1e1e1e",
            padding: 20,
            borderRadius: 12,
            color: "white",
            zIndex: 9999,
        }}>
            <h3>Nova atualização disponível 🚀</h3>
            <p>Versão {newVersion}</p>
            <button onClick={() => window.api.startUpdate()}>
                Atualizar agora
            </button>
        </div>
    );
}
