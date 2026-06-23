import { useState } from "react"

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Upload({ onUpload, loading }) {
    const [dragging, setDragging] = useState(false)

    function handleFile(file) {
        if (file && file.type.startsWith("image/")) onUpload(file)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "32px" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#ef4444", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "8px" }}>// FORENSIC ANALYSIS ENGINE</div>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>ForensIQ</h1>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "420px", lineHeight: 1.6 }}>
                    Upload an image for forensic deepfake analysis — verdict, confidence score, attention heatmap, and plain-language explanation.
                </p>
            </div>

            <label
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                    padding: "48px 60px", maxWidth: "480px",
                    border: `1px dashed ${dragging ? "#ef4444" : "var(--border)"}`,
                    borderRadius: "14px", cursor: "pointer",
                    background: dragging ? "var(--bg-hover)" : "var(--bg-card)",
                    transition: "all 0.2s"
                }}>
                <div style={{ fontSize: "32px" }}>{loading ? "⏳" : "📷"}</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>
                    {loading ? "Analyzing image..." : "Drop an image here"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono }}>or click to browse · JPG, PNG</div>
                <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
            </label>
        </div>
    )
}