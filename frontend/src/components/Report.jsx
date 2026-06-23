const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Report({ result, onReset }) {
    const caseId = "FQ-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = new Date().toLocaleString()
    const isFake = result.verdict === "FAKE"
    const verdictColor = isFake ? "#ef4444" : "#22c55e"

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Report header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: sans }}>
                        Case ID: <span style={{ fontFamily: mono, color: "var(--text)" }}>{caseId}</span>
                        {" · "}{timestamp}{" · "}{result.filename}
                    </div>
                </div>
                <button onClick={onReset}
                    style={{
                        fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-card)",
                        border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 16px",
                        cursor: "pointer", fontFamily: sans
                    }}>
                    ← New Analysis
                </button>
            </div>

            {/* Verdict box */}
            <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "24px",
                borderLeft: `4px solid ${verdictColor}`
            }}>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "8px" }}>DETECTION RESULT</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: verdictColor, fontFamily: mono, letterSpacing: "-0.02em" }}>
                    {result.verdict} — {result.confidence}% confidence
                </div>
            </div>

            {/* Images */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>ORIGINAL IMAGE</div>
                    <img src={`data:image/png;base64,${result.original_image}`} alt="original" style={{ width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }} />
                </div>
                <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>MODEL ATTENTION MAP</div>
                    <img src={`data:image/png;base64,${result.overlay_image}`} alt="heatmap" style={{ width: "100%", borderRadius: "10px", border: "1px solid var(--border)" }} />
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px", fontFamily: sans }}>Highlighted regions show where the model focused</div>
                </div>
            </div>

            {/* Forensic summary */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "12px" }}>FORENSIC SUMMARY</div>
                <div style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8, fontFamily: sans }}>
                    {result.explanation}
                </div>
            </div>

            {/* Region breakdown */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "14px" }}>ATTENTION REGION BREAKDOWN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.region_activations.slice(0, 5).map((r, i) => {
                        const pct = Math.min(r.activation * 100, 100)
                        return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "160px", fontSize: "12px", color: "var(--text-muted)", fontFamily: sans, textTransform: "capitalize" }}>{r.region}</div>
                                <div style={{ flex: 1, height: "8px", background: "var(--bg-hover)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{
                                        width: `${pct}%`, height: "100%",
                                        background: pct > 60 ? "#ef4444" : "#6b7280",
                                        borderRadius: "4px"
                                    }} />
                                </div>
                                <div style={{ width: "40px", fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, textAlign: "right" }}>{pct.toFixed(0)}%</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: sans, textAlign: "center", paddingTop: "8px" }}>
                This report is generated by an automated AI system for investigative support and should be reviewed by a qualified analyst. Model: EfficientNet-B0, 95% validation accuracy.
            </div>
        </div>
    )
}