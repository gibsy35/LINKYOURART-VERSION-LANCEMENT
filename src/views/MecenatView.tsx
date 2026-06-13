import { useState, useMemo } from "react";
import { CONTRACTS } from "../types";
import { useTranslation } from "../context/LanguageContext";
import {
  MECENAT_THEMES,
  WhatIsLyaUnit,
  ProjectCard,
  DetailModal,
  PaymentModal,
} from "../components/mecenat/MecenatShared";
import type { Contract } from "../types";

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export function MecenatView() {
  const { language } = useTranslation();
  const lang: "FR" | "EN" = language === "FR" ? "FR" : "EN";
  const T = (fr: string, en: string) => lang === "FR" ? fr : en;

  const [activeTheme, setActiveTheme] = useState("all");
  const [detail, setDetail] = useState<{ contract: Contract; units: number } | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Utilise tous les contrats LIVE de types.ts
  const filteredContracts = useMemo(() => {
    const theme = MECENAT_THEMES.find(t => t.id === activeTheme);
    const base = CONTRACTS.filter(c => c.status === "LIVE");
    if (!theme || theme.cats.length === 0) return base;
    return base.filter(c => theme.cats.includes(c.category));
  }, [activeTheme]);

  return (
    <section className="bg-surface-dim min-h-screen">
      {/* ── Header ── */}
      <div className="px-6 py-10 max-w-7xl mx-auto">

        {/* Hero encadré */}
        <div className="relative bg-surface-low/60 border border-white/10 rounded-2xl p-6 md:p-10 overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-start items-center">
              <span className="text-primary-cyan text-xs font-mono tracking-widest border border-primary-cyan/30 px-3 py-1 rounded-full">
                ✦ {T("ESPACE MÉCÉNAT LYA", "LYA PATRONAGE SPACE")}
              </span>
            </div>

            {/* Hero — 2 lignes, typo classique et premium */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div>
                <h1 className="font-black text-on-surface mb-5" style={{
                  fontFamily: "'Arial Black','Arial Bold',Arial,system-ui,sans-serif",
                  fontSize: "clamp(2.6rem,6vw,4.8rem)",
                  lineHeight: "0.97",
                  letterSpacing: "-0.04em",
                  fontWeight: 900,
                  fontStretch: "condensed",
                }}>
                  {T("CO-POSSÉDEZ LES", "CO-OWN TOMORROW'S MASTERPIECES,")}<br />
                  {T("CHEFS-D'ŒUVRE DE DEMAIN", "")}<br />
                  <span style={{ color: "#00d4ff" }}>
                    {T("EN UN CLIC", "IN A SINGLE CLICK")}
                  </span>
                </h1>
                <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed opacity-80">
                  {T(
                    "Bienvenue dans notre espace de découverte simplifié. Ici, pas de graphiques financiers ou de carnets d'ordres rebutants. Juste de l'art sublime, du talent brut, et un moyen simple et interactif de soutenir vos créateurs favoris et de partager leurs futurs succès.",
                    "Welcome to our simplified discovery space. No financial charts or intimidating order books. Just sublime art, raw talent, and a simple interactive way to support your favourite creators and share in their future success."
                  )}
                </p>
              </div>
              <div className="bg-surface-high/60 border border-white/10 rounded-2xl p-6 min-w-[200px] text-center shrink-0">
                <p className="text-on-surface-variant/60 text-[10px] font-mono mb-2 tracking-widest">{T("VALEUR FIXE FONDATRICE", "FIXED FOUNDING VALUE")}</p>
                <p className="text-on-surface text-2xl font-bold font-mono">1 Unit = <span className="text-primary-cyan">$50.00</span></p>
                <div className="mt-3 bg-[#00ff88] text-surface-dim text-[10px] font-mono font-bold px-4 py-2 rounded-lg">
                  {T("ACCESSIBLE À TOUS", "ACCESSIBLE TO ALL")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LYA Unit définition */}
        <WhatIsLyaUnit lang={lang} />

        {/* Filtres thématiques */}
        <div className="mb-8">
          <p className="text-primary-cyan text-[10px] font-mono tracking-widest mb-4">
            ● {T("SÉLECTIONNEZ UN THÈME ARTISTIQUE", "CHOOSE AN ART MOOD")}
          </p>
          <div className="flex flex-wrap gap-3">
            {MECENAT_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono transition-all ${activeTheme === theme.id ? "bg-primary-cyan text-surface-dim font-bold" : "border border-white/10 text-on-surface-variant hover:border-primary-cyan/50 hover:text-on-surface"}`}
              >
                <span>{theme.icon}</span>
                {T(theme.labelFR, theme.labelEN)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille projets ── */}
      <div className="px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-on-surface-variant/60 text-[10px] font-mono tracking-widest">
            {T("PROJETS CRÉATIFS", "CREATIVE PROJECTS")} — <span className="text-primary-cyan">{filteredContracts.length} {T("ŒUVRES", "WORKS")}</span>
          </span>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">
            {T("Aucun projet dans cette catégorie.", "No projects in this category.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContracts.map(contract => (
              <ProjectCard
                key={contract.id}
                contract={contract}
                lang={lang}
                onViewProject={(c, u) => { setShowPayment(false); setDetail({ contract: c, units: u }); }}
                onSupport={(c, u) => { setShowPayment(true); setDetail({ contract: c, units: u }); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {detail && !showPayment && (
        <DetailModal
          contract={detail.contract}
          units={detail.units}
          onUnitsChange={(u) => setDetail(d => d ? { ...d, units: u } : d)}
          onClose={() => setDetail(null)}
          onPay={() => setShowPayment(true)}
          lang={lang}
        />
      )}
      {detail && showPayment && (
        <PaymentModal
          contract={detail.contract}
          units={detail.units}
          onClose={() => { setShowPayment(false); setDetail(null); }}
          lang={lang}
        />
      )}
    </section>
  );
}

export { MecenatView as MecenatGrandPublic };
export default MecenatView;




