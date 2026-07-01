import { useState, useEffect, useRef } from "react";

const SESSION_DURATION = 30 * 60;

const VALID_CODES = [
  "LYA-ORIG-2026",
  "LYA-BALD-2026",
  "LYA-VIP-001",
  "LYA-VIP-002",
  "LYA-VIP-003",
];

const BROCHURES = { fr: "/LYA_Brochure_FR_final.pdf", en: "/LYA_Brochure_EN_final.pdf" };

const TEXT = {
  fr: { title: "Accès Réservé — LYA Originals", placeholder: "Entrez votre code d'invitation", submit: "Accéder", invalid: "Code invalide. Vérifiez votre invitation.", session: "Session expire dans", expired: "Session expirée. Veuillez recharger la page." },
  en: { title: "Members Only — LYA Originals", placeholder: "Enter your invite code", submit: "Access", invalid: "Invalid code. Please check your invitation.", session: "Session expires in", expired: "Session expired. Please reload the page." },
};

export default function BrochureAccess() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [code, setCode] = useState("");
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = TEXT[lang];

  useEffect(() => {
    if (!granted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); setExpired(true); setGranted(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [granted]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubmit = () => {
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      setGranted(true); setTimeLeft(SESSION_DURATION); setError("");
    } else {
      setError(t.invalid);
    }
  };

  if (!granted) {
    return (
      <div style={styles.gate}>
        <div style={styles.card}>
          <div style={styles.langToggle}>
            <button onClick={() => setLang("fr")} style={{ ...styles.langBtn, ...(lang === "fr" ? styles.langActive : {}) }}>FR</button>
            <button onClick={() => setLang("en")} style={{ ...styles.langBtn, ...(lang === "en" ? styles.langActive : {}) }}>EN</button>
          </div>
          <div style={styles.logo}>LYA</div>
          <h1 style={styles.title}>{t.title}</h1>
          {expired && <p style={styles.errorMsg}>{t.expired}</p>}
          <input style={styles.input} type="text" placeholder={t.placeholder} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {error && <p style={styles.errorMsg}>{error}</p>}
          <button style={styles.submitBtn} onClick={handleSubmit}>{t.submit}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.viewer}>
      <div style={styles.topBar}>
        <span style={styles.timerText}>{t.session} : <strong>{formatTime(timeLeft)}</strong></span>
        <div style={styles.langToggle}>
          <button onClick={() => setLang("fr")} style={{ ...styles.langBtn, ...(lang === "fr" ? styles.langActive : {}) }}>FR</button>
          <button onClick={() => setLang("en")} style={{ ...styles.langBtn, ...(lang === "en" ? styles.langActive : {}) }}>EN</button>
        </div>
      </div>
      <div style={styles.watermarkOverlay} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (<span key={i} style={styles.watermarkText}>LYA ORIGINALS — CONFIDENTIEL</span>))}
      </div>
      <iframe src={BROCHURES[lang]} style={styles.iframe} title="LYA Brochure" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  gate: { minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" },
  card: { background: "#161B22", border: "1px solid #30363D", borderRadius: "16px", padding: "48px 40px", maxWidth: "420px", width: "90%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" },
  langToggle: { display: "flex", gap: "8px", alignSelf: "flex-end" },
  langBtn: { background: "transparent", border: "1px solid #30363D", color: "#8B949E", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em" },
  langActive: { background: "#7C3FBF", border: "1px solid #7C3FBF", color: "#FFFFFF" },
  logo: { fontSize: "32px", fontWeight: 800, letterSpacing: "0.15em", background: "linear-gradient(135deg, #7C3FBF, #00D4E8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  title: { color: "#FFFFFF", fontSize: "18px", fontWeight: 600, textAlign: "center", margin: 0 },
  input: { width: "100%", padding: "14px 16px", background: "#0D1117", border: "1px solid #30363D", borderRadius: "8px", color: "#FFFFFF", fontSize: "15px", outline: "none", boxSizing: "border-box", letterSpacing: "0.1em", textTransform: "uppercase" },
  submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #7C3FBF, #00D4E8)", border: "none", borderRadius: "8px", color: "#FFFFFF", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" },
  errorMsg: { color: "#E0326E", fontSize: "13px", margin: 0, textAlign: "center" },
  viewer: { position: "relative", width: "100vw", height: "100vh", background: "#0D1117", display: "flex", flexDirection: "column" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "#161B22", borderBottom: "1px solid #30363D", zIndex: 10 },
  timerText: { color: "#8B949E", fontSize: "13px" },
  watermarkOverlay: { position: "absolute", top: "48px", left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)", padding: "40px", gap: "20px", overflow: "hidden" },
  watermarkText: { color: "rgba(255,255,255,0.05)", fontSize: "13px", fontWeight: 600, transform: "rotate(-30deg)", whiteSpace: "nowrap", userSelect: "none" },
  iframe: { flex: 1, border: "none", width: "100%" },
};
