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

// ─── STATUTS CO-PROPRIÉTAIRE (4 phases) ──────────────────────────────────────

export const CO_STATUTS = [
  {
    min: 1, max: 19,
    labelFR: "COPROPRIÉTAIRE ASSOCIÉ",
    labelEN: "ASSOCIATED CO-OWNER",
    descFR: "Droits de copropriété standard proportionnels aux unités détenues.",
    descEN: "Standard co-ownership rights proportional to units held.",
    bonusFR: "Bonus d'unités LYA : Aucun.",
    bonusEN: "LYA unit bonus: None.",
    color: "text-[#00d4ff]", border: "border-[#1e2a3a]", bg: "bg-[#1a2233]",
    isPrestige: false,
  },
  {
    min: 20, max: 29,
    labelFR: "MÉCÈNE STRATÉGIQUE",
    labelEN: "STRATEGIC PATRON",
    descFR: "Statut Copropriétaire Stratégique. Influenceur de volume sur les gains futurs.",
    descEN: "Strategic co-owner. Volume influencer on future gains.",
    bonusFR: "Bonus d'unités LYA : +0 Unité (+$0.00 offerte !).",
    bonusEN: "LYA unit bonus: +0 Unit (+$0.00 offered!).",
    color: "text-[#00ff88]", border: "border-[#00ff88]/20", bg: "bg-[#0f2418]",
    isPrestige: false,
  },
  {
    min: 30, max: 99,
    labelFR: "ASSOCIÉ MAJEUR LYA",
    labelEN: "LYA MAJOR ASSOCIATE",
    descFR: "Copropriétaire Associé Majeur. Consultation directe du registre complet de l'œuvre.",
    descEN: "Major Associate Co-owner. Direct access to the full artwork registry.",
    bonusFR: "Bonus d'unités LYA : +1 Unité (+$41.24 offerts !).",
    bonusEN: "LYA unit bonus: +1 Unit (+$41.24 offered!).",
    color: "text-[#a78bfa]", border: "border-[#a78bfa]/20", bg: "bg-[#1f1b3a]",
    isPrestige: false,
  },
  {
    min: 100, max: 100,
    labelFR: "CO-MÉCÈNE PRESTIGE SYNDICATE",
    labelEN: "PRESTIGE SYNDICATE CO-PATRON",
    descFR: "Classe Copropriétaire Prestige. Accès prioritaire absolu aux audits de licences mondiales.",
    descEN: "Prestige Co-owner Class. Absolute priority access to global license audits.",
    bonusFR: "Bonus d'unités LYA : +5 Unités (+$276.70 offerts !).",
    bonusEN: "LYA unit bonus: +5 Units (+$276.70 offered!).",
    color: "text-amber-400", border: "border-amber-500/25", bg: "bg-[#2a2210]",
    isPrestige: true,
  },
];

export function getStatut(units: number) {
  return CO_STATUTS.find(s => units >= s.min && units <= s.max) || CO_STATUTS[CO_STATUTS.length - 1];
}

// ─── RARETÉ ───────────────────────────────────────────────────────────────────

export const RARITY_STYLE: Record<string, string> = {
  Epic:      "bg-purple-600/80 text-white",
  Legendary: "bg-amber-500/80 text-black",
  Rare:      "bg-[#00d4ff]/80 text-black",
  Common:    "bg-gray-500/80 text-white",
};

