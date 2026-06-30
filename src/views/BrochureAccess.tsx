import { useState, useEffect, useRef } from "react";
import { db } from "../firebase"; // ton import Firebase existant
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// ── CODES VALIDES → lang → path Storage ──────────────────────────────────
// Ajoute tes codes ici. Le path correspond à l'emplacement dans Firebase Storage.
const INVITE_CODES: Record<string, { lang: "fr" | "en"; path: string }> = {
  "LYA-ORIG-2026":  { lang: "fr", path: "brochures/LYA_Brochure_FR_final.pdf" },
  "PIONEER-ACCESS": { lang: "en", path: "brochures/LYA_Brochure_EN_final.pdf" },
  // Ajoute autant de codes que nécessaire
  // "LYA-BALD-2026": { lang: "en", path: "brochures/LYA_Brochure_EN_final.pdf" },
};

// Durée de session en minutes (URL signée Firebase)
const SESSION_MINUTES = 60;

type Stage = "gate" | "loading" | "viewer" | "expired";

export default function BrochureAccess() {
  const [stage, setStage]       = useState<Stage>("gate");
  const [code, setCode]         = useState("");
  const [lang, setLang]         = useState<"fr" | "en">("fr");
  const [showCode, setShowCode] = useState(false);
  const [error, setError]       = useState("");
  const [pdfUrl, setPdfUrl]     = useState("");
  const [email, setEmail]       = useState("LYA ORIGINALS");
  const [timeLeft, setTimeLeft] = useState(SESSION_MINUTES * 60);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "viewer") return;
    setTimeLeft(SESSION_MINUTES * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPdfUrl("");
          setStage("expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [stage]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Validation du code ───────────────────────────────────────────────────
  async function handleSubmit() {
    const normalized = code.trim().toUpperCase();
    if (!normalized) { setError(t("Entrez votre code d'invitation.", "Enter your invite code.")); return; }

    const match = INVITE_CODES[normalized];
    if (!match) {
      setError(t("Code invalide. Vérifiez votre invitation.", "Invalid code. Check your invitation."));
      triggerShake();
      return;
    }

    // Vérification Firestore : code déjà utilisé ?
    setStage("loading");
    try {
      const q = query(collection(db, "inviteCodes"), where("code", "==", normalized));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();

        if (data.used) {
          setStage("gate");
          setError(t("Ce code a déjà été utilisé.", "This code has already been used."));
          return;
        }
        if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
          setStage("gate");
          setError(t("Ce code a expiré.", "This code has expired."));
          return;
        }
        if (data.email) setEmail(data.email);

        // Marquer utilisé
        await updateDoc(doc.ref, { used: true, usedAt: Timestamp.now(), usedLang: match.lang });
      }
      // Si pas dans Firestore → code hardcodé valide, on continue

      // Récupérer URL Firebase Storage
      const storage = getStorage();
      const fileRef = ref(storage, match.path);
      const url = await getDownloadURL(fileRef);
      setPdfUrl(url);
      setStage("viewer");

    } catch (err) {
      console.error(err);
      setStage("gate");
      setError(t("Erreur réseau. Réessayez.", "Network error. Please try again."));
    }
  }

  function triggerShake() {
    const el = document.getElementById("code-field");
    el?.classList.add("lya-shake");
    setTimeout(() => el?.classList.remove("lya-shake"), 500);
  }

  // ── Helpers i18n ─────────────────────────────────────────────────────────
  const t = (fr: string, en: string) => lang === "fr" ? fr : en;

  // ── Watermark rows ───────────────────────────────────────────────────────
  const wmText = `${email} · CONFIDENTIEL · LYA ORIGINALS · `;
  const wmRows = Array.from({ length: 14 });
  const wmCols = Array.from({ length: 5 });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .lya-gate {
          min-height: 100vh; background: #0D1117; color: #E8EAF0;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 2rem 1.5rem; gap: 2.5rem;
          position: relative; overflow: hidden;
        }
        .lya-gate::before {
          content: ''; position: fixed; top: -30vh; left: 50%;
          transform: translateX(-50%); width: 80vw; height: 80vw;
          background: radial-gradient(ellipse, rgba(124,63,191,.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .lya-ticker {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 200;
          background: linear-gradient(90deg,#7C3FBF,#00D4E8,#E0326E,#7C3FBF);
          background-size: 200% 100%;
          animation: lyaTicker 4s linear infinite;
        }
        @keyframes lyaTicker { to { background-position: -200% 0; } }

        .lya-logo { display: flex; align-items: center; gap: .75rem; z-index: 1; }
        .lya-logo-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg,#7C3FBF,#00D4E8);
          display: flex; align-items: center; justify-content: center;
          font-family: monospace; font-size: 13px; font-weight: 700; color: #fff;
        }
        .lya-logo-name { font-size: 13px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; }
        .lya-logo-sub  { font-size: 10px; letter-spacing: .12em; color: #5A6478; text-transform: uppercase; margin-top: 2px; }

        .lya-card {
          width: 100%; max-width: 460px; z-index: 1;
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px; padding: 2.5rem 2rem;
          backdrop-filter: blur(12px);
          display: flex; flex-direction: column; gap: 1.75rem;
        }
        .lya-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase;
          color: #00D4E8; border: 1px solid rgba(0,212,232,.25);
          border-radius: 100px; padding: 5px 12px; margin-bottom: 1rem;
        }
        .lya-badge::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%; background: #00D4E8;
          animation: lyaPulse 2s ease-in-out infinite;
        }
        @keyframes lyaPulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        .lya-card h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -.02em; color: #fff; margin-bottom: .5rem; }
        .lya-card h1 span { color: #7C3FBF; }
        .lya-card .lya-sub { font-size: .875rem; color: #5A6478; line-height: 1.6; }

        .lya-lang {
          display: flex; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 4px; gap: 4px;
        }
        .lya-lang button {
          flex: 1; padding: .55rem; border: none; border-radius: 7px;
          background: transparent; color: #5A6478;
          font-family: inherit; font-size: .8rem; font-weight: 600;
          letter-spacing: .08em; cursor: pointer; transition: all .2s;
        }
        .lya-lang button.active { background: #7C3FBF; color: #fff; }

        .lya-field { display: flex; flex-direction: column; gap: .5rem; }
        .lya-field label { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #5A6478; }
        .lya-input-wrap { position: relative; }
        .lya-input {
          width: 100%; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07); border-radius: 12px;
          padding: .875rem 3rem .875rem 1.25rem;
          color: #E8EAF0; font-family: monospace; font-size: 1rem;
          letter-spacing: .12em; text-transform: uppercase;
          outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .lya-input::placeholder { color: #5A6478; text-transform: none; letter-spacing: 0; font-family: inherit; font-size: .875rem; }
        .lya-input:focus { border-color: #7C3FBF; box-shadow: 0 0 0 3px rgba(124,63,191,.15); }
        .lya-eye {
          position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #5A6478;
          padding: 0; line-height: 0; transition: color .2s;
        }
        .lya-eye:hover { color: #E8EAF0; }
        .lya-error { font-size: .78rem; color: #E0326E; display: flex; align-items: center; gap: 5px; margin-top: .25rem; }
        @keyframes lyaShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)} }
        .lya-shake { animation: lyaShake .35s ease; }

        .lya-btn {
          width: 100%; padding: .9rem; border: none; border-radius: 12px;
          background: linear-gradient(135deg,#7C3FBF,#5B2D9E);
          color: #fff; font-family: inherit; font-size: .9rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          cursor: pointer; position: relative; overflow: hidden;
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }
        .lya-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,63,191,.35); }
        .lya-btn:active { transform: translateY(0); }
        .lya-spin::after {
          content: ''; display: block; width: 18px; height: 18px; margin: 0 auto;
          border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
          border-radius: 50%; animation: lyaSpin .7s linear infinite;
        }
        @keyframes lyaSpin { to { transform: rotate(360deg); } }

        .lya-footer { font-size: .72rem; color: #5A6478; text-align: center; line-height: 1.8; z-index: 1; }
        .lya-footer a { color: #5A6478; text-decoration: none; }
        .lya-footer a:hover { color: #E8EAF0; }

        /* VIEWER */
        .lya-viewer {
          position: fixed; inset: 0; z-index: 100;
          background: #0D1117; display: flex; flex-direction: column;
        }
        .lya-vbar {
          height: 52px; min-height: 52px; flex-shrink: 0;
          background: #111720; border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center;
          justify-content: space-between; padding: 0 1.5rem;
        }
        .lya-vbar-l { display: flex; align-items: center; gap: .75rem; }
        .lya-vbar-icon {
          width: 28px; height: 28px; border-radius: 6px;
          background: linear-gradient(135deg,#7C3FBF,#00D4E8);
          display: flex; align-items: center; justify-content: center;
          font-family: monospace; font-size: 9px; font-weight: 700; color: #fff;
        }
        .lya-vtitle { font-size: .8rem; font-weight: 600; letter-spacing: .08em; color: #E8EAF0; }
        .lya-vsub   { font-size: .68rem; color: #5A6478; margin-top: 1px; }
        .lya-vbar-r { display: flex; align-items: center; gap: .75rem; }
        .lya-vtime {
          font-size: .68rem; font-weight: 600; font-family: monospace;
          color: #00D4E8; border: 1px solid rgba(0,212,232,.2);
          border-radius: 100px; padding: 3px 10px;
        }
        .lya-vclose {
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px; color: #5A6478; padding: 5px 12px;
          font-family: inherit; font-size: .75rem; cursor: pointer; transition: all .2s;
        }
        .lya-vclose:hover { background: rgba(255,255,255,.09); color: #E8EAF0; }

        .lya-pdf-wrap {
          flex: 1; position: relative; overflow: hidden;
          user-select: none; -webkit-user-select: none;
        }
        .lya-pdf-overlay {
          position: absolute; inset: 0; z-index: 10; background: transparent;
        }
        .lya-pdf-frame { width: 100%; height: 100%; border: none; display: block; }

        /* Watermark */
        .lya-wm {
          position: absolute; inset: 0; z-index: 5;
          pointer-events: none; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .lya-wm-inner {
          position: absolute; inset: -50%;
          display: flex; flex-direction: column; gap: 80px;
          transform: rotate(-28deg); opacity: .05;
        }
        .lya-wm-row { display: flex; gap: 100px; white-space: nowrap; }
        .lya-wm-text {
          font-family: monospace; font-size: 13px; font-weight: 700;
          color: #fff; letter-spacing: .1em; text-transform: uppercase;
        }

        /* Expired */
        .lya-expired {
          min-height: 100vh; background: #0D1117;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1.5rem; text-align: center; padding: 2rem;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .lya-expired h2 { font-size: 1.5rem; font-weight: 700; color: #fff; }
        .lya-expired p  { color: #5A6478; font-size: .9rem; line-height: 1.6; }
        .lya-expired a  { color: #00D4E8; font-size: .875rem; }
      `}</style>

      {/* ── TICKER ── */}
      <div className="lya-ticker" />

      {/* ══ GATE ══ */}
      {stage === "gate" && (
        <div className="lya-gate">
          <div className="lya-logo">
            <div className="lya-logo-icon">LYA</div>
            <div>
              <div className="lya-logo-name">LINKYOURART</div>
              <div className="lya-logo-sub">LE TERMINAL CRÉATIF</div>
            </div>
          </div>

          <div className="lya-card">
            <div>
              <div className="lya-badge">{t("Accès Anticipé", "Early Access")}</div>
              <h1>LYA <span>Originals</span></h1>
              <p className="lya-sub">
                {t(
                  "Entrez votre code d'invitation pour accéder à la brochure exclusive. Lien valide 60 minutes, usage unique.",
                  "Enter your invite code to access the exclusive brochure. Link valid 60 minutes, single use."
                )}
              </p>
            </div>

            {/* Lang */}
            <div className="lya-lang">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  className={lang === l ? "active" : ""}
                  onClick={() => setLang(l)}
                >
                  {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                </button>
              ))}
            </div>

            {/* Code input */}
            <div className="lya-field">
              <label>{t("Code d'invitation", "Invite code")}</label>
              <div className="lya-input-wrap" id="code-field">
                <input
                  type={showCode ? "text" : "password"}
                  className="lya-input"
                  placeholder={t("Ex : LYA-XXXX-XXXX", "Ex: LYA-XXXX-XXXX")}
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  maxLength={32}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="lya-eye" onClick={() => setShowCode(!showCode)} aria-label="Toggle visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showCode
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {error && (
                <div className="lya-error">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
            </div>

            <button className="lya-btn" onClick={handleSubmit}>
              {t("Accéder à la brochure", "Access brochure")}
            </button>
          </div>

          <div className="lya-footer">
            {t("Accès sur invitation · Usage unique · Expire après 60 min", "Invitation only · Single use · Expires after 60 min")}<br />
            <a href="mailto:contact@linkyourart.com">contact@linkyourart.com</a>
            &nbsp;·&nbsp; Paris · Rennes · London<br /><br />
            © 2026 LYA — {t("Tous droits réservés", "All rights reserved")}
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {stage === "loading" && (
        <div className="lya-gate">
          <div className="lya-card" style={{ alignItems: "center", padding: "3rem" }}>
            <div className="lya-spin" />
            <p className="lya-sub" style={{ textAlign: "center", marginTop: "1rem" }}>
              {t("Vérification en cours…", "Verifying…")}
            </p>
          </div>
        </div>
      )}

      {/* ══ VIEWER ══ */}
      {stage === "viewer" && (
        <div className="lya-viewer">
          <div className="lya-vbar">
            <div className="lya-vbar-l">
              <div className="lya-vbar-icon">LYA</div>
              <div>
                <div className="lya-vtitle">
                  {lang === "fr" ? "Brochure FR — LYA Originals" : "Brochure EN — LYA Originals"}
                </div>
                <div className="lya-vsub">
                  {t("Accès confidentiel — Ne pas diffuser", "Confidential access — Do not distribute")}
                </div>
              </div>
            </div>
            <div className="lya-vbar-r">
              <span className="lya-vtime">⏱ {formatTime(timeLeft)}</span>
              <button className="lya-vclose" onClick={() => { setPdfUrl(""); setStage("gate"); }}>
                ✕ {t("Fermer", "Close")}
              </button>
            </div>
          </div>

          <div className="lya-pdf-wrap">
            {/* Overlay anti right-click */}
            <div
              className="lya-pdf-overlay"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* Watermark */}
            <div className="lya-wm">
              <div className="lya-wm-inner">
                {wmRows.map((_, r) => (
                  <div key={r} className="lya-wm-row">
                    {wmCols.map((_, c) => (
                      <span key={c} className="lya-wm-text">{wmText}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <iframe
              className="lya-pdf-frame"
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="LYA Originals — Brochure Confidentielle"
            />
          </div>
        </div>
      )}

      {/* ══ EXPIRED ══ */}
      {stage === "expired" && (
        <div className="lya-expired">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E0326E" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2>{t("Session expirée", "Session expired")}</h2>
          <p>
            {t(
              "Votre accès de 60 minutes est arrivé à expiration.\nContactez-nous pour un nouveau code.",
              "Your 60-minute access has expired.\nContact us for a new code."
            )}
          </p>
          <a href="mailto:contact@linkyourart.com">contact@linkyourart.com</a>
        </div>
      )}
    </>
  );
}
