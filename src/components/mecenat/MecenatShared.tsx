import React, { useState } from "react";
import { Contract, LYA_UNIT_VALUE } from "../../types";
import { getSafeImageUrl } from "../../utils/image";

// ─── THÈMES / FILTRES ─────────────────────────────────────────────────────────

export const MECENAT_THEMES = [
  { id: "all",    labelFR: "Toutes les Œuvres",      labelEN: "All Masterpieces",     icon: "⭐", cats: [] as string[] },
  { id: "visual", labelFR: "Arts Visuels & Mode",    labelEN: "Visual Arts & Fashion", icon: "🎨", cats: ["Fine Art", "Digital Art", "Photography", "Fashion", "Design"] },
  { id: "cinema", labelFR: "Cinéma & Récits",        labelEN: "Cinema & Narratives",   icon: "🎬", cats: ["Film", "TV Series", "Gaming", "Literature"] },
  { id: "music",  labelFR: "Musique & Scène",        labelEN: "Music & Concerts",      icon: "🎵", cats: ["Music", "Podcast", "Performing Arts"] },
  { id: "archi",  labelFR: "Lettres & Architecture", labelEN: "Literature & Spaces",   icon: "🏛️", cats: ["Architecture", "Gastronomy"] },
];

// ─── STATUTS DE RECONNAISSANCE MÉCÈNE (4 paliers) ──────────────────────────────

export const CO_STATUTS = [
  {
    min: 1, max: 19,
    labelFR: "MÉCÈNE",
    labelEN: "PATRON",
    descFR: "Badge Mécène visible sur votre profil LYA.",
    descEN: "Patron badge visible on your LYA profile.",
    multiplier: 1,
    bonusFR: "Mise à jour du projet suivie sur votre tableau de bord.",
    bonusEN: "Project updates tracked on your dashboard.",
    color: "text-primary-cyan", border: "border-white/10", bg: "bg-surface-high",
    isPrestige: false,
  },
  {
    min: 20, max: 49,
    labelFR: "MÉCÈNE ENGAGÉ",
    labelEN: "COMMITTED PATRON",
    descFR: "Statut Mécène Engagé. Accès prioritaire aux mises à jour du projet.",
    descEN: "Committed Patron status. Priority access to project updates.",
    multiplier: 1,
    bonusFR: "Inscription permanente et publique dans les crédits du Registre LYA du projet.",
    bonusEN: "Permanent, public inscription in the project's LYA Registry credits.",
    color: "text-[#00ff88]", border: "border-[#00ff88]/20", bg: "bg-[#0f2418]",
    isPrestige: false,
  },
  {
    min: 50, max: 149,
    labelFR: "MÉCÈNE D'HONNEUR",
    labelEN: "HONOR PATRON",
    descFR: "Mécène d'Honneur. Consultation directe du registre complet de l'œuvre.",
    descEN: "Honor Patron. Direct access to the full artwork registry.",
    multiplier: 1,
    bonusFR: "Certificat de mécénat physique et numéroté envoyé par courrier, plus une session d'échange exclusive avec le créateur.",
    bonusEN: "Numbered physical patronage certificate mailed to you, plus an exclusive session with the creator.",
    color: "text-[#a78bfa]", border: "border-[#a78bfa]/20", bg: "bg-[#1f1b3a]",
    isPrestige: false,
  },
  {
    min: 150, max: 349,
    labelFR: "MÉCÈNE FONDATEUR",
    labelEN: "FOUNDING PATRON",
    descFR: "Statut Mécène Fondateur. Inscription permanente au rang le plus élevé du Registre LYA.",
    descEN: "Founding Patron status. Permanent inscription at the highest rank of the LYA Registry.",
    multiplier: 1,
    bonusFR: "Une expérience réelle liée au projet (session studio, avant-première, visite d'atelier selon la discipline), et membre du Cercle des Mécènes Fondateurs LYA (événement annuel).",
    bonusEN: "A real experience tied to the project (studio session, premiere, atelier visit depending on the discipline), and membership in the LYA Founding Patrons Circle (annual event).",
    color: "text-amber-400", border: "border-amber-500/25", bg: "bg-[#2a2210]",
    isPrestige: true,
  },
  {
    min: 350, max: 500,
    labelFR: "PRODUCTEUR EXÉCUTIF ASSOCIÉ",
    labelEN: "ASSOCIATE EXECUTIVE PRODUCER",
    descFR: "Le rang de reconnaissance le plus élevé sur LYA. Titre adapté à la discipline du projet (ex. Producteur Exécutif Associé pour un film, Co-Producteur pour un album).",
    descEN: "The highest recognition rank on LYA. Title adapted to the project's discipline (e.g. Associate Executive Producer for a film, Co-Producer for an album).",
    multiplier: 1,
    bonusFR: "Crédit nominatif officiel sur l'œuvre finale, rencontre personnelle avec le créateur, et place d'honneur à l'événement annuel des Mécènes Fondateurs LYA.",
    bonusEN: "Official named credit on the finished work, a personal meeting with the creator, and a place of honor at the annual LYA Founding Patrons event.",
    color: "text-[#ff3366]", border: "border-accent-pink/25", bg: "bg-[#2a0f18]",
    isPrestige: true,
  },
];