export function getUnitPrice(contract: Contract): number {
  return contract.unitValue && contract.unitValue !== LYA_UNIT_VALUE
    ? contract.unitValue
    : LYA_UNIT_VALUE * (1 + (contract.growth || 0) / 100);
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
      <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a]">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88]">🔒</span>
            <span className="text-white font-mono text-sm tracking-widest">{T("PAIEMENT SÉCURISÉ STRIPE", "STRIPE SECURE CHECKOUT")}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-7 h-7 flex items-center justify-center rounded border border-[#1e2a3a] hover:border-[#00d4ff] transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#1e2a3a]/40 rounded-xl p-4 flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-mono mb-1">{T("ENGAGEMENT DE SOUTIEN :", "PATRONAGE PLEDGE:")}</p>
              <p className="text-white font-bold font-mono italic">{contract.name}</p>
              <p className="text-gray-400 text-xs font-mono mt-1">{units} {T("unités", "units")} × ${getUnitPrice(contract).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs font-mono mb-1">{T("TOTAL", "TOTAL COST")}</p>
              <p className="text-[#00ff88] font-bold text-2xl font-mono">${totalCost.toFixed(2)}</p>
            </div>
          </div>
          {[
            { label: T("ADRESSE EMAIL", "BILLING EMAIL ADDRESS"), type: "email", val: email, set: setEmail, ph: "" },
            { label: T("NOM DU TITULAIRE", "CARDHOLDER NAME"), type: "text", val: cardName, set: setCardName, ph: "JANE DOE" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-gray-400 text-xs font-mono tracking-widest block mb-2">{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full bg-[#1a2233] border border-[#1e2a3a] rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:border-[#00d4ff] focus:outline-none transition-colors" />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-xs font-mono tracking-widest block mb-2">{T("NUMÉRO DE CARTE", "CARD NUMBER")}</label>
            <div className="relative">
              <input type="text" value={cardNumber} onChange={e => setCardNumber(fmt4(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full bg-[#1a2233] border border-[#1e2a3a] rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:border-[#00d4ff] focus:outline-none transition-colors pr-36" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="bg-[#1a1f71] text-white text-[10px] font-bold px-2 py-0.5 rounded italic">VISA</span>
                <span className="flex"><span className="w-4 h-4 rounded-full bg-[#eb001b] opacity-90 -mr-1.5" /><span className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-90" /></span>
                <span className="bg-[#2557d6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AMEX</span>
                <span className="bg-[#00a1e0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">CB</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-mono tracking-widest block mb-2">{T("EXPIRATION", "EXPIRY DATE")}</label>
              <input type="text" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} className="w-full bg-[#1a2233] border border-[#1e2a3a] rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:border-[#00d4ff] focus:outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-mono tracking-widest block mb-2">CVV</label>
              <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" maxLength={4} className="w-full bg-[#1a2233] border border-[#1e2a3a] rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:border-[#00d4ff] focus:outline-none" />
            </div>
          </div>
          <button className="w-full bg-[#00ff88] hover:bg-[#00cc66] text-black font-bold font-mono py-4 rounded-xl transition-colors text-sm tracking-widest">
            ✦ {T("CONFIRMER", "CONFIRM")} — ${totalCost.toFixed(2)}
          </button>
          <p className="text-center text-gray-600 text-xs font-mono">
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
  const revenueRights = ((units * (contract.revenueSharePercentage || 10)) / 10000).toFixed(3);
  const fundingPct = contract.availableUnits != null
    ? Math.round(((contract.totalUnits - contract.availableUnits) / contract.totalUnits) * 100)
    : Math.round(60 + (contract.totalScore / 1000) * 35);
  const fundingRaised = Math.round(contract.totalValue * (fundingPct / 100));
  const safeImage = getSafeImageUrl(contract.image, contract.category);

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Gauche */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#1e2a3a]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#00d4ff] text-xs font-mono tracking-widest border border-[#00d4ff]/30 px-3 py-1 rounded">
                🖼 {T("GALERIE VISUELLE EXCLUSIVE", "EXCLUSIVE VISUAL GALLERY")}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
              <img src={safeImage} alt={contract.name} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
            </div>
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`flex-1 rounded-lg overflow-hidden border-2 cursor-pointer transition-opacity ${i === 0 ? "border-[#00d4ff] opacity-100" : i === 1 ? "border-transparent opacity-60" : "border-transparent opacity-30"}`} style={{ aspectRatio: "16/9" }}>
                  <img src={safeImage} alt="" className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            {/* Garanties LYA — sans termes réglementaires */}
            <div className="bg-[#0a1628] border border-[#1e2a3a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#00ff88]">✓</span>
                <span className="text-[#00ff88] text-xs font-mono tracking-widest">
                  {T("GARANTIES DE CONFIANCE LYA", "LYA TRUST ASSURANCE")}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-3">
                {T(
                  "Intégralement répertorié sur le registre immuable décentralisé LYA. Contrat de co-production indexé en temps réel avec traçabilité complète des données.",
                  "Fully indexed on the LYA decentralised immutable registry. Co-production contract with real-time indexation and full data traceability."
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="border border-[#1e2a3a] text-gray-400 text-xs font-mono px-3 py-1 rounded">
                  {T("Registre : ", "Registry: ")}LYA_REG_{contract.registryAddress?.slice(-8) || "0x000000"}
                </span>
                <span className="border border-[#1e2a3a] text-gray-400 text-xs font-mono px-3 py-1 rounded">
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
                  <span className="bg-[#1e2a3a] text-[#00d4ff] text-xs font-mono px-2 py-1 rounded">{contract.category.toUpperCase()}</span>
                  <span className="text-gray-500 text-xs font-mono">ID: {contract.registryIndex}</span>
                </div>
                <h2 className="text-white font-black text-2xl leading-tight mb-1" style={{ fontFamily: "Georgia,serif" }}>{contract.name}</h2>
                <p className="text-[#00d4ff] text-xs font-mono tracking-widest">
                  {T("INITIATIVE DE CO-PRODUCTION", "CO-PRODUCTION INITIATIVE")} · {contract.category.toUpperCase()}
                </p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full border border-[#1e2a3a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#00d4ff] transition-colors shrink-0">✕</button>
            </div>

            {/* Financement */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-xs font-mono">{T("BUDGET DE PRODUCTION", "TARGET PROJECT BUDGET")}</span>
                <span className="text-[#00ff88] text-xs font-mono font-bold">{fundingPct}%</span>
              </div>
              <div className="w-full bg-[#1e2a3a] rounded-full h-1.5 mb-1">
                <div className="bg-[#00ff88] h-1.5 rounded-full transition-all" style={{ width: `${fundingPct}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>{T("Levé : ", "Raised: ")}${fundingRaised.toLocaleString()}</span>
                <span>{T("Objectif : ", "Goal: ")}${contract.totalValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-gray-500 text-xs font-mono tracking-widest mb-2">{T("DESCRIPTION DU PROJET", "PROJECT DESCRIPTION")}</p>
              <p className="text-gray-300 text-sm italic border-l-2 border-[#00d4ff]/30 pl-3 leading-relaxed">"{contract.description}"</p>
            </div>

            {/* Jalons */}
            {contract.milestones && contract.milestones.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-500 text-xs font-mono tracking-widest mb-3">{T("JALONS DE DÉVELOPPEMENT", "DEVELOPMENT MILESTONES")}</p>
                <div className="space-y-2">
                  {contract.milestones.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0 ${m.status === "COMPLETED" ? "bg-[#00ff88]/20 text-[#00ff88]" : m.status === "IN_PROGRESS" ? "bg-[#00d4ff]/20 text-[#00d4ff]" : "border border-[#1e2a3a] text-gray-600"}`}>
                        {m.status === "COMPLETED" ? "✓" : "○"}
                      </span>
                      <span className={`text-xs font-mono ${m.status === "COMPLETED" ? "text-gray-500 line-through" : m.status === "IN_PROGRESS" ? "text-[#00d4ff]" : "text-gray-300"}`}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sélecteur d'unités */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-500 text-xs font-mono tracking-widest">{T("VOLUME D'ACQUISITION DES PARTS LYA", "LYA UNITS ACQUISITION VOLUME")}</span>
                <span className="bg-[#1e2a3a] text-[#00d4ff] text-xs px-2.5 py-0.5 rounded font-mono">{units} {T("Unités", "Units")}</span>
              </div>
              <input
                type="range" min={1} max={100} value={units}
                onChange={e => onUnitsChange(Number(e.target.value))}
                className="w-full h-1 bg-[#1e2a3a] rounded-full appearance-none cursor-pointer accent-[#00d4ff]"
              />
            </div>

            {/* Bénéfices */}
            <div className="bg-[#0a1628] border border-[#1e2a3a] rounded-xl p-4 mb-4">
              <p className="text-gray-500 text-xs font-mono tracking-widest mb-3">
                {T(`ESTIMATION POUR ${units} UNITÉS`, `ESTIMATED BENEFITS FOR ${units} UNITS`)}
              </p>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 text-sm">{T("Total de votre soutien :", "Total backing pledge:")}</span>
                <span className="text-white font-mono font-bold">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{T("Co-gains de redevance bruts :", "Cumulative Revenue rights:")}</span>
                <span className="text-[#00ff88] font-mono font-bold">{revenueRights}%</span>
              </div>
              <p className="text-gray-600 text-xs mt-3">
                {T(
                  "* Les fonds de soutien sont conservés sous séquestre sécurisé. Le déclenchement des dividendes est synchronisé avec les jalons de validation.",
                  "* Support pledge proceeds are securely held in trust. Benefits triggering aligns with validated milestone dates."
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} className="w-full border border-[#1e2a3a] text-gray-300 hover:text-white hover:border-[#00d4ff]/50 font-bold font-mono py-4 rounded-xl transition-colors text-sm tracking-widest">
                {T("QUITTER", "EXIT")}
              </button>
              <button onClick={onPay} className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] hover:opacity-90 text-black font-bold font-mono py-4 rounded-xl transition-opacity text-sm tracking-widest">
                ✦ {T(`SOUTENIR AVEC ${units} UNITÉS`, `BACK WITH ${units} UNITS`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LYA UNIT DÉFINITION ──────────────────────────────────────────────────────

export function WhatIsLyaUnit({ lang }: { lang: "FR" | "EN" }) {
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;
  const cols = [
    { num: "01", color: "#00d4ff", titleFR: "MESURE ÉVOLUTIVE", titleEN: "EVOLUTIONARY MEASURE", textFR: "C'est l'unité de cotation officielle qui mesure la valeur évolutive d'une création.", textEN: "It is the official quotation unit that measures the evolving value of a creation." },
    { num: "02", color: "#ff6b6b", titleFR: "NI CRYPTO, NI DEVISE", titleEN: "NOT A CRYPTO", textFR: "Ce n'est PAS une monnaie classique ou une crypto.", textEN: "It is NOT a classic currency or a crypto." },
    { num: "03", color: "#00ff88", titleFR: "VALEUR STRUCTURELLE", titleEN: "STRUCTURED STATE", textFR: "C'est une unité de valeur structurée qui représente l'état réel, la solidité et la trajectoire d'une création.", textEN: "It is a structured unit of value representing the real state, solidity and trajectory of a creation." },
  ];
  return (
    <div className="bg-[#0a1117] border border-[#1e2a3a] rounded-2xl p-8 md:p-10 mb-8">
      <div className="mb-8">
        <p className="text-gray-500 text-[10px] font-mono tracking-widest mb-3">{T("DÉFINITION OFFICIELLE", "OFFICIAL DEFINITION")}</p>
        <h3 className="text-white font-black leading-tight" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.5rem,3.2vw,2.4rem)" }}>
          {T("QU'EST-CE QUE LE LYA", "WHAT IS THE LYA")}<br />
          {T("UNIT ?", "UNIT?")}
        </h3>
        <div className="w-16 h-1 rounded-full mt-3" style={{ background: "linear-gradient(90deg,#00d4ff,#a78bfa)" }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {cols.map(col => (
          <div key={col.num}>
            <p className="text-[10px] font-mono tracking-widest mb-2 font-bold" style={{ color: col.color }}>{col.num}. {T(col.titleFR, col.titleEN)}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{T(col.textFR, col.textEN)}</p>
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
  const revenueShare = contract.revenueSharePercentage || 10;
  const coShare = ((units * revenueShare) / 10000).toFixed(3);
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
    <div className="bg-[#0d1117] border-2 border-[#1e2a3a] rounded-2xl overflow-hidden flex flex-col hover:border-[#00d4ff]/40 transition-colors h-full shadow-xl shadow-black/40">
      {/* Image — ratio fixe 16/9, pas d'étirement */}
      <div
        className="relative cursor-pointer overflow-hidden flex-shrink-0 w-full"
        style={{ aspectRatio: "16/9" }}
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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-[#0d1117]/80 text-[#00d4ff] text-[10px] px-2 py-0.5 rounded font-mono font-bold backdrop-blur-sm">
            {contract.category.toUpperCase()}
          </span>
          <span className="bg-amber-500/90 text-black text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            ★ LYA SCORE: {contract.totalScore}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${RARITY_STYLE[contract.rarity] || "bg-gray-500/80 text-white"}`}>
            {contract.rarity.toUpperCase()}
          </span>
        </div>

        {/* Bouton like */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
        >♥</button>

        {/* Infos bas de l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-gray-400 text-[10px] font-mono mb-0.5">{T("PROJET CRÉATIF", "CREATIVE VENTURE")}</p>
          <div className="flex justify-between items-end gap-2">
            <h3 className="text-white font-black text-base leading-tight min-w-0 break-words" style={{ fontFamily: "Georgia,serif" }}>{contract.name}</h3>
            <div className="text-right shrink-0 ml-2">
              <p className="text-white text-xs font-mono">${unitPrice.toFixed(2)} / Unit</p>
              <p className="text-[#00ff88] text-[10px] font-mono">{revenueShare}% {T("Droit de Partage", "Revenue Rights")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-3 border-b border-[#1e2a3a]">
        <p className="text-[#00d4ff] text-[10px] font-mono tracking-widest mb-1">
          {T("INITIATIVE DE CO-PRODUCTION", "CO-PRODUCTION INITIATIVE")} · {contract.category.toUpperCase()}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{contract.description}</p>
      </div>

      {/* Score LYA + Financement */}
      <div className="px-4 py-3 border-b border-[#1e2a3a] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-[10px] font-mono">★ {T("ÉVALUATION QUALITÉ LYA", "LYA QUALITY SCORE")}</span>
          <span className="text-amber-400 font-mono font-bold text-sm">{contract.totalScore} <span className="text-gray-600 font-normal text-xs">/ 1000</span></span>
        </div>
        <div className="w-full bg-[#1e2a3a] rounded-full h-0.5">
          <div className="bg-amber-400 h-0.5 rounded-full" style={{ width: `${(contract.totalScore / 1000) * 100}%` }} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 text-[10px] font-mono">{T("FINANCEMENT DU BUDGET", "BUDGET FUNDING")}</span>
            <span className="text-[#00ff88] text-[10px] font-mono font-bold">{fundingPct}%</span>
          </div>
          <div className="w-full bg-[#1e2a3a] rounded-full h-1.5 mb-1">
            <div className="bg-[#00ff88] h-1.5 rounded-full" style={{ width: `${fundingPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-600">
            <span>${fundingRaised.toLocaleString()}</span>
            <span>{T("Cible", "Goal")}: ${contract.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Slider + métriques */}
      <div className="px-4 py-3 space-y-2.5 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-white text-[10px] font-mono font-bold tracking-wider">
            {T("VOLUME D'ACQUISITION DES PARTS LYA", "LYA UNITS ACQUISITION VOLUME")}
          </span>
          <span className="bg-[#00d4ff]/15 border border-[#00d4ff]/40 text-[#00d4ff] text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shrink-0">
            {units} {T("Unités", "Units")}
          </span>
        </div>
        <input
          type="range" min={1} max={100} value={units}
          onChange={e => setUnits(Number(e.target.value))}
          className="w-full h-1 bg-[#1e2a3a] rounded-full appearance-none cursor-pointer accent-[#00d4ff]"
        />
        <div className="flex justify-between text-[10px] text-gray-600 font-mono">
          <span>1 {T("UNITÉ", "UNIT")}</span><span>50 {T("UNITÉS", "UNITS")}</span><span>100 {T("UNITÉS", "UNITS")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#1a2233] border border-[#1e2a3a] rounded-lg p-3">
            <p className="text-gray-500 text-[9px] font-mono tracking-widest mb-1.5">{T("VOTRE ENGAGEMENT", "YOUR PLEDGE")}</p>
            <p className="text-white font-bold font-mono text-base">${totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-[#1a2233] border border-[#1e2a3a] rounded-lg p-3">
            <p className="text-gray-500 text-[9px] font-mono tracking-widest mb-1.5">{T("CO-PARTAGE DES GAINS", "REVENUE CO-SHARE")} <span className="opacity-50">ⓘ</span></p>
            <p className="text-[#00ff88] font-bold font-mono text-base">{coShare}%</p>
          </div>
        </div>

        {/* Statut co-propriétaire */}
        <div className={`border rounded-lg p-3 ${statut.border} ${statut.bg}`}>
          <p className={`text-[10px] font-mono font-bold mb-1.5 tracking-wider ${statut.color}`}>
            {T(statut.labelFR, statut.labelEN)}
          </p>
          <p className="text-gray-300 text-[10px] leading-relaxed">
            {T(statut.descFR, statut.descEN)} {T(statut.bonusFR, statut.bonusEN)}
          </p>
        </div>

        {/* Statut Investisseur recommandé — visible uniquement au palier 100 */}
        {statut.isPrestige && (
          <div className="border border-[#1e2a3a] bg-[#0d1117] rounded-lg p-3 space-y-2.5">
            <p className="text-amber-400 text-[10px] font-mono font-bold tracking-wider">
              👑 {T("STATUT INVESTISSEUR RECOMMANDÉ :", "RECOMMENDED INVESTOR STATUS:")}
            </p>
            <p className="text-gray-300 text-[10px] leading-relaxed">
              {T(
                "À partir de 100 unités LYA, configurez un compte Investisseur pour accéder au marché de l'Art et aux dividendes de licence.",
                "From 100 LYA units, set up an Investor account to access the Art market and license dividends."
              )}
            </p>
            <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-black text-[10px] font-mono font-black tracking-wider transition-colors flex items-center justify-center gap-1.5">
              🚀 {T("ACTIVER LE PROTOCOLE INVESTISSEUR", "ACTIVATE INVESTOR PROTOCOL")}
            </button>
          </div>
        )}

        {/* Boutons action — distincts : Voir le Projet -> détail / Soutenir -> paiement direct */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-1">
          <button
            onClick={() => onViewProject(contract, units)}
            className="border border-[#1e2a3a] text-white py-3 rounded-full font-mono text-[10px] font-bold hover:border-[#00d4ff] hover:text-[#00d4ff] transition-colors tracking-wider"
          >
            {T("VOIR LE PROJET", "VIEW PROJECT")}
          </button>
          <button
            onClick={() => onSupport(contract, units)}
            className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a1117] py-3 rounded-full font-mono text-[10px] font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 tracking-wider"
          >
            ✦ {T("SOUTENIR CE PROJET", "SUPPORT THIS PROJECT")}
          </button>
        </div>
      </div>
    </div>
  );
}
