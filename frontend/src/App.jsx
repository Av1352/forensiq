import { useState } from "react"
import Upload from "./components/Upload"
import Report from "./components/Report"

const API = import.meta.env.VITE_API_URL

export default function App() {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleUpload(file) {
        setLoading(true)
        setError(null)
        try {
            const fd = new FormData()
            fd.append("file", file)
            const res = await fetch(`${API}/analyze`, { method: "POST", body: fd })
            const json = await res.json()
            if (!res.ok) throw new Error(json.detail || "Analysis failed")
            setResult(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <header style={{
                borderBottom: "1px solid var(--border)", padding: "0 40px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg)", position: "sticky", top: 0, zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: "#ef4444", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "14px"
                    }}>🔍</div>
                    <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "var(--text)" }}>
                        ForensIQ
                    </span>
                    <span style={{
                        fontSize: "10px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "4px"
                    }}>/ Deepfake Forensic Analysis</span>
                </div>
                <div style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--text-dim)", background: "var(--bg-card)",
                    border: "1px solid var(--border)", borderRadius: "6px", padding: "5px 12px"
                }}>
                    EfficientNet-B0 + Grad-CAM + Claude
                </div>
            </header>

            <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>
                {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "14px 16px", color: "var(--red)", fontSize: "13px", marginBottom: "24px" }}>
                        ⚠ {error}
                    </div>
                )}

                {!result && <Upload onUpload={handleUpload} loading={loading} />}
                {result && <Report result={result} onReset={() => setResult(null)} />}
            </main>
        </div>
    )
}