export function getStatut(units: number) {
  return CO_STATUTS.find(s => units >= s.min && units <= s.max) || CO_STATUTS[CO_STATUTS.length - 1];
}

// ─── RARETÉ ───────────────────────────────────────────────────────────────────

export const RARITY_STYLE: Record<string, string> = {
  Epic:      "bg-purple-600/80 text-on-surface",
  Legendary: "bg-amber-500/80 text-black",
  Rare:      "bg-[#00d4ff]/80 text-black",
  Common:    "bg-gray-500/80 text-on-surface",
};

export function getUnitPrice(contract: Contract): number {
  // Prix fixe et non-negociable : $50 par unite, quelle que soit la "croissance"
  // du projet. Une contrepartie de mecenat ne doit jamais fluctuer avec la
  // performance du projet -- ce serait un mecanisme de valorisation financiere,
  // exactement ce que le contrat legal (ART. 5) exclut explicitement.
  // Le jour ou la Phase 4 (licence PSFP) sera active, LYA_UNIT_VALUE pourra
  // devenir un vrai indice de marche colle au Score LYA -- mais pas avant.
  return LYA_UNIT_VALUE;
}

// ─── MODAL PAIEMENT ───────────────────────────────────────────────────────────

interface PaymentModalProps { contract: Contract; units: number; onClose: () => void; lang: "FR" | "EN"; }
export function PaymentModal({ contract, units, onClose, lang }: PaymentModalProps) {
  const [email, setEmail] = useState("linkyourart@gmail.com");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const totalCost = units * getUnitPrice(contract);
  const fmt4 = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/(.{2})/, "$1/");
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-low border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88]">🔒</span>
            <span className="text-on-surface font-mono text-sm tracking-widest">{T("PAIEMENT SÉCURISÉ STRIPE", "STRIPE SECURE CHECKOUT")}</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant/70 hover:text-on-surface w-7 h-7 flex items-center justify-center rounded border border-white/10 hover:border-primary-cyan transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-surface-high/40 rounded-xl p-4 flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant/50 text-xs font-mono mb-1">{T("ENGAGEMENT DE SOUTIEN :", "PATRONAGE PLEDGE:")}</p>
              <p className="text-on-surface font-bold font-mono italic">{contract.name}</p>
              <p className="text-on-surface-variant/70 text-xs font-mono mt-1">{units} {T("unités", "units")} × ${getUnitPrice(contract).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant/50 text-xs font-mono mb-1">{T("TOTAL", "TOTAL COST")}</p>
              <p className="text-[#00ff88] font-bold text-2xl font-mono">${totalCost.toFixed(2)}</p>
            </div>
          </div>
          {[
            { label: T("ADRESSE EMAIL", "BILLING EMAIL ADDRESS"), type: "email", val: email, set: setEmail, ph: "" },
            { label: T("NOM DU TITULAIRE", "CARDHOLDER NAME"), type: "text", val: cardName, set: setCardName, ph: "JANE DOE" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-on-surface-variant/70 text-xs font-mono tracking-widest block mb-2">{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-3 text-on-surface font-mono text-sm placeholder-on-surface-variant/30 focus:border-primary-cyan focus:outline-none transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-on-surface-variant/70 text-xs font-mono tracking-widest block mb-2">{T("NUMÉRO DE CARTE", "CARD NUMBER")}</label>
            <div className="relative">
              <input type="text" value={cardNumber} onChange={e => setCardNumber(fmt4(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-3 text-on-surface font-mono text-sm placeholder-on-surface-variant/30 focus:border-primary-cyan focus:outline-none transition-colors pr-36" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="bg-[#1a1f71] text-on-surface text-[10px] font-bold px-3 py-0.5 rounded italic">VISA</span>
                <span className="flex"><span className="w-4 h-4 rounded-full bg-[#eb001b] opacity-90 -mr-1.5" /><span className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-90" /></span>
                <span className="bg-[#2557d6] text-on-surface text-xs font-bold px-1.5 py-0.5 rounded">AMEX</span>
                <span className="bg-[#00a1e0] text-on-surface text-[10px] font-bold px-1.5 py-0.5 rounded">CB</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-on-surface-variant/70 text-xs font-mono tracking-widest block mb-2">{T("EXPIRATION", "EXPIRY DATE")}</label>
              <input type="text" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-3 text-on-surface font-mono text-sm placeholder-on-surface-variant/30 focus:border-primary-cyan focus:outline-none" />
            </div>
            <div>
              <label className="text-on-surface-variant/70 text-xs font-mono tracking-widest block mb-2">CVV</label>
              <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" maxLength={4} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-3 text-on-surface font-mono text-sm placeholder-on-surface-variant/30 focus:border-primary-cyan focus:outline-none" />
            </div>
          </div>
          <button className="w-full bg-[#00ff88] hover:bg-[#00cc66] text-black font-bold font-mono py-4 rounded-xl transition-colors text-sm tracking-widest">
            ✦ {T("CONFIRMER", "CONFIRM")} — ${totalCost.toFixed(2)}
          </button>
          <p className="text-center text-on-surface-variant/40 text-xs font-mono">
            {T("Sécurisé par Stripe · Registre LYA certifié", "Secured by Stripe · LYA Certified Registry")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DÉTAIL PROJET ──────────────────────────────────────────────────────

interface DetailModalProps {
  contract: Contract;
  units: number;
  onUnitsChange: (u: number) => void;
  onClose: () => void;
  onPay: () => void;
  lang: "FR" | "EN";
}
export function DetailModal({ contract, onClose, onPay, units, onUnitsChange, lang }: DetailModalProps) {
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;
  const totalCost = units * getUnitPrice(contract);
  const statut = getStatut(units);
  const fundingPct = contract.availableUnits != null
    ? Math.round(((contract.totalUnits - contract.availableUnits) / contract.totalUnits) * 100)
    : Math.round(60 + (contract.totalScore / 1000) * 35);
  const fundingRaised = Math.round(contract.totalValue * (fundingPct / 100));
  const safeImage = getSafeImageUrl(contract.image, contract.category);

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-low border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Gauche */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary-cyan text-xs font-mono tracking-widest border border-primary-cyan/30 px-3 py-1 rounded">
                🖼 {T("GALERIE VISUELLE EXCLUSIVE", "EXCLUSIVE VISUAL GALLERY")}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
              <img src={safeImage} alt={contract.name} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
            </div>
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`flex-1 rounded-lg overflow-hidden border-2 cursor-pointer transition-opacity ${i === 0 ? "border-primary-cyan opacity-100" : i === 1 ? "border-transparent opacity-60" : "border-transparent opacity-30"}`} style={{ aspectRatio: "16/9" }}>
                  <img src={safeImage} alt="" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            {/* Garanties LYA — sans termes réglementaires */}
            <div className="bg-surface-low border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#00ff88]">✓</span>
                <span className="text-[#00ff88] text-xs font-mono tracking-widest">
                  {T("GARANTIES DE CONFIANCE LYA", "LYA TRUST ASSURANCE")}
                </span>
              </div>
              <p className="text-on-surface-variant/70 text-xs mb-3">
                {T(
                  "Intégralement répertorié sur le registre immuable LYA. Certification indexée en temps réel avec traçabilité complète des données.",
                  "Fully indexed on the LYA immutable registry. Certification with real-time indexation and full data traceability."
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="border border-white/10 text-on-surface-variant/70 text-xs font-mono px-3 py-1 rounded">
                  {T("Registre : ", "Registry: ")}LYA_REG_{contract.registryAddress?.slice(-8) || "0x000000"}
                </span>
                <span className="border border-white/10 text-on-surface-variant/70 text-xs font-mono px-3 py-1 rounded">
                  {T("Index : ", "Index: ")}{contract.registryIndex}
                </span>
              </div>
            </div>
          </div>

          {/* Droite */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-surface-high text-primary-cyan text-xs font-mono px-3 py-1 rounded">{contract.category.toUpperCase()}</span>
                  <span className="text-on-surface-variant/50 text-xs font-mono">ID: {contract.registryIndex}</span>
                </div>
                <h2 className="text-on-surface font-black text-2xl leading-tight mb-1" style={{ fontFamily: "Inter,system-ui,-apple-system,sans-serif", letterSpacing: "-0.02em" }}>{contract.name}</h2>
                <p className="text-primary-cyan text-xs font-mono tracking-widest">
                  {T("PROJET CERTIFIÉ", "CERTIFIED PROJECT")} · {contract.category.toUpperCase()}
                </p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant/70 hover:text-on-surface hover:border-primary-cyan transition-colors shrink-0">✕</button>
            </div>

            {/* Financement */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-on-surface-variant/50 text-xs font-mono">{T("BUDGET DE PRODUCTION", "TARGET PROJECT BUDGET")}</span>
                <span className="text-[#00ff88] text-xs font-mono font-bold">{fundingPct}%</span>
              </div>
              <div className="w-full bg-surface-high rounded-full h-1.5 mb-1">
                <div className="bg-[#00ff88] h-1.5 rounded-full transition-all" style={{ width: `${fundingPct}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-on-surface-variant/50">
                <span>{T("Levé : ", "Raised: ")}${fundingRaised.toLocaleString()}</span>
                <span>{T("Objectif : ", "Goal: ")}${contract.totalValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-on-surface-variant/50 text-xs font-mono tracking-widest mb-2">{T("DESCRIPTION DU PROJET", "PROJECT DESCRIPTION")}</p>
              <p className="text-on-surface-variant text-sm italic border-l-2 border-primary-cyan/30 pl-3 leading-relaxed">"{contract.description}"</p>
            </div>

            {/* ── LYA SCORE — 5 PILIERS ── */}
            {(() => {
              const score = contract.totalScore ?? 800;
              const piliers = [
                { labelFR: "Intégrité conceptuelle", labelEN: "Conceptual Integrity", pts: Math.round(score * 0.22), color: "#00d4ff" },
                { labelFR: "Maturité actuelle",      labelEN: "Current Maturity",      pts: Math.round(score * 0.20), color: "#a78bfa" },
                { labelFR: "Capacité d'évolution",   labelEN: "Growth Capacity",       pts: Math.round(score * 0.20), color: "#00ff88" },
                { labelFR: "Faisabilité",             labelEN: "Feasibility",           pts: Math.round(score * 0.19), color: "#f59e0b" },
                { labelFR: "Incarnation réelle",      labelEN: "Real Embodiment",       pts: Math.round(score * 0.19), color: "#ff6b6b" },
              ];
              const evalItems = [
                { labelFR: "Qualité Artistique",   labelEN: "Artistic Quality",   note: Math.round(score / 111), descFR: "Vision créative exceptionnelle",  descEN: "Exceptional creative vision",    color: "#ec4899" },
                { labelFR: "Viabilité Économique", labelEN: "Economic Viability", note: Math.round(score / 125), descFR: "Modèle financier solide",          descEN: "Solid financial model",          color: "#00ff88" },
                { labelFR: "Équipe",               labelEN: "Team",               note: Math.round(score / 111), descFR: "Réalisateurs primés",             descEN: "Award-winning directors",        color: "#3b82f6" },
                { labelFR: "Budget",               labelEN: "Budget",             note: Math.round(score / 125), descFR: "Réaliste et justifié",            descEN: "Realistic and justified",        color: "#f59e0b" },
                { labelFR: "Calendrier",           labelEN: "Timeline",           note: Math.round(score / 125), descFR: "Planification détaillée",         descEN: "Detailed planning",              color: "#8b5cf6" },
                { labelFR: "Potentiel Impact",     labelEN: "Impact Potential",   note: Math.round(score / 111), descFR: "Large audience potentielle",      descEN: "Large potential audience",       color: "#06b6d4" },
              ];
              return (
                <>
                  {/* Badge Certifié LYA */}
                  <div className="flex items-start gap-3 bg-gradient-to-r from-[#a78bfa]/10 to-[#00d4ff]/10 border border-[#a78bfa]/30 rounded-xl p-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#00d4ff] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-[#a78bfa] text-xs font-mono font-bold tracking-widest mb-0.5">{T("✦ CERTIFIÉ LINKYOURART", "✦ LINKYOURART CERTIFIED")}</p>
                      <p className="text-on-surface-variant/60 text-xs leading-relaxed">
                        {T("Ce projet a été sélectionné après une étude approfondie. Chaque création est évaluée selon nos 5 piliers de cotation créative.", "This project was selected after thorough review. Each creation is assessed across our 5 creative valuation pillars.")}
                      </p>
                    </div>
                  </div>

                  {/* 5 Piliers LYA SCORE — source de vérité directe depuis contract.pillars */}
                  {(() => {
                    const PILLAR_COLORS = ["#00d4ff","#a78bfa","#00ff88","#f59e0b","#ff6b6b"];
                    const PILLAR_LABELS_FR = ["Intégrité conceptuelle","Maturité actuelle","Capacité d'évolution","Faisabilité","Incarnation réelle"];
                    const PILLAR_LABELS_EN = ["Conceptual Integrity","Current Maturity","Growth Capacity","Feasibility","Real Embodiment"];
                    // Sous-critères : chaque pilier = 2 sous-critères sur 10, leur moyenne × 20 = score pilier /200
                    // On reconstitue les notes /10 depuis le score pilier réel
                    const pillars = contract.pillars ?? [];
                    const realTotal = pillars.reduce((a, p) => a + p.score, 0);
                    // 6 sous-critères affichés = 1 par pilier (les 5) + 1 synthèse globale
                    const subCriteria = [
                      { pillarIdx: 0, labelFR: "Vision artistique",      labelEN: "Artistic Vision",       color: "#00d4ff" },
                      { pillarIdx: 1, labelFR: "Traction actuelle",       labelEN: "Current Traction",      color: "#a78bfa" },
                      { pillarIdx: 2, labelFR: "Potentiel de croissance", labelEN: "Growth Potential",      color: "#00ff88" },
                      { pillarIdx: 3, labelFR: "Solidité du projet",      labelEN: "Project Solidity",      color: "#f59e0b" },
                      { pillarIdx: 4, labelFR: "Impact réel",             labelEN: "Real Impact",           color: "#ff6b6b" },
                      { pillarIdx: -1, labelFR: "Score global LYA",       labelEN: "Overall LYA Score",     color: "#ffffff" },
                    ];
                    return (
                      <>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-on-surface-variant/50 text-[10px] font-mono tracking-widest">✦ {T("LYA SCORE — 5 PILIERS (MAX 1000)", "LYA SCORE — 5 PILLARS (MAX 1000)")}</p>
                            <span className="text-amber-400 font-black font-mono text-sm">{realTotal}<span className="text-on-surface-variant/30 font-normal text-[10px]">/1000</span></span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {pillars.slice(0,5).map((p, i) => (
                              <div key={i} className="bg-surface-high rounded-lg p-2 text-center border border-white/5">
                                <p className="font-black font-mono text-sm mb-0.5" style={{ color: PILLAR_COLORS[i] }}>{p.score}</p>
                                <p className="text-on-surface-variant/40 text-[7px] leading-tight">{T(PILLAR_LABELS_FR[i], PILLAR_LABELS_EN[i])}</p>
                                <p className="text-on-surface-variant/20 text-[7px]">/200</p>
                              </div>
                            ))}
                          </div>
                          <div className="w-full bg-surface-high rounded-full h-1.5 overflow-hidden">
                            <div className="h-1.5 rounded-full" style={{ width: `${(realTotal/1000)*100}%`, background: "linear-gradient(90deg,#00d4ff,#a78bfa,#ff6b6b)" }} />
                          </div>
                          <p className="text-on-surface-variant/25 text-[10px] font-mono mt-1 text-center">
                            {T("Comme Moody's pour la finance — mais pour la création.", "Like Moody's for finance — but for creative works.")}
                          </p>
                        </div>

                        {/* Évaluation 2×3 — notes /10 dérivées mathématiquement des piliers réels */}
                        <div className="mb-4">
                          <p className="text-on-surface-variant/50 text-[10px] font-mono tracking-widest mb-2">◆ {T("ÉVALUATION DÉTAILLÉE", "DETAILED EVALUATION")}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {subCriteria.map((sc, i) => {
                              const note10 = sc.pillarIdx >= 0
                                ? Math.round((pillars[sc.pillarIdx]?.score ?? 0) / 20)  // score/200 × 10
                                : Math.round(realTotal / 100); // score global /1000 × 10
                              const pct = (note10 / 10) * 100;
                              const descFR = sc.pillarIdx >= 0
                                ? `${pillars[sc.pillarIdx]?.score ?? 0} pts sur 200`
                                : `${realTotal} pts sur 1000`;
                              const descEN = sc.pillarIdx >= 0
                                ? `${pillars[sc.pillarIdx]?.score ?? 0} pts out of 200`
                                : `${realTotal} pts out of 1000`;
                              return (
                                <div key={i} className="rounded-xl p-3 border" style={{ borderColor: `${sc.color}30`, background: `${sc.color}08` }}>
                                  <div className="flex justify-between items-start mb-1.5">
                                    <div>
                                      <p className="text-xs font-bold" style={{ color: sc.color }}>★ {T(sc.labelFR, sc.labelEN)}</p>
                                      <p className="text-on-surface-variant/40 text-xs">{T(descFR, descEN)}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center text-white font-black shrink-0" style={{ background: sc.color }}>
                                      <span className="text-xs leading-none">{note10}</span>
                                      <span className="text-[7px] font-normal leading-none opacity-70">/10</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-black/20 rounded-full h-0.5">
                                    <div className="h-0.5 rounded-full transition-all" style={{ width: `${pct}%`, background: sc.color }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-on-surface-variant/20 text-[10px] font-mono mt-2 text-center">
                            {T("Note /10 = score pilier ÷ 20 · Score global /10 = LYA SCORE ÷ 100", "Score /10 = pillar score ÷ 20 · Global /10 = LYA SCORE ÷ 100")}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </>
              );
            })()}

            {/* Sélecteur de soutien */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-on-surface-variant/50 text-xs font-mono tracking-widest">{T("MONTANT DE VOTRE SOUTIEN", "YOUR SUPPORT AMOUNT")}</span>
                <span style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.2),rgba(99,102,241,0.2))", border: "1px solid rgba(0,212,255,0.4)" }} className="text-primary-cyan text-[10px] px-3.5 py-1 rounded-md font-mono font-black">
                  {T(statut.labelFR, statut.labelEN)}
                </span>
              </div>
              <input type="range" min={1} max={500} value={units} onChange={e => onUnitsChange(Number(e.target.value))}
                className="w-full h-1 bg-surface-high rounded-full appearance-none cursor-pointer accent-primary-cyan" />
              <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/30 mt-1">
                <span>{T("Palier", "Tier")} {units}</span>
                <span>{T("Total :", "Total:")} <span className="text-white font-bold">${(units * getUnitPrice(contract)).toFixed(2)}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={onClose} className="w-full border border-white/10 text-on-surface-variant hover:text-on-surface hover:border-primary-cyan/50 font-bold font-mono py-3.5 rounded-xl transition-colors text-xs tracking-widest">
                {T("QUITTER", "EXIT")}
              </button>
              <button onClick={onPay} className="w-full font-bold font-mono py-3.5 rounded-xl transition-opacity text-xs tracking-widest text-black" style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)" }}>
                ✦ {T("SOUTENIR CE PROJET", "SUPPORT THIS PROJECT")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCORE LYA DÉFINITION ──────────────────────────────────────────────────────

export function WhatIsLyaUnit({ lang }: { lang: "FR" | "EN" }) {
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;
  const cols = [
    { num: "01", color: "#00d4ff", titleFR: "MESURE ÉVOLUTIVE", titleEN: "EVOLUTIONARY MEASURE", textFR: "C'est le standard de certification officiel qui mesure l'état évolutif d'une création.", textEN: "It is the official certification standard that measures the evolving state of a creation." },
    { num: "02", color: "#ff6b6b", titleFR: "NI CRYPTO, NI DEVISE", titleEN: "NOT A CRYPTO", textFR: "Ce n'est PAS une monnaie classique ou une crypto.", textEN: "It is NOT a classic currency or a crypto." },
    { num: "03", color: "#00ff88", titleFR: "VALEUR STRUCTURELLE", titleEN: "STRUCTURED STATE", textFR: "C'est un standard structuré qui représente l'état réel, la solidité et la trajectoire d'une création.", textEN: "It is a structured standard representing the real state, solidity and trajectory of a creation." },
  ];
  return (
    <div className="bg-surface-low/60 border border-white/10 rounded-2xl p-6 md:p-10 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
        <div>
          <p className="text-on-surface-variant/50 text-[10px] font-mono tracking-widest mb-3">{T("DÉFINITION OFFICIELLE", "OFFICIAL DEFINITION")}</p>
          <div className="inline-block border border-white/20 rounded-lg px-3 py-2 bg-white/5 mb-3">
            <h3 className="text-on-surface font-black leading-tight text-sm md:text-base" style={{ fontFamily: "Inter,system-ui,-apple-system,sans-serif", letterSpacing: "-0.01em" }}>
              {T("QU'EST-CE QUE LE SCORE LYA ?", "WHAT IS THE LYA SCORE?")}
            </h3>
          </div>
          <div className="w-16 h-1 rounded-full mt-1" style={{ background: "linear-gradient(90deg,#00d4ff,#a78bfa)" }} />
        </div>
        {cols.map(col => (
          <div key={col.num}>
            <p className="text-[10px] font-mono tracking-widest mb-2 font-bold" style={{ color: col.color }}>{col.num}. {T(col.titleFR, col.titleEN)}</p>
            <p className="text-on-surface-variant text-sm leading-relaxed">{T(col.textFR, col.textEN)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FICHE PROJET (carte) ──────────────────────────────────────────────────────

export interface ProjectCardProps {
  contract: Contract;
  lang: "FR" | "EN";
  onViewProject: (c: Contract, units: number) => void;
  onSupport: (c: Contract, units: number) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent, id: string) => void;
}
export function ProjectCard({ contract, lang, onViewProject, onSupport, isWatchlisted, onToggleWatchlist }: ProjectCardProps) {
  const [units, setUnits] = useState(5);
  const [liked, setLiked] = useState(!!isWatchlisted);
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;

  const unitPrice = getUnitPrice(contract);
  const totalCost = units * unitPrice;
  const statut = getStatut(units);

  const fundingPct = contract.availableUnits != null
    ? Math.round(((contract.totalUnits - contract.availableUnits) / contract.totalUnits) * 100)
    : Math.round(55 + (contract.totalScore / 1000) * 40);
  const fundingRaised = Math.round(contract.totalValue * (fundingPct / 100));

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onToggleWatchlist) onToggleWatchlist(e, contract.id);
  };

  return (
    <div className="bg-surface-low border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-primary-cyan/40 transition-colors h-full shadow-xl shadow-black/40">
      {/* Image — ratio fixe 16/9, pas d'étirement */}
      <div
        className="relative cursor-pointer overflow-hidden flex-shrink-0 w-full"
        style={{ aspectRatio: "3/2" }}
        onClick={() => onViewProject(contract, units)}
      >
        <img
          src={getSafeImageUrl(contract.image, contract.category)}
          alt={contract.name}
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Catégorie + Rareté */}
          <div className="flex gap-1.5 items-center">
            <span className="bg-surface-dim/80 text-primary-cyan text-xs px-3 py-0.5 rounded font-mono font-bold backdrop-blur-sm">
              {contract.category.toUpperCase()}
            </span>
            <span className={`text-xs px-3 py-0.5 rounded font-mono font-bold ${RARITY_STYLE[contract.rarity] || "bg-gray-500/80 text-on-surface"}`}>
              {contract.rarity.toUpperCase()}
            </span>
          </div>

          {/* Badge LYA SCORE — premium compact */}
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(234,88,12,0.9) 100%)",
            boxShadow: "0 0 8px rgba(245,158,11,0.5), 0 1px 4px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,200,50,0.4)",
          }} className="rounded-md px-3 py-1 backdrop-blur-sm w-[80px]">
            <p className="text-[7px] font-mono font-bold text-amber-900/70 tracking-widest leading-none mb-0.5">LYA SCORE</p>
            <p className="text-white font-black font-mono text-xs leading-none">
              {contract.totalScore}<span className="text-amber-200/50 font-normal text-[10px]">/1k</span>
            </p>
          </div>

          {/* Badge Certification — premium compact */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.9) 0%, rgba(99,102,241,0.9) 100%)",
            boxShadow: "0 0 8px rgba(0,212,255,0.4), 0 1px 4px rgba(0,0,0,0.4)",
            border: "1px solid rgba(0,212,255,0.35)",
          }} className="rounded-md px-3 py-1 backdrop-blur-sm w-[80px]">
            <p className="text-[7px] font-mono font-bold text-cyan-900/70 tracking-widest leading-none mb-0.5">{T("STATUT", "STATUS")}</p>
            <p className="text-white font-black font-mono text-xs leading-none">
              {T("Certifié", "Certified")}
            </p>
          </div>
        </div>

        {/* Bouton like */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors ${liked ? "text-red-500" : "text-on-surface-variant/70 hover:text-red-400"}`}
        >♥</button>

        {/* Infos bas de l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-on-surface-variant/70 text-[10px] font-mono mb-0.5">{T("PROJET CRÉATIF", "CREATIVE VENTURE")}</p>
          <div className="flex justify-between items-end gap-2">
            <h3 className="text-on-surface font-black text-base leading-tight min-w-0 break-words" style={{ fontFamily: "Inter,system-ui,-apple-system,sans-serif", letterSpacing: "-0.01em" }}>{contract.name}</h3>
            <div className="text-right shrink-0 ml-2">
              <p className="text-on-surface text-xs font-mono">{contract.totalScore}/1000</p>
              <p className="text-[#00ff88] text-[10px] font-mono">{T("Score LYA", "LYA Score")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-3 border-b border-white/10">
        <p className="text-primary-cyan text-[10px] font-mono tracking-widest mb-1">
          {T("PROJET CERTIFIÉ", "CERTIFIED PROJECT")} · {contract.category.toUpperCase()}
        </p>
        <p className="text-on-surface-variant/70 text-xs leading-relaxed line-clamp-2">{contract.description}</p>
      </div>

      {/* Score LYA + Financement */}
      <div className="px-4 py-3 border-b border-white/10 space-y-2.5">
        {/* LYA SCORE premium row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-widest" style={{ color: "#f59e0b" }}>★ LYA SCORE</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex-1 bg-surface-high rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full" style={{ width: `${(contract.totalScore / 1000) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#ef4444)" }} />
            </div>
            <span className="text-amber-400 font-mono font-black text-sm shrink-0">{contract.totalScore}<span className="text-on-surface-variant/30 font-normal text-xs">/1k</span></span>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-on-surface-variant/50 text-[10px] font-mono">{T("FINANCEMENT DU BUDGET", "BUDGET FUNDING")}</span>
            <span className="text-[#00ff88] text-[10px] font-mono font-bold">{fundingPct}%</span>
          </div>
          <div className="w-full bg-surface-high rounded-full h-1.5 mb-1">
            <div className="bg-[#00ff88] h-1.5 rounded-full" style={{ width: `${fundingPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/40">
            <span>${fundingRaised.toLocaleString()}</span>
            <span>{T("Cible", "Goal")}: ${contract.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Slider + métriques */}
      <div className="px-4 py-3 space-y-2.5 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-on-surface text-[10px] font-mono font-bold tracking-wider">
            {T("MONTANT DE VOTRE SOUTIEN", "YOUR SUPPORT AMOUNT")}
          </span>
          <span style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(99,102,241,0.2) 100%)",
            boxShadow: "0 0 8px rgba(0,212,255,0.25)",
            border: "1px solid rgba(0,212,255,0.4)",
          }} className="text-primary-cyan text-[10px] px-3.5 py-1 rounded-md font-mono font-black shrink-0">
            {units} {T("Soutiens", "Supports")}
          </span>
        </div>
        <input
          type="range" min={1} max={500} value={units}
          onChange={e => setUnits(Number(e.target.value))}
          className="w-full h-1 bg-surface-high rounded-full appearance-none cursor-pointer accent-primary-cyan"
        />
        <div className="flex justify-between text-[10px] text-on-surface-variant/40 font-mono">
          <span>{T("MINIMUM", "MIN")}</span><span>{T("MOYEN", "MID")}</span><span>{T("MAXIMUM", "MAX")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-surface-high border border-white/10 rounded-lg p-3">
            <p className="text-on-surface-variant/50 text-xs font-mono tracking-widest mb-1.5">{T("VOTRE ENGAGEMENT", "YOUR PLEDGE")}</p>
            <p className="text-on-surface font-bold font-mono text-base">${totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-surface-high border border-white/10 rounded-lg p-3">
            <p className="text-on-surface-variant/50 text-xs font-mono tracking-widest mb-1.5">{T("NIVEAU DE RECONNAISSANCE", "RECOGNITION LEVEL")} <span className="opacity-50">ⓘ</span></p>
            <p className="text-[#00ff88] font-bold font-mono text-base">{T(statut.labelFR, statut.labelEN)}</p>
          </div>
        </div>

        {/* Statut de reconnaissance mécène */}
        <div className={`border rounded-lg p-3 ${statut.border} ${statut.bg}`}>
          <p className={`text-[10px] font-mono font-bold mb-1.5 tracking-wider ${statut.color}`}>
            {T(statut.labelFR, statut.labelEN)}
          </p>
          <p className="text-on-surface-variant text-[10px] leading-relaxed">
            {T(statut.descFR, statut.descEN)} {T(statut.bonusFR, statut.bonusEN)}
          </p>
        </div>

        {/* Boutons action — distincts : Voir le Projet -> détail / Soutenir -> paiement direct */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-1">
          <button
            onClick={() => onViewProject(contract, units)}
            className="border border-white/10 text-on-surface py-3 rounded-full font-mono text-[10px] font-bold hover:border-primary-cyan hover:text-primary-cyan transition-colors tracking-wider"
          >
            {T("VOIR LE PROJET", "VIEW PROJECT")}
          </button>
          <button
            onClick={() => onSupport(contract, units)}
            className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-surface-dim py-3 rounded-full font-mono text-[10px] font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 tracking-wider"
          >
            ✦ {T("SOUTENIR CE PROJET", "SUPPORT THIS PROJECT")}
          </button>
        </div>
      </div>
    </div>
  );
}




